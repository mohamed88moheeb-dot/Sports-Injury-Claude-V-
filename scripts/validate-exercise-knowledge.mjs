#!/usr/bin/env node
/**
 * scripts/validate-exercise-knowledge.mjs
 * ---------------------------------------------------------------------------
 * RF EXERCISE KNOWLEDGE VALIDATION SCAFFOLD (structural, NON-EXECUTABLE, NOT approval)
 *
 * Validates the SHAPE, STATUS DISCIPLINE, and DOSAGE/CLEARANCE PROHIBITIONS of
 * the Exercise Knowledge System. Exercise objects are treated as inert JSON
 * metadata — never import()-ed or evaluated. The system holds RF exercise
 * metadata only: it must NOT carry active dosage, sets/reps/frequency/rest/
 * intensity/duration, return dates, progression increments as prescription,
 * diagnosis authority, rehab-plan authority, or RTT/RTS clearance.
 *
 * Checks:
 *   1. Status file: clinical_approval_status not_approved, executable:false,
 *      exercise_objects_approved: 0.
 *   2. Schema + template load and the template is structurally blank/non-executable.
 *   3. Exercise objects under lib/clinical/exerciseKnowledge/rf/objects/ (if any):
 *      required keys, status discipline, and absence of dosage/clearance authority.
 *   4. Passes cleanly with zero objects.
 *
 * Uses only built-in Node modules. Imports nothing from the app or any
 * quarantined legacy module.
 * ---------------------------------------------------------------------------
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, join, extname } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');

const EK_DIR = resolve(REPO_ROOT, 'lib/clinical/exerciseKnowledge');
const STATUS_PATH = join(EK_DIR, 'status/exerciseKnowledgeStatus.json');
const SCHEMA_PATH = join(EK_DIR, 'schema/exerciseObject.schema.json');
const TEMPLATE_PATH = join(EK_DIR, 'templates/exerciseObjectTemplate.json');
const OBJECTS_DIR = join(EK_DIR, 'rf/objects');

const REQUIRED_KEYS = [
  'exercise_id', 'module', 'name', 'aliases', 'exercise_status', 'approval_status',
  'executable', 'permitted_use', 'body_region', 'target_tissues', 'exercise_family',
  'primary_function', 'movement_category', 'joint_actions', 'contraction_bias',
  'position_tags', 'tissue_demand_tags', 'speed_power_demand', 'stretch_demand',
  'impact_demand', 'field_demand_tags', 'equipment', 'setup_summary', 'coaching_cues',
  'common_errors', 'contraindications', 'safety_blockers', 'prerequisites',
  'allowed_when', 'blocked_when', 'monitoring_triggers', 'progression_options',
  'regression_options', 'substitution_options', 'dosage_status', 'dosage',
  'source_refs', 'evidence_claim_ids', 'architecture_refs', 'linked_rule_ids', 'notes',
];

const ALLOWED_APPROVAL_STATUS = new Set(['pending', 'rejected', 'superseded']);
const ALLOWED_DOSAGE_STATUS = new Set([
  'not_specified_by_current_source',
  'requires_future_rule_authoring',
  'externally_prescribed_only',
]);
const EX_ID_RE = /^RF-EX-\d{3}$/;
const QRF_ID_RE = /^QRF-\d{3}$/;
const RF_RULE_ID_RE = /^RF-[A-Z]+-\d{3}$/;
const ISO_DATE_RE = /\b\d{4}-\d{2}-\d{2}\b/;
const RELATIVE_DURATION_RE = /\b\d+\s*(days?|weeks?)\b/i;

// Quarantined legacy roots no exercise object may reference (string-value scan).
const QUARANTINE_RES = [/lib\/injuryEngine\//i, /data\/injuryKnowledge\//i];

// Prohibited key patterns — active dosage / numeric confidence / fixed RTS date /
// RTT-RTS clearance authority. Matched case-insensitively against every key name.
const PROHIBITED_KEY_PATTERNS = [
  // NOTE: the bare token "dosage" is intentionally NOT listed here — the inert `dosage`
  // CONTAINER is a required field whose emptiness is enforced separately by checkDosageInert().
  // Active prescription is still caught via the prescriptive sub-keys below and the value scan.
  { label: 'active dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|duration|fixed_dose)$/i },
  { label: 'progression increment as prescription', re: /progression_increment|fixed_(sets|reps|dose|dosage)/i },
  { label: 'fixed return date', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return/i },
  { label: 'numeric confidence', re: /(^|_)(numeric|percent|percentage|pct|score)_?confidence/i },
  { label: 'numeric confidence', re: /confidence_(value|score|percent|percentage|numeric|number|pct)/i },
  { label: 'RTT/RTS clearance authority', re: /(grants?|authori[sz]es?|creates?)_(rtt|rts|return_to_(training|sport|play)|unrestricted_(training|competition))/i },
  { label: 'diagnosis/rehab-plan authority', re: /(creates?|grants?|authori[sz]es?)_(diagnosis|rehab_plan|rehabilitation_plan|treatment_plan)/i },
  // Schema-v2 future-proofing: pass/fail, threshold, score, readiness, RTS/RTT, clearance, progression-gate
  // as KEY names. Token-delimited so they cannot false-positive inside benign existing keys.
  { label: 'pass/fail or threshold', re: /(^|_)(pass_?fail|passfail|threshold|cutoff)(_|$)/i },
  { label: 'numeric score', re: /(^|_)(score|numeric_score|percent_score)(_|$)/i },
  { label: 'readiness authority', re: /(^|_)(readiness|readiness_score|ready_for)(_|$)/i },
  { label: 'RTS/RTT/return-to authority', re: /(^|_)(rts|rtt|return_to_sport|return_to_training)(_|$)/i },
  { label: 'clearance authority', re: /(^|_)(clearance|cleared_for)(_|$)/i },
  { label: 'progression authority', re: /(^|_)(progression_gate|progression_authorization)(_|$)/i },
];

// --- Schema-v2 governance metadata (backward-compatible OPT-IN) ---------------
const V2_GOVERNANCE_FIELDS = [
  'canonical_name', 'final_decision', 'evidence_grade', 'source_authority',
  'source_support_type', 'RF_specificity', 'central_tendon_fibrosis_risk',
  'manual_review_required', 'library_classification', 'injury_site_relevance',
  'guardrail_notes', 'source_ids', 'source_verification_status',
];
const REQUIRED_GUARDRAILS = [
  'not a prescription', 'not dosage', 'not progression', 'not readiness',
  'not RTT/RTS', 'not clearance', 'not a test',
];
const REQUIRED_SOURCE_META = [
  'source_ids', 'source_authority', 'source_support_type', 'source_verification_status', 'evidence_grade',
];

// Active-authority PHRASES (value scan). Flagged only when NOT negated, so negated
// governance language ("not clearance", "not a test", "does not imply readiness") passes.
const ACTIVE_AUTHORITY_PHRASES = [
  /\bready\s+for\b/i,
  /\bcleared\s+(for|to)\b/i,
  /\bclearance\s+granted\b/i,
  /\breadiness\s+score\b/i,
  /\bpass\s*\/?\s*fail\b/i,
  /\b(authori[sz]es?|grants?)\s+(clearance|readiness|progression|return\s+to\s+(sport|training|play)|rts|rtt)\b/i,
  /\b(rts|rtt|return\s+to\s+(sport|training|play))\s+approved\b/i,
];
const NEGATOR_BEFORE = /(\bnot\b|\bnever\b|\bno\b|\bnon[- ]|\bwithout\b|\bcannot\b|n't\b)[^.]{0,28}$/i;
function findActiveAuthorityPhrase(text) {
  for (const re of ACTIVE_AUTHORITY_PHRASES) {
    const m = re.exec(text);
    if (!m) continue;
    if (NEGATOR_BEFORE.test(text.slice(0, m.index))) continue;
    return m[0];
  }
  return null;
}

// --- Schema-v2.1 user-facing plan-card metadata (backward-compatible OPT-IN) --
const V2_1_FIELDS = [
  'user_facing_name', 'user_facing_summary', 'user_facing_purpose', 'user_facing_setup',
  'user_facing_instructions', 'user_facing_common_mistakes', 'user_facing_safety_note',
  'plan_card_category', 'plan_card_subcategory', 'difficulty_label', 'advanced_label',
  'easier_option_labels', 'harder_option_labels', 'related_exercise_labels', 'media',
  'user_facing_status', 'log_completion_available', 'log_pain_response_available',
  'log_difficulty_available', 'log_confidence_available', 'log_notes_available',
  'next_day_response_prompt_available',
];
const V2_1_REQUIRED = ['user_facing_name', 'user_facing_purpose', 'user_facing_instructions', 'plan_card_category', 'difficulty_label'];
const PLAN_CARD_CATEGORIES = new Set(['warm_up', 'activation', 'mobility', 'stretching', 'strength', 'control', 'conditioning', 'running_preparation', 'sport_preparation', 'recovery']);
const DIFFICULTY_LABELS = new Set(['foundational', 'controlled', 'progressive', 'advanced', 'clinician_guided']);
const ADVANCED_LABELS = new Set(['advanced', 'clinician_guided', 'only_appears_when_appropriate', 'none']); // null also allowed
const USER_FACING_STATUS = new Set(['draft_copy', 'copy_pending_review', 'copy_reviewed']);
const MEDIA_STATUS = new Set(['none', 'placeholder', 'pending', 'linked']);
const MEDIA_KEYS = new Set(['demo_video_url', 'demo_video_asset_id', 'image_asset_id', 'animation_asset_id', 'thumbnail_asset_id', 'media_status', 'media_notes']);
// User-facing text fields that must not leak internal governance or carry dosage/authority language.
const USER_FACING_TEXT_FIELDS = [
  'user_facing_name', 'user_facing_summary', 'user_facing_purpose', 'user_facing_setup',
  'user_facing_instructions', 'user_facing_common_mistakes', 'user_facing_safety_note',
  'plan_card_subcategory', 'easier_option_labels', 'harder_option_labels', 'related_exercise_labels',
];
// Internal-leakage + dosage/authority tokens: user-facing copy must not contain these AT ALL (hard reject).
const USER_FACING_FORBIDDEN = [
  /evidence_grade/i, /source_authority/i, /RF_specificity/i, /central_tendon_fibrosis_risk/i,
  /manual_review_required/i, /high[_\s-]?caution/i, /approval_status/i, /clinical_approval_status/i,
  /not_approved/i, /source_ids/i, /QRF-/i, /RF-SAF-/i, /RF-DX-/i, /RF-ASSESS-/i, /\bCAP-[0-9]/i,
  /\bsets\b/i, /\breps\b/i, /\bfrequency\b/i, /\bintensity\b/i, /\bduration\b/i, /\brest\b/i,
  /\bthreshold\b/i, /\bcutoff\b/i, /\bscore\b/i, /\bpercent\b/i, /%/,
  /\bready\s+for\b/i, /\bcleared\s+for\b/i, /\bclearance\b/i, /\brts\b/i, /\brtt\b/i,
  /return\s+to\s+(sport|training)/i, /progression[_\s]gate/i,
];
function scanUserFacingString(where, kp, text) {
  for (const re of USER_FACING_FORBIDDEN) {
    if (re.test(text)) { err(`${where}: user-facing field "${kp}" contains forbidden internal/governance/dosage language (matched ${re}).`); break; }
  }
  const hit = findActiveAuthorityPhrase(text);
  if (hit) err(`${where}: user-facing field "${kp}" contains active authority language ("${hit}").`);
}

const errors = [];
const err = (m) => errors.push(m);
const rel = (p) => relative(REPO_ROOT, p);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function walk(node, visit, path = '') {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, visit, `${path}[${i}]`));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const kp = path ? `${path}.${k}` : k;
      visit(k, v, kp);
      walk(v, visit, kp);
    }
  }
}

/* 1. Status file. ---------------------------------------------------------- */
if (!existsSync(STATUS_PATH)) {
  err(`Missing status file: ${rel(STATUS_PATH)}`);
} else {
  try {
    const s = readJson(STATUS_PATH);
    if (s.clinical_approval_status !== 'not_approved') err(`${rel(STATUS_PATH)}: clinical_approval_status must be "not_approved".`);
    if (s.executable !== false) err(`${rel(STATUS_PATH)}: executable must be false.`);
    if (s.exercise_objects_approved !== 0) err(`${rel(STATUS_PATH)}: exercise_objects_approved must be 0.`);
  } catch (e) {
    err(`${rel(STATUS_PATH)}: invalid JSON — ${e.message}`);
  }
}

