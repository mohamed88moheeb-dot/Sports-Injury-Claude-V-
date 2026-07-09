/**
 * lib/clinical/rfBetaEngine/rfExerciseRetriever.mjs
 * ---------------------------------------------------------------------------
 * Phase 2 RAG — Retrieval-Augmented Generation for RF exercise selection.
 *
 * Converts Bayesian diagnosis output (rf_pattern, probable_subtype, flags) and
 * assessment answers into a patient profile, then scores every RF-EX object in
 * a phase pool for clinical relevance to that profile.
 *
 * The session builder's existing rotation logic picks exercises in order from
 * each block group. By ranking the pool here — highest relevance first — the
 * most appropriate exercises for this specific patient always appear first in
 * their block, and are therefore the ones selected for active sessions.
 *
 * Clinical rationale (per injury site and pattern):
 *   Pattern A (proximal/kicking)   — RF proximal tendon stressed during late
 *     kick follow-through. Protect hip-flexed stretch-load early. Isometrics
 *     at shortened range first. Kicking drills are the primary RTS target.
 *   Pattern B (MTJ/sprint)         — Myotendinous junction fails under eccentric
 *     load during terminal swing phase of sprinting. Eccentric loading (Reverse
 *     Nordic analog) drives adaptation. Sprint progression is the RTS milestone.
 *   Pattern C (myofascial/general) — Diffuse, lower-grade, faster recovery.
 *     General quad loading, fewer site-specific restrictions.
 *   Central tendon flag             — Highest sensitivity to stretch-loading.
 *     Extended conservative period; strong stretch penalty across all phases.
 *   Proximal tendon flag            — Additional hip-stretch caution in early phases.
 *   Avulsion concern flag           — Young athlete with kicking mechanism.
 *     Delay kicking exposure, avoid high-speed loading before late phases.
 * ---------------------------------------------------------------------------
 */

import { normalizeDeficitProfile } from '../core/deficitEmphasis.mjs';

// ── Canonical block order (mirrors session generator) ────────────────────────
const BLOCK_ORDER = [
  'conditioning',
  'mobility_activation',
  'tissue_specific_loading',
  'strength_support',
  'control_balance',
  'running_sport_prep',
];

// ── Phase groupings used for scoring ─────────────────────────────────────────
const EARLY_PHASES   = new Set(['foundation', 'reload']);
const MID_PHASES     = new Set(['accumulation']);
const LATE_PHASES    = new Set(['transition', 'simulation', 'resilience']);

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractGrade(probable_subtype) {
  if (!probable_subtype) return null;
  if (probable_subtype.includes('grade_3') || probable_subtype.includes('structural')) return 3;
  if (probable_subtype.includes('grade_2')) return 2;
  return 1;
}

// Sports where kicking is the primary RTS demand — footballer with non-kicking
// mechanism (e.g. direct blow) still needs a kicking-focused RTS program.
const KICKING_SPORTS = new Set([
  'football', 'soccer', 'rugby_union', 'rugby_league', 'rugby',
  'aussie_rules', 'gaelic_football', 'american_football',
]);
// Sports where sprinting / acceleration is the primary RTS demand.
const SPRINT_SPORTS = new Set([
  'athletics', 'track', 'sprinting', 'basketball', 'tennis',
  'cricket', 'baseball', 'volleyball', 'handball',
]);

function extractSportType(assessmentAnswers) {
  const raw  = assessmentAnswers || {};
  const mech = raw.mechanism || '';
  const sport = (raw.sport_context || '').toLowerCase();

  // Mechanism takes priority over sport label (most clinically specific)
  if (mech === 'kicking' || raw.kick_tolerance != null) return 'kicking';
  if (mech === 'sprinting' || mech === 'acceleration' || mech === 'maximal_sprint') return 'sprinting';

  // Sport context: tells us what the patient needs to return TO,
  // even when mechanism was something like direct impact.
  if (KICKING_SPORTS.has(sport)) return 'kicking';
  if (SPRINT_SPORTS.has(sport))  return 'sprinting';

  // sport_level hint (legacy fallback)
  if (raw.sport_level === 'professional_kicking') return 'kicking';
  return 'general';
}

function hasTag(arr, ...tags) {
  if (!Array.isArray(arr)) return false;
  return tags.some((t) => arr.includes(t));
}

// ── Patient profile ───────────────────────────────────────────────────────────

/**
 * Build a compact clinical profile from the Bayesian confidence output and
 * raw assessment answers. This is the "query" for the retrieval step.
 *
 * @param {object|null} confidence  Output from resolveConfidence()
 * @param {object|null} rawAnswers  assessmentAnswers or rf_self_tests
 * @returns {object}                Structured retrieval query
 */
