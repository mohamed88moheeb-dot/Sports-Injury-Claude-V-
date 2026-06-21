#!/usr/bin/env node
/**
 * Prototype Plan Scenario validation (v1).
 *
 * Validates one inert RF static prototype plan scenario JSON against the closed
 * data contract and cross-checks references to existing draft metadata objects.
 * Treats every file as inert JSON data. The scenario is not a plan generator,
 * not UI, not database behavior, not clinical approval, and not authority for
 * dosage, progression, readiness, RTT/RTS, or clearance.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const SYSTEM_DIR = resolve(REPO_ROOT, 'lib/clinical/prototypePlanScenarios');
const SCHEMA_PATH = join(SYSTEM_DIR, 'schema/prototypePlanScenario.schema.json');
const SCENARIOS_DIR = join(SYSTEM_DIR, 'rf/scenarios');
const SCENARIO_PATH = join(SCENARIOS_DIR, 'RF-STATIC-PLAN-SCENARIO-001.json');

const EX_OBJECTS_DIR = resolve(REPO_ROOT, 'lib/clinical/exerciseKnowledge/rf/objects');
const ACT_OBJECTS_DIR = resolve(REPO_ROOT, 'lib/clinical/activityExposureKnowledge/rf/objects');
const ASSESS_OBJECTS_DIR = resolve(REPO_ROOT, 'lib/clinical/assessmentKnowledge/rf/objects');
const CAP_OBJECTS_DIR = resolve(REPO_ROOT, 'lib/clinical/capacityKnowledge/universal/objects');

const EXPECTED_SCENARIO_ID = 'RF-STATIC-PLAN-SCENARIO-001';
const REQUIRED_TOP_LEVEL_KEYS = [
  'scenario_id', 'scenario_status', 'approval_status', 'clinical_approval_status',
  'executable', 'runtime_integration', 'permitted_use', 'module', 'title',
  'fictional_inputs', 'capacity_summary', 'plan_blocks', 'sample_user_facing_cards',
  'sample_logging_screen', 'conservative_adjustment_examples', 'withheld_boundary_items',
  'governance_notes', 'source_docs',
];
const REQUIRED_INPUT_KEYS = [
  'injury_identity', 'live_safety_state', 'safety_confidence', 'stage_confidence',
  'current_capacity', 'demand_profile', 'equipment', 'schedule', 'concurrent_injuries',
  'monitoring_contract', 'missing_input_actions',
];
const REQUIRED_GOVERNANCE_FRAGMENTS = [
  'Metadata only.',
  'Not a clinical plan.',
  'Not a prescription.',
  'Not dosage.',
  'Not progression.',
  'Not readiness.',
  'Not RTT/RTS.',
  'Not clearance.',
  'Not runtime selectable.',
  'No object approval created.',
  'No database behavior created.',
  'No UI behavior created.',
];

const PROHIBITED_KEY_PATTERNS = [
  { label: 'active dosage', re: /^(sets|reps|repetitions|frequency|weekly_frequency|intensity|rest|rest_seconds|rest_period|duration|dosage|fixed_dose)$/i },
  { label: 'active prescription', re: /active_prescription|prescribed_(volume|load|tempo|schedule|recovery_interval|session_length|progression_step|target_timeline)/i },
  { label: 'numeric score / threshold / pass-fail', re: /^(score|numeric_score|percent_score|threshold|pass_fail|passfail|cutoff)$/i },
  { label: 'progression authorization', re: /(authori[sz]es?|grants?|creates?)_progression|progression_authori[sz]ation/i },
  { label: 'readiness authorization', re: /(authori[sz]es?|grants?|creates?)_readiness|readiness_authori[sz]ation/i },
  { label: 'clearance authorization', re: /(authori[sz]es?|grants?|creates?)_(clearance|rtt|rts|return_to_(training|sport|play))|clearance_authori[sz]ation/i },
  { label: 'fixed return date', re: /(return|rts)_?(date|in_days|in_weeks)|expected_return_date|fixed_return/i },
];
const ASSERTIVE_AUTHORITY_PHRASES = [
  /\bready\s+for\b/i,
  /\bapproved\s+to\s+return\b/i,
  /\bcleared\s+for\b/i,
  /\bclearance\s+granted\b/i,
  /\bcleared\s+to\s+(run|sprint|kick|train|play|compete|return)\b/i,
  /\b(rtt|rts|return to (training|sport|play))\s+approved\b/i,
  /\b(authori[sz]es?|grants?)\s+(clearance|progression|readiness|diagnosis|rtt|rts|return to (training|sport|play))\b/i,
];
const NEGATOR_BEFORE = /(\bnot\b|\bnever\b|\bno\b|\bnon[- ]|\bwithout\b|\bcannot\b|n't\b)[^.]{0,28}$/i;

const errors = [];
const err = (message) => errors.push(message);
const rel = (path) => relative(REPO_ROOT, path);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

function expectFile(path, label) {
  if (!existsSync(path)) { err(`Missing ${label}: ${rel(path)}`); return false; }
  return true;
}
function expectDir(path, label) {
  if (!existsSync(path) || !statSync(path).isDirectory()) { err(`Missing ${label}: ${rel(path)}`); return false; }
  return true;
}
function walk(node, visit, path = '') {
  if (Array.isArray(node)) node.forEach((value, index) => walk(value, visit, `${path}[${index}]`));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      const nextPath = path ? `${path}.${key}` : key;
      visit(key, value, nextPath);
      walk(value, visit, nextPath);
    }
  }
}
function findActiveAuthorityPhrase(text) {
  for (const re of ASSERTIVE_AUTHORITY_PHRASES) {
    const match = re.exec(text);
    if (!match) continue;
    if (NEGATOR_BEFORE.test(text.slice(0, match.index))) continue;
    return match[0];
  }
  return null;
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
function objectIds(dir) {
  const ids = new Set();
  if (expectDir(dir, `${rel(dir)} folder`)) {
    for (const file of readdirSync(dir).filter((name) => extname(name) === '.json')) ids.add(file.replace('.json', ''));
  }
  return ids;
}
function requireExactKeys(obj, expected, where) {
  for (const key of expected) if (!(key in obj)) err(`${where}: missing required key "${key}".`);
  for (const key of Object.keys(obj)) if (!expected.includes(key)) err(`${where}: unknown key "${key}".`);
}
function requireNonEmptyString(value, where) {
  if (typeof value !== 'string' || value.trim() === '') err(`${where}: must be a non-empty string.`);
}
function requireStringArray(value, where, min = 1) {
  if (!Array.isArray(value) || value.length < min) { err(`${where}: must be an array with at least ${min} item(s).`); return; }
  value.forEach((item, index) => requireNonEmptyString(item, `${where}[${index}]`));
}

expectDir(SYSTEM_DIR, 'prototype plan scenarios folder');
expectDir(SCENARIOS_DIR, 'RF scenarios folder');
expectFile(SCHEMA_PATH, 'prototype scenario schema');
expectFile(SCENARIO_PATH, 'RF static scenario JSON');

const exIds = objectIds(EX_OBJECTS_DIR);
const actIds = objectIds(ACT_OBJECTS_DIR);
const assessIds = objectIds(ASSESS_OBJECTS_DIR);
const capIds = objectIds(CAP_OBJECTS_DIR);

function validateSchema() {
  if (!existsSync(SCHEMA_PATH)) return;
  let schema;
  try { schema = readJson(SCHEMA_PATH); } catch (e) { err(`${rel(SCHEMA_PATH)}: invalid JSON - ${e.message}`); return; }
  if (schema.additionalProperties !== false) err(`${rel(SCHEMA_PATH)}: top-level additionalProperties must be false.`);
  const required = schema.required || [];
  for (const key of REQUIRED_TOP_LEVEL_KEYS) if (!required.includes(key)) err(`${rel(SCHEMA_PATH)}: required must include "${key}".`);
  if (schema.properties?.scenario_status?.enum?.join('|') !== 'draft') err(`${rel(SCHEMA_PATH)}: scenario_status must be draft only.`);
  if (schema.properties?.approval_status?.enum?.join('|') !== 'pending') err(`${rel(SCHEMA_PATH)}: approval_status must be pending only.`);
  if (schema.properties?.clinical_approval_status?.enum?.join('|') !== 'not_approved') err(`${rel(SCHEMA_PATH)}: clinical_approval_status must be not_approved only.`);
  if (schema.properties?.executable?.const !== false) err(`${rel(SCHEMA_PATH)}: executable must be const false.`);
  if (schema.properties?.runtime_integration?.enum?.join('|') !== 'none') err(`${rel(SCHEMA_PATH)}: runtime_integration must be none only.`);
  if (schema.properties?.permitted_use?.enum?.join('|') !== 'prototype_plan_scenario_metadata_only') err(`${rel(SCHEMA_PATH)}: permitted_use must be prototype_plan_scenario_metadata_only.`);
  for (const [key, prop] of Object.entries(schema.properties || {})) {
    if (prop && typeof prop === 'object' && prop.type === 'object' && prop.additionalProperties !== false) {
      err(`${rel(SCHEMA_PATH)}: object property "${key}" must be closed with additionalProperties:false.`);
    }
  }
  scanForActiveAuthority(SCHEMA_PATH, schema);
}

function validateScenario() {
  if (!existsSync(SCENARIO_PATH)) return { scenarioCount: 0, cards: 0, blocks: 0 };
  const scenarioFiles = readdirSync(SCENARIOS_DIR).filter((name) => extname(name) === '.json');
  if (scenarioFiles.length !== 1) err(`${rel(SCENARIOS_DIR)}: exactly 1 scenario JSON expected; found ${scenarioFiles.length}.`);
  let doc;
  try { doc = readJson(SCENARIO_PATH); } catch (e) { err(`${rel(SCENARIO_PATH)}: invalid JSON - ${e.message}`); return { scenarioCount: scenarioFiles.length, cards: 0, blocks: 0 }; }

  requireExactKeys(doc, REQUIRED_TOP_LEVEL_KEYS, rel(SCENARIO_PATH));
  if (doc.scenario_id !== EXPECTED_SCENARIO_ID) err(`${rel(SCENARIO_PATH)}: scenario_id must be ${EXPECTED_SCENARIO_ID}.`);
  if (doc.scenario_status !== 'draft') err(`${rel(SCENARIO_PATH)}: scenario_status must be draft.`);
  if (doc.approval_status !== 'pending') err(`${rel(SCENARIO_PATH)}: approval_status must be pending.`);
  if (doc.clinical_approval_status !== 'not_approved') err(`${rel(SCENARIO_PATH)}: clinical_approval_status must be not_approved.`);
  if (doc.executable !== false) err(`${rel(SCENARIO_PATH)}: executable must be false.`);
  if (doc.runtime_integration !== 'none') err(`${rel(SCENARIO_PATH)}: runtime_integration must be none.`);
  if (doc.permitted_use !== 'prototype_plan_scenario_metadata_only') err(`${rel(SCENARIO_PATH)}: permitted_use must be prototype_plan_scenario_metadata_only.`);
  if (doc.module !== 'rf') err(`${rel(SCENARIO_PATH)}: module must be rf.`);

  requireExactKeys(doc.fictional_inputs || {}, REQUIRED_INPUT_KEYS, `${rel(SCENARIO_PATH)} fictional_inputs`);
  for (const key of REQUIRED_INPUT_KEYS) {
    if (['demand_profile', 'equipment', 'missing_input_actions'].includes(key)) requireStringArray(doc.fictional_inputs?.[key], `${rel(SCENARIO_PATH)} fictional_inputs.${key}`);
    else requireNonEmptyString(doc.fictional_inputs?.[key], `${rel(SCENARIO_PATH)} fictional_inputs.${key}`);
  }

  if (!Array.isArray(doc.capacity_summary) || doc.capacity_summary.length < 1) err(`${rel(SCENARIO_PATH)}: capacity_summary must be non-empty.`);
  for (const [index, cap] of (doc.capacity_summary || []).entries()) {
    const where = `${rel(SCENARIO_PATH)} capacity_summary[${index}]`;
    if (!/^CAP-[0-9]{3}$/.test(cap.capacity_id || '')) err(`${where}: capacity_id malformed.`);
    else if (!capIds.has(cap.capacity_id)) err(`${where}: capacity_id ${cap.capacity_id} does not resolve to a universal CAP object.`);
    requireNonEmptyString(cap.capacity_name, `${where}.capacity_name`);
    requireNonEmptyString(cap.fictional_state, `${where}.fictional_state`);
    requireNonEmptyString(cap.scenario_use, `${where}.scenario_use`);
  }

  if (!Array.isArray(doc.plan_blocks) || doc.plan_blocks.length < 1) err(`${rel(SCENARIO_PATH)}: plan_blocks must be non-empty.`);
  let includedExerciseCardCount = 0;
  let withheldActivityCount = 0;
  for (const [blockIndex, block] of (doc.plan_blocks || []).entries()) {
    const where = `${rel(SCENARIO_PATH)} plan_blocks[${blockIndex}]`;
    requireStringArray([block.block_id, block.block_type, block.display_label, block.source_system, block.boundary_note], where, 5);
    if (!Array.isArray(block.static_items)) err(`${where}.static_items: must be an array.`);
    for (const [itemIndex, item] of (block.static_items || []).entries()) {
      const itemWhere = `${where}.static_items[${itemIndex}]`;
      if (item.item_type === 'RF-EX') {
        if (!exIds.has(item.item_id)) err(`${itemWhere}: RF-EX id ${item.item_id} does not resolve.`);
        if (item.included_in_static_display === true) includedExerciseCardCount += 1;
      } else if (item.item_type === 'RF-ACT') {
        if (!actIds.has(item.item_id)) err(`${itemWhere}: RF-ACT id ${item.item_id} does not resolve.`);
        if (item.included_in_static_display === false) withheldActivityCount += 1;
      } else if (item.item_type === 'RF-ASSESS') {
        if (!assessIds.has(item.item_id)) err(`${itemWhere}: RF-ASSESS id ${item.item_id} does not resolve.`);
      } else if (item.item_type !== 'static_placeholder') {
        err(`${itemWhere}: item_type ${item.item_type} not allowed.`);
      }
      if (typeof item.included_in_static_display !== 'boolean') err(`${itemWhere}: included_in_static_display must be boolean.`);
    }
  }
  if (includedExerciseCardCount < 3) err(`${rel(SCENARIO_PATH)}: at least 3 included RF-EX static display items expected.`);
  if (withheldActivityCount < 1) err(`${rel(SCENARIO_PATH)}: at least 1 withheld RF-ACT item expected to prove exposure boundary.`);

  if (!Array.isArray(doc.sample_user_facing_cards) || doc.sample_user_facing_cards.length < 1) err(`${rel(SCENARIO_PATH)}: sample_user_facing_cards must be non-empty.`);
  for (const [index, card] of (doc.sample_user_facing_cards || []).entries()) {
    const where = `${rel(SCENARIO_PATH)} sample_user_facing_cards[${index}]`;
    if (!exIds.has(card.source_exercise_id)) err(`${where}: source_exercise_id ${card.source_exercise_id} does not resolve.`);
    for (const key of ['title', 'category', 'purpose', 'setup', 'safety_note']) requireNonEmptyString(card[key], `${where}.${key}`);
    for (const key of ['instructions', 'common_mistakes', 'log_prompts']) requireStringArray(card[key], `${where}.${key}`);
  }

  requireNonEmptyString(doc.sample_logging_screen?.title, `${rel(SCENARIO_PATH)} sample_logging_screen.title`);
  requireStringArray(doc.sample_logging_screen?.fields, `${rel(SCENARIO_PATH)} sample_logging_screen.fields`);
  requireNonEmptyString(doc.sample_logging_screen?.boundary_note, `${rel(SCENARIO_PATH)} sample_logging_screen.boundary_note`);

  if (!Array.isArray(doc.conservative_adjustment_examples) || doc.conservative_adjustment_examples.length < 1) err(`${rel(SCENARIO_PATH)}: conservative_adjustment_examples must be non-empty.`);
  for (const [index, example] of (doc.conservative_adjustment_examples || []).entries()) {
    const where = `${rel(SCENARIO_PATH)} conservative_adjustment_examples[${index}]`;
    requireNonEmptyString(example.response_label, `${where}.response_label`);
    requireNonEmptyString(example.static_example, `${where}.static_example`);
    if (example.authority_created !== false) err(`${where}.authority_created must be false.`);
  }

  for (const [index, item] of (doc.withheld_boundary_items || []).entries()) {
    const where = `${rel(SCENARIO_PATH)} withheld_boundary_items[${index}]`;
    if (item.item_type === 'RF-EX' && !exIds.has(item.item_id)) err(`${where}: RF-EX id ${item.item_id} does not resolve.`);
    if (item.item_type === 'RF-ACT' && !actIds.has(item.item_id)) err(`${where}: RF-ACT id ${item.item_id} does not resolve.`);
    if (item.item_type === 'RF-ASSESS' && !assessIds.has(item.item_id)) err(`${where}: RF-ASSESS id ${item.item_id} does not resolve.`);
  }

  for (const fragment of REQUIRED_GOVERNANCE_FRAGMENTS) {
    if (!(doc.governance_notes || []).includes(fragment)) err(`${rel(SCENARIO_PATH)}: governance_notes must include "${fragment}".`);
  }
  requireStringArray(doc.source_docs, `${rel(SCENARIO_PATH)} source_docs`);
  for (const sourceDoc of doc.source_docs || []) {
    const path = resolve(REPO_ROOT, sourceDoc);
    if (!existsSync(path)) err(`${rel(SCENARIO_PATH)}: source doc does not exist: ${sourceDoc}.`);
  }

  scanForActiveAuthority(SCENARIO_PATH, doc);
  return { scenarioCount: scenarioFiles.length, cards: doc.sample_user_facing_cards?.length || 0, blocks: doc.plan_blocks?.length || 0 };
}

validateSchema();
const counts = validateScenario();

if (errors.length > 0) {
  console.error('\n✖ Prototype Plan Scenario validation FAILED\n');
  for (const e of errors) console.error(`  • ${e}`);
  console.error(`\n${errors.length} problem(s) found.\n`);
  process.exit(1);
}

console.log(`Prototype Plan Scenario PASS — scenarios ${counts.scenarioCount} / blocks ${counts.blocks} / cards ${counts.cards} / approved 0 / executable 0 / runtime none`);
process.exit(0);
