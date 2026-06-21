#!/usr/bin/env node
/**
 * scripts/validate-rf-rule-package.mjs
 * ---------------------------------------------------------------------------
 * RF RULE-OBJECT VALIDATION SCAFFOLD (structural, NON-EXECUTABLE, NOT approval)
 *
 * Validates the SHAPE, PROVENANCE, STATUS DISCIPLINE, and PROHIBITED-FIELD
 * patterns of the Gate B RF rule-package authoring workspace. It does NOT
 * validate clinical correctness, does NOT execute any rule, and treats every
 * rule object as inert JSON data (never `import()`-ed or evaluated).
 *
 * Checks:
 *   1. Package status (rfRulePackageStatus.json): not approved, executable:false,
 *      rule_objects_approved: 0.
 *   2. Template (rfRuleObjectTemplate.json): still blank/non-executable.
 *   3. Authored objects under lib/clinical/rf/rules/objects/ (if any): required
 *      keys, status discipline, provenance formats, and prohibited-field absence.
 *
 * Uses only built-in Node modules. Imports nothing from the app or from any
 * quarantined legacy module.
 * ---------------------------------------------------------------------------
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, join, extname } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');

const RULES_DIR = resolve(REPO_ROOT, 'lib/clinical/rf/rules');
const STATUS_PATH = join(RULES_DIR, 'rfRulePackageStatus.json');
const TEMPLATE_PATH = join(RULES_DIR, 'rfRuleObjectTemplate.json');
const OBJECTS_DIR = join(RULES_DIR, 'objects');

const REQUIRED_KEYS = [
  'rule_id',
  'rule_family',
  'source_spec_rule_id',
  'approval_status',
  'permitted_use',
  'architecture_refs',
  'evidence_claim_ids',
  'input_contract',
  'decision_contract',
  'safety_state_output',
  'blocked_targets',
  'prohibited_outputs',
  'test_fixtures',
  'notes',
];

const ALLOWED_APPROVAL_STATUS = new Set(['pending', 'rejected', 'superseded']);
const RF_RULE_ID_RE = /^RF-[A-Z]+-\d{3}$/;
const QRF_ID_RE = /^QRF-\d{3}$/;
const ISO_DATE_RE = /\b\d{4}-\d{2}-\d{2}\b/;
const RELATIVE_DURATION_RE = /\b\d+\s*(days?|weeks?)\b/i;

// Prohibited key patterns (matched case-insensitively against every key name,
// anywhere in the object tree).
const PROHIBITED_KEY_PATTERNS = [
  { label: 'numeric confidence', re: /(^|_)(numeric|percent|percentage|pct|score)_?confidence/i },
  { label: 'numeric confidence', re: /confidence_(value|score|percent|percentage|numeric|number|pct)/i },
  { label: 'universal dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|dosage|fixed_dose)$/i },
  { label: 'universal dosage', re: /progression_increment|fixed_(sets|reps|dose|dosage)/i },
  { label: 'fixed RTS date', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return/i },
  // diagnosis-authorizes-plan — explicit, covers US/UK spelling (authorize/authorise)
  // and z/s variants for both the "...izes/ises_plan|rehab" and "auto_author...e_plan" forms.
  { label: 'diagnosis-authorizes-plan', re: /diagnosis_author(?:i[sz]es|i[sz]e)_(?:plan|rehab)/i },
  { label: 'diagnosis-authorizes-plan', re: /auto_author(?:i[sz]e)_plan/i },
  { label: 'diagnosis-authorizes-plan', re: /plan_from_diagnosis/i },
  { label: 'diagnosis-authorizes-plan', re: /diagnosis_grants_plan/i },
];

const errors = [];
const err = (m) => errors.push(m);
const rel = (p) => relative(REPO_ROOT, p);

/** Read + parse JSON as inert data. Never executes the file. */
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Walk every key name in a nested object/array tree. */
function walkKeys(node, visit, path = '') {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkKeys(v, visit, `${path}[${i}]`));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      visit(k, v, path ? `${path}.${k}` : k);
      walkKeys(v, visit, path ? `${path}.${k}` : k);
    }
  }
}

/* -------------------------------------------------------------------------
 * 1. Package status.
 * ------------------------------------------------------------------------- */
if (!existsSync(STATUS_PATH)) {
  err(`Missing package status file: ${rel(STATUS_PATH)}`);
} else {
  try {
    const s = readJson(STATUS_PATH);
    if (s.approval_status === 'approved') err(`${rel(STATUS_PATH)}: approval_status must not be "approved".`);
    if (s.executable !== false) err(`${rel(STATUS_PATH)}: executable must be false.`);
    if (s.rule_objects_approved !== 0) err(`${rel(STATUS_PATH)}: rule_objects_approved must be 0.`);
  } catch (e) {
    err(`${rel(STATUS_PATH)}: invalid JSON — ${e.message}`);
  }
}

/* -------------------------------------------------------------------------
 * 2. Template remains blank / non-executable.
 * ------------------------------------------------------------------------- */
