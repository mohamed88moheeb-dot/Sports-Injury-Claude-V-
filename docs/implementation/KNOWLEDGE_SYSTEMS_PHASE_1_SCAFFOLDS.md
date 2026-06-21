# Knowledge Systems Phase 1 Scaffolds

## Purpose

Phase 1 creates the empty, governed filesystem scaffolds for Activity Exposure
Knowledge and Assessment Knowledge so future RF migration tasks have explicit
homes before any object moves occur. This phase is infrastructure only: it
defines status files, strict schemas, blank templates, source maps, and
validators.

## Scope

No migration was performed.

`RF-EX-001` through `RF-EX-087` remain untouched in Exercise Knowledge. No
`RF-EX` object was moved, renamed, approved, made executable, or wired into
runtime behavior.

Activity Exposure Knowledge is now ready to receive future `RF-ACT` objects
under a separate governed task.

Assessment Knowledge is now ready to receive future `RF-ASSESS` objects under a
separate governed task.

The classification audit governs future migration:

- `docs/implementation/RF_KNOWLEDGE_OBJECT_CLASSIFICATION_AUDIT.md`
- `docs/implementation/RF_KNOWLEDGE_OBJECT_CLASSIFICATION_AUDIT.json`

## Created Systems

Activity Exposure Knowledge scaffold:

- `lib/clinical/activityExposureKnowledge/README.md`
- `lib/clinical/activityExposureKnowledge/status/activityExposureKnowledgeStatus.json`
- `lib/clinical/activityExposureKnowledge/schema/activityExposureObject.schema.json`
- `lib/clinical/activityExposureKnowledge/templates/activityExposureObjectTemplate.json`
- `lib/clinical/activityExposureKnowledge/rf/objects/.gitkeep`
- `lib/clinical/activityExposureKnowledge/rf/source/rfActivityExposureSourceMap.json`
- `scripts/validate-activity-exposure-knowledge.mjs`

Assessment Knowledge scaffold:

- `lib/clinical/assessmentKnowledge/README.md`
- `lib/clinical/assessmentKnowledge/status/assessmentKnowledgeStatus.json`
- `lib/clinical/assessmentKnowledge/schema/assessmentObject.schema.json`
- `lib/clinical/assessmentKnowledge/templates/assessmentObjectTemplate.json`
- `lib/clinical/assessmentKnowledge/rf/objects/.gitkeep`
- `lib/clinical/assessmentKnowledge/rf/source/rfAssessmentSourceMap.json`
- `scripts/validate-assessment-knowledge.mjs`

Package scripts added:

- `validate:activity-exposure-knowledge`
- `validate:assessment-knowledge`

## Governance

Both new systems are scaffold-only, pending, not clinically approved,
non-executable, metadata-only, and runtime-disconnected.

They contain:

- 0 authored objects
- 0 approved objects
- 0 executable objects
- no runtime wiring
- no dosage
- no progression
- no readiness
- no RTT/RTS
- no clearance authority

No runtime behavior was created. No UI, Supabase, RecoveryContext, injuryEngine,
clinical RF rule object, or legacy module was modified.

## Future Phases

Phase 2 will migrate only the 12 clear `RF-ACT` candidates identified by the
classification audit, under a separate governed task.

Phase 3 will handle the countermovement jump and drop-jump dual
exercise/assessment cross-reference, under a separate governed task.

Later phases may clean Exercise Knowledge after governed migrations are complete,
but this Phase 1 scaffold does not move, rename, or reclassify any object.

## Validation Commands

The Phase 1 validation set is:

- `npm run validate:exercise-knowledge`
- `npm run validate:shared-knowledge-taxonomies`
- `npm run validate:activity-exposure-knowledge`
- `npm run validate:assessment-knowledge`
- `npm run check:rf-clinical`
- `npm run validate:rf-rules`
- `npm run check:rf-boundary`
