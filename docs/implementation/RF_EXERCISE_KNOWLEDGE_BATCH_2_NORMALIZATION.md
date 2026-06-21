# RF Exercise Knowledge — Batch 2 Normalization

**Status:** 17 Batch-2 exercises normalized to v2 + v2.1 (10 existing upgraded, 7 new RF-EX-093…099) · all draft · pending · clinically not approved · NON-EXECUTABLE · runtime none · metadata only. **High-caution/excluded items deferred; no duplicate concepts; no schema/template/validator/runtime changes.**

## 1. Purpose
Plan the remaining decision-table rows into Batch 2 / Batch 3 / deferred, and author/normalize **Batch 2
only** — manual-review strength, controlled lower-body strength, running-preparation foundations, and the
remaining non-high-caution supportive items — into the v2 + v2.1 structure.

## 2. Scope
Authoring/normalization inside the existing RF Exercise Knowledge system. Edited 10 existing RF-EX objects
(exact/probable Batch-2 matches), created 7 new (RF-EX-093…099), updated the status count/notes. No
schema/template/validator/package.json/runtime/UI/Supabase/RecoveryContext/injuryEngine/RF-rule/assessment/
capacity/activity-exposure/evidence-linking/legacy changes.

## 3. Founder rehab principle
Injury-led but athlete-system aware: RF tissue stays central; mid-rehab adds selected hip/glute/trunk/
control and broader lower-body strength as tolerance grows; running-prep and sport-prep come later and more
gated. Batch 2 advances controlled strength + running-prep foundations while high-caution stays deferred.

## 4. Remaining exercise classification table
| Row | Concept | Existing match | Batch | Decision |
|---|---|---|---|---|
| 3 | Eccentric SLR lowering | none | Batch 2 | create RF-EX-099 (manual-review) |
| 9 | Isometric hip flexion 90° | RF-EX-005 | (done Batch 1) | — |
| 11 | Standing/cable hip flexion | RF-EX-006 (probable) | Batch 2 | upgrade |
| 16 | Leg extension machine | RF-EX-004 (exact) | Batch 2 | upgrade |
| 21 | Static split squat | none | Batch 2 | create RF-EX-093 |
| 22 | Bulgarian split squat | none | Batch 2 | create RF-EX-094 |
| 23 | Reverse lunge | RF-EX-015 (probable) | Batch 2 | upgrade |
| 24 | Walking lunge | RF-EX-014 (exact) | Batch 2 | upgrade |
| 25 | Forward/clock lunge | none | Batch 2 | create RF-EX-095 |
| 27 | Step-down | none | Batch 2 | create RF-EX-096 |
| 41 | Reverse sled drag | none | Batch 2 | create RF-EX-097 |
| 42 | Prowler march | none | Batch 2 | create RF-EX-098 |
| 44 | High-knee drill | RF-EX-046 (exact) | Batch 2 | upgrade |
| 45 | Butt-kick drill | RF-EX-047 (exact) | Batch 2 | upgrade |
| 30 | Hip thrust (supportive) | RF-EX-033 (probable) | Batch 2 | upgrade |
| 34 | Monster walk (supportive) | RF-EX-036 (exact) | Batch 2 | upgrade |
| 36 | Front plank (supportive) | RF-EX-040 (exact) | Batch 2 | upgrade |
| 38 | Pallof press (supportive) | RF-EX-042 (exact) | Batch 2 | upgrade |
| 43 | Running drill progression | partial (RF-EX-043..050) | deferred | umbrella; covered by discrete mechanics drills — avoid duplication |
| 43/44/48/49/50 | Ankling/skipping/toe-off/mid-stance/rotational drills | exist (RF-EX-043/044/048/049/050) | deferred | later running-prep normalization pass |
| 10,12,13,14,17,18,19,20 | Long-lever hip-flexor iso, Thomas, manual/flywheel eccentric hip flexor, reverse Nordic(+tantrum), sissy, Spanish | various/none | **Batch 3 (high-caution)** | defer — clinician-gated |
| 46–54,57 | Acceleration, uphill sprint, cable/progressive kicking, landings, squat jump, hop progression, switch-jump lunge, BFR | various | **Batch 3 (high-caution)** | defer |
| 55,56 | Med-ball lunge throw, mountain climbers slider | none/RF-EX-021 | deferred | hold_for_review |
| 58–62 | Open-skill, tactical ball drills, SMR, generic hamstring mobility, aggressive end-range RF stretch | — | excluded | documentation-only |

## 5. Batch 2 selected candidate list (17)
Leg extension, standing hip flexion, walking lunge, reverse lunge, high-knee drill, butt-kick drill, hip
thrust, monster walk, front plank, Pallof press (upgrades); static split squat, Bulgarian split squat,
forward/clock lunge, step-down, reverse sled drag, prowler march, eccentric SLR lowering (new).

## 6. Existing-object mapping table
Upgrades → RF-EX-004, 006, 014, 015, 033, 036, 040, 042, 046, 047. New → RF-EX-093 (static split squat),
094 (Bulgarian split squat), 095 (forward/clock lunge), 096 (step-down), 097 (reverse sled drag),
098 (prowler march), 099 (eccentric SLR lowering).

