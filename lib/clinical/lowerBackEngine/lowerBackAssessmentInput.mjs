/**
 * lib/clinical/lowerBackEngine/lowerBackAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the lower back engine + the ENTITY ROUTER.
 * ---------------------------------------------------------------------------
 */

import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { LOWER_BACK_DIAGNOSIS_DATASET } from './data/lowerBackDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'mechanism', 'onset', 'pain_location', 'sport_context', 'age_group',
  'ability_to_continue', 'pain_severity_label',
  'leg_pain_below_knee', 'numbness_tingling_leg', 'worse_with_flexion_sitting', 'worse_with_extension',
  'extension_rotation_sport', 'single_leg_hyperextension_test', 'symptom_duration_weeks',
  'saddle_numbness', 'bladder_or_bowel_dysfunction', 'bilateral_leg_symptoms', 'progressive_neuro_deficit',
  'recent_significant_trauma', 'unexplained_weight_loss_or_fever',
  'days_since_injury', 'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted lower back assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeLowerBackInput(raw = {}) {
  const input = {
    mechanism: raw.mechanism ?? null,          // sudden_lift_twist | repetitive_extension_rotation | gradual_overuse | unsure
    onset: raw.onset ?? 'gradual',
    pain_location: raw.pain_location ?? null,  // central_low_back | one_sided_low_back | leg_pain_below_knee | unsure
    sport_context: raw.sport_context ?? 'unspecified',
    age_group: raw.age_group ?? 'adult',        // youth_or_adolescent | adult

    ability_to_continue: raw.ability_to_continue ?? null,
    pain_severity_label: raw.pain_severity_label ?? null,

    leg_pain_below_knee: raw.leg_pain_below_knee ?? 'no',
    numbness_tingling_leg: raw.numbness_tingling_leg ?? 'no',
    worse_with_flexion_sitting: raw.worse_with_flexion_sitting ?? 'no',
    worse_with_extension: raw.worse_with_extension ?? 'no',
    extension_rotation_sport: raw.extension_rotation_sport ?? 'no',
    single_leg_hyperextension_test: raw.single_leg_hyperextension_test ?? UNKNOWN,
    symptom_duration_weeks: numOrNull(raw.symptom_duration_weeks) ?? 1,

    // Cauda equina / serious pathology gate.
    saddle_numbness: raw.saddle_numbness ?? 'no',
    bladder_or_bowel_dysfunction: raw.bladder_or_bowel_dysfunction ?? 'no',
    bilateral_leg_symptoms: raw.bilateral_leg_symptoms ?? 'no',
    progressive_neuro_deficit: raw.progressive_neuro_deficit ?? 'no',
    recent_significant_trauma: raw.recent_significant_trauma ?? 'no',
    unexplained_weight_loss_or_fever: raw.unexplained_weight_loss_or_fever ?? 'no',

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
 * @param {object} input  normalised lower back input
 */
export function routeEntity(input) {
  return scoreDiagnosis(LOWER_BACK_DIAGNOSIS_DATASET, input);
}
