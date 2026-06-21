# Digital Assessment Confidence And Results UX Policy

**Status:** documentation-only UX policy / pending / non-executable / not clinically approved / runtime integration none.

## 1. Purpose

This policy defines how future digital assessment results and confidence language should be presented in the sports injury platform. It protects users from overinterpreting draft assessment metadata as diagnosis, readiness, progression, return-to-training, return-to-sport, or clearance authority.

The policy is written now so future product, design, and engineering work can show assessment evidence clearly without turning qualitative metadata into unsafe decisions.

## 2. Scope

This policy covers future UX treatment for:

- assessment prompts
- assessment result summaries
- evidence confidence language
- capped percentage confidence display
- capacity confidence summaries
- Results page summaries
- next-day response summaries
- digital self-report assessment results
- clinician-facing review cues
- user-facing uncertainty and limitation copy
- conservative result actions

This policy does not create UI, runtime behavior, database behavior, plan logic, assessment logic, scoring logic, progression logic, readiness logic, RTT/RTS logic, or clearance logic.

## 3. Current Knowledge-State Assumptions

The policy assumes the current governed metadata state:

| System | Current role | UX policy implication |
|---|---|---|
| RF-ASSESS objects | Draft assessment metadata | May provide prompts and evidence labels only |
| Evidence Linking Knowledge | Draft RF-ASSESS to CAP map | May explain what capacity evidence is informed |
| Capacity Knowledge | Draft universal CAP objects | May show qualitative capacity confidence only |
| RF clinical rules | Draft governance objects | Safety, diagnosis, rehab, recurrence, field, and RTS rules remain non-executable |
| Exercise / Activity Exposure Knowledge | Draft metadata | Must not be auto-selected from assessment results |

All systems remain pending, clinically not approved, non-executable, and runtime-disconnected.

## 4. Core UX Principle

Digital assessments should help a user understand what is known, unknown, uncertain, or needing review.

They must not tell the user:

- they have a diagnosis
- they passed or failed a return test
- they are ready
- they are cleared
- they can progress
- they can return to running, training, sport, sprinting, kicking, match play, or competition
- they should start a specific exercise, exposure, or plan because of one result

The safe product posture is evidence, uncertainty, and next-step guidance, not authority.

## 5. Allowed Result Language

Future result surfaces may use qualitative language such as:

- "This response adds context."
- "This may inform your capacity profile."
- "This area needs more information."
- "This result should be reviewed before higher-demand activity."
- "Your response was calmer, similar, more noticeable, or concerning."
- "Confidence in this area is low, moderate, high, or needs review."
- "The system cannot decide from this result alone."
- "If symptoms are concerning, seek appropriate clinical support."

Allowed language must remain descriptive and conservative.

## 6. Prohibited Result Language

Future result surfaces must not use language that implies:

- score authority
- threshold authority
- pass/fail return decisions
- diagnosis
- autonomous triage
- prescription
- dosage
- plan generation
- progression
- readiness
- RTT/RTS
- clearance
- sport permission
- sprint permission
- kicking permission
- match-play permission
- competition permission

Prohibited examples:

```text
You passed.
You failed.
You are ready.
You are cleared.
You can return to sport.
You can start sprinting.
You can begin kicking.
Your score allows progression.
This confirms your diagnosis.
This test unlocks the next phase.
```

## 7. Confidence Display Policy

Confidence describes how reliable or complete the evidence is. Confidence is not performance quality and not permission.

Allowed confidence labels:

- low confidence
- moderate confidence
- high confidence
- requires clinician confirmation
- unknown
- not tested
- estimated
- known

Rules:

- "High confidence" must mean confidence in the evidence summary, not clearance.
- "Low confidence" must not shame or alarm the user; it means more context is needed.
- "Requires clinician confirmation" must be a review cue, not a diagnosis or refusal.
- Confidence labels must be paired with limitation copy.

Example safe copy:

