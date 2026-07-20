# Knee Meniscus + Patellar Instability Audit

**Both headline claims CONFIRMED against top-tier evidence** (JAMA 2023;
ESSKA 2024; Honkonen 2022 RCT). Real weaknesses are in first-time patellar-
dislocation triage/imaging and a locked-knee routing collision.

## Meniscal tear
- Vascular-zone classification, repair > meniscectomy (Wells 2021, PMID 34398118):
  CONFIRMED. Diagnostic tests (McMurray 61%/84%, joint-line 83%/83%; Duong 2023):
  CONFIRMED.
- **Degenerative tear → exercise first-line even WITH mechanical symptoms
  (locking/catching): CONFIRMED** — the strongest-supported claim in the module,
  verbatim from JAMA + large RCT base (OMEX/Kise, ESCAPE/Noorduyn 2022, Berg 2024
  10-yr). Keep it.
- NUANCE (LOW): age/tear-type conditional — DREAM secondary (Damsted 2023) found
  early surgery better for *self-reported mechanical symptom* relief in YOUNG
  patients. Add so the degenerative rule isn't over-generalized to young traumatic
  tears.

## Patellar dislocation/instability
- First-time mgmt individualized, PT essential, **bracing no clear long-term
  benefit** (ESSKA 2024 Part 2, PMID 40053919; Honkonen 2022 RCT PMID: immobil.
  → quad atrophy, worse early function): CONFIRMED. PI-1 "brace-free settle" good.
- Recurrent → clinician (routine) referral for MPFL review + rehab alongside:
  CONFIRMED urgency level.
- MRI mandatory after FTPD to detect osteochondral lesions/anatomy (ESSKA Part 1,
  Blønd 2025, PMID 39976176): the engine collects none of this.

## Verdicts / defects
- **HIGH — locked-knee routing collision:** rule 2 (locking→meniscus) fires after
  rule 1 (which only catches *recurrent* dislocation). A **first-time** patellar
  dislocation that sheds an osteochondral fragment → true locked knee → routed to
  MENISCUS, misattributing a surgical patellar lesion. Most consequential routing
  weakness.
- **HIGH — no first-time high-risk stratification / imaging flag:** engine flags
  only recurrence. ESSKA says surgery increasingly indicated at FIRST dislocation
  for skeletal immaturity, trochlear dysplasia, patella alta, high TT-TG, or
  osteochondral lesion ≥1 cm². High-risk first-timers under-triaged; no
  "arrange MRI / rule out osteochondral fragment" flag.
- **MEDIUM — `locking_or_block` too coarse:** single yes/no. True block-to-
  extension (→ bucket-handle, refer) must be distinguished from catching/clicking/
  pseudolocking (degenerative, does NOT need surgery per JAMA). Every "locking=yes"
  → urgent surgical referral over-refers and contradicts the module's own teaching.
- **MEDIUM — patellar_instability missing `return` stage:** only surgical/
  instability entity lacking an RTS criteria battery (ACL/PCL/MCL/meniscus have one).
- **LOW — "VMO activation" terminology** dated (selective VMO recruitment not
  achievable); reword to general quad strengthening.
- **Citations:** KNEE-CIT-001 (Duong), -004 (Wells), -006 (Balcarek ESSKA Pt2),
  -007 (Koh 2014) all CONFIRMED. MISSING: ESSKA Part 1 (Blønd 2025, PMID 39976176)
  — source for the new imaging/risk logic; add it.

## Priority fixes
1. [HIGH] Add first-time patellar-dislocation risk stratification + osteochondral/
   imaging flag (ESSKA Pt1 & Pt2).
2. [HIGH] Fix locked-knee routing so a patellar-dislocation osteochondral fragment
   isn't sent to meniscus (let patellar history/mechanism take precedence, or
   branch the locked-knee referral to cover both causes).
3. [MEDIUM] Distinguish true block-to-extension from catching/pseudolocking in the
   `locking_or_block` intake.
4. [MEDIUM] Add a `return`-stage RTS battery to patellar_instability.
5. [LOW] Add DREAM-trial nuance for young traumatic tears with mechanical symptoms.
6. [LOW] Cite ESSKA Part 1 (PMID 39976176); reword "VMO activation."
