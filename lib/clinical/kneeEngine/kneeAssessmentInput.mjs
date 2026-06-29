/**
 * lib/clinical/kneeEngine/kneeAssessmentInput.mjs
 * ---------------------------------------------------------------------------
 * Shared knee assessment intake + the ENTITY ROUTER + red-flag triage.
 *
 * The router is the clinical heart: it reads the selected structure, mechanism,
 * instability/locking signals, and onset to choose which module handles the
 * case. Routing is conservative — anything that looks like a locked knee,
 * gross instability, high-energy/PLC pattern, or extensor-mechanism rupture is
 * flagged for in-person review rather than self-managed.
 * Sources: Duong 2023 (KNEE-CIT-001) diagnostic tests; ligament exam literature.
 * ---------------------------------------------------------------------------
 */

import { KNEE_ENTITIES, KNEE_STRUCTURES, KNEE_RED_FLAGS } from './types.mjs';

const UNKNOWN = 'unsure';

export function makeKneeInput(raw = {}) {
  const input = {
    structure: raw.structure ?? null,            // KNEE_STRUCTURES value (from anatomy)
    pain_location: raw.pain_location ?? null,     // anterior | medial | lateral | posterior | diffuse
    mechanism: raw.mechanism ?? null,             // pivot_noncontact | valgus_blow | varus_blow | dashboard_hyperflexion | twisting | direct_blow | jumping_landing | gradual_overuse | unsure
    onset: raw.onset ?? null,                     // sudden | gradual

    age_group: raw.age_group ?? null,             // adolescent | adult | older_adult
    swelling_timing: raw.swelling_timing ?? null, // immediate | next_day | none
    swelling_amount: raw.bruising_or_swelling ?? 'none', // none | some | significant

    // Mechanical / stability signals
    locking_or_block: raw.locking_or_block ?? UNKNOWN,   // yes | no | unsure  (block to extension)
    giving_way: raw.giving_way ?? UNKNOWN,               // yes | no | unsure  (instability)
    pop_at_injury: raw.pop_at_injury ?? UNKNOWN,         // yes | no | unsure
    recurrent_dislocation: raw.recurrent_dislocation ?? UNKNOWN, // yes | no | unsure

    // Laxity self-report by ligament test (clinician or guided)
    laxity_grade: numOrNull(raw.laxity_grade),    // 1 | 2 | 3 | null

    // Function
    ability_to_continue: raw.ability_to_continue ?? null, // yes | limited | no
    weight_bearing: raw.weight_bearing ?? null,           // full | painful | unable
    pain_with_squat: raw.pain_with_squat ?? UNKNOWN,      // yes | no | unsure (PFPS)
    pain_with_stairs: raw.pain_with_stairs ?? UNKNOWN,
    joint_line_tenderness: raw.joint_line_tenderness ?? UNKNOWN, // meniscus
    morning_stiffness_minutes: numOrNull(raw.morning_stiffness_minutes), // OA
    pain_severity_label: raw.pain_severity_label ?? null, // mild | moderate | severe

    // Time / surgical context
    days_since_injury: numOrNull(raw.days_since_injury) ?? 7,
    surgical_repair_done: raw.surgical_repair_done ?? false,
    weeks_since_surgery: numOrNull(raw.weeks_since_surgery),

    // Activity / hot-joint red flags
    febrile_hot_joint: raw.febrile_hot_joint ?? false,
    high_energy_trauma: raw.high_energy_trauma ?? false,

    red_flag_answers: raw.red_flag_answers ?? {},
    sport_context: raw.sport_context ?? 'unspecified',
    activity_level: raw.activity_level ?? null,           // pivoting_sport | recreational | sedentary
    equipment_available: Array.isArray(raw.equipment_available) ? raw.equipment_available : ['bodyweight'],
    confidence_in_answers: raw.confidence_in_answers ?? 'somewhat',
    injury_entity_override: raw.injury_entity_override ?? null,
  };
  const CORE = ['structure', 'mechanism', 'pain_severity_label'];
  const missingCoreFields = CORE.filter((f) => input[f] == null);
  return { input, missingCoreFields };
}

