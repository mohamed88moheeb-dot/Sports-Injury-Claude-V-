# RF-SAF-003 — Gate B Draft Rule Object

The third pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-003.json](../../lib/clinical/rf/rules/objects/RF-SAF-003.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-003** — "delayed deterioration" (v1.2 §7.4)
— as a safety escalation / referral trigger. It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-003's **safety-escalation structure**:

- provenance: `source_spec_rule_id: "RF-SAF-003"`, `rule_family: "safety"`, `source_section: "§7.4"`;
- `permitted_use: "safety_referral_trigger"`;
- `input_contract` — the six categorical trigger signals from §7.4 (new/worsening severe pain,
  swelling, tightness, weakness, sensory change, functional decline) after an initially stable period
  following significant thigh trauma; `applies_regardless_of_time_since_injury: true`;
  `reopens_prior_safety_states: ["CLEAR", "CLEAR_WITH_MONITORING"]`; unknown-is-unsafe;
- `decision_contract` — re-enter the urgent/emergency safety pathway; `prior_clear_does_not_suppress_new_screen: true`;
  minimum safety state `URGENT_REFERRAL`; escalate to emergency when the global ontology requires it;
  referral required; clearance only via external assessment + referral-resolution object; no home
  self-clearance;
- `safety_state_output: "URGENT_REFERRAL"` with `blocked_targets: ["all"]` (per V3.1 §21);
- `prohibited_outputs` (see §5);
- `test_fixtures` referencing the relevant v1.2 §17 validation case (case 5).

The reopen-safety requirement is expressed structurally via
`reopens_prior_safety_states: ["CLEAR", "CLEAR_WITH_MONITORING"]` and
`prior_clear_does_not_suppress_new_screen: true`, matching v1.2 §7.4 and V3.1 §7.3 (safety status is
a live property, not a one-time stamp).

## 2. What was NOT authored

- No diagnosis, rehabilitation, dosage, progression, confidence, or return-to-sport logic.
- **No fixed observation period and no "wait and see" clearance** — explicitly prohibited by v1.2 §7.4
  ("not an incidence estimate or fixed timing rule").
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No new clinical content — every field derives from v1.2 §7.4 and the RF-SAF-003 inventory entry.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-003 was authored. (RF-SAF-001.json and RF-SAF-002.json were
  consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Evidence claims and architecture references preserved

Copied verbatim from v1.2 §7.4 / the inventory — none invented:

- `architecture_refs`: `V3.1-7`, `V3.1-21`.
- `evidence_claim_ids`: `QRF-018` (C1). The claim's individual grade is preserved in the object's
  `notes`; no combined or invented grade was created.

## 5. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `preserve_prior_clear_despite_delayed_deterioration`;
- `wait_and_see_clearance`;
- `fixed_observation_period`;
- `confirm_acute_compartment_syndrome`;
- `exclude_acute_compartment_syndrome`;
- `clear_user_for_rehabilitation`;
- `produce_a_diagnosis`;
- `produce_a_return_to_sport_decision`.

The first three encode v1.2 §7.4's limits (a prior CLEAR must not suppress the new screen; no fixed
timing rule / observation period; no wait-and-see clearance); the ACS blocks keep the rule from
confirming or excluding compartment syndrome; the rest keep it strictly a safety-escalation trigger.

## 6. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-003 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 3` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-003 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
