/**
 * lib/clinical/kneeEngine/appAdapter/kneeOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * Transforms runKnee() output into the EXISTING RecoveryContext `profile` shape
 * so the diagnosis/dashboard/plan/week/day/check-in pages render it natively —
 * no parallel UI. Mirrors quadOutputToProfile / rfOutputToProfile.
 *
 * Produces profile.plan[].weeks[].days[].exercises[] PLUS a compatible `rf`
 * object and isRfBeta:true so every isRfBeta-gated branch works unchanged.
 * Knee extras (entity, referral, rtsReadiness) are additive fields.
 * Pure + boundary-clean (imports nothing).
 * ---------------------------------------------------------------------------
 */

import { stagesToProfilePlan } from '../../core/planToProfile.mjs';
import { describeRecoveryTimeline } from '../../core/recoveryWording.mjs';

const BETA_LABEL = 'Beta testing default — not evidence-graded; requires clinician review before production use.';
const STOP_FALLBACK = 'Stop if the knee gives way, locks, swells, or pain clearly worsens — and seek in-person assessment.';
const pretty = (s) => (s ? String(s).replace(/_/g, ' ') : '');

const ENTITY_TITLES = {
  acl_injury: 'Anterior cruciate ligament (ACL) injury',
  pcl_injury: 'Posterior cruciate ligament (PCL) injury',
  mcl_injury: 'Medial collateral ligament (MCL) injury',
  lcl_plc_injury: 'Lateral / posterolateral-corner injury',
  meniscus_tear: 'Meniscal tear',
  patellofemoral_pain: 'Patellofemoral pain (anterior knee pain)',
  patellar_instability: 'Patellar instability / dislocation',
  knee_osteoarthritis: 'Knee osteoarthritis',
  itb_syndrome: 'Iliotibial band syndrome',
  osgood_schlatter: 'Osgood-Schlatter (tibial-tubercle apophysitis)',
};

// Illustrative recovery ranges (beta display only — not a promise or clearance).
const ENTITY_RECOVERY = {
  acl_injury: '9–12 months to sport (criteria-based)',
  pcl_injury: 'Variable — conservative return often ~3–4 months',
  mcl_injury: '~2–6 weeks (grade I–II)',
  lcl_plc_injury: 'Specialist-guided — often surgical',
  meniscus_tear: '~6–12 weeks (conservative first-line)',
  patellofemoral_pain: '~6 weeks–3 months (load-based)',
  patellar_instability: '~6–12 weeks (conservative)',
  knee_osteoarthritis: 'Ongoing self-management',
  itb_syndrome: '~4–8 weeks',
  osgood_schlatter: 'Self-limiting — settles with load management / skeletal maturity',
};

/** knee session card → existing exercise shape consumed by /plan/day. */
function mapCardToExercise(card) {
  const d = card.dosage || {};
  const sets = d.sets && d.sets !== '—' ? `${d.sets} sets` : null;
  const reps = d.reps || d.hold || d.detail || d.range || d.reps_or_hold || null;
  const extra = [d.intensity, d.load, d.tempo, d.target].filter(Boolean).join(', ');
  const prescription = ([sets, reps].filter(Boolean).join(' · ') + (extra ? ` (${extra})` : '')) || 'See guidance';

  return {
    name: card.name,
    purpose: card.purpose || card.why_this_injury || '',
    prescription,
    equipment: Array.isArray(card.equipment) ? card.equipment.join(', ') : (card.equipment || ''),
    intensity: d.intensity || d.load || '',
    cue: card.why_this_injury || '',
    video: 'Video placeholder',
    commonMistakes: card.cautions || [],
    alternative: null,
    painRule: STOP_FALLBACK,
    blockLabel: pretty(card.block),
    isRfBeta: true,
    betaDefaultLabel: BETA_LABEL,
    clinicalReviewStatus: 'requires_clinician_review',
    previewOnly: !!card.preview_only,
    sourceRefs: card.source_refs || [],
  };
}

/** knee stage session → existing day shape. */
function mapSession(session, friendlyName, dayNumber) {
  const cards = (session && session.cards) || [];
  if (!cards.length) {
    return {
      title: `Day ${dayNumber}`, sessionTitle: 'Rest & recovery',
      summary: 'Rest and recovery day — the knee adapts between sessions.',
      load: 'Rest', mobility: [], exercises: [], recovery: ['Rest and recovery day.'],
      completed: false, rule: 'Recovery is part of the plan.', isRfBeta: true, isRest: true,
    };
  }
  const loadingCount = cards.filter((c) => c.block !== 'warm_up' && c.block !== 'cool_down').length;
  return {
    title: `Day ${dayNumber}`,
    sessionTitle: friendlyName,
    summary: `Warm-up, ${loadingCount} exercise${loadingCount > 1 ? 's' : ''} for this stage, then cooldown & recovery.`,
    load: `${loadingCount} exercise${loadingCount > 1 ? 's' : ''}`,
    mobility: [],
    exercises: cards.map(mapCardToExercise),
    recovery: [],
    completed: false,
    rule: STOP_FALLBACK,
    isRfBeta: true,
  };
}

