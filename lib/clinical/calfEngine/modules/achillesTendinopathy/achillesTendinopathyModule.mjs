/**
 * lib/clinical/calfEngine/modules/achillesTendinopathy/achillesTendinopathyModule.mjs
 * ---------------------------------------------------------------------------
 * Achilles tendinopathy module: stage placement on the loading ladder,
 * pain/stiffness gating, and a staged loading plan. Same evidence-based
 * ladder as quad's patellar-tendinopathy module, applied to the Achilles.
 * ---------------------------------------------------------------------------
 */

import { ACHILLES_STAGES, SEVERITY_BANDS, CALF_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { achillesPool } from './achillesTendinopathyExercises.mjs';
import { citeAll } from '../../citations/calfClinicalCitations.mjs';

/** Assess irritability from pain severity + morning stiffness. */
export function assessAchillesTendinopathy(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const stiff = input.morning_stiffness === 'yes';

  let irritability;
  if (painSevere && stiff) { irritability = 'high'; }
  else if (painSevere || (stiff && input.pain_severity_label === 'moderate')) { irritability = 'moderate'; }
  else { irritability = 'low'; }

  if (!stiff && input.morning_stiffness === UNKNOWN_LABEL) flags.push('no_stiffness_reported_estimate_only');

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  const PROGNOSIS = {
    high: '10-16+ weeks (criteria-based — tendons adapt slowly; needs a sustained loading programme)',
    moderate: '8-12 weeks (criteria-based)',
    low: '6-10 weeks, but ongoing maintenance loading is needed to prevent recurrence',
  };
  const WEEKS_ESTIMATE = { high: 13, moderate: 10, low: 8 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track next-morning tendon pain and stiffness. Up to ~3-5/10 during loading is acceptable provided it settles by the next morning.',
    sources: citeAll(['CALF-CIT-002']),
  };
}

const UNKNOWN_LABEL = 'unsure';

// ACHILLES_STAGES share of the total recovery timeline (sums to 1).
const ACHILLES_STAGE_SHARE = { isometric: 0.15, isotonic_hsr: 0.40, energy_storage: 0.25, return_to_sport: 0.20 };

export function placeAchillesStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'isometric';
    case 'moderate': return 'isotonic_hsr';
    case 'low':
    default:
      return 'isotonic_hsr';
  }
}

export function runAchillesTendinopathy(input) {
  const assessment = assessAchillesTendinopathy(input);
  const currentStage = placeAchillesStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'tendon pain climbing above ~5/10 during loading',
      'morning pain/stiffness that does not settle (sign load was too high)',
      'pain that increases session to session',
    ],
    stop_rule: 'Reduce load if tendon pain exceeds ~5/10 or morning pain worsens across days.',
    card_cautions: ['Keep a maintenance loading habit — tendinopathy recurs without ongoing load.'],
    stretch_caution: true,
  };

  const stageWeeks = splitStageWeeks(ACHILLES_STAGES, assessment.totalWeeksEstimate, ACHILLES_STAGE_SHARE);
  const plan = buildStagedPlan(ACHILLES_STAGES, currentStage, achillesPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: CALF_ENTITIES.ACHILLES_TENDINOPATHY,
    diagnosis: {
      summary: `Achilles tendinopathy — ${assessment.irritability} irritability. Loading ladder entry: ${currentStage}.`,
      assessment,
      loading_ladder: 'isometric (pain relief) -> heavy slow resistance (capacity) -> energy storage/eccentric (spring) -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'AVOID provocative deep dorsiflexion stretch early; progress range with capacity.',
    checkin_policy: {
      withhold_if: (c) => typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7,
      withhold_message: 'Tendon pain was high during loading (>=7/10). Drop back to pain-settling isometrics today and reduce load.',
    },
    ...BETA_META,
  };
}
