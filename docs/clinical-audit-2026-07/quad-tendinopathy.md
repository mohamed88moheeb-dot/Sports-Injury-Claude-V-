# Quad/Patellar Tendinopathy Audit

**Architecture sound; content lags ~5 years behind the field in 3 specific ways.**

## Independent evidence highlights
- Cook & Purdam continuum (2009) but the **2016 revisit cautions AGAINST staging
  by structure** — tendinopathy is "primarily a pain condition"; stage by
  symptoms/load tolerance, not imaging.
- **Isometric-first analgesia is the area where science shifted most:** original
  claims from tiny Rio studies (n=6 2015, n=20 2017) have **not replicated**
  (van Ark 2016, Holden 2019 — not sustained, no mode difference; Clifford 2020,
  Challoumas 2021 NMA — isometric NOT superior to isotonic). Isometrics are one
  option, not a mandatory first step.
- HSR (Kongsgaard 2009) well-validated; load magnitude less critical than thought
  (Agergaard 2021: 55% 1RM = 90% 1RM); no intervention clearly superior to HSR.
- **Current gold standard = Progressive Tendon-Loading Exercise (PTLE), Breda 2021
  RCT** — superior to eccentric-only (VISA-P +9 at 24wk). The key modern citation
  the repo is missing.
- RTS: no validated LSI hop battery for tendinopathy (unlike ACL); use the
  pain-monitoring "traffic-light" model (Silbernagel 2007, ≤5/10 acceptable if
  settles by next morning).

## Comparison against repo
- **CONFIRMED:** symptom-based staging; acceptable-pain monitoring text
  (strongest part of the module); isometric dosing (5×30-45s ~70% MVIC); HSR
  dosing (matches Kongsgaard 2009 precisely).
- **OUTDATED — isometric hard-gating:** forces pain≥7 into isometric-only and
  drops back to isometrics whenever loading pain≥7; cites the n=6 "6.8/10" figure.
  Should be one option, not a forced gate.
- **UNSUPPORTED:** numeric thresholds (pain≥7/≥4; VISA-P<50/<80; energy-storage at
  pain≤2) are arbitrary/uncited — label as heuristic.
- **QUESTIONABLE:** VISA-P used as an irritability proxy (it's a function/severity
  instrument, not reactivity) — can misplace stage.
- **MISSING — diagnostic gate:** module STAGES an assumed tendinopathy but never
  CONFIRMS it (no inferior-pole localization, no differentiation from PFPS/fat-
  pad/OSD). Biggest content gap for a "diagnosis criteria" audit.
- **OUTDATED — "energy_storage" stage conflates two things:** lumps eccentric
  decline squat (slow strength → belongs with isotonic) with plyometrics (true
  energy storage), and places eccentric AFTER HSR, inverting the PTLE sequence.
- **MISSING options:** moderate-slow-resistance (Agergaard 2021) and BFR
  (Hjortshoej 2025) for load-limited tendons.

## Citations
All resolve cleanly (QUAD-CIT-007 Rio 2015, 008 Lim 2018, 009 Kongsgaard 2009,
010 Burton 2022, 011 Ruffino 2021 — verified). BUT:
- QUAD-CIT-016/017 (Nawasreh 2016, Thompson 2022) are **ACL-reconstruction RTS
  papers misapplied to tendinopathy RTS** — LSI batteries not validated for tendon.
- MISSING: Cook&Purdam 2009/2016, ICON 2019 terminology, **Breda 2021 PTLE**,
  Agergaard 2021, Challoumas 2021, Holden 2019/Clifford 2020, and **Silbernagel
  2007** (the pain-monitoring model the module implements but doesn't cite).

## Priority fixes
1. Add a diagnostic gate before staging (localization, load-relatedness, SLDS
   provocation, differentiate from PFPS/fat-pad).
2. Demote isometrics from mandatory gate to one option; delete/caveat the 6.8/10
   claim.
3. Re-sequence + relabel the ladder to PTLE (Breda 2021): eccentric decline squat
   → isotonic stage; reserve "energy storage" for plyometric; add sport-specific
   final stage.
4. Replace ACL RTS citations with pain-monitoring model + VISA-P trajectory (cite
   Silbernagel 2007).
5. Label numeric thresholds as heuristic; stop using VISA-P as irritability proxy;
   add MSR + BFR options.
6. Refresh RESEARCH.md + citation `supports` to post-2020 evidence.
