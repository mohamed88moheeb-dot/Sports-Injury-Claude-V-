# RF Prescription / Severity / Recovery Rule Pack v1 — Evidence Extraction

**Status:** evidence-extracted · **non-executable** · pending · clinically **not approved** · runtime **none** · data only. No RF knowledge object mutated; no legacy import; no engine/UI/dashboard.

## 1. Purpose
Create the evidence-backed bridge layer between the governed RF knowledge system and the future functional Rectus Femoris beta engine. It defines the source-of-truth rules for: assessment → injury pattern + capped confidence → severity/grade → recovery-window → phase model → dosage → progression → regression → daily check-in → high-caution/reviewer-gated boundaries. It is the layer that will *later* power the RF plan engine; it does not run anything now.

## 2. Why this rule pack is needed
The governed RF objects (RF-EX/RF-ACT/RF-ASSESS/CAP/rules) are deliberately **non-executable and contain no dosage or recovery numbers**. The legacy `lib/injuryEngine` + `data/injuryKnowledge/quadriceps.js` path is functional but **un-graded** (no evidence claim IDs) and uses a 96% confidence cap that violates the <85% digital policy. Neither is a safe source of truth for the beta. This pack extracts the evidence that *does* exist (structure) and **explicitly marks the numbers that do not** (gaps), in one governed, RF-specific, quarantine-clean file.

## 3. Sources inspected
- `docs/governance/Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2.md` (authoritative; §9 severity, §10 phase model, §12 monitoring/adaptation/non-response, §13 running/sprint/kick, §15 prohibited language, §16 rule contract).
- `docs/governance/Master_Architecture_V3.1_Final.md` (composition/weekly-load references).
- `docs/implementation/DIGITAL_ASSESSMENT_CONFIDENCE_AND_RESULTS_UX_POLICY.md` (§7a caps, §8 capacity display).
- `docs/implementation/REHAB_PLAN_COMPOSITION_ARCHITECTURE.md`.
- RF Gate-B drafts: `RF_SEV_001..005`, `RF_REHAB_001..006`, `RF_RTS_001..004`, `RF_FIELD_001..005`, `RF_SAF_001..008`, `RF_RECUR_001..002`.
- `lib/clinical/rf/rules/objects/` (38 RF Gate-B rule objects).
- `lib/clinical/exerciseKnowledge/rf/objects/` (107 RF-EX, **id reference only**) and `lib/clinical/activityExposureKnowledge/rf/objects/` (12 RF-ACT, **id reference only**).
- `data/injuryKnowledge/quadriceps.js` and `lib/injuryEngine/*` — inspected **only as comparison reference**; their numbers are **not** adopted.

## 4. What was extracted directly (evidence-supported structure)
- **Six-phase Aspetar model** (Foundation, Reload, Accumulation, Transition, Simulation, Resilience) with primary objective, exercise character, field exposure, and exit-decision basis — RF v1.2 §10.1/§10.3, QRF-019 (acceptability, not effectiveness).
- **Severity classification ontology** — Munich (QRF-007/011), BAMIC (QRF-009/040/041), central-aponeurosis location (QRF-008/010), proximal/full-thickness (QRF-012/032/036), fibrosis-as-history (QRF-044/045/046). All **record-only**, structure-from-valid-report.
- **Field milestones** — Aspetar 70%/80%/95% max-sprint-speed phase-exit *references* (QRF-024); 95% not sufficient alone (QRF-025 / RF-FIELD-002).
- **Adaptation actions** — the single-primary-action set and the §12.5 non-response sequence (RF v1.2 §12.4/§12.5).
- **Confidence caps** — self-report <85%, mixed <90% (policy §7a).
- **Prohibitions** — no universal dosage (RF-REHAB-004, QRF-022/035); no precise individual return date (§9.8); no clearance from progression.

## 5. What is indirect / extrapolated
- **Phase entry/exit criteria** beyond the §10.3 decision basis are indirect (criteria named, exact thresholds not specified).
- **Exercise-family → phase mapping** is extrapolated from RF-EX `library_classification` + `final_decision` + the phase exercise-character descriptions (no per-object phase tag exists upstream).
- **Regression/daily-check-in band structure** is indirect: the actions are evidence-supported (§12.4); the numeric bands that trigger them are configurable-monitoring-profile gaps (§12.3).

## 6. What remains a gap (explicitly marked `evidence_status: gap`, `gap: true`)
- **All dosage numbers** — sets, reps, holds, duration, rest, tempo, frequency (every `dosage_rules` entry; null). Prohibited as universal evidence by RF-REHAB-004.
- **Precise recovery windows** — `min_estimate`/`max_estimate` are null; only qualitative, modifier-aware wording is allowed (§9.8).
- **Deviation bands** ("mild/moderate/major") and the **non-response threshold** (number of failed sessions / time window) — explicitly unresolved (§12.3/§12.5).
8 rule objects are gap-marked; all dosage rules additionally carry `requires_clinician_review: true`.

## 7. Severity rules summary
A principle (severity ≠ confidence), a qualitative **functional-severity profile** (3 bands: lower / moderate / high-concern-or-review-gated, with assessment/mechanism/walking-stairs/pain/bruising/strength/red-flag indicators), and 5 **record-only structural** rules (Munich, BAMIC, central-aponeurosis, proximal/full-thickness, fibrosis-history). Severity derives from assessment answers + valid reports; structural grades never inferred from symptoms; medians never become individual timelines.

