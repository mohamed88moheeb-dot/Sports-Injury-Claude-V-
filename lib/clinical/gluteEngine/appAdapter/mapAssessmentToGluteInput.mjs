/**
 * lib/clinical/gluteEngine/appAdapter/mapAssessmentToGluteInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ tailored `gluteAnswers`) into the raw
 * input shape runGlute() expects. Pure + browser-safe.
 * ---------------------------------------------------------------------------
 */

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/sprint/.test(s)) return 'sprinting';
  if (/fall|impact|collision/.test(s)) return 'fall';
  if (/decelerat|cut|change.*direction|sudden/.test(s)) return 'sudden_deceleration';
  if (/gradual|overuse|over time|slowly|no.*injury/.test(s)) return 'gradual_overuse';
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
 * @returns {object} raw input for makeGluteInput/runGlute
 */
export function mapAssessmentToGluteInput(a = {}) {
  const ans = a.gluteAnswers || {};
  const mechanism = ans.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = ans.pain_severity_label || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    mechanism,
    onset: ans.onset || (mechanism === 'gradual_overuse' ? 'gradual' : 'sudden'),
    pain_location: ans.pain_location || 'unsure',
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',

    ability_to_continue: ans.ability_to_continue || null,
    pain_severity_label: painLabel,
    bruising_or_swelling: ans.bruising_or_swelling || 'none',

    worse_lying_on_side: ans.worse_lying_on_side || 'no',
    worse_with_stairs_sitting: ans.worse_with_stairs_sitting || 'no',
    single_leg_stance_pain: ans.single_leg_stance_pain ?? 'unsure',
    resisted_abduction_pain: ans.resisted_abduction_pain ?? 'unsure',
    symptom_duration_weeks: Number.isFinite(Number(ans.symptom_duration_weeks)) ? Number(ans.symptom_duration_weeks) : (Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) / 7 : 1),

    radiating_pain_below_knee: ans.radiating_pain_below_knee || 'no',
    numbness_tingling: ans.numbness_tingling || 'no',
    nerve_provocation_test: ans.nerve_provocation_test ?? 'unsure',

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    training_goal: ans.training_goal || 'general_return',
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: ans.injury_entity_override || null,
  };
}
