/**
 * lib/clinical/hipFlexorEngine/modules/iliopsoasRelatedGroinPain/iliopsoasRelatedGroinPainExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for chronic iliopsoas-related groin/hip-flexor pain,
 * including internal snapping hip. Conservative management (activity
 * modification + progressive strengthening + stretching) is first-line and
 * effective in most cases (Walker 2021).
 * ---------------------------------------------------------------------------
 */

export const CHRONIC_HIP_FLEXOR_EXERCISES = [
  // ═══ isometric_settle ══════════════════════════════════════════════════
  {
    id: 'CH-EX-001', name: 'Isometric hip flexion hold (mid-range)', block: 'tissue_specific_loading', phase: 'isometric_settle',
    purpose: 'Settle pain and maintain hip flexor strength.',
    why: 'Isometric loading gives short-term analgesia and maintains strength while a progressive programme begins.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '5', hold: '30 s', intensity: '~60-70% effort' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s', freq: '1-2x/day if painful' }],
    instructions: ['Seated, lift the knee a small amount against your own resisting hand and hold at a comfortable effort.'],
    regression: 'lower effort / shorter hold', progression: 'CH-EX-010',
    cautions: ['Pain should not climb during the holds; ease effort if it does.'],
  },
  {
    id: 'CH-EX-002', name: 'Isometric hip flexion (single-leg, long-lever)', block: 'tissue_specific_loading', phase: 'isometric_settle',
    purpose: 'Progress isometric load to the affected side alone.',
    why: 'Single-leg isometric increases load on the symptomatic side while keeping pain controlled.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '5', hold: '20-30 s' }, { sets: '5', hold: '30-45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Standing or seated, hold the knee lifted against resistance from a band or a partner\'s hand.'],
    regression: 'CH-EX-001', progression: 'CH-EX-011',
    cautions: [],
  },
  {
    id: 'CH-EX-003', name: 'Gentle hip mobility (all directions)', block: 'mobility_activation', phase: 'isometric_settle',
    purpose: 'Maintain comfortable range through the hip.',
    why: 'Gentle mobility work prevents stiffness without provoking the anterior hip.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', detail: 'gentle pain-free hip circles + knee-to-chest' }, { sets: '3', detail: 'slightly larger range' }, { sets: '3', detail: 'full pain-free range' }],
    instructions: ['Move the hip gently through its comfortable range in multiple directions.'],
    regression: 'smaller range', progression: 'CH-EX-012',
    cautions: ['Avoid the specific movement that reproduces a snap if it is painful; a painless snap does not need to be avoided.'],
  },
  {
    id: 'CH-EX-004', name: 'Core/pelvic control (dead bug / bird dog)', block: 'strength_support', phase: 'isometric_settle',
    purpose: 'Build core and pelvic control alongside hip flexor loading.',
    why: 'Core and pelvic stability work supports the hip flexor and reduces compensatory strain.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Lying on your back or on hands and knees, move opposite arm/leg slowly while keeping the trunk still.'],
    regression: 'smaller range', progression: 'CH-EX-013',
    cautions: [],
  },

  // ═══ progressive_strengthening ═════════════════════════════════════════
  {
    id: 'CH-EX-010', name: 'Standing hip flexion against resistance', block: 'tissue_specific_loading', phase: 'progressive_strengthening',
    purpose: 'Build hip flexor strength progressively.',
    why: 'Progressive strengthening is a core part of conservative management for iliopsoas-related pain (Walker 2021).',
    equipment: ['band'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '12-15' }, { sets: '3', reps: '15' }, { sets: '4', reps: '15', load: 'stronger band' }],
    instructions: ['Attach a band around the ankle, lift the knee up against resistance, return slowly.'],
    regression: 'CH-EX-002', progression: 'CH-EX-020',
    cautions: ['Some discomfort during loading is acceptable if it settles by the next day.'],
  },
  {
    id: 'CH-EX-011', name: 'Standing hip flexor stretch', block: 'mobility_activation', phase: 'progressive_strengthening',
    purpose: 'Restore and maintain hip flexor length.',
    why: 'Stretching the iliopsoas is a standard component of conservative management (Manske 2024).',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', hold: '20-30 s' }, { sets: '3', hold: '30 s' }, { sets: '3', hold: '30-45 s' }],
    instructions: ['Half-kneeling, gently shift weight forward and tuck the pelvis under until a comfortable stretch is felt.'],
    regression: 'CH-EX-003', progression: 'maintain ongoing',
    cautions: [],
  },
  {
    id: 'CH-EX-012', name: 'Bulgarian split squat / lunge (controlled)', block: 'strength_support', phase: 'progressive_strengthening',
    purpose: 'Functional single-leg strength through the hip.',
    why: 'Functional single-leg strength work builds capacity for sport movement patterns.',
    equipment: ['bodyweight', 'bench'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', depth: 'shallow' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each', depth: 'deeper' }],
    instructions: ['Rear foot elevated or in a lunge position, lower under control, drive back up.'],
    regression: 'CH-EX-004', progression: 'CH-EX-021',
    cautions: [],
  },
  {
    id: 'CH-EX-013', name: 'Seated marching with resistance', block: 'tissue_specific_loading', phase: 'progressive_strengthening',
    purpose: 'Progress hip flexion capacity in a controlled, gradeable way.',
    why: 'Progressive dynamic loading builds tolerance to repeated hip flexion, the movement most provocative in this condition.',
    equipment: ['band'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }, { sets: '4', reps: '15 each' }],
    instructions: ['Seated with a band around the knees, march one leg at a time against resistance.'],
    regression: 'CH-EX-010', progression: 'CH-EX-022',
    cautions: [],
  },

  // ═══ sport_specific_loading ═════════════════════════════════════════════
  {
    id: 'CH-EX-020', name: 'Standing knee drive with band resistance', block: 'tissue_specific_loading', phase: 'sport_specific_loading',
    purpose: 'Build dynamic hip flexor power in a sport-relevant pattern.',
    why: 'Resisted knee drives rehearse the sprinting/kicking hip-flexion pattern under load.',
    equipment: ['band'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }, { sets: '4', reps: '12 each', load: 'stronger band' }],
    instructions: ['Band anchored behind you at hip height, drive the knee up and forward against resistance.'],
    regression: 'CH-EX-013', progression: 'CH-EX-030',
    cautions: [],
  },
  {
    id: 'CH-EX-021', name: 'Jogging + change-of-direction build-up', block: 'running_sport_prep', phase: 'sport_specific_loading',
    purpose: 'Reintroduce running and gentle cutting.',
    why: 'Graded running and cutting builds confidence before full-speed sport exposure.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% jog, wide cuts' }, { sets: '—', detail: '70-80%, sharper cuts' }, { sets: '—', detail: '80%+ with strides' }],
    instructions: ['Build pace and cutting sharpness gradually across sessions.'],
    regression: 'walk-jog only', progression: 'CH-EX-030',
    cautions: [],
  },
  {
    id: 'CH-EX-022', name: 'Kicking / sport-specific skill loading', block: 'running_sport_prep', phase: 'sport_specific_loading',
    purpose: 'Reintroduce kicking or sport-specific hip-flexor-demanding skills.',
    why: 'Sport-specific skill exposure precedes full training integration.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'light, controlled kicking volume' }, { sets: '—', detail: 'rising volume/power' }, { sets: '—', detail: 'match-intensity kicking' }],
    instructions: ['Build kicking power and volume gradually across sessions.'],
    regression: 'reduce power/volume', progression: 'CH-EX-031',
    cautions: [],
  },
  {
    id: 'CH-EX-023', name: 'Single-leg balance with hip flexion', block: 'control_balance', phase: 'sport_specific_loading',
    purpose: 'Combine balance and hip-flexor strength in a functional pattern.',
    why: 'Functional single-leg control supports running, cutting, and kicking mechanics.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12' }],
    instructions: ['Standing on one leg, lift and lower the other knee slowly with control.'],
    regression: 'CH-EX-012', progression: 'CH-EX-030',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'CH-EX-030', name: 'Full sport-specific agility and sprint drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full-speed, sport-specific exposure.',
    why: 'Confirms readiness for the unpredictable, high-load demands that previously provoked symptoms.',
    equipment: ['bodyweight', 'cones'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'planned agility patterns' }, { sets: '—', detail: 'faster / reactive patterns' }, { sets: '—', detail: 'game-speed agility' }],
    instructions: ['Progress from planned agility drills to reactive, game-speed patterns.'],
    regression: 'CH-EX-021', progression: 'full training',
    cautions: [],
  },
  {
    id: 'CH-EX-031', name: 'Ongoing hip flexor strength + stretch maintenance', block: 'tissue_specific_loading', phase: 'return_to_sport',
    purpose: 'Keep hip flexor strength and length from lapsing back into a provocative pattern.',
    why: 'Ongoing strength and flexibility work is the key long-term habit against recurrence (Walker 2021).',
    equipment: ['band'], source_refs: ['HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12, 2x/week ongoing' }, { sets: '3', reps: '12 ongoing' }, { sets: '3', reps: '12-15 ongoing' }],
    instructions: ['Keep hip flexor strength and stretch work in your routine 2x/week indefinitely, even once symptoms are gone.'],
    regression: 'reduce frequency, never to zero', progression: 'periodise with season',
    cautions: [],
  },
  {
    id: 'CH-EX-032', name: 'Return-to-sport / recurrence-risk criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: hip flexor strength symmetry and confidence with sprinting/kicking.',
    why: 'A criteria-based check reduces the chance of returning to sport with an unresolved strength deficit.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-002', 'HIPFLEX-CIT-003'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'resisted hip-flexion strength symmetry' }, { sets: '—', detail: 'confident sprinting/kicking' }, { sets: '—', detail: 'all symmetric + pain-free, confident' }],
    instructions: ['Confirm strength symmetry and confident, pain-free sprinting/kicking before calling this "resolved" — then keep the maintenance work going.'],
    cautions: ['This condition has a real recurrence risk without ongoing strength/stretch work.'],
  },
  {
    id: 'CH-EX-033', name: 'Full sport/training integration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full training and match/competition exposure once criteria are met.',
    why: 'Final return-to-performance step after strength and functional criteria are satisfied.',
    equipment: ['bodyweight'], source_refs: ['HIPFLEX-CIT-001', 'HIPFLEX-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'modified team training' }, { sets: '—', detail: 'full training' }, { sets: '—', detail: 'match/competition' }],
    instructions: ['Integrate into normal training once strength, sprinting, and kicking criteria are met.'],
    regression: 'partial training', progression: 'full competition',
    cautions: ['Keep a maintenance loading habit ongoing — see CH-EX-031.'],
  },
];

/** Pool for a given stage. */
export function chronicHipFlexorPool(stageId) {
  return CHRONIC_HIP_FLEXOR_EXERCISES.filter((e) => e.phase === stageId);
}
