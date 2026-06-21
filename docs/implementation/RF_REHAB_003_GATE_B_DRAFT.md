# RF-REHAB-003 — Gate B Draft Rule Object

The third pending, non-executable Gate B Rectus Femoris (RF) **rehabilitation** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-REHAB-003.json](../../lib/clinical/rf/rules/objects/RF-REHAB-003.json).

It implements the **structure** of RF v1.2 rule **RF-REHAB-003** — "RF-biased position tag" (v1.2 §10.6).
It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-REHAB-003's **RF-biased position-tag metadata
structure**:

- provenance: `source_spec_rule_id: "RF-REHAB-003"`, `rule_family: "rehabilitation"`, `source_section: "§10.6"`;
- `permitted_use: "evidence_record_only"`;
- `input_contract` — the exact §10.6 tag (`rf_biased_position_tag:
  "approximately_40_degrees_of_hip_flexion_during_selected_knee_extension_testing_or_exercise"`),
  `tag_role: "exercise_ontology_metadata_only_rf_bias_tag"`, and a `source_quality_handling` that
  preserves uncertainty (including when the user cannot safely perform/understand the position);
- `decision_contract` — `rf_biased_position_tag_value: "approximately_40_degrees_of_hip_flexion"`;
  `tag_role: "exercise_metadata_only_rf_bias_tag"`; `is_eligibility_rule: false`;
  `determines_exercise_superiority: false`; plus `false` flags for phase-entry / stage-progression /
  readiness criteria, dosing, schedule-timing change, exercise selection, complete exercise plan,
  complete plan, RTT/RTS, bypass of RF-REHAB-001/RF-REHAB-002, and override of
  safety/capacity/restrictions/stage/readiness/monitoring/schedule/equipment/concurrent injury;
  `qrf_021_role: "rf_bias_tag_reference_only_not_exercise_superiority_dosage_or_stage_eligibility"`;
  `safety_precedence_preserved: true`; exercise ontology/selection objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §11);
- `prohibited_outputs` (see §12);
- `test_fixtures: []` (no §17 case maps specifically to the RF-bias position tag).

## 2. What was NOT authored

- No eligibility rule; no phase-entry / stage-progression / readiness criteria; no exercise-superiority
  determination.
- No dosage / sets / reps / weekly frequency / rest intervals / intensity targets / duration targets /
  progression increments / return dates; no exercise selection or complete exercise plan from the tag
  alone; no complete rehab plan; no RTT or RTS decision.
- No bypass of the RF-REHAB-001 prescription-input gate or the RF-REHAB-002 loading-dimension
  constraints; no bypass of safety / capacity / restrictions / stage / readiness / monitoring /
  schedule / equipment / concurrent-injury constraints.
- No exercise-selection engine — only RF-biased position-tag metadata is preserved for the later
  exercise ontology and selection objects.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-REHAB-003 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001/002 were consulted as structural examples only,
  not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claim was preserved

