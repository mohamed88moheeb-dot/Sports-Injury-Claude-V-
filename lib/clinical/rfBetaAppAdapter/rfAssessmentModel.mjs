/**
 * lib/clinical/rfBetaAppAdapter/rfAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * RF-specific assessment model + probabilistic diagnosis engine.
 *
 * Evidence base:
 *  Cross 2004 (AJSM):       Central tendon RF = 26.9 days vs peripheral 9.2 days
 *  McAleer 2022 (SJMSS):    BAMIC RF injuries, average TRFT 20.4±14.8 days
 *  McAuley 2021 (JSMS):     Removal from activity = +11 days TRFT (p<0.001)
 *  Giakoumis 2025 (SJMSS):  VAS walking (p=0.001) + resisted contraction (p=0.01) = TRFT predictors
 *  Rudisill 2021 (OJSM):    Pop sound, bruising, resisted test pain = delayed RTP
 *  Pietsch 2023 (SJMSS):    RF injuries 14 days longer RTP than vastii; kicking = longest
 *  Serner 2018 (SJMSS):     63% of RF injuries have tendinous involvement
 *  Balius 2009 (BJSM):      Central tendon SPA 39–45 days; +4.2 days/cm injury length
 *  Ishøi 2020 (BJSM):       Individual clinical tests = very low to low diagnostic accuracy
 *  Knapik 2023 (OJSM):      Proximal RF: kicking 47.6%, knee flex/hip ext 42.9%
 *  Lempainen 2021 (OJSM):   Chronic/recurrent central tendon rupture — surgical option
 *  Green 2020 (BJSM meta):  Previous injury RR = 2.7–4.8 for recurrent strain
 * ---------------------------------------------------------------------------
 */

// ── RED FLAGS ──────────────────────────────────────────────────────────────────
// Pop/snap and instability are now separate items (Rudisill 2021: pop alone = delayed RTP).
// Structural defect and proximal bony tenderness added (Knapik 2023: avulsion indicators).
export const RF_RED_FLAGS = [
  'I cannot bear weight or walk four steps.',
  'I have severe swelling, significant deformity, or a large bruise that appeared within 2 hours.',
  'I heard or felt a loud pop or snap at the moment of injury.',
  'The area feels unstable, gives way, or I have lost control of the leg.',
  'I can feel a clear gap or dip in the muscle when I press on the front of my thigh.',
  'I have sharp point tenderness right at the hip bone (near the groin crease), not in the muscle belly.',
  'My knee locks, catches, or cannot fully straighten.',
  'I have numbness, tingling, weakness, or pain that travels down my leg.',
  'I have calf swelling, warmth, redness, or shortness of breath.',
  'I have a visible groin/abdominal bulge, testicular pain, or pain when coughing/sneezing.',
  'Pain is constant at rest, worsening at night, or I feel feverish/unwell.',
];

// ── SLIDER BANDS ───────────────────────────────────────────────────────────────
export const PAIN_BANDS = [
  { max: 33,  value: 'mild',     label: 'Mild' },
  { max: 66,  value: 'moderate', label: 'Moderate' },
  { max: 100, value: 'severe',   label: 'Severe' },
];
export const CONFIDENCE_BANDS = [
  { max: 33,  value: 'low',      label: 'Low' },
  { max: 66,  value: 'moderate', label: 'Moderate' },
  { max: 100, value: 'high',     label: 'High' },
];
export const WALK_BANDS = [
  { max: 20,  value: 'none',    label: 'No pain' },
  { max: 50,  value: 'mild',    label: 'Mild' },
  { max: 80,  value: 'painful', label: 'Painful' },
  { max: 100, value: 'unable',  label: "Can't do it" },
];
export const RANGE_BANDS = [
  { max: 33,  value: 'none',    label: 'Comfortable' },
  { max: 66,  value: 'mild',    label: 'Tight / sore' },
  { max: 100, value: 'painful', label: 'Painful' },
];

export function bandValue(value, bands) {
  if (value === undefined || value === null || value === '') return null;
  const v = Number(value);
  for (const b of bands) if (v <= b.max) return b.value;
  return bands[bands.length - 1].value;
}

