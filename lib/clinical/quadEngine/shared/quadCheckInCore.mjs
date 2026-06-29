/**
 * lib/clinical/quadEngine/shared/quadCheckInCore.mjs
 * ---------------------------------------------------------------------------
 * Shared daily check-in adjuster for the quad engine. Adjusts TODAY's session
 * only — never mutates the plan, jumps stages, or grants clearance. Mirrors the
 * rfBetaEngine check-in contract. Per-entity overrides (e.g. contusion's
 * swelling-and-ROM gate) are passed in via `entityPolicy`.
 * ---------------------------------------------------------------------------
 */

import { CHECK_IN_RESPONSE, BETA_META } from '../types.mjs';

/**
 * @param {object} todaysSession
 * @param {object} checkin  {
 *   symptom_response, next_day_response, difficulty, confidence,
 *   overnight_pain, swelling_change, knee_flexion_rom_percent (contusion),
 *   pain_during_0_10 (tendinopathy)
 * }
 * @param {object} entityPolicy  { withhold_if?: (checkin)=>boolean, withhold_message?: string }
 */
export function adjustQuadToday(todaysSession, checkin = {}, entityPolicy = {}) {
  const session = JSON.parse(JSON.stringify(todaysSession));
  const trace = { selected_session_only: true, future_days_changed: false, rules_applied: [] };

  let action, message;
  const response = classify(checkin);

  switch (response) {
    case CHECK_IN_RESPONSE.CONCERNING:
      action = 'withhold_today_and_review';
      session.cards = [];
      session.withheld_today = true;
      message = 'Today\'s session is paused — your symptoms suggest rest and possibly a clinician review. Monitor the next 24 hours.';
      trace.rules_applied.push('checkin_red_withhold');
      break;
    case CHECK_IN_RESPONSE.MORE_NOTICEABLE:
      action = 'reduce_today';
      session.cards = (session.cards || []).slice(0, Math.max(1, Math.ceil((session.cards || []).length / 2)))
        .map((c) => ease(c, 'moderate'));
      message = 'Today is made easier — the most demanding elements are removed and intensity reduced.';
      trace.rules_applied.push('checkin_yellow_reduce');
      break;
    case CHECK_IN_RESPONSE.LOW_CONFIDENCE:
      action = 'simplify_and_clarify';
      session.cards = (session.cards || []).map((c) => ease(c, 'light'));
      session.clarify_prompt = 'A few answers were uncertain — how does the injured area feel today vs yesterday?';
      message = 'Today is simplified and intensity eased.';
      trace.rules_applied.push('checkin_low_confidence_simplify');
      break;
    default:
      action = 'keep_today';
      message = 'Today\'s session looks good — carry on as planned.';
      trace.rules_applied.push('checkin_green_keep');
  }

  // Entity-specific withhold override (e.g. contusion swelling/ROM regression).
  if (typeof entityPolicy.withhold_if === 'function' && entityPolicy.withhold_if(checkin) && action !== 'withhold_today_and_review') {
    action = 'withhold_today_and_review';
    session.cards = [];
    session.withheld_today = true;
    message = entityPolicy.withhold_message || 'Today\'s session is paused based on your check-in. Rest and reassess.';
    trace.rules_applied.push('entity_specific_withhold');
  }

  return { action, message, adjusted_session: session, session_flag: flag(response, checkin), ...BETA_META, trace };
}

function classify(c) {
  if (c.overnight_pain === true) return CHECK_IN_RESPONSE.CONCERNING;
  if (c.next_day_response === 'much_worse') return CHECK_IN_RESPONSE.CONCERNING;
  if (c.symptom_response === 'concerning') return CHECK_IN_RESPONSE.CONCERNING;
  if (c.swelling_change === 'more') return CHECK_IN_RESPONSE.CONCERNING;
  if (c.symptom_response === 'more_noticeable') return CHECK_IN_RESPONSE.MORE_NOTICEABLE;
  if (c.next_day_response === 'worse') return CHECK_IN_RESPONSE.MORE_NOTICEABLE;
  if (c.difficulty === 'too_hard') return CHECK_IN_RESPONSE.MORE_NOTICEABLE;
  if (c.confidence === 'low' || c.confidence === 'unsure') return CHECK_IN_RESPONSE.LOW_CONFIDENCE;
  return CHECK_IN_RESPONSE.SAME_OR_BETTER;
}

function ease(card, severity) {
  return { ...card, intensity_adjustment: `${severity}_reduction_today (beta)`, note: 'Intensity eased today via check-in.' };
}

function flag(response, c) {
  if (response === CHECK_IN_RESPONSE.CONCERNING || c.swelling_change === 'more') return 'red';
  if (response === CHECK_IN_RESPONSE.MORE_NOTICEABLE) return 'yellow';
  if (response === CHECK_IN_RESPONSE.LOW_CONFIDENCE) return 'yellow_light';
  return 'green';
}
