/**
 * lib/clinical/calfEngine/modules/achillesTendinopathy/achillesTendinopathyExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for Achilles tendinopathy (mid-portion / insertional
 * overuse pain). Same evidence-based loading ladder used for patellar
 * tendinopathy, applied to the Achilles:
 *   isometric -> isotonic/HSR -> energy_storage/eccentric -> return_to_sport
 * The Alfredson eccentric heel-drop protocol (CALF-CIT-002) is the classic
 * energy-storage-stage exercise for this tendon specifically.
 * ---------------------------------------------------------------------------
 */

export const ACHILLES_EXERCISES = [
  // ═══ isometric (settle pain) ══════════════════════════════════════════
  {
    id: 'AT-EX-001', name: 'Isometric calf raise hold (mid-range)', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'Reduce tendon pain and maintain calf strength.',
    why: 'Isometric holds give short-term analgesia and maintain strength, mirroring the patellar-tendon isometric protocol.',
    equipment: ['bodyweight', 'wall'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '5', hold: '30 s', intensity: '~60-70% effort' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s', freq: '1-2x/day if painful' }],
    instructions: ['Rise onto the toes to a comfortable mid-range height and hold, weight on both legs if needed.'],
    regression: 'lower effort / shorter hold', progression: 'AT-EX-010',
    cautions: ['Pain should not climb during the holds; ease effort if it does.'],
  },
  {
    id: 'AT-EX-002', name: 'Wall-push isometric (bent-knee, soleus-biased)', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'Isometric loading biased toward the soleus/lower tendon.',
    why: 'Bent-knee isometric loading targets the soleus portion, complementing straight-knee gastrocnemius-biased work.',
    equipment: ['wall'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '5', hold: '30 s' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Push into a wall with the knee bent, feeling tension through the lower calf/Achilles.'],
    regression: 'AT-EX-001', progression: 'AT-EX-011',
    cautions: [],
  },
  {
    id: 'AT-EX-003', name: 'Single-leg isometric (advanced)', block: 'tissue_specific_loading', phase: 'isometric',
    purpose: 'Progress isometric load to the affected leg alone.',
    why: 'Single-leg isometric increases load on the symptomatic tendon while keeping pain controlled.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '5', hold: '30 s single-leg' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Perform the isometric hold on the injured leg only.'],
    regression: 'AT-EX-001 (double-leg)', progression: 'AT-EX-010',
    cautions: ['Only if pain stays tolerable.'],
  },
  {
    id: 'AT-EX-004', name: 'Gentle ankle mobility (pain-free range)', block: 'mobility_activation', phase: 'isometric',
    purpose: 'Maintain comfortable ankle range alongside isometric loading.',
    why: 'Gentle mobility work prevents stiffness without provoking the tendon.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', detail: 'pain-free ankle pumps and circles' }, { sets: '3', detail: 'slightly larger range' }, { sets: '3', detail: 'full pain-free range' }],
    instructions: ['Move the ankle gently through its comfortable range.'],
    regression: 'smaller range', progression: 'AT-EX-013',
    cautions: [],
  },

  // ═══ isotonic_hsr (build capacity) ════════════════════════════════════
  {
    id: 'AT-EX-010', name: 'Heavy slow resistance calf raise', block: 'tissue_specific_loading', phase: 'isotonic_hsr',
    purpose: 'Build tendon load capacity with heavy, slow loading.',
    why: 'HSR improves pain, function and collagen turnover — the same mechanism shown for patellar tendinopathy, applied to the Achilles.',
    equipment: ['bodyweight', 'gym'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '4', reps: '15', tempo: '3 s up / 3 s down', freq: '3x/week' }, { sets: '4', reps: '12', tempo: '3-4 s each way', load: 'heavier' }, { sets: '4', reps: '8', tempo: '3-4 s each way', load: 'heavy' }],
    instructions: ['Rise and lower slowly: 3-4 seconds up, 3-4 seconds down, full control.'],
    regression: 'AT-EX-001', progression: 'AT-EX-011',
    cautions: ['Tendon pain should stay <=3-5/10 and settle by morning.'],
  },
  {
    id: 'AT-EX-011', name: 'Seated (bent-knee) heavy slow resistance raise', block: 'strength_support', phase: 'isotonic_hsr',
    purpose: 'HSR loading biased to the soleus.',
    why: 'Complements standing HSR by emphasising the soleus portion of the tendon complex.',
    equipment: ['bodyweight', 'bench'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '4', reps: '15', tempo: '3 s/3 s' }, { sets: '4', reps: '10-12' }, { sets: '4', reps: '8', load: 'heavy' }],
    instructions: ['Seated, knees bent, rise and lower slowly with load on the thighs.'],
    regression: 'AT-EX-002', progression: 'AT-EX-013',
    cautions: [],
  },
  {
    id: 'AT-EX-012', name: 'Single-leg HSR calf raise', block: 'tissue_specific_loading', phase: 'isotonic_hsr',
    purpose: 'Single-leg heavy-slow loading and symmetry.',
    why: 'Loads the affected tendon directly while building single-leg capacity.',
    equipment: ['bodyweight', 'dumbbell'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '10', tempo: 'slow' }, { sets: '4', reps: '8' }, { sets: '4', reps: '6', load: 'heavy' }],
    instructions: ['Slow, controlled single-leg raises on the injured side.'],
    regression: 'AT-EX-010', progression: 'AT-EX-020',
    cautions: [],
  },
  {
    id: 'AT-EX-013', name: 'Leg press / squat (calf-emphasis)', block: 'strength_support', phase: 'isotonic_hsr',
    purpose: 'General lower-limb strength to support the tendon.',
    why: 'Broader lower-limb strength supports overall load tolerance and running mechanics.',
    equipment: ['gym'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '12' }, { sets: '3', reps: '10' }, { sets: '4', reps: '8' }],
    instructions: ['Press or squat through a comfortable range, controlling the lowering phase.'],
    regression: 'AT-EX-011', progression: 'AT-EX-021',
    cautions: [],
  },

  // ═══ energy_storage (eccentric / spring) ══════════════════════════════
  {
    id: 'AT-EX-020', name: 'Alfredson eccentric heel drop (straight-knee)', block: 'tissue_specific_loading', phase: 'energy_storage',
    purpose: 'Long-term tendon remodeling via the classic eccentric protocol.',
    why: 'The Alfredson eccentric heel-drop protocol is the seminal, most-replicated Achilles tendinopathy exercise (Alfredson 1998).',
    equipment: ['step'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '15', tempo: 'slow lower', knee: 'straight' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'added backpack' }],
    instructions: ['Rise onto the toes with both feet on a step, shift weight to the injured leg, lower slowly past neutral, knee straight.'],
    regression: 'double-leg lowering', progression: 'add load',
    cautions: ['Some pain (<=5/10) is acceptable if it settles by next morning.'],
  },
  {
    id: 'AT-EX-021', name: 'Alfredson eccentric heel drop (bent-knee)', block: 'tissue_specific_loading', phase: 'energy_storage',
    purpose: 'Eccentric loading biased toward the soleus.',
    why: 'The bent-knee variant of the classic protocol targets the soleus portion of the Achilles complex.',
    equipment: ['step'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '15', knee: 'bent' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'added' }],
    instructions: ['Same as the straight-knee drop, but with the knee bent throughout.'],
    regression: 'AT-EX-013', progression: 'tempo + load',
    cautions: [],
  },
  {
    id: 'AT-EX-022', name: 'Progressive hopping / pogo', block: 'control_balance', phase: 'energy_storage',
    purpose: 'Re-introduce stretch-shortening (spring) load to the tendon.',
    why: 'Energy-storage loading bridges strength work to running/sport.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '10 low pogos' }, { sets: '3', reps: '10 single-leg' }, { sets: '4', reps: '12 reactive' }],
    instructions: ['Small, stiff, quiet hops; progress to single-leg as tolerated.'],
    regression: 'double-leg', progression: 'AT-EX-023',
    cautions: ['Only after HSR strength is established and pain is controlled.'],
  },
  {
    id: 'AT-EX-023', name: 'Countermovement & drop jumps', block: 'control_balance', phase: 'energy_storage',
    purpose: 'Higher-rate energy storage and release.',
    why: 'Builds tendon spring capacity for running and jumping sports.',
    equipment: ['box'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '6 CMJ' }, { sets: '3', reps: '6 low drop' }, { sets: '4', reps: '8 drop jumps' }],
    instructions: ['Progress countermovement jumps to low drop jumps with crisp landings.'],
    regression: 'AT-EX-022', progression: 'AT-EX-030',
    cautions: ['Monitor next-morning pain.'],
  },

  // ═══ return_to_sport ══════════════════════════════════════════════════
  {
    id: 'AT-EX-030', name: 'Sport-specific jump & land progression', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Restore jumping/landing volume for return.',
    why: 'Graded energy-storage-and-release exposure before full sport.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'controlled jump-land volume' }, { sets: '—', detail: 'add depth/height' }, { sets: '—', detail: 'sport jump volume' }],
    instructions: ['Build jump height, depth and volume across sessions, keeping landings controlled.'],
    regression: 'AT-EX-023', progression: 'full sport',
    cautions: ['Maintain isometric/HSR work alongside to keep pain settled.'],
  },
  {
    id: 'AT-EX-031', name: 'Running build-up (straight line)', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce running load progressively.',
    why: 'Graded running precedes higher-speed and cutting exposure.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% effort' }, { sets: '—', detail: '70-80% effort' }, { sets: '—', detail: '80%+ with strides' }],
    instructions: ['Build pace gradually; monitor next-morning tendon pain.'],
    regression: 'walk-jog', progression: 'AT-EX-030',
    cautions: [],
  },
  {
    id: 'AT-EX-032', name: 'Maintenance HSR (anti-recurrence)', block: 'strength_support', phase: 'return_to_sport',
    purpose: 'Keep tendon load capacity high to prevent relapse.',
    why: 'Tendinopathy recurs without ongoing loading; maintenance is essential.',
    equipment: ['gym'], source_refs: ['CALF-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '8', freq: '2x/week' }, { sets: '3-4', reps: '6-8' }, { sets: '4', reps: '6', load: 'heavy' }],
    instructions: ['Keep at least 1-2 heavy-slow sessions per week through the season.'],
    regression: 'reduce load', progression: 'periodise with season',
    cautions: [],
  },
  {
    id: 'AT-EX-033', name: 'Return-to-sport criteria check (VISA-A + symmetry)', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: symptoms, strength, and hop symmetry.',
    why: 'Track patient-reported outcome (VISA-A) plus strength/hop symmetry before full return.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-002', 'CALF-CIT-006'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'VISA-A improving toward normal' }, { sets: '—', detail: 'calf strength symmetry' }, { sets: '—', detail: 'hop symmetry + low next-day pain' }],
    instructions: ['Confirm rising VISA-A, symmetric strength/hops, and controlled next-day pain before full return.'],
    cautions: ['Do not clear on hop symmetry alone.'],
  },
];

/** Pool for a given stage. */
export function achillesPool(stageId) {
  return ACHILLES_EXERCISES.filter((e) => e.phase === stageId);
}
