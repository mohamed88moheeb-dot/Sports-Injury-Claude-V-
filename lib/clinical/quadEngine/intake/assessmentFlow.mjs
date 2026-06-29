/**
 * lib/clinical/quadEngine/intake/assessmentFlow.mjs
 * ---------------------------------------------------------------------------
 * INTAKE MODE 1 — ADAPTIVE ASSESSMENT (the default).
 *
 * A genuinely branching questionnaire: the next question is a pure function of
 * the answers so far. Choosing where the pain is determines the next set of
 * questions; each answer can open further questions. Safety (extensor-mechanism)
 * questions are surfaced early for at-risk presentations and can short-circuit
 * to an urgent referral before any rehab questions.
 *
 * Driver contract (UI calls this in a loop):
 *   nextStep(answers) -> { done:false, question } | { done:true, ... }
 * When done, the assembled answers are a valid runQuad() input, and the result
 * carries the routed entity + (for rupture) a referral instead of a plan.
 * ---------------------------------------------------------------------------
 */

import { routeEntity, makeQuadInput } from '../quadAssessmentInput.mjs';
import { QUAD_ENTITIES } from '../types.mjs';

// ── Question bank (field, prompt, type, options). Shared shape with the UI. ──
const QUESTIONS = {
  pain_location: {
    field: 'pain_location', type: 'single', prompt: 'Where is the pain?',
    options: [
      { value: 'anterior_thigh', label: 'Front of the thigh' },
      { value: 'lateral_thigh', label: 'Outer side of the thigh' },
      { value: 'medial_thigh', label: 'Inner thigh' },
      { value: 'anterior_knee_tendon', label: 'Just above/below the kneecap (tendon)' },
      { value: 'multiple_or_unsure', label: 'Multiple areas / not sure' },
    ],
  },
  mechanism: {
    field: 'mechanism', type: 'single', prompt: 'How did it happen?',
    options: [
      { value: 'direct_impact', label: 'A direct blow / collision' },
      { value: 'sprinting', label: 'Sprinting or accelerating' },
      { value: 'kicking', label: 'Kicking' },
      { value: 'jumping_overuse', label: 'Jumping / repeated load over time' },
      { value: 'gradual_overuse', label: 'Gradually, no single moment' },
      { value: 'eccentric_load_pop', label: 'A sudden "pop" landing or lifting' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  // Safety screen (extensor-mechanism integrity) — rupture red flags.
  straight_leg_raise: {
    field: 'straight_leg_raise', type: 'single', safety: true,
    prompt: 'Lying down, can you lift the straight leg and hold it up?',
    help: 'Inability to do this is a red flag for a tendon rupture.',
    options: [
      { value: 'able', label: 'Yes' },
      { value: 'unable', label: 'No / it drops' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  extensor_lag: {
    field: 'extensor_lag', type: 'single', safety: true,
    prompt: 'Can you fully straighten the knee against gravity?',
    options: [{ value: 'none', label: 'Yes, fully' }, { value: 'present', label: 'No — it lags' }, { value: 'unsure', label: 'Not sure' }],
  },
  palpable_gap: {
    field: 'palpable_gap', type: 'single', safety: true,
    prompt: 'Is there a felt gap/divot in the tendon near the kneecap?',
    options: [{ value: 'none', label: 'No' }, { value: 'present', label: 'Yes' }, { value: 'unsure', label: 'Not sure' }],
  },
  surgical_repair_done: {
    field: 'surgical_repair_done', type: 'boolean',
    prompt: 'Have you already had surgery to repair this tendon?',
  },
  weeks_since_surgery: {
    field: 'weeks_since_surgery', type: 'number', min: 0, max: 104, unit: 'weeks',
    prompt: 'How many weeks ago was the surgery?',
  },
  // Strain branch
  muscle_hint: {
    field: 'muscle_hint', type: 'single',
    prompt: 'Which muscle feels most affected?',
    options: [
      { value: 'vastus_lateralis', label: 'Outer thigh (vastus lateralis)' },
      { value: 'vastus_medialis', label: 'Inner thigh (vastus medialis / VMO)' },
      { value: 'vastus_intermedius', label: 'Deep front thigh (vastus intermedius)' },
      { value: 'rectus_femoris', label: 'Front, painful when lifting the thigh too' },
      { value: 'multiple_or_unsure', label: 'Not sure' },
    ],
  },
  hip_vs_knee_pain: {
    field: 'hip_vs_knee_pain', type: 'single',
    prompt: 'Is the pain worse lifting the thigh (hip) or straightening the knee?',
    help: 'Helps separate rectus femoris (hip + knee) from the vastii (knee only).',
    options: [
      { value: 'hip_lift', label: 'Lifting the thigh (hip)' },
      { value: 'knee_straighten', label: 'Straightening the knee' },
      { value: 'both', label: 'Both' },
    ],
  },
  pain_severity_label: {
    field: 'pain_severity_label', type: 'single', prompt: 'How severe is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }],
  },
  ability_to_continue: {
    field: 'ability_to_continue', type: 'single', prompt: 'Could you keep going after it happened?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'limited', label: 'Only limited' }, { value: 'no', label: 'No, had to stop' }],
  },
  knee_extension_response: {
    field: 'knee_extension_response', type: 'single', prompt: 'Straightening the knee against resistance feels…',
    options: [{ value: 'none', label: 'Normal' }, { value: 'mild', label: 'Mildly weak/painful' }, { value: 'painful', label: 'Painful/weak' }, { value: 'unable', label: 'Cannot do it' }],
  },
  walking_response: {
    field: 'walking_response', type: 'single', prompt: 'How is walking now?',
    options: [{ value: 'none', label: 'Pain-free' }, { value: 'mild', label: 'Mild' }, { value: 'painful', label: 'Painful/limping' }, { value: 'unable', label: 'Unable' }],
  },
  bruising_or_swelling: {
    field: 'bruising_or_swelling', type: 'single', prompt: 'Bruising or swelling?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'Significant' }],
  },
  previous_injury: { field: 'previous_injury', type: 'boolean', prompt: 'Have you injured this area before?' },
  days_since_injury: { field: 'days_since_injury', type: 'number', min: 0, max: 365, unit: 'days', prompt: 'How many days ago did this start?' },
  // Contusion branch
  knee_flexion_rom_percent: {
    field: 'knee_flexion_rom_percent', type: 'number', min: 0, max: 100, unit: '%',
    prompt: 'How far can you bend the knee vs the good side? (0–100%)',
    help: '>50% mild, 30–50% moderate, <30% severe — this sets the contusion grade.',
  },
  // Tendinopathy branch
  pain_with_jumping: {
    field: 'pain_with_jumping', type: 'single', prompt: 'Is the pain worse with jumping/landing?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' }],
  },
  pain_localised_to_tendon: {
    field: 'pain_localised_to_tendon', type: 'single', prompt: 'Is the pain pinpointed to the tendon at the kneecap?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' }],
  },
  decline_squat_pain_0_10: {
    field: 'decline_squat_pain_0_10', type: 'number', min: 0, max: 10,
    prompt: 'Pain during a single-leg decline squat (0–10)?',
  },
  visa_p_score: { field: 'visa_p_score', type: 'number', min: 0, max: 100, optional: true, prompt: 'VISA-P score if known (0–100)' },
};

const has = (a, f) => a[f] !== undefined && a[f] !== null;

/**
 * Compute the next question (or completion) from the answers so far.
 * The ORDER of these rules encodes the branching tree.
 * @param {object} answers
 * @returns {{done:false, question:object, progress:object} | {done:true, input:object, routing:object, referral?:boolean}}
 */
export function nextStep(answers = {}) {
  const a = answers;

  // 1. Always start by locating the pain.
  if (!has(a, 'pain_location')) return ask('pain_location', a);

  // 2. Then how it happened.
  if (!has(a, 'mechanism')) return ask('mechanism', a);

  // 3. Safety screen for at-risk presentations (tendon area, pop, or unable to continue).
  const atRiskOfRupture = a.pain_location === 'anterior_knee_tendon'
    || a.mechanism === 'eccentric_load_pop'
    || a.knee_extension_response === 'unable';
  if (atRiskOfRupture) {
    if (!has(a, 'straight_leg_raise')) return ask('straight_leg_raise', a);
    if (!has(a, 'extensor_lag')) return ask('extensor_lag', a);
    if (!has(a, 'palpable_gap')) return ask('palpable_gap', a);
    // Red flag tripped -> ask surgery status, then complete (route to rupture).
    const ruptureSigns = a.straight_leg_raise === 'unable' || a.extensor_lag === 'present' || a.palpable_gap === 'present';
    if (ruptureSigns) {
      if (!has(a, 'surgical_repair_done')) return ask('surgical_repair_done', a);
      if (a.surgical_repair_done === true && !has(a, 'weeks_since_surgery')) return ask('weeks_since_surgery', a);
      return complete(a);
    }
  }

  // 4. Branch by mechanism / pattern.
  // ── Contusion branch ──
  if (a.mechanism === 'direct_impact') {
    if (!has(a, 'knee_flexion_rom_percent')) return ask('knee_flexion_rom_percent', a);
    if (!has(a, 'bruising_or_swelling')) return ask('bruising_or_swelling', a);
    if (!has(a, 'walking_response')) return ask('walking_response', a);
    if (!has(a, 'ability_to_continue')) return ask('ability_to_continue', a);
    if (!has(a, 'days_since_injury')) return ask('days_since_injury', a);
    return complete(a);
  }

  // ── Tendinopathy branch ──
  const tendonArea = a.pain_location === 'anterior_knee_tendon';
  const overuse = a.mechanism === 'gradual_overuse' || a.mechanism === 'jumping_overuse';
  if (tendonArea && (overuse || a.pain_with_jumping === 'yes')) {
    if (!has(a, 'pain_with_jumping')) return ask('pain_with_jumping', a);
    if (!has(a, 'pain_localised_to_tendon')) return ask('pain_localised_to_tendon', a);
    if (!has(a, 'decline_squat_pain_0_10')) return ask('decline_squat_pain_0_10', a);
    if (!has(a, 'visa_p_score')) return ask('visa_p_score', a);
    if (!has(a, 'pain_severity_label')) return ask('pain_severity_label', a);
    return complete(a);
  }

  // ── Strain branch (default for acute non-impact) ──
  // Front-thigh ambiguity: separate rectus femoris from the vastii.
  if (a.pain_location === 'anterior_thigh' && !has(a, 'hip_vs_knee_pain')) return ask('hip_vs_knee_pain', a);
  if (!has(a, 'muscle_hint')) return ask('muscle_hint', a);
  if (!has(a, 'pain_severity_label')) return ask('pain_severity_label', a);
  if (!has(a, 'ability_to_continue')) return ask('ability_to_continue', a);
  if (!has(a, 'knee_extension_response')) return ask('knee_extension_response', a);
  if (!has(a, 'walking_response')) return ask('walking_response', a);
  if (!has(a, 'bruising_or_swelling')) return ask('bruising_or_swelling', a);
  if (!has(a, 'previous_injury')) return ask('previous_injury', a);
  if (!has(a, 'days_since_injury')) return ask('days_since_injury', a);
  return complete(a);
}

function ask(field, answers) {
  return { done: false, question: QUESTIONS[field], progress: estimateProgress(answers) };
}

function complete(answers) {
  const { input } = makeQuadInput(answers);
  const routing = routeEntity(input);
  const referral = routing.entity === QUAD_ENTITIES.TENDON_RUPTURE
    && answers.surgical_repair_done !== true && answers.weeks_since_surgery == null;
  return { done: true, input: answers, routing, referral, rectus_femoris_note: detectRf(answers) };
}

// Rectus femoris is handled by the separate RF engine; flag it if the flow lands there.
function detectRf(a) {
  if (a.muscle_hint === 'rectus_femoris' || a.hip_vs_knee_pain === 'hip_lift') {
    return 'Pattern suggests rectus femoris (a biarticular muscle) — route to the dedicated RF engine rather than the vastus pathway.';
  }
  return null;
}

function estimateProgress(answers) {
  const answered = Object.keys(answers).length;
  // Rough: most branches resolve within ~7-9 questions.
  return { answered, estimated_total: 9, pct: Math.min(100, Math.round((answered / 9) * 100)) };
}

/**
 * Test/programmatic helper: drive the whole flow from a scripted answer set,
 * returning the ordered question fields and the final completion.
 */
export function simulateAssessment(scriptedAnswers) {
  const collected = {};
  const asked = [];
  for (let i = 0; i < 30; i++) {
    const step = nextStep(collected);
    if (step.done) return { asked, completion: step };
    const f = step.question.field;
    asked.push(f);
    if (!(f in scriptedAnswers)) {
      // Unanswered required field — stop to avoid infinite loop.
      return { asked, completion: { done: false, stuck_on: f } };
    }
    collected[f] = scriptedAnswers[f];
  }
  return { asked, completion: { done: false, stuck_on: 'max_steps' } };
}

export { QUESTIONS as ASSESSMENT_QUESTIONS };
