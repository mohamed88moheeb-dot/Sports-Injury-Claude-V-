// Source for content/protocols/hamstring.json. Edit here, then `node content/protocols/build-hamstring.mjs`.
import { writeFileSync } from 'node:fs';

const ev = (level, ...facts) => ({ level, facts });

const exercises = [
  { id: 'walk', name: 'Brisk walk', category: 'conditioning', cues: ['Normal stride length, no limp.', 'Stop if the thigh tightens up.'], painRule: 'painFree', loads: [], evidence: ev('consensus', 'hs-010') },
  { id: 'bike', name: 'Easy bike', category: 'conditioning', cues: ['Low resistance, smooth circles.', 'Keep it conversational.'], equipment: ['bike'], painRule: 'painFree', evidence: ev('practitioner', 'hs-010') },
  { id: 'heel_dig_iso', name: 'Heel-dig isometric (knee 90°)', category: 'isometric', cues: ['Lie on your back, knee bent to 90°.', 'Dig the heel into the floor and hold.', 'Build to a strong effort that stays within 4/10 pain.'], loads: ['biceps_femoris_long', 'semitendinosus', 'semimembranosus'], painRule: 'threshold', evidence: ev('trial', 'hs-004', 'hs-013') },
  { id: 'bridge_iso', name: 'Bridge hold', category: 'isometric', cues: ['Heels on the floor, knees bent about 90°.', 'Lift your hips and hold them level.'], loads: ['biceps_femoris_long', 'gluteus_maximus'], painRule: 'threshold', evidence: ev('trial', 'hs-004', 'hs-013') },
  { id: 'extender', name: 'Askling Extender', category: 'lengthening', cues: ['Lie on your back and hold the thigh at 90° with both hands.', 'Slowly straighten the knee to the point of discomfort, not sharp pain.', 'Lower with control.'], loads: ['biceps_femoris_long', 'semitendinosus', 'semimembranosus'], painRule: 'threshold', evidence: ev('trial', 'hs-001', 'hs-002', 'hs-003') },
  { id: 'diver', name: 'Askling Diver', category: 'lengthening', cues: ['Stand on the injured leg with the knee soft.', 'Reach your arms forward as the trunk tips and the back leg lifts.', 'Hinge at the hip until your trunk is near parallel, then return.'], loads: ['biceps_femoris_long', 'semimembranosus', 'gluteus_maximus'], painRule: 'threshold', evidence: ev('trial', 'hs-001', 'hs-002') },
  { id: 'glider', name: 'Askling Glider', category: 'lengthening', cues: ['Weight on the front (injured) heel, front knee soft, hold a support.', 'Slide the back leg away until you feel a stretch.', 'Pull back using your arms, not the injured leg.'], equipment: ['slider or towel'], loads: ['biceps_femoris_long', 'semitendinosus'], painRule: 'threshold', evidence: ev('trial', 'hs-001', 'hs-002') },
  { id: 'bridge_double', name: 'Double-leg bridge', category: 'strength', cues: ['Drive through your heels.', 'Squeeze the glutes at the top.', 'Take 3 seconds to lower.'], loads: ['biceps_femoris_long', 'gluteus_maximus'], painRule: 'threshold', evidence: ev('practitioner', 'hs-013') },
  { id: 'bridge_single', name: 'Single-leg bridge (90°)', category: 'strength', regression: 'bridge_double', cues: ['Knee at 90°, other leg lifted.', 'Keep your hips level.', 'Take 3 seconds to lower.'], loads: ['biceps_femoris_long', 'gluteus_maximus'], painRule: 'threshold', evidence: ev('practitioner', 'hs-013') },
  { id: 'bridge_long', name: 'Long-lever single-leg bridge', category: 'strength', regression: 'bridge_single', cues: ['Heel far away, knee only slightly bent (about 20–30°).', 'Lift your hips, pause, and lower slowly.'], loads: ['biceps_femoris_long', 'semitendinosus', 'semimembranosus'], painRule: 'threshold', evidence: ev('trial', 'hs-006') },
  { id: 'rdl', name: 'Romanian deadlift', category: 'strength', regression: 'diver', cues: ['Soft knees, flat back.', 'Push your hips back until you feel a strong stretch.', 'Take 3 seconds down and 1 second up.'], equipment: ['dumbbells or barbell'], loads: ['biceps_femoris_long', 'semimembranosus', 'gluteus_maximus'], painRule: 'threshold', evidence: ev('trial', 'hs-006', 'hs-001') },
  { id: 'slider_curl', name: 'Eccentric slider curl', category: 'strength', regression: 'bridge_long', cues: ['Bridge up with your heels on sliders.', 'Slide your heels away slowly, over 4 seconds, keeping the hips up.', 'Reset with your hips down.'], equipment: ['sliders or towel'], loads: ['biceps_femoris_long', 'semitendinosus'], painRule: 'threshold', evidence: ev('trial', 'hs-006') },
  { id: 'nordic_partial', name: 'Nordic curl (partial range)', category: 'strength', regression: 'slider_curl', cues: ['Anchor your heels, body straight from knees to head.', 'Lower slowly only as far as you can control, then push back up with your hands.'], equipment: ['anchor or partner'], loads: ['biceps_femoris_long', 'semitendinosus'], painRule: 'threshold', evidence: ev('practitioner', 'hs-006', 'hs-010') },
  { id: 'nordic_full', name: 'Nordic curl (full range)', category: 'strength', regression: 'nordic_partial', cues: ['Lower as slowly as possible all the way to the floor.', 'Catch yourself with your hands and push back up.'], equipment: ['anchor or partner'], loads: ['biceps_femoris_long', 'semitendinosus'], painRule: 'threshold', evidence: ev('practitioner', 'hs-006', 'hs-010') },
  { id: 'side_plank', name: 'Side plank', category: 'trunk', cues: ['Keep a straight line from head to feet.', 'Don\'t let your hips sag.'], loads: [], painRule: 'painFree', evidence: ev('trial', 'hs-016') },
  { id: 'shuffle', name: 'Lateral shuffle and grapevine', category: 'trunk', cues: ['Stay low with quick, light feet.', 'Start at a moderate speed.'], loads: [], painRule: 'painFree', evidence: ev('trial', 'hs-016') },
  { id: 'run_50', name: 'Tempo runs at 50% speed', category: 'running', cues: ['Relaxed jog, well below full effort.', 'It must be completely pain-free. Stop at the first twinge.'], loads: ['biceps_femoris_long'], painRule: 'painFree', evidence: ev('practitioner', 'hs-014', 'hs-010') },
  { id: 'run_70', name: 'Strides at 70% speed', category: 'running', regression: 'run_50', cues: ['Build up over 20 m, hold for 30 m, then ease off.', 'Pain-free only.'], loads: ['biceps_femoris_long'], painRule: 'painFree', evidence: ev('practitioner', 'hs-014', 'hs-010') },
  { id: 'run_90', name: 'Fast strides at 80–90% speed', category: 'running', regression: 'run_70', cues: ['Take a long build-up, stay tall and relaxed.', 'Walk back between reps for full recovery.'], loads: ['biceps_femoris_long'], painRule: 'painFree', evidence: ev('practitioner', 'hs-014', 'hs-015') },
  { id: 'sprint', name: 'Max-velocity sprints (≥95%)', category: 'running', regression: 'run_90', cues: ['Take a 30 m build-up, then hold top speed for 10–20 m.', 'Rest fully (2–3 min) between sprints.'], loads: ['biceps_femoris_long'], painRule: 'painFree', evidence: ev('practitioner', 'hs-015', 'hs-010') },
  { id: 'a_skip', name: 'A-skips and fast leg swings', category: 'plyometric', cues: ['Quick ground contacts.', 'Pull the foot down and back under your hips.'], loads: ['biceps_femoris_long'], painRule: 'painFree', evidence: ev('practitioner', 'hs-017') },
];

