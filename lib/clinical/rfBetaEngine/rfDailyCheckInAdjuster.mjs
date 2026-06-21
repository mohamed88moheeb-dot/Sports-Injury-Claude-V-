/**
 * lib/clinical/rfBetaEngine/rfDailyCheckInAdjuster.mjs
 * ---------------------------------------------------------------------------
 * Today-only daily check-in adjustment. It NEVER mutates the plan, never edits
 * future days, never jumps phase, never grants clearance, and never regenerates
 * the plan. It returns an adjusted COPY of today's session plus a trace.
 * ---------------------------------------------------------------------------
 */

import { CHECK_IN_RESPONSE, BETA_META } from './types.mjs';

/**
 * @param {object} todaysSession a session object from a plan day
 * @param {object} checkin { completed_or_skipped, symptom_response, difficulty, confidence, notes, next_day_response }
 */
export function adjustToday(todaysSession, checkin = {}) {
  const trace = {
    selected_session_only: true,
    future_days_changed: false,
    phase_jump: false,
    clearance_created: false,
    plan_regenerated: false,
    inputs_used: { ...checkin },
    rules_applied: []
  };

  // deep copy so the plan is never mutated
  const session = JSON.parse(JSON.stringify(todaysSession));
  const response = classifyResponse(checkin);

  let action, message;
  switch (response) {
    case CHECK_IN_RESPONSE.CONCERNING:
      action = 'withhold_today_and_review';
      session.cards = [];
      session.blocks = [{ block: 'logging_check_in', card_ids: [], note: 'Session withheld today.' }];
      session.withheld_today = true;
      message = 'We have paused today’s session. Please check your symptoms and seek review if anything feels concerning.';
      trace.rules_applied.push('checkin_red_withhold (RF-PRESC-CHECKIN-RED)');
      break;
    case CHECK_IN_RESPONSE.MORE_NOTICEABLE:
      action = 'reduce_today';
      session.cards = session.cards.map((c) => reduceCard(c));
      // remove the single most demanding block today (running_sport_prep or strength_support)
      session.cards = dropMostDemanding(session.cards);
      message = 'We have made today a little easier.';
      trace.rules_applied.push('checkin_yellow_reduce_or_swap (RF-PRESC-CHECKIN-YELLOW)');
      break;
    case CHECK_IN_RESPONSE.LOW_CONFIDENCE:
      action = 'simplify_and_clarify';
      session.cards = session.cards.map((c) => reduceCard(c));
      session.clarify_prompt = 'A few answers were unsure — can you confirm how the front of your thigh feels today?';
      message = 'We have simplified today and asked a quick clarifying question.';
      trace.rules_applied.push('checkin_low_confidence_simplify (RF-PRESC-CHECKIN-YELLOW)');
      break;
    case CHECK_IN_RESPONSE.SAME_OR_BETTER:
    default:
      action = 'keep_today';
      message = 'Today’s session looks good — carry on.';
      trace.rules_applied.push('checkin_green_keep (RF-PRESC-CHECKIN-GREEN)');
      break;
  }

  return {
    action,
    message,
    adjusted_session: session,
    selected_session_only: true,
    future_days_changed: false,
    ...BETA_META,
    trace
  };
}

function classifyResponse(checkin) {
  if (checkin.symptom_response === 'concerning' || checkin.next_day_response === 'much_worse') return CHECK_IN_RESPONSE.CONCERNING;
  if (checkin.symptom_response === 'more_noticeable' || checkin.next_day_response === 'worse' || checkin.difficulty === 'too_hard') return CHECK_IN_RESPONSE.MORE_NOTICEABLE;
  if (checkin.confidence === 'low' || checkin.confidence === 'unsure') return CHECK_IN_RESPONSE.LOW_CONFIDENCE;
  return CHECK_IN_RESPONSE.SAME_OR_BETTER;
}

function reduceCard(card) {
  return { ...card, intensity_adjustment: 'reduced for today (beta)', note: 'Eased today via daily check-in.' };
}

function dropMostDemanding(cards) {
  const order = ['running_sport_prep', 'strength_support', 'tissue_specific_loading'];
  for (const block of order) {
    const idx = cards.findIndex((c) => c.block === block);
    if (idx !== -1) { const copy = cards.slice(); copy.splice(idx, 1); return copy; }
  }
  return cards;
}
