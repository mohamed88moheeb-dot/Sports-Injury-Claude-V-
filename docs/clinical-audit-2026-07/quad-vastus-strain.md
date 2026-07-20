# Quad Vastus Strain Audit

> Note: live PubMed metadata verification was blocked mid-audit (reconnected
> server required interactive approval). Citation checks rest on earlier
> successful PubMed searches + internally-consistent PMID/DOI/title triples +
> web-sourced current evidence. A mechanical PMID re-resolution pass is
> recommended before publication.

**Core model is well-founded and honestly fenced as beta/clinician-review.** Main
clinical risks: (a) no decisive rupture red-flag routing, (b) self-report-derived
BAMIC grade/site overstates diagnostic resolution, (c) undeclared extrapolation of
ACL- and tendinopathy-domain evidence onto a muscle-strain entity.

## Diagnosis / routing
- **CONFIRMED:** monoarticular differentiator (knee-extension symptoms without hip-
  flexion involvement) — correct, evidence-aligned distinction from RF
  (Lempainen 2022). Honest "anterior-thigh/quadriceps strain" fallback is sound.
- **OUTDATED narrative:** RESEARCH.md §1 frames vastii as mainly *direct*-trauma
  and indirect vastus strain as an RF story. Current evidence (Apunts 2025 VM case
  series) documents indirect **deceleration + progressive-loading** vastus strains
  as a distinct entity (~19d RTP). The exercise bank is actually more current than
  the narrative. Add the mechanism explicitly.
- **MISSING (safety):** no decisive red-flag escape hatch. `knee_extension_response
  ==='unable'` or `palpable_gap` maps to grade 3 + a soft caution — but inability
  to actively extend / SLR is possible extensor-mechanism rupture (surgical
  emergency, worse if repair delayed >3 wk) and warrants an **urgent-referral stop**,
  not within-engine "high-grade" placement. VS-EX-003's own text calls SLR-inability
  a "rupture red flag" but the grading logic doesn't act on it.

## Severity grading
- **UNSUPPORTED:** engine emits a `bamic_label` (e.g. "2b") from self-reported
  pain/swelling/continue-ability. BAMIC is definitionally an MRI classification.
  Output generic clinical grade I–III for self-report; reserve BAMIC for imaging.
- **UNSUPPORTED (fabricated heuristic):** site assignment `site='c'` when
  `previous_injury && pain!=='mild'`, `site='a'` when no swelling+mild pain. No
  evidence links self-reported prior injury to intratendinous site; remove.
- **QUESTIONABLE:** grade only ever resolves to 1–3; grade 0 and grade 4 never
  occur — but grade 4 (complete tear) is exactly the case that should hard-route to
  referral.
- Acceptable-with-label: McAleer 2022 (RF T&F BAMIC) / Hollabaugh 2025 as
  prognostic anchors is reasonable extrapolation *if labelled* RF/mixed-quad-derived.

## Exercise selection & dosage
- **CONFIRMED:** staged progression (isometric → inner-range → full-ROM isotonic →
  eccentric → plyometric → running → COD → RTS), monoarticular bias, progressive
  (non-cautious) stretch correct; dosages reasonable beta defaults, fenced by
  `beta_default + requires_clinician_review`.
- **QUESTIONABLE (cross-pathology citations):** VS-EX-014 Spanish squat cites
  QUAD-CIT-008 (Lim 2018, patellar tendinopathy SR); VS-EX-024 flywheel cites
  QUAD-CIT-011 (Ruffino 2021, patellar tendinopathy RCT). Tendinopathy-loading
  studies used to justify muscle-strain exercises — relabel.
- **OUTDATED (VMO selectivity):** VS-EX-002/015 claim terminal-range extension
  "preferentially recruits VMO." Selective VMO activation is contested/debunked.
  Soften to "biases medial-quad/terminal-extension loading."
- **UNSUPPORTED transfer:** BFR (VS-EX-004 → Hughes 2019 ACLR); RTS batteries
  (VS-EX-026/044: 4 hop tests + ≥90% LSI → Nawasreh 2016, Thompson 2022, both
  ACLR). Muscle-strain RTS emphasizes strength symmetry + pain-free sport-specific
  actions + ROM/readiness, not hop batteries (Sports Med 2026 review). Keep the
  "strength AND function, don't clear on hop symmetry alone" principle; label the
  ACL-derived battery as extrapolated.
- Minor: VS-EX-051 cites "~17% recurrence" unsourced (file's own Hollabaugh figure
  is ~19%) — reconcile. VS-EX-015 `source_refs: [QUAD-CIT-001]` but inline cites
  "PMID 26940378" not in the registry — fix.

## Citations
- Internally consistent / plausibly correct (NOT live-re-verified this session):
  QUAD-CIT-001 (Lempainen 2022, 35303927), -003 (McAleer 2022, 35332596),
  -004 (Hollabaugh 2025, 40145663), -015 (Hughes 2019, 31301034),
  -016 (Nawasreh 2016, 28125899), -017 (Thompson 2022, 35604342).
- Domain-mismatch of *use*: -015/-016/-017 are ACLR; -007..-011 patellar
  tendinopathy — several invoked for vastus muscle-strain dosing/RTS.
- RESEARCH.md still says "PRICE" — superseded by PEACE & LOVE (Dubois 2020).

## Priority fixes
1. Add hard rupture / extensor-mechanism red-flag STOP (unable to extend / SLR, or
   palpable gap → urgent referral, out of self-paced engine; introduce true grade 4).
2. Stop emitting self-report-derived BAMIC grade+site; use clinical grade I–III;
   remove fabricated site heuristic.
3. Relabel cross-domain evidence transfer (BFR/ACLR, hop-test RTS/ACLR,
   Spanish-squat/flywheel/tendinopathy); add muscle-injury RTS criteria + citations.
4. Fix mechanism narrative (RESEARCH.md §1) — add Apunts 2025 VM case series.
5. Soften VMO-selectivity claims; fix VS-EX-015 inline-PMID vs source_refs mismatch.
6. Housekeeping: mechanical PMID/DOI re-verification; reconcile 17%/19% recurrence;
   PRICE → PEACE & LOVE.
