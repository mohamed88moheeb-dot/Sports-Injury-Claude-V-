---
title: "Master Rectus Femoris Clinical Rule Specification"
subtitle: "Version 1.2 - Gate A Reconciled Candidate for Machine-Readable Authoring"
author: "Sports Injury Diagnosis & Rehabilitation Platform"
date: "15 June 2026"
---

# Contents

- Document Control
- 1. Executive Purpose
- 2. End-to-End User Journey
- 3. Scope
- 4. Normative Language and Rule Governance
- 5. Core Clinical Objects
- 6. Required Input Contract
- 7. Safety and Escalation Rules
- 8. Diagnosis and Differential Rules
- 9. Structural Classification, Severity, and Prognosis
- 10. Rehabilitation Stage Model
- 11. Exercise Ontology and Selection Interface
- 12. Monitoring, Adaptation, and Non-Response
- 13. Running, Sprinting, and Kicking
- 14. Return to Training and Return to Performance
- 15. Confidence and User Communication
- 16. Machine-Readable Rule Contract
- 17. Minimum Synthetic Validation Suite
- 18. Release Gates
- 19. Current Completion Status
- 20. Immediate Next Action
- Appendices A-D

# Document Control

| Field | Value |
|---|---|
| Document title | Master Rectus Femoris Clinical Rule Specification |
| Version | 1.2 |
| Status | Gate A reconciled candidate; not clinically approved; not authorized for production deployment |
| Governing architecture | `Master_Architecture_V3.1_Final` |
| Architecture companion | `V3.1_Final_Amendment_Log_and_Declarations` |
| Clinical evidence base | Rectus Femoris Master Evidence Map + `Quadriceps_Rectus_Femoris_Evidence_Registry_v1.1` |
| Evidence reconciliation | QRF-037–QRF-046 added; BOAST, McAleer, Pietsch, Reurink and Lempainen full texts reviewed; Santos restricted to abstract/metadata-only reference use |
| Intended implementation target | Deterministic clinical engines and bounded AI explanation layer |
| Gate A standing | Passed in the accompanying v1.2 reconciliation re-audit; this is document-level acceptability, not clinical approval |
| Next gate | Gate B machine-readable authoring and schema/semantic validation |
| Supersedes | Master Rectus Femoris Clinical Rule Specification v1.1 |

> **Important status statement.** This document translates the current audited Rectus Femoris evidence base into a governed clinical-rule specification. It does not establish clinical effectiveness, diagnostic accuracy, regulatory clearance, or permission for autonomous real-world use. No candidate rule may load into a production engine until its machine-readable object is approval-gated, validated, tested, and formally released.

# 1. Executive Purpose

This specification defines how the platform should handle a user with suspected, reported, or documented Rectus Femoris injury from first contact through safety screening, diagnostic reasoning, severity characterization, rehabilitation planning, monitoring, running and sprinting exposure, kicking exposure, return to training, and return to performance.

The document is the bridge between three layers:

1. **Evidence** - what the current literature and audited source set actually support.
2. **Clinical rules** - explicit, traceable, testable decision logic with stated limits.
3. **Engineering** - schemas, deterministic engines, validators, user-interface states, and automated tests.

The platform must never treat a diagnosis label as sufficient to generate a full rehabilitation plan. It must first establish safety, current episode relevance, current capacity, contraindications, rehabilitation readiness, evidence completeness, and the athlete's required performance demands.

# 2. End-to-End User Journey

The controlling journey is:

1. The user enters through one of three routes:
   - does not know the injury;
   - already has a diagnosis;
   - uploads a medical report.
2. The platform runs the minimal emergency screen before scope checking, self-testing, or completion of the context gate.
3. If no emergency state is active, the platform determines whether the presentation is within the supported RF module scope.
4. Every in-scope route passes through the universal Athlete & Episode Context Gate; required variables are collected, reconfirmed, or explicitly marked unknown with a defined consequence.
5. The platform builds a ranked injury identity and differential, or preserves a strong external diagnosis anchor when it remains current-episode matched and concordant.
6. Safety remains continuous and is re-run before every self-test, programme generation, progression decision, and return decision.
7. Structural information, functional severity, irritability, current capacity, rehabilitation stage, and the six confidence objects are maintained separately.
8. The platform decides whether a full plan, restricted introductory plan, withheld plan, or referral-only response is permitted. Diagnosis alone never authorizes rehabilitation.
9. The rehabilitation engine selects phase-appropriate exercise characteristics from the exercise ontology and reconciles them with equipment, schedule, concurrent injuries, and total sport load.
10. The system monitors the immediate, later same-day, and next-day response to every session.
11. The system progresses, maintains, modifies, regresses, reopens the differential, or escalates according to governed rules.
12. Late-stage rehabilitation is driven by the athlete's capacity-to-demand gap. Return to training and performance requires multi-domain readiness and evidence completeness, not a date, single test, percentage, or absence of pain.

# 3. Scope

## 3.1 Included presentations

This module is designed to support the following Rectus Femoris-related presentation states:

- suspected acute indirect Rectus Femoris muscle injury;
- documented Rectus Femoris strain or tear;
- documented central aponeurosis, central tendon, or intratendinous involvement;
- documented proximal Rectus Femoris tendon injury or full-thickness proximal injury;
- suspected or documented recurrent Rectus Femoris injury;
- return-to-running, sprinting, kicking, training, and performance after Rectus Femoris injury;
- anterior-thigh presentations in which Rectus Femoris remains one differential possibility.

## 3.2 Limited handling only

The following may enter the module for screening and routing but are not fully covered by this specification:

- direct quadriceps contusion;
- suspected myositis ossificans;
- suspected thigh compartment syndrome;
- adolescent apophyseal or avulsion injury;
- postoperative cases with surgeon-specific restrictions;
- chronic exertional compartment syndrome;
- non-musculoskeletal causes of anterior-thigh pain;
- neurological, vascular, systemic, or referred pain presentations.

These presentations must be routed to the relevant global safety rule, external assessment pathway, or future dedicated injury module. They must not be forced into an RF strain rehabilitation pathway.

## 3.3 Explicit exclusions

This specification does not authorize:

- diagnosis or exclusion of compartment syndrome by the platform;
- treatment selection between operative and non-operative management for full-thickness proximal injury;
- individual return-date prediction from cohort medians or regression formulas;
- universal exercise dosage for sets, repetitions, intensity, or frequency;
- use of unresolved isokinetic targets reported as 320% or 400%;
- use of general lower-extremity sprint work-to-rest ratios as RF-specific rules;
- inference that imaging-negative means no injury;
- inference that a single symptom, mechanism, self-test, or imaging descriptor proves RF injury;
- autonomous grading of MRI findings from user-uploaded images unless a separately validated imaging subsystem exists.

# 4. Normative Language and Rule Governance

## 4.1 Normative terms

- **MUST / MUST NOT**: mandatory behavior required for conformance.
- **SHOULD / SHOULD NOT**: recommended behavior; deviation requires a recorded reason.
- **MAY**: optional behavior permitted within the stated limits.
- **UNKNOWN**: missing or unresolved information. UNKNOWN is never treated as negative or normal.

## 4.2 Separate governance dimensions

The former single `Status` field is prohibited because it conflated architecture authority, evidence permission, drafting maturity, and approval. Every governed rule must carry all of the following dimensions separately:

| Field | Allowed values | Meaning |
|---|---|---|
| `normative_source` | `architecture`, `clinical_content`, `mixed` | Identifies whether authority comes from V3.1, evidence-governed clinical content, or both |
| `normative_strength` | `MUST`, `SHOULD`, `MAY`, `PROHIBITION` | The rule's conformance strength |
| `content_status` | `candidate`, `in_review`, `approved`, `deprecated`, `withdrawn` | The clinical-content lifecycle state |
| `permitted_use` | `evidence_record_only`, `logic_with_uncertainty`, `safety_referral_trigger`, `prohibited_autonomous_rule` | The strongest role the rule may play |
| `approval_status` | `pending`, `approved`, `rejected` | Whether the rule is authorized to enter an executable release |

`content_status: candidate` or a document-level Gate A PASS does not equal clinical approval or implementation authority.

## 4.3 Architecture and evidence references

- Architecture-conformance rules MUST cite `architecture_refs` and need not invent clinical evidence claims.
- Clinical-content rules MUST cite valid `evidence_claim_ids` and preserve each claim's individual grade, permitted use, population limits, and prohibited inferences.
- Mixed rules MUST distinguish the architecture requirement from the clinical evidence used to activate or constrain it.
- No rule may create an invented combined evidence grade that obscures the limitations of its component claims.

