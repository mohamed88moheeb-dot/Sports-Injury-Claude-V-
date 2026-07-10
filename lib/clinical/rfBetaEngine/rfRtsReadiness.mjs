/**
 * lib/clinical/rfBetaEngine/rfRtsReadiness.mjs
 * ---------------------------------------------------------------------------
 * Return-to-sport (RTS) readiness battery for RF / quadriceps injury.
 *
 * Real-life RTS is a CRITERIA CHECKLIST, not a date — an athlete returns when
 * capacity, sport-specific loading, control, symptom settling and psychological
 * readiness line up. This resolver evaluates those criteria from the athlete's
 * answers and reports which are met / pending. It NEVER grants clearance: the
 * engine has no clinical authority — final clearance is a clinician decision.
 *
 * Criteria (RF-specific, evidence-aligned):
 *  1. Strength/pain-free capacity — resisted knee extension pain-free + no weakness
 *  2. High-speed running tolerated — sprint tolerance pain-free
 *  3. Sport-specific loading — kicking tolerated (only for kicking athletes)
 *  4. Single-leg control — steady, pain-free (functional-symmetry proxy)
 *  5. Symptoms settled — no rest pain, not reactive next day, no significant swelling
 *  6. Psychological readiness — confident to return (ACL-RSI-style principle)
 * ---------------------------------------------------------------------------
 */

const KICKING_SPORTS = new Set(['football', 'soccer', 'rugby', 'american_football', 'gaelic', 'afl', 'martial_arts', 'kickboxing']);

const MET = 'met';
const PENDING = 'pending';
const NOT_APPLICABLE = 'n/a';

export function resolveRtsReadiness(input = {}) {
  const st = input.rf_self_tests || {};
  const g = (k) => input[k] ?? st[k];

  const kext = g('knee_extension_response');
  const weak = input.weakness_or_giving_way;
  const sprint = g('sprint_tolerance');
  const kick = g('kick_tolerance');
  const slc = g('single_leg_control');
  const rest = g('pain_at_rest');
  const nday = g('next_day_response');
  const swelling = input.bruising_or_swelling;
  const confV = Number(input.movement_confidence_value ?? st.movement_confidence_value);
  const isKicker = KICKING_SPORTS.has(input.sport_context) || input.mechanism === 'kicking';

  const criteria = [];
  const add = (id, name, state, detail) => criteria.push({ id, name, state, met: state === MET, detail });

  // 1. Strength / pain-free capacity
  add('strength_capacity', 'Pain-free strength restored',
    (kext === 'no_pain' && (weak === 'none' || weak == null)) ? MET : PENDING,
    kext === 'no_pain' ? 'Resisted knee extension is pain-free.' : 'Resisted knee extension still provokes symptoms or weakness.');

  // 2. High-speed running
  add('sprint', 'High-speed running tolerated',
    sprint === 'ok' ? MET : PENDING,
    sprint === 'ok' ? 'Sprinting is symptom-free.'
      : sprint === 'not_tried' || sprint == null ? 'Not yet tested at high speed.'
      : 'Sprinting still provokes symptoms.');

  // 3. Sport-specific loading (kicking) — only for kicking athletes
  add('sport_specific', 'Sport-specific loading (kicking) tolerated',
    !isKicker ? NOT_APPLICABLE : kick === 'ok' ? MET : PENDING,
    !isKicker ? 'Not a kicking sport — not required.'
      : kick === 'ok' ? 'Kicking is symptom-free.'
      : kick === 'not_tried' || kick == null ? 'Not yet tested with kicking.'
      : 'Kicking still provokes symptoms.');

  // 4. Single-leg control (functional symmetry proxy)
  add('single_leg_control', 'Single-leg control steady & pain-free',
    slc === 'yes_pain_free' ? MET : PENDING,
    slc === 'yes_pain_free' ? 'Balances comfortably on the injured leg.' : 'Single-leg control not yet comfortable/steady.');

  // 5. Symptoms settled
  const settled = (rest == null || rest === 'none') && ['same_or_better', 'too_early', null, undefined].includes(nday) && swelling !== 'significant';
  add('symptoms_settled', 'Symptoms settled (no rest pain / not reactive)',
    settled ? MET : PENDING,
    settled ? 'No rest pain and not reactive to loading.' : 'Rest pain, reactive symptoms, or swelling still present.');

  // 6. Psychological readiness
  add('psychological', 'Confident to return',
    Number.isFinite(confV) ? (confV >= 70 ? MET : PENDING) : PENDING,
    Number.isFinite(confV) ? (confV >= 70 ? 'Reports feeling confident to return.' : 'Confidence not yet high enough.') : 'Confidence not recorded.');

  const applicable = criteria.filter((c) => c.state !== NOT_APPLICABLE);
  const met = applicable.filter((c) => c.state === MET).length;
  const total = applicable.length;
  const allMet = met === total && total > 0;

  // Extra return-to-sport considerations from history / level of play.
  const considerations = [];
  if (input.previous_injury) considerations.push('Recurrent injury — progress conservatively and confirm full capacity before return; recurrence raises re-injury risk.');
  if (['competitive', 'elite', 'professional', 'semi_pro', 'academy'].includes(g('sport_level')))
    considerations.push('Higher-level sport — objective strength and hop-symmetry testing is especially advised before clearance.');

  let clearance_note = 'This is a readiness guide, not clearance. Return-to-sport must be confirmed by a qualified clinician — objective strength and hop-symmetry testing (≥90% limb symmetry) are recommended before full return.';
  if (considerations.length) clearance_note += ' ' + considerations.join(' ');

  return {
    criteria,
    met,
    total,
    all_criteria_met: allMet,
    status: allMet ? 'criteria_suggest_ready' : 'not_yet_met',
    headline: allMet
      ? 'All self-reported return-to-sport criteria are met — discuss final clearance with a clinician.'
      : `${met} of ${total} return-to-sport criteria met. Keep progressing the pending items.`,
    considerations,
    clearance_note,
    clinical_authority: false,
  };
}
