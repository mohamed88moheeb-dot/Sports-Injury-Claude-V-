/**
 * lib/clinical/ankleEngine/appAdapter/ankleAssessmentModel.mjs
 * ---------------------------------------------------------------------------
 * Tailored ankle assessment questions, grouped into carousel steps. Answers
 * are stored under assessment.ankleAnswers keyed by the engine input field,
 * so they flow straight into mapAssessmentToAnkleInput. Mirrors the knee/
 * quad/RF models.
 * ---------------------------------------------------------------------------
 */

const YNU = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const ANKLE_STEPS = [
  { label: 'How it happened', group: 'Injury context' },
  { label: 'Weight-bearing & swelling', group: 'Pain & function' },
  { label: 'Instability & history', group: 'History & context' },
  { label: 'Safety check', group: 'Safety' },
];

export const ANKLE_QUESTIONS = [
  // ── Injury context ──────────────────────────────────────────────────────
  { id: 'a_mech', key: 'mechanism', group: 'Injury context', core: true,
    prompt: 'How did it happen?',
    options: [
      { value: 'inversion', label: 'Rolled the ankle inward (foot turned under)' },
      { value: 'external_rotation', label: 'Foot planted, body/leg rotated over it' },
      { value: 'direct_impact', label: 'Direct blow / stepped on / collision' },
      { value: 'gradual_overuse', label: 'Came on gradually (no single injury)' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'a_sev', key: 'pain_severity_label', group: 'Injury context', core: true,
    prompt: 'How bad is the pain at its worst?',
    options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] },
  { id: 'a_continue', key: 'ability_to_continue', group: 'Injury context', core: true,
    prompt: 'Could you keep playing/training after it happened?',
    options: [{ value: 'yes', label: 'Yes, kept going' }, { value: 'limited', label: 'Kept going, but limited' }, { value: 'no', label: 'No, had to stop' }] },

  // ── Pain & function ─────────────────────────────────────────────────────
  { id: 'a_wb', key: 'weight_bearing_ability', group: 'Pain & function', core: true,
    prompt: 'Can you put weight on it now?',
    options: [{ value: 'full', label: 'Yes, fully' }, { value: 'painful', label: 'Yes, but painful' }, { value: 'unable', label: 'No, cannot bear weight' }] },
  { id: 'a_swell', key: 'bruising_or_swelling', group: 'Pain & function',
    prompt: 'How much swelling or bruising?',
    options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'Some' }, { value: 'significant', label: 'A lot / significant' }] },
  { id: 'a_mortise', key: 'pain_above_mortise', group: 'Pain & function',
    prompt: 'Is the pain more ABOVE the ankle joint (up the shin/leg) than on the sides?',
    hint: 'Pain above the joint line with each step points toward a "high ankle" (syndesmosis) sprain rather than a typical lateral sprain.',
    options: YNU },
  { id: 'a_squeeze', key: 'squeeze_test', group: 'Pain & function',
    prompt: 'If you squeeze your calf/shin together partway up, does it reproduce pain down at the ankle?',
    hint: 'This is the "squeeze test" for a high ankle sprain — skip if unsure how to test it.',
    options: [{ value: 'positive', label: 'Yes, reproduces ankle pain' }, { value: 'negative', label: 'No' }, { value: 'unsure', label: 'Not sure / did not test' }] },

  // ── History & context ───────────────────────────────────────────────────
  { id: 'a_instab', key: 'instability_signs', group: 'History & context',
    prompt: 'Does the ankle feel unstable or like it might give way?',
    options: [{ value: 'none', label: 'No' }, { value: 'mild_wobble', label: 'A bit wobbly' }, { value: 'marked_giving_way', label: 'Clearly gives way / feels very unstable' }] },
  { id: 'a_priorcount', key: 'prior_sprain_count', group: 'History & context',
    prompt: 'How many times have you sprained this ankle before (including this time)?',
    options: [{ value: '0', label: 'This is the first time' }, { value: '1', label: 'Once before' }, { value: '2', label: '2 times before' }, { value: '3', label: '3-4 times before' }, { value: '5', label: '5+ times before' }] },
  { id: 'a_givewaynoinjury', key: 'giving_way_without_new_injury', group: 'History & context',
    prompt: 'Do you get giving-way / instability episodes even without a fresh injury (e.g. on uneven ground)?',
    options: YNU },
  { id: 'a_monthssince', key: 'months_since_last_sprain', group: 'History & context',
    prompt: 'How many months since your last ankle sprain (if a repeat sprain)?',
    options: [{ value: '0', label: 'This is the current/only one' }, { value: '1', label: 'Less than a month ago' }, { value: '3', label: '1-3 months ago' }, { value: '6', label: '3-6 months ago' }, { value: '12', label: '6-12+ months ago' }] },

  // ── Safety ──────────────────────────────────────────────────────────────
  { id: 'a_bonemall', key: 'bone_tenderness_malleolus', group: 'Safety',
    prompt: 'Is there bone tenderness right on the bony bump on either side of the ankle (not just the soft tissue around it)?',
    hint: 'Bone tenderness here (Ottawa Ankle Rules) means an X-ray is recommended before rehab.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'a_bonemid', key: 'bone_tenderness_midfoot', group: 'Safety',
    prompt: 'Is there bone tenderness in the midfoot (base of the outer foot bone, or the inner arch bone)?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'a_4steps', key: 'unable_to_bear_weight_4_steps', group: 'Safety',
    prompt: 'Are you unable to take 4 steps unassisted, both right after the injury and now?',
    hint: 'This combined with bone tenderness is part of the Ottawa Ankle Rules for possible fracture.',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'a_diastasis', key: 'diastasis_suspected', group: 'Safety',
    prompt: 'Has a clinician mentioned any widening/instability between the leg bones at the ankle (diastasis)?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No / not assessed' }] },
];

export function ankleQuestionsForGroup(group) {
  return ANKLE_QUESTIONS.filter((q) => q.group === group);
}

const CORE_ANKLE_KEYS = ['mechanism', 'pain_severity_label', 'ability_to_continue', 'weight_bearing_ability'];

/** Fraction (0..1) of tailored ankle questions answered, for the progress meter. */
export function computeAnkleFormFill(assessment = {}) {
  const a = assessment.ankleAnswers || {};
  const answered = ANKLE_QUESTIONS.filter((q) => a[q.key] !== undefined && a[q.key] !== null && a[q.key] !== '').length;
  const coreAnswered = CORE_ANKLE_KEYS.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').length;
  return {
    fraction: ANKLE_QUESTIONS.length ? answered / ANKLE_QUESTIONS.length : 0,
    answered, total: ANKLE_QUESTIONS.length,
    core_complete: coreAnswered === CORE_ANKLE_KEYS.length,
  };
}
