# Quadriceps Injury Engine — Clinical Research Foundation

> Evidence base for the quad engine, gathered via PubMed (June 2026). Every
> classification threshold, phase boundary, and exercise-modality choice below
> traces to a cited source. This document is the audit trail: if a number
> appears in the engine, it appears here with its source.
>
> **Attribution:** Clinical content synthesised from articles retrieved from
> **PubMed**. DOIs are listed per claim. Nothing here is clinical authority —
> it is beta-scoped, requires clinician review, and is not evidence-graded
> prescription.

---

## Scope

The quadriceps group = **rectus femoris** (RF, already covered by `rfBetaEngine`)
plus three **vastii** (lateralis VL, medialis VM, intermedius VI) and the
**extensor tendons** (quadriceps tendon, patellar tendon). This engine adds the
four entities RF did not cover:

| Module | Entity | Why it is clinically distinct from RF strain |
|---|---|---|
| `vastusStrain` | VL / VM / VI strain | **Monoarticular** — cross only the knee, not the hip. No hip-flexion/stretch interaction. Knee-extension–biased loading. |
| `contusion` | Quadriceps contusion ("dead leg" / charley horse) | Direct-impact pathology. Myositis ossificans risk. Knee-flexion ROM is the severity metric, not strength tests. Early gentle flexion, **no** aggressive stretch. |
| `tendinopathy` | Quad / patellar tendinopathy (jumper's knee) | Overuse, load-driven. Isometric→eccentric→HSR progression, not a 6-phase muscle-healing model. |
| `tendonRupture` | Quad / patellar tendon rupture | Surgical. Post-operative timeline driven by tissue healing + surgeon protocol, not self-paced loading. |

---

## 1. Vastus muscle strains (VL / VM / VI)

**Epidemiology.** Quadriceps injuries are the 3rd most common muscle-injury
group in soccer (after hamstring and adductor), 5% of all injuries and 19% of
all muscle-tendon injuries; they can cause longer absence than hamstring
injuries. Most *indirect* quad injuries affect RF; the vastii are more often
involved in *direct* trauma. (Lempainen 2022, [DOI](https://doi.org/10.1186/s13102-022-00428-y))

**Classification — British Athletics Muscle Injury Classification (BAMIC).**
Grade 0–4 by extent, with site suffix **a (myofascial)**, **b (musculotendinous)**,
**c (intratendinous)**. Injuries extending into tendon (class **c**) have
**delayed** return to full training, reflecting longer tendon healing; grade 3
injuries carry an increased re-injury rate. (McAleer 2022, RF in elite track &
field, [DOI](https://doi.org/10.1111/sms.14160); Hollabaugh 2025, quad/hamstring
in college football, [DOI](https://doi.org/10.1177/19417381251326531))

**Localisation by clinical test.** Proximal injury → painful/weak **resisted hip
flexion** (RF-specific, biarticular). Mid/lower injury → reduced **knee-extension**
strength. Complete distal quad/patellar tendon tear → cannot extend knee against
resistance. The vastii, being monoarticular, present with knee-extension deficit
**without** the hip-flexion component that flags RF. (Lempainen 2022, [DOI](https://doi.org/10.1186/s13102-022-00428-y))

**Healing timeline (applies to all muscle strains).** (1) Inflammation /
degeneration 1–3 days; (2) regeneration 3–4 weeks; (3) maturation & remodelling
3–6 months. (Lempainen 2022, [DOI](https://doi.org/10.1186/s13102-022-00428-y))

**Treatment arc.** PRICE + controlled loading acutely → pain-free active/passive
stretching with isometric then eccentric contractions → gym-based loading →
field progression with rising load. Avoid pain; pain drives compensation and
re-injury. (Lempainen 2022, [DOI](https://doi.org/10.1186/s13102-022-00428-y))

**Vastus medialis / VMO note.** VM (esp. the oblique fibres, VMO) is central to
patellofemoral tracking; terminal-range knee extension and weight-bearing
quadriceps work bias VMO activation. Relevant when a VM strain coexists with
anterior knee / patellofemoral symptoms. (vastus medialis activation literature,
PubMed PMIDs 26940378, 20386128 — used as principle support only.)

**Return-to-sport.** Greatest agreement: full symptom resolution, full strength
recovery, sport-specific movements pain-free, functional-test + GPS clearance,
medical clearance, and respect for biological healing time. (Lempainen 2022,
[DOI](https://doi.org/10.1186/s13102-022-00428-y))

---

## 2. Quadriceps contusion ("dead leg" / charley horse)

**Mechanism & site.** Direct blow during tackling/collision. Most frequently
affects **vastus intermedius, vastus lateralis, vastus medialis** (VI is deep
against femur → high MO risk). Severity depends on impact energy and whether the
muscle was contracted or relaxed. (Lempainen 2022, [DOI](https://doi.org/10.1186/s13102-022-00428-y))

**Severity grading by knee-flexion ROM (re-assess at 24 h).**
| Grade | Passive knee flexion | Prognosis |
|---|---|---|
| Mild | **> 50%** of ROM (≈ >90°) | 2–5 days |
| Moderate | **30–50%** ROM | intermediate |
| Severe | **< 30%** ROM (≈ <45°) | 20–25+ days |

Pain peaks and function drops in first 24 h → the 24 h re-assessment is
mandatory before grading. (Lempainen 2022, [DOI](https://doi.org/10.1186/s13102-022-00428-y);
Kary 2010, [DOI](https://doi.org/10.1007/s12178-010-9064-5))

**Acute protocol — Aronen 120° flexion.** Within ~10 min of injury, passively
flex the knee *painlessly* to **120°** and hold continuously for **24 h** in a
brace; discontinue at 24 h, then active pain-free quad stretching several times
daily + pain-free isometric quad strengthening ASAP. Goals: pain-free flexion,
quad size/firmness equal to uninjured side. Mean return **3.5 days** (range
2–5), 1/23 MO on imaging. (Aronen 2006, [DOI](https://doi.org/10.1097/01.jsm.0000244605.34283.94))

**Myositis ossificans — the key complication.** Ectopic calcification inside the
muscle after contusion; risk rises with larger contusions. Prevention: minimise
hematoma size, **restore ROM quickly**, **do NOT start aggressive physiotherapy
too soon**, consider NSAIDs. Avoid corticosteroids. Warning signs of severe
contusion: marked decreased knee ROM + sympathetic knee effusion. Early gentle
flexion exercise *reduces* MO likelihood and hastens recovery. (Lempainen 2022,
[DOI](https://doi.org/10.1186/s13102-022-00428-y); Larson 2002, [DOI](https://doi.org/10.3810/psm.2002.02.174);
Kary 2010, [DOI](https://doi.org/10.1007/s12178-010-9064-5))

**Engine consequence:** contusion gets its **own** non-RF pathway — ROM-first,
stretch-cautious, MO-monitoring. The single most important divergence from
strain rehab is *no aggressive early stretch* and *knee-flexion ROM as the gate*.

---

## 3. Quad / patellar tendinopathy (jumper's knee)

**Nature.** Load-driven overuse tendon pain, high prevalence in jumping athletes,
long-lasting. Managed with progressive resistance loading, not a muscle-healing
phase model. (Burton 2022 scoping review, [DOI](https://doi.org/10.1016/j.ptsp.2022.03.002))

**Loading progression (evidence-ranked).**
- **Isometric** — immediate analgesia: a single bout of isometric quads
  (e.g. 5×45 s holds) reduced single-leg-decline-squat pain by **6.8/10**,
  sustained ≥45 min, released cortical inhibition, increased MVIC 18.7%.
  Best for **in-season short-term pain relief** (systematic-review Grade A).
  (Rio 2015, [DOI](https://doi.org/10.1136/bjsports-2014-094386); Lim 2018, [DOI](https://doi.org/10.1002/pri.1721))
- **Eccentric** — single-leg decline squat; effective for **long-term** pain
  reduction and function (Grade B). Most common exercise across the literature.
  (Lim 2018, [DOI](https://doi.org/10.1002/pri.1721); Burton 2022, [DOI](https://doi.org/10.1016/j.ptsp.2022.03.002))
- **Heavy slow resistance (HSR)** — good short- AND long-term clinical effect,
  with pathology improvement and increased collagen turnover; highest patient
  satisfaction vs eccentric and corticosteroid at 6 months. (Kongsgaard 2009,
  [DOI](https://doi.org/10.1111/j.1600-0838.2009.00949.x); Lim 2018, [DOI](https://doi.org/10.1002/pri.1721))
- **Inertial flywheel** — equivalent to HSR at 12 weeks; an alternative option.
  (Ruffino 2021, [DOI](https://doi.org/10.1016/j.ptsp.2021.08.002))

**Corticosteroid** — good short-term but **poor long-term** outcomes; not a
loading substitute. (Kongsgaard 2009, [DOI](https://doi.org/10.1111/j.1600-0838.2009.00949.x))

**Outcome measure.** VISA-P questionnaire (function/symptoms) is the standard
tracking instrument. (Kongsgaard 2009; Ruffino 2021)

**Engine consequence:** tendinopathy gets a **4-stage loading ladder**
(isometric → isotonic/HSR → energy-storage/eccentric → return to sport), gated
on pain monitored via the single-leg decline squat, NOT the 6-phase muscle model.

---

## 4. Quad / patellar tendon rupture

**Nature & diagnosis.** Usually rupture of an already-degenerated tendon after an
eccentric quads contraction; risk rises with age, repetitive micro-trauma,
genetic predisposition, systemic disease, certain medications. Functional
extensor-mechanism deficit (extension lag, inability to SLR / extend against
gravity) is the diagnostic key; US/MRI confirm when equivocal. (Ibounig 2015,
[DOI](https://doi.org/10.1177/1457496915598761); Lee 2013, [DOI](https://doi.org/10.1055/s-0033-1353989))

**Surgery is time-critical.** Acute repair preferred; **delay > 3 weeks →
significantly poorer outcomes**. Chronic tears need augmentation/graft.
(Ibounig 2015, [DOI](https://doi.org/10.1177/1457496915598761))

**Post-operative rehab.** Early functional rehab with **full weight-bearing**
(knee locked in extension, crutch support) is **safe and not inferior** to
restrictive immobilisation; patients returned to work ~10 days sooner with no
increase in re-rupture. Limited-arc motion early: **active flexion + passive
extension**, advanced progressively → full active ROM → strengthening. A
removable splint / hinged brace with protected full WB and limited passive
mobilisation for ~6 weeks is a common middle path. (Langenhan 2012, [DOI](https://doi.org/10.1007/s00167-012-1887-8);
Lee 2013, [DOI](https://doi.org/10.1055/s-0033-1353989); Ibounig 2015, [DOI](https://doi.org/10.1177/1457496915598761))

**Engine consequence:** rupture is **post-surgical, clinician-led**. The engine
must NOT autonomously progress it. It surfaces a brace/ROM-stage timeline keyed
off weeks-since-surgery, hard-gates every progression behind clinician sign-off,
and routes the user to in-person care. Complications to monitor: extensor lag,
knee stiffness, re-rupture.

---

## Cross-cutting design decisions

1. **Shared 6-phase muscle model** (Foundation→Resilience, from RF) is reused for
   **vastus strain** and **contusion** (post-acute), because both are muscle
   healing. Tendinopathy and rupture get their **own** stage models.
2. **Severity gate differs per entity:** strain → BAMIC grade + functional band;
   contusion → knee-flexion ROM; tendinopathy → VISA-P / decline-squat pain;
   rupture → weeks-post-op + clinician gate.
3. **Stretch policy differs:** strain allows progressive stretch; contusion is
   **stretch-cautious** early (MO risk); tendinopathy avoids compressive/stretch
   provocation early (deep squat); rupture forbids end-range stretch until cleared.
4. **All four route through one orchestrator** keyed on `injury_entity`, with a
   shared assessment intake and shared check-in/progress core.
