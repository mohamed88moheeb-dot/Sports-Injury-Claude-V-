# RF-REHAB-006 — Gate B Draft Rule Object

The sixth and **final** pending, non-executable Gate B Rectus Femoris (RF) **rehabilitation** rule
object has been authored:
[lib/clinical/rf/rules/objects/RF-REHAB-006.json](../../lib/clinical/rf/rules/objects/RF-REHAB-006.json).

It implements the **structure** of RF v1.2 rule **RF-REHAB-006** — "concurrent injury constraints
govern" (v1.2 §10.9). It is a draft only. With this, the rehabilitation block (RF-REHAB-001 …
RF-REHAB-006) is complete.

## 1. What was authored

A single machine-readable rule object expressing RF-REHAB-006's **concurrent-injury constraint /
compatible-plan gating structure**:

- provenance: `source_spec_rule_id: "RF-REHAB-006"`, `rule_family: "rehabilitation"`, `source_section: "§10.9"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the §10.9 `activation` (secondary/contributing/concurrent/referred/compensatory/
  chronic conditions active); `concurrent_injury_constraints_required: true`; the
  `compatibility_check_domains` (concurrent-injury restrictions, symptoms, capacity limits, external
  plans, monitoring constraints); `external_restriction_assumption_status` (unknown stays unknown →
  governed missing-data, never silent clearance); `source_quality_handling`;
- `decision_contract` — `concurrent_injury_constraints_govern: true`;
  `compatible_plan_requirement: "compose_one_programme_under_the_most_restrictive_active_contraindication…"`;
  `compatible_route_status: "if_a_compatible_route_exists_preserve_it_as_structure_only_not_as_a_complete_plan"`;
  `terminal_no_compatible_plan_state: "if_no_plan_satisfies_every_active_contraindication_set_terminal_rehab_blocked_withhold_the_plan_and_refer"`;
  `no_condition_silently_ignored: true`;
  `prioritizes_rf_rehab_over_more_restrictive_concurrent_injury_constraint: false`; plus `false` flags
  for silent ignore/assume, treating unknown as clearance, progression/readiness from compatibility
  alone, prescription/exercise-selection/complete RF or combined plan/RTT/RTS, bypass of
  RF-REHAB-001/002/003/004/005, and override of safety/capacity/restrictions/stage/readiness/
  monitoring/schedule/equipment/concurrent injury; `safety_precedence_preserved: true`; rehab engine
  deferred;
- `safety_state_output: "REHAB_BLOCKED"`, `blocked_targets: ["rehab"]` (see §10/§15);
- `prohibited_outputs` (see §16);
- `test_fixtures: ["v1.2-§17-case-24"]`.

## 2. What was NOT authored

- No prioritization of RF rehab over a more restrictive concurrent-injury constraint; no silent ignore
  or silent compatibility assumption of any concurrent condition / external restriction / other plan.
- No complete RF rehab plan; no complete combined rehab plan; no dosage / sets / reps / weekly frequency
  / rest intervals / intensity targets / duration targets / progression increments / return dates; no
  exercise selection or complete exercise plan; no RTT or RTS decision.
- No progression authorization from compatibility alone; no use of compatibility as readiness.
- No bypass of RF-REHAB-001/002/003/004/005; no bypass of safety / capacity / restrictions / stage /
  readiness / monitoring / schedule / equipment / concurrent-injury constraints.
- No rehab engine — only the concurrent-injury compatibility/blocking structure is preserved for the
  later rehab selection and planning objects.
- No invented architecture references (see §5); no invented evidence claim IDs.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-REHAB-006 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 … RF-REHAB-005 were consulted as structural
  examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references were preserved

Copied verbatim from v1.2 §10.9 / the inventory — none invented:

- `architecture_refs`: `V3.1-11` (concurrent & secondary injuries), `V3.1-15.2` (concurrent-injury
  role taxonomy / reconciliation).

## 5. Why evidence claim IDs are intentionally empty

RF-REHAB-006 is an **architecture-source** rule — it governs concurrent-injury compatibility, not an
RF-specific clinical claim. Per v1.2 §4.3, architecture rules cite `architecture_refs` and **must not
invent** clinical evidence claims. Accordingly, `evidence_claim_ids` is intentionally `[]` — "none
required," not "missing." No QRF IDs were fabricated.

## 6. Why this rule is an architecture-source concurrent-injury compatibility rule

Coordinating multiple active conditions into one safe programme is an *architecture* concern (V3.1 §11
concurrent injuries, §15.2 role taxonomy), not a claim about RF biology — hence architecture-source
with no QRF claims.

## 7. What concurrent-injury constraints must govern

Per §10.9, when one or more secondary/contributing/concurrent/referred/compensatory/chronic conditions
are active, the programme must be composed **under the most restrictive active contraindication**,
avoiding incompatible loading and duplicate workload while preserving safe unaffected training. The
object checks compatibility across concurrent-injury restrictions, symptoms, capacity limits, external
plans, and monitoring constraints, and sets `prioritizes_rf_rehab_over_more_restrictive_concurrent_injury_constraint:
false` (the more restrictive constraint always wins).

## 8. What happens if a compatible RF rehab route exists

If a route exists that satisfies every active contraindication, the rule may preserve it as
**structure only** — `compatible_route_status: "…preserve_it_as_structure_only_not_as_a_complete_plan"`.
RF-REHAB-006 does not itself emit the plan; it confirms a compatible route is possible and leaves
plan generation to the (separately gated, separately governed) rehab objects.

## 9. What happens if no compatible plan exists

Per §10.9, "if no plan satisfies every active contraindication, set terminal `REHAB_BLOCKED`, withhold
the plan, and refer. No condition may be silently ignored." The object encodes
`terminal_no_compatible_plan_state` exactly to that effect and `no_condition_silently_ignored: true`.

## 10. Why terminal `REHAB_BLOCKED`, if used, follows §10.9 exactly

§10.9 **explicitly names** terminal `REHAB_BLOCKED` (withhold + refer) for the no-compatible-plan case.
That is a closed V3.1 §21 state whose required blocked target is `rehab`. So `safety_state_output:
"REHAB_BLOCKED"` and `blocked_targets: ["rehab"]` are taken **directly from the source**, not inferred
by analogy — matching how RF-SAF-006 encodes a terminal rehab block and the V3.1 §22 invariant that a
terminal safety state cannot coexist with a full plan.

## 11. Why unknown concurrent-injury compatibility or unknown external restrictions are not clearance

Missing concurrent-injury data is not the same as "no concurrent injury," and unknown compatibility is
not the same as compatible (V3.1 §7.3 / §24: unknown is never negative/clearance). Assuming absence
could load a healing RF tissue against a hidden contraindication. The object's
`external_restriction_assumption_status` keeps unknown restrictions *unknown*, sets every
`silently_assumes_…: false` and `treats_unknown_compatibility_as_clearance: false`, routes unknowns to
governed missing-data behaviour, and blocks the corresponding silent-assumption and unknown-as-clearance
outputs.

## 12. Why the rule does not create dosage, exercise selection, progression, complete RF plan, combined plan, RTT, or RTS

It is a governing/gating rule: it decides whether a compatible programme is *possible* and, if not,
blocks — it does not author the dose, exercises, progression, or return. Those belong to separately
governed objects (V3.1 §8/§13; RF-REHAB-004 forbids universal dosing). The object sets
`creates_rehab_prescription: false`, `selects_exercises: false`, `selects_complete_exercise_plan: false`,
`generates_complete_rehab_plan: false`, `generates_complete_combined_rehab_plan: false`,
`grants_return_to_training_or_return_to_sport_decision: false`,
`authorizes_progression_from_compatibility_alone: false`, and
`uses_compatibility_alone_as_readiness: false`, and blocks the corresponding outputs.

## 13. How RF-REHAB-006 relates to RF-REHAB-001, RF-REHAB-002, RF-REHAB-003, RF-REHAB-004, and RF-REHAB-005

It governs within the gated rehab pipeline, never around it. The object does not bypass the
RF-REHAB-001 prescription-input gate, the RF-REHAB-002 loading-dimension constraints, the RF-REHAB-003
position-tag limits, the RF-REHAB-004 universal-dosage prohibition, or the RF-REHAB-005 schedule/
total-load reconciliation (all `bypasses_…: false`, `does_not_override_rf_rehab_001…005: true`). A
"compatible" finding cannot unlock any of them.

## 14. How RF-REHAB-006 relates to RF-SAF-006, RF-DX-008, RF-SEV-004, and RF-SEV-005

It never overrides these blocking/uncertainty rules
(`does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005: true`). Its own terminal `REHAB_BLOCKED`
is consistent with — and additive to — RF-SAF-006's structural-restriction block; if those rules block
or hold, concurrent-injury reconciliation cannot proceed against them.

## 15. `safety_state_output` and `blocked_targets`, and why this follows §10.9 exactly

§10.9 explicitly assigns **terminal `REHAB_BLOCKED`** (withhold + refer) when no plan satisfies every
active contraindication. Per the task's rule, that exact closed V3.1 §21 state is encoded:
`safety_state_output: "REHAB_BLOCKED"`, `blocked_targets: ["rehab"]`. No safety state was inferred by
analogy; the compatible-route branch is represented as structure in `decision_contract`, never as a
plan.

## 16. Prohibited outputs

The object's `prohibited_outputs` explicitly block: generating an RF rehab plan while concurrent-injury
compatibility is unresolved, when no compatible plan exists, or a combined plan when none exists;
ignoring concurrent injuries; silently assuming concurrent-injury constraints are compatible, external
restrictions are absent, or another rehab plan is compatible; prioritizing RF rehab over a more
restrictive concurrent-injury constraint; treating unknown compatibility / external restrictions /
capacity impact as clearance; creating dosage / sets-or-repetitions / weekly frequency / rest intervals
/ intensity targets / duration targets / progression increments / return dates, selecting exercises or
a complete exercise plan, producing a complete RF or combined rehab plan, or producing a
return-to-training or return-to-sport decision from RF-REHAB-006; authorizing progression from
compatibility alone or treating compatibility as readiness; bypassing the RF-REHAB-001/002/003/004/005
gates/constraints/prohibitions; bypassing safety / current capacity / external restrictions / stage or
readiness gates / monitoring contract / schedule reconciliation / equipment constraints because
concurrent-injury compatibility appears resolved; and treating incomplete or uncertain concurrent-injury
data as high-authority rehab evidence.

## 17. This is not clinical approval

Authoring this object grants it no clinical authority. RF-REHAB-006 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 18. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 … RF-REHAB-005 objects remain unchanged

Those twenty-six rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history blocks and RF-REHAB-001…005 still hold.

## 19. The rehabilitation block RF-REHAB-001 … RF-REHAB-006 is now complete

All six rehabilitation rules are drafted: RF-REHAB-001 (prescription-input gate), RF-REHAB-002
(loading-dimension ontology), RF-REHAB-003 (RF-bias position tag), RF-REHAB-004 (no universal dosage),
RF-REHAB-005 (schedule/total-load reconciliation), and RF-REHAB-006 (concurrent-injury constraints
govern/block). The package now holds 27 authored objects across safety (8), diagnosis (8),
severity/prognosis/history (5), and rehabilitation (6).

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 27` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-REHAB-006 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
