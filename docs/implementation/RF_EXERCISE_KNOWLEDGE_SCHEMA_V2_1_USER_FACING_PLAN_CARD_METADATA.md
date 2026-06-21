# RF Exercise Knowledge — Schema v2.1 User-Facing Plan-Card Metadata

**Status:** schema + template + validator update only · NON-EXECUTABLE · not clinically approved · no runtime integration. **No RF-EX objects authored or edited.**

## 1. Purpose
Add backward-compatible schema v2.1 support for **user-facing exercise plan-card metadata**, so future
RF-EX objects can render as simple rehab-plan cards without exposing internal governance, evidence grades,
risk labels, or any clinical authority.

## 2. Scope
Allowed files only: `schema/exerciseObject.schema.json`, `templates/exerciseObjectTemplate.json`,
`status/exerciseKnowledgeStatus.json` (note + version), `scripts/validate-exercise-knowledge.mjs`, and this
doc. No RF-EX object authoring/edits; no runtime/UI/Supabase/RecoveryContext/injuryEngine/RF-rule/
assessment/capacity/activity-exposure/evidence-linking/legacy/package.json changes.

## 3. Source architecture doc
`docs/implementation/RF_EXERCISE_USER_FACING_PLAN_CARD_METADATA_ARCHITECTURE.md` (and the v2 governance,
full-library, and decision-table docs). Decisions unchanged.

## 4. Founder product decisions reflected
No public library (cards only inside a plan); internal governance never shown; simple practical copy;
each card explains its purpose plainly; "supportive" never surfaced as a label; high-caution never shown
as "high caution"; inert media placeholders only; designed for the future intake→assessment→
personalization→plan→cards→logging→adjustment flow.

## 5. Why schema v2.1 was needed
v2 added internal governance metadata; nothing yet describes how an exercise should *appear* to a user.
v2.1 adds the display layer (user-facing copy, plan-card category, difficulty, media placeholders, logging
capability flags) so a later build can render safe cards — while keeping all v2 governance internal.

## 6. Backward-compatibility decision (Option A, same as v2)
All v2.1 fields are **optional**; none added to `required`; `additionalProperties:false` preserved. The
existing 87 objects contain no v2.1 fields → validate unchanged (confirmed). The validator enforces v2.1
rules **only for objects that opt in** (include any v2.1 field).

## 7. Fields added (optional)
`user_facing_name`, `user_facing_summary`, `user_facing_purpose`, `user_facing_setup`,
`user_facing_instructions`, `user_facing_common_mistakes`, `user_facing_safety_note`, `plan_card_category`,
`plan_card_subcategory`, `difficulty_label`, `advanced_label`, `easier_option_labels`,
`harder_option_labels`, `related_exercise_labels`, `media`, `user_facing_status`,
`log_completion_available`, `log_pain_response_available`, `log_difficulty_available`,
`log_confidence_available`, `log_notes_available`, `next_day_response_prompt_available` (22 total).

## 8. Field meanings / types
- Plain-language copy: `user_facing_name`/`summary`/`purpose`/`setup` (string), `user_facing_instructions`
  (string OR array of strings), `user_facing_common_mistakes` (array), `user_facing_safety_note` (string).
- `plan_card_category` enum: warm_up · activation · mobility · stretching · strength · control ·
  conditioning · running_preparation · sport_preparation · recovery. `plan_card_subcategory` (string).
- `difficulty_label` enum: foundational · controlled · progressive · advanced · clinician_guided —
  **never implies readiness/clearance/approval**.
- `advanced_label` enum|null: advanced · clinician_guided · only_appears_when_appropriate · none · null.
- `easier_option_labels` / `harder_option_labels` / `related_exercise_labels` (arrays) — **display-only**,
  no progression authority or sequencing.
- `media` — inert placeholder object (see §9).
- `user_facing_status` enum: draft_copy · copy_pending_review · copy_reviewed — copy lifecycle, NOT clinical approval.
- `log_*_available` / `next_day_response_prompt_available` (boolean) — future logging **capability flags
  only**; store no user data, assert no progression/readiness.
All v2.1 fields are inert display metadata: no dosage, progression, readiness, RTT/RTS, clearance, or
prescription authority.

## 9. Media object design
`media` (object, `additionalProperties:false`): `demo_video_url`, `demo_video_asset_id`, `image_asset_id`,
`animation_asset_id`, `thumbnail_asset_id` (string|null), `media_status` (enum: none·placeholder·pending·
linked), `media_notes` (string|null). Inert references only — no fetching, no binary, no Supabase, no UI.

