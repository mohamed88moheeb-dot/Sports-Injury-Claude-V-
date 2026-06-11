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

const exerciseLibrary = [
  makeExercise('add_squeeze_short', 'Short-lever adductor squeeze', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1, equipment: ['ball'],
    purpose: 'Calm pain and gently load the adductors.',
    prescription: '5 x 20 sec',
    cues: ['Squeeze gently', 'Keep pain low'],
    commonMistakes: ['Squeezing maximally too soon'],
    easierAlternative: 'Light pillow squeeze, shorter holds',
    harderProgression: 'add_squeeze_long',
    noEquipmentAlternative: 'Squeeze a rolled towel',
    gymAlternative: 'Light adduction machine isometric',
    painRule: PAIN_RULES.isometric
  }),
  makeExercise('add_squeeze_long', 'Long-lever adductor squeeze', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 2, equipment: ['ball'],
    purpose: 'Increase adductor demand at a longer lever.',
    prescription: '4 x 15 sec',
    cues: ['Only if short lever is calm'],
    commonMistakes: ['Progressing before short lever is comfortable'],
    easierAlternative: 'add_squeeze_short',
    harderProgression: 'add_banded_adduction',
    noEquipmentAlternative: 'Towel squeeze, legs straighter',
    gymAlternative: 'Adduction machine, light',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_banded_adduction', 'Banded standing adduction', {
    targetRegion: 'adductor_groin', phase: 'restore', difficulty: 2, equipment: ['band', 'cable'],
    purpose: 'Dynamic adductor strengthening.',
    prescription: '3 x 12/side',
    cues: ['Slow inward pull and slow return'],
    commonMistakes: ['Swinging the leg'],
    easierAlternative: 'add_squeeze_long',
    harderProgression: 'add_copenhagen',
    noEquipmentAlternative: 'Standing weight-shift side to side',
    gymAlternative: 'Cable adduction',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_copenhagen', 'Copenhagen plank (progressed from knee)', {
    targetRegion: 'adductor_groin', phase: 'capacity', difficulty: 4, equipment: ['bench'],
    purpose: 'High-value adductor strength and tear-risk reduction.',
    prescription: '3 x 5–6/side',
    cues: ['Start with the knee supported', 'Hips level'],
    commonMistakes: ['Starting at full lever too soon'],
    easierAlternative: 'Side plank from knees',
    harderProgression: 'Full-lever Copenhagen',
    noEquipmentAlternative: 'Modified Copenhagen on a sofa edge',
    gymAlternative: 'Cable adduction heavy',
    avoidIf: ['Acute painful strain'],
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_cossack', 'Cossack squat (partial range)', {
    targetRegion: 'adductor_groin', phase: 'capacity', difficulty: 3, equipment: ['bodyweight'],
    purpose: 'Strength through a controlled lateral range.',
    prescription: '3 x 6/side',
    cues: ['Stay in pain-free range', 'Hips back'],
    commonMistakes: ['Going too deep too soon'],
    easierAlternative: 'Supported lateral lunge',
    harderProgression: 'Full Cossack squat',
    noEquipmentAlternative: 'Bodyweight lateral lunge',
    gymAlternative: 'Goblet Cossack squat',
    painRule: PAIN_RULES.loading
  }),
  makeExercise('add_cutting_drill', 'Planned cutting drill', {
    targetRegion: 'adductor_groin', phase: 'return', difficulty: 4, equipment: ['cones'],
    purpose: 'Reintroduce change-of-direction load.',
    prescription: '4 x 4 reps',
    cues: ['Controlled angles before sharper cuts', 'No groin pull on push-off'],
    commonMistakes: ['Sharp cuts on day one'],
    easierAlternative: 'Curved jogging',
    harderProgression: 'Reactive cutting',
    noEquipmentAlternative: 'Use markers/landmarks',
    gymAlternative: 'Lateral sled push',
    painRule: PAIN_RULES.impact
  }),
  makeExercise('add_hipflexor_iso', 'Hip-flexor isometric march hold', {
    targetRegion: 'adductor_groin', phase: 'protect', difficulty: 1, equipment: ['bodyweight'],
    purpose: 'Settle iliopsoas/hip-flexor symptoms.',
    prescription: '4 x 15 sec/side',
    cues: ['Knee lifted low', 'No sharp anterior groin pain'],
    commonMistakes: ['Lifting too high too soon'],
    easierAlternative: 'Seated march hold',
    harderProgression: 'Banded hip-flexor raises',
    noEquipmentAlternative: 'Same exercise',
    gymAlternative: 'Cable hip flexion',
    painRule: PAIN_RULES.isometric
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
      makePhase('protect', { name: 'Phase 1 – Protect and settle', goal: 'Calm the strain.', estimatedDuration: '3–7 days', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.earlyStrain, avoid: ['Cutting', 'Kicking', 'Wide stances'], progressionCriteria: ['Calm short-lever squeeze'], regressionCriteria: ['Pain spikes'], exercises: ['add_squeeze_short'] }),
      makePhase('restore', { name: 'Phase 2 – Restore strength', goal: 'Build adductor tolerance.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Sharp cutting'], progressionCriteria: ['Long-lever squeeze calm'], regressionCriteria: ['Next-day increase'], exercises: ['add_squeeze_long', 'add_banded_adduction'] }),
      makePhase('capacity', { name: 'Phase 3 – Build capacity', goal: 'Develop adductor strength.', estimatedDuration: '2–3 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.loading, avoid: ['Returning to sport before strength is solid'], progressionCriteria: ['Copenhagen tolerated'], regressionCriteria: ['Strength work flares symptoms'], exercises: ['add_copenhagen', 'add_cossack'] }),
      makePhase('return', { name: 'Phase 4 – Return to sport', goal: 'Reintroduce cutting and kicking.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 7–8', painRules: PAIN_RULES.impact, avoid: ['Sharp cuts before planned ones are calm'], progressionCriteria: ['Cutting drills calm'], regressionCriteria: ['Groin pull returns'], exercises: ['add_cutting_drill'] })
    ]
  }),
  makeProtocol('adductor_tendon', {
    name: 'Adductor tendon pathway',
    summary: 'Progressive tendon loading.',
    appliesToSubtypes: ['adductor_tendinopathy'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle the tendon', goal: 'Calm symptoms with isometrics.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.isometric, avoid: ['Sudden load spikes'], progressionCriteria: ['Isometrics calm'], regressionCriteria: ['Pain climbing'], exercises: ['add_squeeze_short'] }),
      makePhase('capacity', { name: 'Phase 2 – Load the tendon', goal: 'Build tendon strength.', estimatedDuration: '3–6 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.tendon, avoid: ['Pain climbing session to session'], progressionCriteria: ['Strength tolerated'], regressionCriteria: ['Tendon pain rising'], exercises: ['add_banded_adduction', 'add_copenhagen'] }),
      makePhase('return', { name: 'Phase 3 – Return to sport', goal: 'Reintroduce sport load.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 7–8', painRules: PAIN_RULES.impact, avoid: ['Big load jumps'], progressionCriteria: ['Cutting calm'], regressionCriteria: ['Tendon pain returns'], exercises: ['add_cutting_drill'] })
    ]
  }),
  makeProtocol('pubic_overload', {
    name: 'Pubic-related overload pathway',
    summary: 'Reduce load, build balanced strength around the pubis.',
    appliesToSubtypes: ['pubic_related_groin_pain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Reduce load', goal: 'Settle pubic symptoms.', estimatedDuration: '1–3 weeks', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.isometric, avoid: ['Sit-ups', 'Sharp cutting', 'Kicking'], progressionCriteria: ['Daily symptoms easing'], regressionCriteria: ['Symptoms rising'], exercises: ['add_squeeze_short', 'add_hipflexor_iso'] }),
      makePhase('capacity', { name: 'Phase 2 – Balanced strength', goal: 'Strengthen adductors and trunk together.', estimatedDuration: '4–8 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.loading, avoid: ['Rapid return to sport'], progressionCriteria: ['Strength tolerated'], regressionCriteria: ['Pubic pain rising'], exercises: ['add_banded_adduction', 'add_copenhagen'] }),
      makePhase('return', { name: 'Phase 3 – Return to sport', goal: 'Gradual sport exposure.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Load spikes'], progressionCriteria: ['Cutting/kicking calm'], regressionCriteria: ['Symptoms recur'], exercises: ['add_cutting_drill'] })
    ]
  }),
  makeProtocol('hip_flexor', {
    name: 'Iliopsoas / hip-flexor pathway',
    summary: 'Settle hip-flexor symptoms and rebuild strength.',
    appliesToSubtypes: ['iliopsoas_hip_flexor_related_groin_pain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle', goal: 'Calm hip-flexor irritation.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.isometric, avoid: ['Aggressive hip-flexor stretching', 'Sprinting'], progressionCriteria: ['Isometrics calm'], regressionCriteria: ['Anterior groin pain rising'], exercises: ['add_hipflexor_iso'] }),
      makePhase('capacity', { name: 'Phase 2 – Strengthen', goal: 'Build hip-flexor capacity.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.loading, avoid: ['Speed work too early'], progressionCriteria: ['Resisted hip flexion calm'], regressionCriteria: ['Symptoms increase'], exercises: ['add_banded_adduction'] }),
      makePhase('return', { name: 'Phase 3 – Return', goal: 'Reintroduce running/sport.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Big sprint volume jumps'], progressionCriteria: ['Running calm'], regressionCriteria: ['Hip-flexor pain returns'], exercises: ['add_cutting_drill'] })
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
