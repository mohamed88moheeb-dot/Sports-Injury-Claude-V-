# AI Architecture Design — Sports Injury Diagnosis & Recovery System

**Version:** 1.0  
**Date:** 2026-06-22  
**Status:** Design proposal pending review

---

## 1. Codebase Analysis: What the Current Engine Does

### 1.1 Engine Architecture

The current system has two parallel diagnosis paths:

**Path A — Legacy injury engine** (`lib/injuryEngine/`, `data/`)  
Rule-based matching against `injuryKnowledge.js` and `rehabKnowledge.js`. The `RecoveryContext` calls `getAdaptedSession` via `planAdapter`. This handles all body regions except rectus femoris (quadriceps/anterior thigh). The assessment data flows from `emptyAssessment` fields: `primaryRegion`, `grade`, `mechanism`, `symptoms`, `sports`, `painRest/Walking/Sport`, `daysSince`.

**Path B — RF Beta Engine** (`lib/clinical/rfBetaEngine/`)  
A bespoke, evidence-cited engine for rectus femoris strain. It is a pure function pipeline:

```
rawInput
  → makeAssessmentInput()      rfAssessmentInput.mjs
  → resolveConfidence()        rfConfidenceResolver.mjs
  → resolveSeverity()          rfSeverityResolver.mjs
  → resolveRecovery()          rfRecoveryResolver.mjs
  → derivePattern()            index.mjs (inline)
  → generatePlan()             rfPlanGenerator.mjs
  → buildGovernanceTrace()     rfGovernanceTrace.mjs
  → structured output
```

The router at `app/assessment/page.jsx` calls `isRfCompatible()` and sends RF cases to `/diagnosis`, others to `/dashboard`.

### 1.2 What Data It Uses

| Knowledge layer | Format | Location |
|----------------|--------|----------|
| RF assessment schemas | JSON objects | `assessmentKnowledge/rf/objects/RF-ASSESS-*.json` (18 files) |
| Activity exposure risk factors | JSON objects | `activityExposureKnowledge/rf/objects/RF-ACT-*.json` (12 files) |
| Capacity definitions | JSON objects | `capacityKnowledge/universal/objects/CAP-*.json` (15 files) |
| Exercise library | JSON objects | `exerciseKnowledge/rf/objects/RF-EX-*.json` (12+ files) |
| Evidence linking maps | JSON maps | `evidenceLinkingKnowledge/rf/maps/` |
| Severity rules | Inline logic | `rfSeverityResolver.mjs` |
| Confidence logic | Inline + caps | `rfConfidenceResolver.mjs` |
| Recovery timelines | Inline | `rfRecoveryResolver.mjs` |
| Phase plan templates | Inline | `rfPlanGenerator.mjs` |

The scoring system is additive with hardcoded point maps, not a formal Bayesian network. Confidence is capped at 84% absolute maximum (policy §7a), reflects self-report limitations.

### 1.3 Gaps Identified

1. **Single injury coverage.** The RF engine only handles rectus femoris. All other regions use a cruder legacy engine with no Bayesian weighting.
2. **No probabilistic reasoning.** The confidence resolver uses additive scores with hardcoded deltas, not likelihood ratios from epidemiological data. It cannot express P(injury | evidence).
3. **No differential diagnosis.** When the pattern is ambiguous, the engine returns "anterior_thigh_pattern_unclear" with no ranked alternatives and no probability for each.
4. **No uncertainty quantification.** The output has a confidence cap but no interval (e.g., the 68% match could actually be anywhere from 55–75% depending on missing data — this is collapsed to a single number).
5. **No retrieval layer.** Exercise and protocol recommendations are generated from hardcoded phase templates, not from a searchable knowledge base that can be updated without code changes.
6. **No LLM integration.** Reasoning is fully deterministic. There is no chain-of-thought explanation for the clinician or athlete.
7. **Red flag logic is regex-based.** `RED_FLAG_PATHWAYS` in `rfConfidenceResolver.mjs` uses eight regex patterns to classify danger signs. This is brittle for novel phrasing.
8. **No data completeness weighting.** Missing fields reduce the cap (to 65% for "partial"), but missing fields are not individually weighted by their diagnostic information value.
9. **Evidence scope gaps.** As documented in `rfDiagnosisScoring.md`, three key signals (walking pain, resisted contraction, recurrence risk) are borrowed from hamstring studies applied by analogy — no RF-specific predictive study exists.
10. **No feedback loop.** There is no mechanism to learn from cases where the initial diagnosis was wrong or where recovery timelines were inaccurate.