const tests = [
  { id: 'gait', name: 'Normal walking', measure: 'boolean', instructions: ['Walk 50 m at a brisk pace.', 'Yes = no limp and no pain.'], evidence: ev('practitioner', 'hs-014') },
  { id: 'bridge_90_sym', name: 'Single-leg bridge reps (90°), injured vs uninjured', measure: 'percent', unit: '%', instructions: ['Do as many single-leg bridges as you can on each leg, to a steady beat of 1 rep every 2 seconds.', 'Stop at pain above 4/10 or when your form breaks.', 'Enter injured reps ÷ uninjured reps × 100.'], evidence: ev('practitioner', 'hs-013', 'hs-012') },
  { id: 'bridge_long_sym', name: 'Long-lever bridge reps, injured vs uninjured', measure: 'percent', unit: '%', instructions: ['Same test as above, but with the knee only slightly bent (about 20–30°).', 'Enter injured reps ÷ uninjured reps × 100.'], evidence: ev('trial', 'hs-006') },
  { id: 'aslr_sym', name: 'Active straight-leg raise, injured vs uninjured', measure: 'percent', unit: '%', instructions: ['Lie on your back and lift the straight leg as high as you can without help.', 'Film it from the side, or estimate the angle against a door frame.', 'Enter injured angle ÷ uninjured angle × 100.'], evidence: ev('consensus', 'hs-012', 'hs-011') },
  { id: 'stretch_pain', name: 'Pain in a fast-kick stretch (H-test style)', measure: 'pain', unit: '/10', instructions: ['Stand holding a support. Swing the straight leg up quickly, as high as feels safe, 3 times.', 'Score the worst discomfort out of 10.'], evidence: ev('trial', 'hs-009') },
  { id: 'palpation', name: 'Pain when pressing the injured spot', measure: 'pain', unit: '/10', instructions: ['Press firmly with two fingers where it was most tender.', 'Score out of 10.'], evidence: ev('consensus', 'hs-011') },
  { id: 'run_pain', name: 'Pain during this stage\'s target-speed running', measure: 'pain', unit: '/10', instructions: ['Warm up, then do 3 reps at this stage\'s target running speed.', 'Score the worst pain. Any pain above 0 means stop.'], evidence: ev('consensus', 'hs-010', 'hs-014') },
  { id: 'sprint_pct', name: 'Top speed vs pre-injury', measure: 'percent', unit: '%', instructions: ['Time a flying 20 m (with a 30 m build-up) using a phone app or a partner.', 'Enter your pre-injury time ÷ today\'s time × 100 (or use the GPS speed ratio).'], evidence: ev('practitioner', 'hs-015') },
  { id: 'full_training', name: 'Completed a full team or sport training session', measure: 'boolean', instructions: ['A full, unrestricted session, with no pain during it or the next morning.'], evidence: ev('consensus', 'hs-011', 'hs-015') },
  { id: 'readiness', name: 'Confidence to return (0–10)', measure: 'count', unit: '/10', instructions: ['How confident are you to sprint and compete flat out?'], evidence: ev('consensus', 'hs-011', 'hs-012') },
];

