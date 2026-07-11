/**
 * lib/clinical/hamstringEngine/planBuilder.mjs
 * ---------------------------------------------------------------------------
 * Builds a real, staged, WEEK-STRUCTURED hamstring rehabilitation plan —
 * matching the RF engine's proven architecture (rfPlanGenerator.mjs):
 *
 *   - Each stage has an estimated DURATION IN DAYS (derived from the entity's
 *     recovery estimate, split proportionally across protect/lengthen/
 *     strengthen/return) — so "how many weeks" has a real answer per case.
 *   - Each stage has a WEEKLY SESSION PATTERN (how many training days vs rest
 *     days per week) grounded in the evidence: gentle isometrics tolerate
 *     near-daily loading; eccentric/lengthening work needs recovery between
 *     sessions (Nordic/Askling protocols run ~3x/week); return-to-sport work
 *     is capped to protect adaptation.
 *   - Dosage ESCALATES across three tiers (early / mid / late) within a stage.
 *   - Each stage has a CORE anchor exercise (present every session, matching
 *     how real programs run the same key lift every session) plus a ROTATING
 *     pool of secondary/accessory exercises that cycles session-to-session, so
 *     three sessions in the same week are not byte-identical.
 * ---------------------------------------------------------------------------
 */

import { HAMSTRING_ENTITIES } from './diagnosis.mjs';

const ex = (name, block, purpose, dosage, refs, why = '', cautions = []) =>
  ({ name, block, purpose, dosage, source_refs: refs, why_this_injury: why, cautions });

const STAGES = [
  { id: 'protect', name: 'Protect & activate', friendly: 'Settle & activate' },
  { id: 'lengthen', name: 'Lengthening load', friendly: 'Restore length under load' },
  { id: 'strengthen', name: 'Progressive strength', friendly: 'Build eccentric strength' },
  { id: 'return', name: 'Return to sprint & sport', friendly: 'Reload speed & sport' },
];

// ── Stage duration model ────────────────────────────────────────────────────
const TOTAL_RECOVERY_DAYS = {
  sprint_type_biceps_femoris: { lower: 21, moderate: 42, high_concern: 70 },
  stretch_type_proximal: { lower: 42, moderate: 70, high_concern: 120 },
  proximal_hamstring_tendinopathy: { lower: 56, moderate: 84, high_concern: 112 },
  hamstring_mtj_strain: { lower: 21, moderate: 42, high_concern: 70 },
};
const STAGE_SHARE = { protect: 0.18, lengthen: 0.27, strengthen: 0.32, return: 0.23 };

function stageDurations(entity, band) {
  const total = (TOTAL_RECOVERY_DAYS[entity] || TOTAL_RECOVERY_DAYS.hamstring_mtj_strain)[band] || 42;
  const days = {};
  for (const s of STAGES) days[s.id] = Math.max(5, Math.round(total * STAGE_SHARE[s.id]));
  return { days, totalDays: total, totalWeeks: Math.round(total / 7) };
}

// ── Weekly session pattern per stage ────────────────────────────────────────
const WEEK_PATTERN = {
  protect: ['S', 'R', 'S', 'R', 'S', 'R', 'R'],
  lengthen: ['S', 'R', 'S', 'R', 'S', 'R', 'R'],
  strengthen: ['S', 'R', 'S', 'R', 'S', 'R', 'R'],
  return: ['S', 'R', 'S', 'R', 'S', 'R', 'R'],
};
const SESSIONS_PER_WEEK = 3;

function estimateTier(daysIntoStage, stageDurationDays) {
  const progress = stageDurationDays ? daysIntoStage / stageDurationDays : 0;
  if (progress < 0.34) return 0;
  if (progress < 0.67) return 1;
  return 2;
}

