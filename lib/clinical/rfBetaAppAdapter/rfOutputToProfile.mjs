/**
 * lib/clinical/rfBetaAppAdapter/rfOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * THE KEY FILE. Transforms RF beta engine output into the EXISTING
 * RecoveryContext `profile` shape so the existing diagnosis/dashboard/plan/
 * week/day/check-in pages render it natively — no parallel UI.
 *
 * Pure + boundary-clean: imports nothing (no legacy, no fs). The caller
 * (RecoveryContext) fills in progress/today using its own helpers.
 *
 * Existing shape preserved:
 *   profile.plan[].weeks[].days[].exercises[]
 * ---------------------------------------------------------------------------
 */

const BETA_LABEL = 'Beta testing default — not evidence-graded; requires clinician review before production use.';
const RF_STOP_RULE_FALLBACK = 'Stop if you feel sharp or spreading pain, or pain that clearly worsens the next morning.';

const pretty = (s) => (s ? String(s).replace(/_/g, ' ') : '');

/** RF session card → existing exercise shape consumed by /plan/day. */
function mapCardToExercise(card) {
  const sets = card.sets ? `${card.sets} sets` : null;
  const reps = card.reps_or_hold || null;
  const rest = card.rest && card.rest !== 'n/a' ? `rest ${card.rest}` : null;
  const prescription = [sets, reps, rest].filter(Boolean).join(' · ') || 'See guidance';

  const alt = (card.alternatives && (card.alternatives.easier?.[0] || card.alternatives.related?.[0])) || null;

  return {
    name: card.exercise_name,
    purpose: card.purpose || '',
    prescription,
    equipment: Array.isArray(card.equipment) ? card.equipment.join(', ') : (card.equipment || ''),
    intensity: card.intensity || '',
    cue: (Array.isArray(card.instructions) ? card.instructions.join(' ') : '') || '',
    video: (card.video_placeholder && card.video_placeholder.note) || 'Video placeholder',
    commonMistakes: card.common_mistakes || [],
    alternative: alt ? { name: alt.label, prescription: 'Easier option (beta)', cue: '' } : null,
    painRule: card.stop_rule || RF_STOP_RULE_FALLBACK,
    blockLabel: pretty(card.block),
    // additive RF-beta fields (rendered by a small additive line on existing pages)
    isRfBeta: true,
    betaDefaultLabel: BETA_LABEL,
    clinicalReviewStatus: card.clinical_review_status || 'requires_clinician_review',
    previewOnly: !!card.preview_only
  };
}

function mapDay(rfDay, friendlyName, dayNumber) {
  const cards = (rfDay.session && rfDay.session.cards) || [];
  const isRest = rfDay.type === 'rest' || cards.length === 0;
  if (isRest) {
    return {
      title: `Day ${dayNumber}`,
      sessionTitle: 'Rest & recovery',
      summary: 'Rest and recovery day — the tissue adapts between sessions.',
      load: 'Rest',
      mobility: [],
      exercises: [],
      recovery: rfDay.guidance || ['Rest and recovery day.'],
      completed: false,
      rule: 'Recovery is part of the plan. Resume on your next session day.',
      isRfBeta: true,
      isRest: true
    };
  }
  return {
    title: `Day ${dayNumber}`,
    sessionTitle: friendlyName,
    summary: `${cards.length} exercise${cards.length > 1 ? 's' : ''} for this phase, plus guidance.`,
    load: `${cards.length} exercise${cards.length > 1 ? 's' : ''}`,
    mobility: [],
    exercises: cards.map(mapCardToExercise),
    recovery: rfDay.guidance || [],
    completed: false,
    rule: (cards[0] && cards[0].stop_rule) || RF_STOP_RULE_FALLBACK,
    isRfBeta: true
  };
}

/**
 * @param {object} rfOutput  runRfBeta() output
 * @param {object} appAssessment  the legacy assessment (for region/mechanism labels)
 * @returns {object} profile WITHOUT progress/today (caller computes those)
 */
