/**
 * scripts/test-it-band-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the IT band engine. Run:
 * node scripts/test-it-band-engine.mjs
 * ---------------------------------------------------------------------------
 */

import { runItBand, applyItBandCheckIn } from '../lib/clinical/itBandEngine/index.mjs';
import { IT_BAND_CITATIONS } from '../lib/clinical/itBandEngine/citations/itBandClinicalCitations.mjs';
import { IT_BAND_SYNDROME_EXERCISES } from '../lib/clinical/itBandEngine/modules/itBandSyndrome/itBandSyndromeExercises.mjs';
import { IT_BAND_SYNDROME_STAGES } from '../lib/clinical/itBandEngine/types.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

const base = { mechanism: 'gradual_overuse', pain_location: 'lateral_knee', ability_to_continue: 'yes', pain_severity_label: 'moderate', resisted_hip_abduction_pain: 'moderate' };

// ── Routing ────────────────────────────────────────────────────────────────
check('gradual lateral-knee pattern routes to IT band syndrome', runItBand({ ...base }).entity === 'it_band_syndrome');
check('downhill/stairs aggravation + recent training change still routes to ITBS', runItBand({ ...base, worse_downhill_or_stairs: 'yes', recent_training_change: 'yes' }).entity === 'it_band_syndrome');
check('unrelated pain location still defaults to IT band syndrome (only non-referral entity)', runItBand({ ...base, pain_location: 'unsure' }).entity === 'it_band_syndrome');

// ── Safety gates (must win over everything else) ────────────────────────────
check('locking/catching -> lateral knee structural injury referral, no plan', (() => {
  const out = runItBand({ ...base, locking_or_catching: 'yes' });
  return out.entity === 'possible_lateral_knee_structural_injury' && out.plan === null && out.autonomous_plan === false;
})());
check('giving way -> lateral knee structural injury referral', runItBand({ ...base, giving_way: 'yes' }).entity === 'possible_lateral_knee_structural_injury');
check('significant effusion -> lateral knee structural injury referral', runItBand({ ...base, significant_effusion: 'yes' }).entity === 'possible_lateral_knee_structural_injury');
check('structural-injury gate beats classic ITBS evidence', runItBand({ ...base, worse_downhill_or_stairs: 'yes', recent_training_change: 'yes', locking_or_catching: 'yes' }).entity === 'possible_lateral_knee_structural_injury');

// ── Irritability-driven placement ────────────────────────────────────────────
const stage = (i) => runItBand({ ...base, ...i }).plan.current_stage_id;
check('high irritability places at reduce_irritability', stage({ pain_severity_label: 'severe', resisted_hip_abduction_pain: 'severe' }) === 'reduce_irritability');
check('moderate irritability places at restore_load_tolerance', stage({ pain_severity_label: 'moderate', resisted_hip_abduction_pain: 'moderate' }) === 'restore_load_tolerance');
check('low irritability places at build_running_capacity', stage({ pain_severity_label: 'mild', resisted_hip_abduction_pain: 'mild' }) === 'build_running_capacity');

// ── Phase durations are real ─────────────────────────────────────────────────
check('IT band plan carries a total_estimated_weeks', runItBand({ ...base }).plan.total_estimated_weeks > 1);
check('every IT-band stage has a duration_weeks', runItBand({ ...base }).plan.stages.every((s) => typeof s.duration_weeks === 'number' && s.duration_weeks >= 1));

// ── Warm-up/cool-down bookends present ───────────────────────────────────────
check('sessions open with a warm-up card and close with a cool-down card', (() => {
  const out = runItBand({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const cards = cur.weeks[0].sessions[0].cards;
  return cards[0].exercise_id.includes('BOOKEND-WARMUP') && cards[cards.length - 1].exercise_id.includes('BOOKEND-COOLDOWN');
})());

// ── Check-in withhold ─────────────────────────────────────────────────────────
check('IT band check-in withholds on high in-session pain', (() => {
  const out = runItBand({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyItBandCheckIn(cur.weeks[0].sessions[0], { pain_during_0_10: 8 }, out);
  return adj.action === 'withhold_today_and_review' && adj.adjusted_session.cards.length === 0;
})());
check('IT band check-in does not withhold on low in-session pain', (() => {
  const out = runItBand({ ...base });
  const cur = out.plan.stages.find((s) => s.is_current);
  const adj = applyItBandCheckIn(cur.weeks[0].sessions[0], { pain_during_0_10: 2 }, out);
  return adj.action !== 'withhold_today_and_review';
})());

// ── Citation integrity ───────────────────────────────────────────────────────
const allCiteIds = new Set(IT_BAND_SYNDROME_EXERCISES.flatMap((e) => e.source_refs || []));
check('every exercise source_ref resolves to a real citation', [...allCiteIds].every((id) => !!IT_BAND_CITATIONS[id]));
check('citation set has real PMIDs/DOIs (not placeholders)', Object.values(IT_BAND_CITATIONS).every((c) => c.pmid || c.doi));

// ── Pool depth ────────────────────────────────────────────────────────────────
for (const s of IT_BAND_SYNDROME_STAGES) check(`IT band syndrome "${s.id}" pool has >=4 exercises`, IT_BAND_SYNDROME_EXERCISES.filter((e) => e.phase === s.id).length >= 4);

// ── Unique exercise ids ───────────────────────────────────────────────────────
const ids = IT_BAND_SYNDROME_EXERCISES.map((e) => e.id);
check('IT band syndrome pool has no duplicate ids', new Set(ids).size === ids.length);

console.log(`it-band-engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
