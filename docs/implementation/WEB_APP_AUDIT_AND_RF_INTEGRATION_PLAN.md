# Web App Audit & Rectus Femoris Integration Plan

> **Scope of this document.** Read-only audit of the current codebase, performed without
> editing code, changing Supabase, creating migrations, or implementing clinical logic.
> It ends with a recommended plan for a Rectus Femoris (RF) vertical slice. No code was
> changed to produce it.
>
> Audit date: 2026-06-15. Branch: `main`.

---

## 1. Current technology stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14.2.15** (App Router) | All pages are `'use client'`; no server components, route handlers, or server actions in use. |
| UI runtime | **React 18.3.1 / react-dom 18.3.1** | `reactStrictMode: true` in [next.config.mjs](next.config.mjs). |
| Animation | **framer-motion ^12.40.0** | Used in nav, brand, generating-plan animations. |
| Backend / auth | **@supabase/supabase-js 2.45.4** | Single table; email/password auth. |
| Styling | Global CSS only — [app/globals.css](app/globals.css) | No Tailwind, CSS modules, or styled-components. Heavy inline `style={{…}}` usage. |
| Language | **JavaScript (JSX)** | No TypeScript anywhere; no `tsconfig`, no `.ts`/`.tsx`. |
| State | React Context + `useState` | One global provider, see §4 / §11. |
| Persistence | Supabase `recovery_profiles` table **or** `localStorage` fallback | Chosen at runtime by `hasSupabase`. |
| Node | `20.x` (engines field) | |
| Tooling | **None**: no ESLint config, no Prettier, no test runner, no CI | `package.json` has only `dev`/`build`/`start`. |

There is **no AI/LLM integration** despite "AI-powered / AI-assessed" product copy. Every
"AI" surface (diagnosis confidence, coach chat, "generating plan") is rule-based or
cosmetic. See §5 and §9.

---

## 2. Current route map

App Router pages under [app/](app):

| Route | File | Purpose |
|---|---|---|
| `/` | [app/page.jsx](app/page.jsx) | Landing/hero + auth card (sign in/up when signed out). |
| `/anatomy` | [app/anatomy/page.jsx](app/anatomy/page.jsx) | Interactive body map — picks `primaryRegion` + `exactArea`. |
| `/assessment` | [app/assessment/page.jsx](app/assessment/page.jsx) | 4-step intake wizard; triggers plan generation. |
| `/diagnosis` | [app/diagnosis/page.jsx](app/diagnosis/page.jsx) | "Likely diagnosis" display (cosmetic confidence). |
| `/plan` | [app/plan/page.jsx](app/plan/page.jsx) | Phase → week → day plan overview. |
| `/plan/week/[p]/[w]` | [app/plan/week/[p]/[w]/page.jsx](app/plan/week/%5Bp%5D/%5Bw%5D/page.jsx) | Week detail. |
| `/plan/day/[p]/[w]/[d]` | [app/plan/day/[p]/[w]/[d]/page.jsx](app/plan/day/%5Bp%5D/%5Bw%5D/%5Bd%5D/page.jsx) | Day/session detail with exercises, complete toggle. |
| `/dashboard` | [app/dashboard/page.jsx](app/dashboard/page.jsx) | Current injury, return range, progress, today's session. |
| `/check-in` | [app/check-in/page.jsx](app/check-in/page.jsx) | Daily check-in (pain/confidence/swelling/response). |
| `/coach` | [app/coach/page.jsx](app/coach/page.jsx) | Rule-based "coach" chat. |
| `/profile` | [app/profile/page.jsx](app/profile/page.jsx) | Account, current injury, check-in history, sign out. |

Navigation chrome lives in [components/layout/AppNav.jsx](components/layout/AppNav.jsx)
(desktop sliding pill + mobile bottom nav). **There is no route protection / middleware** —
every route is reachable directly regardless of auth state (see §9).

---

