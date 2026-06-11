/**
 * lib/injuryEngine/adaptationEngine.js
 * ---------------------------------------------------------------------------
 * Daily check-in adaptation logic using a green / yellow / red model.
 *
 * Green  -> progress
 * Yellow -> repeat or reduce
 * Red    -> regress or refer
 *
 * The engine reads a check-in object and returns a structured action plus the
 * concrete modifications the app should apply to the current plan. It does not
 * mutate the plan itself (the caller applies the modifications), keeping this
 * function pure and testable.
 *
 * Public function: adaptPlanFromCheckin(plan, checkin)
 * ---------------------------------------------------------------------------
 */

import { ADAPTATION_ACTIONS } from '../../data/injuryKnowledge';

/**
 * @param {object} plan    the current rehab plan (from generateRehabPlan)
 * @param {object} checkin
 *   {
 *     painDuring: 0-10,
 *     painAfter: 0-10,
 *     painNextMorning: 0-10,
 *     stiffnessNextMorning: 0-10,
 *     swelling: 'none'|'mild'|'worse',
 *     bruising: 'none'|'new'|'spreading',
 *     confidence: 0-10,
 *     walkingQuality: 'normal'|'limp'|'hard',
 *     symptomsSpread: boolean,
 *     numbnessTingling: boolean,
 *     exerciseTooEasyOrHard: 'tooEasy'|'aboutRight'|'tooHard'
 *   }
 *
 * @returns {object}
 *   {
 *     action: 'progress'|'repeat'|'reduce'|'regress'|'refer',
 *     zone: 'green'|'yellow'|'red',
 *     explanation: string,
 *     modifications: { volumeAdjustment, holdProgression, addRestDay, regressPhase },
 *     exercisesToSwap: [{ exerciseId, to }],
 *     volumeAdjustment: number,   // multiplier, e.g. 0.8 = reduce 20%
 *     safetyWarning: string|null
 *   }
 */
export function adaptPlanFromCheckin(plan, checkin = {}) {
  const c = normalizeCheckin(checkin);

  // ---- RED: refer (safety-critical signals) -------------------------------
  // New neurological symptoms or spreading symptoms override everything.
  if (c.numbnessTingling || c.symptomsSpread) {
    return result({
      action: ADAPTATION_ACTIONS.REFER,
      zone: 'red',
      explanation:
        'You reported new numbness/tingling or symptoms spreading. Stop the current plan and seek a clinical review before continuing.',
      volumeAdjustment: 0,
      modifications: { regressPhase: true, addRestDay: true, holdProgression: true },
      safetyWarning:
        'New nerve-type symptoms or spreading pain should be assessed in person.'
    });
  }

  // ---- RED: regress (clear overload / worsening) --------------------------
  const redByPain = c.painDuring >= 6 || c.painNextMorning >= 6;
  const redBySwelling = c.swelling === 'worse' || c.bruising === 'spreading';
  const redByFunction = c.walkingQuality === 'hard';

  if (redByPain || redBySwelling || redByFunction) {
    return result({
      action: ADAPTATION_ACTIONS.REGRESS,
      zone: 'red',
      explanation: redExplanation({ redByPain, redBySwelling, redByFunction }),
      volumeAdjustment: 0.5,
      modifications: { regressPhase: true, addRestDay: true, holdProgression: true },
      exercisesToSwap: swapAllToEasier(plan),
      safetyWarning:
        redBySwelling || redByFunction
          ? 'If swelling, bruising, or difficulty walking continues or worsens, seek a clinical review.'
          : null
    });
  }

  // ---- YELLOW: repeat / reduce (moderate signals) -------------------------
  const yellowByPain =
    (c.painDuring >= 4 && c.painDuring <= 5) ||
    (c.painNextMorning >= 3 && c.painNextMorning <= 5);
  const yellowByStiffness = c.stiffnessNextMorning >= 4;
  const yellowBySwelling = c.swelling === 'mild' || c.bruising === 'new';
  const yellowByConfidence = c.confidence <= 4;
  const yellowByTooHard = c.exerciseTooEasyOrHard === 'tooHard';

  if (
    yellowByPain ||
    yellowByStiffness ||
    yellowBySwelling ||
    yellowByConfidence ||
    yellowByTooHard
  ) {
    const reduce = yellowByPain || yellowByStiffness || yellowByTooHard;
    return result({
      action: reduce ? ADAPTATION_ACTIONS.REDUCE : ADAPTATION_ACTIONS.REPEAT,
      zone: 'yellow',
      explanation: yellowExplanation({
        yellowByPain,
        yellowByStiffness,
        yellowBySwelling,
        yellowByConfidence,
        yellowByTooHard
      }),
      volumeAdjustment: reduce ? 0.8 : 1,
      modifications: {
        holdProgression: true,
        addRestDay: false,
        regressPhase: false
      },
      // Swap only the exercises the user found too hard (caller knows which).
      exercisesToSwap: yellowByTooHard ? swapHardestToEasier(plan) : []
    });
  }

  // ---- GREEN: progress ----------------------------------------------------
  const tooEasy = c.exerciseTooEasyOrHard === 'tooEasy';
  return result({
    action: ADAPTATION_ACTIONS.PROGRESS,
    zone: 'green',
    explanation: tooEasy
      ? 'Everything stayed calm and the session felt easy — you can progress load/volume this session.'
      : 'Everything stayed calm with no next-day worsening — you can progress as planned.',
    volumeAdjustment: tooEasy ? 1.1 : 1.0,
    modifications: {
      holdProgression: false,
      addRestDay: false,
      regressPhase: false,
      progressLoad: true
    }
  });
}

