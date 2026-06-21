/**
 * lib/clinical/rfBetaAppAdapter/rfAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * RF-specific assessment model. Each question is anchored to a governed
 * RF-ASSESS object (assess_ref) — nothing here is invented clinical content;
 * the prompts mirror the objects' user_facing_question_or_prompt, and answers
 * are qualitative only (no thresholds, dosing, dates, or clearance).
 *
 * Pure + browser-safe (imports nothing). Option `value`s are chosen to map
 * DIRECTLY onto the RF engine's qualitative input enums, so wiring is honest
 * (no inference from a generic form).
 * ---------------------------------------------------------------------------
 */

// The 8 governed red-flag prompts (RF-ASSESS-002 / RF-SAF-*).
export const RF_RED_FLAGS = [
  'I cannot bear weight or walk four steps.',
  'I have severe swelling, deformity, or a large bruise that appeared quickly.',
  'I heard/felt a major pop and now the area feels unstable.',
  'My knee locks, catches, gives way, or cannot fully straighten.',
  'I have numbness, tingling, weakness, or pain that travels down the leg.',
  'I have calf swelling, warmth, redness, or shortness of breath.',
  'I have a visible groin/abdominal bulge, testicular pain, or pain when coughing/sneezing.',
  'Pain is constant at rest, worsening at night, or I feel feverish/unwell.'
];

// Slider bands (0–100) → qualitative enum the engine understands.
export const PAIN_BANDS = [
  { max: 33, value: 'mild', label: 'Mild' },
  { max: 66, value: 'moderate', label: 'Moderate' },
  { max: 100, value: 'severe', label: 'Severe' }
];
export const CONFIDENCE_BANDS = [
  { max: 33, value: 'low', label: 'Low' },
  { max: 66, value: 'moderate', label: 'Moderate' },
  { max: 100, value: 'high', label: 'High' }
];
// Walking / stairs pain magnitude (0 = no pain → 100 = can't).
export const WALK_BANDS = [
  { max: 20, value: 'none', label: 'No pain' },
  { max: 50, value: 'mild', label: 'Mild' },
  { max: 80, value: 'painful', label: 'Painful' },
  { max: 100, value: 'unable', label: 'Can’t do it' }
];
// Range/comfort magnitude for hip-flexion / knee-flexion.
export const RANGE_BANDS = [
  { max: 33, value: 'none', label: 'Comfortable' },
  { max: 66, value: 'mild', label: 'Tight / sore' },
  { max: 100, value: 'painful', label: 'Painful' }
];

/** Map a 0–100 slider value to its band entry (or null when unset). */
export function bandValue(value, bands) {
  if (value === undefined || value === null || value === '') return null;
  const v = Number(value);
  for (const b of bands) if (v <= b.max) return b.value;
  return bands[bands.length - 1].value;
}

/**
 * Question definitions. `key` = field stored in assessment.rfAnswers.
 * `core: true` items drive completeness. `highCaution: true` mirrors the
 * object's high_caution_flag (recorded, never auto-unlocks anything).
 */
