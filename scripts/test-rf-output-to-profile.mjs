#!/usr/bin/env node
/**
 * scripts/test-rf-output-to-profile.mjs
 * ---------------------------------------------------------------------------
 * Verifies the corrected integration: RF engine output maps into the EXISTING
 * RecoveryContext profile shape (profile.plan[].weeks[].days[].exercises[]),
 * the Foundation session is minimal with rest/protection/education guidance,
 * governance is preserved, and the today-only check-in adjusts only today.
 * Pure Node; no framework.
 * ---------------------------------------------------------------------------
 */

import { runRfBeta } from '../lib/clinical/rfBetaEngine/index.mjs';
import { mapAssessmentToRfInput } from '../lib/clinical/rfBetaAppAdapter/mapAssessmentToRfInput.mjs';
import { isRfCompatible } from '../lib/clinical/rfBetaAppAdapter/rfBetaCompatibility.mjs';
import { rfOutputToProfile, adjustProfileDayToday } from '../lib/clinical/rfBetaAppAdapter/rfOutputToProfile.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } };
const section = (t) => console.log('\n== ' + t + ' ==');

const HIGH_CAUTION_SAMPLE = ['RF-EX-013', 'RF-EX-051', 'RF-EX-059', 'RF-EX-100', 'RF-EX-107'];

const moderate = {
  primaryRegion: 'quadriceps', exactArea: 'front_rectus_femoris',
  mechanism: 'Kicking', symptoms: ['Bruising / swelling', 'Weakness'], movements: ['Kicking'],
  sports: ['Football / soccer'], equipment: ['Bodyweight', 'Resistance bands'],
  painRest: 2, painWalking: 4, painSport: 6, redFlags: [], story: ''
};
const nonRf = { primaryRegion: 'hamstring', exactArea: 'mid_hamstring_belly', mechanism: 'Sudden sprint' };

section('compatibility + run');
ok(isRfCompatible(moderate) === true, 'RF anterior-thigh is RF-compatible');
ok(isRfCompatible(nonRf) === false, 'non-RF region stays legacy');
const out = runRfBeta(mapAssessmentToRfInput(moderate));
const profile = rfOutputToProfile(out, moderate);

section('existing profile/plan shape preserved');
ok(profile.isRfBeta === true, 'profile.isRfBeta true');
ok(Array.isArray(profile.plan) && profile.plan.length === 6, 'profile.plan has 6 phases');
const ph0 = profile.plan[0];
ok(Array.isArray(ph0.weeks) && ph0.weeks.length >= 1, 'phase has weeks[]');
const d0 = ph0.weeks[0].days[0];
ok(Array.isArray(d0.exercises), 'day.exercises[] exists (existing shape)');
ok('completed' in d0 && 'sessionTitle' in d0 && 'rule' in d0, 'day keeps title/sessionTitle/completed/rule');
ok(profile.plan.every((p) => p.weeks.every((w) => w.days.length >= 1)), 'every week has >=1 day (no NaN in week page)');

section('Foundation is minimal + guidance');
ok(d0.exercises.length >= 1 && d0.exercises.length <= 3, `Foundation Day 1 has 1-3 active cards (got ${d0.exercises.length})`);
const guidance = (d0.recovery || []).join(' ').toLowerCase();
ok(/rest|protect/.test(guidance), 'Foundation Day 1 guidance includes rest/protection');
ok(/education|calm|gentle/.test(guidance), 'Foundation Day 1 guidance includes education');
ok(/monitor/.test(guidance), 'Foundation Day 1 guidance includes monitoring');

section('exercise card mapping + beta labels');
const card = d0.exercises[0];
ok(!!card.name && !!card.prescription, 'exercise has name + prescription (sets/reps)');
ok(card.painRule && card.painRule.length > 0, 'exercise carries stop rule as painRule');
ok(card.betaDefaultLabel && /beta testing default/i.test(card.betaDefaultLabel), 'exercise shows beta-default label');
ok(card.clinicalReviewStatus === 'requires_clinician_review', 'exercise carries clinical_review_status');

section('diagnosis-facing fields');
ok(profile.confidence === null || profile.confidence < 85, 'confidence < 85 or withheld');
ok(!/confirmed|definitely|grade iii tear/i.test(profile.gradeName), 'severity wording is cautious, not confirmed');
ok(!/guarantee|cleared|return to sport|will return in/i.test((profile.rfRecoveryWording + ' ' + profile.returnRange).toLowerCase()), 'recovery wording is not a guarantee/clearance');

section('governance + withheld preserved');
ok(Array.isArray(profile.rfWithheldItems) && profile.rfWithheldItems.length > 0, 'withheld items preserved');
ok(profile.rfGovernanceTrace && profile.rfGovernanceTrace.clinical_authority_created === false, 'governance trace, clinical_authority false');
const selectedIds = profile.plan.flatMap((p) => p.weeks.flatMap((w) => w.days.flatMap((dd) => dd.exercises))).map(() => null); // names only
const selectedNames = profile.plan.flatMap((p) => p.weeks.flatMap((w) => w.days.flatMap((dd) => dd.exercises.map((e) => e.name))));
ok(profile.rfGovernanceTrace.exercise_objects_selected.every((id) => !HIGH_CAUTION_SAMPLE.includes(id)), 'no high-caution id auto-selected');

section('today-only check-in (existing day shape)');
const planBefore = JSON.stringify(profile.plan);
const day1Before = JSON.stringify(ph0.weeks[0].days[1] || null);
// red: pain 8 → withhold today
const red = adjustProfileDayToday(d0, { pain: 8, confidence: 60, swelling: 'No change', response: 'Stable' });
ok(red.action === 'withhold_today_and_review' && red.day.exercises.length === 0, 'red check-in withholds today');
ok(red.selected_session_only === true && red.future_days_changed === false, 'red: today-only flags');
// yellow: pain 5 → reduce today
const yellow = adjustProfileDayToday(d0, { pain: 5, confidence: 60, swelling: 'No change', response: 'Sore but settled' });
ok(yellow.action === 'reduce_today' && yellow.day.exercises.length <= d0.exercises.length, 'yellow reduces today');
// adjustProfileDayToday returns a COPY — original plan untouched
ok(JSON.stringify(profile.plan) === planBefore, 'profile.plan unchanged by adjuster (pure)');
ok(JSON.stringify(ph0.weeks[0].days[1] || null) === day1Before, 'future day unchanged');

section('high-concern → no autonomous full plan');
const severe = rfOutputToProfile(runRfBeta(mapAssessmentToRfInput({
  primaryRegion: 'quadriceps', exactArea: 'front_rectus_femoris', mechanism: 'Direct impact',
  symptoms: ['Cannot bear weight'], painRest: 7, painWalking: 8, painSport: 9,
  redFlags: ['sudden loss of function']
})), { primaryRegion: 'quadriceps' });
ok(severe.fullAutonomousPlan === false, 'high-concern: no autonomous full plan');
ok(severe.rfReviewRequired === true, 'high-concern: review required');

console.log(`\nRF Output→Profile test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('PASS — maps into existing profile shape; Foundation minimal + guidance; beta labels; cautious wording; governance preserved; today-only check-in; high-concern gated.');
process.exit(0);
