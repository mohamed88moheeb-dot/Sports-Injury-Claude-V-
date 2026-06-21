# RF Exercise Knowledge — Full Library Architecture & Existing-Object Mapping

**Status:** architecture / mapping only · NON-EXECUTABLE · not clinically approved · no runtime integration. **No objects authored; no schema/validator/package.json changes.**

## 1. Purpose
Design the full RF Exercise Knowledge Library architecture and map all 62 entries of the frozen master
decision table against the existing 87 RF-EX objects, so future authoring adds governed metadata without
duplicating or corrupting existing objects.

## 2. Scope
Documentation only. Two files changed:
`docs/implementation/MASTER_RF_EXERCISE_LIBRARY_DECISION_TABLE.md` and this file. No RF-EX objects, schema,
template, status, validator, package.json, runtime, UI, Supabase, RecoveryContext, injuryEngine, RF
clinical rules, or other knowledge systems were modified.

## 3. Decision table source
Frozen source of truth: `docs/implementation/MASTER_RF_EXERCISE_LIBRARY_DECISION_TABLE.md` (62 rows;
classifications: first_batch_safe_metadata, second_batch_manual_review, high_caution_do_not_convert_yet,
hold_for_review, exclude, supportive_proximal_control, conditioning_recovery_support). Clinical lens:
RF/quad strain · BAMIC 1b · central/intramuscular tendon · reported fibrosis · elevated re-injury concern.
Net: zero Grade A entries survive; the eccentric/long-length/plyometric/sprint/kicking cluster is uniformly
high-caution. Classifications were **not altered**; one cross-repo inconsistency is logged in §"Issues Found".

## 4. Existing Exercise Knowledge system summary
- Location: `lib/clinical/exerciseKnowledge/` (schema/, templates/, status/, rf/objects/).
- Status: `batch_4_authored`; 87 objects authored; 0 approved; non-executable; runtime none; `permitted_use: exercise_metadata_only`.
- Validator: `scripts/validate-exercise-knowledge.mjs` (object-level; contraband + dosage-inertness scans).

## 5. Current RF-EX object count and highest ID
- **Existing RF-EX object count: 87.**
- **Highest RF-EX ID: RF-EX-087.**
- Next available ID for new authoring: **RF-EX-088**.

## 6. Existing schema summary
`schema/exerciseObject.schema.json`, `additionalProperties: false`, 41 required fields incl.
`exercise_id, module, name, aliases, exercise_status, approval_status, executable, permitted_use,
body_region, target_tissues, exercise_family, primary_function, movement_category, joint_actions,
contraction_bias, position_tags, tissue_demand_tags, speed_power_demand, stretch_demand, impact_demand,
field_demand_tags, equipment, setup_summary, coaching_cues, common_errors, contraindications,
safety_blockers, prerequisites, allowed_when, blocked_when, monitoring_triggers, progression_options,
regression_options, substitution_options, dosage_status, dosage, source_refs, evidence_claim_ids,
architecture_refs, linked_rule_ids, notes`. `approval_status` ∈ {pending,rejected,superseded} (no approved);
`permitted_use` = exercise_metadata_only; `dosage` block is inert (neutral keys, all null).

## 7. Existing validator summary
Enforces: `clinical_approval_status: not_approved`, `executable: false` (status); per-object required keys,
`approval_status` ≠ approved, `module: rectus_femoris`, `permitted_use: exercise_metadata_only`,
`exercise_id` pattern; inert `dosage` (no active values, `active_prescription_present:false`); deep
prohibited-key scan for **active dosage** (sets/reps/frequency/rest/intensity/duration/fixed_dose),
**progression increment as prescription**, **fixed RTS date**, **numeric confidence**, **RTT/RTS clearance
authority**, **diagnosis/rehab-plan authority**; and quarantined-module reference rejection.

## 8. Full 62-entry mapping table

