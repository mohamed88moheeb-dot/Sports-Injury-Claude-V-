# RF-SAF-006 — Gate B Draft Rule Object

The sixth pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-006.json](../../lib/clinical/rf/rules/objects/RF-SAF-006.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-006** — "suspected avulsion, full-thickness
injury, or postoperative restriction" (v1.2 §7.7) — as a rehabilitation-blocking / uncertainty rule.
It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-006's **blocking/uncertainty structure**:

- provenance: `source_spec_rule_id: "RF-SAF-006"`, `rule_family: "safety"`, `source_section: "§7.7"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — the five categorical trigger descriptors from §7.7 (reported full-thickness
  proximal injury, avulsion, major retraction, postoperative status, or another condition requiring
  external restrictions), activated only by a **strong current report or anchor**
  (`anchor_source`), with `media_handling` restricted to reported/external descriptors and **no raw
  imaging interpretation**;
- `decision_contract` — set `REHAB_BLOCKED` while the unresolved items (current management
  restrictions, weight-bearing limits, activity limits, external plan) remain; route per actual
  restrictions; do not issue a generic strain plan; no home self-clearance;
- `safety_state_output: "REHAB_BLOCKED"` with `blocked_targets: ["rehab"]`;
- `prohibited_outputs` (see §5);
- `test_fixtures` referencing the relevant v1.2 §17 validation case (case 8).

## 2. What was NOT authored

- No diagnosis of avulsion or full-thickness tear; no surgical advice; no treatment timing; no
  return-to-sport timing; no complete rehab plan; no rehab authorization.
- **No raw-imaging interpretation** — only reported/external diagnosis or restriction descriptors are
  handled, per §7.7's anchor-based trigger and V3.1 §25 media hardening.
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No new clinical content — every field derives from v1.2 §7.7 and the RF-SAF-006 inventory entry.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-006 was authored. (RF-SAF-001 through RF-SAF-005 were consulted
  as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Architecture references and evidence claims preserved

Copied verbatim from v1.2 §7.7 / the inventory — none invented:

- `architecture_refs`: `V3.1-6`, `V3.1-10`, `V3.1-13.1`, `V3.1-13.2`, `V3.1-20`, `V3.1-21`.
- `evidence_claim_ids`: `QRF-012` (C1), `QRF-032` (C1), `QRF-036` (I1). Each claim's individual grade
  is preserved in the object's `notes`; no combined or invented grade was created.

## 5. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `confirm_avulsion`;
- `exclude_avulsion`;
- `confirm_full_thickness_injury`;
- `exclude_full_thickness_injury`;
- `give_surgical_advice`;
- `give_treatment_timing`;
- `give_return_to_sport_timing`;
- `clear_user_for_rehabilitation`;
- `produce_a_complete_rehab_plan`;
- `interpret_raw_imaging`.

These encode §7.7's prohibited inference (no operative-vs-nonoperative choice, no individual timeline
from pooled means) and keep the rule strictly a blocking/uncertainty structure.

## 6. Why rehab is blocked while unresolved

§7.7 requires `REHAB_BLOCKED` while the actual management picture is unknown: current restrictions,
weight-bearing limits, activity limits, or the external plan. A serious structural concern (avulsion
/ full-thickness / postoperative) handled with a generic strain plan could load tissue under external
restrictions the platform cannot see. Blocking rehabilitation until those restrictions are resolved —
and routing per the *actual* restrictions rather than issuing a generic plan — is the conservative,
governed response (V3.1 §§13.1–13.2 prescription gate, §21 closed safety matrix). The block is the
resolvable `REHAB_BLOCKED` state: it clears when the external assessment / referral-resolution object
supplies the missing restrictions, not via any in-app self-clearance.

## 7. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-006 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 6` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-006 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
