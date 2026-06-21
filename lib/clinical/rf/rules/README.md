# `lib/clinical/rf/rules/` — Gate B RF rule-package authoring workspace

A **non-executable authoring workspace** for future Gate B machine-readable Rectus Femoris (RF)
rule objects. Nothing here is approved, executable, or imported into the app runtime. This folder
defines only structure, status, and authoring conventions.

## Status

| Field | Value |
|---|---|
| Package status | `authoring_workspace_created` |
| Approval status | `not_approved` |
| Executable | `false` |
| Rule objects authored | `0` |
| Rule objects approved | `0` |
| Allowed current use | `development_authoring_and_schema_planning_only` |

See `rfRulePackageStatus.json` for the machine-readable status descriptor and
`rfRuleObjectTemplate.json` for the blank rule-object template.

## What this folder is for

- **Pending Gate B authoring only.** Per RF v1.2 §20, the next governed step is machine-readable
  authoring, *not* product coding. This is where those candidate objects will be drafted.
- It is a **scaffold**, not an engine. Drafting a rule object here grants it no authority.

## Hard rules

1. **No rule here is approved.** Every authored object stays `approval_status: pending` until a
   separate, formal clinical adjudication records approval. This workspace must never mark a rule
   approved.
2. **No rule here is executable.** These are data/specification files (`.json`, `.md`). They are
   not imported into the app, and no code in this folder runs a rule.
3. **Every future rule object must cite its provenance before any use:**
   - the **RF v1.2 rule ID** it implements (e.g. `RF-SAF-001`, `RF-REHAB-004`) in
     `source_spec_rule_id`;
   - the **V3.1 architecture references** in `architecture_refs` (e.g. `V3.1-7`, `V3.1-21`);
   - the **QRF evidence-claim IDs** in `evidence_claim_ids` (e.g. `QRF-014`), preserving each
     claim's individual grade — never an invented combined grade.
   An object missing these is incomplete and may not progress.
4. **No object may include prohibited content**, in line with RF v1.2 (RF-REHAB-004, §15.1, §10.2,
   §14, Appendix C):
   - **universal dosage** (sets, reps, intensity, rest, frequency, progression increments);
   - **numeric confidence** values (confidence stays qualitative until calibration; V3.1 §24.1);
   - **fixed return-to-sport dates** or date-only clearance (RF-RTS-001);
   - **diagnosis-authorizes-plan** behavior (diagnosis alone never authorizes a plan; RF-REHAB-001,
     V3.1 §8).

## Boundary

This folder lives under `lib/clinical/**` and is covered by the quarantine boundary check
(`npm run check:rf-boundary`). Any future executable code added here must import **nothing** from
`lib/injuryEngine/**` or `data/injuryKnowledge/**`.

Full rationale: [`docs/implementation/RF_GATE_B_AUTHORING_WORKSPACE.md`](../../../../docs/implementation/RF_GATE_B_AUTHORING_WORKSPACE.md).
