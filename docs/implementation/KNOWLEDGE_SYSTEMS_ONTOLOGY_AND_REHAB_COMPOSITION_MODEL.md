# Knowledge Systems Ontology & Rehab Composition Model

**Status:** scaffold / ontology only · pending · NON-EXECUTABLE · not clinically approved · no runtime integration.
Companion taxonomies: `lib/clinical/sharedKnowledgeTaxonomies/`.

> This document defines structure and vocabulary only. It creates no dosage, no progression
> authorization, no readiness authorization, no RTT/RTS clearance, and no plan generation. Existing
> objects RF-EX-001…087 are **not** moved by this document.

## 1. Purpose
A world-class rehab platform cannot treat every item as an "exercise." Today RF-EX-001…087 mix true
exercises with activity exposures, conditioning exposures, sport exposures, and restricted-context
metadata. Collapsing these into one bucket causes **clearance leakage** — e.g. a "sprinting" or
"match play" item being treated like a prescribable exercise. The system must separate:
- **true exercises / drills** — things an athlete performs as training,
- **activity / sport exposure domains** — things to be reintroduced, restricted, monitored, or
  progressed later by rules,
- **assessments / tests / readiness measures** — evidence about safety, diagnosis, capacity, and
  readiness.

This separation prevents clearance leakage and lets future rehab plans be **curated, sport-specific,
equipment-aware, function-aware, and clinically governed**.

## 2. Three-system model

### Exercise Knowledge System — "What exercise can this athlete do?"
Actual exercises and drills: warm-up, mobility, activation, motor-control drills, isometric/isotonic/
eccentric/concentric/long-length/heavy/tempo strength, power, plyometrics, landing mechanics, running
mechanics drills, kicking mechanics drills, support strength, sport-preparation drills.

### Activity Exposure Knowledge System — "What activity domain must be reintroduced, restricted, monitored, or progressed later by rules?"
Activity/sport exposure domains: walking, jogging, running, high-speed running, sprinting,
acceleration, deceleration, change of direction, kicking, cycling, swimming, pool training,
elliptical, court movement, field movement, team training, match play, sport-specific exposure.

### Assessment Knowledge System — "What evidence do we have about safety, diagnosis, capacity, and readiness?"
Tests, screens, and readiness/capacity evidence: pain provocation tests, resisted muscle tests, range
of motion checks, 90/90 RF break, SLR break, Ely/prone knee bend, single-leg squat assessment, hop
tests, CMJ test, drop jump test, force plate measures, GPS exposure checks, kicking tolerance tests,
next-day response checks, red flag screens.

## 3. Exercise function taxonomy
File: `exerciseFunctionTaxonomy.json`. Formal function categories
(`warm_up_general`, `warm_up_tissue_specific`, `mobility`, `dynamic_mobility`, `activation`,
`motor_control`, `isometric_strength`, `isotonic_strength`, `eccentric_strength`, `concentric_strength`,
`long_length_strength`, `heavy_strength`, `tempo_strength`, `endurance_strength`, `power`, `plyometric`,
`landing_control`, `reactive_strength`, `running_mechanics`, `sprint_mechanics`, `kicking_mechanics`,
`change_of_direction_mechanics`, `support_strength`, `trunk_pelvis_control`, `balance_proprioception`,
`conditioning_support`, `sport_preparation_drill`). Each category records `meaning`, `when_used`,
`must_not_imply` (dose/load/progression/readiness/clearance), `common_examples`, and
`can_appear_in_blocks` (warm-up / main work / accessory / sport-prep / conditioning).

## 4. Contraction taxonomy
File: `contractionTaxonomy.json`. Categories: `isometric`, `concentric`, `eccentric`, `isotonic`,
`isokinetic_context_only`, `plyometric`, `reactive`, `ballistic`, `stretch_shortening_cycle`,
`dynamic_control`, `motor_control`, `passive`, `assisted`, `resisted`, `unloaded`, `external_load`,
`tempo_controlled`. **Contraction type is metadata only and does not itself prescribe dose, load,
progression, or clearance.**

## 5. Exercise intent taxonomy
File: `exerciseIntentTaxonomy.json`. Categories: `pain_modulation`, `tissue_capacity`,
`range_restoration`, `neuromuscular_control`, `movement_quality`, `strength_development`,
`hypertrophy_support`, `rate_of_force_development`, `elastic_reactivity`, `landing_tolerance`,
`sport_patterning`, `exposure_preparation`, `maintenance_training`, `general_capacity`,
`confidence_rebuilding`, `symptom_monitoring_context`.

## 6. Movement pattern taxonomy
File: `movementPatternTaxonomy.json`. Categories include `squat`, `hinge`, `lunge`, `step_up`,
`bridge`, `hip_thrust`, `knee_extension`, `hip_flexion`, `hip_extension`, `trunk_anti_extension`,
`trunk_anti_rotation`, `trunk_lateral_stability`, `adduction`, `abduction`, `calf_raise`, `hopping`,
`jumping`, `landing`, `bounding`, `running_drill`, `sprint_drill`, `kicking_drill`, `cutting_drill`,
`deceleration_drill`, `carry`, `throw`, `pull`, `push`, `swimming_pattern`, `cycling_pattern`.

## 7. Equipment taxonomy
File: `equipmentTaxonomy.json`. Each item is classified by setting (`home`, `gym`, `clinic`, `field`,
`lab`) and defaults to `optional`; **required-vs-optional is resolved later per exercise/plan, never by
this taxonomy.** Items span bodyweight/floor/wall/chair/bench/box/step, bands, machines, free weights,
sled, medicine ball, suspension trainer, swiss ball, slider, foam roller, cardio machines, pool, field/
court/track, cones, ball, and measurement tools (force plate, handheld dynamometer, GPS, phone camera,
wearable sensor).

