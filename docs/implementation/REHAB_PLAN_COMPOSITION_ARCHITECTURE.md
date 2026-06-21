# Rehab Plan Composition Architecture

**Status:** documentation-only architecture · pending · non-executable · not clinically approved · runtime integration none.

This document defines the intended architecture for future rehab plan composition across the governed clinical knowledge systems. It creates no runtime behavior, no UI behavior, no database behavior, no plan generator, no dosage, no progression authorization, no readiness authorization, no RTT/RTS authority, and no clearance authority.

## 1. Purpose

The platform now has separate draft knowledge systems for clinical rules, Exercise Knowledge, Activity Exposure Knowledge, Assessment Knowledge, Capacity Knowledge, evidence linking, and shared taxonomies. A future rehab plan composer must not collapse those systems into a single "exercise picker." The composer must be a governed assembly layer that can only operate after safety, input completeness, capacity, schedule, equipment, monitoring, and concurrent-injury constraints are satisfied.

This document records the architecture of that future assembly layer so implementation work can happen later without leaking clinical authority into metadata objects.

## 2. Current Knowledge Systems

| System | Current role | Runtime status |
|---|---|---|
| RF clinical rule objects | Draft governance and clinical constraints, including RF-REHAB-001 through RF-REHAB-006 | Non-executable |
| Exercise Knowledge | Draft RF-EX metadata for exercises and drills | Non-executable |
| Activity Exposure Knowledge | Draft RF-ACT metadata for activity/sport/conditioning exposure domains | Non-executable |
| Assessment Knowledge | Draft RF-ASSESS metadata for tests/screens/checks | Non-executable |
| Capacity Knowledge | Draft universal CAP metadata; RF overlays not authored | Non-executable |
| Evidence Linking Knowledge | Draft RF-ASSESS to CAP metadata map | Non-executable |
| Shared Knowledge Taxonomies | Draft vocabularies for functions, blocks, demands, equipment, assessment purposes, and composition | Non-executable |

None of these systems currently generate plans or select interventions for runtime use.

## 3. Composition Boundary

The future composer is an orchestration layer, not a knowledge object and not a clinical rule by itself.

It must not:

- select exercises from diagnosis alone
- select exercises from phase labels alone
- select activity exposure from sport name alone
- create sets, reps, frequency, rest, duration, intensity, distance, speed, percentages, or timelines
- create progression increments
- authorize readiness
- authorize RTT/RTS
- authorize clearance
- ignore safety locks
- ignore missing inputs
- ignore schedule/load conflicts
- ignore concurrent injuries
- silently assume unknown values are normal, safe, absent, negative, or cleared

The composer may only assemble candidate plan structure after future governed rules explicitly permit it.

## 4. Required Prescription Inputs

RF-REHAB-001 defines the minimum input gate for any full RF rehab plan. A future composer must require all of the following before full plan composition:

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

If any are missing, the composer must withhold full plan generation and use governed missing-data actions such as ask again, simplify wording, widen uncertainty, restrict testing, restrict rehabilitation, withhold full plan, or refer externally.

Diagnosis alone never authorizes a full plan.

## 5. Composition Inputs By Knowledge System

| Input type | Source system | Future use |
|---|---|---|
| Safety and contraindication state | RF clinical rules and Assessment Knowledge | Determine whether composition is blocked, restricted, or allowed to continue |
| Capacity profile | Capacity Knowledge plus Assessment-to-Capacity evidence links | Inform what capacities are known, unknown, sufficient, insufficient, or unverified |
| Exercise candidates | Exercise Knowledge | Provide inert candidate exercises and drills after gates permit |
| Activity exposure candidates | Activity Exposure Knowledge | Provide inert exposure domains after gates permit |
| Assessment/check-in candidates | Assessment Knowledge | Provide evidence/check-in items, not clearance by themselves |
| Sport demands | Shared taxonomies and future demand profiles | Translate sport context into demand categories, not direct exercise selection |
| Equipment context | Shared equipment taxonomy and user inputs | Filter feasibility only after safety and governance gates permit |
| Schedule/external load | RF-REHAB-005 future input domain | Reconcile total weekly load and avoid stacking |
| Concurrent injury constraints | RF-REHAB-006 future input domain | Apply the most restrictive active contraindication |

