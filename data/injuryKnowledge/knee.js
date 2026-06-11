/**
 * knee.js
 * ---------------------------------------------------------------------------
 * Knowledge model for knee injuries.
 * Same structure and rule format as hamstring.js.
 *
 * The knee carries several higher-risk patterns (ACL/PCL, meniscus, effusion).
 * These map to cautious / referral pathways and the safety engine can elevate
 * risk and recommend review.
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
  { id: 'patellar_tendinopathy', name: 'Patellar tendinopathy', riskLevel: 'moderate', rehabPathway: 'tendon', note: 'Below-kneecap tendon pain, common with jumping.' },
  { id: 'patellofemoral_pain', name: 'Patellofemoral pain', riskLevel: 'low', rehabPathway: 'patellofemoral', note: 'Diffuse front-knee pain around the kneecap.' },
  { id: 'mcl_sprain', name: 'MCL (inner knee) sprain', riskLevel: 'moderate', rehabPathway: 'ligament_cautious', note: 'Inner-knee ligament; avoid valgus stress early.' },
  { id: 'lcl_sprain', name: 'LCL (outer knee) sprain', riskLevel: 'moderate', rehabPathway: 'ligament_cautious', note: 'Outer-knee ligament; screen instability.' },
  { id: 'meniscus_suspicion', name: 'Meniscus suspicion', riskLevel: 'refer', rehabPathway: 'meniscus_cautious', note: 'Joint-line pain with catching/locking; cautious pathway.' },
  { id: 'acl_pcl_red_flag_suspicion', name: 'ACL/PCL instability suspicion', riskLevel: 'refer', rehabPathway: 'acl_pcl_referral', note: 'Pop, rapid swelling, giving way; medical-first.' },
  { id: 'it_band_lateral_knee_pain', name: 'IT band / lateral knee pain', riskLevel: 'low', rehabPathway: 'itb', note: 'Outer-knee pain, common in running/cycling.' },
  { id: 'quadriceps_tendon_pain', name: 'Quadriceps tendon pain', riskLevel: 'moderate', rehabPathway: 'tendon', note: 'Pain above the kneecap.' },
  { id: 'pes_anserine_irritation', name: 'Pes anserine irritation', riskLevel: 'low', rehabPathway: 'patellofemoral', note: 'Inner shin just below the joint line.' },
  { id: 'general_anterior_knee_overload', name: 'General anterior knee overload', riskLevel: 'low', rehabPathway: 'patellofemoral', note: 'Load-sensitive front-knee pain without clear structure.' },
  { id: 'knee_effusion_high_risk', name: 'Knee effusion (high-risk pattern)', riskLevel: 'refer', rehabPathway: 'effusion_referral', note: 'A swollen knee suggests internal involvement; cautious/review.' }
];

const anatomyRegions = ['knee'];

const detailedAreas = [
  { id: 'front_knee', name: 'Front of the knee' },
  { id: 'patellar_tendon_area', name: 'Below the kneecap (patellar tendon)' },
  { id: 'quad_tendon_area', name: 'Above the kneecap (quad tendon)' },
  { id: 'medial_knee_joint_line', name: 'Inner joint line' },
  { id: 'lateral_knee_joint_line', name: 'Outer joint line' },
  { id: 'posterior_knee', name: 'Back of the knee' },
  { id: 'mcl_region', name: 'Inner knee (MCL)' },
  { id: 'lcl_region', name: 'Outer knee (LCL)' },
  { id: 'pes_anserine_region', name: 'Inner shin below the joint (pes anserine)' },
  { id: 'kneecap_patellofemoral_area', name: 'Around the kneecap (patellofemoral)' },
  { id: 'it_band_lateral_knee', name: 'Outer knee (IT band)' }
];

const assessmentQuestions = [
  makeQuestion('mechanism', 'How did it happen?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'twist', label: 'Twisting / pivoting' },
      { value: 'valgus_contact', label: 'A knock to the outside (knee buckled in)' },
      { value: 'jumping', label: 'Jumping / landing' },
      { value: 'running', label: 'Running load' },
      { value: 'gradual', label: 'Gradually' }
    ]
  }),
  makeQuestion('pop', 'Did you feel or hear a pop?', 'boolean', { category: 'mechanism' }),
  makeQuestion('rapid_swelling', 'Did the knee swell within a few hours?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'caution' }
  }),
  makeQuestion('giving_way', 'Does the knee give way or feel unstable?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'caution' }
  }),
  makeQuestion('locking_catching', 'Does the knee lock or catch?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'caution' }
  }),
  makeQuestion('cannot_straighten', 'Can you NOT fully straighten the knee?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'caution' }
  }),
  makeQuestion('stairs_pain', 'Pain on stairs?', 'boolean', { category: 'symptom' }),
  makeQuestion('squat_pain', 'Pain squatting?', 'boolean', { category: 'symptom' }),
  makeQuestion('jump_land_pain', 'Pain jumping/landing?', 'boolean', { category: 'symptom' }),
  makeQuestion('pain_below_kneecap', 'Pain just below the kneecap?', 'boolean', { category: 'symptom' }),
  makeQuestion('pain_around_kneecap', 'Diffuse pain around the kneecap?', 'boolean', { category: 'symptom' }),
  makeQuestion('medial_jointline_pain', 'Inner joint-line pain?', 'boolean', { category: 'symptom' }),
  makeQuestion('lateral_jointline_pain', 'Outer joint-line pain?', 'boolean', { category: 'symptom' }),
  makeQuestion('previous_knee', 'Previous knee injury?', 'boolean', { category: 'history' })
];

const selfTests = [
  makeSelfTest('squat_tolerance', 'Squat tolerance', { purpose: 'Functional knee load screen.', howTo: ['Squat to a comfortable depth and back up.'], whatPositiveSuggests: 'Pain location helps separate tendon vs joint vs patellofemoral.', whatItDoesNotProve: 'Does not confirm a structure.' }),
  makeSelfTest('step_down_tolerance', 'Step-down tolerance', { purpose: 'Eccentric quad/knee load.', howTo: ['Step down slowly from a low step on one leg.'], whatPositiveSuggests: 'Below/around kneecap pain suggests tendon or patellofemoral load.', whatItDoesNotProve: 'Does not confirm tendon vs joint.', doNotPerformIf: ['Marked swelling', 'Giving way', 'Locking'] }),
  makeSelfTest('single_leg_sit_to_stand', 'Single-leg sit-to-stand', { purpose: 'Single-leg strength screen.', howTo: ['Stand from a chair on one leg if able.'], whatPositiveSuggests: 'Difficulty/pain reflects strength deficit.', whatItDoesNotProve: 'Not graded.', doNotPerformIf: ['Giving way', 'Severe pain'] }),
  makeSelfTest('knee_extension_range', 'Knee extension range check', { purpose: 'Checks for a block to full straightening.', howTo: ['Sit with the heel propped and let the knee straighten.', 'Compare full straightening side to side.'], whatPositiveSuggests: 'An inability to fully straighten can indicate a mechanical block (e.g., meniscus) and warrants review.', whatItDoesNotProve: 'Does not confirm a meniscus tear.', capturesPain: true }),
  makeSelfTest('effusion_screen', 'Swelling / effusion screen', { purpose: 'Screens for joint swelling.', howTo: ['Compare the shape of both knees.', 'Gently press beside the kneecap and feel for fullness/fluid.'], whatPositiveSuggests: 'A swollen joint suggests internal involvement and warrants a cautious pathway and review.', whatItDoesNotProve: 'Cannot identify the exact structure.', capturesPain: false }),
  makeSelfTest('stairs_pain_screen', 'Stairs pain screen', { purpose: 'Common patellofemoral provocation.', howTo: ['Note pain ascending and descending stairs.'], whatPositiveSuggests: 'Stair pain fits patellofemoral or tendon load.', whatItDoesNotProve: 'Not specific on its own.' }),
  makeSelfTest('patellar_tendon_load_screen', 'Patellar tendon load screen', { purpose: 'Loads the patellar tendon.', howTo: ['Single-leg decline squat or slow single-leg squat.', 'Note pain right below the kneecap.'], whatPositiveSuggests: 'Below-kneecap pain on loading fits patellar tendinopathy.', whatItDoesNotProve: 'Does not exclude patellofemoral pain.', doNotPerformIf: ['Marked swelling', 'Giving way'] }),
  makeSelfTest('jointline_symptom_screen', 'Joint-line symptom screen', { purpose: 'Locates joint-line tenderness.', howTo: ['Gently press along the inner and outer joint lines.'], whatPositiveSuggests: 'Joint-line tenderness can reflect meniscus involvement and warrants caution.', whatItDoesNotProve: 'Cannot confirm a meniscus tear.', capturesPain: true }),
  makeSelfTest('instability_screen', 'Instability red-flag screen', { purpose: 'Screens for giving way.', howTo: ['Note whether the knee buckles or feels unstable with daily tasks.'], whatPositiveSuggests: 'Giving way is a reason for caution and clinical review (possible ligament involvement).', whatItDoesNotProve: 'Cannot confirm a specific ligament injury.', capturesPain: false }),
  makeSelfTest('locking_catching_screen', 'Locking / catching screen', { purpose: 'Screens for mechanical symptoms.', howTo: ['Note whether the knee catches, locks, or gets stuck.'], whatPositiveSuggests: 'Locking/catching warrants review for possible meniscus involvement.', whatItDoesNotProve: 'Cannot confirm the cause.', capturesPain: false })
];

const redFlags = [
  {
    id: 'acl_pcl_signs',
    triggerAnswers: [
      { questionId: 'pop', value: true },
      { questionId: 'rapid_swelling', value: true },
      { questionId: 'giving_way', value: true }
    ],
    requireCount: 2,
    severity: 'urgent',
    message:
      'A pop with rapid swelling and/or giving way can indicate a significant ligament injury (e.g., ACL). This is a medical-first situation — seek in-person assessment before loading.'
  },
  {
    id: 'meniscus_mechanical_signs',
    triggerAnswers: [
      { questionId: 'locking_catching', value: true },
      { questionId: 'cannot_straighten', value: true }
    ],
    requireCount: 1,
    severity: 'caution',
    message:
      'Locking, catching, or being unable to fully straighten the knee can indicate a meniscus issue and should be reviewed before aggressive loading.'
  },
  {
    id: 'effusion_sign',
    triggerAnswers: [{ questionId: 'rapid_swelling', value: true }],
    requireCount: 1,
    severity: 'caution',
    message:
      'A swollen knee suggests internal joint involvement. Keep loading gentle and arrange a clinical review.'
  }
];

const diagnosisRules = [
  {
    subtypeId: 'patellar_tendinopathy',
    conditions: [
      { type: 'area', value: ['patellar_tendon_area'], points: 28, reason: 'Pain is below the kneecap (patellar tendon).' },
      { type: 'answer', questionId: 'pain_below_kneecap', value: true, points: 18, reason: 'Pain localized below the kneecap.' },
      { type: 'answer', questionId: 'jump_land_pain', value: true, points: 14, reason: 'Pain jumping/landing fits patellar tendon load.' },
      { type: 'answer', questionId: 'mechanism', value: 'jumping', points: 10, reason: 'Jumping mechanism.' },
      { type: 'selfTest', testId: 'patellar_tendon_load_screen', result: 'painful', points: 12, reason: 'Tendon load screen reproduced below-kneecap pain.' },
      { type: 'answer', questionId: 'rapid_swelling', value: true, points: -12, reason: 'Rapid swelling points to internal joint involvement, not tendinopathy.' }
    ]
  },
  {
    subtypeId: 'patellofemoral_pain',
    conditions: [
      { type: 'area', value: ['kneecap_patellofemoral_area', 'front_knee'], points: 24, reason: 'Diffuse pain around the kneecap.' },
      { type: 'answer', questionId: 'pain_around_kneecap', value: true, points: 18, reason: 'Diffuse peripatellar pain.' },
      { type: 'answer', questionId: 'stairs_pain', value: true, points: 12, reason: 'Pain on stairs.' },
      { type: 'answer', questionId: 'squat_pain', value: true, points: 10, reason: 'Pain squatting.' },
      { type: 'answer', questionId: 'pain_below_kneecap', value: true, points: -8, reason: 'Focal below-kneecap pain points more to the tendon.' }
    ]
  },
  {
    subtypeId: 'mcl_sprain',
    conditions: [
      { type: 'area', value: ['mcl_region', 'medial_knee_joint_line'], points: 24, reason: 'Pain over the inner knee (MCL).' },
      { type: 'answer', questionId: 'mechanism', value: 'valgus_contact', points: 22, reason: 'A knock that buckled the knee inward loads the MCL.' },
      { type: 'answer', questionId: 'medial_jointline_pain', value: true, points: 10, reason: 'Inner-knee pain.' }
    ]
  },
  {
    subtypeId: 'lcl_sprain',
    conditions: [
      { type: 'area', value: ['lcl_region', 'lateral_knee_joint_line'], points: 24, reason: 'Pain over the outer knee (LCL).' },
      { type: 'answer', questionId: 'lateral_jointline_pain', value: true, points: 12, reason: 'Outer-knee pain.' },
      { type: 'answer', questionId: 'giving_way', value: true, points: 8, reason: 'Some instability can accompany an LCL sprain.' }
    ]
  },
  {
    subtypeId: 'meniscus_suspicion',
    conditions: [
      { type: 'area', value: ['medial_knee_joint_line', 'lateral_knee_joint_line'], points: 20, reason: 'Pain on the joint line.' },
      { type: 'answer', questionId: 'locking_catching', value: true, points: 22, reason: 'Locking/catching suggests meniscus involvement.' },
      { type: 'answer', questionId: 'cannot_straighten', value: true, points: 16, reason: 'A block to full straightening.' },
      { type: 'answer', questionId: 'mechanism', value: 'twist', points: 12, reason: 'A twisting mechanism.' },
      { type: 'selfTest', testId: 'jointline_symptom_screen', result: 'painful', points: 8, reason: 'Joint-line tenderness.' }
    ]
  },
  {
    subtypeId: 'acl_pcl_red_flag_suspicion',
    conditions: [
      { type: 'answer', questionId: 'pop', value: true, points: 20, reason: 'A pop at the time of injury.' },
      { type: 'answer', questionId: 'rapid_swelling', value: true, points: 22, reason: 'Rapid swelling (within hours).' },
      { type: 'answer', questionId: 'giving_way', value: true, points: 18, reason: 'Giving way / instability.' },
      { type: 'answer', questionId: 'mechanism', value: 'twist', points: 8, reason: 'Non-contact twist is a common ACL mechanism.' }
    ]
  },
  {
    subtypeId: 'it_band_lateral_knee_pain',
    conditions: [
      { type: 'area', value: ['it_band_lateral_knee'], points: 26, reason: 'Pain at the outer knee (IT band).' },
      { type: 'answer', questionId: 'mechanism', value: 'running', points: 16, reason: 'Running load is the classic driver.' },
      { type: 'answer', questionId: 'lateral_jointline_pain', value: true, points: 6, reason: 'Outer-knee location.' },
      { type: 'answer', questionId: 'locking_catching', value: true, points: -10, reason: 'Mechanical symptoms point away from IT band.' }
    ]
  },
  {
    subtypeId: 'quadriceps_tendon_pain',
    conditions: [
      { type: 'area', value: ['quad_tendon_area'], points: 28, reason: 'Pain is above the kneecap (quad tendon).' },
      { type: 'answer', questionId: 'jump_land_pain', value: true, points: 10, reason: 'Jumping loads the extensor tendon.' }
    ]
  },
  {
    subtypeId: 'pes_anserine_irritation',
    conditions: [
      { type: 'area', value: ['pes_anserine_region'], points: 26, reason: 'Pain at the inner shin just below the joint.' },
      { type: 'answer', questionId: 'mechanism', value: 'running', points: 8, reason: 'Running load can irritate this area.' }
    ]
  },
  {
    subtypeId: 'general_anterior_knee_overload',
    conditions: [
      { type: 'area', value: ['front_knee'], points: 14, reason: 'Front-knee location.' },
      { type: 'answer', questionId: 'mechanism', value: 'gradual', points: 16, reason: 'Gradual, load-related onset.' },
      { type: 'answer', questionId: 'stairs_pain', value: true, points: 8, reason: 'Load-sensitive stair pain.' },
      { type: 'answer', questionId: 'pop', value: true, points: -12, reason: 'A pop points to a specific structural event.' }
    ]
  },
  {
    subtypeId: 'knee_effusion_high_risk',
    conditions: [
      { type: 'answer', questionId: 'rapid_swelling', value: true, points: 26, reason: 'Rapid joint swelling.' },
      { type: 'selfTest', testId: 'effusion_screen', result: 'painful', points: 12, reason: 'Effusion screen suggested joint swelling.' },
      { type: 'answer', questionId: 'giving_way', value: true, points: 8, reason: 'Instability with swelling raises concern.' }
    ]
  }
];

const exerciseLibrary = [
  makeExercise('knee_quad_set', 'Quad set', { targetRegion: 'knee', phase: 'protect', difficulty: 1, equipment: ['bodyweight'], purpose: 'Restore quad activation without swelling response.', prescription: '5 x 10 sec', cues: ['Tighten the thigh', 'No swelling reaction'], commonMistakes: ['Breath holding'], easierAlternative: 'Towel quad set', harderProgression: 'knee_sit_to_stand', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Light leg-extension isometric', painRule: PAIN_RULES.isometric }),
  makeExercise('knee_sit_to_stand', 'Sit-to-stand', { targetRegion: 'knee', phase: 'restore', difficulty: 2, equipment: ['chair'], purpose: 'Rebuild functional strength.', prescription: '3 x 8', cues: ['Even weight', 'No inward collapse'], commonMistakes: ['Pushing off the arms'], easierAlternative: 'Higher chair', harderProgression: 'knee_step_up', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Leg press, light', painRule: PAIN_RULES.loading }),
  makeExercise('knee_spanish_squat', 'Spanish squat hold', { targetRegion: 'knee', phase: 'restore', difficulty: 3, equipment: ['band', 'strap'], purpose: 'Tendon-friendly isometric quad load.', prescription: '4 x 20–30 sec', cues: ['Sit back against the band', 'Shins fairly vertical'], commonMistakes: ['Knees drifting forward'], easierAlternative: 'Wall sit', harderProgression: 'knee_step_down', noEquipmentAlternative: 'Wall sit', gymAlternative: 'Leg-press isometric', painRule: PAIN_RULES.tendon }),
  makeExercise('knee_step_up', 'Step-up', { targetRegion: 'knee', phase: 'capacity', difficulty: 3, equipment: ['step', 'dumbbells'], purpose: 'Single-leg strength.', prescription: '3 x 8/side', cues: ['Knee tracks over toes', 'Slow lower'], commonMistakes: ['Knee caving in'], easierAlternative: 'Lower step', harderProgression: 'knee_split_squat', noEquipmentAlternative: 'Bodyweight step-up', gymAlternative: 'Loaded step-up', painRule: PAIN_RULES.loading }),
  makeExercise('knee_step_down', 'Step-down', { targetRegion: 'knee', phase: 'capacity', difficulty: 4, equipment: ['step'], purpose: 'Eccentric control and tendon/patellofemoral load.', prescription: '3 x 6/side', cues: ['Slow lower', 'Stable pelvis'], commonMistakes: ['Dropping fast', 'Knee valgus'], easierAlternative: 'Lower step-down', harderProgression: 'knee_split_squat', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Same exercise', avoidIf: ['Marked swelling', 'Giving way'], painRule: PAIN_RULES.loading }),
  makeExercise('knee_split_squat', 'Split squat', { targetRegion: 'knee', phase: 'capacity', difficulty: 4, equipment: ['bodyweight', 'dumbbells'], purpose: 'Strength and control through range.', prescription: '4 x 6/side', cues: ['Controlled depth and alignment'], commonMistakes: ['Knee collapsing inward'], easierAlternative: 'Supported split squat', harderProgression: 'Rear-foot-elevated split squat', noEquipmentAlternative: 'Bodyweight split squat', gymAlternative: 'Loaded split squat', painRule: PAIN_RULES.loading }),
  makeExercise('knee_hip_control', 'Hip control (banded lateral walk)', { targetRegion: 'knee', phase: 'restore', difficulty: 2, equipment: ['band'], purpose: 'Improve hip control for patellofemoral/ITB cases.', prescription: '3 x 8 steps/side', cues: ['Small steps', 'Pelvis level'], commonMistakes: ['Letting knees cave'], easierAlternative: 'No-band side steps', harderProgression: 'knee_single_leg_rdl', noEquipmentAlternative: 'Bodyweight side steps', gymAlternative: 'Cable hip abduction', painRule: PAIN_RULES.loading }),
  makeExercise('knee_single_leg_rdl', 'Single-leg RDL', { targetRegion: 'knee', phase: 'capacity', difficulty: 3, equipment: ['bodyweight', 'dumbbells'], purpose: 'Posterior-chain and single-leg control.', prescription: '3 x 6/side', cues: ['Hips square', 'Slow lower'], commonMistakes: ['Rotating the pelvis'], easierAlternative: 'Kickstand RDL', harderProgression: 'Loaded single-leg RDL', noEquipmentAlternative: 'Bodyweight version', gymAlternative: 'Dumbbell single-leg RDL', painRule: PAIN_RULES.loading }),
  makeExercise('knee_landing', 'Landing mechanics', { targetRegion: 'knee', phase: 'speed', difficulty: 4, equipment: ['bodyweight'], purpose: 'Reintroduce landing control.', prescription: '3 x 5', cues: ['Soft knees', 'Quiet landing', 'No inward collapse'], commonMistakes: ['Stiff or valgus landings'], easierAlternative: 'Squat-to-calf-raise', harderProgression: 'knee_cod', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Same exercise', avoidIf: ['Swelling', 'Instability'], painRule: PAIN_RULES.impact }),
  makeExercise('knee_run_intervals', 'Walk-jog intervals', { targetRegion: 'knee', phase: 'speed', difficulty: 3, equipment: ['treadmill', 'flat_route'], purpose: 'Reintroduce running impact.', prescription: '8 x 1 min jog / 1 min walk', cues: ['No swelling or limp later'], commonMistakes: ['Too much too soon'], easierAlternative: 'Bike intervals', harderProgression: 'Continuous run', noEquipmentAlternative: 'Outdoor flat route', gymAlternative: 'Treadmill', painRule: PAIN_RULES.impact }),
  makeExercise('knee_cod', 'Change-of-direction circuit', { targetRegion: 'knee', phase: 'return', difficulty: 5, equipment: ['cones'], purpose: 'Restore cutting/agility.', prescription: '5 x 30 sec', cues: ['Only if no swelling/instability', 'Planned before reactive'], commonMistakes: ['Max angles on day one'], easierAlternative: 'Low-speed planned turns', harderProgression: 'Reactive agility', noEquipmentAlternative: 'Use landmarks', gymAlternative: 'Same exercise', avoidIf: ['Swelling', 'Giving way'], painRule: PAIN_RULES.impact })
];

const rehabProtocols = [
  makeProtocol('tendon', {
    name: 'Knee tendon pathway (patellar / quad tendon)',
    summary: 'Isometrics, heavy slow resistance, then energy storage.',
    appliesToSubtypes: ['patellar_tendinopathy', 'quadriceps_tendon_pain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle with isometrics', goal: 'Reduce tendon pain.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 3–5', painRules: PAIN_RULES.isometric, avoid: ['Explosive jumping', 'Deep fast loading'], progressionCriteria: ['Isometrics ease pain'], regressionCriteria: ['Pain climbing'], exercises: ['knee_quad_set', 'knee_spanish_squat'] }),
      makePhase('capacity', { name: 'Phase 2 – Heavy slow resistance', goal: 'Build tendon strength.', estimatedDuration: '3–6 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.tendon, avoid: ['Pain climbing across sessions'], progressionCriteria: ['Step-downs/split squats tolerated'], regressionCriteria: ['Tendon pain rising'], exercises: ['knee_step_up', 'knee_step_down', 'knee_split_squat'] }),
      makePhase('return', { name: 'Phase 3 – Energy storage and return', goal: 'Reintroduce jumping/running.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Jump-volume spikes'], progressionCriteria: ['Landings and running calm'], regressionCriteria: ['Tendon pain returns'], exercises: ['knee_landing', 'knee_run_intervals', 'knee_cod'] })
    ]
  }),
  makeProtocol('patellofemoral', {
    name: 'Patellofemoral / anterior knee pathway',
    summary: 'Load management plus quad and hip strengthening.',
    appliesToSubtypes: ['patellofemoral_pain', 'pes_anserine_irritation', 'general_anterior_knee_overload'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle load', goal: 'Reduce aggravating load.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.loading, avoid: ['Deep painful squats', 'Sudden running spikes'], progressionCriteria: ['Daily pain easing'], regressionCriteria: ['Symptoms rising'], exercises: ['knee_quad_set', 'knee_hip_control'] }),
      makePhase('restore', { name: 'Phase 2 – Quad and hip strength', goal: 'Build quad and hip control.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Painful ranges'], progressionCriteria: ['Sit-to-stand and hip control calm'], regressionCriteria: ['Next-day increase'], exercises: ['knee_sit_to_stand', 'knee_hip_control', 'knee_single_leg_rdl'] }),
      makePhase('capacity', { name: 'Phase 3 – Build capacity', goal: 'Single-leg strength and control.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.loading, avoid: ['Rushing impact'], progressionCriteria: ['Step-ups/step-downs tolerated'], regressionCriteria: ['Front-knee pain rising'], exercises: ['knee_step_up', 'knee_step_down'] }),
      makePhase('return', { name: 'Phase 4 – Return to running/sport', goal: 'Reintroduce running and sport.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['More than ~10% weekly running increase'], progressionCriteria: ['Walk-jog calm'], regressionCriteria: ['Symptoms recur'], exercises: ['knee_run_intervals'] })
    ]
  }),
  makeProtocol('itb', {
    name: 'IT band / lateral knee pathway',
    summary: 'Load management plus hip control; flat running before hills.',
    appliesToSubtypes: ['it_band_lateral_knee_pain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle load', goal: 'Reduce lateral-knee aggravation.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.loading, avoid: ['Hills', 'Long runs', 'Downhill'], progressionCriteria: ['Lateral-knee pain easing'], regressionCriteria: ['Pain rising with load'], exercises: ['knee_hip_control', 'knee_quad_set'] }),
      makePhase('capacity', { name: 'Phase 2 – Hip and single-leg strength', goal: 'Build hip control and strength.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.loading, avoid: ['Returning to hills early'], progressionCriteria: ['Single-leg strength solid'], regressionCriteria: ['Lateral-knee pain returns'], exercises: ['knee_single_leg_rdl', 'knee_step_down'] }),
      makePhase('return', { name: 'Phase 3 – Return to running', goal: 'Rebuild flat running, then hills.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Hills until flat running is symptom-free'], progressionCriteria: ['Flat runs calm'], regressionCriteria: ['Lateral-knee pain climbs'], exercises: ['knee_run_intervals'] })
    ]
  }),
  makeProtocol('ligament_cautious', {
    name: 'Collateral ligament (MCL/LCL) cautious pathway',
    summary: 'Protect the ligament early; avoid sideways stress; rebuild strength.',
    appliesToSubtypes: ['mcl_sprain', 'lcl_sprain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect the ligament', goal: 'Settle and protect from sideways stress.', estimatedDuration: '1–2 weeks', intensityGuidance: 'Gentle', painRules: PAIN_RULES.earlyStrain, avoid: ['Sideways/valgus or varus stress', 'Cutting', 'Pivoting'], progressionCriteria: ['Comfortable straight-line walking'], regressionCriteria: ['Instability or swelling'], exercises: ['knee_quad_set', 'knee_sit_to_stand'] }),
      makePhase('restore', { name: 'Phase 2 – Strength in safe planes', goal: 'Rebuild strength avoiding sideways stress.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Cutting', 'Pivoting'], progressionCriteria: ['Step-ups calm'], regressionCriteria: ['Instability returns'], exercises: ['knee_step_up', 'knee_single_leg_rdl'] }),
      makePhase('return', { name: 'Phase 3 – Return to sport', goal: 'Reintroduce change of direction gradually.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Sharp cuts before planned ones are calm'], progressionCriteria: ['Planned change-of-direction calm'], regressionCriteria: ['Instability/pain returns'], exercises: ['knee_landing', 'knee_cod'] })
    ]
  }),
  makeProtocol('meniscus_cautious', {
    name: 'Meniscus suspicion (cautious / review)',
    summary: 'Gentle strength; avoid deep/twisting load; recommend review.',
    appliesToSubtypes: ['meniscus_suspicion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Cautious care and review', goal: 'Settle symptoms and arrange review.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Gentle, pain-free', painRules: 'Keep loading gentle and pain-free.', avoid: ['Deep squatting', 'Twisting/pivoting', 'Impact'], progressionCriteria: ['Progress under guidance'], regressionCriteria: ['Locking/swelling — seek review sooner'], exercises: ['knee_quad_set', 'knee_sit_to_stand'] }),
      makePhase('restore', { name: 'Phase 2 – Gentle strength', goal: 'Rebuild strength in comfortable range.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Deep/twisting load'], progressionCriteria: ['Comfortable mid-range strength'], regressionCriteria: ['Mechanical symptoms return'], exercises: ['knee_step_up', 'knee_hip_control'] })
    ]
  }),
  makeProtocol('acl_pcl_referral', {
    name: 'ACL/PCL suspicion (medical-first)',
    summary: 'Protect and arrange in-person assessment before any loading program.',
    appliesToSubtypes: ['acl_pcl_red_flag_suspicion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and seek review', goal: 'Protect the knee and get assessed.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Gentle, pain-free only', painRules: 'Avoid anything that makes the knee give way.', avoid: ['Twisting/pivoting', 'Cutting', 'Impact', 'Strength testing the knee'], progressionCriteria: ['Only progress under professional guidance'], regressionCriteria: ['Any giving way — seek review sooner'], exercises: ['knee_quad_set'] })
    ]
  }),
  makeProtocol('effusion_referral', {
    name: 'Knee effusion (cautious / review)',
    summary: 'A swollen knee suggests internal involvement; keep loading gentle and seek review.',
    appliesToSubtypes: ['knee_effusion_high_risk'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle swelling and review', goal: 'Reduce swelling and arrange review.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Gentle, pain-free', painRules: 'Keep everything gentle; avoid anything that worsens swelling.', avoid: ['Impact', 'Deep loading', 'Twisting'], progressionCriteria: ['Swelling settling; progress under guidance'], regressionCriteria: ['Swelling increases'], exercises: ['knee_quad_set'] })
    ]
  })
];

const returnToSport = {
  genericLadder: ['Pain-free walking', 'Pain-free stairs', 'Walk-jog intervals', 'Continuous run', 'Landing mechanics', 'Planned change of direction', 'Reactive agility', 'Full training', 'Match return'],
  criteriaToReturn: ['No swelling response to loading', 'Single-leg strength close to the other side', 'Confident landing and change of direction'],
  sportSpecific: {
    'Football / soccer': ['Add planned then reactive cutting; confirm no swelling after sessions.'],
    Basketball: ['Add jump-landing and decel before scrimmage.'],
    Running: ['Build flat running before hills/speed.']
  }
};

const maintenancePlan = {
  goal: 'Maintain quad/hip strength and control to reduce knee reinjury.',
  frequency: '2 sessions per week',
  exercises: ['knee_split_squat', 'knee_single_leg_rdl', 'knee_hip_control'],
  preventionNotes: ['Keep single-leg strength and landing control in your routine.', 'Build running and jump volume gradually.']
};

const knee = {
  id: 'knee',
  name: 'Knee',
  shortDescription:
    'Knee injuries spanning tendon pain, patellofemoral pain, collateral ligament sprains, meniscus and ACL/PCL concern, IT band pain, and effusion.',
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

export default knee;
