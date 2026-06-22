/**
 * lib/clinical/rfBetaEngine/rfEliteSessionContent.mjs
 * ---------------------------------------------------------------------------
 * Elite clinical content overlay for all 107 RF-EX objects.
 *
 * Two exports:
 *   EXERCISE_CONTENT[id] — instructions, coaching cues, common mistakes, purpose
 *   SESSION_TIER_STRUCTURE[phaseId][0|1|2] — session plan for early/mid/late
 *   getSessionTierConfig(phaseId, sessionIndex) — returns the right tier config
 *
 * Session volume model (tier = one WEEK, all 3 sessions in a week share the same tier):
 *   Foundation early (week 1):  3 exercises  [BETA_SUBPHASE_PROGRESSION]
 *   Foundation mid   (week 2):  5 exercises  [BETA_SUBPHASE_PROGRESSION]
 *   Foundation late  (week 3+): 8 exercises  [BETA_SUBPHASE_PROGRESSION]
 *   Reload, Accumulation, Transition, Simulation, Resilience counts: [BETA_SESSION_COUNTS]
 *
 * IMPORTANT: PMC11338860 Phase 1 prescribes ALL 12 exercises simultaneously
 * from day 5 post-injury (supervised, criteria-adapted). It does NOT use a
 * week-by-week count ramp. Our 3→5→8 is a BETA conservative adaptation for
 * unsupervised self-guided use. See BETA_SUBPHASE_PROGRESSION in rfClinicalCitations.mjs.
 *
 * Dosage is defined per block per tier — never pulled from null exercise shells.
 *
 * Clinical validation: see rfClinicalCitations.mjs for full source registry.
 * VALIDATED sources:
 *   PMC11338860  — Frontiers 2024 RF case report. Exercise TYPES and DOSAGES for Foundation,
 *                  Reload, Accumulation are directly from Table 1. Pain threshold VAS≤3. N=1.
 *                  doi:10.3389/fbioe.2024.1385786
 *   BARONI_2024  — Reverse Nordic comparable (not superior) eccentric activation.
 *                  J Sport Rehabil 2024;33(8):646. doi:10.1123/jsr.2023-0431
 *   PAIN_THRESHOLD — VAS≤3 exercise threshold (PMC11338860).
 * CONSISTENT sources (applied via clinical reasoning):
 *   BFR_CONSENSUS — Hughes 2017 BJSM. doi:10.1136/bjsports-2016-097071
 *   HICKEY_2022   — Early eccentric criteria-based loading. JSAMS 2022. PMID:35794049
 *   SPRINT_PROGRESSION — Buckthorpe 2019 BJSM. PMC6579500
 * BETA items (no published protocol — require clinician review before deployment):
 *   BETA_SUBPHASE_PROGRESSION — Foundation week-by-week exercise count ramp (3→5→8)
 *   BETA_SESSION_COUNTS       — Exercise counts per session across all phases
 *   BETA_ACUTE_REST_DAYS      — Pre-exercise rest thresholds by severity band
 *   BETA_ECCENTRIC_DOSAGE     — Reload/Accumulation eccentric dosage
 *   BETA_PLANK_PROGRESSION    — Reload+ plank dosage
 *   BETA_RUNNING_DRILL_VOLUME — Running drill reps/distance
 * ---------------------------------------------------------------------------
 */

/**
 * Per-exercise clinical content overlay.
 * Used by rfSessionGenerator to populate instruction/cue/mistake fields
 * because the base RF-EX objects are shells with empty arrays.
 */
