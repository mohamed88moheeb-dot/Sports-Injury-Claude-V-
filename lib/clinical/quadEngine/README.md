# Quadriceps Engine (`lib/clinical/quadEngine`)

**Beta-only, non-executable-for-production engine** covering the four quadriceps
injury entities the RF engine does **not** cover. Hybrid architecture: a shared
core (assessment intake, entity router, session/plan assembly, daily check-in)
plus four self-contained injury modules. Pure data/logic — no UI, no Supabase,
no clearance authority. Every clinical claim is cited; see `RESEARCH.md`.

## Why a new engine (and not just more RF)

The vastii share rehab infrastructure with RF, but contusion, tendinopathy and
rupture are genuinely distinct clinical entities with different severity gates,
stretch policies, and stage models. The hybrid design keeps the shared muscle
model in one place and isolates the divergent clinical behaviour per module.

| Module | Entity | Severity gate | Stage model | Stretch policy |
|---|---|---|---|---|
| `vastusStrain` | VL / VM / VI strain | BAMIC grade + site (a/b/c) | shared 6-phase muscle | progressive |
| `contusion` | dead leg / charley horse | **knee-flexion ROM %** | acute_rom→strength→reload→return | **cautious** (MO risk) |
| `tendinopathy` | jumper's knee | decline-squat pain / VISA-P | isometric→HSR→energy-storage→RTS | avoid early compression |
| `tendonRupture` | quad/patellar rupture | weeks-post-op + **clinician gate** | protected→mobility→strength→return | forbidden until cleared |

## Entry point

```js
import { runQuad, applyQuadCheckIn } from './lib/clinical/quadEngine/index.mjs';
const out = runQuad(assessmentAnswers);
// out.routing.entity, out.diagnosis, out.plan, out.acute_protocol (contusion), ...
const adjusted = applyQuadCheckIn(out.plan.stages[0].sessions[0], { swelling_change: 'more' }, out);
```

## Three-mode intake (`intake/`)

All three user entry points converge on `runQuad`:

| Mode | Module | What it does |
|---|---|---|
| **1. Assessment** (default) | `assessmentFlow.mjs` | Adaptive branching questionnaire — `nextStep(answers)` returns the next question; each answer determines what's asked next; safety screen can short-circuit to an urgent referral. |
| **2. Known injury** | `knownInjury.mjs` | User picks from a catalogue (VL/VM/VI strain, quad/patellar tendinopathy, quad/patellar rupture, contusion); we skip triage and ask only personalisation questions. |
| **3. Report upload** | `reportInterpreter.mjs` | Pluggable extractor parses an MRI/US/X-ray report → proposes the closest entity + confidence → requests targeted follow-ups. Default extractor is deterministic text parsing; inject `options.extractor` for an LLM/vision model. Assistive only, clinician-review required. |

`intakeRouter.mjs` unifies them: `INTAKE_MENU`, `finishIntake({ mode, ... })`, plus
one-shot `runAssessmentMode` / `runKnownInjuryMode` / `runReportMode`.

## The entity router (clinical heart)

`routeEntity(input)` dispatches by urgency:
1. Extensor-mechanism failure (cannot SLR / extension lag / palpable gap) → **rupture** (urgent referral, no autonomous plan).
2. Post-surgical context → **rupture** (post-op, clinician-gated).
3. Direct impact → **contusion** (ROM grading + myositis-ossificans monitoring).
4. Gradual onset + tendon-localised/jumping pain → **tendinopathy** (loading ladder).
5. Otherwise → **vastus strain** (muscle-strain default).

## Safety invariants

- Suspected rupture is **never** self-managed — it returns an urgent referral.
- Post-op rupture is **always** `clinician_required: true`; the engine surfaces
  options but never authorises progression.
- Contusion is **stretch-cautious** early and withholds on swelling increase or
  knee-flexion ROM regression (myositis-ossificans guard).
- Every dosage is `beta_default_requires_review`; nothing is evidence-graded
  prescription.

## Exercise libraries

**88 exercises** across the four entities, each mapped to its stage model with
regressions/progressions, equipment variants, BFR for early low-load strength
(Hughes 2019), VMO-biased work for medial strains, and criteria-based return
testing (Nawasreh 2016; Thompson 2022):

| Module | Exercises | Stages covered |
|---|---|---|
| vastus strain | 35 | all 6 muscle phases |
| contusion | 19 | acute-ROM → return |
| tendinopathy | 18 | isometric → RTS ladder |
| tendon rupture | 16 | protected → return (all clinician-gated) |

The vastus module ranks each phase pool by `muscle_bias`, so a vastus medialis
strain surfaces VMO-biased work first.

## Evidence base

17 cited sources (PubMed), machine-readable in `citations/quadClinicalCitations.mjs`,
synthesised with per-claim attribution in `RESEARCH.md`. Key anchors:
Lempainen 2022 (anterior-thigh management), Aronen 2006 (120° contusion protocol),
Rio 2015 / Kongsgaard 2009 / Lim 2018 (tendinopathy loading), Langenhan 2012 /
Lee 2013 / Ibounig 2015 (rupture post-op), Hughes 2019 (BFR), Nawasreh 2016 /
Thompson 2022 (criteria-based return).

## Test

`node scripts/test-quad-engine.mjs` — 29 checks: routing, severity boundaries,
referral gating, check-in withholds, post-op stage mapping, citation integrity,
dataset depth, and full stage coverage.

## What this is NOT

Not clinical approval, not production authority, not a UI, not wired to runtime.
Beta defaults must be replaced by separately governed, evidence-graded,
clinician-reviewed dosage before any production use.
