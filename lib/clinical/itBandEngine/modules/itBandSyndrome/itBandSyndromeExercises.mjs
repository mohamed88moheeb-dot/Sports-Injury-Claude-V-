/**
 * lib/clinical/itBandEngine/modules/itBandSyndrome/itBandSyndromeExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for iliotibial band syndrome (ITBS). Reframed as a
 * compression injury (Fairclough 2006), not a "friction" injury — management
 * centres on reducing compressive load (running mechanics, downhill/mileage)
 * and building hip abductor capacity (Fredericson 2000; Sanchez-Alvarado
 * 2024), plus gait-pattern work targeting hip adduction/knee internal
 * rotation (Noehren 2007).
 * ---------------------------------------------------------------------------
 */

export const IT_BAND_SYNDROME_EXERCISES = [
  // ═══ reduce_irritability ═══════════════════════════════════════════════
  {
    id: 'ITB-EX-001', name: 'Load management education (temporary mileage/downhill reduction)', block: 'conditioning', phase: 'reduce_irritability',
    purpose: 'Reduce compressive load on the ITB fat pad while it settles.',
    why: 'ITBS is a compression injury, not a friction injury — reducing downhill running, cambered surfaces, and total mileage temporarily reduces compressive load at ~30 degrees knee flexion (Fairclough 2006).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'avoid downhill running, hills, and cambered roads; reduce mileage ~50%' }, { sets: '—', detail: 'flat-terrain running only, mileage still reduced' }, { sets: '—', detail: 'gradual mileage return, flat terrain first' }],
    instructions: ['Temporarily avoid downhill running, stairs, and cambered surfaces; keep runs flat and shorter until pain settles at rest.'],
    regression: 'further reduce mileage / walk-only', progression: 'ITB-EX-010',
    cautions: [],
  },
  {
    id: 'ITB-EX-002', name: 'Isometric hip abduction (wall press)', block: 'tissue_specific_loading', phase: 'reduce_irritability',
    purpose: 'Settle pain and begin hip abductor loading without running impact.',
    why: 'Isometric loading provides short-term analgesia while beginning to address the hip abductor weakness associated with ITBS (Fredericson 2000).',
    equipment: ['wall'], source_refs: ['ITB-CIT-002'],
    dosage_by_tier: [{ sets: '4', hold: '30 s', intensity: '~60-70% effort' }, { sets: '4', hold: '45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Stand side-on to a wall, push the outside of the leg into it at a comfortable effort, hold.'],
    regression: 'lower effort / shorter hold', progression: 'ITB-EX-011',
    cautions: [],
  },
  {
    id: 'ITB-EX-003', name: 'Gentle hip and knee mobility', block: 'mobility_activation', phase: 'reduce_irritability',
    purpose: 'Maintain comfortable range without provoking the lateral knee.',
    why: 'Gentle mobility prevents stiffness while avoiding the ~30-degree compressive knee-flexion range under load.',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', detail: 'gentle pain-free hip and knee circles' }, { sets: '3', detail: 'slightly larger range' }, { sets: '3', detail: 'full comfortable range' }],
    instructions: ['Move the hip and knee gently through a comfortable, pain-free range.'],
    regression: 'smaller range', progression: 'ITB-EX-012',
    cautions: [],
  },
  {
    id: 'ITB-EX-004', name: 'Core and single-leg balance control', block: 'strength_support', phase: 'reduce_irritability',
    purpose: 'Build trunk/pelvic control that supports hip mechanics without loading the ITB.',
    why: 'Core and pelvic control underpin the hip control needed to reduce hip adduction during running (Noehren 2007).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', hold: '15-20 s each side' }, { sets: '3', hold: '25 s' }, { sets: '3', hold: '30 s' }],
    instructions: ['Stand on one leg, keep the pelvis level, hold; progress to eyes closed or an unstable surface as it gets easy.'],
    regression: 'hold onto support', progression: 'ITB-EX-013',
    cautions: [],
  },

  // ═══ restore_load_tolerance ═════════════════════════════════════════════
  {
    id: 'ITB-EX-010', name: 'Standing hip abduction against resistance', block: 'tissue_specific_loading', phase: 'restore_load_tolerance',
    purpose: 'Build hip abductor strength progressively.',
    why: 'A structured hip-abductor strengthening programme resolved symptoms in the large majority of runners with ITBS (Fredericson 2000).',
    equipment: ['band'], source_refs: ['ITB-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '12-15' }, { sets: '3', reps: '15' }, { sets: '4', reps: '15', load: 'stronger band' }],
    instructions: ['Band around the ankles, lift the leg out to the side against resistance, controlled return.'],
    regression: 'ITB-EX-002', progression: 'ITB-EX-020',
    cautions: ['Some discomfort during loading is acceptable if it settles by the next day.'],
  },
  {
    id: 'ITB-EX-011', name: 'Side-lying hip abduction (clamshell progression)', block: 'strength_support', phase: 'restore_load_tolerance',
    purpose: 'Direct gluteus medius strengthening to address the documented weakness in ITBS.',
    why: 'Gluteus medius weakness is consistently found on the affected side in runners with ITBS (Fredericson 2000).',
    equipment: ['bodyweight', 'band'], source_refs: ['ITB-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'add band' }],
    instructions: ['Lying on the unaffected side, knees bent, open the top knee like a clamshell, or progress to a straight-leg raise.'],
    regression: 'ITB-EX-003', progression: 'ITB-EX-021',
    cautions: [],
  },
  {
    id: 'ITB-EX-012', name: 'Single-leg bridge', block: 'strength_support', phase: 'restore_load_tolerance',
    purpose: 'Build single-leg hip and glute strength for gait control.',
    why: 'Single-leg strength underpins the hip control needed to reduce excess hip adduction during stance (Noehren 2007).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Bridge on one leg, keeping the pelvis level, lower slowly.'],
    regression: 'ITB-EX-004', progression: 'ITB-EX-022',
    cautions: [],
  },
  {
    id: 'ITB-EX-013', name: 'Step-down control drill', block: 'strength_support', phase: 'restore_load_tolerance',
    purpose: 'Control hip adduction and knee position under single-leg load, mimicking running stance.',
    why: 'Runners who develop ITBS show greater hip adduction and knee internal rotation during stance — step-down control directly rehearses correcting this pattern (Noehren 2007).',
    equipment: ['step'], source_refs: ['ITB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', depth: 'partial, low step' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12', depth: 'deeper' }],
    instructions: ['Step down slowly from a low step, keeping the pelvis level and the knee tracking over the foot (not caving inward).'],
    regression: 'lower step / hold onto support', progression: 'ITB-EX-023',
    cautions: [],
  },

  // ═══ build_running_capacity ═══════════════════════════════════════════
  {
    id: 'ITB-EX-020', name: 'Cadence / gait-pattern retraining', block: 'running_sport_prep', phase: 'build_running_capacity',
    purpose: 'Reduce excess hip adduction and knee internal rotation during running.',
    why: 'Slightly increasing step rate (~5-10%) and cueing a softer, more upright stride reduces the hip-adduction/knee-internal-rotation pattern linked to ITBS onset (Noehren 2007).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'short flat-terrain runs, cue "run softer," slightly quicker steps' }, { sets: '—', detail: 'longer flat runs with the same cues' }, { sets: '—', detail: 'cue becomes automatic over longer runs' }],
    instructions: ['On flat ground, run with a slightly quicker, softer step rate and keep the hips level — avoid the leg crossing in toward the midline.'],
    regression: 'ITB-EX-013', progression: 'ITB-EX-030',
    cautions: [],
  },
  {
    id: 'ITB-EX-021', name: 'Progressive flat-terrain running build-up', block: 'running_sport_prep', phase: 'build_running_capacity',
    purpose: 'Rebuild running mileage and time on feet without high compressive load.',
    why: 'Flat terrain keeps knee-flexion angles and compressive load lower than downhill running while mileage is rebuilt (Fairclough 2006).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% of prior mileage, flat terrain' }, { sets: '—', detail: '70-85% of prior mileage' }, { sets: '—', detail: 'full prior mileage, still flat terrain' }],
    instructions: ['Build running volume back up gradually on flat terrain before reintroducing hills.'],
    regression: 'walk-run intervals', progression: 'ITB-EX-031',
    cautions: [],
  },
  {
    id: 'ITB-EX-022', name: 'Graded hill/downhill reintroduction', block: 'running_sport_prep', phase: 'build_running_capacity',
    purpose: 'Reintroduce the highest-compression running terrain gradually and under control.',
    why: 'Downhill running increases ITB compressive load the most — reintroducing it gradually, once flat-terrain running and hip strength are tolerated well, reduces recurrence risk (Fairclough 2006).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'short, gentle downhill sections only' }, { sets: '—', detail: 'longer/steeper downhill sections' }, { sets: '—', detail: 'race-representative hills' }],
    instructions: ['Reintroduce downhill running in short, controlled doses, monitoring next-day response.'],
    regression: 'ITB-EX-021', progression: 'ITB-EX-032',
    cautions: ['Stop progressing downhill exposure if lateral knee pain returns the next day.'],
  },
  {
    id: 'ITB-EX-023', name: 'Single-leg squat under fatigue', block: 'strength_support', phase: 'build_running_capacity',
    purpose: 'Confirm hip and knee control holds up as running volume increases.',
    why: 'Maintaining good hip/knee control under fatigue is what protects against the compressive pattern recurring as training load rises (Noehren 2007).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12, after a short run' }],
    instructions: ['Perform single-leg squats, ideally after a short run, checking the knee still tracks over the foot when fatigued.'],
    regression: 'ITB-EX-013', progression: 'ITB-EX-033',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'ITB-EX-030', name: 'Full training/terrain integration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full training and race/competition-representative terrain exposure once criteria are met.',
    why: 'Final return-to-performance step once hip strength, gait pattern, and graded terrain exposure have all been tolerated (Sanchez-Alvarado 2024).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: 'modified full training' }, { sets: '—', detail: 'full training, all terrain' }, { sets: '—', detail: 'race/competition' }],
    instructions: ['Integrate into normal training and race-representative terrain once strength and gait criteria are met.'],
    regression: 'partial training', progression: 'full competition',
    cautions: [],
  },
  {
    id: 'ITB-EX-031', name: 'Ongoing hip abductor strength habit', block: 'tissue_specific_loading', phase: 'return_to_sport',
    purpose: 'Keep hip abductor strength up long-term to prevent recurrence.',
    why: 'Hip abductor strengthening is the most consistently effective conservative approach for ITBS and should continue as maintenance, not stop once pain resolves (Sanchez-Alvarado 2024).',
    equipment: ['band'], source_refs: ['ITB-CIT-004', 'ITB-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '12-15, 2x/week ongoing' }, { sets: '3', reps: '15 ongoing' }, { sets: '3', reps: '15 ongoing' }],
    instructions: ['Keep hip-abductor strength work in your routine 2x/week indefinitely.'],
    regression: 'reduce frequency, never to zero', progression: 'periodise with season',
    cautions: [],
  },
  {
    id: 'ITB-EX-032', name: 'Cutting / change-of-direction drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Sport-specific multidirectional exposure for field/court sports.',
    why: 'Cutting loads the hip abductors and lateral knee structures at speed and confirms readiness for multidirectional sport.',
    equipment: ['bodyweight', 'cones'], source_refs: ['ITB-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'planned wide-angle cuts' }, { sets: '—', detail: 'sharper / faster cuts' }, { sets: '—', detail: 'reactive cutting' }],
    instructions: ['Progress from planned to reactive change-of-direction, watching for the knee caving inward under load.'],
    regression: 'ITB-EX-020', progression: 'full match play',
    cautions: [],
  },
  {
    id: 'ITB-EX-033', name: 'Return-to-running criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: hip abductor strength symmetry and pain-free running on representative terrain.',
    why: 'A criteria-based check reduces the chance of returning to full training with an unresolved strength deficit or gait pattern (Fredericson 2000; Noehren 2007).',
    equipment: ['bodyweight'], source_refs: ['ITB-CIT-002', 'ITB-CIT-003'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'hip abductor strength symmetry' }, { sets: '—', detail: 'pain-free on hills/downhill' }, { sets: '—', detail: 'all symmetric + pain-free at full mileage' }],
    instructions: ['Confirm hip strength symmetry and pain-free running on hills/downhill terrain at full mileage before calling this "resolved" — then keep the maintenance work going.'],
    cautions: ['ITBS has a real recurrence risk without ongoing hip strength work and gradual terrain progression.'],
  },
];

/** Pool for a given stage. */
export function itBandSyndromePool(stageId) {
  return IT_BAND_SYNDROME_EXERCISES.filter((e) => e.phase === stageId);
}
