# RF-SAF-004 — Gate B Draft Rule Object

The fourth pending, non-executable Gate B Rectus Femoris (RF) rule object has been authored:
[lib/clinical/rf/rules/objects/RF-SAF-004.json](../../lib/clinical/rf/rules/objects/RF-SAF-004.json).

It implements the **structure** of RF v1.2 rule **RF-SAF-004** — "suspected vascular or neurological
compromise" (v1.2 §7.5) — as a platform-wide safety escalation / referral trigger. It is a draft
only.

## 1. What was authored

A single machine-readable rule object expressing RF-SAF-004's **safety-escalation structure**:

- provenance: `source_spec_rule_id: "RF-SAF-004"`, `rule_family: "safety"`, `source_section: "§7.5"`;
- `permitted_use: "safety_referral_trigger"`;
- `input_contract` — the six categorical trigger signals quoted in meaning from §7.5 (new numbness;
  progressive weakness not explained by pain; cold or pale limb; absent or markedly altered pulse;
  uncontrolled bleeding; rapidly expanding swelling), tagged `normative_source: "architecture"` and
  `scope: "platform_wide_trauma_safety_not_rf_specific_claim"`; unknown-is-unsafe;
- `decision_contract` — apply the global emergency/urgent ontology; block testing, rehabilitation,
  and readiness; minimum safety state `URGENT_REFERRAL`; escalate to emergency when the global
  ontology requires it; referral required; clearance only via external assessment +
  referral-resolution object; no home self-clearance;
- `safety_state_output: "URGENT_REFERRAL"` with `blocked_targets: ["all"]` (per V3.1 §21);
- `prohibited_outputs` (see §6);
- `test_fixtures: []` (no dedicated §17 case is enumerated for this platform-wide rule).

## 2. What was NOT authored

- No diagnosis, rehabilitation, dosage, progression, confidence, or return-to-sport logic.
- **No invented clinical signs** beyond the exact §7.5 source wording, and **no invented evidence
  claim IDs**.
- No numeric confidence, sets/reps/frequency/rest, return dates, or progression increments.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-SAF-004 was authored. (RF-SAF-001/002/003 were consulted as
  structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Architecture references preserved

Copied verbatim from v1.2 §7.5 / the inventory — none invented:

- `architecture_refs`: `V3.1-7.1`, `V3.1-7.2`, `V3.1-7.3`, `V3.1-21`.

## 5. Why there are no evidence claim IDs

RF-SAF-004 is an **architecture-source** rule. v1.2 §7.5 states its evidence handling explicitly:
"this is platform-wide trauma safety, not an RF-specific clinical claim." Per v1.2 §4.3, architecture
rules cite `architecture_refs` and **need not (must not) invent** clinical evidence claims.
Accordingly, `evidence_claim_ids` is intentionally `[]` — meaning "none required," not "missing." No
QRF IDs were fabricated.

## 6. Prohibited outputs

The object's `prohibited_outputs` explicitly block:

- `confirm_vascular_compromise`;
- `exclude_vascular_compromise`;
- `confirm_neurological_compromise`;
- `exclude_neurological_compromise`;
- `clear_user_for_rehabilitation`;
- `produce_an_rf_diagnosis`;
- `produce_a_return_to_sport_decision`;
- `treat_as_rf_specific_diagnostic_evidence`.

The compromise confirm/exclude blocks keep the rule from asserting or ruling out vascular or
neurological compromise; the final block enforces §7.5's evidence handling (this is platform-wide
trauma safety, never RF-specific diagnostic evidence); the rest keep it strictly a safety-escalation
trigger.

## 7. This is not clinical approval

Authoring this object grants it no clinical authority. RF-SAF-004 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 4` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-SAF-004 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
