/**
 * scripts/test-rf-rts-readiness.mjs
 * Verifies the return-to-sport readiness battery: criteria reflect the athlete's
 * answers, it never grants clearance, and sport-specific criteria only apply to
 * kicking athletes.
 */
import { runRfBeta } from '../lib/clinical/rfBetaEngine/index.mjs';

const base = {
  pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', sport_context: 'football',
  ability_to_continue: 'yes', walking_response: 'none', pain_severity_label: 'mild',
  bruising_or_swelling: 'none', weakness_or_giving_way: 'none', red_flag_answers: {},
  previous_injury: false, equipment_available: ['bodyweight'], confidence_in_answers: 'confident',
};
const run = (o) => runRfBeta({ ...base, ...o }).rts_readiness;
const crit = (r, id) => r.criteria.find((c) => c.id === id);

let failed = false;
const check = (c, m) => { if (!c) { failed = true; console.log('   ✗ ' + m); } };

// Not-ready athlete: nothing tested / low confidence.
const notReady = run({ rf_self_tests: { knee_extension_response: 'significant_pain', sprint_tolerance: 'not_tried', single_leg_control: 'difficult', movement_confidence_value: 20, pain_at_rest: 'mild' } });
check(notReady.all_criteria_met === false, 'Untested/symptomatic athlete should NOT meet all criteria');
check(notReady.clinical_authority === false, 'Battery must never claim clinical authority');
check(/clinician/i.test(notReady.clearance_note), 'Must state clearance is a clinician decision');

// Ready athlete: everything clear.
const ready = run({
  knee_extension_response: 'no_pain', weakness_or_giving_way: 'none', bruising_or_swelling: 'none',
  rf_self_tests: { knee_extension_response: 'no_pain', sprint_tolerance: 'ok', kick_tolerance: 'ok', single_leg_control: 'yes_pain_free', pain_at_rest: 'none', next_day_response: 'same_or_better', movement_confidence_value: 90 },
  next_day_response: 'same_or_better',
});
check(ready.all_criteria_met === true, `Fully-cleared athlete should meet all criteria (got ${ready.met}/${ready.total})`);
check(crit(ready, 'sprint').met === true, 'Sprint criterion should be met when sprint tolerance is ok');
check(crit(ready, 'psychological').met === true, 'Psychological criterion should be met at high confidence');

// Sport-specific applies only to kicking athletes.
const runner = run({ sport_context: 'running', mechanism: 'sprinting', rf_self_tests: { sprint_tolerance: 'ok' } });
check(crit(runner, 'sport_specific').state === 'n/a', 'Kicking criterion should be N/A for a runner');
const footballer = run({ rf_self_tests: { kick_tolerance: 'significant_during' } });
check(crit(footballer, 'sport_specific').state !== 'n/a', 'Kicking criterion should apply to a footballer');

console.log(`not-ready: ${notReady.met}/${notReady.total} | ready: ${ready.met}/${ready.total}`);
console.log(failed ? '\n✗ RF RTS-READINESS TEST FAILED\n' : '\n✓ RF RTS-READINESS TEST PASSED (criteria battery reflects answers; never grants clearance)\n');
if (failed) process.exit(1);
