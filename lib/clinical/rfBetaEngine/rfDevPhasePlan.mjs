/**
 * lib/clinical/rfBetaEngine/rfDevPhasePlan.mjs
 * ---------------------------------------------------------------------------
 * Development-mode phase plan. Assigns all 107 RF-EX objects to appropriate
 * phases and provides block classifications for exercises that were left as
 * 'unknown' in the original library authoring.
 *
 * In dev mode this replaces the prescription rule pack as the exercise source,
 * bypassing manual_review_required / high_caution gates which are a
 * clinical-approval concern, not a dev-build concern.
 *
 * Phase rationale (Aspetar 6-phase):
 *   Foundation    — protect, calm, gentle activation, basic mobility
 *   Reload        — active loading, submax strength, hip/quad re-introduction
 *   Accumulation  — progressive strength, eccentric, early running mechanics
 *   Transition    — acceleration/decel, landing, COD, eccentric under speed
 *   Simulation    — sport-specific running, kicking, plyometrics
 *   Resilience    — full performance, game-based, maintenance strength
 * ---------------------------------------------------------------------------
 */

/**
 * Block classification overrides for exercises that shipped as 'unknown'.
 * Keys are RF-EX IDs; values are the SESSION_BLOCK they belong to.
 * This only applies in dev mode — the clinical library objects are unchanged.
 */
export const DEV_BLOCK_OVERRIDE = {
  // ── Isometrics / activation ────────────────────────────────────────────
  'RF-EX-001': 'tissue_specific_loading',   // Reclined knee extension ISO
  'RF-EX-002': 'tissue_specific_loading',   // Hip-flexed knee extension
  'RF-EX-003': 'tissue_specific_loading',   // Hip-extended knee extension
  'RF-EX-007': 'tissue_specific_loading',   // Half-kneeling hip flexion
  'RF-EX-008': 'tissue_specific_loading',   // Inclined trunk hip flexion
  'RF-EX-010': 'tissue_specific_loading',   // Knee-flexed hip flexion
  'RF-EX-011': 'tissue_specific_loading',   // Knee-extended hip flexion
  'RF-EX-022': 'tissue_specific_loading',   // Generic quad isometric
  'RF-EX-023': 'tissue_specific_loading',   // Active knee extension ROM
  'RF-EX-024': 'mobility_activation',       // Active knee flexion ROM
  // ── Mobility / movement restoration ───────────────────────────────────
  'RF-EX-026': 'mobility_activation',       // Half-kneeling pelvic tilt max flexion
  'RF-EX-027': 'mobility_activation',       // Supine hamstring dynamic mobility
  'RF-EX-028': 'mobility_activation',       // Hamstring dynamic mobility fitball
  'RF-EX-029': 'mobility_activation',       // Leg swings
  'RF-EX-085': 'mobility_activation',       // Well-leg gravity-assisted knee flexion
  // ── Strength / loading ─────────────────────────────────────────────────
  'RF-EX-017': 'strength_support',          // Double-leg squat
  'RF-EX-018': 'strength_support',          // Mini single-leg squat
  'RF-EX-019': 'strength_support',          // Single-leg squat
  'RF-EX-035': 'strength_support',          // Unilateral hip thrust
  'RF-EX-086': 'strength_support',          // Full/deep squat restricted context
  'RF-EX-087': 'strength_support',          // Generic weight-training exposure
  // ── Eccentric / high-load ─────────────────────────────────────────────
  'RF-EX-009': 'tissue_specific_loading',   // Lengthened hip-flexor hold
  'RF-EX-100': 'tissue_specific_loading',   // Long-lever hip-flexor hold
  'RF-EX-101': 'tissue_specific_loading',   // Assisted slow hip-flexor lowering
  'RF-EX-102': 'tissue_specific_loading',   // Machine-assisted hip-flexor lowering
  'RF-EX-103': 'tissue_specific_loading',   // Reverse Nordic supported
  'RF-EX-104': 'strength_support',          // Sissy squat
  'RF-EX-105': 'strength_support',          // Spanish squat
  // ── Plyometric / power ─────────────────────────────────────────────────
  'RF-EX-037': 'running_sport_prep',        // Plyometric glute bridge
  'RF-EX-038': 'running_sport_prep',        // Plyometric hip thrust
  'RF-EX-045': 'running_sport_prep',        // Bounding drill
  'RF-EX-059': 'running_sport_prep',        // Squat jump
  'RF-EX-060': 'running_sport_prep',        // Hopping drill
  'RF-EX-061': 'running_sport_prep',        // Countermovement jump
  'RF-EX-062': 'running_sport_prep',        // Drop jump
  'RF-EX-063': 'running_sport_prep',        // Integrated limb reactivity drill
  'RF-EX-064': 'running_sport_prep',        // Low-level hopping
  'RF-EX-106': 'running_sport_prep',        // Jumping lunge switch
  // ── Running exposure ───────────────────────────────────────────────────
  'RF-EX-051': 'running_sport_prep',        // Acceleration practice
  'RF-EX-052': 'running_sport_prep',        // Deceleration mechanics drill
  'RF-EX-053': 'running_sport_prep',        // COD mechanics drill
  'RF-EX-054': 'running_sport_prep',        // Short-distance running exposure
  'RF-EX-055': 'running_sport_prep',        // Moderate-distance running exposure
  'RF-EX-056': 'running_sport_prep',        // Acceleration exposure
  'RF-EX-073': 'running_sport_prep',        // Sport-specific running
  'RF-EX-074': 'running_sport_prep',        // Mixed running exposure
  'RF-EX-075': 'running_sport_prep',        // High-speed running exposure
  'RF-EX-076': 'running_sport_prep',        // Sprint exposure
  'RF-EX-077': 'running_sport_prep',        // Dynamic agility exposure
  'RF-EX-078': 'conditioning',              // Walking exposure
  'RF-EX-079': 'conditioning',              // Jogging / light-jogging exposure
  // ── Kicking ────────────────────────────────────────────────────────────
  'RF-EX-065': 'running_sport_prep',        // Open-chain kicking pattern
  'RF-EX-066': 'running_sport_prep',        // Static isolated kicking
  'RF-EX-067': 'running_sport_prep',        // Controlled kicking exposure
  'RF-EX-068': 'running_sport_prep',        // Resisted kicking practice
  'RF-EX-069': 'running_sport_prep',        // Ball-training with kicking
  'RF-EX-070': 'running_sport_prep',        // Kicking scenario practice
  // ── Game / sport ───────────────────────────────────────────────────────
  'RF-EX-071': 'running_sport_prep',        // Game-based training exposure
  'RF-EX-072': 'running_sport_prep',        // Ball exercises
  // ── Conditioning / machine ─────────────────────────────────────────────
  'RF-EX-082': 'conditioning',              // Elliptical conditioning
  'RF-EX-083': 'conditioning',              // Calisthenics conditioning
  'RF-EX-084': 'conditioning',              // Cybex machine exposure
  'RF-EX-107': 'conditioning',              // Light-effort thigh work with wrap
  // ── Stability / balance ────────────────────────────────────────────────
  'RF-EX-021': 'control_balance',           // Sliding mountain climbers
};

