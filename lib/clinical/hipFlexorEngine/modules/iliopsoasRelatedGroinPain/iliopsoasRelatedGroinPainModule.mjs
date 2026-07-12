/**
 * lib/clinical/hipFlexorEngine/modules/iliopsoasRelatedGroinPain/iliopsoasRelatedGroinPainModule.mjs
 * ---------------------------------------------------------------------------
 * Chronic iliopsoas-related groin/hip-flexor pain module (including internal
 * snapping hip). Placement is irritability-driven, not a fixed
 * days-since-injury clock, since this is an overuse/capacity condition
 * (Walker 2021) — most cases resolve with 6-12 months of conservative,
 * active management.
 * ---------------------------------------------------------------------------
 */

import { CHRONIC_HIP_FLEXOR_STAGES, SEVERITY_BANDS, HIP_FLEXOR_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { chronicHipFlexorPool } from './iliopsoasRelatedGroinPainExercises.mjs';
import { citeAll } from '../../citations/hipFlexorClinicalCitations.mjs';

/** Assess irritability from pain severity and resisted-hip-flexion pain. */
export function assessChronicHipFlexorPain(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const resistedSevere = input.resisted_hip_flexion_pain === 'severe';

  let irritability;
  if (painSevere && resistedSevere) { irritability = 'high'; }
  else if (painSevere || resistedSevere || input.resisted_hip_flexion_pain === 'moderate') { irritability = 'moderate'; }
  else { irritability = 'low'; }

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  // Most snapping-hip / iliopsoas-related pain resolves within 6-12 months of
  // conservative management (Walker 2021) — framed here as a structured
  // programme plus ongoing maintenance, not a fixed short healing clock.
  const PROGNOSIS = {
    high: '12-20+ weeks (criteria-based; most cases settle within 6-12 months of consistent conservative management)',
    moderate: '10-16 weeks (criteria-based)',
    low: '8-12 weeks, with ongoing maintenance loading to prevent recurrence',
  };
  const WEEKS_ESTIMATE = { high: 16, moderate: 12, low: 9 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track pain on resisted hip flexion and with daily activities like stairs. A painless snap does not need to be avoided; a painful one is the sign to ease back.',
    sources: citeAll(['HIPFLEX-CIT-002', 'HIPFLEX-CIT-001']),
  };
}

// CHRONIC_HIP_FLEXOR_STAGES share of the total recovery timeline (sums to 1).
const CHRONIC_HIP_FLEXOR_STAGE_SHARE = { isometric_settle: 0.15, progressive_strengthening: 0.40, sport_specific_loading: 0.25, return_to_sport: 0.20 };

export function placeChronicHipFlexorStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'isometric_settle';
    case 'moderate': return 'progressive_strengthening';
    case 'low':
    default:
      return 'sport_specific_loading';
  }
}

export function runIliopsoasRelatedGroinPain(input) {
  const assessment = assessChronicHipFlexorPain(input);
  const currentStage = placeChronicHipFlexorStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'resisted-hip-flexion pain climbing rather than settling across sessions',
      'pain that does not settle by the next day',
      'a new sharp/acute-feeling pain distinct from the usual ache or snap',
    ],
    stop_rule: 'Reduce load if resisted-hip-flexion pain worsens across days or a new sharp pain appears.',
    card_cautions: ['Keep a maintenance strengthening/stretching habit — this condition recurs without ongoing hip flexor work.'],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(CHRONIC_HIP_FLEXOR_STAGES, assessment.totalWeeksEstimate, CHRONIC_HIP_FLEXOR_STAGE_SHARE);
  const plan = buildStagedPlan(CHRONIC_HIP_FLEXOR_STAGES, currentStage, chronicHipFlexorPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_RELATED_GROIN_PAIN,
    diagnosis: {
      summary: `Chronic iliopsoas-related hip-flexor/groin pain — ${assessment.irritability} irritability. Conservative programme entry: ${currentStage}.`,
      assessment,
      approach: 'isometric settling -> progressive strengthening + stretching -> sport-specific loading -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'progressive — hip flexor stretching is a standard part of conservative management here, not withheld.',
    checkin_policy: {
      withhold_if: (c) => typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7,
      withhold_message: 'Hip-flexor pain was high during loading (>=7/10). Drop back to pain-settling isometrics today and reduce load.',
    },
    ...BETA_META,
  };
}
