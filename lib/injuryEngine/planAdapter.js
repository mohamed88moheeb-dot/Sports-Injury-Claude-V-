/**
 * lib/injuryEngine/planAdapter.js
 * ---------------------------------------------------------------------------
 * Bridges the expanded injuryKnowledge engine to the page.jsx session format.
 *
 * For regions with fully expanded exercise libraries (hamstring, quadriceps,
 * adductor_groin), this adapter:
 *   1. Picks the best-fit rehab protocol for the user's assessment
 *   2. Resolves the correct phase, with fallback for protocols with fewer phases
 *   3. Resolves all exercises from the protocol phase's ID list
 *   4. Calls buildSession() to assemble a full 6–12 exercise block-based session
 *      (warm-up → activation → targeted → kinetic chain → global strength →
 *       neuromuscular → conditioning → cool-down)
 *   5. Converts each exercise into the shape page.jsx PlanView expects, with
 *      extra enrichment fields that PlanView renders when present
 *
 * Returns null for regions not yet in the expanded engine; page.jsx falls back
 * to the original system automatically.
 * ---------------------------------------------------------------------------
 */

import { getRegionKnowledge } from '../../data/injuryKnowledge/index';
import { buildSession } from './sessionScheduler';

/* -------------------------------------------------------------------------
 * Regions handled by the new engine.
 * Extend this set as calfAchillesShin, ankle, knee are expanded.
 * ------------------------------------------------------------------------- */
const SUPPORTED_REGIONS = new Set(['hamstring', 'quadriceps', 'adductor_groin']);

/* -------------------------------------------------------------------------
 * Phase RPE labels — used as `intensity` in exercise cards
 * ------------------------------------------------------------------------- */
const PHASE_RPE = {
  protect:  'RPE 2–4',
  restore:  'RPE 4–6',
  capacity: 'RPE 6–8',
  speed:    'RPE 7–8',
  return:   'RPE 7–9'
};

/* -------------------------------------------------------------------------
 * Block labels — shown as a context chip on each exercise card
 * ------------------------------------------------------------------------- */
const BLOCK_LABELS = {
  warmup:         'Warm-up',
  activation:     'Activation',
  targeted:       'Targeted loading',
  kinetic_chain:  'Kinetic chain',
  global_strength:'Whole-body strength',
  neuromuscular:  'Neuromuscular',
  conditioning:   'Conditioning',
  cooldown:       'Cool-down'
};

/* =========================================================================
 * Protocol selection
 * Maps assessment fields → the most appropriate protocol id for the region.
 * ========================================================================= */
function selectProtocolId(regionId, assessment) {
  const exactArea  = assessment.exactArea  || '';
  const grade      = assessment.grade      || '';
  const mechanism  = assessment.mechanism  || '';
  const symptoms   = (assessment.symptoms  || []).join(' ');
  const redFlags   = assessment.redFlags   || [];

  const highRisk = redFlags.length > 0 || grade === 'grade3';
  if (highRisk) return 'severe_risk';

  switch (regionId) {
    case 'hamstring':
      if (exactArea === 'proximal_tendon')                                  return 'proximal_tendon';
      if (/neural|nerve|tingling|pins/i.test(exactArea + ' ' + symptoms))  return 'neural_tension';
      if (grade === 'overload')                                             return 'overload';
      return 'acute_hamstring_strain';

    case 'quadriceps':
      if (exactArea === 'quad_tendon')                                      return 'tendon';
      if (/contact|contusion|direct.blow|impact/i.test(mechanism))         return 'contusion';
      if (/nerve|neural|tingling|pins/i.test(symptoms))                    return 'nerve_referral';
      return 'acute_quad_strain';

    case 'adductor_groin':
      if (exactArea === 'inguinal_pubalgia')                                return 'pubalgia_referral';
      if (exactArea === 'front_iliopsoas')                                  return 'hip_flexor';
      if (exactArea === 'pubic_region' || exactArea === 'pubic_symphysis')  return 'pubic_overload';
      if (/deep.*hip|hip.*deep|click|catch/i.test(symptoms))               return 'deep_hip_referral';
      if (grade === 'overload')                                             return 'adductor_tendon';
      return 'acute_adductor_strain';

    default:
      return null;
  }
}

