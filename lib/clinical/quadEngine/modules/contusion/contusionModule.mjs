/**
 * lib/clinical/quadEngine/modules/contusion/contusionModule.mjs
 * ---------------------------------------------------------------------------
 * Quadriceps CONTUSION module: grading by knee-flexion ROM, the Aronen acute
 * protocol, myositis-ossificans monitoring, and a ROM-first staged plan.
 *
 * Clinical distinctives (the reason contusion is NOT a strain pathway):
 *   - severity = passive knee-flexion ROM, re-assessed at 24 h
 *       mild >50%, moderate 30-50%, severe <30%  (Lempainen 2022)
 *   - acute care = passive flexion to 120 deg held 24 h, then pain-free
 *       isometrics + gentle stretch  (Aronen 2006)
 *   - stretch-CAUTIOUS early: aggressive stretch raises MO risk
 *       (Lempainen 2022; Larson 2002)
 *   - the daily check-in withholds on swelling increase OR ROM regression
 * ---------------------------------------------------------------------------
 */

import { CONTUSION_GRADES, SEVERITY_BANDS, QUAD_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan, splitStageWeeks } from '../../../core/sessionCore.mjs';
import { CONTUSION_STAGES, contusionPool } from './contusionExercises.mjs';
import { citeAll } from '../../citations/quadClinicalCitations.mjs';

/**
 * Grade contusion by passive knee-flexion ROM (% of uninjured side).
 * Falls back to functional signs if ROM% not provided. Source: Lempainen 2022.
 */
export function gradeContusion(input) {
  const flags = [];
  const romPct = input.knee_flexion_rom_percent;

  let grade;
  if (romPct != null) {
    if (romPct > 50) grade = CONTUSION_GRADES.MILD;
    else if (romPct >= 30) grade = CONTUSION_GRADES.MODERATE;
    else grade = CONTUSION_GRADES.SEVERE;
  } else {
    // Fallback: infer from walking + ability to continue.
    if (input.walking_response === 'unable' || input.ability_to_continue === 'no') grade = CONTUSION_GRADES.SEVERE;
    else if (input.walking_response === 'painful') grade = CONTUSION_GRADES.MODERATE;
    else grade = CONTUSION_GRADES.MILD;
    flags.push('rom_percent_not_provided_estimate_only');
  }

  // Myositis-ossificans risk signals.
  if (input.bruising_or_swelling === 'significant') flags.push('mo_risk_large_contusion');
  if (grade === CONTUSION_GRADES.SEVERE) flags.push('mo_risk_severe_contusion', 'sympathetic_effusion_watch');
  if ((input.days_since_injury ?? 0) < 1) flags.push('reassess_at_24h');

  const prognosis = {
    [CONTUSION_GRADES.MILD]: '2-5 days',
    [CONTUSION_GRADES.MODERATE]: 'roughly 1-3 weeks',
    [CONTUSION_GRADES.SEVERE]: '20-25+ days',
  }[grade];
  const totalWeeksEstimate = {
    [CONTUSION_GRADES.MILD]: 1,
    [CONTUSION_GRADES.MODERATE]: 2,
    [CONTUSION_GRADES.SEVERE]: 3.5,
  }[grade];

  const band = grade === CONTUSION_GRADES.SEVERE ? SEVERITY_BANDS.HIGH_CONCERN
    : grade === CONTUSION_GRADES.MODERATE ? SEVERITY_BANDS.MODERATE
      : SEVERITY_BANDS.LOWER;

  return {
    grade, band, rom_percent: romPct, prognosis, totalWeeksEstimate, flags,
    note: 'Contusion grade is set by passive knee-flexion ROM and must be re-assessed 24 h after injury, when pain and functional deficit peak (Lempainen 2022).',
    sources: citeAll(['QUAD-CIT-001', 'QUAD-CIT-005', 'QUAD-CIT-006']),
  };
}

// CONTUSION_STAGES share of the total recovery timeline (sums to 1).
const CONTUSION_STAGE_SHARE = { acute_rom: 0.30, restore_strength: 0.30, reload: 0.25, return: 0.15 };

