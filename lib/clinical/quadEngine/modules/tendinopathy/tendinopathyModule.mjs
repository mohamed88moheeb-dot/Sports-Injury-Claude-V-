/**
 * lib/clinical/quadEngine/modules/tendinopathy/tendinopathyModule.mjs
 * ---------------------------------------------------------------------------
 * Quad / patellar TENDINOPATHY module: stage placement on the loading ladder,
 * VISA-P / decline-squat pain gating, and a staged loading plan.
 *
 * Stage logic (Rio 2015; Lim 2018; Kongsgaard 2009; Burton 2022):
 *   isometric        -> high irritability / high pain: settle first
 *   isotonic_hsr     -> pain controlled: build capacity with heavy slow load
 *   energy_storage   -> good capacity: re-introduce eccentric/spring load
 *   return_to_sport  -> low symptoms + capacity: sport exposure + maintenance
 * ---------------------------------------------------------------------------
 */

import { TENDINOPATHY_STAGES, SEVERITY_BANDS, QUAD_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan } from '../../shared/quadSessionCore.mjs';
import { tendinopathyPool } from './tendinopathyExercises.mjs';
import { citeAll } from '../../citations/quadClinicalCitations.mjs';

/**
 * Assess irritability from decline-squat pain (0-10) and/or VISA-P (0-100,
 * lower = worse). These drive stage placement.
 */
export function assessTendinopathy(input) {
  const pain = input.decline_squat_pain_0_10;
  const visa = input.visa_p_score;
  const flags = [];

  let irritability;
  if (pain != null) {
    if (pain >= 7) irritability = 'high';
    else if (pain >= 4) irritability = 'moderate';
    else irritability = 'low';
  } else if (visa != null) {
    if (visa < 50) irritability = 'high';
    else if (visa < 80) irritability = 'moderate';
    else irritability = 'low';
  } else {
    irritability = input.pain_severity_label === 'severe' ? 'high'
      : input.pain_severity_label === 'moderate' ? 'moderate' : 'low';
    flags.push('no_decline_squat_or_visa_score_estimate_only');
  }

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  return {
    irritability, decline_squat_pain: pain, visa_p: visa, band, flags,
    monitoring: 'Track pain on the single-leg decline squat (0-10). Up to ~3-5/10 during loading is acceptable provided it settles by the next morning.',
    sources: citeAll(['QUAD-CIT-007', 'QUAD-CIT-008', 'QUAD-CIT-009', 'QUAD-CIT-010']),
  };
}

export function placeTendinopathyStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'isometric';
    case 'moderate': return 'isotonic_hsr';
    case 'low':
    default:
      // Low irritability — energy storage if pain very low, else consolidate HSR.
      return (assessment.decline_squat_pain != null && assessment.decline_squat_pain <= 2) ? 'energy_storage' : 'isotonic_hsr';
  }
}

export function runTendinopathy(input) {
  const assessment = assessTendinopathy(input);
  const currentStage = placeTendinopathyStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'decline-squat pain climbing above ~5/10 during loading',
      'morning pain/stiffness that does not settle (sign load was too high)',
      'pain that increases session to session',
    ],
    stop_rule: 'Reduce load if decline-squat pain exceeds ~5/10 or morning pain worsens across days.',
    card_cautions: ['Keep a maintenance loading habit — tendinopathy recurs without ongoing load.'],
  };

  const plan = buildStagedPlan(TENDINOPATHY_STAGES, currentStage, tendinopathyPool, policy);

  return {
    entity: QUAD_ENTITIES.TENDINOPATHY,
    diagnosis: {
      summary: `Quad/patellar tendinopathy — ${assessment.irritability} irritability. Loading ladder entry: ${currentStage}.`,
      assessment,
      loading_ladder: 'isometric (pain relief) -> heavy slow resistance (capacity) -> energy storage/eccentric (spring) -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'AVOID provocative compressive end-range early (deep squat, deep decline) until pain settles; progress range with capacity.',
    checkin_policy: {
      withhold_if: (c) => typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7,
      withhold_message: 'Tendon pain was high during loading (>=7/10). Drop back to pain-settling isometrics today and reduce load.',
    },
    ...BETA_META,
  };
}
