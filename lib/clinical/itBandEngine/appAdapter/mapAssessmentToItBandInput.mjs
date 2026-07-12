/**
 * lib/clinical/itBandEngine/appAdapter/mapAssessmentToItBandInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ tailored `itBandAnswers`) into the raw
 * input shape runItBand() expects. Pure + browser-safe.
 * ---------------------------------------------------------------------------
 */

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/gradual|overuse|over time|slowly|run|no.*injury/.test(s)) return 'gradual_overuse';
  if (/sudden|fall|impact/.test(s)) return 'sudden';
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
 * @returns {object} raw input for makeItBandInput/runItBand
 */
export function mapAssessmentToItBandInput(a = {}) {
  const ans = a.itBandAnswers || {};
  const mechanism = ans.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = ans.pain_severity_label || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    mechanism,
    onset: ans.onset || (mechanism === 'gradual_overuse' ? 'gradual' : 'sudden'),
    pain_location: ans.pain_location || 'unsure',
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',

    ability_to_continue: ans.ability_to_continue || null,
    pain_severity_label: painLabel,

    worse_downhill_or_stairs: ans.worse_downhill_or_stairs || 'no',
    recent_training_change: ans.recent_training_change || 'no',
    consistent_onset_distance: ans.consistent_onset_distance ?? 'unsure',
    resisted_hip_abduction_pain: ans.resisted_hip_abduction_pain ?? 'unsure',
    symptom_duration_weeks: Number.isFinite(Number(ans.symptom_duration_weeks)) ? Number(ans.symptom_duration_weeks) : (Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) / 7 : 1),

    locking_or_catching: ans.locking_or_catching || 'no',
    giving_way: ans.giving_way || 'no',
    significant_effusion: ans.significant_effusion || 'no',

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    training_goal: ans.training_goal || 'general_return',
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: ans.injury_entity_override || null,
  };
}
