# RF-RTS-004 — Gate B Draft (NON-EXECUTABLE, pending)

Source: `Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2` §14.5 — "Outstanding performance deficits remain active targets". Object: `lib/clinical/rf/rules/objects/RF-RTS-004.json`.

## 1. What was authored
A structural, non-executable object expressing only that symptom resolution or medical improvement does **not** end rehabilitation while the capacity-to-demand gap remains open — Resilience continues to target outstanding performance, workload, and robustness deficits.

## 2. What was not authored
No ignoring of outstanding deficits; no closing the capacity-to-demand gap without evidence; no treating unresolved deficits as cleared; no treating Resilience work as optional; no conversion of deficits into automatic RTS denial; no invented performance/strength/speed/kicking targets; no fixed plan, dosage, exercise selection, progression schedule, RTT, or RTS.

## 3. Why it is non-executable
`executable: false`, `approval_status: "pending"`. Structure only; no decision logic; not imported into any runtime.

## 4. Architecture references and evidence claims preserved
`architecture_refs: ["V3.1-12","V3.1-13.3","V3.1-14.2"]`; `evidence_claim_ids: []` — empty exactly per §14.5 (architecture source). `[]` means "none in source," not "missing."

## 5. Why source type and permitted use were preserved
§14.5 is **architecture** source, **MUST** strength, `permitted_use: logic_with_uncertainty` — preserved exactly. Empty evidence claims follow v1.2 §4.3 for architecture-source rules.

## 6. Exact source behavior preserved
"Symptom resolution or medical improvement does not end rehabilitation when the capacity-to-demand gap remains open. Resilience continues to target outstanding performance, workload, and robustness deficits."

## 7. Exact source limits preserved
Deficits remain **active targets** while the gap is open; the gap is not closed without evidence, and unresolved deficits are not treated as cleared. The source does **not** assign automatic RTS denial, so the object does not create one.

## 8. Why it creates no clearance, dosage, plan, RTT, or RTS
All such outputs are `false` in `decision_contract` and listed in `prohibited_outputs`; the rule encodes a continuation/active-target boundary only — neither a clearance nor an automatic denial.

## 9–12. Relationship to other RF rules
- **RF-FIELD-001…005:** does not bypass field-exposure limits or the sprint-ratio prohibition; outstanding deficits remain regardless of field exposure.
- **RF-RECUR-001…002:** does not bypass recurrence handling or separated-exposure monitoring.
- **RF-REHAB-001…006:** does not bypass the prescription gate, loading/position limits, universal-dosage prohibition, schedule reconciliation, or concurrent-injury constraints.
- **RF-SEV-005 / RF-DX-006 / RF-SAF-006:** does not bypass these; defers to RF-SAF-006 on serious concern. Also does not bypass RF-RTS-001/002/003.

## 13. safety_state_output and blocked_targets
`safety_state_output: null`, `blocked_targets: []`. §14.5 assigns **no** closed V3.1 safety state (and explicitly no automatic RTS denial); the outstanding-deficit continuation structure is represented in `decision_contract`. No state inferred by analogy.

## 14. Prohibited outputs
Ignoring deficits, closing the capacity-to-demand gap without evidence, treating unresolved deficits as cleared, treating Resilience as optional, converting deficits into automatic RTS denial, invented performance/strength/speed/kicking targets, fixed training plan, single-metric readiness, home-only-as-supervised, unrestricted-training without source-complete multi-domain evidence, RTT/RTS clearance, date/time/cohort → individual clearance, hiding uncertainty, unknown-as-cleared, fixed dates/prognosis/dosage/sets/reps/frequency/rest/intensity/duration/work-to-rest/efforts/speed/kicking/return-dates/progression-increments/time-windows, exercise/field-plan selection, complete rehab plan, bypassing RF-FIELD/RECUR/REHAB/SEV-005/DX-006/SAF-006 or any safety/capacity/restriction/stage/readiness/monitoring/schedule/equipment/sport-context/concurrent-injury constraint, and treating weak/stale/self-reported/home-only/single-domain evidence as high-authority readiness evidence.

## 15. Confirmation
This is **not** clinical approval. The object is a pending, non-executable Gate B draft.
