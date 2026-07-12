/**
 * lib/clinical/groinEngine/appAdapter/groinAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored adductor/groin assessment questions, grouped into carousel steps.
 * Answers are stored under assessment.groinAnswers keyed by the engine input
 * field, so they flow straight into mapAssessmentToGroinInput.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const GROIN_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Pain & function', group: 'Pain & function' },
  { label: 'History', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const GROIN_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'g_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'kicking', label: 'Kicking (a ball, or an opponent)' },
      { value: 'change_of_direction', label: 'Cutting / change of direction' },
      { value: 'sprinting', label: 'Sprinting / sudden stretch' },
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
    hint: 'Long-standing groin pain (many weeks) is managed differently from a fresh strain.',
    options: [{ value: '0.5', label: 'Just happened (days)' }, { value: '2', label: 'About 1-2 weeks' }, { value: '4', label: 'About 3-4 weeks' }, { value: '8', label: '5-8 weeks' }, { value: '20', label: 'More than 2 months' }] },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'g_resisted', key: 'resisted_adduction_pain', group: 'Pain & function',
    prompt: 'If you squeeze your knees together against resistance (or a pillow), does it reproduce your groin pain?',
    hint: 'This is the "resisted adduction" or "squeeze" test for adductor-related pain.',
    options: [{ value: 'none', label: 'No pain' }, { value: 'mild', label: 'Mild pain' }, { value: 'moderate', label: 'Moderate pain' }, { value: 'severe', label: 'Severe pain' }] },
  { id: 'g_swell', key: 'bruising_or_swelling', group: 'Pain & function',
    prompt: 'How much swelling or bruising?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'A lot / significant' }] },

  // ── History ─────────────────────────────────────────────────────────────
  { id: 'g_onset', key: 'onset', group: 'History & context',
    prompt: 'Did it start suddenly or build up gradually?',
    options: [{ value: 'sudden', label: 'Suddenly (one moment)' }, { value: 'gradual', label: 'Gradually over time' }] },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'g_bulge', key: 'bulge_present', group: 'Safety',
    prompt: 'Is there a bulge or lump in the groin?',
    hint: 'A bulge that worsens with straining/coughing can indicate a hernia, which needs a different assessment.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'g_strain', key: 'worse_with_straining', group: 'Safety',
    prompt: 'Does any bulge or the pain get worse when you cough, strain, or hold your breath and push?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'g_fadir', key: 'fadir_test', group: 'Safety',
    prompt: 'Does bringing your knee up and across your body (toward the opposite shoulder) reproduce deep hip/groin pain?',
    hint: 'This screens for a possible hip-joint cause (like impingement) rather than a muscle strain.',
    options: [{ value: 'positive', label: 'Yes, reproduces deep pain' }, { value: 'negative', label: 'No' }, { value: 'unsure', label: 'Not sure / did not test' }] },
  { id: 'g_click', key: 'clicking_or_catching', group: 'Safety',
    prompt: 'Do you feel clicking, catching, or locking in the hip joint itself?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

export function groinQuestionsForGroup(group) {
  return GROIN_QUESTIONS.filter((q) => q.group === group);
}

const CORE_GROIN_KEYS = ['mechanism', 'pain_severity_label', 'ability_to_continue'];

/** Fraction (0..1) of tailored groin questions answered, for the progress meter. */
export function computeGroinFormFill(assessment = {}) {
  const a = assessment.groinAnswers || {};
  const answered = GROIN_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_GROIN_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: GROIN_QUESTIONS.length ? answered / GROIN_QUESTIONS.length : 0,
    answered, total: GROIN_QUESTIONS.length,
    core_complete: coreAnswered === CORE_GROIN_KEYS.length,
  };
}
