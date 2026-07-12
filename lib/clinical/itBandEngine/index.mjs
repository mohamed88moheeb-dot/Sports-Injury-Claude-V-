/**
 * lib/clinical/itBandEngine/index.mjs
 * ---------------------------------------------------------------------------
 * IT Band Engine orchestrator (shared core + per-entity modules, same
 * architecture as quadEngine/ankleEngine/calfEngine/groinEngine/
 * hipFlexorEngine/gluteEngine).
 *
 * POSSIBLE_LATERAL_KNEE_STRUCTURAL_INJURY is a referral-only pathway —
 * locking/catching/giving-way/effusion need a different, in-person
 * diagnostic pathway than self-managed ITBS rehab.
 * ---------------------------------------------------------------------------
 */

import { makeItBandInput, routeEntity } from './itBandAssessmentInput.mjs';
import { IT_BAND_ENTITIES, BETA_META } from './types.mjs';
import { runItBandSyndrome } from './modules/itBandSyndrome/itBandSyndromeModule.mjs';
import { citeAll } from './citations/itBandClinicalCitations.mjs';
import { adjustToday } from '../core/checkInCore.mjs';

const DISPATCH = {
  [IT_BAND_ENTITIES.IT_BAND_SYNDROME]: runItBandSyndrome,
};

const REFERRAL_COPY = {
  [IT_BAND_ENTITIES.POSSIBLE_LATERAL_KNEE_STRUCTURAL_INJURY]: {
    do: ['Avoid running and deep knee bending that reproduces locking/catching/giving-way.', 'Avoid twisting/pivoting on the knee.', 'Seek assessment (sports physician / physiotherapist) for a knee exam +/- imaging — this may need a different pathway than iliotibial band syndrome rehab.'],
    citeIds: [],
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
 * Run the full IT band engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runItBand(rawInput) {
  const { input, missingCoreFields } = makeItBandInput(rawInput);
  const routing = routeEntity(input);

  const isReferralEntity = routing.entity === IT_BAND_ENTITIES.POSSIBLE_LATERAL_KNEE_STRUCTURAL_INJURY;
  const moduleOutput = isReferralEntity
    ? referral(routing)
    : (DISPATCH[routing.entity] || DISPATCH[IT_BAND_ENTITIES.IT_BAND_SYNDROME])(input);

  return {
    engine: 'it_band_engine',
    beta_scope: 'it_band_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyItBandCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy from the engine output.
 */
export function applyItBandCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustToday(todaysSession, checkin, entityPolicy, BETA_META);
}

// Re-exports for direct module access / testing.
export { makeItBandInput, routeEntity } from './itBandAssessmentInput.mjs';
export { runItBandSyndrome } from './modules/itBandSyndrome/itBandSyndromeModule.mjs';
export { IT_BAND_ENTITIES } from './types.mjs';
export { IT_BAND_CITATIONS } from './citations/itBandClinicalCitations.mjs';