/** True when the deficit profile carries any signal worth ranking against. */
export function deficitsActive(d) {
  if (!d) return false;
  return !!(d.motor_control_deficit || d.mobility_deficit || d.strength_deficit ||
    (d.loading_tolerance && d.loading_tolerance !== 'ok') ||
    (d.irritability && d.irritability !== 'low') ||
    (d.sport_readiness && d.sport_readiness !== 'partial') ||
    d.psychological_readiness === 'low');
}

export function buildPatientProfile(confidence, rawAnswers, fullInput = rawAnswers) {
  const flags     = new Set(confidence?.flags || []);
  const pattern   = confidence?.rf_pattern?.type   || null;
  const subtype   = confidence?.probable_subtype   || null;
  const grade     = extractGrade(subtype);
  const sportType = extractSportType(rawAnswers);
  const deficits  = normalizeDeficitProfile(fullInput || rawAnswers || {});

  return {
    // Core Bayesian signals
    pattern,                                          // 'A' | 'B' | 'C' | null
    grade,                                            // 1 | 2 | 3 | null
    subtype,
    flags,

    // Derived flag booleans (more readable in scoring)
    proximal:       flags.has('proximal_tendon_suspect'),
    central_tendon: flags.has('intratendinous_suspect'),
    avulsion_risk:  flags.has('avulsion_concern'),
    structural:     flags.has('structural_tear_pattern'),
    neural_concern: flags.has('neural_concern'),

    // Sport / demography context
    sport_type:     sportType,                        // 'kicking' | 'sprinting' | 'general'
    sport_level:    rawAnswers?.sport_level   || null,
    age_group:      rawAnswers?.age_group     || null,
    kick_tolerance: rawAnswers?.kick_tolerance || null,

    // Deficit / readiness profile — drives deficit-aware exercise selection so
    // every capacity/readiness answer shapes the plan (field-effect contract).
    deficits,
    deficits_active: deficitsActive(deficits),
  };
}

// ── Exercise scoring ──────────────────────────────────────────────────────────

/**
 * Score a single RF-EX object for clinical relevance to the patient profile
 * in a given phase. Higher = more appropriate for this patient right now.
 *
 * Scoring is additive from a 100-point baseline. Penalties are subtractive.
 * Scores are clamped to [0, ∞) — a negative score means "suppress this".
 *
 * @param {object} ex       RF-EX object
 * @param {object} profile  Patient profile from buildPatientProfile()
 * @param {string} phaseId  Current phase id
 * @returns {number}
 */
