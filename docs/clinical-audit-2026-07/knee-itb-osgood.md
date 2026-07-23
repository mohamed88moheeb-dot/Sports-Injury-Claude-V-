# Knee ITB Syndrome + Osgood-Schlatter Audit

Both entities clinically sound in core routing/exercise selection; both citations
(KNEE-CIT-010/011) real and supportive. Material gaps: two OSD safety holes + an
outdated ITB mechanism narrative.

## ITB syndrome
- Incidence 5–14%: CONFIRMED (van der Worp 2012).
- **Mechanism framing PARTIALLY OUTDATED:** RESEARCH.md §9 rejects simple friction
  (good) but stops there. Current model is **compression / fat-pad impingement**
  ("ITB impingement syndrome" — Fairclough 2007, Geisler 2020–21, Hutchinson
  2022); ITB is anchored to distal femur, can't slide. Downstream consequence
  (already correct in repo): ITB stretching/foam-rolling lacks mechanistic basis.
- **Treatment evidence framing OUTDATED:** "limited/conflicting" (2012) has shifted
  — 2024 SR (Sanchez-Alvarado) shows a reasonably consistent positive signal for
  hip-abductor strengthening. Update to "low-moderate quality, converging on HAS
  ± gait retraining."
- Routing (gradual_overuse + lateral → ITB): CONFIRMED. Exercise bank CONFIRMED/
  good (correctly omits ITB stretching). Optional: add cadence/step-rate cue (best-
  supported gait lever); mention shockwave/manual-therapy adjunct.

## Osgood-Schlatter
- Self-limiting apophysitis, extensor traction, resolves at maturity: CONFIRMED
  (Circi 2017).
- **"Reassure: usually resolves" OVERSTATED:** ~1/3 still symptomatic at 24mo
  (Holden 2021); worse adult knee health + higher patellar-tendinopathy odds
  (Krommes 2025). Soften to "usually improves at maturity but can persist
  months–years; monitor."
- **Age handling too coarse:** single "adolescent" bucket blurs sex-specific window
  (girls ~10–12, boys ~12–15, onset can start ~8) (Weiler 2011, van Leeuwen 2021).

## OSD SAFETY GAPS (highest priority)
1. **[SAFETY, highest] Acute tubercle / avulsion-fracture guard MISSING.** Tibial
   tubercle avulsion is the acute analog in this exact population, needs urgent
   surgery (Kalifis 2023 SR). OSD routing requires mechanism=gradual_overuse but
   there's no guard for an adolescent with SUDDEN tubercle pain + inability to bear
   weight → route to urgent referral, not self-managed OSD.
2. **[SAFETY] Systemic/night-pain red flags MISSING from knee engine.**
   KNEE_RED_FLAGS lacks night pain / constant rest pain / fever / unexplained
   weight loss — needed to catch infection/osteosarcoma masquerading as OSD.
   (A systemic pattern exists in confidenceEngine.js but isn't wired into the knee
   engine.)

## Priority fixes
1. [SAFETY] Add acute-tubercle/avulsion-fracture guard to OSD path (sudden onset ±
   can't-bear-weight → urgent referral).
2. [SAFETY] Wire systemic/night-pain red flags into KNEE_RED_FLAGS (all entities).
3. Update ITB mechanism to compression/fat-pad impingement (Fairclough 2007,
   Geisler 2020–21, Hutchinson 2022).
4. Refresh ITB treatment framing to "converging on HAS ± gait retraining"
   (Sanchez-Alvarado 2024); add cadence cue.
5. Soften OSD "self-limiting" language (Holden 2021, Krommes 2025).
6. [lower] Add anterior/tubercle pain_location guard to OSD routing; refine age
   model beyond single "adolescent" bucket.