const P = { strength: 'hs-004', consensus: 'hs-010' };
const gate = (test, op, value, level, facts, extra = {}) => ({ test, op, value, evidence: { level, facts }, ...extra });

const stages = [
  {
    id: 'protect', name: 'Stage 1 · Calm & activate', goal: 'Settle pain, restore normal walking, and start loading the muscle early, within limits.',
    pattern: ['lengthening', 'strength', 'lengthening', 'recovery'], minDays: 3, evidence: ev('trial', 'hs-003', 'hs-004'),
    sessions: {
      lengthening: [
        { exercise: 'extender', dose: { sets: 3, reps: 12, intensity: 'to discomfort, not pain', note: 'Do this twice today (morning and evening).' } },
        { exercise: 'heel_dig_iso', dose: { sets: 5, seconds: 20, intensity: 'effort within 4/10 pain', restSeconds: 40 } },
        { exercise: 'walk', dose: { sets: 1, seconds: 900 } },
      ],
      strength: [
        { exercise: 'heel_dig_iso', dose: { sets: 5, seconds: 30, intensity: 'effort within 4/10 pain', restSeconds: 45 } },
        { exercise: 'bridge_iso', dose: { sets: 4, seconds: 30, restSeconds: 45 } },
        { exercise: 'extender', dose: { sets: 3, reps: 12, intensity: 'to discomfort, not pain', note: 'Twice today.' } },
        { exercise: 'side_plank', dose: { sets: 3, seconds: 20 } },
      ],
      recovery: [
        { exercise: 'extender', dose: { sets: 3, reps: 12, note: 'Twice today.' } },
        { exercise: 'walk', dose: { sets: 1, seconds: 1200 } },
      ],
    },
    gates: [
      gate('gait', '==', true, 'practitioner', ['hs-014']),
      gate('bridge_90_sym', '>=', 70, 'practitioner', ['hs-013']),
    ],
  },
  {
    id: 'lengthen', name: 'Stage 2 · Lengthen & jog', goal: 'The full Askling lengthening programme, trunk control, and pain-free jogging.',
    pattern: ['lengthening', 'strength', 'running', 'lengthening', 'strength', 'running', 'rest'], minDays: 5, evidence: ev('trial', 'hs-001', 'hs-016'),
    sessions: {
      lengthening: [
        { exercise: 'extender', dose: { sets: 3, reps: 12, note: 'Twice today.' } },
        { exercise: 'diver', dose: { sets: 3, reps: 6 } },
        { exercise: 'glider', dose: { sets: 3, reps: 4 } },
        { exercise: 'shuffle', dose: { sets: 3, metres: 20 } },
      ],
      strength: [
        { exercise: 'bridge_single', dose: { sets: 3, reps: 10, intensity: 'slow down' } },
        { exercise: 'heel_dig_iso', dose: { sets: 3, seconds: 30, intensity: 'hard effort' } },
        { exercise: 'extender', dose: { sets: 3, reps: 12 } },
        { exercise: 'side_plank', dose: { sets: 3, seconds: 30 } },
      ],
      running: [
        { exercise: 'run_50', dose: { sets: 6, metres: 60, intensity: '50% max speed', restSeconds: 60, note: 'Walk 20 m between reps.' } },
        { exercise: 'shuffle', dose: { sets: 3, metres: 20 } },
        { exercise: 'extender', dose: { sets: 3, reps: 12 } },
      ],
    },
    gates: [
      gate('aslr_sym', '>=', 80, 'consensus', ['hs-012']),
      gate('stretch_pain', '<=', 2, 'trial', ['hs-009']),
      gate('run_pain', '==', 0, 'consensus', ['hs-010'], { regressIf: { op: '>=', value: 4 } }),
    ],
  },
  {
    id: 'strength_length', name: 'Stage 3 · Strength at length', goal: 'Heavy, slow work at long muscle lengths, and running up to 70%.',
    pattern: ['strength', 'running', 'lengthening', 'strength', 'running', 'recovery', 'rest'], minDays: 5, evidence: ev('trial', 'hs-006', 'hs-001'),
    sessions: {
      strength: [
        { exercise: 'rdl', dose: { sets: 3, reps: 8, intensity: 'RPE 7, 3 s lowering' } },
        { exercise: 'bridge_long', dose: { sets: 3, reps: 10 } },
        { exercise: 'slider_curl', dose: { sets: 3, reps: 6 } },
        { exercise: 'nordic_partial', dose: { sets: 2, reps: 4, intensity: 'only the range you control' } },
      ],
      running: [
        { exercise: 'run_50', dose: { sets: 2, metres: 60, note: 'Warm-up.' } },
        { exercise: 'run_70', dose: { sets: 6, metres: 50, intensity: '70% max speed', restSeconds: 90 } },
        { exercise: 'a_skip', dose: { sets: 3, metres: 20 } },
      ],
      lengthening: [
        { exercise: 'diver', dose: { sets: 3, reps: 6 } },
        { exercise: 'glider', dose: { sets: 3, reps: 4 } },
        { exercise: 'shuffle', dose: { sets: 3, metres: 20 } },
      ],
      recovery: [{ exercise: 'bike', dose: { sets: 1, seconds: 1200 } }, { exercise: 'extender', dose: { sets: 2, reps: 12 } }],
    },
    gates: [
      gate('bridge_long_sym', '>=', 80, 'trial', ['hs-006'], { regressIf: { op: '<=', value: 50 } }),
      gate('bridge_long_sym', '>=', 90, 'consensus', ['hs-007'], { when: { track: ['tendon'] } }),
      gate('run_pain', '==', 0, 'consensus', ['hs-010'], { regressIf: { op: '>=', value: 4 } }),
    ],
  },
  {
    id: 'speed', name: 'Stage 4 · Speed', goal: 'Fast eccentric strength, the full Nordic, and running at 80–90%.',
    pattern: ['strength', 'running', 'recovery', 'running', 'strength', 'rest', 'rest'], minDays: 5, evidence: ev('practitioner', 'hs-014', 'hs-017'),
    sessions: {
      strength: [
        { exercise: 'nordic_full', dose: { sets: 3, reps: 5 } },
        { exercise: 'rdl', dose: { sets: 3, reps: 6, intensity: 'RPE 8' } },
        { exercise: 'bridge_long', dose: { sets: 3, reps: 12, intensity: 'explosive up, slow down' } },
      ],
      running: [
        { exercise: 'a_skip', dose: { sets: 3, metres: 20 } },
        { exercise: 'run_70', dose: { sets: 3, metres: 50, note: 'Warm-up.' } },
        { exercise: 'run_90', dose: { sets: 6, metres: 40, intensity: '80–90% max speed', restSeconds: 120 } },
      ],
      recovery: [{ exercise: 'bike', dose: { sets: 1, seconds: 1200 } }, { exercise: 'diver', dose: { sets: 2, reps: 6 } }],
    },
    gates: [
      gate('bridge_long_sym', '>=', 90, 'consensus', ['hs-011', 'hs-006']),
      gate('bridge_90_sym', '>=', 90, 'consensus', ['hs-011']),
      gate('run_pain', '==', 0, 'consensus', ['hs-010'], { regressIf: { op: '>=', value: 4 } }),
    ],
  },
  {
    id: 'return', name: 'Stage 5 · Return to sport', goal: 'Top-speed sprinting, sport drills, and full training.',
    pattern: ['running', 'strength', 'recovery', 'running', 'strength', 'rest', 'rest'], minDays: 4, evidence: ev('consensus', 'hs-011', 'hs-015'),
    sessions: {
      running: [
        { exercise: 'a_skip', dose: { sets: 3, metres: 20 } },
        { exercise: 'run_90', dose: { sets: 3, metres: 40, note: 'Build-up.' } },
        { exercise: 'sprint', dose: { sets: 4, metres: 20, intensity: '≥95% max speed', restSeconds: 180 } },
      ],
      strength: [
        { exercise: 'nordic_full', dose: { sets: 2, reps: 5 } },
        { exercise: 'rdl', dose: { sets: 3, reps: 5, intensity: 'RPE 8' } },
      ],
      recovery: [{ exercise: 'bike', dose: { sets: 1, seconds: 1200 } }],
    },
    gates: [
      gate('palpation', '<=', 0, 'consensus', ['hs-011']),
      gate('aslr_sym', '>=', 90, 'trial', ['hs-012', 'hs-011']),
      gate('stretch_pain', '<=', 0, 'trial', ['hs-009']),
      gate('bridge_long_sym', '>=', 90, 'consensus', ['hs-006', 'hs-011']),
      gate('sprint_pct', '>=', 95, 'practitioner', ['hs-015']),
      gate('run_pain', '==', 0, 'consensus', ['hs-010']),
      gate('full_training', '==', true, 'consensus', ['hs-011']),
      gate('readiness', '>=', 8, 'consensus', ['hs-011']),
    ],
  },
];

