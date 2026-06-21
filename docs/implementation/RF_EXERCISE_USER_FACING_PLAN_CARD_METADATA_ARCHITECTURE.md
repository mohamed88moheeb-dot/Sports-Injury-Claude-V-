# RF Exercise — User-Facing Plan-Card Metadata Architecture

**Status:** architecture / design only · NON-EXECUTABLE · not clinically approved · no runtime integration. **No schema/validator/RF-EX object/runtime changes.** This document designs a *future* schema v2.1 layer; it implements nothing.

## 1. Purpose
Define how an exercise should eventually appear to a user **inside their rehab plan** — as a simple,
plain-language plan card — while keeping all clinical/governance metadata internal. It specifies the
future v2.1 user-facing metadata layer so a later build can render safe plan cards without exposing
evidence grades, risk tiers, or any clearance/readiness signal.

## 2. Scope
Documentation only. One file created: this doc. No edits to
`schema/exerciseObject.schema.json`, `templates/exerciseObjectTemplate.json`,
`scripts/validate-exercise-knowledge.mjs`, any RF-EX object, package.json, runtime, UI, Supabase,
RecoveryContext, injuryEngine, or any other knowledge system. Source docs were inspected read-only:
the decision table, the full-library architecture/mapping doc, and the schema-v2 governance-metadata doc.

## 3. Founder product decisions (fixed requirements)
1. **No public exercise library** — exercises appear only inside a user's rehab plan.
2. **Internal governance stays hidden** — users never see `evidence_grade`, `source_authority`,
   `RF_specificity`, `central_tendon_fibrosis_risk`, `manual_review_required`, high-caution, or clinical
   approval status; these drive personalization/governance only.
3. **Simple, practical language** on cards ("Lie on your back and lift your leg…"), not clinical phrasing.
4. **Every card explains its purpose** in plain language; supportive exercises are *not* labeled
   "supportive" but their purpose is explained naturally.
5. **One unified exercise library** — no duplication; exercises categorized by function.
6. **Media supported later** — inert reference fields only now (no upload/UI).
7. **Full trial-run goal** — intake → assessment → personalization → plan generation → cards → logging →
   progress → adjustment; card metadata is designed with that flow in mind.
8. **High-caution internal vs user-facing** — internal high-caution/clinician-review never surfaces as
   "high caution"; future external language may be "Advanced" / "Clinician-guided" — but no runtime
   visibility rules are created here.

## 4. Internal vs user-facing separation
Five conceptual layers on a single exercise object (one library, layered metadata):
- **Internal governance fields (hidden):** `final_decision`, `evidence_grade`, `source_authority`,
  `source_support_type`, `RF_specificity`, `central_tendon_fibrosis_risk`, `manual_review_required`,
  `library_classification`, `source_ids`, `source_verification_status`, `approval_status`,
  `clinical_approval_status`. Drive personalization/gating only; never rendered.
- **Clinical metadata fields (hidden):** `exercise_family`, `target_tissues`, `position_tags`,
  `tissue_demand_tags`, `contraction_bias`, `injury_site_relevance`, `safety_blockers`,
  `contraindications`, `linked_rule_ids`, `evidence_claim_ids`. Inform matching/safety, not display.
- **User-facing plan-card fields (rendered):** the v2.1 `user_facing_*` block + `plan_card_category` +
  difficulty label + media placeholders (see §5–§9).
- **Future runtime/composer fields:** selection/sequencing inputs (e.g. how a governed composer reads
  internal fields). Out of scope here.
- **Future logging/progress fields:** which log prompts a card can offer (see §11). Out of scope to build.

The card renders **only** the user-facing layer. The internal/clinical layers remain server-side inputs.

## 5. User-facing exercise card model
What a user sees on a plan card (plain language only):
- **Exercise name** (`user_facing_name`) — friendly name, e.g. "Straight-leg raise".
- **Why this is in your plan** (`user_facing_purpose`) — e.g. "This helps wake up the front-thigh muscle
  and rebuild control without adding too much strain."
- **How to do it** (`user_facing_instructions` + `user_facing_setup`) — e.g. "Lie on your back and lift
  your leg while keeping your knee straight."
- **What to watch for** (`user_facing_safety_note` + `user_facing_common_mistakes`) — gentle, non-clinical.
- **Media placeholder** (future) — thumbnail/video reference.
- **Logging action** (future) — "Mark complete", "How did it feel?".
No grades, risks, sources, or clearance language ever appear.

