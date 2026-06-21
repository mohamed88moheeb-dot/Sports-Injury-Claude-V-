# RF-SEV-001 — Gate B Draft Rule Object

The first pending, non-executable Gate B Rectus Femoris (RF) **severity** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-SEV-001.json](../../lib/clinical/rf/rules/objects/RF-SEV-001.json).

It implements the **structure** of RF v1.2 rule **RF-SEV-001** — "Munich classification" (v1.2 §9.2).
It is a draft only, and the first rule of the severity/prognosis block.

## 1. What was authored

A single machine-readable rule object expressing RF-SEV-001's **guarded group-context /
classification-record structure**:

- provenance: `source_spec_rule_id: "RF-SEV-001"`, `rule_family: "severity"`, `source_section: "§9.2"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — `classification_input` = a valid Munich muscle-injury classification (from a
  report or verified assessment), `classification_role` = structure the record and provide
  population-limited group-level context only, `source_quality_handling` = preserve uncertainty when
  the source is weak / absent / user-entered without source / unclear;
- `decision_contract` — `is_rf_specific_validation: false`;
  `imaging_negative_or_functional_category_equals_no_injury: false`;
  `cohort_median_or_group_benchmark_role: "group_context_only_not_individual_prediction"`;
  `medians_become_individual_timelines: false`; `produces_individual_prognosis: false`;
  `produces_fixed_individual_timeline: false`;
  `produces_return_to_training_or_return_to_sport_timeline: false`;
  `assigns_confidence_or_probability: false`; `determines_current_rehab_phase: false`;
  `authorizes_rehab: false`; `produces_complete_rehab_plan: false`;
  `grants_return_to_sport_clearance: false`;
  `overrides_safety_capacity_restrictions_stage_readiness_or_concurrent_injury: false`;
  `downgrades_uncertainty_on_weak_source_quality: false`; `safety_precedence_preserved: true`;
  severity/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a severity context rule, not a safety rule);
- `prohibited_outputs` (see §9);
- `test_fixtures: []` (no §17 case maps to Munich classification specifically; §17 case 12 concerns
  BAMIC / RF-SEV-002).

## 2. What was NOT authored

- No individual prognosis engine, fixed return date, or fixed return-to-training / return-to-sport
  timeline from the classification; no conversion of cohort medians or group benchmarks into an
  individual prediction.
- No numeric confidence or patient-level probability from the classification.
- No rehab-phase determination, rehab authorization, complete rehab plan, or return-to-sport decision
  from the classification.
- No override of safety, current capacity, external restrictions, stage, readiness, or concurrent-
  injury constraints.
- No severity/prognosis model — only classification/context structure is preserved for the later
  severity and readiness objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SEV-001 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001 …
  RF-DX-008 were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claims were preserved

Copied verbatim from v1.2 §9.2 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-007` (D2), `QRF-011` (D2). Both individual grades (D2 — direct evidence
  with population/context limits) are preserved in the object's `notes`; no combined or invented grade
  was created.

## 5. Why architecture references are intentionally empty

RF-SEV-001 is a **clinical-content** rule. Per v1.2 §4.3, clinical-content rules **cite valid
`evidence_claim_ids`** and **do not** carry architecture references; the §9.2 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**. The validator's provenance invariant (at least one of `architecture_refs`
or `evidence_claim_ids` non-empty) already supports this shape, so no validator or schema change was
needed.

## 6. How Munich classification may be recorded as guarded group context

§9.2 permits a **valid** Munich classification to "structure the record and provide population-limited
group-level context." So if a report or verified assessment supplies a Munich grade/category, the
object may store it (`classification_role: structure_the_record_and_provide_..._group_level_context_only`)
and surface guarded, population-level context around it. Two limits are encoded directly: it is **not**
RF-specific validation (`is_rf_specific_validation: false`), and an imaging-negative or functional
category must **not** be read as "no injury"
(`imaging_negative_or_functional_category_equals_no_injury: false`).

## 7. Why cohort medians or benchmarks must not become individual timelines

§9.2 is explicit that "medians must not become individual timelines." Population medians describe a
distribution across many athletes; the individual in front of the system may sit anywhere in (or
outside) that distribution, so a median is context, not a prediction. The object sets
`cohort_median_or_group_benchmark_role: "group_context_only_not_individual_prediction"`,
`medians_become_individual_timelines: false`, and `produces_individual_prognosis: false`, and blocks
converting medians/benchmarks into individual prognosis and assigning a fixed return date/duration
from the classification.

## 8. Why the rule does not authorize rehab, phase selection, a complete plan, or RTS

A structural classification says (at most) something about the *kind* of injury — not whether it is
safe to load now, which stage applies, or whether the athlete is ready to return; those are separate
objects (V3.1 §8). So the object sets `determines_current_rehab_phase: false`, `authorizes_rehab:
false`, `produces_complete_rehab_plan: false`, and `grants_return_to_sport_clearance: false`, and
blocks each `…_from_munich_classification_alone` output. It also does not override safety, capacity,
restrictions, stage, readiness, or concurrent-injury constraints, and preserves uncertainty when the
classification source quality is weak, unclear, or user-entered without a source.

## 9. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `use_munich_classification_as_individual_return_date_rule`;
- `use_munich_classification_as_individual_return_to_training_timeline`;
- `use_munich_classification_as_individual_return_to_sport_timeline`;
- `convert_cohort_medians_into_individual_prognosis`;
- `convert_group_benchmarks_into_individual_prognosis`;
- `assign_fixed_return_date_from_munich_classification`;
- `assign_fixed_return_duration_from_munich_classification`;
- `assign_numeric_confidence_from_munich_classification`;
- `assign_patient_level_probability_from_munich_classification`;
- `determine_rehab_phase_from_munich_classification_alone`;
- `authorize_rehab_from_munich_classification_alone`;
- `produce_a_complete_rehab_plan_from_munich_classification_alone`;
- `produce_a_return_to_sport_decision_from_munich_classification_alone`;
- `bypass_safety_because_classification_is_known`;
- `bypass_current_capacity_because_classification_is_known`;
- `bypass_external_restrictions_because_classification_is_known`;
- `bypass_stage_or_readiness_gates_because_classification_is_known`;
- `treat_weak_unclear_or_user_entered_classification_as_high_authority_evidence`.

## 10. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SEV-001 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 11. RF-SAF-001 … RF-SAF-008 and RF-DX-001 … RF-DX-008 objects remain unchanged

Those sixteen rule objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block and the diagnosis block still
hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 17` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SEV-001 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
