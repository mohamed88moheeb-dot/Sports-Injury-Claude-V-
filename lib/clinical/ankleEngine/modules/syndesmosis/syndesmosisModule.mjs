/**
 * lib/clinical/ankleEngine/modules/syndesmosis/syndesmosisModule.mjs
 * ---------------------------------------------------------------------------
 * STABLE syndesmotic ("high") ankle sprain module — no diastasis/instability
 * (those signs are safety-gated to referral upstream in the router). Recovery
 * runs slower than a lateral sprain and progression is more conservative on
 * the dorsiflexion/external-rotation directions (Williams 2015).
 * ---------------------------------------------------------------------------
 */

import { SPRAIN_STAGES, SEVERITY_BANDS, ANKLE_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { syndesmosisPool } from './syndesmosisExercises.mjs';
import { citeAll } from '../../citations/ankleClinicalCitations.mjs';

/** Assess irritability/severity for a stable syndesmosis sprain. */
export function assessSyndesmosis(input) {
  const flags = [];
  const wb = input.weight_bearing_ability;
  const painSevere = input.pain_severity_label === 'severe';

  let irritability;
  if (wb === 'unable' || painSevere) { irritability = 'high'; flags.push('high_irritability_syndesmosis'); }
  else if (wb === 'painful' || input.pain_severity_label === 'moderate') { irritability = 'moderate'; }
  else { irritability = 'low'; }

  const band = irritability === 'high' ? SEVERITY_BANDS.MODERATE : SEVERITY_BANDS.LOWER;

  // Syndesmotic sprains generally recover slower than lateral ligament
  // sprains (Williams 2015).
  const PROGNOSIS = {
    high: '10-14+ weeks (syndesmosis injuries recover slower than lateral ankle sprains)',
    moderate: '6-9 weeks',
    low: '4-6 weeks',
  };
  const WEEKS_ESTIMATE = { high: 12, moderate: 7.5, low: 5 };

  return {
    irritability, band, flags,
    prognosis: PROGNOSIS[irritability],
    totalWeeksEstimate: WEEKS_ESTIMATE[irritability],
    monitoring: 'Track pain through each step and with pivoting/rotation. Progress the dorsiflexion and rotation directions more slowly than a typical lateral sprain.',
    sources: citeAll(['ANKLE-CIT-006']),
  };
}

// SPRAIN_STAGES share of the total recovery timeline — protect and
// restore_motion run longer than for a lateral sprain, since the
// dorsiflexion/rotation directions are reintroduced more cautiously.
const SYNDESMOSIS_STAGE_SHARE = { protect: 0.20, restore_motion: 0.30, strength_balance: 0.30, return_to_sport: 0.20 };

/** Place into a stage from days-since-injury + functional signs. */
export function placeSyndesmosisStage(input, assessment) {
  const days = input.days_since_injury ?? 7;
  if (assessment.irritability === 'high' && days < 10) return 'protect';
  if (input.weight_bearing_ability === 'unable') return 'protect';
  if (input.weight_bearing_ability === 'painful' && days < 14) return 'protect';
  if (days < 7) return 'protect';
  if (days < 21) return 'restore_motion';
  if (days < 42) return 'strength_balance';
  return 'return_to_sport';
}

export function runSyndesmosis(input) {
  const assessment = assessSyndesmosis(input);
  const currentStage = placeSyndesmosisStage(input, assessment);

  const policy = {
    max_items: 5,
    monitoring_triggers: [
      'pain climbing above the ankle mortise during loading',
      'new or worsening pain with pivoting/rotation',
      'swelling or bruising increasing rather than settling',
    ],
    stop_rule: 'Stop and ease back if pain through the ankle climbs during or the next morning, especially with rotation/pivoting movements.',
    card_cautions: ['Progress the dorsiflexion (toes-up) and rotation directions more slowly than you would for a typical ankle sprain.'],
    stretch_caution: true,
  };

  const stageWeeks = splitStageWeeks(SPRAIN_STAGES, assessment.totalWeeksEstimate, SYNDESMOSIS_STAGE_SHARE);
  const plan = buildStagedPlan(SPRAIN_STAGES, currentStage, syndesmosisPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: ANKLE_ENTITIES.SYNDESMOSIS_SPRAIN,
    diagnosis: {
      summary: `Stable syndesmotic ("high") ankle sprain — ${assessment.irritability} irritability. Estimated recovery ${assessment.prognosis}.`,
      assessment,
      flags: assessment.flags,
    },
    plan,
    stretch_policy: 'AVOID forcing dorsiflexion or external rotation early; reintroduce gradually through restore_motion and strength_balance.',
    checkin_policy: {
      withhold_if: (c) => c.swelling_change === 'more' || (typeof c.pain_with_rotation_0_10 === 'number' && c.pain_with_rotation_0_10 >= 7),
      withhold_message: 'Rotational pain was high or swelling increased — drop back to pain-free plantarflexion/inversion work and avoid rotation loading today.',
    },
    ...BETA_META,
  };
}
