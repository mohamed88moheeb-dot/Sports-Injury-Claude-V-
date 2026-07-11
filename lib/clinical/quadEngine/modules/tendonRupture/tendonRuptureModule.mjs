/**
 * lib/clinical/quadEngine/modules/tendonRupture/tendonRuptureModule.mjs
 * ---------------------------------------------------------------------------
 * Quad / patellar TENDON RUPTURE module. Two jobs:
 *   1. PRE-OP / undiagnosed: if extensor-mechanism failure is suspected, do NOT
 *      build a rehab plan. Surface an urgent in-person/surgical referral —
 *      surgical delay > 3 weeks worsens outcomes (Ibounig 2015).
 *   2. POST-OP: surface a clinician-gated, weeks-since-surgery stage timeline.
 *      The engine never auto-advances; every stage is review_required.
 * ---------------------------------------------------------------------------
 */

import { RUPTURE_STAGES, SEVERITY_BANDS, QUAD_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan } from '../../../core/sessionCore.mjs';

// Fixed post-op stage durations (weeks) — these are set by the surgical timeline
// itself (already embedded in RUPTURE_STAGES' clinical_name ranges), not derived
// from a single total estimate, since progress here is clinician-paced, not a
// smooth curve from one severity number.
const RUPTURE_STAGE_WEEKS = { protected: 6, mobility: 6, strength: 8, return: 8 };
import { rupturePool } from './tendonRuptureExercises.mjs';
import { citeAll } from '../../citations/quadClinicalCitations.mjs';

/** Map weeks-since-surgery to a post-op stage. */
export function placeRuptureStage(weeksPostOp) {
  if (weeksPostOp == null) return 'protected';
  if (weeksPostOp < 6) return 'protected';
  if (weeksPostOp < 12) return 'mobility';
  if (weeksPostOp < 20) return 'strength';
  return 'return';
}

export function runTendonRupture(input) {
  const postOp = input.surgical_repair_done === true || input.weeks_since_surgery != null;

  // ── PRE-OP / suspected acute rupture: refer, do not rehab. ────────────────
  if (!postOp) {
    return {
      entity: QUAD_ENTITIES.TENDON_RUPTURE,
      stage: 'pre_operative_referral',
      autonomous_plan: false,
      clinician_required: true,
      referral: {
        urgency: 'urgent',
        message: 'Signs suggest a possible quadriceps/patellar tendon rupture (loss of active knee extension, straight-leg-raise failure, or a palpable gap). This needs urgent in-person assessment and imaging. Surgical repair is time-critical — a delay beyond ~3 weeks significantly worsens outcomes.',
        do: ['Keep the leg straight and supported.', 'Avoid loading or trying to bend/straighten against resistance.', 'Seek same-day assessment (sports physician / orthopaedic / ED).'],
        sources: citeAll(['QUAD-CIT-014', 'QUAD-CIT-013']),
      },
      plan: null,
      ...BETA_META,
    };
  }

  // ── POST-OP: clinician-gated staged timeline. ─────────────────────────────
  const weeks = input.weeks_since_surgery;
  const currentStage = placeRuptureStage(weeks);

  const policy = {
    max_items: 4,
    monitoring_triggers: [
      'any pulling, gapping or sharp pain at the repair site',
      'new extension lag (inability to fully straighten actively) — possible re-rupture',
      'persistent knee stiffness',
    ],
    stop_rule: 'Stop and contact your surgical team for any repair-site pain, gapping, or new loss of active extension.',
    card_cautions: ['Every progression here requires your clinician\'s approval — do not advance on your own.'],
    stretch_caution: true,
  };

  const plan = buildStagedPlan(RUPTURE_STAGES, currentStage, rupturePool, policy, { stageWeeks: RUPTURE_STAGE_WEEKS, betaMeta: BETA_META });

  // Full return to sport after quad/patellar tendon repair is well-documented
  // at ~6-9 months overall; give a stage-relative "time remaining" estimate
  // rather than repeating the same flat total regardless of progress.
  const PROGNOSIS_BY_STAGE = {
    protected: '~6-9 months total to full return to sport from surgery',
    mobility: '~4-6 months remaining to full return to sport',
    strength: '~2-4 months remaining to full return to sport',
    return: 'Entering return-to-activity — full sport clearance is set by your surgical team, criteria-based.',
  };

  return {
    entity: QUAD_ENTITIES.TENDON_RUPTURE,
    stage: currentStage,
    autonomous_plan: false,
    clinician_required: true,
    weeks_since_surgery: weeks,
    diagnosis: {
      summary: `Post-operative quad/patellar tendon repair — stage: ${currentStage}${weeks != null ? ` (week ${weeks})` : ''}.`,
      protocol_basis: 'Early functional rehab with protected full weight-bearing is safe and not inferior to immobilisation (Langenhan 2012); limited-arc motion uses active flexion + passive extension early (Lee 2013).',
      complications_to_watch: ['quadriceps atrophy', 'knee stiffness', 're-rupture'],
      severity: { band: SEVERITY_BANDS.HIGH_CONCERN, prognosis: PROGNOSIS_BY_STAGE[currentStage] || PROGNOSIS_BY_STAGE.protected, flags: ['post_surgical_clinician_gated'] },
      sources: citeAll(['QUAD-CIT-012', 'QUAD-CIT-013', 'QUAD-CIT-014']),
    },
    plan,
    gate: 'EVERY stage and progression is clinician-gated. The engine surfaces options; it does not authorise progression.',
    ...BETA_META,
  };
}