function numOrNull(v) { return typeof v === 'number' && !Number.isNaN(v) ? v : null; }

/** Detect red flags requiring in-person care. Returns array of flag ids. */
export function detectRedFlags(input) {
  const flags = [];
  if (input.locking_or_block === 'yes') flags.push('locked_knee_block_to_extension');
  if (input.giving_way === 'yes') flags.push('gross_instability_giving_way');
  if (input.swelling_timing === 'immediate' && input.swelling_amount === 'significant') flags.push('immediate_large_swelling');
  if (input.weight_bearing === 'unable') flags.push('unable_to_bear_weight');
  if (input.febrile_hot_joint === true) flags.push('hot_swollen_febrile');
  if (input.high_energy_trauma === true) flags.push('high_energy_or_plc_pattern');
  return flags.filter((f) => KNEE_RED_FLAGS.includes(f));
}

const STRUCTURE_TO_ENTITY = {
  [KNEE_STRUCTURES.ACL]: KNEE_ENTITIES.ACL,
  [KNEE_STRUCTURES.PCL]: KNEE_ENTITIES.PCL,
  [KNEE_STRUCTURES.MCL]: KNEE_ENTITIES.MCL,
  [KNEE_STRUCTURES.LCL]: KNEE_ENTITIES.LCL_PLC,
  [KNEE_STRUCTURES.MEDIAL_MENISCUS]: KNEE_ENTITIES.MENISCUS,
  [KNEE_STRUCTURES.LATERAL_MENISCUS]: KNEE_ENTITIES.MENISCUS,
  [KNEE_STRUCTURES.PATELLOFEMORAL_JOINT]: KNEE_ENTITIES.PATELLOFEMORAL,
  [KNEE_STRUCTURES.TIBIAL_TUBERCLE]: KNEE_ENTITIES.OSGOOD_SCHLATTER,
  [KNEE_STRUCTURES.ITB_LATERAL_KNEE]: KNEE_ENTITIES.ITB,
  [KNEE_STRUCTURES.PATELLAR_TENDON]: KNEE_ENTITIES.EXTENSOR_TENDON,
  [KNEE_STRUCTURES.QUAD_TENDON]: KNEE_ENTITIES.EXTENSOR_TENDON,
};

/**
 * ENTITY ROUTER. Priority order (most urgent / most specific first).
 * @returns {{ entity, reason, confidence, flags, red_flags }}
 */