function locateInTimeline(entity, band, daysSinceInjury) {
  const { days } = stageDurations(entity, band);
  let cursor = 0;
  for (const s of STAGES) {
    const dur = days[s.id];
    if (daysSinceInjury < cursor + dur) return { stageId: s.id, daysIntoStage: daysSinceInjury - cursor, stageDurationDays: dur };
    cursor += dur;
  }
  const last = STAGES[STAGES.length - 1].id;
  return { stageId: last, daysIntoStage: days[last], stageDurationDays: days[last] };
}

function daysSinceFromBucket(bucket) {
  return { acute: 3, subacute: 14, late: 35 }[bucket] ?? 3;
}

/** Circular window into a pool so session 1/2/3 show different accessory work. */
function pickRotating(pool, sessionNum, count) {
  if (!pool.length) return [];
  if (pool.length <= count) return pool;
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[(( sessionNum - 1) * count + i) % pool.length]);
  return out;
}

// ── Stage banks: { core: (tier)=>exercise[], rotating: (tier)=>exercise[] } ──
// core = present every session (the anchor lift(s)). rotating = a wider pool
// that cycles session-to-session so the week has real variety.
function strainBank(entity, sport) {
  const sportPrep = sport === 'endurance' ? 'graded running volume' : 'graded sprint / change-of-direction';
  return {
    protect: {
      core: (tier) => [
        ex('Pain-free isometric hamstring holds', 'activation', 'Restore hamstring activation without provoking the healing tissue',
          { sets: 3 + tier, hold: `${20 + tier * 10}s`, detail: 'within tolerable symptoms' },
          ['HS-HICKEY-PAINFREE-2020', 'HS-HEIDERSCHEIT-2010'], 'Early activation limits shutdown; loading into a tolerable level of pain is acceptable and does not worsen outcomes.'),
      ],
      rotating: (tier) => [
        ex('Lumbopelvic / trunk control drills', 'motor_control', 'Neuromuscular control of the pelvis and trunk',
          { sets: 3, reps: `${8 + tier * 2}`, detail: 'controlled' },
          ['HS-SHERRY-BEST-2004'], 'Progressive agility + trunk stabilisation lowers reinjury vs isolated stretching/strengthening.'),
        ex('Pain-free range work (supine, single-leg)', 'mobility', 'Recover pain-free range',
          { sets: 2 + Math.min(tier, 1), detail: tier === 0 ? 'gentle, short range' : 'progressing toward full comfortable range' },
          ['HS-MALLIAROPOULOS-REINJURY-2011'], 'Delayed recovery of pain-free range is linked to reinjury.', tier === 0 ? ['Do not stretch into pain early.'] : []),
        ex('Double-leg glute bridge', 'activation', 'Activate the posterior chain without hamstring end-range stress',
          { sets: 3, reps: `${10 + tier * 2}`, hold: '2s at top' }, ['HS-HEIDERSCHEIT-2010'], 'Glute-dominant activation shares the load off the healing hamstring early on.'),
        ex('Pallof press (anti-rotation core)', 'motor_control', 'Trunk stability that supports pelvic control',
          { sets: 3, reps: '10 each side' }, ['HS-SHERRY-BEST-2004'], 'Trunk/pelvis stability is part of the same neuromuscular-control principle that lowers reinjury.'),
        ex('Easy stationary bike', 'conditioning', 'Maintain aerobic conditioning without hamstring load',
          { sets: 1, detail: '10-15 min easy' }, ['HS-HEIDERSCHEIT-2010'], 'Keeps general fitness ticking over while tissue-specific loading is still limited.'),
      ],
    },
    lengthen: {
      core: (tier) => [
        ex('Askling "extender" (controlled hip flexion, knee extension)', 'tissue_specific_loading', 'Load the hamstring at longer muscle lengths',
          { sets: 3, reps: `${10 + tier * 2}`, detail: 'slow, pain-free end-range' },
          ['HS-ASKLING-FOOTBALL-2013', 'HS-ASKLING-SPRINT-2014'], 'Lengthening-biased loading shortens return time vs conventional loading.'),
        ...(tier >= 1 ? [ex('Askling "diver" (single-leg hip hinge to horizontal)', 'tissue_specific_loading', 'Eccentric control through range with balance demand',
          { sets: 3, reps: '6 each', detail: 'controlled' }, ['HS-ASKLING-FOOTBALL-2013'], 'Trains the hamstring eccentrically at length in a functional pattern.')] : []),
        ...(tier >= 2 ? [ex('Askling "glider" (slide-board eccentric)', 'tissue_specific_loading', 'Progressive eccentric lengthening',
          { sets: 3, reps: '4-6 each', detail: 'increase glide distance as pain allows' }, ['HS-ASKLING-SPRINT-2014'], 'The most demanding lengthening exercise; introduced as symptoms settle.', ['Progress range only as symptoms allow.'])] : []),
      ],
      rotating: (tier) => [
        ex('Light Romanian deadlift (bar or dumbbells)', 'strength_support', 'Introduce the hip-hinge pattern under light load',
          { sets: 3, reps: '10', load: 'light' }, ['HS-BOURNE-FRAMEWORK-2018'], 'A light hip-hinge lead-in bridges toward the heavier loading of the next stage.'),
        ex('Banded standing hamstring curl', 'tissue_specific_loading', 'Isolated hamstring loading at a controlled range',
          { sets: 3, reps: '12 each' }, ['HS-BOURNE-FRAMEWORK-2018'], 'Direct hamstring isolation work at a modest, controllable range.'),
        ex('Single-leg glute bridge', 'strength_support', 'Unilateral posterior-chain strength with low hamstring-stretch demand',
          { sets: 3, reps: '10 each' }, ['HS-HEIDERSCHEIT-2010'], ''),
        ex('Stability-ball hamstring curl (double-leg)', 'tissue_specific_loading', 'Concentric-eccentric hamstring loading through range',
          { sets: 3, reps: '10' }, ['HS-BOURNE-FRAMEWORK-2018'], 'Adds a different loading stimulus and range profile to the lengthening stage.'),
        ex('Lumbopelvic / trunk control drills', 'motor_control', 'Maintain pelvic control as loading increases',
          { sets: 3, reps: '10' }, ['HS-SHERRY-BEST-2004'], ''),
      ],
    },
    strengthen: {
      core: (tier) => [
        ex('Nordic hamstring exercise (eccentric)', 'tissue_specific_loading', 'Build eccentric strength & fascicle length',
          { sets: 3, reps: `${5 + (tier * 1.5 | 0)}-${8 + tier * 2}`, detail: 'control the lower; progress range' },
          ['HS-PETERSEN-2011', 'HS-VANDERHORST-NHE-2015', 'HS-BOURNE-FRAMEWORK-2018'], 'Eccentric strengthening reduces new and recurrent hamstring injuries.', tier === 0 ? ['Expect DOMS early; keep controlled.'] : []),
      ],
      rotating: (tier) => [
        ex('Romanian deadlift / hip-hinge (progressive load)', 'strength_support', 'Hip-dominant strength through range',
          { sets: 4, reps: '6-8', load: ['light', 'moderate', 'heavy'][tier] },
          ['HS-BOURNE-FRAMEWORK-2018'], 'Hip-extension-biased loading complements knee-flexion-biased work.'),
        ex('Hip thrust (barbell or banded)', 'strength_support', 'Build hip-extension strength alongside the hamstrings',
          { sets: 4, reps: '8-10', load: ['light', 'moderate', 'heavy'][tier] }, ['HS-BOURNE-FRAMEWORK-2018'], 'Hip-extension strength is a key component of hamstring load tolerance and sprint performance.'),
        ...(tier >= 1 ? [ex('Single-leg Romanian deadlift', 'strength_support', 'Unilateral strength, balance and eccentric control combined',
          { sets: 3, reps: '8 each', load: 'light-moderate' }, ['HS-TOL-ISOKINETIC-2014'], 'Trains single-leg control directly relevant to running and cutting.')] : []),
        ...(tier >= 1 ? [ex('Single-leg hip-hinge & split-stance work', 'strength_support', 'Address limb asymmetry',
          { sets: 3, reps: '8 each' }, ['HS-TOL-ISOKINETIC-2014'], 'Most athletes retain strength deficits at return — target symmetry directly.')] : []),
        ex('Stability-ball leg curl (eccentric emphasis)', 'tissue_specific_loading', 'Additional hamstring-isolated eccentric loading',
          { sets: 3, reps: '10' }, ['HS-BOURNE-FRAMEWORK-2018'], 'A second, differently-loaded eccentric stimulus alongside the Nordic.'),
        ...(tier >= 2 ? [ex('Good mornings (light-moderate load)', 'strength_support', 'Hip-hinge strength variation under load',
          { sets: 3, reps: '8', load: 'light-moderate' }, ['HS-BOURNE-FRAMEWORK-2018'], 'A loaded hip-hinge variation for late-stage strength before running reintroduction.')] : []),
      ],
    },
    return: {
      core: (tier) => [
        ex(`Graded high-speed running programme (${sportPrep})`, 'running_sport_prep', 'Restore high-speed running capacity',
          { sets: '—', detail: ['~70% max speed, linear only', '~85% max speed, curved running', 'near-maximal speed, planned + reactive change of direction'][tier] },
          ['HS-MENDIGUCHIA-ALGO-2017', 'HS-HEIDERSCHEIT-2010'], 'Maximal sprinting exposure is required before clearance — hamstrings fail at top speed.', tier < 2 ? ['Do not clear without exposure to near-maximal running.'] : []),
      ],
      rotating: (tier) => [
        ex('Eccentric strength symmetry check', 'running_sport_prep', 'Confirm restored eccentric strength',
          { sets: '—', detail: 'target limb symmetry before RTS' }, ['HS-TOL-ISOKINETIC-2014'], 'Clinical clearance alone misses residual eccentric deficits.'),
        ex('Maintenance Nordic hamstring dose', 'tissue_specific_loading', 'Preserve the eccentric strength built in the previous stage',
          { sets: 2, reps: '6-8', detail: '1-2x/week maintenance dose' }, ['HS-PETERSEN-2011', 'HS-VANDERHORST-NHE-2015'], 'Strength gains fade if eccentric loading stops the moment running starts — a lower maintenance dose keeps them.'),
        ...(tier >= 1 ? [ex('Change-of-direction drills', 'running_sport_prep', 'Reintroduce cutting and deceleration demands',
          { sets: '—', detail: 'planned cuts, building toward reactive' }, ['HS-MENDIGUCHIA-ALGO-2017'], 'Deceleration and cutting load the hamstring differently to straight-line running.')] : []),
        ...(tier >= 1 ? [ex('Sport-specific reintegration', 'sport_reintegration', 'Rebuild sport-specific demands',
          { sets: '—', detail: tier === 1 ? 'non-contact drills' : 'full-intensity drills / return to training' }, ['HS-MENDIGUCHIA-ALGO-2017'], `Tailored to ${sport || 'sport'} demands.`)] : []),
        ...(tier >= 2 ? [ex('Bounding / plyometric progression', 'running_sport_prep', 'Speed-strength for sprint mechanics',
          { sets: '3', reps: '20-30m', detail: 'controlled, full recovery between reps' }, ['HS-MENDIGUCHIA-ALGO-2017'], 'Reactive strength is part of the demand profile the hamstring must tolerate before full clearance.')] : []),
      ],
    },
  };
}

