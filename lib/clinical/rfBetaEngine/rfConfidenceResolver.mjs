/**
 * lib/clinical/rfBetaEngine/rfConfidenceResolver.mjs
 * ---------------------------------------------------------------------------
 * Match-quality confidence (NOT diagnostic certainty, capacity, readiness, or
 * clearance). Implements Bayesian log-odds inference: prior × likelihood ratios
 * → posterior via sigmoid. Replaces additive scoring (Phase 1 of the
 * Bayesian → RAG → LLM architecture plan).
 *
 * Policy caps from §7a are unchanged:
 *   Normal high: 82%  |  Absolute max: 84%  |  Partial data: 65%
 *   Conflicting: 68%  |  Missing data (3+ fields): 58%
 *
 * LR source: assessment_question_weights.json + injury_priors.json (research
 * sprint June 2026). Self-report calibration cap: ~76% accuracy ceiling
 * (Allott 2026, PMID 42315273) enforced by policy cap.
 * ---------------------------------------------------------------------------
 */

import { CONFIDENCE_CAPS } from './types.mjs';
import { hasRedFlag } from './rfAssessmentInput.mjs';

// ── Utility ────────────────────────────────────────────────────────────────
/** Convert probability p to log-odds. */
function logOdds(p) { return Math.log(p / (1 - p)); }

/** Convert log-odds to probability 0–1. */
function sigmoid(lo) { return 1 / (1 + Math.exp(-lo)); }

// ── RF Prior ───────────────────────────────────────────────────────────────
// Rectus femoris strain base rate for anterior-thigh athletic presentations.
// Source: injury_priors.json (Ekstrand 2011, Woods 2004, Pietsch 2023).
const RF_PRIOR = 0.28;

// ── Likelihood Ratios ──────────────────────────────────────────────────────
// Self-report calibrated LRs. Deliberately conservative (LR+ ≤ 3.5) because
// patient self-report has lower discriminating power than clinician examination.
// Each LR is applied ONLY when the finding is clearly present or absent;
// missing/unsure answers receive no update (proper Bayesian treatment).
//
// Sources: assessment_question_weights.json, injury_classification_dataset.json,
// MASTER_DATA_SCIENCE_PLAN.md (PubMed sprint, June 2026).
const LR = Object.freeze({
  // Primary discriminators (highest RF specificity)
  anterior_location_present:     3.5,   // anterior thigh vs. not
  anterior_location_absent:      0.25,  // non-anterior pain → RF unlikely
  uncertain_location:            0.30,  // "multiple or unsure"

  rf_mechanism_present:          3.2,   // sprinting / kicking / acceleration
  rf_mechanism_absent:           0.50,  // known non-RF mechanism (overuse/impact)

  resisted_knee_ext_positive:    2.8,   // painful or unable resisted extension
  resisted_knee_ext_negative:    0.35,  // clearly none/normal (strong RF negative)

  // Secondary discriminators
  resisted_hip_flex_positive:    1.9,   // RF is also a hip flexor
  resisted_hip_flex_negative:    0.70,

  hip_flexion_response_positive: 1.6,   // hip flexion reproduces front-thigh pain
  hip_flexion_response_negative: 0.82,

  knee_flexion_stretch_positive: 1.7,   // Thomas-like stretch sign
  knee_flexion_stretch_negative: 0.84,

  palpation_positive:            1.8,   // tender palpation at anterior thigh
  palpation_negative:            0.72,

  kicking_positive:              1.7,   // kicking reproduces symptoms
  kicking_negative:              0.80,

  walk_stairs_positive:          1.4,   // anterior-thigh load with gait
  walk_stairs_negative:          0.88,

  overlap_location:              0.50,  // hip-flexor / groin / knee overlap

  previous_injury:               0.88,  // complexity factor, small effect

  confident_consistent:          1.30,  // coherent answers across report
  answers_unsure:                0.80,  // stated uncertainty in own report
});

