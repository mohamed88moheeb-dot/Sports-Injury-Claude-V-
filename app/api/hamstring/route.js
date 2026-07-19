/**
 * app/api/hamstring/route.js
 * ---------------------------------------------------------------------------
 * Hamstring engine endpoint. POST a normalized hamstring input -> diagnosis +
 * staged plan + retrieved evidence (+ optional AI refinement when keyed).
 *
 * The RAG index is a STATIC import (not fs.readFileSync at runtime). Reading
 * a JSON file via fs at request time is a known Vercel/Next.js failure mode:
 * output file tracing may not bundle a file that's only touched dynamically,
 * so it can work in `next start` locally and silently 404/throw in the
 * deployed serverless function — which would make this whole engine fall back
 * to the legacy generic builder with no visible error. A static import is
 * guaranteed to be bundled because Next.js sees it at build time.
 * ---------------------------------------------------------------------------
 */

import hamstringIndex from '../../../lib/rag/index/hamstring.index.json';
import { runHamstring } from '../../../lib/clinical/hamstringEngine/index.mjs';
import { hasAnthropicKey } from '../../../lib/rag/generate/anthropic.mjs';
import { deriveHamstringParticipationEnvelope } from '../../../lib/clinical/hamstringEngine/appAdapter/hamstringOutputToProfile.mjs';
import { groundSportParticipation } from '../../../lib/clinical/core/aiParticipation.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = body.hamstringInput || {};
    const output = await runHamstring(input, { index: hamstringIndex, useAI: true });
    // Evidence-grounded sport-participation conclusion (AI reasons over the
    // curated literature; deterministic envelope as guardrail + fallback).
    output.sport_participation = await groundSportParticipation({
      envelope: deriveHamstringParticipationEnvelope(output),
      region: 'hamstring',
      caseSummary: {
        entity: output.diagnosis?.entity || null,
        band: output.diagnosis?.band || null,
        sport: output.input?.sport || null,
        weeks_since: output.input?.weeks_since || null,
        plan_total_weeks: output.plan?.total_estimated_weeks ?? null,
      },
    });

    return Response.json({ ok: true, ai_enabled: hasAnthropicKey(), output });
  } catch (e) {
    return Response.json({ ok: false, error: String(e && e.message || e) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    injury: 'hamstring_strain',
    ai_enabled: hasAnthropicKey(),
    corpus: { docs: hamstringIndex.meta.n_docs, chunks: hamstringIndex.meta.n_chunks, built_at: hamstringIndex.meta.built_at },
  });
}
