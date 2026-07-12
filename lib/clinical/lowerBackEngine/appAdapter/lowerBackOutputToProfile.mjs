/**
 * lib/clinical/lowerBackEngine/appAdapter/lowerBackOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * Transforms lower back engine output into the EXISTING RecoveryContext
 * `profile` shape. Mirrors itBandOutputToProfile.mjs / gluteOutputToProfile.mjs.
 * ---------------------------------------------------------------------------
 */

const BETA_LABEL = 'Beta testing default — not evidence-graded; requires clinician review before production use.';
const STOP_FALLBACK = 'Stop if you feel sharp or spreading pain, and reassess.';

const pretty = (s) => (s ? String(s).replace(/_/g, ' ') : '');

const ENTITY_TITLES = {
  non_specific_low_back_pain: 'Non-specific (mechanical) low back pain',
  lumbar_radicular_pain: 'Lumbar radicular pain (disc-related, no red flags)',
};

function mapCardToExercise(card) {
  const d = card.dosage || {};
  const sets = d.sets && d.sets !== '—' ? `${d.sets} sets` : null;
  const reps = d.reps || d.hold || d.detail || d.reps_or_hold || null;
  const rest = d.rest ? `rest ${d.rest}` : null;
  const extra = [d.intensity, d.load, d.tempo].filter(Boolean).join(', ');
  const prescription = [sets, reps, rest].filter(Boolean).join(' · ') + (extra ? ` (${extra})` : '') || 'See guidance';

  return {
    name: card.name,
    purpose: card.purpose || card.why_this_injury || '',
    prescription: prescription || 'See guidance',
    equipment: Array.isArray(card.equipment) ? card.equipment.join(', ') : (card.equipment || ''),
    intensity: d.intensity || d.load || '',
    cue: Array.isArray(card.instructions) ? card.instructions.join(' ') : (card.instructions || ''),
    video: 'Video placeholder',
    commonMistakes: card.cautions || [],
    alternative: card.regression ? { name: `Easier: ${card.regression}`, prescription: 'Regression (beta)', cue: '' } : null,
    painRule: card.stop_rule || STOP_FALLBACK,
    blockLabel: pretty(card.block),
    isRfBeta: true,
    betaDefaultLabel: BETA_LABEL,
    clinicalReviewStatus: 'requires_clinician_review',
    previewOnly: !!card.preview_only,
    sourceRefs: card.source_refs || [],
  };
}

function mapSession(session, friendlyName, dayNumber) {
  const cards = (session && session.cards) || [];
  if (!cards.length) {
    return {
      title: `Day ${dayNumber}`, sessionTitle: 'Rest & recovery',
      summary: 'Rest and recovery day — the tissue adapts between sessions.',
      load: 'Rest', mobility: [], exercises: [], recovery: ['Rest and recovery day.'],
      completed: false, rule: 'Recovery is part of the plan.', isRfBeta: true, isRest: true,
    };
  }
  return {
    title: `Day ${dayNumber}`,
    sessionTitle: `${friendlyName} — ${session.tier_label || 'session'}`,
    summary: `${cards.length} exercise${cards.length > 1 ? 's' : ''} for this stage, plus guidance.`,
    load: `${cards.length} exercise${cards.length > 1 ? 's' : ''}`,
    mobility: [],
    exercises: cards.map(mapCardToExercise),
    recovery: session.monitoring_triggers ? ['Watch for: ' + session.monitoring_triggers.join('; ')] : [],
    completed: false,
    rule: session.stop_rule || STOP_FALLBACK,
    isRfBeta: true,
  };
}

/**
 * @param {object} lowerBackOutput  runLowerBack() output
 * @param {object} appAssessment  the legacy assessment
 * @returns {object} profile WITHOUT progress/today (caller computes those)
 */
