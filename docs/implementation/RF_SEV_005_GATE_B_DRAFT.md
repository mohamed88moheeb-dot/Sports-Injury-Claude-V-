# RF-SEV-005 — Gate B Draft Rule Object

The fifth and **final** pending, non-executable Gate B Rectus Femoris (RF) severity/prognosis/history
rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SEV-005.json](../../lib/clinical/rf/rules/objects/RF-SEV-005.json).

It implements the **structure** of RF v1.2 rule **RF-SEV-005** — "reported fibrosis or scar is history
provenance, not severity" (v1.2 §9.6). It is a draft only. With this, the severity/prognosis/history
block (RF-SEV-001 … RF-SEV-005) is complete.

## 1. What was authored

A single machine-readable rule object expressing RF-SEV-005's **provenance-tagged history structure**:

- provenance: `source_spec_rule_id: "RF-SEV-005"`, `rule_family: "history_structure"`, `source_section: "§9.6"`;
- `permitted_use: "evidence_record_only"`;
- `input_contract` — the §9.6 trigger (user reports previous fibrosis / scar / lump / tightness /
  different sensation at a prior RF site), `storage_location: "injury_history_modifier"`, the
  `provenance_tiers` (self_report / documented_report / imaging_report) and `confirmation_status_tiers`
  (unverified / documented / imaging_confirmed), an explicit `source_distinction` (user-reported vs
  externally reported vs imaging-confirmed vs separately-documented chronic structural pathway),
  `inference_sources_prohibited`, `raw_media_handling`, and `source_quality_handling`;
- `decision_contract` — store as a provenance-tagged history modifier, capture provenance + confirmation
  status, ask for available reports, preserve structural uncertainty; with `false` flags for every
  upgrade (documented / imaging-confirmed / structural grade / current severity / confirmed recurrent),
  every modifier use (recurrence-risk / progression / rehab / dosing / exercise-selection / monitoring
  threshold / RTT-or-RTS), QRF-045 misuse, chronic-structural upgrade, raw-media interpretation,
  inference from non-documented sources, confidence/probability, phase/rehab/plan/RTS, and override of
  safety/capacity/restrictions/stage/readiness/concurrent injury; `defers_to_rf_dx_006…`,
  `defers_to_rf_saf_006…`; `safety_precedence_preserved: true`; history/severity objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a history-structure rule, not a safety rule);
- `prohibited_outputs` (see §13);
- `test_fixtures: ["v1.2-§17-case-15", "v1.2-§17-case-16", "v1.2-§17-case-17"]`.

## 2. What was NOT authored

- No upgrade of user-reported fibrosis/scar into documented or imaging-confirmed fibrosis, structural
  grade, current severity, or confirmed recurrent injury.
- No use of reported fibrosis/scar as a recurrence-risk, progression, rehab, dosage, exercise-selection,
  monitoring-threshold, return-to-training, or return-to-sport modifier; no current-injury-identity
  assignment from self-report.
- No numeric confidence or patient-level probability; no rehab-phase determination, rehab
  authorization, complete plan, or RTS decision; no override of safety/capacity/restrictions/stage/
  readiness/concurrent-injury constraints.
- No raw-media interpretation; no inference of fibrosis/scar from symptoms, pain location, mechanism,
  self-tests, subjective sensation, or raw imaging.
- No autonomous surgical selection; no QRF-045 use outside the separate chronic structural pathway.
- No severity/prognosis/history model — only provenance-tagged history structure is preserved for later
  objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SEV-005 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, and RF-SEV-001/002/003/004 were consulted as structural examples only, not as clinical
  authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §9.6 / the inventory — none invented:

- `architecture_refs`: `V3.1-4`, `V3.1-5` (context gate / input classification), `V3.1-6` (anchor
  quality), `V3.1-8` (separated confidence objects), `V3.1-13.1` (prescription gate), `V3.1-24`
  (confidence/evidence/output locks).
- `evidence_claim_ids`: `QRF-044` (X1), `QRF-046` (I1), `QRF-045` (C1). Grades and roles preserved in
  `notes` / `decision_contract`; QRF-044/046 limited to prior-history/provenance, QRF-045 reference-only
  for the separate chronic structural pathway.

## 5. Why this rule is `history_structure`, not severity/prognosis logic

A *reported* fibrosis/scar is information about the athlete's **history**, captured with a provenance
tag — not a current structural finding. §9.6's whole point is to keep that report in
`injury_history_modifier` and out of the current structural profile until a valid report supports it.
So the rule's family is `history_structure`: it records and tags, it does not grade, score, or
predict.

## 6. How reported fibrosis/scar is recorded as provenance-tagged history only

Per §9.6 the report is stored in `injury_history_modifier` with `provenance` (self_report /
documented_report / imaging_report) and `confirmation_status` (unverified / documented /
imaging_confirmed), the system asks for available reports, and structural uncertainty is preserved.
The object encodes exactly this (`action: store_..._provenance_tagged_injury_history_modifier_only`,
`capture_provenance_and_confirmation_status: true`, `ask_for_available_reports: true`,
`preserve_structural_uncertainty: true`) and refuses to place a self-report in the current structural
profile without a valid report.

## 7. Why user-reported fibrosis/scar must not be upgraded into documented or imaging-confirmed fibrosis

