/**
 * lib/clinical/lowerBackEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Lower Back Engine orchestrator (shared core + per-entity modules, same
 * architecture as quadEngine/ankleEngine/calfEngine/groinEngine/
 * hipFlexorEngine/gluteEngine/itBandEngine).
 *
 * POSSIBLE_CAUDA_EQUINA_OR_SERIOUS_PATHOLOGY is an EMERGENCY referral-only
 * pathway — saddle numbness, bladder/bowel dysfunction, bilateral progressive
 * neuro deficit, trauma, or unexplained weight loss/fever always win over
 * everything else and need same-day/emergency medical care.
 *
 * POSSIBLE_SPONDYLOLYSIS is an urgent referral-only pathway — a suspected
 * pars interarticularis stress injury in a young athlete needs imaging
 * before any guided loading progression.
 * ---------------------------------------------------------------------------
 */

import { makeLowerBackInput, routeEntity } from './lowerBackAssessmentInput.mjs';
import { LOWER_BACK_ENTITIES, BETA_META } from './types.mjs';
import { runNonSpecificLowBackPain } from './modules/nonSpecificLowBackPain/nonSpecificLowBackPainModule.mjs';
import { runLumbarRadicularPain } from './modules/lumbarRadicularPain/lumbarRadicularPainModule.mjs';
import { citeAll } from './citations/lowerBackClinicalCitations.mjs';
import { adjustToday } from '../core/checkInCore.mjs';

const DISPATCH = {
  [LOWER_BACK_ENTITIES.NON_SPECIFIC_LOW_BACK_PAIN]: runNonSpecificLowBackPain,
  [LOWER_BACK_ENTITIES.LUMBAR_RADICULAR_PAIN]: runLumbarRadicularPain,
};

const REFERRAL_COPY = {
  [LOWER_BACK_ENTITIES.POSSIBLE_CAUDA_EQUINA_OR_SERIOUS_PATHOLOGY]: {
    urgency: 'emergency',
    do: ['Seek emergency medical care today — go to an emergency department, do not wait for a routine appointment.', 'Avoid any further loading or exercise until assessed.', 'Note exactly which symptoms are present (numbness location, bladder/bowel changes, leg weakness) to report to the clinician.'],
    citeIds: ['LB-CIT-002'],
  },
  [LOWER_BACK_ENTITIES.POSSIBLE_SPONDYLOLYSIS]: {
    urgency: 'urgent',
    do: ['Stop the extension/rotation-loading activity (e.g. gymnastics, fast bowling, dance) that provokes the pain.', 'Avoid back extension and impact loading until assessed.', 'Seek assessment (sports physician / physiotherapist) for imaging (MRI/SPECT/CT) — this needs confirmation before any guided loading programme.'],
    citeIds: ['LB-CIT-006'],
  },
};

function referral(routing) {
  const copy = REFERRAL_COPY[routing.entity] || { urgency: 'urgent', do: ['Seek in-person assessment before continuing.'], citeIds: [] };
  return {
    entity: routing.entity,
    autonomous_plan: false,
    clinician_required: true,
    referral: {
      urgency: copy.urgency,
      message: routing.reason || 'This pattern needs in-person assessment before any self-guided rehab.',
      do: copy.do,
      sources: citeAll(copy.citeIds),
    },
    plan: null,
    ...BETA_META,
  };
}

/**
 * Run the full lower back engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runLowerBack(rawInput) {
  const { input, missingCoreFields } = makeLowerBackInput(rawInput);
  const routing = routeEntity(input);

  const isReferralEntity = routing.entity === LOWER_BACK_ENTITIES.POSSIBLE_CAUDA_EQUINA_OR_SERIOUS_PATHOLOGY || routing.entity === LOWER_BACK_ENTITIES.POSSIBLE_SPONDYLOLYSIS;
  const moduleOutput = isReferralEntity
    ? referral(routing)
    : (DISPATCH[routing.entity] || DISPATCH[LOWER_BACK_ENTITIES.NON_SPECIFIC_LOW_BACK_PAIN])(input);

  return {
    engine: 'lower_back_engine',
    beta_scope: 'lower_back_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyLowerBackCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy from the engine output.
 */
export function applyLowerBackCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustToday(todaysSession, checkin, entityPolicy, BETA_META);
}

// Re-exports for direct module access / testing.
export { makeLowerBackInput, routeEntity } from './lowerBackAssessmentInput.mjs';
export { runNonSpecificLowBackPain } from './modules/nonSpecificLowBackPain/nonSpecificLowBackPainModule.mjs';
export { runLumbarRadicularPain } from './modules/lumbarRadicularPain/lumbarRadicularPainModule.mjs';
export { LOWER_BACK_ENTITIES } from './types.mjs';
export { LOWER_BACK_CITATIONS } from './citations/lowerBackClinicalCitations.mjs';
