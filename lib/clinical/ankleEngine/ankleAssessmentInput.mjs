/**
 * lib/clinical/ankleEngine/ankleAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the ankle engine + the ENTITY ROUTER.
 * Mirrors quadEngine/quadAssessmentInput.mjs: normalise raw answers, then
 * delegate routing to the generic data-driven scorer against
 * ANKLE_DIAGNOSIS_DATASET.
 * ---------------------------------------------------------------------------
 */

import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { ANKLE_DIAGNOSIS_DATASET } from './data/ankleDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'mechanism', 'sport_context', 'onset',
  'ability_to_continue', 'weight_bearing_ability', 'pain_severity_label',
  'bruising_or_swelling', 'instability_signs',
  'bone_tenderness_malleolus', 'bone_tenderness_midfoot', 'unable_to_bear_weight_4_steps',
  'pain_above_mortise', 'squeeze_test', 'external_rotation_test', 'diastasis_suspected',
  'prior_sprain_count', 'months_since_last_sprain', 'giving_way_without_new_injury',
  'days_since_injury', 'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted ankle assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeAnkleInput(raw = {}) {
  const input = {
    mechanism: raw.mechanism ?? null,          // inversion | external_rotation | direct_impact | gradual_overuse | unsure
    sport_context: raw.sport_context ?? 'unspecified',
    onset: raw.onset ?? 'sudden',

    ability_to_continue: raw.ability_to_continue ?? null,   // yes | limited | no
    weight_bearing_ability: raw.weight_bearing_ability ?? null, // full | painful | unable
    pain_severity_label: raw.pain_severity_label ?? null,    // mild | moderate | severe
    bruising_or_swelling: raw.bruising_or_swelling ?? 'none', // none | some | significant
    instability_signs: raw.instability_signs ?? 'none',       // none | mild_wobble | marked_giving_way

    // Ottawa Ankle Rules gate.
    bone_tenderness_malleolus: raw.bone_tenderness_malleolus ?? 'no',
    bone_tenderness_midfoot: raw.bone_tenderness_midfoot ?? 'no',
    unable_to_bear_weight_4_steps: raw.unable_to_bear_weight_4_steps ?? 'no',

    // Syndesmosis signals.
    pain_above_mortise: raw.pain_above_mortise ?? UNKNOWN,
    squeeze_test: raw.squeeze_test ?? UNKNOWN,             // positive | negative | unsure
    external_rotation_test: raw.external_rotation_test ?? UNKNOWN,
    diastasis_suspected: raw.diastasis_suspected ?? 'no',

    // Chronic instability signals.
    prior_sprain_count: numOrNull(raw.prior_sprain_count) ?? 0,
    months_since_last_sprain: numOrNull(raw.months_since_last_sprain),
    giving_way_without_new_injury: raw.giving_way_without_new_injury ?? 'no',

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
 * @param {object} input  normalised ankle input
 * @returns {{ entity: string, reason: string, confidence: 'high'|'moderate'|'low', confidence_score: number, flags: string[], breakdown: object }}
 */
export function routeEntity(input) {
  return scoreDiagnosis(ANKLE_DIAGNOSIS_DATASET, input);
}
