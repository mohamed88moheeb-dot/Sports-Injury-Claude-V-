/**
 * lib/clinical/rfBetaEngine/rfPlanGenerator.mjs
 * ---------------------------------------------------------------------------
 * Builds the full six-phase RF beta plan structure from the severity band, the
 * rule pack's exercise-family / activity mapping, and the RF-EX objects.
 *
 * Selection safety:
 *   - Only manual_review_required === false, non-high-caution exercises are
 *     auto-selected into active sessions.
 *   - High-caution / manual-review / hold items appear ONLY in withheld lists.
 *   - High-concern band → review-gated limited safety plan (no full autonomy).
 *   - Activity exposures are mapped separately and never grant clearance.
 * ---------------------------------------------------------------------------
 */

import { PHASES, SEVERITY_BANDS } from './types.mjs';
import { PHASE_DAY_TEMPLATES, MAX_ACTIVE_CARDS_PER_PHASE, REVIEW_GATED_MAX_CARDS } from './rfBetaPrescriptionDefaults.mjs';
import { buildSession } from './rfSessionGenerator.mjs';
import {
  loadExercise, exerciseMappingForPhase, activityMappingForPhase,
  phaseRule, loadActivity, ACTIVITY_EXPOSURE_STATEMENT
} from './rfKnowledgeLoader.mjs';
import { DEV_PHASE_EXERCISES, DEV_BLOCK_OVERRIDE } from './rfDevPhasePlan.mjs';
import { buildPatientProfile, rankPhasePool, describeRetrievalProfile } from './rfExerciseRetriever.mjs';
import { buildLsiTransitionGate } from './rfProgressTracker.mjs';

// Development mode: bypass manual_review_required / high_caution clinical gates.
// Switched on because the user explicitly requested the full exercise library be
// used without clinical-approval gating (clinical approval is a pre-release step).
const DEV_MODE = true;

/**
 * Per-day guidance (rest / protection / education / monitoring). Foundation day 1
 * leads with protection + education + minimal early exposure (RF v1.2 §10.3
 * Foundation = restore safe basic motion). Non-prescriptive, beta guidance only.
 */
function buildDayGuidance(phaseId, dayIndex, band) {
  if (band === SEVERITY_BANDS.HIGH_CONCERN) {
    return [
      'Higher-concern pattern: please seek in-person review before progressing.',
      'Only gentle, safe movement today — no loaded or high-effort work.',
      'Monitor symptoms closely; stop if anything worsens.'
    ];
  }
  if (phaseId === 'foundation' && dayIndex === 0) {
    return [
      'Relative rest and protection: avoid movements that provoke sharp pain.',
      'Education: this is the calm-and-protect phase — gentle, controlled movement only.',
      'Keep early exposure minimal: a few gentle movements are enough today.',
      'Monitor symptoms during the session and the next morning; ease off if they worsen.'
    ];
  }
  if (phaseId === 'foundation') {
    return [
      'Keep movements gentle and controlled.',
      'Monitor symptoms during the session and the next morning.'
    ];
  }
  return ['Progress only if symptoms stay calm during the session and the next morning.'];
}

const HIGH_CAUTION_CLASSES = new Set(['high_caution_sport_specific_exposure', 'hold_review_only']);
const HIGH_CAUTION_DECISIONS = new Set(['high_caution_do_not_convert_yet', 'hold_for_review']);

function isAutoSelectable(ex) {
  if (!ex) return false;
  if (ex.manual_review_required === true) return false;
  if (HIGH_CAUTION_CLASSES.has(ex.library_classification)) return false;
  if (HIGH_CAUTION_DECISIONS.has(ex.final_decision)) return false;
  return true;
}

