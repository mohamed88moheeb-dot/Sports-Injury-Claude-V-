/**
 * lib/rag/retrieve/vectorSpace.mjs
 * ---------------------------------------------------------------------------
 * Dense-ish retrieval signal: a TF-IDF vector space over the corpus with
 * cosine similarity. This is the "embedding" layer of the hybrid retriever.
 *
 * Why TF-IDF rather than a transformer model here: the sandbox blocks model
 * downloads (HuggingFace 403) and we want the prototype to run with zero
 * external dependencies. The Embedder interface below is deliberately
 * pluggable — swap `TfidfEmbedder` for an `ApiEmbedder` (Voyage/OpenAI) or a
 * bundled transformer in an environment that allows it, and nothing else in
 * the pipeline changes.
 * ---------------------------------------------------------------------------
 */

import { tokenize } from '../ingest/textUtils.mjs';

/** Build IDF weights from a tokenised corpus (array of token arrays). */
function computeIdf(docTokens) {
  const df = new Map();
  const N = docTokens.length;
  for (const toks of docTokens) {
    for (const t of new Set(toks)) df.set(t, (df.get(t) || 0) + 1);
  }
  const idf = new Map();
  for (const [t, d] of df) idf.set(t, Math.log((N + 1) / (d + 0.5)) + 1);
  return idf;
}

function tfidfVector(tokens, idf) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  const vec = new Map();
  let norm = 0;
  for (const [t, c] of tf) {
    const w = (1 + Math.log(c)) * (idf.get(t) || 0);
    if (w !== 0) { vec.set(t, w); norm += w * w; }
  }
  norm = Math.sqrt(norm) || 1;
  for (const [t, w] of vec) vec.set(t, w / norm);
  return vec;
}

function cosine(a, b) {
  // Iterate the smaller map for speed; vectors are already L2-normalised.
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [t, w] of small) {
    const w2 = large.get(t);
    if (w2) dot += w * w2;
  }
  return dot;
}

export class TfidfEmbedder {
  constructor() { this.idf = null; this.kind = 'tfidf'; }

  /** Fit IDF on the chunk texts; returns per-chunk sparse vectors (as objects). */
  fit(texts) {
    const docTokens = texts.map((t) => tokenize(t));
    this.idf = computeIdf(docTokens);
    return docTokens.map((toks) => this._serialise(tfidfVector(toks, this.idf)));
  }

  /** Embed a single query/text into the fitted space. */
  embed(text) {
    if (!this.idf) throw new Error('TfidfEmbedder.embed called before fit/load');
    return this._serialise(tfidfVector(tokenize(text), this.idf));
  }

  /** Serialise a Map vector to a plain object for JSON storage. */
  _serialise(vecMap) {
    const obj = {};
    for (const [t, w] of vecMap) obj[t] = Number(w.toFixed(5));
    return obj;
  }

  /** Cosine between two serialised (object) vectors. */
  static similarity(vA, vB) {
    return cosine(new Map(Object.entries(vA)), new Map(Object.entries(vB)));
  }

  /** Export/restore IDF so the index is fully self-contained (no re-fit needed). */
  dump() { return { kind: this.kind, idf: Object.fromEntries(this.idf) }; }
  static load(dumped) {
    const e = new TfidfEmbedder();
    e.idf = new Map(Object.entries(dumped.idf || {}));
    return e;
  }
}
