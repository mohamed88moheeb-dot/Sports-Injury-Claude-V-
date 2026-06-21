# RF-SEV-003 — Gate B Draft Rule Object

The third pending, non-executable Gate B Rectus Femoris (RF) **prognosis** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-SEV-003.json](../../lib/clinical/rf/rules/objects/RF-SEV-003.json).

It implements the **structure** of RF v1.2 rule **RF-SEV-003** — "documented central-aponeurosis
location" (v1.2 §9.4). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SEV-003's **documented-location uncertainty /
guarded-context structure**:

- provenance: `source_spec_rule_id: "RF-SEV-003"`, `rule_family: "prognosis"`, `source_section: "§9.4"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — central-aponeurosis location used only when documented by an acceptable external
  report / verified assessment / v1.2-permitted source; `inference_sources_prohibited` =
  mechanism / pain_location / symptoms / self_tests / raw_imaging; `raw_media_handling` = not
  interpreted here; `source_quality_handling` = preserve uncertainty (incl. non-specific / not
  documented as required);
- `decision_contract` — `documented_location_role: "may_widen_uncertainty_or_guarded_prognostic_context_only"`;
  `proximal_versus_distal_context` (documented proximal may increase prognostic caution vs distal in a
  similar high-level soccer population); `avoids_early_date_promises: true`;
  `automatically_alters_stage: false`; `automatically_alters_dosing: false`; plus `false` flags for
  autonomous prognosis engine, fixed timeline, deterministic return-timeline formula / severity score /
  recurrence score, raw-media interpretation, inference from non-documented sources,
  confidence/probability, phase/rehab/plan/RTS, and override of safety/capacity/restrictions/stage/
  readiness/concurrent injury; `safety_precedence_preserved: true`; severity/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (a prognosis context rule, not a safety rule);
- `prohibited_outputs` (see §11);
- `test_fixtures: []` (no §17 case maps specifically to central-aponeurosis location).

## 2. What was NOT authored

- No autonomous prognosis engine; no fixed return date or return-to-training / return-to-sport
  timeline; no deterministic return-date formula, severity score, or recurrence score; no automatic
  stage or dosing change.
- No conversion of central-aponeurosis location, cohort medians, or group benchmarks into an
  individual prediction.
- No raw-media interpretation; no inference of central-aponeurosis involvement from mechanism, pain
  location, symptoms, self-tests, or raw imaging.
- No numeric confidence or patient-level probability; no rehab-phase determination, rehab
  authorization, complete plan, or RTS decision; no override of safety/capacity/restrictions/stage/
  readiness/concurrent-injury constraints.
- No severity/prognosis model — only documented-location uncertainty/context structure is preserved
  for the later severity and readiness objects.
- No dosage, sets/reps/frequency/rest, return dates, or progression increments.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SEV-003 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, and RF-SEV-001/002 were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claims were preserved

Copied verbatim from v1.2 §9.4 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-008` (D2; central-tendon context), `QRF-010` (D2; proximal-versus-distal
  location context). Both individual grades/roles are preserved in the object's `notes`; no combined
  or invented grade was created. (Note: QRF-010's role here — proximal-vs-distal *location* context —
  is distinct from RF-SEV-002, where QRF-010 was explicitly **not** authority for BAMIC outcomes.)

## 5. Why architecture references are intentionally empty

RF-SEV-003 is a **clinical-content** rule. Per v1.2 §4.3, clinical-content rules **cite valid
`evidence_claim_ids`** and **do not** carry architecture references; the §9.4 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**.

## 6. How documented central-aponeurosis location may widen uncertainty or guarded context

§9.4 permits a **documented** proximal central-aponeurosis involvement to "increase prognostic caution
compared with distal involvement in a similar high-level soccer population," with the action being to
"widen uncertainty and avoid early date promises." So when an acceptable source documents the
location, the object may carry guarded prognostic caution (`documented_location_role:
may_widen_uncertainty_or_guarded_prognostic_context_only`, `avoids_early_date_promises: true`) — it
makes the system *more* cautious, never more confident, and explicitly does **not** automatically alter
stage or dosing (`automatically_alters_stage: false`, `automatically_alters_dosing: false`).

## 7. Why central-aponeurosis involvement must not be inferred from mechanism, symptoms, pain location, self-tests, or raw imaging

Location is a structural finding that only valid documentation can establish; deriving it from a
mechanism, a pain map, a symptom, a self-test, or a raw image would manufacture structural certainty
the platform cannot support (and raw-image reading is prohibited platform-wide, V3.1 §25). The object
lists `inference_sources_prohibited` and sets `infers_location_from_non_documented_sources: false`,
and blocks each inference path plus raw-image interpretation.

## 8. Why cohort medians or benchmarks must not become individual timelines

The supporting evidence is population-level (a high-level soccer cohort); a cohort statistic describes
a distribution, not the individual, so it is context rather than a personal timeline. The object sets
`cohort_median_or_group_benchmark_role: "group_context_only_not_individual_prediction"`,
`produces_individual_prognosis: false`, and `produces_fixed_individual_timeline: false`, and blocks
converting location / medians / benchmarks into individual prognosis.

## 9. Why the rule does not create a deterministic return-date formula, severity score, recurrence score, phase selection, rehab authorization, complete plan, or RTS decision

§9.4's prohibited use is explicit — "no deterministic return-date formula" — and its action bars
automatic stage/dosing changes. A documented location informs *caution*, not a calculator. The object
sets `creates_deterministic_return_timeline_formula: false`, `creates_deterministic_severity_score:
false`, `creates_deterministic_recurrence_score: false`, `determines_current_rehab_phase: false`,
`authorizes_rehab: false`, `produces_complete_rehab_plan: false`, and `grants_return_to_sport_clearance:
false`, and blocks each corresponding output. Current safety, capacity, stage, and readiness remain
the deciding objects (V3.1 §8).

## 10. Why raw imaging interpretation is prohibited

Per V3.1 §25 the conversational model never interprets raw images or videos, and §9.4's structural
location must come from documentation, not pixels. The object sets `interprets_raw_media: false` and
blocks interpreting raw MRI / ultrasound / DICOM / screenshots / image files / photos / videos and
inferring central-aponeurosis involvement from raw imaging. Only externally reported *text* documents
the location (report-descriptor handling itself is RF-DX-006).

## 11. Prohibited outputs

The object's `prohibited_outputs` explicitly block: inferring central-aponeurosis involvement from
mechanism / pain location / symptoms / self-tests / raw imaging; interpreting raw MRI / ultrasound /
DICOM / screenshots / image files / photos / videos; using central-aponeurosis location as an
autonomous prognosis engine; converting central-aponeurosis location / cohort medians / group
benchmarks into individual prognosis; assigning a fixed return date / duration from the location;
creating a deterministic return-date formula / severity score / recurrence score from the location;
assigning numeric confidence or patient-level probability from the location; determining rehab phase,
authorizing rehab, producing a complete rehab plan, or producing a return-to-sport decision from the
location alone; bypassing safety / current capacity / external restrictions / stage or readiness gates
because the location is documented; and treating weak / unclear / user-entered / non-specific location
evidence as high-authority evidence.

## 12. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SEV-003 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 13. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, and RF-SEV-001 … RF-SEV-002 objects remain unchanged

Those eighteen rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety block, the diagnosis
block, and RF-SEV-001/002 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 19` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SEV-003 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
