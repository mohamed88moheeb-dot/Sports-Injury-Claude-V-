#!/usr/bin/env node
/**
 * scripts/test-rf-beta-app-adapter.mjs
 * ---------------------------------------------------------------------------
 * Tests the RF beta app-adapter layer + engine integration the way the app
 * uses it: detect RF-compatible selection → map legacy assessment → runRfBeta
 * → persist/restore → today-only check-in. No browser; pure Node.
 * ---------------------------------------------------------------------------
 */

import { isRfCompatible } from '../lib/clinical/rfBetaAppAdapter/rfBetaCompatibility.mjs';
import { mapAssessmentToRfInput } from '../lib/clinical/rfBetaAppAdapter/mapAssessmentToRfInput.mjs';
import { serializeRfBeta, deserializeRfBeta, RF_BETA_STORAGE_KEY } from '../lib/clinical/rfBetaAppAdapter/rfBetaStorage.mjs';
import { runRfBeta } from '../lib/clinical/rfBetaEngine/index.mjs';
import { adjustToday } from '../lib/clinical/rfBetaEngine/rfDailyCheckInAdjuster.mjs';
import { classifyRedFlags } from '../lib/clinical/rfBetaEngine/rfConfidenceResolver.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } };
const section = (t) => console.log('\n== ' + t + ' ==');

/* Legacy assessment shapes (as produced by the existing app) */
const rfModerateAssessment = {
  primaryRegion: 'quadriceps', exactArea: 'front_rectus_femoris',
  mechanism: 'Kicking', symptoms: ['Bruising / swelling', 'Weakness'],
  movements: ['Kicking'], sports: ['Football / soccer'], equipment: ['Bodyweight', 'Resistance bands'],
  painRest: 2, painWalking: 4, painSport: 6, daysSince: 3, redFlags: [], story: ''
};
const nonRfAssessment = {
  primaryRegion: 'hamstring', exactArea: 'mid_hamstring_belly',
  mechanism: 'Sudden sprint', symptoms: [], movements: ['High-speed running'],
  sports: ['Athletics'], equipment: ['Bodyweight'], painRest: 1, painWalking: 2, painSport: 5, redFlags: []
};

/* -------------------------------------------------------------------------
 * Compatibility detection
 * ------------------------------------------------------------------------- */
section('compatibility detection');
ok(isRfCompatible(rfModerateAssessment) === true, 'RF anterior-thigh selection is RF-compatible');
ok(isRfCompatible(nonRfAssessment) === false, 'non-RF selection (hamstring) is NOT RF-compatible (legacy path untouched)');

/* -------------------------------------------------------------------------
 * Mapping + runRfBeta
 * ------------------------------------------------------------------------- */
section('assessment mapping → runRfBeta');
const rfInput = mapAssessmentToRfInput(rfModerateAssessment);
ok(rfInput.pain_location === 'anterior_thigh_rectus_femoris', 'maps anterior-thigh pain location');
ok(rfInput.mechanism === 'kicking', 'maps kicking mechanism');
ok(rfInput.pain_severity_label === 'moderate', 'maps moderate pain severity');

const out = runRfBeta(rfInput);
ok(out.confidence.confidence_percent !== null && out.confidence.confidence_percent < 85, 'confidence < 85');
ok(out.severity.functional_severity_band === 'moderate_functional_impact', 'moderate severity band');
ok(!/confirmed|definitely|grade iii tear|you have a/i.test(out.severity.severity_grade_wording), 'severity wording is not a confirmed diagnosis');
ok(!/guarantee|cleared|return to sport|will return in/i.test(out.recovery.user_facing_wording), 'recovery wording not a guarantee/clearance');
ok(out.plan.full_autonomous_plan === true && out.plan.phases.length === 6, 'full plan with six phases');
ok(out.governance_trace.clinical_authority_created === false, 'clinical_authority_created false');

// dashboard data shape exists
const firstActive = out.plan.phases.find((p) => p.days.length);
ok(!!firstActive, 'at least one active phase/day (dashboard data shape)');
const session = firstActive.days[0].session;
ok(session.cards.length > 0, 'session has cards');
ok(session.cards.every((c) => c.default_status === 'beta_default' && c.evidence_status === 'beta_default_not_evidence_graded'), 'session cards carry beta labels');

/* -------------------------------------------------------------------------
 * Persist / restore (localStorage payload)
 * ------------------------------------------------------------------------- */
section('persist / restore');
const serialized = serializeRfBeta({ assessmentInput: rfInput, rfOutput: out, selection: { phaseIndex: 0, dayIndex: 0 }, lastCheckIn: null });
const restored = deserializeRfBeta(serialized);
ok(RF_BETA_STORAGE_KEY === 'rf_beta_result_v1', 'storage key is rf_beta_result_v1');
ok(restored && restored.rfOutput && restored.rfOutput.confidence.confidence_percent === out.confidence.confidence_percent, 'restored output matches');
ok(deserializeRfBeta('garbage') === null, 'bad payload restores to null safely');

/* -------------------------------------------------------------------------
 * Today-only check-in (yellow + red), future days unchanged
 * ------------------------------------------------------------------------- */
