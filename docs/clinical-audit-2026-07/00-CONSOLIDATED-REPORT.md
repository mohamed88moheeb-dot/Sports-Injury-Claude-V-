# Consolidated Clinical-Evidence Audit — Master Report (July 2026)

Independent, full-re-derivation audit of the RF, quad, and knee clinical engines.
Each of 12 conditions was re-researched from current sports-medicine evidence
(PubMed / Consensus / practice guidelines) **before** diffing against what the
repo actually encodes. Scope is scientific/clinical correctness only — UX and the
human-approval workflow are out of scope.

Per-condition detail lives in the sibling files; this report triages **every**
finding across all 12 by clinical severity and gives a single prioritized fix
plan.

---

## Headline

The clinical *reasoning* is, on the whole, good — several sections match 2024–2025
top-tier consensus almost exactly (PCL conservative management vs ESSKA/Delphi;
degenerative-meniscus exercise-first vs JAMA; ACL rehab-as-primary-pathway vs
Filbay 2025). The problems cluster in **four systemic patterns**, and a handful of
them are genuine patient-safety gaps where a surgical emergency or a skeletally-
immature avulsion can receive a self-paced exercise plan.

### Cross-cutting theme 1 — Safety escape-hatches are incomplete
Multiple engines stage/plan an injury without first ruling out the emergency that
mimics it: quad-tendon rupture can bypass its own screen; a skeletally-immature
"kicking strain" (AIIS avulsion) gets rehab; an un-extendable knee in the vastus
path gets "grade 3, seek review" instead of an urgent stop; the knee engine has no
neurovascular screen for posterolateral-corner injury, no acute-tubercle-avulsion
guard for OSD, and no systemic/night-pain red flags.

### Cross-cutting theme 2 — Spec-vs-implementation divergence (RF)
The "governed" RF JSON rule pack (all `approval_status: pending`, deliberately
conservative — forbids numeric confidence, structural grade, RTP-day prediction)
is **not what users see**. The live beta engine delivers exactly those prohibited
outputs. The governance layer isn't governing.

### Cross-cutting theme 3 — Citation integrity
Correct clinical claims wrapped in wrong bibliographic records, plus undeclared
cross-domain evidence transfer:
- RF `CROSS_2004` → an unrelated shoulder-instability paper; `JOKELA_2023` → an
  unrelated psychology paper (both under core severity/classification logic).
- `KNEE-CIT-001` (Duong 2023, covers only OA/PFPS/meniscus) mis-wired as the source
  for PCL and LCL/PLC; RESEARCH.md cites an MCL paper (PMID 19264708) for PCL.
- ACL hop-test LSI batteries (Nawasreh 2016, Thompson 2022) and patellar-
  tendinopathy loading studies (Lim 2018, Ruffino 2021) re-used to justify
  **muscle-strain and contusion** dosing/RTS without a label.

### Cross-cutting theme 4 — Currency (~5-year lag in places)
Tendinopathy still gates on isometric-first analgesia (not replicated post-2016)
and omits the current gold standard PTLE/Breda 2021; ITB still framed around
friction rather than compression/fat-pad impingement; OSD framed as cleanly
"self-limiting" (~⅓ symptomatic at 24 mo); self-report mapped onto MRI-based BAMIC
grades in the quad engine.

---

## P0 — Safety findings (fix first)

