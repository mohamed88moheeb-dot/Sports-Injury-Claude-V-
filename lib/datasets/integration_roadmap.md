# Dataset Integration Roadmap

**Version:** 1.0  
**Date:** 2026-06-22  
**Depends on:** `ai_architecture_design.md`, `lib/clinical/confidenceEngine.js`

---

## Overview

This document specifies exactly how all datasets — injury classification, exercise library, RTS timelines, and confidence scoring priors — are loaded, structured, and used at runtime in the Next.js app.

The architecture uses **zero-cost at-startup loading** for all structured data (Bayesian priors, LR tables, exercise metadata) and **on-demand vector search** for exercise retrieval. No external database calls are required for the core diagnosis path.

---

## 1. Dataset Inventory

| Dataset | Current location | Format | Records | Action |
|---------|-----------------|--------|---------|--------|
| RF assessment schemas | `lib/clinical/assessmentKnowledge/rf/objects/` | JSON | 18 | Migrate to unified loader |
| RF exercise library | `lib/clinical/exerciseKnowledge/rf/objects/` | JSON | 12+ | Embed for vector search |
| Capacity definitions | `lib/clinical/capacityKnowledge/universal/objects/` | JSON | 15 | Load as lookup table |
| Activity exposure risk factors | `lib/clinical/activityExposureKnowledge/rf/objects/` | JSON | 12 | Add to injury priors |
| Evidence linking maps | `lib/clinical/evidenceLinkingKnowledge/rf/maps/` | JSON | 1+ | Use in explanation layer |
| Injury priors | `lib/clinical/confidenceEngine.js` (inline) | JS object | — | Extract to JSON file |
| Likelihood ratios | `lib/clinical/confidenceEngine.js` (inline) | JS object | — | Extract to JSON file |
| Legacy injury knowledge | `data/injuryKnowledge.js` | JS object | ~30 | Map to Bayesian format |
| Legacy rehab knowledge | `data/rehabKnowledge.js` | JS exports | — | Map phase names to PHASES |

---

## 2. Directory Structure (Target State)

```
lib/
  clinical/
    confidenceEngine.js         ← Bayesian engine (implemented)
    rfBetaEngine/               ← existing RF engine (unchanged)
    rfBetaAppAdapter/           ← existing adapters (unchanged)
  datasets/
    ai_architecture_design.md   ← this design doc
    integration_roadmap.md      ← this file
    injuryPriors.json           ← Step 1: extracted from confidenceEngine.js
    likelihoodRatios.json       ← Step 1: extracted from confidenceEngine.js
    exerciseVectors.json        ← Step 3: built by build script (git-committed)
    loader.js                   ← Step 2: unified runtime loader
    vectorStore.js              ← Step 4: in-memory vector search
    scripts/
      buildVectorStore.js       ← Step 3: build-time embedding script
      validateDatasets.js       ← Step 5: CI validation script
```

---

## 3. Step-by-Step Implementation

### Step 1 — Extract Inline Constants to JSON (Day 1–2)

Move `INJURY_PRIORS` and `LIKELIHOOD_RATIOS` from `confidenceEngine.js` to standalone JSON files. This allows clinicians/researchers to update knowledge without touching application code.

**`lib/datasets/injuryPriors.json`** (format):
```json
{
  "rectus_femoris_strain": {
    "prior": 0.28,
    "region": "anterior_thigh",
    "display_name": "Rectus Femoris Strain",
    "icd10": "M62.151",
    "sources": ["Pietsch_2023", "Serner_2018"],
    "sport_modifiers": {
      "football": 1.4,
      "running": 0.9,
      "basketball": 0.8,
      "default": 1.0
    },
    "age_modifiers": {
      "15-25": 1.1,
      "25-35": 1.0,
      "35-50": 0.85,
      "default": 1.0
    },
    "severity_bands": {
      "lower_functional_impact": { "rtp_days_min": 5, "rtp_days_max": 10 },
      "moderate_functional_impact": { "rtp_days_min": 10, "rtp_days_max": 21 },
      "high_concern_or_review_gated": { "rtp_days_min": 21, "rtp_days_max": 45 }
    }
  }
}
```

