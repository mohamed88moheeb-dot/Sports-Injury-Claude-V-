# RF-DX-007 — Gate B Draft Rule Object

The seventh pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-DX-007.json](../../lib/clinical/rf/rules/objects/RF-DX-007.json).

It implements the **structure** of RF v1.2 rule **RF-DX-007** — "strong diagnosis anchor" (v1.2 §8.9).
It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-DX-007's **strong-diagnosis-anchor handling
structure**:

- provenance: `source_spec_rule_id: "RF-DX-007"`, `rule_family: "diagnosis"`, `source_section: "§8.9"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the four §8.9 `strong_anchor_conditions` (current-episode matched, anatomically
  specific, sufficiently authoritative, internally coherent), `anchor_source` = externally supplied
  diagnosis anchor (not raw media), `raw_media_handling` = raw/uploaded scan images are not a
  diagnosis anchor (RF-DX-006 handles report descriptors);
- `decision_contract` — `reduces_only: "redundant_injury_identity_questions"`; a `never_bypasses`
  list (safety, current symptoms, external restrictions, capacity, contraindications, stage,
  concurrent injuries, readiness); `authorizes_rehab: false`; `produces_complete_rehab_plan: false`;
  `grants_return_to_sport_clearance: false`; `assigns_confidence_or_probability_from_anchor: false`;
  `silences_uncertainty: false`;
  `silently_overrides_conflicting_current_information: false`;
  `conflict_handling: "preserve_conflict_unresolved_for_rf_dx_008"`;
  `interprets_raw_imaging_as_anchor: false`; `defers_to_rf_dx_006_for_report_descriptors: true`;
  `defers_to_rf_saf_006_on_serious_structural_or_restriction_anchor: true`;
  `does_not_bypass_rf_saf_006`; `safety_precedence_preserved`; `anchor_is_not_safety_clearance`;
  confidence objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a diagnosis anchor-handling rule, not a safety
  rule);
- `prohibited_outputs` (see §10);
- `test_fixtures: ["v1.2-§17-case-6"]`.

## 2. What was NOT authored

- No bypass of safety, current symptoms, external restrictions, capacity, contraindications, stage,
  concurrent injuries, or readiness on the basis of an anchor.
- No rehab authorization, complete rehab plan, or return-to-sport decision from the anchor; no numeric
  confidence or patient-level probability from the anchor; no silencing of uncertainty; no silent
  override of conflicting current information.
- No raw-imaging interpretation as an anchor (RF-DX-006 governs report descriptors).
- No diagnostic confidence model — only anchor-handling structure is preserved for the later
  confidence objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No invented evidence claim IDs (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-007 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001 …
  RF-DX-006 were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references were preserved

Copied verbatim from v1.2 §8.9 / the inventory — none invented:

- `architecture_refs`: `V3.1-6` (diagnosis anchor quality model), `V3.1-10` (known-diagnosis
  pathway), `V3.1-22` (wire cross-object invariants).

## 5. Why evidence claim IDs are intentionally empty

RF-DX-007 is an **architecture-source** rule — it governs how a supplied diagnosis anchor is handled,
not an RF-specific clinical claim. Per v1.2 §4.3, architecture rules cite `architecture_refs` and
**must not invent** clinical evidence claims. Accordingly, `evidence_claim_ids` is intentionally `[]`
— "none required," not "missing." No QRF IDs were fabricated.

## 6. How a strong diagnosis anchor can reduce identity questions only

§8.9 permits reducing diagnostic **identity** questions only when an anchor is current-episode
matched, anatomically specific, sufficiently authoritative, and internally coherent (V3.1 §6.1 / §10.1).
A qualifying anchor spares the athlete redundant "what/where is the injury" questioning — and nothing
more. The object encodes `reduces_only: "redundant_injury_identity_questions"`, so the anchor settles
*identity only*; a weak or vague anchor reduces nothing.

## 7. Why a diagnosis anchor does not authorize rehab or return-to-sport

Knowing the injury identity says nothing about whether it is safe to load, what the current capacity
is, which stage applies, or whether the athlete is ready to return — those are separate objects
(V3.1 §8: the Rehab Engine consumes safety/stage confidence, not diagnosis confidence). So the object
sets `authorizes_rehab: false`, `produces_complete_rehab_plan: false`, and
`grants_return_to_sport_clearance: false`, and blocks each as a `…_from_diagnosis_anchor_alone` output.

## 8. Why safety, restrictions, capacity, stage, and readiness still run

§8.9's "never bypasses" list is explicit (V3.1 §10.3): even a strong, specific, current anchor never
bypasses Safety Screens, severity, stage, current-capacity, contraindication checks, or readiness. A
clear MRI label can coexist with unknown current function. The object carries the full `never_bypasses`
array and blocks each bypass individually; serious structural/restriction anchors additionally defer
to RF-SAF-006.

## 9. How conflicts are preserved for RF-DX-008 rather than silently resolved

If a strong anchor conflicts with the current presentation, RF-DX-007 must **not** silently override
the current evidence; that conflict belongs to RF-DX-008 (anchor conflict → `external_reassessment`,
rehab block, matching referral; V3.1 §6.3 / §22). The object sets
`silently_overrides_conflicting_current_information: false` and
`conflict_handling: "preserve_conflict_unresolved_for_rf_dx_008"`, and blocks
`silently_override_conflicting_current_information`.

## 10. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `treat_diagnosis_anchor_as_safety_clearance`;
- `bypass_safety_because_a_strong_diagnosis_anchor_exists`;
- `bypass_current_symptom_review_because_a_strong_diagnosis_anchor_exists`;
- `bypass_external_restriction_review_because_a_strong_diagnosis_anchor_exists`;
- `bypass_capacity_assessment_because_a_strong_diagnosis_anchor_exists`;
- `bypass_stage_or_readiness_gates_because_a_strong_diagnosis_anchor_exists`;
- `authorize_rehab_from_diagnosis_anchor_alone`;
- `produce_a_complete_rehab_plan_from_diagnosis_anchor_alone`;
- `produce_a_return_to_sport_decision_from_diagnosis_anchor_alone`;
- `assign_numeric_confidence_from_diagnosis_anchor_alone`;
- `assign_patient_level_probability_from_diagnosis_anchor_alone`;
- `treat_the_anchor_as_resolving_all_uncertainty`;
- `silently_override_conflicting_current_information`;
- `interpret_raw_imaging_as_a_diagnosis_anchor`;
- `bypass_rf_dx_006_report_descriptor_handling`;
- `bypass_rf_saf_006_when_serious_structural_or_restriction_descriptors_present`.

## 11. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-007 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 12. RF-SAF-001 … RF-SAF-008 and RF-DX-001 … RF-DX-006 remain unchanged

Those fourteen objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block and the earlier diagnosis
rules still hold. RF-DX-007 explicitly defers to RF-DX-006 (report descriptors) and RF-SAF-006
(serious structural/restriction concern), and leaves anchor/presentation conflicts to RF-DX-008.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 15` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-007 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