/* 2. Schema loads + hardening assertions. ---------------------------------- */
let schemaProps = null; // Set of allowed top-level property names (for unknown-field rejection)
if (!existsSync(SCHEMA_PATH)) {
  err(`Missing schema: ${rel(SCHEMA_PATH)}`);
} else {
  try {
    const schema = readJson(SCHEMA_PATH);
    // 2a. Closed-schema posture.
    if (schema.additionalProperties !== false) {
      err(`${rel(SCHEMA_PATH)}: additionalProperties must be false (closed-schema posture).`);
    }
    const props = schema.properties && typeof schema.properties === 'object' ? schema.properties : {};
    schemaProps = new Set(Object.keys(props));
    // 2b. Schema v2 governance fields must all be present in properties.
    for (const f of V2_GOVERNANCE_FIELDS) {
      if (!(f in props)) err(`${rel(SCHEMA_PATH)}: schema v2 governance field "${f}" missing from properties.`);
    }
    // 2c. Legacy base required fields must still be present in schema.required.
    const requiredSet = new Set(Array.isArray(schema.required) ? schema.required : []);
    for (const k of REQUIRED_KEYS) {
      if (!requiredSet.has(k)) err(`${rel(SCHEMA_PATH)}: base required field "${k}" missing from schema.required.`);
    }
    // 2d. The 13 v2 governance fields must NOT be globally required (backward compatibility).
    for (const f of V2_GOVERNANCE_FIELDS) {
      if (requiredSet.has(f)) err(`${rel(SCHEMA_PATH)}: v2 governance field "${f}" must remain optional (not in schema.required).`);
    }
    // 2e. Schema v2.1 user-facing fields must all be present in properties...
    for (const f of V2_1_FIELDS) {
      if (!(f in props)) err(`${rel(SCHEMA_PATH)}: schema v2.1 field "${f}" missing from properties.`);
    }
    // 2f. ...and must remain optional (not globally required).
    for (const f of V2_1_FIELDS) {
      if (requiredSet.has(f)) err(`${rel(SCHEMA_PATH)}: v2.1 field "${f}" must remain optional (not in schema.required).`);
    }
    // 2g. media sub-object must be closed.
    if (props.media && props.media.additionalProperties !== false) {
      err(`${rel(SCHEMA_PATH)}: media object must set additionalProperties:false.`);
    }
  } catch (e) {
    err(`${rel(SCHEMA_PATH)}: invalid JSON — ${e.message}`);
  }
}

