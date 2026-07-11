/**
 * lib/rag/retrieve/bm25.mjs
 * ---------------------------------------------------------------------------
 * Sparse retrieval signal: Okapi BM25 over the chunk corpus. BM25 is the
 * lexical workhorse of information retrieval — it rewards exact term overlap
 * with saturation (k1) and length normalisation (b), which complements the
 * TF-IDF cosine signal. The hybrid retriever fuses the two rankings.
 * Pure JS, self-contained, deterministic.
 * ---------------------------------------------------------------------------
 */

import { tokenize } from '../ingest/textUtils.mjs';

export class BM25 {
  constructor({ k1 = 1.5, b = 0.75 } = {}) {
    this.k1 = k1; this.b = b;
    this.docs = [];        // token arrays
    this.df = new Map();   // term -> doc frequency
    this.idf = new Map();
    this.avgdl = 0;
    this.N = 0;
  }

  fit(texts) {
    this.docs = texts.map((t) => tokenize(t));
    this.N = this.docs.length;
    this.df = new Map();
    let totalLen = 0;
    for (const toks of this.docs) {
      totalLen += toks.length;
      for (const t of new Set(toks)) this.df.set(t, (this.df.get(t) || 0) + 1);
    }
    this.avgdl = totalLen / (this.N || 1);
    this.idf = new Map();
    for (const [t, df] of this.df) {
      // Okapi IDF with +1 to keep it non-negative for common terms.
      this.idf.set(t, Math.log(1 + (this.N - df + 0.5) / (df + 0.5)));
    }
    // Precompute per-doc term frequencies for scoring speed.
    this._tf = this.docs.map((toks) => {
      const m = new Map();
      for (const t of toks) m.set(t, (m.get(t) || 0) + 1);
      return { tf: m, len: toks.length };
    });
    return this;
  }

  /** Score every doc against the query; returns [{index, score}] sorted desc. */
  search(queryText, topK = 20) {
    const q = tokenize(queryText);
    const scores = new Array(this.N).fill(0);
    for (const term of q) {
      const idf = this.idf.get(term);
      if (!idf) continue;
      for (let i = 0; i < this.N; i++) {
        const { tf, len } = this._tf[i];
        const f = tf.get(term);
        if (!f) continue;
        const denom = f + this.k1 * (1 - this.b + this.b * (len / this.avgdl));
        scores[i] += idf * ((f * (this.k1 + 1)) / denom);
      }
    }
    return scores
      .map((score, index) => ({ index, score }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  dump() {
    return {
      k1: this.k1, b: this.b, N: this.N, avgdl: this.avgdl,
      idf: Object.fromEntries(this.idf),
      tf: this._tf.map(({ tf, len }) => ({ tf: Object.fromEntries(tf), len })),
    };
  }

  static load(d) {
    const m = new BM25({ k1: d.k1, b: d.b });
    m.N = d.N; m.avgdl = d.avgdl;
    m.idf = new Map(Object.entries(d.idf));
    m._tf = d.tf.map(({ tf, len }) => ({ tf: new Map(Object.entries(tf)), len }));
    return m;
  }
}