// ── QUESTION DEFINITIONS ───────────────────────────────────────────────────────
export const RF_ASSESSMENT_QUESTIONS = [

  // GROUP: Injury context
  { id: 'timing', assess_ref: 'RF-ASSESS-001', group: 'Injury context', key: 'days_since_injury_label', core: true,
    prompt: 'When did this injury happen?',
    options: [
      { value: 'today',         label: 'Today' },
      { value: '1_2_days_ago',  label: '1–2 days ago' },
      { value: '3_5_days_ago',  label: '3–5 days ago' },
      { value: '1_2_weeks_ago', label: '1–2 weeks ago' },
      { value: 'over_2_weeks',  label: 'More than 2 weeks ago' },
    ] },

  { id: 'mech', assess_ref: 'RF-ASSESS-001', group: 'Injury context', key: 'mechanism', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'kicking',         label: 'Kicking / shooting' },
      { value: 'sprinting',       label: 'Sprinting at full speed' },
      { value: 'acceleration',    label: 'Accelerating hard' },
      { value: 'deceleration',    label: 'Decelerating or cutting' },
      { value: 'gradual_overuse', label: 'Gradually / overuse' },
      { value: 'direct_impact',   label: 'Direct hit or contact' },
      { value: 'unsure',          label: 'Unsure' },
    ] },

  // McAuley 2021: being removed from activity = +11 days TRFT (p<0.001) — strongest single clinical predictor
  { id: 'continue', assess_ref: 'RF-ASSESS-001', group: 'Injury context', key: 'ability_to_continue_after', core: true,
    prompt: 'What happened immediately after the injury?',
    options: [
      { value: 'finished_normally',     label: 'I finished training or the match normally' },
      { value: 'continued_briefly',     label: 'I continued briefly, then stopped' },
      { value: 'stopped_immediately',   label: 'I stopped immediately' },
      { value: 'assisted_off',          label: 'I had to be helped off' },
      { value: 'could_not_bear_weight', label: 'I could not put weight on the leg at all' },
    ] },

  // Age range — used for avulsion concern flag and recurrence weighting
  { id: 'age_group', assess_ref: 'RF-ASSESS-001', group: 'Injury context', key: 'age_group', core: false,
    prompt: 'What is your age?',
    options: [
      { value: 'under_20', label: 'Under 20' },
      { value: '20_34',    label: '20–34' },
      { value: '35_44',    label: '35–44' },
      { value: '45_plus',  label: '45 or older' },
    ] },

  // Sport level — weights kicking mechanism risk (Santos 2021: all free tendon injuries in professionals)
  { id: 'sport_level', assess_ref: 'RF-ASSESS-001', group: 'Injury context', key: 'sport_level', core: false,
    prompt: 'What best describes your training or competition level?',
    options: [
      { value: 'recreational', label: 'Recreational / gym user' },
      { value: 'amateur',      label: 'Amateur / club sport' },
      { value: 'semi_pro',     label: 'Semi-professional' },
      { value: 'professional', label: 'Professional / elite' },
    ] },

  // Rudisill 2021: popping sound independently associated with delayed RTP
  { id: 'pop', assess_ref: 'RF-ASSESS-001', group: 'Injury context', key: 'pop_or_snap', core: false,
    prompt: 'At the moment of injury, did you feel or hear a pop, snap, or tearing sensation?',
    options: [
      { value: 'yes',    label: 'Yes' },
      { value: 'no',     label: 'No' },
      { value: 'unsure', label: 'Unsure' },
    ] },

  // GROUP: Pain & symptoms
  { id: 'sev', assess_ref: 'RF-ASSESS-001', group: 'Pain & symptoms',
    key: 'pain_severity_label', valueKey: 'pain_severity_value', core: false,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Right now, how bad is the pain overall? (0 = none, 100 = worst imaginable)',
    bands: PAIN_BANDS },

  { id: 'restpain', assess_ref: 'RF-ASSESS-001', group: 'Pain & symptoms', key: 'pain_at_rest', core: false,
    prompt: 'When you are still and not moving, is there pain?',
    options: [
      { value: 'none',     label: 'None — pain free at rest' },
      { value: 'mild',     label: 'Mild background ache' },
      { value: 'moderate', label: 'Moderate — noticeable even at rest' },
      { value: 'constant', label: 'Constant or severe at rest' },
    ] },

  { id: 'bruise', assess_ref: 'RF-ASSESS-001', group: 'Pain & symptoms', key: 'bruising_or_swelling', core: false,
    prompt: 'Is there any bruising or swelling?',
    options: [
      { value: 'none',        label: 'None' },
      { value: 'some',        label: 'Some' },
      { value: 'significant', label: 'Significant' },
    ] },

  // Clinical standard: immediate bruising (<2h) = significant structural disruption
  { id: 'bruisetiming', assess_ref: 'RF-ASSESS-001', group: 'Pain & symptoms', key: 'bruising_timing', core: false,
    conditional: { key: 'bruising_or_swelling', notIn: ['none'] },
    prompt: 'When did the bruising first appear?',
    options: [
      { value: 'within_2h',         label: 'Within 2 hours of the injury' },
      { value: 'next_morning',       label: 'By the next morning' },
      { value: 'delayed_2plus_days', label: '2 or more days later' },
      { value: 'unsure',             label: 'Not sure' },
    ] },

  // GROUP: Safety check
  { id: 'redflags', assess_ref: 'RF-ASSESS-002', group: 'Safety check', key: 'red_flags', core: true, type: 'multi',
    prompt: 'Do any of these apply right now? Select all that apply. If none apply, continue.',
    options: RF_RED_FLAGS.map((t) => ({ value: t, label: t })) },

  // GROUP: Physical tests
  // Giakoumis 2025: VAS pain on walking significantly associated with TRFT (p=0.001)
  { id: 'walk', assess_ref: 'RF-ASSESS-003', group: 'Physical tests',
    key: 'walking_response', valueKey: 'walking_value', core: true,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Walking on flat ground — how much pain? (0 = none, 100 = cannot do it)',
    bands: WALK_BANDS },

  { id: 'stairs', assess_ref: 'RF-ASSESS-004', group: 'Physical tests',
    key: 'stairs_response', valueKey: 'stairs_value', core: false,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Going up and down stairs — how much pain?',
    bands: WALK_BANDS },

  { id: 'hipflex', assess_ref: 'RF-ASSESS-005', group: 'Physical tests',
    key: 'hip_flexion_response', valueKey: 'hipflex_value', core: true,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Lift your knee toward your chest (hip flexion) — how uncomfortable?',
    bands: RANGE_BANDS },

  { id: 'kneeflex', assess_ref: 'RF-ASSESS-006', group: 'Physical tests',
    key: 'knee_flexion_response', valueKey: 'kneeflex_value', core: false,
    type: 'slider', min: 0, max: 100, default: 0,
    prompt: 'Bend your knee (kneeling or squatting) — how uncomfortable?',
    bands: RANGE_BANDS },

  // Ely's test: most specific self-performable test for RF pathology
  { id: 'ely', assess_ref: 'RF-ASSESS-019', group: 'Physical tests', key: 'ely_test', core: false,
    prompt: "Ely's test — lie face down, slowly bend your injured knee toward your buttock. Stop if painful.",
    hint: 'Most specific self-test for the rectus femoris. Pain in front of thigh = positive.',
    options: [
      { value: 'no_pain',        label: 'No pain — heel reached (or near) buttock comfortably' },
      { value: 'tightness_only', label: 'Tightness only, no real pain' },
      { value: 'anterior_pain',  label: 'Pain in the front of the thigh before heel reached buttock' },
      { value: 'could_not_bend', label: 'Could not bend far — too painful' },
      { value: 'not_tried',      label: 'Not tried' },
    ] },

  // Giakoumis 2025: resisted contraction significantly associated with TRFT (p=0.01)
  // Options now separate pain dimension from strength dimension
  { id: 'reship', assess_ref: 'RF-ASSESS-007', group: 'Physical tests', key: 'resisted_hip_flexion', core: false,
    prompt: 'Resisted hip flexion — seated, lift your thigh against your hand pushing down. What happened?',
    hint: 'Tests RF and hip flexors under load.',
    options: [
      { value: 'no_pain',           label: 'No pain — felt strong' },
      { value: 'mild_pain_strong',  label: 'Mild pain but still felt strong' },
      { value: 'significant_pain',  label: 'Significant pain' },
      { value: 'pain_and_weakness', label: 'Pain with clear weakness — could not push hard' },
      { value: 'weakness_no_pain',  label: 'Weak but not very painful' },
      { value: 'not_tried',         label: 'Not tried' },
    ] },

  { id: 'resknee', assess_ref: 'RF-ASSESS-008', group: 'Physical tests', key: 'knee_extension_response', core: true,
    prompt: 'Resisted knee extension — seated, straighten your knee against your hand pushing back. What happened?',
    hint: 'Single most specific functional test for the rectus femoris.',
    options: [
      { value: 'no_pain',           label: 'No pain — felt strong' },
      { value: 'mild_pain_strong',  label: 'Mild pain but still felt strong' },
      { value: 'significant_pain',  label: 'Significant pain' },
      { value: 'pain_and_weakness', label: 'Pain with clear weakness — could not push hard' },
      { value: 'weakness_no_pain',  label: 'Weak but not very painful' },
      { value: 'not_tried',         label: 'Not tried' },
    ] },

  // Cross 2004: proximal deep tenderness = central tendon suspect (26.9 vs 9.2 days)
  { id: 'palp', assess_ref: 'RF-ASSESS-009', group: 'Physical tests', key: 'palpation', core: false,
    prompt: 'Press along the front of your thigh from hip to knee. What do you find?',
    hint: 'Deep tenderness near the hip/groin end suggests central tendon involvement — typically a longer recovery.',
    options: [
      { value: 'none',            label: 'No tenderness anywhere' },
      { value: 'mild_surface',    label: 'Mildly tender, feels near the surface' },
      { value: 'marked_surface',  label: 'Very tender near the surface' },
      { value: 'deep_tenderness', label: 'Deep tenderness within the muscle' },
      { value: 'proximal_deep',   label: 'Deep tenderness near the top of the thigh / hip crease end' },
      { value: 'gap_or_defect',   label: 'I can feel a clear gap or dip in the muscle' },
      { value: 'not_tried',       label: 'Not tried' },
    ] },

  { id: 'iso', assess_ref: 'RF-ASSESS-010', group: 'Physical tests', key: 'isometric_hold', core: false,
    prompt: 'Hold a steady knee extension squeeze (isometric) — can you maintain it without symptoms worsening?',
    options: [
      { value: 'yes_20plus_sec',  label: 'Yes — held comfortably for 20+ seconds' },
      { value: 'held_briefly',    label: 'Held for a few seconds, not longer' },
      { value: 'yes_but_painful', label: 'Could hold but with significant pain' },
      { value: 'could_not',       label: 'Could not hold — too painful or too weak' },
      { value: 'not_tried',       label: 'Not tried' },
    ] },

  { id: 'ecc', assess_ref: 'RF-ASSESS-011', group: 'Physical tests', key: 'eccentric_control', core: false,
    prompt: 'Slowly lower your leg under control (eccentric) — can you do it without symptoms worsening?',
    options: [
      { value: 'yes',       label: 'Yes — controlled and pain free' },
      { value: 'partial',   label: 'Partly — some symptoms but manageable' },
      { value: 'no',        label: 'No — too painful or weak to control' },
      { value: 'not_tried', label: 'Not tried' },
    ] },

  { id: 'sl', assess_ref: 'RF-ASSESS-012', group: 'Physical tests', key: 'single_leg_control', core: false,
    prompt: 'Can you stand and balance on just the injured leg?',
    options: [
      { value: 'yes_pain_free',   label: 'Yes — comfortable and steady' },
      { value: 'yes_but_painful', label: 'Yes — but painful or felt unstable' },
      { value: 'difficult',       label: 'Very difficult — had to step down quickly' },
      { value: 'cannot',          label: 'Could not do it' },
      { value: 'not_tried',       label: 'Not tried' },
    ] },

  // GROUP: Running & sport tolerance
  { id: 'jog', assess_ref: 'RF-ASSESS-013', group: 'Running & sport tolerance', key: 'jog_tolerance', core: false,
    prompt: 'Have you tried light jogging? What happened?',
    options: [
      { value: 'not_tried',          label: 'Not tried yet' },
      { value: 'ok',                 label: 'Fine — no symptoms' },
      { value: 'mild_during',        label: 'Mild symptoms during' },
      { value: 'significant_during', label: 'Significant symptoms — had to stop' },
      { value: 'worse_after',        label: 'OK during but worse the next day' },
    ] },

  { id: 'run', assess_ref: 'RF-ASSESS-014', group: 'Running & sport tolerance', key: 'run_tolerance', core: false,
    prompt: 'Have you tried running at a moderate pace?',
    options: [
      { value: 'not_tried',          label: 'Not tried yet' },
      { value: 'ok',                 label: 'Fine — no symptoms' },
      { value: 'mild_during',        label: 'Mild symptoms during' },
      { value: 'significant_during', label: 'Significant symptoms — had to stop' },
      { value: 'worse_after',        label: 'Fine during but worse after or next day' },
    ] },

  { id: 'sprint', assess_ref: 'RF-ASSESS-015', group: 'Running & sport tolerance', key: 'sprint_tolerance', core: false, highCaution: true,
    prompt: 'Have you tried high-speed running or sprinting?',
    options: [
      { value: 'not_tried',          label: 'Not tried yet' },
      { value: 'ok',                 label: 'Fine — no symptoms' },
      { value: 'mild_during',        label: 'Mild symptoms during' },
      { value: 'significant_during', label: 'Significant symptoms — had to stop' },
      { value: 'worse_after',        label: 'Fine during but worse after or next day' },
    ] },

  { id: 'kick', assess_ref: 'RF-ASSESS-016', group: 'Running & sport tolerance', key: 'kick_tolerance', core: false, highCaution: true,
    prompt: 'Have you tried kicking?',
    options: [
      { value: 'not_tried',          label: 'Not tried yet' },
      { value: 'ok',                 label: 'Fine — no symptoms' },
      { value: 'mild_during',        label: 'Mild symptoms during' },
      { value: 'significant_during', label: 'Significant symptoms — had to stop' },
      { value: 'worse_after',        label: 'Fine during but worse after or next day' },
    ] },

  // GROUP: Response & history
  { id: 'nextday', assess_ref: 'RF-ASSESS-017', group: 'Response & history', key: 'next_day_response', core: true,
    prompt: 'After any movement or activity, how do symptoms respond the following day?',
    options: [
      { value: 'too_early',      label: 'Too soon to say — I have not tried any activity yet' },
      { value: 'same_or_better', label: 'Same or better' },
      { value: 'sore_settled',   label: 'More sore but settled within a few hours' },
      { value: 'worse',          label: 'Notably worse' },
      { value: 'much_worse',     label: 'Much worse — significant setback' },
    ] },

  { id: 'conf', assess_ref: 'RF-ASSESS-018', group: 'Response & history',
    key: 'movement_confidence', valueKey: 'movement_confidence_value', core: false, highCaution: true,
    type: 'slider', min: 0, max: 100, default: 50, invertColor: true,
    prompt: 'How confident do you feel loading the leg, running, or kicking right now?',
    bands: CONFIDENCE_BANDS },

  { id: 'prev', assess_ref: 'RF-ASSESS-001', group: 'Response & history', key: 'previous_injury', core: false,
    prompt: 'Have you injured this exact area before?',
    options: [
      { value: 'no',     label: 'No' },
      { value: 'yes',    label: 'Yes' },
      { value: 'unsure', label: 'Unsure' },
    ] },

  // Green 2020: previous injury RR = 2.7–4.8 for recurrence; incomplete recovery = highest risk
  { id: 'prevdetail', assess_ref: 'RF-ASSESS-001', group: 'Response & history', key: 'previous_injury_detail', core: false,
    conditional: { key: 'previous_injury', in: ['yes'] },
    prompt: 'What best describes that previous injury?',
    options: [
      { value: 'yes_full_recovery',       label: 'I recovered fully and had no problems since' },
      { value: 'yes_incomplete_recovery', label: "I'm not sure it ever fully recovered" },
      { value: 'yes_multiple_times',      label: 'I have injured it multiple times' },
    ] },

  { id: 'scar', assess_ref: 'RF-ASSESS-009', group: 'Response & history', key: 'scar_history', core: false,
    prompt: 'Have you ever been told you have scar tissue, fibrosis, or a persistent lump in this area?',
    options: [
      { value: 'no',     label: 'No' },
      { value: 'yes',    label: 'Yes' },
      { value: 'unsure', label: 'Unsure' },
    ] },
];

