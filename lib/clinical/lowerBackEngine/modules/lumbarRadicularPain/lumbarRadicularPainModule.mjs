/**
 * lib/clinical/lowerBackEngine/modules/lumbarRadicularPain/lumbarRadicularPainModule.mjs
 * ---------------------------------------------------------------------------
 * Lumbar radicular pain (disc-related pain with leg symptoms, no red flags)
 * module. Placement is irritability-driven — most cases improve gradually
 * over weeks to a few months with conservative, active management.
 * ---------------------------------------------------------------------------
 */

import { LUMBAR_RADICULAR_PAIN_STAGES, SEVERITY_BANDS, LOWER_BACK_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { lumbarRadicularPainPool } from './lumbarRadicularPainExercises.mjs';
import { citeAll } from '../../citations/lowerBackClinicalCitations.mjs';

/** Assess irritability from pain severity, leg symptoms, and ability to continue activity. */
export function assessLumbarRadicularPain(input) {
  const flags = [];
  const painSevere = input.pain_severity_label === 'severe';
  const cannotContinue = input.ability_to_continue === 'no';
  const numbnessPresent = input.numbness_tingling_leg === 'yes';

  let irritability;
  if (painSevere && cannotContinue) { irritability = 'high'; }
  else if (painSevere || cannotContinue || numbnessPresent) { irritability = 'moderate'; }
  else { irritability = 'low'; }

  if (numbnessPresent) flags.push('numbness_tingling_leg');

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  // Most lumbar disc-related radicular pain improves gradually over weeks to
  // a few months of conservative management; higher irritability needs a
  // longer settling phase.
  const PROGNOSIS = {
    high: '12-20 weeks (criteria-based; most cases improve gradually over weeks to a few months)',
    moderate: '10-16 weeks (criteria-based)',
    low: '8-12 weeks, with ongoing maintenance loading to prevent recurrence',
  };
  const WEEKS_ESTIMATE = { high: 16, moderate: 12, low: 9 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track leg symptoms (do they stay the same, move toward the back, or move further down the leg) alongside back pain. Seek review if numbness/weakness progresses.',
    sources: citeAll(['LB-CIT-004', 'LB-CIT-005']),
  };
}

// LUMBAR_RADICULAR_PAIN_STAGES share of the total recovery timeline (sums to 1).
const LUMBAR_RADICULAR_PAIN_STAGE_SHARE = { settle_nerve_irritability: 0.20, restore_neural_tolerance: 0.30, build_strength_and_capacity: 0.30, return_to_sport: 0.20 };

export function placeLumbarRadicularPainStage(assessment) {
  switch (assessment.irritability) {
    case 'high': return 'settle_nerve_irritability';
    case 'moderate': return 'restore_neural_tolerance';
    case 'low':
    default:
      return 'build_strength_and_capacity';
  }
}

export function runLumbarRadicularPain(input) {
  const assessment = assessLumbarRadicularPain(input);
  const currentStage = placeLumbarRadicularPainStage(assessment);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'leg symptoms moving further down the leg (peripheralising) rather than toward the back',
      'new or progressing numbness or weakness',
      'pain that does not settle by the next day',
    ],
    stop_rule: 'Ease back to gentler movement if leg symptoms worsen or move further down the leg, and seek review if new/progressing numbness or weakness develops.',
    card_cautions: ['Seek clinician review promptly if you develop saddle numbness, bladder/bowel changes, or symptoms in both legs — these need urgent assessment.'],
    stretch_caution: true,
  };

  const stageWeeks = splitStageWeeks(LUMBAR_RADICULAR_PAIN_STAGES, assessment.totalWeeksEstimate, LUMBAR_RADICULAR_PAIN_STAGE_SHARE);
  const plan = buildStagedPlan(LUMBAR_RADICULAR_PAIN_STAGES, currentStage, lumbarRadicularPainPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: LOWER_BACK_ENTITIES.LUMBAR_RADICULAR_PAIN,
    diagnosis: {
      summary: `Lumbar radicular pain (disc-related, no red flags) — ${assessment.irritability} irritability. Conservative programme entry: ${currentStage}.`,
      assessment,
      approach: 'settle nerve irritability with directional preference -> restore neural tolerance -> build strength and capacity -> return to sport (+maintenance)',
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'cautious — gentle nerve gliding (sliding, not aggressive stretching) is appropriate; avoid forceful end-range neural stretching, especially early.',
    checkin_policy: {
      withhold_if: (c) => (typeof c.pain_during_0_10 === 'number' && c.pain_during_0_10 >= 7) || c.leg_symptoms_worse === true,
      withhold_message: 'Pain was high during loading (>=7/10) or leg symptoms worsened. Drop back to gentle, non-provocative movement today and seek review if this persists.',
    },
    ...BETA_META,
  };
}
