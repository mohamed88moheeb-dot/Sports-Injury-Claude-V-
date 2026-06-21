# Universal CAP Object Authoring Plan

**Status:** planning / documentation only · pending · NON-EXECUTABLE · not clinically approved · no runtime integration.
**This task authors no objects.** It plans the first batch of universal `CAP-###` capacity objects before any object file is created.

> No CAP objects authored in this task. No RF-CAP overlays authored in this task. No runtime behavior.
> No diagnosis authority. No prescription. No dosage. No progression. No readiness. No RTT/RTS. No
> clearance authority. No user-specific capacity state. No assessment pass/fail decision.

## 1. Purpose
Define the first universal capacity objects so that the initial `CAP-###` set is universal (not RF-only),
useful for the RF vertical slice and future injuries, understandable for general users, compatible with
Capacity Schema v2, non-executable, and free of clearance/readiness/progression authority. Planning the
batch first prevents authoring RF-shaped capacities that would later need migration.

## 2. Why universal CAP objects must come before RF-CAP overlays
Schema v2 models capacity as a universal core (`CAP-###`, `module: universal`) plus module overlays
(`RF-CAP-###`, `module: rf`) that reference the core via `universal_capacity_ref`. An overlay cannot
reference a universal capacity that does not yet exist. Authoring the universal core first gives every
overlay (and every future injury module and demand profile) a stable, module-agnostic anchor.

## 3. Scope of the first batch
Fifteen universal capacities (CAP-001…CAP-015) spanning the capacity types the RF vertical slice needs —
movement tolerances, mobility, tissue load tolerance, strength, motor control, and confidence — chosen so
each is genuinely universal and reusable by future injury modules. No RF-specific pathology is encoded.

## 4. Governance constraints
All future CAP objects (and this plan) remain: draft · pending · clinically not approved · non-executable
· runtime_integration none · `permitted_use: capacity_metadata_only`. No score, threshold, pass/fail
decision, timeline, dosage, prescription, progression authorization, readiness authorization, RTT/RTS
authorization, clearance authority, or user-specific capacity state is created — now or by the objects
this plan describes. Unknown is not safe; goal sufficiency is evidence, not clearance.

## 5. Proposed first universal CAP batch
| ID | Name | Domain | Subdomain |
|---|---|---|---|
| CAP-001 | walking_tolerance | movement_tolerance | walking_tolerance |
| CAP-002 | stairs_tolerance | movement_tolerance | stairs_tolerance |
| CAP-003 | jogging_tolerance | movement_tolerance | jogging_tolerance |
| CAP-004 | running_tolerance | movement_tolerance | running_tolerance |
| CAP-005 | sprinting_tolerance | movement_tolerance | sprinting_tolerance |
| CAP-006 | acceleration_tolerance | movement_tolerance | acceleration_tolerance |
| CAP-007 | kicking_tolerance | movement_tolerance | kicking_tolerance |
| CAP-008 | hip_flexion_mobility | mobility | hip_flexion_mobility |
| CAP-009 | knee_flexion_tolerance | movement_tolerance | knee_flexion_tolerance |
| CAP-010 | anterior_thigh_tissue_load_tolerance | tissue_capacity | anterior_thigh_tissue_load_tolerance |
| CAP-011 | isometric_strength_capacity | strength | isometric_strength |
| CAP-012 | eccentric_strength_capacity | strength | eccentric_strength |
| CAP-013 | single_leg_control | motor_control | single_leg_control |
| CAP-014 | lumbopelvic_control | motor_control | lumbopelvic_control |
| CAP-015 | movement_confidence | psychological_confidence_capacity | movement_confidence |

## 6. Object authoring rules
- Universal capacities describe **human capacity generally**; never RF-specific pathology.
  Correct: `CAP-004 running_tolerance`. Incorrect: `CAP-004 rectus_femoris_running_tolerance`.
- RF-specific meaning belongs later in `RF-CAP-###` with `universal_capacity_ref: CAP-###`.
- `capacity_object_type: universal_capacity`, `module: universal`, `universal_capacity_ref: ""`.
- All cross-link arrays use existing shared-taxonomy vocabulary (assessment-purpose, exercise-function,
  activity-exposure, sport-demand, rehab-plan-block) — references only, never selection/prescription.
- One capacity per concept; no compound capacities; no scores/thresholds/timelines.

