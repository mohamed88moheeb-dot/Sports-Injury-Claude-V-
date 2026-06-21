# RF Beta Engine (`lib/clinical/rfBetaEngine`)

**Beta-only, non-executable-for-production engine** that turns RF assessment answers into a complete structured beta output, ready for the *next* task to wire into the app journey. It is a pure data/logic layer: **no UI, no runtime wiring, no Supabase, no clearance authority.**

## Why `.mjs` not `.ts`
The repo has no TypeScript toolchain. The test script and the quarantine-boundary check both run plain ESM with `node`, so the engine is authored as runnable `.mjs` modules with JSDoc "types" in `types.mjs`. It **reads** governed knowledge (rule pack, RF-EX, RF-ACT) from disk via `fs` and imports **no** legacy module — so `check:rf-boundary` stays clean and no knowledge object is mutated.

## Architecture separation (critical)
```
RF-EX objects            = exercise identity / purpose / metadata        (never holds dosage)
RF prescription rule pack = evidence-backed structure + gap markers       (dosage = gap)
RF beta defaults          = temporary beta session-prescription numbers    (labelled beta_default)
RF beta engine            = composes assessment result + full plan output
```
Every beta number carries `default_status: beta_default`, `evidence_status: beta_default_not_evidence_graded`, `clinical_review_status: requires_clinician_review`, `runtime_scope: rf_beta_testing_only`.

## Entry point
```js
import { runRfBeta, applyDailyCheckIn } from './lib/clinical/rfBetaEngine/index.mjs';
const out = runRfBeta(assessmentAnswers);
// out.likely_injury_pattern, out.confidence, out.severity, out.recovery, out.plan, out.governance_trace
const adjusted = applyDailyCheckIn(out.plan.phases[0].days[0].session, { symptom_response: 'more_noticeable' });
```

## Output shape (top level)
`engine`, `beta_scope`, `clinical_authority: false`, `input`, `missing_core_fields`, `likely_injury_pattern`, `confidence`, `severity`, `recovery`, `plan`, `daily_check_in_contract`, `governance_trace`.

- **confidence** — match quality only; self-report capped at 82% normal / strictly < 85% absolute; red flags / severe signals → `withheld: true, route: 'review'`.
- **severity** — functional band from answers, independent of confidence; cautious wording (suggests, never confirms a grade).
- **recovery** — qualitative mandated wording + modifiers; numbers are `beta_recovery_display_default` only.
- **plan** — six phases (Foundation→Resilience) with friendly names, beta day counts, sessions of beta cards; high-caution/manual-review items appear only in `withheld_items`; activity exposures mapped separately, all `clearance_authority: false`.
- **daily check-in** — `applyDailyCheckIn` adjusts today's session copy only (`selected_session_only: true`, `future_days_changed: false`), never mutating the plan.
- **governance_trace** — inputs/rules used, selected vs withheld objects, gap markers, `clinical_authority_created: false`.

## Modules
`types.mjs` · `rfAssessmentInput.mjs` · `rfConfidenceResolver.mjs` · `rfSeverityResolver.mjs` · `rfRecoveryResolver.mjs` · `rfBetaPrescriptionDefaults.mjs` · `rfKnowledgeLoader.mjs` · `rfAlternativeMapper.mjs` · `rfSessionGenerator.mjs` · `rfPlanGenerator.mjs` · `rfDailyCheckInAdjuster.mjs` · `rfGovernanceTrace.mjs` · `index.mjs`.

## Test
`node scripts/test-rf-beta-engine.mjs` (or `npm run test:rf-beta-engine`). Covers moderate / mild / high-concern / conflicting-missing cases + yellow & red daily check-ins, asserting the governance invariants.

## What this is NOT
Not clinical approval, not production authority, not a UI, not wired to runtime. Beta defaults are clearly labelled and must be replaced by separately governed, evidence-graded, clinician-reviewed dosage before any production use.
