/**
 * lib/clinical/rfBetaEngine/rfDailyCheckInAdjuster.mjs
 * ---------------------------------------------------------------------------
 * Today-only daily check-in adjustment. It NEVER mutates the plan, never edits
 * future days, never jumps phase, never grants clearance, never regenerates the
 * plan. It returns an adjusted COPY of today's session plus a trace.
 *
 * Clinical improvements over v1:
 *   1. Four response levels instead of three.
 *      CONCERNING         → withhold today, seek review.
 *      MORE_NOTICEABLE    → significant reduction: drop high-demand blocks first.
 *      SLIGHTLY_ELEVATED  → light reduction: ease intensity only, keep all blocks.
 *      SAME_OR_BETTER     → continue as planned.
 *      LOW_CONFIDENCE     → simplify and prompt clarifying question.
 *
 *   2. 24-hour response is a PRIMARY gate.
 *      overnight_pain (boolean) → immediate CONCERNING.
 *      next_day_response 'much_worse'       → CONCERNING.
 *      next_day_response 'worse'            → MORE_NOTICEABLE.
 *      next_day_response 'sore_but_settled' → SLIGHTLY_ELEVATED.
 *      24h response is clinically more informative than in-session discomfort.
 *
 *   3. Block removal follows clinical priority.
 *      Pain-related yellow: remove running_sport_prep (highest RF stress) first,
 *        then tissue_specific_loading — not just the first match in the array.
 *      Confidence-related yellow: remove control_balance (lowest priority) first.
 *
 *   4. Grade 2/3 amplification.
 *      When checkin.grade >= 2, a MORE_NOTICEABLE response drops TWO blocks and
 *      applies a significant intensity reduction.
 *
 *   5. Swelling escalation override.
 *      swelling_change === 'more' → always withhold, regardless of other signals.
 *      Worsening swelling = potential haematoma expansion or myositis ossificans risk.
 *
 *   6. Returns session_flag ('green' | 'yellow_light' | 'yellow' | 'red') for
 *      accumulation by rfProgressTracker.
 * ---------------------------------------------------------------------------
 */

import { CHECK_IN_RESPONSE, BETA_META } from './types.mjs';

// Block removal priority for PAIN-related reduction (highest RF mechanical load first).
const PAIN_REMOVAL_PRIORITY = [
  'running_sport_prep',       // sprint/kicking — highest RF stress
  'tissue_specific_loading',  // eccentric / isometric RF load
  'strength_support',         // functional strength
  'control_balance',          // stability / core
];

// Block removal priority for FATIGUE/CONFIDENCE-related reduction (least essential first).
const FATIGUE_REMOVAL_PRIORITY = [
  'control_balance',
  'running_sport_prep',
  'strength_support',
];

/**
 * @param {object} todaysSession  A session object from a plan day.
 * @param {object} checkin        {
 *   completed_or_skipped,
 *   symptom_response,           // 'much_better'|'better'|'same'|'more_noticeable'|'worse'|'concerning'
 *   difficulty,                 // 'too_easy'|'manageable'|'appropriate'|'hard'|'too_hard'
 *   confidence,                 // 'high'|'moderate'|'low'|'unsure'
 *   notes,
 *   next_day_response,          // 'better'|'same'|'sore_but_settled'|'worse'|'much_worse'
 *   overnight_pain,             // boolean (new) — did pain wake you last night?
 *   swelling_change,            // 'less'|'same'|'more' (new)
 *   grade,                      // 1|2|3|null (new, optional) — from patient profile
 *   pattern,                    // 'A'|'B'|'C'|null (new, optional) — from patient profile
 * }
 * @returns {object}  { action, message, adjusted_session, session_flag, trace, ... }
 */
