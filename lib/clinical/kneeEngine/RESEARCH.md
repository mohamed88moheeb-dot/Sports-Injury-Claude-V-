# Knee Injury Engine — Clinical Research Foundation

> Evidence base gathered via **PubMed** (June 2026). Every classification, gate,
> and exercise-modality choice traces to a cited source below. This is the audit
> trail. Nothing here is clinical authority — beta-scoped, requires clinician
> review, not evidence-graded prescription.
>
> **Attribution:** synthesised from articles retrieved from **PubMed**; DOIs per
> claim. The knee extensor-mechanism tendons (patellar/quadriceps tendinopathy
> and tendon rupture) are already covered by the **quad engine** and are reused,
> not duplicated.

---

## Scope — knee entities covered

| Module | Entity | Pathway type |
|---|---|---|
| `acl` | Anterior cruciate ligament injury | ligament; rehab-led, surgery optional |
| `pcl` | Posterior cruciate ligament injury | ligament; mostly conservative |
| `mcl` | Medial collateral ligament injury | ligament; conservative (grades I–II) |
| `lcl_plc` | Lateral collateral / posterolateral corner | ligament; high-grade surgical |
| `meniscus` | Meniscal tear (traumatic + degenerative) | conservative-first; surgery for locked |
| `patellofemoral` | Patellofemoral pain syndrome (PFPS) | load + hip/knee strengthening |
| `patellar_instability` | Patellar dislocation / instability | rehab-first; MPFL recon if recurrent |
| `knee_oa` | Knee osteoarthritis | exercise + education + weight |
| `itb` | Iliotibial band syndrome | load management + hip/run mechanics |
| `osgood_schlatter` | Osgood-Schlatter (tibial-tubercle apophysitis) | load management, self-limiting |

Reused from quad engine: **patellar tendinopathy**, **quad tendinopathy**,
**patellar/quad tendon rupture** (route to `quadEngine` tendon pathways).

---

## Diagnostic clinical tests (anchor: JAMA knee-pain review)

