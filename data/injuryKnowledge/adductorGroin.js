/**
 * adductorGroin.js
 * ---------------------------------------------------------------------------
 * Knowledge model for adductor / groin injuries.
 * Same structure and rule format as hamstring.js (see that file for the full
 * explanation of diagnosisRules and protocol shapes).
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

const injurySubtypes = [
  { id: 'adductor_longus_strain', name: 'Adductor longus strain', riskLevel: 'moderate', rehabPathway: 'acute_adductor_strain', note: 'Most common groin strain location.' },
  { id: 'adductor_magnus_strain', name: 'Adductor magnus strain', riskLevel: 'moderate', rehabPathway: 'acute_adductor_strain', note: 'Large inner/posterior adductor.' },
  { id: 'adductor_brevis_deep_groin_irritation', name: 'Adductor brevis / deep groin irritation', riskLevel: 'moderate', rehabPathway: 'acute_adductor_strain', note: 'Deep upper groin discomfort.' },
  { id: 'gracilis_irritation', name: 'Gracilis irritation', riskLevel: 'low', rehabPathway: 'acute_adductor_strain', note: 'Long inner-thigh muscle crossing the knee.' },
  { id: 'adductor_tendinopathy', name: 'Adductor tendinopathy', riskLevel: 'moderate', rehabPathway: 'adductor_tendon', note: 'Gradual, load-related groin tendon pain.' },
  { id: 'pubic_related_groin_pain', name: 'Pubic-related groin pain', riskLevel: 'moderate', rehabPathway: 'pubic_overload', note: 'Central pubic pain, often multi-tissue overload.' },
  { id: 'iliopsoas_hip_flexor_related_groin_pain', name: 'Iliopsoas / hip-flexor-related groin pain', riskLevel: 'moderate', rehabPathway: 'hip_flexor', note: 'Deep anterior groin with hip-flexion load.' },
  { id: 'deep_hip_joint_related_pain', name: 'Deep hip-joint-related pain', riskLevel: 'refer', rehabPathway: 'deep_hip_referral', note: 'Deep hip pain with clicking/catching; cautious pathway.' },
  { id: 'athletic_pubalgia_suspicion', name: 'Athletic pubalgia / hernia-type suspicion', riskLevel: 'refer', rehabPathway: 'pubalgia_referral', note: 'Lower-abdominal/groin pain with cough/sneeze; needs review.' },
  { id: 'severe_groin_injury_risk', name: 'Possible higher-grade groin injury', riskLevel: 'refer', rehabPathway: 'severe_risk', note: 'Features suggesting a more significant injury.' }
];

const anatomyRegions = ['adductor_groin'];

const detailedAreas = [
  { id: 'adductor_longus', name: 'Adductor longus (main inner-thigh tendon)' },
  { id: 'front_adductor_magnus', name: 'Adductor magnus' },
  { id: 'front_adductor_brevis', name: 'Adductor brevis (deep)' },
  { id: 'front_gracilis', name: 'Gracilis' },
  { id: 'front_iliopsoas', name: 'Iliopsoas / hip flexor' },
  { id: 'pubic_region', name: 'Pubic region' },
  { id: 'upper_inner_thigh', name: 'Upper inner thigh' },
  { id: 'medial_thigh', name: 'Medial thigh' },
  { id: 'groin_origin', name: 'Groin tendon origin' },
  { id: 'deep_anterior_hip', name: 'Deep anterior hip' }
];

const assessmentQuestions = [
  makeQuestion('mechanism', 'How did the pain start?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'cutting', label: 'Cutting / change of direction' },
      { value: 'kicking', label: 'Kicking' },
      { value: 'sprinting', label: 'Sprinting' },
      { value: 'overstretch', label: 'Over-stretch / split / slide' },
      { value: 'gradual', label: 'Gradual load increase' }
    ]
  }),
  makeQuestion('onset', 'Sudden or gradual?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'sudden_sharp', label: 'Sudden, sharp' },
      { value: 'gradual', label: 'Gradual' }
    ]
  }),
  makeQuestion('squeeze_pain', 'Does squeezing your knees together hurt?', 'boolean', { category: 'symptom' }),
  makeQuestion('resisted_adduction_pain', 'Pain pulling the leg inward against resistance?', 'boolean', { category: 'symptom' }),
  makeQuestion('situp_cough_pain', 'Pain with sit-ups, coughing, or sneezing?', 'boolean', { category: 'red_flag' }),
  makeQuestion('pubic_pain', 'Is there central pubic-bone pain?', 'boolean', { category: 'symptom' }),
  makeQuestion('hip_click_catch', 'Any deep hip clicking, catching, or locking?', 'boolean', { category: 'symptom' }),
  makeQuestion('hip_flexion_pain', 'Pain lifting the knee / bending the hip?', 'boolean', { category: 'symptom' }),
  makeQuestion('bruising_swelling', 'Any bruising or swelling?', 'single', {
    category: 'symptom',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'significant', label: 'Significant' }
    ]
  }),
  makeQuestion('groin_bulge', 'Any visible groin/abdominal bulge or testicular pain?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'urgent' }
  }),
  makeQuestion('previous_groin', 'Have you had groin injuries before?', 'boolean', { category: 'history' })
];

const selfTests = [
  makeSelfTest('squeeze_short_lever', 'Adductor squeeze (short lever)', {
    purpose: 'Low-level adductor load with knees bent.',
    howTo: ['Lie on your back, knees bent.', 'Place a ball/fist between the knees and squeeze gently.'],
    whatPositiveSuggests: 'Inner-thigh pain confirms adductor load sensitivity.',
    whatItDoesNotProve: 'Cannot localize which adductor or grade it.'
  }),
  makeSelfTest('squeeze_long_lever', 'Adductor squeeze (long lever)', {
    purpose: 'Higher adductor demand with legs straighter.',
    howTo: ['Legs straighter, ball between ankles/knees.', 'Squeeze gently.'],
    whatPositiveSuggests: 'Pain at longer lever suggests more reactive tissue.',
    whatItDoesNotProve: 'Does not confirm tendon vs muscle.',
    doNotPerformIf: ['Short-lever squeeze was clearly painful.']
  }),
  makeSelfTest('resisted_adduction', 'Resisted hip adduction', {
    purpose: 'Loads the adductors against gentle resistance.',
    howTo: ['Side-lying or standing, pull the leg inward against light resistance.'],
    whatPositiveSuggests: 'Reproduced groin pain points to adductor involvement.',
    whatItDoesNotProve: 'Cannot exclude pubic or hip-joint sources.'
  }),
  makeSelfTest('modified_copenhagen', 'Modified Copenhagen plank tolerance', {
    purpose: 'Tests adductor strength in a side-plank position.',
    howTo: ['Side plank with the top leg supported on a chair, knee bent.', 'Lift the bottom leg toward the top.'],
    whatPositiveSuggests: 'Difficulty/pain reflects adductor capacity deficit.',
    whatItDoesNotProve: 'Not a graded test.',
    doNotPerformIf: ['Acute, painful strain', 'Cannot hold a basic side plank']
  }),
  makeSelfTest('hip_flexion_resistance', 'Hip flexion resistance screen', {
    purpose: 'Screens for iliopsoas/hip-flexor involvement.',
    howTo: ['Seated, lift the knee against gentle downward resistance.'],
    whatPositiveSuggests: 'Deep anterior groin pain points to a hip-flexor pattern.',
    whatItDoesNotProve: 'Cannot exclude hip-joint sources.'
  }),
  makeSelfTest('lunge_tolerance', 'Lunge tolerance', {
    purpose: 'Functional groin/hip load.',
    howTo: ['Perform a slow, comfortable-range lunge.'],
    whatPositiveSuggests: 'Groin pain reflects load sensitivity.',
    whatItDoesNotProve: 'Does not localize the structure.'
  }),
  makeSelfTest('deep_squat_tolerance', 'Deep squat tolerance', {
    purpose: 'Screens deep hip/groin comfort at range.',
    howTo: ['Squat to a comfortable depth.'],
    whatPositiveSuggests: 'Deep pinch/pain may reflect hip-joint or deep groin involvement.',
    whatItDoesNotProve: 'Is only a screen.'
  }),
  makeSelfTest('cough_situp_screen', 'Cough / sit-up pain screen', {
    purpose: 'Cautious screen for pubic/abdominal-wall involvement.',
    howTo: ['Note pain with a gentle cough or a single small sit-up.'],
    whatPositiveSuggests: 'Pain here can reflect pubic or abdominal-wall load and warrants review.',
    whatItDoesNotProve: 'Cannot confirm a hernia or pubalgia.',
    capturesPain: true
  }),
  makeSelfTest('hip_impingement_screen', 'Hip impingement-style symptom screen', {
    purpose: 'Cautiously screens for deep hip-joint symptoms.',
    howTo: ['Bring the knee up and gently rotate the hip inward.', 'Note any deep pinch or catch.'],
    whatPositiveSuggests: 'A deep anterior pinch may reflect hip-joint involvement and is worth a review.',
    whatItDoesNotProve: 'This is a screen, not a hip-joint diagnosis.',
    stopCriteria: ['Sharp deep pain', 'Locking or giving way']
  })
];

const redFlags = [
  {
    id: 'groin_hernia_signs',
    triggerAnswers: [
      { questionId: 'groin_bulge', value: true },
      { questionId: 'situp_cough_pain', value: true }
    ],
    requireCount: 1,
    severity: 'urgent',
    message:
      'A groin/abdominal bulge, testicular pain, or pain with coughing/sneezing should be assessed in person to rule out a hernia or athletic pubalgia.'
  },
  {
    id: 'deep_hip_joint_signs',
    triggerAnswers: [{ questionId: 'hip_click_catch', value: true }],
    requireCount: 1,
    severity: 'caution',
    message:
      'Deep hip clicking, catching, or locking can indicate hip-joint involvement and is worth a clinical review before aggressive loading.'
  }
];

const diagnosisRules = [
  {
    subtypeId: 'adductor_longus_strain',
    conditions: [
      { type: 'area', value: ['adductor_longus', 'upper_inner_thigh', 'groin_origin'], points: 26, reason: 'Pain matches the adductor longus / groin tendon area.' },
      { type: 'answer', questionId: 'mechanism', value: 'cutting', points: 16, reason: 'Cutting/change of direction commonly strains adductor longus.' },
      { type: 'answer', questionId: 'mechanism', value: 'kicking', points: 12, reason: 'Kicking loads the adductors.' },
      { type: 'answer', questionId: 'squeeze_pain', value: true, points: 16, reason: 'Pain with the squeeze test.' },
      { type: 'selfTest', testId: 'resisted_adduction', result: 'painful', points: 14, reason: 'Resisted adduction reproduced symptoms.' },
      { type: 'answer', questionId: 'pubic_pain', value: true, points: -8, reason: 'Central pubic pain points more to a pubic pattern.' }
    ]
  },
  {
    subtypeId: 'adductor_magnus_strain',
    conditions: [
      { type: 'area', value: ['front_adductor_magnus', 'medial_thigh'], points: 26, reason: 'Pain matches the adductor magnus / medial thigh.' },
      { type: 'answer', questionId: 'mechanism', value: 'sprinting', points: 12, reason: 'Sprinting loads the larger adductors.' },
      { type: 'answer', questionId: 'squeeze_pain', value: true, points: 12, reason: 'Squeeze test positive.' }
    ]
  },
  {
    subtypeId: 'adductor_brevis_deep_groin_irritation',
    conditions: [
      { type: 'area', value: ['front_adductor_brevis', 'deep_anterior_hip'], points: 24, reason: 'Pain is deep in the upper groin.' },
      { type: 'answer', questionId: 'squeeze_pain', value: true, points: 12, reason: 'Squeeze test positive.' }
    ]
  },
  {
    subtypeId: 'gracilis_irritation',
    conditions: [
      { type: 'area', value: ['front_gracilis', 'medial_thigh'], points: 24, reason: 'Pain matches the gracilis line down the inner thigh.' },
      { type: 'answer', questionId: 'mechanism', value: 'overstretch', points: 12, reason: 'Over-stretch can irritate the gracilis.' }
    ]
  },
  {
    subtypeId: 'adductor_tendinopathy',
    conditions: [
      { type: 'area', value: ['groin_origin', 'adductor_longus'], points: 20, reason: 'Pain at the adductor origin.' },
      { type: 'answer', questionId: 'onset', value: 'gradual', points: 18, reason: 'Gradual onset fits a tendon pattern.' },
      { type: 'answer', questionId: 'mechanism', value: 'gradual', points: 16, reason: 'Load-related build-up.' },
      { type: 'answer', questionId: 'squeeze_pain', value: true, points: 12, reason: 'Squeeze loads the tendon.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: -10, reason: 'A sudden tear event fits a strain more than tendinopathy.' }
    ]
  },
  {
    subtypeId: 'pubic_related_groin_pain',
    conditions: [
      { type: 'area', value: ['pubic_region'], points: 26, reason: 'Pain centres on the pubic region.' },
      { type: 'answer', questionId: 'pubic_pain', value: true, points: 20, reason: 'Central pubic-bone pain reported.' },
      { type: 'answer', questionId: 'situp_cough_pain', value: true, points: 10, reason: 'Pain with sit-ups/cough fits pubic-region overload.' },
      { type: 'answer', questionId: 'onset', value: 'gradual', points: 10, reason: 'Often a gradual, multi-tissue overload.' }
    ]
  },
  {
    subtypeId: 'iliopsoas_hip_flexor_related_groin_pain',
    conditions: [
      { type: 'area', value: ['front_iliopsoas', 'deep_anterior_hip'], points: 24, reason: 'Deep anterior groin matches a hip-flexor pattern.' },
      { type: 'answer', questionId: 'hip_flexion_pain', value: true, points: 20, reason: 'Pain lifting the knee / hip flexion.' },
      { type: 'selfTest', testId: 'hip_flexion_resistance', result: 'painful', points: 16, reason: 'Resisted hip flexion reproduced symptoms.' }
    ]
  },
  {
    subtypeId: 'deep_hip_joint_related_pain',
    conditions: [
      { type: 'area', value: ['deep_anterior_hip'], points: 22, reason: 'Pain is deep in the anterior hip.' },
      { type: 'answer', questionId: 'hip_click_catch', value: true, points: 22, reason: 'Deep clicking/catching suggests hip-joint involvement.' },
      { type: 'selfTest', testId: 'hip_impingement_screen', result: 'painful', points: 16, reason: 'Hip impingement-style screen was provocative.' }
    ]
  },
  {
    subtypeId: 'athletic_pubalgia_suspicion',
    conditions: [
      { type: 'answer', questionId: 'situp_cough_pain', value: true, points: 22, reason: 'Pain with sit-ups/cough/sneeze.' },
      { type: 'answer', questionId: 'groin_bulge', value: true, points: 24, reason: 'A bulge or testicular pain raises hernia/pubalgia concern.' },
      { type: 'area', value: ['pubic_region'], points: 10, reason: 'Lower-abdominal/pubic location.' }
    ]
  },
  {
    subtypeId: 'severe_groin_injury_risk',
    conditions: [
      { type: 'answer', questionId: 'bruising_swelling', value: 'significant', points: 22, reason: 'Significant bruising/swelling raises concern.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: 10, reason: 'Sudden severe onset.' }
    ]
  }
];

/* -------------------------------------------------------------------------
 * EXERCISE LIBRARY
 * Organised into 8 session blocks. Groin/adductor rehab trains the whole
 * athlete: the adductors are the targeted block, but sessions also cover
 * glutes + hamstrings (the critical stabilising partners), core/trunk
 * (essential — most elite programmes include heavy core work), hip flexors
 * (antagonist), abductors, upper body, and appropriate conditioning.
 * ------------------------------------------------------------------------- */
