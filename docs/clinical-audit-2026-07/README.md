# Clinical Evidence Audit — July 2026

Independent, full-re-derivation clinical audit of the ROYO/InjuryGuide clinical
engines (RF, quad, knee). Each condition was independently re-researched from
current sports-medicine literature (PubMed / Consensus / practice guidelines)
**before** diffing against what the repo actually encodes. Scope is purely
scientific/clinical correctness — UX and human-approval-workflow concerns are
explicitly out of scope.

## Audit coverage

| # | Area | Status | File |
|---|------|--------|------|
| 7  | RF: diagnosis, classification & red-flags | RE-RUN NEEDED (session-limit kill) | — |
| 8  | RF: citation database integrity | ✅ complete | `rf-citation-integrity.md` |
| 9  | RF: exercise prescription & RTS criteria | ✅ complete | `rf-exercise-rts.md` |
| 10 | Quad: vastus strain | pending/unknown | — |
| 11 | Quad: contusion | pending/unknown | — |
| 12 | Quad: tendinopathy | RE-RUN NEEDED (killed during finalize) | — |
| 13 | Quad: tendon rupture | pending/unknown | — |
| 14 | Knee: ACL + PCL | ✅ complete | `knee-acl-pcl.md` |
| 15 | Knee: MCL + LCL/PLC | ✅ complete | `knee-mcl-lcl-plc.md` |
| 16 | Knee: meniscus + patellar instability | RE-RUN NEEDED (session-limit kill) | — |
| 17 | Knee: PFPS + OA | RE-RUN NEEDED (session-limit kill) | — |
| 18 | Knee: ITB + Osgood-Schlatter | RE-RUN NEEDED (session-limit kill) | — |

## Cross-cutting themes emerging from completed audits

1. **Citation-integrity is the biggest systemic problem.** Multiple citations
   across engines have a *correct clinical claim* wrapped in a *wrong/fabricated
   bibliographic record* — right numbers, wrong PMID/journal/title. Two RF
   citations (CROSS_2004, JOKELA_2023) point to completely unrelated papers
   (shoulder instability; a psychology paper) yet underpin core severity/
   classification logic. In the knee engine, `KNEE-CIT-001` (Duong 2023, which
   covers only OA/PFPS/meniscus) is mis-wired as the source for PCL and LCL/PLC
   entities, and a PCL reference in RESEARCH.md (PMID 19264708) actually points
   to an MCL paper.
2. **"Evidence-cited" thresholds that the cited paper doesn't establish.** The
   RF LSI phase-gate (70/85/90%) cites Buckthorpe 2019 / Hickey 2022, neither of
   which sets those numbers; and it uses a patient's *subjective* self-estimate
   while displaying "cleared" language — contradicting the engine's own
   governance rule (RF-RTS-003) against equating home self-assessment with
   supervised testing.
3. **RTS-criteria efficacy is overstated.** The claim that meeting 90%/90%
   strength+hop symmetry meaningfully reduces reinjury is low/very-low certainty
   in current evidence (Losciale 2019; Zhou 2024) — should be hedged.
4. **Missing neurovascular red-flag screening** for suspected posterolateral-
   corner / high-energy knee injury (peroneal nerve, popliteal artery risk).
5. **Where the engines are genuinely strong:** the PCL conservative-management
   content matches a 2025 international Delphi consensus almost exactly; the
   "rehab is a legitimate primary ACL pathway" stance is well-supported by 2025
   SR/MA evidence (Filbay 2025, Saueressig 2022); the RF governance layer's
   *prohibition* on inventing universal dosage is exactly right; and several RF
   citations (BARONI_2024, SERNER_2018, ISHOI_2020, GIAKOUMIS_2025) are exemplary
   in both accuracy and honest scope-labeling.

See individual files for the full rule-by-rule verdicts and priority fix lists.
