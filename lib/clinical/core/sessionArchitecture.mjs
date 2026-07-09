/**
 * lib/clinical/core/sessionArchitecture.mjs
 * ---------------------------------------------------------------------------
 * The 7-block session skeleton + phase×block emphasis matrix.
 *
 * Model (challenged & agreed): a FIXED session skeleton whose blocks' presence,
 * emphasis, exercise-selection mode and dose SLIDE by phase — not blocks that
 * accumulate with a single intensity dial. Only sport reintegration truly
 * toggles on partway; injured-tissue loading is withheld in the acute window.
 *
 * emphasis: 0 = block absent this phase
 *           1 = light / primer
 *           2 = standard
 *           3 = primary focus of the session
 *
 * This is the reusable lower-limb muscle-injury template (seeded from RF). Other
 * injuries can override the matrix/modes but inherit the same 7-block contract.
 * ---------------------------------------------------------------------------
 */

/** Canonical ordered blocks — the order they run in a session. */
export const BLOCKS = Object.freeze([
  { id: 'warmup',              name: 'Warm-up (RAMP)',        role: 'Raise, activate, mobilise, potentiate — prepare tissue & CNS.' },
  { id: 'activation',          name: 'Activation & priming',  role: 'Low-load neuromuscular priming of the injured muscle + kinetic chain.' },
  { id: 'main_loading',        name: 'Main tissue loading',   role: 'The dose-response driver: isometric → heavy-slow → eccentric → energy-storage.' },
  { id: 'strength_support',    name: 'Strength & kinetic chain', role: 'Load the surrounding chain (glute, hip, trunk) to protect the injured tissue.' },
  { id: 'motor_control',       name: 'Motor control & balance', role: 'Restore single-leg control, proprioception, movement quality.' },
  { id: 'sport_reintegration', name: 'Sport reintegration',   role: 'Running mechanics → COD → plyometrics → sport skill. Absent early.' },
  { id: 'cooldown',            name: 'Cooldown & recovery',   role: 'Down-regulate, brief mobility, recovery guidance (sleep/nutrition/load).' },
]);

export const BLOCK_IDS = Object.freeze(BLOCKS.map((b) => b.id));

export const PHASES = Object.freeze([
  'foundation', 'reload', 'accumulation', 'transition', 'simulation', 'resilience',
]);

/** How the main-loading block's contraction/selection mode progresses by phase. */
export const MAIN_LOADING_MODE = Object.freeze({
  foundation:   'isometric',                 // pain-free static holds (withheld in acute sub-window)
  reload:       'through_range_concentric',  // submax full-ROM loading
  accumulation: 'eccentric',                 // slow eccentric, heavy-slow resistance
  transition:   'eccentric_at_speed',        // eccentric under increasing velocity
  simulation:   'energy_storage',            // plyometric / stretch-shortening, maintenance strength
  resilience:   'maintenance',               // maintain capacity, robustness
});

/**
 * Phase × block emphasis matrix. `emphasis` 0–3 (0 = absent).
 * Warm-up, activation, strength, motor control and cooldown are present every
 * phase (their content slides); sport reintegration is 0 until accumulation.
 */
export const PHASE_BLOCK_MATRIX = Object.freeze({
  foundation:   { warmup: 2, activation: 3, main_loading: 1, strength_support: 1, motor_control: 1, sport_reintegration: 0, cooldown: 2 },
  reload:       { warmup: 2, activation: 2, main_loading: 3, strength_support: 2, motor_control: 2, sport_reintegration: 0, cooldown: 2 },
  accumulation: { warmup: 2, activation: 2, main_loading: 3, strength_support: 3, motor_control: 2, sport_reintegration: 1, cooldown: 2 },
  transition:   { warmup: 2, activation: 2, main_loading: 2, strength_support: 2, motor_control: 2, sport_reintegration: 3, cooldown: 2 },
  simulation:   { warmup: 3, activation: 1, main_loading: 1, strength_support: 2, motor_control: 1, sport_reintegration: 3, cooldown: 2 },
  resilience:   { warmup: 2, activation: 1, main_loading: 1, strength_support: 2, motor_control: 1, sport_reintegration: 3, cooldown: 2 },
});

/** Per-phase warm-up character (RAMP emphasis shifts toward potentiation late). */
export const WARMUP_MODE = Object.freeze({
  foundation:   'raise_mobilise',            // gentle pulse-raise + ROM only
  reload:       'raise_mobilise_activate',
  accumulation: 'raise_mobilise_activate',
  transition:   'ramp_with_potentiation',
  simulation:   'sport_specific_potentiation',
  resilience:   'sport_specific_potentiation',
});

/**
 * Returns the ordered, present blocks for a phase with their emphasis and mode.
 * @param {string} phase
 * @returns {{ id, name, role, emphasis, mode? }[]}
 */
export function sessionSkeletonForPhase(phase) {
  const row = PHASE_BLOCK_MATRIX[phase];
  if (!row) throw new Error(`Unknown phase: ${phase}`);
  return BLOCKS
    .filter((b) => row[b.id] > 0)
    .map((b) => {
      const out = { id: b.id, name: b.name, role: b.role, emphasis: row[b.id] };
      if (b.id === 'main_loading') out.mode = MAIN_LOADING_MODE[phase];
      if (b.id === 'warmup') out.mode = WARMUP_MODE[phase];
      return out;
    });
}

export function isBlockPresent(phase, blockId) {
  return (PHASE_BLOCK_MATRIX[phase]?.[blockId] || 0) > 0;
}