function scoreExercise(ex, profile, phaseId) {
  let score = 100;

  const earlyPhase = EARLY_PHASES.has(phaseId);
  const midPhase   = MID_PHASES.has(phaseId);
  const latePhase  = LATE_PHASES.has(phaseId);

  const family    = ex.exercise_family || '';
  const bias      = ex.contraction_bias     || [];
  const mvtCat    = ex.movement_category    || [];
  const posTags   = ex.position_tags        || [];
  const tissueTags= ex.tissue_demand_tags   || [];
  const fieldTags = ex.field_demand_tags    || [];
  const stretch   = ex.stretch_demand       || 'low';
  const speed     = ex.speed_power_demand   || 'low';

  // ── Pattern A: Proximal / kicking injury ──────────────────────────────────
  if (profile.pattern === 'A') {
    // Isometrics at shortened range are the safe early choice
    if (hasTag(bias, 'isometric') && earlyPhase) score += 20;
    // Hip-flexed position spares the proximal tendon from stretch
    if (hasTag(posTags, 'hip_flexed_context') && earlyPhase) score += 15;
    // Kicking drills are the primary RTS target for Pattern A
    if (family === 'kicking_exposure_preparation' && latePhase) score += 30;
    if (hasTag(fieldTags, 'kicking_preparation', 'kicking_exposure_demand') && latePhase) score += 15;
    // Avoid high stretch demand on the proximal tendon early — it risks re-tear
    if (stretch === 'high' && earlyPhase) score -= 40;
    if (stretch === 'high' && midPhase)   score -= 20;
    if (stretch === 'moderate' && earlyPhase) score -= 10;
  }

  // ── Pattern B: MTJ / sprint injury ───────────────────────────────────────
  if (profile.pattern === 'B') {
    // Eccentric loading drives the key adaptation (fascicle length, tendon stiffness)
    if (hasTag(bias, 'eccentric_or_lengthened')) score += 25;
    if (family === 'eccentric_or_lengthened_exposure') score += 20;
    if (hasTag(mvtCat, 'eccentric_loading', 'long_length_loading')) score += 15;
    // Sprint mechanics drills are the RTS focus
    if (hasTag(mvtCat, 'sprint_preparation', 'running_mechanics')) score += 15;
    if (hasTag(fieldTags, 'sprinting_preparation', 'sprint_exposure', 'running_field_exposure') && latePhase) score += 25;
  }

  // ── Pattern C: Myofascial / general ──────────────────────────────────────
  if (profile.pattern === 'C') {
    // General quad loading is appropriate — less site-specific constraint
    if (family === 'knee_extension_biased_loading') score += 10;
    if (hasTag(bias, 'isometric')) score += 5;
    // Pattern C recovers faster — no extra penalties for moderate stretch early
  }

  // ── Proximal tendon flag (additional restriction beyond Pattern A) ────────
  if (profile.proximal) {
    if (stretch === 'high'     && !latePhase) score -= 25;
    if (stretch === 'moderate' && earlyPhase) score -= 12;
    // Hip-flexion loading (which loads the proximal RF) needs extra grading
    if (hasTag(tissueTags, 'proximal_rf_load', 'proximal_anterior_thigh') && earlyPhase) score -= 15;
  }

  // ── Central tendon flag ───────────────────────────────────────────────────
  // Central tendon involvement = highest risk from stretch-loading.
  // This is the finding most associated with prolonged rehab and myositis ossificans.
  if (profile.central_tendon) {
    // Strong stretch penalty across all phases
    if (stretch === 'high')                          score -= 35;
    if (stretch === 'moderate' && !latePhase)        score -= 18;
    // Isometrics are always safe and preferred
    if (hasTag(bias, 'isometric'))                   score += 20;
    // Long-lever loading is especially risky for central tendon
    if (hasTag(posTags, 'long_length', 'anterior_thigh_stretch_load')) score -= 20;
  }

  // ── Avulsion concern flag (young athlete + kicking mechanism) ─────────────
  if (profile.avulsion_risk) {
    // Kicking drills must be delayed until late phases only
    if (family === 'kicking_exposure_preparation' && !latePhase) score -= 30;
    // High-speed / high-impact work must wait
    if (speed === 'high' && !latePhase) score -= 25;
    if (speed === 'moderate' && earlyPhase) score -= 12;
    // Isometrics at rest are safe — no penalty
  }

  // ── Structural tear pattern flag ──────────────────────────────────────────
  if (profile.structural) {
    // Very conservative — treat like high-concern throughout
    if (speed === 'high')                            score -= 30;
    if (speed === 'moderate' && earlyPhase)          score -= 18;
    if (stretch === 'high'     && !latePhase)        score -= 25;
    if (stretch === 'moderate' && earlyPhase)        score -= 12;
    // Isometrics safe and preferred
    if (hasTag(bias, 'isometric'))                   score += 15;
  }

  // ── Sport-type prioritization in return-to-sport phases ──────────────────
  if (latePhase) {
    if (profile.sport_type === 'kicking') {
      if (family === 'kicking_exposure_preparation')                           score += 20;
      if (hasTag(fieldTags, 'kicking_preparation', 'kicking_exposure_demand')) score += 15;
    }
    if (profile.sport_type === 'sprinting') {
      if (hasTag(mvtCat, 'sprint_preparation'))                                score += 20;
      if (hasTag(fieldTags, 'sprint_exposure', 'sprinting_preparation'))       score += 15;
    }

    // ── Cross-sport suppression ─────────────────────────────────────────────
    // A sprinting athlete (rugby, track, basketball) should not have their
    // final RTS sessions dominated by kicking drills. All kicking-family
    // exercises are pushed well below neutral (100) so sprint/plyometric
    // work fills the available slots first.
    const KICKING_FAMILIES = new Set([
      'kicking_exposure_preparation',
      'controlled_kicking_exposure',
      'higher_demand_kicking_exposure',
      'restricted_post_surgical_kicking_context',
    ]);
    if (profile.sport_type === 'sprinting' && KICKING_FAMILIES.has(family)) score -= 60;
    if (profile.sport_type === 'sprinting' &&
        hasTag(fieldTags, 'kicking_preparation', 'kicking_exposure_demand') &&
        !hasTag(fieldTags, 'sprint_exposure', 'running_field_exposure'))      score -= 30;
  }

  // ── Deficit / readiness targeting (field-effect contract → rehab) ─────────
  // Every capacity/readiness answer that says what THIS athlete needs to work
  // on nudges the ranking so matching exercises are selected first. Shape-safe:
  // this only reorders exercises within their block, never changing plan structure.
  const d = profile.deficits;
  if (d) {
    const block = ex._dev_block_override || null;
    if (d.motor_control_deficit) {
      if (block === 'control_balance') score += 22;
      if (hasTag(mvtCat, 'balance', 'stability', 'motor_control') || /control|balance/.test(family)) score += 12;
    }
    if (d.mobility_deficit) {
      if (block === 'mobility_activation' || ex.library_classification === 'rf_mobility_movement_restoration') score += 18;
      if (hasTag(bias, 'eccentric_or_lengthened') && !earlyPhase) score += 8;
    }
    if (d.strength_deficit) {
      if (block === 'strength_support' || ex.library_classification === 'supportive_proximal_control') score += 15;
    }
    if (d.loading_tolerance === 'low') {
      if (hasTag(bias, 'isometric')) score += 20;
      if (hasTag(bias, 'eccentric_or_lengthened') && !latePhase) score -= 22;
    } else if (d.loading_tolerance === 'moderate') {
      if (hasTag(bias, 'isometric') && earlyPhase) score += 8;
    }
    if (d.irritability === 'high') {
      if (speed === 'high') score -= 22;
      if (ex.impact_demand === 'high') score -= 25;
      if (hasTag(bias, 'isometric')) score += 10;
    }
    if (d.sport_readiness === 'low') {
      if (block === 'running_sport_prep' && (speed === 'high' || hasTag(fieldTags, 'sprint_exposure', 'kicking_exposure_demand'))) score -= 24;
    } else if (d.sport_readiness === 'ready' && latePhase) {
      if (block === 'running_sport_prep') score += 10;
    }
  }

  return Math.max(0, score);
}

