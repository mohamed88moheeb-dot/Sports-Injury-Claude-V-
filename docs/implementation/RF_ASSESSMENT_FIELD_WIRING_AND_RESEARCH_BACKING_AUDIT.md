# RF Assessment Field Wiring + Research-Backing Audit

**Type:** audit only — no UI, no engine rewrite, no knowledge-object changes. Documents whether each assessment field actually influences the RF diagnosis/confidence/severity/recovery/plan/safety output, and where research backing is still missing.

**Chain audited:** assessment screen → `RecoveryContext.assessment` key → `mapAssessmentToRfInput` key → RF beta engine input → resolver/output → research backing → test coverage.

**Status legend:**
`wired` = collected and changes RF output · `partially_wired` = reaches the engine but weakly/indirectly used · `collected_but_not_used` = on screen + in state but the RF mapper never reads it · `wired_but_beta_default_only` = drives output but via beta heuristics, not research · `wired_but_research_gap` = drives output but evidence is a known gap.

---

## 1. Field-by-field audit table

| # | Field label | Screen section | RecoveryContext key | RF input key | Diagnosis | Confidence | Severity | Recovery | Plan/session | Safety/review | Research backing | Wiring status | Where used | Test | Missing test | Recommended fix |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Injury location (region) | Step 1 (from /anatomy) | `primaryRegion` | (RF-compat gate) | — | — | — | — | — | — | n/a (router) | **wired** | `isRfCompatible` (rfBetaCompatibility.mjs); `generateProfile` branch | adapter test (`isRfCompatible`) | — | none |
| 2 | Exact area | Step 1 (from /anatomy) | `exactArea` | `pain_location` | ✓ (pattern) | ✓ | indirect | — | — | — | indirect (RF-DX context) | **wired** | `mapPainLocation`; `derivePattern`; `resolveConfidence` | output-to-profile + adapter | — | none |
| 3 | How it happened (mechanism) | Step 1 | `mechanism` | `mechanism` | ✓ (pattern) | ✓ | ✓ (moderate trigger) | — | — | — | indirect (RF load mechanism) | **wired** | `mapMechanism`; `resolveConfidence`; `resolveSeverity` | engine + adapter | — | none |
| 4 | Days since injury | Step 1 | `daysSince` | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | gap | **collected_but_not_used** | not read by mapper | — | days-since→phase/protection test | wire to acute-protection gating once researched |
| 5 | Symptom | Step 1 | `symptoms[]` (single) | scanned for bruising/weakness | — | indirect | ✓ (bruising/weakness) | indirect | — | indirect | beta default | **partially_wired** | `mapBruising`, `mapWeakness`, `resolveSeverity` | engine/adapter (bruising/weakness) | per-symptom mapping test | structured symptom→indicator map (researched) |
| 6 | Secondary area | Step 1 | `secondaryRegions` | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | gap | **collected_but_not_used** (legacy uses it) | not read by RF mapper | — | secondary-area effect test | defer — needs differential-Dx research |
| 7 | Sport | Step 2 | **`sport` (string)** | `sport_context`, `training_goal` (reads `a.sports[]`) | ✗ | ✗ | ✗ | ✗ | label only | ✗ | beta default | **wired_but_broken (key mismatch)** | `mapAssessmentToRfInput` reads `a.sports` but form writes `a.sport` | — | sport→sport_context test | **trivial fix:** read `a.sport ?? a.sports?.[0]` |
| 8 | Sport demands | Step 2 | `movements[]` | — | ✗ | ✗ | ✗ | ✗ | ✗ (no plan endpoint effect) | ✗ | gap | **collected_but_not_used** | not read by mapper | — | sport-demand→plan-endpoint test | wire to phase endpoint/exposure once researched |
| 9 | Equipment available | Step 2 | `equipment[]` | `equipment_available` | — | — | — | — | input only (no selection filter) | — | beta default | **wired_but_not_used downstream** | `mapEquipment` → input; session generator does NOT filter by it | — | equipment→exercise-selection test | wire equipment filter in `rfSessionGenerator` |
| 10 | Pain at rest | Step 3 | `painRest` | `pain_severity_label`, `ability_to_continue` | — | indirect | ✓ | ✓ | indirect | ✓ (≥6→review) | **wired_but_beta_default_only** | `mapPainSeverity`, `mapAbilityToContinue` | engine/adapter | threshold test | researched pain thresholds |
| 11 | Pain walking / stairs | Step 3 | `painWalking` | `walking_response`, `stairs_response`, severity | — | ✓ | ✓ | ✓ | indirect | ✓ | **wired_but_beta_default_only** | `mapResponseFromPain`, `resolveSeverity` | engine/adapter | threshold test | researched thresholds |
| 12 | Pain during sport | Step 3 | `painSport` | `ability_to_continue`, `stairs_response`, severity | — | indirect | ✓ | ✓ | indirect | ✓ (≥7→review) | **wired_but_beta_default_only** | `mapPainSeverity`, `mapAbilityToContinue` | engine/adapter | threshold test | researched thresholds |
| 13 | Free-text story | Step 3 | `story` | `previous_injury`, `reported_fibrosis_or_scar_history` (regex) | — | indirect (prev injury) | — | ✓ (lengthen modifiers) | — | — | beta default | **partially_wired** | `mapAssessmentToRfInput` regex scan | — | story-parse test | defer — NLP parsing needs design/research |
| 14 | Red flag — *each option* | Step 3 | `redFlags[]` | `red_flag_answers{}` | — | ✓ (withhold) | ✓ (high-concern) | ✓ | plan gated | ✓ (route to review) | indirect (RF-SAF) | **wired_but_undifferentiated** | `mapRedFlags`, `hasRedFlag`, `resolveConfidence`, `resolveSeverity` | engine (red-flag case) | per-red-flag routing test | per-flag routing map (which flag → which pathway) |

