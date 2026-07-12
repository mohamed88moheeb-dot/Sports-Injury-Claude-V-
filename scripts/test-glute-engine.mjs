/**
 * scripts/test-glute-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the glute engine. Run:
 * node scripts/test-glute-engine.mjs
 * ---------------------------------------------------------------------------
 */

import { runGlute, applyGluteCheckIn } from '../lib/clinical/gluteEngine/index.mjs';
import { GLUTE_CITATIONS } from '../lib/clinical/gluteEngine/citations/gluteClinicalCitations.mjs';
import { GLUTEAL_STRAIN_EXERCISES } from '../lib/clinical/gluteEngine/modules/glutealStrain/glutealStrainExercises.mjs';
import { GLUTEAL_TENDINOPATHY_EXERCISES } from '../lib/clinical/gluteEngine/modules/glutealTendinopathy/glutealTendinopathyExercises.mjs';
import { GLUTEAL_STRAIN_STAGES, GLUTEAL_TENDINOPATHY_STAGES } from '../lib/clinical/gluteEngine/types.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

const base = { mechanism: 'sprinting', pain_location: 'deep_buttock', ability_to_continue: 'limited', pain_severity_label: 'moderate', resisted_abduction_pain: 'moderate', days_since_injury: 3 };

// ── Routing ────────────────────────────────────────────────────────────────
check('sudden deep-buttock mechanism routes to acute gluteal strain', runGlute({ ...base }).entity === 'gluteal_strain');
check('lateral hip + night pain + gradual onset routes to gluteal tendinopathy', runGlute({
  mechanism: 'gradual_overuse', onset: 'gradual', pain_location: 'lateral_hip', worse_lying_on_side: 'yes',
  worse_with_stairs_sitting: 'yes', ability_to_continue: 'yes', pain_severity_label: 'moderate',
}).entity === 'gluteal_tendinopathy');
check('single-leg-stance + resisted-abduction pain weights toward gluteal tendinopathy', runGlute({
  mechanism: 'gradual_overuse', pain_location: 'lateral_hip', single_leg_stance_pain: 'yes',
  resisted_abduction_pain: 'severe', ability_to_continue: 'yes', pain_severity_label: 'mild',
}).entity === 'gluteal_tendinopathy');

// ── Safety gates (must win over everything else) ────────────────────────────
check('radiating pain below knee + numbness -> deep gluteal syndrome referral, no plan', (() => {
  const out = runGlute({ ...base, radiating_pain_below_knee: 'yes', numbness_tingling: 'yes' });
  return out.entity === 'possible_deep_gluteal_syndrome' && out.plan === null && out.autonomous_plan === false;
})());
check('radiating pain below knee + positive nerve provocation -> deep gluteal syndrome referral', runGlute({ ...base, radiating_pain_below_knee: 'yes', nerve_provocation_test: 'positive' }).entity === 'possible_deep_gluteal_syndrome');
check('deep gluteal syndrome gate beats lateral-hip GTPS evidence', runGlute({
  mechanism: 'gradual_overuse', pain_location: 'lateral_hip', worse_lying_on_side: 'yes', pain_severity_label: 'moderate',
  ability_to_continue: 'yes', radiating_pain_below_knee: 'yes', numbness_tingling: 'yes',
}).entity === 'possible_deep_gluteal_syndrome');
check('radiating pain alone (no numbness/positive nerve test) does not trigger the safety gate', runGlute({ ...base, radiating_pain_below_knee: 'yes' }).entity !== 'possible_deep_gluteal_syndrome');

// ── Gluteal strain grade boundaries ─────────────────────────────────────────
const grade = (i) => runGlute({ ...base, ...i }).diagnosis.severity.grade;
check('mild signals = grade_1', grade({ resisted_abduction_pain: 'mild', bruising_or_swelling: 'none', pain_severity_label: 'mild', ability_to_continue: 'yes' }) === 'grade_1');
check('moderate resisted pain = grade_2', grade({ resisted_abduction_pain: 'moderate' }) === 'grade_2');
check('severe resisted pain + cannot continue = grade_3', grade({ resisted_abduction_pain: 'severe', ability_to_continue: 'no' }) === 'grade_3');

