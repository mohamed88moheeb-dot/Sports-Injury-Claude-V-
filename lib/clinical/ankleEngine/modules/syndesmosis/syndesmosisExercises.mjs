/**
 * lib/clinical/ankleEngine/modules/syndesmosis/syndesmosisExercises.mjs
 * ---------------------------------------------------------------------------
 * Exercise library for STABLE syndesmotic ("high") ankle sprains — no
 * diastasis/instability (those are safety-gated to referral). Same 4-stage
 * functional model as lateral sprain, but progression is slower and early
 * work avoids forced dorsiflexion + external rotation, which stresses the
 * syndesmosis directly (Williams 2015).
 * ---------------------------------------------------------------------------
 */

export const SYNDESMOSIS_EXERCISES = [
  // ═══ protect ═══════════════════════════════════════════════════════════
  {
    id: 'SY-EX-001', name: 'Pain-free plantarflexion/inversion-range ankle pumps', block: 'mobility_activation', phase: 'protect',
    purpose: 'Gentle movement that avoids the dorsiflexion/external-rotation directions that load the syndesmosis.',
    why: 'Limiting dorsiflexion + external rotation early avoids stressing the healing syndesmotic ligaments (Williams 2015).',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '3-4', detail: 'gentle pain-free pumps, avoid pushing the foot upward/outward' }, { sets: '4', detail: 'slightly larger pain-free range' }, { sets: '4', detail: 'full pain-free plantarflexion/inversion range' }],
    instructions: ['Move the ankle gently, staying away from forcing the toes up toward the shin or twisting the foot outward.'],
    regression: 'smaller range', progression: 'SY-EX-010',
    cautions: ['Avoid forced dorsiflexion or external rotation early.'],
  },
  {
    id: 'SY-EX-002', name: 'Protected weight-bearing (boot/brace as directed)', block: 'control_balance', phase: 'protect',
    purpose: 'Restore safe walking without stressing the syndesmosis.',
    why: 'Protected weight-bearing is appropriate for stable syndesmotic sprains without diastasis (Williams 2015).',
    equipment: ['brace_or_boot'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '—', detail: 'weight-bear as directed/tolerated, supportive boot/brace if provided' }, { sets: '—', detail: 'increase walking distance as tolerated' }, { sets: '—', detail: 'walking without a limp' }],
    instructions: ['Follow any boot/brace guidance you were given.', 'Avoid limping — reduce distance if you cannot walk normally.'],
    regression: 'crutches/partial weight-bear', progression: 'SY-EX-011',
    cautions: ['Syndesmosis sprains are generally slower to settle than a lateral sprain — be patient with this stage.'],
  },
  {
    id: 'SY-EX-003', name: 'Isometric ankle activation (plantarflexion/inversion bias)', block: 'tissue_specific_loading', phase: 'protect',
    purpose: 'Gentle muscle activation avoiding syndesmosis-loading directions.',
    why: 'Isometric activation maintains neuromuscular drive without stressing the syndesmosis through range.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '3', hold: '10 s', intensity: 'gentle, plantarflexion/inversion directions only' }, { sets: '3', hold: '15-20 s' }, { sets: '4', hold: '20-30 s' }],
    instructions: ['Push the foot gently downward and inward against resistance without moving it.'],
    regression: 'lower effort', progression: 'SY-EX-012',
    cautions: ['Skip resisted dorsiflexion/eversion until the restore_motion stage.'],
  },
  {
    id: 'SY-EX-004', name: 'Elevation + gentle compression routine', block: 'conditioning', phase: 'protect',
    purpose: 'Support swelling reduction between active sessions.',
    why: 'Elevation and gentle compression assist early swelling control.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: 'elevate above heart level for 15-20 min, several times daily' }, { sets: '—', detail: 'as needed' }, { sets: '—', detail: 'as needed' }],
    instructions: ['Rest with the ankle elevated between activity.'],
    regression: 'more frequent rest', progression: 'less needed as swelling settles',
    cautions: [],
  },

  // ═══ restore_motion ════════════════════════════════════════════════════
  {
    id: 'SY-EX-010', name: 'Gentle progressive dorsiflexion range', block: 'mobility_activation', phase: 'restore_motion',
    purpose: 'Carefully reintroduce the dorsiflexion range once the acute phase has settled.',
    why: 'Dorsiflexion range must return, but is reintroduced gradually rather than forced, given syndesmosis load in that direction.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '2-3', detail: 'small pain-free dorsiflexion range' }, { sets: '3', detail: 'building range gradually' }, { sets: '3', detail: 'approaching full pain-free range' }],
    instructions: ['Gently work toward bringing the toes up toward the shin, stopping well short of any pain or pinching.'],
    regression: 'SY-EX-001', progression: 'SY-EX-020',
    cautions: ['Progress this direction slower than you might expect — it is the syndesmosis-loading direction.'],
  },
  {
    id: 'SY-EX-011', name: 'Resisted band work (plantarflexion/inversion emphasis, gentle dorsiflexion/eversion)', block: 'tissue_specific_loading', phase: 'restore_motion',
    purpose: 'Rebuild strength while still respecting syndesmosis-loading directions.',
    why: 'Progressive resisted loading rebuilds capacity; dorsiflexion/eversion load is added later and more gradually than for a lateral sprain.',
    equipment: ['band'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '2-3', reps: '10, light on dorsiflexion/eversion' }, { sets: '3', reps: '12-15' }, { sets: '3', reps: '15', load: 'stronger band' }],
    instructions: ['Loop a band around the foot; push firmly into plantarflexion/inversion, gently into dorsiflexion/eversion.'],
    regression: 'SY-EX-003', progression: 'SY-EX-021',
    cautions: [],
  },
  {
    id: 'SY-EX-012', name: 'Double-leg calf raise (partial range)', block: 'strength_support', phase: 'restore_motion',
    purpose: 'Rebuild calf strength without pushing into end-range dorsiflexion.',
    why: 'Calf strength contributes to ankle stability; range is kept partial early to limit syndesmosis load.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '2-3', reps: '10-12', range: 'partial' }, { sets: '3', reps: '15' }, { sets: '3', reps: '15-20', range: 'fuller' }],
    instructions: ['Rise onto the toes, lower slowly, avoid forcing the heel down hard at the bottom.'],
    regression: 'shorter range', progression: 'SY-EX-022',
    cautions: [],
  },
  {
    id: 'SY-EX-013', name: 'Double-leg balance (firm surface)', block: 'control_balance', phase: 'restore_motion',
    purpose: 'Begin re-establishing balance and proprioception.',
    why: 'Balance training reduces re-sprain risk and can start once acute pain has settled (Schiftan 2015).',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s' }, { sets: '4', hold: '45 s, eyes closed' }],
    instructions: ['Stand on both feet on a stable surface, even weight distribution.'],
    regression: 'hold support', progression: 'SY-EX-023',
    cautions: [],
  },

  // ═══ strength_balance ══════════════════════════════════════════════════
  {
    id: 'SY-EX-020', name: 'Single-leg balance (firm -> unstable surface)', block: 'control_balance', phase: 'strength_balance',
    purpose: 'Progress balance/proprioception toward sport demands.',
    why: 'Single-leg balance progression reduces re-injury risk (Schiftan 2015).',
    equipment: ['bodyweight', 'balance_pad'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', hold: '20-30 s' }, { sets: '3', hold: '30-45 s, add pad' }, { sets: '4', hold: '45 s, pad + head turns' }],
    instructions: ['Stand on the injured leg only, progress to an unstable surface as it gets easy.'],
    regression: 'SY-EX-013', progression: 'SY-EX-030',
    cautions: [],
  },
  {
    id: 'SY-EX-021', name: 'Full-range resisted 4-way ankle strengthening', block: 'tissue_specific_loading', phase: 'strength_balance',
    purpose: 'Complete the strength picture through full range in all directions.',
    why: 'By this stage the syndesmosis should tolerate full-range loading in all planes with normal progression.',
    equipment: ['band'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '3', reps: '12 each direction' }, { sets: '3', reps: '15 each' }, { sets: '4', reps: '15 each', load: 'stronger band' }],
    instructions: ['Push against the band in all 4 directions through full pain-free range.'],
    regression: 'SY-EX-011', progression: 'SY-EX-031',
    cautions: [],
  },
  {
    id: 'SY-EX-022', name: 'Single-leg calf raise (full range)', block: 'strength_support', phase: 'strength_balance',
    purpose: 'Build single-leg push-off strength and symmetry.',
    why: 'Closing the single-leg calf strength gap is needed before running/jumping loads.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-002'],
    dosage_by_tier: [{ sets: '2-3', reps: '8-10' }, { sets: '3', reps: '12' }, { sets: '3', reps: '15', load: 'add weight' }],
    instructions: ['Rise onto the toes on the injured leg only, full range, lower slowly.'],
    regression: 'SY-EX-012', progression: 'SY-EX-032',
    cautions: [],
  },
  {
    id: 'SY-EX-023', name: 'Jogging build-up (straight line)', block: 'running_sport_prep', phase: 'strength_balance',
    purpose: 'Reintroduce running load progressively.',
    why: 'Graded straight-line running is introduced once full-range strength work is comfortable.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-002'],
    dosage_by_tier: [{ sets: '—', detail: '60-70% effort, straight-line' }, { sets: '—', detail: '70-80% effort' }, { sets: '—', detail: '80% with strides' }],
    instructions: ['Build pace over the session, stay pain-free.'],
    regression: 'walk-jog intervals', progression: 'SY-EX-030',
    cautions: [],
  },
  {
    id: 'SY-EX-024', name: 'Double-leg to single-leg hop and stick', block: 'control_balance', phase: 'strength_balance',
    purpose: 'Introduce low-level landing control.',
    why: 'Landing control precedes reactive single-leg plyometrics.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', reps: '6' }, { sets: '3', reps: '8, single-leg landing' }, { sets: '4', reps: '8, single-leg' }],
    instructions: ['Hop forward and stick the landing softly, progressing to single-leg.'],
    regression: 'smaller hop', progression: 'SY-EX-031',
    cautions: [],
  },

  // ═══ return_to_sport ═══════════════════════════════════════════════════
  {
    id: 'SY-EX-030', name: 'Single-leg reactive balance (perturbation)', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'High-level reactive balance and control.',
    why: 'Reactive/perturbation balance training supports confident return to unpredictable sport movement.',
    equipment: ['bodyweight', 'balance_pad'], source_refs: ['ANKLE-CIT-007'],
    dosage_by_tier: [{ sets: '3', reps: '30 s reactive holds' }, { sets: '3', reps: '45 s with perturbation' }, { sets: '4', reps: '45 s with sport-specific distraction' }],
    instructions: ['Balance on the injured leg while reacting to small pushes or an unstable surface.'],
    regression: 'SY-EX-020', progression: 'maintain ongoing',
    cautions: [],
  },
  {
    id: 'SY-EX-031', name: 'Change-of-direction / cutting drills', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Sport-specific cutting and rotational exposure.',
    why: 'Cutting and rotational loading are reintroduced last, given the syndesmosis is the tissue most stressed by rotation.',
    equipment: ['bodyweight', 'cones'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '—', detail: 'planned wide-angle cuts' }, { sets: '—', detail: 'sharper / faster cuts' }, { sets: '—', detail: 'reactive cutting' }],
    instructions: ['Progress from planned, gentle direction changes to sharper and reactive cutting.'],
    regression: 'SY-EX-023', progression: 'SY-EX-032',
    cautions: ['This is the highest-load direction for the syndesmosis — progress conservatively.'],
  },
  {
    id: 'SY-EX-032', name: 'Sport-specific skill loading', block: 'running_sport_prep', phase: 'return_to_sport',
    purpose: 'Integrate the ankle into sport-specific movements.',
    why: 'Skill-specific exposure precedes full training volume.',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-006'],
    dosage_by_tier: [{ sets: '—', detail: 'controlled skill reps' }, { sets: '—', detail: 'rising volume/intensity' }, { sets: '—', detail: 'near-match intensity' }],
    instructions: ['Build sport-specific skill volume toward match demands.'],
    regression: 'reduce intensity', progression: 'SY-EX-033',
    cautions: [],
  },
  {
    id: 'SY-EX-033', name: 'Return-to-sport criteria battery', block: 'control_balance', phase: 'return_to_sport',
    purpose: 'Objective gate before full return: strength + hop symmetry + pain-free rotation/cutting.',
    why: 'Syndesmosis sprains need a more conservative return gate than lateral sprains given the rotational demand of sport (Williams 2015).',
    equipment: ['bodyweight'], source_refs: ['ANKLE-CIT-006', 'ANKLE-CIT-007'], is_test: true,
    dosage_by_tier: [{ sets: '—', detail: 'single + triple hop LSI' }, { sets: '—', detail: 'calf strength LSI' }, { sets: '—', detail: 'all >=90% + pain-free cutting/pivoting' }],
    instructions: ['Confirm symmetric hop/strength AND pain-free cutting and pivoting before full return.'],
    cautions: ['Do not clear on straight-line running alone — cutting/pivoting must also be pain-free.'],
  },
];

/** Pool for a given stage. */
export function syndesmosisPool(stageId) {
  return SYNDESMOSIS_EXERCISES.filter((e) => e.phase === stageId);
}
