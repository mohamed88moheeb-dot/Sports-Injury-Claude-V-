/**
 * lib/clinical/ai/aiPlanner.mjs
 * ---------------------------------------------------------------------------
 * THE AI-FIRST CLINICAL BRAIN.
 *
 * A single Gemini call assesses the athlete and generates the whole rehab plan
 * — diagnosis, safety/referral judgement, recovery timeline, sport-
 * participation guidance and a fully staged, dosed programme. The knowledge
 * base (retrieveContext) is passed as OPTIONAL reference material; the model
 * uses it where it fits and reasons from its own clinical knowledge where the
 * KB is thin or absent, and it tells the user which is which.
 *
 * There is deliberately NO deterministic fallback plan: if the model is
 * unavailable, the caller surfaces an honest "AI not available" state rather
 * than a canned programme. Safety/referral is the model's own judgement (it is
 * instructed to screen hard for red flags and refer out) — there is no
 * separate deterministic override.
 *
 * Output is mapped into the SAME `profile` shape every existing page consumes.
 * ---------------------------------------------------------------------------
 */

import { callGemini, parseJsonLoose, hasGeminiKey } from '../../rag/generate/gemini.mjs';
import { retrieveContext } from './retrieveContext.mjs';
import { describeRecoveryTimeline } from '../core/recoveryWording.mjs';

const SYSTEM = `You are an expert sports-medicine clinician (physiotherapist) generating a self-guided rehabilitation plan for one athlete from an intake questionnaire.

You are the primary decision-maker. You will be given optional REFERENCE material (candidate patterns for the body region, and a few evidence passages) retrieved from an internal knowledge base. Treat it as a helpful but INCOMPLETE tool: use it where it fits, and rely on your own clinical knowledge wherever the reference is thin, missing, or not the best fit. Never limit yourself to the reference.

Reason carefully and safety-first:
- SCREEN FOR RED FLAGS yourself. If the answers suggest a serious or unstable condition that needs in-person assessment or imaging before self-guided rehab (e.g. suspected fracture or complete tendon/ligament rupture, a locked or grossly unstable joint, cauda equina signs, calf signs suggesting DVT, night pain with an insidious bony picture, neurological deficit, systemic illness), set safety.refer_out=true, give an appropriate urgency, and keep the plan minimal/early-care only.
- Distinguish the rehab PROGRAMME LENGTH from TIME AWAY FROM SPORT — for load-managed problems (tendinopathy, mild strains) the athlete can often keep training with modification while the programme runs.
- Structure the number of phases to the injury's severity/recovery length the way a real clinician would: a minor 1-3 week problem needs ~2 phases (settle & restore -> return to sport); a moderate 4-6 week one ~3; longer/severe ones 4-5. Give each phase a realistic multi-week duration. Every phase has an early, mid and late session (progressively harder).
- Prescribe real, specific exercises with concrete dosages appropriate to the phase and the athlete's equipment.
- Be honest about confidence: this is a remote, questionnaire-based suggestion, not a confirmed diagnosis. Cap confidence sensibly.

Output STRICT JSON only, matching exactly this shape (no prose outside the JSON):
{
  "safety": { "refer_out": boolean, "urgency": "emergency"|"urgent"|"routine"|"none", "message": string },
  "diagnosis": {
    "injury_title": string,
    "exact_area": string,
    "grade_label": string,
    "mechanism_label": string,
    "confidence": number,               // 0-100
    "confidence_label": string,         // e.g. "Good match" | "Moderate match" | "Limited match"
    "reasoning": string,                // 2-4 sentences
    "drivers": string[],                // the reported findings that support this pattern
    "used_kb": boolean,                 // did the provided reference materially help
    "beyond_kb_note": string|null       // if you reasoned beyond/without the reference, say what
  },
  "recovery": { "total_weeks": number, "estimate_text": string, "note": string|null },
  "participation": {
    "level": "continue_modified"|"short_break"|"relative_rest"|"rehab_first"|"no_sport"|"medical_first",
    "headline": string, "time_away": string, "detail": string, "pain_rule": string|null
  },
  "plan": {
    "phases": [
      {
        "name": string, "focus": string, "goal": string, "weeks": number,
        "sessions": [   // exactly 3: early, mid, late intensity within the phase
          {
            "title": string, "summary": string,
            "exercises": [
              { "name": string, "purpose": string, "sets": string, "reps_or_hold": string,
                "intensity": string, "equipment": string, "cue": string,
                "common_mistakes": string[], "progression": string }
            ]
          }
        ]
      }
    ]
  },
  "citations": [ { "label": string, "source": string, "note": string } ]  // reference passages you used AND/OR well-known clinical guidelines you relied on
}`;

