# Knee MCL + LCL/PLC Audit

## MCL — well-supported
- Grading I–III by valgus laxity at 0°/30°: CONFIRMED.
- Grade I–II heal conservatively (high vascularity/healing capacity): CONFIRMED
  (Lucidi 2024; mechanistic support Gaydarski 2026, Zhang 2011).
- Combined ACL+MCL → reconstruct ACL, treat grade I–II MCL non-op: CONFIRMED
  against the primary source (Elkin 2019, PMID 30929138 — verified).
- Nuance MISSING: grade III MCL is not monolithic — **proximal** heals non-op
  even at grade III, **distal avulsions** may need early surgery (Robinson 2024).
- Diagnostic nuance MISSING: isolated MCL tear causes a **false-positive dial
  test** (Pritsch 2006, PMID 16762352) — need valgus stress at 0° (not just 30°)
  to distinguish from PLC. No diagnostic-accuracy meta-analysis exists for the
  valgus stress test (genuine field gap).

## LCL / PLC — the entity most in need of work
- Less common, disproportionately high-energy/combined: CONFIRMED strongly
  (Moran 2022 AJSM PMID 35384729 — grade 3 PLC OR 23.81 for peroneal nerve
  injury; Barrow 2017).
- High-grade → surgical, reconstruction > repair: CONFIRMED (Fortier 2023: repair
  failure 21.9% vs recon 7.1%; Levy 2010: 40% vs 6%).
- **Important caveat (OUTDATED framing in repo):** *isolated* (non-rotatory)
  grade 1–2 and even isolated grade 3 LCL do well non-operatively (Haslhofer
  2025, Williams 2025 OJSM: 100% RTP; Bushnell 2010 NFL grade III isolated). The
  operative driver is *isolated varus laxity vs. combined rotatory PLC
  instability*, not laxity grade alone.

## Verdicts / defects
- **Routing** (valgus→MCL, varus→LCL/PLC): CONFIRMED, correctly "moderate"
  confidence.
- **MCL grade-III auto-refer:** CONFIRMED, appropriately hedged.
- **LCL/PLC grade-≥2 auto-refer:** defensible as a *safety margin* (app can't run
  a dial test; dial test itself only ~20% sensitive; PLC carries neurovascular
  risk) — but currently UNDER-JUSTIFIED and MIS-CITED, and the referral message
  ("these often need surgical assessment") OVERSTATES surgical likelihood vs 2025
  isolated-LCL evidence. Reframe to "specialist assessment to rule out combined/
  PLC injury and screen nerve/vascular involvement."
- **Citation mismatch:** every LCL/PLC exercise cites only KNEE-CIT-001 (Duong
  2023 — OA/PFPS/meniscus only; verified nothing on ligaments). RESEARCH.md §4
  attributes only vaguely to "(Knee ligament exam + PLC literature)" with no
  DOI/PMID — the one entity with zero real ligament-specific backing.
- **Missing `return` stage:** LCL/PLC exercise bank (LCL-1..4) has NO return-to-
  sport stage, unlike ACL/PCL/MCL — inconsistent given PLC's high re-injury/
  failure risk.
- **Infrastructure gap:** ligament-exam PMIDs in RESEARCH.md prose (35150292
  Sokal 2022, 16715828 Benjaminse 2006) were never added to KNEE_CITATIONS, so
  even ACL can't formally cite them.

## Priority fixes
1. **Add neurovascular red-flag screening** for suspected PLC / high-energy knee
   injury (foot numbness, foot drop, distal pulses) → route to urgent. Arguably
   the single most clinically consequential gap (peroneal nerve up to ~24% of
   MLKI; popliteal artery in dislocations). Currently no such question exists.
2. Add a real LCL/PLC citation (e.g. Fortier 2023, Levy 2010) and fix the
   KNEE-CIT-001 mismatch on that entity.
3. Reframe the LCL/PLC referral message + document the grade-≥2 rationale (don't
   remove the threshold; cite Haslhofer/Williams 2025 so it doesn't over-alarm).
4. Give LCL/PLC a `return` stage with explicit criteria (match MCL/ACL/PCL).
5. Add MCL 0°-valgus nuance + dial-test false-positive note (Pritsch 2006).
6. Backfill KNEE_CITATIONS for the exam meta-analyses (Sokal 2022, Benjaminse
   2006).

**Bottom line:** MCL grade-III auto-refer is correct. LCL/PLC grade-≥2 is not
clinically wrong (appropriately conservative) but is under-justified, mis-cited,
and its user message overstates surgery likelihood. The bigger gap is missing
neurovascular screening.
