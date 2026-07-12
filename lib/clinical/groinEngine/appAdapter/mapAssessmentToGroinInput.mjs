/**
 * lib/clinical/groinEngine/appAdapter/mapAssessmentToGroinInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ tailored `groinAnswers`) into the raw
 * input shape runGroin() expects. Pure + browser-safe.
 * ---------------------------------------------------------------------------
 */

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/kick/.test(s)) return 'kicking';
  if (/cut|change.*direction|pivot|twist/.test(s)) return 'change_of_direction';
  if (/sprint|accelerat/.test(s)) return 'sprinting';
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
 * @returns {object} raw input for makeGroinInput/runGroin
 */
export function mapAssessmentToGroinInput(a = {}) {
  const ans = a.groinAnswers || {};
  const mechanism = ans.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = ans.pain_severity_label || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    mechanism,
    onset: ans.onset || (mechanism === 'gradual_overuse' ? 'gradual' : 'sudden'),
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',

    ability_to_continue: ans.ability_to_continue || null,
    pain_severity_label: painLabel,
    bruising_or_swelling: ans.bruising_or_swelling || 'none',

    resisted_adduction_pain: ans.resisted_adduction_pain ?? 'unsure',
    symptom_duration_weeks: Number.isFinite(Number(ans.symptom_duration_weeks)) ? Number(ans.symptom_duration_weeks) : (Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) / 7 : 1),

    bulge_present: ans.bulge_present || 'no',
    worse_with_straining: ans.worse_with_straining || 'no',

    fadir_test: ans.fadir_test ?? 'unsure',
    clicking_or_catching: ans.clicking_or_catching || 'no',

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    training_goal: ans.training_goal || 'general_return',
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: ans.injury_entity_override || null,
  };
}
