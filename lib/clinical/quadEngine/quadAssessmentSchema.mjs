/**
 * lib/clinical/quadEngine/quadAssessmentSchema.mjs
 * ---------------------------------------------------------------------------
 * GUIDED, BRANCHING ASSESSMENT WIRING.
 *
 * Two phases:
 *   Phase 1 — Universal triage + safety screen (always asked). Drives the
 *             entity router. Includes the extensor-mechanism red-flag questions
 *             so a possible rupture is caught before any rehab questionnaire.
 *   Phase 2 — Entity-tailored questionnaire. Each entity surfaces ONLY the
 *             fields its own diagnosis consumes (verified against the module
 *             diagnosis functions), plus a muscle selector for vastus strains.
 *
 * The questionnaires are declarative data (field, prompt, type, options, help)
 * so a UI can render them directly and a future revision changes data, not code.
 * `runGuidedAssessment()` threads triage -> route -> tailored answers -> runQuad.
 * ---------------------------------------------------------------------------
 */

import { QUAD_ENTITIES } from './types.mjs';
import { makeQuadInput, routeEntity } from './quadAssessmentInput.mjs';
import { runQuad } from './index.mjs';

// Question types a renderer must support: 'single' (radio), 'number', 'boolean'.
// `drives: 'routing' | 'diagnosis' | 'safety'` documents why the field exists.

