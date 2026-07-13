/**
 * lib/clinical/kneeEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Knee Engine orchestrator (hybrid: shared core + per-entity config).
 *
 *   makeKneeInput(raw) -> routeEntity -> per-entity diagnosis + staged plan,
 *   OR a clinician referral for surgical/urgent patterns and red flags.
 *
 * Extensor-mechanism tendons are handed off to the quad engine. BETA SCOPE only;
 * no clinical authority. See RESEARCH.md for the cited evidence base.
 * ---------------------------------------------------------------------------
 */

import { KNEE_ENTITIES, KNEE_STAGES, SEVERITY_BANDS, BETA_META } from './types.mjs';
import { makeKneeInput, routeEntity } from './kneeAssessmentInput.mjs';
import { kneePool, kneeEntityStages } from './kneeExerciseBank.mjs';
import { citeAll } from './citations/kneeClinicalCitations.mjs';
import { resolveKneeRts } from './kneeRtsReadiness.mjs';
import { kneeWarmupCard, kneeCooldownCard } from './kneeWarmupCooldown.mjs';
import { splitStageWeeks } from '../core/sessionCore.mjs';

// Ballpark recovery-window ESTIMATES (weeks) per entity + functional severity
// band — beta defaults giving a real answer to "how many weeks", not
// per-patient precision. Wide, literature-informed ranges (see RESEARCH.md);
// clinician review still required before any production use.
const ENTITY_WEEKS_ESTIMATE = {
  acl_injury: { lower_functional_impact: 24, moderate_functional_impact: 30, high_concern_or_review_gated: 36 },
  pcl_injury: { lower_functional_impact: 10, moderate_functional_impact: 14, high_concern_or_review_gated: 18 },
  mcl_injury: { lower_functional_impact: 5, moderate_functional_impact: 7, high_concern_or_review_gated: 10 },
  lcl_plc_injury: { lower_functional_impact: 10, moderate_functional_impact: 14, high_concern_or_review_gated: 18 },
  meniscus_tear: { lower_functional_impact: 7, moderate_functional_impact: 10, high_concern_or_review_gated: 14 },
  patellofemoral_pain: { lower_functional_impact: 6, moderate_functional_impact: 9, high_concern_or_review_gated: 12 },
  patellar_instability: { lower_functional_impact: 10, moderate_functional_impact: 13, high_concern_or_review_gated: 16 },
  knee_osteoarthritis: { lower_functional_impact: 8, moderate_functional_impact: 10, high_concern_or_review_gated: 12 },
  itb_syndrome: { lower_functional_impact: 6, moderate_functional_impact: 8, high_concern_or_review_gated: 10 },
  osgood_schlatter: { lower_functional_impact: 6, moderate_functional_impact: 9, high_concern_or_review_gated: 12 },
};

const ENTITY_TITLES = {
  acl_injury: 'Anterior cruciate ligament (ACL) injury',
  pcl_injury: 'Posterior cruciate ligament (PCL) injury',
  mcl_injury: 'Medial collateral ligament (MCL) injury',
  lcl_plc_injury: 'Lateral collateral / posterolateral corner injury',
  meniscus_tear: 'Meniscal tear',
  patellofemoral_pain: 'Patellofemoral pain (anterior knee pain)',
  patellar_instability: 'Patellar instability / dislocation',
  knee_osteoarthritis: 'Knee osteoarthritis',
  itb_syndrome: 'Iliotibial band syndrome',
  osgood_schlatter: 'Osgood-Schlatter (tibial-tubercle apophysitis)',
};