// ── Red-flag routing ───────────────────────────────────────────────────────
// (unchanged from previous resolver — per-flag pathways, no generic message)
const RED_FLAG_PATHWAYS = [
  { test: /calf|warmth|redness|shortness|breath/,       category: 'vascular_dvt_pe',          message: 'Calf swelling, warmth, or breathlessness needs urgent medical review (possible blood clot).' },
  { test: /numb|tingl|radiat|travels?|nerve/,           category: 'neuro',                    message: 'Numbness, tingling, or pain travelling down the leg needs neurological review.' },
  { test: /groin|abdominal|bulge|testicular|cough|sneez/,category: 'hernia_referral',         message: 'A groin or abdominal bulge needs medical assessment (possible hernia).' },
  { test: /bear[_ ]?weight|walk[_ ]?four|cannot[_ ]?walk/,category: 'weightbearing_fracture_screen', message: 'Difficulty bearing weight needs in-person assessment to rule out a fracture.' },
  { test: /pop|unstable|loss[_ ]?of[_ ]?function/,      category: 'structural_rupture',       message: 'A major pop with instability or loss of function needs urgent review.' },
  { test: /lock|catch|gives?[_ ]?way|straighten/,       category: 'mechanical_knee',          message: 'Locking, catching, or giving way needs a knee assessment.' },
  { test: /deformity|large[_ ]?bruise|severe[_ ]?swelling|swelling|bruise/, category: 'severe_structural', message: 'Rapid swelling, deformity, or a large bruise needs urgent review.' },
  { test: /night|fever|unwell|constant/,                category: 'systemic',                 message: 'Constant or night pain, or feeling feverish/unwell, needs medical review.' },
];

export function classifyRedFlags(redFlagAnswers = {}) {
  const out = [];
  for (const [key, val] of Object.entries(redFlagAnswers)) {
    if (val !== true) continue;
    const k = String(key).toLowerCase();
    const match = RED_FLAG_PATHWAYS.find((p) => p.test.test(k));
    out.push(match
      ? { flag: key, category: match.category, message: match.message }
      : { flag: key, category: 'general_review', message: 'This answer should be reviewed in person before progressing.' });
  }
  return out;
}

// ── Location / mechanism constants (kept for compatibility with index.mjs) ──
const ANTERIOR      = ['anterior_thigh_rectus_femoris', 'front_thigh_general'];
const RF_MECHANISM  = ['sprinting', 'kicking', 'acceleration'];
const OVERLAP_LOCATION = ['upper_thigh_hip_flexor', 'knee_region', 'groin_adductor'];

// ── Main resolver ──────────────────────────────────────────────────────────
/**
 * @returns {{
 *   withheld: boolean, route: ('review'|'incomplete'|null),
 *   confidence_percent: (number|null), confidence_label: string,
 *   cap_applied: number, rules_applied: string[], reasons: string[],
 *   bayesian_posterior_raw?: number
 * }}
 */
