# Assessment-to-Capacity Evidence-Linking Design

**Status:** design / documentation only · pending · NON-EXECUTABLE · not clinically approved · no runtime integration.
**This task implements nothing.** It defines the conceptual bridge `RF-ASSESS evidence → CAP evidence_state / confidence_status / goal_sufficiency_status` without building it.

> Evidence-linking as described here is qualitative, metadata-driven, non-executable in this phase, and
> stores no user-specific state in object files. It is not a score, threshold, pass/fail decision,
> prescription, progression rule, readiness, RTT/RTS, or clearance.

## 1. Purpose
Define, at design level, how assessment findings will *later* inform capacity evidence — qualitatively
and under governance — so the platform can reason from evidence instead of guessing, while never turning
evidence into autonomous clearance. This document is the contract a future governed evidence-linking phase
must satisfy.

## 2. Why evidence-linking comes after Assessment Knowledge
Capacities (CAP-001…015) define *what* we care about; assessments (RF-ASSESS-001…018) define *how* we
observe it. Only with both frozen can we design *how observation updates what-we-know*. Designing the
bridge before authoring any link objects ensures the eventual implementation targets a stable, governed
model rather than ad-hoc wiring.

## 3. Current frozen inputs
- Universal CAP Batch 1: CAP-001…CAP-015 (draft metadata).
- RF-ASSESS Batch 1: RF-ASSESS-001…RF-ASSESS-018 (draft metadata).
- RF-CAP overlays: 0. Demand profiles: 0. Approved/executable objects: 0. Runtime integration: none.

## 4. Core principle
Assessment evidence may **raise or lower how well a capacity is known and how confident we are**, and may
describe **sufficiency relative to a stated goal** — always qualitatively, never as a number, threshold,
pass/fail, or clearance. Unknown is not safe. Evidence informs; governed rules (future) decide.

## 5. What evidence-linking is
A qualitative mapping concept: an RF-ASSESS finding contributes a **signal** about one or more CAP
capacities, which a future governed layer may use to update that capacity's `evidence_state`,
`confidence_status`, and (relative to a goal) `goal_sufficiency_status`. It is metadata-driven and
reviewable.

## 6. What evidence-linking is not
It is not: a runtime engine; a score/threshold/pass-fail; a prescription, dosage, or progression rule;
a readiness or RTT/RTS or clearance decision; a diagnosis or triage; or user-specific state stored inside
object files. It does not adapt plans.

## 7. Relationship to Universal CAP objects
Evidence-linking targets the universal `CAP-###` capacities (the canonical definitions). It never modifies
CAP objects; it describes how *evidence about* a capacity could change qualitatively. Demand profiles and
overlays reference the same universal capacities, keeping one shared evidence target.

## 8. Relationship to RF-ASSESS objects
Each RF-ASSESS object already names `capacities_measured_or_informed`. Evidence-linking formalizes, per
assessment, *what kind of signal* a finding contributes to those capacities (see §15). It never modifies
RF-ASSESS objects.

## 9. Relationship to future RF-CAP overlays
RF-CAP overlays (not yet authored) describe RF-specific expression of universal capacities. Evidence-
linking operates on universal capacities; an overlay may later refine interpretation, but evidence-linking
must not require RF-CAP objects to exist and must not reference them unless a future governed rule
explicitly allows it.

## 10. Relationship to RF clinical rules
RF clinical rules remain authoritative. **RF-SAF rules remain safety authority. RF-DX rules remain
diagnosis authority.** Evidence-linking provides inputs those rules may consume; it does not diagnose,
triage, or override them.

## 11. Relationship to future Demand Profiles
Demand profiles (not yet built) will require universal `CAP-###` capacities. Evidence-linking supplies the
*current* qualitative evidence; a future governed layer compares current evidence to required capacity.
`goal_sufficiency_status` is evidence about adequacy for a goal — never a demand-based clearance.

## 12. Evidence-state model (conceptual)
- `not_tested` — no assessment evidence exists yet (default).
- `estimated` — conversational/self-report evidence exists.
- `known` — stronger observed/clinician-confirmed evidence exists.
- `unknown` — evidence is conflicting, missing, or unreliable.
(Conceptual meanings only; no code, no transitions are implemented here.)

