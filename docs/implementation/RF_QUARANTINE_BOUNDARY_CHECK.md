# RF Quarantine Boundary Check

An automated engineering guard that keeps the **future governed Rectus Femoris (RF) path**
(`lib/clinical/**`) free of any dependency on the **quarantined legacy clinical modules**.

- Script: [scripts/check-rf-quarantine-boundary.mjs](../../scripts/check-rf-quarantine-boundary.mjs)
- Manifest it reads: [lib/clinical/rfLegacyQuarantineManifest.json](../../lib/clinical/rfLegacyQuarantineManifest.json)
- Run with: `npm run check:rf-boundary`

This is a **static dependency check only**. It creates no clinical logic, no diagnosis, rehab,
dosage, progression, confidence, or return-to-sport behavior, and wires nothing into the app.

---

## 1. What the check protects

The legacy engines (`lib/injuryEngine/*`) and legacy knowledge (`data/injuryKnowledge/*`) predate
the governed **RF Clinical Rule Specification v1.2** and **Master Architecture V3.1**. As recorded
in `RF_LEGACY_ENGINE_CONFORMANCE_MAP.md`, they carry numeric confidence, fixed dosage,
diagnosis-authorizes-plan coupling, non-closed safety vocabulary, and hidden thresholds — and they
carry **no evidence-claim IDs or architecture references**, so none of their clinical assertions
are traceable.

The manifest declares one invariant:

> No module under `lib/clinical/**` may import, re-export, or transitively depend on any quarantined
> legacy module.

This check enforces that invariant automatically — including the **transitive** case. It treats
every source file under `lib/clinical/**` as an entry point and builds a local dependency graph from
those entries, following only **local** imports (relative `./x` and repo-root `/x`); bare package
specifiers such as `react` or `node:fs` are ignored. In each module it recognizes:

- static imports — `import … from '…'` and bare `import '…'`;
- re-exports — `export … from '…'`;
- dynamic imports — `import('…')`;
- CommonJS requires — `require('…')`.

Specifiers are resolved whether or not they include a file extension (`.js`, `.jsx`, `.mjs`,
`.cjs`, `.ts`, `.tsx`), and directory imports resolve to `index.*`. The check fails if **any
dependency chain** starting in `lib/clinical/**` reaches a module listed in the manifest's
`quarantine` array — a direct import is just the shortest such chain.

## 2. Why it only scans `lib/clinical/**`

The guard is intentionally scoped to the **future governed RF path** and nothing else.

The **existing legacy app path** — `RecoveryContext.jsx`, `app/**`, `components/**` — still imports
the legacy engines, and that behavior is deliberately unchanged. Scanning the whole app would flag
those existing, allowed imports and would amount to pressure to rewire live behavior, which is out
of scope. The boundary we are protecting is forward-looking: as governed RF code is authored under
`lib/clinical/**`, it must start clean and stay clean. So the check walks only that directory tree.

## 3. Which manifest it reads

It reads `lib/clinical/rfLegacyQuarantineManifest.json` and extracts every `quarantine[].module`
path (repo-root-relative). The manifest is the single source of truth; updating the quarantine list
there automatically updates what this check enforces. The manifest JSON file itself is ignored
during the scan (it is data, not a source module), as are non-source files such as `.json` and
`.md`.

## 4. How to run it

```bash
npm run check:rf-boundary
```

Equivalent direct invocation:

```bash
node scripts/check-rf-quarantine-boundary.mjs
```

The script uses only built-in Node modules (`node:fs`, `node:path`, `node:url`) — no install step.
Exit code `0` = pass, `1` = fail, so it can be dropped into CI or a pre-commit hook unchanged.

Current state: there are no source files under `lib/clinical/**` yet (only the manifest), so the
check passes by reporting zero entry files. It begins doing real work the moment governed RF source
is added.

## 5. What a failure means

A non-zero exit with a `RF quarantine boundary check FAILED` message means a file under
`lib/clinical/**` depends — directly or transitively — on a quarantined legacy module. The output
prints the **full dependency chain** from the entry file to the quarantined module. A direct import
prints a two-node chain:

```
  lib/clinical/someGovernedModule.mjs -> lib/injuryEngine/scoringEngine.js
```

A transitive dependency prints the intermediate hops too:

```
  lib/clinical/a.js -> lib/utils/b.js -> lib/injuryEngine/scoringEngine.js
```

To resolve a failure, do **not** suppress the check. Instead, remove the dependency: the governed
RF path must obtain any behavior it needs from approved, governed sources — not from legacy clinical
code. If a legacy element is genuinely safe non-clinical scaffolding, it must first be reviewed,
refactored out of the quarantined module, and removed from the manifest's `quarantine` list before
`lib/clinical/**` may use it.

## 6. This is engineering boundary enforcement, not clinical approval

Passing this check means **only** that the governed RF path has no static dependency on quarantined
legacy modules. It does **not** mean:

- any RF clinical rule has been approved (RF v1.2 is a Gate A candidate; every rule is
  `approval_status: pending`);
- any diagnosis, dosage, progression, confidence, or return-to-sport logic exists or is sanctioned;
- the governed RF path is ready for implementation or production use.

Clinical approval is a separate, governed process (Gate B machine-readable authoring, then Gate C
implementation of approved objects, then Gate D clinical/product validation). This script is purely
an automated guardrail that keeps the boundary intact while that process runs.
