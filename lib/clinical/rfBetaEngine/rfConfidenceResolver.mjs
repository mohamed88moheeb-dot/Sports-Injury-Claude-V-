/**
 * lib/clinical/rfBetaEngine/rfConfidenceResolver.mjs
 * ---------------------------------------------------------------------------
 * Match-quality confidence (NOT diagnostic certainty, capacity, readiness, or
 * clearance). Implements Bayesian log-odds inference: prior × likelihood ratios
 * → posterior via sigmoid. Phase 1 of the Bayesian → RAG → LLM architecture.
 *
 * ALL 26 RF assessment signals are wired here. Each is applied only when the
 * answer is clearly present or absent; missing/unsure answers receive no update
 * (correct Bayesian treatment of missing data).
 *
 * Policy caps from §7a are unchanged:
 *   Normal high: 82%  |  Absolute max: 84%  |  Partial data: 65%
 *   Conflicting: 68%  |  Missing data (3+ fields): 58%
 *
 * LR sources: assessment_question_weights.json, injury_classification_dataset.json,
 * MASTER_DATA_SCIENCE_PLAN.md (PubMed sprint June 2026). Self-report calibration:
 * accuracy ceiling ~76% (Allott 2026, PMID 42315273), enforced by policy cap.
 * ---------------------------------------------------------------------------
 */

import { CONFIDENCE_CAPS } from './types.mjs';
import { hasRedFlag } from './rfAssessmentInput.mjs';

// ── Utility ────────────────────────────────────────────────────────────────
function logOdds(p) { return Math.log(p / (1 - p)); }
function sigmoid(lo) { return 1 / (1 + Math.exp(-lo)); }

// ── RF Prior ───────────────────────────────────────────────────────────────
// Rectus femoris strain base rate for anterior-thigh athletic presentations.
// Source: injury_priors.json (Ekstrand 2011, Woods 2004, Pietsch 2023).
const RF_PRIOR = 0.28;

