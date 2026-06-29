/**
 * lib/clinical/quadEngine/appAdapter/quadAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored, per-muscle / per-injury assessment question model for the quad
 * engine — the analogue of rfAssessmentModel for the RF engine. Pure +
 * browser-safe (imports nothing).
 *
 * Design:
 *   - Question KEYS are the engine input field names, so answers stored under
 *     assessment.quad flow straight into mapAssessmentToQuadInput (no second
 *     translation layer).
 *   - Shared groups (Injury context, Pain & symptoms, Safety check) are asked
 *     for every quad injury. Entity-specific groups are swapped in based on the
 *     injury inferred from the anatomy selection + early answers — so a vastus
 *     strain, a contusion, a tendinopathy and a rupture each get DIFFERENT
 *     middle questions while reusing the common ones.
 *   - This generalises: adding a new muscle group = add its question groups +
 *     a step map, reusing the same renderer and engine seam.
 * ---------------------------------------------------------------------------
 */

const C = (value, label) => ({ value, label });

// ── Question bank. key === engine input field. ──────────────────────────────
export const QUAD_ASSESSMENT_QUESTIONS = [
  // ═══ Shared: Injury context (all entities) ═══
  {
    id: 'q_mech', group: 'Injury context', key: 'mechanism', core: true, type: 'choice',
    prompt: 'How did it happen?',
    options: [
      C('direct_impact', 'A direct blow / collision ("dead leg")'),
      C('sprinting', 'Sprinting or accelerating'),
      C('kicking', 'Kicking'),
      C('jumping_overuse', 'Jumping / repeated load over time'),
      C('gradual_overuse', 'Gradually, no single moment'),
      C('eccentric_load_pop', 'A sudden "pop" landing or lifting'),
      C('unsure', 'Not sure'),
    ],
  },
  {
    id: 'q_onset', group: 'Injury context', key: 'onset', core: true, type: 'choice',
    prompt: 'Did it come on suddenly or gradually?',
    options: [C('sudden', 'Suddenly (one moment)'), C('gradual', 'Gradually (built up)')],
  },
  {
    id: 'q_days', group: 'Injury context', key: 'days_since_injury', core: false, type: 'slider',
    prompt: 'How long ago did this start?', min: 0, max: 60, default: 7, unit: 'days',
    bands: [{ max: 2, label: '0–2 days (acute)' }, { max: 7, label: 'About a week' }, { max: 21, label: '1–3 weeks' }, { max: 60, label: '3+ weeks' }],
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
    id: 'q_swell', group: 'Pain & symptoms', key: 'bruising_or_swelling', core: false, type: 'choice',
    prompt: 'Any bruising or swelling?',
    options: [C('none', 'None'), C('some', 'Some'), C('significant', 'Significant')],
  },

  // ═══ Vastus strain (entity: vastus_strain) ═══
  {
    id: 'q_kext', group: 'Strength & movement', entity: 'vastus_strain', key: 'knee_extension_response', core: true, type: 'choice',
    prompt: 'Straightening the knee against resistance feels…',
    hint: 'The vastii are felt when straightening the knee, not when lifting the thigh.',
    options: [C('none', 'Normal'), C('mild', 'Mildly weak/painful'), C('painful', 'Painful/weak'), C('unable', 'Cannot do it')],
  },
  {
    id: 'q_walk', group: 'Strength & movement', entity: 'vastus_strain', key: 'walking_response', core: false, type: 'choice',
    prompt: 'How is walking now?',
    options: [C('none', 'Pain-free'), C('mild', 'Mild'), C('painful', 'Painful / limping'), C('unable', 'Unable')],
  },
  {
    id: 'q_prev', group: 'Strength & movement', entity: 'vastus_strain', key: 'previous_injury', core: false, type: 'choice',
    prompt: 'Have you injured this muscle before?',
    options: [C('true', 'Yes'), C('false', 'No')],
  },

  // ═══ Contusion (entity: quad_contusion) ═══
  {
    id: 'q_rom', group: 'Swelling & range', entity: 'quad_contusion', key: 'knee_flexion_rom_percent', core: true, type: 'slider',
    prompt: 'How far can you bend the knee vs the good side?', min: 0, max: 100, default: 60, unit: '%',
    hint: '>50% = mild, 30–50% = moderate, <30% = severe. This sets the contusion grade.',
    bands: [{ max: 30, label: 'Under 30% — severe' }, { max: 50, label: '30–50% — moderate' }, { max: 100, label: 'Over 50% — milder' }],
  },
  {
    id: 'q_swellchg', group: 'Swelling & range', entity: 'quad_contusion', key: 'swelling_change', core: false, type: 'choice',
    prompt: 'Compared with yesterday, the swelling is…',
    hint: 'Increasing swelling raises the risk of myositis ossificans.',
    options: [C('less', 'Less'), C('same', 'About the same'), C('more', 'More / worse')],
  },

  // ═══ Tendinopathy (entity: quad_tendinopathy) ═══
  {
    id: 'q_jump', group: 'Tendon load', entity: 'quad_tendinopathy', key: 'pain_with_jumping', core: true, type: 'choice',
    prompt: 'Is the pain worse with jumping / landing?',
    options: [C('yes', 'Yes'), C('no', 'No'), C('unsure', 'Unsure')],
  },
  {
    id: 'q_tendloc', group: 'Tendon load', entity: 'quad_tendinopathy', key: 'pain_localised_to_tendon', core: true, type: 'choice',
    prompt: 'Is the pain pinpointed to the tendon at the kneecap?',
    options: [C('yes', 'Yes'), C('no', 'No'), C('unsure', 'Unsure')],
  },
  {
    id: 'q_decline', group: 'Tendon load', entity: 'quad_tendinopathy', key: 'decline_squat_pain_0_10', core: true, type: 'slider',
    prompt: 'Pain during a single-leg decline squat (0–10)?', min: 0, max: 10, default: 4,
    hint: 'The standard tendon-pain test. ≥7 high, 4–6 moderate, ≤3 low.',
    bands: [{ max: 3, label: 'Low (≤3)' }, { max: 6, label: 'Moderate (4–6)' }, { max: 10, label: 'High (≥7)' }],
  },
  {
    id: 'q_visa', group: 'Tendon load', entity: 'quad_tendinopathy', key: 'visa_p_score', core: false, type: 'slider',
    prompt: 'VISA-P score, if known (0–100; lower = worse)', min: 0, max: 100, default: 60,
    bands: [{ max: 50, label: 'Under 50' }, { max: 80, label: '50–80' }, { max: 100, label: 'Over 80' }],
  },

  // ═══ Tendon rupture (entity: quad_tendon_rupture) ═══
  {
    id: 'q_surg', group: 'Tendon & surgery', entity: 'quad_tendon_rupture', key: 'surgical_repair_done', core: true, type: 'choice',
    prompt: 'Have you already had surgery to repair this tendon?',
    options: [C('true', 'Yes'), C('false', 'No / not yet')],
  },
  {
    id: 'q_weeks', group: 'Tendon & surgery', entity: 'quad_tendon_rupture', key: 'weeks_since_surgery', core: false, type: 'slider',
    prompt: 'How many weeks ago was the surgery?', min: 0, max: 52, default: 6, unit: 'weeks',
    conditional: { key: 'surgical_repair_done', in: ['true'] },
    bands: [{ max: 6, label: '0–6 wks (protected)' }, { max: 12, label: '6–12 wks (mobility)' }, { max: 20, label: '3–5 mo (strength)' }, { max: 52, label: '5+ mo (return)' }],
  },

  // ═══ Shared: Safety check (all entities) — also catches an unsuspected rupture ═══
  {
    id: 'q_slr', group: 'Safety check', key: 'straight_leg_raise', core: true, type: 'choice',
    prompt: 'Lying down, can you lift the straight leg and hold it up?',
    hint: 'Inability to do this is a red flag for a tendon rupture.',
    options: [C('able', 'Yes'), C('unable', 'No / it drops'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_lag', group: 'Safety check', key: 'extensor_lag', core: false, type: 'choice',
    prompt: 'Can you fully straighten the knee against gravity?',
    options: [C('none', 'Yes, fully'), C('present', 'No — it lags'), C('unsure', 'Not sure')],
  },
  {
    id: 'q_gap', group: 'Safety check', key: 'palpable_gap', core: false, type: 'choice',
    prompt: 'Is there a felt gap / divot in the tendon near the kneecap?',
    options: [C('none', 'No'), C('present', 'Yes'), C('unsure', 'Not sure')],
  },
];

/**
 * Infer the quad injury entity from the anatomy selection + early answers.
 * Mirrors the engine router's priorities, minus the extensor-mechanism
 * short-circuit (those safety answers come last). Used to pick which
 * entity-specific question group to show.
 */
export function inferQuadEntity(assessment = {}) {
  const q = assessment.quad || {};
  const exact = (assessment.exactArea || '').toLowerCase();
  const tendon = /tendon|patellar|jumper|kneecap/.test(exact);
  const mech = q.mechanism || '';

  // Strong rupture signals (if the safety questions were already answered).
  if (q.straight_leg_raise === 'unable' || q.extensor_lag === 'present' || q.palpable_gap === 'present'
    || q.surgical_repair_done === 'true' || q.surgical_repair_done === true || q.weeks_since_surgery != null) {
    return 'quad_tendon_rupture';
  }
  // A tendon structure was selected -> tendon pathway (tendinopathy by default).
  // A frank rupture is caught above by the extensor-mechanism safety answers
  // (loss of straight-leg-raise / extension lag / gap), not by a "pop" alone.
  if (tendon) return 'quad_tendinopathy';
  if (mech === 'direct_impact') return 'quad_contusion';
  return 'vastus_strain';
}

// Entity-specific middle group + step label.
const ENTITY_MIDDLE = {
  vastus_strain: { group: 'Strength & movement', label: 'Strength & movement' },
  quad_contusion: { group: 'Swelling & range', label: 'Swelling & range' },
  quad_tendinopathy: { group: 'Tendon load', label: 'Tendon load' },
  quad_tendon_rupture: { group: 'Tendon & surgery', label: 'Tendon & surgery' },
};

/** The carousel steps for a given inferred entity. */
export function quadStepsFor(entity) {
  const mid = ENTITY_MIDDLE[entity] || ENTITY_MIDDLE.vastus_strain;
  // Rupture is focused: context -> tendon & surgery -> safety (no generic pain step).
  if (entity === 'quad_tendon_rupture') {
    return [
      { label: 'How it started', group: 'Injury context' },
      { label: mid.label, group: mid.group },
      { label: 'Safety check', group: 'Safety check' },
    ];
  }
  return [
    { label: 'How it started', group: 'Injury context' },
    { label: 'Pain & symptoms', group: 'Pain & symptoms' },
    { label: mid.label, group: mid.group },
    { label: 'Safety check', group: 'Safety check' },
  ];
}

/** Questions visible in a group, honouring conditional logic. */
export function quadQuestionsForGroup(group, assessment) {
  const answers = assessment.quad || {};
  return QUAD_ASSESSMENT_QUESTIONS.filter((q) => {
    if (q.group !== group) return false;
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
export function computeQuadFormFill(assessment) {
  const entity = inferQuadEntity(assessment);
  const steps = quadStepsFor(entity);
  const groups = new Set(steps.map((s) => s.group));
  const answers = assessment.quad || {};
  const relevant = QUAD_ASSESSMENT_QUESTIONS.filter((q) => groups.has(q.group) && q.core
    && (!q.conditional || quadQuestionsForGroup(q.group, assessment).some((x) => x.id === q.id)));
  const answered = relevant.filter((q) => {
    const v = answers[q.key];
    return v !== undefined && v !== null && v !== '';
  }).length;
  const total = relevant.length || 1;
  const percent = Math.round((answered / total) * 100);
  return { answered, total, percent, allFilled: answered >= total, entity };
}

/** Normalise stored answers (strings from selects) into engine types. */
export function normalizeQuadAnswers(quad = {}) {
  const out = { ...quad };
  if (out.surgical_repair_done === 'true') out.surgical_repair_done = true;
  if (out.surgical_repair_done === 'false') out.surgical_repair_done = false;
  if (out.previous_injury === 'true') out.previous_injury = true;
  if (out.previous_injury === 'false') out.previous_injury = false;
  for (const k of ['knee_flexion_rom_percent', 'decline_squat_pain_0_10', 'visa_p_score', 'weeks_since_surgery', 'days_since_injury']) {
    if (out[k] === '' || out[k] === null || out[k] === undefined) { delete out[k]; continue; }
    out[k] = Number(out[k]);
  }
  return out;
}
