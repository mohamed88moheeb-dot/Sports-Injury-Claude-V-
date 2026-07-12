/**
 * lib/clinical/ankleEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Ankle Engine (shared core + per-entity
 * injury modules, same architecture as quadEngine). No TypeScript toolchain in
 * the repo, so "types" are frozen enums + JSDoc, runnable directly by node.
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value that
 * flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'ankle_beta_testing_only',
});

/**
 * The entities this engine covers. POSSIBLE_FRACTURE is a referral-only
 * pathway (Ottawa Ankle Rules positive) — no autonomous plan, same pattern as
 * the quad engine's pre-operative tendon-rupture referral.
 */
export const ANKLE_ENTITIES = Object.freeze({
  LATERAL_SPRAIN: 'ankle_lateral_sprain',           // ATFL/CFL inversion sprain, grades I-III
  SYNDESMOSIS_SPRAIN: 'ankle_syndesmosis_sprain',   // "high ankle sprain", stable (no diastasis)
  CHRONIC_INSTABILITY: 'ankle_chronic_instability', // recurrent sprains / functional instability
  POSSIBLE_FRACTURE: 'ankle_possible_fracture',     // Ottawa-rule positive — refer for imaging
});

/** Shared functional severity bands (same semantics as other engines). */
export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/** Lateral ligament sprain grading (I mild stretch / II partial tear / III complete tear). */
export const SPRAIN_GRADES = Object.freeze({
  I: 'grade_1',
  II: 'grade_2',
  III: 'grade_3',
});

/**
 * Shared 4-stage functional rehab model for ligament sprains (lateral +
 * syndesmosis both heal via the same ligament-repair arc; syndesmosis just
 * runs slower and with extra caution against forced dorsiflexion/external
 * rotation early). Source: Vuurberg 2018 (ANKLE-CIT-002).
 */
export const SPRAIN_STAGES = Object.freeze([
  { id: 'protect', clinical_name: 'Protect and settle', friendly_name: 'Protect and settle the ankle' },
  { id: 'restore_motion', clinical_name: 'Restore motion', friendly_name: 'Restore motion and light strength' },
  { id: 'strength_balance', clinical_name: 'Strength and balance', friendly_name: 'Rebuild strength and balance' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Agility and return to sport' },
]);

/**
 * Chronic ankle instability stage model — no acute "protect" phase since this
 * is a capacity/control deficit, not a fresh injury. Source: Gribble 2016
 * (ANKLE-CIT-003), Hertel/Corbett CAI model.
 */
export const CAI_STAGES = Object.freeze([
  { id: 'neuromuscular_control', clinical_name: 'Neuromuscular re-education', friendly_name: 'Rebuild balance and control' },
  { id: 'strength_capacity', clinical_name: 'Strength and capacity', friendly_name: 'Build strength and capacity' },
  { id: 'dynamic_reactive', clinical_name: 'Dynamic and reactive control', friendly_name: 'Reactive control and agility' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Sport-specific return and maintenance' },
]);

/** Shared daily check-in response levels (same contract as other engines). */
export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});
