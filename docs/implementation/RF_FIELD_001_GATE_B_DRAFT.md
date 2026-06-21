# RF-FIELD-001 — Gate B Draft Rule Object

The first pending, non-executable Gate B Rectus Femoris (RF) **running/sprinting** rule object has
been authored:
[lib/clinical/rf/rules/objects/RF-FIELD-001.json](../../lib/clinical/rf/rules/objects/RF-FIELD-001.json).

It implements the **structure** of RF v1.2 rule **RF-FIELD-001** — "Aspetar speed milestones" (v1.2
§13.2). It is a draft only, and the first rule of the field block.

## 1. What was authored

A single machine-readable rule object expressing RF-FIELD-001's **speed-milestone reference
structure**:

- provenance: `source_spec_rule_id: "RF-FIELD-001"`, `rule_family: "running_sprinting"`, `source_section: "§13.2"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the §13.2 reference milestones (`at_least_70`, `at_least_80`, `at_least_95`
  percent of maximum sprint speed) mapped to their `pathway_phase_exit_context` (Accumulation,
  Transition, Simulation); `milestone_role: pathway_specific_reference_milestones_only`;
  `mss_denominator_quality_required`; `pathway_context_requirement`; `population_context_requirement`;
  `raw_media_handling`; `source_quality_handling`;
- `decision_contract` — `speed_milestone_reference_status`; `qrf_024_role:
  conditional_pathway_milestone_reference_evidence_only`; `usable_only_with_valid_mss_denominator: true`;
  `universal_threshold_status: milestones_are_not_universal_mandatory_thresholds`;
  `readiness_authority_status: speed_milestone_achievement_is_not_proof_of_readiness`;
  `tolerance_of_one_field_domain_clears_another: false`,
  `running_or_sprinting_tolerance_clears_kicking: false`; plus `false` flags for unrestricted
  training/play, field/speed/sprint progression, dosage, exercise selection, field/rehab plan,
  RTT/RTS, progression/readiness from a milestone alone, bypass of RF-RECUR-001/002 / RF-REHAB-001…006
  / RF-SEV-005 / RF-DX-006, and override of safety/capacity/restrictions/stage/readiness/monitoring/
  schedule/equipment/sport-context/concurrent injury; `defers_to_rf_saf_006…: true`;
  `safety_precedence_preserved: true`; field/rehab/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §16);
- `prohibited_outputs` (see §17);
- `test_fixtures: ["v1.2-§17-case-22"]`.

## 2. What was NOT authored

- No universal mandatory thresholds; no readiness proof; no unrestricted training/play grant from any
  milestone; no RTT or RTS decision or progression authorization from a milestone alone.
- No use of milestones with an unknown / unreliable / self-estimated-without-validation / stale /
  context-mismatched denominator.
- No clearing of one field domain by another (running/sprinting tolerance does not clear kicking).
- No speed/sprint progression schedule; no dosage / sets / reps / weekly frequency / rest intervals /
  intensity / duration / work-to-rest ratios / progression increments / return dates; no exercise
  selection; no complete field plan; no complete rehab plan.
- No bypass of RF-RECUR-001/002, RF-REHAB-001…006, RF-SEV-005, RF-DX-006, or RF-SAF-006; no bypass of
  safety / capacity / restrictions / stage / readiness / monitoring / schedule / equipment /
  sport-context / concurrent-injury constraints.
- No field-exposure engine — only the speed-milestone reference structure is preserved for later
  field, rehab, and readiness objects.
- No invented architecture references (see §5).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-FIELD-001 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, and RF-RECUR-001/002 were consulted
  as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which evidence claim was preserved

Copied verbatim from v1.2 §13.2 / the inventory — none invented:

- `evidence_claim_ids`: `QRF-024` (E1), preserved as **conditional pathway-milestone reference
  evidence only**. The grade and role are recorded in `notes` / `decision_contract`.

## 5. Why architecture references are intentionally empty

RF-FIELD-001 is a **clinical-content** rule. Per v1.2 §4.3, clinical-content rules **cite valid
`evidence_claim_ids`** and **do not** carry architecture references; the §13.2 source lists none.
`architecture_refs: []` therefore means "none in source," not "missing," and **no architecture
references were invented**.

## 6. Why this is a clinical-content speed-milestone reference rule

The content is a clinical/expert observation (Aspetar phase-exit milestones), not an architecture
contract. Its authority comes from a graded evidence claim (QRF-024, E1) bounded by denominator and
context conditions — hence clinical-content with no architecture refs.

## 7. Which pathway milestones were preserved

Per §13.2, exactly: **≥70% MSS → Accumulation**, **≥80% MSS → Transition**, **≥95% MSS → Simulation**
(Aspetar phase-exit criteria), encoded in `input_contract.reference_milestones_percent_of_maximum_sprint_speed`
and `pathway_phase_exit_context`.

## 8. Why MSS denominator quality is required

A percentage is only meaningful relative to a *valid* maximum-sprint-speed denominator. §13.2 permits
the milestones "only when the athlete's maximum sprint speed denominator is valid" and prohibits use
"with an unknown or unreliable denominator." The object sets `mss_denominator_quality_required: true`,
`usable_only_with_valid_mss_denominator: true`, and blocks use when the denominator is unknown /
unreliable / self-estimated-without-validation / stale.

## 9. Why population/pathway similarity is required

These are *pathway-specific expert criteria*; applying them to a dissimilar athlete/context overstates
their authority. §13.2 permits use "only when the context is sufficiently similar." The object sets
`pathway_context_requirement` and `population_context_limits_preserved: true`, and blocks use when the
athlete context is not sufficiently similar to the pathway context.

## 10. Why the milestones are not universal mandatory thresholds

§13.2's prohibited use is explicit: not "universal mandatory thresholds." They are reference phase-exit
criteria within one pathway, not a hard gate every RF athlete must hit. The object sets
`universal_threshold_status: milestones_are_not_universal_mandatory_thresholds` and blocks treating
70 / 80 / 95% MSS as universal mandatory thresholds.

## 11. Why speed milestone achievement is not proof of readiness

§13.2 prohibits using the milestones as "proof of readiness," and RF-FIELD-002 (95% MSS not sufficient
alone) and the multi-domain readiness model (V3.1 §14) reinforce this. Hitting a speed number says
nothing by itself about safety, capacity, kicking tolerance, or other domains. The object sets
`readiness_authority_status: speed_milestone_achievement_is_not_proof_of_readiness`,
`uses_speed_milestone_alone_as_readiness: false`, and blocks readiness/clearance/progression from a
milestone alone.

## 12. Why the rule does not create dosage, field progression, exercise selection, complete plan, RTT, or RTS

A reference milestone marks a checkpoint; it does not author how to train toward it or what happens
after — those belong to separately gated/governed objects (RF-REHAB-004 forbids universal dosing;
V3.1 §§12–14). The object sets `creates_field_progression_plan: false`,
`creates_speed_or_sprint_progression_schedule: false`, `creates_rehab_prescription: false`,
`selects_exercises: false`, `selects_complete_field_plan: false`, `generates_complete_rehab_plan:
false`, and `grants_return_to_training_or_return_to_sport_decision: false`, and blocks the
corresponding outputs (including work-to-rest ratios, which RF-FIELD-005 separately prohibits as RF
dosing).

## 13. How RF-FIELD-001 relates to RF-RECUR-002 and RF-RECUR-001

- **RF-RECUR-002** keeps recurrence-sensitive exposure domains separate and unranked. RF-FIELD-001
  honors that: running/sprinting tolerance does not clear kicking, and tolerance of one field domain
  does not clear another (`bypasses_rf_recur_002_…: false`).
- **RF-RECUR-001** governs prior-injury recurrence handling; RF-FIELD-001 does not bypass it
  (`bypasses_rf_recur_001_…: false`).

## 14. How RF-FIELD-001 relates to RF-REHAB-001 through RF-REHAB-006

Speed-milestone reference is used within the gated rehab pipeline, never around it. The object does
not bypass the RF-REHAB-001 prescription-input gate, RF-REHAB-002 loading-dimension constraints,
RF-REHAB-003 position-tag limits, RF-REHAB-004 universal-dosage prohibition, RF-REHAB-005 schedule/
total-load reconciliation, or RF-REHAB-006 concurrent-injury constraints (all `bypasses_…: false`).

## 15. How RF-FIELD-001 relates to RF-SEV-005, RF-DX-006, and RF-SAF-006

It does not bypass RF-SEV-005 (reported-fibrosis/scar provenance) or RF-DX-006 (report/denominator
descriptor handling), and it defers to RF-SAF-006 when serious structural / postoperative /
full-thickness / avulsion / major-retraction / external-restriction descriptors are present
(`defers_to_rf_saf_006…: true`, `does_not_bypass_rf_saf_006: true`).

## 16. `safety_state_output` and `blocked_targets`, and why this follows §13.2 exactly

Reading §13.2 exactly: it describes **reference milestones** with permitted/prohibited-use conditions —
it does **not** assign any of the eight closed V3.1 §21 safety states. Per the task's rule, because
§13.2 assigns no closed safety state, `safety_state_output` is `null` and `blocked_targets` is `[]`,
and the speed-milestone limits are represented entirely in `decision_contract`. **No safety state was
inferred by analogy** (any structural-restriction block is owned by RF-SAF-006).

## 17. Prohibited outputs

The object's `prohibited_outputs` (57 entries) block, among others: treating 70 / 80 / 95% MSS as
universal mandatory thresholds; treating speed milestones as proof of readiness; using milestones with
an unknown / unreliable / self-estimated-without-validation / stale / context-mismatched denominator;
granting unrestricted training or play from any milestone; producing an RTT/RTS decision or authorizing
progression or readiness from milestone achievement alone; treating running/sprinting tolerance as
kicking clearance or one field domain as clearance for another; creating a speed/sprint progression
schedule, dosage, sets-or-reps, weekly frequency, rest intervals, intensity targets, duration targets,
work-to-rest ratios, progression increments, return dates, exercise selection, a complete field plan,
or a complete rehab plan from RF-FIELD-001; bypassing RF-RECUR-001/002, RF-REHAB-001…006, RF-SEV-005,
RF-DX-006, or RF-SAF-006; bypassing safety/capacity/restrictions/stage-readiness/monitoring/schedule/
equipment/sport-context/concurrent-injury because a milestone is achieved; and treating weak / unclear
/ stale / self-estimated / context-mismatched / incomplete speed data as high-authority readiness
evidence.

## 18. This is not clinical approval

Authoring this object grants it no clinical authority. RF-FIELD-001 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 19. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, and RF-RECUR-001 … RF-RECUR-002 objects remain unchanged

Those twenty-nine rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history, rehabilitation, and recurrence blocks still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 30` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-FIELD-001 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
