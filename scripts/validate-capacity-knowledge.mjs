#!/usr/bin/env node
/**
 * Capacity Knowledge validation (Schema v2 — Universal CAP Batch 1).
 *
 * Universal CAP-### objects are authored (Batch 1 = 15); RF-CAP overlays remain 0.
 * Nothing may be approved or executable; the system stays runtime-disconnected and
 * metadata-only. Capacity objects are inert metadata bridging assessment/exercise/
 * activity/demand; they never carry a score, threshold, pass/fail decision, timeline,
 * dosage, prescription, progression, readiness, RTT/RTS, or clearance authority.
 *
 * Treats every file as inert JSON data (never import()-ed or evaluated).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const SYSTEM_DIR = resolve(REPO_ROOT, 'lib/clinical/capacityKnowledge');

const STATUS_PATH = join(SYSTEM_DIR, 'status/capacityKnowledgeStatus.json');
const SCHEMA_PATH = join(SYSTEM_DIR, 'schema/capacityObject.schema.json');
const TEMPLATE_PATH = join(SYSTEM_DIR, 'templates/capacityObjectTemplate.json');
const UNIVERSAL_OBJECTS_DIR = join(SYSTEM_DIR, 'universal/objects');
const UNIVERSAL_SOURCE_MAP_PATH = join(SYSTEM_DIR, 'universal/source/universalCapacitySourceMap.json');
const RF_OBJECTS_DIR = join(SYSTEM_DIR, 'rf/objects');
const RF_SOURCE_MAP_PATH = join(SYSTEM_DIR, 'rf/source/rfCapacitySourceMap.json');

const EXPECTED_UNIVERSAL_COUNT = 15;

const REQUIRED_OBJECT_KEYS = [
  'capacity_id', 'capacity_object_type', 'module', 'universal_capacity_ref', 'name',
  'capacity_status', 'approval_status', 'clinical_approval_status', 'executable',
  'runtime_integration', 'permitted_use', 'capacity_domain', 'capacity_subdomain',
  'capacity_tags', 'body_region', 'related_tissues', 'measured_by_assessment_categories',
  'improved_by_exercise_function_categories', 'expressed_through_activity_domains',
  'required_by_demand_profiles', 'related_rehab_plan_blocks', 'evidence_state',
  'goal_sufficiency_status', 'confidence_status', 'allowed_when', 'blocked_when', 'notes',
];
const ARRAY_KEYS = [
  'capacity_tags', 'body_region', 'related_tissues', 'measured_by_assessment_categories',
  'improved_by_exercise_function_categories', 'expressed_through_activity_domains',
  'required_by_demand_profiles', 'related_rehab_plan_blocks', 'allowed_when', 'blocked_when',
];

const REQUIRED_STATUS_NOTE_FRAGMENTS = [
  'Universal CAP Batch 1 authored as draft metadata only',
  'No RF-CAP overlays authored',
  'No objects approved',
  'No runtime behavior',
  'No diagnosis authority',
  'No prescription',
  'No dosage',
  'No progression',
  'No readiness',
  'No RTT/RTS',
  'No clearance authority',
];

const PROHIBITED_KEY_PATTERNS = [
  { label: 'active dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|duration|dosage|fixed_dose|distance_target|speed_target)$/i },
  { label: 'active prescription', re: /active_prescription|prescribed_(volume|load|tempo|schedule|recovery_interval|session_length|progression_step|target_timeline)/i },
  { label: 'numeric score / threshold / pass-fail', re: /^(score|capacity_score|numeric_score|percent_score|threshold|pass_fail|passfail|cutoff)$/i },
  { label: 'progression authorization', re: /(authori[sz]es?|grants?|creates?)_progression|progression_authori[sz]ation/i },
  { label: 'readiness authorization', re: /(authori[sz]es?|grants?|creates?)_readiness|readiness_authori[sz]ation/i },
  { label: 'clearance authorization', re: /(authori[sz]es?|grants?|creates?)_(clearance|rtt|rts|return_to_(training|sport|play))|clearance_authori[sz]ation/i },
  { label: 'fixed return date / timeline', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return|return_timeline/i },
  { label: 'banned field evidence_quality_status', re: /^evidence_quality_status$/i },
];

const ASSERTIVE_AUTHORITY_VALUE_PATTERNS = [
  /\bauthori[sz]es?\s+(clearance|progression|readiness|rtt|rts|return to (training|sport|play))/i,
  /\bgrants?\s+(clearance|progression|readiness|rtt|rts|return to (training|sport|play))/i,
  /\bcleared\s+to\s+(run|sprint|kick|train|play|compete|return)/i,
  /\bready\s+(for|to)\s+(return|sport|competition|compete|play)/i,
  /\bapproved\s+to\s+return\b/i,
  /\b(return to (training|sport|play)|rtt|rts)\s+approved\b/i,
];

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
    }
  });
}

function validateStatus() {
  if (!expectFile(STATUS_PATH, 'status file')) return;
  let status;
  try { status = readJson(STATUS_PATH); } catch (e) { err(`${rel(STATUS_PATH)}: invalid JSON - ${e.message}`); return; }

  if (status.status !== 'universal_cap_batch_1_authored') err(`${rel(STATUS_PATH)}: status must be "universal_cap_batch_1_authored".`);
  if (status.approval_status !== 'pending') err(`${rel(STATUS_PATH)}: approval_status must be "pending".`);
  if (status.clinical_approval_status !== 'not_approved') err(`${rel(STATUS_PATH)}: clinical_approval_status must be "not_approved".`);
  if (status.executable !== false) err(`${rel(STATUS_PATH)}: executable must be false.`);
  if (status.runtime_integration !== 'none') err(`${rel(STATUS_PATH)}: runtime_integration must be "none".`);
  if (status.permitted_use !== 'capacity_metadata_only') err(`${rel(STATUS_PATH)}: permitted_use must be "capacity_metadata_only".`);
  if (status.universal_capacity_objects_authored !== EXPECTED_UNIVERSAL_COUNT) err(`${rel(STATUS_PATH)}: universal_capacity_objects_authored must be ${EXPECTED_UNIVERSAL_COUNT}.`);
  if (status.rf_capacity_overlay_objects_authored !== 0) err(`${rel(STATUS_PATH)}: rf_capacity_overlay_objects_authored must be 0.`);
  if (status.capacity_objects_authored !== EXPECTED_UNIVERSAL_COUNT) err(`${rel(STATUS_PATH)}: capacity_objects_authored must be ${EXPECTED_UNIVERSAL_COUNT}.`);
  if (status.capacity_objects_approved !== 0) err(`${rel(STATUS_PATH)}: capacity_objects_approved must be 0.`);
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
  const idPattern = schema.properties?.capacity_id?.pattern || '';
  if (!/CAP-\[0-9\]\{3\}/.test(idPattern) || !/RF-CAP-\[0-9\]\{3\}/.test(idPattern)) err(`${rel(SCHEMA_PATH)}: capacity_id must allow both CAP-### and RF-CAP-###.`);
  if (schema.properties?.capacity_object_type?.enum?.join('|') !== 'universal_capacity|module_capacity_overlay') err(`${rel(SCHEMA_PATH)}: capacity_object_type enum mismatch.`);
  if (schema.properties?.module?.enum?.join('|') !== 'universal|rf') err(`${rel(SCHEMA_PATH)}: module enum must be universal|rf.`);
  if (!('universal_capacity_ref' in (schema.properties || {}))) err(`${rel(SCHEMA_PATH)}: universal_capacity_ref must be a property.`);
  if ('evidence_quality_status' in (schema.properties || {})) err(`${rel(SCHEMA_PATH)}: evidence_quality_status must be removed.`);
  for (const f of ['evidence_state', 'goal_sufficiency_status', 'confidence_status']) {
    if (!('properties' in schema) || !(f in schema.properties)) err(`${rel(SCHEMA_PATH)}: schema must include "${f}".`);
    if (!Array.isArray(schema.required) || !schema.required.includes(f)) err(`${rel(SCHEMA_PATH)}: schema must require "${f}".`);
  }
  if (schema.properties?.evidence_state?.enum?.join('|') !== 'known|estimated|unknown|not_tested') err(`${rel(SCHEMA_PATH)}: evidence_state enum mismatch.`);
  if (schema.properties?.capacity_status?.enum?.join('|') !== 'draft') err(`${rel(SCHEMA_PATH)}: capacity_status must support draft only.`);
  if (schema.properties?.approval_status?.enum?.join('|') !== 'pending') err(`${rel(SCHEMA_PATH)}: approval_status must support pending only.`);
  if (schema.properties?.clinical_approval_status?.enum?.join('|') !== 'not_approved') err(`${rel(SCHEMA_PATH)}: clinical_approval_status must be not_approved.`);
  if (schema.properties?.executable?.const !== false) err(`${rel(SCHEMA_PATH)}: executable const must be false.`);
  if (schema.properties?.runtime_integration?.enum?.join('|') !== 'none') err(`${rel(SCHEMA_PATH)}: runtime_integration must be none.`);
  if (schema.properties?.permitted_use?.enum?.join('|') !== 'capacity_metadata_only') err(`${rel(SCHEMA_PATH)}: permitted_use must be capacity_metadata_only.`);
  scanForActiveAuthority(SCHEMA_PATH, schema);
}

function validateTemplate() {
  if (!expectFile(TEMPLATE_PATH, 'template')) return;
  let template;
  try { template = readJson(TEMPLATE_PATH); } catch (e) { err(`${rel(TEMPLATE_PATH)}: invalid JSON - ${e.message}`); return; }

  for (const key of REQUIRED_OBJECT_KEYS) {
    if (!(key in template)) err(`${rel(TEMPLATE_PATH)}: template missing required key "${key}".`);
  }
  if (template.capacity_id !== '') err(`${rel(TEMPLATE_PATH)}: capacity_id must stay blank.`);
  if (template.universal_capacity_ref !== '') err(`${rel(TEMPLATE_PATH)}: universal_capacity_ref must stay blank.`);
  if (template.capacity_object_type !== 'universal_capacity') err(`${rel(TEMPLATE_PATH)}: capacity_object_type must default to "universal_capacity".`);
  if (template.module !== 'universal') err(`${rel(TEMPLATE_PATH)}: module must default to "universal".`);
  if (template.capacity_status !== 'draft') err(`${rel(TEMPLATE_PATH)}: capacity_status must be "draft".`);
  if (template.approval_status !== 'pending') err(`${rel(TEMPLATE_PATH)}: approval_status must be "pending".`);
  if (template.clinical_approval_status !== 'not_approved') err(`${rel(TEMPLATE_PATH)}: clinical_approval_status must be "not_approved".`);
  if (template.executable !== false) err(`${rel(TEMPLATE_PATH)}: executable must be false.`);
  if (template.runtime_integration !== 'none') err(`${rel(TEMPLATE_PATH)}: runtime_integration must be "none".`);
  if (template.permitted_use !== 'capacity_metadata_only') err(`${rel(TEMPLATE_PATH)}: permitted_use must be capacity_metadata_only.`);
  if ('evidence_quality_status' in template) err(`${rel(TEMPLATE_PATH)}: evidence_quality_status must be removed.`);
  scanForActiveAuthority(TEMPLATE_PATH, template);
}

function validateUniversalSourceMap() {
  if (!expectFile(UNIVERSAL_SOURCE_MAP_PATH, 'universal source map')) return;
  let map;
  try { map = readJson(UNIVERSAL_SOURCE_MAP_PATH); } catch (e) { err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: invalid JSON - ${e.message}`); return; }
  if (map.approval_status !== 'pending') err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: approval_status must be "pending".`);
  if (map.clinical_approval_status !== 'not_approved') err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: clinical_approval_status must be "not_approved".`);
  if (map.executable !== false) err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: executable must be false.`);
  if (map.runtime_integration !== 'none') err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: runtime_integration must be "none".`);
  if (map.authored_object_prefix !== 'CAP') err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: authored_object_prefix must be "CAP".`);
  if (map.authored_object_count !== EXPECTED_UNIVERSAL_COUNT) err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: authored_object_count must be ${EXPECTED_UNIVERSAL_COUNT}.`);
  if (map.rf_capacity_overlay_objects_authored !== 0) err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: rf_capacity_overlay_objects_authored must be 0.`);
  if (!Array.isArray(map.authored_capacity_ids) || map.authored_capacity_ids.length !== EXPECTED_UNIVERSAL_COUNT) err(`${rel(UNIVERSAL_SOURCE_MAP_PATH)}: authored_capacity_ids must list ${EXPECTED_UNIVERSAL_COUNT} ids.`);
  scanForActiveAuthority(UNIVERSAL_SOURCE_MAP_PATH, map);
}

function validateRfSourceMap() {
  if (!expectFile(RF_SOURCE_MAP_PATH, 'rf source map')) return;
  let map;
  try { map = readJson(RF_SOURCE_MAP_PATH); } catch (e) { err(`${rel(RF_SOURCE_MAP_PATH)}: invalid JSON - ${e.message}`); return; }
  if (map.approval_status !== 'pending') err(`${rel(RF_SOURCE_MAP_PATH)}: approval_status must be "pending".`);
  if (map.clinical_approval_status !== 'not_approved') err(`${rel(RF_SOURCE_MAP_PATH)}: clinical_approval_status must be "not_approved".`);
  if (map.executable !== false) err(`${rel(RF_SOURCE_MAP_PATH)}: executable must be false.`);
  if (map.runtime_integration !== 'none') err(`${rel(RF_SOURCE_MAP_PATH)}: runtime_integration must be "none".`);
  if (map.future_overlay_prefix !== 'RF-CAP') err(`${rel(RF_SOURCE_MAP_PATH)}: future_overlay_prefix must be "RF-CAP".`);
  if (map.future_overlay_count !== 0) err(`${rel(RF_SOURCE_MAP_PATH)}: future_overlay_count must be 0.`);
  scanForActiveAuthority(RF_SOURCE_MAP_PATH, map);
}

function validateUniversalObjects() {
  if (!expectDir(UNIVERSAL_OBJECTS_DIR, 'universal objects folder')) return { objectCount: 0, approvedCount: 0, executableCount: 0 };
  const files = readdirSync(UNIVERSAL_OBJECTS_DIR).filter((n) => extname(n) === '.json').sort().map((n) => join(UNIVERSAL_OBJECTS_DIR, n));
  let approvedCount = 0, executableCount = 0;
  const ids = [];
  for (const file of files) {
    const base = file.split('/').pop().replace('.json', '');
    let o;
    try { o = readJson(file); } catch (e) { err(`${rel(file)}: invalid JSON - ${e.message}`); continue; }
    for (const key of REQUIRED_OBJECT_KEYS) { if (!(key in o)) err(`${rel(file)}: missing required key "${key}".`); }
    if (o.capacity_id !== base) err(`${rel(file)}: capacity_id "${o.capacity_id}" must match filename "${base}".`);
    if (!/^CAP-[0-9]{3}$/.test(o.capacity_id || '')) err(`${rel(file)}: capacity_id must look like CAP-001.`);
    if (o.capacity_object_type !== 'universal_capacity') err(`${rel(file)}: capacity_object_type must be "universal_capacity".`);
    if (o.module !== 'universal') err(`${rel(file)}: module must be "universal".`);
    if (o.universal_capacity_ref !== '') err(`${rel(file)}: universal_capacity_ref must be empty for universal objects.`);
    if (o.capacity_status !== 'draft') err(`${rel(file)}: capacity_status must be "draft".`);
    if (o.approval_status !== 'pending') err(`${rel(file)}: approval_status must be "pending".`);
    if (o.clinical_approval_status !== 'not_approved') err(`${rel(file)}: clinical_approval_status must be "not_approved".`);
    if (o.runtime_integration !== 'none') err(`${rel(file)}: runtime_integration must be "none".`);
    if (o.permitted_use !== 'capacity_metadata_only') err(`${rel(file)}: permitted_use must be "capacity_metadata_only".`);
    if (o.evidence_state !== 'not_tested') err(`${rel(file)}: evidence_state must be "not_tested".`);
    if (o.goal_sufficiency_status !== 'not_applicable') err(`${rel(file)}: goal_sufficiency_status must be "not_applicable".`);
    if (o.confidence_status !== 'low_confidence') err(`${rel(file)}: confidence_status must be "low_confidence".`);
    if ('evidence_quality_status' in o) err(`${rel(file)}: evidence_quality_status must not be present.`);
    // universal, not RF-specific
    if (/(^|[^a-z])rf([^a-z]|$)|rectus|rf-cap|rf_/i.test(o.capacity_id || '') || /(^|_)rf(_|$)|rectus|rectus_femoris/i.test(o.name || '')) err(`${rel(file)}: id/name must be universal (no RF/rectus-specific wording).`);
    // arrays
    for (const ak of ARRAY_KEYS) {
      if (!Array.isArray(o[ak])) err(`${rel(file)}: "${ak}" must be an array.`);
      else if (!o[ak].every((v) => typeof v === 'string')) err(`${rel(file)}: "${ak}" must contain strings only.`);
    }
    if (o.approval_status === 'approved') approvedCount++;
    if (o.executable === true) executableCount++;
    ids.push(o.capacity_id);
    scanForActiveAuthority(file, o);
  }
  const expected = files.map((_, i) => `CAP-${String(i + 1).padStart(3, '0')}`);
  const got = [...ids].sort();
  if (JSON.stringify(got) !== JSON.stringify(expected)) err(`${rel(UNIVERSAL_OBJECTS_DIR)}: CAP IDs must be sequential ${expected[0]}..${expected[expected.length - 1]}; found ${got.join(', ') || '(none)'}.`);
  if (files.length !== EXPECTED_UNIVERSAL_COUNT) err(`${rel(UNIVERSAL_OBJECTS_DIR)}: universal object count must be ${EXPECTED_UNIVERSAL_COUNT}; found ${files.length}.`);
  return { objectCount: files.length, approvedCount, executableCount };
}

function validateRfObjects() {
  if (!expectDir(RF_OBJECTS_DIR, 'rf objects folder')) return { objectCount: 0, approvedCount: 0, executableCount: 0 };
  const files = readdirSync(RF_OBJECTS_DIR).filter((n) => extname(n) === '.json').map((n) => join(RF_OBJECTS_DIR, n));
  if (files.length !== 0) err(`${rel(RF_OBJECTS_DIR)}: RF overlay object count must be 0; found ${files.length}.`);
  for (const file of files) scanForActiveAuthority(file, readJson(file));
  return { objectCount: files.length, approvedCount: 0, executableCount: 0 };
}

expectDir(SYSTEM_DIR, 'capacity knowledge folder');
validateStatus();
validateSchema();
validateTemplate();
validateUniversalSourceMap();
validateRfSourceMap();
const universal = validateUniversalObjects();
const rf = validateRfObjects();

const totalObjects = universal.objectCount + rf.objectCount;
const totalApproved = universal.approvedCount + rf.approvedCount;
const totalExecutable = universal.executableCount + rf.executableCount;
if (totalApproved !== 0) err('capacity: approved object count must be 0.');
if (totalExecutable !== 0) err('capacity: executable object count must be 0.');

if (errors.length > 0) {
  console.error('\n✖ Capacity Knowledge validation FAILED\n');
  for (const error of errors) console.error(`  • ${error}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

console.log('Capacity Knowledge validation PASS');
console.log('Status: universal_cap_batch_1_authored');
console.log(`Universal capacity objects found: ${universal.objectCount}`);
console.log(`RF capacity overlay objects found: ${rf.objectCount}`);
console.log(`Total capacity objects found: ${totalObjects}`);
console.log(`Approved objects: ${totalApproved}`);
console.log(`Executable objects: ${totalExecutable}`);
console.log('Runtime integration: none');
console.log('No active score, threshold, dosage, prescription, progression, readiness, RTT/RTS, or clearance authority found');
process.exit(0);
