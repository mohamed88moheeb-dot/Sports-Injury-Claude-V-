/**
 * lib/clinical/hamstringEngine/appAdapter/hamstringOutputToProfile.mjs
 * ---------------------------------------------------------------------------
 * Maps runHamstring() output into the SAME profile shape every existing page
 * already consumes (diagnosis, plan, plan/day, dashboard). Mirrors
 * kneeOutputToProfile so the hamstring engine feeds the existing UI with no
 * new screens. Carries the RAG evidence + retrieval provenance through so the
 * diagnosis page can surface citations.
 * ---------------------------------------------------------------------------
 */

import { stagesToProfilePlan } from '../../core/planToProfile.mjs';
import { describeRecoveryTimeline } from '../../core/recoveryWording.mjs';

const STOP_FALLBACK = 'Stop if you feel sharp pain, a pull, or symptoms that rise the next day.';
const BETA_LABEL = 'Beta default — needs review';

const pretty = (s) => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Human label for the engine's mechanism, so the diagnosis page never shows a
// mismatched generic mechanism (e.g. "Sudden sprint" for a stretch injury).
const MECHANISM_LABEL = {
  high_speed_running: 'High-speed running',
  stretch: 'Overstretch mechanism',
  gradual: 'Gradual onset',
  other: 'Mechanism unclear',
};

