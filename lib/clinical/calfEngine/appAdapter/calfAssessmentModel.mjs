/**
 * lib/clinical/calfEngine/appAdapter/calfAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored calf/shin assessment questions, grouped into carousel steps.
 * Answers are stored under assessment.calfAnswers keyed by the engine input
 * field, so they flow straight into mapAssessmentToCalfInput.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const CALF_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Weight-bearing & pain', group: 'Pain & function' },
  { label: 'Tendon & shin history', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const CALF_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'c_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'sudden_push_off', label: 'Sudden sharp pain ("shot in the calf") pushing off/lunging' },
      { value: 'sprinting', label: 'Sprinting / sudden acceleration' },
      { value: 'gradual_overuse_running', label: 'Came on gradually with running/training' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'c_loc', key: 'pain_location', group: 'Injury context', core: true,
    prompt: 'Where exactly is the pain?',
    options: [
      { value: 'posterior_calf', label: 'Back of the calf (muscle belly)' },
      { value: 'achilles_mid_portion', label: 'Achilles tendon, mid-portion (a couple inches above the heel)' },
      { value: 'achilles_insertion', label: 'Achilles tendon, right at the heel bone' },
      { value: 'medial_shin', label: 'Along the inner shin bone' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'c_sev', key: 'pain_severity_label', group: 'Injury context', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'c_continue', key: 'ability_to_continue', group: 'Injury context', core: true,
    prompt: 'Could you keep playing/training after it happened (or with this pain)?',
    options: [{ value: 'yes', label: 'Yes, kept going' }, { value: 'limited', label: 'Kept going, but limited' }, { value: 'no', label: 'No, had to stop' }] },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'c_wb', key: 'weight_bearing_ability', group: 'Pain & function',
    prompt: 'Can you put weight on it / rise onto your toes now?',
    options: [{ value: 'full', label: 'Yes, fully' }, { value: 'painful', label: 'Yes, but painful' }, { value: 'unable', label: 'No, cannot bear weight / cannot rise onto toes' }] },
  { id: 'c_swell', key: 'bruising_or_swelling', group: 'Pain & function',
    prompt: 'How much swelling or bruising?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'A lot / significant' }] },
  { id: 'c_stiff', key: 'morning_stiffness', group: 'Pain & function',
    prompt: 'Is the tendon stiff first thing in the morning, easing as you move?',
    hint: 'Morning stiffness that eases with movement is typical of Achilles tendinopathy.',
    options: YNU },
  { id: 'c_running', key: 'pain_with_running', group: 'Pain & function',
    prompt: 'Does it hurt specifically during or after running?',
    options: YNU },

  // ── History & context ───────────────────────────────────────────────────
  { id: 'c_shinlen', key: 'shin_tenderness_length', group: 'History & context',
    prompt: 'If your pain is along the shin — is the tender area spread out (several inches) or a single small focal spot?',
    hint: 'A single, focal (small) tender spot is more concerning for a stress fracture than diffuse tenderness.',
    options: [{ value: 'diffuse', label: 'Spread out over several inches' }, { value: 'focal', label: 'A single small focal spot' }, { value: 'unsure', label: 'Not applicable / not sure' }] },
  { id: 'c_hop', key: 'hop_test', group: 'History & context',
    prompt: 'If you hop on the sore leg, does it reproduce the shin pain sharply?',
    hint: 'A positive hop test combined with focal tenderness raises concern for a stress fracture.',
    options: [{ value: 'positive', label: 'Yes, reproduces sharp pain' }, { value: 'negative', label: 'No' }, { value: 'unsure', label: 'Not applicable / not tested' }] },
  { id: 'c_onset', key: 'onset', group: 'History & context',
    prompt: 'Did it start suddenly or build up gradually?',
    options: [{ value: 'sudden', label: 'Suddenly (one moment)' }, { value: 'gradual', label: 'Gradually over time' }] },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'c_thompson', key: 'thompson_test', group: 'Safety',
    prompt: 'If someone squeezes your calf while you lie face-down, does your foot point downward normally?',
    hint: 'This is the "Thompson test" for Achilles rupture — skip if unsure how to test it.',
    options: [{ value: 'normal', label: 'Yes, foot points down normally' }, { value: 'absent_plantarflexion', label: 'No, the foot does not move' }, { value: 'unsure', label: 'Not sure / did not test' }] },
  { id: 'c_gap', key: 'palpable_gap', group: 'Safety',
    prompt: 'Can you feel a gap or dent in the Achilles tendon?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'c_snap', key: 'sudden_snap_sensation', group: 'Safety',
    prompt: 'Did you feel/hear a sudden "snap" or feel like you were kicked in the back of the leg?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'c_heelraise', key: 'unable_heel_raise', group: 'Safety',
    prompt: 'Are you unable to rise onto your toes on that leg at all?',
    options: [{ value: 'yes', label: 'Yes, cannot rise onto toes' }, { value: 'no', label: 'No, I can' }, { value: 'unsure', label: 'Not sure / not tested' }] },
];

export function calfQuestionsForGroup(group) {
  return CALF_QUESTIONS.filter((q) => q.group === group);
}

const CORE_CALF_KEYS = ['mechanism', 'pain_location', 'pain_severity_label', 'ability_to_continue'];

/** Fraction (0..1) of tailored calf/shin questions answered, for the progress meter. */
export function computeCalfFormFill(assessment = {}) {
  const a = assessment.calfAnswers || {};
  const answered = CALF_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_CALF_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: CALF_QUESTIONS.length ? answered / CALF_QUESTIONS.length : 0,
    answered, total: CALF_QUESTIONS.length,
    core_complete: coreAnswered === CORE_CALF_KEYS.length,
  };
}
