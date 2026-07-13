/**
 * lib/clinical/core/recoveryWording.mjs
 * ---------------------------------------------------------------------------
 * Reconciles the headline "expected return" with the plan's REAL total
 * (sum of every phase's real weeks) — used by every engine's
 * *OutputToProfile.mjs adapter.
 *
 * Before this, the headline showed a raw clinical estimate (e.g. "1-3
 * weeks" for a mild strain) completely independent of the plan underneath
 * it, which could show a 4+ week total once every phase got its real
 * >=1-week allocation — an internally-contradictory plan. The plan's real
 * total is now always the primary number; the raw clinical estimate (how
 * long PAIN typically takes to settle, which is often shorter than a full
 * return-to-sport progression) is kept as a secondary note when it differs.
 * ---------------------------------------------------------------------------
 */

/**
 * @param {number|null} totalWeeks   plan.total_estimated_weeks (real, summed)
 * @param {string|null} prognosis    the raw clinical estimate text (e.g. "1-3 weeks")
 * @returns {{ returnRange: string, rfRecoveryWording: string, recoverySecondaryNote: string|null }}
 */
export function describeRecoveryTimeline(totalWeeks, prognosis) {
  if (!totalWeeks) {
    return {
      returnRange: prognosis || 'Varies — clinician review',
      rfRecoveryWording: prognosis ? `Estimated recovery: ${prognosis}.` : '',
      recoverySecondaryNote: null,
    };
  }

  const planWeeksText = `~${totalWeeks} week${totalWeeks > 1 ? 's' : ''}`;
  const prognosisDiffers = !!prognosis && !prognosis.includes(String(totalWeeks));
  const secondaryNote = prognosisDiffers
    ? `Clinical estimate for this pattern: ${prognosis}. The full return-to-sport programme below runs ${planWeeksText} so every stage gets real content.`
    : null;

  return {
    returnRange: `${planWeeksText} full programme`,
    // Kept separate from recoverySecondaryNote (not appended here) so callers
    // that render both don't duplicate the same sentence twice on screen.
    rfRecoveryWording: `Full return-to-sport programme: ${planWeeksText}.`,
    recoverySecondaryNote: secondaryNote,
  };
}
