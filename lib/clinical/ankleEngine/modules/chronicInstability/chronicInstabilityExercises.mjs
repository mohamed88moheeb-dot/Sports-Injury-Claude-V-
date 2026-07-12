/**
 * lib/clinical/ankleEngine/modules/chronicInstability/chronicInstabilityExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for CHRONIC ANKLE INSTABILITY (recurrent sprains and/or
 * persistent giving-way). This is a capacity/neuromuscular-control deficit,
 * not a fresh injury, so there is no acute "protect" phase — the entry point
 * is always balance/neuromuscular re-education (Gribble 2016; Hertel/Corbett
 * CAI model), building through strength and reactive control to a
 * sport-return-plus-ongoing-maintenance stage (Schiftan 2015).
 * ---------------------------------------------------------------------------
 */

export const CAI_EXERCISES = [
  // ═══ neuromuscular_control ═════════════════════════════════════════════
  {
    id: 'CI-EX-001', name: 'Double-leg balance (firm surface, eyes open -> closed)', block: 'control_balance', phase: 'neuromuscular_control',
    purpose: 'Re-establish basic postural control and body awareness.',
    why: 'Neuromuscular re-education is the foundational entry point for chronic ankle instability rehab (Gribble 2016).',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30 s eyes closed' }, { sets: '4', hold: '45 s eyes closed' }],
    instructions: ['Stand on both feet, focus on even weight distribution, progress to eyes closed.'],
    regression: 'hold support', progression: 'CI-EX-002',
    cautions: [],
  },
  {
    id: 'CI-EX-002', name: 'Single-leg balance (firm surface)', block: 'control_balance', phase: 'neuromuscular_control',
    purpose: 'Progress to single-leg postural control on the affected side.',
    why: 'Single-leg balance training is the most consistently supported CAI intervention (Schiftan 2015).',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', hold: '15-20 s' }, { sets: '3', hold: '30 s' }, { sets: '4', hold: '45 s' }],
    instructions: ['Stand on the affected leg only, keep the standing knee soft, hips level.'],
    regression: 'CI-EX-001', progression: 'CI-EX-010',
    cautions: ['Have something nearby to hold if you feel unsteady at first.'],
  },
  {
    id: 'CI-EX-003', name: '4-way resisted band work (all directions)', block: 'tissue_specific_loading', phase: 'neuromuscular_control',
    purpose: 'Rebuild baseline strength in all directions, especially eversion.',
    why: 'Peroneal (eversion) strength is a key deficit in chronic ankle instability.',
    equipment: ['band'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10 each direction' }, { sets: '3', reps: '12-15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Push against the band in all 4 directions, controlled tempo.'],
    regression: 'reduce band strength', progression: 'CI-EX-011',
    cautions: [],
  },
  {
    id: 'CI-EX-004', name: 'Ankle alphabet / full-range mobility drill', block: 'mobility_activation', phase: 'neuromuscular_control',
    purpose: 'Maintain and refresh full pain-free range of motion.',
    why: 'Restricted ankle mobility is common alongside CAI and can limit control quality.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', detail: '"draw the alphabet" once through' }, { sets: '3', detail: 'twice through' }, { sets: '3', detail: 'three times through' }],
    instructions: ['Trace the alphabet in the air with your big toe.'],
    regression: 'smaller range', progression: 'CI-EX-012',
    cautions: [],
  },
  {
    id: 'CI-EX-005', name: 'Gait and weight-shift re-education', block: 'control_balance', phase: 'neuromuscular_control',
    purpose: 'Correct compensations that have developed around a chronically unstable ankle.',
    why: 'Chronic instability often comes with subtle gait/weight-shift compensations that need direct retraining.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'slow, deliberate walking with full weight transfer, 2-3 min' }, { sets: '—', detail: '4-5 min, add side-stepping' }, { sets: '—', detail: '5 min, add backward walking' }],
    instructions: ['Walk slowly, consciously rolling fully through the foot on the affected side.'],
    regression: 'shorter duration', progression: 'CI-EX-013',
    cautions: [],
  },

  // ═══ strength_capacity ═════════════════════════════════════════════════
  {
    id: 'CI-EX-010', name: 'Single-leg balance (unstable surface)', block: 'control_balance', phase: 'strength_capacity',
    purpose: 'Progress balance demand toward more realistic surfaces.',
    why: 'Progressive balance-surface difficulty builds on the neuromuscular foundation.',
    equipment: ['bodyweight', 'balance_pad'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s' }, { sets: '4', hold: '45 s, head turns/ball toss' }],
    instructions: ['Stand on the affected leg on a foam pad or similar unstable surface.'],
    regression: 'CI-EX-002', progression: 'CI-EX-020',
    cautions: [],
  },
  {
    id: 'CI-EX-011', name: 'Resisted eversion strengthening (progressive load)', block: 'tissue_specific_loading', phase: 'strength_capacity',
    purpose: 'Build peroneal strength specifically — the dynamic stabiliser against inversion.',
    why: 'Peroneal strengthening directly targets the dynamic-stability deficit in CAI.',
    equipment: ['band'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '3', reps: '12' }, { sets: '3', reps: '15' }, { sets: '4', reps: '15', load: 'stronger band' }],
    instructions: ['Push the foot outward against band resistance, controlled return.'],
    regression: 'CI-EX-003', progression: 'CI-EX-021',
    cautions: [],
  },
  {
    id: 'CI-EX-012', name: 'Single-leg calf raise', block: 'strength_support', phase: 'strength_capacity',
    purpose: 'Build single-leg push-off strength and symmetry.',
    why: 'Calf/ankle strength symmetry supports dynamic control during gait and sport.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15-20', load: 'add weight' }],
    instructions: ['Rise onto the toes on the affected leg only, lower slowly.'],
    regression: 'CI-EX-004', progression: 'CI-EX-022',
    cautions: [],
  },
  {
    id: 'CI-EX-013', name: 'Single-leg squat / step-down control', block: 'strength_support', phase: 'strength_capacity',
    purpose: 'Build functional single-leg strength and control up the kinetic chain.',
    why: 'Hip and knee control influence ankle stability during dynamic tasks.',
    equipment: ['step'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', depth: 'partial' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12', depth: 'deeper' }],
    instructions: ['Squat/step down slowly on the affected leg, keep the knee tracking over the foot.'],
    regression: 'CI-EX-005', progression: 'CI-EX-023',
    cautions: [],
  },
  {
    id: 'CI-EX-014', name: 'Multi-directional reach balance (Y-balance style)', block: 'control_balance', phase: 'strength_capacity',
    purpose: 'Combine strength and balance in a functional reaching pattern.',
    why: 'Reach-balance tasks are a standard CAI assessment and training tool.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003', 'ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', reps: '6 each direction' }, { sets: '3', reps: '8 each' }, { sets: '4', reps: '10 each' }],
    instructions: ['Balance on the affected leg and reach the other foot forward/side/back, return to start.'],
    regression: 'CI-EX-010', progression: 'CI-EX-024',
    cautions: [],
  },

  // ═══ dynamic_reactive ══════════════════════════════════════════════════
  {
    id: 'CI-EX-020', name: 'Single-leg reactive balance (perturbation)', block: 'control_balance', phase: 'dynamic_reactive',
    purpose: 'Build reactive stability against sudden, unpredictable movement.',
    why: 'Reactive/perturbation training targets exactly the scenario that causes giving-way episodes.',
    equipment: ['bodyweight', 'balance_pad'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', reps: '30 s reactive holds' }, { sets: '3', reps: '45 s with perturbation' }, { sets: '4', reps: '45 s with distraction task' }],
    instructions: ['Balance on the affected leg while reacting to small pushes or an unstable surface.'],
    regression: 'CI-EX-010', progression: 'CI-EX-030',
    cautions: [],
  },
  {
    id: 'CI-EX-021', name: 'Double-leg to single-leg hop and stick', block: 'control_balance', phase: 'dynamic_reactive',
    purpose: 'Introduce landing control at increasing demand.',
    why: 'Landing control is a prerequisite for confident cutting/agility work.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', reps: '6' }, { sets: '3', reps: '8, single-leg landing' }, { sets: '4', reps: '8, single-leg' }],
    instructions: ['Hop and stick the landing softly, progressing to single-leg.'],
    regression: 'CI-EX-014', progression: 'CI-EX-031',
    cautions: ['Land quietly and controlled — this is the moment CAI episodes most often occur.'],
  },
  {
    id: 'CI-EX-022', name: 'Lateral bound and stick', block: 'control_balance', phase: 'dynamic_reactive',
    purpose: 'Reactive lateral control, the direction most associated with inversion re-injury.',
    why: 'Lateral bounding rehearses control in the exact plane that historically fails in CAI.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '3', reps: '6 each side' }, { sets: '3', reps: '8 each' }, { sets: '4', reps: '10 each' }],
    instructions: ['Bound sideways and stick the landing on the affected leg, controlled and quiet.'],
    regression: 'smaller bound', progression: 'CI-EX-032',
    cautions: [],
  },
  {
    id: 'CI-EX-023', name: 'Jogging + change-of-direction build-up', block: 'running_sport_prep', phase: 'dynamic_reactive',
    purpose: 'Reintroduce running and gentle cutting.',
    why: 'Graded running and cutting builds confidence before full-speed sport exposure.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% jog, wide cuts' }, { sets: '—', detail: '70-80%, sharper cuts' }, { sets: '—', detail: '80%+ with strides' }],
    instructions: ['Build pace and cutting sharpness gradually across sessions.'],
    regression: 'walk-jog only', progression: 'CI-EX-030',
    cautions: [],
  },

  // ═══ return_to_sport (+ ongoing maintenance) ═══════════════════════════
  {
    id: 'CI-EX-030', name: 'Multidirectional plyometric progression', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Full reactive strength and multidirectional control at sport-level demand.',
    why: 'Restores stretch-shortening capacity and confidence in unpredictable movement before full return.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', reps: '6 single-leg' }, { sets: '3', reps: '8 lateral bounds' }, { sets: '4', reps: '8 reactive multidirectional' }],
    instructions: ['Progress hops to bounds and multidirectional movement, controlled landings throughout.'],
    regression: 'CI-EX-021', progression: 'sport drills',
    cautions: [],
  },
  {
    id: 'CI-EX-031', name: 'Sport-specific agility and cutting drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full-speed, sport-specific cutting and agility exposure.',
    why: 'Sport-specific agility work confirms readiness for the unpredictable demands that previously triggered giving-way.',
    equipment: ['bodyweight', 'cones'], source_refs: ['ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'planned agility patterns' }, { sets: '—', detail: 'faster / reactive patterns' }, { sets: '—', detail: 'game-speed agility' }],
    instructions: ['Progress from planned agility drills to reactive, game-speed patterns.'],
    regression: 'CI-EX-023', progression: 'full training',
    cautions: [],
  },
  {
    id: 'CI-EX-032', name: 'Ongoing balance maintenance programme', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Keep neuromuscular control from lapsing back into instability.',
    why: 'Balance/proprioceptive training must continue long-term to keep CAI recurrence risk down (Schiftan 2015) — this is not a "finish and stop" programme.',
    equipment: ['bodyweight', 'balance_pad'], source_refs: ['ANKLE-CIT-007', 'ANKLE-CIT-003'],
    dosage_by_tier: [{ sets: '3', hold: '30-45 s, 2-3x/week ongoing' }, { sets: '3', hold: '45 s ongoing' }, { sets: '3-4', hold: '45 s ongoing' }],
    instructions: ['Keep single-leg balance work in your routine 2-3x/week indefinitely, even once symptoms are gone.'],
    regression: 'reduce frequency, never to zero', progression: 'periodise with training load',
    cautions: [],
  },
  {
    id: 'CI-EX-033', name: 'Return-to-sport / recurrence-risk criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: strength symmetry, reach-balance symmetry, and confidence with cutting.',
    why: 'A criteria-based check reduces the chance of returning to sport with an unresolved instability deficit (Gribble 2016).',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-003', 'ANKLE-CIT-007'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'reach-balance + calf-strength symmetry' }, { sets: '—', detail: 'confident single-leg landings' }, { sets: '—', detail: 'all symmetric + pain-free, confident cutting' }],
    instructions: ['Confirm strength and reach-balance symmetry and confident, controlled cutting before calling this "resolved" — then keep the maintenance work going.'],
    cautions: ['CAI has a real recurrence risk — do not drop the maintenance work once symptoms settle.'],
  },
];

/** Pool for a given stage. */
export function caiPool(stageId) {
  return CAI_EXERCISES.filter((e) => e.phase === stageId);
}