/**
 * @param {object} kneeOutput  runKnee() output
 * @param {object} appAssessment  the legacy assessment (for region/mechanism labels)
 * @returns {object} profile WITHOUT progress/today (caller computes those)
 */
export function kneeOutputToProfile(kneeOutput, appAssessment = {}) {
  const entity = kneeOutput.entity || kneeOutput.routing?.entity || 'patellofemoral_pain';
  const diagnosis = kneeOutput.diagnosis || {};
  const kplan = kneeOutput.plan || null;
  const referral = kneeOutput.referral || null;
  const isReferral = kneeOutput.autonomous_plan === false || (!kplan && !!referral);
  const reviewRequired = !!(kneeOutput.clinician_required || isReferral);

  // Build plan[] from stages -> weeks -> days(sessions).
  const plan = stagesToProfilePlan(kplan?.stages, mapSession);

  // Match score from routing confidence — a MATCH score, not diagnostic certainty.
  const MATCH = { high: 80, moderate: 66, low: 52 };
  const conf = kneeOutput.match_confidence_label || kneeOutput.routing?.confidence || 'low';
  const matchScore = MATCH[conf] ?? 58;
  const matchLabel = { high: 'Good match', moderate: 'Moderate match', low: 'Limited match' }[conf] || '';
  const confidenceWithheld = reviewRequired;

  const band = kneeOutput.severity_band || diagnosis.band || null;
  const gradeName = diagnosis.summary ? diagnosis.summary.replace(/\.$/, '') : (ENTITY_TITLES[entity] || 'Pattern suggested');
  const recoveryLabel = ENTITY_RECOVERY[entity] || 'Varies — clinician review';
  const timeline = describeRecoveryTimeline(kplan?.total_estimated_weeks, recoveryLabel);
  const redFlags = diagnosis.red_flags || kneeOutput.routing?.red_flags || [];

  // Compatible `rf` object so isRfBeta-gated pages read a populated state.
  const rf = {
    runtime_mode: 'development',
    clinical_approval_status: 'not_approved',
    execution_allowed_in_development: true,
    public_release_allowed: false,
    engine: 'knee',
    injury_entity: entity,
    assessment_completeness: { status: 'partial', missing_rf_items: kneeOutput.missing_core_fields || [] },
    safety: { red_flag_present: redFlags.length > 0, route: reviewRequired ? 'review' : null, pathways: referral ? [{ message: referral.message }] : [] },
    diagnosis_pattern: { pattern_id: entity, pattern_name: ENTITY_TITLES[entity] || pretty(entity), note: diagnosis.note || '' },
    severity: { band, wording: gradeName, reasons: diagnosis.flags || [], review_required: reviewRequired },
    confidence: { value: confidenceWithheld ? null : matchScore, withheld: confidenceWithheld, label: matchLabel, limited_by_missing_inputs: false },
    recovery: { wording: timeline.rfRecoveryWording, beta_display: timeline.returnRange, modifiers: [], secondary_note: timeline.recoverySecondaryNote },
    rts_readiness: kneeOutput.rts_readiness || null,
    self_tests: null,
    plan_status: isReferral ? 'review_gated' : 'generated',
    governance_trace: null,
  };

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    isRfBeta: true,
    isKneeBeta: true,
    engine: 'knee',
    injuryEntity: entity,
    rf,

    primaryRegion: appAssessment.primaryRegion || 'knee',
    regionName: 'Knee',
    injuryTitle: ENTITY_TITLES[entity] || 'Knee injury',
    exactAreaName: ENTITY_TITLES[entity] || 'Knee',
    gradeName,
    mechanism: appAssessment.mechanism || '',

    returnRange: timeline.returnRange,
    rfRecoveryWording: timeline.rfRecoveryWording,
    recoverySecondaryNote: timeline.recoverySecondaryNote,

    confidence: confidenceWithheld ? null : matchScore,
    rfConfidenceWithheld: confidenceWithheld,
    rfConfidenceLabel: matchLabel,

    rfSeverityReasons: diagnosis.flags || [],
    rfReviewRequired: reviewRequired,
    rfReviewMessage: referral?.message || null,
    rfSafetyPathways: referral ? [{ message: referral.message }] : [],
    fullAutonomousPlan: !isReferral,

    rtsReadiness: kneeOutput.rts_readiness || null,
    kneeReferral: referral || null,
    kneeRedFlags: redFlags,

    rfWithheldItems: [],
    rfGovernanceTrace: null,
    rfGapMarkers: [],
    rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',

    plan,
    aiStatus: isReferral
      ? (referral?.message || 'This pattern needs in-person assessment before a self-guided plan.')
      : 'Knee beta plan generated. Log daily and use the check-in to progress safely.',
  };
}
