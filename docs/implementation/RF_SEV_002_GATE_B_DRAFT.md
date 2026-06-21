# RF-SEV-002 — Gate B Draft Rule Object

The second pending, non-executable Gate B Rectus Femoris (RF) **severity** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-SEV-002.json](../../lib/clinical/rf/rules/objects/RF-SEV-002.json).

It implements the **structure** of RF v1.2 rule **RF-SEV-002** — "BAMIC ontology and RF outcome
context are separate" (v1.2 §9.3). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SEV-002's **classification/context separation
structure**:

- provenance: `source_spec_rule_id: "RF-SEV-002"`, `rule_family: "severity"`, `source_section: "§9.3"`;
- `permitted_use: "logic_with_uncertainty"` (primary; the dual role is captured structurally — see §6/§7);
- `input_contract` — BAMIC ontology stored only when supplied by a valid report / verified assessment,
  with inference from mechanism / symptoms / self-test results prohibited; MRI-confirmed outcome
  context bounded to a small elite track-and-field cohort; `source_quality_handling` preserves
  uncertainty (incl. when not MRI-confirmed); `raw_media_handling` = not interpreted here;
- `decision_contract` — `separates_bamic_ontology_from_mri_confirmed_outcome_context: true`;
  `bamic_ontology_role: "evidence_record_only…"`; `mri_confirmed_outcome_role: "logic_with_uncertainty_bounded_group_level_context_only"`;
  `outcome_effect: "may_widen_group_level_return_to_full_training_or_repeat_injury_uncertainty_only"`;
  `qrf_009_role: "ontology_only_not_decision_driving_prognosis"`;
  `qrf_040_and_qrf_041_role: "bounded_to_exact_source_supported…"`;
  `qrf_010_is_authority_for_bamic_outcomes: false`;
  `bamic_ontology_is_authority_for_raw_media_interpretation: false`; plus `false` flags for autonomous
  prognosis, fixed timeline, automatic severity conversion, deterministic recurrence score, universal
  rehab change, raw-media interpretation, generalization to unconfirmed cases, confidence/probability,
  phase/rehab/plan/RTS, and override of safety/capacity/restrictions/stage/readiness/concurrent
  injury; `safety_precedence_preserved: true`; severity/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a severity context rule, not a safety rule);
- `prohibited_outputs` (see §12);
- `test_fixtures: ["v1.2-§17-case-12", "v1.2-§17-case-13"]`.

## 2. What was NOT authored

- No autonomous prognosis engine; no fixed return date or return-to-training / return-to-sport
  timeline; no automatic severity conversion; no deterministic recurrence score; no universal rehab
  change.
- No conversion of MRI-confirmed group outcome data, cohort medians, or group benchmarks into an
  individual prediction; no generalization of MRI-confirmed outcome context to unconfirmed / weakly
  sourced / self-reported / mismatched cases.
- No raw-media interpretation; no structural grade / tendon involvement / prognosis from raw imaging.
- No numeric confidence or patient-level probability; no rehab-phase determination, rehab
  authorization, complete plan, or RTS decision; no override of safety/capacity/restrictions/stage/
  readiness/concurrent-injury constraints.
- No severity/prognosis model — only classification/context structure is preserved for the later
  severity and readiness objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SEV-002 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, and RF-SEV-001 were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claims were preserved

