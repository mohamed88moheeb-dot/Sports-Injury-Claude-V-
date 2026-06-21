# RF-DX-001 — Gate B Draft Rule Object

The first pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-DX-001.json](../../lib/clinical/rf/rules/objects/RF-DX-001.json).

It implements the **structure** of RF v1.2 rule **RF-DX-001** — "mechanism activates questions, not
diagnostic weighting" (v1.2 §8.3). It is a draft only and the first non-safety rule in the package.

## 1. What was authored

A single machine-readable rule object expressing RF-DX-001's **question-activation / intake-branching
structure**:

- provenance: `source_spec_rule_id: "RF-DX-001"`, `rule_family: "diagnosis"`, `source_section: "§8.3"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the mechanism signals from §8.3 (kicking, sprinting, acceleration, jumping, other),
  with `mechanism_role: "activate_targeted_follow_up_questions_and_relevant_differentials_only"`;
- `decision_contract` — activate follow-up questions and relevant differentials;
  `mechanism_assigns_diagnostic_weight: false`;
  `mechanism_percentages_role: evidence_record_only_reference_context_not_patient_level_probability`;
  `qrf_039_santos_role: abstract_metadata_only_reference_only_not_decision_driving`;
  `does_not_diagnose_rf`, `does_not_rank_rf_above_differentials_from_mechanism_alone`,
  `safety_precedence_preserved`, `mechanism_is_not_safety_clearance`, and a structure-only deferral of
  the diagnostic confidence objects;
- `safety_state_output: null`, `blocked_targets: []` (a diagnosis intake rule, not a safety rule);
- `prohibited_outputs` (see §7);
- `test_fixtures` referencing v1.2 §17 cases 1 and 11.

## 2. What was NOT authored

- No diagnosis from mechanism; no diagnostic weighting, probability, or numeric confidence from
  mechanism; no ranking of RF above differentials on mechanism alone.
- No diagnostic confidence model — only the structure needed for the later confidence objects is
  preserved (no numeric value, no calibration; V3.1 §8.2 / §24.1).
- No rehab authorization, complete rehab plan, or return-to-sport decision.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No weakening or bypassing of any safety rule.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-001 was authored. (RF-SAF-001 … RF-SAF-008 were consulted as
  structural examples only; the safety reconciliation audit was used only to confirm the safety block
  is reconciled, not as diagnosis authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Architecture references and evidence claims preserved

Copied verbatim from v1.2 §8.3 / the inventory — none invented:

- `architecture_refs`: `V3.1-4`, `V3.1-5`, `V3.1-15.1`.
- `evidence_claim_ids`: `QRF-001` (M1; evidence-record-only), `QRF-039` (D3; evidence-record-only —
  Santos abstract/metadata-only, reference-only, **not** decision-driving). The roles and grades are
  preserved in the object's `notes` and `decision_contract`; no combined or invented grade was
  created.

## 5. How mechanism activates questions without becoming diagnostic weighting

§8.3's logic is that mechanisms (kicking, sprinting, acceleration, jumping, …) **activate** targeted
follow-up questions and relevant differentials — they steer the *intake*, not the *verdict*. The
object encodes this as `mechanism_role: activate_…_only` and `mechanism_assigns_diagnostic_weight:
false`, and blocks `assign_diagnostic_weight_from_mechanism_alone` and
`diagnose_rf_strain_from_mechanism_alone`. So a kicking history may open kicking-specific questions
and keep RF in the differential, but it cannot, by itself, raise an RF probability, produce a
confidence number, or rank RF above the other anterior-thigh possibilities.

## 6. Why epidemiological mechanism data is not patient-level probability

v1.2 §8.3 states v1.2 "does not assign RF diagnostic probability weight from mechanism percentages,"
and that Santos (QRF-039) "remains abstract/metadata-only … and cannot drive diagnosis or
structural-location inference." Population-level mechanism frequencies describe a cohort, not the
individual in front of the system; treating "X% of RF injuries occur during kicking" as "this user
probably has an RF injury" is a base-rate error the spec prohibits. The object therefore tags
mechanism percentages as `evidence_record_only_reference_context_not_patient_level_probability`, keeps
QRF-039 reference-only, and blocks both
`assign_patient_level_probability_from_epidemiological_mechanism_data` and
`use_qrf_039_as_decision_driving_evidence` (mirroring v1.2 §17 case 11, where tagging QRF-039 as
decision-driving must fail the build).

## 7. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `diagnose_rf_strain_from_mechanism_alone`;
- `assign_diagnostic_weight_from_mechanism_alone`;
- `assign_numeric_confidence_from_mechanism`;
- `assign_patient_level_probability_from_epidemiological_mechanism_data`;
- `rank_rf_above_differentials_from_mechanism_alone`;
- `use_qrf_039_as_decision_driving_evidence`;
- `bypass_safety_because_mechanism_appears_typical`;
- `treat_typical_mechanism_as_safety_clearance`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`.

## 8. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-001 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 9. The completed safety block remains unchanged

RF-SAF-001 … RF-SAF-008 were **not** modified by this task. Their object files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety block
(`RF_SAFETY_BLOCK_RECONCILIATION_AUDIT.md`) still holds. RF-DX-001 preserves safety precedence
(`safety_precedence_preserved: true`) and blocks any attempt to treat a typical mechanism as safety
clearance.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 9` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-001 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
