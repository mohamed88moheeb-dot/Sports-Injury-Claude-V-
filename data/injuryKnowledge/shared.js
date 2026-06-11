/**
 * shared.js
 * ---------------------------------------------------------------------------
 * Shared constants, enums, and small factory helpers used by every injury
 * knowledge file and by the rule-based engines.
 *
 * IMPORTANT POSITIONING
 * This platform does NOT provide a confirmed medical diagnosis. All language
 * here is intentionally non-definitive ("most likely pattern", "pattern
 * match", "possible alternatives", "clinical review recommended if...").
 *
 * This file contains data and small pure helpers only. It must not contain
 * UI markup. Engines (lib/injuryEngine/*) consume these structures.
 * ---------------------------------------------------------------------------
 */

/* =========================================================================
 * CONFIDENCE BANDS
 * The scoring engine converts a normalized 0–100 pattern-match score into one
 * of these bands. We never use the word "diagnosis" in the labels.
 * ========================================================================= */
export const CONFIDENCE_BANDS = [
  { id: 'low', min: 0, max: 39, label: 'Low pattern match' },
  { id: 'moderate', min: 40, max: 69, label: 'Moderate pattern match' },
  { id: 'high', min: 70, max: 85, label: 'High pattern match' },
  { id: 'very_high', min: 86, max: 100, label: 'Very high pattern match' }
];

/**
 * Return the band descriptor for a given 0–100 confidence number.
 */
export function getConfidenceBand(confidence) {
  const c = clamp(confidence, 0, 100);
  return (
    CONFIDENCE_BANDS.find((b) => c >= b.min && c <= b.max) || CONFIDENCE_BANDS[0]
  );
}

/* =========================================================================
 * RISK LEVELS
 * Attached to each subtype and possibly elevated by the safety engine.
 * ========================================================================= */
export const RISK_LEVELS = {
  low: { id: 'low', rank: 1, label: 'Low risk' },
  moderate: { id: 'moderate', rank: 2, label: 'Moderate risk' },
  high: { id: 'high', rank: 3, label: 'High risk' },
  refer: { id: 'refer', rank: 4, label: 'Clinical review recommended' }
};

/** Return the higher (more cautious) of two risk-level ids. */
export function maxRisk(a, b) {
  const ra = RISK_LEVELS[a] ? RISK_LEVELS[a].rank : 0;
  const rb = RISK_LEVELS[b] ? RISK_LEVELS[b].rank : 0;
  return ra >= rb ? a : b;
}

/* =========================================================================
 * ADAPTATION ACTIONS (used by adaptationEngine)
 * ========================================================================= */
export const ADAPTATION_ACTIONS = {
  PROGRESS: 'progress',
  REPEAT: 'repeat',
  REDUCE: 'reduce',
  REGRESS: 'regress',
  REFER: 'refer'
};

/* =========================================================================
 * GLOBAL RED FLAGS
 * These apply to every region. The safety engine checks these first and can
 * override any diagnosis/rehab output. Each flag maps to an answer key the
 * assessment may set to a truthy value.
 *
 * severity:
 *   'urgent'  -> recommend urgent / same-day medical assessment
 *   'caution' -> recommend clinical review before progressing rehab
 * ========================================================================= */
