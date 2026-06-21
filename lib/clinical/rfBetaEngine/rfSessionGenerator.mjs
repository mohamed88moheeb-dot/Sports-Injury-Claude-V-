/**
 * lib/clinical/rfBetaEngine/rfSessionGenerator.mjs
 * ---------------------------------------------------------------------------
 * Builds a single beta session using the elite tier model.
 *
 * Session structure is driven by SESSION_TIER_STRUCTURE in rfEliteSessionContent.mjs:
 *   - 3 tiers per phase (early / mid / late), selected by sessionIndex (0/1/2)
 *   - Each tier defines which blocks are included, how many exercises per block,
 *     and the dosage for that block in that tier
 *   - Exercise content (instructions, cues, mistakes) is overlaid from EXERCISE_CONTENT
 *
 * Volume progression example (Foundation):
 *   Session 0 (early):  6 exercises — gentle re-introduction
 *   Session 1 (mid):    9 exercises — building volume
 *   Session 2 (late):  11 exercises — approaching Reload readiness
 * ---------------------------------------------------------------------------
 */

import { BETA_META } from './types.mjs';
import { betaStopRule } from './rfBetaPrescriptionDefaults.mjs';
import { resolveAlternatives } from './rfAlternativeMapper.mjs';
import { EXERCISE_CONTENT, getSessionTierConfig } from './rfEliteSessionContent.mjs';

// Canonical block order for final card sorting.
const BLOCK_ORDER = [
  'conditioning',
  'mobility_activation',
  'tissue_specific_loading',
  'strength_support',
  'control_balance',
  'running_sport_prep',
];

// Maps dev block names to session loading types (kept for fallback dosage lookup).
const DEV_BLOCK_LOADING_TYPE = {
  mobility_activation: 'mobility',
  tissue_specific_loading: 'tissue_specific_loading',
  strength_support: 'support_strength',
  control_balance: 'control_balance',
  conditioning: 'conditioning',
  running_sport_prep: 'running_prep',
};

