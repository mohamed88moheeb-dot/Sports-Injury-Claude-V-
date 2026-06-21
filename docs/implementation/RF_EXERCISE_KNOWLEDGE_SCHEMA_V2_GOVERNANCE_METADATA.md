# RF Exercise Knowledge — Schema v2 Governance Metadata

**Status:** schema + validator preparation only · NON-EXECUTABLE · not clinically approved · no runtime integration. **No RF-EX objects authored or edited.**

## 1. Purpose
Add the 13 governance-metadata fields from the Master RF Exercise Library Decision Table to the Exercise
Knowledge schema/template/validator so future RF-EX objects can carry full evidence/risk/source governance —
without breaking the existing 87 objects.

## 2. Scope
Allowed files only: `schema/exerciseObject.schema.json`, `templates/exerciseObjectTemplate.json`,
`status/exerciseKnowledgeStatus.json` (note + version), `scripts/validate-exercise-knowledge.mjs`, and this
doc. No object authoring/edits; no runtime/UI/Supabase/RecoveryContext/injuryEngine/RF-rule/assessment/
capacity/activity-exposure/evidence-linking/legacy changes.

## 3. Source architecture/mapping doc
`docs/implementation/MASTER_RF_EXERCISE_LIBRARY_DECISION_TABLE.md` and
`docs/implementation/RF_EXERCISE_KNOWLEDGE_FULL_LIBRARY_ARCHITECTURE_AND_MAPPING.md` (decisions unchanged).

## 4. Why schema v2 was needed
The mapping task found 13 governance fields blocked by `additionalProperties: false`. Without them, future
Batch 1 objects could not carry `final_decision`, `evidence_grade`, risk tier, source provenance, or the
guardrail block. Schema v2 admits these fields while preserving the strict closed-object posture.

## 5. Backward-compatibility decision (Option A)
**Option A — add the 13 fields as OPTIONAL.** None is added to `required`. `additionalProperties: false`
is preserved. The existing 87 objects contain none of these keys, so they validate unchanged. The
**validator** then enforces v2 governance rules **only for objects that opt in** (i.e. include any one of
the 13 fields). This is the smallest safe change: legacy objects untouched, future objects strictly governed.
(Option B — a nested `metadata_governance` block — was rejected as heavier and would still need conditional
enforcement.)

## 6. Fields added (schema, optional)
`canonical_name`, `final_decision`, `evidence_grade`, `source_authority`, `source_support_type`,
`RF_specificity`, `central_tendon_fibrosis_risk`, `manual_review_required`, `library_classification`,
`injury_site_relevance`, `guardrail_notes`, `source_ids`, `source_verification_status`.

## 7. Field meanings / types
- `canonical_name` — string; stable snake_case decision-table name.
- `final_decision` — enum: first_batch_safe_metadata · supportive_proximal_control · conditioning_recovery_support · second_batch_manual_review · high_caution_do_not_convert_yet · hold_for_review · exclude.
- `evidence_grade` — enum: A · B · C · D.
- `source_authority` — enum: high · moderate · low · mixed · low-moderate.
- `source_support_type` — enum: direct_exercise_support · indirect_principle_support · contextual_support · mixed.
- `RF_specificity` — enum: high · moderate · low · low-moderate · moderate-high · indirect · indirect-moderate · not_rf_specific · ambiguous · high_mechanism_low_injury_evidence.
- `central_tendon_fibrosis_risk` — enum: low · moderate · high.
- `manual_review_required` — boolean | null (null only in the blank template).
- `library_classification` — enum: rf_core_loading · rf_mobility_movement_restoration · supportive_proximal_control · conditioning_recovery_support · manual_review_strength_running_prep · running_field_exposure · reactive_plyometric_exposure · high_caution_sport_specific_exposure · hold_review_only · excluded_not_authored.
- `injury_site_relevance` — array of enum strings: proximal_tendon · central_intramuscular_tendon · myotendinous · muscular · unspecified.
- `guardrail_notes` — array of strings (the seven mandatory negated guardrails for v2 objects).
- `source_ids` — array of strings (e.g. SG-S4, CR-S18, CGDR-S2); reference only.
- `source_verification_status` — enum: verified · partially_verified · unverified · mixed.
All are inert classification metadata; none carries dosage/prescription/progression/readiness/RTT-RTS/
clearance authority.

## 8. Template update
`exerciseObjectTemplate.json` now includes the 13 fields with schema-safe inert defaults (enums cannot be
blank `""`, so neutral values are used): `final_decision: hold_for_review`, `evidence_grade: D`,
`source_authority: low`, `source_support_type: contextual_support`, `RF_specificity: ambiguous`,
`central_tendon_fibrosis_risk: low`, `manual_review_required: null`, `library_classification: hold_review_only`,
`source_verification_status: unverified`, `canonical_name: ""`, `injury_site_relevance: []`, `source_ids: []`,
and the full 7-line `guardrail_notes` block. The template is a scaffold (not an authored object) and is not
run through the v2 object-enforcement path.