## 4.4 Evidence grades used in this specification

| Grade | Meaning |
|---|---|
| D2 | Direct empirical evidence, limited to a specific population or context |
| D3 | Direct evidence with important design, sample, event-count, or scope limits |
| M1 | Mixed evidence retained only where the registry explicitly grades a claim as mixed |
| E1 | Expert consensus, expert-informed pathway, or professional guidance |
| C1 | Case report or case-series evidence |
| X1 | Indirect or extrapolated evidence |
| I1 | Insufficient, incomplete, or operationally unresolved evidence |

# 5. Core Clinical Objects

The module must produce and maintain the following objects separately:

1. **injury_identity** - the best-supported current injury label or uncertainty state;
2. **differential_set** - ranked alternatives with supporting and contradicting evidence;
3. **structural_profile** - tissue, site, tendon involvement, grade, imaging date, and source quality when known;
4. **injury_history_modifier** - prior episode count, side/site, recurrence relation, reported scar/fibrosis history, provenance, and confirmation status;
5. **functional_severity_profile** - loss of function and task tolerance;
6. **irritability_profile** - symptom behavior during and after loading;
7. **current_capacity_profile** - measured or reported capacities with quality and units;
8. **rehab_stage** - current phase with entry and exit evidence;
9. **safety_state** - current live safety status and blocked targets;
10. **monitoring_contract** - expected response windows and actions after deviation;
11. **readiness_profile** - clinical, field, laboratory, sport-specific, and evidence-completeness status;
12. **six confidence objects** - diagnosis, severity, stage, safety, progression, and readiness completeness.

Current injury identity, historical recurrence status, and self-reported structural history must not be collapsed into one identity enum. Likewise, structural severity, functional severity, stage, safety, and readiness must not be collapsed into a generic severity or confidence score.

# 6. Required Input Contract

## 6.1 Always-required episode inputs

The module MUST obtain or explicitly mark unknown:

- episode identifier;
- side and exact location of symptoms;
- date and time of onset;
- direct-blow versus indirect mechanism;
- activity at onset, including kicking, sprinting, acceleration, deceleration, jumping, lifting, or other;
- immediate symptoms, including pain, pop/snap, loss of function, collapse, swelling, bruising, or deformity;
- current pain behavior at rest, walking, stairs, active knee extension, hip flexion, and sport activity where safe;
- current ability to walk and bear weight;
- worsening versus improving trend;
- safety symptoms and major trauma context;
- age group and skeletal maturity where relevant;
- previous quadriceps, anterior-thigh, or RF injuries, including episode count, side, approximate site, recency, and whether the current presentation is at the same site;
- current sport, position, competition level, dominant kicking leg where relevant, and required sport demands;
- current training and match load;
- equipment and testing access;
- concurrent injuries and medical restrictions;
- diagnosis or report details when supplied;
- user goals and required performance demands.

## 6.2 Conditional inputs

The system SHOULD activate the following only when they can change safety, differential, evidence completeness, prescription, or readiness:

- biological sex and pregnancy status for clinically relevant safety or treatment constraints;
- menstrual-health or energy-availability indicators when clinically relevant and consented;
- surgery date, procedure, and surgeon restrictions;
- imaging modality, date, exact wording, anatomical site, tendon involvement, and grade;
- medications that may alter pain interpretation or bleeding risk;
- anticoagulant use after major trauma;
- neurological or vascular symptoms;
- prior objective strength, sprint, GPS, jump, or performance baselines;
- access to isokinetic testing, force plates, GPS, timing gates, or supervised assessment;
- a reported previous diagnosis of fibrosis, scarring, a persistent lump, tightness, or a 'different' sensation.

A reported scar/fibrosis item MUST be stored under `injury_history_modifier` with:

- `provenance`: `self_report`, `documented_report`, or `imaging_report`;
- `confirmation_status`: `unverified`, `documented`, or `imaging_confirmed`;
- source date and episode link where known.

The platform MUST NOT infer fibrosis from a sensation description and MUST NOT convert a self-report into the current `structural_profile`.

## 6.3 Missing-data behavior

For every missing input, the module MUST choose one response:

- ask again using simpler wording;
- proceed with widened uncertainty;
- issue a restricted introductory plan where V3.1 permits it;
- restrict testing;
- restrict or withhold rehabilitation;
- withhold readiness determination;
- refer externally.

The system MUST NOT silently substitute a normal value. Gate-clearing safety unknowns are treated as unsafe until resolved.

# 7. Safety and Escalation Rules

Safety rules have precedence over scope, diagnosis, exercise selection, progression, readiness, and user preference.

## 7.1 Closed V3.1 safety-state mapping

| Clinical outcome | Required safety state | Required blocked targets | Additional requirement |
|---|---|---|---|
| No active safety concern and adequate information | `CLEAR` | none | no referral reason |
| Safe to proceed with active monitoring | `CLEAR_WITH_MONITORING` | none | at least one monitor flag |
| Gate-clearing information is missing | `INFORMATION_REQUIRED` | one or more specific targets | resolvable `clears_when` text |
| A self-test cannot safely proceed | `TEST_BLOCKED` | `test` | resolvable `clears_when` text |
| Rehabilitation cannot safely be generated | `REHAB_BLOCKED` | `rehab` | resolvable or terminal branch as defined by V3.1 |
| Urgent same-day medical assessment is required | `URGENT_REFERRAL` | `all` | terminal; referral-only response |
| Immediate emergency care is required | `EMERGENCY_SIGNPOSTING` | `all` | terminal; emergency signposting only |
| Presentation is outside supported scope | `OUT_OF_SCOPE` | `all` | terminal; external signposting only |

Free-form replacements such as `MONITOR`, partial urgent blocks, or 'relevant targets' are not valid V3.1 states.

## 7.2 Rule RF-SAF-001 - disproportionate pain or passive-movement pain after significant trauma

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** safety_referral_trigger
- **Approval status:** pending
- **Architecture refs:** V3.1 §§7, 20, 21, 22
- **Evidence claims:** QRF-014 (C1), QRF-037 (E1), QRF-038 (E1)
- **Trigger:** pain described as disproportionate to the apparent injury, rapidly escalating pain, or pain clearly worsened by passive movement after significant thigh trauma or another acute limb context that raises concern.
- **Decision:** stop self-testing and rehabilitation. Set at least `URGENT_REFERRAL` with `blocked_targets: all`; use `EMERGENCY_SIGNPOSTING` only when the global emergency ontology is met.
- **Prohibited inference:** do not state that compartment syndrome is confirmed or excluded.
- **Clearance:** only through a valid external assessment and referral-resolution object. Hospital hourly monitoring or pressure-measurement instructions must not become a home self-clearance workflow.

## 7.3 Rule RF-SAF-002 - progressive swelling or tightness after major trauma

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** safety_referral_trigger
- **Approval status:** pending
- **Architecture refs:** V3.1 §§7, 20, 21
- **Evidence claims:** QRF-017 (C1)
- **Trigger:** major thigh trauma plus progressive swelling, increasing tightness, worsening function, or materially worsening symptoms.
- **Decision:** stop loading and self-tests that load or stretch the thigh; set `URGENT_REFERRAL` with `blocked_targets: all` unless the global emergency ontology requires `EMERGENCY_SIGNPOSTING`.
- **Prohibited inference:** no universal thigh-girth threshold, home measurement interval, or safe observation period may be asserted.

## 7.4 Rule RF-SAF-003 - delayed deterioration

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** safety_referral_trigger
- **Approval status:** pending
- **Architecture refs:** V3.1 §§7, 21
- **Evidence claims:** QRF-018 (C1)
- **Trigger:** new or worsening severe pain, swelling, tightness, weakness, sensory change, or functional decline after an initially stable period following significant thigh trauma.
- **Decision:** re-enter the urgent or emergency safety pathway regardless of time since injury; a previous `CLEAR` state does not suppress the new screen.
- **Limit:** the published delayed case is evidence of possibility, not an incidence estimate or fixed timing rule.

## 7.5 Rule RF-SAF-004 - suspected vascular or neurological compromise

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** safety_referral_trigger
- **Approval status:** pending
- **Architecture refs:** V3.1 §§7.1–7.3, 21
- **Trigger:** new numbness, progressive weakness not explained by pain, cold or pale limb, absent or markedly altered pulse, uncontrolled bleeding, or rapidly expanding swelling.
- **Decision:** apply the global emergency/urgent ontology; block all testing, rehabilitation, and readiness.
- **Evidence handling:** this is platform-wide trauma safety, not an RF-specific clinical claim.

