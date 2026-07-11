/**
 * lib/clinical/quadEngine/quadAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared assessment intake for the quad engine + the ENTITY ROUTER.
 *
 * The router is the clinical heart of the hybrid architecture: it reads the
 * mechanism, the extensor-mechanism integrity signal, and the pain character to
 * decide which of the four modules should handle the case. Routing is
 * deliberately conservative — anything that looks like a complete tendon
 * rupture (extensor lag / cannot SLR) is routed to the surgical module and
 * flagged for in-person review, never self-managed.
 * ---------------------------------------------------------------------------
 */

import { QUAD_ENTITIES, QUAD_MUSCLES } from './types.mjs';
import { scoreDiagnosis } from '../core/dataDrivenDiagnosis.mjs';
import { QUAD_DIAGNOSIS_DATASET } from './data/quadDiagnosisDataset.mjs';

export const INPUT_FIELDS = [
  'pain_location', 'mechanism', 'sport_context', 'onset',
  'ability_to_continue', 'walking_response', 'knee_flexion_rom_percent',
  'knee_extension_response', 'straight_leg_raise', 'extensor_lag',
  'palpable_gap', 'pain_severity_label', 'bruising_or_swelling',
  'swelling_change', 'pain_with_jumping', 'pain_localised_to_tendon',
  'days_since_injury', 'weeks_since_surgery', 'surgical_repair_done',
  'equipment_available', 'training_goal', 'confidence_in_answers',
];

const UNKNOWN = 'unsure';

/**
 * Normalise raw answers into a complete, defaulted quad assessment input.
 * @param {object} raw
 * @returns {{ input: object, missingCoreFields: string[] }}
 */
export function makeQuadInput(raw = {}) {
  const input = {
    pain_location: raw.pain_location ?? null,            // anterior_thigh | lateral_thigh | medial_thigh | anterior_knee_tendon
    mechanism: raw.mechanism ?? null,                    // direct_impact | sprinting | kicking | jumping_overuse | eccentric_load_pop | gradual_overuse | unsure
    sport_context: raw.sport_context ?? 'unspecified',
    onset: raw.onset ?? null,                            // sudden | gradual
    muscle_hint: raw.muscle_hint ?? null,                // vastus_lateralis | vastus_medialis | vastus_intermedius | rectus_femoris | unsure

    ability_to_continue: raw.ability_to_continue ?? null, // yes | limited | no
    walking_response: raw.walking_response ?? null,       // none | mild | painful | unable
    knee_flexion_rom_percent: numOrNull(raw.knee_flexion_rom_percent), // 0-100 (% of uninjured side) — contusion grade gate
    knee_extension_response: raw.knee_extension_response ?? UNKNOWN,    // none | mild | painful | unable

    // Extensor-mechanism integrity — the rupture gate
    straight_leg_raise: raw.straight_leg_raise ?? UNKNOWN, // able | unable | unsure
    extensor_lag: raw.extensor_lag ?? UNKNOWN,             // none | present | unsure
    palpable_gap: raw.palpable_gap ?? UNKNOWN,             // none | present | unsure

    pain_severity_label: raw.pain_severity_label ?? null,  // mild | moderate | severe
    bruising_or_swelling: raw.bruising_or_swelling ?? 'none', // none | some | significant
    swelling_change: raw.swelling_change ?? 'same',           // less | same | more

    // Tendinopathy signals
    pain_with_jumping: raw.pain_with_jumping ?? UNKNOWN,      // yes | no | unsure
    pain_localised_to_tendon: raw.pain_localised_to_tendon ?? UNKNOWN, // yes | no | unsure
    decline_squat_pain_0_10: numOrNull(raw.decline_squat_pain_0_10),
    visa_p_score: numOrNull(raw.visa_p_score),

    // Time / surgical context
    days_since_injury: numOrNull(raw.days_since_injury) ?? 7,
    weeks_since_surgery: numOrNull(raw.weeks_since_surgery),
    surgical_repair_done: raw.surgical_repair_done ?? false,

    red_flag_answers: raw.red_flag_answers ?? {},
    previous_injury: raw.previous_injury ?? false,
    equipment_available: Array.isArray(raw.equipment_available) ? raw.equipment_available : ['bodyweight'],
    training_goal: raw.training_goal ?? 'general_return',
    confidence_in_answers: raw.confidence_in_answers ?? 'somewhat',
    // optional explicit override — lets a clinician force a module
    injury_entity_override: raw.injury_entity_override ?? null,
  };

  const CORE = ['pain_location', 'mechanism', 'ability_to_continue', 'pain_severity_label'];
  const missingCoreFields = CORE.filter((f) => input[f] == null);
  return { input, missingCoreFields };
}

function numOrNull(v) {
  return typeof v === 'number' && !Number.isNaN(v) ? v : null;
}

/**
 * ENTITY ROUTER. Decide which module handles this case.
 *
 * Delegates to the generic data-driven scorer (lib/clinical/core/
 * dataDrivenDiagnosis.mjs) against QUAD_DIAGNOSIS_DATASET — the same clinical
 * priority that used to be a hand-written if/else chain here is now declared
 * as data (safety gates for rupture/post-surgical, weighted rules for the
 * contusion/tendinopathy/vastus-strain differential), with a real numeric
 * confidence_score alongside the high/moderate/low label every caller already
 * expects.
 *
 * @param {object} input  normalised quad input
 * @returns {{ entity: string, reason: string, confidence: 'high'|'moderate'|'low', confidence_score: number, flags: string[], breakdown: object }}
 */
export function routeEntity(input) {
  return scoreDiagnosis(QUAD_DIAGNOSIS_DATASET, input);
}

/**
 * Localise which vastus muscle is most likely involved (strain/contusion).
 * Monoarticular vastii present with knee-extension deficit WITHOUT the
 * hip-flexion component that flags rectus femoris. Source: Lempainen 2022.
 */
export function localiseMuscle(input) {
  const loc = input.pain_location;
  const hint = input.muscle_hint;
  if (hint && Object.values(QUAD_MUSCLES).includes(hint)) return hint;
  if (loc === 'lateral_thigh') return QUAD_MUSCLES.VASTUS_LATERALIS;
  if (loc === 'medial_thigh') return QUAD_MUSCLES.VASTUS_MEDIALIS;
  if (loc === 'anterior_thigh' && input.mechanism === 'direct_impact') return QUAD_MUSCLES.VASTUS_INTERMEDIUS; // deep, common contusion site
  return QUAD_MUSCLES.MULTIPLE_OR_UNSURE;
}
