/**
 * lib/clinical/groinEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Adductor/Groin Engine orchestrator (shared core + per-entity modules, same
 * architecture as quadEngine/ankleEngine/calfEngine).
 *
 * POSSIBLE_HERNIA and POSSIBLE_HIP_JOINT_PATHOLOGY are referral-only
 * pathways — these are Doha-classification entities (Weir 2015) that need a
 * different diagnostic pathway than self-managed adductor rehab.
 * ---------------------------------------------------------------------------
 */

import { makeGroinInput, routeEntity } from './groinAssessmentInput.mjs';
import { GROIN_ENTITIES, BETA_META } from './types.mjs';
import { runAdductorStrain } from './modules/adductorStrain/adductorStrainModule.mjs';
import { runAdductorRelatedGroinPain } from './modules/adductorRelatedGroinPain/adductorRelatedGroinPainModule.mjs';
import { citeAll } from './citations/groinClinicalCitations.mjs';
import { adjustToday } from '../core/checkInCore.mjs';

const DISPATCH = {
  [GROIN_ENTITIES.ADDUCTOR_STRAIN]: runAdductorStrain,
  [GROIN_ENTITIES.ADDUCTOR_RELATED_GROIN_PAIN]: runAdductorRelatedGroinPain,
};

const REFERRAL_COPY = {
  [GROIN_ENTITIES.POSSIBLE_HERNIA]: {
    do: ['Avoid heavy lifting or straining.', 'Note whether the bulge reduces (goes away) when lying down.', 'Seek assessment (GP / surgical review) — same-day if the bulge is painful, firm, or will not reduce.'],
    citeIds: ['GROIN-CIT-001'],
  },
  [GROIN_ENTITIES.POSSIBLE_HIP_JOINT_PATHOLOGY]: {
    do: ['Avoid deep hip flexion/pivoting movements that reproduce the clicking or pain.', 'Seek assessment (sports physician / orthopaedic) for hip-joint imaging.', 'A separate hip assessment may identify a different pathway than adductor rehab.'],
    citeIds: ['GROIN-CIT-004'],
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
 * Run the full adductor/groin engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runGroin(rawInput) {
  const { input, missingCoreFields } = makeGroinInput(rawInput);
  const routing = routeEntity(input);

  const isReferralEntity = routing.entity === GROIN_ENTITIES.POSSIBLE_HERNIA || routing.entity === GROIN_ENTITIES.POSSIBLE_HIP_JOINT_PATHOLOGY;
  const moduleOutput = isReferralEntity
    ? referral(routing)
    : (DISPATCH[routing.entity] || DISPATCH[GROIN_ENTITIES.ADDUCTOR_STRAIN])(input);

  return {
    engine: 'groin_engine',
    beta_scope: 'groin_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyGroinCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy from the engine output.
 */
export function applyGroinCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustToday(todaysSession, checkin, entityPolicy, BETA_META);
}

// Re-exports for direct module access / testing.
export { makeGroinInput, routeEntity } from './groinAssessmentInput.mjs';
export { runAdductorStrain } from './modules/adductorStrain/adductorStrainModule.mjs';
export { runAdductorRelatedGroinPain } from './modules/adductorRelatedGroinPain/adductorRelatedGroinPainModule.mjs';
export { GROIN_ENTITIES } from './types.mjs';
export { GROIN_CITATIONS } from './citations/groinClinicalCitations.mjs';
