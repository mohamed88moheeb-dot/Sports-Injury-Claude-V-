/**
 * app/api/hamstring/route.js
 * ---------------------------------------------------------------------------
 * Hamstring engine endpoint. POST a normalized hamstring input -> diagnosis +
 * staged plan + retrieved evidence (+ optional AI refinement when keyed).
 * Loads the prebuilt hamstring RAG index once and reuses it.
 * ---------------------------------------------------------------------------
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runHamstring } from '../../../lib/clinical/hamstringEngine/index.mjs';
import { hasAnthropicKey } from '../../../lib/rag/generate/anthropic.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let _index = null;
function loadIndex() {
  if (_index === null) {
    try {
      const p = join(process.cwd(), 'lib/rag/index/hamstring.index.json');
      _index = JSON.parse(readFileSync(p, 'utf8'));
    } catch { _index = false; } // false = tried and unavailable
  }
  return _index || null;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = body.hamstringInput || {};
    const output = await runHamstring(input, { index: loadIndex(), useAI: true });
    return Response.json({ ok: true, ai_enabled: hasAnthropicKey(), output });
  } catch (e) {
    return Response.json({ ok: false, error: String(e && e.message || e) }, { status: 500 });
  }
}
