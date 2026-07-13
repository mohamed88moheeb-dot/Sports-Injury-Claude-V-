/**
 * scripts/test-lower-back-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the lower back engine. Run:
 * node scripts/test-lower-back-engine.mjs
 * ---------------------------------------------------------------------------
 */

import { runLowerBack, applyLowerBackCheckIn } from '../lib/clinical/lowerBackEngine/index.mjs';
import { LOWER_BACK_CITATIONS } from '../lib/clinical/lowerBackEngine/citations/lowerBackClinicalCitations.mjs';
import { NON_SPECIFIC_LOW_BACK_PAIN_EXERCISES } from '../lib/clinical/lowerBackEngine/modules/nonSpecificLowBackPain/nonSpecificLowBackPainExercises.mjs';
import { LUMBAR_RADICULAR_PAIN_EXERCISES } from '../lib/clinical/lowerBackEngine/modules/lumbarRadicularPain/lumbarRadicularPainExercises.mjs';
import { NON_SPECIFIC_LOW_BACK_PAIN_STAGES, LUMBAR_RADICULAR_PAIN_STAGES } from '../lib/clinical/lowerBackEngine/types.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

const base = { mechanism: 'gradual_overuse', ability_to_continue: 'yes', pain_severity_label: 'moderate' };

// ── Routing ────────────────────────────────────────────────────────────────
check('mechanical pattern (no leg pain) routes to non-specific low back pain', runLowerBack({ ...base }).entity === 'non_specific_low_back_pain');
check('leg pain below knee + numbness routes to lumbar radicular pain', runLowerBack({ ...base, mechanism: 'sudden_lift_twist', leg_pain_below_knee: 'yes', numbness_tingling_leg: 'yes' }).entity === 'lumbar_radicular_pain');
check('leg pain below knee alone weights toward radicular pain', runLowerBack({ ...base, leg_pain_below_knee: 'yes' }).entity === 'lumbar_radicular_pain');

// ── Safety gates (must win over everything else) ────────────────────────────
check('saddle numbness -> cauda equina/serious pathology EMERGENCY referral, no plan', (() => {
  const out = runLowerBack({ ...base, saddle_numbness: 'yes' });
  return out.entity === 'possible_cauda_equina_or_serious_pathology' && out.plan === null && out.autonomous_plan === false && out.referral.urgency === 'emergency';
})());
check('bladder/bowel dysfunction -> cauda equina/serious pathology referral', runLowerBack({ ...base, bladder_or_bowel_dysfunction: 'yes' }).entity === 'possible_cauda_equina_or_serious_pathology');
check('bilateral leg symptoms + progressive neuro deficit -> cauda equina referral', runLowerBack({ ...base, bilateral_leg_symptoms: 'yes', progressive_neuro_deficit: 'yes' }).entity === 'possible_cauda_equina_or_serious_pathology');
check('bilateral leg symptoms ALONE (no progression) does not trigger cauda equina gate', runLowerBack({ ...base, bilateral_leg_symptoms: 'yes' }).entity !== 'possible_cauda_equina_or_serious_pathology');
check('recent significant trauma -> cauda equina/serious pathology referral', runLowerBack({ ...base, recent_significant_trauma: 'yes' }).entity === 'possible_cauda_equina_or_serious_pathology');
check('unexplained weight loss/fever -> cauda equina/serious pathology referral', runLowerBack({ ...base, unexplained_weight_loss_or_fever: 'yes' }).entity === 'possible_cauda_equina_or_serious_pathology');

check('young athlete + extension sport + extension-provoked pain -> spondylolysis referral, urgent', (() => {
  const out = runLowerBack({ ...base, mechanism: 'repetitive_extension_rotation', age_group: 'youth_or_adolescent', extension_rotation_sport: 'yes', worse_with_extension: 'yes' });
  return out.entity === 'possible_spondylolysis' && out.plan === null && out.referral.urgency === 'urgent';
})());
check('positive single-leg hyperextension test -> spondylolysis referral', runLowerBack({ ...base, single_leg_hyperextension_test: 'positive' }).entity === 'possible_spondylolysis');
check('adult with extension sport pattern does NOT trigger spondylolysis gate (age-gated)', runLowerBack({ ...base, mechanism: 'repetitive_extension_rotation', age_group: 'adult', extension_rotation_sport: 'yes', worse_with_extension: 'yes' }).entity !== 'possible_spondylolysis');
check('cauda equina gate beats spondylolysis gate (priority order)', runLowerBack({ ...base, mechanism: 'repetitive_extension_rotation', age_group: 'youth_or_adolescent', extension_rotation_sport: 'yes', worse_with_extension: 'yes', saddle_numbness: 'yes' }).entity === 'possible_cauda_equina_or_serious_pathology');

