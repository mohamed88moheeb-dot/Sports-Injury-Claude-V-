/**
 * lib/clinical/hipFlexorEngine/hipFlexorAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the hip flexor engine + the ENTITY ROUTER.
 * ---------------------------------------------------------------------------
 */

import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { HIP_FLEXOR_DIAGNOSIS_DATASET } from './data/hipFlexorDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'mechanism', 'onset', 'sport_context',
  'ability_to_continue', 'pain_severity_label', 'bruising_or_swelling',
  'resisted_hip_flexion_pain', 'snapping_sensation', 'symptom_duration_weeks',
  'hop_test', 'night_pain', 'gradual_onset_runner',
  'fadir_test', 'clicking_or_catching',
  'days_since_injury', 'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted hip flexor assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeHipFlexorInput(raw = {}) {
  const input = {
    mechanism: raw.mechanism ?? null,          // sudden_hip_flexion | gradual_overuse | unsure
    onset: raw.onset ?? 'sudden',
    sport_context: raw.sport_context ?? 'unspecified',

    ability_to_continue: raw.ability_to_continue ?? null,
    pain_severity_label: raw.pain_severity_label ?? null,
    bruising_or_swelling: raw.bruising_or_swelling ?? 'none',

    resisted_hip_flexion_pain: raw.resisted_hip_flexion_pain ?? UNKNOWN, // none | mild | moderate | severe
    snapping_sensation: raw.snapping_sensation ?? 'no',
    symptom_duration_weeks: numOrNull(raw.symptom_duration_weeks) ?? 1,

    // Femoral neck stress fracture gate.
    hop_test: raw.hop_test ?? UNKNOWN,                 // positive | negative | unsure
    night_pain: raw.night_pain ?? 'no',
    gradual_onset_runner: raw.gradual_onset_runner ?? 'no',

    // Hip-joint gate.
    fadir_test: raw.fadir_test ?? UNKNOWN,
    clicking_or_catching: raw.clicking_or_catching ?? 'no',

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
 * @param {object} input  normalised hip flexor input
 */
export function routeEntity(input) {
  return scoreDiagnosis(HIP_FLEXOR_DIAGNOSIS_DATASET, input);
}
