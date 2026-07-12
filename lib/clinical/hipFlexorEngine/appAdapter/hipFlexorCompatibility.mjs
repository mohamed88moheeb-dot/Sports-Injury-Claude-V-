/**
 * lib/clinical/hipFlexorEngine/appAdapter/hipFlexorCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Decides whether a hip_flexor-region selection should use the hip flexor
 * engine. Pure + browser-safe (imports nothing).
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} a legacy assessment { primaryRegion, ... }
 * @returns {'hip_flexor'|null}
 */
export function hipFlexorRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  return region === 'hip_flexor' ? 'hip_flexor' : null;
}

export function isHipFlexorEngineInjury(a = {}) { return hipFlexorRouteFor(a) === 'hip_flexor'; }