/* -------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

function normalizeCheckin(checkin) {
  return {
    painDuring: num(checkin.painDuring),
    painAfter: num(checkin.painAfter),
    painNextMorning: num(checkin.painNextMorning),
    stiffnessNextMorning: num(checkin.stiffnessNextMorning),
    swelling: checkin.swelling || 'none',
    bruising: checkin.bruising || 'none',
    confidence: num(checkin.confidence, 7),
    walkingQuality: checkin.walkingQuality || 'normal',
    symptomsSpread: Boolean(checkin.symptomsSpread),
    numbnessTingling: Boolean(checkin.numbnessTingling),
    exerciseTooEasyOrHard: checkin.exerciseTooEasyOrHard || 'aboutRight'
  };
}

/** Build a uniform result object, filling defaults. */
function result(partial) {
  return {
    action: partial.action,
    zone: partial.zone,
    explanation: partial.explanation,
    modifications: partial.modifications || {},
    exercisesToSwap: partial.exercisesToSwap || [],
    volumeAdjustment:
      typeof partial.volumeAdjustment === 'number' ? partial.volumeAdjustment : 1,
    safetyWarning: partial.safetyWarning || null
  };
}

function redExplanation({ redByPain, redBySwelling, redByFunction }) {
  const parts = [];
  if (redByPain) parts.push('pain was high during the session or the next morning');
  if (redBySwelling) parts.push('swelling or bruising increased');
  if (redByFunction) parts.push('walking became difficult');
  return (
    'We are stepping back because ' +
    parts.join(' and ') +
    '. Recovery is not always linear — regress to the earlier phase, add a rest day, and rebuild gently.'
  );
}

function yellowExplanation(flags) {
  const parts = [];
  if (flags.yellowByPain) parts.push('moderate pain');
  if (flags.yellowByStiffness) parts.push('next-morning stiffness');
  if (flags.yellowBySwelling) parts.push('a little swelling/bruising');
  if (flags.yellowByConfidence) parts.push('lower confidence');
  if (flags.yellowByTooHard) parts.push('the session felt too hard');
  return (
    'Holding at this level because of ' +
    parts.join(', ') +
    '. Repeat the session (and reduce volume if it felt hard) rather than progressing today.'
  );
}

/** Suggest swapping every current-phase exercise to its easier alternative. */
function swapAllToEasier(plan) {
  const phase = currentPhase(plan);
  if (!phase) return [];
  return (phase.exercises || [])
    .filter((e) => e && e.easierAlternative)
    .map((e) => ({ exerciseId: e.id, to: e.easierAlternative }));
}

/**
 * For "too hard" yellow days, suggest swapping the hardest exercises (highest
 * difficulty) in the current phase to their easier alternatives.
 */
function swapHardestToEasier(plan) {
  const phase = currentPhase(plan);
  if (!phase || !Array.isArray(phase.exercises)) return [];
  const maxDifficulty = phase.exercises.reduce(
    (m, e) => Math.max(m, e.difficulty || 1),
    1
  );
  return phase.exercises
    .filter((e) => (e.difficulty || 1) === maxDifficulty && e.easierAlternative)
    .map((e) => ({ exerciseId: e.id, to: e.easierAlternative }));
}

function currentPhase(plan) {
  if (!plan || !Array.isArray(plan.phases)) return null;
  return plan.phases.find((p) => p.isCurrent) || plan.phases[0] || null;
}

function num(v, fallback = 0) {
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback;
}
