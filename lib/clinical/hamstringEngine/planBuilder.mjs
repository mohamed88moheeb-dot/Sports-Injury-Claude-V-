/**
 * lib/clinical/hamstringEngine/planBuilder.mjs
 * ---------------------------------------------------------------------------
 * Builds a real, staged hamstring rehabilitation plan, entity-aware and
 * evidence-anchored. Stages: protect -> lengthen -> strengthen -> return.
 * Each session is bookended with a stage-appropriate warm-up and cooldown so
 * it reads as a complete session (parity with the RF/knee engines).
 *
 * Exercise content is anchored to the corpus:
 *  - Askling L-protocol (extender / diver / glider) — lengthening bias.
 *  - Petersen / van der Horst — Nordic eccentric progression.
 *  - Sherry & Best — progressive agility + trunk stabilisation (lumbopelvic).
 *  - Mendiguchia / Tol — criteria-based RTS incl. eccentric strength symmetry
 *    and a graded high-speed running programme before clearance.
 * Tendinopathy and avulsion patterns get distinct handling.
 * ---------------------------------------------------------------------------
 */

import { HAMSTRING_ENTITIES } from './diagnosis.mjs';

const ex = (name, block, purpose, dosage, refs, why = '', cautions = []) =>
  ({ name, block, purpose, dosage, source_refs: refs, why_this_injury: why, cautions });

// Stage definitions (ordered) with friendly names.
const STAGES = [
  { id: 'protect', name: 'Protect & activate', friendly: 'Settle & activate' },
  { id: 'lengthen', name: 'Lengthening load', friendly: 'Restore length under load' },
  { id: 'strengthen', name: 'Progressive strength', friendly: 'Build eccentric strength' },
  { id: 'return', name: 'Return to sprint & sport', friendly: 'Reload speed & sport' },
];