/** Acute-phase guidance (Aronen 120-degree protocol) when very recent. */
export function acuteContusionGuidance(input) {
  const acute = (input.days_since_injury ?? 7) <= 1;
  if (!acute) return null;
  return {
    applies: true,
    protocol: 'Aronen immediate-immobilisation (120-degree knee flexion)',
    steps: [
      'As soon as possible after injury, passively and painlessly flex the knee toward 120 degrees.',
      'Hold the knee in that flexed position continuously for ~24 hours (brace/wrap).',
      'After 24 hours, begin active, pain-free quad stretching several times daily.',
      'Begin pain-free isometric quad strengthening as soon as able.',
    ],
    rationale: 'Holding the knee flexed limits hematoma expansion and preserves flexion ROM, shortening recovery and lowering myositis-ossificans risk (mean return 3.5 days in the original series).',
    cautions: ['All movement must be pain-free.', 'If pain is severe or the knee cannot be flexed, seek in-person assessment.'],
    sources: citeAll(['QUAD-CIT-005']),
  };
}

/** Place into a contusion stage from ROM/strength recovery. */
export function placeContusionStage(input, severity) {
  const days = input.days_since_injury ?? 7;
  const romPct = severity.rom_percent;
  if (severity.grade === CONTUSION_GRADES.SEVERE && days < 7) return 'acute_rom';
  if (romPct != null && romPct < 70) return 'acute_rom';
  if (romPct != null && romPct < 90) return 'restore_strength';
  if (days < 5) return 'acute_rom';
  if (days < 14) return 'restore_strength';
  return 'reload';
}

export function runContusion(input) {
  const severity = gradeContusion(input);
  const acute = acuteContusionGuidance(input);
  const currentStage = placeContusionStage(input, severity);

  const policy = {
    max_items: 5,
    monitoring_triggers: [
      'increasing swelling or a firming/hardening lump in the muscle (possible myositis ossificans)',
      'loss of knee-flexion range compared with the day before',
      'a knee that feels warm or swollen (sympathetic effusion)',
    ],
    stop_rule: 'Stop and avoid aggressive stretching if swelling increases or flexion range goes backwards — these raise ossification risk.',
    card_cautions: ['Keep all stretching pain-free; do not force range.'],
    stretch_caution: true,
  };

  const stageWeeks = splitStageWeeks(CONTUSION_STAGES, severity.totalWeeksEstimate, CONTUSION_STAGE_SHARE);
  const plan = buildStagedPlan(CONTUSION_STAGES, currentStage, contusionPool, policy, { stageWeeks, betaMeta: BETA_META });

  return {
    entity: QUAD_ENTITIES.CONTUSION,
    diagnosis: {
      summary: `Quadriceps contusion — ${severity.grade} (knee-flexion ROM grade). Estimated recovery ${severity.prognosis}.`,
      severity,
      myositis_ossificans_monitoring: {
        why: 'Direct contusions can form ectopic bone (myositis ossificans), more likely after large contusions.',
        reduce_risk: ['minimise hematoma early', 'restore ROM gently and early', 'avoid aggressive early physiotherapy/stretch', 'NSAIDs may help (clinician-directed); avoid corticosteroids'],
        sources: citeAll(['QUAD-CIT-001', 'QUAD-CIT-006']),
      },
      flags: severity.flags,
    },
    acute_protocol: acute,
    plan,
    stretch_policy: 'CAUTIOUS — pain-free ROM only; no aggressive stretch until well past the acute phase (myositis-ossificans risk).',
    // Check-in policy override: withhold on swelling increase or ROM regression.
    checkin_policy: {
      withhold_if: (c) => c.swelling_change === 'more' || (typeof c.knee_flexion_rom_percent === 'number' && typeof c._prev_rom === 'number' && c.knee_flexion_rom_percent < c._prev_rom - 5),
      withhold_message: 'Swelling up or knee-flexion range gone backwards — pause loading, rest, and avoid stretching. If a firm lump develops or swelling keeps rising, seek review (possible myositis ossificans).',
    },
    ...BETA_META,
  };
}
