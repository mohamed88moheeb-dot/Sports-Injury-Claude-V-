/**
 * data/injuryKnowledge/index.js
 * ---------------------------------------------------------------------------
 * Aggregates all injury knowledge files into a single registry and exposes
 * small lookup helpers used by the engines (lib/injuryEngine/*).
 *
 * This module is the ONLY entry point the engines import from, so adding a new
 * injury category later is a one-line change here.
 *
 * Region ids intentionally match the existing rehabKnowledge.js region ids
 * ('hamstring', 'quadriceps', 'calf_shin', 'adductor_groin', 'ankle', 'knee')
 * so the new engine can be wired into the existing assessment UI later without
 * renaming anything.
 * ---------------------------------------------------------------------------
 */

import hamstring from './hamstring';
import adductorGroin from './adductorGroin';
import quadriceps from './quadriceps';
import calfAchillesShin from './calfAchillesShin';
import ankle from './ankle';
import knee from './knee';

export {
  GLOBAL_RED_FLAGS,
  CONFIDENCE_BANDS,
  RISK_LEVELS,
  ADAPTATION_ACTIONS,
  DISCLAIMER,
  getConfidenceBand,
  maxRisk
} from './shared';

/* All injury models, keyed by region id. */
export const injuryKnowledge = {
  hamstring,
  quadriceps,
  calf_shin: calfAchillesShin,
  adductor_groin: adductorGroin,
  ankle,
  knee
};

/* Ordered list (useful for iteration / building menus). */
export const injuryRegionsList = [
  hamstring,
  adductorGroin,
  quadriceps,
  calfAchillesShin,
  ankle,
  knee
];

/* -------------------------------------------------------------------------
 * LOOKUP HELPERS
 * ------------------------------------------------------------------------- */

/** Get the full knowledge model for a region id, or null. */
export function getRegionKnowledge(regionId) {
  return injuryKnowledge[regionId] || null;
}

/** Find a subtype object (with its region id) by subtype id, or null. */
export function getSubtypeById(subtypeId) {
  for (const region of injuryRegionsList) {
    const found = region.injurySubtypes.find((s) => s.id === subtypeId);
    if (found) return { ...found, regionId: region.id };
  }
  return null;
}

/** Get the rehab protocol that applies to a given subtype, or null. */
export function getProtocolForSubtype(regionId, subtypeId) {
  const region = getRegionKnowledge(regionId);
  if (!region) return null;
  const subtype = region.injurySubtypes.find((s) => s.id === subtypeId);
  if (!subtype) return null;
  return (
    region.rehabProtocols.find(
      (p) =>
        p.id === subtype.rehabPathway ||
        (p.appliesToSubtypes || []).includes(subtypeId)
    ) || null
  );
}

/** Resolve an exercise object by id within a region, or null. */
export function getExerciseById(regionId, exerciseId) {
  const region = getRegionKnowledge(regionId);
  if (!region) return null;
  return region.exerciseLibrary.find((e) => e.id === exerciseId) || null;
}

/** Return true if the region id is supported by the new engine. */
export function isRegionSupported(regionId) {
  return Boolean(injuryKnowledge[regionId]);
}
