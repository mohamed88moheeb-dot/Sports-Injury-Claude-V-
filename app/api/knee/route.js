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
    return Response.json({ ok: true, output });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message ? err.message : err) }, { status: 500 });
  }
}