---

## 2. Architecture Decision Document

### Option A: Rule-Based Bayesian Engine

**What it is:** Implement Bayesian inference where confidence = P(injury | symptoms, mechanism, findings) computed from prior probabilities drawn from epidemiology and likelihood ratios from published sensitivity/specificity data.

**Implementation:** Pure JavaScript. Each symptom/finding contributes a likelihood ratio. Log-odds accumulate, posterior is computed via Bayes' theorem.

| Dimension | Score |
|-----------|-------|
| Accuracy estimate | 70–80% for well-studied injuries (ACL, hamstring, ankle sprain) — epidemiology literature has LRs. Falls below 60% for rarer injuries where sensitivity/specificity data is sparse. |
| Implementation time | 2–3 weeks for RF + 3 common injuries |
| Cost | Zero at runtime (no API calls) |
| Maintainability | High — knowledge is stored in JSON priors/LR tables, not code |
| Explainability | Excellent — each contributing factor has an explicit LR and prior; easy to surface to user |
| Weakness | Requires curating prior probabilities and LR tables per injury (research-intensive). No handling of natural-language answers. Diagnosis is still deterministic given the same inputs. |

### Option B: RAG System

**What it is:** Vector store containing injury profiles, clinical guidelines, exercise protocols, and RTS timelines. A Claude API call retrieves relevant knowledge chunks and performs differential diagnosis with chain-of-thought reasoning.

**Implementation:** Next.js API route calls Claude with retrieved context chunks. Assessment answers are embedded, top-k similar documents retrieved from a vector DB (e.g., Pinecone, Supabase pgvector, or in-memory).

| Dimension | Score |
|-----------|-------|
| Accuracy estimate | 75–85% for differential diagnosis on common sports injuries, matching LLM literature on clinical reasoning tasks. Depends heavily on retrieval quality. |
| Implementation time | 3–4 weeks (vector store + embedding pipeline + API integration + evaluation) |
| Cost | $0.003–$0.01 per assessment (Claude Haiku / Sonnet API costs) |
| Maintainability | Medium — knowledge base can be updated without code changes; but retrieval quality must be monitored |
| Explainability | Excellent for clinicians if chain-of-thought is surfaced. Good for athletes if a summary layer is added. |
| Weakness | Requires stable internet at runtime. LLM can hallucinate if retrieval misses relevant context. Latency (1–3 seconds per query). Cost at scale. |

### Option C: Fine-Tuned Model

**What it is:** Fine-tune a compact open model (e.g., Llama-3.1-8B, Phi-4-mini) on curated sports injury Q&A pairs, clinical vignettes, and RTS prediction cases.

| Dimension | Score |
|-----------|-------|
| Accuracy estimate | 65–75% without significant training data (sports injury datasets are limited). Could reach 80%+ with 5,000+ labelled cases. |
| Implementation time | 8–16 weeks including data curation, fine-tuning, evaluation, and deployment |
| Cost | $500–$2,000 for training run + hosting costs for inference |
| Maintainability | Low — model updates require re-training. Knowledge is opaque in weights. |
| Explainability | Poor to medium — requires separate interpretability tooling (SHAP, attention maps) |
| Weakness | Data scarcity is the core problem. No validated sports injury dataset at fine-tuning scale exists publicly. Risk of overconfident wrong answers. |

### Option D: Hybrid (RECOMMENDED)

**What it is:** Bayesian engine for structured assessment → diagnosis confidence + severity. RAG knowledge base for exercise and protocol retrieval. Claude API for chain-of-thought explanation, edge-case reasoning, and natural language coaching responses.

**Three-layer architecture:**

```
Layer 1 — Bayesian Diagnosis Engine (JS, zero-cost, offline-capable)
  Input:  structured assessment answers
  Output: posterior probability per injury candidate, severity band, red flags
  
Layer 2 — RAG Exercise/Protocol Retrieval (vector store + embeddings)
  Input:  injury_id + phase + capacity targets
  Output: top-k ranked exercises/protocols with evidence level
  
Layer 3 — LLM Explanation + Coaching (Claude API, on-demand)
  Input:  Layer 1 output + Layer 2 context chunks
  Output: natural-language explanation, alternative considerations, coaching questions
```

