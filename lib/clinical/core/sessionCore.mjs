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
  const stageWeeks = opts.stageWeeks || {};
  const betaMeta = opts.betaMeta || {};

  // Stages allocated 0 weeks (minor presentations — see splitStageWeeks) are
  // dropped entirely: a 1-2 week problem gets a 1-2 phase plan, not a token
  // week in every phase of a full multi-phase progression.
  const kept = stages.filter((s) => (stageWeeks[s.id] ?? 1) > 0);
  let activeStages = kept.length ? kept : stages;
  const effWeeks = { ...stageWeeks };
  let currentIdx = activeStages.findIndex((s) => s.id === currentStageId);
  if (currentIdx < 0) {
    // The clinically-placed entry stage was trimmed away. Don't skip the
    // athlete straight to late-stage work — re-instate the placed stage in
    // place of the first kept phase (order preserved: the placed stage is
    // always earlier in the model than the kept tail).
    const placed = stages.find((s) => s.id === currentStageId);
    if (placed && activeStages.length) {
      effWeeks[placed.id] = effWeeks[activeStages[0].id] || 1;
      activeStages = [placed, ...activeStages.slice(1)];
    }
    currentIdx = 0;
  }

  const stageBlocks = activeStages.map((stage, idx) => {
    const status = idx === currentIdx ? 'current' : idx < currentIdx ? 'earlier' : 'upcoming';
    const pool = poolForStage(stage.id) || [];
    const isCurrent = status === 'current';
    const weeksCount = effWeeks[stage.id] || 1;

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
    current_stage_id: activeStages[currentIdx].id,
    current_stage_name: activeStages[currentIdx].clinical_name,
    stages: stageBlocks,
    total_estimated_weeks: totalWeeks,
    ...betaMeta,
  };
}

/**
 * Split a total recovery estimate (weeks) across a stage model, proportional
 * to each stage's typical share of the timeline.
 *
 * MINOR PRESENTATIONS: when the clinical estimate is SHORTER than the number
 * of phases (e.g. a 1.5-2 week grade-I strain against a 4-phase model), the
 * timeline is NOT inflated to fit the phases. Instead the earliest phases
 * are allocated 0 weeks (buildStagedPlan drops them) and only the last
 * `round(total)` phases run, 1 week each — a minor injury gets a genuinely
 * short plan that ends in return-to-sport, not a token week of every phase.
 *
 * Otherwise weeks are allocated via the largest-remainder method so the
 * stage allocations always sum to EXACTLY the total — never more.
 *
 * @param {object[]} stages   the module's stage model (in order)
 * @param {number} totalWeeks
 * @param {object} shares     { [stageId]: fraction }, should sum to ~1
 * @returns {object} { [stageId]: weeks }  (0 = phase not needed at this severity)
 */
export function splitStageWeeks(stages, totalWeeks, shares) {
  const roundedTotal = Math.max(1, Math.round(totalWeeks) || stages.length);

  if (roundedTotal < stages.length) {
    const out = {};
    const firstKept = stages.length - roundedTotal;
    stages.forEach((s, i) => { out[s.id] = i < firstKept ? 0 : 1; });
    return out;
  }

  const effectiveTotal = roundedTotal;

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
