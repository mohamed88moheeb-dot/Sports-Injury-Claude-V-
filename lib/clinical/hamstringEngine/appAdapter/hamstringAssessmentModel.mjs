/**
 * lib/clinical/hamstringEngine/appAdapter/hamstringAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored hamstring assessment questions grouped into carousel steps. Answers
 * are stored under assessment.hamstringAnswers keyed by the engine input field,
 * so they flow straight into mapAssessmentToHamstringInput. Mirrors the knee
 * model — reuses the existing assessment UI, no new bespoke screen.
 * ---------------------------------------------------------------------------
 */

export const HAMSTRING_STEPS = [
  { label: 'How it happened', group: 'Mechanism' },
  { label: 'Where & how bad', group: 'Pain & location' },
  { label: 'Signs', group: 'Signs' },
  { label: 'History & sport', group: 'History' },
];

export const HAMSTRING_QUESTIONS = [
  // Mechanism
  { id: 'h_mech', key: 'mechanism', group: 'Mechanism', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'high_speed_running', label: 'Sprinting / high-speed running' },
      { value: 'stretch', label: 'Overstretch (high kick, split, slide)' },
      { value: 'gradual', label: 'Came on gradually (no single moment)' },
      { value: 'other', label: 'Other / not sure' },
    ] },
  { id: 'h_weeks', key: 'weeks_since', group: 'Mechanism',
    prompt: 'How long ago was it?',
    options: [
      { value: 'acute', label: 'Within the last week' },
      { value: 'subacute', label: '1–3 weeks ago' },
      { value: 'late', label: 'More than 3 weeks ago' },
    ] },

  // Pain & location
  { id: 'h_loc', key: 'location', group: 'Pain & location',
    prompt: 'Where is the pain?',
    hint: 'Pain high near the sit-bone with a stretch injury points to the proximal tendon.',
    options: [
      { value: 'high_near_sit_bone', label: 'High up, near the sit-bone' },
      { value: 'mid_belly', label: 'Middle of the back of the thigh' },
      { value: 'lower', label: 'Lower, toward the back of the knee' },
    ] },
  { id: 'h_sev', key: 'pain_severity', group: 'Pain & location', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'h_walk', key: 'walking', group: 'Pain & location',
    prompt: 'Can you walk on it?',
    options: [{ value: 'normal', label: 'Yes, normally' }, { value: 'limp', label: 'Yes, but with a limp' }, { value: 'unable', label: 'No / needs support' }] },

  // Signs
  { id: 'h_pop', key: 'pop_felt', group: 'Signs',
    prompt: 'Did you feel or hear a pop / sudden give-way?',
    hint: 'A pop high at the sit-bone with severe pain can mean a tendon avulsion — worth an in-person check.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }] },
  { id: 'h_bruise', key: 'bruising', group: 'Signs',
    prompt: 'Any visible bruising?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },

  // History
  { id: 'h_prior', key: 'prior_hamstring', group: 'History',
    prompt: 'Have you injured this hamstring before?',
    hint: 'Prior injury is the strongest predictor of reinjury — it makes us progress more cautiously.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'h_sport', key: 'sport', group: 'History',
    prompt: 'What are you returning to?',
    options: [
      { value: 'sprint_field', label: 'Sprinting / field sport' },
      { value: 'multidirectional', label: 'Multidirectional (basketball, tennis)' },
      { value: 'endurance', label: 'Endurance running' },
      { value: 'general', label: 'General fitness' },
    ] },
];

export function hamstringQuestionsForGroup(group) {
  return HAMSTRING_QUESTIONS.filter((q) => q.group === group);
}

const CORE_KEYS = ['mechanism', 'pain_severity'];

export function computeHamstringFormFill(assessment = {}) {
  const a = assessment.hamstringAnswers || {};
  const answered = HAMSTRING_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  const total = HAMSTRING_QUESTIONS.length;
  return {
    fraction: total ? answered / total : 0,
    percent: total ? Math.round((answered / total) * 100) : 0,
    allFilled: answered === total,
    answered, total,
    core_complete: coreAnswered === CORE_KEYS.length,
  };
}