| # | exercise_name | canonical_name | final_decision | grade | CT_risk | MRR | match | existing_rf_ex_id | existing_rf_ex_name | recommended_action | reason / notes_for_future_authoring |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Quadriceps set | `quadriceps_set` | first_batch_safe | B | low | false | partial | RF-EX-022 | Generic quadriceps isometric exercise | create_new_later | Existing object is a restricted-context generic quad isometric; a clean first-batch quad-set object is preferable. |
| 2 | Straight-leg raise (iso/conc) | `straight_leg_raise` | first_batch_safe | B | low | false | probable | RF-EX-012 | Straight leg raise active mobility/loading | update_existing_later | Name matches; existing framed as active mobility/loading — align to iso/concentric SLR + governance fields. |
| 3 | Eccentric SLR lowering | `eccentric_slr_lowering` | second_batch_manual_review | C | moderate | true | none | — | — | create_new_later | No eccentric-SLR object exists; manual-review. |
| 4 | Heel slides / active knee ROM | `heel_slides_active_knee_rom` | first_batch_safe | C | low | false | partial | RF-EX-024 | Active knee flexion ROM | create_new_later | Existing knee-ROM objects are restricted-context; author a clean early heel-slide/ROM object. |
| 5 | Prone quadriceps dynamic mobility | `prone_quad_dynamic_mobility` | first_batch_safe | B | low | false | exact | RF-EX-020 | Prone quadriceps dynamic mobility | update_existing_later | Exact name; add governance/source fields later (schema v2). |
| 6 | Half-kneeling pelvic tilt (RF bias) | `half_kneeling_pelvic_tilt` | first_batch_safe | B | low | false | exact | RF-EX-025 | Half-kneeling pelvic tilt | update_existing_later | Exact name; add governance/source fields later. |
| 7 | Sub-end-range RF/quad mobility | `subrange_rf_quad_mobility` | first_batch_safe | C | low | false | partial | RF-EX-020 | Prone quadriceps dynamic mobility | create_new_later | No explicit sub-end-range mobility object; end-range excluded. |
| 8 | Ballistic leg swings | `ballistic_leg_swings` | high_caution | D | high | true | probable | RF-EX-029 | Ballistic swings | update_existing_later | Existing is dynamic_mobility_support; reclassify to high-caution per table. |
| 9 | Isometric hip flexion at 90° | `isometric_hip_flexion_90` | second_batch_manual_review | B | moderate | true | exact | RF-EX-005 | Isometric supine hip flexion at 90 degrees | update_existing_later | Exact; manual-review + central-tendon proximity flags later. |
| 10 | Long-lever hip-flexor iso in extension | `longlever_hip_flexor_iso_extension` | high_caution | C | high | true | partial | RF-EX-011 | Knee-extended hip flexion | create_new_later | Existing knee-extended hip flexion is related but not the extended long-lever iso; high-caution. |
| 11 | Standing / cable hip flexion | `standing_cable_hip_flexion` | second_batch_manual_review | B | moderate | true | probable | RF-EX-006 | Standing hip flexion at 90 degrees | update_existing_later | Standing hip flexion matches; cable variant noted; manual-review. |
| 12 | Resisted hip flexion in Thomas position | `resisted_hip_flexion_thomas` | high_caution | C | high | true | exact | RF-EX-009 | Resisted hip flexion in Thomas-test position | update_existing_later | Exact; reclassify to high-caution long-length. |
| 13 | Manual eccentric hip flexor | `manual_eccentric_hip_flexor` | high_caution | C | high | true | none | — | — | create_new_later | No object; clinician-gated high-caution. |
| 14 | Flywheel eccentric hip flexion | `flywheel_eccentric_hip_flexion` | high_caution | C | high | true | none | — | — | create_new_later | No object; device + high-caution. |
| 15 | Terminal / short-arc knee extension | `terminal_knee_extension` | first_batch_safe | B | low | false | partial | RF-EX-001 | Reclined knee extension ISO | create_new_later | Existing knee-ext objects are ISO/biased; author an inner-range short-arc object. |
| 16 | Leg extension machine | `leg_extension_machine` | second_batch_manual_review | B | moderate | true | exact | RF-EX-004 | Leg extension | update_existing_later | Exact; gate range; manual-review. |
| 17 | Reverse Nordic | `reverse_nordic` | high_caution | C | high | true | exact | RF-EX-013 | Reverse Nordic | update_existing_later | Exact; reclassify to high-caution long-length eccentric. |
| 18 | Reverse Nordic tantrum variant | `reverse_nordic_tantrum` | high_caution | D | high | true | none | — | — | keep_doc_only | Single non-peer-reviewed source; treat as variant, doc-only for now. |
| 19 | Sissy squat | `sissy_squat` | high_caution | C | high | true | none | — | — | create_new_later | No object; high-caution end-range eccentric. |
| 20 | Spanish squat | `spanish_squat` | high_caution | C | moderate | true | none | — | — | create_new_later | No object; patellar-tendon evidence extrapolated; high-caution. |
| 21 | Static split squat | `static_split_squat` | second_batch_manual_review | B | moderate | true | none | — | — | create_new_later | No split-squat object; manual-review. |
| 22 | Bulgarian split squat | `bulgarian_split_squat` | second_batch_manual_review | B | moderate | true | none | — | — | create_new_later | No object; manual-review. |
| 23 | Reverse lunge | `reverse_lunge` | second_batch_manual_review | B | moderate | true | probable | RF-EX-015 | Posterior lunge | update_existing_later | Posterior lunge == reverse lunge; manual-review. |
| 24 | Walking lunge | `walking_lunge` | second_batch_manual_review | B | moderate | true | exact | RF-EX-014 | Walking lunge | update_existing_later | Exact; manual-review (gate volume framing). |
| 25 | Forward / clock lunge | `forward_clock_lunge` | second_batch_manual_review | B | moderate | true | none | — | — | create_new_later | No forward/clock lunge object; higher decel demand. |
| 26 | Step-up | `step_up` | first_batch_safe | B | low | false | exact | RF-EX-016 | Step-up | update_existing_later | Exact; concentric-dominant first-batch. |
| 27 | Step-down | `step_down` | second_batch_manual_review | B | moderate | true | none | — | — | create_new_later | No step-down object; eccentric control; manual-review. |
| 28 | Single-leg deadlift | `single_leg_deadlift` | supportive_proximal_control | C | low | false | none | — | — | create_new_later | No SLDL object; supportive label. |
| 29 | Glute bridge | `glute_bridge` | supportive_proximal_control | C | low | false | probable | RF-EX-032 | Bilateral glute bridge | update_existing_later | Bilateral glute bridge matches; supportive label. |
| 30 | Hip thrust | `hip_thrust` | supportive_proximal_control | C | low | false | probable | RF-EX-033 | Bilateral hip thrust | update_existing_later | Bilateral hip thrust matches; supportive label. |
| 31 | Side-lying hip abduction | `side_lying_hip_abduction` | supportive_proximal_control | C | low | false | exact | RF-EX-030 | Side-lying hip abduction with band | update_existing_later | Exact; supportive label. |
| 32 | Clamshell | `clamshell` | supportive_proximal_control | C | low | false | exact | RF-EX-031 | Clamshells with band | update_existing_later | Exact; supportive label. |
| 33 | Lateral band walk | `lateral_band_walk` | supportive_proximal_control | C | low | false | exact | RF-EX-034 | Lateral walk with band | update_existing_later | Exact; supportive label. |
| 34 | Monster walk | `monster_walk` | supportive_proximal_control | C | low | false | exact | RF-EX-036 | Monster walk | update_existing_later | Exact; supportive label. |
| 35 | Side plank | `side_plank` | supportive_proximal_control | C | low | false | exact | RF-EX-039 | Side plank | update_existing_later | Exact; supportive label. |
| 36 | Front plank | `front_plank` | supportive_proximal_control | C | low | false | exact | RF-EX-040 | Front plank | update_existing_later | Exact; supportive label. |
| 37 | Dead bug | `dead_bug` | supportive_proximal_control | C | low | false | exact | RF-EX-041 | Dead bug | update_existing_later | Exact; keep short-lever framing. |
| 38 | Pallof press | `pallof_press` | supportive_proximal_control | C | low | false | exact | RF-EX-042 | Pallof press | update_existing_later | Exact; supportive label. |
| 39 | Low-load cycling | `low_load_cycling` | conditioning_recovery_support | C | low | false | probable | RF-EX-080 | Static cycling / stationary bike conditioning | update_existing_later | Stationary cycling matches; conditioning label. |
| 40 | Swimming / aquatic conditioning | `swimming_aquatic_conditioning` | conditioning_recovery_support | C | low | false | probable | RF-EX-081 | Pool training / swimming conditioning | update_existing_later | Pool/swimming matches; conditioning label. |
| 41 | Reverse sled drag | `reverse_sled_drag` | second_batch_manual_review | B | moderate | true | none | — | — | create_new_later | No sled object; locomotor support; manual-review. |
| 42 | Prowler march | `prowler_march` | second_batch_manual_review | B | moderate | true | none | — | — | create_new_later | No prowler object; manual-review. |
| 43 | Running drill progression | `running_drill_progression` | second_batch_manual_review | B | moderate | true | partial | RF-EX-043 | Ankling drill (+ skipping RF-EX-044) | create_new_later | Mechanics drills exist (043-050) but no generic running-drill-progression object; manual-review. |
| 44 | High-knee drill | `high_knee_drill` | second_batch_manual_review | B | moderate | true | exact | RF-EX-046 | High-knees running drill | update_existing_later | Exact; manual-review (gate intensity). |
| 45 | Butt-kick drill | `butt_kick_drill` | second_batch_manual_review | B | moderate | true | exact | RF-EX-047 | Butt-kickers drill | update_existing_later | Exact; manual-review. |
| 46 | Acceleration drill | `acceleration_drill` | high_caution | C | high | true | probable | RF-EX-051 | Acceleration mechanics drill | update_existing_later | Mechanics drill matches; reclassify high-caution (special-safety list). |
| 47 | Uphill sprint exposure | `uphill_sprint_exposure` | high_caution | C | high | true | partial | RF-EX-076 | Sprinting exposure | create_new_later | Generic sprinting exposure exists; uphill-specific not captured; high-caution. |
| 48 | Cable kicking simulation | `cable_kicking_simulation` | high_caution | D | high | true | partial | RF-EX-068 | Resisted kicking exposure | create_new_later | Resisted/cable kicking related; high-caution velocity central-tendon load. |
| 49 | Progressive kicking exposure | `progressive_kicking_exposure` | high_caution | C | high | true | partial | RF-EX-070 | Game-based kicking scenario exposure | create_new_later | Kicking exposures exist (065-070); no governed progressive-kicking object; high-caution. |
| 50 | Bilateral landing | `bilateral_landing` | high_caution | C | high | true | probable | RF-EX-057 | Step bilateral landing | update_existing_later | Bilateral landing matches; reclassify high-caution. |
| 51 | Single-leg landing | `single_leg_landing` | high_caution | C | high | true | probable | RF-EX-058 | Step unilateral landing | update_existing_later | Unilateral landing matches; reclassify high-caution. |
| 52 | Squat jump | `squat_jump` | high_caution | C | high | true | exact | RF-EX-059 | Bilateral squat jump | update_existing_later | Exact; reclassify high-caution. |
| 53 | Plyometric hop progression | `plyometric_hop_progression` | high_caution | C | high | true | partial | RF-EX-064 | Low-intensity hopping (+ plyometric jump RF-EX-060) | create_new_later | Hopping/jump objects exist; no governed hop-progression object; high-caution. |
| 54 | Switch jump lunge | `switch_jump_lunge` | high_caution | C | high | true | none | — | — | create_new_later | No object; ballistic; high-caution. |
| 55 | Med-ball lunge throw combos | `medball_lunge_throw_combos` | hold_for_review | D | high | true | none | — | — | keep_doc_only | Combination task named once; treat as local variant, doc-only. |
| 56 | Mountain climbers with slider | `mountain_climbers_slider` | hold_for_review | D | moderate | true | exact | RF-EX-021 | Mountain climbers with slider | update_existing_later | Exact existing object; decision is HOLD — reconcile classification/guardrails later (see Issues). |
| 57 | BFR quadriceps work | `bfr_quadriceps_work` | high_caution | C | moderate | true | none | — | — | create_new_later | No object; ACLR evidence; clinician cuff; high-caution. |
| 58 | Open-skill uncertainty drills | `open_skill_uncertainty_drills` | exclude | D | high | n/a | excluded | — | — | exclude_from_objects | Too broad/sport-specific; documentation-only. |
| 59 | Tactical repeated-effort ball drills | `tactical_repeated_effort_ball_drills` | exclude | D | high | n/a | excluded | RF-EX-071 | Game-based training exposure (related) | keep_doc_only | Table excludes as base object; existing 071 is a separate restricted game-based-training object — do not expand. |
| 60 | Self-myofascial release | `self_myofascial_release` | exclude | D | low | n/a | excluded | — | — | exclude_from_objects | Recovery modality, not an exercise object. |
| 61 | Generic hamstring mobility drills | `generic_hamstring_mobility` | exclude | D | low | n/a | excluded | RF-EX-027 | Supine hamstring dynamic mobility (+ RF-EX-028 fitball) | keep_doc_only | Table excludes as not RF-specific, but RF-EX-027/028 already exist — flagged in Issues for review. |
| 62 | Aggressive end-range RF stretching | `aggressive_endrange_rf_stretch` | exclude | D | high | n/a | excluded | — | — | exclude_from_objects | Injury-mechanism end range; excluded as automated content. |

