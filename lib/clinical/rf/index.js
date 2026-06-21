/**
 * lib/clinical/rf/index.js
 * ---------------------------------------------------------------------------
 * Entry point for the future governed Rectus Femoris (RF) clinical namespace.
 *
 * BOUNDARY SCAFFOLD ONLY. This namespace currently re-exports nothing but safe
 * metadata/status constants and non-executable structural placeholders. It
 * contains no diagnosis, rehabilitation, dosage, progression, confidence, or
 * return-to-sport logic, and it imports nothing from any quarantined legacy
 * module (lib/injuryEngine/**, data/injuryKnowledge/**).
 *
 * The quarantine boundary is enforced automatically by
 *   scripts/check-rf-quarantine-boundary.mjs  (npm run check:rf-boundary)
 * ---------------------------------------------------------------------------
 */

export {
  RF_MODULE_NAME,
  RF_GOVERNED_DOCUMENT_VERSIONS,
  RF_NAMESPACE_STATUS,
  RF_CLINICAL_APPROVAL_STATUS,
  RF_RULE_EXECUTION_STATUS,
  RF_STATUS,
} from './status.js';

export {
  RF_CLINICAL_OBJECT_KEYS,
  RF_CONFIDENCE_OBJECT_KEYS,
  RF_SAFETY_STATE_KEYS,
  RF_RULE_PACKAGE_STATUS,
} from './contracts.js';
