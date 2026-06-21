# RF-SAF-002 — Gate B Draft Rule Object

The second pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-002.json](../../lib/clinical/rf/rules/objects/RF-SAF-002.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-002** — "progressive swelling or tightness
after major trauma" (v1.2 §7.3) — as a safety escalation / referral trigger. It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-002's **safety-escalation structure**:

- provenance: `source_spec_rule_id: "RF-SAF-002"`, `rule_family: "safety"`, `source_section: "§7.3"`;
- `permitted_use: "safety_referral_trigger"`;
- `input_contract` — the four categorical trigger signals from §7.3 (progressive swelling, increasing
  tightness, worsening function, materially worsening symptoms) in the context of major thigh trauma,
  with `unknown_handling` set to treat a safety unknown as unsafe;
- `decision_contract` — stop loading and loading/stretching thigh self-tests; minimum safety state
  `URGENT_REFERRAL`; escalate to emergency only when the global emergency ontology requires it;
  referral required; clearance only via external assessment + referral-resolution object; no home
  self-clearance;
- `safety_state_output: "URGENT_REFERRAL"` with `blocked_targets: ["all"]` (per V3.1 §21);
- `prohibited_outputs` (see §5);
- `test_fixtures` referencing the relevant v1.2 §17 validation case (case 2).

## 2. What was NOT authored

- No diagnosis, rehabilitation, dosage, progression, confidence, or return-to-sport logic.
- **No numeric swelling threshold, no home thigh-girth threshold, no measurement interval, and no
  safe observation period** — these are explicitly prohibited by v1.2 §7.3.
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No new clinical content — every field derives from v1.2 §7.3 and the RF-SAF-002 inventory entry.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-002 was authored. (RF-SAF-001.json was consulted as a structural
  example only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Evidence claims and architecture references preserved

Copied verbatim from v1.2 §7.3 / the inventory — none invented:

- `architecture_refs`: `V3.1-7`, `V3.1-20`, `V3.1-21`.
- `evidence_claim_ids`: `QRF-017` (C1). The claim's individual grade is preserved in the object's
  `notes`; no combined or invented grade was created.

## 5. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `confirm_acute_compartment_syndrome`;
- `exclude_acute_compartment_syndrome`;
- `use_home_thigh_girth_threshold`;
- `use_numeric_swelling_threshold`;
- `clear_user_for_rehabilitation`;
- `produce_a_diagnosis`;
- `produce_a_return_to_sport_decision`.

The thigh-girth and numeric-swelling blocks encode v1.2 §7.3's prohibited inference (no universal
thigh-girth threshold / home measurement interval / safe observation period); the ACS blocks keep the
rule from confirming or excluding compartment syndrome; the rest keep it strictly a safety-escalation
trigger.

## 6. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-002 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 2` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-002 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
