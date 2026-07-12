/**
 * lib/clinical/gluteEngine/modules/glutealTendinopathy/glutealTendinopathyExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for gluteal tendinopathy / greater trochanteric pain
 * syndrome (GTPS). Education + progressive loading is first-line and beats
 * corticosteroid injection and wait-and-see (Mellor 2018, the LEAP trial).
 * Early work avoids compressive positions (Grimaldi 2015).
 * ---------------------------------------------------------------------------
 */

export const GLUTEAL_TENDINOPATHY_EXERCISES = [
  // ═══ load_management ═══════════════════════════════════════════════════
  {
    id: 'GT-EX-001', name: 'Isometric hip abduction (neutral, non-compressive)', block: 'tissue_specific_loading', phase: 'load_management',
    purpose: 'Settle pain and maintain abductor strength without compressive positions.',
    why: 'Isometric loading gives short-term analgesia; neutral-hip positioning avoids the compressive loads that aggravate gluteal tendinopathy (Grimaldi 2015).',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '5', hold: '30 s', intensity: '~60-70% effort' }, { sets: '5', hold: '45 s' }, { sets: '5', hold: '45 s', freq: '1-2x/day if painful' }],
    instructions: ['Lying on your back, push the leg outward against a fixed resistance (a wall, a partner\'s hand) with the hip in a neutral, non-crossed position.'],
    regression: 'lower effort / shorter hold', progression: 'GT-EX-010',
    cautions: ['Avoid crossing the leg over midline or standing with the hip "hitched" out — both compress the tendon.'],
  },
  {
    id: 'GT-EX-002', name: 'Load management education + activity modification', block: 'conditioning', phase: 'load_management',
    purpose: 'Remove the compressive postures and habits that aggravate the tendon.',
    why: 'Education on avoiding compressive positions (crossing legs, standing on one hip, side-lying without a pillow) is a core, evidence-based part of management (Mellor 2018).',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-002', 'GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'avoid crossing legs, standing "hip hitched," and unsupported side-lying' }, { sets: '—', detail: 'ongoing' }, { sets: '—', detail: 'ongoing' }],
    instructions: ['Sleep with a pillow between the knees if side-lying; avoid standing with weight sunk into one hip; avoid crossing legs when seated.'],
    regression: 'none needed', progression: 'maintain ongoing',
    cautions: [],
  },
  {
    id: 'GT-EX-003', name: 'Gentle hip mobility (non-compressive range)', block: 'mobility_activation', phase: 'load_management',
    purpose: 'Maintain comfortable hip range without provoking the tendon.',
    why: 'Gentle mobility work prevents stiffness while avoiding compressive end-range positions.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', detail: 'gentle pain-free hip circles, avoiding full adduction' }, { sets: '3', detail: 'slightly larger range' }, { sets: '3', detail: 'full comfortable range' }],
    instructions: ['Move the hip gently, avoiding the fully crossed-over/adducted position.'],
    regression: 'smaller range', progression: 'GT-EX-012',
    cautions: [],
  },
  {
    id: 'GT-EX-004', name: 'Core/pelvic control (bird dog)', block: 'strength_support', phase: 'load_management',
    purpose: 'Build core and pelvic control alongside abductor loading.',
    why: 'Core and pelvic stability work supports the hip abductors without directly compressing the tendon.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each side' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['On hands and knees, extend opposite arm/leg slowly while keeping the trunk still.'],
    regression: 'smaller range', progression: 'GT-EX-013',
    cautions: [],
  },

  // ═══ progressive_strengthening ═════════════════════════════════════════
  {
    id: 'GT-EX-010', name: 'Standing hip abduction against resistance', block: 'tissue_specific_loading', phase: 'progressive_strengthening',
    purpose: 'Build hip abductor strength progressively.',
    why: 'Progressive strengthening was the key intervention shown effective in the LEAP trial (Mellor 2018).',
    equipment: ['band'], source_refs: ['GLUTE-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '12-15' }, { sets: '3', reps: '15' }, { sets: '4', reps: '15', load: 'stronger band' }],
    instructions: ['Band around the ankles, lift the leg out to the side against resistance, controlled return, avoid crossing past midline.'],
    regression: 'GT-EX-001', progression: 'GT-EX-020',
    cautions: ['Some discomfort during loading is acceptable if it settles by the next day.'],
  },
  {
    id: 'GT-EX-011', name: 'Side-lying hip abduction (top-leg raise)', block: 'strength_support', phase: 'progressive_strengthening',
    purpose: 'Direct gluteus medius/minimus strengthening.',
    why: 'Side-lying abduction is a foundational gluteal-tendon-friendly strengthening exercise once acute irritability has settled.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001', 'GLUTE-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'ankle weight' }],
    instructions: ['Lying on the unaffected side, raise the top leg without letting the hip roll backward.'],
    regression: 'GT-EX-003', progression: 'GT-EX-021',
    cautions: ['Avoid lying directly on the affected side if it is compressive/painful.'],
  },
  {
    id: 'GT-EX-012', name: 'Bridge (double-leg, neutral hip width)', block: 'strength_support', phase: 'progressive_strengthening',
    purpose: 'Build gluteus maximus strength in a functional, non-compressive pattern.',
    why: 'Bridging strengthens the gluteal complex without adducting the hip.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Lying on your back, knees hip-width apart, lift the hips, squeeze the glutes, lower slowly.'],
    regression: 'GT-EX-004', progression: 'GT-EX-022',
    cautions: [],
  },
  {
    id: 'GT-EX-013', name: 'Wall press isometric hip abduction (progressive)', block: 'tissue_specific_loading', phase: 'progressive_strengthening',
    purpose: 'Progress isometric abductor loading with more effort and duration.',
    why: 'Progressive isometric loading bridges early settling work to full dynamic strengthening.',
    equipment: ['wall'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s' }, { sets: '4', hold: '45 s' }],
    instructions: ['Stand side-on to a wall, push the outside of the leg into it, hold at a comfortable effort.'],
    regression: 'GT-EX-001', progression: 'GT-EX-010',
    cautions: [],
  },

  // ═══ functional_loading ═════════════════════════════════════════════════
  {
    id: 'GT-EX-020', name: 'Single-leg bridge', block: 'tissue_specific_loading', phase: 'functional_loading',
    purpose: 'Build single-leg gluteal strength and symmetry.',
    why: 'Single-leg loading builds the capacity needed for gait, stairs, and running.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Bridge on one leg, keeping the pelvis level, lower slowly.'],
    regression: 'GT-EX-012', progression: 'GT-EX-030',
    cautions: [],
  },
  {
    id: 'GT-EX-021', name: 'Single-leg squat / step-down control', block: 'strength_support', phase: 'functional_loading',
    purpose: 'Functional single-leg control through the hip and pelvis.',
    why: 'Functional single-leg strength and control reduce compensatory hip-drop patterns.',
    equipment: ['step'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', depth: 'partial' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12', depth: 'deeper' }],
    instructions: ['Squat/step down slowly, keep the pelvis level and the knee tracking over the foot.'],
    regression: 'GT-EX-011', progression: 'GT-EX-031',
    cautions: [],
  },
  {
    id: 'GT-EX-022', name: 'Jogging build-up (straight line)', block: 'running_sport_prep', phase: 'functional_loading',
    purpose: 'Reintroduce running load progressively.',
    why: 'Graded running exposure builds tolerance once strength has been rebuilt.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% effort, straight-line' }, { sets: '—', detail: '70-80% effort' }, { sets: '—', detail: '80% with strides' }],
    instructions: ['Build pace over the session, stay pain-free.'],
    regression: 'walk-jog intervals', progression: 'GT-EX-030',
    cautions: [],
  },
  {
    id: 'GT-EX-023', name: 'Single-leg balance (unstable surface)', block: 'control_balance', phase: 'functional_loading',
    purpose: 'Progress proprioception toward sport demands.',
    why: 'Single-leg balance progression builds capacity for cutting and running.',
    equipment: ['bodyweight', 'balance_pad'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s, add pad' }, { sets: '4', hold: '45 s' }],
    instructions: ['Stand on the injured leg only, progress to an unstable surface as it gets easy.'],
    regression: 'GT-EX-011', progression: 'GT-EX-032',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'GT-EX-030', name: 'Change-of-direction / cutting drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Sport-specific cutting exposure.',
    why: 'Cutting loads the hip abductors eccentrically at speed and confirms readiness.',
    equipment: ['bodyweight', 'cones'], source_refs: ['GLUTE-CIT-001'],
    dosage_by_tier: [{ sets: '—', detail: 'planned wide-angle cuts' }, { sets: '—', detail: 'sharper / faster cuts' }, { sets: '—', detail: 'reactive cutting' }],
    instructions: ['Progress from planned to reactive change-of-direction.'],
    regression: 'GT-EX-022', progression: 'GT-EX-031',
    cautions: [],
  },
  {
    id: 'GT-EX-031', name: 'Full sport/training integration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Full training and match/competition exposure once criteria are met.',
    why: 'Final return-to-performance step after strength and functional criteria are satisfied.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'modified team training' }, { sets: '—', detail: 'full training' }, { sets: '—', detail: 'match/competition' }],
    instructions: ['Integrate into normal training once strength and cutting criteria are met.'],
    regression: 'partial training', progression: 'full competition',
    cautions: [],
  },
  {
    id: 'GT-EX-032', name: 'Ongoing abductor strength + load-management habits', block: 'tissue_specific_loading', phase: 'return_to_sport',
    purpose: 'Keep abductor strength up and avoid compressive habits long-term.',
    why: 'Ongoing strength work and continued avoidance of compressive positions are the key protective habits (Grimaldi 2015; Mellor 2018).',
    equipment: ['band'], source_refs: ['GLUTE-CIT-001', 'GLUTE-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '12-15, 2x/week ongoing' }, { sets: '3', reps: '15 ongoing' }, { sets: '3', reps: '15 ongoing' }],
    instructions: ['Keep hip-abductor strength work in your routine 2x/week indefinitely, and keep avoiding compressive postures.'],
    regression: 'reduce frequency, never to zero', progression: 'periodise with season',
    cautions: [],
  },
  {
    id: 'GT-EX-033', name: 'Return-to-sport / recurrence-risk criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: abductor strength symmetry and confidence with cutting/running.',
    why: 'A criteria-based check reduces the chance of returning to sport with an unresolved strength deficit.',
    equipment: ['bodyweight'], source_refs: ['GLUTE-CIT-002', 'GLUTE-CIT-004'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'resisted abduction strength symmetry' }, { sets: '—', detail: 'confident cutting/running' }, { sets: '—', detail: 'all symmetric + pain-free, confident' }],
    instructions: ['Confirm strength symmetry and confident, pain-free cutting/running before calling this "resolved" — then keep the maintenance work going.'],
    cautions: ['GTPS has a real recurrence risk without ongoing strength work and load management.'],
  },
];

/** Pool for a given stage. */
export function glutealTendinopathyPool(stageId) {
  return GLUTEAL_TENDINOPATHY_EXERCISES.filter((e) => e.phase === stageId);
}
