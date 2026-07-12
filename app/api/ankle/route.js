/**
 * app/api/ankle/route.js
 * ---------------------------------------------------------------------------
 * Single server entry for the ankle engine. runAnkle() is pure (no fs), but
 * is kept server-side to mirror the quad/knee routes and keep the engine off
 * the client bundle. The client (RecoveryContext) POSTs a mapped ankle input
 * and gets the structured ankle output back.
 *
 * If a GEMINI_API_KEY is configured, the current stage's sessions are
 * composed by Gemini from the SAME clinically-vetted exercise pool the
 * deterministic engine already selected from — optionally steered by a
 * free-text `userComment`. Without a key, or on any failure/invalid
 * response, the exact deterministic plan is used.
 * ---------------------------------------------------------------------------
 */

import { runAnkle } from '../../../lib/clinical/ankleEngine/index.mjs';
import { BETA_META } from '../../../lib/clinical/ankleEngine/types.mjs';
import { composeSessions } from '../../../lib/clinical/core/aiSessionComposer.mjs';
import { hasGeminiKey } from '../../../lib/rag/generate/gemini.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const ankleInput = body && body.ankleInput ? body.ankleInput : body;
    const userComment = typeof body?.userComment === 'string' ? body.userComment.slice(0, 500) : '';
    if (!ankleInput || typeof ankleInput !== 'object') {
      return Response.json({ ok: false, error: 'Missing ankleInput' }, { status: 400 });
    }
    const output = runAnkle(ankleInput);

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
        injuryLabel: 'ankle sprain / instability',
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
