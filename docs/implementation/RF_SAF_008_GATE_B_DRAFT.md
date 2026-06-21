# RF-SAF-008 — Gate B Draft Rule Object

The eighth pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-008.json](../../lib/clinical/rf/rules/objects/RF-SAF-008.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-008** — "new red flags during
rehabilitation" (v1.2 §7.9) — as a safety-override rule. It is a draft only. With this, the entire
safety block (RF-SAF-001 … RF-SAF-008) is drafted.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-008's **safety-override structure**:

- provenance: `source_spec_rule_id: "RF-SAF-008"`, `rule_family: "safety"`, `source_section: "§7.9"`;
- `permitted_use: "safety_referral_trigger"`;
- `input_contract` — the two categorical trigger signals from §7.9 (new urgent symptom; new emergency
  symptom) across the three `detection_windows` (during session, later same day, next-day check-in);
- `decision_contract` — stop the plan and re-run safety; the new safety state overrides
  `phase`, `progression`, `prior_positive_trends`, `plan_confidence`, and `readiness`;
  `do_not_continue_progression_while_unresolved: true`;
  `do_not_treat_as_routine_soreness_or_regression: true`; referral required; no home self-clearance;
- `safety_state_output: "URGENT_REFERRAL"` with `blocked_targets: ["all"]` (see §"Safety-state choice");
- `prohibited_outputs` (see §6);
- `test_fixtures: []` (no §17 case maps cleanly to a new-red-flag-during-rehab path).

### Safety-state choice

§7.9 does **not** assign one fixed safety state — it directs a safety **re-run** and lets the
*resulting* state override prior phase/progression/trends. Per task rule 12, the most conservative
structurally appropriate **closed** state for a new urgent/emergency symptom is `URGENT_REFERRAL`
(terminal; `blocked_targets: all`; V3.1 §21), with escalation to `EMERGENCY_SIGNPOSTING` when the
global emergency ontology is met — captured structurally in `decision_contract` without inventing
clinical meaning.

## 2. What was NOT authored

- No diagnosis, rehabilitation authorization, complete rehab plan, or return-to-sport decision.
- No treatment of new red flags as normal soreness, expected irritation, or a routine regression
  event; no continuation of progression while the red flag is unresolved; no mere phase-preserving
  regression.
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No invented evidence claim IDs.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-008 was authored. (RF-SAF-001 through RF-SAF-007 were consulted
  as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Architecture references preserved

Copied verbatim from v1.2 §7.9 / the inventory — none invented:

- `architecture_refs`: `V3.1-7.2`, `V3.1-7.3`, `V3.1-13.4`, `V3.1-21`, `V3.1-22`.

## 5. Why there are no evidence claim IDs

RF-SAF-008 is an **architecture-source** rule (it governs how the system reacts when a new red flag
appears mid-rehab, not an RF-specific clinical claim). Per v1.2 §4.3, architecture rules cite
`architecture_refs` and **must not invent** clinical evidence claims. Accordingly,
`evidence_claim_ids` is intentionally `[]` — "none required," not "missing." No QRF IDs were
fabricated.

## 6. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `continue_rehab_progression_despite_new_red_flags`;
- `treat_new_red_flags_as_routine_soreness`;
- `treat_new_red_flags_as_routine_regression_only`;
- `preserve_current_rehab_phase_despite_new_red_flags`;
- `clear_user_for_rehabilitation`;
- `produce_a_diagnosis`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`;
- `add_numeric_confidence`;
- `add_unsupported_dosage_or_timing`.

## 7. Why new red flags during rehab override phase/progression/trends

Rehabilitation runs on the assumption that the injury is settling. A new urgent or emergency symptom
breaks that assumption: a prior `CLEAR` state and a string of positive sessions are *historical* and
cannot vouch for the new presentation (V3.1 §7.3 — safety status is a live property, not a one-time
stamp). If the engine kept progressing, kept the current phase, or read the event as routine
soreness, it could load tissue while a serious problem develops. So §7.9 requires the plan to stop,
safety to re-run, and the **new** safety state to take precedence over phase, progression, prior
positive trends, plan confidence, and readiness — consistent with the prescription-gate dependency
(V3.1 §13.4) and the wire cross-object invariants (V3.1 §22), where a terminal safety state cannot
coexist with a full plan.

## 8. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-008 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 8` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-008 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
