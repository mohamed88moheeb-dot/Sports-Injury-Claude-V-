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

const PHASE_ORDER = PHASES.map((p) => p.id);

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

// A current-phase training week: 3 sessions interleaved with rest/recovery days.
const WEEK_PATTERN = ['session', 'rest', 'session', 'rest', 'session', 'rest', 'rest'];

function buildCurrentWeek(ph, selectable, band, maxCards) {
  const days = [];
  let sessionIdx = 0;
  WEEK_PATTERN.forEach((type, i) => {
    if (type === 'session' && selectable.length) {
      days.push({
        day_index: i, type: 'session',
        day_label: `${ph.friendly_name} — session ${sessionIdx + 1}`,
        guidance: buildDayGuidance(ph.id, sessionIdx, band),
        session: buildSession(selectable, ph.id, sessionIdx, maxCards)
      });
      sessionIdx++;
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

export function generatePlan(severity, options = {}) {
  const band = severity.functional_severity_band;
  const equipment = options.equipment || null;
  const input = options.input || {};
  const fullAutonomous = band !== SEVERITY_BANDS.HIGH_CONCERN;
  const safetySubsetOnly = band === SEVERITY_BANDS.HIGH_CONCERN;

  const currentPhaseId = determineCurrentPhase(severity, input);
  const currentIdx = PHASE_ORDER.indexOf(currentPhaseId);

  const phases = PHASES.map((ph, idx) => {
    const rule = phaseRule(ph.id) || {};
    const { selectable, withheld } = phasePools(ph.id, { safetySubsetOnly, equipment });
    const maxCards = safetySubsetOnly ? REVIEW_GATED_MAX_CARDS : (MAX_ACTIVE_CARDS_PER_PHASE[ph.id] || 4);

    const status = idx === currentIdx ? 'current' : idx < currentIdx ? 'earlier' : 'upcoming';

    // ONLY the current phase materialises a real training week (sessions + rest).
    // Other phases are visible in the pathway but not fake-scheduled.
    const days = status === 'current' ? buildCurrentWeek(ph, selectable, band, maxCards) : [];
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
    phases,
    activity_exposure_statement: ACTIVITY_EXPOSURE_STATEMENT,
    withheld_summary: phases.flatMap((p) => p.withheld_items.map((w) => ({ phase: p.phase_id, ...w })))
  };
}
