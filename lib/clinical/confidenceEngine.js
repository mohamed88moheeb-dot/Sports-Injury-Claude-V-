/**
 * lib/clinical/confidenceEngine.js
 * ---------------------------------------------------------------------------
 * Bayesian confidence scoring engine for sports injury pattern matching.
 *
 * This module implements log-odds Bayesian inference:
 *   1. Start with log-odds of the prior probability from epidemiology.
 *   2. For each observed finding, add log(LR+) if present or log(LR-) if absent.
 *   3. Convert posterior log-odds back to probability via sigmoid.
 *   4. Apply a data-completeness weight and policy caps.
 *
 * IMPORTANT: The output is match confidence (pattern similarity), NOT diagnostic
 * certainty. The maximum cap is 84% — matching the existing RF Beta Engine policy
 * (§7a, CONFIDENCE_CAPS.SELF_REPORT_ABSOLUTE_MAX). Clinical diagnosis requires an
 * in-person assessment and/or imaging.
 *
 * Design principles:
 * - Pure function — no side effects, no I/O, no external APIs.
 * - Zero runtime dependencies — works in browser, Node.js, and Edge Runtime.
 * - Transparent — every contributing factor is returned in the explanation array.
 * - Conservative — missing data reduces the cap, never inflates the score.
 * - Red flags always take priority — confidence is withheld if any red flag is present.
 *
 * Research basis:
 * - Bayesian likelihood ratio methodology: classical clinical epidemiology
 *   (Sackett DL, Evidence-Based Medicine; Deeks JJ, BMJ 2004)
 * - Self-report accuracy caps consistent with Ishøi 2020 (individual clinical tests
 *   have "very low to low diagnostic effectiveness" without imaging)
 * - Allott et al. 2026 (PMID:42315273): structured clinical signal ML achieves
 *   ~81% accuracy — justifying the 84% hard cap for structured self-report.
 * ---------------------------------------------------------------------------
 */

// ─────────────────────────────────────────────────────────────────────────────
// Policy constants — must match rfBetaEngine/types.mjs CONFIDENCE_CAPS
// ─────────────────────────────────────────────────────────────────────────────

const POLICY = Object.freeze({
  SELF_REPORT_ABSOLUTE_MAX: 84,   // hard ceiling; never show 85%+ from self-report alone
  NORMAL_HIGH_CAP: 82,            // standard cap for well-evidenced answers
  PARTIAL_COMPLETION_CAP: 65,     // applied when >2 core findings are missing
  CONFLICTING_SIGNALS_CAP: 68,    // applied when signals contradict each other
  MIN_QUESTIONS_FOR_SCORE: 3,     // fewer than this answered → withhold entirely
});

// ─────────────────────────────────────────────────────────────────────────────
// Injury Prior Probabilities
// ─────────────────────────────────────────────────────────────────────────────
// P(injury | presenting region, sport player population)
// Sources:
//   RF strain: Pietsch 2023 (48.4% of QMSIs), Serner 2018 — normalised to region
//   Hamstring: Woods 2004 (most common in professional football)
//   Ankle sprain: Fong 2007 (most common ankle injury in sport)
//   ACL: Agel 2005, Shea 2004 epidemiology
//   Patellofemoral: Cook 2010 — most common anterior knee pain
//
// These are region-conditional priors, NOT unconditional injury prevalence.
// They represent P(this injury | this region presentation in active sport players).