function mapCardToExercise(card) {
  const d = card.dosage || {};
  const sets = d.sets && d.sets !== '—' ? `${d.sets} sets` : null;
  const reps = d.reps || d.hold || d.detail || d.range || null;
  const extra = [d.intensity, d.load, d.tempo, d.target].filter(Boolean).join(', ');
  const prescription = ([sets, reps].filter(Boolean).join(' · ') + (extra ? ` (${extra})` : '')) || 'See guidance';
  return {
    name: card.name,
    purpose: card.purpose || card.why_this_injury || '',
    prescription,
    equipment: Array.isArray(card.equipment) ? card.equipment.join(', ') : (card.equipment || 'bodyweight'),
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

function mapSession(day, friendlyName, dayNumber) {
  if (day && day.is_rest) {
    return {
      title: `Day ${dayNumber}`,
      sessionTitle: 'Rest & recovery',
      summary: day.note || 'Rest and recovery day — the hamstring adapts between sessions.',
      load: 'Rest',
      mobility: [], exercises: [], recovery: [day.note || 'Rest and recovery day.'],
      completed: false, rule: 'Recovery is part of the plan.', isRfBeta: true, isRest: true,
    };
  }
  const cards = (day && day.cards) || [];
  const loadingCount = cards.filter((c) => c.block !== 'warm_up' && c.block !== 'cool_down').length;
  return {
    title: `Day ${dayNumber}`,
    sessionTitle: day?.session_number ? `${friendlyName} — session ${day.session_number}` : friendlyName,
    summary: `Warm-up, ${loadingCount} exercise${loadingCount > 1 ? 's' : ''} for this stage, then cooldown & recovery.`,
    load: `${loadingCount} exercise${loadingCount > 1 ? 's' : ''}`,
    mobility: [],
    exercises: cards.map(mapCardToExercise),
    recovery: day?.guidance || [],
    completed: false,
    rule: STOP_FALLBACK,
    isRfBeta: true,
  };
}

export function hamstringOutputToProfile(out, appAssessment = {}) {
  const dx = out.diagnosis || {};
  const isReferral = out.autonomous_plan === false;
  const reviewRequired = !!(out.review_required || isReferral);

  const plan = stagesToProfilePlan(out.plan?.stages, mapSession);
  const timeline = describeRecoveryTimeline(out.plan?.total_estimated_weeks, dx.recovery);

  const MATCH = { high: 80, moderate: 66, low: 52 };
  const matchScore = MATCH[dx.confidence] ?? 60;
  const matchLabel = { high: 'Good match', moderate: 'Moderate match', low: 'Limited match' }[dx.confidence] || '';
  const confidenceWithheld = reviewRequired;

  const rf = {
    runtime_mode: 'development',
    clinical_approval_status: 'not_approved',
    execution_allowed_in_development: true,
    public_release_allowed: false,
    engine: 'hamstring',
    injury_entity: dx.entity,
    assessment_completeness: { status: 'partial', missing_rf_items: [] },
    safety: { red_flag_present: (out.flags || []).length > 0, route: reviewRequired ? 'review' : null, pathways: isReferral ? [{ message: out.cautions?.[0] || 'In-person assessment advised.' }] : [] },
    diagnosis_pattern: { pattern_id: dx.entity, pattern_name: dx.entity_title, note: dx.reasoning || '' },
    severity: { band: dx.band, wording: dx.band_label, reasons: out.flags || [], review_required: reviewRequired },
    confidence: { value: confidenceWithheld ? null : matchScore, withheld: confidenceWithheld, label: matchLabel, limited_by_missing_inputs: false },
    recovery: { wording: timeline.rfRecoveryWording, beta_display: timeline.returnRange, modifiers: dx.recovery_drivers || [], secondary_note: timeline.recoverySecondaryNote },
    rts_readiness: out.rts_readiness || null,
    self_tests: null,
    plan_status: isReferral ? 'review_gated' : 'generated',
    governance_trace: null,
    // RAG extras surfaced for the diagnosis page:
    evidence_base: out.evidence_base || [],
    retrieval: out.retrieval || null,
    overall_confidence: out.overall_confidence || null,
    reasoning: dx.reasoning,
    plan_rationale: dx.plan_rationale || null,
    diagnosis_cite: dx.cite || [],
    generation_mode: out.mode,
  };

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    isRfBeta: true,
    isHamstringBeta: true,
    engine: 'hamstring',
    injuryEntity: dx.entity,
    rf,

    primaryRegion: appAssessment.primaryRegion || 'hamstring',
    regionName: 'Hamstrings',
    injuryTitle: dx.entity_title || 'Hamstring strain',
    exactAreaName: dx.muscle || 'Hamstring',
    gradeName: dx.band_label || dx.entity_title,
    mechanism: MECHANISM_LABEL[out.input?.mechanism] || '',

    returnRange: timeline.returnRange,
    rfRecoveryWording: timeline.rfRecoveryWording,
    recoverySecondaryNote: timeline.recoverySecondaryNote,
    planTotalWeeks: timeline.planWeeks,
    // Stage placement already encodes time-since-injury for hamstring (bucketed
    // weeks_since); no reliable day count exists, so the UI starts the bar at 0.
    daysSinceInjury: null,
    diagnosisDrivers: dx.reasoning ? [dx.reasoning] : [],
    diagnosisNote: null,

    confidence: confidenceWithheld ? null : matchScore,
    rfConfidenceWithheld: confidenceWithheld,
    rfConfidenceLabel: matchLabel,

    rfSeverityReasons: out.flags || [],
    rfReviewRequired: reviewRequired,
    rfReviewMessage: out.cautions?.[0] || null,
    rfSafetyPathways: (out.cautions || []).map((c) => ({ message: c })),
    fullAutonomousPlan: !isReferral,

    rtsReadiness: out.rts_readiness || null,
    hamstringRedFlags: out.flags || [],
    hamstringCautions: out.cautions || [],
    hamstringEvidenceBase: out.evidence_base || [],
    hamstringRetrieval: out.retrieval || null,

    rfWithheldItems: [],
    rfGovernanceTrace: null,
    rfGapMarkers: [],
    rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',

    plan,
    aiStatus: isReferral
      ? (out.cautions?.[0] || 'This pattern needs in-person assessment before a self-guided plan.')
      : 'Hamstring beta plan generated from a deterministic clinical core with retrieved evidence. Log daily and use the check-in to progress safely.',
  };
}
