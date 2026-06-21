# RF Knowledge Object Classification Audit

**Status:** classification audit only · pending · NON-EXECUTABLE · not approved · no runtime integration.
**This audit moves nothing, renames nothing, approves nothing, and creates no dose/progression/readiness/RTT/RTS authority.**
Machine-readable companion: `docs/implementation/RF_KNOWLEDGE_OBJECT_CLASSIFICATION_AUDIT.json`.
Governed by `docs/implementation/KNOWLEDGE_SYSTEMS_ONTOLOGY_AND_REHAB_COMPOSITION_MODEL.md` and `lib/clinical/sharedKnowledgeTaxonomies/`.

## 1. Executive summary
All 87 existing objects (RF-EX-001…087) currently live in the single Exercise Knowledge System. This audit
classifies each against the three-system model. **57** are true exercises/drills that should stay in
Exercise Knowledge; **12** are activity/conditioning exposure domains that should later migrate to a new
Activity Exposure Knowledge System (RF-ACT); **2** are dual exercise/assessment objects (CMJ, drop jump) that should be
cross-referenced into Assessment Knowledge (DUAL); and **16** are restricted-context (post-surgical or
contusion) objects that must stay reviewer-gated. No pure assessment-only objects exist yet, so no
RF-ASSESS-only migrations are proposed in this pass. Nothing is moved or renamed here.

## 2. Counts by proposed future system
- exercise_knowledge: 57
- restricted_context_only: 16
- activity_exposure_knowledge: 12
- dual_reference_exercise_and_assessment: 2
- (assessment_knowledge only: 0 — none authored yet)

## 3. Counts by object type classification
- true_exercise: 42
- restricted_context_only: 14
- exercise_drill: 15
- activity_exposure: 10
- assessment_overlap: 2
- conditioning_exposure: 4

Also: by future ID prefix — RF-EX: 57, RESTRICTED: 16, RF-ACT: 12, DUAL: 2.
By action — keep: 57, restrict_and_review: 16, migrate_later: 12, cross_reference_later: 2.
By migration priority — none: 57, low: 16, high: 12, medium: 2.

## 4. High-priority migration candidates
High priority = clearly-mislabeled activity/conditioning exposures sitting in Exercise Knowledge (clearance-leak risk):
- RF-EX-054 Short-distance running exposure
- RF-EX-055 Moderate-distance running exposure
- RF-EX-056 Acceleration exposure
- RF-EX-066 Static isolated kicking exposure
- RF-EX-067 Controlled kicking exposure
- RF-EX-068 Resisted kicking exposure
- RF-EX-070 Game-based kicking scenario exposure
- RF-EX-073 Sport-specific running exposure
- RF-EX-074 Mixed generic and sport-specific running exposure
- RF-EX-075 High-speed running exposure
- RF-EX-082 Elliptical conditioning
- RF-EX-083 Calisthenics conditioning

## 5. Objects that should stay in Exercise Knowledge (keep, RF-EX)
- RF-EX-001 Reclined knee extension ISO
- RF-EX-002 Hip-flexed knee extension
- RF-EX-003 Hip-extended knee extension
- RF-EX-004 Leg extension
- RF-EX-005 Isometric supine hip flexion at 90 degrees
- RF-EX-006 Standing hip flexion at 90 degrees
- RF-EX-007 Half-kneeling hip flexion
- RF-EX-008 Inclined trunk hip flexion
- RF-EX-009 Resisted hip flexion in Thomas-test position
- RF-EX-010 Knee-flexed hip flexion
- RF-EX-011 Knee-extended hip flexion
- RF-EX-012 Straight leg raise active mobility/loading
- RF-EX-013 Reverse Nordic
- RF-EX-014 Walking lunge
- RF-EX-015 Posterior lunge
- RF-EX-016 Step-up
- RF-EX-017 Double-leg squat
- RF-EX-018 Mini single-leg squat
- RF-EX-019 Single-leg squat
- RF-EX-020 Prone quadriceps dynamic mobility
- RF-EX-021 Mountain climbers with slider
- RF-EX-025 Half-kneeling pelvic tilt
- RF-EX-026 Half-kneeling pelvic tilt with maximal knee flexion
- RF-EX-027 Supine hamstring dynamic mobility
- RF-EX-028 Hamstring dynamic mobility with fitball
- RF-EX-029 Ballistic swings
- RF-EX-030 Side-lying hip abduction with band
- RF-EX-031 Clamshells with band
- RF-EX-032 Bilateral glute bridge
- RF-EX-033 Bilateral hip thrust
- RF-EX-034 Lateral walk with band
- RF-EX-035 Unilateral hip thrust
- RF-EX-036 Monster walk
- RF-EX-037 Plyometric glute bridge
- RF-EX-038 Plyometric hip thrust
- RF-EX-039 Side plank
- RF-EX-040 Front plank
- RF-EX-041 Dead bug
- RF-EX-042 Pallof press
- RF-EX-043 Ankling drill
- RF-EX-044 Skipping drill
- RF-EX-045 Bounding drill
- RF-EX-046 High-knees running drill
- RF-EX-047 Butt-kickers drill
- RF-EX-048 Toe-off pelvic-control running drill
- RF-EX-049 Mid-stance running mechanics drill
- RF-EX-050 Rotational-control running drill
- RF-EX-051 Acceleration mechanics drill
- RF-EX-052 Deceleration mechanics drill
- RF-EX-053 Change-of-direction mechanics drill
- RF-EX-057 Step bilateral landing
- RF-EX-058 Step unilateral landing
- RF-EX-059 Bilateral squat jump
- RF-EX-060 Plyometric jump
- RF-EX-063 Integrated limb reactivity drill
- RF-EX-064 Low-intensity hopping
- RF-EX-065 Open-chain kicking pattern exercise

