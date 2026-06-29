/**
 * lib/clinical/quadEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Quadriceps Engine orchestrator (hybrid: shared core + per-entity modules).
 *
 * Flow:
 *   makeQuadInput(raw) -> routeEntity(input) -> dispatch to the owning module
 *   -> { routing, diagnosis, plan, ... } with a shared check-in entry point.
 *
 * RF muscle strain stays in rfBetaEngine; this engine covers the four entities
 * RF did not: vastus strain, contusion, tendinopathy, tendon rupture.
 *
 * BETA SCOPE ONLY. No clinical authority. Pure function over its input + the
 * cited knowledge in this directory. See RESEARCH.md for the evidence base.
 * ---------------------------------------------------------------------------
 */

import { makeQuadInput, routeEntity } from './quadAssessmentInput.mjs';
import { QUAD_ENTITIES, BETA_META } from './types.mjs';
import { runVastusStrain } from './modules/vastusStrain/vastusStrainModule.mjs';
import { runContusion } from './modules/contusion/contusionModule.mjs';
import { runTendinopathy } from './modules/tendinopathy/tendinopathyModule.mjs';
import { runTendonRupture } from './modules/tendonRupture/tendonRuptureModule.mjs';
import { adjustQuadToday } from './shared/quadCheckInCore.mjs';

const DISPATCH = {
  [QUAD_ENTITIES.VASTUS_STRAIN]: runVastusStrain,
  [QUAD_ENTITIES.CONTUSION]: runContusion,
  [QUAD_ENTITIES.TENDINOPATHY]: runTendinopathy,
  [QUAD_ENTITIES.TENDON_RUPTURE]: runTendonRupture,
};

/**
 * Run the full quad engine over raw assessment answers.
 * @param {object} rawInput
 * @returns {object} structured beta output
 */
export function runQuad(rawInput) {
  const { input, missingCoreFields } = makeQuadInput(rawInput);
  const routing = routeEntity(input);
  const moduleFn = DISPATCH[routing.entity];

  if (!moduleFn) {
    return {
      engine: 'quad_engine',
      beta_scope: 'quad_beta_testing_only',
      clinical_authority: false,
      input,
      missing_core_fields: missingCoreFields,
      routing,
      error: `No module registered for entity ${routing.entity}`,
      ...BETA_META,
    };
  }

  const moduleOutput = moduleFn(input);

  return {
    engine: 'quad_engine',
    beta_scope: 'quad_beta_testing_only',
    clinical_authority: false,
    input,
    missing_core_fields: missingCoreFields,
    routing,
    entity: routing.entity,
    ...moduleOutput,
    daily_check_in_contract: {
      selected_session_only: true,
      future_days_changed: false,
      note: 'Use applyQuadCheckIn(session, checkin, output) to adjust today only.',
    },
    ...BETA_META,
  };
}

/**
 * Adjust today's session via daily check-in. Pulls the entity-specific
 * check-in policy (e.g. contusion swelling/ROM withhold) from the engine output.
 */
export function applyQuadCheckIn(todaysSession, checkin, engineOutput = {}) {
  const entityPolicy = engineOutput.checkin_policy || {};
  return adjustQuadToday(todaysSession, checkin, entityPolicy);
}

// Re-exports for direct module access / testing.
export { makeQuadInput, routeEntity, localiseMuscle } from './quadAssessmentInput.mjs';
export { runVastusStrain } from './modules/vastusStrain/vastusStrainModule.mjs';
export { runContusion } from './modules/contusion/contusionModule.mjs';
export { runTendinopathy } from './modules/tendinopathy/tendinopathyModule.mjs';
export { runTendonRupture } from './modules/tendonRupture/tendonRuptureModule.mjs';
export { QUAD_ENTITIES, QUAD_MUSCLES } from './types.mjs';
export { QUAD_CITATIONS } from './citations/quadClinicalCitations.mjs';
