/**
 * lib/clinical/rfBetaEngine/rfBetaPrescriptionDefaults.mjs
 * ---------------------------------------------------------------------------
 * TEMPORARY beta session-prescription values. These are NOT in RF-EX objects
 * and NOT in the evidence rule pack (which marks dosage as a gap). Every value
 * carries BETA_META so it can never be mistaken for evidence-graded authority.
 *
 * The qualitative intensity *character* per phase is drawn from the evidence
 * rule pack (e.g. Foundation = isometric-dominant). The concrete sets/reps/rest
 * numbers are beta defaults only; where legacy values inspired a band it is
 * labelled legacy_reference_not_evidence_backed.
 * ---------------------------------------------------------------------------
 */

import { BETA_META } from './types.mjs';

// loadingType is derived from an exercise's library_classification / category.
export const LOADING_TYPES = ['isometric', 'mobility', 'core_loading', 'support_strength', 'control_balance', 'conditioning', 'running_prep'];

// Phase-day templates (beta defaults): how many days per phase a beta plan renders.
export const PHASE_DAY_TEMPLATES = {
  short: { foundation: 3, reload: 3, accumulation: 2, transition: 0, simulation: 0, resilience: 0 },
  medium: { foundation: 3, reload: 3, accumulation: 3, transition: 2, simulation: 2, resilience: 1 },
  review_gated: { foundation: 2, reload: 0, accumulation: 0, transition: 0, simulation: 0, resilience: 0 }
};

// Max ACTIVE exercise cards per session by phase (beta default). Early phases are
// deliberately minimal — Foundation is calm-and-protect, NOT a full gym session.
// A session picks at most this many cards, balanced one-per-block.
export const MAX_ACTIVE_CARDS_PER_PHASE = {
  foundation: 3, reload: 4, accumulation: 4, transition: 4, simulation: 4, resilience: 4
};
// Review-gated (high-concern) sessions are capped even lower.
export const REVIEW_GATED_MAX_CARDS = 2;

const STOP_RULE =
  'Stop if you feel sharp or spreading pain, or pain that lingers and clearly worsens the next day. (Beta monitoring default — requires clinician review.)';

// dosage[phase][loadingType] → qualitative+illustrative numbers, all beta defaults.
const DOSAGE = {
  foundation: {
    isometric: { sets: '2–3', reps_or_hold: '5 gentle holds (~5s each)', rest: 'as needed', intensity: 'very light', tempo: 'slow and controlled', frequency: 'most days' },
    mobility: { sets: '1–2', reps_or_hold: '8–10 slow reps', rest: 'as needed', intensity: 'pain-free range', tempo: 'slow', frequency: 'most days' },
    core_loading: { sets: '2', reps_or_hold: '8–10 controlled reps', rest: 'short', intensity: 'light', tempo: 'controlled', frequency: 'every other day' },
    support_strength: { sets: '2', reps_or_hold: '8–10 reps', rest: 'short', intensity: 'light', tempo: 'controlled', frequency: 'every other day' },
    control_balance: { sets: '2', reps_or_hold: '20–30s holds or 8–10 reps', rest: 'short', intensity: 'light', tempo: 'steady', frequency: 'every other day' },
    conditioning: { sets: '1', reps_or_hold: '10–15 min easy', rest: 'n/a', intensity: 'easy', tempo: 'comfortable', frequency: '2–3x/week' }
  },
  reload: {
    core_loading: { sets: '3', reps_or_hold: '8–12 reps', rest: 'moderate', intensity: 'moderate', tempo: 'controlled', frequency: 'every other day' },
    support_strength: { sets: '3', reps_or_hold: '8–12 reps', rest: 'moderate', intensity: 'moderate', tempo: 'controlled', frequency: 'every other day' },
    control_balance: { sets: '2–3', reps_or_hold: '8–10 reps', rest: 'short', intensity: 'light–moderate', tempo: 'steady', frequency: 'every other day' },
    mobility: { sets: '1–2', reps_or_hold: '8–10 slow reps', rest: 'as needed', intensity: 'pain-free range', tempo: 'slow', frequency: 'most days' },
    conditioning: { sets: '1', reps_or_hold: '15–20 min easy', rest: 'n/a', intensity: 'easy', tempo: 'comfortable', frequency: '2–3x/week' }
  },
  accumulation: {
    support_strength: { sets: '3–4', reps_or_hold: '8–12 reps', rest: 'moderate', intensity: 'moderate', tempo: 'controlled', frequency: '2–3x/week' },
    core_loading: { sets: '3', reps_or_hold: '8–12 reps', rest: 'moderate', intensity: 'moderate', tempo: 'controlled', frequency: '2–3x/week' },
    conditioning: { sets: '1', reps_or_hold: '20+ min easy', rest: 'n/a', intensity: 'easy–moderate', tempo: 'comfortable', frequency: '2–3x/week' }
  }
};

const LEGACY_NOTE =
  'legacy_reference_not_evidence_backed: legacy data/injuryKnowledge/quadriceps.js phase RPE bands inspired the qualitative intensity wording; the numbers here are beta defaults, not adopted as evidence.';

/**
 * Beta dosage for a phase + loading type. Returns null when no beta dosage is
 * defined (e.g. running_prep is reviewer-gated and not auto-dosed in beta).
 */
export function getBetaDosage(phaseId, loadingType) {
  const base = (DOSAGE[phaseId] && DOSAGE[phaseId][loadingType]) || null;
  if (!base) return null;
  return {
    ...base,
    stop_rule: STOP_RULE,
    source_note: `Beta default for phase "${phaseId}" / loading "${loadingType}". ${LEGACY_NOTE}`,
    ...BETA_META
  };
}

export function betaStopRule() { return STOP_RULE; }
