/**
 * lib/clinical/kneeEngine/appAdapter/kneeCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether a knee-region selection should use the knee engine.
 *   - knee region (ACL/PCL/MCL/LCL/meniscus/PFPS/instability/OA/ITB/OSD) -> knee
 *   - extensor-mechanism tendons (patellar/quad tendon) -> handled by the quad
 *     engine (quadRouteFor runs first in generateProfile), so we exclude them.
 *   - anything else -> legacy path
 *
 * Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

const EXTENSOR_TENDON = /quad_tendon|quadriceps_tendon|patellar_tendon/;

/**
 * @param {object} a legacy assessment { primaryRegion, exactArea, mechanism, ... }
 * @returns {'knee'|null}
 */
export function kneeRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  const exact = (a.exactArea || '').toLowerCase();

  // Extensor-mechanism tendons are the quad engine's job.
  if (EXTENSOR_TENDON.test(exact)) return null;

  if (region !== 'knee') return null;
  return 'knee';
}

export function isKneeEngineInjury(a = {}) { return kneeRouteFor(a) === 'knee'; }
