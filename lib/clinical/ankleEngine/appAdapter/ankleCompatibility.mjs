/**
 * lib/clinical/ankleEngine/appAdapter/ankleCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether an ankle-region selection should use the ankle engine.
 * The 'ankle' anatomy region has no overlapping entity in any other engine,
 * so this is a simple region check. Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, ... }
 * @returns {'ankle'|null}
 */
export function ankleRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  return region === 'ankle' ? 'ankle' : null;
}

export function isAnkleEngineInjury(a = {}) { return ankleRouteFor(a) === 'ankle'; }
