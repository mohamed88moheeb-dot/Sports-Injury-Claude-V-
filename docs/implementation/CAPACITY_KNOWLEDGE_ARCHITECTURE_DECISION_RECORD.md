# Capacity Knowledge — Architecture Decision Record (ADR)

**Status:** decision record (documentation only) · pending · NON-EXECUTABLE · not clinically approved · no runtime integration.
**Scope:** resolves how the platform should model capacity long-term **before** any real capacity objects are authored. No RF-CAP objects are authored here; no clinical object is modified; no schema is changed by this task (schema changes are recorded as future governed work).

## 1. Purpose
The Capacity Knowledge scaffold passed audit with non-blocking warnings about long-term scaling
(`module: rf` + `RF-CAP-###`), a mixed status field, and stray `.DS_Store` files. This ADR sets the
durable architectural direction for capacity so the first real authoring phase starts from a model that
scales to a universal, multi-injury, multi-sport platform rather than an RF-only design that would need
rework.

## 2. Current scaffold state
- `lib/clinical/capacityKnowledge/` exists: status, schema, template, `rf/objects/.gitkeep`,
  `rf/source/rfCapacitySourceMap.json`, README.
- Validator `npm run validate:capacity-knowledge` passes with **0 objects**.
- Schema is strict/inert (`additionalProperties:false`), draft/pending/not_approved/exec false/runtime
  none, `permitted_use: capacity_metadata_only`.
- Current `module` enum is `rf`; `capacity_id` pattern is `^(RF-CAP-[0-9]{3})?$`.
- Current schema has a single `evidence_quality_status` enum that mixes epistemic state
  (`known`/`estimated`/`unknown`/`not_tested`) with goal sufficiency
  (`limited`/`adequate_for_current_goal`/`insufficient_for_goal`) plus `confidence_status`.
- Master ontology: `docs/implementation/CAPACITY_KNOWLEDGE_SYSTEM_MASTER_ONTOLOGY.md`.

## 3. Codex audit warnings (addressed here)
1. **ID/module scaling:** `capacity_id: RF-CAP-###` and `module: rf` are fine for the first RF vertical
   slice but risk locking a universal system into RF-only identifiers.
2. **Mixed status semantics:** `evidence_quality_status` conflates *how well we know* a capacity
   (epistemic) with *whether it is enough for the goal* (sufficiency).
3. **Housekeeping:** `.DS_Store` files under `lib/clinical/capacityKnowledge/` (now removed by this task).

## 4. Decision: universal capacity architecture
**Capacity is modeled as a universal core.** Capacity domains/subdomains (strength, power, reactive
ability, motor control, endurance/work capacity, movement tolerance, tissue capacity, confidence, etc.)
are human qualities that exist independent of any injury or sport. The canonical capacity definitions live
in a **Universal Capacity Core** and are reused across every injury module and sport. This keeps the
system from becoming "RF-only" and lets future modules (hamstring, ACL, Achilles, shoulder, low back,
return-to-work, older-adult function) reuse the same capacity vocabulary.

## 5. Decision: RF-specific capacity overlays
**Module-specific behavior is an overlay on a universal capacity, not a separate capacity.** A
**Universal Capacity Core** object defines the capacity generally; an **Injury/Sport Module Overlay**
object (e.g. RF) describes how that universal capacity is *expressed, measured, restricted, or
interpreted* in the Rectus Femoris module.

```
Universal Capacity Core
  +
Injury/Sport Module Overlay
```

Example:
```
CAP-001     = universal running tolerance
RF-CAP-001  = rectus-femoris-specific running-tolerance overlay (references CAP-001)
```
The overlay references its universal core capacity and adds RF-specific measured_by / improved_by /
expressed_through / required_by / restriction context — it never redefines the capacity from scratch.

## 6. Decision: ID strategy
- **Universal core IDs:** `CAP-###` (module-agnostic), with a future universal `module` value such as
  `universal` (or `core`).
- **Module overlay IDs:** `<MODULE>-CAP-###`, e.g. `RF-CAP-###`, each carrying a
  `universal_capacity_ref` (or equivalent) pointing at its `CAP-###` core.
