/**
 * app/api/it-band/route.js
 * ---------------------------------------------------------------------------
 * Single server entry for the IT band engine. Mirrors app/api/glute/route.js.
 * ---------------------------------------------------------------------------
 */

import { runItBand } from '../../../lib/clinical/itBandEngine/index.mjs';
import { BETA_META } from '../../../lib/clinical/itBandEngine/types.mjs';
import { composeSessions } from '../../../lib/clinical/core/aiSessionComposer.mjs';
import { hasGeminiKey } from '../../../lib/rag/generate/gemini.mjs';
import { groundSportParticipation } from '../../../lib/clinical/core/aiParticipation.mjs';
import { deriveEnvelopeFromSharedOutput } from '../../../lib/clinical/core/sportParticipation.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const itBandInput = body && body.itBandInput ? body.itBandInput : body;
    const userComment = typeof body?.userComment === 'string' ? body.userComment.slice(0, 500) : '';
    if (!itBandInput || typeof itBandInput !== 'object') {
      return Response.json({ ok: false, error: 'Missing itBandInput' }, { status: 400 });
    }
    const output = runItBand(itBandInput);

    // Evidence-grounded sport-participation conclusion: the AI reasons over
    // curated literature passages; the deterministic envelope is its safety
    // guardrail (it may only be MORE cautious) and the fallback on failure.
    // Started BEFORE the session composer so the two Gemini calls run in
    // parallel and the route stays inside the client request window.
    const sevForRts = output.diagnosis?.severity || output.diagnosis?.assessment || {};
    const sportParticipationPromise = groundSportParticipation({
      envelope: deriveEnvelopeFromSharedOutput(output),
      region: 'it band knee tendon',
      caseSummary: {
        entity: output.entity,
        grade: sevForRts.grade || null,
        irritability: sevForRts.irritability || null,
        band: sevForRts.band || null,
        prognosis: sevForRts.prognosis || null,
        days_since_injury: output.input?.days_since_injury ?? null,
        sport: output.input?.sport_context || null,
        plan_total_weeks: output.plan?.total_estimated_weeks ?? null,
      },
    });

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
        injuryLabel: 'iliotibial band syndrome (ITBS)',
        betaMeta: BETA_META,
      });
      stages[curIdx] = { ...cur, weeks: [{ ...cur.weeks[0], sessions: composed.sessions }, ...cur.weeks.slice(1)] };
      ai_mode = composed.mode;
      out_of_scope_note = composed.out_of_scope_note || null;
    }

    output.sport_participation = await sportParticipationPromise;



    return Response.json({ ok: true, output, ai_enabled: hasGeminiKey(), ai_mode, out_of_scope_note });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message ? err.message : err) }, { status: 500 });
  }
}