const exerciseLibrary = [

  /* ======================================================================
   * WARMUP BLOCK
   * ====================================================================== */
  makeExercise('add_warm_hip_circle', 'Standing hip circles', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Mobilise the hip in all planes before adductor loading; reduces stiffness around the groin.',
    prescription: '2 x 10 circles each direction per leg',
    cues: ['Large slow circles', 'Hold a wall', 'Keep the torso still'],
    commonMistakes: ['Rotating the whole pelvis'],
    easierAlternative: 'Small comfortable circles',
    harderProgression: 'add_warm_lateral_shuffle',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('add_warm_leg_swing', 'Lateral leg swings', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Warm up adductors and abductors through their working range before loading.',
    prescription: '2 x 10 swings each direction per leg',
    cues: ['Hold a wall', 'Let the leg swing freely side to side', 'Do not force range'],
    commonMistakes: ['Swinging into groin pain', 'Pelvis rotating with the leg'],
    easierAlternative: 'Small range pendulum',
    harderProgression: 'add_warm_lateral_shuffle',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('add_warm_lateral_shuffle', 'Gentle lateral shuffle (warm-up)', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 2,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Progressively load the adductors in their lateral push-off pattern before cutting drills.',
    prescription: '2 x 10 m each direction, slow pace',
    cues: ['Stay low', 'Push off the inside foot gently', 'Stop if groin pulls > 2/10'],
    commonMistakes: ['Going too fast too early', 'Wide crossing steps'],
    easierAlternative: 'add_warm_leg_swing',
    harderProgression: 'Lateral shuffle with band',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Acute groin pain > 3/10 with push-off'],
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('add_warm_groin_mob', 'Seated butterfly / groin mobility', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Gentle hip external-rotation mobility; primes the adductor/hip-flexor region before loading.',
    prescription: '2 x 10 gentle flaps + 30 sec hold',
    cues: ['Feet together, knees out', 'Gentle gravity only — no forcing', 'Breathe out as knees drop'],
    commonMistakes: ['Pressing the knees down with hands too hard'],
    easierAlternative: 'Seated cross-legged stretch',
    harderProgression: 'Half-kneeling groin stretch',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Deep hip pinching pain'],
    painRule: 'Mild tension only — no sharp groin pain.'
  }),

  /* ======================================================================
   * ACTIVATION BLOCK
   * ====================================================================== */
  makeExercise('add_squeeze_short', 'Short-lever adductor squeeze (isometric)', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['ball'],
    purpose: 'Calm adductor pain; lowest-load way to activate the groin tissue; strong analgesic effect.',
    prescription: '5 x 20–30 sec',
    cues: ['Squeeze gently — RPE 3–4 max', 'No sharp inner-thigh pain', 'Breathe normally'],
    commonMistakes: ['Squeezing maximally too soon', 'Holding the breath'],
    easierAlternative: 'Light pillow squeeze, shorter holds',
    harderProgression: 'add_squeeze_long',
    noEquipmentAlternative: 'Squeeze a rolled towel or fist',
    gymAlternative: 'Light adduction machine isometric',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('add_hipflexor_iso', 'Hip-flexor isometric march hold', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Settle iliopsoas and anterior-groin symptoms with a gentle isometric hold.',
    prescription: '4 x 15 sec each side',
    cues: ['Knee lifted to low hip height', 'No sharp anterior groin pain', 'Resist any wobble gently'],
    commonMistakes: ['Lifting the knee too high too soon', 'Leaning backward'],
    easierAlternative: 'Seated march hold (supported)',
    harderProgression: 'Banded standing hip flexion',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Cable hip flexion isometric',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('add_glute_activation', 'Supine glute activation squeeze', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Activate glute max before adductor loading; glute-adductor co-activation is critical for groin stability.',
    prescription: '3 x 10 (3-sec hold each)',
    cues: ['Lie on back, knees bent', 'Squeeze glutes firmly', 'Slight posterior pelvic tilt'],
    commonMistakes: ['Only squeezing one side', 'Tensing quads instead of glutes'],
    easierAlternative: 'Seated glute squeeze',
    harderProgression: 'add_kc_glute_bridge',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),

  /* ======================================================================
   * TARGETED BLOCK  (adductor-specific loading)
   * ====================================================================== */
  makeExercise('add_squeeze_long', 'Long-lever adductor squeeze', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'isometric', isAnchor: false,
    equipment: ['ball'],
    purpose: 'Increase adductor load at a longer lever; progresses from short-lever squeeze.',
    prescription: '4 x 15–20 sec',
    cues: ['Legs straighter', 'Only if short-lever is calm first', 'Stop if groin pulls sharply'],
    commonMistakes: ['Progressing before short-lever is comfortable'],
    easierAlternative: 'add_squeeze_short',
    harderProgression: 'add_banded_adduction',
    noEquipmentAlternative: 'Towel squeeze, legs straighter',
    gymAlternative: 'Adduction machine, light',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_side_lying_adduction', 'Side-lying hip adduction', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 1,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Isolated adductor strengthening through full range without compression.',
    prescription: '3 x 12–15 each side',
    cues: ['Lie on the injured side, bottom leg straight', 'Lift the bottom leg toward the ceiling', '2-sec hold at top'],
    commonMistakes: ['Rolling the pelvis forward', 'Using hip flexors to cheat the lift'],
    easierAlternative: 'add_squeeze_short',
    harderProgression: 'add_banded_adduction',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_banded_adduction', 'Banded standing adduction', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'strength', isAnchor: true,
    equipment: ['band'],
    purpose: 'Dynamic adductor strengthening in a functional standing position.',
    prescription: '3 x 12–15 each side',
    cues: ['Slow inward pull — 3 sec', 'Controlled return — do not let the band snap back'],
    commonMistakes: ['Swinging the leg', 'Leaning the trunk sideways'],
    easierAlternative: 'add_squeeze_long',
    harderProgression: 'add_copenhagen',
    noEquipmentAlternative: 'Standing weight-shift / lateral lunge',
    gymAlternative: 'Cable adduction',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_sumo_squat', 'Sumo squat', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Load the adductors and glutes together through a wide-stance squat pattern.',
    prescription: '3 x 10–12 reps',
    cues: ['Wide stance, toes out 30–45°', 'Knees track over toes', 'Upright torso'],
    commonMistakes: ['Knees caving inward', 'Leaning forward'],
    easierAlternative: 'Half-range sumo squat',
    harderProgression: 'Goblet sumo squat',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Goblet sumo squat with kettlebell',
    avoidIf: ['Acute groin pain > 4/10 with wide stance'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_lateral_lunge', 'Lateral lunge', {
    targetRegion: 'adductor_groin', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Functional lateral loading of adductors and glutes; mimics cutting demands.',
    prescription: '3 x 8–10 each side',
    cues: ['Step wide to the side', 'Hips back on the bending leg', 'Straight leg stays on the ground'],
    commonMistakes: ['Not stepping wide enough', 'Trunk collapsing forward', 'Knee caving in'],
    easierAlternative: 'add_sumo_squat',
    harderProgression: 'Loaded lateral lunge / Cossack squat',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Dumbbell lateral lunge',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_copenhagen', 'Copenhagen plank (knee-supported progression)', {
    targetRegion: 'adductor_groin', phase: 'capacity', difficulty: 4,
    block: 'targeted', slot: 'eccentric', isAnchor: true,
    equipment: ['bench'],
    purpose: 'The most evidence-supported exercise for adductor strength and groin-injury prevention. High-demand.',
    prescription: '3 x 5–8 each side (start knee-supported, progress to foot-supported)',
    cues: ['Hips level throughout', 'Control the lowering phase', 'Start with the knee on the bench — progress gradually'],
    commonMistakes: ['Starting at the full long lever too soon', 'Pelvis dropping'],
    easierAlternative: 'Side plank from knees',
    harderProgression: 'Full-lever Copenhagen (foot on bench)',
    noEquipmentAlternative: 'Modified Copenhagen on a sofa edge',
    gymAlternative: 'Heavy cable adduction',
    avoidIf: ['Acute painful strain in protect phase'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_cossack', 'Cossack squat', {
    targetRegion: 'adductor_groin', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Strength through a deep lateral range; excellent for adductor end-range loading.',
    prescription: '3 x 6–8 each side',
    cues: ['Stay in pain-free range', 'Hips back on the bending side', 'Foot flat or heel elevated'],
    commonMistakes: ['Going too deep too soon', 'Rounding the back'],
    easierAlternative: 'add_lateral_lunge',
    harderProgression: 'Full Cossack squat with weight',
    noEquipmentAlternative: 'Bodyweight lateral lunge',
    gymAlternative: 'Goblet Cossack squat',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_adductor_machine', 'Adductor machine (seated)', {
    targetRegion: 'adductor_groin', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['gym_machine'],
    purpose: 'Isolated adductor strengthening in a controlled, seated position for gym-based phases.',
    prescription: '4 x 10–12 reps',
    cues: ['Full range of motion', '3-sec return (eccentric)', 'No groin pain > 3/10'],
    commonMistakes: ['Smashing through the full range too quickly', 'Too heavy too soon'],
    easierAlternative: 'add_side_lying_adduction',
    harderProgression: 'add_copenhagen',
    noEquipmentAlternative: 'add_banded_adduction',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — GLUTES + HAMSTRINGS  (primary stabiliser partners)
   * ====================================================================== */
  makeExercise('add_kc_glute_bridge', 'Glute bridge (rhythmic reps)', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Activate glute max — glute + adductor co-contraction is critical for groin stability and prevention.',
    prescription: '3 x 12–15 reps',
    cues: ['Full hip extension at top', 'Squeeze glutes hard', 'Controlled lower'],
    commonMistakes: ['Half extension', 'Lower back instead of glutes'],
    easierAlternative: 'add_glute_activation',
    harderProgression: 'add_kc_hip_thrust',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_kc_hip_thrust', 'Hip thrust', {
    targetRegion: 'glutes', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight', 'bench'],
    purpose: 'High-range glute loading; builds the posterior chain to complement adductor work.',
    prescription: '3 x 10–12 reps',
    cues: ['Upper back on bench', 'Full hip extension', 'Chin tuck — no lumbar arch'],
    commonMistakes: ['Lumbar extension instead of hip extension', 'Partial range'],
    easierAlternative: 'add_kc_glute_bridge',
    harderProgression: 'Barbell hip thrust',
    noEquipmentAlternative: 'add_kc_glute_bridge',
    gymAlternative: 'Barbell hip thrust',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_kc_clamshell', 'Clamshell', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight', 'band'],
    purpose: 'Glute medius activation — hip abductor strength balances adductor dominance and prevents groin overload.',
    prescription: '3 x 15 each side',
    cues: ['Feet together', 'Rotate from the hip', '1-sec hold at top'],
    commonMistakes: ['Pelvis rolling back', 'Foot lifting off the ground'],
    easierAlternative: 'Side-lying hip abduction',
    harderProgression: 'add_kc_lateral_band',
    noEquipmentAlternative: 'Same without band',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_kc_lateral_band', 'Lateral band walk', {
    targetRegion: 'glutes', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['band'],
    purpose: 'Hip abductor strength in a functional stance; directly opposes the adductors and builds dynamic stability.',
    prescription: '3 x 12 steps each direction',
    cues: ['Stay low', 'Toes forward', 'Wide steps — resist the band'],
    commonMistakes: ['Standing too upright', 'Narrow steps'],
    easierAlternative: 'add_kc_clamshell',
    harderProgression: 'Monster walk',
    noEquipmentAlternative: 'Side-stepping squat',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_kc_rdl', 'Romanian deadlift', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight', 'dumbbells'],
    purpose: 'Posterior chain loading; hamstring strength is important for groin stability and injury prevention.',
    prescription: '3 x 10–12 reps',
    cues: ['Hip hinge', 'Slow 3-sec lower', 'Strong drive back up'],
    commonMistakes: ['Rounding the back', 'Squatting instead of hinging'],
    easierAlternative: 'Supine bridge hold',
    harderProgression: 'Single-leg RDL',
    noEquipmentAlternative: 'Bodyweight RDL',
    gymAlternative: 'Dumbbell/barbell RDL',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_kc_slider_curl', 'Hamstring slider curl', {
    targetRegion: 'hamstring', phase: 'capacity', difficulty: 3,
    block: 'kinetic_chain', slot: 'eccentric', isAnchor: false,
    equipment: ['bodyweight', 'towel'],
    purpose: 'Eccentric hamstring strength — essential for sprint mechanics and groin injury prevention.',
    prescription: '3 x 5–6 reps (slow out)',
    cues: ['Slow controlled slide out', 'Use arms to assist the return'],
    commonMistakes: ['Sliding too far too early', 'Fast uncontrolled lowering'],
    easierAlternative: 'add_kc_rdl',
    harderProgression: 'Nordic lower',
    noEquipmentAlternative: 'Bridge walkout',
    gymAlternative: 'Leg curl machine',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — CORE / TRUNK  (critical for groin stability)
   * ====================================================================== */
  makeExercise('add_kc_dead_bug', 'Dead bug', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Anti-extension core stability; trunk weakness is a primary driver of groin overload in athletes.',
    prescription: '3 x 6–8 each side',
    cues: ['Lower back flat into floor', 'Breathe out as limbs move', 'Slow and controlled'],
    commonMistakes: ['Lower back arching', 'Moving too fast'],
    easierAlternative: 'Arm-only or leg-only dead bug',
    harderProgression: 'add_kc_bird_dog',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_kc_bird_dog', 'Bird dog', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Lumbopelvic stability; trains anti-rotation essential for cutting and kicking.',
    prescription: '3 x 8 each side',
    cues: ['No hip rotation', 'Full extension of arm and opposite leg', '2-sec hold'],
    commonMistakes: ['Hip hiking', 'Torso rotation'],
    easierAlternative: 'add_kc_dead_bug',
    harderProgression: 'Bird dog with resistance band',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_kc_plank', 'Front plank', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Anterior core endurance; reduces groin compensatory load during sport.',
    prescription: '3 x 20–40 sec',
    cues: ['Straight line head to heel', 'Squeeze glutes and abs', 'Breathe normally'],
    commonMistakes: ['Hips too high or sagging', 'Holding breath'],
    easierAlternative: 'Knee plank',
    harderProgression: 'add_kc_side_plank',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('add_kc_side_plank', 'Side plank', {
    targetRegion: 'core', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Anti-lateral flexion strength; lateral-trunk stiffness is critical for groin/adductor stability.',
    prescription: '3 x 20–30 sec each side',
    cues: ['Hips stacked', 'Top hip does not sag', 'Neutral neck'],
    commonMistakes: ['Hip rotation forward', 'Short hold on weaker side'],
    easierAlternative: 'add_kc_plank',
    harderProgression: 'Side plank hip abduction',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('add_kc_pallof_press', 'Pallof press (anti-rotation)', {
    targetRegion: 'core', phase: 'capacity', difficulty: 3,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['band'],
    purpose: 'Anti-rotation core stability in a standing position; trains the lateral force transfer essential for cutting.',
    prescription: '3 x 10–12 each side',
    cues: ['Stand sideways to the band anchor', 'Push out and hold 2 sec', 'Resist rotation throughout'],
    commonMistakes: ['Letting the torso rotate', 'Arms too fast'],
    easierAlternative: 'add_kc_side_plank',
    harderProgression: 'Pallof press with rotation',
    noEquipmentAlternative: 'Side plank with reach',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — HIP FLEXOR  (antagonist / injury contributor)
   * ====================================================================== */
  makeExercise('add_kc_hip_flex_stretch', 'Kneeling hip flexor stretch', {
    targetRegion: 'hip_flexors', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Release hip-flexor tightness that alters pelvic tilt and loads the adductors — important in groin rehab.',
    prescription: '3 x 30–45 sec each side',
    cues: ['Posterior pelvic tilt to feel the stretch', 'Upright torso', 'No lower back arch'],
    commonMistakes: ['Arching the lower back', 'Leaning forward'],
    easierAlternative: 'Supine hip flexor stretch',
    harderProgression: 'Couch stretch',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Mild tension only — no sharp groin pain.'
  }),

  /* ======================================================================
   * GLOBAL STRENGTH BLOCK  (upper body; safe in all phases)
   * ====================================================================== */
  makeExercise('add_gs_pushup', 'Push-up', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 2,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Maintain upper-body push strength throughout groin rehab; keeps the athlete training.',
    prescription: '3 x 8–12 reps',
    cues: ['Straight line head to heel', 'Full range', 'Elbows 45° to body'],
    commonMistakes: ['Sagging hips', 'Half reps'],
    easierAlternative: 'Incline push-up',
    harderProgression: 'Slow-lowering push-up',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Pain-free. Stop if a wide-base push-up aggravates the groin.'
  }),
  makeExercise('add_gs_band_row', 'Resistance band row', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 1,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['band'],
    purpose: 'Upper-back and rear-shoulder strength; maintains posture and athletic capacity during groin rehab.',
    prescription: '3 x 12–15 reps',
    cues: ['Anchor at chest height', 'Squeeze shoulder blades', 'No torso rocking'],
    commonMistakes: ['Using momentum', 'Shrugging'],
    easierAlternative: 'Band pull-apart',
    harderProgression: 'DB bent-over row',
    noEquipmentAlternative: 'Towel row against door',
    painRule: 'Comfortable.'
  }),
  makeExercise('add_gs_pull_apart', 'Band pull-apart', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 1,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['band'],
    purpose: 'Shoulder health; easy upper-body work safe in every phase.',
    prescription: '3 x 15 reps',
    cues: ['Arms straight', 'Pull to chest height', 'Squeeze rhomboids at the end'],
    commonMistakes: ['Bending elbows', 'No controlled return'],
    easierAlternative: 'Smaller range pull-apart',
    noEquipmentAlternative: 'None (band required)',
    painRule: 'Comfortable.'
  }),
  makeExercise('add_gs_db_press', 'Dumbbell shoulder press (seated)', {
    targetRegion: 'upper_body', phase: 'restore', difficulty: 2,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['dumbbells'],
    purpose: 'Overhead pressing; maintains upper-body power while lower limb is in groin rehab.',
    prescription: '3 x 10 reps',
    cues: ['Seated for stability', 'Core tight', 'Full range overhead'],
    commonMistakes: ['Arching lower back', 'Partial range'],
    harderProgression: 'Standing press',
    noEquipmentAlternative: 'Pike push-up',
    avoidIf: ['Shoulder injury'],
    painRule: 'Comfortable.'
  }),

  /* ======================================================================
   * NEUROMUSCULAR BLOCK
   * ====================================================================== */
  makeExercise('add_nm_sl_stand', 'Single-leg balance', {
    targetRegion: 'hip_knee', phase: 'restore', difficulty: 2,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Proprioceptive retraining of the hip-adductor complex; essential for cutting mechanics.',
    prescription: '3 x 20–30 sec each leg',
    cues: ['Soft knee', 'Eyes on a fixed point', 'Minimise wobble'],
    commonMistakes: ['Locking the knee', 'Gripping toes'],
    easierAlternative: 'Weight shift to one leg',
    harderProgression: 'add_nm_sl_reach',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_nm_sl_reach', 'Single-leg reach (Y-balance style)', {
    targetRegion: 'hip_knee', phase: 'capacity', difficulty: 3,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Dynamic balance challenge; reveals hip/adductor control deficits before return to cutting sport.',
    prescription: '3 x 6 reaches each direction, each leg',
    cues: ['Reach as far as possible', 'Return without touching the ground'],
    commonMistakes: ['Rushing', 'Excessive trunk lean'],
    easierAlternative: 'add_nm_sl_stand',
    harderProgression: 'Reach while being lightly disturbed',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_nm_lateral_hop', 'Lateral hop and stabilize', {
    targetRegion: 'adductor_groin', phase: 'speed', difficulty: 4,
    block: 'neuromuscular', slot: 'power', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Eccentric lateral deceleration control; mirrors the push-off and landing demands of cutting.',
    prescription: '3 x 5 hops each leg — hold 2 sec on landing',
    cues: ['Soft landing on a bent knee', 'Stick before moving', 'No groin grab on landing'],
    commonMistakes: ['Stiff landing', 'Immediately rebounding'],
    easierAlternative: 'add_nm_sl_reach',
    harderProgression: 'Reactive lateral hop',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Any groin pain on lateral push-off or landing'],
    painRule: PAIN_RULES.impact
  }),

  /* ======================================================================
   * CONDITIONING BLOCK
   * ====================================================================== */
  makeExercise('add_cond_bike', 'Stationary bike (low resistance)', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['stationary_bike'],
    purpose: 'Cardiovascular fitness with minimal groin load; seat height controls the hip-range demand.',
    prescription: '15–20 min, low resistance, comfortable cadence',
    cues: ['Easy effort', 'No groin pulling during pedalling', 'Seat height allows comfortable hip range'],
    commonMistakes: ['Resistance too high', 'Rushing to progress'],
    easierAlternative: 'Short 10-min ride',
    harderProgression: 'Increase time then resistance',
    noEquipmentAlternative: 'add_cond_pool',
    avoidIf: ['Groin pain > 3/10 during pedalling'],
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('add_cond_pool', 'Pool running / water walking', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['pool'],
    purpose: 'Buoyancy offloading for cardiovascular fitness while protecting the groin.',
    prescription: '15–25 min',
    cues: ['Running pattern — drive knees forward', 'Stay upright', 'Running arm action'],
    commonMistakes: ['Cycling legs instead of running pattern'],
    easierAlternative: 'Water walking',
    harderProgression: 'Deep-water running with vest',
    noEquipmentAlternative: 'add_cond_bike',
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('add_cond_walk', 'Brisk walking', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['open_space'],
    purpose: 'Gentle cardiovascular fitness; keeps the lower limb moving through normal gait.',
    prescription: '15–20 min comfortable walking',
    cues: ['Normal gait — no limp', 'Stop if groin pulls > 3/10'],
    commonMistakes: ['Limping through pain'],
    easierAlternative: 'Short 5-min stroll',
    harderProgression: 'add_cond_jog_walk',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Clear limp'],
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('add_cond_jog_walk', 'Jog-walk intervals', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 2,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['open_space'],
    purpose: 'Gentle straight-line return to running; progressively loads the adductors through the running pattern.',
    prescription: '20 min: 1 min jog / 2 min walk × 6–7 rounds',
    cues: ['Straight line — no lateral movement yet', 'Easy pace', 'No groin tightness > 3/10'],
    commonMistakes: ['Jogging too fast', 'Lateral cuts before ready'],
    easierAlternative: 'add_cond_walk',
    harderProgression: 'add_cond_lateral_run',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Groin pain > 3/10 during jogging'],
    painRule: PAIN_RULES.impact
  }),
  makeExercise('add_cond_lateral_run', 'Lateral jogging and direction change', {
    targetRegion: 'adductor_groin', phase: 'speed', difficulty: 3,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['open_space'],
    purpose: 'Reintroduce lateral movement and gradual change-of-direction demands.',
    prescription: '4 × 20 m lateral jog each direction; 5 × gentle 45° cuts',
    cues: ['Controlled pace — no sharp changes first', 'Monitor for any groin pull > 2/10'],
    commonMistakes: ['Sharp reactive cuts too early', 'No monitoring of groin response'],
    easierAlternative: 'add_cond_jog_walk',
    harderProgression: 'add_cutting_drill',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Groin pain > 2/10 with lateral push-off'],
    painRule: PAIN_RULES.impact
  }),
  makeExercise('add_cutting_drill', 'Planned cutting drill', {
    targetRegion: 'adductor_groin', phase: 'return', difficulty: 4,
    block: 'conditioning', slot: 'conditioning', isAnchor: true,
    equipment: ['cones'],
    purpose: 'Reintroduce change-of-direction under controlled, predictable conditions.',
    prescription: '4 × 4 reps; progress angle from 45° to 90°; 2 min recovery',
    cues: ['Controlled planned angles before sharp reactive cuts', 'No groin pull on push-off', 'Full recovery between reps'],
    commonMistakes: ['Reactive sharp cuts on day one', 'No monitoring between reps'],
    easierAlternative: 'add_cond_lateral_run',
    harderProgression: 'Reactive cutting with visual cue',
    noEquipmentAlternative: 'Use landmarks/markers',
    gymAlternative: 'Lateral sled push',
    painRule: PAIN_RULES.impact
  }),

  /* ======================================================================
   * COOLDOWN BLOCK
   * ====================================================================== */
  makeExercise('add_cool_butterfly', 'Supine butterfly / groin release', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'cooldown', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Gentle end-of-session groin release; parasympathetic cool-down after adductor loading.',
    prescription: '2 × 45 sec',
    cues: ['Soles of feet together, knees out', 'Gravity only — no pressing', 'Breathe slowly'],
    commonMistakes: ['Pressing the knees down too hard', 'Bouncing'],
    easierAlternative: 'Legs straight supine rest',
    harderProgression: 'N/A',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Mild tension only — no sharp groin pain.'
  }),
  makeExercise('add_cool_prone', 'Prone lying rest / prone breathing', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1,
    block: 'cooldown', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Offload the hip and groin; calm the nervous system after loading.',
    prescription: '3–5 min',
    cues: ['Face down, arms relaxed', 'Breathe slowly', 'Legs in comfortable neutral position'],
    commonMistakes: ['Skipping cooldown after intense sessions'],
    easierAlternative: 'Supine rest',
    harderProgression: 'N/A',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Fully pain-free.'
  })
];

const rehabProtocols = [
  makeProtocol('acute_adductor_strain', {
    name: 'Acute adductor strain pathway',
    summary: 'Settle, build adductor strength, return to cutting sports.',
    appliesToSubtypes: [
      'adductor_longus_strain',
      'adductor_magnus_strain',
      'adductor_brevis_deep_groin_irritation',
      'gracilis_irritation'
    ],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Protect and settle',
        goal: 'Calm the strain; lowest-load adductor activation plus full-body work that does not stress the groin.',
        estimatedDuration: '3–7 days',
        intensityGuidance: 'RPE 2–4',
        painRules: PAIN_RULES.earlyStrain,
        avoid: ['Cutting', 'Kicking', 'Wide stances', 'Passive stretching into pain'],
        progressionCriteria: ['Short-lever squeeze calm ≤2/10 for 2+ sessions'],
        regressionCriteria: ['Pain spikes above 3/10 or does not settle overnight'],
        exercises: [
          // warmup
          'add_warm_hip_circle', 'add_warm_groin_mob',
          // activation
          'add_squeeze_short', 'add_hipflexor_iso', 'add_glute_activation',
          // kinetic_chain
          'add_kc_glute_bridge', 'add_kc_clamshell', 'add_kc_dead_bug', 'add_kc_bird_dog',
          'add_kc_plank', 'add_kc_hip_flex_stretch',
          // conditioning
          'add_cond_bike', 'add_cond_pool', 'add_cond_walk',
          // cooldown
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('restore', {
        name: 'Phase 2 – Restore strength',
        goal: 'Build adductor tolerance through progressive dynamic loading.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 4–6',
        painRules: PAIN_RULES.loading,
        avoid: ['Sharp cutting', 'High-speed lateral movement'],
        progressionCriteria: ['Long-lever squeeze calm', 'Banded adduction comfortable x3 sets', 'No next-day flare'],
        regressionCriteria: ['Next-day pain increase'],
        exercises: [
          // warmup
          'add_warm_hip_circle', 'add_warm_leg_swing', 'add_warm_groin_mob',
          // activation
          'add_squeeze_short', 'add_hipflexor_iso', 'add_glute_activation',
          // targeted
          'add_squeeze_long', 'add_side_lying_adduction', 'add_banded_adduction', 'add_sumo_squat',
          // kinetic_chain
          'add_kc_glute_bridge', 'add_kc_hip_thrust', 'add_kc_clamshell', 'add_kc_lateral_band',
          'add_kc_rdl', 'add_kc_dead_bug', 'add_kc_bird_dog', 'add_kc_plank', 'add_kc_side_plank',
          'add_kc_hip_flex_stretch',
          // neuromuscular
          'add_nm_sl_stand',
          // conditioning
          'add_cond_bike', 'add_cond_pool', 'add_cond_walk', 'add_cond_jog_walk',
          // cooldown
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 3 – Build capacity',
        goal: 'Develop adductor and whole-leg strength to sport-ready levels.',
        estimatedDuration: '2–3 weeks',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.loading,
        avoid: ['Returning to sport before Copenhagen-level strength'],
        progressionCriteria: ['Copenhagen tolerated (knee-lever)', 'Cossack squat comfortable', 'Single-leg balance solid'],
        regressionCriteria: ['Strength work flares symptoms into next day'],
        exercises: [
          // warmup
          'add_warm_hip_circle', 'add_warm_leg_swing', 'add_warm_lateral_shuffle', 'add_warm_groin_mob',
          // activation
          'add_squeeze_short', 'add_glute_activation',
          // targeted
          'add_banded_adduction', 'add_sumo_squat', 'add_lateral_lunge', 'add_copenhagen',
          'add_cossack', 'add_adductor_machine',
          // kinetic_chain
          'add_kc_hip_thrust', 'add_kc_clamshell', 'add_kc_lateral_band',
          'add_kc_rdl', 'add_kc_slider_curl',
          'add_kc_plank', 'add_kc_side_plank', 'add_kc_pallof_press',
          'add_kc_hip_flex_stretch',
          // neuromuscular
          'add_nm_sl_stand', 'add_nm_sl_reach',
          // conditioning
          'add_cond_bike', 'add_cond_jog_walk',
          // cooldown
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('return', {
        name: 'Phase 4 – Return to sport',
        goal: 'Reintroduce cutting, kicking and sport-specific demands.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 7–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Sharp reactive cuts before planned cutting is fully calm'],
        progressionCriteria: ['Planned cutting drills calm', 'Lateral hop and hold controlled', 'Full session with no groin complaint'],
        regressionCriteria: ['Groin pull returns on cutting or kicking'],
        exercises: [
          // warmup
          'add_warm_hip_circle', 'add_warm_leg_swing', 'add_warm_lateral_shuffle',
          // activation
          'add_glute_activation',
          // targeted
          'add_banded_adduction', 'add_lateral_lunge', 'add_copenhagen', 'add_cossack',
          // kinetic_chain
          'add_kc_hip_thrust', 'add_kc_lateral_band',
          'add_kc_rdl', 'add_kc_slider_curl',
          'add_kc_side_plank', 'add_kc_pallof_press',
          // neuromuscular
          'add_nm_sl_stand', 'add_nm_sl_reach', 'add_nm_lateral_hop',
          // conditioning
          'add_cond_jog_walk', 'add_cond_lateral_run', 'add_cutting_drill',
          // cooldown
          'add_cool_butterfly', 'add_cool_prone'
        ]
      })
    ]
  }),
  makeProtocol('adductor_tendon', {
    name: 'Adductor tendon pathway',
    summary: 'Progressive tendon loading.',
    appliesToSubtypes: ['adductor_tendinopathy'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Settle the tendon',
        goal: 'Calm symptoms with sustained isometrics; avoid compressive end-range loads.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 2–4',
        painRules: PAIN_RULES.isometric,
        avoid: ['Sudden load spikes', 'Passive stretching of the groin', 'Wide stance in pain'],
        progressionCriteria: ['Isometrics comfortable ≤2/10 for 3+ sessions'],
        regressionCriteria: ['Pain climbing session to session'],
        exercises: [
          'add_warm_hip_circle', 'add_warm_groin_mob',
          'add_squeeze_short', 'add_hipflexor_iso', 'add_glute_activation',
          'add_kc_glute_bridge', 'add_kc_clamshell', 'add_kc_dead_bug', 'add_kc_bird_dog',
          'add_kc_plank', 'add_kc_hip_flex_stretch',
          'add_nm_sl_stand',
          'add_cond_bike', 'add_cond_pool',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 2 – Load the tendon',
        goal: 'Progressive tendon loading; tolerance-based progression.',
        estimatedDuration: '3–6 weeks',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.tendon,
        avoid: ['Load spikes', 'Pain that does not settle to baseline next morning'],
        progressionCriteria: ['Banded adduction and Copenhagen tolerated', 'No next-morning flare'],
        regressionCriteria: ['Tendon pain rising across sessions'],
        exercises: [
          'add_warm_hip_circle', 'add_warm_leg_swing', 'add_warm_groin_mob',
          'add_squeeze_short', 'add_glute_activation',
          'add_squeeze_long', 'add_side_lying_adduction', 'add_banded_adduction',
          'add_sumo_squat', 'add_lateral_lunge', 'add_copenhagen',
          'add_kc_hip_thrust', 'add_kc_lateral_band', 'add_kc_rdl',
          'add_kc_plank', 'add_kc_side_plank', 'add_kc_pallof_press',
          'add_nm_sl_stand', 'add_nm_sl_reach',
          'add_cond_bike', 'add_cond_jog_walk',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('return', {
        name: 'Phase 3 – Return to sport',
        goal: 'Reintroduce sport-specific cutting and kicking load.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 7–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Big single-session load jumps'],
        progressionCriteria: ['Cutting and kicking calm', 'Symptom VAS ≤2/10 during sport exposure'],
        regressionCriteria: ['Tendon pain returns'],
        exercises: [
          'add_warm_leg_swing', 'add_warm_lateral_shuffle',
          'add_glute_activation',
          'add_banded_adduction', 'add_lateral_lunge', 'add_copenhagen', 'add_cossack',
          'add_kc_hip_thrust', 'add_kc_lateral_band', 'add_kc_rdl', 'add_kc_slider_curl',
          'add_kc_side_plank', 'add_kc_pallof_press',
          'add_nm_sl_reach', 'add_nm_lateral_hop',
          'add_cond_jog_walk', 'add_cond_lateral_run', 'add_cutting_drill',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      })
    ]
  }),
  makeProtocol('pubic_overload', {
    name: 'Pubic-related overload pathway',
    summary: 'Reduce load, build balanced strength around the pubis.',
    appliesToSubtypes: ['pubic_related_groin_pain'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Reduce load',
        goal: 'Settle pubic symptoms; gentle co-activation without provocative movement.',
        estimatedDuration: '1–3 weeks',
        intensityGuidance: 'RPE 2–4',
        painRules: PAIN_RULES.isometric,
        avoid: ['Sit-ups', 'Heavy bracing', 'Sharp cutting', 'Kicking', 'Wide groin stretch'],
        progressionCriteria: ['Daily resting symptoms easing over 3+ days'],
        regressionCriteria: ['Symptoms rising or not settling'],
        exercises: [
          'add_warm_hip_circle', 'add_warm_groin_mob',
          'add_squeeze_short', 'add_hipflexor_iso', 'add_glute_activation',
          'add_kc_glute_bridge', 'add_kc_clamshell', 'add_kc_dead_bug', 'add_kc_bird_dog',
          'add_kc_plank', 'add_kc_hip_flex_stretch',
          'add_nm_sl_stand',
          'add_cond_bike', 'add_cond_pool',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 2 – Balanced strength',
        goal: 'Strengthen adductors and trunk together; balanced adductor-abdominal load.',
        estimatedDuration: '4–8 weeks',
        intensityGuidance: 'RPE 5–7',
        painRules: PAIN_RULES.loading,
        avoid: ['Rapid return to sport', 'Any exercise that spikes central pubic pain'],
        progressionCriteria: ['Adductor and core strength progressing without pubic flare'],
        regressionCriteria: ['Pubic pain rising across sessions'],
        exercises: [
          'add_warm_hip_circle', 'add_warm_leg_swing', 'add_warm_groin_mob',
          'add_squeeze_short', 'add_glute_activation',
          'add_squeeze_long', 'add_side_lying_adduction', 'add_banded_adduction',
          'add_sumo_squat', 'add_lateral_lunge', 'add_copenhagen',
          'add_kc_hip_thrust', 'add_kc_lateral_band', 'add_kc_rdl',
          'add_kc_plank', 'add_kc_side_plank', 'add_kc_pallof_press',
          'add_nm_sl_stand', 'add_nm_sl_reach',
          'add_cond_bike', 'add_cond_jog_walk',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('return', {
        name: 'Phase 3 – Return to sport',
        goal: 'Gradual sport exposure; cutting and kicking under controlled conditions.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Load spikes', 'Reactive cutting before planned cutting is calm'],
        progressionCriteria: ['Cutting and kicking calm', 'No pubic pain during or 24h after sport'],
        regressionCriteria: ['Symptoms recur with sport exposure'],
        exercises: [
          'add_warm_leg_swing', 'add_warm_lateral_shuffle',
          'add_glute_activation',
          'add_banded_adduction', 'add_lateral_lunge', 'add_copenhagen', 'add_cossack',
          'add_kc_hip_thrust', 'add_kc_lateral_band', 'add_kc_rdl', 'add_kc_slider_curl',
          'add_kc_side_plank', 'add_kc_pallof_press',
          'add_nm_sl_reach', 'add_nm_lateral_hop',
          'add_cond_jog_walk', 'add_cond_lateral_run', 'add_cutting_drill',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      })
    ]
  }),
  makeProtocol('hip_flexor', {
    name: 'Iliopsoas / hip-flexor pathway',
    summary: 'Settle hip-flexor symptoms and rebuild strength.',
    appliesToSubtypes: ['iliopsoas_hip_flexor_related_groin_pain'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Settle',
        goal: 'Calm hip-flexor irritation with gentle isometrics and non-provocative movement.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 2–4',
        painRules: PAIN_RULES.isometric,
        avoid: ['Aggressive hip-flexor stretching', 'High knee lifting', 'Sprinting'],
        progressionCriteria: ['Isometric holds calm ≤2/10 for 2+ sessions'],
        regressionCriteria: ['Anterior groin pain rising'],
        exercises: [
          'add_warm_hip_circle', 'add_warm_groin_mob',
          'add_hipflexor_iso', 'add_glute_activation',
          'add_kc_glute_bridge', 'add_kc_dead_bug', 'add_kc_bird_dog', 'add_kc_plank',
          'add_nm_sl_stand',
          'add_cond_bike', 'add_cond_pool',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 2 – Strengthen',
        goal: 'Build hip-flexor and adductor capacity through progressive loading.',
        estimatedDuration: '2–4 weeks',
        intensityGuidance: 'RPE 5–7',
        painRules: PAIN_RULES.loading,
        avoid: ['Speed work or high knee lifting before isometrics are comfortable'],
        progressionCriteria: ['Resisted hip flexion calm', 'Dynamic adductor work well tolerated'],
        regressionCriteria: ['Symptoms increase with loading'],
        exercises: [
          'add_warm_hip_circle', 'add_warm_leg_swing', 'add_warm_groin_mob',
          'add_hipflexor_iso', 'add_glute_activation',
          'add_squeeze_long', 'add_banded_adduction', 'add_sumo_squat',
          'add_kc_glute_bridge', 'add_kc_hip_thrust', 'add_kc_lateral_band',
          'add_kc_rdl', 'add_kc_plank', 'add_kc_side_plank', 'add_kc_hip_flex_stretch',
          'add_nm_sl_stand', 'add_nm_sl_reach',
          'add_cond_bike', 'add_cond_jog_walk',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      }),
      makePhase('return', {
        name: 'Phase 3 – Return',
        goal: 'Reintroduce running and sport-specific movement.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Big sprint volume jumps'],
        progressionCriteria: ['Running calm', 'No anterior groin pain during or after jogging'],
        regressionCriteria: ['Hip-flexor pain returns with running or cutting'],
        exercises: [
          'add_warm_leg_swing', 'add_warm_lateral_shuffle',
          'add_glute_activation',
          'add_banded_adduction', 'add_lateral_lunge', 'add_cossack',
          'add_kc_hip_thrust', 'add_kc_lateral_band', 'add_kc_rdl',
          'add_kc_side_plank', 'add_kc_pallof_press', 'add_kc_hip_flex_stretch',
          'add_nm_sl_reach', 'add_nm_lateral_hop',
          'add_cond_jog_walk', 'add_cond_lateral_run', 'add_cutting_drill',
          'add_cool_butterfly', 'add_cool_prone'
        ]
      })
    ]
  }),
  makeProtocol('deep_hip_referral', {
    name: 'Deep hip-joint pathway (cautious / review)',
    summary: 'Conservative loading with a recommendation for clinical review.',
    appliesToSubtypes: ['deep_hip_joint_related_pain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Cautious care and review', goal: 'Avoid provocation and arrange a review.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Pain-free only', painRules: 'Keep everything pain-free.', avoid: ['Deep end-range hip loading', 'Provocative rotation', 'Impact'], progressionCriteria: ['Only progress under guidance'], regressionCriteria: ['Any catching/locking — seek review sooner'], exercises: ['add_hipflexor_iso'] })
    ]
  }),
  makeProtocol('pubalgia_referral', {
    name: 'Athletic pubalgia / hernia suspicion (review first)',
    summary: 'Recommend in-person assessment before loading.',
    appliesToSubtypes: ['athletic_pubalgia_suspicion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Seek review', goal: 'Arrange assessment to rule out a hernia/pubalgia.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Gentle, pain-free only', painRules: 'Keep everything pain-free.', avoid: ['Sit-ups', 'Heavy bracing', 'Cutting/kicking'], progressionCriteria: ['Progress only after review'], regressionCriteria: ['Worsening — seek review sooner'], exercises: ['add_hipflexor_iso'] })
    ]
  }),
  makeProtocol('severe_risk', {
    name: 'Higher-grade groin injury (conservative early care)',
    summary: 'Conservative early care while arranging review.',
    appliesToSubtypes: ['severe_groin_injury_risk'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and review', goal: 'Protect and arrange assessment.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Pain-free only', painRules: 'Do not push through pain.', avoid: ['Strength testing the injury', 'Sport', 'Stretching into pain'], progressionCriteria: ['Progress under guidance'], regressionCriteria: ['Any worsening'], exercises: ['add_squeeze_short'] })
    ]
  })
];

const returnToSport = {
  genericLadder: [
    'Pain-free walking',
    'Pain-free jogging',
    'Lateral shuffle',
    'Planned change of direction',
    'Submax kicking',
    'Reactive cutting',
    'Full training',
    'Match return'
  ],
  criteriaToReturn: [
    'Adductor strength close to the other side',
    'Cutting and kicking rehearsed without groin pain',
    'No pain with squeeze testing'
  ],
  sportSpecific: {
    'Football / soccer': ['Add lateral shuffle, planned cuts, then submax passing/striking.'],
    Basketball: ['Add defensive sliding and reactive cutting.'],
    'Tennis / padel': ['Rehearse lateral lunges and recovery steps.']
  }
};

const maintenancePlan = {
  goal: 'Maintain adductor strength to reduce groin reinjury risk.',
  frequency: '2 short sessions per week',
  exercises: ['add_copenhagen', 'add_banded_adduction'],
  preventionNotes: [
    'Keep the Copenhagen exercise in your weekly routine.',
    'Build cutting/kicking volume gradually after layoffs.'
  ]
};

const adductorGroin = {
  id: 'adductor_groin',
  name: 'Adductor / groin',
  shortDescription:
    'Inner-thigh and groin injuries spanning adductor strains, tendon pain, pubic overload, hip-flexor and deep-hip patterns.',
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

export default adductorGroin;
