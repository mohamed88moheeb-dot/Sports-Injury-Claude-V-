/**
 * lib/clinical/quadEngine/appAdapter/quadOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * THE KEY FILE. Transforms quad engine output into the EXISTING RecoveryContext
 * `profile` shape so the existing diagnosis/dashboard/plan/week/day/check-in
 * pages render it natively — no parallel UI.
 *
 * Pure + boundary-clean (imports nothing). Produces the same structure the RF
 * adapter does — profile.plan[].weeks[].days[].exercises[] — PLUS a compatible
 * `rf` object and `isRfBeta: true` so every isRfBeta-gated page/branch works
 * unchanged. Quad-specific extras (entity, acute protocol, stretch policy) are
 * added as additive fields.
 * ---------------------------------------------------------------------------
 */

import { stagesToProfilePlan } from '../../core/planToProfile.mjs';
import { describeRecoveryTimeline } from '../../core/recoveryWording.mjs';
import { describeMechanism, diagnosisDrivers } from '../../core/diagnosisDisplay.mjs';

const BETA_LABEL = 'Beta testing default — not evidence-graded; requires clinician review before production use.';
const STOP_FALLBACK = 'Stop if you feel sharp or spreading pain, or pain that clearly worsens the next morning.';

const pretty = (s) => (s ? String(s).replace(/_/g, ' ') : '');

const ENTITY_TITLES = {
  vastus_strain: 'Vastus muscle strain',
  quad_contusion: 'Quadriceps contusion',
  quad_tendinopathy: 'Quad / patellar tendinopathy',
  quad_tendon_rupture: 'Quad / patellar tendon rupture',
};

