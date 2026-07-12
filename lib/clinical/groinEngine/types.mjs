/**
 * lib/clinical/groinEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Adductor/Groin Engine (shared core +
 * per-entity injury modules, same architecture as quadEngine/ankleEngine/
 * calfEngine).
 *
 * Entity model follows the Doha agreement classification (Weir 2015): this
 * engine covers ADDUCTOR-RELATED groin pain specifically (acute strain and
 * longstanding/chronic adductor-related pain). Iliopsoas-related groin pain
 * is covered by the hip-flexor engine; possible hernia (inguinal-related)
 * and possible hip-joint pathology are safety-gated to referral here rather
 * than self-managed, since they need a different diagnostic pathway.
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value
 * that flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'groin_beta_testing_only',
});

export const GROIN_ENTITIES = Object.freeze({
  ADDUCTOR_STRAIN: 'adductor_strain',                       // acute adductor longus/brevis/magnus strain
  ADDUCTOR_RELATED_GROIN_PAIN: 'adductor_related_groin_pain', // longstanding/chronic adductor-related pain (Holmich)
  POSSIBLE_HERNIA: 'possible_inguinal_hernia',              // referral-only
  POSSIBLE_HIP_JOINT_PATHOLOGY: 'possible_hip_joint_pathology', // referral-only (FAI/labral screen)
});

export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/** Adductor strain grading (I mild / II moderate partial tear / III severe). */
export const STRAIN_GRADES = Object.freeze({
  I: 'grade_1',
  II: 'grade_2',
  III: 'grade_3',
});

/**
 * 4-stage functional rehab model for acute adductor strains.
 * Source: Serner 2015 (GROIN-CIT-003).
 */
export const ADDUCTOR_STRAIN_STAGES = Object.freeze([
  { id: 'protect', clinical_name: 'Protect and settle', friendly_name: 'Protect and settle the groin' },
  { id: 'restore_movement', clinical_name: 'Restore movement', friendly_name: 'Restore movement and light strength' },
  { id: 'build_strength', clinical_name: 'Build strength', friendly_name: 'Rebuild strength and capacity' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Running and return to sport' },
]);

/**
 * Loading progression for longstanding adductor-related groin pain, modelled
 * on the Holmich active-training protocol (Holmich 1999) and the Copenhagen
 * adduction exercise for eccentric strength (Ishoi 2016).
 */
export const CHRONIC_GROIN_STAGES = Object.freeze([
  { id: 'isometric_settle', clinical_name: 'Isometric settling', friendly_name: 'Settle the pain' },
  { id: 'progressive_strengthening', clinical_name: 'Progressive strengthening', friendly_name: 'Build adductor and core strength' },
  { id: 'sport_specific_loading', clinical_name: 'Sport-specific loading', friendly_name: 'Add sport-specific and eccentric loading' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Return to sport' },
]);

export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});
