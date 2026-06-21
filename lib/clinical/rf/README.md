# `lib/clinical/rf/` — Governed Rectus Femoris namespace (boundary scaffold)

This directory is the **clean, future-governed home** for Rectus Femoris (RF) clinical behavior.
Right now it is a **boundary scaffold only**: metadata, status constants, and non-executable
structural key placeholders. It deliberately contains **no clinical logic**.

## Status

| Field | Value |
|---|---|
| Namespace status | `development_provisional` |
| Clinical approval | `not_approved` |
| Rule execution | `blocked_until_gate_b_machine_readable_rules_exist` |
| Governing spec | RF Clinical Rule Specification **v1.2** (Gate A candidate) |
| Governing architecture | Master Architecture **V3.1** |

## Hard rules for anything added here

1. **Import nothing from quarantined legacy modules** — never from `lib/injuryEngine/**` or
   `data/injuryKnowledge/**` (directly or transitively). This is enforced by
   `npm run check:rf-boundary` against `lib/clinical/rfLegacyQuarantineManifest.json`.
2. **No executable clinical logic** until Gate B machine-readable rule objects exist, are
   validated, and are individually approved (Gate C). No diagnosis, rehab, dosage, progression,
   confidence, or return-to-sport behavior.
3. **No rule may be marked approved here.** Approval is a separate governed process.

## Files

- `status.js` — safe metadata/status constants (module name, governed versions, approval/execution status).
- `contracts.js` — non-executable structural key placeholders (`RF_CLINICAL_OBJECT_KEYS`,
  `RF_CONFIDENCE_OBJECT_KEYS`, `RF_SAFETY_STATE_KEYS`, `RF_RULE_PACKAGE_STATUS`).
- `index.js` — re-exports the above; the namespace entry point.

See [`docs/implementation/RF_GOVERNED_BOUNDARY_SKELETON.md`](../../../docs/implementation/RF_GOVERNED_BOUNDARY_SKELETON.md)
for the full rationale and the next safe development step.
