# RF-FIELD-005 — Gate B Draft Rule Object

The fifth and **final** pending, non-executable Gate B Rectus Femoris (RF) **field** rule object has
been authored:
[lib/clinical/rf/rules/objects/RF-FIELD-005.json](../../lib/clinical/rf/rules/objects/RF-FIELD-005.json).

It implements the **structure** of RF v1.2 rule **RF-FIELD-005** — "sprint work-to-rest ratios are not
RF-specific dosage rules" (v1.2 §13.6). It is a draft only. With this, the field/running/sprinting/
kicking block (RF-FIELD-001 … RF-FIELD-005) is complete.

## 1. What was authored

A single machine-readable rule object expressing RF-FIELD-005's **sprint work-to-rest ratio prohibition
structure**:

- provenance: `source_spec_rule_id: "RF-FIELD-005"`, `rule_family: "sprint_dosage"`, `source_section: "§13.6"`;
- `permitted_use: "prohibited_autonomous_rule"`;
- `input_contract` — the exact §13.6 `sprint_work_to_rest_ratios` (1:3, 1:5, 1:7) with `ratio_role` as
  general sprint-conditioning reference values, not RF-specific dosing; `source_quality_handling`;
- `decision_contract` — `sprint_ratio_reference_status`; `autonomous_rf_dosing_status` (ratios must not
  become RF-specific autonomous dosing); `qrf_028_role` (indirect/extrapolated, not dosing/progression
  authority); `false` flags for ratios becoming RF-specific dosing / automatic prescription / universal
  work-to-rest or progression rules / phase-entry-exit / readiness / return rules; `domain_transfer_status`
  (clears no untested domain); plus `false` flags for sprint/field/running dosing, exercise selection,
  field/rehab plan, RTT/RTS, progression/readiness from ratio completion alone, bypass of every upstream
  field/recur/rehab/sev/dx rule, and override of safety/capacity/restrictions/stage/readiness/monitoring/
  schedule/equipment/sport-context/concurrent injury; `defers_to_rf_saf_006…: true`;
  `safety_precedence_preserved: true`; field/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §15);
- `prohibited_outputs` (see §16);
- `test_fixtures: ["v1.2-§17-case-27"]`.

## 2. What was NOT authored

- No RF-specific autonomous dosing, automatic sprint prescription, universal work-to-rest or
  sprint-progression rules, phase-entry/exit criteria, readiness evidence, or return rules from the
  ratios.
- No sprint/running dosing; no work-to-rest dosing; no sets / reps / weekly frequency / rest intervals /
  intensity targets / duration / number-of-efforts / sprint volume / speed targets / progression
  increments / return dates / mandatory time windows; no exercise selection; no complete field plan; no
  complete rehab plan; no RTT/RTS; no progression/readiness from ratio completion alone.
- No clearing of kicking / cutting / decel / COD / repeated-sprint / fatigue / sport-specific or any
  untested field domain.
- No bypass of RF-FIELD-001/002/003/004, RF-RECUR-001/002, RF-REHAB-001…006, RF-SEV-005, RF-DX-006, or
  RF-SAF-006; no bypass of safety / capacity / restrictions / stage / readiness / monitoring / schedule
  / equipment / sport-context / concurrent-injury constraints.
- No sprint-dosage or field-exposure engine — only the prohibition is preserved for later field, rehab,
  and readiness objects.
- No invented architecture references.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-FIELD-005 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001/002, and RF-FIELD-001…004
  were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claim was preserved

