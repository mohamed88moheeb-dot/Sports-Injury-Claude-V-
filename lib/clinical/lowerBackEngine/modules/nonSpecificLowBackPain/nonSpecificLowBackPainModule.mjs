/**
 * lib/clinical/lowerBackEngine/modules/nonSpecificLowBackPain/nonSpecificLowBackPainModule.mjs
 * ---------------------------------------------------------------------------
 * Non-specific (mechanical) low back pain module. Placement is
 * irritability-driven, consistent with guideline-based active management
 * (stay active, avoid prolonged rest) rather than a fixed healing clock.
 * ---------------------------------------------------------------------------
 */

import { NON_SPECIFIC_LOW_BACK_PAIN_STAGES, SEVERITY_BANDS, LOWER_BACK_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { nonSpecificLowBackPainPool } from './nonSpecificLowBackPainExercises.mjs';
import { citeAll } from '../../citations/lowerBackClinicalCitations.mjs';

/** Assess irritability from pain severity and ability to continue activity. */
export function assessNonSpecificLowBackPain(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const cannotContinue = input.ability_to_continue === 'no';

  let irritability;
  if (painSevere && cannotContinue) { irritability = 'high'; }
  else if (painSevere || cannotContinue) { irritability = 'moderate'; }
  else { irritability = 'low'; }

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  // Most non-specific low back pain episodes settle within a few weeks with
  // active management; higher irritability needs a longer settling phase.
  const PROGNOSIS = {
    high: '8-12 weeks (criteria-based)',
    moderate: '6-10 weeks (criteria-based)',
    low: '4-8 weeks, with ongoing maintenance loading to prevent recurrence',
  };
  const WEEKS_ESTIMATE = { high: 10, moderate: 8, low: 6 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track pain with daily activity and whether it settles overnight. Some discomfort during loading is fine if it settles by the next day.',
    sources: citeAll(['LB-CIT-001', 'LB-CIT-003']),
  };
}

// NON_SPECIFIC_LOW_BACK_PAIN_STAGES share of the total recovery timeline (sums to 1).
const NON_SPECIFIC_LOW_BACK_PAIN_STAGE_SHARE = { calm_and_move: 0.20, restore_movement_and_control: 0.30, build_strength_and_capacity: 0.30, return_to_sport: 0.20 };

export function placeNonSpecificLowBackPainStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'calm_and_move';
    case 'moderate': return 'restore_movement_and_control';
    case 'low':
    default:
      return 'build_strength_and_capacity';
  }
}

export function runNonSpecificLowBackPain(input) {
  const assessment = assessNonSpecificLowBackPain(input);
  const currentStage = placeNonSpecificLowBackPainStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'pain climbing rather than settling across sessions',
      'pain that does not settle by the next day',
      'any new leg symptoms (numbness, tingling, or pain below the knee)',
    ],
    stop_rule: 'Reduce load and revert to gentler movement if pain worsens across days, or seek review if new leg symptoms appear.',
    card_cautions: ['Keep a maintenance strength and movement habit — low back pain has a real recurrence risk without ongoing work.'],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(NON_SPECIFIC_LOW_BACK_PAIN_STAGES, assessment.totalWeeksEstimate, NON_SPECIFIC_LOW_BACK_PAIN_STAGE_SHARE);
  const plan = buildStagedPlan(NON_SPECIFIC_LOW_BACK_PAIN_STAGES, currentStage, nonSpecificLowBackPainPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: LOWER_BACK_ENTITIES.NON_SPECIFIC_LOW_BACK_PAIN,
    diagnosis: {
      summary: `Non-specific (mechanical) low back pain — ${assessment.irritability} irritability. Conservative programme entry: ${currentStage}.`,
      assessment,
      approach: 'stay active and calm irritability -> restore movement and motor control -> build strength and capacity -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'progressive — gentle range-of-motion and mobility work is encouraged from the start; avoid prolonged rest or immobility.',
    checkin_policy: {
      withhold_if: (c) => (typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7) || c.new_leg_symptoms === true,
      withhold_message: 'Pain was high during loading (>=7/10) or new leg symptoms appeared. Drop back to gentle movement today and seek review if this persists or new leg symptoms developed.',
    },
    ...BETA_META,
  };
}