export const RF_ASSESSMENT_QUESTIONS = [
  // Pain LOCATION comes from the anatomy/body-map selection (deriveLocationFromAnatomy),
  // not a redundant dropdown — see rfAnswers wiring in mapRfAnswersToRfInput.
  { id: 'mech', assess_ref: 'RF-ASSESS-001', group: 'Pain & how it started', key: 'mechanism', core: true,
    prompt: 'How did it start?',
    options: [
      { value: 'sprinting', label: 'Sprinting' },
      { value: 'kicking', label: 'Kicking / shooting' },
      { value: 'acceleration', label: 'Accelerating' },
      { value: 'deceleration', label: 'Decelerating / braking' },
      { value: 'gradual_overuse', label: 'Gradually / overuse' },
      { value: 'direct_impact', label: 'Direct hit / impact' },
      { value: 'unsure', label: 'Unsure' }
    ] },
  { id: 'sev', assess_ref: 'RF-ASSESS-001', group: 'Pain & how it started', key: 'pain_severity_label', valueKey: 'pain_severity_value', core: false,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Overall, how bad is the pain?',
    bands: PAIN_BANDS },
  { id: 'bruise', assess_ref: 'RF-ASSESS-001', group: 'Pain & how it started', key: 'bruising_or_swelling', core: false,
    prompt: 'Any bruising or swelling?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'Significant' }] },

  { id: 'redflags', assess_ref: 'RF-ASSESS-002', group: 'Safety check', key: 'red_flags', core: true, type: 'multi',
    prompt: 'Do you have any of these warning signs? (select all that apply)',
    options: RF_RED_FLAGS.map((t) => ({ value: t, label: t })) },

  { id: 'walk', assess_ref: 'RF-ASSESS-003', group: 'Movement & strength checks', key: 'walking_response', valueKey: 'walking_value', core: true,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Walking — how much pain? (slide)', bands: WALK_BANDS },
  { id: 'stairs', assess_ref: 'RF-ASSESS-004', group: 'Movement & strength checks', key: 'stairs_response', valueKey: 'stairs_value', core: false,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Stairs (up & down) — how much pain? (slide)', bands: WALK_BANDS },
  { id: 'hipflex', assess_ref: 'RF-ASSESS-005', group: 'Movement & strength checks', key: 'hip_flexion_response', valueKey: 'hipflex_value', core: true,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Bringing knee toward chest — comfortable or painful? (slide)', bands: RANGE_BANDS },
  { id: 'kneeflex', assess_ref: 'RF-ASSESS-006', group: 'Movement & strength checks', key: 'knee_flexion_response', valueKey: 'kneeflex_value', core: false,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Bending knee / kneeling — comfortable or painful? (slide)', bands: RANGE_BANDS },
  { id: 'reship', assess_ref: 'RF-ASSESS-007', group: 'Movement & strength checks', key: 'resisted_hip_flexion', core: false,
    prompt: 'Resisting your knee lifting up — does it reproduce symptoms?',
    options: [{ value: 'no', label: 'No' }, { value: 'mild', label: 'Mild' }, { value: 'painful', label: 'Painful' }, { value: 'weak', label: 'Feels weak' }, { value: 'unsure', label: 'Not tried' }] },
  { id: 'resknee', assess_ref: 'RF-ASSESS-008', group: 'Movement & strength checks', key: 'knee_extension_response', core: true,
    prompt: 'Straightening your knee against resistance — does it reproduce symptoms?',
    options: [{ value: 'no', label: 'No' }, { value: 'mild', label: 'Mild' }, { value: 'painful', label: 'Painful' }, { value: 'weak', label: 'Feels weak' }, { value: 'unsure', label: 'Not tried' }] },
  { id: 'palp', assess_ref: 'RF-ASSESS-009', group: 'Movement & strength checks', key: 'palpation', core: false,
    prompt: 'Press the front of your thigh — is there a tender spot?',
    options: [{ value: 'none', label: 'No' }, { value: 'mild', label: 'Mildly tender' }, { value: 'marked', label: 'Very tender' }, { value: 'lump', label: 'A lump / firm area' }, { value: 'unsure', label: 'Not tried' }] },
  { id: 'iso', assess_ref: 'RF-ASSESS-010', group: 'Movement & strength checks', key: 'isometric_hold', core: false,
    prompt: 'Can you hold a steady push without symptoms increasing?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'partial', label: 'Partly' }, { value: 'no', label: 'No' }, { value: 'not_tried', label: 'Not tried' }] },
  { id: 'ecc', assess_ref: 'RF-ASSESS-011', group: 'Movement & strength checks', key: 'eccentric_control', core: false,
    prompt: 'Can you lower under control without symptoms increasing?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'partial', label: 'Partly' }, { value: 'no', label: 'No' }, { value: 'not_tried', label: 'Not tried' }] },
  { id: 'sl', assess_ref: 'RF-ASSESS-012', group: 'Movement & strength checks', key: 'single_leg_control', core: false,
    prompt: 'Can you balance and control a single-leg movement?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'wobbly', label: 'Wobbly' }, { value: 'no', label: 'No' }, { value: 'not_tried', label: 'Not tried' }] },

  { id: 'jog', assess_ref: 'RF-ASSESS-013', group: 'Running & sport tolerance', key: 'jog_tolerance', core: false,
    prompt: 'Can you jog lightly? What happens during/after?',
    options: [{ value: 'not_tried', label: 'Not tried' }, { value: 'ok', label: 'OK' }, { value: 'symptoms_during', label: 'Symptoms during' }, { value: 'symptoms_after', label: 'Symptoms after / next day' }] },
  { id: 'run', assess_ref: 'RF-ASSESS-014', group: 'Running & sport tolerance', key: 'run_tolerance', core: false,
    prompt: 'Can you run? What happens during/after?',
    options: [{ value: 'not_tried', label: 'Not tried' }, { value: 'ok', label: 'OK' }, { value: 'symptoms_during', label: 'Symptoms during' }, { value: 'symptoms_after', label: 'Symptoms after / next day' }] },
  { id: 'sprint', assess_ref: 'RF-ASSESS-015', group: 'Running & sport tolerance', key: 'sprint_tolerance', core: false, highCaution: true,
    prompt: 'Have you tried higher-speed running? What happened?',
    options: [{ value: 'not_tried', label: 'Not tried' }, { value: 'ok', label: 'OK' }, { value: 'symptoms_during', label: 'Symptoms during' }, { value: 'symptoms_after', label: 'Symptoms after / next day' }] },
  { id: 'kick', assess_ref: 'RF-ASSESS-016', group: 'Running & sport tolerance', key: 'kick_tolerance', core: false, highCaution: true,
    prompt: 'Have you tried kicking? What happened during/after?',
    options: [{ value: 'not_tried', label: 'Not tried' }, { value: 'ok', label: 'OK' }, { value: 'symptoms_during', label: 'Symptoms during' }, { value: 'symptoms_after', label: 'Symptoms after / next day' }] },

  { id: 'nextday', assess_ref: 'RF-ASSESS-017', group: 'Response & history', key: 'next_day_response', core: true,
    prompt: 'How did you feel the day after activity?',
    options: [{ value: 'same_or_better', label: 'Same or better' }, { value: 'sore_settled', label: 'Sore but settled' }, { value: 'worse', label: 'Worse' }, { value: 'much_worse', label: 'Much worse' }] },
  { id: 'conf', assess_ref: 'RF-ASSESS-018', group: 'Response & history', key: 'movement_confidence', valueKey: 'movement_confidence_value', core: false, highCaution: true,
    type: 'slider', min: 0, max: 100, default: 50, invertColor: true,
    prompt: 'How confident do you feel loading / running / kicking right now?',
    bands: CONFIDENCE_BANDS },
  { id: 'prev', assess_ref: 'RF-ASSESS-001', group: 'Response & history', key: 'previous_injury', core: false,
    prompt: 'Have you injured this area before?',
    options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }, { value: 'unsure', label: 'Unsure' }] },
  { id: 'scar', assess_ref: 'RF-ASSESS-009', group: 'Response & history', key: 'scar_history', core: false,
    prompt: 'Were you ever told you had scar tissue / fibrosis / a lump here?',
    options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }, { value: 'unsure', label: 'Unsure' }] }
];

// Core items that drive completeness (genuinely diagnostic / severity-relevant).
export const CORE_RF_KEYS = ['pain_location', 'mechanism', 'walking_response', 'hip_flexion_response', 'knee_extension_response', 'next_day_response'];

const ANSWERED = (v) => v !== undefined && v !== null && v !== '' && v !== 'unsure' && v !== 'not_tried';

/**
 * Pain location is taken from the anatomy / body-map selection (assessment.exactArea
 * + primaryRegion), so the user's anatomy pick actually feeds diagnosis + confidence.
 * Returns the engine pain_location enum, or null if not derivable.
 */
export function deriveLocationFromAnatomy(base = {}) {
  const exact = String(base.exactArea || '').toLowerCase();
  const region = String(base.primaryRegion || '').toLowerCase();
  if (/rectus|front_thigh_middle/.test(exact)) return 'anterior_thigh_rectus_femoris';
  if (/hip.?flex|upper/.test(exact)) return 'upper_thigh_hip_flexor';
  if (/front.*thigh|anterior.*thigh/.test(exact)) return 'front_thigh_general';
  if (/knee/.test(exact)) return 'knee_region';
  if (/groin|adductor/.test(exact)) return 'groin_adductor';
  if (region === 'quadriceps') return 'anterior_thigh_rectus_femoris';
  return null;
}

/**
 * Genuine completeness from real answers (not inference).
 * red_flags counts as answered once the safety screen is acknowledged.
 */
export function computeRfCompleteness(answers = {}, base = {}) {
  // pain_location is satisfied by the anatomy selection (not a dropdown)
  const effective = { ...answers };
  if (!ANSWERED(effective.pain_location)) {
    const loc = deriveLocationFromAnatomy(base);
    if (loc) effective.pain_location = loc;
  }
  const provided = [];
  const missing = [];
  for (const k of CORE_RF_KEYS) {
    if (ANSWERED(effective[k])) provided.push(k); else missing.push(k);
  }
  // Safety check does NOT count toward completeness (it is a separate screen).
  const score = provided.length / CORE_RF_KEYS.length;
  let status = 'incomplete';
  if (score >= 0.8) status = 'complete';
  else if (score >= 0.5) status = 'partial';
  return { status, score: Math.round(score * 100) / 100, provided, missing };
}

/**
 * Live form-fill progress for the assessment badge: counts every fillable RF
 * field that has an actual value (NOT defaults, NOT the Safety section, NOT
 * "unanswered" sliders). Pain location comes from the anatomy selection.
 */
export function computeRfFormFill(answers = {}, base = {}) {
  const qs = RF_ASSESSMENT_QUESTIONS.filter((q) => q.group !== 'Safety check');
  let total = 0, filled = 0;

  // 1) Pain location (from the body map)
  total += 1;
  if (deriveLocationFromAnatomy(base) || ANSWERED(answers.pain_location)) filled += 1;

  // 2) Each non-safety question (slider uses its valueKey; others use key)
  for (const q of qs) {
    total += 1;
    const k = q.valueKey || q.key;
    const v = answers[k];
    if (v !== undefined && v !== null && v !== '') filled += 1;
  }

  // 3) Sport + equipment (also part of the RF intake)
  total += 1; if (base.sport) filled += 1;
  total += 1; if (Array.isArray(base.equipment) && base.equipment.length > 0) filled += 1;

  const percent = total ? Math.round((filled / total) * 100) : 0;
  return { total, filled, percent, allFilled: filled >= total };
}

function mapEquipment(list) {
  const out = ['bodyweight'];
  for (const e of list || []) {
    const v = String(e).toLowerCase();
    if (/band/.test(v)) out.push('band');
    if (/dumbbell|barbell|gym|machine|weight|cable/.test(v)) out.push('gym');
    if (/bike/.test(v)) out.push('bike');
    if (/bench|box|step/.test(v)) out.push('bench');
  }
  return [...new Set(out)];
}

/** Direct RF answers → RF engine input. No generic-form inference. */
export function mapRfAnswersToRfInput(answers = {}, base = {}) {
  const responses = [answers.walking_response, answers.stairs_response, answers.hip_flexion_response, answers.knee_extension_response];
  const anyUnable = responses.includes('unable') || answers.knee_extension_response === 'weak';
  const anyPainful = responses.includes('painful');

  // pain severity: enum stored by slider (preferred) → slider value band → derived
  let pain_severity = answers.pain_severity_label || bandValue(answers.pain_severity_value, PAIN_BANDS);
  if (!pain_severity) pain_severity = anyUnable ? 'severe' : anyPainful ? 'moderate' : 'mild';

  const redFlagObj = {};
  for (const f of answers.red_flags || []) redFlagObj[String(f).toLowerCase().replace(/\s+/g, '_')] = true;

  const ability = (answers.red_flags && answers.red_flags.length) || answers.walking_response === 'unable'
    ? 'no' : answers.walking_response === 'painful' ? 'limited' : 'yes';

  const weak = answers.resisted_hip_flexion === 'weak' || answers.knee_extension_response === 'weak';

  const completeness = computeRfCompleteness(answers, base);
  const confidence_in_answers = completeness.status === 'complete' ? 'confident'
    : completeness.status === 'partial' ? 'somewhat' : 'unsure';

  // Location from the anatomy selection (falls back to any explicit answer, then general).
  const pain_location = deriveLocationFromAnatomy(base) || answers.pain_location || 'front_thigh_general';

  return {
    pain_location,
    mechanism: answers.mechanism || 'unsure',
    sport_context: base.sport || (Array.isArray(base.sports) && base.sports[0]) || 'unspecified',
    ability_to_continue: ability,
    walking_response: answers.walking_response || 'unsure',
    stairs_response: answers.stairs_response || 'unsure',
    hip_flexion_response: answers.hip_flexion_response || 'unsure',
    knee_flexion_response: answers.knee_flexion_response || 'unsure',
    knee_extension_response: answers.knee_extension_response === 'weak' ? 'unable' : (answers.knee_extension_response || 'unsure'),
    resisted_hip_flexion: answers.resisted_hip_flexion || 'unsure',
    next_day_response: answers.next_day_response || 'unsure',
    pain_severity_label: pain_severity,
    bruising_or_swelling: answers.bruising_or_swelling || 'none',
    weakness_or_giving_way: weak ? 'marked' : 'none',
    red_flag_answers: redFlagObj,
    previous_injury: answers.previous_injury === 'yes',
    reported_fibrosis_or_scar_history: (answers.scar_history === 'yes' || answers.palpation === 'lump') ? 'reported' : 'none',
    equipment_available: mapEquipment(base.equipment),
    training_goal: base.sport ? `return_to_${String(base.sport).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}` : 'general_return',
    confidence_in_answers,
    // CP1: pass real completeness + the raw self-test answers through for the engine + profile.rf
    assessment_completeness: completeness.status,
    missing_rf_items: completeness.missing,
    rf_self_tests: {
      jog_tolerance: answers.jog_tolerance || 'not_tried',
      run_tolerance: answers.run_tolerance || 'not_tried',
      sprint_tolerance: answers.sprint_tolerance || 'not_tried',
      kick_tolerance: answers.kick_tolerance || 'not_tried',
      isometric_hold: answers.isometric_hold || 'not_tried',
      eccentric_control: answers.eccentric_control || 'not_tried',
      single_leg_control: answers.single_leg_control || 'not_tried',
      movement_confidence: answers.movement_confidence || bandValue(answers.movement_confidence_value, CONFIDENCE_BANDS) || null,
      palpation: answers.palpation || null
    }
  };
}
