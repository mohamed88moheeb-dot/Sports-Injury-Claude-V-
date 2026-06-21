# Universal CAP Objects — Batch 1 Authoring

**Status:** 15 universal `CAP-###` capacity objects authored (CAP-001…CAP-015) · draft · pending · clinically not approved · NON-EXECUTABLE · runtime_integration none · metadata only. **No RF-CAP overlays authored; no clinical objects modified; no runtime behavior created.**

## 1. Purpose
Author the first universal capacity batch from the frozen authoring plan, establishing the
module-agnostic `CAP-###` core that future RF-CAP overlays, other injury modules, and demand profiles
will reference. Objects are inert metadata — they bridge assessment/exercise/activity/demand and create
no decision authority.

## 2. Why universal CAP objects were authored before RF-CAP overlays
Schema v2 requires module overlays to reference a universal capacity via `universal_capacity_ref`; an
overlay cannot reference a `CAP-###` that does not exist. Authoring the universal core first gives every
overlay and demand profile a stable, reusable anchor and prevents RF-shaped capacities that would need
migration.

## 3. Batch contents
| ID | name | domain | subdomain |
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

Cross-link arrays (`measured_by_assessment_categories`, `improved_by_exercise_function_categories`,
`expressed_through_activity_domains`, `required_by_demand_profiles`, `related_rehab_plan_blocks`) were
populated per the frozen plan using existing shared-taxonomy values only; no new taxonomy values were
invented.

## 4. Object count summary
Universal CAP objects: **15**. RF-CAP overlays: **0**. Total capacity objects: **15**. Approved: **0**.
Executable: **0**. Runtime integration: **none**.

## 5. Schema v2 compatibility
Every object conforms to `schema/capacityObject.schema.json`:
`capacity_object_type: universal_capacity`, `module: universal`, `universal_capacity_ref: ""`,
`capacity_status: draft`, `approval_status: pending`, `clinical_approval_status: not_approved`,
`executable: false`, `runtime_integration: none`, `permitted_use: capacity_metadata_only`,
`evidence_state: not_tested`, `goal_sufficiency_status: not_applicable`,
`confidence_status: low_confidence`. No `evidence_quality_status`. IDs sequential CAP-001…CAP-015 with
filename = `capacity_id`.

## 6. Governance controls
No object contains a score, threshold, pass/fail decision, timeline, distance/speed target, dosage, sets,
reps, frequency, prescription, progression/readiness/RTT/RTS/clearance authority, or user-specific state.
`allowed_when` is inert context only; `blocked_when` blocks runtime selection, prescription, dosage,
progression, readiness, RTT/RTS, and clearance use; every `notes` ends with the explicit statement that
the object authorizes none of these and that RF specificity belongs to a future RF-CAP overlay.

## 7. High-caution capacity handling
CAP-005 (sprinting_tolerance), CAP-006 (acceleration_tolerance), CAP-007 (kicking_tolerance), and CAP-015
(movement_confidence) are tolerance/confidence metadata only. Their notes explicitly state no speed
targets / maximum-sprint-speed percentages / sprint ratios / kicking volume, and that they are not sprint
or kicking clearance, not return-to-sport or competition readiness, and not progression gates. CAP-015 is
explicitly distinct from return-to-sport/competition readiness.

## 8. Status update
`status/capacityKnowledgeStatus.json`: `status: universal_cap_batch_1_authored`,
`version: v2_universal_cap_batch_1`, `universal_capacity_objects_authored: 15`,
`rf_capacity_overlay_objects_authored: 0`, `capacity_objects_authored: 15`,
`capacity_objects_approved: 0`, `executable: false`, `runtime_integration: none`,
`permitted_use: capacity_metadata_only`, with the required negated-governance notes.

## 9. Universal source map update
`universal/source/universalCapacitySourceMap.json`: `version: v2_universal_cap_batch_1`,
`authored_object_prefix: CAP`, `authored_object_count: 15`, `authored_capacity_ids: [CAP-001…CAP-015]`,
`rf_capacity_overlay_objects_authored: 0`, with negated-governance notes and the statement that future RF
overlays must reference these universal capacities through `universal_capacity_ref`.

## 10. Validator update
`scripts/validate-capacity-knowledge.mjs` upgraded to object-level validation: universal count exactly
15, RF overlay count exactly 0, total 15, approved 0, executable 0, runtime none; sequential CAP-001…015
with filename = `capacity_id`; per-object status discipline + evidence/goal/confidence defaults; rejects
`evidence_quality_status`; required arrays present and string-only; ids/names must be universal (no RF/
rectus wording); deep scan rejects score/threshold/pass-fail/timeline/dosage/prescription/progression/
readiness/RTT-RTS/clearance keys and assertive authority language (incl. "cleared to", "ready for",
"approved to return").

## 11. Confirmation — no RF-CAP overlays authored
`rf/objects/` contains only `.gitkeep`; validator reports RF overlay count 0; RF source map
`future_overlay_count: 0` (left effectively unchanged — RF overlay count remains 0).

## 12. Confirmation — no clinical objects modified
No RF-EX, RF-ACT, RF-ASSESS, or RF clinical-rule object was modified.

## 13. Confirmation — no runtime / UI / Supabase / RecoveryContext / injuryEngine / legacy changes
None touched; no runtime behavior created; nothing executable. Changes are confined to
`lib/clinical/capacityKnowledge/**`, `scripts/validate-capacity-knowledge.mjs`, and `docs/**`.

## 14. Checks run
`validate:capacity-knowledge`, `validate:exercise-knowledge`, `validate:activity-exposure-knowledge`,
`validate:assessment-knowledge`, `validate:shared-knowledge-taxonomies`, `check:rf-clinical`,
`validate:rf-rules`, `check:rf-boundary` — all PASS (see task report).

## 15. Required future audit
A clinical red-team audit of the 15 universal CAP objects should verify universal (non-RF) framing,
taxonomy-valid cross-links, governance-safe wording (especially the high-caution capacities), and the
absence of any score/threshold/clearance/readiness language, before RF-CAP overlay authoring.

## 16. Recommended next step
After the audit: author the first **RF-CAP overlays** referencing these `CAP-###` objects via
`universal_capacity_ref`, then add the **cross-reference validator** (verify refs resolve and cross-link
values match the shared taxonomies and RF-ACT/assessment IDs), then scaffold the **Demand Profile
System** (demands requiring universal capacities).
