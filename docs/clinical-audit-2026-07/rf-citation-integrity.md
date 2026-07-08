# RF Citation Integrity Audit (`rfClinicalCitations.mjs`)

All 33 citation entries checked (no sampling). `rfV12RuleInventory.json` uses
internal QRF-xxx evidence-claim IDs mapping into the Master Spec doc, not direct
PMIDs — no PMID-level fabrication risk there, but those QRF grades (C1/D2/E1)
currently have no traceable link to actual papers (separate gap).

## Severity of findings

### Fully wrong PMID (resolves to an unrelated paper) — MOST SERIOUS
- **CROSS_2004** — file PMID `14977651` resolves to Lo IK et al., a **shoulder
  instability** paper. Real paper: Cross TM et al., "Acute quadriceps muscle
  strains: MRI features and prognosis," Am J Sports Med 2004;32(3):710-9,
  **PMID 15090389**. Clinical numbers (central tendon 26.9d, peripheral 9.2d) are
  correct and back the "central-tendon RTP floor: min 26 days" severity rule —
  but the citation trail is broken. **Fix: PMID 15090389.**
- **JOKELA_2023** — file PMID `36476343` resolves to an unrelated psychology
  paper. Real paper: Jokela A et al., "Indirect Rectus Femoris Injury Mechanisms
  in Professional Soccer Players," Clin J Sport Med 2023;33(5):475-482,
  **PMID 36853900**. Findings (kicking 80%, 62.5% complete tendon rupture on
  kicking) match — this underpins the Pattern A/B/C diagnosis classification.
  **Fix: PMID 36853900.**
- Dead-code first `BETA_ACUTE_REST_DAYS` (line ~518) cites PMID `17894337`
  (a sleep-disorder questionnaire). It's a duplicate JS key silently overwritten
  by a second definition (line ~637), so unreachable — but should be removed.

### Real PMID + correct data, but fabricated/wrong title or journal/volume/pages
- **BALIUS_2009** (PMID 19174412) — data correct; title given does not exist
  (real title: "Central aponeurosis tears of the rectus femoris: practical
  sonographic prognosis").
- **GREEN_2020** (PMID 32299793) — RR data correct; title given does not exist
  (real: "Recalibrating the risk of hamstring strain injury...").
- Lesser bibliographic mismatches: MCALEER_2022, MCAULEY_2021 (also more
  hamstring-specific than implied), PIETSCH_2023, LEMPAINEN_2021.

### Numeric claim not supported by / understating the cited paper
- **KNAPIK_2023** (PMID 36743725) — "8–22 weeks" operative RTP **understates**
  the real range (mean 22.1 wk, range 14.0–37.6 wk). Feeds "high_concern"/
  "red_flag" recovery-time text → risks understating surgical recovery
  expectations. (Highest-impact *numeric* finding.)
- **BETA_PLANK_PROGRESSION** (McGill 2009, PMID 19154838) — the specific
  hold-duration progression isn't in that paper (likely from McGill's textbook);
  misattributed.

### Source-comment stray PMID
- EARLY_MOBILIZATION_TIMING doc-comment cites PMID `15851252` (a cardiology
  paper); the actual citation object correctly uses 15851777 (Järvinen 2005).

### Could-not-verify (tool returned abstract only — re-check against full text)
- LORENZ_2020_SPRINT yardage figures; ACUTE_REST_DAYS_MAPPING "3–5 days" quote
  (Kary 2010); ECCENTRIC_TEMPO_REST Lorenz 2011 "3–4s eccentric" quote.
- **PMC11338860** (the single most-relied-on source, PMID 39175620) — the
  phase-by-phase exercise table mapping appears mis-flattened (e.g. "standing hip
  flexion" / "leg extension" tagged Phase 1 but likely Phase 2/3). Re-derive from
  the actual Table 1 image, since this drives exercise content across all phases.

### Clean / exemplary (~10)
BARONI_2024, PAIN_THRESHOLD, GIAKOUMIS_2025, RUDISILL_2021, SERNER_2018,
ISHOI_2020, ASKLING_2008, SANTOS_2021, SPRINT_PROGRESSION, BFR_CONSENSUS
(honest self-disclosed limits).

## Code defect
`BETA_ACUTE_REST_DAYS` defined twice as an object key (lines ~518 and ~637);
JS keeps only the second — deduplicate.

## Priority fixes
1. Fix CROSS_2004 → PMID 15090389 and JOKELA_2023 → PMID 36853900 (broken trail
   under core severity/classification logic).
2. Correct KNAPIK_2023 operative-RTP range (currently understates surgical
   recovery time shown to users).
3. Re-derive PMC11338860 phase→exercise mapping from the real table.
4. Fix fabricated titles/bibliographic records (BALIUS_2009, GREEN_2020, etc.).
5. Deduplicate the BETA_ACUTE_REST_DAYS key; remove stray comment PMIDs.
