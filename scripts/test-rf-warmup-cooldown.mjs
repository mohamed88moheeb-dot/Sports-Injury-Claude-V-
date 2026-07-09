/**
 * scripts/test-rf-warmup-cooldown.mjs
 * Verifies every RF session is bookended by a phase-appropriate RAMP warm-up
 * (first) and a cooldown + recovery block (last), and that the clinical logic
 * matches real practice (no aggressive stretch of a healing muscle early;
 * potentiation only when sport-ready).
 */
import { runRfBeta } from '../lib/clinical/rfBetaEngine/index.mjs';

const out = runRfBeta({
  pain_location: 'anterior_thigh_rectus_femoris', mechanism: 'kicking', sport_context: 'football',
  ability_to_continue: 'limited', walking_response: 'mild', stairs_response: 'painful',
  hip_flexion_response: 'painful', knee_extension_response: 'mild_pain_strong', pain_severity_label: 'moderate',
  bruising_or_swelling: 'some', weakness_or_giving_way: 'none', red_flag_answers: {},
  previous_injury: false, reported_fibrosis_or_scar_history: 'none',
  equipment_available: ['bodyweight', 'band'], training_goal: 'return_to_football', confidence_in_answers: 'confident',
});

let failed = false;
const check = (c, m) => { if (!c) { failed = true; console.log('   ✗ ' + m); } };
const txt = (card) => JSON.stringify(card).toLowerCase();

let sessions = 0;
const phasesSeen = new Set();
for (const ph of out.plan?.phases || []) {
  for (const day of ph.days || []) {
    const cards = day.session?.cards;
    if (!cards || cards.length === 0) continue;      // rest day
    sessions++;
    phasesSeen.add(ph.phase_id || ph.id);

    const first = cards[0];
    const last = cards[cards.length - 1];
    check(first.block === 'warm_up', `${ph.phase_id}: first card must be warm-up (got ${first.block})`);
    check(last.block === 'cool_down', `${ph.phase_id}: last card must be cooldown (got ${last.block})`);
    check(/^RF-WARMUP-/.test(first.exercise_id || ''), `${ph.phase_id}: warm-up id malformed`);
    check(Array.isArray(first.instructions) && first.instructions.length >= 2, `${ph.phase_id}: warm-up needs real instructions`);
    check(Array.isArray(last.instructions) && last.instructions.length >= 2, `${ph.phase_id}: cooldown needs real instructions`);
  }
}

// Clinical-logic spot checks by phase.
const phaseCards = (pid, block) => {
  for (const ph of out.plan?.phases || []) if ((ph.phase_id || ph.id) === pid)
    for (const d of ph.days || []) { const c = (d.session?.cards || []).find((x) => x.block === block); if (c) return c; }
  return null;
};

const foundWarm = phaseCards('foundation', 'warm_up');
const foundCool = phaseCards('foundation', 'cool_down');
if (foundWarm) check(/heal|pain-free|not stretch|no.*stretch|comfortabl/.test(txt(foundWarm)), 'Foundation warm-up must protect healing tissue (no early stretch)');
if (foundCool) {
  check(/sleep|protein|hydrat/.test(txt(foundCool)), 'Foundation cooldown must include holistic recovery (sleep/protein/hydration)');
  check(/no aggressive|not.*stretch|gentle|healing/.test(txt(foundCool)), 'Foundation cooldown must NOT prescribe aggressive stretch of the healing muscle');
}
const simWarm = phaseCards('simulation', 'warm_up');
if (simWarm) check(/potentiat|acceleration|sport|plyo/.test(txt(simWarm)), 'Simulation warm-up must include sport-specific potentiation');

console.log(`sessions checked: ${sessions} across phases: ${[...phasesSeen].join(', ')}`);
console.log(failed ? '\n✗ RF WARM-UP / COOLDOWN TEST FAILED\n' : '\n✓ RF WARM-UP / COOLDOWN TEST PASSED (every session bookended; phase-appropriate clinical logic)\n');
if (failed) process.exit(1);