// Which entities are surgical/urgent under what conditions, and their citations.
const ENTITY_CONFIG = {
  acl_injury: {
    sources: ['KNEE-CIT-002', 'KNEE-CIT-003', 'KNEE-CIT-013', 'KNEE-CIT-014'],
    note: 'High-quality rehabilitation is a legitimate primary pathway; surgery is a shared decision, not a default (Filbay 2025). Criteria-based return.',
    referral: (i) => i.surgical_repair_done ? null : (needsUrgentReview(i) ? urgent('Suspected ACL rupture with red-flag features — in-person assessment + imaging advised.') : null),
  },
  pcl_injury: {
    sources: ['KNEE-CIT-001', 'KNEE-CIT-013'],
    note: 'Most isolated PCL injuries are managed conservatively with a quad-focused program; avoid early resisted hamstring loading. Grade III/combined -> surgical review.',
    referral: (i) => (i.laxity_grade === 3 || i.high_energy_trauma) ? urgent('High-grade or combined PCL injury — surgical/specialist review advised.') : null,
  },
  mcl_injury: {
    sources: ['KNEE-CIT-012'],
    note: 'Isolated grade I-II MCL heals well conservatively with valgus-protected progressive loading.',
    referral: (i) => (i.laxity_grade === 3) ? urgent('High-grade MCL (and possible combined injury) — specialist review advised.') : null,
  },
  lcl_plc_injury: {
    sources: ['KNEE-CIT-001'],
    note: 'Lateral/posterolateral-corner injuries are often high-energy and combined; high-grade injuries usually need surgery.',
    referral: (i) => (i.laxity_grade >= 2 || i.high_energy_trauma || i.giving_way === 'yes') ? urgent('Lateral / posterolateral-corner injury — these often need surgical assessment; see a specialist.') : null,
  },
  meniscus_tear: {
    sources: ['KNEE-CIT-001', 'KNEE-CIT-004'],
    note: 'Conservative exercise is first-line, including for degenerative tears with mechanical symptoms. A truly locked knee (block to extension) needs surgical assessment.',
    referral: (i) => (i.locking_or_block === 'yes') ? urgent('Locked knee / block to full extension can mean a displaced (bucket-handle) tear — in-person assessment advised.') : null,
  },
  patellofemoral_pain: { sources: ['KNEE-CIT-001', 'KNEE-CIT-005'], note: 'Hip + knee strengthening with load modification; no surgery indicated.', referral: () => null },
  patellar_instability: {
    sources: ['KNEE-CIT-006', 'KNEE-CIT-007'],
    note: 'Physical therapy is essential; bracing has no clear long-term benefit. Recurrent dislocation or anatomic risk -> surgical (MPFL) review.',
    referral: (i) => (i.recurrent_dislocation === 'yes') ? clinician('Recurrent patellar dislocation — MPFL/surgical review is recommended; rehab continues alongside.') : null,
  },
  knee_osteoarthritis: { sources: ['KNEE-CIT-008', 'KNEE-CIT-009'], note: 'Exercise + education + weight management (strongly recommended). Function-focused, not curative.', referral: () => null },
  itb_syndrome: { sources: ['KNEE-CIT-010'], note: 'Load management + hip strengthening + running-form change.', referral: () => null },
  osgood_schlatter: { sources: ['KNEE-CIT-011'], note: 'Self-limiting apophysitis; activity modification and pain-guided loading.', referral: (i) => (i.age_group && i.age_group !== 'adolescent') ? clinician('Tibial-tubercle pain outside the typical adolescent window — review to exclude other causes.') : null },
};

function urgent(message) { return { urgency: 'urgent', clinician_required: true, message, sources: [] }; }
function clinician(message) { return { urgency: 'routine', clinician_required: true, message, sources: [] }; }
function needsUrgentReview(i) {
  return i.giving_way === 'yes' || (i.swelling_timing === 'immediate' && i.swelling_amount === 'significant') || i.weight_bearing === 'unable' || i.high_energy_trauma === true;
}

/** Functional severity band from generic signals. */
function severityFor(input) {
  if (input.weight_bearing === 'unable' || input.giving_way === 'yes' || input.laxity_grade === 3) return SEVERITY_BANDS.HIGH_CONCERN;
  if (input.pain_severity_label === 'severe' || input.laxity_grade === 2) return SEVERITY_BANDS.MODERATE;
  if (input.pain_severity_label === 'moderate') return SEVERITY_BANDS.MODERATE;
  return SEVERITY_BANDS.LOWER;
}

