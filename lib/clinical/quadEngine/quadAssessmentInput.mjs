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
 * Priority order (most clinically urgent first):
 *   1. Complete extensor-mechanism failure -> tendon rupture (surgical).
 *   2. Post-surgical context -> tendon rupture (post-op pathway).
 *   3. Direct-impact mechanism -> contusion.
 *   4. Tendon-localised overuse pain (jumping) -> tendinopathy.
 *   5. Otherwise -> vastus strain (the muscle-strain default).
 *
 * @param {object} input  normalised quad input
 * @returns {{ entity: string, reason: string, confidence: 'high'|'moderate'|'low', flags: string[] }}
 */
export function routeEntity(input) {
  const flags = [];

  if (input.injury_entity_override && Object.values(QUAD_ENTITIES).includes(input.injury_entity_override)) {
    return { entity: input.injury_entity_override, reason: 'clinician override', confidence: 'high', flags: ['entity_overridden'] };
  }

  // 1. Extensor-mechanism failure — strongest signal, routed to surgical module.
  const cannotExtend = input.knee_extension_response === 'unable';
  const cannotSLR = input.straight_leg_raise === 'unable';
  const lag = input.extensor_lag === 'present';
  const gap = input.palpable_gap === 'present';
  const ruptureSignals = [cannotExtend, cannotSLR, lag, gap].filter(Boolean).length;
  if (cannotSLR || lag || ruptureSignals >= 2) {
    flags.push('extensor_mechanism_compromise', 'urgent_in_person_review');
    return {
      entity: QUAD_ENTITIES.TENDON_RUPTURE,
      reason: 'Loss of active knee extension / straight-leg-raise or palpable gap suggests possible extensor-mechanism (tendon) rupture. Time-critical — surgical pathway, in-person assessment required.',
      confidence: ruptureSignals >= 2 ? 'high' : 'moderate',
      flags,
    };
  }

  // 2. Already operated — post-op rupture pathway regardless of current signs.
  if (input.surgical_repair_done === true || input.weeks_since_surgery != null) {
    flags.push('post_surgical');
    return {
      entity: QUAD_ENTITIES.TENDON_RUPTURE,
      reason: 'Post-surgical tendon repair context — post-operative, clinician-led pathway.',
      confidence: 'high',
      flags,
    };
  }

  // 3. Direct impact — contusion.
  if (input.mechanism === 'direct_impact') {
    flags.push('direct_impact_mechanism');
    if (input.bruising_or_swelling === 'significant') flags.push('significant_swelling');
    return {
      entity: QUAD_ENTITIES.CONTUSION,
      reason: 'Direct blow to the thigh ("dead leg") — contusion pathway with knee-flexion ROM grading and myositis-ossificans monitoring.',
      confidence: 'high',
      flags,
    };
  }

  // 4. Overuse tendon pain (jumper's knee).
  const overuse = input.mechanism === 'gradual_overuse' || input.mechanism === 'jumping_overuse' || input.onset === 'gradual';
  const tendonPain = input.pain_localised_to_tendon === 'yes' || input.pain_location === 'anterior_knee_tendon';
  const jumpPain = input.pain_with_jumping === 'yes';
  if (overuse && (tendonPain || jumpPain)) {
    flags.push('overuse_tendon_pattern');
    return {
      entity: QUAD_ENTITIES.TENDINOPATHY,
      reason: 'Gradual-onset, tendon-localised pain aggravated by jumping/loading — patellar/quadriceps tendinopathy pathway (isometric → HSR → energy-storage loading).',
      confidence: tendonPain && jumpPain ? 'high' : 'moderate',
      flags,
    };
  }

  // 5. Tendon-located injury with no rupture signs and no clear overuse pattern
  //    still belongs on the tendon pathway, not the muscle-strain pathway.
  if (input.pain_location === 'anterior_knee_tendon') {
    flags.push('tendon_located_pattern');
    return {
      entity: QUAD_ENTITIES.TENDINOPATHY,
      reason: 'Pain localised to the extensor tendon without rupture signs — managed on the tendon loading pathway (isometric → HSR → energy-storage).',
      confidence: 'moderate',
      flags,
    };
  }

  // 6. Default — vastus muscle strain.
  flags.push('muscle_strain_pattern');
  return {
    entity: QUAD_ENTITIES.VASTUS_STRAIN,
    reason: 'Acute strain pattern without direct impact, tendon rupture signs, or overuse-tendon features — vastus muscle-strain pathway.',
    confidence: input.mechanism ? 'moderate' : 'low',
    flags,
  };
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
