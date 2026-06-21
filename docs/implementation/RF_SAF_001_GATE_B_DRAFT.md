# RF-SAF-001 — Gate B Draft Rule Object

The first pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-001.json](../../lib/clinical/rf/rules/objects/RF-SAF-001.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-001** — "disproportionate pain or
passive-movement pain after significant trauma" (v1.2 §7.2) — as a safety escalation / referral
trigger. It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-001's **safety-escalation structure**:

- provenance: `source_spec_rule_id: "RF-SAF-001"`, `rule_family: "safety"`, `source_section: "§7.2"`;
- `permitted_use: "safety_referral_trigger"`;
- `input_contract` — the three categorical trigger signals from §7.2 (pain disproportionate to the
  apparent injury, rapidly escalating pain, pain worsened by passive movement) in the context of
  significant thigh trauma / acute limb concern, with `unknown_handling` set to treat a safety
  unknown as unsafe;
- `decision_contract` — stop self-testing and rehabilitation; minimum safety state `URGENT_REFERRAL`;
  escalate to emergency only when the global emergency ontology is met; referral required; clearance
  only via external assessment + referral-resolution object; no home self-clearance;
- `safety_state_output: "URGENT_REFERRAL"` with `blocked_targets: ["all"]` (per V3.1 §21);
- `prohibited_outputs` (see §5);
- `test_fixtures` referencing the relevant v1.2 §17 validation cases (3 and 4).

## 2. What was NOT authored

- No diagnosis, rehabilitation, dosage, progression, confidence, or return-to-sport logic.
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No new clinical content — every field derives from v1.2 §7.2 and the RF-SAF-001 inventory entry.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-001 was authored.

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — it is imported by nothing, wired into no
engine, and runs no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never
executes it.

## 4. Evidence claims and architecture references preserved

Copied verbatim from v1.2 §7.2 / the inventory — none invented:

- `architecture_refs`: `V3.1-7`, `V3.1-20`, `V3.1-21`, `V3.1-22`.
- `evidence_claim_ids`: `QRF-014` (C1), `QRF-037` (E1), `QRF-038` (E1). Each claim's individual grade
  is preserved in the object's `notes`; no combined or invented grade was created.

## 5. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `confirm_acute_compartment_syndrome`;
- `exclude_acute_compartment_syndrome`;
- `clear_user_for_rehabilitation`;
- `produce_a_diagnosis`;
- `produce_a_return_to_sport_decision`.

The first two encode v1.2 §7.2's prohibited inference ("do not state that compartment syndrome is
confirmed or excluded"); the rest keep the rule strictly a safety-escalation trigger.

## 6. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-001 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 1` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-001 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
