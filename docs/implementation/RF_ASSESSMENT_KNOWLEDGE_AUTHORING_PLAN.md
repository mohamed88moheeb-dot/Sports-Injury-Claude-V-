# RF Assessment Knowledge Authoring Plan

**Status:** planning / documentation only · pending · NON-EXECUTABLE · not clinically approved · no runtime integration.
**This task authors no objects.** It plans the first RF-ASSESS batch before any assessment object file is created.

> No RF-ASSESS objects authored in this task. No assessment object approved. No assessment object
> executable. No runtime behavior. No diagnosis authority. No autonomous triage. No prescription. No
> dosage. No progression. No readiness. No RTT/RTS. No clearance authority. No pass/fail return decision.
> No assessment score threshold. No user-specific state stored in object files.

## 1. Purpose
Define how the platform will **measure or estimate** a user's initial and ongoing capacity. Assessment
Knowledge is the missing evidence layer that lets the platform stop guessing and start reasoning from
evidence, completing the model:
```
assessment measures capacity
exercise improves capacity
activity expresses capacity
demand profile requires capacity
```
Assessment objects contribute qualitative evidence to capacity objects; they never clear, prescribe, or
diagnose.

## 2. Why Assessment Knowledge comes next
Universal CAP Batch 1 is frozen and the RF-CAP overlay plan exists. Capacities now have a vocabulary, but
nothing yet supplies evidence about a user's actual capacity. Assessment Knowledge provides that input so
future governed rules can compare current capacity (evidence) to required capacity (demand) — without any
autonomous clearance.

## 3. Relationship to Universal CAP objects
Each RF-ASSESS object names the universal `CAP-###` capacities it **measures or informs** (see §14
coverage map). An assessment contributes to a capacity's evidence stack (`evidence_state` /
`confidence_status` qualitatively) — it never sets a score, threshold, or clearance.

## 4. Relationship to future RF-CAP overlays
RF-CAP overlays (not yet authored) describe RF-specific expression of universal capacities; RF-ASSESS
objects describe how that expression is *observed*. Assessments will reference universal `CAP-###`
directly; RF nuance stays in overlays. This plan authors no RF-CAP objects and implies none exist.

## 5. Relationship to RF clinical rules
RF clinical rules (RF-SAF-*, RF-DX-*, RF-SEV-*, RF-REHAB-*, RF-RECUR-*, RF-FIELD-*, RF-RTS-*) remain the
governing clinical logic and the sole **diagnosis/safety authority**. RF-ASSESS objects gather evidence
those rules may later consume; they do not replace, modify, or override the rules and create no diagnosis
or triage of their own.

## 6. Relationship to RF Exercise Knowledge
Assessments may name exercise-function relevance conceptually (what an observed capacity later informs)
but do not modify RF-EX objects and create no exercise prescription or dosage.

## 7. Relationship to RF Activity Exposure Knowledge
Assessments may reference RF-ACT exposure domains conceptually (e.g. a jogging-tolerance check relates to
the running exposure domain) but do not modify RF-ACT objects and do not imply any RF-ACT object is
runtime-selectable or cleared. The reviewer-gated RF-ACT objects (RF-ACT-003/005/006/007/008/010) remain
reviewer-gated.

## 8. Assessment governance constraints
All future RF-ASSESS objects (and this plan) remain: draft · pending · clinically not approved ·
non-executable · runtime_integration none · metadata only. No diagnosis authority, autonomous triage,
prescription, dosage, progression, readiness, RTT/RTS, clearance, pass/fail return decision, score
threshold, or user-specific state in object files. Unknown is not safe; evidence is not clearance.

## 9. Assessment object modeling rules
- An assessment **observes** something and **informs** one or more capacities; it does not decide.
  Correct: `RF-ASSESS-013 jogging_tolerance_check` informing CAP-003.
  Incorrect: `RF-ASSESS-013 return_to_running_clearance`.
- Objects record a user-facing prompt and a clinician-facing note as inert text — never a scored result
  or a threshold.
