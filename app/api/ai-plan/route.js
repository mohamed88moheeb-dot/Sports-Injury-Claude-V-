/**
 * app/api/ai-plan/route.js
 * ---------------------------------------------------------------------------
 * The universal AI-first planning endpoint. Every assessment — for ANY body
 * region — is assessed and planned by the LLM (aiPlanner), which uses the
 * knowledge base as optional reference and reasons beyond it where needed.
 * There is no deterministic fallback plan: if the model is unavailable the
 * route returns ok:false and the client shows an honest "AI unavailable"
 * state.
 * ---------------------------------------------------------------------------
 */

import { runAiPlan } from '../../../lib/clinical/ai/aiPlanner.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// AI-first plan generation is a longer call than the old deterministic path.
// Allow up to 60s (honoured on Vercel Pro/Enterprise; Hobby caps at 10s).
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const assessment = body && body.assessment ? body.assessment : body;
    if (!assessment || typeof assessment !== 'object') {
      return Response.json({ ok: false, error: 'invalid_assessment' }, { status: 400 });
    }
    const result = await runAiPlan(assessment);
    if (!result.ok) {
      // 503: the AI (not the request) is unavailable — the client shows a
      // "try again" state rather than a canned plan.
      return Response.json({ ok: false, error: result.error, detail: result.detail || null }, { status: 503 });
    }
    return Response.json({ ok: true, profile: result.profile, model: result.model });
  } catch (err) {
    return Response.json({ ok: false, error: 'server_error', detail: String(err?.message || err) }, { status: 500 });
  }
}