| # | Condition | Finding | Fix | Source |
|---|-----------|---------|-----|--------|
| 1 | Quad tendon rupture | **Gap A:** rupture screen only fires under narrow pain/mechanism conditions; an atraumatic/elderly/spontaneous rupture (CKD, steroids, fluoroquinolone) falls through to the **strain branch → autonomous plan**. Quad-tendon ruptures missed ~30%. | Make "unable to actively straighten / SLR" a **universal** red flag regardless of pain location/mechanism; screen any acute knee/anterior-thigh injury. Add uncertain→refer net (Gap B), open-wound/bilateral/atraumatic triggers. Harden safety tests (`plan===null`, per-sign, bypass case). | Neubauer 2006; Danaher 2022; Ramseier 2006 |
| 2 | RF diagnosis | Adolescent **AIIS-avulsion** pathway absent — age isn't a core input; a skeletally-immature "kicking strain" gets rehab, not imaging (AIIS = 33% of adolescent pelvic avulsions). | Collect age as core; immature + anterior-thigh + kicking/sprint → imaging/referral route. | Ferraro 2023 |
| 3 | Quad vastus strain | No decisive rupture red-flag stop — unable-to-extend / palpable gap maps to "grade 3 + soft caution," not urgent referral (extensor-mechanism rupture worsens if repair delayed >3 wk). | Add a hard extensor-mechanism-rupture STOP (out of self-paced engine); introduce a true grade 4. | Ibounig 2015; Lee 2013 |
| 4 | Knee OSD | No **acute tibial-tubercle avulsion** guard — sudden tubercle pain + can't-bear-weight in the same population needs urgent surgery, but OSD only requires gradual-overuse mechanism. | Add sudden-onset ± can't-bear-weight guard → urgent referral. | Kalifis 2023 |
| 5 | Knee (all entities) | **Systemic/night-pain red flags not wired** into `KNEE_RED_FLAGS` (night/constant rest pain, fever, weight loss) — infection/osteosarcoma can masquerade as OSD/overuse. A systemic pattern exists elsewhere in the codebase but isn't wired in. | Wire systemic/night-pain red flags into `KNEE_RED_FLAGS`. | std red-flag practice |
| 6 | Knee LCL/PLC | No **neurovascular screen** for suspected posterolateral-corner / high-energy injury (peroneal nerve up to ~24% of MLKI; popliteal artery in dislocations). | Add foot-numbness / foot-drop / distal-pulse screen → urgent route. | Moran 2022 |
| 7 | Quad contusion | Acute **120°-flexion trigger fires for any `days_since_injury ≤ 1`**, past the minutes–hours window where flexion-immobilization is supported; forcing an organized hematoma into deep flexion. Plus validated **myositis-ossificans risk factors omitted** and the specific MO tells (firm mass, ROM plateau) aren't in the automated withhold logic. | Constrain the 120° trigger to the immediate window; past it → gentle pain-free ROM. Add Ryan/West Point MO risk factors + MO tells to automation. | Aronen 2006; Ryan 1991; Larson 2002 |
| 8 | Knee meniscus / patellar instability | **Locked-knee routing collision:** a first-time patellar dislocation shedding an osteochondral fragment → true locked knee → routed to **meniscus** (rule 1 only catches *recurrent*). Also no first-time high-risk stratification / imaging flag. | Let patellar history/mechanism precede the generic locking→meniscus rule; add first-time risk stratification + MRI/osteochondral flag. | ESSKA 2024 Pt 1 & 2 |
| 9 | Knee OA | No **inflammatory-arthritis flag** for morning stiffness >30 min (silently falls through to PFPS instead of flagging an inflammatory cause). | Add inflammatory-arthritis flag (data already collected). | Jackson 2003; NICE NG226 |

---

## P1 — Governance & correctness

| Condition | Finding | Fix |
|-----------|---------|-----|
| RF (all) | **Spec-vs-engine divergence** — governed JSON pack prohibits numeric confidence / structural grade / RTP-day prediction; the live beta engine delivers all three. | Reconcile: bring the live engine within its own spec, or formally re-govern the spec. Top governance issue. |
| RF exercise/RTS | **LSI phase-gate** (70/85/90%) cites papers that don't establish those thresholds (Buckthorpe 2019, Hickey 2022), uses a **subjective self-estimate**, and shows "cleared" language — contradicting the engine's own RF-RTS-003. | Strip non-supporting citations, relabel BETA, or source real thresholds with honest low-certainty disclosure. |
| Quad vastus | Emits a **self-report-derived BAMIC grade+site** (BAMIC is MRI-only) and a fabricated `site='c'` heuristic. | Output clinical grade I–III for self-report; reserve BAMIC for imaging; remove the site heuristic. |
| RF citations | `CROSS_2004` → PMID 15090389; `JOKELA_2023` → PMID 36853900 (both currently resolve to unrelated papers); `KNAPIK_2023` understates operative RTP (14–37.6 wk); fabricated titles (BALIUS/GREEN); duplicate `BETA_ACUTE_REST_DAYS` key. | Correct PMIDs/titles; fix operative-RTP range; dedupe key; re-derive PMC11338860 phase→exercise mapping. |
| Knee PCL/LCL | `KNEE-CIT-001` mis-wired as PCL/LCL source; RESEARCH.md PMID 19264708 is an MCL paper cited for PCL; PCL `direct_blow` mechanism not routed. | Wire Wang 2018 (PCL) / Fortier 2023, Levy 2010 (LCL); fix MCL miscite; add PCL `direct_blow` trigger. |
| ACL RTS | "Meeting 90/90 reduces reinjury" **overstated** (low certainty; Losciale 2019, Zhou 2024); H:Q ratio missing. | Hedge the claim; add Kyritsis 2016 H:Q to the battery. |
| Quad (all) | **Undeclared cross-domain evidence transfer** — ACL hop batteries + tendinopathy loading studies applied to muscle strain/contusion RTS/dosing. | Label as extrapolated; add muscle-injury-specific RTS criteria/citations. |
| Knee OA routing | OA route requires the fuzzy `older_adult` bucket (while offering competing "Adult") and mandates stiffness ≤30 min — mid-40s–50s degenerative knees misroute to PFPS. | Treat any patient ≥45 as OA-eligible; make stiffness supportive not gating. |

---

## P2 — Currency & completeness

- **Tendinopathy:** demote isometric-first from mandatory gate to one option (not
  replicated post-2016); re-sequence/relabel the ladder to **PTLE (Breda 2021)**;
  add a diagnostic gate before staging; cite Silbernagel 2007 for the pain-monitor
  model it already implements; add MSR + BFR options.
