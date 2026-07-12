/**
 * lib/clinical/hipFlexorEngine/modules/iliopsoasStrain/iliopsoasStrainExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for acute iliopsoas (hip flexor) muscle strains.
 * 4-stage functional model: protect -> restore_movement -> build_strength ->
 * return_to_sport. dosage_by_tier = [early, mid, late]. All beta_default.
 * ---------------------------------------------------------------------------
 */

export const ILIOPSOAS_STRAIN_EXERCISES = [
  // ═══ protect ═══════════════════════════════════════════════════════════
  {
    id: 'HF-EX-001', name: 'Pain-free isometric hip flexion (mid-range)', block: 'tissue_specific_loading', phase: 'protect',
    purpose: 'Gentle activation without moving through range.',
    why: 'Isometric activation maintains neural drive without stressing the healing muscle through range.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '3', hold: '10 s', intensity: 'gentle' }, { sets: '3', hold: '15-20 s' }, { sets: '4', hold: '20-30 s' }],
    instructions: ['Seated, gently lift the knee a small amount against your own resisting hand, hold, release.'],
    regression: 'lower effort', progression: 'HF-EX-010',
    cautions: ['Keep effort pain-free.'],
  },
  {
    id: 'HF-EX-002', name: 'Protected walking (short stride)', block: 'control_balance', phase: 'protect',
    purpose: 'Restore safe walking without stressing the healing hip flexor.',
    why: 'A shorter stride reduces hip-flexor strain during early walking.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'walk with a shorter, comfortable stride' }, { sets: '—', detail: 'increase distance as tolerated' }, { sets: '—', detail: 'walking without a limp' }],
    instructions: ['Take shorter, even steps; avoid long strides that pull the hip into extension.'],
    regression: 'crutches/reduced distance', progression: 'HF-EX-011',
    cautions: ['See a clinician if you cannot bear any weight at all.'],
  },
  {
    id: 'HF-EX-003', name: 'Pain-free hip mobility (gentle knee-to-chest)', block: 'mobility_activation', phase: 'protect',
    purpose: 'Maintain comfortable hip range without provoking the flexor.',
    why: 'Gentle mobility work prevents stiffness without loading the healing tissue.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', detail: 'gentle pain-free knee-to-chest, 8-10 reps' }, { sets: '3', detail: '10-12' }, { sets: '3', detail: '12-15' }],
    instructions: ['Lying down, gently bring one knee toward the chest within a comfortable range.'],
    regression: 'smaller range', progression: 'HF-EX-012',
    cautions: [],
  },
  {
    id: 'HF-EX-004', name: 'Elevation + gentle rest routine', block: 'conditioning', phase: 'protect',
    purpose: 'Support recovery between active sessions.',
    why: 'Rest and gentle positioning assist early settling, especially for higher-grade strains.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'rest in a comfortable position, several times daily' }, { sets: '—', detail: 'as needed' }, { sets: '—', detail: 'as needed' }],
    instructions: ['Rest with the hip in a comfortable, slightly flexed position early on.'],
    regression: 'more frequent rest', progression: 'less needed as pain settles',
    cautions: [],
  },
  {
    id: 'HF-EX-005', name: 'Core/glute activation (bridge)', block: 'strength_support', phase: 'protect',
    purpose: 'Keep the surrounding hip/core chain active without loading the flexor directly.',
    why: 'Gentle core and glute activation supports pelvic control while the hip flexor heals.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10' }, { sets: '3', reps: '10-12' }, { sets: '3', reps: '12-15' }],
    instructions: ['Lying on your back, knees bent, gently lift the hips, lower slowly.'],
    regression: 'smaller range', progression: 'HF-EX-013',
    cautions: [],
  },

  // ═══ restore_movement ══════════════════════════════════════════════════
  {
    id: 'HF-EX-010', name: 'Standing hip flexion against light resistance', block: 'tissue_specific_loading', phase: 'restore_movement',
    purpose: 'Rebuild hip flexor strength in a controlled, gradeable way.',
    why: 'Progressive resisted loading builds capacity once the acute phase has settled.',
    equipment: ['band'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Attach a band around the ankle, lift the knee up against resistance, return slowly.'],
    regression: 'HF-EX-001', progression: 'HF-EX-020',
    cautions: ['Eccentric (return) should stay controlled and pain-free.'],
  },
  {
    id: 'HF-EX-011', name: 'Seated marching (progressive)', block: 'tissue_specific_loading', phase: 'restore_movement',
    purpose: 'Progress isometric-to-dynamic hip flexion loading.',
    why: 'Seated marching bridges isometric holds to full dynamic hip flexion.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10 each' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15' }],
    instructions: ['Seated, lift one knee at a time in a marching motion, controlled tempo.'],
    regression: 'HF-EX-001', progression: 'HF-EX-010',
    cautions: [],
  },
  {
    id: 'HF-EX-012', name: 'Standing hip flexor stretch (gentle)', block: 'mobility_activation', phase: 'restore_movement',
    purpose: 'Restore comfortable length without provoking the healing muscle.',
    why: 'Gradual, pain-free stretch restores range as the acute phase settles.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2', hold: '15-20 s, gentle' }, { sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30 s' }],
    instructions: ['Half-kneeling, gently shift weight forward until a mild stretch is felt at the front of the hip.'],
    regression: 'HF-EX-003', progression: 'maintain ongoing',
    cautions: ['Stop well short of any pulling pain.'],
  },
  {
    id: 'HF-EX-013', name: 'Stationary cycling (light)', block: 'conditioning', phase: 'restore_movement',
    purpose: 'Maintain conditioning without high hip-flexor demand.',
    why: 'Non-impact conditioning keeps fitness up while the muscle continues healing.',
    equipment: ['bike'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: '5-10 min light' }, { sets: '—', detail: '10-15 min' }, { sets: '—', detail: '15-20 min' }],
    instructions: ['Keep resistance light and pain-free.'],
    regression: 'shorter duration', progression: 'add resistance',
    cautions: [],
  },

  // ═══ build_strength ════════════════════════════════════════════════════
  {
    id: 'HF-EX-020', name: 'Standing knee drive with band resistance', block: 'tissue_specific_loading', phase: 'build_strength',
    purpose: 'Build dynamic hip flexor power in a sport-relevant pattern.',
    why: 'Resisted knee drives rehearse the sprinting/kicking hip-flexion pattern under load.',
    equipment: ['band'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }, { sets: '4', reps: '12 each', load: 'stronger band' }],
    instructions: ['Band anchored behind you at hip height, drive the knee up and forward against resistance.'],
    regression: 'HF-EX-010', progression: 'HF-EX-030',
    cautions: [],
  },
  {
    id: 'HF-EX-021', name: 'Single-leg standing balance with hip flexion', block: 'control_balance', phase: 'build_strength',
    purpose: 'Combine balance and hip-flexor strength in a functional pattern.',
    why: 'Functional single-leg control supports running and cutting mechanics.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12' }],
    instructions: ['Standing on one leg, lift and lower the other knee slowly with control.'],
    regression: 'HF-EX-011', progression: 'HF-EX-031',
    cautions: [],
  },
  {
    id: 'HF-EX-022', name: 'Hanging/supported knee raise', block: 'strength_support', phase: 'build_strength',
    purpose: 'Build hip flexor strength through a longer lever.',
    why: 'A longer-lever knee raise increases hip flexor demand progressively.',
    equipment: ['bar', 'support'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12', load: 'add ankle weight' }],
    instructions: ['Supported or hanging, raise the knees toward the chest with control, lower slowly.'],
    regression: 'HF-EX-020', progression: 'HF-EX-032',
    cautions: [],
  },
  {
    id: 'HF-EX-023', name: 'Core/anti-rotation strengthening', block: 'strength_support', phase: 'build_strength',
    purpose: 'Build core strength to support pelvic control during hip-flexor loading.',
    why: 'Core and pelvic stability reduces compensatory strain on the hip flexors.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Pallof press or plank variations, focusing on resisting rotation through the trunk.'],
    regression: 'HF-EX-013', progression: 'HF-EX-033',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'HF-EX-030', name: 'Jogging build-up (straight line)', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce running load progressively.',
    why: 'Graded running exposure precedes sprinting, kicking, and cutting.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% effort, straight-line' }, { sets: '—', detail: '70-80% effort' }, { sets: '—', detail: '80% with strides' }],
    instructions: ['Build pace over the session, stay pain-free.'],
    regression: 'walk-jog intervals', progression: 'HF-EX-031',
    cautions: [],
  },
  {
    id: 'HF-EX-031', name: 'Accelerated sprint / high-knee drill build-up', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Expose the hip flexor to high-speed running and sprint-start demands.',
    why: 'Sprint starts and high-knee drills are the highest hip-flexor demand before return to sport.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'accelerations 80-90%' }, { sets: '—', detail: 'near-max sprints/starts' }, { sets: '—', detail: 'max sprint volume' }],
    instructions: ['Progress effort across sessions, keeping mechanics clean.'],
    regression: 'HF-EX-030', progression: 'HF-EX-033',
    cautions: ['Only after pain-free strength and jogging.'],
  },
  {
    id: 'HF-EX-032', name: 'Kicking / sport-specific skill loading', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce kicking or sport-specific hip-flexor-demanding skills.',
    why: 'Kicking is a leading mechanism for iliopsoas strain and needs its own graded reintroduction.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'light, controlled kicking volume' }, { sets: '—', detail: 'rising volume/power' }, { sets: '—', detail: 'match-intensity kicking' }],
    instructions: ['Build kicking power and volume gradually across sessions.'],
    regression: 'reduce power/volume', progression: 'HF-EX-033',
    cautions: [],
  },
  {
    id: 'HF-EX-033', name: 'Return-to-sport criteria battery', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate before full return: hip flexor strength symmetry + pain-free sprinting/kicking.',
    why: 'Criteria-based return with maintained hip-flexor strength work reduces re-injury risk.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002', 'HIPFLEX-CIT-003'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'resisted hip-flexion strength symmetry' }, { sets: '—', detail: 'pain-free sprinting' }, { sets: '—', detail: 'all symmetric + pain-free kicking/sprinting' }],
    instructions: ['Confirm hip flexor strength symmetry and pain-free sprinting/kicking before full return.'],
    cautions: ['Keep an ongoing hip flexor and core strength habit — it is protective against recurrence.'],
  },
];

/** Pool for a given stage. */
export function iliopsoasStrainPool(stageId) {
  return ILIOPSOAS_STRAIN_EXERCISES.filter((e) => e.phase === stageId);
}
