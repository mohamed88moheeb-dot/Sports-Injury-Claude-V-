/**
 * lib/clinical/lowerBackEngine/appAdapter/mapAssessmentToLowerBackInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ tailored `lowerBackAnswers`) into the
 * raw input shape runLowerBack() expects. Pure + browser-safe.
 * ---------------------------------------------------------------------------
 */

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/lift|bend|twist|sudden/.test(s)) return 'sudden_lift_twist';
  if (/gymnast|bowl|throw|extension|rotation|dance|javelin/.test(s)) return 'repetitive_extension_rotation';
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
 * @returns {object} raw input for makeLowerBackInput/runLowerBack
 */
export function mapAssessmentToLowerBackInput(a = {}) {
  const ans = a.lowerBackAnswers || {};
  const mechanism = ans.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = ans.pain_severity_label || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    mechanism,
    onset: ans.onset || (mechanism === 'gradual_overuse' ? 'gradual' : 'sudden'),
    pain_location: ans.pain_location || 'unsure',
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',
    age_group: ans.age_group || 'adult',

    ability_to_continue: ans.ability_to_continue || null,
    pain_severity_label: painLabel,

    leg_pain_below_knee: ans.leg_pain_below_knee || 'no',
    numbness_tingling_leg: ans.numbness_tingling_leg || 'no',
    worse_with_flexion_sitting: ans.worse_with_flexion_sitting || 'no',
    worse_with_extension: ans.worse_with_extension || 'no',
    extension_rotation_sport: ans.extension_rotation_sport || 'no',
    single_leg_hyperextension_test: ans.single_leg_hyperextension_test ?? 'unsure',
    symptom_duration_weeks: Number.isFinite(Number(ans.symptom_duration_weeks)) ? Number(ans.symptom_duration_weeks) : (Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) / 7 : 1),

    saddle_numbness: ans.saddle_numbness || 'no',
    bladder_or_bowel_dysfunction: ans.bladder_or_bowel_dysfunction || 'no',
    bilateral_leg_symptoms: ans.bilateral_leg_symptoms || 'no',
    progressive_neuro_deficit: ans.progressive_neuro_deficit || 'no',
    recent_significant_trauma: ans.recent_significant_trauma || 'no',
    unexplained_weight_loss_or_fever: ans.unexplained_weight_loss_or_fever || 'no',

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    training_goal: ans.training_goal || 'general_return',
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: ans.injury_entity_override || null,
  };
}
