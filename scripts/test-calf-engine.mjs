/**
 * scripts/test-calf-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the calf/shin engine. Run: node scripts/test-calf-engine.mjs
 * ---------------------------------------------------------------------------
 */

import { runCalf, applyCalfCheckIn } from '../lib/clinical/calfEngine/index.mjs';
import { CALF_CITATIONS } from '../lib/clinical/calfEngine/citations/calfClinicalCitations.mjs';
import { CALF_STRAIN_EXERCISES } from '../lib/clinical/calfEngine/modules/calfStrain/calfStrainExercises.mjs';
import { ACHILLES_EXERCISES } from '../lib/clinical/calfEngine/modules/achillesTendinopathy/achillesTendinopathyExercises.mjs';
import { MTSS_EXERCISES } from '../lib/clinical/calfEngine/modules/mtss/mtssExercises.mjs';
import { CALF_STRAIN_STAGES, ACHILLES_STAGES, MTSS_STAGES } from '../lib/clinical/calfEngine/types.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

const base = { mechanism: 'sudden_push_off', pain_location: 'posterior_calf', ability_to_continue: 'limited', weight_bearing_ability: 'painful', pain_severity_label: 'moderate' };

// ── Routing ────────────────────────────────────────────────────────────────
check('sudden posterior-calf pain routes to calf strain', runCalf({ ...base }).entity === 'calf_strain');
check('Achilles-located gradual pain routes to tendinopathy', runCalf({ ...base, mechanism: 'gradual_overuse_running', onset: 'gradual', pain_location: 'achilles_mid_portion', morning_stiffness: 'yes' }).entity === 'achilles_tendinopathy');
check('medial shin gradual pain routes to MTSS', runCalf({ ...base, mechanism: 'gradual_overuse_running', onset: 'gradual', pain_location: 'medial_shin' }).entity === 'medial_tibial_stress_syndrome');

// ── Safety gates (must win over everything else) ────────────────────────────
check('Thompson-positive -> Achilles rupture referral, no plan', (() => {
  const out = runCalf({ ...base, thompson_test: 'absent_plantarflexion' });
  return out.entity === 'possible_achilles_rupture' && out.plan === null && out.autonomous_plan === false;
})());
check('palpable gap -> Achilles rupture referral', runCalf({ ...base, palpable_gap: 'yes' }).entity === 'possible_achilles_rupture');
check('snap + cannot heel raise -> Achilles rupture referral', runCalf({ ...base, sudden_snap_sensation: 'yes', unable_heel_raise: 'yes' }).entity === 'possible_achilles_rupture');
check('focal shin tenderness + positive hop -> stress fracture referral', (() => {
  const out = runCalf({ ...base, pain_location: 'medial_shin', shin_tenderness_length: 'focal', hop_test: 'positive' });
  return out.entity === 'possible_tibial_stress_fracture' && out.plan === null;
})());
check('rupture gate beats calf-strain mechanism evidence', runCalf({ ...base, mechanism: 'sprinting', thompson_test: 'absent_plantarflexion' }).entity === 'possible_achilles_rupture');

// ── Calf strain grade boundaries ─────────────────────────────────────────────
const grade = (i) => runCalf({ ...base, ...i }).diagnosis.severity.grade;
check('mild signals = grade_1', grade({ weight_bearing_ability: 'full', bruising_or_swelling: 'none', pain_severity_label: 'mild' }) === 'grade_1');
check('painful WB + significant swelling = grade_2', grade({ weight_bearing_ability: 'painful', bruising_or_swelling: 'significant' }) === 'grade_2');
check('unable to bear weight = grade_3', grade({ weight_bearing_ability: 'unable' }) === 'grade_3');

// ── Stage placement (days-since-injury driven for calf strain) ──────────────
const stage = (days) => runCalf({ ...base, weight_bearing_ability: 'full', bruising_or_swelling: 'none', pain_severity_label: 'mild', days_since_injury: days }).plan.current_stage_id;
check('day 2 = protect', stage(2) === 'protect');
check('day 10 = restore_movement', stage(10) === 'restore_movement');
check('day 20 = build_strength', stage(20) === 'build_strength');
check('day 40 = return_to_sport', stage(40) === 'return_to_sport');