function tendinopathyBank() {
  return {
    protect: {
      core: (tier) => [
        ex('Long-lever isometric hamstring holds', 'tissue_specific_loading', 'Reduce pain and begin tendon loading',
          { sets: 4, hold: `${30 + tier * 5}s` }, ['HS-HEIDERSCHEIT-2010'], 'Isometrics can reduce tendon pain and start load tolerance.', ['Avoid deep hip-flexion (compressive) positions early.']),
      ],
      rotating: () => [
        ex('Lumbopelvic control', 'motor_control', 'Pelvic control to offload the tendon', { sets: 3, reps: '10' }, ['HS-SHERRY-BEST-2004'], ''),
        ex('Double-leg glute bridge', 'activation', 'Share hip-extension load away from the tendon', { sets: 3, reps: '10' }, ['HS-HEIDERSCHEIT-2010'], ''),
      ],
    },
    lengthen: {
      core: (tier) => [
        ex('Mid-range hip-hinge (avoid deep compression)', 'tissue_specific_loading', 'Progressive tendon loading in a tolerable range',
          { sets: 3, reps: `${8 + tier * 2}` }, ['HS-BOURNE-FRAMEWORK-2018'], 'Progress load while avoiding compressive end-range early.', tier === 0 ? ['Avoid end-range hip flexion under load initially.'] : []),
      ],
      rotating: () => [
        ex('Banded standing hamstring curl', 'tissue_specific_loading', 'Isolated hamstring loading at a controlled range', { sets: 3, reps: '12' }, ['HS-BOURNE-FRAMEWORK-2018'], ''),
        ex('Single-leg glute bridge', 'strength_support', 'Unilateral posterior-chain strength', { sets: 3, reps: '10 each' }, ['HS-HEIDERSCHEIT-2010'], ''),
      ],
    },
    strengthen: {
      core: (tier) => [
        ex('Heavy slow resistance hip-hinge / bridge', 'tissue_specific_loading', 'Build tendon capacity',
          { sets: 4, reps: '6-8', load: ['moderate, slow tempo', 'heavy, slow tempo', 'heavy, slow tempo + energy storage'][tier] }, ['HS-BOURNE-FRAMEWORK-2018'], 'Progressive heavy loading builds tendon capacity.'),
      ],
      rotating: (tier) => [
        ex('Nordic / eccentric progression (as tolerated)', 'tissue_specific_loading', 'Eccentric capacity', { sets: 3, reps: `${5 + tier}` }, ['HS-PETERSEN-2011'], ''),
        ex('Hip thrust (barbell or banded)', 'strength_support', 'Hip-extension strength alongside tendon loading', { sets: 3, reps: '8-10', load: ['light', 'moderate', 'heavy'][tier] }, ['HS-BOURNE-FRAMEWORK-2018'], ''),
        ...(tier >= 1 ? [ex('Single-leg Romanian deadlift', 'strength_support', 'Unilateral strength and control', { sets: 3, reps: '8 each', load: 'light-moderate' }, ['HS-TOL-ISOKINETIC-2014'], '')] : []),
      ],
    },
    return: {
      core: (tier) => [
        ex('Graded running & energy-storage loading', 'running_sport_prep', 'Reintroduce running/plyometric load',
          { sets: '—', detail: 'progress as pain <=3/10 and settles by next day' }, ['HS-MENDIGUCHIA-ALGO-2017'], 'Monitor 24-h symptom response as the progression guide.'),
      ],
      rotating: (tier) => [
        ex('Maintenance tendon-loading dose', 'tissue_specific_loading', 'Preserve tendon capacity as running increases', { sets: 2, reps: '6-8', detail: '1-2x/week maintenance dose' }, ['HS-BOURNE-FRAMEWORK-2018'], ''),
        ...(tier >= 1 ? [ex('Sport-specific reintegration', 'sport_reintegration', 'Return to sport demands', { sets: '—', detail: 'progressive' }, ['HS-MENDIGUCHIA-ALGO-2017'], '')] : []),
      ],
    },
  };
}

