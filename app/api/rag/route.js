/**
 * app/api/rag/route.js
 * ---------------------------------------------------------------------------
 * RAG prototype endpoint. POST an assessment -> retrieval + grounded plan.
 * Loads the prebuilt hamstring index from disk once (module scope) and reuses
 * it across invocations. Node runtime + force-dynamic (filesystem + fetch).
 * ---------------------------------------------------------------------------
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runHamstringRag } from '../../../lib/rag/pipeline.mjs';
import { hasAnthropicKey } from '../../../lib/rag/generate/anthropic.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let _index = null;
function loadIndex() {
  if (!_index) {
    const p = join(process.cwd(), 'lib/rag/index/hamstring.index.json');
    _index = JSON.parse(readFileSync(p, 'utf8'));
  }
  return _index;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const assessment = body.assessment || {};
    const index = loadIndex();
    const result = await runHamstringRag(assessment, index);
    return Response.json({ ok: true, ai_enabled: hasAnthropicKey(), result });
  } catch (e) {
    return Response.json({ ok: false, error: String(e && e.message || e) }, { status: 500 });
  }
}

export async function GET() {
  const index = loadIndex();
  return Response.json({
    ok: true,
    injury: 'hamstring_strain',
    ai_enabled: hasAnthropicKey(),
    corpus: { docs: index.meta.n_docs, chunks: index.meta.n_chunks, built_at: index.meta.built_at },
  });
}
