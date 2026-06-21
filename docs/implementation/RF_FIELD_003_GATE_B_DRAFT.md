# RF-FIELD-003 — Gate B Draft Rule Object

The third pending, non-executable Gate B Rectus Femoris (RF) **running/sprinting** rule object has
been authored:
[lib/clinical/rf/rules/objects/RF-FIELD-003.json](../../lib/clinical/rf/rules/objects/RF-FIELD-003.json).

It implements the **structure** of RF v1.2 rule **RF-FIELD-003** — "higher-speed exposure requires
verified prerequisite capacity" (v1.2 §13.4). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-FIELD-003's **higher-speed prerequisite-capacity
gating structure**:

- provenance: `source_spec_rule_id: "RF-FIELD-003"`, `rule_family: "running_sprinting"`, `source_section: "§13.4"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the §13.4 `higher_speed_exposure_definition` (above the previously verified
  tolerated speed band or an activated Aspetar milestone; **no hidden speed threshold implied**); the
  four `prerequisites` (safety clear; prior lower-speed exposure completed with acceptable monitored
  response; relevant capacity records available; no active schedule or concurrent-injury conflict);
  the `separately_governed_thresholds` (exact symmetry/pain/volume/recovery); `source_quality_handling`;
- `decision_contract` — `higher_speed_exposure_prerequisite_status`; `verified_prerequisite_capacity_required:
  true`; `lower_speed_exposure_requirement`; `higher_speed_exposure_label_status` (governed label, not
  a hidden cutoff); `near_restored_capacity_label_status` (governed prerequisite-capacity concept, not
  a hidden threshold); `hidden_threshold_status`; `exact_threshold_authority_status` (separately
  governed, pathway-derived candidates not universal production rules); evidence-role fields; plus
  `false` flags for universal entry criteria, MSS-as-eligibility, 95% MSS sufficiency, unrestricted
  training/play, cross-domain clearance, progression schedule, dosage, exercise selection, field/rehab
  plan, RTT/RTS, progression/readiness from labels alone, bypass of the upstream field/recur/rehab/
  sev/dx rules, and override of safety/capacity/restrictions/stage/readiness/monitoring/schedule/
  equipment/sport-context/concurrent injury; `defers_to_rf_saf_006…: true`; `safety_precedence_preserved:
  true`; field/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §16);
- `prohibited_outputs` (see §17);
- `test_fixtures: []` (no §17 case maps specifically to higher-speed prerequisite capacity).

## 2. What was NOT authored

- No universal high-speed entry criteria; no hidden speed/symmetry/pain/lower-speed thresholds; no exact
  symmetry/pain/speed thresholds or exact lower-speed exposure dose (distance/duration/sessions/efforts/
  %MSS/time window).
- No use of 70/80/95% MSS as universal higher-speed eligibility; no 95% MSS sufficiency by itself.
- No unrestricted training/play; no RTT/RTS decision; no clearing of kicking/cutting/decel/COD/
  repeated-sprint/fatigue/sport-specific or any untested field domain.
- No sprint/running progression schedule; no dosage / sets / reps / weekly frequency / rest intervals /
  intensity / duration / work-to-rest ratios / progression increments / return dates / mandatory time
  windows; no exercise selection; no complete field plan; no complete rehab plan; no progression/
  readiness from prerequisite-capacity labels alone.
- No bypass of RF-FIELD-001/002, RF-RECUR-001/002, RF-REHAB-001…006, RF-SEV-005, RF-DX-006, or
  RF-SAF-006; no bypass of safety / capacity / restrictions / stage / readiness / monitoring / schedule
  / equipment / sport-context / concurrent-injury constraints.
- No field-exposure or readiness engine — only the prerequisite-capacity gating structure is preserved
  for later field, rehab, and readiness objects.
- No invented architecture references.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-FIELD-003 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001/002, and RF-FIELD-001/002
  were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §13.4 / the inventory — none invented:

- `architecture_refs`: `V3.1-12` (current capacity & capacity-to-demand gap), `V3.1-13` (rehab
  prescription/scheduling/monitoring).
- `evidence_claim_ids`: `QRF-019` (E1), `QRF-024` (E1), `QRF-025` (E1). Each role is preserved in
  `notes`/`decision_contract`.

## 5. Why this is a mixed-source higher-speed prerequisite-capacity rule

§13.4 is `normative_source: mixed` — an **architecture** requirement (prerequisite verification,
capacity-to-demand, scheduling/monitoring; V3.1 §§12–13) combined with **evidence-governed** pathway
claims (QRF-019/024/025) that inform the milestones/structure without setting universal production
thresholds.

## 6. What "very high-speed running" may represent, without inventing a speed threshold

§13.4's source term is **"higher-speed exposure,"** defined as *a planned running exposure above the
athlete's previously verified tolerated speed band or an activated Aspetar milestone*, with **"no
hidden speed threshold implied."** The object encodes exactly that as `higher_speed_exposure_definition`
and `higher_speed_exposure_label_status` (a governed exposure label, **not** a hidden universal speed
cutoff). No numeric "very high-speed" cutoff is invented — §13.4 defines none.

## 7. What "near-restored clinical measures" may represent, without inventing symmetry or pain thresholds

§13.4's source term is **"relevant capacity records available"** (a prerequisite), not a literal
"near-restored clinical measures" threshold. The object represents this as
`near_restored_capacity_label_status` — a governed prerequisite-capacity concept, **not** a hidden
universal threshold. No symmetry or pain cut-offs are invented; §13.4's limit states exact symmetry,
pain, volume, and recovery thresholds remain separately governed content.

## 8. Why prior successful lower-speed exposure is required, without inventing a lower-speed exposure dose

§13.4's prerequisite is "prior lower-speed exposure completed with acceptable monitored response." The
object encodes this as `lower_speed_exposure_requirement` and blocks creating an exact lower-speed
exposure dose (distance/duration/sessions/efforts/%MSS/time window) — §13.4 specifies none, so none is
invented. The point is *verified prior tolerance with monitored response*, not a fixed quantity.

## 9. Why exact symmetry and pain thresholds remain pathway-derived candidates, not universal production rules

§13.4's limit is explicit: "exact symmetry, pain, volume, and recovery thresholds remain separately
governed content." The object sets `exact_threshold_authority_status` to record them as separately
governed, pathway-derived candidates — not universal production rules — and blocks creating exact
symmetry/pain/speed thresholds or hidden thresholds from this rule.

## 10. Why QRF-019, QRF-024, and QRF-025 must not become universal high-speed clearance authority

Each claim has a bounded role (QRF-019 Aspetar pathway structure; QRF-024 conditional milestone
reference with RF-FIELD-001 limits; QRF-025 the 95%-MSS-not-sufficient-alone restriction per
RF-FIELD-002). Treating any of them as a universal high-speed clearance gate would exceed its evidence.
The object preserves each role and blocks treating any of the three as universal high-speed clearance
authority.

## 11. Why the rule does not create dosage, sprint/running progression, exercise selection, complete plan, RTT, or RTS

A prerequisite gate decides *whether higher-speed exposure may proceed*, not *how to dose it* or *what
the plan is*; those belong to separately gated/governed objects (RF-REHAB-004 forbids universal dosing;
V3.1 §§12–13). The object sets `creates_field_progression_plan: false`,
`creates_speed_or_sprint_progression_schedule: false`, `creates_rehab_prescription: false`,
`selects_exercises: false`, `selects_complete_field_plan: false`, `generates_complete_rehab_plan: false`,
and `grants_return_to_training_or_return_to_sport_decision: false`.

## 12. How RF-FIELD-003 relates to RF-FIELD-001 and RF-FIELD-002

- **RF-FIELD-001** provides the Aspetar speed milestones with denominator/pathway-context limits;
  RF-FIELD-003 references an "activated Aspetar milestone" in its definition and does not bypass those
  limits (`bypasses_rf_field_001_…: false`).
- **RF-FIELD-002** holds that 95% MSS is not sufficient alone; RF-FIELD-003 honors it and does not
  bypass that boundary (`bypasses_rf_field_002_…: false`), and blocks 95% MSS as eligibility/sufficiency.

## 13. How RF-FIELD-003 relates to RF-RECUR-002 and RF-RECUR-001

It honors RF-RECUR-002's separated, unranked exposure-domain monitoring (higher-speed tolerance clears
no other domain) and does not bypass RF-RECUR-001 prior-injury recurrence handling (both `bypasses_…:
false`).

## 14. How RF-FIELD-003 relates to RF-REHAB-001 through RF-REHAB-006

Prerequisite gating operates within the gated rehab pipeline, never around it. The object does not
bypass the RF-REHAB-001 prescription-input gate, RF-REHAB-002 loading-dimension constraints,
RF-REHAB-003 position-tag limits, RF-REHAB-004 universal-dosage prohibition, RF-REHAB-005 schedule/
total-load reconciliation, or RF-REHAB-006 concurrent-injury constraints (all `bypasses_…: false`).
Indeed, "no active schedule or concurrent-injury conflict" is itself one of §13.4's prerequisites.

## 15. How RF-FIELD-003 relates to RF-SEV-005, RF-DX-006, and RF-SAF-006

It does not bypass RF-SEV-005 (reported-fibrosis/scar provenance) or RF-DX-006 (report / MSS-denominator
/ clinical-measure / test-context descriptor handling), and it defers to RF-SAF-006 when serious
structural / postoperative / full-thickness / avulsion / major-retraction / external-restriction
descriptors are present (`defers_to_rf_saf_006…: true`, `does_not_bypass_rf_saf_006: true`).

## 16. `safety_state_output` and `blocked_targets`, and why this follows §13.4 exactly

Reading §13.4 exactly: it defines a prerequisite-capacity **gate** for higher-speed exposure; "safety
clear" appears as a *prerequisite*, not as a closed safety-state assignment, and §13.4 assigns none of
the eight closed V3.1 §21 safety states. Per the task's rule, because §13.4 assigns no closed safety
state, `safety_state_output` is `null` and `blocked_targets` is `[]`, and the prerequisite-capacity
gating is represented entirely in `decision_contract`. **No safety state was inferred by analogy** (any
structural-restriction block is owned by RF-SAF-006).

## 17. Prohibited outputs

The object's `prohibited_outputs` (70 entries) block, among others: creating universal high-speed entry
criteria; creating hidden speed/symmetry/pain/lower-speed thresholds or exact symmetry/pain/speed
thresholds or an exact lower-speed exposure dose; treating "near-restored clinical measures" as a hidden
universal threshold or "very high-speed running" as a hidden universal speed cutoff; using 70/80/95% MSS
as universal higher-speed eligibility or 95% MSS as sufficient by itself; treating QRF-019/024/025 as
universal high-speed clearance authority; granting unrestricted training/play or RTT/RTS; treating
higher-speed tolerance as kicking/cutting/decel/COD/repeated-sprint/fatigue/sport-specific clearance or
one field domain as clearance for another; creating a sprint/running progression schedule, dosage,
sets-or-reps, weekly frequency, rest intervals, intensity targets, duration targets, work-to-rest ratios,
progression increments, return dates, mandatory time windows, exercise selection, a complete field plan,
or a complete rehab plan from RF-FIELD-003; authorizing progression or readiness from prerequisite-capacity
labels alone; bypassing RF-FIELD-001/002, RF-RECUR-001/002, RF-REHAB-001…006, RF-SEV-005, RF-DX-006, or
RF-SAF-006; bypassing safety/capacity/restrictions/stage-readiness/monitoring/schedule/equipment/
sport-context/concurrent-injury because prerequisite capacity appears verified; and treating weak /
unclear / stale / incomplete / unsupervised / self-reported / context-mismatched clinical-measure or
lower-speed-exposure evidence as high-authority readiness evidence.

## 18. This is not clinical approval

Authoring this object grants it no clinical authority. RF-FIELD-003 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 19. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001 … RF-RECUR-002, and RF-FIELD-001 … RF-FIELD-002 objects remain unchanged

Those thirty-one rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history, rehabilitation, recurrence blocks and RF-FIELD-001/002 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 32` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-FIELD-003 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
