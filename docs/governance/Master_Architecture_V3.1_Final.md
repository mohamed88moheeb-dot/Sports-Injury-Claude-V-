---
title: "Sports Injury Diagnosis & Rehabilitation Platform"
subtitle: "Master Architecture V3.1 — Unified Controlling Architecture"
date: "15 June 2026"
lang: en
---

# Sports Injury Diagnosis & Rehabilitation Platform
## Master Architecture V3.1 — Unified Controlling Architecture
*Autonomous clinical intake, diagnosis, rehabilitation and decision contract — consolidated*

V3.1 is the single controlling architecture for the platform. It compiles three predecessors that each answered the one before it into one coherent specification:

- **V2.2 — the brain.** The clinical and product architecture: how the system takes in an athlete, reasons about an injury, grades it, plans rehabilitation, coaches, progresses, and knows when to stop and refer.
- **V2.2.1 — the nervous system.** The technical contracts that carry signals between the language layer and the deterministic engines: the versioned AI–engine wire, the typed JSON Schemas, machine-readable activation and traceability.
- **V2.2.2 — the engineering guardrails.** The semantic enforcement that makes contradiction impossible to ship: a closed safety-state matrix, cross-object wire invariants, a governed unit system, the referral-resolution lifecycle, package integrity and the CI gate.

V3.1 does not introduce new clinical content, new thresholds, or new medical claims. It unifies, reconciles and supersedes the three documents as a single reading, carrying forward every behaviour that the latest verification proved and preserving the same honesty discipline: structure and contracts only, no fabricated clinical evidence, and an explicit list of what still blocks a real-world launch.

> **What V3.1 is.** One controlling document. Where V3.1 restates a predecessor, V3.1 governs. The only material that remains in force outside this document is the explicitly enumerated set of Normative External Dependencies in §3.3; nothing is inherited by a general "where silent" rule.

> **What V3.1 is NOT.** It is not medical advice, a regulatory submission, or clinical content. It introduces no numeric clinical thresholds, likelihood ratios, or confidence percentages. Those remain governed clinical content authored through the V2 Section 10 pipeline and referenced by version. This document specifies structures, contracts, behaviour and verification only.

**Document control**

| Field | Value |
|---|---|
| Title | Master Architecture V3.1 — Unified Controlling Architecture |
| Consolidates | V2.2 (clinical/product), V2.2.1 (technical contracts), V2.2.2 (contract hardening) |
| Status | Controlling architecture. Engineering layer frozen (Part VII). Clinical content and clinical approval remain open (Part VIII). |
| Supersedes | V2.2, V2.2.1 and V2.2.2 as separate reading. V2, V2.1 and the AI Orchestration Layer remain in force only as the explicitly enumerated Normative External Dependencies (§3.3); there is no general "where silent" dependency. |
| Scope of change vs predecessors | None additive in clinical content: V3.1 is a consolidation. It reconciles vocabularies and presents one system; it adds no new clinical rules. V3.1 is a controlled correction pass over V3 (control hierarchy, content-layer architecture, verification wording); see the Amendment Log. |
| Engineering verification | 38 Draft 2020-12 schemas, 124 fixtures, one authoritative manifest over 211 governed files. Verification provenance (independently reproduced vs. inherited) is stated precisely in §29.4. |
| Prohibited content | Numeric clinical thresholds, likelihood ratios, confidence percentages, fabricated evidence, fabricated professional review |
| Clinical standing | Engineering architecture only. Not clinical approval, prospective validation, regulatory authorization, or formal medical clearance. |
| Readership | Sports-medicine physician, physiotherapist, S&C coach, clinical safety officer, CTO, knowledge engineer, data architect, regulatory/quality lead |

---

## Table of Contents

