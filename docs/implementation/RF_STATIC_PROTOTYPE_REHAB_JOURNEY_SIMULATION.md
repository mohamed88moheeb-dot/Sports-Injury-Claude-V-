# RF Static Prototype Rehab Journey Simulation

**Status:** documentation-only static simulation / pending / non-executable / not clinically approved / runtime integration none.

## 1. Purpose

This document simulates how a future Rectus Femoris (RF) rehab journey could be assembled across the governed knowledge systems without creating runtime behavior. It is a paper prototype only. It documents expected gate order, boundary handling, missing-data behavior, and candidate-block structure so future implementation work can be audited before any runtime composer exists.

This simulation does not generate a rehab plan. It does not prescribe exercises. It does not create dosage, progression, readiness, return-to-training, return-to-sport, or clearance authority.

## 2. Scope

In scope:

- static journey narrative for one fictional RF case
- structure-only composition walkthrough
- RF-REHAB-001 through RF-REHAB-006 gate behavior
- interaction between Exercise Knowledge, Activity Exposure Knowledge, Assessment Knowledge, Capacity Knowledge, Evidence Linking Knowledge, shared taxonomies, and RF clinical rules
- missing-data, restricted-context, high-caution, and concurrent-injury branches
- explicit non-runtime verification criteria

Out of scope:

- runtime plan generation
- UI or app flow
- database tables
- Supabase changes
- RecoveryContext changes
- injuryEngine changes
- legacy module changes
- schema changes
- validator changes
- object authoring or object migration
- RF-EX, RF-ACT, RF-ASSESS, CAP, evidence-link, taxonomy, or RF rule edits

## 3. Current Knowledge-System State Used By The Simulation

The simulation assumes the current frozen draft metadata state:

| System | Current state used here | Authority in this simulation |
|---|---|---|
| RF clinical rule objects | 38 draft pending rules, including RF-REHAB-001 through RF-REHAB-006 | Governance references only |
| Exercise Knowledge | 107 RF-EX draft objects | Candidate exercise/drill metadata only |
| Activity Exposure Knowledge | 12 RF-ACT draft objects | Candidate activity-exposure metadata only |
| Assessment Knowledge | 18 RF-ASSESS draft objects | Evidence/check-in metadata only |
| Capacity Knowledge | 15 universal CAP objects, 0 RF-CAP overlays | Capacity vocabulary only |
| Evidence Linking Knowledge | 1 RF-ASSESS to CAP map with 26 links | Evidence relationship metadata only |
| Shared Knowledge Taxonomies | 10 shared taxonomy files | Vocabulary only |

All systems remain pending, not clinically approved, non-executable, and runtime-disconnected.

## 4. Governing Architecture References

This static simulation follows:

- `docs/implementation/REHAB_PLAN_COMPOSITION_ARCHITECTURE.md`
- `docs/implementation/KNOWLEDGE_SYSTEMS_ONTOLOGY_AND_REHAB_COMPOSITION_MODEL.md`
- `docs/implementation/RF_EXERCISE_LIBRARY_OVERLAP_AND_BOUNDARY_REVIEW.md`
- RF-REHAB-001: full plan requires the complete prescription-input set; diagnosis alone never authorizes a full plan
- RF-REHAB-002: loading dimensions are ontology metadata, not universal order or dosage
- RF-REHAB-003: RF-biased position tag is metadata only
- RF-REHAB-004: no universal RF dosage
- RF-REHAB-005: schedule and total-load reconciliation is required before any future full plan
- RF-REHAB-006: concurrent-injury constraints govern; if no compatible route exists, the future state is terminal `REHAB_BLOCKED` withhold and refer

## 5. Fictional Prototype Case

The simulated case is intentionally incomplete:

- injury identity: suspected RF strain context
- safety state: not fully established in this simulation
- stage confidence: incomplete
- capacity profile: partial and unapproved
- sport demand profile: field sport with sprinting and kicking demands
- equipment context: unknown
- schedule and external load: unknown
- concurrent injuries: unknown
- monitoring contract: not complete

This incomplete setup is deliberate. It proves the system does not silently convert diagnosis or sport context into a full rehab plan.

## 6. Journey Map Overview

The static journey is:

1. intake and safety posture
2. RF-REHAB-001 prescription-input gate
3. assessment evidence and capacity context
4. demand and equipment context
5. candidate block skeleton
6. Exercise Knowledge candidate boundary check
7. Activity Exposure boundary check
8. high-caution and restricted-context handling
9. schedule and total-load reconciliation branch
10. concurrent-injury branch
11. monitoring and next-day response loop
12. static output verdict

The journey is a governance trace, not a care pathway.

## 7. Step 1 - Intake And Safety Posture

The future composer must first determine whether safety rules or safety-confidence locks prevent plan composition.

Static simulated behavior:

- RF clinical rules are consulted as governance references only.
- Assessment Knowledge can identify possible safety or diagnostic evidence items.
- Missing safety confidence remains missing.
- Unknown is not treated as normal, negative, safe, or clear.