// Entity → per-stage exercise bank (strain entities). Tendinopathy overrides below.
function strainBank(entity, sport) {
  const sportPrep = sport === 'endurance' ? 'graded running volume' : 'graded sprint / change-of-direction';
  return {
    protect: [
      ex('Pain-free isometric hamstring holds', 'activation', 'Restore hamstring activation without provoking the healing tissue', { sets: '4–5', hold: '20–45 s', detail: 'within tolerable symptoms' }, ['HS-HICKEY-PAINFREE-2020', 'HS-HEIDERSCHEIT-2010'], 'Early activation limits shutdown; loading into a tolerable level of pain is acceptable and does not worsen outcomes.'),
      ex('Lumbopelvic / trunk control drills', 'motor_control', 'Neuromuscular control of the pelvis and trunk', { sets: '3', reps: '8–10', detail: 'controlled' }, ['HS-SHERRY-BEST-2004'], 'Progressive agility + trunk stabilisation lowers reinjury vs isolated stretching/strengthening.'),
      ex('Gentle pain-free range work (supine, single-leg)', 'mobility', 'Recover pain-free range', { sets: '2–3', detail: 'to comfortable range, no stretch pain' }, ['HS-MALLIAROPOULOS-REINJURY-2011'], 'Delayed recovery of pain-free range is linked to reinjury.', ['Do not stretch into pain early.']),
    ],
    lengthen: [
      ex('Askling “extender” (controlled hip flexion, knee extension)', 'tissue_specific_loading', 'Load the hamstring at longer muscle lengths', { sets: '3', reps: '12', detail: 'slow, pain-free end-range' }, ['HS-ASKLING-FOOTBALL-2013', 'HS-ASKLING-SPRINT-2014'], 'Lengthening-biased loading shortens return time vs conventional loading.'),
      ex('Askling “diver” (single-leg hip hinge to horizontal)', 'tissue_specific_loading', 'Eccentric control through range with balance demand', { sets: '3', reps: '6 each', detail: 'controlled' }, ['HS-ASKLING-FOOTBALL-2013'], 'Trains the hamstring eccentrically at length in a functional pattern.'),
      ex('Askling “glider” (slide-board eccentric)', 'tissue_specific_loading', 'Progressive eccentric lengthening', { sets: '3', reps: '4 each', detail: 'increase glide distance as pain allows' }, ['HS-ASKLING-SPRINT-2014'], 'The most demanding lengthening exercise; introduced as symptoms settle.', ['Progress range only as symptoms allow.']),
    ],
    strengthen: [
      ex('Nordic hamstring exercise (eccentric)', 'tissue_specific_loading', 'Build eccentric strength & fascicle length', { sets: '3', reps: '5–8', detail: 'control the lower; progress range' }, ['HS-PETERSEN-2011', 'HS-VANDERHORST-NHE-2015', 'HS-BOURNE-FRAMEWORK-2018'], 'Eccentric strengthening reduces new and recurrent hamstring injuries.', ['Expect DOMS early; keep controlled.']),
      ex('Romanian deadlift / hip-hinge (progressive load)', 'strength_support', 'Hip-dominant strength through range', { sets: '4', reps: '6–8', load: 'progressive' }, ['HS-BOURNE-FRAMEWORK-2018'], 'Hip-extension-biased loading complements knee-flexion-biased work.'),
      ex('Single-leg hip-hinge & split-stance work', 'strength_support', 'Address limb asymmetry', { sets: '3', reps: '8 each' }, ['HS-TOL-ISOKINETIC-2014'], 'Most athletes retain strength deficits at return — target symmetry directly.'),
    ],
    return: [
      ex(`Graded high-speed running programme (${sportPrep})`, 'running_sport_prep', 'Restore high-speed running capacity', { sets: '—', detail: 'linear → curved → planned → reactive; build % max speed' }, ['HS-MENDIGUCHIA-ALGO-2017', 'HS-HEIDERSCHEIT-2010'], 'Maximal sprinting exposure is required before clearance — hamstrings fail at top speed.', ['Do not clear without exposure to near-maximal running.']),
      ex('Eccentric strength symmetry check', 'running_sport_prep', 'Confirm restored eccentric strength', { sets: '—', detail: 'target limb symmetry before RTS' }, ['HS-TOL-ISOKINETIC-2014'], 'Clinical clearance alone misses residual eccentric deficits.'),
      ex('Sport-specific reintegration', 'sport_reintegration', 'Rebuild sport-specific demands', { sets: '—', detail: 'progressive drills to full training' }, ['HS-MENDIGUCHIA-ALGO-2017'], `Tailored to ${sport || 'sport'} demands.`),
    ],
  };
}

function tendinopathyBank() {
  return {
    protect: [
      ex('Long-lever isometric hamstring holds', 'tissue_specific_loading', 'Reduce pain and begin tendon loading', { sets: '4–5', hold: '30–45 s' }, ['HS-HEIDERSCHEIT-2010'], 'Isometrics can reduce tendon pain and start load tolerance.', ['Avoid deep hip-flexion (compressive) positions early.']),
      ex('Lumbopelvic control', 'motor_control', 'Pelvic control to offload the tendon', { sets: '3', reps: '10' }, ['HS-SHERRY-BEST-2004'], ''),
    ],
    lengthen: [
      ex('Mid-range hip-hinge (avoid deep compression)', 'tissue_specific_loading', 'Progressive tendon loading in a tolerable range', { sets: '3', reps: '10' }, ['HS-BOURNE-FRAMEWORK-2018'], 'Progress load while avoiding compressive end-range early.', ['Avoid end-range hip flexion under load initially.']),
    ],
    strengthen: [
      ex('Heavy slow resistance hip-hinge / bridge', 'tissue_specific_loading', 'Build tendon capacity', { sets: '3–4', reps: '6–8', load: 'heavy, slow tempo' }, ['HS-BOURNE-FRAMEWORK-2018'], 'Progressive heavy loading builds tendon capacity.'),
      ex('Nordic / eccentric progression (as tolerated)', 'tissue_specific_loading', 'Eccentric capacity', { sets: '3', reps: '6' }, ['HS-PETERSEN-2011'], ''),
    ],
    return: [
      ex('Graded running & energy-storage loading', 'running_sport_prep', 'Reintroduce running/plyometric load', { sets: '—', detail: 'progress as pain <=3/10 and settles by next day' }, ['HS-MENDIGUCHIA-ALGO-2017'], 'Monitor 24-h symptom response as the progression guide.'),
      ex('Sport-specific reintegration', 'sport_reintegration', 'Return to sport demands', { sets: '—', detail: 'progressive' }, ['HS-MENDIGUCHIA-ALGO-2017'], ''),
    ],
  };
}

