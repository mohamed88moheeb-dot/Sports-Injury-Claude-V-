/**
 * lib/clinical/rfBetaEngine/rfWarmupCooldown.mjs
 * ---------------------------------------------------------------------------
 * Phase-appropriate WARM-UP (RAMP) and COOLDOWN content for RF sessions.
 *
 * Real-life clinical logic embedded here:
 *  - Warm-up follows the RAMP framework (Raise → Activate → Mobilise →
 *    Potentiate; Jeffreys). Potentiation (fast/ballistic prep) only appears
 *    once the athlete is sport-ready (transition onward) — never on acute tissue.
 *  - Early phases (acute/sub-acute muscle strain): raise + gentle pain-free
 *    mobility ONLY. No end-range or ballistic stretching of the healing muscle
 *    — aggressive static stretch of a fresh strain can impair tendon/muscle
 *    healing (Bayer 2017; early controlled loading, not stretching).
 *  - Cooldown = parasympathetic down-regulation + light aerobic flush. Gentle
 *    static/contract-relax stretching of the kinetic chain is introduced from
 *    Reload — and never taken into front-thigh pain. Plus holistic recovery
 *    behaviours (sleep, protein, hydration, load spacing) that actually drive
 *    tissue repair and re-injury risk.
 *
 * Content is authored in the session-card shape used by rfSessionGenerator so
 * these render identically to every other card (shape-safe).
 * ---------------------------------------------------------------------------
 */

// Phase → content bucket (several phases share a bucket where practice is identical).
const WARMUP = {
  foundation: {
    exercise_name: 'Warm-up — gentle raise & mobility',
    purpose: 'Warm the tissue and gently prepare the joint before any loading. Healing tissue is protected — no stretching into pain.',
    dosage: { sets: '1', reps_or_hold: '6–8 min', rest: 'n/a', intensity: 'easy — RPE 2–3', tempo: 'slow & controlled' },
    equipment: ['bike_or_walk'],
    instructions: [
      'Raise: 5–6 min easy walk or stationary bike to warm the tissue and lift heart rate.',
      'Mobilise: slow, small-range knee bends and hip circles — stay comfortably pain-free.',
      'Do NOT stretch the front of the thigh into any pull or pain — the muscle is still healing.',
    ],
    coaching_cues: ['Warm, not tired', 'Move only where it is comfortable'],
    common_mistakes: ['Static-stretching the injured muscle this early', 'Going straight into exercises cold'],
  },
  reload: {
    exercise_name: 'Warm-up (RAMP) — raise, mobilise, activate',
    purpose: 'Prepare the muscle and the whole kinetic chain for loading using the RAMP structure.',
    dosage: { sets: '1', reps_or_hold: '8–10 min', rest: 'short', intensity: 'easy–moderate — RPE 3', tempo: 'controlled' },
    equipment: ['bike_or_walk', 'bodyweight'],
    instructions: [
      'Raise: 5 min bike or brisk walk.',
      'Mobilise: dynamic leg swings, hip openers and controlled knee bends through a comfortable range.',
      'Activate: 10 glute bridges + a light isometric quad set (gently tense the thigh 5 s ×5) to switch the muscle on.',
    ],
    coaching_cues: ['Build gradually — each set feels easier', 'Feel the glutes and thigh switch on'],
    common_mistakes: ['Skipping activation and loading a "sleepy" muscle', 'Rushing the raise'],
  },
  accumulation: {
    exercise_name: 'Warm-up (RAMP) — raise, mobilise, activate',
    purpose: 'Full RAMP preparation for progressive strength and eccentric loading.',
    dosage: { sets: '1', reps_or_hold: '8–10 min', rest: 'short', intensity: 'moderate — RPE 3–4', tempo: 'controlled' },
    equipment: ['bike_or_walk', 'bodyweight', 'band'],
    instructions: [
      'Raise: 5 min bike, row or brisk walk until lightly warm.',
      'Mobilise: dynamic hip flexor, quad and hamstring swings through full comfortable range.',
      'Activate: banded glute walks + isometric quad holds to prime the front-thigh before eccentric work.',
    ],
    coaching_cues: ['Full but pain-free range', 'Prime the muscle you are about to load'],
    common_mistakes: ['Loading eccentric work cold', 'Mobilising into sharp stretch pain'],
  },
  transition: {
    exercise_name: 'Warm-up (RAMP) — with light potentiation',
    purpose: 'RAMP preparation plus a first layer of speed priming for acceleration, deceleration and change-of-direction work.',
    dosage: { sets: '1', reps_or_hold: '10–12 min', rest: 'short', intensity: 'moderate — RPE 4', tempo: 'build up' },
    equipment: ['bike_or_walk', 'bodyweight', 'cones'],
    instructions: [
      'Raise & mobilise as in earlier phases (dynamic hip/quad/hamstring).',
      'Activate: glute + quad priming.',
      'Potentiate: A-marches, low skips and 2–3 sub-maximal build-up runs to prime the nervous system for faster work.',
    ],
    coaching_cues: ['Progressively faster, never maximal in the warm-up', 'Quality of movement first'],
    common_mistakes: ['Going near-maximal before the session', 'Omitting the potentiation and jumping into COD cold'],
  },
  simulation: {
    exercise_name: 'Warm-up — sport-specific potentiation',
    purpose: 'Prime for high-speed running, plyometrics and sport skill by rehearsing the demands of today’s session at graded intensity.',
    dosage: { sets: '1', reps_or_hold: '12–15 min', rest: 'as needed', intensity: 'moderate–hard build — RPE 5', tempo: 'progressive' },
    equipment: ['bodyweight', 'cones', 'ball_optional'],
    instructions: [
      'Raise & mobilise, then activate glutes/quads.',
      'Potentiate: progressive accelerations to ~80–90%, low-level plyometrics and sport-specific prep (e.g. passing/striking build-up).',
      'Rehearse the movements you are about to train — at a controlled build before full effort.',
    ],
    coaching_cues: ['Ramp speed in steps', 'Be fully prepared before max-effort work'],
    common_mistakes: ['One sprint from cold', 'Skipping plyometric priming before plyometric loading'],
  },
};
WARMUP.resilience = WARMUP.simulation;

