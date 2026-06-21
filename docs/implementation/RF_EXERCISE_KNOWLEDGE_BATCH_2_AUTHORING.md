# RF Exercise Knowledge — Batch 2 Authoring

**Status:** 18 new draft objects authored (RF-EX-025 … RF-EX-042) · total **42** · NON-EXECUTABLE · not clinically approved · 0 approved · no runtime integration.

## 1. What was authored
18 supporting RF exercise-knowledge objects, `RF-EX-025.json` … `RF-EX-042.json`, in
`lib/clinical/exerciseKnowledge/rf/objects/`. Each follows the existing template structure
exactly: `module: rectus_femoris`, `exercise_status: draft`, `approval_status: pending`,
`executable: false`, `permitted_use: exercise_metadata_only`,
`dosage_status: requires_future_rule_authoring`, inert `dosage`
(`active_prescription_present: false`, all neutral dosage fields `null`),
`evidence_claim_ids: []`, and
`architecture_refs: ["Master_Architecture_V3.1_Final","Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2"]`.

**Total exercise objects now: 42** (Batch 1: RF-EX-001…024; Batch 2: RF-EX-025…042).

## 2. Nature of Batch 2
All 18 are **supporting** trunk, pelvis, hip-control, gluteal, posterior-chain mobility, and
lumbopelvic-control exercises extracted from the RF strain case report. They are supporting
metadata only — **not** primary rectus-femoris tissue-loading authority, **not** universal
protocol, and **not** dosage or clearance. Coverage:
- Lumbopelvic / pelvic control: RF-EX-025, RF-EX-026
- Posterior-chain & dynamic mobility: RF-EX-027, RF-EX-028, RF-EX-029
- Hip abductor / external-rotator / control: RF-EX-030, RF-EX-031, RF-EX-034, RF-EX-036
- Hip-extensor strength: RF-EX-032, RF-EX-033, RF-EX-035
- Higher-demand hip-extensor power: RF-EX-037, RF-EX-038
- Trunk/pelvis control: RF-EX-039, RF-EX-040, RF-EX-041, RF-EX-042

## 3. Source references used
All Batch 2 objects cite
`Gonzalez_de_la_Flor_Garcia_Perez_de_Sevilla_2024_RF_strain_case_report`. No other source is
introduced. `architecture_refs` is the two governing documents on every object;
`evidence_claim_ids` is `[]`.

## 4. No active dosage
No `sets`, `reps`, `frequency`, `rest`, `intensity`, `duration`, return dates, timelines, or
progression increments. The `dosage` block uses validator-safe neutral keys held at `null`
with `active_prescription_present: false`. Case-report doses, durations, and plank/hold times
are explicitly **not** copied (see RF-EX-040 notes).

## 5. No clearance
No object creates a plan, an exercise-selection decision, a progression authorization, a
readiness signal, or RTT/RTS clearance. `prerequisites` make every object conditional on
future selection rules, current safety state, and current capacity profile.

## 6. No progression authorization
The higher-demand and dynamic objects explicitly disclaim progression authority in `notes`
(RF-EX-029, RF-EX-037, RF-EX-038) and carry no progression options or sequencing.

## 7. No runtime wiring
Nothing imported into the app. No UI, Supabase, `RecoveryContext`, `injuryEngine`, clinical RF
rule objects, or legacy modules modified. No object references `lib/injuryEngine/**` or
`data/injuryKnowledge/**`. Changes confined to `lib/clinical/exerciseKnowledge/**` and `docs/**`.

## 8. Case-report source limitations
Every Batch 2 object's `notes` mark it as **supporting** metadata from an RF strain case
report and not primary RF tissue-loading authority / not universal protocol / no dose copied.
This keeps the Gonzalez case report distinguished from clearance or universal-protocol
authority.

## 9. Higher-demand notes (RF-EX-037, RF-EX-038)
RF-EX-037 (plyometric glute bridge) and RF-EX-038 (plyometric hip thrust) are higher-demand
hip-extensor power objects. `speed_power_demand: high`; `blocked_when` additionally includes
`high_irritability`, `poor_lumbopelvic_control`, and `symptom_worsening_after_power_exposure`;
`notes` state they are not an early default and do not imply readiness, progression, or
clearance. They link to RF-RTS-004 (deficits remain active targets) as context only.

## 10. Mobility caution (RF-EX-026, RF-EX-029)
RF-EX-026 (half-kneeling pelvic tilt with maximal knee flexion) and RF-EX-029 (ballistic
swings) carry higher anterior-thigh / dynamic mobility demand. Both add `high_irritability`
and `stretch_worsens_symptoms` to `blocked_when` (RF-EX-029 also `poor_dynamic_control`); both
link to safety/recurrence rules and state metadata-only, no-stretching-prescription intent.

## 11. Future shared-library candidates
Flagged in `notes` as future shared athletic strength/control-library candidates (not moved):
RF-EX-032, RF-EX-033 (glute bridge / hip thrust), RF-EX-034, RF-EX-036 (banded hip-control
walks), RF-EX-039 (side plank). Relocation/reference deferred to a future shared-library phase.

## 12. No schema changes
No fields were added or removed. `additionalProperties: false` honored; all source/limitation
context lives only inside existing fields (`source_refs`, `allowed_when`, `blocked_when`,
`position_tags`, `tissue_demand_tags`, `safety_blockers`, `monitoring_triggers`, `notes`).

## 13. Approval confirmation
Nothing in Batch 2 is clinically approved. Status: `clinical_approval_status: "not_approved"`,
`executable: false`, `exercise_objects_authored: 42`, `exercise_objects_approved: 0`,
`runtime_integration: "none"`.