export const GLOBAL_RED_FLAGS = [
  {
    id: 'cannot_bear_weight',
    question: 'I cannot bear weight or take four steps on the injured leg.',
    severity: 'urgent',
    action:
      'Avoid loading the area and arrange an in-person assessment to rule out fracture or a severe injury.'
  },
  {
    id: 'severe_swelling',
    question: 'I have severe swelling that came on quickly.',
    severity: 'urgent',
    action:
      'Rapid severe swelling can signal significant tissue or joint injury. A clinical review is recommended before loading.'
  },
  {
    id: 'major_bruising',
    question: 'I have a large bruise that appeared quickly.',
    severity: 'caution',
    action:
      'Significant bruising can indicate a higher-grade strain or tear. Progress rehab cautiously and seek review if function is poor.'
  },
  {
    id: 'visible_deformity',
    question: 'There is a visible deformity or the area looks out of shape.',
    severity: 'urgent',
    action:
      'Visible deformity may indicate a fracture or dislocation. Seek urgent in-person medical care.'
  },
  {
    id: 'pop_with_loss_of_function',
    question:
      'I heard or felt a major pop and then could not use the area properly.',
    severity: 'urgent',
    action:
      'A pop with immediate loss of function may indicate a significant tear or rupture. A clinical review is recommended.'
  },
  {
    id: 'numbness_tingling',
    question:
      'I have numbness, tingling, or progressive weakness in the limb.',
    severity: 'urgent',
    action:
      'Nerve-type symptoms or progressive weakness should be assessed in person before continuing rehab.'
  },
  {
    id: 'chest_pain_breathless',
    question: 'I have chest pain or shortness of breath.',
    severity: 'urgent',
    action:
      'Chest pain or breathlessness is a medical emergency and is not a musculoskeletal rehab matter. Seek emergency care now.'
  },
  {
    id: 'calf_dvt_signs',
    question:
      'I have calf swelling, warmth, or redness without a clear injury.',
    severity: 'urgent',
    action:
      'These can be signs of a blood clot (DVT). Do not exercise the leg and seek urgent medical assessment.'
  },
  {
    id: 'constant_rest_night_pain',
    question:
      'Pain is constant at rest, worsening at night, or I feel feverish/unwell.',
    severity: 'caution',
    action:
      'Constant rest/night pain or feeling unwell can have non-mechanical causes and should be reviewed by a clinician.'
  }
];

/* =========================================================================
 * STANDARD PAIN RULES
 * Reusable strings so logic does not hardcode the same phrasing repeatedly.
 * ========================================================================= */
export const PAIN_RULES = {
  isometric:
    'Keep pain at or below 3/10 during the hold and back to baseline within 24 hours.',
  loading:
    'Pain up to 3/10 during the exercise is acceptable if it settles to your baseline by the next morning.',
  tendon:
    'Tendon pain up to 3–4/10 during loading is acceptable if it settles within 24 hours and does not climb session to session.',
  earlyStrain:
    'Stay below 3/10. Stop the set if you feel a sharp pull, grab, or spike in pain.',
  impact:
    'Running and impact work should stay below 2/10 with no next-morning increase in pain or stiffness.'
};

/* =========================================================================
 * GENERIC RETURN-TO-SPORT MOVEMENT DEMANDS
 * Sport-specific ladders live in each injury file; this maps a sport to the
 * movement qualities that matter, so the rehab generator can tailor the final
 * phase. Keys should match the existing `sports` list in rehabKnowledge.js.
 * ========================================================================= */
export const SPORT_DEMANDS = {
  'Football / soccer': ['sprinting', 'cutting', 'kicking', 'deceleration', 'jumping'],
  Running: ['repetitive_impact', 'endurance', 'hill_load'],
  Basketball: ['jumping', 'landing', 'cutting', 'deceleration', 'sprinting'],
  Volleyball: ['jumping', 'landing', 'overhead'],
  'Tennis / padel': ['lateral_movement', 'deceleration', 'rotation'],
  'Weight training': ['heavy_loading', 'eccentric_control'],
  Cycling: ['sustained_load', 'low_impact'],
  Swimming: ['low_impact', 'endurance'],
  CrossFit: ['heavy_loading', 'jumping', 'repetitive_impact'],
  'Martial arts': ['kicking', 'rotation', 'impact'],
  Dance: ['end_range', 'jumping', 'control'],
  'General fitness': ['general_strength', 'low_impact']
};

/* =========================================================================
 * PHASE PERIODIZATION MODEL
 * Evidence-based session dosing per phase, applied across ALL regions so the
 * scheduler can build progressive, varied, rest-spaced plans.
 *
 * Sources informing these defaults:
 *  - Adherence: 1–3 exercises early is optimal (non-adherence 50–70%).
 *  - Isometrics/mobility are low-fatigue and DAILY-capable; heavy strength
 *    needs ~48–72h between sessions on the same tissue.
 *  - Periodization: early endurance/control (high reps, low load) -> strength
 *    (lower reps, higher load) -> power/RFD -> sport.
 *
 * Fields:
 *  exercisesPerSession  [min, max] loading exercises in one session
 *  sets / reps / rpe    prescription guidance for the phase's loading work
 *  baseRestDays         rest days between LOADING sessions at phase start
 *  minRestDays          floor the rest can drop to as the person gets stronger
 *  alternatingFocus     if true, near-daily training by alternating qualities
 *  dailyMicrodose       low-load slots that may be done daily in parallel
 *  focus                one-line intent
 * ========================================================================= */
