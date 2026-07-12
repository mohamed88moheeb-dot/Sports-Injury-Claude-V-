/**
 * lib/clinical/calfEngine/appAdapter/mapAssessmentToCalfInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ tailored `calfAnswers`) into the raw
 * input shape runCalf() expects. Pure + browser-safe.
 * ---------------------------------------------------------------------------
 */

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/shot|pulled|pop|sudden.*push|sprint|explosive/.test(s)) return 'sudden_push_off';
  if (/sprint|accelerat/.test(s)) return 'sprinting';
  if (/gradual|overuse|run|repetitive|over time|slowly|no.*injury|training load/.test(s)) return 'gradual_overuse_running';
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
 * @returns {object} raw input for makeCalfInput/runCalf
 */
export function mapAssessmentToCalfInput(a = {}) {
  const ans = a.calfAnswers || {};
  const mechanism = ans.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = ans.pain_severity_label || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    mechanism,
    onset: ans.onset || (mechanism === 'gradual_overuse_running' ? 'gradual' : 'sudden'),
    pain_location: ans.pain_location || null,
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',

    ability_to_continue: ans.ability_to_continue || null,
    weight_bearing_ability: ans.weight_bearing_ability || null,
    pain_severity_label: painLabel,
    bruising_or_swelling: ans.bruising_or_swelling || 'none',

    thompson_test: ans.thompson_test ?? 'unsure',
    palpable_gap: ans.palpable_gap || 'no',
    sudden_snap_sensation: ans.sudden_snap_sensation || 'no',
    unable_heel_raise: ans.unable_heel_raise ?? 'unsure',

    morning_stiffness: ans.morning_stiffness ?? 'unsure',
    pain_with_running: ans.pain_with_running ?? 'unsure',

    shin_tenderness_length: ans.shin_tenderness_length ?? 'unsure',
    hop_test: ans.hop_test ?? 'unsure',

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    training_goal: ans.training_goal || 'general_return',
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: ans.injury_entity_override || null,
  };
}
