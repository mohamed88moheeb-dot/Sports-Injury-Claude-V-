/**
 * lib/rag/pipeline.mjs
 * ---------------------------------------------------------------------------
 * The RAG orchestrator: assessment -> per-section retrieval -> grounded plan.
 *
 *   1. Build per-section sub-queries from the assessment.
 *   2. Retrieve an evidence set for each section with the hybrid retriever.
 *   3. Compose a citation-grounded plan (AI if a key is present, else draft).
 *   4. Return the plan plus full retrieval provenance and the evidence base,
 *      so the UI can show exactly what evidence produced each recommendation.
 * ---------------------------------------------------------------------------
 */

import { HybridRetriever } from './retrieve/hybrid.mjs';
import { buildSubQueries, clinicalSummary } from './generate/assessmentModel.mjs';
import { composePlan } from './generate/composePlan.mjs';

let _retriever = null;
/** Lazily construct the retriever from a preloaded index object (cached). */
export function getRetriever(index) {
  if (!_retriever) _retriever = new HybridRetriever(index);
  return _retriever;
}

export async function runHamstringRag(assessment, index, { perSection = 4 } = {}) {
  const retriever = getRetriever(index);
  const subQueries = buildSubQueries(assessment);

  const sections = {};
  const retrieval = {};
  for (const [section, q] of Object.entries(subQueries)) {
    const out = retriever.retrieve(q, { topK: perSection });
    sections[section] = out.results;
    retrieval[section] = {
      query: q,
      confidence: out.retrieval_confidence,
      hits: out.results.map((h) => ({
        chunkId: h.chunkId, source: h.source, scores: h.scores,
        snippet: h.text.slice(0, 220),
      })),
    };
  }

  const composed = await composePlan({ assessment, sections });

  // Assemble the distinct evidence base actually used.
  const evidenceBase = [];
  const seen = new Set();
  for (const hits of Object.values(sections)) {
    for (const h of hits) {
      if (seen.has(h.docId)) continue;
      seen.add(h.docId);
      evidenceBase.push({
        id: h.docId, ...h.source,
        used_in: Object.entries(sections).filter(([, hs]) => hs.some((x) => x.docId === h.docId)).map(([s]) => s),
      });
    }
  }

  // Aggregate retrieval confidence across sections.
  const confs = Object.values(retrieval).map((r) => r.confidence.score);
  const avgConf = confs.reduce((a, b) => a + b, 0) / (confs.length || 1);

  return {
    injury: 'hamstring_strain',
    patient_summary: clinicalSummary(assessment),
    mode: composed.mode,
    model: composed.model || null,
    plan: composed.plan,
    cautions: composed.cautions,
    retrieval,
    evidence_base: evidenceBase,
    overall_confidence: {
      score: +avgConf.toFixed(3),
      label: avgConf >= 0.66 ? 'well-supported' : avgConf >= 0.4 ? 'moderately supported' : 'limited evidence',
      distinct_sources: evidenceBase.length,
    },
    generated_at: new Date().toISOString(),
    disclaimer: 'Prototype: RAG-generated, not clinically reviewed. For internal experimentation only.',
  };
}
