/**
 * lib/clinical/rf/contracts.js
 * ---------------------------------------------------------------------------
 * NON-EXECUTABLE STRUCTURAL PLACEHOLDERS for the future governed Rectus
 * Femoris (RF) clinical objects.
 *
 * IMPORTANT: These are *key/identifier* placeholders only. They name the
 * structural slots that governed RF objects will eventually occupy. They
 * contain NO clinical content — no thresholds, no dosage, no diagnosis logic,
 * no confidence values, no safety decisions, no return-to-sport rules. Nothing
 * here is executable decision logic, and this file imports nothing (and must
 * never import any quarantined legacy module).
 *
 * The key sets mirror the structural vocabulary of the governing documents so
 * that future, separately-approved machine-readable rule objects (Gate B) can
 * be slotted in without renaming:
 *   - core clinical objects ........ RF v1.2 §5
 *   - six confidence objects ....... RF v1.2 §15.1 / V3.1 §8.1
 *   - closed safety-state matrix ... RF v1.2 §7.1 / V3.1 §21
 *
 * Listing these identifiers is structural scaffolding, not clinical authority.
 * ---------------------------------------------------------------------------
 */

/**
 * RF_CLINICAL_OBJECT_KEYS
 * The separately-maintained core clinical objects (RF v1.2 §5). Identifiers
 * only; each object's contract and behavior is intentionally NOT defined here.
 */
export const RF_CLINICAL_OBJECT_KEYS = Object.freeze([
  'injury_identity',
  'differential_set',
  'structural_profile',
  'injury_history_modifier',
  'functional_severity_profile',
  'irritability_profile',
  'current_capacity_profile',
  'rehab_stage',
  'safety_state',
  'monitoring_contract',
  'readiness_profile',
  'confidence', // expands into the six objects below; never a single score
]);

/**
 * RF_CONFIDENCE_OBJECT_KEYS
 * The six independent confidence objects (RF v1.2 §15.1; V3.1 §8.1). These are
 * maintained separately and are NEVER collapsed into one number. No numeric
 * value is defined or unlocked here (V3.1 §24.1: `calibrated:false` requires
 * `numeric_value:null`).
 */
export const RF_CONFIDENCE_OBJECT_KEYS = Object.freeze([
  'diagnosis',
  'severity',
  'stage',
  'safety',
  'progression',
  'readiness_completeness',
]);

/**
 * RF_SAFETY_STATE_KEYS
 * The closed eight-state safety vocabulary (RF v1.2 §7.1; V3.1 §21). State
 * identifiers only — the matrix semantics (blocked targets, clears_when,
 * referral behavior) are intentionally NOT implemented here.
 */
export const RF_SAFETY_STATE_KEYS = Object.freeze([
  'CLEAR',
  'CLEAR_WITH_MONITORING',
  'INFORMATION_REQUIRED',
  'TEST_BLOCKED',
  'REHAB_BLOCKED',
  'URGENT_REFERRAL',
  'EMERGENCY_SIGNPOSTING',
  'OUT_OF_SCOPE',
]);

/**
 * RF_RULE_PACKAGE_STATUS
 * Status descriptor for the (not-yet-existing) machine-readable RF rule
 * package. Metadata only; defines no rules.
 */
export const RF_RULE_PACKAGE_STATUS = Object.freeze({
  exists: false,
  gate: 'A_document_reconciled_candidate',
  nextGate: 'B_machine_readable_authoring',
  approvalStatus: 'not_approved',
  executable: false,
  ruleCount: 0,
});
