# RF-CAP Overlay Authoring Plan

**Status:** planning / documentation only · pending · NON-EXECUTABLE · not clinically approved · no runtime integration.
**This task authors no objects.** It plans the first RF-CAP overlay batch before any overlay file is created.

> No RF-CAP objects authored in this task. No universal CAP objects modified. No RF-EX objects modified.
> No RF-ACT objects modified. No RF-ASSESS objects authored. No RF clinical rule objects modified. No
> runtime behavior. No diagnosis authority. No prescription. No dosage. No progression. No readiness.
> No RTT/RTS. No clearance authority. No assessment pass/fail decision. No demand-profile clearance.

## 1. Purpose
Define how the first RF-specific capacity overlays (`RF-CAP-###`) will refine the frozen universal
capacities (`CAP-###`) for the Rectus Femoris module, each linked via `universal_capacity_ref`. Planning
the batch first ensures overlays add only RF-specific *nuance* on top of a stable universal core and never
drift into clearance/readiness/prescription authority.

## 2. Why RF-CAP overlays come after universal CAP objects
Schema v2 requires `module_capacity_overlay` objects to reference a universal capacity via
`universal_capacity_ref`. An overlay cannot reference a `CAP-###` that does not exist. Universal CAP
Batch 1 (CAP-001…CAP-015) is now frozen draft metadata, so each overlay has a stable anchor; the overlay
describes RF expression/sensitivity only and never redefines the capacity.

## 3. Scope of RF-CAP Batch 1
Fifteen overlays, one per universal capacity (RF-CAP-001…RF-CAP-015 → CAP-001…CAP-015). Each adds RF
interpretation (anterior-thigh load sensitivity, hip-flexion/knee-extension demand context, sprinting/
kicking exposure sensitivity, lengthened-quadriceps loading context) and conceptual links to RF rules,
RF-EX, RF-ACT, future RF-ASSESS, and future demand profiles — all as inert metadata.

## 4. Governance constraints
All future RF-CAP overlays (and this plan) remain: draft · pending · clinically not approved ·
non-executable · runtime_integration none · `permitted_use: capacity_metadata_only`. No diagnosis
authority, assessment pass/fail, exercise prescription, dosage, progression, readiness, RTT/RTS,
clearance, runtime selection, or demand-profile clearance is created — now or by the objects this plan
describes. Unknown is not safe; goal sufficiency is evidence, not clearance.

## 5. Proposed RF-CAP overlay batch
| Overlay | universal_capacity_ref | Universal capacity |
|---|---|---|
| RF-CAP-001 | CAP-001 | walking_tolerance |
| RF-CAP-002 | CAP-002 | stairs_tolerance |
| RF-CAP-003 | CAP-003 | jogging_tolerance |
| RF-CAP-004 | CAP-004 | running_tolerance |
| RF-CAP-005 | CAP-005 | sprinting_tolerance |
| RF-CAP-006 | CAP-006 | acceleration_tolerance |
| RF-CAP-007 | CAP-007 | kicking_tolerance |
| RF-CAP-008 | CAP-008 | hip_flexion_mobility |
| RF-CAP-009 | CAP-009 | knee_flexion_tolerance |
| RF-CAP-010 | CAP-010 | anterior_thigh_tissue_load_tolerance |
| RF-CAP-011 | CAP-011 | isometric_strength_capacity |
| RF-CAP-012 | CAP-012 | eccentric_strength_capacity |
| RF-CAP-013 | CAP-013 | single_leg_control |
| RF-CAP-014 | CAP-014 | lumbopelvic_control |
| RF-CAP-015 | CAP-015 | movement_confidence |

## 6. Overlay authoring rules
- An overlay **refines** a universal capacity for RF; it never redefines or replaces it.
  Correct: `RF-CAP-004 running_tolerance_rf_overlay`, `universal_capacity_ref: CAP-004`.
  Incorrect: `RF-CAP-004 return_to_sport_running_clearance`.