## 7.6 Rule RF-SAF-005 - inability to safely assess

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§4–5, 7, 9, 24
- **Trigger:** the user cannot understand instructions, cannot position safely, cannot distinguish active from passive movement, or pain prevents valid interpretation.
- **Decision:** record `cannot_assess`; do not convert the result to positive or negative. Use alternative evidence, widen the relevant confidence object, block the test, or refer when the unresolved uncertainty concerns a must-not-miss condition.

## 7.7 Rule RF-SAF-006 - suspected avulsion, full-thickness injury, or postoperative restriction

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§6, 10, 13.1–13.2, 20–21
- **Evidence claims:** QRF-012 (C1), QRF-032 (C1), QRF-036 (I1)
- **Trigger:** a strong current report or anchor identifies full-thickness proximal injury, avulsion, major retraction, postoperative status, or another condition requiring external restrictions.
- **Decision:** set `REHAB_BLOCKED` while current management restrictions, weight-bearing limits, activity limits, or the external plan are unresolved. Route postoperative and nonoperative cases according to their actual restrictions; do not issue a generic strain plan.
- **Prohibited inference:** do not choose operative versus nonoperative management or predict an individual timeline from pooled case-series means.

## 7.8 Rule RF-SAF-007 - direct-contusion branch

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§3.1, 7, 15
- **Evidence claims:** QRF-015 (D2), QRF-016 (D2), QRF-017 (C1)
- **Trigger:** a direct blow is the dominant mechanism with localized impact symptoms.
- **Decision:** route to the quadriceps-contusion branch and apply its complication screen. Retain RF strain as a secondary possibility only when evidence supports a mixed presentation.
- **No-branch behavior:** if no approved contusion module exists, set `OUT_OF_SCOPE` with `blocked_targets: all` for treatment output and signpost external assessment rather than forcing the presentation into the RF strain pathway.

## 7.9 Rule RF-SAF-008 - new red flags during rehabilitation

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** safety_referral_trigger
- **Approval status:** pending
- **Architecture refs:** V3.1 §§7.2–7.3, 13.4, 21–22
- **Trigger:** any new urgent or emergency symptom appears during a session, later the same day, or at next-day check-in.
- **Decision:** stop the plan, re-run safety, and allow the new safety state to override phase, progression, and prior positive trends.

# 8. Diagnosis and Differential Rules

## 8.1 Diagnostic principle

The module presents a ranked possibility or preserves a sufficiently strong external diagnosis anchor; it does not make an unqualified autonomous diagnostic confirmation. Even a strong anchor settles identity only and never bypasses safety, current capacity, severity, stage, contraindications, or readiness.

## 8.2 Permitted injury identity states

- `RF_INJURY_SUSPECTED`
- `RF_MUSCLE_INJURY_DOCUMENTED`
- `RF_CENTRAL_APONEUROSIS_OR_INTRATENDINOUS_DOCUMENTED`
- `RF_PROXIMAL_TENDON_INJURY_DOCUMENTED`
- `RF_RECURRENT_INJURY_SUSPECTED_OR_DOCUMENTED`
- `DIRECT_QUADRICEPS_CONTUSION_SUSPECTED`
- `OTHER_ANTERIOR_THIGH_CONDITION_POSSIBLE`
- `DIAGNOSIS_UNRESOLVED`
- `OUT_OF_SCOPE_PRESENTATION`

`RF_RECURRENT_WITH_REPORTED_FIBROSIS` is removed. Reported fibrosis/scar is stored under `injury_history_modifier` with provenance and confirmation status.

## 8.3 Rule RF-DX-001 - mechanism activates questions, not diagnostic weighting

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty for question activation; evidence_record_only for mechanism percentages
- **Approval status:** pending
- **Architecture refs:** V3.1 §§4–5, 15.1
- **Evidence claims:** QRF-001 (M1; evidence record only), QRF-039 (D3; evidence record only)
- **Logic:** kicking, sprinting, acceleration, jumping, and other mechanisms activate targeted follow-up questions and relevant differentials.
- **Decision restriction:** v1.2 does not assign RF diagnostic probability weight from mechanism percentages. Santos remains abstract/metadata-only in the registry and cannot drive diagnosis or structural-location inference.
- **Prohibited use:** mechanism alone cannot diagnose RF injury, tendon involvement, grade, or location.

## 8.4 Rule RF-DX-002 - sudden stabbing pain

- **Normative source:** clinical_content
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** evidence_record_only
- **Approval status:** pending
- **Evidence claims:** QRF-002 (C1)
- **Logic:** sudden localized stabbing pain may be recorded as a non-specific history feature.
- **Prohibited use:** it must not distinguish RF injury from other anterior-thigh conditions or determine structural grade.

## 8.5 Rule RF-DX-003 - audible pop or snap

- **Normative source:** clinical_content
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** evidence_record_only
- **Approval status:** pending
- **Evidence claims:** QRF-003 (E1)
- **Logic:** a pop or snap may activate questions about immediate function, deformity, bruising, proximal pain, and external assessment.
- **Prohibited use:** absence does not exclude structural injury; presence does not prove a tear.

## 8.6 Rule RF-DX-004 - direct versus indirect mechanism branching

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§4–5, 15.1
- **Evidence claims:** QRF-015 (D2), with QRF-001 and QRF-039 retained as non-weighting mechanism context
- **Logic:** a direct blow prioritizes contusion and complication routing; an indirect high-speed, kicking, acceleration, or other loading mechanism may retain muscle-tendon injury in the differential.
- **Mixed mechanism:** retain both branches until evidence resolves them.
- **No-branch behavior:** if the required alternate module is unavailable, restrict output rather than forcing one diagnosis.

## 8.7 Rule RF-DX-005 - self-tests are supporting evidence only

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §9
- **Evidence claims:** QRF-004 (I1), QRF-005 (I1)
- **Logic:** ASLR and femoral nerve slump results may describe function or activate a neural differential but are not validated RF diagnostic or rule-out tests.
- **Action:** apply the self-administration reliability model; pain-invalidated and `cannot_assess` results remain unresolved.

## 8.8 Rule RF-DX-006 - imaging and report descriptor handling

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§6, 14.1, 25
- **Evidence claims:** QRF-006 (E1) only when the bull's-eye descriptor is specifically relevant
- **Logic:** report text may contribute exact anatomy, classification, and tendon involvement according to anchor quality. Raw user-uploaded images cannot be interpreted by the language model and require a separately validated imaging subsystem.
- **Prohibited use:** a bull's-eye descriptor is not a stand-alone diagnosis, grade, or prognosis rule. BAMIC ontology evidence is not authority for media-source handling.

## 8.9 Rule RF-DX-007 - strong diagnosis anchor

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§6, 10, 22
- **Logic:** diagnostic identity questions may be reduced only when an anchor is current-episode matched, anatomically specific, sufficiently authoritative, and internally coherent.
- **Never bypasses:** safety, current symptoms, capacity, contraindications, stage, concurrent injuries, or readiness.

## 8.10 Rule RF-DX-008 - anchor conflict

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§6.3, 20, 22
- **Trigger:** a strong documented anchor materially conflicts with the current presentation.
- **Decision:** preserve both the anchor and current evidence, set `external_reassessment`, block rehabilitation, explain the discrepancy, and create the required referral object. Silent replacement is prohibited.

## 8.11 Differential minimum set

For an unresolved anterior-thigh presentation, the engine MUST consider at minimum:

- RF muscle-tendon injury;
- direct quadriceps contusion;
- proximal tendon or avulsion-type injury when current evidence raises concern;
- neurological or referred pain when symptoms are not locally coherent;
- other anterior-thigh or hip-region musculoskeletal conditions;
- urgent trauma complications when safety features are present.

Numeric probabilities remain prohibited until the relevant diagnosis object has been calibrated against labelled cases.

# 9. Structural Classification, Severity, and Prognosis

## 9.1 Separation of concepts

The module must keep classification, structural severity, functional severity, irritability, current capacity, stage, and prognosis separate. Prognosis is uncertain group-level context, never a promised date.

## 9.2 Rule RF-SEV-001 - Munich classification

- **Normative source:** clinical_content
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Evidence claims:** QRF-007 (D2), QRF-011 (D2)
- **Logic:** a valid Munich classification may structure the record and provide population-limited group-level context.
- **Limits:** it is not RF-specific validation; imaging-negative or functional categories must not be equated with no injury; medians must not become individual timelines.

## 9.3 Rule RF-SEV-002 - BAMIC ontology and RF outcome context are separate

