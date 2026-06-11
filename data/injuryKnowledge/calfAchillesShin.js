/**
 * calfAchillesShin.js
 * ---------------------------------------------------------------------------
 * Knowledge model for calf / Achilles / shin injuries.
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
  { id: 'gastrocnemius_strain', name: 'Gastrocnemius (upper calf) strain', riskLevel: 'moderate', rehabPathway: 'acute_calf_strain', note: 'Often a sudden push-off pain in the upper calf.' },
  { id: 'soleus_strain', name: 'Soleus (lower/deep calf) strain', riskLevel: 'moderate', rehabPathway: 'acute_calf_strain', note: 'Deeper, slower-onset calf strain common in runners.' },
  { id: 'achilles_tendinopathy', name: 'Achilles tendinopathy', riskLevel: 'moderate', rehabPathway: 'achilles_tendon', note: 'Load-related Achilles pain, often with morning stiffness.' },
  { id: 'achilles_rupture_suspicion', name: 'Possible Achilles rupture', riskLevel: 'refer', rehabPathway: 'rupture_referral', note: 'Sudden pop with weak push-off; urgent review.' },
  { id: 'medial_tibial_stress_syndrome', name: 'Medial tibial stress syndrome (shin splints)', riskLevel: 'moderate', rehabPathway: 'shin_load', note: 'Diffuse inner-shin pain with running load.' },
  { id: 'tibial_stress_fracture_suspicion', name: 'Possible tibial stress fracture', riskLevel: 'refer', rehabPathway: 'bone_stress_referral', note: 'Focal bone pain; needs review and possibly imaging.' },
  { id: 'anterior_shin_overload', name: 'Anterior shin overload (tibialis anterior)', riskLevel: 'low', rehabPathway: 'shin_load', note: 'Front-shin overload, often from running volume/downhill.' },
  { id: 'compartment_syndrome_warning_pattern', name: 'Exertional compartment warning pattern', riskLevel: 'refer', rehabPathway: 'compartment_referral', note: 'Tightness/pressure/numbness with exertion; needs review.' },
  { id: 'calf_cramp_overload', name: 'Calf cramp / overload', riskLevel: 'low', rehabPathway: 'shin_load', note: 'Cramp-type or load-sensitive calf tightness.' }
];

const anatomyRegions = ['calf_shin'];

const detailedAreas = [
  { id: 'calves', name: 'Calf (general)' },
  { id: 'medial_gastrocnemius', name: 'Inner upper calf (medial gastrocnemius)' },
  { id: 'lateral_gastrocnemius', name: 'Outer upper calf (lateral gastrocnemius)' },
  { id: 'soleus_region', name: 'Lower / deep calf (soleus)' },
  { id: 'achilles_tendon', name: 'Achilles tendon' },
  { id: 'lower_calf', name: 'Lower calf' },
  { id: 'upper_calf', name: 'Upper calf' },
  { id: 'medial_shin', name: 'Inner shin (medial border)' },
  { id: 'lateral_shin', name: 'Outer shin' },
  { id: 'tibialis_anterior_shin', name: 'Front shin (tibialis anterior)' }
];

const assessmentQuestions = [
  makeQuestion('mechanism', 'How did the pain start?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'push_off', label: 'Sudden push-off' },
      { value: 'running_increase', label: 'Increased running load' },
      { value: 'hill', label: 'Hill running' },
      { value: 'sprinting', label: 'Sprinting' },
      { value: 'jumping', label: 'Jumping' },
      { value: 'gradual', label: 'Gradually' }
    ]
  }),
  makeQuestion('pop', 'Did you feel a pop or a sudden "kick" in the calf/Achilles?', 'boolean', { category: 'mechanism' }),
  makeQuestion('walking_pain', 'Is walking painful?', 'boolean', { category: 'function' }),
  makeQuestion('calf_raise_pain', 'Pain rising onto your toes (calf raise)?', 'boolean', { category: 'symptom' }),
  makeQuestion('morning_achilles_stiffness', 'Morning Achilles stiffness that eases as you move?', 'boolean', { category: 'symptom' }),
  makeQuestion('shin_pain_running', 'Shin pain during running that eases with rest?', 'boolean', { category: 'symptom' }),
  makeQuestion('focal_bone_tenderness', 'Is there a focal, pinpoint tender spot on the bone?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'caution' }
  }),
  makeQuestion('rest_night_pain', 'Pain at rest or at night?', 'boolean', { category: 'red_flag' }),
  makeQuestion('exertion_pressure_numbness', 'Tightness, pressure, or numbness that builds with exertion and eases with rest?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'caution' }
  }),
  makeQuestion('weak_pushoff', 'Is your push-off noticeably weak or absent?', 'boolean', {
    category: 'function',
    redFlagTrigger: { value: true, severity: 'urgent' }
  }),
  makeQuestion('previous_calf', 'Previous calf/Achilles/shin injury?', 'boolean', { category: 'history' })
];

const selfTests = [
  makeSelfTest('double_calf_raise', 'Double-leg calf raise', { purpose: 'Basic calf-Achilles load.', howTo: ['Rise onto both toes and lower slowly, 10–12 times.'], whatPositiveSuggests: 'Pain reflects calf/Achilles load sensitivity.', whatItDoesNotProve: 'Does not grade or localize.' }),
  makeSelfTest('single_calf_raise', 'Single-leg calf raise', { purpose: 'Higher single-leg calf-Achilles load and capacity.', howTo: ['Rise onto one toe and lower slowly; compare sides and count reps.'], whatPositiveSuggests: 'Weakness/pain reflects calf/Achilles deficit.', whatItDoesNotProve: 'Not a graded test.', doNotPerformIf: ['You cannot do a pain-free double-leg raise', 'Suspected rupture (weak push-off)'] }),
  makeSelfTest('bent_knee_calf_raise', 'Bent-knee calf raise', { purpose: 'Biases the soleus.', howTo: ['Calf raise with the knee slightly bent.'], whatPositiveSuggests: 'Pain here points more to the soleus.', whatItDoesNotProve: 'Does not exclude gastrocnemius involvement.' }),
  makeSelfTest('hop_tolerance', 'Hop tolerance (only when safe)', { purpose: 'Screens elastic/impact tolerance.', howTo: ['Only if calf raises are pain-free: a few small two-footed hops.'], whatPositiveSuggests: 'Pain reflects limited impact tolerance.', whatItDoesNotProve: 'Does not confirm sport readiness.', doNotPerformIf: ['Painful calf raise', 'Suspected rupture', 'Focal bone pain'] }),
  makeSelfTest('achilles_squeeze_screen', 'Achilles functional / squeeze screen (caution)', { purpose: 'Cautiously screens for a possible Achilles rupture.', howTo: ['Lie face down with feet off the edge.', 'Have someone gently squeeze the calf and watch if the foot moves down.', 'No foot movement is concerning.'], whatPositiveSuggests: 'Absent foot movement or very weak push-off can indicate a rupture and needs urgent review.', whatItDoesNotProve: 'A screen only; it cannot confirm or exclude rupture.', stopCriteria: ['Any suspicion of rupture — stop and seek urgent care'], capturesPain: false }),
  makeSelfTest('shin_palpation_screen', 'Shin palpation screen', { purpose: 'Separates diffuse shin pain from focal bone pain.', howTo: ['Press along the inner shin.', 'Note diffuse soreness vs one pinpoint tender spot.'], whatPositiveSuggests: 'A pinpoint tender spot raises bone-stress concern and warrants review.', whatItDoesNotProve: 'Palpation cannot diagnose a stress fracture.', capturesPain: true }),
  makeSelfTest('walk_jog_tolerance', 'Walk/jog tolerance', { purpose: 'Functional impact screen.', howTo: ['Walk, then a short easy jog if comfortable.'], whatPositiveSuggests: 'Pain reflects impact intolerance.', whatItDoesNotProve: 'Does not localize the source.', doNotPerformIf: ['Painful walking', 'Suspected rupture or bone stress'] }),
  makeSelfTest('morning_stiffness_score', 'Morning stiffness score', { purpose: 'Tracks Achilles tendinopathy behaviour.', howTo: ['Rate Achilles stiffness on the first steps each morning (0–10).'], whatPositiveSuggests: 'Notable morning stiffness fits Achilles tendinopathy.', whatItDoesNotProve: 'Not specific on its own.', capturesPain: true })
];

const redFlags = [
  {
    id: 'achilles_rupture_signs',
    triggerAnswers: [
      { questionId: 'pop', value: true },
      { questionId: 'weak_pushoff', value: true }
    ],
    requireCount: 1,
    severity: 'urgent',
    message:
      'A sudden pop with weak or absent push-off can indicate an Achilles rupture. Avoid loading and seek urgent in-person assessment.'
  },
  {
    id: 'bone_stress_signs',
    triggerAnswers: [
      { questionId: 'focal_bone_tenderness', value: true },
      { questionId: 'rest_night_pain', value: true }
    ],
    requireCount: 2,
    severity: 'caution',
    message:
      'Focal bone tenderness with rest/night pain can indicate a bone-stress injury. A clinical review (and possibly imaging) is recommended before running.'
  },
  {
    id: 'compartment_signs',
    triggerAnswers: [{ questionId: 'exertion_pressure_numbness', value: true }],
    requireCount: 1,
    severity: 'caution',
    message:
      'Exertional tightness/pressure with numbness should be reviewed to consider compartment syndrome; do not push through these symptoms.'
  },
  {
    id: 'calf_dvt_overlap',
    triggerAnswers: [{ questionId: 'rest_night_pain', value: true }],
    requireCount: 1,
    severity: 'caution',
    message:
      'If the calf is also swollen, warm, or red without a clear injury, treat it as a possible blood clot (DVT) and seek urgent assessment.'
  }
];

const diagnosisRules = [
  {
    subtypeId: 'gastrocnemius_strain',
    conditions: [
      { type: 'area', value: ['medial_gastrocnemius', 'lateral_gastrocnemius', 'upper_calf'], points: 26, reason: 'Pain is in the upper calf (gastrocnemius).' },
      { type: 'answer', questionId: 'mechanism', value: 'push_off', points: 20, reason: 'Sudden push-off mechanism.' },
      { type: 'answer', questionId: 'pop', value: true, points: 10, reason: 'A sudden "kick"/pop was felt.' },
      { type: 'selfTest', testId: 'double_calf_raise', result: 'painful', points: 12, reason: 'Calf raise reproduced symptoms.' },
      { type: 'answer', questionId: 'weak_pushoff', value: true, points: -10, reason: 'Truly absent push-off shifts concern toward rupture.' }
    ]
  },
  {
    subtypeId: 'soleus_strain',
    conditions: [
      { type: 'area', value: ['soleus_region', 'lower_calf'], points: 26, reason: 'Pain is in the lower/deep calf (soleus).' },
      { type: 'answer', questionId: 'mechanism', value: 'running_increase', points: 16, reason: 'Running-load onset fits the soleus.' },
      { type: 'answer', questionId: 'mechanism', value: 'gradual', points: 10, reason: 'Gradual onset fits a soleus pattern.' },
      { type: 'selfTest', testId: 'bent_knee_calf_raise', result: 'painful', points: 14, reason: 'Bent-knee calf raise (soleus bias) reproduced symptoms.' }
    ]
  },
  {
    subtypeId: 'achilles_tendinopathy',
    conditions: [
      { type: 'area', value: ['achilles_tendon'], points: 28, reason: 'Pain is localized to the Achilles tendon.' },
      { type: 'answer', questionId: 'morning_achilles_stiffness', value: true, points: 20, reason: 'Morning stiffness that eases is typical of Achilles tendinopathy.' },
      { type: 'answer', questionId: 'mechanism', value: 'running_increase', points: 10, reason: 'Load-related onset.' },
      { type: 'selfTest', testId: 'morning_stiffness_score', result: 'painful', points: 10, reason: 'Notable morning stiffness reported.' },
      { type: 'answer', questionId: 'pop', value: true, points: -12, reason: 'A clear pop shifts concern toward rupture.' }
    ]
  },
  {
    subtypeId: 'achilles_rupture_suspicion',
    conditions: [
      { type: 'answer', questionId: 'pop', value: true, points: 22, reason: 'A sudden pop in the Achilles.' },
      { type: 'answer', questionId: 'weak_pushoff', value: true, points: 26, reason: 'Weak or absent push-off.' },
      { type: 'area', value: ['achilles_tendon'], points: 8, reason: 'Achilles location.' }
    ]
  },
  {
    subtypeId: 'medial_tibial_stress_syndrome',
    conditions: [
      { type: 'area', value: ['medial_shin'], points: 26, reason: 'Pain along the inner shin border.' },
      { type: 'answer', questionId: 'shin_pain_running', value: true, points: 18, reason: 'Shin pain with running that eases with rest.' },
      { type: 'answer', questionId: 'mechanism', value: 'running_increase', points: 12, reason: 'Running-load onset.' },
      { type: 'selfTest', testId: 'shin_palpation_screen', result: 'mild', points: 8, reason: 'Diffuse (not pinpoint) inner-shin tenderness.' },
      { type: 'answer', questionId: 'focal_bone_tenderness', value: true, points: -14, reason: 'Pinpoint bone tenderness points more to bone stress.' }
    ]
  },
  {
    subtypeId: 'tibial_stress_fracture_suspicion',
    conditions: [
      { type: 'answer', questionId: 'focal_bone_tenderness', value: true, points: 26, reason: 'Focal, pinpoint bone tenderness.' },
      { type: 'answer', questionId: 'rest_night_pain', value: true, points: 18, reason: 'Rest/night pain raises bone-stress concern.' },
      { type: 'area', value: ['medial_shin'], points: 8, reason: 'Inner-shin location.' }
    ]
  },
  {
    subtypeId: 'anterior_shin_overload',
    conditions: [
      { type: 'area', value: ['tibialis_anterior_shin', 'lateral_shin'], points: 26, reason: 'Pain is at the front/outer shin.' },
      { type: 'answer', questionId: 'mechanism', value: 'running_increase', points: 12, reason: 'Running-load onset.' },
      { type: 'answer', questionId: 'mechanism', value: 'hill', points: 8, reason: 'Downhill/hill load can overload the front shin.' }
    ]
  },
  {
    subtypeId: 'compartment_syndrome_warning_pattern',
    conditions: [
      { type: 'answer', questionId: 'exertion_pressure_numbness', value: true, points: 30, reason: 'Exertional pressure/tightness with numbness.' },
      { type: 'area', value: ['tibialis_anterior_shin', 'lateral_shin'], points: 6, reason: 'Anterior/lateral shin distribution.' }
    ]
  },
  {
    subtypeId: 'calf_cramp_overload',
    conditions: [
      { type: 'area', value: ['calves', 'upper_calf', 'lower_calf'], points: 16, reason: 'General calf load symptoms.' },
      { type: 'answer', questionId: 'mechanism', value: 'gradual', points: 14, reason: 'Gradual, load-sensitive onset.' },
      { type: 'answer', questionId: 'pop', value: true, points: -16, reason: 'A pop argues against simple cramp/overload.' }
    ]
  }
];

const exerciseLibrary = [
  makeExercise('calf_iso_seated', 'Seated calf isometric', { targetRegion: 'calf_shin', phase: 'protect', difficulty: 1, equipment: ['bodyweight'], purpose: 'Calm pain and gently load the calf.', prescription: '5 x 20 sec', cues: ['Push through the big and second toe'], commonMistakes: ['Pushing too hard'], easierAlternative: 'Lighter two-leg floor press', harderProgression: 'calf_double_raise', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Seated calf-machine isometric', painRule: PAIN_RULES.isometric }),
  makeExercise('calf_double_raise', 'Double-leg calf raise', { targetRegion: 'calf_shin', phase: 'restore', difficulty: 2, equipment: ['bodyweight'], purpose: 'Rebuild calf strength.', prescription: '3 x 10–12', cues: ['Three-second lower'], commonMistakes: ['Bouncing at the bottom'], easierAlternative: 'calf_iso_seated', harderProgression: 'calf_single_raise', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Standing calf machine', painRule: PAIN_RULES.loading }),
  makeExercise('calf_bent_knee_raise', 'Bent-knee (soleus) calf raise', { targetRegion: 'calf_shin', phase: 'restore', difficulty: 2, equipment: ['bodyweight', 'dumbbells'], purpose: 'Bias the soleus.', prescription: '3 x 10', cues: ['Keep the knee bent throughout'], commonMistakes: ['Straightening the knee'], easierAlternative: 'Isometric soleus hold', harderProgression: 'calf_single_raise', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Seated calf machine', painRule: PAIN_RULES.loading }),
  makeExercise('calf_single_raise', 'Single-leg calf raise', { targetRegion: 'calf_shin', phase: 'capacity', difficulty: 3, equipment: ['bodyweight', 'dumbbells'], purpose: 'Build single-leg calf capacity.', prescription: '4 x 6–8', cues: ['Full height', 'Slow lower'], commonMistakes: ['Partial range'], easierAlternative: 'Two-up, one-down', harderProgression: 'calf_pogo', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Loaded single-leg raise', painRule: PAIN_RULES.tendon }),
  makeExercise('calf_pogo', 'Low pogo hops', { targetRegion: 'calf_shin', phase: 'speed', difficulty: 3, equipment: ['bodyweight'], purpose: 'Introduce elastic load.', prescription: '3 x 20 sec', cues: ['Quiet, springy contacts'], commonMistakes: ['Heavy landings'], easierAlternative: 'Fast double-leg calf raises', harderProgression: 'calf_run_progression', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Same exercise', avoidIf: ['Painful calf raise', 'Bone-stress concern'], painRule: PAIN_RULES.impact }),
  makeExercise('calf_tib_raise', 'Tibialis raise', { targetRegion: 'calf_shin', phase: 'restore', difficulty: 1, equipment: ['wall'], purpose: 'Strengthen the front shin for shin-pain cases.', prescription: '3 x 12', cues: ['Lift the toes without leaning too far back'], commonMistakes: ['Using momentum'], easierAlternative: 'Seated toe lift', harderProgression: 'Weighted tib raise', noEquipmentAlternative: 'Seated toe lift', gymAlternative: 'Tib-bar raise', painRule: PAIN_RULES.loading }),
  makeExercise('calf_run_progression', 'Walk-run / run progression', { targetRegion: 'calf_shin', phase: 'return', difficulty: 4, equipment: ['treadmill', 'flat_route'], purpose: 'Reintroduce running impact.', prescription: '8 x 1 min run / 1 min walk → continuous', cues: ['Flat surface first', 'Increase distance OR speed, not both'], commonMistakes: ['Adding hills early'], easierAlternative: 'Brisk walk intervals', harderProgression: 'Sport-specific footwork', noEquipmentAlternative: 'Outdoor flat route', gymAlternative: 'Treadmill', painRule: PAIN_RULES.impact })
];

const rehabProtocols = [
  makeProtocol('acute_calf_strain', {
    name: 'Acute calf strain pathway',
    summary: 'Settle, strengthen, then reintroduce impact and speed.',
    appliesToSubtypes: ['gastrocnemius_strain', 'soleus_strain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and settle', goal: 'Calm the strain and restore walking.', estimatedDuration: '3–7 days', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.earlyStrain, avoid: ['Sprinting', 'Hopping', 'Hills'], progressionCriteria: ['Comfortable walking', 'Calm isometrics'], regressionCriteria: ['Pain spikes'], exercises: ['calf_iso_seated'] }),
      makePhase('restore', { name: 'Phase 2 – Restore strength', goal: 'Rebuild calf strength.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Impact work'], progressionCriteria: ['Double-leg raises calm'], regressionCriteria: ['Next-day increase'], exercises: ['calf_double_raise', 'calf_bent_knee_raise'] }),
      makePhase('capacity', { name: 'Phase 3 – Build capacity', goal: 'Single-leg calf strength.', estimatedDuration: '2–3 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.loading, avoid: ['Returning to running before single-leg raises are strong'], progressionCriteria: ['Single-leg raises tolerated'], regressionCriteria: ['Strength work flares symptoms'], exercises: ['calf_single_raise'] }),
      makePhase('speed', { name: 'Phase 4 – Elastic and speed', goal: 'Introduce hopping and build-ups.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.impact, avoid: ['Hills early'], progressionCriteria: ['Pogos and walk-run calm'], regressionCriteria: ['Calf grabs with speed'], exercises: ['calf_pogo', 'calf_run_progression'] }),
      makePhase('return', { name: 'Phase 5 – Return to sport', goal: 'Restore full running/sprint.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Big single-week volume jumps'], progressionCriteria: ['Running and footwork calm'], regressionCriteria: ['Symptoms recur'], exercises: ['calf_run_progression'] })
    ]
  }),
  makeProtocol('achilles_tendon', {
    name: 'Achilles tendinopathy pathway',
    summary: 'Isometrics, heavy slow calf strength, then elastic load.',
    appliesToSubtypes: ['achilles_tendinopathy'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle the tendon', goal: 'Reduce pain with isometrics.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 3–5', painRules: PAIN_RULES.isometric, avoid: ['Hill running', 'Explosive hopping', 'Deep fast stretching'], progressionCriteria: ['Morning stiffness easing'], regressionCriteria: ['Pain climbing'], exercises: ['calf_iso_seated', 'calf_double_raise'] }),
      makePhase('capacity', { name: 'Phase 2 – Heavy slow strength', goal: 'Build tendon strength.', estimatedDuration: '3–8 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.tendon, avoid: ['Pain climbing session to session'], progressionCriteria: ['Single-leg raises strong'], regressionCriteria: ['Morning stiffness worsening'], exercises: ['calf_bent_knee_raise', 'calf_single_raise'] }),
      makePhase('return', { name: 'Phase 3 – Elastic load and return', goal: 'Reintroduce hopping and running.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Hills until flat running is calm'], progressionCriteria: ['Pogos and running calm'], regressionCriteria: ['Tendon pain returns'], exercises: ['calf_pogo', 'calf_run_progression'] })
    ]
  }),
  makeProtocol('shin_load', {
    name: 'Shin / overload load-management pathway',
    summary: 'Manage load, strengthen, and rebuild running tolerance.',
    appliesToSubtypes: ['medial_tibial_stress_syndrome', 'anterior_shin_overload', 'calf_cramp_overload'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Reduce load', goal: 'Settle shin/calf symptoms.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.loading, avoid: ['Running spikes', 'Hills'], progressionCriteria: ['Walking pain-free'], regressionCriteria: ['Symptoms rising'], exercises: ['calf_iso_seated', 'calf_tib_raise'] }),
      makePhase('capacity', { name: 'Phase 2 – Build capacity', goal: 'Strengthen calf and shin.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.loading, avoid: ['Rapid mileage increases'], progressionCriteria: ['Strength tolerated'], regressionCriteria: ['Shin pain rising'], exercises: ['calf_double_raise', 'calf_single_raise', 'calf_tib_raise'] }),
      makePhase('return', { name: 'Phase 3 – Return to running', goal: 'Rebuild running volume gradually.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['More than ~10% weekly volume increase'], progressionCriteria: ['Walk-run calm'], regressionCriteria: ['Shin pain returns'], exercises: ['calf_run_progression'] })
    ]
  }),
  makeProtocol('rupture_referral', {
    name: 'Possible Achilles rupture (urgent review)',
    summary: 'Do not load; seek urgent in-person assessment.',
    appliesToSubtypes: ['achilles_rupture_suspicion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and seek urgent care', goal: 'Avoid loading and get assessed urgently.', estimatedDuration: 'Immediate', intensityGuidance: 'Do not load', painRules: 'Do not test or load the Achilles.', avoid: ['Walking on it if avoidable', 'Calf raises', 'Any push-off testing'], progressionCriteria: ['Only after professional assessment'], regressionCriteria: ['N/A — seek urgent care'], exercises: [] })
    ]
  }),
  makeProtocol('bone_stress_referral', {
    name: 'Possible tibial stress fracture (review first)',
    summary: 'Reduce impact and seek review; running is not advised yet.',
    appliesToSubtypes: ['tibial_stress_fracture_suspicion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Offload and review', goal: 'Reduce bone load and arrange assessment.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Low-impact only', painRules: 'Avoid any activity that reproduces the focal bone pain.', avoid: ['Running', 'Hopping', 'Impact'], progressionCriteria: ['Progress only after review/clearance'], regressionCriteria: ['Worsening — seek review sooner'], exercises: ['calf_iso_seated'] })
    ]
  }),
  makeProtocol('compartment_referral', {
    name: 'Exertional compartment warning (review)',
    summary: 'Do not push through exertional pressure/numbness; seek review.',
    appliesToSubtypes: ['compartment_syndrome_warning_pattern'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Review before loading', goal: 'Arrange assessment for exertional symptoms.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Avoid provocative exertion', painRules: 'Stop activity when pressure/numbness builds.', avoid: ['Running through symptoms', 'Sustained hard exertion'], progressionCriteria: ['Progress only after review'], regressionCriteria: ['Worsening symptoms'], exercises: ['calf_iso_seated'] })
    ]
  })
];

const returnToSport = {
  genericLadder: ['Pain-free walking', 'Walk-run intervals', 'Continuous easy run', 'Tempo run', 'Hops / elastic load', 'Sprint build-ups', 'Sport footwork', 'Full training', 'Match return'],
  criteriaToReturn: ['Single-leg calf raise capacity close to the other side', 'Pain-free running on the flat', 'Elastic/hop work tolerated'],
  sportSpecific: {
    Running: ['Build distance before speed; reintroduce hills last.'],
    'Football / soccer': ['Add footwork and sprint build-ups before cutting.'],
    Basketball: ['Add jump-landing and decel before scrimmage.']
  }
};

const maintenancePlan = {
  goal: 'Maintain calf/Achilles strength and gradual running progression to reduce reinjury.',
  frequency: '2 sessions per week',
  exercises: ['calf_single_raise', 'calf_bent_knee_raise'],
  preventionNotes: ['Keep heavy single-leg calf work weekly.', 'Increase running volume by ~10% per week at most.', 'Reintroduce hills and speed separately.']
};

const calfAchillesShin = {
  id: 'calf_shin',
  name: 'Calf / Achilles / shin',
  shortDescription:
    'Lower-leg injuries spanning calf strains, Achilles tendinopathy and rupture concern, shin splints, bone-stress and compartment warning patterns.',
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

export default calfAchillesShin;
