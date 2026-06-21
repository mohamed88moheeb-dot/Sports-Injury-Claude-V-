# RF-REHAB-004 — Gate B Draft Rule Object

The fourth pending, non-executable Gate B Rectus Femoris (RF) **rehabilitation** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-REHAB-004.json](../../lib/clinical/rf/rules/objects/RF-REHAB-004.json).

It implements the **structure** of RF v1.2 rule **RF-REHAB-004** — "no universal RF dosage" (v1.2 §10.7).
It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-REHAB-004's **universal-dosage prohibition
structure**:

- provenance: `source_spec_rule_id: "RF-REHAB-004"`, `rule_family: "rehabilitation"`, `source_section: "§10.7"`;
- `permitted_use: "prohibited_autonomous_rule"`;
- `input_contract` — `prohibition_scope: "no_universal_rf_prescription_or_dose_may_be_invented"`, the
  enumerated §10.7 `prohibited_universal_prescription_parameters` (sets, repetitions, intensity, rest,
  weekly_frequency, progression_increments), and a `source_quality_handling` that preserves uncertainty;
- `decision_contract` — `active_generic_prescription_status:
  "prohibited_no_universal_rf_prescription_or_dose_may_be_active_rule_logic"`;
  `content_validation_requirement: "any_active_universal_rf_dose_without_a_separately_approved_source_and_version_must_fail_content_validation"`;
  `qrf_022_and_qrf_035_role: "research_gap_evidence_blocking_universal_rf_dosing_not_universal_prescription_authority"`;
  `false` flags for every universal-prescription / exercise-prescription / loading / progression /
  phase / return prescription as active logic; `creates_rehab_prescription: false`,
  `selects_exercises: false`, `selects_complete_exercise_plan: false`, `generates_complete_rehab_plan:
  false`, `grants_return_to_training_or_return_to_sport_decision: false`; non-bypass of
  RF-REHAB-001/002/003; non-override of RF-SAF-006/RF-DX-008/RF-SEV-004/RF-SEV-005; `safety_precedence_preserved:
  true`; rehab prescription engine deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §12);
- `prohibited_outputs` (see §13);
- `test_fixtures: ["v1.2-§17-case-28"]`.

## 2. What was NOT authored

- No universal RF dosage / exercise dose / loading prescription / phase prescription / progression
  schedule / return-to-training / return-to-sport prescription as active rule logic.
- No dosage / sets / reps / weekly frequency / rest intervals / intensity targets / duration targets /
  progression increments / return dates; no exercise selection or complete exercise plan; no complete
  rehab plan; no RTT or RTS decision.
- No bypass of the RF-REHAB-001/002/003 gates/constraints; no bypass of safety / capacity /
  restrictions / stage / readiness / monitoring / schedule / equipment / concurrent-injury constraints.
- No rehab prescription engine — only the universal-dosage prohibition structure is preserved for the
  later rehab selection and planning objects.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-REHAB-004 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001/002/003 were consulted as structural examples
  only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claims were preserved

