/**
 * lib/injuryEngine/safetyEngine.js
 * ---------------------------------------------------------------------------
 * Red-flag / safety layer. This runs BEFORE and ALONGSIDE the diagnosis and
 * rehab engines. Its job is to:
 *   - detect global red flags (apply to any region)
 *   - detect region-specific red flags (defined per injury file)
 *   - decide whether output should be overridden toward "seek review"
 *   - prevent aggressive rehab recommendations for high-risk cases
 *
 * It never claims a diagnosis. It surfaces concerns and recommended actions.
 * ---------------------------------------------------------------------------
 */

import { GLOBAL_RED_FLAGS, getRegionKnowledge } from '../../data/injuryKnowledge';

/**
 * Evaluate an assessment for red flags.
 *
 * @param {object} assessment
 *   {
 *     primaryRegion: 'knee',
 *     exactArea: 'patellar_tendon_area',
 *     answers: { questionId: value, ... },
 *     selfTests: { testId: { result, pain } },
 *     globalFlags: { cannot_bear_weight: true, ... }  // optional explicit map
 *   }
 *
 * @returns {object}
 *   {
 *     hasRedFlags: boolean,
 *     highestSeverity: 'none' | 'caution' | 'urgent',
 *     flags: [{ id, source, severity, message, action }],
 *     blockAggressiveRehab: boolean,   // true if rehab should stay conservative
 *     recommendation: string           // user-facing recommendation
 *   }
 */
export function checkSafety(assessment = {}) {
  const flags = [];
  const answers = assessment.answers || {};
  const globalFlags = assessment.globalFlags || {};

  // ---- 1. Global red flags -------------------------------------------------
  // A global flag fires if it is set truthy in either the explicit globalFlags
  // map or as an answer with the same id.
  for (const flag of GLOBAL_RED_FLAGS) {
    const triggered = globalFlags[flag.id] === true || answers[flag.id] === true;
    if (triggered) {
      flags.push({
        id: flag.id,
        source: 'global',
        severity: flag.severity,
        message: flag.question,
        action: flag.action
      });
    }
  }

  // ---- 2. Region-specific red flags ---------------------------------------
  const region = getRegionKnowledge(assessment.primaryRegion);
  if (region && Array.isArray(region.redFlags)) {
    for (const rf of region.redFlags) {
      if (regionFlagTriggered(rf, answers)) {
        flags.push({
          id: rf.id,
          source: 'region',
          severity: rf.severity || 'caution',
          message: rf.message,
          action: rf.message
        });
      }
    }
  }

  // ---- 3. Question-level red-flag triggers --------------------------------
  // Questions can declare a redFlagTrigger ({ value, severity }). If the user's
  // answer matches, raise a caution/urgent flag even without a composite rule.
  if (region && Array.isArray(region.assessmentQuestions)) {
    for (const q of region.assessmentQuestions) {
      if (!q.redFlagTrigger) continue;
      if (answers[q.id] === q.redFlagTrigger.value) {
        // Avoid duplicating a flag id already present.
        if (!flags.some((f) => f.id === `q_${q.id}`)) {
          flags.push({
            id: `q_${q.id}`,
            source: 'question',
            severity: q.redFlagTrigger.severity || 'caution',
            message: q.text,
            action:
              'This answer is a reason to be cautious and consider a clinical review.'
          });
        }
      }
    }
  }

  // ---- 4. Summarize --------------------------------------------------------
  const highestSeverity = flags.reduce((acc, f) => {
    if (f.severity === 'urgent') return 'urgent';
    if (f.severity === 'caution' && acc !== 'urgent') return 'caution';
    return acc;
  }, 'none');

  const hasRedFlags = flags.length > 0;
  // Any urgent flag, or 2+ caution flags, keeps rehab conservative.
  const cautionCount = flags.filter((f) => f.severity === 'caution').length;
  const blockAggressiveRehab =
    highestSeverity === 'urgent' || cautionCount >= 2;

  return {
    hasRedFlags,
    highestSeverity,
    flags,
    blockAggressiveRehab,
    recommendation: buildRecommendation(highestSeverity, flags)
  };
}

/**
 * A region red flag may require a number of its trigger answers to match
 * (requireCount). triggerAnswers is a list of { questionId, value }.
 */
function regionFlagTriggered(rf, answers) {
  const triggers = rf.triggerAnswers || [];
  if (triggers.length === 0) return false;
  const matches = triggers.filter((t) => answers[t.questionId] === t.value).length;
  const required = rf.requireCount || triggers.length;
  return matches >= required;
}

/** Build a single user-facing recommendation line based on severity. */
function buildRecommendation(severity, flags) {
  if (severity === 'urgent') {
    return (
      'Some of your answers suggest this may need prompt in-person medical attention. ' +
      'Please avoid loading the area and arrange an urgent assessment. ' +
      'This tool does not diagnose injuries.'
    );
  }
  if (severity === 'caution') {
    return (
      'Some of your answers suggest a clinical review would be wise before progressing. ' +
      'You can begin gentle, conservative care, but seek professional advice if symptoms persist or worsen.'
    );
  }
  return 'No red flags were detected from your answers. This is guidance only, not a diagnosis.';
}

/**
 * Convenience: should the diagnosis output be presented with a strong
 * "seek review" framing? (urgent severity present)
 */
export function shouldOverrideToReferral(safetyResult) {
  return safetyResult && safetyResult.highestSeverity === 'urgent';
}
