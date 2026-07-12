/**
 * lib/clinical/itBandEngine/appAdapter/itBandAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored IT band assessment questions, grouped into carousel steps.
 * Answers are stored under assessment.itBandAnswers keyed by the engine
 * input field, so they flow straight into mapAssessmentToItBandInput.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const IT_BAND_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Pain & function', group: 'Pain & function' },
  { label: 'History', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const IT_BAND_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'i_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'gradual_overuse', label: 'Came on gradually with running/training' },
      { value: 'sudden', label: 'Started suddenly' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'i_sev', key: 'pain_severity_label', group: 'Injury context', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'i_continue', key: 'ability_to_continue', group: 'Injury context', core: true,
    prompt: 'Can you keep running/training with this pain?',
    options: [{ value: 'yes', label: 'Yes, kept going' }, { value: 'limited', label: 'Kept going, but limited' }, { value: 'no', label: 'No, had to stop' }] },
  { id: 'i_duration', key: 'symptom_duration_weeks', group: 'Injury context',
    prompt: 'How many weeks have you had this pain?',
    options: [{ value: '0.5', label: 'Just happened (days)' }, { value: '2', label: 'About 1-2 weeks' }, { value: '4', label: 'About 3-4 weeks' }, { value: '8', label: '5-8 weeks' }, { value: '20', label: 'More than 2 months' }] },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'i_location', key: 'pain_location', group: 'Pain & function', core: true,
    prompt: 'Where is the pain?',
    options: [{ value: 'lateral_knee', label: 'Outside (lateral) side of the knee' }, { value: 'unsure', label: 'Not sure' }] },
  { id: 'i_downhill', key: 'worse_downhill_or_stairs', group: 'Pain & function',
    prompt: 'Is it worse running downhill or going down stairs?',
    hint: 'This is a classic aggravator for iliotibial band syndrome.',
    options: YNU },
  { id: 'i_resisted', key: 'resisted_hip_abduction_pain', group: 'Pain & function',
    prompt: 'If you push your leg outward against resistance (hip abduction), does it reproduce your pain or feel weak?',
    options: [{ value: 'none', label: 'No pain/weakness' }, { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },

  // ── History ─────────────────────────────────────────────────────────────
  { id: 'i_onset', key: 'onset', group: 'History & context',
    prompt: 'Did it start suddenly or build up gradually?',
    options: [{ value: 'sudden', label: 'Suddenly (one moment)' }, { value: 'gradual', label: 'Gradually over time' }] },
  { id: 'i_training', key: 'recent_training_change', group: 'History & context',
    prompt: 'Have you recently increased mileage, added hills/track work, or changed shoes/surfaces?',
    options: YNU },
  { id: 'i_consistent', key: 'consistent_onset_distance', group: 'History & context',
    prompt: 'Does the pain tend to start at a consistent point in a run and ease with rest?',
    options: YNU },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'i_lock', key: 'locking_or_catching', group: 'Safety',
    prompt: 'Does the knee lock, catch, or get stuck?',
    hint: 'This screens for a possible structural cause (e.g. meniscus tear) rather than iliotibial band syndrome.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'i_give', key: 'giving_way', group: 'Safety',
    prompt: 'Does the knee ever give way or feel unstable?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'i_effusion', key: 'significant_effusion', group: 'Safety',
    prompt: 'Is there significant swelling in the knee joint itself (not just tenderness on the outside)?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

export function itBandQuestionsForGroup(group) {
  return IT_BAND_QUESTIONS.filter((q) => q.group === group);
}

const CORE_IT_BAND_KEYS = ['mechanism', 'pain_severity_label', 'ability_to_continue'];

/** Fraction (0..1) of tailored IT band questions answered, for the progress meter. */
export function computeItBandFormFill(assessment = {}) {
  const a = assessment.itBandAnswers || {};
  const answered = IT_BAND_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_IT_BAND_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: IT_BAND_QUESTIONS.length ? answered / IT_BAND_QUESTIONS.length : 0,
    answered, total: IT_BAND_QUESTIONS.length,
    core_complete: coreAnswered === CORE_IT_BAND_KEYS.length,
  };
}
