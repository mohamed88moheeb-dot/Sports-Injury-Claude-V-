# RF Activity Exposure Knowledge — Phase 2A Authoring (Non-Destructive Staging)

**Status:** 12 draft RF-ACT objects authored (RF-ACT-001…012) · pending · NON-EXECUTABLE · clinically not approved · runtime_integration none. **Non-destructive staging only — no RF-EX object was moved, renamed, deleted, or modified.**

## 1. Purpose of Phase 2A
The classification audit (`docs/implementation/RF_KNOWLEDGE_OBJECT_CLASSIFICATION_AUDIT.json`) found 12
objects currently in Exercise Knowledge that are really activity/sport/conditioning **exposure domains**,
not discrete exercises. Phase 2A represents those 12 as first-class **RF-ACT** objects in the Activity
Exposure Knowledge System so they can later be governed by activity-exposure reintroduction rules rather
than selected like exercises (which would risk clearance leakage).

## 2. Why this is non-destructive staging, not final cleanup
The original RF-EX objects are **left exactly where they are and unchanged**. RF-ACT objects are new,
additive, metadata-only copies-by-classification. Old RF-EX IDs are **not retired**, not redirected, and
not deleted. Any cleanup/redirect (Phase 2B) is a separate governed task requiring approval.

## 3. The 12 RF-ACT objects created
| RF-ACT | Name | activity_domain |
|---|---|---|
| RF-ACT-001 | Short-distance running exposure | running |
| RF-ACT-002 | Moderate-distance running exposure | running |
| RF-ACT-003 | Acceleration exposure | acceleration |
| RF-ACT-004 | Static isolated kicking exposure | kicking_exposure |
| RF-ACT-005 | Controlled kicking exposure | kicking_exposure |
| RF-ACT-006 | Resisted kicking exposure | kicking_exposure |
| RF-ACT-007 | Game-based kicking scenario exposure | kicking_exposure |
| RF-ACT-008 | Sport-specific running exposure | running |
| RF-ACT-009 | Mixed generic and sport-specific running exposure | running |
| RF-ACT-010 | High-speed running exposure | high_speed_running |
| RF-ACT-011 | Elliptical conditioning | elliptical |
| RF-ACT-012 | Calisthenics conditioning | gym_conditioning |

## 4. Mapping from RF-EX to RF-ACT
RF-EX-054→RF-ACT-001, RF-EX-055→RF-ACT-002, RF-EX-056→RF-ACT-003, RF-EX-066→RF-ACT-004,
RF-EX-067→RF-ACT-005, RF-EX-068→RF-ACT-006, RF-EX-070→RF-ACT-007, RF-EX-073→RF-ACT-008,
RF-EX-074→RF-ACT-009, RF-EX-075→RF-ACT-010, RF-EX-082→RF-ACT-011, RF-EX-083→RF-ACT-012.
Recorded in `lib/clinical/activityExposureKnowledge/rf/source/rfActivityExposureSourceMap.json`
(`migration_map`); each RF-ACT object also carries `source_exercise_object_id`.

## 5. Schema changes
`schema/activityExposureObject.schema.json` upgraded from Phase 1 scaffold shape to support real draft
RF-ACT objects. Added required fields: `source_exercise_object_id`, `clinical_approval_status`,
`runtime_integration`, `allowed_when`, `blocked_when`, `safety_blockers`, `monitoring_triggers`,
`restricted_context`. `module` enum set to `rf`. Preserved: `additionalProperties: false`, draft-only,
pending-only, `executable` const false, `runtime_integration` none, `permitted_use`
`activity_exposure_metadata_only`. No active dosage / prescription / progression / readiness /
RTT-RTS / clearance fields exist.

## 6. Validator changes
`scripts/validate-activity-exposure-knowledge.mjs` upgraded from "must be 0 objects" to object-level
Phase 2A validation: required scaffold files exist; object count equals status authored count; IDs are
sequential `RF-ACT-001…012`; every object is `pending` / `not_approved` / `executable:false` /
`runtime_integration:none` / `permitted_use:activity_exposure_metadata_only` / `module:rf` with
`activity_exposure_id` matching filename and a well-formed `source_exercise_object_id`; approved and
executable counts are 0; deep scans reject active dosage/prescription/progression/readiness/RTT-RTS/
clearance keys, assertive authority language, and **copied numeric prescription** (distance/speed/ratio/
frequency/duration/intensity) values. Source-map checks now require `rf_act_objects_created:true`, 12
migration entries, and `rf_ex_objects_moved/renamed/modified:false`.

## 7. Status changes
`status/activityExposureKnowledgeStatus.json`: `status: phase_2_rf_act_authored`,
`activity_exposure_objects_authored: 12`, `activity_exposure_objects_approved: 0`,
`approval_status: pending`, `clinical_approval_status: not_approved`, `executable: false`,
`runtime_integration: none`.

## 8. Governance controls (every RF-ACT object)
`allowed_when` uses inert context only (`future_governed_activity_exposure_rule_context_only`,
`not_runtime_selectable`, `requires_clinical_rule_governance_before_use`). `blocked_when` blocks
`runtime_selection`, `plan_generation`, `dosage_prescription`, `progression_decision`,
`readiness_decision`, `rtt_rts_clearance`, `standard_selection_without_governed_activity_exposure_rules`.
`monitoring_triggers` are non-prescriptive qualitative signals only (`symptom_response`,
`next_day_response`, `pain_escalation`, `functional_tolerance_response`, plus `running_response` /
`kicking_response` / `conditioning_response` where relevant) — **no numeric thresholds**. No sets, reps,
frequency, duration, distance, speed, intensity, workload, % max speed, sprint ratio, return date,
progression increment, clearance, readiness score, or RTT/RTS authorization is present or copied.

## 9. Original RF-EX objects remain untouched
All 87 RF-EX objects are unchanged (no move, rename, delete, or edit). Verified via `git status` (no
modifications under `lib/clinical/exerciseKnowledge/rf/objects/`) and by the Exercise Knowledge
validator still reporting 87 objects.

## 10. No RF-ASSESS objects created
The Assessment Knowledge System remains at 0 objects. No RF-ASSESS objects were authored.

## 11. No runtime / UI / Supabase / RecoveryContext / injuryEngine / legacy changes
Changes are confined to `lib/clinical/activityExposureKnowledge/**`,
`scripts/validate-activity-exposure-knowledge.mjs`, and `docs/**`. No runtime, UI, Supabase,
`RecoveryContext`, `injuryEngine`, clinical RF rule objects, or legacy modules were modified.

## 12. No dosage / progression / readiness / RTT / RTS / clearance authority created
RF-ACT objects are metadata only. They create no dosage, prescription, progression, readiness, RTT,
RTS, return-to-play, or clearance authority, and are not runtime-selectable until future governed
activity-exposure rules exist.

## 13. Future phases
- **Codex audit of Phase 2A** (read-only governance audit of this staging).
- **Clinical red-team audit** of the 12 RF-ACT objects.
- **Phase 2B cleanup/redirects** — only after governance approval (retire/redirect old RF-EX IDs).
- **Phase 3 RF-ASSESS dual-reference** — handle assessment-overlap objects (CMJ RF-EX-061, drop jump
  RF-EX-062) as dual exercise/assessment references.