// ── Achilles tendinopathy irritability-driven placement ──────────────────────
const achStage = (i) => runCalf({ ...base, mechanism: 'gradual_overuse_running', onset: 'gradual', pain_location: 'achilles_mid_portion', ...i }).plan.current_stage_id;
check('severe + stiff Achilles pain places at isometric', achStage({ pain_severity_label: 'severe', morning_stiffness: 'yes' }) === 'isometric');
check('mild Achilles pain places at isotonic_hsr', achStage({ pain_severity_label: 'mild', morning_stiffness: 'no' }) === 'isotonic_hsr');

// ── MTSS irritability-driven placement ───────────────────────────────────────
const mtssStage = (i) => runCalf({ ...base, mechanism: 'gradual_overuse_running', onset: 'gradual', pain_location: 'medial_shin', ...i }).plan.current_stage_id;
check('severe MTSS + cannot continue places at settle_irritability', mtssStage({ pain_severity_label: 'severe', ability_to_continue: 'no' }) === 'settle_irritability');
check('mild MTSS places at build_capacity', mtssStage({ pain_severity_label: 'mild', ability_to_continue: 'yes' }) === 'build_capacity');

// ── Phase durations are real ─────────────────────────────────────────────────
check('calf strain plan carries a total_estimated_weeks', runCalf({ ...base }).plan.total_estimated_weeks > 1);
check('every calf-strain stage has a duration_weeks', runCalf({ ...base }).plan.stages.every((s) => typeof s.duration_weeks === 'number' && s.duration_weeks >= 1));

// ── Warm-up/cool-down bookends present, Achilles uses cautious variant ───────
check('sessions open with a warm-up card and close with a cool-down card', (() => {
  const out = runCalf({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.weeks[0].sessions[0].cards;
  return cards[0].exercise_id.includes('BOOKEND-WARMUP') && cards[cards.length - 1].exercise_id.includes('BOOKEND-COOLDOWN');
})());
check('Achilles tendinopathy (stretch-cautious) uses the cautious cool-down', (() => {
  const out = runCalf({ ...base, mechanism: 'gradual_overuse_running', onset: 'gradual', pain_location: 'achilles_mid_portion', morning_stiffness: 'yes' });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.weeks[0].sessions[0].cards;
  return cards[cards.length - 1].exercise_id === 'CORE-BOOKEND-COOLDOWN-CAUTIOUS';
})());

// ── Check-in withhold ─────────────────────────────────────────────────────────
check('check-in withholds today on overnight pain', (() => {
  const out = runCalf({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyCalfCheckIn(cur.weeks[0].sessions[0], { overnight_pain: true }, out);
  return adj.action === 'withhold_today_and_review' && adj.adjusted_session.cards.length === 0;
})());
check('MTSS check-in withholds when pain becomes focal (possible stress fracture)', (() => {
  const out = runCalf({ ...base, mechanism: 'gradual_overuse_running', onset: 'gradual', pain_location: 'medial_shin' });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyCalfCheckIn(cur.weeks[0].sessions[0], { pain_became_focal: true }, out);
  return adj.action === 'withhold_today_and_review';
})());

// ── Citation integrity ───────────────────────────────────────────────────────
const allExercises = [...CALF_STRAIN_EXERCISES, ...ACHILLES_EXERCISES, ...MTSS_EXERCISES];
const allCiteIds = new Set(allExercises.flatMap((e) => e.source_refs || []));
check('every exercise source_ref resolves to a real citation', [...allCiteIds].every((id) => !!CALF_CITATIONS[id]));
check('citation set has real PMIDs/DOIs (not placeholders)', Object.values(CALF_CITATIONS).every((c) => c.pmid || c.doi));

// ── Pool depth ────────────────────────────────────────────────────────────────
for (const s of CALF_STRAIN_STAGES) check(`calf strain "${s.id}" pool has >=4 exercises`, CALF_STRAIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
for (const s of ACHILLES_STAGES) check(`Achilles tendinopathy "${s.id}" pool has >=4 exercises`, ACHILLES_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
for (const s of MTSS_STAGES) check(`MTSS "${s.id}" pool has >=4 exercises`, MTSS_EXERCISES.filter((e) => e.phase === s.id).length >= 4);

// ── Unique exercise ids within each pool ─────────────────────────────────────
for (const [label, pool] of [['calf strain', CALF_STRAIN_EXERCISES], ['Achilles tendinopathy', ACHILLES_EXERCISES], ['MTSS', MTSS_EXERCISES]]) {
  const ids = pool.map((e) => e.id);
  check(`${label} pool has no duplicate ids`, new Set(ids).size === ids.length);
}

console.log(`calf-engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
