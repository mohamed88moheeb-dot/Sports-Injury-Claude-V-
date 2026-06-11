/**
 * ankle.js
 * ---------------------------------------------------------------------------
 * Knowledge model for ankle injuries.
 * Same structure and rule format as hamstring.js.
 *
 * NOTE on the Ottawa-style guidance: we surface a fracture-screening prompt as
 * guidance for when to seek imaging/medical review. We never claim to apply a
 * formal clinical decision rule or to confirm/exclude a fracture.
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
  { id: 'lateral_ankle_sprain', name: 'Lateral ankle sprain', riskLevel: 'moderate', rehabPathway: 'lateral_sprain', note: 'The most common ankle sprain (outside of the ankle).' },
  { id: 'high_ankle_sprain_suspicion', name: 'High ankle (syndesmosis) sprain suspicion', riskLevel: 'refer', rehabPathway: 'high_ankle', note: 'Pain above the ankle joint; slower, cautious pathway.' },
  { id: 'medial_ankle_sprain', name: 'Medial ankle sprain', riskLevel: 'moderate', rehabPathway: 'medial_sprain', note: 'Inner ankle ligament injury; treat with more caution.' },
  { id: 'peroneal_tendon_irritation', name: 'Peroneal tendon irritation', riskLevel: 'low', rehabPathway: 'tendon_irritation', note: 'Pain behind/below the outer ankle bone.' },
  { id: 'posterior_tibial_tendon_irritation', name: 'Posterior tibial tendon irritation', riskLevel: 'low', rehabPathway: 'tendon_irritation', note: 'Pain behind the inner ankle bone / arch.' },
  { id: 'achilles_insertion_pain', name: 'Achilles insertion pain', riskLevel: 'low', rehabPathway: 'tendon_irritation', note: 'Pain at the back of the heel where the Achilles attaches.' },
  { id: 'ankle_fracture_suspicion', name: 'Possible ankle fracture', riskLevel: 'refer', rehabPathway: 'fracture_referral', note: 'Bony tenderness / cannot weight-bear; needs review/imaging.' },
  { id: 'anterior_ankle_impingement_irritation', name: 'Anterior ankle impingement irritation', riskLevel: 'low', rehabPathway: 'tendon_irritation', note: 'Pinching front-of-ankle pain at end-range dorsiflexion.' },
  { id: 'recurrent_ankle_instability', name: 'Recurrent ankle instability', riskLevel: 'moderate', rehabPathway: 'instability', note: 'Repeated sprains and a feeling of giving way.' }
];

const anatomyRegions = ['ankle'];

const detailedAreas = [
  { id: 'front_ankle', name: 'Front of the ankle' },
  { id: 'lateral_ankle', name: 'Outer ankle' },
  { id: 'medial_ankle', name: 'Inner ankle' },
  { id: 'high_ankle_syndesmosis_area', name: 'High ankle (above the joint)' },
  { id: 'achilles_region', name: 'Back of the heel / Achilles insertion' },
  { id: 'peroneal_tendon_area', name: 'Behind/below the outer ankle bone' },
  { id: 'posterior_tibial_tendon_area', name: 'Behind the inner ankle bone' },
  { id: 'anterior_ankle', name: 'Anterior ankle joint line' },
  { id: 'ankle_joint_line', name: 'Ankle joint line' },
  { id: 'foot', name: 'Foot' }
];

const assessmentQuestions = [
  makeQuestion('mechanism', 'How did it happen?', 'single', {
    category: 'mechanism',
    options: [
      { value: 'inversion', label: 'Rolled inward (inversion)' },
      { value: 'eversion', label: 'Rolled outward (eversion)' },
      { value: 'external_rotation', label: 'Twisted with the foot planted (rotation)' },
      { value: 'gradual', label: 'Gradually, no single event' }
    ]
  }),
  makeQuestion('immediate_swelling', 'Did it swell quickly?', 'boolean', { category: 'symptom' }),
  makeQuestion('bruising', 'Any bruising?', 'boolean', { category: 'symptom' }),
  makeQuestion('weight_bearing', 'Can you bear weight / take four steps?', 'single', {
    category: 'function',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'painful', label: 'Only painfully' },
      { value: 'no', label: 'No' }
    ],
    redFlagTrigger: { value: 'no', severity: 'urgent' }
  }),
  makeQuestion('bone_pain', 'Is there pain directly on the ankle bones when pressed?', 'boolean', {
    category: 'red_flag',
    redFlagTrigger: { value: true, severity: 'caution' }
  }),
  makeQuestion('instability', 'Does the ankle feel unstable or like it gives way?', 'boolean', { category: 'symptom' }),
  makeQuestion('recurrent', 'Have you sprained this ankle several times before?', 'boolean', { category: 'history' }),
  makeQuestion('dorsiflexion_pain', 'Pain when pulling the foot up / squatting deep?', 'boolean', { category: 'symptom' }),
  makeQuestion('pushoff_pain', 'Pain pushing off the foot?', 'boolean', { category: 'symptom' }),
  makeQuestion('behind_outer_ankle_pain', 'Pain specifically behind the outer ankle bone?', 'boolean', { category: 'symptom' }),
  makeQuestion('high_ankle_pain', 'Pain ABOVE the ankle joint, not on the bone tip?', 'boolean', { category: 'symptom' })
];

const selfTests = [
  makeSelfTest('weight_bearing_screen', 'Weight-bearing ability', { purpose: 'Screens load tolerance and fracture risk guidance.', howTo: ['Carefully try to take four steps.'], whatPositiveSuggests: 'Inability to take four steps (then or now) is a reason to seek medical review/imaging.', whatItDoesNotProve: 'Being able to walk does not exclude a significant sprain.', resultOptions: [{ value: 'able', label: 'Able to take four steps' }, { value: 'painful', label: 'Only painfully' }, { value: 'unable', label: 'Unable' }] }),
  makeSelfTest('ankle_range_screen', 'Ankle range screen', { purpose: 'Compares movement side to side.', howTo: ['Gently point and pull the foot up/down and in/out.'], whatPositiveSuggests: 'Marked loss or sharp pain reflects an active injury.', whatItDoesNotProve: 'Does not localize the structure.' }),
  makeSelfTest('single_leg_balance', 'Single-leg balance', { purpose: 'Screens stability and control.', howTo: ['Balance on the injured leg if safe.'], whatPositiveSuggests: 'Poor balance / giving way suggests control deficits or instability.', whatItDoesNotProve: 'Not a graded test.', doNotPerformIf: ['Cannot bear weight', 'Severe pain'] }),
  makeSelfTest('heel_raise_tolerance', 'Heel-raise tolerance', { purpose: 'Calf/ankle load screen.', howTo: ['Rise onto the toes (two legs, then one if able).'], whatPositiveSuggests: 'Pain/weakness reflects tendon or load involvement.', whatItDoesNotProve: 'Does not confirm a specific tendon.', doNotPerformIf: ['Cannot bear weight'] }),
  makeSelfTest('gentle_calf_raise', 'Gentle calf raise', { purpose: 'Lower-demand calf/ankle screen.', howTo: ['Supported double-leg calf raise.'], whatPositiveSuggests: 'Pain reflects load sensitivity.', whatItDoesNotProve: 'Does not localize.' }),
  makeSelfTest('hop_test_when_safe', 'Hop test (only when safe)', { purpose: 'Higher-level impact screen.', howTo: ['Only if balance and heel raises are pain-free: a few small hops.'], whatPositiveSuggests: 'Pain/instability reflects limited readiness.', whatItDoesNotProve: 'Does not confirm sport readiness.', doNotPerformIf: ['Cannot bear weight', 'Bone pain', 'Significant swelling'] }),
  makeSelfTest('high_ankle_screen', 'High ankle symptom screen', { purpose: 'Cautiously screens for syndesmosis involvement.', howTo: ['Note pain ABOVE the joint with twisting or when pulling the foot up.'], whatPositiveSuggests: 'Pain above the joint can indicate a high ankle sprain, which needs a more cautious pathway and often review.', whatItDoesNotProve: 'A screen only.' }),
  makeSelfTest('bone_tenderness_screen', 'Bone tenderness screen (medical-review trigger)', { purpose: 'Guidance on when to seek imaging/review.', howTo: ['Gently press the bony points at the back/tip of the ankle bones and the foot.'], whatPositiveSuggests: 'Pinpoint bone tenderness — especially with inability to weight-bear — is a reason to seek medical review and possible imaging.', whatItDoesNotProve: 'This is guidance, not a formal fracture rule, and cannot confirm or exclude a fracture.', capturesPain: true })
];

const redFlags = [
  {
    id: 'ankle_fracture_guidance',
    triggerAnswers: [
      { questionId: 'weight_bearing', value: 'no' },
      { questionId: 'bone_pain', value: true }
    ],
    requireCount: 1,
    severity: 'urgent',
    message:
      'Inability to bear weight (four steps) or pinpoint pain on the ankle bones is a reason to seek medical review and possible imaging before loading. This is guidance only, not a formal fracture rule.'
  },
  {
    id: 'high_ankle_caution',
    triggerAnswers: [
      { questionId: 'high_ankle_pain', value: true },
      { questionId: 'mechanism', value: 'external_rotation' }
    ],
    requireCount: 1,
    severity: 'caution',
    message:
      'Pain above the ankle joint or a twisting/rotation mechanism can indicate a high ankle (syndesmosis) sprain, which usually needs a slower, more cautious pathway and a clinical review.'
  }
];

const diagnosisRules = [
  {
    subtypeId: 'lateral_ankle_sprain',
    conditions: [
      { type: 'area', value: ['lateral_ankle'], points: 28, reason: 'Pain is over the outer ankle.' },
      { type: 'answer', questionId: 'mechanism', value: 'inversion', points: 24, reason: 'Classic inward-roll (inversion) mechanism.' },
      { type: 'answer', questionId: 'immediate_swelling', value: true, points: 8, reason: 'Quick swelling fits an acute sprain.' },
      { type: 'answer', questionId: 'high_ankle_pain', value: true, points: -12, reason: 'Pain above the joint points more to a high ankle sprain.' },
      { type: 'answer', questionId: 'mechanism', value: 'eversion', points: -10, reason: 'Outward-roll points more to a medial injury.' }
    ]
  },
  {
    subtypeId: 'high_ankle_sprain_suspicion',
    conditions: [
      { type: 'area', value: ['high_ankle_syndesmosis_area'], points: 26, reason: 'Pain is above the ankle joint.' },
      { type: 'answer', questionId: 'high_ankle_pain', value: true, points: 22, reason: 'Pain reported above the joint line.' },
      { type: 'answer', questionId: 'mechanism', value: 'external_rotation', points: 20, reason: 'Rotation/external-rotation mechanism.' },
      { type: 'selfTest', testId: 'high_ankle_screen', result: 'painful', points: 14, reason: 'High ankle screen reproduced pain above the joint.' }
    ]
  },
  {
    subtypeId: 'medial_ankle_sprain',
    conditions: [
      { type: 'area', value: ['medial_ankle'], points: 28, reason: 'Pain is over the inner ankle.' },
      { type: 'answer', questionId: 'mechanism', value: 'eversion', points: 22, reason: 'Outward-roll (eversion) mechanism.' }
    ]
  },
  {
    subtypeId: 'peroneal_tendon_irritation',
    conditions: [
      { type: 'area', value: ['peroneal_tendon_area'], points: 26, reason: 'Pain behind/below the outer ankle bone.' },
      { type: 'answer', questionId: 'behind_outer_ankle_pain', value: true, points: 20, reason: 'Pain specifically behind the outer ankle bone.' },
      { type: 'answer', questionId: 'pushoff_pain', value: true, points: 8, reason: 'Pain pushing off can load the peroneals.' }
    ]
  },
  {
    subtypeId: 'posterior_tibial_tendon_irritation',
    conditions: [
      { type: 'area', value: ['posterior_tibial_tendon_area'], points: 26, reason: 'Pain behind the inner ankle bone / arch.' },
      { type: 'answer', questionId: 'pushoff_pain', value: true, points: 10, reason: 'Push-off can load the posterior tibial tendon.' }
    ]
  },
  {
    subtypeId: 'achilles_insertion_pain',
    conditions: [
      { type: 'area', value: ['achilles_region'], points: 28, reason: 'Pain at the back of the heel / Achilles insertion.' },
      { type: 'answer', questionId: 'pushoff_pain', value: true, points: 8, reason: 'Push-off loads the Achilles insertion.' }
    ]
  },
  {
    subtypeId: 'ankle_fracture_suspicion',
    conditions: [
      { type: 'answer', questionId: 'bone_pain', value: true, points: 26, reason: 'Pinpoint pain on the ankle bones.' },
      { type: 'answer', questionId: 'weight_bearing', value: 'no', points: 24, reason: 'Unable to bear weight.' },
      { type: 'answer', questionId: 'immediate_swelling', value: true, points: 6, reason: 'Rapid swelling.' }
    ]
  },
  {
    subtypeId: 'anterior_ankle_impingement_irritation',
    conditions: [
      { type: 'area', value: ['anterior_ankle', 'front_ankle', 'ankle_joint_line'], points: 24, reason: 'Pain at the front of the ankle joint.' },
      { type: 'answer', questionId: 'dorsiflexion_pain', value: true, points: 20, reason: 'Pinching pain pulling the foot up / squatting deep.' }
    ]
  },
  {
    subtypeId: 'recurrent_ankle_instability',
    conditions: [
      { type: 'answer', questionId: 'recurrent', value: true, points: 24, reason: 'History of repeated sprains.' },
      { type: 'answer', questionId: 'instability', value: true, points: 22, reason: 'Feeling of giving way.' },
      { type: 'selfTest', testId: 'single_leg_balance', result: 'painful', points: 8, reason: 'Poor single-leg balance/control.' }
    ]
  }
];

const exerciseLibrary = [
  makeExercise('ank_alphabet', 'Ankle alphabet', { targetRegion: 'ankle', phase: 'protect', difficulty: 1, equipment: ['bodyweight'], purpose: 'Restore gentle range without forcing swelling.', prescription: '2 rounds', cues: ['Move slowly', 'No forcing'], commonMistakes: ['Big painful ranges early'], easierAlternative: 'Ankle pumps', harderProgression: 'ank_banded_4way', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Same exercise', painRule: PAIN_RULES.loading }),
  makeExercise('ank_iso_4way', 'Isometric ankle four-way', { targetRegion: 'ankle', phase: 'protect', difficulty: 1, equipment: ['wall'], purpose: 'Gentle isometric loading in all directions.', prescription: '4 x 15 sec each', cues: ['Gentle pressure'], commonMistakes: ['Pushing too hard'], easierAlternative: 'Two-way (up/down) only', harderProgression: 'ank_banded_4way', noEquipmentAlternative: 'Press against the other foot', gymAlternative: 'Same exercise', painRule: PAIN_RULES.isometric }),
  makeExercise('ank_banded_4way', 'Banded ankle four-way', { targetRegion: 'ankle', phase: 'restore', difficulty: 2, equipment: ['band'], purpose: 'Dynamic ankle strengthening.', prescription: '3 x 12 each', cues: ['Slow control, full pain-free range'], commonMistakes: ['Using the whole leg'], easierAlternative: 'ank_iso_4way', harderProgression: 'ank_single_calf', noEquipmentAlternative: 'Isometric four-way', gymAlternative: 'Cable ankle work', painRule: PAIN_RULES.loading }),
  makeExercise('ank_balance', 'Single-leg balance', { targetRegion: 'ankle', phase: 'restore', difficulty: 2, equipment: ['bodyweight'], purpose: 'Rebuild proprioception/control.', prescription: '3 x 20 sec/side', cues: ['Use support as needed'], commonMistakes: ['Holding the breath / rigid posture'], easierAlternative: 'Tandem stance', harderProgression: 'ank_star_reach', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Balance pad', painRule: PAIN_RULES.loading }),
  makeExercise('ank_single_calf', 'Single-leg calf raise', { targetRegion: 'ankle', phase: 'capacity', difficulty: 3, equipment: ['bodyweight', 'dumbbells'], purpose: 'Build calf/ankle strength.', prescription: '4 x 6–8', cues: ['Full height', 'Slow lower'], commonMistakes: ['Partial range'], easierAlternative: 'Two-up one-down', harderProgression: 'ank_hop', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Loaded calf raise', painRule: PAIN_RULES.loading }),
  makeExercise('ank_star_reach', 'Star-reach balance', { targetRegion: 'ankle', phase: 'capacity', difficulty: 3, equipment: ['bodyweight'], purpose: 'Dynamic single-leg control.', prescription: '3 x 4 reaches/side', cues: ['Reach without collapsing the arch'], commonMistakes: ['Letting the knee cave'], easierAlternative: 'ank_balance', harderProgression: 'ank_hop', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Same exercise', painRule: PAIN_RULES.loading }),
  makeExercise('ank_hop', 'Jump-and-stick landing', { targetRegion: 'ankle', phase: 'speed', difficulty: 4, equipment: ['bodyweight'], purpose: 'Reintroduce impact and landing control.', prescription: '3 x 5', cues: ['Land quietly', 'Hold the landing two seconds'], commonMistakes: ['Wobbly landings'], easierAlternative: 'Calf-raise hold', harderProgression: 'ank_agility', noEquipmentAlternative: 'Same exercise', gymAlternative: 'Same exercise', avoidIf: ['Cannot balance pain-free', 'Bone pain'], painRule: PAIN_RULES.impact }),
  makeExercise('ank_agility', 'Sport agility circuit', { targetRegion: 'ankle', phase: 'return', difficulty: 5, equipment: ['cones'], purpose: 'Restore cutting/agility tolerance.', prescription: '5 x 30 sec', cues: ['Shuffle, decelerate, turn, accelerate'], commonMistakes: ['Max speed on day one'], easierAlternative: 'Planned low-speed footwork', harderProgression: 'Reactive agility', noEquipmentAlternative: 'Use landmarks', gymAlternative: 'Same exercise', painRule: PAIN_RULES.impact })
];

const rehabProtocols = [
  makeProtocol('lateral_sprain', {
    name: 'Lateral ankle sprain pathway',
    summary: 'Restore range, balance, and strength, then impact and agility.',
    appliesToSubtypes: ['lateral_ankle_sprain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and move', goal: 'Settle swelling and restore gentle range.', estimatedDuration: '2–5 days', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.earlyStrain, avoid: ['Cutting', 'Jumping', 'Uneven ground'], progressionCriteria: ['Comfortable weight-bearing'], regressionCriteria: ['Swelling/pain rising'], exercises: ['ank_alphabet', 'ank_iso_4way'] }),
      makePhase('restore', { name: 'Phase 2 – Range, balance, strength', goal: 'Rebuild control and strength.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Impact'], progressionCriteria: ['Good single-leg balance'], regressionCriteria: ['Next-day swelling'], exercises: ['ank_banded_4way', 'ank_balance'] }),
      makePhase('capacity', { name: 'Phase 3 – Build capacity', goal: 'Strength and dynamic control.', estimatedDuration: '1–3 weeks', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.loading, avoid: ['Returning to sport before balance/strength solid'], progressionCriteria: ['Single-leg calf raise and star reach solid'], regressionCriteria: ['Instability with load'], exercises: ['ank_single_calf', 'ank_star_reach'] }),
      makePhase('speed', { name: 'Phase 4 – Impact and landing', goal: 'Reintroduce hopping/landing.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.impact, avoid: ['Cutting before landings are stable'], progressionCriteria: ['Stable jump-and-stick'], regressionCriteria: ['Giving way / pain'], exercises: ['ank_hop'] }),
      makePhase('return', { name: 'Phase 5 – Return to sport', goal: 'Restore agility and confidence.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 7–8', painRules: PAIN_RULES.impact, avoid: ['Max reactive agility on day one'], progressionCriteria: ['Agility circuit calm'], regressionCriteria: ['Instability returns'], exercises: ['ank_agility'] })
    ]
  }),
  makeProtocol('high_ankle', {
    name: 'High ankle (syndesmosis) cautious pathway',
    summary: 'Slower progression; recommend review. Protect rotation/dorsiflexion early.',
    appliesToSubtypes: ['high_ankle_sprain_suspicion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and review', goal: 'Settle symptoms and arrange a review.', estimatedDuration: '1–3 weeks', intensityGuidance: 'Gentle', painRules: PAIN_RULES.earlyStrain, avoid: ['Twisting/rotation', 'End-range dorsiflexion', 'Push-off loading', 'Impact'], progressionCriteria: ['Pain settling; reviewed if not improving'], regressionCriteria: ['Pain above joint increasing'], exercises: ['ank_alphabet', 'ank_iso_4way'] }),
      makePhase('restore', { name: 'Phase 2 – Gradual strength', goal: 'Rebuild strength avoiding rotation stress.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Cutting', 'Aggressive dorsiflexion'], progressionCriteria: ['Calf raises and balance calm'], regressionCriteria: ['Symptoms recur'], exercises: ['ank_banded_4way', 'ank_balance', 'ank_single_calf'] }),
      makePhase('return', { name: 'Phase 3 – Return (slow)', goal: 'Reintroduce impact/agility slowly.', estimatedDuration: 'Variable (often longer than lateral)', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Rushing cutting'], progressionCriteria: ['Hopping then agility calm'], regressionCriteria: ['High-ankle pain returns'], exercises: ['ank_hop', 'ank_agility'] })
    ]
  }),
  makeProtocol('medial_sprain', {
    name: 'Medial ankle sprain pathway (cautious)',
    summary: 'Similar to lateral but with more caution.',
    appliesToSubtypes: ['medial_ankle_sprain'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and move', goal: 'Settle and restore gentle range.', estimatedDuration: '3–7 days', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.earlyStrain, avoid: ['Eversion stress', 'Impact'], progressionCriteria: ['Comfortable weight-bearing'], regressionCriteria: ['Swelling rising'], exercises: ['ank_alphabet', 'ank_iso_4way'] }),
      makePhase('restore', { name: 'Phase 2 – Strength and control', goal: 'Rebuild control and strength.', estimatedDuration: '1–3 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Impact'], progressionCriteria: ['Balance and strength solid'], regressionCriteria: ['Symptoms recur'], exercises: ['ank_banded_4way', 'ank_balance', 'ank_single_calf'] }),
      makePhase('return', { name: 'Phase 3 – Return', goal: 'Reintroduce impact/agility.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Rushing cutting'], progressionCriteria: ['Agility calm'], regressionCriteria: ['Instability'], exercises: ['ank_hop', 'ank_agility'] })
    ]
  }),
  makeProtocol('tendon_irritation', {
    name: 'Ankle tendon / impingement irritation pathway',
    summary: 'Load-manage and progressively strengthen the involved tendon.',
    appliesToSubtypes: ['peroneal_tendon_irritation', 'posterior_tibial_tendon_irritation', 'achilles_insertion_pain', 'anterior_ankle_impingement_irritation'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Settle', goal: 'Reduce aggravating load.', estimatedDuration: '1–2 weeks', intensityGuidance: 'RPE 2–4', painRules: PAIN_RULES.isometric, avoid: ['Provocative end-range positions', 'Sudden load spikes'], progressionCriteria: ['Symptoms easing'], regressionCriteria: ['Pain climbing'], exercises: ['ank_iso_4way'] }),
      makePhase('capacity', { name: 'Phase 2 – Strengthen', goal: 'Build tendon capacity.', estimatedDuration: '3–6 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.tendon, avoid: ['Pain climbing across sessions'], progressionCriteria: ['Strength tolerated'], regressionCriteria: ['Symptoms rising'], exercises: ['ank_banded_4way', 'ank_single_calf'] }),
      makePhase('return', { name: 'Phase 3 – Return', goal: 'Reintroduce impact/sport.', estimatedDuration: 'Variable', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Load spikes'], progressionCriteria: ['Impact calm'], regressionCriteria: ['Tendon pain returns'], exercises: ['ank_hop', 'ank_agility'] })
    ]
  }),
  makeProtocol('instability', {
    name: 'Recurrent instability pathway',
    summary: 'Heavy emphasis on balance, control, and strength to reduce re-sprains.',
    appliesToSubtypes: ['recurrent_ankle_instability'],
    phases: [
      makePhase('restore', { name: 'Phase 1 – Control and strength', goal: 'Rebuild proprioception and strength.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 4–6', painRules: PAIN_RULES.loading, avoid: ['Uneven ground early'], progressionCriteria: ['Solid single-leg balance'], regressionCriteria: ['Giving way'], exercises: ['ank_balance', 'ank_banded_4way', 'ank_single_calf'] }),
      makePhase('capacity', { name: 'Phase 2 – Dynamic control', goal: 'Dynamic single-leg control.', estimatedDuration: '2–4 weeks', intensityGuidance: 'RPE 5–7', painRules: PAIN_RULES.loading, avoid: ['Rushing agility'], progressionCriteria: ['Star reach and landings stable'], regressionCriteria: ['Instability'], exercises: ['ank_star_reach', 'ank_hop'] }),
      makePhase('return', { name: 'Phase 3 – Return + maintenance', goal: 'Restore agility; keep prevention work.', estimatedDuration: 'Ongoing', intensityGuidance: 'RPE 6–8', painRules: PAIN_RULES.impact, avoid: ['Dropping balance work after return'], progressionCriteria: ['Agility calm'], regressionCriteria: ['Re-sprain'], exercises: ['ank_agility'] })
    ]
  }),
  makeProtocol('fracture_referral', {
    name: 'Possible ankle fracture (review first)',
    summary: 'Seek medical review/imaging before loading.',
    appliesToSubtypes: ['ankle_fracture_suspicion'],
    phases: [
      makePhase('protect', { name: 'Phase 1 – Protect and seek review', goal: 'Avoid loading and arrange assessment/imaging.', estimatedDuration: 'Until reviewed', intensityGuidance: 'Do not load', painRules: 'Avoid weight-bearing if it is very painful.', avoid: ['Walking on it if avoidable', 'Strength testing', 'Impact'], progressionCriteria: ['Only after assessment/clearance'], regressionCriteria: ['Worsening — seek care sooner'], exercises: [] })
    ]
  })
];

const returnToSport = {
  genericLadder: ['Pain-free weight-bearing', 'Pain-free walking', 'Single-leg balance', 'Jog', 'Hopping / landing', 'Planned cutting', 'Reactive agility', 'Full training', 'Match return'],
  criteriaToReturn: ['Single-leg balance equal to the other side', 'Pain-free hopping and landing', 'Confident change of direction'],
  sportSpecific: {
    'Football / soccer': ['Add planned then reactive cutting; rehearse landing from headers.'],
    Basketball: ['Add jump-landing and decel before scrimmage.'],
    Running: ['Build jogging on flat, even ground first.']
  }
};

const maintenancePlan = {
  goal: 'Maintain balance and ankle strength to reduce re-sprain risk.',
  frequency: '2–3 short sessions per week',
  exercises: ['ank_balance', 'ank_single_calf', 'ank_star_reach'],
  preventionNotes: ['Keep balance/proprioception work after returning — it reduces re-sprain risk.', 'Consider a brace/tape for early return in high-risk sports.']
};

const ankle = {
  id: 'ankle',
  name: 'Ankle',
  shortDescription:
    'Ankle injuries spanning lateral/medial/high sprains, tendon irritations, impingement, instability, and fracture concern.',
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

export default ankle;
