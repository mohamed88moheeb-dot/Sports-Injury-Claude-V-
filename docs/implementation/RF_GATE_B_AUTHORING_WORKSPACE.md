# RF Gate B Authoring Workspace

This document explains the non-executable Gate B authoring workspace created under
[`lib/clinical/rf/rules/`](../../lib/clinical/rf/rules/). The workspace exists to **draft** future
machine-readable Rectus Femoris (RF) rule objects. It executes nothing, approves nothing, and is
not imported into the app runtime.

## Files

- `lib/clinical/rf/rules/rfRulePackageStatus.json` — machine-readable status of the (not-yet-real)
  rule package: `authoring_workspace_created`, `not_approved`, `executable: false`, zero objects.
- `lib/clinical/rf/rules/rfRuleObjectTemplate.json` — a **blank** rule-object template (placeholder
  keys only, no rule content).
- `lib/clinical/rf/rules/README.md` — the authoring conventions and hard rules.

## 1. Why this workspace exists

RF v1.2 §20 states the next governed step is **Gate B machine-readable authoring, not product
coding**. Gate B converts the document-level v1.2 rule entries into versioned, machine-readable rule
objects that bind inputs, decisions, architecture references, and evidence claims — while keeping
every rule `approval_status: pending`. This workspace is the dedicated place to draft those objects
without touching app behavior. Creating it now provides a stable, reviewable structure and a clear
status signal (`not_approved`, `executable: false`) before any clinical content is written.

## 2. Why it is separate from the legacy engines

The legacy engines (`lib/injuryEngine/**`) and legacy knowledge (`data/injuryKnowledge/**`) predate
v1.2 and are quarantined (`lib/clinical/rfLegacyQuarantineManifest.json`): they carry numeric
confidence, fixed dosage, diagnosis-authorizes-plan coupling, and untraceable clinical content. Gate
B authoring must start from the **governed** specification, not from that legacy code. Keeping the
workspace under `lib/clinical/rf/rules/` places it inside the quarantine-protected tree, so the
boundary check (`npm run check:rf-boundary`) guarantees nothing here ever depends on a quarantined
module. The workspace is data/specification only and is never imported by the runtime, so it cannot
affect user-facing behavior.

## 3. How it relates to RF v1.2 and V3.1

- **RF v1.2** (`docs/governance/Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2.md`) is the
  source of every rule object's identity and constraints: each draft must cite its `source_spec_rule_id`
  (e.g. `RF-SAF-001`), its `evidence_claim_ids` (QRF-xxx, individual grades preserved), and respect
  the v1.2 prohibitions (no universal dosage — RF-REHAB-004; no numeric confidence — §15.1; no
  date-only RTS — RF-RTS-001; diagnosis never authorizes a plan — RF-REHAB-001).
- **Master Architecture V3.1** (`docs/governance/Master_Architecture_V3.1_Final.md`) governs the
  structural contracts each object must reference in `architecture_refs`: the closed eight-state
  safety matrix (§21), separated confidence objects (§8), the calibration invariant (§24.1), and the
  machine-readable rule contract shape (mirrored by `rfRuleObjectTemplate.json`).

The template's key set (`rule_id`, `rule_family`, `source_spec_rule_id`, `approval_status`,
`permitted_use`, `architecture_refs`, `evidence_claim_ids`, `input_contract`, `decision_contract`,
`safety_state_output`, `blocked_targets`, `prohibited_outputs`, `test_fixtures`, `notes`) reflects
this governance — but is intentionally left blank.

## 4. What must happen before real rule objects are authored

1. The governing documents remain frozen and present (`docs/governance/`).
2. The evidence registry (QRF-001–QRF-046) is the agreed source for `evidence_claim_ids`; no claim
   is invented or combined.
3. An agreed schema/validator for the rule-object shape exists, so drafts can be checked for
   structure (required provenance fields, prohibited-content rules) — authored as non-executable
   validation, not as runtime clinical logic.
4. Each draft cites its v1.2 rule ID, V3.1 architecture refs, and QRF claim IDs, and contains **no**
   universal dosage, numeric confidence, fixed RTS dates, or diagnosis-authorizes-plan behavior.

Until then, `rfRulePackageStatus.json` stays at `rule_objects_authored: 0`.

## 5. What must happen before any rule object can be executed

Execution is gated well beyond authoring:

- **Gate B**: machine-readable objects authored and validated against the frozen V3.1 / schema
  package, every rule still `approval_status: pending`.
- **Clinical adjudication**: each rule individually reviewed and recorded as approved — a separate
  governed process this workspace must never perform.
- **Gate C**: only *approved* machine-readable objects may be implemented; deterministic engines
  retain authority; the language layer renders only authorized explanation tokens.
- **Gate D**: clinical and product validation (diagnostic/safety validation, calibrated confidence,
  outcome testing, human-factors, regulatory) before any production use.

Only after all of the above may a governed RF rule object run — and even then, the boundary check
must still pass and no quarantined legacy module may be involved.

---

**Confirmation:** this is a non-executable Gate B authoring scaffold, not clinical approval. `npm run
check:rf-boundary` passes; no clinical rule is authored; no rule is executable; nothing here is
imported into the runtime; no user-facing behavior changes.