## 7. Objects upgraded (10)
RF-EX-004, RF-EX-006, RF-EX-014, RF-EX-015, RF-EX-033, RF-EX-036, RF-EX-040, RF-EX-042, RF-EX-046,
RF-EX-047 — base fields preserved; 13 v2 + 22 v2.1 fields added.

## 8. Objects newly created (7)
RF-EX-093 static_split_squat · 094 bulgarian_split_squat · 095 forward_clock_lunge · 096 step_down ·
097 reverse_sled_drag · 098 prowler_march · 099 eccentric_slr_lowering — full base + v2 + v2.1.

## 9. Objects deferred and why
- **Batch 3 (high-caution, clinician-gated):** long-lever hip-flexor iso (#10), Thomas-position hip flexion
  (#12), manual/flywheel eccentric hip flexor (#13/14), reverse Nordic + tantrum (#17/18), sissy squat
  (#19), Spanish squat (#20), acceleration (#46), uphill sprint (#47), cable/progressive kicking (#48/49),
  landings (#50/51), squat jump (#52), hop progression (#53), switch-jump lunge (#54), BFR (#57).
- **Running-prep mechanics drills already authored** (RF-EX-043 ankling, 044 skipping, 048 toe-off,
  049 mid-stance, 050 rotational-control): deferred to a later running-prep normalization pass (kept to
  avoid scope creep; not high-caution).
- **Running drill progression (#43):** umbrella concept already covered by the discrete mechanics drills —
  not authored separately to avoid duplication.
- **Hold (#55/56)** and **excluded (#58–62):** remain documentation-only.

## 10. Duplicate-prevention decisions
Exact/probable matches upgraded in place; no concept re-created. New objects created only where no match
existed (split squats, forward lunge, step-down, sled drag, prowler march, eccentric SLR). Restricted-
context objects (RF-EX-022/023/024) untouched. "Running drill progression" deliberately not created (would
duplicate existing mechanics drills). One exercise exists once.

## 11. v2 governance metadata summary
All 17 carry the 13 v2 fields from decision-table values: `final_decision` (second_batch_manual_review for
strength/running-prep; supportive_proximal_control for hip thrust/monster walk/front plank/Pallof);
`evidence_grade` B/C (no Grade A invented); honest `source_authority`/`source_support_type`;
`central_tendon_fibrosis_risk` moderate for manual-review items, low for supportive; `manual_review_required:
true` for all second_batch items; `library_classification` (manual_review_strength_running_prep /
running_field_exposure / supportive_proximal_control); real `source_ids` (SG/CR/CGDR, none invented);
`source_verification_status` mostly partially_verified; 7 exact guardrails.

## 12. v2.1 user-facing metadata summary
All 17 carry the 22 v2.1 fields: plain-language copy, step-array instructions, `plan_card_category`
(strength / control / running_preparation), `difficulty_label` (controlled, with progressive for Bulgarian
split squat and forward lunge; foundational for the low-risk supportive items), `advanced_label: none`,
display-only easier/harder/related labels, inert media block, `user_facing_status: draft_copy`, standard
logging flags.

## 13. User-facing copy rules
Short, practical, step-by-step, non-clinical; one-line purpose; no forbidden tokens (sets/reps/frequency/
intensity/duration/rest/threshold/score/percent/%, ready-for/cleared-for/clearance/RTS/RTT/return-to-sport-
or-training/progression-gate, internal governance tokens). Verified by the validator leakage guard (all 17
pass).

## 14. Media placeholder handling
Every object carries the full inert `media` block (`media_status: none`, all asset/url null). No fetching,
binary, Supabase, or UI.

## 15. Logging flags
Consistent defaults on all 17: completion/pain-response/difficulty/notes/next-day-response = true;
confidence = false. Capability flags only.

## 16. Dosage/authority guardrails
Inert `dosage` block unchanged; no active dosage, sets/reps/frequency/rest/intensity/duration, return
dates, progression increments, readiness, RTT/RTS, clearance, pass/fail, thresholds, scores, or
percentages. No plan/selection/assessment/runtime/RTS logic. easier/harder labels are display-only.

## 17. Commands run
All nine governance checks + evidence-linking regression — all PASS; exercise-knowledge reports 99 objects.

## 18. Scope verification
Only the 10 upgraded + 7 new RF-EX objects, the status count/notes, and this doc changed. No RF-EX object
outside the Batch-2 mapping modified; no schema/template/validator/runtime/package.json changes.

## 19. Warnings
- Eccentric SLR lowering (RF-EX-099), leg extension, lunges, split squats, hip flexion are manual-review
  (`manual_review_required: true`, CT risk moderate) — draft-only pending clinician gating before any use.
- `source_verification_status` honestly partially_verified for most (2026 Aspetar pathway not fully verified).
- Objects are draft / not clinically approved; copy is `draft_copy` pending review.
- Restricted-context RF-EX-022/023/024 still overlap "quad/knee" concepts at a generic level (deferred for
  a future relabel/deprecate review).

## 20. Recommended next task
**Batch 3 planning + clinician-gated high-caution authoring** (long-length eccentrics, sprint/kicking,
plyometric/reactive) — author as draft metadata only after clinician sign-off, with `final_decision:
high_caution_do_not_convert_yet`, `manual_review_required: true`, and risk tier high/moderate enforced —
plus a later running-prep normalization pass for RF-EX-043/044/048/049/050. Excluded items stay docs-only.
