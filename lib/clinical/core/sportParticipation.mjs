/**
 * lib/clinical/core/sportParticipation.mjs
 * ---------------------------------------------------------------------------
 * "Can I keep playing?" — the answer sports medicine actually gives, which
 * the app never did. A rehab programme's LENGTH is not the same as TIME AWAY
 * FROM SPORT:
 *
 *  - Overuse problems (tendinopathy, MTSS, ITB, PFPS, non-specific low back
 *    pain) at low/moderate irritability are usually managed WITH continued
 *    sport at reduced load, using a pain-monitoring model (Silbernagel-style:
 *    pain acceptable up to ~3/10 during activity, settled by the next
 *    morning). A 10-week loading programme runs ALONGSIDE sport — it is not
 *    10 weeks out.
 *  - Minor (grade I) acute strains need only a short break (days to ~2
 *    weeks) from the provocative high-load actions, not a full shutdown.
 *  - Moderate (grade II) strains need tissue-healing time away from sprint/
 *    kick-type load, with sport re-entering in the plan's final phase.
 *  - High-concern / referral patterns stop sport until assessed.
 *
 * Each engine adapter calls deriveSportParticipation with what its module
 * actually graded (a strain grade OR an irritability level, plus band and
 * referral state); the result renders as its own card on the diagnosis page.
 * ---------------------------------------------------------------------------
 */

const PAIN_RULE = 'Rule of thumb: pain up to ~3/10 during activity is acceptable if it settles back to baseline by the next morning. Pain that climbs session-to-session or lingers into the next day means the load was too much.';

/**
 * @param {object} args
 * @param {'acute_strain'|'overuse'|null} args.kind  what the module graded
 * @param {string|number|null} args.grade       strain grade (I/II/III, '1'/'2'/'3', etc.)
 * @param {string|null} args.irritability       'low' | 'moderate' | 'high'
 * @param {string|null} args.band               shared severity band id
 * @param {boolean} args.reviewRequired         referral / red-flag gated
 * @param {number|null} args.planTotalWeeks     the plan's real summed total
 * @param {number|null} args.finalStageWeeks    weeks of the last (return-to-sport) stage
 * @returns {{ level: string, headline: string, detail: string, timeAway: string, painRule: string|null }}
 */
export function deriveSportParticipation(args = {}) {
  const result = deriveInner(args);
  // kind is carried so the AI grounding layer can retrieve matching evidence.
  return { ...result, kind: args.kind || null };
}

