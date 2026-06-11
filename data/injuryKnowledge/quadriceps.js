/**
 * quadriceps.js
 * ---------------------------------------------------------------------------
 * Knowledge model for quadriceps / anterior-thigh injuries.
 * Same structure and rule format as hamstring.js.
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
  { id: 'rectus_femoris_strain', name: 'Rectus femoris strain', riskLevel: 'moderate', rehabPathway: 'acute_quad_strain', note: 'Front-centre thigh; common with sprinting/kicking.' },
  { id: 'vastus_lateralis_strain', name: 'Vastus lateralis strain', riskLevel: 'moderate', rehabPathway: 'acute_quad_strain', note: 'Outer quad strain.' },
  { id: 'vastus_medialis_irritation', name: 'Vastus medialis irritation', riskLevel: 'low', rehabPathway: 'acute_quad_strain', note: 'Inner quad near the knee.' },
  { id: 'quadriceps_contusion', name: 'Quadriceps contusion (dead leg)', riskLevel: 'moderate', rehabPathway: 'contusion', note: 'Direct-blow bruise to the thigh.' },
  { id: 'quadriceps_tendon_pain', name: 'Quadriceps tendon pain', riskLevel: 'moderate', rehabPathway: 'tendon', note: 'Pain above the kneecap; load like a tendon.' },
  { id: 'patellar_tendon_overlap', name: 'Patellar tendon overlap (below kneecap)', riskLevel: 'moderate', rehabPathway: 'tendon', note: 'Below-kneecap tendon pain overlapping with knee.' },
  { id: 'hip_flexor_rectus_femoris_overlap', name: 'Hip-flexor / rectus femoris overlap (upper thigh)', riskLevel: 'moderate', rehabPathway: 'acute_quad_strain', note: 'Upper anterior thigh / hip-flexor crossover.' },
  { id: 'femoral_nerve_related_anterior_thigh_pain', name: 'Nerve-related anterior thigh pain', riskLevel: 'refer', rehabPathway: 'nerve_referral', note: 'Burning/numb anterior thigh; cautious pathway.' },
  { id: 'severe_quad_tear_risk', name: 'Possible higher-grade quad tear', riskLevel: 'refer', rehabPathway: 'severe_risk', note: 'Features suggesting a more significant tear.' }
];

const anatomyRegions = ['quadriceps'];

const detailedAreas = [
  { id: 'front_rectus_femoris', name: 'Front-centre thigh (rectus femoris)' },
  { id: 'rectus_femoris', name: 'Rectus femoris (mid)' },
  { id: 'front_vastus_lateralis', name: 'Outer quad (vastus lateralis)' },
  { id: 'front_vastus_medialis', name: 'Inner quad (vastus medialis)' },
  { id: 'quad_tendon_area', name: 'Quad tendon (above kneecap)' },
  { id: 'front_thigh_middle', name: 'Mid front thigh' },
  { id: 'front_thigh_upper', name: 'Upper front thigh' },
  { id: 'front_thigh_lower', name: 'Lower front thigh' },
  { id: 'anterior_hip_thigh', name: 'Anterior hip / upper thigh' },
  { id: 'patellar_tendon_area', name: 'Patellar tendon (below kneecap)' }
];

const assessmentQuestions = [
  makeQuestion('mechanism', 'How did the pain start?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'sprinting', label: 'Sprinting' },
      { value: 'kicking', label: 'Kicking' },
      { value: 'jumping', label: 'Jumping / landing' },
      { value: 'contact', label: 'Direct blow / contact' },
      { value: 'gradual', label: 'Gradually' }
    ]
  }),
  makeQuestion('onset', 'Sudden or gradual?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'sudden_sharp', label: 'Sudden, sharp pull' },
      { value: 'gradual', label: 'Gradual' }
    ]
  }),
  makeQuestion('lift_knee_pain', 'Pain lifting the knee (hip flexion)?', 'boolean', { category: 'symptom' }),
  makeQuestion('straighten_knee_pain', 'Pain straightening the knee against resistance?', 'boolean', { category: 'symptom' }),
  makeQuestion('downstairs_pain', 'Pain going downstairs?', 'boolean', { category: 'symptom' }),
  makeQuestion('bruising_swelling', 'Any bruising or swelling?', 'single', {
    category: 'symptom',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'significant', label: 'Significant' }
    ]
  }),
  makeQuestion('deadleg_symptoms', 'Did it follow a direct knock (dead-leg)?', 'boolean', { category: 'mechanism' }),
  makeQuestion('pain_above_kneecap', 'Is the pain just above the kneecap?', 'boolean', { category: 'symptom' }),
  makeQuestion('pain_below_kneecap', 'Is the pain just below the kneecap?', 'boolean', { category: 'symptom' }),
  makeQuestion('numbness_burning', 'Any numbness or burning in the front thigh?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'urgent' }
  }),
  makeQuestion('previous_quad', 'Have you injured this quad before?', 'boolean', { category: 'history' })
];

const selfTests = [
  makeSelfTest('resisted_knee_extension', 'Resisted knee extension', {
    purpose: 'Loads the quadriceps as a knee extensor.',
    howTo: ['Seated, gently straighten the knee against light resistance.'],
    whatPositiveSuggests: 'Reproduced front-thigh pain points to a quad strain/tendon load.',
    whatItDoesNotProve: 'Cannot localize the exact muscle or grade.'
  }),
  makeSelfTest('resisted_hip_flexion', 'Resisted hip flexion', {
    purpose: 'Screens rectus femoris / hip-flexor crossover.',
    howTo: ['Seated, lift the knee against gentle downward resistance.'],
    whatPositiveSuggests: 'Upper anterior thigh pain points to rectus femoris/hip-flexor.',
    whatItDoesNotProve: 'Cannot exclude hip-joint sources.'
  }),
  makeSelfTest('bodyweight_squat', 'Bodyweight squat tolerance', {
    purpose: 'Functional quad load.',
    howTo: ['Squat to a comfortable depth and back up.'],
    whatPositiveSuggests: 'Front-thigh/knee pain reflects load sensitivity.',
    whatItDoesNotProve: 'Does not localize structure.'
  }),
  makeSelfTest('step_down', 'Step-down tolerance', {
    purpose: 'Eccentric quad and knee load.',
    howTo: ['Step down slowly from a low step on one leg.'],
    whatPositiveSuggests: 'Pain below/around the kneecap suggests tendon or patellofemoral load.',
    whatItDoesNotProve: 'Does not confirm tendon vs joint.',
    doNotPerformIf: ['Marked knee swelling', 'Giving way']
  }),
  makeSelfTest('prone_knee_bend', 'Gentle prone knee-bend tolerance', {
    purpose: 'Screens quad/rectus femoris length sensitivity.',
    howTo: ['Lie face down, gently bend the knee to bring the heel toward the buttock.'],
    whatPositiveSuggests: 'A tight, painful stretch can reflect a quad strain.',
    whatItDoesNotProve: 'Cannot grade the injury.'
  }),
  makeSelfTest('wall_sit', 'Wall-sit tolerance', {
    purpose: 'Isometric quad load.',
    howTo: ['Sit against a wall at a comfortable knee angle and hold.'],
    whatPositiveSuggests: 'Tolerable holds suggest readiness for isometric loading.',
    whatItDoesNotProve: 'Does not confirm sprint/jump readiness.'
  }),
  makeSelfTest('single_leg_sit_to_stand', 'Single-leg sit-to-stand screen', {
    purpose: 'Functional single-leg quad strength screen.',
    howTo: ['From a chair, stand on one leg if able.'],
    whatPositiveSuggests: 'Difficulty/pain reflects quad strength deficit.',
    whatItDoesNotProve: 'Not a graded test.',
    doNotPerformIf: ['Knee giving way', 'Severe pain']
  }),
  makeSelfTest('palpation_screen', 'Palpation screen (contusion/tendon)', {
    purpose: 'Locate tenderness for contusion vs tendon.',
    howTo: ['Gently press the painful area.', 'Note if it is a muscle bruise vs a point above/below the kneecap.'],
    whatPositiveSuggests: 'Focal tendon tenderness vs a diffuse bruise helps separate patterns.',
    whatItDoesNotProve: 'Palpation alone cannot grade injury.',
    capturesPain: true
  })
];

const redFlags = [
  {
    id: 'quad_severe_tear_signs',
    triggerAnswers: [
      { questionId: 'bruising_swelling', value: 'significant' },
      { questionId: 'straighten_knee_pain', value: true }
    ],
    requireCount: 2,
    severity: 'urgent',
    message:
      'Significant bruising with marked weakness straightening the knee can indicate a higher-grade quad or tendon tear and warrants in-person review.'
  },
  {
    id: 'quad_compartment_after_contusion',
    triggerAnswers: [
      { questionId: 'deadleg_symptoms', value: true },
      { questionId: 'numbness_burning', value: true }
    ],
    requireCount: 2,
    severity: 'urgent',
    message:
      'A severe dead-leg with escalating pain, tightness, or numbness can rarely indicate compartment syndrome — seek urgent assessment.'
  }
];

const diagnosisRules = [
  {
    subtypeId: 'rectus_femoris_strain',
    conditions: [
      { type: 'area', value: ['front_rectus_femoris', 'rectus_femoris', 'front_thigh_middle'], points: 26, reason: 'Pain matches the front-centre thigh (rectus femoris).' },
      { type: 'answer', questionId: 'mechanism', value: 'kicking', points: 16, reason: 'Kicking strongly loads rectus femoris.' },
      { type: 'answer', questionId: 'mechanism', value: 'sprinting', points: 12, reason: 'Sprinting loads the rectus femoris.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: 12, reason: 'Sudden onset fits a strain.' },
      { type: 'selfTest', testId: 'resisted_knee_extension', result: 'painful', points: 12, reason: 'Resisted knee extension reproduced symptoms.' },
      { type: 'answer', questionId: 'deadleg_symptoms', value: true, points: -12, reason: 'A direct knock points more to a contusion.' }
    ]
  },
  {
    subtypeId: 'vastus_lateralis_strain',
    conditions: [
      { type: 'area', value: ['front_vastus_lateralis'], points: 28, reason: 'Pain is in the outer quad.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: 10, reason: 'Sudden onset fits a strain.' },
      { type: 'selfTest', testId: 'resisted_knee_extension', result: 'painful', points: 12, reason: 'Resisted extension reproduced symptoms.' }
    ]
  },
  {
    subtypeId: 'vastus_medialis_irritation',
    conditions: [
      { type: 'area', value: ['front_vastus_medialis'], points: 26, reason: 'Pain is in the inner quad near the knee.' },
      { type: 'answer', questionId: 'downstairs_pain', value: true, points: 10, reason: 'Pain with stairs fits anterior-knee/quad load.' }
    ]
  },
  {
    subtypeId: 'quadriceps_contusion',
    conditions: [
      { type: 'answer', questionId: 'deadleg_symptoms', value: true, points: 26, reason: 'Followed a direct knock (dead-leg).' },
      { type: 'answer', questionId: 'mechanism', value: 'contact', points: 20, reason: 'Direct contact mechanism.' },
      { type: 'answer', questionId: 'bruising_swelling', value: 'significant', points: 12, reason: 'Bruising fits a contusion.' },
      { type: 'selfTest', testId: 'palpation_screen', result: 'painful', points: 8, reason: 'Tender muscle belly on palpation.' }
    ]
  },
  {
    subtypeId: 'quadriceps_tendon_pain',
    conditions: [
      { type: 'area', value: ['quad_tendon_area'], points: 28, reason: 'Pain is just above the kneecap (quad tendon).' },
      { type: 'answer', questionId: 'pain_above_kneecap', value: true, points: 20, reason: 'Pain localized above the kneecap.' },
      { type: 'answer', questionId: 'onset', value: 'gradual', points: 12, reason: 'Gradual onset fits a tendon pattern.' },
      { type: 'answer', questionId: 'mechanism', value: 'jumping', points: 10, reason: 'Jumping loads the extensor tendons.' }
    ]
  },
  {
    subtypeId: 'patellar_tendon_overlap',
    conditions: [
      { type: 'area', value: ['patellar_tendon_area'], points: 28, reason: 'Pain is just below the kneecap (patellar tendon).' },
      { type: 'answer', questionId: 'pain_below_kneecap', value: true, points: 20, reason: 'Pain localized below the kneecap.' },
      { type: 'answer', questionId: 'mechanism', value: 'jumping', points: 14, reason: 'Jumping loads the patellar tendon.' },
      { type: 'answer', questionId: 'onset', value: 'gradual', points: 10, reason: 'Gradual onset fits a tendon pattern.' }
    ]
  },
  {
    subtypeId: 'hip_flexor_rectus_femoris_overlap',
    conditions: [
      { type: 'area', value: ['front_thigh_upper', 'anterior_hip_thigh'], points: 24, reason: 'Pain is high in the anterior thigh / hip-flexor zone.' },
      { type: 'answer', questionId: 'lift_knee_pain', value: true, points: 18, reason: 'Pain lifting the knee.' },
      { type: 'selfTest', testId: 'resisted_hip_flexion', result: 'painful', points: 14, reason: 'Resisted hip flexion reproduced symptoms.' }
    ]
  },
  {
    subtypeId: 'femoral_nerve_related_anterior_thigh_pain',
    conditions: [
      { type: 'answer', questionId: 'numbness_burning', value: true, points: 28, reason: 'Numbness/burning suggests a nerve component.' },
      { type: 'area', value: ['front_thigh_middle', 'front_thigh_upper'], points: 6, reason: 'Anterior thigh distribution.' }
    ]
  },
  {
    subtypeId: 'severe_quad_tear_risk',
    conditions: [
      { type: 'answer', questionId: 'bruising_swelling', value: 'significant', points: 20, reason: 'Significant bruising raises tear concern.' },
      { type: 'answer', questionId: 'straighten_knee_pain', value: true, points: 16, reason: 'Marked weakness/pain straightening the knee.' },
      { type: 'answer', questionId: 'onset', value: 'sudden_sharp', points: 10, reason: 'Sudden severe onset.' }
    ]
  }
];

/* -------------------------------------------------------------------------
 * EXERCISE LIBRARY
 * Organised into 8 session blocks. Quad rehab follows the "train the whole
 * athlete" model: the injured quad is the targeted block, but the session
 * also covers the hamstrings (antagonist — critical balance), glutes, core,
 * calves, upper body, and conditioning appropriate for the phase.
 * ------------------------------------------------------------------------- */
