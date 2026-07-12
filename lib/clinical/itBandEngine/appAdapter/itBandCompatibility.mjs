/**
 * lib/clinical/itBandEngine/appAdapter/itBandCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether an it_band-region selection should use the IT band engine.
 * Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, ... }
 * @returns {'it_band'|null}
 */
export function itBandRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  return region === 'it_band' ? 'it_band' : null;
}

export function isItBandEngineInjury(a = {}) { return itBandRouteFor(a) === 'it_band'; }