## 6. Objects that should migrate to Activity Exposure Knowledge later (RF-ACT)
- RF-EX-054 Short-distance running exposure
- RF-EX-055 Moderate-distance running exposure
- RF-EX-056 Acceleration exposure
- RF-EX-066 Static isolated kicking exposure
- RF-EX-067 Controlled kicking exposure
- RF-EX-068 Resisted kicking exposure
- RF-EX-070 Game-based kicking scenario exposure
- RF-EX-073 Sport-specific running exposure
- RF-EX-074 Mixed generic and sport-specific running exposure
- RF-EX-075 High-speed running exposure
- RF-EX-082 Elliptical conditioning
- RF-EX-083 Calisthenics conditioning

## 7. Objects to migrate/cross-reference to Assessment Knowledge later (DUAL / RF-ASSESS)
- RF-EX-061 Countermovement jump — dual: plyometric exercise AND jump/force-plate test
- RF-EX-062 Drop jump — dual: plyometric exercise AND jump/force-plate test
- Cross-reference-only (stay RF-EX but flag assessment overlap): RF-EX-012 (SLR active → SLR-break test), RF-EX-019 (single-leg squat → SLS assessment). No pure-assessment objects exist yet.

## 8. Restricted-context objects (stay restricted, RESTRICTED)
- RF-EX-022 Generic quadriceps isometric exercise
- RF-EX-023 Active knee extension ROM/loading
- RF-EX-024 Active knee flexion ROM
- RF-EX-069 Ball-training with kicking
- RF-EX-071 Game-based training exposure
- RF-EX-072 Ball exercises
- RF-EX-076 Sprinting exposure
- RF-EX-077 Dynamic agility exposure
- RF-EX-078 Walking exposure
- RF-EX-079 Jogging / light-jogging exposure
- RF-EX-080 Static cycling / stationary bike conditioning
- RF-EX-081 Pool training / swimming conditioning
- RF-EX-084 Cybex machine exposure
- RF-EX-085 Well-leg gravity-assisted passive knee-flexion motion
- RF-EX-086 Full/deep squat restricted-context exposure
- RF-EX-087 Generic weight-training exposure

## 9. Ambiguous objects needing clinical/product review
- RF-EX-065 Open-chain kicking pattern exercise — classed as discrete kicking-mechanics drill (Exercise); reframe as RF-ACT kicking_exposure if treated as exposure.
- RF-EX-066/067/068 kicking exposures — classed as Activity Exposure; some could be discrete kicking-mechanics drills (Exercise) depending on framing.
- RF-EX-051/052/053 acceleration/deceleration/COD mechanics drills — kept as Exercise drills; their paired RF-EX-056/“exposure” siblings are Activity Exposure — confirm the drill-vs-exposure split.
- RF-EX-063 Integrated limb reactivity drill — kept as Exercise drill; confirm it is not an exposure domain.
- RF-EX-076–081 restricted running/sprint/agility/conditioning — restricted now; once reviewer-approved they are natural RF-ACT activity/conditioning exposures.

