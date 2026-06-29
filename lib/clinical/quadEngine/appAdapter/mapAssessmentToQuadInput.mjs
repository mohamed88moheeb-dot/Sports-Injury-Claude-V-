/**
 * lib/clinical/quadEngine/appAdapter/mapAssessmentToQuadInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the legacy app assessment shape into the quad engine input. Pure +
 * browser-safe (imports nothing). Translates field VALUES only; it does not
 * pull legacy clinical data into the engine.
 *
 * If the app collected the richer per-entity intake answers (assessment.quad),
 * those are merged on top and win — so the tailored questionnaire, when present,
 * drives the diagnosis; otherwise we infer sensible values from the generic form.
 * ---------------------------------------------------------------------------
 */

import { normalizeQuadAnswers } from './quadAssessmentModel.mjs';

const joinLower = (arr) => (Array.isArray(arr) ? arr.join(' ').toLowerCase() : '');

function mapMuscleAndLocation(a) {
  const exact = (a.exactArea || '').toLowerCase();
  if (/vastus.?later|outer|lateral/.test(exact)) return { muscle_hint: 'vastus_lateralis', pain_location: 'lateral_thigh' };
  if (/vastus.?medial|vmo|inner|medial/.test(exact)) return { muscle_hint: 'vastus_medialis', pain_location: 'medial_thigh' };
  if (/vastus.?inter|deep/.test(exact)) return { muscle_hint: 'vastus_intermedius', pain_location: 'anterior_thigh' };
  if (/tendon|patellar|jumper|kneecap/.test(exact)) return { muscle_hint: null, pain_location: 'anterior_knee_tendon' };
  return { muscle_hint: null, pain_location: 'anterior_thigh' };
}

function mapMechanism(a) {
  const m = (a.mechanism || '').toLowerCase();
  if (/impact|blow|collision|contact|dead\s*leg/.test(m)) return 'direct_impact';
  if (/kick/.test(m)) return 'kicking';
  if (/sprint|sudden|accel|cut|twist/.test(m)) return 'sprinting';
  if (/jump|land/.test(m)) return 'jumping_overuse';
  if (/gradual|overuse|overload|long run|hill|training|increase|load/.test(m)) return 'gradual_overuse';
  if (/heavy lift|lift/.test(m)) return 'eccentric_load_pop';
  return 'unsure';
}

function mapOnset(a) {
  const m = (a.mechanism || '').toLowerCase();
  if (/gradual|overuse|overload|long run|hill/.test(m)) return 'gradual';
  return 'sudden';
}

function mapPainSeverity(a) {
  const rest = a.painRest ?? 0, walk = a.painWalking ?? 0, sport = a.painSport ?? 0;
  const max = Math.max(rest, walk, sport);
  if (rest >= 6 || max >= 8) return 'severe';
  if (walk >= 3 || sport >= 5 || max >= 5) return 'moderate';
  return 'mild';
}

function mapAbilityToContinue(a) {
  if ((a.redFlags || []).length) return 'no';
  if ((a.painSport ?? 0) >= 7 || (a.painWalking ?? 0) >= 6) return 'no';
  if ((a.painSport ?? 0) >= 4) return 'limited';
  return 'yes';
}

function mapResponse(level) {
  if (level >= 6) return 'unable';
  if (level >= 3) return 'painful';
  if (level >= 1) return 'mild';
  return 'none';
}

/**
 * Knee-extension response from pain — but 'unable' is reserved for genuine
 * weakness/red-flag signals, not a high pain score alone. Pain of 6/10 means
 * "painful", not "cannot extend" — otherwise moderate strains over-grade to 3.
 */
function mapKneeExtension(a) {
  const sx = joinLower(a.symptoms);
  const weakness = /giving way|cannot straighten|cannot extend|marked weak|unable to straighten/.test(sx);
  if (weakness || (a.redFlags || []).length) return 'unable';
  const level = Math.max(a.painSport ?? 0, a.painWalking ?? 0);
  if (level >= 4) return 'painful';
  if (level >= 1) return 'mild';
  return 'none';
}

function mapBruising(a) {
  const sx = joinLower(a.symptoms);
  if (/significant brui|large brui|spreading|marked swelling|significant swelling/.test(sx)) return 'significant';
  if (/brui|swell/.test(sx)) return 'some';
  return 'none';
}

function mapEquipment(a) {
  const eq = Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : [];
  const out = [];
  if (eq.some((e) => /gym|machine|cable|leg press/.test(e))) out.push('gym', 'machine');
  if (eq.some((e) => /dumbbell|weight|kettlebell/.test(e))) out.push('dumbbell');
  if (eq.some((e) => /barbell/.test(e))) out.push('barbell');
  if (eq.some((e) => /band|resist/.test(e))) out.push('band');
  if (eq.some((e) => /bench/.test(e))) out.push('bench');
  if (eq.some((e) => /bike|cycle/.test(e))) out.push('bike');
  if (!out.length || eq.some((e) => /bodyweight|none/.test(e))) out.push('bodyweight');
  return Array.from(new Set(out));
}

/**
 * @param {object} a legacy assessment
 * @returns {object} quad engine input
 */
export function mapAssessmentToQuadInput(a = {}) {
  const { muscle_hint, pain_location } = mapMuscleAndLocation(a);
  const painWalk = a.painWalking ?? 0;

  const base = {
    pain_location,
    muscle_hint,
    mechanism: mapMechanism(a),
    onset: mapOnset(a),
    sport_context: Array.isArray(a.sports) && a.sports.length ? String(a.sports[0]).toLowerCase() : 'unspecified',
    pain_severity_label: mapPainSeverity(a),
    ability_to_continue: mapAbilityToContinue(a),
    walking_response: mapResponse(painWalk),
    knee_extension_response: mapKneeExtension(a),
    bruising_or_swelling: mapBruising(a),
    previous_injury: !!(a.previousInjury || /previous|again|recurr/.test(joinLower(a.symptoms))),
    days_since_injury: typeof a.daysSince === 'number' ? a.daysSince : 7,
    equipment_available: mapEquipment(a),
    training_goal: 'general_return',
    confidence_in_answers: 'somewhat',
  };

  // If the richer per-entity tailored answers were collected, they win.
  // Normalise select-string values ('true'/numeric) into engine types first.
  if (a.quad && typeof a.quad === 'object') {
    return { ...base, ...normalizeQuadAnswers(a.quad) };
  }
  return base;
}