// ── Likelihood Ratios ──────────────────────────────────────────────────────
// Calibrated for self-report (conservative; LR+ ≤ 3.5). Each applies only
// when the finding is clearly present or absent. Missing data = no update.
// Sources: assessment_question_weights.json, injury_classification_dataset.json.
const LR = Object.freeze({
  // ── Location ──────────────────────────────────────────────────────
  anterior_location:             3.5,  // anterior thigh → RF likely
  anterior_location_absent:      0.25, // non-anterior → RF unlikely
  uncertain_location:            0.30, // multiple/unsure
  overlap_location:              0.50, // hip-flexor / groin / knee overlap

  // ── Mechanism — each option individually calibrated ───────────────
  rf_mechanism:                  3.2,  // kicking / sprinting / acceleration = classic RF load
  mech_deceleration:             0.60, // hamstring-dominant but anterior load possible
  mech_gradual_overuse:          0.65, // RF overuse/tendinopathy exists — less specific than acute
  mech_direct_impact:            0.25, // contusion pattern, not a strain — strong RF negative
  rf_mechanism_absent:           0.50, // fallback for any other non-RF mechanism

  // ── Resisted knee extension — graded (strongest RF test, Giakoumis 2025) ──
  // Each answer option has its own LR; binary lumping loses diagnostic signal.
  rke_pain_and_weakness:         3.2,  // pain + clear weakness = most severe RF involvement
  rke_significant_pain:          2.8,  // significant pain, maintained some strength
  rke_mild_pain:                 2.0,  // mild pain, felt strong — RF involved but minor
  rke_weakness_only:             2.2,  // weakness without pain — neural inhibition concern
  resisted_knee_ext_negative:    0.35, // clearly no pain, full strength — strong RF negative

  // ── Resisted hip flexion — graded (RF as hip flexor, Giakoumis 2025) ───
  rhf_pain_and_weakness:         2.4,  // pain + weakness = most severe hip-flexor involvement
  rhf_significant_pain:          1.9,  // significant pain
  rhf_mild_pain:                 1.5,  // mild pain, still strong
  rhf_weakness_only:             1.8,  // weakness without pain
  resisted_hip_flex_negative:    0.70, // no pain, full strength

  // ── Ely's test (most RF-specific self-performable test) ───────────
  // Prone knee bend: pain in front thigh = RF involvement
  ely_anterior_pain:             2.8,  // anterior pain before heel to buttock
  ely_could_not_bend:            2.5,  // too painful to bend
  ely_tightness_only:            1.3,  // tightness without pain = weak positive
  ely_no_pain:                   0.30, // comfortable full range = RF negative

  // ── Pop or snap (Rudisill 2021: independently associated with delayed RTP) ──
  pop_yes:                       2.2,  // audible/felt pop = structural involvement
  pop_no:                        0.72,

  // ── Isometric hold ────────────────────────────────────────────────
  // Ability to sustain isometric quad contraction without pain
  iso_could_not:                 2.5,  // cannot hold = significant RF involvement
  iso_painful:                   1.8,  // holds but painful
  iso_brief:                     1.4,  // holds briefly
  iso_20plus:                    0.50, // holds 20+ sec comfortably = RF intact

  // ── Eccentric control ─────────────────────────────────────────────
  ecc_no:                        2.2,  // cannot control lowering = significant
  ecc_partial:                   1.5,
  ecc_yes:                       0.60, // full eccentric control = RF functioning

  // ── Palpation (Cross 2004: proximal deep = central tendon, 26.9 vs 9.2 days) ─
  palp_proximal_deep:            2.8,  // deep near hip crease = proximal tendon
  palp_gap_defect:               3.0,  // palpable gap = structural disruption
  palp_deep:                     2.2,  // deep tenderness in muscle belly
  palp_marked_surface:           1.8,
  palp_mild_surface:             1.4,
  palp_none:                     0.50, // no tenderness at all

  // ── Hip flexion range (passive/active movement) ───────────────────
  hip_flexion_positive:          1.6,
  hip_flexion_negative:          0.82,

  // ── Knee flexion stretch (Thomas-like) ───────────────────────────
  knee_flexion_stretch_positive: 1.7,  // pain = RF stretch sign
  knee_flexion_stretch_mild:     1.35, // mild discomfort = weak positive
  knee_flexion_stretch_negative: 0.84,

  // ── Functional loading tolerance ──────────────────────────────────
  walk_stairs_positive:          1.4,
  walk_stairs_negative:          0.88,

  // ── Kicking reproduces symptoms ───────────────────────────────────
  kicking_positive:              1.7,
  kicking_negative:              0.80,

  // ── Jogging / running reproduces symptoms ─────────────────────────
  jog_significant:               1.6,
  jog_worse_after:               1.5,
  jog_mild:                      1.2,
  jog_ok:                        0.75, // asymptomatic jogging = less severe

  // ── Ability to continue immediately after injury ──────────────────
  // McAuley 2021: removal from activity = +11 days TRFT (p<0.001)
  atc_finished_normally:         0.65, // played on = injury unlikely to be severe
  atc_continued_briefly:         1.2,
  atc_stopped_immediately:       1.8,
  atc_assisted_off:              2.5,
  atc_could_not_bear_weight:     2.8,

  // ── Bruising timing + absence ──────────────────────────────────────────────
  bruising_within_2h_significant: 2.5,  // immediate significant bruising = structural disruption
  bruising_within_2h_some:        1.8,
  bruising_delayed:               1.2,
  bruising_significant_unknown:   1.6,  // significant bruising, timing not answered — still positive
  bruising_some_unknown:          1.2,  // some bruising, timing unknown
  bruising_absent:                0.88, // no bruising = mild reassurance against major disruption

  // ── Age group — avulsion concern (Knapik 2023: under 20 + kicking + proximal) ──
  age_under_20_kicking:          1.5,  // growth plate / avulsion risk modifier

  // ── Previous injury (Green 2020: RR = 2.7–4.8 for recurrence) ───
  // Previous injury to the same area = RF is the structural weak link → positive update.
  // 0.88 was clinically backward; corrected to 1.20.
  previous_injury:               1.20,
  prev_detail_multiple:          1.30, // multiple recurrences = clear recurrence pattern
  prev_detail_incomplete:        1.18, // never fully recovered = ongoing structural issue

  // ── Scar / fibrosis (structural remodelling = ongoing RF pathology) ────
  scar_reported:                 1.15,

  // ── Sprint tolerance (max RF eccentric load — high-speed running) ─────
  sprint_significant:            1.8,
  sprint_worse_after:            1.4,
  sprint_mild:                   1.2,
  sprint_ok:                     0.65, // symptom-free sprinting = RF largely intact

  // ── Single leg control (functional load on isolated limb) ────────────
  sl_cannot:                     1.8,  // can't balance = significant weakness/pain
  sl_difficult:                  1.5,
  sl_painful:                    1.3,
  sl_pain_free:                  0.65, // pain-free single leg = RF functioning

  // ── Rest pain ─────────────────────────────────────────────────────────
  rest_pain_constant:            1.5,  // constant/severe rest pain = high concern
  rest_pain_moderate:            1.2,
  rest_pain_mild:                1.0,  // neutral — mild ache common with any strain
  rest_pain_none:                0.82, // absent rest pain slightly reassuring

  // ── Kicking — mild & worse-after (previously unhandled) ──────────────
  kicking_mild:                  1.2,
  kicking_worse_after:           1.3,

  // ── Movement confidence (perceived loading readiness) ─────────────────
  movement_low_confidence:       1.10, // reluctance to load = aligns with significant injury
  movement_high_confidence:      0.90,

  // ── Pain severity (non-gating) — moderate/mild still inform probability ──
  pain_severity_moderate:        1.30, // moderate pain = more significant RF involvement
  pain_severity_mild:            0.85, // mild pain = RF consistent but minor presentation

  // ── Next day response / irritability (Giakoumis 2025 irritability concept) ─
  next_day_much_worse:           1.35, // high irritability = significant injury pattern
  next_day_worse:                1.15,
  next_day_sore_settled:         1.05, // minor irritability — barely moves posterior
  next_day_same_better:          0.88, // same/improving = milder or resolving

  // ── Sport level × mechanism (Santos 2021: all free tendon injuries in professionals) ─
  sport_professional_kicking:    1.25, // professional + kicking = highest proximal RF risk
  sport_recreational_nonforceful:0.88, // recreational + non-kicking = lower-load pattern

  // ── Answer confidence ─────────────────────────────────────────────────
  confident_consistent:          1.30,
  answers_unsure:                0.80,
});

