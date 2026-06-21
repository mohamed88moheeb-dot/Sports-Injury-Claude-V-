/**
 * lib/clinical/rfBetaEngine/rfConfidenceResolver.mjs
 * ---------------------------------------------------------------------------
 * Match-quality confidence (NOT diagnostic certainty, capacity, readiness, or
 * clearance). Implements the digital/self-report caps from the Confidence &
 * Results UX policy (§7a): normal high cap 82%, absolute ceiling strictly
 * below 85%, never 90-99% or 100%. Red flags withhold confidence and route to
 * review. Missing/conflicting data force lower caps.
 * ---------------------------------------------------------------------------
 */

import { CONFIDENCE_CAPS } from './types.mjs';
import { hasRedFlag } from './rfAssessmentInput.mjs';

/**
 * Per-red-flag routing. Each safety answer is matched to a specific concern +
 * guidance message instead of one generic "seek review". The safe behaviour
 * (withhold confidence + route to review) is unchanged — this only adds
 * specificity. Matching is on the answer KEY text (the mapper lowercases the
 * full question into the key).
 */
// Order = priority (first match wins). Most urgent / most specific patterns are
// listed first so e.g. the calf+breath flag routes to DVT/PE, not generic swelling.
const RED_FLAG_PATHWAYS = [
  { test: /calf|warmth|redness|shortness|breath/, category: 'vascular_dvt_pe', message: 'Calf swelling, warmth, or breathlessness needs urgent medical review (possible blood clot).' },
  { test: /numb|tingl|radiat|travels?|nerve/, category: 'neuro', message: 'Numbness, tingling, or pain travelling down the leg needs neurological review.' },
  { test: /groin|abdominal|bulge|testicular|cough|sneez/, category: 'hernia_referral', message: 'A groin or abdominal bulge needs medical assessment (possible hernia).' },
  { test: /bear[_ ]?weight|walk[_ ]?four|cannot[_ ]?walk/, category: 'weightbearing_fracture_screen', message: 'Difficulty bearing weight needs in-person assessment to rule out a fracture.' },
  { test: /pop|unstable|loss[_ ]?of[_ ]?function/, category: 'structural_rupture', message: 'A major pop with instability or loss of function needs urgent review.' },
  { test: /lock|catch|gives?[_ ]?way|straighten/, category: 'mechanical_knee', message: 'Locking, catching, or giving way needs a knee assessment.' },
  { test: /deformity|large[_ ]?bruise|severe[_ ]?swelling|swelling|bruise/, category: 'severe_structural', message: 'Rapid swelling, deformity, or a large bruise needs urgent review.' },
  { test: /night|fever|unwell|constant/, category: 'systemic', message: 'Constant or night pain, or feeling feverish/unwell, needs medical review.' }
];

export function classifyRedFlags(redFlagAnswers = {}) {
  const out = [];
  for (const [key, val] of Object.entries(redFlagAnswers)) {
    if (val !== true) continue;
    const k = String(key).toLowerCase();
    const match = RED_FLAG_PATHWAYS.find((p) => p.test.test(k));
    out.push(match ? { flag: key, category: match.category, message: match.message }
                   : { flag: key, category: 'general_review', message: 'This answer should be reviewed in person before progressing.' });
  }
  return out;
}

const ANTERIOR = ['anterior_thigh_rectus_femoris', 'front_thigh_general'];
const RF_MECHANISM = ['sprinting', 'kicking', 'acceleration'];
const OVERLAP_LOCATION = ['upper_thigh_hip_flexor', 'knee_region', 'groin_adductor'];

/**
 * @returns {{
 *   withheld: boolean, route: ('review'|null), confidence_percent: (number|null),
 *   confidence_label: string, cap_applied: number, rules_applied: string[], reasons: string[]
 * }}
 */
