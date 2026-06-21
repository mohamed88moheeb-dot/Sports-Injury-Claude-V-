# RF-REHAB-002 — Gate B Draft Rule Object

The second pending, non-executable Gate B Rectus Femoris (RF) **rehabilitation** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-REHAB-002.json](../../lib/clinical/rf/rules/objects/RF-REHAB-002.json).

It implements the **structure** of RF v1.2 rule **RF-REHAB-002** — "loading dimensions are ontology
metadata, not a universal sequence" (v1.2 §10.5). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-REHAB-002's **loading-dimension ontology /
selection-constraint structure**:

- provenance: `source_spec_rule_id: "RF-REHAB-002"`, `rule_family: "rehabilitation"`, `source_section: "§10.5"`;
- `permitted_use: "logic_with_uncertainty"` (primary; dual role captured — see §4/§5);
- `input_contract` — the six §10.5 `loading_dimensions` (muscle_length, movement_speed,
  contraction_mode, load, complexity, sport_specificity); `loading_dimensions_role` =
  exercise ontology metadata only; `selection_constraint_precondition` = may constrain selection only
  after the RF-REHAB-001 gate is satisfied; `source_quality_handling` preserves uncertainty;
- `decision_contract` — ontology metadata + selection constraint only;
  `ontology_selection_permitted_use: "logic_with_uncertainty_only_after_upstream_gates_permit"`;
  `proposed_sequence_permitted_use: "evidence_record_only"`;
  `qrf_020_role: "loading_dimension_ontology_reference_only_not_universal_ordering_or_dosage"`;
  `constrains_selection_only_after_rf_rehab_001_gate_satisfied: true`; `is_universal_rf_rehab_sequence:
  false`; `is_mandatory_order_for_all_rf_patients: false`; plus `false` flags for phase-entry /
  stage-progression / readiness criteria, dosing, schedule-timing change, complete exercise plan,
  complete plan, and RTT/RTS; `chosen_progression_justified_by: "stage_capacity_monitoring_and_separately_governed_content"`;
  `bypasses_rf_rehab_001_prescription_input_gate: false`;
  `does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005/rf_rehab_001`; `safety_precedence_preserved: true`;
  rehab selection/planning objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §12);
- `prohibited_outputs` (see §13);
- `test_fixtures: []` (no §17 case maps specifically to loading dimensions).

## 2. What was NOT authored

- No universal RF rehab sequence; no mandatory order for all RF patients; no phase-entry / stage-
  progression / readiness criteria from loading dimensions.
- No dosage / sets / reps / weekly frequency / rest intervals / intensity targets / duration targets /
  progression increments / return dates; no complete exercise plan; no complete rehab plan; no RTT or
  RTS decision.
- No bypass of the RF-REHAB-001 prescription-input gate; no bypass of safety / capacity / restrictions
  / stage / readiness / monitoring / schedule / equipment / concurrent-injury constraints.
- No exercise-selection engine — only ontology/selection-constraint structure is preserved for the
  later rehab selection and planning objects.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-REHAB-002 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 were consulted as structural examples only, not
  as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claim were preserved

Copied verbatim from v1.2 §10.5 / the inventory — none invented:

- `architecture_refs`: `V3.1-13` (rehab prescription/scheduling/monitoring), `V3.1-35` (exercise
  knowledge system).
- `evidence_claim_ids`: `QRF-020` (E1). The grade and its bounded loading-dimension ontology/reference
  role are preserved in `notes` / `decision_contract`; no combined or invented grade was created, and
  it is not generalized into a universal sequence or dosage.

## 5. How loading dimensions may be recorded as ontology metadata

§10.5 says exercise candidates "may be described by muscle length, movement speed, contraction mode,
load, complexity, and sport specificity." Those six descriptors are stored as **ontology metadata**
about each candidate exercise (`loading_dimensions_role: exercise_ontology_metadata_only`) — they
characterize exercises in the shared knowledge graph (V3.1 §35); they are not a plan.

## 6. How loading dimensions may constrain exercise selection only after upstream gates are satisfied

The dual permitted-use is preserved: `logic_with_uncertainty` for ontology *selection* but
`evidence_record_only` for any proposed *sequence*. Crucially, selection-constraint use is gated:
`selection_constraint_precondition` / `constrains_selection_only_after_rf_rehab_001_gate_satisfied:
true`. So loading dimensions may help *filter* candidate exercises only once RF-REHAB-001's complete
prescription-input set is present and safety has not locked output — never before.

## 7. Why loading dimensions are not a universal RF rehab sequence