Copied verbatim from v1.2 §9.3 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-009` (E1; ontology only), `QRF-040` (D2), `QRF-041` (D3). Each
  individual grade and role is preserved in the object's `notes` / `decision_contract`; no combined or
  invented grade was created. (QRF-010 is explicitly **not** used as authority for BAMIC outcomes per
  §9.3, and is not cited.)

## 5. Why architecture references are intentionally empty

RF-SEV-002 is a **clinical-content** rule. Per v1.2 §4.3, clinical-content rules **cite valid
`evidence_claim_ids`** and **do not** carry architecture references; the §9.3 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**.

## 6. How BAMIC ontology is separated from MRI-confirmed RF outcome context

§9.3 keeps two things apart, and so does the object. The **ontology** (a BAMIC grade/class) is an
evidence record: stored only when a valid report or verified assessment supplies it, and never
inferred from mechanism, symptoms, or self-test results (`bamic_ontology_role: evidence_record_only…`,
`bamic_ontology_inference_sources_prohibited`). The **MRI-confirmed outcome context** is a separate,
bounded item: in a small elite track-and-field cohort, a valid MRI-confirmed grade/class may *widen
group-level uncertainty* about return-to-full-training or repeat injury — nothing more
(`mri_confirmed_outcome_role: logic_with_uncertainty_bounded_group_level_context_only`,
`outcome_effect: may_widen_…_uncertainty_only`). The object flags
`separates_bamic_ontology_from_mri_confirmed_outcome_context: true`.

## 7. Why QRF-009 remains ontology-only

§9.3 grades QRF-009 as `E1; ontology only`. An ontology defines the *naming/structure* of a grading
system; it is not outcome evidence and cannot drive prognosis. The object sets
`qrf_009_role: "ontology_only_not_decision_driving_prognosis"` and blocks
`treat_qrf_009_as_decision_driving_prognosis_evidence`. It also encodes that BAMIC ontology is not
authority for media-source handling (`bamic_ontology_is_authority_for_raw_media_interpretation:
false`) and that QRF-010 is not authority for BAMIC outcomes.

## 8. Why MRI-confirmed outcome context must remain bounded and not become an individual prognosis engine

The outcome evidence (QRF-040 D2, QRF-041 D3) comes from a *small elite track-and-field cohort* and is
graded with population/scope limits. §9.3's limits are explicit: no precise individual timeline, no
automatic severity conversion, no deterministic recurrence score, no universal rehabilitation change.
So the object bounds QRF-040/041 to their exact source context, sets `is_autonomous_prognosis_engine:
false`, `performs_automatic_severity_conversion: false`, `produces_deterministic_recurrence_score:
false`, and `produces_universal_rehabilitation_change: false`, and blocks converting MRI-confirmed
group outcome data into individual prognosis or generalizing it to unconfirmed cases.

## 9. Why cohort medians or benchmarks must not become individual timelines

A cohort statistic describes a distribution, not the individual; using it as a personal timeline is a
base-rate error (consistent with RF-SEV-001 §9.2). The object sets
`cohort_median_or_group_benchmark_role: "bounded_group_context_only_not_individual_prediction"`,
`produces_individual_prognosis: false`, and `produces_fixed_individual_timeline: false`, and blocks
converting medians/benchmarks into individual prognosis and assigning a fixed return date/duration.

## 10. Why raw imaging interpretation is prohibited

§9.3's limits and V3.1 §25 keep raw media out of the language model: the conversational model never
interprets raw images/videos. The object sets `interprets_raw_media: false` and
`infers_structural_grade_tendon_involvement_or_prognosis_from_raw_imaging: false`, and blocks
interpreting raw MRI, ultrasound, DICOM, screenshots, image files, photos, or videos, and inferring
grade / tendon involvement / prognosis from raw imaging. Only externally reported *text* descriptors
flow through (and report-descriptor handling itself is RF-DX-006).

## 11. Why the rule does not authorize rehab, phase selection, a complete plan, or RTS

A classification (ontology or MRI-confirmed) says something about the *kind/structure* of injury — not
current safety, capacity, stage, or readiness (V3.1 §8). So the object sets
`determines_current_rehab_phase: false`, `authorizes_rehab: false`, `produces_complete_rehab_plan:
false`, and `grants_return_to_sport_clearance: false`, blocks each `…_from_bamic_or_mri_classification_alone`
output, and does not override safety/capacity/restrictions/stage/readiness/concurrent-injury
constraints. Uncertainty is preserved when source quality is weak, unclear, user-entered without
source, or not MRI-confirmed as required.

## 12. Prohibited outputs

The object's `prohibited_outputs` explicitly block: using BAMIC ontology as an autonomous RF prognosis
engine; using BAMIC classification as an individual return-date / return-to-training / return-to-sport
timeline; converting MRI-confirmed group outcome data, cohort medians, or group benchmarks into
individual prognosis; assigning a fixed return date / duration from BAMIC or MRI classification;
treating QRF-009 as decision-driving prognosis evidence; generalizing MRI-confirmed RF outcome context
to unconfirmed cases; treating weak / unclear / user-entered / non-MRI-confirmed classification as
high-authority evidence; treating BAMIC ontology as raw-media interpretation authority; interpreting
raw MRI / ultrasound / DICOM / screenshots / image files / photos / videos; inferring structural grade
/ tendon involvement / prognosis from raw imaging; assigning numeric confidence or patient-level
probability from BAMIC or MRI classification; determining rehab phase, authorizing rehab, producing a
complete rehab plan, or producing a return-to-sport decision from BAMIC or MRI classification alone;
and bypassing safety / current capacity / external restrictions / stage or readiness gates because
classification is known.

## 13. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SEV-002 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 14. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, and RF-SEV-001 objects remain unchanged

Those seventeen rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety block, the diagnosis
block, and RF-SEV-001 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 18` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SEV-002 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
