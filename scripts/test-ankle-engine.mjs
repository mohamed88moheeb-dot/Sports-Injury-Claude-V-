/**
 * scripts/test-ankle-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the ankle engine. Run: node scripts/test-ankle-engine.mjs
 * Covers: routing across all entities, safety-gate priority, grade boundaries,
 * stage placement, check-in withholds, citation integrity, and pool depth.
 * ---------------------------------------------------------------------------
 */

import { runAnkle, applyAnkleCheckIn } from '../lib/clinical/ankleEngine/index.mjs';
import { ANKLE_CITATIONS } from '../lib/clinical/ankleEngine/citations/ankleClinicalCitations.mjs';
import { LATERAL_SPRAIN_EXERCISES } from '../lib/clinical/ankleEngine/modules/lateralSprain/lateralSprainExercises.mjs';
import { SYNDESMOSIS_EXERCISES } from '../lib/clinical/ankleEngine/modules/syndesmosis/syndesmosisExercises.mjs';
import { CAI_EXERCISES } from '../lib/clinical/ankleEngine/modules/chronicInstability/chronicInstabilityExercises.mjs';
import { SPRAIN_STAGES, CAI_STAGES } from '../lib/clinical/ankleEngine/types.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

const base = { mechanism: 'inversion', ability_to_continue: 'limited', weight_bearing_ability: 'painful', pain_severity_label: 'moderate' };

// ── Routing ────────────────────────────────────────────────────────────────
check('classic inversion routes to lateral sprain', runAnkle({ ...base }).entity === 'ankle_lateral_sprain');
check('stable syndesmosis signals route to syndesmosis', runAnkle({ ...base, mechanism: 'external_rotation', pain_above_mortise: 'yes', squeeze_test: 'positive' }).entity === 'ankle_syndesmosis_sprain');
check('recurrent sprains route to chronic instability', runAnkle({ ...base, prior_sprain_count: 4, giving_way_without_new_injury: 'yes' }).entity === 'ankle_chronic_instability');

// ── Safety gates (must win over everything else) ────────────────────────────
check('Ottawa-positive bone tenderness -> fracture referral, no plan', (() => {
  const out = runAnkle({ ...base, bone_tenderness_malleolus: 'yes' });
  return out.entity === 'ankle_possible_fracture' && out.plan === null && out.autonomous_plan === false;
})());
check('Ottawa-positive 4-step inability -> fracture referral', runAnkle({ ...base, weight_bearing_ability: 'unable', unable_to_bear_weight_4_steps: 'yes' }).entity === 'ankle_possible_fracture');
check('unstable syndesmosis (diastasis suspected) -> referral, not autonomous plan', (() => {
  const out = runAnkle({ ...base, mechanism: 'external_rotation', pain_above_mortise: 'yes', squeeze_test: 'positive', diastasis_suspected: 'yes' });
  return out.entity === 'ankle_possible_fracture' && out.plan === null;
})());
check('fracture gate beats recurrent-instability history', runAnkle({ ...base, bone_tenderness_midfoot: 'yes', prior_sprain_count: 5, giving_way_without_new_injury: 'yes' }).entity === 'ankle_possible_fracture');

// ── Lateral sprain grade boundaries ──────────────────────────────────────────
const grade = (i) => runAnkle({ ...base, ...i }).diagnosis.severity.grade;
check('mild signals = grade_1', grade({ weight_bearing_ability: 'full', bruising_or_swelling: 'none', instability_signs: 'none', pain_severity_label: 'mild' }) === 'grade_1');
check('painful WB + significant swelling = grade_2', grade({ weight_bearing_ability: 'painful', bruising_or_swelling: 'significant' }) === 'grade_2');
check('unable to bear weight = grade_3', grade({ weight_bearing_ability: 'unable' }) === 'grade_3');
check('marked giving-way = grade_3', grade({ instability_signs: 'marked_giving_way' }) === 'grade_3');

// ── Functional rehab is first-line even at grade 3 (Kerkhoffs 2007) ──────────
check('grade 3 still gets an autonomous functional plan (no surgical-only gate)', (() => {
  const out = runAnkle({ ...base, weight_bearing_ability: 'unable', instability_signs: 'marked_giving_way' });
  return out.entity === 'ankle_lateral_sprain' && out.plan !== null && out.autonomous_plan !== false;
})());