/** Map an RF-EX object to its session block using the pre-computed override. */
function classify(exObj) {
  if (exObj._dev_block_override) {
    const block = exObj._dev_block_override;
    return { block, loadingType: DEV_BLOCK_LOADING_TYPE[block] || 'support_strength' };
  }
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

// Gentleness score — lower = gentler. Used to order exercises within a block
// so the session arc runs from least demanding to most demanding.
const IMPACT_RANK = { none: 0, low: 1, moderate: 2, high: 3 };
const SPEED_RANK = { low: 0, low_to_moderate: 1, moderate: 2, high: 3 };
function gentleness(exObj) {
  const impact = IMPACT_RANK[exObj.impact_demand] ?? 1;
  const speed = SPEED_RANK[exObj.speed_power_demand] ?? 1;
  const isoBonus = exObj.exercise_family === 'isometric_activation' ? -1 : 0;
  const mobilityBonus = exObj.library_classification === 'rf_mobility_movement_restoration' ? -0.5 : 0;
  return impact + speed + isoBonus + mobilityBonus;
}

/**
 * Overlay elite clinical content onto a card.
 * Falls back to whatever is in the exercise object if the overlay has no entry.
 */
function overlayContent(exObj, card) {
  const elite = EXERCISE_CONTENT[exObj.exercise_id];
  if (!elite) return card;
  return {
    ...card,
    purpose: elite.purpose || card.purpose,
    instructions: (elite.instructions && elite.instructions.length) ? elite.instructions : card.instructions,
    coaching_cues: (elite.coaching_cues && elite.coaching_cues.length) ? elite.coaching_cues : card.coaching_cues,
    common_mistakes: (elite.common_mistakes && elite.common_mistakes.length) ? elite.common_mistakes : card.common_mistakes,
  };
}

/**
 * Build one exercise card, applying tier dosage from the block config.
 */
function toCard(exObj, tierBlockConfig, eligiblePool) {
  const { block } = classify(exObj);
  const dosage = tierBlockConfig ? tierBlockConfig.dosage : null;

  const base = {
    block,
    _gentleness: gentleness(exObj),
    preview_only: exObj.preview_only || false,
    exercise_id: exObj.exercise_id,
    exercise_name: exObj.user_facing_name || exObj.name,
    purpose: exObj.user_facing_purpose || '',
    sets: dosage ? dosage.sets : null,
    reps_or_hold: dosage ? dosage.reps_or_hold : null,
    rest: dosage ? dosage.rest : null,
    intensity: dosage ? dosage.intensity : null,
    tempo: dosage ? dosage.tempo : null,
    frequency: null,
    equipment: exObj.equipment || [],
    instructions: exObj.user_facing_instructions || [],
    coaching_cues: [],
    common_mistakes: exObj.user_facing_common_mistakes || [],
    alternatives: resolveAlternatives(exObj, eligiblePool),
    video_placeholder: videoPlaceholder(exObj),
    stop_rule: betaStopRule(),
    log_prompts: logPrompts(exObj),
    default_status: BETA_META.default_status,
    evidence_status: BETA_META.evidence_status,
    clinical_review_status: BETA_META.clinical_review_status,
    runtime_scope: BETA_META.runtime_scope,
  };

  return overlayContent(exObj, base);
}

/**
 * Build an elite session using the tier structure.
 *
 * @param {object[]} eligiblePool  RF-EX objects safe to auto-select for the phase
 * @param {string}   phaseId
 * @param {number}   sessionIndex  0 = early, 1 = mid, 2 = late
 * @param {number}   _maxCards     unused — tier structure controls the count
 * @returns {{ day_index:number, session_title:string, blocks:object[], cards:object[] }}
 */
export function buildSession(eligiblePool, phaseId, sessionIndex = 0, _maxCards = 6) {
  if (!eligiblePool.length) return { day_index: sessionIndex, session_title: '', blocks: [], cards: [] };

  const tierConfig = getSessionTierConfig(phaseId, sessionIndex);

  // If no tier config (unknown phase), fall back to simple selection.
  if (!tierConfig) {
    return buildFallbackSession(eligiblePool, phaseId, sessionIndex);
  }

  // Group pool by block, sorted gentlest-first within each block.
  const byBlock = new Map();
  for (const ex of eligiblePool) {
    const { block } = classify(ex);
    if (!byBlock.has(block)) byBlock.set(block, []);
    byBlock.get(block).push(ex);
  }
  for (const group of byBlock.values()) {
    group.sort((a, b) => gentleness(a) - gentleness(b));
  }

  const picked = [];
  const usedIds = new Set();

  // For each block entry in the tier config, pick `count` exercises.
  for (const blockSpec of tierConfig.blocks) {
    const { block, count } = blockSpec;
    const group = byBlock.get(block) || [];

    // Rotate the starting index by sessionIndex so sessions vary across the phase.
    let added = 0;
    for (let i = 0; i < group.length && added < count; i++) {
      const ex = group[(i + sessionIndex) % group.length];
      if (usedIds.has(ex.exercise_id)) continue;
      usedIds.add(ex.exercise_id);
      picked.push({ ex, blockSpec });
      added++;
    }
  }

  // Sort final cards by canonical block order, then gentleness within each block.
  picked.sort((a, b) => {
    const blockDiff = BLOCK_ORDER.indexOf(a.blockSpec.block) - BLOCK_ORDER.indexOf(b.blockSpec.block);
    if (blockDiff !== 0) return blockDiff;
    return gentleness(a.ex) - gentleness(b.ex);
  });

  const cards = picked.map(({ ex, blockSpec }) => {
    const card = toCard(ex, blockSpec, eligiblePool);
    const { _gentleness, ...rest } = card;
    return rest;
  });

  const seenBlocks = [];
  const blocks = [];
  for (const card of cards) {
    if (!seenBlocks.includes(card.block)) {
      seenBlocks.push(card.block);
      blocks.push({
        block: card.block,
        card_ids: cards.filter((c) => c.block === card.block).map((c) => c.exercise_id),
      });
    }
  }
  blocks.push({ block: 'logging_check_in', card_ids: [], note: 'Log today and complete your daily check-in.' });

  return {
    day_index: sessionIndex,
    session_title: tierConfig.session_title,
    session_description: tierConfig.description,
    blocks,
    cards,
  };
}

/** Simple fallback session builder for phases without a tier config. */
function buildFallbackSession(eligiblePool, phaseId, sessionIndex) {
  const SESSION_BLOCKS_FB = ['conditioning', 'mobility_activation', 'tissue_specific_loading', 'strength_support', 'control_balance', 'running_sport_prep'];
  const byBlock = new Map();
  for (const ex of eligiblePool) {
    const { block } = classify(ex);
    if (!byBlock.has(block)) byBlock.set(block, []);
    byBlock.get(block).push(ex);
  }
  const picked = [];
  const usedIds = new Set();
  for (const block of SESSION_BLOCKS_FB) {
    if (picked.length >= 6) break;
    const group = byBlock.get(block);
    if (group && group.length) {
      const ex = group[sessionIndex % group.length];
      if (!usedIds.has(ex.exercise_id)) {
        usedIds.add(ex.exercise_id);
        picked.push({ ex, blockSpec: { block, dosage: null } });
      }
    }
  }
  const cards = picked.map(({ ex, blockSpec }) => {
    const card = toCard(ex, blockSpec, eligiblePool);
    const { _gentleness, ...rest } = card;
    return rest;
  });
  const blocks = [...new Set(cards.map((c) => c.block))].map((block) => ({
    block,
    card_ids: cards.filter((c) => c.block === block).map((c) => c.exercise_id),
  }));
  blocks.push({ block: 'logging_check_in', card_ids: [], note: 'Log today and complete your daily check-in.' });
  return { day_index: sessionIndex, session_title: '', blocks, cards };
}
