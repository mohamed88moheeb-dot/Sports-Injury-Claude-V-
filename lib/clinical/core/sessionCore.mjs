/**
 * lib/clinical/core/sessionCore.mjs
 * ---------------------------------------------------------------------------
 * Injury-agnostic session + plan assembly, shared by every rehab engine
 * (quad, and any future engine). An engine module supplies (a) its stage
 * model, (b) a per-stage exercise pool, (c) a policy object (stretch
 * caution, monitoring triggers, max items), and (d) its own BETA_META. This
 * core holds NO injury-specific clinical logic — that always lives in the
 * engine module that owns it — so behaviour that legitimately differs by
 * injury (e.g. stretch-caution cool-downs) stays explicit and auditable
 * where the clinical decision is made, not buried in shared code.
 * ---------------------------------------------------------------------------
 */

import { getBookendExercises } from './warmupCooldown.mjs';

/**
 * Build a single session from a stage's exercise pool.
 * @param {object[]} pool   exercises tagged for this stage
 * @param {object}   stage  { id, clinical_name, friendly_name }
 * @param {number}   tier   0 early | 1 mid | 2 late (volume escalation within stage)
 * @param {object}   policy { max_items, monitoring_triggers, stop_rule, stretch_caution, card_cautions }
 * @param {object}   betaMeta  the calling engine's BETA_META (spread onto the session)
 */
export function buildSession(pool, stage, tier, policy = {}, betaMeta = {}, rotationOffset = 0) {
  const maxItems = policy.max_items ?? 6;
  // Tier escalates volume: early uses fewer items, late uses the full pool.
  const count = Math.min(pool.length, [Math.ceil(maxItems * 0.6), Math.ceil(maxItems * 0.8), maxItems][tier] || maxItems);

  // Rotate by tier (+ an optional extra offset, e.g. the week index for a
  // multi-week stage) so sessions vary without re-sorting away the pool's
  // clinical ranking (pool is already ordered most-appropriate-first).
  const cards = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    const ex = pool[(i + tier + rotationOffset) % pool.length];
    if (cards.find((c) => c.exercise_id === ex.id)) continue;
    cards.push(toCard(ex, tier, policy));
  }

  const [warmup, cooldown] = getBookendExercises(policy.stretch_caution).map((ex) => toCard(ex, tier, policy));
  const bookendedCards = [warmup, ...cards, cooldown];

  return {
    stage_id: stage.id,
    stage_name: stage.clinical_name,
    tier,
    tier_label: ['early', 'mid', 'late'][tier] || 'late',
    session_focus: stage.friendly_name,
    monitoring_triggers: policy.monitoring_triggers || [],
    stop_rule: policy.stop_rule || 'Stop if pain exceeds a tolerable level during or the next morning.',
    cards: bookendedCards,
    ...betaMeta,
  };
}

export function toCard(ex, tier, policy) {
  const dose = ex.dosage_by_tier ? ex.dosage_by_tier[tier] || ex.dosage_by_tier[ex.dosage_by_tier.length - 1] : null;
  return {
    exercise_id: ex.id,
    name: ex.name,
    block: ex.block,
    purpose: ex.purpose,
    why_this_injury: ex.why || null,
    dosage: dose,                                  // beta default — clinician review required
    dosage_status: 'beta_default_requires_review',
    equipment: ex.equipment || ['bodyweight'],
    cautions: [...(ex.cautions || []), ...(ex.is_bookend ? [] : (policy.card_cautions || []))],
    source_refs: ex.source_refs || [],
    instructions: ex.instructions || [],
    ...(ex.is_bookend ? { is_bookend: true } : {}),
  };
}

/**
 * Build `weeksCount` real weeks of 3 sessions each for one stage. Every week
 * repeats the same early/mid/late (tier 0/1/2) rhythm — the AI session
 * composer's contract ("session 1 = tier 0, session 2 = tier 1, session 3 =
 * tier 2") stays true for every week, not just the first — but each week's
 * `rotationOffset` shifts which pool items land in each slot, so a 3+ week
 * stage doesn't just repeat one identical week verbatim. Non-current stages
 * get the exact same structure, marked preview_only throughout.
 */
function buildStageWeeks(pool, stage, weeksCount, policy, betaMeta, isCurrent) {
  const weeks = [];
  for (let w = 0; w < weeksCount; w++) {
    const sessions = [0, 1, 2].map((tier) => {
      const session = buildSession(pool, stage, tier, policy, betaMeta, w);
      return isCurrent ? session : markPreview(session);
    });
    weeks.push({ week_index: w, sessions });
  }
  return weeks;
}