## 13. Confidence-status model (conceptual)
- `low_confidence`, `moderate_confidence`, `high_confidence`, `requires_clinician_confirmation`.
Confidence may be influenced (qualitatively, never numerically) by: self-report vs observed assessment;
consistency across assessments; next-day response; symptom irritability; red-flag/safety uncertainty; and
high-caution domains. No numeric scoring is defined or implied.

## 14. Goal-sufficiency-status model (conceptual)
- `not_applicable` (default / no goal context), `limited`, `adequate_for_current_goal`,
  `insufficient_for_goal`, `requires_clinician_confirmation`.
Crucially: **goal sufficiency is evidence, not clearance.** `adequate_for_current_goal` does **not** mean
ready for sport; `insufficient_for_goal` does **not** prescribe what to do. Both are descriptions of the
evidence relative to a stated goal, for governed rules to interpret later.

## 15. Assessment evidence signal types (conceptual labels only)
Future candidate labels (not enums yet, not implemented):
`supports_capacity`, `limits_capacity_confidence`, `requires_caution`, `requires_clinician_confirmation`,
`does_not_inform_capacity`, `safety_context_only`, `diagnostic_context_only`, `monitoring_context`.
These describe *how* a finding bears on a capacity; they carry no decision authority.

## 16. Capacity update examples (illustrative, non-executable)
Each example informs **evidence only**; it does not authorize progression, readiness, RTT/RTS, or clearance.
- **RF-ASSESS-003 walking_tolerance_check → CAP-001 walking_tolerance.** Self-report of normal walking
  could move CAP-001 toward `estimated` / `moderate_confidence`. *Informs evidence only.*
- **RF-ASSESS-004 stairs_tolerance_check → CAP-002 stairs_tolerance.** *Informs evidence only.*
- **RF-ASSESS-013 jogging_tolerance_check → CAP-003 jogging_tolerance.** *Informs evidence only.*
- **RF-ASSESS-014 running_tolerance_check → CAP-004 running_tolerance and CAP-006 acceleration_tolerance.**
  Running evidence supports CAP-004 directly and informs CAP-006. *Informs evidence only.*
- **RF-ASSESS-015 sprint_tolerance_screen → CAP-005 sprinting_tolerance and CAP-006 acceleration_tolerance.**
  High-caution (see §20). *Informs evidence only.*
- **RF-ASSESS-016 kicking_tolerance_screen → CAP-007 kicking_tolerance.** High-caution. *Informs evidence only.*
- **RF-ASSESS-017 next_day_response_check → CAP-001/002/003/004/005/006/007/010.** Monitoring evidence that
  can adjust confidence across these capacities (see §19). *Informs evidence only.*
- **RF-ASSESS-018 movement_confidence_check → CAP-015 movement_confidence.** High-caution. *Informs evidence only.*
None of the above authorizes progression, readiness, RTT/RTS, or clearance.

## 17. Handling conflicting evidence
Example: a user reports they can run, but next-day response worsens. Design principles:
- conflict **lowers confidence** (e.g. toward `unknown` / `requires_clinician_confirmation`);
- conflict **may require caution** (`requires_caution` signal);
- conflict **does not automatically progress or regress** the plan;
- **unknown is not safe.**
Resolution belongs to future governed rules, not to evidence-linking.

## 18. Handling missing evidence
When assessments are missing:
- the capacity stays at `not_tested` or `unknown`;
- missing evidence **does not imply safety**;
- missing evidence **does not by itself block all care**;
- future governed rules decide how to proceed cautiously (e.g. conservative defaults, request more
  information), never autonomous clearance.

## 19. Next-day response logic
**RF-ASSESS-017 next_day_response_check** is monitoring evidence that can affect *confidence* across
multiple capacities — CAP-001, CAP-002, CAP-003, CAP-004, CAP-005, CAP-006, CAP-007, CAP-010. A worsening
next-day response lowers confidence and may raise a caution signal. It must **not** create automatic
progression, regression, readiness, or clearance; adaptation is a future governed-rule responsibility.

