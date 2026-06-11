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

const exerciseLibrary = [
  makeExercise('quad_set', 'Quad set', { targetRegion: 'quadriceps', phase: 'protect', difficulty: 1, equipment: ['bodyweight'], purpose: 'Restore the quad signal without pain.', prescription: '5 x 10 sec', cues: ['Tighten the thigh', 'No pain'], commonMistakes: ['Holding the breath'], easierAlternative: 'Towel-supported quad set', harderProgression: 'quad_swed_short_arc', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Light leg-extension isometric', painRule: PAIN_RULES.isometric }),
  makeExercise('quad_swed_short_arc', 'Short-arc knee extension', { targetRegion: 'quadriceps', phase: 'restore', difficulty: 2, equipment: ['bodyweight', 'band'], purpose: 'Build quad strength through a small range.', prescription: '3 x 12', cues: ['Control the lockout and return'], commonMistakes: ['Snapping into lockout'], easierAlternative: 'quad_set', harderProgression: 'quad_stepup', noEquipmentAlternative: 'Seated knee extension (bodyweight)', gymAlternative: 'Leg-extension machine, light', painRule: PAIN_RULES.loading }),
  makeExercise('quad_wallsit', 'Wall-sit (isometric)', { targetRegion: 'quadriceps', phase: 'restore', difficulty: 2, equipment: ['bodyweight'], purpose: 'Isometric quad load; useful for tendon-type pain.', prescription: '4 x 20–30 sec', cues: ['Comfortable knee angle', 'Even weight'], commonMistakes: ['Going too deep too soon'], easierAlternative: 'Shorter holds', harderProgression: 'quad_spanish_squat', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Leg-press isometric hold', painRule: PAIN_RULES.isometric }),
  makeExercise('quad_spanish_squat', 'Spanish squat hold', { targetRegion: 'quadriceps', phase: 'capacity', difficulty: 3, equipment: ['band', 'strap'], purpose: 'Tendon-friendly isometric loading.', prescription: '4 x 20–30 sec', cues: ['Sit back against the band', 'Shins fairly vertical'], commonMistakes: ['Knees drifting forward'], easierAlternative: 'quad_wallsit', harderProgression: 'quad_stepup', noEquipmentAlternative: 'Wall sit', gymAlternative: 'Leg-press isometric', painRule: PAIN_RULES.tendon }),
  makeExercise('quad_stepup', 'Step-up', { targetRegion: 'quadriceps', phase: 'capacity', difficulty: 3, equipment: ['step', 'dumbbells'], purpose: 'Build single-leg quad strength.', prescription: '3 x 8/side', cues: ['Knee tracks over toes', 'Slow lower'], commonMistakes: ['Pushing off the back leg'], easierAlternative: 'Lower step', harderProgression: 'quad_split_squat', noEquipmentAlternative: 'Bodyweight step-up', gymAlternative: 'Loaded step-up', painRule: PAIN_RULES.loading }),
  makeExercise('quad_split_squat', 'Split squat', { targetRegion: 'quadriceps', phase: 'capacity', difficulty: 4, equipment: ['bodyweight', 'dumbbells'], purpose: 'Strength and control through range.', prescription: '4 x 6/side', cues: ['Stay tall', 'Controlled depth'], commonMistakes: ['Knee collapsing inward'], easierAlternative: 'Supported split squat', harderProgression: 'Rear-foot-elevated split squat', noEquipmentAlternative: 'Bodyweight split squat', gymAlternative: 'Dumbbell/barbell split squat', painRule: PAIN_RULES.loading }),
  makeExercise('quad_strides', 'Submax strides', { targetRegion: 'quadriceps', phase: 'speed', difficulty: 3, equipment: ['open_space'], purpose: 'Reintroduce running speed.', prescription: '6 x 40 m at 60–80%', cues: ['Gradual build', 'Upright posture'], commonMistakes: ['Full sprint too early'], easierAlternative: 'Incline walk', harderProgression: 'quad_sprint_kick', noEquipmentAlternative: 'Treadmill strides', gymAlternative: 'Treadmill intervals', painRule: PAIN_RULES.impact }),
  makeExercise('quad_sprint_kick', 'Sprint & kicking exposure', { targetRegion: 'quadriceps', phase: 'return', difficulty: 5, equipment: ['open_space', 'ball'], purpose: 'Restore sprint and kicking capacity.', prescription: '5 x 30 m + 3 x 8 submax kicks', cues: ['Decelerate gradually first', 'Short passes before long strikes'], commonMistakes: ['Max kicks on day one'], easierAlternative: 'quad_strides', harderProgression: 'Full-speed sport play', noEquipmentAlternative: 'Air swing pattern', gymAlternative: 'High-speed treadmill', painRule: PAIN_RULES.impact })
];

const rehabProtocols = [
  makeProtocol('acute_quad_strain', {
    name: 'Acute quadriceps strain pathway',
    summary: 'Settle, strengthen, return to sprint/kick.',
    appliesToSubtypes: ['rectus_femoris_strain', 'vastus_lateralis_strain', 'vastus_medialis_irritation', 'hip_flexor_rectus_femoris_overlap'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and settle', goal: 'Calm the strain.', estimatedDuration: '3–7 days', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.earlyStrain, avoid: ['Sprinting', 'Kicking', 'Deep stretching'], progressionCriteria: ['Calm quad sets', 'Comfortable walking'], regressionCriteria: ['Pain spikes'], exercises: ['quad_set'] }),
      makePhase('restore', { name: 'Phase 2 – Restore strength', goal: 'Rebuild range and light strength.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Explosive loading'], progressionCriteria: ['Short-arc work calm'], regressionCriteria: ['Next-day increase'], exercises: ['quad_swed_short_arc', 'quad_wallsit'] }),
      makePhase('capacity', { name: 'Phase 3 – Build capacity', goal: 'Develop single-leg strength.', estimatedDuration: '2–3 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.loading, avoid: ['Sprinting before speed phase'], progressionCriteria: ['Split squats tolerated'], regressionCriteria: ['Strength work flares symptoms'], exercises: ['quad_stepup', 'quad_split_squat'] }),
      makePhase('speed', { name: 'Phase 4 – Speed and sport prep', goal: 'Reintroduce running speed.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Max kicks/sprints early'], progressionCriteria: ['Strides calm'], regressionCriteria: ['Tightness with speed'], exercises: ['quad_strides'] }),
      makePhase('return', { name: 'Phase 5 – Return to sport', goal: 'Restore sprint and kicking.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 7–9', painRules: PAIN_RULES.impact, avoid: ['Single-session jumps in speed and volume'], progressionCriteria: ['Sprint/kick exposure calm'], regressionCriteria: ['Sharp pull returns'], exercises: ['quad_sprint_kick'] })
    ]
  }),
  makeProtocol('contusion', {
    name: 'Quadriceps contusion (dead-leg) pathway',
    summary: 'Protect early, restore range, then load. Avoid aggressive massage early.',
    appliesToSubtypes: ['quadriceps_contusion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect range', goal: 'Maintain comfortable knee bend, avoid aggravation.', estimatedDuration: '2–5 days', intensityGuidance: 'Gentle', painRules: PAIN_RULES.earlyStrain, avoid: ['Aggressive massage', 'Forced stretching', 'Heavy loading'], progressionCriteria: ['Knee bend improving'], regressionCriteria: ['Swelling/firmness increasing'], exercises: ['quad_set'] }),
      makePhase('restore', { name: 'Phase 2 – Restore range and load', goal: 'Rebuild range and strength.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Contact'], progressionCriteria: ['Full pain-free knee bend'], regressionCriteria: ['Range loss'], exercises: ['quad_swed_short_arc', 'quad_stepup'] }),
      makePhase('return', { name: 'Phase 3 – Return to sport', goal: 'Reintroduce running and contact tolerance.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Early contact to the area'], progressionCriteria: ['Running calm'], regressionCriteria: ['Symptoms recur'], exercises: ['quad_strides', 'quad_sprint_kick'] })
    ]
  }),
  makeProtocol('tendon', {
    name: 'Quad / patellar tendon pathway',
    summary: 'Isometrics first, then heavy slow resistance, then energy storage.',
    appliesToSubtypes: ['quadriceps_tendon_pain', 'patellar_tendon_overlap'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle with isometrics', goal: 'Reduce tendon pain.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 3–5', painRules: PAIN_RULES.isometric, avoid: ['Explosive jumping', 'Deep fast loading'], progressionCriteria: ['Isometrics ease pain'], regressionCriteria: ['Pain climbing'], exercises: ['quad_wallsit', 'quad_spanish_squat'] }),
      makePhase('capacity', { name: 'Phase 2 – Heavy slow resistance', goal: 'Build tendon strength.', estimatedDuration: '3–6 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.tendon, avoid: ['Pain climbing session to session'], progressionCriteria: ['Strength tolerated'], regressionCriteria: ['Tendon pain rising'], exercises: ['quad_stepup', 'quad_split_squat'] }),
      makePhase('return', { name: 'Phase 3 – Energy storage and return', goal: 'Reintroduce jumping/sprinting.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Big jump-volume spikes'], progressionCriteria: ['Strides/jumps calm'], regressionCriteria: ['Tendon pain returns'], exercises: ['quad_strides', 'quad_sprint_kick'] })
    ]
  }),
  makeProtocol('nerve_referral', {
    name: 'Nerve-related anterior thigh pathway (review)',
    summary: 'Cautious, symptom-free care with a recommendation for review.',
    appliesToSubtypes: ['femoral_nerve_related_anterior_thigh_pain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Cautious care and review', goal: 'Avoid provocation and arrange review.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Symptom-free only', painRules: 'Keep everything symptom-free; stop if burning/numbness increases.', avoid: ['Aggressive stretching', 'High loads', 'Sprinting'], progressionCriteria: ['Progress under guidance'], regressionCriteria: ['Numbness/burning increases'], exercises: ['quad_set'] })
    ]
  }),
  makeProtocol('severe_risk', {
    name: 'Higher-grade quad tear (conservative early care)',
    summary: 'Conservative early care while arranging review.',
    appliesToSubtypes: ['severe_quad_tear_risk'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and review', goal: 'Protect and arrange assessment.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Pain-free only', painRules: 'Do not push through pain.', avoid: ['Strength testing the injury', 'Sport', 'Stretching into pain'], progressionCriteria: ['Progress under guidance'], regressionCriteria: ['Any worsening'], exercises: ['quad_set'] })
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