## 7. Field-by-field authoring guidance (Schema v2)
- `capacity_id`: `CAP-###`, sequential, matches filename.
- `capacity_object_type`: `universal_capacity`. `module`: `universal`. `universal_capacity_ref`: `""`.
- `name`: the universal capacity name (snake_case, no module prefix).
- `capacity_status: draft`, `approval_status: pending`, `clinical_approval_status: not_approved`,
  `executable: false`, `runtime_integration: none`, `permitted_use: capacity_metadata_only`.
- `capacity_domain` / `capacity_subdomain`: from the ontology domains/subdomains.
- `capacity_tags`: short qualitative descriptors (no numbers).
- `body_region` / `related_tissues`: general anatomy only (universal — not RF-specific claims).
- `measured_by_assessment_categories`, `improved_by_exercise_function_categories`,
  `expressed_through_activity_domains`, `required_by_demand_profiles`, `related_rehab_plan_blocks`:
  taxonomy references (see §8–§12).
- `evidence_state: not_tested`, `goal_sufficiency_status: not_applicable`,
  `confidence_status: low_confidence` (see §13).
- `allowed_when`: inert context only. `blocked_when`: governance blocks (runtime selection, prescription,
  progression/readiness/clearance decisions). `notes`: negated-governance language.

## 8. Capacity → assessment relationship guidance
Populate `measured_by_assessment_categories` from the assessment-purpose taxonomy
(`pain_response`, `range_of_motion`, `strength_capacity`, `strength_symmetry`, `endurance_capacity`,
`neuromuscular_control`, `landing_quality`, `jump_capacity`, `sprint_tolerance`, `kicking_tolerance`,
`change_of_direction_tolerance`, `next_day_response`, etc.). An assessment contributes **evidence** to a
capacity; it never clears a person.

## 9. Capacity → exercise relationship guidance
Populate `improved_by_exercise_function_categories` from the exercise-function taxonomy
(`mobility`, `activation`, `motor_control`, `isometric_strength`, `isotonic_strength`, `eccentric_strength`,
`long_length_strength`, `support_strength`, `trunk_pelvis_control`, `running_mechanics`, `sprint_mechanics`,
`kicking_mechanics`, `plyometric`, `landing_control`, `balance_proprioception`, etc.). Reference only — no
dose, sets, reps, or progression implied.

## 10. Capacity → activity relationship guidance
Populate `expressed_through_activity_domains` from the activity-exposure taxonomy
(`walking`, `stairs`, `jogging`, `running`, `high_speed_running`, `sprinting`, `acceleration`,
`kicking_exposure`, `jumping_exposure`, `landing_exposure`, etc.). Expressing a capacity in an activity is
monitored, never auto-cleared.

## 11. Capacity → demand-profile relationship guidance
Populate `required_by_demand_profiles` from the sport-demand taxonomy
(`linear_acceleration`, `max_velocity_sprinting`, `repeated_sprinting`, `kicking`, `change_of_direction`,
`endurance_running`, `field_movement`, `court_movement`, etc.). Demand profiles will require **universal**
capacities; RF overlays describe how an RF-injured athlete expresses/limits the same capacity.

## 12. Capacity → rehab-plan-block relationship guidance
Populate `related_rehab_plan_blocks` from the rehab-plan-block taxonomy
(`mobility_block`, `activation_block`, `tissue_loading_block`, `strength_block`, `support_strength_block`,
`motor_control_block`, `plyometric_block`, `running_mechanics_block`, `sport_mechanics_block`,
`activity_exposure_block`, `conditioning_block`, `assessment_gate`, `monitoring_check`). This tells a future
composer which block types develop/test the capacity — never the dose or selection.

## 13. Evidence-state and goal-sufficiency guidance
Universal CAP objects default to `evidence_state: not_tested`, `goal_sufficiency_status: not_applicable`,
`confidence_status: low_confidence` until real user evidence exists. These are qualitative descriptors of
the capacity definition, not user state. Do **not** create user-specific states, scores, thresholds, or
pass/fail rules in capacity objects — those belong to future governed evidence/rule layers.