## 6. Proposed plan-card fields (future v2.1, names refined)
| Field | Type | Notes |
|---|---|---|
| `user_facing_name` | string | Friendly display name (distinct from internal `name`/`canonical_name`). |
| `user_facing_summary` | string | One-line "what it is". |
| `user_facing_purpose` | string | Plain "why it's in your plan" (purpose, never "supportive"). |
| `user_facing_setup` | string | Starting position in plain language. |
| `user_facing_instructions` | string | Step text or short array of steps (`array of strings` acceptable). |
| `user_facing_common_mistakes` | array of strings | Gentle "watch for" cues. |
| `user_facing_safety_note` | string | Plain comfort/stop guidance — NOT a clearance/readiness statement. |
| `plan_card_category` | enum | User-facing category (see §7). |
| `plan_card_subcategory` | string | Optional finer label (free text, user-friendly). |
| `difficulty_label` | enum | User-facing difficulty (see §9); never implies readiness/clearance. |
| `advanced_label` | enum/null | Optional external framing for internally high-caution items (see §9). |
| `easier_option_labels` | array of strings | Display-only regressions (see §10). |
| `harder_option_labels` | array of strings | Display-only progressions (see §10). |
| `related_exercise_labels` | array of strings | Display-only "see also" (no sequencing). |
| `media` | object | Inert media placeholders (see §8). |
| `user_facing_status` | enum | e.g. `draft_copy` / `copy_pending_review` — copy lifecycle, NOT clinical approval. |

All values are inert display strings/labels — no numbers, dosing, thresholds, dates, or authority language.

## 7. Plan-card categories (user-facing) → internal mapping
| User-facing `plan_card_category` | Internal `library_classification` / `final_decision` source |
|---|---|
| Warm-up | warm-up function (mobility/activation subset) |
| Activation | activation function (e.g. quad set, SLR-iso) |
| Mobility | rf_mobility_movement_restoration |
| Stretching | mobility (sub-end-range only; end-range excluded internally) |
| Strength | rf_core_loading / manual_review_strength_running_prep |
| Control | supportive_proximal_control + motor-control items (purpose explained, never labeled "supportive") |
| Conditioning | conditioning_recovery_support |
| Running Preparation | running_field_exposure (running-mechanics subset) |
| Sport Preparation | high_caution_sport_specific_exposure (only when appropriate; external label per §9) |
| Recovery | conditioning_recovery_support (recovery modalities) / low-load items |
The user-facing category is a *display* grouping derived from internal classification; it is not a clinical
decision and does not change governance.

## 8. Media placeholder model (inert; future)
A `media` object with inert reference fields only — **no upload, no Supabase, no UI**:
`demo_video_url` (string|null), `demo_video_asset_id` (string|null), `image_asset_id` (string|null),
`animation_asset_id` (string|null), `thumbnail_asset_id` (string|null), `media_status`
(enum: `none` / `placeholder` / `pending` / `linked`), `media_notes` (string). Defaults: all null/`none`.
These are references to *future* assets; the object stores no binary and triggers no fetch.

## 9. Difficulty and advanced-label model (safe, non-clinical)
- `difficulty_label` enum (user-facing, non-clinical): `Foundational` · `Controlled` · `Progressive` ·
  `Advanced` · `Clinician-guided`.
- `advanced_label` enum/null: optional external framing for internally high-caution or clinician-review
  items, e.g. `Advanced` or `Clinician-guided` or `Only appears when appropriate in your plan`.
**These labels must NOT imply readiness, clearance, approval, or "you are ready for this".** They describe
relative complexity only. Internal `central_tendon_fibrosis_risk` / `manual_review_required` /
`high_caution` are never shown; the external label is a separate, softer concept. Mapping from internal
high-caution → external `Advanced`/`Clinician-guided` is a **future governed rule**, not defined here.

## 10. Regression/progression display model
Display-only "easier/harder option" labels so a user can see alternatives **without** any automatic
progression:
- `easier_option_labels` — plain names of gentler alternatives.
- `harder_option_labels` — plain names of more demanding alternatives.
- `related_exercise_labels` — plain "see also" names.
These are **labels for display**, not links that sequence or authorize movement between exercises. They
create **no progression authority, no plan sequencing, no readiness, no clearance**. Whether/when a user
moves between options is decided later by a governed composer + clinician logic, never by these fields.

## 11. Future logging model (plan/logging concept, not exercise-object authority)
Boolean "availability" flags describing which log prompts a card *could* offer in a future plan/logging
layer — not data capture, not runtime:
`log_completion_available`, `log_pain_response_available`, `log_difficulty_available`,
`log_confidence_available`, `log_notes_available`, `next_day_response_prompt_available`.
These declare *capability* only; actual logging UI/state lives in the future plan/logging system, not in
the exercise object. They store no user data and assert no progression/readiness.