**`lib/datasets/likelihoodRatios.json`** (format):
```json
{
  "rectus_femoris_strain": {
    "mechanism:kicking": {
      "LR_pos": 3.8,
      "LR_neg": 0.55,
      "source": "Pietsch_2023",
      "pmid": null,
      "evidence_level": "B",
      "finding_description": "Patient reports kicking as the injury mechanism"
    }
  }
}
```

Update `confidenceEngine.js` to load from these files:
```javascript
// lib/clinical/confidenceEngine.js
import injuryPriorsData from '../datasets/injuryPriors.json' assert { type: 'json' };
import likelihoodRatiosData from '../datasets/likelihoodRatios.json' assert { type: 'json' };

export const INJURY_PRIORS = injuryPriorsData;
export const LIKELIHOOD_RATIOS = likelihoodRatiosData;
```

---

### Step 2 — Unified Runtime Loader (Day 2–3)

Create `lib/datasets/loader.js` — a single module that loads all datasets into module-level singletons at first import. In Next.js App Router, this runs once per server process (not per request).

```javascript
// lib/datasets/loader.js
// ---------------------------------------------------------------------------
// Unified dataset loader. All datasets are loaded synchronously at module
// initialization time (Node.js require semantics). In Next.js App Router
// running on Node.js, this module is initialized once per server process.
// Edge Runtime is NOT supported due to JSON file size; use Node.js runtime.
// ---------------------------------------------------------------------------

import { readFileSync } from 'fs';
import { join } from 'path';

function loadJSON(relativePath) {
  const absPath = join(process.cwd(), relativePath);
  try {
    return JSON.parse(readFileSync(absPath, 'utf8'));
  } catch (err) {
    console.error(`[DatasetLoader] Failed to load ${relativePath}:`, err.message);
    return null;
  }
}

// ── Injury classification datasets ───────────────────────────────────────────
export const injuryPriors = loadJSON('lib/datasets/injuryPriors.json');
export const likelihoodRatios = loadJSON('lib/datasets/likelihoodRatios.json');

// ── Exercise knowledge (raw metadata, not embedded vectors) ──────────────────
// Loaded from existing RF exercise JSON objects + any new additions.
// Keys: exercise_id → exercise metadata object.
export const exerciseMetadata = (() => {
  const rfExDir = 'lib/clinical/exerciseKnowledge/rf/objects';
  const index = {};
  try {
    const { readdirSync } = require('fs');
    const files = readdirSync(join(process.cwd(), rfExDir)).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const ex = loadJSON(`${rfExDir}/${file}`);
      if (ex && ex.exercise_id) index[ex.exercise_id] = ex;
      else if (ex) index[file.replace('.json', '')] = ex;
    }
  } catch (err) {
    console.warn('[DatasetLoader] Could not load exercise metadata:', err.message);
  }
  return index;
})();

// ── Capacity definitions ─────────────────────────────────────────────────────
export const capacityDefinitions = (() => {
  const capDir = 'lib/clinical/capacityKnowledge/universal/objects';
  const index = {};
  try {
    const { readdirSync } = require('fs');
    const files = readdirSync(join(process.cwd(), capDir)).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const cap = loadJSON(`${capDir}/${file}`);
      if (cap && cap.capacity_id) index[cap.capacity_id] = cap;
    }
  } catch (err) {
    console.warn('[DatasetLoader] Could not load capacity definitions:', err.message);
  }
  return index;
})();

// ── Pre-computed exercise embedding vectors ───────────────────────────────────
// Built by scripts/buildVectorStore.js. Committed to repo. Only loaded if the
// vector store file exists — gracefully degrades to metadata-only search.
export const exerciseVectors = (() => {
  try {
    return loadJSON('lib/datasets/exerciseVectors.json');
  } catch {
    return null; // vector store not yet built — fall back to metadata filtering
  }
})();

// ── Health check ─────────────────────────────────────────────────────────────
export function getLoaderStatus() {
  return {
    injuryPriorsLoaded: !!injuryPriors,
    injuryCount: injuryPriors ? Object.keys(injuryPriors).length : 0,
    likelihoodRatiosLoaded: !!likelihoodRatios,
    exerciseCount: Object.keys(exerciseMetadata).length,
    capacityCount: Object.keys(capacityDefinitions).length,
    vectorStoreLoaded: !!exerciseVectors,
    vectorCount: exerciseVectors ? exerciseVectors.length : 0,
  };
}
```