const exerciseLibrary = [

  /* ======================================================================
   * WARMUP BLOCK
   * ====================================================================== */
  makeExercise('quad_warm_leg_swing', 'Forward and lateral leg swings', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Warm up the hip and anterior thigh through pain-free range before loading.',
    prescription: '2 x 10 swings each direction per leg',
    cues: ['Hold a wall for balance', 'Forward/back then side to side', 'Swing freely — do not kick'],
    commonMistakes: ['Forcing end range', 'No wall support and losing balance'],
    easierAlternative: 'Small pendulum swings',
    harderProgression: 'quad_warm_march',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_warm_march', 'High-knee march', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Prime the hip flexors and quad through a functional pattern; increases blood flow.',
    prescription: '2 x 20 steps',
    cues: ['Drive the knee to hip height', 'Upright torso', 'Controlled arm swing'],
    commonMistakes: ['Rushing', 'Leaning backwards'],
    easierAlternative: 'quad_warm_leg_swing',
    harderProgression: 'Skipping / bounding',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Pain > 3/10 with hip flexion'],
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_warm_hip_circle', 'Standing hip circles', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Mobilise the hip joint in all planes before quad loading.',
    prescription: '2 x 10 circles each direction per leg',
    cues: ['Large slow circles', 'Keep the torso still', 'Hold a wall for balance'],
    commonMistakes: ['Swaying the torso'],
    easierAlternative: 'quad_warm_leg_swing',
    harderProgression: 'quad_warm_walk_lunge',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_warm_walk_lunge', 'Walking lunge (bodyweight)', {
    targetRegion: 'quadriceps', phase: 'restore', difficulty: 2,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Dynamic warm-up that loads the quad and hip flexor together through a functional range.',
    prescription: '2 x 8 steps each leg',
    cues: ['Long step', 'Upright torso', 'Knee tracks over second toe'],
    commonMistakes: ['Knee caving inward', 'Leaning forward'],
    easierAlternative: 'quad_warm_hip_circle',
    harderProgression: 'Walking lunge with torso rotation',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Knee pain > 3/10 with the lunge pattern'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_warm_ankle_mob', 'Ankle circles and calf raises (warm-up)', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'warmup', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Warm up the ankle and distal chain — ankle restriction directly affects knee mechanics during quad loading.',
    prescription: '2 x 10 circles each direction + 10 slow calf raises',
    cues: ['Full ankle circle range', 'Controlled calf raise — pause at top'],
    commonMistakes: ['Partial circles', 'No heel lowering on the raise'],
    easierAlternative: 'Seated ankle circles',
    harderProgression: 'Single-leg calf raise warm-up',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),

  /* ======================================================================
   * ACTIVATION BLOCK  (daily-capable; analgesic; precede loading)
   * ====================================================================== */
  makeExercise('quad_set', 'Quad set (supine isometric)', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Restore the quad neural signal with minimal joint load; analgesic effect.',
    prescription: '5 x 10–15 sec',
    cues: ['Lie flat, gently tighten the thigh', 'No pain — just a light muscle contraction', 'Breathe normally'],
    commonMistakes: ['Holding the breath', 'Pushing the knee hard into the floor'],
    easierAlternative: 'Seated quad contraction',
    harderProgression: 'quad_swed_short_arc',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Light leg-extension isometric',
    avoidIf: ['Sharp pain on any quad contraction'],
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_tke', 'Terminal knee extension (TKE)', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['band'],
    purpose: 'Activate VMO and the full quad near full extension — important for patellofemoral cases.',
    prescription: '3 x 12–15 reps',
    cues: ['Stand in slight knee-bend', 'Band behind the knee', 'Straighten smoothly — hold 1 sec at full extension'],
    commonMistakes: ['Hyperextending the knee', 'Moving the hip instead of the knee'],
    easierAlternative: 'quad_set',
    harderProgression: 'quad_swed_short_arc',
    noEquipmentAlternative: 'Seated terminal extension (chair)',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_glute_activation', 'Supine glute squeeze', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'activation', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Wake up glute max before quad loading; glute weakness is a key driver of anterior knee pain.',
    prescription: '3 x 10 squeezes (3 sec hold each)',
    cues: ['Lie on back, knees bent', 'Squeeze firmly', 'Slight posterior pelvic tilt'],
    commonMistakes: ['Only squeezing one cheek'],
    easierAlternative: 'Seated glute squeeze',
    harderProgression: 'quad_kc_glute_bridge',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),

  /* ======================================================================
   * TARGETED BLOCK  (quad-specific loading; needs ~48h recovery)
   * ====================================================================== */
  makeExercise('quad_swed_short_arc', 'Short-arc knee extension', {
    targetRegion: 'quadriceps', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight', 'band'],
    purpose: 'Build quad strength through the last 30° of extension — lower joint stress than full range.',
    prescription: '3 x 12–15 reps',
    cues: ['Control the straightening and the return', 'Hold 1 sec at full extension'],
    commonMistakes: ['Snapping into lockout', 'No eccentric control on the return'],
    easierAlternative: 'quad_set',
    harderProgression: 'quad_stepup',
    noEquipmentAlternative: 'Seated knee extension (bodyweight)',
    gymAlternative: 'Leg-extension machine, light load',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_wallsit', 'Wall-sit (isometric)', {
    targetRegion: 'quadriceps', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'isometric', isAnchor: true,
    equipment: ['bodyweight'],
    purpose: 'Isometric quad load at a comfortable angle; primary pain-relief exercise for tendon patterns.',
    prescription: '4 x 20–45 sec',
    cues: ['Comfortable knee angle — not deeper than 90°', 'Even weight through both feet', 'Push back into the wall'],
    commonMistakes: ['Going too deep too soon', 'Holding breath'],
    easierAlternative: 'Shorter holds / higher angle',
    harderProgression: 'quad_spanish_squat',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Leg-press isometric hold',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_reverse_lunge', 'Reverse lunge', {
    targetRegion: 'quadriceps', phase: 'restore', difficulty: 2,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Single-leg quad loading with less anterior knee shear than a forward lunge — good early-phase option.',
    prescription: '3 x 10 each leg',
    cues: ['Step back, not forward', 'Keep the front shin nearly vertical', 'Drive up through the front heel'],
    commonMistakes: ['Front knee shooting forward', 'Leaning excessively forward'],
    easierAlternative: 'Split stance hold',
    harderProgression: 'quad_stepup',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Acute quad strain < 5 days'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_spanish_squat', 'Spanish squat hold (band-assisted)', {
    targetRegion: 'quadriceps', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'isometric', isAnchor: true,
    equipment: ['band', 'strap'],
    purpose: 'Heavy isometric tendon loading with near-vertical shin — best exercise for quad/patellar tendinopathy.',
    prescription: '4 x 30–45 sec at heavy RPE 7–8',
    cues: ['Sit back against the band', 'Shins fairly vertical', 'Hold position without bouncing'],
    commonMistakes: ['Knees drifting forward', 'Too shallow an angle'],
    easierAlternative: 'quad_wallsit',
    harderProgression: 'Loaded Spanish squat (weight vest)',
    noEquipmentAlternative: 'Wall sit',
    gymAlternative: 'Leg-press isometric',
    painRule: PAIN_RULES.tendon
  }),
  makeExercise('quad_stepup', 'Step-up (eccentric focus)', {
    targetRegion: 'quadriceps', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'eccentric', isAnchor: true,
    equipment: ['step', 'dumbbells'],
    purpose: 'Build single-leg quad strength through a functional pattern; eccentric lowering is key.',
    prescription: '3 x 8–10 each leg (3-sec lower)',
    cues: ['Knee tracks over second toe', 'Slow 3-sec lower', 'Drive up through the whole foot'],
    commonMistakes: ['Pushing off the back leg on the way up', 'Fast uncontrolled lower'],
    easierAlternative: 'Lower step / bodyweight only',
    harderProgression: 'quad_split_squat',
    noEquipmentAlternative: 'Bodyweight step-up',
    gymAlternative: 'Loaded step-up / box step-up',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_split_squat', 'Split squat (Bulgarian)', {
    targetRegion: 'quadriceps', phase: 'capacity', difficulty: 4,
    block: 'targeted', slot: 'strength', isAnchor: true,
    equipment: ['bodyweight', 'dumbbells'],
    purpose: 'High-demand single-leg quad strength and control through full range.',
    prescription: '4 x 6–8 each side',
    cues: ['Stay tall', 'Front knee tracks over toes', 'Controlled depth — stop at comfortable range'],
    commonMistakes: ['Knee collapsing inward', 'Trunk leaning excessively forward'],
    easierAlternative: 'quad_stepup',
    harderProgression: 'Rear-foot-elevated split squat (RFESS)',
    noEquipmentAlternative: 'Bodyweight split squat',
    gymAlternative: 'Dumbbell/barbell split squat',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_decline_squat', 'Decline board single-leg squat', {
    targetRegion: 'quadriceps', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'eccentric', isAnchor: false,
    equipment: ['decline_board'],
    purpose: 'Maximal quad/tendon load; the standard exercise for patellar tendon rehabilitation.',
    prescription: '3 x 8–10 each leg (3-sec lower)',
    cues: ['Stand on decline board (25°)', 'Single leg', 'Slow eccentric lower — push back up with both'],
    commonMistakes: ['Too much lean forward', 'Rushing the down phase'],
    easierAlternative: 'quad_stepup',
    harderProgression: 'Full single-leg decline squat',
    noEquipmentAlternative: 'quad_spanish_squat',
    gymAlternative: 'Leg press through full range',
    avoidIf: ['Acute contusion/strain — only for tendon patterns'],
    painRule: PAIN_RULES.tendon
  }),
  makeExercise('quad_sl_leg_press', 'Single-leg press (gym)', {
    targetRegion: 'quadriceps', phase: 'capacity', difficulty: 3,
    block: 'targeted', slot: 'strength', isAnchor: false,
    equipment: ['gym_machine'],
    purpose: 'Progressive single-leg quad loading in a controlled, joint-friendly position.',
    prescription: '4 x 8–10 each leg',
    cues: ['Full range of motion', 'Drive through the whole foot', 'Slow eccentric (3 sec)'],
    commonMistakes: ['Half reps', 'Letting the knee collapse inward'],
    easierAlternative: 'quad_reverse_lunge',
    harderProgression: 'quad_split_squat',
    noEquipmentAlternative: 'quad_stepup',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — HAMSTRINGS  (antagonist; must balance quad load)
   * ====================================================================== */
  makeExercise('quad_kc_hamstring_bridge', 'Hamstring bridge hold', {
    targetRegion: 'hamstring', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Activate and strengthen the posterior chain — hamstring weakness is a key factor in anterior knee overload.',
    prescription: '3 x 20–30 sec',
    cues: ['Drive through heels', 'Hips level', 'Squeeze glutes at top'],
    commonMistakes: ['Arching the lower back', 'Letting the hips drop'],
    easierAlternative: 'Glute squeeze',
    harderProgression: 'quad_kc_rdl',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_kc_rdl', 'Romanian deadlift (hamstring focus)', {
    targetRegion: 'hamstring', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight', 'dumbbells'],
    purpose: 'Build posterior chain strength to balance the quad load; reduces knee overload.',
    prescription: '3 x 10–12 reps',
    cues: ['Hip hinge — not a squat', 'Slow 3-sec lower', 'Strong hip drive back up'],
    commonMistakes: ['Rounding the back', 'Squatting instead of hinging'],
    easierAlternative: 'quad_kc_hamstring_bridge',
    harderProgression: 'Single-leg RDL',
    noEquipmentAlternative: 'Bodyweight RDL',
    gymAlternative: 'Dumbbell/barbell RDL',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_kc_slider_curl', 'Hamstring slider curl', {
    targetRegion: 'hamstring', phase: 'capacity', difficulty: 3,
    block: 'kinetic_chain', slot: 'eccentric', isAnchor: false,
    equipment: ['bodyweight', 'towel'],
    purpose: 'Eccentric hamstring control — the most important antagonist exercise for quad rehabilitation.',
    prescription: '3 x 5–6 reps (3-sec out)',
    cues: ['Slow slide out', 'Use both hands to assist the return'],
    commonMistakes: ['Sliding too far early', 'Fast uncontrolled lowering'],
    easierAlternative: 'quad_kc_rdl',
    harderProgression: 'Nordic lower',
    noEquipmentAlternative: 'Bridge walkout',
    gymAlternative: 'Leg curl machine',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — GLUTES / HIP
   * ====================================================================== */
  makeExercise('quad_kc_glute_bridge', 'Glute bridge (rhythmic reps)', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Build glute max strength — glute weakness drives the knee inward and overloads the quad.',
    prescription: '3 x 12–15 reps',
    cues: ['Full hip extension at top', 'Squeeze glutes hard', 'Controlled lower'],
    commonMistakes: ['Half extension', 'Lower back instead of glutes'],
    easierAlternative: 'quad_glute_activation',
    harderProgression: 'quad_kc_hip_thrust',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_kc_hip_thrust', 'Hip thrust', {
    targetRegion: 'glutes', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight', 'bench'],
    purpose: 'High-range glute loading; critical complement to quad-dominant training.',
    prescription: '3 x 10–12 reps',
    cues: ['Upper back on bench', 'Full hip extension', 'Chin tuck — no lumbar arch'],
    commonMistakes: ['Arching the lower back', 'Partial range'],
    easierAlternative: 'quad_kc_glute_bridge',
    harderProgression: 'Barbell hip thrust',
    noEquipmentAlternative: 'quad_kc_glute_bridge',
    gymAlternative: 'Barbell hip thrust',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_kc_clamshell', 'Clamshell', {
    targetRegion: 'glutes', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight', 'band'],
    purpose: 'Activate glute medius — hip abductor weakness causes knee valgus and patellar tracking problems.',
    prescription: '3 x 15 each side',
    cues: ['Feet together', 'Rotate from the hip', '1-sec hold at top'],
    commonMistakes: ['Pelvis rolling back', 'Foot lifting off the ground'],
    easierAlternative: 'Side-lying hip abduction',
    harderProgression: 'quad_kc_lateral_band',
    noEquipmentAlternative: 'Same without band',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_kc_lateral_band', 'Lateral band walk', {
    targetRegion: 'glutes', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['band'],
    purpose: 'Strengthen hip abductors in a functional stance; reduces medial knee collapse during quad exercises.',
    prescription: '3 x 12 steps each direction',
    cues: ['Stay low in a slight squat', 'Toes forward', 'Don\'t let the band pull the feet together'],
    commonMistakes: ['Standing too upright', 'Narrow steps'],
    easierAlternative: 'quad_kc_clamshell',
    harderProgression: 'Monster walk (band at feet)',
    noEquipmentAlternative: 'Side-stepping squat without band',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * KINETIC CHAIN — CORE / LUMBOPELVIC
   * ====================================================================== */
  makeExercise('quad_kc_dead_bug', 'Dead bug', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Anti-extension core stability; reduces compensatory loading through the front of the hip and quad.',
    prescription: '3 x 6–8 each side',
    cues: ['Lower back flat into the floor', 'Breathe out as limbs move', 'Slow and controlled'],
    commonMistakes: ['Lower back arching', 'Moving too fast'],
    easierAlternative: 'Arm-only or leg-only dead bug',
    harderProgression: 'quad_kc_bird_dog',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_kc_bird_dog', 'Bird dog', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Lumbopelvic stability and anti-rotation strength; trains trunk control in a functional position.',
    prescription: '3 x 8 each side',
    cues: ['No hip rotation', 'Fully extend arm and opposite leg', '2-sec hold'],
    commonMistakes: ['Hip hiking', 'Rotating the torso'],
    easierAlternative: 'quad_kc_dead_bug',
    harderProgression: 'Bird dog with band resistance',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_kc_plank', 'Front plank', {
    targetRegion: 'core', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Anterior-chain endurance; builds trunk stiffness for force transfer during running and kicking.',
    prescription: '3 x 20–40 sec',
    cues: ['Straight line head to heel', 'Squeeze glutes and abs', 'Breathe normally'],
    commonMistakes: ['Hips too high or sagging', 'Holding breath'],
    easierAlternative: 'Knee plank',
    harderProgression: 'quad_kc_side_plank',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('quad_kc_side_plank', 'Side plank', {
    targetRegion: 'core', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'isometric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Anti-lateral flexion core strength; reduces hip drop during running stride.',
    prescription: '3 x 20–30 sec each side',
    cues: ['Hips stacked', 'Top hip does not sag', 'Neutral neck'],
    commonMistakes: ['Hip rotation forward', 'Shorter hold on the weaker side'],
    easierAlternative: 'quad_kc_plank',
    harderProgression: 'Side plank with hip abduction',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.isometric
  }),

  /* ======================================================================
   * KINETIC CHAIN — CALF / DISTAL CHAIN
   * ====================================================================== */
  makeExercise('quad_kc_calf_raise', 'Bilateral calf raise', {
    targetRegion: 'calf', phase: 'protect', difficulty: 1,
    block: 'kinetic_chain', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Strengthen the distal kinetic chain; ankle stiffness and calf weakness alter knee mechanics.',
    prescription: '3 x 15 reps',
    cues: ['Full range — all the way up and fully down', 'Control the lower'],
    commonMistakes: ['Partial range', 'Fast uncontrolled lower'],
    easierAlternative: 'Seated calf raise',
    harderProgression: 'quad_kc_sl_calf',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_kc_sl_calf', 'Single-leg calf raise', {
    targetRegion: 'calf', phase: 'restore', difficulty: 2,
    block: 'kinetic_chain', slot: 'eccentric', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Unilateral calf load; identifies side-to-side differences that affect gait and knee loading.',
    prescription: '3 x 10–12 each leg (3-sec lower)',
    cues: ['Full range', 'Slow eccentric lower', 'Fingertip wall touch only'],
    commonMistakes: ['Pushing off the other foot', 'No eccentric control'],
    easierAlternative: 'quad_kc_calf_raise',
    harderProgression: 'Off-step single-leg calf raise',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),

  /* ======================================================================
   * GLOBAL STRENGTH BLOCK  (upper body; safe in all phases)
   * ====================================================================== */
  makeExercise('quad_gs_pushup', 'Push-up', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 2,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Maintain upper-body push strength throughout lower-limb rehab; keeps the athlete training.',
    prescription: '3 x 8–12 reps',
    cues: ['Straight line head to heel', 'Full range', 'Elbows 45° to body'],
    commonMistakes: ['Sagging hips', 'Half reps'],
    easierAlternative: 'Incline push-up',
    harderProgression: 'Slow-lowering push-up',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Pain-free. Stop if lower-limb position aggravates the quad.'
  }),
  makeExercise('quad_gs_band_row', 'Resistance band row', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 1,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['band'],
    purpose: 'Upper-back and rear-shoulder strength; maintains posture and athletic capacity during rehab.',
    prescription: '3 x 12–15 reps',
    cues: ['Anchor at chest height', 'Squeeze shoulder blades', 'No torso rocking'],
    commonMistakes: ['Using momentum', 'Shrugging'],
    easierAlternative: 'Light band pull-apart',
    harderProgression: 'DB bent-over row',
    noEquipmentAlternative: 'Towel row against door',
    painRule: 'Comfortable.'
  }),
  makeExercise('quad_gs_pull_apart', 'Band pull-apart', {
    targetRegion: 'upper_body', phase: 'protect', difficulty: 1,
    block: 'global_strength', slot: 'strength', isAnchor: false,
    equipment: ['band'],
    purpose: 'Shoulder health; easy upper-body work safe in every phase.',
    prescription: '3 x 15 reps',
    cues: ['Arms straight', 'Pull to chest height', 'Squeeze rhomboids at the end'],
    commonMistakes: ['Bending elbows', 'No controlled return'],
    easierAlternative: 'Smaller range pull-apart',
    noEquipmentAlternative: 'None (band needed)',
    painRule: 'Comfortable.'
  }),
  makeExercise('quad_gs_db_press', 'Dumbbell shoulder press (seated)', {
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
   * NEUROMUSCULAR BLOCK
   * ====================================================================== */
  makeExercise('quad_nm_sl_stand', 'Single-leg balance', {
    targetRegion: 'knee_ankle', phase: 'restore', difficulty: 2,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Retrain neuromuscular control of the knee — essential for patellar tracking and return-to-sport stability.',
    prescription: '3 x 20–30 sec each leg',
    cues: ['Soft knee (10–15° bend)', 'Eyes on a fixed point', 'Minimise wobble'],
    commonMistakes: ['Locking the knee', 'Gripping toes excessively'],
    easierAlternative: 'Weight shift to one leg',
    harderProgression: 'quad_nm_sl_eyes',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_nm_sl_eyes', 'Single-leg balance — eyes closed', {
    targetRegion: 'knee_ankle', phase: 'capacity', difficulty: 3,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Advanced proprioceptive challenge; mirrors demands of dynamic sport.',
    prescription: '3 x 15–20 sec each leg',
    cues: ['Near a wall for safety', 'Soft knee', 'Minimal swaying'],
    commonMistakes: ['Opening eyes when wobbling'],
    easierAlternative: 'quad_nm_sl_stand',
    harderProgression: 'quad_nm_sl_reach',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_nm_sl_reach', 'Single-leg squat reach (mini Y-balance)', {
    targetRegion: 'knee_ankle', phase: 'capacity', difficulty: 3,
    block: 'neuromuscular', slot: 'neuromuscular', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Dynamic balance and quad control challenge; identifies residual deficits before return to sport.',
    prescription: '3 x 6 reaches each direction, each leg',
    cues: ['Reach as far as possible in each direction', 'Return without the foot touching down'],
    commonMistakes: ['Rushing', 'Excessive trunk lean'],
    easierAlternative: 'quad_nm_sl_eyes',
    harderProgression: 'Reach while catching a ball',
    noEquipmentAlternative: 'Same exercise',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('quad_nm_lateral_hop', 'Lateral hop and stabilize', {
    targetRegion: 'quadriceps', phase: 'speed', difficulty: 4,
    block: 'neuromuscular', slot: 'power', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Deceleration and lateral knee control; mirrors the demand of cutting and change of direction.',
    prescription: '3 x 5 hops each leg — stick the landing for 2 sec',
    cues: ['Soft landing on a bent knee', 'Stick before moving', 'Control the knee in line with the toes'],
    commonMistakes: ['Stiff landing', 'Knee collapsing inward on landing'],
    easierAlternative: 'quad_nm_sl_reach',
    harderProgression: 'Reactive lateral hop',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Knee pain on landing'],
    painRule: PAIN_RULES.impact
  }),

  /* ======================================================================
   * CONDITIONING BLOCK
   * ====================================================================== */
  makeExercise('quad_cond_bike', 'Stationary bike (low resistance)', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['stationary_bike'],
    purpose: 'Cardiovascular fitness with minimal quad stress; seat height controls the range of motion.',
    prescription: '15–20 min, comfortable cadence, low resistance',
    cues: ['Seat at height where knee barely bends at the bottom', 'Easy effort', 'No pulling through toe clips'],
    commonMistakes: ['Seat too low forcing deep knee bend', 'Resistance too high'],
    easierAlternative: 'Short 10-min ride',
    harderProgression: 'Increase time then resistance',
    noEquipmentAlternative: 'quad_cond_pool',
    avoidIf: ['Knee pain > 3/10 during pedalling'],
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('quad_cond_pool', 'Pool running / water walking', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['pool'],
    purpose: 'Buoyancy offloading for cardiovascular fitness while resting the quad.',
    prescription: '15–25 min',
    cues: ['Running pattern — drive the knees forward', 'Stay upright', 'Running arm action'],
    commonMistakes: ['Cycling the legs instead of running pattern'],
    easierAlternative: 'Water walking',
    harderProgression: 'Deep-water running with vest',
    noEquipmentAlternative: 'quad_cond_bike',
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('quad_cond_walk', 'Brisk walking / walk intervals', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['open_space'],
    purpose: 'Gentle fitness maintenance; keeps the kinetic chain moving in the acute phase.',
    prescription: '15–20 min comfortable walking',
    cues: ['No limp', 'Stop if pain > 3/10'],
    commonMistakes: ['Walking too far too fast early'],
    easierAlternative: 'Short 10-min stroll',
    harderProgression: 'quad_cond_jog_walk',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Clear limp present'],
    painRule: PAIN_RULES.earlyStrain
  }),
  makeExercise('quad_cond_jog_walk', 'Jog-walk intervals', {
    targetRegion: 'quadriceps', phase: 'restore', difficulty: 2,
    block: 'conditioning', slot: 'conditioning', isAnchor: false,
    equipment: ['open_space'],
    purpose: 'Gentle return to running; progressively loads the quad through impact.',
    prescription: '20 min: 1 min jog / 2 min walk × 6–7 rounds',
    cues: ['Easy pace — can hold a conversation', 'No front-thigh tightness > 3/10'],
    commonMistakes: ['Running too fast', 'Increasing too quickly'],
    easierAlternative: 'quad_cond_walk',
    harderProgression: 'quad_strides',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Jogging causes > 3/10 anterior thigh pain'],
    painRule: PAIN_RULES.impact
  }),
  makeExercise('quad_strides', 'Submax strides', {
    targetRegion: 'quadriceps', phase: 'speed', difficulty: 3,
    block: 'conditioning', slot: 'conditioning', isAnchor: true,
    equipment: ['open_space'],
    purpose: 'Reintroduce higher-speed running; the bridge to full sprinting.',
    prescription: '6 × 40–60 m at 60–80% max speed; full recovery between',
    cues: ['Smooth acceleration', 'Upright posture', 'No front-thigh tightness above 2/10'],
    commonMistakes: ['Full sprint on the first day', 'No recovery between runs'],
    easierAlternative: 'quad_cond_jog_walk',
    harderProgression: 'quad_sprint_kick',
    noEquipmentAlternative: 'Same (field/treadmill)',
    gymAlternative: 'Treadmill intervals',
    painRule: PAIN_RULES.impact
  }),
  makeExercise('quad_sprint_kick', 'Sprint and kicking exposure', {
    targetRegion: 'quadriceps', phase: 'return', difficulty: 5,
    block: 'conditioning', slot: 'conditioning', isAnchor: true,
    equipment: ['open_space', 'ball'],
    purpose: 'Restore sprint and kicking capacity; the final phase of sport-specific loading.',
    prescription: '5 × 30 m sprints + 3 × 8 submax kicks; increase effort over sessions',
    cues: ['Decelerate gradually first', 'Short passes before long strikes', 'Increase effort by 5–10% per session'],
    commonMistakes: ['Max-effort kicks on day one', 'Not pausing after any thigh tightness'],
    easierAlternative: 'quad_strides',
    harderProgression: 'Full-speed sport drills',
    noEquipmentAlternative: 'Air-swing kick pattern',
    gymAlternative: 'High-speed treadmill',
    painRule: PAIN_RULES.impact
  }),

  /* ======================================================================
   * COOLDOWN BLOCK
   * ====================================================================== */
  makeExercise('quad_cool_prone', 'Prone lying rest', {
    targetRegion: 'quadriceps', phase: 'protect', difficulty: 1,
    block: 'cooldown', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'Unload the anterior thigh and knee; calm the nervous system after a session.',
    prescription: '3–5 min',
    cues: ['Face down, arms relaxed', 'Breathe slowly', 'Let the thigh completely relax'],
    commonMistakes: ['Skipping this after intense sessions'],
    easierAlternative: 'Supine rest',
    harderProgression: 'N/A',
    noEquipmentAlternative: 'Same exercise',
    painRule: 'Fully pain-free.'
  }),
  makeExercise('quad_cool_quad_stretch', 'Gentle prone quad stretch', {
    targetRegion: 'quadriceps', phase: 'capacity', difficulty: 1,
    block: 'cooldown', slot: 'mobility', isAnchor: false,
    equipment: ['bodyweight'],
    purpose: 'End-of-session length restoration — ONLY when tissue is ready (capacity phase onwards).',
    prescription: '2 × 30 sec each leg',
    cues: ['Lie face down', 'Gently bring heel toward buttock', 'Mild tension only — not pain'],
    commonMistakes: ['Forcing range', 'Using in acute phase', 'Using for tendon-only cases'],
    easierAlternative: 'Shorter 15-sec hold',
    harderProgression: 'Standing quad stretch',
    noEquipmentAlternative: 'Same exercise',
    avoidIf: ['Contusion (early phase)', 'Tendon case — avoid aggressive stretch'],
    painRule: 'Mild tension only. Never sharp or pulling.'
  })
];

const rehabProtocols = [
  makeProtocol('acute_quad_strain', {
    name: 'Acute quadriceps strain pathway',
    summary: 'Settle, rebuild quad + posterior chain strength, return to sprint/kick.',
    appliesToSubtypes: ['rectus_femoris_strain', 'vastus_lateralis_strain', 'vastus_medialis_irritation', 'hip_flexor_rectus_femoris_overlap'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Protect and settle',
        goal: 'Calm the strain; keep the whole body moving safely.',
        estimatedDuration: '3–7 days',
        intensityGuidance: 'RPE 2–4',
        painRules: PAIN_RULES.earlyStrain,
        avoid: ['Sprinting', 'Kicking', 'Deep stretching', 'Heavy knee loading'],
        progressionCriteria: ['Quad sets calm', 'Comfortable walking', 'No swelling increase'],
        regressionCriteria: ['Pain spikes', 'Swelling worsening'],
        exercises: [
          'quad_warm_leg_swing', 'quad_warm_march', 'quad_warm_hip_circle', 'quad_warm_ankle_mob',
          'quad_set', 'quad_tke', 'quad_glute_activation',
          'quad_wallsit',
          'quad_kc_hamstring_bridge', 'quad_kc_glute_bridge', 'quad_kc_clamshell',
          'quad_kc_dead_bug', 'quad_kc_bird_dog', 'quad_kc_plank', 'quad_kc_calf_raise',
          'quad_cond_bike', 'quad_cond_pool', 'quad_cond_walk',
          'quad_cool_prone'
        ]
      }),
      makePhase('restore', {
        name: 'Phase 2 – Restore strength and motion',
        goal: 'Rebuild quad range and light strength; strengthen the full kinetic chain.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 4–6',
        painRules: PAIN_RULES.loading,
        avoid: ['Explosive loading', 'Deep passive quad stretch'],
        progressionCriteria: ['Short-arc and reverse lunge calm', 'Comfortable jog-walk'],
        regressionCriteria: ['Next-morning pain increase'],
        exercises: [
          'quad_warm_leg_swing', 'quad_warm_march', 'quad_warm_walk_lunge', 'quad_warm_ankle_mob',
          'quad_set', 'quad_tke', 'quad_glute_activation',
          'quad_swed_short_arc', 'quad_wallsit', 'quad_reverse_lunge',
          'quad_kc_rdl', 'quad_kc_hamstring_bridge', 'quad_kc_glute_bridge', 'quad_kc_hip_thrust',
          'quad_kc_clamshell', 'quad_kc_lateral_band', 'quad_kc_dead_bug', 'quad_kc_bird_dog',
          'quad_kc_plank', 'quad_kc_side_plank', 'quad_kc_calf_raise', 'quad_kc_sl_calf',
          'quad_nm_sl_stand',
          'quad_cond_bike', 'quad_cond_pool', 'quad_cond_jog_walk',
          'quad_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 3 – Build strength capacity',
        goal: 'Develop single-leg quad strength, posterior chain, and full-body capacity.',
        estimatedDuration: '2–3 weeks',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.loading,
        avoid: ['Maximal sprinting before speed phase'],
        progressionCriteria: ['Split squats tolerated', 'Eccentric step tolerated', 'Continuous jogging comfortable'],
        regressionCriteria: ['Strength work flares symptoms next morning'],
        exercises: [
          'quad_warm_walk_lunge', 'quad_warm_hip_circle', 'quad_warm_leg_swing', 'quad_warm_ankle_mob',
          'quad_tke', 'quad_glute_activation',
          'quad_stepup', 'quad_split_squat', 'quad_sl_leg_press', 'quad_reverse_lunge',
          'quad_kc_rdl', 'quad_kc_slider_curl', 'quad_kc_hip_thrust', 'quad_kc_lateral_band',
          'quad_kc_side_plank', 'quad_kc_dead_bug', 'quad_kc_sl_calf',
          'quad_nm_sl_stand', 'quad_nm_sl_eyes', 'quad_nm_sl_reach',
          'quad_cond_bike', 'quad_cond_jog_walk',
          'quad_cool_prone', 'quad_cool_quad_stretch'
        ]
      }),
      makePhase('speed', {
        name: 'Phase 4 – Speed and sport prep',
        goal: 'Reintroduce running speed, kicking prep, and deceleration control.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Max kicks or sprints before strides are calm'],
        progressionCriteria: ['Strides to 80% calm', 'Lateral hop stable'],
        regressionCriteria: ['Tightness climbs with speed'],
        exercises: [
          'quad_warm_walk_lunge', 'quad_warm_hip_circle', 'quad_warm_leg_swing', 'quad_warm_ankle_mob',
          'quad_stepup', 'quad_split_squat',
          'quad_kc_rdl', 'quad_kc_slider_curl', 'quad_kc_hip_thrust', 'quad_kc_side_plank', 'quad_kc_sl_calf',
          'quad_nm_sl_eyes', 'quad_nm_sl_reach', 'quad_nm_lateral_hop',
          'quad_strides', 'quad_cond_jog_walk',
          'quad_cool_quad_stretch'
        ]
      }),
      makePhase('return', {
        name: 'Phase 5 – Return to sport',
        goal: 'Restore full sprint speed, kicking, and sport-specific demands.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 7–9',
        painRules: PAIN_RULES.impact,
        avoid: ['Single-session jumps in speed AND kick volume together'],
        progressionCriteria: ['Sprint and kick exposure calm for 24 hours'],
        regressionCriteria: ['Sharp pull or tightness returns'],
        exercises: [
          'quad_warm_walk_lunge', 'quad_warm_hip_circle', 'quad_warm_march', 'quad_warm_ankle_mob',
          'quad_split_squat', 'quad_stepup',
          'quad_kc_rdl', 'quad_kc_slider_curl', 'quad_kc_hip_thrust', 'quad_kc_side_plank', 'quad_kc_sl_calf',
          'quad_nm_sl_reach', 'quad_nm_lateral_hop',
          'quad_sprint_kick', 'quad_strides', 'quad_cond_jog_walk',
          'quad_cool_quad_stretch'
        ]
      })
    ]
  }),
  makeProtocol('contusion', {
    name: 'Quadriceps contusion (dead-leg) pathway',
    summary: 'Protect range early, restore mobility, then load progressively. No aggressive massage early.',
    appliesToSubtypes: ['quadriceps_contusion'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Protect range',
        goal: 'Maintain comfortable knee bend; reduce swelling; keep upper body and non-injured areas active.',
        estimatedDuration: '2–5 days',
        intensityGuidance: 'Gentle, pain-free',
        painRules: PAIN_RULES.earlyStrain,
        avoid: ['Aggressive massage early', 'Forced stretching into the bruise', 'Heavy loading'],
        progressionCriteria: ['Knee bend improving', 'Swelling reducing'],
        regressionCriteria: ['Swelling increasing', 'Firmness worsening'],
        exercises: [
          'quad_warm_leg_swing', 'quad_warm_march', 'quad_warm_ankle_mob',
          'quad_set', 'quad_glute_activation',
          'quad_wallsit',
          'quad_kc_hamstring_bridge', 'quad_kc_clamshell', 'quad_kc_dead_bug', 'quad_kc_bird_dog',
          'quad_kc_plank', 'quad_kc_calf_raise',
          'quad_cond_pool', 'quad_cond_bike',
          'quad_cool_prone'
        ]
      }),
      makePhase('restore', {
        name: 'Phase 2 – Restore range and load',
        goal: 'Rebuild knee range, quad strength, and kinetic chain function.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 4–6',
        painRules: PAIN_RULES.loading,
        avoid: ['Contact to the bruised area', 'Deep stretching before full range returns'],
        progressionCriteria: ['Full pain-free knee bend', 'Step-up tolerated'],
        regressionCriteria: ['Range loss or swelling returning'],
        exercises: [
          'quad_warm_leg_swing', 'quad_warm_march', 'quad_warm_walk_lunge', 'quad_warm_ankle_mob',
          'quad_set', 'quad_tke', 'quad_glute_activation',
          'quad_swed_short_arc', 'quad_wallsit', 'quad_reverse_lunge', 'quad_stepup',
          'quad_kc_rdl', 'quad_kc_glute_bridge', 'quad_kc_hip_thrust', 'quad_kc_clamshell',
          'quad_kc_lateral_band', 'quad_kc_dead_bug', 'quad_kc_side_plank', 'quad_kc_sl_calf',
          'quad_nm_sl_stand',
          'quad_cond_bike', 'quad_cond_jog_walk',
          'quad_cool_prone'
        ]
      }),
      makePhase('return', {
        name: 'Phase 3 – Return to sport',
        goal: 'Reintroduce running, contact tolerance, and sport-specific demands.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Early unprotected contact to the area'],
        progressionCriteria: ['Running calm', 'Contact tolerates with padding'],
        regressionCriteria: ['Bruise symptoms recur with contact'],
        exercises: [
          'quad_warm_walk_lunge', 'quad_warm_hip_circle', 'quad_warm_march',
          'quad_split_squat', 'quad_stepup', 'quad_sl_leg_press',
          'quad_kc_rdl', 'quad_kc_slider_curl', 'quad_kc_hip_thrust', 'quad_kc_side_plank', 'quad_kc_sl_calf',
          'quad_nm_sl_reach', 'quad_nm_lateral_hop',
          'quad_strides', 'quad_sprint_kick', 'quad_cond_jog_walk',
          'quad_cool_prone'
        ]
      })
    ]
  }),
  makeProtocol('tendon', {
    name: 'Quad / patellar tendon pathway',
    summary: 'Isometrics to settle pain; heavy slow resistance to build tendon; energy storage for return.',
    appliesToSubtypes: ['quadriceps_tendon_pain', 'patellar_tendon_overlap'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Settle with isometrics',
        goal: 'Reduce tendon pain; keep the whole athlete training around the injury.',
        estimatedDuration: '1–2 weeks',
        intensityGuidance: 'RPE 3–5',
        painRules: PAIN_RULES.isometric,
        avoid: ['Explosive jumping', 'Deep fast squats', 'Aggressive quad stretch after loading'],
        progressionCriteria: ['Isometrics ease pain', 'NRS ≤ 3/10 during wall-sit'],
        regressionCriteria: ['Tendon pain climbing next morning'],
        exercises: [
          'quad_warm_leg_swing', 'quad_warm_hip_circle', 'quad_warm_ankle_mob',
          'quad_set', 'quad_tke', 'quad_glute_activation',
          'quad_wallsit', 'quad_spanish_squat',
          'quad_kc_hamstring_bridge', 'quad_kc_glute_bridge', 'quad_kc_clamshell',
          'quad_kc_dead_bug', 'quad_kc_bird_dog', 'quad_kc_plank', 'quad_kc_calf_raise',
          'quad_cond_bike', 'quad_cond_pool',
          'quad_cool_prone'
        ]
      }),
      makePhase('capacity', {
        name: 'Phase 2 – Heavy slow resistance',
        goal: 'Build tendon strength and whole-body capacity; session includes full kinetic chain.',
        estimatedDuration: '3–6 weeks',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.tendon,
        avoid: ['Pain climbing session to session', 'Aggressive reactive loading'],
        progressionCriteria: ['Strength tolerated session to session', 'Morning stiffness reducing'],
        regressionCriteria: ['Tendon pain rising across sessions'],
        exercises: [
          'quad_warm_walk_lunge', 'quad_warm_hip_circle', 'quad_warm_ankle_mob',
          'quad_tke', 'quad_glute_activation',
          'quad_wallsit', 'quad_spanish_squat', 'quad_stepup', 'quad_split_squat', 'quad_decline_squat',
          'quad_kc_rdl', 'quad_kc_slider_curl', 'quad_kc_hip_thrust', 'quad_kc_lateral_band',
          'quad_kc_side_plank', 'quad_kc_dead_bug', 'quad_kc_sl_calf',
          'quad_nm_sl_stand', 'quad_nm_sl_eyes', 'quad_nm_sl_reach',
          'quad_cond_bike', 'quad_cond_jog_walk',
          'quad_cool_prone'
        ]
      }),
      makePhase('return', {
        name: 'Phase 3 – Energy storage and return',
        goal: 'Reintroduce elastic loading, running, and jumping/sport.',
        estimatedDuration: 'Variable',
        intensityGuidance: 'RPE 6–8',
        painRules: PAIN_RULES.impact,
        avoid: ['Big jump-volume spikes', 'Maximal kicking before strides are calm'],
        progressionCriteria: ['Strides and hops calm', 'NRS ≤ 3/10 with all testing'],
        regressionCriteria: ['Tendon morning pain returns'],
        exercises: [
          'quad_warm_walk_lunge', 'quad_warm_hip_circle', 'quad_warm_march', 'quad_warm_ankle_mob',
          'quad_stepup', 'quad_split_squat', 'quad_decline_squat',
          'quad_kc_rdl', 'quad_kc_slider_curl', 'quad_kc_hip_thrust', 'quad_kc_side_plank', 'quad_kc_sl_calf',
          'quad_nm_sl_reach', 'quad_nm_lateral_hop',
          'quad_strides', 'quad_sprint_kick', 'quad_cond_jog_walk',
          'quad_cool_prone'
        ]
      })
    ]
  }),
  makeProtocol('nerve_referral', {
    name: 'Nerve-related anterior thigh pathway (review)',
    summary: 'Symptom-free care with a recommendation for clinical review before loading.',
    appliesToSubtypes: ['femoral_nerve_related_anterior_thigh_pain'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Cautious care and review',
        goal: 'Avoid provocation; keep upper body and unaffected areas active; arrange review.',
        estimatedDuration: 'Until reviewed',
        intensityGuidance: 'Symptom-free only',
        painRules: 'Keep everything symptom-free; stop if burning/numbness increases.',
        avoid: ['Aggressive stretching', 'High quad loads', 'Sprinting', 'Knee extension against resistance'],
        progressionCriteria: ['Progress only under professional guidance'],
        regressionCriteria: ['Numbness/burning increases'],
        exercises: [
          'quad_set',
          'quad_kc_hamstring_bridge', 'quad_kc_dead_bug', 'quad_kc_bird_dog', 'quad_kc_plank', 'quad_kc_calf_raise',
          'quad_cond_pool', 'quad_cond_bike',
          'quad_cool_prone'
        ]
      })
    ]
  }),
  makeProtocol('severe_risk', {
    name: 'Higher-grade quad tear (conservative early care)',
    summary: 'Conservative early care while arranging clinical review.',
    appliesToSubtypes: ['severe_quad_tear_risk'],
    phases: [
      makePhase('protect', {
        name: 'Phase 1 – Protect and seek review',
        goal: 'Protect the quad; keep non-injured areas active; arrange clinical assessment.',
        estimatedDuration: 'Until reviewed',
        intensityGuidance: 'Pain-free only',
        painRules: 'Do not push through pain.',
        avoid: ['Strength testing the injury', 'Sport', 'Stretching into pain', 'Heavy loading'],
        progressionCriteria: ['Only progress under professional guidance'],
        regressionCriteria: ['Any worsening — seek review sooner'],
        exercises: [
          'quad_set',
          'quad_kc_dead_bug', 'quad_kc_bird_dog', 'quad_kc_plank', 'quad_kc_calf_raise',
          'quad_cond_pool', 'quad_cond_bike',
          'quad_cool_prone'
        ]
      })
    ]
  })
];

const returnToSport = {
  genericLadder: ['Pain-free walking', 'Pain-free jogging', 'Strides to 80%', 'Submax kicking/jumping', 'Acceleration/deceleration', 'Sport-specific drills', 'Full training', 'Match return'],
  criteriaToReturn: ['Quad strength close to the other side', 'Sprinting/kicking rehearsed without symptoms', 'Full pain-free knee range'],
  sportSpecific: {
    'Football / soccer': ['Add submax passing before full strikes; rehearse sprint then decel.'],
    Basketball: ['Add landing mechanics and decel before jump volume.'],
    Running: ['Build distance before speed.']
  }
};

const maintenancePlan = {
  goal: 'Maintain quad strength and tendon tolerance to reduce reinjury.',
  frequency: '2 sessions per week',
  exercises: ['quad_split_squat', 'quad_spanish_squat'],
  preventionNotes: ['Keep heavy slow strength work weekly for tendon cases.', 'Build sprint/jump volume gradually after layoffs.']
};

const quadriceps = {
  id: 'quadriceps',
  name: 'Quadriceps / anterior thigh',
  shortDescription:
    'Anterior-thigh injuries spanning quad strains, contusions, extensor-tendon pain, and nerve-related patterns.',
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

export default quadriceps;
