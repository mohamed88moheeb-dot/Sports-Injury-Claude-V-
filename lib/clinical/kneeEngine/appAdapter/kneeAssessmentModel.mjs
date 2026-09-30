/**
 * lib/clinical/kneeEngine/appAdapter/kneeAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored knee assessment question model — the analogue of
 * quadAssessmentModel.mjs for the knee engine. Pure + browser-safe.
 *
 * Design (mirrors quad):
 *   - Question KEYS are the engine input field names, so answers stored under
 *     assessment.knee flow straight into mapAssessmentToKneeInput.
 *   - A first-question STRUCTURE selector stands in for the anatomy selector's
 *     internal-structure taps (ACL/PCL/menisci have no surface projection —
 *     see kneeEngine/ANATOMY.md) and drives routing directly, at high
 *     confidence, exactly like tapping a structure would.
 *   - Two entity "families" share a middle question group: MECHANICAL
 *     (ligament/meniscus/instability — stability & mechanics questions) and
 *     LOAD (PFPS/OA/ITB/Osgood-Schlatter — load & pattern questions). This
 *     keeps the question count sane across 10 entities while still asking
 *     each entity family exactly what its module's routing/diagnosis reads.
 * ---------------------------------------------------------------------------
 */

const C = (value, label) => ({ value, label });

const MECHANICAL_ENTITIES = new Set([
  'acl_injury', 'pcl_injury', 'mcl_injury', 'lcl_plc_injury', 'meniscus_tear', 'patellar_instability',
]);
const LOAD_ENTITIES = new Set([
  'patellofemoral_pain', 'knee_osteoarthritis', 'itb_syndrome', 'osgood_schlatter',
]);

