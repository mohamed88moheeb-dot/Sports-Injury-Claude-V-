/**
 * lib/clinical/gluteEngine/gluteAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the glutes engine + the ENTITY ROUTER.
 * ---------------------------------------------------------------------------
 */

import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { GLUTE_DIAGNOSIS_DATASET } from './data/gluteDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'mechanism', 'onset', 'pain_location', 'sport_context',
  'ability_to_continue', 'pain_severity_label', 'bruising_or_swelling',
  'worse_lying_on_side', 'worse_with_stairs_sitting', 'single_leg_stance_pain', 'resisted_abduction_pain',
  'symptom_duration_weeks',
  'radiating_pain_below_knee', 'numbness_tingling', 'nerve_provocation_test',
  'days_since_injury', 'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted glute assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeGluteInput(raw = {}) {
  const input = {
    mechanism: raw.mechanism ?? null,          // sudden_deceleration | sprinting | fall | gradual_overuse | unsure
    onset: raw.onset ?? 'sudden',
    pain_location: raw.pain_location ?? null,  // lateral_hip | deep_buttock | unsure
    sport_context: raw.sport_context ?? 'unspecified',

    ability_to_continue: raw.ability_to_continue ?? null,
    pain_severity_label: raw.pain_severity_label ?? null,
    bruising_or_swelling: raw.bruising_or_swelling ?? 'none',

    worse_lying_on_side: raw.worse_lying_on_side ?? 'no',
    worse_with_stairs_sitting: raw.worse_with_stairs_sitting ?? 'no',
    single_leg_stance_pain: raw.single_leg_stance_pain ?? UNKNOWN,
    resisted_abduction_pain: raw.resisted_abduction_pain ?? UNKNOWN, // none | mild | moderate | severe
    symptom_duration_weeks: numOrNull(raw.symptom_duration_weeks) ?? 1,

    // Deep gluteal syndrome gate.
    radiating_pain_below_knee: raw.radiating_pain_below_knee ?? 'no',
    numbness_tingling: raw.numbness_tingling ?? 'no',
    nerve_provocation_test: raw.nerve_provocation_test ?? UNKNOWN,

    days_since_injury: numOrNull(raw.days_since_injury) ?? 7,
    equipment_available: Array.isArray(raw.equipment_available) ? raw.equipment_available : ['bodyweight'],
    training_goal: raw.training_goal ?? 'general_return',
    confidence_in_answers: raw.confidence_in_answers ?? 'somewhat',
    injury_entity_override: raw.injury_entity_override ?? null,
  };

  const CORE = ['mechanism', 'ability_to_continue', 'pain_severity_label'];
  const missingCoreFields = CORE.filter((f) => input[f] == null);
  return { input, missingCoreFields };
}

function numOrNull(v) {
  return typeof v === 'number' && !Number.isNaN(v) ? v : null;
}

/**
 * ENTITY ROUTER. Delegates to the generic data-driven scorer.
 * @param {object} input  normalised glute input
 */
export function routeEntity(input) {
  return scoreDiagnosis(GLUTE_DIAGNOSIS_DATASET, input);
}