A patient's words ("it felt lumpy," "scar tissue") are *unverified* by default; treating them as a
documented or imaging-confirmed finding would fabricate structural certainty (and V3.1 §24 locks
confidence to evidence completeness). The object sets `records_user_report_as_documented_fibrosis:
false`, `records_user_report_as_imaging_confirmed_fibrosis: false`, `records_user_report_as_structural_grade:
false`, `records_user_report_as_current_severity: false`, and `records_user_report_as_confirmed_recurrent_injury:
false`, and blocks each corresponding output. The four-tier `source_distinction` keeps user-reported,
externally reported, imaging-confirmed, and chronic-structural evidence apart.

## 8. Why reported fibrosis/scar must not become recurrence-risk, progression, rehab, dosage, exercise-selection, RTT, or RTS logic

§9.6's "no independent effect" is explicit: self-report alone must not assign current injury identity,
structural severity, prognosis, progression speed, monitoring threshold, or readiness. A
self-described old scar is not evidence that the current episode is higher-risk or should be loaded
differently. The object sets `uses_report_as_recurrence_risk_modifier: false`,
`uses_report_as_progression_modifier: false`, `uses_report_as_rehab_modifier: false`,
`alters_dosing_from_report: false`, `uses_report_as_exercise_selection_modifier: false`,
`uses_report_as_monitoring_threshold_modifier: false`, and
`uses_report_as_return_to_training_or_return_to_sport_modifier: false`, and blocks each as an output.
(This aligns with QRF-044, indirect counter-evidence against fibrosis-only recurrence inference, and
QRF-046, which blocks self-reported fibrosis as an independent modifier.)

## 9. Why QRF-045 is limited to the separate chronic structural pathway

§9.6 states QRF-045 "applies only to the separate chronic structural pathway" and is "informed only as
reference context." Chronic/recurrent central-tendon pathology is a distinct, externally-assessed
condition — not a license to validate a self-reported scar. The object sets
`qrf_045_role: "reference_context_only_for_the_separate_chronic_structural_pathway"`,
`applies_qrf_045_outside_chronic_structural_pathway: false`,
`upgrades_reported_language_into_chronic_structural_diagnosis: false`, `validates_self_reported_fibrosis:
false`, and `performs_autonomous_surgical_selection: false`, and gates chronic-structural activation on
"persistent sport-related symptoms plus valid imaging evidence of central-tendon pathology," routing to
external assessment/referral.

## 10. Why raw imaging interpretation is prohibited

Per V3.1 §25 the conversational model never interprets raw images/videos, and imaging-confirmed status
must come from a report, not pixels. The object sets `interprets_raw_media: false` and
`infers_fibrosis_or_scar_from_non_documented_sources: false`, and blocks interpreting raw MRI /
ultrasound / DICOM / screenshots / image files / photos / videos and inferring fibrosis/scar from raw
imaging or any non-documented source.

## 11. How RF-SEV-005 relates to RF-DX-006 and RF-SAF-006

- **RF-DX-006** owns report-descriptor handling. When an *externally reported* fibrosis/scar descriptor
  is supplied, its handling defers to RF-DX-006 (`defers_to_rf_dx_006_for_report_descriptors: true`,
  `does_not_bypass_rf_dx_006: true`).
- **RF-SAF-006** owns the safety disposition for serious structural / postoperative / full-thickness /
  avulsion / major-retraction / external-restriction concern. RF-SEV-005 defers to it
  (`defers_to_rf_saf_006_on_serious_structural_or_restriction_concern: true`,
  `does_not_bypass_rf_saf_006: true`) and blocks bypassing either.

## 12. Why the rule does not create phase selection, rehab authorization, a complete plan, or RTS

A history note about a prior scar says nothing about current safety, capacity, stage, or readiness
(V3.1 §8). So the object sets `determines_current_rehab_phase: false`, `authorizes_rehab: false`,
`produces_complete_rehab_plan: false`, and `grants_return_to_sport_clearance: false`, and blocks each
`…_from_reported_fibrosis_or_scar` output. Uncertainty is preserved when the source is weak, unclear,
user-entered without source, non-specific, or undocumented.

## 13. Prohibited outputs

The object's `prohibited_outputs` explicitly block: recording user-reported fibrosis/scar as documented
or imaging-confirmed fibrosis/scar, structural grade, current severity, or confirmed recurrent injury;
using reported fibrosis/scar as a recurrence-risk / progression / rehab / dosage / exercise-selection /
return-to-training / return-to-sport modifier; applying QRF-045 outside the separate chronic structural
pathway; upgrading ordinary reported language into chronic structural diagnosis; inferring fibrosis/scar
from symptoms / pain location / mechanism / self-tests / subjective tight-lumpy-different sensation /
raw imaging; interpreting raw MRI / ultrasound / DICOM / screenshots / image files / photos / videos;
bypassing RF-DX-006 report-descriptor handling; bypassing RF-SAF-006 when serious structural/restriction
descriptors are present; assigning numeric confidence or patient-level probability from reported
fibrosis/scar; determining rehab phase, authorizing rehab, producing a complete rehab plan, or producing
a return-to-sport decision from reported fibrosis/scar; bypassing safety / current capacity / external
restrictions / stage or readiness gates because reported fibrosis/scar is known; and treating weak /
unclear / user-entered / non-specific / undocumented fibrosis/scar history as high-authority evidence.

## 14. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SEV-005 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 15. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, and RF-SEV-001 … RF-SEV-004 objects remain unchanged

Those twenty rule objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block, the diagnosis block, and
RF-SEV-001/002/003/004 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 21` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SEV-005 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
