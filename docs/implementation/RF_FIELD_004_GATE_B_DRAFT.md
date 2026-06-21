# RF-FIELD-004 — Gate B Draft Rule Object

The fourth pending, non-executable Gate B Rectus Femoris (RF) **kicking** rule object has been
authored:
[lib/clinical/rf/rules/objects/RF-FIELD-004.json](../../lib/clinical/rf/rules/objects/RF-FIELD-004.json).

It implements the **structure** of RF v1.2 rule **RF-FIELD-004** — "kicking exposure is a separately
monitored sport-demand domain" (v1.2 §13.5). It is a draft only.

## 1. What was authored

A single machine-readable rule object expressing RF-FIELD-004's **kicking-domain separation and
exposure-monitoring structure**:

- provenance: `source_spec_rule_id: "RF-FIELD-004"`, `rule_family: "kicking"`, `source_section: "§13.5"`;
- `permitted_use: "logic_with_uncertainty"` (primary; dual role captured — see §5);
- `input_contract` — `activation_condition` (where kicking is part of the athlete's demand profile);
  `kicking_progressive_reintroduction_status`; the **exact §13.5 tracking fields** `kicking_leg`,
  `volume`, `intensity`, `technique_or_context`, `chaos`, `data_quality`, `immediate_and_next_day_response`;
  `source_quality_handling`;
- `decision_contract` — `domain_separation_permitted_use: logic_with_uncertainty`;
  `epidemiological_percentage_permitted_use: evidence_record_only`; `domain_transfer_status` (kicking
  separate; running/sprinting/higher-speed tolerance don't clear kicking; kicking tolerance clears no
  other domain); `kicking_ranked_above_sprinting_or_other_demands: false`,
  `kicking_labeled_universal_highest_risk_domain: false`; `mechanism_percentage_authority_status`
  (population-specific, reference-only, not generalizable or individual prediction); evidence-role
  fields; plus `false` flags for kicking progression plan, dosing, exercise selection, field/rehab
  plan, RTT/RTS, progression/readiness from tracking alone, bypass of all upstream field/recur/rehab/
  sev/dx rules, and override of safety/capacity/restrictions/stage/readiness/monitoring/schedule/
  equipment/sport-context/concurrent injury; `defers_to_rf_saf_006…: true`; `safety_precedence_preserved:
  true`; field/readiness objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §17);
- `prohibited_outputs` (see §18);
- `test_fixtures: []` (no §17 case maps specifically to the kicking domain).

## 2. What was NOT authored

- No ranking of kicking above sprinting or other demands; no "universal highest-risk" label.
- No generalization of mechanism/reinjury percentages outside the source population; no individual
  recurrence prediction; no automatic delay/exclusion/regression/priority/progression from percentages.
- No kicking progression schedule; no kicking dosage / sets / reps / weekly frequency / rest intervals /
  intensity targets / duration / work-to-rest ratios / number-of-kicks / kicking volume targets /
  progression increments / return dates / mandatory time windows; no exercise selection; no complete
  field plan; no complete rehab plan; no RTT/RTS; no progression/readiness from kicking-domain tracking
  alone.
- No cross-domain clearance (running/sprinting/higher-speed tolerance never clears kicking; kicking
  tolerance clears no other domain).
- No bypass of RF-FIELD-001/002/003, RF-RECUR-001/002, RF-REHAB-001…006, RF-SEV-005, RF-DX-006, or
  RF-SAF-006; no bypass of safety / capacity / restrictions / stage / readiness / monitoring / schedule
  / equipment / sport-context / concurrent-injury constraints.
- No kicking-exposure or readiness engine — only the separation/monitoring structure is preserved for
  later field, rehab, and readiness objects.
- No invented architecture references.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-FIELD-004 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001/002, and RF-FIELD-001/002/003
  were consulted as structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §13.5 / the inventory — none invented:

- `architecture_refs`: `V3.1-12` (current capacity & capacity-to-demand gap), `V3.1-13` (rehab
  prescription/scheduling/monitoring), `V3.1-14` (tiered return / autonomy boundary).
