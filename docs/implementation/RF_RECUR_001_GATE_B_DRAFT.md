# RF-RECUR-001 — Gate B Draft Rule Object

The first pending, non-executable Gate B Rectus Femoris (RF) **recurrence** rule object has been
authored: [lib/clinical/rf/rules/objects/RF-RECUR-001.json](../../lib/clinical/rf/rules/objects/RF-RECUR-001.json).

It implements the **structure** of RF v1.2 rule **RF-RECUR-001** — "prior injury changes recurrence
handling without imposing a universal delay" (v1.2 §10.10). It is a draft only, and the first rule of
the recurrence block.

## 1. What was authored

A single machine-readable rule object expressing RF-RECUR-001's **prior-injury recurrence-handling
structure**:

- provenance: `source_spec_rule_id: "RF-RECUR-001"`, `rule_family: "recurrence"`, `source_section: "§10.10"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the §10.10 `trigger` (one or more prior quadriceps/RF injuries); the required
  history fields (episode count, side/site, recency, prior management, prior return exposure, previous
  failure/non-response); a `source_distinction` across the five prior-injury/recurrence tiers; a
  `source_provenance_requirement` (user-reported prior injury stored with provenance + uncertainty);
  `raw_media_handling` (not interpreted here); `source_quality_handling`;
- `decision_contract` — `required_behavioral_change` (collect fields, mark recurrence-relevant, require
  recurrence-specific exposure + next-day monitoring, display population limits);
  `universal_delay_status` (prior injury alone creates no fixed delay / longer monitoring window /
  higher pain threshold / mandatory phase hold); `progression_decision_basis:
  capacity_and_response_based_not_prior_injury_alone`; `reported_fibrosis_required_to_activate: false`,
  `reported_fibrosis_increases_authority: false`; the evidence-role fields (`qrf_042_role`,
  `mri_class_condition_for_qrf_041`, `qrf_043_role`, `qrf_033_and_qrf_034_role`); plus `false` flags for
  fixed setback, fixed timeline, deterministic recurrence-risk score, automatic severity/phase/loading/
  exercise/RTS change, recurrence/structural confirmation, raw-media interpretation, prescription/
  exercise-selection/plan/RTT/RTS, progression/readiness from prior injury alone, bypass of
  RF-REHAB-001…006 / RF-SEV-005 / RF-DX-006, and override of safety/capacity/restrictions/stage/
  readiness/monitoring/schedule/equipment/concurrent injury; `defers_to_rf_saf_006…: true`;
  `safety_precedence_preserved: true`; recurrence/rehab/field/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §15);
- `prohibited_outputs` (see §16);
- `test_fixtures: ["v1.2-§17-case-14"]`.

## 2. What was NOT authored

- No universal delay, fixed setback, fixed return-to-training / return-to-sport timeline, deterministic
  recurrence-risk score, or automatic severity upgrade / phase regression / loading reduction /
  exercise exclusion / RTS exclusion from prior injury.
- No diagnosis or confirmation of current recurrence, fibrosis, scar, chronic structural pathology, or
  central-tendon pathology from prior injury alone.
- No dosage / sets / reps / weekly frequency / rest intervals / intensity / duration / progression
  increments / return dates; no exercise selection or complete exercise plan; no complete rehab plan;
  no RTT or RTS decision.
- No progression authorization or readiness from prior-injury handling alone.
- No raw-media interpretation; no inference of prior injury / recurrence / fibrosis / scar / structural
  pathology from raw imaging.
- No bypass of RF-REHAB-001…006, RF-SEV-005, RF-DX-006, or RF-SAF-006; no bypass of safety / capacity /
  restrictions / stage / readiness / monitoring / schedule / equipment / concurrent-injury constraints.
- No recurrence engine — only the prior-injury recurrence-handling structure is preserved for the later
  recurrence, rehab, field, and readiness objects.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-RECUR-001 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 … RF-REHAB-006 were consulted as structural
  examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §10.10 / the inventory — none invented:

- `architecture_refs`: `V3.1-4` (context gate), `V3.1-12` (current capacity & capacity-to-demand gap),
  `V3.1-13` (rehab prescription/scheduling/monitoring).
- `evidence_claim_ids`: `QRF-042` (D2), `QRF-041` (D3, MRI-class-conditional), `QRF-043` (D3,
  reference-only), `QRF-033` (I1), `QRF-034` (I1). Each grade and role is preserved in `notes` /
  `decision_contract`.

## 5. Why this rule is a mixed-source recurrence-handling rule

§10.10 is `normative_source: mixed` — it combines an **architecture** requirement (how recurrence
history is collected and how progression decisions stay capacity-based; V3.1 §§4, 12–13) with
**evidence-governed** clinical claims (QRF-042/041/043/033/034) that bound what prior-injury data may
and may not support. The object keeps both facets distinct.

## 6. How prior injury changes recurrence-aware handling without creating a universal delay

§10.10's required behavioural change is real but bounded: collect the recurrence history, mark the
episode recurrence-relevant, require recurrence-specific exposure and next-day monitoring, and show the
evidence's population limits. What it must **not** do is slow things automatically — prior injury alone
creates no fixed delay, longer monitoring window, higher pain threshold, or mandatory phase hold
(`universal_delay_status`), and any actual progression stays capacity- and response-based
(`progression_decision_basis`). It changes *what is tracked*, not *the speed*, by itself.

## 7. Why QRF-041 is conditional on valid MRI class

The inventory and §10.10 mark QRF-041 as "D3 when valid MRI class exists." A BAMIC/MRI-class-derived
recurrence context is only admissible when a valid MRI class is actually present; using it otherwise
would assert structure the system does not have. The object sets
`mri_class_condition_for_qrf_041: "qrf_041_used_only_when_a_valid_mri_class_exists"` and blocks applying
QRF-041 without that condition.

## 8. Why QRF-043 is reference-only

§10.10 tags QRF-043 (D3) as "reference only." It is background context (e.g. AFL recurrence/kicking/
timing), not a recurrence-risk calculator. The object sets
`qrf_043_role: "reference_only_not_decision_driving_recurrence_risk_authority"` and blocks treating
QRF-043 as decision-driving recurrence-risk authority.

## 9. Why QRF-033 and QRF-034 remain I1 population-limit evidence

Both are graded **I1** (insufficient / population-limited — sex/fairness and youth/recreational
generalizability limitations). They describe limits on the evidence, not an individual's risk. The
object sets `qrf_033_and_qrf_034_role: "i1_population_limitation_evidence_not_individual_recurrence_prediction_authority"`
and blocks treating either as individual recurrence-prediction authority or converting population-limit
evidence into patient-level prediction.

## 10. Why prior injury alone does not confirm current recurrence, fibrosis, scar, chronic structural pathology, or central-tendon pathology

A history of injury is not proof of a *current* one, nor of any structural finding — those require
current evidence (and, for structure, valid documentation / RF-DX-006, with reported fibrosis governed
by RF-SEV-005). §10.10's prohibited inference also makes clear reported fibrosis is not even required to
activate this rule and does not raise its authority. The object sets
`confirms_current_rf_recurrence_from_prior_injury_alone: false` and
`confirms_fibrosis_scar_chronic_or_central_tendon_pathology_from_prior_injury_history: false`, and
blocks each corresponding confirmation output.

## 11. Why the rule does not create dosage, exercise selection, progression, complete plan, RTT, or RTS

Recurrence *handling* tracks history and monitoring; it does not author the dose, exercises,
progression, or return — those belong to separately gated/governed objects (V3.1 §8/§13; RF-REHAB-004
forbids universal dosing). The object sets `creates_rehab_prescription: false`, `selects_exercises:
false`, `selects_complete_exercise_plan: false`, `generates_complete_rehab_plan: false`,
`grants_return_to_training_or_return_to_sport_decision: false`,
`authorizes_progression_from_prior_injury_handling_alone: false`, and
`uses_prior_injury_status_alone_as_readiness: false`.

## 12. How RF-RECUR-001 relates to RF-SEV-005 and RF-DX-006

- **RF-SEV-005** owns reported-fibrosis/scar provenance. RF-RECUR-001 activates *independently* of
  reported fibrosis (it is not required and adds no authority), and it does not bypass RF-SEV-005's
  provenance handling (`bypasses_rf_sev_005_…: false`).
- **RF-DX-006** owns report/MRI descriptor handling. Where prior-injury / MRI / report descriptors are
  involved, RF-RECUR-001 defers to RF-DX-006 and does not bypass it
  (`bypasses_rf_dx_006_report_descriptor_handling: false`).

## 13. How RF-RECUR-001 relates to RF-SAF-006

If serious structural / postoperative / full-thickness / avulsion / major-retraction / external-restriction
descriptors are present, that is governed by **RF-SAF-006**; the object sets
`defers_to_rf_saf_006_on_serious_structural_or_restriction_concern: true`, `does_not_bypass_rf_saf_006:
true`, and `does_not_override_rf_saf_006: true`. Recurrence handling never weakens the safety block.

## 14. How RF-RECUR-001 relates to RF-REHAB-001 through RF-REHAB-006

Recurrence handling operates within the gated rehab pipeline, never around it. The object does not
bypass the RF-REHAB-001 prescription-input gate, RF-REHAB-002 loading-dimension constraints,
RF-REHAB-003 position-tag limits, RF-REHAB-004 universal-dosage prohibition, RF-REHAB-005 schedule/
total-load reconciliation, or RF-REHAB-006 concurrent-injury constraints (all `bypasses_…: false`).

## 15. `safety_state_output` and `blocked_targets`, and why this follows §10.10 exactly

Reading §10.10 exactly: it describes recurrence-aware **handling** (history, monitoring, exposure) with
an explicit no-automatic-slowing limit — it does **not** assign any of the eight closed V3.1 §21 safety
states. Per the task's rule, because §10.10 assigns no closed safety state, `safety_state_output` is
`null` and `blocked_targets` is `[]`, and the prior-injury recurrence-handling structure is represented
entirely in `decision_contract`. **No safety state was inferred by analogy** (any structural-restriction
block is owned by RF-SAF-006).

## 16. Prohibited outputs

The object's `prohibited_outputs` (58 entries) block, among others: creating a universal delay / fixed
setback / fixed RTT or RTS timeline / deterministic recurrence-risk score / automatic severity upgrade
/ phase regression / dosage reduction / exercise exclusion / RTS exclusion from prior RF injury;
diagnosing or confirming current recurrence, fibrosis, scar, chronic structural pathology, or
central-tendon pathology from prior injury alone; applying QRF-041 without the valid-MRI-class
condition; treating QRF-043 as decision-driving recurrence-risk authority; treating QRF-033/QRF-034 as
individual recurrence-prediction authority; converting population-limit evidence into patient-level
prediction; interpreting raw MRI / ultrasound / DICOM / screenshots / image files / photos / videos or
inferring injury/recurrence/structure from raw imaging; creating dosage / sets-or-repetitions / weekly
frequency / rest intervals / intensity targets / duration targets / progression increments / return
dates, selecting exercises or a complete exercise plan, producing a complete rehab plan, or producing a
return-to-training or return-to-sport decision from RF-RECUR-001; authorizing progression or readiness
from prior-injury handling alone; bypassing RF-REHAB-001…006 / RF-SEV-005 / RF-DX-006 / RF-SAF-006;
bypassing safety / capacity / restrictions / stage or readiness gates / monitoring / schedule /
equipment / concurrent-injury constraints because prior injury is known; and treating weak /
self-reported / unclear / incomplete / undocumented prior-injury history as high-authority recurrence
evidence.

## 17. This is not clinical approval

Authoring this object grants it no clinical authority. RF-RECUR-001 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 18. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, and RF-REHAB-001 … RF-REHAB-006 objects remain unchanged

Those twenty-seven rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history, and rehabilitation blocks still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 28` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-RECUR-001 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