// Core keys — highest-signal items that drive completeness and diagnostic quality
export const CORE_RF_KEYS = [
  'pain_location',
  'mechanism',
  'days_since_injury_label',
  'ability_to_continue_after',
  'walking_response',
  'hip_flexion_response',
  'knee_extension_response',
  'next_day_response',
];

const ANSWERED = (v) =>
  v !== undefined && v !== null && v !== '' && v !== 'unsure' && v !== 'not_tried' && v !== 'too_early';

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

export function computeRfCompleteness(answers = {}, base = {}) {
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
  const score = provided.length / CORE_RF_KEYS.length;
  const status = score >= 0.8 ? 'complete' : score >= 0.5 ? 'partial' : 'incomplete';
  return { status, score: Math.round(score * 100) / 100, provided, missing };
}

export function computeRfFormFill(answers = {}, base = {}) {
  const qs = RF_ASSESSMENT_QUESTIONS.filter((q) => q.group !== 'Safety check');
  let total = 0, filled = 0;
  total += 1;
  if (deriveLocationFromAnatomy(base) || ANSWERED(answers.pain_location)) filled += 1;
  for (const q of qs) {
    total += 1;
    const k = q.valueKey || q.key;
    const v = answers[k];
    if (v !== undefined && v !== null && v !== '') filled += 1;
  }
  total += 1; if (base.sport) filled += 1;
  total += 1; if (Array.isArray(base.equipment) && base.equipment.length > 0) filled += 1;
  const percent = total ? Math.round((filled / total) * 100) : 0;
  return { total, filled, percent, allFilled: filled >= total };
}