// Equipment availability check. Bodyweight / support / assistance never block, so
// sessions are never emptied by filtering. Unknown tokens do not block (fail-open).
const FREE_EQUIPMENT = new Set(['bodyweight', 'support_optional', 'assistance', 'assistance_optional', 'wall', 'none', '']);
const EQUIPMENT_NEEDS = {
  bench: 'bench', resistance_band: 'band', band: 'band',
  dumbbell: 'gym', barbell: 'gym', machine: 'gym', cable: 'gym', gym: 'gym',
  flywheel_device: 'gym', sled: 'gym', prowler: 'gym', limb_wrap: 'gym', kettlebell: 'gym'
};
function isDoableWithEquipment(ex, available) {
  const eq = ex.equipment || [];
  if (!eq.length) return true;
  const have = new Set((available && available.length ? available : ['bodyweight']).map((x) => String(x).toLowerCase()));
  return eq.every((item) => {
    const t = String(item).toLowerCase();
    if (FREE_EQUIPMENT.has(t)) return true;
    if (t.includes('optional')) return true; // e.g. bench_or_box_optional → doable bodyweight
    if (t.includes('_or_')) return true;     // e.g. bench_or_reclined_support → floor alternative exists
    const need = EQUIPMENT_NEEDS[t];
    if (!need) return true; // unknown equipment token → do not block
    return have.has(need) || have.has('gym');
  });
}

/** Collect, for a phase, the selectable pool and the withheld list (with reasons). */
function phasePools(phaseId, { safetySubsetOnly = false, equipment = null } = {}) {
  const mappings = exerciseMappingForPhase(phaseId);
  const seen = new Set();
  const selectable = [];
  const withheld = [];

  for (const m of mappings) {
    const eligible = m.eligible_rf_ex_ids || [];
    for (const id of eligible) {
      if (seen.has(id)) continue; seen.add(id);
      const ex = loadExercise(id);
      if (isAutoSelectable(ex)) {
        if (safetySubsetOnly && !['rf_mobility_movement_restoration', 'rf_core_loading'].includes(ex.library_classification) && ex.plan_card_category !== 'activation') {
          withheld.push({ exercise_id: id, reason: 'review-gated: outside gentle safety subset for high-concern case' });
        } else if (equipment && !isDoableWithEquipment(ex, equipment)) {
          withheld.push({ exercise_id: id, reason: 'equipment_not_available' });
        } else {
          selectable.push(ex);
        }
      } else {
        withheld.push({ exercise_id: id, reason: 'not auto-selected (manual review / high caution)' });
      }
    }
    // explicit high-caution / manual-review ids are always withheld
    for (const id of [...(m.high_caution_ids || []), ...(m.manual_review_required_ids || [])]) {
      if (seen.has(id)) continue; seen.add(id);
      withheld.push({ exercise_id: id, reason: m.high_caution_ids?.includes(id) ? 'high_caution_clinician_gated' : 'manual_review_required' });
    }
  }
  return { selectable, withheld };
}

/**
 * Dev-mode pool: loads all exercises for a phase from the comprehensive dev map,
 * injects block override so the session builder can classify them correctly, and
 * applies equipment filtering. Bypasses manual_review_required / high_caution gates.
 *
 * RAG step: if a patient profile is provided, exercises within each block group
 * are ranked by clinical relevance score before being returned. The session
 * builder's rotation then naturally selects highest-priority exercises first.
 *
 * @param {string}       phaseId
 * @param {string[]|null} equipment  user's available equipment
 * @param {boolean}      isCurrent  true → no preview_only tag
 * @param {object|null}  retrievalProfile  from buildPatientProfile()
 */
function devPhasePool(phaseId, equipment, isCurrent, retrievalProfile) {
  const ids = DEV_PHASE_EXERCISES[phaseId] || [];
  const seen = new Set();
  const pool = [];
  for (const id of ids) {
    if (seen.has(id)) continue; seen.add(id);
    const ex = loadExercise(id);
    if (!ex) continue;
    if (equipment && !isDoableWithEquipment(ex, equipment)) continue;
    pool.push({
      ...ex,
      _dev_block_override: DEV_BLOCK_OVERRIDE[id] || null,
      preview_only: !isCurrent,
    });
  }

  // RAG: rank by clinical relevance when a profile is available
  if (retrievalProfile && retrievalProfile.pattern) {
    return rankPhasePool(pool, retrievalProfile, phaseId);
  }
  return pool;
}

