# RF Exercise Prescription & RTS Criteria Audit

## Two layers exist
1. **Governed knowledge layer** (`RF-REHAB-*.json`, `RF-RTS-*.json`, `RF-EX-*.json`)
   — all `approval_status: pending`, `executable: false`, every RF-EX has
   `active_prescription_present: false` + empty `evidence_claim_ids`. Explicitly
   *prohibits* inventing universal dosage (RF-REHAB-004) and treats RTS as a
   separate ungranted decision.
2. **Beta engine** (`rfBetaEngine/`) — actually ships concrete sets/reps/RPE/
   tempo and LSI % thresholds, with a citation registry that labels each claim
   VALIDATED/CONSISTENT/BETA and flags hamstring→RF extrapolation (unusually
   rigorous self-disclosure).

## Governance rules — all CONFIRMED as sound principles
RF-REHAB-001..006 and RF-RTS-001..004 are architecture rules, correctly graded,
consistent with criteria-based (not time-based) progression, multi-domain RTS
batteries (Pecci 2026, Perna 2024), and persistence of strength deficits past
symptom resolution (Maniar 2016). **RF-REHAB-004 (no universal dosage without an
approved source) is the single most important honest statement in the rule set.**

## Prescription rule pack & exercises — CONFIRMED
6-phase Aspetar-style model self-graded `indirect`/`E1` (accurate — no RCT
validates this exact structure for RF). Sampled exercises (RF-EX-001,005,010,015,
020,045,050,055,060,090,095,100,103,107) are all metadata shells; as *selections*
they're clinically plausible and correctly sequenced (isometrics early → posterior
before forward lunge → reverse Nordic/long-length eccentric → plyometric only in
Simulation with manual-review gating). RF-EX-103 (Baroni 2024) is an exemplary,
careful citation ("comparable, not superior"). No sampled exercise is
contraindicated for its phase.

## MOST SIGNIFICANT FINDING — the LSI phase-gate (`rfProgressTracker.mjs`)
Implements gates: Transition ≥70%, Simulation ≥85%, Resilience/RTS ≥90%,
**self-reported by the patient estimating "what % can you do on the injured leg."**
Problems:
1. **Citation mismatch (UNSUPPORTED):** cites Buckthorpe 2019 (a *prevention*
   paper) and Hickey 2022 (eccentric-loading timing) — neither establishes these
   70/85/90% single-leg-squat LSI gates. Numbers presented with sourcing that
   implies validation.
2. **Construct-validity:** a subjective patient % estimate, not isokinetic
   dynamometry or hop testing — materially weaker than the "LSI" of the borrowed
   literature (Grindem 2016, Simonsson 2024, Wellsandt 2017).
3. **Contradicts the app's own RF-RTS-003** (home-only assessment must not be
   presented as equivalent to supervised testing). The gate's `status:'cleared'`
   / "gate cleared" language is exactly the pattern RF-RTS-002/003 exist to
   prevent.
4. **Timeliness:** 2024–2026 evidence (Simonsson 2024 BJSM, Hamrin Senorski
   2026, Pecci 2026) has moved to skepticism about LSI cutoffs (AUC 0.50–0.59)
   and rates quad/RF-specific RTP-criteria evidence low-to-very-low certainty.
5. **Missing domain:** psychological readiness / kinesiophobia absent entirely.

## SESSION_TIER_STRUCTURE dosage — OUTDATED vs the engine's own governance
`rfEliteSessionContent.mjs` ships week-by-week sets/reps/RPE numbers despite
RF-REHAB-004 prohibiting invented universal dosage. Some blocks trace cleanly
(Foundation/Reload → PMC11338860; running → Lorenz 2020); most RPE progression
(2→8) and set/rep numbers have no traceable citation → treat as BETA, disclose
inline.

## Direct-head vs indirect-head — MISSING NUANCE (moderate, not safety)
Real, prognostically important distinction (Pesquer 2016, Ouellette 2006; direct/
central-tendon strains slower to heal, McAleer 2022). Engine's Pattern A/B/C and
central-tendon penalty (-35 score, +20 isometric) behave conservatively in the
right direction but don't encode the precise anatomic distinction.

## Priority fixes
1. **Fix/rescope the LSI gate (highest):** strip the non-supporting citations and
   relabel BETA, or source real thresholds while disclosing low certainty. This
   is the one place a user could get unwarranted confidence to advance to
   higher-risk loading.
2. Reconcile SESSION_TIER_STRUCTURE numbers with RF-REHAB-004 (inline BETA
   disclosure + clinician sign-off before serving).
3. Add psychological-readiness / kinesiophobia as an explicit RTS domain.
4. Add explicit direct-vs-indirect-head modeling (or document the proxy).

## Do NOT change (well-supported)
6-phase criteria-based architecture; dosage-prohibition governance; VAS≤3
pain-guided loading (Hickey 2020); reverse-Nordic/eccentric rationale;
conservative gating of plyometric/kicking/sprint behind Simulation review;
RF-RTS family's insistence on separate, multi-domain, non-time-based RTS.
