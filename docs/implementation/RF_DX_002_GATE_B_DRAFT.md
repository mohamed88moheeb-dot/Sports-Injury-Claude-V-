# RF-DX-002 — Gate B Draft Rule Object

The second pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-DX-002.json](../../lib/clinical/rf/rules/objects/RF-DX-002.json).

It implements the **structure** of RF v1.2 rule **RF-DX-002** — "sudden stabbing pain" (v1.2 §8.4) —
as an evidence-record / history-feature rule. It is a draft only, and the **first clinical-content-only
rule** in the package (no architecture references).

## 1. What was authored

A single machine-readable rule object expressing RF-DX-002's **evidence-record / history-feature
structure**:

- provenance: `source_spec_rule_id: "RF-DX-002"`, `rule_family: "diagnosis"`, `source_section: "§8.4"`;
- `permitted_use: "evidence_record_only"`;
- `input_contract` — the symptom-history feature from §8.4 (`sudden_localized_stabbing_pain`) with
  `feature_role: "record_as_non_specific_history_feature_only"`;
- `decision_contract` — record the history feature; `feature_assigns_diagnostic_weight: false`;
  `feature_distinguishes_rf_from_other_anterior_thigh_conditions: false`;
  `feature_determines_structural_grade: false`; `does_not_diagnose_rf`;
  `does_not_rank_rf_above_differentials_from_symptom_alone`; `safety_precedence_preserved`;
  `symptom_is_not_safety_clearance`; confidence objects deferred (structure only);
- `safety_state_output: null`, `blocked_targets: []` (a diagnosis history rule, not a safety rule);
- `prohibited_outputs` (see §7);
- `test_fixtures: []` (no §17 case maps to this non-specific history feature).

## 2. What was NOT authored

- No diagnosis, diagnostic weight, numeric confidence, or patient-level probability from the symptom;
  no ranking of RF above differentials on the symptom alone.
- No diagnostic confidence model — only a history feature is preserved for the later confidence
  objects.
- No rehab authorization, complete rehab plan, or return-to-sport decision.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No weakening or bypassing of any safety rule.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-002 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001 were
  consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claim was preserved

Copied verbatim from v1.2 §8.4 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-002` (C1). The claim's individual grade is preserved in the object's
  `notes`; no combined or invented grade was created.

## 5. Why architecture references are intentionally empty

RF-DX-002 is a **clinical-content** rule (normative source `clinical_content`). Per v1.2 §4.3,
clinical-content rules **cite valid `evidence_claim_ids`** and **do not** carry architecture
references; the §8.4 source lists none. `architecture_refs: []` therefore means "none in source," not
"missing," and **no architecture references were invented**.

> Tooling note: the rule validator and schema previously assumed every rule carries at least one
> architecture reference — true for the eight safety rules and RF-DX-001 (architecture / mixed
> source), but not for a clinical-content rule. That was an objective structural gap. The validator
> and schema were corrected to enforce the actual v1.2 §4.3 invariant: **provenance is satisfied when
> at least one of `architecture_refs` or `evidence_claim_ids` is non-empty.** All ten objects
> (including the eight safety rules and RF-DX-001) still pass unchanged. No clinical content was added
> and no runtime app behavior changed.

## 6. Why sudden stabbing pain is recorded as history but not diagnostic proof

§8.4 permits recording a sudden localized stabbing pain as a **non-specific history feature** — it
adds colour to the episode record but cannot, by itself, tell an RF strain apart from any other
anterior-thigh condition, nor set a structural grade (the §8.4 prohibited use). Many anterior-thigh
problems can present with a sudden sharp pain, so the symptom has low discriminating value alone. The
object stores the feature (`evidence_record_only`) and blocks every attempt to turn it into a
diagnosis, weight, confidence, probability, or differential ranking.

## 7. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `diagnose_rf_injury_from_sudden_stabbing_pain_alone`;
- `assign_diagnostic_weight_from_sudden_stabbing_pain_alone`;
- `assign_numeric_confidence_from_sudden_stabbing_pain`;
- `assign_patient_level_probability_from_sudden_stabbing_pain`;
- `rank_rf_above_differentials_from_sudden_stabbing_pain_alone`;
- `bypass_safety_because_symptom_appears_typical`;
- `treat_sudden_stabbing_pain_as_safety_clearance`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`.

## 8. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-002 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 9. The completed safety block and RF-DX-001 remain unchanged

RF-SAF-001 … RF-SAF-008 and RF-DX-001 were **not** modified by this task. Their object files are
byte-for-byte identical before and after (verified by checksum), so the reconciled safety block and
RF-DX-001 still hold. (The validator/schema correction in §5 is tooling, not a rule-object change.)

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 10` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-002 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