/**
 * Build a full staged plan: every stage gets its REAL number of weeks
 * (duration_weeks), each with a full 3-session week — not just the current
 * stage, and not just one week regardless of how long the stage actually
 * runs (the previous behaviour silently collapsed every phase to a single
 * week of content).
 *
 * @param {object[]} stages   the module's stage model
 * @param {string}   currentStageId
 * @param {function}  poolForStage  (stageId) => exercise[]
 * @param {object}   policy
 * @param {object}   opts     { stageWeeks?: {[stageId]: number}, betaMeta?: object }
 *   stageWeeks lets a module declare how many weeks each stage is expected to
 *   span (grade/severity-dependent) — without it, a stage defaults to 1 week.
 *   betaMeta is the calling engine's own BETA_META constant.
 */
export function buildStagedPlan(stages, currentStageId, poolForStage, policy = {}, opts = {}) {
  const currentIdx = Math.max(0, stages.findIndex((s) => s.id === currentStageId));
  const stageWeeks = opts.stageWeeks || {};
  const betaMeta = opts.betaMeta || {};

  const stageBlocks = stages.map((stage, idx) => {
    const status = idx === currentIdx ? 'current' : idx < currentIdx ? 'earlier' : 'upcoming';
    const pool = poolForStage(stage.id) || [];
    const isCurrent = status === 'current';
    const weeksCount = stageWeeks[stage.id] || 1;

    const weeks = buildStageWeeks(pool, stage, weeksCount, policy, betaMeta, isCurrent);

    return {
      stage_id: stage.id,
      stage_name: stage.clinical_name,
      friendly_name: stage.friendly_name,
      status,
      is_current: isCurrent,
      weeks,
      exercise_count: pool.length,
      duration_weeks: weeksCount,
      progression_note: `~${weeksCount} week${weeksCount > 1 ? 's' : ''} · 3x/week training, rest days between sessions for adaptation.`,
      // Raw tagged pool for the current stage only — lets a post-processing
      // layer (e.g. the AI session composer) recompose from the SAME
      // clinically-vetted candidates rather than inventing new exercises.
      // Scoped to the current stage's FIRST week only — the AI composer
      // adjusts "this week", it never re-diagnoses or changes the timeline.
      ...(isCurrent ? { current_stage_pool: pool, current_stage_policy: policy } : {}),
    };
  });

  const totalWeeks = stageBlocks.reduce((sum, s) => sum + (s.duration_weeks || 0), 0) || null;

  return {
    current_stage_id: stages[currentIdx].id,
    current_stage_name: stages[currentIdx].clinical_name,
    stages: stageBlocks,
    total_estimated_weeks: totalWeeks,
    ...betaMeta,
  };
}

/**
 * Split a total recovery estimate (weeks) across a stage model, proportional
 * to each stage's typical share of the timeline.
 *
 * A real multi-phase progression needs at least 1 week per phase to have
 * meaningful distinct content, so if the raw clinical estimate is shorter
 * than the number of phases, the EFFECTIVE total is bumped up to fit —
 * rather than (the previous bug) forcing every phase to >=1 week
 * independently, which silently inflated the total past whatever was passed
 * in (e.g. a 2-week grade-1 estimate across 4 phases became 4 weeks with no
 * indication anything had changed).
 *
 * Weeks are then allocated via the largest-remainder method so the stage
 * allocations always sum to EXACTLY the effective total — never more.
 *
 * @param {object[]} stages   the module's stage model (in order)
 * @param {number} totalWeeks
 * @param {object} shares     { [stageId]: fraction }, should sum to ~1
 * @returns {object} { [stageId]: weeks }
 */
export function splitStageWeeks(stages, totalWeeks, shares) {
  const effectiveTotal = Math.max(Math.round(totalWeeks) || stages.length, stages.length);

  const entries = stages.map((s) => {
    const share = shares[s.id] ?? 1 / stages.length;
    const exact = effectiveTotal * share;
    return { id: s.id, exact, weeks: Math.max(1, Math.floor(exact)) };
  });

  let diff = effectiveTotal - entries.reduce((sum, e) => sum + e.weeks, 0);

  if (diff > 0) {
    // Hand out leftover whole weeks to the stages with the largest
    // fractional remainder first (largest-remainder / Hamilton's method).
    const order = [...entries].sort((a, b) => (b.exact - b.weeks) - (a.exact - a.weeks));
    for (let i = 0; i < diff; i++) order[i % order.length].weeks += 1;
  } else if (diff < 0) {
    // The >=1-week-per-stage floor overshot the total — trim back down,
    // taking from the stages with the smallest remainder first, never below
    // 1 week (always possible since effectiveTotal >= stages.length).
    const order = [...entries].sort((a, b) => (a.exact - a.weeks) - (b.exact - b.weeks));
    let need = -diff;
    for (const e of order) {
      while (need > 0 && e.weeks > 1) { e.weeks -= 1; need -= 1; }
      if (need === 0) break;
    }
  }

  const out = {};
  for (const e of entries) out[e.id] = e.weeks;
  return out;
}

function markPreview(session) {
  return { ...session, preview_only: true, cards: session.cards.map((c) => ({ ...c, preview_only: true })) };
}
