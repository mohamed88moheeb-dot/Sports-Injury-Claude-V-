# RF Governed Boundary Skeleton

This document explains the initial governed Rectus Femoris (RF) clinical namespace created under
[`lib/clinical/rf/`](../../lib/clinical/rf/). It is a **boundary scaffold only** — safe metadata,
status constants, and non-executable structural placeholders. No clinical logic exists here yet.

## 1. Why `lib/clinical/rf/` exists

The platform's existing RF-related behavior lives in legacy modules (`lib/injuryEngine/**`,
`data/injuryKnowledge/**`) that **predate** the governed RF Clinical Rule Specification v1.2 and
Master Architecture V3.1. As recorded in `RF_LEGACY_ENGINE_CONFORMANCE_MAP.md`, that legacy code
carries numeric confidence, fixed dosage, diagnosis-authorizes-plan coupling, a non-closed safety
vocabulary, and hidden thresholds — none of it traceable to evidence-claim IDs or architecture
references.

`lib/clinical/rf/` is the **clean, forward-looking home** where governed RF behavior will
eventually be implemented from *approved* machine-readable rule objects. Creating the namespace now
— empty of clinical logic — establishes the boundary early, so that as soon as governed content is
authored and approved, it has a quarantine-clean place to live. The skeleton also gives the rest of
the codebase a stable import surface (`status.js`, `contracts.js`, `index.js`) without committing to
any clinical behavior.

## 2. Why it must not import legacy engines

The governed path must be **uncontaminated** by ungoverned clinical content. If `lib/clinical/rf/`
imported a legacy engine — directly or transitively — ungoverned diagnosis weights, dosage, or
thresholds would flow back into the governed namespace, defeating the entire reconciliation effort.

This is not a guideline; it is **machine-enforced**. The quarantine manifest
[`lib/clinical/rfLegacyQuarantineManifest.json`](../../lib/clinical/rfLegacyQuarantineManifest.json)
lists the prohibited modules, and [`scripts/check-rf-quarantine-boundary.mjs`](../../scripts/check-rf-quarantine-boundary.mjs)
(`npm run check:rf-boundary`) traverses the dependency graph from every file under
`lib/clinical/**` and fails the build if any chain reaches a quarantined module. The skeleton files
therefore import **nothing** outside the namespace.

## 3. What is intentionally NOT implemented yet

By design, this skeleton contains none of the following:

- diagnosis or differential logic;
- rehabilitation prescription, phase, or dosage logic;
- progression / adaptation / monitoring logic;
- confidence computation or any numeric confidence value;
- safety-state evaluation or red-flag decisions;
- return-to-training / return-to-performance logic;
- any executable rule, and any rule marked `approved`.

`contracts.js` defines only **key identifiers** — structural slot names mirroring the governing
documents (core clinical objects, the six confidence objects, the eight safety states) — so that
future approved objects can be slotted in without renaming. Listing identifiers is structural
scaffolding, not clinical authority.

## 4. How it relates to RF v1.2, V3.1, and the quarantine manifest

- **RF Clinical Rule Specification v1.2** (`docs/governance/Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2.md`)
  — the source of the structural vocabulary referenced by `contracts.js`: core clinical objects
  (§5), the six confidence objects (§15.1), and the closed safety-state set (§7.1). v1.2 is a
  **Gate A candidate**; every rule is `approval_status: pending`, so the skeleton records
  `clinical_approval_status: not_approved` and `rule_execution: blocked_until_gate_b...`.
- **Master Architecture V3.1** (`docs/governance/Master_Architecture_V3.1_Final.md`) — the source of
  the separated-confidence requirement (§8), the closed safety-state matrix (§21), and the
  calibration invariant (§24.1). The skeleton encodes none of the behavior, only the identifiers and
  status.
- **Quarantine manifest** — the skeleton lives under `lib/clinical/**`, the exact tree the manifest
  protects. The boundary check guarantees the skeleton (and everything added to it later) stays free
  of quarantined legacy dependencies.

## 5. What the next safe development task should be

The next step is **not** to write RF clinical logic — v1.2's own next action is **Gate B
machine-readable authoring**, and Gate C permits implementing only *approved* rule objects. Safe,
non-clinical next steps, in order:

1. **Author the Gate B machine-readable RF rule package** (outside executable code) — convert the 38
   accepted v1.2 rule entries into versioned rule objects with bound `architecture_refs` and
   `evidence_claim_ids`, keeping every rule `approval_status: pending`. This is data/spec work, not
   app logic.
2. **Add a non-executable schema/loader skeleton** under `lib/clinical/rf/` that can *read and
   validate the shape* of those rule objects (structure only — it must refuse to execute any rule
   while `approval_status !== approved` and while `RF_RULE_EXECUTION_STATUS` is blocked).
3. **Extend the boundary check into CI** so `npm run check:rf-boundary` runs automatically on every
   change.

No diagnosis, dosage, threshold, confidence, or return-to-sport behavior may be implemented until
the corresponding rule objects are individually approved (Gate C) and the clinical/product
validation gate (Gate D) is satisfied.

---

**Confirmation:** this is engineering boundary scaffolding, not clinical approval. `npm run
check:rf-boundary` passes; no quarantined legacy module is imported; no clinical logic is created;
no runtime app behavior changes.
