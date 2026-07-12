/**
 * lib/clinical/groinEngine/appAdapter/groinCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether an adductor_groin-region selection should use the groin
 * engine. Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, ... }
 * @returns {'groin'|null}
 */
export function groinRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  return region === 'adductor_groin' ? 'groin' : null;
}

export function isGroinEngineInjury(a = {}) { return groinRouteFor(a) === 'groin'; }
