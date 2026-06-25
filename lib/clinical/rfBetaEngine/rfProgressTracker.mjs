/**
 * lib/clinical/rfBetaEngine/rfProgressTracker.mjs
 * ---------------------------------------------------------------------------
 * Inter-session progress tracking for the RF Beta rehab engine.
 *
 * Takes an array of historical daily check-ins (one per completed session,
 * oldest first) and returns a structured clinical analysis:
 *   - trend         : session-over-session response trajectory
 *   - recommendation: next action (continue / reduce_load / pause_and_review / seek_clinician / advance_ready)
 *   - phase_readiness: advance / hold / regress signals
 *   - lsi_gate      : LSI threshold check before phase advancement
 *   - flags         : named clinical signals
 *
 * This module is stateless. The app is responsible for persisting check-in
 * history and passing it in on each call. Each call is a pure function.
 *
 * LSI phase-entry thresholds (minimum % of uninjured side):
 *   Transition : ≥70%   — eccentric quad strength gate
 *   Simulation : ≥85%   — speed/power readiness gate
 *   Resilience : ≥90%   — full RTS gate
 *   Sources: Buckthorpe 2019 BJSM (PMC6579500); Hickey 2022 JSAMS (PMID:35794049).
 *   Note: These thresholds are consistent with published RTS criteria for
 *   quadriceps/RF injuries; direct RCT validation for each phase boundary
 *   is still limited (clinical consensus-level evidence).
 * ---------------------------------------------------------------------------
 */

const PHASE_ORDER = ['foundation', 'reload', 'accumulation', 'transition', 'simulation', 'resilience'];

// Number of consecutive green sessions required before an advance signal fires.
const GREEN_STREAK_TO_ADVANCE = 5;
// Yellow sessions within the rolling window that trigger a hold recommendation.
const YELLOW_WINDOW_THRESHOLD = 3;
// Rolling window size (sessions, not calendar days).
const WINDOW_SIZE = 7;

// LSI thresholds (%) before entering each demanding phase.
const LSI_THRESHOLDS = {
  transition: 70,
  simulation: 85,
  resilience: 90,
};

// ── Check-in scoring ──────────────────────────────────────────────────────────
// 0 = green (continue as planned)
// 1 = yellow-light (watch, slight ease)
// 2 = yellow (meaningful reduction needed)
// 3 = red   (stop, seek review)

const SYMPTOM_SCORE = {
  much_better: 0, better: 0, same: 0,
  more_noticeable: 2, worse: 2,
  concerning: 3,
};
const NEXT_DAY_SCORE = {
  much_better: 0, better: 0, same: 0,
  sore_but_settled: 1,
  worse: 2, much_worse: 3,
};
const DIFFICULTY_SCORE = {
  too_easy: 0, manageable: 0, appropriate: 0,
  hard: 1, too_hard: 2,
};
const CONFIDENCE_SCORE = {
  high: 0, confident: 0, moderate: 0, neutral: 0,
  low: 1, unsure: 1,
};

function scoreCheckIn(ci) {
  const s = SYMPTOM_SCORE[ci.symptom_response]  ?? 0;
  const n = NEXT_DAY_SCORE[ci.next_day_response] ?? 0;
  const d = DIFFICULTY_SCORE[ci.difficulty]       ?? 0;
  const c = CONFIDENCE_SCORE[ci.confidence]       ?? 0;
  // overnight_pain is a direct yellow-high escalation
  const o = ci.overnight_pain === true ? 2 : 0;
  return Math.max(s, n, d, c, o);
}

// ── Core export ───────────────────────────────────────────────────────────────

/**
 * Analyze a history of check-ins and return a structured progress report.
 *
 * @param {object[]} checkIns  Array of check-in objects, oldest first.
 *   Each: { symptom_response, next_day_response, difficulty, confidence,
 *            overnight_pain?, swelling_change?, completed_or_skipped }
 * @param {object}  options
 *   { current_phase_id: string, lsi_squat_percent: number|null }
 * @returns {object}
 */
