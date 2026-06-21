# RF Exercise Knowledge (v1.0 scaffold) — NON-EXECUTABLE

Rectus-femoris-specific corner of the Exercise Knowledge System.

- `objects/` — future RF exercise objects (`RF-EX-001.json`, …). **Empty in this scaffold**
  (only `.gitkeep`). Each future object is inert metadata validated against
  `../schema/exerciseObject.schema.json`.
- `source/rfExerciseSourceMap.json` — maps future RF exercise **metadata categories**
  (e.g. `quadriceps_activation`, `eccentric_or_lengthened_exposure`, `sprint_preparation`,
  `monitoring_and_checkin_flags`) to RF v1.2 rule links.

**Groups are metadata categories only** — not phases, not plans, not dosage; they do not
authorize progression and do not authorize return-to-training or return-to-sport. RF rule
links are *relationships*, not an inheritance of any rule's authority.

Validate with `npm run validate:exercise-knowledge`. Passes cleanly with zero objects.
