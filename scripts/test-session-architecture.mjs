/**
 * scripts/test-session-architecture.mjs
 * Asserts the clinical invariants of the 7-block session model.
 */
import {
  BLOCK_IDS, PHASES, PHASE_BLOCK_MATRIX, MAIN_LOADING_MODE,
  sessionSkeletonForPhase, isBlockPresent,
} from '../lib/clinical/core/sessionArchitecture.mjs';

let failed = false;
const check = (cond, msg) => { if (!cond) { failed = true; console.log(`   ✗ ${msg}`); } };

// 1. Every phase defines an emphasis for every block.
for (const p of PHASES) {
  const row = PHASE_BLOCK_MATRIX[p];
  for (const b of BLOCK_IDS) check(typeof row[b] === 'number', `${p}.${b} missing emphasis`);
}

// 2. Warm-up and cooldown present in EVERY phase (never skip prep/recovery).
for (const p of PHASES) {
  check(isBlockPresent(p, 'warmup'), `${p}: warm-up must be present`);
  check(isBlockPresent(p, 'cooldown'), `${p}: cooldown must be present`);
}

// 3. Sport reintegration ABSENT in foundation & reload, PRESENT from accumulation on.
check(!isBlockPresent('foundation', 'sport_reintegration'), 'sport must be absent in foundation');
check(!isBlockPresent('reload', 'sport_reintegration'), 'sport must be absent in reload');
for (const p of ['accumulation', 'transition', 'simulation', 'resilience'])
  check(isBlockPresent(p, 'sport_reintegration'), `sport must be present in ${p}`);

// 4. Sport emphasis is monotonic non-decreasing once it appears (accumulation→simulation).
const sportSeq = ['accumulation', 'transition', 'simulation'].map((p) => PHASE_BLOCK_MATRIX[p].sport_reintegration);
check(sportSeq[0] <= sportSeq[1] && sportSeq[1] <= sportSeq[2], `sport emphasis should ramp up: ${sportSeq}`);

// 5. Every phase has at least one PRIMARY (emphasis 3) block — a clear focus.
for (const p of PHASES)
  check(Object.values(PHASE_BLOCK_MATRIX[p]).some((e) => e === 3), `${p}: needs a primary-focus block`);

// 6. Main-loading mode defined & progresses (foundation isometric → resilience maintenance).
check(MAIN_LOADING_MODE.foundation === 'isometric', 'foundation main-loading should be isometric');
check(MAIN_LOADING_MODE.accumulation === 'eccentric', 'accumulation main-loading should be eccentric');

// 7. Activation is the PRIMARY focus early (foundation), sport is primary late (simulation).
check(PHASE_BLOCK_MATRIX.foundation.activation === 3, 'activation should be primary in foundation');
check(PHASE_BLOCK_MATRIX.simulation.sport_reintegration === 3, 'sport should be primary in simulation');

// 8. Skeleton builder returns ordered present blocks with warm-up first, cooldown last.
for (const p of PHASES) {
  const sk = sessionSkeletonForPhase(p);
  check(sk[0].id === 'warmup', `${p}: first block should be warm-up`);
  check(sk[sk.length - 1].id === 'cooldown', `${p}: last block should be cooldown`);
}

console.log(failed ? '\n✗ SESSION ARCHITECTURE TESTS FAILED\n' : '\n✓ SESSION ARCHITECTURE TESTS PASSED (7 blocks, phase-sliding emphasis)\n');
// Show the matrix for the record.
console.log('phase        ' + BLOCK_IDS.map((b) => b.slice(0, 5)).join('  '));
for (const p of PHASES) console.log(p.padEnd(13) + BLOCK_IDS.map((b) => `  ${PHASE_BLOCK_MATRIX[p][b]}  `).join(' '));
if (failed) process.exit(1);
