/**
 * lib/clinical/calfEngine/appAdapter/calfCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether a calf_shin-region selection should use the calf engine.
 * Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, ... }
 * @returns {'calf'|null}
 */
export function calfRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  return region === 'calf_shin' ? 'calf' : null;
}

export function isCalfEngineInjury(a = {}) { return calfRouteFor(a) === 'calf'; }