## 12. Guardrails
The user-facing layer must never expose or imply: diagnosis authority · prescription authority · dosage
authority · automatic progression · readiness · RTT/RTS · clearance · pass/fail testing. No card field may
contain sets/reps/frequency/rest/intensity/duration/dates/percentages/thresholds. `user_facing_safety_note`
is comfort/stop guidance only, never "cleared to…/ready for…". Internal governance/clinical fields are
never rendered. All v2.1 fields are inert display metadata.

## 13. Minimal schema v2.1 recommendation (future — do not implement now)
Smallest safe addition, mirroring the v2 backward-compatible pattern (Option A: optional fields,
`additionalProperties:false` preserved, opt-in enforcement by validator):
- **Fields to add (optional):** `user_facing_name` (string), `user_facing_summary` (string),
  `user_facing_purpose` (string), `user_facing_setup` (string), `user_facing_instructions`
  (string OR array of strings), `user_facing_common_mistakes` (array of strings),
  `user_facing_safety_note` (string), `plan_card_category` (enum), `plan_card_subcategory` (string),
  `difficulty_label` (enum), `advanced_label` (enum|null), `easier_option_labels` (array of strings),
  `harder_option_labels` (array of strings), `related_exercise_labels` (array of strings),
  `media` (object with the §8 keys; `additionalProperties:false`), `user_facing_status` (enum),
  plus the §11 `log_*_available` booleans.
- **Enums:** `plan_card_category` = the 10 §7 categories; `difficulty_label` = Foundational/Controlled/
  Progressive/Advanced/Clinician-guided; `advanced_label` = Advanced/Clinician-guided/
  Only_appears_when_appropriate/null; `media.media_status` = none/placeholder/pending/linked;
  `user_facing_status` = draft_copy/copy_pending_review.
- **Required for future v2.1-authored objects (when an object opts in):** `user_facing_name`,
  `user_facing_purpose`, `user_facing_instructions`, `plan_card_category`, `difficulty_label`.
- **Optional / backward-compatible:** everything else; existing 87 objects (no v2.1 fields) keep validating.
- **Preserve:** `additionalProperties:false`; v2 governance rules unchanged.

## 14. Validator requirements for v2.1 (future)
- Assert the v2.1 fields exist in `schema.properties` (mirrors the v2 field-presence assertion).
- Keep `additionalProperties:false` + unknown-top-level-field rejection (already hardened in v2).
- **v2.1 opt-in enforcement:** if an object includes any `user_facing_*`/`plan_card_*`/`difficulty_label`
  field, require the §13 required subset; `plan_card_category` ∈ enum; `difficulty_label` ∈ enum.
- **Leakage guard:** user-facing string fields must not contain internal tokens or numeric dosing/dates/
  percentages, and must pass the existing negation-aware active-authority scan (no "ready for"/"cleared
  to"/clearance/readiness/pass-fail). `media` urls/ids are inert strings, never fetched.
- No requirement added to legacy objects; no new package (Node built-ins only).

## 15. Trial-run implications
This card layer is the render target for the eventual trial run
(assessment → personalization → plan cards → logging → adjustment):
- **Personalization** reads internal governance/clinical fields (hidden) to select exercises; **only** the
  user-facing layer is shown — so personalization stays governed while the UX stays simple.
- **Plan cards** render `user_facing_*` + category + difficulty + media placeholder — no clinical exposure.
- **Logging** uses the §11 capability flags to know which prompts a card may show; capture lives in the
  future plan/logging system.
- **Adjustment** is driven by governed rules over logged evidence + capacity, **not** by the display-only
  easier/harder labels. This doc defines what cards must *carry*, not how plans are composed/adjusted.

## 16. What not to implement yet
No schema/template/validator edits; no v2.1 implementation; no RF-EX authoring; no media upload/asset
pipeline; no Supabase/UI/runtime; no plan composer; no progression/sequencing/readiness logic; no logging
capture; no internal→external high-caution mapping rule. All of the above are future governed tasks.

## 17. Recommended next implementation task
Implement **schema v2.1 + validator update** (optional user-facing/plan-card/media/logging-flag fields,
backward-compatible, opt-in enforcement + leakage guard) per §13–§14 — validator-only object enforcement,
no RF-EX edits — then Codex audit, then author RF Exercise Batch 1 with v2 **and** v2.1 fields, then audit
Batch 1, then plan-composer architecture.

## 18. Files changed
- `docs/implementation/RF_EXERCISE_USER_FACING_PLAN_CARD_METADATA_ARCHITECTURE.md` (new — this file).

## 19. Scope verification
No schema, template, validator, RF-EX object, package.json, runtime, UI, Supabase, RecoveryContext,
injuryEngine, or other knowledge-system files modified. Verified via `git status --short` (only this doc).