## 3. Current user journey

1. **Land** on `/` → hero + auth card. Sign up/in (or proceed unauthenticated with
   localStorage persistence).
2. **Anatomy** (`/anatomy`) → tap a body region on the SVG, then optionally a sub-muscle.
   Sets `primaryRegion` and `exactArea` in context.
3. **Assessment** (`/assessment`) → 4 steps: *Injury profile → Sport & demands →
   Pain & context → Red flags*. On submit, `generateProfile()` runs.
4. **Generation** → a **hard-coded 7-second `setTimeout`** ([RecoveryContext.jsx:223](app/providers/RecoveryContext.jsx#L223))
   shows the "generating plan" animation, then `buildProfile()` runs synchronously and the
   user is routed to `/dashboard`.
5. **Dashboard / Plan** → review phases/weeks/days; open a day; mark days complete.
6. **Check-in** (`/check-in`) → log daily status; updates a textual `aiStatus` message.
7. **Coach** (`/coach`) → free-text; keyword-matched canned responses.
8. **Profile** → review/sign out.

Region change after a plan exists triggers `resetProfile()` to avoid stale plan data
([app/anatomy/page.jsx](app/anatomy/page.jsx), [RecoveryContext.jsx:267](app/providers/RecoveryContext.jsx#L267)).

---

## 4. Authentication and database structure

**Auth** ([lib/supabaseClient.js](lib/supabaseClient.js), [RecoveryContext.jsx](app/providers/RecoveryContext.jsx)):
- Supabase email/password via `signInWithPassword` / `signUp`.
- `hasSupabase` is a runtime guard: if env vars are missing/invalid the whole app silently
  falls back to **localStorage-only** mode (key `injury-recovery-local-profile`, plus an
  assessment draft under `injuryguide_assessment_draft`).
- Auth state tracked with `onAuthStateChange`; user stored in context.
- No password reset, email-change, OAuth, or session-refresh handling beyond the SDK default.

**Database** ([supabase.sql](supabase.sql)):
- Single table `public.recovery_profiles`:
  - `id uuid PK`, `user_id uuid UNIQUE → auth.users(id) ON DELETE CASCADE`,
    `profile_data jsonb`, `updated_at timestamptz`.
- **RLS enabled** with correct per-user select/insert/update policies keyed on `auth.uid()`.
- `set_updated_at` trigger maintains `updated_at`.
- **The entire app state is a single JSONB blob** (`{ profile, checkins, assessment, updatedAt }`)
  upserted on `user_id` conflict. No relational structure for plans, exercises, or check-ins.
- **No generated DB types**, no `migrations/` directory — just the one `supabase.sql` to paste
  into the SQL editor. No schema versioning.

---

## 5. Existing diagnosis and rehabilitation behavior

This is the most important architectural finding. **There are two parallel systems, and the
"clinical" one is almost entirely unwired.**

### 5a. What actually runs (the live path)
Clinical logic lives **inside the React provider** [app/providers/RecoveryContext.jsx](app/providers/RecoveryContext.jsx):
- `deriveGrade(a)` — heuristic grade from pain/red-flags/symptom strings ([L317](app/providers/RecoveryContext.jsx#L317)).
- `resolveInjuryTitle(a, regionName)` — regex/keyword mapping to a subtype name ([L339](app/providers/RecoveryContext.jsx#L339)).
- `buildProfile` / `buildPlan` / `buildWeek` / `buildTrainingDay` — assemble phases→weeks→days.
- `applyGradeAndContextAdjustments`, `adjustExercise`, `targetExerciseCount` — load/intensity tuning.
- `coachResponse`, `getStatusMessage` — coach + check-in messaging.
- Exercise content for most regions comes from the **legacy** [data/rehabKnowledge.js](data/rehabKnowledge.js)
  (`exerciseBank`, inline `ex(...)` add-on generators).

The `/diagnosis` page does **not** compute a diagnosis. It derives a fake confidence from the
grade *name* via `inferConfidence()` ([app/diagnosis/page.jsx:9](app/diagnosis/page.jsx#L9)) and
displays `profile.regionName` / `gradeName` / `mechanism`.

### 5b. What exists but is NOT wired in (the "real" engine)
A well-documented rule engine under [lib/injuryEngine/](lib/injuryEngine) reads structured
knowledge from [data/injuryKnowledge/](data/injuryKnowledge):
- `diagnosisEngine.diagnoseInjury()` — combines scoring + safety, returns ranked patterns,
  confidence (capped 96%), reasoning, risk, referral, disclaimer. **No caller anywhere.**
- `scoringEngine.scoreSubtypes()` — declarative condition scoring per subtype. **Only called by `diagnosisEngine`.**
- `safetyEngine.checkSafety()` — global + region + question red flags. **Only called by the unwired engines.**
- `rehabPlanGenerator.generateRehabPlan()` — criteria-based phased plan. **No caller.**
- `adaptationEngine.adaptPlanFromCheckin()` — green/yellow/red check-in adaptation. **No caller.**

**The only bridge that is wired** is `planAdapter.getAdaptedSession()` →
`sessionScheduler.buildSession()`, called by `RecoveryContext.buildTrainingDay`
([RecoveryContext.jsx:569](app/providers/RecoveryContext.jsx#L569)) for the three
"expanded" regions only: `hamstring`, `quadriceps`, `adductor_groin`
([planAdapter.js `SUPPORTED_REGIONS`](lib/injuryEngine/planAdapter.js#L33)). All other regions
fall back to the legacy `exerciseBank`.

**Net effect:** diagnosis, safety/red-flag handling, structured plan generation, and check-in
adaptation that were *built* in `lib/injuryEngine` are dead/unintegrated. The user-visible
behavior is driven by the cruder logic in `RecoveryContext.jsx`.

---

## 6. Existing exercise-library behavior

Two libraries exist:
- **Legacy** — [data/rehabKnowledge.js](data/rehabKnowledge.js): `exerciseBank` keyed by region
  and phase, plus inline `ex()`-generated add-ons in the provider. Flat exercise shape
  (`name, prescription, equipment, intensity, cue, video, alternative`).
- **Structured** — [data/injuryKnowledge/](data/injuryKnowledge): per-region files
  (`hamstring` 1553 lines, `adductorGroin` 1270, `quadriceps` 1217, `calfAchillesShin`,
  `ankle`, `knee`) sharing factory helpers from [shared.js](data/injuryKnowledge/shared.js)
  (`makeQuestion`, `makeSelfTest`, `makeExercise`, `makePhase`, `makeProtocol`,
  `SESSION_BLUEPRINTS`, `PHASE_PERIODIZATION`, `GLOBAL_RED_FLAGS`, `CONFIDENCE_BANDS`,
  `DISCLAIMER`). Each file carries `injurySubtypes`, `detailedAreas`, `assessmentQuestions`,
  `selfTests`, `diagnosisRules`, `rehabProtocols`, `exerciseLibrary`, `redFlags`.

`planAdapter.adaptExercise()` translates structured exercises into the legacy card shape and
adds enrichment fields (`blockLabel`, `purpose`, `painRule`, `commonMistakes`, `avoidIf`,
`progressionRule`) that the day view renders when present. Equipment is resolved via a token
map with always-available fallbacks.

**RF relevance:** `quadriceps.js` already defines `rectus_femoris_strain` and
`hip_flexor_rectus_femoris_overlap` subtypes, `front_rectus_femoris` / `rectus_femoris`
detailed areas, quad assessment questions, self-tests, and `acute_quad_strain` /
`tendon` / `contusion` / `nerve_referral` / `severe_risk` protocols. The legacy
`muscleComponents.quadriceps` also lists `rectus_femoris`. This is the strongest foundation
for a vertical slice.

---

## 7. Reusable components

**UI primitives** ([components/ui/](components/ui)): `GlassCard` (+ `AIBadge`), `GlassSelect`,
`MultiSelectDropdown`, `Slider`, `CircularProgress`, `Metric`, `ConfidenceMeter`, `Chevron`,
`Field`, `ScannerPanel`.

**Layout** ([components/layout/](components/layout)): `PageShell`, `AppNav`, `AuthCard`,
`GeneratingPlan`.

**Sections** ([components/sections/](components/sections)): `HomeSummary`, `DashboardContent`,
`AssessmentContent` (4-step wizard), `PlanContent`, `CheckInContent`, `CoachContent`.

**Brand** ([components/brand/](components/brand)): `TendonBackground`, `AnimatedTendonLogo`.

**Anatomy** ([components/InteractiveAnatomy.jsx](components/InteractiveAnatomy.jsx)): the live
body-map selector with `BROAD_REGION_MAP` / `DETAIL_REGION_MAP`, SVG click handling, and pill
dropdowns.

All of the above are reusable for the RF slice as-is. The engine modules in
`lib/injuryEngine/*` and the structured `data/injuryKnowledge/*` are reusable libraries even
though they are currently unwired.

---

## 8. Technical debt

- **Two competing clinical systems** (§5). The robust one is unwired; the live one is the
  weaker one embedded in a React provider.
- **Clinical logic inside a UI component** — `RecoveryContext.jsx` (865 lines) mixes auth,
  persistence, grading, diagnosis-title resolution, plan building, and coaching. Not unit-testable.
- **Two exercise libraries** (`rehabKnowledge.js` vs `injuryKnowledge/*`) with different shapes
  and an adapter bridging only 3 regions.
- **Dead / orphaned code:**
  - [components/AnatomySelector_old.jsx](components/AnatomySelector_old.jsx) (690 lines) — not imported anywhere.
  - [components/HumanFrontIcon.jsx](components/HumanFrontIcon.jsx) — not imported anywhere.
  - `lib/injuryEngine/{diagnosisEngine,scoringEngine,safetyEngine,rehabPlanGenerator,adaptationEngine}.js` — no live callers.
- **Hard-coded 7s `setTimeout`** simulating plan generation ([RecoveryContext.jsx:223](app/providers/RecoveryContext.jsx#L223)).
- **`Date.now()` used as entity id** for profiles/check-ins.
- **Whole-state JSONB blob** — no relational model, no history, no concurrency control (last write wins).
- **Pervasive inline styles** rather than CSS classes/tokens; heavy duplication.
- **No TypeScript**, so the rich structured data shapes are untyped and unchecked.
- **`signOut` does `setUser(null)` manually** in addition to the SDK; redundant with the auth listener.
- Region naming drift handled by a migration map (`REGION_NAME_MAP`) — symptom of earlier churn.

---

## 9. Security and safety risks

**Security**
- **No route/auth protection.** All pages are client components with no middleware; `/dashboard`,
  `/plan`, etc. render for anyone. (RLS still protects remote data, but unauthenticated users
  silently get a localStorage profile.)
- **Anon-key-only client.** Correct for Supabase, and RLS policies are properly scoped — this is
  fine *provided* env vars only ever hold the publishable anon key (README warns about this).
- **Silent offline fallback.** If env vars are missing, the app stores health data in
  `localStorage` with no encryption and no user signal that nothing is being saved to an account.
- No input validation/sanitization on assessment free-text (`story`) before persistence; low risk
  given JSONB storage and no server rendering of it, but unbounded.
- No rate limiting / captcha on auth (delegated to Supabase defaults).

**Clinical safety**
- The **safety/red-flag engine (`safetyEngine`) is not wired into the live flow.** Red-flag
  handling in production is the coarse `deriveGrade` + `isHighRisk` heuristic and string copy in
  `RecoveryContext.jsx`. The carefully designed `GLOBAL_RED_FLAGS` and per-region red flags in
  `data/injuryKnowledge` are not consulted by the running app.
- The `DISCLAIMER` constant exists but is surfaced only through the unwired `diagnoseInjury`
  path; the live `/diagnosis` page shows "Likely diagnosis" framing with a fabricated confidence
  meter and **no disclaimer**.
- "AI Analysis" / "AI-powered" labels with no AI behind them — a trust/claims risk for a health product.

---

## 10. Missing tests

There are **no tests of any kind** — no test runner, no `*.test.*`/`*.spec.*` files, no CI.
The pure, testable logic that most needs coverage:
- `lib/injuryEngine/scoringEngine` (condition matching, normalization, ranking).
- `lib/injuryEngine/safetyEngine` (global/region/question flag triggering, severity rollup).
- `lib/injuryEngine/diagnosisEngine` (risk escalation, referral override, empty-region fallback).
- `lib/injuryEngine/adaptationEngine` (green/yellow/red transitions).
- `lib/injuryEngine/{rehabPlanGenerator,sessionScheduler,planAdapter}` (phase fallback, equipment
  resolution, session assembly/rotation).
- `RecoveryContext` pure helpers (`deriveGrade`, `calculateProgress`, `findToday`,
  `resolveInjuryTitle`) — ideally after extraction out of the provider.

---

## 11. What can be reused for the Rectus Femoris vertical slice

- **Structured quad knowledge** — `data/injuryKnowledge/quadriceps.js` already models RF
  (subtypes `rectus_femoris_strain`, `hip_flexor_rectus_femoris_overlap`; areas
  `front_rectus_femoris`, `rectus_femoris`; quad questions, self-tests; `acute_quad_strain`
  protocol; `exerciseLibrary`). This is the spine of the slice.
- **The engine modules** (`scoringEngine`, `safetyEngine`, `diagnosisEngine`,
  `rehabPlanGenerator`, `sessionScheduler`, `adaptationEngine`, `planAdapter`) already exist and
  are designed for exactly this — they just need to be wired in.
- **`planAdapter.getAdaptedSession`** already supports `quadriceps` and is already called by the
  provider, so RF sessions already flow through the structured engine for exercise content.
- **Anatomy selector** — `InteractiveAnatomy` can already select the quad region and a
  front-thigh sub-area.
- **UI**: `ConfidenceMeter`, `GlassCard`/`AIBadge`, `AssessmentContent` wizard, `PlanContent`,
  day view, `CheckInContent`, `DashboardContent`, `PageShell`, `AppNav` — all reusable.
- **Supabase persistence + RLS** — reusable as-is for storing the slice's profile/check-ins.

---

## 12. What must be rebuilt (or wired) for a clinically-honest RF slice

- **Wire the diagnosis path**: replace `/diagnosis`'s `inferConfidence` with
  `diagnoseInjury(assessment)` output (primary pattern, alternatives, reasoning, risk,
  referral, **disclaimer**). Requires mapping the current `assessment` shape (string symptoms,
  pain sliders) to the engine's expected shape (`answers`, `selfTests`, `globalFlags`).
- **Wire the safety engine** so red flags actually gate the live plan/diagnosis, not just the
  `isHighRisk` heuristic.
- **Decide on one plan generator.** Either (a) route plan building through
  `generateRehabPlan(diagnosis, assessment)` for RF, or (b) keep `buildPlan` but document it as
  the only path. Today it's a confusing hybrid.
- **Wire check-in adaptation** to `adaptPlanFromCheckin` instead of the inline `getStatusMessage`.
- **Extract clinical logic out of `RecoveryContext.jsx`** into `lib/` so it is testable and the
  provider only does state/auth/persistence.
- **Bridge the assessment data model** — the intake wizard currently produces flat fields; the
  engines expect `answers`/`selfTests` keyed by the quad question/test ids. A mapping layer (or
  an updated intake step) is needed.
- **Honest "AI" framing + disclaimer** on diagnosis/coach surfaces.

(Per task constraints, none of this is implemented here — this is the gap analysis only.)

---

## 13. Recommended implementation phases

1. **Foundations (no behavior change):** add a test runner; write characterization tests for the
   live `RecoveryContext` helpers and the unwired engine modules; add ESLint. Remove confirmed
   dead files (`AnatomySelector_old.jsx`, `HumanFrontIcon.jsx`) in a separate cleanup PR.
2. **Assessment→engine adapter:** build a pure mapper from the current `assessment` object to the
   engine's `{ answers, selfTests, globalFlags }` shape, scoped to `quadriceps`/RF. Unit-test it.
3. **Wire diagnosis (RF only):** feed the mapped assessment into `diagnoseInjury`; render real
   pattern/confidence/reasoning/referral + `DISCLAIMER` on `/diagnosis`, behind a region check so
   other regions keep current behavior.
4. **Wire safety gating (RF):** surface `checkSafety` red flags in intake and let urgent flags
   force the referral framing and conservative plan.
5. **Unify plan generation (RF):** route RF plan building through `generateRehabPlan` (it already
   uses the quad protocols/library), keeping legacy `buildPlan` for unmigrated regions.
6. **Wire check-in adaptation (RF):** replace inline status messaging with `adaptPlanFromCheckin`.
7. **Extract & generalize:** move RF-proven wiring out of the provider into `lib/`, then template
   it for the next region.
8. **Persistence/typing hardening (optional):** consider TypeScript and/or a more relational
   schema once the slice is proven.

---

## 14. Files likely to change (for the RF slice)

- [app/providers/RecoveryContext.jsx](app/providers/RecoveryContext.jsx) — call the engine for RF;
  thin out clinical logic.
- [app/diagnosis/page.jsx](app/diagnosis/page.jsx) — consume `diagnoseInjury` output + disclaimer.
- [app/assessment/page.jsx](app/assessment/page.jsx) / [components/sections/AssessmentContent.jsx](components/sections/AssessmentContent.jsx)
  — capture the quad `answers`/`selfTests` the engine needs.
- [app/check-in/page.jsx](app/check-in/page.jsx) / [components/sections/CheckInContent.jsx](components/sections/CheckInContent.jsx)
  — feed `adaptPlanFromCheckin`.
- **New** `lib/injuryEngine/assessmentAdapter.js` (assessment → engine shape) and a small
  `lib/clinical/` home for logic extracted from the provider.
- [lib/injuryEngine/planAdapter.js](lib/injuryEngine/planAdapter.js) — minor, if plan generation is unified.
- [data/injuryKnowledge/quadriceps.js](data/injuryKnowledge/quadriceps.js) — only if RF rules/content need tuning.
- **New** test files alongside `lib/injuryEngine/*`.
- No Supabase/migration changes required for the slice (state stays in the existing JSONB blob).

---

## 15. Recommended first coding task

**Write a pure `assessment → engine` adapter for the quadriceps/RF region, with unit tests, and
no UI changes.**

Why first: it is the single missing piece blocking *every* other wiring step (diagnosis, safety,
plan, adaptation all consume the engine's `{ answers, selfTests, globalFlags }` shape, which the
current intake does not produce). It is pure, fully testable without Supabase or the browser, and
introduces zero user-facing risk. It also forces an explicit, reviewable mapping between the
intake vocabulary and the clinical model — the exact seam where errors would otherwise hide.

Deliverable: `lib/injuryEngine/assessmentAdapter.js` exporting `toEngineAssessment(assessment)`,
plus a test file proving that representative RF intakes produce a `diagnoseInjury` result with the
expected top pattern (`rectus_femoris_strain`) and that an urgent red-flag answer triggers the
referral override via `checkSafety`.

---

*End of report. No application code was modified.*