## 10. Risks if migration is not done
- **Clearance leakage:** activity domains (running, sprinting, kicking, match/team exposure) treated as prescribable exercises could imply readiness/clearance the rules never granted.
- **Assessment leakage:** CMJ/drop-jump used as tests could feed autonomous readiness decisions outside governed readiness rules.
- **Restricted-source bleed:** post-surgical/contusion items could be selected for standard RF strain athletes.
- **Curation debt:** Exercise Knowledge stays noisy, making a future composition engine harder to govern and audit.

## 11. Proposed phased migration plan
- **Phase 1 — schemas/validators:** create RF-ACT (activity exposure) and RF-ASSESS (assessment) object schemas + validators, mirroring the exercise-knowledge governance discipline (pending, non-executable, no dose/clearance).
- **Phase 2 — migrate clear activity exposures:** move the 12 RF-ACT candidates (running/sprint/kicking/conditioning exposures) with new RF-ACT IDs and ID cross-reference maps; leave the old RF-EX IDs as redirected stubs or remove only under governance.
- **Phase 3 — migrate/cross-reference assessment-overlap:** give CMJ/drop-jump DUAL handling — keep the exercise object, add an RF-ASSESS cross-reference for test use; add future pure tests (90/90 break, SLR break, hop, force-plate) as RF-ASSESS.
- **Phase 4 — clean Exercise Knowledge:** reduce Exercise Knowledge to true exercises/drills only (the 57 keep objects); confirm restricted items remain reviewer-gated.
- **Phase 5 — rehab composition engine:** build the governed composition engine later, pulling blocks from the three systems per the composition model. No dose/progression/readiness/RTT/RTS until governed rules exist.

## 12. Governance statement
- This audit **moves nothing**.
- This audit **approves nothing**.
- This audit **creates no runtime behavior**.
- This audit **creates no dosage, progression, readiness, RTT, or RTS authority**.
- Unknown is not safe; restricted contexts remain restricted.