Duong 2023, *Evaluation and Treatment of Knee Pain* (JAMA), [DOI](https://doi.org/10.1001/jama.2023.19675):
- **OA** most likely if age ≥45 with activity-related pain and ≤30 min morning
  stiffness (**95% sensitivity, 69% specificity**). Imaging not routinely needed.
- **PFPS**: typically <40 y, physically active, lifetime prevalence ~25%.
  **Anterior knee pain during a squat ≈ 91% sensitive, 50% specific.**
- **Meniscal tear**: ~12% adult prevalence. **McMurray** 61% sens / 84% spec;
  **joint-line tenderness** 83% sens / 83% spec. Acute twisting (<40 y) vs
  degenerative (≥40 y, often with OA).
- **First-line for all three = conservative**: exercise, education, self-management.
  Degenerative meniscal tears → exercise first; surgery **not** indicated even
  with mechanical symptoms (locking/catching). Displaced bucket-handle → surgery.

Ligament exam (Décary/Bronstein diagnostic-accuracy literature, PMID 35150292/16715828):
- **ACL**: Lachman is the most accurate single test; pivot-shift is highly
  specific (when positive, rules in). Acute haemarthrosis (rapid swelling
  <2–4 h) strongly suggests ACL.
- **PCL**: posterior drawer / posterior sag; "dashboard" or hyperflexion
  mechanism.
- **MCL**: valgus stress (30° flexion) → medial laxity/pain.
- **LCL/PLC**: varus stress + dial test; high-energy, often combined.

---

## 1. ACL injury

**Management — rehab vs reconstruction.** Filbay 2025 systematic review/meta-analysis
(*Sports Med*), [DOI](https://doi.org/10.1007/s40279-025-02268-5): **no difference
in return-to-sport rate or activity level** between ACL reconstruction and
supervised rehabilitation alone (RTS OR 1.5, 95% CI 0.76–2.97). The belief that
surgery is required to return to sport is **not** supported. → engine treats
high-quality **rehabilitation as a legitimate primary pathway**, with surgery a
shared decision, not a default.

**Re-rupture/revision risk factors.** Zhao 2022 meta-analysis (*AJSM*),
[DOI](https://doi.org/10.1177/03635465221119787): higher risk with younger age,
male sex, family history, return to high-level pivoting sport, concomitant MCL
injury, smaller graft, allograft. → engine flags young pivoting athletes for
stricter return-to-sport criteria.

**Rehab structure** (criteria-based, not time-based): impairment/recovery →
strength & neuromuscular control → running/plyometric → return-to-sport testing
(quad strength LSI ≥90%, hop-test battery ≥90%, psychological readiness). Mirrors
the criteria-based gates already used in the quad engine (Nawasreh 2016;
Thompson 2022 — hop symmetry can mask quad deficits, use BOTH).

---

## 2. PCL injury

Most isolated PCL injuries (grade I–II) are managed **conservatively** with
quadriceps-focused rehabilitation; the quadriceps dynamically protects against
posterior tibial translation. Brace in extension early; avoid early resisted
hamstring/open-chain knee flexion (loads the PCL). Grade III / combined →
surgical consideration. (PCL management literature, PMID 19264708 / 29721691.)

---

## 3. MCL injury

Graded I–III by valgus laxity. **Grade I–II isolated MCL heal well
conservatively** with bracing and progressive loading; the MCL has good healing
capacity. Combined ACL+MCL: reconstruct ACL, treat grade I–II MCL non-operatively;
high-grade MCL controversial. (Elkin 2019, *Curr Rev Musculoskelet Med*,
[DOI](https://doi.org/10.1007/s12178-019-09549-3).) → conservative,
valgus-protected progressive loading; avoid valgus stress early.

---

## 4. LCL / posterolateral corner

Lateral-sided and PLC injuries are less common, often high-energy and **combined**;
high-grade injuries generally need **surgical** repair/reconstruction (poor
healing if left). Varus stress + dial test. → engine routes high-grade
lateral/PLC patterns to urgent in-person/surgical review. (Knee ligament exam +
PLC literature.)

---

## 5. Meniscus tear

Wells 2021 (*Sports Med Arthrosc Rev*), [DOI](https://doi.org/10.1097/JSA.0000000000000311):
classification by **vascular zone** (red-red peripheral = best healing;
white-white central = poor) and tear pattern. **Repair > partial meniscectomy**
for long-term function (less degeneration). Plus Duong 2023 (JAMA): **degenerative
tears → exercise therapy first-line; surgery not indicated even with mechanical
symptoms**; acute displaced bucket-handle (true locking, block to extension) →
surgical. → engine: conservative exercise pathway default; flag a **locked knee /
block to full extension** for surgical referral.

---

## 6. Patellofemoral pain syndrome (PFPS)

**Hip + knee strengthening beats knee strengthening alone** for reducing pain and
improving activity (Nascimento 2017 SR/MA, *JOSPT*,
[DOI](https://doi.org/10.2519/jospt.2018.7365): hip+knee superior; effect achieved
without a measured strength change → likely motor-control/load mechanism). Add
foot orthoses or patellar taping for short-term relief; **no surgery indicated**
(Duong 2023). → engine: combined hip-abductor/ER + quadriceps program, activity/
load modification, optional taping/orthoses.

---

## 7. Patellar dislocation / instability

ESSKA 2024 formal consensus (Balcarek 2025, *KSSTA*),
[DOI](https://doi.org/10.1002/ksa.12637): first-time dislocation →
**individualised care; physical therapy is essential** for both operative and
non-operative paths; **bracing offers no clear long-term benefit**. MPFL
reconstruction preferred over repair when surgery indicated; recurrence risk
driven by trochlear dysplasia, patella alta, elevated TT-TG, skeletal immaturity.
Repair osteochondral defects ≥1 cm². Koh 2014 (*Clin Sports Med*),
[DOI](https://doi.org/10.1016/j.csm.2014.03.011): >1 dislocation greatly raises
recurrence. → engine: rehab-first (quad/VMO + hip control, gradual return),
flag recurrent dislocations + anatomic risk factors for surgical review.

---

## 8. Knee osteoarthritis

ACR/Arthritis Foundation 2019 guideline (Kolasinski 2020, *Arthritis Care Res*),
[DOI](https://doi.org/10.1002/acr.24131): **strong recommendations for exercise,
weight loss (if overweight), and self-efficacy/self-management programs**; tai chi,
cane, tibiofemoral bracing, topical/oral NSAIDs, intra-articular glucocorticoid.
KNGF PT guideline (van Doormaal 2020, *Musculoskeletal Care*),
[DOI](https://doi.org/10.1002/msc.1492): tailored, adequately-dosed exercise +
education + self-management; four treatment profiles by supervision need. → engine:
graded strengthening + aerobic + education + weight-management signposting;
not curative, function-focused.

---

## 9. Iliotibial band syndrome

van der Worp 2012 SR (*Sports Med*), [DOI](https://doi.org/10.2165/11635400-000000000-00000):
most common lateral knee injury in runners (5–14%). Evidence is limited/conflicting,
but management centres on **load management, hip-abductor/control strengthening,
and running-form/training modification**; ITB is not a simple "friction" problem
— hip/knee coordination and running style are key. → engine: relative rest from
provocative running, hip strengthening + running-load progression.

---

## 10. Osgood-Schlatter disease (tibial-tubercle apophysitis)

Circi 2017 review (*Musculoskelet Surg*), [DOI](https://doi.org/10.1007/s12306-017-0479-7):
**self-limiting** apophysitis of the tibial tubercle from repetitive extensor-
mechanism traction in adolescents; pain over the tibial tuberosity, worse with
jumping/stairs. **Symptomatic, activity-modification management**; usually
resolves at skeletal maturity. Surgery only for refractory adult cases (ossicle).
→ engine: load management, relative rest, quad/hamstring flexibility + gradual
strengthening; reassurance about self-limiting course; clinician review if not a
typical adolescent presentation.

---

## Cross-cutting design decisions

1. **Severity / urgency gate differs per entity** — ligament laxity grade
   (I–III); locked-knee block → meniscus surgical flag; recurrent instability →
   surgical review; PFPS/OA/ITB/OSD are non-urgent load problems.
2. **Surgical-pathway entities** (ACL high-demand pivoting, high-grade LCL/PLC,
   locked meniscus, recurrent patellar dislocation, PCL grade III/combined) are
   **clinician-gated** — the engine surfaces a referral and a post-op-style staged
   plan, never autonomous surgical clearance.
3. **Criteria-based return** reused from the quad engine (strength LSI ≥90% +
   hop battery ≥90%, both, not hop alone), especially for ACL.
4. **Extensor-mechanism tendons reuse the quad engine** — no duplication.
5. **Red flags** routed to in-person care: locked knee (block to extension),
   gross instability/giving way, immediate large haemarthrosis, inability to bear
   weight, fever/hot swollen joint (septic), high-energy/PLC patterns.
