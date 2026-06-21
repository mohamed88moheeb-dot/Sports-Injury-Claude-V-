# RF-RTS-002 — Gate B Draft (NON-EXECUTABLE, pending)

Source: `Master_Rectus_Femoris_Clinical_Rule_Specification_v1.2` §14.3 — "Unrestricted training follows multi-domain Simulation evidence". Object: `lib/clinical/rf/rules/objects/RF-RTS-002.json`.

## 1. What was authored
A structural, non-executable object expressing only the source structure that unrestricted team integration sits in **Resilience after multi-domain Simulation milestones** (the Aspetar expert-pathway structure), recorded as source-permitted structure — not proof of safety.

## 2. What was not authored
No treatment of Simulation evidence as proof of safety; no unrestricted-training clearance from one metric / sprint speed / kicking exposure / date / pain score / home-only assessment alone; no RTS clearance; no executable RTT decision; no invented Simulation domains, thresholds, test batteries, performance criteria, or pass/fail criteria.

## 3. Why it is non-executable
`executable: false`, `approval_status: "pending"`. Structure only; no decision logic; not imported into any runtime.

## 4. Architecture references and evidence claims preserved
`architecture_refs: ["V3.1-12","V3.1-14.2"]`; `evidence_claim_ids: ["QRF-030"]` (E1; multi-domain readiness pathway-structure evidence) — preserved exactly.

## 5. Why source type and permitted use were preserved
§14.3 is **mixed** source, **SHOULD** strength, `permitted_use: logic_with_uncertainty` — preserved exactly. The "expert-pathway structure, not proof" limit is encoded in `decision_contract` (`structure_is_proof_of_safety: false`).

## 6. Exact source behavior preserved
"The Aspetar structure places unrestricted team integration in Resilience after multi-domain Simulation milestones."

## 7. Exact source limits preserved
"This is expert-pathway structure, not proof of safety, effectiveness, or formal clearance."

## 8. Why it creates no clearance, dosage, plan, RTT, or RTS
All such outputs are `false` in `decision_contract` and listed in `prohibited_outputs`; the rule encodes a structure statement only, never an authorizing decision.

## 9–12. Relationship to other RF rules
- **RF-FIELD-001…005:** does not bypass field-exposure limits; one field metric does not become unrestricted-training clearance.
- **RF-RECUR-001…002:** does not bypass recurrence handling or separated-exposure monitoring.
- **RF-REHAB-001…006:** does not bypass the prescription gate, loading/position limits, universal-dosage prohibition, schedule reconciliation, or concurrent-injury constraints.
- **RF-SEV-005 / RF-DX-006 / RF-SAF-006:** does not bypass these; defers to RF-SAF-006 on serious concern. Also does not bypass RF-RTS-001 (date-only prohibition).

## 13. safety_state_output and blocked_targets
`safety_state_output: null`, `blocked_targets: []`. §14.3 assigns **no** closed V3.1 safety state; the multi-domain-Simulation structure is represented in `decision_contract`. No state inferred by analogy.

## 14. Prohibited outputs
Simulation-as-proof-of-safety, single-source unrestricted-training clearance (metric/sprint/kicking/date/pain/home-only), unrestricted-training without source-complete multi-domain evidence, RTS clearance, executable RTT decision, invented domains/thresholds/criteria, single-metric readiness, home-only-as-supervised, date/time/cohort → individual clearance, hiding uncertainty, unknown-as-cleared, ignoring deficits, closing the capacity-to-demand gap without evidence, fixed dates/prognosis/dosage/sets/reps/frequency/rest/intensity/duration/work-to-rest/efforts/speed/kicking/return-dates/progression-increments/time-windows, exercise/field-plan selection, complete rehab plan, bypassing RF-FIELD/RECUR/REHAB/SEV-005/DX-006/SAF-006 or any safety/capacity/restriction/stage/readiness/monitoring/schedule/equipment/sport-context/concurrent-injury constraint, and treating weak/stale/self-reported/home-only/single-domain evidence as high-authority readiness evidence.

## 15. Confirmation
This is **not** clinical approval. The object is a pending, non-executable Gate B draft.