// ── Question bank. key === engine input field. ──────────────────────────────
export const KNEE_ASSESSMENT_QUESTIONS = [
  // ═══ Shared: Injury context (all entities) ═══
  {
    id: 'q_structure', group: 'Injury context', key: 'structure', core: true, type: 'choice',
    prompt: 'Which part of the knee is affected?',
    hint: 'Internal structures like the ACL, PCL and menisci have no surface landmark — pick the closest match.',
    options: [
      C('acl', 'Deep in the joint, gave way / pivoted (ACL)'),
      C('pcl', 'Deep in the joint, after a dashboard/hyperflexion blow (PCL)'),
      C('mcl', 'Inner knee (medial)'),
      C('lcl', 'Outer knee (lateral)'),
      C('medial_meniscus', 'Inner knee, catches or locks (meniscus)'),
      C('lateral_meniscus', 'Outer knee, catches or locks (meniscus)'),
      C('patellofemoral_joint', 'Front of the knee / around the kneecap'),
      C('tibial_tubercle', 'Bump below the kneecap (tibial tuberosity)'),
      C('itb_lateral_knee', 'Outer knee, above the joint line (IT band)'),
      C('knee_general', 'Not sure / whole knee'),
    ],
  },
  {
    id: 'q_mech', group: 'Injury context', key: 'mechanism', core: true, type: 'choice',
    prompt: 'How did it happen?',
    options: [
      C('pivot_noncontact', 'Planted and twisted, no contact'),
      C('valgus_blow', 'A blow pushing the knee inward'),
      C('varus_blow', 'A blow pushing the knee outward'),
      C('dashboard_hyperflexion', 'A dashboard-type blow or forced hyperflexion'),
      C('twisting', 'A twisting movement'),
      C('direct_blow', 'A direct blow / collision'),
      C('jumping_landing', 'Jumping or landing'),
      C('gradual_overuse', 'Gradually, no single moment'),
      C('unsure', 'Not sure'),
    ],
  },
  {
    id: 'q_onset', group: 'Injury context', key: 'onset', core: false, type: 'choice',
    prompt: 'Did it come on suddenly or gradually?',
    options: [C('sudden', 'Suddenly (one moment)'), C('gradual', 'Gradually (built up)')],
  },
  {
    id: 'q_days', group: 'Injury context', key: 'days_since_injury', core: false, type: 'slider',
    prompt: 'How long ago did this start?', min: 0, max: 60, default: 7, unit: 'days',
    bands: [{ max: 2, label: '0–2 days (acute)' }, { max: 7, label: 'About a week' }, { max: 21, label: '1–3 weeks' }, { max: 60, label: '3+ weeks' }],
  },
  {
    id: 'q_age', group: 'Injury context', key: 'age_group', core: false, type: 'choice',
    prompt: 'Age group?',
    options: [C('adolescent', 'Adolescent (growing)'), C('adult', 'Adult'), C('older_adult', 'Older adult (45+)')],
  },

  // ═══ Shared: Pain & symptoms (all entities) ═══
  {
    id: 'q_sev', group: 'Pain & symptoms', key: 'pain_severity_label', core: true, type: 'choice',
    prompt: 'How severe is the pain at its worst?',
    options: [C('mild', 'Mild'), C('moderate', 'Moderate'), C('severe', 'Severe')],
  },
  {
    id: 'q_continue', group: 'Pain & symptoms', key: 'ability_to_continue', core: true, type: 'choice',
    prompt: 'Could you keep going after it happened?',
    options: [C('yes', 'Yes'), C('limited', 'Only with limitation'), C('no', 'No, had to stop')],
  },
  {
    id: 'q_wb', group: 'Pain & symptoms', key: 'weight_bearing', core: true, type: 'choice',
    prompt: 'Can you put full weight through the leg now?',
    options: [C('full', 'Yes, fully'), C('painful', 'Yes, but painful'), C('unable', 'No, cannot bear weight')],
  },
  {
    id: 'q_swelltime', group: 'Pain & symptoms', key: 'swelling_timing', core: false, type: 'choice',
    prompt: 'If it swelled, how soon after the injury?',
    options: [C('immediate', 'Within 2 hours'), C('next_day', 'Next day or later'), C('none', 'No swelling')],
  },
  {
    id: 'q_swellamt', group: 'Pain & symptoms', key: 'bruising_or_swelling', core: false, type: 'choice',
    prompt: 'How much swelling or bruising?',
    options: [C('none', 'None'), C('some', 'Some'), C('significant', 'Significant')],
  },

  // ═══ Mechanical family: ligament / meniscus / instability ═══
  {
    id: 'q_pop', group: 'Stability & mechanics', family: 'mechanical', key: 'pop_at_injury', core: false, type: 'choice',
    prompt: 'Did you feel or hear a pop at the time?',
    options: [C('yes', 'Yes'), C('no', 'No'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_giving', group: 'Stability & mechanics', family: 'mechanical', key: 'giving_way', core: true, type: 'choice',
    prompt: 'Does the knee feel like it gives way / buckles?',
    options: [C('yes', 'Yes'), C('no', 'No'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_lock', group: 'Stability & mechanics', family: 'mechanical', key: 'locking_or_block', core: true, type: 'choice',
    prompt: 'Does the knee lock, catch, or feel blocked from fully straightening?',
    hint: 'A true block to full extension is a red flag checked here.',
    options: [C('yes', 'Yes, it locks / blocks'), C('no', 'No'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_jlt', group: 'Stability & mechanics', family: 'mechanical', key: 'joint_line_tenderness', core: false, type: 'choice',
    prompt: 'Is it tender right on the joint line (the gap between thigh and shin bones)?',
    options: [C('yes', 'Yes'), C('no', 'No'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_recur', group: 'Stability & mechanics', family: 'mechanical', key: 'recurrent_dislocation', core: false, type: 'choice',
    prompt: 'Has the kneecap dislocated or slipped out of place before?',
    options: [C('yes', 'Yes, more than once'), C('no', 'No'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_laxity', group: 'Stability & mechanics', family: 'mechanical', key: 'laxity_grade', core: false, type: 'slider',
    prompt: 'If tested by a clinician, ligament laxity grade (leave at 1 if unknown)', min: 1, max: 3, default: 1,
    bands: [{ max: 1, label: 'Grade I (mild)' }, { max: 2, label: 'Grade II (moderate)' }, { max: 3, label: 'Grade III (severe)' }],
  },

  // ═══ Load family: PFPS / OA / ITB / Osgood-Schlatter ═══
  {
    id: 'q_squat', group: 'Load & pattern', family: 'load', key: 'pain_with_squat', core: true, type: 'choice',
    prompt: 'Is the pain worse when squatting?',
    options: [C('yes', 'Yes'), C('no', 'No'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_stairs', group: 'Load & pattern', family: 'load', key: 'pain_with_stairs', core: false, type: 'choice',
    prompt: 'Is the pain worse on stairs (especially going down)?',
    options: [C('yes', 'Yes'), C('no', 'No'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_stiff', group: 'Load & pattern', family: 'load', key: 'morning_stiffness_minutes', core: false, type: 'slider',
    prompt: 'Morning stiffness — how many minutes before it eases?', min: 0, max: 60, default: 10, unit: 'min',
    bands: [{ max: 30, label: 'Under 30 min' }, { max: 60, label: '30+ min' }],
  },

  // ═══ Shared: Safety check (all entities) ═══
  {
    id: 'q_hienergy', group: 'Safety check', key: 'high_energy_trauma', core: false, type: 'choice',
    prompt: 'Was this a high-energy injury (e.g. a fall from height, vehicle collision, hard tackle)?',
    options: [C('true', 'Yes'), C('false', 'No')],
  },
  {
    id: 'q_hot', group: 'Safety check', key: 'febrile_hot_joint', core: false, type: 'choice',
    prompt: 'Is the knee hot to the touch, with a fever?',
    hint: 'This combination needs same-day medical review (possible joint infection).',
    options: [C('true', 'Yes'), C('false', 'No')],
  },
  {
    id: 'q_surg', group: 'Safety check', key: 'surgical_repair_done', core: false, type: 'choice',
    prompt: 'Have you already had surgery on this knee for this injury?',
    options: [C('true', 'Yes'), C('false', 'No / not yet')],
  },
  {
    id: 'q_weeks', group: 'Safety check', key: 'weeks_since_surgery', core: false, type: 'slider',
    prompt: 'How many weeks ago was the surgery?', min: 0, max: 52, default: 6, unit: 'weeks',
    conditional: { key: 'surgical_repair_done', in: ['true'] },
    bands: [{ max: 2, label: '0–2 wks (protect)' }, { max: 6, label: '2–6 wks (activate)' }, { max: 16, label: '6–16 wks (strengthen)' }, { max: 24, label: '16–24 wks (dynamic)' }, { max: 52, label: '24+ wks (return)' }],
  },
];

const STRUCTURE_TO_ENTITY = {
  acl: 'acl_injury',
  pcl: 'pcl_injury',
  mcl: 'mcl_injury',
  lcl: 'lcl_plc_injury',
  medial_meniscus: 'meniscus_tear',
  lateral_meniscus: 'meniscus_tear',
  patellofemoral_joint: 'patellofemoral_pain',
  tibial_tubercle: 'osgood_schlatter',
  itb_lateral_knee: 'itb_syndrome',
};

/**
 * Infer the knee injury entity from the structure selector + early answers.
 * Mirrors routeEntity's priority order closely enough to pick the right
 * question group; the engine's own router makes the final, authoritative call.
 */
export function inferKneeEntity(assessment = {}) {
  const k = assessment.knee || {};

  if (k.recurrent_dislocation === 'yes') return 'patellar_instability';
  if (k.locking_or_block === 'yes') return 'meniscus_tear';
  if (k.structure && STRUCTURE_TO_ENTITY[k.structure]) return STRUCTURE_TO_ENTITY[k.structure];

  const mech = k.mechanism || '';
  if (mech === 'pivot_noncontact') return 'acl_injury';
  if (mech === 'dashboard_hyperflexion') return 'pcl_injury';
  if (mech === 'valgus_blow') return 'mcl_injury';
  if (mech === 'varus_blow') return 'lcl_plc_injury';
  if (mech === 'twisting' && k.joint_line_tenderness === 'yes') return 'meniscus_tear';
  if (mech === 'gradual_overuse' && k.age_group === 'adolescent') return 'osgood_schlatter';
  if (mech === 'gradual_overuse' && k.age_group === 'older_adult') return 'knee_osteoarthritis';
  if (mech === 'gradual_overuse') return 'itb_syndrome';
  return 'patellofemoral_pain';
}

const ENTITY_MIDDLE = {
  acl_injury: { group: 'Stability & mechanics', label: 'Stability & mechanics' },
  pcl_injury: { group: 'Stability & mechanics', label: 'Stability & mechanics' },
  mcl_injury: { group: 'Stability & mechanics', label: 'Stability & mechanics' },
  lcl_plc_injury: { group: 'Stability & mechanics', label: 'Stability & mechanics' },
  meniscus_tear: { group: 'Stability & mechanics', label: 'Stability & mechanics' },
  patellar_instability: { group: 'Stability & mechanics', label: 'Stability & mechanics' },
  patellofemoral_pain: { group: 'Load & pattern', label: 'Load & pattern' },
  knee_osteoarthritis: { group: 'Load & pattern', label: 'Load & pattern' },
  itb_syndrome: { group: 'Load & pattern', label: 'Load & pattern' },
  osgood_schlatter: { group: 'Load & pattern', label: 'Load & pattern' },
};

/** The carousel steps for a given inferred entity. */
export function kneeStepsFor(entity) {
  const mid = ENTITY_MIDDLE[entity] || ENTITY_MIDDLE.patellofemoral_pain;
  return [
    { label: 'How it started', group: 'Injury context' },
    { label: 'Pain & symptoms', group: 'Pain & symptoms' },
    { label: mid.label, group: mid.group },
    { label: 'Safety check', group: 'Safety check' },
  ];
}

/** Questions visible in a group for the current entity, honouring conditionals. */
export function kneeQuestionsForGroup(group, assessment) {
  const answers = assessment.knee || {};
  const entity = inferKneeEntity(assessment);
  const family = MECHANICAL_ENTITIES.has(entity) ? 'mechanical' : LOAD_ENTITIES.has(entity) ? 'load' : null;
  return KNEE_ASSESSMENT_QUESTIONS.filter((q) => {
    if (q.group !== group) return false;
    if (q.family && q.family !== family) return false;
    if (q.conditional) {
      const { key, in: mustIn, notIn } = q.conditional;
      const val = answers[key];
      if (mustIn && !mustIn.includes(val)) return false;
      if (notIn && notIn.includes(val)) return false;
    }
    return true;
  });
}

/** Progress fill across the current entity's steps. */
export function computeKneeFormFill(assessment) {
  const entity = inferKneeEntity(assessment);
  const steps = kneeStepsFor(entity);
  const groups = new Set(steps.map((s) => s.group));
  const family = MECHANICAL_ENTITIES.has(entity) ? 'mechanical' : LOAD_ENTITIES.has(entity) ? 'load' : null;
  const answers = assessment.knee || {};
  const relevant = KNEE_ASSESSMENT_QUESTIONS.filter((q) => groups.has(q.group) && q.core
    && (!q.family || q.family === family));
  const answered = relevant.filter((q) => {
    const v = answers[q.key];
    return v !== undefined && v !== null && v !== '';
  }).length;
  const total = relevant.length || 1;
  const percent = Math.round((answered / total) * 100);
  return { answered, total, percent, allFilled: answered >= total, entity };
}

/** Normalise stored answers (strings from selects) into engine types. */
export function normalizeKneeAnswers(knee = {}) {
  const out = { ...knee };
  for (const b of ['surgical_repair_done', 'high_energy_trauma', 'febrile_hot_joint']) {
    if (out[b] === 'true') out[b] = true;
    if (out[b] === 'false') out[b] = false;
  }
  for (const k of ['laxity_grade', 'morning_stiffness_minutes', 'weeks_since_surgery', 'days_since_injury']) {
    if (out[k] === '' || out[k] === null || out[k] === undefined) { delete out[k]; continue; }
    out[k] = Number(out[k]);
  }
  return out;
}