## 10. Template update
`exerciseObjectTemplate.json` now includes all 22 v2.1 fields with inert defaults (empty strings/arrays,
`plan_card_category: activation`, `difficulty_label: foundational`, `advanced_label: none`,
`user_facing_status: draft_copy`, all `log_*: false`, `media.media_status: none`). The template is a
scaffold and is not run through the v2.1 object-enforcement path.

## 11. Validator updates
- **v2.1 field-presence assertion** — all 22 v2.1 fields must exist in `schema.properties`; `media`
  sub-object must be `additionalProperties:false`.
- **Optional guarantee** — none of the 22 may be in `schema.required`.
- **Template alignment + unknown-field rejection** — unchanged from v2 (every top-level key must be a
  schema property).
- **v2.1 opt-in enforcement** — an object including any v2.1 field must have non-empty `user_facing_name`,
  `user_facing_purpose`, `user_facing_instructions`, `plan_card_category`, `difficulty_label`
  (`user_facing_instructions` = non-empty string or non-empty array of non-empty strings); enum validation
  for `plan_card_category`, `difficulty_label`, `advanced_label`, `user_facing_status`, `media.media_status`.
- **Media validation** — object only, closed keys, valid status, string/null fields.
- **v2 governance behavior preserved** — guardrail block, source-metadata completeness, high-caution
  requirements, `exclude` failure, unknown-field rejection, `additionalProperties:false` assertion all
  still run.

## 12. User-facing leakage guard
For v2.1-governed objects, all user-facing text fields (and `media.media_notes`) are hard-rejected if they
contain internal/governance/dosage/authority tokens: `evidence_grade`, `source_authority`,
`RF_specificity`, `central_tendon_fibrosis_risk`, `manual_review_required`, `high_caution`,
`approval_status`, `clinical_approval_status`, `not_approved`, `source_ids`, `QRF-`, `RF-SAF-`, `RF-DX-`,
`RF-ASSESS-`, `CAP-#`, plus `sets`/`reps`/`frequency`/`intensity`/`duration`/`rest`/`threshold`/`cutoff`/
`score`/`percent`/`%`/`ready for`/`cleared for`/`clearance`/`rts`/`rtt`/`return to sport|training`/
`progression gate`. The negation-aware active-authority scan also runs. Verified: real dosing/governance
phrases flag; plain card copy passes. (User-facing copy must contain internal governance phrases **at
all** — hard reject, not negation-tolerant — per founder requirement; negation tolerance remains only for
internal notes elsewhere.)

## 13. Logging flags
The six `log_*_available` / `next_day_response_prompt_available` booleans declare which prompts a card
*could* offer in a future plan/logging layer. They are capability declarations only — no capture, no
runtime, no progression/readiness.

## 14. What was not done
No RF-EX objects authored/edited; no Batch 1; no media upload/asset pipeline; no Supabase/UI/runtime; no
plan composer; no progression/sequencing/readiness logic; no logging capture; no internal→external
high-caution mapping rule; no package.json change.

## 15. Files changed
- `lib/clinical/exerciseKnowledge/schema/exerciseObject.schema.json` (22 optional v2.1 fields + closed media)
- `lib/clinical/exerciseKnowledge/templates/exerciseObjectTemplate.json` (inert v2.1 defaults)
- `lib/clinical/exerciseKnowledge/status/exerciseKnowledgeStatus.json` (version + schema_note only)
- `scripts/validate-exercise-knowledge.mjs` (v2.1 assertions, opt-in enforcement, enums, leakage guard, media checks)
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_SCHEMA_V2_1_USER_FACING_PLAN_CARD_METADATA.md` (this file)

## 16. Commands run
All eight governance checks + evidence-linking regression — all PASS; exercise-knowledge still reports 87
objects (see task report).

## 17. Scope verification
`git status --short` shows only the allowed schema/template/status/validator/doc files; **no RF-EX object
file changed**; no runtime/UI/Supabase/RecoveryContext/injuryEngine/package.json/other-system changes.

## 18. Recommended next task
**Codex audit of schema v2.1**, then **author RF Exercise Batch 1** with v2 **and** v2.1 fields (first-safe +
supportive + conditioning from RF-EX-088), each carrying governance metadata, guardrail notes, source
provenance, and plain-language user-facing card copy — validated by the hardened validator — then audit
Batch 1, then plan-composer architecture.