// ── PROBABILISTIC DIAGNOSIS ENGINE ────────────────────────────────────────────
/**
 * Converts self-reported answers into a probabilistic RF injury diagnosis.
 *
 * Scoring is additive across multiple independent signals. No single signal
 * is decisive (Ishøi 2020: individual tests have low diagnostic accuracy).
 * Confidence is hard-capped at 78% — honest ceiling without imaging.
 *
 * Returns:
 *   probable_injury       always 'rectus_femoris_strain'
 *   probable_subtype      structural subtype estimate
 *   severity_band         'mild' | 'moderate' | 'high_concern' | 'red_flag'
 *   severity_score        raw additive score
 *   confidence_pct        30–78%
 *   estimated_rtp_days    { min, max }
 *   imaging_gate          boolean — locks rehab until imaging confirmed
 *   imaging_reason        string | null
 *   flags                 string[] — specific clinical patterns triggered
 *   differentials         ranked alternative diagnoses with RTP references
 *   signals               per-signal score breakdown
 */
export function computeRfDiagnosis(answers = {}, base = {}) {
  let score = 0;
  const signals = {};
  const flags = [];

  // ── MECHANISM (0–4 pts) ───────────────────────────────────────────────────
  // Pietsch 2023: kicking = longest RTP, 48.4% of RF injuries; Serner 2018: kicking = proximal tendon risk
  const mech = answers.mechanism;
  const mechMap = { kicking: 4, sprinting: 3, acceleration: 2, deceleration: 2, gradual_overuse: 1, direct_impact: 0 };
  if (mech && mechMap[mech] !== undefined) { signals.mechanism = mechMap[mech]; score += mechMap[mech]; }

  // ── SPORT LEVEL × MECHANISM INTERACTION ──────────────────────────────────────
  // Santos 2021: ALL free tendon RF injuries occurred in professionals during kicking.
  // Sprinting never caused free tendon injury. Professional kicking = maximum proximal load.
  // Recreational "kicking" is likely lower velocity → lower proximal tendon risk.
  const sportLevel = answers.sport_level;
  if (mech === 'kicking' && sportLevel) {
    const sportAdj = { professional: 1, semi_pro: 0, amateur: -1, recreational: -2 };
    const adj = sportAdj[sportLevel] ?? 0;
    if (adj !== 0) { signals.sport_level_kicking_adj = adj; score += adj; }
  }

  // ── ABILITY TO CONTINUE (0–8 pts) ─────────────────────────────────────────
  // McAuley 2021: removal from activity = +11 days TRFT (p<0.001) — strongest available predictor
  const atc = answers.ability_to_continue_after;
  const atcMap = { finished_normally: 0, continued_briefly: 2, stopped_immediately: 4, assisted_off: 7, could_not_bear_weight: 8 };
  if (atc && atcMap[atc] !== undefined) {
    signals.ability_to_continue = atcMap[atc]; score += atcMap[atc];
    if (atc === 'assisted_off' || atc === 'could_not_bear_weight') flags.push('functional_loss');
  }

  // ── POP OR SNAP (0–3 pts) ─────────────────────────────────────────────────
  // Rudisill 2021: popping sound independently associated with delayed RTP
  if (answers.pop_or_snap === 'yes') { signals.pop_or_snap = 3; score += 3; flags.push('audible_pop'); }

  // ── PAIN SEVERITY (0–4 pts) ───────────────────────────────────────────────
  // Rudisill 2021: greater pain at initial examination = delayed RTP
  const sev = answers.pain_severity_label || bandValue(answers.pain_severity_value, PAIN_BANDS);
  const sevMap = { severe: 4, moderate: 2, mild: 0 };
  if (sev && sevMap[sev] !== undefined) { signals.pain_severity = sevMap[sev]; score += sevMap[sev]; }

  // ── WALKING RESPONSE (0–6 pts) ────────────────────────────────────────────
  // Giakoumis 2025: VAS pain on walking significantly associated with TRFT (p=0.001)
  const walk = answers.walking_response;
  const walkMap = { unable: 6, painful: 3, mild: 1, none: 0 };
  if (walk && walkMap[walk] !== undefined) { signals.walking = walkMap[walk]; score += walkMap[walk]; }
  if (walk === 'unable') flags.push('non_ambulatory');

  // ── RESISTED HIP FLEXION (0–5 pts) ───────────────────────────────────────
  const rhf = answers.resisted_hip_flexion;
  // New option values (pain + strength separated)
  const rhfNew = { no_pain: 0, mild_pain_strong: 1, significant_pain: 3, pain_and_weakness: 5, weakness_no_pain: 4 };
  // Legacy option values (backward compat)
  const rhfLeg = { no: 0, mild: 1, painful: 3, weak: 5 };
  if (rhf && rhf !== 'not_tried' && rhf !== 'unsure') {
    const pts = rhfNew[rhf] ?? rhfLeg[rhf] ?? 0;
    signals.resisted_hip_flexion = pts; score += pts;
    if (rhf === 'weakness_no_pain') flags.push('neural_concern');
  }

  // ── RESISTED KNEE EXTENSION (0–7 pts) ────────────────────────────────────
  // Giakoumis 2025: resisted contraction pain significantly associated with TRFT (p=0.01)
  const rke = answers.knee_extension_response;
  const rkeNew = { no_pain: 0, mild_pain_strong: 2, significant_pain: 4, pain_and_weakness: 7, weakness_no_pain: 5 };
  const rkeLeg = { no: 0, mild: 2, painful: 4, weak: 7 };
  if (rke && rke !== 'not_tried' && rke !== 'unsure') {
    const pts = rkeNew[rke] ?? rkeLeg[rke] ?? 0;
    signals.knee_extension = pts; score += pts;
    if (rke === 'weakness_no_pain') flags.push('neural_concern');
  }

  // ── BRUISING + TIMING (0–4 pts) ───────────────────────────────────────────
  // Rudisill 2021: bruising = delayed RTP predictor
  // Clinical standard: immediate bruising (<2h) = significant structural disruption
  const bruise = answers.bruising_or_swelling;
  const bruiseTiming = answers.bruising_timing;
  let bruisePts = 0;
  if (bruise === 'significant') {
    bruisePts = bruiseTiming === 'within_2h' ? 4 : 2;
    if (bruiseTiming === 'within_2h') flags.push('immediate_bruising');
  } else if (bruise === 'some') {
    bruisePts = bruiseTiming === 'within_2h' ? 2 : 1;
    if (bruiseTiming === 'within_2h') flags.push('early_bruising');
  }
  signals.bruising = bruisePts; score += bruisePts;

  // ── PALPATION LOCATION (0–6 pts) ─────────────────────────────────────────
  // Cross 2004: central tendon = 26.9 days vs peripheral = 9.2 days
  // Proximal deep tenderness = central tendon involvement suspect
  const palp = answers.palpation;
  const palpNew = { none: 0, mild_surface: 1, marked_surface: 2, deep_tenderness: 3, proximal_deep: 4, gap_or_defect: 6 };
  const palpLeg = { none: 0, mild: 1, marked: 2, lump: 3 };
  if (palp && palp !== 'not_tried' && palp !== 'unsure') {
    const pts = palpNew[palp] ?? palpLeg[palp] ?? 0;
    signals.palpation = pts; score += pts;
    if (palp === 'gap_or_defect') flags.push('structural_defect');
    if (palp === 'proximal_deep') flags.push('proximal_tendon_suspect');
    if (palp === 'deep_tenderness' || palp === 'lump') flags.push('intratendinous_suspect');
  }

  // ── AVULSION CONCERN (young athletes: under 20 + kicking + proximal) ────────
  // Knapik 2023: proximal RF avulsion at AIIS — kicking mechanism, younger athletes
  if (
    answers.age_group === 'under_20' &&
    mech === 'kicking' &&
    (flags.includes('proximal_tendon_suspect') || palp === 'proximal_deep')
  ) {
    flags.push('avulsion_concern');
  }

  // ── ELY'S TEST (0–3 pts) ─────────────────────────────────────────────────
  // Prone knee bend: specific to RF. Pain = RF involvement confirmed.
  const ely = answers.ely_test;
  const elyMap = { no_pain: 0, tightness_only: 1, anterior_pain: 2, could_not_bend: 3 };
  if (ely && elyMap[ely] !== undefined) { signals.ely_test = elyMap[ely]; score += elyMap[ely]; }

  // ── HIP FLEXION RANGE (0–2 pts) ───────────────────────────────────────────
  const hf = answers.hip_flexion_response;
  const hfMap = { painful: 2, mild: 1, none: 0 };
  if (hf && hfMap[hf] !== undefined) { signals.hip_flexion_range = hfMap[hf]; score += hfMap[hf]; }

  // ── PREVIOUS INJURY (0–3 pts) ─────────────────────────────────────────────
  // Green 2020 meta-analysis: previous injury RR = 2.7–4.8 for recurrent strain
  const prevDetail = answers.previous_injury_detail;
  const prevBase = answers.previous_injury;
  const prevMap = { yes_multiple_times: 3, yes_incomplete_recovery: 2, yes_full_recovery: 1, yes: 1, no: 0 };
  const prevVal = prevDetail || prevBase;
  if (prevVal && prevMap[prevVal] !== undefined) { signals.previous_injury = prevMap[prevVal]; score += prevMap[prevVal]; }

  // ── RED FLAGS FROM CHECKBOX ────────────────────────────────────────────────
  if ((answers.red_flags || []).length > 0) flags.push('red_flag_triggered');

  // ── SEVERITY BAND ─────────────────────────────────────────────────────────
  let severity_band, probable_subtype, estimated_rtp_days;
  if (score <= 7) {
    severity_band = 'mild';
    probable_subtype = 'grade_1_myofascial';
    estimated_rtp_days = { min: 5, max: 10 };
  } else if (score <= 14) {
    severity_band = 'moderate';
    probable_subtype = 'grade_1_2_musculotendinous';
    estimated_rtp_days = { min: 10, max: 21 };
  } else if (score <= 22) {
    severity_band = 'high_concern';
    probable_subtype = 'grade_2_3_high_concern';
    estimated_rtp_days = { min: 21, max: 35 };
  } else {
    severity_band = 'red_flag';
    probable_subtype = 'grade_3_structural_disruption';
    estimated_rtp_days = { min: 35, max: 60 };
  }

  // Central tendon override: kicking/sprinting + proximal deep tenderness + sufficient score
  // Evidence: Cross 2004 (26.9 days), Balius 2009 (39–45 days), Serner 2018 (63% tendon involvement)
  if (
    (mech === 'kicking' || mech === 'sprinting') &&
    (flags.includes('proximal_tendon_suspect') || flags.includes('intratendinous_suspect')) &&
    score >= 10
  ) {
    if (severity_band === 'mild' || severity_band === 'moderate') severity_band = 'high_concern';
    probable_subtype = 'grade_2_3_central_tendon_suspect';
    estimated_rtp_days = { min: 26, max: 45 };
  }

  // Structural tear override: pop + early bruising + immediately stopped
  if (
    flags.includes('audible_pop') &&
    (flags.includes('immediate_bruising') || flags.includes('early_bruising')) &&
    (atc === 'stopped_immediately' || atc === 'assisted_off' || atc === 'could_not_bear_weight')
  ) {
    severity_band = 'red_flag';
    probable_subtype = 'grade_3_structural_tear_suspected';
    estimated_rtp_days = { min: 35, max: 60 };
    flags.push('structural_tear_pattern');
  }

  // ── IMAGING GATE ──────────────────────────────────────────────────────────
  const IMAGING_TRIGGERS = new Set([
    'structural_defect', 'functional_loss', 'non_ambulatory',
    'audible_pop', 'immediate_bruising', 'red_flag_triggered',
    'structural_tear_pattern', 'neural_concern', 'avulsion_concern',
  ]);
  const triggeredFlags = flags.filter((f) => IMAGING_TRIGGERS.has(f));
  const imaging_gate = severity_band === 'red_flag' || triggeredFlags.length > 0;
  const imaging_reason = imaging_gate
    ? (triggeredFlags.length ? triggeredFlags.join(', ') : 'high_severity_score')
    : null;

  // ── CONFIDENCE % ──────────────────────────────────────────────────────────
  // Each answered high-signal item increases diagnostic confidence.
  // Hard cap 78%: reflects Ishøi 2020 finding that clinical tests have very low to low accuracy.
  // Only imaging (MRI) can push confidence higher.
  const CONF_MAP = {
    ability_to_continue_after: 10,
    knee_extension_response:   10,
    mechanism:                  8,
    walking_response:           8,
    pop_or_snap:                6,
    resisted_hip_flexion:       6,
    ely_test:                   5,
    palpation:                  5,
    pain_severity_label:        4,
    days_since_injury_label:    3,
    hip_flexion_response:       3,
    bruising_or_swelling:       3,
    previous_injury:            2,
  };
  let conf = 28;
  for (const [key, pts] of Object.entries(CONF_MAP)) {
    const v = answers[key];
    if (v !== undefined && v !== null && v !== '' && v !== 'unsure' && v !== 'not_tried' && v !== 'too_early') {
      conf += pts;
    }
  }
  if (answers.bruising_timing && answers.bruising_timing !== 'unsure') conf += 3;
  if (answers.pain_severity_value !== undefined && answers.pain_severity_value !== null && answers.pain_severity_value !== '') conf += 2;
  if (deriveLocationFromAnatomy(base)) conf += 4;
  const confidence_pct = Math.min(conf, 78);

  // ── RF INJURY PATTERN (mechanism × anatomy — A/B/C) ──────────────────────
  // Three RF injury patterns with distinct RTP profiles.
  // Framework: Askling 2008 (PMID:18448581) mechanism→anatomy→RTP concept (hamstring).
  // RF-specific evidence: Geiss Santos+Serner 2021 (PMID:34050059, n=105),
  //   Jokela 2023 (PMID:36476343, video+MRI), McAleer 2022 BAMIC (PMID:35332596).
  // Pattern A: Proximal/Kicking — free tendon/central tendon. 26–45+ days.
  // Pattern B: Musculotendinous/Sprint — MTJ/intramuscular. 10–25 days.
  // Pattern C: Myofascial/Peripheral — surface/indirect. 5–14 days.
  let rf_pattern;
  const isProximalKicking = mech === 'kicking' && (
    flags.includes('proximal_tendon_suspect') ||
    flags.includes('structural_defect') ||
    flags.includes('avulsion_concern') ||
    severity_band === 'high_concern' ||
    severity_band === 'red_flag'
  );
  const isMTJSprint = (mech === 'sprinting' || mech === 'acceleration') && (
    flags.includes('intratendinous_suspect') || score >= 8
  );
  if (isProximalKicking) {
    rf_pattern = {
      type: 'A',
      label: 'Proximal / Kicking type',
      rtp_ref: '26–45+ days',
      detail: 'Proximal free tendon or central tendon involvement. Highest re-injury risk. Imaging strongly recommended.',
    };
  } else if (isMTJSprint) {
    rf_pattern = {
      type: 'B',
      label: 'Musculotendinous / Sprint type',
      rtp_ref: '10–25 days',
      detail: 'Musculotendinous junction or intramuscular involvement. Responds well to progressive eccentric loading.',
    };
  } else {
    rf_pattern = {
      type: 'C',
      label: 'Myofascial / Peripheral type',
      rtp_ref: '5–14 days',
      detail: 'Peripheral myofascial injury. Best prognosis. Early mobilisation is appropriate.',
    };
  }

  // ── DIFFERENTIALS ─────────────────────────────────────────────────────────
  const differentials = _buildDifferentials(severity_band, mech, flags);

  return {
    probable_injury: 'rectus_femoris_strain',
    probable_subtype,
    severity_band,
    severity_score: score,
    confidence_pct,
    estimated_rtp_days,
    imaging_gate,
    imaging_reason,
    flags,
    differentials,
    signals,
    rf_pattern,
  };
}