## 20. High-caution assessment handling
**RF-ASSESS-015 (sprint_tolerance_screen), RF-ASSESS-016 (kicking_tolerance_screen), and
RF-ASSESS-018 (movement_confidence_check)** require future clinical review before runtime use. Their
evidence may inform capacity confidence only and must **never directly create** sprint clearance, kicking
clearance, RTS clearance, competition clearance, readiness, or progression gates. Any link involving these
must carry a future reviewer flag.

## 21. Safety and diagnostic boundaries
- **RF-ASSESS-002 red-flag screen** may inform **safety context only**.
- Diagnostic-evidence assessments (RF-ASSESS-001/007/008/009) may inform **RF-DX/RF-SAF context only**.
- **RF-SAF rules remain safety authority. RF-DX rules remain diagnosis authority.**
- Evidence-linking does not diagnose, does not triage, and does not replace clinician review.

## 22. Non-athlete and athlete applicability
Evidence-linking must work for **non-athletes, recreational athletes, elite athletes, older adults, gym
users, field-sport athletes, court-sport athletes, runners, and workers**. It must support different goals
and must **not assume return-to-sport is the goal** — `goal_sufficiency_status` is always evaluated against
the individual's stated goal (which may be walking without pain, returning to work, gym training, or sport).

## 23. Future data model options (options only — not implemented)
- `evidenceLink` objects (one per assessment→capacity relationship);
- an assessment-to-capacity mapping file (single declarative map);
- a capacity evidence accumulator (qualitative aggregation, no scores);
- a daily monitoring context (next-day response over time);
- a goal-context adapter (interprets sufficiency against the user's goal);
- clinician-review flags (gating high-caution/safety/diagnostic links).
All are **future options only**; none is selected or built here.

## 24. Future validator requirements (if evidence-link objects are later authored)
- all RF-ASSESS refs resolve to existing RF-ASSESS objects;
- all CAP refs resolve to existing universal CAP objects;
- no RF-CAP refs unless explicitly allowed by a future governed rule;
- no demand-profile refs unless the demand system exists;
- no score thresholds; no pass/fail decisions; no clearance language;
- high-caution mappings (RF-ASSESS-015/016/018) require a reviewer flag;
- safety mappings (RF-ASSESS-002) remain caution/referral only;
- diagnostic mappings defer to RF-DX/RF-SAF;
- objects remain draft/pending/not_approved/non-executable/runtime none/metadata only.

## 25. Excluded concepts
Explicitly excluded (now and from any first evidence-linking batch): readiness engine; RTS clearance
engine; competition clearance; automated triage; automated diagnosis; score thresholds; force-plate
pass/fail logic; GPS thresholds; sprint speed clearance; kicking power clearance; automatic progression/
regression; exercise prescription; dosage generation; runtime plan adaptation.

## 26. Pre-authoring audit checklist (before any evidence-link object is created)
1. CAP Batch 1 and RF-ASSESS Batch 1 frozen; all eight governance checks green.
2. Each evidence-link references existing RF-ASSESS and CAP ids only (no RF-CAP/demand unless governed).
3. Signal types are qualitative labels from §15; no scores/thresholds/pass-fail.
4. High-caution links carry a reviewer flag; no clearance/readiness/progression language.
5. Safety links are caution/referral only; diagnostic links defer to RF-DX/RF-SAF.
6. Objects are draft/pending/not_approved/non-executable/runtime none/metadata only; no user state.
7. Goal sufficiency framed as evidence, never clearance; non-athlete goals supported.
8. A future evidence-link validator (per §24) exists and passes; no schema/runtime/RF-rule change.

## 27. Recommended next task
**Author the assessment-to-capacity evidence-linking model as governed metadata** (e.g. a declarative
mapping file or `evidenceLink` objects) implementing §15–§19 qualitatively, with a matching validator
(per §24) — still non-executable, no scores, no clearance. In parallel or after: RF-CAP overlay authoring,
then the Demand Profile System scaffold, then a governed reasoning layer that compares evidence to demand
(never autonomous clearance without explicit governed rules).
