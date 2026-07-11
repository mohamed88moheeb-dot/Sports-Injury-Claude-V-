/**
 * lib/clinical/core/aiSessionComposer.mjs
 * ---------------------------------------------------------------------------
 * Injury-agnostic AI-driven session composition for the CURRENT stage only.
 * Everything else (entity routing, safety gates, stage timeline, RTS
 * criteria) stays the deterministic engine untouched — this only decides
 * WHICH exercises (from the stage's already clinically-vetted, tagged pool)
 * go into each of the week's 3 sessions, their dosage (from each exercise's
 * own dosage_by_tier), and how to react to a free-text comment ("no gym
 * equipment", "focus more on strength", "my hamstring also hurts").
 *
 * Safety boundary: Gemini may ONLY select exercise ids that exist in the pool
 * it was given — it cannot invent an exercise, a dosage outside dosage_by_tier,
 * or silently fold in a different body region. Every selection is validated
 * against the pool before use; anything invalid is dropped. If the key is
 * absent, the call fails, or validation leaves too few valid sessions, this
 * falls back to the exact deterministic rotation (buildSession) — the plan
 * NEVER goes empty or unsafe for lack of an AI response.
 * ---------------------------------------------------------------------------
 */

import { callGemini, parseJsonLoose, hasGeminiKey } from '../../rag/generate/gemini.mjs';
import { buildSession, toCard } from './sessionCore.mjs';
import { getBookendExercises } from './warmupCooldown.mjs';

function buildSystemPrompt(injuryLabel) {
  return `You are a sports-rehabilitation session-composition assistant working on a ${injuryLabel} rehab plan. You will be given:
  - A POOL of pre-vetted, clinically-approved exercises for the patient's current recovery stage (each with an id, name, purpose, tags, equipment, and a 3-tier dosage table).
  - The patient's TIER progression this week (session 1/2/3, tiers may repeat or step up).
  - Optionally, a free-text COMMENT from the patient (equipment limits, a focus request, or a mention of a different injury/body part).

Your job: choose which pool exercises go into each of the 3 sessions this week, favouring real variety session-to-session while keeping the program coherent (a session should still cover its usual movement categories, not skip them).

Hard rules:
  - You may ONLY select exercise ids that appear in the POOL. Never invent an exercise or an id.
  - Respect each exercise's OWN dosage_by_tier — do not invent a different dosage.
  - If the comment mentions a DIFFERENT body part/injury than ${injuryLabel} (e.g. "my hamstring also hurts"), do NOT add exercises for it — this pool only covers the current injury. Instead set "out_of_scope_note" explaining the patient should run a separate assessment for that.
  - If the comment states an equipment limitation, avoid pool exercises requiring that equipment where an equivalent exists in the pool; if no equivalent exists, keep the best available option and note it in "notes".
  - Never increase intensity beyond what the given tier's dosage_by_tier specifies.

Output ONLY a single JSON object matching the schema you're given.`;
}

function buildSchema(maxPerSession) {
  return {
    type: 'object',
    properties: {
      sessions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            session_number: { type: 'integer' },
            tier: { type: 'integer' },
            exercise_ids: { type: 'array', items: { type: 'string' }, maxItems: maxPerSession },
            notes: { type: 'string' },
          },
          required: ['session_number', 'tier', 'exercise_ids'],
        },
      },
      out_of_scope_note: { type: 'string' },
    },
    required: ['sessions'],
  };
}

function poolBrief(pool) {
  return pool.map((ex) => ({
    id: ex.id, name: ex.name, block: ex.block, purpose: ex.purpose,
    tags: { contraction: ex.contraction || null, muscle_bias: ex.muscle_bias || null, stretch_demand: ex.stretch_demand || null },
    equipment: ex.equipment || ['bodyweight'],
    cautions: ex.cautions || [],
    dosage_by_tier: ex.dosage_by_tier || null,
  }));
}

/**
 * @param {object} args
 * @param {object[]} args.pool            current stage's tagged exercise pool
 * @param {object} args.stage             { id, clinical_name, friendly_name }
 * @param {object} args.policy            { max_items, monitoring_triggers, stop_rule, card_cautions, stretch_caution }
 * @param {string} [args.userComment]     free-text adjustment from the patient
 * @param {string} [args.injuryLabel]     human label for the current injury, used in the prompt (e.g. "quad/patellar", "ankle sprain")
 * @param {object} [args.betaMeta]        the calling engine's BETA_META constant
 * @returns {Promise<{sessions: object[], mode: 'ai_composed'|'deterministic', out_of_scope_note?: string}>}
 *
 * Tiers are fixed at 0/1/2 across the week's 3 sessions — this matches the
 * deterministic builder (buildStagedPlan) exactly, which always escalates
 * dosage session-to-session within the displayed week regardless of how far
 * into the stage the patient is (that placement already chose WHICH stage).
 */
export async function composeSessions({ pool, stage, policy = {}, userComment = '', injuryLabel = 'this injury', betaMeta = {} }) {
  const deterministic = () => ({
    sessions: [0, 1, 2].map((t) => buildSession(pool, stage, t, policy, betaMeta)),
    mode: 'deterministic',
  });

  if (!hasGeminiKey() || !pool.length) return deterministic();

  const maxItems = policy.max_items ?? 6;
  const user = `STAGE: ${stage.friendly_name} (${stage.clinical_name})
TIER PROGRESSION: session 1 = tier 0 (early), session 2 = tier 1 (mid), session 3 = tier 2 (late)
MAX EXERCISES PER SESSION: ${maxItems}
PATIENT COMMENT: ${userComment ? userComment : '(none)'}

POOL:
${JSON.stringify(poolBrief(pool))}

Compose the 3 sessions now.`;

  const res = await callGemini({ system: buildSystemPrompt(injuryLabel), user, responseSchema: buildSchema(maxItems), maxTokens: 2000 });
  if (!res.ok) return deterministic();

  const parsed = parseJsonLoose(res.text);
  if (!parsed || !Array.isArray(parsed.sessions) || parsed.sessions.length !== 3) return deterministic();

  const poolById = new Map(pool.map((ex) => [ex.id, ex]));
  const sessions = [];
  for (let idx = 0; idx < parsed.sessions.length; idx++) {
    const s = parsed.sessions[idx];
    const tier = Number.isInteger(s.tier) ? Math.max(0, Math.min(2, s.tier)) : idx;
    const validIds = (s.exercise_ids || []).filter((id) => poolById.has(id));
    // De-dupe while preserving order.
    const seen = new Set();
    const uniqueIds = validIds.filter((id) => (seen.has(id) ? false : (seen.add(id), true)));
    if (uniqueIds.length < 2) break; // too thin/invalid — bail to deterministic fallback for the whole week
    const cards = uniqueIds.slice(0, maxItems).map((id) => toCard(poolById.get(id), tier, policy));
    const [warmup, cooldown] = getBookendExercises(policy.stretch_caution).map((ex) => toCard(ex, tier, policy));
    sessions.push({
      stage_id: stage.id, stage_name: stage.clinical_name, tier, tier_label: ['early', 'mid', 'late'][tier] || 'late',
      session_focus: stage.friendly_name, monitoring_triggers: policy.monitoring_triggers || [],
      stop_rule: policy.stop_rule || 'Stop if pain exceeds a tolerable level during or the next morning.',
      cards: [warmup, ...cards, cooldown], ai_note: s.notes || null,
      ...betaMeta,
    });
  }

  if (sessions.length !== 3) return deterministic();

  return {
    sessions, mode: 'ai_composed',
    out_of_scope_note: parsed.out_of_scope_note || null,
  };
}
