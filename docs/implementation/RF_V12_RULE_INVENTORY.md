# RF v1.2 Source-Rule Inventory

A **non-executable source inventory** of the governed Rectus Femoris (RF) rule entries defined in
[`docs/governance/Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2.md`](../governance/Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2.md).

- Inventory file: [lib/clinical/rf/rules/source/rfV12RuleInventory.json](../../lib/clinical/rf/rules/source/rfV12RuleInventory.json)

## 1. What this inventory is

A flat, machine-readable **index** of the RF v1.2 rule entries that will later be converted into
Gate B machine-readable rule objects. Each entry records only the fields explicitly present in (or
clearly inferable from) the specification: the source rule ID, family, a concise title, the source
section, approval status, permitted use, architecture references, evidence-claim IDs, and Gate B
tracking flags (`has_machine_readable_object: false`, `gate_b_status: "not_authored"`). It is a
planning artifact that makes the v1.2 rule set enumerable and trackable.

## 2. What it is not

- **Not authored Gate B rule objects.** It defines no `input_contract`, `decision_contract`,
  `safety_state_output`, fixtures, or executable behavior.
- **Not executable.** It is inert JSON (`executable: false`) and is imported by nothing in the app.
- **Not approval.** Every entry is `approval_status: pending`; the inventory is `not_approved`.
- **Not the source of truth.** The authoritative wording, grades, and limits live in v1.2. Titles
  here are concise summaries only, and no evidence-claim IDs or architecture refs were invented.

## 3. How it differs from a Gate B authored rule object

| Aspect | Source inventory entry | Gate B authored rule object |
|---|---|---|
| Location | `lib/clinical/rf/rules/source/` | `lib/clinical/rf/rules/objects/` (none yet) |
| Purpose | Track which v1.2 rules exist | Implement one rule's machine-readable contract |
| Contracts | none (index fields only) | `input_contract`, `decision_contract`, etc. |
| Validated by | not scanned by the rule validator | `npm run validate:rf-rules` (shape/provenance/prohibited fields) |
| Status | `not_authored` / `pending` | `pending` until clinical approval; never `approved` in this phase |

The inventory is the *worklist*; an authored object is one completed *work item*.

## 4. How many RF v1.2 source rules were inventoried

**38** governed rule entries — matching the v1.2 Gate A-accepted set (Appendix A Rule Catalogue):

- Safety (`RF-SAF-001` … `RF-SAF-008`) — 8
- Diagnosis (`RF-DX-001` … `RF-DX-008`) — 8
- Severity / Prognosis / History-structure (`RF-SEV-001` … `RF-SEV-005`) — 5
- Rehabilitation (`RF-REHAB-001` … `RF-REHAB-006`) — 6
- Recurrence (`RF-RECUR-001`, `RF-RECUR-002`) — 2
- Running/sprinting, Kicking, Sprint-dosage (`RF-FIELD-001` … `RF-FIELD-005`) — 5
- Readiness / Performance (`RF-RTS-001` … `RF-RTS-004`) — 4

`rule_objects_authored` remains **0**.

## 5. Which rules need manual review before authoring

The inventory's `extraction_warnings` array records every uncertainty. The items that need
human attention before a rule object is authored are:

- **Dual/contextual `permitted_use`** — `RF-DX-001`, `RF-DX-004`, `RF-SEV-002`, `RF-SEV-004`,
  `RF-REHAB-002`, `RF-RTS-001` carry two permitted-use roles in their body. The inventory records the
  primary value only; the secondary role (in `notes`) must be reattached during authoring.
- **Per-claim evidence roles** — evidence claims have different roles (decision-driving vs
  reference-only / evidence_record_only) per Appendix B. The inventory lists claim IDs without those
  roles; each must be reattached and its individual grade preserved.
- **Architecture-section granularity** — section *ranges* (e.g. `§§13.1–13.2`, `§§12–14`) were
  expanded into discrete `V3.1-…` tokens; confirm granularity against V3.1.
- **Family vocabulary** — `rule_family` tokens were normalized from Appendix A domains; confirm the
  canonical family set.

Empty `architecture_refs` on clinical-content rules and empty `evidence_claim_ids` on
architecture rules are **not** review items — per v1.2 §4.3 those are legitimately empty (`[]` means
"none in source", not "missing").

## 6. How this inventory will be used in the next Gate B step

Gate B authoring (v1.2 §20) will iterate over `source_rules` and, for each entry:

1. copy the blank `rfRuleObjectTemplate.json` into `lib/clinical/rf/rules/objects/`;
2. bind the entry's `source_spec_rule_id`, `architecture_refs`, and `evidence_claim_ids` (preserving
   per-claim grades), and author the `input_contract` / `decision_contract` / `safety_state_output`;
3. resolve the relevant `extraction_warnings` for that rule;
4. keep `approval_status: pending` and run `npm run validate:rf-rules` (and `npm run check:rf-clinical`).

As each object is authored, its inventory entry's `has_machine_readable_object` and `gate_b_status`
will be updated so the inventory remains an accurate progress tracker. No object may be marked
`approved` in this phase.

## 7. This is not clinical approval and not executable logic

Creating or reading this inventory grants no clinical authority. The rules remain Gate A candidates,
`approval_status: pending`, and the inventory executes nothing and is wired into no runtime path.
Clinical approval (per-rule adjudication) and execution authorization (Gate C, then Gate D
clinical/product validation) are separate governed processes outside this artifact.

---

**Verification:** the inventory is JSON-valid; `rule_objects_authored` is `0`; no objects exist
under `lib/clinical/rf/rules/objects/`. `npm run check:rf-clinical`, `npm run check:rf-boundary`, and
`npm run validate:rf-rules` all pass. No runtime app behavior changed.
