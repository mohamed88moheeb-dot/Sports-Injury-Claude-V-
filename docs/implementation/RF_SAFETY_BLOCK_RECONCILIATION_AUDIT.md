# RF Safety Block Reconciliation Audit — RF-SAF-001 … RF-SAF-008

Audit date: 2026-06-16. Scope: the eight Gate B draft safety rule objects, the package status, the
v1.2 source inventory, and consistency against RF Clinical Rule Specification v1.2 (§7) and Master
Architecture V3.1 (§21–22). **Read-only audit** — no rule object was rewritten (no objective
structural error requiring a fix was found).

## Executive summary

All eight RF safety rule objects (RF-SAF-001 … RF-SAF-008) exist, are JSON-valid, remain
`approval_status: "pending"` and `executable: false`, and pass `npm run validate:rf-rules`. The
package status reports `rule_objects_authored: 8`, `rule_objects_approved: 0`,
`approval_status: "not_approved"`, `executable: false`. The inventory marks all eight as
`has_machine_readable_object: true` / `gate_b_status: "draft_authored_pending_validation"`, and no
non-safety inventory entry was altered. Safety-state usage, `blocked_targets`, evidence/architecture
provenance, and prohibited-output discipline are internally consistent and faithful to v1.2; no
evidence-claim IDs were invented. **No issues were found; no fixes are required.** This audit is not
clinical approval and changed no runtime behavior.

`npm run check:rf-clinical`, `npm run validate:rf-rules`, and `npm run check:rf-boundary` all pass.

## 1. Safety rule table

| Rule | Title (source §) | `permitted_use` | normative source | `approval_status` | `executable` | inventory `has_mro` / `gate_b_status` |
|---|---|---|---|---|---|---|
| RF-SAF-001 | Disproportionate / passive-movement pain after trauma (§7.2) | safety_referral_trigger | mixed | pending | false | true / draft_authored_pending_validation |
| RF-SAF-002 | Progressive swelling or tightness after major trauma (§7.3) | safety_referral_trigger | mixed | pending | false | true / draft_authored_pending_validation |
| RF-SAF-003 | Delayed deterioration (§7.4) | safety_referral_trigger | mixed | pending | false | true / draft_authored_pending_validation |
| RF-SAF-004 | Suspected vascular or neurological compromise (§7.5) | safety_referral_trigger | architecture | pending | false | true / draft_authored_pending_validation |
| RF-SAF-005 | Inability to safely assess (§7.6) | logic_with_uncertainty | architecture | pending | false | true / draft_authored_pending_validation |
| RF-SAF-006 | Suspected avulsion / full-thickness / postoperative restriction (§7.7) | logic_with_uncertainty | mixed | pending | false | true / draft_authored_pending_validation |
| RF-SAF-007 | Direct-contusion branch routing (§7.8) | logic_with_uncertainty | mixed | pending | false | true / draft_authored_pending_validation |
| RF-SAF-008 | New red flags during rehabilitation (§7.9) | safety_referral_trigger | architecture | pending | false | true / draft_authored_pending_validation |

**Criteria 1–5: PASS.** All 8 exist; all pending; all non-executable; package status = 8/0 /
not_approved / false; inventory flags set for all 8 (verified programmatically, with 0 non-safety
entries changed).

## 2. State / blocked-target table

V3.1 §21 closed matrix: `URGENT_REFERRAL`/`EMERGENCY_SIGNPOSTING`/`OUT_OF_SCOPE` → `blocked_targets: all`;
`TEST_BLOCKED` → `test`; `REHAB_BLOCKED` → `rehab`.

| Rule | `safety_state_output` | `blocked_targets` | Consistent with §21? | Source basis |
|---|---|---|---|---|
| RF-SAF-001 | URGENT_REFERRAL | `["all"]` | ✓ | §7.2 "at least URGENT_REFERRAL, blocked_targets all" |
| RF-SAF-002 | URGENT_REFERRAL | `["all"]` | ✓ | §7.3 "URGENT_REFERRAL, blocked_targets all" |
| RF-SAF-003 | URGENT_REFERRAL | `["all"]` | ✓ | §7.4 "re-enter urgent or emergency safety pathway" |
| RF-SAF-004 | URGENT_REFERRAL | `["all"]` | ✓ | §7.5 "global emergency/urgent ontology; block all" |
| RF-SAF-005 | TEST_BLOCKED | `["test"]` | ✓ | §7.6 "block the test" (conservative state; documented) |
| RF-SAF-006 | REHAB_BLOCKED | `["rehab"]` | ✓ | §7.7 "set REHAB_BLOCKED" (explicit) |
| RF-SAF-007 | OUT_OF_SCOPE | `["all"]` | ✓ | §7.8 no-branch "OUT_OF_SCOPE, blocked_targets all" |
| RF-SAF-008 | URGENT_REFERRAL | `["all"]` | ✓ | §7.9 re-run safety; conservative urgent state (documented) |