const WARMUP = {
  protect: ex('Warm-up — gentle raise & pain-free range', 'warm_up', 'Warm the tissue before loading; no stretch into pain', { sets: 1, detail: '6-8 min easy bike/walk + pain-free range' }, [], 'Movement, not stretch, for early healing tissue.'),
  lengthen: ex('Warm-up (RAMP) — raise, activate, mobilise', 'warm_up', 'Prepare the hamstring for lengthening load', { sets: 1, detail: '8-10 min, glute + hamstring activation' }, [], 'Prime the muscle before end-range loading.'),
  strengthen: ex('Warm-up (RAMP) — raise, activate, mobilise', 'warm_up', 'Prepare for heavier eccentric loading', { sets: 1, detail: '8-10 min build' }, [], ''),
  return: ex('Warm-up — sprint potentiation', 'warm_up', 'Prime the nervous system for high-speed running', { sets: 1, detail: '12-15 min: drills + graded build-up runs' }, [], 'Never one hard sprint from cold.'),
};
const COOLDOWN = {
  protect: ex('Cooldown & recovery', 'cool_down', 'Down-regulate and support healing', { sets: 1, detail: '5 min easy + sleep/protein/hydration' }, [], 'Recovery behaviours drive tissue repair.'),
  lengthen: ex('Cooldown & recovery', 'cool_down', 'Down-regulate; note next-day response', { sets: 1, detail: '6-8 min' }, [], 'A rise in next-day symptoms means ease the load.'),
  strengthen: ex('Cooldown, recovery & load management', 'cool_down', 'Manage weekly load so tissue adapts', { sets: 1, detail: '8-10 min' }, [], 'Keep hard days apart.'),
  return: ex('Cooldown, recovery & load management', 'cool_down', 'Protect the weekly load balance', { sets: 1, detail: '8-10 min' }, [], 'Respect the next-day signal.'),
};

