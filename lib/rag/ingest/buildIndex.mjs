/**
 * lib/rag/ingest/buildIndex.mjs
 * ---------------------------------------------------------------------------
 * Ingestion: corpus.json -> chunked, embedded, BM25-indexed artifact.
 *
 *   documents -> sentence-aware chunks -> TF-IDF fit (dense) + BM25 fit (sparse)
 *   -> self-contained index JSON (no re-fit needed at query time).
 *
 * The index bundles the fitted IDF and BM25 statistics so the retriever loads
 * and runs with zero recomputation — important for serverless cold starts.
 * ---------------------------------------------------------------------------
 */

import { chunkText } from './textUtils.mjs';
import { TfidfEmbedder } from '../retrieve/vectorSpace.mjs';
import { BM25 } from '../retrieve/bm25.mjs';

/**
 * @param {object} corpus  parsed corpus.json ({ meta, documents: [...] })
 * @returns {object} index artifact
 */
export function buildIndex(corpus) {
  const documents = corpus.documents || [];
  const docs = {};             // docId -> metadata
  const chunks = [];           // { id, docId, text }

  for (const d of documents) {
    docs[d.id] = {
      id: d.id, title: d.title, authors: d.authors, year: d.year,
      journal: d.journal, pmid: d.pmid, pmid_status: d.pmid_status,
      url: d.url, study_design: d.study_design, citations: d.citations,
      topics: d.topics || [],
    };
    // Index the title + abstract; title repeated to give it lexical weight.
    const body = `${d.title}. ${d.title}. ${d.abstract || ''}`;
    const parts = chunkText(body, { maxChars: 480, overlapSentences: 1 });
    parts.forEach((text, i) => chunks.push({ id: `${d.id}::${i}`, docId: d.id, text }));
  }

  const texts = chunks.map((c) => c.text);
  const embedder = new TfidfEmbedder();
  const vectors = embedder.fit(texts);
  vectors.forEach((v, i) => { chunks[i].vector = v; });

  const bm25 = new BM25().fit(texts);

  return {
    meta: { ...corpus.meta, built_at: new Date().toISOString(), n_docs: documents.length, n_chunks: chunks.length },
    docs,
    chunks,
    embedder: embedder.dump(),
    bm25: bm25.dump(),
  };
}
