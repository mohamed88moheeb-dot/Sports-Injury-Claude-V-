/**
 * lib/clinical/itBandEngine/appAdapter/itBandOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * Transforms IT band engine output into the EXISTING RecoveryContext
 * `profile` shape. Mirrors gluteOutputToProfile.mjs / hipFlexorOutputToProfile.mjs.
 * ---------------------------------------------------------------------------
 */

import { stagesToProfilePlan } from '../../core/planToProfile.mjs';
import { describeRecoveryTimeline } from '../../core/recoveryWording.mjs';

const BETA_LABEL = 'Beta testing default — not evidence-graded; requires clinician review before production use.';
const STOP_FALLBACK = 'Stop if you feel sharp or spreading pain, and reassess.';

const pretty = (s) => (s ? String(s).replace(/_/g, ' ') : '');

const ENTITY_TITLES = {
  it_band_syndrome: 'Iliotibial band syndrome',
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
 * @param {object} itBandOutput  runItBand() output
 * @param {object} appAssessment  the legacy assessment
 * @returns {object} profile WITHOUT progress/today (caller computes those)
 */
export function itBandOutputToProfile(itBandOutput, appAssessment = {}, extras = {}) {
  const entity = itBandOutput.entity || itBandOutput.routing?.entity || 'it_band_syndrome';
  const diagnosis = itBandOutput.diagnosis || {};
  const iplan = itBandOutput.plan || null;

  const referral = itBandOutput.referral || null;
  const isReferral = itBandOutput.autonomous_plan === false && !iplan;

  const plan = stagesToProfilePlan(iplan?.stages, mapSession);

  const severity = diagnosis.severity || diagnosis.assessment || {};
  const timeline = describeRecoveryTimeline(iplan?.total_estimated_weeks, severity.prognosis);
  const reviewRequired = !!(itBandOutput.clinician_required || isReferral || diagnosis.flags?.includes('urgent_in_person_review'));

  const MATCH = { high: 80, moderate: 66, low: 52 };
  const matchScore = MATCH[itBandOutput.routing?.confidence] ?? 60;
  const matchLabel = { high: 'Good match', moderate: 'Moderate match', low: 'Limited match' }[itBandOutput.routing?.confidence] || '';
  const confidenceWithheld = reviewRequired;
  const gradeName = severity.grade ? `Grade ${String(severity.grade).slice(-1)}`
    : severity.irritability ? `${pretty(severity.irritability)} irritability`
      : 'Pattern suggested';

  const rf = {
    runtime_mode: 'development',
    clinical_approval_status: 'not_approved',
    execution_allowed_in_development: true,
    public_release_allowed: false,
    engine: 'it_band',
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
    isItBandBeta: true,
    engine: 'it_band',
    injuryEntity: entity,
    rf,

    primaryRegion: appAssessment.primaryRegion || 'it_band',
    regionName: 'IT band',
    injuryTitle: ENTITY_TITLES[entity] || 'IT band injury',
    exactAreaName: diagnosis.summary || ENTITY_TITLES[entity] || 'IT band',
    gradeName,
    mechanism: appAssessment.mechanism || '',

    returnRange: timeline.returnRange,
    rfRecoveryWording: timeline.rfRecoveryWording,
    recoverySecondaryNote: timeline.recoverySecondaryNote,

    confidence: confidenceWithheld ? null : matchScore,
    rfConfidenceWithheld: confidenceWithheld,
    rfConfidenceLabel: matchLabel,

    rfSeverityReasons: severity.flags || [],
    rfReviewRequired: reviewRequired,
    rfReviewMessage: referral?.message || (itBandOutput.gate || null),
    rfSafetyPathways: referral ? [{ message: referral.message }] : [],
    fullAutonomousPlan: !isReferral,

    rfWithheldItems: [],
    rfGovernanceTrace: null,
    rfGapMarkers: [],
    rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',

    itBandEntity: entity,
    itBandStretchPolicy: itBandOutput.stretch_policy || null,
    itBandReferral: referral || null,
    itBandDiagnosisSummary: diagnosis.summary || '',
    itBandConfidenceScore: itBandOutput.routing?.confidence_score ?? null,

    aiPlanMode: extras.aiPlanMode || 'deterministic',
    aiOutOfScopeNote: extras.outOfScopeNote || null,

    plan,
    aiStatus: isReferral
      ? (referral?.message || 'This pattern needs in-person assessment before any rehab plan.')
      : 'IT band beta plan. Start gently, log daily, and use the check-in to adjust today only.',
    planNote: 'IT band beta plan — beta dosage defaults, not evidence-graded; requires clinician review before production use.',
  };
}