### Red-flag options individually (all 8 → same path today)
All eight (`cannot bear weight`, `severe swelling/deformity/bruise`, `major pop + unstable`, `locks/catches/gives way`, `numbness/tingling/radiating`, `calf swelling/warmth/SOB`, `groin/abdominal bulge`, `constant night/feverish`) map to truthy keys and trigger the **same** `hasRedFlag → withhold confidence + route to review + high-concern severity`. There is **no per-flag differentiation** (e.g. DVT vs neuro vs hernia routing). Status: `wired_but_undifferentiated` / indirect backing (RF-SAF block exists but per-flag routing not modelled in the beta engine).

---

## 2. Research-backing audit (fields + resolver rules)

| Item | Effect today | Backing class | Notes |
|---|---|---|---|
| Pattern (location+mechanism → RF pattern) | diagnosis label | **indirect** | `derivePattern` heuristic; RF-DX context exists but no validated classifier |
| Confidence factors/increments | match % | **beta default** (policy-anchored cap) | <85% cap is policy-backed (direct); the +/− increments are heuristics |
| Functional severity bands | gradeName wording | **indirect** | RF v1.2 §9.7 observation domains; exact cut-offs are a gap |
| Recovery window numbers | returnRange | **gap** | RF v1.2 §9.8 forbids individual numbers; beta display only |
| Phase model (6 phases) | plan structure | **indirect** | Aspetar QRF-019 acceptability; not effectiveness |
| Dosage (sets/reps/rest/intensity) | session cards | **beta default** | RF-REHAB-004 prohibits universal dosage; all labelled beta |
| Progression thresholds | (not user-driven yet) | **gap** | criteria named, numbers undefined |
| Regression / today check-in thresholds | today-only adjust | **beta default** | pain≥7/≥5, conf<40 heuristics |
| Exercise count / session volume | ≤3 Foundation, ≤4 later | **beta default** | QC caps, not researched volumes |
| Phase→week→day scheduling | one week per phase | **beta default** | engine has no week layer; synthetic |
| Equipment → selection | none | **gap (not used)** | input mapped, no filter applied |
| Days-since → phase entry | none | **gap (not used)** | not read |
| Sport-demand → plan endpoint | none | **gap (not used)** | not read |
| Secondary-area → differential | none | **gap (not used)** | not read |
| Free-text story parsing | prev-injury/fibrosis flags | **beta default** | regex only |

