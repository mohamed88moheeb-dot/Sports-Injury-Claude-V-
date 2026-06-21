# RF Rule-Object Validation Scaffold

A **non-executable, structural validator** for the Gate B Rectus Femoris (RF) rule-package
authoring workspace. It checks the *shape, provenance, status discipline, and prohibited-field
patterns* of future rule objects. It does not execute rules and does not judge clinical correctness.

- Schema: [lib/clinical/rf/rules/schema/rfRuleObject.schema.json](../../lib/clinical/rf/rules/schema/rfRuleObject.schema.json)
- Validator: [scripts/validate-rf-rule-package.mjs](../../scripts/validate-rf-rule-package.mjs)
- Run with: `npm run validate:rf-rules`

## 1. What the validator checks

**Package status** (`lib/clinical/rf/rules/rfRulePackageStatus.json`):
- `approval_status` is not `approved`;
- `executable` is `false`;
- `rule_objects_approved` is `0`.

**Template** (`lib/clinical/rf/rules/rfRuleObjectTemplate.json`):
- remains blank (key provenance fields unpopulated) and not executable;
- contains no prohibited-pattern keys.

**Authored objects** (`lib/clinical/rf/rules/objects/*.json`, if the folder exists):
- all required keys are present (`rule_id`, `rule_family`, `source_spec_rule_id`, `approval_status`,
  `permitted_use`, `architecture_refs`, `evidence_claim_ids`, `input_contract`, `decision_contract`,
  `safety_state_output`, `blocked_targets`, `prohibited_outputs`, `test_fixtures`, `notes`);
- `approval_status` ∈ {`pending`, `rejected`, `superseded`} and is **never** `approved`;
- `executable` is not `true`;
- provenance is present and well-formed: `source_spec_rule_id` matches an RF v1.2 ID
  (e.g. `RF-SAF-001`), `architecture_refs` is non-empty, every `evidence_claim_ids` item matches
  `QRF-001` format;
- **prohibited fields are absent** (deep key scan): numeric confidence
  (`confidence_value/score/percent/...`), universal dosage (`sets`, `reps`, `frequency`,
  `intensity`, `rest`, `progression_increment`, ...), fixed return-to-sport dates
  (`return_date`, `return_in_weeks`, or a date/duration value in a return/rts field), and any
  diagnosis-authorizes-plan flag.

## 2. What it does NOT check

- **Clinical correctness** — whether a rule's logic is medically right. That is the clinical
  adjudication process, not this script.
- **Whether the cited IDs are real** — it checks *format* (`RF-…`, `QRF-…`), not that the rule ID or
  claim ID exists in the governed registry. (A future step may cross-check against the registry.)
- **Executable behavior** — it never runs a rule; it cannot, because objects are inert JSON.

## 3. Why it is non-executable

The validator treats every rule object as **data**: it reads the file text and `JSON.parse`s it. It
never `import()`s or `eval`s an object, never wires anything into the app, and uses only built-in
Node modules. The workspace it validates contains `.json`/`.md` only. So running the validator has
no runtime effect on the application.

## 4. Why `approved` is blocked during this phase

RF v1.2 is a **Gate A reconciled candidate**; every rule is `approval_status: pending` and explicitly
**not** authorized for executable release (v1.2 §18, §19). Clinical approval is a separate, formal
adjudication that this tooling must never perform or imply. Allowing `approved` in the authoring
workspace would falsely signal authority the rules do not have, so the schema omits `approved` from
the allowed set and the validator fails on it.

## 5. How it relates to Gate B

RF v1.2 §20 names the next governed step as **Gate B machine-readable authoring** — converting the
accepted rule entries into versioned objects that bind inputs, decisions, `architecture_refs`, and
`evidence_claim_ids`, while keeping each rule `pending`. This validator is the **structural gate**
for that work: it lets authors check an object's shape and provenance and confirm it carries no
prohibited content, before it is ever considered for clinical review. Passing here is a precondition
for Gate B progress, not a substitute for it.

## 6. How to run it

```bash
npm run validate:rf-rules
```

Direct invocation: `node scripts/validate-rf-rule-package.mjs`. Exit `0` = pass, `1` = fail, so it
drops into CI unchanged. With no authored objects yet, it passes and says so. It is complementary to
`npm run check:rf-boundary` (the import-quarantine guard); run both.

## 7. Passing validation is not clinical approval

A green result means **only** that the package status, template, and any authored objects are
structurally well-formed, carry valid-looking provenance, observe status discipline, and contain no
prohibited fields. It does **not** mean any rule is clinically correct, approved, or executable.
Clinical approval (per-rule adjudication) and execution authorization (Gate C, then Gate D
clinical/product validation) are separate governed steps outside this script.
