/**
 * lib/clinical/kneeEngine/appAdapter/kneeCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether a "knee" region selection should use the knee engine.
 *
 * The extensor-mechanism tendons (patellar / quad tendon) already route to the
 * quad engine via quadCompatibility.quadRouteFor, which matches on exactArea
 * regardless of primaryRegion — so callers must check quadRouteFor() FIRST and
 * only fall through to the knee engine when it returns null. Every other knee
 * selection (ligaments, meniscus, patellofemoral, OA, ITB, Osgood-Schlatter,
 * or an unsure/general knee tap) uses the knee engine.
 *
 * Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, exactArea, ... }
 * @returns {'knee'|null}
 */
export function kneeRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  if (region !== 'knee') return null;
  return 'knee';
}

/** Convenience boolean. */
export function isKneeEngineInjury(a = {}) { return kneeRouteFor(a) === 'knee'; }
