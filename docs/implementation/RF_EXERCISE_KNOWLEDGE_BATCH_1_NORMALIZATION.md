# RF Exercise Knowledge — Batch 1 Normalization

**Status:** 18 Batch-1 exercises normalized to v2 + v2.1 (13 existing upgraded, 5 newly created RF-EX-088…092) · all draft · pending · clinically not approved · NON-EXECUTABLE · runtime none · metadata only. **No duplicate concepts; no RF-EX object outside the mapping modified; no schema/template/validator/runtime changes.**

## 1. Purpose
Normalize the first controlled group of RF rehab exercises into the v2 (governance) + v2.1 (user-facing
plan-card) structure so they are ready for future rehab-plan rendering — one exercise exists once,
upgrading existing matches and creating only genuinely missing exercises.

## 2. Scope
Authoring/normalization inside the existing RF Exercise Knowledge system only. Edited 13 existing RF-EX
objects (exact/probable Batch-1 matches), created 5 new (RF-EX-088…092), updated the status count. No
schema/template/validator/package.json/runtime/UI/Supabase/RecoveryContext/injuryEngine/RF-rule/assessment/
capacity/activity-exposure/evidence-linking/legacy changes.

## 3. Founder rehab principle
Rehab is injury-led but athlete-system aware: the plan centers on the injured RF tissue and its
capacities, but early rehab also includes selected hip, glute, trunk, control, and conditioning work, all
specific to the original RF injury. Batch 1 reflects an early-to-foundational RF set across activation,
mobility, low-load strength, hip control, glute support, trunk control, single-leg control, and low-load
conditioning. No universal redesign.

## 4. Batch 1 candidate list
Quad set · Straight-leg raise · Heel slides/active knee ROM · Prone quad mobility · Half-kneeling pelvic
tilt · Sub-end-range RF/quad mobility · Isometric hip flexion at 90° · Terminal/short-arc knee extension ·
Step-up · Single-leg deadlift · Glute bridge · Side-lying hip abduction · Clamshell · Lateral band walk ·
Side plank · Dead bug · Low-load cycling · Swimming/aquatic conditioning (18).

## 5. Existing-object mapping table
| # | Candidate | Decision-table row | Match | Existing RF-EX | Decision |
|---|---|---|---|---|---|
| 1 | Quadriceps set | 1 | partial (RF-EX-022 restricted generic) | — | **create new** RF-EX-088 |
| 2 | Straight-leg raise | 2 | probable | RF-EX-012 | **upgrade** |
| 3 | Heel slides / active knee ROM | 4 | partial (RF-EX-024 restricted) | — | **create new** RF-EX-089 |
| 4 | Prone quad dynamic mobility | 5 | exact | RF-EX-020 | **upgrade** |
| 5 | Half-kneeling pelvic tilt | 6 | exact | RF-EX-025 | **upgrade** |
| 6 | Sub-end-range RF/quad mobility | 7 | partial (no clean) | — | **create new** RF-EX-090 |
| 7 | Isometric hip flexion at 90° | 9 | exact | RF-EX-005 | **upgrade** (manual-review) |
| 8 | Terminal/short-arc knee extension | 15 | partial (RF-EX-001 reclined ISO) | — | **create new** RF-EX-091 |
| 9 | Step-up | 26 | exact | RF-EX-016 | **upgrade** |
| 10 | Single-leg deadlift | 28 | none | — | **create new** RF-EX-092 |
| 11 | Glute bridge | 29 | probable | RF-EX-032 | **upgrade** |
| 12 | Side-lying hip abduction | 31 | exact | RF-EX-030 | **upgrade** |
| 13 | Clamshell | 32 | exact | RF-EX-031 | **upgrade** |
| 14 | Lateral band walk | 33 | exact | RF-EX-034 | **upgrade** |
| 15 | Side plank | 35 | exact | RF-EX-039 | **upgrade** |
| 16 | Dead bug | 37 | exact | RF-EX-041 | **upgrade** |
| 17 | Low-load cycling | 39 | probable | RF-EX-080 | **upgrade** |
| 18 | Swimming/aquatic conditioning | 40 | probable | RF-EX-081 | **upgrade** |

## 6. Objects upgraded (13)
RF-EX-005, RF-EX-012, RF-EX-016, RF-EX-020, RF-EX-025, RF-EX-030, RF-EX-031, RF-EX-032, RF-EX-034,
RF-EX-039, RF-EX-041, RF-EX-080, RF-EX-081. Each had all base fields preserved and the 13 v2 + 22 v2.1
fields added.

