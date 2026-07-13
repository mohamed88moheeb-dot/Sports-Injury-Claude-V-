/**
 * scripts/test-hip-flexor-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the hip flexor engine. Run:
 * node scripts/test-hip-flexor-engine.mjs
 * ---------------------------------------------------------------------------
 */

import { runHipFlexor, applyHipFlexorCheckIn } from '../lib/clinical/hipFlexorEngine/index.mjs';
import { HIP_FLEXOR_CITATIONS } from '../lib/clinical/hipFlexorEngine/citations/hipFlexorClinicalCitations.mjs';
import { ILIOPSOAS_STRAIN_EXERCISES } from '../lib/clinical/hipFlexorEngine/modules/iliopsoasStrain/iliopsoasStrainExercises.mjs';
import { CHRONIC_HIP_FLEXOR_EXERCISES } from '../lib/clinical/hipFlexorEngine/modules/iliopsoasRelatedGroinPain/iliopsoasRelatedGroinPainExercises.mjs';
import { ILIOPSOAS_STRAIN_STAGES, CHRONIC_HIP_FLEXOR_STAGES } from '../lib/clinical/hipFlexorEngine/types.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

const base = { mechanism: 'sudden_hip_flexion', ability_to_continue: 'limited', pain_severity_label: 'moderate', resisted_hip_flexion_pain: 'moderate', symptom_duration_weeks: 1 };

// ── Routing ────────────────────────────────────────────────────────────────
check('recent forceful hip-flexion injury routes to acute iliopsoas strain', runHipFlexor({ ...base }).entity === 'iliopsoas_strain');
check('long symptom duration routes to chronic iliopsoas-related pain', runHipFlexor({ ...base, mechanism: 'gradual_overuse', onset: 'gradual', symptom_duration_weeks: 20 }).entity === 'iliopsoas_related_groin_pain');
check('snapping sensation weights toward chronic entity', runHipFlexor({ ...base, mechanism: 'gradual_overuse', onset: 'gradual', symptom_duration_weeks: 8, snapping_sensation: 'yes' }).entity === 'iliopsoas_related_groin_pain');

// ── Safety gates (must win over everything else) ────────────────────────────
check('hop test positive + night pain -> femoral stress fracture referral, no plan', (() => {
  const out = runHipFlexor({ ...base, hop_test: 'positive', night_pain: 'yes' });
  return out.entity === 'possible_femoral_neck_stress_fracture' && out.plan === null && out.autonomous_plan === false;
})());
check('hop test positive + gradual onset runner -> stress fracture referral', runHipFlexor({ ...base, hop_test: 'positive', gradual_onset_runner: 'yes' }).entity === 'possible_femoral_neck_stress_fracture');
check('FADIR positive + clicking -> hip joint referral, no plan', (() => {
  const out = runHipFlexor({ ...base, fadir_test: 'positive', clicking_or_catching: 'yes' });
  return out.entity === 'possible_hip_joint_pathology' && out.plan === null;
})());
check('stress fracture gate beats chronic-duration evidence', runHipFlexor({ ...base, symptom_duration_weeks: 30, hop_test: 'positive', night_pain: 'yes' }).entity === 'possible_femoral_neck_stress_fracture');

// ── Iliopsoas strain grade boundaries ─────────────────────────────────────────
const grade = (i) => runHipFlexor({ ...base, ...i }).diagnosis.severity.grade;
check('mild signals = grade_1', grade({ resisted_hip_flexion_pain: 'mild', bruising_or_swelling: 'none', pain_severity_label: 'mild' }) === 'grade_1');
check('moderate resisted pain = grade_2', grade({ resisted_hip_flexion_pain: 'moderate' }) === 'grade_2');
check('severe resisted pain + cannot continue = grade_3', grade({ resisted_hip_flexion_pain: 'severe', ability_to_continue: 'no' }) === 'grade_3');

