#!/usr/bin/env node
/**
 * scripts/test-rf-assessment-model.mjs
 * ---------------------------------------------------------------------------
 * CP1 — RF assessment model + direct mapping + completeness + confidence
 * limiting. No framework; tiny assert harness.
 * ---------------------------------------------------------------------------
 */

import {
  RF_ASSESSMENT_QUESTIONS, CORE_RF_KEYS, computeRfCompleteness, computeRfFormFill, mapRfAnswersToRfInput, deriveLocationFromAnatomy,
  bandValue, PAIN_BANDS, CONFIDENCE_BANDS, WALK_BANDS
} from '../lib/clinical/rfBetaAppAdapter/rfAssessmentModel.mjs';
import { runRfBeta } from '../lib/clinical/rfBetaEngine/index.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } };
const section = (t) => console.log('\n== ' + t + ' ==');

section('injury location is wired from the anatomy selection');
ok(deriveLocationFromAnatomy({ exactArea: 'front_rectus_femoris', primaryRegion: 'quadriceps' }) === 'anterior_thigh_rectus_femoris', 'rectus femoris anatomy → anterior_thigh_rectus_femoris');
ok(deriveLocationFromAnatomy({ primaryRegion: 'quadriceps' }) === 'anterior_thigh_rectus_femoris', 'quadriceps region alone → anterior_thigh location');
ok(!RF_ASSESSMENT_QUESTIONS.some((q) => q.key === 'pain_location'), 'no redundant "Where is your pain?" dropdown (location comes from anatomy)');
ok(mapRfAnswersToRfInput({ mechanism: 'kicking' }, { exactArea: 'front_rectus_femoris', primaryRegion: 'quadriceps' }).pain_location === 'anterior_thigh_rectus_femoris', 'anatomy feeds engine pain_location');
ok(computeRfCompleteness({ mechanism: 'kicking', walking_response: 'mild', hip_flexion_response: 'painful', knee_extension_response: 'painful', next_day_response: 'sore_settled', red_flags: [] }, { primaryRegion: 'quadriceps' }).status === 'complete', 'anatomy-derived location counts toward completeness');