export const EXERCISE_CONTENT = {

  // ─── FOUNDATION ──────────────────────────────────────────────────────────

  'RF-EX-020': {
    purpose: 'Gently restore comfortable knee flexion while lying face down.',
    instructions: [
      'Lie face down on a flat surface with legs straight.',
      'Slowly bend one knee, drawing your heel toward your buttock as far as comfortable.',
      'Hold at end range for 2–3 seconds, then slowly lower.',
      'Stop before any sharp or pulling pain — move only in a pain-free range.',
    ],
    coaching_cues: ['Keep your hips flat on the surface throughout', 'Breathe out as you bend the knee'],
    common_mistakes: ['Lifting the hip off the floor to gain extra range', 'Forcing range — go only where it is comfortable'],
  },

  'RF-EX-025': {
    purpose: 'Restore hip extension mobility and reduce hip-flexor tightness from a protected position.',
    instructions: [
      'Kneel on your injured-side knee with the other foot forward — like a lunge.',
      'Keep your torso upright and core lightly braced.',
      'Tuck your pelvis gently under (posterior tilt) until you feel a mild stretch at the front of the kneeling hip.',
      'Hold 2–3 seconds, release, and repeat.',
    ],
    coaching_cues: ['Think "zipper up" with your core as you tilt', 'The stretch should feel mild — not a sharp pull'],
    common_mistakes: ['Leaning the torso forward instead of tucking the pelvis', 'Holding the breath — keep breathing normally'],
  },

  'RF-EX-089': {
    purpose: 'Restore pain-free knee flexion range of motion in a gravity-assisted, low-load position.',
    instructions: [
      'Lie on your back with legs straight.',
      'Slowly slide your heel toward your buttock by bending your knee.',
      'Go as far as you can without pain, then slowly return.',
      'Move smoothly — no momentum.',
    ],
    coaching_cues: ['Slow and controlled — 3 seconds each direction', 'Stop at any sharp or worsening discomfort'],
    common_mistakes: ['Using a towel to force range beyond comfort', 'Moving too fast and losing control'],
  },

  'RF-EX-090': {
    purpose: 'Gently move the rectus femoris through a comfortable, pain-free range without provoking the injury.',
    instructions: [
      'Lie on your side with the injured leg on top.',
      'Gently bend the top knee, holding the ankle, and draw it back until you feel a mild stretch in the front of the thigh.',
      'Hold 2–3 seconds, then release. Keep the movement within a fully comfortable range.',
      'Do not pull to maximum stretch — this is a calm, protective movement.',
    ],
    coaching_cues: ['Think "gentle" — coaxing the tissue, not stretching hard', 'Hip stays forward throughout'],
    common_mistakes: ['Pulling to maximum range too early in recovery', 'Arching the lower back — keep it neutral'],
  },

  'RF-EX-024': {
    purpose: 'Actively recover controlled knee flexion range using your own muscle control.',
    instructions: [
      'Sit on the edge of a chair or table so your lower leg can hang freely.',
      'Slowly bend the knee, letting gravity and gentle muscle control increase the range.',
      'Hold at end range for 2–3 seconds, then actively lift the leg back to straight.',
      'The return to extension is an active exercise — do not let it drop.',
    ],
    coaching_cues: ['Control the speed in both directions — no swinging', 'Stop if pain exceeds mild discomfort'],
    common_mistakes: ['Letting the leg drop rather than actively returning', 'Rushing through reps'],
  },

  'RF-EX-027': {
    purpose: 'Warm up the hamstrings and promote neuromuscular readiness without loading the quad.',
    instructions: [
      'Lie on your back. Bend both knees to 90°.',
      'Lift one leg and gently kick it toward the ceiling, straightening the knee as far as comfortable.',
      'Slowly return. Alternate or stay on the same side as prescribed.',
      'Move with control — dynamic, not a static hold.',
    ],
    coaching_cues: ['Keep the lower back flat on the floor', 'Gentle pump — no force'],
    common_mistakes: ['Locking the knee hard at the top', 'Lifting the hips off the floor'],
  },

  'RF-EX-085': {
    purpose: 'Use the uninjured leg to gently assist knee flexion, decompressing the joint while restoring range.',
    instructions: [
      'Lie on your back and cross the good leg over the injured ankle.',
      'Using the weight of the good leg, gently assist the injured knee into flexion.',
      'Hold 2–3 seconds at end range, then lift the good leg to let the injured leg return.',
      'The injured leg should be passive throughout.',
    ],
    coaching_cues: ['Let gravity and the good leg do the work', 'Stop at any sharp or worsening discomfort'],
    common_mistakes: ['Forcing extra range — this should be gentle and passive', 'Tensing the injured thigh'],
  },

  'RF-EX-088': {
    purpose: 'Reactivate the quadriceps with a low-demand isometric contraction — the neural "wake-up" after injury.',
    instructions: [
      'Lie on your back with legs flat. Place a small rolled towel under the injured knee.',
      'Tighten your quad by pressing the back of your knee down into the towel.',
      'Hold for 5 seconds, fully relax for 5 seconds, then repeat.',
      'Focus on feeling the muscle switch on — not on producing force.',
    ],
    coaching_cues: ['Think "push knee into the towel" not "lift the heel"', 'You should see and feel the quad tighten slightly'],
    common_mistakes: ['Holding the breath — breathe throughout the hold', 'Contracting so hard you provoke pain — this should feel gentle'],
  },

  'RF-EX-022': {
    purpose: 'Isometric quad activation at a comfortable joint angle — builds neuromuscular connection without tendon movement.',
    instructions: [
      'Sit with your back supported and the injured leg at roughly 60° of knee flexion.',
      'Without moving the joint, tighten your quad as if trying to straighten the leg against a wall.',
      'Hold 5 seconds, relax fully, then repeat.',
    ],
    coaching_cues: ['The joint must stay completely still', 'Build gradually to 40–60% of maximum effort'],
    common_mistakes: ['Moving the joint — check that the leg is stationary', 'Not fully relaxing between reps'],
  },

  'RF-EX-012': {
    purpose: 'Activate the quad and hip flexor from a fully extended knee position — low tissue stress, high neural demand.',
    instructions: [
      'Lie on your back. Keep the injured leg straight and the other knee bent with foot flat.',
      'Tighten the quad of the straight leg, then lift it to the height of the opposite knee (~45°).',
      'Hold 2 seconds at the top, then slowly lower with control.',
    ],
    coaching_cues: ['Tighten the quad BEFORE you lift — the knee must stay locked straight', 'Slow the lowering — 3 seconds down'],
    common_mistakes: ['Lifting without first tightening the quad — you will use hip flexor only', 'Letting the knee bend during the movement'],
  },

  'RF-EX-001': {
    purpose: 'Isometric knee extension in a reclined position — minimal hip-flexor involvement, safe for very early phase.',
    instructions: [
      'Sit slightly reclined (back at ~45° on a wedge or pillows).',
      'With the knee bent to ~60°, press your lower leg against a fixed object or partner hand — do not actually move.',
      'Hold 5–7 seconds at 50–60% effort, then relax.',
    ],
    coaching_cues: ['Keep effort comfortable — no sharp pain', 'Breathe continuously through the hold'],
    common_mistakes: ['Gripping the surface with hands — stay relaxed above the waist', 'Pushing too hard — gentle activation is the goal'],
  },

  'RF-EX-002': {
    purpose: 'Isometric quad loading with the hip flexed — challenges the rectus femoris in a lengthened position.',
    instructions: [
      'Sit upright with hip at ~90° and knee at ~90°.',
      'Press your lower leg gently against a fixed resistance (band, partner, or wall).',
      'Hold 5 seconds, relax, repeat.',
    ],
    coaching_cues: ['Maintain an upright torso — do not lean back to reduce the load', 'Start at low effort and build over sessions'],
    common_mistakes: ['Leaning back — changes the hip-flexed position', 'Not maintaining the 90/90 position throughout'],
  },

  'RF-EX-003': {
    purpose: 'Isometric quad loading with the hip in extension — targets the rectus femoris at a short muscle length.',
    instructions: [
      'Lie face down (prone) or stand with the hip in a neutral/extended position.',
      'Bend the knee to ~60–70°, then resist against a band or partner — hold without moving.',
      'Hold 5 seconds, relax, and repeat.',
    ],
    coaching_cues: ['Keep the pelvis neutral — do not arch the lower back', 'The effort should be moderate and pain-free'],
    common_mistakes: ['Allowing hip flexion — the hip must stay extended/neutral', 'Holding breath — breathe throughout'],
  },

  'RF-EX-030': {
    purpose: 'Activate the hip abductors and glute medius for pelvic and lower-limb stability.',
    instructions: [
      'Lie on your side with your body in a straight line.',
      'Lift the top leg to about 30–40° — do not go higher.',
      'Hold 1–2 seconds at the top, then slowly lower.',
      'Keep toes pointing forward (or slightly down) — not toward the ceiling.',
    ],
    coaching_cues: ['Toes forward — the moment they rotate up you are using the wrong muscle', 'Slow the lowering — 3 seconds down'],
    common_mistakes: ['Rotating the hip so toes point to the ceiling', 'Rolling the pelvis back to gain height'],
  },

  'RF-EX-031': {
    purpose: 'Isolate the glute medius and deep hip rotators — foundational pelvic control for injury recovery.',
    instructions: [
      'Lie on your side with hips at ~45° and knees at ~90° — like a foetal position.',
      'Keep your feet together and rotate the top knee upward like a clam opening.',
      'Open to about 30–40°, hold 1–2 seconds, then slowly close.',
      'The pelvis must not rotate — keep the top hip stacked over the bottom.',
    ],
    coaching_cues: ['Imagine your pelvis is glued to a wall behind you', 'The movement comes from the hip, not the lower back'],
    common_mistakes: ['Rolling the pelvis back to lift the knee higher', 'Going too fast — each rep should be deliberate'],
  },

  'RF-EX-032': {
    purpose: 'Activate the glutes and posterior chain from a protected lying position — core stability with zero thigh demand.',
    instructions: [
      'Lie on your back, knees bent to ~90°, feet flat on the floor hip-width apart.',
      'Brace your core gently. Push through your heels and lift your hips until your body forms a straight line from shoulders to knees.',
      'Hold 2–3 seconds at the top, then lower slowly.',
    ],
    coaching_cues: ['Drive through the heels, not the toes', 'At the top, squeeze the glutes — not the quads'],
    common_mistakes: ['Pushing through the toes and recruiting quads instead of glutes', 'Hyperextending the lower back at the top'],
  },

  'RF-EX-039': {
    purpose: 'Build lateral core stability and glute medius endurance — key for single-leg pelvic control in later phases.',
    instructions: [
      'Lie on your side supported on your forearm (elbow directly below shoulder) and the side of your bottom foot.',
      'Lift your hips so your body forms a straight diagonal line from head to feet.',
      'Hold the position, breathing normally.',
      'Modify with knees bent if full hold is too challenging.',
    ],
    coaching_cues: ['Stack your hips — the top hip must not sag or rotate forward', 'Think "long body" — no banana shape'],
    common_mistakes: ['Allowing the hips to sag toward the floor mid-hold', 'Looking down at the floor — keep the neck neutral'],
  },

  'RF-EX-040': {
    purpose: 'Build anterior core stability and whole-body tension without loading the injured thigh.',
    instructions: [
      'Support on forearms (elbows below shoulders) and toes. Keep the body in a straight line.',
      'Brace your core as if you are about to be punched in the stomach.',
      'Hold the position, breathing steadily.',
      'Modify with knees on the floor if the full position is too challenging.',
    ],
    coaching_cues: ['Do not let the hips sag or poke upward — maintain the straight line', 'Squeeze glutes lightly to protect the lower back'],
    common_mistakes: ['Letting hips drop toward the floor', 'Holding the breath — maintain steady breathing'],
  },

  'RF-EX-041': {
    purpose: 'Challenge core stability and limb dissociation — trains the trunk to stay rigid while limbs move.',
    instructions: [
      'Lie on your back. Lift both arms to the ceiling and both knees to 90° (tabletop).',
      'Slowly lower one arm behind you and the opposite leg to hover just above the floor.',
      'Return to start, then repeat on the other side.',
      'The lower back must stay pressed into the floor throughout.',
    ],
    coaching_cues: ['Lower back glued to the floor at all times — if it lifts, reduce the range', 'Move slowly — 4 seconds per limb extension'],
    common_mistakes: ['Letting the lower back arch off the floor when extending the limbs', 'Moving too fast and losing the core challenge'],
  },

  'RF-EX-078': {
    purpose: 'Introduce low-impact lower limb loading, circulation, and psychological confidence in movement.',
    instructions: [
      'Walk at a comfortable pace on a flat, even surface.',
      'Maintain a normal walking pattern — avoid limping or altering your gait.',
      'Start with 10 minutes. If symptoms remain calm, you can build gradually.',
      'Monitor for any increase in pain or swelling during and after.',
    ],
    coaching_cues: ['Walk with your normal stride — do not protect the leg by shortening steps', 'Swing the arms normally to maintain rhythm'],
    common_mistakes: ['Limping to protect the injury — altered gait slows recovery', 'Doing too much too soon — start conservative and build'],
  },

  'RF-EX-080': {
    purpose: 'Low-impact cardiovascular conditioning and knee ROM restoration — no thigh impact or braking demand.',
    instructions: [
      'Set the seat height so the knee has only a slight bend at the bottom of the pedal stroke (~10–15°).',
      'Pedal at a comfortable cadence (60–80 rpm) with very light resistance.',
      'Focus on a smooth, circular pedal stroke.',
      'If you feel any pull or pain in the front of the thigh, reduce resistance further or stop.',
    ],
    coaching_cues: ['Light resistance only — this is active recovery, not a workout', 'Smooth circles, not up-and-down pumping'],
    common_mistakes: ['Setting resistance too high and converting this to a quad workout', 'Raising the seat too low, forcing excessive knee flexion'],
  },

  'RF-EX-081': {
    purpose: 'Cardiovascular conditioning and early movement in a buoyant, unloaded environment.',
    instructions: [
      'Walk or jog gently in the pool at a depth of mid-chest to neck.',
      'The greater the depth, the less body weight loads the legs.',
      'Maintain a normal upright posture and comfortable movement pattern.',
      'Progress from walking to gentle jogging only when walking is fully pain-free.',
    ],
    coaching_cues: ['Stay in deep enough water to feel genuinely light on your feet', 'Normal posture — do not lean forward or backward'],
    common_mistakes: ['Moving into shallower water (more load) before being ready', 'Rushing into jogging when walking is still uncomfortable'],
  },

  // ─── RELOAD ──────────────────────────────────────────────────────────────

  'RF-EX-023': {
    purpose: 'Re-introduce active knee extension through range — transition from isometric to isotonic quad loading.',
    instructions: [
      'Sit on the edge of a table or chair, knee bent to ~90°.',
      'Slowly straighten the knee against light resistance (your own leg weight or light ankle weight).',
      'Pause briefly at full extension, then slowly lower back to 90°.',
      'Control the return — do not let the knee drop quickly.',
    ],
    coaching_cues: ['Slow the lowering phase — 3–4 seconds down', 'Pain up to 3/10 is acceptable — stop if it exceeds this'],
    common_mistakes: ['Swinging the leg up with momentum', 'Not controlling the eccentric — this is where adaptation occurs'],
  },

  'RF-EX-007': {
    purpose: 'Re-load the hip flexors concentrically from a half-kneeling position — challenges the RF at moderate length.',
    instructions: [
      'Kneel on the injured-side knee with the other foot forward (half-kneeling).',
      'From this position, lift the kneeling-side knee off the floor to 90° by driving through the hip flexors.',
      'Hold 1–2 seconds at the top, then slowly lower back to the kneeling position.',
    ],
    coaching_cues: ['Maintain an upright torso — resist the urge to lean back', 'Drive the knee up with the hip flexors, not by hitching the pelvis'],
    common_mistakes: ['Leaning backward to reduce the load', 'Hip hiking — the pelvis tilts instead of the leg lifting'],
  },

  'RF-EX-008': {
    purpose: 'Hip flexion loading with the trunk inclined — increases the length of the rectus femoris during the exercise.',
    instructions: [
      'Stand on a slight incline (or lean against a wall with back at ~80°).',
      'Lift the injured knee to ~90° against light resistance (body weight or band).',
      'Hold 2 seconds, slowly lower, repeat.',
    ],
    coaching_cues: ['The inclined trunk is deliberate — it lengthens the muscle and increases the demand', 'Do not compensate by leaning forward at the waist'],
    common_mistakes: ['Straightening the torso to make the exercise easier', 'Using momentum to swing the knee up'],
  },

  'RF-EX-010': {
    purpose: 'Hip flexor loading with the knee in flexion — reduces the RF component and focuses on iliopsoas.',
    instructions: [
      'Stand upright. Bend the knee to ~90° first, then lift the knee to hip height.',
      'Hold 1–2 seconds at the top, then slowly lower, keeping the knee bent throughout.',
    ],
    coaching_cues: ['Knee stays bent at 90° throughout — this shortens the RF and reduces tissue stress', 'Stand tall — do not lean back'],
    common_mistakes: ['Extending the knee during the lift — this adds RF load prematurely', 'Holding the breath at the top'],
  },

  'RF-EX-011': {
    purpose: 'Hip flexor loading with the knee extended — increases RF challenge as the muscle works at greater length.',
    instructions: [
      'Stand upright. Keeping the leg straight, lift it forward to about 60–70° of hip flexion.',
      'Hold 1–2 seconds at the top, slowly lower with control.',
    ],
    coaching_cues: ['The straight knee is intentional — it increases the demand on the RF', 'Monitor for pulling in the anterior thigh — mild is acceptable, sharp is not'],
    common_mistakes: ['Allowing the knee to bend mid-lift to compensate', 'Swinging the leg up with momentum'],
  },

  'RF-EX-005': {
    purpose: 'Isometric hip flexion in a seated position — safe, progressive activation of the hip flexors and RF.',
    instructions: [
      'Sit on a firm chair, upright posture.',
      'Lift the injured knee slightly off the seat and hold it there.',
      'Begin with 5-second holds, building to 10 seconds over sessions.',
    ],
    coaching_cues: ['Keep the torso upright — leaning back reduces the demand', 'You should feel the front of the hip working, not just the thigh'],
    common_mistakes: ['Leaning back to make the hold easier', 'Clenching teeth or fists — stay relaxed'],
  },

  'RF-EX-006': {
    purpose: 'Introduce standing hip-flexion loading and single-leg balance challenge.',
    instructions: [
      'Stand tall on one leg. Lift the injured knee to ~90°.',
      'Hold for 2 seconds, lower with control, repeat.',
      'Focus on maintaining balance and upright posture on the standing leg.',
    ],
    coaching_cues: ['Keep the standing hip level — do not let the pelvis drop', 'Eyes forward — use a wall if needed for balance feedback'],
    common_mistakes: ['Allowing the standing hip to hitch or sag', 'Leaning away from the lifted leg'],
  },

  'RF-EX-091': {
    purpose: 'Re-introduce quad isotonic loading through the terminal range of extension — lowest possible RF stress.',
    instructions: [
      'Lie on your back. Place a rolled towel (15–20cm diameter) under the injured knee to support it at ~30–40° of flexion.',
      'Tighten the quad and straighten the leg fully. Hold 2 seconds at the top.',
      'Slowly lower back to the towel. Maintain full quad tension throughout.',
    ],
    coaching_cues: ['The towel creates a "wedge" — the knee moves from bent to straight in a short arc only', 'Do not let the heel drop fast — control it back to the towel'],
    common_mistakes: ['Lifting the entire leg (full SLR) instead of just straightening from the wedge', 'Not fully extending at the top'],
  },

  'RF-EX-016': {
    purpose: 'Functional single-leg loading — integrates quad, glute, and balance in a real-life movement pattern.',
    instructions: [
      'Stand in front of a step (start ~15cm). Place the injured foot on the step.',
      'Push through the step foot to stand up, bringing the other foot to meet it.',
      'Step down slowly, leading with the other foot, and return to start.',
    ],
    coaching_cues: ['Drive through the heel on the step — not the toes', 'Keep the knee tracking over the middle toe — no caving inward'],
    common_mistakes: ['Using the trailing leg to push off the floor — the step leg must do the work', 'Leaning forward excessively to compensate for quad weakness'],
  },

  'RF-EX-004': {
    purpose: 'Isolated quad loading through the full or partial range — controlled environment for progressive tissue loading.',
    instructions: [
      'Sit in the leg extension machine with the shin pad just above the ankle.',
      'Adjust so the knee starts at ~70–90° of flexion.',
      'Slowly extend to full extension, hold 1–2 seconds, then lower with control (3–4 seconds down).',
    ],
    coaching_cues: ['The eccentric (lowering) is as important as the lifting — resist gravity on the way down', 'If pain exceeds 3/10, reduce range or weight'],
    common_mistakes: ['Swinging the weight up with momentum', 'Dropping the weight quickly rather than lowering with control'],
  },

  'RF-EX-017': {
    purpose: 'Re-introduce bilateral squat mechanics — foundation for all lower-limb function in sport and daily life.',
    instructions: [
      'Stand with feet hip-width apart, toes pointing slightly outward.',
      'Brace your core, push hips back and down, bending at the hips and knees simultaneously.',
      'Lower until thighs are roughly parallel to the floor (or to a pain-free depth).',
      'Drive through heels and hips to return to standing.',
    ],
    coaching_cues: ['Knees track over toes — do not let them cave inward', 'Chest stays up — think "proud chest" throughout'],
    common_mistakes: ['Heels lifting off the floor (mobility limitation)', 'Knees diving inward, especially under fatigue'],
  },

  'RF-EX-033': {
    purpose: 'High-level glute activation and hip extension power — critical for sprinting, kicking, and changing direction.',
    instructions: [
      'Sit with your upper back resting on a bench, knees bent, feet flat on the floor hip-width apart.',
      'Brace your core and drive your hips upward until your body forms a straight line from shoulders to knees.',
      'Squeeze your glutes hard at the top. Hold 2 seconds, then lower with control.',
    ],
    coaching_cues: ['Drive through the heels — your toes should feel light at the top', 'Keep your chin tucked slightly — do not hyperextend the neck'],
    common_mistakes: ['Pushing through toes and recruiting quads instead of glutes', 'Hyperextending the lower back at the top'],
  },

  'RF-EX-034': {
    purpose: 'Build hip abductor strength and lateral pelvic control in a functional, standing position.',
    instructions: [
      'Place a resistance band around both legs just above the knees.',
      'Stand with feet hip-width apart and maintain a slight squat position.',
      'Step sideways, keeping tension in the band. Take 10–12 steps one way, then return.',
    ],
    coaching_cues: ['Maintain the slight squat position throughout — do not stand up between steps', 'Keep the trunk upright — do not lean toward the stepping leg'],
    common_mistakes: ['Standing up straight between steps, which reduces glute activation', 'Letting the feet come together so the band goes slack'],
  },

  'RF-EX-036': {
    purpose: 'Hip abductor and hip flexor activation through diagonal stepping — higher demand than lateral band walk.',
    instructions: [
      'Place a band above the knees. Stand in a slight squat position.',
      'Walk forward and outward in a diagonal, alternating feet — like a monster walk.',
      'Keep the knees over toes and resist the band every step.',
      'Walk 10–15m forward, then reverse.',
    ],
    coaching_cues: ['Maintain knee-over-toe alignment on every step', 'Stay low in the squat — do not bounce up and down'],
    common_mistakes: ['Walking upright rather than staying in a squat', 'Allowing feet to turn inward under fatigue'],
  },

  'RF-EX-042': {
    purpose: 'Anti-rotation core stability — challenges the core to resist lateral forces during upper-limb movement.',
    instructions: [
      'Stand sideways to a cable machine or band anchor at chest height.',
      'Hold the handle at your chest. Brace your core.',
      'Press the handle straight forward (elbows extend), hold 2 seconds, then return to your chest.',
      'The goal is to resist rotation — your trunk should not twist.',
    ],
    coaching_cues: ['The longer you hold the press, the harder it is — build that time', 'Feet shoulder-width apart, athletic stance'],
    common_mistakes: ['Rotating toward or away from the anchor', 'Using a weight that causes shoulder fatigue rather than core fatigue'],
  },

  'RF-EX-092': {
    purpose: 'Proprioceptive training and single-leg stability — activates glute medius and ankle stabilisers.',
    instructions: [
      'Stand on the injured leg. Maintain a slight bend in the stance knee.',
      'Reach the free leg forward, to the side, and behind you in a controlled manner (star reach).',
      'Return the free leg to centre between each reach. Stay balanced throughout.',
    ],
    coaching_cues: ['Let the stance knee bend slightly — do not lock it straight', 'Focus on keeping the hips level on every reach direction'],
    common_mistakes: ['Locking the stance knee — this reduces proprioceptive input', 'Moving too fast — slow, controlled reaches maximise the balance challenge'],
  },

  'RF-EX-079': {
    purpose: 'Introduce low-speed running loads — critical first step in return-to-running progression.',
    instructions: [
      'Begin with a 5-minute walk to warm up.',
      'Transition to a very comfortable, slow jog on a flat surface.',
      'Start with 5–10 minutes of easy jogging, monitoring symptoms continuously.',
      'Stop if pain exceeds 2/10 or gait becomes abnormal.',
    ],
    coaching_cues: ['Jog at a pace where you could hold a comfortable conversation', 'Maintain your normal running posture — do not protect the leg by limping'],
    common_mistakes: ['Running too fast — this is exposure, not a workout', 'Continuing to run through pain beyond 2/10'],
  },

  'RF-EX-082': {
    purpose: 'Higher-intensity cardiovascular conditioning without the impact of running — supports fitness maintenance.',
    instructions: [
      'Set resistance to a comfortable level.',
      'Maintain an upright posture with hands on the moving handles.',
      'Aim for a smooth, rhythmical stride — both arms and legs working together.',
      'Monitor the front of the thigh for any pulling discomfort.',
    ],
    coaching_cues: ['Upright posture — do not hang on the handles', 'Even pressure through both legs throughout the stride'],
    common_mistakes: ['Leaning heavily on the handles to reduce lower-limb demand', 'Moving so fast that form deteriorates'],
  },

  // ─── ACCUMULATION ─────────────────────────────────────────────────────────

  'RF-EX-018': {
    purpose: 'Early single-leg loading — builds quad and glute strength through a small, controlled range.',
    instructions: [
      'Stand on the injured leg, holding a support lightly for balance if needed.',
      'Lower into a single-leg mini squat, bending the knee to ~30–40° only.',
      'Drive back to standing through the heel.',
    ],
    coaching_cues: ['Knee tracks over the middle of the foot — not inward', 'Keep the trunk upright'],
    common_mistakes: ['Allowing knee valgus (caving inward)', 'Squatting too deeply before quad strength is sufficient'],
  },

  'RF-EX-019': {
    purpose: 'Full single-leg squat — a key functional strength benchmark and critical return-to-sport exercise.',
    instructions: [
      'Stand on the injured leg with arms extended forward for balance.',
      'Lower into a single-leg squat, aiming for ~60–70° of knee flexion.',
      'Drive back to full extension through the heel and glute.',
    ],
    coaching_cues: ['Quality (alignment) is more important than depth', 'Hip should stay level — do not let it drop on the non-standing side'],
    common_mistakes: ['Knee collapsing inward under load — reduce depth if this occurs', 'Trunk leaning excessively forward to compensate for weak glutes'],
  },

  'RF-EX-014': {
    purpose: 'Dynamic bilateral-to-unilateral loading — builds quad, glute, and hip flexor strength in a movement pattern.',
    instructions: [
      'Step forward into a lunge, lowering the back knee toward the floor.',
      'Push off the front foot to step the back leg forward and into the next lunge.',
      'Maintain an upright torso and keep the front knee directly above the ankle.',
    ],
    coaching_cues: ['Step long enough that the front shin remains vertical at the bottom', 'Drive through the front heel on the push-off'],
    common_mistakes: ['Front knee shooting past the toes — step length too short', 'Torso leaning forward — keep the chest up'],
  },

  'RF-EX-015': {
    purpose: 'Posterior lunge — emphasises glute and hamstring loading with lower anterior quad shear than forward lunge.',
    instructions: [
      'Stand tall. Step one foot backward into a lunge, lowering the back knee toward the floor.',
      'Front knee stays above the ankle. Lower until the back knee is about 2–3cm from the floor.',
      'Drive back to standing through the front heel.',
    ],
    coaching_cues: ['Keep weight on the front foot — the back leg is just a guide', 'The anterior knee position is easier to control — use that advantage'],
    common_mistakes: ['Front knee travelling past the toes', 'Trunk leaning forward instead of staying upright'],
  },

  'RF-EX-093': {
    purpose: 'Stationary single-leg loaded squat — builds unilateral quad and glute strength in a stable position.',
    instructions: [
      'Stand in a lunge stance — one foot forward, one back, about a stride apart.',
      'Lower straight down until the back knee is near the floor. Front shin stays near-vertical.',
      'Drive back up through the front heel.',
    ],
    coaching_cues: ['Drop straight down — not forward', 'Keep 80% of weight on the front foot'],
    common_mistakes: ['Stepping too narrow so the front knee passes well beyond the toes', 'Pushing off the back toes instead of driving through the front heel'],
  },

  'RF-EX-094': {
    purpose: 'High-demand single-leg squat — hip mobility, quad strength, and glute activation combined.',
    instructions: [
      'Place the back foot on a bench or box (laces facing down).',
      'Stand on the front leg, hip-width from the bench.',
      'Lower the back knee toward the floor while keeping the front knee tracking over the toes.',
      'Drive back to standing through the front heel.',
    ],
    coaching_cues: ['Hip stays under the shoulder — do not let it drift forward', 'The front knee must track over the second toe throughout the descent'],
    common_mistakes: ['Placing the back foot too close to the bench, causing instability', 'Front knee caving inward under load'],
  },

  'RF-EX-095': {
    purpose: 'Forward lunge variation — introduces anterior loading and higher eccentric demand on the quad.',
    instructions: [
      'Step forward into a long lunge. Lower the back knee toward the floor.',
      'At the bottom, hold for 1–2 seconds, then push back to start.',
      'Maintain upright posture throughout.',
    ],
    coaching_cues: ['A longer step will challenge the quad more — build to this gradually', 'Keep the heel of the front foot planted throughout'],
    common_mistakes: ['Short stepping, which allows the front knee to go too far forward', 'Pushing forward with the trunk to start the return — push through the heel instead'],
  },

  'RF-EX-096': {
    purpose: 'Eccentric single-leg loading in a functional pattern — excellent quad and glute assessment and training tool.',
    instructions: [
      'Stand on the edge of a step (15–20cm) on the injured leg.',
      'Slowly lower the other foot toward the floor by bending the standing knee.',
      'Touch down lightly with the heel, then drive back up.',
    ],
    coaching_cues: ['Slow the descent — 3–5 seconds down', 'Keep the standing knee tracking over the middle toe throughout'],
    common_mistakes: ['Knee collapsing inward during the descent', 'Rushing the lowering phase — the slow eccentric is the training stimulus'],
  },

  'RF-EX-035': {
    purpose: 'Single-leg glute loading — challenges the posterior chain and pelvic stability at high intensity.',
    instructions: [
      'Set up for a hip thrust with your upper back on a bench.',
      'Plant one foot on the floor; keep the other leg lifted (bent at ~90°).',
      'Drive through the planted heel to lift the hips to a straight line from shoulder to knee.',
      'Hold 1–2 seconds at the top, then lower with control.',
    ],
    coaching_cues: ['The lifted leg must not help — focus all drive through the planted foot', 'Squeeze the glute at the top — feel it in the single glute, not the quad'],
    common_mistakes: ['Allowing the unsupported hip to drop', 'Pushing through the toes and recruiting hamstring/calf more than the glute'],
  },

  'RF-EX-009': {
    purpose: 'Eccentric/isometric loading of the hip flexors and RF in a lengthened position — key for tendon adaptation.',
    instructions: [
      'Lie on the edge of a table (or floor). Hold both knees to your chest.',
      'Slowly lower the injured leg down until the hip is in a neutral or slightly extended position.',
      'Hold this lengthened position for the prescribed time.',
      'Do not arch the lower back — keep the pelvis neutral.',
    ],
    coaching_cues: ['The lower back must stay flat — tuck the pelvis and hold the non-injured knee to your chest', 'You will feel a mild-to-moderate stretch/tension in the front of the hip — this is the target'],
    common_mistakes: ['Arching the lower back to gain more hip extension — this reduces the RF load', 'Letting the knee bend to relieve the stretch — keep it relatively extended'],
  },

  'RF-EX-099': {
    purpose: 'Eccentric hip flexor and core challenge — builds RF and iliopsoas strength through controlled lowering.',
    instructions: [
      'Lie on your back. Lift both legs to ~90°.',
      'Brace your core. Slowly lower the injured leg toward the floor, taking 5–8 seconds.',
      'Stop before your lower back lifts off the floor. Return the leg to vertical.',
    ],
    coaching_cues: ['Lower back must stay glued to the floor — this is the key constraint', 'If back lifts before the leg is near the floor, stop there and build range over sessions'],
    common_mistakes: ['Allowing the lower back to arch mid-movement', 'Lowering too quickly and losing the eccentric stimulus'],
  },

  'RF-EX-100': {
    purpose: 'Isometric loading of the hip flexors with the knee extended — higher RF demand than knee-bent variants.',
    instructions: [
      'Lie on your back, injured leg straight, other knee bent.',
      'Lift the straight leg to 45° and hold it there.',
      'Maintain a flat lower back throughout the hold.',
      'Build from 10-second holds toward 30-second holds over sessions.',
    ],
    coaching_cues: ['The flat lower back is non-negotiable — if it lifts, lower the leg slightly', 'You should feel fatigue in the front of the hip/thigh'],
    common_mistakes: ['Allowing the leg to sink gradually during the hold', 'Lower back lifting off the surface'],
  },

  'RF-EX-101': {
    purpose: 'Guided eccentric loading of the hip flexors with partner or strap assistance — controlled tissue stress.',
    instructions: [
      'Use a strap or partner to assist holding the leg at hip height.',
      'Slowly release the assistance, lowering the leg over 5–8 seconds.',
      'Use the assistance on the way back up — the eccentric only is the loading stimulus.',
    ],
    coaching_cues: ['The assistance on the way up is a concession to make more eccentric reps possible — use it fully', 'Match the pace — 5 slow seconds down every rep'],
    common_mistakes: ['Rushing the lowering phase', 'Not using enough assistance on the concentric'],
  },

  // [BARONI_2024] Pereira et al. J Sport Rehabil 2024;33(8):646. doi:10.1123/jsr.2023-0431.
  'RF-EX-103': {
    purpose: 'High-demand eccentric quad loading in the lengthened position — produces large eccentric quadriceps activation comparable to squat-based exercises (Baroni et al. J Sport Rehabil 2024). A useful progression tool for RF rehabilitation, not universally superior to other eccentric approaches.',
    instructions: [
      'Kneel on a padded surface. Secure your ankles under a bar or have a partner hold them.',
      'Keeping the hips in line with the knees, slowly lean backward as far as possible.',
      'Use your hands to catch yourself (push-up position) and return to kneeling upright.',
      'Begin with a partial range lean and build depth over sessions.',
    ],
    coaching_cues: ['The body must move as one unit — hips and shoulders move back together, no hip hinging', 'The slower you go, the greater the quad eccentric stimulus — aim for 3–5 seconds per rep'],
    common_mistakes: ['Hinging at the hips instead of leaning back as a unit', 'Going too deep too early — partial range with good control is more valuable'],
  },

  'RF-EX-043': {
    purpose: 'Re-introduce elastic, low-amplitude running mechanics — activates the ankle spring and prepares the lower limb for running.',
    instructions: [
      'Walk or march slowly, focusing on an exaggerated toe-up (dorsiflexed) foot position each time the foot leaves the ground.',
      'Drive the foot to the ground from a dorsiflexed position — feel the spring in the ankle.',
      'Keep steps small and frequency high — this is about ankle stiffness, not stride length.',
    ],
    coaching_cues: ['Toes up every time the foot is in the air', 'Like bouncing on a springboard — light, quick contacts with the ground'],
    common_mistakes: ['Letting the foot slap flat or toe-first', 'Taking long, slow steps — the drill is about fast, short contacts'],
  },

  'RF-EX-044': {
    purpose: 'Running mechanics and hip flexion coordination — introduces a cyclic hip-drive pattern.',
    instructions: [
      'Skip forward, driving one knee up to hip height on each step.',
      'The opposite arm drives forward with each knee lift.',
      'Land on the ball of the foot and immediately transition to the next skip.',
    ],
    coaching_cues: ['Focus on the knee drive height — the hip should flex to ~80–90°', 'Arms drive the rhythm — keep them at 90° and pump vigorously'],
    common_mistakes: ['Skipping with minimal knee lift — this defeats the purpose of the drill', 'Foot landing flat or heel-first'],
  },

  'RF-EX-046': {
    purpose: 'Hip flexion activation and running posture drill — builds hip flexor endurance and trunk stability.',
    instructions: [
      'March forward with an exaggerated knee drive to ~90° of hip flexion.',
      'Land softly on the ball of the foot. Keep the trunk upright.',
      'Opposite arm drives forward with each knee lift.',
    ],
    coaching_cues: ['Drive the knee UP — then drive the foot DOWN — two distinct phases', 'Tall posture: imagine a string pulling you up from the crown of your head'],
    common_mistakes: ['Leaning backward and shuffling rather than driving the knee upward', 'Looking down — keep the chin level and eyes forward'],
  },

  'RF-EX-047': {
    purpose: 'Cycling mechanics drill — activates the hamstring pull-through and reduces ground contact time.',
    instructions: [
      'Jog forward slowly, actively flicking your heel to your buttock on each step.',
      'The knee should stay pointing downward — flick the foot behind you, not to the side.',
      'Keep a high step frequency and light contact with the ground.',
    ],
    coaching_cues: ['Knee pointing straight down — the flick is backward, not sideways', 'Stay on the balls of the feet — no heel striking'],
    common_mistakes: ['Bringing the knee forward instead of keeping it down', 'Leaning backward, which forces the foot to flick to the side'],
  },

  'RF-EX-048': {
    purpose: 'Trains the hip extension and ankle push-off mechanics critical for efficient running propulsion.',
    instructions: [
      'Walk or march slowly, exaggerating the final push-off phase with each step.',
      'Drive through the big toe, fully extending the hip and ankle as if pushing the ground away.',
      'Hold the extended position briefly before the next step.',
    ],
    coaching_cues: ['Think "hip tall and forward" at the push-off — full hip extension', 'The big toe should be the last contact with the ground each step'],
    common_mistakes: ['Pushing off the middle of the foot rather than the toe', 'Not achieving full hip extension at push-off'],
  },

  'RF-EX-049': {
    purpose: 'Trains pelvic stability during the single-leg support phase of running — key for injury prevention.',
    instructions: [
      'Walk slowly and pause at the single-leg support phase of each step.',
      'At the pause, check: hips are level, trunk is upright, stance knee is slightly bent.',
      'Hold 1–2 seconds, then continue the step.',
    ],
    coaching_cues: ['The pause reveals your pelvic control — if the hip drops, your glute medius needs more work', 'Stay on the ball of the foot during the pause'],
    common_mistakes: ['Allowing the hip to drop on the non-stance side', 'Locking the knee straight during the pause — maintain a soft bend'],
  },

  'RF-EX-050': {
    purpose: 'Trains trunk rotation control during running — prevents excessive torso rotation that can stress the RF.',
    instructions: [
      'Walk or jog, focusing on keeping the shoulders square relative to the hips.',
      'Arms should drive forward and backward — not across the body.',
      'Monitor for any twisting of the trunk.',
    ],
    coaching_cues: ['Imagine a line between your nipples — keep it facing forward while arms pump', 'Arms drive straight, not across the body'],
    common_mistakes: ['Crossing the arms across the midline, which forces trunk rotation', 'Swinging the arms too wide, creating lateral sway'],
  },

  'RF-EX-086': {
    purpose: 'Full-range squat in a supported context — targets full ROM quad loading.',
    instructions: [
      'Use a squat rack with safety bars or a goblet position for balance.',
      'Lower into the deepest comfortable squat, allowing natural ankle and hip movement.',
      'Drive back to standing, maintaining chest-up posture.',
    ],
    coaching_cues: ['Only go as deep as you can maintain a neutral lumbar spine', 'Use support (goblet hold or TRX) to focus on depth rather than balance'],
    common_mistakes: ['Butt-winking (pelvis tucking under) in deep squat — reduce depth or improve hip mobility first', 'Heels lifting — elevate slightly on a wedge if needed'],
  },

  'RF-EX-087': {
    purpose: 'General gym-based loading for injury-adjacent muscle groups — maintains overall athletic strength.',
    instructions: [
      'Complete standard compound or machine exercises for non-injured limbs and upper body.',
      'Use this as an opportunity to maintain overall strength while lower limb capacity is building.',
      'Focus on technique and do not push beyond comfortable exertion.',
    ],
    coaching_cues: ['Maintenance, not max effort — leave 3–4 reps in reserve on every set', 'Prioritize exercises that do not directly load the injured thigh'],
    common_mistakes: ['Pushing too hard on training that directly stresses the injured tissue', 'Skipping this entirely — general fitness supports recovery'],
  },

  'RF-EX-021': {
    purpose: 'Core stability with running-pattern hip flexion — simulates the cyclic hip drive of running without impact.',
    instructions: [
      'Start in a push-up position with sliders under your feet.',
      'Slowly drive one knee toward the chest, sliding the foot forward.',
      'Return and alternate. Maintain a rigid plank position throughout.',
    ],
    coaching_cues: ['Hips must stay level and still — no bouncing or rocking', 'Pull the knee to the chest with the hip flexors, not by lifting the hip'],
    common_mistakes: ['Hips rising or dropping during the movement', 'Moving too fast — control the hip flexion on every rep'],
  },

  'RF-EX-083': {
    purpose: 'General bodyweight conditioning — maintains cardiovascular fitness and upper-body strength during lower-limb recovery.',
    instructions: [
      'Perform a circuit of upper-body and core bodyweight exercises (push-ups, dips, pull-ups, plank variations).',
      'Keep rest between exercises short (30–45 seconds) to maintain an elevated heart rate.',
      'Modify or skip any exercise that requires direct loading of the injured thigh.',
    ],
    coaching_cues: ['Focus on upper-body and core work — your lower limb is doing enough in the targeted rehab exercises', 'Maintain quality — this is not a sloppy rush-through'],
    common_mistakes: ['Including exercises that load the injured thigh (e.g., burpees) too early', 'Treating this as lower priority — it keeps your system fit and makes return to sport easier'],
  },

  // ─── TRANSITION ───────────────────────────────────────────────────────────

  'RF-EX-054': {
    purpose: 'Re-introduce running at speed over very short distances — manages tissue load while building tolerance.',
    instructions: [
      'Mark out 20–40m on a flat surface.',
      'Accelerate to ~75% of your maximum speed, then decelerate naturally.',
      'Walk back to the start (full recovery between each run).',
      'Monitor for any anterior thigh pain or tightness.',
    ],
    coaching_cues: ['75% is faster than a jog but controlled — you should feel in control at all times', 'Normal running mechanics — do not run cautiously with a short stride'],
    common_mistakes: ['Running too fast too soon — sprint speed comes later', 'Not allowing full recovery between runs'],
  },

  'RF-EX-055': {
    purpose: 'Build running volume at sub-maximal intensity — develops aerobic capacity and tissue tolerance over longer efforts.',
    instructions: [
      'Run continuously for 60–100m at 60–70% effort.',
      'Focus on maintaining relaxed running mechanics throughout.',
      'Rest fully (2–3 minutes) between runs.',
    ],
    coaching_cues: ['Relaxed face, relaxed shoulders — tension is inefficient and fatiguing', 'Keep a consistent pace — do not start too fast and fade'],
    common_mistakes: ['Going out too fast and compensating at the end with poor mechanics', 'Running through anterior thigh discomfort without monitoring'],
  },

  'RF-EX-056': {
    purpose: 'Introduce the acceleration phase of sprinting — highest RF demand in early transition phase.',
    instructions: [
      'Start from a standing position or a 2-point start.',
      'Accelerate hard over 0–30m, then decelerate to a walk.',
      'Begin at 70%, build to 85% over sessions — max speed comes in Simulation.',
    ],
    coaching_cues: ['Drive forward with a slight forward lean in the first 10m, then gradually rise', 'Powerful arm drive — the arms set the cadence'],
    common_mistakes: ['Starting too upright — lean forward in the first 10m to accelerate', 'Over-striding — quick, powerful steps rather than long floaty ones'],
  },

  'RF-EX-052': {
    purpose: 'Trains the ability to absorb speed safely — eccentric loading of the quad and posterior chain during braking.',
    instructions: [
      'Jog at moderate pace, then on a signal (or after a marked distance), decelerate to a stop as quickly as possible.',
      'Absorb the deceleration by flexing the hips, knees, and ankles — like a controlled landing.',
      'Start with planned deceleration, progress to reactive/unplanned.',
    ],
    coaching_cues: ['Low hips on the braking steps — do not stay tall and brake with straight legs', 'Multiple short braking steps are safer than one big plant-and-stop'],
    common_mistakes: ['Braking with stiff, nearly straight legs — this puts massive load on the quad', 'Planting one foot hard and rotating — this creates lateral knee stress'],
  },

  'RF-EX-053': {
    purpose: 'Controlled change of direction — introduces lateral deceleration and re-acceleration patterns.',
    instructions: [
      'Set up two cones 5m apart.',
      'Run to one cone, decelerate, plant, and change direction to the other cone.',
      'Start at 50–60% effort, focusing entirely on technique.',
    ],
    coaching_cues: ['The penultimate step (second-to-last before the turn) is the key — that\'s where you prepare the brake', 'Low centre of gravity at the turn — bend the knees, do not stay tall'],
    common_mistakes: ['Turning at too high a speed before technique is sound — injury risk increases sharply', 'Insufficient knee bend at the plant — straight-leg planting transfers force dangerously'],
  },

  'RF-EX-097': {
    purpose: 'Eccentric quad loading through backward sled dragging — specific to deceleration biomechanics.',
    instructions: [
      'Attach a sled harness to your waist.',
      'Walk/jog backward, feeling the pull of the sled resisting your backward movement.',
      'Keep the trunk upright and take controlled backward steps.',
      'Build load gradually over sessions.',
    ],
    coaching_cues: ['Stay upright — do not lean back into the sled', 'Drive through the mid-foot on each backward step'],
    common_mistakes: ['Adding too much weight too soon', 'Leaning excessively backward and reducing the lower-limb eccentric component'],
  },

  'RF-EX-098': {
    purpose: 'Hip extension power and conditioning — builds concentric power and cardiovascular fitness simultaneously.',
    instructions: [
      'Grip the sled handles and lean into the sled at ~45°.',
      'Drive the sled forward with powerful, alternating leg drives.',
      'Keep a rigid torso — the push comes from the legs and hips, not the arms.',
    ],
    coaching_cues: ['Lean into the sled from the ankles — stay rigid like a plank at an angle', 'Short, powerful strides — not long, slow shuffles'],
    common_mistakes: ['Bending at the hips instead of maintaining an angled body position', 'Using arms to push the sled rather than driving with the legs'],
  },

  'RF-EX-057': {
    purpose: 'Re-introduce landing mechanics — teaches controlled deceleration of body weight through bilateral lower limb.',
    instructions: [
      'Step off a small box (20–30cm) and land on both feet simultaneously.',
      'Land soft: hips and knees bend on contact to absorb the force.',
      'Stick the landing for 2–3 seconds before relaxing.',
    ],
    coaching_cues: ['Land as quietly as possible — the sound of impact tells you how much you are absorbing', 'Hips sit back, knees track over toes on landing'],
    common_mistakes: ['Landing stiff-legged with locked knees — high joint loading', 'Landing with knees caving inward, especially when fatigued'],
  },

  'RF-EX-058': {
    purpose: 'Single-leg landing mechanics — higher unilateral demand, specific to deceleration from jumping in sport.',
    instructions: [
      'Step off a small box and land on one foot.',
      'Absorb the landing through hip and knee flexion.',
      'Stick the landing for 3 seconds, maintaining knee alignment and balance.',
      'Start with small height (20cm) and build.',
    ],
    coaching_cues: ['Soft landing — absorb, do not stiffen', 'The knee must track over the toe — not fall inward'],
    common_mistakes: ['Landing on a stiff leg', 'Knee diving inward — a sign of hip weakness or poor proprioception'],
  },

  // [BARONI_2024] Pereira et al. J Sport Rehabil 2024;33(8):646. doi:10.1123/jsr.2023-0431.
  // Provides comparable (not superior) eccentric quad activation vs. squat-based exercises.
  'RF-EX-013': {
    purpose: 'Advanced eccentric quad loading — highest eccentric RF exercise in the program. Eccentric quadriceps activation is comparable to squat-based exercises (Baroni et al. J Sport Rehabil 2024); included for variety and specificity, not because it uniquely outperforms all alternatives.',
    instructions: [
      'Kneel on padding, ankles secured under a bar or by a partner.',
      'Keeping the body as a rigid unit from knee to shoulder, lean backward as slowly as possible.',
      'Go as far as you can maintain control, then use hands to catch and push back to upright.',
    ],
    coaching_cues: ['The slower you go, the better — aim for 3–5 full seconds per rep', 'Like a falling tree — one rigid plank, not a fold at the hip'],
    common_mistakes: ['Folding at the hips to make it easier', 'Going too far before building the necessary quad strength — partial range with control is superior'],
  },

  'RF-EX-102': {
    purpose: 'Machine-assisted eccentric hip flexor loading — safer, more progressive version of the unsupported lowering.',
    instructions: [
      'Use a cable or machine to assist the return (concentric) phase.',
      'Slowly lower the leg from hip height to the start position over 5–8 seconds.',
      'Use the machine to return to the start and repeat.',
    ],
    coaching_cues: ['The machine does the lifting — you do the lowering slowly and under complete control', 'Maintain a neutral pelvis throughout'],
    common_mistakes: ['Using the machine for the lowering too — resist and control the lowering yourself', 'Moving too fast — the eccentric load comes from time under tension'],
  },

  'RF-EX-104': {
    purpose: 'Quad-dominant exercise with the knee travelling well beyond the toes — specific load for the distal quadriceps.',
    instructions: [
      'Stand on the balls of your feet, holding a support lightly.',
      'Simultaneously lean backward at the ankles while bending the knees.',
      'The knees travel forward; the torso leans back — the body pivots around the knee.',
      'Lower as far as possible, then drive back to standing.',
    ],
    coaching_cues: ['This is an intentionally quad-heavy exercise — that is the point', 'Stay on the balls of the feet throughout'],
    common_mistakes: ['Dropping the heels to the floor', 'Trying to keep the shins vertical — that eliminates the exercise\'s purpose'],
  },

  'RF-EX-105': {
    purpose: 'High knee-flexion angle squat with controlled anterior knee position — specific for patellar/quad tendon loading.',
    instructions: [
      'Set up a band around a post at about knee height. Step into the band, placing it behind your knees.',
      'Squat as deeply as possible, letting the band support the knees in a forward position.',
      'Drive back to standing.',
    ],
    coaching_cues: ['Use the band tension to sit back and down — the band is your guide', 'Chest up and back flat throughout the squat'],
    common_mistakes: ['Not sinking deep enough — the exercise requires substantial depth to be effective', 'Using too light a band, which offers no knee support'],
  },

  'RF-EX-037': {
    purpose: 'Introduce explosive hip extension — the first plyometric in the program, safe and well-supported.',
    instructions: [
      'Start in a standard glute bridge position.',
      'Drive the hips up explosively, briefly leaving the ground at the peak.',
      'Land softly on both feet with hips low.',
    ],
    coaching_cues: ['The drive must be through the heels and glutes — not the toes', 'Land with hip and knee flexion — absorb, do not crash'],
    common_mistakes: ['Pushing through toes rather than heels', 'Landing with stiff hips and knees'],
  },

  'RF-EX-038': {
    purpose: 'Explosive hip thrust from a bench — develops posterior chain power and introduces plyometric demand in a supported position.',
    instructions: [
      'Set up for a hip thrust with upper back on a bench.',
      'Drive the hips explosively upward, allowing the hips to briefly leave the bench contact.',
      'Land through the heels and absorb by lowering the hips under control.',
    ],
    coaching_cues: ['Maximum glute squeeze at the top of each explosive rep', 'The landing should be controlled — not a drop back to the bench'],
    common_mistakes: ['Using so much momentum the hips go past neutral (hyperextension)', 'Crashing through the landing instead of absorbing it'],
  },

  'RF-EX-029': {
    purpose: 'Dynamic hip mobility warm-up — prepares the hip for high-speed running and kicking patterns.',
    instructions: [
      'Hold a wall or post for support. Swing one leg forward and backward in a relaxed arc.',
      'Let momentum carry the leg — do not force range beyond what the movement naturally allows.',
      'Gradually increase the arc over 15–20 swings.',
    ],
    coaching_cues: ['Relaxed swing — let the leg be a pendulum', 'Keep the trunk upright — do not lean away from the swing'],
    common_mistakes: ['Forcing range at the end of the swing', 'Twisting the trunk instead of isolating hip movement'],
  },

  'RF-EX-026': {
    purpose: 'Deep hip flexor stretch in maximum knee flexion — higher demand on the RF than the Foundation version.',
    instructions: [
      'Kneel on the injured leg with the foot dorsiflexed behind you.',
      'The injured knee is at maximum comfortable flexion.',
      'From this position, perform a posterior pelvic tilt (tuck pelvis under).',
      'Hold the stretch for 2–3 seconds.',
    ],
    coaching_cues: ['Greater knee flexion = more RF stretch — build this range gradually', 'Do not force knee flexion beyond what is comfortable — graded exposure'],
    common_mistakes: ['Forcing the knee into maximum flexion before the tissue is ready', 'Forgetting the pelvic tilt — without it, you do not achieve full RF stretch'],
  },

  'RF-EX-028': {
    purpose: 'Dynamic hamstring mobility using a fitball — dynamic warm-up for high-speed running and kicking.',
    instructions: [
      'Lie on your back, one heel resting on a fitball.',
      'Roll the ball away (extending the hip and knee) and back (flexing them) in a smooth arc.',
      'Alternate or stay on the same side as prescribed.',
    ],
    coaching_cues: ['Keep the movement fluid and rhythmical — this is active ROM, not static holding', 'Press the heel slightly into the ball throughout to activate the hamstring'],
    common_mistakes: ['Passively resting on the ball without active engagement', 'Rolling too fast and losing control of the range'],
  },

  // ─── SIMULATION ───────────────────────────────────────────────────────────

  'RF-EX-073': {
    purpose: 'Introduce position-specific and sport-specific running patterns — preparing the tissue for game demands.',
    instructions: [
      'Perform running patterns specific to your sport position (backward running, lateral shuffles, cross-over runs).',
      'Build up to 80–90% of sport-speed over the session.',
      'Integrate rest intervals matching typical sport demands.',
    ],
    coaching_cues: ['Focus on technical quality of each pattern before adding speed', 'Monitor the anterior thigh after each change of pattern'],
    common_mistakes: ['Skipping the warm-up before sport-specific patterns', 'Adding too many patterns in a single session before tissue tolerance is confirmed'],
  },

  'RF-EX-074': {
    purpose: 'Combine straight-line, curved, and directional running — builds multi-planar tissue tolerance.',
    instructions: [
      'Design a running circuit that includes straight-line accelerations, gentle curves, lateral movements, and backward jogging.',
      'Complete 15–20 minutes of mixed running.',
    ],
    coaching_cues: ['Allow the patterns to flow naturally — do not make abrupt transitions before tolerance is confirmed', 'Stay at 70–80% effort for the full circuit'],
    common_mistakes: ['Adding maximum-speed efforts before the mixed-pattern volume base is built', 'Neglecting the backward and lateral components — they are the most revealing for tissue status'],
  },

  'RF-EX-075': {
    purpose: 'Running at >85% maximum speed — the most specific tissue load for return to sprint sport.',
    instructions: [
      'After a thorough warm-up, complete high-speed runs at 85–95% effort.',
      'Start with 3–4×40m at 85%, building across sessions toward 95%.',
      'Full recovery (3–5 minutes) between runs.',
    ],
    coaching_cues: ['Do not sacrifice mechanics for speed — if mechanics break down, the speed is too high', 'Focus on a relaxed, efficient stride — tensing slows you down and increases injury risk'],
    common_mistakes: ['Going to 100% too soon — build incrementally through the speed zones', 'Short recovery intervals that prevent true high-speed production'],
  },

  'RF-EX-076': {
    purpose: 'Maximum-effort sprinting — final stage of running progression before full return to sport.',
    instructions: [
      'After extensive warm-up and sub-maximal runs, complete 1–3×30–40m at near-maximum effort.',
      'The first sprint at 90%, then build to 100% if symptom-free.',
      '5-minute full recovery between efforts.',
    ],
    coaching_cues: ['Relax the face and hands at maximum speed — tension is your enemy', 'Maximum speed is achieved by pulling the ground behind you, not reaching forward'],
    common_mistakes: ['Maximal sprinting without adequate warm-up and sub-maximal exposure first', 'Not completing enough sub-maximal volume before adding max-speed runs'],
  },

  'RF-EX-051': {
    purpose: 'Develop first-step explosiveness and acceleration mechanics — specific to the demand of sport.',
    instructions: [
      'Use various start positions (standing, split stance, 3-point).',
      'Accelerate explosively over the first 20m.',
      'Focus on the forward lean and powerful first steps before gradually rising.',
    ],
    coaching_cues: ['Stay low for the first 10m — gradual rise, not immediate upright', 'Powerful arm drive — the first step is the most important'],
    common_mistakes: ['Rising to an upright position too quickly, reducing mechanical advantage', 'Cross-stepping (feet crossing the midline) during the first steps'],
  },

  'RF-EX-045': {
    purpose: 'Power and reactive strength development — demands maximal hip extension and dynamic RF loading.',
    instructions: [
      'Push off one leg into a long, low bound to the other leg.',
      'Each landing should absorb smoothly into the next push-off.',
      'Focus on maximising the distance of each bound rather than the height.',
    ],
    coaching_cues: ['Drive the knee of the recovery leg high forward as you push off', 'Land mid-foot, absorb, and immediately transition into the next push'],
    common_mistakes: ['Landing stiff-legged instead of absorbing into the next push', 'Bounding too high — horizontal power is the goal, not vertical jump height'],
  },

  'RF-EX-059': {
    purpose: 'Bilateral lower-body power — introduces vertical plyometric loading and landing mechanics.',
    instructions: [
      'Stand with feet shoulder-width apart. Lower into a half-squat.',
      'Explode upward, reaching for maximum height.',
      'Land softly, absorbing through hips and knees into the quarter-squat position.',
    ],
    coaching_cues: ['Drive through the full foot at take-off — do not push only through the toes', 'Soft landing — land like a cat, not a thunderstorm'],
    common_mistakes: ['Landing stiff-legged with insufficient knee and hip flexion', 'Knees caving on landing, especially when fatigued'],
  },

  'RF-EX-060': {
    purpose: 'Reactive single-leg power and stiffness — develops the ability to produce and absorb force on one leg.',
    instructions: [
      'Hop forward on one leg, maintaining consistent distance and rhythm.',
      'Emphasise a stiff ankle on contact and a rapid ground-contact time.',
      'Land and immediately rebound — do not pause between contacts.',
    ],
    coaching_cues: ['Think "hot ground" — get off the floor as fast as possible', 'Minimal ground contact time is the goal'],
    common_mistakes: ['Long, slow ground contacts — this reduces the plyometric stimulus', 'Hopping on a bent ankle rather than a stiff springboard ankle'],
  },

  'RF-EX-061': {
    purpose: 'Explosive power — utilises the stretch-shortening cycle for maximal force production.',
    instructions: [
      'Stand tall. Quickly dip into a quarter-squat and immediately explode upward.',
      'Arms drive upward to assist.',
      'Land softly, absorbing through full lower-limb chain.',
    ],
    coaching_cues: ['The dip and the jump are one seamless movement — no pause at the bottom', 'Full arm swing adds 10–15% to jump height — use it'],
    common_mistakes: ['Pausing at the bottom of the dip (converts it from a CMJ to a static jump)', 'Landing without adequate joint flexion'],
  },

  'RF-EX-062': {
    purpose: 'Maximal reactive strength — most demanding plyometric; challenges RF to rapidly decelerate and re-accelerate.',
    instructions: [
      'Stand on a box (30–40cm). Step off and react upon landing — immediately jump as high as possible.',
      'Minimise time on the ground — the signal is to jump, not to pause.',
    ],
    coaching_cues: ['Minimal ground contact — aim to be off the ground within 0.2 seconds of landing', 'Only use this when single-leg landing mechanics are perfect at lower loads'],
    common_mistakes: ['Taking too long on the ground (converts it from reactive to loaded jump)', 'Performing drop jumps before landing mechanics are solid'],
  },

  'RF-EX-063': {
    purpose: 'Reactive agility — combines lower-limb power with upper-body and visual stimulus responses.',
    instructions: [
      'A partner or coach gives a random signal (verbal or visual). React with a predetermined movement pattern (sprint, jump, cut).',
      'Focus on reaction speed, not just movement quality.',
    ],
    coaching_cues: ['Keep the weight on the balls of the feet in a ready position before each signal', 'React, do not anticipate — true reactive training requires surprise'],
    common_mistakes: ['Anticipating the signal rather than truly reacting', 'Using only one type of reaction — vary directions and movement types'],
  },

  'RF-EX-064': {
    purpose: 'Early plyometric — introduces bilateral and unilateral hopping with minimal load.',
    instructions: [
      'Hop lightly in place or over a small line on both feet, then transition to single-leg hopping.',
      'Keep height very small — this is a neural warm-up and tissue check, not maximum effort.',
    ],
    coaching_cues: ['Small and controlled — the height is less important than the quality of each contact', 'Stay on the balls of the feet throughout'],
    common_mistakes: ['Going too high before tissue tolerance is confirmed', 'Letting the heels contact the floor during the sequence'],
  },

  'RF-EX-106': {
    purpose: 'Plyometric power in a lunge pattern — alternating-leg explosive movement specific to changing direction and kicking.',
    instructions: [
      'Lower into a lunge. Explosively jump upward and switch legs in mid-air.',
      'Land in the opposite lunge position and immediately jump again.',
      'Build to a continuous alternating-leg rhythm.',
    ],
    coaching_cues: ['Soft landing — absorb through the hip and knee', 'Arms drive upward to assist with height'],
    common_mistakes: ['Landing with stiff, locked knees', 'Not switching both legs fully — a partial switch reduces the plyometric demand and increases asymmetry'],
  },

  'RF-EX-065': {
    purpose: 'Introduce the kicking pattern without a ball — activates the hip flexors through the full ROM of a kick.',
    instructions: [
      'Stand on the non-kicking leg. Swing the kicking leg through the full range of a kick — from hip extension to hip flexion/knee extension.',
      'Keep the movement controlled — this is a pattern drill, not a strike.',
    ],
    coaching_cues: ['Feel the hip flexors driving the knee forward, then the quad extending through the strike phase', 'Relax the hip flexors as you swing through — tension reduces technique'],
    common_mistakes: ['Kicking with tension instead of a relaxed, whip-like motion', 'Short-arcing the swing — you want full hip extension to full hip flexion'],
  },

  'RF-EX-066': {
    purpose: 'Kicking from a static, supported position — reduces balance demand while introducing the RF to the kicking load.',
    instructions: [
      'Hold a post or wall. Kick a stationary ball or practice the motion against a target.',
      'Focus on technique — backswing, contact point, follow-through.',
      'Gradually increase effort from 50% to 80% over the session.',
    ],
    coaching_cues: ['Support gives you freedom to focus on kick mechanics, not balance', 'A full follow-through is important — stopping abruptly after contact stresses the RF'],
    common_mistakes: ['Kicking at full effort immediately — build from 50%', 'Stopping the swing at contact instead of following through'],
  },

  'RF-EX-067': {
    purpose: 'Kicking without support at moderate effort — integrates balance, approach, and technique.',
    instructions: [
      'Approach a ball from a natural angle. Kick at 60–75% of your maximum effort.',
      'Focus on a full, fluid motion from backswing through follow-through.',
      'Monitor the front of the thigh — mild pulling is acceptable; sharp pain is not.',
    ],
    coaching_cues: ['A relaxed, fluid kick generates more power than a tense, forced one', 'Plant the non-kicking foot in your natural position — where you would normally plant in a game'],
    common_mistakes: ['Kicking at maximum effort before the previous session was well-tolerated', 'Tense approach and strike — tension reduces power and increases RF stress'],
  },

  'RF-EX-068': {
    purpose: 'Kicking against resistance — challenges the hip flexors and quad under increased load.',
    instructions: [
      'Attach a resistance band to the ankle of the kicking foot.',
      'The band resists the forward swing of the kick.',
      'Kick through the resistance, maintaining technique.',
    ],
    coaching_cues: ['The resistance should be light enough that technique is maintained', 'Focus on the hip drive — the band is resisting the hip flexion, not just the knee extension'],
    common_mistakes: ['Using too much resistance, which changes the mechanics of the kick', 'Compensating for the band by tilting the trunk excessively'],
  },

  'RF-EX-069': {
    purpose: 'Integrate kicking into passing, shooting, and crossing patterns — sport-specific tissue loading.',
    instructions: [
      'Perform realistic ball-work drills: short passes, long balls, crossing, shooting.',
      'Build from low-intensity to match-intensity over the session.',
      'Include varied distances and angles to challenge the RF across its full range of use.',
    ],
    coaching_cues: ['Game-realistic technique throughout — you are training for the game', 'Communicate any discomfort immediately — do not push through sharp anterior thigh pain'],
    common_mistakes: ['Treating this as a ball-skills session and increasing effort beyond the prescribed level', 'Avoiding long-range kicks (most demanding on the RF) indefinitely'],
  },

  'RF-EX-107': {
    purpose: 'Blood-flow restriction training — allows strength stimulus with very low absolute loads, protecting the tissue while maintaining hypertrophy.',
    instructions: [
      'Apply the BFR wrap to the upper thigh — follow the prescribed wrap pressure.',
      'Perform the designated exercise at very low load (20–30% of maximum).',
      'High repetitions with short rest (30s between sets).',
      'Remove the wrap immediately if pain, numbness, or unusual discomfort occurs.',
    ],
    coaching_cues: ['BFR requires very light resistance — do not increase the load to "feel it more"', 'The burning sensation in the muscle is expected — that is the metabolic stimulus'],
    common_mistakes: ['Applying the wrap too tightly', 'Resting too long between sets — BFR effectiveness relies on minimal rest'],
  },

  'RF-EX-084': {
    purpose: 'Isokinetic quad strength assessment and training — provides objective strength measurement and controlled eccentric loading.',
    instructions: [
      'Sit in the isokinetic dynamometer with the shin pad above the ankle.',
      'Perform knee extension-flexion at the prescribed speed.',
      'Match the target force on the display if available.',
    ],
    coaching_cues: ['Maintain consistent effort on every rep — isokinetic testing is only valid with maximum effort', 'Do not hold your breath during maximal contractions'],
    common_mistakes: ['Sub-maximal effort on testing reps — this gives a false reading', 'Not setting up correctly — positioning on the machine directly affects the result'],
  },

  // ─── RESILIENCE ───────────────────────────────────────────────────────────

  'RF-EX-070': {
    purpose: 'Game-integrated kicking under decision-making pressure — the final step before full match exposure.',
    instructions: [
      'Set up reactive kicking scenarios: passes to target, volleys, crossing under defensive pressure.',
      'Practice at full match intensity with realistic time pressure.',
    ],
    coaching_cues: ['This must feel like a real game moment — make it competitive', 'Monitor tissue response not just during but 24 hours after each session'],
    common_mistakes: ['Practicing isolated kicks without game-realistic timing and pressure', 'Not monitoring the 24-hour response — a good immediate response does not guarantee the tissue is ready'],
  },

  'RF-EX-071': {
    purpose: 'Full team training integration — the tissue is now being tested under the full and unpredictable demands of sport.',
    instructions: [
      'Participate in modified team training drills (small-sided games, positional drills).',
      'Communicate with staff about any sensations during or after.',
      'Build from partial participation to full participation across sessions.',
    ],
    coaching_cues: ['Be honest about symptoms — this is not the time to push through without reporting', 'Match effort and intensity to team training — do not hold back artificially'],
    common_mistakes: ['Participating at full intensity too soon — build session by session', 'Not communicating symptoms to medical staff during training'],
  },

  'RF-EX-072': {
    purpose: 'Sport-specific ball-work under physical demand — maintains technical quality while adding conditioning load.',
    instructions: [
      'Complete ball-work drills at match-realistic intensity and under physical fatigue.',
      'Include dribbling, receiving, passing, and shooting under match conditions.',
    ],
    coaching_cues: ['Technical quality should be maintained even when fatigued — if it deteriorates, you have reached your limit for today', 'The ball is the motivator — use the joy of play to keep intensity high'],
    common_mistakes: ['Treating this as a rest period within team training', 'Avoiding demanding kicking patterns (long-range, driven crosses) rather than building toward them'],
  },

  'RF-EX-077': {
    purpose: 'Reactive agility in a game-realistic context — the final confirmation of multi-directional tissue readiness.',
    instructions: [
      'Perform unplanned agility drills: reacting to ball, opponent, or coach signals.',
      'Include cutting, turning, jumping, and sprinting within the same drill.',
    ],
    coaching_cues: ['Full reactive intensity — the goal is unpredictable, match-realistic loads', 'Monitor foot mechanics and knee alignment during every cut and change of direction'],
    common_mistakes: ['Only practicing planned agility — sport is unplanned, so training must include reactive elements', 'Not progressing to maximum-effort unplanned agility before declaring RTS readiness'],
  },
};

