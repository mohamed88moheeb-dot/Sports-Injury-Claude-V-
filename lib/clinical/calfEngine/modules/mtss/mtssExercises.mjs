/**
 * lib/clinical/calfEngine/modules/mtss/mtssExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for medial tibial stress syndrome ("shin splints") — an
 * overuse bone/periosteal-load condition of the distal tibia. Management
 * centres on load modification and a graded return to running (Winters
 * 2013), not a fixed muscle/ligament healing clock.
 * ---------------------------------------------------------------------------
 */

export const MTSS_EXERCISES = [
  // ═══ settle_irritability ═══════════════════════════════════════════════
  {
    id: 'MT-EX-001', name: 'Relative rest + cross-training (bike/pool)', block: 'conditioning', phase: 'settle_irritability',
    purpose: 'Maintain conditioning while removing the aggravating running load.',
    why: 'Load modification away from repetitive impact is the first step in settling MTSS (Winters 2013).',
    equipment: ['bike', 'pool'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: '10-15 min low-impact conditioning' }, { sets: '—', detail: '15-20 min' }, { sets: '—', detail: '20-25 min' }],
    instructions: ['Replace running with bike or pool sessions while the shin settles.'],
    regression: 'shorter duration', progression: 'MT-EX-010',
    cautions: ['Stop if the shin is sore during or after the session.'],
  },
  {
    id: 'MT-EX-002', name: 'Pain-free calf raise (isometric)', block: 'tissue_specific_loading', phase: 'settle_irritability',
    purpose: 'Gentle calf/posterior tibial activation without impact.',
    why: 'Gentle isometric loading maintains muscle activation without repetitive bone loading.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '3', hold: '10-15 s', intensity: 'gentle' }, { sets: '3', hold: '15-20 s' }, { sets: '4', hold: '20-30 s' }],
    instructions: ['Rise onto the toes gently, hold, lower slowly, stay pain-free.'],
    regression: 'lower effort', progression: 'MT-EX-011',
    cautions: [],
  },
  {
    id: 'MT-EX-003', name: 'Foot intrinsic strengthening (towel scrunch / short foot)', block: 'strength_support', phase: 'settle_irritability',
    purpose: 'Support the arch and reduce excessive tibial load through the foot.',
    why: 'Foot-intrinsic and arch-support strength is linked to reduced MTSS recurrence risk.',
    equipment: ['towel'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '2-3', reps: '10' }, { sets: '3', reps: '12-15' }, { sets: '3', reps: '15' }],
    instructions: ['Scrunch a towel toward you using only your toes, or practice shortening the arch of the foot without curling the toes.'],
    regression: 'fewer reps', progression: 'MT-EX-012',
    cautions: [],
  },
  {
    id: 'MT-EX-004', name: 'Gentle ankle/calf mobility', block: 'mobility_activation', phase: 'settle_irritability',
    purpose: 'Maintain comfortable ankle range without impact.',
    why: 'Restricted ankle dorsiflexion is associated with increased tibial load during running.',
    equipment: ['bodyweight', 'wall'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '2', hold: '15-20 s gentle calf stretch' }, { sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30 s' }],
    instructions: ['Gentle calf stretch against a wall, stopping at a mild, pain-free tension.'],
    regression: 'smaller range', progression: 'MT-EX-013',
    cautions: [],
  },

  // ═══ restore_load_tolerance ════════════════════════════════════════════
  {
    id: 'MT-EX-010', name: 'Walk-run intervals (low volume)', block: 'running_sport_prep', phase: 'restore_load_tolerance',
    purpose: 'Reintroduce running load in small, controlled doses.',
    why: 'A graded walk-run reintroduction is the core of restoring load tolerance in MTSS.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: '1 min run / 2 min walk x 5-6' }, { sets: '—', detail: '2 min run / 1 min walk x 6-8' }, { sets: '—', detail: '3 min run / 1 min walk x 8' }],
    instructions: ['Keep pace easy; stop and reduce volume if shin pain rises above mild during or after.'],
    regression: 'shorter intervals / more rest', progression: 'MT-EX-020',
    cautions: ['Do not increase both volume and intensity in the same week.'],
  },
  {
    id: 'MT-EX-011', name: 'Single-leg calf raise (partial range)', block: 'tissue_specific_loading', phase: 'restore_load_tolerance',
    purpose: 'Rebuild calf strength progressively.',
    why: 'Calf strength contributes to shock absorption and reduces tibial bending load during running.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10', range: 'partial' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15', range: 'fuller' }],
    instructions: ['Rise onto the toes on one leg, lower slowly.'],
    regression: 'MT-EX-002', progression: 'MT-EX-021',
    cautions: [],
  },
  {
    id: 'MT-EX-012', name: 'Hip abductor / external rotator strengthening', block: 'strength_support', phase: 'restore_load_tolerance',
    purpose: 'Address proximal strength deficits linked to MTSS risk.',
    why: 'Hip abductor weakness is a commonly cited contributing factor in MTSS.',
    equipment: ['band'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '2-3', reps: '12 each side' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Side-lying leg raises or banded side-steps, focusing on hip control.'],
    regression: 'MT-EX-003', progression: 'MT-EX-022',
    cautions: [],
  },
  {
    id: 'MT-EX-013', name: 'Double-leg balance (firm surface)', block: 'control_balance', phase: 'restore_load_tolerance',
    purpose: 'Begin re-establishing lower-leg proprioception.',
    why: 'Balance/control work supports efficient load distribution during return to running.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s' }, { sets: '4', hold: '45 s' }],
    instructions: ['Stand on both feet, even weight distribution.'],
    regression: 'hold support', progression: 'MT-EX-023',
    cautions: [],
  },

  // ═══ build_capacity ════════════════════════════════════════════════════
  {
    id: 'MT-EX-020', name: 'Continuous running build-up', block: 'running_sport_prep', phase: 'build_capacity',
    purpose: 'Progress from intervals to continuous running.',
    why: 'Graded continuous-running volume builds tibial load tolerance progressively.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: '10-15 min continuous, easy pace' }, { sets: '—', detail: '15-20 min' }, { sets: '—', detail: '20-30 min' }],
    instructions: ['Increase duration gradually (no more than ~10% per week); keep pace easy.'],
    regression: 'MT-EX-010', progression: 'MT-EX-030',
    cautions: ['A step back to intervals is fine if shin soreness returns.'],
  },
  {
    id: 'MT-EX-021', name: 'Single-leg calf raise (full range + load)', block: 'tissue_specific_loading', phase: 'build_capacity',
    purpose: 'Build full calf strength and symmetry.',
    why: 'Full calf strength supports higher running volumes and speeds.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '3', reps: '10-12' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Full-range single-leg calf raises, lower slowly.'],
    regression: 'MT-EX-011', progression: 'MT-EX-031',
    cautions: [],
  },
  {
    id: 'MT-EX-022', name: 'Single-leg squat / step-down control', block: 'strength_support', phase: 'build_capacity',
    purpose: 'Build functional single-leg strength and control up the kinetic chain.',
    why: 'Hip and knee control influence tibial loading patterns during running.',
    equipment: ['step'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '2-3', reps: '8 each', depth: 'partial' }, { sets: '3', reps: '10' }, { sets: '3', reps: '12', depth: 'deeper' }],
    instructions: ['Squat/step down slowly, keep the knee tracking over the foot.'],
    regression: 'MT-EX-012', progression: 'MT-EX-032',
    cautions: [],
  },
  {
    id: 'MT-EX-023', name: 'Running cadence / load-technique drill', block: 'running_sport_prep', phase: 'build_capacity',
    purpose: 'Address running mechanics that increase tibial load.',
    why: 'Small increases in step rate (cadence) can reduce peak tibial loading in some runners.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: '2-3 min at slightly higher cadence, several times through a run' }, { sets: '—', detail: 'longer segments' }, { sets: '—', detail: 'full-run cadence awareness' }],
    instructions: ['Try a slightly quicker, shorter stride for short segments during easy runs.'],
    regression: 'MT-EX-013', progression: 'MT-EX-033',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'MT-EX-030', name: 'Full running volume restoration', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Return to pre-injury running volume and intensity.',
    why: 'The final step is restoring full training volume in a graded, monitored way.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: '70-80% of prior volume' }, { sets: '—', detail: '85-90%' }, { sets: '—', detail: '100% + speed work' }],
    instructions: ['Build back toward full volume over several weeks, adding speed work last.'],
    regression: 'MT-EX-020', progression: 'full training',
    cautions: [],
  },
  {
    id: 'MT-EX-031', name: 'Sport-specific running/agility drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Reintroduce sport-specific movement demands.',
    why: 'Sport-specific exposure precedes full training integration.',
    equipment: ['bodyweight', 'cones'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: 'controlled agility patterns' }, { sets: '—', detail: 'faster patterns' }, { sets: '—', detail: 'game-speed agility' }],
    instructions: ['Progress from controlled to game-speed patterns.'],
    regression: 'MT-EX-023', progression: 'full training',
    cautions: [],
  },
  {
    id: 'MT-EX-032', name: 'Ongoing load-management routine', block: 'conditioning', phase: 'return_to_sport',
    purpose: 'Prevent MTSS recurrence with sustained good training habits.',
    why: 'MTSS recurs without ongoing attention to load progression, footwear, and surfaces.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'],
    dosage_by_tier: [{ sets: '—', detail: 'weekly volume increases capped at ~10%' }, { sets: '—', detail: 'ongoing' }, { sets: '—', detail: 'ongoing' }],
    instructions: ['Keep weekly running-volume increases modest and monitor shin symptoms as training resumes.'],
    regression: 'reduce volume increases', progression: 'periodise with season',
    cautions: [],
  },
  {
    id: 'MT-EX-033', name: 'Return-to-running criteria check', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate: pain-free running at target volume/pace, strength symmetry.',
    why: 'A criteria-based check reduces the chance of returning before load tolerance is truly restored.',
    equipment: ['bodyweight'], source_refs: ['CALF-CIT-004'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'pain-free at current volume' }, { sets: '—', detail: 'calf/hip strength symmetry' }, { sets: '—', detail: 'pain-free at full target volume/pace' }],
    instructions: ['Confirm pain-free running at the current volume and symmetric calf/hip strength before increasing further.'],
    cautions: ['A return of focal, sharp pain should prompt reassessment for stress fracture, not just "pushing through."'],
  },
];

/** Pool for a given stage. */
export function mtssPool(stageId) {
  return MTSS_EXERCISES.filter((e) => e.phase === stageId);
}