**Criteria 14–15: PASS.** Every state is one of the four expected safety states (URGENT_REFERRAL,
TEST_BLOCKED, REHAB_BLOCKED, OUT_OF_SCOPE) and its `blocked_targets` matches the V3.1 §21 row exactly
(verified programmatically — all `stateConsistent=true`). RF-SAF-005 and RF-SAF-008, whose source
does not fix a single state, each use the most conservative structurally appropriate closed state and
document the choice in their object `notes`.

## 3. Prohibited-output consistency table

| Rule | # prohibited | Diagnosis blocked | Rehab-clear blocked | Complete-plan blocked | RTS/RTP blocked | Rule-specific blocks |
|---|---|---|---|---|---|---|
| RF-SAF-001 | 5 | produce_a_diagnosis | ✓ | (n/a) | ✓ | ACS confirm/exclude |
| RF-SAF-002 | 7 | produce_a_diagnosis | ✓ | (n/a) | ✓ | ACS confirm/exclude; thigh-girth + numeric-swelling thresholds |
| RF-SAF-003 | 8 | produce_a_diagnosis | ✓ | (n/a) | ✓ | preserve-prior-CLEAR; wait-and-see; fixed observation period; ACS confirm/exclude |
| RF-SAF-004 | 8 | produce_an_rf_diagnosis | ✓ | (n/a) | ✓ | vascular + neuro confirm/exclude; treat-as-RF-specific-evidence |
| RF-SAF-005 | 8 | produce_a_diagnosis | ✓ | (n/a) | ✓ | cannot_assess→pos/neg; unknown→neg; missing→clearance; lower-concern |
| RF-SAF-006 | 10 | avulsion + full-thickness confirm/exclude | ✓ | produce_a_complete_rehab_plan | give_return_to_sport_timing | surgical advice; treatment timing; interpret_raw_imaging |
| RF-SAF-007 | 11 | diagnose_contusion; diagnose_rf_strain | ✓ | produce_a_complete_rehab_plan | ✓ | force-into-RF-strain; create-contusion-module; thigh-girth + numeric-swelling; ACS confirm/exclude |
| RF-SAF-008 | 10 | produce_a_diagnosis | ✓ | produce_a_complete_rehab_plan | ✓ | continue-progression; routine-soreness; routine-regression-only; preserve-phase; numeric confidence; unsupported dosage/timing |

Notes on coverage:
- **Criterion 6 (no diagnosis):** every rule blocks the diagnosis it could plausibly emit. RF-SAF-006
  blocks the *structural* diagnoses in its scope (`confirm/exclude_avulsion`,
  `confirm/exclude_full_thickness_injury`) rather than a generic `produce_a_diagnosis` token — this is
  the scope-appropriate equivalent, not a gap.
- **Criterion 7 (no rehab authorization):** all 8 block `clear_user_for_rehabilitation`.
- **Criterion 8 (no complete plan):** RF-SAF-006/007/008 — the rules positioned to touch a plan —
  block `produce_a_complete_rehab_plan`. RF-SAF-001…005 are pre-plan safety triggers that block rehab
  clearance, which subsumes plan production.
- **Criterion 9 (no RTS clearance):** all 8 block a return-to-sport output (`produce_a_return_to_sport_decision`
  on 001–005, 007, 008; `give_return_to_sport_timing` on 006).
- **Criteria 10–11 (no numeric confidence / dosage / dates):** RF-SAF-008 blocks these explicitly; for
  all 8 a deep key scan found **no** numeric-confidence, sets/reps/frequency/intensity/rest, dosage,
  progression-increment, or return-date keys (see "Issues" — none).
- **Criterion 12 (no raw imaging):** RF-SAF-006 blocks `interpret_raw_imaging`; no other rule
  interprets imaging.
- **Criterion 13 (no unauthorized confirm/exclude):** compartment-syndrome confirm/exclude is blocked
  by 001/002/003/007; vascular + neurological by 004; avulsion + full-thickness by 006; contusion +
  RF-strain diagnosis by 007. No rule confirms or excludes any of these conditions; none is "allowed
  by source" to do so, and none does.

**Criteria 6–13: PASS.**

## 4. Evidence / architecture provenance table

Verified equal between each object and its inventory entry (`archMatch=true`, `claimMatch=true` for
all 8), and against v1.2 §7.

