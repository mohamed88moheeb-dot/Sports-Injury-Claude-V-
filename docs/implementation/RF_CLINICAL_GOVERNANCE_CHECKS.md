# RF Clinical Governance Checks

A single command that runs the Rectus Femoris (RF) development-discipline guards together:

```bash
npm run check:rf-clinical
```

It runs two independent checks in order and stops at the first failure.

## What each check does

### 1. RF quarantine boundary check — `scripts/check-rf-quarantine-boundary.mjs`
Builds a dependency graph from every source file under `lib/clinical/**` (the future governed RF
path) and fails if any chain — direct or transitive — reaches a module listed in
[`lib/clinical/rfLegacyQuarantineManifest.json`](../../lib/clinical/rfLegacyQuarantineManifest.json).
This keeps the governed RF namespace free of the quarantined legacy engines
(`lib/injuryEngine/**`, `data/injuryKnowledge/**`). See
[`RF_QUARANTINE_BOUNDARY_CHECK.md`](RF_QUARANTINE_BOUNDARY_CHECK.md).

### 2. RF rule-package validation — `scripts/validate-rf-rule-package.mjs`
Structurally validates the Gate B authoring workspace: the package status
(`rfRulePackageStatus.json`) is not approved / not executable / zero approved; the rule-object
template stays blank; and any authored objects under `lib/clinical/rf/rules/objects/` conform to
shape, provenance (RF v1.2 rule IDs, V3.1 architecture refs, QRF claim IDs), status discipline
(`approved` is rejected in this phase), and the prohibited-field rules (numeric confidence,
universal dosage, fixed return-to-sport dates, and **diagnosis-authorizes-plan** flags). See
[`RF_RULE_OBJECT_VALIDATION_SCAFFOLD.md`](RF_RULE_OBJECT_VALIDATION_SCAFFOLD.md).

## Why both are needed

They protect two different boundaries and neither subsumes the other:

- The **boundary check** governs *dependencies* — what the governed RF code is allowed to import.
- The **rule-package validation** governs *content* — the shape and discipline of the rule objects
  being authored.

A rule object could be perfectly shaped yet sit in code that illegally imports a legacy engine; or
the governed namespace could be import-clean yet contain a rule object with numeric confidence or a
diagnosis-authorizes-plan flag. Running both, and failing if *either* fails, closes both gaps.

## How to run the combined check

```bash
npm run check:rf-clinical
```

The combined script (`scripts/check-rf-clinical-governance.mjs`, built-in Node modules only) runs
the boundary check first, then the rule validator. It stops on the first failure, prints which check
failed, exits `1` if either fails, and exits `0` only if both pass. The individual commands remain
available: `npm run check:rf-boundary` and `npm run validate:rf-rules`.

## Why passing is not clinical approval

A green result means only that the governed RF path imports nothing quarantined and that the
authoring workspace is structurally well-formed and observes status discipline. It does **not** mean
any rule is clinically correct, approved, or executable. RF v1.2 is a Gate A candidate with every
rule `approval_status: pending`; clinical approval (per-rule adjudication) and execution
authorization (Gate C, then Gate D clinical/product validation) are separate governed processes that
this tooling never performs or implies.

## These checks protect development discipline only

They are engineering guardrails: they keep the quarantine boundary intact and keep authored rule
objects honest about shape, provenance, and prohibited content while Gate B authoring proceeds. They
do not execute rules, change runtime behavior, or grant any clinical authority.
