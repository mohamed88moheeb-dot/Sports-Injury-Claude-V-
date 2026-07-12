/**
 * lib/clinical/gluteEngine/modules/glutealTendinopathy/glutealTendinopathyModule.mjs
 * ---------------------------------------------------------------------------
 * Gluteal tendinopathy / greater trochanteric pain syndrome (GTPS) module.
 * Placement is irritability-driven, not a fixed days-since-injury clock,
 * since this is an overuse/capacity condition (Grimaldi 2015; Mellor 2018 —
 * the LEAP trial) rather than an acute strain.
 * ---------------------------------------------------------------------------
 */

import { GLUTEAL_TENDINOPATHY_STAGES, SEVERITY_BANDS, GLUTE_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { glutealTendinopathyPool } from './glutealTendinopathyExercises.mjs';
import { citeAll } from '../../citations/gluteClinicalCitations.mjs';

/** Assess irritability from pain severity, resisted abduction, and night/lying pain. */
export function assessGlutealTendinopathy(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const resistedSevere = input.resisted_abduction_pain === 'severe';
  const nightPain = input.worse_lying_on_side === 'yes';

  let irritability;
  if (painSevere && resistedSevere) { irritability = 'high'; }
  else if (painSevere || resistedSevere || input.resisted_abduction_pain === 'moderate' || (nightPain && input.worse_with_stairs_sitting === 'yes')) { irritability = 'moderate'; }
  else { irritability = 'low'; }

  if (nightPain) flags.push('night_pain_lying_on_side');

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  // Progressive resistance exercise (the LEAP trial protocol) resolves most
  // GTPS within 8-12 weeks; higher irritability needs a longer settling phase.
  const PROGNOSIS = {
    high: '12-16 weeks (criteria-based)',
    moderate: '10-14 weeks (criteria-based)',
    low: '8-12 weeks, with ongoing maintenance loading to prevent recurrence',
  };
  const WEEKS_ESTIMATE = { high: 14, moderate: 11, low: 9 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track pain on resisted hip abduction and night pain lying on the affected side. Some discomfort during loading is fine if it settles by the next day.',
    sources: citeAll(['GLUTE-CIT-001', 'GLUTE-CIT-002']),
  };
}

// GLUTEAL_TENDINOPATHY_STAGES share of the total recovery timeline (sums to 1).
const GLUTEAL_TENDINOPATHY_STAGE_SHARE = { load_management: 0.20, progressive_strengthening: 0.35, functional_loading: 0.25, return_to_sport: 0.20 };

export function placeGlutealTendinopathyStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'load_management';
    case 'moderate': return 'progressive_strengthening';
    case 'low':
    default:
      return 'functional_loading';
  }
}

export function runGlutealTendinopathy(input) {
  const assessment = assessGlutealTendinopathy(input);
  const currentStage = placeGlutealTendinopathyStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'resisted-abduction pain or night pain climbing rather than settling across sessions',
      'pain that does not settle by the next day',
      'a new sharp/acute-feeling pain distinct from the usual lateral-hip ache',
    ],
    stop_rule: 'Reduce load and avoid compressive positions if pain worsens across days or a new sharp pain appears.',
    card_cautions: ['Avoid crossing the legs, standing "hip hitched," or unsupported side-lying — these compress the tendon and slow recovery.'],
    stretch_caution: true,
  };

  const stageWeeks = splitStageWeeks(GLUTEAL_TENDINOPATHY_STAGES, assessment.totalWeeksEstimate, GLUTEAL_TENDINOPATHY_STAGE_SHARE);
  const plan = buildStagedPlan(GLUTEAL_TENDINOPATHY_STAGES, currentStage, glutealTendinopathyPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: GLUTE_ENTITIES.GLUTEAL_TENDINOPATHY,
    diagnosis: {
      summary: `Gluteal tendinopathy / greater trochanteric pain syndrome — ${assessment.irritability} irritability. Conservative programme entry: ${currentStage}.`,
      assessment,
      approach: 'non-compressive isometric settling -> progressive abductor strengthening -> functional loading -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'cautious — avoid compressive stretches (e.g. deep hip adduction/IT-band stretches) that load the tendon against the greater trochanter; gentle non-compressive mobility is fine.',
    checkin_policy: {
      withhold_if: (c) => typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7,
      withhold_message: 'Lateral hip pain was high during loading (>=7/10). Drop back to non-compressive isometrics today and reduce load.',
    },
    ...BETA_META,
  };
}