// ── Stage placement (days-since-injury driven for acute strain) ─────────────
const stage = (days) => runGlute({ ...base, resisted_abduction_pain: 'mild', ability_to_continue: 'yes', pain_severity_label: 'mild', days_since_injury: days }).plan.current_stage_id;
check('day 2 = protect', stage(2) === 'protect');
check('day 10 = restore_movement', stage(10) === 'restore_movement');
check('day 20 = build_strength', stage(20) === 'build_strength');
check('day 40 = return_to_sport', stage(40) === 'return_to_sport');

// ── Gluteal tendinopathy: irritability-driven placement ─────────────────────
const gtpsStage = (i) => runGlute({
  mechanism: 'gradual_overuse', pain_location: 'lateral_hip', ability_to_continue: 'yes', ...i,
}).plan.current_stage_id;
check('high irritability places at load_management', gtpsStage({ pain_severity_label: 'severe', resisted_abduction_pain: 'severe' }) === 'load_management');
check('moderate irritability places at progressive_strengthening', gtpsStage({ pain_severity_label: 'moderate', resisted_abduction_pain: 'moderate' }) === 'progressive_strengthening');
check('low irritability places at functional_loading', gtpsStage({ pain_severity_label: 'mild', resisted_abduction_pain: 'mild', worse_lying_on_side: 'no' }) === 'functional_loading');

// ── Phase durations are real ─────────────────────────────────────────────────
check('gluteal strain plan carries a total_estimated_weeks', runGlute({ ...base }).plan.total_estimated_weeks > 1);
check('every gluteal-strain stage has a duration_weeks', runGlute({ ...base }).plan.stages.every((s) => typeof s.duration_weeks === 'number' && s.duration_weeks >= 1));

// ── Warm-up/cool-down bookends present ───────────────────────────────────────
check('sessions open with a warm-up card and close with a cool-down card', (() => {
  const out = runGlute({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.sessions[0].cards;
  return cards[0].exercise_id.includes('BOOKEND-WARMUP') && cards[cards.length - 1].exercise_id.includes('BOOKEND-COOLDOWN');
})());

// ── Check-in withhold ─────────────────────────────────────────────────────────
check('gluteal strain check-in withholds on increased swelling', (() => {
  const out = runGlute({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyGluteCheckIn(cur.sessions[0], { swelling_change: 'more' }, out);
  return adj.action === 'withhold_today_and_review' && adj.adjusted_session.cards.length === 0;
})());
check('gluteal strain check-in withholds on new sharp pain', (() => {
  const out = runGlute({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyGluteCheckIn(cur.sessions[0], { new_sharp_pain: true }, out);
  return adj.action === 'withhold_today_and_review';
})());
check('gluteal tendinopathy check-in withholds on high in-session pain', (() => {
  const out = runGlute({ mechanism: 'gradual_overuse', pain_location: 'lateral_hip', ability_to_continue: 'yes', pain_severity_label: 'moderate', resisted_abduction_pain: 'moderate' });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyGluteCheckIn(cur.sessions[0], { pain_during_0_10: 8 }, out);
  return adj.action === 'withhold_today_and_review';
})());

// ── Citation integrity ───────────────────────────────────────────────────────
const allExercises = [...GLUTEAL_STRAIN_EXERCISES, ...GLUTEAL_TENDINOPATHY_EXERCISES];
const allCiteIds = new Set(allExercises.flatMap((e) => e.source_refs || []));
check('every exercise source_ref resolves to a real citation', [...allCiteIds].every((id) => !!GLUTE_CITATIONS[id]));
check('citation set has real PMIDs/DOIs (not placeholders)', Object.values(GLUTE_CITATIONS).every((c) => c.pmid || c.doi));

// ── Pool depth ────────────────────────────────────────────────────────────────
for (const s of GLUTEAL_STRAIN_STAGES) check(`gluteal strain "${s.id}" pool has >=4 exercises`, GLUTEAL_STRAIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
for (const s of GLUTEAL_TENDINOPATHY_STAGES) check(`gluteal tendinopathy "${s.id}" pool has >=4 exercises`, GLUTEAL_TENDINOPATHY_EXERCISES.filter((e) => e.phase === s.id).length >= 4);

// ── Unique exercise ids within each pool ─────────────────────────────────────
for (const [label, pool] of [['gluteal strain', GLUTEAL_STRAIN_EXERCISES], ['gluteal tendinopathy', GLUTEAL_TENDINOPATHY_EXERCISES]]) {
  const ids = pool.map((e) => e.id);
  check(`${label} pool has no duplicate ids`, new Set(ids).size === ids.length);
}

console.log(`glute-engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
