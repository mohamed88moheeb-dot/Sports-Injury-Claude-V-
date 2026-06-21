# RF-REHAB-005 — Gate B Draft Rule Object

The fifth pending, non-executable Gate B Rectus Femoris (RF) **rehabilitation** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-REHAB-005.json](../../lib/clinical/rf/rules/objects/RF-REHAB-005.json).

It implements the **structure** of RF v1.2 rule **RF-REHAB-005** — "schedule and total-load
reconciliation" (v1.2 §10.8). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-REHAB-005's **schedule and total-load
reconciliation structure**:

- provenance: `source_spec_rule_id: "RF-REHAB-005"`, `rule_family: "rehabilitation"`, `source_section: "§10.8"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the eight §10.8 `total_load_domains_to_reconcile` (strength, eccentric_exposure,
  running, sprinting, kicking, matches, conditioning, concurrent_injury_work); the
  `external_load_inputs_considered` (external training, competition, match, kicking, high-speed
  running, heavy strength, eccentric overload, other-injury rehab); `external_load_assumption_status`
  (unknown stays unknown → governed missing-data behaviour, never silent clearance); and a
  `source_quality_handling` that preserves uncertainty;
- `decision_contract` — `schedule_reconciliation_required: true`;
  `total_load_composition: "compose_all_active_load_domains_into_one_weekly_load_plan"`;
  `avoids_duplicate_tissue_stress: true`; `avoids_unaccounted_load_stacking: true`;
  `considers_external_training_and_competition_load: true`;
  `schedule_conflict_response: "if_schedule_cannot_satisfy_all_active_constraints_modify_restrict_or_block_the_plan"`;
  `false` flags for every silent zero/absent assumption, treating unknown load as clearance, progression
  from schedule fit alone, schedule compatibility as readiness, prescription/exercise-selection/plan/RTT/RTS,
  bypass of RF-REHAB-001/002/003/004, and override of safety/capacity/restrictions/stage/readiness/
  monitoring/equipment/concurrent injury; `safety_precedence_preserved: true`; scheduling engine deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §14);
- `prohibited_outputs` (see §15);
- `test_fixtures: ["v1.2-§17-case-23"]`.

## 2. What was NOT authored

- No dosage / sets / reps / weekly frequency / rest intervals / intensity targets / duration targets /
  progression increments / return dates; no exercise selection or complete exercise plan; no complete
  rehab plan; no RTT or RTS decision.
- No progression authorization from schedule fit alone; no use of schedule compatibility alone as
  readiness.
- No bypass of the RF-REHAB-001/002/003/004 gates/constraints/prohibitions; no bypass of safety /
  capacity / restrictions / stage / readiness / monitoring / equipment / concurrent-injury constraints.
- No scheduling engine — only the schedule and total-load reconciliation structure is preserved for the
  later rehab selection and planning objects.
- No invented architecture references (see §5); no invented evidence claim IDs.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-REHAB-005 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001/002/003/004 were consulted as structural
  examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references were preserved

Copied verbatim from v1.2 §10.8 / the inventory — none invented:

- `architecture_refs`: `V3.1-11` (concurrent & secondary injuries), `V3.1-13.3` (scheduling & load
  coordination).

## 5. Why evidence claim IDs are intentionally empty

RF-REHAB-005 is an **architecture-source** rule — it governs schedule/total-load reconciliation, not an
RF-specific clinical claim. Per v1.2 §4.3, architecture rules cite `architecture_refs` and **must not
invent** clinical evidence claims. Accordingly, `evidence_claim_ids` is intentionally `[]` — "none
required," not "missing." No QRF IDs were fabricated.

## 6. Why this rule is an architecture-source schedule/total-load reconciliation rule

The concern §10.8 addresses is *engineering/architecture* — how the system composes everything an
athlete actually does into one coherent weekly load picture — not a claim about RF biology. That is
why it is architecture-source (V3.1 §11 concurrent injuries, §13.3 scheduling & load coordination) and
carries no QRF claims.

## 7. Which load domains must be reconciled

Per §10.8, all of: **strength, eccentric exposure, running, sprinting, kicking, matches, conditioning,
and concurrent-injury work** — composed into one weekly load plan
(`total_load_composition: compose_all_active_load_domains_into_one_weekly_load_plan`). The object also
lists the external-load inputs (external training, competition, match, kicking, high-speed running,
heavy strength, eccentric overload, other-injury rehab) that must be considered.

## 8. Why duplicate tissue stress and unaccounted stacking must be avoided

The rectus femoris is loaded by many of these domains at once (sprinting, kicking, eccentric work,
strength). If they are scheduled without a single load picture, the same tissue can be stressed twice
in a day or week (duplicate tissue stress) or total load can quietly exceed tolerance (unaccounted
stacking) — a classic overuse/reinjury path. The object sets `avoids_duplicate_tissue_stress: true` and
`avoids_unaccounted_load_stacking: true`, and blocks generating a plan while either is unresolved.

## 9. What happens when schedule or total-load constraints cannot be satisfied

§10.8's decision is explicit: "if the schedule cannot satisfy all active constraints, modify, restrict,
or block the plan." The object records this as
`schedule_conflict_response: "if_schedule_cannot_satisfy_all_active_constraints_modify_restrict_or_block_the_plan"`.
(A terminal `REHAB_BLOCKED` for an *irreconcilable concurrent-injury* conflict is owned by RF-REHAB-006
/ RF-SAF-006, not assigned here.)

## 10. Why unknown external load or unknown schedule compatibility is not clearance

Missing load data is not the same as zero load, and missing schedule data is not the same as
compatible (V3.1 §7.3 / §24: unknown is never negative/clearance). Assuming "they're not doing anything
else" could stack hidden load onto a healing tissue. The object's `external_load_assumption_status`
keeps unknown external load *unknown* (triggering governed missing-data behaviour), sets every
`silently_assumes_…_is_zero/absent: false` and `treats_unknown_external_load_as_clearance: false`, and
blocks the corresponding silent-assumption and unknown-as-clearance outputs.

## 11. Why the rule does not create dosage, exercise selection, progression, complete plan, RTT, or RTS

Reconciliation coordinates *when and how much total* load is scheduled; it does not decide the specific
dose, which exercises, when to progress, or when to return — those belong to separately governed objects
(V3.1 §8/§13; RF-REHAB-004 forbids universal dosing). The object sets `creates_rehab_prescription:
false`, `selects_exercises: false`, `selects_complete_exercise_plan: false`, `generates_complete_rehab_plan:
false`, `grants_return_to_training_or_return_to_sport_decision: false`,
`authorizes_progression_from_schedule_fit_alone: false`, and
`uses_schedule_compatibility_alone_as_readiness: false`, and blocks the corresponding outputs.

## 12. How RF-REHAB-005 relates to RF-REHAB-001, RF-REHAB-002, RF-REHAB-003, and RF-REHAB-004

Reconciliation operates within the gated rehab pipeline, never around it. The object does not bypass
the RF-REHAB-001 prescription-input gate, the RF-REHAB-002 loading-dimension constraints, the
RF-REHAB-003 position-tag limits, or the RF-REHAB-004 universal-dosage prohibition (all `bypasses_…:
false`, `does_not_override_rf_rehab_001/002/003/004: true`). A schedule that "fits" cannot unlock any of
them.

## 13. How RF-REHAB-005 relates to RF-SAF-006, RF-DX-008, RF-SEV-004, and RF-SEV-005

It never overrides these blocking/uncertainty rules
(`does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005: true`). If any of them blocks or holds,
total-load reconciliation cannot proceed against it.

## 14. `safety_state_output` and `blocked_targets`, and why this follows §10.8 exactly

Reading §10.8 exactly: it describes **total-load reconciliation** and a **modify/restrict/block conflict
response** — it does **not** assign any of the eight closed V3.1 §21 safety states. Per the task's rule,
because §10.8 assigns no closed safety state, `safety_state_output` is `null` and `blocked_targets` is
`[]`, and the schedule-conflict behaviour is represented entirely in `decision_contract`. **No safety
state was inferred by analogy** (the terminal `REHAB_BLOCKED` for an irreconcilable concurrent-injury
conflict is owned by RF-REHAB-006 / RF-SAF-006).

## 15. Prohibited outputs

The object's `prohibited_outputs` explicitly block: generating a rehab plan without schedule or
total-load reconciliation, or while duplicate tissue stress / unaccounted load stacking is unresolved;
silently assuming external training / competition / match / kicking / high-speed running / heavy
strength load is zero, eccentric overload or other-injury rehab is absent, or schedule compatibility
when schedule data are missing; treating unknown external / competition load or unknown schedule
compatibility as clearance; creating dosage / sets-or-repetitions / weekly frequency / rest intervals /
intensity targets / duration targets / progression increments / return dates, selecting exercises or a
complete exercise plan, producing a complete rehab plan, or producing a return-to-training or
return-to-sport decision from RF-REHAB-005; authorizing progression from schedule fit alone or treating
schedule compatibility as readiness; bypassing the RF-REHAB-001/002/003/004 gates/constraints/
prohibitions; bypassing safety / current capacity / external restrictions / stage or readiness gates /
monitoring contract / equipment constraints / concurrent-injury constraints because the schedule appears
compatible; and treating incomplete or uncertain schedule/load data as high-authority rehab evidence.

## 16. This is not clinical approval

Authoring this object grants it no clinical authority. RF-REHAB-005 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 17. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 … RF-REHAB-004 objects remain unchanged

Those twenty-five rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history blocks and RF-REHAB-001/002/003/004 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 26` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-REHAB-005 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
