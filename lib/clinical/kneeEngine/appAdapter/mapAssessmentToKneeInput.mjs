/**
 * lib/clinical/kneeEngine/appAdapter/mapAssessmentToKneeInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ optional tailored `kneeAnswers`) into the
 * raw input shape runKnee() expects. Pure + browser-safe.
 *
 * The anatomy selector's exactArea ids map directly to KNEE_STRUCTURES; app
 * mechanism labels are normalised to the knee engine's mechanism vocabulary.
 * Tailored knee answers (when present) win over generic inference.
 * ---------------------------------------------------------------------------
 */

// exactArea (anatomy id) -> KNEE_STRUCTURES value
const STRUCTURE_MAP = {
  acl: 'acl', pcl: 'pcl', mcl: 'mcl', lcl: 'lcl',
  medial_meniscus: 'medial_meniscus', lateral_meniscus: 'lateral_meniscus',
  patellofemoral_joint: 'patellofemoral_joint', patellofemoral: 'patellofemoral_joint',
  tibial_tubercle: 'tibial_tubercle', itb_lateral_knee: 'itb_lateral_knee',
  patellar_tendon: 'patellar_tendon', quad_tendon: 'quad_tendon',
  knee_general: 'knee_general',
};

// pain location from structure
const STRUCTURE_LOCATION = {
  acl: 'anterior', pcl: 'posterior', mcl: 'medial', lcl: 'lateral',
  medial_meniscus: 'medial', lateral_meniscus: 'lateral',
  patellofemoral_joint: 'anterior', tibial_tubercle: 'anterior',
  itb_lateral_knee: 'lateral', knee_general: 'diffuse',
};

// app mechanism label -> knee mechanism vocabulary
function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/pivot|cut|planted|twist.*land|non.?contact/.test(s)) return 'pivot_noncontact';
  if (/dashboard|hyperflex|fell.*bent|shin.*hit/.test(s)) return 'dashboard_hyperflexion';
  if (/valgus|inward|hit.*outside|blow.*outer|from the side/.test(s)) return 'valgus_blow';
  if (/varus|outward|hit.*inside|blow.*inner/.test(s)) return 'varus_blow';
  if (/twist|rotate|pivot/.test(s)) return 'twisting';
  if (/jump|land|hop/.test(s)) return 'jumping_landing';
  if (/impact|blow|collision|contact|direct|tackle/.test(s)) return 'direct_blow';
  if (/gradual|overuse|run|repetitive|over time|slowly|no.*injury/.test(s)) return 'gradual_overuse';
  return 'unsure';
}

const clampPain = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n >= 7) return 'severe';
  if (n >= 4) return 'moderate';
  return 'mild';
};

/**
 * @param {object} a legacy assessment
 * @returns {object} raw input for makeKneeInput/runKnee
 */
export function mapAssessmentToKneeInput(a = {}) {
  const kneeAnswers = a.kneeAnswers || {};
  const exact = (a.exactArea || '').toLowerCase();
  const structure = kneeAnswers.structure || STRUCTURE_MAP[exact] || (a.primaryRegion === 'knee' ? 'knee_general' : null);
  const mechanism = kneeAnswers.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = kneeAnswers.pain_severity_label
    || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    structure,
    pain_location: kneeAnswers.pain_location || STRUCTURE_LOCATION[structure] || 'diffuse',
    mechanism,
    onset: kneeAnswers.onset || (mechanism === 'gradual_overuse' ? 'gradual' : 'sudden'),
    age_group: kneeAnswers.age_group || a.age_group || 'adult',
    swelling_timing: kneeAnswers.swelling_timing || null,
    bruising_or_swelling: kneeAnswers.swelling_amount || 'none',

    locking_or_block: kneeAnswers.locking_or_block ?? 'unsure',
    giving_way: kneeAnswers.giving_way ?? 'unsure',
    pop_at_injury: kneeAnswers.pop_at_injury ?? 'unsure',
    recurrent_dislocation: kneeAnswers.recurrent_dislocation ?? 'unsure',
    laxity_grade: kneeAnswers.laxity_grade ?? null,

    ability_to_continue: kneeAnswers.ability_to_continue || null,
    weight_bearing: kneeAnswers.weight_bearing || null,
    pain_with_squat: kneeAnswers.pain_with_squat ?? 'unsure',
    pain_with_stairs: kneeAnswers.pain_with_stairs ?? 'unsure',
    joint_line_tenderness: kneeAnswers.joint_line_tenderness ?? 'unsure',
    morning_stiffness_minutes: kneeAnswers.morning_stiffness_minutes ?? null,
    pain_severity_label: painLabel,

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    surgical_repair_done: kneeAnswers.surgical_repair_done ?? false,
    weeks_since_surgery: kneeAnswers.weeks_since_surgery ?? null,

    febrile_hot_joint: kneeAnswers.febrile_hot_joint ?? false,
    high_energy_trauma: kneeAnswers.high_energy_trauma ?? false,

    red_flag_answers: kneeAnswers.red_flag_answers || {},
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',
    activity_level: kneeAnswers.activity_level || null,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: kneeAnswers.injury_entity_override || null,
  };
}
