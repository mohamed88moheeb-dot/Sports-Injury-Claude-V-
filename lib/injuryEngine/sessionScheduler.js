/**
 * lib/injuryEngine/sessionScheduler.js
 * ---------------------------------------------------------------------------
 * Assembles block-based rehab sessions (6–12 exercises) from a phase's
 * exercise pool, using SESSION_BLUEPRINTS from shared.js.
 *
 * Design principles (grounded in elite sports med / research):
 *   - A session is a TRAINING SESSION, not just a list of injury exercises.
 *   - It covers the injured tissue, the surrounding kinetic chain, whole-body
 *     strength, neuromuscular control, and appropriate conditioning.
 *   - Sessions ROTATE so no two consecutive sessions are identical.
 *   - Rest days between full sessions shrink as green check-ins accumulate,
 *     but the injured tissue's targeted loading always has ~48h between.
 *   - Phase 1 = 6–7 exercises, low RPE; Phase 5 = 10–12 exercises, high RPE.
 *
 * Public functions:
 *   buildSession(resolvedExercises, phaseId, sessionIndex)
 *   buildWeekSchedule(resolvedExercises, phaseId, greenStreak, weekStartDay)
 *   describeSession(session)
 * ---------------------------------------------------------------------------
 */

import {
  SESSION_BLUEPRINTS,
  PHASE_PERIODIZATION,
  restDaysForStreak
} from '../../data/injuryKnowledge/shared';

/* =========================================================================
 * buildSession
 * Returns a single session: an ordered array of exercise objects picked from
 * the phase pool according to the SESSION_BLUEPRINT for that phase.
 *
 * @param {Array}  resolvedExercises  exercises already resolved (with equipment
 *                                    variants applied) from rehabPlanGenerator
 * @param {string} phaseId            'protect'|'restore'|'capacity'|'speed'|'return'
 * @param {number} sessionIndex       0, 1, 2, … — used to rotate which exercises
 *                                    are picked from each block
 * @returns {Array} ordered session exercises with an added `sessionBlock` label
 * ========================================================================= */
export function buildSession(resolvedExercises, phaseId, sessionIndex = 0) {
  const blueprint = SESSION_BLUEPRINTS[phaseId] || SESSION_BLUEPRINTS.protect;
  const periodization = PHASE_PERIODIZATION[phaseId] || PHASE_PERIODIZATION.protect;

  // Group the pool by block tag
  const byBlock = groupByBlock(resolvedExercises);

  const session = [];
  let totalPicked = 0;
  const [totalMin, totalMax] = blueprint.totalExercises;

  for (const blockSpec of blueprint.blocks) {
    const available = byBlock[blockSpec.block] || [];
    if (available.length === 0) {
      // Required block with no exercises — skip gracefully
      continue;
    }

    const [minCount, maxCount] = blockSpec.count;

    // Always aim for max count — rotation changes WHICH exercises, not how many.
    // We only go below max if the pool is smaller than maxCount.
    const pickCount = clamp(maxCount, minCount, Math.min(maxCount, available.length));

    // Rotate starting point through the pool for variety
    const picked = rotatePick(available, pickCount, sessionIndex);

    for (const ex of picked) {
      session.push({
        ...ex,
        sessionBlock: blockSpec.block,   // which structural block it fills
        phaseId,
        sessionIndex,
        prescription: overridePrescription(ex, periodization) || ex.prescription,
        periodizationContext: {
          sets: ex.slot === 'isometric' || ex.slot === 'mobility'
            ? 'See prescription'
            : periodization.sets,
          reps: ex.slot === 'isometric' || ex.slot === 'mobility'
            ? 'See prescription'
            : periodization.reps,
          rpe: periodization.rpe
        }
      });
      totalPicked++;
      if (totalPicked >= totalMax) break;
    }

    if (totalPicked >= totalMax) break;
  }

  // If we're short of totalMin (pool was thin), the session is still valid —
  // a real session with fewer exercises is better than a manufactured one.
  return session;
}

/* =========================================================================
 * buildWeekSchedule
 * Generates a 7-day schedule. Returns an array of day objects indicating
 * which days have sessions and what those sessions look like.
 *
 * @param {Array}  resolvedExercises  phase exercises (resolved)
 * @param {string} phaseId
 * @param {number} greenStreak        consecutive green check-ins (shrinks rest)
 * @param {number} weekStartDay       0 = Monday … 6 = Sunday (for display)
 * @returns {Array} 7 items: { dayIndex, dayName, hasSession, session|null, restDay, restReason }
 * ========================================================================= */