## 13. Full classification table
| current_id | current_name | object_type_classification | proposed_future_system | proposed_future_id_prefix | keep_or_migrate_later | exercise_function_tags | contraction_tags | exercise_intent_tags | movement_pattern_tags | activity_exposure_tags | assessment_purpose_tags | equipment_tags | sport_demand_tags | migration_priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RF-EX-001 | Reclined knee extension ISO | true_exercise | exercise_knowledge | RF-EX | keep | isometric_strength | isometric | strength_development, tissue_capacity | knee_extension | — | — | bench | — | none |
| RF-EX-002 | Hip-flexed knee extension | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength | isometric, isotonic | strength_development, tissue_capacity | knee_extension | — | — | — | — | none |
| RF-EX-003 | Hip-extended knee extension | true_exercise | exercise_knowledge | RF-EX | keep | eccentric_strength, long_length_strength, isotonic_strength | isometric, isotonic | strength_development, tissue_capacity | knee_extension | — | — | — | — | none |
| RF-EX-004 | Leg extension | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength | isotonic | strength_development, tissue_capacity | knee_extension | — | — | leg_extension_machine | — | none |
| RF-EX-005 | Isometric supine hip flexion at 90 degrees | true_exercise | exercise_knowledge | RF-EX | keep | isometric_strength | isometric | strength_development, tissue_capacity | hip_flexion | — | — | — | — | none |
| RF-EX-006 | Standing hip flexion at 90 degrees | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength | isometric, isotonic | strength_development, tissue_capacity | hip_flexion | — | — | bodyweight | — | none |
| RF-EX-007 | Half-kneeling hip flexion | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength | isometric, isotonic | strength_development, tissue_capacity, neuromuscular_control | hip_flexion | — | — | bodyweight | — | none |
| RF-EX-008 | Inclined trunk hip flexion | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength, trunk_pelvis_control | isotonic | strength_development, tissue_capacity | hip_flexion | — | — | bench | — | none |
| RF-EX-009 | Resisted hip flexion in Thomas-test position | true_exercise | exercise_knowledge | RF-EX | keep | eccentric_strength, long_length_strength | isometric, isotonic | — | hip_flexion, hip_extension | — | — | — | — | none |
| RF-EX-010 | Knee-flexed hip flexion | true_exercise | exercise_knowledge | RF-EX | keep | — | — | — | hip_flexion | — | — | — | — | none |
| RF-EX-011 | Knee-extended hip flexion | true_exercise | exercise_knowledge | RF-EX | keep | — | — | — | hip_flexion | — | — | — | — | none |
| RF-EX-012 | Straight leg raise active mobility/loading | true_exercise | exercise_knowledge | RF-EX | keep | mobility | dynamic_control | range_restoration, movement_quality | hip_flexion | — | range_of_motion | bodyweight | — | none |
| RF-EX-013 | Reverse Nordic | true_exercise | exercise_knowledge | RF-EX | keep | eccentric_strength, long_length_strength | eccentric | strength_development, tissue_capacity | knee_extension | — | — | bodyweight | — | none |
| RF-EX-014 | Walking lunge | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength | isotonic | strength_development, tissue_capacity | lunge | — | — | bodyweight | — | none |
| RF-EX-015 | Posterior lunge | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength, support_strength | isotonic | strength_development, tissue_capacity | lunge | — | — | bodyweight | — | none |
| RF-EX-016 | Step-up | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength, support_strength | isotonic | strength_development, tissue_capacity | step_up, push | — | — | box, step | — | none |
| RF-EX-017 | Double-leg squat | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength, support_strength | isotonic | strength_development, tissue_capacity | squat | — | — | bodyweight | — | none |
| RF-EX-018 | Mini single-leg squat | true_exercise | exercise_knowledge | RF-EX | keep | isotonic_strength, support_strength | isotonic | strength_development, tissue_capacity | squat | — | — | bodyweight | — | none |
| RF-EX-019 | Single-leg squat | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength, support_strength | isotonic | strength_development, tissue_capacity, neuromuscular_control | squat | — | neuromuscular_control | bodyweight | — | none |
| RF-EX-020 | Prone quadriceps dynamic mobility | true_exercise | exercise_knowledge | RF-EX | keep | mobility, dynamic_mobility | dynamic_control | range_restoration, movement_quality | — | — | — | bodyweight | — | none |
| RF-EX-021 | Mountain climbers with slider | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength, trunk_pelvis_control | isotonic | strength_development, tissue_capacity, neuromuscular_control | hip_flexion | — | — | slider | — | none |
| RF-EX-022 | Generic quadriceps isometric exercise | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | isometric_strength | isometric | symptom_monitoring_context | knee_extension | — | — | — | — | low |
| RF-EX-023 | Active knee extension ROM/loading | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | mobility | dynamic_control | symptom_monitoring_context | knee_extension | — | — | bodyweight | — | low |
| RF-EX-024 | Active knee flexion ROM | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | mobility | dynamic_control | symptom_monitoring_context | — | — | — | bodyweight | — | low |
| RF-EX-025 | Half-kneeling pelvic tilt | true_exercise | exercise_knowledge | RF-EX | keep | mobility, motor_control | motor_control, isometric | range_restoration, movement_quality, neuromuscular_control | — | — | — | bodyweight | — | none |
| RF-EX-026 | Half-kneeling pelvic tilt with maximal knee flexion | true_exercise | exercise_knowledge | RF-EX | keep | mobility, motor_control | dynamic_control, motor_control | range_restoration, movement_quality, neuromuscular_control | — | — | — | bodyweight | — | none |
| RF-EX-027 | Supine hamstring dynamic mobility | true_exercise | exercise_knowledge | RF-EX | keep | mobility, dynamic_mobility | dynamic_control | range_restoration, movement_quality | — | — | — | bodyweight | — | none |
| RF-EX-028 | Hamstring dynamic mobility with fitball | true_exercise | exercise_knowledge | RF-EX | keep | mobility, dynamic_mobility | dynamic_control | range_restoration, movement_quality | — | — | — | ball, swiss_ball | — | none |
| RF-EX-029 | Ballistic swings | true_exercise | exercise_knowledge | RF-EX | keep | mobility, dynamic_mobility, power | dynamic_control | range_restoration, movement_quality | — | — | — | bodyweight | — | none |
| RF-EX-030 | Side-lying hip abduction with band | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength, support_strength | isotonic | strength_development, tissue_capacity, neuromuscular_control | abduction | — | — | resistance_band | — | none |
| RF-EX-031 | Clamshells with band | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength, support_strength | isotonic | strength_development, tissue_capacity, neuromuscular_control | — | — | — | resistance_band | — | none |
| RF-EX-032 | Bilateral glute bridge | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength, support_strength | isometric, isotonic | strength_development, tissue_capacity, neuromuscular_control | bridge, hip_extension | — | — | bodyweight | — | none |
| RF-EX-033 | Bilateral hip thrust | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength, support_strength, trunk_pelvis_control | isotonic | strength_development, tissue_capacity, neuromuscular_control | hip_thrust, hip_extension | — | — | bench, box | — | none |
| RF-EX-034 | Lateral walk with band | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, support_strength | isotonic | neuromuscular_control | abduction | — | — | resistance_band | — | none |
| RF-EX-035 | Unilateral hip thrust | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isotonic_strength, support_strength, trunk_pelvis_control | isotonic | strength_development, tissue_capacity, neuromuscular_control | hip_thrust, hip_extension | — | — | bench, box | — | none |
| RF-EX-036 | Monster walk | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, support_strength | isotonic | neuromuscular_control | — | — | — | resistance_band | — | none |
| RF-EX-037 | Plyometric glute bridge | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, plyometric, power, support_strength | plyometric | strength_development, tissue_capacity, neuromuscular_control, elastic_reactivity, landing_tolerance, rate_of_force_development | bridge, hip_extension | — | — | bodyweight | — | none |
| RF-EX-038 | Plyometric hip thrust | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, plyometric, power, support_strength, trunk_pelvis_control | plyometric | strength_development, tissue_capacity, neuromuscular_control, elastic_reactivity, landing_tolerance, rate_of_force_development | hip_thrust, hip_extension | — | — | bench, box | — | none |
| RF-EX-039 | Side plank | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isometric_strength, trunk_pelvis_control | isometric | strength_development, tissue_capacity, neuromuscular_control | trunk_lateral_stability | — | — | bodyweight | — | none |
| RF-EX-040 | Front plank | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, isometric_strength, trunk_pelvis_control | isometric | strength_development, tissue_capacity, neuromuscular_control | trunk_anti_extension | — | — | bodyweight | — | none |
| RF-EX-041 | Dead bug | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, trunk_pelvis_control | motor_control, isometric | neuromuscular_control | trunk_anti_extension | — | — | bodyweight | — | none |
| RF-EX-042 | Pallof press | true_exercise | exercise_knowledge | RF-EX | keep | motor_control, trunk_pelvis_control | isometric | neuromuscular_control | trunk_anti_rotation | — | — | resistance_band | — | none |
| RF-EX-043 | Ankling drill | exercise_drill | exercise_knowledge | RF-EX | keep | reactive_strength, running_mechanics | reactive | movement_quality, sport_patterning, elastic_reactivity | running_drill | — | — | open_field | — | none |
| RF-EX-044 | Skipping drill | exercise_drill | exercise_knowledge | RF-EX | keep | reactive_strength, running_mechanics | reactive | movement_quality, sport_patterning, elastic_reactivity | running_drill | — | — | open_field | — | none |
| RF-EX-045 | Bounding drill | exercise_drill | exercise_knowledge | RF-EX | keep | plyometric, power, reactive_strength, running_mechanics, sprint_mechanics | plyometric, reactive | movement_quality, sport_patterning, elastic_reactivity | bounding, running_drill, sprint_drill | — | — | open_field | max_velocity_sprinting, linear_acceleration, repeated_sprinting, field_movement | none |
| RF-EX-046 | High-knees running drill | exercise_drill | exercise_knowledge | RF-EX | keep | running_mechanics, sprint_mechanics | — | movement_quality, sport_patterning | hip_flexion, running_drill, sprint_drill | — | — | open_field | max_velocity_sprinting, linear_acceleration, repeated_sprinting | none |
| RF-EX-047 | Butt-kickers drill | exercise_drill | exercise_knowledge | RF-EX | keep | mobility, dynamic_mobility, running_mechanics, conditioning_support | — | movement_quality, sport_patterning | running_drill, cycling_pattern | — | — | open_field | cycling | none |
| RF-EX-048 | Toe-off pelvic-control running drill | exercise_drill | exercise_knowledge | RF-EX | keep | motor_control, running_mechanics | motor_control, dynamic_control | movement_quality, sport_patterning | running_drill | — | — | open_field | — | none |
| RF-EX-049 | Mid-stance running mechanics drill | exercise_drill | exercise_knowledge | RF-EX | keep | running_mechanics | dynamic_control | movement_quality, sport_patterning | running_drill | — | — | open_field | — | none |
| RF-EX-050 | Rotational-control running drill | exercise_drill | exercise_knowledge | RF-EX | keep | motor_control, running_mechanics, trunk_pelvis_control | dynamic_control | movement_quality, sport_patterning | running_drill | — | — | open_field | — | none |
| RF-EX-051 | Acceleration mechanics drill | exercise_drill | exercise_knowledge | RF-EX | keep | sprint_mechanics | — | movement_quality, sport_patterning | sprint_drill | — | — | open_field | max_velocity_sprinting, linear_acceleration, repeated_sprinting, field_movement | none |
| RF-EX-052 | Deceleration mechanics drill | exercise_drill | exercise_knowledge | RF-EX | keep | change_of_direction_mechanics | eccentric, dynamic_control | movement_quality, sport_patterning | deceleration_drill, cutting_drill | — | — | open_field, cones | deceleration, change_of_direction, field_movement | none |
| RF-EX-053 | Change-of-direction mechanics drill | exercise_drill | exercise_knowledge | RF-EX | keep | change_of_direction_mechanics | dynamic_control, concentric, eccentric | movement_quality, sport_patterning | cutting_drill | — | — | open_field, cones | change_of_direction, field_movement | none |
| RF-EX-054 | Short-distance running exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | — | running | — | track, open_field | endurance_running, field_movement | high |
| RF-EX-055 | Moderate-distance running exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | — | running | — | track, open_field | endurance_running, field_movement | high |
| RF-EX-056 | Acceleration exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | sprint_drill | acceleration | — | track, open_field | max_velocity_sprinting, linear_acceleration, field_movement | high |
| RF-EX-057 | Step bilateral landing | exercise_drill | exercise_knowledge | RF-EX | keep | plyometric, landing_control | eccentric | movement_quality, sport_patterning, landing_tolerance | landing | — | — | box, step | landing, field_movement | none |
| RF-EX-058 | Step unilateral landing | exercise_drill | exercise_knowledge | RF-EX | keep | motor_control, plyometric, landing_control | eccentric | movement_quality, sport_patterning, landing_tolerance | landing | — | — | box, step | landing, field_movement | none |
| RF-EX-059 | Bilateral squat jump | true_exercise | exercise_knowledge | RF-EX | keep | plyometric, power, landing_control | plyometric | strength_development, tissue_capacity, elastic_reactivity, landing_tolerance, rate_of_force_development | squat, landing, jumping | — | — | bodyweight | jumping, landing, field_movement | none |
| RF-EX-060 | Plyometric jump | true_exercise | exercise_knowledge | RF-EX | keep | plyometric, power, landing_control, reactive_strength | plyometric | elastic_reactivity, landing_tolerance, rate_of_force_development | landing, jumping | — | — | bodyweight, open_field | jumping, landing, field_movement | none |
| RF-EX-061 | Countermovement jump | assessment_overlap | dual_reference_exercise_and_assessment | DUAL | cross_reference_later | plyometric, power, landing_control | stretch_shortening_cycle, plyometric | exposure_preparation, symptom_monitoring_context | landing, jumping | — | jump_capacity, landing_quality, neuromuscular_control, readiness_gate | bodyweight, force_plate | jumping, landing, field_movement | medium |
| RF-EX-062 | Drop jump | assessment_overlap | dual_reference_exercise_and_assessment | DUAL | cross_reference_later | plyometric, landing_control, reactive_strength | plyometric, reactive, stretch_shortening_cycle | exposure_preparation, symptom_monitoring_context | landing, jumping | — | jump_capacity, landing_quality, neuromuscular_control, readiness_gate | box, force_plate | jumping, landing, field_movement | medium |
| RF-EX-063 | Integrated limb reactivity drill | exercise_drill | exercise_knowledge | RF-EX | keep | plyometric, reactive_strength | reactive | movement_quality, sport_patterning, elastic_reactivity | — | — | — | open_field | field_movement | none |
| RF-EX-064 | Low-intensity hopping | true_exercise | exercise_knowledge | RF-EX | keep | plyometric, reactive_strength | plyometric, reactive | elastic_reactivity, landing_tolerance, rate_of_force_development | hopping | — | — | open_field | field_movement | none |
| RF-EX-065 | Open-chain kicking pattern exercise | exercise_drill | exercise_knowledge | RF-EX | keep | kicking_mechanics, sport_preparation_drill | — | movement_quality, sport_patterning | kicking_drill | — | — | open_field, ball | kicking | none |
| RF-EX-066 | Static isolated kicking exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | dynamic_control | exposure_preparation | kicking_drill | kicking_exposure | — | open_field, ball | kicking | high |
| RF-EX-067 | Controlled kicking exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | kicking_drill | kicking_exposure | — | open_field, ball | kicking | high |
| RF-EX-068 | Resisted kicking exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | resisted | exposure_preparation | kicking_drill | kicking_exposure | — | resistance_band, cable_machine, leg_extension_machine, ball | kicking, field_movement | high |
| RF-EX-069 | Ball-training with kicking | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | kicking_mechanics, sport_preparation_drill | — | symptom_monitoring_context | kicking_drill | kicking_exposure | — | ball, open_field | kicking | low |
| RF-EX-070 | Game-based kicking scenario exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | kicking_drill | kicking_exposure, game_based_exposure | — | ball, open_field | kicking, field_movement | high |
| RF-EX-071 | Game-based training exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | sport_preparation_drill | — | symptom_monitoring_context | — | team_training, controlled_practice | — | open_field | field_movement | low |
| RF-EX-072 | Ball exercises | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | sport_preparation_drill | — | symptom_monitoring_context | — | — | — | ball | — | low |
| RF-EX-073 | Sport-specific running exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | — | running, field_training | — | open_field | field_movement | high |
| RF-EX-074 | Mixed generic and sport-specific running exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | — | running, field_training | — | open_field | field_movement | high |
| RF-EX-075 | High-speed running exposure | activity_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | — | — | exposure_preparation | sprint_drill | high_speed_running | — | track, open_field | max_velocity_sprinting, linear_acceleration, field_movement | high |
| RF-EX-076 | Sprinting exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | sprint_mechanics | — | symptom_monitoring_context | sprint_drill | sprinting | — | track, open_field | max_velocity_sprinting, linear_acceleration, field_movement | low |
| RF-EX-077 | Dynamic agility exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | change_of_direction_mechanics | — | symptom_monitoring_context | cutting_drill | change_of_direction | — | open_field, cones | change_of_direction, field_movement | low |
| RF-EX-078 | Walking exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | — | — | symptom_monitoring_context | — | walking | — | open_field | — | low |
| RF-EX-079 | Jogging / light-jogging exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | conditioning_support | — | symptom_monitoring_context | — | jogging | — | track, open_field | endurance_running | low |
| RF-EX-080 | Static cycling / stationary bike conditioning | conditioning_exposure | restricted_context_only | RESTRICTED | restrict_and_review | conditioning_support | — | maintenance_training, general_capacity | cycling_pattern | cycling, gym_conditioning | — | stationary_bike | cycling | low |
| RF-EX-081 | Pool training / swimming conditioning | conditioning_exposure | restricted_context_only | RESTRICTED | restrict_and_review | conditioning_support | — | maintenance_training, general_capacity | swimming_pattern | swimming, pool_training, gym_conditioning | — | pool | swimming | low |
| RF-EX-082 | Elliptical conditioning | conditioning_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | conditioning_support | — | maintenance_training, general_capacity | — | elliptical, gym_conditioning | — | elliptical, leg_extension_machine | — | high |
| RF-EX-083 | Calisthenics conditioning | conditioning_exposure | activity_exposure_knowledge | RF-ACT | migrate_later | conditioning_support | — | maintenance_training, general_capacity | — | gym_conditioning | — | bodyweight | — | high |
| RF-EX-084 | Cybex machine exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | — | — | symptom_monitoring_context | — | — | — | leg_extension_machine | — | low |
| RF-EX-085 | Well-leg gravity-assisted passive knee-flexion motion | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | mobility | passive | symptom_monitoring_context | — | — | — | bodyweight | — | low |
| RF-EX-086 | Full/deep squat restricted-context exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | isotonic_strength | — | symptom_monitoring_context | squat | — | — | bodyweight | — | low |
| RF-EX-087 | Generic weight-training exposure | restricted_context_only | restricted_context_only | RESTRICTED | restrict_and_review | isotonic_strength | — | symptom_monitoring_context | — | gym_conditioning | — | — | — | low |