/** quad session card → existing exercise shape consumed by /plan/day. */
function mapCardToExercise(card) {
  const d = card.dosage || {};
  const sets = d.sets && d.sets !== '—' ? `${d.sets} sets` : null;
  const reps = d.reps || d.hold || d.detail || d.reps_or_hold || null;
  const rest = d.rest ? `rest ${d.rest}` : null;
  const extra = [d.intensity, d.load, d.tempo, d.cuff].filter(Boolean).join(', ');
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

/** quad session → existing day shape. */
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
 * @param {object} quadOutput  runQuad() output
 * @param {object} appAssessment  the legacy assessment (for region/mechanism labels)
 * @returns {object} profile WITHOUT progress/today (caller computes those)
 */
export function quadOutputToProfile(quadOutput, appAssessment = {}, extras = {}) {
  const entity = quadOutput.entity || quadOutput.routing?.entity || 'vastus_strain';
  const diagnosis = quadOutput.diagnosis || {};
  const qplan = quadOutput.plan || null;

  // ── Special case: pre-op rupture / referral — no autonomous plan. ─────────
  const referral = quadOutput.referral || (quadOutput.stage === 'pre_operative_referral' ? quadOutput.referral : null);
  const isReferral = quadOutput.autonomous_plan === false && (!qplan || quadOutput.stage === 'pre_operative_referral');

  // ── Build plan[] from stages -> weeks -> days(sessions). ──────────────────
  const plan = stagesToProfilePlan(qplan?.stages, mapSession);

  // Different modules surface their grading under different keys
  // (vastus/contusion: diagnosis.severity; tendinopathy: diagnosis.assessment) —
  // read whichever is present rather than assuming one shape.
  const severity = diagnosis.severity || diagnosis.assessment || {};
  const timeline = describeRecoveryTimeline(qplan?.total_estimated_weeks, severity.prognosis);
  const reviewRequired = !!(quadOutput.clinician_required || isReferral || diagnosis.flags?.includes('urgent_in_person_review'));

  // Match score from the routing confidence (how well answers fit the pathway).
  // This is a MATCH score, not a diagnostic certainty — capped < 85 like RF.
  // Withhold only when genuine review is required (referral / rupture).
  const MATCH = { high: 80, moderate: 66, low: 52 };
  const routedScore = Number(quadOutput.routing?.confidence_score);
  // Real router score (0-100, summed from the weighted reported findings);
  // the label buckets remain only as a fallback for outputs without one.
  const matchScore = Number.isFinite(routedScore) && routedScore > 0
    ? Math.min(95, Math.round(routedScore))
    : (MATCH[quadOutput.routing?.confidence] ?? 60);
  const matchLabel = { high: 'Good match', moderate: 'Moderate match', low: 'Limited match' }[quadOutput.routing?.confidence] || '';
  const confidenceWithheld = reviewRequired;
  const gradeName = severity.bamic_label ? `BAMIC ${severity.bamic_label}`
    : severity.grade ? `${pretty(severity.grade)}`
      : diagnosis.assessment?.irritability ? `${pretty(diagnosis.assessment.irritability)} irritability`
        : 'Pattern suggested';

  // Compatible `rf` object so isRfBeta-gated pages read a populated state.
  const rf = {
    runtime_mode: 'development',
    clinical_approval_status: 'not_approved',
    execution_allowed_in_development: true,
    public_release_allowed: false,
    engine: 'quad',
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
    isRfBeta: true,        // reuse all beta rendering/branches
    isQuadBeta: true,      // additive: identifies the quad engine
    engine: 'quad',
    injuryEntity: entity,
    rf,

    primaryRegion: appAssessment.primaryRegion || 'quadriceps',
    regionName: 'Quadriceps',
    injuryTitle: ENTITY_TITLES[entity] || 'Quadriceps injury',
    exactAreaName: (appAssessment.exactArea ? pretty(appAssessment.exactArea).replace(/^\w/, (c) => c.toUpperCase()) : '') || ENTITY_TITLES[entity] || 'Quadriceps',
    gradeName,
    mechanism: describeMechanism(quadOutput.input),

    returnRange: timeline.returnRange,
    rfRecoveryWording: timeline.rfRecoveryWording,
    recoverySecondaryNote: timeline.recoverySecondaryNote,
    planTotalWeeks: timeline.planWeeks,
    daysSinceInjury: Number.isFinite(Number(quadOutput.input?.days_since_injury)) ? Number(quadOutput.input.days_since_injury) : null,
    diagnosisDrivers: diagnosisDrivers(quadOutput.routing),
    diagnosisNote: severity.note || null,

    confidence: confidenceWithheld ? null : matchScore,
    rfConfidenceWithheld: confidenceWithheld,
    rfConfidenceLabel: matchLabel,

    rfSeverityReasons: severity.flags || [],
    rfReviewRequired: reviewRequired,
    rfReviewMessage: referral?.message || (quadOutput.gate || null),
    rfSafetyPathways: referral ? [{ message: referral.message }] : [],
    fullAutonomousPlan: !isReferral,

    rfWithheldItems: [],
    rfGovernanceTrace: null,
    rfGapMarkers: [],
    rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',

    // Quad-specific additive fields (rendered by small additive lines).
    quadEntity: entity,
    quadAcuteProtocol: quadOutput.acute_protocol || null,
    quadStretchPolicy: quadOutput.stretch_policy || null,
    quadReferral: referral || null,
    quadDiagnosisSummary: diagnosis.summary || '',
    quadConfidenceScore: quadOutput.routing?.confidence_score ?? null,

    // AI session-composition status (set by the API route; absent/undefined
    // when this profile came from a build that predates the AI composer).
    aiPlanMode: extras.aiPlanMode || 'deterministic',
    aiOutOfScopeNote: extras.outOfScopeNote || null,

    plan,
    aiStatus: isReferral
      ? (referral?.message || 'This pattern needs in-person assessment before any rehab plan.')
      : (quadOutput.acute_protocol
        ? `Acute protocol active: ${quadOutput.acute_protocol.protocol}. ${quadOutput.acute_protocol.rationale || ''}`
        : 'Quad beta plan. Start gently, log daily, and use the check-in to adjust today only.'),
    planNote: 'Quad beta plan — beta dosage defaults, not evidence-graded; requires clinician review before production use.',
  };
}
