/**
 * app/api/groin/route.js
 * ---------------------------------------------------------------------------
 * Single server entry for the adductor/groin engine. Mirrors app/api/calf/route.js.
 * ---------------------------------------------------------------------------
 */

import { runGroin } from '../../../lib/clinical/groinEngine/index.mjs';
import { BETA_META } from '../../../lib/clinical/groinEngine/types.mjs';
import { composeSessions } from '../../../lib/clinical/core/aiSessionComposer.mjs';
import { hasGeminiKey } from '../../../lib/rag/generate/gemini.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const groinInput = body && body.groinInput ? body.groinInput : body;
    const userComment = typeof body?.userComment === 'string' ? body.userComment.slice(0, 500) : '';
    if (!groinInput || typeof groinInput !== 'object') {
      return Response.json({ ok: false, error: 'Missing groinInput' }, { status: 400 });
    }
    const output = runGroin(groinInput);

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
        injuryLabel: 'adductor / groin',
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
