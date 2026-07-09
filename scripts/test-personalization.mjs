/**
 * scripts/test-personalization.mjs
 * Proves deficit-emphasis personalization + criteria-based progression.
 */
import { normalizeDeficitProfile, deficitEmphasisTilts, applyEmphasisTilts, personalizeEmphasis } from '../lib/clinical/core/deficitEmphasis.mjs';
import { autoRegulate, canAdvanceTier, canExitPhase } from '../lib/clinical/core/progression.mjs';
import { PHASE_BLOCK_MATRIX } from '../lib/clinical/core/sessionArchitecture.mjs';

let failed = false;
const check = (cond, msg) => { if (!cond) { failed = true; console.log(`   ✗ ${msg}`); } };

// ── Two identical-grade athletes, different deficits → different sessions ──
const athleteA = { single_leg_control: 'cannot', weakness_or_giving_way: 'none', movement_confidence: 'confident' };
const athleteB = { single_leg_control: 'yes_pain_free', weakness_or_giving_way: 'marked', movement_confidence: 'low' };

const pA = personalizeEmphasis('accumulation', athleteA);
const pB = personalizeEmphasis('accumulation', athleteB);

check(pA.emphasis.motor_control > PHASE_BLOCK_MATRIX.accumulation.motor_control, 'Athlete A (poor control) should get MORE motor-control emphasis');
check(pB.emphasis.strength_support >= PHASE_BLOCK_MATRIX.accumulation.strength_support, 'Athlete B (weak) should keep/raise strength emphasis');
check(JSON.stringify(pA.emphasis) !== JSON.stringify(pB.emphasis), 'Same phase, same grade, different deficits → DIFFERENT sessions');
check(pB.progression.pace !== 'normal', 'Athlete B (low confidence) should progress more cautiously');

// ── Hard safety gate: deficits cannot switch sport on in an early phase ──
const early = personalizeEmphasis('foundation', { sprint_tolerance: 'ok', single_leg_control: 'poor' });
check(early.emphasis.sport_reintegration === 0, 'Sport must stay OFF in foundation regardless of deficits');

// ── Irritability caps volume ──
const irritable = deficitEmphasisTilts(normalizeDeficitProfile({ next_day_response: 'much_worse' }));
check(irritable.doseCaps.session_volume === 'reduced', 'High irritability should cap session volume');
check(irritable.progression.pace === 'slow', 'High irritability should slow progression');

// ── Auto-regulation: regress on flare, hold on worse, progress on better ──
check(autoRegulate('much_worse').regress === true, 'Flare must regress load');
check(autoRegulate('much_worse').progressionEligible === false, 'Flare must block progression');
check(autoRegulate('worse').action === 'hold', 'Worse should hold');
check(autoRegulate('better').progressionEligible === true, 'Better should allow progression');

// ── Tier advance is earned, not timed ──
check(canAdvanceTier({ currentTier: 0, sessionPainVas: 5, recentFlare: false, toleratingCurrentLoad: true, sessionsAtTier: 3 }).advance === false, 'High pain must block tier advance');
check(canAdvanceTier({ currentTier: 0, sessionPainVas: 2, recentFlare: false, toleratingCurrentLoad: true, sessionsAtTier: 1 }).advance === false, 'One good session is not enough to advance');
check(canAdvanceTier({ currentTier: 0, sessionPainVas: 2, recentFlare: false, toleratingCurrentLoad: true, sessionsAtTier: 3 }).advance === true, 'Meeting all criteria should advance');

// ── Phase exit is criteria-based + governance-capped ──
const accOk = canExitPhase('accumulation', { strengthSymmetryPct: 88, jogOk: true });
check(accOk.canExit === true, 'Accumulation should exit when symmetry ≥85% and jog OK');
const transBlocked = canExitPhase('accumulation', { strengthSymmetryPct: 88, jogOk: true, clinicianCleared: false });
check(transBlocked.clearanceRequired === true, 'Crossing into transition needs clinician clearance');
const foundBlocked = canExitPhase('foundation', { painFreeFullRom: false, isoOk: false });
check(foundBlocked.canExit === false, 'Foundation should not exit without pain-free ROM + isometric tolerance');

console.log(failed ? '\n✗ PERSONALIZATION TESTS FAILED\n' : '\n✓ PERSONALIZATION TESTS PASSED (deficit-emphasis + criteria-based progression)\n');
if (!failed) {
  console.log('Athlete A (poor single-leg control) accumulation emphasis:', JSON.stringify(pA.emphasis));
  console.log('Athlete B (marked weakness, low confidence)              :', JSON.stringify(pB.emphasis));
}
if (failed) process.exit(1);