export function routeEntity(input) {
  const flags = [];
  const red_flags = detectRedFlags(input);

  if (input.injury_entity_override && Object.values(KNEE_ENTITIES).includes(input.injury_entity_override)) {
    return { entity: input.injury_entity_override, reason: 'clinician override', confidence: 'high', flags: ['entity_overridden'], red_flags };
  }

  // 0. Extensor-mechanism tendon -> hand off to quad engine.
  if (input.structure === KNEE_STRUCTURES.PATELLAR_TENDON || input.structure === KNEE_STRUCTURES.QUAD_TENDON) {
    return { entity: KNEE_ENTITIES.EXTENSOR_TENDON, reason: 'Extensor-mechanism tendon — handled by the quadriceps/patellar tendon pathway.', confidence: 'high', flags: ['route_to_quad_engine'], red_flags };
  }

  // 1. Recurrent patellar dislocation overrides a generic PF selection.
  if (input.recurrent_dislocation === 'yes' || (input.structure === KNEE_STRUCTURES.PATELLOFEMORAL_JOINT && input.pop_at_injury === 'yes' && input.mechanism === 'twisting')) {
    flags.push('patellar_instability_pattern');
    return { entity: KNEE_ENTITIES.PATELLAR_INSTABILITY, reason: 'Kneecap dislocation / recurrent instability pattern — patellar instability pathway.', confidence: 'moderate', flags, red_flags };
  }

  // 2. Locked knee (block to extension) -> meniscus surgical concern.
  if (input.locking_or_block === 'yes') {
    flags.push('locked_knee_surgical_concern');
    return { entity: KNEE_ENTITIES.MENISCUS, reason: 'A true locked knee / block to full extension can indicate a displaced (bucket-handle) meniscal tear — needs in-person assessment.', confidence: 'moderate', flags, red_flags };
  }

  // 3. Explicit structure selection routes directly.
  if (input.structure && STRUCTURE_TO_ENTITY[input.structure]) {
    const entity = STRUCTURE_TO_ENTITY[input.structure];
    flags.push('structure_selected');
    return { entity, reason: `Selected structure (${input.structure.replace(/_/g, ' ')}).`, confidence: 'high', flags, red_flags };
  }

  // 4. Mechanism-driven inference when structure is unsure.
  const mech = input.mechanism;
  if (mech === 'pivot_noncontact' && (input.pop_at_injury === 'yes' || input.swelling_timing === 'immediate')) {
    flags.push('acl_pattern'); return { entity: KNEE_ENTITIES.ACL, reason: 'Non-contact pivot with a pop and/or immediate swelling — ACL pattern.', confidence: 'moderate', flags, red_flags };
  }
  if (mech === 'dashboard_hyperflexion') { flags.push('pcl_pattern'); return { entity: KNEE_ENTITIES.PCL, reason: 'Dashboard / hyperflexion mechanism — PCL pattern.', confidence: 'moderate', flags, red_flags }; }
  if (mech === 'valgus_blow') { flags.push('mcl_pattern'); return { entity: KNEE_ENTITIES.MCL, reason: 'Valgus force to the knee — MCL pattern.', confidence: 'moderate', flags, red_flags }; }
  if (mech === 'varus_blow') { flags.push('lcl_pattern'); return { entity: KNEE_ENTITIES.LCL_PLC, reason: 'Varus force — lateral / posterolateral pattern.', confidence: 'moderate', flags, red_flags }; }
  if (mech === 'twisting' && input.joint_line_tenderness === 'yes') { flags.push('meniscus_pattern'); return { entity: KNEE_ENTITIES.MENISCUS, reason: 'Twisting injury with joint-line tenderness — meniscal pattern.', confidence: 'moderate', flags, red_flags }; }
  if (mech === 'gradual_overuse' && input.pain_location === 'lateral') { flags.push('itb_pattern'); return { entity: KNEE_ENTITIES.ITB, reason: 'Gradual lateral knee pain (runner) — IT band syndrome pattern.', confidence: 'moderate', flags, red_flags }; }
  if (mech === 'gradual_overuse' && input.age_group === 'adolescent') { flags.push('osd_pattern'); return { entity: KNEE_ENTITIES.OSGOOD_SCHLATTER, reason: 'Adolescent with gradual anterior tibial-tubercle pain — Osgood-Schlatter pattern.', confidence: 'moderate', flags, red_flags }; }
  if ((mech === 'gradual_overuse' || input.pain_with_squat === 'yes') && input.age_group === 'older_adult' && (input.morning_stiffness_minutes != null && input.morning_stiffness_minutes <= 30)) {
    flags.push('oa_pattern'); return { entity: KNEE_ENTITIES.KNEE_OA, reason: 'Older adult, activity-related pain with brief morning stiffness — knee OA pattern.', confidence: 'moderate', flags, red_flags };
  }
  if (input.pain_with_squat === 'yes' || mech === 'gradual_overuse') {
    flags.push('pfps_pattern'); return { entity: KNEE_ENTITIES.PATELLOFEMORAL, reason: 'Anterior knee pain with squatting/loading — patellofemoral pain pattern.', confidence: input.pain_with_squat === 'yes' ? 'moderate' : 'low', flags, red_flags };
  }

  // 5. Fallback.
  flags.push('nonspecific_knee_pattern');
  return { entity: KNEE_ENTITIES.PATELLOFEMORAL, reason: 'Non-specific knee pain — defaulting to the load-based anterior-knee pathway; clinician review advised.', confidence: 'low', flags, red_flags };
}
