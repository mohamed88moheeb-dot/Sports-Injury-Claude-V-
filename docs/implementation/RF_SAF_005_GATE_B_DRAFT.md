# RF-SAF-005 — Gate B Draft Rule Object

The fifth pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-005.json](../../lib/clinical/rf/rules/objects/RF-SAF-005.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-005** — "inability to safely assess" (v1.2
§7.6) — as an uncertainty-preserving safety rule. It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-005's **uncertainty/safety structure**:

- provenance: `source_spec_rule_id: "RF-SAF-005"`, `rule_family: "safety"`, `source_section: "§7.6"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the four categorical trigger signals from §7.6 (cannot understand instructions;
  cannot position safely; cannot distinguish active from passive movement; pain prevents valid
  interpretation), with `missing_or_unsafe_assessment_handling: "record_cannot_assess_never_negative_never_clearance"`;
- `decision_contract` — `record_result: "cannot_assess"`; `must_not_convert_result_to: ["positive","negative"]`;
  the four §7.6 permitted responses (use alternative evidence, widen the relevant uncertainty object,
  block the test, refer when unresolved uncertainty concerns a must-not-miss condition);
  `escalation_to_referral_when` captures the conditional referral; no home self-clearance;
- `safety_state_output: "TEST_BLOCKED"` with `blocked_targets: ["test"]` (see §"Safety-state choice");
- `prohibited_outputs` (see §6);
- `test_fixtures` referencing the relevant v1.2 §17 validation case (case 10).

### Safety-state choice

§7.6 does **not** assign one fixed safety state — it lists conditional responses, one of which is
"block the test." Per task rule 15, the most conservative structurally appropriate **closed** safety
state for "a self-test cannot safely proceed" is `TEST_BLOCKED` (V3.1 §21), so that is used with
`blocked_targets: ["test"]`. The conditional escalation to a referral when the uncertainty concerns a
must-not-miss condition is captured structurally in `decision_contract.escalation_to_referral_when`
**without** asserting it always fires — no clinical meaning invented.

## 2. What was NOT authored

- No diagnosis, rehabilitation, dosage, progression, confidence, or return-to-sport logic.
- **No coercion of `cannot_assess` to positive or negative**, and **no treatment of unknown/missing/
  skipped/painful/unsafe/not-performed assessment as a negative test or as clearance** — these are the
  core prohibitions of §7.6 and V3.1 §9.2.
- No use of missing information to lower concern.
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No invented evidence claim IDs.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-005 was authored. (RF-SAF-001/002/003/004 were consulted as
  structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Architecture references preserved

Copied verbatim from v1.2 §7.6 / the inventory — none invented:

- `architecture_refs`: `V3.1-4`, `V3.1-5`, `V3.1-7`, `V3.1-9`, `V3.1-24`.

## 5. Why there are no evidence claim IDs

RF-SAF-005 is an **architecture-source** rule (it governs how the system handles an unassessable
test, not an RF-specific clinical claim). Per v1.2 §4.3, architecture rules cite `architecture_refs`
and **must not invent** clinical evidence claims. Accordingly, `evidence_claim_ids` is intentionally
`[]` — "none required," not "missing." No QRF IDs were fabricated.

## 6. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `coerce_cannot_assess_to_positive`;
- `coerce_cannot_assess_to_negative`;
- `treat_unknown_as_negative`;
- `treat_missing_assessment_as_clearance`;
- `lower_concern_because_test_not_performed`;
- `clear_user_for_rehabilitation`;
- `produce_a_diagnosis`;
- `produce_a_return_to_sport_decision`.

The first five encode §7.6 / V3.1 §9.2 ("a not-performed test is not a negative result"; unknown is
not negative; missing information cannot read as clearance or lowered concern); the rest keep the rule
strictly an uncertainty/safety structure.

## 7. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-005 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 5` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-005 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
