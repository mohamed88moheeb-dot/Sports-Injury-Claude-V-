# Capacity Knowledge System — Master Ontology

**Status:** scaffold / ontology only · pending · NON-EXECUTABLE · clinically not approved · runtime_integration none.
Scaffold: `lib/clinical/capacityKnowledge/`. Validator: `npm run validate:capacity-knowledge`.

> This document defines structure and vocabulary only. It creates no score, threshold, pass/fail
> decision, timeline, dosage, prescription, progression, readiness, RTT/RTS, or clearance authority,
> and modifies no existing RF-EX, RF-ACT, RF-ASSESS, or RF clinical-rule object.

## 1. Purpose
Define the first governed scaffold and master ontology for **capacity** — the universal human qualities
(strength, mobility, control, tolerance, confidence, etc.) that rehabilitation and performance are really
about. Capacity is the shared currency that lets assessments, exercises, activities, and sport/work/life
demands all refer to the same underlying thing.

## 2. Why capacity is the bridge
The other systems each touch capacity from a different side:
```
Assessment measures capacity
Exercise improves capacity
Activity expresses capacity
Demand profile requires capacity
```
Without a capacity layer, those systems can only be wired together by ad-hoc rules. With it, every
assessment **measures** named capacities, every exercise **improves** named capacities, every activity
**expresses** named capacities, and every demand profile **requires** named capacities — so a future
rule engine can reason about gaps (required − current) instead of guessing from exercise names.

## 3. Universal capacity model for all users
Capacity is defined for **everyone**, not just elite athletes: recreational athletes, active people,
non-athletes, older adults, and anyone returning to daily life, work, the gym, or sport. The same domains
apply; only the **required** level (from the demand profile and the person's goal) differs. A capacity is
never an absolute target — it is always evaluated relative to the individual's current goal and context.

## 4. Capacity domains
`mobility`, `flexibility`, `strength`, `power`, `reactive_ability`, `motor_control`, `balance`,
`coordination`, `speed`, `agility`, `endurance`, `work_capacity`, `movement_tolerance`, `tissue_capacity`,
`functional_capacity`, `psychological_confidence_capacity`, `sport_specific_capacity`,
`work_specific_capacity`, `daily_life_capacity`.

## 5. Capacity subdomains
- **Strength:** `isometric_strength`, `concentric_strength`, `eccentric_strength`, `max_strength`,
  `strength_endurance`, `unilateral_strength`, `bilateral_strength`.
- **Power:** `explosive_power`, `rate_of_force_development`, `ballistic_power`, `elastic_power`.
- **Reactive ability:** `stretch_shortening_cycle`, `landing_reactivity`, `hopping_reactivity`,
  `change_of_direction_reactivity`.
- **Motor control:** `single_leg_control`, `lumbopelvic_control`, `landing_control`,
  `running_mechanics_control`, `kicking_mechanics_control`, `deceleration_control`.
- **Endurance / work capacity:** `aerobic_capacity`, `local_muscular_endurance`,
  `repeated_sprint_capacity`, `session_tolerance`, `weekly_load_tolerance`.
- **Movement tolerance:** `walking_tolerance`, `stairs_tolerance`, `jogging_tolerance`,
  `running_tolerance`, `sprinting_tolerance`, `jumping_tolerance`, `kicking_tolerance`,
  `lifting_tolerance`.
- **Psychological / confidence:** `movement_confidence`, `sport_confidence`, `fear_avoidance_context`,
  `return_confidence`.

## 6. Evidence and confidence model
Capacity is **not** a single score. It is represented as an **evidence stack** plus a confidence status.
- `evidence_quality_status` ∈ { `known`, `estimated`, `unknown`, `not_tested`, `limited`,
  `adequate_for_current_goal`, `insufficient_for_goal` }.
- `confidence_status` ∈ { `low_confidence`, `moderate_confidence`, `high_confidence`,
  `requires_clinician_confirmation` }.
These are qualitative descriptors of *how well we know* a capacity, never a numeric grade and never a
pass/fail decision. "adequate_for_current_goal" / "insufficient_for_goal" describe sufficiency relative to
the stated goal — they are not clearance.

## 7. Relationship to Assessment Knowledge
Assessments **measure** capacity. Each capacity lists `measured_by_assessment_categories` (from the
assessment-purpose taxonomy). An assessment contributes evidence to a capacity's evidence stack; it never
clears a person or authorizes return.

## 8. Relationship to Exercise Knowledge
Exercises **improve** capacity. Each capacity lists `improved_by_exercise_function_categories` (from the
exercise-function taxonomy). This is a reference linkage, not a prescription — no dose, sets, reps, or
progression is implied.

## 9. Relationship to Activity Exposure Knowledge
Activities **express** capacity. Each capacity lists `expressed_through_activity_domains` (RF-ACT /
activity-exposure domains). Expressing a capacity in an activity is monitored, not auto-cleared.

## 10. Relationship to Demand Profiles
Demand profiles **require** capacity. Each capacity lists `required_by_demand_profiles` (from the
sport-demand taxonomy). Sport/work/life demand maps to required capacities; the person's current capacity
evidence is compared to that requirement by future governed rules.

## 11. Relationship to the Rehab Composer
A future rehab composer can read a capacity's `related_rehab_plan_blocks` to know which block types
develop or test it. The composer remains structure-only and governed: capacity gaps inform *which blocks*
are relevant, never the dose, progression, readiness, or clearance — those require future governed rules.

## 12. Initial capacity measurement philosophy
Users must **not** be forced through long assessment batteries. Capacity is inferred from: what the user
can currently do; what causes symptoms; what they avoid; their goals; basic functional questions; optional
assessments; and optional wearable/objective data. Most capacities start as `estimated`/`unknown` with
`low_confidence` and are refined over time. Advanced testing **enhances confidence**; it is never
mandatory for normal users.

## 13. Conversational assessment approach
Capacity evidence is gathered conversationally, e.g.:
```
Can you walk normally?
Can you climb stairs?
Can you jog?
Can you run?
Can you sprint?
What are you trying to get back to?
What happens when you try?
```
These map to movement-tolerance and goal/demand capacities and seed the evidence stack with qualitative
statuses. No advanced testing is required for normal users; optional tests raise confidence only.

## 14. Daily adaptation relationship
Daily check-in signals (symptom response, next-day response, functional tolerance) update a capacity's
evidence/confidence status over time — qualitatively, never as a numeric score and never as an autonomous
progression or clearance. Adaptation logic itself belongs to future governed rules.

## 15. RF-specific examples (illustrative, not authored)
- `tissue_capacity` (rectus femoris): measured_by `strength_capacity`/`pain_response`, improved_by
  `isometric_strength`/`isotonic_strength`/`eccentric_strength`, expressed_through running/kicking
  exposures, required_by sprinting/kicking demands.
- `kicking_tolerance`: measured_by `kicking_tolerance`, expressed_through `kicking_exposure` (RF-ACT-004…007),
  required_by `kicking` demand.
- `sprinting_tolerance` / `running_mechanics_control`: expressed_through running/high-speed exposures
  (RF-ACT-001…003, 008…010), required_by `max_velocity_sprinting`/`linear_acceleration`.
These are documentation examples only — **no RF-CAP objects are authored in this scaffold.**

## 16. Governance rules
All capacity objects and this system are: **draft · pending · clinically not approved · non-executable ·
runtime_integration none · metadata only.** No score, threshold, pass/fail decision, timeline, dosage,
prescription, progression authorization, readiness authorization, RTT/RTS authorization, or clearance
authority. Unknown is not safe; capacity sufficiency relative to a goal is evidence, not clearance.

## 16a. Amendment — Schema v2 universal core model
Schema v2 implements the ADR's two-layer model. (This amendment adds to, and does not remove, the
governance language above.)
- **`CAP-###` universal capacities** (`capacity_object_type: universal_capacity`, `module: universal`)
  define human capacities module-agnostically.
