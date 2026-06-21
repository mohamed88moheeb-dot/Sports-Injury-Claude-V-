# RF Exercise Knowledge — Batch 1 Authoring

**Status:** 24 draft objects authored · NON-EXECUTABLE · not clinically approved · 0 approved · no runtime integration.

## 1. What was authored
24 RF exercise-knowledge objects, `RF-EX-001.json` … `RF-EX-024.json`, in
`lib/clinical/exerciseKnowledge/rf/objects/`. Each follows the existing template
structure exactly: `module: rectus_femoris`, `exercise_status: draft`,
`approval_status: pending`, `executable: false`, `permitted_use: exercise_metadata_only`,
`dosage_status: requires_future_rule_authoring`, and an inert `dosage` block
(`active_prescription_present: false`, all neutral dosage fields `null`). No new schema
fields were introduced; all source-authority / limitation / restriction context lives only
inside existing fields (`source_refs`, `allowed_when`, `blocked_when`, `safety_blockers`,
`monitoring_triggers`, `notes`).

## 2. Composition
- **21 normal RF / quadriceps metadata candidates:** RF-EX-001 … RF-EX-021
  (knee-extension-biased loading, hip-flexor / RF-biased loading, eccentric/lengthened
  exposure, lower-limb strength and single-leg control, mobility, dynamic loading).
  These carry `allowed_when: ["metadata_candidate_only","requires_future_rule_authoring"]`.
- **3 restricted-context objects:** RF-EX-022 (generic quadriceps isometric),
  RF-EX-023 (active knee extension ROM/loading), RF-EX-024 (active knee flexion ROM).
  These carry `allowed_when: ["restricted_context_only","requires_future_rule_authoring"]`
  and `blocked_when` additionally includes
  `standard_rf_strain_selection_without_reviewer_approval`.

## 3. Source references used
- `Aspetar_Rectus_Femoris_Injury_Rehabilitation_Pathway_2026`
- `Gonzalez_de_la_Flor_Garcia_Perez_de_Sevilla_2024_RF_strain_case_report`
- `Ryan_West_Point_Quadriceps_Contusions_1991`
- `Lempainen_2021_Chronic_Recurrent_RF_Central_Tendon_Rupture`
- `Lorenz_Domzalski_2020_Return_to_Sprinting`

Each object cites only the source(s) named in its specification. `architecture_refs` is
`["Master_Architecture_V3.1_Final","Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2"]`
for every object; `evidence_claim_ids` is `[]`.

## 4. No active dosage
No object contains `sets`, `reps`, `frequency`, `rest`, `intensity`, `duration`, return
dates, or progression increments. The `dosage` block uses validator-safe neutral keys held
at `null` with `active_prescription_present: false`. Case-report doses are explicitly **not**
copied (see notes on RF-EX-004, RF-EX-005, RF-EX-008).

## 5. No clearance
No object creates a plan, an exercise-selection decision, a progression authorization, a
readiness signal, or return-to-training / return-to-sport clearance. `prerequisites` make
every object conditional on future selection rules, current safety state, and current
capacity profile. Where a movement is used as an assessment in some source (e.g. SLR break,
single-leg squat), the notes defer that assessment role to a future test library.

## 6. No runtime wiring
Nothing is imported into the app. No UI, Supabase, `RecoveryContext`, `injuryEngine`, clinical
RF rule objects, or legacy modules were modified. No object references
`lib/injuryEngine/**` or `data/injuryKnowledge/**`. Changes are confined to
`lib/clinical/exerciseKnowledge/**` and `docs/**`.

## 7. Restricted contexts (contusion / post-surgical)
RF-EX-022/023/024 derive from quadriceps-contusion and post-surgical RF central-tendon-rupture
sources (`Ryan_West_Point_Quadriceps_Contusions_1991`,
`Lempainen_2021_Chronic_Recurrent_RF_Central_Tendon_Rupture`). They are **not** primary
authority for standard RF strain exercise selection. This limitation is encoded in
`position_tags` (`restricted_context_only`), `allowed_when` (`restricted_context_only`),
`blocked_when` (`standard_rf_strain_selection_without_reviewer_approval`), and `notes`.

## 8. Deferred items (not authored in Batch 1)
- 90/90 hip flexion break test
- Straight-leg-raise (SLR) break test
- Running, sprinting, kicking, and field/conditioning exercise items
- Any selection, dosage, progression, monitoring-adaptation, or readiness/RTS logic

These belong to future, separately governed authoring (test/assessment library, field/readiness
batches, and the selection/dosage rule phase).

## 9. Validation
`npm run validate:exercise-knowledge` enforces required keys, status discipline
(never approved, `executable: false`, `module: rectus_femoris`,
`permitted_use: exercise_metadata_only`, `exercise_id` = `RF-EX-###`), the inert `dosage`
block, and the absence of contraband keys, fixed dates, RTT/RTS/plan authority, and
quarantined-module references. Batch 1 passes with 24 objects, 0 approved, 0 executable.

## 10. Approval confirmation
Nothing in Batch 1 is clinically approved. Status:
`clinical_approval_status: "not_approved"`, `executable: false`,
`exercise_objects_authored: 24`, `exercise_objects_approved: 0`,
`runtime_integration: "none"`.
