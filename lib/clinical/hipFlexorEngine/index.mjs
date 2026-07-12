/**
 * lib/clinical/hipFlexorEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Hip Flexor Engine orchestrator (shared core + per-entity modules, same
 * architecture as quadEngine/ankleEngine/calfEngine/groinEngine).
 *
 * POSSIBLE_FEMORAL_STRESS_FRACTURE and POSSIBLE_HIP_JOINT_PATHOLOGY are
 * referral-only pathways — both need a different, urgent diagnostic pathway
 * than self-managed hip-flexor rehab.
 * ---------------------------------------------------------------------------
 */

import { makeHipFlexorInput, routeEntity } from './hipFlexorAssessmentInput.mjs';
import { HIP_FLEXOR_ENTITIES, BETA_META } from './types.mjs';
import { runIliopsoasStrain } from './modules/iliopsoasStrain/iliopsoasStrainModule.mjs';
import { runIliopsoasRelatedGroinPain } from './modules/iliopsoasRelatedGroinPain/iliopsoasRelatedGroinPainModule.mjs';
import { citeAll } from './citations/hipFlexorClinicalCitations.mjs';
import { adjustToday } from '../core/checkInCore.mjs';

const DISPATCH = {
  [HIP_FLEXOR_ENTITIES.ILIOPSOAS_STRAIN]: runIliopsoasStrain,
  [HIP_FLEXOR_ENTITIES.ILIOPSOAS_RELATED_GROIN_PAIN]: runIliopsoasRelatedGroinPain,
};

const REFERRAL_COPY = {
  [HIP_FLEXOR_ENTITIES.POSSIBLE_FEMORAL_STRESS_FRACTURE]: {
    do: ['Stop running/impact activity immediately.', 'Avoid weight-bearing beyond what is pain-free where possible.', 'Seek urgent assessment and imaging (MRI) — this is time-critical.'],
    citeIds: ['HIPFLEX-CIT-004'],
  },
  [HIP_FLEXOR_ENTITIES.POSSIBLE_HIP_JOINT_PATHOLOGY]: {
    do: ['Avoid deep hip flexion/pivoting movements that reproduce the clicking or pain.', 'Seek assessment (sports physician / orthopaedic) for hip-joint imaging.', 'A separate hip assessment may identify a different pathway than hip-flexor rehab.'],
    citeIds: ['HIPFLEX-CIT-005'],
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
 * Run the full hip flexor engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runHipFlexor(rawInput) {
  const { input, missingCoreFields } = makeHipFlexorInput(rawInput);
  const routing = routeEntity(input);

  const isReferralEntity = routing.entity === HIP_FLEXOR_ENTITIES.POSSIBLE_FEMORAL_STRESS_FRACTURE || routing.entity === HIP_FLEXOR_ENTITIES.POSSIBLE_HIP_JOINT_PATHOLOGY;
  const moduleOutput = isReferralEntity
    ? referral(routing)
    : (DISPATCH[routing.entity] || DISPATCH[HIP_FLEXOR_ENTITIES.ILIOPSOAS_STRAIN])(input);

  return {
    engine: 'hip_flexor_engine',
    beta_scope: 'hip_flexor_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyHipFlexorCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy from the engine output.
 */
export function applyHipFlexorCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustToday(todaysSession, checkin, entityPolicy, BETA_META);
}

// Re-exports for direct module access / testing.
export { makeHipFlexorInput, routeEntity } from './hipFlexorAssessmentInput.mjs';
export { runIliopsoasStrain } from './modules/iliopsoasStrain/iliopsoasStrainModule.mjs';
export { runIliopsoasRelatedGroinPain } from './modules/iliopsoasRelatedGroinPain/iliopsoasRelatedGroinPainModule.mjs';
export { HIP_FLEXOR_ENTITIES } from './types.mjs';
export { HIP_FLEXOR_CITATIONS } from './citations/hipFlexorClinicalCitations.mjs';