**Match totals:** exact 20 · probable 11 · partial 10 · none 16 · excluded 5 (= 62).
**Action totals:** update_existing_later 31 · create_new_later 24 · keep_doc_only 4 · exclude_from_objects 3.

## 9. Proposed taxonomy (non-excluded entries)
- **RF Core Loading** — quad set(#1), SLR(#2), eccentric SLR(#3), iso hip flexion 90°(#9), long-lever hip-flexor iso(#10), standing/cable hip flexion(#11), Thomas resisted(#12), manual/flywheel eccentric hip flexor(#13,#14), terminal knee ext(#15), leg extension(#16). Risk: low→high. Authoring: now (low) / later+gated (rest).
- **RF Mobility & Movement Restoration** — heel slides(#4), prone quad mobility(#5), half-kneeling pelvic tilt(#6), sub-range mobility(#7), ballistic leg swings(#8 high-caution). Authoring: now (#4-7) / later (#8).
- **RF Supportive / Proximal Control** — #28-38 (SLDL, glute bridge, hip thrust, abduction, clamshell, lateral/monster walk, planks, dead bug, Pallof). Risk: low. Authoring: now (labeled supportive, never core RF).
- **RF Conditioning & Recovery** — low-load cycling(#39), swimming/aquatic(#40). Risk: low. Authoring: now.
- **RF Strength — Manual-Review** — split/Bulgarian/reverse/walking/forward lunge(#21-25), step-down(#27), sled drag/prowler(#41,#42). Risk: moderate. Authoring: later (clinician-gated).
- **RF Running & Field Exposure** — step-up(#26 first-safe), running drills(#43-45), running exposures (existing 054/055/073-075). Risk: low→moderate. Authoring: now(#26)/later(drills).
- **RF Reactive / Plyometric Exposure** — landings(#50,#51), squat jump(#52), hop progression(#53), switch-jump lunge(#54). Risk: high. Authoring: later, clinician-gated.
- **RF High-Caution Sport-Specific Exposure** — long-length eccentrics (#10,#12,#13,#14,#17-20), accel/sprint(#46,#47), kicking(#48,#49), BFR(#57). Risk: high. Authoring: later, clinician-gated.
- **Hold / Review Only** — med-ball lunge throw(#55), mountain climbers slider(#56). Doc-only / reconcile.
- **Excluded / Not Authored** — open-skill(#58), tactical ball drills(#59), SMR(#60), generic hamstring mobility(#61), aggressive end-range RF stretch(#62). Documentation-only.

## 10. Proposed authoring batches
- **Batch 1 — first-safe + supportive + conditioning (~21 objects):** core #1,#2,#4,#5,#6,#7,#15,#26; supportive #28-#38; conditioning #39,#40. Of these, **5 likely new** (#1 clean quad set, #4 heel slides, #7 sub-range, #15 terminal knee ext, #28 SLDL) and **16 update-existing-later** (reuse RF-EX-012/020/025/016/030/031/032/033/034/036/039/040/041/042/080/081). Schema support needed: governance fields (see §11). Validator risk: low. Audit risk: low — confirm no duplication of existing objects.
- **Batch 2 — manual-review strength & running-prep:** #3,#9,#11,#16,#21-#25,#27,#41-#45. New: split squats, forward lunge, step-down, sled, prowler, eccentric SLR (~10); update-existing: leg extension(004), iso hip flexion 90°(005), standing hip flexion(006), reverse/walking lunge(015/014), high-knee(046), butt-kick(047). Schema: + manual_review_required. Validator risk: must keep range/intensity framing out. Audit: gate long-length/eccentric.
- **Batch 3 — high-caution clinician-gated:** #8,#10,#12,#13,#14,#17-#20,#46-#54,#57. Author only as draft placeholders after clinician sign-off; update existing 009/013/051/057/058/059. Validator/audit risk: high — must remain clearly high-caution, no clearance/readiness framing.
- **Batch 4 — hold/review:** #55 (doc-only), #56 (reconcile existing RF-EX-021). No new objects without clinician intent.
- **Excluded — documentation only:** #58,#59,#60,#61,#62 (not authored).

## 11. Schema gap analysis (no changes made)
- **Already supported:** `exercise_family` (present). General descriptive fields (target_tissues, position_tags, contraction_bias, notes) can carry much context.
- **Missing (not in schema):** `canonical_name, final_decision, evidence_grade, source_authority, source_support_type, RF_specificity, central_tendon_fibrosis_risk, manual_review_required, library_classification, injury_site_relevance, guardrail_notes, source_ids, source_verification_status` (13 fields).
- **Require schema v2:** all 13 missing fields — because `additionalProperties: false` rejects any unknown key, so they cannot be added without a schema revision.
- **May conflict with validator restrictions:** none of the governance fields are prohibited; but free-text values must avoid validator-flagged patterns. The existing `evidence_claim_ids` (`QRF-###`) differs from the table's `source_ids` (SG/CR/CGDR) — reconcile or add `source_ids` separately.
- **Fields that could accidentally imply prescription/progression/readiness/clearance:** none of the proposed fields do, **provided** `final_decision`/`library_classification` values stay classification-only and `guardrail_notes` remains the negated block; avoid any "ready"/"clear"/dosage wording in values.
- **Recommended minimal schema update later (v2):** add the 13 fields as optional/required metadata (keep `additionalProperties:false`), keep them inert (strings/arrays/enums, no numeric thresholds), and add a required `guardrail_notes` array. Keep this inside Exercise Knowledge (no separate clinical-rule-binding schema needed yet).

## 12. Validator gap analysis (no changes made)
| Capability | Current validator |
|---|---|
| draft/pending/not approved | ✅ status + per-object approval ≠ approved |
| executable false | ✅ |
| runtime_integration none | ✅ (status-level) |
| guardrail_notes present | ❌ field not in schema; not enforced |
| no dosage fields | ✅ (key scan + inert dosage block) |
| no progression fields | ✅ (progression_increment / fixed_* scan) |
| no readiness fields | ⚠️ partial — only via clearance/RTT-RTS key patterns |
| no RTT/RTS/clearance fields | ✅ (clearance-authority key scan) |
| no test/pass-fail threshold fields | ❌ no explicit pass_fail/threshold key check |
| manual_review_required present | ❌ field not in schema; not enforced |
| risk tier present (central_tendon_fibrosis_risk) | ❌ not enforced |
| source metadata present | ⚠️ `source_refs`/`evidence_claim_ids` exist but `source_authority`/`source_verification_status` not enforced |
| high-caution objects clearly marked | ❌ no high-caution flag enforced |
| excluded objects not authored | ⚠️ implicit (object simply absent); no positive guard |
**Recommended later:** when schema v2 lands, extend the validator to require `guardrail_notes`, `manual_review_required`, `central_tendon_fibrosis_risk`/risk-tier, and `library_classification`; add a `pass_fail`/`threshold` key prohibition; and assert high-caution objects carry the high-caution classification + clinician-review flag.

## 13. Duplicate handling policy
Reuse an existing RF-EX object (update-later for governance fields) when the match is **exact/probable**.
**Never** create a second object for the same movement. Where the existing object is generic, restricted-
context, or vague, mark **partial** and author a clean new object later rather than overloading the
existing one. Name matches alone do **not** imply clinical sufficiency — every reused object is re-reviewed
before approval.

## 14. Excluded exercise handling policy
Excluded entries (#58-#62) stay **documentation-only** and are not authored as objects. They may be retained
in this doc as negative/contra-library entries to prevent re-introduction. Note: RF-EX-027/028 (hamstring
mobility) and RF-EX-071 (game-based training) already exist and overlap excluded rows #61/#59 — see Issues.

## 15. High-caution object handling policy
High-caution entries (#8,#10,#12-#14,#17-#20,#46-#54,#57) require clinician authoring/sign-off before any
drafting. When authored they remain `draft/pending/not_approved/executable:false/runtime none`, carry the
full guardrail block, and must be clearly classified high-caution with a clinician-review flag. The entire
high-caution tier defaults to clinician gating for this Grade 1b central-tendon + fibrosis case.

## 16. Recommended next implementation task
**Schema v2 + validator update (governed), then Batch 1 authoring.** Add the 13 governance fields
(`guardrail_notes` required) to the Exercise Knowledge schema with `additionalProperties:false` preserved
and a `pass_fail`/`threshold` prohibition in the validator; then author Batch 1 (§10) — ~5 new objects +
16 update-existing — leaving Batch 2-4 as named placeholders pending clinician sign-off.

## Issues Found
- **Cross-repo inconsistency (not changed):** the decision table excludes "generic hamstring mobility" (#61)
  as not RF-specific, but **RF-EX-027 / RF-EX-028 (hamstring dynamic mobility) already exist** in the
  authored library. Flag for clinician/product review (keep, relabel as supportive, or deprecate). No change made.
- **Hold vs authored:** #56 mountain climbers slider is classified `hold_for_review`, yet **RF-EX-021**
  already exists. Recommend reconciling its classification/guardrails later; not changed here.
- **Source-id scheme mismatch:** decision table uses SG/CR/CGDR source ids; the schema uses `QRF-###`
  `evidence_claim_ids`. A `source_ids` field (schema v2) is needed to carry the table's provenance faithfully.
- The decision table's own §6 source gaps (unverified 2026 Aspetar pathway, no fibrotic-RF-specific loading
  evidence) remain open and bound the confidence of any future authoring.

## 17. Files changed
- `docs/implementation/MASTER_RF_EXERCISE_LIBRARY_DECISION_TABLE.md` (new — frozen table + header).
- `docs/implementation/RF_EXERCISE_KNOWLEDGE_FULL_LIBRARY_ARCHITECTURE_AND_MAPPING.md` (new — this file).

## 18. Scope confirmation
No RF-EX objects authored or edited. No schema/template/status/validator/package.json changes. No runtime,
UI, Supabase, RecoveryContext, injuryEngine, RF clinical rules, assessment/capacity/activity-exposure/
evidence-linking, or legacy files modified. Verified via `git status --short` (only the two docs above).
