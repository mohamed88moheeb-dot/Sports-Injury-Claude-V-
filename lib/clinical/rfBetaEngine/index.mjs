/**
 * lib/clinical/rfBetaEngine/index.mjs
 * ---------------------------------------------------------------------------
 * RF Beta Engine orchestrator. Composes the full structured beta output from
 * RF assessment answers:
 *   pattern → confidence → severity → recovery → plan(phases/days/sessions)
 *   → beta dosage → cards → alternatives → withheld items → governance trace.
 *
 * BETA SCOPE ONLY. Non-executable production authority. No UI, no runtime wiring,
 * no clearance. runRfBeta is a pure function over its input + governed knowledge.
 * ---------------------------------------------------------------------------
 */

import { makeAssessmentInput } from './rfAssessmentInput.mjs';
import { resolveConfidence } from './rfConfidenceResolver.mjs';
import { resolveSeverity } from './rfSeverityResolver.mjs';
import { resolveRecovery } from './rfRecoveryResolver.mjs';
import { generatePlan } from './rfPlanGenerator.mjs';
import { adjustToday } from './rfDailyCheckInAdjuster.mjs';
import { buildGovernanceTrace } from './rfGovernanceTrace.mjs';

const ANTERIOR = ['anterior_thigh_rectus_femoris', 'front_thigh_general'];
const OVERLAP = ['upper_thigh_hip_flexor', 'knee_region', 'groin_adductor'];

function derivePattern(input, severity) {
  if (severity.functional_severity_band === 'high_concern_or_review_gated') {
    return { pattern_id: 'possible_higher_grade_quad_injury', pattern_name: 'Possible higher-grade anterior-thigh injury', note: 'Pattern suggested only; needs review.' };
  }
  if (input.pain_location === 'upper_thigh_hip_flexor') {
    return { pattern_id: 'hip_flexor_rectus_femoris_overlap', pattern_name: 'Hip-flexor / rectus femoris overlap (upper thigh)', note: 'Upper anterior thigh / hip-flexor crossover.' };
  }
  if (ANTERIOR.includes(input.pain_location) || ['sprinting', 'kicking'].includes(input.mechanism)) {
    return { pattern_id: 'rectus_femoris_strain', pattern_name: 'Rectus femoris strain pattern', note: 'Front-centre thigh; common with sprinting/kicking. Suggested, not confirmed.' };
  }
  return { pattern_id: 'anterior_thigh_pattern_unclear', pattern_name: 'Anterior-thigh pattern (unclear)', note: 'Location/mechanism not specific enough to suggest a single pattern.' };
}

/**
 * @param {object} rawInput raw RF assessment answers
 * @returns {object} complete structured beta output (see README)
 */
export function runRfBeta(rawInput) {
  const { input, missingCoreFields } = makeAssessmentInput(rawInput);
  // makeAssessmentInput keeps only known fields; carry RF-assessment completeness
  // (and self-tests) through so the resolver and output can use them.
  if (rawInput && rawInput.assessment_completeness) input.assessment_completeness = rawInput.assessment_completeness;
  if (rawInput && rawInput.missing_rf_items) input.missing_rf_items = rawInput.missing_rf_items;
  if (rawInput && rawInput.rf_self_tests) input.rf_self_tests = rawInput.rf_self_tests;

  const confidence = resolveConfidence(input, missingCoreFields);
  const severity = resolveSeverity(input); // NOTE: never reads confidence
  const recovery = resolveRecovery(input, severity);
  const pattern = derivePattern(input, severity);
  const plan = generatePlan(severity, { equipment: input.equipment_available, input, confidence });

  const governance_trace = buildGovernanceTrace({ input, confidence, severity, recovery, plan });

  return {
    engine: 'rf_beta_engine',
    beta_scope: 'rf_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    assessment_completeness: {
      status: input.assessment_completeness || 'unknown',
      missing_rf_items: input.missing_rf_items || []
    },
    likely_injury_pattern: pattern,
    confidence,
    severity,
    recovery,
    plan,
    safety: {
      red_flag_present: Array.isArray(confidence.red_flag_pathways) && confidence.red_flag_pathways.length > 0,
      route: confidence.route || null,
      pathways: confidence.red_flag_pathways || []
    },
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyDailyCheckIn(session, checkin) to adjust today only.'
    },
    governance_trace
  };
}

/** Convenience re-export so callers can adjust a chosen session without re-running the plan. */
export function applyDailyCheckIn(todaysSession, checkin) {
  return adjustToday(todaysSession, checkin);
}

export { makeAssessmentInput } from './rfAssessmentInput.mjs';
export { resolveConfidence } from './rfConfidenceResolver.mjs';
export { resolveSeverity } from './rfSeverityResolver.mjs';
export { resolveRecovery } from './rfRecoveryResolver.mjs';
export { generatePlan } from './rfPlanGenerator.mjs';
export { adjustToday } from './rfDailyCheckInAdjuster.mjs';
export { analyzeProgress, shouldOfferPhaseGate, buildLsiTransitionGate } from './rfProgressTracker.mjs';