```text
Evidence confidence: low.
Meaning: there is not enough reliable information yet to judge this capacity.
Next step: answer follow-up questions or review with a clinician if symptoms are concerning.
```

## 7a. Capped Percentage Confidence Policy

A future Results page may optionally show a capped confidence percentage, but only as a UX aid for how complete and reliable the evidence appears. It must never be presented as a clinical score, diagnostic probability, capacity percentage, performance grade, threshold, pass/fail result, readiness level, progression unlock, or clearance.

Allowed use:

```text
Evidence confidence: 64% (moderate)
Meaning: the system has some useful context, but this is still not a decision.
```

Required caps:

- digital-only or self-report evidence confidence must be capped below 85%
- mixed digital plus clinician-reviewed evidence confidence must be capped below 90%
- no assessment result may display 90% or higher without a future separately governed clinician-review policy
- no assessment result may ever display 100%
- percentages must be rounded to whole numbers
- percentages must always appear with a qualitative label
- percentages must always appear with limitation copy

Required user-facing explanation:

```text
This percentage reflects confidence in the available evidence, not your recovery percentage and not clearance.
```

Prohibited interpretations:

- "85% recovered"
- "85% ready"
- "85% cleared"
- "85% chance this diagnosis is correct"
- "85% means you can progress"
- "85% means you passed"

If the evidence is safety-sensitive, diagnostic-context-only, high-caution, conflicting, missing key inputs, or requires clinician confirmation, the Results page must prefer a qualitative label over a percentage or show the capped percentage with a visible review warning.

## 8. Capacity Result Display Policy

Capacity summaries must be qualitative. They must not show numeric scores, thresholds, grades, performance percentages, pass/fail labels, or clearance badges unless a future separately governed and approved system exists. Capped percentage confidence, if used, belongs to evidence-confidence display only and must not be shown as a capacity level.

Allowed capacity state examples:

- not tested
- unknown
- estimated
- known
- limited for current goal
- adequate for current goal
- insufficient for current goal
- requires clinician confirmation

Boundary:

- "Adequate for current goal" is evidence about the stated goal, not return clearance.
- "Insufficient for current goal" is not a diagnosis and not a failure.
- "Requires clinician confirmation" must not be treated as an emergency by itself.

## 9. Assessment Result Card Pattern

A future assessment result card may contain:

```text
Assessment name
What this looked at
Your reported response
What this may inform
Evidence confidence
Limitations
Conservative next step
Review cue, if needed
```

A future card must not contain:

```text
Score
Threshold
Pass/fail
Clearance badge
Return date
Progression unlock
Exercise prescription
Activity exposure permission
Diagnosis conclusion
```

## 9a. Results Page UX Rules

A future Results page may summarize digital assessment evidence only after preserving the assessment, capacity, evidence-linking, safety, diagnostic, and clearance boundaries in this policy.

Required Results page sections:

```text
What we learned
How confident this evidence is
What is still uncertain
What this may inform
What this does not decide
Conservative next step
When to seek review
```

The first screen must show a limitation statement near the result summary:

```text
These results are evidence only. They do not diagnose, prescribe, progress, or clear you for activity.
```

The Results page may show:

- qualitative evidence confidence
- capped percentage confidence under the limits in section 7a
- capacity areas that may be informed
- uncertainty and missing information
- conservative monitoring or review prompts
- safety/referral prompt when warranted

The Results page must not show:

- "passed" or "failed" status
- green clearance badges
- return-to-sport, return-to-training, sprinting, kicking, match-play, or competition permission
- exact return dates
- phase unlocks
- automatic exercise selection
- automatic activity exposure selection
- dosage or plan changes
- diagnosis confirmation
- hidden clinical authority labels as user-facing copy

Visual hierarchy rules:

- evidence and uncertainty must be at least as visually prominent as reassuring language
- capped confidence percentages must not be the largest element on the page
- warning or review cues must not be buried below plan-card or activity content
- color must not imply clearance; green can indicate "recorded" or "no new concern reported" only with text explaining that it is not clearance
- avoid trophy, checkmark, badge, lock-open, or finish-line metaphors for assessment results