## 6. Plan Block Model

The shared `rehabPlanBlockTaxonomy.json` defines future block types. The composer should treat each block as a container with a named source system and strict prohibited content.

| Block | Pulls from | Must not create |
|---|---|---|
| safety_check | Assessment Knowledge / RF clinical rules | exercise selection, dose, or clearance |
| warm_up_general | Exercise Knowledge | tissue-load decisions or dose |
| warm_up_tissue_specific | Exercise Knowledge | strength dose or clearance |
| mobility_block | Exercise Knowledge | stretching dose or clearance |
| activation_block | Exercise Knowledge | strength dose or clearance |
| tissue_loading_block | Exercise Knowledge | fixed dose, progression, or clearance |
| strength_block | Exercise Knowledge | fixed dose, progression, or clearance |
| support_strength_block | Exercise Knowledge | fixed dose or clearance |
| motor_control_block | Exercise Knowledge | dose or clearance |
| plyometric_block | Exercise Knowledge | readiness signal or clearance |
| running_mechanics_block | Exercise Knowledge | running clearance, speed, or distance |
| sport_mechanics_block | Exercise Knowledge | sport clearance or dose |
| activity_exposure_block | Activity Exposure Knowledge | unrestricted exposure, dose, or clearance |
| conditioning_block | Exercise or Activity Exposure Knowledge | conditioning dose or clearance |
| assessment_gate | Assessment Knowledge | autonomous clearance unless future governed rules authorize it |
| monitoring_check | Assessment Knowledge | progression authority or clearance |
| recovery_block | Exercise Knowledge | dose or clearance |

## 7. Composition Sequence

The shared `rehabCompositionModel.json` defines a structure-only sequence:

1. safety check
2. warm-up
3. mobility or activation
4. tissue-specific loading
5. strength or support strength
6. plyometric or mechanics block if appropriate
7. activity exposure if appropriate
8. assessment or check-in gate if appropriate
9. monitoring instructions

This sequence is not a protocol, not a phase progression, and not dosage. Future rules may omit, restrict, or block any block.

## 8. Gate Order

Future plan composition must respect the following order:

1. Apply safety precedence and red-flag/safety locks.
2. Apply RF-REHAB-001 prescription-input completeness.
3. Apply RF-REHAB-004 no-universal-dosage prohibition.
4. Apply capacity and assessment-evidence constraints.
5. Apply RF-REHAB-002 loading-dimension constraints.
6. Apply RF-REHAB-003 RF-biased position tag only as metadata.
7. Apply restricted-context and high-caution object gates.
8. Apply equipment feasibility constraints.
9. Apply RF-REHAB-005 schedule and total-load reconciliation.
10. Apply RF-REHAB-006 concurrent-injury compatibility.
11. Only then assemble a candidate structure if future approved rules permit.

Any unresolved blocker must result in missing-data action, restriction, withholding, or referral rather than silent plan generation.

## 9. Candidate Selection Policy

Exercise, activity exposure, assessment, and capacity objects are metadata candidates only.

Future candidate filtering may use:

- permitted system
- object status
- approval state
- executable state
- final decision
- manual-review flags
- high-caution flags
- restricted-context tags
- exercise function tags
- movement pattern tags
- contraction tags
- sport demand tags
- equipment tags
- body region and tissue tags
- capacity refs
- assessment evidence links
- monitoring triggers

Candidate filtering still must not create dosage, progression, readiness, RTT/RTS, or clearance.

## 10. High-Caution And Restricted Objects

High-caution and restricted-context objects must not be automatically selected.

They require future clinician-governed handling, especially:

- high-caution RF-EX objects
- manual-review RF-EX objects
- restricted-context RF-EX objects
- RF-ACT exposure objects marked not runtime-selectable
- assessment items with readiness/RTT/RTS purpose
- capacity objects with uncertain goal sufficiency