export function lowerBackOutputToProfile(lowerBackOutput, appAssessment = {}, extras = {}) {
  const entity = lowerBackOutput.entity || lowerBackOutput.routing?.entity || 'non_specific_low_back_pain';
  const diagnosis = lowerBackOutput.diagnosis || {};
  const lplan = lowerBackOutput.plan || null;

  const referral = lowerBackOutput.referral || null;
  const isReferral = lowerBackOutput.autonomous_plan === false && !lplan;

  let dayCounter = 1;
  const plan = (lplan?.stages || []).map((stage) => {
    const days = (stage.sessions || []).map((s) => mapSession(s, stage.friendly_name || stage.stage_name, dayCounter++));
    const weekLabel = stage.duration_weeks ? `Week 1 of ~${stage.duration_weeks}` : 'Week 1';
    return {
      id: stage.stage_id, name: stage.stage_name, label: stage.friendly_name || stage.stage_name,
      goal: stage.friendly_name || '', intensity: '', status: stage.status || 'upcoming', is_current: !!stage.is_current,
      progression_note: stage.progression_note || '',
      duration_weeks: stage.duration_weeks || null,
      weeks: [{ title: weekLabel, focus: stage.friendly_name || stage.stage_name, days }],
    };
  });

  const severity = diagnosis.severity || diagnosis.assessment || {};
  const reviewRequired = !!(lowerBackOutput.clinician_required || isReferral || diagnosis.flags?.includes('urgent_in_person_review') || diagnosis.flags?.includes('emergency_in_person_review'));

  const MATCH = { high: 80, moderate: 66, low: 52 };
  const matchScore = MATCH[lowerBackOutput.routing?.confidence] ?? 60;
  const matchLabel = { high: 'Good match', moderate: 'Moderate match', low: 'Limited match' }[lowerBackOutput.routing?.confidence] || '';
  const confidenceWithheld = reviewRequired;
  const gradeName = severity.grade ? `Grade ${String(severity.grade).slice(-1)}`
    : severity.irritability ? `${pretty(severity.irritability)} irritability`
      : 'Pattern suggested';

  const rf = {
    runtime_mode: 'development',
    clinical_approval_status: 'not_approved',
    execution_allowed_in_development: true,
    public_release_allowed: false,
    engine: 'lower_back',
    injury_entity: entity,
    assessment_completeness: { status: 'partial', missing_rf_items: [] },
    safety: { red_flag_present: reviewRequired, route: reviewRequired ? 'review' : null, pathways: referral ? [{ message: referral.message }] : [] },
    diagnosis_pattern: { pattern_id: entity, pattern_name: ENTITY_TITLES[entity] || pretty(entity), note: diagnosis.summary || '' },
    severity: { band: severity.band || null, wording: gradeName, reasons: severity.flags || [], review_required: reviewRequired },
    confidence: { value: confidenceWithheld ? null : matchScore, withheld: confidenceWithheld, label: matchLabel, limited_by_missing_inputs: false },
    recovery: { wording: severity.prognosis ? `Estimated recovery: ${severity.prognosis}` : '', beta_display: severity.prognosis || 'Varies — clinician review', modifiers: [] },
    self_tests: null,
    plan_status: isReferral ? 'review_gated' : 'generated',
    governance_trace: null,
  };

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    isRfBeta: true,
    isLowerBackBeta: true,
    engine: 'lower_back',
    injuryEntity: entity,
    rf,

    primaryRegion: appAssessment.primaryRegion || 'lower_back',
    regionName: 'Lower back',
    injuryTitle: ENTITY_TITLES[entity] || 'Lower back injury',
    exactAreaName: diagnosis.summary || ENTITY_TITLES[entity] || 'Lower back',
    gradeName,
    mechanism: appAssessment.mechanism || '',

    returnRange: severity.prognosis || 'Varies — clinician review',
    rfRecoveryWording: severity.prognosis ? `Estimated recovery: ${severity.prognosis}.` : '',

    confidence: confidenceWithheld ? null : matchScore,
    rfConfidenceWithheld: confidenceWithheld,
    rfConfidenceLabel: matchLabel,

    rfSeverityReasons: severity.flags || [],
    rfReviewRequired: reviewRequired,
    rfReviewMessage: referral?.message || (lowerBackOutput.gate || null),
    rfSafetyPathways: referral ? [{ message: referral.message, urgency: referral.urgency || 'urgent' }] : [],
    fullAutonomousPlan: !isReferral,

    rfWithheldItems: [],
    rfGovernanceTrace: null,
    rfGapMarkers: [],
    rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',

    lowerBackEntity: entity,
    lowerBackStretchPolicy: lowerBackOutput.stretch_policy || null,
    lowerBackReferral: referral || null,
    lowerBackReferralUrgency: referral?.urgency || null,
    lowerBackDiagnosisSummary: diagnosis.summary || '',
    lowerBackConfidenceScore: lowerBackOutput.routing?.confidence_score ?? null,

    aiPlanMode: extras.aiPlanMode || 'deterministic',
    aiOutOfScopeNote: extras.outOfScopeNote || null,

    plan,
    aiStatus: isReferral
      ? (referral?.message || 'This pattern needs in-person assessment before any rehab plan.')
      : 'Lower back beta plan. Start gently, log daily, and use the check-in to adjust today only.',
    planNote: 'Lower back beta plan — beta dosage defaults, not evidence-graded; requires clinician review before production use.',
  };
}
