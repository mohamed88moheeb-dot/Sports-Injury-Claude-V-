#!/usr/bin/env node
/**
 * Activity Exposure Knowledge validation (Phase 2A).
 *
 * Phase 2A is non-destructive migration staging: draft RF-ACT objects exist
 * (RF-ACT-001..N), nothing may be approved or executable, and the system must
 * stay runtime-disconnected and metadata-only. RF-ACT objects are activity/
 * sport/conditioning exposure DOMAINS — never exercises, plans, prescriptions,
 * progressions, readiness gates, or RTT/RTS/clearance authority.
 *
 * Treats every file as inert JSON data (never import()-ed or evaluated).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const SYSTEM_DIR = resolve(REPO_ROOT, 'lib/clinical/activityExposureKnowledge');

const STATUS_PATH = join(SYSTEM_DIR, 'status/activityExposureKnowledgeStatus.json');
const SCHEMA_PATH = join(SYSTEM_DIR, 'schema/activityExposureObject.schema.json');
const TEMPLATE_PATH = join(SYSTEM_DIR, 'templates/activityExposureObjectTemplate.json');
const OBJECTS_DIR = join(SYSTEM_DIR, 'rf/objects');
const SOURCE_MAP_PATH = join(SYSTEM_DIR, 'rf/source/rfActivityExposureSourceMap.json');

const REQUIRED_OBJECT_KEYS = [
  'activity_exposure_id', 'source_exercise_object_id', 'module', 'name', 'aliases',
  'exposure_status', 'approval_status', 'clinical_approval_status', 'executable',
  'runtime_integration', 'permitted_use', 'activity_domain', 'activity_exposure_tags',
  'sport_demand_tags', 'equipment_tags', 'body_region', 'target_tissues', 'source_refs',
  'architecture_refs', 'classification_audit_refs', 'linked_rule_ids', 'allowed_when',
  'blocked_when', 'safety_blockers', 'monitoring_triggers', 'restricted_context', 'notes',
];

const REQUIRED_TEMPLATE_KEYS = REQUIRED_OBJECT_KEYS;

const REQUIRED_STATUS_NOTE_FRAGMENTS = [
  'Phase 2A non-destructive migration staging',
  '12 draft RF-ACT objects authored',
  'Original RF-EX objects remain untouched',
  'No RF-ASSESS objects created',
  'No runtime wiring',
  'No dosage',
  'No progression',
  'No readiness',
  'No RTT/RTS',
  'No clearance authority',
];

const PROHIBITED_KEY_PATTERNS = [
  { label: 'active dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|duration|dosage|fixed_dose|distance|speed|workload|sprint_ratio)$/i },
  { label: 'active prescription', re: /active_prescription|prescribed_(volume|load|tempo|schedule|recovery_interval|session_length|progression_step|target_timeline)/i },
  { label: 'progression authorization', re: /(authori[sz]es?|grants?|creates?)_progression|progression_authori[sz]ation/i },
  { label: 'readiness authorization', re: /(authori[sz]es?|grants?|creates?)_readiness|readiness_authori[sz]ation/i },
  { label: 'clearance authorization', re: /(authori[sz]es?|grants?|creates?)_(clearance|rtt|rts|return_to_(training|sport|play))|clearance_authori[sz]ation/i },
  { label: 'fixed return date', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return/i },
];

const ASSERTIVE_AUTHORITY_VALUE_PATTERNS = [
  /\bauthori[sz]es?\s+(clearance|progression|readiness|rtt|rts|return to (training|sport|play))/i,
  /\bgrants?\s+(clearance|progression|readiness|rtt|rts|return to (training|sport|play))/i,
  /\bcleared\s+to\s+(run|sprint|kick|train|play|compete|return)/i,
  /\b(return to (training|sport|play)|rtt|rts)\s+approved\b/i,
];

// Copied numeric prescription (distance/speed/ratio/frequency/duration/intensity) in string values.
const NUMERIC_PRESCRIPTION_RE = /\b\d+(\.\d+)?\s*(m|km|metre|metres|meter|meters|yard|yards|sec|secs|second|seconds|min|mins|minute|minutes|hour|hours|day|days|week|weeks|%|kg|lb|lbs|rep|reps|set|sets|km\/h|kmh|mph|m\/s)\b/i;
const RATIO_RE = /\b\d+\s*:\s*\d+\b/;

const errors = [];
const err = (message) => errors.push(message);
const rel = (path) => relative(REPO_ROOT, path);

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }

function walk(node, visit, path = '') {
  if (Array.isArray(node)) {
    node.forEach((value, index) => walk(value, visit, `${path}[${index}]`));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      const nextPath = path ? `${path}.${key}` : key;
      visit(key, value, nextPath);
      walk(value, visit, nextPath);
    }
  }
}

function expectFile(path, label) {
  if (!existsSync(path)) { err(`Missing ${label}: ${rel(path)}`); return false; }
  return true;
}
function expectDir(path, label) {
  if (!existsSync(path) || !statSync(path).isDirectory()) { err(`Missing ${label}: ${rel(path)}`); return false; }
  return true;
}

function scanForActiveAuthority(path, json) {
  walk(json, (key, value, keyPath) => {
    for (const pattern of PROHIBITED_KEY_PATTERNS) {
      if (pattern.re.test(key)) err(`${rel(path)}: prohibited ${pattern.label} key "${keyPath}".`);
    }
    if (typeof value === 'string') {
      for (const pattern of ASSERTIVE_AUTHORITY_VALUE_PATTERNS) {
        if (pattern.test(value)) err(`${rel(path)}: prohibited active authority language in "${keyPath}".`);
      }
      if (NUMERIC_PRESCRIPTION_RE.test(value) || RATIO_RE.test(value)) {
        err(`${rel(path)}: prohibited copied numeric prescription (distance/speed/ratio/frequency/duration/intensity) in "${keyPath}".`);
      }
    }
  });
}

let statusAuthored = null;

function validateStatus() {
  if (!expectFile(STATUS_PATH, 'status file')) return;
  let status;
  try { status = readJson(STATUS_PATH); } catch (e) { err(`${rel(STATUS_PATH)}: invalid JSON - ${e.message}`); return; }

  if (status.status !== 'phase_2_rf_act_authored') err(`${rel(STATUS_PATH)}: status must be "phase_2_rf_act_authored".`);
  if (status.approval_status !== 'pending') err(`${rel(STATUS_PATH)}: approval_status must be "pending".`);
  if (status.clinical_approval_status !== 'not_approved') err(`${rel(STATUS_PATH)}: clinical_approval_status must be "not_approved".`);
  if (status.executable !== false) err(`${rel(STATUS_PATH)}: executable must be false.`);
  if (status.runtime_integration !== 'none') err(`${rel(STATUS_PATH)}: runtime_integration must be "none".`);
  if (status.activity_exposure_objects_approved !== 0) err(`${rel(STATUS_PATH)}: activity_exposure_objects_approved must be 0.`);
  if (typeof status.activity_exposure_objects_authored !== 'number') err(`${rel(STATUS_PATH)}: activity_exposure_objects_authored must be a number.`);
  else statusAuthored = status.activity_exposure_objects_authored;
  for (const fragment of REQUIRED_STATUS_NOTE_FRAGMENTS) {
    if (!String(status.notes || '').includes(fragment)) err(`${rel(STATUS_PATH)}: notes must include "${fragment}".`);
  }
  scanForActiveAuthority(STATUS_PATH, status);
}

function validateSchema() {
  if (!expectFile(SCHEMA_PATH, 'schema')) return;
  let schema;
  try { schema = readJson(SCHEMA_PATH); } catch (e) { err(`${rel(SCHEMA_PATH)}: invalid JSON - ${e.message}`); return; }

  if (schema.additionalProperties !== false) err(`${rel(SCHEMA_PATH)}: additionalProperties must be false.`);
  if (schema.properties?.module?.enum?.join('|') !== 'rf') err(`${rel(SCHEMA_PATH)}: module must be "rf".`);
  if (schema.properties?.exposure_status?.enum?.join('|') !== 'draft') err(`${rel(SCHEMA_PATH)}: exposure_status must support draft only.`);
  if (schema.properties?.approval_status?.enum?.join('|') !== 'pending') err(`${rel(SCHEMA_PATH)}: approval_status must support pending only.`);
  if (schema.properties?.clinical_approval_status?.enum?.join('|') !== 'not_approved') err(`${rel(SCHEMA_PATH)}: clinical_approval_status must be not_approved.`);
  if (schema.properties?.executable?.const !== false) err(`${rel(SCHEMA_PATH)}: executable const must be false.`);
  if (schema.properties?.runtime_integration?.enum?.join('|') !== 'none') err(`${rel(SCHEMA_PATH)}: runtime_integration must be none.`);
  if (schema.properties?.permitted_use?.enum?.join('|') !== 'activity_exposure_metadata_only') err(`${rel(SCHEMA_PATH)}: permitted_use must be activity_exposure_metadata_only.`);
  for (const key of REQUIRED_OBJECT_KEYS) {
    if (!Array.isArray(schema.required) || !schema.required.includes(key)) err(`${rel(SCHEMA_PATH)}: schema must require "${key}".`);
  }
  scanForActiveAuthority(SCHEMA_PATH, schema);
}

function validateTemplate() {
  if (!expectFile(TEMPLATE_PATH, 'template')) return;
  let template;
  try { template = readJson(TEMPLATE_PATH); } catch (e) { err(`${rel(TEMPLATE_PATH)}: invalid JSON - ${e.message}`); return; }

  for (const key of REQUIRED_TEMPLATE_KEYS) {
    if (!(key in template)) err(`${rel(TEMPLATE_PATH)}: template missing required key "${key}".`);
  }
  if (template.activity_exposure_id !== '') err(`${rel(TEMPLATE_PATH)}: activity_exposure_id must stay blank.`);
  if (template.source_exercise_object_id !== '') err(`${rel(TEMPLATE_PATH)}: source_exercise_object_id must stay blank.`);
  if (template.module !== 'rf') err(`${rel(TEMPLATE_PATH)}: module must be "rf".`);
  if (template.exposure_status !== 'draft') err(`${rel(TEMPLATE_PATH)}: exposure_status must be "draft".`);
  if (template.approval_status !== 'pending') err(`${rel(TEMPLATE_PATH)}: approval_status must be "pending".`);
  if (template.clinical_approval_status !== 'not_approved') err(`${rel(TEMPLATE_PATH)}: clinical_approval_status must be "not_approved".`);
  if (template.executable !== false) err(`${rel(TEMPLATE_PATH)}: executable must be false.`);
  if (template.runtime_integration !== 'none') err(`${rel(TEMPLATE_PATH)}: runtime_integration must be "none".`);
  if (template.permitted_use !== 'activity_exposure_metadata_only') err(`${rel(TEMPLATE_PATH)}: permitted_use must be activity_exposure_metadata_only.`);
  scanForActiveAuthority(TEMPLATE_PATH, template);
}

function validateSourceMap() {
  if (!expectFile(SOURCE_MAP_PATH, 'source map')) return;
  let sourceMap;
  try { sourceMap = readJson(SOURCE_MAP_PATH); } catch (e) { err(`${rel(SOURCE_MAP_PATH)}: invalid JSON - ${e.message}`); return; }

  if (sourceMap.approval_status !== 'pending') err(`${rel(SOURCE_MAP_PATH)}: approval_status must be "pending".`);
  if (sourceMap.clinical_approval_status !== 'not_approved') err(`${rel(SOURCE_MAP_PATH)}: clinical_approval_status must be "not_approved".`);
  if (sourceMap.executable !== false) err(`${rel(SOURCE_MAP_PATH)}: executable must be false.`);
  if (sourceMap.runtime_integration !== 'none') err(`${rel(SOURCE_MAP_PATH)}: runtime_integration must be "none".`);
  if (sourceMap.global_constraints?.rf_act_objects_created !== true) err(`${rel(SOURCE_MAP_PATH)}: rf_act_objects_created must be true in Phase 2A.`);
  if (sourceMap.global_constraints?.rf_ex_objects_moved !== false) err(`${rel(SOURCE_MAP_PATH)}: rf_ex_objects_moved must be false.`);
  if (sourceMap.global_constraints?.rf_ex_ids_renamed !== false) err(`${rel(SOURCE_MAP_PATH)}: rf_ex_ids_renamed must be false.`);
  if (sourceMap.global_constraints?.rf_ex_objects_modified !== false) err(`${rel(SOURCE_MAP_PATH)}: rf_ex_objects_modified must be false.`);
  if (!Array.isArray(sourceMap.migration_map) || sourceMap.migration_map.length !== 12) err(`${rel(SOURCE_MAP_PATH)}: migration_map must contain 12 entries.`);
  scanForActiveAuthority(SOURCE_MAP_PATH, sourceMap);
}

function validateObjectsFolder() {
  if (!expectDir(OBJECTS_DIR, 'objects folder')) return { objectCount: 0, approvedCount: 0, executableCount: 0 };

  const objectFiles = readdirSync(OBJECTS_DIR)
    .filter((name) => extname(name) === '.json')
    .sort()
    .map((name) => join(OBJECTS_DIR, name));

  let approvedCount = 0;
  let executableCount = 0;
  const seenIds = [];

  for (const file of objectFiles) {
    const base = file.split('/').pop().replace('.json', '');
    let object;
    try { object = readJson(file); } catch (e) { err(`${rel(file)}: invalid JSON - ${e.message}`); continue; }

    for (const key of REQUIRED_OBJECT_KEYS) {
      if (!(key in object)) err(`${rel(file)}: missing required key "${key}".`);
    }
    if (object.activity_exposure_id !== base) err(`${rel(file)}: activity_exposure_id "${object.activity_exposure_id}" must match filename "${base}".`);
    if (!/^RF-ACT-[0-9]{3}$/.test(object.activity_exposure_id || '')) err(`${rel(file)}: activity_exposure_id must look like RF-ACT-001.`);
    if (!/^RF-EX-[0-9]{3}$/.test(object.source_exercise_object_id || '')) err(`${rel(file)}: source_exercise_object_id must look like RF-EX-001.`);
    if (object.module !== 'rf') err(`${rel(file)}: module must be "rf".`);
    if (object.exposure_status !== 'draft') err(`${rel(file)}: exposure_status must be "draft".`);
    if (object.approval_status !== 'pending') err(`${rel(file)}: approval_status must be "pending".`);
    if (object.clinical_approval_status !== 'not_approved') err(`${rel(file)}: clinical_approval_status must be "not_approved".`);
    if (object.runtime_integration !== 'none') err(`${rel(file)}: runtime_integration must be "none".`);
    if (object.permitted_use !== 'activity_exposure_metadata_only') err(`${rel(file)}: permitted_use must be "activity_exposure_metadata_only".`);
    if (object.approval_status === 'approved') approvedCount++;
    if (object.executable === true) executableCount++;
    seenIds.push(object.activity_exposure_id);
    scanForActiveAuthority(file, object);
  }

  // Sequential RF-ACT-001..N
  const expected = objectFiles.map((_, i) => `RF-ACT-${String(i + 1).padStart(3, '0')}`);
  const got = [...seenIds].sort();
  if (JSON.stringify(got) !== JSON.stringify(expected)) {
    err(`${rel(OBJECTS_DIR)}: RF-ACT IDs must be sequential ${expected[0]}..${expected[expected.length - 1]}; found ${got.join(', ') || '(none)'}.`);
  }
  if (approvedCount !== 0) err(`${rel(OBJECTS_DIR)}: approved object count must be 0.`);
  if (executableCount !== 0) err(`${rel(OBJECTS_DIR)}: executable object count must be 0.`);
  if (statusAuthored !== null && statusAuthored !== objectFiles.length) {
    err(`${rel(OBJECTS_DIR)}: object count (${objectFiles.length}) must equal status authored count (${statusAuthored}).`);
  }
  return { objectCount: objectFiles.length, approvedCount, executableCount };
}

expectDir(SYSTEM_DIR, 'activity exposure knowledge folder');
validateStatus();
validateSchema();
validateTemplate();
validateSourceMap();
const counts = validateObjectsFolder();

if (errors.length > 0) {
  console.error('\n✖ Activity Exposure Knowledge validation FAILED\n');
  for (const error of errors) console.error(`  • ${error}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

console.log('Activity Exposure Knowledge validation PASS');
console.log('Status: phase_2_rf_act_authored');
console.log(`Activity exposure objects found: ${counts.objectCount}`);
console.log(`Approved objects: ${counts.approvedCount}`);
console.log(`Executable objects: ${counts.executableCount}`);
console.log('Runtime integration: none');
console.log('No active dosage, prescription, progression, readiness, RTT/RTS, or clearance authority found');
process.exit(0);