Static result:

```text
journey_state: safety_context_incomplete
full_plan_status: withheld
allowed_action: governed_missing_data_action
runtime_action_created: false
```

## 8. Step 2 - RF-REHAB-001 Prescription-Input Gate

RF-REHAB-001 requires the complete prescription-input set before a full RF rehab plan can be generated:

- injury identity
- live safety state
- safety confidence
- stage confidence
- current capacity
- demand profile
- equipment
- schedule
- concurrent injuries
- monitoring contract
- missing-input actions

Static simulated behavior:

- Injury identity alone is insufficient.
- Sport demand alone is insufficient.
- Candidate RF-EX availability is insufficient.
- Candidate RF-ACT availability is insufficient.
- Partial assessment evidence is insufficient.

Static result:

```text
journey_state: required_inputs_missing
full_plan_status: withheld
permitted_response: ask_again / simplify_wording / widen_uncertainty / restrict_testing / restrict_rehabilitation / withhold_full_plan / refer_externally
silent_assumption_allowed: false
```

## 9. Step 3 - Assessment Evidence And Capacity Context

Assessment Knowledge can provide context about evidence that may inform universal capacity objects through Evidence Linking Knowledge.

Static simulated behavior:

- RF-ASSESS objects remain evidence metadata only.
- CAP objects remain capacity vocabulary only.
- Evidence links do not create thresholds, pass/fail status, readiness, progression, or clearance.
- RF-ASSESS-001 and RF-ASSESS-002 remain context-only.
- High-caution RF-ASSESS items remain reviewer-gated.

Static result:

```text
capacity_context: partial_metadata_only
assessment_authority: evidence_only
capacity_authority: vocabulary_only
readiness_authority_created: false
clearance_authority_created: false
```

## 10. Step 4 - Demand And Equipment Context

Shared taxonomies can map sport context into demand categories, but sport name does not select exercises.

Static simulated behavior:

- Sprinting and kicking are demand categories, not permissions.
- Equipment unknown remains unknown.
- A future feasibility filter could use equipment metadata only after gates permit.
- Demand profile cannot bypass safety, capacity, schedule, or concurrent-injury gates.

Static result:

```text
demand_context: field_sport_demands_identified_as_metadata
equipment_context: incomplete
candidate_filtering_status: not_authorized_for_runtime
```

## 11. Step 5 - Candidate Block Skeleton

If future approved rules eventually permit structure assembly, the skeleton could follow the documented composition architecture:

```text
safety_check
warm_up_general
mobility_or_activation
tissue_specific_loading
strength_or_support_strength
mechanics_or_plyometric_if_permitted
activity_exposure_if_permitted
assessment_or_monitoring_check
monitoring_instructions
```

In this static simulation, the skeleton is not instantiated into a plan. It contains no selected intervention list and no active instructions.

## 12. Step 6 - Exercise Knowledge Candidate Boundary Check

Exercise Knowledge can contribute true exercises and drills only as metadata candidates.

Static candidate categories may include:

- warm-up metadata
- mobility metadata
- activation metadata
- tissue-specific loading metadata
- support strength metadata
- motor-control metadata
- running-mechanics drill metadata
- sport-mechanics drill metadata

Boundary handling:

- Restricted-context RF-EX objects stay restricted.
- Manual-review RF-EX objects stay reviewer-gated.
- High-caution RF-EX objects are not automatically selected.
- Overlap-review targets such as RF-EX-022, RF-EX-023, RF-EX-024, RF-EX-051, RF-EX-060, RF-EX-068, RF-EX-070, RF-EX-071, and RF-EX-076 remain documentation-only review targets.

Static result:

```text
exercise_candidates_seen: metadata_only
exercise_candidates_selected: none
restricted_objects_auto_selected: false
manual_review_objects_auto_selected: false
```

## 13. Step 7 - Activity Exposure Boundary Check

Activity Exposure Knowledge represents activity, sport, and conditioning exposure domains only.

Static candidate exposure domains may include:

- jogging, running, high-speed running, and sprinting exposure metadata
- kicking exposure metadata
- conditioning exposure metadata
- team or game-based exposure metadata

Boundary handling:

- RF-ACT objects are not exercises.
- RF-ACT objects are not prescriptions.
- RF-ACT objects are not runtime-selectable.
- RF-ACT objects do not authorize return to running, training, sport, sprinting, kicking, team practice, or match play.
- RF-EX objects with RF-ACT counterparts require future cross-reference policy before any product behavior.

Static result:

```text
activity_exposure_candidates_seen: metadata_only
activity_exposure_candidates_selected: none
return_authority_created: false
```

## 14. Step 8 - High-Caution And Restricted-Context Branch

When a candidate object is high-caution, restricted-context, hold-for-review, or manual-review-only, the future composer must not silently include it.

Static branch behavior:

```text
if candidate.manual_review_required == true:
  candidate_status = reviewer_gated_metadata_only

if candidate.library_classification == high_caution_sport_specific_exposure:
  candidate_status = reviewer_gated_metadata_only

if candidate.final_decision == hold_for_review:
  candidate_status = no_action_now

if candidate.has_restricted_context == true:
  candidate_status = restricted_context_only
```

