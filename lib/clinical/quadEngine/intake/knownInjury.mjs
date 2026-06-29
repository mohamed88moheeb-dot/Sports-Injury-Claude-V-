/**
 * lib/clinical/quadEngine/intake/knownInjury.mjs
 * ---------------------------------------------------------------------------
 * INTAKE MODE 2 — KNOWN INJURY.
 *
 * The user already knows their diagnosis and selects it from a catalogue. We
 * skip triage entirely, pre-seed the routing fields so the engine lands on the
 * right module, and ask ONLY the personalisation questions that module's
 * program needs (severity gate + context). No diagnostic guessing.
 *
 * The catalogue is finer-grained than the four entities (e.g. it distinguishes
 * VL / VM / VI strain, quad vs patellar tendinopathy, quad vs patellar tendon
 * rupture) so selection also pre-fills muscle localisation.
 * ---------------------------------------------------------------------------
 */

import { QUAD_ENTITIES } from '../types.mjs';

/**
 * Catalogue of selectable known injuries. Each maps to an engine entity plus a
 * `seed` of pre-filled fields, and declares the personalisation `ask` fields.
 */
export const KNOWN_INJURY_CATALOGUE = [
  {
    id: 'vastus_lateralis_strain', label: 'Vastus lateralis (outer thigh) strain',
    entity: QUAD_ENTITIES.VASTUS_STRAIN,
    seed: { pain_location: 'lateral_thigh', muscle_hint: 'vastus_lateralis', mechanism: 'sprinting' },
    ask: ['pain_severity_label', 'ability_to_continue', 'knee_extension_response', 'walking_response', 'bruising_or_swelling', 'previous_injury', 'days_since_injury'],
  },
  {
    id: 'vastus_medialis_strain', label: 'Vastus medialis / VMO (inner thigh) strain',
    entity: QUAD_ENTITIES.VASTUS_STRAIN,
    seed: { pain_location: 'medial_thigh', muscle_hint: 'vastus_medialis', mechanism: 'sprinting' },
    ask: ['pain_severity_label', 'ability_to_continue', 'knee_extension_response', 'walking_response', 'bruising_or_swelling', 'previous_injury', 'days_since_injury'],
  },
  {
    id: 'vastus_intermedius_strain', label: 'Vastus intermedius (deep front thigh) strain',
    entity: QUAD_ENTITIES.VASTUS_STRAIN,
    seed: { pain_location: 'anterior_thigh', muscle_hint: 'vastus_intermedius', mechanism: 'sprinting' },
    ask: ['pain_severity_label', 'ability_to_continue', 'knee_extension_response', 'walking_response', 'bruising_or_swelling', 'previous_injury', 'days_since_injury'],
  },
  {
    id: 'quad_contusion', label: 'Quadriceps contusion ("dead leg")',
    entity: QUAD_ENTITIES.CONTUSION,
    seed: { pain_location: 'anterior_thigh', mechanism: 'direct_impact' },
    ask: ['knee_flexion_rom_percent', 'bruising_or_swelling', 'walking_response', 'ability_to_continue', 'days_since_injury'],
  },
  {
    id: 'patellar_tendinopathy', label: 'Patellar tendinopathy (jumper\'s knee)',
    entity: QUAD_ENTITIES.TENDINOPATHY,
    seed: { pain_location: 'anterior_knee_tendon', mechanism: 'jumping_overuse', onset: 'gradual', pain_localised_to_tendon: 'yes', pain_with_jumping: 'yes' },
    ask: ['decline_squat_pain_0_10', 'visa_p_score', 'pain_severity_label'],
  },
  {
    id: 'quad_tendinopathy', label: 'Quadriceps tendinopathy (above kneecap)',
    entity: QUAD_ENTITIES.TENDINOPATHY,
    seed: { pain_location: 'anterior_knee_tendon', mechanism: 'gradual_overuse', onset: 'gradual', pain_localised_to_tendon: 'yes' },
    ask: ['decline_squat_pain_0_10', 'visa_p_score', 'pain_severity_label'],
  },
  {
    id: 'patellar_tendon_rupture', label: 'Patellar tendon rupture',
    entity: QUAD_ENTITIES.TENDON_RUPTURE,
    seed: { pain_location: 'anterior_knee_tendon', mechanism: 'eccentric_load_pop' },
    ask: ['surgical_repair_done', 'weeks_since_surgery', 'knee_extension_response', 'pain_severity_label'],
  },
  {
    id: 'quad_tendon_rupture', label: 'Quadriceps tendon rupture',
    entity: QUAD_ENTITIES.TENDON_RUPTURE,
    seed: { pain_location: 'anterior_knee_tendon', mechanism: 'eccentric_load_pop' },
    ask: ['surgical_repair_done', 'weeks_since_surgery', 'knee_extension_response', 'pain_severity_label'],
  },
];

/** Look up a catalogue entry by id. */
export function getKnownInjury(id) {
  return KNOWN_INJURY_CATALOGUE.find((k) => k.id === id) || null;
}

/**
 * Begin the known-injury flow: return the seed + the personalisation fields to
 * ask. The caller renders questions for `ask` (definitions live in the shared
 * question bank), then calls the intake router's complete step.
 */
export function startKnownInjury(injuryId) {
  const entry = getKnownInjury(injuryId);
  if (!entry) return { error: `Unknown injury id: ${injuryId}`, catalogue: KNOWN_INJURY_CATALOGUE.map((k) => k.id) };
  return {
    injury_id: entry.id,
    label: entry.label,
    entity: entry.entity,
    seed: { ...entry.seed, injury_entity_override: entry.entity }, // force the module, skip routing guesswork
    ask_fields: entry.ask,
  };
}

/** Assemble the final runQuad input from the seed + personalisation answers. */
export function assembleKnownInjuryInput(injuryId, personalisationAnswers = {}) {
  const start = startKnownInjury(injuryId);
  if (start.error) return start;
  return { ...start.seed, ...personalisationAnswers };
}