- **ITB:** update mechanism to **compression / fat-pad impingement** (Fairclough
  2007, Geisler 2020–21); refresh treatment framing to "converging on hip-abductor
  strengthening ± gait retraining" (Sanchez-Alvarado 2024); add cadence cue.
- **OSD:** soften "self-limiting" (⅓ symptomatic at 24 mo; worse adult knee health —
  Holden 2021, Krommes 2025); refine the single "adolescent" age bucket.
- **Meniscus/patellar:** add a `return`-stage RTS battery to `patellar_instability`
  (only surgical entity lacking one); distinguish true block-to-extension from
  pseudolocking; add DREAM-trial nuance for young traumatic tears; reword "VMO
  activation."
- **RF recurrence:** represent the 15-wk window + recency gradient (OR 25.2) quantitatively; surface BAMIC-c/central-tendon as the slow-healing pivot.
- **Contusion grading:** convert %-ROM cutoffs (which under-grade moderate) to the
  absolute-degree literature (>90/45–90/<45); add Jackson-Feagin 1973 + Ryan 1991.
- **Housekeeping:** mechanical PMID/DOI re-verification pass (some agents were
  blocked from live PubMed this session); "PRICE" → "PEACE & LOVE"; Nascimento
  "2017" → 2018.

---

## Per-condition status matrix

| # | Condition | Core reasoning | Safety gap? | Biggest issue | File |
|---|-----------|:---:|:---:|---|------|
| 7  | RF diagnosis/classification | sound (spec) | **P0** | spec-vs-engine divergence; adolescent avulsion | `rf-diagnosis-classification.md` |
| 8  | RF citation integrity | — | — | 2 citations → unrelated papers | `rf-citation-integrity.md` |
| 9  | RF exercise/RTS | sound | — | LSI gate cites/uses unsupported thresholds | `rf-exercise-rts.md` |
| 10 | Quad vastus strain | sound | **P0** | no rupture stop; self-report BAMIC | `quad-vastus-strain.md` |
| 11 | Quad contusion | sound | **P0** | MO-safety trigger window + risk factors | `quad-contusion.md` |
| 12 | Quad tendinopathy | sound | — | ~5-yr currency lag (PTLE, isometrics) | `quad-tendinopathy.md` |
| 13 | Quad tendon rupture | **correct gate** | **P0** | screen bypass (Gap A) | `quad-tendon-rupture.md` |
| 14 | Knee ACL + PCL | strong | — | citation wiring; RTS claim overstated | `knee-acl-pcl.md` |
| 15 | Knee MCL + LCL/PLC | strong | **P0** | no neurovascular screen; LCL mis-cited | `knee-mcl-lcl-plc.md` |
| 16 | Knee meniscus + patellar instability | strong | **P0** | locked-knee routing collision | `knee-meniscus-patellar-instability.md` |
| 17 | Knee PFPS + OA | strong | **P0** | OA misrouting; no inflammatory flag | `knee-pfps-oa.md` |
| 18 | Knee ITB + Osgood-Schlatter | sound | **P0** | tubercle-avulsion + systemic red flags | `knee-itb-osgood.md` |

---

## What's genuinely strong — keep

- **PCL conservative management** matches the 2025 international Delphi consensus
  (PMID 40277372) almost exactly.
- **Degenerative meniscus → exercise first-line even with mechanical symptoms**
  (JAMA 2023 + OMEX/ESCAPE RCT base) — faithfully represented.
- **ACL rehab as a legitimate primary pathway** (Filbay 2025, Saueressig 2022).
- **Patellar-instability "bracing has no clear long-term benefit"** (ESSKA 2024;
  strengthened by Honkonen 2022 RCT).
- **PFPS hip+knee > knee-alone** — one of the best-supported claims in the whole
  system (Nascimento 2018 + ≥6 corroborating MAs).
- **The entire adult RF-SAF safety pack** and the JSON pack's conservatism
  (RF-REHAB-004's dosage-prohibition is exactly right).
- **Quad tendon-rupture gate logic** (OR-triggered on the three correct red flags,
  `autonomous_plan:false`, `plan:null`) — correct where it fires; the fix is
  *reaching* it, not the gate itself.
- Several exemplary citations with honest scope-labeling (RF: BARONI_2024,
  SERNER_2018, ISHOI_2020, GIAKOUMIS_2025; quad tendinopathy citations all resolve).

---

## Suggested execution order

1. **P0 safety (items 1–9)** — these are where a user could be routed away from a
   surgical emergency or skeletally-immature avulsion. Ship first, as a batch.
2. **RF spec-vs-engine reconciliation (P1)** — governance blocker for clinical
   sign-off.
3. **Citation-integrity sweep (P1)** — fix the two unrelated-paper PMIDs, the
   KNEE-CIT-001 mis-wiring, and label all cross-domain transfer in one pass.
4. **Currency refresh (P2)** — tendinopathy → PTLE, ITB → compression, OSD language,
   contusion grading, missing `return` stages.