/**
 * For non-current phases: load ALL exercises (selectable + withheld) as a
 * read-only preview pool. These are tagged preview_only so the UI can label
 * them clearly — they are not auto-prescribed, just visible to the user.
 * Falls back to an adjacent phase when a phase has zero exercises mapped.
 */
const PREVIEW_FALLBACK = { transition: 'accumulation', resilience: 'simulation' };
function phasePreviewPool(phaseId) {
  const targetPhase = PREVIEW_FALLBACK[phaseId] || phaseId;
  const mappings = exerciseMappingForPhase(targetPhase);
  const seen = new Set();
  const all = [];
  for (const m of mappings) {
    const ids = [
      ...(m.eligible_rf_ex_ids || []),
      ...(m.high_caution_ids || []),
      ...(m.manual_review_required_ids || [])
    ];
    for (const id of ids) {
      if (seen.has(id)) continue; seen.add(id);
      const ex = loadExercise(id);
      if (ex) all.push({ ...ex, preview_only: true });
    }
  }
  return all;
}

function phaseActivityExposures(phaseId) {
  return activityMappingForPhase(phaseId).map((a) => {
    const obj = loadActivity(a.activity_exposure_id);
    return {
      activity_exposure_id: a.activity_exposure_id,
      name: a.name || (obj && obj.name) || '',
      phase_or_review_state: a.phase_or_review_state,
      eligible_or_withheld: a.eligible_or_withheld,
      clearance_authority: false,
      review_required: a.review_required !== false,
      reason: a.reason || '',
      statement: ACTIVITY_EXPOSURE_STATEMENT
    };
  });
}

// Note: PHASE_ORDER is also defined below alongside PHASE_DURATION_DAYS where it is first used.

/**
 * Clinical current-phase placement from severity + capacity/tolerance signals.
 * Conservative + capacity-based (never time-based, never a clearance). High-concern
 * stays Foundation and review-gated. Autonomous placement is capped at Accumulation
 * because Transition/Simulation depend on high-caution work that needs clinician sign-off.
 */
export function determineCurrentPhase(severity, input = {}) {
  const band = severity.functional_severity_band;
  if (band === SEVERITY_BANDS.HIGH_CONCERN) return 'foundation';

  const st = input.rf_self_tests || {};
  const walk = input.walking_response;
  if (input.pain_severity_label === 'severe' || ['painful', 'unable'].includes(walk)) return 'foundation';

  const isoOk = st.isometric_hold === 'yes';
  const eccOk = st.eccentric_control === 'yes';
  const jogOk = st.jog_tolerance === 'ok';
  const runOk = st.run_tolerance === 'ok';
  const walkOk = ['none', 'mild'].includes(walk);

  if (runOk && eccOk) return 'accumulation';
  if (jogOk && isoOk) return 'accumulation';
  if (isoOk && walkOk) return 'reload';
  return 'foundation';
}

// Week pattern: 3 sessions per week, interleaved with recovery days.
const WEEK_PATTERN = ['session', 'rest', 'session', 'rest', 'session', 'rest', 'rest'];

// ─── Phase duration estimates (days) by severity band ────────────────────────
// These are clinical estimates for beta use — not evidence-graded per-phase RCTs.
// Purpose: determine which week of the current phase the patient is in, so that
// all 3 sessions this week use the correct tier (early / mid / late).
// [BETA_SESSION_COUNTS] — requires clinician review.
const PHASE_DURATION_DAYS = {
  mild:         { foundation: 14, reload: 21, accumulation: 28, transition: 14, simulation: 14, resilience: 14 },
  moderate:     { foundation: 21, reload: 28, accumulation: 28, transition: 21, simulation: 21, resilience: 14 },
  high_concern: { foundation: 35, reload: 35, accumulation: 42, transition: 28, simulation: 28, resilience: 21 },
};

// Days post-injury where NO exercise is appropriate — rest, ice, protection only.
const ACUTE_REST_DAYS = { mild: 2, moderate: 3, high_concern: 5 };

const PHASE_ORDER = ['foundation', 'reload', 'accumulation', 'transition', 'simulation', 'resilience'];