**Part I — Orientation**
1. [What V3.1 is, and the lineage it consolidates](#1-what-v31-is-and-the-lineage-it-consolidates)
2. [First principles carried through every layer](#2-first-principles-carried-through-every-layer)
3. [System overview: brain, nervous system, guardrails](#3-system-overview-brain-nervous-system-guardrails)

**Part II — The Brain (clinical & product architecture)**
4. [Universal Athlete & Episode Context Gate](#4-universal-athlete--episode-context-gate)
5. [Mandatory Input Classification System](#5-mandatory-input-classification-system)
6. [Diagnosis Anchor Quality Model](#6-diagnosis-anchor-quality-model)
7. [Staged & Continuous Safety Model](#7-staged--continuous-safety-model)
8. [Separated Confidence Outputs](#8-separated-confidence-outputs)
9. [Self-Test Capability & Reliability Model](#9-self-test-capability--reliability-model)
10. [Known-Diagnosis Pathway](#10-known-diagnosis-pathway)
11. [Concurrent & Secondary Injuries](#11-concurrent--secondary-injuries)
12. [Current-Capacity Assessment & Capacity-to-Demand Gap](#12-current-capacity-assessment--capacity-to-demand-gap)
13. [Rehabilitation Prescription, Scheduling, Monitoring & Non-Response](#13-rehabilitation-prescription-scheduling-monitoring--non-response)
14. [Media Analysis, Tiered Return Batteries & Autonomy Boundary](#14-media-analysis-tiered-return-batteries--autonomy-boundary)
15. [End-to-End Flows: diagnosis and rehabilitation](#15-end-to-end-flows-diagnosis-and-rehabilitation)
16. [Governance for Aggregate Autonomous Performance](#16-governance-for-aggregate-autonomous-performance)

**Part III — The Nervous System (technical contracts)**
17. [The Revised AI–Engine Wire](#17-the-revised-aiengine-wire)
18. [Typed Data Contracts](#18-typed-data-contracts)
19. [Machine-Readable Activation & Traceability](#19-machine-readable-activation--traceability)
20. [Referral-Resolution Lifecycle](#20-referral-resolution-lifecycle)

**Part IV — The Guardrails (engineering enforcement)**
21. [Closed Safety-State Matrix](#21-closed-safety-state-matrix)
22. [Wire Cross-Object Invariants](#22-wire-cross-object-invariants)
23. [Unit & Dimension System](#23-unit--dimension-system)
24. [Confidence, Evidence & Output Locks](#24-confidence-evidence--output-locks)
25. [Media-State Hardening](#25-media-state-hardening)
26. [Date/Time, Closed-World Policy & Format Validation](#26-datetime-closed-world-policy--format-validation)

**Part V — Verification & Integrity**
27. [The CI Gate](#27-the-ci-gate)
28. [Traceability & Package Integrity](#28-traceability--package-integrity)
29. [Test Catalogue & Verification Results](#29-test-catalogue--verification-results)

**Part VI — Compatibility**
30. [Migration & Backward Compatibility](#30-migration--backward-compatibility)

**Part VII — Standing**
31. [Engineering Verdict](#31-engineering-verdict)

**Part VIII — Honesty**
32. [Remaining Launch Blockers](#32-remaining-launch-blockers)
33. [Authorship & Approval Status](#33-authorship--approval-status)

**Part IX — The Clinical Knowledge & Exercise Content Layer**
34. [The Clinical Knowledge Layer](#34-the-clinical-knowledge-layer)
35. [The Exercise Knowledge System](#35-the-exercise-knowledge-system)
36. [The Binding Chain](#36-the-binding-chain)

**Appendices**
- [Appendix A — Consolidated Schema Catalogue (38 schemas)](#appendix-a--consolidated-schema-catalogue)
- [Appendix B — Normative Implementation Rules](#appendix-b--normative-implementation-rules)
- [Appendix C — Lineage & Reconciliation Map](#appendix-c--lineage--reconciliation-map)
- [Appendix D — Version History](#appendix-d--version-history)

---

# Part I — Orientation

# 1. What V3.1 is, and the lineage it consolidates

This platform diagnoses sports injuries and produces hyper-personalized rehabilitation programmes, operating autonomously within a fenced clinical scope. It conducts intake, reasons about the injury, grades severity, builds and coaches a rehabilitation plan, progresses it, and — its single most important autonomous act — stops and refers to a real clinician when it cannot safely continue.

Three documents built this architecture, each a response to a formal review of the one before it. V3.1 is their consolidation into a single controlling specification.

| Predecessor | Role | What it contributed | What a review found |
|---|---|---|---|
| **V2.2** | The brain | The full clinical and product architecture: context gate, input classification, anchor quality, staged safety, separated confidence, capacity/demand, rehabilitation composition, monitoring, non-response, tiered return, governance. | Conceptually accepted, but the seams between the written architecture, the orchestration wire and the JSON schemas were not yet implementable. |
| **V2.2.1** | The nervous system | A versioned AI–engine wire able to carry the full state space; repaired and enforced JSON Schemas; machine-readable activation and traceability; a referral-resolution lifecycle. | Accepted as the integration correction, but several contract-hardening gaps remained that its CI did not catch. |
| **V2.2.2** | The engineering guardrails | A closed safety-state matrix; cross-object wire invariants; a governed unit/dimension system; outcome-bound referral reopening; package integrity; an expanded CI gate. Reached an engineering freeze. | Closed every reproduced defect; produced the verified, frozen engineering layer V3.1 now carries. |

> **The reading order changed, the truth did not.** V3.1 tells one story instead of a base document plus two correction logs. Every behaviour described here is the latest verified behaviour from V2.2.2, set inside the clinical reasoning of V2.2 and carried over the contracts of V2.2.1.

## 1.1 How to read this document

Part II is the clinical brain: what the system reasons about and why. Part III is the nervous system: the contracts that move signals between the language layer and the deterministic engines. Part IV is the guardrails: the semantic rules that make contradictory states impossible to ship. Parts V–VI cover verification, integrity and compatibility. Parts VII–VIII state plainly what is frozen and what still blocks a real launch.

A reader who only wants the clinical model can read Part II. A reader implementing the contracts needs Parts III–V. A reviewer judging whether this is safe to build needs Parts IV, V, VII and VIII.

# 2. First principles carried through every layer

These principles hold identically across the brain, the nervous system and the guardrails. They are the invariants that every later section either implements or enforces.

1. **The language model communicates; deterministic engines decide.** No language model alters engine-owned clinical state. The wire carries only `explain_tokens` describing what the assistant may say; it cannot change safety, confidence, diagnosis, plan or referral state.
2. **Autonomous by default; knows when to stop.** The platform operates on its own within a governed scope, and stops and refers rather than silently substituting its own judgement for a control that genuinely required a human.
3. **Emergency precedence is absolute.** Immediate emergency detection runs before, or concurrently with, scope determination, overrides every scope state, and always permits emergency signposting. An out-of-scope result can never suppress an emergency result.
4. **Unknown is not safe; missing evidence is not clearance.** A gate-clearing variable whose value is unknown is treated as the unsafe case until resolved. A required missing input reduces confidence and locks the associated output.
5. **Identity is not capacity.** A diagnosis — even a clear MRI — settles what an injury is, never how the athlete is today. No anchor bypasses safety screening, severity, stage, contraindication checks, or loading-tolerance assessment.
6. **No silent override.** Nothing clinically material is ever overridden silently. A weak anchor may be overridden by stronger current evidence, but the user is told, the reason is recorded, and the original is retained in the audit trail. A strong documented anchor that conflicts with presentation triggers external reassessment.
7. **No raw image reaches the language model.** Movement, photo and video findings come only from a separately validated subsystem, encoded by an explicit media state.
8. **Confidence is qualitative until calibrated.** No invented percentages. Numeric confidence is unlocked per object only after calibration against labelled cases, and the schemas enforce this.
9. **No clinical thresholds live in the architecture.** Loading parameters, likelihood ratios, severity boundaries and return thresholds are governed clinical content, referenced by version, never hard-coded into a contract.
10. **Legacy compatibility fails safe.** Any downgrade to an older consumer collapses every non-clear state to a hard stop; a legacy consumer can lose detail but can never interpret a blocked or referral state as permission to proceed.

> Each principle reappears later as an enforced rule. Principle 3 is the safety-state matrix (§21) and the emergency front door (§7.1). Principle 4 is the missing-evidence invariant (§24). Principles 5–6 are the anchor model (§6) and the wire's anchor-conflict invariant (§22). Principle 7 is media hardening (§25). Principle 8 is the calibration invariant (§24). Principle 10 is the migration projection (§30).
# 3. System overview: brain, nervous system, guardrails

The platform is one autonomous clinical system expressed in three layers. The brain reasons; the nervous system carries typed signals; the guardrails refuse contradictions. The same episode flows through all three.

```text
                         ATHLETE (one of three entry paths)
                                      |
   ============================ THE BRAIN (Part II) ============================
   Minimal Emergency Screen  ->  Scope Check  ->  Universal Context Gate
        |                                              |
        | (emergency outranks everything)              v
        |                              Input Classification & Activation
        v                                              |
   Staged Safety (5 screens, continuous) <------------ +--> Diagnosis (anchor quality,
        |                                              |     dependence-aware, separated
        |                                              |     confidence)
        v                                              v
   Severity -> Stage -> Current Capacity -> Capacity-to-Demand Gap
        |                                              |
        v                                              v
   Rehabilitation Prescription -> Scheduling -> Monitoring -> Progression / Non-Response
        |                                              |
        v                                              v
   Tiered Return-to-Training / Return-to-Performance (decision support, not clearance)

   ===================== THE NERVOUS SYSTEM (Part III) =========================
   Every decision above is emitted on the versioned AI-Engine Wire as typed objects:
   safety_state | six confidence objects | plan_response | referral | explain_tokens
   carried by 38 JSON Schemas; activation and traceability are machine-readable.

   ====================== THE GUARDRAILS (Part IV) =============================
   Before anything ships, semantic validation refuses contradiction:
   closed 8-state safety matrix | cross-object wire invariants | unit/dimension
   compatibility | referral re-entry rules | media-state limits | closed-world schemas
```

## 3.1 The three entry paths

Every path passes through the same gate and the same safety screens; they differ only in where diagnostic work begins.

| Path | Description | Where diagnosis starts |
|---|---|---|
| Path 1 — Understand my injury | No external diagnosis supplied | Full diagnostic workup; the engine's own posterior is the anchor |
| Path 2 — Known diagnosis | The athlete supplies a diagnosis | Anchor-quality check may suppress only redundant identity questions; a vague label suppresses nothing |
| Path 3a — Report text | A written clinical/imaging report | Anchor built from extracted findings (text extraction only) |
| Path 3b — Raw image | An MRI/US/X-ray image | Routed to the validated imaging-AI subsystem or referred; never interpreted by the language model |

## 3.2 The engines

The deterministic engines are inherited from V2 and unchanged in V3.1; the consolidation only makes their inputs and seams explicit and typed.

| Engine | Owns | Consumes (typed) |
|---|---|---|
| Diagnosis Engine | Injury identity and ranked differentials | Context, anchor quality, test results, priors |
| Severity Engine | Grade / severity range | Functional loss, symptom burden, imaging where present |
| Rehab Engine | The programme | `rehab_safety_confidence`, `rehab_stage_confidence`, current capacity, safety state — never diagnosis confidence alone |
| Progression logic | Progress / maintain / regress | Monitoring response, adherence, capacity change |
| Safety & Governance plane | Live safety state and lock-and-refer | All screens, continuously |

## 3.3 Normative External Dependencies

V3.1 is self-contained for the clinical reasoning architecture (Part II), the technical contracts (Part III), the engineering guardrails (Part IV) and verification (Part V). It does not redefine the foundational operating model and the deterministic engine internals established in the predecessor foundation documents. Those remain in force, but **only** as the precisely enumerated dependencies below. There is no general "where silent" inheritance: any material not listed here and not restated in V3.1 is not a normative part of this architecture.

| # | External source | Sections that remain active | Why it remains external | Conflict resolution |
|---|---|---|---|---|
| D1 | **V2.1 — Autonomous Operating Model** | Autonomous operation within a fenced clinical scope; no routine human reviewing each diagnosis/programme/progression; the three entry pathways; lock-and-refer logic | Defines the product's operating posture, not its contracts; restating it in full would broaden V3.1 beyond a consolidation | V3.1 governs on any overlap (e.g. entry paths in §3.1, lock-and-refer in §7/§20). Where V3.1 is explicit, the V2.1 text is superseded. |
| D2 | **V2 — Foundational Clinical Engines** | Clinical Knowledge Base (eight ontologies); Dependence-aware Diagnosis Engine internals; Severity Engine internals; Rehab Engine internals; Exercise Library + load-equivalence; Longitudinal Athlete Profile; Outcome Learning System; evidence provenance and versioning | These are engine implementations and content stores that V3.1 *consumes and binds* (Part II §13–14, §3.2, and the new Part IX) rather than re-specifies | V3.1's typed contracts and the Clinical Knowledge & Exercise Content Layer (Part IX) govern how these engines are fed and how content reaches them. Engine-internal behaviour not contradicted by V3.1 remains as defined in V2. |
| D3 | **AI Orchestration Layer** | Separation of the AI communication layer from the deterministic clinical engines | It is the substrate the first principle (§2.1) depends upon; V3.1 enforces the boundary but does not re-author the orchestration substrate | V3.1's wire (§17) and first principles (§2) govern the boundary. Any orchestration behaviour permitting the LLM to alter engine state is void under §2.1 and Appendix B rule 1. |

> **Single tie-break rule.** Wherever an external dependency and V3.1 could both appear to apply, **V3.1 governs**. The dependencies above are retained for engine internals, the foundational knowledge stores, and the operating posture — not to reintroduce any contract, vocabulary, or safety behaviour that V3.1 specifies.

---

# Part II — The Brain (clinical & product architecture)

# 4. Universal Athlete & Episode Context Gate

One compulsory gate runs for every entry path before any diagnosis, severity assessment, or rehabilitation generation. It does not replace the common safety-and-readiness gate; it runs in front of it and feeds it. Its job is to guarantee that every input the downstream engines depend on is either present in the Longitudinal Athlete Profile, re-confirmed for the current episode, or explicitly marked unknown with a defined consequence.

> **Gate placement (all paths).** ENTRY → Minimal Emergency Screen (§7.1) → Scope check → Universal Context Gate → path-specific diagnostic work → common safety-and-readiness gate → severity → stage → rehab. The gate never asks every possible question; it activates only the variables the case needs, using the classification and activation rules in §5.

## 4.1 What the gate resolves per variable

For every variable, the gate resolves exactly one provenance state and one obligation state, plus its engine scope, inference policy and decision impact.

| Dimension | Allowed states |
|---|---|
| Provenance | stored_in_profile · reconfirm_for_episode · newly_collected · inferred_unconfirmed · derived |
| Obligation | mandatory · conditionally_mandatory · optional · gate_clearing |
| Engine scope | diagnosis_only · rehab_only · return_to_performance · shared · communication_only |
| Inference policy | may_infer_then_confirm · must_confirm · prohibited_to_infer |
| Contradiction | contradiction_resolution_applies: true \| false |
| Lock capability | can_trigger_lock: true \| false |
| Decision impact | changes_priors · changes_severity · changes_rehab_selection · changes_progression · changes_rtp_criteria (any subset) |

> **Stored vs. re-confirmed.** Profile data is a prior, never a present fact. Identity-stable descriptors (date of birth, dominant limb, sport) are read from the profile without re-asking. Anything that changes between episodes — current symptoms, current load, current medications, current equipment, current goals — must be re-confirmed for this episode even if a value exists in the profile. A gate-clearing safety variable is always re-confirmed and never assumed from history.

## 4.2 What the gate covers

The gate organizes the full input surface: athlete identity and clinical context (age and maturity, clinical sex-related variables, pregnancy and menstrual/energy-availability factors where relevant); injury history (prior injuries, recurrence, surgery, failed treatment); the current episode (mechanism, location, laterality, onset); symptoms and irritability; medical and safety context (history, medications, red-flag families); training and load context (recent load, sprinting/acceleration/jumping/kicking exposure); rehabilitation resources and constraints (equipment, environment, time); and goals and required performance (sport, position, level, return goals).

This input completeness is the original reason V2.2 existed: to make every clinical input explicit enough that an implementer cannot accidentally omit one.

# 5. Mandatory Input Classification System

Every input carries a class that determines when it must be collected. The classification is the discipline that keeps the gate from either over-asking or silently proceeding on a missing essential.

## 5.1 The four classes

| Class | Meaning | Collection rule |
|---|---|---|
| A — always | Required for every case | Always collected; no activation predicate |
| B — conditional | Required when a clinical condition holds | Collected only when its activation predicate is true (e.g. pregnancy status when biological-sex-clinical = female) |
| C — situational | Required in a situation or stage | Collected when the situation/stage applies |
| D — optional | Enrichment | Collected opportunistically |

## 5.2 The activation discipline

A Class B/C input is collected only when an activation predicate makes it relevant; this is what makes "where medically relevant" executable rather than prose (§19). The same machinery enforces purpose limitation and data minimisation: an input that no active predicate selects is not collected at all. When a required input is missing, the engine selects exactly one defined response — ask, estimate conservatively, restricted introductory plan, withhold plan, or refer — and never silently proceeds (§13.2).

# 6. Diagnosis Anchor Quality Model

When an athlete supplies an external diagnosis (Paths 2 and 3), it is an *anchor*: an identity claim evaluated for strength before it can suppress any questioning. The linear E1–E5 source hierarchy is replaced by a multidimensional quality profile, and silent override is removed.

## 6.1 Anchor quality dimensions

An anchor's strength is a profile across these dimensions, not a single rank. Source authority is retained as one dimension but is no longer the whole story.

| Dimension | What it captures | Effect |
|---|---|---|
| source_authority | Self-report / prior clinician / written report / structured findings / validated imaging-AI | Base weight on identity |
| report_authenticity | Document actually present vs. recalled | Downgrades recalled-only anchors |
| diagnosis_date | How recent | Older lowers current relevance |
| current_episode_match | Whether it relates to THIS episode | Mismatch → not an anchor for now |
| anatomical_match | Exact structure / region / laterality | Partial match downgrades |
| diagnosis_specificity | Named structure vs. vague label | Vague → insufficient anchor (§10) |
| wording_certainty | confirmed / suspected / possible / incidental | Lower certainty lowers weight |
| report_completeness | Whether the report is partial | Incomplete widens uncertainty |
| subsequent_event | Surgery or new injury afterward | May invalidate the anchor |
| current_clinical_concordance | Agreement with present findings | Drives reconciliation |
| incidental_possibility | Could be incidental, not causal | Caps identity authority |
| revised_later | Revised in a later report | Latest revision governs |

Anchor strength resolves to a governed `tier` (strong / moderate / weak / insufficient) via a versioned weighting model. Safety floors are enforced in the contract: `no_match`, anatomical mismatch, or a vague label can never produce a strong tier, and a strong tier requires exact diagnosis, exact structure and a current-episode match (§18, §22).

## 6.2 What an anchor settles — and what it never settles

> **Identity is not capacity.** A diagnosis anchor settles WHAT the injury is, and only when episode, location, side and current presentation align. It says nothing about HOW the athlete is today. No anchor — however strong, including validated imaging-AI — bypasses safety screening, severity, stage, contraindication checks, or loading-tolerance assessment.

## 6.3 Reconciliation and the removal of silent override

The earlier model allowed a weak anchor to be "overridden silently" by current findings. V3.1 removes this:

1. **Weak anchor vs. strong current findings:** the engine may re-open the differential and follow the findings. The override is surfaced to the user, the reason recorded, the original anchor retained in the audit trail. It is never silent.
2. **Strong anchor vs. conflicting current findings:** the engine does not replace it autonomously. It surfaces the discrepancy and triggers external reassessment — a documented finding disagreeing with presentation is exactly what a clinician should adjudicate. The wire enforces this as a hard invariant (§22).
3. **Either way:** the anchor, its quality profile, any conflict and the resolution are written to the immutable audit trail and shown with appropriate framing.

> **No anchor bypasses the gate.** An anchor suppresses redundant diagnostic questioning only. It never suppresses Safety Screens 1–5, severity, stage, current-capacity assessment, contraindications, or loading-tolerance assessment.

# 7. Staged & Continuous Safety Model

Safety is not one red-flag check at the start. Five explicit screens run at defined points and continuously thereafter. The detection logic is the governed red-flag ontology and contraindication cross-check; this architecture specifies *when* each screen fires and how status transitions. The full enforceable state model is the closed matrix in §21.

## 7.1 Emergency precedence — the corrected front door

```text
Minimal Emergency Screen
        |
        +-- emergency present --> EMERGENCY_SIGNPOSTING (overrides all scope states)
        |
        +-- no emergency --> Scope Check --> Universal Context Gate
```

Emergency signposting always outranks scope. An out-of-scope classification can never suppress emergency messaging, and the minimal emergency screen requires only a minimal pre-context input set so it can always fire.

## 7.2 The five safety screens

| Screen | When it runs | What it evaluates |
|---|---|---|
| 1 — Immediate emergency | At the very start, before any self-test and before the gate completes | Emergency families answerable immediately (neurovascular compromise, suspected unstable fracture, cardiac/syncope, cauda equina) |
| 2 — Region & mechanism | Once enough is known to activate relevant families | Region/mechanism-specific flags (DVT after immobilisation, compartment syndrome, septic joint, bone-stress/RED-S) |
| 3 — Pre-test | Before each guided physical/functional test | That test's own contraindications and stop rules |
| 4 — Pre-rehabilitation | Before any programme is generated | Composed-plan contraindication cross-check across all active injuries |
| 5 — Continuous | During check-ins, sessions, progression, RTP | New or worsening symptoms, neurological features, adverse load responses |

## 7.3 Invariants

- No self-test begins before Screen 1 clears.
- New symptoms can re-enter the safety pathway at any time (Screen 5 → Screen 2).
- A previous clear screen does not permanently clear future risk; safety status is a live property, not a one-time stamp.
- **Unknown is not negative:** a safety question whose answer is unknown is treated as the unsafe case until resolved.
- Hard-stop conditions cannot be dismissed by the user.
- Partial locks and full locks are distinguished: a partial lock may block rehab while still explaining the ranked possibilities.

# 8. Separated Confidence Outputs

A single "confidence" presentation is prohibited. A clear MRI diagnosis can coexist with unknown current function; high diagnosis confidence does not justify a rehabilitation plan. V3.1 therefore defines six independent confidence objects, each with its own inputs, uncertainty propagation and calibration.

## 8.1 The six confidence objects

| Object | Confidence in… | Primary inputs |
|---|---|---|
| diagnosis_confidence | Injury identity and ranked differentials | Mechanism, symptoms, tests, anchor quality, priors |
| severity_confidence | Grade or severity range | Functional loss, symptom burden, irritability, imaging where present |
| stage_confidence | Current stage and starting point | Current capacity, irritability, time since injury |
| safety_confidence | That an autonomous programme may safely begin | Safety state, contraindications, gate-clearing completeness |
| progression_confidence | Readiness to progress / maintain / regress | Monitoring response, adherence, capacity change |
| readiness_completeness | Completeness of the readiness assessment (NOT clearance) | Battery coverage at the available tier (§14) |

> **The decoupling that matters.** A user can simultaneously have high diagnosis_confidence, low severity_confidence, low stage_confidence, and insufficient safety_confidence. A confident identity — even from a clear MRI — never auto-upgrades the others. The Rehab Engine consumes safety_confidence and stage_confidence, not diagnosis_confidence, when deciding whether to generate a plan (§13).

## 8.2 Cold-start and numeric-unlock rules

Before calibration against labelled cases for a given context, each object is presented as qualitative bands or ranges. User-visible numeric confidence is unlocked per object only after calibration. The architecture invents no thresholds and no percentages, and the contract enforces it: `calibrated: false` requires `numeric_value: null` (§24). The Explainer renders only each object's reported band via `explain_tokens` and cannot upgrade "uncertain" to "confident".

# 9. Self-Test Capability & Reliability Model

Guided self-tests performed alone are lower-fidelity than clinician-administered ones. Every physical or functional test satisfies a model so the engine never treats a low-fidelity self-test as high-confidence evidence.

## 9.1 What the model carries

Each test definition carries its targets, equipment and environment, a mandatory pre-test safety screen, and a reliability model: intrinsic reliability, the penalty for self-administration, known confounders, and a defined action when the test cannot be assessed. It also names exactly which engines its result may influence. When self-administration makes a test unassessable, it may influence no engine at all (§18).

## 9.2 Four prohibited inferences

> A failed attempt is not a positive result. A not-performed test is not a negative result. A painful test is not automatically a positive result. Unclear execution is not high-confidence evidence.

A test that cannot be completed is recorded as `cannot_assess` and the engine re-plans around the gap; it is never coerced into a result. Low execution or technique confidence widens the relevant confidence object rather than being ignored. When essential discriminating tests are repeatedly `cannot_assess` and no alternative evidence can resolve a must-not-miss, the case routes to lock-and-refer. `video_verification_eligible` tests may have execution confirmed by the movement-analysis subsystem only in State A (§14); a conversational model never "eyeballs" a self-test video to upgrade confidence.
# 10. Known-Diagnosis Pathway

A supplied diagnosis can save the athlete from redundant questioning, but only when it is strong and specific. The known-diagnosis pathway defines the minimum an anchor must satisfy before any diagnostic question is suppressed.

## 10.1 Minimum requirements before suppressing questioning

An anchor may suppress redundant identity questions only when it names an exact diagnosis and structure, matches the current episode, matches anatomically, and carries sufficient certainty and authority (a strong tier, §6.1). Anything less is an insufficient anchor and suppresses nothing.

## 10.2 Vague diagnoses are insufficient anchors

A vague label ("knee pain", "shoulder problem") is not an anchor. It cannot suppress questioning and cannot raise diagnosis confidence; the engine proceeds with a full workup.

## 10.3 What a known diagnosis never bypasses

Even a strong, specific, current anchor never bypasses Safety Screens 1–5, severity assessment, stage selection, current-capacity assessment, contraindication checks, or loading-tolerance assessment. It suppresses redundant *identity* questions only.

# 11. Concurrent & Secondary Injuries

Concurrent-injury assessment is a visible step in every entry path, and the Rehab Engine reconciles multiple active problems into one programme.

## 11.1 What every path assesses

Second pain location, bilateral symptoms, compensatory pain, pre-existing symptoms, unresolved injuries, injuries currently in rehabilitation, recent injuries to related structures, referred pain, neurological symptoms, kinetic-chain limitations, and medical conditions altering loading.

## 11.2 Role taxonomy

| Role | Definition |
|---|---|
| primary_injury | The principal problem driving the episode and the plan |
| secondary_injury | A genuine additional injury of lower priority this episode |
| contributing_condition | Predisposes or modifies loading; not itself the injury |
| concurrent_independent_injury | A separate injury, unrelated in mechanism, active simultaneously |
| referred_pain_source | A source elsewhere producing pain at the reported site |
| compensation | Altered movement/loading arising from the primary injury |
| background_chronic_condition | A long-standing condition forming the loading backdrop |

## 11.3 Reconciliation into one programme

When several injuries are active, the engine composes a single reconciled programme that respects the most restrictive contraindication across all of them, avoids incompatible loading, prevents duplicate workload, manages total session stress, prioritizes the primary injury without abandoning the others, and preserves training for unaffected capacities where safe. The most restrictive active safety state governs the whole plan. If reconciliation cannot satisfy every contraindication — an irreconcilable conflict — the engine locks rehab generation and refers rather than shipping a plan that violates one injury's constraints.

# 12. Current-Capacity Assessment & Capacity-to-Demand Gap

Two athletes with the same diagnosis receive very different late-stage programmes because capacity is *measured*, not inferred from the diagnosis, and is compared against the *demands* of the athlete's sport, position and goals.

## 12.1 Current capacity is measured

A universal capacity schema fixes the structure; the specific battery is injury-specific clinical content. Capacity spans pain and irritability, range of motion, isometric/concentric/eccentric tolerance, strength, endurance, weight-bearing, gait, balance, motor control, movement quality, and progressively the athletic qualities — walking, stairs, squat, lunge, single-leg stance, running, hopping, jumping, landing, sprinting, acceleration, deceleration, change of direction, kicking, throwing and sport-specific actions — plus the immediate, delayed and next-day symptom responses.

Each measured capability produces one capacity record carrying the capability, test method, a unit-bearing measurement or qualitative band, side, pain response, quality confidence, comparison baseline, reliability, contraindication status, and whether it is required for stage, load or progression. Values are unit-bearing so they can be compared safely (§23).

> **Graceful degradation.** When objective tools (dynamometer, force plate, GPS) are unavailable, the engine uses the best available method at its lower reliability, widens the relevant confidence object, and — where an objective measure is required and no substitute is adequate — produces a restricted introductory plan or locks that decision and refers. It never fabricates a capacity value.

## 12.2 Sport & position demand profile

The demand profile specialises the generic rehabilitation tracks. It draws from a superset including normal and match volumes, total and high-speed-running distance, sprint distance, acceleration/deceleration counts, cutting angles, jump frequency, landing demands, kicking/throwing volume, contact and force demands, strength and power requirements, repeated-effort and aerobic/anaerobic demands, surface, footwear and skill requirements. Each demand is a unit-bearing measurement or band in the same dimension as the matching capacity (§23).

## 12.3 The gap and what it drives

The capacity-to-demand gap is computed per relevant capability and drives rehabilitation priorities, stage objectives, required strength qualities, running/sprint/power/change-of-direction progressions, skill exposure, conditioning, and return-to-training and return-to-performance criteria.

| Gap state | Meaning | Programming effect |
|---|---|---|
| unknown | Demand or capacity not yet measured | Withhold late-stage claims; collect data or refer |
| large | Capacity well below demand | Capability becomes a primary stage objective |
| closing | Capacity approaching demand | Progress exposure toward demand under monitoring |
| met | Capacity meets demand at this tier | Eligible to contribute to return criteria at that tier |

> **Same diagnosis, different late stages.** A recreational runner and a professional winger with the same hamstring diagnosis share the same early protect/restore logic but diverge sharply later: the winger's gap to high-speed running, sprint distance, repeated-effort demand and reactive change of direction reshapes the entire develop block and raises return thresholds. The diagnosis is identical; the demand profile is not. A `met`, `closing` or `large` gap is only valid when both sides are present and dimensionally compatible; otherwise the gap is `unknown` (§23).

# 13. Rehabilitation Prescription, Scheduling, Monitoring & Non-Response

## 13.1 The prescription gate

Before any programme is generated, the Rehab Engine requires a complete rehabilitation input object. An injury label is not sufficient to generate a full programme; this contract is the gate between identity and prescription. The input carries injury identity and the four relevant confidence objects, severity and stage, time since injury, the current capacity profile, irritability, medical restrictions and contraindications, concurrent injuries, history and recurrence, previous treatment response, recent training load, daily readiness, sport/position/level, the required performance profile, equipment and environment, schedule and session duration, goals and adherence constraints, the monitoring contract, and progression requirements.

> **An injury label is not a licence to prescribe.** The engine consumes `safety_confidence` and `stage_confidence`, the current capacity profile, and the safety state — not merely the diagnosis. If current function and loading tolerance are unknown, even a clear imaging diagnosis yields a restricted introductory plan or a withhold/refer, never a full programme.

## 13.2 Behaviour when a required input is missing

For each missing required input, the engine selects exactly one defined response and never silently proceeds.

| Response | When chosen | Result |
|---|---|---|
| ask | Obtainable from the user and high-value | Collect it, then continue |
| estimate_conservatively | A safe conservative assumption exists and impact is low | Proceed at the cautious end; widen confidence; record the assumption |
| restricted_introductory_plan | Enough for a safe minimal start but not a full programme | Issue a limited plan; defer later content until inputs arrive |
| withhold_plan | A rehab-mandatory input is missing with no safe substitute | Do not generate; explain what is needed |
| refer | The gap is safety-critical or exceeds scope | Lock-and-refer |

When the safety-confidence object locks output, the only permitted responses are restricted_introductory_plan, withhold_plan or refer; a full plan through a locked safety gate is impossible (§24).

## 13.3 Scheduling & load coordination

A programme is more than a list of exercises. The engine assembles parallel tracks — tissue-specific loading, general strength, locomotor, running, sprinting, acceleration/deceleration, change of direction, plyometrics, sport skill, conditioning and recovery — into one weekly schedule, and reconciles total load across rehabilitation, the athlete's own sport training and competition so high-speed and high-eccentric exposures do not compound unsafely.

> **Two non-negotiables.** Strength is present across the appropriate stages and is not replaced by isolated tissue-loading exercises. Late-stage rehabilitation reconstructs athletic performance: "pain-free" is necessary but not sufficient — the capacity-to-demand gap must close at the achieved tier before return criteria are met.

## 13.4 Tissue-specific monitoring & non-response

Each session carries a monitoring contract: the tissue type, acceptable and unacceptable symptom responses, response windows (immediate, delayed, next-morning), and decision criteria mapping the response to repeat / progress / maintain / reduce-load / regress / stop / lock-and-refer. A positive neurological response always escalates. When recovery deviates — plateau, regression, or too-slow progress against the expected window — the autonomous non-response pathway recognizes the deviation, adjusts or regresses, and escalates to referral when a threshold is reached. All thresholds are governed clinical content, referenced by version.

# 14. Media Analysis, Tiered Return Batteries & Autonomy Boundary

## 14.1 The three media states

Movement, photo and video analysis enters the system only through one of three explicit states. No language model interprets raw images.

| State | Meaning | Permitted influence |
|---|---|---|
| A — validated subsystem | A separately validated subsystem produced a structured finding | May influence the engines within its validated scope; requires a subsystem version |
| B — qualitative descriptor | Coaching-level qualitative description only | May inform rehabilitation, progression or communication; never diagnosis or severity; never presented as validated visual diagnosis |
| C — unavailable / declined | No usable media or no consent | No finding, no confidence, no decision influence; records a failure or non-consent reason |

> **The hard limit.** The conversational model never "reads" an MRI, ultrasound, X-ray, photo or movement video to form or upgrade a clinical conclusion. Pixel-level interpretation happens only inside the validated imaging or movement subsystem, encoded as State A. This is enforced by the media contract (§25).

## 14.2 Tiered return-to-training & return-to-performance

Readiness assessment is tiered by the fidelity of what can actually be measured, and readiness is decision support, never formal clearance.

| Tier | Setting | Confidence ceiling |
|---|---|---|
| Tier 1 | Home / self-report fidelity | Cannot declare high confidence |
| Tier 2 | Gym / partial objective measures | Moderate unless the full battery is met |
| Tier 3 | Lab / full objective battery | Highest available, still not clearance |

> **The honesty rule.** Readiness guidance is never formal medical clearance: `is_clearance` is always false. A lower-fidelity tier may never be represented as equivalent to a higher tier, and an unobtainable required readiness measure locks the readiness decision (§24).

## 14.3 The autonomy boundary, restated

The platform is autonomous in normal supported operation but must know when to stop. Two autonomy exceptions are intentional and stated plainly in product messaging: a strong documented finding that conflicts with presentation triggers external reassessment, and required readiness measures that are unobtainable lock the readiness decision. These are features of safe autonomy, not failures of it. "No routine human inside the live workflow" is not the same as "no need for professional clinical, regulatory and safety validation during development and governance" — V3.1 removes the former and strengthens the latter.

# 15. End-to-End Flows: diagnosis and rehabilitation

## 15.1 Diagnosis — the controlling step list

1. Minimal emergency screen — Safety Screen 1, before any self-test and before scope (§7.1).
2. Scope check (supported population/condition; else OUT_OF_SCOPE).
3. Athlete & episode context — the Universal Context Gate (§4).
4. Extraction of structured variables; contradiction and missing-data handling (gate-clearing unknowns block).
5. First differential activation.
6. Region-specific safety screen — Safety Screen 2.
7. Population-aware priors, parameterised by context including history.
8. Mechanism and symptom evidence.
9. Safe test selection (feasibility-aware; Pre-test Safety Screen 3).
10. Test-quality and self-test reliability adjustment (§9).
11. Dependence-aware evidence combination.
12. Must-not-miss resolution.
13. Imaging dependency check (report extraction for Path 3a; no language-model pixel reading; Path 3b routes to the subsystem or refers).
14. Anchor reconciliation via the Anchor Quality Model — no silent override (§6).
15. Concurrent-injury evaluation (§11).
16. Separate diagnosis_confidence and severity_confidence (§8).
17. Autonomous diagnosis OR lock-and-refer.
18. Transparent explanation via explain_tokens.
19. Full audit record.

| Path | Enters at | Note |
|---|---|---|
| Path 1 | Runs the full list | Anchor = engine posterior |
| Path 2 | After step 4, anchor check may suppress identity questions, then continues | Vague labels do not suppress; the gate is never skipped |
| Path 3a | Anchor from extracted report findings, then continues | Text extraction only |
| Path 3b | Step 13 routes to the validated imaging-AI subsystem or REFER | No language-model interpretation |

## 15.2 Rehabilitation — the controlling step list

Supported-scope confirmation → Pre-rehabilitation Safety Screen 4 → injury identity → severity + severity_confidence → current capacity → current stage + stage_confidence → tissue-specific loading model → concurrent-injury reconciliation → sport and position demands → capacity-to-demand gap → equipment and environment → schedule constraints → exercise selection → substitution with load-equivalence → load and dosage → weekly schedule construction with the reconciliation layer → monitoring contract → adherence capture → readiness capture → progression / maintenance / regression decision → abnormal-recovery pathway → strength maintained across stages → acceleration/deceleration → change of direction → plyometrics → kicking/throwing/skills → conditioning and match-load reconstruction → tiered return-to-training → tiered return-to-performance (decision support, not clearance) → outcome capture → reinjury tracking.

# 16. Governance for Aggregate Autonomous Performance

No routine clinician reviews each case, but aggregate drift and systematic error still require governance. This is a separate, non-live process — product safety and post-market governance, not a human in any individual user's live workflow.

It covers diagnostic-calibration monitoring, false-negative red-flag review, referral-rate monitoring, adverse-event review, reinjury and abnormal-progression outcomes, subgroup performance (including age and sex-related differences), sport-specific performance, model drift, extraction errors, hallucination incidents, confidence calibration, content-version performance, outdated evidence, rule deprecation, and recall/rollback.

> **Not a live-flow reviewer.** This process reads the immutable audit trail and the Outcome Learning System in aggregate, after the fact. It can trigger content re-review, recalibration, rule deprecation, recall or rollback — all governed content changes, never live overrides of an in-progress case. A user mid-episode is never paused for aggregate review. Findings route back into the content pipeline and calibration; subgroup differences are surfaced here before they become systematic harm.
---

# Part III — The Nervous System (technical contracts)

Every clinical decision in Part II is carried between the language layer and the deterministic engines as typed data on a versioned wire, backed by 38 JSON Schemas. This part defines those contracts; Part IV defines the semantic rules that keep them from contradicting each other.

# 17. The Revised AI–Engine Wire

The legacy wire exposed `CLEAR | MONITOR | HARD_STOP` and a single confidence result and could not represent the platform's state space. V3.1 carries the wire introduced in V2.2.1 and hardened in V2.2.2: `ai_engine_wire_v2_2`, a versioned contract carrying the full state space with self-describing version negotiation. The wire is the only authorized boundary between language-model communication and the deterministic engines.

## 17.1 Envelope and version negotiation

Every payload carries a wire version, an API version and the negotiated layer versions. The current wire version is `2.2.2`; consumers must negotiate it explicitly. If the two layers cannot agree on the full contract, the envelope records that a downgrade was applied and the payload is projected to the legacy contract (§30); a mismatched consumer is told, in band, that it is receiving a lossy projection.

## 17.2 What the wire carries

| Field | Carries |
|---|---|
| envelope | Wire/API versions, negotiated versions, correlation and episode IDs, turn index, timestamp |
| safety | The full `safety_state` object (§21) |
| confidence | The six type-locked confidence slots (§17.3) |
| anchor_conflict | Whether an anchor/presentation conflict is present and its resolution |
| plan_response | `full_plan` \| `restricted_introductory_plan` \| `withhold_plan` \| `refer_only`, blocked targets, partial locks |
| referral | Referral reason code, class, whether resolution is required |
| explain_tokens | The ONLY content the language layer may render to explain the turn |
| migration | The lossy/non-lossy projection to the legacy contract |

## 17.3 The six confidence slots are type-locked

Each named slot accepts only a confidence object whose `object_type` matches the slot, enforced with `const`. This holds in the wire and in every nested contract that carries a confidence object.

| Wire or nested field | Required `object_type` |
|---|---|
| `diagnosis_confidence` | `diagnosis_confidence` |
| `severity_confidence` | `severity_confidence` |
| `stage_confidence` / `rehab_stage_confidence` | `stage_confidence` |
| `safety_confidence` / `rehab_safety_confidence` | `safety_confidence` |
| `progression_confidence` | `progression_confidence` |
| `readiness_completeness` / `rtp_evidence_completeness` | `readiness_completeness` |

A confidence object with the wrong type is rejected even when its shape is otherwise valid.

# 18. Typed Data Contracts

Every component has a typed JSON Schema (Draft 2020-12). The full catalogue is Appendix A; this section describes the contract families and the discipline they share. Structure is specified in the schemas; all numeric clinical values remain governed content referenced by version, never hard-coded.

## 18.1 The contract families

| Family | Schemas | Purpose |
|---|---|---|
| Context | `athlete_profile_context`, `injury_episode_context` | The gate's typed inputs |
| Diagnosis identity | `diagnosis_anchor`, `anchor_quality` | Anchor and its multidimensional quality/tier |
| Confidence & evidence | `confidence_object`, `evidence_completeness` | The shared confidence shape and what was assessed vs. missing |
| Safety | `safety_state` | The closed eight-state contract (§21) |
| Capacity & demand | `current_capacity_profile`, `sport_demand_profile`, `capacity_demand_gap` | Measured capacity, demand, and their dimensionally-checked gap |
| Rehabilitation | `rehab_prescription_input`, `monitoring_contract`, `progression_decision`, `progression_requirements`, `rehab_schedule`, `training_load_summary`, `readiness_snapshot` | The prescription gate and its typed sub-contracts |
| Concurrent | `concurrent_injury_state` | Multiple active injuries and reconciliation |
| Return | `readiness_battery`, `non_response_event` | Tiered readiness and deviation events |
| Self-test & media | `self_test_definition`, `media_analysis_result` | Test reliability and the three media states |
| Referral | `referral_resolution` | The re-entry lifecycle (§20) |
| Activation & trace | `input_requirement_definition`, `traceability_graph` | Machine-readable activation and traceability (§19) |
| Units | `_defs` plus eleven field-specific measurement schemas | The governed measurement system (§23) |
| Wire | `ai_engine_wire_v2_2` | The versioned boundary contract (§17) |

## 18.2 Enforced contract invariants

Beyond shape, the schemas enforce the behaviour that used to live only in prose. A diagnosis anchor requires, for a strong tier, an exact diagnosis, exact structure and current-episode match. A confidence object permits a numeric value only when calibrated. The rehab prescription gate restricts the plan when safety confidence locks output. A self-test that becomes unassessable may influence no engine. Capacity and demand are unit-bearing so comparison is well-defined. Each of these is paired with a positive and a negative acceptance fixture (Appendix B).

## 18.3 The schema count, reconciled

The lineage moved from sixteen schemas (V2.2, embedded), to twenty-seven (V2.2.1, repaired and enforced, delivered as files), to **thirty-eight** (V2.2.2, after splitting the single measurement type into eleven field-specific, unit-locked measurement schemas and adding the registry and helper contracts). V3.1 carries the thirty-eight as its authoritative set. The growth is not scope creep; it is the unit system (§23) made structural.

# 19. Machine-Readable Activation & Traceability

## 19.1 Executable input activation

`input_requirement_definition` expresses activation as predicates an engine evaluates against the Context Gate, turning "where medically relevant" into executable logic. Each definition carries a variable id, a default class (A/B/C/D), a value-schema reference, activation and deactivation predicates, required evidence, a missing-data action, the gates affected, the consuming engines, a reason code and a content version. A Class A variable carries no predicates; a Class B/C variable must declare at least one.

```json
{ "variable_id": "pregnancy_status",
  "default_class": "B_conditional",
  "value_schema_ref": "...",
  "activation_predicates": [
    { "field": "athlete.biological_sex_clinical", "op": "equals", "value": "female" } ],
  "deactivation_predicates": [],
  "missing_data_action": "ask",
  "consuming_engines": ["diagnosis","severity"],
  "reason_code": "preg_safety", "content_version": "..." }
```

This is also what makes sensitive-data minimisation enforceable: an input that no active predicate selects is never collected.

## 19.2 Enforceable traceability

`traceability_graph` replaces the prose traceability matrix with stable input, decision and rule IDs and typed edges. No input is collected without a defined use, and no decision depends on a variable that is not collected or derived. The semantic graph validator (§28) rejects duplicate IDs of any node type, undeclared input/decision/rule references, duplicate edges, conflicting necessity on the same edge, orphan inputs, required rules that are never used, and required decisions with no required input dependency. This converts traceability from a documentation table into an enforceable build artifact.

# 20. Referral-Resolution Lifecycle

A referral is not only an exit. `referral_resolution` defines a typed, auditable, expiry-bounded return path, so hard stops are both consistently triggerable and consistently resolvable.

## 20.1 What a resolution carries

Resolution and episode IDs; the exact referral reason addressed; the linked safety-state snapshot; the external assessment (date, assessor type, outcome); clinician restrictions; any diagnostic revision and new anchor; whether the lock may reopen; who is authorized to reopen it; the targets permitted to reopen; evidence expiry with a deterministic evaluation date; and an audit reference and version.

## 20.2 Outcome-to-disposition matrix

Reopening is governed by the external outcome; the engine cannot invent a reopening the outcome does not support.

| External outcome | May reopen? | Required authority | Permitted effect |
|---|---|---|---|
| `condition_excluded` | yes | external clinician, or governed engine on matching new evidence | Unblock only the originally blocked targets |
| `cleared_to_proceed` | yes | external clinician, or governed engine on matching new evidence | Apply any restrictions; unblock a subset only |
| `condition_confirmed` | conditional | external clinician only | Restrictions required before any reopening |
| `condition_revised` | conditional | governed re-evaluation or external clinician | Diagnostic revision and an auditable new anchor required |
| `further_workup` | no | `not_reopenable` | No targets unblocked |
| `no_result` | no | `not_reopenable` | No targets unblocked |

## 20.3 Re-entry invariants

- `not_reopenable` implies `lock_may_reopen: false`; a reopenable lock cannot use `not_reopenable` authority.
- Unblocked targets must be a subset of the originally blocked targets.
- Episode and referral reason must match the linked safety state.
- Urgent and emergency referrals can never be reopened by the engine alone.
- Expired evidence cannot reopen any target; expiry must occur after the assessment date; a future-dated assessment cannot clear a present evaluation.

These invariants are split between the schema and the referral semantic validator, which compares assessment, evaluation and expiry dates (§26, §28).
---

# Part IV — The Guardrails (engineering enforcement)

The contracts in Part III are necessary but not sufficient: a payload can be individually well-shaped yet globally contradictory. This part is the semantic enforcement that makes contradiction impossible to ship. It is what moved the architecture from "conceptually accepted" to an engineering freeze.

# 21. Closed Safety-State Matrix

The safety contract uses a complete, closed state matrix. A `safety_state` is valid only when its clearance class, blocked targets, clearing condition, dismissal behaviour and referral reason all match exactly one permitted branch. There is no combination outside the matrix; unknown top-level fields are rejected (§26).

| State | Clearance class | Required blocked targets | `clears_when` | Referral reason | Plan behaviour |
|---|---|---|---|---|---|
| `CLEAR` | `not_applicable` | none | null | none | Full or explicitly restricted non-safety response; no referral |
| `CLEAR_WITH_MONITORING` | `not_applicable` | none | null | none | Proceed with monitoring; at least one monitor flag required |
| `INFORMATION_REQUIRED` | `resolvable` | one or more specific targets | required text | none | Ask again; the unknown is not treated as negative |
| `TEST_BLOCKED` | `resolvable` | `test` | required text | none | Skip or substitute the test; widen uncertainty |
| `REHAB_BLOCKED` (resolvable) | `resolvable` | `rehab` | required text | imaging / capacity / media dependency | Withhold or restrict until evidence arrives |
| `REHAB_BLOCKED` (terminal) | `terminal` | `rehab` | null | contraindication / irreconcilable conflict / non-response limit | Withhold and refer |
| `URGENT_REFERRAL` | `terminal` | `all` | null | urgent red flag / unresolved must-not-miss | Referral-only response |
| `EMERGENCY_SIGNPOSTING` | `terminal` | `all` | null | emergency red flag | Emergency signposting only |
| `OUT_OF_SCOPE` | `terminal` | `all` | null | unsupported population / condition | Signpost external care; no clinical output |

## 21.1 The invariants this closes

1. `CLEAR` cannot be terminal, cannot block a target, and cannot carry a referral reason.
2. `CLEAR_WITH_MONITORING` requires at least one active monitor flag.
3. `INFORMATION_REQUIRED` treats the relevant unknown as unsafe until resolved.
4. `TEST_BLOCKED` blocks testing, not rehabilitation by accident; `REHAB_BLOCKED` always blocks rehabilitation.
5. Terminal states cannot advertise an in-app clearing condition.
6. Urgent, emergency and out-of-scope states block all targets.
7. Every safety object carries a stable state ID, episode ID and version pointer.

> **Why a matrix and not a few rules.** The predecessor enforced *selected* relationships, which left contradictory pairings — `CLEAR` with a terminal class, `OUT_OF_SCOPE` without a block, `TEST_BLOCKED` not blocking testing — individually valid. A closed `oneOf` over all eight states removes the gaps by construction: a state that does not match one branch exactly is rejected.

# 22. Wire Cross-Object Invariants

A wire payload's objects must agree with each other. Where JSON Schema can express the relationship it is enforced structurally; where it requires cross-tree comparison it is enforced by a clearly named semantic validator. Both run in CI.

The semantic validator enforces:

- terminal safety requires a terminal referral;
- the referral reason must equal the safety reason;
- plan blocked targets must equal the union of safety blocks and partial locks;
- `full_plan` cannot coexist with any blocked target;
- `withhold_plan` and `refer_only` must identify at least one blocked target;
- locked safety confidence cannot coexist with a full plan;
- locked readiness completeness must block return-to-performance;
- a strong-anchor/presentation conflict requires `external_reassessment`, a matching referral and a rehabilitation block;
- the migration `source_state` must equal the live safety state;
- the legacy projection and lossy flag must match the source state; a lossy projection must list dropped fields and a non-lossy projection must not;
- version negotiation without a downgrade must agree on the current wire version.

## 22.1 Effective blocked-target calculation

```text
effective blocked targets
    = safety_state.blocked_targets
    UNION plan_response.partial_locks[*].target
```

`all` expands to `test + rehab + rtp`. The plan response must report that effective set exactly, so a consumer cannot silently ignore one partial lock.

# 23. Unit & Dimension System

A measurement is no longer accepted merely because it contains a value, a unit and a dimension string. The package defines a canonical unit registry and validates both structure and meaning, so a capacity in force can never be compared to a demand in time and marked "met".

## 23.1 Supported dimensions and canonical units

Force, torque, angle, distance, time, velocity, acceleration, mass, repetitions, percentage, ratio, RPE, arbitrary training load, frequency and dimensionless values, each with a canonical storage unit and a fixed set of legal unit symbols.

| Unit(s) | Dimension | Canonical storage |
|---|---|---|
| `N`, `kN` | force | `N` |
| `N·m` | torque | `N·m` |
| `deg`, `rad` | angle | `deg` |
| `m`, `cm`, `mm`, `km` | distance | `m` |
| `s`, `min`, `h`, `ms` | time | `s` |
| `m/s`, `km/h` | velocity | `m/s` |
| `kg`, `g`, `lb` | mass | `kg` |
| `reps` | repetitions | `reps` |
| `%` | percentage | `%` |
| `ratio` | ratio | `ratio` |
| `RPE` | perceived exertion | `RPE` |
| `AU` | arbitrary load | `AU` |

## 23.2 Field-specific measurement schemas

Eleven dedicated measurement schemas (load, ratio, duration, velocity, force, torque, angle, distance, percentage, repetitions, RPE) lock each unit to its dimension. This prevents a field such as `weekly_load` from accepting an angle, or `match_minutes` from accepting force. The unit symbol must be legal for the declared dimension — structurally, not by description.

## 23.3 Comparison rules

A capacity-to-demand gap may be `large`, `closing` or `met` only when both current and demand values are present, both are measurements of the same dimension (or both qualitative bands), the declared comparison dimension matches both, and each unit belongs to its declared dimension. A force value cannot be compared with a time value and marked `met`; invalid or incomparable pairs remain `unknown`. The recursive semantic checker walks nested measurements to enforce this wherever a comparison occurs.

# 24. Confidence, Evidence & Output Locks

Confidence is separated by decision object (§8) and remains qualitative until calibration. V3.1 enforces the coherence among calibration, evidence completeness, confidence band and output locks.

## 24.1 Calibration invariant

`calibrated: false` requires `numeric_value: null`. `calibrated: true` requires a numeric value within the allowed range. Numeric percentages are not unlocked by architecture alone; they require the governed calibration process.

## 24.2 Missing-evidence invariant

When required inputs are absent: the confidence band is `insufficient`, at least one missing input is named, evidence completeness is blocking, and the associated output lock is true. When evidence completeness is blocking, a high or very-high confidence band is prohibited. Missing evidence can never present as high confidence, and it can never read as clearance.

## 24.3 Decision consequences

- Locked safety confidence prohibits a full plan.
- Locked progression confidence prohibits a `progress` decision.
- An unobtainable required readiness measure locks readiness completeness.
- Readiness is always decision support; `is_clearance` is always false.

# 25. Media-State Hardening

The conversational model never interprets raw images or videos. Media outputs enter only through a typed state, and each state's contract is enforced.

| State | Requires | Prohibited |
|---|---|---|
| A — validated subsystem | Explicit consent; purpose acknowledgement; adequate capture quality; a non-empty validated subsystem version; a non-empty structured finding; a confidence object compatible with the finding scope; no active failure mode; decision influence restricted to the validated scope | Influence beyond validated scope |
| B — qualitative descriptor | Consent and purpose acknowledgement | A subsystem version or confidence object; any diagnosis or severity influence; being described as validated visual diagnosis |
| C — unavailable | A recorded failure or non-consent reason | Any finding; any confidence; any decision influence |

> The hard limit from §14.1 is enforced here: State B can support rehabilitation, progression or communication but can never touch diagnosis or severity, and State C carries nothing that could influence a decision.

# 26. Date/Time, Closed-World Policy & Format Validation

## 26.1 Real format validation

The package uses the official Draft 2020-12 validator with an explicit format checker; `date` and `date-time` are validated, not merely annotated. `date` uses ISO 8601 full-date form `YYYY-MM-DD` and impossible dates are rejected. `date-time` uses RFC 3339 and must include a UTC designator or a numeric offset; invalid hours, minutes, months and days are rejected. The referral semantic validator additionally compares assessment, evaluation and expiry dates (§20.3).

## 26.2 Closed-world schema policy

Safety-critical contracts are closed by default with `additionalProperties: false`. An unknown top-level field fails validation rather than being silently ignored. Where extension metadata is needed it must live under a namespaced `extensions` object; an extension that attempts to modify safety, diagnosis, severity, referral, blocked targets or plan response is rejected by semantic validation. Extensions are metadata only unless separately registered through the controlled architecture process.

```json
{ "extensions": { "vendor.display_hint": "compact" } }
```
---

# Part V — Verification & Integrity

# 27. The CI Gate

The whole package is verified by one command, run from the extracted package root:

```bash
python3 run_ci.py
```

The gate runs in this order and exits non-zero on any failure. Exceptions are never converted to warnings, and `ALL CHECKS PASSED` is emitted only after every step below completes successfully:

1. package-layout validation;
2. authoritative manifest verification;
3. JSON parsing;
4. Draft 2020-12 schema self-validation;
5. reference resolution;
6. structural and format fixture validation;
7. semantic cross-object validation;
8. safety-state matrix tests;
9. wire consistency tests;
10. unit and dimension tests;
11. referral lifecycle tests;
12. confidence-lock tests;
13. media-state tests;
14. traceability checks;
15. tamper and stale-manifest self-tests;
16. generated schema-catalogue parity;
17. deliberate-failure proof (a known-bad instance must be rejected);
18. final gate.

> **The deliberate-failure proof matters.** A CI that cannot demonstrate it is able to fail is not evidence of anything. Step 17 constructs a contradictory safety instance and asserts the gate rejects it, proving the gate has teeth before step 18 reports success.

# 28. Traceability & Package Integrity

## 28.1 The traceability validator

The semantic graph validator rejects duplicate input/decision/rule IDs, undeclared references, duplicate edges, conflicting necessity on the same edge, orphan inputs, required rules that are never used, and required decisions without a required input dependency (§19.2). A self-test injects a deliberate orphan and asserts the check catches it.

## 28.2 One authoritative manifest

`package_manifest.json` is the only authoritative internal manifest. It covers every governed file except itself (avoiding circular hashing) using SHA-256, and the final manifest covers **211 governed files**. Plain CI verifies it and never rewrites it; approved maintainers refresh it intentionally with `python3 run_ci.py --refresh-manifest`. This closes a real defect in the predecessor, where CI could write a second manifest in a subdirectory while the root manifest went stale yet CI still reported success.

## 28.3 Tamper controls

The CI self-tests its own integrity controls by copying the package to a temporary directory, modifying a governed file without updating the manifest and confirming verification fails, then adding an unlisted governed file and confirming the stale manifest fails. Both tamper and stale-manifest self-tests are part of the gate.

# 29. Test Catalogue & Verification Results

## 29.1 Verification results

The result column below matches the verified V2.2.2 release package. The **Provenance** column states, per line, how each result is substantiated:

- **(A)** Reproduced by independent execution of the official package CI (`python3 run_ci.py`) in a separate verification environment on 15 June 2026 (Python 3.13.5, jsonschema 4.26.0). See §29.4.
- **(B)** Additionally re-checked in the V3.1 editing environment (which was itself offline and did not run the official CI).

| Check | Result | Provenance |
|---|---|---|
| Package layout | Passed | A |
| Authoritative manifest integrity | 211 governed files verified | A + B (independent manifest hash check matched 211/211 by SHA-256 and size, zero missing) |
| JSON parsing | 200 JSON files parsed | A |
| Draft 2020-12 schemas | 38 / 38 valid | A + B (count and Draft 2020-12 dialect declarations re-checked) |
| `$ref` resolution | All local and canonical references resolved | A |
| Fixture suite | 124 / 124 passed | A + B (count re-checked; results also reproduced earlier under an independent Draft 2020-12 validator) |
| Valid controls | 70 | A |
| Rejection controls | 54 | A |
| Compatibility fixtures | 32 | A + B (count re-checked) |
| Adversarial fixtures | 86 | A + B (count re-checked) |
| Format fixtures | 6 | A + B (count re-checked) |
| Traceability / semantic graph integrity | Passed | A |
| Tamper self-test | Passed | A |
| Stale-manifest self-test | Passed | A |
| Embedded schema-catalogue parity | Passed | A |
| Deliberate contradictory-safety test | Rejected as required | A |
| Overall package gate | **ALL CHECKS PASSED** | A |

## 29.2 Test catalogue

| Suite | Fixtures | Purpose |
|---|---|---|
| Compatibility | 32 | Preserves or deliberately updates V2.2.1 contract behaviour |
| Adversarial | 86 | Positive and negative controls for safety, wire, units, referral, media, confidence and traceability |
| Format | 6 | Valid and invalid dates and RFC 3339 date-times |
| **Total** | **124** | Every fixture must produce its declared result |

The machine-readable catalogue ships as `generated/test_catalogue.json` in the schema package.

## 29.3 What "all checks passed" means

It means the delivered engineering contracts satisfy the rules encoded in this architecture and that the package is internally reproducible. It does **not** mean the underlying medical content is clinically correct, complete, calibrated or approved. That distinction is the subject of Part VIII.

## 29.4 Verification-provenance declaration (V3.1)

This declaration states honestly how the engineering verification results carried by V3.1 are substantiated.

**Official CI execution.** The official CI for the unchanged V2.2.2 engineering package inherited by V3.1 was independently executed successfully in a separate verification environment on 15 June 2026. The V3.1 editing environment itself remained offline and did not execute the CI.

| Field | Value |
|---|---|
| Command | `python3 run_ci.py` |
| Verification date | 15 June 2026 |
| Environment | Python 3.13.5; jsonschema 4.26.0 |
| Package ZIP SHA-256 (as recorded in the verification log) | `3d44f83d446eb233d824e3e0e9977aaaf3ce9afd7e194183e6746a90f567a7e6` |

**Reproduced results (official CI):**

- required package layout passed;
- authoritative manifest integrity passed (manifest contains 211 governed-file entries; covers every governed file except `package_manifest.json` itself);
- 200 JSON files parsed;
- 38 / 38 Draft 2020-12 schemas valid;
- all local and canonical references resolved;
- 124 / 124 fixtures passed, comprising 70 valid controls and 54 rejection controls;
- compatibility fixtures: 32; adversarial fixtures: 86; format fixtures: 6;
- traceability and semantic-graph integrity passed;
- tamper and stale-manifest tests passed;
- embedded schema-catalogue parity passed;
- deliberate contradictory-safety case rejected;
- final result: **ALL CHECKS PASSED**.

**Additionally re-checked in the V3.1 editing environment (offline):** the 38-schema and 124-fixture inventories, and a full independent manifest hash verification (211/211 entries matched by SHA-256 and size, zero missing). This editing environment could not install `jsonschema` and did not run the official CI; the authoritative CI result is the separate-environment execution above.

**Scope of this verification.** This independently reproduces the official CI for the **unchanged V2.2.2 engineering package** inherited and governed by V3.1. It substantiates the engineering contracts, schemas, fixtures, manifest integrity and package gate only. It does **not** validate clinical content, does **not** establish clinical safety or diagnostic accuracy, and does **not** constitute clinical approval, regulatory approval, or launch readiness. Those remain open (Part VIII).

**Conclusion.** The engineering-freeze status carried forward from V2.2.2 (§31) is now substantiated by an independent, successful execution of the official CI on the unchanged package, attributed to a separate verification environment rather than to the V3.1 editing environment.

---

# Part VI — Compatibility

# 30. Migration & Backward Compatibility

## 30.1 Version negotiation

The current wire version is `2.2.2`. Consumers negotiate it explicitly. A consumer that cannot support the current contract receives a lossy projection to the legacy wire, with the downgrade recorded in the envelope.

## 30.2 Legacy projection

| State | Legacy state | Lossy |
|---|---|---|
| `CLEAR` | `CLEAR` | no |
| `CLEAR_WITH_MONITORING` | `MONITOR` | yes |
| `INFORMATION_REQUIRED` | `MONITOR` | yes |
| `TEST_BLOCKED` | `HARD_STOP` | yes |
| `REHAB_BLOCKED` | `HARD_STOP` | yes |
| `URGENT_REFERRAL` | `HARD_STOP` | yes |
| `EMERGENCY_SIGNPOSTING` | `HARD_STOP` | yes |
| `OUT_OF_SCOPE` | `HARD_STOP` | yes |

Every non-clear projection collapses to `HARD_STOP`, and every lossy projection names its dropped fields. A legacy consumer can lose detail but can never fail open: it can never read a blocked or referral state as permission to proceed. `CLEAR → CLEAR` is the one explicitly non-lossy projection.

## 30.3 Breaking changes consolidated into V3.1

These changes, introduced across V2.2.1 and V2.2.2, are the baseline in V3.1:

- `clearance_class` includes `not_applicable` for clear states;
- episode match uses one canonical vocabulary (`match | partial | no_match | unknown`);
- safety objects require stable state and episode IDs;
- referral resolution embeds a linked safety snapshot;
- the wire envelope uses version `2.2.2`;
- migration supports a non-lossy clear projection;
- safety-critical top-level contracts reject unknown fields.

---

# Part VII — Standing

# 31. Engineering Verdict

> **READY TO FREEZE AS ENGINEERING CONTROLLING ARCHITECTURE**

This verdict applies to the schema, wire, validator, traceability, CI and package-integrity architecture consolidated in V3.1, and the freeze status is carried forward from the verified V2.2.2 release package. As recorded in the verification-provenance declaration (§29.4), the official CI for the unchanged V2.2.2 package was independently executed successfully in a separate verification environment on 15 June 2026, reproducing: all 38 schemas pass official Draft 2020-12 self-validation; all references resolve; 200 JSON files parse; structural, format and semantic validation run together; all 124 fixtures pass (70 valid, 54 rejection controls); traceability integrity passes; the single authoritative manifest verifies 211 governed files; tamper and stale-manifest self-tests pass; embedded schema-catalogue parity passes; a deliberate contradictory-safety instance is rejected; and the final gate emits `ALL CHECKS PASSED`. The V3.1 editing environment itself remained offline and did not execute the CI; it additionally re-checked the schema and fixture inventories and performed an independent 211/211 manifest hash verification. This substantiates the engineering layer only and does not validate clinical content or constitute clinical or regulatory approval.

This is an engineering freeze, not a clinical-launch authorization. It does not authorize clinical use or real-world autonomous deployment.

---

# Part VIII — Honesty

# 32. Remaining Launch Blockers

The following remain outside the engineering freeze and must be completed before real-user autonomous deployment. V3.1 does not solve them and does not claim to.

1. Injury-specific clinical content authoring (the numeric thresholds, differentials, loading parameters and return cutoffs the structures are built to hold).
2. Clinical adjudication of candidate rules.
3. Red-flag and must-not-miss false-negative review.
4. Diagnosis, severity, stage, progression and readiness calibration — no numeric confidence ships before this.
5. Prospective clinical validation.
6. Subgroup validation across age, sex-related factors, sport and competition level.
7. Human-factors validation of referral and readiness language.
8. Full privacy and security architecture (the data-governance requirements are stated; the architecture itself is a separate workstream).
9. Quality-management system and post-market governance in operation.
10. Market-specific regulatory classification and clinical evaluation.
11. Identified multidisciplinary clinical review and approval.

# 33. Authorship & Approval Status

This document is an engineering and design artifact. It does not claim that a named clinical panel authored or approved it, and it must not be represented as clinically approved. The disciplines whose review the architecture is built to satisfy — sports-medicine physician, sports physiotherapist, rehabilitation specialist, strength-and-conditioning coach, clinical epidemiologist, diagnostic-statistics specialist, medical knowledge engineer, clinical safety officer, human-factors specialist, health-technology architect, senior backend/data architect and regulatory/quality lead — are represented in the design, not as signatories.

| Field | Status |
|---|---|
| Engineering architecture version | V3.1 (consolidating V2.2 / V2.2.1 / V2.2.2) |
| Engineering freeze | Granted (Part VII) |
| Clinical reviewer name | Pending |
| Qualifications and registration | Pending |
| Scope reviewed | Pending |
| Review date | Pending |
| Conflicts of interest | Pending |
| Clinical approval | **Not granted** |
| Regulatory approval | **Not granted** |

> **Status.** Until an identified multidisciplinary clinical review is completed and recorded, V3.1 is an engineering controlling architecture only. The engineering layer is frozen; clinical use is not authorized.

---

# Part IX — The Clinical Knowledge & Exercise Content Layer

Parts II–IV specify how the platform reasons, how signals move, and how contradictions are refused. None of that decides *what the platform clinically knows*. That knowledge lives in a governed content layer that is authored, reviewed, versioned and bound to the engines through explicit contracts. Part IX defines that layer as a first-class part of the architecture.

> **What Part IX is and is not.** It defines the *architecture and contracts* by which injury-specific clinical content and exercise content are registered, governed and consumed. It does **not** contain clinical content itself: no injury rules, no thresholds, no exercises, no dosages. The Rectus Femoris rule specification, the evidence registry and any exercise entries are content authored *against* this layer and referenced by version — never embedded in this document. Part IX introduces no clinical thresholds, diagnoses, probabilities or loading values (consistent with §2 and the prohibited-content list).

# 34. The Clinical Knowledge Layer

## 34.1 Components

The clinical knowledge layer is the governed path from published evidence to an engine-activatable rule. It has the following first-class components.

| Component | Role | Governs |
|---|---|---|
| Evidence Registry | One traceable record per clinical claim or evidence gap | Claim id, source(s), evidence grade, population studied, permitted-use classification, limitations, review status |
| Master Evidence Map | The audited human-readable synthesis a registry is derived from | Scope, source set, evidence-status and permitted-use vocabulary |
| Clinical Rule Specification (per injury) | The reviewed translation of registry claims into explicit, testable decision logic with stated limits | Rule ids, normative status, activation, blocked targets, prohibited inferences, evidence mapping |
| Approved Rule Package (per injury, per version) | The machine-readable set of *approved* rules an engine may load | Versioned rule objects, their fixtures, provenance and approval state |
| Content Version Registry | The index of which content versions exist, their status and supersession | Version identifiers, status (candidate/approved/deprecated/withdrawn), migration notes |

## 34.2 Governed attributes of every clinical rule

Each rule in the layer carries, at minimum: a stable unique **rule identifier** and **content version**; **evidence provenance** (one or more Evidence Registry claim ids and their grades); a **permitted-use classification** (the same governed vocabulary the registry uses — for example evidence-record-only, logic-with-uncertainty, safety-referral-trigger, prohibited-autonomous-rule); explicit **population limits**; **activation predicates** and **required inputs**; the **decision** it produces; **blocked targets**; **prohibited inferences**; a **confidence effect**; **explain-token references**; the bound **test-case ids**; and a **review and approval status**.

## 34.3 Permitted-use classification and the activation gate

A rule's permitted-use class is the contract between evidence strength and engine authority. The binding rule is absolute:

- **Only** rules whose status is *approved* and whose permitted-use class authorizes decision influence may be loaded into the executable rule set consumed by an engine.
- Rules classified evidence-record-only, prohibited-autonomous-rule, blocked, or research-priority **MUST NOT** be loaded as executable logic. They may be stored for traceability, explanation and future work only.
- Safety-referral-trigger rules may **escalate** (raise a referral or block) but may never autonomously diagnose, clear, or determine return.
- A rule MUST NOT silently exceed its stated population applicability.

This mirrors and depends on the engineering invariants already frozen in Part IV: blocked or reference-only records cannot reach an engine, a terminal safety state cannot coexist with a full plan, and unknown/abstained inputs lock the associated output.

## 34.4 Review, approval, deprecation, rollback and migration

- **Review and approval status** is a first-class field. No rule is executable while its status is pending, in-review, or rejected.
- **Deprecation** marks a content version as no longer to be used for new episodes while preserving it for audit of episodes that used it.
- **Rollback** restores a prior approved content version when a defect is found; the rollback is itself a recorded content-version event.
- **Content-version migration** governs how an in-progress episode moves (or explicitly does not move) across content versions. Consistent with the aggregate-governance rule (§16), a user mid-episode is never silently re-planned by a content change; version changes route through governed migration, not live override.

# 35. The Exercise Knowledge System

## 35.1 Purpose and boundary

The Exercise Knowledge System is the governed store of exercise content. Injury modules **do not hard-code thousands of exercises**. They issue governed exercise *requirements*, *exclusions* and *selection constraints*; the Exercise Selection Engine resolves those against the Exercise Knowledge System. This keeps clinical rules small and auditable and keeps exercise content reusable across injuries.

## 35.2 The exercise ontology

Each exercise entry is described by a governed ontology so that selection is by *characteristic*, not by name. Required attributes:

- exercise identifier and **exercise family**;
- **tissues and structures loaded** (primary and secondary);
- **joint actions and movement pattern**;
- **contraction type**;
- **muscle-length position**;
- **load**, **speed**, **range-of-motion**, and **balance/coordination** demands;
- **equipment and environment**;
- **contraindications and safety restrictions**;
- **stage suitability**;
- **sport-transfer attributes**;
- **progressions, regressions, substitutions** and **load-equivalence relationships**;
- **coaching cues, common errors and media**;
- **evidence/provenance level**;
- **confidence and review status**.

> **Same governance as clinical rules.** Every exercise entry carries provenance, evidence/confidence level and review status. An exercise that is unreviewed or contraindicated for the active constraints cannot be selected, exactly as an unapproved clinical rule cannot be loaded. Exercise **dosage** (sets, repetitions, intensity, frequency, progression increments) is governed content with its own provenance and confidence; it is never invented by an injury module and is not specified in this architecture.

## 35.3 The Exercise Selection Engine

The Exercise Selection Engine queries the Exercise Knowledge System using: injury and subtype; stage; severity; current capacity; irritability and pain response; equipment and environment; athlete level; sport and position demands; previous-session response and adherence; time and schedule constraints; and goals. Selection filters in a safety-first order (contraindications and active-injury restrictions before phase suitability before preference), and any substitution must preserve the intended tissue, movement, contraction, range, load and phase objective — name similarity is never sufficient.

# 36. The Binding Chain

The clinical knowledge layer and the exercise knowledge system connect to the deterministic engines through one explicit chain. Each arrow is a typed, versioned, auditable hand-off; nothing is implicit.

```text
Evidence (Master Evidence Map + Evidence Registry)
   -> Clinical Rule Specification (per injury, reviewed)
   -> Approved machine-readable rules (versioned, approval-gated)
   -> Diagnosis / severity / stage / capacity decisions (deterministic engines)
   -> Exercise-selection constraints (requirements, exclusions, constraints)
   -> Exercise Knowledge System (ontology query via the Selection Engine)
   -> Individualized prescription (capacity- and demand-reconciled)
   -> Monitoring and adaptation (per-session contract, non-response pathway)
```

## 36.1 Invariants binding the chain

These are normative and extend Appendix B without weakening any existing rule:

- Every executable clinical rule resolves to at least one Evidence Registry claim id that exists in the registry.
- Only approved, decision-authorizing permitted-use classes are loadable as executable logic; everything else is reference/traceability only.
- Every exercise reaching a prescription is review-approved, not contraindicated for the active constraints, and dosage-resolved from governed dosage content with provenance.
- The chain is traceable end to end: a prescription links back through selection constraints and engine decisions to the rules and evidence that justified it (the traceability graph of §19/§28).
- A content-version change never silently re-plans an in-progress episode; it routes through governed migration (§34.4, §16).
- The language model communicates along this chain but alters no engine-owned decision in it (§2.1).

> **Standing of Part IX.** Part IX is a first-class architectural part. It defines contracts and governance only; it is not itself clinical content and is not clinically approved. The content authored against it — evidence registries, clinical rule specifications, exercise entries and dosage content — remains subject to the clinical adjudication, calibration, validation and approval still listed as open in §32.

---

# Appendix A — Consolidated Schema Catalogue

The 38 authoritative Draft 2020-12 schemas carried by V3.1, with versions and SHA-256 hashes. These were confirmed valid by the official CI independently executed on the unchanged V2.2.2 package on 15 June 2026 (§29.4) and independently re-checked against the manifest in the V3.1 editing environment. They are delivered as separate files plus the authoritative `package_manifest.json`; the embedded copies in the schema package are generated from the same files and parity-checked in CI (§27, step 16).

| Schema | Version | SHA-256 |
|---|---|---|
| `_defs.json` | 2.2.2 | `a5148aed0bb00e773dcdc2017579f17a36a1a5d91e0b08f3983138143700c91a` |
| `ai_engine_wire_v2_2.json` | 2.2.2 | `46f47a5c34c190f897d255441300f54878846b53d677cbefbdb8c3f22f013844` |
| `anchor_quality.json` | 2.2.2 | `0443c056819e468798abc63a35996059ca9263e0274dbf96dbddfa98b8fcce15` |
| `athlete_profile_context.json` | 2.2.2 | `99e9734111f55def694e841efbf713a5a1bed240765c80fcb0be3bd2c3fb4f35` |
| `capacity_demand_gap.json` | 2.2.2 | `3ab05b8d2717eefadc3c721c372016e3a30053c1ee92f445d67681f2301cf723` |
| `concurrent_injury_state.json` | 2.2.2 | `7bf0fc809e912693746947ceb089f9508c8ee82b297710eaf9e2ccb21fabf472` |
| `confidence_object.json` | 2.2.2 | `47923545acb324652f0aeaa9266e631dccc6141343682b871b318aef05c850af` |
| `current_capacity_profile.json` | 2.2.2 | `8e509058b0600789a6da01b2e61360b14c3a3f07c3310225e61c23a7ef36f935` |
| `diagnosis_anchor.json` | 2.2.2 | `7646a9be5b772e8960ca6eba41fa202b295a6997b068972e55c6ccfc228e08be` |
| `evidence_completeness.json` | 2.2.2 | `d0ea289f6a5b8873a797f49c3c1dae55662958c31c0cc930f2ffab0cf76985a2` |
| `injury_episode_context.json` | 2.2.2 | `7a00d73520c7dc20c6b7fe313e95c17cfe509976938bfe245c6e9a2f7e80eb5a` |
| `input_requirement_definition.json` | 2.2.2 | `dd1d4fcb5a5230d94206f0d07a1ad07393e162b083432ce6b49aa29205424496` |
| `measurement_angle.json` | 2.2.2 | `db1600b2189f8a7c7beb207b3aea6b66dd4754bcbc79600f2fdbd9c33d317b33` |
| `measurement_distance.json` | 2.2.2 | `c9d8da50d557e0eb272d1032f0ca428fe0007af18fdd7fc61a631a145b66f0a9` |
| `measurement_duration.json` | 2.2.2 | `6799aadd9e86e802f0e293e4872a554274993a2193f124302db4e051d575db1e` |
| `measurement_force.json` | 2.2.2 | `45a9a5c440aa71c2703cc3ea433d39d66fae6c655ded70c1011659e7199ec57f` |
| `measurement_load_au.json` | 2.2.2 | `f6a6678f964909e187e2874637b27284b52d52de28956efcc7ec338cbcae8c0e` |
| `measurement_percent.json` | 2.2.2 | `121967b9eb6e1bca82fb78824b54a7300752ab5f96dc779abf8a8970d4761d14` |
| `measurement_ratio.json` | 2.2.2 | `089c2046b02b71216c697283815949e062c8d6823d6e4aaa396fa2231eaf0d64` |
| `measurement_repetitions.json` | 2.2.2 | `43a2a08ed3759167bdefbeacfaa0807757bcdd21b7a85649f31c0c06e36a8da5` |
| `measurement_rpe.json` | 2.2.2 | `e11fac16c63a88ebe11d02f3f7ae05087bd0e6d357b608e10ae2166e9454a162` |
| `measurement_torque.json` | 2.2.2 | `5d5f87834bc25494f8cdf3c3ad0cfb173113c4b473c52978532aa20f369911d4` |
| `measurement_velocity.json` | 2.2.2 | `72c888382f80ef0699eafa6f5a501d4a6e90b45dd8b4a74a53862b434d66dac7` |
| `media_analysis_result.json` | 2.2.2 | `6fc2e7156de7cc1ba234a6605116749e603fbbdb6c0c7ced7df1715ef6a26147` |
| `monitoring_contract.json` | 2.2.2 | `d6ce3bee47368a06cd5d3e38f39fe4d1ae7e224aa5f29a15661bb214e50c3667` |
| `non_response_event.json` | 2.2.2 | `781f5444480f0ccca75ad3dc4ad1f80da02c2b1ad86253c9d37ebd522593d941` |
| `progression_decision.json` | 2.2.2 | `2cb6aaeb6135b205876fc61f6701e02cdd2414949c9d90604689c9f3fdd0871a` |
| `progression_requirements.json` | 2.2.2 | `58deea4aa4ba30d87d6c902343b6b87207a4e274f37e975b9dbf8c1d337cfcde` |
| `readiness_battery.json` | 2.2.2 | `4ea2a71fdef228589f3bd92c6830334e2c7278cf8543973e046984c3984bb6f1` |
| `readiness_snapshot.json` | 2.2.2 | `7eec90758b12626fbf4e14936e2ccba2f6bbc79eb536f791d4ef066eb38533f0` |
| `referral_resolution.json` | 2.2.2 | `7207f6bfd85401942443a0ee44074da2dfc82d989ad7aa78cfb807508fc1889a` |
| `rehab_prescription_input.json` | 2.2.2 | `397295dddce966d92c4a55180d7018eb898d2ef9d351dcced371d3f6bd56b1c5` |
| `rehab_schedule.json` | 2.2.2 | `443c288212a8e30ac23c231d0c54b9e3b66635ccd4b0838ba37a5395206083d9` |
| `safety_state.json` | 2.2.2 | `6cff719bb16e4c1db131aac70d875f849c138897413a5e9595170d3186097703` |
| `self_test_definition.json` | 2.2.2 | `dda3be80a3556e3699c5ea4d306af3aaad554c43b5ee2f977311ada61216ac2a` |
| `sport_demand_profile.json` | 2.2.2 | `2938d6e4000d8fff9976bea290a81828a149981f8a16d1249d8621a4162f736b` |
| `traceability_graph.json` | 2.2.2 | `7846666b7ac6cd6896a7c4a2aa9f5883ccd35f1d0a61d7f323a7a18a6d3cb8f9` |
| `training_load_summary.json` | 2.2.2 | `48c533b1c061733ffabea5f7b847392c35502717dfc5977b16d7961cb74152a2` |

*38 schemas.*

---

# Appendix B — Normative Implementation Rules

These statements are normative and bind any implementation of V3.1.

1. A language model MUST NOT alter engine-owned clinical state.
2. Emergency detection MUST precede or override scope determination.
3. Unknown gate-clearing information MUST NOT be treated as negative.
4. A full plan MUST NOT coexist with a blocked target or locked safety confidence.
5. A strong documented-anchor conflict MUST trigger external reassessment.
6. A terminal state MUST carry a terminal referral and MUST NOT silently clear.
7. Referral re-entry MUST use matching, unexpired, auditable external evidence.
8. Capacity and demand MUST NOT be compared across incompatible dimensions.
9. A lower-fidelity readiness tier MUST NOT be represented as equivalent to a higher tier.
10. Raw media MUST NOT be interpreted by the conversational language model.
11. A required missing input MUST reduce confidence and lock the associated output.
12. Legacy compatibility MUST fail safe.
13. Unknown fields in closed contracts MUST be rejected.
14. The authoritative manifest MUST be verified before schema or fixture success is accepted.
15. `ALL CHECKS PASSED` MUST be emitted only after every root-level gate completes successfully.

---

# Appendix C — Lineage & Reconciliation Map

How each predecessor maps into V3.1, and how the few vocabulary changes across versions were reconciled.

## C.1 Document mapping

| Predecessor | Mapped into V3.1 |
|---|---|
| V2.2 §0–§2 (changes, gate, classification) | Part I (§2–§3) and Part II (§4–§5) |
| V2.2 §3–§10 (anchor, safety, confidence, self-test, known-diagnosis, concurrent, capacity, demand) | Part II (§6–§12) |
| V2.2 §11–§16 (prescription, scheduling, monitoring, non-response, media, tiered return) | Part II (§13–§14) |
| V2.2 §17–§23 (autonomy, governance, contracts, traceability, flows, verdict) | Part II (§14–§16), Part III, Part VII |
| V2.2.1 §4–§5 (emergency order, wire) | Part II (§7.1), Part III (§17) |
| V2.2.1 §6–§9 (schema validity, typed contracts, activation, referral) | Part III (§18–§20) |
| V2.2.1 §10–§11 (authorship, CI) | Part V (§27), Part VIII (§33) |
| V2.2.2 §4–§12 (safety matrix, wire invariants, units, referral, confidence, media, traceability, dates, closed-world) | Part IV (§21–§26), Part V (§28) |
| V2.2.2 §13–§18 (CI, results, migration, blockers, authorship, verdict) | Part V (§27, §29), Part VI (§30), Part VII (§31), Part VIII (§32–§33) |

## C.2 Vocabulary reconciliations

| Topic | Earlier form | V3.1 canonical form |
|---|---|---|
| Confidence object names | `rehab_stage_confidence`, `rehab_safety_confidence`, `rtp_evidence_completeness` (V2.2) | `stage_confidence`, `safety_confidence`, `readiness_completeness` as `object_type`; the longer names remain accepted as nested field names, type-locked to the canonical type (§17.3) |
| Episode match | `{matches_current, historical_only, unknown}` vs `{match, partial, no_match, unknown}` | One canonical enum: `match | partial | no_match | unknown` |
| Clearance class | `resolvable | terminal` only (V2.2.1) | adds `not_applicable` for clear states (§21) |
| Measurement | one generic `measurement` type (V2.2.1) | eleven field-specific, unit-locked measurement schemas (§23) |
| Schema count | 16 → 27 → 38 | 38 authoritative (§18.3) |

## C.3 Standing of the earlier documents

V2.2, V2.2.1 and V2.2.2 remain valuable as the audit trail of how this architecture was reasoned into existence. For implementation and review, **V3.1 is the single controlling document**; where it restates a predecessor, V3.1 governs.

---

# Appendix D — Version History

| Version | Role | Outcome |
|---|---|---|
| V2 / V2.1 | Foundational clinical engines and the autonomous operating model | In force only as enumerated Normative External Dependencies (§3.3) |
| V2.2 | The brain — full clinical & product architecture | Conceptually accepted; seams to contracts not yet implementable |
| V2.2.1 | The nervous system — versioned wire, repaired/enforced schemas, activation, traceability, referral lifecycle | Accepted integration correction; contract-hardening gaps remained |
| V2.2.2 | The engineering guardrails — closed safety matrix, wire invariants, unit system, package integrity, expanded CI | Engineering freeze achieved; 38 schemas / 124 fixtures / 211 governed files |
| **V3** | **Unified controlling architecture** — all three consolidated into one reading | **Engineering layer frozen; clinical content and approval remain open** |
| **V3.1** | **Controlled correction pass over V3** — control-hierarchy resolution (§3.3), first-class Clinical Knowledge & Exercise Content Layer (Part IX), verification-provenance honesty (§29.4) | **No clinical content added; no existing strength weakened; engineering freeze carried forward from V2.2.2** |

*End of Master Architecture V3.1.*
