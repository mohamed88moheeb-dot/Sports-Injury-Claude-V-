/**
 * lib/clinical/hipFlexorEngine/modules/iliopsoasStrain/iliopsoasStrainModule.mjs
 * ---------------------------------------------------------------------------
 * Acute iliopsoas (hip flexor) muscle strain module: grading, stage
 * placement, and a staged functional-rehab plan.
 * ---------------------------------------------------------------------------
 */

import { ILIOPSOAS_STRAIN_STAGES, STRAIN_GRADES, SEVERITY_BANDS, HIP_FLEXOR_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { iliopsoasStrainPool } from './iliopsoasStrainExercises.mjs';
import { citeAll } from '../../citations/hipFlexorClinicalCitations.mjs';

/** Grade an iliopsoas strain from self-reportable signs. */
export function gradeIliopsoasStrain(input) {
  const flags = [];
  const resisted = input.resisted_hip_flexion_pain;
  const painSevere = input.pain_severity_label === 'severe';
  const cannotContinue = input.ability_to_continue === 'no';

  let grade;
  if (resisted === 'severe' && cannotContinue) { grade = STRAIN_GRADES.III; flags.push('possible_high_grade_tear'); }
  else if (resisted === 'severe' || (painSevere && input.bruising_or_swelling === 'significant')) { grade = STRAIN_GRADES.II; }
  else if (resisted === 'moderate') { grade = STRAIN_GRADES.II; }
  else { grade = STRAIN_GRADES.I; }

  const band = grade === STRAIN_GRADES.III ? SEVERITY_BANDS.HIGH_CONCERN
    : grade === STRAIN_GRADES.II ? SEVERITY_BANDS.MODERATE
      : SEVERITY_BANDS.LOWER;

  const PROGNOSIS = {
    [STRAIN_GRADES.I]: '1-3 weeks',
    [STRAIN_GRADES.II]: '3-6 weeks',
    [STRAIN_GRADES.III]: '8-12+ weeks',
  };
  const WEEKS_ESTIMATE = { [STRAIN_GRADES.I]: 2, [STRAIN_GRADES.II]: 4.5, [STRAIN_GRADES.III]: 10 };

  return {
    grade, band, flags,
    prognosis: PROGNOSIS[grade],
    totalWeeksEstimate: WEEKS_ESTIMATE[grade],
    note: 'Grade is estimated from self-reported resisted-hip-flexion pain and function — clinical exam and imaging (US/MRI) are the reference standard for higher-grade tears.',
    sources: citeAll(['HIPFLEX-CIT-003']),
  };
}

// ILIOPSOAS_STRAIN_STAGES share of the total recovery timeline (sums to 1).
const ILIOPSOAS_STAGE_SHARE = { protect: 0.15, restore_movement: 0.25, build_strength: 0.35, return_to_sport: 0.25 };

/** Place into a stage from days-since-injury + functional signs. */
export function placeIliopsoasStage(input, severity) {
  const days = input.days_since_injury ?? 7;
  if (severity.grade === STRAIN_GRADES.III && days < 7) return 'protect';
  if (input.ability_to_continue === 'no' && days < 10) return 'protect';
  if (days < 5) return 'protect';
  if (days < 14) return 'restore_movement';
  if (days < 28) return 'build_strength';
  return 'return_to_sport';
}

export function runIliopsoasStrain(input) {
  const severity = gradeIliopsoasStrain(input);
  const currentStage = placeIliopsoasStage(input, severity);

  const policy = {
    max_items: 5,
    monitoring_triggers: [
      'increasing swelling or bruising at the front of the hip',
      'a new "pulling" or sharp sensation during loading',
      'pain that increases session to session instead of settling',
    ],
    stop_rule: 'Stop and ease back if pain climbs during or the next morning, or if you feel a new sharp/pulling sensation.',
    card_cautions: severity.band === SEVERITY_BANDS.HIGH_CONCERN ? ['Higher-grade pattern — progress more gradually and keep a lower threshold for clinician review.'] : [],
    stretch_caution: false,
  };

  const stageWeeks = splitStageWeeks(ILIOPSOAS_STRAIN_STAGES, severity.totalWeeksEstimate, ILIOPSOAS_STAGE_SHARE);
  const plan = buildStagedPlan(ILIOPSOAS_STRAIN_STAGES, currentStage, iliopsoasStrainPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_STRAIN,
    diagnosis: {
      summary: `Acute iliopsoas (hip flexor) muscle strain — grade ${severity.grade.slice(-1)}. Estimated recovery ${severity.prognosis}.`,
      severity,
      flags: severity.flags,
    },
    plan,
    stretch_policy: 'progressive — gentle stretch is appropriate once pain-free at rest.',
    checkin_policy: {
      withhold_if: (c) => c.swelling_change === 'more' || c.new_sharp_pain === true,
      withhold_message: 'Swelling increased or a new sharp/pulling sensation occurred — pause loading, rest, and consider a clinician check if this persists.',
    },
    ...BETA_META,
  };
}