| Dimension | Score |
|-----------|-------|
| Accuracy estimate | 75–85% for diagnosis (Bayesian layer), near-perfect retrieval for exercises (vector search) |
| Implementation time | 4–6 weeks total (layers can be shipped incrementally) |
| Cost | $0–$0.005 per assessment for diagnosis (Bayesian = free); LLM layer only called when explanation requested (~20% of sessions) = < $0.001/user/day |
| Maintainability | High — knowledge tables are JSON, vector store is updatable without code changes |
| Explainability | Excellent — Bayesian contributions listed per factor, LLM surfaces narrative explanation |

**Recommendation: Option D — Hybrid.**

Rationale based on articles retrieved from PubMed:

- Allott et al. (2026, [DOI](https://doi.org/10.1136/bmjopen-2025-107409)) demonstrate ML-based ACL diagnosis at 81% subject-wise accuracy with IMU signals, establishing that structured biomechanical signals can be reliably classified by algorithmic systems.
- Gadepalli Sri Pratyak (2026, [DOI](https://doi.org/10.7759/cureus.107847)) establishes that AI in clinical decision-making performs best in "narrow tasks, especially image-based and prediction-focused applications" — aligning with using the Bayesian layer for focused structured assessment.
- Sardar et al. (2026, [DOI](https://doi.org/10.1093/bib/bbag269)) emphasise that trustworthy clinical AI requires "explicit bias and data-leakage audits, prospective temporal and external geographic validation" — the Bayesian layer's transparency makes this validation tractable.
- Mendlovic et al. (2026, [DOI](https://doi.org/10.1093/ijnp/pyag010)) identify Explainable AI and Shared Decision-Making as non-negotiable pillars for responsible AI integration — the hybrid architecture satisfies both.

---

## 3. Implementation Roadmap (Hybrid Architecture)

### Phase 1 — Bayesian Diagnosis Layer (Weeks 1–2)

**Goal:** Replace/extend the additive-score RF confidence resolver with a formal Bayesian inference engine that works for multiple injuries.

**Data structures needed:**

```javascript
// lib/datasets/injuryPriors.js
// Prior probability of each injury given a presenting sport/region
export const INJURY_PRIORS = {
  "rectus_femoris_strain": {
    prior: 0.28,           // P(RF strain | anterior thigh + sport player)
    sport_modifiers: {
      football: 1.4,       // RF strain more common in kickers
      running: 0.9,
      basketball: 0.8
    },
    age_modifiers: {
      "15-25": 1.1,
      "25-35": 1.0,
      "35-50": 0.85
    },
    region: "anterior_thigh",
    sources: ["Pietsch_2023", "Serner_2018"]
  },
  "quad_contusion": { prior: 0.18, region: "anterior_thigh", ... },
  "distal_quad_strain": { prior: 0.12, region: "anterior_thigh", ... },
  ...
}

// lib/datasets/likelihoodRatios.js
// Likelihood ratios from clinical research: P(finding | injury) / P(finding | no injury)
export const LIKELIHOOD_RATIOS = {
  "rectus_femoris_strain": {
    "mechanism:kicking":          { LR_pos: 3.8, LR_neg: 0.55, source: "Pietsch_2023" },
    "mechanism:sprinting":        { LR_pos: 2.4, LR_neg: 0.6,  source: "Serner_2018" },
    "location:anterior_thigh":    { LR_pos: 4.2, LR_neg: 0.3,  source: "clinical_consensus" },
    "resisted_knee_extension:pain":{ LR_pos: 3.1, LR_neg: 0.45, source: "Giakoumis_2025_analog" },
    "resisted_hip_flexion:pain":  { LR_pos: 2.8, LR_neg: 0.5,  source: "clinical_consensus" },
    "knee_flexion_stretch:pain":  { LR_pos: 2.5, LR_neg: 0.6,  source: "clinical_consensus" },
    "walking_response:unable":    { LR_pos: 2.1, LR_neg: 0.7,  source: "Giakoumis_2025_analog" },
    "pop_or_snap:yes":            { LR_pos: 1.9, LR_neg: 0.8,  source: "Rudisill_2021_analog" },
    "bruising:significant":       { LR_pos: 1.7, LR_neg: 0.85, source: "Rudisill_2021_analog" }
  }
}
```

**APIs to integrate:** None. Pure JavaScript module, zero dependencies.

**Integration with existing Next.js app:**
- Replace the additive-score block in `rfConfidenceResolver.mjs` with a call to `computeConfidenceScore()` from `lib/clinical/confidenceEngine.js`.
- The existing output shape is preserved; only the score computation changes.
- The legacy engine for non-RF regions can call `computeConfidenceScore()` with a different `candidateInjury` once priors/LRs are built for those injuries.

### Phase 2 — RAG Knowledge Base for Exercises (Weeks 3–4)

**Goal:** Make the exercise recommendation layer searchable and updatable without code changes.

**Vector store options (ranked for this app):**

1. **Supabase pgvector** — Already integrated (app uses Supabase). Zero new infrastructure. Enable pgvector extension, add `embeddings` table.
2. **In-memory cosine search** — No server needed. Embed all exercise documents at build time, ship as a JSON array of {text, vector, metadata}. Search at runtime with dot product. Works offline.
3. **Pinecone** — Overkill at this scale (~500 documents), introduces a new vendor dependency.

**Recommended:** In-memory for MVP, Supabase pgvector if dataset grows beyond 2,000 documents.

**Embedding model:** `text-embedding-3-small` from OpenAI ($0.02/million tokens) or run `all-MiniLM-L6-v2` locally with ONNX Runtime (zero cost, 380-dim vectors). For a dataset of 500 exercise documents, total embedding cost ≈ $0.01.

**Build-time pipeline:**
```
node lib/datasets/scripts/buildVectorStore.js
  → read all RF-EX-*.json + protocol JSONs
  → call embedding API per document
  → write lib/datasets/exerciseVectors.json (pre-computed)
  → committed to repo (updated when knowledge base changes)
```

**Runtime retrieval:**
```javascript
// app/api/exercises/route.js
import { searchExercises } from '../../../lib/datasets/vectorStore.js';
// takes injury_id + phase + capacity_targets, returns top-5 ranked exercises
```

### Phase 3 — LLM Explanation Layer (Week 5)

**Goal:** Surface natural-language reasoning for confident users and clinicians.

**API route:** `app/api/explain/route.js`
- Accepts: `{ bayesianOutput, topExercises, userQuestion? }`
- Calls Claude API with a structured system prompt + retrieved context
- Returns: `{ explanation, alternatives, coaching_question }`
- Called only on explicit user request ("explain this to me"), not on every assessment

**System prompt skeleton:**
```
You are a sports medicine AI assistant supporting a physiotherapist reviewing this assessment.

The Bayesian engine produced the following structured output:
{bayesianOutput}

The top matching exercises from the evidence-based knowledge base are:
{topExercises}

Provide:
1. A 2-3 sentence plain-English summary of the most likely injury pattern and why.
2. Two alternative diagnoses to consider if the primary pattern does not fit.
3. One specific clarifying question to resolve the most uncertain element.

Do not state a diagnosis. Do not recommend specific dosage. Note this is a support tool, not a clinical decision.
```

### Phase 4 — Multi-Injury Expansion (Week 6)

**Goal:** Extend the Bayesian engine to cover hamstring, ankle, and knee injuries.

- Build `INJURY_PRIORS` and `LIKELIHOOD_RATIOS` tables for 8 additional injuries.
- Extend `mapAssessmentToRfInput.mjs` / create a generic mapper for non-RF regions.
- The differential diagnosis output ranks all candidate injuries by posterior probability.

---

## 4. Confidence Score Implementation

See `lib/clinical/confidenceEngine.js` for the actual implementation.

The key design decisions:
- **Log-odds accumulation** — avoids probability anchoring errors from multiplicative LR chains.
- **Calibration via sigmoid** — maps log-odds back to [0,1].
- **Completeness weighting** — each finding's contribution is attenuated by a `quality` weight that reflects how well the self-report signal approximates the clinical test.
- **Red flag early exit** — if any red flag is present, confidence is withheld regardless of symptom score.
- **Hard cap at 84%** — matching the existing policy §7a; self-report without imaging cannot exceed this ceiling.

---

## 5. RAG Knowledge Base Schema

Each document stored in the vector store follows this shape:

```javascript
{
  // Primary key
  doc_id: "RF-EX-001",                    // matches existing knowledge base IDs

  // Type determines retrieval filters
  doc_type: "injury_profile"              // "injury_profile" | "exercise" | "protocol" | "guideline"
           | "exercise"
           | "protocol"
           | "guideline",

  // Text field that is embedded — must be human-readable and information-dense
  text: "Rectus femoris strain — foundation phase. Standing isometric quad hold: " +
        "patient stands with slight knee bend, pushes quad into contraction against " +
        "gravity, holds 5s. Targets: tissue-specific loading, pain-free isometric " +
        "recruitment. Grade 1–2. No equipment required.",

  // Structured metadata for pre-filter before vector search
  metadata: {
    injury_ids: ["rectus_femoris_strain", "distal_quad_strain"],
    phase: ["foundation", "reload"],       // recovery phase(s) where this applies
    evidence_level: "B",                   // "A" = RCT, "B" = cohort/expert, "C" = case series
    pmid: "14977651",                      // PubMed ID if exercise is protocol-derived
    region: "anterior_thigh",
    capacity_targets: ["tissue_loading", "isometric_strength"],
    equipment_required: [],                // empty = bodyweight only
    contraindications: ["grade3", "avulsion"],
    rts_phase: false,                      // true only for return-to-sport phase content
    severity_bands: ["lower_functional_impact", "moderate_functional_impact"]
  },

  // Pre-computed embedding vector (stored at build time, NOT at runtime)
  // 1536 dims for text-embedding-3-small, or 384 dims for MiniLM
  vector: [0.021, -0.043, ...]            // omitted from display; present in exerciseVectors.json
}
```

**Retrieval strategy:**

```
1. Pre-filter by metadata:
   - injury_ids contains current injury
   - phase matches current recovery phase
   - equipment_required ⊆ user's available equipment
   - severity_bands contains current severity band
   
2. Vector search within filtered set:
   - Embed query: "exercise for {phase} rectus femoris {capacity_target}"
   - Cosine similarity rank
   - Return top-5

3. Re-rank by evidence_level (A > B > C)
```

---

## 6. Dataset Integration Plan

See `lib/datasets/integration_roadmap.md` for the full step-by-step plan.

**Summary of runtime data flow:**

```
App boot (Next.js server start)
  ↓
lib/datasets/loader.js
  loadInjuryPriors()          → INJURY_PRIORS (in-memory, ~10KB)
  loadLikelihoodRatios()      → LIKELIHOOD_RATIOS (in-memory, ~50KB)
  loadExerciseVectors()       → EXERCISE_VECTORS (in-memory, ~2MB for 500 docs @ 1536 dims)
  
Assessment submitted
  ↓
app/api/rf-beta/route.js
  mapAssessmentToRfInput()    → structured input
  computeConfidenceScore()    → Bayesian posterior per injury
  resolveSeverity()           → severity band (unchanged)
  resolveRecovery()           → RTP timeline (unchanged)
  
Plan requested
  ↓
app/api/exercises/route.js
  searchExercises({           → top-5 exercises with evidence level
    injury_id,
    phase,
    capacity_targets,
    equipment
  })
  
User requests explanation
  ↓
app/api/explain/route.js
  call Claude API             → natural-language explanation
  (on-demand only)
```

**No server-side database calls are needed for diagnosis** — all knowledge is loaded into Node.js process memory at startup. For a dataset of <500 injury profiles + exercises, total memory cost is ~5–10MB, well within Next.js server limits.

**For Supabase pgvector (future):** Add `embedding vector(1536)` column to an `exercises` table. Retrieval becomes a single SQL call:

```sql
SELECT *, 1 - (embedding <=> $query_vector) AS similarity
FROM exercises
WHERE injury_ids @> ARRAY[$injury_id]
  AND $phase = ANY(phase)
ORDER BY similarity DESC
LIMIT 5;
```

---

## Research Citations

All literature sourced from PubMed via the MCP tool. Articles cited:

1. Allott NEH et al. "Wearable sensor technology and machine learning for anterior cruciate ligament injury diagnosis." *BMJ Open* 2026. [DOI](https://doi.org/10.1136/bmjopen-2025-107409). PMID: 42315273.
2. Gadepalli Sri Pratyak AS. "Artificial Intelligence in Clinical Decision-Making: Current Applications, Challenges, and Future Directions." *Cureus* 2026. [DOI](https://doi.org/10.7759/cureus.107847). PMID: 42220854.
3. Sardar S et al. "Artificial intelligence for antimicrobial resistance: advancing reproducibility, interpretability, and clinical deployment." *Brief Bioinform* 2026. [DOI](https://doi.org/10.1093/bib/bbag269). PMID: 42218717.
4. Mendlovic S et al. "Responsible artificial intelligence integration framework for psychiatric guidelines." *Int J Neuropsychopharmacol* 2026. [DOI](https://doi.org/10.1093/ijnp/pyag010). PMID: 42028724.
5. Qu X et al. "Deep learning framework for automated classification of thoracolumbar fractures using spinal CT images." *Health Informatics J* 2026. [DOI](https://doi.org/10.1177/14604582261462739). PMID: 42309505.
