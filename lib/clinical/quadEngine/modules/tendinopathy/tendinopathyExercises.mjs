/**
 * lib/clinical/quadEngine/modules/tendinopathy/tendinopathyExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for quad / patellar TENDINOPATHY (jumper's knee). This is a
 * LOADING LADDER, not a muscle-healing model:
 *   isometric -> isotonic/HSR -> energy_storage/eccentric -> return_to_sport
 *
 * Evidence:
 *   - isometric leg-extension/holds give immediate analgesia (Rio 2015,
 *     ~5x45 s at ~70% MVIC); best in-season short-term pain relief (Lim 2018)
 *   - heavy slow resistance (HSR) ~3-4 s up / 3-4 s down, heavy load, drives
 *     collagen turnover and long-term benefit (Kongsgaard 2009)
 *   - eccentric single-leg decline squat for long-term function (Lim 2018; Burton 2022)
 *   - inertial flywheel is an equivalent HSR alternative (Ruffino 2021)
 * Pain is monitored on the single-leg decline squat (0-10); <=3-5/10
 * acceptable provided it settles by next morning.
 *
 * Deepened library: ~26 exercises with multiple options per ladder stage,
 * home/gym variants, and criteria-based return. dosage_by_tier = [early, mid, late].
 * ---------------------------------------------------------------------------
 */

