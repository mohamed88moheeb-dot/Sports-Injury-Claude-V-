# Assessment Knowledge System (v1.0 scaffold) - NON-EXECUTABLE

Governed, non-executable infrastructure for future assessment metadata. This
system is runtime-disconnected and contains no approved objects, no executable
objects, no dosage, no progression, no readiness authorization, no RTT/RTS
authority, and no clearance authority.

## What this is
- A strict schema for future `RF-ASSESS` assessment objects.
- A blank template for future governed authoring.
- A status descriptor declaring scaffold-only, pending, not approved, and
  runtime integration `none`.
- An RF source map that points future cross-reference work back to the
  classification audit without moving any `RF-EX` object.
- A validator available through `npm run validate:assessment-knowledge`.

## What this is not
- Not a migration of exercise objects.
- Not a test execution engine.
- Not a readiness engine, RTS gate, diagnosis source, or clearance source.
- Not wired into the app, Supabase, RecoveryContext, injuryEngine, or legacy
  modules.

Future `RF-ASSESS` authoring must happen under a separate governed task.