function _buildDifferentials(severity_band, mech, flags) {
  const list = [];
  if (severity_band === 'mild') {
    list.push({ injury: 'RF strain — Grade 1 myofascial', likelihood: 'most_likely', rtp_ref: '5–10 days' });
    list.push({ injury: 'Vastus muscle strain', likelihood: 'possible', rtp_ref: '4–8 days (Cross 2004)' });
    list.push({ injury: 'RF strain — Grade 2 musculotendinous', likelihood: 'less_likely', rtp_ref: '10–21 days' });
  } else if (severity_band === 'moderate') {
    list.push({ injury: 'RF strain — Grade 1–2 musculotendinous', likelihood: 'most_likely', rtp_ref: '10–21 days' });
    list.push({ injury: 'RF central tendon involvement', likelihood: 'possible', rtp_ref: '26+ days (Cross 2004)' });
    list.push({ injury: 'Vastus muscle strain', likelihood: 'less_likely', rtp_ref: '4–8 days' });
    list.push({ injury: 'Hip flexor strain (iliopsoas)', likelihood: 'less_likely', rtp_ref: '14–28 days' });
  } else if (severity_band === 'high_concern') {
    list.push({ injury: 'RF strain — Grade 2–3 with tendon involvement', likelihood: 'most_likely', rtp_ref: '21–45 days' });
    list.push({ injury: 'RF central tendon injury', likelihood: 'possible', rtp_ref: '26–45 days (Cross 2004, Balius 2009)' });
    if (mech === 'kicking') {
      list.push({ injury: 'Proximal RF avulsion / free tendon injury', likelihood: 'possible', rtp_ref: '8–22 weeks (Knapik 2023)' });
    }
    list.push({ injury: 'Hip flexor strain (iliopsoas)', likelihood: 'less_likely', rtp_ref: '14–28 days' });
  } else {
    list.push({ injury: 'RF strain — Grade 3 structural disruption', likelihood: 'most_likely', rtp_ref: '35–60+ days' });
    list.push({ injury: 'RF central tendon rupture', likelihood: 'possible', rtp_ref: '60–120+ days (Lempainen 2021)' });
    list.push({ injury: 'Proximal RF avulsion at AIIS', likelihood: 'possible', rtp_ref: '8–22 weeks operative (Knapik 2023)' });
  }
  if (flags.includes('neural_concern')) {
    list.push({ injury: 'Lumbar referred pain / femoral nerve irritation', likelihood: 'requires_assessment', rtp_ref: 'Requires clinical assessment' });
  }
  return list;
}

