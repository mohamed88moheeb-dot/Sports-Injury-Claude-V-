/**
 * app/api/quad/route.js
 * ---------------------------------------------------------------------------
 * Single server entry for the quad engine. runQuad() is pure (no fs), but is
 * kept server-side to mirror the RF route and keep the engine off the client
 * bundle. The client (RecoveryContext) POSTs a mapped quad input and gets the
 * structured quad output back.
 *
 * If a GEMINI_API_KEY is configured, the current stage's sessions are
 * composed by Gemini from the SAME clinically-vetted exercise pool the
 * deterministic engine already selected from (never a free-standing
 * generation) — optionally steered by a free-text `userComment` (equipment
 * limits, a focus request, a mention of a different injury). Without a key,
 * or on any failure/invalid response, the exact deterministic plan is used —
 * this call can never make the plan worse or unsafe, only more varied.
 * ---------------------------------------------------------------------------
 */

import { runQuad } from '../../../lib/clinical/quadEngine/index.mjs';
import { BETA_META } from '../../../lib/clinical/quadEngine/types.mjs';
import { composeSessions } from '../../../lib/clinical/core/aiSessionComposer.mjs';
import { hasGeminiKey } from '../../../lib/rag/generate/gemini.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const quadInput = body && body.quadInput ? body.quadInput : body;
    const userComment = typeof body?.userComment === 'string' ? body.userComment.slice(0, 500) : '';
    if (!quadInput || typeof quadInput !== 'object') {
      return Response.json({ ok: false, error: 'Missing quadInput' }, { status: 400 });
    }
    const output = runQuad(quadInput);

    // Post-process the current stage's sessions through the AI composer
    // (falls straight through to the identical deterministic result if no
    // key is set — see composeSessions).
    const stages = output.plan?.stages || [];
    const curIdx = stages.findIndex((s) => s.is_current);
    let ai_mode = 'deterministic';
    let out_of_scope_note = null;
    if (curIdx !== -1 && stages[curIdx].current_stage_pool) {
      const cur = stages[curIdx];
      const composed = await composeSessions({
        pool: cur.current_stage_pool,
        stage: { id: cur.stage_id, clinical_name: cur.stage_name, friendly_name: cur.friendly_name },
        policy: cur.current_stage_policy || {},
        userComment,
        injuryLabel: 'quad/patellar',
        betaMeta: BETA_META,
      });
      stages[curIdx] = { ...cur, sessions: composed.sessions };
      ai_mode = composed.mode;
      out_of_scope_note = composed.out_of_scope_note || null;
    }

    return Response.json({ ok: true, output, ai_enabled: hasGeminiKey(), ai_mode, out_of_scope_note });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message ? err.message : err) }, { status: 500 });
  }
}