## 8. Recovery-window rules summary
One qualitative window rule: numeric estimates **null/gap**; lengthening modifiers (central tendon, proximal/higher-grade, recurrence, poor early function, concurrent injury, review-gated) and qualitative shortening modifiers; mandated user-facing wording ("Estimated recovery window for similar injury patterns. Actual recovery depends on severity, symptoms, sport demands, and clinician review.") and an explicit prohibited-wording list. Research medians referenced as group context only.

## 9. Phase model summary
Six phases with friendly names (Calm and protect → Restore movement and rebuild base → Build strength and running capacity → Running and sport preparation → Higher-demand sport exposure → Return to performance), each with goal, entry/exit, allowed/withheld exercise families, capacity targets, assessment checks, criteria-based progression/regression, and field exposure. Resilience explicitly carries `clearance_authority: false` — return-to-sport is a separate governed decision.

## 10. Dosage / prescription rules summary
A prohibition rule + one rule per phase. Each carries qualitative intensity **character** (e.g. Foundation = isometric-dominant, short-to-mid length) but **null numeric fields**, a monitoring-profile stop rule, an alternative rule, criteria-based progression/regression triggers, a clearly-labelled `legacy_reference_not_evidence_backed` note (legacy RPE bands shown, not adopted), `evidence_status: gap`, and `requires_clinician_review: true`. **This is where dosage will live — never inside RF-EX objects.**

## 11. Progression / regression summary
**Progression:** principle (movement within the plan, never clearance) + 5 phase-to-phase transitions with required assessment/capacity/symptom/next-day/strength evidence and running/kicking/sprinting restrictions (incl. 70/80/95% sprint references). **Regression:** principle (single governed action) + mild/moderate/major-or-red-flag tiers + a non-response rule deferring to §12.5; bands are gaps. Actions: reduce volume/intensity/range-or-speed, swap to easier alternative, remove high-demand block, hold/regress phase, or withhold + refer.

## 12. Daily check-in rule summary
Principle + green/yellow/red rules. Every rule sets `selected_session_only: true` and `future_days_changed: false`. Green = proceed; yellow = reduce/swap/remove a block today; red = withhold today's session and show a review message. No phase jumps, no clearance, no future-day edits.

## 13. Exercise / activity-exposure mapping
**Exercise:** 8 phase/family mapping entries referencing **124 RF-EX id references** across eligible/alternative/withheld/high-caution/manual-review arrays (ids only — never embedded). All 20 high-caution sport-specific items are **withheld with empty eligibility** until clinician sign-off. **Activity:** all 12 RF-ACT mapped by phase/review-state, every entry `clearance_authority: false`, plus the statement *"Activity exposure expresses capacity. It does not clear the athlete."* The validator confirms every referenced id exists on disk.

## 14. Governance boundaries
`approval_status: pending`, `clinical_approval_status: not_approved`, `executable_status: non_executable_until_engine_review`, `runtime_integration: none`. Data only — imports nothing, mutates no RF-EX/RF-ACT/RF-ASSESS/CAP/evidence-linking/RF-rule/taxonomy object, touches no RecoveryContext/Supabase/UI/route. Quarantine-clean (no legacy dependency). No engine, no dashboard, no plan generation.

## 15. Validator behavior
`scripts/validate-rf-prescription-rules.mjs` (no new packages) checks: pack exists/parses; 12 required sections; governance status invariants; every prescription/severity/recovery rule has `source_ids` **or** an explicit gap marker **and** a valid `evidence_status`; any concrete dosage/recovery number would require `evidence_status`; no return-to-sport-clearance / confirmed-diagnosis language in user-facing wording; self-report cap <85% and mixed <90%; every activity exposure `clearance_authority: false` + the no-clearance statement; daily-check-in `selected_session_only: true` / `future_days_changed: false`; RF-EX/RF-ACT references are well-formed ids that **exist on disk** (proves reference-not-embed); non-empty evidence-source claims; status-file invariants. Prints a concise PASS summary.

## 16. Commands run
`npm run validate:rf-prescription-rules` → PASS (12 sections; 36 rules, 8 gap-marked; 6 phases; 124 RF-EX refs; 12 RF-ACT refs). Plus the full existing suite (§ below) — all PASS.

## 17. Scope verification
New files only under `lib/clinical/rfPrescriptionRules/**`, `scripts/validate-rf-prescription-rules.mjs`, this doc, and one added `package.json` script. `git status --short` shows no modified RF knowledge objects, no engine/UI/route/Supabase/RecoveryContext changes. `check:rf-boundary` PASS confirms the new path introduces no legacy dependency.

## 18. Recommended next build step
**RF severity + confidence + recovery resolvers (pure functions, no UI):** consume this rule pack + `RF-ASSESS` inputs to output a functional-severity band, a policy-capped confidence (<85% self-report), and the qualitative recovery wording — with every gap surfaced as "needs clinician review" rather than a fabricated number. Then the RF phase/plan engine reads `phase_model` + `exercise_family_mapping`; dosage stays gap-gated until a separately governed, evidence-graded dosage source is approved.
