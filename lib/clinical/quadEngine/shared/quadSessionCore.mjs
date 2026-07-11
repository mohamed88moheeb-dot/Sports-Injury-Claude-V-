/**
 * lib/clinical/quadEngine/shared/quadSessionCore.mjs
 * ---------------------------------------------------------------------------
 * Shared session + plan assembly used by every quad module. A module supplies
 * (a) its stage model, (b) a per-stage exercise pool, and (c) a policy object
 * (stretch caution, monitoring triggers, max items). This core turns that into
 * a structured, beta-labelled plan. It holds NO injury-specific clinical logic
 * itself — that lives in each module — so the shared core stays small and the
 * divergent clinical behaviour (e.g. contusion stretch-caution) is explicit
 * and auditable in the module that owns it.
 * ---------------------------------------------------------------------------
 */

import { BETA_META } from '../types.mjs';

/**
 * Build a single session from a stage's exercise pool.
 * @param {object[]} pool   exercises tagged for this stage
 * @param {object}   stage  { id, clinical_name, friendly_name }
 * @param {number}   tier   0 early | 1 mid | 2 late (volume escalation within stage)
 * @param {object}   policy { max_items, monitoring_triggers, stop_rule }
 */
export function buildQuadSession(pool, stage, tier, policy = {}) {
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

  return {
    stage_id: stage.id,
    stage_name: stage.clinical_name,
    tier,
    tier_label: ['early', 'mid', 'late'][tier] || 'late',
    session_focus: stage.friendly_name,
    monitoring_triggers: policy.monitoring_triggers || [],
    stop_rule: policy.stop_rule || 'Stop if pain exceeds a tolerable level during or the next morning.',
    cards,
    ...BETA_META,
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
    cautions: [...(ex.cautions || []), ...(policy.card_cautions || [])],
    source_refs: ex.source_refs || [],
    instructions: ex.instructions || [],
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
 * @param {object}   opts     { tier?: number }
 */
export function buildStagedPlan(stages, currentStageId, poolForStage, policy = {}, opts = {}) {
  const currentIdx = Math.max(0, stages.findIndex((s) => s.id === currentStageId));
  const tier = typeof opts.tier === 'number' ? opts.tier : 0;

  const stageBlocks = stages.map((stage, idx) => {
    const status = idx === currentIdx ? 'current' : idx < currentIdx ? 'earlier' : 'upcoming';
    const pool = poolForStage(stage.id) || [];
    const isCurrent = status === 'current';

    // Current stage gets a real 3-session week; others get a single preview session.
    const sessions = isCurrent
      ? [0, 1, 2].map((t) => buildQuadSession(pool, stage, t, policy))
      : [markPreview(buildQuadSession(pool, stage, 0, policy))];

    return {
      stage_id: stage.id,
      stage_name: stage.clinical_name,
      friendly_name: stage.friendly_name,
      status,
      is_current: isCurrent,
      sessions,
      exercise_count: pool.length,
      // Raw tagged pool for the current stage only — lets a post-processing
      // layer (e.g. the AI session composer) recompose from the SAME
      // clinically-vetted candidates rather than inventing new exercises.
      ...(isCurrent ? { current_stage_pool: pool, current_stage_tier_base: tier, current_stage_policy: policy } : {}),
    };
  });

  return {
    current_stage_id: stages[currentIdx].id,
    current_stage_name: stages[currentIdx].clinical_name,
    stages: stageBlocks,
    ...BETA_META,
  };
}

function markPreview(session) {
  return { ...session, preview_only: true, cards: session.cards.map((c) => ({ ...c, preview_only: true })) };
}
