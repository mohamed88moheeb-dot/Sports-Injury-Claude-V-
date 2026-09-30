# ROYO v2: rebuild blueprint

Status: draft for review · 2026-09-30

## 0. What carries over from v1 (and nothing else)
- **The 3D anatomy viewer** (`components/anatomy3d`, `public/anatomy3d`, `scripts/anatomy3d`). It is ported as-is and wired to the new engine.
- **The idea:** a self-managed athlete opens the app and gets one clear next step today, and moves through rehab by passing tests, not by waiting out the calendar.
- **The UI logic:** one main action per screen, progress as the emotional core, authority shown through precision (exact dose, cues, gates), and calm motion. (`PRODUCT.md` principles 1–5.)
- **The ROYO brand:** name, electric logo and palette. The visual system is otherwise redesigned.

Everything else is rebuilt from zero: knowledge, engine, data model, API, screens and styling.

## 1. Product in one line
A self-managed athlete's rehab coach that is **only as confident as its evidence**. Every instruction traces back to a sourced fact, every stage change is earned by passing a test, and every outcome is logged so the system improves.

**User:** injured athletes and active people managing their own rehab without a clinician. This makes triage and red-flag handling the first safety layer.

## 2. Architecture

```
            ┌──────────────── KNOWLEDGE (offline, versioned) ────────────────┐
 sources →  │ facts/*.json  (tier T1–T5, strength, quote, link, dose, stage)  │
 harvest    │        │ compile + validate (CI)                                 │
            │        ▼                                                         │
            │ protocols/<condition>.json  (intake map, stages, exercises,     │
            │   doses, gates, tests, red flags, each field → fact ids)        │
            │        │ physio sign-off → status: draft | reviewed | live      │
            └────────┼─────────────────────────────────────────────────────────┘
                     ▼
            ┌──────────────── ENGINE (pure TypeScript, deterministic) ─────────┐
            │ triage() → classify() → stage state machine                     │
            │ planToday(state, checkIn) → session (dose auto-regulated)       │
            │ evaluateTest(results) → advance | hold | regress | refer        │
            │ 100% unit tested against scenario fixtures                       │
            └────────┬─────────────────────────────────────────────────────────┘
                     ▼
            ┌──────────────── APP (Next.js 15, Supabase, Vercel) ──────────────┐
            │ Screens: Onboard/Triage · Today · Progress · Test day · Body(3D)│
            │ AI layer: explains, coaches, answers "why"; NEVER sets dose     │
            └────────┬─────────────────────────────────────────────────────────┘
                     ▼
            ┌──────────────── OUTCOMES (T5 own data) ──────────────────────────┐
            │ check-ins, test results, adherence, RTS date, re-injury @ 2/6/12m│
            └──────────────────────────────────────────────────────────────────┘
```

### Hard rules
1. **The LLM never chooses exercises, doses or stage changes.** It rephrases and explains what the engine produced, and cites the fact IDs behind it.
2. **Any protocol field without a fact ID fails CI.**
3. **A red flag at any point, at intake or in a check-in, stops the plan and sends the athlete to a clinician.**
4. **Every number is labelled by its evidence type:** trial-backed, expert consensus, or practitioner. The UI shows which.

## 3. Knowledge model
- `Fact`: id, condition, tier (T1 research · T2 institutional protocol · T3 credentialed practitioner · T4 athlete experience · T5 own data), strength, claim, data, quote, url, applies_to, status (live | quarantined | needs_verify).
- `Protocol`: condition, version, review status, intake questions, and classification rules that route to a track (e.g. a sprint-type or stretch-type mechanism, suspected tendon involvement).
- `Stage`: goals, exercises with dose rules, a daily auto-regulation rule, and exit gates made of tests with thresholds.
- `Exercise`: id, cues, regression and progression, equipment, 3D target structures, and a video reference.
- `Test`: how to self-administer it, what to measure, the pass threshold and the fact IDs behind it.

The pipeline is harvest → verify → compile → physio review → live. It runs per condition, starting with hamstring (already harvested: `docs/knowledge/hamstring`).

## 4. Engine behaviour (per day)
1. **Check-in:** pain at rest, pain walking, pain in the session yesterday, pain the next morning, sleep, confidence, and red-flag questions.
2. **Rules:** morning pain above yesterday's + 2 → regress the dose 1 step. Pain ≤ 4/10 during strength work is fine if it settles by the morning. Running must be pain-free (hs-004, hs-010).
3. **Session:** built from the stage template. It varies by day type (strength / lengthening / running / recovery), so no two sessions are identical.
4. **Test day:** every 3–5 days, or when the athlete asks. The result is advance, hold, regress, or refer.
5. **Timeline:** a range recalculated from the track and gate history, never a single promised date.

## 5. Data model (Supabase)
`profiles` · `injuries` (condition, side, mechanism, track, started_at) · `check_ins` · `sessions` (planned JSON + completed sets) · `test_results` · `stage_events` (advance / hold / regress / refer, with a reason) · `outcomes` (RTS date, re-injury follow-ups). Row-level security on every table, one owner per row.

## 6. Screens (mobile first)
1. **Onboard + triage:** 60 seconds covering body map (3D) → mechanism → red flags → baseline tests. Ends with a triage outcome.
2. **Today:** one card with a start-session action, the reason behind today's session, and the gate ahead.
3. **Session player:** exercise by exercise with cues, a timer, logging of each set, and a pain slider.
4. **Progress:** a stage track with gate checklists, test trends and the timeline range.
5. **Test day:** a guided self-test flow.
6. **Body:** the 3D viewer focused on the injured structure; tap an exercise to see the muscle it loads.
7. **Ask:** the AI coach, grounded in the athlete's state and the facts behind it.

The visual system is redesigned in its own pass, after the engine proves out.

## 7. Milestones
- **M1: Hamstring engine.** Protocol JSON compiled from facts, the pure engine, scenario tests (sprint-type, stretch-type, tendon, red flag, flare-up), and CLI output of a 4-week simulated course.
- **M2: v2 app shell.** Next.js 15 in `/v2`, a new Supabase schema, onboarding and triage, Today, the session player, and check-ins.
- **M3: Tests and progress.** Test day, gates, the progress screen, and 3D integration.
- **M4: Visual redesign pass.** The new design system across all screens.
- **M5: Second condition.** Ankle sprain harvest → protocol → live.
- **M6: Outcomes loop.** Follow-ups at 2/6/12 months and a dashboard of our own outcome data.

## 8. Needs from the founder
- A licensed physio to review each protocol before it goes live. This is non-negotiable for a self-managed medical product.
- A manual athlete-voice (T4) research pass on sites this environment can't reach, such as podcasts and Reddit.
