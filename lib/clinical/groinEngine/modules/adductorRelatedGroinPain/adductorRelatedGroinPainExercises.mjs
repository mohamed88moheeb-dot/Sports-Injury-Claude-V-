/**
 * lib/clinical/groinEngine/modules/adductorRelatedGroinPain/adductorRelatedGroinPainExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for longstanding/chronic adductor-related groin pain,
 * modelled on the Holmich active-training protocol (Holmich 1999) — an
 * active strengthening programme, not passive treatment — with the
 * Copenhagen adduction exercise (Ishoi 2016) as the key eccentric-loading
 * progression exercise.
 * ---------------------------------------------------------------------------
 */

export const CHRONIC_GROIN_EXERCISES = [
  // ═══ isometric_settle ══════════════════════════════════════════════════
  {
    id: 'CG-EX-001', name: 'Isometric adductor squeeze (ball/pillow)', block: 'tissue_specific_loading', phase: 'isometric_settle',
    purpose: 'Settle pain and maintain adductor strength.',
    why: 'Isometric loading gives short-term analgesia and maintains strength while a progressive programme begins (Holmich 1999).',
    equipment: ['bodyweight', 'ball'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '5', hold: '30 s', intensity: '~60-70% effort' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s', freq: '1-2x/day if painful' }],
    instructions: ['Squeeze a ball or cushion between the knees at a comfortable, controlled effort and hold.'],
    regression: 'lower effort / shorter hold', progression: 'CG-EX-010',
    cautions: ['Pain should not climb during the holds; ease effort if it does.'],
  },
  {
    id: 'CG-EX-002', name: 'Isometric hip adduction (long-lever, single-leg)', block: 'tissue_specific_loading', phase: 'isometric_settle',
    purpose: 'Progress isometric load to the affected side alone.',
    why: 'Single-leg isometric increases load on the symptomatic side while keeping pain controlled.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '5', hold: '20-30 s' }, { sets: '5', hold: '30-45 s' }, { sets: '5', hold: '45 s' }],
    instructions: ['Lying on your back, press the injured leg inward against a fixed resistance (a partner\'s hand, a wall, or a strap) and hold.'],
    regression: 'CG-EX-001', progression: 'CG-EX-011',
    cautions: [],
  },
  {
    id: 'CG-EX-003', name: 'Pain-free hip and core mobility', block: 'mobility_activation', phase: 'isometric_settle',
    purpose: 'Maintain comfortable range through the hip and pelvis.',
    why: 'Gentle mobility work prevents stiffness without provoking the adductor/pubic region.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', detail: 'gentle pain-free hip circles + gentle trunk rotation' }, { sets: '3', detail: 'slightly larger range' }, { sets: '3', detail: 'full pain-free range' }],
    instructions: ['Move the hips and trunk gently through their comfortable range.'],
    regression: 'smaller range', progression: 'CG-EX-012',
    cautions: [],
  },
  {
    id: 'CG-EX-004', name: 'Core/pelvic control (dead bug / bird dog)', block: 'strength_support', phase: 'isometric_settle',
    purpose: 'Build core and pelvic control alongside adductor loading.',
    why: 'Core and pelvic stability work is a core component of the active-training approach to adductor-related groin pain.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Lying on your back or on hands and knees, move opposite arm/leg slowly while keeping the trunk still.'],
    regression: 'smaller range', progression: 'CG-EX-013',
    cautions: [],
  },

  // ═══ progressive_strengthening ═════════════════════════════════════════
  {
    id: 'CG-EX-010', name: 'Standing hip adduction against resistance', block: 'tissue_specific_loading', phase: 'progressive_strengthening',
    purpose: 'Build adductor strength progressively — the core of the active-training approach.',
    why: 'Progressive adductor strengthening was the key intervention shown effective for long-standing adductor-related groin pain (Holmich 1999).',
    equipment: ['band'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '12-15' }, { sets: '3', reps: '15' }, { sets: '4', reps: '15', load: 'stronger band' }],
    instructions: ['Attach a band at ankle height, pull the leg across the body against resistance, return slowly.'],
    regression: 'CG-EX-002', progression: 'CG-EX-020',
    cautions: ['Some discomfort during loading is acceptable if it settles by the next day.'],
  },
  {
    id: 'CG-EX-011', name: 'Side-lying hip abduction/adduction strengthening', block: 'strength_support', phase: 'progressive_strengthening',
    purpose: 'Build balanced abductor/adductor strength.',
    why: 'Balanced hip strength supports pelvic control and reduces load imbalance around the adductors.',
    equipment: ['bodyweight', 'band'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12 each' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'add band' }],
    instructions: ['Lying on your side, raise and lower the top leg, then bring the bottom leg up to meet it.'],
    regression: 'CG-EX-003', progression: 'CG-EX-021',
    cautions: [],
  },
  {
    id: 'CG-EX-012', name: 'Bulgarian split squat / lunge (controlled)', block: 'strength_support', phase: 'progressive_strengthening',
    purpose: 'Functional single-leg strength through the hip and pelvis.',
    why: 'Functional single-leg strength work builds capacity for sport movement patterns.',
    equipment: ['bodyweight', 'bench'], source_refs: ['GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', depth: 'shallow' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each', depth: 'deeper' }],
    instructions: ['Rear foot elevated or in a lunge position, lower under control, drive back up.'],
    regression: 'CG-EX-004', progression: 'CG-EX-022',
    cautions: [],
  },
  {
    id: 'CG-EX-013', name: 'Copenhagen plank (knee-supported regression)', block: 'tissue_specific_loading', phase: 'progressive_strengthening',
    purpose: 'Introduce the validated eccentric adductor-strengthening exercise in its easiest form.',
    why: 'The Copenhagen adduction exercise produces large eccentric adductor strength gains (Ishoi 2016).',
    equipment: ['bench'], source_refs: ['GROIN-CIT-005'],
    dosage_by_tier: [{ sets: '2-3', reps: '6-8', detail: 'knee-supported regression' }, { sets: '3', reps: '8-10' }, { sets: '3', reps: '10-12' }],
    instructions: ['Top leg on a bench, bottom knee bent and resting on the floor for support, lift the hips and hold, lower slowly.'],
    regression: 'CG-EX-010', progression: 'CG-EX-023',
    cautions: [],
  },

  // ═══ sport_specific_loading ═════════════════════════════════════════════
  {
    id: 'CG-EX-020', name: 'Copenhagen plank (full straight-leg)', block: 'tissue_specific_loading', phase: 'sport_specific_loading',
    purpose: 'Full eccentric adductor strength for sport demands.',
    why: 'The full Copenhagen adduction exercise produces substantial eccentric strength gains, the key long-term protective exercise for this condition (Ishoi 2016).',
    equipment: ['bench'], source_refs: ['GROIN-CIT-005'],
    dosage_by_tier: [{ sets: '3', reps: '6-8' }, { sets: '3', reps: '8-10' }, { sets: '3-4', reps: '10-12' }],
    instructions: ['Both legs straight, top leg on the bench, lift the hips and hold, lower slowly with control.'],
    regression: 'CG-EX-013', progression: 'maintain ongoing',
    cautions: [],
  },
  {
    id: 'CG-EX-021', name: 'Lateral lunge / cutting-pattern loading', block: 'strength_support', phase: 'sport_specific_loading',
    purpose: 'Functional adductor loading in lateral/cutting movement patterns.',
    why: 'Lateral loading patterns rehearse the demand of cutting sports where adductor-related pain typically recurs.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Step wide to one side, sit into the hip, push back to standing, controlled throughout.'],
    regression: 'CG-EX-012', progression: 'CG-EX-030',
    cautions: [],
  },
  {
    id: 'CG-EX-022', name: 'Jogging + change-of-direction build-up', block: 'running_sport_prep', phase: 'sport_specific_loading',
    purpose: 'Reintroduce running and gentle cutting.',
    why: 'Graded running and cutting builds confidence before full-speed sport exposure.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% jog, wide cuts' }, { sets: '—', detail: '70-80%, sharper cuts' }, { sets: '—', detail: '80%+ with strides' }],
    instructions: ['Build pace and cutting sharpness gradually across sessions.'],
    regression: 'walk-jog only', progression: 'CG-EX-030',
    cautions: [],
  },
  {
    id: 'CG-EX-023', name: 'Kicking / sport-specific skill loading', block: 'running_sport_prep', phase: 'sport_specific_loading',
    purpose: 'Reintroduce kicking or sport-specific adductor-demanding skills.',
    why: 'Sport-specific skill exposure precedes full training integration.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'light, controlled kicking volume' }, { sets: '—', detail: 'rising volume/power' }, { sets: '—', detail: 'match-intensity kicking' }],
    instructions: ['Build kicking power and volume gradually across sessions.'],
    regression: 'reduce power/volume', progression: 'CG-EX-031',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'CG-EX-030', name: 'Full sport-specific agility and cutting drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full-speed, sport-specific cutting and agility exposure.',
    why: 'Confirms readiness for the unpredictable, high-load demands that previously provoked symptoms.',
    equipment: ['bodyweight', 'cones'], source_refs: ['GROIN-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'planned agility patterns' }, { sets: '—', detail: 'faster / reactive patterns' }, { sets: '—', detail: 'game-speed agility' }],
    instructions: ['Progress from planned agility drills to reactive, game-speed patterns.'],
    regression: 'CG-EX-022', progression: 'full training',
    cautions: [],
  },
  {
    id: 'CG-EX-031', name: 'Ongoing Copenhagen-plank maintenance programme', block: 'tissue_specific_loading', phase: 'return_to_sport',
    purpose: 'Keep adductor strength from lapsing back into a provocative deficit.',
    why: 'Ongoing eccentric adductor strength work is the key long-term protective habit against recurrence (Ishoi 2016).',
    equipment: ['bench'], source_refs: ['GROIN-CIT-005'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10, 2x/week ongoing' }, { sets: '3', reps: '10 ongoing' }, { sets: '3', reps: '10-12 ongoing' }],
    instructions: ['Keep Copenhagen plank work in your routine 2x/week indefinitely, even once symptoms are gone.'],
    regression: 'reduce frequency, never to zero', progression: 'periodise with season',
    cautions: [],
  },
  {
    id: 'CG-EX-032', name: 'Return-to-sport / recurrence-risk criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: adductor strength symmetry and confidence with cutting/kicking.',
    why: 'A criteria-based check reduces the chance of returning to sport with an unresolved strength deficit.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-002', 'GROIN-CIT-005'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'resisted adduction strength symmetry' }, { sets: '—', detail: 'confident cutting/kicking' }, { sets: '—', detail: 'all symmetric + pain-free, confident' }],
    instructions: ['Confirm strength symmetry and confident, pain-free cutting/kicking before calling this "resolved" — then keep the maintenance work going.'],
    cautions: ['This condition has a real recurrence risk without ongoing strength work.'],
  },
  {
    id: 'CG-EX-033', name: 'Full sport/training integration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full training and match/competition exposure once criteria are met.',
    why: 'Final return-to-performance step after strength and functional criteria are satisfied.',
    equipment: ['bodyweight'], source_refs: ['GROIN-CIT-001', 'GROIN-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'modified team training' }, { sets: '—', detail: 'full training' }, { sets: '—', detail: 'match/competition' }],
    instructions: ['Integrate into normal training once strength, cutting, and kicking criteria are met.'],
    regression: 'partial training', progression: 'full competition',
    cautions: ['Keep a maintenance loading habit ongoing — see CG-EX-031.'],
  },
];

/** Pool for a given stage. */
export function chronicGroinPool(stageId) {
  return CHRONIC_GROIN_EXERCISES.filter((e) => e.phase === stageId);
}
