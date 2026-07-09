/**
 * lib/clinical/core/deficitEmphasis.mjs
 * ---------------------------------------------------------------------------
 * The personalization layer. Turns the athlete's specific deficits / readiness
 * (from assessment answers) into TILTS on the base phase×block emphasis matrix,
 * plus dose caps, selection hints, and a progression modifier.
 *
 * This is what makes two same-grade athletes get different sessions — and it is
 * the concrete consumer of the field-effect contract's "must reach rehab"
 * fields (single-leg control, Ely, sprint/kick tolerance, movement confidence…).
 * ---------------------------------------------------------------------------
 */
import { PHASE_BLOCK_MATRIX } from './sessionArchitecture.mjs';

const oneOf = (v, ...vals) => vals.includes(v);

/**
 * Normalize raw assessment answers into a compact deficit/readiness profile.
 * Tolerant of missing fields (returns 'unknown'/false so nothing is fabricated).
 * @param {object} input
 */
export function normalizeDeficitProfile(input = {}) {
  const st = input.rf_self_tests || {};
  return {
    motor_control_deficit: oneOf(input.single_leg_control, 'poor', 'unable') || st.single_leg_control === 'poor',
    mobility_deficit:
      oneOf(input.ely_test, 'positive', 'tight') ||
      oneOf(input.knee_flexion_response, 'painful', 'limited'),
    strength_deficit: oneOf(input.weakness_or_giving_way, 'mild', 'marked'),
    loading_tolerance:
      oneOf(input.knee_extension_response, 'unable') ? 'low'
      : oneOf(input.knee_extension_response, 'painful') || oneOf(input.resisted_hip_flexion, 'painful') ? 'moderate'
      : 'ok',
    irritability:
      oneOf(input.next_day_response, 'much_worse') || oneOf(input.pain_at_rest, 'significant', 'severe') ? 'high'
      : oneOf(input.next_day_response, 'worse') || oneOf(input.pain_at_rest, 'mild', 'some') ? 'moderate'
      : 'low',
    sport_readiness:
      oneOf(input.sprint_tolerance, 'ok', 'full') ? 'ready'
      : oneOf(input.sprint_tolerance, 'painful', 'limited') || oneOf(input.kick_tolerance, 'painful', 'limited') ? 'low'
      : 'partial',
    psychological_readiness: oneOf(input.movement_confidence, 'low', 'fearful') ? 'low' : 'ok',
  };
}

/**
 * Compute emphasis tilts + dose/selection/progression modifiers from a profile.
 * Tilts are integer deltas applied to the base matrix row (clamped later).
 * @returns {{ tilts:object, doseCaps:object, selection:string[], progression:object, rationale:string[] }}
 */
export function deficitEmphasisTilts(profile) {
  const tilts = {};
  const selection = [];
  const rationale = [];
  const doseCaps = {};
  const progression = { pace: 'normal', holdReasons: [] };

  const bump = (block, d, why) => { tilts[block] = (tilts[block] || 0) + d; rationale.push(why); };

  if (profile.motor_control_deficit) bump('motor_control', +1, 'Poor single-leg control → emphasise motor control/balance.');
  if (profile.mobility_deficit) { bump('activation', +1, 'Mobility deficit (Ely/flexion) → emphasise mobility/activation.'); selection.push('rf_mobility', 'eccentric_lengthening'); }
  if (profile.strength_deficit) bump('strength_support', +1, 'Weakness → emphasise strength/kinetic-chain.');

  if (profile.loading_tolerance === 'low') { doseCaps.main_loading = 'isometric_only'; progression.pace = 'slow'; progression.holdReasons.push('Very low loading tolerance.'); }
  else if (profile.loading_tolerance === 'moderate') doseCaps.main_loading = 'submax';

  if (profile.irritability === 'high') { doseCaps.session_volume = 'reduced'; progression.pace = 'slow'; progression.holdReasons.push('High irritability (rest/next-day pain).'); }
  else if (profile.irritability === 'moderate') doseCaps.session_volume = 'moderate';

  if (profile.sport_readiness === 'low') { doseCaps.sport_reintegration = 'withhold_high_speed'; selection.push('low_speed_running_only'); rationale.push('Low sprint/kick tolerance → cap high-speed sport work.'); }
  else if (profile.sport_readiness === 'ready') selection.push('progress_high_speed');

  if (profile.psychological_readiness === 'low') { progression.pace = progression.pace === 'slow' ? 'slow' : 'cautious'; progression.holdReasons.push('Low movement confidence → gate RTS on psychological readiness.'); selection.push('graded_exposure'); }

  return { tilts, doseCaps, selection, progression, rationale };
}

/**
 * Apply tilts to a base phase emphasis row. Clamps to [0,3]. A block that is
 * absent this phase (base 0) stays absent — deficits cannot switch on sport in
 * an early phase (safety gate preserved).
 */
export function applyEmphasisTilts(phase, tilts) {
  const base = PHASE_BLOCK_MATRIX[phase];
  if (!base) throw new Error(`Unknown phase: ${phase}`);
  const out = {};
  for (const [block, emph] of Object.entries(base)) {
    if (emph === 0) { out[block] = 0; continue; }          // hard gate: stays off
    const tilted = emph + (tilts[block] || 0);
    out[block] = Math.max(1, Math.min(3, tilted));         // present block stays present, clamp 1..3
  }
  return out;
}

/** Convenience: full personalization for a phase from raw input. */
export function personalizeEmphasis(phase, input) {
  const profile = normalizeDeficitProfile(input);
  const tilt = deficitEmphasisTilts(profile);
  return { profile, ...tilt, emphasis: applyEmphasisTilts(phase, tilt.tilts) };
}
