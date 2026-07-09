/**
 * lib/clinical/rfBetaEngine/rfRecoveryResolver.mjs
 * ---------------------------------------------------------------------------
 * Recovery-window wording. Numeric windows remain an evidence GAP (rule pack
 * RF-PRESC-RECOVERY-PRINCIPLE / RF v1.2 §9.8), so the honest beta output is
 * qualitative wording + modifiers. Any example range shown for product testing
 * is explicitly labelled beta_recovery_display_default / not_evidence_graded.
 * Never a guarantee, never return-to-sport clearance.
 * ---------------------------------------------------------------------------
 */

import { SEVERITY_BANDS } from './types.mjs';

const MANDATED_WORDING =
  'Estimated recovery window for similar injury patterns. Actual recovery depends on severity, symptoms, sport demands, and clinician review.';

// Example ranges exist ONLY to let the product render something during beta.
// They are NOT evidence-graded and must never be shown as a promise.
const BETA_DISPLAY_DEFAULTS = {
  [SEVERITY_BANDS.LOWER]: '~1–3 weeks (illustrative)',
  [SEVERITY_BANDS.MODERATE]: '~3–8 weeks (illustrative)',
  [SEVERITY_BANDS.HIGH_CONCERN]: 'not estimated — review first'
};

export function resolveRecovery(input, severity) {
  const band = severity.functional_severity_band;

  const modifiers_that_may_lengthen = [];
  const modifiers_that_may_shorten = [];

  const st = input.rf_self_tests || {};
  const g = (k) => input[k] ?? st[k];
  const mech = g('mechanism');
  const age = g('age_group');
  const nday = g('next_day_response');
  const confV = Number(input.movement_confidence_value ?? st.movement_confidence_value);

  if (input.previous_injury) modifiers_that_may_lengthen.push('previous/recurrent injury history');
  if (input.reported_fibrosis_or_scar_history && input.reported_fibrosis_or_scar_history !== 'none') modifiers_that_may_lengthen.push('reported previous scar/fibrosis at the site (history only)');
  if (input.bruising_or_swelling === 'significant') modifiers_that_may_lengthen.push('significant bruising/swelling');
  if (input.walking_response === 'unable' || input.ability_to_continue === 'no') modifiers_that_may_lengthen.push('poor early walking tolerance');
  if (band === SEVERITY_BANDS.HIGH_CONCERN) modifiers_that_may_lengthen.push('higher-concern functional pattern');

  // ── Field-driven modifiers (every relevant answer shapes the estimate) ──
  if (mech === 'direct_impact') modifiers_that_may_lengthen.push('direct-contact (contusion) mechanism — monitor for slower resolution');
  if (mech === 'gradual_overuse') modifiers_that_may_lengthen.push('gradual/overuse onset — tendon-type problems often settle more slowly');
  if (nday === 'much_worse' || nday === 'worse') modifiers_that_may_lengthen.push('symptoms reactive (worse the next day)');
  if (age === '45_plus') modifiers_that_may_lengthen.push('age 45+ — tissue tends to adapt more slowly');
  else if (age === '35_44') modifiers_that_may_lengthen.push('age 35–44 — recovery may be slightly slower');
  if (Number.isFinite(confV) && confV <= 40) modifiers_that_may_lengthen.push('lower movement confidence — return-to-sport readiness may take longer');

  if (band === SEVERITY_BANDS.LOWER) modifiers_that_may_shorten.push('movement and daily function largely preserved');
  if (['mild', 'none'].includes(input.walking_response)) modifiers_that_may_shorten.push('good early walking tolerance');
  if (age === 'under_20') modifiers_that_may_shorten.push('younger age — tissue generally heals faster');

  return {
    recovery_window_label: band === SEVERITY_BANDS.HIGH_CONCERN ? 'review_required_before_estimate' : 'estimated_recovery_window_qualitative',
    user_facing_wording: MANDATED_WORDING,
    modifiers_that_may_lengthen,
    modifiers_that_may_shorten,
    evidence_status: 'gap',
    gap_notes: 'No precise individual RF recovery window is authorized by current evidence (RF v1.2 §9.8). Numbers below are beta display defaults only.',
    beta_recovery_display_default: BETA_DISPLAY_DEFAULTS[band],
    beta_display_labels: ['beta_recovery_display_default', 'not_evidence_graded', 'requires_clinician_review'],
    source_rule_ids: ['RF-PRESC-RECOVERY-PRINCIPLE', 'RF-v1.2 §9.8']
  };
}
