# Exercise Knowledge System (v1.0 scaffold) — NON-EXECUTABLE

Governed, non-executable infrastructure for holding exercise **metadata** that a
future RF vertical slice may consult. **No runtime integration.** Nothing here is
clinically approved, and nothing here authors a rehab plan, dosage, return-to-training,
or return-to-sport clearance.

## What this is
- A **schema** (`schema/exerciseObject.schema.json`) describing the shape of a future
  exercise object — tissue/function/position/demand tags, contraindications, safety
  blockers, monitoring triggers, regressions/progressions/substitutions, and RF rule links.
- A blank **template** (`templates/exerciseObjectTemplate.json`).
- A **status** descriptor (`status/exerciseKnowledgeStatus.json`) — not approved,
  non-executable, 0 objects.
- An **RF source map** (`rf/source/rfExerciseSourceMap.json`) — future metadata *categories*
  (not phases, not plans, not dosage) linked to RF v1.2 rules.
- A **validator** (`scripts/validate-exercise-knowledge.mjs`, `npm run validate:exercise-knowledge`).

## What this is NOT
- Not a rehab plan, not an exercise-selection engine, not a dosage source.
- Not a progression authorization, not an RTT/RTS clearance, not a diagnosis engine.
- Not wired into the app, Supabase, or any clinical engine; imports nothing from
  `lib/injuryEngine/**` or `data/injuryKnowledge/**`.

## Dosage discipline
Exercise objects carry an **inert** `dosage` block using validator-safe neutral keys
(`prescribed_volume/load/tempo/schedule/recovery_interval/session_length/progression_step/target_timeline`)
held at `null`, with `active_prescription_present: false`. The conventional keys
(`sets`, `reps`, `frequency`, `rest`, `intensity`, `duration`, `progression_increment`,
`return_date`) are intentionally avoided because the RF governance discipline scans key
**names** and treats them as contraband even when null. Active dosage requires a separate,
governed future authoring phase.

See `docs/implementation/RF_EXERCISE_KNOWLEDGE_SYSTEM_SCAFFOLD.md`.
