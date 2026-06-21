# RF-RECUR-002 — Gate B Draft Rule Object

The second and **final** pending, non-executable Gate B Rectus Femoris (RF) **recurrence** rule object
has been authored:
[lib/clinical/rf/rules/objects/RF-RECUR-002.json](../../lib/clinical/rf/rules/objects/RF-RECUR-002.json).

It implements the **structure** of RF v1.2 rule **RF-RECUR-002** — "recurrence-sensitive exposure
domains remain separate and unranked" (v1.2 §10.11). It is a draft only. With this, the recurrence
block (RF-RECUR-001 … RF-RECUR-002) is complete.

## 1. What was authored

A single machine-readable rule object expressing RF-RECUR-002's **separated, unranked exposure-domain
monitoring structure**:

- provenance: `source_spec_rule_id: "RF-RECUR-002"`, `rule_family: "recurrence"`, `source_section: "§10.11"`;
- `permitted_use: "logic_with_uncertainty"`;
- `input_contract` — `exposure_domain_separation_required: true`; the three §10.11
  `exposure_domains_to_track` (kicking; sprinting/high-speed running; long-length or end-range loading);
  the per-domain tracking fields (volume, intensity, technical context, data quality, immediate/next-day
  response); `activation_condition` (only when relevant to the athlete's sport and programme);
  `raw_media_handling`; `source_quality_handling`;
- `decision_contract` — `tracks_exposure_domains_separately: true`;
  `domain_ranking_status: "no_domain_is_labelled_universal_highest_risk_and_domains_are_not_causally_ranked"`;
  `tolerance_of_one_domain_clears_another: false`;
  `passive_overstretch_is_universally_prioritized_reinjury_mechanism: false`;
  `fibrosis_based_slowing_status: "no_exposure_is_slowed_ranked_or_blocked_specifically_because_of_self_reported_fibrosis"`;
  the evidence-role fields (`qrf_020_role`, `qrf_039_role`, `qrf_043_role`); plus `false` flags for all
  rankings, universal delay / fixed setback / fixed timeline / deterministic recurrence-risk score,
  automatic phase/loading/exercise/sprinting/kicking/end-range/RTS change, recurrence/structural
  confirmation, raw-media interpretation, prescription/exercise-selection/plan/RTT/RTS, progression/
  readiness from separation alone, bypass of RF-RECUR-001 / RF-SEV-005 / RF-DX-006 / RF-REHAB-001…006,
  and override of safety/capacity/restrictions/stage/readiness/monitoring/schedule/equipment/concurrent
  injury; `defers_to_rf_saf_006…: true`; `safety_precedence_preserved: true`; field/rehab/readiness
  objects deferred;
- `safety_state_output: null`, `blocked_targets: []` (see §17);
- `prohibited_outputs` (see §18);
- `test_fixtures: ["v1.2-§17-case-18", "v1.2-§17-case-19"]`.

## 2. What was NOT authored

- No "highest-risk" labelling; no ranking of any domain above another; no causal exposure-domain
  ranking; no "three highest-risk recurrence domains" declaration.
- No fibrosis-based slowing; no use of reported fibrosis/scar as exposure priority/delay/exclusion/
  ranking, and no use of RF-SEV-005 reported-fibrosis history as an independent progression modifier.
- No universal delay / fixed setback / fixed RTT or RTS timeline / deterministic recurrence-risk score;
  no automatic phase regression / dosage reduction / exercise exclusion / sprinting/kicking/end-range
  exclusion / RTS exclusion.
- No confirmation of current recurrence, fibrosis, scar, chronic structural pathology, or central-tendon
  pathology from exposure tracking; no raw-media interpretation or risk inference from raw imaging.
- No dosage / sets / reps / weekly frequency / rest intervals / intensity / duration / progression
  increments / return dates; no exercise selection or complete exercise plan; no complete rehab plan;
  no RTT or RTS decision; no progression/readiness from separated tracking alone.
- No bypass of RF-RECUR-001, RF-SEV-005, RF-DX-006, RF-SAF-006, or RF-REHAB-001…006; no bypass of
  safety / capacity / restrictions / stage / readiness / monitoring / schedule / equipment /
  concurrent-injury constraints.
- No recurrence or field-exposure engine — only the separated, unranked monitoring structure is
  preserved for later field, rehab, and readiness objects.
- No approval: `approval_status` stays `"pending"`.
- No other rule object; only RF-RECUR-002 was authored. (RF-SAF-001 … RF-SAF-008, RF-DX-001 …
  RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, and RF-RECUR-001 were consulted as
  structural examples only, not as clinical authority.)

## 3. Why it is non-executable

The object carries `executable: false` and is inert JSON — imported by nothing, wired into no engine,
running no logic. It is a *specification* of the rule's structure for Gate B review, not an
implementation. The validator (`npm run validate:rf-rules`) treats it as data only and never executes
it.

## 4. Which architecture references and evidence claims were preserved

Copied verbatim from v1.2 §10.11 / the inventory — none invented:

- `architecture_refs`: `V3.1-12` (current capacity & capacity-to-demand gap), `V3.1-13` (rehab
  prescription/scheduling/monitoring), `V3.1-14` (media analysis / tiered return / autonomy boundary).
- `evidence_claim_ids`: `QRF-020` (E1), `QRF-039` (D3, reference-only), `QRF-043` (D3, reference-only).
  Each grade and role is preserved in `notes` / `decision_contract`.

## 5. Why this rule is a mixed-source recurrence exposure-domain rule

§10.11 is `normative_source: mixed` — it combines an **architecture** requirement (how exposure domains
are tracked/monitored; V3.1 §§12–14) with **evidence-governed** restrictions (QRF-020/039/043, plus the
explicit unranked / passive-stretch / fibrosis restrictions) that bound what the tracking may imply.

## 6. Which exposure domains are tracked separately (exact §10.11 wording)

Per §10.11, when relevant to the athlete's sport and programme: **kicking, sprinting/high-speed running,
and long-length or end-range loading**, each with its own **volume, intensity, technical context, data
quality, and immediate/next-day response**.

## 7. Why exposure domains remain separate and unranked

§10.11 states "no domain is labelled the universal 'highest risk'" and "tolerance of one does not clear
another." Each domain stresses the rectus femoris differently and must be earned on its own evidence;
collapsing them into a ranking would let progress in one falsely vouch for another. The object sets
`tracks_exposure_domains_separately: true`, `domain_ranking_status: "…not_causally_ranked"`, and
`tolerance_of_one_domain_clears_another: false`, and blocks every ranking output.

## 8. Why there must be no "highest-risk" language

The reconciled evidence does not support a universal highest-risk ordering, and §17 case 18 makes
ranking the domains as universal highest-risk a content-validation failure. The object sets
`declares_three_highest_risk_recurrence_domains: false` and blocks declaring explosive kicking, passive
overstretch, and sprinting as the three highest-risk domains, plus all pairwise rankings.

## 9. Why QRF-039 and QRF-043 remain reference-only

§10.11 tags both QRF-039 (D3) and QRF-043 (D3) as "reference only." They provide background context, not
a comparative risk ordering or a progression driver. The object sets each role to
`reference_only_not_comparative_exposure_risk_or_decision_driving_progression_authority` and blocks
treating either as comparative exposure-risk or decision-driving progression authority.

## 10. Why QRF-020 must not become comparative exposure-risk authority

QRF-020 (E1) supports the *loading-dimension ontology* (see RF-REHAB-002), not a ranking of which
exposure is riskier. The object sets
`qrf_020_role: "loading_dimension_ontology_reference_only_not_comparative_exposure_risk_authority"` and
blocks treating QRF-020 as comparative exposure-risk authority.

## 11. Why reported fibrosis/scar must not create fibrosis-based slowing or exposure ranking

§10.11's fibrosis restriction is explicit: "no exposure is slowed, ranked, or blocked specifically
because of self-reported fibrosis" — and §17 case 19 makes asserting passive overstretch as a universal
recurrent-RF mechanism a content-validation failure. Consistent with RF-SEV-005 (reported fibrosis is
history-only) and RF-RECUR-001, the object sets `fibrosis_based_slowing_status: "no_exposure_is_slowed_ranked_or_blocked…"`,
`uses_reported_fibrosis_as_exposure_priority_delay_exclusion_or_ranking: false`, and
`uses_rf_sev_005_reported_fibrosis_history_as_independent_progression_modifier: false`, and blocks each.

## 12. Why the rule does not create dosage, exercise selection, progression, complete plan, RTT, or RTS

Separate monitoring tracks *what happened* per exposure; it does not author the dose, exercises,
progression, or return — those belong to separately gated/governed objects (V3.1 §§12–14; RF-REHAB-004
forbids universal dosing). The object sets `creates_rehab_prescription: false`, `selects_exercises:
false`, `selects_complete_exercise_plan: false`, `generates_complete_rehab_plan: false`,
`grants_return_to_training_or_return_to_sport_decision: false`,
`authorizes_progression_from_exposure_domain_separation_alone: false`, and
`uses_separated_exposure_tracking_alone_as_readiness: false`.

## 13. How RF-RECUR-002 relates to RF-RECUR-001

RF-RECUR-001 governs *prior-injury* recurrence handling (history fields, recurrence-relevant marking,
no universal delay); RF-RECUR-002 governs *exposure-domain* monitoring (separate, unranked tracking).
RF-RECUR-002 does not bypass RF-RECUR-001 (`bypasses_rf_recur_001_…: false`,
`does_not_override_rf_recur_001: true`) — the two are complementary recurrence rules.

## 14. How RF-RECUR-002 relates to RF-SEV-005 and RF-DX-006

- **RF-SEV-005** owns reported-fibrosis/scar provenance; RF-RECUR-002 must not use that history to
  slow/rank/exclude exposures and does not bypass it (`bypasses_rf_sev_005_…: false`).
- **RF-DX-006** owns report/imaging descriptor handling; where prior injury / imaging / report
  descriptors are involved, RF-RECUR-002 does not bypass it (`bypasses_rf_dx_006_…: false`).

## 15. How RF-RECUR-002 relates to RF-SAF-006

If serious structural / postoperative / full-thickness / avulsion / major-retraction / external-restriction
descriptors are present, that is governed by **RF-SAF-006**; the object
`defers_to_rf_saf_006_on_serious_structural_or_restriction_concern: true`, `does_not_bypass_rf_saf_006:
true`, and `does_not_override_rf_saf_006: true`.

## 16. How RF-RECUR-002 relates to RF-REHAB-001 through RF-REHAB-006

Exposure-domain monitoring operates within the gated rehab pipeline, never around it. The object does
not bypass the RF-REHAB-001 prescription-input gate, RF-REHAB-002 loading-dimension constraints,
RF-REHAB-003 position-tag limits, RF-REHAB-004 universal-dosage prohibition, RF-REHAB-005 schedule/
total-load reconciliation, or RF-REHAB-006 concurrent-injury constraints (all `bypasses_…: false`).

## 17. `safety_state_output` and `blocked_targets`, and why this follows §10.11 exactly

Reading §10.11 exactly: it describes **separate, unranked exposure-domain monitoring** with explicit
unranked / passive-stretch / fibrosis restrictions — it does **not** assign any of the eight closed
V3.1 §21 safety states. Per the task's rule, because §10.11 assigns no closed safety state,
`safety_state_output` is `null` and `blocked_targets` is `[]`, and the monitoring structure is
represented entirely in `decision_contract`. **No safety state was inferred by analogy** (any
structural-restriction block is owned by RF-SAF-006).

## 18. Prohibited outputs

The object's `prohibited_outputs` (74 entries) block, among others: ranking the exposure domains as
highest-risk, kicking vs sprinting either way, passive overstretch / end-range / lengthened-position
above sprinting or kicking, any causal ranking, or the "three highest-risk" declaration; treating
QRF-020/039/043 as comparative exposure-risk authority or QRF-039/043 as decision-driving progression
authority; creating fibrosis-based slowing or using reported fibrosis/scar as exposure priority/delay/
exclusion/ranking or RF-SEV-005 history as an independent progression modifier; creating a universal
delay / fixed setback / fixed RTT or RTS timeline / deterministic recurrence-risk score / automatic
phase/dosage/exercise/sprinting/kicking/end-range/RTS change from exposure tracking; confirming
recurrence/fibrosis/scar/chronic or central-tendon pathology from exposure tracking; interpreting raw
MRI/ultrasound/DICOM/screenshots/images/photos/videos or inferring risk from raw imaging; creating
dosage/sets-or-reps/frequency/rest/intensity/duration/progression-increments/return-dates, selecting
exercises or a complete plan, producing a complete rehab plan, or producing an RTT/RTS decision from
RF-RECUR-002; progression/readiness from separated tracking alone; bypassing RF-RECUR-001 / RF-SEV-005
/ RF-DX-006 / RF-SAF-006 / RF-REHAB-001…006; bypassing safety/capacity/restrictions/stage-readiness/
monitoring/schedule/equipment/concurrent-injury because exposure domains are tracked; and treating
weak/self-reported/unclear/incomplete/undocumented exposure-domain history as high-authority recurrence
evidence.

## 19. This is not clinical approval

Authoring this object grants it no clinical authority. RF-RECUR-002 remains a Gate A candidate,
`approval_status: pending`, and non-executable. Clinical approval (per-rule adjudication) and
execution authorization (Gate C, then Gate D clinical/product validation) are separate governed
processes that this draft does not perform or imply.

## 20. RF-SAF-001 … RF-SAF-008, RF-DX-001 … RF-DX-008, RF-SEV-001 … RF-SEV-005, RF-REHAB-001 … RF-REHAB-006, and RF-RECUR-001 objects remain unchanged

Those twenty-eight rule objects were **not** modified by this task. Their files are byte-for-byte
identical before and after (verified by checksum), so the reconciled safety, diagnosis,
severity/prognosis/history, rehabilitation blocks and RF-RECUR-001 still hold.

## 21. The recurrence block RF-RECUR-001 … RF-RECUR-002 is now complete

Both recurrence rules are drafted: RF-RECUR-001 (prior-injury recurrence handling without a universal
delay) and RF-RECUR-002 (separate, unranked recurrence-sensitive exposure domains). The package now
holds 29 authored objects across safety (8), diagnosis (8), severity/prognosis/history (5),
rehabilitation (6), and recurrence (2).

## Tracking updates

- `lib/clinical/rf/rules/rfRulePackageStatus.json`: `rule_objects_authored: 29` (approved stays `0`,
  `approval_status: not_approved`, `executable: false`).
- `lib/clinical/rf/rules/source/rfV12RuleInventory.json` (RF-RECUR-002 entry only):
  `has_machine_readable_object: true`, `gate_b_status: "draft_authored_pending_validation"`.

---

**Verification:** the object is JSON-valid, passes `npm run validate:rf-rules`, and stays pending /
non-executable. `npm run check:rf-clinical` and `npm run check:rf-boundary` pass. No runtime app
behavior changed.
