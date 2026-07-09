/**
 * lib/clinical/core/progression.mjs
 * ---------------------------------------------------------------------------
 * Criteria-based progression + daily auto-regulation. Replaces the day-count
 * tier logic (days_since ÷ phase_duration) with capacity/symptom gates, and
 * makes progression BIDIRECTIONAL — a symptom flare regresses today's load.
 *
 * Three decisions:
 *   1. autoRegulate(dailyResponse)        → nudge today's session up/down/hold.
 *   2. canAdvanceTier(signals)            → early→mid→late within a phase.
 *   3. canExitPhase(phase, signals)       → phase→next, on objective criteria.
 * ---------------------------------------------------------------------------
 */
import { PHASES } from './sessionArchitecture.mjs';

/** Daily check-in → session load action. Regress on flare (never just "push"). */
export const AUTO_REGULATION = Object.freeze({
  much_worse:  { level: 'regress',  step: -1, note: 'Symptoms much worse — regress a level; drop to the previous tier’s dose today.' },
  worse:       { level: 'hold',     step:  0, note: 'Symptoms worse — hold today at the same load; no progression.' },
  same:        { level: 'maintain', step:  0, note: 'Stable — repeat planned load; eligible to progress if criteria are met.' },
  better:      { level: 'progress', step: +1, note: 'Improving — progress within phase if tier criteria are met.' },
  much_better: { level: 'progress', step: +1, note: 'Much improved — progress; re-check tier criteria.' },
});

/**
 * Adjust today's session against the daily check-in. Returns a load delta and
 * whether progression is even eligible today (flares block progression).
 * @param {string} dailyResponse
 */
export function autoRegulate(dailyResponse) {
  const r = AUTO_REGULATION[dailyResponse] || AUTO_REGULATION.same;
  return {
    action: r.level,
    loadStep: r.step,
    progressionEligible: r.step >= 0 && r.level !== 'hold',
    regress: r.step < 0,
    note: r.note,
  };
}

/**
 * Tier advance (early=0 → mid=1 → late=2) is EARNED, not timed. Requires:
 *  - session pain within threshold (VAS ≤ 3),
 *  - no flare in the recent window,
 *  - tolerating current tier's key load,
 *  - a minimum exposure (≥2 sessions at tier) so we don't skip on one good day.
 * @param {{ currentTier:number, sessionPainVas:number, recentFlare:boolean,
 *           toleratingCurrentLoad:boolean, sessionsAtTier:number }} s
 */
export function canAdvanceTier(s) {
  const reasons = [];
  if (s.currentTier >= 2) return { advance: false, reasons: ['Already at the final tier of this phase.'] };
  if ((s.sessionPainVas ?? 0) > 3) reasons.push('Session pain above VAS 3.');
  if (s.recentFlare) reasons.push('A symptom flare occurred recently.');
  if (!s.toleratingCurrentLoad) reasons.push('Not yet tolerating the current tier’s load.');
  if ((s.sessionsAtTier ?? 0) < 2) reasons.push('Needs ≥2 sessions at the current tier first.');
  return { advance: reasons.length === 0, nextTier: reasons.length === 0 ? s.currentTier + 1 : s.currentTier, reasons };
}

/**
 * Objective phase-exit criteria (capacity gates), mirroring clinical practice.
 * Autonomous (unsupervised) progression is capped at the end of accumulation —
 * transition+ need clinician sign-off because they add high-speed/plyometric load.
 * @param {string} phase
 * @param {{ painFreeFullRom:boolean, strengthSymmetryPct:number, isoOk:boolean,
 *           eccOk:boolean, jogOk:boolean, runOk:boolean, hopSymmetryPct:number,
 *           psychReady:boolean, clinicianCleared:boolean }} s
 */
export function canExitPhase(phase, s = {}) {
  const reasons = [];
  const need = (cond, why) => { if (!cond) reasons.push(why); };
  const AUTONOMOUS_CAP = 'accumulation';

  switch (phase) {
    case 'foundation':
      need(s.painFreeFullRom, 'Pain-free full range of motion not yet restored.');
      need(s.isoOk, 'Isometric loading not yet tolerated.');
      break;
    case 'reload':
      need((s.strengthSymmetryPct ?? 0) >= 70, 'Strength symmetry < 70%.');
      need(s.eccOk, 'Eccentric control not yet tolerated.');
      break;
    case 'accumulation':
      need((s.strengthSymmetryPct ?? 0) >= 85, 'Strength symmetry < 85%.');
      need(s.jogOk, 'Jogging not yet symptom-free.');
      break;
    case 'transition':
      need((s.strengthSymmetryPct ?? 0) >= 90, 'Strength symmetry < 90%.');
      need(s.runOk, 'Running not yet symptom-free.');
      need((s.hopSymmetryPct ?? 0) >= 90, 'Hop-test symmetry < 90% (LSI).');
      break;
    case 'simulation':
      need((s.hopSymmetryPct ?? 0) >= 90, 'Hop-test symmetry < 90% (LSI).');
      need(s.psychReady, 'Psychological readiness (confidence) not yet met.');
      break;
    case 'resilience':
      return { canExit: false, reasons: ['Final phase — maintenance/return-to-performance.'], isFinal: true };
    default:
      return { canExit: false, reasons: [`Unknown phase: ${phase}`] };
  }

  // `canExit` reflects CLINICAL readiness only (reasons above are clinical).
  const canExit = reasons.length === 0;

  // Governance is a SEPARATE gate: block autonomous advance past the cap unless
  // a clinician has cleared it. This never masks the clinical readiness signal.
  const idx = PHASES.indexOf(phase);
  const nextPhase = PHASES[idx + 1] || null;
  const clearanceRequired = phase === AUTONOMOUS_CAP && !s.clinicianCleared;

  return {
    canExit,
    nextPhase: canExit ? nextPhase : null,
    clearanceRequired,
    autonomousAdvanceAllowed: canExit && !clearanceRequired,
    reasons,
  };
}