## 9. Validator updates
- **New prohibited KEY patterns** (token-delimited so they cannot false-positive inside benign existing keys):
  `pass_fail`/`passfail`/`threshold`/`cutoff`; `score`/`numeric_score`/`percent_score`;
  `readiness`/`readiness_score`/`ready_for`; `rts`/`rtt`/`return_to_sport`/`return_to_training`;
  `clearance`/`cleared_for`; `progression_gate`/`progression_authorization`.
- **New active-authority VALUE scan** (negation-aware): flags phrases like "ready for", "cleared for/to",
  "clearance granted", "readiness score", "pass/fail", "authorizes/grants clearance|readiness|progression|
  return to sport/training", "RTS/RTT approved" — **only when not negated**. Negated governance language
  ("not clearance", "not a test", "does not imply readiness") passes (verified by unit test).
- **v2 opt-in enforcement** (see §10–§13). Applies only to objects including ≥1 of the 13 fields.

## 10. High-caution validation readiness
For a v2 object with `final_decision: high_caution_do_not_convert_yet`, the validator requires
`manual_review_required: true`, `central_tendon_fibrosis_risk ∈ {high, moderate}`, and the full
`guardrail_notes` block. (No high-caution object exists yet; this is future-proofing only.)

## 11. Excluded-object handling
A v2 object with `final_decision: exclude` **fails** validation ("must remain documentation-only").
Excluded exercises (#58–#62 in the table) stay documentation-only and are not authored as objects.

## 12. Guardrail-note enforcement
Any v2 object must include `guardrail_notes` containing all seven exact guardrails: "not a prescription",
"not dosage", "not progression", "not readiness", "not RTT/RTS", "not clearance", "not a test". Legacy
objects (no v2 fields) are exempt.

## 13. Source metadata handling
Any v2 object must include non-empty `source_ids`, `source_authority`, `source_support_type`,
`source_verification_status`, and `evidence_grade`. Legacy objects are exempt.

## 14. What was not done
No RF-EX objects authored or edited; no Batch 1 objects created; no existing object migrated to v2; no
runtime/UI/Supabase/RecoveryContext/injuryEngine/RF-rule changes; no package.json change; no separate
clinical-rule-binding schema (kept inside Exercise Knowledge). Decision-table classifications unchanged.

## 15. Files changed
- `lib/clinical/exerciseKnowledge/schema/exerciseObject.schema.json` (13 optional fields; title → v2)
- `lib/clinical/exerciseKnowledge/templates/exerciseObjectTemplate.json` (inert v2 defaults)
- `lib/clinical/exerciseKnowledge/status/exerciseKnowledgeStatus.json` (version bump + schema_note only)
- `scripts/validate-exercise-knowledge.mjs` (new key patterns, value scan, v2 enforcement)
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_SCHEMA_V2_GOVERNANCE_METADATA.md` (this file)

## 16. Commands run
All nine governance checks (see task report) — all PASS; exercise-knowledge still reports 87 objects.

## 17. Scope verification
`git status --short` shows only the four allowed code/doc files (plus this doc); **no RF-EX object file
changed**, no other knowledge system, runtime, or package.json modified.

## 17a. Validator hardening after Codex audit
Codex audited schema v2 + the validator and returned **PASS WITH WARNINGS** (no blocking clinical safety
issue), flagging three validator gaps. All three are now closed in `scripts/validate-exercise-knowledge.mjs`
(validator-only change; no RF-EX objects edited):
- **Codex warning addressed (1) — schema v2 field-presence assertion:** the validator now loads the schema
  and asserts all 13 governance fields are present in `schema.properties`; missing any → fail.
- **Codex warning addressed (2) — `additionalProperties:false` assertion:** the validator asserts
  `schema.additionalProperties === false`; otherwise → fail. It also asserts the 41 legacy base fields remain
  in `schema.required` and that the 13 v2 fields stay optional (not globally required).
- **Codex warning addressed (3) — unknown top-level object-field rejection:** the validator now rejects any
  top-level key on an RF-EX object (and on the template) that is not in `schema.properties` — approximating
  JSON Schema `additionalProperties:false` using only Node built-ins (no AJV / no new package). `$comment`
  is exempt.
- **v2 opt-in behavior unchanged:** guardrail-block, source-metadata completeness, high-caution, and
  exclude rules still apply only to objects that include a v2 governance field.
- **No RF-EX objects edited:** hardening passes with the existing 87 objects unchanged.
- **All checks pass** (see §16 / task report).

## 18. Recommended next task
**Author RF Exercise Library Batch 1 as v2-governed draft metadata** (first-safe + supportive + conditioning,
~5 new objects + update-later for existing matches), each carrying the full governance fields and the
guardrail block, validated by the strengthened validator — leaving manual-review, high-caution, hold, and
excluded tiers for later clinician-gated phases.