export const PHASE_PERIODIZATION = {
  protect: {
    exercisesPerSession: [6, 7],
    sets: '4–5 (holds) or 2–3 (light)',
    reps: 'Isometric holds 30–45s, or 10–15 light reps',
    rpe: 'RPE 2–4',
    baseRestDays: 2, // full loading session every ~3rd day
    minRestDays: 1,
    alternatingFocus: false,
    dailyMicrodose: ['isometric', 'mobility'],
    focus:
      'Settle symptoms; gentle isometric load on the injured tissue; keep the whole body moving with pain-free work around the injury.'
  },
  restore: {
    exercisesPerSession: [7, 8],
    sets: '3',
    reps: '10–12',
    rpe: 'RPE 4–6',
    baseRestDays: 1, // every 2nd day
    minRestDays: 1,
    alternatingFocus: false,
    dailyMicrodose: ['isometric', 'mobility', 'neuromuscular'],
    focus:
      'Restore range and control; rebuild the kinetic chain; add light global conditioning.'
  },
  capacity: {
    exercisesPerSession: [8, 10],
    sets: '3–4',
    reps: '6–8 (heavy slow resistance)',
    rpe: 'RPE 6–8',
    baseRestDays: 1,
    minRestDays: 0, // near-daily via alternating focus (48h per tissue)
    alternatingFocus: true,
    dailyMicrodose: ['mobility'],
    focus:
      'Progressive strength across the injured tissue, kinetic chain, and full body; intensity rises, volume managed.'
  },
  speed: {
    exercisesPerSession: [9, 11],
    sets: '3–5',
    reps: '3–6 explosive + maintained strength work',
    rpe: 'RPE 6–8',
    baseRestDays: 1,
    minRestDays: 1,
    alternatingFocus: true,
    dailyMicrodose: ['mobility'],
    focus:
      'Power and elastic load on the injured tissue; running/impact reintroduced; full-body conditioning near normal.'
  },
  return: {
    exercisesPerSession: [10, 12],
    sets: 'Sport-led + 2×/week maintenance strength',
    reps: 'Sport-led',
    rpe: 'RPE 7–9',
    baseRestDays: 1,
    minRestDays: 1,
    alternatingFocus: true,
    dailyMicrodose: ['mobility'],
    focus:
      'Full sport training volume with maintenance loading; sessions mirror real sport demands.'
  }
};

/* =========================================================================
 * SESSION BLUEPRINTS
 * Defines how many exercises to select from each block per phase.
 * The session scheduler reads these to build a balanced 6–12 exercise session.
 *
 * Blocks (ordered — they run top to bottom in the session):
 *   warmup        – mobility/activation, always goes first; daily-capable
 *   activation    – isometric or neural; analgesic; daily-capable
 *   targeted      – primary injured-tissue loading; needs ~48h recovery
 *   kinetic_chain – synergists / adjacent areas (glutes, calf, core, hip)
 *   global_strength – whole-body (upper body push/pull, core); offloads injury
 *   neuromuscular – balance, proprioception, control
 *   conditioning  – aerobic / running / impact exposure
 *   cooldown      – optional light stretching / breathing
 *
 * count: [min, max] exercises to pick from that block.
 * required: if true the scheduler must include at least min even if pool is small.
 * ========================================================================= */