/** Pick the entry stage from time, surgery, and function. */
function entryStage(entity, input, band) {
  const stages = kneeEntityStages(entity);
  if (!stages.length) return 'protect';
  if (input.surgical_repair_done) {
    const w = input.weeks_since_surgery ?? 0;
    if (w < 2) return pick(stages, 'protect');
    if (w < 6) return pick(stages, 'activate');
    if (w < 16) return pick(stages, 'strengthen');
    if (w < 24) return pick(stages, 'dynamic');
    return pick(stages, 'return');
  }
  if (band === SEVERITY_BANDS.HIGH_CONCERN) return pick(stages, 'protect');
  const d = input.days_since_injury ?? 7;
  // Load-based chronic entities (PFPS/OA/ITB/OSD) start at activate/strengthen.
  const chronic = ['patellofemoral_pain', 'knee_osteoarthritis', 'itb_syndrome', 'osgood_schlatter'].includes(entity);
  if (chronic) return pick(stages, band === SEVERITY_BANDS.LOWER ? 'strengthen' : 'activate');
  if (d < 7 || band === SEVERITY_BANDS.MODERATE) return pick(stages, 'protect');
  if (d < 28) return pick(stages, 'activate');
  return pick(stages, 'strengthen');
}
function pick(stages, want) { return stages.includes(want) ? want : stages[0]; }

/** One card per bank exercise — knee's bank stores a single static dosage per
 * exercise (no tier escalation content yet), so every session in a stage
 * uses the same dosage; that's an honest reflection of current content
 * depth, not new escalation being invented. */
function kneeExerciseCard(e) {
  return {
    exercise_id: e.id, name: e.name, block: e.block, purpose: e.purpose,
    why_this_injury: e.why || null, dosage: e.dosage, dosage_status: 'beta_default_requires_review',
    equipment: e.equipment, cautions: e.cautions, source_refs: e.source_refs,
  };
}

/** Build one week of 3 sessions for a stage (bookended warm-up/cooldown +
 * whatever exercises the bank has for this stage). Non-current stages get
 * the exact same structure, marked preview_only throughout. */
function buildKneeStageWeek(entity, stage, isCurrent) {
  const pool = kneePool(entity, stage.id);
  const cards = [kneeWarmupCard(stage.id), ...pool.map(kneeExerciseCard), kneeCooldownCard(stage.id)];
  const sessions = [0, 1, 2].map((tier) => ({
    stage_id: stage.id, tier, tier_label: ['early', 'mid', 'late'][tier],
    cards: isCurrent ? cards : cards.map((c) => ({ ...c, preview_only: true })),
    preview_only: !isCurrent,
  }));
  return sessions;
}

function buildStagedPlan(entity, currentStageId, band) {
  const allStages = KNEE_STAGES.filter((s) => kneeEntityStages(entity).includes(s.id));

  const totalWeeksEstimate = (ENTITY_WEEKS_ESTIMATE[entity] || {})[band] || allStages.length;
  // Equal split across whichever stages actually apply to this entity — knee
  // doesn't yet have a clinically-sourced per-stage share table like
  // hamstring/quad, so an even split is the honest default (exact-summing
  // total via the shared largest-remainder allocator).
  const stageWeeks = splitStageWeeks(allStages, totalWeeksEstimate, {});

  // Stages allocated 0 weeks (minor presentations) are dropped — a short
  // estimate means a short plan, not a token week of every phase. If the
  // clinically-placed entry stage was trimmed, re-instate it in place of the
  // first kept phase (don't skip an acute knee straight to late-stage work).
  let stages = allStages.filter((s) => (stageWeeks[s.id] || 0) > 0);
  let curIdx = stages.findIndex((s) => s.id === currentStageId);
  if (curIdx < 0) {
    const placed = allStages.find((s) => s.id === currentStageId);
    if (placed && stages.length) {
      stageWeeks[placed.id] = stageWeeks[stages[0].id] || 1;
      stages = [placed, ...stages.slice(1)];
    }
    curIdx = 0;
  }

  const stageBlocks = stages.map((stage, idx) => {
    const status = idx === curIdx ? 'current' : idx < curIdx ? 'earlier' : 'upcoming';
    const isCurrent = status === 'current';
    const weeksCount = stageWeeks[stage.id] || 1;
    const pool = kneePool(entity, stage.id);

    const weeks = [];
    for (let w = 0; w < weeksCount; w++) weeks.push({ week_index: w, sessions: buildKneeStageWeek(entity, stage, isCurrent) });

    return {
      stage_id: stage.id, stage_name: stage.clinical_name, friendly_name: stage.friendly_name,
      status, is_current: isCurrent,
      weeks,
      exercise_count: pool.length,
      duration_weeks: weeksCount,
      progression_note: `~${weeksCount} week${weeksCount > 1 ? 's' : ''} · 3x/week training, rest days between sessions for adaptation.`,
    };
  });

  const totalWeeks = stageBlocks.reduce((sum, s) => sum + (s.duration_weeks || 0), 0) || null;

  return {
    current_stage_id: stages[curIdx]?.id || (stages[0] && stages[0].id),
    current_stage_name: stages[curIdx]?.clinical_name || '',
    stages: stageBlocks,
    total_estimated_weeks: totalWeeks,
    ...BETA_META,
  };
}