// ── EQUIPMENT MAPPER ──────────────────────────────────────────────────────────
function _mapEquipment(list) {
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

// ── ADAPTER: answers + base → RF engine input ─────────────────────────────────
export function mapRfAnswersToRfInput(answers = {}, base = {}) {
  // Translate new resisted-test option values → legacy engine enums
  function toEngineEnum(val) {
    const map = {
      no_pain: 'no', mild_pain_strong: 'mild', significant_pain: 'painful',
      pain_and_weakness: 'unable', weakness_no_pain: 'weak', not_tried: 'unsure',
    };
    return map[val] || val || 'unsure';
  }

  const rkeEngine = toEngineEnum(answers.knee_extension_response);
  const rhfEngine = toEngineEnum(answers.resisted_hip_flexion);
  const weak = rkeEngine === 'weak' || rkeEngine === 'unable' || rhfEngine === 'weak' || rhfEngine === 'unable';

  const hasRedFlags = (answers.red_flags || []).length > 0;
  const atc = answers.ability_to_continue_after;
  const ability = hasRedFlags || answers.walking_response === 'unable' || atc === 'could_not_bear_weight' || atc === 'assisted_off'
    ? 'no'
    : atc === 'stopped_immediately' || answers.walking_response === 'painful'
    ? 'limited'
    : 'yes';

  const responses = [answers.walking_response, answers.stairs_response, answers.hip_flexion_response, answers.knee_flexion_response];
  const anyUnable = responses.includes('unable');
  const anyPainful = responses.includes('painful');
  let pain_severity = answers.pain_severity_label || bandValue(answers.pain_severity_value, PAIN_BANDS);
  if (!pain_severity) pain_severity = anyUnable ? 'severe' : anyPainful ? 'moderate' : 'mild';

  const redFlagObj = {};
  for (const f of answers.red_flags || []) redFlagObj[String(f).toLowerCase().replace(/\s+/g, '_')] = true;

  const completeness = computeRfCompleteness(answers, base);
  const confidence_in_answers = completeness.status === 'complete' ? 'confident'
    : completeness.status === 'partial' ? 'somewhat' : 'unsure';

  const pain_location = deriveLocationFromAnatomy(base) || answers.pain_location || 'front_thigh_general';

  // Convert days_since_injury_label → numeric
  const dsiMap = { today: 0, '1_2_days_ago': 1, '3_5_days_ago': 4, '1_2_weeks_ago': 10, over_2_weeks: 21 };
  const dsiLabel = answers.days_since_injury_label;
  const days_since_injury = (dsiLabel && dsiMap[dsiLabel] !== undefined)
    ? dsiMap[dsiLabel]
    : (typeof base.daysSince === 'number' ? base.daysSince : 7);

  return {
    pain_location,
    mechanism: answers.mechanism || 'unsure',
    sport_context: base.sport || (Array.isArray(base.sports) && base.sports[0]) || 'unspecified',
    ability_to_continue: ability,
    walking_response: answers.walking_response || 'unsure',
    stairs_response: answers.stairs_response || 'unsure',
    hip_flexion_response: answers.hip_flexion_response || 'unsure',
    knee_flexion_response: answers.knee_flexion_response || 'unsure',
    knee_extension_response: rkeEngine === 'unable' ? 'unable' : (rkeEngine || 'unsure'),
    resisted_hip_flexion: rhfEngine || 'unsure',
    next_day_response: answers.next_day_response === 'too_early' ? 'unsure' : (answers.next_day_response || 'unsure'),
    pain_severity_label: pain_severity,
    bruising_or_swelling: answers.bruising_or_swelling || 'none',
    weakness_or_giving_way: weak ? 'marked' : 'none',
    red_flag_answers: redFlagObj,
    previous_injury: (answers.previous_injury === 'yes' || (answers.previous_injury_detail && answers.previous_injury_detail !== 'no')),
    reported_fibrosis_or_scar_history: (answers.scar_history === 'yes' || answers.palpation === 'lump' || answers.palpation === 'gap_or_defect') ? 'reported' : 'none',
    equipment_available: _mapEquipment(base.equipment),
    training_goal: base.sport
      ? `return_to_${String(base.sport).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`
      : 'general_return',
    confidence_in_answers,
    assessment_completeness: completeness.status,
    missing_rf_items: completeness.missing,
    rf_self_tests: {
      jog_tolerance:           answers.jog_tolerance           || 'not_tried',
      run_tolerance:           answers.run_tolerance           || 'not_tried',
      sprint_tolerance:        answers.sprint_tolerance        || 'not_tried',
      kick_tolerance:          answers.kick_tolerance          || 'not_tried',
      isometric_hold:          answers.isometric_hold          || 'not_tried',
      eccentric_control:       answers.eccentric_control       || 'not_tried',
      single_leg_control:      answers.single_leg_control      || 'not_tried',
      movement_confidence:     answers.movement_confidence     || bandValue(answers.movement_confidence_value, CONFIDENCE_BANDS) || null,
      palpation:               answers.palpation               || null,
      ely_test:                answers.ely_test                || null,
      pop_or_snap:             answers.pop_or_snap             || null,
      ability_to_continue_after: answers.ability_to_continue_after || null,
    },
    days_since_injury,
    diagnosis: computeRfDiagnosis(answers, base),
  };
}