export function buildWeekSchedule(
  resolvedExercises,
  phaseId,
  greenStreak = 0,
  weekStartDay = 0
) {
  const restDays = restDaysForStreak(phaseId, greenStreak);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const week = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    dayName: dayNames[(weekStartDay + i) % 7],
    hasSession: false,
    session: null,
    restDay: false,
    restReason: null
  }));

  let sessionIdx = 0;
  let day = 0; // always start first session on day 0

  while (day < 7) {
    // Place a session on this day
    week[day].hasSession = true;
    week[day].session = buildSession(resolvedExercises, phaseId, sessionIdx);

    // Mark the following restDays as rest
    for (let r = 1; r <= restDays && day + r < 7; r++) {
      week[day + r].restDay = true;
      week[day + r].restReason =
        restDays === 2
          ? 'Recovery day — tissue needs ~48h between loading sessions in this phase.'
          : 'Active rest — light movement (walk, mobility) is fine.';
    }

    sessionIdx++;
    day += restDays + 1; // next session day
  }

  return week;
}

/* =========================================================================
 * describeSession
 * Returns a human-readable plain-text summary of a session (for debugging,
 * console output, or UI summary cards).
 * ========================================================================= */
export function describeSession(session, phaseId, sessionNumber = 1) {
  if (!session || session.length === 0) {
    return 'No session exercises available for this phase.';
  }

  const periodization = PHASE_PERIODIZATION[phaseId] || PHASE_PERIODIZATION.protect;
  const lines = [
    `── Session ${sessionNumber} (${phaseId}) — ${session.length} exercises ──`,
    `   Intensity: ${periodization.rpe} | Sets/reps guidance: ${periodization.sets}, ${periodization.reps}`,
    ''
  ];

  let lastBlock = null;
  for (const ex of session) {
    if (ex.sessionBlock !== lastBlock) {
      lines.push(`  [${blockLabel(ex.sessionBlock)}]`);
      lastBlock = ex.sessionBlock;
    }
    lines.push(`    • ${ex.name}  — ${ex.prescription}`);
    if (ex.equipmentAvailable === false && ex.suggestedVariant) {
      lines.push(`      ↳ Use instead: ${ex.suggestedVariant}`);
    }
  }

  lines.push('');
  lines.push(`  Pain rule: keep pain ≤3/10 during loading; back to baseline next morning.`);
  return lines.join('\n');
}

/* =========================================================================
 * describeWeek
 * Plain-text weekly schedule (useful for debugging or simple UI rendering).
 * ========================================================================= */
export function describeWeek(weekSchedule, phaseId) {
  const lines = [`Weekly schedule — Phase: ${phaseId}`, ''];
  let sessionCount = 0;

  for (const day of weekSchedule) {
    if (day.hasSession) {
      sessionCount++;
      lines.push(`${day.dayName}: SESSION ${sessionCount}`);
      for (const ex of day.session) {
        lines.push(`  [${blockLabel(ex.sessionBlock)}] ${ex.name} — ${ex.prescription}`);
      }
    } else if (day.restDay) {
      lines.push(`${day.dayName}: REST — ${day.restReason || 'Recovery day'}`);
    } else {
      lines.push(`${day.dayName}: (no session scheduled)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/* =========================================================================
 * Helpers (private)
 * ========================================================================= */

/** Group exercises by their block tag */
function groupByBlock(exercises) {
  const groups = {};
  for (const ex of exercises) {
    const b = ex.block || 'targeted';
    if (!groups[b]) groups[b] = [];
    groups[b].push(ex);
  }
  return groups;
}

/**
 * Pick `count` exercises from `pool` starting at a rotating offset so
 * consecutive sessions don't repeat the same exercises.
 *
 * Stride is chosen to be co-prime with pool.length so that iterating through
 * sessions covers the whole pool before repeating.  A stride of 1 just shifts
 * by one slot each session, giving smooth rotation through the pool.
 */
function rotatePick(pool, count, sessionIndex) {
  if (pool.length === 0) return [];
  // Move forward by 1 per session — simple, predictable, covers the whole pool
  const start = sessionIndex % pool.length;
  const result = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    result.push(pool[(start + i) % pool.length]);
  }
  return result;
}

/**
 * For isometric / mobility exercises, keep their own prescription.
 * For strength/eccentric exercises, if the periodization provides a specific
 * override, apply it.  (Currently we leave it as the exercise's own prescription
 * since exercises already have phase-specific prescriptions.)
 */
function overridePrescription(ex, periodization) {
  // No override for now — exercise-level prescription is phase-specific.
  return null;
}

/** Human-friendly block name */
function blockLabel(block) {
  const labels = {
    warmup: 'Warm-up',
    activation: 'Activation',
    targeted: 'Targeted loading',
    kinetic_chain: 'Kinetic chain',
    global_strength: 'Whole-body strength',
    neuromuscular: 'Neuromuscular / balance',
    conditioning: 'Conditioning',
    cooldown: 'Cool-down'
  };
  return labels[block] || block;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
