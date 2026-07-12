/**
 * lib/clinical/calfEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Calf/Shin Engine (shared core + per-
 * entity injury modules, same architecture as quadEngine/ankleEngine).
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value
 * that flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'calf_beta_testing_only',
});

/**
 * POSSIBLE_ACHILLES_RUPTURE and POSSIBLE_STRESS_FRACTURE are referral-only
 * pathways — no autonomous plan, same pattern as the quad/ankle engines'
 * referral entities.
 */
export const CALF_ENTITIES = Object.freeze({
  CALF_STRAIN: 'calf_strain',                       // gastrocnemius/soleus strain
  ACHILLES_TENDINOPATHY: 'achilles_tendinopathy',   // mid-portion overuse tendon pain
  MTSS: 'medial_tibial_stress_syndrome',            // "shin splints"
  POSSIBLE_ACHILLES_RUPTURE: 'possible_achilles_rupture',
  POSSIBLE_STRESS_FRACTURE: 'possible_tibial_stress_fracture',
});

export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/** Calf muscle strain grading (I mild / II moderate partial tear / III severe). */
export const STRAIN_GRADES = Object.freeze({
  I: 'grade_1',
  II: 'grade_2',
  III: 'grade_3',
});

/**
 * 4-stage functional rehab model for calf muscle strains (gastrocnemius/
 * soleus). Source: Green & Pizzari 2017 (CALF-CIT-001).
 */
export const CALF_STRAIN_STAGES = Object.freeze([
  { id: 'protect', clinical_name: 'Protect and settle', friendly_name: 'Protect and settle the calf' },
  { id: 'restore_movement', clinical_name: 'Restore movement', friendly_name: 'Restore movement and light strength' },
  { id: 'build_strength', clinical_name: 'Build strength', friendly_name: 'Rebuild strength and capacity' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Running and return to sport' },
]);

/**
 * Achilles tendinopathy loading ladder — the same evidence-based model as
 * patellar tendinopathy (isometric -> isotonic/HSR -> energy storage ->
 * return), applied to the Achilles. Source: Alfredson 1998 (CALF-CIT-002).
 */
export const ACHILLES_STAGES = Object.freeze([
  { id: 'isometric', clinical_name: 'Isometric loading', friendly_name: 'Settle the pain' },
  { id: 'isotonic_hsr', clinical_name: 'Isotonic / heavy slow resistance', friendly_name: 'Rebuild tendon load capacity' },
  { id: 'energy_storage', clinical_name: 'Energy storage / eccentric', friendly_name: 'Restore spring and power' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Sport-specific loading' },
]);

/**
 * MTSS ("shin splints") stage model — a bone/periosteal overload condition,
 * so progression is capacity-and-irritability driven rather than a fixed
 * ligament/muscle healing clock. Source: Winters 2013 (CALF-CIT-004).
 */
export const MTSS_STAGES = Object.freeze([
  { id: 'settle_irritability', clinical_name: 'Settle irritability', friendly_name: 'Calm the shin down' },
  { id: 'restore_load_tolerance', clinical_name: 'Restore load tolerance', friendly_name: 'Rebuild tolerance to walking/running load' },
  { id: 'build_capacity', clinical_name: 'Build running capacity', friendly_name: 'Build running capacity' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Return to running and sport' },
]);

export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});
