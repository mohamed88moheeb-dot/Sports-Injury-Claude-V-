/**
 * lib/clinical/lowerBackEngine/appAdapter/lowerBackOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * Transforms lower back engine output into the EXISTING RecoveryContext
 * `profile` shape. Mirrors itBandOutputToProfile.mjs / gluteOutputToProfile.mjs.
 * ---------------------------------------------------------------------------
 */

import { stagesToProfilePlan } from '../../core/planToProfile.mjs';
import { describeRecoveryTimeline } from '../../core/recoveryWording.mjs';
import { describeMechanism, diagnosisDrivers } from '../../core/diagnosisDisplay.mjs';
import { deriveEnvelopeFromSharedOutput } from '../../core/sportParticipation.mjs';

const BETA_LABEL = 'Beta testing default — not evidence-graded; requires clinician review before production use.';
const STOP_FALLBACK = 'Stop if you feel sharp or spreading pain, and reassess.';

const pretty = (s) => (s ? String(s).replace(/_/g, ' ') : '');

const ENTITY_TITLES = {
  non_specific_low_back_pain: 'Non-specific (mechanical) low back pain',
  lumbar_radicular_pain: 'Lumbar radicular pain (disc-related, no red flags)',
  possible_cauda_equina_or_serious_pathology: 'Possible serious spinal pathology — emergency review',
  possible_spondylolysis: 'Possible pars stress fracture (spondylolysis) — needs assessment',
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

  const plan = stagesToProfilePlan(lplan?.stages, mapSession);

  const severity = diagnosis.severity || diagnosis.assessment || {};
  const timeline = describeRecoveryTimeline(lplan?.total_estimated_weeks, severity.prognosis);
  const reviewRequired = !!(lowerBackOutput.clinician_required || isReferral || diagnosis.flags?.includes('urgent_in_person_review') || diagnosis.flags?.includes('emergency_in_person_review'));
  // Prefer the server-side AI+evidence-grounded conclusion when the API
  // attached one; otherwise derive the deterministic envelope locally.
  const sportParticipation = lowerBackOutput.sport_participation || deriveEnvelopeFromSharedOutput(lowerBackOutput);

  const MATCH = { high: 80, moderate: 66, low: 52 };
  const routedScore = Number(lowerBackOutput.routing?.confidence_score);
  // Real router score (0-100, summed from the weighted reported findings);
  // the label buckets remain only as a fallback for outputs without one.
  const matchScore = Number.isFinite(routedScore) && routedScore > 0
    ? Math.min(95, Math.round(routedScore))
    : (MATCH[lowerBackOutput.routing?.confidence] ?? 60);
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
    recovery: { wording: timeline.rfRecoveryWording, beta_display: timeline.returnRange, modifiers: [], secondary_note: timeline.recoverySecondaryNote },
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
    exactAreaName: (appAssessment.exactArea ? pretty(appAssessment.exactArea).replace(/^\w/, (c) => c.toUpperCase()) : '') || ENTITY_TITLES[entity] || 'Lower back',
    gradeName,
    mechanism: describeMechanism(lowerBackOutput.input),

    returnRange: timeline.returnRange,
    rfRecoveryWording: timeline.rfRecoveryWording,
    recoverySecondaryNote: timeline.recoverySecondaryNote,
    planTotalWeeks: timeline.planWeeks,
    daysSinceInjury: Number.isFinite(Number(lowerBackOutput.input?.days_since_injury)) ? Number(lowerBackOutput.input.days_since_injury) : null,
    diagnosisDrivers: diagnosisDrivers(lowerBackOutput.routing),
    diagnosisNote: severity.note || null,
    sportParticipation,

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