export const SESSION_BLUEPRINTS = {
  protect: {
    totalExercises: [6, 7],
    blocks: [
      { block: 'warmup',         count: [1, 2], required: true  },
      { block: 'activation',     count: [1, 2], required: true  },
      { block: 'targeted',       count: [1, 1], required: true  },
      { block: 'kinetic_chain',  count: [1, 2], required: true  },
      { block: 'global_strength',count: [1, 1], required: true  },
      { block: 'cooldown',       count: [0, 1], required: false }
    ]
  },
  restore: {
    totalExercises: [7, 8],
    blocks: [
      { block: 'warmup',         count: [1, 2], required: true  },
      { block: 'activation',     count: [1, 1], required: true  },
      { block: 'targeted',       count: [1, 2], required: true  },
      { block: 'kinetic_chain',  count: [2, 2], required: true  },
      { block: 'global_strength',count: [1, 2], required: true  },
      { block: 'neuromuscular',  count: [0, 1], required: false }
    ]
  },
  capacity: {
    totalExercises: [8, 10],
    blocks: [
      { block: 'warmup',         count: [1, 2], required: true  },
      { block: 'activation',     count: [1, 1], required: false },
      { block: 'targeted',       count: [2, 2], required: true  },
      { block: 'kinetic_chain',  count: [2, 3], required: true  },
      { block: 'global_strength',count: [1, 2], required: true  },
      { block: 'neuromuscular',  count: [1, 1], required: true  },
      { block: 'conditioning',   count: [0, 1], required: false }
    ]
  },
  speed: {
    totalExercises: [9, 11],
    blocks: [
      { block: 'warmup',         count: [2, 2], required: true  },
      { block: 'targeted',       count: [1, 2], required: true  },
      { block: 'kinetic_chain',  count: [2, 2], required: true  },
      { block: 'global_strength',count: [1, 2], required: true  },
      { block: 'neuromuscular',  count: [1, 1], required: true  },
      { block: 'conditioning',   count: [2, 2], required: true  }
    ]
  },
  return: {
    totalExercises: [10, 12],
    blocks: [
      { block: 'warmup',         count: [2, 2], required: true  },
      { block: 'targeted',       count: [1, 2], required: true  },
      { block: 'kinetic_chain',  count: [2, 3], required: true  },
      { block: 'global_strength',count: [2, 2], required: true  },
      { block: 'neuromuscular',  count: [1, 1], required: true  },
      { block: 'conditioning',   count: [2, 3], required: true  }
    ]
  }
};

/** Slots considered low-load enough to dose daily (parallel to loading days). */
export const DAILY_CAPABLE_SLOTS = ['isometric', 'mobility'];

/**
 * Adjust rest days between loading sessions based on a green-streak.
 * Every 3 consecutive "green" check-ins drops one rest day, down to the
 * phase's minRestDays. A recent red is handled by the caller (adds a day).
 */
export function restDaysForStreak(phaseId, greenStreak = 0) {
  const cfg = PHASE_PERIODIZATION[phaseId] || PHASE_PERIODIZATION.protect;
  const drops = Math.floor((greenStreak || 0) / 3);
  return clamp(cfg.baseRestDays - drops, cfg.minRestDays, cfg.baseRestDays);
}

/* =========================================================================
 * FACTORY HELPERS
 * Small builders that enforce a consistent object shape across all data files
 * and fill sensible defaults so individual files stay readable.
 * ========================================================================= */

/**
 * Build a question definition.
 * type: 'boolean' | 'single' | 'multi' | 'scale'
 * options: for single/multi -> [{ value, label }]
 * category: 'mechanism' | 'symptom' | 'function' | 'history' | 'red_flag'
 */
export function makeQuestion(id, text, type, opts = {}) {
  return {
    id,
    text,
    type,
    category: opts.category || 'symptom',
    options: opts.options || null,
    scale: type === 'scale' ? opts.scale || { min: 0, max: 10 } : null,
    redFlagTrigger: opts.redFlagTrigger || null // optional { value, severity }
  };
}

/**
 * Build a self-test definition. Self-tests are guided, safe, and never claim
 * to confirm a diagnosis.
 * resultOptions: the discrete results a user can report, e.g.
 *   [{ value: 'pain_free', label: '...' }, { value: 'painful', label: '...' }]
 */
export function makeSelfTest(id, name, opts = {}) {
  return {
    id,
    name,
    purpose: opts.purpose || '',
    howTo: opts.howTo || [],
    resultOptions: opts.resultOptions || [
      { value: 'pain_free', label: 'No pain / felt fine' },
      { value: 'mild', label: 'Mild discomfort (1–3/10)' },
      { value: 'painful', label: 'Clearly painful (4+/10)' },
      { value: 'unable', label: 'Could not perform it' }
    ],
    capturesPain: opts.capturesPain !== false, // default true
    whatPositiveSuggests: opts.whatPositiveSuggests || '',
    whatItDoesNotProve: opts.whatItDoesNotProve || '',
    stopCriteria: opts.stopCriteria || [
      'Sharp or spiking pain',
      'Numbness, tingling, or weakness',
      'A feeling of giving way'
    ],
    doNotPerformIf: opts.doNotPerformIf || [],
    limitations: opts.limitations || ''
  };
}

/**
 * Build an exercise definition with the full required shape. Any field not
 * provided defaults to a safe/empty value so partial entries never break the
 * rehab generator.
 */
