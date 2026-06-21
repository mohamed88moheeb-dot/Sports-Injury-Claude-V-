#!/usr/bin/env node
/**
 * Assessment Knowledge validation (v2 — RF-ASSESS Batch 1).
 *
 * RF-ASSESS objects are authored (Batch 1 = 18). Nothing may be approved or
 * executable; the system stays runtime-disconnected and metadata-only. Assessment
 * objects gather qualitative evidence about universal CAP-### capacities; they never
 * carry a score, threshold, pass/fail decision, timeline, dosage, prescription,
 * diagnosis, autonomous triage, progression, readiness, RTT/RTS, or clearance authority.
 *
 * Treats every file as inert JSON data (never import()-ed or evaluated).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const SYSTEM_DIR = resolve(REPO_ROOT, 'lib/clinical/assessmentKnowledge');

const STATUS_PATH = join(SYSTEM_DIR, 'status/assessmentKnowledgeStatus.json');
const SCHEMA_PATH = join(SYSTEM_DIR, 'schema/assessmentObject.schema.json');
const TEMPLATE_PATH = join(SYSTEM_DIR, 'templates/assessmentObjectTemplate.json');
const OBJECTS_DIR = join(SYSTEM_DIR, 'rf/objects');
const SOURCE_MAP_PATH = join(SYSTEM_DIR, 'rf/source/rfAssessmentSourceMap.json');
const CAP_OBJECTS_DIR = resolve(REPO_ROOT, 'lib/clinical/capacityKnowledge/universal/objects');
const PURPOSE_TAXONOMY_PATH = resolve(REPO_ROOT, 'lib/clinical/sharedKnowledgeTaxonomies/assessmentPurposeTaxonomy.json');

const EXPECTED_COUNT = 18;
const EXPECTED_ASSESSMENT_IDS = Array.from({ length: EXPECTED_COUNT }, (_, i) => `RF-ASSESS-${String(i + 1).padStart(3, '0')}`);

// Exact CAP coverage map: which RF-ASSESS objects must reference each universal CAP.
const EXPECTED_CAP_COVERAGE = {
  'CAP-001': ['RF-ASSESS-003', 'RF-ASSESS-017'],
  'CAP-002': ['RF-ASSESS-004', 'RF-ASSESS-017'],
  'CAP-003': ['RF-ASSESS-013', 'RF-ASSESS-017'],
  'CAP-004': ['RF-ASSESS-014', 'RF-ASSESS-017'],
  'CAP-005': ['RF-ASSESS-015', 'RF-ASSESS-017'],
  'CAP-006': ['RF-ASSESS-014', 'RF-ASSESS-015', 'RF-ASSESS-017'],
  'CAP-007': ['RF-ASSESS-016', 'RF-ASSESS-017'],
  'CAP-008': ['RF-ASSESS-005'],
  'CAP-009': ['RF-ASSESS-006'],
  'CAP-010': ['RF-ASSESS-007', 'RF-ASSESS-008', 'RF-ASSESS-009', 'RF-ASSESS-017'],
  'CAP-011': ['RF-ASSESS-010'],
  'CAP-012': ['RF-ASSESS-011'],
  'CAP-013': ['RF-ASSESS-012'],
  'CAP-014': ['RF-ASSESS-012'],
  'CAP-015': ['RF-ASSESS-018'],
};
// Only these assessments may carry an empty capacities_measured_or_informed array.
const EMPTY_CAPACITY_ALLOWED = new Set(['RF-ASSESS-001', 'RF-ASSESS-002']);

const REQUIRED_OBJECT_KEYS = [
  'assessment_id', 'name', 'module', 'assessment_status', 'approval_status',
  'clinical_approval_status', 'executable', 'runtime_integration', 'permitted_use',
  'assessment_purpose_category', 'what_it_observes', 'capacities_measured_or_informed',
  'rf_relevance', 'user_facing_question_or_prompt', 'clinician_facing_note',
  'evidence_contribution', 'limitations', 'high_caution_flag', 'governance_notes',
  'allowed_when', 'blocked_when', 'notes',
];

const HIGH_CAUTION_IDS = ['RF-ASSESS-015', 'RF-ASSESS-016', 'RF-ASSESS-018'];
const HIGH_CAUTION_FRAGMENTS = [
  'metadata only', 'not a readiness test', 'not sprint clearance', 'not kicking clearance',
  'not RTS clearance', 'not competition clearance', 'not a progression gate',
  'requires future clinical review before runtime use',
];
const RED_FLAG_ID = 'RF-ASSESS-002';
const RED_FLAG_FRAGMENTS = ['Caution/referral support only', 'not diagnosis', 'RF-SAF rules remain safety authority'];

const REQUIRED_STATUS_NOTE_FRAGMENTS = [
  'RF-ASSESS Batch 1 authored as draft metadata only',
  'No assessment objects approved',
  'No runtime behavior',
  'No diagnosis authority',
  'No autonomous triage',
  'No prescription',
  'No dosage',
  'No progression',
  'No readiness',
  'No RTT/RTS',
  'No clearance authority',
];

const PROHIBITED_KEY_PATTERNS = [
  { label: 'active dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|duration|dosage|fixed_dose)$/i },
  { label: 'active prescription', re: /active_prescription|prescribed_(volume|load|tempo|schedule|recovery_interval|session_length|progression_step|target_timeline)/i },
  { label: 'numeric score / threshold / pass-fail', re: /^(score|assessment_score|numeric_score|percent_score|threshold|pass_fail|passfail|cutoff)$/i },
  { label: 'diagnosis authority', re: /(authori[sz]es?|grants?|creates?|makes?)_diagnosis|diagnosis_authori[sz]ation/i },
  { label: 'autonomous triage', re: /(autonomous|automatic)_triage|triage_decision_authori[sz]ation/i },
  { label: 'progression authorization', re: /(authori[sz]es?|grants?|creates?)_progression|progression_authori[sz]ation/i },
  { label: 'readiness authorization', re: /(authori[sz]es?|grants?|creates?)_readiness|readiness_authori[sz]ation/i },
  { label: 'clearance authorization', re: /(authori[sz]es?|grants?|creates?)_(clearance|rtt|rts|return_to_(training|sport|play))|clearance_authori[sz]ation/i },
  { label: 'fixed return date', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return/i },
];

// Active-authority PHRASES. Each is flagged only when NOT negated (see isNegated).
// This avoids false positives on negated governance language such as
// "not a readiness test", "not sprint clearance", "No clearance authority".
const ASSERTIVE_AUTHORITY_PHRASES = [
  /\bready\s+for\b/i,
  /\bapproved\s+to\s+return\b/i,
  /\bcleared\s+for\b/i,
  /\bclearance\s+granted\b/i,
  /\bcleared\s+to\s+(run|sprint|kick|train|play|compete|return)\b/i,
  /\b(rtt|rts|return to (training|sport|play))\s+approved\b/i,
  /\b(authori[sz]es?|grants?)\s+(clearance|progression|readiness|diagnosis|rtt|rts|return to (training|sport|play))\b/i,
];
// A negator appearing shortly before the phrase (same clause) makes it benign.
const NEGATOR_BEFORE = /(\bnot\b|\bnever\b|\bno\b|\bnon[- ]|\bwithout\b|\bcannot\b|n't\b)[^.]{0,28}$/i;

function findActiveAuthorityPhrase(text) {
  for (const re of ASSERTIVE_AUTHORITY_PHRASES) {
    const m = re.exec(text);
    if (!m) continue;
    const before = text.slice(0, m.index);
    if (NEGATOR_BEFORE.test(before)) continue; // negated -> benign governance language
    return m[0];
  }
  return null;
}

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
      const hit = findActiveAuthorityPhrase(value);
      if (hit) err(`${rel(path)}: prohibited active authority language ("${hit}") in "${keyPath}".`);
    }
  });
}

// available universal CAP ids + assessment-purpose taxonomy categories
const capIds = new Set();
if (expectDir(CAP_OBJECTS_DIR, 'universal CAP objects folder')) {
  for (const f of readdirSync(CAP_OBJECTS_DIR).filter((n) => extname(n) === '.json')) {
    capIds.add(f.replace('.json', ''));
  }
}
const purposeCategories = new Set();
if (expectFile(PURPOSE_TAXONOMY_PATH, 'assessment-purpose taxonomy')) {
  try { for (const c of readJson(PURPOSE_TAXONOMY_PATH).categories || []) purposeCategories.add(c.id); }
  catch (e) { err(`${rel(PURPOSE_TAXONOMY_PATH)}: invalid JSON - ${e.message}`); }
}

function validateStatus() {
  if (!expectFile(STATUS_PATH, 'status file')) return;
  let status;
  try { status = readJson(STATUS_PATH); } catch (e) { err(`${rel(STATUS_PATH)}: invalid JSON - ${e.message}`); return; }
  if (status.status !== 'rf_assess_batch_1_authored') err(`${rel(STATUS_PATH)}: status must be "rf_assess_batch_1_authored".`);
  if (status.approval_status !== 'pending') err(`${rel(STATUS_PATH)}: approval_status must be "pending".`);
  if (status.clinical_approval_status !== 'not_approved') err(`${rel(STATUS_PATH)}: clinical_approval_status must be "not_approved".`);
  if (status.executable !== false) err(`${rel(STATUS_PATH)}: executable must be false.`);
  if (status.runtime_integration !== 'none') err(`${rel(STATUS_PATH)}: runtime_integration must be "none".`);
  if (status.assessment_objects_authored !== EXPECTED_COUNT) err(`${rel(STATUS_PATH)}: assessment_objects_authored must be ${EXPECTED_COUNT}.`);
  if (status.assessment_objects_approved !== 0) err(`${rel(STATUS_PATH)}: assessment_objects_approved must be 0.`);
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
  if (schema.properties?.assessment_status?.enum?.join('|') !== 'draft') err(`${rel(SCHEMA_PATH)}: assessment_status must support draft only.`);
  if (schema.properties?.approval_status?.enum?.join('|') !== 'pending') err(`${rel(SCHEMA_PATH)}: approval_status must support pending only.`);
  if (schema.properties?.clinical_approval_status?.enum?.join('|') !== 'not_approved') err(`${rel(SCHEMA_PATH)}: clinical_approval_status must be not_approved.`);
  if (schema.properties?.executable?.const !== false) err(`${rel(SCHEMA_PATH)}: executable const must be false.`);
  if (schema.properties?.runtime_integration?.enum?.join('|') !== 'none') err(`${rel(SCHEMA_PATH)}: runtime_integration must be none.`);
  if (schema.properties?.permitted_use?.enum?.join('|') !== 'assessment_metadata_only') err(`${rel(SCHEMA_PATH)}: permitted_use must be assessment_metadata_only.`);
  scanForActiveAuthority(SCHEMA_PATH, schema);
}

function validateTemplate() {
  if (!expectFile(TEMPLATE_PATH, 'template')) return;
  let template;
  try { template = readJson(TEMPLATE_PATH); } catch (e) { err(`${rel(TEMPLATE_PATH)}: invalid JSON - ${e.message}`); return; }
  for (const key of REQUIRED_OBJECT_KEYS) {
    if (!(key in template)) err(`${rel(TEMPLATE_PATH)}: template missing required key "${key}".`);
  }
  if (template.assessment_id !== '') err(`${rel(TEMPLATE_PATH)}: assessment_id must stay blank.`);
  if (template.module !== 'rectus_femoris') err(`${rel(TEMPLATE_PATH)}: module must be "rectus_femoris".`);
  if (template.assessment_status !== 'draft') err(`${rel(TEMPLATE_PATH)}: assessment_status must be "draft".`);
  if (template.approval_status !== 'pending') err(`${rel(TEMPLATE_PATH)}: approval_status must be "pending".`);
  if (template.clinical_approval_status !== 'not_approved') err(`${rel(TEMPLATE_PATH)}: clinical_approval_status must be "not_approved".`);
  if (template.executable !== false) err(`${rel(TEMPLATE_PATH)}: executable must be false.`);
  if (template.runtime_integration !== 'none') err(`${rel(TEMPLATE_PATH)}: runtime_integration must be "none".`);
  if (template.permitted_use !== 'assessment_metadata_only') err(`${rel(TEMPLATE_PATH)}: permitted_use must be assessment_metadata_only.`);
  scanForActiveAuthority(TEMPLATE_PATH, template);
}

function validateSourceMap() {
  if (!expectFile(SOURCE_MAP_PATH, 'source map')) return;
  let m;
  try { m = readJson(SOURCE_MAP_PATH); } catch (e) { err(`${rel(SOURCE_MAP_PATH)}: invalid JSON - ${e.message}`); return; }
  if (m.approval_status !== 'pending') err(`${rel(SOURCE_MAP_PATH)}: approval_status must be "pending".`);
  if (m.clinical_approval_status !== 'not_approved') err(`${rel(SOURCE_MAP_PATH)}: clinical_approval_status must be "not_approved".`);
  if (m.executable !== false) err(`${rel(SOURCE_MAP_PATH)}: executable must be false.`);
  if (m.runtime_integration !== 'none') err(`${rel(SOURCE_MAP_PATH)}: runtime_integration must be "none".`);
  if (m.authored_object_count !== EXPECTED_COUNT) err(`${rel(SOURCE_MAP_PATH)}: authored_object_count must be ${EXPECTED_COUNT}.`);
  if (!Array.isArray(m.authored_assessment_ids) || JSON.stringify(m.authored_assessment_ids) !== JSON.stringify(EXPECTED_ASSESSMENT_IDS)) {
    err(`${rel(SOURCE_MAP_PATH)}: authored_assessment_ids must be exactly RF-ASSESS-001..RF-ASSESS-${String(EXPECTED_COUNT).padStart(3, '0')} in order.`);
  }
  if (m.global_constraints?.rf_assess_objects_created !== true) err(`${rel(SOURCE_MAP_PATH)}: rf_assess_objects_created must be true.`);
  if (m.global_constraints?.rf_cap_objects_referenced !== false) err(`${rel(SOURCE_MAP_PATH)}: rf_cap_objects_referenced must be false.`);
  if (m.global_constraints?.demand_profile_objects_referenced !== false) err(`${rel(SOURCE_MAP_PATH)}: demand_profile_objects_referenced must be false.`);
  scanForActiveAuthority(SOURCE_MAP_PATH, m);
}

function validateObjects() {
  if (!expectDir(OBJECTS_DIR, 'objects folder')) return { objectCount: 0, approvedCount: 0, executableCount: 0 };
  const files = readdirSync(OBJECTS_DIR).filter((n) => extname(n) === '.json').sort().map((n) => join(OBJECTS_DIR, n));
  let approvedCount = 0, executableCount = 0;
  const ids = [];
  const actualCoverage = {}; // capId -> [assessment_id, ...]
  for (const file of files) {
    const base = file.split('/').pop().replace('.json', '');
    let o;
    try { o = readJson(file); } catch (e) { err(`${rel(file)}: invalid JSON - ${e.message}`); continue; }
    for (const key of REQUIRED_OBJECT_KEYS) { if (!(key in o)) err(`${rel(file)}: missing required key "${key}".`); }
    if (o.assessment_id !== base) err(`${rel(file)}: assessment_id "${o.assessment_id}" must match filename "${base}".`);
    if (!/^RF-ASSESS-[0-9]{3}$/.test(o.assessment_id || '')) err(`${rel(file)}: assessment_id must look like RF-ASSESS-001.`);
    if (o.module !== 'rectus_femoris') err(`${rel(file)}: module must be "rectus_femoris".`);
    if (o.assessment_status !== 'draft') err(`${rel(file)}: assessment_status must be "draft".`);
    if (o.approval_status !== 'pending') err(`${rel(file)}: approval_status must be "pending".`);
    if (o.clinical_approval_status !== 'not_approved') err(`${rel(file)}: clinical_approval_status must be "not_approved".`);
    if (o.runtime_integration !== 'none') err(`${rel(file)}: runtime_integration must be "none".`);
    if (o.permitted_use !== 'assessment_metadata_only') err(`${rel(file)}: permitted_use must be "assessment_metadata_only".`);
    if (typeof o.high_caution_flag !== 'boolean') err(`${rel(file)}: high_caution_flag must be boolean.`);
    // purpose category in taxonomy
    if (purposeCategories.size && !purposeCategories.has(o.assessment_purpose_category)) err(`${rel(file)}: assessment_purpose_category "${o.assessment_purpose_category}" not in assessmentPurposeTaxonomy.`);
    // capacity references resolve to existing CAP objects; no RF-CAP / demand refs
    if (!Array.isArray(o.capacities_measured_or_informed)) err(`${rel(file)}: capacities_measured_or_informed must be an array.`);
    else {
      if (o.capacities_measured_or_informed.length === 0 && !EMPTY_CAPACITY_ALLOWED.has(o.assessment_id)) {
        err(`${rel(file)}: capacities_measured_or_informed may be empty only for RF-ASSESS-001/002; ${o.assessment_id} must reference at least one CAP-###.`);
      }
      for (const c of o.capacities_measured_or_informed) {
        if (/^RF-CAP-/.test(c)) err(`${rel(file)}: must not reference RF-CAP objects ("${c}").`);
        else if (!/^CAP-[0-9]{3}$/.test(c)) err(`${rel(file)}: capacity reference "${c}" must be a CAP-### id.`);
        else {
          if (capIds.size && !capIds.has(c)) err(`${rel(file)}: capacity reference "${c}" does not resolve to an existing universal CAP object.`);
          (actualCoverage[c] ||= []).push(o.assessment_id);
        }
      }
    }
    // high-caution language
    if (HIGH_CAUTION_IDS.includes(o.assessment_id)) {
      if (o.high_caution_flag !== true) err(`${rel(file)}: high_caution_flag must be true for ${o.assessment_id}.`);
      const gov = String(o.governance_notes || '');
      for (const frag of HIGH_CAUTION_FRAGMENTS) if (!gov.includes(frag)) err(`${rel(file)}: governance_notes must include "${frag}".`);
    }
    // red-flag object caution/referral-only language
    if (o.assessment_id === RED_FLAG_ID) {
      const gov = String(o.governance_notes || '');
      for (const frag of RED_FLAG_FRAGMENTS) if (!gov.includes(frag)) err(`${rel(file)}: red-flag governance_notes must include "${frag}".`);
    }
    if (o.approval_status === 'approved') approvedCount++;
    if (o.executable === true) executableCount++;
    ids.push(o.assessment_id);
    scanForActiveAuthority(file, o);
  }
  const expected = files.map((_, i) => `RF-ASSESS-${String(i + 1).padStart(3, '0')}`);
  const got = [...ids].sort();
  if (JSON.stringify(got) !== JSON.stringify(expected)) err(`${rel(OBJECTS_DIR)}: IDs must be sequential ${expected[0]}..${expected[expected.length - 1]}; found ${got.join(', ') || '(none)'}.`);
  if (files.length !== EXPECTED_COUNT) err(`${rel(OBJECTS_DIR)}: object count must be ${EXPECTED_COUNT}; found ${files.length}.`);
  if (approvedCount !== 0) err(`${rel(OBJECTS_DIR)}: approved object count must be 0.`);
  if (executableCount !== 0) err(`${rel(OBJECTS_DIR)}: executable object count must be 0.`);

  // Exact CAP coverage map enforcement.
  for (const [cap, expected] of Object.entries(EXPECTED_CAP_COVERAGE)) {
    const got = (actualCoverage[cap] || []).slice().sort();
    const want = expected.slice().sort();
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      err(`${rel(OBJECTS_DIR)}: CAP coverage for ${cap} must be [${want.join(', ')}]; found [${got.join(', ') || '(none)'}].`);
    }
  }
  for (const cap of Object.keys(actualCoverage)) {
    if (!(cap in EXPECTED_CAP_COVERAGE)) err(`${rel(OBJECTS_DIR)}: unexpected capacity "${cap}" referenced (not in coverage map).`);
  }
  return { objectCount: files.length, approvedCount, executableCount };
}

expectDir(SYSTEM_DIR, 'assessment knowledge folder');
validateStatus();
validateSchema();
validateTemplate();
validateSourceMap();
const counts = validateObjects();

if (errors.length > 0) {
  console.error('\n✖ Assessment Knowledge validation FAILED\n');
  for (const error of errors) console.error(`  • ${error}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

console.log('Assessment Knowledge validation PASS');
console.log('Status: rf_assess_batch_1_authored');
console.log(`RF-ASSESS objects found: ${counts.objectCount}`);
console.log(`Approved objects: ${counts.approvedCount}`);
console.log(`Executable objects: ${counts.executableCount}`);
console.log('Runtime integration: none');
console.log('No active diagnosis, triage, dosage, prescription, progression, readiness, RTT/RTS, or clearance authority found');
process.exit(0);
