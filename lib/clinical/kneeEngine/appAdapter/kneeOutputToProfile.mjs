/**
 * lib/clinical/kneeEngine/appAdapter/kneeOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * Transforms knee engine output into the EXISTING RecoveryContext `profile`
 * shape so the existing diagnosis/dashboard/plan/week/day/check-in pages
 * render it natively — no parallel UI. Mirrors quadOutputToProfile.mjs.
 *
 * Pure + boundary-clean (imports nothing). Produces the same structure the
 * RF/quad adapters do — profile.plan[].weeks[].days[].exercises[] — PLUS a
 * compatible `rf` object and `isRfBeta: true` so every isRfBeta-gated
 * page/branch works unchanged. Knee-specific extras (entity, referral) are
 * added as additive fields.
 * ---------------------------------------------------------------------------
 */

const BETA_LABEL = 'Beta testing default — not evidence-graded; requires clinician review before production use.';
const STOP_FALLBACK = 'Stop if you feel sharp or spreading pain, locking, or a sense the knee is giving way.';

const pretty = (s) => (s ? String(s).replace(/_/g, ' ') : '');

const ENTITY_TITLES = {
  acl_injury: 'Anterior cruciate ligament (ACL) injury',
  pcl_injury: 'Posterior cruciate ligament (PCL) injury',
  mcl_injury: 'Medial collateral ligament (MCL) injury',
  lcl_plc_injury: 'Lateral collateral / posterolateral corner injury',
  meniscus_tear: 'Meniscal tear',
  patellofemoral_pain: 'Patellofemoral pain (anterior knee pain)',
  patellar_instability: 'Patellar instability / dislocation',
  knee_osteoarthritis: 'Knee osteoarthritis',
  itb_syndrome: 'Iliotibial band syndrome',
  osgood_schlatter: 'Osgood-Schlatter (tibial-tubercle apophysitis)',
};

