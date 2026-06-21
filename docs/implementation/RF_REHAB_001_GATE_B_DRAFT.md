# RF-REHAB-001 — Gate B Draft Rule Object

The first pending, non-executable Gate B Rectus Femoris (RF) **rehabilitation** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-REHAB-001.json](../../lib/clinical/rf/rules/objects/RF-REHAB-001.json).

It implements the **structure** of RF v1.2 rule **RF-REHAB-001** — "phase entry requires a complete
prescription input" (v1.2 §10.4). It is a draft only, and the first rule of the rehabilitation block.

## 1. What was authored

A single machine-readable rule object expressing RF-REHAB-001's **complete-prescription-input gating
structure**:

- provenance: `source_spec_rule_id: "RF-REHAB-001"`, `rule_family: "rehabilitation"`, `source_section: "§10.4"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the §10.4 `required_prescription_inputs` (injury_identity, live_safety_state,
  safety_confidence, stage_confidence, current_capacity, demand_profile, equipment, schedule,
  concurrent_injuries, monitoring_contract, missing_input_actions), the governed
  `missing_data_actions_permitted`, and an `unknown_handling` clause;
- `decision_contract` — `full_plan_requires_all_required_prescription_inputs: true`;
  `diagnosis_alone_authorizes_full_plan: false` (and the same `false` for strong anchor / documented RF
  injury / phase label / current-capacity estimate / user preference alone);
  `locked_safety_confidence_can_coexist_with_full_plan: false`;
  `safety_locked_output_permits_full_plan: false`;
  `missing_required_inputs_response: "choose_one_or_more_governed_missing_data_actions_never_assume_normal_values"`;
  `silently_assumes_missing_input_values: false`; plus `false` flags for exercise selection, dosing,
  schedule-timing change, complete plan, RTT/RTS, and override of
  safety/capacity/restrictions/stage/readiness/monitoring/schedule/equipment/concurrent injury;
  `does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005`; `safety_precedence_preserved: true`;
  rehab selection/planning objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §13);
- `prohibited_outputs` (see §14);
- `test_fixtures: []` (no §17 case maps specifically to the prescription gate).

## 2. What was NOT authored

- No full RF rehab plan; no exercise selection; no dosage / sets / reps / weekly frequency / rest
  intervals / progression increments / duration; no return-to-training or return-to-sport decision.
- No bypass of safety, capacity, restrictions, stage, readiness, monitoring, schedule, equipment, or
  concurrent-injury constraints.
- No rehab engine — only the prescription-input gate structure is preserved for the later rehab
  selection and planning objects.
- No return dates.
- No invented evidence claim IDs (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-REHAB-001 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, and RF-SEV-001 … RF-SEV-005 were consulted as structural examples only, not as clinical
  authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references were preserved

Copied verbatim from v1.2 §10.4 / the inventory — none invented:

- `architecture_refs`: `V3.1-13.1` and `V3.1-13.2` (the prescription gate and missing-input
  behaviour), `V3.1-24` (confidence/evidence/output locks).

## 5. Why evidence claim IDs are intentionally empty

RF-REHAB-001 is an **architecture-source** rule — it governs the prescription gate, not an RF-specific
clinical claim. Per v1.2 §4.3, architecture rules cite `architecture_refs` and **must not invent**
clinical evidence claims. Accordingly, `evidence_claim_ids` is intentionally `[]` — "none required,"
not "missing." No QRF IDs were fabricated.

## 6. Why diagnosis alone never authorizes a full plan

§10.4's decision is explicit: "diagnosis alone never authorizes a full plan." Knowing *what* the
injury is says nothing about whether it is safe to load, the current capacity, the stage, the
schedule, the equipment, concurrent injuries, or the monitoring plan — and V3.1 §8 routes the Rehab
Engine off safety/stage confidence, not diagnosis confidence. So the object sets
`diagnosis_alone_authorizes_full_plan: false` and the equivalent flags for a strong anchor, a
documented RF injury, a phase label, a current-capacity estimate, and a user preference/goal — none
of these, alone, opens a full plan — and blocks each as a `generate_full_rf_rehab_plan_from_…_alone`
output.

## 7. What complete prescription inputs are required

Per §10.4, all of: **injury identity, live safety state, safety confidence, stage confidence, current
capacity, demand profile, equipment, schedule, concurrent injuries, monitoring contract, and
missing-input actions.** (These map to the task's grouped list: safety confidence / safety state;
stage confidence / stage evidence; sport and demand profile.) A full plan requires the complete set
(`full_plan_requires_all_required_prescription_inputs: true`).

## 8. What happens when required inputs are missing

When any required input is missing, the rule must choose one or more **governed missing-data actions**
— ask again, simplify wording, widen uncertainty, restrict testing, restrict rehabilitation, withhold
the full plan, or refer externally — and never silently assume a normal value
(`missing_required_inputs_response: "…never_assume_normal_values"`, `silently_assumes_missing_input_values:
false`). The object additionally blocks the specific silent assumptions (missing safety = normal,
missing stage = cleared, missing capacity = adequate, missing demand = generic, missing equipment =
available, missing schedule = compatible, missing concurrent-injury data = none, absent monitoring
contract = exists).

## 9. Why unknown is never treated as normal, negative, safe, or clearance

V3.1 §7.3 / §24: "unknown is not negative," and missing evidence can never read as clearance. An
unanswered safety or capacity question is not a green light. The object's `unknown_handling` states
unknown is never normal/negative/safe/cleared (treated as unsafe until resolved), and it blocks
`treat_unknown_as_negative/normal/safe/clearance`.

## 10. Why safety-locked output prevents a full plan

§10.4: "A locked safety-confidence object cannot coexist with a full plan" (V3.1 §22: locked safety
confidence prohibits a full plan; a terminal safety state cannot coexist with a full plan). If safety
locks output, the gate stays closed. The object sets `locked_safety_confidence_can_coexist_with_full_plan:
false` and `safety_locked_output_permits_full_plan: false`, and blocks
`generate_full_rf_rehab_plan_while_safety_locks_output`.

## 11. Why this rule does not create dosage, exercise selection, a complete plan, RTT, or RTS

RF-REHAB-001 is a *gate*, not a planner. It decides only *whether* a full plan may be generated, never
*what* the plan contains; dosage, exercise selection, and return decisions belong to later rehab/
readiness objects. The object sets `selects_exercises: false`, `creates_rehab_dosing: false`,
`generates_complete_rehab_plan: false`, and `grants_return_to_training_or_return_to_sport_decision:
false`, and blocks the corresponding `…_from_rf_rehab_001` outputs.

## 12. How RF-REHAB-001 relates to RF-SAF-006, RF-DX-008, RF-SEV-004, and RF-SEV-005

The gate sits *downstream* of these blocking/uncertainty rules and never overrides them:
- **RF-SAF-006** (REHAB_BLOCKED for serious structural / postoperative restriction),
- **RF-DX-008** (anchor conflict → external reassessment + rehab block),
- **RF-SEV-004** (proximal/full-thickness benchmarks → defer to RF-SAF-006),
- **RF-SEV-005** (reported fibrosis/scar is history only).
The object sets `does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005: true`. When any of them
locks or blocks, RF-REHAB-001's gate cannot open a full plan.

## 13. `safety_state_output` and `blocked_targets`, and why this follows §10.4 exactly

Reading §10.4 exactly: it describes **prescription-input gating** and a **no-full-plan condition**
("diagnosis alone never authorizes a full plan; a locked safety-confidence object cannot coexist with
a full plan"). It does **not** assign any of the eight closed V3.1 §21 safety states. Per the task's
rule, because §10.4 assigns no closed safety state, `safety_state_output` is `null` and
`blocked_targets` is `[]`, and the no-full-plan / missing-input gating is represented entirely in
`decision_contract`. **No safety state was inferred by analogy** (the actual blocking states are owned
by RF-SAF-006 / RF-DX-008).

## 14. Prohibited outputs

The object's `prohibited_outputs` explicitly block: generating a full RF rehab plan from diagnosis /
strong anchor / documented RF injury / phase label / current-capacity estimate / user goal-or-preference
alone, while safety locks output, or with missing required prescription inputs; silently assuming a
missing safety / stage / current-capacity / sport-demand / equipment / schedule / concurrent-injury /
monitoring-contract input; treating unknown as negative / normal / safe / clearance; creating dosage /
sets-or-repetitions / weekly frequency / rest intervals / progression increments, selecting exercises,
producing a complete rehab plan, or producing a return-to-training or return-to-sport decision from
RF-REHAB-001; and bypassing safety / current capacity / external restrictions / stage or readiness
gates / monitoring contract / schedule reconciliation / equipment constraints / concurrent-injury
constraints because diagnosis is known.

## 15. This is not clinical approval

Authoring this object grants it no clinical authority. RF-REHAB-001 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 16. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, and RF-SEV-001 … RF-SEV-005 objects remain unchanged

Those twenty-one rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety block, the diagnosis
block, and the severity/prognosis/history block still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 22` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-REHAB-001 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
