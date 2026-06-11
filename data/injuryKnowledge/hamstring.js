/**
 * hamstring.js
 * ---------------------------------------------------------------------------
 * Knowledge model for hamstring / posterior-thigh injuries.
 *
 * Structure (consistent across all injury files):
 *   id, name, shortDescription, anatomyRegions, detailedAreas,
 *   injurySubtypes, assessmentQuestions, selfTests, redFlags,
 *   diagnosisRules, rehabProtocols, exerciseLibrary, returnToSport,
 *   maintenancePlan
 *
 * diagnosisRules drive the rule-based scoring engine. Each rule lists weighted
 * conditions that ADD or SUBTRACT points for a subtype based on the user's
 * answers, chosen area, and self-test results. The engine normalizes the raw
 * score into a 0–100 pattern-match number and never claims certainty.
 * ---------------------------------------------------------------------------
 */

import {
  makeQuestion,
  makeSelfTest,
  makeExercise,
  makePhase,
  makeProtocol,
  PAIN_RULES
} from './shared';

/* -------------------------------------------------------------------------
 * SUBTYPES
 * Each subtype carries a default riskLevel and the rehab pathway it maps to.
 * ------------------------------------------------------------------------- */
const injurySubtypes = [
  {
    id: 'hamstring_muscle_belly_strain',
    name: 'Hamstring muscle belly strain',
    riskLevel: 'moderate',
    rehabPathway: 'acute_muscle_strain',
    note: 'Most common pattern after sprinting or sudden acceleration.'
  },
  {
    id: 'proximal_hamstring_tendon_pain',
    name: 'Proximal (high) hamstring tendon pain',
    riskLevel: 'moderate',
    rehabPathway: 'proximal_tendon',
    note: 'Pain near the sitting bone, often worse with sitting and hinging.'
  },
  {
    id: 'distal_hamstring_irritation',
    name: 'Distal hamstring irritation (near the knee)',
    riskLevel: 'low',
    rehabPathway: 'acute_muscle_strain',
    note: 'Lower hamstring/tendon irritation close to the back of the knee.'
  },
  {
    id: 'biceps_femoris_lateral_strain',
    name: 'Biceps femoris (lateral hamstring) strain',
    riskLevel: 'moderate',
    rehabPathway: 'acute_muscle_strain',
    note: 'Outer posterior thigh; the most commonly strained hamstring muscle.'
  },
  {
    id: 'semitendinosus_medial_strain',
    name: 'Semitendinosus (medial hamstring) strain',
    riskLevel: 'moderate',
    rehabPathway: 'acute_muscle_strain',
    note: 'Inner posterior thigh strain pattern.'
  },
  {
    id: 'semimembranosus_deep_medial_strain',
    name: 'Semimembranosus (deep medial) strain',
    riskLevel: 'moderate',
    rehabPathway: 'acute_muscle_strain',
    note: 'Deep inner thigh; often from over-stretch mechanisms.'
  },
  {
    id: 'neural_tension_posterior_thigh',
    name: 'Neural tension pattern (posterior thigh)',
    riskLevel: 'moderate',
    rehabPathway: 'neural_tension',
    note: 'Symptoms behave like nerve sensitivity rather than a pure muscle strain.'
  },
  {
    id: 'posterior_chain_overload',
    name: 'Posterior chain overload / tightness',
    riskLevel: 'low',
    rehabPathway: 'overload',
    note: 'Load-sensitive tightness without a clear tear event.'
  },
  {
    id: 'severe_hamstring_tear_risk',
    name: 'Possible higher-grade hamstring tear',
    riskLevel: 'refer',
    rehabPathway: 'severe_risk',
    note: 'Features suggesting a more significant tear; clinical review recommended.'
  }
];

/* -------------------------------------------------------------------------
 * ANATOMY
 * anatomyRegions matches the existing region id in rehabKnowledge.js.
 * ------------------------------------------------------------------------- */
const anatomyRegions = ['hamstring'];

const detailedAreas = [
  { id: 'back_biceps_femoris', name: 'Outer posterior thigh (biceps femoris)' },
  { id: 'back_semitendinosus', name: 'Inner posterior thigh (semitendinosus)' },
  { id: 'back_semimembranosus', name: 'Deep inner posterior thigh (semimembranosus)' },
  { id: 'proximal_hamstring_sitting_bone', name: 'High hamstring / sitting bone' },
  { id: 'mid_hamstring_belly', name: 'Mid hamstring belly' },
  { id: 'distal_hamstring_near_knee', name: 'Lower hamstring near the knee' },
  { id: 'lateral_hamstring', name: 'Lateral hamstring' },
  { id: 'medial_hamstring', name: 'Medial hamstring' },
  { id: 'diffuse_posterior_thigh', name: 'Diffuse / whole posterior thigh' }
];

/* -------------------------------------------------------------------------
 * ASSESSMENT QUESTIONS
 * ------------------------------------------------------------------------- */
const assessmentQuestions = [
  makeQuestion('mechanism', 'How did the pain start?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'sprinting', label: 'Sprinting or accelerating' },
      { value: 'overstretch', label: 'Over-stretching (e.g. high kick, splits, slide)' },
      { value: 'kicking', label: 'Kicking' },
      { value: 'heavy_hinge', label: 'Heavy hinge / deadlift' },
      { value: 'gradual', label: 'Gradually, no single event' }
    ]
  }),
  makeQuestion('onset', 'Was it sudden or gradual?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'sudden_sharp', label: 'Sudden, sharp pull' },
      { value: 'gradual', label: 'Gradual build-up' }
    ]
  }),
  makeQuestion('pop', 'Did you feel or hear a pop?', 'boolean', {
    category: 'mechanism'
  }),
  makeQuestion('continue_sport', 'Could you keep playing/training afterwards?', 'single', {
    category: 'function',
    options: [
      { value: 'yes', label: 'Yes, with little trouble' },
      { value: 'reduced', label: 'Only at reduced effort' },
      { value: 'no', label: 'No, I had to stop' }
    ]
  }),
  makeQuestion('walking', 'How is walking now?', 'single', {
    category: 'function',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'limp', label: 'I limp a little' },
      { value: 'hard', label: 'Difficult / cannot walk far' }
    ]
  }),
  makeQuestion('bruising_swelling', 'Any bruising or swelling?', 'single', {
    category: 'symptom',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'significant', label: 'Significant / spreading' }
    ]
  }),
  makeQuestion('sitting_pain', 'Is it painful to sit on a firm surface?', 'boolean', {
    category: 'symptom'
  }),
  makeQuestion('forward_bend_pain', 'Does bending forward / hinging reproduce it?', 'boolean', {
    category: 'symptom'
  }),
  makeQuestion('radiates_below_knee', 'Does pain travel below the knee?', 'boolean', {
    category: 'red_flag'
  }),
  makeQuestion('numbness_tingling', 'Any numbness or tingling?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'urgent' }
  }),
  makeQuestion('previous_hamstring', 'Have you injured this hamstring before?', 'boolean', {
    category: 'history'
  })
];

/* -------------------------------------------------------------------------
 * SELF-TESTS
 * ------------------------------------------------------------------------- */