/** knee session card → existing exercise shape consumed by /plan/day. */
function mapCardToExercise(card) {
  const d = card.dosage || {};
  const sets = d.sets && d.sets !== '—' ? `${d.sets} sets` : null;
  const reps = d.reps || d.hold || d.detail || d.reps_or_hold || null;
  const rest = d.rest ? `rest ${d.rest}` : null;
  const extra = [d.intensity, d.load, d.tempo, d.range, d.target].filter(Boolean).join(', ');
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

/** knee session → existing day shape. */
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

  // ── Special case: extensor-mechanism tendon handoff — should be pre-empted by
  // quadCompatibility before reaching here, but handled defensively. ─────────
  if (kneeOutput.handoff) {
    return {
      id: Date.now(), createdAt: new Date().toISOString(),
      isRfBeta: true, isKneeBeta: true, engine: 'knee', injuryEntity: entity,
      rf: { runtime_mode: 'development', clinical_approval_status: 'not_approved', execution_allowed_in_development: true, public_release_allowed: false, engine: 'knee', injury_entity: entity, assessment_completeness: { status: 'partial', missing_rf_items: [] }, safety: { red_flag_present: false, route: null, pathways: [] }, diagnosis_pattern: { pattern_id: entity, pattern_name: 'Kneecap / quad tendon', note: kneeOutput.handoff.reason || '' }, severity: { band: null, wording: '', reasons: [], review_required: false }, confidence: { value: null, withheld: true, label: '', limited_by_missing_inputs: true }, recovery: { wording: '', beta_display: '', modifiers: [] }, self_tests: null, plan_status: 'review_gated', governance_trace: null },
      primaryRegion: appAssessment.primaryRegion || 'knee', regionName: 'Knee',
      injuryTitle: 'Kneecap / quad tendon', exactAreaName: kneeOutput.handoff.reason || '', gradeName: 'Pattern suggested',
      mechanism: appAssessment.mechanism || '', returnRange: 'Varies — clinician review', rfRecoveryWording: '',
      confidence: null, rfConfidenceWithheld: true, rfConfidenceLabel: '', rfSeverityReasons: [],
      rfReviewRequired: false, rfReviewMessage: kneeOutput.handoff.reason || null, rfSafetyPathways: [],
      fullAutonomousPlan: false, rfWithheldItems: [], rfGovernanceTrace: null, rfGapMarkers: [],
      rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',
      kneeEntity: entity, kneeReferral: null, kneeDiagnosisSummary: kneeOutput.handoff.reason || '',
      plan: [], aiStatus: 'This selection is handled by the quadriceps tendon pathway — please reselect the tendon area.',
      planNote: 'Knee beta plan — beta dosage defaults, not evidence-graded; requires clinician review before production use.',
    };
  }

  const diagnosis = kneeOutput.diagnosis || {};
  const kplan = kneeOutput.plan || null;
  const referral = kneeOutput.referral || null;
  const isReferral = kneeOutput.autonomous_plan === false;

  // ── Build plan[] from stages -> weeks -> days(sessions). ──────────────────
  let dayCounter = 1;
  const plan = (kplan?.stages || []).map((stage) => {
    const days = (stage.sessions || []).map((s) => mapSession(s, stage.friendly_name || stage.stage_name, dayCounter++));
    return {
      id: stage.stage_id,
      name: stage.stage_name,
      label: stage.friendly_name || stage.stage_name,
      goal: stage.friendly_name || '',
      intensity: '',
      status: stage.status || 'upcoming',
      is_current: !!stage.is_current,
      progression_note: '',
      weeks: [{ title: 'Week 1', focus: stage.friendly_name || stage.stage_name, days }],
    };
  });

  const band = kneeOutput.severity_band || diagnosis.band || null;
  const reviewRequired = !!(kneeOutput.clinician_required || isReferral || (diagnosis.red_flags || []).length);

  // Match score from the routing confidence (how well answers fit the pathway).
  // This is a MATCH score, not a diagnostic certainty — capped < 85 like RF/quad.
  const MATCH = { high: 80, moderate: 66, low: 52 };
  const matchScore = MATCH[kneeOutput.routing?.confidence] ?? 60;
  const matchLabel = { high: 'Good match', moderate: 'Moderate match', low: 'Limited match' }[kneeOutput.routing?.confidence] || '';
  const confidenceWithheld = reviewRequired;
  const gradeName = diagnosis.summary
    ? diagnosis.summary.replace(/\.$/, '')
    : ENTITY_TITLES[entity] || 'Pattern suggested';

  // Compatible `rf` object so isRfBeta-gated pages read a populated state.
  const rf = {
    runtime_mode: 'development',
    clinical_approval_status: 'not_approved',
    execution_allowed_in_development: true,
    public_release_allowed: false,
    engine: 'knee',
    injury_entity: entity,
    assessment_completeness: { status: 'partial', missing_rf_items: [] },
    safety: { red_flag_present: reviewRequired, route: reviewRequired ? 'review' : null, pathways: referral ? [{ message: referral.message }] : [] },
    diagnosis_pattern: { pattern_id: entity, pattern_name: ENTITY_TITLES[entity] || pretty(entity), note: diagnosis.note || '' },
    severity: { band, wording: gradeName, reasons: diagnosis.flags || [], review_required: reviewRequired },
    confidence: { value: confidenceWithheld ? null : matchScore, withheld: confidenceWithheld, label: matchLabel, limited_by_missing_inputs: false },
    recovery: { wording: '', beta_display: 'Varies — clinician review', modifiers: [] },
    self_tests: null,
    plan_status: isReferral ? 'review_gated' : 'generated',
    governance_trace: null,
  };

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    isRfBeta: true,        // reuse all beta rendering/branches
    isKneeBeta: true,      // additive: identifies the knee engine
    engine: 'knee',
    injuryEntity: entity,
    rf,

    primaryRegion: appAssessment.primaryRegion || 'knee',
    regionName: 'Knee',
    injuryTitle: ENTITY_TITLES[entity] || 'Knee injury',
    exactAreaName: diagnosis.summary || ENTITY_TITLES[entity] || 'Knee',
    gradeName,
    mechanism: appAssessment.mechanism || '',

    returnRange: 'Varies — clinician review',
    rfRecoveryWording: '',

    confidence: confidenceWithheld ? null : matchScore,
    rfConfidenceWithheld: confidenceWithheld,
    rfConfidenceLabel: matchLabel,

    rfSeverityReasons: diagnosis.flags || [],
    rfReviewRequired: reviewRequired,
    rfReviewMessage: referral?.message || null,
    rfSafetyPathways: referral ? [{ message: referral.message }] : [],
    fullAutonomousPlan: !isReferral,

    rfWithheldItems: [],
    rfGovernanceTrace: null,
    rfGapMarkers: [],
    rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',

    // Knee-specific additive fields (rendered by small additive lines).
    kneeEntity: entity,
    kneeReferral: referral || null,
    kneeDiagnosisSummary: diagnosis.summary || '',

    plan,
    aiStatus: isReferral
      ? (referral?.message || 'This pattern needs in-person assessment before any rehab plan.')
      : 'Knee beta plan. Start gently, log daily, and use the check-in to adjust today only.',
    planNote: 'Knee beta plan — beta dosage defaults, not evidence-graded; requires clinician review before production use.',
  };
}
