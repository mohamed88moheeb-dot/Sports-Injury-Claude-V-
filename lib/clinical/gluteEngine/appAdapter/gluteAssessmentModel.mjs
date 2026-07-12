/**
 * lib/clinical/gluteEngine/appAdapter/gluteAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored glute assessment questions, grouped into carousel steps. Answers
 * are stored under assessment.gluteAnswers keyed by the engine input field,
 * so they flow straight into mapAssessmentToGluteInput.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const GLUTE_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Pain & function', group: 'Pain & function' },
  { label: 'History', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const GLUTE_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'g_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'sudden_deceleration', label: 'Sudden deceleration or change of direction' },
      { value: 'sprinting', label: 'While sprinting' },
      { value: 'fall', label: 'A fall or direct impact' },
      { value: 'gradual_overuse', label: 'Came on gradually with training' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'g_sev', key: 'pain_severity_label', group: 'Injury context', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'g_continue', key: 'ability_to_continue', group: 'Injury context', core: true,
    prompt: 'Could you keep playing/training after it happened (or with this pain)?',
    options: [{ value: 'yes', label: 'Yes, kept going' }, { value: 'limited', label: 'Kept going, but limited' }, { value: 'no', label: 'No, had to stop' }] },
  { id: 'g_duration', key: 'symptom_duration_weeks', group: 'Injury context',
    prompt: 'How many weeks have you had this pain?',
    hint: 'Long-standing lateral-hip pain (many weeks) is managed differently from a fresh strain.',
    options: [{ value: '0.5', label: 'Just happened (days)' }, { value: '2', label: 'About 1-2 weeks' }, { value: '4', label: 'About 3-4 weeks' }, { value: '8', label: '5-8 weeks' }, { value: '20', label: 'More than 2 months' }] },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'g_location', key: 'pain_location', group: 'Pain & function', core: true,
    prompt: 'Where is the pain mainly located?',
    options: [{ value: 'lateral_hip', label: 'Outside (lateral) point of the hip' }, { value: 'deep_buttock', label: 'Deep in the buttock' }, { value: 'unsure', label: 'Not sure' }] },
  { id: 'g_resisted', key: 'resisted_abduction_pain', group: 'Pain & function',
    prompt: 'If you push your leg outward against resistance (hip abduction), does it reproduce your pain?',
    options: [{ value: 'none', label: 'No pain' }, { value: 'mild', label: 'Mild pain' }, { value: 'moderate', label: 'Moderate pain' }, { value: 'severe', label: 'Severe pain' }] },
  { id: 'g_single_leg', key: 'single_leg_stance_pain', group: 'Pain & function',
    prompt: 'Does standing on the affected leg alone reproduce the pain?',
    options: YNU },
  { id: 'g_swell', key: 'bruising_or_swelling', group: 'Pain & function',
    prompt: 'How much swelling or bruising?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'A lot / significant' }] },

  // ── History ─────────────────────────────────────────────────────────────
  { id: 'g_onset', key: 'onset', group: 'History & context',
    prompt: 'Did it start suddenly or build up gradually?',
    options: [{ value: 'sudden', label: 'Suddenly (one moment)' }, { value: 'gradual', label: 'Gradually over time' }] },
  { id: 'g_lying', key: 'worse_lying_on_side', group: 'History & context',
    prompt: 'Is it worse lying on that side at night?',
    options: YNU },
  { id: 'g_stairs', key: 'worse_with_stairs_sitting', group: 'History & context',
    prompt: 'Is it worse with stairs or prolonged sitting?',
    options: YNU },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'g_radiate', key: 'radiating_pain_below_knee', group: 'Safety',
    prompt: 'Does the pain radiate down the leg, below the knee?',
    hint: 'This screens for possible sciatic nerve involvement (deep gluteal syndrome) rather than a muscle strain or tendinopathy.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'g_numb', key: 'numbness_tingling', group: 'Safety',
    prompt: 'Any numbness or tingling down the leg?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'g_nerve', key: 'nerve_provocation_test', group: 'Safety',
    prompt: 'If you have had a nerve tension/straight-leg-raise type test done, was it positive?',
    options: [{ value: 'positive', label: 'Yes, positive' }, { value: 'negative', label: 'No' }, { value: 'unsure', label: 'Not sure / not tested' }] },
];

export function gluteQuestionsForGroup(group) {
  return GLUTE_QUESTIONS.filter((q) => q.group === group);
}

const CORE_GLUTE_KEYS = ['mechanism', 'pain_severity_label', 'ability_to_continue'];

/** Fraction (0..1) of tailored glute questions answered, for the progress meter. */
export function computeGluteFormFill(assessment = {}) {
  const a = assessment.gluteAnswers || {};
  const answered = GLUTE_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_GLUTE_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: GLUTE_QUESTIONS.length ? answered / GLUTE_QUESTIONS.length : 0,
    answered, total: GLUTE_QUESTIONS.length,
    core_complete: coreAnswered === CORE_GLUTE_KEYS.length,
  };
}
