/**
 * lib/clinical/rfBetaAppAdapter/mapAssessmentToRfInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the legacy app assessment shape into the RF beta engine's qualitative
 * rfAssessmentInput. Pure + browser-safe (imports nothing). It does NOT import
 * legacy clinical data into the engine — it only translates field values.
 *
 * Legacy assessment fields used: primaryRegion, exactArea, mechanism (string),
 * symptoms[], movements[], sports[], equipment[], painRest, painWalking,
 * painSport, redFlags[], previousInjury?, story.
 * ---------------------------------------------------------------------------
 */

const joinLower = (arr) => (Array.isArray(arr) ? arr.join(' ').toLowerCase() : '');

function mapPainLocation(a) {
  const exact = (a.exactArea || '').toLowerCase();
  if (/rectus|front_thigh_middle|front.*thigh/.test(exact)) return 'anterior_thigh_rectus_femoris';
  if (/hip.?flex|upper/.test(exact)) return 'upper_thigh_hip_flexor';
  if ((a.primaryRegion || '').toLowerCase() === 'quadriceps') return 'anterior_thigh_rectus_femoris';
  return 'front_thigh_general';
}

function mapMechanism(a) {
  const m = (a.mechanism || '').toLowerCase();
  if (/kick/.test(m)) return 'kicking';
  if (/sprint|sudden|accel/.test(m)) return 'sprinting';
  if (/deceler|brak|stop/.test(m)) return 'deceleration';
  if (/gradual|overuse|overload|training|increase|load/.test(m)) return 'gradual_overuse';
  if (/impact|collision|kick to|blow|contact/.test(m)) return 'direct_impact';
  return 'sprinting';
}

function mapPainSeverity(a) {
  const rest = a.painRest ?? 0, walk = a.painWalking ?? 0, sport = a.painSport ?? 0;
  const max = Math.max(rest, walk, sport);
  if (rest >= 6 || max >= 8) return 'severe';
  if (walk >= 3 || sport >= 5 || max >= 5) return 'moderate';
  return 'mild';
}

function mapAbilityToContinue(a) {
  const sx = joinLower(a.symptoms);
  if ((a.redFlags || []).length || /cannot bear|unable to walk|cannot walk/.test(sx)) return 'no';
  if ((a.painSport ?? 0) >= 7 || (a.painWalking ?? 0) >= 6) return 'no';
  if ((a.painSport ?? 0) >= 4) return 'limited';
  return 'yes';
}

function mapResponseFromPain(level) {
  if (level >= 6) return 'unable';
  if (level >= 3) return 'painful';
  if (level >= 1) return 'mild';
  return 'none';
}

function mapBruising(a) {
  const sx = joinLower(a.symptoms);
  if (/significant brui|large brui|spreading|marked swelling/.test(sx)) return 'significant';
  if (/brui|swell/.test(sx)) return 'some';
  return 'none';
}

function mapWeakness(a) {
  const sx = joinLower(a.symptoms);
  if (/giving way|instability|cannot straighten|marked weak/.test(sx)) return 'marked';
  if (/weak/.test(sx)) return 'mild';
  return 'none';
}

function mapRedFlags(a) {
  const flags = {};
  for (const f of a.redFlags || []) flags[String(f).toLowerCase().replace(/\s+/g, '_')] = true;
  return flags;
}

function mapEquipment(a) {
  const out = ['bodyweight'];
  for (const e of a.equipment || []) {
    const v = String(e).toLowerCase();
    if (/band/.test(v)) out.push('band');
    if (/dumbbell|barbell|gym|machine|weight/.test(v)) out.push('gym');
    if (/bike/.test(v)) out.push('bike');
    if (/bench/.test(v)) out.push('bench');
  }
  return [...new Set(out)];
}

/**
 * @param {object} a legacy app assessment
 * @returns {object} rfAssessmentInput
 */
export function mapAssessmentToRfInput(a = {}) {
  const sx = joinLower(a.symptoms);
  // The assessment form writes `sport` (string); older state used `sports` (array).
  // Accept either so the user's sport actually reaches the engine.
  const sportValue = a.sport || (Array.isArray(a.sports) && a.sports[0]) || '';
  return {
    pain_location: mapPainLocation(a),
    mechanism: mapMechanism(a),
    sport_context: sportValue || 'unspecified',
    ability_to_continue: mapAbilityToContinue(a),
    walking_response: mapResponseFromPain(a.painWalking ?? 0),
    stairs_response: mapResponseFromPain(Math.max(a.painWalking ?? 0, (a.painSport ?? 0) - 2)),
    hip_flexion_response: /hip flex|kicking|lifting/.test(sx) ? 'painful' : (a.painSport >= 4 ? 'mild' : 'unsure'),
    knee_extension_response: /straighten|extension|kick/.test(sx) ? 'painful' : (a.painSport >= 6 ? 'painful' : 'mild'),
    pain_severity_label: mapPainSeverity(a),
    bruising_or_swelling: mapBruising(a),
    weakness_or_giving_way: mapWeakness(a),
    red_flag_answers: mapRedFlags(a),
    previous_injury: a.previousInjury === true || /previous|again|recurr|second time/.test((a.story || '').toLowerCase()),
    reported_fibrosis_or_scar_history: /scar|fibros|lump|knot/.test((a.story || '').toLowerCase()) ? 'reported' : 'none',
    equipment_available: mapEquipment(a),
    training_goal: sportValue ? `return_to_${String(sportValue).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}` : 'general_return',
    confidence_in_answers: 'somewhat',
    days_since_injury: typeof a.daysSince === 'number' ? a.daysSince : 7,
  };
}
