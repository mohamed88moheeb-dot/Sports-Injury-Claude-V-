# RF-DX-008 — Gate B Draft Rule Object

The eighth and **final** pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object
has been authored: [lib/clinical/rf/rules/objects/RF-DX-008.json](../../lib/clinical/rf/rules/objects/RF-DX-008.json).

It implements the **structure** of RF v1.2 rule **RF-DX-008** — "anchor conflict" (v1.2 §8.10). It is
a draft only. With this, the diagnosis block (RF-DX-001 … RF-DX-008) is complete.

## 1. What was authored

A single machine-readable rule object expressing RF-DX-008's **strong-anchor conflict handling
structure**:

- provenance: `source_spec_rule_id: "RF-DX-008"`, `rule_family: "diagnosis"`, `source_section: "§8.10"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the §8.10 trigger (`strong_documented_anchor_materially_conflicts_with_current_presentation`),
  `anchor_source` = strong documented external anchor (not raw media), `raw_media_handling` =
  raw/uploaded scan images are not a diagnosis anchor (RF-DX-006 handles report descriptors);
- `decision_contract` — preserve both anchor and current evidence; `set_external_reassessment: true`;
  `block_rehabilitation_while_conflict_unresolved: true`; `explain_discrepancy: true`;
  `create_required_referral_object: true`; `silent_replacement_prohibited: true`; plus a set of
  `false` negation flags for every silent-override / auto-replace / auto-resolve behavior, rehab/plan/
  RTS-while-unresolved, confidence/probability, and raw-imaging interpretation;
  `defers_to_rf_dx_006_for_report_descriptors`, `defers_to_rf_saf_006_on_serious_structural_or_restriction_concern`,
  `does_not_bypass_rf_saf_006`, `does_not_bypass_safety`, `safety_precedence_preserved`; confidence
  objects deferred;
- `safety_state_output: "REHAB_BLOCKED"`, `blocked_targets: ["rehab"]` (see §12);
- `prohibited_outputs` (see §13);
- `test_fixtures: ["v1.2-§17-case-7"]`.

## 2. What was NOT authored

- No silent resolution of the conflict; no automatic replacement of the external diagnosis with a
  model diagnosis; no silent override of current symptoms, safety signals, external restrictions, or
  capacity findings.
- No rehab authorization, complete rehab plan, or return-to-sport decision while the conflict is
  unresolved; no numeric confidence or patient-level probability from the conflict.
- No raw-imaging interpretation as an anchor (RF-DX-006 governs report descriptors).
- No diagnostic confidence model — only conflict-handling structure is preserved for the later
  confidence objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No invented evidence claim IDs (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-008 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001 …
  RF-DX-007 were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references were preserved

Copied verbatim from v1.2 §8.10 / the inventory — none invented:

- `architecture_refs`: `V3.1-6.3` (reconciliation / removal of silent override), `V3.1-20`
  (referral-resolution lifecycle), `V3.1-22` (wire cross-object invariants).

## 5. Why evidence claim IDs are intentionally empty

RF-DX-008 is an **architecture-source** rule — it governs how an anchor/presentation conflict is
handled, not an RF-specific clinical claim. Per v1.2 §4.3, architecture rules cite `architecture_refs`
and **must not invent** clinical evidence claims. Accordingly, `evidence_claim_ids` is intentionally
`[]` — "none required," not "missing." No QRF IDs were fabricated.

## 6. What counts as an anchor-presentation conflict according to the source

§8.10's trigger is precise: **a strong documented anchor materially conflicts with the current
presentation.** Two conditions matter — the anchor must be *strong and documented* (a vague or weak
label is not an anchor; see RF-DX-007 / V3.1 §10.2), and the conflict must be *material* (a
substantive disagreement between what the documented diagnosis says and what the current symptoms /
findings show), not a trivial wording difference.

## 7. Why the platform must not silently resolve the conflict

§8.10 ends with "Silent replacement is prohibited," and V3.1 §6.3 explicitly removes silent override.
A material disagreement between a documented diagnosis and the live presentation is exactly the
situation a human clinician must adjudicate; resolving it invisibly (either direction) would hide a
potentially important discrepancy. The object therefore sets `silently_resolves_conflict: false` and
`silent_replacement_prohibited: true`, preserves *both* the anchor and the current evidence, and
routes an external reassessment with a matching referral.

## 8. Why the platform must not automatically replace the external diagnosis with a model diagnosis

The model is not authorized to overrule a documented external diagnosis, and a documented anchor is
not authorized to overrule live safety/symptom evidence — both directions of silent override are
prohibited (V3.1 §6.3, §22). So the object sets `replaces_external_diagnosis_with_model_diagnosis:
false` and the four `overrides_*_with_anchor: false` flags, and blocks the corresponding
`silently_replace_external_diagnosis_with_model_diagnosis` and `silently_override_*` outputs. The
conflict is escalated, not arbitrated by the engine.

## 9. Why unresolved conflict must not authorize rehab, a complete plan, or RTS

While a material conflict is open, the platform does not actually know which clinical picture is
correct, so it cannot safely load tissue or clear performance. §8.10 requires blocking rehabilitation
until external reassessment resolves the discrepancy (V3.1 §22: a strong-anchor/presentation conflict
requires `external_reassessment`, a matching referral, and a rehabilitation block; a terminal/blocking
safety state cannot coexist with a full plan). The object sets the three
`*_while_conflict_unresolved: false` flags and blocks the matching `…_while_anchor_conflict_unresolved`
outputs.

## 10. How RF-DX-008 relates to RF-DX-006 and RF-DX-007

- **RF-DX-006** owns report-descriptor handling and prohibits raw-imaging interpretation. RF-DX-008
  carries the same constraint (`interprets_raw_imaging_as_anchor: false`,
  `defers_to_rf_dx_006_for_report_descriptors: true`) and blocks
  `bypass_rf_dx_006_report_descriptor_handling`.
- **RF-DX-007** reduces redundant identity questions when an anchor is strong and *coherent*, and
  explicitly preserves any anchor/presentation conflict "unresolved for RF-DX-008." RF-DX-008 is the
  rule that receives that conflict and decides the response (preserve both, external reassessment,
  rehab block, referral). Together they cover the coherent-anchor and conflicting-anchor cases.

## 11. How RF-DX-008 relates to RF-SAF-006 and the safety block

RF-DX-008 does not weaken the safety block. If the anchor or current presentation raises avulsion,
full-thickness, postoperative, major-retraction, or external-restriction concern, that is governed by
**RF-SAF-006**; the object sets `defers_to_rf_saf_006_on_serious_structural_or_restriction_concern:
true`, `does_not_bypass_rf_saf_006: true`, and `does_not_bypass_safety: true`, and blocks
`bypass_rf_saf_006_when_serious_structural_or_restriction_descriptors_present` and
`bypass_safety_because_an_external_diagnosis_exists`. Safety precedence is preserved.

## 12. `safety_state_output` and `blocked_targets`, and why this follows §8.10 exactly

Reading §8.10 exactly: the decision explicitly instructs to **"block rehabilitation."** That maps to
the closed V3.1 §21 safety state **`REHAB_BLOCKED`**, whose required blocked target is `rehab`.
Therefore `safety_state_output: "REHAB_BLOCKED"` and `blocked_targets: ["rehab"]` — consistent with
how RF-SAF-006 encodes a rehab block, and with the V3.1 §22 invariant for anchor conflicts. The other
element §8.10 names, `external_reassessment`, is a **referral-resolution disposition** (V3.1 §20),
**not** one of the eight closed safety states, so it is represented inside `decision_contract`
(`set_external_reassessment`, `create_required_referral_object`) rather than as the
`safety_state_output`. No safety state was inferred by analogy; the explicit "block rehabilitation"
instruction drove the choice.

## 13. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `silently_resolve_anchor_presentation_conflict`;
- `silently_replace_external_diagnosis_with_model_diagnosis`;
- `silently_override_current_symptoms_with_diagnosis_anchor`;
- `silently_override_safety_signals_with_diagnosis_anchor`;
- `silently_override_external_restrictions_with_diagnosis_anchor`;
- `silently_override_capacity_findings_with_diagnosis_anchor`;
- `treat_conflict_as_resolved_by_the_model`;
- `treat_reassuring_anchor_as_safety_clearance`;
- `treat_worrying_anchor_as_diagnosis_beyond_explicit_source_wording`;
- `authorize_rehab_while_anchor_conflict_unresolved`;
- `produce_a_complete_rehab_plan_while_anchor_conflict_unresolved`;
- `produce_a_return_to_sport_decision_while_anchor_conflict_unresolved`;
- `assign_numeric_confidence_from_anchor_conflict`;
- `assign_patient_level_probability_from_anchor_conflict`;
- `interpret_raw_imaging_as_an_anchor`;
- `bypass_rf_dx_006_report_descriptor_handling`;
- `bypass_rf_saf_006_when_serious_structural_or_restriction_descriptors_present`;
- `bypass_safety_because_an_external_diagnosis_exists`.

## 14. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-008 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 15. RF-SAF-001 … RF-SAF-008 and RF-DX-001 … RF-DX-007 objects remain unchanged

Those fifteen rule objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block and the earlier diagnosis
rules still hold.

## 16. RF-DX-007 documentation wording correction (object unchanged)

A pre-authoring consistency check found that `docs/implementation/RF_DX_007_GATE_B_DRAFT.md` still
described the old `decision_contract` keys `assigns_numeric_confidence: false` and
`assigns_patient_level_probability: false`, whereas the RF-DX-007 **object** uses the merged key
`assigns_confidence_or_probability_from_anchor: false` (renamed earlier to avoid a false-positive in
the validator's prohibited-key scan). The RF-DX-007 **documentation wording was corrected** to match
the object. The **RF-DX-007 object was not modified** (verified by checksum); only its Markdown
description changed.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 16` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-008 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