- **`RF-CAP-###` module overlays** (`capacity_object_type: module_capacity_overlay`, `module: rf`)
  refine a universal capacity for the Rectus Femoris module.
- **`universal_capacity_ref`** links an overlay to its universal core (`CAP-###`); it is empty for
  universal capacities and for the blank template.
- **Evidence status split:** the former single `evidence_quality_status` is replaced by three orthogonal
  qualitative fields — `evidence_state` (`known`/`estimated`/`unknown`/`not_tested`),
  `goal_sufficiency_status` (`limited`/`adequate_for_current_goal`/`insufficient_for_goal`/
  `requires_clinician_confirmation`/`not_applicable`), and `confidence_status`
  (`low_confidence`/`moderate_confidence`/`high_confidence`/`requires_clinician_confirmation`). None is a
  numeric score, threshold, pass/fail, or clearance; goal sufficiency is evidence about adequacy, not a
  return decision.
- **Why no objects are authored yet:** schema v2 is a scaffold — universal `CAP` objects, then RF-CAP
  overlays, are authored only in later governed phases (with a cross-reference validator), so authoring
  always targets the final model.
- **Why demand profiles reference universal capacities:** a demand ("max-velocity sprinting requires
  running tolerance") is module-agnostic, so demand profiles require `CAP-###` universal capacities; RF
  overlays then describe how an RF-injured athlete expresses/limits that same universal capacity.

## 17. Future implementation phases
Superseded by Schema v2: universal `CAP-###` capacities are authored **first**, before any RF-CAP
overlay. The correct governed order is:
1. **Author universal `CAP-###` capacity objects** (governed) in the Universal Capacity Core.
2. **Clinical red-team audit** of the universal `CAP-###` objects.
3. **Author `RF-CAP-###` overlays** that reference their universal core via `universal_capacity_ref`
   (overlays come **after** the universal objects exist, never before).
4. **Add the cross-reference validator** (verify overlay refs resolve, and that measured_by / improved_by /
   expressed_through / required_by values match the shared taxonomies and RF-ACT/assessment IDs).
5. **Build the Demand Profile System scaffold** (sport/work/life demand framework).
6. **Author demand profiles** that reference universal `CAP-###` objects (demands are module-agnostic, so
   they require universal capacities, not RF overlays).
7. **Later build the governed Rehab Composer** that reasons over capacity gaps.

No runtime, progression, readiness, RTT/RTS, or clearance authority is created by any of these phases
without explicit future governed rules. (This order supersedes any earlier text that listed RF-CAP
authoring before universal CAP authoring and is consistent with
`docs/implementation/CAPACITY_KNOWLEDGE_SCHEMA_V2_AND_UNIVERSAL_CORE_SCAFFOLD.md`.)