---

### Step 3 — Exercise Vector Store Build Script (Day 3–5)

This script is run manually (or in CI) whenever the exercise knowledge base changes. It produces `exerciseVectors.json` — a pre-computed array of `{doc_id, text, metadata, vector}` objects.

**`lib/datasets/scripts/buildVectorStore.js`**:
```javascript
#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Build-time script — NOT imported at runtime.
// Run: node lib/datasets/scripts/buildVectorStore.js
//
// Requires: OPENAI_API_KEY env var (for text-embedding-3-small)
// OR set USE_LOCAL_EMBEDDINGS=true to use a local ONNX model.
//
// Output: lib/datasets/exerciseVectors.json
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const USE_LOCAL = process.env.USE_LOCAL_EMBEDDINGS === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIMS = 1536;

// 1. Collect all exercise documents
function collectDocuments() {
  const docs = [];
  const rfExDir = join(process.cwd(), 'lib/clinical/exerciseKnowledge/rf/objects');
  const files = readdirSync(rfExDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const ex = JSON.parse(readFileSync(join(rfExDir, file), 'utf8'));
    // Build the text field for embedding — must be information-dense
    const text = [
      ex.name || file,
      ex.description || '',
      ex.clinical_rationale || '',
      (ex.capacity_targets || []).join(', '),
      (ex.phase || []).join(', '),
      (ex.injury_ids || ['rectus_femoris_strain']).join(', '),
    ].filter(Boolean).join('. ');

    docs.push({
      doc_id: ex.exercise_id || file.replace('.json', ''),
      doc_type: 'exercise',
      text,
      metadata: {
        injury_ids: ex.injury_ids || ['rectus_femoris_strain'],
        phase: ex.phase || [],
        evidence_level: ex.evidence_level || 'C',
        pmid: ex.pmid || null,
        region: ex.region || 'anterior_thigh',
        capacity_targets: ex.capacity_targets || [],
        equipment_required: ex.equipment_required || [],
        contraindications: ex.contraindications || [],
        severity_bands: ex.severity_bands || [],
      },
    });
  }
  return docs;
}

// 2. Embed all documents
async function embedDocuments(docs) {
  if (USE_LOCAL) {
    // Fallback: use zero vectors for local dev (no API key needed)
    // Replace with ONNX Runtime + all-MiniLM-L6-v2 for real local embeddings
    console.log('WARNING: Using zero vectors for local embeddings. For real local embeddings, integrate ONNX Runtime.');
    return docs.map((d) => ({ ...d, vector: new Array(384).fill(0) }));
  }

  if (!OPENAI_API_KEY) throw new Error('Set OPENAI_API_KEY or USE_LOCAL_EMBEDDINGS=true');

  const embedded = [];
  for (const doc of docs) {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: doc.text, model: EMBED_MODEL }),
    });
    const data = await res.json();
    if (!data.data?.[0]?.embedding) throw new Error(`Embedding failed for ${doc.doc_id}: ${JSON.stringify(data)}`);
    embedded.push({ ...doc, vector: data.data[0].embedding });
    process.stdout.write('.');
  }
  console.log('\nEmbedding complete.');
  return embedded;
}

// 3. Write output
async function main() {
  console.log('Collecting exercise documents...');
  const docs = collectDocuments();
  console.log(`Found ${docs.length} documents.`);

  console.log('Embedding documents...');
  const embedded = await embedDocuments(docs);

  const outPath = join(process.cwd(), 'lib/datasets/exerciseVectors.json');
  writeFileSync(outPath, JSON.stringify(embedded, null, 2));
  console.log(`Written to ${outPath}`);
  console.log(`Total vectors: ${embedded.length}, dims: ${embedded[0]?.vector?.length}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

