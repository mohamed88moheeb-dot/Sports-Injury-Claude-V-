/**
 * lib/clinical/core/warmupCooldown.mjs
 * ---------------------------------------------------------------------------
 * Generic, body-region-agnostic warm-up / cool-down bookend cards attached to
 * every session by the shared session core. These are structural (not part
 * of any engine's clinically-tagged pool), so the AI composer never selects
 * or alters them — they are appended after AI or deterministic exercise
 * selection either way.
 *
 * `cautious` gates the cool-down: pathologies where active stretch is
 * contraindicated early (contusion/myositis-ossificans risk, tendinopathy
 * compressive irritability, post-op tendon repair) get a pain-free-ROM-only
 * cool-down with no active stretch; strains/most other patterns progress to
 * a light stretch of the worked area.
 * ---------------------------------------------------------------------------
 */

const WARMUP_EXERCISE = {
  id: 'CORE-BOOKEND-WARMUP', name: 'General warm-up', block: 'warmup',
  purpose: 'Raise tissue temperature and rehearse pain-free movement before loading.',
  why: 'A brief general warm-up increases tissue compliance and primes the movement pattern before working sets.',
  equipment: ['bodyweight'], source_refs: [],
  dosage_by_tier: [
    { sets: '—', detail: '5 min easy walk or stationary bike, then a couple of sets of gentle pain-free movement through the area\'s usual range' },
    { sets: '—', detail: '5-7 min easy walk or bike, then gentle pain-free movement through the area\'s usual range, building slightly' },
    { sets: '—', detail: '7-8 min bike/jog, then gentle movement through range, building toward working pace' },
  ],
  instructions: ['Keep effort easy and pain-free.', 'This is preparation, not part of the working sets below.'],
  cautions: [],
  is_bookend: true,
};

function cooldownExercise(cautious) {
  if (cautious) {
    return {
      id: 'CORE-BOOKEND-COOLDOWN-CAUTIOUS', name: 'Cool-down (pain-free range only)', block: 'cooldown',
      purpose: 'Settle the tissue and check range without provoking symptoms.',
      why: 'Active stretch is deliberately withheld here — see this plan\'s stretch policy — so cool-down stays limited to gentle, pain-free movement.',
      equipment: ['bodyweight'], source_refs: [],
      dosage_by_tier: [
        { sets: '—', detail: '3-5 min easy walk; gentle pain-free movement through range, no stretch' },
        { sets: '—', detail: '3-5 min easy walk; gentle pain-free movement through range, no stretch' },
        { sets: '—', detail: '5 min easy walk; gentle pain-free movement through range, no stretch' },
      ],
      instructions: ['Stay strictly pain-free.', 'Do not add active stretching yet — follow this plan\'s stretch caution.'],
      cautions: ['No aggressive or end-range stretch during this stage.'],
      is_bookend: true,
    };
  }
  return {
    id: 'CORE-BOOKEND-COOLDOWN', name: 'Cool-down + light stretch', block: 'cooldown',
    purpose: 'Ease out of the session and maintain range with a light stretch.',
    why: 'A brief cool-down and gentle static stretch supports range of motion once stretch is appropriate for this stage.',
    equipment: ['bodyweight'], source_refs: [],
    dosage_by_tier: [
      { sets: '2', hold: '20-30 s', detail: 'light stretch of the worked area, easy walk 2-3 min' },
      { sets: '2', hold: '30 s', detail: 'light stretch of the worked area, easy walk 2-3 min' },
      { sets: '2-3', hold: '30 s', detail: 'light stretch of the worked area, easy walk 3-5 min' },
    ],
    instructions: ['Stretch to a mild, comfortable tension — never pain.', 'Breathe and hold steady, no bouncing.'],
    cautions: ['Stop the stretch if it provokes sharp or increasing pain.'],
    is_bookend: true,
  };
}

/** Returns [warmupCard, cooldownCard] shaped exercise objects for a given tier. */
export function getBookendExercises(cautious) {
  return [WARMUP_EXERCISE, cooldownExercise(!!cautious)];
}
