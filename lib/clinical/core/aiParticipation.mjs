/**
 * lib/clinical/core/aiParticipation.mjs
 * ---------------------------------------------------------------------------
 * Evidence-grounded "can I keep playing?" conclusions.
 *
 * The deterministic rules in sportParticipation.mjs are the SAFETY ENVELOPE
 * and the fallback — not the final word. When a Gemini key is configured,
 * this layer retrieves the curated literature passages relevant to the case
 * (rtsEvidence.mjs) and asks the model to reach its own conclusion FROM
 * THOSE PASSAGES, tailored to the athlete's entity, severity, sport and
 * time since injury.
 *
 * Guardrails (all deterministic, all auditable):
 *  - The model may only conclude a level EQUAL TO or MORE CAUTIOUS than the
 *    envelope — it can tighten, never loosen, a safety decision.
 *  - It must cite at least one retrieved passage id; uncited output is
 *    rejected.
 *  - Referral/red-flag cases never reach the model at all.
 *  - Any failure (no key, timeout, malformed output, guardrail breach)
 *    falls back to the deterministic envelope, labelled as such.
 * ---------------------------------------------------------------------------
 */

import { callGemini, parseJsonLoose, hasGeminiKey } from '../../rag/generate/gemini.mjs';
import { retrieveRtsEvidence } from './rtsEvidence.mjs';

// Ordered least → most restrictive. The model may move DOWN this list
// relative to the envelope (more cautious), never up.
const RESTRICTIVENESS = {
  continue_modified: 0,
  short_break: 1,
  relative_rest: 2,
  rehab_first: 3,
  no_sport: 4,
  medical_first: 5,
};

// Gemini can take 10-20s under load for a ~150-token completion. The routes
// start this call in PARALLEL with the session composer, so a generous
// timeout here doesn't stack on top of the composer's latency.
const AI_TIMEOUT_MS = 15000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ ok: false, error: 'timeout' }), ms)),
  ]);
}

const SYSTEM = `You are a sports-medicine reasoning aid deciding SPORT PARTICIPATION during rehabilitation for one athlete.
Reason ONLY from the numbered evidence passages provided — never from unsourced knowledge. Reach your own conclusion for THIS case.

Choose "level" from exactly: continue_modified | short_break | relative_rest | rehab_first | no_sport.
A "baseline" decision from a deterministic clinical ruleset is provided. You may agree with it or choose a MORE cautious level; you must never choose a less cautious one.

Distinguish clearly between the rehab PROGRAMME LENGTH and TIME AWAY FROM SPORT — for load-managed problems these differ (a long loading programme can run alongside continued, modified sport).

Output STRICT JSON only:
{"level": string, "headline": string (<=80 chars, direct, second person), "time_away": string (<=80 chars), "detail": string (2-4 sentences tailored to this case, plain language), "cite": string[] (ids of the passages your conclusion rests on, at least one)}`;

/**
 * @param {object} args
 * @param {object} args.envelope     deterministic result from deriveSportParticipation (incl. .kind)
 * @param {object} args.caseSummary  { entity, severity, days_since_injury, sport, plan_total_weeks }
 * @param {string} [args.region]     human region label for retrieval ("calf", "knee"...)
 * @returns {Promise<object>} participation object with { grounding, citations } added
 */
export async function groundSportParticipation({ envelope, caseSummary = {}, region = '' }) {
  if (!envelope) return null;
  const deterministic = (why) => ({ ...envelope, grounding: why, citations: [] });

  // Red-flag/referral routes are a hard safety decision — no model involvement.
  if (envelope.level === 'medical_first') return deterministic('deterministic_safety_gate');
  if (!hasGeminiKey()) return deterministic('deterministic_fallback');

  const evidence = retrieveRtsEvidence({ kind: envelope.kind || null, entity: caseSummary.entity || '', region });
  if (!evidence.length) return deterministic('deterministic_fallback');

  const user = JSON.stringify({
    case: caseSummary,
    baseline: { level: envelope.level, headline: envelope.headline, time_away: envelope.timeAway },
    evidence: evidence.map((p) => ({ id: p.id, source: p.cite.short, text: p.text })),
  });

  let res = await withTimeout(callGemini({ system: SYSTEM, user, maxTokens: 700, temperature: 0.2 }), AI_TIMEOUT_MS);
  if (!res.ok && /^gemini_5/.test(String(res.error || ''))) {
    // One retry on transient overload (5xx fails fast); timeouts are NOT
    // retried — the total budget must stay inside the client's request window.
    await new Promise((r) => setTimeout(r, 800));
    res = await withTimeout(callGemini({ system: SYSTEM, user, maxTokens: 700, temperature: 0.2 }), AI_TIMEOUT_MS);
  }
  if (!res.ok) return deterministic('deterministic_fallback');

  const parsed = parseJsonLoose(res.text);
  const level = parsed && typeof parsed.level === 'string' ? parsed.level : null;
  const citedIds = Array.isArray(parsed?.cite) ? parsed.cite.filter((id) => evidence.some((p) => p.id === id)) : [];

  const valid =
    parsed
    && level in RESTRICTIVENESS
    && RESTRICTIVENESS[level] >= RESTRICTIVENESS[envelope.level]   // never less cautious
    && citedIds.length > 0                                          // must be grounded
    && typeof parsed.headline === 'string' && parsed.headline.length > 0 && parsed.headline.length <= 120
    && typeof parsed.detail === 'string' && parsed.detail.length > 0 && parsed.detail.length <= 900
    && typeof parsed.time_away === 'string' && parsed.time_away.length > 0 && parsed.time_away.length <= 120;

  if (!valid) return deterministic('deterministic_fallback');

  return {
    level,
    headline: parsed.headline,
    detail: parsed.detail,
    timeAway: parsed.time_away,
    painRule: envelope.painRule, // the pain-monitoring rule stays deterministic
    grounding: 'ai_evidence',
    citations: evidence.filter((p) => citedIds.includes(p.id)).map((p) => ({ id: p.id, ...p.cite })),
  };
}