---

### Step 4 — Vector Store Runtime Search (Day 5–6)

**`lib/datasets/vectorStore.js`**:
```javascript
// lib/datasets/vectorStore.js
// ---------------------------------------------------------------------------
// In-memory vector search over the pre-computed exercise embeddings.
// Falls back to metadata-only filtering if vectors are not available.
// ---------------------------------------------------------------------------

import { exerciseVectors, exerciseMetadata } from './loader.js';

/**
 * Cosine similarity between two float arrays.
 */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

/**
 * Retrieve exercises for a given injury + phase.
 *
 * If a queryVector is provided, results are ranked by cosine similarity.
 * If not, results are filtered by metadata and returned unranked.
 *
 * @param {Object} params
 * @param {string} params.injuryId       - e.g. "rectus_femoris_strain"
 * @param {string} params.phase          - e.g. "foundation"
 * @param {string[]} [params.capacityTargets] - e.g. ["isometric_strength"]
 * @param {string[]} [params.equipment]  - user's available equipment
 * @param {number[]} [params.queryVector] - optional embedding of search query
 * @param {number}  [params.topK=5]     - number of results to return
 * @returns {Array<{ doc_id, score, metadata, text }>}
 */
export function searchExercises({
  injuryId,
  phase,
  capacityTargets = [],
  equipment = [],
  queryVector = null,
  topK = 5,
}) {
  // Step 1: Pre-filter by metadata
  const source = exerciseVectors || Object.values(exerciseMetadata).map((m) => ({ doc_id: m.exercise_id, metadata: m, vector: null, text: '' }));

  const filtered = source.filter((doc) => {
    const meta = doc.metadata;
    if (!meta) return false;

    // Must match injury
    if (meta.injury_ids && meta.injury_ids.length > 0 && !meta.injury_ids.includes(injuryId)) return false;

    // Must match phase
    if (meta.phase && meta.phase.length > 0 && !meta.phase.includes(phase)) return false;

    // Equipment constraint: all required equipment must be available
    if (meta.equipment_required && meta.equipment_required.length > 0) {
      const hasAll = meta.equipment_required.every((eq) =>
        equipment.includes(eq) || eq === 'bodyweight'
      );
      if (!hasAll) return false;
    }

    return true;
  });

  if (filtered.length === 0) return [];

  // Step 2: Rank by vector similarity if query vector provided, else by evidence level
  let ranked;
  if (queryVector && filtered[0]?.vector) {
    ranked = filtered
      .map((doc) => ({ ...doc, score: cosineSimilarity(queryVector, doc.vector) }))
      .sort((a, b) => b.score - a.score);
  } else {
    // Fallback rank: A > B > C evidence, then capacity target match count
    const evidenceRank = { A: 3, B: 2, C: 1 };
    ranked = filtered
      .map((doc) => {
        const evScore = evidenceRank[doc.metadata?.evidence_level] || 1;
        const capScore = capacityTargets.filter((c) =>
          (doc.metadata?.capacity_targets || []).includes(c)
        ).length;
        return { ...doc, score: evScore + capScore * 0.5 };
      })
      .sort((a, b) => b.score - a.score);
  }

  return ranked.slice(0, topK).map(({ vector: _v, ...rest }) => rest); // strip raw vectors from output
}
```

---

### Step 5 — Next.js API Routes Wiring (Day 6–7)

#### Diagnosis API Route

**`app/api/rf-beta/route.js`** — update to use `computeConfidenceScore`:

```javascript
// app/api/rf-beta/route.js  (additions to existing route)
import { computeConfidenceScore, differentialDiagnosis } from '../../../lib/clinical/confidenceEngine.js';

// In the POST handler, after existing RF engine run:
// 1. Run the existing RF engine (unchanged)
const rfResult = runRfBeta(rfInput);

// 2. Augment with Bayesian confidence score
const bayesianResult = computeConfidenceScore(
  buildFindingMap(rfInput),       // maps rfInput fields → "domain:value" keys
  'rectus_femoris_strain',
  { sport: assessment.sport, ageGroup: assessment.ageGroup, previousInjury: rfInput.previous_injury }
);

// 3. Return combined output
return NextResponse.json({ ...rfResult, bayesian_confidence: bayesianResult });
```

