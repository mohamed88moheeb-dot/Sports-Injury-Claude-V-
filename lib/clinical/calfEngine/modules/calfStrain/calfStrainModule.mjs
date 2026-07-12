/**
 * lib/clinical/calfEngine/modules/calfStrain/calfStrainModule.mjs
 * ---------------------------------------------------------------------------
 * Gastrocnemius/soleus (calf) muscle strain module: grading, stage placement,
 * and a staged functional-rehab plan.
 * ---------------------------------------------------------------------------
 */

import { CALF_STRAIN_STAGES, STRAIN_GRADES, SEVERITY_BANDS, CALF_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { calfStrainPool } from './calfStrainExercises.mjs';
import { citeAll } from '../../citations/calfClinicalCitations.mjs';

/** Grade a calf strain from self-reportable signs. */
export function gradeCalfStrain(input) {
  const flags = [];
  const wb = input.weight_bearing_ability;
  const swelling = input.bruising_or_swelling;
  const painSevere = input.pain_severity_label === 'severe';

  let grade;
  if (wb === 'unable') { grade = STRAIN_GRADES.III; flags.push('possible_high_grade_tear'); }
  else if (wb === 'painful' && (swelling === 'significant' || painSevere)) { grade = STRAIN_GRADES.II; }
  else if (painSevere && swelling === 'significant') { grade = STRAIN_GRADES.II; }
  else { grade = STRAIN_GRADES.I; }

  const band = grade === STRAIN_GRADES.III ? SEVERITY_BANDS.HIGH_CONCERN
    : grade === STRAIN_GRADES.II ? SEVERITY_BANDS.MODERATE
      : SEVERITY_BANDS.LOWER;

  const PROGNOSIS = {
    [STRAIN_GRADES.I]: '1-2 weeks',
    [STRAIN_GRADES.II]: '3-6 weeks',
    [STRAIN_GRADES.III]: '8-12+ weeks',
  };
  const WEEKS_ESTIMATE = { [STRAIN_GRADES.I]: 1.5, [STRAIN_GRADES.II]: 4.5, [STRAIN_GRADES.III]: 10 };

  return {
    grade, band, flags,
    prognosis: PROGNOSIS[grade],
    totalWeeksEstimate: WEEKS_ESTIMATE[grade],
    note: 'Grade is estimated from self-reported weight-bearing, pain and swelling — clinical exam and imaging (US/MRI) are the reference standard for higher-grade tears.',
    sources: citeAll(['CALF-CIT-001', 'CALF-CIT-006']),
  };
}

// CALF_STRAIN_STAGES share of the total recovery timeline (sums to 1).
const CALF_STAGE_SHARE = { protect: 0.15, restore_movement: 0.25, build_strength: 0.35, return_to_sport: 0.25 };

/** Place into a stage from days-since-injury + functional signs. */
export function placeCalfStage(input, severity) {
  const days = input.days_since_injury ?? 7;
  if (severity.grade === STRAIN_GRADES.III && days < 7) return 'protect';
  if (input.weight_bearing_ability === 'unable') return 'protect';
  if (input.weight_bearing_ability === 'painful' && days < 10) return 'protect';
  if (days < 5) return 'protect';
  if (days < 14) return 'restore_movement';
  if (days < 28) return 'build_strength';
  return 'return_to_sport';
}

export function runCalfStrain(input) {
  const severity = gradeCalfStrain(input);
  const currentStage = placeCalfStage(input, severity);

  const policy = {
    max_items: 5,
    monitoring_triggers: [
      'increasing swelling or bruising',
      'a new "pulling" or sharp sensation during loading',
      'pain that increases session to session instead of settling',
    ],
    stop_rule: 'Stop and ease back if pain climbs during or the next morning, or if you feel a new sharp/pulling sensation.',
    card_cautions: severity.band === SEVERITY_BANDS.HIGH_CONCERN ? ['Higher-grade pattern — progress more gradually and keep a lower threshold for clinician review.'] : [],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(CALF_STRAIN_STAGES, severity.totalWeeksEstimate, CALF_STAGE_SHARE);
  const plan = buildStagedPlan(CALF_STRAIN_STAGES, currentStage, calfStrainPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: CALF_ENTITIES.CALF_STRAIN,
    diagnosis: {
      summary: `Calf muscle strain (gastrocnemius/soleus) — grade ${severity.grade.slice(-1)}. Estimated recovery ${severity.prognosis}.`,
      severity,
      flags: severity.flags,
    },
    plan,
    stretch_policy: 'progressive — full-range stretch and eccentric loading are appropriate once pain-free at rest.',
    checkin_policy: {
      withhold_if: (c) => c.swelling_change === 'more' || c.new_sharp_pain === true,
      withhold_message: 'Swelling increased or a new sharp/pulling sensation occurred — pause loading, rest, and consider a clinician check if this persists.',
    },
    ...BETA_META,
  };
}
