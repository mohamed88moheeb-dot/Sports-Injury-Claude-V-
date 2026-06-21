# RF-FIELD-002 — Gate B Draft Rule Object

The second pending, non-executable Gate B Rectus Femoris (RF) **running/sprinting** rule object has
been authored:
[lib/clinical/rf/rules/objects/RF-FIELD-002.json](../../lib/clinical/rf/rules/objects/RF-FIELD-002.json).

It implements the **structure** of RF v1.2 rule **RF-FIELD-002** — "95% maximum sprint speed is not
sufficient alone" (v1.2 §13.3). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-FIELD-002's **"95% MSS is not sufficient alone"
boundary**:

- provenance: `source_spec_rule_id: "RF-FIELD-002"`, `rule_family: "running_sprinting"`, `source_section: "§13.3"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the `metric` (95% of maximum sprint speed) with `metric_role` as one field/
  sprinting data point within a broader readiness model that may contribute to Simulation evidence;
  `raw_media_handling`; `source_quality_handling`;
- `decision_contract` — `ninety_five_percent_mss_role: "may_contribute_to_simulation_evidence_but_cannot_independently_authorize_unrestricted_training_or_competition"`;
  `single_metric_clearance_status`; `readiness_authority_status`; `companion_evidence_requirement`
  (multi-domain Simulation/readiness per V3.1 §14.2/§24); `domain_transfer_status: does_not_clear_any_field_domain_not_directly_tested`;
  plus `false` flags for sufficiency for unrestricted training/play/RTT/RTS, bypass of readiness-tier
  honesty / capacity-to-demand gap / symptom-monitoring-next-day response, clearing kicking/cutting/
  deceleration/COD/repeated-sprint/fatigue/sport-specific, progression schedule, dosage, exercise
  selection, field/rehab plan, RTT/RTS, progression/readiness from 95% MSS alone, bypass of
  RF-FIELD-001 / RF-RECUR-001/002 / RF-REHAB-001…006 / RF-SEV-005 / RF-DX-006, and override of
  safety/capacity/restrictions/stage/readiness/monitoring/schedule/equipment/sport-context/concurrent
  injury; `defers_to_rf_saf_006…: true`; `safety_precedence_preserved: true`; field/readiness objects
  deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §16);
- `prohibited_outputs` (see §17);
- `test_fixtures: ["v1.2-§17-case-22"]`.

## 2. What was NOT authored

- No treatment of 95% MSS as sufficient alone for unrestricted training/play or RTT/RTS clearance; no
  proof of readiness; no single-metric clearance rule.
- No clearing of kicking / cutting / deceleration / change-of-direction / repeated-sprint / fatigue /
  sport-specific exposure, or any untested field domain, from 95% MSS.
- No sprint/running progression schedule; no dosage / sets / reps / weekly frequency / rest intervals /
  intensity / duration / work-to-rest ratios / progression increments / return dates; no exercise
  selection; no complete field plan; no complete rehab plan; no RTT/RTS decision; no progression/
  readiness from 95% MSS alone.
- No bypass of RF-FIELD-001, RF-RECUR-001/002, RF-REHAB-001…006, RF-SEV-005, RF-DX-006, or RF-SAF-006;
  no bypass of safety / capacity / restrictions / stage / readiness / monitoring / schedule / equipment
  / sport-context / concurrent-injury constraints; no bypass of readiness-tier honesty or
  capacity-to-demand gap assessment.
- No field-exposure or readiness engine — only the insufficiency boundary is preserved for later field,
  rehab, and readiness objects.
- No invented architecture references or companion evidence domains (see §4/§8).
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-FIELD-002 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001/002, and RF-FIELD-001
  were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claim were preserved

Copied verbatim from v1.2 §13.3 / the inventory — none invented:

- `architecture_refs`: `V3.1-12` (current capacity & capacity-to-demand gap), `V3.1-14.2` (tiered
  return-to-training & return-to-performance), `V3.1-24` (confidence/evidence/output locks).
- `evidence_claim_ids`: `QRF-025` (E1), preserved only in its multi-domain readiness-restriction role.

## 5. Why this is a mixed-source 95% MSS insufficiency rule

§13.3 is `normative_source: mixed` — an **architecture** requirement (multi-domain readiness, output
locks; V3.1 §§12, 14.2, 24) combined with an **evidence-governed** claim (QRF-025, E1) that bounds what
a single sprint-speed metric can establish.

## 6. What 95% MSS may represent

Per §13.3, reaching 95% MSS **may contribute to Simulation evidence** — it is admissible as one
field/sprinting data point within the broader readiness picture (`metric_role`,
`ninety_five_percent_mss_role`). It earns its place as input, not as a verdict.

## 7. Why 95% MSS is not sufficient alone

§13.3's decision is explicit: 95% MSS "cannot independently authorize unrestricted training or
competition." A single speed number says nothing about safety, the capacity-to-demand gap, other field
domains, symptom/monitoring/next-day response, or sport-specific demands. The object sets all four
`sufficient_alone_for_…: false` flags, `single_metric_clearance_status`, and `readiness_authority_status`,
and blocks treating 95% MSS as sufficient for unrestricted training/play or as RTT/RTS clearance or
readiness proof.

## 8. What companion evidence or readiness context §13.3 requires (exact source wording only)

§13.3 names only that 95% MSS "may contribute to **Simulation evidence**" and cannot "independently
authorize unrestricted training or competition." It does **not** enumerate a specific list of companion
domains. So the object represents the companion-evidence requirement as the **multi-domain Simulation
and readiness model** (V3.1 §14.2 and §24) — `companion_evidence_requirement:
"requires_multi_domain_simulation_and_readiness_evidence_per_v3_1_section_14_2_and_section_24_not_this_metric_alone"`
— **without inventing** additional domain names. (The prohibited-output list does block treating 95% MSS
as clearance for specific domains like kicking/cutting/etc., because the metric cannot clear what it
does not test — this restricts, it does not assert §13.3 requires those specific tests.)

## 9. Why 95% MSS cannot clear another field domain

Tolerance of one exposure domain does not transfer to another (RF-RECUR-002; §13.1). Sprinting fast
does not establish kicking, cutting, deceleration, COD, repeated-sprint, fatigue, or sport-specific
tolerance. The object sets `domain_transfer_status: "does_not_clear_any_field_domain_not_directly_tested"`,
`clears_kicking: false`, `clears_cutting_deceleration_change_of_direction_repeated_sprint_fatigue_or_sport_specific_exposure:
false`, and `tolerance_of_one_field_domain_clears_another: false`.

## 10. Why QRF-025 must not be generalized into clearance authority

QRF-025 (E1) supports the *restriction* (95% MSS is not enough by itself) — it is multi-domain
readiness-restricting evidence, not clearance evidence. Generalizing it into unrestricted-training/play
or RTT/RTS authority would invert its meaning. The object preserves its role in `notes`/`decision_contract`
and blocks any such generalization.

## 11. Why the rule does not create dosage, sprint progression, exercise selection, complete plan, RTT, or RTS

A boundary rule constrains; it does not prescribe. Progression schedules, dosing, exercise selection,
and return decisions belong to separately gated/governed objects (RF-REHAB-004 forbids universal
dosing; V3.1 §§12–14). The object sets `creates_field_progression_plan: false`,
`creates_speed_or_sprint_progression_schedule: false`, `creates_rehab_prescription: false`,
`selects_exercises: false`, `selects_complete_field_plan: false`, `generates_complete_rehab_plan:
false`, and `grants_return_to_training_or_return_to_sport_decision: false`.

## 12. How RF-FIELD-002 relates to RF-FIELD-001

RF-FIELD-001 provides the Aspetar speed milestones (incl. 95% MSS at Simulation) with denominator and
pathway-context limits; RF-FIELD-002 adds the boundary that 95% MSS is *not sufficient alone*.
RF-FIELD-002 does not bypass RF-FIELD-001's denominator/pathway-context limits
(`bypasses_rf_field_001_…: false`, `does_not_override_rf_field_001: true`) — the two rules compose.

## 13. How RF-FIELD-002 relates to RF-RECUR-002 and RF-RECUR-001

It honors RF-RECUR-002's separated, unranked exposure-domain monitoring (no cross-domain clearance) and
does not bypass RF-RECUR-001 prior-injury recurrence handling (both `bypasses_…: false`).

## 14. How RF-FIELD-002 relates to RF-REHAB-001 through RF-REHAB-006

The boundary operates within the gated rehab pipeline, never around it. The object does not bypass the
RF-REHAB-001 prescription-input gate, RF-REHAB-002 loading-dimension constraints, RF-REHAB-003
position-tag limits, RF-REHAB-004 universal-dosage prohibition, RF-REHAB-005 schedule/total-load
reconciliation, or RF-REHAB-006 concurrent-injury constraints (all `bypasses_…: false`).

## 15. How RF-FIELD-002 relates to RF-SEV-005, RF-DX-006, and RF-SAF-006

It does not bypass RF-SEV-005 (reported-fibrosis/scar provenance) or RF-DX-006 (report / MSS-denominator
/ test-context descriptor handling), and it defers to RF-SAF-006 when serious structural / postoperative
/ full-thickness / avulsion / major-retraction / external-restriction descriptors are present
(`defers_to_rf_saf_006…: true`, `does_not_bypass_rf_saf_006: true`).

## 16. `safety_state_output` and `blocked_targets`, and why this follows §13.3 exactly

Reading §13.3 exactly: it states an **insufficiency boundary** (95% MSS cannot independently authorize
unrestricted training or competition) — it does **not** assign any of the eight closed V3.1 §21 safety
states. Per the task's rule, because §13.3 assigns no closed safety state, `safety_state_output` is
`null` and `blocked_targets` is `[]`, and the insufficiency boundary is represented entirely in
`decision_contract`. **No safety state was inferred by analogy.**

## 17. Prohibited outputs

The object's `prohibited_outputs` (59 entries) block, among others: treating 95% MSS as sufficient for
unrestricted training/play, as RTT/RTS clearance, as proof of readiness, or as a single-metric clearance
rule; bypassing readiness-tier honesty, capacity-to-demand gap assessment, or symptom/monitoring/next-day
response because 95% MSS is achieved; treating 95% MSS as kicking/cutting/deceleration/COD/repeated-sprint/
fatigue/sport-specific clearance or one field domain as clearance for another; creating a sprint/running
progression schedule, dosage, sets-or-reps, weekly frequency, rest intervals, intensity targets, duration
targets, work-to-rest ratios, progression increments, return dates, exercise selection, a complete field
plan, or a complete rehab plan from RF-FIELD-002; authorizing progression or readiness from 95% MSS alone;
bypassing RF-FIELD-001 / RF-RECUR-001/002 / RF-REHAB-001…006 / RF-SEV-005 / RF-DX-006 / RF-SAF-006;
bypassing safety/capacity/restrictions/stage-readiness/monitoring/schedule/equipment/sport-context/
concurrent-injury because 95% MSS is achieved; and treating weak / unclear / stale / context-mismatched /
incomplete / single-domain sprint-speed evidence as high-authority readiness evidence.

## 18. This is not clinical approval

Authoring this object grants it no clinical authority. RF-FIELD-002 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 19. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001 … RF-RECUR-002, and RF-FIELD-001 objects remain unchanged

Those thirty rule objects were **not** modified by this task. Their files are byte-for-byte identical
before and after (verified by checksum), so the reconciled safety, diagnosis, severity/prognosis/history,
rehabilitation, recurrence blocks and RF-FIELD-001 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 31` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-FIELD-002 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