/* 3. Template structurally blank / non-executable. ------------------------- */
if (!existsSync(TEMPLATE_PATH)) {
  err(`Missing template: ${rel(TEMPLATE_PATH)}`);
} else {
  try {
    const t = readJson(TEMPLATE_PATH);
    for (const key of REQUIRED_KEYS) {
      if (!(key in t)) err(`${rel(TEMPLATE_PATH)}: template missing required key "${key}".`);
    }
    if (t.executable === true) err(`${rel(TEMPLATE_PATH)}: template must not be executable.`);
    if (t.approval_status === 'approved') err(`${rel(TEMPLATE_PATH)}: template approval_status must not be "approved".`);
    if (t.permitted_use !== 'exercise_metadata_only') err(`${rel(TEMPLATE_PATH)}: template permitted_use must be "exercise_metadata_only".`);
    // Template stays blank: exercise_id/name/family empty, id-bearing arrays empty.
    const blankish = (v) => v === null || v === '' || (Array.isArray(v) && v.length === 0);
    for (const key of ['exercise_id', 'name', 'exercise_family', 'linked_rule_ids', 'evidence_claim_ids', 'architecture_refs', 'source_refs']) {
      if (!blankish(t[key])) err(`${rel(TEMPLATE_PATH)}: template must stay blank — "${key}" is populated.`);
    }
    // Template top-level keys must all exist in schema.properties (closed-schema alignment).
    if (schemaProps) {
      for (const k of Object.keys(t)) {
        if (k === '$comment') continue;
        if (!schemaProps.has(k)) err(`${rel(TEMPLATE_PATH)}: unknown top-level field "${k}" not in schema.properties.`);
      }
    }
    // Dosage placeholder must be inert.
    checkDosageInert(TEMPLATE_PATH, t);
    // Deep contraband-key scan.
    walk(t, (k, _v, kp) => {
      for (const p of PROHIBITED_KEY_PATTERNS) {
        if (p.re.test(k)) err(`${rel(TEMPLATE_PATH)}: prohibited ${p.label} key "${kp}".`);
      }
    });
  } catch (e) {
    err(`${rel(TEMPLATE_PATH)}: invalid JSON — ${e.message}`);
  }
}

