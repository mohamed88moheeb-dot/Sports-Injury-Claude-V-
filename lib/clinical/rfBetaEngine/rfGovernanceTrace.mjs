/**
 * lib/clinical/rfBetaEngine/rfGovernanceTrace.mjs
 * ---------------------------------------------------------------------------
 * Assembles the governance trace attached to every beta output. It records what
 * inputs and rules were used, which objects were selected vs withheld, the gap
 * markers in play, and asserts that NO clinical authority was created.
 * ---------------------------------------------------------------------------
 */

export function buildGovernanceTrace({ input, confidence, severity, recovery, plan }) {
  const selected = [];
  const withheld = [];
  const activityWithheld = [];

  if (plan && plan.phases) {
    for (const ph of plan.phases) {
      // Only count auto-prescribed (non-preview) cards as "selected" in the trace.
      // Preview-only cards in non-current phases are roadmap visibility, not prescriptions.
      for (const day of ph.days) {
        for (const c of day.session.cards) {
          if (c.preview_only) continue;
          selected.push(c.exercise_id);
        }
      }
      for (const w of ph.withheld_items) withheld.push(`${ph.phase_id}:${w.exercise_id}`);
      for (const a of ph.activity_exposures) if (a.eligible_or_withheld?.startsWith('withheld')) activityWithheld.push(a.activity_exposure_id);
    }
  }

  return {
    assessment_inputs_used: Object.keys(input || {}),
    confidence_rules_applied: confidence?.rules_applied || [],
    severity_rules_applied: severity?.source_rule_ids || [],
    recovery_rules_applied: recovery?.source_rule_ids || [],
    phase_rules_applied: plan ? plan.phases.map((p) => p.phase_id) : [],
    beta_defaults_used: ['rfBetaPrescriptionDefaults (sets/reps/rest/intensity/phase-day templates)', 'beta_recovery_display_default'],
    exercise_objects_selected: [...new Set(selected)],
    exercise_objects_withheld: [...new Set(withheld)],
    activity_exposures_withheld: [...new Set(activityWithheld)],
    gap_markers: [
      'dosage numbers = beta_default_not_evidence_graded',
      'recovery numbers = beta_recovery_display_default / not_evidence_graded',
      'deviation bands + non-response threshold = evidence gap'
    ],
    review_required_items: [
      ...(severity?.review_required ? ['severity_high_concern'] : []),
      ...(confidence?.route === 'review' ? ['confidence_routed_to_review'] : []),
      ...withheld
    ],
    clinical_authority_created: false
  };
}
