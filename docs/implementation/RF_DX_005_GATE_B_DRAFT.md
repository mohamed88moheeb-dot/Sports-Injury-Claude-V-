# RF-DX-005 — Gate B Draft Rule Object

The fifth pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-DX-005.json](../../lib/clinical/rf/rules/objects/RF-DX-005.json).

It implements the **structure** of RF v1.2 rule **RF-DX-005** — "self-tests are supporting evidence
only" (v1.2 §8.7). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-DX-005's **supporting-evidence / uncertainty
structure**:

- provenance: `source_spec_rule_id: "RF-DX-005"`, `rule_family: "diagnosis"`, `source_section: "§8.7"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the §8.7 self-tests (active straight-leg raise, femoral nerve slump) with
  `self_test_role` "supporting evidence only", `preconditions` "only perform when pre-test safety
  screen is clear", a `result_states` set including `cannot_assess` / `pain_invalidated` / `incomplete`,
  and `reliability_model` applying the V3.1 §9 self-administration reliability model;
- `decision_contract` — `is_validated_rf_diagnostic_test: false`; `is_validated_rf_rule_out_test: false`;
  `positive_result_rules_in_rf: false`; `negative_result_rules_out_rf: false`;
  `cannot_assess_or_unsafe_or_incomplete_resolution: "remains_unresolved_never_positive_negative_or_clearance"`;
  `self_test_assigns_diagnostic_weight: false`; `does_not_diagnose_rf`;
  `does_not_rank_rf_above_differentials_from_self_test_alone`; `requires_clear_pre_test_safety_screen`;
  `does_not_proceed_while_safety_blocked`; `safety_precedence_preserved`;
  `self_test_is_not_safety_clearance`; confidence objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a diagnosis supporting-evidence rule, not a
  safety rule);
- `prohibited_outputs` (see §9);
- `test_fixtures: ["v1.2-§17-case-10"]`.

## 2. What was NOT authored

- No diagnosis of RF injury; no rule-in from a positive self-test; no rule-out / exclusion from a
  negative self-test; no diagnostic weight, numeric confidence, or patient-level probability from a
  self-test; no ranking of RF above differentials on a self-test alone.
- No conversion of `cannot_assess` / unsafe / incomplete results into positive, negative, or clearance.
- No diagnostic confidence model — only self-test supporting evidence is preserved for the later
  confidence objects.
- No rehab authorization, complete rehab plan, or return-to-sport decision.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No weakening or bypassing of any safety rule, and no self-test while safety is blocked.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-005 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001 …
  RF-DX-004 were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §8.7 / the inventory — none invented:

- `architecture_refs`: `V3.1-9` (the self-test capability & reliability model).
- `evidence_claim_ids`: `QRF-004` (I1), `QRF-005` (I1). The individual grades (both I1 — insufficient /
  operationally unresolved) are preserved in the object's `notes`; no combined or invented grade was
  created.

## 5. Why self-tests are supporting evidence only

§8.7 states ASLR and femoral nerve slump "may describe function or activate a neural differential but
are **not validated RF diagnostic or rule-out tests**," and both supporting claims are graded **I1**
(insufficient / unresolved). A guided self-test performed alone is lower-fidelity than a clinician-
administered one (V3.1 §9). So the object records self-tests as `supporting_evidence_only` and applies
the self-administration reliability model — they can *colour* the picture and open a neural
differential, but they do not settle identity.

## 6. Why a positive self-test does not prove RF injury

Reproduced symptoms on a self-test are non-specific: other anterior-thigh or neural sources can
provoke the same response, and self-administration adds execution noise. V3.1 §9.2 is explicit that "a
painful test is not automatically a positive result" and "unclear execution is not high-confidence
evidence." The object therefore sets `positive_result_rules_in_rf: false` and blocks
`rule_in_rf_injury_from_positive_self_test_result_alone`.

## 7. Why a negative self-test does not exclude RF injury

These tests are not validated rule-outs, and a not-performed or pain-free attempt carries no
exclusionary power (V3.1 §9.2: "a not-performed test is not a negative result"). The object sets
`is_validated_rf_rule_out_test: false` and `negative_result_rules_out_rf: false`, and blocks
`exclude_rf_injury_from_negative_self_test_result_alone` /
`rule_out_rf_injury_from_negative_self_test_result_alone`.

## 8. Why `cannot_assess`, unsafe, or incomplete tests must not become positive, negative, or clearance

§8.7 keeps pain-invalidated and `cannot_assess` results **unresolved**; V3.1 §9.2 forbids coercing a
failed/not-performed/unclear test into a result. Treating an unfinished or unsafe test as "all clear"
would manufacture reassurance the evidence does not support. The object encodes
`cannot_assess_or_unsafe_or_incomplete_resolution: "remains_unresolved_never_positive_negative_or_clearance"`
and blocks `treat_cannot_assess_as_positive`, `treat_cannot_assess_as_negative`, and
`treat_unsafe_or_incomplete_self_test_as_clearance`. (This mirrors RF-SAF-005's `cannot_assess`
handling.) Self-tests also require a clear pre-test safety screen and must not proceed while safety is
blocked.

## 9. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `diagnose_rf_injury_from_self_test_result_alone`;
- `exclude_rf_injury_from_negative_self_test_result_alone`;
- `rule_in_rf_injury_from_positive_self_test_result_alone`;
- `rule_out_rf_injury_from_negative_self_test_result_alone`;
- `treat_cannot_assess_as_positive`;
- `treat_cannot_assess_as_negative`;
- `treat_unsafe_or_incomplete_self_test_as_clearance`;
- `assign_diagnostic_weight_from_self_test_alone`;
- `assign_numeric_confidence_from_self_test_result`;
- `assign_patient_level_probability_from_self_test_result`;
- `rank_rf_above_differentials_from_self_test_alone`;
- `bypass_safety_because_self_test_appears_reassuring`;
- `perform_self_test_while_safety_is_blocked`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`.

## 10. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-005 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 11. RF-SAF-001 … RF-SAF-008 and RF-DX-001 … RF-DX-004 remain unchanged

Those twelve objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block and the earlier diagnosis
rules still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 13` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-005 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
