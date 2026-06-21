# RF-RTS-003 — Gate B Draft (NON-EXECUTABLE, pending)

Source: `Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2` §14.4 — "Readiness-tier honesty and output locks". Object: `lib/clinical/rf/rules/objects/RF-RTS-003.json`.

## 1. What was authored
A structural, non-executable object expressing readiness-tier honesty and output-lock structure: a home-only readiness assessment must not be presented as equivalent to supervised clinical, gym-objective, GPS, force-platform, or laboratory testing; the output must show what was assessed, what was unavailable, and which decisions remain locked.

## 2. What was not authored
No labelling of home-only assessment as supervised clearance, self-reported readiness as objective, incomplete evidence as clearance, or low-authority as high-authority evidence; no tier collapse; no authority upgrade without source support; no RTT/RTS/unrestricted-training/unrestricted-competition clearance.

## 3. Why it is non-executable
`executable: false`, `approval_status: "pending"`. Structure only; no decision logic; not imported into any runtime.

## 4. Architecture references and evidence claims preserved
`architecture_refs: ["V3.1-14.2","V3.1-24.3"]`; `evidence_claim_ids: []` — empty exactly per §14.4 (architecture source). `[]` means "none in source," not "missing."

## 5. Why source type and permitted use were preserved
§14.4 is **architecture** source, **MUST** strength, `permitted_use: logic_with_uncertainty` — preserved exactly. Empty evidence claims follow v1.2 §4.3 for architecture-source rules.

## 6. Exact source behavior preserved
"A home-only readiness assessment must not be presented as equivalent to supervised clinical, gym-objective, GPS, force-platform, or laboratory testing. Show what was assessed, what was unavailable, and which decisions remain locked."

## 7. Exact source limits preserved
Tiers may not be collapsed and output authority may not be upgraded beyond what the source supports; uncertainty must be shown and locked decisions disclosed.

## 8. Why it creates no clearance, dosage, plan, RTT, or RTS
All such outputs are `false` in `decision_contract` and listed in `prohibited_outputs`; the rule encodes an honesty/disclosure boundary only.

## 9–12. Relationship to other RF rules
- **RF-FIELD-001…005:** does not bypass field-exposure limits; a reported tier does not clear a field domain.
- **RF-RECUR-001…002:** does not bypass recurrence handling or separated-exposure monitoring.
- **RF-REHAB-001…006:** does not bypass the prescription gate, loading/position limits, universal-dosage prohibition, schedule reconciliation, or concurrent-injury constraints.
- **RF-SEV-005 / RF-DX-006 / RF-SAF-006:** does not bypass these; defers to RF-SAF-006 on serious concern. Also does not bypass RF-RTS-001/002.

## 13. safety_state_output and blocked_targets
`safety_state_output: null`, `blocked_targets: []`. §14.4 assigns **no** closed V3.1 safety state; the tier-honesty/output-lock structure is represented in `decision_contract`. No state inferred by analogy.

## 14. Prohibited outputs
Home-only-as-supervised, self-reported-as-objective, incomplete-as-clearance, low-as-high-authority, tier collapse, authority upgrade without source support, RTT/RTS/unrestricted-training/unrestricted-competition clearance, unrestricted-training without source-complete multi-domain evidence, single-metric readiness, date/time/cohort → individual clearance, hiding uncertainty, unknown-as-cleared, ignoring deficits, closing the capacity-to-demand gap without evidence, fixed dates/prognosis/dosage/sets/reps/frequency/rest/intensity/duration/work-to-rest/efforts/speed/kicking/return-dates/progression-increments/time-windows, exercise/field-plan selection, complete rehab plan, bypassing RF-FIELD/RECUR/REHAB/SEV-005/DX-006/SAF-006 or any safety/capacity/restriction/stage/readiness/monitoring/schedule/equipment/sport-context/concurrent-injury constraint, and treating weak/stale/self-reported/home-only/single-domain evidence as high-authority readiness evidence.

## 15. Confirmation
This is **not** clinical approval. The object is a pending, non-executable Gate B draft.
