<!--
Status: frozen governance decision table
Runtime: none
Executable: false
Clinical approval: not approved
Purpose: source-backed RF/quadriceps exercise metadata classification before full Exercise Knowledge authoring
-->

# Master RF / Quadriceps Exercise Library — Decision Table

**Document type:** Governance decision table (merge + downgrade + govern). Not repo JSON. Not a treatment plan.
**Status of every object below:** `draft` · `pending` · `not clinically approved` · `executable: false` · `runtime_integration: none` · `metadata only`
**Clinical context driving the conservative lens:** RF / quadriceps strain · BAMIC Grade 1b · central / intramuscular tendon involvement · reported fibrosis / scar tissue · elevated re-injury concern.

---

## 0. How this table was built (read first)

Three research outputs were merged:

- **SG** = Scholar GPT output (5 sources: Aspetar/FCB 2015 guide, Kary 2010, González-de-la-Flor 2024 case report, Anwer 2014 OA RCT, Alonso-Fernández 2019 architecture study).
- **CR** = Claude Research output (22 sources; already conservative; explicit central-tendon/fibrosis lens).
- **CGDR** = ChatGPT Deep Research output (14 sources, including three not surfaced by the others: the **2026 Aspetar RF Pathway**, the **McAleer/Pollock Aspetar T&F article** naming manual + flywheel eccentric hip flexor, and the **Valera-Garrido 2020 cohort** naming uphill sprint / sled / prowler / drop split squat / switch-jump lunge).

**The merge applied three governance moves:**

1. **Downgrade overstated grades.** SG assigned Grade **A** to two Aspetar eccentric stretches and to the isometric SLR; CGDR assigned Grade **A** to 90° hip-flexion isometric, long-lever hip-flexor isometric, Thomas-position hip flexion, and eccentric hip-flexor loading. Under the strict model (A = direct RF-strain rehab evidence from high-quality clinical studies **or multiple strong direct sources**), **none of these meet A.** A single clinical guide, a single expert article, a single case report, or a healthy-subject study is **B or C**. All such grades were downgraded and logged in §5.
2. **Re-classify by risk, not by enthusiasm.** Every exercise on your special-safety list (reverse Nordic, sissy/Spanish squat, manual + flywheel eccentric hip flexor, RF bridges, cable kicking, progressive kicking, sprint/accel-decel, uphill sprint, plyometric hops/landings, switch-jump lunge, ballistic swings, BFR, aggressive end-range RF stretch) is forced to `high_caution_do_not_convert_yet` unless there was a strong, specific reason otherwise — and there was not, for this injury profile.
3. **Strip anything that smuggles in a threshold.** No exercise carries dosage, progression rules, readiness, RTT/RTS, clearance, or test framing. Where a source embedded those (e.g., criteria-based phases, sprint %), only the **name and function** were retained.

**Grade legend (strict):** A = direct RF/quad strain rehab evidence from high-quality clinical studies or multiple strong direct sources · B = direct practical inclusion from RF/quad case report, clinical guide, pathway, expert protocol, or cohort program · C = indirect / supportive / proximal-control / prevention / ACLR / tendon / healthy-subject extrapolation · D = insufficient, too ambiguous, too risky, or hold/exclude.

**A note on Grade A:** After applying the strict model, **no exercise in this library holds Grade A.** That is the correct and honest result — there is no high-quality comparative RF-strain rehabilitation trial in existence. The strongest entries are B (convergent direct naming across an Aspetar pathway/article *and* a case report or cohort).

---

## 1. Master Decision Table

Field key: `RF_spec` = RF specificity · `CT_risk` = central-tendon/fibrosis risk · `MRR` = manual_review_required · `1st` = safe_for_first_batch.