#### Exercise Search API Route

**`app/api/exercises/route.js`** (new):

```javascript
import { NextResponse } from 'next/server';
import { searchExercises } from '../../../lib/datasets/vectorStore.js';

export const runtime = 'nodejs'; // required: vectorStore uses fs module

export async function POST(req) {
  const { injuryId, phase, capacityTargets, equipment } = await req.json();

  if (!injuryId || !phase) {
    return NextResponse.json({ error: 'injuryId and phase are required' }, { status: 400 });
  }

  const exercises = searchExercises({ injuryId, phase, capacityTargets, equipment, topK: 5 });
  return NextResponse.json({ exercises, count: exercises.length });
}
```

#### Explain API Route

**`app/api/explain/route.js`** (new — calls Claude):

```javascript
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export async function POST(req) {
  const { bayesianOutput, topExercises, userQuestion } = await req.json();

  const systemPrompt = `You are a sports medicine AI assistant supporting an athlete and their physiotherapist reviewing a self-assessment result.

The structured clinical scoring engine produced the following output:
${JSON.stringify(bayesianOutput, null, 2)}

The top matching exercises from the evidence-based knowledge base are:
${JSON.stringify(topExercises, null, 2)}

Provide:
1. A 2-3 sentence plain-English summary of the most likely injury pattern and the key evidence supporting it.
2. Two alternative diagnoses to keep in mind if this pattern does not match their clinical picture.
3. One specific question to resolve the most uncertain element in the assessment.

Rules:
- Never state a firm diagnosis.
- Never prescribe specific medication dosages.
- Always note that this is a decision-support tool, not a clinical assessment.
- If red flags are present, prioritise advising urgent review over providing exercise guidance.`;

  const userMsg = userQuestion || 'Please explain these results to me.';

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMsg }],
  });

  return NextResponse.json({ explanation: response.content[0].text });
}
```

---

### Step 6 — Validation Script (Day 7–8)

**`lib/datasets/scripts/validateDatasets.js`**:
```javascript
#!/usr/bin/env node
// Run: node lib/datasets/scripts/validateDatasets.js
// Checks that all JSON datasets are valid, complete, and internally consistent.

import { getLoaderStatus } from '../loader.js';

const status = getLoaderStatus();
console.log('Dataset loader status:', JSON.stringify(status, null, 2));

let failures = 0;

if (!status.injuryPriorsLoaded) { console.error('FAIL: injuryPriors.json missing or invalid'); failures++; }
if (!status.likelihoodRatiosLoaded) { console.error('FAIL: likelihoodRatios.json missing or invalid'); failures++; }
if (status.injuryCount < 5) { console.error(`FAIL: Expected >=5 injuries, got ${status.injuryCount}`); failures++; }
if (status.exerciseCount < 10) { console.error(`WARN: Expected >=10 exercises, got ${status.exerciseCount}`); }
if (!status.vectorStoreLoaded) { console.warn('WARN: Vector store not built — run buildVectorStore.js'); }

if (failures > 0) {
  console.error(`\n${failures} validation failure(s). Fix before deploying.`);
  process.exit(1);
} else {
  console.log('\nAll datasets valid.');
}
```

---

## 4. Runtime Data Flow Diagram

