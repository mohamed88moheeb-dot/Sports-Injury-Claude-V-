/**
 * lib/clinical/ankleEngine/modules/chronicInstability/chronicInstabilityModule.mjs
 * ---------------------------------------------------------------------------
 * CHRONIC ANKLE INSTABILITY (CAI) module. Unlike the two acute-sprain
 * modules, this is not days-since-injury driven — placement is based on
 * current functional severity (recurrence frequency, active giving-way).
 * The model always enters through neuromuscular re-education (Gribble 2016)
 * and ends in an explicitly ONGOING maintenance stage, since balance/
 * proprioceptive training must continue long-term to keep recurrence risk
 * down (Schiftan 2015) — CAI is managed, not "cured" on a fixed clock.
 * ---------------------------------------------------------------------------
 */

import { CAI_STAGES, SEVERITY_BANDS, ANKLE_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { caiPool } from './chronicInstabilityExercises.mjs';
import { citeAll } from '../../citations/ankleClinicalCitations.mjs';

/** Grade CAI severity from sprain recurrence + active instability signals. */
export function assessChronicInstability(input) {
  const flags = [];
  const count = Number(input.prior_sprain_count) || 0;
  const activeGivingWay = input.giving_way_without_new_injury === 'yes';

  let severity;
  if (count >= 5 || (activeGivingWay && input.instability_signs === 'marked_giving_way')) { severity = 'severe'; flags.push('frequent_recurrence_or_marked_instability'); }
  else if (count >= 3 || activeGivingWay) { severity = 'moderate'; }
  else { severity = 'mild'; }

  const band = severity === 'severe' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  // CAI recovery is criteria-based capacity-rebuilding, not a fixed healing
  // clock — framed as a structured rebuild period followed by indefinite
  // maintenance (Schiftan 2015; Gribble 2016).
  const PROGNOSIS = {
    severe: '10-14 weeks structured rebuild, then ongoing balance maintenance work indefinitely',
    moderate: '8-10 weeks structured rebuild, then ongoing maintenance work',
    mild: '5-7 weeks structured rebuild, then ongoing maintenance work',
  };
  const WEEKS_ESTIMATE = { severe: 12, moderate: 9, mild: 6 };

  return {
    severity, band, flags, prior_sprain_count: count,
    prognosis: PROGNOSIS[severity],
    totalWeeksEstimate: WEEKS_ESTIMATE[severity],
    note: 'Chronic ankle instability is managed through structured neuromuscular/strength rebuilding, not resolved on a fixed clock — ongoing balance work is part of the plan, not an optional extra.',
    sources: citeAll(['ANKLE-CIT-003', 'ANKLE-CIT-007']),
  };
}

// CAI_STAGES share of the total structured-rebuild timeline (sums to 1).
const CAI_STAGE_SHARE = { neuromuscular_control: 0.25, strength_capacity: 0.30, dynamic_reactive: 0.25, return_to_sport: 0.20 };

/** Place into a stage from current functional severity (not days-since-injury). */
export function placeCaiStage(input, assessment) {
  if (assessment.severity === 'severe' || input.giving_way_without_new_injury === 'yes') return 'neuromuscular_control';
  if (assessment.severity === 'moderate') return 'strength_capacity';
  return 'dynamic_reactive';
}

export function runChronicInstability(input) {
  const assessment = assessChronicInstability(input);
  const currentStage = placeCaiStage(input, assessment);

  const policy = {
    max_items: 5,
    monitoring_triggers: [
      'a new giving-way episode during training',
      'increasing apprehension or reduced confidence on the affected side',
      'pain that increases session to session instead of settling',
    ],
    stop_rule: 'If a new giving-way episode or fresh sprain happens, stop and treat it as a new acute injury rather than continuing this plan.',
    card_cautions: ['This plan does not end at "return to sport" — the maintenance stage is part of the programme, not optional.'],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(CAI_STAGES, assessment.totalWeeksEstimate, CAI_STAGE_SHARE);
  const plan = buildStagedPlan(CAI_STAGES, currentStage, caiPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: ANKLE_ENTITIES.CHRONIC_INSTABILITY,
    diagnosis: {
      summary: `Chronic ankle instability — ${assessment.severity} pattern (${assessment.prior_sprain_count} prior sprain${assessment.prior_sprain_count === 1 ? '' : 's'} reported). Estimated rebuild ${assessment.prognosis}.`,
      assessment,
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'progressive — full-range motion work is appropriate; the focus here is neuromuscular control, not stretch caution.',
    checkin_policy: {
      withhold_if: (c) => c.new_giving_way_episode === true,
      withhold_message: 'A new giving-way episode was reported — treat this as a possible new acute sprain: rest, protect, and consider a fresh assessment rather than continuing today\'s session.',
    },
    ...BETA_META,
  };
}
