/**
 * lib/clinical/rfBetaEngine/rfAlternativeMapper.mjs
 * ---------------------------------------------------------------------------
 * Resolves easier/harder/related alternatives for an exercise using its own
 * display-only labels plus the eligible-exercise pool for the phase. Labels are
 * matched to other eligible RF-EX user_facing_name within the same phase. All
 * alternatives are beta defaults and never carry progression/clearance authority.
 * ---------------------------------------------------------------------------
 */

import { BETA_META } from './types.mjs';

/**
 * @param {object} exObj            the RF-EX object
 * @param {object[]} eligiblePool   RF-EX objects eligible/selected for the phase
 */
export function resolveAlternatives(exObj, eligiblePool) {
  const byName = new Map();
  for (const e of eligiblePool) {
    if (e && e.user_facing_name) byName.set(e.user_facing_name.toLowerCase(), e.exercise_id);
  }
  const map = (labels) =>
    (labels || []).map((label) => ({
      label,
      resolved_rf_ex_id: byName.get(String(label).toLowerCase()) || null
    }));

  return {
    easier: map(exObj.easier_option_labels),
    harder: map(exObj.harder_option_labels),
    related: map(exObj.related_exercise_labels),
    note: 'Display-only alternatives. Swapping is a beta convenience, not a progression decision.',
    ...BETA_META
  };
}
