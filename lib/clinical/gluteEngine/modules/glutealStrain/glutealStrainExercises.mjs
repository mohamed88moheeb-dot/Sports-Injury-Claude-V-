/**
 * lib/clinical/gluteEngine/modules/glutealStrain/glutealStrainExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for acute gluteal (gluteus maximus/medius/minimus) muscle
 * strains. 4-stage functional model: protect -> restore_movement ->
 * build_strength -> return_to_sport. dosage_by_tier = [early, mid, late].
 * ---------------------------------------------------------------------------
 */

export const GLUTEAL_STRAIN_EXERCISES = [
  // ═══ protect ═══════════════════════════════════════════════════════════
  {
    id: 'GL-EX-001', name: 'Pain-free isometric glute squeeze', block: 'tissue_specific_loading', phase: 'protect',
    purpose: 'Gentle activation without moving through range.',
    why: 'Isometric activation maintains neural drive without stressing the healing muscle through range.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '3', hold: '10 s', intensity: 'gentle' }, { sets: '3', hold: '15-20 s' }, { sets: '4', hold: '20-30 s' }],
    instructions: ['Lying on your back or standing, gently squeeze the buttock muscles, hold, release.'],
    regression: 'lower effort', progression: 'GL-EX-010',
    cautions: ['Keep effort pain-free.'],
  },
  {
    id: 'GL-EX-002', name: 'Protected walking (short stride)', block: 'control_balance', phase: 'protect',
    purpose: 'Restore safe walking without stressing the healing glute.',
    why: 'A shorter stride reduces gluteal strain during early walking.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'walk with a shorter, comfortable stride' }, { sets: '—', detail: 'increase distance as tolerated' }, { sets: '—', detail: 'walking without a limp' }],
    instructions: ['Take shorter, even steps; avoid long strides that stretch the buttock forcefully.'],
    regression: 'crutches/reduced distance', progression: 'GL-EX-011',
    cautions: ['See a clinician if you cannot bear any weight at all.'],
  },
  {
    id: 'GL-EX-003', name: 'Pain-free hip mobility (gentle)', block: 'mobility_activation', phase: 'protect',
    purpose: 'Maintain comfortable hip range without provoking the glute.',
    why: 'Gentle mobility work prevents stiffness without loading the healing tissue.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', detail: 'gentle pain-free hip circles, 8-10 each' }, { sets: '3', detail: '10-12' }, { sets: '3', detail: '12-15' }],
    instructions: ['Lying or standing, move the hip gently through a comfortable range.'],
    regression: 'smaller range', progression: 'GL-EX-012',
    cautions: [],
  },
  {
    id: 'GL-EX-004', name: 'Elevation + gentle compression routine', block: 'conditioning', phase: 'protect',
    purpose: 'Support swelling/bruising reduction between active sessions.',
    why: 'Rest assists early settling for higher-grade strains.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'rest in a comfortable position, several times daily' }, { sets: '—', detail: 'as needed' }, { sets: '—', detail: 'as needed' }],
    instructions: ['Rest in a comfortable position, avoiding prolonged sitting directly on the sore area.'],
    regression: 'more frequent rest', progression: 'less needed as swelling settles',
    cautions: [],
  },
  {
    id: 'GL-EX-005', name: 'Core activation (dead bug)', block: 'strength_support', phase: 'protect',
    purpose: 'Keep the surrounding core/pelvic chain active without loading the glute directly.',
    why: 'Gentle core activation supports pelvic control while the gluteal muscle heals.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Lying on your back, slowly extend opposite arm/leg while keeping the trunk still.'],
    regression: 'smaller range', progression: 'GL-EX-013',
    cautions: [],
  },

  // ═══ restore_movement ══════════════════════════════════════════════════
  {
    id: 'GL-EX-010', name: 'Standing hip extension against light resistance', block: 'tissue_specific_loading', phase: 'restore_movement',
    purpose: 'Rebuild gluteus maximus strength in a controlled way.',
    why: 'Progressive resisted loading builds capacity once the acute phase has settled.',
    equipment: ['band'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Attach a band at ankle height, extend the leg backward against resistance, return slowly.'],
    regression: 'GL-EX-001', progression: 'GL-EX-020',
    cautions: ['Eccentric (return) should stay controlled and pain-free.'],
  },
  {
    id: 'GL-EX-011', name: 'Standing hip abduction against light resistance', block: 'tissue_specific_loading', phase: 'restore_movement',
    purpose: 'Rebuild gluteus medius/minimus strength.',
    why: 'Progressive abduction loading rebuilds the hip-stabilising glute muscles.',
    equipment: ['band'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Band around the ankles, lift the leg out to the side against resistance, return slowly.'],
    regression: 'GL-EX-003', progression: 'GL-EX-021',
    cautions: [],
  },
  {
    id: 'GL-EX-012', name: 'Glute bridge (double-leg)', block: 'strength_support', phase: 'restore_movement',
    purpose: 'Rebuild gluteus maximus strength in a functional pattern.',
    why: 'Bridging is a foundational gluteal strengthening exercise.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Lying on your back, knees bent, lift the hips, squeeze the glutes, lower slowly.'],
    regression: 'GL-EX-005', progression: 'GL-EX-022',
    cautions: [],
  },
  {
    id: 'GL-EX-013', name: 'Stationary cycling (light)', block: 'conditioning', phase: 'restore_movement',
    purpose: 'Maintain conditioning without high gluteal demand.',
    why: 'Non-impact conditioning keeps fitness up while the muscle continues healing.',
    equipment: ['bike'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: '5-10 min light' }, { sets: '—', detail: '10-15 min' }, { sets: '—', detail: '15-20 min' }],
    instructions: ['Keep resistance light and pain-free.'],
    regression: 'shorter duration', progression: 'add resistance',
    cautions: [],
  },

  // ═══ build_strength ════════════════════════════════════════════════════
  {
    id: 'GL-EX-020', name: 'Single-leg glute bridge', block: 'tissue_specific_loading', phase: 'build_strength',
    purpose: 'Build single-leg gluteus maximus strength and symmetry.',
    why: 'Closing the single-leg strength gap is needed before running/jumping loads.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Bridge on one leg, keeping the pelvis level, lower slowly.'],
    regression: 'GL-EX-012', progression: 'GL-EX-030',
    cautions: [],
  },
  {
    id: 'GL-EX-021', name: 'Side-lying clamshell / hip abduction', block: 'strength_support', phase: 'build_strength',
    purpose: 'Build gluteus medius/minimus strength directly.',
    why: 'Direct hip-abductor strengthening supports pelvic stability in gait and running.',
    equipment: ['band'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '12 each' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Side-lying, knees bent, open the top knee like a clamshell against band resistance.'],
    regression: 'GL-EX-011', progression: 'GL-EX-031',
    cautions: [],
  },
  {
    id: 'GL-EX-022', name: 'Bulgarian split squat / step-up', block: 'strength_support', phase: 'build_strength',
    purpose: 'Functional single-leg strength through the hip and glute.',
    why: 'Functional single-leg strength work builds capacity for sport movement patterns.',
    equipment: ['bodyweight', 'bench'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', depth: 'shallow' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each', depth: 'deeper' }],
    instructions: ['Rear foot elevated or a step-up, lower under control, drive through the front heel.'],
    regression: 'GL-EX-013', progression: 'GL-EX-032',
    cautions: [],
  },
  {
    id: 'GL-EX-023', name: 'Single-leg balance', block: 'control_balance', phase: 'build_strength',
    purpose: 'Rebuild single-leg control before higher loads.',
    why: 'Balance work supports efficient load distribution through the hip and pelvis.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s' }, { sets: '4', hold: '45 s' }],
    instructions: ['Stand on the injured leg only, keep the hips level.'],
    regression: 'hold support', progression: 'GL-EX-033',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'GL-EX-030', name: 'Jogging build-up (straight line)', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce running load progressively.',
    why: 'Graded running exposure precedes sprinting and cutting.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% effort, straight-line' }, { sets: '—', detail: '70-80% effort' }, { sets: '—', detail: '80% with strides' }],
    instructions: ['Build pace over the session, stay pain-free.'],
    regression: 'walk-jog intervals', progression: 'GL-EX-031',
    cautions: [],
  },
  {
    id: 'GL-EX-031', name: 'Accelerated sprint build-up', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Expose the glute to high-speed running demands.',
    why: 'Sprinting and sudden deceleration are the highest gluteal demand before return to sport.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'accelerations 80-90%' }, { sets: '—', detail: 'near-max sprints' }, { sets: '—', detail: 'max sprint volume' }],
    instructions: ['Progress effort across sessions, keeping mechanics clean.'],
    regression: 'GL-EX-030', progression: 'GL-EX-033',
    cautions: ['Only after pain-free strength and jogging.'],
  },
  {
    id: 'GL-EX-032', name: 'Change-of-direction / deceleration drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Sport-specific cutting and deceleration exposure.',
    why: 'Cutting and deceleration load the glute eccentrically at speed — a common re-injury scenario.',
    equipment: ['bodyweight', 'cones'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'planned wide-angle cuts' }, { sets: '—', detail: 'sharper / faster cuts' }, { sets: '—', detail: 'reactive cutting' }],
    instructions: ['Progress from planned to reactive change-of-direction.'],
    regression: 'GL-EX-022', progression: 'reactive game drills',
    cautions: [],
  },
  {
    id: 'GL-EX-033', name: 'Return-to-sport criteria battery', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate before full return: glute strength symmetry + pain-free sprinting/cutting.',
    why: 'Criteria-based return with maintained glute strength work reduces re-injury risk.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'hip extension/abduction strength symmetry' }, { sets: '—', detail: 'pain-free cutting' }, { sets: '—', detail: 'all symmetric + pain-free sprinting/cutting' }],
    instructions: ['Confirm glute strength symmetry and pain-free sprinting/cutting before full return.'],
    cautions: ['Keep an ongoing glute strength habit — it is protective against recurrence.'],
  },
];

/** Pool for a given stage. */
export function glutealStrainPool(stageId) {
  return GLUTEAL_STRAIN_EXERCISES.filter((e) => e.phase === stageId);
}
