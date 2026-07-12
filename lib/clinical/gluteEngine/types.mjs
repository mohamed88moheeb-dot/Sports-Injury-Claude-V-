/**
 * lib/clinical/gluteEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Glutes Engine (shared core +
 * per-entity injury modules, same architecture as quadEngine/groinEngine).
 *
 * Entity model covers acute gluteal strain and gluteal tendinopathy /
 * greater trochanteric pain syndrome (GTPS) — the modern understanding that
 * most "trochanteric bursitis" lateral hip pain is primarily a gluteus
 * medius/minimus tendinopathy (Grimaldi 2015). Possible deep gluteal
 * syndrome (sciatic nerve entrapment) is safety-gated to referral, since
 * radiating neural symptoms need a different diagnostic pathway.
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value
 * that flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'glute_beta_testing_only',
});

export const GLUTE_ENTITIES = Object.freeze({
  GLUTEAL_STRAIN: 'gluteal_strain',                     // acute gluteus max/med/min strain
  GLUTEAL_TENDINOPATHY: 'gluteal_tendinopathy',         // GTPS / lateral hip pain, chronic
  POSSIBLE_DEEP_GLUTEAL_SYNDROME: 'possible_deep_gluteal_syndrome', // referral-only
});

export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/** Gluteal strain grading (I mild / II moderate partial tear / III severe). */
export const STRAIN_GRADES = Object.freeze({
  I: 'grade_1',
  II: 'grade_2',
  III: 'grade_3',
});

/**
 * 4-stage functional rehab model for acute gluteal strains.
 */
export const GLUTEAL_STRAIN_STAGES = Object.freeze([
  { id: 'protect', clinical_name: 'Protect and settle', friendly_name: 'Protect and settle the glute' },
  { id: 'restore_movement', clinical_name: 'Restore movement', friendly_name: 'Restore movement and light strength' },
  { id: 'build_strength', clinical_name: 'Build strength', friendly_name: 'Rebuild strength and capacity' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Running and return to sport' },
]);

/**
 * Loading progression for gluteal tendinopathy / GTPS, modelled on the LEAP
 * trial's education + progressive loading approach (Mellor 2018), avoiding
 * compressive positions early (Grimaldi 2015).
 */
export const GLUTEAL_TENDINOPATHY_STAGES = Object.freeze([
  { id: 'load_management', clinical_name: 'Load management + isometric settling', friendly_name: 'Settle the pain and reduce compression' },
  { id: 'progressive_strengthening', clinical_name: 'Progressive strengthening', friendly_name: 'Build hip abductor strength' },
  { id: 'functional_loading', clinical_name: 'Functional loading', friendly_name: 'Add functional and sport-specific loading' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Return to sport' },
]);

export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});
