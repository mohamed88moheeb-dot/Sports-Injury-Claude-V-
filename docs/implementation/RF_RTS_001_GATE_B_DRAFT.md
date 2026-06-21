# RF-RTS-001 — Gate B Draft (NON-EXECUTABLE, pending)

Source: `Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2` §14.2 — "No date-only individual clearance". Object: `lib/clinical/rf/rules/objects/RF-RTS-001.json`.

## 1. What was authored
A structural, non-executable prohibition object expressing the single rule that an individual's clearance **cannot** be based on date, time since injury, expected recovery time, cohort benchmark, median return time, or population-based date **alone**. The population-context dual role (cohort medians, pooled means, regression formulas may be *explained* as population context) is recorded in `decision_contract` as `evidence_record_only` context that can never determine an individual's readiness date.

## 2. What was not authored
No date-only / time-since-injury-only individual clearance; no RTT or RTS clearance from calendar time; no conversion of cohort benchmarks, median return times, or population return-time studies into individual clearance/prediction; no fixed return date, individual prognosis, progression schedule, dosage, exercise selection, or complete rehab plan.

## 3. Why it is non-executable
`executable: false`, `approval_status: "pending"`. It declares no executable decision logic — only `input_contract`/`decision_contract` structure and a `prohibited_outputs` list. It is not imported into any runtime.

## 4. Architecture references and evidence claims preserved
`architecture_refs: ["V3.1-12","V3.1-14.2","V3.1-24"]`; `evidence_claim_ids: ["QRF-013","QRF-029","QRF-031","QRF-032"]` — preserved exactly from the inventory and §14.2 (QRF-013 I1, QRF-029 D2 conditional Munich cohort context only, QRF-031 I1, QRF-032 C1).

## 5. Why source type and permitted use were preserved
§14.2 is **mixed** source and a **PROHIBITION**; primary `permitted_use` is `prohibited_autonomous_rule`. The secondary `evidence_record_only` role for cohort benchmarks is represented inside `decision_contract` (`population_context_dual_role`) without changing the primary `permitted_use`, exactly as the source states the dual role.

## 6. Exact source behavior preserved
"Cohort medians, pooled means, and regression formulas may be explained as population context but cannot determine an individual's readiness date."

## 7. Exact source limits preserved
Time/date/population values may inform context only; they are never proof of tissue capacity or readiness, and never an individual clearance.

## 8. Why it creates no clearance, dosage, plan, RTT, or RTS
Every such output is set `false` in `decision_contract` and enumerated in `prohibited_outputs`; the rule encodes only a prohibition boundary, not any authorizing logic.

## 9–12. Relationship to other RF rules
- **RF-FIELD-001…005:** does not bypass field-exposure limits or sprint-ratio prohibition; a reached date does not clear any field domain.
- **RF-RECUR-001…002:** does not bypass prior-injury recurrence handling or separated-exposure monitoring.
- **RF-REHAB-001…006:** does not bypass the prescription gate, loading/position limits, universal-dosage prohibition, schedule reconciliation, or concurrent-injury constraints.
- **RF-SEV-005 / RF-DX-006 / RF-SAF-006:** does not bypass fibrosis provenance handling, report-descriptor handling, or the structural/restriction safety referral; defers to RF-SAF-006 on serious concern.

## 13. safety_state_output and blocked_targets
`safety_state_output: null`, `blocked_targets: []`. §14.2 assigns **no** closed V3.1 safety state; the prohibition is represented in `decision_contract`. No state was inferred by analogy.

## 14. Prohibited outputs
Date-only/time-only/expected-recovery-time clearance, cohort/median/population → individual conversion, single-metric readiness, home-only-as-supervised, unrestricted-training without source-complete multi-domain evidence, RTT/RTS, hiding uncertainty, unknown-as-cleared, ignoring performance deficits, closing the capacity-to-demand gap without evidence, fixed dates/prognosis/dosage/sets/reps/frequency/rest/intensity/duration/work-to-rest/efforts/speed/kicking/return-dates/progression-increments/time-windows, exercise/field-plan selection, complete rehab plan, bypassing RF-FIELD/RECUR/REHAB/SEV-005/DX-006/SAF-006 or any safety/capacity/restriction/stage/readiness/monitoring/schedule/equipment/sport-context/concurrent-injury constraint, and treating weak/stale/self-reported/home-only/single-domain evidence as high-authority readiness evidence.

## 15. Confirmation
This is **not** clinical approval. The object is a pending, non-executable Gate B draft.