/**
 * Returns 0 (early), 1 (mid), or 2 (late) tier for the current phase,
 * based on how many days the patient is estimated to be into that phase.
 *
 * Algorithm:
 *   - Sum durations of all phases before the current one (by severity band)
 *   - Subtract from daysSince to get approximate days into current phase
 *   - Map first 1/3 → early, middle 1/3 → mid, last 1/3 → late
 *   - Clamp to 2 (late) if beyond estimated phase duration
 */
function estimatePhaseTier(currentPhaseId, daysSince, band) {
  const durations = PHASE_DURATION_DAYS[band] || PHASE_DURATION_DAYS.moderate;
  let daysBeforeCurrentPhase = 0;
  for (const ph of PHASE_ORDER) {
    if (ph === currentPhaseId) break;
    daysBeforeCurrentPhase += durations[ph] || 21;
  }
  const daysIntoPhase = Math.max(0, daysSince - daysBeforeCurrentPhase);
  const phaseDuration = durations[currentPhaseId] || 21;
  const progress = daysIntoPhase / phaseDuration;
  if (progress < 0.34) return 0; // early
  if (progress < 0.67) return 1; // mid
  return 2;                      // late
}

function buildAcuteGuidance(band) {
  return [
    'Acute rest period — no exercise today.',
    'Priority: protect the tissue. Use ice (15–20 min every 2 hours), gentle compression, and elevation.',
    'Avoid any movement that reproduces your pain.',
    band === 'high_concern'
      ? 'This pattern warrants in-person assessment — please see a clinician or physiotherapist before starting any exercise.'
      : 'See a physiotherapist when you can — they can confirm the injury, give hands-on treatment, and supervise early loading.',
  ];
}

/**
 * Builds one training week for the given phase.
 *
 * Key logic:
 *   - If still in acute rest period: all days are rest/protection, no sessions.
 *   - Otherwise: determine tier (early/mid/late) from daysSince + band.
 *   - ALL 3 sessions this week use the SAME tier. Tier advances week-by-week,
 *     not session-by-session. This ensures volume escalation is week-paced,
 *     not crammed into a single week.
 */
function buildCurrentWeek(ph, selectable, band, maxCards, options = {}) {
  const daysSince = options.daysSince ?? 7;
  const acuteThreshold = ACUTE_REST_DAYS[band] || 2;
  const isAcute = daysSince < acuteThreshold;

  const tier = isAcute ? 0 : estimatePhaseTier(ph.id, daysSince, band);

  const days = [];
  let sessionNum = 0;
  WEEK_PATTERN.forEach((type, i) => {
    if (isAcute) {
      days.push({
        day_index: i, type: 'acute_rest',
        day_label: 'Rest & protection — acute phase',
        guidance: buildAcuteGuidance(band),
        session: { day_index: i, blocks: [], cards: [] }
      });
    } else if (type === 'session' && selectable.length) {
      sessionNum++;
      // Stares 2018: minimum day 5 before any running exposure.
      // Filter running_sport_prep exercises when daysSince < 5, regardless of phase.
      // This is a safety guard — phase structure already places running in Accumulation+,
      // but this explicit gate ensures it can never appear earlier (e.g. if criteria
      // placement advances the user to Accumulation while acutely injured).
      const sessionPool = daysSince < 5
        ? selectable.filter((ex) => {
            const block = (ex._dev_block_override) || ex.library_classification;
            return block !== 'running_field_exposure' && block !== 'running_sport_prep';
          })
        : selectable;
      days.push({
        day_index: i, type: 'session',
        day_label: `${ph.friendly_name} — session ${sessionNum}`,
        guidance: buildDayGuidance(ph.id, sessionNum - 1, band),
        // All sessions this week use the same tier index — volume escalates week-by-week
        session: buildSession(sessionPool, ph.id, tier, maxCards)
      });
    } else {
      days.push({
        day_index: i, type: 'rest',
        day_label: `${ph.friendly_name} — rest & recovery`,
        guidance: ['Rest and recovery day — let the tissue adapt.', 'Gentle daily movement only; monitor symptoms.'],
        session: { day_index: i, blocks: [], cards: [] }
      });
    }
  });
  return days;
}