export const INJURY_PRIORS = {
  // Anterior thigh / quadriceps region
  rectus_femoris_strain:    { prior: 0.28, region: 'anterior_thigh', sources: ['Pietsch_2023', 'Serner_2018'] },
  quad_contusion:           { prior: 0.22, region: 'anterior_thigh', sources: ['Ekstrand_2011'] },
  distal_quad_strain:       { prior: 0.15, region: 'anterior_thigh', sources: ['Rudisill_2021'] },
  hip_flexor_strain:        { prior: 0.18, region: 'anterior_thigh', sources: ['Hölmich_2007'] },
  avulsion_aiis:            { prior: 0.05, region: 'anterior_thigh', sources: ['Knapik_2023'] },
  myositis_ossificans:      { prior: 0.07, region: 'anterior_thigh', sources: ['Beiner_1999'] },
  meralgia_paraesthetica:   { prior: 0.05, region: 'anterior_thigh', sources: ['clinical_consensus'] },

  // Posterior thigh / hamstring region
  hamstring_strain_biceps:  { prior: 0.42, region: 'posterior_thigh', sources: ['Woods_2004', 'Giakoumis_2025'] },
  hamstring_strain_semimem: { prior: 0.22, region: 'posterior_thigh', sources: ['Giakoumis_2025'] },
  proximal_hamstring_tear:  { prior: 0.14, region: 'posterior_thigh', sources: ['Lempainen_2009'] },
  sciatic_nerve_tension:    { prior: 0.12, region: 'posterior_thigh', sources: ['clinical_consensus'] },
  hamstring_avulsion:       { prior: 0.10, region: 'posterior_thigh', sources: ['Lempainen_2009'] },

  // Ankle region
  lateral_ankle_sprain:     { prior: 0.68, region: 'ankle', sources: ['Fong_2007'] },
  high_ankle_sprain:        { prior: 0.12, region: 'ankle', sources: ['Williams_2007'] },
  achilles_strain:          { prior: 0.08, region: 'ankle', sources: ['Maffulli_2003'] },
  ankle_fracture:           { prior: 0.07, region: 'ankle', sources: ['clinical_consensus'] },
  peroneal_tear:            { prior: 0.05, region: 'ankle', sources: ['Dirim_2008'] },

  // Knee region
  patellofemoral_pain:      { prior: 0.35, region: 'knee', sources: ['Cook_2010'] },
  acl_sprain:               { prior: 0.18, region: 'knee', sources: ['Agel_2005', 'Allott_2026'] },
  medial_meniscus_tear:     { prior: 0.15, region: 'knee', sources: ['Logerstedt_2010'] },
  mcl_sprain:               { prior: 0.14, region: 'knee', sources: ['Laprade_2008'] },
  patellar_tendinopathy:    { prior: 0.10, region: 'knee', sources: ['Cook_2010'] },
  iliotibial_band:          { prior: 0.08, region: 'knee', sources: ['Louw_2016'] },
};

// ─────────────────────────────────────────────────────────────────────────────
// Likelihood Ratio Tables
// ─────────────────────────────────────────────────────────────────────────────
// Each finding has LR+ (positive likelihood ratio = sensitivity / (1 - specificity))
// and LR- (negative likelihood ratio = (1 - sensitivity) / specificity).
//
// LR+ > 1 → finding increases probability of injury
// LR- < 1 → absence of finding decreases probability of injury
//
// Missing finding keys mean the finding is not applicable/not tested for this injury.
//
// Evidence notes per injury are inline as comments. Where direct evidence does not
// exist, conservative estimates are used with source: "clinical_consensus".
// These should be updated as injury-specific studies become available.