section('form-fill is live + excludes safety');
const emptyFill = computeRfFormFill({}, { primaryRegion: 'quadriceps', equipment: ['Bodyweight'] });
ok(emptyFill.percent < 100 && emptyFill.allFilled === false, 'empty form is NOT 100% (location+equipment filled, rest empty)');
ok(emptyFill.filled >= 1, 'anatomy location counts as filled');
// fill walking via its slider valueKey only (no safety answered)
const someFill = computeRfFormFill({ walking_value: 40, mechanism: 'kicking' }, { primaryRegion: 'quadriceps', equipment: ['Bodyweight'] });
ok(someFill.filled > emptyFill.filled, 'filling a field raises the count (live)');
// safety answers must NOT change fill or completeness
const withSafety = computeRfFormFill({ red_flags: ['x'], red_flags_acknowledged: true }, { primaryRegion: 'quadriceps', equipment: ['Bodyweight'] });
ok(withSafety.filled === emptyFill.filled, 'safety answers do NOT count toward fill');
const compNoSafety = computeRfCompleteness({ pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', walking_response: 'mild', hip_flexion_response: 'painful', knee_extension_response: 'painful', next_day_response: 'sore_settled' });
ok(compNoSafety.status === 'complete', 'completeness reaches complete WITHOUT any safety acknowledgement');

section('slider questions map to qualitative bands');
ok(bandValue(10, PAIN_BANDS) === 'mild' && bandValue(50, PAIN_BANDS) === 'moderate' && bandValue(90, PAIN_BANDS) === 'severe', 'pain slider value → mild/moderate/severe bands');
ok(bandValue(20, CONFIDENCE_BANDS) === 'low' && bandValue(80, CONFIDENCE_BANDS) === 'high', 'confidence slider value → low/high bands');
ok(bandValue(undefined, PAIN_BANDS) === null, 'unset slider → null');
ok(mapRfAnswersToRfInput({ pain_severity_value: 85 }, { primaryRegion: 'quadriceps' }).pain_severity_label === 'severe', 'pain slider feeds engine pain_severity_label');
ok(mapRfAnswersToRfInput({ movement_confidence_value: 15 }, {}).rf_self_tests.movement_confidence === 'low', 'confidence slider feeds rf_self_tests');
ok(RF_ASSESSMENT_QUESTIONS.some((q) => q.type === 'slider'), 'model includes slider-type questions');

section('model is derived from RF-ASSESS objects');
ok(RF_ASSESSMENT_QUESTIONS.length >= 17, 'has the RF-ASSESS question set');
ok(RF_ASSESSMENT_QUESTIONS.every((q) => q.assess_ref && /^RF-ASSESS-\d{3}$/.test(q.assess_ref)), 'every question anchored to an RF-ASSESS id');
ok(RF_ASSESSMENT_QUESTIONS.every((q) => q.type === 'slider' ? Array.isArray(q.bands) : (Array.isArray(q.options) && q.options.length > 0)), 'every question has options (or bands for sliders)');

section('completeness from real answers');
const empty = computeRfCompleteness({});
ok(empty.status === 'incomplete', 'no answers → incomplete');
const partial = computeRfCompleteness({ pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', walking_response: 'mild', red_flags: [] });
ok(partial.status === 'partial', 'three of six core answers (0.5) → partial');
const full = computeRfCompleteness({ pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', walking_response: 'mild', hip_flexion_response: 'painful', knee_extension_response: 'painful', next_day_response: 'sore_settled', red_flags: [] });
ok(full.status === 'complete', 'all core answered + safety acknowledged → complete');
ok(computeRfCompleteness({ pain_location: 'multiple_or_unsure', mechanism: 'unsure', walking_response: 'unsure', hip_flexion_response: 'unsure', knee_extension_response: 'unsure', next_day_response: 'same_or_better', red_flags: [] }).status !== 'complete', '"unsure" answers do NOT count as answered');

section('direct mapping (no inference)');
const input = mapRfAnswersToRfInput({
  pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking',
  walking_response: 'mild', stairs_response: 'painful', hip_flexion_response: 'painful',
  knee_extension_response: 'weak', next_day_response: 'sore_settled', bruising_or_swelling: 'some',
  red_flags: [], previous_injury: 'yes', scar_history: 'yes',
  jog_tolerance: 'symptoms_after', movement_confidence: 'low'
}, { sport: 'Football / soccer', equipment: ['Bodyweight', 'Resistance bands'] });
ok(input.pain_location === 'anterior_thigh_rectus_femoris', 'pain_location passes through directly');
ok(input.mechanism === 'kicking', 'mechanism passes through directly');
ok(input.knee_extension_response === 'unable', 'weak knee-extension → unable');
ok(input.weakness_or_giving_way === 'marked', 'weak resisted test → marked weakness');
ok(input.previous_injury === true, 'previous_injury mapped');
ok(input.reported_fibrosis_or_scar_history === 'reported', 'scar history mapped');
ok(input.equipment_available.includes('band'), 'equipment mapped from generic multi-select');
ok(input.assessment_completeness === 'complete', 'completeness embedded in input');
ok(input.rf_self_tests && input.rf_self_tests.jog_tolerance === 'symptoms_after', 'self-tests carried through');

section('confidence limited/withheld by completeness');
const incompleteOut = runRfBeta(mapRfAnswersToRfInput({ pain_location: 'anterior_thigh_rectus_femoris' }, {}));
ok(incompleteOut.confidence.withheld === true && incompleteOut.confidence.route === 'incomplete', 'incomplete → confidence withheld');
const partialOut = runRfBeta(mapRfAnswersToRfInput({ pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', walking_response: 'mild', red_flags: [] }, {}));
ok(partialOut.confidence.withheld === false && partialOut.confidence.confidence_percent <= 65, 'partial → confidence capped ≤65');
ok(partialOut.confidence.limited_by_missing_inputs === true, 'partial → limited_by_missing_inputs flag set');
const fullOut = runRfBeta(mapRfAnswersToRfInput({ pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', walking_response: 'mild', hip_flexion_response: 'painful', knee_extension_response: 'painful', next_day_response: 'sore_settled', red_flags: [] }, {}));
ok(fullOut.confidence.confidence_percent !== null && fullOut.confidence.confidence_percent < 85, 'complete → confidence shown, still <85');
ok(fullOut.assessment_completeness.status === 'complete', 'engine output carries completeness status');

console.log(`\nRF Assessment Model test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('PASS — RF assessment derived from RF-ASSESS; real completeness; direct mapping; confidence withheld(incomplete)/capped(partial).');
process.exit(0);
