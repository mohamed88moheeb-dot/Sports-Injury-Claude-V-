/**
 * lib/clinical/groinEngine/groinAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the adductor/groin engine + the ENTITY ROUTER.
 * ---------------------------------------------------------------------------
 */

import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { GROIN_DIAGNOSIS_DATASET } from './data/groinDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'mechanism', 'onset', 'sport_context',
  'ability_to_continue', 'pain_severity_label', 'bruising_or_swelling',
  'resisted_adduction_pain', 'symptom_duration_weeks',
  'bulge_present', 'worse_with_straining',
  'fadir_test', 'clicking_or_catching',
  'days_since_injury', 'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted groin assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeGroinInput(raw = {}) {
  const input = {
    mechanism: raw.mechanism ?? null,          // kicking | change_of_direction | sprinting | gradual_overuse | unsure
    onset: raw.onset ?? 'sudden',
    sport_context: raw.sport_context ?? 'unspecified',

    ability_to_continue: raw.ability_to_continue ?? null,
    pain_severity_label: raw.pain_severity_label ?? null,
    bruising_or_swelling: raw.bruising_or_swelling ?? 'none',

    resisted_adduction_pain: raw.resisted_adduction_pain ?? UNKNOWN, // none | mild | moderate | severe
    symptom_duration_weeks: numOrNull(raw.symptom_duration_weeks) ?? 1,

    // Hernia gate.
    bulge_present: raw.bulge_present ?? 'no',
    worse_with_straining: raw.worse_with_straining ?? 'no',

    // Hip-joint gate.
    fadir_test: raw.fadir_test ?? UNKNOWN,        // positive | negative | unsure
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
 * @param {object} input  normalised groin input
 */
export function routeEntity(input) {
  return scoreDiagnosis(GROIN_DIAGNOSIS_DATASET, input);
}
