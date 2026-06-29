/**
 * lib/clinical/quadEngine/appAdapter/quadCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides which engine a quadriceps-region selection should use:
 *   - rectus femoris / generic anterior thigh  -> RF beta engine (unchanged)
 *   - vastus L/M/I, contusion, tendinopathy, rupture -> quad engine
 *   - anything else -> legacy path
 *
 * Pure + browser-safe (imports nothing). Keeps the RF path and all other
 * regions untouched; only NON-rectus quadriceps selections are newly routed to
 * the quad engine.
 * ---------------------------------------------------------------------------
 */

const RF_EXACT = /rectus|front[_\s-]*thigh[_\s-]*middle|front.*centre|front.*center/i;
const VASTUS_EXACT = /vastus|vmo|outer.*thigh|inner.*thigh|lateral.*thigh|medial.*thigh|deep.*thigh/i;
const TENDON_EXACT = /tendon|patellar|jumper|kneecap/i;

/**
 * @param {object} a legacy assessment { primaryRegion, exactArea, mechanism, ... }
 * @returns {'rf'|'quad'|null}
 */
export function quadRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  const exact = (a.exactArea || '').toLowerCase();
  const mech = (a.mechanism || '').toLowerCase();

  // The knee-extensor mechanism (quadriceps tendon above the patella + patellar
  // tendon below it) spans the app's "quadriceps" and "knee" regions. Route
  // these tendons to the quad engine regardless of which region they were filed
  // under, so patellar tendinopathy / rupture are reachable.
  if (/quad_tendon|quadriceps_tendon|patellar_tendon/.test(exact)) return 'quad';

  if (region !== 'quadriceps') return null; // not our region

  // Rectus femoris stays with the dedicated, deeper RF engine.
  if (RF_EXACT.test(exact)) return 'rf';

  // Explicit non-RF quad structures -> quad engine.
  if (VASTUS_EXACT.test(exact) || TENDON_EXACT.test(exact)) return 'quad';

  // Mechanism-driven entities that are clearly not an RF strain.
  if (/impact|blow|collision|contact|dead\s*leg/.test(mech)) return 'quad'; // contusion

  // Generic "quadriceps" with no muscle chosen: keep RF (it is the safest,
  // deepest default for anterior-thigh) unless mechanism says otherwise.
  if (!exact) return 'rf';

  // Any other named quad area -> quad engine.
  return 'quad';
}

/** Convenience booleans. */
export function isQuadEngineInjury(a = {}) { return quadRouteFor(a) === 'quad'; }
export function isRfEngineInjury(a = {}) { return quadRouteFor(a) === 'rf'; }
