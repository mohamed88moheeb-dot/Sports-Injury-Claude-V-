/**
 * lib/clinical/groinEngine/modules/adductorStrain/adductorStrainExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for acute adductor (groin) muscle strains.
 * 4-stage functional model: protect -> restore_movement -> build_strength ->
 * return_to_sport. dosage_by_tier = [early, mid, late]. All beta_default.
 * ---------------------------------------------------------------------------
 */

export const ADDUCTOR_STRAIN_EXERCISES = [
  // ═══ protect ═══════════════════════════════════════════════════════════
  {
    id: 'AD-EX-001', name: 'Pain-free hip adduction isometric (mid-range)', block: 'tissue_specific_loading', phase: 'protect',
    purpose: 'Gentle activation without moving through range.',
    why: 'Isometric activation maintains neural drive without stressing the healing muscle through range (Serner 2015).',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '3', hold: '10 s', intensity: 'gentle' }, { sets: '3', hold: '15-20 s' }, { sets: '4', hold: '20-30 s' }],
    instructions: ['Lying down, gently squeeze a small pillow or cushion between the knees, hold, release.'],
    regression: 'lower effort', progression: 'AD-EX-010',
    cautions: ['Keep effort pain-free.'],
  },
  {
    id: 'AD-EX-002', name: 'Protected walking (short stride)', block: 'control_balance', phase: 'protect',
    purpose: 'Restore safe walking without stressing the healing adductor.',
    why: 'A shorter stride reduces adductor strain during early walking.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'walk with a shorter, comfortable stride' }, { sets: '—', detail: 'increase distance as tolerated' }, { sets: '—', detail: 'walking without a limp' }],
    instructions: ['Take shorter, even steps; avoid wide lunging strides.'],
    regression: 'crutches/reduced distance', progression: 'AD-EX-011',
    cautions: ['See a clinician if you cannot bear any weight at all.'],
  },
  {
    id: 'AD-EX-003', name: 'Pain-free hip mobility (gentle circles)', block: 'mobility_activation', phase: 'protect',
    purpose: 'Maintain comfortable hip range without provoking the adductor.',
    why: 'Gentle mobility work prevents stiffness without loading the healing tissue.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', detail: 'gentle pain-free hip circles, 8-10 each direction' }, { sets: '3', detail: '10-12' }, { sets: '3', detail: '12-15' }],
    instructions: ['Lying or standing, move the hip gently through a comfortable range.'],
    regression: 'smaller range', progression: 'AD-EX-012',
    cautions: [],
  },
  {
    id: 'AD-EX-004', name: 'Elevation + gentle compression routine', block: 'conditioning', phase: 'protect',
    purpose: 'Support swelling/bruising reduction between active sessions.',
    why: 'Elevation and gentle compression assist early swelling control for higher-grade strains.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'rest with the leg supported, several times daily' }, { sets: '—', detail: 'as needed' }, { sets: '—', detail: 'as needed' }],
    instructions: ['Rest in a comfortable position, especially in the first few days.'],
    regression: 'more frequent rest', progression: 'less needed as swelling settles',
    cautions: [],
  },
  {
    id: 'AD-EX-005', name: 'Core/glute activation (bridge)', block: 'strength_support', phase: 'protect',
    purpose: 'Keep the surrounding hip/core chain active without loading the adductor directly.',
    why: 'Gentle core and glute activation supports pelvic control while the adductor heals.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10' }, { sets: '3', reps: '10-12' }, { sets: '3', reps: '12-15' }],
    instructions: ['Lying on your back, knees bent, gently lift the hips, lower slowly.'],
    regression: 'smaller range', progression: 'AD-EX-013',
    cautions: [],
  },

  // ═══ restore_movement ══════════════════════════════════════════════════
  {
    id: 'AD-EX-010', name: 'Standing hip adduction against light resistance', block: 'tissue_specific_loading', phase: 'restore_movement',
    purpose: 'Rebuild adductor strength in a controlled, gradeable way.',
    why: 'Progressive resisted loading builds capacity once the acute phase has settled.',
    equipment: ['band'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Attach a band at ankle height, pull the leg across the body against resistance, return slowly.'],
    regression: 'AD-EX-001', progression: 'AD-EX-020',
    cautions: ['Eccentric (return) should stay controlled and pain-free.'],
  },
  {
    id: 'AD-EX-011', name: 'Isometric adductor squeeze (ball/pillow, progressive)', block: 'tissue_specific_loading', phase: 'restore_movement',
    purpose: 'Progress the isometric squeeze with more effort and duration.',
    why: 'Progressive isometric loading is a core early strengthening step in adductor rehab.',
    equipment: ['bodyweight', 'ball'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '3', hold: '15-20 s, moderate effort' }, { sets: '3', hold: '20-30 s' }, { sets: '4', hold: '30 s, firmer squeeze' }],
    instructions: ['Squeeze a ball or cushion between the knees with increasing effort, hold, release.'],
    regression: 'AD-EX-001', progression: 'AD-EX-010',
    cautions: [],
  },
  {
    id: 'AD-EX-012', name: 'Side-lying hip abduction/adduction control', block: 'strength_support', phase: 'restore_movement',
    purpose: 'Build control through both abduction and adduction ranges.',
    why: 'Balanced abductor/adductor strength supports pelvic and hip stability.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-005'],
    dosage_by_tier: [{ sets: '2-3', reps: '10 each direction' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15' }],
    instructions: ['Lying on your side, raise and lower the top leg slowly, then the bottom leg toward it.'],
    regression: 'AD-EX-003', progression: 'AD-EX-021',
    cautions: [],
  },
  {
    id: 'AD-EX-013', name: 'Stationary cycling (light)', block: 'conditioning', phase: 'restore_movement',
    purpose: 'Maintain conditioning without high adductor demand.',
    why: 'Non-impact conditioning keeps fitness up while the muscle continues healing.',
    equipment: ['bike'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: '5-10 min light, seat higher' }, { sets: '—', detail: '10-15 min' }, { sets: '—', detail: '15-20 min' }],
    instructions: ['Keep resistance light and the stance narrow and pain-free.'],
    regression: 'shorter duration', progression: 'add resistance',
    cautions: [],
  },

  // ═══ build_strength ════════════════════════════════════════════════════
  {
    id: 'AD-EX-020', name: 'Copenhagen plank (knee-supported regression)', block: 'tissue_specific_loading', phase: 'build_strength',
    purpose: 'Introduce the validated eccentric adductor-strengthening exercise in its easiest form.',
    why: 'The Copenhagen adduction exercise produces large eccentric adductor strength gains (Ishoi 2016); this regression starts with the bottom knee supported.',
    equipment: ['bench'], source_refs: ['GROIN-CIT-005'],
    dosage_by_tier: [{ sets: '2-3', reps: '6-8', detail: 'knee-supported regression' }, { sets: '3', reps: '8-10' }, { sets: '3', reps: '10-12' }],
    instructions: ['Top leg on a bench, bottom knee bent and resting on the floor for support, lift the hips and hold, lower slowly.'],
    regression: 'AD-EX-010', progression: 'AD-EX-030',
    cautions: ['Progress toward the full straight-leg version only once this is pain-free.'],
  },
  {
    id: 'AD-EX-021', name: 'Single-leg standing adduction (cable/band)', block: 'strength_support', phase: 'build_strength',
    purpose: 'Build single-leg adductor strength and symmetry.',
    why: 'Closing the single-leg adductor strength gap is needed before running/cutting loads.',
    equipment: ['band', 'cable'], source_refs: ['GROIN-CIT-002', 'GROIN-CIT-005'],
    dosage_by_tier: [{ sets: '2-3', reps: '10' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15', load: 'heavier' }],
    instructions: ['Standing on the uninjured leg, pull the injured leg across the body against resistance.'],
    regression: 'AD-EX-010', progression: 'AD-EX-031',
    cautions: [],
  },
  {
    id: 'AD-EX-022', name: 'Lateral lunge / side-step with adduction return', block: 'strength_support', phase: 'build_strength',
    purpose: 'Functional adductor loading in a lateral movement pattern.',
    why: 'Lateral loading patterns rehearse the demand of cutting sports.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side', depth: 'shallow' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each', depth: 'deeper' }],
    instructions: ['Step wide to one side, sit into the hip, push back to standing, controlled throughout.'],
    regression: 'AD-EX-012', progression: 'AD-EX-032',
    cautions: [],
  },
  {
    id: 'AD-EX-023', name: 'Single-leg balance (firm surface)', block: 'control_balance', phase: 'build_strength',
    purpose: 'Rebuild single-leg control before higher loads.',
    why: 'Balance work supports efficient load distribution through the hip and pelvis.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s' }, { sets: '4', hold: '45 s' }],
    instructions: ['Stand on the injured leg only, keep the hips level.'],
    regression: 'hold support', progression: 'AD-EX-033',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'AD-EX-030', name: 'Copenhagen plank (full straight-leg)', block: 'tissue_specific_loading', phase: 'return_to_sport',
    purpose: 'Full eccentric adductor strength for sport demands.',
    why: 'The full Copenhagen adduction exercise produces substantial eccentric strength gains, protective against re-injury (Ishoi 2016).',
    equipment: ['bench'], source_refs: ['GROIN-CIT-005'],
    dosage_by_tier: [{ sets: '3', reps: '6-8' }, { sets: '3', reps: '8-10' }, { sets: '3-4', reps: '10-12' }],
    instructions: ['Both legs straight, top leg on the bench, lift the hips and hold, lower slowly with control.'],
    regression: 'AD-EX-020', progression: 'maintain ongoing',
    cautions: [],
  },
  {
    id: 'AD-EX-031', name: 'Jogging build-up (straight line)', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce running load progressively.',
    why: 'Graded running exposure precedes cutting and kicking.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% effort, straight-line' }, { sets: '—', detail: '70-80% effort' }, { sets: '—', detail: '80% with strides' }],
    instructions: ['Build pace over the session, stay pain-free.'],
    regression: 'walk-jog intervals', progression: 'AD-EX-032',
    cautions: [],
  },
  {
    id: 'AD-EX-032', name: 'Change-of-direction / cutting drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Sport-specific cutting exposure — the classic re-injury scenario.',
    why: 'Change-of-direction is a leading mechanism for adductor strain, so it is progressed carefully before full return (Serner 2015).',
    equipment: ['bodyweight', 'cones'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'planned wide-angle cuts' }, { sets: '—', detail: 'sharper / faster cuts' }, { sets: '—', detail: 'reactive cutting' }],
    instructions: ['Progress from planned to reactive change-of-direction.'],
    regression: 'AD-EX-022', progression: 'AD-EX-033',
    cautions: [],
  },
  {
    id: 'AD-EX-033', name: 'Kicking / sport-specific skill loading', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce kicking or sport-specific adductor-demanding skills.',
    why: 'Kicking is a leading mechanism for adductor strain and needs its own graded reintroduction (Serner 2015).',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'light, controlled kicking volume' }, { sets: '—', detail: 'rising volume/power' }, { sets: '—', detail: 'match-intensity kicking' }],
    instructions: ['Build kicking power and volume gradually across sessions.'],
    regression: 'reduce power/volume', progression: 'AD-EX-034',
    cautions: [],
  },
  {
    id: 'AD-EX-034', name: 'Return-to-sport criteria battery', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate before full return: adductor strength symmetry + pain-free cutting/kicking.',
    why: 'Criteria-based return with maintained adductor strength work reduces re-injury risk (Ishoi 2016).',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-002', 'GROIN-CIT-005'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'resisted adduction strength symmetry' }, { sets: '—', detail: 'pain-free cutting' }, { sets: '—', detail: 'all symmetric + pain-free kicking/cutting' }],
    instructions: ['Confirm adductor strength symmetry and pain-free cutting/kicking before full return.'],
    cautions: ['Keep an ongoing Copenhagen-plank strength habit — it is protective against recurrence.'],
  },
];

/** Pool for a given stage. */
export function adductorStrainPool(stageId) {
  return ADDUCTOR_STRAIN_EXERCISES.filter((e) => e.phase === stageId);
}