§10.5's headline and limit are explicit: loading dimensions are "not a universal sequence," and
QRF-020 "does not prove a universal ordering or dosage." Different athletes, stages, and capacities
warrant different orderings; a fixed sequence would impose one path on everyone. The object sets
`is_universal_rf_rehab_sequence: false` and `is_mandatory_order_for_all_rf_patients: false`, requires
`chosen_progression_justified_by: stage_capacity_monitoring_and_separately_governed_content`, and
blocks treating loading dimensions as a universal sequence or mandatory order.

## 8. Why QRF-020 must not be generalized beyond its source-supported role

QRF-020 (E1) supports the *existence of the loading-dimension ontology* — it does not prove ordering
or dosage (§10.5 limit). Treating it as sequencing authority would exceed the evidence. The object sets
`qrf_020_role: "loading_dimension_ontology_reference_only_not_universal_ordering_or_dosage"` and blocks
`treat_qrf_020_as_universal_sequencing_authority`.

## 9. Why the rule does not create dosage, exercise plans, phase entry, progression criteria, RTT, or RTS

Ontology metadata describes exercises; it does not set how much, how often, when to progress, or when
to return — those are decided by stage, capacity, monitoring, and separately governed content
(§10.5 limit; V3.1 §8/§13). So the object sets `creates_rehab_dosing: false`,
`selects_complete_exercise_plan: false`, `creates_phase_entry_criteria: false`,
`creates_stage_progression_criteria: false`, `creates_readiness_criteria: false`,
`generates_complete_rehab_plan: false`, and `grants_return_to_training_or_return_to_sport_decision:
false`, and blocks the corresponding `…_from_rf_rehab_002` and `…_from_loading_dimensions_alone`
outputs.

## 10. How RF-REHAB-002 relates to RF-REHAB-001

RF-REHAB-002 sits **downstream** of the RF-REHAB-001 prescription-input gate. Loading dimensions may
constrain selection only *after* RF-REHAB-001 confirms the complete required-input set is present and
no safety lock applies. The object sets `constrains_selection_only_after_rf_rehab_001_gate_satisfied:
true`, `bypasses_rf_rehab_001_prescription_input_gate: false`, and `does_not_override_rf_rehab_001:
true`, and blocks `bypass_rf_rehab_001_prescription_input_gate`.

## 11. How RF-REHAB-002 relates to RF-SAF-006, RF-DX-008, RF-SEV-004, and RF-SEV-005

It never overrides these blocking/uncertainty rules
(`does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005: true`). If RF-SAF-006 blocks rehab,
RF-DX-008 holds an anchor conflict, RF-SEV-004 defers to the safety block, or RF-SEV-005 keeps a
reported scar as history only, loading-dimension selection cannot proceed against them.

## 12. `safety_state_output` and `blocked_targets`, and why this follows §10.5 exactly

Reading §10.5 exactly: it describes **loading-dimension ontology and selection constraints** and a
**limit** on QRF-020 — it does **not** assign any of the eight closed V3.1 §21 safety states. Per the
task's rule, because §10.5 assigns no closed safety state, `safety_state_output` is `null` and
`blocked_targets` is `[]`, and the loading-dimension constraints are represented entirely in
`decision_contract`. **No safety state was inferred by analogy** (the blocking states stay owned by
RF-SAF-006 / RF-DX-008, and the no-full-plan gate by RF-REHAB-001).

## 13. Prohibited outputs

The object's `prohibited_outputs` explicitly block: treating loading dimensions as a universal RF
rehab sequence or mandatory order for all RF patients; treating QRF-020 as universal sequencing
authority; generating a full RF rehab plan or selecting a complete exercise plan from loading
dimensions alone; creating phase-entry / stage-progression / readiness criteria from loading dimensions
alone; creating dosage / sets-or-repetitions / weekly frequency / rest intervals / intensity targets /
duration targets / progression increments / return dates, producing a complete rehab plan, or producing
a return-to-training or return-to-sport decision from RF-REHAB-002; bypassing the RF-REHAB-001
prescription-input gate; bypassing safety / current capacity / external restrictions / stage or
readiness gates / monitoring contract / schedule reconciliation / equipment constraints /
concurrent-injury constraints because loading dimensions are known; and treating incomplete or
uncertain loading-dimension metadata as high-authority selection evidence.

## 14. This is not clinical approval

Authoring this object grants it no clinical authority. RF-REHAB-002 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 15. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 objects remain unchanged

Those twenty-two rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history blocks and RF-REHAB-001 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 23` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-REHAB-002 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
