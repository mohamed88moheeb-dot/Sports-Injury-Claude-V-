/**
 * scripts/test-knee-app-adapter.mjs
 * End-to-end: app assessment → mapAssessmentToKneeInput → runKnee →
 * kneeOutputToProfile → assert the profile shape the UI consumes is valid.
 */
import { runKnee } from '../lib/clinical/kneeEngine/index.mjs';
import { mapAssessmentToKneeInput } from '../lib/clinical/kneeEngine/appAdapter/mapAssessmentToKneeInput.mjs';
import { kneeOutputToProfile } from '../lib/clinical/kneeEngine/appAdapter/kneeOutputToProfile.mjs';
import { kneeRouteFor } from '../lib/clinical/kneeEngine/appAdapter/kneeCompatibility.mjs';

let failed = false;
const check = (c, m) => { if (!c) { failed = true; console.log('   ✗ ' + m); } };

function pipeline(a) {
  const input = mapAssessmentToKneeInput(a);
  const out = runKnee(input);
  const profile = kneeOutputToProfile(out, a);
  return { input, out, profile };
}

// ── Routing ──────────────────────────────────────────────────────────────
check(kneeRouteFor({ primaryRegion: 'knee', exactArea: 'acl' }) === 'knee', 'knee region routes to knee');
check(kneeRouteFor({ primaryRegion: 'knee', exactArea: 'patellar_tendon' }) === null, 'patellar tendon excluded (quad handles)');
check(kneeRouteFor({ primaryRegion: 'hamstring' }) === null, 'non-knee region not routed');

// ── ACL: non-contact pivot + pop ───────────────────────────────────────────
const acl = pipeline({ primaryRegion: 'knee', exactArea: 'acl', mechanism: 'Planted and pivoted, felt a pop', painSport: 6, daysSince: 5, kneeAnswers: { pop_at_injury: 'yes', swelling_timing: 'immediate' } });
check(acl.out.entity === 'acl_injury', `ACL routed (got ${acl.out.entity})`);
check(Array.isArray(acl.profile.plan) && acl.profile.plan.length > 0, 'ACL profile has a plan with stages');
check(acl.profile.plan.some((p) => p.weeks?.[0]?.days?.some((d) => d.exercises?.length)), 'ACL plan has exercises');
check(acl.profile.injuryTitle.includes('cruciate'), 'ACL diagnosis title present');
check(typeof acl.profile.confidence === 'number' || acl.profile.confidence === null, 'ACL confidence is a number or withheld');

// ── MCL: valgus blow ───────────────────────────────────────────────────────
const mcl = pipeline({ primaryRegion: 'knee', exactArea: 'mcl', mechanism: 'Hit on the outside of the knee', painSport: 4, daysSince: 3 });
check(mcl.out.entity === 'mcl_injury', `MCL routed (got ${mcl.out.entity})`);
check(mcl.profile.returnRange.length > 0, 'MCL has a recovery range');

// ── PFPS: gradual anterior pain with squat ────────────────────────────────
const pfps = pipeline({ primaryRegion: 'knee', exactArea: 'patellofemoral_joint', mechanism: 'Gradual pain over time', painSport: 3, daysSince: 40, kneeAnswers: { pain_with_squat: 'yes' } });
check(pfps.out.entity === 'patellofemoral_pain', `PFPS routed (got ${pfps.out.entity})`);
check(pfps.profile.fullAutonomousPlan === true, 'PFPS is an autonomous plan (no referral)');

// ── Locked knee → referral (no autonomous plan) ────────────────────────────
const locked = pipeline({ primaryRegion: 'knee', exactArea: 'medial_meniscus', mechanism: 'Twisting', painSport: 6, daysSince: 4, kneeAnswers: { locking_or_block: 'yes', joint_line_tenderness: 'yes' } });
check(locked.profile.rfReviewRequired === true, 'Locked knee flags review required');
check(locked.profile.fullAutonomousPlan === false, 'Locked knee withholds autonomous plan');
check(!!locked.profile.rfReviewMessage, 'Locked knee surfaces a referral message');

// ── Profile shape invariants (what the UI needs) ──────────────────────────
for (const { profile } of [acl, mcl, pfps]) {
  check(profile.isRfBeta === true, 'profile.isRfBeta true (reuses beta rendering)');
  check(profile.regionName === 'Knee', 'regionName is Knee');
  check(!!profile.rf && !!profile.rf.diagnosis_pattern, 'profile.rf populated');
  check(profile.plan.every((p) => p.weeks.every((w) => w.days.length >= 1)), 'every week has ≥1 day (no NaN in week page)');
}

console.log(failed ? '\n✗ KNEE APP-ADAPTER TEST FAILED\n' : '\n✓ KNEE APP-ADAPTER TEST PASSED (routing + diagnosis + plan + referral map into the profile shape)\n');
if (failed) process.exit(1);
