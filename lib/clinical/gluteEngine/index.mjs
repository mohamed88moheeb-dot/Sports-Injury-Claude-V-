/**
 * lib/clinical/gluteEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Glute Engine orchestrator (shared core + per-entity modules, same
 * architecture as quadEngine/ankleEngine/calfEngine/groinEngine/hipFlexorEngine).
 *
 * POSSIBLE_DEEP_GLUTEAL_SYNDROME is a referral-only pathway — radiating
 * neural symptoms need a different, in-person diagnostic pathway than
 * self-managed gluteal strain/tendinopathy rehab.
 * ---------------------------------------------------------------------------
 */

import { makeGluteInput, routeEntity } from './gluteAssessmentInput.mjs';
import { GLUTE_ENTITIES, BETA_META } from './types.mjs';
import { runGlutealStrain } from './modules/glutealStrain/glutealStrainModule.mjs';
import { runGlutealTendinopathy } from './modules/glutealTendinopathy/glutealTendinopathyModule.mjs';
import { citeAll } from './citations/gluteClinicalCitations.mjs';
import { adjustToday } from '../core/checkInCore.mjs';

const DISPATCH = {
  [GLUTE_ENTITIES.GLUTEAL_STRAIN]: runGlutealStrain,
  [GLUTE_ENTITIES.GLUTEAL_TENDINOPATHY]: runGlutealTendinopathy,
};

const REFERRAL_COPY = {
  [GLUTE_ENTITIES.POSSIBLE_DEEP_GLUTEAL_SYNDROME]: {
    do: ['Avoid prolonged sitting and deep hip flexion/rotation that reproduce the radiating symptoms.', 'Avoid aggressive stretching or loading of the deep buttock region until assessed.', 'Seek assessment (sports physician / physiotherapist) for a neural/sciatic-focused exam — this may need a different pathway than muscle-strain or tendinopathy rehab.'],
    citeIds: ['GLUTE-CIT-003'],
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
      message: routing.reason || 'This pattern needs in-person assessment before any self-guided rehab.',
      do: copy.do,
      sources: citeAll(copy.citeIds),
    },
    plan: null,
    ...BETA_META,
  };
}

/**
 * Run the full glute engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runGlute(rawInput) {
  const { input, missingCoreFields } = makeGluteInput(rawInput);
  const routing = routeEntity(input);

  const isReferralEntity = routing.entity === GLUTE_ENTITIES.POSSIBLE_DEEP_GLUTEAL_SYNDROME;
  const moduleOutput = isReferralEntity
    ? referral(routing)
    : (DISPATCH[routing.entity] || DISPATCH[GLUTE_ENTITIES.GLUTEAL_STRAIN])(input);

  return {
    engine: 'glute_engine',
    beta_scope: 'glute_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyGluteCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy from the engine output.
 */
export function applyGluteCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustToday(todaysSession, checkin, entityPolicy, BETA_META);
}

// Re-exports for direct module access / testing.
export { makeGluteInput, routeEntity } from './gluteAssessmentInput.mjs';
export { runGlutealStrain } from './modules/glutealStrain/glutealStrainModule.mjs';
export { runGlutealTendinopathy } from './modules/glutealTendinopathy/glutealTendinopathyModule.mjs';
export { GLUTE_ENTITIES } from './types.mjs';
export { GLUTE_CITATIONS } from './citations/gluteClinicalCitations.mjs';