function deriveInner({ kind = null, grade = null, irritability = null, band = null, reviewRequired = false, planTotalWeeks = null, finalStageWeeks = null } = {}) {
  if (reviewRequired) {
    return {
      level: 'medical_first',
      headline: 'Hold off sport — get assessed first',
      detail: 'Your answers include signs that need in-person assessment before sport or self-guided rehab. Keep daily activities within comfort and arrange a review.',
      timeAway: 'Until cleared by a clinician',
      painRule: null,
    };
  }

  // Graded return window: full sport re-enters during the plan's final phase.
  const returnFromWeek = planTotalWeeks && finalStageWeeks != null
    ? Math.max(1, planTotalWeeks - finalStageWeeks + 1)
    : null;
  const gradedReturnText = returnFromWeek
    ? `graded return to full sport from ~week ${returnFromWeek} of the plan`
    : 'graded return in the plan’s final phase';

  const g = String(grade || '').toLowerCase();
  const isGrade1 = /(^|_| )i$|1/.test(g) && !/ii|2|iii|3/.test(g);
  const isGrade3 = /iii|3/.test(g);

  if (kind === 'acute_strain') {
    if (isGrade1) {
      return {
        level: 'short_break',
        headline: 'Short break, quick return',
        detail: 'A minor (grade I) strain usually needs only a few days away from the provocative high-load actions (sprinting, kicking, cutting). Simple soreness that settles fully within a few days of relative rest may need nothing more — the short plan below protects against re-injury and guides re-entry; you don’t need to force a long rehab.',
        timeAway: 'A few days to ~2 weeks away from full sport',
        painRule: PAIN_RULE,
      };
    }
    if (isGrade3 || band === 'high_concern_or_review_gated' || band === 'high_concern') {
      return {
        level: 'no_sport',
        headline: 'Time off sport — and consider a clinical review',
        detail: 'A higher-grade pattern needs real tissue-healing time before sprint/kick-type load. Train around it (upper body, pain-free cross-training), progress through the phases, and have a low threshold for getting it assessed in person.',
        timeAway: planTotalWeeks ? `~${planTotalWeeks} weeks, ${gradedReturnText}` : 'Several weeks — criteria-based',
        painRule: PAIN_RULE,
      };
    }
    return {
      level: 'rehab_first',
      headline: 'Pause full sport while it heals',
      detail: 'A moderate (grade II) strain needs healing time before high-speed/kicking load. Keep training what doesn’t stress it (upper body, controlled cardio), progress through the phases, and re-enter sport in the final return-to-sport phase.',
      timeAway: planTotalWeeks ? `~${planTotalWeeks} weeks, ${gradedReturnText}` : `Weeks — ${gradedReturnText}`,
      painRule: PAIN_RULE,
    };
  }

  if (kind === 'overuse') {
    if (irritability === 'high') {
      return {
        level: 'relative_rest',
        headline: 'Pause sport briefly — switch to pain-free cross-training',
        detail: 'High irritability means the tissue is currently wound up: continuing the aggravating load keeps it that way. Settle symptoms with days to ~2 weeks of relative rest / pain-free cross-training, then rebuild through the programme — sport re-enters as irritability drops.',
        timeAway: 'Until irritability settles (often 1–2 weeks), then graded return',
        painRule: PAIN_RULE,
      };
    }
    if (irritability === 'moderate') {
      return {
        level: 'continue_modified',
        headline: 'You can usually keep training — with a real deload',
        detail: 'Moderate irritability: cut the aggravating load meaningfully (volume, speed, hills, jumping) and run the programme alongside modified training. The programme length is how long the tissue needs to rebuild capacity — it is NOT time away from sport.',
        timeAway: 'Often none — expect reduced training load for the first weeks',
        painRule: PAIN_RULE,
      };
    }
    return {
      level: 'continue_modified',
      headline: 'You can usually keep playing — with a load reduction',
      detail: 'Low irritability: keep training and competing with a modest load reduction while the programme builds tissue capacity. If symptoms settle fully within 1–2 weeks of deloading, taper back to full training — you don’t need to force the whole programme.',
      timeAway: 'None expected — modify rather than stop',
      painRule: PAIN_RULE,
    };
  }

  // No grading available — fall back on the shared band.
  if (band === 'lower_functional_impact' || band === 'lower') {
    return {
      level: 'continue_modified',
      headline: 'Modified training is usually fine',
      detail: 'Lower-impact pattern: stay active within comfort, reduce the provocative load, and progress through the plan. Full sport re-enters as symptoms allow.',
      timeAway: 'Little to none — modify rather than stop',
      painRule: PAIN_RULE,
    };
  }
  return {
    level: 'rehab_first',
    headline: 'Reduce sport while you rebuild',
    detail: 'Moderate pattern: swap full sport for modified training plus the plan’s sessions, and re-enter sport through the final return-to-sport phase.',
    timeAway: planTotalWeeks ? `Up to ~${planTotalWeeks} weeks, ${gradedReturnText}` : `Weeks — ${gradedReturnText}`,
    painRule: PAIN_RULE,
  };
}

/**
 * Deterministic participation envelope straight from a SHARED-CORE engine
 * output (quad/ankle/calf/groin/hip-flexor/glute/IT-band/lower-back all emit
 * the same shape). Used by the API routes (as the AI grounding layer's
 * safety envelope) and by the adapters (as the client-side fallback).
 */
export function deriveEnvelopeFromSharedOutput(output = {}) {
  const diagnosis = output.diagnosis || {};
  const severity = diagnosis.severity || diagnosis.assessment || {};
  const plan = output.plan || null;
  const reviewRequired = !!(
    output.clinician_required
    || (output.autonomous_plan === false && !plan)
    || diagnosis.flags?.includes('urgent_in_person_review')
  );
  const stages = plan?.stages || [];
  return deriveSportParticipation({
    kind: severity.grade ? 'acute_strain' : severity.irritability ? 'overuse' : null,
    grade: severity.grade || null,
    irritability: severity.irritability || null,
    band: severity.band || null,
    reviewRequired,
    planTotalWeeks: plan?.total_estimated_weeks || null,
    finalStageWeeks: stages.length ? (stages[stages.length - 1].duration_weeks || null) : null,
  });
}