Copied verbatim from v1.2 §10.7 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-022` (I1), `QRF-035` (I1). Both grades and their RF-dosage research-gap
  role are preserved in `notes` / `decision_contract`; no combined or invented grade was created.

## 5. Why architecture references are intentionally empty

RF-REHAB-004 is a **clinical-content** rule. Per v1.2 §4.3, clinical-content rules **cite valid
`evidence_claim_ids`** and **do not** carry architecture references; the §10.7 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**.

## 6. Why this rule is `prohibited_autonomous_rule`

§10.7's normative strength is **PROHIBITION** and its permitted use is `prohibited_autonomous_rule`:
the rule's only job is to forbid a behavior (inventing a universal RF dose). Per V3.1 §16.1,
`prohibited_autonomous_rule` content can never become decision-driving executable logic — so this
object expresses a constraint, not a prescription.

## 7. Why any active universal RF dose must fail content validation

§10.7's engineering consequence is explicit: "any active universal RF dose without a separately
approved source and version must fail content validation." The current RF evidence (QRF-022, QRF-035,
both I1 / insufficient) does not support a one-size-fits-all dose, so allowing one as active content
would assert authority the evidence cannot back. The object records this as
`content_validation_requirement`, aligning with v1.2 §17 case 28 (universal RF sets/repetitions/
frequency without an approved dosage source must fail CI). (The package validator already enforces a
related discipline by rejecting universal-dosage *keys*; this rule states the governing requirement.)

## 8. Why QRF-022 and QRF-035 must not be generalized into universal prescription authority

Both claims are graded **I1** — insufficient / operationally unresolved — and represent a *research
gap*, not a sanctioned dose. They are evidence that universal RF dosing is **not** established, which
is the opposite of prescription authority. The object sets
`qrf_022_and_qrf_035_role: "research_gap_evidence_blocking_universal_rf_dosing_not_universal_prescription_authority"`
and blocks treating either claim as universal RF prescription authority.

## 9. Why the rule does not create dosage, exercise selection, progression, complete plan, RTT, or RTS

A prohibition rule forbids; it does not prescribe. Actual (non-universal, individualized) dosing,
exercise selection, and return decisions are decided by stage, capacity, monitoring, and separately
governed/approved content (V3.1 §8/§13), not by this rule. The object sets `creates_rehab_prescription:
false`, `selects_exercises: false`, `selects_complete_exercise_plan: false`, `generates_complete_rehab_plan:
false`, and `grants_return_to_training_or_return_to_sport_decision: false`, and blocks the corresponding
`…_from_rf_rehab_004` outputs.

## 10. How RF-REHAB-004 relates to RF-REHAB-001, RF-REHAB-002, and RF-REHAB-003

It is a constraint that sits across the rehab pipeline and never bypasses the earlier rehab rules: not
the RF-REHAB-001 prescription-input gate
(`bypasses_rf_rehab_001_prescription_input_gate: false`, `does_not_override_rf_rehab_001: true`), not
the RF-REHAB-002 loading-dimension constraints
(`bypasses_rf_rehab_002_loading_dimension_constraints: false`, `does_not_override_rf_rehab_002: true`),
and not the RF-REHAB-003 position-tag limits
(`bypasses_rf_rehab_003_position_tag_limits: false`, `does_not_override_rf_rehab_003: true`). Even a
fully-gated, well-characterized exercise cannot acquire a *universal* dose.

## 11. How RF-REHAB-004 relates to RF-SAF-006, RF-DX-008, RF-SEV-004, and RF-SEV-005

It never overrides these blocking/uncertainty rules
(`does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005: true`). The universal-dosage prohibition
applies on top of — never instead of — their safety/anchor/benchmark/history constraints.

## 12. `safety_state_output` and `blocked_targets`, and why this follows §10.7 exactly

Reading §10.7 exactly: it states a **PROHIBITION** and an **engineering/content-validation
consequence** — it does **not** assign any of the eight closed V3.1 §21 safety states. Per the task's
rule, because §10.7 assigns no closed safety state, `safety_state_output` is `null` and
`blocked_targets` is `[]`, and the universal-dosage prohibition is represented entirely in
`decision_contract`. **No safety state was inferred by analogy.**

## 13. Prohibited outputs

The object's `prohibited_outputs` explicitly block: creating active universal RF dosage / exercise
dose / loading prescription / phase prescription / progression schedule / return-to-training /
return-to-sport prescription logic; treating QRF-022 or QRF-035 as universal RF prescription authority;
creating dosage / sets-or-repetitions / weekly frequency / rest intervals / intensity targets /
duration targets / progression increments / return dates, selecting exercises or a complete exercise
plan, producing a complete rehab plan, or producing a return-to-training or return-to-sport decision
from RF-REHAB-004; bypassing the RF-REHAB-001 prescription-input gate, the RF-REHAB-002
loading-dimension constraints, or the RF-REHAB-003 position-tag limits; bypassing safety / current
capacity / external restrictions / stage or readiness gates / monitoring contract / schedule
reconciliation / equipment constraints / concurrent-injury constraints because a generic RF
prescription exists; and treating weak / generic / incomplete / non-individualized prescription
evidence as high-authority rehab evidence.

## 14. This is not clinical approval

Authoring this object grants it no clinical authority. RF-REHAB-004 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 15. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 … RF-REHAB-003 objects remain unchanged

Those twenty-four rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history blocks and RF-REHAB-001/002/003 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 25` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-REHAB-004 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