export function analyzeProgress(checkIns = [], options = {}) {
  const currentPhase = options.current_phase_id  || null;
  const lsiPercent   = options.lsi_squat_percent ?? null;

  if (!checkIns || checkIns.length === 0) {
    return emptyReport(currentPhase, lsiPercent);
  }

  // Score every check-in
  const scored = checkIns.map((ci) => ({ ...ci, _score: scoreCheckIn(ci) }));

  // Rolling window — last WINDOW_SIZE sessions
  const window  = scored.slice(-WINDOW_SIZE);
  const reds    = window.filter((ci) => ci._score >= 3).length;
  const yellows = window.filter((ci) => ci._score === 2).length;
  const greens  = window.filter((ci) => ci._score <= 1).length;

  // Consecutive streaks (from most recent session backward)
  let consecutiveGreen  = 0;
  let consecutiveYellow = 0;
  for (let i = scored.length - 1; i >= 0; i--) {
    if (scored[i]._score <= 1) consecutiveGreen++;  else break;
  }
  for (let i = scored.length - 1; i >= 0; i--) {
    if (scored[i]._score >= 2) consecutiveYellow++; else break;
  }

  const trend = computeTrend(scored);

  // ── Named clinical flags ──────────────────────────────────────────────────
  const flags = [];

  if (reds >= 1)                                    flags.push('RED_IN_WINDOW');
  if (yellows >= YELLOW_WINDOW_THRESHOLD)           flags.push('THREE_YELLOWS_IN_WINDOW');
  if (consecutiveYellow >= 3)                       flags.push('THREE_CONSECUTIVE_YELLOWS');
  if (consecutiveGreen  >= GREEN_STREAK_TO_ADVANCE) flags.push('GREEN_STREAK_MET');
  if (trend === 'deteriorating')                    flags.push('DETERIORATING_TREND');

  // Persistent next-day soreness: ≥2 of last 3 sessions had worse/sore_but_settled next day
  const last3 = scored.slice(-3);
  const persistentSoreness = last3.filter((ci) =>
    ['worse', 'much_worse', 'sore_but_settled'].includes(ci.next_day_response)
  ).length >= 2;
  if (persistentSoreness) flags.push('PERSISTENT_NEXT_DAY_SORENESS');

  // Swelling: worsening in any of the last 3 sessions
  const swellingWorse = last3.some((ci) => ci.swelling_change === 'more');
  if (swellingWorse) flags.push('SWELLING_INCREASING');

  const recommendation = deriveRecommendation(flags);
  const phaseReadiness = computePhaseReadiness(consecutiveGreen, trend, flags);
  const lsiGate        = buildLsiGate(currentPhase, lsiPercent);

  return {
    trend,
    recommendation,
    session_count:      checkIns.length,
    window_size:        WINDOW_SIZE,
    sessions_in_window: window.length,
    green_in_window:    greens,
    yellow_in_window:   yellows,
    red_in_window:      reds,
    consecutive_green:  consecutiveGreen,
    consecutive_yellow: consecutiveYellow,
    flags,
    phase_readiness:    phaseReadiness,
    lsi_gate:           lsiGate,
  };
}

function emptyReport(currentPhase, lsiPercent) {
  return {
    trend:              'insufficient_data',
    recommendation:     'continue',
    session_count:      0,
    flags:              [],
    phase_readiness:    { advance_signal: false, hold_signal: false, regress_signal: false, advance_message: null, hold_message: null, regress_message: null },
    lsi_gate:           buildLsiGate(currentPhase, lsiPercent),
    consecutive_green:  0,
    consecutive_yellow: 0,
  };
}

// ── Trend ──────────────────────────────────────────────────────────────────────

function computeTrend(scored) {
  if (scored.length < 4) return 'insufficient_data';
  const half  = Math.floor(scored.length / 2);
  const early = scored.slice(0, half);
  const late  = scored.slice(-half);
  const avg   = (arr) => arr.reduce((s, ci) => s + ci._score, 0) / arr.length;
  const diff  = avg(late) - avg(early);
  if (diff < -0.3) return 'improving';
  if (diff >  0.3) return 'deteriorating';
  return 'stable';
}

// ── Recommendation ─────────────────────────────────────────────────────────────

function deriveRecommendation(flags) {
  if (flags.includes('RED_IN_WINDOW') || flags.includes('SWELLING_INCREASING'))          return 'seek_clinician';
  if (flags.includes('THREE_CONSECUTIVE_YELLOWS'))                                        return 'pause_and_review';
  if (flags.includes('THREE_YELLOWS_IN_WINDOW') || flags.includes('DETERIORATING_TREND') ||
      flags.includes('PERSISTENT_NEXT_DAY_SORENESS'))                                    return 'reduce_load';
  if (flags.includes('GREEN_STREAK_MET'))                                                 return 'advance_ready';
  return 'continue';
}

// ── Phase readiness ────────────────────────────────────────────────────────────

