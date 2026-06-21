/**
 * lib/clinical/rfBetaAppAdapter/rfBetaCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Detects whether the current app injury selection is Rectus Femoris /
 * anterior-thigh compatible (and so should use the RF beta engine). Pure,
 * browser-safe, imports nothing — keeps the legacy path untouched for all
 * other regions.
 * ---------------------------------------------------------------------------
 */

const RF_REGIONS = new Set(['quadriceps']);
const RF_EXACT_AREA = /rectus|front.*thigh|anterior.*thigh|front_thigh/i;

/**
 * @param {object} assessment legacy app assessment ({ primaryRegion, exactArea, ... })
 * @returns {boolean}
 */
export function isRfCompatible(assessment = {}) {
  const region = (assessment.primaryRegion || '').toLowerCase();
  const exact = (assessment.exactArea || '').toLowerCase();
  if (RF_REGIONS.has(region)) return true;
  if (RF_EXACT_AREA.test(exact)) return true;
  return false;
}