export function adjustToday(todaysSession, checkin = {}) {
  const trace = {
    selected_session_only: true,
    future_days_changed:   false,
    phase_jump:            false,
    clearance_created:     false,
    plan_regenerated:      false,
    inputs_used:           { ...checkin },
    rules_applied:         [],
  };

  // Deep copy so the plan is never mutated.
  const session     = JSON.parse(JSON.stringify(todaysSession));
  const response    = classifyResponse(checkin);
  const isHighGrade = (checkin.grade ?? 1) >= 2;

  let action, message;

  switch (response) {
    case CHECK_IN_RESPONSE.CONCERNING:
      action          = 'withhold_today_and_review';
      session.cards   = [];
      session.blocks  = [{ block: 'logging_check_in', card_ids: [], note: 'Session withheld today.' }];
      session.withheld_today = true;
      message         = 'We have paused today\'s session. Your symptoms suggest you need rest and possibly a clinician review. Monitor over the next 24 hours — if anything worsens, please see a clinician.';
      trace.rules_applied.push('checkin_red_withhold (RF-PRESC-CHECKIN-RED)');
      break;

    case CHECK_IN_RESPONSE.MORE_NOTICEABLE: {
      action = 'reduce_today';
      const blocksToRemove = isHighGrade ? 2 : 1;
      session.cards = session.cards.map((c) => reduceCard(c, isHighGrade ? 'significant' : 'moderate'));
      session.cards = dropBlocks(session.cards, PAIN_REMOVAL_PRIORITY, blocksToRemove);
      message = isHighGrade
        ? 'Significant symptom response. The two most demanding elements have been removed and intensity is reduced. With a higher-grade injury, erring on the side of caution protects the tissue.'
        : 'Today has been made easier — the most demanding element is removed and intensity is reduced. Stay within comfortable limits.';
      trace.rules_applied.push('checkin_yellow_reduce (RF-PRESC-CHECKIN-YELLOW)');
      if (isHighGrade) trace.rules_applied.push('grade_2_3_amplified_reduction');
      break;
    }

    case 'SLIGHTLY_ELEVATED':
      action        = 'ease_today';
      // Reduce intensity only — no blocks are removed.
      session.cards = session.cards.map((c) => reduceCard(c, 'light'));
      message       = 'Intensity is dialled back slightly today. Complete all exercises but stay at the comfortable end of the range.';
      trace.rules_applied.push('checkin_slightly_elevated_ease (RF-PRESC-CHECKIN-YELLOW-LIGHT)');
      break;

    case CHECK_IN_RESPONSE.LOW_CONFIDENCE:
      action          = 'simplify_and_clarify';
      session.cards   = session.cards.map((c) => reduceCard(c, 'light'));
      session.cards   = dropBlocks(session.cards, FATIGUE_REMOVAL_PRIORITY, 1);
      session.clarify_prompt = 'A few of your answers were uncertain. Can you confirm how the front of your thigh feels today compared to yesterday?';
      message         = 'Today is simplified. One lower-priority block has been removed and intensity is eased.';
      trace.rules_applied.push('checkin_low_confidence_simplify (RF-PRESC-CHECKIN-YELLOW)');
      break;

    case CHECK_IN_RESPONSE.SAME_OR_BETTER:
    default:
      action  = 'keep_today';
      message = 'Today\'s session looks good — carry on as planned.';
      trace.rules_applied.push('checkin_green_keep (RF-PRESC-CHECKIN-GREEN)');
      break;
  }

  // Swelling escalation override: worsening swelling → always withhold.
  // RF haematoma expansion and myositis ossificans risk are driven by
  // repeated mechanical loading into a swollen compartment.
  if (checkin.swelling_change === 'more' && action !== 'withhold_today_and_review') {
    action          = 'withhold_today_and_review';
    session.cards   = [];
    session.blocks  = [{ block: 'logging_check_in', card_ids: [], note: 'Session withheld — worsening swelling detected.' }];
    session.withheld_today = true;
    message         = 'Worsening swelling detected. Today\'s session is paused. Rest and elevate the limb. If swelling is increasing significantly, seek clinician review.';
    trace.rules_applied.push('swelling_escalation_withhold');
  }

  return {
    action,
    message,
    adjusted_session:      session,
    selected_session_only: true,
    future_days_changed:   false,
    session_flag:          deriveSessionFlag(response, checkin),
    ...BETA_META,
    trace,
  };
}

// ── Response classification ────────────────────────────────────────────────────

function classifyResponse(checkin) {
  // Red gates (withhold)
  if (checkin.overnight_pain    === true)          return CHECK_IN_RESPONSE.CONCERNING;
  if (checkin.next_day_response === 'much_worse')  return CHECK_IN_RESPONSE.CONCERNING;
  if (checkin.symptom_response  === 'concerning')  return CHECK_IN_RESPONSE.CONCERNING;
  if (checkin.swelling_change   === 'more')        return CHECK_IN_RESPONSE.CONCERNING;

  // Yellow-high (significant reduction)
  if (checkin.symptom_response  === 'more_noticeable') return CHECK_IN_RESPONSE.MORE_NOTICEABLE;
  if (checkin.next_day_response === 'worse')           return CHECK_IN_RESPONSE.MORE_NOTICEABLE;
  if (checkin.difficulty        === 'too_hard')        return CHECK_IN_RESPONSE.MORE_NOTICEABLE;

  // Yellow-light (intensity ease only — no block removal)
  if (checkin.next_day_response === 'sore_but_settled') return 'SLIGHTLY_ELEVATED';
  if (checkin.difficulty        === 'hard')             return 'SLIGHTLY_ELEVATED';

  // Confidence gate (simplify and clarify)
  if (checkin.confidence === 'low' || checkin.confidence === 'unsure') return CHECK_IN_RESPONSE.LOW_CONFIDENCE;

  return CHECK_IN_RESPONSE.SAME_OR_BETTER;
}

// ── Card reduction ─────────────────────────────────────────────────────────────

function reduceCard(card, severity = 'moderate') {
  const notes = {
    significant: 'Intensity significantly reduced today — comfortable range only.',
    moderate:    'Intensity eased today via daily check-in.',
    light:       'Intensity dialled back slightly today.',
  };
  return {
    ...card,
    intensity_adjustment: `${severity}_reduction_today (beta)`,
    note: notes[severity] || notes.moderate,
  };
}

// ── Block removal ──────────────────────────────────────────────────────────────

/**
 * Remove up to `count` blocks following the clinical priority list.
 * Removes the highest-priority matching block first (not first in array order).
 */
function dropBlocks(cards, priorityList, count) {
  let remaining = [...cards];
  let dropped   = 0;
  for (const block of priorityList) {
    if (dropped >= count) break;
    const idx = remaining.findIndex((c) => c.block === block);
    if (idx !== -1) {
      remaining.splice(idx, 1);
      dropped++;
    }
  }
  return remaining;
}

// ── Session flag ───────────────────────────────────────────────────────────────

function deriveSessionFlag(response, checkin) {
  if (response === CHECK_IN_RESPONSE.CONCERNING || checkin.swelling_change === 'more') return 'red';
  if (response === CHECK_IN_RESPONSE.MORE_NOTICEABLE) return 'yellow';
  if (response === 'SLIGHTLY_ELEVATED')               return 'yellow_light';
  if (response === CHECK_IN_RESPONSE.LOW_CONFIDENCE)  return 'yellow_light';
  return 'green';
}
