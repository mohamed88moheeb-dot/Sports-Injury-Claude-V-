# Knee ACL + PCL Audit

## ACL — core stances well-grounded
- **"Rehab is a legitimate primary pathway":** CONFIRMED by 2025 best evidence
  (Filbay 2025 SR/MA, PMID 40603829 — no RTS-rate difference, OR 1.5, CI
  0.76–2.97; Saueressig 2022 BJSM). **But** evidence is low/very-low certainty,
  and non-acute presentations with *persistent instability* have RCT evidence
  favoring surgery (ACL SNNAP, Beard 2022 Lancet; COMPARE, Reijman 2021). App
  should add a certainty caveat + the persistent-instability nuance.
- **Diagnostic tests:** Lachman best single test but accuracy previously
  overestimated for complete/post-acute tears (Sokal 2022 KSSTA, PMID 35150292);
  pivot-shift high specificity/low sensitivity (Benjaminse 2006, PMID 16715828).
  Both PMIDs are accurate but **absent from KNEE_CITATIONS** and not wired to
  `acl_injury.sources`.
- **Re-rupture risk factors:** Zhao 2022 (PMID 36189967) well-matched. Newer
  additions not in app: dynamic-valgus predictor (Gonzalez 2025); 2025 17-country
  Delphi consensus recommending LET/ALL for high-risk young pivoting athletes
  (Sonnery-Cottet; meta-support Mercurio 2025, Mukh 2026).
- **RTS criteria (90%/90% strength+hop):** requiring BOTH is sound (Thompson
  2022, 36.5% disagreement). But the "meeting criteria reduces reinjury" framing
  is OVERSTATED — low certainty (Losciale 2019 JOSPT "very low quality"; Zhou
  2024 PeerJ: no association with overall reinjury, only graft rupture OR 0.49).
  Missing: hamstring:quad ratio (Kyritsis 2016, HR 10.6/10% deficit).

## PCL — strongest-matched section of the whole audit
Conservative-for-grade-I-II / surgical-for-III-or-combined, quad-focused, avoid
early resisted hamstring/OKC flexion: CONFIRMED against a **2025 international
Delphi consensus** (PMID 40277372) and Wang 2018 (PMID 29721691). Consensus adds:
leg press before squats (lower PCL tensile force) — not currently reflected in
PCL-3/PCL-4.

## Verdicts / defects
- **PCL routing gap:** `routeEntity()` only maps `dashboard_hyperflexion` → PCL.
  `direct_blow` (to flexed knee — a classic sport PCL mechanism) and
  `jumping_landing` fall through to the generic PFPS fallback. **Add a trigger.**
- **Citation wiring broken:** `ENTITY_CONFIG.pcl_injury` and `.lcl_plc_injury`
  cite `KNEE-CIT-001` (Duong 2023 — OA/PFPS/meniscus only; says nothing about
  either ligament). Wire Wang 2018 (PMID 29721691) for PCL.
- **RESEARCH.md miscite:** PMID 19264708 (cited for PCL) is actually an **MCL**
  paper (Miyamoto 2009). Wang 2018 (correct) was never added to KNEE_CITATIONS.
- **Asserted-not-implemented:** "young pivoting athletes → stricter RTS criteria"
  is in prose but ACL-8 thresholds are static 90/90 regardless of age/sport/graft.
- **Citation registry:** 13/14 KNEE_CITATIONS entries verified correct; the one
  problem is the KNEE-CIT-001 misuse for PCL/LCL above.

## Priority fixes
1. Fix PCL/LCL citation wiring (KNEE-CIT-001 mismatch) → add Wang 2018.
2. Fix RESEARCH.md PMID 19264708 (MCL paper miscited for PCL).
3. Hedge/rescope the RTS-criteria "reduces reinjury" claim (add Kyritsis 2016;
   add H:Q ratio to battery).
4. Add PCL routing for `direct_blow` mechanism.
5. Wire the ACL diagnostic-accuracy citations (Sokal 2022, Benjaminse 2006).
6. Implement or remove the "young pivoting athlete stricter criteria" claim.
7. (Enhancement) surface 2025 LET/ALL consensus in re-rupture context; leg-press-
   before-squats in PCL progression; lever-sign test alongside Lachman.