| # | exercise_name | canonical_name | exercise_family | final_decision | evidence_grade | source_authority | source_support_type | RF_spec | CT_risk | MRR | 1st | reason (condensed) | primary_sources |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Quadriceps set | quadriceps_set | isometric_activation | first_batch_safe_metadata | B | moderate | direct_exercise_support | moderate | low | false | true | Standard early isometric quad activation; named across case/OA-RCT; lowest tissue demand. | SG-S4, CR-S18 |
| 2 | Straight-leg raise (isometric/concentric) | straight_leg_raise | isometric_activation | first_batch_safe_metadata | B | moderate | direct_exercise_support | high | low | false | true | Most RF-targeted basic loading (hip flexion + knee extension); convergent. **Downgraded from A.** | SG-S2, SG-S4, CR-S1, CR-S11 |
| 3 | Eccentric straight-leg-raise lowering | eccentric_slr_lowering | eccentric_loading | second_batch_manual_review | C | moderate | indirect_principle_support | moderate | moderate | true | false | Eccentric lowering at length; only ACLR-commentary support; mild central-tendon caution. | CR-S11 |
| 4 | Heel slides / active knee ROM | heel_slides_active_knee_rom | mobility_rom | first_batch_safe_metadata | C | moderate | direct_exercise_support | low | low | false | true | Early pain-free ROM; minimal RF tissue load. | CR-S18 |
| 5 | Prone quadriceps dynamic mobility | prone_quad_dynamic_mobility | mobility_rom | first_batch_safe_metadata | B | moderate | direct_exercise_support | moderate | low | false | true | Named in RF case table as early mobility; sub-end-range. | SG-S3, CGDR-S3 |
| 6 | Half-kneeling pelvic tilt (RF bias) | half_kneeling_pelvic_tilt | mobility_motor_control | first_batch_safe_metadata | B | moderate | direct_exercise_support | low-moderate | low | false | true | Named in case table; pelvic-position control, low load. | SG-S3, CGDR-S3 |
| 7 | Sub-end-range RF/quadriceps mobility | subrange_rf_quad_mobility | mobility_rom | first_batch_safe_metadata | C | moderate | indirect_principle_support | moderate | low | false | true | Pain-free active/passive mobility principle; **end-range explicitly excluded** (see #56). | CGDR-S8, CR-S1 |
| 8 | Ballistic leg swings | ballistic_leg_swings | dynamic_mobility_ballistic | high_caution_do_not_convert_yet | D | moderate | direct_exercise_support | low-moderate | high | true | false | Ballistic end-range hip flexion/extension; case-report-only; provocative for central tendon. | SG-S3, CGDR-S3 |
| 9 | Isometric hip flexion at 90° | isometric_hip_flexion_90 | isometric_hip_flexor | second_batch_manual_review | B | high | direct_exercise_support | high | moderate | true | false | Convergent (Aspetar + case); RF hip-flexor force. **Downgraded from A.** Proximal RF = central-tendon-relevant → MRR. | CGDR-S2, CGDR-S3, CR-S1 |
| 10 | Long-lever hip-flexor isometric in extension | longlever_hip_flexor_iso_extension | isometric_hip_flexor_long_length | high_caution_do_not_convert_yet | C | high | direct_exercise_support | high | high | true | false | Long-length loading directly over the implicated central/proximal tendon; single expert-article source. | CGDR-S2 |
| 11 | Standing / cable hip flexion | standing_cable_hip_flexion | isotonic_hip_flexor | second_batch_manual_review | B | moderate | direct_exercise_support | moderate | moderate | true | false | Named in case table; isotonic RF/iliopsoas; long-lever variants need gating. | SG-S3, CR-S1 |
| 12 | Resisted hip flexion in Thomas position | resisted_hip_flexion_thomas | isotonic_hip_flexor_long_length | high_caution_do_not_convert_yet | C | moderate | direct_exercise_support | high | high | true | false | Long-length hip-extended RF bias; case-report-only. **Downgraded from A.** Central-tendon length risk. | CGDR-S3, SG-S3 |
| 13 | Manual eccentric hip flexor | manual_eccentric_hip_flexor | eccentric_hip_flexor | high_caution_do_not_convert_yet | C | high | direct_exercise_support | high | high | true | false | On special-safety list; eccentric long-length load on central tendon; clinician-delivered, non-standardizable. | CGDR-S2 |
| 14 | Flywheel eccentric hip flexion | flywheel_eccentric_hip_flexion | eccentric_hip_flexor_device | high_caution_do_not_convert_yet | C | high | direct_exercise_support | high | high | true | false | On special-safety list; high-load eccentric, equipment + technique dependent; central-tendon risk. | CGDR-S2 |
| 15 | Terminal / short-arc knee extension | terminal_knee_extension | isotonic_knee_extensor | first_batch_safe_metadata | B | moderate | direct_exercise_support | moderate | low | false | true | Inner-range knee-extensor loading; low length-related risk; vasti-biased. | CR-S18, CR-S11 |
| 16 | Leg extension machine | leg_extension_machine | isotonic_knee_extensor | second_batch_manual_review | B | moderate | direct_exercise_support | moderate | moderate | true | false | Named in case table; open-chain knee extension; full-range/long-length end can load RF — gate the range. | SG-S3, CGDR-S3 |
| 17 | Reverse Nordic | reverse_nordic | long_length_eccentric_quad | high_caution_do_not_convert_yet | C | moderate | indirect_principle_support | high (mechanism) / low (injury evidence) | high | true | false | On special-safety list; evidence is healthy-subject architecture + EMG non-superiority; end-range eccentric over central tendon. | SG-S5, CR-S15, CR-S16, CGDR-S12, CGDR-S13 |
| 18 | Reverse Nordic "tantrum" variant | reverse_nordic_tantrum | long_length_eccentric_quad | high_caution_do_not_convert_yet | D | low | contextual_support | moderate | high | true | false | Single non-peer-reviewed masterclass source; same end-range risk class. | CR-S19 |
| 19 | Sissy squat | sissy_squat | long_length_eccentric_quad | high_caution_do_not_convert_yet | C | low-moderate | indirect_principle_support | moderate | high | true | false | On special-safety list; end-range eccentric + high PFJ compression; no RF-strain evidence. | CR-S19 |
| 20 | Spanish squat | spanish_squat | isometric_quad_constant_tension | high_caution_do_not_convert_yet | C | moderate | contextual_support | low-moderate | moderate | true | false | On special-safety list; evidence is **patellar-tendon**, extrapolated to RF; constant-tension load. | CR-S17 |
| 21 | Static split squat | static_split_squat | unilateral_knee_dominant | second_batch_manual_review | B | high | direct_exercise_support | moderate | moderate | true | false | Split-squat family named in Aspetar figure + cohort; rear-leg hip-extended position lengthens RF — gate. | CGDR-S2, CGDR-S4 |
| 22 | Bulgarian split squat | bulgarian_split_squat | unilateral_knee_dominant | second_batch_manual_review | B | high | direct_exercise_support | moderate | moderate | true | false | Named in cohort + masterclass; hip-extended RF load; non-plyometric variant gated, hop variant → #51. | CGDR-S4, CR-S19 |
| 23 | Reverse lunge | reverse_lunge | unilateral_knee_dominant | second_batch_manual_review | B | high | direct_exercise_support | moderate | moderate | true | false | Lower deceleration demand; named across cohort + case sources. | CGDR-S4, CR-S19, SG-S3 |
| 24 | Walking lunge | walking_lunge | unilateral_knee_dominant | second_batch_manual_review | B | moderate | direct_exercise_support | moderate | moderate | true | false | Named in case + cohort; sagittal loading; gate volume/range framing out. | SG-S3, CGDR-S4 |
| 25 | Forward / clock lunge | forward_clock_lunge | unilateral_knee_dominant_decel | second_batch_manual_review | B | moderate | direct_exercise_support | moderate | moderate | true | false | Higher deceleration eccentric demand than reverse lunge; sequence cautiously. | CR-S19, CGDR-S4 |
| 26 | Step-up | step_up | unilateral_knee_dominant | first_batch_safe_metadata | B | moderate | direct_exercise_support | moderate | low | false | true | Concrete, repeatedly reported (case + cohort); concentric-dominant; low length risk. | SG-S3, CGDR-S3, CGDR-S4 |
| 27 | Step-down | step_down | unilateral_knee_dominant_eccentric | second_batch_manual_review | B | moderate | direct_exercise_support | moderate | moderate | true | false | Eccentric single-leg control; named in cohort; gate eccentric demand. | CGDR-S4 |
| 28 | Single-leg deadlift | single_leg_deadlift | supportive_posterior_chain | supportive_proximal_control | C | moderate | direct_exercise_support | indirect | low | false | true | Posterior-chain / balance; **not RF-specific**; supportive label only. | CGDR-S4 |
| 29 | Glute bridge | glute_bridge | supportive_posterior_chain | supportive_proximal_control | C | moderate | direct_exercise_support | indirect | low | false | true | Hip-extension/posterior chain; supportive only — **never core RF**. | SG-S3, CGDR-S3 |
| 30 | Hip thrust | hip_thrust | supportive_posterior_chain | supportive_proximal_control | C | moderate | direct_exercise_support | indirect | low | false | true | Posterior-chain force; supportive only. | SG-S3, CGDR-S4 |
| 31 | Side-lying hip abduction | side_lying_hip_abduction | supportive_lateral_hip | supportive_proximal_control | C | moderate | direct_exercise_support | indirect | low | false | true | Lateral hip control; supportive only. | SG-S3, CGDR-S3 |
| 32 | Clamshell | clamshell | supportive_lateral_hip | supportive_proximal_control | C | moderate | direct_exercise_support | indirect | low | false | true | Lateral hip control; supportive only — **never core RF**. | SG-S3, CGDR-S3 |
| 33 | Lateral band walk | lateral_band_walk | supportive_lateral_hip | supportive_proximal_control | C | moderate | direct_exercise_support | indirect | low | false | true | Frontal-plane hip control; supportive only. | SG-S3, CGDR-S3 |
| 34 | Monster walk | monster_walk | supportive_lateral_hip | supportive_proximal_control | C | moderate | direct_exercise_support | indirect | low | false | true | Frontal-plane hip control; supportive only. | SG-S3, CGDR-S3 |
| 35 | Side plank | side_plank | supportive_lumbopelvic | supportive_proximal_control | C | moderate | direct_exercise_support | low | low | false | true | Lateral trunk control; supportive only — **never core RF**. | SG-S3, CGDR-S3 |
| 36 | Front plank | front_plank | supportive_lumbopelvic | supportive_proximal_control | C | moderate | direct_exercise_support | low | low | false | true | Anti-extension trunk control; supportive only. | SG-S3, CGDR-S3 |
| 37 | Dead bug | dead_bug | supportive_lumbopelvic | supportive_proximal_control | C | moderate | direct_exercise_support | low | low | false | true | Trunk-pelvis control; long-lever versions lightly engage RF — keep short-lever framing. | SG-S3, CGDR-S3 |
| 38 | Pallof press | pallof_press | supportive_lumbopelvic | supportive_proximal_control | C | moderate | direct_exercise_support | low | low | false | true | Anti-rotation control; supportive only — **never core RF**. | SG-S3, CGDR-S3 |
| 39 | Low-load cycling | low_load_cycling | conditioning_recovery | conditioning_recovery_support | C | moderate | direct_exercise_support | low | low | false | true | Cardio maintenance at low anterior-thigh load; pain-free range. | CR-S1, CR-S18, CGDR-S7 |
| 40 | Swimming / aquatic conditioning | swimming_aquatic_conditioning | conditioning_recovery | conditioning_recovery_support | C | moderate | direct_exercise_support | low | low | false | true | Low-load fitness maintenance; used in RF case. | CR-S1 |
| 41 | Reverse sled drag | reverse_sled_drag | locomotor_strength_support | second_batch_manual_review | B | moderate | direct_exercise_support | indirect-moderate | moderate | true | false | Named in cohort; controlled propulsion bridging to running; not RF-specific. | CGDR-S4 |
| 42 | Prowler march | prowler_march | locomotor_strength_support | second_batch_manual_review | B | moderate | direct_exercise_support | indirect-moderate | moderate | true | false | Named in cohort; controlled locomotor load; gate intensity framing. | CGDR-S4 |
| 43 | Running drill progression | running_drill_progression | running_mechanics | second_batch_manual_review | B | high | direct_exercise_support | moderate | moderate | true | false | March/skip/run drills named across Aspetar + cohort + case; gate "volume before intensity" out. | CGDR-S2, CGDR-S4, CR-S1 |
| 44 | High-knee drill | high_knee_drill | running_mechanics | second_batch_manual_review | B | moderate | direct_exercise_support | moderate | moderate | true | false | Loads hip flexors/RF in cyclic action; case-named; gate intensity. | SG-S3, CGDR-S3 |
| 45 | Butt-kick drill | butt_kick_drill | running_mechanics | second_batch_manual_review | B | moderate | direct_exercise_support | low-moderate | moderate | true | false | Knee-flexion cyclic drill; case-named; rapid knee flexion → some RF length demand. | SG-S3, CGDR-S3 |
| 46 | Acceleration drill | acceleration_drill | sprint_preparation | high_caution_do_not_convert_yet | C | moderate | direct_exercise_support | moderate-high | high | true | false | On special-safety list; early swing-phase lengthens RF (injury mechanism); high re-injury context. | CR-S6, CGDR-S4, SG-S3 |
| 47 | Uphill sprint exposure | uphill_sprint_exposure | sprint_preparation | high_caution_do_not_convert_yet | C | moderate | direct_exercise_support | moderate-high | high | true | false | On special-safety list; single cohort source; high-velocity RF demand. | CGDR-S4 |
| 48 | Cable kicking simulation | cable_kicking_simulation | kicking_exposure | high_caution_do_not_convert_yet | D | low-moderate | contextual_support | high | high | true | false | On special-safety list; directly loads central/free tendon at velocity; masterclass + commentary only. | CR-S19, CR-S2 |
| 49 | Progressive kicking exposure | progressive_kicking_exposure | kicking_exposure | high_caution_do_not_convert_yet | C | high | direct_exercise_support | high | high | true | false | On special-safety list; highest RF-specific load; Aspetar pathway names a kicking section but content is athlete/sport-dependent. | CGDR-S1, CR-S19, CR-S2 |
| 50 | Bilateral landing | bilateral_landing | plyometric_landing | high_caution_do_not_convert_yet | C | moderate | direct_exercise_support | low-moderate | high | true | false | On special-safety list; force-absorption entry; sparse RTS evidence; central-tendon caution. | CGDR-S3, CGDR-S4, CR-S12 |
| 51 | Single-leg landing | single_leg_landing | plyometric_landing | high_caution_do_not_convert_yet | C | moderate | direct_exercise_support | low-moderate | high | true | false | On special-safety list; higher unilateral absorption demand. | CGDR-S3, CGDR-S4 |
| 52 | Squat jump | squat_jump | plyometric_propulsion | high_caution_do_not_convert_yet | C | moderate | direct_exercise_support | moderate | high | true | false | On special-safety list; concentric SSC load; named in case/cohort but later-stage. | SG-S3, CGDR-S4 |
| 53 | Plyometric hop progression | plyometric_hop_progression | plyometric_propulsion | high_caution_do_not_convert_yet | C | moderate | indirect_principle_support | moderate | high | true | false | On special-safety list; JOSPT itself notes sparse RTS evidence; high tissue load. | CR-S12, CR-S19 |
| 54 | Switch jump lunge | switch_jump_lunge | plyometric_propulsion | high_caution_do_not_convert_yet | C | moderate | direct_exercise_support | moderate | high | true | false | On special-safety list; ballistic reactive lunge; named in cohort; high RF demand. | CGDR-S4 |
| 55 | Med-ball lunge throw combinations | medball_lunge_throw_combos | combination_power | hold_for_review | D | moderate | direct_exercise_support | low-moderate | high | true | false | Combination task named once in cohort; treat as local variant, not canonical base object. | CGDR-S4 |
| 56 | Mountain climbers with slider | mountain_climbers_slider | dynamic_core_hip_flexion | hold_for_review | D | moderate | direct_exercise_support | ambiguous | moderate | true | false | RF intent too ambiguous for automatic inclusion (CR/CGDR both flagged); needs clinician intent. | SG-S3, CGDR-S3 |
| 57 | BFR quadriceps work | bfr_quadriceps_work | low_load_strength_adjunct | high_caution_do_not_convert_yet | C | moderate | indirect_principle_support | moderate | moderate | true | false | On special-safety list; evidence is **ACLR**, not RF; requires clinician cuff setup. | CR-S20, CR-S11 |
| 58 | Open-skill uncertainty drills | open_skill_uncertainty_drills | sport_specific_exposure | exclude | D | low | contextual_support | low | high | n/a | false | Too broad/sport-specific to standardize as a base object; CGDR excluded. | CGDR-S4 |
| 59 | Tactical repeated-effort ball drills | tactical_repeated_effort_ball_drills | sport_specific_exposure | exclude | D | low | contextual_support | low | high | n/a | false | Too broad/sport-specific; not a stable governed base object; CGDR excluded. | CGDR-S4 |
| 60 | Self-myofascial release | self_myofascial_release | recovery_modality | exclude | D | low | contextual_support | low | low | n/a | false | Recovery modality, not an exercise-library object; CGDR excluded. | CGDR-S4 |
| 61 | Generic hamstring mobility drills | generic_hamstring_mobility | posterior_chain_mobility | exclude | D | low-moderate | direct_exercise_support | not_rf_specific | low | n/a | false | Posterior-chain generic; not RF-specific; both SG (hold) and CGDR (exclude) flagged. | SG-S3, CGDR-S3 |
| 62 | Aggressive end-range RF stretching | aggressive_endrange_rf_stretch | end_range_static_stretch | exclude | D | low | contextual_support | high | high | n/a | false | On special-safety list; combined hip-extension + knee-flexion end range is the injury mechanism; **excluded as automated content** for fibrotic central-tendon case; only clinician-gated mobility (#7) permitted. | CR-S1, CR-S5 |

---

## 2. First Safe Batch List (`first_batch_safe_metadata`)

Lowest tissue/length risk, best-converged naming, no plausible test/threshold framing. Safe to author as draft metadata first.

1. Quadriceps set (#1)
2. Straight-leg raise — isometric/concentric only, **not** eccentric-at-length (#2)
3. Heel slides / active knee ROM (#4)
4. Prone quadriceps dynamic mobility (#5)
5. Half-kneeling pelvic tilt, RF bias (#6)
6. Sub-end-range RF/quadriceps mobility — **end range excluded** (#7)
7. Terminal / short-arc knee extension (#15)
8. Step-up (#26)

**Supportive items also safe to author now (clearly labeled `supportive_proximal_control`, never "core RF"):** single-leg deadlift (#28), glute bridge (#29), hip thrust (#30), side-lying hip abduction (#31), clamshell (#32), lateral band walk (#33), monster walk (#34), side plank (#35), front plank (#36), dead bug (#37), Pallof press (#38).

**Conditioning items also safe now (`conditioning_recovery_support`):** low-load cycling (#39), swimming/aquatic conditioning (#40).

---

## 3. Second Manual-Review Batch List (`second_batch_manual_review`)

Direct source naming exists, but a hip-extended/long-length position, an eccentric emphasis, or an intensity dimension requires clinician gating before authoring.

- Eccentric SLR lowering (#3)
- Isometric hip flexion at 90° (#9)
- Standing / cable hip flexion (#11)
- Leg extension machine (#16)
- Static split squat (#21)
- Bulgarian split squat — non-plyometric (#22)
- Reverse lunge (#23)
- Walking lunge (#24)
- Forward / clock lunge (#25)
- Step-down (#27)
- Reverse sled drag (#41)
- Prowler march (#42)
- Running drill progression (#43)
- High-knee drill (#44)
- Butt-kick drill (#45)

---

## 4. High-Caution Do-Not-Convert-Yet List (`high_caution_do_not_convert_yet`)

All require clinician authoring before any drafting; all sit on the special-safety list and/or load the central/intramuscular tendon at length or velocity. For a Grade 1b central-tendon + fibrosis case these are the principal re-injury vectors.

- Ballistic leg swings (#8)
- Long-lever hip-flexor isometric in extension (#10)
- Resisted hip flexion in Thomas position (#12)
- Manual eccentric hip flexor (#13)
- Flywheel eccentric hip flexion (#14)
- Reverse Nordic (#17)
- Reverse Nordic "tantrum" (#18)
- Sissy squat (#19)
- Spanish squat (#20)
- Acceleration drill (#46)
- Uphill sprint exposure (#47)
- Cable kicking simulation (#48)
- Progressive kicking exposure (#49)
- Bilateral landing (#50)
- Single-leg landing (#51)
- Squat jump (#52)
- Plyometric hop progression (#53)
- Switch jump lunge (#54)
- BFR quadriceps work (#57)

---

## 5. Evidence-Grade Downgrades From the Source Outputs

Every change from a source output's stated grade, with rationale. This is the auditable core of the merge.

| Exercise | Source output & its grade | New grade | Rationale for downgrade |
|---|---|---|---|
| Seated eccentric knee-extensor stretch | SG: **A** | folded into #17/#62 as **C/D** | A requires high-quality clinical trials or multiple strong direct sources. A single 2015 clinical guide is **B at most**; as an end-range eccentric over a central tendon it becomes high-caution. Not retained as a standalone first-batch A. |
| Eccentric hip-flexor + knee-extensor (anterior-chain) stretch | SG: **A** | **C** (→ reverse Nordic family, #17) | Same as above; single-guide support; reclassified as long-length eccentric high-caution. |
| Isometric straight-leg raise | SG: **A** | **B** (#2) | Direct but supported by a case report + an OA-population RCT + ACLR commentary — none are high-quality RF-strain trials. B is correct. |
| Isometric hip flexion at 90° | CGDR: **A** | **B** (#9) | Convergent Aspetar-article + case-report naming is strong **direct practical inclusion = B**, not A (no clinical trial). Also raised to MRR for central-tendon proximity. |
| Long-lever hip-flexor isometric in extension | CGDR: **A** | **C** (#10) | Single expert-article source; long-length over implicated tendon. Single-source + extrapolated risk = C, high-caution. |
| Resisted hip flexion in Thomas position | CGDR: **A** | **C** (#12) | Case-report-only; long-length hip-extended bias. Downgraded two steps and moved to high-caution. |
| Eccentric hip-flexor loading (manual/flywheel) | CGDR: **A** | **C** (#13, #14) | Single expert-article naming; mechanism reviews are indirect. On special-safety list → high-caution, not A. |
| Reverse Nordic | SG: **B** (core RF) ; CGDR: **B** | **C**, high-caution (#17) | Evidence is healthy-subject architecture (Alonso-Fernández) + EMG non-superiority (Pereira) — explicitly indirect. Not core RF rehab; end-range eccentric over central tendon. |
| Reverse Nordic (as "core RF/quadriceps rehab" grouping) | SG: core group | re-classified supportive→high-caution | SG placed it in the core group; reclassified out — it is not evidenced as core RF-strain rehab. |
| Walking lunge | SG: **B** core ; CGDR: include | **B**, second-batch MRR (#24) | Grade retained but decision moved from "core/include" to manual-review due to deceleration load. |
| Leg extension | SG: **B** ; CGDR: **B** | **B**, second-batch MRR (#16) | Grade retained; decision gated because full-range end loads RF. |
| Step bilateral/unilateral landing, squat jump, plyometric jump | SG: **B**, "running/sport exposure" | **C**, high-caution (#50–#53) | SG graded plyometrics B and grouped them as ready exposure. Reclassified: indirect RTS evidence (JOSPT notes sparsity); special-safety list; high central-tendon risk. |
| High knees / butt kicks / accelerations | SG: **B**, sport-exposure | accelerations → high-caution C (#46); high-knee/butt-kick → B MRR (#44, #45) | Accelerations sit on the special-safety list (swing-phase RF lengthening) → high-caution. Drill-form high-knee/butt-kick retained at B but gated. |
| Uphill sprint exposure | CGDR: include (direct) | **C**, high-caution (#47) | Single cohort source; high-velocity; special-safety list. |
| Switch jump lunge | CGDR: include (direct) | **C**, high-caution (#54) | Ballistic; special-safety list. |
| Plyometric glute bridge / plyometric hip thrust | SG: **D**, hold | **excluded from this table as canonical objects** | SG already held these at D; not promoted. (Not in your candidate list; noted for completeness — treat as local variants only.) |
| Hamstring mobility with fitball | SG: **D**, hold | **exclude** (folded into #61) | Posterior-chain generic; both SG and CGDR flagged; excluded as not RF-specific. |
| Ballistic swings | SG: **D**, hold | **D**, high-caution (#8) | Held at D; additionally flagged high-caution for ballistic end-range. |
| Isometric hip adduction | SG: **C** supportive | **not carried** (off candidate list) | Adductor exercise, OA-population source; not on your candidate list and not RF-specific. Omitted to avoid scope creep; flag if you want it as a supportive object. |

**Net effect:** zero Grade A entries survive; the eccentric/long-length/plyometric/sprint/kicking cluster that the two AI outputs treated as ready-to-include is uniformly moved to high-caution.

---

## 6. Source Gaps Still Needing Research

Flagged, not filled (no new broad research performed, per instruction).

1. **The 2026 Aspetar RF Rehabilitation Pathway (CGDR-S1) was only partially verified** — exercise-level detail came from abstracts/snippets, not the full pathway. This is the single highest-value document to obtain in full, because it is the most authoritative RF-specific source and could move several entries from C toward B on convergence. **Until the full text is verified, do not upgrade any entry on the strength of it.**
2. **No source addresses fibrotic / central-tendon RF tissue loading specifically.** Every loading recommendation for the live case is extrapolated. The contested IMT-prognosis literature (CR-S3/S4/S9 worse vs CR-S10 no-difference; mostly hamstring data) remains unresolved for RF.
3. **Reverse Nordic rests entirely on healthy-subject architecture + EMG studies.** No injury-outcome data exist. Any "must-have long-length eccentric" framing is unsupported.
4. **Valera-Garrido 2020 cohort (CGDR-S4) is confounded** by concurrent percutaneous needle electrolysis — its exercise menu (sled, prowler, uphill sprint, drop split squat, switch-jump lunge) cannot be attributed to exercise alone.
5. **Spanish squat evidence is patellar-tendon, not RF** (CR-S17). The transfer is an assumption.
6. **Manual + flywheel eccentric hip flexor rest on a single expert article** (CGDR-S2). No standardization or dosing-free execution standard exists across users.
7. **Kicking and sprint exposure** are named in authoritative sources but always inside programs containing the timing/monitoring/clearance logic you exclude — so only names/functions are usable; the operational layer is a clinician/governance task, not a library task.

---

## 7. Recommended Next Implementation Task

**Author the `clinical_rule` / exercise binding **schema** first — then populate only the First Safe Batch (§2) as draft metadata objects against it.** Concretely, in order:

1. **Define the exercise-object schema** (the bridge you've already identified between engineering schemas and the evidence registry) with mandatory governance fields baked in as required, non-nullable keys: `status: draft`, `clinical_approval: pending`, `executable: false`, `runtime_integration: none`, plus `evidence_grade`, `source_authority`, `source_support_type`, `RF_specificity`, `central_tendon_fibrosis_risk`, `manual_review_required`, `library_classification`, `final_decision`, and a `guardrail_notes` array.
2. **Add a hard schema constraint** that no exercise object may contain dosage, progression, readiness, RTT/RTS, clearance, or test fields — enforce it in the validator, not just in prose, so a non-compliant object fails CI.
3. **Add an `injury_site` cross-reference field** (proximal tendon / central-IMT / myotendinous / muscular) per CGDR's gap #2, so the central-tendon/fibrosis case can filter the library rather than inheriting a universal menu.
4. **Populate the 8 core + 11 supportive + 2 conditioning First Safe Batch objects only.** Leave second-batch and high-caution tiers as named placeholders with `final_decision` set and `clinical_approval: pending` until a clinician signs off.
5. **Bind each object to its `source_id`s** from the merged bibliography and carry the §5 downgrade note where one applies, so the audit trail survives into the repo.

This keeps you schema-first, keeps the highest-risk RF loading out of automated reach until clinician authoring exists, and produces the smallest defensible first increment.

---

## 8. Mandatory Guardrail Notes (attach to every object)

Every object in this library — first-batch, second-batch, high-caution, supportive, conditioning, hold, or excluded — must carry, verbatim, the following guardrail block:

- **not a prescription**
- **not dosage**
- **not progression**
- **not readiness**
- **not RTT/RTS**
- **not clearance**
- **not a test**

And must retain status flags: `draft` · `pending` · `not clinically approved` · `executable: false` · `runtime_integration: none` · `metadata only`.

The LLM-as-communicator boundary holds: the platform may surface and explain these objects; it must not assemble them into a plan, sequence them, or declare any readiness. For this Grade 1b central-tendon + fibrosis case, the entire high-caution tier defaults to clinician gating — consistent with "unknown is not clearance."
