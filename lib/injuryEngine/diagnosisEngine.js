/**
 * lib/injuryEngine/diagnosisEngine.js
 * ---------------------------------------------------------------------------
 * Orchestrates the rule-based "diagnosis support" output. It combines:
 *   - scoringEngine (ranked pattern matches)
 *   - safetyEngine (red flags / referral override)
 *
 * It returns a NON-DEFINITIVE result: a most-likely PATTERN, alternatives,
 * reasoning, a risk level, any red flags, and a recommended next step.
 *
 * Public function: diagnoseInjury(assessment)
 * ---------------------------------------------------------------------------
 */

import { scoreSubtypes } from './scoringEngine';
import { checkSafety, shouldOverrideToReferral } from './safetyEngine';
import { maxRisk, DISCLAIMER } from '../../data/injuryKnowledge';

/**
 * @param {object} assessment
 *   {
 *     primaryRegion: 'hamstring',
 *     exactArea: 'mid_hamstring_belly',
 *     answers: { mechanism: 'sprinting', pop: true, ... },
 *     selfTests: { resisted_knee_flexion: { result: 'painful', pain: 6 } },
 *     painLevel: 6,
 *     daysSinceInjury: 2,
 *     sport: 'Football / soccer',
 *     equipment: ['bodyweight','band'],
 *     previousInjury: false,
 *     globalFlags: { cannot_bear_weight: false }
 *   }
 *
 * @returns {object} see shape below.
 */
export function diagnoseInjury(assessment = {}) {
  // 1. Safety first.
  const safety = checkSafety(assessment);

  // 2. Score subtypes.
  const ranked = scoreSubtypes(assessment);

  // Guard: unsupported region or no rules.
  if (ranked.length === 0) {
    return emptyResult(assessment, safety);
  }

  const top = ranked[0];
  const alternatives = ranked
    .slice(1)
    .filter((r) => r.confidence > 0)
    .slice(0, 3)
    .map((r) => ({
      id: r.subtypeId,
      name: r.name,
      confidence: r.confidence,
      confidenceLabel: r.confidenceLabel,
      riskLevel: r.riskLevel
    }));

  // 3. Risk level = the more cautious of the top pattern's own risk and any
  //    elevation forced by the safety layer.
  let riskLevel = top.riskLevel || 'moderate';
  if (safety.highestSeverity === 'urgent') riskLevel = maxRisk(riskLevel, 'refer');
  else if (safety.highestSeverity === 'caution') riskLevel = maxRisk(riskLevel, 'high');

  // 4. Next recommended step.
  const referralOverride = shouldOverrideToReferral(safety);
  const nextRecommendedStep = buildNextStep({
    referralOverride,
    riskLevel,
    topConfidence: top.confidence,
    safety
  });

  return {
    primaryPattern: {
      id: top.subtypeId,
      name: top.name,
      confidence: top.confidence,
      confidenceLabel: top.confidenceLabel,
      confidenceBand: top.confidenceBand,
      riskLevel,
      rehabPathway: top.rehabPathway,
      reasoning: top.reasoning.length
        ? top.reasoning
        : ['Based on the limited information provided, this is the closest matching pattern.']
    },
    alternatives,
    redFlags: safety.flags,
    referralRecommended: referralOverride || riskLevel === 'refer',
    riskLevel,
    nextRecommendedStep,
    safetyRecommendation: safety.recommendation,
    disclaimer: DISCLAIMER,
    // Full ranked list retained for transparency / debugging / UI detail views.
    rankedPatterns: ranked
  };
}

/** Build the recommended next step string. */
function buildNextStep({ referralOverride, riskLevel, topConfidence, safety }) {
  if (referralOverride) {
    return 'Clinical review recommended before starting rehab — some answers suggest this needs an in-person assessment.';
  }
  if (riskLevel === 'refer') {
    return 'Clinical review recommended. You can use conservative early-care guidance in the meantime, but avoid aggressive loading.';
  }
  if (safety.highestSeverity === 'caution') {
    return 'Begin cautious Phase 1 rehab if symptoms remain stable, and seek a clinical review if they persist or worsen.';
  }
  if (topConfidence < 40) {
    return 'The pattern match is low — symptoms could fit several patterns. Begin gentle Phase 1 rehab and consider a clinical review if it does not settle.';
  }
  return 'Begin cautious Phase 1 rehab if symptoms remain stable and no red flags appear.';
}

/** Fallback when no scoring is possible (unsupported region etc.). */
function emptyResult(assessment, safety) {
  return {
    primaryPattern: null,
    alternatives: [],
    redFlags: safety.flags,
    referralRecommended: safety.highestSeverity === 'urgent',
    riskLevel: safety.highestSeverity === 'urgent' ? 'refer' : 'low',
    nextRecommendedStep:
      'We could not build a pattern match for this area yet. If symptoms are significant, consider a clinical review.',
    safetyRecommendation: safety.recommendation,
    disclaimer: DISCLAIMER,
    rankedPatterns: []
  };
}
