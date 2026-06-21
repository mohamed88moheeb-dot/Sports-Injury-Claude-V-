# RF Exercise Library — Overlap And Boundary Review

**Verdict:** PASS WITH DOCUMENTED FUTURE REVIEW ITEMS

## 1. Purpose

This document reviews overlap and system-boundary issues in the frozen 107-object RF Exercise Knowledge library. It does not implement cleanup actions. It records classification findings so future clinician/product review can decide what to keep, relabel, migrate, deprecate, or cross-reference.

No RF-EX object was deleted, moved, renamed, approved, made executable, or wired into runtime. No RF-ACT object was modified.

## 2. Scope

Inspected:

- `lib/clinical/exerciseKnowledge/rf/objects/`
- `lib/clinical/exerciseKnowledge/status/exerciseKnowledgeStatus.json`
- `docs/implementation/MASTER_RF_EXERCISE_LIBRARY_DECISION_TABLE.md`
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_FULL_LIBRARY_ARCHITECTURE_AND_MAPPING.md`
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_BATCH_1_NORMALIZATION.md`
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_BATCH_2_NORMALIZATION.md`
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_BATCH_3_AUTHORING.md`
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_BATCH_3_RED_TEAM_AUDIT.md`
- `lib/clinical/activityExposureKnowledge/` for boundary comparison only
- Activity Exposure implementation docs for RF-ACT mapping context

## 3. Current Frozen Library State

- RF Exercise Knowledge objects: 107
- ID range: `RF-EX-001` through `RF-EX-107`
- Approved objects: 0
- Executable objects: 0
- Runtime integration: none
- Status: frozen draft metadata
- Clinical approval: not approved

The library remains metadata-only. The overlap review does not authorize plan generation, dosage, progression, readiness, RTT/RTS, or clearance.

## 4. Review Methodology

The review compared object identity, `exercise_family`, `primary_function`, `movement_category`, contextual tags, source limitations, final decision metadata, and Activity Exposure cross-system mappings. Findings use only the allowed documentation labels:

- `keep_as_distinct`
- `acceptable_overlap`
- `restricted_context_only`
- `merge_candidate_later`
- `relabel_later`
- `deprecate_later`
- `future_activity_exposure_review`
- `future_clinician_review`
- `excluded_doc_only`
- `hold_remains`
- `no_action_now`

## 5. Quad/Knee ROM Restricted-Context Cluster

| Object | Current concept | Review label | Rationale |
|---|---|---|---|
| `RF-EX-001` | Reclined knee extension ISO | `keep_as_distinct` + `relabel_later` | RF-biased reclined isometric knee-extension loading remains distinct from quad set and terminal knee extension, but future label cleanup should clarify it is not the generic quad-set object. |
| `RF-EX-022` | Generic quadriceps isometric exercise | `restricted_context_only` + `deprecate_later` | Restricted contusion/post-surgical context overlaps `RF-EX-088` but is not the clean first-safe quadriceps-set object. Future review may deprecate or hide from standard RF strain flows. |
| `RF-EX-023` | Active knee extension ROM/loading | `restricted_context_only` + `future_clinician_review` | Restricted quadriceps-contusion source context. Overlaps broad knee-extension ROM/loading but does not duplicate `RF-EX-091` because its authority and context are different. |
| `RF-EX-024` | Active knee flexion ROM | `restricted_context_only` + `deprecate_later` | Restricted contusion-context knee-flexion ROM overlaps `RF-EX-089` heel slides. Keep for provenance now, but consider future deprecation or restricted-only display. |
| `RF-EX-088` | Quadriceps set | `keep_as_distinct` | Clean Batch 1 first-safe activation object. This is the preferred RF-EX object for quad-set metadata. |
| `RF-EX-089` | Heel slides / active knee ROM | `keep_as_distinct` | Clean Batch 1 mobility ROM object. Distinct from restricted contusion-context `RF-EX-024`. |
| `RF-EX-091` | Terminal / short-arc knee extension | `keep_as_distinct` | Inner-range knee-extensor loading concept distinct from reclined ISO and generic quad set. |

**Cluster finding:** acceptable overlap needing future cleanup. No immediate merge should be performed because the older objects preserve restricted-source provenance and the newer objects provide cleaner standard RF metadata.

## 6. Running/Running-Prep Cluster

| Object | Current concept | Review label | Exercise vs exposure boundary |
|---|---|---|---|
| `RF-EX-043` | Ankling drill | `keep_as_distinct` | True running-mechanics drill; keep in Exercise Knowledge. |
| `RF-EX-044` | Skipping drill | `keep_as_distinct` | True running/reactive drill; keep in Exercise Knowledge. |
| `RF-EX-046` | High-knees running drill | `keep_as_distinct` | True running-mechanics drill with hip-flexion emphasis. |
| `RF-EX-047` | Butt-kickers drill | `keep_as_distinct` | True running/dynamic mobility drill with anterior-thigh monitoring. |
| `RF-EX-048` | Toe-off pelvic-control running drill | `keep_as_distinct` | True mechanics/control drill. |
| `RF-EX-049` | Mid-stance running mechanics drill | `keep_as_distinct` | True mechanics/control drill. |
| `RF-EX-050` | Rotational-control running drill | `keep_as_distinct` | True trunk/pelvis running-mechanics drill. |
| `RF-EX-051` | Acceleration mechanics drill | `future_activity_exposure_review` + `future_clinician_review` | Borderline: a drill if mechanics-focused, but close to acceleration exposure. High-caution and reviewer-gated. |
| `RF-EX-076` | Sprinting exposure | `future_activity_exposure_review` + `restricted_context_only` | Closer to Activity Exposure than Exercise Knowledge; source context includes post-surgical RF and remains restricted/high-caution. |

**Cluster finding:** no duplicate running-drill progression object should be created. Discrete mechanics drills are distinct. `RF-EX-051` and especially `RF-EX-076` need future Activity Exposure boundary review.

## 7. Jumping/Hopping/Plyometric Cluster

| Object | Current concept | Review label | Rationale |
|---|---|---|---|
| `RF-EX-057` | Step bilateral landing | `keep_as_distinct` | Landing-control drill; distinct from jumping propulsion. |
| `RF-EX-058` | Step unilateral landing | `keep_as_distinct` | Higher-demand unilateral landing-control drill; distinct from bilateral landing. |
| `RF-EX-059` | Bilateral squat jump | `keep_as_distinct` | Specific squat-jump object. |
| `RF-EX-060` | Plyometric jump | `acceptable_overlap` + `relabel_later` | Generic jump exposure overlaps the broader plyometric family. Keep for now, but future label/context cleanup should clarify how it differs from squat jump and hopping. |
| `RF-EX-064` | Low-intensity hopping | `keep_as_distinct` | Hopping/reactive concept distinct from jump and landing objects. |
| `RF-EX-106` | Switch jump lunge | `keep_as_distinct` + `future_clinician_review` | Ballistic split-stance jump variant; high-caution and clinically reviewer-gated. |

**Cluster finding:** no blocking duplicate. `RF-EX-060` is the most generic concept and should be reviewed later for label specificity or consolidation guidance.

## 8. Kicking/Sport Exposure Cluster

| Object | Current concept | Review label | Rationale |
|---|---|---|---|
| `RF-EX-068` | Resisted kicking exposure | `future_activity_exposure_review` + `future_clinician_review` | Already has RF-ACT counterpart `RF-ACT-006`. It is activity-exposure-like and high-caution, but remains inert RF-EX metadata for provenance. |
| `RF-EX-070` | Game-based kicking scenario exposure | `future_activity_exposure_review` + `future_clinician_review` | Already has RF-ACT counterpart `RF-ACT-007`. Strong Activity Exposure boundary issue; keep as draft metadata until a governed migration/cross-reference policy exists. |

RF-ACT boundary comparison:

- `RF-ACT-004` from `RF-EX-066`
- `RF-ACT-005` from `RF-EX-067`
- `RF-ACT-006` from `RF-EX-068`
- `RF-ACT-007` from `RF-EX-070`

**Cluster finding:** Activity Exposure Knowledge is the better long-term home for kicking exposure semantics. Do not move or delete RF-EX objects yet; future work should decide whether RF-EX objects become cross-references, restricted legacy metadata, or deprecated from standard Exercise Knowledge views.

## 9. Hold/Excluded Reconciliation

| Decision-table concept | Existing object status | Review label | Finding |
|---|---|---|---|
| Med-ball lunge throw combinations | No RF-EX object | `hold_remains` + `excluded_doc_only` | Keep documentation-only unless clinician intent creates a new governed task. |
| Mountain climbers with slider | Existing `RF-EX-021` | `hold_remains` + `future_clinician_review` | Exact existing object, now `hold_for_review`. Do not delete; future clinician review should decide keep/relabel/deprecate. |
| Open-skill uncertainty drills | No RF-EX object | `excluded_doc_only` | Too broad/sport-specific; remains documentation-only. |
| Tactical repeated-effort ball drills | Related existing `RF-EX-071` | `future_activity_exposure_review` + `deprecate_later` | Table excludes base object. Existing `RF-EX-071` is restricted game-based training exposure and should be reviewed for Activity Exposure or deprecation from Exercise Knowledge. |
| Self-myofascial release | No RF-EX object | `excluded_doc_only` | Recovery modality, not Exercise Knowledge. |
| Generic hamstring mobility | Existing `RF-EX-027`, `RF-EX-028` overlap | `acceptable_overlap` + `deprecate_later` | Existing posterior-chain mobility objects are not RF-specific. Future review should decide whether to keep as supportive context or deprecate from RF-specific library views. |
| Aggressive end-range RF stretching | No RF-EX object | `excluded_doc_only` | Excluded due to injury-mechanism/end-range risk. No object should be authored without a separate clinician-gated task. |

## 10. Duplicate-Concept Findings

No immediate duplicate concept requires a fix.

Findings:

- Quad/knee ROM: acceptable overlap caused by restricted-source objects coexisting with clean normalized objects.
- Running drills: discrete mechanics drills are distinct; no umbrella running-drill-progression object should be authored.
- Jumping/hopping/plyometrics: distinct concepts, with `RF-EX-060` needing later label specificity review.
- Kicking/sprint exposure: overlap is architectural rather than duplicate identity; future Exercise vs Activity Exposure policy should decide long-term ownership.
- Hold/excluded: `RF-EX-027`, `RF-EX-028`, and `RF-EX-071` are already-existing overlaps with excluded rows and need future review, not immediate deletion.

## 11. Activity Exposure Boundary Findings

Activity Exposure Knowledge already contains 12 RF-ACT draft objects, including:

- running exposures from `RF-EX-054`, `RF-EX-055`, `RF-EX-056`, `RF-EX-073`, `RF-EX-074`, `RF-EX-075`
- kicking exposures from `RF-EX-066`, `RF-EX-067`, `RF-EX-068`, `RF-EX-070`
- conditioning exposures from `RF-EX-082`, `RF-EX-083`

Boundary findings:

- `RF-EX-068` and `RF-EX-070` should receive future RF-EX/RF-ACT cross-reference policy review.
- `RF-EX-051` is still a mechanics drill but close to acceleration exposure.
- `RF-EX-076` is sprinting exposure and should be reviewed as restricted Activity Exposure or legacy RF-EX metadata.
- `RF-EX-071` is game-based training exposure and should be reviewed for Activity Exposure or deprecation.

No Activity Exposure file was modified.

## 12. Recommended Future Actions

1. Create a governed RF-EX restricted-context cleanup plan for `RF-EX-022`, `RF-EX-023`, and `RF-EX-024`.
2. Create a future display/relabel plan for `RF-EX-001` vs `RF-EX-088` vs `RF-EX-091`.
3. Create an Activity Exposure boundary policy for RF-EX objects that already have RF-ACT counterparts.
4. Review `RF-EX-027`, `RF-EX-028`, and `RF-EX-071` against excluded-row intent.
5. Keep `RF-EX-021` as hold-for-review until clinician/product review decides whether to keep, relabel, or deprecate.
6. Review `RF-EX-060` naming/scope so generic plyometric jump does not blur with squat jump or low-level hopping.

## 13. Objects Not To Touch Yet

Do not delete, move, rename, approve, or runtime-wire:

- `RF-EX-001`
- `RF-EX-021`
- `RF-EX-022`
- `RF-EX-023`
- `RF-EX-024`
- `RF-EX-027`
- `RF-EX-028`
- `RF-EX-051`
- `RF-EX-060`
- `RF-EX-068`
- `RF-EX-070`
- `RF-EX-071`
- `RF-EX-076`

These are review targets only.

## 14. Commands Run

Commands required for this review:

```text
npm run validate:exercise-knowledge
npm run validate:activity-exposure-knowledge
npm run validate:capacity-knowledge
npm run validate:assessment-knowledge
npm run validate:shared-knowledge-taxonomies
npm run check:rf-clinical
npm run validate:rf-rules
npm run check:rf-boundary
npm run validate:evidence-linking-knowledge
git status --short
```

Command outputs are recorded in the final Codex report for this task.

## 15. Scope Verification

This task is documentation-only.

Expected changed file:

- `docs/implementation/RF_EXERCISE_LIBRARY_OVERLAP_AND_BOUNDARY_REVIEW.md`

No RF-EX object, RF-ACT object, schema, validator, status file, runtime file, UI file, Supabase file, RecoveryContext file, injuryEngine file, legacy module, or clinical RF rule object should be modified by this task.

The workspace may be broadly dirty/untracked from prior governed authoring. Scope verification should therefore distinguish this document-only change from pre-existing untracked clinical files.

## 16. Final Verdict

**PASS WITH DOCUMENTED FUTURE REVIEW ITEMS.**

The frozen 107-object RF Exercise Knowledge library can remain frozen as draft metadata. No immediate object deletion, movement, merge, or renaming is recommended. The next task should be a governed cleanup planning pass for restricted-context RF-EX objects and Exercise vs Activity Exposure cross-reference policy.
