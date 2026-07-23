# Clinical Evidence Audit — July 2026

Independent, full-re-derivation clinical audit of the ROYO/InjuryGuide clinical
engines (RF, quad, knee). Each condition was independently re-researched from
current sports-medicine literature (PubMed / Consensus / practice guidelines)
**before** diffing against what the repo actually encodes. Scope is purely
scientific/clinical correctness — UX and the human-approval workflow are out of
scope.

## Start here

**→ [`00-CONSOLIDATED-REPORT.md`](./00-CONSOLIDATED-REPORT.md)** — the master
report: every finding across all 12 conditions triaged by clinical severity
(P0 safety → P1 governance/correctness → P2 currency), a per-condition status
matrix, a "what's strong, keep" list, and a suggested execution order.

The per-condition files below hold the full rule-by-rule verdicts and evidence.

## Coverage (all 12 complete)

| # | Area | Safety gap | File |
|---|------|:---:|------|
| 7  | RF: diagnosis, classification & red-flags | P0 | `rf-diagnosis-classification.md` |
| 8  | RF: citation database integrity | — | `rf-citation-integrity.md` |
| 9  | RF: exercise prescription & RTS criteria | — | `rf-exercise-rts.md` |
| 10 | Quad: vastus strain | P0 | `quad-vastus-strain.md` |
| 11 | Quad: contusion | P0 | `quad-contusion.md` |
| 12 | Quad: tendinopathy | — | `quad-tendinopathy.md` |
| 13 | Quad: tendon rupture | P0 | `quad-tendon-rupture.md` |
| 14 | Knee: ACL + PCL | — | `knee-acl-pcl.md` |
| 15 | Knee: MCL + LCL/PLC | P0 | `knee-mcl-lcl-plc.md` |
| 16 | Knee: meniscus + patellar instability | P0 | `knee-meniscus-patellar-instability.md` |
| 17 | Knee: PFPS + OA | P0 | `knee-pfps-oa.md` |
| 18 | Knee: ITB + Osgood-Schlatter | P0 | `knee-itb-osgood.md` |

## The four systemic patterns (see consolidated report for detail)

1. **Incomplete safety escape-hatches** — engines stage/plan an injury without
   first ruling out the emergency that mimics it (quad-tendon rupture bypass;
   adolescent AIIS/tubercle avulsion; missing knee neurovascular + systemic red
   flags).
2. **Spec-vs-implementation divergence (RF)** — the conservative governed JSON
   pack is not what the live beta engine actually shows users.
3. **Citation integrity** — correct claims on wrong bibliographic records (two RF
   citations point to unrelated papers; KNEE-CIT-001 mis-wired to PCL/LCL), plus
   undeclared ACL/tendinopathy → muscle-strain evidence transfer.
4. **Currency (~5-yr lag in places)** — tendinopathy isometric-first/PTLE, ITB
   friction-vs-compression, OSD "self-limiting," self-report-derived BAMIC grades.

## What's genuinely strong
PCL conservative mgmt (2025 Delphi), degenerative-meniscus exercise-first (JAMA),
ACL rehab-as-primary-pathway (Filbay 2025), patellar-instability no-bracing (ESSKA
+ Honkonen RCT), PFPS hip+knee>knee-alone, the adult RF-SAF safety pack and the
JSON pack's dosage-prohibition, and the quad tendon-rupture gate logic where it
fires.