- The current scaffold's `RF-CAP-###` / `module: rf` shape is **retained as the RF overlay layer** and is
  acceptable for the first RF vertical slice. The universal `CAP-###` layer and the cross-link field are a
  **future governed schema update** (see §8), not part of this task.

## 7. Decision: evidence status vs goal sufficiency status
The current single `evidence_quality_status` should later be **split into two orthogonal fields**:
- `evidence_state` — epistemic: how well the capacity is known.
  Examples: `known`, `estimated`, `unknown`, `not_tested`.
- `goal_sufficiency_status` — sufficiency relative to the person's current goal.
  Examples: `limited`, `adequate_for_current_goal`, `insufficient_for_goal`, `requires_clinician_confirmation`.

`confidence_status` (`low/moderate/high_confidence`, `requires_clinician_confirmation`) remains a separate
qualitative descriptor. None of these are numeric scores, thresholds, pass/fail decisions, or clearance.
Goal sufficiency is **evidence about adequacy for a goal**, never a return-to-sport/training clearance.

**This task does not change the schema.** Splitting the field is recorded here as future governed work to
avoid touching the validated scaffold prematurely.

## 8. Future schema implications (not applied now)
A future governed schema update would:
- add a universal layer: `module: universal` + `capacity_id` pattern allowing `CAP-###`;
- add `universal_capacity_ref` (pattern `^CAP-[0-9]{3}$`) on overlay objects;
- replace `evidence_quality_status` with `evidence_state` + `goal_sufficiency_status` (both enum, inert);
- keep `additionalProperties:false`, draft/pending/not_approved/exec false/runtime none, and the
  no-score/threshold/dosage/clearance discipline.
Each change ships with a matching validator update and re-runs all governance checks.

## 9. Future validator implications (not applied now)
The capacity validator would later: accept both `CAP-###` (universal) and `<MODULE>-CAP-###` (overlay)
IDs; verify every overlay's `universal_capacity_ref` resolves to an existing core capacity; verify
`evidence_state` and `goal_sufficiency_status` enums; and cross-check `measured_by` / `improved_by` /
`expressed_through` / `required_by` values against the shared taxonomies and RF-ACT/assessment IDs (the
cross-reference validation already flagged for the future phase).

## 10. Why no RF-CAP objects should be authored yet
Authoring RF-CAP objects now would bake in the RF-only ID shape and the mixed status field, then require
migration once the universal core + split-status model lands. Authoring should wait until: (a) the
universal `CAP-###` core layer exists, (b) the `evidence_state` / `goal_sufficiency_status` split is in
the schema+validator, and (c) the cross-reference validator exists. Authoring against the final model
avoids a second migration and keeps the capacity layer clean for the rehab composer.

## 11. How this affects the Demand Profile System
Demand profiles should require **universal capacities** (`CAP-###`), not RF overlays — a sport's demand
("max-velocity sprinting requires running tolerance") is module-agnostic. RF overlays then describe how an
RF-injured athlete expresses/limits that same universal capacity. This keeps one demand model usable for
every injury module and sport.

## 12. How this affects Assessment, Exercise, and Activity Knowledge
No change to those systems is required now. Long-term, their cross-links point at **universal capacities**:
assessments `measure` CAP-###, exercises `improve` CAP-###, activities `express` CAP-###. RF overlays
inherit those links and add RF-specific nuance. The shared taxonomies remain the common vocabulary for all
links. This ADR introduces no new fields into Assessment/Exercise/Activity objects.

## 13. Governance constraints
This ADR and the capacity system remain: draft/pending · clinically not approved · non-executable ·
runtime_integration none · metadata only. No score, threshold, pass/fail decision, timeline, dosage,
prescription, progression authorization, readiness authorization, RTT/RTS authorization, or clearance
authority is created. Unknown is not safe; goal sufficiency is evidence, not clearance. No RF-CAP objects
authored; no clinical object modified; no schema changed by this task.

## 14. Next recommended task
**Governed Capacity Schema v2 + Universal Core scaffold:** add the universal `CAP-###` layer and the
`evidence_state` / `goal_sufficiency_status` split to the schema, template, and validator (with all
governance checks re-run), then scaffold the Universal Capacity Core (0 objects). Only after that should
RF-CAP overlay authoring (and a demand-profile scaffold) begin.