- **Normative source:** clinical_content
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** evidence_record_only for ontology; logic_with_uncertainty for bounded RF outcome context
- **Approval status:** pending
- **Evidence claims:** QRF-009 (E1; ontology only), QRF-040 (D2), QRF-041 (D3)
- **Ontology logic:** store a BAMIC grade/class only when supplied by a valid report or verified assessment. Do not infer it from mechanism, symptoms, or self-test results.
- **Outcome logic:** in a small elite track-and-field cohort, valid MRI-confirmed grade/class may widen group-level return-to-full-training or repeat-injury uncertainty.
- **Limits:** no precise individual timeline, automatic severity conversion, deterministic recurrence score, or universal rehabilitation change. QRF-010 is not used as authority for BAMIC outcomes.

## 9.4 Rule RF-SEV-003 - documented central-aponeurosis location

- **Normative source:** clinical_content
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Evidence claims:** QRF-008 (D2; central-tendon context), QRF-010 (D2; proximal-versus-distal location context)
- **Logic:** documented proximal central-aponeurosis involvement may increase prognostic caution compared with distal involvement in a similar high-level soccer population.
- **Action:** widen uncertainty and avoid early date promises; do not automatically alter stage or dosage.
- **Prohibited use:** no deterministic return-date formula.

## 9.5 Rule RF-SEV-004 - proximal or full-thickness injury

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** evidence_record_only for benchmarks; prohibited_autonomous_rule for treatment selection or individual timing
- **Approval status:** pending
- **Architecture refs:** V3.1 §§6, 13.1–13.2, 20
- **Evidence claims:** QRF-012 (C1), QRF-032 (C1), QRF-036 (I1)
- **Logic:** pooled operative and nonoperative timelines are broad research benchmarks only.
- **Decision:** when management restrictions are unresolved, apply RF-SAF-006 and block generic rehabilitation.
- **Prohibited use:** treatment-superiority inference, individual return prediction, or autonomous management choice.

## 9.6 Rule RF-SEV-005 - reported fibrosis or scar is history provenance, not severity

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** evidence_record_only
- **Approval status:** pending
- **Architecture refs:** V3.1 §§4–6, 8, 13.1, 24
- **Evidence claims:** QRF-044 (X1), QRF-046 (I1); QRF-045 (C1) applies only to the separate chronic structural pathway
- **Trigger:** the user reports previous fibrosis, scar, lump, tightness, or a different sensation at a prior RF site.
- **Decision:** store the report in `injury_history_modifier`, capture provenance and confirmation status, ask for available reports, and preserve structural uncertainty. Do not place it in the current structural profile unless a valid report supports it.
- **No independent effect:** self-report alone must not assign current injury identity, structural severity, prognosis, progression speed, monitoring threshold, or readiness.
- **Chronic structural separation:** persistent sport-related symptoms plus valid imaging evidence of central-tendon pathology may activate a distinct external assessment/referral pathway informed only as reference context by QRF-045. It does not validate self-reported fibrosis or autonomous surgical selection.

## 9.7 Functional severity profile

The platform SHOULD characterize functional severity using evidence-quality-tagged observations rather than one invented score:

- walking and stair tolerance;
- active knee-extension and hip-flexion function;
- tolerated active and passive range where safe;
- strength or force capacity where measurable;
- basic unilateral-task capacity;
- running, sprinting, and kicking tolerance;
- compensatory movement;
- immediate and delayed symptom recovery.

Each capability must record method, side, unit or band, reliability, pain interference, and date.

## 9.8 Prognostic communication rule

The platform MAY provide a governed qualitative context only after the communication model is validated. It MUST show the factors and evidence limits producing caution and MUST NOT present a precise return date from the current evidence set.

# 10. Rehabilitation Stage Model

## 10.1 Governing structure

The module adopts the six-phase Aspetar pathway as an expert-informed structural template, not as proven comparative treatment:

1. Foundation
2. Reload
3. Accumulation
4. Transition
5. Simulation
6. Resilience

QRF-019 records practitioner agreement and clinical acceptability, not effectiveness, reinjury reduction, or superiority. Strength and broader lower-limb capacity work continue through all appropriate phases; later field work does not replace strength.

## 10.2 Universal phase rules

- Phase is determined by criteria and current capacity, not time alone.
- A later-phase entry requires evidence that earlier safety and capability requirements are satisfied.
- Safety and monitoring can override phase at any time.
- Progression requires evidence across the domains the next phase will load, not absence of pain alone.
- Regression is a governed response, not failure.
- Unaffected conditioning and strength are preserved where safe.
- No universal sets, repetitions, intensity, rest, frequency, or progression increment is authorized by the current RF evidence set.

## 10.3 Phase specification

| Phase | Primary objective | Exercise characteristics | Field and sport exposure | Exit decision basis |
|---|---|---|---|---|
| Foundation | Restore safe basic motion and early force tolerance | isometric-dominant; short-to-mid muscle length; low complexity; isolated motor control plus safe general strength | no field exposure unless specifically cleared | safety and restrictions resolved; basic function improving; early load tolerated |
| Reload | Redevelop strength and movement capacity | tri-phasic exposure may be introduced; progressive range and load; isolated plus controlled compound work | mechanics drills and low-level locomotion when criteria permit | improving motion, force, execution, and response |
| Accumulation | Build strength, eccentric capacity, and running volume | longer-length and eccentric-overload candidates with continued whole-limb strength | generic running and low-intensity sport drills | repeated load tolerance and appropriate recovery |
| Transition | Prepare for higher-speed and higher-demand sport | individualized strength, concentric and reactive qualities, continued eccentric capacity | higher-speed running, acceleration/deceleration, and higher-demand sport drills | clinical and field capacity sufficiently restored for the next exposures |
| Simulation | Reproduce sport scenarios, intensity, and volume | sport-specific power and reactive work with continuing strength | sprinting, kicking where relevant, game scenarios, and worst-case demand blocks | multi-domain Simulation evidence; demand profile substantially addressed |
| Resilience | Return to performance and address residual deficits | maintain or progress strength, power, speed, and robustness | controlled or unrestricted team integration only after the readiness decision | performance gaps, workload reintegration, and monitoring plan addressed |

## 10.4 Rule RF-REHAB-001 - phase entry requires a complete prescription input

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§13.1–13.2, 24
- **Required objects:** injury identity, live safety state, safety confidence, stage confidence, current capacity, demand profile, equipment, schedule, concurrent injuries, monitoring contract, and missing-input actions.
- **Decision:** diagnosis alone never authorizes a full plan. A locked safety-confidence object cannot coexist with a full plan.

## 10.5 Rule RF-REHAB-002 - loading dimensions are ontology metadata, not a universal sequence

- **Normative source:** mixed
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty for ontology selection; evidence_record_only for any proposed sequence
- **Approval status:** pending
- **Architecture refs:** V3.1 §§13, 35
- **Evidence claims:** QRF-020 (E1)
- **Logic:** exercise candidates may be described by muscle length, movement speed, contraction mode, load, complexity, and sport specificity.
- **Limit:** QRF-020 does not prove a universal ordering or dosage. The chosen progression must be justified by stage, capacity, monitoring, and separately governed content.

## 10.6 Rule RF-REHAB-003 - RF-biased position tag

- **Normative source:** clinical_content
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** evidence_record_only
- **Approval status:** pending
- **Evidence claims:** QRF-021 (E1)
- **Logic:** approximately 40 degrees of hip flexion during selected knee-extension testing or exercise may be stored as an RF-bias tag.
- **Prohibited use:** it cannot independently determine exercise superiority, dosage, or stage eligibility.

## 10.7 Rule RF-REHAB-004 - no universal RF dosage

- **Normative source:** clinical_content
- **Normative strength:** PROHIBITION
- **Content status:** candidate
- **Permitted use:** prohibited_autonomous_rule
- **Approval status:** pending
- **Evidence claims:** QRF-022 (I1), QRF-035 (I1)
- **Behavior:** the RF module must not invent universal sets, repetitions, intensity, rest, weekly frequency, or progression increments.
- **Engineering consequence:** any active universal RF dose without a separately approved source and version must fail content validation.

## 10.8 Rule RF-REHAB-005 - schedule and total-load reconciliation

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§11, 13.3
- **Logic:** strength, eccentric exposure, running, sprinting, kicking, matches, conditioning, and concurrent-injury work must be composed into one weekly load plan.
- **Decision:** avoid duplicate tissue stress and unaccounted stacking; if the schedule cannot satisfy all active constraints, modify, restrict, or block the plan.

## 10.9 Rule RF-REHAB-006 - concurrent injury constraints govern

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §11 and §15.2
- **Activation:** one or more secondary, contributing, concurrent, referred, compensatory, or chronic conditions are active.
- **Decision:** compose one programme under the most restrictive active contraindication; avoid incompatible loading and duplicate workload while preserving safe unaffected training.
- **Conflict behavior:** if no plan satisfies every active contraindication, set terminal `REHAB_BLOCKED`, withhold the plan, and refer. No condition may be silently ignored.

