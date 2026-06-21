#!/usr/bin/env node
/**
 * scripts/validate-rf-prescription-rules.mjs
 * ---------------------------------------------------------------------------
 * Validator for the RF Prescription / Severity / Recovery Rule Pack v1
 * (lib/clinical/rfPrescriptionRules/**).
 *
 * This is an ENGINEERING / GOVERNANCE check, NOT clinical approval. It confirms
 * the rule pack stays evidence-traceable, non-executable, runtime-detached, and
 * that it never asserts return-to-sport clearance or a confirmed diagnosis in
 * user-facing wording. It also confirms it references (never embeds/mutates)
 * RF-EX / RF-ACT knowledge objects, and that every referenced id exists.
 *
 * No third-party packages. Pure Node ESM.
 * ---------------------------------------------------------------------------
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE = join(ROOT, 'lib/clinical/rfPrescriptionRules');
const PACK_PATH = join(BASE, 'rf/RF_PRESCRIPTION_RULE_PACK_V1.json');
const SCHEMA_PATH = join(BASE, 'schema/rfPrescriptionRulePack.schema.json');
const STATUS_PATH = join(BASE, 'status/rfPrescriptionRulePackStatus.json');
const EX_DIR = join(ROOT, 'lib/clinical/exerciseKnowledge/rf/objects');
const ACT_DIR = join(ROOT, 'lib/clinical/activityExposureKnowledge/rf/objects');

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function readJson(p, label) {
  if (!existsSync(p)) { fail(`${label} missing: ${p}`); return null; }
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { fail(`${label} is not valid JSON: ${e.message}`); return null; }
}

const REQUIRED_SECTIONS = [
  'governance', 'severity_rules', 'confidence_policy_references',
  'recovery_window_rules', 'phase_model', 'dosage_rules', 'progression_rules',
  'regression_rules', 'daily_check_in_rules', 'exercise_family_mapping',
  'activity_exposure_mapping', 'evidence_source_map'
];
const RULE_ARRAY_SECTIONS = [
  'severity_rules', 'recovery_window_rules', 'phase_model', 'dosage_rules',
  'progression_rules', 'regression_rules', 'daily_check_in_rules'
];
const VALID_EVIDENCE_STATUS = ['direct', 'indirect', 'extrapolated', 'gap'];

// --- forbidden phrases, scanned ONLY in user-facing wording fields ---------
const USER_FACING_KEYS = new Set(['user_facing_wording']);
const FORBIDDEN_USER_FACING = [
  'cleared to play', 'cleared for sport', 'cleared to return', 'you are cleared',
  'return to sport', 'return to play', 'ready to play', 'ready to return',
  'ready for sport', 'you definitely have', 'confirmed diagnosis',
  'you have a rectus femoris tear', 'guaranteed', 'will return in'
];

const schema = readJson(SCHEMA_PATH, 'schema');
const status = readJson(STATUS_PATH, 'status');
const pack = readJson(PACK_PATH, 'rule pack');

if (pack) {
  // 1. required sections
  for (const s of REQUIRED_SECTIONS) {
    if (!(s in pack)) fail(`rule pack missing required section: ${s}`);
  }

  // 2. governance status invariants
  const g = pack.governance || {};
  if (g.injury_module !== 'rectus_femoris') fail(`governance.injury_module must be rectus_femoris (got ${g.injury_module})`);
  if (g.approval_status !== 'pending') fail(`governance.approval_status must be pending (got ${g.approval_status})`);
  if (g.clinical_approval_status !== 'not_approved') fail(`governance.clinical_approval_status must be not_approved (got ${g.clinical_approval_status})`);
  if (g.executable_status !== 'non_executable_until_engine_review') fail(`governance.executable_status must be non_executable_until_engine_review (got ${g.executable_status})`);
  if (g.runtime_integration !== 'none') fail(`governance.runtime_integration must be none (got ${g.runtime_integration})`);

  // 3. each rule has source_ids OR an explicit gap marker, and a valid evidence_status
  for (const section of RULE_ARRAY_SECTIONS) {
    const arr = pack[section];
    if (!Array.isArray(arr)) { fail(`section ${section} must be an array`); continue; }
    arr.forEach((rule, i) => {
      const id = rule.rule_id || rule.phase_id || `#${i}`;
      const hasSource = Array.isArray(rule.source_ids) && rule.source_ids.length > 0;
      const isGap = rule.gap === true || rule.evidence_status === 'gap';
      if (!hasSource && !isGap) fail(`${section}[${id}] has neither source_ids nor an explicit gap marker`);
      if (!('evidence_status' in rule)) fail(`${section}[${id}] missing evidence_status (every prescription/severity/recovery rule must declare it)`);
      else if (!VALID_EVIDENCE_STATUS.includes(rule.evidence_status)) fail(`${section}[${id}] invalid evidence_status: ${rule.evidence_status}`);
      if (isGap && rule.requires_clinician_review !== true && !rule.gap_notes) warn(`${section}[${id}] is a gap but has no requires_clinician_review/gap_notes`);
    });
  }

  // 3b. dosage rules: any concrete prescription number MUST carry evidence_status
  //     (here they are intentionally null gaps; if a number ever appears, enforce it)
  const NUM_FIELDS = ['sets_range', 'reps_range', 'hold_time', 'duration', 'rest', 'tempo', 'frequency', 'min_estimate', 'max_estimate'];
  for (const section of ['dosage_rules', 'recovery_window_rules']) {
    (pack[section] || []).forEach((rule) => {
      const id = rule.rule_id || 'unknown';
      const hasNumber = NUM_FIELDS.some((f) => rule[f] !== null && rule[f] !== undefined && rule[f] !== '');
      if (hasNumber && !rule.evidence_status) fail(`${section}[${id}] contains a prescription number but no evidence_status`);
      if (hasNumber && rule.evidence_status === 'gap') warn(`${section}[${id}] is marked gap yet carries a concrete number — confirm this is intended/labelled`);
    });
  }

  // 4. no return-to-sport clearance / confirmed-diagnosis language in user-facing wording
  (function scan(node, path) {
    if (Array.isArray(node)) { node.forEach((v, i) => scan(v, `${path}[${i}]`)); return; }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        if (USER_FACING_KEYS.has(k) && typeof v === 'string') {
          const low = v.toLowerCase();
          for (const bad of FORBIDDEN_USER_FACING) {
            if (low.includes(bad)) fail(`forbidden user-facing phrase "${bad}" in ${path}.${k}`);
          }
        }
        scan(v, `${path}.${k}`);
      }
    }
  })(pack, 'pack');

  // 5. confidence cap remains below 85% for self-report (and below 90% for mixed)
  const caps = (pack.confidence_policy_references || {}).hard_caps || {};
  if (!(caps.digital_or_self_report_confidence_cap_percent < 85)) fail(`self-report confidence cap must be < 85 (got ${caps.digital_or_self_report_confidence_cap_percent})`);
  if (!(caps.mixed_digital_plus_clinician_reviewed_cap_percent < 90)) fail(`mixed confidence cap must be < 90 (got ${caps.mixed_digital_plus_clinician_reviewed_cap_percent})`);

  // 6. activity-exposure rules never create clearance
  const acts = pack.activity_exposure_mapping || [];
  if (!Array.isArray(acts) || acts.length === 0) fail('activity_exposure_mapping must be a non-empty array');
  acts.forEach((a) => {
    if (a.clearance_authority !== false) fail(`activity_exposure ${a.activity_exposure_id}: clearance_authority must be false`);
  });
  const stmt = (pack.activity_exposure_statement || '').toLowerCase();
  if (!stmt.includes('does not clear')) fail('activity_exposure_statement must state it does not clear the athlete');

  // 7. daily check-in rules affect today's selected session only
  (pack.daily_check_in_rules || []).forEach((d) => {
    const id = d.rule_id || 'unknown';
    if (d.selected_session_only !== true) fail(`daily_check_in[${id}] selected_session_only must be true`);
    if (d.future_days_changed !== false) fail(`daily_check_in[${id}] future_days_changed must be false`);
  });

  // 8. id-reference integrity — referenced RF-EX / RF-ACT ids must be strings and exist
  //    (this proves the pack REFERENCES, never embeds/mutates, knowledge objects)
  const exExists = (id) => existsSync(join(EX_DIR, `${id}.json`));
  const actExists = (id) => existsSync(join(ACT_DIR, `${id}.json`));
  const EX_KEYS = ['eligible_rf_ex_ids', 'alternative_rf_ex_ids', 'withheld_rf_ex_ids', 'high_caution_ids', 'manual_review_required_ids'];
  let exRefCount = 0, actRefCount = 0;
  (pack.exercise_family_mapping || []).forEach((m) => {
    for (const key of EX_KEYS) {
      const ids = m[key] || [];
      if (!Array.isArray(ids)) { fail(`exercise_family_mapping ${m.phase}/${m.exercise_family}: ${key} must be an array`); continue; }
      ids.forEach((id) => {
        exRefCount++;
        if (typeof id !== 'string' || !/^RF-EX-\d{3}$/.test(id)) fail(`exercise_family_mapping ${m.exercise_family}: bad RF-EX id reference "${id}"`);
        else if (!exExists(id)) fail(`exercise_family_mapping ${m.exercise_family}: RF-EX id "${id}" does not exist on disk`);
      });
    }
  });
  acts.forEach((a) => {
    actRefCount++;
    const id = a.activity_exposure_id;
    if (typeof id !== 'string' || !/^RF-ACT-\d{3}$/.test(id)) fail(`activity_exposure_mapping: bad RF-ACT id "${id}"`);
    else if (!actExists(id)) fail(`activity_exposure_mapping: RF-ACT id "${id}" does not exist on disk`);
  });

  // 9. evidence source map present with claims
  const esm = pack.evidence_source_map || {};
  if (!esm.claims || typeof esm.claims !== 'object' || Object.keys(esm.claims).length === 0) {
    fail('evidence_source_map.claims must be a non-empty object');
  }

  // --- status file invariants ---
  if (status) {
    if (status.approval_status !== 'pending') fail('status.approval_status must be pending');
    if (status.clinical_approval_status !== 'not_approved') fail('status.clinical_approval_status must be not_approved');
    if (status.runtime_integration !== 'none') fail('status.runtime_integration must be none');
    if (status.executable_status !== 'non_executable_until_engine_review') fail('status.executable_status must be non_executable_until_engine_review');
  }

  // schema sanity
  if (schema && Array.isArray(schema.required)) {
    for (const s of REQUIRED_SECTIONS) {
      if (!schema.required.includes(s)) warn(`schema.required does not list section "${s}"`);
    }
  }

  // --- concise PASS summary ---
  if (errors.length === 0) {
    const gapCount = RULE_ARRAY_SECTIONS.reduce((n, s) => n + (pack[s] || []).filter((r) => r.gap === true || r.evidence_status === 'gap').length, 0);
    const ruleCount = RULE_ARRAY_SECTIONS.reduce((n, s) => n + (pack[s] || []).length, 0);
    console.log('RF Prescription Rule Pack validation PASS');
    console.log(`Sections: ${REQUIRED_SECTIONS.length} present`);
    console.log(`Rules across prescription sections: ${ruleCount} (gap-marked: ${gapCount})`);
    console.log(`Phases: ${(pack.phase_model || []).length}  |  RF-EX refs: ${exRefCount}  |  RF-ACT refs: ${actRefCount}`);
    console.log('Status: pending / not_approved / non_executable_until_engine_review / runtime none');
    console.log('Self-report confidence cap < 85% confirmed; activity exposure grants no clearance; check-in affects today only');
    if (warnings.length) { console.log(`Warnings (${warnings.length}):`); warnings.forEach((w) => console.log('  - ' + w)); }
    process.exit(0);
  }
}

console.error('RF Prescription Rule Pack validation FAIL');
errors.forEach((e) => console.error('  ✗ ' + e));
if (warnings.length) warnings.forEach((w) => console.error('  ! ' + w));
process.exit(1);
