/**
 * lib/clinical/hipFlexorEngine/appAdapter/hipFlexorAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored hip flexor assessment questions, grouped into carousel steps.
 * Answers are stored under assessment.hipFlexorAnswers keyed by the engine
 * input field, so they flow straight into mapAssessmentToHipFlexorInput.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const HIP_FLEXOR_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Pain & function', group: 'Pain & function' },
  { label: 'History', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const HIP_FLEXOR_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'h_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'sudden_hip_flexion', label: 'Sudden forceful movement (kicking, sprint start, sit-up)' },
      { value: 'gradual_overuse', label: 'Came on gradually with training' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'h_sev', key: 'pain_severity_label', group: 'Injury context', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'h_continue', key: 'ability_to_continue', group: 'Injury context', core: true,
    prompt: 'Could you keep playing/training after it happened (or with this pain)?',
    options: [{ value: 'yes', label: 'Yes, kept going' }, { value: 'limited', label: 'Kept going, but limited' }, { value: 'no', label: 'No, had to stop' }] },
  { id: 'h_duration', key: 'symptom_duration_weeks', group: 'Injury context',
    prompt: 'How many weeks have you had this pain?',
    hint: 'Long-standing hip-flexor/groin pain (many weeks) is managed differently from a fresh strain.',
    options: [{ value: '0.5', label: 'Just happened (days)' }, { value: '2', label: 'About 1-2 weeks' }, { value: '4', label: 'About 3-4 weeks' }, { value: '8', label: '5-8 weeks' }, { value: '20', label: 'More than 2 months' }] },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'h_resisted', key: 'resisted_hip_flexion_pain', group: 'Pain & function',
    prompt: 'If you lift your knee up toward your chest against resistance, does it reproduce your pain?',
    hint: 'This is the "resisted hip flexion" test for iliopsoas-related pain.',
    options: [{ value: 'none', label: 'No pain' }, { value: 'mild', label: 'Mild pain' }, { value: 'moderate', label: 'Moderate pain' }, { value: 'severe', label: 'Severe pain' }] },
  { id: 'h_snap', key: 'snapping_sensation', group: 'Pain & function',
    prompt: 'Do you feel or hear a snapping/clicking at the front of your hip with certain movements?',
    hint: 'A painless snap is common and not concerning; a painful one points toward "snapping hip syndrome."',
    options: YNU },
  { id: 'h_swell', key: 'bruising_or_swelling', group: 'Pain & function',
    prompt: 'How much swelling or bruising?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'A lot / significant' }] },

  // ── History ─────────────────────────────────────────────────────────────
  { id: 'h_onset', key: 'onset', group: 'History & context',
    prompt: 'Did it start suddenly or build up gradually?',
    options: [{ value: 'sudden', label: 'Suddenly (one moment)' }, { value: 'gradual', label: 'Gradually over time' }] },
  { id: 'h_runner', key: 'gradual_onset_runner', group: 'History & context',
    prompt: 'Are you a runner/endurance athlete whose training volume increased recently?',
    options: YNU },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'h_hop', key: 'hop_test', group: 'Safety',
    prompt: 'If you hop on the sore leg, does it reproduce sharp groin/hip pain?',
    hint: 'A positive hop test is a key screening sign for a femoral neck stress fracture.',
    options: [{ value: 'positive', label: 'Yes, reproduces sharp pain' }, { value: 'negative', label: 'No' }, { value: 'unsure', label: 'Not sure / not tested' }] },
  { id: 'h_night', key: 'night_pain', group: 'Safety',
    prompt: 'Does the pain wake you at night or bother you at rest, not just with activity?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'h_fadir', key: 'fadir_test', group: 'Safety',
    prompt: 'Does bringing your knee up and across your body (toward the opposite shoulder) reproduce deep hip pain?',
    hint: 'This screens for a possible hip-joint cause (like impingement) rather than a muscle strain.',
    options: [{ value: 'positive', label: 'Yes, reproduces deep pain' }, { value: 'negative', label: 'No' }, { value: 'unsure', label: 'Not sure / did not test' }] },
  { id: 'h_click', key: 'clicking_or_catching', group: 'Safety',
    prompt: 'Do you feel clicking, catching, or locking in the hip joint itself?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

export function hipFlexorQuestionsForGroup(group) {
  return HIP_FLEXOR_QUESTIONS.filter((q) => q.group === group);
}

const CORE_HIP_FLEXOR_KEYS = ['mechanism', 'pain_severity_label', 'ability_to_continue'];

/** Fraction (0..1) of tailored hip flexor questions answered, for the progress meter. */
export function computeHipFlexorFormFill(assessment = {}) {
  const a = assessment.hipFlexorAnswers || {};
  const answered = HIP_FLEXOR_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_HIP_FLEXOR_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: HIP_FLEXOR_QUESTIONS.length ? answered / HIP_FLEXOR_QUESTIONS.length : 0,
    answered, total: HIP_FLEXOR_QUESTIONS.length,
    core_complete: coreAnswered === CORE_HIP_FLEXOR_KEYS.length,
  };
}
