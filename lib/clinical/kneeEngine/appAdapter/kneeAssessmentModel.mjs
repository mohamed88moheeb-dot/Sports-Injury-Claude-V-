/**
 * lib/clinical/kneeEngine/appAdapter/kneeAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored knee assessment questions, grouped into carousel steps. Answers are
 * stored under assessment.kneeAnswers keyed by the engine input field, so they
 * flow straight into mapAssessmentToKneeInput. Mirrors the quad/RF models.
 *
 * Every question maps to a field in the field-effect contract (knee registry),
 * so each answer drives the diagnosis router, severity/placement, or the RTS
 * battery — no dead inputs.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const KNEE_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Swelling & stability', group: 'Swelling & stability' },
  { label: 'Pain & function', group: 'Pain & function' },
  { label: 'History & context', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const KNEE_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'k_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'pivot_noncontact', label: 'Twisted / pivoted on a planted foot (no contact)' },
      { value: 'valgus_blow', label: 'Hit on the outside — knee buckled inward' },
      { value: 'varus_blow', label: 'Hit on the inside — knee bent outward' },
      { value: 'dashboard_hyperflexion', label: 'Fell on a bent knee / shin hit something' },
      { value: 'twisting', label: 'Twisting or deep squat / kneeling' },
      { value: 'jumping_landing', label: 'Jumping or landing' },
      { value: 'direct_blow', label: 'Direct blow / contact / tackle' },
      { value: 'gradual_overuse', label: 'Came on gradually (no single injury)' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'k_onset', key: 'onset', group: 'Injury context',
    prompt: 'Did it start suddenly or build up over time?',
    options: [{ value: 'sudden', label: 'Suddenly (one moment)' }, { value: 'gradual', label: 'Gradually over time' }] },
  { id: 'k_pop', key: 'pop_at_injury', group: 'Injury context',
    prompt: 'Did you feel or hear a “pop” at the moment of injury?',
    hint: 'A pop with immediate swelling raises suspicion of an ACL injury.',
    options: YNU },

  // ── Swelling & stability ────────────────────────────────────────────────
  { id: 'k_swelltime', key: 'swelling_timing', group: 'Swelling & stability',
    prompt: 'When did the knee swell?',
    hint: 'Swelling within a couple of hours suggests bleeding inside the joint.',
    options: [
      { value: 'immediate', label: 'Within ~2 hours (immediate)' },
      { value: 'next_day', label: 'The next day / gradually' },
      { value: 'none', label: 'No real swelling' },
    ] },
  { id: 'k_swellamt', key: 'swelling_amount', group: 'Swelling & stability',
    prompt: 'How much swelling?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'A lot / tight and full' }] },
  { id: 'k_give', key: 'giving_way', group: 'Swelling & stability',
    prompt: 'Does the knee give way or feel unstable?',
    options: YNU },
  { id: 'k_lock', key: 'locking_or_block', group: 'Swelling & stability',
    prompt: 'Does the knee lock or catch, or can you not fully straighten it?',
    hint: 'A true block to full straightening can mean a displaced meniscal tear.',
    options: YNU },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'k_sev', key: 'pain_severity_label', group: 'Pain & function', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'k_wb', key: 'weight_bearing', group: 'Pain & function',
    prompt: 'Can you put weight on it?',
    options: [{ value: 'full', label: 'Yes, fully' }, { value: 'painful', label: 'Yes, but painful' }, { value: 'unable', label: 'No, cannot bear weight' }] },
  { id: 'k_squat', key: 'pain_with_squat', group: 'Pain & function',
    prompt: 'Does squatting or kneeling hurt at the front of the knee?',
    options: YNU },
  { id: 'k_stairs', key: 'pain_with_stairs', group: 'Pain & function',
    prompt: 'Does going up or down stairs hurt?',
    options: YNU },
  { id: 'k_jointline', key: 'joint_line_tenderness', group: 'Pain & function',
    prompt: 'Is it tender right on the joint line (the crease where the bones meet)?',
    hint: 'Joint-line tenderness with a twisting mechanism points to a meniscus.',
    options: YNU },
  { id: 'k_amstiff', key: 'morning_stiffness_minutes', group: 'Pain & function',
    prompt: 'How long is the knee stiff first thing in the morning?',
    hint: 'Brief stiffness that eases within ~30 minutes is typical of osteoarthritis.',
    options: [
      { value: 'none', label: 'Not stiff / eases straight away' },
      { value: 'brief', label: 'Stiff but loosens within ~30 minutes' },
      { value: 'prolonged', label: 'Stiff for well over 30 minutes' },
    ] },

  // ── History & context ───────────────────────────────────────────────────
  { id: 'k_redislo', key: 'recurrent_dislocation', group: 'History & context',
    prompt: 'Has your kneecap dislocated (popped out) — this time or before?',
    options: YNU },
  { id: 'k_age', key: 'age_group', group: 'History & context',
    prompt: 'Which age group are you in?',
    options: [{ value: 'adolescent', label: 'Still growing / teenager' }, { value: 'adult', label: 'Adult' }, { value: 'older_adult', label: 'Older adult (50+)' }] },
  { id: 'k_activity', key: 'activity_level', group: 'History & context',
    prompt: 'What is your main activity level?',
    options: [{ value: 'pivoting_sport', label: 'Pivoting / cutting sport' }, { value: 'recreational', label: 'Recreational exercise' }, { value: 'sedentary', label: 'Mostly low-impact / daily activity' }] },
  { id: 'k_surg', key: 'surgical_repair_done', group: 'History & context',
    prompt: 'Have you had knee surgery for this injury?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'k_hot', key: 'febrile_hot_joint', group: 'Safety',
    prompt: 'Is the knee hot, red, and are you feverish/unwell?',
    hint: 'A hot, swollen, feverish joint needs urgent medical assessment.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'k_highenergy', key: 'high_energy_trauma', group: 'Safety',
    prompt: 'Was this a high-energy injury (car crash, big fall, sport collision)?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

export function kneeQuestionsForGroup(group) {
  return KNEE_QUESTIONS.filter((q) => q.group === group);
}

const CORE_KNEE_KEYS = ['mechanism', 'pain_severity_label'];

/** Fraction (0..1) of tailored knee questions answered, for the progress meter. */
export function computeKneeFormFill(assessment = {}) {
  const a = assessment.kneeAnswers || {};
  const answered = KNEE_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_KNEE_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: KNEE_QUESTIONS.length ? answered / KNEE_QUESTIONS.length : 0,
    answered, total: KNEE_QUESTIONS.length,
    core_complete: coreAnswered === CORE_KNEE_KEYS.length,
  };
}
