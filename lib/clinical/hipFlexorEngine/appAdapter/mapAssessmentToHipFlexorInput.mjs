/**
 * lib/clinical/hipFlexorEngine/appAdapter/mapAssessmentToHipFlexorInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ tailored `hipFlexorAnswers`) into the
 * raw input shape runHipFlexor() expects. Pure + browser-safe.
 * ---------------------------------------------------------------------------
 */

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/kick|sprint start|sit.?up|sudden.*flex|explosive/.test(s)) return 'sudden_hip_flexion';
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
 * @returns {object} raw input for makeHipFlexorInput/runHipFlexor
 */
export function mapAssessmentToHipFlexorInput(a = {}) {
  const ans = a.hipFlexorAnswers || {};
  const mechanism = ans.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = ans.pain_severity_label || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    mechanism,
    onset: ans.onset || (mechanism === 'gradual_overuse' ? 'gradual' : 'sudden'),
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',

    ability_to_continue: ans.ability_to_continue || null,
    pain_severity_label: painLabel,
    bruising_or_swelling: ans.bruising_or_swelling || 'none',

    resisted_hip_flexion_pain: ans.resisted_hip_flexion_pain ?? 'unsure',
    snapping_sensation: ans.snapping_sensation || 'no',
    symptom_duration_weeks: Number.isFinite(Number(ans.symptom_duration_weeks)) ? Number(ans.symptom_duration_weeks) : (Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) / 7 : 1),

    hop_test: ans.hop_test ?? 'unsure',
    night_pain: ans.night_pain || 'no',
    gradual_onset_runner: ans.gradual_onset_runner || (mechanism === 'gradual_overuse' ? 'yes' : 'no'),

    fadir_test: ans.fadir_test ?? 'unsure',
    clicking_or_catching: ans.clicking_or_catching || 'no',

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    training_goal: ans.training_goal || 'general_return',
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: ans.injury_entity_override || null,
  };
}
