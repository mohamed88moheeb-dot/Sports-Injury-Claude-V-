/**
 * app/api/rf-beta/route.js
 * ---------------------------------------------------------------------------
 * Single server entry for the RF beta engine. runRfBeta() reads governed RF
 * knowledge via node:fs, so it must run server-side (Node runtime). The client
 * (RecoveryContext) POSTs a mapped rfAssessmentInput and gets the structured
 * RF beta output back. No UI, no provider, no Supabase.
 *
 * Not under lib/clinical → does not affect the RF quarantine boundary check.
 * ---------------------------------------------------------------------------
 */

import { runRfBeta } from '../../../lib/clinical/rfBetaEngine/index.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const rfInput = body && body.rfInput ? body.rfInput : body;
    if (!rfInput || typeof rfInput !== 'object') {
      return Response.json({ ok: false, error: 'Missing rfInput' }, { status: 400 });
    }
    const output = runRfBeta(rfInput);
    return Response.json({ ok: true, output });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message ? err.message : err) }, { status: 500 });
  }
}
