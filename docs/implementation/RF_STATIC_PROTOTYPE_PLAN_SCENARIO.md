# RF Static Prototype Plan Scenario

**Status:** documentation-only static prototype / pending / non-executable / not clinically approved / runtime integration none.

## 1. Purpose

This document shows a complete fictional Rectus Femoris (RF) prototype plan scenario using the governed knowledge architecture. It demonstrates what a future user-facing plan experience could look like after complete inputs are supplied, while preserving the current boundary that no runtime plan composer exists.

The scenario includes:

- fictional complete inputs
- capacity summary
- plan block structure
- sample user-facing cards
- sample logging screen
- conservative adjustment examples
- verification and scope notes

This is not a clinical plan, not a prescription, not a runtime specification, and not clinical approval.

## 2. Non-Executable Boundary

This static scenario creates no:

- runtime behavior
- UI behavior
- database behavior
- Supabase behavior
- RecoveryContext behavior
- injuryEngine behavior
- legacy-module behavior
- object authoring
- object migration
- schema change
- validator change
- package script change
- dosage model
- progression model
- readiness model
- return-to-training model
- return-to-sport model
- clearance model

All sample cards, screens, and adjustment examples are paper-prototype content only.

## 3. Governing References

This scenario is subordinate to:

- `docs/implementation/REHAB_PLAN_COMPOSITION_ARCHITECTURE.md`
- `docs/implementation/RF_STATIC_PROTOTYPE_REHAB_JOURNEY_SIMULATION.md`
- `docs/implementation/KNOWLEDGE_SYSTEMS_ONTOLOGY_AND_REHAB_COMPOSITION_MODEL.md`
- `docs/implementation/RF_EXERCISE_USER_FACING_PLAN_CARD_METADATA_ARCHITECTURE.md`
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_SCHEMA_V2_1_USER_FACING_PLAN_CARD_METADATA.md`
- `docs/implementation/RF_EXERCISE_LIBRARY_OVERLAP_AND_BOUNDARY_REVIEW.md`
- RF-REHAB-001 through RF-REHAB-006 draft rule objects

The scenario does not override those documents. If this scenario appears to conflict with a governed rule or boundary, the governed rule or boundary wins.

## 4. Current Knowledge State

The scenario references current draft metadata only:

| System | Current state | Scenario use |
|---|---|---|
| RF clinical rules | 38 draft objects | Gate and boundary references |
| Exercise Knowledge | 107 RF-EX objects | Sample card metadata |
| Activity Exposure Knowledge | 12 RF-ACT objects | Exposure boundary examples |
| Assessment Knowledge | 18 RF-ASSESS objects | Evidence and logging examples |
| Capacity Knowledge | 15 universal CAP objects, 0 RF-CAP overlays | Capacity summary labels |
| Evidence Linking Knowledge | 1 map, 26 links | Assessment-to-capacity trace |
| Shared taxonomies | 10 files | Vocabulary for blocks and demands |

All referenced systems remain pending, not approved, non-executable, and runtime-disconnected.

## 5. Fictional Complete Inputs

The following input set is fictional. It is complete for the purpose of demonstrating a static prototype, not for treating a real person.

| Required input | Fictional scenario value | Governance note |
|---|---|---|
| Injury identity | RF strain context recorded by the fictional intake | Does not authorize a plan alone |
| Live safety state | No active red-flag lock recorded in the fictional scenario | Not a real safety decision |
| Safety confidence | Fictional clinician-reviewed confidence present | Not clinical approval |
| Stage confidence | Fictional early controlled-loading context present | Not a phase protocol |
| Current capacity | Qualitative capacity summary present | Not a threshold or pass/fail result |
| Demand profile | Field sport with acceleration, running, kicking, landing, and conditioning demands | Sport name does not select exercises |
| Equipment | Home floor space, wall, chair, step, and optional band are documented | Feasibility metadata only |
| Schedule | Fictional clinician-managed training windows are documented | No scheduling engine created |
| Concurrent injuries | Fictional screen records no active competing restriction | Unknown would block or restrict |
| Monitoring contract | Same-session and next-day response logging are documented | Logging does not progress or clear |
| Missing-input actions | Ask again, restrict, withhold, or refer remain available | Unknown is never assumed safe |

Static gate outcome:

```text
input_completeness: complete_for_static_demo
safety_lock: none_in_fictional_scenario
plan_authority: documentation_only
runtime_plan_created: false
clinical_approval_created: false
```

## 6. Fictional Capacity Summary

This is a scenario-facing capacity summary. It does not mutate CAP objects and does not create goal sufficiency rules.

| Capacity | Fictional scenario state | Use in static plan blocks |
|---|---|---|
| `CAP-001` walking_tolerance | Known enough for ordinary daily walking context | Allows walking to remain background context only |
| `CAP-002` stairs_tolerance | Known enough for cautious daily stair context | Informs step-related caution language |
| `CAP-003` jogging_tolerance | Not treated as established | Running exposure remains withheld |
| `CAP-004` running_tolerance | Not treated as established | Running exposure remains withheld |
| `CAP-005` sprinting_tolerance | Not established | Sprinting is not included |
| `CAP-006` acceleration_tolerance | Not established | Acceleration is not included |
| `CAP-007` kicking_tolerance | Not established | Kicking exposure is not included |
| `CAP-010` anterior_thigh_tissue_load_tolerance | Fictionally adequate for low-demand metadata examples | Does not authorize dose |
| `CAP-011` isometric_strength_capacity | Fictionally adequate for low-demand activation examples | Does not authorize progression |
| `CAP-012` eccentric_strength_capacity | Not established for this scenario | Eccentric high-caution work remains out |

Assessment evidence examples that could inform the summary:

- `RF-ASSESS-003` walking_tolerance_check
- `RF-ASSESS-004` stairs_tolerance_check
- `RF-ASSESS-010` isometric_strength_capacity_check
- `RF-ASSESS-017` next_day_response_check

These remain evidence references only. They do not create readiness, pass/fail status, or clearance.

## 7. Static Plan Block Overview

The following block structure is a prototype display surface. It is not a generated plan and not a prescription.

| Block | Static scenario content | Source system | Boundary |
|---|---|---|---|
| Safety check | "No new warning signs reported in this fictional scenario" | RF rules / Assessment Knowledge | Does not clear participation |
| Warm-up general | Gentle whole-body preparation placeholder | Exercise Knowledge | No dosage or intensity |
| Mobility or activation | Heel slides, comfortable thigh mobility, quad set | Exercise Knowledge | Metadata display only |
| Tissue-specific loading | Short-arc knee extension | Exercise Knowledge | No load or progression |
| Strength or support strength | Single-leg balance reach | Exercise Knowledge | Control-focused, no progression |
| Mechanics or plyometric | Withheld in this scenario | Exercise Knowledge | Higher-demand items need review |
| Activity exposure | Withheld in this scenario | Activity Exposure Knowledge | No running, sprinting, or kicking authority |
| Assessment or monitoring check | Same-session response and next-day response prompt | Assessment Knowledge | Evidence only |
| Monitoring instructions | Record completion, symptom response, difficulty, confidence, and notes | Future logging surface | No automatic adjustment |

## 8. Static Plan Block Detail

### Safety Check

Display copy:

```text
Before starting, confirm the fictional scenario has no new warning signs and no new competing restriction.
If anything is uncertain, the static scenario withholds the plan and asks for review.
```

Governance:

- no diagnosis-alone plan
- no safety inference from unknowns
- no clearance

### Mobility Or Activation

Static card examples:

- `RF-EX-089` Heel slides
- `RF-EX-090` Comfortable thigh mobility
- `RF-EX-088` Quad set

Governance:

- first-safe metadata examples only
- no sets, repetitions, frequency, duration, rest, intensity, or timeline
- no progression based on comfort alone

### Tissue-Specific Loading

Static card example:

- `RF-EX-091` Short-arc knee extension

Governance:

- controlled loading metadata only
- no load prescription
- no strength target

### Strength Or Support Strength

Static card example:

- `RF-EX-092` Single-leg balance reach

Governance:

- support-control metadata only
- no readiness implication
- no return-to-running implication

### Withheld Higher-Demand Blocks

Static examples deliberately not included:

- `RF-EX-051` acceleration mechanics drill
- `RF-EX-057` step bilateral landing
- `RF-EX-060` plyometric jump
- `RF-EX-068` resisted kicking exposure
- `RF-EX-070` game-based kicking scenario exposure
- `RF-EX-076` sprinting exposure
- `RF-ACT-001` short-distance running exposure
- `RF-ACT-004` static isolated kicking exposure
- `RF-ACT-006` resisted kicking exposure

Reason:

- high-caution or boundary-sensitive
- activity exposure rather than true exercise in several cases
- no readiness, return-to-training, return-to-sport, sprinting, kicking, or match-play authority exists

## 9. Sample User-Facing Cards

These are static prototype cards. They show possible future copy style only and do not modify RF-EX objects.

### Card A - Heel Slides

```text
Title: Heel slides
Category: Mobility
Why it is here: Gently explore comfortable knee movement while keeping the front of the thigh calm.
Setup: Lie or sit in a comfortable position with the heel able to slide.
How to do it:
- Slide the heel only through a comfortable range.
- Keep the movement smooth.
- Stop before the front of the thigh feels guarded or sharp.
Common mistakes:
- Forcing the range.
- Moving quickly to chase more motion.
- Ignoring a rising symptom response.
Safety note: This card is not a test and does not decide readiness.
Log prompts: completed, symptom response, difficulty feel, confidence feel, notes.
```

Static source reference: `RF-EX-089`.

### Card B - Quad Set

```text
Title: Quad set
Category: Activation
Why it is here: Practice a gentle thigh muscle squeeze without changing position much.
Setup: Rest with the leg supported and the knee comfortable.
How to do it:
- Gently tighten the front of the thigh.
- Keep the rest of the leg relaxed.
- Ease off if the area feels protective or sharp.
Common mistakes:
- Bracing the whole body.
- Pressing harder because the exercise feels simple.
- Treating the squeeze as a strength test.
Safety note: This card is not dosage, progression, or clearance.
Log prompts: completed, symptom response, difficulty feel, confidence feel, notes.
```

Static source reference: `RF-EX-088`.

### Card C - Comfortable Thigh Mobility

```text
Title: Comfortable thigh mobility
Category: Mobility
Why it is here: Explore a gentle front-thigh movement option without forcing end range.
Setup: Choose the supported setup documented by the future clinician-facing plan.
How to do it:
- Move only through a calm range.
- Keep breathing relaxed.
- Stop if the front of the thigh tightens defensively.
Common mistakes:
- Turning the drill into a stretch challenge.
- Chasing a bigger range.
- Comparing today with a previous day.
Safety note: This card does not prove tissue readiness.
Log prompts: completed, symptom response, difficulty feel, confidence feel, notes.
```

Static source reference: `RF-EX-090`.

### Card D - Short-Arc Knee Extension

```text
Title: Short-arc knee extension
Category: Strength
Why it is here: Practice controlled knee extension in a small comfortable range.
Setup: Support the knee in the setup documented by the future clinician-facing plan.
How to do it:
- Straighten the knee only through the planned comfortable range.
- Keep the movement controlled.
- Return without dropping or rushing.
Common mistakes:
- Locking the knee aggressively.
- Adding effort to prove strength.
- Continuing after symptoms rise.
Safety note: This card is not a strength test and not a progression gate.
Log prompts: completed, symptom response, difficulty feel, confidence feel, notes.
```

Static source reference: `RF-EX-091`.

### Card E - Single-Leg Balance Reach

```text
Title: Single-leg balance reach
Category: Control
Why it is here: Practice steady hip and trunk control while keeping the thigh response quiet.
Setup: Stand near support in the setup documented by the future clinician-facing plan.
How to do it:
- Keep the stance controlled.
- Reach only as far as control stays calm.
- Use support if balance becomes the main challenge.
Common mistakes:
- Turning it into a speed drill.
- Reaching farther than control allows.
- Treating balance success as sport readiness.
Safety note: This card does not clear running, sprinting, kicking, or sport.
Log prompts: completed, symptom response, difficulty feel, confidence feel, notes.
```

Static source reference: `RF-EX-092`.

## 10. Sample Logging Screen

This is a static screen sketch only. It stores no data and creates no logging implementation.

```text
Session response