/* Shared: dosage block must carry no active prescription. ------------------ */
function checkDosageInert(path, obj) {
  const where = rel(path);
  if (obj.dosage_status !== undefined && !ALLOWED_DOSAGE_STATUS.has(obj.dosage_status)) {
    err(`${where}: dosage_status "${obj.dosage_status}" not allowed.`);
  }
  const d = obj.dosage;
  if (d === undefined) { err(`${where}: missing "dosage" block.`); return; }
  if (d === null || typeof d !== 'object' || Array.isArray(d)) { err(`${where}: "dosage" must be an object.`); return; }
  if (d.active_prescription_present === true) err(`${where}: dosage.active_prescription_present must not be true (no active prescription allowed).`);
  for (const [k, v] of Object.entries(d)) {
    if (k === 'notes' || k === 'active_prescription_present') continue;
    if (v !== null) err(`${where}: dosage."${k}" must be null in this phase (active dosage value found).`);
  }
}

/* 4. Exercise objects (optional folder). ----------------------------------- */
let objectFiles = [];
if (existsSync(OBJECTS_DIR) && statSync(OBJECTS_DIR).isDirectory()) {
  objectFiles = readdirSync(OBJECTS_DIR)
    .filter((n) => extname(n) === '.json')
    .map((n) => join(OBJECTS_DIR, n));
}

