/**
 * scripts/rag/build-index.mjs
 * Build the hamstring RAG index from corpus.json and write it to lib/rag/index/.
 * Run: node scripts/rag/build-index.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildIndex } from '../../lib/rag/ingest/buildIndex.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

const corpusPath = join(root, 'lib/rag/corpus/hamstring/corpus.json');
const outDir = join(root, 'lib/rag/index');
const outPath = join(outDir, 'hamstring.index.json');

const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
const index = buildIndex(corpus);

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(index));

console.log(`✓ Built index: ${index.meta.n_docs} docs -> ${index.meta.n_chunks} chunks`);
console.log(`  vocab (idf terms): ${Object.keys(index.embedder.idf).length}`);
console.log(`  written: ${outPath} (${(JSON.stringify(index).length / 1024).toFixed(0)} kB)`);
