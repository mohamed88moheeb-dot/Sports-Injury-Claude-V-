/**
 * lib/clinical/kneeEngine/kneeWarmupCooldown.mjs
 * ---------------------------------------------------------------------------
 * Stage-appropriate WARM-UP (RAMP) and COOLDOWN cards for knee sessions, so
 * every knee session reads as a complete session — warm-up → main loading →
 * cooldown — exactly like the RF engine.
 *
 * Clinical logic embedded here:
 *  - Warm-up follows RAMP (Raise → Activate → Mobilise → Potentiate; Jeffreys).
 *    Potentiation (fast/reactive prep) only appears from the dynamic stage
 *    onward — never on an acute or protected knee.
 *  - Protect stage: raise + pain-free ROM only. No end-range or ballistic
 *    stretching of a healing ligament/meniscus; extension control is the
 *    priority for cruciate/collateral injuries.
 *  - Cooldown = parasympathetic down-regulation + light flush, gentle chain
 *    stretching from the strengthen stage, plus the recovery behaviours (sleep,
 *    protein, hydration, load spacing) that actually drive tissue adaptation.
 *
 * Cards are authored in the KNEE card shape (name/block/purpose/dosage/…) so
 * they map through kneeOutputToProfile identically to every bank exercise.
 * ---------------------------------------------------------------------------
 */

// Knee stage → warm-up content bucket.
const WARMUP = {
  protect: {
    name: 'Warm-up — gentle raise & pain-free range',
    purpose: 'Warm the joint and gently prepare it before any loading. The injured structure is protected — no stretching into pain.',
    dosage: { sets: '1', detail: '6–8 min', intensity: 'easy — RPE 2–3' },
    equipment: ['bike_or_walk'],
    why: 'Early warm-up is movement, not stretch — a fresh ligament/meniscus is protected while blood flow and range are restored.',
    cautions: ['Do not force end-range or stretch into pain.', 'Prioritise regaining full knee extension.'],
  },
  activate: {
    name: 'Warm-up (RAMP) — raise, mobilise, activate',
    purpose: 'Prepare the knee and hip using the RAMP structure, switching the quad and glutes on before loading.',
    dosage: { sets: '1', detail: '8–10 min', intensity: 'easy–moderate — RPE 3' },
    equipment: ['bike_or_walk', 'bodyweight'],
    why: 'Activating a "sleepy" quad and the hip stabilisers first makes the loading work count and protects the joint.',
    cautions: ['Mobilise through a comfortable range only.'],
  },
  strengthen: {
    name: 'Warm-up (RAMP) — raise, mobilise, activate',
    purpose: 'Full RAMP preparation for progressive strength work.',
    dosage: { sets: '1', detail: '8–10 min', intensity: 'moderate — RPE 3–4' },
    equipment: ['bike_or_walk', 'bodyweight', 'band'],
    why: 'Prime the quad, glutes and hamstrings before heavier loading so the target tissue takes the work, not the joint.',
    cautions: ['Build gradually — the last warm-up set should feel easy.'],
  },
  dynamic: {
    name: 'Warm-up (RAMP) — with light potentiation',
    purpose: 'RAMP preparation plus a first layer of speed and landing priming for running and change-of-direction work.',
    dosage: { sets: '1', detail: '10–12 min', intensity: 'moderate — RPE 4, building' },
    equipment: ['bike_or_walk', 'bodyweight', 'cones'],
    why: 'The nervous system needs graded fast-movement priming before reactive work — never one hard rep from cold.',
    cautions: ['Progressively faster, never maximal in the warm-up.', 'Control knee valgus on every rep.'],
  },
  return: {
    name: 'Warm-up — sport-specific potentiation',
    purpose: 'Prime for high-speed running, plyometrics and sport skill by rehearsing today’s demands at graded intensity.',
    dosage: { sets: '1', detail: '12–15 min', intensity: 'moderate–hard build — RPE 5' },
    equipment: ['bodyweight', 'cones', 'ball_optional'],
    why: 'Rehearsing the movements you are about to train, at a controlled build, is how you arrive fully prepared for max-effort work.',
    cautions: ['Ramp speed in steps — be fully prepared before max-effort work.'],
  },
};

// Knee stage → cooldown content bucket.
const COOLDOWN = {
  protect: {
    name: 'Cooldown & recovery',
    purpose: 'Settle the system and support healing. No aggressive stretching yet — early tissue heals with gentle movement, not end-range stretch.',
    dosage: { sets: '1', detail: '5 min', intensity: 'very easy' },
    equipment: ['bodyweight'],
    why: 'Recovery behaviours — sleep, protein, hydration — are when the tissue actually repairs; treat them as part of the plan.',
    cautions: ['Do not stretch the injured structure hard.', 'Manage swelling (elevate / gentle movement) if present.'],
  },
  activate: {
    name: 'Cooldown & recovery',
    purpose: 'Down-regulate, gently move the surrounding chain, and set up recovery.',
    dosage: { sets: '1', detail: '6–8 min', intensity: 'easy' },
    equipment: ['bodyweight'],
    why: 'Hydration, protein across the day and 7–9 h sleep drive the adaptation you trained for.',
    cautions: ['Keep any stretching to comfortable tension only.'],
  },
  strengthen: {
    name: 'Cooldown & recovery',
    purpose: 'Down-regulate and gently lengthen the chain (calf, hip flexor, hamstring, quad) to comfortable tension, then set up recovery.',
    dosage: { sets: '1', detail: '6–8 min', intensity: 'easy' },
    equipment: ['bodyweight'],
    why: 'Note tomorrow morning’s response — a rise in next-day symptoms is the signal to hold or ease the load.',
    cautions: ['Stretch to comfortable tension, never into joint pain.'],
  },
  dynamic: {
    name: 'Cooldown, recovery & load management',
    purpose: 'Down-regulate after higher-intensity work and manage the week’s load so the knee adapts instead of flaring.',
    dosage: { sets: '1', detail: '8–10 min', intensity: 'easy' },
    equipment: ['bodyweight'],
    why: 'Adaptation happens between sessions — keep hard days apart and follow a hard day with an easier one.',
    cautions: ['Back off if next-day swelling or pain rises.'],
  },
  return: {
    name: 'Cooldown, recovery & load management',
    purpose: 'Down-regulate after sport-intensity work and protect the week’s load balance.',
    dosage: { sets: '1', detail: '8–10 min', intensity: 'easy' },
    equipment: ['bodyweight'],
    why: 'Sleep, protein and hydration are the non-negotiables that let you keep training at this intensity.',
    cautions: ['Respect the next-day signal; do not stack maximal days.'],
  },
};

const DEFAULT_WARMUP = WARMUP.activate;
const DEFAULT_COOLDOWN = COOLDOWN.activate;

function bookendCard(kind, stageId, content) {
  return {
    exercise_id: `KNEE-${kind.toUpperCase()}-${String(stageId).toUpperCase()}`,
    name: content.name,
    block: kind === 'warmup' ? 'warm_up' : 'cool_down',
    purpose: content.purpose,
    why_this_injury: content.why || null,
    dosage: content.dosage,
    dosage_status: 'beta_default_requires_review',
    equipment: content.equipment || ['bodyweight'],
    cautions: content.cautions || [],
    source_refs: [],
    frequency: 'every session',
  };
}

export function kneeWarmupCard(stageId) {
  return bookendCard('warmup', stageId, WARMUP[stageId] || DEFAULT_WARMUP);
}
export function kneeCooldownCard(stageId) {
  return bookendCard('cooldown', stageId, COOLDOWN[stageId] || DEFAULT_COOLDOWN);
}
