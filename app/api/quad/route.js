/**
 * app/api/quad/route.js
 * ---------------------------------------------------------------------------
 * Single server entry for the quad engine. runQuad() is pure (no fs), but is
 * kept server-side to mirror the RF route and keep the engine off the client
 * bundle. The client (RecoveryContext) POSTs a mapped quad input and gets the
 * structured quad output back.
 * ---------------------------------------------------------------------------
 */

import { runQuad } from '../../../lib/clinical/quadEngine/index.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const quadInput = body && body.quadInput ? body.quadInput : body;
    if (!quadInput || typeof quadInput !== 'object') {
      return Response.json({ ok: false, error: 'Missing quadInput' }, { status: 400 });
    }
    const output = runQuad(quadInput);
    return Response.json({ ok: true, output });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message ? err.message : err) }, { status: 500 });
  }
}