// ── Pool ranking ──────────────────────────────────────────────────────────────

/**
 * Rank a phase exercise pool by clinical relevance to the patient profile.
 *
 * Returns the pool re-sorted so that within each block group, the most
 * clinically appropriate exercises for this patient appear first. The
 * session builder's rotation (i + sessionIndex) % group.length then naturally
 * selects them before less-appropriate alternatives.
 *
 * Block ordering is preserved — conditioning before mobility before strength etc.
 * Within the same block, exercises are ordered highest-score → lowest-score.
 *
 * @param {object[]} pool     Array of RF-EX objects (with _dev_block_override)
 * @param {object}   profile  Patient profile from buildPatientProfile()
 * @param {string}   phaseId  Phase being ranked
 * @returns {object[]}        Ranked pool (new array, original not mutated)
 */
export function rankPhasePool(pool, profile, phaseId) {
  // Rank when we have a Bayesian pattern OR any active deficit to respond to.
  if (!profile || (!profile.pattern && !profile.deficits_active)) return pool;

  // Pre-compute scores to avoid repeated computation in the sort comparator
  const scores = new Map(pool.map((ex) => [ex.exercise_id, scoreExercise(ex, profile, phaseId)]));

  const blockIndex = (ex) => {
    const block = ex._dev_block_override || 'strength_support';
    const idx = BLOCK_ORDER.indexOf(block);
    return idx === -1 ? BLOCK_ORDER.length : idx;
  };

  return [...pool].sort((a, b) => {
    // Primary: canonical block order
    const blockDiff = blockIndex(a) - blockIndex(b);
    if (blockDiff !== 0) return blockDiff;
    // Secondary: higher clinical score first within the same block
    return (scores.get(b.exercise_id) || 0) - (scores.get(a.exercise_id) || 0);
  });
}

/**
 * Build a human-readable summary of the retrieval profile for governance trace.
 *
 * @param {object} profile  Patient profile from buildPatientProfile()
 * @returns {object}
 */
export function describeRetrievalProfile(profile) {
  if (!profile) return { active: false };

  const signals = [];
  if (profile.pattern)       signals.push(`Pattern ${profile.pattern}`);
  if (profile.grade)         signals.push(`Grade ${profile.grade} signal`);
  if (profile.proximal)      signals.push('Proximal tendon suspect');
  if (profile.central_tendon)signals.push('Central tendon involvement');
  if (profile.avulsion_risk) signals.push('Avulsion risk (young + kicking)');
  if (profile.structural)    signals.push('Structural tear pattern');
  if (profile.sport_type !== 'general') signals.push(`Sport type: ${profile.sport_type}`);
  const d = profile.deficits || {};
  if (d.motor_control_deficit) signals.push('Motor-control deficit → balance emphasis');
  if (d.mobility_deficit)      signals.push('Mobility deficit → mobility/lengthening emphasis');
  if (d.strength_deficit)      signals.push('Strength deficit → strength emphasis');
  if (d.loading_tolerance && d.loading_tolerance !== 'ok') signals.push(`Loading tolerance: ${d.loading_tolerance}`);
  if (d.irritability && d.irritability !== 'low') signals.push(`Irritability: ${d.irritability}`);
  if (d.sport_readiness && d.sport_readiness !== 'partial') signals.push(`Sport readiness: ${d.sport_readiness}`);
  if (d.psychological_readiness === 'low') signals.push('Low movement confidence → cautious pacing');

  return {
    active:        !!profile.pattern || !!profile.deficits_active,
    pattern:       profile.pattern,
    grade:         profile.grade,
    flags_applied: [...(profile.flags || [])],
    sport_type:    profile.sport_type,
    signals_summary: signals,
    note: 'Exercises within each block are ranked by clinical fit to this profile. Highest-ranked appear first.',
  };
}