section('daily check-in today-only');
const planSnapshot = JSON.stringify(out.plan);
const yellow = adjustToday(session, { symptom_response: 'more_noticeable' });
ok(yellow.selected_session_only === true && yellow.future_days_changed === false, 'yellow: today-only, no future change');
ok(JSON.stringify(out.plan) === planSnapshot, 'plan unchanged after yellow (future days intact)');
const red = adjustToday(session, { symptom_response: 'concerning' });
ok(red.action === 'withhold_today_and_review' && red.adjusted_session.cards.length === 0, 'red: today withheld');
ok(JSON.stringify(out.plan) === planSnapshot, 'plan unchanged after red');
ok(red.trace.clearance_created === false && red.trace.plan_regenerated === false, 'red: no clearance, no regeneration');

/* -------------------------------------------------------------------------
 * Non-RF path is never routed through runRfBeta by the adapter
 * ------------------------------------------------------------------------- */
section('non-RF path untouched');
ok(isRfCompatible(nonRfAssessment) === false, 'adapter would not invoke runRfBeta for non-RF selection');

/* -------------------------------------------------------------------------
 * Batch 1 mapping fixes
 * ------------------------------------------------------------------------- */
section('Batch 1: sport key fix');
const sportInput = mapAssessmentToRfInput({ primaryRegion: 'quadriceps', exactArea: 'front_rectus_femoris', mechanism: 'Kicking', sport: 'Football / soccer' });
ok(sportInput.sport_context === 'Football / soccer', 'sport (string) flows to sport_context');
ok(sportInput.training_goal === 'return_to_football_soccer', 'training_goal slug is clean (no slashes)');
ok(mapAssessmentToRfInput({ sports: ['Basketball'] }).sport_context === 'Basketball', 'legacy sports[] array still supported');

section('Batch 1: Foundation leads with gentlest');
const fOut = runRfBeta(mapAssessmentToRfInput({ primaryRegion: 'quadriceps', exactArea: 'front_rectus_femoris', mechanism: 'Kicking', painWalking: 4, painSport: 6, symptoms: ['Bruising'], equipment: ['Bodyweight'] }));
const fSession = fOut.plan.phases.find((p) => p.days.length).days[0].session;
ok(fSession.cards.length >= 1 && fSession.cards.length <= 6, 'Foundation Day 1 has 1-6 cards');
ok(!/step.?up/i.test(fSession.cards[0].exercise_name), 'Foundation Day 1 does NOT lead with a step-up');

section('Batch 1: equipment filtering');
const bw = runRfBeta(mapAssessmentToRfInput({ primaryRegion: 'quadriceps', exactArea: 'front_rectus_femoris', mechanism: 'Kicking', painSport: 5, equipment: ['Bodyweight'] }));
const allCards = bw.plan.phases.flatMap((p) => p.days.flatMap((d) => d.session.cards));
ok(allCards.length > 0, 'bodyweight-only user still gets exercises (never emptied)');
// Equipment filter only applies to auto-prescribed (non-preview) cards.
// Preview cards for upcoming phases may include gym exercises shown as roadmap only.
const prescribedCards = allCards.filter((c) => !c.preview_only);
// "_or_" tokens (e.g. bench_or_reclined_support) mean a floor/bodyweight alternative exists — not a hard gym requirement.
ok(prescribedCards.every((c) => !(c.equipment || []).some((e) => !/optional/i.test(e) && !e.includes('_or_') && /bench|dumbbell|barbell|machine|cable|flywheel|sled|prowler|limb_wrap/i.test(e))), 'no REQUIRED gym-only equipment exercises selected for bodyweight user (optional kit is fine)');

section('Batch 1: per-red-flag routing');
const cats = {};
for (const [label, frag] of [['weightbearing_fracture_screen','i_cannot_bear_weight_or_walk_four_steps.'],['vascular_dvt_pe','i_have_calf_swelling_warmth_redness_or_shortness_of_breath.'],['neuro','i_have_numbness_tingling_weakness_or_pain_that_travels_down_the_leg.'],['hernia_referral','i_have_a_visible_groin/abdominal_bulge_testicular_pain.']]) {
  const r = classifyRedFlags({ [frag]: true });
  cats[label] = r[0].category;
}
ok(cats.weightbearing_fracture_screen === 'weightbearing_fracture_screen', 'cannot-bear-weight → fracture screen');
ok(cats.vascular_dvt_pe === 'vascular_dvt_pe', 'calf/breath → DVT/PE (not generic swelling)');
ok(cats.neuro === 'neuro', 'numbness/tingling → neuro');
ok(cats.hernia_referral === 'hernia_referral', 'groin bulge → hernia');
const rfSafety = runRfBeta(mapAssessmentToRfInput({ primaryRegion:'quadriceps', exactArea:'front_rectus_femoris', mechanism:'Direct impact', redFlags:['I have calf swelling, warmth, redness, or shortness of breath.'] }));
ok(rfSafety.safety.red_flag_present === true && rfSafety.safety.pathways.length > 0, 'engine output exposes safety pathways');
ok(rfSafety.confidence.withheld === true, 'red flag still withholds confidence (safe default preserved)');

console.log(`\nRF Beta App Adapter test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('PASS — RF-compatible detection, mapping, runRfBeta, persist/restore, beta labels, today-only check-in, future days intact, legacy path untouched.');
process.exit(0);