// ── Phase 1: universal triage + safety screen ───────────────────────────────
export const UNIVERSAL_TRIAGE = [
  {
    field: 'pain_location', type: 'single', drives: 'routing',
    prompt: 'Where is the pain?',
    help: 'Pick the closest area. This starts the routing to the right injury pathway.',
    options: [
      { value: 'anterior_thigh', label: 'Front of the thigh' },
      { value: 'lateral_thigh', label: 'Outer side of the thigh' },
      { value: 'medial_thigh', label: 'Inner thigh' },
      { value: 'anterior_knee_tendon', label: 'Just above/below the kneecap (tendon)' },
      { value: 'multiple_or_unsure', label: 'Multiple areas / not sure' },
    ],
  },
  {
    field: 'mechanism', type: 'single', drives: 'routing',
    prompt: 'How did it happen?',
    options: [
      { value: 'direct_impact', label: 'A direct blow / collision ("dead leg")' },
      { value: 'sprinting', label: 'Sprinting or accelerating' },
      { value: 'kicking', label: 'Kicking' },
      { value: 'jumping_overuse', label: 'Jumping / repeated load over time' },
      { value: 'gradual_overuse', label: 'Came on gradually with no single moment' },
      { value: 'eccentric_load_pop', label: 'A sudden "pop" landing or lifting' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    field: 'onset', type: 'single', drives: 'routing',
    prompt: 'Did it come on suddenly or gradually?',
    options: [
      { value: 'sudden', label: 'Suddenly (one moment)' },
      { value: 'gradual', label: 'Gradually (built up over days/weeks)' },
    ],
  },
  // ── Safety screen — extensor-mechanism integrity (rupture red flags) ──────
  {
    field: 'straight_leg_raise', type: 'single', drives: 'safety',
    prompt: 'Lying down, can you lift the straight leg off the bed and hold it?',
    help: 'Inability to do this is a red flag for a tendon rupture.',
    options: [
      { value: 'able', label: 'Yes, I can lift and hold it' },
      { value: 'unable', label: 'No, I cannot lift it / it drops' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    field: 'extensor_lag', type: 'single', drives: 'safety',
    prompt: 'Can you fully straighten the knee actively against gravity?',
    options: [
      { value: 'none', label: 'Yes, fully' },
      { value: 'present', label: 'No — it lags / cannot fully straighten' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    field: 'palpable_gap', type: 'single', drives: 'safety',
    prompt: 'Is there a felt gap/divot in the tendon above or below the kneecap?',
    options: [
      { value: 'none', label: 'No gap' },
      { value: 'present', label: 'Yes, a gap can be felt' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    field: 'surgical_repair_done', type: 'boolean', drives: 'routing',
    prompt: 'Have you already had surgery to repair this tendon?',
    help: 'If yes, you will be placed on the post-operative pathway.',
  },
  {
    field: 'weeks_since_surgery', type: 'number', drives: 'routing', optional: true,
    prompt: 'If operated: how many weeks ago was the surgery?',
    min: 0, max: 104, unit: 'weeks',
    show_if: { field: 'surgical_repair_done', equals: true },
  },
];

// ── Phase 2: entity-tailored questionnaires ─────────────────────────────────
// Each surfaces ONLY the fields its module's diagnosis consumes.

const Q = {
  pain_severity_label: {
    field: 'pain_severity_label', type: 'single', drives: 'diagnosis',
    prompt: 'How severe is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }],
  },
  ability_to_continue: {
    field: 'ability_to_continue', type: 'single', drives: 'diagnosis',
    prompt: 'Could you keep playing/training after it happened?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'limited', label: 'Only with limitation' }, { value: 'no', label: 'No, had to stop' }],
  },
  walking_response: {
    field: 'walking_response', type: 'single', drives: 'diagnosis',
    prompt: 'How is walking now?',
    options: [{ value: 'none', label: 'Pain-free' }, { value: 'mild', label: 'Mildly painful' }, { value: 'painful', label: 'Painful / limping' }, { value: 'unable', label: 'Unable to walk normally' }],
  },
  knee_extension_response: {
    field: 'knee_extension_response', type: 'single', drives: 'diagnosis',
    prompt: 'Straightening the knee against resistance feels…',
    options: [{ value: 'none', label: 'Normal' }, { value: 'mild', label: 'Mildly weak/painful' }, { value: 'painful', label: 'Painful/weak' }, { value: 'unable', label: 'Cannot do it' }],
  },
  bruising_or_swelling: {
    field: 'bruising_or_swelling', type: 'single', drives: 'diagnosis',
    prompt: 'Is there bruising or swelling?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'Significant' }],
  },
  previous_injury: {
    field: 'previous_injury', type: 'boolean', drives: 'diagnosis',
    prompt: 'Have you injured this area before?',
  },
  days_since_injury: {
    field: 'days_since_injury', type: 'number', drives: 'diagnosis',
    prompt: 'How many days ago did this happen?', min: 0, max: 365, unit: 'days',
  },
};

export const ENTITY_QUESTIONNAIRES = {
  [QUAD_ENTITIES.VASTUS_STRAIN]: {
    title: 'Vastus muscle strain — tailored assessment',
    intro: 'Localising which vastus muscle and grading the strain.',
    questions: [
      {
        field: 'muscle_hint', type: 'single', drives: 'diagnosis',
        prompt: 'Which muscle is most affected?',
        help: 'The vastii cross only the knee — pain is felt with knee-straightening, not hip lift.',
        options: [
          { value: 'vastus_lateralis', label: 'Outer thigh (vastus lateralis)' },
          { value: 'vastus_medialis', label: 'Inner thigh (vastus medialis / VMO)' },
          { value: 'vastus_intermedius', label: 'Deep front thigh (vastus intermedius)' },
          { value: 'multiple_or_unsure', label: 'Not sure' },
        ],
      },
      Q.pain_severity_label, Q.ability_to_continue, Q.knee_extension_response,
      Q.walking_response, Q.bruising_or_swelling, Q.previous_injury, Q.days_since_injury,
    ],
  },

  [QUAD_ENTITIES.CONTUSION]: {
    title: 'Quadriceps contusion — tailored assessment',
    intro: 'Contusion severity is set by knee-flexion range, re-checked at 24 hours.',
    questions: [
      {
        field: 'knee_flexion_rom_percent', type: 'number', drives: 'diagnosis',
        prompt: 'How far can you bend the knee, vs the good side? (0–100%)',
        help: '>50% = mild, 30–50% = moderate, <30% = severe. This is the contusion grade.',
        min: 0, max: 100, unit: '%',
      },
      Q.walking_response, Q.ability_to_continue, Q.bruising_or_swelling, Q.days_since_injury,
    ],
  },

  [QUAD_ENTITIES.TENDINOPATHY]: {
    title: 'Quad / patellar tendinopathy — tailored assessment',
    intro: 'Irritability is gauged from tendon-load pain to set the loading-ladder entry.',
    questions: [
      {
        field: 'decline_squat_pain_0_10', type: 'number', drives: 'diagnosis',
        prompt: 'Pain during a single-leg decline squat (0–10)?',
        help: 'The standard tendon-pain monitoring test. >=7 high, 4–6 moderate, <=3 low.',
        min: 0, max: 10,
      },
      {
        field: 'visa_p_score', type: 'number', drives: 'diagnosis', optional: true,
        prompt: 'VISA-P score, if known (0–100; lower = worse)',
        min: 0, max: 100,
      },
      {
        field: 'pain_with_jumping', type: 'single', drives: 'routing',
        prompt: 'Is the pain worse with jumping/landing?',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' }],
      },
      {
        field: 'pain_localised_to_tendon', type: 'single', drives: 'routing',
        prompt: 'Is the pain pinpointed to the tendon at the kneecap?',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' }],
      },
      Q.pain_severity_label,
    ],
  },

  [QUAD_ENTITIES.TENDON_RUPTURE]: {
    title: 'Quad / patellar tendon rupture — tailored pathway',
    intro: 'If not yet operated, this routes to urgent assessment. If post-op, it sets the recovery stage.',
    questions: [
      // surgical_repair_done + weeks_since_surgery captured in triage; reaffirm extensor signs.
      {
        field: 'knee_extension_response', type: 'single', drives: 'diagnosis',
        prompt: 'Can you straighten the knee against resistance?',
        options: [{ value: 'none', label: 'Yes, normal' }, { value: 'mild', label: 'Weak' }, { value: 'painful', label: 'Painful/weak' }, { value: 'unable', label: 'Cannot' }],
      },
      Q.pain_severity_label,
    ],
  },
};

/**
 * PHASE 1 -> route. Given triage answers, return the entity + the tailored
 * questionnaire to present next.
 */
export function startAssessment(triageAnswers = {}) {
  const { input } = makeQuadInput(triageAnswers);
  const routing = routeEntity(input);
  const questionnaire = ENTITY_QUESTIONNAIRES[routing.entity] || null;

  // If a suspected (un-operated) rupture, the next step is referral, not a form.
  const isPreOpRupture = routing.entity === QUAD_ENTITIES.TENDON_RUPTURE
    && triageAnswers.surgical_repair_done !== true && triageAnswers.weeks_since_surgery == null;

  return {
    routing,
    entity: routing.entity,
    next: isPreOpRupture ? 'urgent_referral' : 'entity_questionnaire',
    questionnaire,
    triage_flags: routing.flags,
  };
}

/**
 * PHASE 2 -> run. Merge triage + entity answers and run the full engine,
 * producing the tailored diagnosis + program for that entity.
 */
export function completeAssessment(triageAnswers = {}, entityAnswers = {}) {
  return runQuad({ ...triageAnswers, ...entityAnswers });
}

/** Convenience: full guided flow in one call (for tests / programmatic use). */
export function runGuidedAssessment(triageAnswers = {}, entityAnswers = {}) {
  const start = startAssessment(triageAnswers);
  const result = completeAssessment(triageAnswers, entityAnswers);
  return { start, result };
}

/** List the field ids a given entity questionnaire will collect (for UI/validation). */
export function questionnaireFields(entity) {
  const q = ENTITY_QUESTIONNAIRES[entity];
  return q ? q.questions.map((x) => x.field) : [];
}
