# RF-SEV-004 — Gate B Draft Rule Object

The fourth pending, non-executable Gate B Rectus Femoris (RF) **prognosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-SEV-004.json](../../lib/clinical/rf/rules/objects/RF-SEV-004.json).

It implements the **structure** of RF v1.2 rule **RF-SEV-004** — "proximal or full-thickness injury"
(v1.2 §9.5). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SEV-004's **benchmark + prohibition structure**:

- provenance: `source_spec_rule_id: "RF-SEV-004"`, `rule_family: "prognosis"`, `source_section: "§9.5"`;
- `permitted_use: "prohibited_autonomous_rule"` (primary; dual role captured — see §5/§6);
- `input_contract` — pooled operative/nonoperative timelines recorded as broad research benchmarks
  only; proximal/full-thickness status used only when documented (never inferred); `raw_media_handling`
  = not interpreted here; `source_quality_handling` = preserve uncertainty (incl. not externally
  reported / not documented as required);
- `decision_contract` — `benchmark_role: "evidence_record_only_guarded_research_context…"`;
  `autonomous_use_status: "prohibited_autonomous_rule_for_treatment_selection_or_individual_timing"`;
  `defers_to_rf_saf_006_when_management_restrictions_unresolved: true`;
  `blocks_generic_rehabilitation_via_rf_saf_006_when_restrictions_unresolved: true`;
  `does_not_override_rf_saf_006: true`; plus `false` flags for diagnosis, inference from non-documented
  sources, raw-media interpretation, surgical advice, operative/non-operative recommendation,
  treatment/rehab/return timing, fixed timeline, autonomous prognosis engine, deterministic
  prognosis/severity/recurrence/treatment-decision score, confidence/probability, phase/rehab/plan/RTS,
  and override of safety/capacity/restrictions/stage/readiness/concurrent injury;
  `safety_precedence_preserved: true`; severity/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a prognosis rule that defers the actual block to
  RF-SAF-006 — see §8);
- `prohibited_outputs` (see §12);
- `test_fixtures: ["v1.2-§17-case-8"]`.

## 2. What was NOT authored

- No diagnosis of proximal injury, full-thickness injury, avulsion, major retraction, or postoperative
  restriction; no inference of those from mechanism / pain location / symptoms / self-tests / raw
  imaging.
- No surgical advice; no operative-vs-non-operative recommendation or decision; no treatment / rehab /
  return-to-training / return-to-sport timing; no fixed return date or duration.
- No autonomous prognosis engine; no deterministic prognosis / severity / recurrence / treatment-
  decision score; no numeric confidence or patient-level probability.
- No rehab-phase determination, rehab authorization, complete plan, or RTS decision; no override of
  safety / capacity / restrictions / stage / readiness / concurrent-injury constraints.
- No raw-media interpretation.
- No severity/prognosis model — only benchmark/prohibition structure is preserved for the later
  severity and readiness objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SEV-004 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, and RF-SEV-001/002/003 were consulted as structural examples only, not as clinical
  authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §9.5 / the inventory — none invented:

- `architecture_refs`: `V3.1-6` (anchor quality), `V3.1-13.1` and `V3.1-13.2` (prescription gate /
  missing-input behaviour), `V3.1-20` (referral-resolution lifecycle).
- `evidence_claim_ids`: `QRF-012` (C1), `QRF-032` (C1), `QRF-036` (I1). Each grade and its bounded
  benchmark/context role are preserved in `notes` / `decision_contract`; no combined or invented grade
  was created, and none is generalized into autonomous treatment or prognosis authority.

## 5. How proximal/full-thickness benchmark evidence may be recorded as guarded context only

§9.5 says "pooled operative and nonoperative timelines are broad research benchmarks only." So the
object may store those pooled timelines as `benchmark_role: evidence_record_only_guarded_research_context…`
— population-level reference, explicitly *not* an individual prediction (`cohort_benchmark_role:
group_context_only_not_individual_prediction`). They add guarded context; they decide nothing.

## 6. Why the rule is `prohibited_autonomous_rule`

§9.5's permitted use is dual: `evidence_record_only` for the benchmarks, but
`prohibited_autonomous_rule` for treatment selection or individual timing — and its prohibited use bars
treatment-superiority inference, individual return prediction, and autonomous management choice. The
*strongest* role the rule may play is therefore "prohibited autonomous rule," which is what
`permitted_use` records; the benchmark-recording role is the weaker, evidence-only facet captured in
`decision_contract`. Per V3.1 §16.1, `prohibited_autonomous_rule` content can never become
decision-driving executable logic.

