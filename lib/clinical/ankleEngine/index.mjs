/**
 * lib/clinical/ankleEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Ankle Engine orchestrator (shared core + per-entity modules, same
 * architecture as quadEngine).
 *
 * Flow:
 *   makeAnkleInput(raw) -> routeEntity(input) -> dispatch to the owning module
 *   -> { routing, diagnosis, plan, ... } with a shared check-in entry point.
 *
 * POSSIBLE_FRACTURE (Ottawa Ankle Rules positive, or suspected unstable
 * syndesmosis) is NOT a rehab module — it is a referral-only pathway, same
 * pattern as the quad engine's pre-operative tendon-rupture referral.
 *
 * BETA SCOPE ONLY. No clinical authority. Pure function over its input + the
 * cited knowledge in this directory.
 * ---------------------------------------------------------------------------
 */

import { makeAnkleInput, routeEntity } from './ankleAssessmentInput.mjs';
import { ANKLE_ENTITIES, BETA_META } from './types.mjs';
import { runLateralSprain } from './modules/lateralSprain/lateralSprainModule.mjs';
import { runSyndesmosis } from './modules/syndesmosis/syndesmosisModule.mjs';
import { runChronicInstability } from './modules/chronicInstability/chronicInstabilityModule.mjs';
import { citeAll } from './citations/ankleClinicalCitations.mjs';
import { adjustToday } from '../core/checkInCore.mjs';

const DISPATCH = {
  [ANKLE_ENTITIES.LATERAL_SPRAIN]: runLateralSprain,
  [ANKLE_ENTITIES.SYNDESMOSIS_SPRAIN]: runSyndesmosis,
  [ANKLE_ENTITIES.CHRONIC_INSTABILITY]: runChronicInstability,
};

function fractureReferral(routing) {
  return {
    entity: ANKLE_ENTITIES.POSSIBLE_FRACTURE,
    autonomous_plan: false,
    clinician_required: true,
    referral: {
      urgency: 'urgent',
      message: routing.reason || 'Signs meet the Ottawa Ankle Rules or suggest an unstable syndesmosis injury. This needs in-person assessment and imaging before any self-guided rehab.',
      do: ['Avoid weight-bearing beyond what is pain-free.', 'Use crutches/support if walking is painful.', 'Seek same-day assessment (urgent care / sports physician / ED) for imaging.'],
      sources: citeAll(['ANKLE-CIT-001', 'ANKLE-CIT-006']),
    },
    plan: null,
    ...BETA_META,
  };
}

/**
 * Run the full ankle engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runAnkle(rawInput) {
  const { input, missingCoreFields } = makeAnkleInput(rawInput);
  const routing = routeEntity(input);

  const moduleOutput = routing.entity === ANKLE_ENTITIES.POSSIBLE_FRACTURE
    ? fractureReferral(routing)
    : (DISPATCH[routing.entity] || DISPATCH[ANKLE_ENTITIES.LATERAL_SPRAIN])(input);

  return {
    engine: 'ankle_engine',
    beta_scope: 'ankle_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyAnkleCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy from the engine output.
 */
export function applyAnkleCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustToday(todaysSession, checkin, entityPolicy, BETA_META);
}

// Re-exports for direct module access / testing.
export { makeAnkleInput, routeEntity } from './ankleAssessmentInput.mjs';
export { runLateralSprain } from './modules/lateralSprain/lateralSprainModule.mjs';
export { runSyndesmosis } from './modules/syndesmosis/syndesmosisModule.mjs';
export { runChronicInstability } from './modules/chronicInstability/chronicInstabilityModule.mjs';
export { ANKLE_ENTITIES } from './types.mjs';
export { ANKLE_CITATIONS } from './citations/ankleClinicalCitations.mjs';