Copied verbatim from v1.2 §13.6 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-028` (X1; indirect/extrapolated), preserved as general sprint-ratio
  evidence only — not RF-specific dosing or progression authority. The grade/role is recorded in
  `notes`/`decision_contract`.

## 5. Why architecture references are intentionally empty

RF-FIELD-005 is a **clinical-content** PROHIBITION rule. Per v1.2 §4.3, clinical-content rules **cite
valid `evidence_claim_ids`** and **do not** carry architecture references; the §13.6 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**.

## 6. Why this is a clinical-content sprint-ratio prohibition rule

§13.6's normative strength is **PROHIBITION** and permitted use is `prohibited_autonomous_rule`: its
only job is to forbid a behavior (treating 1:3/1:5/1:7 as RF-specific autonomous dosing). Per V3.1
§16.1, `prohibited_autonomous_rule` content can never become decision-driving executable logic.

## 7. Which sprint work-to-rest ratios were preserved

Per §13.6, exactly: **1:3, 1:5, and 1:7**, recorded in `input_contract.sprint_work_to_rest_ratios` as
general sprint-conditioning reference values.

## 8. Why 1:3, 1:5, and 1:7 must not become RF-specific autonomous dosing

These are general sprint-conditioning work-to-rest ratios from the broader literature (QRF-028 is X1 —
indirect/extrapolated). They were **not** derived for rectus femoris rehab, so converting them into
RF-specific dosing, prescription, progression, phase, readiness, or return rules would assert
RF-specific authority the evidence does not support — exactly what §13.6 prohibits (and what §17 case 27
makes a CI failure, per Appendix C). The object sets `autonomous_rf_dosing_status` and all
`ratios_become_…: false` flags, and blocks each corresponding output.

## 9. Why QRF-028 must not become RF-specific sprint-dosing or progression authority

QRF-028 (X1) is indirect/extrapolated general sprint-ratio evidence. The object sets `qrf_028_role` to
general sprint-ratio evidence only — not RF-specific dosing or progression authority — and blocks
treating QRF-028 as RF-specific autonomous dosing, sprint-progression, RTT, or RTS authority.

## 10. Why this rule does not create sprint dosage, running dosage, sprint progression, field plan, complete plan, RTT, or RTS

A prohibition rule forbids; it does not prescribe. Actual (individualized, separately-governed) sprint
dosing, progression, plans, and return decisions belong to other gated/governed objects (RF-REHAB-004
forbids universal dosing; V3.1 §§12–14). The object sets `creates_running_or_sprint_dosing: false`,
`creates_sprint_progression_plan: false`, `creates_field_progression_plan: false`,
`creates_rehab_prescription: false`, `selects_exercises: false`, `selects_complete_field_plan: false`,
`generates_complete_rehab_plan: false`, and `grants_return_to_training_or_return_to_sport_decision:
false`.

## 11. How RF-FIELD-005 relates to RF-FIELD-001, RF-FIELD-002, RF-FIELD-003, and RF-FIELD-004

It is a constraint across the field block and never overrides or bypasses them: not RF-FIELD-001's
denominator/pathway-context limits, RF-FIELD-002's 95% MSS insufficiency boundary, RF-FIELD-003's
higher-speed prerequisite-capacity gating, or RF-FIELD-004's kicking-domain separation (all `bypasses_…:
false`, `does_not_override_rf_field_001…004: true`). A completed sprint ratio cannot acquire RF-specific
dosing authority.

## 12. How RF-FIELD-005 relates to RF-RECUR-002 and RF-RECUR-001

It honors RF-RECUR-002's separated, unranked exposure-domain monitoring (a sprint ratio clears no other
domain) and does not bypass RF-RECUR-001 prior-injury recurrence handling (both `bypasses_…: false`).

## 13. How RF-FIELD-005 relates to RF-REHAB-001 through RF-REHAB-006

The prohibition operates within the gated rehab pipeline, never around it. The object does not bypass
the RF-REHAB-001 prescription-input gate, RF-REHAB-002 loading-dimension constraints, RF-REHAB-003
position-tag limits, RF-REHAB-004 universal-dosage prohibition, RF-REHAB-005 schedule/total-load
reconciliation, or RF-REHAB-006 concurrent-injury constraints (all `bypasses_…: false`). It is
complementary to RF-REHAB-004's broader no-universal-dosage prohibition.

## 14. How RF-FIELD-005 relates to RF-SEV-005, RF-DX-006, and RF-SAF-006

It does not bypass RF-SEV-005 (reported-fibrosis/scar provenance) or RF-DX-006 (report / sprint /
work-to-rest / test-context descriptor handling), and it defers to RF-SAF-006 when serious structural /
postoperative / full-thickness / avulsion / major-retraction / external-restriction descriptors are
present (`defers_to_rf_saf_006…: true`, `does_not_bypass_rf_saf_006: true`).

## 15. `safety_state_output` and `blocked_targets`, and why this follows §13.6 exactly

Reading §13.6 exactly: it is a **PROHIBITION** on RF-specific sprint dosing — it does **not** assign any
of the eight closed V3.1 §21 safety states. Per the task's rule, because §13.6 assigns no closed safety
state, `safety_state_output` is `null` and `blocked_targets` is `[]`, and the prohibition is represented
entirely in `decision_contract`. **No safety state was inferred by analogy.**

## 16. Prohibited outputs

The object's `prohibited_outputs` (72 entries) block, among others: treating 1:3 / 1:5 / 1:7 or sprint
work-to-rest ratios as RF-specific autonomous dosing, automatic sprint prescription, universal RF
work-to-rest or sprint-progression rules, phase-entry/exit criteria, readiness evidence by themselves,
or return-to-running/sprinting/training/sport rules; treating QRF-028 as RF-specific dosing /
sprint-progression / RTT / RTS authority; creating sprint/running dosing, work-to-rest dosing,
sets-or-reps, weekly frequency, rest intervals, intensity targets, duration targets, number-of-efforts
targets, sprint volume targets, speed targets, progression increments, return dates, mandatory time
windows, exercise selection, a complete field plan, or a complete rehab plan from RF-FIELD-005;
authorizing progression or readiness from ratio completion alone; treating a sprint ratio exposure as
kicking/cutting/decel/COD/repeated-sprint/fatigue/sport-specific clearance or one field domain as
clearance for another; bypassing RF-FIELD-001/002/003/004, RF-RECUR-001/002, RF-REHAB-001…006,
RF-SEV-005, RF-DX-006, or RF-SAF-006; bypassing safety/capacity/restrictions/stage-readiness/monitoring/
schedule/equipment/sport-context/concurrent-injury because a sprint work-to-rest ratio exists; and
treating weak / unclear / stale / incomplete / self-reported / unsupervised / context-mismatched /
non-RF-specific sprint-ratio evidence as high-authority readiness evidence.

## 17. This is not clinical approval

Authoring this object grants it no clinical authority. RF-FIELD-005 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 18. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001 … RF-RECUR-002, and RF-FIELD-001 … RF-FIELD-004 objects remain unchanged

Those thirty-three rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history, rehabilitation, recurrence blocks and RF-FIELD-001…004 still hold.

## 19. The field/running/sprinting/kicking block RF-FIELD-001 … RF-FIELD-005 is now complete

All five field rules are drafted: RF-FIELD-001 (Aspetar speed milestones), RF-FIELD-002 (95% MSS not
sufficient alone), RF-FIELD-003 (higher-speed prerequisite capacity), RF-FIELD-004 (kicking-domain
separation), and RF-FIELD-005 (sprint work-to-rest ratios are not RF dosage). The package now holds 34
authored objects across safety (8), diagnosis (8), severity/prognosis/history (5), rehabilitation (6),
recurrence (2), and field (5).

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 34` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-FIELD-005 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