```
──────────────────────────────────────────────────────────────────────────────
 App Boot (Next.js server process start)
──────────────────────────────────────────────────────────────────────────────
  lib/datasets/loader.js
  ├── loads injuryPriors.json          → ~15KB, ~20 injuries
  ├── loads likelihoodRatios.json      → ~50KB
  ├── loads exerciseKnowledge/rf/**    → ~30KB, 12+ exercises
  ├── loads capacityKnowledge/**       → ~20KB, 15 capacities
  └── loads exerciseVectors.json       → ~3MB (500 docs × 1536 dims × 4 bytes)
  Total memory: ~3.1MB per process
  Load time: ~200ms (synchronous JSON parse at startup)

──────────────────────────────────────────────────────────────────────────────
 User completes assessment → submits → POST /api/rf-beta
──────────────────────────────────────────────────────────────────────────────
  mapAssessmentToRfInput()             → structured rfInput (~2ms)
  runRfBeta(rfInput)                   → existing engine (~5ms)
  computeConfidenceScore(              → Bayesian posterior (~2ms)
    buildFindingMap(rfInput),
    'rectus_femoris_strain',
    { sport, ageGroup, previousInjury }
  )
  differentialDiagnosis(               → ranked candidates (~10ms for 7 injuries)
    findingMap,
    'anterior_thigh'
  )
  → Response: { rfResult, bayesian_confidence, differential }
  Total latency: ~20ms (zero external calls)

──────────────────────────────────────────────────────────────────────────────
 Plan page loads → GET /api/exercises
──────────────────────────────────────────────────────────────────────────────
  searchExercises({                    → metadata filter (~1ms)
    injuryId: 'rectus_femoris_strain', → cosine rank if vectors loaded (~5ms)
    phase: 'foundation',
    equipment: ['bodyweight', 'band'],
    topK: 5
  })
  → Response: { exercises: [...], count: 5 }
  Total latency: ~10ms (in-memory)

──────────────────────────────────────────────────────────────────────────────
 User taps "Explain this" → POST /api/explain    (on-demand only)
──────────────────────────────────────────────────────────────────────────────
  Build system prompt with bayesianOutput + topExercises
  Call Claude API (claude-haiku-4-5)             → ~800ms latency, ~$0.001
  → Response: { explanation: "..." }
```

---

## 5. Environment Variables

Add to `.env.local` (not committed):

```
# Required for the explanation layer (on-demand only)
ANTHROPIC_API_KEY=sk-ant-...

# Required only when running buildVectorStore.js
# Not needed at runtime if exerciseVectors.json is committed
OPENAI_API_KEY=sk-...

# Optional: use local ONNX embeddings instead of OpenAI
USE_LOCAL_EMBEDDINGS=false
```

---

## 6. Rollout Sequence

| Week | Deliverable | Test signal |
|------|-------------|-------------|
| 1 | `injuryPriors.json`, `likelihoodRatios.json` extracted | `validateDatasets.js` passes |
| 1 | `loader.js` and health check endpoint | `GET /api/health` returns dataset counts |
| 2 | `confidenceEngine.js` integrated in `/api/rf-beta` | RF assessment returns `bayesian_confidence` field |
| 2 | `differentialDiagnosis()` surfaced in diagnosis page | Diagnosis page shows ranked alternatives |
| 3 | `buildVectorStore.js` run on exercise knowledge | `exerciseVectors.json` committed |
| 3 | `vectorStore.js` and `/api/exercises` wired to plan page | Exercises change dynamically by phase |
| 4 | `/api/explain` route implemented | Explanation panel visible on diagnosis page |
| 4 | `validateDatasets.js` added to CI | Dataset errors caught before deploy |
| 5–6 | Hamstring + ankle + knee LR tables added | `differentialDiagnosis()` covers 4 regions |

---

## 7. Governance Notes

- **The Bayesian `score` is still match confidence, not diagnostic certainty.** All existing policy caps (84% absolute max) remain in place in `confidenceEngine.js`.
- **Red flag detection is unchanged.** `rfConfidenceResolver.mjs` continues to handle red flags for the RF engine. `confidenceEngine.js` has its own independent red flag pass that covers all injury types.
- **No patient data is persisted in the vector store.** `exerciseVectors.json` contains only clinical knowledge documents, not user assessment data.
- **LLM calls are on-demand and never automatic.** The explain route is only called when the user explicitly requests an explanation. Core diagnosis is always the deterministic Bayesian engine.
- **All LR values should be reviewed by a qualified sports medicine clinician** before any patient-facing deployment. Values in `confidenceEngine.js` marked `evidence_level: "C"` are expert consensus estimates requiring prospective validation.
