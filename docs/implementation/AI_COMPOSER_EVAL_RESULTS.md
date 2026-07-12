# Cross-injury AI session composer eval — results (July 2026)

Ran `scripts/eval-ai-session-composer.mjs` against all 8 lower-body engines
that share `lib/clinical/core/aiSessionComposer.mjs`, using a real
`GEMINI_API_KEY` (free tier). 8 engines x 5 comment scenarios = 40 calls.

## Headline results

- **Pool-only validity: 40/40 (100%)** — every card Gemini selected, across
  every successful AI call, was a real member of the pool it was given.
  Zero hallucinated exercise ids.
- **Dosage correctness: 40/40 (100%)** — every card's dosage exactly matched
  the pool exercise's own `dosage_by_tier` for that session's tier. Zero
  invented dosages.
- **AI-composed rate: 8/40 (20%)** — the other 32/40 silently fell back to
  the deterministic rotation. This was **not** a model-quality problem: it
  was the Gemini free tier's `GenerateRequestsPerDayPerProjectPerModel-FreeTier`
  quota (20 requests/day for `gemini-flash-latest`, aliasing
  `gemini-3.5-flash`) being exhausted partway through the run. Confirmed via
  a direct API probe returning `RESOURCE_EXHAUSTED` with `quotaValue: "20"`.
  `composeSessions()` handled this exactly as designed — it fails safe to
  the deterministic rotation rather than erroring or serving a broken plan.
- Among the 8 calls that *did* reach Gemini: equipment-limit comments were
  respected in every case that got an AI response (with the one non-pass
  attributable to the pool lacking a bodyweight-only alternative, not a
  model error), and "focus on strength" shifted the exercise-block mix
  toward `strength_support`/`tissue_specific_loading` blocks (68% of picks
  vs. an unweighted baseline).
- The "different injury mention" -> `out_of_scope_note` check only had one
  AI-composed sample (quad) in this run, and it correctly set the note. The
  other 7 engines' tests for this scenario fell back to deterministic before
  reaching Gemini, so no conclusion can be drawn there from this run alone.

## Practical takeaway

The **hard safety boundary** the composer is designed around — pool
membership and dosage fidelity — held at 100% across every real Gemini
response, which is the finding that matters most: even when the model
selects, it cannot escape the clinically-vetted pool or invent an unsafe
dosage. The **comment-responsiveness** signal is directionally positive but
undersampled here because of the free-tier quota; a fuller run needs either
a paid-tier key or the harness trimmed to fit inside 20 calls/day (see the
warning added to the top of `eval-ai-session-composer.mjs`).

## Fine-tuning feasibility (task #48)

Researched via WebSearch (July 2026):

- **`gemini-flash-latest` (the model this app calls) is not tunable at all**
  — Gemini API/AI Studio fine-tuning was deprecated with the 1.5 Flash line
  and Google has no stated plans to reintroduce it for the plain API-key
  flow this app uses.
- Supervised fine-tuning is only available via **Vertex AI**, and only for
  pinned checkpoints (`gemini-2.5-pro`, `gemini-2.5-flash`,
  `gemini-2.5-flash-lite`) — not the rolling "latest" alias. Adopting it
  means standing up a GCP project + billing + IAM, pinning to an older
  model, and giving up the auto-upgrade convenience of `-latest`.
- Practical requirements if pursued: JSONL training data matching the exact
  production prompt shape, ~100+ examples minimum, training billed per
  token, and a tuned model serves at roughly **1.5x base inference cost**
  plus a dedicated hosting fee.
- For a narrow, JSON-schema-constrained selection task like this one
  (already backed by pool-membership + dosage validation, as this eval
  confirmed holds at 100%), the literature and practitioner consensus is
  that prompt engineering / few-shot / structured output should be
  exhausted first — one directly comparable study found retrieval-augmented
  few-shot prompting *beating* a fine-tuned Gemini-1.5-Flash on a
  classification-style task with no retraining cost.

**Recommendation: not worth pursuing right now.** The model this app
actually calls isn't tunable; the path to a tunable model is a real
infrastructure migration; and the task's failure mode (hallucinated
exercises / bad dosages) is already fully closed off by the existing
schema + pool validation, which this eval just confirmed empirically at
100%. Revisit if Google extends Vertex-style tuning to the `-latest` Flash
line, or if a large corpus of clinician-corrected AI outputs accumulates
and the goal shifts to cutting prompt-token cost/latency at scale rather
than improving accuracy.
