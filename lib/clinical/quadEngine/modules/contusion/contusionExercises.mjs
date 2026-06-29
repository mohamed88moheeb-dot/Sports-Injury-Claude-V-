/**
 * lib/clinical/quadEngine/modules/contusion/contusionExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for quadriceps CONTUSION ("dead leg"). The clinical priority
 * order is the inverse of a strain: knee-flexion ROM FIRST, gentle isometrics,
 * then graded strengthening — with stretch kept cautious early because
 * aggressive early stretch raises myositis-ossificans (MO) risk (Lempainen 2022;
 * Larson 2002). Early gentle flexion actively REDUCES MO risk (Aronen 2006).
 *
 * Deepened library: ~24 exercises across acute_rom -> restore_strength ->
 * reload -> return, with regressions/progressions, BFR for early strength
 * without high mechanical load (Hughes 2019), and criteria-based return
 * (Nawasreh 2016). dosage_by_tier = [early, mid, late]. All beta_default.
 * ---------------------------------------------------------------------------
 */

export const CONTUSION_EXERCISES = [
  // ═══ acute_rom: regain pain-free knee flexion, gentle activation ═════════
  {
    id: 'CN-EX-001', name: 'Pain-free passive knee flexion (gravity / heel slide)', block: 'mobility_activation', phase: 'acute_rom',
    purpose: 'Restore knee-flexion range early — the primary contusion goal.',
    why: 'Early restoration of flexion ROM hastens recovery and lowers MO risk (Aronen 2006; Larson 2002).',
    stretch_demand: 'low', rom_focus: true,
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-005', 'QUAD-CIT-006'],
    dosage_by_tier: [{ sets: '3-4', detail: 'gentle, to first resistance, pain-free' }, { sets: '4', detail: 'increase range as comfort allows' }, { sets: '4-5', detail: 'toward full flexion' }],
    instructions: ['Sit or lie and let the knee bend gently under its own weight or slide the heel toward you.', 'Move only into pain-free range; never force the stretch.'],
    regression: 'smaller range', progression: 'CN-EX-003',
    cautions: ['Do NOT push into pain — forced stretch raises ossification risk.'],
  },
  {
    id: 'CN-EX-002', name: 'Pain-free quad isometric', block: 'tissue_specific_loading', phase: 'acute_rom',
    purpose: 'Gentle quad activation without movement.',
    why: 'Pain-free isometrics maintain activation without provoking the bruised tissue (Aronen 2006).',
    stretch_demand: 'low',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-005'],
    dosage_by_tier: [{ sets: '3', hold: '5-10 s', intensity: 'gentle' }, { sets: '3', hold: '10-20 s' }, { sets: '4', hold: '20-30 s' }],
    instructions: ['Tighten the thigh gently with the knee straight, hold pain-free, release.'],
    regression: 'lower effort', progression: 'CN-EX-010',
    cautions: ['Keep effort low until pain settles.'],
  },
  {
    id: 'CN-EX-003', name: 'Stationary cycling (high seat, low resistance)', block: 'conditioning', phase: 'acute_rom',
    purpose: 'Encourage flexion ROM and circulation without impact.',
    why: 'Pain-free cycling drives ROM and blood flow gently.',
    stretch_demand: 'low', rom_focus: true,
    equipment: ['bike'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: '5-10 min, seat high, no resistance' }, { sets: '—', detail: '10-15 min, light resistance' }, { sets: '—', detail: '15-20 min' }],
    instructions: ['Start with the seat high to limit knee bend, lower it as flexion improves.'],
    regression: 'half revolutions', progression: 'lower seat / add resistance',
    cautions: ['Stop if pain or swelling increases.'],
  },
  {
    id: 'CN-EX-004', name: 'Gentle active knee flexion/extension (seated)', block: 'mobility_activation', phase: 'acute_rom',
    purpose: 'Active pain-free ROM through the available range.',
    why: 'Active movement maintains ROM gains and reduces stiffness.',
    stretch_demand: 'low', rom_focus: true,
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-005'],
    dosage_by_tier: [{ sets: '2-3', reps: '10 slow' }, { sets: '3', reps: '12-15' }, { sets: '3', reps: '15' }],
    instructions: ['Seated, bend and straighten the knee through the comfortable range.'],
    regression: 'smaller range', progression: 'CN-EX-010',
    cautions: ['Pain-free only.'],
  },
  {
    id: 'CN-EX-005', name: 'Straight-leg raise (pain-free)', block: 'strength_support', phase: 'acute_rom',
    purpose: 'Maintain quad activation in a non-provocative long lever.',
    why: 'SLR keeps the quad firing without bending the bruised muscle under load.',
    stretch_demand: 'low',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-005'],
    dosage_by_tier: [{ sets: '2', reps: '8' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12' }],
    instructions: ['Lift the straight leg to the height of the other thigh, lower slowly.'],
    regression: 'reduce range', progression: 'add light ankle weight',
    cautions: ['Stop if it provokes the contusion.'],
  },

  // ═══ restore_strength: graded loading once ROM is returning ══════════════
  {
    id: 'CN-EX-010', name: 'Short-arc knee extension', block: 'tissue_specific_loading', phase: 'restore_strength',
    purpose: 'Rebuild quad strength in a comfortable range.',
    why: 'Graded strengthening follows ROM restoration (Kary 2010).',
    stretch_demand: 'low',
    equipment: ['bodyweight', 'band'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15' }],
    instructions: ['Extend the knee through the pain-free range, lower slowly.'],
    regression: 'CN-EX-002', progression: 'full-range extension',
    cautions: ['Avoid the deepest, most provocative range early.'],
  },
  {
    id: 'CN-EX-011', name: 'Wall sit (shallow -> deeper)', block: 'tissue_specific_loading', phase: 'restore_strength',
    purpose: 'Sustained quad loading as tolerance returns.',
    why: 'Isometric mid-range loading rebuilds capacity.',
    stretch_demand: 'low',
    equipment: ['wall'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '3', hold: '20 s', angle: 'shallow' }, { sets: '3', hold: '30-40 s' }, { sets: '4', hold: '45 s' }],
    instructions: ['Slide down only as far as comfortable; deepen as flexion and comfort improve.'],
    regression: 'shallower', progression: 'CN-EX-012',
    cautions: [],
  },
  {
    id: 'CN-EX-012', name: 'Double-leg squat (bodyweight)', block: 'strength_support', phase: 'restore_strength',
    purpose: 'Functional quad loading through increasing range.',
    why: 'Re-introduces closed-chain loading without impact.',
    stretch_demand: 'moderate',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '10', depth: 'partial' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15', depth: 'fuller' }],
    instructions: ['Squat to a pain-free depth with even weight, deepen over time.'],
    regression: 'box squat', progression: 'CN-EX-020',
    cautions: [],
  },
  {
    id: 'CN-EX-013', name: 'BFR leg press / extension (low load)', block: 'tissue_specific_loading', phase: 'restore_strength',
    purpose: 'Rebuild quad size/strength with low mechanical load.',
    why: 'Low-load BFR matches heavy-load gains with less pain — useful when the contusion limits heavy loading (Hughes 2019).',
    stretch_demand: 'low',
    equipment: ['bfr_cuff', 'machine'], source_refs: ['QUAD-CIT-015'], requires_supervision: true,
    dosage_by_tier: [{ sets: '4', reps: '30/15/15/15', intensity: '20-30% 1RM', cuff: '~80% AOP' }, { sets: '4', reps: '30/15/15/15' }, { sets: '4', reps: '30/15/15/15' }],
    instructions: ['Apply the cuff under supervision; perform low-load reps to the scheme.'],
    regression: 'CN-EX-010 (no cuff)', progression: 'CN-EX-020',
    cautions: ['Supervised; not with circulatory contraindications. Avoid if swelling is rising.'],
  },
  {
    id: 'CN-EX-014', name: 'Step-up (low box)', block: 'strength_support', phase: 'restore_strength',
    purpose: 'Functional single-leg loading as strength returns.',
    why: 'Step-ups progress closed-chain loading toward sport patterns.',
    stretch_demand: 'moderate',
    equipment: ['step'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', height: 'low' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Drive up through the injured leg, control the descent.'],
    regression: 'lower box', progression: 'add load',
    cautions: [],
  },
  {
    id: 'CN-EX-015', name: 'Gentle prone quad stretch (sub-acute only)', block: 'mobility_activation', phase: 'restore_strength',
    purpose: 'Begin gentle stretch ONLY once past the acute window.',
    why: 'Stretch is delayed in contusion to avoid MO; introduced gently when swelling has settled (Lempainen 2022).',
    stretch_demand: 'moderate', rom_focus: true,
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-001', 'QUAD-CIT-006'],
    dosage_by_tier: [{ sets: '2', hold: '15 s gentle' }, { sets: '3', hold: '20 s' }, { sets: '3', hold: '30 s' }],
    instructions: ['Bring the heel gently toward the buttock to a mild, pain-free stretch.'],
    regression: 'standing partial stretch', progression: 'full-range stretch',
    cautions: ['Skip entirely if swelling is present or a firm lump is forming.'],
  },

  // ═══ reload: full strength + power, prepare for sport ════════════════════
  {
    id: 'CN-EX-020', name: 'Loaded squat / split squat', block: 'strength_support', phase: 'reload',
    purpose: 'Restore full quad strength and symmetry.',
    why: 'Heavier loading rebuilds force capacity before return.',
    stretch_demand: 'moderate',
    equipment: ['dumbbell', 'gym'], source_refs: ['QUAD-CIT-002', 'QUAD-CIT-016'],
    dosage_by_tier: [{ sets: '3', reps: '8-10' }, { sets: '4', reps: '6-8' }, { sets: '4', reps: '5-6', load: 'heavy' }],
    instructions: ['Add load progressively while pain-free during and next day.'],
    regression: 'CN-EX-012', progression: 'single-leg loaded',
    cautions: [],
  },
  {
    id: 'CN-EX-021', name: 'Jogging build-up', block: 'running_sport_prep', phase: 'reload',
    purpose: 'Reintroduce running once strength and ROM are restored.',
    why: 'Graded running precedes high-speed exposure.',
    stretch_demand: 'moderate', speed_power: 'low_to_moderate',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% straight-line' }, { sets: '—', detail: '70-80%' }, { sets: '—', detail: '80% + strides' }],
    instructions: ['Build pace gradually; stay pain-free.'],
    regression: 'walk-jog', progression: 'CN-EX-030',
    cautions: ['Full pain-free knee flexion ROM first.'],
  },
  {
    id: 'CN-EX-022', name: 'Eccentric step-down control', block: 'control_balance', phase: 'reload',
    purpose: 'Build eccentric quad control for deceleration.',
    why: 'Eccentric control supports landing and cutting before sport.',
    stretch_demand: 'moderate',
    equipment: ['step'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '3', reps: '8 each' }, { sets: '3', reps: '10 each' }, { sets: '3', reps: '12 each' }],
    instructions: ['Lower slowly off a step under control.'],
    regression: 'lower step', progression: 'single-leg squat',
    cautions: [],
  },
  {
    id: 'CN-EX-023', name: 'Double-leg jump & land', block: 'control_balance', phase: 'reload',
    purpose: 'Introduce low-level plyometric loading.',
    why: 'Landing mechanics precede reactive single-leg work.',
    stretch_demand: 'moderate', speed_power: 'moderate',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-001'],
    dosage_by_tier: [{ sets: '3', reps: '6' }, { sets: '3', reps: '8' }, { sets: '4', reps: '8' }],
    instructions: ['Jump and land softly, absorbing evenly through both legs.'],
    regression: 'jump to step', progression: 'single-leg hops',
    cautions: ['Land quietly and controlled.'],
  },
  {
    id: 'CN-EX-024', name: 'Loaded carries / conditioning', block: 'conditioning', phase: 'reload',
    purpose: 'Rebuild general lower-limb conditioning.',
    why: 'Supports work capacity for return to training.',
    stretch_demand: 'low',
    equipment: ['dumbbell'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'moderate carries' }, { sets: '—', detail: 'longer / heavier' }, { sets: '—', detail: 'circuit conditioning' }],
    instructions: ['Carry moderate loads over distance with good posture.'],
    regression: 'lighter', progression: 'heavier / longer',
    cautions: [],
  },

  // ═══ return: sport-specific exposure ═════════════════════════════════════
  {
    id: 'CN-EX-030', name: 'Sprint & change-of-direction build-up', block: 'running_sport_prep', phase: 'return',
    purpose: 'High-speed and cutting exposure before clearance.',
    why: 'Graded high-speed and cutting loading restores sport demand.',
    stretch_demand: 'high', speed_power: 'high',
    equipment: ['bodyweight', 'cones'], source_refs: ['QUAD-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'accelerations + rounded cuts' }, { sets: '—', detail: 'near-max sprint + sharper cuts' }, { sets: '—', detail: 'reactive cutting' }],
    instructions: ['Progress sprint effort and cutting sharpness across sessions.'],
    regression: 'CN-EX-021', progression: 'CN-EX-031',
    cautions: ['Quad size/firmness should equal the uninjured side (Aronen 2006).'],
  },
  {
    id: 'CN-EX-031', name: 'Full sport integration', block: 'running_sport_prep', phase: 'return',
    purpose: 'Full training and match exposure once criteria met.',
    why: 'Final return exposure after strength symmetry and full ROM.',
    stretch_demand: 'high', speed_power: 'high',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-002', 'QUAD-CIT-016'],
    dosage_by_tier: [{ sets: '—', detail: 'modified training' }, { sets: '—', detail: 'full training' }, { sets: '—', detail: 'match' }],
    instructions: ['Integrate into normal training once all criteria are met.'],
    regression: 'partial training', progression: 'competition',
    cautions: [],
  },
  {
    id: 'CN-EX-032', name: 'Return-to-sport criteria check', block: 'control_balance', phase: 'return',
    purpose: 'Objective gate: full pain-free ROM, strength symmetry, no MO signs.',
    why: 'Criteria-based return (strength + hop symmetry) predicts better outcomes (Nawasreh 2016).',
    stretch_demand: 'moderate', speed_power: 'high',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-016', 'QUAD-CIT-001'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'full pain-free knee flexion' }, { sets: '—', detail: 'quad strength symmetry' }, { sets: '—', detail: 'hop symmetry + no firm lump' }],
    instructions: ['Confirm full ROM, symmetric strength/hops, and no signs of myositis ossificans before clearance.'],
    cautions: ['A new firm lump or ROM loss warrants imaging before return.'],
  },
];

export const CONTUSION_STAGES = [
  { id: 'acute_rom', clinical_name: 'Acute — restore ROM', friendly_name: 'Get the knee bending again' },
  { id: 'restore_strength', clinical_name: 'Restore strength', friendly_name: 'Rebuild quad strength' },
  { id: 'reload', clinical_name: 'Reload', friendly_name: 'Full strength and running' },
  { id: 'return', clinical_name: 'Return to sport', friendly_name: 'Sport-specific return' },
];

export function contusionPool(stageId) {
  return CONTUSION_EXERCISES.filter((e) => e.phase === stageId);
}
