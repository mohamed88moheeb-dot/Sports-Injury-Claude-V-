/**
 * lib/clinical/rf/status.js
 * ---------------------------------------------------------------------------
 * NON-EXECUTABLE STATUS METADATA for the future governed Rectus Femoris (RF)
 * clinical namespace.
 *
 * This file contains ONLY safe metadata constants. It implements no diagnosis,
 * rehabilitation, dosage, progression, confidence, or return-to-sport logic,
 * and it imports nothing — least of all any quarantined legacy module
 * (lib/injuryEngine/**, data/injuryKnowledge/**).
 *
 * Governing references (read-only snapshots in docs/governance/):
 *   - Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2.md
 *   - Master_Architecture_V3.1_Final.md
 * ---------------------------------------------------------------------------
 */

/** Stable identifier for this governed module namespace. */
export const RF_MODULE_NAME = 'rectus_femoris';

/** Governed document versions this skeleton is aligned to (reference only). */
export const RF_GOVERNED_DOCUMENT_VERSIONS = Object.freeze({
  clinicalRuleSpecification: 'v1.2',
  masterArchitecture: 'V3.1',
});

/**
 * Lifecycle status of this namespace. `development_provisional` means a
 * structural scaffold exists but no governed clinical behavior is implemented
 * or authorized.
 */
export const RF_NAMESPACE_STATUS = 'development_provisional';

/**
 * Clinical approval status. RF v1.2 is a Gate A reconciled candidate; every
 * rule is `approval_status: pending`. Nothing here is clinically approved.
 */
export const RF_CLINICAL_APPROVAL_STATUS = 'not_approved';

/**
 * Rule execution status. No rule may execute until Gate B machine-readable
 * rule objects exist, are validated, and are individually approved (Gate C).
 */
export const RF_RULE_EXECUTION_STATUS =
  'blocked_until_gate_b_machine_readable_rules_exist';

/**
 * Convenience frozen snapshot of the above, for callers that only need to read
 * status metadata. Purely informational — carries no decision authority.
 */
export const RF_STATUS = Object.freeze({
  moduleName: RF_MODULE_NAME,
  governedDocumentVersions: RF_GOVERNED_DOCUMENT_VERSIONS,
  namespaceStatus: RF_NAMESPACE_STATUS,
  clinicalApprovalStatus: RF_CLINICAL_APPROVAL_STATUS,
  ruleExecutionStatus: RF_RULE_EXECUTION_STATUS,
});
