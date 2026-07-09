/**
 * scripts/test-rf-recovery-modifiers.mjs
 * Proves that mechanism, age, next-day reactivity and movement confidence now
 * shape the recovery-window modifiers (every relevant answer matters), and that
 * they don't fire when not present (no false positives).
 */
import { runRfBeta } from '../lib/clinical/rfBetaEngine/index.mjs';

const base = {
  pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'sprinting', sport_context: 'football',
  ability_to_continue: 'limited', walking_response: 'mild', knee_extension_response: 'mild_pain_strong',
  pain_severity_label: 'moderate', bruising_or_swelling: 'some', weakness_or_giving_way: 'none',
  red_flag_answers: {}, previous_injury: false, equipment_available: ['bodyweight'], confidence_in_answers: 'confident',
};
const run = (o) => runRfBeta({ ...base, ...o });
const leng = (out) => (out.recovery?.modifiers_that_may_lengthen || []).join(' | ').toLowerCase();
const shor = (out) => (out.recovery?.modifiers_that_may_shorten || []).join(' | ').toLowerCase();

let failed = false;
const check = (c, m) => { if (!c) { failed = true; console.log('   ✗ ' + m); } };

// Mechanism
check(/contusion|contact/.test(leng(run({ mechanism: 'direct_impact' }))), 'direct impact → contusion may-lengthen modifier');
check(/overuse|tendon/.test(leng(run({ mechanism: 'gradual_overuse' }))), 'gradual overuse → tendon may-lengthen modifier');
check(!/contusion|overuse/.test(leng(run({ mechanism: 'sprinting' }))), 'sprinting should NOT add contusion/overuse modifiers');

// Age
check(/45\+|adapt more slowly/.test(leng(run({ rf_self_tests: { age_group: '45_plus' } }))), 'age 45+ → may-lengthen');
check(/younger|heals faster/.test(shor(run({ rf_self_tests: { age_group: 'under_20' } }))), 'under 20 → may-shorten');

// Next-day reactivity
check(/reactive|next day/.test(leng(run({ next_day_response: 'much_worse' }))), 'much worse next day → reactive may-lengthen');

// Movement confidence (0–100 slider, low = worse)
check(/confidence|readiness/.test(leng(run({ rf_self_tests: { movement_confidence_value: 25 } }))), 'low movement confidence → RTS-readiness may-lengthen');
check(!/confidence|readiness/.test(leng(run({ rf_self_tests: { movement_confidence_value: 85 } }))), 'high confidence should NOT add the modifier');

console.log(failed ? '\n✗ RF RECOVERY-MODIFIER TEST FAILED\n' : '\n✓ RF RECOVERY-MODIFIER TEST PASSED (mechanism / age / reactivity / confidence shape the estimate)\n');
if (failed) process.exit(1);
