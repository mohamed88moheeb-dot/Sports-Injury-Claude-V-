# Quad Contusion Audit

> Note: PubMed metadata + Consensus MCP tools were blocked (approval gate) this
> session; citations verified via WebSearch against PubMed/PMC/journal pages, not
> the PubMed API. A mechanical PMID re-verification is recommended.

Acute protocol is faithful to Aronen 2006. The two changes that most affect
myositis-ossificans (MO) safety are fixes #1 and #3 below.

## Independent evidence baseline
- **Grading (Jackson-Feagin 1973 PMID 4691666; Ryan/West Point 1991 PMID 1867338):
  ABSOLUTE knee-flexion degrees at 12–24 h** — mild >90°, moderate 45–90°, severe
  <45°. Natural-history disability mild ≈13d / moderate ≈19d / severe ≈21d.
- **Aronen 2006 (PMID 17016112):** within ~10 min, passively/painlessly flex to
  **120°**, double-wrap 24 h, then active ROM + isometrics. n=47, mean RTP 3.5d
  (2–5), 1/23 MO (~4.3%). Return: ≥120° flexion + symmetric quad size/firmness.
  Single Level-IV series; benefit tied to *immediate* application.
- **MO risk (Ryan 1991 — validated set):** flexion <120°, contact-sport injury,
  previous quad injury, treatment delay >3 days, ipsilateral effusion (9% MO).
  Specific MO tells (Larson 2002 PMID 20086513): firm/hardening palpable mass +
  ROM plateau over 2–3 wk. Avoid corticosteroids; NSAIDs may reduce MO short-term.

## Verdicts vs repo
- **Grading cutoffs OUTDATED/QUESTIONABLE:** engine uses **% of contralateral ROM**
  (>50% mild, 30–50% mod, <30% severe; contusionModule.mjs:33–35) cited to
  Lempainen 2022. Literature uses absolute degrees. 90° of a ~140° knee ≈64%, 45°
  ≈32% — so the "mild >50%" band captures ~50–64% (≈70–90°) that the literature
  calls **moderate** → engine **under-grades moderate contusions as mild**, also
  under-triggering MO monitoring. RESEARCH.md ">50% ≈ >90°" (line 86) is
  arithmetically wrong (>90° ≈ 64%). Severe (<30% ≈ <42°) ≈ classic <45°, OK.
- **Prognosis QUESTIONABLE (internally inconsistent):** mild "2–5 days" is Aronen's
  *treated-cohort* RTP (3.5d), not natural-history mild (Jackson-Feagin ≈13d). A
  treated number is mixed into a Jackson-Feagin grading scheme → mild estimate
  optimistic unless the 120° protocol was actually applied immediately.
- **Acute protocol angle/duration CONFIRMED:** 120° passive painless flexion, ~24 h,
  then active stretch + isometrics = Aronen exactly. But it fires whenever
  `days_since_injury <= 1`, so it can recommend forcing 120° up to ~24 h post-injury
  — past the minutes–hours window where flexion-immobilization is supported.
- **MO risk logic PARTIALLY SUPPORTED / MISSING:** flags on `bruising_or_swelling
  ==='significant'` and severe+effusion, but OMITS the validated predictors
  (previous quad injury, delay >3d — derivable from `days_since_injury`, flexion
  <120°). The specific MO tells (firm/hard mass; ROM plateau over 2–3 wk) are in the
  human-readable `monitoring_triggers`/`stop_rule` text but NOT in the automated
  `withhold_if` logic — so automation can miss the classic MO presentation (a
  contusion that stops improving without an acute swelling spike). Corticosteroid-
  avoidance / cautious-NSAID guidance CONFIRMED.
- **Exercise selection CONFIRMED:** ROM-first, pain-free isometrics, delayed/cautious
  stretch (CN-EX-015 sub-acute only, skip if swelling/lump), graded closed-chain,
  criteria-based return. BFR (CN-EX-013, Hughes 2019) and RTS hop/LSI battery
  (CN-EX-032, Nawasreh 2016) are ACLR extrapolations — label as such.
- **Citations CONFIRMED (web-verified):** Aronen 2006, Kary 2010 (21063497),
  Larson 2002 (20086513), Lempainen 2022. **MISSING primary sources:** Jackson-
  Feagin 1973 and Ryan/West Point 1991 — the actual sources for both the ROM grades
  and the five MO risk factors — are NOT in the citation file (engine leans on
  Lempainen/Kary secondary reviews).

## Priority fixes
1. **[HIGHEST — MO safety]** Add validated MO risk factors (previous quad injury,
   delay >3d, flexion <120°, effusion) to `gradeContusion`; extend
   `checkin_policy.withhold_if` to also fire on ROM plateau over ~2–3 wk and a
   firm/hard palpable mass (both already in human-readable triggers).
2. **[HIGH]** Fix grading thresholds — grade in absolute degrees (>90/45–90/<45) or
   correct percentages (~>64% / 32–64% / <32%); fix RESEARCH.md arithmetic; cite
   Jackson-Feagin 1973 + Ryan 1991 directly.
3. **[HIGH — MO safety]** Constrain the acute 120°-flexion trigger to the immediate
   window (hours, not `days_since_injury <= 1`); past it, pivot to gentle pain-free
   ROM rather than "flex to 120°."
4. **[MEDIUM]** Qualify the mild prognosis ("2–5 days" is treated-cohort, conditional
   on immediate management; else natural-history range).
5. **[MEDIUM/LOW]** Add Jackson-Feagin 1973 + Ryan 1991 citations; label BFR
   (Hughes 2019) and Nawasreh RTS battery as ACLR-derived extrapolations.