/**
 * Build a grade-aware dosage profile from the Bayesian confidence output.
 * Surfaces conservative guidance when the injury grade is high.
 *
 * This does NOT change the tier structure dosage fields — it provides a modifier
 * that the app and clinician can apply on top of the tier defaults. The intent:
 * a Grade 1 patient executes the tier dosage as written; a Grade 2/3 patient
 * starts at 60–70% of the prescribed load and builds to the written dosage only
 * when they are symptom-free.
 */
function buildGradeProfile(confidence, retrievalProfile) {
  // Derive grade from clinical flags when probable_subtype is unavailable.
  // Structural/complete disruption → Grade 3; Intratendinous/structural defect → Grade 2;
  // Pattern present but no high-severity flags → Grade 1.
  const flags   = new Set(confidence?.flags || []);
  const fromSubtype = retrievalProfile?.grade ?? null;
  let grade = fromSubtype;
  if (grade === null && retrievalProfile?.pattern) {
    if (flags.has('structural_tear_pattern') || flags.has('non_ambulatory')) {
      grade = 3;
    } else if (flags.has('intratendinous_suspect') || flags.has('structural_defect') ||
               (flags.has('audible_pop') && flags.has('functional_loss'))) {
      grade = 2;
    } else {
      grade = 1;
    }
  }
  const pattern = retrievalProfile?.pattern ?? null;

  if (!grade) {
    return {
      grade:     null,
      modifier:  'standard',
      note:      'Grade not determined from assessment — apply tier dosages as written.',
      guidance:  null,
    };
  }

  if (grade === 1) {
    return {
      grade:    1,
      modifier: 'standard',
      note:     'Grade 1 strain: apply tier dosages as written.',
      guidance: null,
    };
  }

  if (grade === 2) {
    return {
      grade:    2,
      modifier: 'conservative',
      note:     'Grade 2 strain: begin each new phase at 60–70% of the written load/intensity and progress to the full dosage over 2–3 sessions when symptom-free.',
      guidance: {
        load_start_pct:   65,
        load_target_pct:  100,
        sessions_to_build: 3,
        daily_checkin_sensitivity: 'amplified',
        note: 'Grade 2 injuries involve partial muscle-tendon disruption. Loading must be graduated more carefully than Grade 1. The daily check-in grade_amplification rule applies (two blocks removed on yellow, not one).',
      },
    };
  }

  // Grade 3
  return {
    grade:    3,
    modifier: 'very_conservative',
    note:     'Grade 3 / structural tear pattern: this severity requires in-person physiotherapist or surgeon involvement before progressing beyond Foundation. Do not self-manage beyond gentle mobility and isometrics.',
    guidance: {
      load_start_pct:   40,
      load_target_pct:  70,
      sessions_to_build: 6,
      daily_checkin_sensitivity: 'amplified',
      clinician_required: true,
      note: 'Grade 3 involves complete or near-complete disruption. Surgical consultation is warranted. Rehab timelines are significantly longer and must be supervised.',
    },
  };
}

