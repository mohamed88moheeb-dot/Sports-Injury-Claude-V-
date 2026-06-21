# RF Legacy Engine Conformance Map

> **Purpose.** Classify every clinically meaningful element of the legacy engine + RF knowledge
> against the now-present governing documents, to decide what the future *governed* RF path may
> reuse, what must be quarantined, and what must be replaced.
>
> **No application code was changed.** No engine was wired into the live RF flow. No clinical rule
> or evidence mapping was invented. `RecoveryContext.jsx`, UI, and Supabase untouched.
>
> Audit date 2026-06-15, branch `main`. **This revision verifies the prior map against the actual
> documents** (see §0.1 for what changed).

---

## 0. Governing documents (now present and read)

The governing reference snapshots are committed read-only in the repo and were read in full for
this revision:

- `docs/governance/Master_Architecture_V3.1_Final.md` (1241 lines) — "Master Architecture V3.1 —
  Unified Controlling Architecture".
- `docs/governance/Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2.md` (1319 lines) —
  "Master Rectus Femoris Clinical Rule Specification v1.2 — Gate A reconciled candidate".

Authoritative originals remain in the separate clinical-system repository; these copies are
implementation references only.

**Governance facts that frame every classification below:**

- RF v1.2 is a **Gate A candidate; every rule is `approval_status: pending`** and *not* approved
  for executable release (v1.2 §18, §19, §16.1: "`approval_status: pending` … cannot enter an
  approved executable release"). Gate C software implementation may implement *only approved
  machine-readable objects* (V3.1 §27 CI gate; v1.2 §18.3). **Therefore no legacy module may be
  wired now, and even a faithful reimplementation must wait for Gate B/C.**
- Clinical-content rules **MUST cite valid `evidence_claim_ids`**; architecture rules **MUST cite
  `architecture_refs`** (v1.2 §4.3; V3.1 §34.2). **No reviewed legacy file contains any QRF claim
  ID or any V3.1 architecture reference** — so no legacy clinical assertion is traceable, by
  construction.

### 0.1 What changed in this revision (corrections to the previous, inference-only map)

1. **Red-flag/safety severity model upgraded from "untraceable" to `CONFLICTS_WITH_GOVERNED_MODEL`.**
   The legacy `none|caution|urgent` model is not merely missing claim IDs — it is a *different,
   non-closed vocabulary* than the governed eight-state matrix (v1.2 §7.1; V3.1 §21), which
   explicitly rejects free-form replacements like `MONITOR` and "relevant targets".
2. **Legacy quad subtypes upgraded from "identity unverified" to verified identity mismatch /
   conflict** against the permitted identity states (v1.2 §8.2). Several legacy subtypes have *no*
   governed identity state, and contusion/neuro/severe-tear must route to safety/out-of-scope, not
   a scored strain diagnosis (v1.2 §3.2, RF-SAF-006, RF-SAF-007).
3. **Numeric-confidence conflict tied to specific invariants**: v1.2 §15.1, V3.1 §8.2 and §24.1
   (`calibrated:false` requires `numeric_value:null`), not a generic objection.
4. **Diagnosis-authorizes-plan conflict tied to RF-REHAB-001 and V3.1 §8/§22**, with exact
   invariant text.
5. **New §0 finding**: the legacy model is missing entire *core clinical objects* required by
   v1.2 §5 (safety_state, six confidence objects, injury_history_modifier, monitoring_contract,
   readiness_profile) — a structural gap, not just per-element drift.
6. Added §9.x verification of dosage, phase-timing, adaptation, pain-rule, and return-to-sport
   conflicts against the exact prohibitions, and §"Untraceable-but-aligned" for elements whose
   intent matches v1.2 yet cannot be reused as-is.

Classification legend (unchanged):

| Code | Meaning |
|---|---|
| `REUSE_NON_CLINICAL` | Pure scaffolding/mechanics with no clinical assertion; safe to keep. |
| `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Useful structure, but currently carries clinical content/thresholds that must move to the governed model before reuse. |
| `CONFLICTS_WITH_GOVERNED_MODEL` | Behavior contradicts a specific v1.2 / V3.1 provision. |
| `QUARANTINE_NO_GOVERNED_BASIS` | Emits clinical content with no traceable claim ID / architecture ref. |

---

## 1. Verified subtype-identity mapping (legacy `quadriceps.js` → v1.2 §8.2 states)

v1.2 permits exactly these injury-identity states (§8.2): `RF_INJURY_SUSPECTED`,
`RF_MUSCLE_INJURY_DOCUMENTED`, `RF_CENTRAL_APONEUROSIS_OR_INTRATENDINOUS_DOCUMENTED`,
`RF_PROXIMAL_TENDON_INJURY_DOCUMENTED`, `RF_RECURRENT_INJURY_SUSPECTED_OR_DOCUMENTED`,
`DIRECT_QUADRICEPS_CONTUSION_SUSPECTED`, `OTHER_ANTERIOR_THIGH_CONDITION_POSSIBLE`,
`DIAGNOSIS_UNRESOLVED`, `OUT_OF_SCOPE_PRESENTATION`. (`RF_RECURRENT_WITH_REPORTED_FIBROSIS` is
explicitly removed.)

| Legacy subtype id (`quadriceps.injurySubtypes`) | Nearest v1.2 identity state | Verdict | Reason |
|---|---|---|---|
| `rectus_femoris_strain` | `RF_INJURY_SUSPECTED` (only) | `CONFLICTS_WITH_GOVERNED_MODEL` | Legacy emits it as a scored, ranked *diagnosis* with numeric confidence; v1.2 §8.1 permits only a ranked possibility / suspected state, never autonomous confirmation. Identity-as-confidence-score mismatch. |
| `vastus_lateralis_strain`, `vastus_medialis_irritation` | `OTHER_ANTERIOR_THIGH_CONDITION_POSSIBLE` at best | `CONFLICTS_WITH_GOVERNED_MODEL` | No governed RF identity for individual vasti; v1.2 scopes the module to RF (§3.1). Scoring them as discrete diagnoses has no governed basis. |
| `quadriceps_contusion` | `DIRECT_QUADRICEPS_CONTUSION_SUSPECTED` (limited-handling only) | `CONFLICTS_WITH_GOVERNED_MODEL` | v1.2 §3.2 + RF-SAF-007: a direct blow routes to the contusion branch *or* `OUT_OF_SCOPE`; it must **not** be forced into an RF strain rehab pathway. Legacy assigns it a full strain-style plan. |
| `quadriceps_tendon_pain`, `patellar_tendon_overlap` | `OTHER_ANTERIOR_THIGH_CONDITION_POSSIBLE` / out of RF scope | `CONFLICTS_WITH_GOVERNED_MODEL` | Patellar-tendon overlap is anterior-knee, not RF; no governed RF identity. |
| `hip_flexor_rectus_femoris_overlap` | `OTHER_ANTERIOR_THIGH_CONDITION_POSSIBLE` / differential | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Legitimate differential per v1.2 §8.11, but legacy scores it as a diagnosis rather than carrying it as an unranked differential. |
| `femoral_nerve_related_anterior_thigh_pain` | safety/referral, not a rehab subtype | `CONFLICTS_WITH_GOVERNED_MODEL` | v1.2 routes neuro symptoms to RF-SAF-004 (vascular/neurological compromise) / RF-DX-005 neural differential; never a scored rehab subtype. |
| `severe_quad_tear_risk` | `RF_PROXIMAL_TENDON_INJURY_DOCUMENTED` only if documented; else safety | `CONFLICTS_WITH_GOVERNED_MODEL` | RF-SAF-006 + RF-SEV-004: suspected full-thickness/severe → `REHAB_BLOCKED`, no generic plan, no autonomous timing. Legacy treats it as a rankable scored subtype. |
| *(none)* | `RF_CENTRAL_APONEUROSIS_OR_INTRATENDINOUS_DOCUMENTED`, `RF_PROXIMAL_TENDON_INJURY_DOCUMENTED`, `DIAGNOSIS_UNRESOLVED`, `OUT_OF_SCOPE_PRESENTATION` | **Missing** | Legacy has no representation of the documented structural states, the unresolved state, or the out-of-scope state — so it cannot express the governed differential at all (v1.2 §8.11). |

**Verified structural gap:** the legacy model also lacks the *core clinical objects* v1.2 §5
requires to be maintained separately — `safety_state`, the **six** confidence objects (§15.1 / V3.1
§8.1), `injury_history_modifier` with provenance/confirmation (§6.2, RF-SEV-005),
`monitoring_contract` (§12), and `readiness_profile` (§14). Legacy collapses identity + severity +
plan-permission into one scored profile, which v1.2 §5 explicitly prohibits ("must not be
collapsed into one identity enum … generic severity or confidence score").

---

## 2. `data/injuryKnowledge/quadriceps.js`

| Element | Classification | Verified basis |
|---|---|---|
| `injurySubtypes` (scored diagnostic labels) | `CONFLICTS_WITH_GOVERNED_MODEL` | §1 above; v1.2 §8.1–8.2, §5. |
| `diagnosisRules` (point weights → confidence) | `CONFLICTS_WITH_GOVERNED_MODEL` | RF-DX-001 ("v1.2 does not assign RF diagnostic probability weight"); v1.2 §8.11 ("Numeric probabilities remain prohibited until … calibrated"); §15.1. |
| `redFlags` (`quad_severe_tear_signs`, `quad_compartment_after_contusion`, `requireCount:2`) | `CONFLICTS_WITH_GOVERNED_MODEL` | Hidden composite thresholds + the contusion/compartment routing belongs to RF-SAF-001/002/007 with `URGENT_REFERRAL`/`OUT_OF_SCOPE` and `blocked_targets:all`; RF-SAF-001 also forbids stating compartment syndrome is "confirmed or excluded". Legacy severity tags (`urgent`) are not the governed eight-state output. |
| `assessmentQuestions` (text/structure) | `REUSE_NON_CLINICAL` | Question wording is reusable scaffolding once decoupled from `redFlagTrigger` and from scored diagnosis. |
| `assessmentQuestions[].redFlagTrigger` (e.g. `numbness_burning → urgent`) | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | The signal aligns with RF-SAF-004 in spirit, but the trigger→state mapping must be authored as a governed rule object (v1.2 §16) with claim/arch refs. |
| `selfTests` (incl. `whatItDoesNotProve`, `doNotPerformIf`, `cannot_assess` semantics) | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Intent aligns with RF-DX-005 and V3.1 §9.2 prohibited inferences (see §"Untraceable-but-aligned"), but untraceable (no QRF id) and must adopt the reliability model of V3.1 §9.1. |
| `detailedAreas` (id set) | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Anatomical labels reusable once mapped to the governed input contract (v1.2 §6.1 "exact location"). |
| `exerciseLibrary` prescriptions (`5 x 10–15 sec`, `4 x 20–45 sec`, `3 x 12–15 reps`, …) | `CONFLICTS_WITH_GOVERNED_MODEL` | RF-REHAB-004 **PROHIBITION** "no universal RF dosage"; v1.2 §10.2, §3.3, Appendix C, §17 case 28 (universal RF sets/reps/frequency → "CI fails"). |
| `exerciseLibrary` names/cues/commonMistakes/progression graph | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Could feed the shared exercise ontology (v1.2 §11.1; V3.1 §35) but only as ontology metadata, never hard-coded dosage; v1.2 §11 forbids a hard-coded RF exercise list. |
| `PAIN_RULES.*` references | `CONFLICTS_WITH_GOVERNED_MODEL` | v1.2 §12.3: "present RF evidence does not establish universal pain thresholds … No profile becomes active until separately reviewed and tested." |

---

## 3. `lib/injuryEngine/scoringEngine.js`

| Element | Classification | Verified basis |
|---|---|---|
| `scoreSubtypes()` weighted summation | `CONFLICTS_WITH_GOVERNED_MODEL` | RF-DX-001 (no mechanism/diagnostic weighting); v1.2 §8.11. |
| `normalize()` → `CONFIDENCE_CAP = 96` numeric % | `CONFLICTS_WITH_GOVERNED_MODEL` | v1.2 §15.1 numeric percentages prohibited pre-calibration; V3.1 §8.2 + §24.1 `calibrated:false` requires `numeric_value:null`. Emitting any 0–96 number violates the calibration invariant. |
| `getConfidenceBand()` / `CONFIDENCE_BANDS` ("High/Very high pattern match") | `CONFLICTS_WITH_GOVERNED_MODEL` | Single diagnosis-match band collapses the six confidence objects (v1.2 §15.1; V3.1 §8.1) and, per V3.1 §24.2, a high band is prohibited while evidence completeness is blocking. |
| `conditionMatches()` matching mechanics | `REUSE_NON_CLINICAL` | Pure predicate evaluation — reusable *only* if decoupled from confidence output. Embedded `pain >= 4` / `1–3` / `0` cut-offs are hidden clinical thresholds to externalize (v1.2 §12.3). |
| ranking/sort | `REUSE_NON_CLINICAL` | Generic. |

---

## 4. `lib/injuryEngine/diagnosisEngine.js`

| Element | Classification | Verified basis |
|---|---|---|
| `diagnoseInjury()` → `primaryPattern.confidence` + `alternatives[].confidence` | `CONFLICTS_WITH_GOVERNED_MODEL` | Numeric confidence (v1.2 §15.1; V3.1 §24.1). |
| single `riskLevel` + `maxRisk()` escalation | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | "Most-cautious-wins" is sound, but inputs are ungoverned and the output must become the eight-state safety object (V3.1 §21), not a `low/moderate/refer` enum. |
| `buildNextStep()` `topConfidence < 40` branch | `CONFLICTS_WITH_GOVERNED_MODEL` | Hidden numeric threshold driving a clinical recommendation (v1.2 §15.1, §8.11). |
| `referralRecommended` | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Referral intent aligns with RF-SAF rules but must be expressed via a governed safety_state + referral object (V3.1 §20, §22). |
| `DISCLAIMER` passthrough, `emptyResult()` conservative fallback | `REUSE_NON_CLINICAL` | Structural; aligns with v1.2 §6.3 missing-data behavior in spirit. |

---

## 5. `lib/injuryEngine/safetyEngine.js`

| Element | Classification | Verified basis |
|---|---|---|
| `none | caution | urgent` severity model + `highestSeverity` | `CONFLICTS_WITH_GOVERNED_MODEL` | **Not** the closed eight-state matrix. v1.2 §7.1: "Free-form replacements such as `MONITOR`, partial urgent blocks, or 'relevant targets' are not valid V3.1 states"; V3.1 §21 closed `oneOf` over eight states. |
| `buildRecommendation()` "No red flags were detected … not a diagnosis" | `CONFLICTS_WITH_GOVERNED_MODEL` | Unsupported autonomous *clearing*. V3.1 §7.3: "Unknown is not negative"; safety is escalation-only and a fixed checklist cannot grant `CLEAR`. Also conflicts with RF-SAF-001's bar on asserting a condition is "excluded". |
| `blockAggressiveRehab = urgent OR cautionCount >= 2` | `CONFLICTS_WITH_GOVERNED_MODEL` | Invented `>=2` threshold; rehab-blocking must come from a governed `REHAB_BLOCKED` state (V3.1 §21), not an aggregate count. |
| flag-collection mechanics (`checkSafety` loop, `regionFlagTriggered`, severity max-reduction) | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | The *plumbing* could survive, but only feeding governed rule objects (RF-SAF-001..008) and emitting the eight-state object. |
| `shouldOverrideToReferral()` | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Depends on ungoverned severity input. |

---

## 6. `lib/injuryEngine/rehabPlanGenerator.js`

| Element | Classification | Verified basis |
|---|---|---|
| `generateRehabPlan(diagnosis, …)` — plan keyed off `diagnosis.primaryPattern.id` | `CONFLICTS_WITH_GOVERNED_MODEL` | **Diagnosis-authorizes-plan.** v1.2 §1 ("must never treat a diagnosis label as sufficient to generate a full rehabilitation plan"), RF-REHAB-001 ("diagnosis alone never authorizes a full plan; a locked safety-confidence object cannot coexist with a full plan"); V3.1 §8 ("Rehab Engine consumes safety_confidence and stage_confidence, not diagnosis_confidence") and §22 ("locked safety confidence cannot coexist with a full plan"). |
| `decideStartPhase()` (`days <= 3`, `pain >= 6`, `pain <= 3 && days >= 7`) | `CONFLICTS_WITH_GOVERNED_MODEL` | v1.2 §10.2 "Phase is determined by criteria and current capacity, not time alone"; hidden thresholds. |
| `phases[].locked = idx < startIndex` ("earlier phases considered already cleared") | `CONFLICTS_WITH_GOVERNED_MODEL` | Autonomous clearing of earlier phases; v1.2 §10.2 requires entry evidence per phase; V3.1 §7.3 (no permanent clear). |
| `buildPersonalizationNotes()` (pain ≥6/≤3, self-test pain ≥5 gating) | `QUARANTINE_NO_GOVERNED_BASIS` | Hidden thresholds, no claim IDs (v1.2 §12.3). |
| `painRulesReminder` ("≤ ~3/10 … within 24 hours") | `CONFLICTS_WITH_GOVERNED_MODEL` | v1.2 §12.3 no universal pain threshold. |
| `buildReturnToSport()` / `resolveMaintenance()` | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Pulls ungoverned RTS ladders/criteria; governed RTS is multi-domain (v1.2 §14, RF-FIELD-001/002/003, RF-RTS-001..004) and must replace any date- or single-criterion logic. (Note: legacy does **not** encode the blocked MSS%, 320/400% isokinetic, or 1:3/1:5/1:7 ratios — those Appendix C items are *absent*, hence not flagged as present conflicts.) |
| `conservativeFallback()` | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Safe-by-default; aligns with v1.2 §6.3 / RF-SAF-006 but `riskLevel:'refer'` must become a governed state. |
| `resolveExercise()` equipment resolution | `REUSE_NON_CLINICAL` | Pure capability matching; maps to selection-logic step 6 (v1.2 §11.2). |

---

## 7. `lib/injuryEngine/adaptationEngine.js`

| Element | Classification | Verified basis |
|---|---|---|
| `adaptPlanFromCheckin()` green/yellow/red tree (`painDuring>=6`, `>=4&&<=5`, `painNextMorning>=6/3`, `stiffness>=4`, `confidence<=4`) | `CONFLICTS_WITH_GOVERNED_MODEL` | v1.2 §12.3 (no universal pain thresholds; profile must be reviewed/tested before activation), §17 case 25 ("no automatic progression"). |
| `volumeAdjustment` multipliers (`0.5/0.8/1.0/1.1`) | `CONFLICTS_WITH_GOVERNED_MODEL` | Fixed dosage adjustment; RF-REHAB-004 PROHIBITION; v1.2 Appendix C ("progression increments"). |
| GREEN → auto-`PROGRESS` | `CONFLICTS_WITH_GOVERNED_MODEL` | Autonomous progression authorization; v1.2 §12.4 allows exactly one traceable action and forbids automatic progression (§17 case 25). |
| RED neuro/spreading → `REFER` | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Aligns with RF-SAF-004/RF-SAF-008 intent but must be a governed safety re-run emitting the eight-state object, not a fixed branch. |
| `normalizeCheckin`, `num`, `result`, `swapAllToEasier`, `swapHardestToEasier`, explanation builders | `REUSE_NON_CLINICAL` | Input normalization / selection plumbing / text assembly. |

The legacy three-zone model also conflicts structurally with v1.2 §12.4's **ten-action** single-
choice set and the requirement that the chosen action be traceable to specific inputs and rules.

---

## 8. `lib/injuryEngine/planAdapter.js`, `sessionScheduler.js`

| Element | Classification | Verified basis |
|---|---|---|
| `planAdapter.selectProtocolId()` (regex on area/mechanism/symptoms → protocol) | `CONFLICTS_WITH_GOVERNED_MODEL` | Diagnosis-/mechanism-authorizes-plan; RF-DX-001 (mechanism activates questions, not weighting), RF-REHAB-001. |
| `planAdapter.PHASE_RPE` (fixed RPE per phase) | `CONFLICTS_WITH_GOVERNED_MODEL` | Universal dosage; RF-REHAB-004. |
| `planAdapter.getAdaptedSession()` orchestration | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Embeds protocol selection + dosage. **Live-flow note:** this is the *only* reviewed module currently wired (via `RecoveryContext`); quarantine applies to the future governed RF path and does **not** authorize changing existing behavior. |
| `planAdapter` equipment mapping (`buildUserTokens`, `hasRequiredEquipment`, `EQUIPMENT_TOKEN`, `resolveAltLabel`) | `REUSE_NON_CLINICAL` | Pure capability matching (v1.2 §11.2 step 6). |
| `planAdapter.PHASE_FALLBACK` / `findBestPhase` | `REUSE_NON_CLINICAL` | Generic nearest-phase fallback. |
| `sessionScheduler.buildSession()` block assembly + rotation | `POTENTIALLY_REUSABLE_AFTER_REFACTOR` | Block templating is reusable scaffolding, but it injects `periodizationContext` (sets/reps/rpe) — clinical dosage. |
| `sessionScheduler` `PHASE_PERIODIZATION` / `SESSION_BLUEPRINTS` usage (sets `3–4`, reps `6–8`, RPE bands) | `CONFLICTS_WITH_GOVERNED_MODEL` | Universal dosage; RF-REHAB-004 PROHIBITION; v1.2 §10.2. |
| `sessionScheduler.buildWeekSchedule()` + `restDaysForStreak()` | `CONFLICTS_WITH_GOVERNED_MODEL` | Streak-based rest shrinkage is a time/progression rule with hidden thresholds; v1.2 §10.2 (criteria not time), §12. |
| `groupByBlock`, `rotatePick`, `clamp`, `blockLabel`, `describeSession/Week` | `REUSE_NON_CLINICAL` | Selection/labelling/text. (Note `describeSession` echoes a `≤3/10` pain line — governed copy only.) |

---

## 9. Cross-cutting verified findings (the items the task requires explicitly)

- **Numeric confidence outputs** → `CONFLICTS`. scoringEngine cap 96, `CONFIDENCE_BANDS`,
  diagnosisEngine `confidence`/`alternatives[].confidence`. Violates v1.2 §15.1, V3.1 §8.2 & §24.1
  (`calibrated:false` ⇒ `numeric_value:null`). The single match-score also collapses the **six**
  required confidence objects (v1.2 §5/§15.1; V3.1 §8.1).
- **Fixed sets/reps/dosage/timelines** → `CONFLICTS`. quad prescriptions; `PHASE_PERIODIZATION`;
  `SESSION_BLUEPRINTS`; `PHASE_RPE`; adaptation multipliers; `decideStartPhase` day/pain timing;
  `restDaysForStreak`. Violates RF-REHAB-004 PROHIBITION, v1.2 §10.2, §3.3, Appendix C, §17 case 28.
- **Diagnosis-authorizes-plan** → `CONFLICTS`. `rehabPlanGenerator(diagnosis,…)` and
  `planAdapter.selectProtocolId`. Violates v1.2 §1, RF-REHAB-001; V3.1 §8 & §22.
- **Unsupported red-flag clearing or diagnosis** → `CONFLICTS`. safetyEngine "No red flags
  detected"; adaptation GREEN→PROGRESS; `phases[].locked` auto-clear. Violates V3.1 §7.3
  ("unknown is not negative"; no permanent clear), v1.2 §12.4 (no automatic progression),
  RF-SAF-001 (no "excluded" claim).
- **Subtype/identity mismatches** → see §1: most legacy subtypes `CONFLICTS`; documented/unresolved/
  out-of-scope states `Missing`. Violates v1.2 §8.2, §5, §3.2, RF-SAF-006/007.
- **Missing evidence claim IDs** → **confirmed absent in every file.** No QRF-xxx anywhere; v1.2 §4.3
  / V3.1 §34.2 require them for clinical-content rules.
- **Missing architecture references** → **confirmed absent.** No `V3.1-§` reference in any module.
- **Hidden clinical thresholds** → confidence cap 96; band cut-offs; `pain>=4` self-test inference;
  `cautionCount>=2`; next-step `confidence<40`; adaptation pain/stiffness/confidence cut-offs;
  `decideStartPhase` (`days<=3`, `pain>=6/<=3`, `days>=7`); self-test gating `pain>=5`;
  `restDaysForStreak`. All conflict with v1.2 §12.3/§10.2 and V3.1 §8.2/§24.1.
- **Safety-state vocabulary mismatch** → legacy `none/caution/urgent` ≠ the eight V3.1 states
  (`CLEAR`, `CLEAR_WITH_MONITORING`, `INFORMATION_REQUIRED`, `TEST_BLOCKED`, `REHAB_BLOCKED`,
  `URGENT_REFERRAL`, `EMERGENCY_SIGNPOSTING`, `OUT_OF_SCOPE`) with `blocked_targets`/`clears_when`
  (v1.2 §7.1; V3.1 §21–22). No legacy module emits `blocked_targets: all` for urgent/emergency/
  out-of-scope, as the matrix requires.
- **Return-to-sport** → `buildReturnToSport` is ungoverned and date/single-criterion-shaped, conflicting
  with multi-domain readiness (v1.2 §14, RF-RTS-001..004). The specific Appendix-C blocked RTS
  parameters (MSS %, 320/400% isokinetic, 1:3/1:5/1:7) are **not present** in legacy code, so they are
  recorded as "absent — do not introduce", not as live conflicts.

### Untraceable-but-aligned (resemble governed content but cannot be reused as clinical logic)

These legacy elements are *directionally consistent* with v1.2 yet carry no claim IDs / arch refs,
so they remain quarantined as clinical logic (reusable only as non-clinical scaffolding):

- self-test framing `whatItDoesNotProve` / `doNotPerformIf` / `cannot_assess` ≈ RF-DX-005 + V3.1 §9.2
  four prohibited inferences;
- `CONFIDENCE_CAP = 96` comment "never imply certainty" + `DISCLAIMER` ≈ non-definitive principle
  (v1.2 §8.1, §15.3);
- safetyEngine "never claims a diagnosis" + referral override ≈ RF-SAF escalation intent;
- adaptation "new neuro/spreading ⇒ refer" ≈ RF-SAF-004 / RF-SAF-008;
- `conservativeFallback` (refer/conservative-only when no protocol) ≈ v1.2 §6.3 missing-data behavior.

---

## Summary

### 1. Verified conflicts
- **Numeric diagnostic confidence** (scoringEngine cap-96, `CONFIDENCE_BANDS`, diagnosisEngine) — v1.2 §15.1; V3.1 §8.2, §24.1.
- **Diagnosis-authorizes-plan** (rehabPlanGenerator, planAdapter.selectProtocolId) — v1.2 §1, RF-REHAB-001; V3.1 §8, §22.
- **Universal/fixed dosage and timelines** (quad prescriptions, PHASE_PERIODIZATION, SESSION_BLUEPRINTS, PHASE_RPE, adaptation multipliers, decideStartPhase, restDaysForStreak) — RF-REHAB-004; v1.2 §10.2, §3.3, App. C.
- **Unsupported clearing / auto-progression** (safetyEngine "no red flags", adaptation GREEN→PROGRESS, phase auto-lock) — V3.1 §7.3; v1.2 §12.4.
- **Non-governed safety vocabulary** (`none/caution/urgent`, `blockAggressiveRehab>=2`) — v1.2 §7.1; V3.1 §21–22.
- **Subtype-identity mismatch** (scored quad subtypes vs the nine permitted states; contusion/neuro/severe must route to safety/out-of-scope) — v1.2 §8.2, §3.2, RF-SAF-006/007.
- **Universal pain rules** (`PAIN_RULES`, `painRulesReminder`, adaptation thresholds) — v1.2 §12.3.

### 2. Verified reusable scaffolding (`REUSE_NON_CLINICAL`, decoupled from clinical I/O)
Equipment capability resolution (`buildUserTokens`/`hasRequiredEquipment`/`resolveExercise`/`resolveAltLabel`/`EQUIPMENT_TOKEN`); block grouping & rotation (`groupByBlock`/`rotatePick`/`PHASE_FALLBACK`/`findBestPhase`); check-in input normalization (`normalizeCheckin`/`num`/`result`); severity max-reduction; condition-matching predicates (decoupled from confidence); text/label/debug renderers; assessment-question wording; exercise names/cues/common-errors as candidate ontology metadata (v1.2 §11.1, never with embedded dosage).

### 3. Legacy elements that resemble governed content but remain untraceable
Listed under "Untraceable-but-aligned" (§9): self-test non-diagnostic framing (≈RF-DX-005/V3.1 §9.2), confidence-cap "never imply certainty" + disclaimer (≈v1.2 §8.1/§15.3), safetyEngine "never claims a diagnosis"/referral override (≈RF-SAF), adaptation neuro→refer (≈RF-SAF-004/008), conservativeFallback (≈v1.2 §6.3). All lack QRF claim IDs / arch refs and so cannot enter the governed path as clinical logic — only the non-clinical scaffolding inside them is reusable.

### 4. Corrections to the previous map
Enumerated in §0.1: (1) safety severity model upgraded "untraceable" → `CONFLICTS` (non-closed vocabulary vs V3.1 §21); (2) quad subtypes upgraded "unverified" → verified identity mismatch / `CONFLICTS` with contusion/neuro/severe routing; (3) numeric-confidence tied to §24.1/§8.2/§15.1; (4) diagnosis→plan tied to RF-REHAB-001 + V3.1 §8/§22; (5) added the missing-core-objects structural gap (v1.2 §5); (6) added explicit dosage/phase/adaptation/pain/RTS verification and the untraceable-but-aligned set. No prior `REUSE_NON_CLINICAL` item was downgraded.

### 5. Recommended next development task
**Do not implement any clinical rule yet** — v1.2's own next action is *Gate B machine-readable
authoring, not product coding* (v1.2 §20), and all rules are `approval_status: pending` (Gate C
forbids implementing unapproved objects). The safest next *coding* task is therefore purely
structural: **add an automated boundary check that enforces the quarantine** — a CI/lint rule
asserting that nothing under `lib/clinical/**` imports any module listed in
`lib/clinical/rfLegacyQuarantineManifest.json` (the manifest already declares this rule). Pair it
with a `lib/clinical/` placeholder that imports nothing from `lib/injuryEngine/*`. This protects the
future governed path without authoring any clinical logic, dosage, threshold, or confidence value.

### 6. Files updated
- `docs/implementation/RF_LEGACY_ENGINE_CONFORMANCE_MAP.md` (this document).
- `lib/clinical/rfLegacyQuarantineManifest.json` (`presentInRepository: true`, exact paths,
  refined per-element verdicts, preserved import-ban rule).
- (Created as part of this task: the two read-only snapshots under `docs/governance/`.)

### 7. Confirmation that no runtime behavior changed
No application code was edited. `RecoveryContext.jsx`, all UI, Supabase config/migrations, and
dependencies are unchanged. No legacy engine was wired into any live flow; no legacy code was
deleted. The only writes are the two documentation/manifest artifacts and the two governance
snapshots — none are imported by any runtime module. **User-facing behavior is unchanged.**