// ── Irritability-driven placement (non-specific LBP) ─────────────────────────
const nsStage = (i) => runLowerBack({ ...base, ...i }).plan.current_stage_id;
check('high irritability (severe + cannot continue) places at calm_and_move', nsStage({ pain_severity_label: 'severe', ability_to_continue: 'no' }) === 'calm_and_move');
check('moderate irritability places at restore_movement_and_control', nsStage({ pain_severity_label: 'severe', ability_to_continue: 'yes' }) === 'restore_movement_and_control');
check('low irritability places at build_strength_and_capacity', nsStage({ pain_severity_label: 'mild', ability_to_continue: 'yes' }) === 'build_strength_and_capacity');

// ── Irritability-driven placement (lumbar radicular pain) ────────────────────
const lrpStage = (i) => runLowerBack({ ...base, mechanism: 'sudden_lift_twist', leg_pain_below_knee: 'yes', ...i }).plan.current_stage_id;
check('high irritability places at settle_nerve_irritability', lrpStage({ pain_severity_label: 'severe', ability_to_continue: 'no' }) === 'settle_nerve_irritability');
check('moderate irritability (numbness present) places at restore_neural_tolerance', lrpStage({ pain_severity_label: 'mild', ability_to_continue: 'yes', numbness_tingling_leg: 'yes' }) === 'restore_neural_tolerance');
check('low irritability places at build_strength_and_capacity', lrpStage({ pain_severity_label: 'mild', ability_to_continue: 'yes', numbness_tingling_leg: 'no' }) === 'build_strength_and_capacity');

// ── Phase durations are real ─────────────────────────────────────────────────
check('non-specific LBP plan carries a total_estimated_weeks', runLowerBack({ ...base }).plan.total_estimated_weeks > 1);
check('every non-specific-LBP stage has a duration_weeks', runLowerBack({ ...base }).plan.stages.every((s) => typeof s.duration_weeks === 'number' && s.duration_weeks >= 1));

// ── Warm-up/cool-down bookends present ───────────────────────────────────────
check('sessions open with a warm-up card and close with a cool-down card', (() => {
  const out = runLowerBack({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.weeks[0].sessions[0].cards;
  return cards[0].exercise_id.includes('BOOKEND-WARMUP') && cards[cards.length - 1].exercise_id.includes('BOOKEND-COOLDOWN');
})());

// ── Check-in withhold ─────────────────────────────────────────────────────────
check('non-specific LBP check-in withholds on high in-session pain', (() => {
  const out = runLowerBack({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyLowerBackCheckIn(cur.weeks[0].sessions[0], { pain_during_0_10: 8 }, out);
  return adj.action === 'withhold_today_and_review' && adj.adjusted_session.cards.length === 0;
})());
check('non-specific LBP check-in withholds on new leg symptoms', (() => {
  const out = runLowerBack({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyLowerBackCheckIn(cur.weeks[0].sessions[0], { new_leg_symptoms: true }, out);
  return adj.action === 'withhold_today_and_review';
})());
check('lumbar radicular pain check-in withholds on worsening leg symptoms', (() => {
  const out = runLowerBack({ ...base, mechanism: 'sudden_lift_twist', leg_pain_below_knee: 'yes' });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyLowerBackCheckIn(cur.weeks[0].sessions[0], { leg_symptoms_worse: true }, out);
  return adj.action === 'withhold_today_and_review';
})());

// ── Citation integrity ───────────────────────────────────────────────────────
const allExercises = [...NON_SPECIFIC_LOW_BACK_PAIN_EXERCISES, ...LUMBAR_RADICULAR_PAIN_EXERCISES];
const allCiteIds = new Set(allExercises.flatMap((e) => e.source_refs || []));
check('every exercise source_ref resolves to a real citation', [...allCiteIds].every((id) => !!LOWER_BACK_CITATIONS[id]));
check('citation set has real PMIDs/DOIs (not placeholders)', Object.values(LOWER_BACK_CITATIONS).every((c) => c.pmid || c.doi));

// ── Pool depth ────────────────────────────────────────────────────────────────
for (const s of NON_SPECIFIC_LOW_BACK_PAIN_STAGES) check(`non-specific LBP "${s.id}" pool has >=4 exercises`, NON_SPECIFIC_LOW_BACK_PAIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);
for (const s of LUMBAR_RADICULAR_PAIN_STAGES) check(`lumbar radicular pain "${s.id}" pool has >=4 exercises`, LUMBAR_RADICULAR_PAIN_EXERCISES.filter((e) => e.phase === s.id).length >= 4);

// ── Unique exercise ids within each pool ─────────────────────────────────────
for (const [label, pool] of [['non-specific LBP', NON_SPECIFIC_LOW_BACK_PAIN_EXERCISES], ['lumbar radicular pain', LUMBAR_RADICULAR_PAIN_EXERCISES]]) {
  const ids = pool.map((e) => e.id);
  check(`${label} pool has no duplicate ids`, new Set(ids).size === ids.length);
}

console.log(`lower-back-engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