| Rule | `architecture_refs` | `evidence_claim_ids` (grades per source) | Source has claims? |
|---|---|---|---|
| RF-SAF-001 | V3.1-7, V3.1-20, V3.1-21, V3.1-22 | QRF-014 (C1), QRF-037 (E1), QRF-038 (E1) | yes |
| RF-SAF-002 | V3.1-7, V3.1-20, V3.1-21 | QRF-017 (C1) | yes |
| RF-SAF-003 | V3.1-7, V3.1-21 | QRF-018 (C1) | yes |
| RF-SAF-004 | V3.1-7.1, V3.1-7.2, V3.1-7.3, V3.1-21 | `[]` | no (architecture; §4.3) |
| RF-SAF-005 | V3.1-4, V3.1-5, V3.1-7, V3.1-9, V3.1-24 | `[]` | no (architecture; §4.3) |
| RF-SAF-006 | V3.1-6, V3.1-10, V3.1-13.1, V3.1-13.2, V3.1-20, V3.1-21 | QRF-012 (C1), QRF-032 (C1), QRF-036 (I1) | yes |
| RF-SAF-007 | V3.1-3.1, V3.1-7, V3.1-15 | QRF-015 (D2), QRF-016 (D2), QRF-017 (C1) | yes |
| RF-SAF-008 | V3.1-7.2, V3.1-7.3, V3.1-13.4, V3.1-21, V3.1-22 | `[]` | no (architecture; §4.3) |

**Criteria 20–21: PASS.** The three architecture-source rules (004, 005, 008) carry empty
`evidence_claim_ids` legitimately (v1.2 §4.3 — architecture rules cite `architecture_refs` and do not
invent evidence claims); **no claim IDs were invented**. All cited QRF IDs and architecture refs match
the inventory exactly.

## 5. Behavioral-invariant checks (criteria 16–19, 22)

- **16 — `unknown_handling` conservative:** all 8 objects set
  `unknown_handling: "treat_safety_unknown_as_unsafe_until_resolved"` (V3.1 §7.3 "unknown is not
  negative"). **PASS.**
- **17 — `cannot_assess` never positive/negative/clearance:** RF-SAF-005 records
  `cannot_assess`, sets `must_not_convert_result_to: ["positive","negative"]`, and blocks
  `coerce_cannot_assess_to_positive/negative`, `treat_unknown_as_negative`,
  `treat_missing_assessment_as_clearance`, `lower_concern_because_test_not_performed`. **PASS.**
- **18 — direct contusion not forced into RF strain:** RF-SAF-007 sets
  `do_not_force_into_rf_strain_pathway: true`, blocks
  `force_direct_contusion_mechanism_into_rf_strain_logic`, and routes to a contusion branch only if an
  approved module exists, else `OUT_OF_SCOPE`. **PASS.**
- **19 — new red flags override, not routine regression:** RF-SAF-008's
  `new_safety_state_overrides: [phase, progression, prior_positive_trends, plan_confidence, readiness]`
  and blocks on `treat_new_red_flags_as_routine_regression_only` /
  `preserve_current_rehab_phase_despite_new_red_flags` / `continue_rehab_progression_despite_new_red_flags`.
  **PASS.**
- **22 — no contradictions across the eight:** all eight are pre-clearance safety triggers; none
  emits a `CLEAR`/`CLEAR_WITH_MONITORING` state, authorizes rehab, or produces a plan/diagnosis/RTS;
  the only overlapping concept (compartment-syndrome confirm/exclude) is consistently *prohibited*
  everywhere it appears. RF-SAF-003 (delayed deterioration) and RF-SAF-008 (new red flags during
  rehab) both reopen safety and explicitly refuse to let a prior CLEAR / positive trend suppress the
  new screen — mutually consistent. **PASS.**

## 6. Issues found

**None.** No objective structural error was found; per the task constraint, no safety rule object was
rewritten.

## 7. Required fixes

**None.**

(Forward-looking, non-blocking observation for later Gate B work — *not* a required fix:
`test_fixtures` are populated for 001/002/003/005/006 and empty for 004/007/008, reflecting that the
v1.2 §17 validation suite does not enumerate a clean case for those three. When the Gate B fixture
set is authored, dedicated fixtures should be added for the architecture-source and no-branch rules.)

## 8. This is not clinical approval

This audit confirms structural and provenance consistency only. RF-SAF-001 … RF-SAF-008 remain Gate A
candidates, `approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication)
and execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this audit does not perform or imply. No rule was marked approved.

## 9. No runtime app behavior changed

This task created only this audit document. No rule object, schema, status file, inventory, or script
was modified; `RecoveryContext.jsx`, the UI, Supabase, and dependencies are untouched; nothing under
`lib/clinical/**` imports any quarantined legacy module (boundary check passes). **User-facing
behavior is unchanged.**

---

**Verification run:** `npm run validate:rf-rules` → pass (8 objects conform); `npm run check:rf-clinical`
→ pass; `npm run check:rf-boundary` → pass.
