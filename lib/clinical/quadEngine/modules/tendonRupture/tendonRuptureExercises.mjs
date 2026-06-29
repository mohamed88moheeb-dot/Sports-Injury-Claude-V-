/**
 * lib/clinical/quadEngine/modules/tendonRupture/tendonRuptureExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for quad / patellar TENDON RUPTURE — POST-OPERATIVE only.
 * Every item is clinician-gated and conservative. The engine NEVER auto-advances
 * a rupture; it surfaces stage-appropriate options for a clinician to approve.
 *
 * Timeline (Langenhan 2012; Lee 2013; Ibounig 2015):
 *   protected (wk 0-6): full WB knee locked in extension; limited-arc motion —
 *     active flexion + passive extension; quad isometrics/SLR as permitted
 *   mobility (wk 6-12): progressive ROM, wean brace
 *   strength (mo 3-5): progressive strengthening (BFR useful early — Hughes 2019)
 *   return (mo 5+): graded, criteria-based return (Nawasreh 2016)
 *
 * Deepened library: ~20 exercises. All beta_default, all clinician_gated.
 * ---------------------------------------------------------------------------
 */

export const RUPTURE_EXERCISES = [
  // ═══ protected (weeks 0-6) ═══════════════════════════════════════════════
  {
    id: 'TR-EX-001', name: 'Quad isometric set (in brace, knee extended)', block: 'tissue_specific_loading', phase: 'protected',
    purpose: 'Maintain quad activation without stressing the repair.',
    why: 'Gentle isometrics limit atrophy while the repair is protected (Lee 2013).',
    equipment: ['brace'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '3', hold: '5 s', note: 'only if permitted by surgeon' }],
    instructions: ['With the brace locked in extension, gently tighten the thigh, hold, release.'],
    regression: 'fewer reps', progression: 'TR-EX-002',
    cautions: ['Only if your surgeon has cleared isometrics.'],
  },
  {
    id: 'TR-EX-002', name: 'Straight-leg raise (brace locked)', block: 'strength_support', phase: 'protected',
    purpose: 'Quad activation in a protected long lever.',
    why: 'SLR with brace locked maintains quad control without active knee extension load.',
    equipment: ['brace'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '2-3', reps: '5-8', note: 'brace locked in extension' }],
    instructions: ['Brace locked straight, raise the whole leg, lower slowly.'],
    regression: 'reduce range', progression: 'TR-EX-010',
    cautions: ['Stop if there is any pulling at the repair site.'],
  },
  {
    id: 'TR-EX-003', name: 'Passive knee extension + active flexion (limited arc)', block: 'mobility_activation', phase: 'protected',
    purpose: 'Begin protected ROM without loading the repair into extension.',
    why: 'Early limited-arc motion uses ACTIVE flexion + PASSIVE extension to protect the repair (Lee 2013).',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-013', 'QUAD-CIT-012'], clinician_gated: true,
    dosage_by_tier: [{ sets: '2-3', detail: 'within surgeon-set range only' }],
    instructions: ['Bend the knee actively to the allowed limit; let it straighten passively (do not push into extension with the quad).'],
    regression: 'smaller arc', progression: 'TR-EX-010',
    cautions: ['Respect the surgeon-set ROM limits exactly.'],
  },
  {
    id: 'TR-EX-004', name: 'Patellar mobilisation (gentle)', block: 'mobility_activation', phase: 'protected',
    purpose: 'Prevent patellar stiffness/adhesions early.',
    why: 'Gentle patellar glides reduce post-op stiffness, a known complication (Lee 2013).',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'gentle glides, as taught by clinician' }],
    instructions: ['Gently move the kneecap up/down and side/side within comfort, as instructed.'],
    regression: 'lighter', progression: 'self-managed glides',
    cautions: ['Only as taught by your clinician.'],
  },
  {
    id: 'TR-EX-005', name: 'Protected weight-bearing gait (brace, crutches)', block: 'control_balance', phase: 'protected',
    purpose: 'Restore safe walking with the repair protected.',
    why: 'Full weight-bearing with the knee locked in extension is safe early and speeds recovery (Langenhan 2012).',
    equipment: ['brace', 'crutches'], source_refs: ['QUAD-CIT-012', 'QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'WB as permitted, brace locked, crutch support' }],
    instructions: ['Walk with the brace locked straight and crutches, bearing weight as allowed.'],
    regression: 'partial WB', progression: 'wean crutches',
    cautions: ['Follow the surgeon\'s weight-bearing instructions.'],
  },

  // ═══ mobility (weeks 6-12) ═══════════════════════════════════════════════
  {
    id: 'TR-EX-010', name: 'Progressive active ROM (wean brace)', block: 'mobility_activation', phase: 'mobility',
    purpose: 'Restore full active knee range as the repair consolidates.',
    why: 'ROM is advanced progressively after the protected phase (Lee 2013; Ibounig 2015).',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-013', 'QUAD-CIT-014'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'increase range per clinician schedule' }],
    instructions: ['Work into greater flexion and active extension as your clinician allows.'],
    regression: 'limited arc', progression: 'full ROM',
    cautions: ['Brace weaning timing is your clinician\'s decision.'],
  },
  {
    id: 'TR-EX-011', name: 'Stationary cycling (light)', block: 'conditioning', phase: 'mobility',
    purpose: 'Restore ROM and condition without impact.',
    why: 'Low-load cycling aids ROM recovery once flexion permits.',
    equipment: ['bike'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: '5-15 min light, once flexion allows a full pedal stroke' }],
    instructions: ['Begin once you can complete a pedal revolution comfortably.'],
    regression: 'half revolutions', progression: 'add resistance',
    cautions: [],
  },
  {
    id: 'TR-EX-012', name: 'Mini-squat / sit-to-stand (partial range)', block: 'strength_support', phase: 'mobility',
    purpose: 'Reintroduce closed-chain loading in a safe range.',
    why: 'Partial-range closed-chain work rebuilds function as ROM returns (Lee 2013).',
    equipment: ['bodyweight', 'chair'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '2-3', reps: '8-10 partial range' }],
    instructions: ['Sit-to-stand or mini-squat within the cleared range, controlling the descent.'],
    regression: 'higher seat', progression: 'TR-EX-020',
    cautions: ['Stay within cleared ROM.'],
  },
  {
    id: 'TR-EX-013', name: 'BFR low-load quad work', block: 'tissue_specific_loading', phase: 'mobility',
    purpose: 'Rebuild quad size/strength with minimal joint/repair stress.',
    why: 'Low-load BFR matched heavy-load gains with less pain/effusion early post-op (Hughes 2019).',
    equipment: ['bfr_cuff', 'machine'], source_refs: ['QUAD-CIT-015'], clinician_gated: true, requires_supervision: true,
    dosage_by_tier: [{ sets: '4', reps: '30/15/15/15', intensity: '20-30% 1RM', cuff: '~80% AOP', note: 'surgeon-cleared' }],
    instructions: ['Supervised cuff application; low-load reps within cleared range.'],
    regression: 'isometric only', progression: 'TR-EX-020',
    cautions: ['Surgeon clearance + supervision required; not with circulatory contraindications.'],
  },
  {
    id: 'TR-EX-014', name: 'Balance & proprioception (double -> single leg)', block: 'control_balance', phase: 'mobility',
    purpose: 'Restore joint position sense and standing control.',
    why: 'Proprioceptive work re-establishes control before strengthening loads.',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'double-leg -> single-leg stance, eyes open -> closed' }],
    instructions: ['Progress from double- to single-leg balance as control allows.'],
    regression: 'support', progression: 'unstable surface',
    cautions: [],
  },

  // ═══ strength (months 3-5) ═══════════════════════════════════════════════
  {
    id: 'TR-EX-020', name: 'Progressive closed-chain strengthening', block: 'strength_support', phase: 'strength',
    purpose: 'Rebuild quad strength after ROM is restored.',
    why: 'Strengthening follows full active ROM (Lee 2013).',
    equipment: ['bodyweight', 'gym'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'mini-squats -> squats -> loaded, per clinician' }],
    instructions: ['Progress from partial-range bodyweight squats to loaded strength work as cleared.'],
    regression: 'TR-EX-012', progression: 'TR-EX-021',
    cautions: ['Re-rupture risk persists — progress only with clinician approval.'],
  },
  {
    id: 'TR-EX-021', name: 'Leg press / knee extension (graded)', block: 'tissue_specific_loading', phase: 'strength',
    purpose: 'Targeted quad strengthening through range.',
    why: 'Graded open- and closed-chain loading rebuilds force capacity.',
    equipment: ['machine', 'gym'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'light -> moderate -> heavy across weeks' }],
    instructions: ['Add load gradually as strength and comfort return.'],
    regression: 'TR-EX-020', progression: 'TR-EX-022',
    cautions: ['Avoid painful terminal-range extension early.'],
  },
  {
    id: 'TR-EX-022', name: 'Single-leg strength + eccentric control', block: 'strength_support', phase: 'strength',
    purpose: 'Close the limb-symmetry gap and build eccentric control.',
    why: 'Single-leg and eccentric work targets the persistent post-op strength deficit.',
    equipment: ['gym', 'step'], source_refs: ['QUAD-CIT-013', 'QUAD-CIT-016'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'split squats, step-downs, single-leg press' }],
    instructions: ['Progress single-leg strength and controlled lowering as cleared.'],
    regression: 'double-leg', progression: 'loaded single-leg',
    cautions: [],
  },
  {
    id: 'TR-EX-023', name: 'Low-impact conditioning (bike/pool)', block: 'conditioning', phase: 'strength',
    purpose: 'Rebuild aerobic and muscular conditioning without impact.',
    why: 'Supports return-to-activity work capacity while protecting the repair.',
    equipment: ['bike', 'pool'], source_refs: ['QUAD-CIT-013'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'progressive duration/intensity' }],
    instructions: ['Build conditioning via bike or pool before land-based running.'],
    regression: 'shorter', progression: 'TR-EX-030',
    cautions: [],
  },

  // ═══ return (months 5+) ══════════════════════════════════════════════════
  {
    id: 'TR-EX-030', name: 'Graded return to running', block: 'running_sport_prep', phase: 'return',
    purpose: 'Reintroduce running once strength/ROM milestones are met.',
    why: 'Return to running follows restored strength and is criteria-based (Ibounig 2015).',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-014', 'QUAD-CIT-016'], clinician_gated: true,
    dosage_by_tier: [{ sets: '—', detail: 'walk-jog -> jog -> run, clinician-led' }],
    instructions: ['Follow a graded running progression once cleared.'],
    regression: 'walk-jog', progression: 'TR-EX-031',
    cautions: ['Requires clinician clearance and adequate strength.'],
  },
  {
    id: 'TR-EX-031', name: 'Graded return to sport & criteria battery', block: 'running_sport_prep', phase: 'return',
    purpose: 'Sport-specific exposure with an objective return gate.',
    why: 'Return typically 3-5+ months post-op; criteria battery (strength + hop symmetry >=90%) predicts better outcomes (Lempainen 2022; Nawasreh 2016; Thompson 2022).',
    equipment: ['bodyweight'], source_refs: ['QUAD-CIT-001', 'QUAD-CIT-016', 'QUAD-CIT-017'], clinician_gated: true, is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'sport drills + strength/hop LSI >=90% + clinician clearance' }],
    instructions: ['Build sport-specific drills and pass a strength + hop criteria battery before full return.'],
    regression: 'reduce intensity', progression: 'full competition',
    cautions: ['Return requires strength symmetry AND clinician clearance — not hop symmetry alone.'],
  },
];

export function rupturePool(stageId) {
  return RUPTURE_EXERCISES.filter((e) => e.phase === stageId);
}