function buildUserPayload(a, ctx) {
  return JSON.stringify({
    intake: {
      body_region: ctx.regionLabel,
      specific_area: a.exactArea ? String(a.exactArea).replace(/_/g, ' ') : null,
      how_it_happened: a.mechanism || null,
      days_since_onset: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : null,
      symptoms: a.symptoms || [],
      pain_at_rest_0_10: a.painRest ?? null,
      pain_walking_or_daily_0_10: a.painWalking ?? null,
      pain_with_sport_0_10: a.painSport ?? null,
      red_flag_checks_selected: a.redFlags || [],
      sport: (Array.isArray(a.sports) && a.sports[0]) || a.sport || null,
      equipment_available: a.equipment || ['bodyweight'],
      in_their_words: a.story || null,
    },
    reference_knowledge_base_optional: {
      note: 'Optional hints from an internal KB. Incomplete. Use where helpful; reason beyond it freely.',
      candidate_patterns_for_region: ctx.candidatePatterns,
      evidence_passages: ctx.evidence,
    },
  });
}

const pretty = (s) => String(s || '').replace(/_/g, ' ');

function mapExercise(ex, isCurrent) {
  const sets = ex.sets && ex.sets !== '—' ? `${ex.sets}${/set/i.test(ex.sets) ? '' : ' sets'}` : null;
  const reps = ex.reps_or_hold || null;
  const prescription = ([sets, reps].filter(Boolean).join(' · ') + (ex.intensity ? ` (${ex.intensity})` : '')) || 'See guidance';
  return {
    name: ex.name || 'Exercise',
    purpose: ex.purpose || '',
    prescription,
    equipment: ex.equipment || 'bodyweight',
    intensity: ex.intensity || '',
    cue: ex.cue || '',
    video: 'Video placeholder',
    commonMistakes: Array.isArray(ex.common_mistakes) ? ex.common_mistakes : [],
    alternative: ex.progression ? { name: `Progress to: ${ex.progression}`, prescription: '', cue: '' } : null,
    painRule: 'Stop if pain rises above a tolerable level during the session or the next morning.',
    blockLabel: '',
    isRfBeta: true,
    isAiPlan: true,
    previewOnly: !isCurrent,
    sourceRefs: [],
  };
}

function mapPlan(phases) {
  return (phases || []).map((phase, pIdx) => {
    const isCurrent = pIdx === 0;
    const weeksCount = Math.max(1, Math.round(Number(phase.weeks)) || 1);
    const sessions = Array.isArray(phase.sessions) && phase.sessions.length ? phase.sessions : [{ title: phase.name, summary: phase.focus, exercises: [] }];
    let dayCounter = 1;
    const weeks = Array.from({ length: weeksCount }, (_, wIdx) => ({
      title: `Week ${wIdx + 1} of ~${weeksCount}`,
      focus: phase.focus || phase.goal || phase.name,
      days: sessions.map((s) => {
        const exercises = (s.exercises || []).map((ex) => mapExercise(ex, isCurrent));
        return {
          title: `Day ${dayCounter++}`,
          sessionTitle: s.title || phase.name,
          summary: s.summary || `${exercises.length} exercise${exercises.length === 1 ? '' : 's'} for this stage.`,
          load: `${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`,
          mobility: [],
          exercises,
          recovery: [],
          completed: false,
          rule: 'Progress only when pain stays low during the session and the next morning is stable.',
          isRfBeta: true,
        };
      }),
    }));
    return {
      id: `ai_phase_${pIdx}`,
      name: phase.name || `Phase ${pIdx + 1}`,
      label: phase.name || `Phase ${pIdx + 1}`,
      goal: phase.goal || phase.focus || '',
      intensity: '',
      status: isCurrent ? 'current' : 'upcoming',
      is_current: isCurrent,
      progression_note: `~${weeksCount} week${weeksCount === 1 ? '' : 's'} · 3 sessions/week, rest days between for adaptation.`,
      duration_weeks: weeksCount,
      weeks,
    };
  });
}