/* =========================================================================
 * Phase resolution with fallback
 *
 * Some protocols have 3–4 phases (not the full 5). When the plan asks for
 * a phase the protocol doesn't have, we map to the closest available one so
 * the user always gets a real session rather than falling back to old engine.
 * ========================================================================= */
const PHASE_FALLBACK = {
  protect:  ['protect', 'restore', 'capacity', 'return'],
  restore:  ['restore', 'protect', 'capacity', 'return'],
  capacity: ['capacity', 'restore', 'return', 'protect'],
  speed:    ['speed', 'return', 'capacity', 'restore'],
  return:   ['return', 'speed', 'capacity', 'restore', 'protect']
};

function findBestPhase(protocol, phaseId) {
  const candidates = PHASE_FALLBACK[phaseId] || [phaseId];
  for (const id of candidates) {
    const found = protocol.phases.find(p => p.id === id);
    if (found) return found;
  }
  return protocol.phases[protocol.phases.length - 1];
}

/* =========================================================================
 * Equipment resolution
 * Checks whether the user has the hardware an exercise needs.
 * ========================================================================= */

// assessment.equipment uses title-cased labels from rehabKnowledge.js
const EQUIPMENT_TOKEN = {
  'Bodyweight':         'bodyweight',
  'Resistance bands':   'band',
  'Dumbbells':          'dumbbells',
  'Barbell':            'barbell',
  'Gym machines':       'gym_machine',
  'Bike':               'stationary_bike',
  'Treadmill':          'treadmill',
  'Pool':               'pool',
  'Bench':              'bench',
  'Pull-up bar':        'pullup_bar'
};

// Tokens always available regardless of what the user listed
const ALWAYS_AVAILABLE = new Set(['bodyweight', 'wall', 'open_space', 'cones', 'towel']);

function buildUserTokens(assessmentEquipment) {
  const tokens = new Set(ALWAYS_AVAILABLE);
  for (const item of (assessmentEquipment || [])) {
    const token = EQUIPMENT_TOKEN[item] || item.toLowerCase();
    tokens.add(token);
  }
  return tokens;
}

function hasRequiredEquipment(ex, userTokens) {
  const needed = (ex.equipment || []).filter(e => !ALWAYS_AVAILABLE.has(e));
  return needed.length === 0 || needed.some(e => userTokens.has(e));
}

/* =========================================================================
 * Format conversion
 * Converts a new-engine exercise object → the shape PlanView renders.
 * Adds optional enrichment fields (blockLabel, purpose, etc.) that the
 * enhanced PlanView renders when present, and ignores if absent.
 * ========================================================================= */
function adaptExercise(ex, phaseId, userTokens) {
  const hasEquip = hasRequiredEquipment(ex, userTokens);

  // ── equipment display string ──────────────────────────────────────────────
  let equipStr;
  if (!hasEquip && ex.noEquipmentAlternative) {
    equipStr = 'Bodyweight · no equipment needed';
  } else {
    equipStr = (ex.equipment || ['bodyweight'])
      .map(e => e.charAt(0).toUpperCase() + e.slice(1).replace(/_/g, ' '))
      .join(' / ');
  }

  // ── intensity / RPE ───────────────────────────────────────────────────────
  const isLowLoad = ex.slot === 'isometric' || ex.slot === 'mobility';
  const intensity = isLowLoad
    ? (ex.difficulty <= 2 ? 'Easy' : 'Moderate effort')
    : (PHASE_RPE[phaseId] || 'RPE 4–6');

  // ── prescription ─────────────────────────────────────────────────────────
  const prescription = !hasEquip && ex.noEquipmentAlternative
    ? `${ex.prescription} · ${ex.noEquipmentAlternative}`
    : ex.prescription;

  // ── coaching cue ─────────────────────────────────────────────────────────
  const cueLines = Array.isArray(ex.cues) ? [...ex.cues] : (ex.cues ? [ex.cues] : []);
  if (!hasEquip && ex.noEquipmentAlternative) {
    cueLines.push(`No equipment: ${ex.noEquipmentAlternative}`);
  }
  const cue = cueLines.join(' · ') || ex.purpose || '';

  // ── alternative ──────────────────────────────────────────────────────────
  const altName = resolveAltLabel(ex.easierAlternative);
  const altCue  = ex.regressionRule || 'Reduce load, range of motion, or hold time to a comfortable level.';

  return {
    // ── Core fields page.jsx PlanView always renders ──────────────────────
    name:         ex.name,
    prescription,
    equipment:    equipStr,
    intensity,
    cue,
    video:        'Exercise video placeholder',
    alternative: {
      name:         altName,
      cue:          altCue,
      prescription: '2–3 sets at a reduced intensity or shorter hold time'
    },

    // ── Enrichment fields — rendered by enhanced PlanView when present ─────
    // These are purely additive; old-engine exercises don't have them, so
    // PlanView just skips them.  Never break existing rendering.
    blockLabel:      BLOCK_LABELS[ex.block]  || null,
    purpose:         ex.purpose              || null,
    painRule:        ex.painRule             || null,
    commonMistakes:  ex.commonMistakes?.length ? ex.commonMistakes  : null,
    progressionRule: ex.progressionRule      || null,
    avoidIf:         ex.avoidIf?.length      ? ex.avoidIf           : null,
    isFromEngine:    true  // flag so PlanView knows to show enriched UI
  };
}

