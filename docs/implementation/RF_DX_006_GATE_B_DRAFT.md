# RF-DX-006 — Gate B Draft Rule Object

The sixth pending, non-executable Gate B Rectus Femoris (RF) **diagnosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-DX-006.json](../../lib/clinical/rf/rules/objects/RF-DX-006.json).

It implements the **structure** of RF v1.2 rule **RF-DX-006** — "imaging and report descriptor
handling" (v1.2 §8.8). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-DX-006's **report-descriptor handling structure**:

- provenance: `source_spec_rule_id: "RF-DX-006"`, `rule_family: "diagnosis"`, `source_section: "§8.8"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — `permitted_input` is externally reported **text** descriptors only (report /
  clinician / radiology); `permitted_descriptor_contributions_according_to_anchor_quality` =
  exact anatomy, classification, tendon involvement; `raw_media_handling` = not interpreted here,
  requires a separately validated imaging subsystem; `qrf_006_scope` = bull's-eye descriptor only when
  specifically relevant; `unclear_or_unsupported_report_handling` = preserve uncertainty;
- `decision_contract` — `interprets_raw_media: false`;
  `descriptor_is_standalone_diagnosis_grade_or_prognosis: false`;
  `generalizes_specific_descriptor_beyond_source_scope: false`;
  `bamic_ontology_is_authority_for_media_source_handling: false`;
  report wording does not grant diagnosis/rehab/RTS clearance; `infers_beyond_explicit_report_and_v12_permission: false`;
  `preserves_uncertainty_when_report_unclear_or_unsupported: true`;
  `defers_to_rf_saf_006_on_serious_structural_or_restriction_descriptors: true`;
  `does_not_bypass_rf_saf_006`; `safety_precedence_preserved`; `report_is_not_safety_clearance`;
  confidence objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a diagnosis report-handling rule, not a safety
  rule);
- `prohibited_outputs` (see §10);
- `test_fixtures: ["v1.2-§17-case-6"]`.

## 2. What was NOT authored

- No raw-media interpretation; no diagnosis, grade, tendon involvement, avulsion, full-thickness
  injury, or prognosis from imaging; no numeric confidence or patient-level probability from a
  descriptor.
- No unrestricted diagnosis clearance, rehab authorization, or return-to-sport clearance from report
  wording.
- No generalization of a specific descriptor (e.g. bull's-eye) beyond its permitted source scope.
- No diagnostic confidence model — only report-descriptor structure is preserved for the later
  confidence objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No weakening or bypassing of any safety rule (including RF-SAF-006).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-DX-006 was authored. (RF-SAF-001 … RF-SAF-008 and RF-DX-001 …
  RF-DX-005 were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claim were preserved

Copied verbatim from v1.2 §8.8 / the inventory — none invented:

- `architecture_refs`: `V3.1-6` (diagnosis anchor quality), `V3.1-14.1` (media states), `V3.1-25`
  (media-state hardening).
- `evidence_claim_ids`: `QRF-006` (E1), used **only** when the bull's-eye descriptor is specifically
  relevant. The grade is preserved in the object's `notes`; no combined or invented grade was created.

## 5. How externally reported imaging/report descriptors may be handled

§8.8 allows report **text** — from a report, clinician, or radiology source — to contribute exact
anatomy, classification, and tendon involvement, **according to anchor quality** (V3.1 §6). So a
radiology report stating, e.g., a specific RF location and tendon involvement can populate the
structural fields *as reported*, weighted by how strong/specific/current the anchor is (the anchor
model governs how much it settles). The object captures this as
`permitted_descriptor_contributions_according_to_anchor_quality` and records it without upgrading it
beyond what the report says.

## 6. Why raw imaging interpretation is prohibited

§8.8 is explicit: "Raw user-uploaded images cannot be interpreted by the language model and require a
separately validated imaging subsystem," and V3.1 §25 hardens this — the conversational model never
interprets raw images or videos. So the object sets `interprets_raw_media: false` and blocks
interpretation of raw MRI, ultrasound, image files, screenshots, DICOM, photos, and videos, plus any
diagnosis/grade/tendon/avulsion/full-thickness/prognosis derived from raw imaging. Raw media must flow
through a typed, separately validated media state — not this rule.

## 7. Why specific descriptors must not be generalized beyond source scope

QRF-006 is admissible **only** when the bull's-eye descriptor is specifically relevant, and §8.8's
prohibited use states a bull's-eye descriptor "is not a stand-alone diagnosis, grade, or prognosis
rule," and that "BAMIC ontology evidence is not authority for media-source handling." Treating one
narrow descriptor as broad imaging-diagnosis authority would exceed the evidence. The object encodes
`generalizes_specific_descriptor_beyond_source_scope: false` and
`bamic_ontology_is_authority_for_media_source_handling: false`, and blocks
`generalize_specific_descriptor_beyond_permitted_source_scope`.

## 8. Why report descriptors do not authorize rehab or return-to-sport

A descriptor settles (at most) part of structural identity, weighted by anchor quality — it says
nothing about current safety, capacity, stage, or readiness, which the architecture keeps as separate
objects (V3.1 §6.2, §8). So the object sets `report_wording_authorizes_rehab: false`,
`report_wording_grants_return_to_sport_clearance: false`, and
`report_wording_grants_unrestricted_diagnosis_clearance: false`, and blocks rehab clearance, complete
plan, and RTS outputs.

## 9. How uncertainty is preserved for unclear, partial, contradictory, or unsupported report language

When report language is unclear, partial, contradictory, user-entered without a source, or otherwise
unsupported, the object preserves uncertainty rather than guessing
(`unclear_or_unsupported_report_handling: preserve_uncertainty…`,
`preserves_uncertainty_when_report_unclear_or_unsupported: true`), and blocks treating unclear or
user-entered unsupported report language as a confirmed diagnosis. (A conflicting strong anchor is
escalated by RF-DX-008; serious structural/restriction descriptors defer to RF-SAF-006.)

## 10. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `interpret_raw_mri_images`;
- `interpret_raw_ultrasound_images`;
- `interpret_image_files_screenshots_dicom_photos_or_videos`;
- `diagnose_rf_injury_from_raw_imaging`;
- `diagnose_structural_grade_from_raw_imaging`;
- `diagnose_tendon_involvement_from_raw_imaging`;
- `diagnose_avulsion_from_raw_imaging`;
- `diagnose_full_thickness_injury_from_raw_imaging`;
- `infer_prognosis_from_raw_imaging`;
- `generalize_specific_descriptor_beyond_permitted_source_scope`;
- `treat_unclear_report_language_as_confirmed_diagnosis`;
- `treat_user_entered_unsupported_report_language_as_confirmed_diagnosis`;
- `assign_numeric_confidence_from_imaging_descriptor`;
- `assign_patient_level_probability_from_imaging_descriptor`;
- `bypass_safety_because_report_appears_reassuring`;
- `bypass_rf_saf_006_when_serious_structural_or_restriction_descriptors_present`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`.

## 11. This is not clinical approval

Authoring this object grants it no clinical authority. RF-DX-006 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 12. RF-SAF-001 … RF-SAF-008 and RF-DX-001 … RF-DX-005 remain unchanged

Those thirteen objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block and the earlier diagnosis
rules still hold. RF-DX-006 explicitly defers to and does not bypass RF-SAF-006.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 14` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-DX-006 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
