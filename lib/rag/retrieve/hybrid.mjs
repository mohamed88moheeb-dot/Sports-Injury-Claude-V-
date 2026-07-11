/**
 * lib/rag/retrieve/hybrid.mjs
 * ---------------------------------------------------------------------------
 * The retriever. Combines three signals into one ranked evidence set:
 *
 *   1. DENSE  — TF-IDF cosine similarity (semantic-ish term weighting)
 *   2. SPARSE — BM25 (exact lexical overlap with saturation + length norm)
 *   3. PRIOR  — evidence-strength: study design tier × recency × citation weight
 *
 * Dense and sparse rankings are fused with Reciprocal Rank Fusion (RRF), which
 * is rank-based and therefore robust to the two scores living on different
 * scales. The evidence prior then re-weights fused results so that, all else
 * equal, a 2020 RCT outranks a 2005 case series on the same passage. Every
 * returned passage carries its component scores for full provenance in the UI.
 * ---------------------------------------------------------------------------
 */

import { TfidfEmbedder } from './vectorSpace.mjs';
import { BM25 } from './bm25.mjs';
import { expandQuery } from '../ingest/textUtils.mjs';

// Study-design → evidence tier weight (higher = stronger design).
export const DESIGN_WEIGHT = {
  'systematic-review': 1.00, 'meta-analysis': 1.00,
  rct: 0.92, 'randomised-controlled-trial': 0.92,
  cohort: 0.78, 'prospective-cohort': 0.80,
  'case-control': 0.70, 'cross-sectional': 0.62,
  'clinical-commentary': 0.66, 'narrative-review': 0.58,
  'consensus-statement': 0.88, 'case-series': 0.50, 'case-report': 0.40,
  unknown: 0.60,
};

function recencyWeight(year, nowYear = new Date().getFullYear()) {
  if (!year) return 0.7;
  const age = Math.max(0, nowYear - year);
  // Half-life ~12y: recent evidence favoured but classics never zeroed out.
  return 0.55 + 0.45 * Math.exp(-age / 12);
}

function citationWeight(citations) {
  if (!citations || citations < 0) return 0.7;
  // Diminishing returns; a landmark paper gets a modest, capped boost.
  return 0.7 + 0.3 * Math.tanh(citations / 400);
}

/** Combined evidence prior in [0..~1] for a source document. */
export function evidencePrior(meta = {}) {
  const design = DESIGN_WEIGHT[(meta.study_design || 'unknown').toLowerCase()] ?? DESIGN_WEIGHT.unknown;
  return design * recencyWeight(meta.year) * citationWeight(meta.citations);
}

export class HybridRetriever {
  /**
   * @param {object} index  output of buildIndex: { chunks:[{id,text,vector,docId}], docs:{}, embedder, bm25 }
   */
  constructor(index) {
    this.chunks = index.chunks;
    this.docs = index.docs;
    this.embedder = index.embedder instanceof TfidfEmbedder ? index.embedder : TfidfEmbedder.load(index.embedder);
    this.bm25 = index.bm25 instanceof BM25 ? index.bm25 : BM25.load(index.bm25);
  }

  /**
   * @param {string} queryText
   * @param {object} opts { topK, rrfK, priorWeight, perDocCap }
   * @returns {Array} ranked passages with score provenance
   */
  retrieve(queryText, { topK = 8, rrfK = 60, priorWeight = 0.25, perDocCap = 2 } = {}) {
    const q = expandQuery(queryText);

    // --- dense ranking (cosine) ---
    const qVec = this.embedder.embed(q);
    const dense = this.chunks
      .map((c, index) => ({ index, score: TfidfEmbedder.similarity(qVec, c.vector) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // --- sparse ranking (bm25) ---
    const sparse = this.bm25.search(q, Math.max(40, topK * 5));

    // --- reciprocal rank fusion ---
    const rrf = new Map(); // chunkIndex -> fused score
    const denseRank = new Map(dense.map((r, i) => [r.index, i]));
    const sparseRank = new Map(sparse.map((r, i) => [r.index, i]));
    const universe = new Set([...denseRank.keys(), ...sparseRank.keys()]);
    for (const idx of universe) {
      let s = 0;
      if (denseRank.has(idx)) s += 1 / (rrfK + denseRank.get(idx));
      if (sparseRank.has(idx)) s += 1 / (rrfK + sparseRank.get(idx));
      rrf.set(idx, s);
    }

    // --- evidence-prior re-weighting + provenance assembly ---
    const maxRrf = Math.max(...rrf.values(), 1e-9);
    const denseScoreByIdx = new Map(dense.map((r) => [r.index, r.score]));
    const sparseScoreByIdx = new Map(sparse.map((r) => [r.index, r.score]));

    let ranked = [...rrf.entries()].map(([idx, fused]) => {
      const chunk = this.chunks[idx];
      const doc = this.docs[chunk.docId] || {};
      const prior = evidencePrior(doc);
      const fusedN = fused / maxRrf;
      // Relevance-dominant scoring: the evidence prior is a MULTIPLICATIVE nudge
      // gated by relevance, so a strong study design can break ties but can
      // never float an off-topic passage above a clearly relevant one. The
      // prior scales the fused relevance within [1-priorWeight .. 1].
      const priorFactor = (1 - priorWeight) + priorWeight * prior;
      const final = fusedN * priorFactor;
      return {
        chunkId: chunk.id, docId: chunk.docId, text: chunk.text,
        source: {
          title: doc.title, authors: doc.authors, year: doc.year,
          journal: doc.journal, pmid: doc.pmid, url: doc.url,
          study_design: doc.study_design, citations: doc.citations,
        },
        scores: {
          dense: +(denseScoreByIdx.get(idx) || 0).toFixed(4),
          bm25: +(sparseScoreByIdx.get(idx) || 0).toFixed(3),
          rrf: +fusedN.toFixed(4),
          evidence_prior: +prior.toFixed(3),
          final: +final.toFixed(4),
        },
      };
    }).sort((a, b) => b.scores.final - a.scores.final);

    // --- diversity: cap passages per source so one paper can't dominate ---
    const perDoc = new Map();
    ranked = ranked.filter((r) => {
      const n = perDoc.get(r.docId) || 0;
      if (n >= perDocCap) return false;
      perDoc.set(r.docId, n + 1);
      return true;
    });

    const results = ranked.slice(0, topK);
    return {
      query: queryText,
      expanded_query: q,
      results,
      retrieval_confidence: this._confidence(results),
    };
  }

  /**
   * Retrieval confidence: a 0..1 signal combining top-result strength, the
   * agreement between dense & sparse, and how many distinct sources back the
   * answer. Surfaced in the UI so the clinician sees how well-supported it is.
   */
  _confidence(results) {
    if (!results.length) return { score: 0, label: 'no evidence found', distinct_sources: 0 };
    const top = results[0].scores.final;
    const distinct = new Set(results.map((r) => r.docId)).size;
    const agreement = results.filter((r) => r.scores.dense > 0 && r.scores.bm25 > 0).length / results.length;
    const score = Math.min(1, 0.5 * top + 0.3 * agreement + 0.2 * Math.min(1, distinct / 4));
    const label = score >= 0.66 ? 'well-supported' : score >= 0.4 ? 'moderately supported' : 'limited evidence';
    return { score: +score.toFixed(3), label, distinct_sources: distinct, dense_sparse_agreement: +agreement.toFixed(2) };
  }
}