CTA rules:

- allowed CTAs: "Review your answers", "Track next-day response", "Read what this means", "Seek review", "Continue with the existing plan display"
- prohibited CTAs: "Progress now", "Unlock next phase", "Start sprinting", "Return to sport", "Clear me", "Skip review"

If evidence confidence is low, conflicting, missing, high-caution, or safety-sensitive, the primary CTA must be review, more information, monitoring, withholding, or referral rather than plan advancement.

## 10. Safe Result Examples

### Walking Tolerance Check

```text
Result summary: Your walking response adds context about walking tolerance.
May inform: walking_tolerance.
Evidence confidence: moderate.
Limitations: this does not test running, sprinting, kicking, or sport.
Conservative next step: keep monitoring your response and seek review if symptoms become concerning.
```

### Isometric Strength Capacity Check

```text
Result summary: Your response adds context about isometric strength capacity.
May inform: isometric_strength_capacity.
Evidence confidence: estimated.
Limitations: this does not measure full strength, eccentric capacity, or sport readiness.
Conservative next step: keep the result as evidence only until reviewed by a future governed system.
```

### Next-Day Response Check

```text
Result summary: Your next-day response adds context about how the thigh tolerated the previous session.
May inform: walking, running, sprinting, acceleration, kicking, and tissue-load tolerance evidence.
Evidence confidence: contextual.
Limitations: a calmer response does not automatically progress the plan.
Conservative next step: if symptoms are more noticeable or concerning, simplify and seek review.
```

### Sprint Or Kicking Tolerance Screen

```text
Result summary: This is a higher-caution result that needs future clinical review.
May inform: sprinting_tolerance or kicking_tolerance.
Evidence confidence: requires clinician confirmation.
Limitations: this is not sprint clearance, kicking clearance, RTS clearance, or competition clearance.
Conservative next step: do not use this result as permission.
```

## 11. User-Facing Uncertainty Copy

When evidence is incomplete, future UX should say so plainly:

```text
We do not have enough information yet.
This result is one piece of context.
Unknown is not treated as safe or clear.
The safest next step is to gather more information or seek review.
```

The UX must not hide uncertainty behind optimistic wording.

## 12. Clinician-Facing Review Cues

Clinician-facing surfaces may flag:

- high-caution assessment
- safety-context-only assessment
- diagnostic-context-only assessment
- low-confidence capacity summary
- conflicting evidence
- worsening response
- missing monitoring data
- activity-exposure boundary issue

These cues are review metadata only. They do not create autonomous triage, diagnosis, prescription, progression, readiness, RTT/RTS, or clearance.

## 13. Safety And Red-Flag Boundary

Red-flag and safety-context assessments may support caution/referral UX, but RF-SAF rules remain the safety authority.

Future UX may say:

```text
This response may need urgent review.
This platform cannot rule out serious issues from this assessment.
Seek appropriate medical support if symptoms are concerning.
```

Future UX must not say:

```text
You are safe.
You do not need care.
This rules out serious injury.
```

## 14. Diagnostic Boundary

Diagnostic-context assessments may explain what the response could be relevant to, but RF-DX rules remain diagnosis authority.

Future UX may say:

```text
This response may be relevant to the clinical picture.
This result does not diagnose the injury by itself.
```

Future UX must not say:

```text
This confirms RF strain.
This rules out RF injury.
This establishes your diagnosis.
```

## 15. Progression And Clearance Boundary

No digital assessment result can independently progress a user or clear a user.

Future UX must treat all assessment results as:

```text
evidence_only
not_prescription
not_dosage
not_progression
not_readiness
not_RTT_RTS
not_clearance
```

This applies even when the reported response is calmer, easier, more confident, or unchanged.

## 16. Conservative Adjustment Policy

Future UX examples may describe conservative actions, but only as governed design patterns:

| Result pattern | Allowed UX posture | Prohibited UX posture |
|---|---|---|
| Similar or calmer response | Continue observing; no automatic change | Progress automatically |
| More noticeable response | Simplify, withhold, or ask for review | Push through or increase demand |
| Concerning response | Withhold and route to safety review | Substitute another plan automatically |
| Lower confidence | Gather more information | Treat as failure |
| Missing response | Keep unknown as unknown | Assume normal |

No rule is implemented by this policy.

## 17. Logging And Data Boundary

This policy does not create logging capture or persistence.

Future logging UX must distinguish:

- user-reported response
- system interpretation
- evidence confidence
- review status
- conservative next step

It must not store or display hidden clinical authority fields unless a future governed task defines them.

## 17a. Results Page Data Boundary

This policy does not create a Results page, result storage, analytics event, database table, route, component, API, or state model.

Future Results page implementation must not infer a hidden decision from display fields. In particular:

- capped confidence percentage must not be stored as readiness
- capped confidence percentage must not be converted into progression
- capped confidence percentage must not unlock exercises or activity exposures
- qualitative capacity state must not be converted into clearance
- conservative next step text must not become executable plan logic
- review cues must not become autonomous triage decisions

Any future Results page implementation must have its own governed data contract, validator, UX audit, clinical boundary audit, and runtime-boundary check before it can be wired into the application.


## 18. Accessibility And Plain-Language Requirements

Future assessment-result UX should:

- use plain language
- explain uncertainty directly
- avoid clinical jargon in user-facing surfaces
- avoid fear-inducing language when no urgent context exists
- avoid reassurance when evidence is incomplete
- make review cues visible but not alarming
- keep internal governance labels out of user-facing copy

Internal labels such as `RF-ASSESS`, `CAP`, evidence map IDs, source IDs, approval status, and clinical approval status should not be shown to normal users.

## 19. Implementation Guardrails For Future Work

Any future implementation task must preserve:

- no diagnosis from assessment alone
- no plan generation from assessment alone
- no exercise selection from assessment alone
- no activity exposure selection from assessment alone
- no dosage from result text
- no progression from result text
- no readiness from result text
- no RTT/RTS from result text
- no clearance from result text
- no hidden conversion of confidence into permission
- no hidden conversion of goal sufficiency into clearance

Future implementation must have its own schema, validator, audit, and runtime-boundary review.

Results page implementation must additionally prove:

- capped percentage confidence is bounded and labelled as evidence confidence only
- no page state creates diagnosis, prescription, progression, readiness, RTT/RTS, or clearance
- no color, icon, badge, CTA, or ordering implies permission
- safety-sensitive and high-caution results show review or withholding posture
- no runtime connection exists unless a future governed implementation task explicitly authorizes it

## 20. Explicit Non-Changes

This policy does not modify:

- RF-ASSESS objects
- evidence-linking maps
- CAP objects
- RF-CAP overlays
- RF-EX objects
- RF-ACT objects
- RF clinical rule objects
- schemas
- templates
- validators
- package scripts
- runtime code
- UI code
- database code
- Supabase code
- RecoveryContext code
- injuryEngine code
- legacy modules

## 21. Completion Verification Requirements

This documentation task is complete only when:

- this policy document exists
- it states the confidence and result UX boundaries
- it documents capped percentage confidence rules
- it documents Results page UX rules
- it documents allowed and prohibited result language
- it documents capacity confidence display rules
- it documents safe assessment-result card patterns
- it documents conservative adjustment examples
- it documents safety, diagnosis, progression, readiness, RTT/RTS, and clearance boundaries
- all existing governance checks pass
- final scope verification is reported

## 22. Final Policy Verdict

Digital assessment results should be shown as qualitative evidence with visible confidence and limitation language. They must never be presented as diagnosis, pass/fail status, progression, readiness, RTT/RTS, clearance, or permission to perform higher-demand activity.

This document is safe to use as a future UX policy reference, but it creates no clinical approval, runtime behavior, UI behavior, database behavior, or executable logic.
