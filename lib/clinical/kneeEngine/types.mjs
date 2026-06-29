/**
 * lib/clinical/kneeEngine/types.mjs
 * ---------------------------------------------------------------------------
 * Shared enums + JSDoc typedefs for the Knee Engine (hybrid: shared core +
 * per-entity injury modules), mirroring quadEngine. No TypeScript toolchain —
 * frozen enums + JSDoc, runnable directly by node.
 *
 * BETA SCOPE: no clinical authority. Every prescription value is a labelled beta
 * default, not evidence-graded.
 * ---------------------------------------------------------------------------
 */

export const BETA_META = Object.freeze({
  default_status: 'beta_default',
  evidence_status: 'beta_default_not_evidence_graded',
  clinical_review_status: 'requires_clinician_review',
  runtime_scope: 'knee_beta_testing_only',
});

/** The knee injury entities this engine routes to. Extensor-mechanism tendons
 *  (patellar/quad tendinopathy + rupture) are handled by the quad engine. */
export const KNEE_ENTITIES = Object.freeze({
  ACL: 'acl_injury',
  PCL: 'pcl_injury',
  MCL: 'mcl_injury',
  LCL_PLC: 'lcl_plc_injury',
  MENISCUS: 'meniscus_tear',
  PATELLOFEMORAL: 'patellofemoral_pain',
  PATELLAR_INSTABILITY: 'patellar_instability',
  KNEE_OA: 'knee_osteoarthritis',
  ITB: 'itb_syndrome',
  OSGOOD_SCHLATTER: 'osgood_schlatter',
  EXTENSOR_TENDON: 'extensor_tendon_refer_quad_engine', // route out to quadEngine
});

/** Selectable knee structures (anatomy). See ANATOMY.md for what to show. */
export const KNEE_STRUCTURES = Object.freeze({
  ACL: 'acl',
  PCL: 'pcl',
  MCL: 'mcl',
  LCL: 'lcl',
  MEDIAL_MENISCUS: 'medial_meniscus',
  LATERAL_MENISCUS: 'lateral_meniscus',
  PATELLOFEMORAL_JOINT: 'patellofemoral_joint',
  PATELLAR_TENDON: 'patellar_tendon',   // -> quad engine
  QUAD_TENDON: 'quad_tendon',           // -> quad engine
  TIBIAL_TUBERCLE: 'tibial_tubercle',   // OSD
  ITB_LATERAL_KNEE: 'itb_lateral_knee',
  JOINT_LINE_GENERAL: 'knee_general',
});

/** Shared functional severity bands (same semantics as quad/RF). */
export const SEVERITY_BANDS = Object.freeze({
  LOWER: 'lower_functional_impact',
  MODERATE: 'moderate_functional_impact',
  HIGH_CONCERN: 'high_concern_or_review_gated',
});

/** Ligament/tear laxity grade (collaterals, cruciates). */
export const LIGAMENT_GRADES = Object.freeze({ I: 1, II: 2, III: 3 });

/**
 * Shared 5-stage knee rehabilitation model. Reused by conservative ligament,
 * meniscus, PFPS, patellar instability, OA, ITB, OSD — each module picks the
 * entry stage and applies its own policy + exercise pool. Surgical/urgent
 * patterns get a referral instead of an autonomous plan.
 */
export const KNEE_STAGES = Object.freeze([
  { id: 'protect', clinical_name: 'Protect & calm', friendly_name: 'Settle pain and protect the knee' },
  { id: 'activate', clinical_name: 'Restore motion & activation', friendly_name: 'Restore movement and switch the muscles on' },
  { id: 'strengthen', clinical_name: 'Build strength & control', friendly_name: 'Build strength and control' },
  { id: 'dynamic', clinical_name: 'Running & power', friendly_name: 'Running, hopping and sport preparation' },
  { id: 'return', clinical_name: 'Return to sport / performance', friendly_name: 'Return to sport and stay resilient' },
]);

/** Shared daily check-in response levels (same contract as quad/RF). */
export const CHECK_IN_RESPONSE = Object.freeze({
  SAME_OR_BETTER: 'same_or_better',
  MORE_NOTICEABLE: 'more_noticeable',
  CONCERNING: 'concerning',
  LOW_CONFIDENCE: 'low_confidence_or_unsure',
});

/** Confidence caps — match quality, never diagnostic certainty. */
export const CONFIDENCE_CAPS = Object.freeze({
  SELF_REPORT_NORMAL_HIGH: 82,
  SELF_REPORT_ABSOLUTE_MAX: 84,
  MISSING_DATA: 58,
  CONFLICTING: 68,
});

/** Red flags routed to in-person care regardless of entity. */
export const KNEE_RED_FLAGS = Object.freeze([
  'locked_knee_block_to_extension',   // bucket-handle meniscus / loose body
  'gross_instability_giving_way',     // multi-ligament / high-grade
  'immediate_large_swelling',         // haemarthrosis -> ACL/fracture
  'unable_to_bear_weight',            // fracture / severe
  'hot_swollen_febrile',              // septic joint
  'high_energy_or_plc_pattern',       // posterolateral corner / multi-ligament
]);