- `evidence_claim_ids`: `QRF-001` (M1; reference only), `QRF-026` (D2; reference only), `QRF-039` (D3;
  reference only), `QRF-043` (D3; reference only). Each role is preserved in `notes`/`decision_contract`.

## 5. Why this is a mixed-source kicking-domain separation rule

§13.5 is `normative_source: mixed` with a dual permitted use: **logic_with_uncertainty for domain
separation** and **evidence_record_only for epidemiological percentages**. The object records the
primary `permitted_use` (logic_with_uncertainty) and encodes the dual roles structurally
(`domain_separation_permitted_use` / `epidemiological_percentage_permitted_use`).

## 6. What kicking exposure must track (exact §13.5 wording)

Per §13.5, where kicking is part of the demand profile, reintroduce and record it separately for:
**kicking leg, volume, intensity, technique/context, chaos, data quality, and immediate/next-day
response.** The object preserves this **full** source field list (not only the task's
volume/intensity/technique/next-day subset).

## 7. Why kicking must remain separate from running and sprinting

§13.1/§13.5 and RF-RECUR-002 keep exposure domains separate and unranked; kicking loads the rectus
femoris (a biarticular hip-flexor/knee-extensor) differently from running/sprinting. So running,
sprinting, and higher-speed tolerance do **not** clear kicking, and kicking tolerance clears no other
domain (`domain_transfer_status`, the `*_clears_*: false` flags).

## 8. Why kicking may be progressively reintroduced without creating a kicking progression schedule

§13.5 says to "reintroduce and record it separately" — the rule captures *that kicking is reintroduced
progressively and tracked* (`kicking_progressive_reintroduction_status`) but **does not author the
schedule, dose, or thresholds** (`creates_kicking_progression_plan: false`, `creates_kicking_dosing:
false`). §13.5 defines no kicking volume/intensity/technique/next-day thresholds or increments, so none
are invented; the actual progression is decided by separately gated/governed objects (RF-REHAB-004
forbids universal dosing).

## 9. Why mechanism and reinjury percentages are reference-only and population-limited

§13.5's limit is explicit: "population-specific mechanism or recurrence percentages cannot be
generalized." Those percentages describe a specific cohort, not the individual. The object sets
`mechanism_percentage_authority_status` to reference-only / not generalizable / not individual
prediction, and blocks generalizing kicking mechanism/reinjury percentages outside the source
population or using them as automatic delay/exclusion/regression/progression evidence.

## 10. Why QRF-001, QRF-026, QRF-039, and QRF-043 must not become progression or clearance authority

Each is graded reference-only in §13.5 (QRF-001 M1; QRF-026 D2; QRF-039 D3; QRF-043 D3). They provide
mechanism/epidemiological context, not a progression gate or recurrence calculator. The object
preserves each role and blocks treating any of them as kicking-progression authority or individual
recurrence-prediction authority.

## 11. Why kicking must not be universally ranked above other field demands

§13.5's limit states "kicking is not universally ranked above sprinting or other demands," and §17
case 18 makes a universal highest-risk ranking a content-validation failure. The object sets
`kicking_ranked_above_sprinting_or_other_demands: false` and `kicking_labeled_universal_highest_risk_domain:
false`, and blocks ranking kicking above sprinting / above all other demands / as the universal
highest-risk domain.

## 12. Why the rule does not create kicking dosage, field progression, exercise selection, complete plan, RTT, or RTS

A domain-separation/monitoring rule records *what kicking exposure happened*; it does not author the
dose, schedule, exercises, or return decision — those belong to separately gated/governed objects
(V3.1 §§12–14). The object sets `creates_kicking_progression_plan: false`, `creates_kicking_dosing:
false`, `creates_rehab_prescription: false`, `selects_exercises: false`, `selects_complete_field_plan:
false`, `generates_complete_rehab_plan: false`, and `grants_return_to_training_or_return_to_sport_decision:
false`.

## 13. How RF-FIELD-004 relates to RF-FIELD-001, RF-FIELD-002, and RF-FIELD-003