export function generatePlan(severity, options = {}) {
  const band = severity.functional_severity_band;
  const equipment = options.equipment || null;
  const input = options.input || {};
  const daysSince = typeof input.days_since_injury === 'number' ? input.days_since_injury : 7;
  const fullAutonomous = band !== SEVERITY_BANDS.HIGH_CONCERN;
  const safetySubsetOnly = band === SEVERITY_BANDS.HIGH_CONCERN;

  // RAG: build patient profile from Bayesian confidence output + assessment answers.
  // Merge top-level input fields (mechanism, sport_context, sport_level, kick_tolerance,
  // age_group) with rf_self_tests so extractSportType() sees all sport signals.
  // rf_self_tests fields win on collision — they are the more precise self-report.
  const confidence = options.confidence || null;
  const rawAnswers = {
    mechanism:     input.mechanism     || undefined,
    sport_context: input.sport_context || undefined,
    sport_level:   input.sport_level   || undefined,
    kick_tolerance:input.kick_tolerance|| undefined,
    age_group:     input.age_group     || undefined,
    ...(input.rf_self_tests || {}),
  };
  const retrievalProfile = buildPatientProfile(confidence, rawAnswers);

  // Grade-aware dosage profile: surfaced in plan output so the app and clinician
  // know how conservatively to apply the tier dosages. Grade is derived from the
  // Bayesian probable_subtype field.
  const gradeProfile = buildGradeProfile(confidence, retrievalProfile);

  const currentPhaseId = determineCurrentPhase(severity, input);
  const currentIdx = PHASE_ORDER.indexOf(currentPhaseId);

  // LSI transition gate: surfaced in plan output so the app can show the patient
  // what they need to achieve before advancing to the next demanding phase.
  const lsiPercent = typeof input.rf_self_tests?.lsi_squat_percent === 'number'
    ? input.rf_self_tests.lsi_squat_percent : null;
  const transitionGate = buildLsiTransitionGate(currentPhaseId, lsiPercent);

  const phases = PHASES.map((ph, idx) => {
    const rule = phaseRule(ph.id) || {};
    const { selectable, withheld } = phasePools(ph.id, { safetySubsetOnly, equipment });
    const maxCards = safetySubsetOnly ? REVIEW_GATED_MAX_CARDS : (MAX_ACTIVE_CARDS_PER_PHASE[ph.id] || 4);

    const status = idx === currentIdx ? 'current' : idx < currentIdx ? 'earlier' : 'upcoming';

    // Dev mode: use the comprehensive dev plan that covers all 107 exercises.
    // Clinical mode (future): use phasePools() which respects manual_review / high_caution gates.
    const isCurrent = status === 'current';
    const pool = DEV_MODE
      ? devPhasePool(ph.id, equipment, isCurrent, retrievalProfile)
      : (isCurrent ? selectable : phasePreviewPool(ph.id));
    const days = buildCurrentWeek(ph, pool, band, isCurrent ? maxCards : (MAX_ACTIVE_CARDS_PER_PHASE[ph.id] || 4), { daysSince });
    const sessionCount = days.filter((d) => d.type === 'session').length;

    return {
      phase_id: ph.id,
      clinical_name: ph.clinical_name,
      friendly_name: ph.friendly_name,
      goal: rule.phase_goal || '',
      entry_conditions: rule.entry_conditions || [],
      exit_criteria: rule.exit_criteria || [],
      status, // 'current' | 'earlier' | 'upcoming'
      is_current: status === 'current',
      progression_note: status === 'upcoming' ? 'Upcoming — unlocks with progression, not active today.'
        : status === 'earlier' ? 'Earlier stage — revisit if symptoms flare.'
        : 'Start here — your current phase.',
      days,
      session_count: sessionCount,
      active_exercise_count: selectable.length,
      withheld_items: withheld,
      activity_exposures: phaseActivityExposures(ph.id),
      activity_exposure_statement: ACTIVITY_EXPOSURE_STATEMENT,
      phase_state: status === 'current' ? (sessionCount ? 'active' : 'current_review_gated') : status
    };
  });

  const currentHasSessions = (phases[currentIdx] && phases[currentIdx].session_count) > 0;

  return {
    plan_status: !fullAutonomous ? 'review_gated_limited_safety_plan'
      : currentHasSessions ? 'beta_plan_generated' : 'current_phase_review_gated',
    severity_band: band,
    current_phase_id: currentPhaseId,
    current_phase_name: (PHASES[currentIdx] || {}).friendly_name || '',
    plan_length_note: 'Phase placement is capacity-based (beta); session counts are beta defaults, not evidence-graded.',
    full_autonomous_plan: fullAutonomous,
    review_gated: !fullAutonomous,
    review_message: fullAutonomous ? null : 'This pattern needs in-person review before a full plan is offered. Only gentle, safe starting movements are shown.',
    retrieval_profile: describeRetrievalProfile(retrievalProfile),
    grade_profile: gradeProfile,
    transition_gate: transitionGate,
    phases,
    activity_exposure_statement: ACTIVITY_EXPOSURE_STATEMENT,
    withheld_summary: phases.flatMap((p) => p.withheld_items.map((w) => ({ phase: p.phase_id, ...w })))
  };
}
