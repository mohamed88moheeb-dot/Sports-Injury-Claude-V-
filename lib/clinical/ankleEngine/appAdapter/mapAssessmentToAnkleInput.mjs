/**
 * lib/clinical/ankleEngine/appAdapter/mapAssessmentToAnkleInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's legacy assessment (+ tailored `ankleAnswers`) into the raw
 * input shape runAnkle() expects. Pure + browser-safe. Tailored ankle
 * answers (when present) win over generic inference from the legacy fields.
 * ---------------------------------------------------------------------------
 */

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/rolled|inward|twist.*in|invert/.test(s)) return 'inversion';
  if (/rotat|planted.*twist|foot stuck|outward twist/.test(s)) return 'external_rotation';
  if (/impact|blow|collision|contact|direct|tackle|stepped on/.test(s)) return 'direct_impact';
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
 * @returns {object} raw input for makeAnkleInput/runAnkle
 */
export function mapAssessmentToAnkleInput(a = {}) {
  const ans = a.ankleAnswers || {};
  const mechanism = ans.mechanism || normaliseMechanism(a.mechanism, a.story);
  const painLabel = ans.pain_severity_label || clampPain(a.painSport) || clampPain(a.painWalking) || 'moderate';

  return {
    mechanism,
    sport_context: (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'unspecified',
    onset: ans.onset || (mechanism === 'gradual_overuse' ? 'gradual' : 'sudden'),

    ability_to_continue: ans.ability_to_continue || null,
    weight_bearing_ability: ans.weight_bearing_ability || null,
    pain_severity_label: painLabel,
    bruising_or_swelling: ans.bruising_or_swelling || 'none',
    instability_signs: ans.instability_signs || 'none',

    bone_tenderness_malleolus: ans.bone_tenderness_malleolus || 'no',
    bone_tenderness_midfoot: ans.bone_tenderness_midfoot || 'no',
    unable_to_bear_weight_4_steps: ans.unable_to_bear_weight_4_steps || (ans.weight_bearing_ability === 'unable' ? 'yes' : 'no'),

    pain_above_mortise: ans.pain_above_mortise ?? 'unsure',
    squeeze_test: ans.squeeze_test ?? 'unsure',
    external_rotation_test: ans.external_rotation_test ?? 'unsure',
    diastasis_suspected: ans.diastasis_suspected || 'no',

    prior_sprain_count: Number.isFinite(Number(ans.prior_sprain_count)) ? Number(ans.prior_sprain_count) : 0,
    months_since_last_sprain: Number.isFinite(Number(ans.months_since_last_sprain)) ? Number(ans.months_since_last_sprain) : null,
    giving_way_without_new_injury: ans.giving_way_without_new_injury || 'no',

    days_since_injury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : 7,
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
    training_goal: ans.training_goal || 'general_return',
    confidence_in_answers: a.confidence_in_answers || 'somewhat',
    injury_entity_override: ans.injury_entity_override || null,
  };
}
