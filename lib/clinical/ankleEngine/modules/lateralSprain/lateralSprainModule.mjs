/**
 * lib/clinical/ankleEngine/modules/lateralSprain/lateralSprainModule.mjs
 * ---------------------------------------------------------------------------
 * Acute lateral ankle ligament sprain module: grading, stage placement, and
 * a staged functional-rehab plan. Functional (exercise-based) rehab is
 * first-line at every grade, including grade III (Kerkhoffs 2007 Cochrane;
 * Vuurberg 2018) — this module never routes to a surgical-only pathway.
 * ---------------------------------------------------------------------------
 */

import { SPRAIN_STAGES, SPRAIN_GRADES, SEVERITY_BANDS, ANKLE_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { lateralSprainPool } from './lateralSprainExercises.mjs';
import { citeAll } from '../../citations/ankleClinicalCitations.mjs';

/**
 * Grade a lateral ankle sprain from self-reportable signs. Self-report cannot
 * replace clinical exam (anterior drawer, talar tilt); this is a screening
 * estimate, flagged so.
 */
export function gradeLateralSprain(input) {
  const flags = [];
  const wb = input.weight_bearing_ability;
  const swelling = input.bruising_or_swelling;
  const instability = input.instability_signs;
  const painSevere = input.pain_severity_label === 'severe';

  let grade;
  if (wb === 'unable' || instability === 'marked_giving_way') { grade = SPRAIN_GRADES.III; flags.push('possible_high_grade_tear'); }
  else if (wb === 'painful' && (swelling === 'significant' || instability === 'mild_wobble')) { grade = SPRAIN_GRADES.II; }
  else if (painSevere && swelling === 'significant') { grade = SPRAIN_GRADES.II; }
  else { grade = SPRAIN_GRADES.I; }

  const band = grade === SPRAIN_GRADES.III ? SEVERITY_BANDS.HIGH_CONCERN
    : grade === SPRAIN_GRADES.II ? SEVERITY_BANDS.MODERATE
      : SEVERITY_BANDS.LOWER;

  // Recovery is not always complete by the point pain resolves — a meaningful
  // share of patients report residual symptoms/instability at 1 year (van Rijn
  // 2008), so prognosis is framed as typical functional recovery, not a
  // guarantee of full resolution.
  const PROGNOSIS = {
    [SPRAIN_GRADES.I]: '1-2 weeks',
    [SPRAIN_GRADES.II]: '3-6 weeks',
    [SPRAIN_GRADES.III]: '8-12+ weeks (functional rehab is first-line even at this grade)',
  };
  const WEEKS_ESTIMATE = { [SPRAIN_GRADES.I]: 1.5, [SPRAIN_GRADES.II]: 4.5, [SPRAIN_GRADES.III]: 10 };

  return {
    grade, band, flags,
    prognosis: PROGNOSIS[grade],
    totalWeeksEstimate: WEEKS_ESTIMATE[grade],
    note: 'Grade is estimated from self-reported weight-bearing, swelling and instability — clinical exam (anterior drawer / talar tilt) is the reference standard.',
    sources: citeAll(['ANKLE-CIT-002', 'ANKLE-CIT-004']),
  };
}

// SPRAIN_STAGES share of the total recovery timeline (sums to 1).
const SPRAIN_STAGE_SHARE = { protect: 0.15, restore_motion: 0.25, strength_balance: 0.35, return_to_sport: 0.25 };

/** Place into a stage from days-since-injury + functional signs. */
export function placeSprainStage(input, severity) {
  const days = input.days_since_injury ?? 7;
  if (severity.grade === SPRAIN_GRADES.III && days < 7) return 'protect';
  if (input.weight_bearing_ability === 'unable') return 'protect';
  if (input.weight_bearing_ability === 'painful' && days < 10) return 'protect';
  if (days < 5) return 'protect';
  if (days < 14) return 'restore_motion';
  if (days < 28) return 'strength_balance';
  return 'return_to_sport';
}

export function runLateralSprain(input) {
  const severity = gradeLateralSprain(input);
  const currentStage = placeSprainStage(input, severity);

  const policy = {
    max_items: 5,
    monitoring_triggers: [
      'increasing swelling or bruising',
      'new or worsening giving-way / instability',
      'pain that increases session to session instead of settling',
    ],
    stop_rule: 'Stop and ease back if pain climbs during or the next morning, or if the ankle feels more unstable than before.',
    card_cautions: severity.band === SEVERITY_BANDS.HIGH_CONCERN ? ['Higher-grade pattern — functional rehab is still first-line, but progress more gradually and keep a lower threshold for clinician review.'] : [],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(SPRAIN_STAGES, severity.totalWeeksEstimate, SPRAIN_STAGE_SHARE);
  const plan = buildStagedPlan(SPRAIN_STAGES, currentStage, lateralSprainPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: ANKLE_ENTITIES.LATERAL_SPRAIN,
    diagnosis: {
      summary: `Lateral ankle ligament sprain — grade ${severity.grade.slice(-1)}. Estimated recovery ${severity.prognosis}.`,
      severity,
      flags: severity.flags,
    },
    plan,
    stretch_policy: 'progressive — full-range motion work is appropriate once pain-free; avoid forcing an inversion (rolling-inward) stretch early.',
    checkin_policy: {
      withhold_if: (c) => c.swelling_change === 'more' || c.instability_worse === true,
      withhold_message: 'Swelling increased or the ankle feels more unstable — pause loading, rest, and consider a clinician check if this persists.',
    },
    ...BETA_META,
  };
}