const protocol = {
  id: 'hamstring-strain', condition: 'hamstring_strain', name: 'Hamstring strain', version: '0.1.0',
  review: { status: 'draft' },
  region: 'thigh_posterior',
  structures: ['biceps_femoris_long', 'biceps_femoris_short', 'semitendinosus', 'semimembranosus'],
  intake: [
    { id: 'mechanism', prompt: 'How did it happen?', kind: 'single', options: [
      { value: 'sprint', label: 'Running or sprinting fast' },
      { value: 'stretch', label: 'Kicking, a split, or a deep stretch' },
      { value: 'other', label: 'Something else / not sure' } ] },
    { id: 'tendon', prompt: 'Has a scan (MRI or ultrasound) shown the tendon is involved?', help: 'For example "intramuscular tendon", "BAMIC c", or "free tendon".', kind: 'single', options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No, muscle only' }, { value: 'unknown', label: 'No scan' } ] },
    { id: 'days_since', prompt: 'How many days ago did it happen?', kind: 'scale', scale: { min: 0, max: 60 } },
    { id: 'walk_pain', prompt: 'Pain when walking right now (0–10)?', kind: 'scale', scale: { min: 0, max: 10 } },
    { id: 'previous', prompt: 'Have you injured this hamstring before?', kind: 'boolean' },
  ],
  redFlags: [
    { id: 'rf_avulsion', question: 'Did you feel a pop high up near your sitting bone, AND now have large bruising down the back of the thigh, a gap you can feel, or real difficulty walking?', action: 'urgent', message: 'This could be a tendon torn off the bone (avulsion). Early repair gets better results, so see a sports doctor or orthopaedic surgeon within the next few days and ask about an MRI. Don\'t start this plan yet.', evidence: ev('trial', 'hs-019', 'hs-020') },
    { id: 'rf_nerve', question: 'Numbness, pins and needles, or weakness spreading into the lower leg or foot?', daily: true, action: 'urgent', message: 'Nerve symptoms need a clinician to check them before you load the leg. Book an appointment within 1–2 days.', evidence: ev('consensus', 'hs-019', 'hs-021') },
    { id: 'rf_dvt', question: 'Calf swelling, warmth, or tenderness, or new chest pain or breathlessness?', daily: true, action: 'emergency', message: 'This could be a blood clot. Get urgent medical care today (call emergency services if you have chest pain or breathlessness).', evidence: ev('consensus', 'hs-021') },
    { id: 'rf_cauda', question: 'Numbness around the groin or buttocks, or new problems controlling your bladder or bowel?', daily: true, action: 'emergency', message: 'This needs emergency assessment now. Go to A&E / the emergency room.', evidence: ev('consensus', 'hs-021') },
  ],
  tracks: [
    { id: 'tendon', label: 'Tendon-involved strain', when: { q: 'tendon', eq: 'yes' }, timelineDays: [30, 80], minDaysScale: 1.8, explain: 'Injuries into the tendon heal more slowly and re-injure more often, so the gates are stricter and the timeline longer.', evidence: ev('trial', 'hs-007') },
    { id: 'stretch', label: 'Stretch-type strain', when: { q: 'mechanism', eq: 'stretch' }, timelineDays: [28, 60], minDaysScale: 1.6, explain: 'Stretch-type injuries typically take about twice as long as sprint-type ones.', evidence: ev('trial', 'hs-008') },
    { id: 'sprint', label: 'Sprint-type strain', timelineDays: [14, 40], explain: 'Sprint-type strains with lengthening-based rehab typically return in 3–5 weeks.', evidence: ev('trial', 'hs-001', 'hs-003') },
  ],
  exercises, tests, stages,
  rules: {
    pain: { strengthMax: 4, painFreeMax: 0, flareDelta: 2, stopAtRest: 6, evidence: ev('trial', P.strength, P.consensus) },
    testEveryDays: 3, flaresToRegress: 2, runClearTest: 'run_pain',
  },
};

writeFileSync(new URL('./hamstring.json', import.meta.url), JSON.stringify(protocol, null, 2) + '\n');
console.log('wrote hamstring.json');