const selfTests = [
  makeSelfTest('walking_tolerance', 'Walking tolerance', {
    purpose: 'Gauge how the hamstring tolerates basic daily loading.',
    howTo: ['Walk normally for ~20–30 metres.', 'Note pain level and any limp.'],
    whatPositiveSuggests: 'Pain or a limp suggests the strain is still reactive.',
    whatItDoesNotProve: 'Comfortable walking does not rule out a strain at speed.'
  }),
  makeSelfTest('bridge_hold', 'Double-leg bridge hold', {
    purpose: 'Low-level isometric load to the hamstrings and glutes.',
    howTo: ['Lie on your back, knees bent.', 'Lift hips and hold 15–20 seconds.'],
    whatPositiveSuggests: 'Posterior-thigh pain confirms hamstring load sensitivity.',
    whatItDoesNotProve: 'A calm bridge does not confirm readiness for sprinting.'
  }),
  makeSelfTest('single_leg_bridge', 'Single-leg bridge tolerance', {
    purpose: 'Higher isometric demand on one hamstring.',
    howTo: ['From a bridge, extend one leg.', 'Hold on the injured side 10–15 seconds.'],
    whatPositiveSuggests: 'Clear pain or weakness suggests an active strain.',
    whatItDoesNotProve: 'Does not grade the injury or rule out tendon involvement.',
    doNotPerformIf: ['You cannot perform a basic double-leg bridge without pain.']
  }),
  makeSelfTest('resisted_knee_flexion', 'Resisted knee flexion', {
    purpose: 'Loads the hamstring as a knee flexor.',
    howTo: [
      'Sit or lie face-down.',
      'Gently try to bend the knee against light resistance (hand or band).'
    ],
    whatPositiveSuggests: 'Pain reproduced here points to muscle/tendon strain.',
    whatItDoesNotProve: 'Cannot localize the exact muscle or grade.'
  }),
  makeSelfTest('hip_hinge_tolerance', 'Gentle hip hinge tolerance', {
    purpose: 'Tests lengthening load through a hinge pattern.',
    howTo: ['Stand tall.', 'Hinge hips back a small amount, keep the back long.'],
    whatPositiveSuggests: 'Pain on lengthening suggests reactive hamstring tissue.',
    whatItDoesNotProve: 'A calm hinge does not confirm sprint readiness.'
  }),
  makeSelfTest('active_knee_extension', 'Active knee extension tolerance', {
    purpose: 'Screens hamstring length sensitivity and neural tension.',
    howTo: [
      'Lie on your back, hip bent to 90°.',
      'Slowly straighten the knee toward the ceiling.'
    ],
    whatPositiveSuggests: 'A tight, painful end-range can reflect strain or neural tension.',
    whatItDoesNotProve: 'Cannot separate muscle from nerve on its own.'
  }),
  makeSelfTest('sitting_pain_screen', 'Sitting pain screen (proximal tendon)', {
    purpose: 'Screens for high hamstring tendon compression sensitivity.',
    howTo: ['Sit on a firm surface for 5–10 minutes.', 'Note pain right at the sitting bone.'],
    whatPositiveSuggests: 'Sitting-bone pain points to proximal hamstring tendon pain.',
    whatItDoesNotProve: 'Does not exclude a muscle-belly strain elsewhere.'
  }),
  makeSelfTest('neural_tension_screen', 'Gentle neural tension screen', {
    purpose: 'Cautiously screens for nerve sensitivity in the posterior thigh.',
    howTo: [
      'Sit tall.',
      'Slowly straighten one knee while gently tucking the chin.',
      'Note any pulling/tingling down the back of the thigh or below the knee.'
    ],
    whatPositiveSuggests: 'Symptoms that travel or tingle suggest a neural component.',
    whatItDoesNotProve: 'Is a screen only; it cannot confirm a nerve diagnosis.',
    stopCriteria: [
      'Any shooting pain below the knee',
      'Numbness, tingling, or weakness',
      'Symptoms that linger after stopping'
    ]
  })
];

/* -------------------------------------------------------------------------
 * REGION-SPECIFIC RED FLAGS (in addition to GLOBAL_RED_FLAGS)
 * ------------------------------------------------------------------------- */
const redFlags = [
  {
    id: 'hamstring_avulsion_signs',
    triggerAnswers: [
      { questionId: 'pop', value: true },
      { questionId: 'bruising_swelling', value: 'significant' },
      { questionId: 'walking', value: 'hard' }
    ],
    requireCount: 2,
    severity: 'urgent',
    message:
      'A pop with significant bruising and difficulty walking can indicate a higher-grade tear or tendon avulsion. A clinical review and possibly imaging are recommended.'
  },
  {
    id: 'hamstring_sciatic_referral',
    triggerAnswers: [
      { questionId: 'radiates_below_knee', value: true },
      { questionId: 'numbness_tingling', value: true }
    ],
    requireCount: 1,
    severity: 'urgent',
    message:
      'Pain travelling below the knee with numbness or tingling suggests nerve involvement and should be assessed before loading.'
  }
];

/* -------------------------------------------------------------------------
 * DIAGNOSIS RULES (weights consumed by scoringEngine)
 * condition types:
 *   'area'     -> exactArea is in value (array) | equals value (string)
 *   'answer'   -> answers[questionId] equals value (or includes for multi)
 *   'selfTest' -> selfTests[testId].result equals result
 * Each condition may carry a `reason` shown in the output when it fires.
 * ------------------------------------------------------------------------- */