/**
 * Session tier structure by phase.
 * Each phase has 3 entries (early/mid/late) that define which blocks are used,
 * how many exercises to pick from each block, and the dosage for that tier.
 */
export const SESSION_TIER_STRUCTURE = {

  // Exercise TYPES and DOSAGES for Foundation: [PMC11338860] Table 1 (Phase 1, 12 exercises).
  // Pain threshold VAS ≤3 during all exercises: [PMC11338860].
  //
  // TIER MEANING: each tier = one WEEK of Foundation, not one session within a week.
  //   All 3 sessions in a given week use the same tier.
  //   Tier advances week-by-week based on days_since_injury + severity band.
  //
  // IMPORTANT — WHAT IS AND IS NOT CITED:
  //   CITED:   Exercise types (mobility, isometric, glute, plank) and their dosages come from
  //            PMC11338860 Table 1 Phase 1, which prescribes all 12 exercises from day 5.
  //   NOT CITED (BETA): The week-by-week exercise count ramp (3→5→8) has no published source.
  //            PMC11338860 does not sub-divide Phase 1 by week with different counts.
  //            Our ramp is a conservative adaptation for unsupervised use. [BETA_SUBPHASE_PROGRESSION]
  foundation: [
    {
      tier: 'early',
      session_title: 'Foundation — Week 1',
      // Bayer 2017: days 2–4 post-injury = mobility/ROM only before introducing any tissue loading.
      // PMC11338860 Phase 1 starts ALL exercises at day 5 (supervised) — our early tier mirrors the
      // sub-day-5 window and restricts to gentle mobility + circulation only.
      // No tissue_specific_loading (isometric) until the mid tier (days 5+).
      // [BETA_SUBPHASE_PROGRESSION] — conservative adaptation for unsupervised use.
      description: 'Acute-to-sub-acute transition. Gentle mobility and circulation only — no loading yet. '
        + 'This is physiotherapy territory — if you have not seen a physiotherapist, please do so. '
        + 'These exercises supplement hands-on care; they do not replace it.',
      physio_disclaimer: true,
      blocks: [
        // [PMC11338860] Phase 1: prone quad / supine hamstring mobility (pain-free range only)
        // Bayer 2017: ROM exercises appropriate from day 2 onwards; no loading until day 5+.
        { block: 'mobility_activation',     count: 2, dosage: { sets: '1',   reps_or_hold: '8–10 slow reps',     rest: 'as needed', intensity: 'pain-free range only — stop at any discomfort', tempo: 'slow and gentle' } },
        // Gentle circulation — short walk only, no resistance
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '10 min gentle walk', rest: 'n/a',       intensity: 'easy — RPE 1–2',                                 tempo: 'comfortable pace' } },
      ]
    },
    {
      tier: 'mid',
      session_title: 'Foundation — Week 2',
      description: 'Sub-acute loading. Volume builds to 5 exercises. Mobility increases, first proximal support work introduced. '
        + 'All movement must stay within VAS ≤3 (mild discomfort only).',
      physio_disclaimer: false,
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '12–15 min easy walk or cycle', rest: 'n/a',   intensity: 'easy — RPE 2',         tempo: 'comfortable'   } },
        // [PMC11338860] Phase 1: prone quad 2×8, supine hamstring 2×8
        { block: 'mobility_activation',     count: 2, dosage: { sets: '1–2', reps_or_hold: '8–10 slow reps',               rest: 'short', intensity: 'pain-free range only', tempo: 'slow and gentle' } },
        // [PMC11338860] Phase 1: isometric hip flexion 3×5 (3s hold)
        { block: 'tissue_specific_loading', count: 1, dosage: { sets: '3',   reps_or_hold: '5 reps × 3–5s hold',           rest: '45s',   intensity: 'very light — RPE 2–3', tempo: 'controlled hold' } },
        // [PMC11338860] Phase 1: glute bridge 3×6
        { block: 'strength_support',        count: 1, dosage: { sets: '2',   reps_or_hold: '8–10 reps',                    rest: '60s',   intensity: 'light — RPE 3',        tempo: 'controlled'      } },
      ]
    },
    {
      tier: 'late',
      session_title: 'Foundation — Week 3+',
      description: 'Full Foundation block. Volume at 8 exercises — two isometrics, two mobility, two proximal support, planks introduced. '
        + 'Approaching Reload readiness. Pain must stay VAS ≤3 throughout.',
      physio_disclaimer: false,
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '15 min easy–moderate pace',    rest: 'n/a',   intensity: 'easy–moderate — RPE 3',  tempo: 'comfortable'   } },
        // [PMC11338860] Phase 1: prone quad 2×8, supine hamstring 2×8
        { block: 'mobility_activation',     count: 2, dosage: { sets: '2',   reps_or_hold: '10–12 controlled reps',        rest: 'short', intensity: 'full comfortable range',  tempo: 'slow–moderate' } },
        // [PMC11338860] Phase 1: isometric hip flexion 3×5 (3s), knee extension 3×6
        { block: 'tissue_specific_loading', count: 2, dosage: { sets: '3',   reps_or_hold: '6–8 reps × 3–5s hold',        rest: '45s',   intensity: 'light — RPE 3–4',        tempo: 'controlled'    } },
        // [PMC11338860] Phase 1: glute bridge 3×6, side-lying abduction 3×8, clamshells 3×8
        { block: 'strength_support',        count: 2, dosage: { sets: '2–3', reps_or_hold: '10 reps',                      rest: '60s',   intensity: 'light — RPE 3',          tempo: 'controlled'    } },
        // [PMC11338860] Phase 1: side plank 2×5 (6s hold), front plank 2×5 (6s hold)
        { block: 'control_balance',         count: 1, dosage: { sets: '2',   reps_or_hold: '5 reps × 6s hold',             rest: '60s',   intensity: 'light',                  tempo: 'steady hold'   } },
      ]
    },
  ],

  // Exercise selection: [PMC11338860] Phase 2 (half-kneeling hip flexion 3×5, inclined trunk 3×5,
  //   lateral walk 4×10m, unilateral thrust 3×8, step-up 3×6, Pallof press 3×5).
  // Eccentric dosage (3s tempo): [HICKEY_2022] principle; specific numbers [BETA_ECCENTRIC_DOSAGE].
  reload: [
    {
      tier: 'early',
      session_title: 'Reload — Session 1',
      description: 'First active loading. Through-range hip flexion + quad loading + proximal strength.',
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '15 min — bike or elliptical', rest: 'n/a',  intensity: 'easy–moderate — RPE 3',  tempo: 'comfortable'        } },
        { block: 'mobility_activation',     count: 1, dosage: { sets: '2',   reps_or_hold: '10–12 controlled reps',       rest: 'short', intensity: 'full range',             tempo: 'slow'               } },
        // [PMC11338860] Phase 2 hip flexion series; 3s eccentric tempo [BETA_ECCENTRIC_DOSAGE]
        { block: 'tissue_specific_loading', count: 3, dosage: { sets: '3',   reps_or_hold: '10 reps',                     rest: '60s',  intensity: 'moderate — RPE 4–5',     tempo: 'controlled, 3s down' } },
        // [PMC11338860] Phase 2 proximal strength: unilateral thrust 3×8, step-up 3×6
        { block: 'strength_support',        count: 3, dosage: { sets: '3',   reps_or_hold: '10 reps',                     rest: '60s',  intensity: 'moderate — RPE 5',       tempo: 'controlled'          } },
        // [BETA_PLANK_PROGRESSION] Reload+ plank dosage
        { block: 'control_balance',         count: 1, dosage: { sets: '2–3', reps_or_hold: '10–12 reps or 30s',           rest: '45s',  intensity: 'light–moderate',         tempo: 'steady'              } },
      ]
    },
    {
      tier: 'mid',
      session_title: 'Reload — Session 2',
      description: 'Higher volume. More hip flexor variety + more strength work.',
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '15–20 min',                   rest: 'n/a',  intensity: 'moderate — RPE 4',       tempo: 'comfortable'          } },
        { block: 'mobility_activation',     count: 1, dosage: { sets: '2',   reps_or_hold: '12 reps',                     rest: 'short', intensity: 'full range',             tempo: 'dynamic'              } },
        { block: 'tissue_specific_loading', count: 4, dosage: { sets: '3',   reps_or_hold: '10–12 reps',                  rest: '60s',  intensity: 'moderate — RPE 5',       tempo: '3s eccentric'         } },
        { block: 'strength_support',        count: 4, dosage: { sets: '3',   reps_or_hold: '10–12 reps',                  rest: '60s',  intensity: 'moderate — RPE 5',       tempo: 'controlled'           } },
        { block: 'control_balance',         count: 2, dosage: { sets: '3',   reps_or_hold: '10 reps or 30–40s',           rest: '45s',  intensity: 'moderate',               tempo: 'steady'               } },
      ]
    },
    {
      tier: 'late',
      session_title: 'Reload — Session 3',
      description: 'Reload peak. Maximum volume. Approaching Accumulation readiness.',
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '20 min',                      rest: 'n/a',  intensity: 'moderate — RPE 4–5',     tempo: 'comfortable'          } },
        { block: 'mobility_activation',     count: 1, dosage: { sets: '2',   reps_or_hold: '12–15 reps',                  rest: 'short', intensity: 'full range',             tempo: 'dynamic'              } },
        { block: 'tissue_specific_loading', count: 4, dosage: { sets: '3–4', reps_or_hold: '10–12 reps',                  rest: '60s',  intensity: 'moderate–hard — RPE 6',  tempo: '3–4s eccentric'       } },
        { block: 'strength_support',        count: 4, dosage: { sets: '3–4', reps_or_hold: '10–12 reps',                  rest: '60s',  intensity: 'moderate — RPE 5–6',     tempo: 'controlled'           } },
        { block: 'control_balance',         count: 2, dosage: { sets: '3',   reps_or_hold: '12 reps or 40–50s',           rest: '45s',  intensity: 'moderate',               tempo: 'steady–dynamic'       } },
      ]
    },
  ],

  // Exercise selection: [PMC11338860] Phase 3 (Reverse Nordic 3×5, walking lunge 4×10m,
  //   plyometric glute bridge 3×5, plyometric hip thrust 3×5).
  // Eccentric introduction: [HICKEY_2022] criteria-based; dosage numbers: [BETA_ECCENTRIC_DOSAGE].
  // Running drill volume (2×20m): [BETA_RUNNING_DRILL_VOLUME].
  accumulation: [
    {
      tier: 'early',
      session_title: 'Accumulation — Session 1',
      description: 'Single-leg loading + eccentric introduction + first running mechanics drills.',
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '20 min easy–moderate jog/bike', rest: 'n/a',   intensity: 'easy–moderate — RPE 4', tempo: 'comfortable'          } },
        // [HICKEY_2022] criteria-based eccentric; [PMC11338860] Phase 3: Reverse Nordic 3×5; [BETA_ECCENTRIC_DOSAGE]
        { block: 'tissue_specific_loading', count: 3, dosage: { sets: '3',   reps_or_hold: '8–10 reps',                     rest: '90s',   intensity: 'moderate — RPE 5–6',    tempo: '3–4s eccentric'       } },
        // [PMC11338860] Phase 3: walking lunge 4×10m
        { block: 'strength_support',        count: 3, dosage: { sets: '3',   reps_or_hold: '8–10 reps',                     rest: '90s',   intensity: 'moderate — RPE 5–6',    tempo: 'controlled'           } },
        // [BETA_RUNNING_DRILL_VOLUME] 2×20m drill volume
        { block: 'running_sport_prep',      count: 3, dosage: { sets: '2–3', reps_or_hold: '2×20m each drill',              rest: 'walk-back', intensity: 'easy–moderate',     tempo: 'controlled'           } },
        { block: 'control_balance',         count: 1, dosage: { sets: '3',   reps_or_hold: '12 reps',                       rest: '45s',   intensity: 'moderate',              tempo: 'controlled'           } },
      ]
    },
    {
      tier: 'mid',
      session_title: 'Accumulation — Session 2',
      description: 'Volume increase. More eccentric work + additional running drills.',
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '20–25 min jog/bike',            rest: 'n/a',   intensity: 'moderate — RPE 4–5',    tempo: 'comfortable'          } },
        { block: 'tissue_specific_loading', count: 3, dosage: { sets: '3–4', reps_or_hold: '8–10 reps',                     rest: '90s',   intensity: 'moderate–hard — RPE 6', tempo: '3–4s eccentric'       } },
        { block: 'strength_support',        count: 4, dosage: { sets: '3–4', reps_or_hold: '10 reps',                       rest: '90s',   intensity: 'moderate — RPE 6',      tempo: 'controlled'           } },
        { block: 'running_sport_prep',      count: 4, dosage: { sets: '3',   reps_or_hold: '2–3×20m each drill',            rest: 'walk-back', intensity: 'moderate',          tempo: 'controlled–dynamic'   } },
        { block: 'control_balance',         count: 2, dosage: { sets: '3',   reps_or_hold: '12–15 reps',                    rest: '45s',   intensity: 'moderate',              tempo: 'controlled'           } },
      ]
    },
    {
      tier: 'late',
      session_title: 'Accumulation — Session 3',
      description: 'Accumulation peak. Maximum strength volume + most running drill variety.',
      blocks: [
        { block: 'conditioning',            count: 1, dosage: { sets: '1',   reps_or_hold: '25 min moderate jog/run',        rest: 'n/a',   intensity: 'moderate — RPE 5',      tempo: 'comfortable'          } },
        { block: 'tissue_specific_loading', count: 3, dosage: { sets: '4',   reps_or_hold: '8–10 reps',                      rest: '90s',   intensity: 'hard — RPE 7',          tempo: '4s eccentric'         } },
        { block: 'strength_support',        count: 4, dosage: { sets: '4',   reps_or_hold: '10–12 reps',                     rest: '90s',   intensity: 'moderate–hard — RPE 6–7', tempo: 'controlled'         } },
        { block: 'running_sport_prep',      count: 5, dosage: { sets: '3',   reps_or_hold: '3×20m each drill',               rest: 'walk-back', intensity: 'moderate–hard',     tempo: 'dynamic'              } },
        { block: 'control_balance',         count: 2, dosage: { sets: '3',   reps_or_hold: '15 reps or 45s',                 rest: '45s',   intensity: 'moderate',              tempo: 'controlled'           } },
      ]
    },
  ],

  // Sprint progression principle: [SPRINT_PROGRESSION] (Buckthorpe 2019 — "within 95% max speed 1–2×/week").
  // Eccentric high-load: [HICKEY_2022] criteria-based; dosage [BETA_ECCENTRIC_DOSAGE].
  // Running distances: [BETA_RUNNING_DRILL_VOLUME].
  transition: [
    {
      tier: 'early',
      session_title: 'Transition — Session 1',
      description: 'First running exposure at speed. Landing mechanics + deceleration + high-load eccentric.',
      blocks: [
        { block: 'mobility_activation',     count: 2, dosage: { sets: '1–2', reps_or_hold: '10–12 reps',    rest: 'short',       intensity: 'full range — dynamic',   tempo: 'dynamic'         } },
        // [HICKEY_2022] high-load eccentric criteria-based; [BETA_ECCENTRIC_DOSAGE]
        { block: 'tissue_specific_loading', count: 3, dosage: { sets: '3–4', reps_or_hold: '6–8 reps',      rest: '90–120s',     intensity: 'hard — RPE 7',           tempo: '4–5s eccentric'  } },
        { block: 'strength_support',        count: 2, dosage: { sets: '3–4', reps_or_hold: '8 reps',        rest: '90s',         intensity: 'moderate–hard — RPE 6',  tempo: 'controlled'      } },
        // [SPRINT_PROGRESSION] sub-maximal speed exposure; [BETA_RUNNING_DRILL_VOLUME]
        { block: 'running_sport_prep',      count: 4, dosage: { sets: '3–4', reps_or_hold: '3–4×30–40m',   rest: 'full (3 min)', intensity: 'moderate–hard (70–80%)',  tempo: 'build gradually' } },
      ]
    },
    {
      tier: 'mid',
      session_title: 'Transition — Session 2',
      description: 'Longer distances + higher speeds + plyometric introduction.',
      blocks: [
        { block: 'mobility_activation',     count: 1, dosage: { sets: '2',   reps_or_hold: '12–15 reps',    rest: 'short',       intensity: 'full range',             tempo: 'dynamic'          } },
        { block: 'tissue_specific_loading', count: 2, dosage: { sets: '4',   reps_or_hold: '6 reps',        rest: '120s',        intensity: 'hard — RPE 7–8',         tempo: '4–5s eccentric'   } },
        { block: 'strength_support',        count: 2, dosage: { sets: '3–4', reps_or_hold: '8 reps',        rest: '90s',         intensity: 'moderate–hard',          tempo: 'controlled'        } },
        { block: 'running_sport_prep',      count: 5, dosage: { sets: '4',   reps_or_hold: '3×40–60m',      rest: 'full (3–4 min)', intensity: 'hard (80–85%)',       tempo: 'build'             } },
      ]
    },
    {
      tier: 'late',
      session_title: 'Transition — Session 3',
      description: 'Transition peak. Near-maximum speed + COD + reactive landing.',
      blocks: [
        { block: 'mobility_activation',     count: 1, dosage: { sets: '2',   reps_or_hold: '15 reps',       rest: 'short',       intensity: 'full range',             tempo: 'dynamic'          } },
        { block: 'tissue_specific_loading', count: 2, dosage: { sets: '4',   reps_or_hold: '5–6 reps',      rest: '120s',        intensity: 'very hard — RPE 8',      tempo: '5s eccentric'     } },
        { block: 'strength_support',        count: 2, dosage: { sets: '4',   reps_or_hold: '8 reps',        rest: '90s',         intensity: 'moderate–hard',          tempo: 'controlled'        } },
        { block: 'running_sport_prep',      count: 6, dosage: { sets: '4',   reps_or_hold: '3–4×40–60m',   rest: 'full (4 min)', intensity: 'hard–very hard (85–90%)', tempo: 'build to near-max' } },
      ]
    },
  ],

  simulation: [
    {
      tier: 'early',
      session_title: 'Simulation — Session 1',
      description: 'Sport-specific running + first kicking exposure + plyometric loading.',
      blocks: [
        { block: 'tissue_specific_loading', count: 2, dosage: { sets: '3',   reps_or_hold: '6–8 reps (maintenance)',   rest: '90s',         intensity: 'moderate — RPE 6',      tempo: '3s eccentric'  } },
        { block: 'strength_support',        count: 2, dosage: { sets: '3',   reps_or_hold: '8–10 reps',                rest: '90s',         intensity: 'moderate–hard — RPE 6', tempo: 'controlled'    } },
        { block: 'running_sport_prep',      count: 5, dosage: { sets: '4–5', reps_or_hold: '4×60m / sport reps',      rest: 'full (4 min)', intensity: 'hard (85–90%)',          tempo: 'sport speed'   } },
      ]
    },
    {
      tier: 'mid',
      session_title: 'Simulation — Session 2',
      description: 'Increased running volume + more sport patterns + full kicking exposure.',
      blocks: [
        { block: 'tissue_specific_loading', count: 1, dosage: { sets: '3',   reps_or_hold: '6 reps (maintenance)',     rest: '90s',         intensity: 'moderate — RPE 6',      tempo: '3s eccentric'  } },
        { block: 'strength_support',        count: 2, dosage: { sets: '3',   reps_or_hold: '8–10 reps',                rest: '90s',         intensity: 'moderate–hard',         tempo: 'controlled'    } },
        { block: 'running_sport_prep',      count: 7, dosage: { sets: '5–6', reps_or_hold: '4–6×60–120m / sport reps', rest: 'full',       intensity: 'hard–very hard (90%)',  tempo: 'sport speed'   } },
      ]
    },
    {
      tier: 'late',
      session_title: 'Simulation — Session 3',
      description: 'Maximum simulation. Full sport-specific demands. One step from RTS.',
      blocks: [
        { block: 'tissue_specific_loading', count: 1, dosage: { sets: '2',   reps_or_hold: '6 reps (maintenance)',     rest: '90s',         intensity: 'moderate — RPE 5',      tempo: '3s eccentric'  } },
        { block: 'strength_support',        count: 1, dosage: { sets: '3',   reps_or_hold: '8–10 reps',                rest: '90s',         intensity: 'moderate',              tempo: 'controlled'    } },
        { block: 'running_sport_prep',      count: 8, dosage: { sets: '5–6', reps_or_hold: 'match-volume sport reps',  rest: 'match rest',  intensity: 'maximal (95–100%)',      tempo: 'match pace'    } },
      ]
    },
  ],

  resilience: [
    {
      tier: 'early',
      session_title: 'Resilience — Session 1',
      description: 'Game exposure + maintenance strength. Full return-to-sport context.',
      blocks: [
        { block: 'strength_support',        count: 2, dosage: { sets: '3',   reps_or_hold: '8–12 reps (maintenance)', rest: '90s',     intensity: 'moderate — RPE 5–6', tempo: 'controlled'  } },
        { block: 'running_sport_prep',      count: 5, dosage: { sets: '1',   reps_or_hold: 'game-integrated / match volume', rest: 'as play', intensity: 'maximal',   tempo: 'match pace'  } },
      ]
    },
    {
      tier: 'mid',
      session_title: 'Resilience — Session 2',
      description: 'Full team training + game-based loads + strength maintenance.',
      blocks: [
        { block: 'strength_support',        count: 2, dosage: { sets: '3',   reps_or_hold: '8–12 reps',               rest: '90s',     intensity: 'moderate — RPE 5–6', tempo: 'controlled'  } },
        { block: 'running_sport_prep',      count: 6, dosage: { sets: '1',   reps_or_hold: 'match-integrated',         rest: 'as play', intensity: 'maximal',            tempo: 'match pace'  } },
      ]
    },
    {
      tier: 'late',
      session_title: 'Resilience — Session 3',
      description: 'Full performance. Match + training integrated.',
      blocks: [
        { block: 'strength_support',        count: 2, dosage: { sets: '2–3', reps_or_hold: '8–10 reps (maintenance)', rest: '60s',     intensity: 'moderate',          tempo: 'controlled'  } },
        { block: 'running_sport_prep',      count: 6, dosage: { sets: '1',   reps_or_hold: 'match-integrated',         rest: 'as play', intensity: 'maximal',            tempo: 'match pace'  } },
      ]
    },
  ],
};

/**
 * Returns the session tier config for a given phase and session index (0/1/2).
 * Session 0 = early, 1 = mid, 2 = late. Clamps to available tiers.
 */
export function getSessionTierConfig(phaseId, sessionIndex) {
  const tiers = SESSION_TIER_STRUCTURE[phaseId];
  if (!tiers || !tiers.length) return null;
  const idx = Math.min(Math.max(sessionIndex, 0), tiers.length - 1);
  return tiers[idx];
}
