/**
 * app/api/knee/route.js
 * ---------------------------------------------------------------------------
 * Single server entry for the knee engine. runKnee() is pure (no fs) but kept
 * server-side to mirror the RF/quad routes and keep the engine off the client
 * bundle. The client (RecoveryContext) POSTs a mapped knee input and gets the
 * structured knee output back.
 * ---------------------------------------------------------------------------
 */

import { runKnee } from '../../../lib/clinical/kneeEngine/index.mjs';
import { deriveKneeParticipationEnvelope } from '../../../lib/clinical/kneeEngine/appAdapter/kneeOutputToProfile.mjs';
import { groundSportParticipation } from '../../../lib/clinical/core/aiParticipation.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const kneeInput = body && body.kneeInput ? body.kneeInput : body;
    if (!kneeInput || typeof kneeInput !== 'object') {
      return Response.json({ ok: false, error: 'Missing kneeInput' }, { status: 400 });
    }
    const output = runKnee(kneeInput);
    // Evidence-grounded sport-participation conclusion (AI reasons over the
    // curated literature; deterministic envelope as guardrail + fallback).
    output.sport_participation = await groundSportParticipation({
      envelope: deriveKneeParticipationEnvelope(output),
      region: 'knee acl knee_ligament',
      caseSummary: {
        entity: output.entity,
        band: output.severity_band || output.diagnosis?.band || null,
        laxity_grade: output.input?.laxity_grade ?? null,
        days_since_injury: output.input?.days_since_injury ?? null,
        plan_total_weeks: output.plan?.total_estimated_weeks ?? null,
      },
    });

    return Response.json({ ok: true, output });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message ? err.message : err) }, { status: 500 });
  }
}