// ── Stage placement (days-since-injury driven) ───────────────────────────────
const stage = (days) => runAnkle({ ...base, weight_bearing_ability: 'full', instability_signs: 'none', bruising_or_swelling: 'none', pain_severity_label: 'mild', days_since_injury: days }).plan.current_stage_id;
check('day 2 = protect', stage(2) === 'protect');
check('day 10 = restore_motion', stage(10) === 'restore_motion');
check('day 20 = strength_balance', stage(20) === 'strength_balance');
check('day 40 = return_to_sport', stage(40) === 'return_to_sport');

// ── Phase durations are real (not flat "1 week" everywhere) ──────────────────
check('lateral sprain plan carries a total_estimated_weeks', runAnkle({ ...base }).plan.total_estimated_weeks > 1);
check('every sprain stage has a duration_weeks', runAnkle({ ...base }).plan.stages.every((s) => typeof s.duration_weeks === 'number' && s.duration_weeks >= 1));

// ── Chronic instability: capacity-based placement (not days-since-injury) ────
check('severe recurrence places at neuromuscular_control', runAnkle({ ...base, prior_sprain_count: 6, giving_way_without_new_injury: 'yes' }).plan.current_stage_id === 'neuromuscular_control');
// Force CAI routing via override to isolate the module's OWN placement logic
// from the router's (correct) reluctance to call 1 prior sprain "chronic".
check('mild history (0-1 sprains, no giving-way) places further along', runAnkle({ ...base, injury_entity_override: 'ankle_chronic_instability', prior_sprain_count: 1, giving_way_without_new_injury: 'no' }).plan.current_stage_id === 'dynamic_reactive');
check('router itself only classifies as chronic instability with real recurrence evidence', runAnkle({ ...base, prior_sprain_count: 1, giving_way_without_new_injury: 'no' }).entity !== 'ankle_chronic_instability');

// ── Warm-up/cool-down bookends present on every session ──────────────────────
check('sessions open with a warm-up card and close with a cool-down card', (() => {
  const out = runAnkle({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.sessions[0].cards;
  return cards[0].exercise_id.includes('BOOKEND-WARMUP') && cards[cards.length - 1].exercise_id.includes('BOOKEND-COOLDOWN');
})());
check('syndesmosis (stretch-cautious) uses the cautious cool-down variant', (() => {
  const out = runAnkle({ ...base, mechanism: 'external_rotation', pain_above_mortise: 'yes', squeeze_test: 'positive' });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.sessions[0].cards;
  return cards[cards.length - 1].exercise_id === 'CORE-BOOKEND-COOLDOWN-CAUTIOUS';
})());

// ── Check-in withhold ─────────────────────────────────────────────────────────
check('check-in withholds today on overnight pain', (() => {
  const out = runAnkle({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyAnkleCheckIn(cur.sessions[0], { overnight_pain: true }, out);
  return adj.action === 'withhold_today_and_review' && adj.adjusted_session.cards.length === 0;
})());
check('CAI check-in withholds on a new giving-way episode', (() => {
  const out = runAnkle({ ...base, prior_sprain_count: 4, giving_way_without_new_injury: 'yes' });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyAnkleCheckIn(cur.sessions[0], { new_giving_way_episode: true }, out);
  return adj.action === 'withhold_today_and_review';
})());

// ── Citation integrity: every source_refs id used by an exercise must resolve ─
const allExercises = [...LATERAL_SPRAIN_EXERCISES, ...SYNDESMOSIS_EXERCISES, ...CAI_EXERCISES];
const allCiteIds = new Set(allExercises.flatMap((e) => e.source_refs || []));
check('every exercise source_ref resolves to a real citation', [...allCiteIds].every((id) => !!ANKLE_CITATIONS[id]));
check('citation set has real PMIDs/DOIs (not placeholders)', Object.values(ANKLE_CITATIONS).every((c) => c.pmid || c.doi));

// ── Pool depth: no stage should be thinner than 4 exercises ──────────────────
for (const s of SPRAIN_STAGES) {
  check(`lateral sprain "${s.id}" pool has >=4 exercises`, LATERAL_SPRAIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
  check(`syndesmosis "${s.id}" pool has >=4 exercises`, SYNDESMOSIS_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
}
for (const s of CAI_STAGES) {
  check(`CAI "${s.id}" pool has >=4 exercises`, CAI_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
}

// ── Unique exercise ids within each pool ─────────────────────────────────────
for (const [label, pool] of [['lateral sprain', LATERAL_SPRAIN_EXERCISES], ['syndesmosis', SYNDESMOSIS_EXERCISES], ['CAI', CAI_EXERCISES]]) {
  const ids = pool.map((e) => e.id);
  check(`${label} pool has no duplicate ids`, new Set(ids).size === ids.length);
}

console.log(`ankle-engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
