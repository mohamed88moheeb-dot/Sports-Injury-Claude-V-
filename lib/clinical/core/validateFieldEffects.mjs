/**
 * lib/clinical/core/validateFieldEffects.mjs
 * ---------------------------------------------------------------------------
 * Enforces the "no dead inputs" contract over a field-effect registry.
 * Returns structured errors/warnings + a coverage report. Intended to run in
 * CI / the test suite so the invariant can never silently regress.
 * ---------------------------------------------------------------------------
 */
import { ENGINES, EFFECT_TYPES, CATEGORIES, REHAB_REQUIRED_CATEGORIES } from './fieldEffectContract.mjs';

const ALL_EFFECT_TYPES = new Set([...EFFECT_TYPES.diagnosis, ...EFFECT_TYPES.rehab]);

/**
 * @param {Array} registry - list of { field, label, category, effects[] }
 * @returns {{ ok:boolean, errors:string[], warnings:string[], coverage:object }}
 */
export function validateFieldEffects(registry) {
  const errors = [];
  const warnings = [];
  const seen = new Set();

  let totalEffects = 0, wiredEffects = 0;
  const unwiredFields = [];

  for (const entry of registry) {
    const { field, category, effects } = entry;

    if (!field) { errors.push('A registry entry is missing `field`.'); continue; }
    if (seen.has(field)) errors.push(`Duplicate field in registry: "${field}".`);
    seen.add(field);

    if (!CATEGORIES.includes(category))
      errors.push(`"${field}": unknown category "${category}".`);

    // Rule 1 — no orphan.
    if (!Array.isArray(effects) || effects.length === 0) {
      errors.push(`"${field}": ORPHAN — declares no effect on any engine. Every asked field must drive diagnosis or rehab.`);
      continue;
    }

    let hasRehab = false, hasDiagnosis = false;
    for (const e of effects) {
      totalEffects++;
      if (e.wired) wiredEffects++;
      if (!ENGINES.includes(e.engine))
        errors.push(`"${field}": effect has invalid engine "${e.engine}".`);
      if (!ALL_EFFECT_TYPES.has(e.type))
        errors.push(`"${field}": effect has invalid type "${e.type}".`);
      if (e.engine === 'diagnosis' && !EFFECT_TYPES.diagnosis.includes(e.type))
        errors.push(`"${field}": type "${e.type}" is not a diagnosis effect.`);
      if (e.engine === 'rehab' && !EFFECT_TYPES.rehab.includes(e.type))
        errors.push(`"${field}": type "${e.type}" is not a rehab effect.`);
      if (e.engine === 'rehab') hasRehab = true;
      if (e.engine === 'diagnosis') hasDiagnosis = true;
    }

    // Rule 2 — no misrouting: state-describing fields must reach rehab.
    if (REHAB_REQUIRED_CATEGORIES.includes(category) && !hasRehab) {
      errors.push(`"${field}": MISROUTED — category "${category}" describes the athlete's changeable state but has no REHAB effect (it only informs diagnosis/confidence). It must shape the programme.`);
    }

    // Coverage bookkeeping — declared-but-not-yet-consumed effects.
    const unwired = effects.filter((e) => !e.wired);
    if (unwired.length) unwiredFields.push({ field, category, pending: unwired.map((e) => `${e.engine}:${e.type}→${e.target}`) });

    if (!hasRehab && !hasDiagnosis)
      errors.push(`"${field}": declares effects but none map to a known engine.`);
  }

  const coverage = {
    fields: registry.length,
    effects: totalEffects,
    wired: wiredEffects,
    pending: totalEffects - wiredEffects,
    wiredPct: totalEffects ? Math.round((wiredEffects / totalEffects) * 100) : 0,
    unwiredFields,
  };

  return { ok: errors.length === 0, errors, warnings, coverage };
}
