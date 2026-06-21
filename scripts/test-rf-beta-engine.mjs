#!/usr/bin/env node
/**
 * scripts/test-rf-beta-engine.mjs
 * ---------------------------------------------------------------------------
 * Behavioural test for the RF Beta Engine. No test framework (no new packages):
 * a tiny assert harness. Runs 6 cases and validates the governance invariants.
 * ---------------------------------------------------------------------------
 */

import { runRfBeta, applyDailyCheckIn } from '../lib/clinical/rfBetaEngine/index.mjs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + msg); } };
const section = (t) => console.log('\n== ' + t + ' ==');

const HIGH_CAUTION_SAMPLE = ['RF-EX-013', 'RF-EX-051', 'RF-EX-059', 'RF-EX-100', 'RF-EX-107'];

function selectedIds(out) {
  const ids = [];
  for (const ph of out.plan.phases) for (const d of ph.days) for (const c of d.session.cards) ids.push(c.exercise_id);
  return ids;
}
function firstActiveSession(out) {
  for (const ph of out.plan.phases) if (ph.days.length) return ph.days[0].session;
  return null;
}

/* -------------------------------------------------------------------------
 * Case 1 — Clean moderate RF pattern
 * ------------------------------------------------------------------------- */
section('Case 1: clean moderate RF pattern');
const c1 = runRfBeta({
  pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', sport_context: 'football',
  ability_to_continue: 'limited', walking_response: 'mild', stairs_response: 'painful',
  hip_flexion_response: 'painful', knee_extension_response: 'painful', pain_severity_label: 'moderate',
  bruising_or_swelling: 'some', weakness_or_giving_way: 'mild', red_flag_answers: {},
  previous_injury: false, reported_fibrosis_or_scar_history: 'none', equipment_available: ['bodyweight', 'band'],
  training_goal: 'return_to_football', confidence_in_answers: 'confident'
});
ok(c1.confidence.confidence_percent !== null && c1.confidence.confidence_percent < 85, 'confidence capped below 85');
ok(c1.confidence.confidence_percent <= 82, 'confidence within self-report normal cap (<=82)');
ok(c1.severity.functional_severity_band === 'moderate_functional_impact', 'severity band = moderate');
ok(!('confidence_percent' in c1.severity), 'severity is independent of confidence (no confidence field)');
ok(c1.plan.full_autonomous_plan === true, 'full plan generated for eligible case');
ok(c1.plan.phases.length === 6, 'plan has six phases');
const c1Session = firstActiveSession(c1);
ok(!!c1Session && c1Session.cards.length > 0, 'plan has at least one active session with cards');
ok(c1Session.cards.every((c) => c.default_status === 'beta_default'), 'session cards carry beta_default');
ok(c1Session.cards.every((c) => c.evidence_status === 'beta_default_not_evidence_graded'), 'cards marked not evidence graded');
ok(c1Session.cards.some((c) => c.sets && c.reps_or_hold), 'cards carry beta dosage defaults (sets/reps)');
ok(!c1.recovery.user_facing_wording.toLowerCase().match(/guarantee|cleared|return to sport|will return in/), 'recovery wording is not a guarantee/clearance');
ok(selectedIds(c1).every((id) => !HIGH_CAUTION_SAMPLE.includes(id)), 'no high-caution object auto-selected');
ok(c1.plan.withheld_summary.length > 0, 'high-caution/manual-review items are withheld');
ok(c1.governance_trace.clinical_authority_created === false, 'governance: clinical_authority_created false');
const c1Act = c1.plan.phases.flatMap((p) => p.activity_exposures);
ok(c1Act.length > 0 && c1Act.every((a) => a.clearance_authority === false), 'activity exposures grant no clearance');
ok(c1Act.every((a) => a.statement.includes('does not clear')), 'activity exposure statement present');

/* -------------------------------------------------------------------------
 * Case 2 — Mild / lower-functional-impact RF pattern
 * ------------------------------------------------------------------------- */
section('Case 2: mild / lower-functional-impact');
const c2 = runRfBeta({
  pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'gradual_overuse', sport_context: 'running',
  ability_to_continue: 'yes', walking_response: 'mild', stairs_response: 'none',
  hip_flexion_response: 'mild', knee_extension_response: 'none', pain_severity_label: 'mild',
  bruising_or_swelling: 'none', weakness_or_giving_way: 'none', red_flag_answers: {},
  previous_injury: false, equipment_available: ['bodyweight'], training_goal: 'general_return', confidence_in_answers: 'confident'
});
ok(c2.severity.functional_severity_band === 'lower_functional_impact', 'severity band = lower');
ok(c2.plan.full_autonomous_plan === true, 'mild case gets a (shorter) full plan');
ok(c2.plan.plan_template === 'short', 'mild case uses short beta template');
ok(c2.confidence.confidence_percent < 85, 'confidence < 85');

