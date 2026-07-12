/**
 * lib/clinical/itBandEngine/itBandAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the IT band engine + the ENTITY ROUTER.
 * ---------------------------------------------------------------------------
 */

import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { IT_BAND_DIAGNOSIS_DATASET } from './data/itBandDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'mechanism', 'onset', 'pain_location', 'sport_context',
  'ability_to_continue', 'pain_severity_label',
  'worse_downhill_or_stairs', 'recent_training_change', 'consistent_onset_distance',
  'resisted_hip_abduction_pain', 'symptom_duration_weeks',
  'locking_or_catching', 'giving_way', 'significant_effusion',
  'days_since_injury', 'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted IT band assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeItBandInput(raw = {}) {
  const input = {
    mechanism: raw.mechanism ?? null,          // gradual_overuse | sudden | unsure
    onset: raw.onset ?? 'gradual',
    pain_location: raw.pain_location ?? null,  // lateral_knee | unsure
    sport_context: raw.sport_context ?? 'unspecified',

    ability_to_continue: raw.ability_to_continue ?? null,
    pain_severity_label: raw.pain_severity_label ?? null,

    worse_downhill_or_stairs: raw.worse_downhill_or_stairs ?? 'no',
    recent_training_change: raw.recent_training_change ?? 'no',
    consistent_onset_distance: raw.consistent_onset_distance ?? 'unsure',
    resisted_hip_abduction_pain: raw.resisted_hip_abduction_pain ?? UNKNOWN,
    symptom_duration_weeks: numOrNull(raw.symptom_duration_weeks) ?? 1,

    // Lateral-knee structural-injury gate.
    locking_or_catching: raw.locking_or_catching ?? 'no',
    giving_way: raw.giving_way ?? 'no',
    significant_effusion: raw.significant_effusion ?? 'no',

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
 * @param {object} input  normalised IT band input
 */
export function routeEntity(input) {
  return scoreDiagnosis(IT_BAND_DIAGNOSIS_DATASET, input);
}