const COOLDOWN = {
  foundation: {
    exercise_name: 'Cooldown & recovery',
    purpose: 'Settle the system and support healing. No aggressive stretching of the injured muscle yet — early tissue heals best with gentle movement, not end-range stretch.',
    dosage: { sets: '1', reps_or_hold: '5 min', rest: 'n/a', intensity: 'very easy', tempo: 'relaxed' },
    equipment: ['bodyweight'],
    instructions: [
      'Flush: 3–5 min easy walk to bring the heart rate down.',
      'Down-regulate: 1–2 min of slow nasal breathing.',
      'Recovery today: hydrate, get protein within ~1–2 h, and prioritise 7–9 h of sleep — this is when the tissue actually repairs.',
    ],
    coaching_cues: ['Calm and unhurried', 'Recovery is part of the plan, not an afterthought'],
    common_mistakes: ['Stretching the healing muscle hard', 'Skipping sleep/nutrition and expecting fast recovery'],
  },
  reload: {
    exercise_name: 'Cooldown & recovery',
    purpose: 'Down-regulate, gently lengthen the surrounding chain, and set up recovery. Stretching stays off the front-thigh pain.',
    dosage: { sets: '1', reps_or_hold: '6–8 min', rest: 'n/a', intensity: 'easy', tempo: 'relaxed' },
    equipment: ['bodyweight'],
    instructions: [
      'Flush: 3–4 min easy walk or bike.',
      'Gentle stretch: calves, hip flexors and hamstrings — hold 20–30 s each, NEVER into front-of-thigh pain.',
      'Recovery: hydration, protein (~1.6–2 g/kg/day across the day), and sleep. Note how the leg feels tomorrow morning.',
    ],
    coaching_cues: ['Stretch the chain, spare the injury', 'Log tomorrow’s response'],
    common_mistakes: ['Forcing a front-thigh stretch', 'Ignoring the next-day response signal'],
  },
  transition: {
    exercise_name: 'Cooldown, recovery & load management',
    purpose: 'Down-regulate after higher-intensity work and manage the week’s load so tissue adapts instead of breaking down.',
    dosage: { sets: '1', reps_or_hold: '8–10 min', rest: 'n/a', intensity: 'easy', tempo: 'relaxed' },
    equipment: ['bodyweight'],
    instructions: [
      'Flush: 5 min easy jog/bike, then full-body mobility.',
      'Gentle static/contract-relax stretch of the chain (calf, hip flexor, hamstring, quad) — only to comfortable tension.',
      'Load management: keep hard days apart, follow a hard day with an easier day, and back off if next-day symptoms rise.',
      'Recovery: sleep, protein, hydration — the non-negotiables that drive adaptation.',
    ],
    coaching_cues: ['Adaptation happens between sessions', 'Respect the next-day signal'],
    common_mistakes: ['Stacking hard days back-to-back', 'Chasing intensity while ignoring recovery'],
  },
};
COOLDOWN.accumulation = COOLDOWN.reload;
COOLDOWN.simulation = COOLDOWN.transition;
COOLDOWN.resilience = COOLDOWN.transition;

const DEFAULT_WARMUP = WARMUP.reload;
const DEFAULT_COOLDOWN = COOLDOWN.reload;

export function getWarmupContent(phaseId) { return WARMUP[phaseId] || DEFAULT_WARMUP; }
export function getCooldownContent(phaseId) { return COOLDOWN[phaseId] || DEFAULT_COOLDOWN; }
