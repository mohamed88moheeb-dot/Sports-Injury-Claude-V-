/**
 * lib/clinical/lowerBackEngine/appAdapter/lowerBackCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether a lower_back-region selection should use the lower back
 * engine. Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, ... }
 * @returns {'lower_back'|null}
 */
export function lowerBackRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  return region === 'lower_back' ? 'lower_back' : null;
}

export function isLowerBackEngineInjury(a = {}) { return lowerBackRouteFor(a) === 'lower_back'; }
