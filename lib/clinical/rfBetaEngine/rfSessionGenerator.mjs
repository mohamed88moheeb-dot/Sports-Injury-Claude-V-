/**
 * lib/clinical/rfBetaEngine/rfSessionGenerator.mjs
 * ---------------------------------------------------------------------------
 * Builds a single beta session for a phase from the eligible RF-EX pool. Maps
 * each exercise to a session block, attaches beta dosage defaults, alternatives,
 * a video placeholder, stop rule, and logging prompts. High-caution / manual-
 * review exercises are NEVER placed in an active session — they are withheld.
 * ---------------------------------------------------------------------------
 */

import { BETA_META, SESSION_BLOCKS } from './types.mjs';
import { getBetaDosage, betaStopRule } from './rfBetaPrescriptionDefaults.mjs';
import { resolveAlternatives } from './rfAlternativeMapper.mjs';

/** Map an RF-EX object to a (block, loadingType) for beta sessions. */
function classify(exObj) {
  const cls = exObj.library_classification;
  const cat = exObj.plan_card_category;
  if (cat === 'activation' || exObj.exercise_family === 'isometric_activation') return { block: 'mobility_activation', loadingType: 'isometric' };
  if (cls === 'rf_mobility_movement_restoration' || cat === 'mobility') return { block: 'mobility_activation', loadingType: 'mobility' };
  if (cls === 'rf_core_loading') return { block: 'tissue_specific_loading', loadingType: 'core_loading' };
  if (cls === 'supportive_proximal_control') return { block: cat === 'control' ? 'control_balance' : 'strength_support', loadingType: cat === 'control' ? 'control_balance' : 'support_strength' };
  if (cls === 'conditioning_recovery_support') return { block: 'conditioning', loadingType: 'conditioning' };
  if (cls === 'running_field_exposure') return { block: 'running_sport_prep', loadingType: 'running_prep' };
  return { block: 'strength_support', loadingType: 'support_strength' };
}

function videoPlaceholder(exObj) {
  const m = exObj.media || {};
  return { status: m.media_status || 'none', asset_id: m.image_asset_id || m.demo_video_asset_id || null, note: 'Video placeholder — no asset linked yet.' };
}

function logPrompts(exObj) {
  const out = [];
  if (exObj.log_completion_available) out.push('Did you complete this?');
  if (exObj.log_pain_response_available) out.push('How did it feel (pain response)?');
  if (exObj.log_difficulty_available) out.push('How hard was it?');
  if (exObj.log_confidence_available) out.push('How confident did you feel?');
  if (exObj.log_notes_available) out.push('Any notes?');
  if (exObj.next_day_response_prompt_available) out.push('How does it feel the next day?');
  return out.length ? out : ['Did you complete this?', 'How did it feel?'];
}

// Gentleness score (lower = gentler). Used to lead Foundation with the lowest-
// demand options (isometric/mobility) before standing/loaded work like step-ups.
const IMPACT_RANK = { none: 0, low: 1, moderate: 2, high: 3 };
const SPEED_RANK = { low: 0, low_to_moderate: 1, moderate: 2, high: 3 };
function gentleness(exObj) {
  const impact = IMPACT_RANK[exObj.impact_demand] ?? 1;
  const speed = SPEED_RANK[exObj.speed_power_demand] ?? 1;
  const isoBonus = exObj.exercise_family === 'isometric_activation' ? -1 : 0;
  const mobilityBonus = exObj.library_classification === 'rf_mobility_movement_restoration' ? -0.5 : 0;
  return impact + speed + isoBonus + mobilityBonus;
}

function toCard(exObj, phaseId, eligiblePool) {
  const { block, loadingType } = classify(exObj);
  const dosage = getBetaDosage(phaseId, loadingType);
  return {
    block,
    _gentleness: gentleness(exObj),
    exercise_id: exObj.exercise_id,
    exercise_name: exObj.user_facing_name || exObj.name,
    purpose: exObj.user_facing_purpose || '',
    sets: dosage ? dosage.sets : null,
    reps_or_hold: dosage ? dosage.reps_or_hold : null,
    rest: dosage ? dosage.rest : null,
    intensity: dosage ? dosage.intensity : 'reviewer-gated',
    tempo: dosage ? dosage.tempo : null,
    frequency: dosage ? dosage.frequency : null,
    equipment: exObj.equipment || [],
    instructions: exObj.user_facing_instructions || [],
    common_mistakes: exObj.user_facing_common_mistakes || [],
    alternatives: resolveAlternatives(exObj, eligiblePool),
    video_placeholder: videoPlaceholder(exObj),
    stop_rule: dosage ? dosage.stop_rule : betaStopRule(),
    log_prompts: logPrompts(exObj),
    default_status: BETA_META.default_status,
    evidence_status: BETA_META.evidence_status,
    clinical_review_status: BETA_META.clinical_review_status,
    runtime_scope: BETA_META.runtime_scope
  };
}

/**
 * @param {object[]} eligiblePool RF-EX objects safe to auto-select for the phase
 * @param {string} phaseId
 * @param {number} dayIndex used to lightly rotate the pool so days are not identical
 * @returns {{ day_index:number, blocks: object[], cards: object[] }}
 */
export function buildSession(eligiblePool, phaseId, dayIndex = 0, maxCards = 3) {
  if (!eligiblePool.length) return { day_index: dayIndex, blocks: [], cards: [] };

  const allCards = eligiblePool.map((ex) => toCard(ex, phaseId, eligiblePool));

  // Group by session block so a session is BALANCED (not a dump of every eligible
  // exercise). Foundation must stay minimal — see MAX_ACTIVE_CARDS_PER_PHASE.
  const byBlock = new Map();
  for (const c of allCards) {
    if (!byBlock.has(c.block)) byBlock.set(c.block, []);
    byBlock.get(c.block).push(c);
  }
  // Within each block, gentlest first so early days lead with the lowest-demand
  // option (e.g. isometric/mobility before a step-up). Later days rotate onward.
  for (const group of byBlock.values()) {
    group.sort((a, b) => a._gentleness - b._gentleness);
  }

  // Pick at most one card per block in canonical order (rotated by dayIndex for
  // day-to-day variety), capped at maxCards.
  const picked = [];
  for (const block of SESSION_BLOCKS) {
    if (picked.length >= maxCards) break;
    const group = byBlock.get(block);
    if (group && group.length) picked.push(group[dayIndex % group.length]);
  }
  // Only if still under the cap, top up from remaining cards (rotated, no dupes).
  if (picked.length < maxCards) {
    const remaining = allCards.filter((c) => !picked.includes(c));
    for (let i = 0; i < remaining.length && picked.length < maxCards; i++) {
      const c = remaining[(i + dayIndex) % remaining.length];
      if (!picked.includes(c)) picked.push(c);
    }
  }

  picked.sort((a, b) => SESSION_BLOCKS.indexOf(a.block) - SESSION_BLOCKS.indexOf(b.block));
  const blocks = [...new Set(picked.map((c) => c.block))].map((block) => ({
    block,
    card_ids: picked.filter((c) => c.block === block).map((c) => c.exercise_id)
  }));
  blocks.push({ block: 'logging_check_in', card_ids: [], note: 'Log today and complete your daily check-in.' });
  // strip internal scoring field before returning
  const cards = picked.map(({ _gentleness, ...c }) => c);
  return { day_index: dayIndex, blocks, cards };
}