function computePhaseReadiness(consecutiveGreen, trend, flags) {
  const blockers = ['RED_IN_WINDOW', 'THREE_CONSECUTIVE_YELLOWS', 'DETERIORATING_TREND', 'SWELLING_INCREASING'];
  const blocked  = blockers.some((f) => flags.includes(f));

  const advance = !blocked && consecutiveGreen >= GREEN_STREAK_TO_ADVANCE && trend !== 'deteriorating';
  const hold    = flags.includes('THREE_YELLOWS_IN_WINDOW') || flags.includes('PERSISTENT_NEXT_DAY_SORENESS');
  const regress = flags.includes('THREE_CONSECUTIVE_YELLOWS') || flags.includes('RED_IN_WINDOW');

  return {
    advance_signal:  advance,
    hold_signal:     hold,
    regress_signal:  regress,
    advance_message: advance
      ? `${consecutiveGreen} consecutive sessions well-tolerated — review readiness to progress to the next tier or phase.`
      : null,
    hold_message: hold
      ? 'Repeated load-response signals detected — hold current tier and do not increase volume or intensity this week.'
      : null,
    regress_message: regress
      ? 'Multiple difficult sessions in a row — consider stepping back one tier and rebuilding tolerance before progressing.'
      : null,
  };
}

// ── LSI gate ───────────────────────────────────────────────────────────────────

/**
 * Build a Limb Symmetry Index (LSI) phase-entry gate for the next phase.
 *
 * The patient self-reports: "Compared to your uninjured leg, what percentage can
 * you do on the injured leg for a single-leg squat?" (0–100).
 *
 * When lsi_squat_percent is null (not yet assessed), the gate returns
 * 'assessment_needed' with a prompt for the patient — it does NOT block
 * autonomously. Clinician review is required for a formal LSI clearance.
 *
 * Sources: Buckthorpe 2019 BJSM (PMC6579500); Hickey 2022 JSAMS (PMID:35794049).
 */
function buildLsiGate(currentPhase, lsiPercent) {
  if (!currentPhase) return { required: false, status: 'not_applicable', message: null };

  const nextIdx   = PHASE_ORDER.indexOf(currentPhase) + 1;
  const nextPhase = PHASE_ORDER[nextIdx] || null;
  const threshold = nextPhase ? (LSI_THRESHOLDS[nextPhase] ?? null) : null;

  if (!threshold) {
    return { required: false, next_phase: nextPhase, status: 'not_applicable', message: null };
  }

  if (lsiPercent === null || lsiPercent === undefined) {
    return {
      required:   true,
      threshold,
      current:    null,
      next_phase: nextPhase,
      status:     'assessment_needed',
      message:    `Before advancing to ${nextPhase}: compare single-leg squat performance on the injured vs. uninjured side. Target ≥${threshold}%. Report your estimate to unlock the progression check.`,
    };
  }

  const passed = lsiPercent >= threshold;
  return {
    required:   true,
    threshold,
    current:    lsiPercent,
    next_phase: nextPhase,
    status:     passed ? 'cleared' : 'not_cleared',
    message:    passed
      ? `LSI ${lsiPercent}% meets the ≥${threshold}% threshold — gate cleared for ${nextPhase}.`
      : `LSI ${lsiPercent}% is below the ≥${threshold}% threshold for ${nextPhase}. Continue current phase and close the strength gap before progressing.`,
  };
}

/**
 * Standalone LSI gate builder — for use by the plan generator without check-in history.
 * Returns the LSI gate for the phase that comes after currentPhase.
 *
 * @param {string}     currentPhaseId
 * @param {number|null} lsiPercent  self-reported LSI (0–100) or null = not assessed
 */
export function buildLsiTransitionGate(currentPhaseId, lsiPercent) {
  return buildLsiGate(currentPhaseId, lsiPercent ?? null);
}

/**
 * Convenience check: should the app offer a phase-progression prompt?
 *
 * @param {object[]} checkIns        Past session check-ins, oldest first
 * @param {string}   currentPhaseId  Patient's current phase
 * @param {number|null} lsiPercent   Self-reported LSI (0–100) or null
 * @returns {{ offer: boolean, next_phase: string|null, reason: string, analysis: object }}
 */
export function shouldOfferPhaseGate(checkIns, currentPhaseId, lsiPercent) {
  const analysis = analyzeProgress(checkIns, {
    current_phase_id:  currentPhaseId,
    lsi_squat_percent: lsiPercent,
  });

  const lsiOk = ['cleared', 'not_applicable'].includes(analysis.lsi_gate.status);
  const offer  = analysis.phase_readiness.advance_signal && lsiOk;

  return {
    offer,
    next_phase: analysis.lsi_gate.next_phase || null,
    reason:     offer
      ? 'Consecutive green sessions and LSI threshold met — ready for clinician-confirmed phase progression.'
      : 'Phase progression criteria not yet fully met.',
    analysis,
  };
}