export function resolveConfidence(input, missingCoreFields = []) {
  const rules_applied = [];
  const reasons = [];

  // Hard behavior: red flag → withhold + route to review (now with per-flag pathways).
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
        : ['A safety answer needs in-person review before any result is shown.']
    };
  }

  // Possible severe tear / avulsion signals → route to review, down-cap.
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
      rules_applied, reasons: ['Your answers suggest a higher-concern pattern that should be reviewed in person.']
    };
  }

  // Assessment completeness (from the real RF assessment, not inference).
  // Incomplete → withhold the match %; partial → hold it lower. Undefined =
  // legacy/direct callers → behave as before.
  const completeness = input.assessment_completeness;
  if (completeness === 'incomplete') {
    rules_applied.push('assessment_incomplete_withhold');
    return {
      withheld: true, route: 'incomplete', confidence_percent: null,
      confidence_label: 'Not shown — RF assessment incomplete', cap_applied: 0,
      limited_by_missing_inputs: true,
      rules_applied, reasons: ['Not enough RF assessment answers yet to estimate a pattern match. Answer the movement/strength checks to continue.']
    };
  }

  let score = 50;
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

  // ── Increasers: each is a recognised rectus-femoris localiser ──────────────
  if (ANTERIOR.includes(input.pain_location)) { score += 12; reasons.push('Pain located at the front of the thigh.'); rules_applied.push('increase_anterior_location'); }
  if (RF_MECHANISM.includes(input.mechanism)) { score += 12; reasons.push('Mechanism consistent with rectus femoris load.'); rules_applied.push('increase_rf_mechanism'); }
  // RF crosses BOTH hip and knee — resisted knee extension is the strongest quad/RF sign.
  if (PAINY.includes(input.knee_extension_response) || input.knee_extension_response === 'unable') { score += 8; reasons.push('Resisted knee extension reproduces symptoms (quadriceps/RF).'); rules_applied.push('increase_resisted_knee_extension'); }
  if (PAINY.includes(input.resisted_hip_flexion) || input.resisted_hip_flexion === 'weak') { score += 6; reasons.push('Resisted hip flexion reproduces symptoms (RF is a hip flexor).'); rules_applied.push('increase_resisted_hip_flexion'); }
  if (PAINY.includes(input.hip_flexion_response)) { score += 4; reasons.push('Hip-flexion movement reproduces front-thigh symptoms.'); rules_applied.push('increase_hip_flexion'); }
  if (input.knee_flexion_response === 'painful') { score += 4; reasons.push('Knee-flexion stretch reproduces front-thigh symptoms (RF stretch sign).'); rules_applied.push('increase_knee_flexion_stretch'); }
  if (['marked', 'mild', 'lump'].includes(st.palpation)) { score += 4; reasons.push('Tender to palpation at the front of the thigh (localises to RF).'); rules_applied.push('increase_palpation'); }
  if (['symptoms_during', 'symptoms_after'].includes(st.kick_tolerance)) { score += 4; reasons.push('Kicking reproduces symptoms (rectus-femoris-specific).'); rules_applied.push('increase_kicking'); }
  if (PAINY.includes(input.walking_response) || PAINY.includes(input.stairs_response)) { score += 4; reasons.push('Walking / stairs pattern consistent with anterior-thigh load.'); rules_applied.push('increase_walk_stairs'); }
  if (input.confidence_in_answers === 'confident') { score += 8; reasons.push('Answers were complete and consistent.'); rules_applied.push('increase_complete_consistent'); }

  // ── Reducers / caps: anything that makes RF less certain or the picture noisy ──
  if (input.pain_location === 'multiple_or_unsure' || input.pain_location == null) { score -= 10; caps.push(75); reasons.push('Pain location uncertain.'); rules_applied.push('reduce_uncertain_location'); }
  if (input.mechanism === 'unsure' || input.mechanism == null) { score -= 8; reasons.push('Mechanism unclear.'); rules_applied.push('reduce_unclear_mechanism'); }
  if (OVERLAP_LOCATION.includes(input.pain_location)) { score -= 8; caps.push(75); reasons.push('Pattern may overlap hip-flexor / adductor / knee.'); rules_applied.push('reduce_possible_overlap'); }
  if (input.previous_injury) { score -= 5; reasons.push('Previous/recurrent injury adds complexity.'); rules_applied.push('reduce_previous_injury'); }
  // Note: bruising/swelling is a SEVERITY signal, not a match signal — it does not lower match confidence.

  // Conflicting signals: anterior + RF mechanism but answers marked unsure, or overlap location with RF mechanism.
  const conflicting =
    (input.confidence_in_answers === 'unsure' && ANTERIOR.includes(input.pain_location)) ||
    (OVERLAP_LOCATION.includes(input.pain_location) && RF_MECHANISM.includes(input.mechanism));
  if (conflicting) { caps.push(CONFIDENCE_CAPS.CONFLICTING); rules_applied.push('cap_conflicting_signals'); reasons.push('Some answers conflict, so confidence is held lower.'); }

  // Missing data: 3+ missing core fields → cap ~50-60.
  if (missingCoreFields.length >= 3) { caps.push(CONFIDENCE_CAPS.MISSING_DATA); rules_applied.push('cap_missing_data'); reasons.push('Key answers are missing, so confidence is held lower.'); }

  const cap = Math.min(...caps, CONFIDENCE_CAPS.SELF_REPORT_ABSOLUTE_MAX);
  const confidence = Math.max(0, Math.min(Math.round(score), cap));

  return {
    withheld: false, route: null, confidence_percent: confidence,
    confidence_label: `${confidence}% match confidence (how well your answers match this pattern — not a diagnosis)`,
    cap_applied: cap, limited_by_missing_inputs, rules_applied, reasons
  };
}
