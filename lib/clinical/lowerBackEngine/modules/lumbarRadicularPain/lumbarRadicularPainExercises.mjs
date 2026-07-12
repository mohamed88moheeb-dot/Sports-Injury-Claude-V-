/**
 * lib/clinical/lowerBackEngine/modules/lumbarRadicularPain/lumbarRadicularPainExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for lumbar radicular pain (disc-related pain with leg
 * symptoms but no red flags). Most cases improve gradually over weeks to a
 * few months with conservative, active management (Benoist 2002) —
 * directional-preference movement and graded neural tolerance work
 * (El Melhat 2024), not prolonged rest.
 * ---------------------------------------------------------------------------
 */

export const LUMBAR_RADICULAR_PAIN_EXERCISES = [
  // ═══ settle_nerve_irritability ═════════════════════════════════════════
  {
    id: 'LRP-EX-001', name: 'Directional-preference positioning (position of relief)', block: 'mobility_activation', phase: 'settle_nerve_irritability',
    purpose: 'Find and use the position/direction that centralises or reduces leg symptoms.',
    why: 'Most people with disc-related leg pain have a directional preference (often extension) that reduces or centralises symptoms — using it is a core early strategy (El Melhat 2024).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-005'],
    dosage_by_tier: [{ sets: '3-4', reps: '8-10, gentle', detail: 'try gentle prone press-ups or the position that eases leg symptoms' }, { sets: '4', reps: '10' }, { sets: '4', reps: '10-12' }],
    instructions: ['Try gentle repeated movements (e.g. lying face-down and gently pressing up) and note which direction reduces or moves symptoms up toward the back and away from the leg/foot — use that direction.'],
    regression: 'smaller range / less frequent', progression: 'LRP-EX-010',
    cautions: ['Stop and use a different direction if leg symptoms move further down the leg (peripheralise) rather than toward the back.'],
  },
  {
    id: 'LRP-EX-002', name: 'Natural-history education (most cases improve gradually)', block: 'conditioning', phase: 'settle_nerve_irritability',
    purpose: 'Reduce fear and support continued gentle activity.',
    why: 'Most lumbar disc-related radicular pain improves gradually over weeks to a few months with conservative management, without surgery (Benoist 2002).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: 'stay as active as tolerated, avoid prolonged bed rest' }, { sets: '—', detail: 'gradually increase activity' }, { sets: '—', detail: 'normal daily activity' }],
    instructions: ['Keep moving within tolerance — most disc-related leg pain settles gradually with time and gentle activity.'],
    regression: 'shorter activity', progression: 'LRP-EX-011',
    cautions: [],
  },
  {
    id: 'LRP-EX-003', name: 'Gentle walking', block: 'conditioning', phase: 'settle_nerve_irritability',
    purpose: 'Low-irritability aerobic and movement input.',
    why: 'Walking is well tolerated for most people with radicular pain and supports continued activity without provoking symptoms.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: '10-15 min, comfortable pace' }, { sets: '—', detail: '15-25 min' }, { sets: '—', detail: '25-35 min' }],
    instructions: ['Walk at a comfortable pace, stopping short of provoking leg symptoms.'],
    regression: 'shorter duration', progression: 'LRP-EX-012',
    cautions: [],
  },
  {
    id: 'LRP-EX-004', name: 'Gentle nerve glide (non-aggressive)', block: 'mobility_activation', phase: 'settle_nerve_irritability',
    purpose: 'Begin gentle, non-provocative neural mobility.',
    why: 'Gentle nerve gliding (sliding rather than aggressively stretching the nerve) can be tolerated early and begins restoring neural mobility (El Melhat 2024).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-005'],
    dosage_by_tier: [{ sets: '2-3', reps: '6-8, gentle' }, { sets: '3', reps: '8-10' }, { sets: '3', reps: '10' }],
    instructions: ['Gently and slowly move the leg/ankle through a small pain-free range in a "sliding" pattern rather than holding a stretch.'],
    regression: 'smaller range', progression: 'LRP-EX-013',
    cautions: ['Stop if this increases leg symptoms rather than easing them.'],
  },

  // ═══ restore_neural_tolerance ══════════════════════════════════════════
  {
    id: 'LRP-EX-010', name: 'Progressive neural mobility (graded nerve glides)', block: 'mobility_activation', phase: 'restore_neural_tolerance',
    purpose: 'Gradually build tolerance to neural movement.',
    why: 'Progressing neural mobility work gradually helps restore normal movement tolerance as irritability settles (El Melhat 2024).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-005'],
    dosage_by_tier: [{ sets: '3', reps: '8-10' }, { sets: '3', reps: '10-12' }, { sets: '4', reps: '12' }],
    instructions: ['Progress the nerve-glide range gradually as tolerated, still avoiding aggressive end-range stretching.'],
    regression: 'LRP-EX-004', progression: 'LRP-EX-020',
    cautions: [],
  },
  {
    id: 'LRP-EX-011', name: 'Bird dog', block: 'strength_support', phase: 'restore_neural_tolerance',
    purpose: 'Build trunk control and coordination between limbs.',
    why: 'Motor control exercises support the spine as neural symptoms settle, part of active rehabilitation for low back conditions.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['On hands and knees, extend opposite arm and leg slowly while keeping the trunk still and level.'],
    regression: 'smaller range', progression: 'LRP-EX-021',
    cautions: [],
  },
  {
    id: 'LRP-EX-012', name: 'Glute bridge', block: 'strength_support', phase: 'restore_neural_tolerance',
    purpose: 'Build hip and posterior chain strength to share load with the low back.',
    why: 'Building hip/glute strength reduces reliance on the low back for movements like bending and lifting.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Lying on your back, knees bent, lift the hips, squeeze the glutes, lower slowly.'],
    regression: 'LRP-EX-003', progression: 'LRP-EX-022',
    cautions: [],
  },
  {
    id: 'LRP-EX-013', name: 'Dead bug', block: 'strength_support', phase: 'restore_neural_tolerance',
    purpose: 'Build anti-extension trunk control while keeping the low back supported.',
    why: 'Dead bug trains trunk control in a supported position, well tolerated during rehabilitation.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Lying on your back, arms up and knees bent at 90 degrees, slowly lower opposite arm and leg while keeping the low back gently braced.'],
    regression: 'smaller range', progression: 'LRP-EX-023',
    cautions: [],
  },

  // ═══ build_strength_and_capacity ═══════════════════════════════════════
  {
    id: 'LRP-EX-020', name: 'Hip hinge pattern (light load)', block: 'tissue_specific_loading', phase: 'build_strength_and_capacity',
    purpose: 'Build a safe, strong bending/lifting pattern.',
    why: 'Progressive loaded hip hinge training builds confidence and capacity for bending and lifting tasks as neural symptoms resolve.',
    equipment: ['bodyweight', 'dumbbell'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12', load: 'bodyweight' }, { sets: '3', reps: '10', load: 'light load' }, { sets: '3-4', reps: '8-10', load: 'moderate load' }],
    instructions: ['Hinge at the hips keeping a neutral spine, push the hips back, then return to standing — light load first, progressing gradually.'],
    regression: 'LRP-EX-012', progression: 'LRP-EX-030',
    cautions: ['Stop progressing if leg symptoms return or worsen.'],
  },
  {
    id: 'LRP-EX-021', name: 'Anti-rotation press (Pallof press)', block: 'strength_support', phase: 'build_strength_and_capacity',
    purpose: 'Build rotational and anti-rotational trunk strength for sport demands.',
    why: 'Anti-rotation strength supports the trunk during cutting, throwing, and other rotational sport movements.',
    equipment: ['band'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10 each side' }, { sets: '3', reps: '12' }, { sets: '3', reps: '12-15', load: 'stronger band' }],
    instructions: ['Holding a band anchored to the side, press it straight out and resist rotating the trunk.'],
    regression: 'LRP-EX-013', progression: 'LRP-EX-031',
    cautions: [],
  },
  {
    id: 'LRP-EX-022', name: 'Loaded carries / step-ups', block: 'strength_support', phase: 'build_strength_and_capacity',
    purpose: 'Build functional trunk and hip strength under load.',
    why: 'Loaded carries and step-ups build real-world lifting and carrying capacity progressively.',
    equipment: ['dumbbell', 'step'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', detail: '20-30 m carry / 8-10 step-ups each leg' }, { sets: '3', detail: '30-40 m / 10-12 each' }, { sets: '3', detail: '40-50 m / 12-15 each, heavier load' }],
    instructions: ['Carry a weight at your side or overhead for a set distance, or step up onto a box, keeping the trunk controlled.'],
    regression: 'LRP-EX-012', progression: 'LRP-EX-032',
    cautions: [],
  },
  {
    id: 'LRP-EX-023', name: 'Loaded squat pattern', block: 'tissue_specific_loading', phase: 'build_strength_and_capacity',
    purpose: 'Build lower-body and trunk strength together under progressive load.',
    why: 'A well-controlled squat pattern builds general strength and confidence in loaded movement.',
    equipment: ['bodyweight', 'dumbbell'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12', load: 'bodyweight' }, { sets: '3', reps: '10', load: 'light load' }, { sets: '3-4', reps: '8-10', load: 'moderate load' }],
    instructions: ['Squat down keeping the trunk upright and controlled, progressing load gradually.'],
    regression: 'LRP-EX-020', progression: 'LRP-EX-033',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'LRP-EX-030', name: 'Rotational / sport-specific loading drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce sport-specific rotational and impact loading.',
    why: 'Graded exposure to sport-specific rotational and impact demands builds confidence before full return.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'low-intensity, planned drills' }, { sets: '—', detail: 'moderate intensity' }, { sets: '—', detail: 'full intensity, sport-representative' }],
    instructions: ['Practice sport-specific rotational and impact movements at increasing intensity.'],
    regression: 'LRP-EX-021', progression: 'LRP-EX-031',
    cautions: [],
  },
  {
    id: 'LRP-EX-031', name: 'Running/jumping progression', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Rebuild running and jumping tolerance.',
    why: 'Running and jumping load the spine and nerve root repetitively — a graded build-up reduces recurrence risk.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% of prior volume' }, { sets: '—', detail: '70-85%' }, { sets: '—', detail: 'full prior volume' }],
    instructions: ['Build running and jumping volume back up gradually, monitoring for any return of leg symptoms.'],
    regression: 'LRP-EX-022', progression: 'LRP-EX-032',
    cautions: [],
  },
  {
    id: 'LRP-EX-032', name: 'Full training/competition integration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full training and competition exposure once criteria are met.',
    why: 'Final return-to-performance step once strength, neural tolerance, and load criteria are satisfied.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'modified full training' }, { sets: '—', detail: 'full training' }, { sets: '—', detail: 'competition' }],
    instructions: ['Integrate into normal training and competition once strength and capacity criteria are met.'],
    regression: 'partial training', progression: 'full competition',
    cautions: [],
  },
  {
    id: 'LRP-EX-033', name: 'Return-to-sport criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: no lingering leg symptoms, confident loaded movement, tolerance to sport-specific demands.',
    why: 'A criteria-based check reduces the chance of returning to full training with residual neural irritability or an unresolved strength deficit (El Melhat 2024).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-004', 'LB-CIT-003'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'no leg symptoms with loaded movement' }, { sets: '—', detail: 'pain-free running/jumping' }, { sets: '—', detail: 'all criteria met, confident under fatigue' }],
    instructions: ['Confirm no lingering leg symptoms and confident, controlled loaded movement before calling this "resolved" — then keep the maintenance work going.'],
    cautions: ['Seek review if leg symptoms return or new numbness/weakness develops at any point.'],
  },
];

/** Pool for a given stage. */
export function lumbarRadicularPainPool(stageId) {
  return LUMBAR_RADICULAR_PAIN_EXERCISES.filter((e) => e.phase === stageId);
}