- `capacity_object_type: module_capacity_overlay`, `module: rf`, `universal_capacity_ref: CAP-###`.
- Schema v2 status discipline (draft/pending/not_approved/exec false/runtime none/`capacity_metadata_only`).
- RF nuance lives in `capacity_tags`, `related_tissues`, `notes` (and cross-link arrays) — never as dose,
  threshold, score, timeline, or clearance.
- One overlay per universal capacity; no compound overlays; reference existing taxonomy values only.

## 7. Field-by-field Schema v2 guidance for overlays
- `capacity_id`: `RF-CAP-###`, sequential, matches filename.
- `capacity_object_type`: `module_capacity_overlay`. `module`: `rf`. `universal_capacity_ref`: the
  matching `CAP-###`.
- `name`: RF overlay name (e.g. `running_tolerance_rf_overlay`) — RF nuance, not a clearance label.
- Status fields: draft / pending / not_approved / `executable:false` / `runtime_integration:none` /
  `permitted_use:capacity_metadata_only`.
- `capacity_domain` / `capacity_subdomain`: inherit from the universal capacity (same domain/subdomain).
- `capacity_tags`: RF-specific qualitative descriptors (e.g. `anterior_thigh_load_sensitive`).
- `body_region` / `related_tissues`: may add RF-relevant anatomy (rectus femoris, anterior thigh) — as
  description, not pathology authority.
