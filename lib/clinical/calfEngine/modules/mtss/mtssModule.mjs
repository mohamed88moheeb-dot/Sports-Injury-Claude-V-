/**
 * lib/clinical/calfEngine/modules/mtss/mtssModule.mjs
 * ---------------------------------------------------------------------------
 * Medial tibial stress syndrome (MTSS / "shin splints") module. Placement is
 * irritability-driven (like tendinopathy), not a fixed days-since-injury
 * clock, since this is an overuse bone-load condition that responds to
 * graded load modification (Winters 2013).
 * ---------------------------------------------------------------------------
 */

import { MTSS_STAGES, SEVERITY_BANDS, CALF_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { mtssPool } from './mtssExercises.mjs';
import { citeAll } from '../../citations/calfClinicalCitations.mjs';

/** Assess MTSS irritability from pain severity and running tolerance. */
export function assessMtss(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const cannotContinue = input.ability_to_continue === 'no';

  let irritability;
  if (painSevere && cannotContinue) { irritability = 'high'; }
  else if (painSevere || input.pain_severity_label === 'moderate') { irritability = 'moderate'; }
  else { irritability = 'low'; }

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  const PROGNOSIS = {
    high: '8-12 weeks (criteria-based — bone/periosteal overload settles slowly with load modification)',
    moderate: '6-8 weeks',
    low: '4-6 weeks, with a gradual return to running volume',
  };
  const WEEKS_ESTIMATE = { high: 10, moderate: 7, low: 5 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track shin pain during and after running/walking load. Pain should stay mild and settle within a day, not accumulate session to session.',
    sources: citeAll(['CALF-CIT-004', 'CALF-CIT-005']),
  };
}

// MTSS_STAGES share of the total recovery timeline (sums to 1).
const MTSS_STAGE_SHARE = { settle_irritability: 0.20, restore_load_tolerance: 0.30, build_capacity: 0.30, return_to_sport: 0.20 };

export function placeMtssStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'settle_irritability';
    case 'moderate': return 'restore_load_tolerance';
    case 'low':
    default:
      return 'build_capacity';
  }
}

export function runMtss(input) {
  const assessment = assessMtss(input);
  const currentStage = placeMtssStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'shin pain that accumulates session to session instead of settling',
      'pain that becomes more focal/pinpoint rather than a diffuse ache',
      'a positive single-leg hop test appearing where it was previously negative',
    ],
    stop_rule: 'Stop and reassess (including for possible stress fracture) if pain becomes focal/pinpoint or a hop test becomes newly positive.',
    card_cautions: ['Keep weekly running-volume increases modest — MTSS is a load-management condition, not a fixed healing clock.'],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(MTSS_STAGES, assessment.totalWeeksEstimate, MTSS_STAGE_SHARE);
  const plan = buildStagedPlan(MTSS_STAGES, currentStage, mtssPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: CALF_ENTITIES.MTSS,
    diagnosis: {
      summary: `Medial tibial stress syndrome ("shin splints") — ${assessment.irritability} irritability. Estimated recovery ${assessment.prognosis}.`,
      assessment,
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'progressive — gentle calf/ankle mobility is appropriate throughout; the focus is load management, not stretch caution.',
    checkin_policy: {
      withhold_if: (c) => c.pain_became_focal === true || c.new_positive_hop_test === true,
      withhold_message: 'Pain became more focal/pinpoint or a hop test became positive — this can signal a stress fracture. Pause running load and consider a clinician review before continuing.',
    },
    ...BETA_META,
  };
}