export function makeExercise(id, name, opts = {}) {
  return {
    id,
    name,
    targetRegion: opts.targetRegion || '',
    phase: opts.phase || 'protect', // protect | restore | capacity | speed | return
    /**
     * slot = the role the exercise plays in a session. Used by the session
     * scheduler to (a) decide which items can be dosed DAILY (low-load) vs
     * which need 48h recovery, and (b) build balanced, varied sessions.
     *   'isometric'     -> analgesic, low-fatigue, daily-capable
     *   'mobility'      -> low-load range/activation, daily-capable
     *   'neuromuscular' -> balance/control, frequent-capable
     *   'strength'      -> main loading lift (the session ANCHOR); needs ~48h
     *   'eccentric'     -> heavy lengthening load; needs ~48–72h
     *   'power'         -> plyometric/elastic; needs recovery, late phases
     *   'conditioning'  -> running/impact exposure; spaced
     */
    slot: opts.slot || 'strength',
    /**
     * block = the structural position of this exercise inside a session.
     * The session scheduler uses this to assemble a balanced 6–12 exercise
     * session from the phase pool:
     *   'warmup'         – light movement prep / mobility; runs first; daily-capable
     *   'activation'     – isometric or neural glide; analgesic; daily-capable
     *   'targeted'       – primary injured-tissue loading; needs ~48h recovery
     *   'kinetic_chain'  – synergist/adjacent areas (glutes, core, calf, hip)
     *   'global_strength'– upper body push/pull, whole-body strength; safe early
     *   'neuromuscular'  – balance, proprioception, control
     *   'conditioning'   – aerobic / running / impact exposure; spaced
     *   'cooldown'       – optional gentle closing work
     */
    block: opts.block || 'targeted',
    /** isAnchor = a primary loading exercise a session is usually built around. */
    isAnchor: opts.isAnchor || false,
    difficulty: opts.difficulty || 1, // 1 (easiest) .. 5 (hardest)
    equipment: opts.equipment || ['bodyweight'],
    purpose: opts.purpose || '',
    prescription: opts.prescription || '',
    cues: opts.cues || [],
    commonMistakes: opts.commonMistakes || [],
    easierAlternative: opts.easierAlternative || null, // exercise id or short label
    harderProgression: opts.harderProgression || null,
    noEquipmentAlternative: opts.noEquipmentAlternative || null,
    gymAlternative: opts.gymAlternative || null,
    avoidIf: opts.avoidIf || [],
    painRule: opts.painRule || PAIN_RULES.loading,
    progressionRule:
      opts.progressionRule ||
      'Progress when the current dose is calm during and for 24 hours after.',
    regressionRule:
      opts.regressionRule ||
      'Regress to the easier alternative if pain exceeds the pain rule or next-day symptoms increase.'
  };
}

/**
 * Build a rehab phase. exercises is a list of exercise ids that live in the
 * injury file's exerciseLibrary.
 */
export function makePhase(id, opts = {}) {
  return {
    id, // protect | restore | capacity | speed | return
    name: opts.name || id,
    goal: opts.goal || '',
    estimatedDuration: opts.estimatedDuration || '',
    entryCriteria: opts.entryCriteria || [],
    exitCriteria: opts.exitCriteria || [],
    intensityGuidance: opts.intensityGuidance || '',
    painRules: opts.painRules || PAIN_RULES.loading,
    avoid: opts.avoid || [],
    progressionCriteria: opts.progressionCriteria || [],
    regressionCriteria: opts.regressionCriteria || [],
    exercises: opts.exercises || [] // array of exercise ids
  };
}

/**
 * Build a rehab protocol (a pathway). A single injury file can expose several
 * protocols (e.g. acute strain vs tendon vs neural) and map subtypes to them.
 */
export function makeProtocol(id, opts = {}) {
  return {
    id,
    name: opts.name || id,
    summary: opts.summary || '',
    appliesToSubtypes: opts.appliesToSubtypes || [],
    phases: opts.phases || [] // array of phase objects from makePhase
  };
}

/* =========================================================================
 * SMALL PURE UTILITIES
 * ========================================================================= */
export function clamp(n, min, max) {
  if (typeof n !== 'number' || Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function round(n) {
  return Math.round(n);
}

/* =========================================================================
 * STANDARD DISCLAIMER (knowledge-layer copy; UI may override/translate)
 * ========================================================================= */
export const DISCLAIMER =
  'This is a guidance and pattern-matching tool, not a medical diagnosis. ' +
  'If symptoms are severe, worsening, or unclear, or if any red flag applies, ' +
  'seek review from a doctor or physiotherapist.';