- `measured_by` / `improved_by` / `expressed_through` / `required_by` / `related_rehab_plan_blocks`:
  taxonomy references (may narrow to the RF-relevant subset of the universal capacity's links).
- `evidence_state: not_tested`, `goal_sufficiency_status: not_applicable`,
  `confidence_status: low_confidence` (no user state).
- `allowed_when`: inert context only. `blocked_when`: runtime selection / prescription / dosage /
  progression / readiness / RTT-RTS / clearance / standard-selection-without-governed-rules.
- `notes`: state RF interpretation + that it authorizes none of the prohibited outputs and refines
  `CAP-###` only.

## 8. RF-specific interpretation rules
Overlays may describe RF relevance such as: anterior-thigh load sensitivity; hip-flexion / knee-extension
demand context; sprinting exposure sensitivity; kicking exposure sensitivity; lengthened-quadriceps
loading context. They must **not** create diagnosis authority, assessment pass/fail, exercise
prescription, dosage, progression, readiness, RTT/RTS, clearance, or runtime selection.

## 9. Relationship to Universal CAP objects
Each overlay references exactly one `CAP-###` via `universal_capacity_ref` and inherits its domain/
subdomain. The universal object remains the canonical definition; the overlay adds RF nuance only and
does not modify the universal object.

## 10. Relationship to RF clinical rules
Overlays may name relevant RF rule IDs (e.g. RF-FIELD-*, RF-RECUR-*, RF-REHAB-*, RF-RTS-*, RF-SAF-*) as
`linked_rule_ids`-style conceptual references for context. References only — overlays neither modify RF
rules nor inherit their authority, and the RF rules remain the governing clinical logic.

## 11. Relationship to RF Exercise Knowledge
Overlays may reference RF-EX exercise-function relevance conceptually (which RF exercises develop the
capacity) but do not modify RF-EX objects and create no exercise prescription or dosage.

## 12. Relationship to RF Activity Exposure Knowledge
Overlays may reference RF-ACT domains/IDs conceptually but do not modify RF-ACT objects. **Use caution**
around the previously reviewer-gated RF-ACT objects: **RF-ACT-003, RF-ACT-005, RF-ACT-006, RF-ACT-007,
RF-ACT-008, RF-ACT-010** — referencing them must not imply they are runtime-selectable or cleared; they
remain reviewer-gated.

## 13. Relationship to future RF Assessment Knowledge
RF-ASSESS objects **do not exist yet**. Overlays may describe *future* assessment relevance (which
assessment purposes would measure the RF expression of the capacity) but must not author RF-ASSESS objects
or imply any existing assessment or clearance.

## 14. Relationship to Demand Profiles
The Demand Profile System **does not exist yet**. Overlays may describe *future* demand relevance, but
must not create demand profiles or demand-based clearance. Demand profiles will ultimately require
universal `CAP-###` capacities; RF overlays explain RF-specific nuance only.

## 15. High-caution overlay handling
For **RF-CAP-005 (sprinting_tolerance), RF-CAP-006 (acceleration_tolerance), RF-CAP-007 (kicking_tolerance),
RF-CAP-010 (anterior_thigh_tissue_load_tolerance), RF-CAP-012 (eccentric_strength_capacity), and
RF-CAP-015 (movement_confidence)**, each overlay must explicitly state it is:
- metadata only,
- not a readiness rule,
- not sprint clearance,
- not kicking clearance,
- not return-to-sport clearance,
- not competition clearance,
- not a progression gate,
- requires future clinical review before runtime use.

## 16. Objects explicitly excluded from RF-CAP Batch 1
Not RF-CAP Batch 1 overlays (deferred to future assessment/readiness/demand systems):
return-to-sport readiness overlays; competition readiness overlays; sprint clearance overlays; kicking
clearance overlays; pain-threshold clearance overlays; GPS load-metric overlays; force-plate metric
overlays; reactive strength index overlays; objective performance-test pass/fail overlays.

## 17. Audit checklist before overlay authoring
Before any `RF-CAP-###` file is written, confirm:
1. Universal CAP Batch 1 is frozen and `npm run validate:capacity-knowledge` passes (15 universal / 0 RF).
2. Each overlay sets `capacity_object_type: module_capacity_overlay`, `module: rf`, and a
   `universal_capacity_ref` resolving to an existing `CAP-###`.
3. Domain/subdomain match the referenced universal capacity.
4. Status discipline correct (draft/pending/not_approved/exec false/runtime none/metadata only); defaults
   `evidence_state: not_tested`, `goal_sufficiency_status: not_applicable`, `confidence_status: low_confidence`.
5. Cross-link arrays use only existing shared-taxonomy values and existing RF-ACT/RF rule IDs; no RF-ASSESS
   or demand-profile objects referenced as existing.
6. No score/threshold/pass-fail/timeline/dosage/prescription/progression/readiness/RTT-RTS/clearance.
7. High-caution overlays (§15) carry the explicit no-clearance/no-readiness/requires-review statements.
8. Reviewer-gated RF-ACT references (§12) are not implied to be runtime-selectable.
9. IDs sequential RF-CAP-001…RF-CAP-015, filename = `capacity_id`; status/source-map RF overlay count
   updated to 15; universal count stays 15.
10. Capacity validator upgraded to validate overlays (incl. `universal_capacity_ref` resolves); all eight
    governance checks green. No RF-EX/RF-ACT/RF-ASSESS/RF-rule/runtime change.

## 18. Recommended next task
**Author RF-CAP overlay Batch 1 (RF-CAP-001…RF-CAP-015)** as a governed authoring task: upgrade the
capacity validator to validate `module_capacity_overlay` objects (sequential RF-CAP IDs, each
`universal_capacity_ref` resolving to a CAP-### object, domain/subdomain inheritance), author the 15
overlays per this plan, update status and the RF source map (RF overlay count → 15), and re-run all eight
checks. Then: clinical red-team audit of the overlays, then the cross-reference validator, then the Demand
Profile System scaffold.

---

## Per-overlay planning detail

### RF-CAP-001 — walking_tolerance_rf_overlay
- planned_overlay_id: RF-CAP-001
- planned_name: walking_tolerance_rf_overlay
- universal_capacity_ref: CAP-001 · universal_capacity_name: walking_tolerance
- rf_specific_interpretation: early RF gait/load tolerance; low anterior-thigh demand baseline.
- why_relevant_to_rectus_femoris: baseline daily-life load the RF must tolerate before higher demand.
- likely_rf_rule_relevance: RF-SAF-006 (restriction context), RF-REHAB-001
- likely_rf_exercise_relevance: conditioning_support, motor_control RF-EX items
- likely_rf_activity_exposure_relevance: walking (general activity-exposure domain)
- future_rf_assessment_relevance: pain_response / next_day_response (future RF-ASSESS)
- likely_demand_profile_relevance: field_movement, court_movement (future demand profiles)
- overlay_boundary_notes: metadata only; refines CAP-001; no clearance/dosage/progression.
- risk_level: low
- reviewer_notes: keep as tolerance baseline, not a gait diagnosis.

### RF-CAP-002 — stairs_tolerance_rf_overlay
- planned_overlay_id: RF-CAP-002
- planned_name: stairs_tolerance_rf_overlay
- universal_capacity_ref: CAP-002 · universal_capacity_name: stairs_tolerance
- rf_specific_interpretation: loaded hip-flexion/knee-extension demand in daily stair use.
- why_relevant_to_rectus_femoris: early functional anterior-thigh load marker.
- likely_rf_rule_relevance: RF-REHAB-001, RF-REHAB-006
- likely_rf_exercise_relevance: support_strength, isotonic_strength RF-EX items
- likely_rf_activity_exposure_relevance: stairs (general activity-exposure domain)
- future_rf_assessment_relevance: pain_response / next_day_response
- likely_demand_profile_relevance: field_movement, court_movement
- overlay_boundary_notes: metadata only; refines CAP-002.
- risk_level: low
- reviewer_notes: daily-life capacity, not a performance test.

### RF-CAP-003 — jogging_tolerance_rf_overlay
- planned_overlay_id: RF-CAP-003
- planned_name: jogging_tolerance_rf_overlay
- universal_capacity_ref: CAP-003 · universal_capacity_name: jogging_tolerance
- rf_specific_interpretation: low-speed running RF load reintroduction sensitivity.
- why_relevant_to_rectus_femoris: early running reintroduction; anterior-thigh response monitored.
- likely_rf_rule_relevance: RF-FIELD-001, RF-FIELD-003, RF-RTS-004
- likely_rf_exercise_relevance: running_mechanics RF-EX drills
- likely_rf_activity_exposure_relevance: RF-ACT-001/002 (short/moderate running exposure)
- future_rf_assessment_relevance: pain_response / next_day_response / endurance
- likely_demand_profile_relevance: endurance_running, field_movement
- overlay_boundary_notes: metadata only; refines CAP-003; not running clearance.
- risk_level: low
- reviewer_notes: references RF-ACT (not runtime-selectable).

### RF-CAP-004 — running_tolerance_rf_overlay
- planned_overlay_id: RF-CAP-004
- planned_name: running_tolerance_rf_overlay
- universal_capacity_ref: CAP-004 · universal_capacity_name: running_tolerance
- rf_specific_interpretation: sustained running RF load tolerance; hip-flexion cycling demand.
- why_relevant_to_rectus_femoris: central RF reintroduction capacity.
- likely_rf_rule_relevance: RF-FIELD-001, RF-FIELD-003, RF-RTS-004
- likely_rf_exercise_relevance: running_mechanics, eccentric_strength RF-EX items
- likely_rf_activity_exposure_relevance: RF-ACT-001/002; RF-ACT-008/009 (sport-specific/mixed running)
- future_rf_assessment_relevance: pain_response / next_day_response / endurance
- likely_demand_profile_relevance: endurance_running, repeated_sprinting, field_movement
- overlay_boundary_notes: metadata only; refines CAP-004; not running clearance.
- risk_level: low
- reviewer_notes: RF-ACT-008 is reviewer-gated — reference only.

### RF-CAP-005 — sprinting_tolerance_rf_overlay (HIGH CAUTION)
- planned_overlay_id: RF-CAP-005
- planned_name: sprinting_tolerance_rf_overlay
- universal_capacity_ref: CAP-005 · universal_capacity_name: sprinting_tolerance
- rf_specific_interpretation: high-speed RF load sensitivity; lengthened high-velocity hip-flexion demand.
- why_relevant_to_rectus_femoris: high-risk RF exposure; recurrence-sensitive.
- likely_rf_rule_relevance: RF-FIELD-002, RF-FIELD-003, RF-FIELD-005, RF-RECUR-002, RF-RTS-004
- likely_rf_exercise_relevance: sprint_mechanics, eccentric_strength, plyometric RF-EX items
- likely_rf_activity_exposure_relevance: RF-ACT-003 (acceleration), RF-ACT-010 (high-speed) — reviewer-gated
- future_rf_assessment_relevance: sprint_tolerance (future RF-ASSESS)
- likely_demand_profile_relevance: max_velocity_sprinting, repeated_sprinting, linear_acceleration
- overlay_boundary_notes: **metadata only; not a readiness rule; not sprint clearance; not return-to-sport clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**
- risk_level: high
- reviewer_notes: never imply RF-ACT-003/010 are runtime-selectable.

### RF-CAP-006 — acceleration_tolerance_rf_overlay (HIGH CAUTION)
- planned_overlay_id: RF-CAP-006
- planned_name: acceleration_tolerance_rf_overlay
- universal_capacity_ref: CAP-006 · universal_capacity_name: acceleration_tolerance
- rf_specific_interpretation: forward-drive hip-flexor/anterior-thigh demand during acceleration.
- why_relevant_to_rectus_femoris: high anterior-thigh demand phase; recurrence-sensitive.
- likely_rf_rule_relevance: RF-FIELD-001, RF-FIELD-003, RF-FIELD-005, RF-RTS-004
- likely_rf_exercise_relevance: sprint_mechanics, power, support_strength RF-EX items
- likely_rf_activity_exposure_relevance: RF-ACT-003 (acceleration) — reviewer-gated
- future_rf_assessment_relevance: sprint_tolerance (future RF-ASSESS)
- likely_demand_profile_relevance: linear_acceleration, repeated_sprinting, field_movement
- overlay_boundary_notes: **metadata only; not a readiness rule; not sprint clearance; not return-to-sport clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**
- risk_level: high
- reviewer_notes: distinct from sprinting; RF-ACT-003 reviewer-gated.

### RF-CAP-007 — kicking_tolerance_rf_overlay (HIGH CAUTION)
- planned_overlay_id: RF-CAP-007
- planned_name: kicking_tolerance_rf_overlay
- universal_capacity_ref: CAP-007 · universal_capacity_name: kicking_tolerance
- rf_specific_interpretation: combined hip-flexion + knee-extension swing load; key RF exposure.
- why_relevant_to_rectus_femoris: highest-specificity RF exposure; recurrence-sensitive.
- likely_rf_rule_relevance: RF-FIELD-004, RF-RECUR-002, RF-RTS-004
- likely_rf_exercise_relevance: kicking_mechanics, eccentric_strength RF-EX items
- likely_rf_activity_exposure_relevance: RF-ACT-005/006/007 (kicking exposures) — reviewer-gated
- future_rf_assessment_relevance: kicking_tolerance (future RF-ASSESS)
- likely_demand_profile_relevance: kicking
- overlay_boundary_notes: **metadata only; not a readiness rule; not kicking clearance; not sprint clearance; not return-to-sport clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**
- risk_level: high
- reviewer_notes: RF-ACT-005/006/007 reviewer-gated — reference only.

### RF-CAP-008 — hip_flexion_mobility_rf_overlay
- planned_overlay_id: RF-CAP-008
- planned_name: hip_flexion_mobility_rf_overlay
- universal_capacity_ref: CAP-008 · universal_capacity_name: hip_flexion_mobility
- rf_specific_interpretation: hip-flexion range relevant to RF (two-joint muscle) function.
- why_relevant_to_rectus_femoris: RF crosses the hip; flexion range supports loading.
- likely_rf_rule_relevance: RF-REHAB-001, RF-REHAB-002
- likely_rf_exercise_relevance: mobility, dynamic_mobility, activation RF-EX items
- likely_rf_activity_exposure_relevance: running / kicking exposure context
- future_rf_assessment_relevance: range_of_motion / pain_response
- likely_demand_profile_relevance: kicking, end_range_mobility, field_movement
- overlay_boundary_notes: metadata only; refines CAP-008; not a stretch prescription.
- risk_level: low
- reviewer_notes: no ROM degrees.

### RF-CAP-009 — knee_flexion_tolerance_rf_overlay
- planned_overlay_id: RF-CAP-009
- planned_name: knee_flexion_tolerance_rf_overlay
- universal_capacity_ref: CAP-009 · universal_capacity_name: knee_flexion_tolerance
- rf_specific_interpretation: lengthened anterior-thigh (RF) loading tolerance.
- why_relevant_to_rectus_femoris: lengthened RF position; reverse-Nordic-type demand context.
- likely_rf_rule_relevance: RF-REHAB-002, RF-REHAB-004, RF-RECUR-002
- likely_rf_exercise_relevance: long_length_strength, eccentric_strength, mobility RF-EX items
- likely_rf_activity_exposure_relevance: kicking exposure context
- future_rf_assessment_relevance: range_of_motion / pain_response / next_day_response
- likely_demand_profile_relevance: end_range_mobility, kicking
- overlay_boundary_notes: metadata only; refines CAP-009; no ROM/dose values.
- risk_level: medium
- reviewer_notes: lengthened-load sensitivity; keep non-prescriptive.

### RF-CAP-010 — anterior_thigh_tissue_load_tolerance_rf_overlay (HIGH CAUTION)
- planned_overlay_id: RF-CAP-010
- planned_name: anterior_thigh_tissue_load_tolerance_rf_overlay
- universal_capacity_ref: CAP-010 · universal_capacity_name: anterior_thigh_tissue_load_tolerance
- rf_specific_interpretation: rectus-femoris-specific tissue load sensitivity and capacity.
- why_relevant_to_rectus_femoris: the core RF tissue-capacity concept for the slice.
- likely_rf_rule_relevance: RF-SEV-004, RF-REHAB-001/002/004, RF-RTS-004
- likely_rf_exercise_relevance: isometric/isotonic/eccentric/long_length strength RF-EX items
- likely_rf_activity_exposure_relevance: running / sprinting / kicking exposure context
- future_rf_assessment_relevance: strength_capacity / pain_response / next_day_response
- likely_demand_profile_relevance: max_velocity_sprinting, kicking, linear_acceleration
- overlay_boundary_notes: **metadata only; not a readiness rule; not sprint/kicking clearance; not return-to-sport clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**
- risk_level: high
- reviewer_notes: RF tissue sensitivity nuance only; no load thresholds.

### RF-CAP-011 — isometric_strength_capacity_rf_overlay
- planned_overlay_id: RF-CAP-011
- planned_name: isometric_strength_capacity_rf_overlay
- universal_capacity_ref: CAP-011 · universal_capacity_name: isometric_strength_capacity
- rf_specific_interpretation: early RF isometric loading / pain-modulation context.
- why_relevant_to_rectus_femoris: early-stage RF loading entry point.
- likely_rf_rule_relevance: RF-REHAB-001, RF-REHAB-002
- likely_rf_exercise_relevance: isometric_strength, activation RF-EX items
- likely_rf_activity_exposure_relevance: n/a (gym context)
- future_rf_assessment_relevance: strength_capacity / strength_symmetry
- likely_demand_profile_relevance: field_movement, court_movement
- overlay_boundary_notes: metadata only; refines CAP-011; no load prescription.
- risk_level: low
- reviewer_notes: no kg/%.

### RF-CAP-012 — eccentric_strength_capacity_rf_overlay (HIGH CAUTION)
- planned_overlay_id: RF-CAP-012
- planned_name: eccentric_strength_capacity_rf_overlay
- universal_capacity_ref: CAP-012 · universal_capacity_name: eccentric_strength_capacity
- rf_specific_interpretation: lengthened/eccentric RF capacity for high-speed and kicking demands.
- why_relevant_to_rectus_femoris: protective capacity for high-risk RF exposures.
- likely_rf_rule_relevance: RF-REHAB-002, RF-REHAB-004, RF-RECUR-002, RF-RTS-004
- likely_rf_exercise_relevance: eccentric_strength, long_length_strength RF-EX items
- likely_rf_activity_exposure_relevance: high-speed running / kicking exposure context
- future_rf_assessment_relevance: strength_capacity / strength_symmetry / pain_response
- likely_demand_profile_relevance: max_velocity_sprinting, kicking, deceleration
- overlay_boundary_notes: **metadata only; not a readiness rule; not sprint/kicking clearance; not return-to-sport clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**
- risk_level: high
- reviewer_notes: capacity nuance only; no eccentric dose.

### RF-CAP-013 — single_leg_control_rf_overlay
- planned_overlay_id: RF-CAP-013
- planned_name: single_leg_control_rf_overlay
- universal_capacity_ref: CAP-013 · universal_capacity_name: single_leg_control
- rf_specific_interpretation: single-leg control supporting RF running/landing reintroduction.
- why_relevant_to_rectus_femoris: control quality underpinning higher RF demands.
- likely_rf_rule_relevance: RF-REHAB-002, RF-REHAB-006
- likely_rf_exercise_relevance: motor_control, balance_proprioception, support_strength RF-EX items
- likely_rf_activity_exposure_relevance: running / change-of-direction context
- future_rf_assessment_relevance: neuromuscular_control / landing_quality
- likely_demand_profile_relevance: change_of_direction, landing, field_movement
- overlay_boundary_notes: metadata only; refines CAP-013; assessment use lives in future RF-ASSESS.
- risk_level: low
- reviewer_notes: no embedded pass/fail.

### RF-CAP-014 — lumbopelvic_control_rf_overlay
- planned_overlay_id: RF-CAP-014
- planned_name: lumbopelvic_control_rf_overlay
- universal_capacity_ref: CAP-014 · universal_capacity_name: lumbopelvic_control
- rf_specific_interpretation: trunk/pelvis control supporting RF running mechanics and kicking control.
- why_relevant_to_rectus_femoris: proximal control affecting RF demand.
- likely_rf_rule_relevance: RF-REHAB-002, RF-REHAB-006
- likely_rf_exercise_relevance: trunk_pelvis_control, motor_control, support_strength RF-EX items
- likely_rf_activity_exposure_relevance: running / kicking exposure context
- future_rf_assessment_relevance: neuromuscular_control
- likely_demand_profile_relevance: kicking, rotational_power, field_movement
- overlay_boundary_notes: metadata only; refines CAP-014.
- risk_level: low
- reviewer_notes: control quality only.

### RF-CAP-015 — movement_confidence_rf_overlay (HIGH CAUTION)
- planned_overlay_id: RF-CAP-015
- planned_name: movement_confidence_rf_overlay
- universal_capacity_ref: CAP-015 · universal_capacity_name: movement_confidence
- rf_specific_interpretation: confidence to load/run/kick the injured RF; complements physical capacity.
- why_relevant_to_rectus_femoris: confidence affects RF reintroduction tolerance.
- likely_rf_rule_relevance: RF-RTS-003, RF-RTS-004 (context only)
- likely_rf_exercise_relevance: motor_control, sport_preparation_drill RF-EX items
- likely_rf_activity_exposure_relevance: controlled_practice / running / kicking exposure context
- future_rf_assessment_relevance: pain_response / next_day_response
- likely_demand_profile_relevance: field_movement, court_movement
- overlay_boundary_notes: **metadata only; not a readiness rule; not sprint/kicking clearance; not return-to-sport clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**
- risk_level: high
- reviewer_notes: qualitative confidence; distinct from return-to-sport readiness (excluded §16).