Copied verbatim from v1.2 §10.6 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-021` (E1). The grade and its bounded RF-bias-tag role are preserved in
  `notes` / `decision_contract`; no combined or invented grade was created.

## 5. Why architecture references are intentionally empty

RF-REHAB-003 is a **clinical-content** rule. Per v1.2 §4.3, clinical-content rules **cite valid
`evidence_claim_ids`** and **do not** carry architecture references; the §10.6 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**.

## 6. How the RF-biased position tag may be recorded as exercise metadata

§10.6 says "approximately 40 degrees of hip flexion during selected knee-extension testing or exercise
may be stored as an RF-bias tag." So the object stores exactly that descriptor — preserving the
approximate 40° value — as an **exercise ontology metadata** tag (`tag_role:
exercise_ontology_metadata_only_rf_bias_tag`). It annotates that a given test/exercise is biased
toward loading the (biarticular) rectus femoris at that hip position; it does not act on that
annotation.

## 7. Why QRF-021 must not be generalized beyond its source-supported role

QRF-021 (E1) supports the *existence of the RF-bias tag*. §10.6's prohibited use is explicit: the tag
"cannot independently determine exercise superiority, dosage, or stage eligibility." Treating a
positional bias as proof that one exercise is better, or as a dosing/eligibility rule, would exceed the
evidence. The object sets `qrf_021_role: "rf_bias_tag_reference_only_not_exercise_superiority_dosage_or_stage_eligibility"`,
`determines_exercise_superiority: false`, and blocks the corresponding outputs.

## 8. Why the tag cannot set eligibility, dosage, phase entry, progression criteria, readiness, a complete plan, RTT, or RTS

A positional annotation describes *where* a muscle is preferentially loaded — not *whether* an athlete
may load it, *how much*, *when to progress*, or *when to return*; those are decided by safety, stage,
capacity, monitoring, and separately governed content (V3.1 §8/§13; §10.6 prohibited use). So the
object sets `is_eligibility_rule: false`, `creates_phase_entry_criteria: false`,
`creates_stage_progression_criteria: false`, `creates_readiness_criteria: false`, `creates_rehab_dosing:
false`, `selects_exercises_by_itself: false`, `selects_complete_exercise_plan: false`,
`generates_complete_rehab_plan: false`, and `grants_return_to_training_or_return_to_sport_decision:
false`, and blocks each corresponding output.

## 9. How RF-REHAB-003 relates to RF-REHAB-001 and RF-REHAB-002

The tag is metadata used *within* the gated rehab pipeline, never around it. It does not bypass the
RF-REHAB-001 prescription-input gate (`bypasses_rf_rehab_001_prescription_input_gate: false`,
`does_not_override_rf_rehab_001: true`), and it sits alongside the RF-REHAB-002 loading-dimension
ontology without bypassing its constraints (`bypasses_rf_rehab_002_loading_dimension_constraints:
false`, `does_not_override_rf_rehab_002: true`). It is one more ontology annotation, subordinate to
both gates.

## 10. How RF-REHAB-003 relates to RF-SAF-006, RF-DX-008, RF-SEV-004, and RF-SEV-005

It never overrides these blocking/uncertainty rules
(`does_not_override_rf_saf_006/rf_dx_008/rf_sev_004/rf_sev_005: true`). If RF-SAF-006 blocks rehab,
RF-DX-008 holds an anchor conflict, RF-SEV-004 defers to the safety block, or RF-SEV-005 keeps a
reported scar as history only, an RF-bias tag changes nothing.

## 11. `safety_state_output` and `blocked_targets`, and why this follows §10.6 exactly

Reading §10.6 exactly: it describes an **exercise metadata tag** and a **prohibited use** — it does
**not** assign any of the eight closed V3.1 §21 safety states. Per the task's rule, because §10.6
assigns no closed safety state, `safety_state_output` is `null` and `blocked_targets` is `[]`, and the
position-tag limits are represented entirely in `decision_contract`. **No safety state was inferred by
analogy.**

## 12. Prohibited outputs

The object's `prohibited_outputs` explicitly block: treating the RF-biased position tag as an
eligibility rule, phase-entry criteria, stage-progression criteria, or readiness criteria; creating
dosage / sets-or-repetitions / weekly frequency / rest intervals / intensity targets / duration
targets / progression increments / return dates, selecting exercises or a complete exercise plan from
the tag alone, producing a complete rehab plan, or producing a return-to-training or return-to-sport
decision from RF-REHAB-003; bypassing the RF-REHAB-001 prescription-input gate or the RF-REHAB-002
loading-dimension constraints; bypassing safety / current capacity / external restrictions / stage or
readiness gates / monitoring contract / schedule reconciliation / equipment constraints /
concurrent-injury constraints because the tag is known; and treating incomplete or uncertain
RF-biased position metadata as high-authority selection evidence.

## 13. This is not clinical approval

Authoring this object grants it no clinical authority. RF-REHAB-003 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 14. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 … RF-REHAB-002 objects remain unchanged

Those twenty-three rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history blocks and RF-REHAB-001/002 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 24` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-REHAB-003 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
