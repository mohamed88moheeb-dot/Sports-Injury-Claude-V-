/**
 * scripts/rag/fetchLiterature.mjs
 * ---------------------------------------------------------------------------
 * Corpus refresh contract. The research connectors (PubMed / Consensus /
 * bioRxiv) are MCP tools available to the agent, not to this Node process, so
 * the live pull is performed by the agent and the raw records are written to
 * scripts/rag/raw/<query>.json. This script NORMALISES those raw records into
 * the corpus document schema and merges them into corpus.json (de-duped by
 * PMID / title), after which `node scripts/rag/build-index.mjs` re-indexes.
 *
 * Usage: node scripts/rag/fetchLiterature.mjs
 * ---------------------------------------------------------------------------
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const rawDir = join(__dirname, 'raw');
const corpusPath = join(root, 'lib/rag/corpus/hamstring/corpus.json');

// Map a PubMed publication-type / Consensus study-type onto our design tiers.
function normDesign(s = '') {
  const t = s.toLowerCase();
  if (/systematic review/.test(t)) return 'systematic-review';
  if (/meta-analysis/.test(t)) return 'meta-analysis';
  if (/randomized|randomised|rct/.test(t)) return 'rct';
  if (/consensus/.test(t)) return 'consensus-statement';
  if (/cohort/.test(t)) return 'cohort';
  if (/case-control/.test(t)) return 'case-control';
  if (/cross-sectional/.test(t)) return 'cross-sectional';
  if (/review|commentary|perspective/.test(t)) return 'narrative-review';
  if (/case series/.test(t)) return 'case-series';
  if (/case report/.test(t)) return 'case-report';
  return 'unknown';
}

function slugId(rec) {
  const first = (rec.authors || 'anon').split(/,|\band\b/)[0].trim().split(/\s+/)[0].toUpperCase();
  return `HS-${first}-${rec.year || '0000'}`.replace(/[^A-Z0-9-]/g, '');
}

/** Normalise one raw connector record into a corpus document. */
export function normaliseRecord(rec) {
  return {
    id: rec.id || slugId(rec),
    pmid: rec.pmid || null,
    pmid_status: rec.pmid ? 'verified' : 'unverified',
    title: rec.title,
    authors: rec.authors,
    year: Number(rec.year) || null,
    journal: rec.journal || '',
    study_design: normDesign(rec.study_design || rec.publication_type || ''),
    citations: Number(rec.citations) || 0,
    url: rec.url || (rec.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${rec.pmid}/` : ''),
    topics: rec.topics || [],
    abstract: rec.abstract || '',
  };
}

function main() {
  if (!existsSync(rawDir)) { console.log('No raw/ directory — nothing to merge. Agent should write connector results to', rawDir); return; }
  const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
  const byKey = new Map(corpus.documents.map((d) => [(d.pmid || d.title).toLowerCase(), d]));
  let added = 0;
  for (const f of readdirSync(rawDir).filter((f) => f.endsWith('.json'))) {
    const records = JSON.parse(readFileSync(join(rawDir, f), 'utf8'));
    for (const rec of (Array.isArray(records) ? records : records.results || [])) {
      if (!rec.title || !rec.abstract) continue;
      const doc = normaliseRecord(rec);
      const key = (doc.pmid || doc.title).toLowerCase();
      if (byKey.has(key)) continue;
      byKey.set(key, doc); corpus.documents.push(doc); added++;
    }
  }
  writeFileSync(corpusPath, JSON.stringify(corpus, null, 2));
  console.log(`✓ Merged ${added} new document(s). Corpus now has ${corpus.documents.length}. Re-run build-index.mjs.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