It does not bypass RF-FIELD-001's denominator/pathway-context limits, RF-FIELD-002's 95% MSS
insufficiency boundary, or RF-FIELD-003's higher-speed prerequisite-capacity gating (all `bypasses_…:
false`). Kicking is a distinct field domain alongside running/sprinting; field tolerance in one does
not transfer to kicking.

## 14. How RF-FIELD-004 relates to RF-RECUR-002 and RF-RECUR-001

It honors RF-RECUR-002's separated, unranked exposure-domain monitoring (kicking tracked separately,
never ranked or cross-clearing) and does not bypass RF-RECUR-001 prior-injury recurrence handling (both
`bypasses_…: false`).

## 15. How RF-FIELD-004 relates to RF-REHAB-001 through RF-REHAB-006

Kicking monitoring operates within the gated rehab pipeline, never around it. The object does not
bypass the RF-REHAB-001 prescription-input gate, RF-REHAB-002 loading-dimension constraints,
RF-REHAB-003 position-tag limits, RF-REHAB-004 universal-dosage prohibition, RF-REHAB-005 schedule/
total-load reconciliation, or RF-REHAB-006 concurrent-injury constraints (all `bypasses_…: false`).

## 16. How RF-FIELD-004 relates to RF-SEV-005, RF-DX-006, and RF-SAF-006

It does not bypass RF-SEV-005 (reported-fibrosis/scar provenance) or RF-DX-006 (report / mechanism /
recurrence / kicking-context descriptor handling), and it defers to RF-SAF-006 when serious structural
/ postoperative / full-thickness / avulsion / major-retraction / external-restriction descriptors are
present (`defers_to_rf_saf_006…: true`, `does_not_bypass_rf_saf_006: true`).

## 17. `safety_state_output` and `blocked_targets`, and why this follows §13.5 exactly

Reading §13.5 exactly: it describes **separate kicking-domain monitoring** with reference-only/unranked
limits — it does **not** assign any of the eight closed V3.1 §21 safety states. Per the task's rule,
because §13.5 assigns no closed safety state, `safety_state_output` is `null` and `blocked_targets` is
`[]`, and the kicking-domain separation/monitoring structure is represented entirely in
`decision_contract`. **No safety state was inferred by analogy** (any structural-restriction block is
owned by RF-SAF-006).

## 18. Prohibited outputs

The object's `prohibited_outputs` (70 entries) block, among others: treating running/sprinting/
higher-speed tolerance as kicking clearance or kicking tolerance as clearance for running/sprinting/
cutting/decel/COD/repeated-sprint/fatigue or any other domain; ranking kicking above sprinting / above
all demands / as the universal highest-risk domain; treating QRF-001/026/039/043 as kicking-progression
or individual recurrence-prediction authority; generalizing kicking mechanism/reinjury percentages
outside the source population or using them as automatic delay/exclusion/regression/progression
evidence; creating a kicking progression schedule, kicking dosage, sets-or-reps, weekly frequency, rest
intervals, intensity targets, duration targets, work-to-rest ratios, number-of-kicks targets, kicking
volume targets, progression increments, return dates, mandatory time windows, exercise selection, a
complete field plan, or a complete rehab plan from RF-FIELD-004; authorizing progression or readiness
from kicking-domain tracking alone; bypassing RF-FIELD-001/002/003, RF-RECUR-001/002, RF-REHAB-001…006,
RF-SEV-005, RF-DX-006, or RF-SAF-006; bypassing safety/capacity/restrictions/stage-readiness/monitoring/
schedule/equipment/sport-context/concurrent-injury because kicking-domain tracking exists; and treating
weak / unclear / stale / incomplete / self-reported / unsupervised / context-mismatched kicking-exposure
evidence as high-authority readiness evidence.

## 19. This is not clinical approval

Authoring this object grants it no clinical authority. RF-FIELD-004 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 20. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, RF-RECUR-001 … RF-RECUR-002, and RF-FIELD-001 … RF-FIELD-003 objects remain unchanged

Those thirty-two rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history, rehabilitation, recurrence blocks and RF-FIELD-001/002/003 still hold.

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 33` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-FIELD-004 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