This pseudocode is explanatory text only. It is not an implementation and is not wired into runtime.

## 15. Step 9 - Schedule And Total-Load Branch

RF-REHAB-005 requires schedule and total-load reconciliation before a future full plan can proceed.

Static simulated behavior:

- Unknown external training load stays unknown.
- Unknown match or practice load stays unknown.
- Unknown conditioning load stays unknown.
- Unknown concurrent-injury work stays unknown.
- Schedule compatibility alone does not authorize progression, readiness, or clearance.

Static result:

```text
schedule_context: incomplete
total_load_context: incomplete
full_plan_status: withheld
silent_zero_load_assumption_allowed: false
```

## 16. Step 10 - Concurrent-Injury Branch

RF-REHAB-006 requires active concurrent-injury constraints to govern. The most restrictive active constraint wins.

Static simulated behavior:

- Unknown concurrent injury status is not treated as absent.
- Unknown compatibility is not treated as compatible.
- RF rehab is not prioritized over a more restrictive active constraint.
- If no compatible route exists, the future terminal state is `REHAB_BLOCKED` withhold and refer.

Static result:

```text
concurrent_injury_context: incomplete
compatibility_status: unknown
terminal_state_if_no_compatible_route: REHAB_BLOCKED
full_plan_status: withheld
```

## 17. Step 11 - Monitoring And Next-Day Response Loop

Monitoring and next-day response items can exist as assessment metadata, but they do not authorize progression.

Static simulated behavior:

- Monitoring prompts remain metadata only.
- Next-day response checks remain evidence only.
- A favorable response is not readiness.
- An unfavorable or unknown response is not ignored.
- No automatic plan adjustment is created.

Static result:

```text
monitoring_context: incomplete
next_day_response_authority: evidence_only
automatic_progression_created: false
```

## 18. Static Output Example

For the fictional incomplete case, the only safe static output is:

```text
RF static prototype output:
  full_plan: withheld
  reason: required prescription inputs incomplete
  structure_preview: allowed as documentation-only skeleton
  candidate_objects: metadata only, none selected
  activity_exposures: metadata only, none selected
  assessments: evidence only, no clearance
  capacities: vocabulary only, no sufficiency decision
  schedule: incomplete, no load assumption
  concurrent_injury: incomplete, no compatibility assumption
  runtime_behavior_created: false
```

This output is not a patient instruction and not a plan card.

## 19. What This Simulation Refuses To Do

The simulation refuses to:

- generate a full RF rehab plan
- select exercises for a user
- select activity exposure for a user
- prescribe sets, repetitions, frequency, duration, rest, distance, speed, intensity, percentages, dates, or timelines
- create a progression increment
- decide readiness
- authorize return to training
- authorize return to sport
- authorize sprint clearance
- authorize kicking clearance
- authorize match play or competition
- infer safety from missing data
- infer capacity sufficiency from object metadata
- infer equipment availability
- infer external load is zero
- infer no concurrent injury
- convert assessment evidence into clearance
- convert activity exposure metadata into permission
- convert RF-biased position tags into superiority, eligibility, or dosage

## 20. Future Systems Required Before Runtime

Runtime plan composition would require separate governed future work, including:

- approved rule authority for plan composition
- approved safety-state handling
- approved missing-data workflow
- approved demand-profile system
- approved equipment and feasibility handling
- approved schedule and total-load reconciliation
- approved concurrent-injury compatibility handling
- approved monitoring contract behavior
- approved progression rules, if ever created
- approved readiness and clearance rules, if ever created
- separate validation and boundary checks for any executable implementation

None of those systems is created here.

## 21. Static Verification Checklist

This document satisfies the static simulation objective only if:

- the simulation document exists
- it is documentation-only
- it creates no runtime behavior
- it creates no UI behavior
- it creates no database behavior
- it changes no clinical objects
- it changes no schemas
- it changes no validators
- it creates no prescription logic
- it creates no dosage logic
- it creates no progression logic
- it creates no readiness logic
- it creates no RTT/RTS logic
- it creates no clearance logic
- existing validators and boundary checks pass
- final scope verification is reported

## 22. Explicit Non-Changes

This task does not modify:

- RF-EX objects
- RF-ACT objects
- RF-ASSESS objects
- CAP objects
- evidence-linking objects
- shared taxonomy files
- RF clinical rule objects
- schemas
- templates
- validators
- package scripts
- runtime code
- UI code
- Supabase code
- RecoveryContext code
- injuryEngine code
- legacy modules

## 23. Final Static Simulation Verdict

The static RF prototype rehab journey is documented as a governance trace only.

The simulated case correctly ends with full plan withheld because required prescription inputs are incomplete, schedule and concurrent-injury context are unknown, and no future approved runtime composer exists. The document is safe to use as an audit artifact for future architecture planning, but it is not clinical approval and not implementation authority.
