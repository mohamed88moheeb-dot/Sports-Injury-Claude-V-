/**
 * lib/clinical/rfBetaEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the RF Beta Engine.
 *
 * The repo has no TypeScript toolchain, so "types" are expressed as frozen
 * enum objects + JSDoc. This keeps every module runnable directly by `node`
 * (the test script and the quarantine-boundary check both run plain ESM).
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value that
 * flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'rf_beta_testing_only'
});

export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated'
});

export const PHASES = Object.freeze([
  { id: 'foundation', clinical_name: 'Foundation', friendly_name: 'Calm and protect' },
  { id: 'reload', clinical_name: 'Reload', friendly_name: 'Restore movement and rebuild base' },
  { id: 'accumulation', clinical_name: 'Accumulation', friendly_name: 'Build strength and running capacity' },
  { id: 'transition', clinical_name: 'Transition', friendly_name: 'Running and sport preparation' },
  { id: 'simulation', clinical_name: 'Simulation', friendly_name: 'Higher-demand sport exposure' },
  { id: 'resilience', clinical_name: 'Resilience', friendly_name: 'Return to performance' }
]);

export const SESSION_BLOCKS = Object.freeze([
  'warm_up_prep',
  'mobility_activation',
  'tissue_specific_loading',
  'strength_support',
  'control_balance',
  'conditioning',
  'running_sport_prep',
  'logging_check_in'
]);

export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure'
});

/** Confidence is match quality, never diagnostic certainty. Caps per policy §7a. */
export const CONFIDENCE_CAPS = Object.freeze({
  SELF_REPORT_NORMAL_HIGH: 82, // normal high cap for digital/self-report
  SELF_REPORT_ABSOLUTE_MAX: 84, // hard ceiling, strictly below 85
  MISSING_DATA: 58, // ~50-60
  CONFLICTING: 68 // ~60-70
});

/**
 * @typedef {Object} RfAssessmentInput
 * @property {string} pain_location
 * @property {string} mechanism
 * @property {string} sport_context
 * @property {string} ability_to_continue
 * @property {string} walking_response
 * @property {string} stairs_response
 * @property {string} hip_flexion_response
 * @property {string} knee_extension_response
 * @property {string} pain_severity_label
 * @property {string} bruising_or_swelling
 * @property {string} weakness_or_giving_way
 * @property {Object} red_flag_answers
 * @property {boolean} previous_injury
 * @property {string} reported_fibrosis_or_scar_history
 * @property {string[]} equipment_available
 * @property {string} training_goal
 * @property {string} confidence_in_answers
 */