export function rfOutputToProfile(rfOutput, appAssessment = {}) {
  const pattern = rfOutput.likely_injury_pattern || {};
  const confidence = rfOutput.confidence || {};
  const severity = rfOutput.severity || {};
  const recovery = rfOutput.recovery || {};
  const rfPlan = rfOutput.plan || { phases: [] };

  let dayCounter = 1;
  const plan = (rfPlan.phases || []).map((phase) => {
    const isCurrent = phase.status === 'current' || !!phase.is_current;
    const days = (phase.days || []).map((d) => mapDay(d, phase.friendly_name, dayCounter++));
    return {
      id: phase.phase_id,
      name: phase.clinical_name,
      label: phase.friendly_name,
      goal: phase.goal || '',
      intensity: '',
      status: phase.status || 'upcoming',
      is_current: isCurrent,
      progression_note: phase.progression_note || '',
      weeks: [{ title: 'Week 1', focus: phase.goal || phase.friendly_name, days }]
    };
  });

  const reviewRequired = !!(severity.review_required || confidence.route === 'review' || rfPlan.review_gated);
  const safety = rfOutput.safety || { pathways: [] };
  const safetyMessages = (safety.pathways || []).map((p) => p.message);

  const completeness = rfOutput.assessment_completeness || { status: 'unknown', missing_rf_items: [] };
  const incomplete = completeness.status === 'incomplete';
  const partial = completeness.status === 'partial';

  // plan_status reflects assessment completeness + safety (CP1: honest labelling;
  // the full plan-structure rework is CP2).
  const plan_status = incomplete ? 'incomplete'
    : reviewRequired ? 'review_gated'
    : partial ? 'limited'
    : 'generated';

  // honest status line that surfaces limited/incomplete now (before CP4 rewiring)
  const completenessNote = incomplete
    ? 'Your RF assessment is incomplete — answer the movement and strength checks to get a fuller result. Showing limited information only.'
    : partial
      ? 'Some RF assessment answers are missing, so this result is based on limited information.'
      : null;

  // unified RF clinical state — single source of truth (pages migrate to it in CP4)
  const rf = {
    runtime_mode: 'development',
    clinical_approval_status: 'not_approved',
    execution_allowed_in_development: true,
    public_release_allowed: false,
    assessment_completeness: completeness,
    safety: { red_flag_present: !!safety.red_flag_present, route: safety.route || null, pathways: safety.pathways || [] },
    diagnosis_pattern: pattern,
    severity: { band: severity.functional_severity_band, wording: severity.severity_grade_wording, reasons: severity.severity_reasons || [], review_required: !!severity.review_required },
    recurrence_history: !!(appAssessment && (appAssessment.rfAnswers && appAssessment.rfAnswers.previous_injury === 'yes')),
    fibrosis_or_scar_history: (appAssessment && appAssessment.rfAnswers && (appAssessment.rfAnswers.scar_history === 'yes' || appAssessment.rfAnswers.palpation === 'lump')) || false,
    confidence: {
      value: confidence.withheld ? null : (confidence.confidence_percent ?? null),
      withheld: !!confidence.withheld,
      label: confidence.confidence_label || '',
      limited_by_missing_inputs: !!confidence.limited_by_missing_inputs
    },
    recovery: { wording: recovery.user_facing_wording || '', beta_display: recovery.beta_recovery_display_default || '', modifiers: recovery.modifiers_that_may_lengthen || [] },
    rts_readiness: rfOutput.rts_readiness || null,
    self_tests: (rfOutput.input && rfOutput.input.rf_self_tests) || null,
    plan_status,
    governance_trace: rfOutput.governance_trace || null
  };

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    isRfBeta: true,
    rf,
    rfAssessmentCompleteness: completeness,
    rfConfidenceLimited: !!confidence.limited_by_missing_inputs,
    rfPlanStatus: plan_status,

    primaryRegion: appAssessment.primaryRegion || 'quadriceps',
    regionName: 'Quadriceps',
    injuryTitle: pattern.pattern_name || 'Anterior-thigh pattern',
    exactAreaName: 'Rectus femoris (anterior thigh)',
    gradeName: severity.severity_grade_wording || 'Pattern suggested',
    mechanism: appAssessment.mechanism || '',

    // recovery: short label for the existing heading + full cautious wording for additive copy
    returnRange: recovery.beta_recovery_display_default || 'Varies — clinician review',
    rfRecoveryWording: recovery.user_facing_wording || '',

    // return-to-sport readiness battery (criteria checklist; never grants clearance)
    rtsReadiness: rfOutput.rts_readiness || null,

    // confidence: number, or null when withheld
    confidence: confidence.withheld ? null : (confidence.confidence_percent ?? null),
    rfConfidenceWithheld: !!confidence.withheld,
    rfConfidenceLabel: confidence.confidence_label || '',

    rfSeverityReasons: severity.severity_reasons || [],
    rfReviewRequired: reviewRequired,
    rfReviewMessage: rfPlan.review_message || null,
    rfSafetyPathways: safety.pathways || [],
    fullAutonomousPlan: rfPlan.full_autonomous_plan !== false,

    rfWithheldItems: rfPlan.withheld_summary || [],
    rfGovernanceTrace: rfOutput.governance_trace || null,
    rfGapMarkers: (rfOutput.governance_trace && rfOutput.governance_trace.gap_markers) || [],
    rfActivityStatement: rfPlan.activity_exposure_statement || 'Activity exposure expresses capacity. It does not clear the athlete.',

    plan,
    aiStatus: safetyMessages.length
      ? safetyMessages.join(' ')
      : completenessNote
        ? completenessNote
        : (reviewRequired
          ? (rfPlan.review_message || 'Higher-concern pattern — please seek in-person review before progressing.')
          : 'RF beta plan. Start gently, log daily, and use the check-in to adjust today only.'),
    planNote: 'RF beta plan — beta dosage defaults, not evidence-graded; requires clinician review before production use.'
  };
}