/* -------------------------------------------------------------------------
 * Case 3 — Red-flag / high-concern pattern
 * ------------------------------------------------------------------------- */
section('Case 3: red-flag / high-concern');
const c3 = runRfBeta({
  pain_location: 'front_thigh_general', mechanism: 'direct_impact', ability_to_continue: 'no',
  walking_response: 'unable', stairs_response: 'unable', hip_flexion_response: 'painful',
  knee_extension_response: 'unable', pain_severity_label: 'severe', bruising_or_swelling: 'significant',
  weakness_or_giving_way: 'marked', red_flag_answers: { sudden_loss_of_function: true },
  previous_injury: true, equipment_available: ['bodyweight'], confidence_in_answers: 'somewhat'
});
ok(c3.confidence.withheld === true && c3.confidence.route === 'review', 'red flag withholds confidence and routes to review');
ok(c3.confidence.confidence_percent === null, 'no confidence percentage shown on red flag');
ok(c3.severity.functional_severity_band === 'high_concern_or_review_gated', 'severity = high concern');
ok(c3.severity.review_required === true, 'severity requires review');
ok(c3.plan.full_autonomous_plan === false && c3.plan.review_gated === true, 'no full autonomous plan; review-gated');
ok(selectedIds(c3).every((id) => !HIGH_CAUTION_SAMPLE.includes(id)), 'high-concern: no high-caution auto-selected');
ok(c3.governance_trace.clinical_authority_created === false, 'governance: no clinical authority');

/* -------------------------------------------------------------------------
 * Case 4 — Conflicting / missing-data pattern
 * ------------------------------------------------------------------------- */
section('Case 4: conflicting / missing data');
const c4 = runRfBeta({
  pain_location: 'multiple_or_unsure', mechanism: 'unsure', confidence_in_answers: 'unsure'
  // most core fields intentionally missing
});
ok(c4.confidence.confidence_percent < 85, 'confidence < 85');
ok(c4.confidence.confidence_percent <= 68, 'conflicting/missing data caps confidence low (<=68)');
ok(c4.missing_core_fields.length >= 3, 'missing core fields detected');
ok(c4.confidence.rules_applied.some((r) => r.includes('missing_data') || r.includes('conflicting') || r.includes('uncertain')), 'missing/conflicting caps applied');

/* -------------------------------------------------------------------------
 * Case 5 — Daily check-in YELLOW (today only)
 * ------------------------------------------------------------------------- */
section('Case 5: daily check-in yellow');
const planDayC1 = c1.plan.phases.find((p) => p.days.length).days[0];
const before = JSON.stringify(c1.plan); // snapshot whole plan
const yellow = applyDailyCheckIn(planDayC1.session, { completed_or_skipped: 'completed', symptom_response: 'more_noticeable', difficulty: 'about_right' });
ok(yellow.action === 'reduce_today', 'yellow → reduce today');
ok(yellow.selected_session_only === true, 'yellow: selected_session_only true');
ok(yellow.future_days_changed === false, 'yellow: future_days_changed false');
ok(yellow.adjusted_session.cards.length <= planDayC1.session.cards.length, 'yellow reduced/kept card count (today only)');
ok(JSON.stringify(c1.plan) === before, 'plan object unchanged after yellow check-in (future days intact)');

/* -------------------------------------------------------------------------
 * Case 6 — Daily check-in RED (withhold today)
 * ------------------------------------------------------------------------- */
section('Case 6: daily check-in red');
const red = applyDailyCheckIn(planDayC1.session, { completed_or_skipped: 'skipped', symptom_response: 'concerning', next_day_response: 'much_worse' });
ok(red.action === 'withhold_today_and_review', 'red → withhold today and review');
ok(red.adjusted_session.cards.length === 0 && red.adjusted_session.withheld_today === true, 'red withholds today’s exercises');
ok(red.future_days_changed === false, 'red: future days unchanged');
ok(JSON.stringify(c1.plan) === before, 'plan object still unchanged after red check-in');
ok(red.trace.clearance_created === false && red.trace.plan_regenerated === false, 'red: no clearance, no plan regeneration');

/* ------------------------------------------------------------------------- */
console.log(`\nRF Beta Engine test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('PASS — confidence capped <85; severity independent; recovery not a guarantee; full plan with phases/days; beta dosage defaults labelled; high-caution withheld; activity exposure grants no clearance; check-in today-only; clinical_authority false.');
process.exit(0);