function restDayCard(stageId) {
  const note = {
    protect: 'Rest day — gentle daily movement only (short walk, pain-free range). Let the tissue settle.',
    lengthen: 'Rest day — allow 48h between lengthening sessions to adapt. Light walking is fine.',
    strengthen: 'Rest day — eccentric work needs recovery time; this is when the adaptation actually happens.',
    return: 'Rest day — protect the week\'s running load; recovery lets speed work stick.',
  }[stageId] || 'Rest and recovery day.';
  return { note };
}

function buildDayGuidance(stageId, tier, sessionNum) {
  const base = {
    protect: ['Keep effort gentle and controlled.', 'Stop if pain rises above a mild, tolerable level.'],
    lengthen: ['Only progress range if the previous session felt fully controlled.', 'A pulling sensation is fine; sharp pain is not.'],
    strengthen: ['Expect some muscle soreness after eccentric work — that eases within 48h.', 'Do not add load if the last session\'s soreness hasn\'t settled.'],
    return: ['Build speed in steps across the week — never jump straight to maximal effort.', 'Any sharp pain during running stops the session.'],
  }[stageId] || [];
  return [`${['Early', 'Mid', 'Late'][tier]}-stage session ${sessionNum} this week.`, ...base];
}

/**
 * @param {object} diagnosis output of diagnoseHamstring
 * @param {object} input normalized input (needs days_since_injury or weeks_since bucket)
 * @returns {object|null} staged, week-structured plan, or null if referral-gated
 */
