/**
 * lib/clinical/quadEngine/intake/intakeRouter.mjs
 * ---------------------------------------------------------------------------
 * UNIFIED INTAKE LAYER — three ways in, one engine out.
 *
 *   MODE 1  assessment    adaptive branching questionnaire (default)
 *   MODE 2  known_injury  user names the injury; we personalise
 *   MODE 3  report_upload AI interprets an MRI/X-ray; we confirm + personalise
 *
 * All three converge on the SAME downstream: a complete runQuad() input ->
 * entity routing -> tailored diagnosis -> tailored, cited rehab program.
 *
 * Each mode is a small state machine the UI drives:
 *   begin(...)    -> what to show first (a question / a catalogue / interpretation)
 *   ...collect answers...
 *   finish(input) -> the full engine output
 * ---------------------------------------------------------------------------
 */

import { runQuad } from '../index.mjs';
import { nextStep, simulateAssessment } from './assessmentFlow.mjs';
import { KNOWN_INJURY_CATALOGUE, startKnownInjury, assembleKnownInjuryInput } from './knownInjury.mjs';
import { interpretReport, assembleReportInput } from './reportInterpreter.mjs';

export const INTAKE_MODES = Object.freeze({
  ASSESSMENT: 'assessment',
  KNOWN_INJURY: 'known_injury',
  REPORT_UPLOAD: 'report_upload',
});

/** The three options a user picks between at the start. */
export const INTAKE_MENU = [
  { mode: INTAKE_MODES.ASSESSMENT, label: 'Guided assessment', blurb: 'Answer a few questions and we\'ll work out the likely injury and build your plan.', is_default: true },
  { mode: INTAKE_MODES.KNOWN_INJURY, label: 'I know my injury', blurb: 'Already diagnosed? Pick it and we\'ll personalise the plan.' },
  { mode: INTAKE_MODES.REPORT_UPLOAD, label: 'Upload a scan report', blurb: 'Upload an MRI / ultrasound / X-ray report and we\'ll interpret it and confirm.' },
];

// ── MODE 1: assessment ──────────────────────────────────────────────────────
export function assessmentNext(answers = {}) {
  return nextStep(answers);
}

// ── MODE 2: known injury ────────────────────────────────────────────────────
export function knownInjuryCatalogue() {
  return KNOWN_INJURY_CATALOGUE.map(({ id, label, entity }) => ({ id, label, entity }));
}
export function knownInjuryBegin(injuryId) {
  return startKnownInjury(injuryId);
}

// ── MODE 3: report upload ───────────────────────────────────────────────────
export function reportBegin(reportInput, options) {
  return interpretReport(reportInput, options);
}

/**
 * FINISH — produce the engine output from any mode's assembled answers.
 * @param {object} args
 *   { mode, answers, injuryId?, personalisation?, interpretation?, followUp? }
 */
export function finishIntake(args = {}) {
  const { mode } = args;
  let input;

  switch (mode) {
    case INTAKE_MODES.ASSESSMENT:
      input = args.answers || {};
      break;
    case INTAKE_MODES.KNOWN_INJURY:
      input = assembleKnownInjuryInput(args.injuryId, args.personalisation || {});
      break;
    case INTAKE_MODES.REPORT_UPLOAD:
      input = assembleReportInput(args.interpretation, args.followUp || {});
      break;
    default:
      return { error: `Unknown intake mode: ${mode}` };
  }

  if (input && input.error) return input;
  const result = runQuad(input);
  return { mode, intake_input: input, ...result };
}

/**
 * Convenience one-shot runners (mainly for tests / programmatic use).
 */
export function runAssessmentMode(scriptedAnswers) {
  const sim = simulateAssessment(scriptedAnswers);
  if (!sim.completion.done) return { error: 'assessment incomplete', ...sim };
  return finishIntake({ mode: INTAKE_MODES.ASSESSMENT, answers: sim.completion.input });
}
export function runKnownInjuryMode(injuryId, personalisation) {
  return finishIntake({ mode: INTAKE_MODES.KNOWN_INJURY, injuryId, personalisation });
}
export function runReportMode(reportInput, followUp, options) {
  const interpretation = interpretReport(reportInput, options);
  return { interpretation, result: finishIntake({ mode: INTAKE_MODES.REPORT_UPLOAD, interpretation, followUp }) };
}

export { simulateAssessment } from './assessmentFlow.mjs';
