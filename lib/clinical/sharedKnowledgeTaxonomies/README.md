# Shared Knowledge Taxonomies (v1.0 scaffold) — NON-EXECUTABLE

Shared, governed **metadata vocabularies** for a multi-sport rehab knowledge system. These
taxonomies are the common language used by three separate knowledge systems
(Exercise Knowledge, Activity Exposure Knowledge, Assessment Knowledge) and by a future,
rule-governed rehab composition model.

**Nothing here is clinically approved, executable, or wired into runtime.** No taxonomy creates
dose, progression, readiness, return-to-training, or return-to-sport clearance, and no taxonomy
selects exercises or generates plans.

## Files
| File | Purpose |
|---|---|
| `exerciseFunctionTaxonomy.json` | What an exercise develops (function categories) |
| `contractionTaxonomy.json` | Contraction/loading descriptors (metadata only) |
| `exerciseIntentTaxonomy.json` | Why an exercise is chosen (intent) |
| `movementPatternTaxonomy.json` | Movement patterns |
| `sportDemandTaxonomy.json` | Demand-based sport model + sport→demand examples |
| `equipmentTaxonomy.json` | Equipment with home/gym/clinic/field/lab settings |
| `activityExposureTaxonomy.json` | Activity/sport exposure domains (clearance-sensitivity flagged) |
| `assessmentPurposeTaxonomy.json` | Assessment/test/readiness purposes |
| `rehabPlanBlockTaxonomy.json` | Future rehab-plan blocks + which system each pulls from |
| `rehabCompositionModel.json` | Structure-only model for composing a rehab day |

## Governance
Every taxonomy carries `approval_status: pending`, `executable: false`, `runtime_integration: none`,
and a non-empty `categories`. Validated by `npm run validate:shared-knowledge-taxonomies`.

See `docs/implementation/KNOWLEDGE_SYSTEMS_ONTOLOGY_AND_REHAB_COMPOSITION_MODEL.md` for the full
ontology and three-system model.
