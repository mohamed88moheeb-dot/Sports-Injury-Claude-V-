/**
 * lib/clinical/hipFlexorEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Hip Flexor Engine (shared core +
 * per-entity injury modules, same architecture as quadEngine/groinEngine).
 *
 * Entity model follows the Doha agreement classification (Weir 2015): this
 * engine covers ILIOPSOAS-RELATED groin/hip-flexor pain specifically (acute
 * strain and chronic/"snapping hip" pain). Possible femoral neck stress
 * fracture and possible hip-joint pathology (FAI/labral) are safety-gated to
 * referral, since both are serious/different diagnostic pathways that must
 * not be self-managed as a muscle strain.
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value
 * that flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'hip_flexor_beta_testing_only',
});

export const HIP_FLEXOR_ENTITIES = Object.freeze({
  ILIOPSOAS_STRAIN: 'iliopsoas_strain',                           // acute hip flexor strain
  ILIOPSOAS_RELATED_GROIN_PAIN: 'iliopsoas_related_groin_pain',   // chronic/overuse, incl. snapping hip
  POSSIBLE_FEMORAL_STRESS_FRACTURE: 'possible_femoral_neck_stress_fracture', // referral-only
  POSSIBLE_HIP_JOINT_PATHOLOGY: 'possible_hip_joint_pathology',   // referral-only (FAI/labral screen)
});

export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/** Iliopsoas strain grading (I mild / II moderate partial tear / III severe). */
export const STRAIN_GRADES = Object.freeze({
  I: 'grade_1',
  II: 'grade_2',
  III: 'grade_3',
});

/**
 * 4-stage functional rehab model for acute iliopsoas strains.
 * Source: Manske 2024 (HIPFLEX-CIT-003).
 */
export const ILIOPSOAS_STRAIN_STAGES = Object.freeze([
  { id: 'protect', clinical_name: 'Protect and settle', friendly_name: 'Protect and settle the hip flexor' },
  { id: 'restore_movement', clinical_name: 'Restore movement', friendly_name: 'Restore movement and light strength' },
  { id: 'build_strength', clinical_name: 'Build strength', friendly_name: 'Rebuild strength and capacity' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Running and return to sport' },
]);

/**
 * Loading progression for chronic iliopsoas-related groin pain / snapping
 * hip, modelled on conservative-first management (Walker 2021).
 */
export const CHRONIC_HIP_FLEXOR_STAGES = Object.freeze([
  { id: 'isometric_settle', clinical_name: 'Isometric settling', friendly_name: 'Settle the pain' },
  { id: 'progressive_strengthening', clinical_name: 'Progressive strengthening', friendly_name: 'Build hip flexor and core strength' },
  { id: 'sport_specific_loading', clinical_name: 'Sport-specific loading', friendly_name: 'Add sport-specific loading' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Return to sport' },
]);

export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});