## 14. Conversational assessment implications
The conversational intake ("Can you walk normally? climb stairs? jog? run? sprint? what are you getting
back to? what happens when you try?") maps to the movement-tolerance capacities (CAP-001…007, 009) and
seeds qualitative evidence over time. Advanced testing only raises `confidence_status`; it is never
mandatory. No capacity object encodes the questions or any scoring — it only names what is being inferred.

## 15. RF vertical slice relevance
Each batch capacity is directly used by the RF slice: movement tolerances (walking→sprinting, kicking)
mirror the RF-ACT exposure domains; hip-flexion mobility, knee-flexion tolerance, and anterior-thigh
tissue-load tolerance map to RF loading/lengthening; isometric/eccentric strength and single-leg/
lumbopelvic control map to RF rehab exercise functions; movement confidence supports the psychological
dimension. RF-CAP overlays will later reference these via `universal_capacity_ref`.

## 16. Future injury relevance
All 15 are reusable beyond RF: e.g. running/sprinting/acceleration tolerance and eccentric strength apply
to hamstring and calf injuries; knee-flexion tolerance, single-leg control, and landing-related strength
apply to ACL/patellofemoral; lumbopelvic control and movement confidence apply to low-back and general
return-to-activity; walking/stairs tolerance applies to older-adult and post-op function.

## 17. Objects explicitly excluded from this batch
Not first-batch universal CAP objects (may become future capacity/assessment/demand concepts):
sport-specific elite performance capacities; max-velocity sprint performance metrics; jump performance
clearance; reactive strength index; GPS load metrics; force-plate metrics; return-to-sport readiness;
competition readiness. (These are performance metrics / readiness gates — not universal capacity
definitions, and several are clearance-sensitive.)

## 18. Audit checklist before object authoring
Before any `CAP-###` file is written, confirm:
1. Capacity Schema v2 is frozen and `npm run validate:capacity-knowledge` passes at 0 objects.
2. Each planned capacity is universal (no module/pathology in id or name).
3. `capacity_object_type: universal_capacity`, `module: universal`, `universal_capacity_ref: ""`.
4. Status discipline correct (draft/pending/not_approved/exec false/runtime none/metadata only).
5. Cross-link arrays use only existing shared-taxonomy values.
6. Defaults: `evidence_state: not_tested`, `goal_sufficiency_status: not_applicable`,
   `confidence_status: low_confidence`.
7. No score/threshold/pass-fail/timeline/dosage/prescription/progression/readiness/RTT-RTS/clearance.
8. IDs sequential CAP-001…CAP-015, filename = `capacity_id`; status authored count updated to match.
9. Validator upgraded (if needed) to validate authored universal objects; all 8 governance checks green.
10. No RF-EX/RF-ACT/RF-ASSESS/RF-rule/runtime change.

## 19. Recommended next task
**Author universal CAP objects (Batch 1, CAP-001…CAP-015)** as a governed authoring task: upgrade the
capacity validator to object-level validation for universal objects, author the 15 objects per this plan,
update the status count, and re-run all eight checks. Then: clinical red-team audit of the universal CAP
objects, then RF-CAP overlay authoring referencing them.

---

## Per-capacity planning detail

### CAP-001 — walking_tolerance
- planned_capacity_id: CAP-001
- planned_name: walking_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: walking_tolerance
- why_universal: walking is a baseline human movement everyone needs regardless of sport or injury.
- why_relevant_to_rf: early-stage RF load/gait tolerance baseline; provides contextual evidence for later higher-demand activity planning.
- future_injury_relevance: foundational for nearly all lower-limb, spine, and post-op/older-adult cases.
- likely_measured_by_assessment_categories: pain_response, next_day_response
- likely_improved_by_exercise_function_categories: conditioning_support, motor_control
- likely_expressed_through_activity_domains: walking, stairs
- likely_required_by_demand_profiles: field_movement, court_movement, endurance_running
- likely_related_rehab_plan_blocks: activity_exposure_block, monitoring_check
- notes_for_future_authoring: baseline tolerance; no distance/time values.
- risk_level: low
- reviewer_notes: confirm framed as tolerance, not gait diagnosis.

### CAP-002 — stairs_tolerance
- planned_capacity_id: CAP-002
- planned_name: stairs_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: stairs_tolerance
- why_universal: stair negotiation is a universal daily-life demand.
- why_relevant_to_rf: loaded knee/hip flexion tolerance in daily life; early functional marker.
- future_injury_relevance: knee, hip, calf, post-op, older-adult function.
- likely_measured_by_assessment_categories: pain_response, next_day_response
- likely_improved_by_exercise_function_categories: support_strength, motor_control, isotonic_strength
- likely_expressed_through_activity_domains: stairs, walking
- likely_required_by_demand_profiles: field_movement, court_movement
- likely_related_rehab_plan_blocks: activity_exposure_block, support_strength_block, monitoring_check
- notes_for_future_authoring: daily-life capacity; no step counts.
- risk_level: low
- reviewer_notes: keep universal (not RF knee-specific).

### CAP-003 — jogging_tolerance
- planned_capacity_id: CAP-003
- planned_name: jogging_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: jogging_tolerance
- why_universal: low-speed running is a general fitness/return-to-activity milestone.
- why_relevant_to_rf: maps to RF-ACT jogging/running reintroduction (monitored, not cleared).
- future_injury_relevance: hamstring, calf, ankle, general return-to-running.
- likely_measured_by_assessment_categories: pain_response, next_day_response, endurance_capacity
- likely_improved_by_exercise_function_categories: running_mechanics, conditioning_support, support_strength
- likely_expressed_through_activity_domains: jogging, running
- likely_required_by_demand_profiles: endurance_running, field_movement
- likely_related_rehab_plan_blocks: running_mechanics_block, activity_exposure_block, monitoring_check
- notes_for_future_authoring: no pace/distance prescription.
- risk_level: low
- reviewer_notes: distinct from running_tolerance (speed step).

### CAP-004 — running_tolerance
- planned_capacity_id: CAP-004
- planned_name: running_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: running_tolerance
- why_universal: sustained running is a general athletic/active-life capacity.
- why_relevant_to_rf: central RF reintroduction capacity (RF-ACT running domains).
- future_injury_relevance: hamstring, calf, Achilles, bone-stress, general RTR.
- likely_measured_by_assessment_categories: pain_response, next_day_response, endurance_capacity
- likely_improved_by_exercise_function_categories: running_mechanics, eccentric_strength, conditioning_support
- likely_expressed_through_activity_domains: running, high_speed_running
- likely_required_by_demand_profiles: endurance_running, repeated_sprinting, field_movement
- likely_related_rehab_plan_blocks: running_mechanics_block, activity_exposure_block, monitoring_check
- notes_for_future_authoring: universal; RF nuance goes in RF-CAP overlay.
- risk_level: low
- reviewer_notes: name must stay universal (not RF-prefixed).

### CAP-005 — sprinting_tolerance
- planned_capacity_id: CAP-005
- planned_name: sprinting_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: sprinting_tolerance
- why_universal: high-speed running tolerance applies to any sprint-exposed athlete.
- why_relevant_to_rf: high-demand RF exposure; clearance-sensitive, so kept as tolerance not readiness.
- future_injury_relevance: hamstring (high), calf, groin, general speed return.
- likely_measured_by_assessment_categories: sprint_tolerance, pain_response, next_day_response
- likely_improved_by_exercise_function_categories: sprint_mechanics, eccentric_strength, plyometric, reactive_strength
- likely_expressed_through_activity_domains: high_speed_running, sprinting
- likely_required_by_demand_profiles: max_velocity_sprinting, repeated_sprinting, linear_acceleration
- likely_related_rehab_plan_blocks: sport_mechanics_block, activity_exposure_block, monitoring_check
- notes_for_future_authoring: tolerance only; no speed targets, MSS %, or sprint ratios.
- risk_level: medium
- reviewer_notes: ensure not conflated with sprint-performance metrics (excluded §17).

### CAP-006 — acceleration_tolerance
- planned_capacity_id: CAP-006
- planned_name: acceleration_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: acceleration_tolerance
- why_universal: acceleration is a general field/court movement quality.
- why_relevant_to_rf: hip-flexor/anterior-thigh demand during acceleration; RF-ACT acceleration domain.
- future_injury_relevance: hamstring, groin, hip, general field return.
- likely_measured_by_assessment_categories: pain_response, next_day_response, sprint_tolerance
- likely_improved_by_exercise_function_categories: sprint_mechanics, power, support_strength
- likely_expressed_through_activity_domains: acceleration, sprinting
- likely_required_by_demand_profiles: linear_acceleration, repeated_sprinting, field_movement
- likely_related_rehab_plan_blocks: sport_mechanics_block, activity_exposure_block, monitoring_check
- notes_for_future_authoring: tolerance only; no speed/output metrics.
- risk_level: medium
- reviewer_notes: distinct from sprinting_tolerance (acceleration vs max velocity).

### CAP-007 — kicking_tolerance
- planned_capacity_id: CAP-007
- planned_name: kicking_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: kicking_tolerance
- why_universal: kicking is a general sport-skill tolerance (multiple sports), not RF-only.
- why_relevant_to_rf: key RF-specific high-risk exposure; clearance-sensitive → tolerance not clearance.
- future_injury_relevance: groin/adductor, hip flexor, general kicking-sport return.
- likely_measured_by_assessment_categories: kicking_tolerance, pain_response, next_day_response
- likely_improved_by_exercise_function_categories: kicking_mechanics, eccentric_strength, support_strength
- likely_expressed_through_activity_domains: kicking_exposure
- likely_required_by_demand_profiles: kicking
- likely_related_rehab_plan_blocks: sport_mechanics_block, activity_exposure_block, monitoring_check
- notes_for_future_authoring: tolerance only; no kicking volume/intensity.
- risk_level: medium
- reviewer_notes: universal kicking, RF nuance in RF-CAP overlay.

### CAP-008 — hip_flexion_mobility
- planned_capacity_id: CAP-008
- planned_name: hip_flexion_mobility
- capacity_domain: mobility · capacity_subdomain: hip_flexion_mobility
- why_universal: hip-flexion range is a universal movement quality.
- why_relevant_to_rf: RF crosses the hip; flexion mobility/loading is central to RF rehab.
- future_injury_relevance: hip, groin, low-back, general mobility cases.
- likely_measured_by_assessment_categories: range_of_motion, pain_response
- likely_improved_by_exercise_function_categories: mobility, dynamic_mobility, activation
- likely_expressed_through_activity_domains: walking, running, kicking_exposure
- likely_required_by_demand_profiles: kicking, end_range_mobility, field_movement
- likely_related_rehab_plan_blocks: mobility_block, activation_block
- notes_for_future_authoring: mobility, not a stretch prescription; no ROM degrees.
- risk_level: low
- reviewer_notes: confirm domain mobility vs flexibility convention.

### CAP-009 — knee_flexion_tolerance
- planned_capacity_id: CAP-009
- planned_name: knee_flexion_tolerance
- capacity_domain: movement_tolerance · capacity_subdomain: knee_flexion_tolerance
- why_universal: tolerating loaded/lengthened knee flexion is a universal capacity.
- why_relevant_to_rf: anterior-thigh lengthening tolerance (e.g. reverse-Nordic-type demand).
- future_injury_relevance: knee, quadriceps, post-op, older-adult function.
- likely_measured_by_assessment_categories: range_of_motion, pain_response, next_day_response
- likely_improved_by_exercise_function_categories: mobility, long_length_strength, eccentric_strength
- likely_expressed_through_activity_domains: stairs, kicking_exposure
- likely_required_by_demand_profiles: end_range_mobility, kicking
- likely_related_rehab_plan_blocks: mobility_block, tissue_loading_block, monitoring_check
- notes_for_future_authoring: tolerance under lengthening; no ROM/dose values.
- risk_level: low
- reviewer_notes: keep universal anterior-thigh-neutral wording.

### CAP-010 — anterior_thigh_tissue_load_tolerance
- planned_capacity_id: CAP-010
- planned_name: anterior_thigh_tissue_load_tolerance
- capacity_domain: tissue_capacity · capacity_subdomain: anterior_thigh_tissue_load_tolerance
- why_universal: regional tissue load tolerance is a universal capacity concept (anatomy, not pathology).
- why_relevant_to_rf: the core RF tissue-capacity concept the slice builds on.
- future_injury_relevance: quadriceps strains/contusions, tendinopathy, general anterior-thigh load.
- likely_measured_by_assessment_categories: strength_capacity, pain_response, next_day_response
- likely_improved_by_exercise_function_categories: isometric_strength, isotonic_strength, eccentric_strength, long_length_strength
- likely_expressed_through_activity_domains: running, sprinting, kicking_exposure
- likely_required_by_demand_profiles: max_velocity_sprinting, kicking, linear_acceleration
- likely_related_rehab_plan_blocks: tissue_loading_block, strength_block, monitoring_check
- notes_for_future_authoring: region/load tolerance only; no dosage; RF specificity in overlay.
- risk_level: low
- reviewer_notes: keep "anterior thigh" anatomical (universal), not "rectus femoris".

### CAP-011 — isometric_strength_capacity
- planned_capacity_id: CAP-011
- planned_name: isometric_strength_capacity
- capacity_domain: strength · capacity_subdomain: isometric_strength
- why_universal: isometric strength is a universal strength quality.
- why_relevant_to_rf: early RF loading/pain-modulation context.
- future_injury_relevance: tendinopathy, post-op, virtually all strength rehab.
- likely_measured_by_assessment_categories: strength_capacity, strength_symmetry
- likely_improved_by_exercise_function_categories: isometric_strength, activation
- likely_expressed_through_activity_domains: gym_conditioning
- likely_required_by_demand_profiles: field_movement, court_movement
- likely_related_rehab_plan_blocks: tissue_loading_block, strength_block
- notes_for_future_authoring: capacity, not a load prescription; no kg/%.
- risk_level: low
- reviewer_notes: universal strength subdomain.

### CAP-012 — eccentric_strength_capacity
- planned_capacity_id: CAP-012
- planned_name: eccentric_strength_capacity
- capacity_domain: strength · capacity_subdomain: eccentric_strength
- why_universal: eccentric strength is a universal strength quality.
- why_relevant_to_rf: lengthened/eccentric RF capacity for higher-speed and kicking demands.
- future_injury_relevance: hamstring (high), calf, Achilles, quadriceps.
- likely_measured_by_assessment_categories: strength_capacity, strength_symmetry, pain_response
- likely_improved_by_exercise_function_categories: eccentric_strength, long_length_strength
- likely_expressed_through_activity_domains: high_speed_running, sprinting, kicking_exposure
- likely_required_by_demand_profiles: max_velocity_sprinting, kicking, deceleration
- likely_related_rehab_plan_blocks: strength_block, tissue_loading_block
- notes_for_future_authoring: capacity only; no eccentric dose.
- risk_level: low
- reviewer_notes: universal; pairs with CAP-010 for RF overlay.

### CAP-013 — single_leg_control
- planned_capacity_id: CAP-013
- planned_name: single_leg_control
- capacity_domain: motor_control · capacity_subdomain: single_leg_control
- why_universal: single-leg control is a universal neuromuscular quality.
- why_relevant_to_rf: supports running/landing/field reintroduction in the RF slice.
- future_injury_relevance: ACL, ankle, patellofemoral, hip, general lower-limb.
- likely_measured_by_assessment_categories: neuromuscular_control, landing_quality
- likely_improved_by_exercise_function_categories: motor_control, balance_proprioception, support_strength, landing_control
- likely_expressed_through_activity_domains: running, landing_exposure, change_of_direction
- likely_required_by_demand_profiles: change_of_direction, landing, field_movement
- likely_related_rehab_plan_blocks: motor_control_block, support_strength_block
- notes_for_future_authoring: control quality; no pass/fail test embedded.
- risk_level: low
- reviewer_notes: SLS assessment overlap handled in Assessment Knowledge, not here.

### CAP-014 — lumbopelvic_control
- planned_capacity_id: CAP-014
- planned_name: lumbopelvic_control
- capacity_domain: motor_control · capacity_subdomain: lumbopelvic_control
- why_universal: trunk/pelvis control is a universal motor-control quality.
- why_relevant_to_rf: supports running mechanics and kicking control in the RF slice.
- future_injury_relevance: low-back, hip, groin, hamstring, general athletic control.
- likely_measured_by_assessment_categories: neuromuscular_control
- likely_improved_by_exercise_function_categories: trunk_pelvis_control, motor_control, support_strength
- likely_expressed_through_activity_domains: running, kicking_exposure
- likely_required_by_demand_profiles: kicking, rotational_power, field_movement
- likely_related_rehab_plan_blocks: motor_control_block, support_strength_block
- notes_for_future_authoring: control quality only.
- risk_level: low
- reviewer_notes: universal trunk/pelvis control.

### CAP-015 — movement_confidence
- planned_capacity_id: CAP-015
- planned_name: movement_confidence
- capacity_domain: psychological_confidence_capacity · capacity_subdomain: movement_confidence
- why_universal: psychological confidence applies to every rehab journey.
- why_relevant_to_rf: confidence to load/run/kick affects RF return; complements physical capacities.
- future_injury_relevance: all injuries (fear-avoidance, return confidence).
- likely_measured_by_assessment_categories: pain_response, next_day_response
- likely_improved_by_exercise_function_categories: motor_control, conditioning_support, sport_preparation_drill
- likely_expressed_through_activity_domains: walking, running, kicking_exposure, controlled_practice
- likely_required_by_demand_profiles: field_movement, court_movement
- likely_related_rehab_plan_blocks: monitoring_check, activity_exposure_block
- notes_for_future_authoring: qualitative confidence; never a readiness/clearance score.
- risk_level: low
- reviewer_notes: keep distinct from return-to-sport readiness (excluded §17).