## 7. Why benchmark evidence must not become surgical advice, treatment selection, treatment timing, rehab timing, or return timing

These are exactly the §9.5-prohibited autonomous behaviors (treatment-superiority inference, individual
timing, autonomous management choice). Pooled research timelines describe distributions across mixed
management strategies — turning them into "have surgery," "don't have surgery," or "you'll be back in
N weeks" would assert authority the evidence cannot support and that the platform is not authorized to
exercise. The object sets `gives_surgical_advice: false`,
`recommends_operative_versus_nonoperative_treatment: false`, `creates_treatment_timing: false`,
`creates_rehab_timing: false`, and `creates_return_to_training_or_return_to_sport_timing: false`, and
blocks each corresponding output.

## 8. Why proximal/full-thickness/avulsion/postoperative concerns must defer to RF-SAF-006

§9.5's decision is explicit: "when management restrictions are unresolved, apply RF-SAF-006 and block
generic rehabilitation." RF-SAF-006 is the safety rule that owns the `REHAB_BLOCKED` disposition for
suspected avulsion / full-thickness / postoperative restriction. RF-SEV-004 therefore **defers** to it
rather than declaring its own safety state: `defers_to_rf_saf_006_when_management_restrictions_unresolved:
true`, `blocks_generic_rehabilitation_via_rf_saf_006_when_restrictions_unresolved: true`, and
`does_not_override_rf_saf_006: true`, with a `bypass_rf_saf_006_…` prohibition. Because the actual
rehabilitation block is owned by RF-SAF-006, this prognosis object keeps `safety_state_output: null`.

## 9. Why raw imaging interpretation is prohibited

Per V3.1 §25 the conversational model never interprets raw images/videos, and §9.5's structural status
must come from documentation. The object sets `interprets_raw_media: false`,
`infers_structural_injury_from_non_documented_sources: false`, and blocks interpreting raw MRI /
ultrasound / DICOM / screenshots / image files / photos / videos and inferring proximal/full-thickness
injury from raw imaging or any non-documented source.

## 10. Why cohort benchmarks must not become individual timelines or deterministic prognosis

A pooled timeline is a group statistic; an individual may sit anywhere in (or outside) the distribution.
Converting it into a personal date, formula, or score is a base-rate error and is exactly what §9.5
prohibits. The object sets `produces_fixed_individual_timeline: false`,
`is_autonomous_prognosis_engine: false`, `creates_deterministic_prognosis_formula: false`,
`creates_deterministic_severity_score: false`, `creates_deterministic_recurrence_score: false`, and
`creates_treatment_decision_score: false`, and blocks the matching outputs.

## 11. Why the rule does not create phase selection, rehab authorization, a complete plan, or RTS

A benchmark says nothing about current safety, capacity, stage, or readiness (V3.1 §8). So the object
sets `determines_current_rehab_phase: false`, `authorizes_rehab: false`, `produces_complete_rehab_plan:
false`, and `grants_return_to_sport_clearance: false`, and blocks each `…_from_proximal_or_full_thickness_benchmark_evidence_alone`
output. Uncertainty is preserved when the source is weak, unclear, user-entered without source,
non-specific, not externally reported, or undocumented.

## 12. Prohibited outputs

The object's `prohibited_outputs` explicitly block: diagnosing proximal RF / full-thickness / avulsion /
major retraction / postoperative restriction from benchmark evidence alone; inferring proximal or
full-thickness injury from mechanism / pain location / symptoms / self-tests / raw imaging; interpreting
raw MRI / ultrasound / DICOM / screenshots / image files / photos / videos; giving surgical advice;
recommending operative or non-operative treatment or deciding between them; creating treatment / rehab /
return-to-training / return-to-sport timing from benchmark evidence; assigning a fixed return date or
duration from proximal/full-thickness benchmark evidence; using that benchmark evidence as an autonomous
prognosis engine; creating a deterministic prognosis / severity / recurrence score from it; assigning
numeric confidence or patient-level probability from it; determining rehab phase, authorizing rehab,
producing a complete rehab plan, or producing a return-to-sport decision from it alone; bypassing
RF-SAF-006 when serious structural/restriction descriptors are present; bypassing safety / current
capacity / external restrictions / stage or readiness gates because benchmark evidence is known; and
treating weak / unclear / user-entered / non-specific / undocumented benchmark evidence as
high-authority evidence.

## 13. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SEV-004 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 14. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, and RF-SEV-001 … RF-SEV-003 objects remain unchanged

Those nineteen rule objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety block, the diagnosis block, and
RF-SEV-001/002/003 still hold. RF-SEV-004 explicitly defers to and does not override RF-SAF-006.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 20` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SEV-004 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
