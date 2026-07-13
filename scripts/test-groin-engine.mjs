/**
 * scripts/test-groin-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the adductor/groin engine. Run:
 * node scripts/test-groin-engine.mjs
 * ---------------------------------------------------------------------------
 */

import { runGroin, applyGroinCheckIn } from '../lib/clinical/groinEngine/index.mjs';
import { GROIN_CITATIONS } from '../lib/clinical/groinEngine/citations/groinClinicalCitations.mjs';
import { ADDUCTOR_STRAIN_EXERCISES } from '../lib/clinical/groinEngine/modules/adductorStrain/adductorStrainExercises.mjs';
import { CHRONIC_GROIN_EXERCISES } from '../lib/clinical/groinEngine/modules/adductorRelatedGroinPain/adductorRelatedGroinPainExercises.mjs';
import { ADDUCTOR_STRAIN_STAGES, CHRONIC_GROIN_STAGES } from '../lib/clinical/groinEngine/types.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

const base = { mechanism: 'kicking', ability_to_continue: 'limited', pain_severity_label: 'moderate', resisted_adduction_pain: 'moderate', symptom_duration_weeks: 1 };

// ── Routing ────────────────────────────────────────────────────────────────
check('recent kicking injury routes to acute adductor strain', runGroin({ ...base }).entity === 'adductor_strain');
check('long symptom duration routes to chronic adductor-related pain', runGroin({ ...base, mechanism: 'gradual_overuse', onset: 'gradual', symptom_duration_weeks: 20 }).entity === 'adductor_related_groin_pain');

// ── Safety gates (must win over everything else) ────────────────────────────
check('bulge + worse with straining -> hernia referral, no plan', (() => {
  const out = runGroin({ ...base, bulge_present: 'yes', worse_with_straining: 'yes' });
  return out.entity === 'possible_inguinal_hernia' && out.plan === null && out.autonomous_plan === false;
})());
check('FADIR positive + clicking -> hip joint referral, no plan', (() => {
  const out = runGroin({ ...base, fadir_test: 'positive', clicking_or_catching: 'yes' });
  return out.entity === 'possible_hip_joint_pathology' && out.plan === null;
})());
check('hernia gate beats chronic-duration evidence', runGroin({ ...base, symptom_duration_weeks: 30, bulge_present: 'yes', worse_with_straining: 'yes' }).entity === 'possible_inguinal_hernia');

// ── Adductor strain grade boundaries ─────────────────────────────────────────
const grade = (i) => runGroin({ ...base, ...i }).diagnosis.severity.grade;
check('mild signals = grade_1', grade({ resisted_adduction_pain: 'mild', bruising_or_swelling: 'none', pain_severity_label: 'mild' }) === 'grade_1');
check('moderate resisted pain = grade_2', grade({ resisted_adduction_pain: 'moderate' }) === 'grade_2');
check('severe resisted pain + cannot continue = grade_3', grade({ resisted_adduction_pain: 'severe', ability_to_continue: 'no' }) === 'grade_3');

// ── Stage placement (days-since-injury driven for acute strain) ─────────────
const stage = (days) => runGroin({ ...base, resisted_adduction_pain: 'moderate', ability_to_continue: 'yes', pain_severity_label: 'moderate', days_since_injury: days }).plan.current_stage_id;
const mildPlan = runGroin({ ...base, resisted_adduction_pain: 'mild', ability_to_continue: 'yes', pain_severity_label: 'mild', days_since_injury: 2 }).plan;
check('grade I = short trimmed plan (2 weeks, 2 phases)', mildPlan.total_estimated_weeks === 2 && mildPlan.stages.length === 2);
check('day 2 = protect', stage(2) === 'protect');
check('day 10 = restore_movement', stage(10) === 'restore_movement');
check('day 20 = build_strength', stage(20) === 'build_strength');
check('day 40 = return_to_sport', stage(40) === 'return_to_sport');

// ── Chronic adductor-related pain: irritability-driven placement ────────────
const chronicStage = (i) => runGroin({ ...base, mechanism: 'gradual_overuse', onset: 'gradual', symptom_duration_weeks: 20, ...i }).plan.current_stage_id;
check('high irritability places at isometric_settle', chronicStage({ pain_severity_label: 'severe', resisted_adduction_pain: 'severe' }) === 'isometric_settle');
check('low irritability places at sport_specific_loading', chronicStage({ pain_severity_label: 'mild', resisted_adduction_pain: 'mild' }) === 'sport_specific_loading');

// ── Phase durations are real ─────────────────────────────────────────────────
check('adductor strain plan carries a total_estimated_weeks', runGroin({ ...base }).plan.total_estimated_weeks > 1);
check('every adductor-strain stage has a duration_weeks', runGroin({ ...base }).plan.stages.every((s) => typeof s.duration_weeks === 'number' && s.duration_weeks >= 1));

// ── Warm-up/cool-down bookends present ───────────────────────────────────────
check('sessions open with a warm-up card and close with a cool-down card', (() => {
  const out = runGroin({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.weeks[0].sessions[0].cards;
  return cards[0].exercise_id.includes('BOOKEND-WARMUP') && cards[cards.length - 1].exercise_id.includes('BOOKEND-COOLDOWN');
})());

// ── Check-in withhold ─────────────────────────────────────────────────────────
check('check-in withholds today on overnight pain', (() => {
  const out = runGroin({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyGroinCheckIn(cur.weeks[0].sessions[0], { overnight_pain: true }, out);
  return adj.action === 'withhold_today_and_review' && adj.adjusted_session.cards.length === 0;
})());
check('chronic groin pain check-in withholds on high in-session pain', (() => {
  const out = runGroin({ ...base, mechanism: 'gradual_overuse', onset: 'gradual', symptom_duration_weeks: 20 });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyGroinCheckIn(cur.weeks[0].sessions[0], { pain_during_0_10: 8 }, out);
  return adj.action === 'withhold_today_and_review';
})());

// ── Citation integrity ───────────────────────────────────────────────────────
const allExercises = [...ADDUCTOR_STRAIN_EXERCISES, ...CHRONIC_GROIN_EXERCISES];
const allCiteIds = new Set(allExercises.flatMap((e) => e.source_refs || []));
check('every exercise source_ref resolves to a real citation', [...allCiteIds].every((id) => !!GROIN_CITATIONS[id]));
check('citation set has real PMIDs/DOIs (not placeholders)', Object.values(GROIN_CITATIONS).every((c) => c.pmid || c.doi));

// ── Pool depth ────────────────────────────────────────────────────────────────
for (const s of ADDUCTOR_STRAIN_STAGES) check(`adductor strain "${s.id}" pool has >=4 exercises`, ADDUCTOR_STRAIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
for (const s of CHRONIC_GROIN_STAGES) check(`chronic groin "${s.id}" pool has >=4 exercises`, CHRONIC_GROIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);

// ── Unique exercise ids within each pool ─────────────────────────────────────
for (const [label, pool] of [['adductor strain', ADDUCTOR_STRAIN_EXERCISES], ['chronic groin', CHRONIC_GROIN_EXERCISES]]) {
  const ids = pool.map((e) => e.id);
  check(`${label} pool has no duplicate ids`, new Set(ids).size === ids.length);
}

console.log(`groin-engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
