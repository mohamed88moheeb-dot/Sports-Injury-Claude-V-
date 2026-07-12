/**
 * lib/clinical/itBandEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the IT Band Engine (shared core + per-
 * entity injury modules, same architecture as quadEngine/ankleEngine/
 * calfEngine/groinEngine/hipFlexorEngine/gluteEngine).
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value
 * that flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'it_band_beta_testing_only',
});

/**
 * POSSIBLE_LATERAL_KNEE_STRUCTURAL_INJURY is a referral-only pathway —
 * locking/catching/giving-way/effusion point toward a lateral meniscus tear,
 * LCL sprain, or other intra-articular pathology rather than iliotibial band
 * syndrome (an overuse compression condition), and need their own imaging/
 * exam pathway before any self-guided rehab.
 */
export const IT_BAND_ENTITIES = Object.freeze({
  IT_BAND_SYNDROME: 'it_band_syndrome',
  POSSIBLE_LATERAL_KNEE_STRUCTURAL_INJURY: 'possible_lateral_knee_structural_injury',
});

export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/**
 * IT band syndrome stage model — an overuse/running-load condition (repeated
 * compression of the fat pad deep to the ITB against the lateral femoral
 * condyle, not "friction"), so progression is irritability/capacity-driven
 * rather than a fixed tissue-healing clock. Source: Fairclough 2006
 * (ITB-CIT-001); Fredericson & Weir 2006 (ITB-CIT-003).
 */
export const IT_BAND_SYNDROME_STAGES = Object.freeze([
  { id: 'reduce_irritability', clinical_name: 'Reduce irritability', friendly_name: 'Calm the lateral knee down' },
  { id: 'restore_load_tolerance', clinical_name: 'Restore load tolerance', friendly_name: 'Rebuild hip and knee load tolerance' },
  { id: 'build_running_capacity', clinical_name: 'Build running capacity', friendly_name: 'Build running capacity and mechanics' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Return to running and sport' },
]);

export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});
