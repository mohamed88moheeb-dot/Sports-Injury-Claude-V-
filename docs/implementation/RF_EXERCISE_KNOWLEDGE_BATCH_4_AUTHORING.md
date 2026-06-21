# RF Exercise Knowledge — Batch 4 Authoring

**Status:** 23 new draft objects authored (RF-EX-065 … RF-EX-087) · total **87** · NON-EXECUTABLE · not clinically approved · 0 approved · no runtime integration.

## 1. What was authored
23 RF exercise-knowledge objects, `RF-EX-065.json` … `RF-EX-087.json`, in
`lib/clinical/exerciseKnowledge/rf/objects/`. Each follows the existing template structure
exactly: `module: rectus_femoris`, `exercise_status: draft`, `approval_status: pending`,
`executable: false`, `permitted_use: exercise_metadata_only`,
`dosage_status: requires_future_rule_authoring`, inert `dosage`
(`active_prescription_present: false`, all neutral dosage fields `null`),
`evidence_claim_ids: []`, and
`architecture_refs: ["Master_Architecture_V3.1_Final","Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2"]`.

**Total exercise objects now: 87** (Batch 1: 001–024; Batch 2: 025–042; Batch 3: 043–064; Batch 4: 065–087).

## 2. Nature of Batch 4
Kicking, sport-specific, conditioning, cross-training, and restricted-context leftover **exposure
metadata**. They are NOT plans, programs, progressions, conditioning prescriptions, kicking
progressions, readiness tests, team-training clearance, match-play clearance, unrestricted sport
clearance, RTT clearance, or RTS clearance. Grouping:
- Kicking exposure: RF-EX-065, 066, 067, 068, 070 (+ restricted 069, 072)
- Sport-specific / game-based: RF-EX-070, 071, 073, 074
- Running / sprinting / speed / agility exposure: RF-EX-073, 074, 075, 076, 077, 079
- Conditioning / cross-training: RF-EX-080, 081, 082, 083
- Restricted-context leftovers: RF-EX-069, 071, 072, 076, 077, 078, 079, 080, 081, 084, 085, 086, 087

## 3. Source references used
- `Aspetar_Rectus_Femoris_Injury_Rehabilitation_Pathway_2026`
- `Lempainen_2021_Chronic_Recurrent_RF_Central_Tendon_Rupture` (post-surgical RF — restricted)
- `Ryan_West_Point_Quadriceps_Contusions_1991` (contusion — restricted)
- `Lorenz_Domzalski_2020_Return_to_Sprinting` (general sprint context)

Each object cites only the source(s) named in its specification. `architecture_refs` is the two
governing documents on every object; `evidence_claim_ids` is `[]`.

## 4. No active dosage
No `sets`, `reps`, `frequency`, `rest`, `intensity`, or `duration`. The `dosage` block uses
validator-safe neutral keys held at `null` with `active_prescription_present: false`.

## 5. No conditioning prescription
RF-EX-080–083 carry no conditioning time, resistance, distance, or frequency. Notes state no
resistance/time/cycling progression (080), no conditioning dose (081), and no conditioning
prescription (082, 083).

## 6. No kicking progression
RF-EX-065–070 carry no kicking volume or kicking intensity prescription and no kicking
progression. Notes disclaim kicking progression and kicking clearance; higher-demand resisted
kicking (068) and game-based kicking (070) add kicking-control and symptom cautions to
`blocked_when`.

## 7. No running / sprint progression, distance, speed, or ratio
RF-EX-073–076, 079 carry no fixed distance, speed target, MSS percentage, or sprint work-to-rest
ratio. RF-EX-075 (`speed_target_not_prescribed`) and RF-EX-076 explicitly disclaim speed targets,
sprint ratios, and progression.

## 8. No team-training / game-play / unrestricted-sport / RTT / RTS clearance
Game-based and sport-specific objects (RF-EX-070, 071, 073, 077) explicitly disclaim match play,
team training, unrestricted sport, RTT, and RTS in `notes`. `linked_rule_ids` (RF-RTS-002/003/004,
RF-FIELD-*) are references only and create no clearance authority.

## 9. No runtime wiring / no schema changes
Nothing imported into the app. No UI, Supabase, `RecoveryContext`, `injuryEngine`, clinical RF
rule objects, schema, or legacy modules modified. No object references `lib/injuryEngine/**` or
`data/injuryKnowledge/**`. No schema fields added — `additionalProperties: false` honored; all
source/limitation context lives only inside existing fields. Changes confined to
`lib/clinical/exerciseKnowledge/**` and `docs/**`.

## 10. Restricted-context controls (Lempainen and Ryan/West Point objects)
Every restricted-context object uses `allowed_when` starting `restricted_context_only` and includes
`standard_rf_strain_selection_without_reviewer_approval` in `blocked_when`, with restricted context
also marked in `position_tags`/`tissue_demand_tags` and `notes`. Restricted objects: RF-EX-069, 071,
072, 076, 077, 078, 079, 080, 081, 084, 085, 086, 087. Their notes state they are post-surgical
(Lempainen) or contusion (Ryan/West Point) context only and not primary authority for standard RF
strain exercise selection.

## 11. RF-EX-086 does not replace RF-EX-017
RF-EX-086 (full/deep squat restricted-context exposure) `notes` explicitly state: "Does not replace
RF-EX-017 double-leg squat and is not primary standard RF strain authority." RF-EX-086 is restricted;
RF-EX-017 remains the standard double-leg squat metadata.

## 12. "Unrestricted kicking" not authored
No object named or encoding "unrestricted kicking" was created. Kicking objects are exposure
metadata that explicitly disclaim unrestricted kicking and kicking clearance.

## 13. No conditioning time / resistance / distance / frequency copied
No source-specific conditioning time, resistance, distance, or frequency value appears in any
object; conditioning objects record only the category and that no dose is authored.

## 14. Approval confirmation
Nothing in Batch 4 is clinically approved. Status: `clinical_approval_status: "not_approved"`,
`executable: false`, `exercise_objects_authored: 87`, `exercise_objects_approved: 0`,
`runtime_integration: "none"`.
