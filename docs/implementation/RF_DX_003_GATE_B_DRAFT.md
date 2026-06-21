# RF-DX-003 — Gate B Draft Rule Object

The third pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-DX-003.json](../../lib/clinical/rf/rules/objects/RF-DX-003.json).

It implements the **structure** of RF v1.2 rule **RF-DX-003** — "audible pop or snap" (v1.2 §8.5) —
as an evidence-record / concern-signal rule. It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-DX-003's **evidence-record / concern-signal
structure**:

- provenance: `source_spec_rule_id: "RF-DX-003"`, `rule_family: "diagnosis"`, `source_section: "§8.5"`;
- `permitted_use: "evidence_record_only"`;
- `input_contract` — the concern signal from §8.5 (`audible_pop_or_snap`) with `signal_role`
  "record as history/concern feature and may activate follow-up questions only", listing the §8.5
  follow-up topics (immediate function, deformity, bruising, proximal pain, external assessment);
- `decision_contract` — record the concern signal and optionally activate follow-up questions;
  `signal_assigns_diagnostic_weight: false`; `absence_excludes_structural_injury: false`;
  `presence_proves_tear: false`; `does_not_diagnose_rf`; `does_not_determine_structural_grade`;
  `does_not_rank_rf_above_differentials_from_signal_alone`; `safety_precedence_preserved`;
  `signal_is_not_safety_clearance`; confidence objects deferred (structure only);
- `safety_state_output: null`, `blocked_targets: []` (a diagnosis concern-signal rule, not a safety
  rule);
- `prohibited_outputs` (see §7);
- `test_fixtures: []` (no §17 case maps to this non-specific concern signal).

## 2. What was NOT authored

- No diagnosis of RF injury, tear, avulsion, full-thickness injury, central tendon involvement, or
  structural grade from the signal; no diagnostic weight, numeric confidence, patient-level
  probability, or RF-over-differential ranking from the signal alone.
- No diagnostic confidence model — only a concern/history feature is preserved for the later
  confidence objects.
- No rehab authorization, complete rehab plan, or return-to-sport decision.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No weakening or bypassing of any safety rule.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-003 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001/002 were
  consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claim was preserved

Copied verbatim from v1.2 §8.5 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-003` (E1). The claim's individual grade is preserved in the object's
  `notes`; no combined or invented grade was created.

## 5. Why architecture references are intentionally empty

RF-DX-003 is a **clinical-content** rule. Per v1.2 §4.3, clinical-content rules **cite valid
`evidence_claim_ids`** and **do not** carry architecture references; the §8.5 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**. The validator's provenance invariant (at least one of `architecture_refs`
or `evidence_claim_ids` non-empty) — corrected when RF-DX-002 was authored — already supports this
shape, so **no further validator or schema change was needed** for RF-DX-003.

## 6. Why audible pop/snap is recorded as a concern/history signal but not diagnostic proof

§8.5 lets a pop or snap **activate questions** (about immediate function, deformity, bruising,
proximal pain, and external assessment) and be stored as a history/concern feature — it can prompt a
closer look, but it does not settle the diagnosis. The §8.5 prohibited use is explicit on both
directions: **absence does not exclude** structural injury (a silent injury can still be serious),
and **presence does not prove a tear** (a pop can accompany benign events). So the object records the
signal (`evidence_record_only`), encodes both `absence_excludes_structural_injury: false` and
`presence_proves_tear: false`, and blocks every attempt to turn the signal into a diagnosis, grade,
weight, confidence, probability, or differential ranking. (Any genuinely serious features the
follow-up questions surface are handled by the safety rules — e.g. RF-SAF-006 — not by this rule.)

## 7. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `diagnose_rf_injury_from_audible_pop_or_snap_alone`;
- `diagnose_tear_from_audible_pop_or_snap_alone`;
- `diagnose_avulsion_from_audible_pop_or_snap_alone`;
- `diagnose_full_thickness_injury_from_audible_pop_or_snap_alone`;
- `diagnose_central_tendon_involvement_from_audible_pop_or_snap_alone`;
- `assign_structural_grade_from_audible_pop_or_snap_alone`;
- `assign_diagnostic_weight_from_audible_pop_or_snap_alone`;
- `assign_numeric_confidence_from_audible_pop_or_snap`;
- `assign_patient_level_probability_from_audible_pop_or_snap`;
- `rank_rf_above_differentials_from_audible_pop_or_snap_alone`;
- `bypass_safety_because_symptom_appears_typical_or_concerning`;
- `treat_audible_pop_or_snap_as_safety_clearance`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`.

## 8. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-003 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 9. RF-SAF-001 … RF-SAF-008 and RF-DX-001 … RF-DX-002 remain unchanged

Those ten objects were **not** modified by this task. Their files are byte-for-byte identical before
and after (verified by checksum), so the reconciled safety block and the earlier diagnosis rules
still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 11` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-003 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
