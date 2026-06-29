# Knee Engine (`lib/clinical/kneeEngine`)

**Beta-only, non-executable-for-production engine** covering knee injuries beyond
the extensor-mechanism tendons (which are handled by the quad engine). Hybrid
architecture: shared core (intake, router, staged-plan builder, check-in) + a
per-entity config registry. Pure data/logic — no UI, no clearance authority.
Every clinical claim is cited; see `RESEARCH.md` and `ANATOMY.md`.

## Entities covered (10)

ACL, PCL, MCL, LCL/PLC, meniscus tear, patellofemoral pain, patellar instability,
knee osteoarthritis, IT band syndrome, Osgood-Schlatter. Patellar/quad
tendinopathy + tendon rupture **route out to the quad engine** (no duplication).

## Entry point

```js
import { runKnee } from './lib/clinical/kneeEngine/index.mjs';
const out = runKnee(assessmentAnswers);
// out.routing.entity, out.diagnosis, out.plan (staged), out.referral, out.severity_band
```

## The router + safety

`routeEntity` dispatches by selected structure, then mechanism/signals. Red flags
(locked knee, gross instability, immediate large swelling, can't bear weight,
hot/febrile joint, high-energy/PLC) and surgical patterns return a **referral**
instead of an autonomous plan:
- **Urgent referral** (no plan): locked knee (bucket-handle meniscus), high-grade
  LCL/PLC, high-grade PCL, ACL with red-flag features.
- **Clinician referral** (+ plan continues): recurrent patellar dislocation
  (MPFL review), atypical Osgood-Schlatter.

## Evidence base

14 cited sources (PubMed), machine-readable in `citations/`. Anchors:
Duong 2023 JAMA (diagnostic tests + conservative-first), Filbay 2025 (ACL rehab =
reconstruction for RTS), ESSKA 2024 patellar-dislocation consensus, ACR/KNGF OA
guidelines, Nascimento 2017 (hip+knee for PFPS), Wells 2021 (meniscus),
van der Worp 2012 (ITB), Circi 2017 (OSD), Nawasreh/Thompson (criteria-based RTS).

## Status

**Foundation build.** 52 curated exercises across the 10 entities mapped to the
shared 5-stage model (protect → activate → strengthen → dynamic → return), with
per-entity diagnosis, severity, post-op staging, and surgical-referral logic.
Sized for breadth; intended to be deepened to full per-entity exercise parity
(as the quad engine went 41 → 88) and wired into the app + anatomy selector +
confidence display in a following pass.

## Test

`node scripts/test-knee-engine.mjs` — 24 checks: routing (structure + mechanism),
red-flag/surgical referrals, post-op staging, plan shape, citation integrity.

## What this is NOT

Not clinical approval, not production authority, not a UI, not yet wired to
runtime. Beta defaults must be replaced by governed, evidence-graded,
clinician-reviewed dosage before any production use.
