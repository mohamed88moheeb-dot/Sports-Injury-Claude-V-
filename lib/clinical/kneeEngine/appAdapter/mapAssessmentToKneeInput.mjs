/**
 * lib/clinical/kneeEngine/appAdapter/mapAssessmentToKneeInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the legacy app assessment shape into the knee engine input. Pure +
 * browser-safe (imports nothing but the answer normaliser). Translates field
 * VALUES only.
 *
 * If the app collected the richer per-entity tailored answers
 * (assessment.knee), those are merged on top and win — so the tailored
 * questionnaire, when present, drives the diagnosis; otherwise sensible
 * values are inferred from the generic form.
 * ---------------------------------------------------------------------------
 */

import { normalizeKneeAnswers } from './kneeAssessmentModel.mjs';

const joinLower = (arr) => (Array.isArray(arr) ? arr.join(' ').toLowerCase() : '');

function mapPainLocation(a) {
  const exact = (a.exactArea || '').toLowerCase();
  if (/inner|medial/.test(exact)) return 'medial';
  if (/outer|lateral|itb|it.?band/.test(exact)) return 'lateral';
  if (/front|kneecap|patell|tubercle|anterior/.test(exact)) return 'anterior';
  if (/back|posterior/.test(exact)) return 'posterior';
  return 'diffuse';
}

function mapMechanism(a) {
  const m = (a.mechanism || '').toLowerCase();
  if (/pivot|plant.*twist|cut/.test(m)) return 'pivot_noncontact';
  if (/valgus|inward|knock/.test(m)) return 'valgus_blow';
  if (/varus|outward|bow/.test(m)) return 'varus_blow';
  if (/dashboard|hyperflex/.test(m)) return 'dashboard_hyperflexion';
  if (/twist/.test(m)) return 'twisting';
  if (/impact|blow|collision|contact|tackle/.test(m)) return 'direct_blow';
  if (/jump|land/.test(m)) return 'jumping_landing';
  if (/gradual|overuse|overload|long run|hill|training|increase|load/.test(m)) return 'gradual_overuse';
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

function mapWeightBearing(a) {
  const sx = joinLower(a.symptoms);
  if (/unable to bear weight|cannot walk|can.?t weight.?bear/.test(sx)) return 'unable';
  if ((a.painWalking ?? 0) >= 6) return 'unable';
  if ((a.painWalking ?? 0) >= 2) return 'painful';
  return 'full';
}

function mapBruising(a) {
  const sx = joinLower(a.symptoms);
  if (/significant brui|large brui|spreading|marked swelling|significant swelling/.test(sx)) return 'significant';
  if (/brui|swell/.test(sx)) return 'some';
  return 'none';
}

function mapGivingWay(a) {
  const sx = joinLower(a.symptoms);
  if (/giving way|gives way|buckl|unstable|instability/.test(sx)) return 'yes';
  return 'unsure';
}

function mapLockingOrBlock(a) {
  const sx = joinLower(a.symptoms);
  if (/lock|block|can.?t straighten|cannot straighten|catch/.test(sx)) return 'yes';
  return 'unsure';
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
 * @returns {object} knee engine input
 */
export function mapAssessmentToKneeInput(a = {}) {
  const base = {
    structure: null,
    pain_location: mapPainLocation(a),
    mechanism: mapMechanism(a),
    onset: mapOnset(a),
    age_group: 'adult',
    sport_context: Array.isArray(a.sports) && a.sports.length ? String(a.sports[0]).toLowerCase() : 'unspecified',
    pain_severity_label: mapPainSeverity(a),
    ability_to_continue: mapAbilityToContinue(a),
    weight_bearing: mapWeightBearing(a),
    bruising_or_swelling: mapBruising(a),
    swelling_timing: 'none',
    giving_way: mapGivingWay(a),
    locking_or_block: mapLockingOrBlock(a),
    pop_at_injury: 'unsure',
    recurrent_dislocation: 'unsure',
    joint_line_tenderness: 'unsure',
    pain_with_squat: 'unsure',
    pain_with_stairs: 'unsure',
    days_since_injury: typeof a.daysSince === 'number' ? a.daysSince : 7,
    equipment_available: mapEquipment(a),
    activity_level: 'recreational',
    confidence_in_answers: 'somewhat',
  };

  // If the richer per-entity tailored answers were collected, they win.
  // Normalise select-string values ('true'/numeric) into engine types first.
  if (a.knee && typeof a.knee === 'object') {
    return { ...base, ...normalizeKneeAnswers(a.knee) };
  }
  return base;
}