## 10.10 Rule RF-RECUR-001 - prior injury changes recurrence handling without imposing a universal delay

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§4, 12–13
- **Evidence claims:** QRF-042 (D2), QRF-041 (D3 when valid MRI class exists), QRF-043 (D3; reference only), QRF-033 and QRF-034 (I1 population limitations)
- **Trigger:** one or more prior quadriceps or RF injuries.
- **Required behavioral change:** collect episode count, side/site, recency, prior management, prior return exposure, and previous failure/non-response; mark the episode as recurrent or recurrence-relevant; require recurrence-specific exposure and next-day monitoring; display the population limits of the evidence.
- **No automatic slowing:** prior injury alone does not create a fixed delay, a longer monitoring window, a higher pain threshold, or a mandatory phase hold. Any actual progression decision remains capacity- and response-based.
- **Prohibited inference:** reported fibrosis is not required to activate this history rule and does not increase its authority.

## 10.11 Rule RF-RECUR-002 - recurrence-sensitive exposure domains remain separate and unranked

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§12–14
- **Evidence claims:** QRF-020 (E1), QRF-039 (D3; reference only), QRF-043 (D3; reference only)
- **Logic:** when relevant to the athlete's sport and programme, kicking, sprinting/high-speed running, and long-length or end-range loading are tracked as separate exposure domains with their own volume, intensity, technical context, data quality, and immediate/next-day response.
- **Unranked behavior:** no domain is labelled the universal 'highest risk'. Tolerance of one does not clear another.
- **Passive stretch restriction:** passive overstretch is not a universally prioritized RF reinjury mechanism in the reconciled evidence and must not be presented as such.
- **Fibrosis restriction:** no exposure is slowed, ranked, or blocked specifically because of self-reported fibrosis.

# 11. Exercise Ontology and Selection Interface

The RF module must not store a hard-coded list of exercises. It must request exercise characteristics from the shared exercise knowledge graph.

## 11.1 Required exercise metadata

Each exercise candidate must include:

- exercise identifier and family;
- primary and secondary tissues loaded;
- joint actions and dominant movement pattern;
- hip and knee position;
- contraction mode;
- estimated muscle-length demand;
- external load and loadability;
- velocity and explosiveness demand;
- balance, coordination, and technical complexity;
- impact and reactive-strength demand;
- equipment and environment;
- phase suitability;
- contraindications and stop rules;
- progressions, regressions, and substitutes;
- sport-transfer tags;
- coaching cues and common errors;
- media demonstration status;
- evidence/provenance class;
- review and confidence status.

## 11.2 Selection logic

The exercise-selection engine must filter in this order:

1. safety and contraindications;
2. active injury and concurrent-injury restrictions;
3. current phase and target capacity;
4. irritability and symptom response;
5. available range, strength, and technical capacity;
6. equipment and environment;
7. schedule and total load;
8. sport and position demands;
9. previous exercise response and adherence;
10. user preference among clinically equivalent choices.

## 11.3 Substitution rule

An exercise may be substituted only when the replacement preserves the intended tissue, movement, contraction, range, load, and phase objective while respecting contraindications. Name similarity is insufficient.

# 12. Monitoring, Adaptation, and Non-Response

## 12.1 Monitoring moments

Every session must include:

- pre-session symptom and safety check;
- symptom response during each exercise or field block;
- immediate post-session response;
- later same-day response where relevant;
- next-day response;
- function and confidence trend;
- completion, dose delivered, and deviations from prescription.

## 12.2 Stop conditions

The session must stop and safety must re-run when there is:

- new severe or rapidly escalating pain;
- new progressive swelling or tightness;
- neurological or vascular symptoms;
- sudden loss of function;
- a new pop with immediate deterioration;
- inability to safely complete the movement;
- any symptom matching a global red-flag rule.

## 12.3 Ordinary symptom-response handling

Because the present RF evidence does not establish universal pain thresholds, ordinary exercise discomfort must be governed by a configurable monitoring profile rather than one global cut-off. The profile must specify:

- acceptable during-session band;
- acceptable next-day change;
- expected recovery window;
- action after mild, moderate, or major deviation;
- tissue and phase applicability;
- evidence source and version.

No profile becomes active until separately reviewed and tested.

## 12.4 Adaptation actions

The engine may choose exactly one primary action after a session:

- progress;
- maintain;
- reduce dose;
- reduce range or speed;
- replace with a regression;
- change schedule;
- hold the current phase;
- regress phase;
- reopen diagnosis or severity;
- block rehabilitation and refer.

The reason must be traceable to specific inputs and rules.

## 12.5 Non-response sequence

Before referring for non-response, the engine must check:

1. adherence;
2. exercise execution quality where assessable;
3. actual versus prescribed load;
4. symptom behavior and recovery window;
5. diagnosis consistency;
6. severity and stage consistency;
7. new safety concerns;
8. concurrent injuries;
9. external training or match load;
10. whether the current rule is unsupported for the user's population.

The exact number of failed sessions or time window for non-response remains an unresolved parameter and must not be invented.

# 13. Running, Sprinting, and Kicking

## 13.1 General principle

Running, sprinting, acceleration/deceleration, change of direction, and kicking are distinct exposure domains. Tolerance of one does not automatically clear another.

## 13.2 Rule RF-FIELD-001 - Aspetar speed milestones

- **Normative source:** clinical_content
- **Normative strength:** MAY
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Evidence claims:** QRF-024 (E1)
- **Reference milestones:** at least 70%, 80%, and 95% of maximum sprint speed appear as Aspetar phase-exit criteria for Accumulation, Transition, and Simulation.
- **Permitted use:** pathway-specific expert criteria only when the athlete's maximum sprint speed denominator is valid and the context is sufficiently similar.
- **Prohibited use:** universal mandatory thresholds, proof of readiness, or use with an unknown or unreliable denominator.

## 13.3 Rule RF-FIELD-002 - 95% maximum sprint speed is not sufficient alone

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§12, 14.2, 24
- **Evidence claims:** QRF-025 (E1)
- **Decision:** reaching 95% maximum sprint speed may contribute to Simulation evidence but cannot independently authorize unrestricted training or competition.

## 13.4 Rule RF-FIELD-003 - higher-speed exposure requires verified prerequisite capacity

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§12–13
- **Evidence claims:** QRF-019 (E1), QRF-024 (E1), QRF-025 (E1)
- **Definition:** `higher_speed_exposure` means a planned running exposure above the athlete's previously verified tolerated speed band or an activated Aspetar milestone; no hidden speed threshold is implied.
- **Prerequisites:** safety clear, prior lower-speed exposure completed with acceptable monitored response, relevant capacity records available, and no active schedule or concurrent-injury conflict.
- **Limit:** exact symmetry, pain, volume, and recovery thresholds remain separately governed content.

## 13.5 Rule RF-FIELD-004 - kicking exposure is a separately monitored sport-demand domain

- **Normative source:** mixed
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty for domain separation; evidence_record_only for epidemiological percentages
- **Approval status:** pending
- **Architecture refs:** V3.1 §§12–14
- **Evidence claims:** QRF-001 (M1; reference only), QRF-026 (D2; reference only), QRF-039 (D3; reference only), QRF-043 (D3; reference only)
- **Logic:** where kicking is part of the athlete's demand profile, reintroduce and record it separately for kicking leg, volume, intensity, technique/context, chaos, data quality, and immediate/next-day response.
- **Limits:** population-specific mechanism or recurrence percentages cannot be generalized, and kicking is not universally ranked above sprinting or other demands.

## 13.6 Rule RF-FIELD-005 - sprint work-to-rest ratios are not RF-specific dosage rules

- **Normative source:** clinical_content
- **Normative strength:** PROHIBITION
- **Content status:** candidate
- **Permitted use:** prohibited_autonomous_rule
- **Approval status:** pending
- **Evidence claims:** QRF-028 (X1)
- **Behavior:** 1:3, 1:5, and 1:7 sprint work-to-rest ratios must not become RF-specific autonomous dosing rules.

## 13.7 Field exposure record

Every field or kicking exposure should record:

- exposure domain and objective;
- surface and footwear;
- distance or duration;
- intensity or measured speed and denominator quality;
- number of efforts;
- acceleration, deceleration, and change-of-direction demand;
- kicking leg, volume, intensity, and context where relevant;
- rest structure;
- external team load;
- immediate and next-day response;
- measurement method and data quality.

# 14. Return to Training and Return to Performance