- `evidence_contribution` is qualitative (which capacity's evidence/confidence it can raise), never a
  number, cutoff, or pass/fail.
- One assessment concept per object; reference existing assessment-purpose taxonomy values and existing
  `CAP-###` ids only.

## 10. Assessment evidence model
Assessments feed the capacity **evidence stack**, qualitatively:
- they can move a capacity's `evidence_state` (`not_tested` → `estimated`/`known`) and raise
  `confidence_status` (`low` → `moderate`/`high`);
- conversational/self-report checks yield lower-confidence evidence; observed/clinician checks yield
  higher-confidence evidence;
- `goal_sufficiency_status` is only ever evidence about adequacy for a stated goal — never clearance.
None of this lives in the assessment object as user state; objects define *how* evidence is gathered, not
a specific user's result.

## 11. Conversational assessment approach
Most initial evidence is gathered conversationally and optionally, never as a mandatory battery:
"Can you walk normally? climb stairs? jog? run? sprint? what are you getting back to? what happens when
you try?" These map to the movement-tolerance checks and seed low-confidence evidence. Advanced/clinician
checks only raise confidence; they are never required for normal users.

## 12. Initial RF assessment domains
- **Safety / triage screening** (red flags, urgent-referral context) — caution/referral support only.
- **Pain & mechanism** (location, behaviour, mechanism).
- **Mobility / range** (hip flexion, knee flexion).
- **Tissue load response** (resisted hip flexion / knee extension, palpation response).
- **Strength capacity** (isometric, eccentric).
- **Motor control** (single-leg control; lumbopelvic context).
- **Movement tolerance** (walking, stairs, jogging, running, sprint, kicking).
- **Monitoring** (next-day response).
- **Psychological** (movement confidence).

## 13. Proposed RF-ASSESS Batch 1
Planning candidates only (not authored). See per-object detail at the end.
RF-ASSESS-001 … RF-ASSESS-018 (pain/mechanism screen; red-flag/urgent-referral screen; walking; stairs;
hip-flexion range; knee-flexion tolerance; resisted hip flexion; resisted knee extension; anterior-thigh
palpation response; isometric strength; eccentric strength; single-leg control; jogging; running; sprint;
kicking; next-day response; movement confidence).

## 14. Capacity coverage map (planned assessment → Universal CAP)
| Universal CAP | Informed by (planned RF-ASSESS) |
|---|---|
| CAP-001 walking_tolerance | RF-ASSESS-003, RF-ASSESS-017 |
| CAP-002 stairs_tolerance | RF-ASSESS-004, RF-ASSESS-017 |
| CAP-003 jogging_tolerance | RF-ASSESS-013, RF-ASSESS-017 |
| CAP-004 running_tolerance | RF-ASSESS-014, RF-ASSESS-017 |
| CAP-005 sprinting_tolerance | RF-ASSESS-015, RF-ASSESS-017 |
| CAP-006 acceleration_tolerance | RF-ASSESS-014, RF-ASSESS-015 (informs), RF-ASSESS-017 |
| CAP-007 kicking_tolerance | RF-ASSESS-016, RF-ASSESS-017 |
| CAP-008 hip_flexion_mobility | RF-ASSESS-005 |
| CAP-009 knee_flexion_tolerance | RF-ASSESS-006 |
| CAP-010 anterior_thigh_tissue_load_tolerance | RF-ASSESS-007, RF-ASSESS-008, RF-ASSESS-009, RF-ASSESS-017 |
| CAP-011 isometric_strength_capacity | RF-ASSESS-010 |
| CAP-012 eccentric_strength_capacity | RF-ASSESS-011 |
| CAP-013 single_leg_control | RF-ASSESS-012 |
| CAP-014 lumbopelvic_control | RF-ASSESS-012 (informs) |
| CAP-015 movement_confidence | RF-ASSESS-018 |

Assessments may inform one or more capacities but must not clear the user or authorize progression.
(RF-ASSESS-001 pain/mechanism and RF-ASSESS-002 red-flag screen inform safety/diagnosis context, not a
single capacity.)

## 15. Safety and red-flag boundary
A red-flag / urgent-referral screen (RF-ASSESS-002) is included as a planned assessment concept, but:
- safety screening supports **caution and referral logic only**;
- it does **not** diagnose;
- it does **not** replace clinician review;
- it does **not** create emergency-management logic in this task.
RF-SAF-* clinical rules remain the safety authority.

## 16. Diagnostic boundary
Assessment Knowledge may collect evidence relevant to RF diagnosis (pain location/mechanism, resisted-test
response, palpation response) but must **not** become the diagnosis engine. Diagnosis authority remains in
the governed RF clinical rules (RF-DX-*, RF-SAF-*). Assessments provide inputs, not conclusions.

## 17. Monitoring and next-day response logic
RF-ASSESS-017 (next-day response check) is a recurring monitoring concept that updates capacity evidence/
confidence qualitatively over time (e.g. symptom escalation lowers confidence / flags caution). It encodes
**no** automatic progression, regression, readiness, or clearance — adaptation logic belongs to future
governed rules.

## 18. High-caution assessment handling
**RF-ASSESS-015 (sprint_tolerance_screen), RF-ASSESS-016 (kicking_tolerance_screen), and RF-ASSESS-018
(movement_confidence_check)** must each explicitly state:
- metadata only,
- not a readiness test,
- not sprint clearance,
- not kicking clearance,
- not RTS clearance,
- not competition clearance,
- not a progression gate,
- requires future clinical review before runtime use.

## 19. Excluded assessment concepts (not Batch 1)
return-to-sport clearance tests; competition readiness tests; force-plate pass/fail tests; GPS load
thresholds; reactive strength index clearance; maximum sprint speed clearance; kicking power clearance;
objective performance-test pass/fail rules; automated diagnosis decisions; automated emergency triage.

## 20. Pre-authoring audit checklist
Before any `RF-ASSESS-###` file is written, confirm:
1. Assessment Knowledge scaffold is frozen and `npm run validate:assessment-knowledge` passes at 0 objects.
2. Each object is draft/pending/not_approved/non-executable/runtime none/metadata only.
3. `assessment_purpose_category` uses existing assessment-purpose taxonomy values.
4. `capacities_measured_or_informed` references existing `CAP-###` ids only (no RF-CAP/demand objects implied).
5. No score, threshold, pass/fail decision, timeline, dosage, prescription, progression, readiness,
   RTT/RTS, or clearance; no user-specific state in the object.
6. Safety screen states caution/referral-only and defers to RF-SAF-* (no diagnosis/triage authority).
7. Diagnostic-evidence objects defer diagnosis to RF-DX-*/RF-SAF-*.
8. High-caution objects (§18) carry the explicit no-clearance/no-readiness/requires-review statements.
9. RF-ACT references are conceptual only and never imply runtime selection (reviewer-gated ones stay gated).
10. IDs sequential RF-ASSESS-001…018, filename = `assessment_id`; status/source-map authored count updated;
    validator upgraded to validate authored assessment objects; all eight checks green. No RF-EX/RF-ACT/
    RF-CAP/RF-rule/runtime change.

## 21. Recommended next task
**Author RF-ASSESS Batch 1 (RF-ASSESS-001…018)** as a governed authoring task: upgrade the assessment
validator to object-level validation, author the 18 objects per this plan (each informing the mapped
`CAP-###`), update status + source map, and re-run all eight checks. Then: clinical red-team audit of the
assessment objects, then a governed evidence-linking phase (assessment evidence → capacity evidence_state/
confidence_status), then the Demand Profile System scaffold.

---

## Per-assessment planning detail

### RF-ASSESS-001 — pain_location_and_mechanism_screen
- planned_assessment_id: RF-ASSESS-001 · planned_name: pain_location_and_mechanism_screen
- assessment_purpose_category: diagnosis_support
- what_it_observes: reported pain location, behaviour, and injury mechanism.
- capacities_measured_or_informed: informs RF diagnosis/safety context (not a single CAP); supports CAP-010 interpretation.
- rf_relevance: anterior-thigh/RF mechanism context for downstream rule reasoning.
- user_facing_question_or_prompt: "Where is your pain, and how did it start?"
- clinician_facing_note: records location/mechanism as evidence for RF-DX-*; not a diagnosis.
- evidence_contribution: qualitative context for diagnosis_support; no score.
- limitations: self-report; no imaging; not diagnostic on its own.
- high_caution_flag: no
- governance_notes: metadata only; defers diagnosis to RF-DX-*/RF-SAF-*.

### RF-ASSESS-002 — red_flag_and_urgent_referral_screen
- planned_assessment_id: RF-ASSESS-002 · planned_name: red_flag_and_urgent_referral_screen
- assessment_purpose_category: red_flag_screen
- what_it_observes: presence of red-flag / urgent-referral indicators.
- capacities_measured_or_informed: none directly; informs safety/referral context.
- rf_relevance: screens for serious presentations before any RF capacity reasoning.
- user_facing_question_or_prompt: "Do you have any of these warning signs?" (caution list)
- clinician_facing_note: caution/referral support only; defers to RF-SAF-*.
- evidence_contribution: flags caution context; no triage decision.
- limitations: screening only; not diagnostic; not emergency management.
- high_caution_flag: no (safety-boundary object — see §15)
- governance_notes: supports caution/referral only; does not diagnose, replace clinician review, or create emergency logic.

### RF-ASSESS-003 — walking_tolerance_check
- planned_assessment_id: RF-ASSESS-003 · planned_name: walking_tolerance_check
- assessment_purpose_category: pain_response
- what_it_observes: ability to walk normally and symptom response to walking.
- capacities_measured_or_informed: CAP-001 walking_tolerance
- rf_relevance: baseline RF gait/load tolerance.
- user_facing_question_or_prompt: "Can you walk normally? What happens when you do?"
- clinician_facing_note: qualitative tolerance evidence; no distance/time.
- evidence_contribution: can raise CAP-001 evidence_state/confidence qualitatively.
- limitations: self-report; context-dependent.
- high_caution_flag: no
- governance_notes: metadata only; no clearance/progression.

### RF-ASSESS-004 — stairs_tolerance_check
- planned_assessment_id: RF-ASSESS-004 · planned_name: stairs_tolerance_check
- assessment_purpose_category: pain_response
- what_it_observes: ability to climb stairs and symptom response.
- capacities_measured_or_informed: CAP-002 stairs_tolerance
- rf_relevance: loaded hip-flexion/knee-extension daily demand.
- user_facing_question_or_prompt: "Can you go up and down stairs? What happens?"
- clinician_facing_note: qualitative tolerance evidence; no step counts.
- evidence_contribution: can raise CAP-002 evidence qualitatively.
- limitations: self-report.
- high_caution_flag: no
- governance_notes: metadata only; no clearance/progression.

### RF-ASSESS-005 — hip_flexion_range_screen
- planned_assessment_id: RF-ASSESS-005 · planned_name: hip_flexion_range_screen
- assessment_purpose_category: range_of_motion
- what_it_observes: available hip-flexion range and symptom response.
- capacities_measured_or_informed: CAP-008 hip_flexion_mobility
- rf_relevance: RF crosses the hip; flexion range supports loading.
- user_facing_question_or_prompt: "Can you bring your knee toward your chest comfortably?"
- clinician_facing_note: qualitative range observation; no degrees.
- evidence_contribution: can raise CAP-008 evidence qualitatively.
- limitations: estimation without goniometry.
- high_caution_flag: no
- governance_notes: metadata only; not a stretch prescription.

### RF-ASSESS-006 — knee_flexion_tolerance_screen
- planned_assessment_id: RF-ASSESS-006 · planned_name: knee_flexion_tolerance_screen
- assessment_purpose_category: range_of_motion
- what_it_observes: tolerance of loaded/lengthened knee flexion and symptom response.
- capacities_measured_or_informed: CAP-009 knee_flexion_tolerance
- rf_relevance: lengthened anterior-thigh (RF) loading tolerance.
- user_facing_question_or_prompt: "Can you bend your knee fully / kneel comfortably?"
- clinician_facing_note: qualitative lengthened-load tolerance; no degrees.
- evidence_contribution: can raise CAP-009 evidence qualitatively.
- limitations: self-report/observation.
- high_caution_flag: no
- governance_notes: metadata only; no ROM/dose values.

### RF-ASSESS-007 — resisted_hip_flexion_response
- planned_assessment_id: RF-ASSESS-007 · planned_name: resisted_hip_flexion_response
- assessment_purpose_category: pain_response
- what_it_observes: symptom/strength response to resisted hip flexion.
- capacities_measured_or_informed: CAP-010 anterior_thigh_tissue_load_tolerance (informs strength context)
- rf_relevance: RF as hip flexor; provocation/load response evidence.
- user_facing_question_or_prompt: "Does resisting your knee lifting up reproduce symptoms?"
- clinician_facing_note: provocation/response evidence for RF-DX context; not diagnosis.
- evidence_contribution: qualitative tissue-load response; no grade/score.
- limitations: depends on technique; not standardized strength testing here.
- high_caution_flag: no
- governance_notes: metadata only; diagnosis stays in RF-DX-*.

### RF-ASSESS-008 — resisted_knee_extension_response
- planned_assessment_id: RF-ASSESS-008 · planned_name: resisted_knee_extension_response
- assessment_purpose_category: pain_response
- what_it_observes: symptom/strength response to resisted knee extension.
- capacities_measured_or_informed: CAP-010 anterior_thigh_tissue_load_tolerance
- rf_relevance: RF as knee extensor; provocation/load response evidence.
- user_facing_question_or_prompt: "Does straightening your knee against resistance reproduce symptoms?"
- clinician_facing_note: provocation/response evidence; not diagnosis.
- evidence_contribution: qualitative tissue-load response; no score.
- limitations: technique-dependent.
- high_caution_flag: no
- governance_notes: metadata only; diagnosis stays in RF-DX-*.

### RF-ASSESS-009 — anterior_thigh_palpation_response
- planned_assessment_id: RF-ASSESS-009 · planned_name: anterior_thigh_palpation_response
- assessment_purpose_category: pain_response
- what_it_observes: tenderness/response to anterior-thigh palpation.
- capacities_measured_or_informed: CAP-010 anterior_thigh_tissue_load_tolerance (informs)
- rf_relevance: localizes anterior-thigh/RF symptom context.
- user_facing_question_or_prompt: "Is there a tender spot when you press the front of your thigh?"
- clinician_facing_note: localization evidence; not diagnosis.
- evidence_contribution: qualitative context; no score.
- limitations: self-palpation unreliable; supportive only.
- high_caution_flag: no
- governance_notes: metadata only; diagnosis stays in RF-DX-*/RF-SAF-*.

### RF-ASSESS-010 — isometric_strength_capacity_check
- planned_assessment_id: RF-ASSESS-010 · planned_name: isometric_strength_capacity_check
- assessment_purpose_category: strength_capacity
- what_it_observes: ability to hold an isometric anterior-thigh contraction and response.
- capacities_measured_or_informed: CAP-011 isometric_strength_capacity
- rf_relevance: early RF loading capacity.
- user_facing_question_or_prompt: "Can you hold a steady push without symptoms increasing?"
- clinician_facing_note: qualitative capacity evidence; no kg/%.
- evidence_contribution: can raise CAP-011 evidence qualitatively.
- limitations: not dynamometry unless added later.
- high_caution_flag: no
- governance_notes: metadata only; no load prescription.

### RF-ASSESS-011 — eccentric_strength_capacity_check
- planned_assessment_id: RF-ASSESS-011 · planned_name: eccentric_strength_capacity_check
- assessment_purpose_category: strength_capacity
- what_it_observes: tolerance/control of eccentric anterior-thigh loading.
- capacities_measured_or_informed: CAP-012 eccentric_strength_capacity
- rf_relevance: protective capacity for higher-speed/kicking demands.
- user_facing_question_or_prompt: "Can you lower under control without symptoms increasing?"
- clinician_facing_note: qualitative eccentric capacity evidence; no dose.
- evidence_contribution: can raise CAP-012 evidence qualitatively.
- limitations: technique-dependent.
- high_caution_flag: no
- governance_notes: metadata only; no eccentric dose.

### RF-ASSESS-012 — single_leg_control_observation
- planned_assessment_id: RF-ASSESS-012 · planned_name: single_leg_control_observation
- assessment_purpose_category: neuromuscular_control
- what_it_observes: single-leg control quality (and lumbopelvic control context).
- capacities_measured_or_informed: CAP-013 single_leg_control; informs CAP-014 lumbopelvic_control
- rf_relevance: control underpinning running/landing reintroduction.
- user_facing_question_or_prompt: "Can you balance and control a single-leg movement?"
- clinician_facing_note: qualitative control observation; no pass/fail.
- evidence_contribution: can raise CAP-013/CAP-014 evidence qualitatively.
- limitations: observational; not a validated test here.
- high_caution_flag: no
- governance_notes: metadata only; assessment-as-test detail deferred; no pass/fail.

### RF-ASSESS-013 — jogging_tolerance_check
- planned_assessment_id: RF-ASSESS-013 · planned_name: jogging_tolerance_check
- assessment_purpose_category: pain_response
- what_it_observes: ability to jog and symptom response.
- capacities_measured_or_informed: CAP-003 jogging_tolerance
- rf_relevance: early running reintroduction tolerance.
- user_facing_question_or_prompt: "Can you jog lightly? What happens during/after?"
- clinician_facing_note: qualitative tolerance; no pace/distance.
- evidence_contribution: can raise CAP-003 evidence qualitatively.
- limitations: self-report.
- high_caution_flag: no
- governance_notes: metadata only; not running clearance.

### RF-ASSESS-014 — running_tolerance_check
- planned_assessment_id: RF-ASSESS-014 · planned_name: running_tolerance_check
- assessment_purpose_category: pain_response
- what_it_observes: ability to run and symptom response.
- capacities_measured_or_informed: CAP-004 running_tolerance; informs CAP-006 acceleration_tolerance
- rf_relevance: central RF reintroduction tolerance.
- user_facing_question_or_prompt: "Can you run? What happens during/after?"
- clinician_facing_note: qualitative tolerance; no pace/distance.
- evidence_contribution: can raise CAP-004 evidence qualitatively.
- limitations: self-report.
- high_caution_flag: no
- governance_notes: metadata only; not running clearance.

### RF-ASSESS-015 — sprint_tolerance_screen (HIGH CAUTION)
- planned_assessment_id: RF-ASSESS-015 · planned_name: sprint_tolerance_screen
- assessment_purpose_category: sprint_tolerance
- what_it_observes: ability to tolerate high-speed running exposure and symptom response.
- capacities_measured_or_informed: CAP-005 sprinting_tolerance; informs CAP-006 acceleration_tolerance
- rf_relevance: high-risk RF exposure; recurrence-sensitive.
- user_facing_question_or_prompt: "Have you tried higher-speed running? What happened?"
- clinician_facing_note: qualitative exposure-tolerance evidence; no speed/MSS%.
- evidence_contribution: can raise CAP-005 evidence qualitatively.
- limitations: self-report; high-risk context.
- high_caution_flag: yes
- governance_notes: **metadata only; not a readiness test; not sprint clearance; not kicking clearance; not RTS clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**

### RF-ASSESS-016 — kicking_tolerance_screen (HIGH CAUTION)
- planned_assessment_id: RF-ASSESS-016 · planned_name: kicking_tolerance_screen
- assessment_purpose_category: kicking_tolerance
- what_it_observes: ability to tolerate kicking exposure and symptom response.
- capacities_measured_or_informed: CAP-007 kicking_tolerance
- rf_relevance: highest-specificity RF exposure; recurrence-sensitive.
- user_facing_question_or_prompt: "Have you tried kicking? What happened during/after?"
- clinician_facing_note: qualitative exposure-tolerance evidence; no volume/intensity.
- evidence_contribution: can raise CAP-007 evidence qualitatively.
- limitations: self-report; high-risk context.
- high_caution_flag: yes
- governance_notes: **metadata only; not a readiness test; not kicking clearance; not sprint clearance; not RTS clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**

### RF-ASSESS-017 — next_day_response_check
- planned_assessment_id: RF-ASSESS-017 · planned_name: next_day_response_check
- assessment_purpose_category: next_day_response
- what_it_observes: symptom/function response in the 24h after activity or loading.
- capacities_measured_or_informed: informs CAP-001/002/003/004/005/007/010 (tolerance/monitoring context)
- rf_relevance: core monitoring signal for RF load tolerance over time.
- user_facing_question_or_prompt: "How did you feel the day after?"
- clinician_facing_note: recurring monitoring evidence; no automatic progression/regression.
- evidence_contribution: can adjust capacity evidence/confidence qualitatively over time.
- limitations: self-report; recall-dependent.
- high_caution_flag: no
- governance_notes: metadata only; encodes no progression/readiness/clearance — adaptation belongs to future governed rules.

### RF-ASSESS-018 — movement_confidence_check (HIGH CAUTION)
- planned_assessment_id: RF-ASSESS-018 · planned_name: movement_confidence_check
- assessment_purpose_category: pain_response
- what_it_observes: self-reported confidence to load/run/kick the injured area.
- capacities_measured_or_informed: CAP-015 movement_confidence
- rf_relevance: confidence affects RF reintroduction tolerance.
- user_facing_question_or_prompt: "How confident do you feel loading/running/kicking right now?"
- clinician_facing_note: qualitative confidence evidence; never a readiness score.
- evidence_contribution: can raise CAP-015 evidence qualitatively.
- limitations: subjective.
- high_caution_flag: yes
- governance_notes: **metadata only; not a readiness test; not sprint clearance; not kicking clearance; not RTS clearance; not competition clearance; not a progression gate; requires future clinical review before runtime use.**
