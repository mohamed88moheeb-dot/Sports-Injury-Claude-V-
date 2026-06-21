/**
 * lib/clinical/rfBetaEngine/rfKnowledgeLoader.mjs
 * ---------------------------------------------------------------------------
 * Loads governed RF knowledge from disk (the evidence-backed rule pack + the
 * RF-EX / RF-ACT objects) via fs. It deliberately READS JSON rather than
 * importing it, and imports NO legacy module — so the quarantine boundary
 * check stays clean and no knowledge object is ever mutated.
 * ---------------------------------------------------------------------------
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const RULE_PACK_REL = 'rfPrescriptionRules/rf/RF_PRESCRIPTION_RULE_PACK_V1.json';

/**
 * Resolve the lib/clinical base directory robustly. The engine is used three
 * ways: (1) direct `node scripts/...` (cwd = repo root), (2) Next dev server,
 * (3) Next build/start (route bundled into .next). We try cwd-relative first
 * (stable for next dev/start), then module-relative (stable for direct node).
 */
function resolveClinicalBase() {
  const candidates = [join(process.cwd(), 'lib/clinical'), join(HERE, '..')];
  for (const base of candidates) {
    if (existsSync(join(base, RULE_PACK_REL))) return base;
  }
  return join(HERE, '..'); // last resort; reads will surface a clear error
}

const CLINICAL = resolveClinicalBase(); // lib/clinical
const RULE_PACK_PATH = join(CLINICAL, RULE_PACK_REL);
const EX_DIR = join(CLINICAL, 'exerciseKnowledge/rf/objects');
const ACT_DIR = join(CLINICAL, 'activityExposureKnowledge/rf/objects');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

let _rulePack = null;
export function getRulePack() {
  if (!_rulePack) _rulePack = readJson(RULE_PACK_PATH);
  return _rulePack;
}

const _exCache = new Map();
export function loadExercise(id) {
  if (_exCache.has(id)) return _exCache.get(id);
  const p = join(EX_DIR, `${id}.json`);
  const obj = existsSync(p) ? readJson(p) : null;
  _exCache.set(id, obj);
  return obj;
}

const _actCache = new Map();
export function loadActivity(id) {
  if (_actCache.has(id)) return _actCache.get(id);
  const p = join(ACT_DIR, `${id}.json`);
  const obj = existsSync(p) ? readJson(p) : null;
  _actCache.set(id, obj);
  return obj;
}

/** exercise_family_mapping entries for a given phase id. */
export function exerciseMappingForPhase(phaseId) {
  return getRulePack().exercise_family_mapping.filter((m) => m.phase === phaseId);
}

/** activity_exposure_mapping entries whose phase_or_review_state mentions a phase id. */
export function activityMappingForPhase(phaseId) {
  return getRulePack().activity_exposure_mapping.filter(
    (a) => typeof a.phase_or_review_state === 'string' && a.phase_or_review_state.includes(phaseId)
  );
}

export function phaseRule(phaseId) {
  return getRulePack().phase_model.find((p) => p.phase_id === phaseId) || null;
}

export const ACTIVITY_EXPOSURE_STATEMENT =
  'Activity exposure expresses capacity. It does not clear the athlete.';
