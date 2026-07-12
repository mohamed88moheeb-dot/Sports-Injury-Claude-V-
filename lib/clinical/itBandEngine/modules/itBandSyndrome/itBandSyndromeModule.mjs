/**
 * lib/clinical/itBandEngine/modules/itBandSyndrome/itBandSyndromeModule.mjs
 * ---------------------------------------------------------------------------
 * Iliotibial band syndrome (ITBS) module. Placement is irritability-driven,
 * not a fixed days-since-injury clock, since this is an overuse/running-load
 * condition (Fairclough 2006) rather than an acute strain.
 * ---------------------------------------------------------------------------
 */

import { IT_BAND_SYNDROME_STAGES, SEVERITY_BANDS, IT_BAND_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { itBandSyndromePool } from './itBandSyndromeExercises.mjs';
import { citeAll } from '../../citations/itBandClinicalCitations.mjs';

/** Assess irritability from pain severity, resisted hip abduction, and downhill/stairs aggravation. */
export function assessItBandSyndrome(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const resistedSevere = input.resisted_hip_abduction_pain === 'severe';
  const downhillAggravated = input.worse_downhill_or_stairs === 'yes';

  let irritability;
  if (painSevere && resistedSevere) { irritability = 'high'; }
  else if (painSevere || resistedSevere || input.resisted_hip_abduction_pain === 'moderate' || (downhillAggravated && input.ability_to_continue === 'no')) { irritability = 'moderate'; }
  else { irritability = 'low'; }

  if (downhillAggravated) flags.push('worse_downhill_or_stairs');

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  // Structured hip-abductor strengthening programmes typically resolve ITBS
  // within 6-8 weeks; higher irritability needs a longer settling phase.
  const PROGNOSIS = {
    high: '10-14 weeks (criteria-based)',
    moderate: '8-12 weeks (criteria-based)',
    low: '6-10 weeks, with ongoing maintenance loading to prevent recurrence',
  };
  const WEEKS_ESTIMATE = { high: 12, moderate: 10, low: 8 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track pain on resisted hip abduction and with downhill running/stairs. Some discomfort during loading is fine if it settles by the next day.',
    sources: citeAll(['ITB-CIT-001', 'ITB-CIT-002']),
  };
}

// IT_BAND_SYNDROME_STAGES share of the total recovery timeline (sums to 1).
const IT_BAND_STAGE_SHARE = { reduce_irritability: 0.20, restore_load_tolerance: 0.30, build_running_capacity: 0.30, return_to_sport: 0.20 };

export function placeItBandStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'reduce_irritability';
    case 'moderate': return 'restore_load_tolerance';
    case 'low':
    default:
      return 'build_running_capacity';
  }
}

export function runItBandSyndrome(input) {
  const assessment = assessItBandSyndrome(input);
  const currentStage = placeItBandStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'resisted-hip-abduction pain or downhill/stairs pain climbing rather than settling across sessions',
      'pain that does not settle by the next day',
      'a new sharp/acute-feeling pain distinct from the usual lateral-knee ache',
    ],
    stop_rule: 'Reduce mileage and avoid downhill/cambered terrain if pain worsens across days or a new sharp pain appears.',
    card_cautions: ['Keep a maintenance hip-strength habit — ITBS recurs without ongoing hip abductor work and gradual terrain progression.'],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(IT_BAND_SYNDROME_STAGES, assessment.totalWeeksEstimate, IT_BAND_STAGE_SHARE);
  const plan = buildStagedPlan(IT_BAND_SYNDROME_STAGES, currentStage, itBandSyndromePool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: IT_BAND_ENTITIES.IT_BAND_SYNDROME,
    diagnosis: {
      summary: `Iliotibial band syndrome — ${assessment.irritability} irritability. Conservative programme entry: ${currentStage}.`,
      assessment,
      approach: 'reduce compressive load -> restore hip/knee load tolerance -> build running capacity + gait pattern -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'not the primary focus — ITBS responds better to hip abductor strengthening and load management than to ITB stretching; gentle general mobility is fine.',
    checkin_policy: {
      withhold_if: (c) => typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7,
      withhold_message: 'Lateral knee pain was high during loading (>=7/10). Drop back to isometrics/flat-terrain-only today and reduce load.',
    },
    ...BETA_META,
  };
}
