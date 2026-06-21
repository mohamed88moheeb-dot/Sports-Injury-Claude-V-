# RF-DX-004 — Gate B Draft Rule Object

The fourth pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-DX-004.json](../../lib/clinical/rf/rules/objects/RF-DX-004.json).

It implements the **structure** of RF v1.2 rule **RF-DX-004** — "direct versus indirect mechanism
branching" (v1.2 §8.6). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-DX-004's **intake-branching / differential-routing
structure**:

- provenance: `source_spec_rule_id: "RF-DX-004"`, `rule_family: "diagnosis"`, `source_section: "§8.6"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract.mechanism_branches` — `direct` (direct blow → contusion-context questions +
  complication routing, `defers_to: RF-SAF-007`); `indirect` (high-speed running / kicking /
  acceleration / other loading → RF-relevant muscle-tendon strain questions + relevant differentials);
  `mixed` (retain both branches until evidence resolves them); plus the §8.6 `no_branch_behavior`
  (restrict output rather than force one diagnosis);
- `decision_contract` — `mechanism_assigns_diagnostic_weight: false`;
  `direct_mechanism_defers_to_rf_saf_007: true`; `does_not_force_direct_blow_into_rf_strain_logic`;
  `indirect_mechanism_retains_muscle_tendon_injury_in_differential`;
  `mixed_mechanism_keeps_relevant_differentials_open`;
  `qrf_001_and_qrf_039_role: "non_weighting_mechanism_context_only"`;
  `qrf_039_santos_role: "abstract_metadata_only_reference_only_not_decision_driving"`;
  `does_not_diagnose_contusion`/`does_not_diagnose_rf_strain`/`does_not_create_contusion_module`;
  `does_not_override_rf_saf_007`; `safety_precedence_preserved`; `mechanism_is_not_safety_clearance`;
  confidence objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a diagnosis branching rule, not a safety rule);
- `prohibited_outputs` (see §8);
- `test_fixtures: ["v1.2-§17-case-1"]`.

## 2. What was NOT authored

- No diagnosis of contusion or RF strain; no diagnostic weight, numeric confidence, or patient-level
  probability from mechanism; no ranking of RF above differentials on mechanism alone.
- No contusion module; no override of RF-SAF-007 direct-contusion routing.
- No diagnostic confidence model — only branching structure is preserved for the later confidence
  objects.
- No rehab authorization, complete rehab plan, or return-to-sport decision.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No weakening or bypassing of any safety rule.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-004 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001/002/003
  were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §8.6 / the inventory — none invented:

- `architecture_refs`: `V3.1-4`, `V3.1-5`, `V3.1-15.1`.
- `evidence_claim_ids`: `QRF-015` (D2), `QRF-001` (M1), `QRF-039` (D3). Roles and grades are preserved
  in the object's `notes` and `decision_contract` (see §7); no combined or invented grade was created.

## 5. How direct-versus-indirect mechanism branches the intake without diagnosing

§8.6's job is **routing**, not verdicts. A direct blow steers the intake toward contusion / complication
questions and routing; an indirect loading mechanism (sprinting, kicking, acceleration, …) keeps the
RF muscle-tendon injury *in the differential* and opens RF-relevant questions; a mixed mechanism keeps
both branches open until other evidence resolves them. The object encodes each branch's *activation*
but sets `mechanism_assigns_diagnostic_weight: false`, so a branch decides which questions to ask —
never which diagnosis is true. If the alternate module a branch needs is unavailable, §8.6 says
restrict output rather than force one diagnosis (`no_branch_behavior`).

## 6. Why direct-blow presentations must not be forced into RF strain logic

A direct blow is a different injury class (contusion / "dead leg") with its own complication screen,
governed by RF-SAF-007. Forcing it into the RF strain pathway would apply the wrong assessment and
could miss contusion-specific complications. So the direct branch `defers_to: RF-SAF-007`, and the
object sets `does_not_force_direct_blow_into_rf_strain_logic`, `does_not_override_rf_saf_007`, and
blocks `force_direct_blow_mechanism_into_rf_strain_logic` and
`bypass_rf_saf_007_direct_contusion_routing`. RF-DX-004 routes; RF-SAF-007 governs the contusion
disposition.

## 7. Why QRF-001 and QRF-039 remain mechanism context only, not diagnostic weighting

§8.6 retains QRF-001 and QRF-039 explicitly as **non-weighting mechanism context**, and the wider RF
v1.2 policy keeps Santos (QRF-039) abstract/metadata-only and reference-only (it cannot drive
diagnosis or structural-location inference — see RF-DX-001 §8.3 and §17 case 11). Population-level
mechanism associations describe cohorts, not the individual, so converting them to patient-level
probability is a base-rate error the spec prohibits. The object therefore tags both claims
`non_weighting_mechanism_context_only`, keeps QRF-039 reference-only, and blocks
`assign_patient_level_probability_from_epidemiological_mechanism_data` and
`use_qrf_039_as_decision_driving_evidence`. QRF-015 (D2) supports the direct-mechanism / contusion-
context branching as allowed by v1.2 — it informs *routing*, not an RF diagnosis.

## 8. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `force_direct_blow_mechanism_into_rf_strain_logic`;
- `diagnose_contusion_from_direct_mechanism_alone`;
- `diagnose_rf_strain_from_indirect_mechanism_alone`;
- `diagnose_rf_strain_from_mechanism_alone`;
- `assign_diagnostic_weight_from_direct_mechanism_alone`;
- `assign_diagnostic_weight_from_indirect_mechanism_alone`;
- `assign_numeric_confidence_from_mechanism`;
- `assign_patient_level_probability_from_epidemiological_mechanism_data`;
- `rank_rf_above_differentials_from_mechanism_alone`;
- `use_qrf_039_as_decision_driving_evidence`;
- `create_a_contusion_module`;
- `bypass_rf_saf_007_direct_contusion_routing`;
- `bypass_safety_because_mechanism_appears_typical`;
- `treat_mechanism_as_safety_clearance`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`.

## 9. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-004 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 10. RF-SAF-001 … RF-SAF-008 and RF-DX-001 … RF-DX-003 remain unchanged

Those eleven objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block and the earlier diagnosis
rules still hold. In particular, RF-DX-004 explicitly defers to and does not override RF-SAF-007.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 12` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-004 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