let approvedCount = 0;
let executableCount = 0;

function validateObject(path, obj) {
  const where = rel(path);

  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) err(`${where}: missing required key "${key}".`);
  }

  // Unknown-field rejection (approximates JSON Schema additionalProperties:false without AJV).
  if (schemaProps) {
    for (const k of Object.keys(obj)) {
      if (k === '$comment') continue;
      if (!schemaProps.has(k)) err(`${where}: unknown top-level field "${k}" not in schema.properties.`);
    }
  }

  // Status discipline.
  if (obj.approval_status === 'approved') { err(`${where}: approval_status must not be "approved".`); approvedCount++; }
  else if (obj.approval_status !== undefined && !ALLOWED_APPROVAL_STATUS.has(obj.approval_status)) {
    err(`${where}: approval_status "${obj.approval_status}" not one of pending|rejected|superseded.`);
  }
  if (obj.executable === true) { err(`${where}: executable must not be true.`); executableCount++; }
  if (obj.module !== 'rectus_femoris') err(`${where}: module must be "rectus_femoris".`);
  if (obj.permitted_use !== 'exercise_metadata_only') err(`${where}: permitted_use must be "exercise_metadata_only".`);
  if (typeof obj.exercise_id !== 'string' || !EX_ID_RE.test(obj.exercise_id)) {
    err(`${where}: exercise_id must look like RF-EX-001.`);
  }

  // Provenance shape (reference only — never authority).
  for (const id of obj.evidence_claim_ids || []) {
    if (typeof id !== 'string' || !QRF_ID_RE.test(id)) err(`${where}: evidence_claim_id "${id}" must look like QRF-001.`);
  }
  for (const id of obj.linked_rule_ids || []) {
    if (typeof id !== 'string' || !RF_RULE_ID_RE.test(id)) err(`${where}: linked_rule_id "${id}" must look like RF-SAF-001.`);
  }

  // Dosage inert.
  checkDosageInert(path, obj);

  // Deep scans: contraband keys, quarantine references, fixed-date values, active authority language.
  walk(obj, (k, v, kp) => {
    for (const p of PROHIBITED_KEY_PATTERNS) {
      if (p.re.test(k)) err(`${where}: prohibited ${p.label} field "${kp}".`);
    }
    if (typeof v === 'string') {
      for (const qr of QUARANTINE_RES) {
        if (qr.test(v)) err(`${where}: reference to quarantined legacy module in "${kp}".`);
      }
      if (/return|rts/i.test(k) && (ISO_DATE_RE.test(v) || RELATIVE_DURATION_RE.test(v))) {
        err(`${where}: prohibited fixed return-to-sport date/duration in "${kp}".`);
      }
      const hit = findActiveAuthorityPhrase(v);
      if (hit) err(`${where}: prohibited active authority language ("${hit}") in "${kp}".`);
    }
    if (/^confidence$/i.test(k) && typeof v === 'number') {
      err(`${where}: prohibited numeric confidence value in "${kp}".`);
    }
  });

  // Schema-v2 governance opt-in enforcement (applies ONLY to objects that include any
  // v2 governance field; legacy objects with none are unaffected = backward compatible).
  const isV2 = V2_GOVERNANCE_FIELDS.some((f) => f in obj);
  if (isV2) {
    // guardrail_notes must be present and contain all seven required guardrails.
    if (!Array.isArray(obj.guardrail_notes)) {
      err(`${where}: v2-governed object must include a guardrail_notes array.`);
    } else {
      for (const g of REQUIRED_GUARDRAILS) {
        if (!obj.guardrail_notes.includes(g)) err(`${where}: guardrail_notes must include "${g}".`);
      }
    }
    // Source metadata completeness.
    for (const f of REQUIRED_SOURCE_META) {
      const val = obj[f];
      const missing = val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
      if (missing) err(`${where}: v2-governed object must include non-empty "${f}".`);
    }
    // High-caution readiness.
    if (obj.final_decision === 'high_caution_do_not_convert_yet') {
      if (obj.manual_review_required !== true) err(`${where}: high_caution object must set manual_review_required: true.`);
      if (!['high', 'moderate'].includes(obj.central_tendon_fibrosis_risk)) {
        err(`${where}: high_caution object must set central_tendon_fibrosis_risk to "high" or "moderate".`);
      }
    }
    // Excluded objects must remain documentation-only (not authored as objects).
    if (obj.final_decision === 'exclude') {
      err(`${where}: final_decision "exclude" must remain documentation-only; excluded exercises are not authored as objects.`);
    }
  }

  // Schema-v2.1 user-facing opt-in enforcement (applies ONLY to objects including any v2.1 field;
  // legacy objects with none are unaffected = backward compatible).
  const isV21 = V2_1_FIELDS.some((f) => f in obj);
  if (isV21) {
    const nonEmpty = (v) => {
      if (typeof v === 'string') return v.trim().length > 0;
      if (Array.isArray(v)) return v.length > 0 && v.every((x) => typeof x === 'string' && x.trim().length > 0);
      return false;
    };
    for (const f of V2_1_REQUIRED) {
      if (!(f in obj) || !nonEmpty(obj[f])) err(`${where}: v2.1-governed object must include non-empty "${f}".`);
    }
    // user_facing_instructions: non-empty string OR non-empty array of non-empty strings.
    if ('user_facing_instructions' in obj) {
      const ui = obj.user_facing_instructions;
      const okUi = (typeof ui === 'string' && ui.trim().length > 0) ||
        (Array.isArray(ui) && ui.length > 0 && ui.every((s) => typeof s === 'string' && s.trim().length > 0));
      if (!okUi) err(`${where}: user_facing_instructions must be a non-empty string or non-empty array of non-empty strings.`);
    }
    // Enum validation.
    if ('plan_card_category' in obj && !PLAN_CARD_CATEGORIES.has(obj.plan_card_category)) err(`${where}: plan_card_category "${obj.plan_card_category}" not allowed.`);
    if ('difficulty_label' in obj && !DIFFICULTY_LABELS.has(obj.difficulty_label)) err(`${where}: difficulty_label "${obj.difficulty_label}" not allowed.`);
    if ('advanced_label' in obj && obj.advanced_label !== null && !ADVANCED_LABELS.has(obj.advanced_label)) err(`${where}: advanced_label "${obj.advanced_label}" not allowed.`);
    if ('user_facing_status' in obj && !USER_FACING_STATUS.has(obj.user_facing_status)) err(`${where}: user_facing_status "${obj.user_facing_status}" not allowed.`);
    // Leakage guard on user-facing text fields.
    for (const f of USER_FACING_TEXT_FIELDS) {
      const v = obj[f];
      if (typeof v === 'string') scanUserFacingString(where, f, v);
      else if (Array.isArray(v)) v.forEach((s, i) => { if (typeof s === 'string') scanUserFacingString(where, `${f}[${i}]`, s); });
    }
    // Media validation (inert object; closed keys; valid status; strings/nulls only).
    if ('media' in obj && obj.media !== undefined) {
      const m = obj.media;
      if (m === null || typeof m !== 'object' || Array.isArray(m)) {
        err(`${where}: media must be an object.`);
      } else {
        for (const k of Object.keys(m)) {
          if (!MEDIA_KEYS.has(k)) err(`${where}: media has unknown key "${k}".`);
        }
        if ('media_status' in m && !MEDIA_STATUS.has(m.media_status)) err(`${where}: media.media_status "${m.media_status}" not allowed.`);
        for (const k of ['demo_video_url', 'demo_video_asset_id', 'image_asset_id', 'animation_asset_id', 'thumbnail_asset_id', 'media_notes']) {
          if (k in m && m[k] !== null && typeof m[k] !== 'string') err(`${where}: media.${k} must be a string or null.`);
        }
        if (typeof m.media_notes === 'string') scanUserFacingString(where, 'media.media_notes', m.media_notes);
      }
    }
  }
}

for (const file of objectFiles) {
  let obj;
  try { obj = readJson(file); }
  catch (e) { err(`${rel(file)}: invalid JSON — ${e.message}`); continue; }
  validateObject(file, obj);
}

/* Report. ------------------------------------------------------------------ */
if (errors.length > 0) {
  console.error('\n✖ Exercise Knowledge validation FAILED\n');
  for (const e of errors) console.error(`  • ${e}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

console.log('Exercise Knowledge validation PASS');
console.log(objectFiles.length === 0 ? 'Status: scaffold only' : 'Status: objects present (metadata only)');
console.log(`Exercise objects found: ${objectFiles.length}`);
console.log(`Approved objects: ${approvedCount}`);
console.log(`Executable objects: ${executableCount}`);
console.log('No active dosage or clearance authority found');
process.exit(0);
