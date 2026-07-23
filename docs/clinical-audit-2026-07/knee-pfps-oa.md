# Knee PFPS + OA Audit

**Overall: clinical content is accurate and well-cited; the material weaknesses
are all in routing logic** (how age + morning stiffness gate the OA pathway).

## PFPS — content CONFIRMED
- Squat pain 91% sens / 50% spec (Duong 2023): CONFIRMED. Best used in a cluster
  (Cook 2010 "any 2 of 3" LR+ 4.0; Mostafaee 2022 stair-descent+sitting LR+ 19.5).
- **Hip+knee > knee-alone strengthening:** CONFIRMED — one of the best-supported
  claims in the whole engine (Nascimento 2018 JOSPT + ≥6 corroborating MAs
  2018–2025). "Benefit without measured strength change" is a precise, correct
  reading (motor-control/load mechanism; hip weakness is a *consequence* of PFPS,
  Rathleff 2014).
- Taping/orthoses = short-term adjunct only: CONFIRMED (PFP-5 framing correct).
- **MINOR citation error:** KNEE-CIT-005 labeled "Nascimento 2017" — actual pub
  is JOSPT 2018;48(1):19-31 (epub 2017). PMID 29034800/DOI correct, only display
  year wrong.
- MISSING (minor): `pain_with_stairs` is collected but never used in routing.

## Knee OA — content CONFIRMED, routing MIS-TUNED
- Dx age ≥45 + activity pain + stiffness ≤30 min (95%/69%, Duong 2023 / NICE
  NG226): CONFIRMED. KNEE-CIT-008 (ACR, PMID 31908149) and KNEE-CIT-009
  (van Doormaal/KNGF, PMID 32643252) both verified and accurately represented.
- Exercise + weight-mgmt + education strong rec: CONFIRMED.

## HIGH-priority routing defects
1. **OA age gate mis-tuned (HIGH):** OA threshold is age ≥45, but routing requires
   the fuzzy `older_adult` bucket while ALSO offering a competing "Adult" option.
   A 45–55-yo who self-selects "Adult" fails the OA route and falls through to
   PFPS. Age is doing the entire PFPS↔OA separation and the gate is mis-tuned →
   older degenerative knees systematically biased toward PFPS.
2. **Morning-stiffness gate over-strict (HIGH):** routing requires
   `morning_stiffness_minutes != null && <= 30` as a mandatory pass. Criterion is
   really "no stiffness OR ≤30 min"; King 2024 showed it works even with the
   stiffness item dropped. A patient with classic pain but slider at 40 gets
   routed AWAY from OA — doubly wrong (should consider OA or flag inflammatory).
3. **Missing inflammatory-arthritis flag (HIGH, safety):** stiffness >30–60 min is
   a classic RA red flag. Data is collected but only used to gate OA; never
   surfaces a "consider inflammatory cause — clinician review" referral.

## Priority fixes
1. Fix OA age gate — treat any patient ≥45 as OA-eligible (capture numeric age or
   relabel q_age buckets).
2. Loosen morning-stiffness gate — supportive, not gating; routable on age +
   activity pain even when stiffness absent/unknown.
3. Add inflammatory-arthritis flag for stiffness >30 min (data already collected).
4. (MEDIUM) Improve PFPS↔OA discrimination beyond squat+age — use collected
   `pain_with_stairs`; lower confidence when PFPS assigned to older adult on squat
   alone.
5. (LOW) Fix "Nascimento 2017"→2018 display year.
6. (LOW) Optional: cite Wallis 2021 CPG review, OARSI 2019, NICE NG226 as
   reinforcements (existing citations are already accurate).
