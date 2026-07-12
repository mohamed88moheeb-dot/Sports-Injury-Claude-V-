/**
 * lib/clinical/calfEngine/calfAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the calf/shin engine + the ENTITY ROUTER.
 * Mirrors quadEngine/ankleEngine: normalise raw answers, then delegate
 * routing to the generic data-driven scorer against CALF_DIAGNOSIS_DATASET.
 * ---------------------------------------------------------------------------
 */

import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { CALF_DIAGNOSIS_DATASET } from './data/calfDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'mechanism', 'onset', 'pain_location', 'sport_context',
  'ability_to_continue', 'weight_bearing_ability', 'pain_severity_label', 'bruising_or_swelling',
  'thompson_test', 'palpable_gap', 'sudden_snap_sensation', 'unable_heel_raise',
  'morning_stiffness', 'pain_with_running',
  'shin_tenderness_length', 'hop_test',
  'days_since_injury', 'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted calf/shin assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeCalfInput(raw = {}) {
  const input = {
    mechanism: raw.mechanism ?? null,          // sudden_push_off | sprinting | gradual_overuse_running | unsure
    onset: raw.onset ?? 'sudden',
    pain_location: raw.pain_location ?? null,  // posterior_calf | achilles_mid_portion | achilles_insertion | medial_shin | unsure
    sport_context: raw.sport_context ?? 'unspecified',

    ability_to_continue: raw.ability_to_continue ?? null,
    weight_bearing_ability: raw.weight_bearing_ability ?? null, // full | painful | unable
    pain_severity_label: raw.pain_severity_label ?? null,
    bruising_or_swelling: raw.bruising_or_swelling ?? 'none',

    // Achilles rupture gate.
    thompson_test: raw.thompson_test ?? UNKNOWN,        // normal | absent_plantarflexion | unsure
    palpable_gap: raw.palpable_gap ?? 'no',
    sudden_snap_sensation: raw.sudden_snap_sensation ?? 'no',
    unable_heel_raise: raw.unable_heel_raise ?? UNKNOWN,

    // Achilles tendinopathy signals.
    morning_stiffness: raw.morning_stiffness ?? UNKNOWN,
    pain_with_running: raw.pain_with_running ?? UNKNOWN,

    // MTSS vs stress fracture differentiation.
    shin_tenderness_length: raw.shin_tenderness_length ?? UNKNOWN, // focal | diffuse | unsure
    hop_test: raw.hop_test ?? UNKNOWN,                              // positive | negative | unsure

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
 * @param {object} input  normalised calf/shin input
 */
export function routeEntity(input) {
  return scoreDiagnosis(CALF_DIAGNOSIS_DATASET, input);
}