const diagnosisRules = [
  {
    subtypeId: 'hamstring_muscle_belly_strain',
    conditions: [
      { type: 'area', value: ['mid_hamstring_belly', 'back_biceps_femoris', 'diffuse_posterior_thigh'], points: 25, reason: 'Pain location matches the mid/posterior hamstring belly.' },
      { type: 'answer', questionId: 'mechanism', value: 'sprinting', points: 20, reason: 'Mechanism was sprinting/acceleration.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: 12, reason: 'Sudden, sharp onset is typical of a strain.' },
      { type: 'answer', questionId: 'pop', value: true, points: 8, reason: 'A pop was felt.' },
      { type: 'selfTest', testId: 'resisted_knee_flexion', result: 'painful', points: 15, reason: 'Symptoms reproduced with resisted knee flexion.' },
      { type: 'answer', questionId: 'sitting_pain', value: true, points: -10, reason: 'Sitting-bone pain points more to a tendon pattern.' },
      { type: 'answer', questionId: 'radiates_below_knee', value: true, points: -12, reason: 'Pain below the knee points more to a neural pattern.' }
    ]
  },
  {
    subtypeId: 'proximal_hamstring_tendon_pain',
    conditions: [
      { type: 'area', value: ['proximal_hamstring_sitting_bone'], points: 28, reason: 'Pain is at the high hamstring / sitting bone.' },
      { type: 'answer', questionId: 'sitting_pain', value: true, points: 22, reason: 'Pain with sitting is characteristic of proximal tendon load.' },
      { type: 'answer', questionId: 'forward_bend_pain', value: true, points: 14, reason: 'Hinging/forward-bend reproduces the pain.' },
      { type: 'answer', questionId: 'onset', value: 'gradual', points: 12, reason: 'Gradual onset fits a tendon pattern.' },
      { type: 'selfTest', testId: 'sitting_pain_screen', result: 'painful', points: 16, reason: 'Sitting pain screen was positive at the sitting bone.' },
      { type: 'answer', questionId: 'mechanism', value: 'sprinting', points: -6, reason: 'A clear sprint event fits a belly strain more than a tendon pattern.' }
    ]
  },
  {
    subtypeId: 'distal_hamstring_irritation',
    conditions: [
      { type: 'area', value: ['distal_hamstring_near_knee'], points: 28, reason: 'Pain is low, near the back of the knee.' },
      { type: 'answer', questionId: 'mechanism', value: 'heavy_hinge', points: 10, reason: 'Heavy hinge loading can irritate the distal hamstring.' },
      { type: 'selfTest', testId: 'resisted_knee_flexion', result: 'painful', points: 12, reason: 'Resisted knee flexion reproduces symptoms low down.' }
    ]
  },
  {
    subtypeId: 'biceps_femoris_lateral_strain',
    conditions: [
      { type: 'area', value: ['lateral_hamstring', 'back_biceps_femoris'], points: 26, reason: 'Pain is in the outer (lateral) hamstring.' },
      { type: 'answer', questionId: 'mechanism', value: 'sprinting', points: 18, reason: 'Sprinting commonly loads biceps femoris.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: 10, reason: 'Sudden onset fits a strain.' }
    ]
  },
  {
    subtypeId: 'semitendinosus_medial_strain',
    conditions: [
      { type: 'area', value: ['medial_hamstring', 'back_semitendinosus'], points: 26, reason: 'Pain is in the inner (medial) hamstring.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: 10, reason: 'Sudden onset fits a strain.' }
    ]
  },
  {
    subtypeId: 'semimembranosus_deep_medial_strain',
    conditions: [
      { type: 'area', value: ['back_semimembranosus', 'medial_hamstring'], points: 24, reason: 'Pain is deep and medial.' },
      { type: 'answer', questionId: 'mechanism', value: 'overstretch', points: 16, reason: 'Over-stretch mechanism commonly involves semimembranosus.' }
    ]
  },
  {
    subtypeId: 'neural_tension_posterior_thigh',
    conditions: [
      { type: 'answer', questionId: 'radiates_below_knee', value: true, points: 24, reason: 'Pain travels below the knee.' },
      { type: 'answer', questionId: 'numbness_tingling', value: true, points: 20, reason: 'Numbness/tingling suggests a neural component.' },
      { type: 'selfTest', testId: 'neural_tension_screen', result: 'painful', points: 18, reason: 'Neural tension screen reproduced travelling symptoms.' },
      { type: 'area', value: ['diffuse_posterior_thigh'], points: 8, reason: 'Diffuse symptoms can fit a neural pattern.' },
      { type: 'answer', questionId: 'mechanism', value: 'sprinting', points: -8, reason: 'A clear sprint strain event fits muscle injury more.' }
    ]
  },
  {
    subtypeId: 'posterior_chain_overload',
    conditions: [
      { type: 'answer', questionId: 'mechanism', value: 'gradual', points: 22, reason: 'Gradual, load-related onset.' },
      { type: 'answer', questionId: 'onset', value: 'gradual', points: 14, reason: 'No single tear event.' },
      { type: 'answer', questionId: 'pop', value: true, points: -15, reason: 'A pop argues against simple overload.' },
      { type: 'answer', questionId: 'bruising_swelling', value: 'significant', points: -12, reason: 'Significant bruising argues against simple overload.' }
    ]
  },
  {
    subtypeId: 'severe_hamstring_tear_risk',
    conditions: [
      { type: 'answer', questionId: 'pop', value: true, points: 18, reason: 'A pop can accompany a higher-grade tear.' },
      { type: 'answer', questionId: 'bruising_swelling', value: 'significant', points: 20, reason: 'Significant/spreading bruising raises tear concern.' },
      { type: 'answer', questionId: 'walking', value: 'hard', points: 18, reason: 'Marked difficulty walking suggests a more significant injury.' },
      { type: 'answer', questionId: 'continue_sport', value: 'no', points: 10, reason: 'Immediate inability to continue suggests a more significant injury.' }
    ]
  }
];

/* -------------------------------------------------------------------------
 * EXERCISE LIBRARY (referenced by id in protocols)
 *
 * Organised into 8 session blocks following the "train the whole athlete"
 * model used at elite sports facilities. A session draws 6–12 exercises
 * across these blocks, scaled by phase. The sessionScheduler picks from
 * this pool using SESSION_BLUEPRINTS.
 *
 * Blocks used here:
 *   warmup         – light movement prep; always first; daily-capable
 *   activation     – isometric / neural; analgesic; daily-capable
 *   targeted       – hamstring-specific loading; needs ~48h
 *   kinetic_chain  – glutes, core, hip, calf, lumbopelvic
 *   global_strength– upper body push/pull; safe even in acute phase
 *   neuromuscular  – balance, proprioception
 *   conditioning   – aerobic / running
 *   cooldown       – gentle closing
 * ------------------------------------------------------------------------- */
const exerciseLibrary = [

  /* ======================================================================
   * WARMUP BLOCK  (daily-capable; go first in every session)
   * ====================================================================== */
  makeExercise('ham_warm_leg_swing', 'Standing leg swings', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Warm up the hip and posterior chain through pain-free range.',
    prescription: '2 x 10 swings each direction per leg',
    cues: ['Hold a wall for balance', 'Let the leg swing freely — do not force range'],
    commonMistakes: ['Swinging into pain', 'Kicking instead of swinging'],
    easierAlternative: 'Small-range pendulum swings',
    harderProgression: 'ham_warm_hip_circle',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Sharp pain at end range swing'],
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('ham_warm_hip_circle', 'Hip circles and high knee march', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Prime the hip, lumbopelvic, and posterior chain before loading.',
    prescription: '2 x 10 reps each leg',
    cues: ['Slow controlled circles', 'Drive knee to hip height on march'],
    commonMistakes: ['Rushing through'],
    easierAlternative: 'ham_warm_leg_swing',
    harderProgression: 'ham_warm_walk_lunge',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('ham_warm_walk_lunge', 'Walking lunge with torso rotation', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Warm up hip flexors, glutes, and thoracic mobility simultaneously.',
    prescription: '2 x 8 steps each leg',
    cues: ['Step long', 'Rotate towards the front knee', 'Upright torso'],
    commonMistakes: ['Leaning forward', 'Knee caving inward'],
    easierAlternative: 'ham_warm_hip_circle',
    harderProgression: 'Dynamic stretch complex',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Acute hamstring pain > 4/10 with hip flexion'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_warm_ankle_mob', 'Ankle circles and calf raises (warm-up)', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Warm up the distal kinetic chain; prime the calf and ankle for loading.',
    prescription: '2 x 10 circles each direction + 10 calf raises',
    cues: ['Full circle both ways', 'Heels fully off the ground on rises'],
    commonMistakes: ['Skipping this if calf feels fine'],
    easierAlternative: 'Same, seated',
    harderProgression: 'ham_kc_calf_raise',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),

  /* ======================================================================
   * ACTIVATION BLOCK  (daily-capable; analgesic; precede loading)
   * ====================================================================== */
  makeExercise('ham_iso_heeldig', 'Heel-dig hamstring isometric', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Calm pain and gently load the hamstring without lengthening it.',
    prescription: '5 x 20 sec',
    cues: ['Press the heel gently into the floor', 'No cramping or sharp pull'],
    commonMistakes: ['Pushing too hard too soon'],
    easierAlternative: 'Shorter 10-second holds',
    harderProgression: 'ham_bridge_hold',
    noEquipmentAlternative: 'Same exercise (bodyweight)',
    gymAlternative: 'Seated leg-curl isometric at light load',
    avoidIf: ['Sharp pain on gentle pressure'],
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('ham_iso_seated', 'Seated isometric knee flexion', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Pain-free hamstring activation in a supported seated position.',
    prescription: '5 x 15–20 sec each side',
    cues: ['Sit tall', 'Press the heel back into the chair/floor lightly', 'No sharp pull'],
    commonMistakes: ['Pressing too hard'],
    easierAlternative: 'ham_iso_heeldig',
    harderProgression: 'ham_bridge_hold',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Proximal/sitting-bone pain on sitting'],
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('ham_glute_squeeze', 'Supine glute squeeze and activation', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Wake up the glutes and posterior chain before loading; gentle co-activation.',
    prescription: '3 x 10 slow squeezes (3 sec hold each)',
    cues: ['Lie on back, knees bent', 'Squeeze glutes firmly but no cramping', 'Tilt pelvis slightly'],
    commonMistakes: ['Holding breath'],
    easierAlternative: 'Gentle seated glute squeeze',
    harderProgression: 'ham_kc_glute_bridge',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  // Neural-tension specific activation
  makeExercise('ham_neural_slider', 'Gentle neural glide (sciatic)', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Gently desensitize neural tissue without provoking symptoms.',
    prescription: '2 x 8 slow, pain-free reps',
    cues: ['Move in and out of mild tension only', 'No travelling or lingering symptoms'],
    commonMistakes: ['Pushing into tingling'],
    easierAlternative: 'Reduce range further',
    harderProgression: 'ham_active_knee_ext',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Same exercise',
    avoidIf: ['Symptoms travel below the knee', 'Any numbness/tingling'],
    painRule: 'Keep this symptom-free. Stop if anything travels or tingles.'
  }),

  /* ======================================================================
   * TARGETED BLOCK  (hamstring-specific loading; needs ~48h recovery)
   * ====================================================================== */
  makeExercise('ham_bridge_hold', 'Glute bridge hold', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'targeted', slot: 'isometric', isAnchor: true,
    equipment: ['bodyweight'],
    purpose: 'Build comfortable posterior-chain isometric tolerance with hip extension.',
    prescription: '4 x 20–30 sec',
    cues: ['Ribs down', 'Hips level', 'Drive through the heels'],
    commonMistakes: ['Arching the lower back', 'Letting hips drop'],
    easierAlternative: 'ham_iso_heeldig',
    harderProgression: 'ham_long_lever_bridge',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Machine hip extension hold',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('ham_long_lever_bridge', 'Long-lever bridge', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'strength', isAnchor: true,
    equipment: ['bodyweight'],
    purpose: 'Increase hamstring demand by lengthening the lever through hip extension.',
    prescription: '3 x 8–10 slow reps',
    cues: ['Move slowly', 'Stop if the hamstring grabs', 'Heels further than standard bridge'],
    commonMistakes: ['Going too fast', 'Heels too far out too soon'],
    easierAlternative: 'ham_bridge_hold',
    harderProgression: 'ham_single_leg_bridge',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Light seated leg curl',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_single_leg_bridge', 'Single-leg bridge', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'strength', isAnchor: true,
    equipment: ['bodyweight'],
    purpose: 'Unilateral posterior-chain loading; identifies side-to-side strength differences.',
    prescription: '3 x 8 each leg',
    cues: ['Opposite leg fully extended', 'Drive through the working heel', 'Hips level'],
    commonMistakes: ['Pelvis drop on non-working side', 'Compensating with lumbar extension'],
    easierAlternative: 'ham_long_lever_bridge',
    harderProgression: 'ham_slider_curl',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Single-leg leg-curl machine',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_slider_curl', 'Assisted hamstring slider', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 3,
    block: 'targeted', slot: 'eccentric', isAnchor: true,
    equipment: ['bodyweight', 'towel'],
    purpose: 'Introduce light eccentric control through knee flexion.',
    prescription: '3 x 5–6 reps',
    cues: ['Slide out slowly (2–3 sec)', 'Assist the return with the other leg or arms'],
    commonMistakes: ['Sliding too far early', 'Fast uncontrolled lowering'],
    easierAlternative: 'ham_long_lever_bridge',
    harderProgression: 'ham_rdl',
    noEquipmentAlternative: 'Bridge walkout (small steps)',
    gymAlternative: 'Nordic curl machine (high assistance)',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_active_knee_ext', 'Supine active knee extension', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Restore pain-free hamstring length and neural comfort.',
    prescription: '3 x 8 slow reps',
    cues: ['Hip at 90°', 'Straighten the knee slowly to comfortable range', 'Stop well before pain'],
    commonMistakes: ['Forcing end range'],
    easierAlternative: 'ham_neural_slider',
    harderProgression: 'ham_rdl',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_good_morning_bw', 'Bodyweight good morning', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Hip hinge pattern; loads hamstrings through lengthening under control.',
    prescription: '3 x 10 slow reps',
    cues: ['Hinge at the hips not waist', 'Soft knees', 'Back stays neutral throughout'],
    commonMistakes: ['Rounding the back', 'Bending knees too much'],
    easierAlternative: 'ham_bridge_hold',
    harderProgression: 'ham_rdl',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Proximal tendon irritation in early phase'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_rdl', 'Romanian deadlift (RDL)', {
    targetRegion: 'hamstring', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'strength', isAnchor: true,
    equipment: ['dumbbells', 'barbell'],
    purpose: 'Build strength through a controlled lengthening load — the primary hamstring strength exercise.',
    prescription: '4 x 6–8 reps',
    cues: ['Slow 3-sec lower', 'Strong hip drive to return', 'No sharp stretch at the bottom'],
    commonMistakes: ['Rounding the back', 'Going too heavy too soon', 'Knees drifting in'],
    easierAlternative: 'ham_good_morning_bw',
    harderProgression: 'ham_sl_rdl_bw',
    noEquipmentAlternative: 'ham_sl_rdl_bw',
    gymAlternative: 'Barbell RDL',
    avoidIf: ['Acute strain within the first 5 days'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_sl_rdl_bw', 'Single-leg RDL (bodyweight)', {
    targetRegion: 'hamstring', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Unilateral hamstring strength + proprioception challenge.',
    prescription: '3 x 8 each leg',
    cues: ['Hinge at the hip', 'Back leg floats for balance', 'Slow and controlled'],
    commonMistakes: ['Hip rotating outward', 'Losing balance and rushing'],
    easierAlternative: 'ham_rdl',
    harderProgression: 'ham_nordic',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Single-leg DB RDL',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_nordic', 'Assisted Nordic hamstring lower', {
    targetRegion: 'hamstring', phase: 'capacity', difficulty: 4,
    block: 'targeted', slot: 'eccentric', isAnchor: true,
    equipment: ['anchor', 'partner'],
    purpose: 'High-value eccentric strength — the most evidence-supported exercise for hamstring injury prevention.',
    prescription: '3 x 3–5 reps (use hands to assist return)',
    cues: ['Control the lower over 3–5 seconds', 'Catch with hands before hitting floor', 'Start with short range'],
    commonMistakes: ['Dropping instead of controlling', 'Too much volume too soon'],
    easierAlternative: 'ham_slider_curl',
    harderProgression: 'Full Nordic curl (no assistance)',
    noEquipmentAlternative: 'ham_slider_curl',
    gymAlternative: 'Nordic bench / GHR',
    avoidIf: ['Any sharp posterior-thigh pain during the lower'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_seated_leg_curl', 'Seated leg curl machine', {
    targetRegion: 'hamstring', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['gym_machine'],
    purpose: 'Isolated hamstring strength through full range in a controlled setting.',
    prescription: '4 x 8–10 reps',
    cues: ['Full range of motion', '3-sec lowering phase', 'No jerking'],
    commonMistakes: ['Half-reps', 'Too much weight too soon'],
    easierAlternative: 'ham_long_lever_bridge',
    harderProgression: 'ham_nordic',
    noEquipmentAlternative: 'ham_slider_curl',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — GLUTES  (synergist; every session)
   * ====================================================================== */
  makeExercise('ham_kc_glute_bridge', 'Glute bridge (rhythmic reps)', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Activate and strengthen gluteus maximus — the primary hip extensor partner to the hamstring.',
    prescription: '3 x 12 reps',
    cues: ['Full hip extension at the top', 'Squeeze glutes hard', 'Controlled lower'],
    commonMistakes: ['Half extension', 'Using lower back instead of glutes'],
    easierAlternative: 'ham_glute_squeeze',
    harderProgression: 'ham_kc_hip_thrust',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_kc_hip_thrust', 'Hip thrust (bodyweight / weighted)', {
    targetRegion: 'glutes', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight', 'bench'],
    purpose: 'High-range glute max activation; complements hamstring loading for posterior chain strength.',
    prescription: '3 x 10–12 reps',
    cues: ['Upper back on bench', 'Drive hips to full extension', 'Chin tuck'],
    commonMistakes: ['Arching lumbar instead of extending at the hip', 'Too much ankle dorsiflexion'],
    easierAlternative: 'ham_kc_glute_bridge',
    harderProgression: 'Barbell hip thrust',
    noEquipmentAlternative: 'ham_kc_glute_bridge',
    gymAlternative: 'Barbell hip thrust',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_kc_clamshell', 'Clamshell', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight', 'band'],
    purpose: 'Activate gluteus medius — critical for hip stability and reducing hamstring compensatory load.',
    prescription: '3 x 15 each side',
    cues: ['Keep feet together', 'Rotate from the hip not the waist', 'Top position hold 1 sec'],
    commonMistakes: ['Rolling the pelvis back', 'Foot lifting off the ground'],
    easierAlternative: 'ham_glute_squeeze',
    harderProgression: 'ham_kc_lateral_band',
    noEquipmentAlternative: 'Same (no band)',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_kc_lateral_band', 'Lateral band walk', {
    targetRegion: 'glutes', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['band'],
    purpose: 'Strengthen hip abductors in a functional stance; builds medial knee stability.',
    prescription: '3 x 12 steps each direction',
    cues: ['Stay low in a slight squat', 'Toes forward', 'Step wide, bring feet together — don\'t let the band pull them in'],
    commonMistakes: ['Standing too upright', 'Narrow steps'],
    easierAlternative: 'ham_kc_clamshell',
    harderProgression: 'Monster walk (band at feet)',
    noEquipmentAlternative: 'Side-stepping squat without band',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_kc_step_down', 'Step-down (single-leg eccentric squat)', {
    targetRegion: 'glutes', phase: 'capacity', difficulty: 3,
    block: 'kinetic_chain', slot: 'eccentric', isAnchor: false,
    equipment: ['bodyweight', 'step'],
    purpose: 'Eccentric quad/glute control; mirrors the deceleration demand in sprinting.',
    prescription: '3 x 8–10 each leg',
    cues: ['Slow 3-sec lower', 'Knee tracks over second toe', 'Tap the floor lightly — don\'t sit into it'],
    commonMistakes: ['Knee caving in', 'Dropping too fast'],
    easierAlternative: 'ham_kc_hip_thrust',
    harderProgression: 'Bulgarian split squat',
    noEquipmentAlternative: 'Slow bodyweight lunge',
    avoidIf: ['Significant knee pain'],
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — CORE / LUMBOPELVIC
   * ====================================================================== */
  makeExercise('ham_kc_dead_bug', 'Dead bug', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Build anti-extension core stability — protects the lumbar spine and reduces hamstring compensatory demand.',
    prescription: '3 x 6–8 each side',
    cues: ['Lower back flat into floor throughout', 'Breathe out as arm/leg lowers', 'Slow and controlled'],
    commonMistakes: ['Lower back arching up', 'Moving too fast', 'Holding the breath'],
    easierAlternative: 'Arm-only or leg-only dead bug',
    harderProgression: 'ham_kc_bird_dog',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_kc_bird_dog', 'Bird dog', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Lumbopelvic stability in a functional position; trains anti-rotation and trunk control.',
    prescription: '3 x 8 each side',
    cues: ['No rotation at the hip or shoulder', 'Extend arm and opposite leg fully', '2-sec hold at extension'],
    commonMistakes: ['Hip hiking', 'Rotating the torso'],
    easierAlternative: 'ham_kc_dead_bug',
    harderProgression: 'Bird dog with band resistance',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_kc_plank', 'Front plank', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Whole-body anterior-chain endurance; builds trunk stiffness for force transfer in running.',
    prescription: '3 x 20–40 sec',
    cues: ['Straight line from head to heel', 'Squeeze glutes and abs', 'Breathe normally'],
    commonMistakes: ['Hips too high or sagging', 'Holding breath'],
    easierAlternative: 'Knee plank',
    harderProgression: 'ham_kc_side_plank',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('ham_kc_side_plank', 'Side plank', {
    targetRegion: 'core', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Anti-lateral flexion core strength; reduces hip drop during running stride.',
    prescription: '3 x 20–30 sec each side',
    cues: ['Hips stacked', 'Top hip does not sag', 'Keep neck neutral'],
    commonMistakes: ['Hip rotation forward', 'Shortened hold on the weaker side'],
    easierAlternative: 'ham_kc_plank',
    harderProgression: 'Side plank with hip abduction',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('ham_kc_back_ext', 'Prone back extension (superman)', {
    targetRegion: 'lower_back', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Strengthen lumbar extensors and gluteus maximus — reduces lower back strain during hamstring loading.',
    prescription: '3 x 10 (3-sec hold at top)',
    cues: ['Lift to comfortable range only', 'Squeeze glutes at top', 'No neck strain'],
    commonMistakes: ['Over-extending the lower back', 'Hands behind head pulling neck'],
    easierAlternative: 'Prone hip extension (one leg at a time)',
    harderProgression: 'Back extension on bench',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — CALF / ACHILLES  (distal chain)
   * ====================================================================== */
  makeExercise('ham_kc_calf_raise', 'Bilateral calf raise', {
    targetRegion: 'calf', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Strengthen the calf-Achilles complex — critical link in the posterior chain and sprint mechanism.',
    prescription: '3 x 15 reps',
    cues: ['Full range — all the way up and fully down', 'Control the lower', 'Hold wall for balance only'],
    commonMistakes: ['Partial range', 'Letting heels drop too fast'],
    easierAlternative: 'Seated calf raise',
    harderProgression: 'ham_kc_sl_calf',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_kc_sl_calf', 'Single-leg calf raise', {
    targetRegion: 'calf', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'eccentric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Unilateral calf loading — identifies asymmetry; builds Achilles resilience for running.',
    prescription: '3 x 10–12 each leg (3-sec lower)',
    cues: ['Full range', 'Slow eccentric lower', 'Use fingertip wall-touch for balance only'],
    commonMistakes: ['Pushing off the other foot secretly', 'No eccentric control'],
    easierAlternative: 'ham_kc_calf_raise',
    harderProgression: 'Off-step single-leg calf raise',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — HIP FLEXOR  (antagonist; critical for hamstring balance)
   * ====================================================================== */
  makeExercise('ham_kc_hip_flex_stretch', 'Kneeling hip flexor stretch', {
    targetRegion: 'hip_flexors', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Release hip flexor tension that restricts hip extension and overloads the hamstring.',
    prescription: '3 x 30–45 sec each side',
    cues: ['Posterior pelvic tilt to feel the stretch', 'Upright torso', 'No lower back arch'],
    commonMistakes: ['Arching lower back instead of tilting pelvis', 'Leaning forward'],
    easierAlternative: 'Supine hip flexor stretch',
    harderProgression: 'ham_kc_couch_stretch',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Gentle stretch only — no sharp pulling.'
  }),
  makeExercise('ham_kc_couch_stretch', 'Couch stretch (rectus femoris)', {
    targetRegion: 'hip_flexors', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight', 'wall'],
    purpose: 'Deep rectus femoris and hip flexor release — key for athletes with anterior hip tightness.',
    prescription: '2 x 45–60 sec each side',
    cues: ['Foot against wall, knee on floor', 'Upright torso', 'Drive hip forward gently'],
    commonMistakes: ['Excessive lumbar arch', 'Rushing the hold'],
    easierAlternative: 'ham_kc_hip_flex_stretch',
    harderProgression: 'Couch stretch with hip abduction',
    noEquipmentAlternative: 'Doorframe version',
    painRule: 'Stretch, not pain.'
  }),

  /* ======================================================================
   * GLOBAL STRENGTH BLOCK  (upper body / whole body; safe in ALL phases)
   * ====================================================================== */
  makeExercise('ham_gs_pushup', 'Push-up', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 2,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Maintain upper-body push strength; keeps the whole athlete training even when the leg is resting.',
    prescription: '3 x 8–12 reps',
    cues: ['Straight line head to heel', 'Full range of motion', 'Elbows 45° to body'],
    commonMistakes: ['Sagging hips', 'Partial range', 'Head forward'],
    easierAlternative: 'Incline push-up',
    harderProgression: 'Slow lowering push-up / weighted push-up',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Pain-free. Stop if lower limb position causes hamstring aggravation.'
  }),
  makeExercise('ham_gs_band_row', 'Resistance band row', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 1,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['band'],
    purpose: 'Upper-back and posterior shoulder strength; counterbalances push and maintains posture during rehab.',
    prescription: '3 x 12–15 reps',
    cues: ['Anchor band at chest height', 'Squeeze shoulder blades together', 'No torso rocking'],
    commonMistakes: ['Using momentum', 'Shrugging the shoulders'],
    easierAlternative: 'Light band pull-apart',
    harderProgression: 'DB bent-over row',
    noEquipmentAlternative: 'Towel row against door',
    painRule: 'No lower-limb loading — seated version if needed early.'
  }),
  makeExercise('ham_gs_band_pull_apart', 'Band pull-apart', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 1,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['band'],
    purpose: 'Shoulder-health exercise; easy upper-body work that can be done standing or seated.',
    prescription: '3 x 15 reps',
    cues: ['Arms straight', 'Pull band to chest level', 'Squeeze rhomboids at the end'],
    commonMistakes: ['Bending elbows', 'No controlled return'],
    easierAlternative: 'Smaller range pull-apart',
    noEquipmentAlternative: 'No alternative (band required)',
    painRule: 'Comfortable. No lower-limb load.'
  }),
  makeExercise('ham_gs_db_press', 'Dumbbell shoulder press', {
    targetRegion: 'upper_body', phase: 'restore', difficulty: 2,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['dumbbells'],
    purpose: 'Overhead pressing strength; maintains upper-body power during lower-limb rehab.',
    prescription: '3 x 10 reps',
    cues: ['Seated for stability', 'Core tight', 'Full range overhead'],
    commonMistakes: ['Arching lower back', 'Partial range'],
    harderProgression: 'Standing press',
    noEquipmentAlternative: 'Pike push-up',
    avoidIf: ['Shoulder injury'],
    painRule: 'Comfortable. Seated to protect lower limb.'
  }),

  /* ======================================================================
   * NEUROMUSCULAR BLOCK  (balance, proprioception, control)
   * ====================================================================== */
  makeExercise('ham_nm_sl_stand', 'Single-leg balance', {
    targetRegion: 'ankle_knee', phase: 'restore', difficulty: 2,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Retrains neuromuscular control of the injured limb — essential for return-to-sport stability.',
    prescription: '3 x 20–30 sec each leg',
    cues: ['Soft knee', 'Eyes on a fixed point', 'Minimise ankle wobble'],
    commonMistakes: ['Gripping toes excessively', 'Locking the knee'],
    easierAlternative: 'Bilateral balance (slight weight shift)',
    harderProgression: 'ham_nm_sl_eyes',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_nm_sl_eyes', 'Single-leg balance — eyes closed', {
    targetRegion: 'ankle_knee', phase: 'capacity', difficulty: 3,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Advances proprioceptive challenge; mirrors demands of unpredictable sport environments.',
    prescription: '3 x 15–20 sec each leg',
    cues: ['Stand near a wall for safety', 'Soft knee', 'Minimal swaying'],
    commonMistakes: ['Opening eyes when it gets hard instead of slowing down'],
    easierAlternative: 'ham_nm_sl_stand',
    harderProgression: 'ham_nm_sl_reach',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_nm_sl_reach', 'Single-leg reach (mini Y-balance)', {
    targetRegion: 'ankle_knee', phase: 'capacity', difficulty: 3,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Dynamic balance challenge; reveals residual control deficits before return-to-sport.',
    prescription: '3 x 6 reaches each direction, each leg',
    cues: ['Stand on one leg', 'Reach the other foot as far as you can in each direction (front, side, back)', 'Return without touching down'],
    commonMistakes: ['Rushing', 'Trunk leaning excessively'],
    easierAlternative: 'ham_nm_sl_eyes',
    harderProgression: 'Reach while catching a ball',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('ham_nm_hop_hold', 'Hop and stabilize', {
    targetRegion: 'hamstring', phase: 'speed', difficulty: 4,
    block: 'neuromuscular', slot: 'power', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Eccentric deceleration control after impact — bridges the gap between strength and sprint mechanics.',
    prescription: '3 x 5 hops each leg, hold 2 sec on landing',
    cues: ['Soft landing', 'Stick the landing before moving', 'Land on a bent knee'],
    commonMistakes: ['Stiff landing', 'Immediately rebounding instead of stabilising'],
    easierAlternative: 'ham_nm_sl_reach',
    harderProgression: 'Forward hop for distance and hold',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Any pain during ground contact'],
    painRule: PAIN_RULES.impact
  }),

  /* ======================================================================
   * CONDITIONING BLOCK  (aerobic, running, impact)
   * ====================================================================== */
  makeExercise('ham_cond_walk', 'Brisk walking / walk intervals', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['open_space'],
    purpose: 'Maintain cardiovascular fitness and gentle movement while respecting the injury.',
    prescription: '15–20 min continuous or intervals',
    cues: ['Comfortable pace — no limp', 'Stop if pain exceeds 3/10'],
    commonMistakes: ['Walking too fast and limping', 'Skipping this in early phase'],
    easierAlternative: 'Short 5–10 min stroll',
    harderProgression: 'ham_cond_bike',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Limp present'],
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('ham_cond_bike', 'Stationary bike (easy, low resistance)', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['stationary_bike'],
    purpose: 'Offloading cardiovascular work — keeps the athlete fit without stressing the hamstring in a lengthened position.',
    prescription: '15–20 min at low resistance, comfortable cadence',
    cues: ['Seat high (slight knee bend at bottom)', 'Easy effort only', 'No pulling through the toe clips'],
    commonMistakes: ['Resistance too high', 'Seat too low causing hamstring strain'],
    easierAlternative: 'ham_cond_walk',
    harderProgression: 'Increase resistance progressively',
    noEquipmentAlternative: 'ham_cond_pool',
    avoidIf: ['Pain at hamstring during pedalling'],
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('ham_cond_pool', 'Pool running / water walking', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['pool'],
    purpose: 'Near-full running pattern with buoyancy offloading — excellent for maintaining fitness with minimal tissue load.',
    prescription: '15–25 min',
    cues: ['Drive knees forward', 'Running arm action', 'Stay upright'],
    commonMistakes: ['Cycling the legs instead of running pattern'],
    easierAlternative: 'Water walking',
    harderProgression: 'Deep-water running with buoyancy vest',
    noEquipmentAlternative: 'ham_cond_bike',
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('ham_cond_jog_walk', 'Jog-walk intervals', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['open_space'],
    purpose: 'Gentle return to running; alternates jog and walk to manage tissue load.',
    prescription: '20 min: 1 min jog / 2 min walk x 6–7 rounds',
    cues: ['Easy conversational jog pace', 'No tightness above 3/10', 'Increase jog ratio only if last session was calm'],
    commonMistakes: ['Jogging too fast', 'Increasing too quickly'],
    easierAlternative: 'ham_cond_walk',
    harderProgression: 'ham_buildups',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Jogging causes > 3/10 hamstring pain'],
    painRule: PAIN_RULES.impact
  }),
  makeExercise('ham_buildups', 'Build-up runs (progressive speed)', {
    targetRegion: 'hamstring', phase: 'speed', difficulty: 3,
    block: 'conditioning', slot: 'conditioning', isAnchor: true,
    equipment: ['open_space'],
    purpose: 'Reintroduce running speed in a controlled, graduated way.',
    prescription: '6 x 40–60 m at 60–80% max speed; 2–3 min recovery',
    cues: ['Smooth acceleration', 'Stop if tightness rises above 2/10', 'Consistent mechanics'],
    commonMistakes: ['Jumping straight to full sprint', 'No recovery between runs'],
    easierAlternative: 'ham_cond_jog_walk',
    harderProgression: 'ham_sprint_exposure',
    noEquipmentAlternative: 'Same (field/treadmill)',
    gymAlternative: 'Treadmill build-ups',
    painRule: PAIN_RULES.impact
  }),
  makeExercise('ham_sprint_exposure', 'Progressive sprint exposure', {
    targetRegion: 'hamstring', phase: 'return', difficulty: 5,
    block: 'conditioning', slot: 'conditioning', isAnchor: true,
    equipment: ['field'],
    purpose: 'Restore high-speed running capacity including max-speed sprinting and change of direction.',
    prescription: '6–8 runs at 70–95% max speed; increase only one variable (speed or volume) per session',
    cues: ['Increase only one variable at a time', 'Record pace and tightness rating', 'Full recovery between efforts'],
    commonMistakes: ['Maxing out on the first session', 'Adding COD before straight sprinting is calm'],
    easierAlternative: 'ham_buildups',
    harderProgression: 'Full sprint + change of direction + sport drills',
    noEquipmentAlternative: 'Same (track/field)',
    gymAlternative: 'High-speed treadmill intervals',
    painRule: PAIN_RULES.impact
  }),

  /* ======================================================================
   * COOLDOWN BLOCK  (gentle closing; optional)
   * ====================================================================== */
  makeExercise('ham_cool_prone', 'Prone lying rest / prone breathing', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'cooldown', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Offload the posterior chain; calm the nervous system after loading.',
    prescription: '3–5 min',
    cues: ['Face down, arms relaxed', 'Breathe slowly', 'Completely unload the injury'],
    commonMistakes: ['Skipping this after intense sessions'],
    easierAlternative: 'Supine rest',
    harderProgression: 'N/A',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Fully pain-free rest.'
  }),
  makeExercise('ham_cool_supine_stretch', 'Gentle supine hamstring stretch', {
    targetRegion: 'hamstring', phase: 'capacity', difficulty: 1,
    block: 'cooldown', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'End-of-session gentle length work — ONLY in capacity phase onwards when tissue is ready for stretch.',
    prescription: '2 x 30 sec each leg',
    cues: ['Supine, pull leg toward chest gently', 'Soft knee — not a straight-leg hammer stretch', 'Go to mild tension only, not pain'],
    commonMistakes: ['Forcing range', 'Using in protect/restore phase before tissue is ready'],
    easierAlternative: 'Shorter 15-sec hold',
    harderProgression: 'Standing hamstring stretch',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Acute strain phase (protect/restore)', 'Proximal tendon — never aggressive stretch'],
    painRule: 'Mild tension only. Never sharp or pulling.'
  })
];

/* -------------------------------------------------------------------------
 * REHAB PROTOCOLS (pathways). Subtypes map to one of these via rehabPathway.
 * ------------------------------------------------------------------------- */
const rehabProtocols = [
  makeProtocol('acute_muscle_strain', {
    name: 'Acute hamstring muscle strain pathway',
    summary: 'Settle, then progressively load and rebuild sprint capacity.',
    appliesToSubtypes: [
      'hamstring_muscle_belly_strain',
      'distal_hamstring_irritation',
      'biceps_femoris_lateral_strain',
      'semitendinosus_medial_strain',
      'semimembranosus_deep_medial_strain'
    ],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Protect and settle',
        goal: 'Calm the strain, restore normal walking, keep the whole body moving safely.',
        estimatedDuration: '3–7 days',
        entryCriteria: ['No urgent red flags'],
        exitCriteria: ['Walking is comfortable', 'Isometrics calm at ≤3/10'],
        intensityGuidance: 'RPE 2–4',
        painRules: PAIN_RULES.earlyStrain,
        avoid: ['Sprinting', 'Aggressive stretching', 'Heavy hinging', 'Passive deep stretching of the hamstring'],
        progressionCriteria: ['Two calm days with comfortable isometrics', 'No limping'],
        regressionCriteria: ['Pain spikes during or after sessions', 'Swelling increasing'],
        // Full phase pool — the session scheduler picks 6–7 per session using SESSION_BLUEPRINTS
        exercises: [
          // warmup
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_ankle_mob',
          // activation
          'ham_iso_heeldig', 'ham_iso_seated', 'ham_glute_squeeze',
          // targeted
          'ham_bridge_hold',
          // kinetic_chain
          'ham_kc_glute_bridge', 'ham_kc_clamshell', 'ham_kc_dead_bug',
          'ham_kc_bird_dog', 'ham_kc_plank', 'ham_kc_back_ext',
          'ham_kc_calf_raise', 'ham_kc_hip_flex_stretch',
          // conditioning (low-load, offloading options)
          'ham_cond_walk', 'ham_cond_bike', 'ham_cond_pool',
          // cooldown
          'ham_cool_prone'
        ]
      }),
      makePhase('restore', {
        name: 'Phase 2 – Restore motion and control',
        goal: 'Rebuild comfortable range, light hamstring strength, and the full kinetic chain.',
        estimatedDuration: '1–2 weeks',
        entryCriteria: ['Comfortable walking', 'Calm isometrics', 'No significant swelling'],
        exitCriteria: ['Slider curls and single-leg bridge calm at ≤3/10', 'Jogging pain-free'],
        intensityGuidance: 'RPE 4–6',
        painRules: PAIN_RULES.loading,
        avoid: ['Sprinting', 'Maximal eccentrics', 'Deep passive hamstring stretch'],
        progressionCriteria: ['Slider curls and active knee extension calm for 24 hours'],
        regressionCriteria: ['Next-morning pain increase', 'Swelling returning'],
        exercises: [
          // warmup
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_walk_lunge', 'ham_warm_ankle_mob',
          // activation
          'ham_iso_heeldig', 'ham_iso_seated', 'ham_glute_squeeze', 'ham_neural_slider',
          // targeted
          'ham_long_lever_bridge', 'ham_single_leg_bridge', 'ham_slider_curl',
          'ham_active_knee_ext', 'ham_good_morning_bw',
          // kinetic_chain
          'ham_kc_glute_bridge', 'ham_kc_hip_thrust', 'ham_kc_clamshell',
          'ham_kc_lateral_band', 'ham_kc_dead_bug', 'ham_kc_bird_dog',
          'ham_kc_plank', 'ham_kc_side_plank', 'ham_kc_back_ext',
          'ham_kc_calf_raise', 'ham_kc_sl_calf', 'ham_kc_hip_flex_stretch', 'ham_kc_couch_stretch',
          // neuromuscular
          'ham_nm_sl_stand',
          // conditioning
          'ham_cond_walk', 'ham_cond_bike', 'ham_cond_pool', 'ham_cond_jog_walk',
          // cooldown
          'ham_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 3 – Build strength capacity',
        goal: 'Develop hamstring and whole-body strength; introduce eccentric loading.',
        estimatedDuration: '2–3 weeks',
        entryCriteria: ['Pain-free sliders', 'Good single-leg bridge', 'Comfortable jog-walk'],
        exitCriteria: ['Strong RDL and tolerated eccentrics (Nordic)', 'Continuous jogging comfortable'],
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.loading,
        avoid: ['Maximal sprinting before speed phase', 'Deep passive stretching before strength work'],
        progressionCriteria: ['Eccentrics and RDL calm session to session'],
        regressionCriteria: ['Eccentric work flares symptoms next morning'],
        exercises: [
          // warmup
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_walk_lunge', 'ham_warm_ankle_mob',
          // activation
          'ham_iso_seated', 'ham_glute_squeeze',
          // targeted (anchor exercises for this phase)
          'ham_rdl', 'ham_sl_rdl_bw', 'ham_nordic', 'ham_seated_leg_curl',
          'ham_single_leg_bridge', 'ham_slider_curl',
          // kinetic_chain
          'ham_kc_hip_thrust', 'ham_kc_lateral_band', 'ham_kc_step_down',
          'ham_kc_side_plank', 'ham_kc_dead_bug', 'ham_kc_bird_dog',
          'ham_kc_sl_calf', 'ham_kc_couch_stretch',
          // neuromuscular
          'ham_nm_sl_stand', 'ham_nm_sl_eyes', 'ham_nm_sl_reach',
          // conditioning
          'ham_cond_bike', 'ham_cond_jog_walk',
          // cooldown
          'ham_cool_prone', 'ham_cool_supine_stretch'
        ]
      }),
      makePhase('speed', {
        name: 'Phase 4 – Speed and sport prep',
        goal: 'Reintroduce running speed, elastic load, and sport-specific demands.',
        estimatedDuration: '1–2 weeks',
        entryCriteria: ['Good eccentric strength (Nordic tolerated)', 'Continuous jogging 20 min pain-free'],
        exitCriteria: ['Build-ups to 80% speed comfortable', 'Hop-and-hold stable'],
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Maximal sprints before build-ups are calm', 'Heavy eccentrics on the same day as speed work'],
        progressionCriteria: ['No next-day reaction to build-ups', 'Hop-hold stable'],
        regressionCriteria: ['Tightness climbs with speed', 'Morning stiffness increases'],
        exercises: [
          // warmup
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_walk_lunge', 'ham_warm_ankle_mob',
          // targeted
          'ham_rdl', 'ham_sl_rdl_bw', 'ham_nordic',
          // kinetic_chain
          'ham_kc_hip_thrust', 'ham_kc_step_down', 'ham_kc_side_plank',
          'ham_kc_sl_calf', 'ham_kc_couch_stretch',
          // neuromuscular
          'ham_nm_sl_eyes', 'ham_nm_sl_reach', 'ham_nm_hop_hold',
          // conditioning (the key block in this phase)
          'ham_buildups', 'ham_cond_jog_walk',
          // cooldown
          'ham_cool_supine_stretch'
        ]
      }),
      makePhase('return', {
        name: 'Phase 5 – Return to sport',
        goal: 'Restore full sprint speed, sport demands, and confidence.',
        estimatedDuration: '1–3 weeks',
        entryCriteria: ['Comfortable 80% build-ups', 'Hop-hold stable', 'Strength symmetric'],
        exitCriteria: ['Full-speed sprint exposure tolerated', 'All sport drills pain-free', 'Confidence high'],
        intensityGuidance: 'RPE 7–9',
        painRules: PAIN_RULES.impact,
        avoid: ['Single-session jumps in speed AND volume together'],
        progressionCriteria: ['Sprint exposure calm for 24 hours', 'COD comfortable'],
        regressionCriteria: ['Any sharp pull returns', 'Confidence drops'],
        exercises: [
          // warmup
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_walk_lunge', 'ham_warm_ankle_mob',
          // targeted (maintenance loading)
          'ham_rdl', 'ham_nordic', 'ham_sl_rdl_bw',
          // kinetic_chain
          'ham_kc_hip_thrust', 'ham_kc_step_down', 'ham_kc_side_plank', 'ham_kc_sl_calf',
          // neuromuscular
          'ham_nm_sl_reach', 'ham_nm_hop_hold',
          // conditioning (primary focus — full sprint exposure)
          'ham_sprint_exposure', 'ham_buildups', 'ham_cond_jog_walk',
          // cooldown
          'ham_cool_supine_stretch'
        ]
      })
    ]
  }),
  makeProtocol('proximal_tendon', {
    name: 'Proximal hamstring tendon pathway',
    summary: 'Reduce compressive load at the sitting bone; build tendon load tolerance progressively.',
    appliesToSubtypes: ['proximal_hamstring_tendon_pain'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Settle the tendon',
        goal: 'Reduce sitting compression, calm symptoms, keep the whole body active.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 2–4',
        painRules: PAIN_RULES.isometric,
        avoid: ['Deep hip-flexion stretches', 'Prolonged hard sitting', 'Hill sprints', 'Aggressive hamstring stretch'],
        progressionCriteria: ['Isometrics calm and sitting more comfortable'],
        regressionCriteria: ['Sitting pain climbing'],
        exercises: [
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_ankle_mob',
          'ham_iso_heeldig', 'ham_iso_seated', 'ham_glute_squeeze',
          'ham_bridge_hold',
          'ham_kc_glute_bridge', 'ham_kc_clamshell', 'ham_kc_dead_bug', 'ham_kc_bird_dog',
          'ham_kc_plank', 'ham_kc_back_ext', 'ham_kc_calf_raise',
          'ham_cond_bike', 'ham_cond_pool',
          'ham_cool_prone'
        ]
      }),
      makePhase('restore', {
        name: 'Phase 2 – Build tendon tolerance',
        goal: 'Introduce mid-range hamstring strength without compressive positions.',
        estimatedDuration: '2–4 weeks',
        intensityGuidance: 'RPE 4–6',
        painRules: PAIN_RULES.tendon,
        avoid: ['End-range hinge stretch early', 'Seated forward flexion stretch'],
        progressionCriteria: ['Long-lever bridge calm', 'No next-day sitting-bone pain'],
        regressionCriteria: ['Sitting-bone pain increases next day'],
        exercises: [
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_walk_lunge', 'ham_warm_ankle_mob',
          'ham_iso_heeldig', 'ham_glute_squeeze',
          'ham_long_lever_bridge', 'ham_single_leg_bridge', 'ham_good_morning_bw',
          'ham_kc_hip_thrust', 'ham_kc_lateral_band', 'ham_kc_dead_bug', 'ham_kc_side_plank',
          'ham_kc_sl_calf', 'ham_kc_hip_flex_stretch',
          'ham_nm_sl_stand',
          'ham_cond_bike', 'ham_cond_jog_walk',
          'ham_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 3 – Strength capacity',
        goal: 'Build tendon strength and whole-body capacity with progressive hinging.',
        estimatedDuration: '3–6 weeks',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.tendon,
        avoid: ['Aggressive deep-range loading', 'Ballistic stretch at end of range'],
        progressionCriteria: ['RDL tolerated session to session, no next-day flare'],
        regressionCriteria: ['Tendon pain climbing across sessions'],
        exercises: [
          'ham_warm_walk_lunge', 'ham_warm_ankle_mob', 'ham_warm_hip_circle',
          'ham_iso_seated', 'ham_glute_squeeze',
          'ham_rdl', 'ham_sl_rdl_bw', 'ham_single_leg_bridge',
          'ham_kc_hip_thrust', 'ham_kc_step_down', 'ham_kc_side_plank', 'ham_kc_sl_calf', 'ham_kc_couch_stretch',
          'ham_nm_sl_eyes', 'ham_nm_sl_reach',
          'ham_cond_bike', 'ham_cond_jog_walk',
          'ham_cool_supine_stretch'
        ]
      }),
      makePhase('return', {
        name: 'Phase 4 – Return to running and sport',
        goal: 'Reintroduce speed once tendon tolerance is solid.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Hill sprints before flat running is calm', 'Sit-and-reach type stretching'],
        progressionCriteria: ['Flat build-ups calm before hills/speed'],
        regressionCriteria: ['Sitting pain or sprint pain returns'],
        exercises: [
          'ham_warm_walk_lunge', 'ham_warm_hip_circle', 'ham_warm_leg_swing',
          'ham_rdl', 'ham_sl_rdl_bw',
          'ham_kc_hip_thrust', 'ham_kc_step_down', 'ham_kc_sl_calf',
          'ham_nm_sl_reach', 'ham_nm_hop_hold',
          'ham_buildups', 'ham_sprint_exposure', 'ham_cond_jog_walk',
          'ham_cool_supine_stretch'
        ]
      })
    ]
  }),
  makeProtocol('neural_tension', {
    name: 'Neural tension pathway (posterior thigh)',
    summary: 'Desensitize gently; avoid provoking travelling symptoms; build strength carefully.',
    appliesToSubtypes: ['neural_tension_posterior_thigh'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Calm and desensitize',
        goal: 'Reduce neural irritation; keep the whole body active with pain-free work.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'Symptom-free only',
        painRules: 'Keep all work symptom-free. Stop if anything travels below the knee.',
        avoid: ['Aggressive stretching', 'Forced end-range', 'Sprinting', 'Straight-leg hamstring loads'],
        progressionCriteria: ['Neural glides stay symptom-free', 'No spread of symptoms'],
        regressionCriteria: ['Travelling symptoms or tingling return'],
        exercises: [
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_ankle_mob',
          'ham_neural_slider', 'ham_iso_heeldig', 'ham_glute_squeeze',
          'ham_bridge_hold',
          'ham_kc_glute_bridge', 'ham_kc_clamshell', 'ham_kc_dead_bug', 'ham_kc_bird_dog',
          'ham_kc_plank', 'ham_kc_back_ext', 'ham_kc_calf_raise',
          'ham_cond_bike', 'ham_cond_pool',
          'ham_cool_prone'
        ]
      }),
      makePhase('restore', {
        name: 'Phase 2 – Restore length and load',
        goal: 'Rebuild comfortable range, light strength, and kinetic chain strength.',
        estimatedDuration: '2–4 weeks',
        intensityGuidance: 'RPE 3–5',
        painRules: PAIN_RULES.loading,
        avoid: ['Provocative end-range', 'Any exercise that provokes below-knee symptoms'],
        progressionCriteria: ['Active knee extension comfortable, no spreading'],
        regressionCriteria: ['Symptoms travel again'],
        exercises: [
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_walk_lunge',
          'ham_neural_slider', 'ham_active_knee_ext', 'ham_iso_heeldig',
          'ham_long_lever_bridge', 'ham_single_leg_bridge', 'ham_good_morning_bw',
          'ham_kc_hip_thrust', 'ham_kc_clamshell', 'ham_kc_side_plank', 'ham_kc_dead_bug',
          'ham_kc_calf_raise', 'ham_kc_hip_flex_stretch',
          'ham_nm_sl_stand',
          'ham_cond_bike', 'ham_cond_jog_walk',
          'ham_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 3 – Strength and return',
        goal: 'Build strength, introduce running, return to sport.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 5–7',
        painRules: PAIN_RULES.loading,
        avoid: ['Speed work while symptoms still travel'],
        progressionCriteria: ['Strength work calm and symptom-free'],
        regressionCriteria: ['Neural symptoms recur'],
        exercises: [
          'ham_warm_walk_lunge', 'ham_warm_hip_circle', 'ham_warm_ankle_mob',
          'ham_active_knee_ext', 'ham_iso_seated',
          'ham_rdl', 'ham_sl_rdl_bw', 'ham_single_leg_bridge',
          'ham_kc_hip_thrust', 'ham_kc_step_down', 'ham_kc_side_plank', 'ham_kc_sl_calf',
          'ham_nm_sl_eyes', 'ham_nm_sl_reach',
          'ham_buildups', 'ham_cond_jog_walk',
          'ham_cool_supine_stretch'
        ]
      })
    ]
  }),
  makeProtocol('overload', {
    name: 'Posterior chain overload pathway',
    summary: 'Reduce load spike, rebuild capacity, and return to full training.',
    appliesToSubtypes: ['posterior_chain_overload'],
    phases: [
      makePhase('restore', {
        name: 'Phase 1 – Settle load and rebuild control',
        goal: 'Reduce aggravating volume and restore comfortable strength across the kinetic chain.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 3–5',
        painRules: PAIN_RULES.loading,
        avoid: ['Sudden spikes in running volume', 'High-speed running'],
        progressionCriteria: ['Daily symptoms settling', 'Morning tightness reducing'],
        regressionCriteria: ['Symptoms rising with volume'],
        exercises: [
          'ham_warm_leg_swing', 'ham_warm_hip_circle', 'ham_warm_walk_lunge',
          'ham_iso_heeldig', 'ham_glute_squeeze',
          'ham_bridge_hold', 'ham_long_lever_bridge', 'ham_single_leg_bridge',
          'ham_kc_glute_bridge', 'ham_kc_hip_thrust', 'ham_kc_clamshell',
          'ham_kc_dead_bug', 'ham_kc_side_plank', 'ham_kc_hip_flex_stretch', 'ham_kc_calf_raise',
          'ham_nm_sl_stand',
          'ham_cond_bike', 'ham_cond_jog_walk',
          'ham_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 2 – Build capacity',
        goal: 'Strengthen the entire posterior chain; increase load tolerance.',
        estimatedDuration: '2–4 weeks',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.loading,
        avoid: ['Returning to full volume too quickly', 'Ignoring next-morning feedback'],
        progressionCriteria: ['Strength work tolerated, no next-day flare'],
        regressionCriteria: ['Tightness returns with load'],
        exercises: [
          'ham_warm_walk_lunge', 'ham_warm_hip_circle', 'ham_warm_ankle_mob',
          'ham_iso_seated', 'ham_glute_squeeze',
          'ham_rdl', 'ham_sl_rdl_bw', 'ham_nordic', 'ham_seated_leg_curl',
          'ham_kc_hip_thrust', 'ham_kc_step_down', 'ham_kc_side_plank', 'ham_kc_sl_calf', 'ham_kc_couch_stretch',
          'ham_nm_sl_eyes', 'ham_nm_sl_reach',
          'ham_cond_jog_walk', 'ham_buildups',
          'ham_cool_supine_stretch'
        ]
      }),
      makePhase('return', {
        name: 'Phase 3 – Return to full training',
        goal: 'Reintroduce speed and full training volume gradually.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Big single-week load jumps (> 10% increase)'],
        progressionCriteria: ['Build-ups and volume both calm session to session'],
        regressionCriteria: ['Overload symptoms recur'],
        exercises: [
          'ham_warm_walk_lunge', 'ham_warm_hip_circle', 'ham_warm_leg_swing',
          'ham_rdl', 'ham_nordic', 'ham_sl_rdl_bw',
          'ham_kc_hip_thrust', 'ham_kc_step_down', 'ham_kc_sl_calf',
          'ham_nm_sl_reach', 'ham_nm_hop_hold',
          'ham_sprint_exposure', 'ham_buildups', 'ham_cond_jog_walk',
          'ham_cool_supine_stretch'
        ]
      })
    ]
  }),
  makeProtocol('severe_risk', {
    name: 'Higher-grade tear (conservative early care only)',
    summary: 'Conservative early care while arranging clinical review. No aggressive loading.',
    appliesToSubtypes: ['severe_hamstring_tear_risk'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Protect and seek review',
        goal: 'Protect the area; keep upper body and non-injured areas active; arrange clinical assessment.',
        estimatedDuration: 'Until reviewed',
        intensityGuidance: 'Very gentle, pain-free only',
        painRules: 'Keep everything pain-free. Do not push through pain.',
        avoid: ['Stretching into pain', 'Strength testing the injury', 'Running or sport', 'Any aggressive loading'],
        progressionCriteria: ['Only progress under professional guidance'],
        regressionCriteria: ['Any worsening — seek review sooner'],
        exercises: [
          // Only the gentlest items — no hamstring loading
          'ham_iso_heeldig',
          'ham_kc_dead_bug', 'ham_kc_bird_dog', 'ham_kc_plank', 'ham_kc_back_ext',
          'ham_cond_pool', 'ham_cond_bike',
          'ham_cool_prone'
        ]
      })
    ]
  })
];

/* -------------------------------------------------------------------------
 * RETURN-TO-SPORT
 * Generic ladder plus sport-specific notes the rehab generator can surface.
 * ------------------------------------------------------------------------- */
const returnToSport = {
  genericLadder: [
    'Pain-free walking',
    'Pain-free jogging',
    'Tempo running',
    'Build-up runs to 80%',
    'Acceleration / deceleration',
    'Change of direction',
    'Sport-specific drills',
    'Full training',
    'Match / competition return'
  ],
  criteriaToReturn: [
    'Full pain-free range and strength close to the other side',
    'High-speed running rehearsed without symptoms',
    'Confidence with sprinting and cutting'
  ],
  sportSpecific: {
    'Football / soccer': ['Add curve runs, cutting, then submax kicking before full play.'],
    Running: ['Build distance before speed; reintroduce hills last.'],
    Basketball: ['Add deceleration and reactive cutting before scrimmage.'],
    'Tennis / padel': ['Rehearse lateral push-off and recovery steps.']
  }
};

/* -------------------------------------------------------------------------
 * MAINTENANCE / PREVENTION
 * ------------------------------------------------------------------------- */
const maintenancePlan = {
  goal: 'Reduce reinjury risk by maintaining eccentric strength and speed exposure.',
  frequency: '2 short sessions per week',
  exercises: ['ham_nordic', 'ham_rdl', 'ham_buildups'],
  preventionNotes: [
    'Keep an eccentric hamstring exercise in your weekly routine.',
    'Avoid large single-week jumps in sprint volume.',
    'Warm up with build-ups before high-speed sessions.'
  ]
};

/* -------------------------------------------------------------------------
 * EXPORT
 * ------------------------------------------------------------------------- */
const hamstring = {
  id: 'hamstring',
  name: 'Hamstring / posterior thigh',
  shortDescription:
    'Posterior thigh injuries spanning muscle strains, high-tendon pain, and neural-type patterns.',
  anatomyRegions,
  detailedAreas,
  injurySubtypes,
  assessmentQuestions,
  selfTests,
  redFlags,
  diagnosisRules,
  rehabProtocols,
  exerciseLibrary,
  returnToSport,
  maintenancePlan
};

export default hamstring;
