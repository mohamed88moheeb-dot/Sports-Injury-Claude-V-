/**
 * lib/rag/generate/assessmentModel.mjs
 * ---------------------------------------------------------------------------
 * The hamstring intake for the RAG prototype, and the logic that turns a set
 * of answers into (a) a human-readable clinical summary and (b) a set of
 * retrieval sub-queries — one per section of the plan. Retrieving per-section
 * (diagnosis, grading, loading, RTS) gives each part of the generated plan its
 * own tightly-scoped evidence set, rather than one blurry retrieval for the
 * whole thing.
 * ---------------------------------------------------------------------------
 */

export const HAMSTRING_QUESTIONS = [
  { key: 'mechanism', prompt: 'How did it happen?', core: true, options: [
    { value: 'high_speed_running', label: 'Sprinting / high-speed running' },
    { value: 'stretch', label: 'Overstretch (high kick, split, slide)' },
    { value: 'gradual', label: 'Came on gradually' },
    { value: 'other', label: 'Other / not sure' },
  ] },
  { key: 'location', prompt: 'Where is the pain?', options: [
    { value: 'high_near_sit_bone', label: 'High up, near the sit-bone' },
    { value: 'mid_belly', label: 'Middle of the back of the thigh' },
    { value: 'lower', label: 'Lower, toward the back of the knee' },
  ] },
  { key: 'pain_severity', prompt: 'How bad is the pain at its worst?', core: true, options: [
    { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' },
  ] },
  { key: 'pop_felt', prompt: 'Did you feel a pop or sudden give-way?', options: [
    { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' },
  ] },
  { key: 'walking', prompt: 'Can you walk on it?', options: [
    { value: 'normal', label: 'Yes, normally' }, { value: 'limp', label: 'Yes, but with a limp' }, { value: 'unable', label: 'No / needs crutches' },
  ] },
  { key: 'weeks_since', prompt: 'How long ago was the injury?', options: [
    { value: 'acute', label: 'Within the last week' },
    { value: 'subacute', label: '1–3 weeks ago' },
    { value: 'late', label: 'More than 3 weeks ago' },
  ] },
  { key: 'bruising', prompt: 'Any visible bruising?', options: [
    { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
  ] },
  { key: 'prior_hamstring', prompt: 'Have you injured this hamstring before?', options: [
    { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
  ] },
  { key: 'sport', prompt: 'What sport are you returning to?', options: [
    { value: 'sprint_field', label: 'Sprinting / field sport (football, rugby)' },
    { value: 'multidirectional', label: 'Multidirectional (basketball, tennis)' },
    { value: 'endurance', label: 'Endurance running' },
    { value: 'general', label: 'General fitness' },
  ] },
];

const LABELS = {
  mechanism: { high_speed_running: 'high-speed running mechanism', stretch: 'stretch-type mechanism', gradual: 'gradual onset', other: 'unclear mechanism' },
  location: { high_near_sit_bone: 'proximal pain near the ischial tuberosity', mid_belly: 'mid-belly pain', lower: 'distal pain toward the knee' },
  pain_severity: { mild: 'mild pain', moderate: 'moderate pain', severe: 'severe pain' },
  pop_felt: { yes: 'a pop was felt', no: 'no pop', unsure: 'uncertain about a pop' },
  walking: { normal: 'walks normally', limp: 'walks with a limp', unable: 'unable to weight-bear' },
  weeks_since: { acute: 'acute (<1 week)', subacute: 'sub-acute (1–3 weeks)', late: 'late (>3 weeks)' },
  bruising: { yes: 'visible bruising present', no: 'no bruising' },
  prior_hamstring: { yes: 'previous ipsilateral hamstring injury', no: 'no prior hamstring injury' },
  sport: { sprint_field: 'sprint/field sport', multidirectional: 'multidirectional sport', endurance: 'endurance running', general: 'general fitness' },
};

/** Red-flag style signals that warrant caution — kept deterministic, never AI-invented. */
export function hamstringCautions(a = {}) {
  const c = [];
  if (a.location === 'high_near_sit_bone' && a.pop_felt === 'yes' && a.pain_severity === 'severe')
    c.push('Proximal pain at the sit-bone with a pop and severe pain can indicate a proximal tendon avulsion — warrants in-person assessment and possible imaging.');
  if (a.walking === 'unable')
    c.push('Inability to weight-bear warrants in-person assessment before loading rehabilitation.');
  if (a.prior_hamstring === 'yes')
    c.push('Previous ipsilateral injury raises reinjury risk — progression should be conservative and criteria-based.');
  return c;
}

export function clinicalSummary(a = {}) {
  const parts = [];
  for (const q of HAMSTRING_QUESTIONS) {
    const v = a[q.key];
    if (v && LABELS[q.key] && LABELS[q.key][v]) parts.push(LABELS[q.key][v]);
  }
  return parts.join(', ');
}

/** Build per-section retrieval sub-queries tailored to the answers. */
export function buildSubQueries(a = {}) {
  const mech = LABELS.mechanism[a.mechanism] || 'hamstring injury';
  const loc = LABELS.location[a.location] || '';
  const sport = LABELS.sport[a.sport] || 'sport';
  return {
    diagnosis: `hamstring strain diagnosis mechanism ${mech} ${loc} biceps femoris semimembranosus which muscle`,
    grading: `hamstring injury grading classification severity MRI tendon involvement prognosis recovery time ${a.pain_severity || ''}`,
    loading: `hamstring rehabilitation progressive loading eccentric lengthening exercise pain ${a.weeks_since || ''} phase`,
    rts: `hamstring return to sport ${sport} criteria strength eccentric sprinting reinjury prevention isokinetic`,
  };
}