export const TENDINOPATHY_EXERCISES = [
  // ═══ Stage 1: isometric (settle pain) ════════════════════════════════════
  {
    id: 'TP-EX-001', name: 'Isometric leg extension hold', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'Reduce tendon pain and maintain quad strength.',
    why: 'Isometric holds give immediate analgesia for up to 45 min and increase strength (Rio 2015).',
    contraction: 'isometric', equipment: ['machine', 'gym'], source_refs: ['QUAD-CIT-007', 'QUAD-CIT-008'],
    dosage_by_tier: [{ sets: '5', hold: '30 s', intensity: '~60-70% effort', rest: '2 min' }, { sets: '5', hold: '45 s', intensity: '70% MVIC', rest: '2 min' }, { sets: '5', hold: '45 s', freq: '1-2x/day if painful' }],
    instructions: ['Hold the knee at ~60 degrees against a fixed resistance.', 'Push to a strong but pain-tolerable effort and hold steady.'],
    regression: 'lower effort / shorter hold', progression: 'TP-EX-010',
    cautions: ['Pain should not climb during the holds; ease effort if it does.'],
  },
  {
    id: 'TP-EX-002', name: 'Wall-sit isometric (home option)', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'Equipment-free isometric quad/tendon loading.',
    why: 'A practical isometric alternative when no machine is available (Rio 2015 principle).',
    contraction: 'isometric', equipment: ['wall'], source_refs: ['QUAD-CIT-007'],
    dosage_by_tier: [{ sets: '5', hold: '30 s' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Sit against a wall at ~60 degrees knee bend, hold.'],
    regression: 'shallower angle', progression: 'TP-EX-003',
    cautions: ['Adjust depth to keep pain tolerable.'],
  },
  {
    id: 'TP-EX-003', name: 'Spanish squat (band-resisted isometric)', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'Knee-biased isometric tendon loading with minimal hip drive.',
    why: 'Band-resisted wall isometric loads the tendon heavily with low movement demand; popular for jumper\'s knee (Burton 2022).',
    contraction: 'isometric', equipment: ['band'], source_refs: ['QUAD-CIT-010', 'QUAD-CIT-008'],
    dosage_by_tier: [{ sets: '4', hold: '30 s' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s', load: 'add vest' }],
    instructions: ['Loop a strong band behind the knees to a fixed post; sit back into it at ~70 deg and hold.'],
    regression: 'TP-EX-002', progression: 'add load',
    cautions: [],
  },
  {
    id: 'TP-EX-004', name: 'Single-leg isometric (advanced)', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'Progress isometric load to the affected leg alone.',
    why: 'Single-leg isometric increases load on the symptomatic tendon while keeping pain controlled.',
    contraction: 'isometric', equipment: ['machine', 'gym'], source_refs: ['QUAD-CIT-007'],
    dosage_by_tier: [{ sets: '5', hold: '30 s single-leg' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Perform the isometric hold on the injured leg only.'],
    regression: 'TP-EX-001 (double-leg)', progression: 'TP-EX-011',
    cautions: ['Only if pain stays tolerable.'],
  },
  {
    id: 'TP-EX-005', name: 'Isometric split-squat hold', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'A functional isometric variant that still limits movement demand.',
    why: 'Gives tendon-friendly analgesic loading in a more sport-like position for variety within the isometric stage.',
    contraction: 'isometric', equipment: ['bodyweight'], source_refs: ['QUAD-CIT-007'],
    dosage_by_tier: [{ sets: '5', hold: '30 s' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Hold a static split-squat position with the front knee at ~60 degrees.'],
    regression: 'TP-EX-002', progression: 'TP-EX-004',
    cautions: ['Ease depth if pain climbs.'],
  },

  // ═══ Stage 2: isotonic / heavy slow resistance ═══════════════════════════
  {
    id: 'TP-EX-010', name: 'Heavy slow resistance leg press', block: 'tissue_specific_loading', phase: 'isotonic_hsr',
    purpose: 'Build tendon load capacity with heavy, slow loading.',
    why: 'HSR improves pain, function and collagen turnover, with strong long-term results (Kongsgaard 2009).',
    contraction: 'isotonic_hsr', equipment: ['machine', 'gym'], source_refs: ['QUAD-CIT-009', 'QUAD-CIT-008'],
    dosage_by_tier: [{ sets: '4', reps: '15', tempo: '3 s up / 3 s down', freq: '3x/week' }, { sets: '4', reps: '12', tempo: '3-4 s each way', load: 'heavier' }, { sets: '4', reps: '8', tempo: '3-4 s each way', load: 'heavy' }],
    instructions: ['Press slowly: 3-4 seconds up, 3-4 seconds down, full control.'],
    regression: 'TP-EX-001', progression: 'TP-EX-011',
    cautions: ['Decline-squat pain should stay <=3-5/10 and settle by morning.'],
  },
  {
    id: 'TP-EX-011', name: 'Heavy slow resistance squat', block: 'strength_support', phase: 'isotonic_hsr',
    purpose: 'Functional heavy-slow tendon loading.',
    why: 'HSR squat is a core jumpers-knee loading exercise (Kongsgaard 2009).',
    contraction: 'isotonic_hsr', equipment: ['barbell', 'gym'], source_refs: ['QUAD-CIT-009'],
    dosage_by_tier: [{ sets: '4', reps: '15', tempo: '3 s/3 s' }, { sets: '4', reps: '10-12' }, { sets: '4', reps: '6-8', load: 'heavy' }],
    instructions: ['Squat to a tolerable depth with a slow, even tempo.'],
    regression: 'TP-EX-010', progression: 'TP-EX-013',
    cautions: ['Avoid deep ranges that sharply provoke the tendon early.'],
  },
  {
    id: 'TP-EX-012', name: 'Inertial flywheel squat (alternative)', block: 'strength_support', phase: 'isotonic_hsr',
    purpose: 'Flywheel loading as an HSR-equivalent option.',
    why: 'Flywheel training matched HSR outcomes at 12 weeks (Ruffino 2021).',
    contraction: 'isotonic_flywheel', equipment: ['flywheel_device', 'gym'], source_refs: ['QUAD-CIT-011'],
    dosage_by_tier: [{ sets: '3', reps: '8' }, { sets: '4', reps: '8' }, { sets: '4', reps: '8', load: 'higher inertia' }],
    instructions: ['Control the eccentric overload the flywheel produces on each rep.'],
    regression: 'TP-EX-010', progression: 'higher inertia',
    cautions: [],
  },
  {
    id: 'TP-EX-013', name: 'Heavy slow leg extension', block: 'tissue_specific_loading', phase: 'isotonic_hsr',
    purpose: 'Isolated heavy-slow loading of the knee extensors.',
    why: 'Open-chain HSR isolates the tendon load and complements squat/press.',
    contraction: 'isotonic_hsr', equipment: ['machine', 'gym'], source_refs: ['QUAD-CIT-009'],
    dosage_by_tier: [{ sets: '4', reps: '15', tempo: '3 s/3 s' }, { sets: '4', reps: '12' }, { sets: '4', reps: '8', load: 'heavy' }],
    instructions: ['Extend and lower slowly under heavy load through a tolerable range.'],
    regression: 'TP-EX-010', progression: 'single-leg',
    cautions: ['Limit terminal-range compression if provocative.'],
  },
  {
    id: 'TP-EX-014', name: 'HSR split squat (single-leg)', block: 'strength_support', phase: 'isotonic_hsr',
    purpose: 'Single-leg heavy-slow loading and symmetry.',
    why: 'Loads the affected tendon directly while building single-leg capacity.',
    contraction: 'isotonic_hsr', equipment: ['dumbbell', 'gym'], source_refs: ['QUAD-CIT-009', 'QUAD-CIT-016'],
    dosage_by_tier: [{ sets: '3', reps: '10 each', tempo: 'slow' }, { sets: '4', reps: '8 each' }, { sets: '4', reps: '6 each', load: 'heavy' }],
    instructions: ['Slow, controlled split squats on the injured side.'],
    regression: 'TP-EX-011', progression: 'add load',
    cautions: [],
  },

  // ═══ Stage 3: energy storage / eccentric ═════════════════════════════════
  {
    id: 'TP-EX-020', name: 'Single-leg decline squat (eccentric emphasis)', block: 'tissue_specific_loading', phase: 'energy_storage',
    purpose: 'Long-term tendon remodeling and the standard monitoring exercise.',
    why: 'The single-leg decline squat is the most-used eccentric exercise and the pain-monitoring test (Lim 2018; Burton 2022).',
    contraction: 'eccentric', equipment: ['decline_board'], source_refs: ['QUAD-CIT-008', 'QUAD-CIT-010'],
    dosage_by_tier: [{ sets: '3', reps: '10', tempo: 'slow lower', decline: '25 deg' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'added backpack' }],
    instructions: ['Stand on a 25-degree decline, lower slowly on the injured leg, return with both.'],
    regression: 'double-leg decline', progression: 'add load',
    cautions: ['Some pain (<=5/10) is acceptable if it settles by next morning.'],
  },
  {
    id: 'TP-EX-021', name: 'Progressive hopping / pogo', block: 'control_balance', phase: 'energy_storage',
    purpose: 'Re-introduce stretch-shortening (spring) load to the tendon.',
    why: 'Energy-storage loading bridges strength work to sport.',
    contraction: 'plyometric', equipment: ['bodyweight'], source_refs: ['QUAD-CIT-010'],
    dosage_by_tier: [{ sets: '3', reps: '10 low pogos' }, { sets: '3', reps: '10 single-leg' }, { sets: '4', reps: '12 reactive' }],
    instructions: ['Small, stiff, quiet hops; progress to single-leg as tolerated.'],
    regression: 'double-leg', progression: 'TP-EX-022',
    cautions: ['Only after HSR strength is established and pain is controlled.'],
  },
  {
    id: 'TP-EX-022', name: 'Countermovement & drop jumps', block: 'control_balance', phase: 'energy_storage',
    purpose: 'Higher-rate energy storage and release.',
    why: 'Builds tendon spring capacity for jumping sports.',
    contraction: 'plyometric', equipment: ['box'], source_refs: ['QUAD-CIT-010'],
    dosage_by_tier: [{ sets: '3', reps: '6 CMJ' }, { sets: '3', reps: '6 low drop' }, { sets: '4', reps: '8 drop jumps' }],
    instructions: ['Progress countermovement jumps to low drop jumps with crisp landings.'],
    regression: 'TP-EX-021', progression: 'TP-EX-030',
    cautions: ['Monitor decline-squat pain the next morning.'],
  },
  {
    id: 'TP-EX-023', name: 'Eccentric decline squat with load', block: 'tissue_specific_loading', phase: 'energy_storage',
    purpose: 'Progress eccentric tendon load with external resistance.',
    why: 'Added-load eccentric decline squat advances the classic protocol (Lim 2018).',
    contraction: 'eccentric', equipment: ['decline_board', 'dumbbell'], source_refs: ['QUAD-CIT-008'],
    dosage_by_tier: [{ sets: '3', reps: '12', load: 'light pack' }, { sets: '3', reps: '15', load: 'moderate' }, { sets: '3', reps: '15', load: 'heavier' }],
    instructions: ['Add load via backpack/vest, lowering slowly on the injured leg.'],
    regression: 'TP-EX-020', progression: 'tempo + load',
    cautions: [],
  },
  {
    id: 'TP-EX-024', name: 'Lateral & rotational hop control', block: 'control_balance', phase: 'energy_storage',
    purpose: 'Multidirectional energy-storage control.',
    why: 'Prepares the tendon for the multidirectional demands of sport.',
    contraction: 'plyometric', equipment: ['bodyweight'], source_refs: ['QUAD-CIT-010'],
    dosage_by_tier: [{ sets: '3', reps: '8 lateral' }, { sets: '3', reps: '10 lateral+rotational' }, { sets: '4', reps: '10 reactive' }],
    instructions: ['Hop side-to-side and with small rotations, sticking each landing.'],
    regression: 'linear hops', progression: 'reactive multidirectional',
    cautions: [],
  },

  // ═══ Stage 4: return to sport ════════════════════════════════════════════
  {
    id: 'TP-EX-030', name: 'Sport-specific jump & land progression', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Restore jumping/landing volume for return.',
    why: 'Graded energy-storage-and-release exposure before full sport.',
    contraction: 'plyometric', equipment: ['bodyweight'], source_refs: ['QUAD-CIT-010'],
    dosage_by_tier: [{ sets: '—', detail: 'controlled jump-land volume' }, { sets: '—', detail: 'add depth/height' }, { sets: '—', detail: 'sport jump volume' }],
    instructions: ['Build jump height, depth and volume across sessions, keeping landings controlled.'],
    regression: 'TP-EX-022', progression: 'full sport',
    cautions: ['Maintain isometric/HSR work alongside to keep pain settled.'],
  },
  {
    id: 'TP-EX-031', name: 'Maintenance HSR (anti-recurrence)', block: 'strength_support', phase: 'return_to_sport',
    purpose: 'Keep tendon load capacity high to prevent relapse.',
    why: 'Tendinopathy recurs without ongoing loading; maintenance is essential.',
    contraction: 'isotonic_hsr', equipment: ['gym'], source_refs: ['QUAD-CIT-009', 'QUAD-CIT-010'],
    dosage_by_tier: [{ sets: '3', reps: '8', freq: '2x/week' }, { sets: '3-4', reps: '6-8' }, { sets: '4', reps: '6', load: 'heavy' }],
    instructions: ['Keep at least 1-2 heavy-slow sessions per week through the season.'],
    regression: 'reduce load', progression: 'periodise with season',
    cautions: [],
  },
  {
    id: 'TP-EX-032', name: 'In-season load management + isometric pain control', block: 'tissue_specific_loading', phase: 'return_to_sport',
    purpose: 'Manage flare-ups during competition.',
    why: 'Isometrics control in-season pain without reducing strength (Rio 2015; Lim 2018).',
    contraction: 'isometric', equipment: ['gym', 'wall'], source_refs: ['QUAD-CIT-007', 'QUAD-CIT-008'],
    dosage_by_tier: [{ sets: '5', hold: '45 s pre-game if sore' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Use isometric holds before training/competition when symptoms rise.'],
    regression: 'reduce volume', progression: 'resume full loading',
    cautions: ['Reduce jump volume during flares.'],
  },
  {
    id: 'TP-EX-033', name: 'Return-to-sport criteria check (VISA-P + symmetry)', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: symptoms, strength, and jump symmetry.',
    why: 'Track VISA-P plus strength and hop symmetry; use both strength and hop tests (Thompson 2022; Nawasreh 2016).',
    contraction: 'test', equipment: ['bodyweight'], source_refs: ['QUAD-CIT-016', 'QUAD-CIT-017'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'VISA-P improving toward normal' }, { sets: '—', detail: 'quad strength symmetry' }, { sets: '—', detail: 'hop symmetry + low decline-squat pain' }],
    instructions: ['Confirm rising VISA-P, symmetric strength/hops, and controlled decline-squat pain before full return.'],
    cautions: ['Do not clear on hop symmetry alone.'],
  },
  {
    id: 'TP-EX-034', name: 'Sprint & multidirectional exposure', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Restore high-speed running and cutting demand on the tendon.',
    why: 'Sprinting and cutting load the extensor mechanism at the highest rates seen in sport — needed before full clearance.',
    contraction: 'dynamic', equipment: ['bodyweight', 'cones'], source_refs: ['QUAD-CIT-010'],
    dosage_by_tier: [{ sets: '—', detail: 'build-up accelerations + rounded cuts' }, { sets: '—', detail: 'near-max sprint + sharper cuts' }, { sets: '—', detail: 'reactive sprint/cutting' }],
    instructions: ['Progress sprint effort and cutting sharpness across sessions, monitoring next-day pain.'],
    regression: 'TP-EX-030', progression: 'full sport',
    cautions: ['Maintain isometric/HSR work alongside to keep pain settled.'],
  },
  {
    id: 'TP-EX-035', name: 'Full sport integration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full training and match/competition exposure once criteria are met.',
    why: 'Final return-to-performance step after strength, jump and pain criteria are satisfied.',
    contraction: 'dynamic', equipment: ['bodyweight'], source_refs: ['QUAD-CIT-010', 'QUAD-CIT-016'],
    dosage_by_tier: [{ sets: '—', detail: 'modified team training' }, { sets: '—', detail: 'full training' }, { sets: '—', detail: 'match/competition' }],
    instructions: ['Integrate into normal training once VISA-P, strength and hop criteria are met.'],
    regression: 'partial training', progression: 'full competition',
    cautions: ['Keep a maintenance loading habit ongoing — see TP-EX-031.'],
  },
];

export function tendinopathyPool(stageId) {
  return TENDINOPATHY_EXERCISES.filter((e) => e.phase === stageId);
}