/**
 * Full phase-to-exercise assignment for all 107 RF-EX objects.
 * Exercises can appear in multiple phases (progressive exposure).
 * Organised by clinical logic, not by library_classification.
 */
export const DEV_PHASE_EXERCISES = {

  foundation: [
    // Gentle mobility — restore comfortable range
    'RF-EX-020', // Prone thigh mobility
    'RF-EX-025', // Half-kneeling pelvic tilt
    'RF-EX-089', // Heel slides
    'RF-EX-090', // Comfortable thigh mobility
    'RF-EX-024', // Active knee flexion ROM
    'RF-EX-027', // Supine hamstring dynamic mobility
    'RF-EX-085', // Well-leg gravity-assisted knee flexion
    // Isometric / early activation — load without movement
    'RF-EX-088', // Quad set
    'RF-EX-022', // Generic quad isometric
    'RF-EX-012', // Straight-leg raise
    'RF-EX-001', // Reclined knee extension ISO
    'RF-EX-002', // Hip-flexed knee extension
    'RF-EX-003', // Hip-extended knee extension
    // Proximal control — hip/core without thigh load
    'RF-EX-030', // Side-lying leg lift
    'RF-EX-031', // Clamshell
    'RF-EX-032', // Glute bridge
    'RF-EX-039', // Side plank
    'RF-EX-040', // Front plank
    'RF-EX-041', // Dead bug
    // Conditioning — gentle circulation
    'RF-EX-078', // Walking exposure
    'RF-EX-080', // Easy cycling
    'RF-EX-081', // Easy pool work
  ],

  reload: [
    // Active ROM and hip flexion re-loading
    'RF-EX-023', // Active knee extension ROM/loading
    'RF-EX-007', // Half-kneeling hip flexion
    'RF-EX-008', // Inclined trunk hip flexion
    'RF-EX-010', // Knee-flexed hip flexion
    'RF-EX-011', // Knee-extended hip flexion
    'RF-EX-005', // Seated hip-flexion hold
    'RF-EX-006', // Standing knee lift
    // Quad / knee loading
    'RF-EX-091', // Short-arc knee extension
    'RF-EX-016', // Step-up
    'RF-EX-004', // Knee extension (machine/resistance)
    'RF-EX-017', // Double-leg squat
    // Proximal strength
    'RF-EX-033', // Hip thrust
    'RF-EX-034', // Side-stepping with a band
    'RF-EX-036', // Monster walk
    'RF-EX-042', // Pallof press
    'RF-EX-092', // Single-leg balance reach
    // Conditioning progress
    'RF-EX-079', // Jogging / light-jogging exposure
    'RF-EX-082', // Elliptical conditioning
    'RF-EX-080', // Easy cycling
    'RF-EX-081', // Easy pool work
  ],

  accumulation: [
    // Progressive single-leg strength
    'RF-EX-018', // Mini single-leg squat
    'RF-EX-019', // Single-leg squat
    'RF-EX-014', // Walking lunge
    'RF-EX-015', // Reverse lunge
    'RF-EX-093', // Split squat
    'RF-EX-094', // Rear-foot-elevated split squat
    'RF-EX-095', // Forward lunge
    'RF-EX-096', // Step-down
    'RF-EX-035', // Unilateral hip thrust
    // Eccentric / lengthened load
    'RF-EX-009', // Lengthened hip-flexor hold
    'RF-EX-099', // Slow leg lowering
    'RF-EX-100', // Long-lever hip-flexor hold
    'RF-EX-101', // Assisted slow hip-flexor lowering
    'RF-EX-103', // Reverse Nordic (supported)
    // Running mechanics drills
    'RF-EX-043', // Ankling drill
    'RF-EX-044', // Skipping drill
    'RF-EX-046', // High-knee marching
    'RF-EX-047', // Heel-flick drill
    'RF-EX-048', // Toe-off control drill
    'RF-EX-049', // Mid-stance control drill
    'RF-EX-050', // Rotation control drill
    // General loading
    'RF-EX-086', // Full/deep squat restricted context
    'RF-EX-087', // Generic weight-training exposure
    'RF-EX-021', // Sliding mountain climbers
    'RF-EX-083', // Calisthenics conditioning
  ],

  transition: [
    // Running exposure — acceleration / decel / COD
    'RF-EX-054', // Short-distance running exposure
    'RF-EX-055', // Moderate-distance running exposure
    'RF-EX-056', // Acceleration exposure
    'RF-EX-052', // Deceleration mechanics drill
    'RF-EX-053', // Change-of-direction mechanics drill
    'RF-EX-097', // Backward sled pull
    'RF-EX-098', // Sled march
    // Landing mechanics
    'RF-EX-057', // Two-foot landing
    'RF-EX-058', // One-foot landing
    // High-demand eccentric / lengthened
    'RF-EX-013', // Reverse Nordic
    'RF-EX-102', // Machine-assisted hip-flexor lowering
    'RF-EX-104', // Sissy squat
    'RF-EX-105', // Spanish squat
    // Early plyometric
    'RF-EX-037', // Plyometric glute bridge
    'RF-EX-038', // Plyometric hip thrust
    'RF-EX-029', // Leg swings
    'RF-EX-026', // Half-kneeling pelvic tilt max flexion
    // Mobility supporting speed work
    'RF-EX-028', // Hamstring dynamic mobility fitball
    'RF-EX-027', // Supine hamstring dynamic mobility
  ],

  simulation: [
    // Full running
    'RF-EX-073', // Sport-specific running exposure
    'RF-EX-074', // Mixed running exposure
    'RF-EX-075', // High-speed running exposure
    'RF-EX-076', // Sprint exposure
    'RF-EX-051', // Acceleration practice
    'RF-EX-045', // Bounding drill
    // Plyometrics / jump training
    'RF-EX-059', // Squat jump
    'RF-EX-060', // Hopping drill
    'RF-EX-061', // Countermovement jump
    'RF-EX-062', // Drop jump
    'RF-EX-063', // Integrated limb reactivity drill
    'RF-EX-064', // Low-level hopping
    'RF-EX-106', // Jumping lunge switch
    // Kicking — progressive exposure
    'RF-EX-065', // Open-chain kicking pattern
    'RF-EX-066', // Static isolated kicking
    'RF-EX-067', // Controlled kicking exposure
    'RF-EX-068', // Resisted kicking practice
    'RF-EX-069', // Ball-training with kicking
    // Strength maintenance
    'RF-EX-094', // Rear-foot-elevated split squat
    'RF-EX-019', // Single-leg squat
    'RF-EX-084', // Cybex machine exposure
    'RF-EX-107', // Light-effort thigh work with wrap
  ],

  resilience: [
    // Game-based / full sport
    'RF-EX-070', // Kicking scenario practice
    'RF-EX-071', // Game-based training exposure
    'RF-EX-072', // Ball exercises
    'RF-EX-077', // Dynamic agility exposure
    // Maintain high-speed running
    'RF-EX-075', // High-speed running exposure
    'RF-EX-073', // Sport-specific running exposure
    'RF-EX-051', // Acceleration practice
    'RF-EX-076', // Sprint exposure
    // Maintenance strength
    'RF-EX-013', // Reverse Nordic
    'RF-EX-019', // Single-leg squat
    'RF-EX-094', // Rear-foot-elevated split squat
    'RF-EX-061', // Countermovement jump
    'RF-EX-045', // Bounding drill
    'RF-EX-107', // Light-effort thigh work with wrap
    'RF-EX-084', // Cybex machine exposure
  ],
};