### Gap detail (decision it should drive · why insufficient · evidence needed · blocks?)
- **Days-since-injury → phase entry/protection:** should bias early protection vs readiness to load. Currently ignored (phase is criteria-based, but acute protection isn't gated by recency). Needs: evidence on acute-phase protection windows for RF. **Blocks production, not beta.**
- **Sport-demand → plan endpoint:** should shape Simulation/Resilience exposures (sprint/kick/jump). Ignored. Needs: demand-profile → required-capacity mapping (RF v1.2 §13 exists as structure, not executable). **Blocks production.**
- **Secondary-area → differential/confidence:** should lower confidence / add concurrent-injury constraints (RF-REHAB-006). Ignored in beta. Needs: differential rules. **Blocks production.**
- **Free-text story parsing:** should extract recurrence, prior management, specific concerns. Regex-only. Needs: structured intake fields or governed NLP. **Neither blocks (nice-to-have).**
- **Equipment → exercise selection:** should swap/withhold equipment-dependent exercises. Input mapped but no filter. Needs: per-RF-EX equipment requirement check (data already on RF-EX). **Blocks good beta UX, trivial-ish fix.**
- **Exact red-flag routing:** should route DVT/neuro/hernia/structural to distinct guidance. Currently one generic review route. Needs: per-flag → RF-SAF pathway map. **Safety-relevant — prioritise for beta.**
- **Pain-slider thresholds:** should map to severity/ability with validated cut-offs. Beta heuristics. Needs: validated thresholds. **Blocks production.**
- **Progression/regression thresholds:** should gate movement between phases/sessions. Gap/beta. Needs: governed monitoring profile (RF v1.2 §12.3, unresolved). **Blocks production.**
- **Recovery-window personalization:** should give a defensible range. Gap by design. Needs: governed, evidence-graded windows. **Blocks production.**
- **Dosage personalization:** should set real sets/reps. Beta. Needs: governed dosage source. **Blocks production.**
- **Exercise count/session volume:** should reflect researched tolerances. Beta caps. Needs: volume evidence. **Blocks production, fine for beta.**
- **Phase-week-day scheduling:** should reflect real periodization. Beta synthetic. Needs: scheduling model. **Blocks production.**

---

## 3. Summary classification

- **Wired (genuinely affects RF output):** exact area (location), mechanism, pain at rest, pain walking/stairs, pain during sport, red flags (as a group), symptom (bruising/weakness extraction). Region drives the RF-compat gate.
- **Partially wired:** symptom (single value, keyword-scanned), free-text story (regex flags only).
- **Collected but NOT used by RF:** days since injury, secondary area, sport demands (`movements`). Equipment is mapped to input but **not used** for selection. Sport is **broken by a key mismatch** (`sport` vs `sports`).
- **Research-backed (direct/indirect):** confidence <85% cap (policy-direct); severity ontology, phase model, field milestones (indirect).
- **Beta-default-only:** all dosage, pain thresholds, confidence increments, session volume, regression/check-in thresholds, scheduling.
- **Research gaps:** recovery windows, dosage, progression/regression thresholds, sport-demand endpoints, days-since gating, per-red-flag routing, equipment-based selection, secondary-area differential.

### Most serious personalization gaps
1. **Sport key mismatch** (`sport` written, `sports` read) — sport context/goal silently lost. *Trivial, safe fix.*
2. **Per-red-flag routing is undifferentiated** — safety-relevant; all flags collapse to one generic review.
3. **Equipment ignored in selection** — users see exercises they may not be able to do.
4. **Sport demands & days-since collected but unused** — no endpoint/acute personalization.
5. **All dosage/recovery/thresholds are beta defaults** — fine for beta, blocks production.

---

## 4. Tests run
`test:rf-beta-engine` PASS · `test:rf-beta-app-adapter` PASS · `test:rf-output-to-profile` PASS · `validate:rf-prescription-rules` PASS · `npm run build` PASS. No field changes made.

## 5. Recommended next task (exact)
**“RF Assessment Mapping Fixes — Batch 1 (safe/trivial only)”:** (a) fix the sport key mismatch in `mapAssessmentToRfInput` (`a.sport ?? a.sports?.[0]`); (b) wire equipment filtering into `rfSessionGenerator` using existing RF-EX equipment metadata; (c) add a per-red-flag → review-pathway map in the engine (safety). Add tests for each. **Defer** (research-gated, do not invent): days-since gating, sport-demand endpoints, secondary-area differential, pain-slider thresholds, recovery/dosage/progression numbers — each requires a governed, evidence-graded source before it may influence output.