export function resolveConfidence(input, missingCoreFields = []) {
  const rules_applied = [];
  const reasons = [];

  // ── Red flag → withhold + route (policy §7a; RF v1.2 §12.2) ─────────────
  if (hasRedFlag(input)) {
    rules_applied.push('red_flag_withhold (policy §7a; RF v1.2 §12.2)');
    const pathways = classifyRedFlags(input.red_flag_answers);
    return {
      withheld: true, route: 'review', confidence_percent: null,
      confidence_label: 'Not shown — please seek review', cap_applied: 0,
      red_flag_pathways: pathways,
      rules_applied,
      reasons: pathways.length
        ? pathways.map((p) => p.message)
        : ['A safety answer needs in-person review before any result is shown.'],
    };
  }

  // ── Severe signals → route to review ─────────────────────────────────────
  const severeSignals =
    input.pain_severity_label === 'severe' ||
    input.ability_to_continue === 'no' ||
    (input.bruising_or_swelling === 'significant' && input.weakness_or_giving_way === 'marked') ||
    input.knee_extension_response === 'unable';
  if (severeSignals) {
    rules_applied.push('possible_higher_grade_route_review (RF-SEV-004)');
    return {
      withheld: true, route: 'review', confidence_percent: null,
      confidence_label: 'Not shown — higher-concern pattern, please seek review', cap_applied: 0,
      rules_applied, reasons: ['Your answers suggest a higher-concern pattern that should be reviewed in person.'],
    };
  }

  // ── Assessment completeness ───────────────────────────────────────────────
  const completeness = input.assessment_completeness;
  if (completeness === 'incomplete') {
    rules_applied.push('assessment_incomplete_withhold');
    return {
      withheld: true, route: 'incomplete', confidence_percent: null,
      confidence_label: 'Not shown — RF assessment incomplete', cap_applied: 0,
      limited_by_missing_inputs: true,
      rules_applied, reasons: ['Not enough RF assessment answers yet to estimate a pattern match. Answer the movement/strength checks to continue.'],
    };
  }

  // ── Bayesian log-odds chain ───────────────────────────────────────────────
  // Starting point: RF prior probability converted to log-odds.
  let lo = logOdds(RF_PRIOR); // ≈ -0.944
  const caps = [CONFIDENCE_CAPS.SELF_REPORT_NORMAL_HIGH];
  let limited_by_missing_inputs = false;

  if (completeness === 'partial') {
    caps.push(65);
    limited_by_missing_inputs = true;
    rules_applied.push('assessment_partial_cap');
    reasons.push('Some RF assessment answers are missing, so confidence is held lower.');
  }

  const st = input.rf_self_tests || {};
  const PAINY = ['painful', 'mild'];

  // 1. Pain location — we almost always know this; apply appropriate LR.
  if (ANTERIOR.includes(input.pain_location)) {
    lo += Math.log(LR.anterior_location_present);
    reasons.push('Pain located at the front of the thigh.');
    rules_applied.push('bayes_anterior_location+');
  } else if (input.pain_location === 'multiple_or_unsure' || input.pain_location == null) {
    lo += Math.log(LR.uncertain_location);
    caps.push(75);
    reasons.push('Pain location uncertain.');
    rules_applied.push('bayes_uncertain_location−');
  } else if (OVERLAP_LOCATION.includes(input.pain_location)) {
    lo += Math.log(LR.overlap_location);
    caps.push(75);
    reasons.push('Pattern may overlap hip-flexor / adductor / knee.');
    rules_applied.push('bayes_overlap_location−');
  } else {
    // Non-anterior and not overlap → RF unlikely
    lo += Math.log(LR.anterior_location_absent);
    reasons.push('Pain not located at the front of the thigh.');
    rules_applied.push('bayes_non_anterior_location−');
  }

  // 2. Mechanism — only update when clearly known.
  if (RF_MECHANISM.includes(input.mechanism)) {
    lo += Math.log(LR.rf_mechanism_present);
    reasons.push('Mechanism consistent with rectus femoris load.');
    rules_applied.push('bayes_rf_mechanism+');
  } else if (input.mechanism && input.mechanism !== 'unsure') {
    lo += Math.log(LR.rf_mechanism_absent);
    reasons.push('Mechanism not specific to rectus femoris.');
    rules_applied.push('bayes_mechanism_non_rf−');
  }
  // 'unsure' / null → no update (missing data principle)

  // 3. Resisted knee extension — strongest quadriceps/RF sign.
  if (PAINY.includes(input.knee_extension_response)) {
    lo += Math.log(LR.resisted_knee_ext_positive);
    reasons.push('Resisted knee extension reproduces symptoms (quadriceps/RF).');
    rules_applied.push('bayes_knee_ext+');
  } else if (input.knee_extension_response === 'none') {
    lo += Math.log(LR.resisted_knee_ext_negative);
    reasons.push('Resisted knee extension does not reproduce symptoms.');
    rules_applied.push('bayes_knee_ext−');
  }
  // 'unable' already caught by severeSignals above; 'unsure'/null → no update

  // 4. Resisted hip flexion — RF is a hip flexor; secondary discriminator.
  if (PAINY.includes(input.resisted_hip_flexion) || input.resisted_hip_flexion === 'weak') {
    lo += Math.log(LR.resisted_hip_flex_positive);
    reasons.push('Resisted hip flexion reproduces symptoms (RF is a hip flexor).');
    rules_applied.push('bayes_hip_flex+');
  } else if (input.resisted_hip_flexion === 'none' || input.resisted_hip_flexion === 'normal') {
    lo += Math.log(LR.resisted_hip_flex_negative);
    rules_applied.push('bayes_hip_flex−');
  }

  // 5. Hip flexion movement response.
  if (PAINY.includes(input.hip_flexion_response)) {
    lo += Math.log(LR.hip_flexion_response_positive);
    reasons.push('Hip-flexion movement reproduces front-thigh symptoms.');
    rules_applied.push('bayes_hip_flexion_response+');
  } else if (input.hip_flexion_response === 'none') {
    lo += Math.log(LR.hip_flexion_response_negative);
    rules_applied.push('bayes_hip_flexion_response−');
  }

  // 6. Knee flexion stretch — Thomas-like stretch sign.
  if (input.knee_flexion_response === 'painful') {
    lo += Math.log(LR.knee_flexion_stretch_positive);
    reasons.push('Knee-flexion stretch reproduces front-thigh symptoms (RF stretch sign).');
    rules_applied.push('bayes_knee_flexion_stretch+');
  } else if (input.knee_flexion_response === 'none') {
    lo += Math.log(LR.knee_flexion_stretch_negative);
    rules_applied.push('bayes_knee_flexion_stretch−');
  }

  // 7. Palpation (from self-tests).
  if (['marked', 'mild', 'lump'].includes(st.palpation)) {
    lo += Math.log(LR.palpation_positive);
    reasons.push('Tender to palpation at the front of the thigh (localises to RF).');
    rules_applied.push('bayes_palpation+');
  } else if (st.palpation === 'none') {
    lo += Math.log(LR.palpation_negative);
    rules_applied.push('bayes_palpation−');
  }

  // 8. Kicking tolerance (from self-tests).
  if (['symptoms_during', 'symptoms_after'].includes(st.kick_tolerance)) {
    lo += Math.log(LR.kicking_positive);
    reasons.push('Kicking reproduces symptoms (rectus-femoris-specific).');
    rules_applied.push('bayes_kicking+');
  } else if (st.kick_tolerance === 'no_symptoms') {
    lo += Math.log(LR.kicking_negative);
    rules_applied.push('bayes_kicking−');
  }

  // 9. Walking / stairs load pattern.
  if (PAINY.includes(input.walking_response) || PAINY.includes(input.stairs_response)) {
    lo += Math.log(LR.walk_stairs_positive);
    reasons.push('Walking / stairs pattern consistent with anterior-thigh load.');
    rules_applied.push('bayes_walk_stairs+');
  } else if (input.walking_response === 'none' && input.stairs_response === 'none') {
    lo += Math.log(LR.walk_stairs_negative);
    rules_applied.push('bayes_walk_stairs−');
  }

  // 10. Previous injury — small complexity factor.
  if (input.previous_injury) {
    lo += Math.log(LR.previous_injury);
    reasons.push('Previous/recurrent injury adds complexity.');
    rules_applied.push('bayes_previous_injury−');
  }

  // 11. Confidence in own answers — credibility of the self-report.
  if (input.confidence_in_answers === 'confident') {
    lo += Math.log(LR.confident_consistent);
    reasons.push('Answers were complete and consistent.');
    rules_applied.push('bayes_confident+');
  } else if (input.confidence_in_answers === 'unsure') {
    lo += Math.log(LR.answers_unsure);
    reasons.push('Some uncertainty in own answers.');
    rules_applied.push('bayes_answers_unsure−');
  }

  // ── Conflicting signals cap ───────────────────────────────────────────────
  const conflicting =
    (input.confidence_in_answers === 'unsure' && ANTERIOR.includes(input.pain_location)) ||
    (OVERLAP_LOCATION.includes(input.pain_location) && RF_MECHANISM.includes(input.mechanism));
  if (conflicting) {
    caps.push(CONFIDENCE_CAPS.CONFLICTING);
    rules_applied.push('cap_conflicting_signals');
    reasons.push('Some answers conflict, so confidence is held lower.');
  }

  // ── Missing core fields cap ───────────────────────────────────────────────
  if (missingCoreFields.length >= 3) {
    caps.push(CONFIDENCE_CAPS.MISSING_DATA);
    rules_applied.push('cap_missing_data');
    reasons.push('Key answers are missing, so confidence is held lower.');
  }

  // ── Convert posterior to percentage ──────────────────────────────────────
  const posterior = sigmoid(lo);           // 0–1 Bayesian posterior
  const rawScore = Math.round(posterior * 100);

  const cap = Math.min(...caps, CONFIDENCE_CAPS.SELF_REPORT_ABSOLUTE_MAX);
  const confidence = Math.max(0, Math.min(rawScore, cap));

  return {
    withheld: false, route: null, confidence_percent: confidence,
    confidence_label: `${confidence}% match confidence (how well your answers match this pattern — not a diagnosis)`,
    cap_applied: cap, limited_by_missing_inputs, rules_applied, reasons,
    bayesian_posterior_raw: Math.round(posterior * 1000) / 10, // e.g. 81.3
  };
}