## 14.1 Multi-domain readiness

A readiness decision must consider safety, anchor consistency, stage and progression confidence, evidence completeness, clinical function, strength and capacity, field exposure, sport-specific demands, workload reintegration, concurrent injuries, psychological readiness where measured, and required external clearance.

## 14.2 Rule RF-RTS-001 - no date-only clearance

- **Normative source:** mixed
- **Normative strength:** PROHIBITION
- **Content status:** candidate
- **Permitted use:** prohibited_autonomous_rule for date-only clearance; evidence_record_only for cohort benchmarks
- **Approval status:** pending
- **Architecture refs:** V3.1 §§12, 14.2, 24
- **Evidence claims:** QRF-013 (I1), QRF-029 (D2), QRF-031 (I1), QRF-032 (C1)
- **Logic:** cohort medians, pooled means, and regression formulas may be explained as population context but cannot determine an individual's readiness date.

## 14.3 Rule RF-RTS-002 - unrestricted training follows multi-domain Simulation evidence

- **Normative source:** mixed
- **Normative strength:** SHOULD
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§12, 14.2
- **Evidence claims:** QRF-030 (E1)
- **Logic:** the Aspetar structure places unrestricted team integration in Resilience after multi-domain Simulation milestones.
- **Limit:** this is expert-pathway structure, not proof of safety, effectiveness, or formal clearance.

## 14.4 Rule RF-RTS-003 - readiness-tier honesty

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§14.2, 24.3
- **Decision:** a home-only readiness assessment must not be presented as equivalent to supervised clinical, gym-objective, GPS, force-platform, or laboratory testing. Show what was assessed, what was unavailable, and which decisions remain locked.

## 14.5 Rule RF-RTS-004 - outstanding performance deficits remain active targets

- **Normative source:** architecture
- **Normative strength:** MUST
- **Content status:** candidate
- **Permitted use:** logic_with_uncertainty
- **Approval status:** pending
- **Architecture refs:** V3.1 §§12, 13.3, 14.2
- **Logic:** symptom resolution or medical improvement does not end rehabilitation when the capacity-to-demand gap remains open. Resilience continues to target outstanding performance, workload, and robustness deficits.

## 14.6 Return decision outputs

The module may output:

- not ready - safety or essential evidence unresolved;
- not ready - capacity or exposure criteria incomplete;
- ready for restricted individual training;
- ready for controlled team integration;
- ready for unrestricted training, subject to external club or competition requirements;
- readiness cannot be determined with available evidence.

Every readiness object is decision support and must preserve `is_clearance: false`. The module must not guarantee safe competition.

# 15. Confidence and User Communication

## 15.1 Separate confidence objects

The module must maintain:

- diagnosis confidence;
- severity confidence;
- stage confidence;
- safety confidence;
- progression confidence;
- readiness completeness.

Numeric percentages are prohibited until calibration has been validated. Before then, use governed qualitative bands and show evidence completeness.

## 15.2 Explanation requirements

For every material decision, the user-facing explanation must state:

- what was observed;
- what the platform thinks is most likely;
- what remains uncertain;
- what changed the decision;
- why an action is restricted or blocked;
- what information or assessment would reopen the pathway;
- which conclusions the platform is not making.

## 15.3 Prohibited language

The explanation layer must not say:

- “You definitely have a Rectus Femoris tear” without an adequate anchor;
- “You do not have compartment syndrome” based on symptom screening;
- “You will return in X days/weeks” from group data;
- “Your scan proves your current capacity”;
- “95% sprint speed means you are safe to play”;
- “This exercise dosage is evidence-based for all RF injuries” when it is not.

# 16. Machine-Readable Rule Contract

Every governed rule should be represented by an object that separates architecture authority, evidence permission, lifecycle status, and approval:

```json
{
  "rule_id": "RF-SAF-001",
  "module": "rectus_femoris",
  "rule_version": "1.2",
  "normative_source": "mixed",
  "normative_strength": "MUST",
  "content_status": "candidate",
  "permitted_use": "safety_referral_trigger",
  "approval_status": "pending",
  "domain": "safety",
  "architecture_refs": ["V3.1-7", "V3.1-20", "V3.1-21", "V3.1-22"],
  "evidence_claims": [
    {"claim_id": "QRF-014", "grade": "C1"},
    {"claim_id": "QRF-037", "grade": "E1"},
    {"claim_id": "QRF-038", "grade": "E1"}
  ],
  "activation_predicates": [],
  "required_inputs": [],
  "contraindications": [],
  "decision": {},
  "blocked_targets": ["all"],
  "clearance_condition": {},
  "confidence_effect": {},
  "explain_tokens": [],
  "prohibited_inferences": [],
  "population_limits": [],
  "test_case_ids": []
}
```

A rule-level synthetic grade must not replace the individual claim grades.

## 16.1 Required engineering invariants

- Rule IDs are stable and unique.
- Every input referenced by a rule exists in the input registry.
- Every decision has at least one incoming traceability edge.
- Every evidence claim ID exists in the active evidence registry version.
- Architecture-only rules carry `architecture_refs` and do not fabricate evidence claims.
- `evidence_record_only` and `prohibited_autonomous_rule` content cannot become decision-driving executable logic.
- `approval_status: pending` or `rejected` cannot enter an approved executable release.
- A terminal safety state cannot coexist with a full plan.
- `URGENT_REFERRAL`, `EMERGENCY_SIGNPOSTING`, and `OUT_OF_SCOPE` require `blocked_targets: all`.
- `CLEAR_WITH_MONITORING` requires at least one monitor flag.
- Effective blocked targets equal safety blocks plus partial locks.
- Unknown units or incompatible dimensions cannot be compared.
- A rule cannot silently exceed its population applicability.
- Self-reported fibrosis cannot populate imaging-confirmed structure or independently alter severity, prognosis, progression, or readiness.
- The language model cannot alter the deterministic decision object.

# 17. Minimum Synthetic Validation Suite

Gate B authoring must include, at minimum:

1. Acute indirect kicking injury, no red flags, no report - RF remains a possibility; mechanism selects questions but does not add an uncalibrated probability or grade.
2. Direct blow with progressive swelling - `URGENT_REFERRAL`, `blocked_targets: all`, no RF strain programme.
3. Disproportionate pain and passive-movement pain - urgent escalation; no diagnosis or exclusion of compartment syndrome.
4. Inconclusive compartment-syndrome concern - no home hourly-clearance workflow; external urgent assessment.
5. Delayed deterioration after major trauma - reopens safety despite a previous clear screen.
6. Strong current MRI report confirming central-tendon injury - preserves identity anchor but still measures current capacity and stage.
7. Strong report conflicting with current presentation - `external_reassessment`, rehabilitation block, and matching referral.
8. Known proximal full-thickness injury without current restrictions - `REHAB_BLOCKED` until management details resolve.
9. Imaging-negative but functionally limited athlete - not classified as uninjured.
10. Self-test cannot be completed because of pain - `cannot_assess`; no positive/negative coercion.
11. Santos mechanism claim is tagged decision-driving - build fails because QRF-039 is evidence-record-only.
12. Valid MRI-confirmed BAMIC class-c RF injury - permits bounded group context from QRF-040, never a precise return date.
13. BAMIC class inferred from symptoms or mechanism - build or rule execution fails.
14. Prior RF injury with no reported fibrosis - recurrence history fields and separate exposure monitoring activate.
15. Prior RF injury with self-reported fibrosis only - history modifier is stored as unverified; no structural severity, progression delay, or prognosis effect.
16. Imaging-confirmed fibrosis in a prior report - stored as historical structural evidence but still does not independently create a recurrence multiplier.
17. Persistent symptoms for more than four months plus valid MRI-confirmed central-tendon pathology - chronic structural referral context activates; no autonomous surgery selection.
18. Kicking, sprinting, and long-length loading are ranked as universal highest-risk exposures - content validation fails.
19. Passive overstretch is asserted as a universal recurrent-RF mechanism - content validation fails.
20. Female track athlete with documented BAMIC class-c injury - McAleer context may be used with its small-cohort limits; male football timelines are not substituted.
21. Adolescent anterior-thigh injury - possible avulsion/generalizability route; unsupported autonomous management is restricted.
22. Athlete reaches 95% MSS but lacks other Simulation domains - no unrestricted training decision.
23. External match load overlaps with eccentric and sprint sessions - schedule reconciliation modifies or restricts the week.
24. Concurrent knee restriction conflicts with RF exercise choice - RF-REHAB-006 selects the most restrictive compatible option or blocks the plan.
25. Repeated next-day worsening - maintain, reduce, regress, reopen diagnosis/safety, or refer according to the monitoring contract; no automatic progression.
26. Blocked 320%/400% isokinetic value appears as active content - CI fails.
27. Blocked 1:3/1:5/1:7 RF sprint dosing appears - CI fails.
28. Universal RF sets/repetitions/frequency appear without an approved dosage source - CI fails.
29. `CLEAR_WITH_MONITORING` has no monitor flag - schema/semantic validation fails.
30. `URGENT_REFERRAL`, `EMERGENCY_SIGNPOSTING`, or `OUT_OF_SCOPE` does not block `all` - validation fails.
31. A pending rule is included in an approved executable release - release validation fails.
32. A reference-only claim is mistakenly tagged as decision-driving - build fails.