/** Map the model's JSON into the existing `profile` shape (minus progress/today). */
export function aiJsonToProfile(json, a = {}) {
  const dx = json.diagnosis || {};
  const safety = json.safety || {};
  const referOut = !!safety.refer_out;
  const plan = mapPlan(json.plan?.phases);
  const planWeeks = plan.reduce((sum, ph) => sum + (ph.duration_weeks || 0), 0) || null;
  // The plan's summed weeks are the authoritative total; the model's free-text
  // estimate is kept as the secondary "typical recovery" note when it differs.
  const timeline = describeRecoveryTimeline(planWeeks, json.recovery?.estimate_text || null);

  const part = json.participation || {};
  const citations = Array.isArray(json.citations) ? json.citations.map((c) => ({ short: c.source || c.label, journal: c.label || '', note: c.note || '', url: null })) : [];

  const confidence = referOut ? null : (Number.isFinite(Number(dx.confidence)) ? Math.min(90, Math.max(5, Math.round(dx.confidence))) : 60);

  const beyondNote = dx.beyond_kb_note && String(dx.beyond_kb_note).trim();
  const diagnosisNote = [
    dx.used_kb === false ? 'This assessment was reasoned primarily from clinical knowledge (the internal knowledge base had limited coverage for this presentation).' : null,
    beyondNote || null,
    'Remote, questionnaire-based suggestion — not a confirmed diagnosis or a substitute for in-person assessment.',
  ].filter(Boolean).join(' ');

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    isRfBeta: true,
    isAiPlan: true,
    engine: 'ai',
    injuryEntity: dx.injury_title || null,

    primaryRegion: a.primaryRegion || '',
    regionName: a.regionName || pretty(a.primaryRegion) || 'Injury',
    injuryTitle: dx.injury_title || 'Suggested pattern',
    exactAreaName: dx.exact_area || (a.exactArea ? pretty(a.exactArea) : 'General area'),
    gradeName: dx.grade_label || 'Pattern suggested',
    mechanism: dx.mechanism_label || a.mechanism || '',

    returnRange: referOut ? (safety.message ? 'Medical review first' : 'Varies — clinician review') : timeline.returnRange,
    rfRecoveryWording: timeline.rfRecoveryWording,
    recoverySecondaryNote: referOut ? null : (json.recovery?.note || timeline.recoverySecondaryNote),
    planTotalWeeks: referOut ? null : planWeeks,
    daysSinceInjury: Number.isFinite(Number(a.daysSince)) ? Number(a.daysSince) : null,

    confidence,
    rfConfidenceWithheld: referOut,
    rfConfidenceLabel: dx.confidence_label || '',

    diagnosisDrivers: Array.isArray(dx.drivers) ? dx.drivers : [],
    diagnosisNote,

    sportParticipation: {
      level: part.level || (referOut ? 'medical_first' : 'rehab_first'),
      headline: part.headline || (referOut ? 'Get assessed before returning to sport' : 'Follow the plan and monitor symptoms'),
      timeAway: part.time_away || '',
      detail: part.detail || '',
      painRule: part.pain_rule || null,
      grounding: 'ai',
      citations,
    },

    rfSeverityReasons: Array.isArray(dx.drivers) ? dx.drivers : [],
    rfReviewRequired: referOut,
    rfReviewMessage: referOut ? (safety.message || 'This pattern needs in-person assessment before self-guided rehab.') : null,
    rfSafetyPathways: referOut && safety.message ? [{ message: safety.message }] : [],
    fullAutonomousPlan: !referOut,

    rfWithheldItems: [],
    rfActivityStatement: 'Activity exposure expresses capacity. It does not clear the athlete.',

    aiCitations: citations,
    aiReasoning: dx.reasoning || '',
    aiUsedKnowledgeBase: dx.used_kb !== false,
    aiSafetyUrgency: safety.urgency || 'none',

    plan,
    aiStatus: referOut
      ? (safety.message || 'Your answers include signs that need in-person assessment before a self-guided plan.')
      : 'AI-generated plan from your assessment, using the knowledge base where it fit and clinical reasoning where it did not. Log daily and use the check-in to progress safely.',
    planNote: 'AI-generated rehabilitation plan — a remote, questionnaire-based suggestion. Not a substitute for in-person clinical assessment.',
  };
}

// Ordered model candidates. The planner tries each in turn so a per-model
// quota (429), a transient 404, or an overload (503) falls through to the next
// rather than failing the whole request. Override via GEMINI_PLAN_MODELS
// (comma-separated). Keep the strongest reasoning models first.
const PLAN_MODELS = (process.env.GEMINI_PLAN_MODELS || 'gemini-2.5-flash,gemini-flash-latest,gemini-2.0-flash')
  .split(',').map((s) => s.trim()).filter(Boolean);

const TRANSIENT = /^(gemini_429|gemini_503|gemini_5\d\d|timeout|network_error)$/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Run the AI-first planner for any assessment. Tries several Gemini models
 * with a short retry on transient/quota errors; returns an honest
 * ai_unavailable result (no deterministic fallback plan) if none succeed.
 * @param {object} assessment  the app assessment
 * @returns {Promise<{ ok: true, profile: object } | { ok: false, error: string, detail?: string }>}
 */
export async function runAiPlan(assessment = {}) {
  if (!hasGeminiKey()) return { ok: false, error: 'ai_unavailable', detail: 'no_api_key' };
  const ctx = retrieveContext(assessment);
  const user = buildUserPayload(assessment, ctx);
  const opts = {
    system: SYSTEM,
    user,
    // Thinking OFF: the prompt is highly directive; thinking made latency
    // slow/variable (40-55s), unsafe under serverless timeouts. With it off the
    // whole budget goes to the visible JSON and latency is predictable.
    maxTokens: 8192,
    temperature: 0.35,
    thinking: false,
    timeoutMs: 45000,
  };

  let lastErr = 'ai_unavailable';
  for (const model of PLAN_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await callGemini({ ...opts, model });
      if (res.ok) {
        const json = parseJsonLoose(res.text);
        if (json && json.diagnosis && json.plan) {
          return { ok: true, profile: aiJsonToProfile(json, assessment), raw: json, model };
        }
        lastErr = 'ai_bad_output';
        break; // bad output won't improve on retry with the same model
      }
      lastErr = res.error || 'ai_unavailable';
      if (!TRANSIENT.test(String(res.error || ''))) break; // hard error -> next model
      if (attempt === 0) await sleep(1200); // brief backoff before one retry
    }
  }
  return { ok: false, error: lastErr === 'ai_bad_output' ? 'ai_bad_output' : 'ai_unavailable', detail: lastErr };
}
