/**
 * lib/injuryEngine/scoringEngine.js
 * ---------------------------------------------------------------------------
 * Generic, rule-based scoring. NOT an AI model. It reads the diagnosisRules
 * declared in each injury file and turns a user's assessment into ranked,
 * normalized pattern-match scores per subtype.
 *
 * Scoring model
 *   - Each subtype has a list of conditions. A condition that matches adds its
 *     points (which may be negative).
 *   - rawScore = sum of matched condition points (floored at 0).
 *   - maxPossible = sum of all POSITIVE condition points for that subtype.
 *   - confidence = round(rawScore / maxPossible * 100), capped at 96 so we
 *     never imply diagnostic certainty.
 *   - Each matched condition contributes a human-readable reason.
 *
 * Condition shape (from the data files):
 *   { type: 'area',     value: [...] | 'x',           points, reason }
 *   { type: 'answer',   questionId, value,            points, reason }
 *   { type: 'selfTest', testId, result,               points, reason }
 * ---------------------------------------------------------------------------
 */

import { getRegionKnowledge, getConfidenceBand } from '../../data/injuryKnowledge';
import { clamp, round } from '../../data/injuryKnowledge/shared';

const CONFIDENCE_CAP = 96; // never present as definitive certainty

/**
 * Score every subtype for a region against the assessment.
 *
 * @param {object} assessment { primaryRegion, exactArea, answers, selfTests }
 * @returns {Array} ranked list of:
 *   { subtypeId, name, riskLevel, confidence, confidenceLabel, rawScore,
 *     maxPossible, reasoning: [string] }
 */
export function scoreSubtypes(assessment = {}) {
  const region = getRegionKnowledge(assessment.primaryRegion);
  if (!region) return [];

  const results = region.diagnosisRules.map((rule) => {
    const subtype = region.injurySubtypes.find((s) => s.id === rule.subtypeId);
    const evaluation = evaluateRule(rule, assessment);
    const confidence = normalize(evaluation.rawScore, evaluation.maxPossible);
    const band = getConfidenceBand(confidence);

    return {
      subtypeId: rule.subtypeId,
      name: subtype ? subtype.name : rule.subtypeId,
      riskLevel: subtype ? subtype.riskLevel : 'moderate',
      rehabPathway: subtype ? subtype.rehabPathway : null,
      confidence,
      confidenceLabel: band.label,
      confidenceBand: band.id,
      rawScore: evaluation.rawScore,
      maxPossible: evaluation.maxPossible,
      reasoning: evaluation.reasons
    };
  });

  // Rank by confidence (desc), then rawScore as a tiebreaker.
  results.sort((a, b) => b.confidence - a.confidence || b.rawScore - a.rawScore);
  return results;
}

/**
 * Evaluate a single subtype rule against the assessment.
 * Returns { rawScore, maxPossible, reasons }.
 */
function evaluateRule(rule, assessment) {
  let rawScore = 0;
  let maxPossible = 0;
  const reasons = [];

  for (const cond of rule.conditions || []) {
    if (cond.points > 0) maxPossible += cond.points;

    if (conditionMatches(cond, assessment)) {
      rawScore += cond.points;
      if (cond.reason && cond.points > 0) reasons.push(cond.reason);
    }
  }

  return {
    rawScore: Math.max(0, rawScore),
    maxPossible: maxPossible || 1, // avoid divide-by-zero
    reasons
  };
}

/** Decide whether a single condition matches the assessment. */
function conditionMatches(cond, assessment) {
  switch (cond.type) {
    case 'area': {
      const area = assessment.exactArea;
      if (Array.isArray(cond.value)) return cond.value.includes(area);
      return area === cond.value;
    }
    case 'answer': {
      const ans = (assessment.answers || {})[cond.questionId];
      if (Array.isArray(ans)) return ans.includes(cond.value); // multi-select
      return ans === cond.value;
    }
    case 'selfTest': {
      const test = (assessment.selfTests || {})[cond.testId];
      if (!test) return false;
      // Match either an explicit result, or infer "painful" from a pain score.
      if (cond.result) {
        if (test.result) return test.result === cond.result;
        if (cond.result === 'painful' && typeof test.pain === 'number') {
          return test.pain >= 4;
        }
        if (cond.result === 'mild' && typeof test.pain === 'number') {
          return test.pain >= 1 && test.pain <= 3;
        }
        if (cond.result === 'pain_free' && typeof test.pain === 'number') {
          return test.pain === 0;
        }
      }
      return false;
    }
    default:
      return false;
  }
}

/** Normalize a raw score to a capped 0–100 confidence. */
function normalize(rawScore, maxPossible) {
  const pct = (rawScore / maxPossible) * 100;
  return clamp(round(pct), 0, CONFIDENCE_CAP);
}