# 18. Release Gates

## 18.1 Gate A - document reconciliation

Gate A requires:

- every governed rule has an authoritative body;
- architecture and evidence authority are separated;
- claim IDs and grades are accurate;
- V3.1 safety vocabulary and blocked-target behavior are exact;
- unsupported thresholds, causal rankings, and self-reported structural inferences are removed or explicitly prohibited;
- every rule has a testable decision and prohibited-inference boundary.

**v1.2 result:** passed in the accompanying Gate A re-audit. This is document-level acceptance only.

## 18.2 Gate B - machine-readable authoring

- convert the 38 Gate A-accepted entries into versioned rule objects;
- bind inputs, decisions, architecture references, and evidence claims;
- create traceability edges;
- author positive, negative, and adversarial fixtures including the v1.2 cases;
- validate against the frozen V3.1/V2.2.2 schemas and semantic validators;
- keep every rule `approval_status: pending` until formal clinical adjudication.

## 18.3 Gate C - software implementation

- Claude Code implements only approved machine-readable objects;
- deterministic engines retain authority over safety, diagnosis state, plan permissions, progression, and readiness;
- the language layer renders only authorized explanation tokens;
- all critical actions remain auditable.

## 18.4 Gate D - clinical and product validation

Production clinical use remains blocked pending diagnostic and safety validation, calibrated confidence, prospective rehabilitation outcome testing, subgroup performance analysis, human-factors testing, privacy/security completion, regulatory classification, and formal release sign-off.

# 19. Current Completion Status

| Component | Status after v1.2 |
|---|---|
| Controlling architecture | Frozen at `Master_Architecture_V3.1_Final` |
| Engineering schema package | Frozen V2.2.2 package inherited by V3.1; 38 schemas and 124 fixtures previously verified |
| RF evidence map | Final audited baseline retained |
| RF evidence registry | v1.1 created with QRF-001–QRF-046 and reconciled source catalogue |
| Santos evidence | Abstract/metadata-only, evidence-record-only; no decision weighting |
| RF clinical rule specification | v1.2 Gate A reconciled candidate |
| Gate A | Passed at document level; no clinical approval implied |
| Machine-readable RF rule package | Not created; Gate B next |
| Exercise ontology and approved dosage content | Not yet released; universal RF dosage remains blocked |
| RF deterministic implementation | Not started |
| Synthetic validation | v1.2 catalogue specified; fixtures not yet authored or executed |
| Clinical validation | Not started |
| Production authorization | Not granted |

# 20. Immediate Next Action

The next action is **Gate B machine-readable authoring, not product coding**.

The Gate B package should:

1. convert the 38 accepted rule entries into the v1.2 rule contract;
2. bind every architecture reference and evidence claim without inventing combined grades;
3. create the input registry, decision nodes, and traceability graph;
4. author positive, negative, boundary, and adversarial fixtures from Section 17;
5. validate the package with the frozen V3.1/V2.2.2 schemas and semantic gate;
6. remain blocked from Claude Code implementation until rule-level clinical approval is recorded.

The paywalled Santos full text is not a Gate B prerequisite because v1.2 does not use QRF-039 to weight diagnosis or infer structure. A future full-text adjudication may support a controlled amendment, but it must not silently expand the current rule.

# Appendix A - Rule Catalogue

| Rule ID | Domain | Normative source | Strength | Permitted use | Approval | Primary decision |
|---|---|---|---|---|---|---|
| RF-SAF-001 | Safety | mixed | MUST | safety_referral_trigger | pending | Urgent or emergency escalation for disproportionate pain/passive-movement pain; no ACS diagnosis |
| RF-SAF-002 | Safety | mixed | MUST | safety_referral_trigger | pending | Escalate progressive swelling/tightness after major trauma; no home threshold |
| RF-SAF-003 | Safety | mixed | MUST | safety_referral_trigger | pending | Reopen safety for delayed deterioration |
| RF-SAF-004 | Safety | architecture | MUST | safety_referral_trigger | pending | Escalate vascular or neurological compromise |
| RF-SAF-005 | Safety | architecture | MUST | logic_with_uncertainty | pending | Cannot-assess remains unresolved |
| RF-SAF-006 | Safety | mixed | MUST | logic_with_uncertainty | pending | Block generic rehabilitation while major-injury/postoperative restrictions are unresolved |
| RF-SAF-007 | Safety | mixed | MUST | logic_with_uncertainty | pending | Route direct blow to approved contusion branch or out of scope |
| RF-SAF-008 | Safety | architecture | MUST | safety_referral_trigger | pending | New red flags override current phase and plan |
| RF-DX-001 | Diagnosis | mixed | MUST | logic_with_uncertainty | pending | Mechanism activates questions; no uncalibrated prior weighting |
| RF-DX-002 | Diagnosis | clinical_content | MAY | evidence_record_only | pending | Stabbing pain is non-specific history |
| RF-DX-003 | Diagnosis | clinical_content | MAY | evidence_record_only | pending | Pop/snap raises concern but is not diagnostic |
| RF-DX-004 | Diagnosis | mixed | MUST | logic_with_uncertainty | pending | Separate direct and indirect branches; retain mixed presentations |
| RF-DX-005 | Diagnosis | mixed | MUST | logic_with_uncertainty | pending | Self-tests are supporting evidence only |
| RF-DX-006 | Diagnosis | mixed | MUST | logic_with_uncertainty | pending | Report/media provenance governs imaging descriptors |
| RF-DX-007 | Diagnosis | architecture | MUST | logic_with_uncertainty | pending | Strong anchor reduces identity questions only |
| RF-DX-008 | Diagnosis | architecture | MUST | logic_with_uncertainty | pending | Strong-anchor conflict triggers external reassessment |
| RF-SEV-001 | Severity | clinical_content | MAY | logic_with_uncertainty | pending | Munich framework for guarded group context |
| RF-SEV-002 | Severity | clinical_content | MAY | logic_with_uncertainty | pending | Separate BAMIC ontology from MRI-confirmed RF outcome context |
| RF-SEV-003 | Prognosis | clinical_content | MAY | logic_with_uncertainty | pending | Documented proximal central-aponeurosis location widens uncertainty |
| RF-SEV-004 | Prognosis | mixed | MUST | prohibited_autonomous_rule | pending | No autonomous treatment selection or individual timing from proximal/full-thickness reviews |
| RF-SEV-005 | History/structure | mixed | MUST | evidence_record_only | pending | Reported fibrosis/scar is provenance-tagged history, not severity |
| RF-REHAB-001 | Rehabilitation | architecture | MUST | logic_with_uncertainty | pending | Complete prescription input required |
| RF-REHAB-002 | Rehabilitation | mixed | MAY | logic_with_uncertainty | pending | Loading dimensions are ontology metadata, not a universal sequence |
| RF-REHAB-003 | Rehabilitation | clinical_content | MAY | evidence_record_only | pending | RF-biased position tag only |
| RF-REHAB-004 | Rehabilitation | clinical_content | PROHIBITION | prohibited_autonomous_rule | pending | No universal RF dosage |
| RF-REHAB-005 | Rehabilitation | architecture | MUST | logic_with_uncertainty | pending | Reconcile weekly and external load |
| RF-REHAB-006 | Rehabilitation | architecture | MUST | logic_with_uncertainty | pending | Concurrent injury constraints govern or block the plan |
| RF-RECUR-001 | Recurrence | mixed | MUST | logic_with_uncertainty | pending | Prior injury activates recurrence-specific history and monitoring without a fixed delay |
| RF-RECUR-002 | Recurrence | mixed | MUST | logic_with_uncertainty | pending | Track relevant exposure domains separately and without causal ranking |
| RF-FIELD-001 | Running/sprinting | clinical_content | MAY | logic_with_uncertainty | pending | Aspetar MSS milestones with denominator and population limits |
| RF-FIELD-002 | Running/sprinting | mixed | MUST | logic_with_uncertainty | pending | 95% MSS is not sufficient alone |
| RF-FIELD-003 | Running/sprinting | mixed | MUST | logic_with_uncertainty | pending | Higher-speed exposure requires verified prerequisite capacity |
| RF-FIELD-004 | Kicking | mixed | MUST | logic_with_uncertainty | pending | Track kicking separately; epidemiological percentages remain reference-only |
| RF-FIELD-005 | Sprint dosage | clinical_content | PROHIBITION | prohibited_autonomous_rule | pending | No RF-specific use of general work-to-rest ratios |
| RF-RTS-001 | Readiness | mixed | PROHIBITION | prohibited_autonomous_rule | pending | No date-only individual clearance |
| RF-RTS-002 | Readiness | mixed | SHOULD | logic_with_uncertainty | pending | Multi-domain Simulation before unrestricted team integration |
| RF-RTS-003 | Readiness | architecture | MUST | logic_with_uncertainty | pending | Testing-tier honesty and output locks |
| RF-RTS-004 | Performance | architecture | MUST | logic_with_uncertainty | pending | Continue Resilience while performance gaps remain |