/** Run the full knee engine over raw assessment answers. */
export function runKnee(rawInput) {
  const { input, missingCoreFields } = makeKneeInput(rawInput);
  const routing = routeEntity(input);
  const base = { engine: 'knee_engine', beta_scope: 'knee_beta_testing_only', clinical_authority: false, input, missing_core_fields: missingCoreFields, routing, entity: routing.entity, ...BETA_META };

  // Hand off extensor-mechanism tendons to the quad engine.
  if (routing.entity === KNEE_ENTITIES.EXTENSOR_TENDON) {
    return { ...base, handoff: { engine: 'quad_engine', reason: 'Patellar/quadriceps tendon — use the quadriceps tendinopathy/rupture pathway.' }, plan: null };
  }

  const cfg = ENTITY_CONFIG[routing.entity] || { sources: [], note: '', referral: () => null };
  const band = severityFor(input);

  // Red flags (of ANY kind) or an entity-specific urgent referral -> surface a
  // referral and withhold the autonomous plan. Safety gate: a hot/febrile joint,
  // high-energy trauma, a true locked knee or gross instability must never yield
  // a self-guided plan even when the routed entity has no urgent referral rule.
  const referral = cfg.referral(input);
  const hasRedFlags = (routing.red_flags || []).length > 0;
  const urgentReferral = referral && referral.urgency === 'urgent';
  if (urgentReferral || hasRedFlags) {
    const safetyReferral = urgentReferral
      ? { ...referral, red_flags: routing.red_flags }
      : {
          urgency: 'urgent',
          clinician_required: true,
          message: 'One or more safety warning signs are present. Seek in-person medical assessment before starting any rehabilitation.',
          red_flags: routing.red_flags,
        };
    return { ...base, autonomous_plan: false, clinician_required: true, severity_band: band,
      diagnosis: { summary: `${ENTITY_TITLES[routing.entity]} — urgent review.`, note: cfg.note, red_flags: routing.red_flags, sources: citeAll(cfg.sources) },
      referral: safetyReferral, plan: null };
  }

  const currentStage = entryStage(routing.entity, input, band);
  const plan = buildStagedPlan(routing.entity, currentStage, band);

  return {
    ...base,
    autonomous_plan: true,
    clinician_required: !!(referral && referral.clinician_required) || hasRedFlags,
    severity_band: band,
    diagnosis: {
      summary: `${ENTITY_TITLES[routing.entity]}${input.laxity_grade ? ` — grade ${input.laxity_grade}` : ''}.`,
      note: cfg.note,
      band, red_flags: routing.red_flags, flags: routing.flags,
      sources: citeAll(cfg.sources),
    },
    referral: referral || null,
    plan,
    rts_readiness: resolveKneeRts(input, routing.entity),
    match_confidence_label: routing.confidence,
  };
}

export { makeKneeInput, routeEntity } from './kneeAssessmentInput.mjs';
export { KNEE_ENTITIES, KNEE_STRUCTURES } from './types.mjs';
export { KNEE_CITATIONS } from './citations/kneeClinicalCitations.mjs';
