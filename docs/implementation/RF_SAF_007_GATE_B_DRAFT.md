# RF-SAF-007 — Gate B Draft Rule Object

The seventh pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-007.json](../../lib/clinical/rf/rules/objects/RF-SAF-007.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-007** — "direct-contusion branch" (v1.2
§7.8) — as a branch-routing / uncertainty rule. It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-007's **branch-routing structure**:

- provenance: `source_spec_rule_id: "RF-SAF-007"`, `rule_family: "safety"`, `source_section: "§7.8"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the two categorical trigger signals from §7.8 (direct blow as the dominant
  mechanism; localized impact symptoms);
- `decision_contract` — route to the quadriceps-contusion branch and apply its complication screen
  **only if an approved module exists**; retain RF strain as a secondary possibility only when
  evidence supports a mixed presentation; `no_branch_behavior` = OUT_OF_SCOPE + external signposting;
  `do_not_force_into_rf_strain_pathway: true`; `do_not_create_contusion_module: true`;
- `safety_state_output: "OUT_OF_SCOPE"` with `blocked_targets: ["all"]` (see §"Safety-state choice");
- `prohibited_outputs` (see §5);
- `test_fixtures: []` (no §17 case maps cleanly to the no-approved-module routing path).

### Safety-state choice

§7.8 explicitly assigns `OUT_OF_SCOPE` with `blocked_targets: all` for the no-branch case ("if no
approved contusion module exists ... signpost external assessment rather than forcing the
presentation into the RF strain pathway"). Because no approved contusion module exists in this build,
the conservative structurally appropriate closed state is `OUT_OF_SCOPE` (terminal; V3.1 §21). The
conditional routing to a contusion branch when an approved module *does* exist is captured
structurally in `decision_contract` without asserting that such a module exists.

## 2. What was NOT authored

- No contusion module; no contusion diagnosis; no RF strain diagnosis; no rehab authorization; no
  complete rehab plan; no return-to-sport decision.
- No home thigh-girth threshold and no numeric swelling threshold.
- No claim that acute compartment syndrome is confirmed or excluded.
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No new clinical content — every field derives from v1.2 §7.8 and the RF-SAF-007 inventory entry.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-007 was authored. (RF-SAF-001 through RF-SAF-006 were consulted
  as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Architecture references and evidence claims preserved

Copied verbatim from v1.2 §7.8 / the inventory — none invented:

- `architecture_refs`: `V3.1-3.1`, `V3.1-7`, `V3.1-15`.
- `evidence_claim_ids`: `QRF-015` (D2), `QRF-016` (D2), `QRF-017` (C1). Each claim's individual grade
  is preserved in the object's `notes`; no combined or invented grade was created.

## 5. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `force_direct_contusion_mechanism_into_rf_strain_logic`;
- `diagnose_contusion`;
- `diagnose_rf_strain`;
- `create_a_contusion_module`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `produce_a_return_to_sport_decision`;
- `use_home_thigh_girth_threshold`;
- `use_numeric_swelling_threshold`;
- `confirm_acute_compartment_syndrome`;
- `exclude_acute_compartment_syndrome`.

## 6. Why direct-contusion presentations must not be forced into RF strain logic

A direct blow (contusion / "dead leg") is a different injury class from an indirect RF muscle-tendon
strain. v1.2 §3.2 lists direct quadriceps contusion as *limited handling only*, and §7.8 requires
routing it to a dedicated contusion branch with its own complication screen (e.g. for myositis
ossificans or compartment-syndrome risk). Forcing a contusion into the RF strain pathway would apply
the wrong assessment and could miss contusion-specific complications. When no approved contusion
branch exists, the safe governed response is `OUT_OF_SCOPE` + external signposting — not a forced RF
strain output. RF strain is retained only as a secondary possibility when evidence supports a genuinely
mixed presentation.

## 7. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-007 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 7` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-007 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
