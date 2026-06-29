/**
 * lib/clinical/quadEngine/modules/vastusStrain/vastusStrainModule.mjs
 * ---------------------------------------------------------------------------
 * Vastus (VL / VM / VI) muscle-strain module: diagnosis + severity grading +
 * staged plan. Uses the shared 6-phase muscle-healing model and shared session
 * core. The clinical distinctives vs rectus femoris:
 *   - monoarticular: knee-extension deficit WITHOUT hip-flexion involvement
 *   - stretch progressed normally (contrast: contusion is stretch-cautious)
 * Severity uses a BAMIC-informed grade (0-4) + site (a/b/c). Sources:
 * McAleer 2022 (QUAD-CIT-003), Hollabaugh 2025 (QUAD-CIT-004), Lempainen 2022.
 * ---------------------------------------------------------------------------
 */

import { MUSCLE_PHASES, SEVERITY_BANDS, QUAD_ENTITIES, BETA_META } from '../../types.mjs';
import { buildStagedPlan } from '../../shared/quadSessionCore.mjs';
import { localiseMuscle } from '../../quadAssessmentInput.mjs';
import { vastusStrainPool } from './vastusStrainExercises.mjs';
import { citeAll } from '../../citations/quadClinicalCitations.mjs';

/**
 * Estimate a BAMIC-informed grade + site from self-reportable signs.
 * Self-report cannot replace MRI; this is a screening estimate, flagged so.
 */
export function gradeVastusStrain(input) {
  const flags = [];
  let grade = 1;

  const severePain = input.pain_severity_label === 'severe';
  const cannotContinue = input.ability_to_continue === 'no';
  const markedWeak = input.knee_extension_response === 'unable';
  const significantSwelling = input.bruising_or_swelling === 'significant';
  const palpableGap = input.palpable_gap === 'present';

  if (palpableGap || markedWeak) { grade = 3; flags.push('possible_high_grade_tear'); }
  else if (severePain && cannotContinue) { grade = 2; }
  else if (input.pain_severity_label === 'moderate') { grade = 2; }
  else { grade = 1; }

  if (significantSwelling) flags.push('significant_swelling');

  // Site estimate (a myofascial / b musculotendinous / c intratendinous).
  // Self-report cannot resolve c reliably; flag tendon suspicion for review.
  let site = 'b';
  if (input.previous_injury && input.pain_severity_label !== 'mild') { site = 'c'; flags.push('possible_intratendinous_review'); }
  else if (input.bruising_or_swelling === 'none' && input.pain_severity_label === 'mild') { site = 'a'; }

  // Functional severity band (independent of confidence, like RF).
  let band = SEVERITY_BANDS.MODERATE;
  if (grade >= 3 || palpableGap) band = SEVERITY_BANDS.HIGH_CONCERN;
  else if (grade === 1 && !significantSwelling) band = SEVERITY_BANDS.LOWER;

  return {
    grade, site, bamic_label: `${grade}${site}`, band, flags,
    note: 'BAMIC-informed estimate from self-report — MRI grading by a specialist is the reference standard (McAleer 2022).',
    sources: citeAll(['QUAD-CIT-003', 'QUAD-CIT-004', 'QUAD-CIT-001']),
  };
}

/** Place the patient in a muscle phase from functional signs (capacity-based). */
export function placeVastusPhase(input, severity) {
  if (severity.band === SEVERITY_BANDS.HIGH_CONCERN) return 'foundation';
  const days = input.days_since_injury ?? 7;
  const walkOk = ['none', 'mild'].includes(input.walking_response);
  const kneeOk = ['none', 'mild'].includes(input.knee_extension_response);

  if (days >= 28 && walkOk && kneeOk) return 'accumulation';
  if (days >= 14 && walkOk && kneeOk) return 'reload';
  if (walkOk && severity.grade === 1) return 'reload';
  return 'foundation';
}

/** Bias score: exercises matching the injured head rank higher (0 = neutral). */
function biasScore(ex, muscle) {
  const bias = ex.muscle_bias || 'all';
  if (bias === 'all') return 0;
  if (bias === muscle) return 2;          // exact match to injured head
  return -1;                              // biased to a different head — slightly deprioritised
}

/** Full module entry: diagnosis + staged plan. */
export function runVastusStrain(input) {
  const muscle = localiseMuscle(input);
  const severity = gradeVastusStrain(input);
  const currentPhase = placeVastusPhase(input, severity);

  const policy = {
    max_items: 6,
    monitoring_triggers: ['pain during the session', 'next-morning soreness that does not settle', 'swelling increase'],
    stop_rule: 'Stop if quad pain exceeds a mild, tolerable level during or the next morning.',
    card_cautions: severity.band === SEVERITY_BANDS.HIGH_CONCERN ? ['Higher-grade pattern — seek in-person review before progressing.'] : [],
  };

  // Rank each phase pool so exercises biased to the injured head appear first
  // (e.g. VMO-biased work for a vastus medialis strain). Block order is otherwise
  // preserved; this only reorders within the returned pool.
  const rankedPool = (phaseId) => {
    const pool = vastusStrainPool(phaseId);
    return [...pool].sort((a, b) => biasScore(b, muscle) - biasScore(a, muscle));
  };

  const plan = buildStagedPlan(MUSCLE_PHASES, currentPhase, rankedPool, policy);

  // Label honestly: a specific vastus head names it; anything else (sartorius,
  // or an unconfirmed location) is a generic quadriceps/anterior-thigh strain
  // rather than falsely claiming a vastus.
  const summary = muscle.startsWith('vastus')
    ? `Vastus muscle strain (${muscle.replace(/_/g, ' ')}), estimated BAMIC ${severity.bamic_label}.`
    : `Anterior-thigh / quadriceps muscle strain, estimated BAMIC ${severity.bamic_label}.`;

  return {
    entity: QUAD_ENTITIES.VASTUS_STRAIN,
    muscle,
    diagnosis: {
      summary,
      monoarticular_note: 'The vastii cross only the knee — expect knee-extension symptoms without the hip-flexion involvement seen in rectus femoris.',
      severity, flags: severity.flags,
    },
    plan,
    stretch_policy: 'progressive — stretch may be advanced as tolerated (contrast with contusion).',
    ...BETA_META,
  };
}
