/**
 * lib/clinical/rfBetaAppAdapter/rfBetaStorage.mjs
 * ---------------------------------------------------------------------------
 * Pure (de)serialization helpers + the localStorage key for RF beta testing
 * state. No Supabase, no sensitive data. The actual localStorage read/write is
 * performed by the client provider; these helpers just shape the payload.
 * ---------------------------------------------------------------------------
 */

export const RF_BETA_STORAGE_KEY = 'rf_beta_result_v1';

/**
 * @param {object} state { assessmentInput, rfOutput, selection, lastCheckIn }
 */
export function serializeRfBeta(state) {
  const { assessmentInput = null, rfOutput = null, selection = null, lastCheckIn = null } = state || {};
  return JSON.stringify({
    version: 'rf_beta_v1',
    saved_at: new Date().toISOString(),
    assessment_input: assessmentInput,
    rf_output: rfOutput,
    selection,
    last_check_in: lastCheckIn
  });
}

export function deserializeRfBeta(raw) {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (!p || p.version !== 'rf_beta_v1') return null;
    return {
      assessmentInput: p.assessment_input || null,
      rfOutput: p.rf_output || null,
      selection: p.selection || null,
      lastCheckIn: p.last_check_in || null
    };
  } catch {
    return null;
  }
}