Unknown is not safe. Draft metadata is not approval.

## 11. Dosage Architecture

No active dosage model exists in this architecture.

A future dosage system, if ever authored, must be separate and governed. It must not be inferred from:

- source examples
- exercise names
- plan block names
- stage labels
- sport names
- capacity labels
- user goals
- object order
- difficulty labels
- user-facing plan-card copy

RF-REHAB-004 requires any active universal RF dose without a separately approved source and version to fail validation.

## 12. Progression Architecture

No progression model exists in this architecture.

Progression cannot be inferred from:

- successful completion of a block
- absence of pain during an activity
- exercise difficulty label
- plan-card category
- schedule compatibility alone
- capacity metadata alone
- assessment metadata alone
- activity exposure metadata alone

Progression would require a separate governed rule layer with explicit safety, capacity, monitoring, schedule, and clinical approval constraints.

## 13. Readiness And Clearance Boundary

Assessment Knowledge may record evidence. Activity Exposure Knowledge may record exposure domains. Capacity Knowledge may record capacity constructs. None of these clear an athlete.

Readiness, return-to-training, return-to-sport, unrestricted practice, match play, sprint clearance, kicking clearance, and competition clearance require separate governed rules that do not exist in this architecture.

## 14. Schedule And Load Reconciliation

RF-REHAB-005 requires future composition to reconcile strength, eccentric exposure, running, sprinting, kicking, matches, conditioning, and concurrent-injury work into one weekly load plan.

This architecture records that requirement only. It does not create a scheduling engine and does not authorize any load.

If schedule or external load data are missing, unknown external load remains unknown and must not be assumed zero.

## 15. Concurrent Injury Reconciliation

RF-REHAB-006 requires future composition to honor the most restrictive active contraindication when secondary, contributing, concurrent, referred, compensatory, or chronic conditions are active.

If no compatible route exists, the future system must withhold the plan and refer. This document does not implement that behavior; it records the architecture requirement.

## 16. Multi-Sport Composition

The composer must be demand-based rather than sport-name-based.

Sport context should map to demand categories such as acceleration, sprinting, kicking, jumping, landing, field movement, court movement, cycling, swimming, or sustained aerobic load. Those demands then inform candidate filtering only after safety, capacity, equipment, schedule, monitoring, and concurrent-injury gates permit.

Sport name alone never selects exercises.

## 17. Future Data Contract Sketch

A future composition request, if implemented later, should be treated as an input contract rather than an executable API in this task. It would require:

- patient/injury context
- safety state and confidence
- diagnosis/injury identity
- stage confidence
- capacity profile
- assessment evidence summary
- activity exposure status
- sport demand profile
- equipment availability
- schedule availability
- external load and competition context
- concurrent injuries and restrictions
- monitoring contract
- missing-data handling decision

This sketch is documentation only. No schema, API, database table, UI, or runtime function is created here.

## 18. Example Non-Executable Composition Skeleton

The following is an illustrative shape only:

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

It is not a plan and not a template for runtime generation. It contains no exercises, no dosage, no schedule, no progression, and no clearance.

## 19. Explicit Non-Changes

This architecture task does not:

- modify RF-EX objects
- modify RF-ACT objects
- modify RF-ASSESS objects
- modify CAP objects
- modify RF clinical rule objects
- modify schemas
- modify validators
- modify package scripts
- modify UI
- modify Supabase
- modify RecoveryContext
- modify injuryEngine
- modify legacy modules
- create runtime imports
- create database tables
- create plan-generation logic

## 20. Verification Requirements

Completion of this documentation task requires:

- this document to exist
- no runtime/UI/database behavior created
- no schema or object mutation required
- existing validators/checks passing
- scope verification reported

## 21. Final Architecture Verdict

The Rehab Plan Composition Architecture is documented as a future governed orchestration model only.

It is safe to proceed to later design tasks for demand profiles, composition schemas, or rule-engine interfaces only if those tasks remain governed and preserve the boundaries in this document.