# Appendix B - Evidence Claim Mapping

| Claim ID | Permitted role in v1.2 |
|---|---|
| QRF-001 | Mechanism record only; no diagnostic weighting in v1.2 |
| QRF-002 | Reference-only non-specific symptom |
| QRF-003 | Reference-only concern signal |
| QRF-004 | Functional record only |
| QRF-005 | Neural differential support only |
| QRF-006 | Imaging descriptor reference only |
| QRF-007 | Conditional Munich group context |
| QRF-008 | Central-tendon context |
| QRF-009 | BAMIC ontology only |
| QRF-010 | Proximal-versus-distal central-aponeurosis context |
| QRF-011 | Imaging-negative does not equal uninjured; group context only |
| QRF-012 | Proximal/full-thickness benchmark only |
| QRF-013 | Blocked from individual prediction |
| QRF-014 | Safety referral signal |
| QRF-015 | Conditional contusion classification in dedicated module |
| QRF-016 | Conditional MO-risk context in dedicated module |
| QRF-017 | Safety escalation principle; no home threshold |
| QRF-018 | Delayed-vigilance signal only |
| QRF-019 | Conditional expert pathway structure |
| QRF-020 | Loading-dimension ontology/reference |
| QRF-021 | RF-bias tag only |
| QRF-022 | Blocks universal RF dosing |
| QRF-023 | Blocked unresolved isokinetic benchmark |
| QRF-024 | Conditional Aspetar MSS milestones |
| QRF-025 | Multi-domain readiness restriction |
| QRF-026 | Population-limited kicking/reinjury record only |
| QRF-027 | General sprint-readiness reference only |
| QRF-028 | Blocked RF-specific sprint-ratio dosing |
| QRF-029 | Conditional Munich cohort context only |
| QRF-030 | Conditional Resilience structure |
| QRF-031 | Blocked individual regression prediction |
| QRF-032 | Blocked individual timing or treatment comparison |
| QRF-033 | Sex/fairness limitation |
| QRF-034 | Youth/recreational generalizability limitation |
| QRF-035 | RF dosage research gap |
| QRF-036 | Management-choice research gap |
| QRF-037 | BOAST warning findings; safety referral only |
| QRF-038 | BOAST unresolved-uncertainty escalation only |
| QRF-039 | Santos abstract/metadata-only mechanism record; no weighting |
| QRF-040 | Conditional MRI-confirmed BAMIC RF return context |
| QRF-041 | Conditional MRI-confirmed BAMIC RF repeat-injury context |
| QRF-042 | Prior quadriceps injury as population-limited history modifier |
| QRF-043 | AFL recurrence/kicking/timing context only |
| QRF-044 | Indirect counter-evidence against fibrosis-only recurrence inference |
| QRF-045 | Rare chronic/recurrent MRI-confirmed central-tendon referral context |
| QRF-046 | Blocks self-reported fibrosis as independent severity/progression modifier |

# Appendix C - Blocked Parameters and Inferences

The following must fail content validation if entered as active autonomous RF logic:

- Balius regression formulas for individual sports participation absence;
- pooled operative/nonoperative means as individual return targets or treatment comparisons;
- 320% and 400% isokinetic thresholds without defined unit, normalization, speed, and protocol;
- 1:3, 1:5, and 1:7 sprint work-to-rest ratios as RF-specific dosing;
- universal RF sets, repetitions, intensity, rest, frequency, or progression increments from the current source set;
- diagnosis or exclusion of compartment syndrome from symptom screening;
- home replication of BOAST hourly hospital assessment as a clearance pathway;
- automatic equation of MRI-negative with uninjured;
- unrestricted return from 95% MSS alone;
- diagnostic weighting or structural-location inference from QRF-039 while Santos remains abstract/metadata-only;
- `RF_RECURRENT_WITH_REPORTED_FIBROSIS` as a current injury identity;
- self-reported fibrosis/scar as imaging-confirmed structure, severity, prognosis, progression, or readiness logic;
- a universal six-month reinjury hazard period from the elite male AFL study;
- ranking kicking, passive overstretch/end-range loading, and sprinting as universal highest-risk recurrent-RF domains;
- passive overstretch as a universal recurrent-RF mechanism;
- automatic slowing or acceleration based solely on prior injury or reported fibrosis.

# Appendix D - Source Catalogue

## D.1 Controlling documents

1. *Master Architecture V3.1 — Unified Controlling Architecture*. 15 June 2026.
2. *Master Architecture V3.1 (Final) — Amendment Log & Declarations*. 15 June 2026.
3. *Quadriceps & Rectus Femoris Master Evidence Map*. Final audited map, 14 June 2026.
4. *Quadriceps & Rectus Femoris Evidence Registry v1.1*. 15 June 2026.

## D.2 Clinical evidence sources

1. Wallace S, Simpson D, Mc Keever H, Whiteley R, King E. *The Aspetar Rectus Femoris Injury Rehabilitation Pathway*. JOSPT Open. 2026.
2. Mueller-Wohlfahrt HW, et al. *Terminology and classification of muscle injuries in sport: The Munich consensus statement*. 2013.
3. Ekstrand J, et al. *Return to play after thigh muscle injury in elite football players: implementation and validation of the Munich muscle injury classification*. 2013.
4. Pollock N, et al. *British athletics muscle injury classification: a new grading system*. 2014.
5. Balius R, et al. *Central aponeurosis tears of the rectus femoris: practical sonographic prognosis*. 2009.
6. Ryan JB, et al. *Quadriceps contusions. West Point update*. 1991.
7. Lempainen L, et al. *Management of anterior thigh injuries in soccer players: practical guide*. 2022.
8. Brukner P, Connell D. *Serious thigh muscle strains: beware the intramuscular tendon*. 2016.
9. Bogwasi L, et al. *Management of proximal rectus femoris injuries — do we know what we're doing? A systematic review*. 2023.
10. Knapik DM, et al. *Isolated, Full-Thickness Proximal Rectus Femoris Injury in Competitive Athletes: A Systematic Review*. 2023.
11. González-de-la-Flor Á, et al. *A criteria-based progressive rehabilitation program for rectus femoris strain in a recreational soccer player: a case report*. 2024.
12. Lorenz D, et al. *Criteria-Based Return to Sprinting Progression Following Lower Extremity Injury*. 2020.
13. Moo IH, et al. *Delayed presentation of compartment syndrome of the thigh secondary to quadriceps trauma and vascular injury in a soccer athlete*. 2015.
14. British Orthopaedic Association. *BOA Standard: Diagnosis and Management of Compartment Syndrome of the Extremities*. Revised July 2025.
15. Geiss Santos RC, et al. *Association Between Injury Mechanisms and Magnetic Resonance Imaging Findings in Rectus Femoris Injuries in 105 Professional Football Players*. 2022. **Registry restriction:** abstract/metadata-only; full-text line-level adjudication outstanding.
16. McAleer S, et al. *Time to return to full training and recurrence of rectus femoris injuries in elite track and field athletes 2010–2019*. 2022.
17. Pietsch S, Pizzari T. *Risk Factors for Quadriceps Muscle Strain Injuries in Sport: A Systematic Review*. 2022.
18. Pietsch S, et al. *Epidemiology of quadriceps muscle strain injuries in elite male Australian football players*. 2024.
19. Reurink G, et al. *No Association Between Fibrosis on Magnetic Resonance Imaging at Return to Play and Hamstring Reinjury Risk*. 2015.
20. Lempainen L, et al. *Chronic and Recurrent Rectus Femoris Central Tendon Ruptures in Athletes*. 2021.
