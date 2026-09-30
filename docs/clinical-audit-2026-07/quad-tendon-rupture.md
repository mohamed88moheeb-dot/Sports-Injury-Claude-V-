# Quad/Patellar Tendon Rupture Audit — CONTAINS P0 SAFETY FINDINGS

## Safety-gate correctness
**Within the module, the gate is CORRECT:** if `runTendonRupture` is reached and
not post-op, it returns `stage:'pre_operative_referral'`, `autonomous_plan:false`,
`clinician_required:true`, `plan:null`, urgent referral. `routeEntity` triggers on
ANY of SLR-unable / extensor-lag / palpable-gap (OR, not AND) — correct, safe.
The three signs are the right core diagnostic red flags (Danaher 2022, Ramseier
2006, Ibounig 2015).

## P0 — two routing gaps let a genuine surgical emergency get an exercise plan
- **Gap A (false-negative routing):** in `assessmentFlow.mjs` (~159–173) the three
  rupture-screen questions are only asked when `atRiskOfRupture` is true
  (`pain_location==='anterior_knee_tendon' || mechanism==='eccentric_load_pop' ||
  knee_extension_response==='unable'`). A real rupture outside those conditions is
  never screened and falls through to the **strain branch → autonomous plan**.
  Dangerous bypasses: elderly/atraumatic/spontaneous rupture (CKD, diabetes,
  steroids, fluoroquinolone) with suprapatellar/anterior-thigh pain and a "gave
  way" mechanism not coded as eccentric_load_pop. Quad-tendon ruptures are missed
  ~30% of the time (Neubauer 2006). **Fix:** make "unable to actively straighten /
  unable to SLR" a UNIVERSAL red-flag regardless of pain location/mechanism; ask
  the screen for any acute knee/anterior-thigh injury.
- **Gap B (false-negative exam):** a negative triad is treated as "rupture
  excluded," but a complete rupture with intact retinacula can retain partial SLR
  and acute hematoma can mask the gap. **Fix:** add an "uncertain → refer/image"
  net when mechanism/severity is high (pop + can't weight-bear/severe pain) even
  if triad incomplete.
- **Missing triggers that should also force urgent referral:** open wound over the
  tendon (surgical emergency), bilateral extensor-mechanism symptoms, known
  atraumatic-risk context with new extensor weakness.

## Post-op staging — mostly CONFIRMED
protected 0–<6wk / mobility 6–<12 / strength 12–<20 / return ≥20: all defensible.
Minor: protected <6wk is on the early side (many protocols hold to ~8wk / no active
extension) — consider extending or making surgeon-set. Exercise banks correctly
avoid active knee extension in protected phase.
- **TR-EX-031 return copy "3–5+ months" is OPTIMISTIC** for full sport — evidence
  supports **6–9 months, criteria-based** (Rao 2022 mean 8.8mo). Fix wording.
- **TR-EX-021 OKC leg press/knee extension** caution too soft — strengthen
  (mid-range first, avoid end-range resisted extension = main late re-rupture
  mechanism).

## Citations
QUAD-CIT-012 (Langenhan 2012), 013 (Lee 2013), 014 (Ibounig 2015) real + correctly
attributed. MISSING: a diagnostic-accuracy citation behind the pre-op referral
signs (add Danaher 2022 / Ramseier 2006) and an atraumatic-risk-factor source.

## Tests (`test-quad-engine.mjs` ~45–51)
Pre-op test too narrow: only tests SLR-unable; doesn't assert `plan===null`,
doesn't test extensor_lag-only or palpable_gap-only (each an independent branch),
and has NO bypass-case test (Gap A). Post-op tests lack boundary tests.

## Priority fixes
P0: (1) broaden rupture screen trigger (Gap A) — universal SLR/extension red-flag;
(2) add uncertain→refer net (Gap B); (3) add open-wound/bilateral/atraumatic
triggers; (4) harden safety tests (assert plan===null, standalone sign tests,
bypass-case test).
P1: (5) fix RTS expectation to 6–9mo; (6) strengthen OKC extension caution;
(7) extend protected boundary / add boundary tests.
P2: (8) add diagnostic + risk-factor citations.
