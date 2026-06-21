# RF Exercise Knowledge — Batch 3 High-Caution Draft Authoring + Running-Prep Normalization

**Status:** complete as draft metadata. Total RF exercise objects: **107** (`RF-EX-001` through `RF-EX-107`). Approved objects: **0**. Executable objects: **0**. Runtime integration: **none**.

## 1. Purpose

Batch 3 completes the high-caution exercise draft layer and normalizes the remaining running-preparation drill objects selected from the RF exercise decision table.

This is not clinical approval. This work creates and normalizes inert knowledge objects only, so future reviewers can inspect high-risk concepts without turning them into plans, prescriptions, progressions, readiness gates, RTT/RTS decisions, or clearance authority.

## 2. Scope Completed

### New high-caution draft objects authored

Eight new RF-EX objects were authored:

| RF-EX ID | Concept | Decision-table concept |
|---|---|---|
| `RF-EX-100` | Long-lever hip-flexor isometric in extension | `longlever_hip_flexor_iso_extension` |
| `RF-EX-101` | Manual eccentric hip flexor | `manual_eccentric_hip_flexor` |
| `RF-EX-102` | Flywheel eccentric hip flexion | `flywheel_eccentric_hip_flexion` |
| `RF-EX-103` | Reverse Nordic tantrum variant | `reverse_nordic_tantrum` |
| `RF-EX-104` | Sissy squat | `sissy_squat` |
| `RF-EX-105` | Spanish squat | `spanish_squat` |
| `RF-EX-106` | Switch jump lunge | `switch_jump_lunge` |
| `RF-EX-107` | BFR quadriceps work | `bfr_quadriceps_work` |

### Existing high-caution objects upgraded in place

Existing RF-EX objects were upgraded rather than duplicated:

| RF-EX ID | Concept | Reason no duplicate was created |
|---|---|---|
| `RF-EX-009` | Resisted hip flexion in Thomas-test position | exact match |
| `RF-EX-013` | Reverse Nordic | exact match |
| `RF-EX-029` | Ballistic swings | existing ballistic leg-swing concept |
| `RF-EX-051` | Acceleration mechanics drill | existing acceleration drill concept |
| `RF-EX-057` | Step bilateral landing | existing bilateral landing concept |
| `RF-EX-058` | Step unilateral landing | existing single-leg landing concept |
| `RF-EX-059` | Bilateral squat jump | exact match |
| `RF-EX-060` | Plyometric jump | existing jump/hop exposure concept |
| `RF-EX-064` | Low-intensity hopping | existing hopping/reactive exposure concept |
| `RF-EX-068` | Resisted kicking exposure | existing cable/resisted kicking concept |
| `RF-EX-070` | Game-based kicking scenario exposure | existing progressive/game-like kicking concept |
| `RF-EX-076` | Sprinting exposure | existing sprinting/uphill-sprint exposure context |

### Running-prep normalization completed

These existing running-preparation drills now carry v2 governance metadata and v2.1 user-facing metadata:

| RF-EX ID | Concept |
|---|---|
| `RF-EX-043` | Ankling drill |
| `RF-EX-044` | Skipping drill |
| `RF-EX-048` | Toe-off pelvic-control running drill |
| `RF-EX-049` | Mid-stance running mechanics drill |
| `RF-EX-050` | Rotational-control running drill |

`RF-EX-046` and `RF-EX-047` were already normalized during Batch 2 and remain running-preparation drill objects. No umbrella "running drill progression" object was created because the discrete drill concepts already exist.

## 3. High-Caution Governance

All Batch 3 high-caution objects are:

- `exercise_status: draft`
- `approval_status: pending`
- `clinical_approval_status: not_approved` at system status level
- `executable: false`
- `permitted_use: exercise_metadata_only`
- `runtime_integration: none` at system status level
- `final_decision: high_caution_do_not_convert_yet`
- `manual_review_required: true`
- `central_tendon_fibrosis_risk: high` or `moderate`

Every selected v2-governed object includes the seven required guardrails:

- not a prescription
- not dosage
- not progression
- not readiness
- not RTT/RTS
- not clearance
- not a test

## 4. User-Facing Metadata

All selected Batch 3 high-caution and running-prep objects include the full v2.1 plan-card metadata block:

- user-facing name, summary, purpose, setup, instructions, common mistakes, and safety note
- plan-card category and difficulty labels
- easier/harder/related labels
- inert `media` object with `media_status: none`
- logging flags for completion, pain response, difficulty, notes, and next-day response

The user-facing text is intentionally simple and does not expose internal governance identifiers, source grades, readiness language, clearance language, or clinical rule IDs.

## 5. No Active Clinical Authority

Batch 3 does not author:

- sets
- reps
- frequency
- duration
- distance
- speed targets
- intensity targets
- percentages
- sprint ratios
- return dates
- progression increments
- readiness scores
- pass/fail criteria
- RTT/RTS authorization
- return-to-running timelines
- return-to-training timelines
- return-to-sport timelines
- clearance decisions

The `dosage` block remains inert on every object.

## 6. Duplicate Prevention

No duplicate high-caution or running-prep concepts were created.

The following potentially duplicative rows were handled by upgrading existing RF-EX objects in place:

- ballistic leg swings -> `RF-EX-029`
- acceleration drill -> `RF-EX-051`
- bilateral landing -> `RF-EX-057`
- single-leg landing -> `RF-EX-058`
- squat jump -> `RF-EX-059`
- plyometric hop/jump exposure -> `RF-EX-060` and `RF-EX-064` as discrete existing concepts
- resisted/cable kicking -> `RF-EX-068`
- progressive/game-like kicking -> `RF-EX-070`
- sprint/uphill sprint exposure context -> `RF-EX-076`
- running drill progression -> not authored as an umbrella duplicate

## 7. Deferred / Documentation-Only Boundaries

Excluded concepts remain documentation-only. No excluded item was authored as an RF-EX object.

Activity-exposure-like concepts remain non-executable exercise metadata in this legacy RF-EX location until a separately governed migration decides whether to keep, cross-reference, or migrate them. This Batch 3 pass did not move objects, rename IDs, or create RF-ACT/RF-ASSESS objects.

## 8. Runtime Boundary

No runtime behavior was created. No UI, Supabase, RecoveryContext, injuryEngine, legacy module, RF clinical rule object, schema, or validator change is part of this Batch 3 authoring pass.

## 9. Current State

- RF exercise objects: 107
- Highest RF-EX ID: `RF-EX-107`
- Approved RF exercise objects: 0
- Executable RF exercise objects: 0
- Runtime integration: none
- Clinical approval: not approved
- High-caution objects with v2 + v2.1 metadata: 20
- Running-prep normalized objects in this pass: `RF-EX-043`, `RF-EX-044`, `RF-EX-048`, `RF-EX-049`, `RF-EX-050`
