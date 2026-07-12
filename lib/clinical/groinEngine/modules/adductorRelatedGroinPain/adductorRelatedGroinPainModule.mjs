/**
 * lib/clinical/groinEngine/modules/adductorRelatedGroinPain/adductorRelatedGroinPainModule.mjs
 * ---------------------------------------------------------------------------
 * Longstanding/chronic adductor-related groin pain module, modelled on the
 * Holmich active-training protocol (Holmich 1999). Placement is
 * irritability-driven (like tendinopathy/CAI), not a fixed days-since-injury
 * clock, since the trial population had a median 40-week symptom history —
 * this is a capacity-rebuilding condition, not an acute-injury one.
 * ---------------------------------------------------------------------------
 */

import { CHRONIC_GROIN_STAGES, SEVERITY_BANDS, GROIN_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { chronicGroinPool } from './adductorRelatedGroinPainExercises.mjs';
import { citeAll } from '../../citations/groinClinicalCitations.mjs';

/** Assess irritability from pain severity and resisted-adduction pain. */
export function assessChronicGroinPain(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const resistedSevere = input.resisted_adduction_pain === 'severe';

  let irritability;
  if (painSevere && resistedSevere) { irritability = 'high'; }
  else if (painSevere || resistedSevere || input.resisted_adduction_pain === 'moderate') { irritability = 'moderate'; }
  else { irritability = 'low'; }

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  const PROGNOSIS = {
    high: '10-14+ weeks (criteria-based active-training programme; ongoing maintenance needed after)',
    moderate: '8-12 weeks (criteria-based)',
    low: '6-10 weeks, with ongoing maintenance loading to prevent recurrence',
  };
  const WEEKS_ESTIMATE = { high: 12, moderate: 10, low: 8 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track pain on resisted adduction testing and during sport movements. Mild discomfort during loading is acceptable if it settles by the next day.',
    sources: citeAll(['GROIN-CIT-002', 'GROIN-CIT-001']),
  };
}

// CHRONIC_GROIN_STAGES share of the total recovery timeline (sums to 1).
const CHRONIC_GROIN_STAGE_SHARE = { isometric_settle: 0.15, progressive_strengthening: 0.40, sport_specific_loading: 0.25, return_to_sport: 0.20 };

export function placeChronicGroinStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'isometric_settle';
    case 'moderate': return 'progressive_strengthening';
    case 'low':
    default:
      return 'sport_specific_loading';
  }
}

export function runAdductorRelatedGroinPain(input) {
  const assessment = assessChronicGroinPain(input);
  const currentStage = placeChronicGroinStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'resisted-adduction pain climbing rather than settling across sessions',
      'pain that does not settle by the next day',
      'a new sharp/acute-feeling pain distinct from the usual ache',
    ],
    stop_rule: 'Reduce load if resisted-adduction pain worsens across days or a new sharp pain appears.',
    card_cautions: ['Keep a maintenance strengthening habit — this condition recurs without ongoing adductor loading.'],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(CHRONIC_GROIN_STAGES, assessment.totalWeeksEstimate, CHRONIC_GROIN_STAGE_SHARE);
  const plan = buildStagedPlan(CHRONIC_GROIN_STAGES, currentStage, chronicGroinPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: GROIN_ENTITIES.ADDUCTOR_RELATED_GROIN_PAIN,
    diagnosis: {
      summary: `Longstanding adductor-related groin pain — ${assessment.irritability} irritability. Active-training programme entry: ${currentStage}.`,
      assessment,
      approach: 'active strengthening programme (Holmich protocol) -> progressive strength -> sport-specific/eccentric loading -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'progressive — full-range motion work is appropriate; the focus is active strengthening, not stretch caution.',
    checkin_policy: {
      withhold_if: (c) => typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7,
      withhold_message: 'Groin pain was high during loading (>=7/10). Drop back to pain-settling isometrics today and reduce load.',
    },
    ...BETA_META,
  };
}
