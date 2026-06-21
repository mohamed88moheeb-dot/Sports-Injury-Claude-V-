#!/usr/bin/env node
/**
 * Evidence Linking Knowledge validation (v1 — RF-ASSESS to CAP map).
 *
 * Validates one inert assessment-to-capacity mapping document. Treats every file
 * as inert JSON data (never import()-ed or evaluated). The map is metadata only:
 * it describes which RF-ASSESS finding qualitatively informs which universal CAP
 * capacity. It carries NO score, threshold, pass/fail decision, prescription,
 * dosage, progression, readiness, RTT/RTS, diagnosis, triage, or clearance authority.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const SYSTEM_DIR = resolve(REPO_ROOT, 'lib/clinical/evidenceLinkingKnowledge');

const STATUS_PATH = join(SYSTEM_DIR, 'status/evidenceLinkingKnowledgeStatus.json');
const SCHEMA_PATH = join(SYSTEM_DIR, 'schema/evidenceLinkMap.schema.json');
const TEMPLATE_PATH = join(SYSTEM_DIR, 'templates/evidenceLinkMapTemplate.json');
const SOURCE_MAP_PATH = join(SYSTEM_DIR, 'rf/source/rfEvidenceLinkingSourceMap.json');
const MAPS_DIR = join(SYSTEM_DIR, 'rf/maps');
const MAP_PATH = join(MAPS_DIR, 'RF-ASSESS-TO-CAP-MAP-001.json');

const ASSESS_OBJECTS_DIR = resolve(REPO_ROOT, 'lib/clinical/assessmentKnowledge/rf/objects');
const CAP_OBJECTS_DIR = resolve(REPO_ROOT, 'lib/clinical/capacityKnowledge/universal/objects');

const EXPECTED_MAP_ID = 'RF-ASSESS-TO-CAP-MAP-001';
const EXPECTED_LINK_COUNT = 26;
const ALLOWED_SIGNAL_TYPES = new Set([
  'supports_capacity', 'limits_capacity_confidence', 'requires_caution', 'requires_clinician_confirmation',
  'does_not_inform_capacity', 'safety_context_only', 'diagnostic_context_only', 'monitoring_context',
]);
const HIGH_CAUTION_ASSESS = new Set(['RF-ASSESS-015', 'RF-ASSESS-016', 'RF-ASSESS-018']);
const DIAGNOSTIC_ASSESS = new Set(['RF-ASSESS-007', 'RF-ASSESS-008', 'RF-ASSESS-009']);
const NO_CAP_LINK_ASSESS = new Set(['RF-ASSESS-001', 'RF-ASSESS-002']);
const EXPECTED_017_CAPS = ['CAP-001', 'CAP-002', 'CAP-003', 'CAP-004', 'CAP-005', 'CAP-006', 'CAP-007', 'CAP-010'];

const PROHIBITED_KEY_PATTERNS = [
  { label: 'active dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|duration|dosage|fixed_dose)$/i },
  { label: 'numeric score / threshold / pass-fail', re: /^(score|numeric_score|percent_score|threshold|pass_fail|passfail|cutoff)$/i },
  { label: 'active prescription', re: /active_prescription|prescribed_(volume|load|tempo|schedule|recovery_interval|session_length|progression_step|target_timeline)/i },
  { label: 'progression authorization', re: /(authori[sz]es?|grants?|creates?)_progression|progression_authori[sz]ation/i },
  { label: 'readiness authorization', re: /(authori[sz]es?|grants?|creates?)_readiness|readiness_authori[sz]ation/i },
  { label: 'clearance authorization', re: /(authori[sz]es?|grants?|creates?)_(clearance|rtt|rts|return_to_(training|sport|play))|clearance_authori[sz]ation/i },
  { label: 'fixed return date', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return/i },
];

const ASSERTIVE_AUTHORITY_PHRASES = [
  /\bready\s+for\b/i, /\bapproved\s+to\s+return\b/i, /\bcleared\s+for\b/i, /\bclearance\s+granted\b/i,
  /\bcleared\s+to\s+(run|sprint|kick|train|play|compete|return)\b/i,
  /\b(rtt|rts|return to (training|sport|play))\s+approved\b/i,
  /\b(authori[sz]es?|grants?)\s+(clearance|progression|readiness|diagnosis|rtt|rts|return to (training|sport|play))\b/i,
];
const NEGATOR_BEFORE = /(\bnot\b|\bnever\b|\bno\b|\bnon[- ]|\bwithout\b|\bcannot\b|n't\b)[^.]{0,28}$/i;

function findActiveAuthorityPhrase(text) {
  for (const re of ASSERTIVE_AUTHORITY_PHRASES) {
    const m = re.exec(text);
    if (!m) continue;
    if (NEGATOR_BEFORE.test(text.slice(0, m.index))) continue;
    return m[0];
  }
  return null;
}

const errors = [];
const err = (m) => errors.push(m);
const rel = (p) => relative(REPO_ROOT, p);
function readJson(p) { return JSON.parse(readFileSync(p, 'utf8')); }

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
function expectFile(p, label) { if (!existsSync(p)) { err(`Missing ${label}: ${rel(p)}`); return false; } return true; }
function expectDir(p, label) { if (!existsSync(p) || !statSync(p).isDirectory()) { err(`Missing ${label}: ${rel(p)}`); return false; } return true; }

function scanForActiveAuthority(p, json) {
  walk(json, (key, value, kp) => {
    for (const pat of PROHIBITED_KEY_PATTERNS) if (pat.re.test(key)) err(`${rel(p)}: prohibited ${pat.label} key "${kp}".`);
    if (typeof value === 'string') {
      const hit = findActiveAuthorityPhrase(value);
      if (hit) err(`${rel(p)}: prohibited active authority language ("${hit}") in "${kp}".`);
    }
  });
}

// existing RF-ASSESS and CAP ids
const assessIds = new Set();
if (expectDir(ASSESS_OBJECTS_DIR, 'RF-ASSESS objects folder')) {
  for (const f of readdirSync(ASSESS_OBJECTS_DIR).filter((n) => extname(n) === '.json')) assessIds.add(f.replace('.json', ''));
}
const capIds = new Set();
if (expectDir(CAP_OBJECTS_DIR, 'universal CAP objects folder')) {
  for (const f of readdirSync(CAP_OBJECTS_DIR).filter((n) => extname(n) === '.json')) capIds.add(f.replace('.json', ''));
}

expectDir(SYSTEM_DIR, 'evidence-linking knowledge folder');
expectFile(SCHEMA_PATH, 'schema');
expectFile(TEMPLATE_PATH, 'template');

function validateStatus() {
  if (!expectFile(STATUS_PATH, 'status file')) return;
  let s; try { s = readJson(STATUS_PATH); } catch (e) { err(`${rel(STATUS_PATH)}: invalid JSON - ${e.message}`); return; }
  if (s.status !== 'rf_assess_to_cap_map_authored') err(`${rel(STATUS_PATH)}: status must be "rf_assess_to_cap_map_authored".`);
  if (s.approval_status !== 'pending') err(`${rel(STATUS_PATH)}: approval_status must be "pending".`);
  if (s.clinical_approval_status !== 'not_approved') err(`${rel(STATUS_PATH)}: clinical_approval_status must be "not_approved".`);
  if (s.executable !== false) err(`${rel(STATUS_PATH)}: executable must be false.`);
  if (s.runtime_integration !== 'none') err(`${rel(STATUS_PATH)}: runtime_integration must be "none".`);
  if (s.evidence_link_maps_authored !== 1) err(`${rel(STATUS_PATH)}: evidence_link_maps_authored must be 1.`);
  if (s.approved_maps !== 0) err(`${rel(STATUS_PATH)}: approved_maps must be 0.`);
  if (s.permitted_use !== 'evidence_linking_metadata_only') err(`${rel(STATUS_PATH)}: permitted_use must be "evidence_linking_metadata_only".`);
  scanForActiveAuthority(STATUS_PATH, s);
}

function validateSourceMap() {
  if (!expectFile(SOURCE_MAP_PATH, 'source map')) return;
  let m; try { m = readJson(SOURCE_MAP_PATH); } catch (e) { err(`${rel(SOURCE_MAP_PATH)}: invalid JSON - ${e.message}`); return; }
  if (m.approval_status !== 'pending') err(`${rel(SOURCE_MAP_PATH)}: approval_status must be "pending".`);
  if (m.clinical_approval_status !== 'not_approved') err(`${rel(SOURCE_MAP_PATH)}: clinical_approval_status must be "not_approved".`);
  if (m.executable !== false) err(`${rel(SOURCE_MAP_PATH)}: executable must be false.`);
  if (m.runtime_integration !== 'none') err(`${rel(SOURCE_MAP_PATH)}: runtime_integration must be "none".`);
  if (m.authored_map_count !== 1) err(`${rel(SOURCE_MAP_PATH)}: authored_map_count must be 1.`);
  if (JSON.stringify(m.authored_map_ids) !== JSON.stringify([EXPECTED_MAP_ID])) err(`${rel(SOURCE_MAP_PATH)}: authored_map_ids must be ["${EXPECTED_MAP_ID}"].`);
  if (m.global_constraints?.rf_cap_objects_referenced !== false) err(`${rel(SOURCE_MAP_PATH)}: rf_cap_objects_referenced must be false.`);
  if (m.global_constraints?.demand_profile_objects_referenced !== false) err(`${rel(SOURCE_MAP_PATH)}: demand_profile_objects_referenced must be false.`);
  scanForActiveAuthority(SOURCE_MAP_PATH, m);
}

function validateMap() {
  if (!expectDir(MAPS_DIR, 'maps folder')) return { mapCount: 0, linkCount: 0 };
  const mapFiles = readdirSync(MAPS_DIR).filter((n) => extname(n) === '.json');
  if (mapFiles.length !== 1) err(`${rel(MAPS_DIR)}: exactly 1 map expected; found ${mapFiles.length}.`);
  if (!expectFile(MAP_PATH, 'map file')) return { mapCount: mapFiles.length, linkCount: 0 };
  let doc; try { doc = readJson(MAP_PATH); } catch (e) { err(`${rel(MAP_PATH)}: invalid JSON - ${e.message}`); return { mapCount: 1, linkCount: 0 }; }

  if (doc.map_id !== EXPECTED_MAP_ID) err(`${rel(MAP_PATH)}: map_id must be "${EXPECTED_MAP_ID}".`);
  if (doc.module !== 'rectus_femoris') err(`${rel(MAP_PATH)}: module must be "rectus_femoris".`);
  if (doc.status !== 'draft') err(`${rel(MAP_PATH)}: status must be "draft".`);
  if (doc.approval_status !== 'pending') err(`${rel(MAP_PATH)}: approval_status must be "pending".`);
  if (doc.clinical_approval_status !== 'not_approved') err(`${rel(MAP_PATH)}: clinical_approval_status must be "not_approved".`);
  if (doc.executable !== false) err(`${rel(MAP_PATH)}: executable must be false.`);
  if (doc.runtime_integration !== 'none') err(`${rel(MAP_PATH)}: runtime_integration must be "none".`);
  if (doc.permitted_use !== 'evidence_linking_metadata_only') err(`${rel(MAP_PATH)}: permitted_use must be "evidence_linking_metadata_only".`);

  const links = Array.isArray(doc.links) ? doc.links : [];
  if (links.length !== EXPECTED_LINK_COUNT) err(`${rel(MAP_PATH)}: links must number ${EXPECTED_LINK_COUNT}; found ${links.length}.`);

  const seventeen = [];
  const linkIds = new Set();
  for (const ln of links) {
    const where = `${rel(MAP_PATH)} link ${ln.link_id || '(no id)'}`;
    if (!ln.link_id || linkIds.has(ln.link_id)) err(`${where}: link_id missing or duplicate.`);
    linkIds.add(ln.link_id);
    if (!/^RF-ASSESS-[0-9]{3}$/.test(ln.assessment_id || '')) err(`${where}: assessment_id malformed.`);
    else if (assessIds.size && !assessIds.has(ln.assessment_id)) err(`${where}: assessment_id "${ln.assessment_id}" does not resolve to an existing RF-ASSESS object.`);
    if (NO_CAP_LINK_ASSESS.has(ln.assessment_id)) err(`${where}: ${ln.assessment_id} must not be a CAP link (context only).`);
    if (/^RF-CAP-/.test(ln.capacity_id || '')) err(`${where}: must not reference RF-CAP objects.`);
    else if (!/^CAP-[0-9]{3}$/.test(ln.capacity_id || '')) err(`${where}: capacity_id malformed.`);
    else if (capIds.size && !capIds.has(ln.capacity_id)) err(`${where}: capacity_id "${ln.capacity_id}" does not resolve to an existing CAP object.`);
    if (!ALLOWED_SIGNAL_TYPES.has(ln.signal_type)) err(`${where}: signal_type "${ln.signal_type}" not allowed.`);
    // no RF-EX / RF-ACT / RF-rule refs anywhere in the link
    walk(ln, (_k, v) => {
      if (typeof v === 'string' && /\bRF-EX-[0-9]{3}\b|\bRF-ACT-[0-9]{3}\b|\bRF-(SAF|DX|SEV|REHAB|RECUR|FIELD|RTS)-[0-9]{3}\b/.test(v)) {
        err(`${where}: link must not reference RF-EX/RF-ACT/RF-rule ids ("${v}").`);
      }
    });
    if (HIGH_CAUTION_ASSESS.has(ln.assessment_id)) {
      if (ln.high_caution_flag !== true) err(`${where}: high_caution_flag must be true.`);
      if (ln.requires_clinician_review !== true) err(`${where}: requires_clinician_review must be true.`);
    }
    if (DIAGNOSTIC_ASSESS.has(ln.assessment_id)) {
      if (ln.diagnostic_context_only !== true) err(`${where}: diagnostic_context_only must be true.`);
      if (!/RF-DX|RF-SAF/.test(String(ln.notes || ''))) err(`${where}: diagnostic-context link notes must defer to RF-DX/RF-SAF.`);
    }
    if (ln.assessment_id === 'RF-ASSESS-017') seventeen.push(ln.capacity_id);
  }
  const got17 = [...seventeen].sort();
  if (JSON.stringify(got17) !== JSON.stringify([...EXPECTED_017_CAPS].sort())) {
    err(`${rel(MAP_PATH)}: RF-ASSESS-017 must link to ${EXPECTED_017_CAPS.join('/')}; found ${got17.join('/') || '(none)'}.`);
  }
  scanForActiveAuthority(MAP_PATH, doc);
  return { mapCount: 1, linkCount: links.length };
}

validateStatus();
validateSourceMap();
const counts = validateMap();

if (errors.length > 0) {
  console.error('\n✖ Evidence Linking Knowledge validation FAILED\n');
  for (const e of errors) console.error(`  • ${e}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

console.log(`Evidence Linking Knowledge PASS — maps ${counts.mapCount} / links ${counts.linkCount} / approved 0 / executable 0 / runtime none`);
process.exit(0);
