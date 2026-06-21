# RF Exercise Knowledge System — v1.0 Scaffold

**Status:** scaffold only · NON-EXECUTABLE · not clinically approved · 0 exercise objects · no runtime integration.

## 1. Purpose
The Exercise Knowledge System is the governed home for rectus-femoris-relevant exercise
**metadata**: target tissues, exercise function, equipment, contraction-type bias, muscle-length
bias, joint position, irritability suitability, contraindications, safety blockers, monitoring
flags, regressions, progressions, substitutions, and links to RF v1.2 rules. It is the
infrastructure the RF vertical slice will later consult **before** it can reason about exercises.
It defines structure and prohibitions only — it selects nothing and prescribes nothing.

## 2. Why this comes after RF Gate B rule authoring
The RF Gate B reconciliation audit confirmed all 38 RF v1.2 rule objects exist, are pending,
non-executable, and not approved. Exercise metadata is meaningful only when it can be governed by
those rules (safety blockers, irritability, monitoring, field/readiness limits). Building the
exercise layer first would risk encoding clinical decisions the rules are meant to own. The
scaffold therefore *links to* RF rule IDs but inherits none of their authority.

## 3. Why exercise metadata is not a rehab plan
A plan is an ordered, dosed, time-bound prescription for an individual. An exercise object is a
context-free description of a single movement option plus tags. There is no ordering, no
selection, no patient state, and no dose. Metadata describes *what an exercise is*, never *what to
do, how much, or when*.

## 4. Why the exercise library must not create dosage
Dosage (sets, reps, frequency, rest, intensity, duration, progression increments) is clinical
prescription and is out of scope until a separately governed dosage-authoring phase exists. The
schema and validator enforce this: the `dosage` block uses validator-safe **neutral** keys
(`prescribed_volume/load/tempo/schedule/recovery_interval/session_length/progression_step/target_timeline`)
held at `null`, with `active_prescription_present: false`. The conventional keys are intentionally
avoided because the RF governance discipline scans key **names** and treats `sets`/`reps`/
`frequency`/`rest`/`intensity`/`duration`/`progression_increment`/`return_date` as contraband even
when null — this keeps the new system consistent with existing RF validation without weakening it.
`dosage_status` is always one of `not_specified_by_current_source`, `requires_future_rule_authoring`,
or `externally_prescribed_only`.

## 5. Why the exercise library must not create RTT/RTS clearance
Return-to-training and return-to-sport clearance is owned by the RF readiness/performance rules
(RF-RTS-001…004), which already prohibit date-only clearance, single-metric readiness, and
clearance without source-complete multi-domain evidence. Exercise metadata that could *imply*
clearance would bypass those rules. The validator fails any object whose keys assert
RTT/RTS/unrestricted-training/competition or diagnosis/rehab-plan authority.

## 6. How exercises will later link to RF rules
Each future exercise object carries `linked_rule_ids` (RF rule IDs), `safety_blockers`,
`contraindications`, `allowed_when`/`blocked_when`, and `monitoring_triggers`. The
`rf/source/rfExerciseSourceMap.json` groups future exercises into metadata categories and records
which RF rules each category relates to. Links are relationships only — an exercise never *executes*
or *overrides* a rule.

## 7. How exercises will later support the vertical slice
Once exercise objects and a separately governed selection/dosage layer exist, the slice could:
read patient-safe state from the RF rules → filter exercises by `safety_blockers`/`blocked_when` →
present `regression_options`/`substitution_options` → surface `monitoring_triggers`. The scaffold
supplies the vocabulary for that; it performs none of it.

## 8. Files created
- `lib/clinical/exerciseKnowledge/README.md`
- `lib/clinical/exerciseKnowledge/status/exerciseKnowledgeStatus.json`
- `lib/clinical/exerciseKnowledge/schema/exerciseObject.schema.json`
- `lib/clinical/exerciseKnowledge/templates/exerciseObjectTemplate.json`
- `lib/clinical/exerciseKnowledge/rf/README.md`
- `lib/clinical/exerciseKnowledge/rf/objects/.gitkeep`
- `lib/clinical/exerciseKnowledge/rf/source/rfExerciseSourceMap.json`
- `scripts/validate-exercise-knowledge.mjs`
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_SYSTEM_SCAFFOLD.md` (this file)
- `package.json` → added `"validate:exercise-knowledge"` script

## 9. Validation checks
`npm run validate:exercise-knowledge` (built-in Node only) checks:
1. Status file: `clinical_approval_status: "not_approved"`, `executable: false`, `exercise_objects_approved: 0`.
2. Schema + template load; template is structurally blank and non-executable.
3. Each exercise object (when any exist): required keys; `approval_status` ∈ {pending, rejected, superseded} (never approved); `executable: false`; `module: rectus_femoris`; `permitted_use: exercise_metadata_only`; `exercise_id` matches `RF-EX-###`.
4. **Fails** any object that: is approved; is executable; carries active dosage or active sets/reps/frequency/rest/intensity/duration; carries return dates; carries progression increments as prescription; asserts RTT/RTS clearance; asserts diagnosis or rehab-plan authority; or references a quarantined legacy module.
5. Passes cleanly with **zero** objects (current state).

## 10. What is still missing before the vertical slice
- RF exercise objects (`rf/objects/RF-EX-*.json`).
- RF exercise test fixtures.
- Exercise-selection logic (separately governed).
- Daily check-in adaptation.
- A safety/readiness engine that consumes the RF rules.

## 11. Runtime-behavior confirmation
No runtime app behavior changed. No UI, no `RecoveryContext.jsx`, no Supabase, no packages, no
engine wiring, no quarantined imports, nothing pushed. Changes are confined to
`lib/clinical/exerciseKnowledge/**`, `scripts/validate-exercise-knowledge.mjs`, one additive
`package.json` script, and `docs/**`.

## 12. Approval confirmation
Nothing in this scaffold is clinically approved. `clinical_approval_status: "not_approved"`,
`executable: false`, `exercise_objects_approved: 0`. The schema forbids `approval_status: "approved"`,
and the validator enforces it.
