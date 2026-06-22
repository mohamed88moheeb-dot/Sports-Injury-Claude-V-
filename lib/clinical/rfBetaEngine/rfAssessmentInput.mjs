/**
 * lib/clinical/rfBetaEngine/rfAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Typed (JSDoc) RF assessment input model. Qualitative values only — no
 * numeric scoring lives in the user's answers. makeAssessmentInput normalizes
 * a raw object into a complete, defaulted RfAssessmentInput and reports which
 * core fields are missing (used by the confidence resolver's missing-data cap).
 * ---------------------------------------------------------------------------
 */

export const INPUT_FIELDS = [
  'pain_location', 'mechanism', 'sport_context', 'ability_to_continue',
  'walking_response', 'stairs_response', 'hip_flexion_response',
  'knee_extension_response', 'pain_severity_label', 'bruising_or_swelling',
  'weakness_or_giving_way', 'red_flag_answers', 'previous_injury',
  'reported_fibrosis_or_scar_history', 'equipment_available', 'training_goal',
  'confidence_in_answers'
];

/** Core fields whose absence materially lowers match confidence. */
export const CORE_FIELDS = [
  'pain_location', 'mechanism', 'ability_to_continue', 'walking_response',
  'hip_flexion_response', 'knee_extension_response', 'pain_severity_label'
];

export const ENUMS = Object.freeze({
  pain_location: ['anterior_thigh_rectus_femoris', 'front_thigh_general', 'upper_thigh_hip_flexor', 'multiple_or_unsure', 'knee_region', 'groin_adductor'],
  mechanism: ['sprinting', 'kicking', 'acceleration', 'deceleration', 'gradual_overuse', 'direct_impact', 'unsure'],
  ability_to_continue: ['yes', 'limited', 'no'],
  response: ['none', 'mild', 'painful', 'unable', 'unsure'],
  pain_severity_label: ['mild', 'moderate', 'severe'],
  bruising_or_swelling: ['none', 'some', 'significant'],
  weakness_or_giving_way: ['none', 'mild', 'marked'],
  confidence_in_answers: ['confident', 'somewhat', 'unsure']
});

const UNKNOWN = 'unsure';

/**
 * @param {Partial<import('./types.mjs').RfAssessmentInput>} raw
 * @returns {{ input: import('./types.mjs').RfAssessmentInput, missingCoreFields: string[] }}
 */
export function makeAssessmentInput(raw = {}) {
  const input = {
    pain_location: raw.pain_location ?? null,
    mechanism: raw.mechanism ?? null,
    sport_context: raw.sport_context ?? 'unspecified',
    ability_to_continue: raw.ability_to_continue ?? null,
    walking_response: raw.walking_response ?? null,
    stairs_response: raw.stairs_response ?? UNKNOWN,
    hip_flexion_response: raw.hip_flexion_response ?? null,
    knee_extension_response: raw.knee_extension_response ?? null,
    knee_flexion_response: raw.knee_flexion_response ?? null,
    resisted_hip_flexion: raw.resisted_hip_flexion ?? null,
    next_day_response: raw.next_day_response ?? null,
    pain_severity_label: raw.pain_severity_label ?? null,
    bruising_or_swelling: raw.bruising_or_swelling ?? 'none',
    weakness_or_giving_way: raw.weakness_or_giving_way ?? 'none',
    red_flag_answers: raw.red_flag_answers ?? {},
    previous_injury: raw.previous_injury ?? false,
    reported_fibrosis_or_scar_history: raw.reported_fibrosis_or_scar_history ?? 'none',
    equipment_available: Array.isArray(raw.equipment_available) ? raw.equipment_available : ['bodyweight'],
    training_goal: raw.training_goal ?? 'general_return',
    confidence_in_answers: raw.confidence_in_answers ?? 'somewhat',
    rf_self_tests: raw.rf_self_tests ?? null,
    days_since_injury: typeof raw.days_since_injury === 'number' ? raw.days_since_injury : 7,
  };

  const missingCoreFields = CORE_FIELDS.filter((f) => input[f] == null);
  return { input, missingCoreFields };
}

/** True if any red-flag answer is truthy. */
export function hasRedFlag(input) {
  const rf = input.red_flag_answers || {};
  return Object.values(rf).some((v) => v === true);
}
