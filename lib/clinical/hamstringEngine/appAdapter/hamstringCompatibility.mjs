/**
 * lib/clinical/hamstringEngine/appAdapter/hamstringCompatibility.mjs
 * ---------------------------------------------------------------------------
 * Route detection: does this assessment belong to the hamstring engine?
 * True when the primary region is the hamstrings (the anatomy selector's
 * 'hamstring' region and its biceps femoris / semitendinosus / semimembranosus
 * sub-areas). Everything else is left to its existing engine / legacy path.
 * ---------------------------------------------------------------------------
 */

const HAMSTRING_AREAS = new Set([
  'biceps_femoris_long', 'biceps_femoris', 'semitendinosus', 'semimembranosus',
  'back_biceps_femoris', 'back_semitendinosus', 'back_semimembranosus', 'hamstring_general',
]);

export function hamstringRouteFor(a = {}) {
  const region = (a.primaryRegion || '').toLowerCase();
  if (region === 'hamstring' || region === 'hamstrings') return 'hamstring';
  const exact = (a.exactArea || '').toLowerCase();
  if (HAMSTRING_AREAS.has(exact)) return 'hamstring';
  return null;
}
