/**
 * lib/clinical/calfEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Calf/Shin Engine orchestrator (shared core + per-entity modules, same
 * architecture as quadEngine/ankleEngine).
 *
 * POSSIBLE_ACHILLES_RUPTURE and POSSIBLE_STRESS_FRACTURE are referral-only
 * pathways — no autonomous plan, same pattern as the ankle engine's
 * Ottawa-rule referral.
 * ---------------------------------------------------------------------------
 */

import { makeCalfInput, routeEntity } from './calfAssessmentInput.mjs';
import { CALF_ENTITIES, BETA_META } from './types.mjs';
import { runCalfStrain } from './modules/calfStrain/calfStrainModule.mjs';
import { runAchillesTendinopathy } from './modules/achillesTendinopathy/achillesTendinopathyModule.mjs';
import { runMtss } from './modules/mtss/mtssModule.mjs';
import { citeAll } from './citations/calfClinicalCitations.mjs';
import { adjustToday } from '../core/checkInCore.mjs';

const DISPATCH = {
  [CALF_ENTITIES.CALF_STRAIN]: runCalfStrain,
  [CALF_ENTITIES.ACHILLES_TENDINOPATHY]: runAchillesTendinopathy,
  [CALF_ENTITIES.MTSS]: runMtss,
};

const REFERRAL_COPY = {
  [CALF_ENTITIES.POSSIBLE_ACHILLES_RUPTURE]: {
    do: ['Avoid weight-bearing beyond what is pain-free.', 'Keep the ankle relaxed in slight plantarflexion (toes pointed) if possible.', 'Seek same-day assessment (urgent care / sports physician / ED).'],
    citeIds: ['CALF-CIT-003'],
  },
  [CALF_ENTITIES.POSSIBLE_STRESS_FRACTURE]: {
    do: ['Stop running/impact activity.', 'Use non-impact conditioning (bike/pool) only until assessed.', 'Seek assessment and imaging (X-ray/MRI/bone scan as advised).'],
    citeIds: ['CALF-CIT-005'],
  },
};

function referral(routing) {
  const copy = REFERRAL_COPY[routing.entity] || { do: ['Seek in-person assessment before continuing.'], citeIds: [] };
  return {
    entity: routing.entity,
    autonomous_plan: false,
    clinician_required: true,
    referral: {
      urgency: 'urgent',
      message: routing.reason || 'This pattern needs in-person assessment and imaging before any self-guided rehab.',
      do: copy.do,
      sources: citeAll(copy.citeIds),
    },
    plan: null,
    ...BETA_META,
  };
}

/**
 * Run the full calf/shin engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runCalf(rawInput) {
  const { input, missingCoreFields } = makeCalfInput(rawInput);
  const routing = routeEntity(input);

  const isReferralEntity = routing.entity === CALF_ENTITIES.POSSIBLE_ACHILLES_RUPTURE || routing.entity === CALF_ENTITIES.POSSIBLE_STRESS_FRACTURE;
  const moduleOutput = isReferralEntity
    ? referral(routing)
    : (DISPATCH[routing.entity] || DISPATCH[CALF_ENTITIES.CALF_STRAIN])(input);

  return {
    engine: 'calf_engine',
    beta_scope: 'calf_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyCalfCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy from the engine output.
 */
export function applyCalfCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustToday(todaysSession, checkin, entityPolicy, BETA_META);
}

// Re-exports for direct module access / testing.
export { makeCalfInput, routeEntity } from './calfAssessmentInput.mjs';
export { runCalfStrain } from './modules/calfStrain/calfStrainModule.mjs';
export { runAchillesTendinopathy } from './modules/achillesTendinopathy/achillesTendinopathyModule.mjs';
export { runMtss } from './modules/mtss/mtssModule.mjs';
export { CALF_ENTITIES } from './types.mjs';
export { CALF_CITATIONS } from './citations/calfClinicalCitations.mjs';