## 7. Objects newly created (5)
RF-EX-088 quadriceps_set · RF-EX-089 heel_slides_active_knee_rom · RF-EX-090 subrange_rf_quad_mobility ·
RF-EX-091 terminal_knee_extension · RF-EX-092 single_leg_deadlift. Each authored with full base + v2 + v2.1.

## 8. Objects deferred and why
None of the 18 were dropped. High-caution/second-batch/hold/excluded exercises (sprinting, kicking,
plyometrics, end-range/ballistic stretches, etc.) were **not** included in Batch 1 by design. Note:
isometric hip flexion at 90° (decision-table `second_batch_manual_review`) was included as the founder's
candidate #7 and authored with `manual_review_required: true` (not high-caution).

## 9. Duplicate-prevention decisions
- Quad set, heel slides, sub-range mobility, terminal knee extension: existing nearby objects (RF-EX-022/
  023/024/001) are restricted-context or different concepts, so new clean objects were created rather than
  overloading them — no concept duplicated.
- Single-leg deadlift: no existing match → created.
- All exact/probable matches were **upgraded in place** (never re-created).
- Existing restricted-context objects (RF-EX-022/023/024) were left untouched and not duplicated.

## 10. v2 governance metadata summary
All 18 carry the 13 v2 fields with decision-table-sourced values: `final_decision` (first_batch_safe /
supportive_proximal_control / conditioning_recovery_support / second_batch_manual_review), `evidence_grade`
(B/C — no Grade A invented), `source_authority`, `source_support_type`, `RF_specificity`,
`central_tendon_fibrosis_risk` (low except iso-hip-flexion = moderate), `manual_review_required`,
`library_classification`, `injury_site_relevance`, `source_ids` (real SG/CR/CGDR ids — none invented),
`source_verification_status` (honest verified/partially_verified), and the 7 exact `guardrail_notes`.

## 11. v2.1 user-facing metadata summary
All 18 carry the 22 v2.1 fields: plain-language `user_facing_name/summary/purpose/setup`, step-array
`user_facing_instructions`, `user_facing_common_mistakes`, `user_facing_safety_note`, `plan_card_category`
(activation/mobility/control/strength/conditioning), `difficulty_label` (foundational/controlled),
`advanced_label: none`, display-only easier/harder/related labels, inert `media`, `user_facing_status:
draft_copy`, and the standard logging-capability flags.

## 12. User-facing copy rules
Copy is short, practical, step-by-step, and non-clinical; each card has a one-line purpose. No forbidden
tokens (sets/reps/frequency/intensity/duration/rest/threshold/score/percent/%, ready-for/cleared-for/
clearance/RTS/RTT/return-to-sport-or-training/progression-gate, or any internal governance token).
Position descriptions avoid numeric targets (e.g. "bent to about a right angle"). Verified by the
validator's leakage guard (all 18 pass).

## 13. Media placeholder handling
Every object carries the full inert `media` block (`media_status: none`, all asset/url fields null). No
fetching, binary, Supabase, or UI.

## 14. Logging flags
Consistent defaults on all 18: `log_completion_available`, `log_pain_response_available`,
`log_difficulty_available`, `log_notes_available`, `next_day_response_prompt_available` = true;
`log_confidence_available` = false. Capability flags only — no capture, no progression/readiness.

## 15. Dosage/authority guardrails
The inert `dosage` block remains inert (`active_prescription_present:false`, all values null). No active
dosage, sets/reps/frequency/rest/intensity/duration, return dates, progression increments, readiness,
RTT/RTS, clearance, pass/fail, thresholds, scores, or percentages anywhere. No plan sequencing/selection/
assessment logic created. easier/harder labels are display-only (no progression authority).

## 16. Commands run
All nine governance checks + evidence-linking regression — all PASS; exercise-knowledge reports 92 objects
(see task report).

## 17. Scope verification
`git status` shows only the 13 upgraded + 5 new RF-EX objects, the status count, and this doc. No RF-EX
object outside the mapping was modified; no schema/template/validator/runtime/package.json changes.

## 18. Warnings
- `central_tendon_fibrosis_risk` and `manual_review_required` are honest per the decision table; the 2026
  Aspetar pathway remains only partially verified, reflected in `source_verification_status`.
- Objects are draft / not clinically approved; user-facing copy is `draft_copy` pending review.
- Restricted-context objects RF-EX-022/023/024 still overlap the "quad set / knee ROM" concepts at the
  generic level; they remain restricted and were intentionally not merged — a future review may relabel or
  deprecate them.

## 19. Recommended next task
**Codex/clinical audit of Batch 1** (v2 + v2.1 correctness, copy safety, no duplication), then **Batch 2
normalization** (manual-review strength & running-prep) with the same v2 + v2.1 structure, clinician-gated;
high-caution and excluded tiers remain deferred.