## 8. Sport demand taxonomy
File: `sportDemandTaxonomy.json`. A **demand-based** model. Demand categories include
`linear_acceleration`, `max_velocity_sprinting`, `repeated_sprinting`, `deceleration`,
`change_of_direction`, `lateral_cutting`, `jumping`, `landing`, `kicking`, `throwing`, `striking`,
`swimming`, `cycling`, `endurance_running`, `rotational_power`, `contact_collision`, `grappling`,
`agility_reactivity`, `sustained_aerobic_load`, `repeated_high_intensity_intervals`, `end_range_mobility`,
`overhead_demand`, `court_movement`, `field_movement`. Sport→demand examples are provided for
football/soccer, basketball, tennis, padel, volleyball, track sprinting, distance running, rugby,
American football, martial arts, dance, gymnastics, swimming, cycling, rowing, hockey, handball, squash,
baseball/softball, and golf. **Sport name does not directly select exercises** — sport maps to a demand
profile, and demands combine with injury rules, stage, safety, capacity, equipment, and goals.

## 9. Activity exposure taxonomy
File: `activityExposureTaxonomy.json`. Categories: `walking`, `stairs`, `jogging`, `running`,
`tempo_running`, `high_speed_running`, `sprinting`, `acceleration`, `deceleration`, `change_of_direction`,
`lateral_shuffle`, `cutting`, `jumping_exposure`, `landing_exposure`, `kicking_exposure`,
`throwing_exposure`, `swimming`, `cycling`, `elliptical`, `pool_training`, `field_training`,
`court_training`, `gym_conditioning`, `team_training`, `controlled_practice`, `game_based_exposure`,
`match_play`. Each records what it is, what it is **not** (not an exercise, plan, dose, or clearance),
related sports, a `clearance_sensitive` flag, and `must_monitor` signals.

## 10. Assessment purpose taxonomy
File: `assessmentPurposeTaxonomy.json`. Categories: `red_flag_screen`, `diagnosis_support`,
`pain_response`, `range_of_motion`, `strength_capacity`, `strength_symmetry`, `endurance_capacity`,
`neuromuscular_control`, `landing_quality`, `jump_capacity`, `sprint_tolerance`, `kicking_tolerance`,
`change_of_direction_tolerance`, `sport_specific_tolerance`, `next_day_response`, `readiness_gate`,
`return_to_training_gate`, `return_to_sport_gate`. **Assessment objects record evidence only; they do not
prescribe rehab and do not clear athletes unless future governed readiness rules explicitly authorize
that decision.**

## 11. Rehab plan block taxonomy
File: `rehabPlanBlockTaxonomy.json`. Future blocks: `safety_check`, `warm_up_general`,
`warm_up_tissue_specific`, `mobility_block`, `activation_block`, `tissue_loading_block`, `strength_block`,
`support_strength_block`, `motor_control_block`, `plyometric_block`, `running_mechanics_block`,
`sport_mechanics_block`, `activity_exposure_block`, `conditioning_block`, `assessment_gate`,
`monitoring_check`, `recovery_block`. Each records which knowledge system it `pulls_from`, what it
`can_contain`, what it `must_not_contain`, and that selection is `governed_by` the future rule engine.

## 12. Rehab composition model
File: `rehabCompositionModel.json`. A rehab day may be composed as:
1. Safety check → 2. Warm-up → 3. Mobility / activation → 4. Tissue-specific loading →
5. Strength or support strength → 6. Plyometric or mechanics block if appropriate →
7. Activity exposure if appropriate → 8. Assessment / check-in gate if appropriate →
9. Monitoring instructions.
This is **structure only, not dosage.** No block creates dose, progression, readiness, RTT, or RTS
without future governed rules.

## 13. Multi-sport logic
The platform must not be football-only. It supports any sport by mapping **sport → demand profile**.
Exercise selection depends on: injury module, safety state, stage/capacity, athlete goals, sport
demands, available equipment, pain response, external load, and assessment evidence. Sport name alone
never selects exercises.

## 14. Migration implications for RF-EX-001 … RF-EX-087
- Existing objects **remain where they are for now** (no migration in this task).
- Later, RF-EX objects that are **true exercises** stay in Exercise Knowledge.
- **Activity exposures** migrate to Activity Exposure Knowledge with `RF-ACT` IDs.
- **Assessment / test** objects migrate or cross-reference to Assessment Knowledge with `RF-ASSESS` IDs.
- **Restricted-context** objects remain blocked unless governed future rules allow them.

Indicative (non-binding) future split: activity-exposure candidates include the running/sprint/landing/
agility/conditioning exposure objects (e.g. RF-EX-054/055/056, 073–083); assessment-overlap candidates
include CMJ/drop-jump (RF-EX-061/062) and any future 90/90-break, SLR-break, hop, and force-plate items;
restricted-context candidates (RF-EX-069, 071, 072, 076–081, 084–087) stay restricted. This mapping is
**documentation only** and moves nothing.

## 15. Governance
All three systems and all taxonomies are: **pending only · non-executable · not clinically approved ·
no runtime integration · no dosage · no progression authorization · no readiness authorization ·
no RTT/RTS clearance · no plan generation · no diagnosis-alone selection.** Unknown is not safe, and
restricted contexts remain restricted.