const WARMUP = {
  protect: ex('Warm-up — gentle raise & pain-free range', 'warm_up', 'Warm the tissue before loading; no stretch into pain', { sets: '1', detail: '6–8 min easy bike/walk + pain-free range' }, [], 'Movement, not stretch, for early healing tissue.'),
  lengthen: ex('Warm-up (RAMP) — raise, activate, mobilise', 'warm_up', 'Prepare the hamstring for lengthening load', { sets: '1', detail: '8–10 min, glute + hamstring activation' }, [], 'Prime the muscle before end-range loading.'),
  strengthen: ex('Warm-up (RAMP) — raise, activate, mobilise', 'warm_up', 'Prepare for heavier eccentric loading', { sets: '1', detail: '8–10 min build' }, [], ''),
  return: ex('Warm-up — sprint potentiation', 'warm_up', 'Prime the nervous system for high-speed running', { sets: '1', detail: '12–15 min: drills + graded build-up runs' }, [], 'Never one hard sprint from cold.'),
};
const COOLDOWN = {
  protect: ex('Cooldown & recovery', 'cool_down', 'Down-regulate and support healing', { sets: '1', detail: '5 min easy + sleep/protein/hydration' }, [], 'Recovery behaviours drive tissue repair.'),
  lengthen: ex('Cooldown & recovery', 'cool_down', 'Down-regulate; note next-day response', { sets: '1', detail: '6–8 min' }, [], 'A rise in next-day symptoms means ease the load.'),
  strengthen: ex('Cooldown, recovery & load management', 'cool_down', 'Manage weekly load so tissue adapts', { sets: '1', detail: '8–10 min' }, [], 'Keep hard days apart.'),
  return: ex('Cooldown, recovery & load management', 'cool_down', 'Protect the weekly load balance', { sets: '1', detail: '8–10 min' }, [], 'Respect the next-day signal.'),
};

/** Pick the entry stage from timeline + severity. */
function entryStage(weeks_since, band) {
  if (band === 'high_concern') return 'protect';
  if (weeks_since === 'acute') return 'protect';
  if (weeks_since === 'subacute') return band === 'lower' ? 'lengthen' : 'protect';
  return 'strengthen'; // late
}

/**
 * @param {object} diagnosis output of diagnoseHamstring
 * @param {object} input normalized input
 * @returns {object|null} staged plan, or null if referral-gated
 */
export function buildHamstringPlan(diagnosis, input) {
  if (diagnosis.entity === HAMSTRING_ENTITIES.PROXIMAL_AVULSION || diagnosis.review_required) return null;

  const bank = diagnosis.entity === HAMSTRING_ENTITIES.PROXIMAL_TENDINOPATHY
    ? tendinopathyBank()
    : strainBank(diagnosis.entity, input.sport);

  const current = entryStage(input.weeks_since, diagnosis.band);
  const curIdx = STAGES.findIndex((s) => s.id === current);

  const stages = STAGES.map((stage, idx) => {
    const core = bank[stage.id] || [];
    const cards = [WARMUP[stage.id], ...core, COOLDOWN[stage.id]].filter(Boolean);
    const status = idx === curIdx ? 'current' : idx < curIdx ? 'earlier' : 'upcoming';
    return {
      stage_id: stage.id, stage_name: stage.name, friendly_name: stage.friendly,
      status, is_current: idx === curIdx,
      sessions: [{ stage_id: stage.id, cards, preview_only: idx !== curIdx }],
      exercise_count: core.length,
    };
  });

  return {
    current_stage_id: STAGES[curIdx]?.id || 'protect',
    current_stage_name: STAGES[curIdx]?.name || 'Protect & activate',
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
