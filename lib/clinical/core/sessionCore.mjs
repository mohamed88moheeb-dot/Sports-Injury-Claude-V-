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
export function buildSession(pool, stage, tier, policy = {}, betaMeta = {}) {
  const maxItems = policy.max_items ?? 6;
  // Tier escalates volume: early uses fewer items, late uses the full pool.
  const count = Math.min(pool.length, [Math.ceil(maxItems * 0.6), Math.ceil(maxItems * 0.8), maxItems][tier] || maxItems);

  // Rotate by tier so the three weekly sessions vary without re-sorting away the
  // pool's clinical ranking (pool is already ordered most-appropriate-first).
  const cards = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    const ex = pool[(i + tier) % pool.length];
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
 * Build a full staged plan: one current-stage week (3 sessions) plus a preview
 * of the remaining stages.
 *
 * @param {object[]} stages   the module's stage model
 * @param {string}   currentStageId
 * @param {function}  poolForStage  (stageId) => exercise[]
 * @param {object}   policy
 * @param {object}   opts     { tier?: number, stageWeeks?: {[stageId]: number}, betaMeta?: object }
 *   stageWeeks lets a module declare how many weeks each stage is expected to
 *   span (grade/severity-dependent) — without it, a stage silently reads as
 *   "one week" with no indication the phase actually runs longer.
 *   betaMeta is the calling engine's own BETA_META constant.
 */
export function buildStagedPlan(stages, currentStageId, poolForStage, policy = {}, opts = {}) {
  const currentIdx = Math.max(0, stages.findIndex((s) => s.id === currentStageId));
  const tier = typeof opts.tier === 'number' ? opts.tier : 0;
  const stageWeeks = opts.stageWeeks || {};
  const betaMeta = opts.betaMeta || {};

  const stageBlocks = stages.map((stage, idx) => {
    const status = idx === currentIdx ? 'current' : idx < currentIdx ? 'earlier' : 'upcoming';
    const pool = poolForStage(stage.id) || [];
    const isCurrent = status === 'current';
    const weeks = stageWeeks[stage.id] || null;

    // Current stage gets a real 3-session week; others get a single preview session.
    const sessions = isCurrent
      ? [0, 1, 2].map((t) => buildSession(pool, stage, t, policy, betaMeta))
      : [markPreview(buildSession(pool, stage, 0, policy, betaMeta))];

    return {
      stage_id: stage.id,
      stage_name: stage.clinical_name,
      friendly_name: stage.friendly_name,
      status,
      is_current: isCurrent,
      sessions,
      exercise_count: pool.length,
      duration_weeks: weeks,
      progression_note: weeks ? `~${weeks} week${weeks > 1 ? 's' : ''} · 3x/week training, rest days between sessions for adaptation.` : '',
      // Raw tagged pool for the current stage only — lets a post-processing
      // layer (e.g. the AI session composer) recompose from the SAME
      // clinically-vetted candidates rather than inventing new exercises.
      ...(isCurrent ? { current_stage_pool: pool, current_stage_tier_base: tier, current_stage_policy: policy } : {}),
    };
  });

  const totalWeeks = Object.values(stageWeeks).some(Boolean)
    ? stageBlocks.reduce((sum, s) => sum + (s.duration_weeks || 0), 0)
    : null;

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
 * to each stage's typical share of the timeline. Every stage gets at least 1
 * week. `shares` should sum to ~1 across the stage ids present in `stages`.
 * @param {object[]} stages   the module's stage model (in order)
 * @param {number} totalWeeks
 * @param {object} shares     { [stageId]: fraction }
 * @returns {object} { [stageId]: weeks }
 */
export function splitStageWeeks(stages, totalWeeks, shares) {
  const out = {};
  for (const s of stages) out[s.id] = Math.max(1, Math.round(totalWeeks * (shares[s.id] ?? 1 / stages.length)));
  return out;
}

function markPreview(session) {
  return { ...session, preview_only: true, cards: session.cards.map((c) => ({ ...c, preview_only: true })) };
}
