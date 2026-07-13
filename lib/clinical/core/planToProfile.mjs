/**
 * lib/clinical/core/planToProfile.mjs
 * ---------------------------------------------------------------------------
 * Shared stage -> profile-plan-phase mapping, used by every engine's
 * *OutputToProfile.mjs adapter. A single, shared implementation so every
 * injury materializes its REAL weeks (one entry per actual week, each with a
 * real 3-session week) instead of each adapter re-implementing (and
 * previously, all independently under-implementing) the same mapping.
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object[]} stages          engine output's plan.stages (from buildStagedPlan)
 * @param {function} mapSessionFn    (session, friendlyName, dayNumber) => day-shaped object
 * @returns {object[]} profile.plan  — one entry per stage, each with a REAL
 *   weeks[] array (weeks.length === stage.duration_weeks), not a single
 *   fake wrapper week regardless of how long the stage actually runs.
 */
export function stagesToProfilePlan(stages, mapSessionFn) {
  let dayCounter = 1;
  return (stages || []).map((stage) => {
    const weeks = (stage.weeks || []).map((week, wIdx) => ({
      title: stage.duration_weeks ? `Week ${wIdx + 1} of ~${stage.duration_weeks}` : `Week ${wIdx + 1}`,
      focus: stage.friendly_name || stage.stage_name,
      days: (week.sessions || []).map((s) => mapSessionFn(s, stage.friendly_name || stage.stage_name, dayCounter++)),
    }));
    return {
      id: stage.stage_id,
      name: stage.stage_name,
      label: stage.friendly_name || stage.stage_name,
      goal: stage.friendly_name || '',
      intensity: '',
      status: stage.status || 'upcoming',
      is_current: !!stage.is_current,
      progression_note: stage.progression_note || '',
      duration_weeks: stage.duration_weeks || null,
      weeks,
    };
  });
}