/**
 * Today-only check-in adjustment on the EXISTING profile day shape. Mirrors the
 * RF daily-check-in rules (RF-PRESC-CHECKIN-*) but operates on day.exercises so
 * the existing pages render it. Never touches other days, never regenerates,
 * never jumps phase, never grants clearance. Returns an adjusted COPY of the day.
 *
 * @param {object} day        a profile plan day (with .exercises)
 * @param {object} status     legacy check-in status { pain, confidence, swelling, response }
 */
export function adjustProfileDayToday(day, status = {}) {
  const copy = JSON.parse(JSON.stringify(day));
  const pain = Number(status.pain ?? 0);
  const conf = Number(status.confidence ?? 100);
  const swelling = status.swelling || '';
  const response = status.response || '';

  const concerning = pain >= 7 || swelling === 'New swelling' || swelling === 'Worse' || response === 'Worse than yesterday';
  const moreNoticeable = pain >= 5 || response === 'Sore but settled';
  const lowConfidence = conf < 40;

  if (concerning) {
    copy.exercises = [];
    copy.withheldToday = true;
    copy.summary = 'Session paused today based on your check-in.';
    copy.recovery = ['We have paused today’s exercises. Check your symptoms and seek review if anything feels concerning.', ...(copy.recovery || [])];
    return { action: 'withhold_today_and_review', message: 'Today’s session is paused. Please monitor symptoms and seek review if concerning.', selected_session_only: true, future_days_changed: false, day: copy };
  }
  if (moreNoticeable) {
    // drop the most demanding exercise (last one), ease the rest
    if (copy.exercises.length > 1) copy.exercises = copy.exercises.slice(0, -1);
    copy.exercises = copy.exercises.map((e) => ({ ...e, easedToday: true, cue: (e.cue || '') + ' Eased today via check-in.' }));
    copy.summary = 'Made a little easier today based on your check-in.';
    return { action: 'reduce_today', message: 'We made today a little easier.', selected_session_only: true, future_days_changed: false, day: copy };
  }
  if (lowConfidence) {
    copy.clarifyPrompt = 'A few answers were unsure — can you confirm how the front of your thigh feels today?';
    copy.summary = 'Simplified today; quick clarifying question added.';
    return { action: 'simplify_and_clarify', message: 'We simplified today and added a quick question.', selected_session_only: true, future_days_changed: false, day: copy };
  }
  return { action: 'keep_today', message: 'Today’s session looks good — carry on.', selected_session_only: true, future_days_changed: false, day: copy };
}