// ── Red-flag routing ───────────────────────────────────────────────────────
const RED_FLAG_PATHWAYS = [
  { test: /calf|warmth|redness|shortness|breath/,        category: 'vascular_dvt_pe',               message: 'Calf swelling, warmth, or breathlessness needs urgent medical review (possible blood clot).' },
  { test: /numb|tingl|radiat|travels?|nerve/,            category: 'neuro',                         message: 'Numbness, tingling, or pain travelling down the leg needs neurological review.' },
  { test: /groin|abdominal|bulge|testicular|cough|sneez/,category: 'hernia_referral',               message: 'A groin or abdominal bulge needs medical assessment (possible hernia).' },
  { test: /bear[_ ]?weight|walk[_ ]?four|cannot[_ ]?walk/,category: 'weightbearing_fracture_screen',message: 'Difficulty bearing weight needs in-person assessment to rule out a fracture.' },
  { test: /pop|unstable|loss[_ ]?of[_ ]?function/,       category: 'structural_rupture',            message: 'A major pop with instability or loss of function needs urgent review.' },
  { test: /lock|catch|gives?[_ ]?way|straighten/,        category: 'mechanical_knee',               message: 'Locking, catching, or giving way needs a knee assessment.' },
  { test: /deformity|large[_ ]?bruise|severe[_ ]?swelling|swelling|bruise/, category: 'severe_structural', message: 'Rapid swelling, deformity, or a large bruise needs urgent review.' },
  { test: /night|fever|unwell|constant/,                 category: 'systemic',                      message: 'Constant or night pain, or feeling feverish/unwell, needs medical review.' },
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

// ── Location / mechanism constants (used by index.mjs) ────────────────────
const ANTERIOR       = ['anterior_thigh_rectus_femoris', 'front_thigh_general'];
const RF_MECHANISM   = ['sprinting', 'kicking', 'acceleration'];
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

  // ── Red flag → withhold + route ───────────────────────────────────────────
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

  // ── Severe signals → route to review ──────────────────────────────────────
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

  // ── Assessment completeness ────────────────────────────────────────────────
  const completeness = input.assessment_completeness;
  if (completeness === 'incomplete') {
    rules_applied.push('assessment_incomplete_withhold');
    return {
      withheld: true, route: 'incomplete', confidence_percent: null,
      confidence_label: 'Not shown — RF assessment incomplete', cap_applied: 0,
      limited_by_missing_inputs: true,
      rules_applied, reasons: ['Not enough RF assessment answers yet. Complete the movement and strength checks to continue.'],
    };
  }

  // ── Bayesian log-odds chain ────────────────────────────────────────────────
  let lo = logOdds(RF_PRIOR); // −0.944 — RF prior in log-odds space
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

  // ── 1. Pain location ───────────────────────────────────────────────────────
  if (ANTERIOR.includes(input.pain_location)) {
    lo += Math.log(LR.anterior_location);
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
    lo += Math.log(LR.anterior_location_absent);
    reasons.push('Pain not at the front of the thigh.');
    rules_applied.push('bayes_non_anterior−');
  }

  // ── 2. Mechanism — each value individually calibrated ─────────────────────
  // Direct impact is a contusion pattern (not a strain) — strong negative.
  // Gradual overuse is less specific than acute sprint/kick. Deceleration is more
  // hamstring-dominant but can load RF eccentrically.
  const mechVal = input.mechanism;
  if (RF_MECHANISM.includes(mechVal)) {
    lo += Math.log(LR.rf_mechanism);
    reasons.push('Mechanism consistent with rectus femoris load (kicking / sprinting / acceleration).');
    rules_applied.push('bayes_rf_mechanism+');
  } else if (mechVal === 'direct_impact') {
    lo += Math.log(LR.mech_direct_impact);
    reasons.push('Direct impact mechanism — contusion pattern, not a strain (strong RF negative).');
    rules_applied.push('bayes_mech_direct_impact−');
  } else if (mechVal === 'gradual_overuse') {
    lo += Math.log(LR.mech_gradual_overuse);
    reasons.push('Gradual / overuse mechanism — RF overuse is possible but less acute strain pattern.');
    rules_applied.push('bayes_mech_overuse−');
  } else if (mechVal === 'deceleration') {
    lo += Math.log(LR.mech_deceleration);
    reasons.push('Deceleration — more hamstring-dominant, but anterior eccentric RF load possible.');
    rules_applied.push('bayes_mech_deceleration−');
  } else if (mechVal && mechVal !== 'unsure') {
    lo += Math.log(LR.rf_mechanism_absent);
    reasons.push('Mechanism not typical for rectus femoris.');
    rules_applied.push('bayes_mechanism_non_rf−');
  }

  // ── 3. Ability to continue immediately after injury ────────────────────────
  // McAuley 2021: removal from activity = strongest single RTP predictor
  const atc = st.ability_to_continue_after;
  if (atc) {
    const atcLR = {
      finished_normally:     LR.atc_finished_normally,
      continued_briefly:     LR.atc_continued_briefly,
      stopped_immediately:   LR.atc_stopped_immediately,
      assisted_off:          LR.atc_assisted_off,
      could_not_bear_weight: LR.atc_could_not_bear_weight,
    };
    if (atcLR[atc]) {
      lo += Math.log(atcLR[atc]);
      if (atc === 'finished_normally') reasons.push('Continued activity normally after the injury.');
      else if (atc === 'stopped_immediately') reasons.push('Had to stop immediately — significant impact.');
      else if (atc === 'assisted_off' || atc === 'could_not_bear_weight') reasons.push('Could not continue or bear weight — high-concern signal.');
      rules_applied.push(`bayes_atc_${atc}`);
    }
  }

  // ── 4. Pop or snap (Rudisill 2021) ────────────────────────────────────────
  const pop = st.pop_or_snap;
  if (pop === 'yes') {
    lo += Math.log(LR.pop_yes);
    reasons.push('Felt or heard a pop/snap at the moment of injury.');
    rules_applied.push('bayes_pop+');
  } else if (pop === 'no') {
    lo += Math.log(LR.pop_no);
    rules_applied.push('bayes_pop−');
  }

  // ── 5. Resisted knee extension — graded by response severity ─────────────
  // Strongest RF test (Giakoumis 2025: p=0.01). Each answer option has its own
  // LR — binary lumping loses clinical signal. Raw values from rf_self_tests
  // take priority; translated enum from input is the fallback.
  const rkeRaw = st.knee_extension_raw || input.knee_extension_response;
  if (rkeRaw === 'pain_and_weakness' || rkeRaw === 'unable') {
    lo += Math.log(LR.rke_pain_and_weakness);
    reasons.push('Resisted knee extension: pain with clear weakness — most significant RF signal.');
    rules_applied.push('bayes_rke_pain_weakness+');
  } else if (rkeRaw === 'significant_pain' || rkeRaw === 'painful') {
    lo += Math.log(LR.rke_significant_pain);
    reasons.push('Resisted knee extension reproduces significant symptoms.');
    rules_applied.push('bayes_rke_significant+');
  } else if (rkeRaw === 'mild_pain_strong' || rkeRaw === 'mild') {
    lo += Math.log(LR.rke_mild_pain);
    reasons.push('Resisted knee extension: mild pain, maintained strength — RF involved, minor grade.');
    rules_applied.push('bayes_rke_mild+');
  } else if (rkeRaw === 'weakness_no_pain' || rkeRaw === 'weak') {
    lo += Math.log(LR.rke_weakness_only);
    reasons.push('Resisted knee extension: weakness without pain — neural inhibition or significant injury.');
    rules_applied.push('bayes_rke_weak+');
  } else if (rkeRaw === 'no_pain' || rkeRaw === 'no' || rkeRaw === 'none') {
    lo += Math.log(LR.resisted_knee_ext_negative);
    reasons.push('Resisted knee extension: pain-free and full strength — strong RF negative sign.');
    rules_applied.push('bayes_rke_negative−');
  }

  // ── 6. Resisted hip flexion — graded ──────────────────────────────────────
  // RF is a primary hip flexor (Knapik 2023). Each answer option graded individually.
  const rhfRaw = st.resisted_hip_flex_raw || input.resisted_hip_flexion;
  if (rhfRaw === 'pain_and_weakness') {
    lo += Math.log(LR.rhf_pain_and_weakness);
    reasons.push('Resisted hip flexion: pain with weakness — RF and hip-flexor complex affected.');
    rules_applied.push('bayes_rhf_pain_weakness+');
  } else if (rhfRaw === 'significant_pain' || rhfRaw === 'painful') {
    lo += Math.log(LR.rhf_significant_pain);
    reasons.push('Resisted hip flexion reproduces symptoms (RF hip-flexor function).');
    rules_applied.push('bayes_rhf_significant+');
  } else if (rhfRaw === 'mild_pain_strong' || rhfRaw === 'mild') {
    lo += Math.log(LR.rhf_mild_pain);
    reasons.push('Resisted hip flexion: mild pain, maintained strength.');
    rules_applied.push('bayes_rhf_mild+');
  } else if (rhfRaw === 'weakness_no_pain' || rhfRaw === 'weak') {
    lo += Math.log(LR.rhf_weakness_only);
    reasons.push('Resisted hip flexion: weakness without pain — neural concern.');
    rules_applied.push('bayes_rhf_weak+');
  } else if (rhfRaw === 'no_pain' || rhfRaw === 'no' || rhfRaw === 'none') {
    lo += Math.log(LR.resisted_hip_flex_negative);
    reasons.push('Resisted hip flexion: pain-free and strong — hip-flexor function preserved.');
    rules_applied.push('bayes_rhf_negative−');
  }

  // ── 7. Ely's test — most specific RF self-test ────────────────────────────
  const ely = st.ely_test;
  if (ely === 'anterior_pain') {
    lo += Math.log(LR.ely_anterior_pain);
    reasons.push("Ely's test positive — pain in front of thigh (RF-specific).");
    rules_applied.push('bayes_ely_anterior_pain+');
  } else if (ely === 'could_not_bend') {
    lo += Math.log(LR.ely_could_not_bend);
    reasons.push("Could not complete Ely's test — too painful.");
    rules_applied.push('bayes_ely_could_not_bend+');
  } else if (ely === 'tightness_only') {
    lo += Math.log(LR.ely_tightness_only);
    rules_applied.push('bayes_ely_tightness+');
  } else if (ely === 'no_pain') {
    lo += Math.log(LR.ely_no_pain);
    reasons.push("Ely's test negative — full range, no pain (RF negative sign).");
    rules_applied.push('bayes_ely_no_pain−');
  }

  // ── 8. Isometric hold (quad contraction sustained) ────────────────────────
  const iso = st.isometric_hold;
  if (iso === 'could_not') {
    lo += Math.log(LR.iso_could_not);
    reasons.push('Could not sustain isometric quad contraction — significant RF involvement.');
    rules_applied.push('bayes_iso_could_not+');
  } else if (iso === 'yes_but_painful') {
    lo += Math.log(LR.iso_painful);
    reasons.push('Isometric hold painful — RF under load.');
    rules_applied.push('bayes_iso_painful+');
  } else if (iso === 'held_briefly') {
    lo += Math.log(LR.iso_brief);
    rules_applied.push('bayes_iso_brief+');
  } else if (iso === 'yes_20plus_sec') {
    lo += Math.log(LR.iso_20plus);
    reasons.push('Held isometric contraction comfortably 20+ seconds — RF largely intact.');
    rules_applied.push('bayes_iso_20plus−');
  }

  // ── 9. Eccentric control (slow lowering under quad load) ──────────────────
  const ecc = st.eccentric_control;
  if (ecc === 'no') {
    lo += Math.log(LR.ecc_no);
    reasons.push('Unable to control eccentric lowering — significant RF weakness.');
    rules_applied.push('bayes_ecc_no+');
  } else if (ecc === 'partial') {
    lo += Math.log(LR.ecc_partial);
    rules_applied.push('bayes_ecc_partial+');
  } else if (ecc === 'yes') {
    lo += Math.log(LR.ecc_yes);
    rules_applied.push('bayes_ecc_yes−');
  }

  // ── 10. Palpation (Cross 2004: proximal deep = central tendon suspect) ─────
  const palp = st.palpation;
  if (palp === 'gap_or_defect') {
    lo += Math.log(LR.palp_gap_defect);
    reasons.push('Palpable gap or dip in the muscle — structural disruption sign.');
    rules_applied.push('bayes_palp_gap+');
  } else if (palp === 'proximal_deep') {
    lo += Math.log(LR.palp_proximal_deep);
    reasons.push('Deep tenderness near hip crease — proximal/central tendon involvement.');
    rules_applied.push('bayes_palp_proximal+');
  } else if (palp === 'deep_tenderness') {
    lo += Math.log(LR.palp_deep);
    reasons.push('Deep tenderness within the muscle belly.');
    rules_applied.push('bayes_palp_deep+');
  } else if (palp === 'marked_surface') {
    lo += Math.log(LR.palp_marked_surface);
    reasons.push('Marked surface tenderness on palpation.');
    rules_applied.push('bayes_palp_marked+');
  } else if (palp === 'mild_surface') {
    lo += Math.log(LR.palp_mild_surface);
    rules_applied.push('bayes_palp_mild+');
  } else if (palp === 'none') {
    lo += Math.log(LR.palp_none);
    rules_applied.push('bayes_palp_none−');
  }

  // ── 11. Bruising timing ────────────────────────────────────────────────────
  const bruise = input.bruising_or_swelling;
  const bruiseTiming = st.bruising_timing;
  if (bruise === 'significant' && bruiseTiming === 'within_2h') {
    lo += Math.log(LR.bruising_within_2h_significant);
    reasons.push('Significant bruising within 2 hours — structural disruption sign.');
    rules_applied.push('bayes_bruising_2h_significant+');
  } else if (bruise === 'some' && bruiseTiming === 'within_2h') {
    lo += Math.log(LR.bruising_within_2h_some);
    reasons.push('Early bruising (within 2 hours).');
    rules_applied.push('bayes_bruising_2h_some+');
  } else if (bruiseTiming && bruiseTiming !== 'unsure' && bruiseTiming !== 'within_2h') {
    lo += Math.log(LR.bruising_delayed);
    rules_applied.push('bayes_bruising_delayed');
  } else if (bruise === 'significant') {
    // Significant bruising present but timing not specified — still a positive signal.
    lo += Math.log(LR.bruising_significant_unknown);
    reasons.push('Significant bruising reported (timing not specified).');
    rules_applied.push('bayes_bruising_significant_unknown+');
  } else if (bruise === 'some') {
    lo += Math.log(LR.bruising_some_unknown);
    rules_applied.push('bayes_bruising_some_unknown+');
  } else if (bruise === 'none') {
    // Absence of bruising = mild reassurance against major vascular/structural disruption.
    lo += Math.log(LR.bruising_absent);
    rules_applied.push('bayes_bruising_none−');
  }

  // ── 12. Hip flexion movement response ─────────────────────────────────────
  if (PAINY.includes(input.hip_flexion_response)) {
    lo += Math.log(LR.hip_flexion_positive);
    reasons.push('Hip-flexion movement reproduces front-thigh symptoms.');
    rules_applied.push('bayes_hip_flexion+');
  } else if (input.hip_flexion_response === 'none') {
    lo += Math.log(LR.hip_flexion_negative);
    rules_applied.push('bayes_hip_flexion−');
  }

  // ── 13. Knee flexion stretch (Thomas-like stretch sign) ───────────────────
  if (input.knee_flexion_response === 'painful') {
    lo += Math.log(LR.knee_flexion_stretch_positive);
    reasons.push('Knee-flexion stretch reproduces front-thigh symptoms (RF stretch sign).');
    rules_applied.push('bayes_knee_flex_stretch+');
  } else if (input.knee_flexion_response === 'mild') {
    lo += Math.log(LR.knee_flexion_stretch_mild);
    reasons.push('Mild discomfort on knee-flexion stretch — weak RF stretch sign.');
    rules_applied.push('bayes_knee_flex_mild+');
  } else if (input.knee_flexion_response === 'none') {
    lo += Math.log(LR.knee_flexion_stretch_negative);
    rules_applied.push('bayes_knee_flex_stretch−');
  }

  // ── 14. Walking / stairs load ──────────────────────────────────────────────
  if (PAINY.includes(input.walking_response) || PAINY.includes(input.stairs_response)) {
    lo += Math.log(LR.walk_stairs_positive);
    reasons.push('Walking / stairs pattern consistent with anterior-thigh load.');
    rules_applied.push('bayes_walk_stairs+');
  } else if (input.walking_response === 'none' && input.stairs_response === 'none') {
    lo += Math.log(LR.walk_stairs_negative);
    rules_applied.push('bayes_walk_stairs−');
  }

  // ── 15. Kicking tolerance ──────────────────────────────────────────────────
  // Bug fix: 'symptoms_during' was a ghost value (never in options). Full range now handled.
  const kick = st.kick_tolerance;
  if (kick === 'significant_during') {
    lo += Math.log(LR.kicking_positive);
    reasons.push('Kicking reproduced significant symptoms (RF-specific loading).');
    rules_applied.push('bayes_kicking_significant+');
  } else if (kick === 'mild_during') {
    lo += Math.log(LR.kicking_mild);
    reasons.push('Kicking reproduced mild symptoms.');
    rules_applied.push('bayes_kicking_mild+');
  } else if (kick === 'worse_after') {
    lo += Math.log(LR.kicking_worse_after);
    reasons.push('Symptom flare after kicking.');
    rules_applied.push('bayes_kicking_worse_after+');
  } else if (kick === 'ok') {
    lo += Math.log(LR.kicking_negative);
    reasons.push('Kicking symptom-free — RF largely tolerating load.');
    rules_applied.push('bayes_kicking−');
  }

  // ── 16. Jogging / running tolerance ───────────────────────────────────────
  // Bug fix: 'not_tried' is truthy in JS, so jog_tolerance of 'not_tried' was blocking
  // run_tolerance from being read. Now filtered explicitly.
  const jogVal = (st.jog_tolerance && st.jog_tolerance !== 'not_tried') ? st.jog_tolerance : null;
  const runVal = (st.run_tolerance && st.run_tolerance !== 'not_tried') ? st.run_tolerance : null;
  const jog = jogVal || runVal;
  if (jog === 'significant_during') {
    lo += Math.log(LR.jog_significant);
    reasons.push('Running reproduced significant symptoms.');
    rules_applied.push('bayes_jog_significant+');
  } else if (jog === 'worse_after') {
    lo += Math.log(LR.jog_worse_after);
    reasons.push('Symptom flare after running.');
    rules_applied.push('bayes_jog_worse_after+');
  } else if (jog === 'mild_during') {
    lo += Math.log(LR.jog_mild);
    rules_applied.push('bayes_jog_mild+');
  } else if (jog === 'ok') {
    lo += Math.log(LR.jog_ok);
    reasons.push('Jogging symptom-free — RF largely tolerating load.');
    rules_applied.push('bayes_jog_ok−');
  }

  // ── 17. Sprint tolerance (maximal RF eccentric load) ─────────────────────
  // Previously uncollected in the engine. Sprint = max velocity loading of RF as
  // hip flexor + knee extensor simultaneously — most provocative functional test.
  const sprint = (st.sprint_tolerance && st.sprint_tolerance !== 'not_tried') ? st.sprint_tolerance : null;
  if (sprint === 'significant_during') {
    lo += Math.log(LR.sprint_significant);
    reasons.push('High-speed running reproduced significant symptoms — maximal RF load.');
    rules_applied.push('bayes_sprint_significant+');
  } else if (sprint === 'worse_after') {
    lo += Math.log(LR.sprint_worse_after);
    reasons.push('Symptom flare after sprinting.');
    rules_applied.push('bayes_sprint_worse_after+');
  } else if (sprint === 'mild_during') {
    lo += Math.log(LR.sprint_mild);
    rules_applied.push('bayes_sprint_mild+');
  } else if (sprint === 'ok') {
    lo += Math.log(LR.sprint_ok);
    reasons.push('High-speed running symptom-free — RF intact under maximal load.');
    rules_applied.push('bayes_sprint_ok−');
  }

  // ── 18. Single leg control ────────────────────────────────────────────────
  // Previously uncollected in the engine. Single leg stance = isolated RF under
  // gravity load. Inability = significant RF pain/weakness signal.
  const sl = st.single_leg_control;
  if (sl === 'cannot') {
    lo += Math.log(LR.sl_cannot);
    reasons.push('Unable to stand single leg — significant functional loss.');
    rules_applied.push('bayes_sl_cannot+');
  } else if (sl === 'difficult') {
    lo += Math.log(LR.sl_difficult);
    rules_applied.push('bayes_sl_difficult+');
  } else if (sl === 'yes_but_painful') {
    lo += Math.log(LR.sl_painful);
    rules_applied.push('bayes_sl_painful+');
  } else if (sl === 'yes_pain_free') {
    lo += Math.log(LR.sl_pain_free);
    reasons.push('Single leg balance pain-free — RF functioning under gravity load.');
    rules_applied.push('bayes_sl_pain_free−');
  }

  // ── 19. Rest pain ─────────────────────────────────────────────────────────
  // Previously uncollected in the engine. Rest pain differentiates severity band
  // and helps rule out non-musculoskeletal pathology (constant night pain = red flag).
  const restPain = st.pain_at_rest;
  if (restPain === 'constant') {
    lo += Math.log(LR.rest_pain_constant);
    reasons.push('Constant pain at rest — elevated concern for severity or differential.');
    rules_applied.push('bayes_rest_pain_constant+');
  } else if (restPain === 'moderate') {
    lo += Math.log(LR.rest_pain_moderate);
    rules_applied.push('bayes_rest_pain_moderate+');
  } else if (restPain === 'mild') {
    lo += Math.log(LR.rest_pain_mild);
    rules_applied.push('bayes_rest_pain_mild');
  } else if (restPain === 'none') {
    lo += Math.log(LR.rest_pain_none);
    rules_applied.push('bayes_rest_pain_none−');
  }

  // ── 20. Age group — avulsion modifier (Knapik 2023) ──────────────────────
  const ageGroup = st.age_group;
  const mech = input.mechanism;
  if (ageGroup === 'under_20' && RF_MECHANISM.includes(mech)) {
    lo += Math.log(LR.age_under_20_kicking);
    reasons.push('Under 20 with high-load mechanism — avulsion risk noted.');
    rules_applied.push('bayes_age_under20_rf_mech+');
  }

  // ── 21. Previous injury (detail-aware) ────────────────────────────────────
  // Green 2020 meta-analysis: previous injury RR = 2.7–4.8 for recurrence.
  // Previous injury to the same area = RF is the structural weak link → positive update.
  // Detail granularity: multiple recurrences or incomplete recovery = stronger signal.
  const prevDetail = st.previous_injury_detail;
  if (prevDetail === 'yes_multiple_times') {
    lo += Math.log(LR.prev_detail_multiple);
    reasons.push('Multiple previous injuries to this area — clear recurrence pattern.');
    rules_applied.push('bayes_prev_multiple+');
  } else if (prevDetail === 'yes_incomplete_recovery') {
    lo += Math.log(LR.prev_detail_incomplete);
    reasons.push('Previous injury never fully recovered — ongoing structural vulnerability.');
    rules_applied.push('bayes_prev_incomplete+');
  } else if (input.previous_injury) {
    // Boolean fallback when detail not provided
    lo += Math.log(LR.previous_injury);
    reasons.push('Previous injury to this area — RF is the structural weak link.');
    rules_applied.push('bayes_previous_injury+');
  }

  // ── 22. Scar / fibrosis history ───────────────────────────────────────────
  // Fibrosis or scar tissue = evidence of prior structural disruption to the RF.
  // Adapter maps scar_history + palpation lump → input.reported_fibrosis_or_scar_history.
  if (input.reported_fibrosis_or_scar_history === 'reported') {
    lo += Math.log(LR.scar_reported);
    reasons.push('Reported scar tissue or fibrosis — prior structural change to the RF.');
    rules_applied.push('bayes_scar+');
  }

  // ── 23. Movement confidence (perceived loading readiness) ─────────────────
  // Low confidence when loaded = consistent with significant RF injury perception.
  // This is a weak indirect signal and carries conservative LRs.
  const movConf = st.movement_confidence;
  if (movConf === 'low') {
    lo += Math.log(LR.movement_low_confidence);
    rules_applied.push('bayes_movement_conf_low+');
  } else if (movConf === 'high') {
    lo += Math.log(LR.movement_high_confidence);
    rules_applied.push('bayes_movement_conf_high−');
  }

  // ── 24. Confidence in own answers ─────────────────────────────────────────
  if (input.confidence_in_answers === 'confident') {
    lo += Math.log(LR.confident_consistent);
    reasons.push('Answers were complete and consistent.');
    rules_applied.push('bayes_confident+');
  } else if (input.confidence_in_answers === 'unsure') {
    lo += Math.log(LR.answers_unsure);
    rules_applied.push('bayes_answers_unsure−');
  }

  // ── 25. Pain severity level (non-gating) ──────────────────────────────────
  // Severe is handled by the gate above. Moderate and mild still shift probability.
  // A patient in moderate pain from a front-thigh mechanism is more likely to have
  // significant RF involvement than one in mild pain.
  const sev = input.pain_severity_label;
  if (sev === 'moderate') {
    lo += Math.log(LR.pain_severity_moderate);
    reasons.push('Moderate pain level consistent with significant RF involvement.');
    rules_applied.push('bayes_pain_moderate+');
  } else if (sev === 'mild') {
    lo += Math.log(LR.pain_severity_mild);
    rules_applied.push('bayes_pain_mild−');
  }

  // ── 26. Next day response / irritability ───────────────────────────────────
  // Post-activity irritability is a validated clinical indicator of injury significance.
  // High irritability = more significant strain; improving = milder or resolving.
  // Giakoumis 2025: post-activity symptom response correlates with TRFT.
  const nextDay = input.next_day_response;
  if (nextDay === 'much_worse') {
    lo += Math.log(LR.next_day_much_worse);
    reasons.push('Significantly worse the next day — high-irritability pattern, more significant injury.');
    rules_applied.push('bayes_nextday_much_worse+');
  } else if (nextDay === 'worse') {
    lo += Math.log(LR.next_day_worse);
    reasons.push('Worse the next day after activity — elevated irritability.');
    rules_applied.push('bayes_nextday_worse+');
  } else if (nextDay === 'sore_settled') {
    lo += Math.log(LR.next_day_sore_settled);
    rules_applied.push('bayes_nextday_sore_settled');
  } else if (nextDay === 'same_or_better') {
    lo += Math.log(LR.next_day_same_better);
    reasons.push('Same or better after activity — reassuring response, milder presentation.');
    rules_applied.push('bayes_nextday_same_better−');
  }

  // ── 27. Sport level × mechanism ────────────────────────────────────────────
  // Santos 2021: ALL free-tendon RF injuries occurred in professionals during kicking.
  // Recreational non-kicking = lower-load injury context, lower severity ceiling.
  const sportLvl = st.sport_level;
  if (sportLvl === 'professional' && mech === 'kicking') {
    lo += Math.log(LR.sport_professional_kicking);
    reasons.push('Professional athlete + kicking mechanism — highest proximal RF risk profile (Santos 2021).');
    rules_applied.push('bayes_sport_professional_kick+');
  } else if (sportLvl === 'recreational' && !RF_MECHANISM.includes(mech)) {
    lo += Math.log(LR.sport_recreational_nonforceful);
    rules_applied.push('bayes_sport_recreational−');
  }

  // ── Conflicting signals cap ────────────────────────────────────────────────
  const conflicting =
    (input.confidence_in_answers === 'unsure' && ANTERIOR.includes(input.pain_location)) ||
    (OVERLAP_LOCATION.includes(input.pain_location) && RF_MECHANISM.includes(input.mechanism));
  if (conflicting) {
    caps.push(CONFIDENCE_CAPS.CONFLICTING);
    rules_applied.push('cap_conflicting_signals');
    reasons.push('Some answers conflict — confidence held lower.');
  }

  // ── Missing core fields cap ────────────────────────────────────────────────
  if (missingCoreFields.length >= 3) {
    caps.push(CONFIDENCE_CAPS.MISSING_DATA);
    rules_applied.push('cap_missing_data');
    reasons.push('Key answers are missing — confidence held lower.');
  }

  // ── Convert posterior to percentage ───────────────────────────────────────
  const posterior = sigmoid(lo);
  const rawScore = Math.round(posterior * 100);
  const cap = Math.min(...caps, CONFIDENCE_CAPS.SELF_REPORT_ABSOLUTE_MAX);
  const confidence = Math.max(0, Math.min(rawScore, cap));

  return {
    withheld: false, route: null, confidence_percent: confidence,
    confidence_label: `${confidence}% match confidence (how well your answers match this pattern — not a diagnosis)`,
    cap_applied: cap, limited_by_missing_inputs, rules_applied, reasons,
    bayesian_posterior_raw: Math.round(posterior * 1000) / 10,
  };
}
