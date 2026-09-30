# RF Diagnosis / Classification / Red-Flags Audit

## Structural finding that reframes everything (#1 finding)
**Two parallel RF systems exist and disagree:**
1. **Governed JSON rule pack** (`rf/rules/objects/RF-*.json`) — all
   `approval_status:pending`, `executable:false`, "not wired into any runtime."
   Extraordinarily conservative: forbids diagnosing from mechanism, forbids
   numeric confidence, forbids RTP-day prediction, forbids equating functional
   with structural grade.
2. **Live beta engine** (`rfBetaEngine/*.mjs` + `rfBetaAppAdapter/`) — wired to
   the UI (RfDiagnosisCard.jsx) and does almost everything the JSON pack
   prohibits: Bayesian per-feature LRs, numeric confidence_percent, severity
   bands, `probable_subtype: grade_2_3_central_tendon_suspect`, `estimated_rtp_days`.

**The "governed" layer is not governing what users actually see.** This is the
top governance/safety issue — must reconcile before clinical sign-off.

## Rule-by-rule (JSON claims mostly sound; live engine violates several)
- **RF-DX-001** (mechanism activates questions, not diagnostic weight): CONFIRMED
  claim, but **engine conflict** — rfConfidenceResolver gives mechanism a positive
  LR and rfAssessmentModel weights mechanism:8 toward confidence.
- **RF-DX-003** (pop = concern, not diagnostic): CONFIRMED, but **engine conflict**
  — live engine treats pop as +6 confidence + structural_tear_pattern override
  setting severity_band='red_flag', rtp 35–60d.
- **RF-DX-002/004/005/006/007/008:** CONFIRMED (non-specific history features;
  self-tests supporting-only; no raw-image interpretation; anchor handling).
- **RF-SEV-001/002/003/004:** CONFIRMED and well-hedged. SEV-003 (central-
  aponeurosis widens uncertainty) is the best-supported severity rule (Cross 2004
  central 26.9d vs peripheral 9.2d; McAleer 2022 BAMIC-c slower).
- **RF-SEV-005** (self-reported fibrosis = history, not severity): CONFIRMED claim,
  **engine conflict** — rfConfidenceResolver adds LR.scar_reported as diagnostic
  weight.
- **rfSeverityResolver.mjs live grading:** QUESTIONABLE wording — maps a functional
  questionnaire onto a **structural "Grade II"** with no evidence and against
  SEV-001/002. Remove "Grade II" language.
- **RF-SAF-001..008 (adult safety pack):** ALL CONFIRMED, clinically sound
  (compartment-syndrome screen, delayed deterioration, vascular/neuro, avulsion/
  full-thickness block, contusion out-of-scope, new-flags-override). Correctly
  refuses to confirm/exclude.
- **RF-RECUR-001/002:** CONFIRMED but INCOMPLETE — collects recency but treats it
  as non-actionable, understating recent-prior-quad-strain OR 25.2 and the ~15-wk
  elevated-risk window (Orchard 2020).

## MISSING (clinically important)
1. **[SAFETY, highest] Adolescent AIIS-avulsion pathway absent.** No RF-SAF rule
   has an age/skeletal-maturity trigger; age isn't even a core input field — it
   only appears as a *confidence* LR (age_under_20_kicking=1.5). An adolescent
   with a "kicking strain" (exact AIIS-avulsion presentation, Ferraro 2023: AIIS
   = 33.4% of adolescent pelvic avulsions) gets a rehab plan instead of imaging.
2. Sex as prognostic signal (McAleer 2022: all complete proximal free-tendon RF
   ruptures were female sprinters) — not captured.
3. The 15-week recurrence window + recency gradient (OR 25.2 recent vs 5.2) — not
   represented.
4. BAMIC-c/central-tendon as the explicit slow-healing/higher-recurrence pivot —
   underused.

## Priority fixes
1. **[SAFETY] Add age/skeletal-maturity red-flag route** — collect age as core;
   immature + anterior-thigh + kicking/sprint mechanism → imaging/referral, not
   rehab.
2. **[GOVERNANCE] Reconcile spec-vs-engine** — the live engine delivers the
   weighted diagnosis/numeric confidence/structural-grade/RTP-days its own JSON
   pack prohibits.
3. **[WORDING] Remove structural-grade language** from functional output
   (rfSeverityResolver "Grade II"; rfAssessmentModel probable_subtype).
4. **[CLINICAL] Stop using self-reported scar + unvalidated tests as numeric
   diagnostic weight** (no published RF LRs exist).
5. Represent recurrence quantitatively (15-wk window, recency gradient).
6. Surface BAMIC-c/central-tendon as the slow-healing pivot when documented.

**Well-supported, keep:** the entire adult RF-SAF safety pack; SEV-002/003/004;
DX-005/006; the JSON pack's conservatism is clinically correct — the problem is
the live engine is *less* conservative than its own spec.