/**
 * Resolve easierAlternative to a display label.
 * The field can be either an exercise id ('ham_bridge_hold') or a short
 * human description ('Shorter 10-second holds').
 */
function resolveAltLabel(easierAlternative) {
  if (!easierAlternative) return 'Easier variation';

  // Looks like an exercise id — try to resolve it
  if (/^[a-z][a-z0-9_]+$/.test(easierAlternative)) {
    for (const regionId of SUPPORTED_REGIONS) {
      const region = getRegionKnowledge(regionId);
      if (!region) continue;
      const found = region.exerciseLibrary.find(e => e.id === easierAlternative);
      if (found) return found.name;
    }
    // Not found — make it readable
    return easierAlternative
      .replace(/_/g, ' ')
      .replace(/^[a-z]/, c => c.toUpperCase());
  }

  return easierAlternative;
}

/* =========================================================================
 * Public API
 * ========================================================================= */

/**
 * getAdaptedSession
 * Assemble a full block-based session from the expanded engine for the given
 * assessment, phase, and rotation index.
 *
 * @param {object} assessment   The assessment object from page.jsx state
 * @param {string} phaseId      'protect'|'restore'|'capacity'|'speed'|'return'
 * @param {number} sessionIndex Monotonically increasing (0, 1, 2, …).
 *                              Used to rotate which exercises appear each session.
 * @returns {Array|null}        Array of exercises in page.jsx format, or null
 *                              if the region is not yet handled by the new engine.
 */
export function getAdaptedSession(assessment, phaseId, sessionIndex = 0) {
  if (!assessment?.primaryRegion) return null;
  if (!SUPPORTED_REGIONS.has(assessment.primaryRegion)) return null;

  const region = getRegionKnowledge(assessment.primaryRegion);
  if (!region) return null;

  // Determine protocol
  const protocolId = selectProtocolId(assessment.primaryRegion, assessment);
  if (!protocolId) return null;

  let protocol = region.rehabProtocols.find(p => p.id === protocolId);

  // If the mapped protocol doesn't exist (e.g., edge case), fall back to the
  // first non-referral protocol in the region
  if (!protocol) {
    protocol = region.rehabProtocols.find(
      p => !p.id.includes('referral') && !p.id.includes('severe')
    );
    if (!protocol) return null;
  }

  // Find the best matching phase in the protocol
  const phase = findBestPhase(protocol, phaseId);
  if (!phase) return null;

  // Resolve exercise IDs → exercise objects from the library
  const resolved = (phase.exercises || [])
    .map(id => region.exerciseLibrary.find(e => e.id === id))
    .filter(Boolean);

  if (resolved.length === 0) return null;

  // Assemble the session via the scheduler (block-aware, rotating)
  const session = buildSession(resolved, phaseId, sessionIndex);
  if (!session || session.length === 0) return null;

  // Convert to page.jsx format
  const userTokens = buildUserTokens(assessment.equipment);
  return session.map(ex => adaptExercise(ex, phaseId, userTokens));
}