export function buildHamstringPlan(diagnosis, input) {
  if (diagnosis.entity === HAMSTRING_ENTITIES.PROXIMAL_AVULSION || diagnosis.review_required) return null;

  const bank = diagnosis.entity === HAMSTRING_ENTITIES.PROXIMAL_TENDINOPATHY
    ? tendinopathyBank()
    : strainBank(diagnosis.entity, input.sport);

  const daysSinceInjury = Number.isFinite(input.days_since_injury) ? input.days_since_injury : daysSinceFromBucket(input.weeks_since);
  const { days: stageDays, totalDays, totalWeeks } = stageDurations(diagnosis.entity, diagnosis.band);
  const { stageId: currentStageId, daysIntoStage, stageDurationDays } = locateInTimeline(diagnosis.entity, diagnosis.band, daysSinceInjury);
  const tier = estimateTier(daysIntoStage, stageDurationDays);
  const curIdx = STAGES.findIndex((s) => s.id === currentStageId);

  const stages = STAGES.map((stage, idx) => {
    const isCurrent = idx === curIdx;
    const stageTier = isCurrent ? tier : idx < curIdx ? 2 : 0;
    const stageBank = bank[stage.id];
    const coreExercises = stageBank.core(stageTier);
    const rotatingPool = stageBank.rotating(stageTier);
    const stageWeeks = Math.max(1, Math.round(stageDays[stage.id] / 7));

    const pattern = WEEK_PATTERN[stage.id];
    let sessionNum = 0;
    const sessions = pattern.map((dayType, dayIdx) => {
      if (dayType === 'R') return { stage_id: stage.id, is_rest: true, day_index: dayIdx, ...restDayCard(stage.id) };
      sessionNum++;
      const rotatingPick = pickRotating(rotatingPool, sessionNum, 3);
      const cards = [WARMUP[stage.id], ...coreExercises, ...rotatingPick, COOLDOWN[stage.id]].filter(Boolean);
      return {
        stage_id: stage.id, day_index: dayIdx, session_number: sessionNum,
        cards, guidance: buildDayGuidance(stage.id, stageTier, sessionNum),
        preview_only: !isCurrent,
      };
    });

    // exercise_count reflects the full pool available this stage (core + rotating),
    // not just what one session shows — that's the real depth of the program.
    const totalPoolSize = coreExercises.length + rotatingPool.length;

    return {
      stage_id: stage.id, stage_name: stage.name, friendly_name: stage.friendly,
      status: isCurrent ? 'current' : idx < curIdx ? 'earlier' : 'upcoming',
      is_current: isCurrent,
      duration_weeks: stageWeeks,
      sessions_per_week: SESSIONS_PER_WEEK,
      tier: stageTier, tier_label: ['Early', 'Mid', 'Late'][stageTier],
      progression_note: `~${stageWeeks} week${stageWeeks > 1 ? 's' : ''} · ${SESSIONS_PER_WEEK}x/week training, rest days between sessions for adaptation.`,
      sessions,
      exercise_count: totalPoolSize,
    };
  });

  return {
    current_stage_id: currentStageId,
    current_stage_name: STAGES[curIdx]?.name || 'Protect & activate',
    total_estimated_weeks: totalWeeks,
    total_estimated_days: totalDays,
    stages,
  };
}

/** Criteria-based return-to-sport battery (never grants clearance). */
export function hamstringRts(input) {
  return {
    title: 'Return-to-sport readiness',
    clinical_authority: false,
    criteria: [
      { name: 'Eccentric strength symmetry', target: 'Injured limb within ~10% of the other side', source_refs: ['HS-TOL-ISOKINETIC-2014'] },
      { name: 'Full pain-free range', target: 'Symmetric, pain-free hamstring range', source_refs: ['HS-MALLIAROPOULOS-REINJURY-2011'] },
      { name: 'Graded high-speed running completed', target: 'Exposure to near-maximal running / sprinting without symptoms', source_refs: ['HS-MENDIGUCHIA-ALGO-2017', 'HS-HEIDERSCHEIT-2010'] },
      { name: 'Sport-specific capacity', target: `Full ${input.sport || 'sport'} drills at intensity, no apprehension`, source_refs: ['HS-MENDIGUCHIA-ALGO-2017'] },
    ],
    note: 'Clinical clearance alone misses residual deficits — confirm objective strength and sprint exposure before return.',
  };
}
