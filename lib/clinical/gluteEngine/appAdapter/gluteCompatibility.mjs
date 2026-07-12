/**
 * lib/clinical/gluteEngine/appAdapter/gluteCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether a glutes-region selection should use the glute engine.
 * Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, ... }
 * @returns {'glutes'|null}
 */
export function gluteRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  return region === 'glutes' ? 'glutes' : null;
}

export function isGluteEngineInjury(a = {}) { return gluteRouteFor(a) === 'glutes'; }