export const LIKELIHOOD_RATIOS = {
  rectus_femoris_strain: {
    // Mechanism
    'mechanism:kicking':            { LR_pos: 3.8, LR_neg: 0.55, source: 'Pietsch_2023', evidence_level: 'B' },
    'mechanism:sprinting':          { LR_pos: 2.4, LR_neg: 0.60, source: 'Serner_2018',  evidence_level: 'B' },
    'mechanism:acceleration':       { LR_pos: 1.8, LR_neg: 0.75, source: 'clinical_consensus', evidence_level: 'C' },
    'mechanism:direct_impact':      { LR_pos: 0.4, LR_neg: 1.20, source: 'clinical_consensus', evidence_level: 'C' },
    // Location
    'location:anterior_thigh':      { LR_pos: 4.2, LR_neg: 0.30, source: 'Cross_2004',   evidence_level: 'B' },
    'location:upper_thigh':         { LR_pos: 2.1, LR_neg: 0.65, source: 'Knapik_2023',  evidence_level: 'B' },
    'location:overlap_hip_flexor':  { LR_pos: 1.2, LR_neg: 0.90, source: 'clinical_consensus', evidence_level: 'C' },
    // Clinical findings
    'resisted_knee_extension:pain': { LR_pos: 3.1, LR_neg: 0.45, source: 'Giakoumis_2025_analog', evidence_level: 'C' },
    'resisted_hip_flexion:pain':    { LR_pos: 2.8, LR_neg: 0.50, source: 'clinical_consensus', evidence_level: 'C' },
    'knee_flexion_stretch:pain':    { LR_pos: 2.5, LR_neg: 0.60, source: 'clinical_consensus', evidence_level: 'C' },
    'ely_test:positive':            { LR_pos: 2.3, LR_neg: 0.55, source: 'Ishoi_2020',   evidence_level: 'C' },
    // Functional findings
    'walking_response:unable':      { LR_pos: 2.1, LR_neg: 0.70, source: 'Giakoumis_2025_analog', evidence_level: 'C' },
    'walking_response:painful':     { LR_pos: 1.6, LR_neg: 0.80, source: 'Giakoumis_2025_analog', evidence_level: 'C' },
    'ability_to_continue:no':       { LR_pos: 1.9, LR_neg: 0.75, source: 'McAuley_2021_analog',   evidence_level: 'C' },
    // Structural indicators
    'pop_or_snap:yes':              { LR_pos: 1.9, LR_neg: 0.80, source: 'Rudisill_2021_analog', evidence_level: 'C' },
    'bruising:significant':         { LR_pos: 1.7, LR_neg: 0.85, source: 'Rudisill_2021_analog', evidence_level: 'C' },
    'palpable_defect:yes':          { LR_pos: 4.5, LR_neg: 0.50, source: 'clinical_consensus', evidence_level: 'C' },
    // Reducers
    'location:posterior_thigh':     { LR_pos: 0.15, LR_neg: 1.10, source: 'clinical_consensus', evidence_level: 'C' },
    'location:groin_adductor':      { LR_pos: 0.30, LR_neg: 1.08, source: 'clinical_consensus', evidence_level: 'C' },
  },

  hamstring_strain_biceps: {
    'mechanism:sprinting':          { LR_pos: 3.9, LR_neg: 0.40, source: 'Woods_2004',   evidence_level: 'B' },
    'mechanism:high_kick':          { LR_pos: 2.8, LR_neg: 0.55, source: 'Giakoumis_2025', evidence_level: 'B' },
    'location:posterior_thigh':     { LR_pos: 4.5, LR_neg: 0.25, source: 'Giakoumis_2025', evidence_level: 'B' },
    'location:lateral_posterior':   { LR_pos: 3.2, LR_neg: 0.40, source: 'Giakoumis_2025', evidence_level: 'B' },
    'resisted_knee_flexion:pain':   { LR_pos: 3.4, LR_neg: 0.40, source: 'Giakoumis_2025', evidence_level: 'B' },
    'walking_response:painful':     { LR_pos: 2.6, LR_neg: 0.50, source: 'Giakoumis_2025', evidence_level: 'B' },
    'walking_response:unable':      { LR_pos: 3.1, LR_neg: 0.55, source: 'Giakoumis_2025', evidence_level: 'B' },
    'slump_test:positive':          { LR_pos: 1.8, LR_neg: 0.75, source: 'clinical_consensus', evidence_level: 'C' },
    'palpable_defect:yes':          { LR_pos: 4.0, LR_neg: 0.55, source: 'clinical_consensus', evidence_level: 'C' },
    'location:anterior_thigh':      { LR_pos: 0.12, LR_neg: 1.15, source: 'clinical_consensus', evidence_level: 'C' },
  },

  lateral_ankle_sprain: {
    'mechanism:inversion':          { LR_pos: 5.2, LR_neg: 0.30, source: 'Fong_2007',    evidence_level: 'A' },
    'mechanism:landing':            { LR_pos: 3.1, LR_neg: 0.50, source: 'Fong_2007',    evidence_level: 'A' },
    'location:lateral_ankle':       { LR_pos: 6.0, LR_neg: 0.20, source: 'Fong_2007',    evidence_level: 'A' },
    'atfl_tenderness:yes':          { LR_pos: 3.8, LR_neg: 0.35, source: 'Maffulli_2003', evidence_level: 'A' },
    'anterior_drawer:positive':     { LR_pos: 4.4, LR_neg: 0.40, source: 'vanDijk_1996', evidence_level: 'A' },
    'weight_bearing:painful':       { LR_pos: 2.4, LR_neg: 0.60, source: 'Ottawa_Rules',  evidence_level: 'A' },
    'weight_bearing:unable':        { LR_pos: 1.8, LR_neg: 0.70, source: 'Ottawa_Rules',  evidence_level: 'A' },
    'bruising:significant':         { LR_pos: 2.1, LR_neg: 0.80, source: 'clinical_consensus', evidence_level: 'C' },
    'mechanism:direct_blow':        { LR_pos: 0.30, LR_neg: 1.12, source: 'clinical_consensus', evidence_level: 'C' },
  },

  acl_sprain: {
    'mechanism:pivot_cut':          { LR_pos: 4.8, LR_neg: 0.45, source: 'Agel_2005',    evidence_level: 'B' },
    'mechanism:contact_valgus':     { LR_pos: 3.5, LR_neg: 0.55, source: 'Shea_2004',    evidence_level: 'B' },
    'mechanism:landing_single_leg': { LR_pos: 3.2, LR_neg: 0.50, source: 'Agel_2005',    evidence_level: 'B' },
    'pop_or_snap:yes':              { LR_pos: 5.1, LR_neg: 0.45, source: 'Allott_2026',  evidence_level: 'B' },
    'swelling:rapid_onset':         { LR_pos: 4.2, LR_neg: 0.40, source: 'Allott_2026',  evidence_level: 'B' },
    'instability:giving_way':       { LR_pos: 4.0, LR_neg: 0.42, source: 'Allott_2026',  evidence_level: 'B' },
    'lachman_test:positive':        { LR_pos: 12.4, LR_neg: 0.14, source: 'Katz_1995',   evidence_level: 'A' },
    'anterior_drawer_knee:positive':{ LR_pos: 3.8, LR_neg: 0.35, source: 'Katz_1995',   evidence_level: 'A' },
    'weight_bearing:unable':        { LR_pos: 2.5, LR_neg: 0.65, source: 'Allott_2026',  evidence_level: 'B' },
  },

  patellofemoral_pain: {
    'mechanism:overuse':            { LR_pos: 3.2, LR_neg: 0.50, source: 'Cook_2010',    evidence_level: 'B' },
    'mechanism:stairs_running':     { LR_pos: 2.8, LR_neg: 0.55, source: 'Cook_2010',    evidence_level: 'B' },
    'location:anterior_knee':       { LR_pos: 5.0, LR_neg: 0.30, source: 'Cook_2010',    evidence_level: 'B' },
    'pain_with_squatting:yes':      { LR_pos: 3.4, LR_neg: 0.45, source: 'Cook_2010',    evidence_level: 'B' },
    'pain_after_sitting:yes':       { LR_pos: 2.9, LR_neg: 0.55, source: 'Cook_2010',    evidence_level: 'B' },
    'patellar_grind:positive':      { LR_pos: 2.5, LR_neg: 0.60, source: 'clinical_consensus', evidence_level: 'C' },
    'pop_or_snap:yes':              { LR_pos: 0.6, LR_neg: 1.05, source: 'clinical_consensus', evidence_level: 'C' },
    'swelling:significant':         { LR_pos: 0.5, LR_neg: 1.08, source: 'clinical_consensus', evidence_level: 'C' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Red Flag Definitions
// ─────────────────────────────────────────────────────────────────────────────
// These are high-priority signals that, when present, withhold confidence
// entirely and route to urgent review. Matching is keyword-based on the
// finding key string (same pattern as rfConfidenceResolver.mjs RED_FLAG_PATHWAYS).

const RED_FLAG_PATTERNS = [
  { pattern: /calf.*warm|warmth.*calf|dvt|clot|breath/, category: 'vascular_dvt_pe',
    message: 'Calf swelling, warmth, or breathlessness needs urgent medical review (possible blood clot).' },
  { pattern: /numb|tingl|radiat|travel|nerve|sciatica/, category: 'neuro',
    message: 'Numbness, tingling, or radiating pain needs neurological assessment.' },
  { pattern: /groin.*bulge|inguinal|hernia|testicular/, category: 'hernia',
    message: 'A groin or abdominal bulge needs medical assessment.' },
  { pattern: /cannot.*bear.*weight|non.*weight.*bear|fracture_screen/, category: 'fracture_screen',
    message: 'Inability to bear weight needs in-person assessment to rule out fracture.' },
  { pattern: /deformity|bone.*visible|open.*wound/, category: 'structural_emergency',
    message: 'Visible deformity or open wound requires immediate emergency assessment.' },
  { pattern: /night.*pain|fever|unwell|systemic|constant.*rest/, category: 'systemic',
    message: 'Night pain, fever, or constant rest pain needs medical review.' },
  { pattern: /major.*pop.*instab|complete.*rupture|locked.*joint/, category: 'structural_rupture',
    message: 'A major pop with complete instability or locked joint needs urgent orthopaedic review.' },
];

function detectRedFlags(assessmentAnswers) {
  const flags = [];
  if (!assessmentAnswers || typeof assessmentAnswers !== 'object') return flags;

  const allValues = Object.entries(assessmentAnswers)
    .filter(([, v]) => v === true || v === 'yes' || v === 'present')
    .map(([k]) => k.toLowerCase());

  for (const flagKey of allValues) {
    const match = RED_FLAG_PATTERNS.find((p) => p.pattern.test(flagKey));
    if (match) {
      flags.push({ flag: flagKey, category: match.category, message: match.message });
    }
  }
  return flags;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility — sigmoid and log-odds conversions
// ─────────────────────────────────────────────────────────────────────────────

function sigmoid(logOdds) {
  return 1 / (1 + Math.exp(-logOdds));
}

function logOddsFromProbability(p) {
  const clamped = Math.max(0.001, Math.min(0.999, p));
  return Math.log(clamped / (1 - clamped));
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Completeness Assessment
// ─────────────────────────────────────────────────────────────────────────────
// Core fields are the minimum set for a reliable diagnosis estimate.
// Their relative information value determines the completeness weight.

const CORE_FINDING_WEIGHTS = {
  mechanism: 0.20,           // highest information value — narrows differential most
  pain_location: 0.20,
  walking_response: 0.15,
  resisted_test_primary: 0.15,
  pop_or_snap: 0.10,
  bruising: 0.08,
  ability_to_continue: 0.07,
  pain_severity: 0.05,
};

/**
 * Computes a completeness ratio [0, 1] and lists missing fields.
 * @param {Object} presentKeys - set of finding keys that were answered
 * @returns {{ ratio: number, missing: string[], capFromCompleteness: number }}
 */
function assessCompleteness(presentKeys) {
  const presentSet = new Set(presentKeys);
  const missing = [];
  let coveredWeight = 0;

  for (const [field, weight] of Object.entries(CORE_FINDING_WEIGHTS)) {
    const hasField = [...presentSet].some((k) => k.startsWith(field.replace(/_primary$/, '')));
    if (hasField) {
      coveredWeight += weight;
    } else {
      missing.push(field);
    }
  }

  const ratio = coveredWeight; // 0–1
  let capFromCompleteness;
  if (ratio >= 0.80) {
    capFromCompleteness = POLICY.NORMAL_HIGH_CAP;
  } else if (ratio >= 0.50) {
    capFromCompleteness = POLICY.PARTIAL_COMPLETION_CAP;
  } else {
    capFromCompleteness = 45; // very sparse data
  }

  return { ratio, missing, capFromCompleteness };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sport / Age Modifiers
// ─────────────────────────────────────────────────────────────────────────────

const SPORT_MODIFIERS = {
  rectus_femoris_strain:  { football: 1.4, rugby: 1.2, running: 0.9, basketball: 0.8, swimming: 0.5, default: 1.0 },
  hamstring_strain_biceps:{ football: 1.5, running: 1.4, rugby: 1.2, basketball: 1.0, default: 1.0 },
  lateral_ankle_sprain:   { basketball: 1.4, volleyball: 1.4, football: 1.2, running: 0.8, default: 1.0 },
  acl_sprain:             { football: 1.3, skiing: 1.5, basketball: 1.2, running: 0.7, default: 1.0 },
  patellofemoral_pain:    { running: 1.6, cycling: 1.3, swimming: 0.9, football: 1.0, default: 1.0 },
};

const AGE_MODIFIERS = {
  acl_sprain:             { '15-25': 1.3, '25-35': 1.1, '35-50': 0.8, '50+': 0.6 },
  avulsion_aiis:          { '14-20': 2.5, '20-30': 0.6, '30+': 0.3 },
  patellofemoral_pain:    { '15-25': 1.2, '25-40': 1.0, '40+': 0.8 },
};

function getSportModifier(injuryId, sport) {
  const modifiers = SPORT_MODIFIERS[injuryId];
  if (!modifiers || !sport) return 1.0;
  return modifiers[sport.toLowerCase()] ?? modifiers.default ?? 1.0;
}

function getAgeModifier(injuryId, ageGroup) {
  const modifiers = AGE_MODIFIERS[injuryId];
  if (!modifiers || !ageGroup) return 1.0;
  return modifiers[ageGroup] ?? 1.0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export — computeConfidenceScore
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute Bayesian pattern-match confidence for a candidate injury.
 *
 * @param {Object} assessmentAnswers - Map of finding keys to values.
 *   Keys follow the convention "domain:value", e.g.:
 *     { "mechanism:sprinting": true, "location:anterior_thigh": true,
 *       "resisted_knee_extension:pain": true, "walking_response:painful": true,
 *       "mechanism:kicking": false }
 *   A key mapped to true/present = the finding IS present.
 *   A key mapped to false/absent = the finding is explicitly ABSENT (contributes LR-).
 *   A key not present = finding was not assessed (neutral, no LR applied).
 *
 * @param {string} candidateInjury - Injury ID from INJURY_PRIORS, e.g. "rectus_femoris_strain"
 *
 * @param {Object} [context] - Optional contextual modifiers
 * @param {string} [context.sport] - Sport context, e.g. "football", "running"
 * @param {string} [context.ageGroup] - Age bracket, e.g. "25-35"
 * @param {Object} [context.redFlagAnswers] - Key-value map of red flag answers
 * @param {boolean} [context.previousInjury] - Whether a previous injury to this region is reported
 *
 * @returns {{
 *   score: number,              // 0–100 — match confidence percentage (not diagnostic certainty)
 *   explanation: Array<{        // ordered by contribution magnitude (descending)
 *     finding: string,
 *     present: boolean,
 *     contribution: number,     // score delta from this finding (positive or negative)
 *     lr: number,               // the likelihood ratio applied
 *     source: string,
 *     evidence_level: string,
 *     narrative: string         // human-readable sentence
 *   }>,
 *   redFlags: Array<{           // present if any red flags detected
 *     flag: string,
 *     category: string,
 *     message: string
 *   }>,
 *   confidence_band: "low"|"medium"|"high",
 *   withheld: boolean,          // true if confidence is withheld (red flags or insufficient data)
 *   withheld_reason: string|null,
 *   posterior_probability: number,  // raw Bayesian posterior [0, 1] before policy cap
 *   prior_probability: number,
 *   completeness: {
 *     ratio: number,            // 0–1 fraction of core findings assessed
 *     missing: string[],        // list of unanswered core finding categories
 *     cap_applied: number       // the completeness-based cap that was applied
 *   },
 *   caps_applied: string[],     // list of cap names applied in order
 *   data_quality_notes: string[]
 * }}
 */
export function computeConfidenceScore(assessmentAnswers, candidateInjury, context = {}) {
  const explanation = [];
  const dataQualityNotes = [];
  const capsApplied = [];

  // ── 1. Validate inputs ──────────────────────────────────────────────────────
  if (!assessmentAnswers || typeof assessmentAnswers !== 'object') {
    return _withheld('Invalid assessment answers provided.', [], {
      score: 0, prior_probability: 0, posterior_probability: 0,
      completeness: { ratio: 0, missing: Object.keys(CORE_FINDING_WEIGHTS), cap_applied: 0 },
      caps_applied: [], data_quality_notes: ['Assessment answers must be a non-null object.']
    });
  }

  if (!candidateInjury || !INJURY_PRIORS[candidateInjury]) {
    return _withheld(`Unknown injury: "${candidateInjury}". Add to INJURY_PRIORS to enable scoring.`, [], {
      score: 0, prior_probability: 0, posterior_probability: 0,
      completeness: { ratio: 0, missing: [], cap_applied: 0 },
      caps_applied: [], data_quality_notes: [`Injury "${candidateInjury}" not found in INJURY_PRIORS.`]
    });
  }

  // ── 2. Red flag check — highest priority, always evaluated first ────────────
  const redFlags = detectRedFlags({
    ...assessmentAnswers,
    ...(context.redFlagAnswers || {})
  });

  if (redFlags.length > 0) {
    return {
      score: null,
      explanation: [],
      redFlags,
      confidence_band: null,
      withheld: true,
      withheld_reason: 'Red flag(s) detected. Confidence withheld — seek in-person clinical review.',
      posterior_probability: null,
      prior_probability: INJURY_PRIORS[candidateInjury].prior,
      completeness: { ratio: 0, missing: [], cap_applied: 0 },
      caps_applied: ['red_flag_withhold'],
      data_quality_notes: redFlags.map((f) => f.message),
    };
  }

  // ── 3. Data completeness assessment ────────────────────────────────────────
  const presentFindings = Object.keys(assessmentAnswers).filter(
    (k) => assessmentAnswers[k] === true || assessmentAnswers[k] === 'yes' || assessmentAnswers[k] === 'present'
  );
  const absentFindings = Object.keys(assessmentAnswers).filter(
    (k) => assessmentAnswers[k] === false || assessmentAnswers[k] === 'no' || assessmentAnswers[k] === 'absent'
  );

  const allAssessed = [...presentFindings, ...absentFindings];
  const completeness = assessCompleteness(allAssessed);

  // Not enough data to score reliably
  if (allAssessed.length < POLICY.MIN_QUESTIONS_FOR_SCORE) {
    return _withheld(
      `Only ${allAssessed.length} finding(s) assessed. Minimum ${POLICY.MIN_QUESTIONS_FOR_SCORE} required for a reliable estimate.`,
      [],
      {
        score: null, prior_probability: INJURY_PRIORS[candidateInjury].prior,
        posterior_probability: null,
        completeness,
        caps_applied: ['insufficient_data'],
        data_quality_notes: [`${POLICY.MIN_QUESTIONS_FOR_SCORE - allAssessed.length} more finding(s) needed.`]
      }
    );
  }

  // ── 4. Start with log-odds of the prior ─────────────────────────────────────
  let priorP = INJURY_PRIORS[candidateInjury].prior;

  // Apply sport modifier to prior
  const sportMod = getSportModifier(candidateInjury, context.sport);
  if (sportMod !== 1.0) {
    const adjustedPrior = Math.max(0.01, Math.min(0.95, priorP * sportMod));
    dataQualityNotes.push(`Sport modifier (${context.sport || 'default'}): ${sportMod.toFixed(2)}x — prior adjusted from ${(priorP * 100).toFixed(0)}% to ${(adjustedPrior * 100).toFixed(0)}%.`);
    priorP = adjustedPrior;
  }

  // Apply age modifier to prior
  const ageMod = getAgeModifier(candidateInjury, context.ageGroup);
  if (ageMod !== 1.0) {
    const adjustedPrior = Math.max(0.01, Math.min(0.95, priorP * ageMod));
    dataQualityNotes.push(`Age modifier (${context.ageGroup}): ${ageMod.toFixed(2)}x — prior adjusted to ${(adjustedPrior * 100).toFixed(0)}%.`);
    priorP = adjustedPrior;
  }

  // Previous injury modifier: increases prior (Green 2020 analog: RR 2.7 for recurrence)
  if (context.previousInjury === true) {
    const prevMod = 1.8; // conservative application of the 2.7 RR
    const adjustedPrior = Math.max(0.01, Math.min(0.95, priorP * prevMod));
    dataQualityNotes.push(`Previous injury to this region: prior increased from ${(priorP * 100).toFixed(0)}% to ${(adjustedPrior * 100).toFixed(0)}% (recurrence risk, Green 2020 analog).`);
    priorP = adjustedPrior;
  }

  let logOdds = logOddsFromProbability(priorP);
  const lrTable = LIKELIHOOD_RATIOS[candidateInjury] || {};

  // ── 5. Apply likelihood ratios for each assessed finding ─────────────────────
  for (const [findingKey, findingValue] of Object.entries(assessmentAnswers)) {
    const isPresent = findingValue === true || findingValue === 'yes' || findingValue === 'present';
    const isAbsent  = findingValue === false || findingValue === 'no' || findingValue === 'absent';
    if (!isPresent && !isAbsent) continue; // skip undefined/null

    const lrEntry = lrTable[findingKey];
    if (!lrEntry) continue; // finding not in this injury's LR table — neutral

    const lr = isPresent ? lrEntry.LR_pos : lrEntry.LR_neg;
    const logLR = Math.log(Math.max(0.001, lr));
    const prevLogOdds = logOdds;
    logOdds += logLR;

    // Track contribution in probability space for readability
    const prevP = sigmoid(prevLogOdds);
    const newP = sigmoid(logOdds);
    const contributionPct = Math.round((newP - prevP) * 100);

    explanation.push({
      finding: findingKey,
      present: isPresent,
      contribution: contributionPct,
      lr: parseFloat(lr.toFixed(2)),
      source: lrEntry.source,
      evidence_level: lrEntry.evidence_level,
      narrative: _findingNarrative(findingKey, isPresent, lr, lrEntry.evidence_level),
    });
  }

  // ── 6. Compute posterior probability ─────────────────────────────────────────
  const posteriorProbability = sigmoid(logOdds);
  const rawScorePct = Math.round(posteriorProbability * 100);

  // ── 7. Apply policy caps ────────────────────────────────────────────────────
  const activeCaps = [];

  activeCaps.push({ name: 'self_report_absolute_max', value: POLICY.SELF_REPORT_ABSOLUTE_MAX });
  activeCaps.push({ name: `completeness_${completeness.ratio >= 0.80 ? 'high' : completeness.ratio >= 0.50 ? 'medium' : 'low'}`, value: completeness.capFromCompleteness });

  // Check for conflicting signals
  const hasConflictingSignals = _detectConflictingSignals(assessmentAnswers, candidateInjury, lrTable);
  if (hasConflictingSignals) {
    activeCaps.push({ name: 'conflicting_signals', value: POLICY.CONFLICTING_SIGNALS_CAP });
    dataQualityNotes.push('Some findings conflict with each other — confidence held lower.');
  }

  const finalCap = Math.min(...activeCaps.map((c) => c.value));
  const finalScore = Math.max(0, Math.min(rawScorePct, finalCap));

  for (const cap of activeCaps) {
    if (cap.value <= rawScorePct) {
      capsApplied.push(`${cap.name}: ${cap.value}%`);
    }
  }

  // ── 8. Sort explanation by absolute contribution magnitude ───────────────────
  explanation.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // ── 9. Determine confidence band ─────────────────────────────────────────────
  const confidence_band = finalScore >= 70 ? 'high' : finalScore >= 50 ? 'medium' : 'low';

  return {
    score: finalScore,
    explanation,
    redFlags: [],
    confidence_band,
    withheld: false,
    withheld_reason: null,
    posterior_probability: parseFloat(posteriorProbability.toFixed(3)),
    prior_probability: parseFloat(priorP.toFixed(3)),
    completeness: {
      ratio: parseFloat(completeness.ratio.toFixed(2)),
      missing: completeness.missing,
      cap_applied: completeness.capFromCompleteness,
    },
    caps_applied: capsApplied,
    data_quality_notes: dataQualityNotes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Differential Diagnosis — rank multiple candidate injuries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run computeConfidenceScore across all injuries in INJURY_PRIORS that match
 * the given region, return them sorted by score descending.
 *
 * @param {Object} assessmentAnswers - same format as computeConfidenceScore
 * @param {string} region - e.g. "anterior_thigh", "posterior_thigh", "ankle", "knee"
 * @param {Object} [context] - same as computeConfidenceScore context
 * @returns {Array<{ injury_id: string, score: number, confidence_band: string, withheld: boolean }>}
 */
export function differentialDiagnosis(assessmentAnswers, region, context = {}) {
  const candidates = Object.entries(INJURY_PRIORS)
    .filter(([, v]) => v.region === region)
    .map(([injuryId]) => injuryId);

  const results = candidates.map((injuryId) => {
    const result = computeConfidenceScore(assessmentAnswers, injuryId, context);
    return {
      injury_id: injuryId,
      score: result.score,
      confidence_band: result.confidence_band,
      withheld: result.withheld,
      prior_probability: result.prior_probability,
      posterior_probability: result.posterior_probability,
      top_contributing_findings: result.explanation ? result.explanation.slice(0, 3) : [],
    };
  });

  // Sort: withheld results to end, then by score descending
  return results.sort((a, b) => {
    if (a.withheld && !b.withheld) return 1;
    if (!a.withheld && b.withheld) return -1;
    return (b.score ?? 0) - (a.score ?? 0);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

function _withheld(reason, redFlags, extraFields) {
  return {
    score: null,
    explanation: [],
    redFlags: redFlags || [],
    confidence_band: null,
    withheld: true,
    withheld_reason: reason,
    ...extraFields,
  };
}

function _findingNarrative(findingKey, isPresent, lr, evidenceLevel) {
  const direction = isPresent ? 'increases' : 'decreases';
  const strength = lr >= 3 ? 'strongly' : lr >= 1.5 ? 'moderately' : lr >= 0.7 ? 'slightly' : 'moderately reduces';
  const evStr = evidenceLevel === 'A' ? '(strong evidence)' : evidenceLevel === 'B' ? '(moderate evidence)' : '(expert consensus)';
  const label = findingKey.replace(/_/g, ' ').replace(/:/g, ': ');
  return `"${label}" ${isPresent ? 'present' : 'absent'} ${direction} probability ${strength}. LR=${lr.toFixed(2)} ${evStr}`;
}

function _detectConflictingSignals(answers, injuryId, lrTable) {
  // A conflict exists when:
  // - A high LR+ finding is present (strongly supports injury)
  // - AND a finding that strongly reduces probability is ALSO present
  const strongPositive = Object.entries(answers)
    .filter(([k, v]) => (v === true || v === 'yes') && lrTable[k] && lrTable[k].LR_pos >= 3.0);
  const strongNegative = Object.entries(answers)
    .filter(([k, v]) => (v === true || v === 'yes') && lrTable[k] && lrTable[k].LR_pos <= 0.4);
  return strongPositive.length > 0 && strongNegative.length > 0;
}
