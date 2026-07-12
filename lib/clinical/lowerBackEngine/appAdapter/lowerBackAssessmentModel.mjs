/**
 * lib/clinical/lowerBackEngine/appAdapter/lowerBackAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored lower back assessment questions, grouped into carousel steps.
 * Answers are stored under assessment.lowerBackAnswers keyed by the engine
 * input field, so they flow straight into mapAssessmentToLowerBackInput.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const LOWER_BACK_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Pain & function', group: 'Pain & function' },
  { label: 'History', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const LOWER_BACK_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'b_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'sudden_lift_twist', label: 'A specific lift, bend, or twist' },
      { value: 'repetitive_extension_rotation', label: 'Repetitive extension/rotation (e.g. gymnastics, bowling, throwing)' },
      { value: 'gradual_overuse', label: 'Came on gradually with training' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'b_sev', key: 'pain_severity_label', group: 'Injury context', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'b_continue', key: 'ability_to_continue', group: 'Injury context', core: true,
    prompt: 'Can you keep training/playing with this pain?',
    options: [{ value: 'yes', label: 'Yes, kept going' }, { value: 'limited', label: 'Kept going, but limited' }, { value: 'no', label: 'No, had to stop' }] },
  { id: 'b_duration', key: 'symptom_duration_weeks', group: 'Injury context',
    prompt: 'How many weeks have you had this pain?',
    options: [{ value: '0.5', label: 'Just happened (days)' }, { value: '2', label: 'About 1-2 weeks' }, { value: '4', label: 'About 3-4 weeks' }, { value: '8', label: '5-8 weeks' }, { value: '20', label: 'More than 2 months' }] },
  { id: 'b_age', key: 'age_group', group: 'Injury context',
    prompt: 'Age group?',
    options: [{ value: 'youth_or_adolescent', label: 'Youth / adolescent (under ~18)' }, { value: 'adult', label: 'Adult' }] },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'b_location', key: 'pain_location', group: 'Pain & function', core: true,
    prompt: 'Where is the pain mainly located?',
    options: [{ value: 'central_low_back', label: 'Central low back' }, { value: 'one_sided_low_back', label: 'One side of the low back' }, { value: 'leg_pain_below_knee', label: 'Pain extends down the leg, below the knee' }, { value: 'unsure', label: 'Not sure' }] },
  { id: 'b_leg', key: 'leg_pain_below_knee', group: 'Pain & function',
    prompt: 'Does pain extend down the leg, below the knee?',
    options: YNU },
  { id: 'b_numb', key: 'numbness_tingling_leg', group: 'Pain & function',
    prompt: 'Any numbness or tingling in the leg?',
    options: YNU },
  { id: 'b_flexion', key: 'worse_with_flexion_sitting', group: 'Pain & function',
    prompt: 'Is it worse sitting or bending forward?',
    options: YNU },
  { id: 'b_extension', key: 'worse_with_extension', group: 'Pain & function',
    prompt: 'Is it worse arching backward (extension)?',
    options: YNU },

  // ── History ─────────────────────────────────────────────────────────────
  { id: 'b_onset', key: 'onset', group: 'History & context',
    prompt: 'Did it start suddenly or build up gradually?',
    options: [{ value: 'sudden', label: 'Suddenly (one moment)' }, { value: 'gradual', label: 'Gradually over time' }] },
  { id: 'b_sport', key: 'extension_rotation_sport', group: 'History & context',
    prompt: 'Do you play a sport with lots of back extension/rotation (gymnastics, cricket fast bowling, dance, javelin, etc.)?',
    options: YNU },
  { id: 'b_stork', key: 'single_leg_hyperextension_test', group: 'History & context',
    prompt: 'If you have been tested by standing on one leg and leaning backward, did it reproduce your pain?',
    hint: 'This is the "stork test" for a possible pars stress injury.',
    options: [{ value: 'positive', label: 'Yes, reproduces pain' }, { value: 'negative', label: 'No' }, { value: 'unsure', label: 'Not sure / not tested' }] },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'b_saddle', key: 'saddle_numbness', group: 'Safety',
    prompt: 'Any numbness around the saddle area (inner thighs, buttocks, groin)?',
    hint: 'This is a red flag for a serious spinal condition and needs urgent assessment.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'b_bladder', key: 'bladder_or_bowel_dysfunction', group: 'Safety',
    prompt: 'Any new bladder or bowel control changes (retention, incontinence)?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'b_bilateral', key: 'bilateral_leg_symptoms', group: 'Safety',
    prompt: 'Symptoms (pain, numbness, or weakness) in both legs?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'b_progressive', key: 'progressive_neuro_deficit', group: 'Safety',
    prompt: 'Is leg weakness or numbness getting progressively worse?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'b_trauma', key: 'recent_significant_trauma', group: 'Safety',
    prompt: 'Any recent significant trauma (fall, collision, accident)?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'b_systemic', key: 'unexplained_weight_loss_or_fever', group: 'Safety',
    prompt: 'Any unexplained weight loss or fever alongside the back pain?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

export function lowerBackQuestionsForGroup(group) {
  return LOWER_BACK_QUESTIONS.filter((q) => q.group === group);
}

const CORE_LOWER_BACK_KEYS = ['mechanism', 'pain_severity_label', 'ability_to_continue'];

/** Fraction (0..1) of tailored lower back questions answered, for the progress meter. */
export function computeLowerBackFormFill(assessment = {}) {
  const a = assessment.lowerBackAnswers || {};
  const answered = LOWER_BACK_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_LOWER_BACK_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: LOWER_BACK_QUESTIONS.length ? answered / LOWER_BACK_QUESTIONS.length : 0,
    answered, total: LOWER_BACK_QUESTIONS.length,
    core_complete: coreAnswered === CORE_LOWER_BACK_KEYS.length,
  };
}
