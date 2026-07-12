/**
 * lib/clinical/lowerBackEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Lower Back Engine (shared core +
 * per-entity injury modules, same architecture as quadEngine/ankleEngine/
 * calfEngine/groinEngine/hipFlexorEngine/gluteEngine/itBandEngine).
 *
 * This is the most safety-sensitive engine in the app: low back pain has
 * serious red-flag differentials (cauda equina syndrome, fracture,
 * malignancy) that must be screened for and gated BEFORE any self-guided
 * rehab pathway, and a suspected pars stress fracture (spondylolysis) needs
 * imaging confirmation before loading progression.
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value
 * that flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'lower_back_beta_testing_only',
});

/**
 * POSSIBLE_CAUDA_EQUINA_OR_SERIOUS_PATHOLOGY is an EMERGENCY referral-only
 * pathway (saddle anaesthesia, bladder/bowel dysfunction, bilateral leg
 * involvement, progressive neuro deficit, or trauma/malignancy history) —
 * this always wins over everything else and is worded as urgent same-day
 * medical care, not routine clinician review.
 *
 * POSSIBLE_SPONDYLOLYSIS is a referral-only pathway (young athlete,
 * extension/rotation-sport mechanism, pain worse with back extension) — a
 * pars interarticularis stress injury needs imaging (MRI/SPECT/CT) to
 * confirm before any guided loading progression.
 */
export const LOWER_BACK_ENTITIES = Object.freeze({
  NON_SPECIFIC_LOW_BACK_PAIN: 'non_specific_low_back_pain',
  LUMBAR_RADICULAR_PAIN: 'lumbar_radicular_pain',
  POSSIBLE_SPONDYLOLYSIS: 'possible_spondylolysis',
  POSSIBLE_CAUDA_EQUINA_OR_SERIOUS_PATHOLOGY: 'possible_cauda_equina_or_serious_pathology',
});

export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/**
 * Non-specific (mechanical) low back pain stage model — irritability/capacity
 * driven, consistent with guideline-based active management (stay active,
 * avoid prolonged rest). Source: O'Sullivan 2005 (LB-CIT-001).
 */
export const NON_SPECIFIC_LOW_BACK_PAIN_STAGES = Object.freeze([
  { id: 'calm_and_move', clinical_name: 'Calm and keep moving', friendly_name: 'Settle the pain while staying active' },
  { id: 'restore_movement_and_control', clinical_name: 'Restore movement and control', friendly_name: 'Restore movement and motor control' },
  { id: 'build_strength_and_capacity', clinical_name: 'Build strength and capacity', friendly_name: 'Build strength and load capacity' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Return to training and sport' },
]);

/**
 * Lumbar radicular pain (disc-related, with leg symptoms but no red flags)
 * stage model — directional-preference and neural-tolerance driven rather
 * than a fixed clock, since most cases improve gradually over weeks to a
 * few months with conservative care. Source: Benoist 2002 (LB-CIT-004).
 */
export const LUMBAR_RADICULAR_PAIN_STAGES = Object.freeze([
  { id: 'settle_nerve_irritability', clinical_name: 'Settle nerve irritability', friendly_name: 'Settle leg and back symptoms' },
  { id: 'restore_neural_tolerance', clinical_name: 'Restore neural tolerance', friendly_name: 'Restore movement and neural tolerance' },
  { id: 'build_strength_and_capacity', clinical_name: 'Build strength and capacity', friendly_name: 'Build strength and load capacity' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Return to training and sport' },
]);

export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});
