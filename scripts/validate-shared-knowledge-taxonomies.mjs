#!/usr/bin/env node
/**
 * scripts/validate-shared-knowledge-taxonomies.mjs
 * ---------------------------------------------------------------------------
 * SHARED KNOWLEDGE TAXONOMIES VALIDATION (structural, NON-EXECUTABLE, NOT approval)
 *
 * Validates the shared metadata vocabularies under
 * lib/clinical/sharedKnowledgeTaxonomies/. Treats each file as inert JSON data
 * (never import()-ed or evaluated). Confirms required files exist; each carries
 * approval_status:pending, executable:false, runtime_integration:none, and a
 * non-empty `categories`; and that no file asserts ACTIVE dosage, progression,
 * readiness, or clearance authority.
 *
 * Note: these taxonomies legitimately NAME concepts such as "progression",
 * "readiness_gate", or "return_to_sport_gate" as vocabulary entries. Those names
 * are allowed. What is prohibited is ACTIVE authority — dosage KEYS (sets/reps/…),
 * numeric dose/time values, and keys that ASSERT a clearance/progression/readiness
 * decision (e.g. authorizes_clearance:true).
 *
 * Uses only built-in Node modules.
 * ---------------------------------------------------------------------------
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, join } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const TAX_DIR = resolve(REPO_ROOT, 'lib/clinical/sharedKnowledgeTaxonomies');

const REQUIRED_FILES = [
  'exerciseFunctionTaxonomy.json',
  'contractionTaxonomy.json',
  'exerciseIntentTaxonomy.json',
  'movementPatternTaxonomy.json',
  'sportDemandTaxonomy.json',
  'equipmentTaxonomy.json',
  'activityExposureTaxonomy.json',
  'assessmentPurposeTaxonomy.json',
  'rehabPlanBlockTaxonomy.json',
  'rehabCompositionModel.json',
];

// Prohibited ACTIVE-authority key patterns (not mere vocabulary mentions).
const PROHIBITED_KEY_PATTERNS = [
  { label: 'active dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|duration|dosage|fixed_dose)$/i },
  { label: 'progression increment', re: /progression_increment|fixed_(sets|reps|dose|dosage)/i },
  { label: 'fixed return date', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return/i },
  { label: 'asserts clearance/progression/readiness authority', re: /(authori[sz]es?|grants?|creates?|generates?)_(clearance|rts|rtt|return_to_(sport|training|play)|progression|readiness|dose|dosage|plan)/i },
];
// Prohibited dose/timeline VALUE patterns inside strings.
const DOSE_VALUE_RE = /\b\d+\s*(sets?|reps?|repetitions?|x)\b/i;
const TIME_VALUE_RE = /\b\d{4}-\d{2}-\d{2}\b|\b\d+\s*(seconds?|secs?|minutes?|mins?|hours?|days?|weeks?|months?)\b/i;

const errors = [];
const err = (m) => errors.push(m);
const rel = (p) => relative(REPO_ROOT, p);

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }

function walk(node, visit, path = '') {
  if (Array.isArray(node)) node.forEach((v, i) => walk(v, visit, `${path}[${i}]`));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const kp = path ? `${path}.${k}` : k;
      visit(k, v, kp);
      walk(v, visit, kp);
    }
  }
}

let loaded = 0;
for (const name of REQUIRED_FILES) {
  const p = join(TAX_DIR, name);
  if (!existsSync(p)) { err(`Missing taxonomy file: ${rel(p)}`); continue; }
  let t;
  try { t = readJson(p); } catch (e) { err(`${rel(p)}: invalid JSON — ${e.message}`); continue; }
  loaded++;

  if (t.approval_status !== 'pending') err(`${rel(p)}: approval_status must be "pending".`);
  if (t.executable !== false) err(`${rel(p)}: executable must be false.`);
  if (t.runtime_integration !== 'none') err(`${rel(p)}: runtime_integration must be "none".`);
  if (!Array.isArray(t.categories) || t.categories.length === 0) err(`${rel(p)}: categories must be a non-empty array.`);

  walk(t, (k, v, kp) => {
    for (const pat of PROHIBITED_KEY_PATTERNS) {
      if (pat.re.test(k)) err(`${rel(p)}: prohibited ${pat.label} key "${kp}".`);
    }
    if (typeof v === 'string') {
      if (DOSE_VALUE_RE.test(v)) err(`${rel(p)}: prohibited active dose value in "${kp}".`);
      if (TIME_VALUE_RE.test(v)) err(`${rel(p)}: prohibited time/dose-timeline value in "${kp}".`);
    }
  });
}

if (errors.length > 0) {
  console.error('\n✖ Shared Knowledge Taxonomies validation FAILED\n');
  for (const e of errors) console.error(`  • ${e}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

console.log('Shared Knowledge Taxonomies validation PASS');
console.log(`Taxonomy files found: ${loaded} / ${REQUIRED_FILES.length}`);
console.log('All pending, non-executable, runtime_integration none, non-empty categories');
console.log('No active dosage, progression, readiness, or clearance authority found');
process.exit(0);
