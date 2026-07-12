/**
 * lib/clinical/lowerBackEngine/modules/nonSpecificLowBackPain/nonSpecificLowBackPainExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for non-specific (mechanical) low back pain. Guideline-
 * consistent active management — stay active, avoid prolonged rest, build
 * strength and capacity progressively (O'Sullivan 2005; exercise therapy
 * evidence in athletes).
 * ---------------------------------------------------------------------------
 */

export const NON_SPECIFIC_LOW_BACK_PAIN_EXERCISES = [
  // ═══ calm_and_move ═════════════════════════════════════════════════════
  {
    id: 'LB-EX-001', name: 'Stay-active education (avoid prolonged bed rest)', block: 'conditioning', phase: 'calm_and_move',
    purpose: 'Reduce fear-avoidance and keep the back moving while it settles.',
    why: 'Staying as active as tolerated (rather than prolonged bed rest) is consistently recommended in mechanism-based low back pain management (O\'Sullivan 2018).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'keep everyday activity going within tolerance, avoid prolonged bed rest' }, { sets: '—', detail: 'gradually increase daily activity' }, { sets: '—', detail: 'normal daily activity' }],
    instructions: ['Keep moving within a comfortable range — short walks and normal daily tasks are encouraged, not avoided.'],
    regression: 'shorter/gentler activity', progression: 'LB-EX-010',
    cautions: [],
  },
  {
    id: 'LB-EX-002', name: 'Gentle walking', block: 'conditioning', phase: 'calm_and_move',
    purpose: 'Low-irritability aerobic and movement input.',
    why: 'Walking is a low-cost, well-tolerated way to keep the spine moving and build tolerance early (O\'Sullivan 2018).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: '10-15 min, comfortable pace' }, { sets: '—', detail: '15-25 min' }, { sets: '—', detail: '25-35 min' }],
    instructions: ['Walk at a comfortable pace on flat ground, stopping short of provoking sharp pain.'],
    regression: 'shorter duration', progression: 'LB-EX-011',
    cautions: [],
  },
  {
    id: 'LB-EX-003', name: 'Gentle range of motion (cat-cow, pelvic tilts)', block: 'mobility_activation', phase: 'calm_and_move',
    purpose: 'Restore comfortable spinal movement without provoking pain.',
    why: 'Gentle repeated movement through a comfortable range helps settle irritability without the harms of prolonged immobility.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10' }, { sets: '3', reps: '10-12' }, { sets: '3', reps: '12-15' }],
    instructions: ['On hands and knees, gently arch and round the back (cat-cow), or gently tilt the pelvis while lying down, staying within a comfortable range.'],
    regression: 'smaller range', progression: 'LB-EX-012',
    cautions: [],
  },
  {
    id: 'LB-EX-004', name: 'Gentle core activation (low-level bracing)', block: 'strength_support', phase: 'calm_and_move',
    purpose: 'Begin low-level trunk control without provoking pain.',
    why: 'Low-level, non-provocative trunk activation begins motor control work early without adding significant load.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', hold: '5-10 s' }, { sets: '3', hold: '10 s' }, { sets: '3', hold: '10-15 s' }],
    instructions: ['Lying down, gently brace the deep abdominal muscles (as if bracing lightly for a cough) without holding your breath.'],
    regression: 'shorter hold, lighter effort', progression: 'LB-EX-013',
    cautions: [],
  },

  // ═══ restore_movement_and_control ══════════════════════════════════════
  {
    id: 'LB-EX-010', name: 'Bird dog', block: 'strength_support', phase: 'restore_movement_and_control',
    purpose: 'Build trunk control and coordination between limbs.',
    why: 'Motor control exercises like bird dog are a core part of active rehabilitation for mechanical low back pain (exercise therapy evidence).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['On hands and knees, extend opposite arm and leg slowly while keeping the trunk still and level.'],
    regression: 'LB-EX-004', progression: 'LB-EX-020',
    cautions: [],
  },
  {
    id: 'LB-EX-011', name: 'Glute bridge', block: 'strength_support', phase: 'restore_movement_and_control',
    purpose: 'Build hip and posterior chain strength to share load with the low back.',
    why: 'Building hip/glute strength reduces reliance on the low back for movements like bending and lifting.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Lying on your back, knees bent, lift the hips, squeeze the glutes, lower slowly.'],
    regression: 'LB-EX-003', progression: 'LB-EX-021',
    cautions: [],
  },
  {
    id: 'LB-EX-012', name: 'Dead bug', block: 'strength_support', phase: 'restore_movement_and_control',
    purpose: 'Build anti-extension trunk control while keeping the low back supported.',
    why: 'Dead bug trains trunk control in a supported position, well tolerated during early rehabilitation.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Lying on your back, arms up and knees bent at 90 degrees, slowly lower opposite arm and leg while keeping the low back gently braced against the floor.'],
    regression: 'smaller range', progression: 'LB-EX-022',
    cautions: [],
  },
  {
    id: 'LB-EX-013', name: 'Modified side plank (knee-supported)', block: 'strength_support', phase: 'restore_movement_and_control',
    purpose: 'Build lateral trunk (quadratus lumborum/oblique) endurance.',
    why: 'Lateral trunk endurance is a component of a balanced trunk strengthening programme for low back pain.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', hold: '10-15 s each side' }, { sets: '3', hold: '20 s' }, { sets: '3', hold: '25-30 s' }],
    instructions: ['Lying on your side with knees bent, prop up on your forearm and lift your hips, keeping a straight line from knees to shoulders.'],
    regression: 'shorter hold', progression: 'LB-EX-023',
    cautions: [],
  },

  // ═══ build_strength_and_capacity ═══════════════════════════════════════
  {
    id: 'LB-EX-020', name: 'Hip hinge pattern (light load)', block: 'tissue_specific_loading', phase: 'build_strength_and_capacity',
    purpose: 'Build a safe, strong bending/lifting pattern.',
    why: 'Progressive loaded hip hinge training builds confidence and capacity for bending and lifting tasks, a core part of exercise therapy for low back pain.',
    equipment: ['bodyweight', 'dumbbell'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12', load: 'bodyweight' }, { sets: '3', reps: '10', load: 'light load' }, { sets: '3-4', reps: '8-10', load: 'moderate load' }],
    instructions: ['Hinge at the hips keeping a neutral spine, push the hips back, then return to standing — light load first, progressing gradually.'],
    regression: 'LB-EX-011', progression: 'LB-EX-030',
    cautions: ['Progress load gradually — the goal is confident movement under increasing load, not maximal effort early.'],
  },
  {
    id: 'LB-EX-021', name: 'Full side plank / anti-rotation press (Pallof press)', block: 'strength_support', phase: 'build_strength_and_capacity',
    purpose: 'Build rotational and anti-rotational trunk strength for sport demands.',
    why: 'Anti-rotation strength supports the trunk during cutting, throwing, and other rotational sport movements.',
    equipment: ['band'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10 each side' }, { sets: '3', reps: '12' }, { sets: '3', reps: '12-15', load: 'stronger band' }],
    instructions: ['Holding a band anchored to the side, press it straight out and resist rotating the trunk.'],
    regression: 'LB-EX-013', progression: 'LB-EX-031',
    cautions: [],
  },
  {
    id: 'LB-EX-022', name: 'Loaded carries / step-ups', block: 'strength_support', phase: 'build_strength_and_capacity',
    purpose: 'Build functional trunk and hip strength under load.',
    why: 'Loaded carries and step-ups build real-world lifting and carrying capacity progressively.',
    equipment: ['dumbbell', 'step'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', detail: '20-30 m carry / 8-10 step-ups each leg' }, { sets: '3', detail: '30-40 m / 10-12 each' }, { sets: '3', detail: '40-50 m / 12-15 each, heavier load' }],
    instructions: ['Carry a weight at your side or overhead for a set distance, or step up onto a box, keeping the trunk controlled.'],
    regression: 'LB-EX-011', progression: 'LB-EX-032',
    cautions: [],
  },
  {
    id: 'LB-EX-023', name: 'Loaded squat pattern', block: 'tissue_specific_loading', phase: 'build_strength_and_capacity',
    purpose: 'Build lower-body and trunk strength together under progressive load.',
    why: 'A well-controlled squat pattern builds general strength and confidence in loaded movement.',
    equipment: ['bodyweight', 'dumbbell'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12', load: 'bodyweight' }, { sets: '3', reps: '10', load: 'light load' }, { sets: '3-4', reps: '8-10', load: 'moderate load' }],
    instructions: ['Squat down keeping the trunk upright and controlled, progressing load gradually.'],
    regression: 'LB-EX-020', progression: 'LB-EX-033',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'LB-EX-030', name: 'Rotational / sport-specific loading drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce sport-specific rotational and impact loading.',
    why: 'Graded exposure to sport-specific rotational and impact demands builds confidence before full return (exercise therapy evidence).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'low-intensity, planned drills' }, { sets: '—', detail: 'moderate intensity' }, { sets: '—', detail: 'full intensity, sport-representative' }],
    instructions: ['Practice sport-specific rotational and impact movements at increasing intensity.'],
    regression: 'LB-EX-021', progression: 'LB-EX-031',
    cautions: [],
  },
  {
    id: 'LB-EX-031', name: 'Running/jumping progression', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Rebuild running and jumping tolerance.',
    why: 'Running and jumping load the spine repetitively — a graded build-up reduces recurrence risk.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% of prior volume' }, { sets: '—', detail: '70-85%' }, { sets: '—', detail: 'full prior volume' }],
    instructions: ['Build running and jumping volume back up gradually, monitoring next-day response.'],
    regression: 'LB-EX-022', progression: 'LB-EX-032',
    cautions: [],
  },
  {
    id: 'LB-EX-032', name: 'Full training/competition integration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full training and competition exposure once criteria are met.',
    why: 'Final return-to-performance step once strength and load tolerance criteria are satisfied.',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-003'],
    dosage_by_tier: [{ sets: '—', detail: 'modified full training' }, { sets: '—', detail: 'full training' }, { sets: '—', detail: 'competition' }],
    instructions: ['Integrate into normal training and competition once strength and capacity criteria are met.'],
    regression: 'partial training', progression: 'full competition',
    cautions: [],
  },
  {
    id: 'LB-EX-033', name: 'Return-to-sport criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: confident loaded movement, no lingering leg symptoms, tolerance to sport-specific demands.',
    why: 'A criteria-based check reduces the chance of returning to full training with an unresolved strength or control deficit (O\'Sullivan 2018; exercise therapy evidence).',
    equipment: ['bodyweight'], source_refs: ['LB-CIT-001', 'LB-CIT-003'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'confident hip hinge/squat under load' }, { sets: '—', detail: 'pain-free running/jumping' }, { sets: '—', detail: 'all criteria met, confident under fatigue' }],
    instructions: ['Confirm confident, controlled loaded movement and pain-free running/jumping before calling this "resolved" — then keep the maintenance work going.'],
    cautions: ['Low back pain has a real recurrence risk without ongoing strength and movement-confidence work.'],
  },
];

/** Pool for a given stage. */
export function nonSpecificLowBackPainPool(stageId) {
  return NON_SPECIFIC_LOW_BACK_PAIN_EXERCISES.filter((e) => e.phase === stageId);
}