if (!existsSync(TEMPLATE_PATH)) {
  err(`Missing rule-object template: ${rel(TEMPLATE_PATH)}`);
} else {
  try {
    const t = readJson(TEMPLATE_PATH);
    const blankish = (v) => v === null || v === '' || (Array.isArray(v) && v.length === 0) || (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
    if (t.executable === true) err(`${rel(TEMPLATE_PATH)}: template must not be executable.`);
    if (t.approval_status === 'approved') err(`${rel(TEMPLATE_PATH)}: template approval_status must not be "approved".`);
    for (const key of ['rule_id', 'source_spec_rule_id', 'architecture_refs', 'evidence_claim_ids']) {
      if (!blankish(t[key])) err(`${rel(TEMPLATE_PATH)}: template must stay blank — "${key}" is populated.`);
    }
    walkKeys(t, (k, _v, kp) => {
      for (const p of PROHIBITED_KEY_PATTERNS) {
        if (p.re.test(k)) err(`${rel(TEMPLATE_PATH)}: prohibited ${p.label} key "${kp}".`);
      }
    });
  } catch (e) {
    err(`${rel(TEMPLATE_PATH)}: invalid JSON — ${e.message}`);
  }
}

/* -------------------------------------------------------------------------
 * 3. Authored objects (optional folder).
 * ------------------------------------------------------------------------- */
let objectFiles = [];
if (existsSync(OBJECTS_DIR) && statSync(OBJECTS_DIR).isDirectory()) {
  objectFiles = readdirSync(OBJECTS_DIR)
    .filter((n) => extname(n) === '.json')
    .map((n) => join(OBJECTS_DIR, n));
}

function validateObject(path, obj) {
  const where = rel(path);

  // Required keys.
  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) err(`${where}: missing required key "${key}".`);
  }

  // Status discipline.
  if (obj.approval_status === 'approved') err(`${where}: approval_status must not be "approved" in this phase.`);
  else if (obj.approval_status !== undefined && !ALLOWED_APPROVAL_STATUS.has(obj.approval_status)) {
    err(`${where}: approval_status "${obj.approval_status}" is not one of pending|rejected|superseded.`);
  }
  if (obj.executable === true) err(`${where}: executable must not be true.`);

  // Provenance.
  if (typeof obj.source_spec_rule_id !== 'string' || !RF_RULE_ID_RE.test(obj.source_spec_rule_id)) {
    err(`${where}: source_spec_rule_id must look like an RF v1.2 rule ID (e.g. RF-SAF-001).`);
  }
  // architecture_refs and evidence_claim_ids must each be arrays of the right shape.
  if (!Array.isArray(obj.architecture_refs)) {
    err(`${where}: architecture_refs must be an array.`);
  } else {
    for (const ref of obj.architecture_refs) {
      if (typeof ref !== 'string' || ref.length === 0) err(`${where}: architecture_ref "${ref}" must be a non-empty string.`);
    }
  }
  if (!Array.isArray(obj.evidence_claim_ids)) {
    err(`${where}: evidence_claim_ids must be an array.`);
  } else {
    for (const id of obj.evidence_claim_ids) {
      if (typeof id !== 'string' || !QRF_ID_RE.test(id)) err(`${where}: evidence_claim_id "${id}" must look like QRF-001.`);
    }
  }
  // Provenance presence (v1.2 §4.3): architecture rules cite architecture_refs; clinical-content
  // rules cite evidence_claim_ids; mixed rules cite both. At least one must be non-empty, but a
  // clinical-content rule legitimately has empty architecture_refs and an architecture rule
  // legitimately has empty evidence_claim_ids.
  const hasArch = Array.isArray(obj.architecture_refs) && obj.architecture_refs.length > 0;
  const hasClaims = Array.isArray(obj.evidence_claim_ids) && obj.evidence_claim_ids.length > 0;
  if (!hasArch && !hasClaims) {
    err(`${where}: provenance missing — at least one of architecture_refs or evidence_claim_ids must be non-empty (v1.2 §4.3).`);
  }

  // Prohibited keys (deep scan).
  walkKeys(obj, (k, v, kp) => {
    for (const p of PROHIBITED_KEY_PATTERNS) {
      if (p.re.test(k)) err(`${where}: prohibited ${p.label} field "${kp}".`);
    }
    // Fixed RTS date *values* in any return/rts-related field.
    if (/return|rts/i.test(k) && typeof v === 'string' && (ISO_DATE_RE.test(v) || RELATIVE_DURATION_RE.test(v))) {
      err(`${where}: prohibited fixed return-to-sport date/duration in "${kp}".`);
    }
    // Numeric confidence *value*: a key literally named confidence holding a number.
    if (/^confidence$/i.test(k) && typeof v === 'number') {
      err(`${where}: prohibited numeric confidence value in "${kp}".`);
    }
  });
}

for (const file of objectFiles) {
  let obj;
  try {
    obj = readJson(file);
  } catch (e) {
    err(`${rel(file)}: invalid JSON — ${e.message}`);
    continue;
  }
  validateObject(file, obj);
}

/* -------------------------------------------------------------------------
 * Report.
 * ------------------------------------------------------------------------- */
if (errors.length > 0) {
  console.error('\n✖ RF rule-package validation FAILED\n');
  for (const e of errors) console.error(`  • ${e}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

if (objectFiles.length === 0) {
  console.log(
    '✓ RF rule-package validation passed — package status and template are non-executable and ' +
      'not approved; no authored rule objects exist yet (lib/clinical/rf/rules/objects/ is empty or absent).'
  );
} else {
  console.log(
    `✓ RF rule-package validation passed — status/template clean; ${objectFiles.length} authored ` +
      `object(s) conform to shape, provenance, status discipline, and prohibited-field rules. ` +
      `(Structural validation only — NOT clinical approval.)`
  );
}
process.exit(0);
