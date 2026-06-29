/**
 * lib/clinical/quadEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Quadriceps Engine (hybrid: shared core
 * + per-entity injury modules). No TypeScript toolchain in the repo, so "types"
 * are frozen enums + JSDoc, runnable directly by node, mirroring rfBetaEngine.
 *
 * BETA SCOPE: nothing here is clinical authority. Every prescription value that
 * flows through the engine is a labelled beta default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'quad_beta_testing_only',
});

/**
 * The four injury entities this engine covers (RF strain stays in rfBetaEngine).
 * `injury_entity` is the routing key the orchestrator switches on.
 */
export const QUAD_ENTITIES = Object.freeze({
  VASTUS_STRAIN: 'vastus_strain',     // VL / VM / VI muscle strain
  CONTUSION: 'quad_contusion',        // direct-impact "dead leg"
  TENDINOPATHY: 'quad_tendinopathy',  // quad/patellar overuse tendon pain
  TENDON_RUPTURE: 'quad_tendon_rupture', // quad/patellar tendon rupture (surgical)
});

/** Which vastus muscle is involved (strain + contusion localisation). */
export const QUAD_MUSCLES = Object.freeze({
  VASTUS_LATERALIS: 'vastus_lateralis',
  VASTUS_MEDIALIS: 'vastus_medialis',
  VASTUS_INTERMEDIUS: 'vastus_intermedius',
  RECTUS_FEMORIS: 'rectus_femoris',   // routed to rfBetaEngine, recognised here
  MULTIPLE_OR_UNSURE: 'multiple_or_unsure',
});

/** Shared functional severity bands (same semantics as rfBetaEngine). */
export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/**
 * Shared 6-phase muscle-healing model — reused by vastus strain and (post-acute)
 * contusion. Tendinopathy and rupture define their OWN stage models in-module.
 * Source: muscle healing arc, Lempainen 2022 (QUAD-CIT-001).
 */
export const MUSCLE_PHASES = Object.freeze([
  { id: 'foundation', clinical_name: 'Foundation', friendly_name: 'Calm and protect' },
  { id: 'reload', clinical_name: 'Reload', friendly_name: 'Restore movement and rebuild base' },
  { id: 'accumulation', clinical_name: 'Accumulation', friendly_name: 'Build strength and capacity' },
  { id: 'transition', clinical_name: 'Transition', friendly_name: 'Running and sport preparation' },
  { id: 'simulation', clinical_name: 'Simulation', friendly_name: 'Higher-demand sport exposure' },
  { id: 'resilience', clinical_name: 'Resilience', friendly_name: 'Return to performance' },
]);

/**
 * Tendinopathy loading ladder (NOT the muscle model).
 * Sources: Rio 2015 (QUAD-CIT-007), Lim 2018 (QUAD-CIT-008),
 * Kongsgaard 2009 (QUAD-CIT-009), Burton 2022 (QUAD-CIT-010).
 */
export const TENDINOPATHY_STAGES = Object.freeze([
  { id: 'isometric', clinical_name: 'Isometric loading', friendly_name: 'Settle the pain' },
  { id: 'isotonic_hsr', clinical_name: 'Isotonic / heavy slow resistance', friendly_name: 'Rebuild tendon load capacity' },
  { id: 'energy_storage', clinical_name: 'Energy storage / eccentric', friendly_name: 'Restore spring and power' },
  { id: 'return_to_sport', clinical_name: 'Return to sport', friendly_name: 'Sport-specific loading' },
]);

/**
 * Tendon-rupture post-operative stages (weeks-since-surgery driven; clinician-gated).
 * Sources: Langenhan 2012 (QUAD-CIT-012), Lee 2013 (QUAD-CIT-013), Ibounig 2015 (QUAD-CIT-014).
 */
export const RUPTURE_STAGES = Object.freeze([
  { id: 'protected', clinical_name: 'Protected (brace, weeks 0-6)', friendly_name: 'Protect the repair' },
  { id: 'mobility', clinical_name: 'Progressive ROM (weeks 6-12)', friendly_name: 'Restore motion' },
  { id: 'strength', clinical_name: 'Strengthening (months 3-5)', friendly_name: 'Rebuild strength' },
  { id: 'return', clinical_name: 'Return to activity (months 5+)', friendly_name: 'Return to activity' },
]);

/** Contusion severity by passive knee-flexion ROM. Source: Lempainen 2022 (QUAD-CIT-001). */
export const CONTUSION_GRADES = Object.freeze({
  MILD: 'mild',         // >50% knee flexion ROM
  MODERATE: 'moderate', // 30-50%
  SEVERE: 'severe',     // <30%
});

/** Shared daily check-in response levels (same contract as rfBetaEngine). */
export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});

/** Confidence is match quality, never diagnostic certainty (same caps as RF). */
export const CONFIDENCE_CAPS = Object.freeze({
  SELF_REPORT_NORMAL_HIGH: 82,
  SELF_REPORT_ABSOLUTE_MAX: 84,
  MISSING_DATA: 58,
  CONFLICTING: 68,
});