[ ] Completed the displayed cards

Front-of-thigh response:
( ) calmer than before
( ) about the same
( ) more noticeable
( ) sharp, spreading, or concerning

Difficulty feel:
( ) easier than expected
( ) manageable
( ) harder than expected
( ) not appropriate today

Confidence feel:
( ) more confident
( ) about the same
( ) less confident
( ) unsure

Notes:
[free-text notes box]

Next-day prompt:
Check whether the thigh feels calmer, about the same, more noticeable, or concerning tomorrow.
```

Logging boundaries:

- no score
- no threshold
- no pass/fail status
- no automatic progression
- no clearance
- no data persistence in this task

## 11. Conservative Adjustment Examples

These examples describe future governance behavior. They are not implemented and do not create rules.

### Example 1 - Same Or Calmer Response

Static interpretation:

```text
response: same_or_calmer
future_behavior_example: keep the same conservative display, do not progress automatically
authority_created: none
```

Why conservative:

- comfort is not readiness
- completion is not progression
- no harder card appears automatically

### Example 2 - More Noticeable But Not Concerning

Static interpretation:

```text
response: more_noticeable
future_behavior_example: simplify the display, remove optional support-strength card, prompt review of setup
authority_created: none
```

Why conservative:

- the future system would reduce complexity rather than progress
- next-day response remains evidence only
- no diagnosis or clearance decision is made

### Example 3 - Sharp, Spreading, Or Concerning Response

Static interpretation:

```text
response: concerning
future_behavior_example: withhold the displayed session, surface safety review prompt, route to governed missing-data or referral pathway
authority_created: none
```

Why conservative:

- safety takes precedence
- the static scenario does not reinterpret warning signs
- no alternate plan is automatically generated

### Example 4 - Lower Confidence

Static interpretation:

```text
response: lower_confidence
future_behavior_example: keep only the lowest-demand display cards and ask for clinician/product-reviewed guidance
authority_created: none
```

Why conservative:

- confidence is useful context but not a clearance signal
- no activity exposure is introduced from confidence alone

## 12. Activity Exposure Boundary In The Scenario

The fictional athlete has field-sport demands, but the static scenario does not show running, sprinting, acceleration, kicking, team training, or match play as active cards.

Activity exposure objects are handled as:

```text
RF-ACT objects: metadata only
runtime_selectable: false
display_in_static_plan: withheld
clearance_authority: false
```

This protects the Exercise Knowledge vs Activity Exposure boundary and avoids treating exposure domains as exercises.

## 13. Manual-Review And High-Caution Handling

Manual-review and high-caution examples are not included as active display cards.

| Object | Static scenario handling |
|---|---|
| `RF-EX-093` Static split squat | Reviewer-gated, not shown as active card |
| `RF-EX-096` Step-down | Reviewer-gated, not shown as active card |
| `RF-EX-051` Acceleration mechanics drill | Withheld |
| `RF-EX-060` Plyometric jump | Withheld |
| `RF-EX-068` Resisted kicking exposure | Withheld and boundary-sensitive |
| `RF-EX-076` Sprinting exposure | Withheld and boundary-sensitive |

No object in this table is moved, deleted, renamed, approved, or converted.

## 14. Scenario Output Snapshot

```text
scenario_name: Fictional complete-input RF static prototype
input_state: complete_for_static_demo
safety_state: no_active_lock_in_fictional_scenario
capacity_summary: qualitative_static_summary_only
plan_blocks_documented: yes
sample_user_facing_cards_documented: yes
sample_logging_screen_documented: yes
conservative_adjustment_examples_documented: yes
runtime_behavior_created: false
ui_behavior_created: false
database_behavior_created: false
clinical_authority_created: false
```

## 15. What This Scenario Proves

It proves that the current architecture can be described as a future plan experience without collapsing the systems:

- RF clinical rules stay governance-only.
- RF-EX objects stay exercise/drill metadata.
- RF-ACT objects stay exposure metadata.
- RF-ASSESS objects stay evidence metadata.
- CAP objects stay capacity vocabulary.
- Evidence links stay relationship metadata.
- Logging stays a future display concept.
- Conservative adjustments stay examples, not executable rules.

## 16. What This Scenario Does Not Prove

It does not prove:

- that these cards are clinically approved
- that the fictional inputs are clinically sufficient for a real person
- that any object is approved
- that any object is executable
- that any plan can run in the app
- that any plan can be stored in the database
- that any athlete is ready for running
- that any athlete is cleared for sprinting, kicking, training, sport, match play, or competition
- that any dosage, timeline, progression, or return pathway exists

## 17. Scope Verification Checklist

Completion of this static scenario requires:

- this document to exist
- fictional complete inputs documented
- capacity summary documented
- plan blocks documented
- sample user-facing cards documented
- sample logging screen documented
- conservative adjustment examples documented
- all existing checks passing
- final scope verification reported

It must not modify:

- RF-EX objects
- RF-ACT objects
- RF-ASSESS objects
- CAP objects
- evidence-linking objects
- shared taxonomies
- RF clinical rule objects
- schemas
- templates
- validators
- package scripts
- runtime code
- UI code
- database code
- Supabase code
- RecoveryContext code
- injuryEngine code
- legacy modules

## 18. Final Scenario Verdict

The complete static RF prototype plan scenario is documented as a non-executable product and governance artifact. It has complete fictional inputs, a qualitative capacity summary, block-level plan structure, sample user-facing cards, a sample logging screen, and conservative adjustment examples.

It remains draft documentation only. It creates no clinical approval, no runtime behavior, no UI behavior, no database behavior, no dosage, no progression, no readiness, no RTT/RTS, and no clearance authority.
