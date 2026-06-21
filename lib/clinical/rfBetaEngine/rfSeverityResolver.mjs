/**
 * lib/clinical/rfBetaEngine/rfSeverityResolver.mjs
 * ---------------------------------------------------------------------------
 * Functional severity band from assessment answers + the rule pack's
 * evidence-backed severity indicators. Severity is INDEPENDENT of confidence
 * (this resolver never reads a confidence value). Wording is cautious: it
 * suggests a pattern, it never confirms a structural grade.
 * ---------------------------------------------------------------------------
 */

import { SEVERITY_BANDS } from './types.mjs';
import { hasRedFlag } from './rfAssessmentInput.mjs';

/**
 * @returns {{
 *   functional_severity_band: string, severity_grade_wording: string,
 *   review_required: boolean, severity_reasons: string[],
 *   source_rule_ids: string[], gap_notes: string
 * }}
 */
export function resolveSeverity(input) {
  const reasons = [];
  const source_rule_ids = ['RF-PRESC-SEV-FUNCTIONAL-PROFILE', 'RF-v1.2 §9.7'];

  const highConcern =
    hasRedFlag(input) ||
    input.pain_severity_label === 'severe' ||
    (input.ability_to_continue === 'no' && (input.walking_response === 'unable' || input.walking_response === 'painful')) ||
    (input.bruising_or_swelling === 'significant' && input.weakness_or_giving_way === 'marked') ||
    input.knee_extension_response === 'unable';

  if (highConcern) {
    if (hasRedFlag(input)) reasons.push('A safety answer was flagged.');
    if (input.pain_severity_label === 'severe') reasons.push('Pain reported as severe.');
    if (input.knee_extension_response === 'unable') reasons.push('Unable to straighten the knee against gravity.');
    if (input.bruising_or_swelling === 'significant' && input.weakness_or_giving_way === 'marked') reasons.push('Significant bruising with marked weakness.');
    return {
      functional_severity_band: SEVERITY_BANDS.HIGH_CONCERN,
      severity_grade_wording: 'Higher-concern pattern needing review',
      review_required: true,
      severity_reasons: reasons,
      source_rule_ids: [...source_rule_ids, 'RF-SAF-006', 'RF-SEV-004'],
      gap_notes: 'Exact band cut-offs are not established by the RF evidence set; this is a cautious functional-impact band, not a confirmed structural grade.'
    };
  }

  // Irritability: a poor next-day response is a recognised marker of a more
  // significant / reactive injury, independent of mechanism.
  const highIrritability = input.next_day_response === 'much_worse';
  const someIrritability = input.next_day_response === 'worse';

  const moderate =
    (['sprinting', 'kicking', 'acceleration', 'deceleration'].includes(input.mechanism) &&
      (input.weakness_or_giving_way === 'mild' || input.weakness_or_giving_way === 'marked' ||
        input.walking_response === 'painful' || input.bruising_or_swelling === 'some' ||
        input.knee_extension_response === 'painful' || input.knee_flexion_response === 'painful' ||
        input.pain_severity_label === 'moderate')) ||
    highIrritability || someIrritability ||
    input.weakness_or_giving_way === 'marked';

  if (moderate) {
    reasons.push('Mechanism and symptom pattern suggest a moderate functional impact.');
    if (highIrritability) reasons.push('Symptoms were much worse the next day (high irritability).');
    else if (someIrritability) reasons.push('Symptoms were worse the next day.');
    if (input.bruising_or_swelling === 'some') reasons.push('Some bruising/swelling reported.');
    if (input.knee_extension_response === 'painful') reasons.push('Painful resisted knee extension.');
    if (input.knee_flexion_response === 'painful') reasons.push('Painful on knee-flexion stretch.');
    return {
      functional_severity_band: SEVERITY_BANDS.MODERATE,
      severity_grade_wording: 'Moderate / Grade II pattern suggested by your answers',
      review_required: false,
      severity_reasons: reasons,
      source_rule_ids,
      gap_notes: 'Wording suggests, does not confirm, a grade. Structural grading requires a valid report (RF-SEV-001/002).'
    };
  }

  reasons.push('Movement and daily function appear largely preserved.');
  return {
    functional_severity_band: SEVERITY_BANDS.LOWER,
    severity_grade_wording: 'Milder pattern suggested by your answers',
    review_required: false,
    severity_reasons: reasons,
    source_rule_ids,
    gap_notes: 'Cautious functional band only; not a structural grade.'
  };
}
