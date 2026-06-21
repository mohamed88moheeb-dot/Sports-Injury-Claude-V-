# Capacity Knowledge — Schema v2 + Universal Core Scaffold

**Status:** governed scaffold/schema update · pending · NON-EXECUTABLE · clinically not approved · runtime_integration none · **0 capacity objects (universal 0, RF overlay 0)**.

## 1. Purpose
Implement the Capacity ADR's long-term model as a governed schema/scaffold upgrade, while keeping the
object count at zero. Capacity now supports a universal core layer plus injury/sport module overlays, and
the previously mixed status field is split — so the first real authoring phase targets the final model.

## 2. Why schema v2 was needed
The v1 scaffold used RF-only identifiers (`RF-CAP-###`, `module: rf`) and a single
`evidence_quality_status` that conflated epistemic state with goal sufficiency. The ADR resolved both:
model capacity universally with module overlays, and split the status. Schema v2 applies those decisions
structurally before any object exists, avoiding a later migration.

## 3. Universal Capacity Core scaffold
Created `lib/clinical/capacityKnowledge/universal/objects/.gitkeep` and
`lib/clinical/capacityKnowledge/universal/source/universalCapacitySourceMap.json` (scaffold only,
`future_object_prefix: CAP`, `future_object_count: 0`). No universal `CAP` objects are authored.

## 4. RF overlay scaffold
The existing `lib/clinical/capacityKnowledge/rf/objects/` (empty, `.gitkeep`) and
`rf/source/rfCapacitySourceMap.json` are preserved and updated to the v2 model
(`future_overlay_prefix: RF-CAP`, `future_universal_ref_pattern: CAP-###`, `future_overlay_count: 0`). No
RF-CAP overlay objects are authored.

## 5. ID strategy
- Universal capacities: `CAP-###` (`module: universal`, `capacity_object_type: universal_capacity`).
- Module overlays: `RF-CAP-###` (`module: rf`, `capacity_object_type: module_capacity_overlay`).
- `capacity_id` schema pattern allows both (`^(CAP-[0-9]{3}|RF-CAP-[0-9]{3})?$`); empty only in the template.

## 6. `universal_capacity_ref`
New field linking an overlay to the universal capacity it refines. Pattern `^(CAP-[0-9]{3})?$`: empty for
universal capacities and the template; a `CAP-###` value is expected on future RF overlays. It is a
reference, never an inheritance of authority.

## 7. Evidence status split
`evidence_quality_status` is **removed** (from properties and required). Replaced by three orthogonal
qualitative fields:
- `evidence_state`: `known`, `estimated`, `unknown`, `not_tested`.
- `goal_sufficiency_status`: `limited`, `adequate_for_current_goal`, `insufficient_for_goal`,
  `requires_clinician_confirmation`, `not_applicable`.
- `confidence_status` (kept): `low_confidence`, `moderate_confidence`, `high_confidence`,
  `requires_clinician_confirmation`.
None is a numeric score, threshold, pass/fail decision, or clearance.

## 8. Status changes
`status/capacityKnowledgeStatus.json`: `status: schema_v2_universal_core_scaffold`, added
`universal_capacity_objects_authored: 0` and `rf_capacity_overlay_objects_authored: 0`,
`capacity_objects_authored: 0`, `capacity_objects_approved: 0`, pending / not_approved / exec false /
runtime none, with the required negated-governance notes.

## 9. Schema changes
`schema/capacityObject.schema.json` upgraded to v2: added `capacity_object_type`,
`universal_capacity_ref`, `evidence_state`, `goal_sufficiency_status`; removed `evidence_quality_status`;
`module` enum `universal|rf`; `capacity_id` allows `CAP-###`/`RF-CAP-###`. Preserved
`additionalProperties:false`, draft/pending/not_approved/exec const false/runtime none/
`capacity_metadata_only`, and the no-score/threshold/dosage/prescription/progression/readiness/RTT-RTS/
clearance discipline.

## 10. Template changes
`templates/capacityObjectTemplate.json` rebuilt to the v2 shape: blank/inert,
`capacity_object_type: universal_capacity`, `module: universal`, blank `universal_capacity_ref`,
`evidence_state: not_tested`, `goal_sufficiency_status: not_applicable`, `confidence_status:
low_confidence`. No `evidence_quality_status`; no active score/dosage/authority fields.

## 11. Validator changes
`scripts/validate-capacity-knowledge.mjs` upgraded: verifies universal + RF folders and both source maps
exist; universal object count 0, RF overlay count 0, total 0, approved 0, executable 0, runtime none;
status fields match v2; schema allows `CAP-###`/`RF-CAP-###`, supports `capacity_object_type` and
`universal_capacity_ref`, excludes `evidence_quality_status`, includes `evidence_state` /
`goal_sufficiency_status` / `confidence_status`, stays strict/inert; template blank/inert with universal
default; both source maps scaffold-only; and a deep scan rejects score/threshold/pass-fail/dosage/
prescription/progression/readiness/RTT-RTS/clearance/return-timeline keys and assertive authority
language.

## 12. Source map changes
- Universal: new `universalCapacitySourceMap.json` (CAP prefix, 0 objects, scaffold-only governance notes;
  states overlays reference universal capacities via `universal_capacity_ref`).
- RF: updated to v2 (RF-CAP overlay prefix, `CAP-###` ref pattern, 0 overlays; states overlays must
  reference universal CAP objects and that no RF-EX/RF-ACT/RF-ASSESS objects were created/modified).

## 13. Governance controls
Draft / pending / clinically not approved / non-executable / runtime none / metadata only. No score,
threshold, pass/fail, timeline, dosage, prescription, progression/readiness/RTT-RTS/clearance authority.
All notes are negated-governance language only.

## 14. Confirmation — no universal CAP objects authored
`universal/objects/` contains only `.gitkeep`; validator reports universal count 0.

## 15. Confirmation — no RF-CAP objects authored
`rf/objects/` contains only `.gitkeep`; validator reports RF overlay count 0.

## 16. Confirmation — no clinical objects modified
No RF-EX, RF-ACT, RF-ASSESS, or RF clinical-rule object was modified. Changes are confined to
`lib/clinical/capacityKnowledge/**`, `scripts/validate-capacity-knowledge.mjs`, and `docs/**`.

## 17. Confirmation — no runtime / UI / Supabase / RecoveryContext / injuryEngine / legacy changes
None of those were touched; no runtime behavior was created; nothing is executable.

## 18. Future phases
1. **Author universal CAP objects** (governed) for the universal core.
2. **Audit universal CAP objects** (clinical red-team).
3. **Author RF-CAP overlays** referencing `CAP-###` via `universal_capacity_ref`.
4. **Cross-reference validator** — verify overlay refs resolve, and that measured_by/improved_by/
   expressed_through/required_by values match shared taxonomies and RF-ACT/assessment IDs.
5. **Demand Profile System scaffold** — sport/work/life demands requiring universal capacities.