// ── Stage placement (days-since-injury driven for acute strain) ─────────────
const stage = (days) => runHipFlexor({ ...base, resisted_hip_flexion_pain: 'moderate', ability_to_continue: 'yes', pain_severity_label: 'moderate', days_since_injury: days }).plan.current_stage_id;
const mildPlan = runHipFlexor({ ...base, resisted_hip_flexion_pain: 'mild', ability_to_continue: 'yes', pain_severity_label: 'mild', days_since_injury: 2 }).plan;
check('grade I = short trimmed plan (2 weeks, 2 phases)', mildPlan.total_estimated_weeks === 2 && mildPlan.stages.length === 2);
check('day 2 = protect', stage(2) === 'protect');
check('day 10 = restore_movement', stage(10) === 'restore_movement');
check('day 20 = build_strength', stage(20) === 'build_strength');
check('day 40 = return_to_sport', stage(40) === 'return_to_sport');

// ── Chronic iliopsoas-related pain: irritability-driven placement ───────────
const chronicStage = (i) => runHipFlexor({ ...base, mechanism: 'gradual_overuse', onset: 'gradual', symptom_duration_weeks: 20, ...i }).plan.current_stage_id;
check('high irritability places at isometric_settle', chronicStage({ pain_severity_label: 'severe', resisted_hip_flexion_pain: 'severe' }) === 'isometric_settle');
check('low irritability places at sport_specific_loading', chronicStage({ pain_severity_label: 'mild', resisted_hip_flexion_pain: 'mild' }) === 'sport_specific_loading');

// ── Phase durations are real ─────────────────────────────────────────────────
check('iliopsoas strain plan carries a total_estimated_weeks', runHipFlexor({ ...base }).plan.total_estimated_weeks > 1);
check('every iliopsoas-strain stage has a duration_weeks', runHipFlexor({ ...base }).plan.stages.every((s) => typeof s.duration_weeks === 'number' && s.duration_weeks >= 1));

// ── Warm-up/cool-down bookends present ───────────────────────────────────────
check('sessions open with a warm-up card and close with a cool-down card', (() => {
  const out = runHipFlexor({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.weeks[0].sessions[0].cards;
  return cards[0].exercise_id.includes('BOOKEND-WARMUP') && cards[cards.length - 1].exercise_id.includes('BOOKEND-COOLDOWN');
})());

// ── Check-in withhold ─────────────────────────────────────────────────────────
check('check-in withholds today on overnight pain', (() => {
  const out = runHipFlexor({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyHipFlexorCheckIn(cur.weeks[0].sessions[0], { overnight_pain: true }, out);
  return adj.action === 'withhold_today_and_review' && adj.adjusted_session.cards.length === 0;
})());
check('chronic hip flexor pain check-in withholds on high in-session pain', (() => {
  const out = runHipFlexor({ ...base, mechanism: 'gradual_overuse', onset: 'gradual', symptom_duration_weeks: 20 });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyHipFlexorCheckIn(cur.weeks[0].sessions[0], { pain_during_0_10: 8 }, out);
  return adj.action === 'withhold_today_and_review';
})());

// ── Citation integrity ───────────────────────────────────────────────────────
const allExercises = [...ILIOPSOAS_STRAIN_EXERCISES, ...CHRONIC_HIP_FLEXOR_EXERCISES];
const allCiteIds = new Set(allExercises.flatMap((e) => e.source_refs || []));
check('every exercise source_ref resolves to a real citation', [...allCiteIds].every((id) => !!HIP_FLEXOR_CITATIONS[id]));
check('citation set has real PMIDs/DOIs (not placeholders)', Object.values(HIP_FLEXOR_CITATIONS).every((c) => c.pmid || c.doi));

// ── Pool depth ────────────────────────────────────────────────────────────────
for (const s of ILIOPSOAS_STRAIN_STAGES) check(`iliopsoas strain "${s.id}" pool has >=4 exercises`, ILIOPSOAS_STRAIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
for (const s of CHRONIC_HIP_FLEXOR_STAGES) check(`chronic hip flexor "${s.id}" pool has >=4 exercises`, CHRONIC_HIP_FLEXOR_EXERCISES.filter((e) => e.phase === s.id).length >= 4);

// ── Unique exercise ids within each pool ─────────────────────────────────────
for (const [label, pool] of [['iliopsoas strain', ILIOPSOAS_STRAIN_EXERCISES], ['chronic hip flexor', CHRONIC_HIP_FLEXOR_EXERCISES]]) {
  const ids = pool.map((e) => e.id);
  check(`${label} pool has no duplicate ids`, new Set(ids).size === ids.length);
}

console.log(`hip-flexor-engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
