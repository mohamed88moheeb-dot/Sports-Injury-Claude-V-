/**
 * lib/injuryEngine/rehabPlanGenerator.js
 * ---------------------------------------------------------------------------
 * Builds a personalized, phased rehab plan from a diagnosis result + the
 * original assessment. It is criteria-based (not purely time-based) and
 * personalizes by:
 *   - diagnosis subtype / rehab pathway
 *   - risk level (high-risk -> conservative-only, gated behind review)
 *   - pain level and days since injury (which phase to start in)
 *   - sport (return-to-sport ladder + final-phase emphasis)
 *   - equipment access (resolves exercise variants the user can actually do)
 *   - previous injury history (adds prevention emphasis)
 *   - self-test results (can hold back progression)
 *
 * Public function: generateRehabPlan(diagnosis, assessment)
 * ---------------------------------------------------------------------------
 */

import {
  getRegionKnowledge,
  getProtocolForSubtype,
  getExerciseById
} from '../../data/injuryKnowledge';
import { checkSafety } from './safetyEngine';

/**
 * @param {object} diagnosis  result from diagnoseInjury()
 * @param {object} assessment original assessment object
 * @returns {object} rehab plan (see shape near the end)
 */
export function generateRehabPlan(diagnosis, assessment = {}) {
  const regionId = assessment.primaryRegion;
  const region = getRegionKnowledge(regionId);

  if (!region || !diagnosis || !diagnosis.primaryPattern) {
    return conservativeFallback(assessment);
  }

  const subtypeId = diagnosis.primaryPattern.id;
  const protocol = getProtocolForSubtype(regionId, subtypeId);
  const safety = checkSafety(assessment);

  // High-risk / referral cases: return conservative early-care only and make
  // the review recommendation explicit. We do NOT hand out aggressive loading.
  const conservativeOnly =
    diagnosis.referralRecommended ||
    diagnosis.riskLevel === 'refer' ||
    safety.blockAggressiveRehab;

  if (!protocol) {
    return conservativeFallback(assessment, { subtypeId, conservativeOnly });
  }

  // Decide the starting phase from pain + days since injury.
  const startPhaseId = decideStartPhase(assessment, conservativeOnly, protocol);

  // Resolve equipment for the user.
  const equipment = assessment.equipment || ['bodyweight'];

  // Build phases, resolving each exercise + applying equipment-aware variants.
  // If conservativeOnly, we only expose the first (protect/settle) phase.
  const phasesSource = conservativeOnly
    ? protocol.phases.slice(0, 1)
    : protocol.phases;

  const startIndex = Math.max(
    0,
    phasesSource.findIndex((p) => p.id === startPhaseId)
  );

  const phases = phasesSource.map((phase, idx) => ({
    ...phase,
    isCurrent: idx === startIndex,
    locked: idx < startIndex, // earlier phases considered already cleared
    exercises: (phase.exercises || [])
      .map((exId) => resolveExercise(regionId, exId, equipment))
      .filter(Boolean)
  }));

  // Personalization notes.
  const personalization = buildPersonalizationNotes(assessment, {
    conservativeOnly,
    startPhaseId,
    previousInjury: assessment.previousInjury,
    selfTests: assessment.selfTests
  });

  // Return-to-sport block, tailored to the chosen sport.
  const rts = buildReturnToSport(region, assessment.sport);

  return {
    regionId,
    subtypeId,
    subtypeName: diagnosis.primaryPattern.name,
    protocolId: protocol.id,
    protocolName: protocol.name,
    summary: protocol.summary,
    riskLevel: diagnosis.riskLevel,
    conservativeOnly,
    startPhaseId,
    phases,
    returnToSport: rts,
    maintenancePlan: resolveMaintenance(region, equipment),
    personalization,
    painRulesReminder:
      'General rule: keep pain at or below ~3/10 during exercise and back to baseline within 24 hours. Stop with sharp pain, swelling, instability, or new numbness/tingling.',
    reviewRecommended: conservativeOnly,
    disclaimer: diagnosis.disclaimer
  };
}

/* -------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/**
 * Choose the starting phase. Acute + painful -> protect. Settling -> restore.
 * Conservative-only always starts at the first phase.
 */
function decideStartPhase(assessment, conservativeOnly, protocol) {
  if (conservativeOnly) return protocol.phases[0].id;

  const pain = numeric(assessment.painLevel, 5);
  const days = numeric(assessment.daysSinceInjury, 0);
  const phaseIds = protocol.phases.map((p) => p.id);

  // Very recent or quite painful -> earliest available phase.
  if (days <= 3 || pain >= 6) {
    return phaseIds[0];
  }
  // Settling and a 'restore' phase exists -> start there.
  if (pain <= 3 && days >= 7 && phaseIds.includes('restore')) {
    return 'restore';
  }
  // Default: earliest phase (cautious).
  return phaseIds[0];
}

/**
 * Resolve an exercise id into a concrete exercise the user can perform with
 * their equipment. If the base needs equipment they lack, swap to the
 * noEquipmentAlternative label (kept as a hint; base object is still returned).
 */
function resolveExercise(regionId, exerciseId, equipment) {
  const ex = getExerciseById(regionId, exerciseId);
  if (!ex) return null;

  const needsEquipment = (ex.equipment || []).filter(
    (e) => e !== 'bodyweight' && e !== 'wall'
  );
  const hasAny =
    needsEquipment.length === 0 ||
    needsEquipment.some((e) => equipment.includes(e));

  return {
    ...ex,
    equipmentAvailable: hasAny,
    suggestedVariant: hasAny
      ? null
      : ex.noEquipmentAlternative || ex.easierAlternative || null
  };
}

/** Build human-readable personalization notes. */
function buildPersonalizationNotes(assessment, ctx) {
  const notes = [];
  if (ctx.conservativeOnly) {
    notes.push(
      'Because of higher-risk features, this plan shows conservative early care only and recommends a clinical review before progressing.'
    );
  }
  const pain = numeric(assessment.painLevel, null);
  if (pain !== null) {
    if (pain >= 6) notes.push('Higher current pain — starting gently and holding back progression.');
    else if (pain <= 3) notes.push('Lower current pain — you may be ready to progress sooner if check-ins stay green.');
  }
  const days = numeric(assessment.daysSinceInjury, null);
  if (days !== null && days <= 3) {
    notes.push('Recent injury — early phase focuses on settling and protecting.');
  }
  if (ctx.previousInjury) {
    notes.push('Previous injury here — prevention/maintenance work is emphasized later.');
  }
  if (assessment.sport) {
    notes.push(`Return-to-sport is tailored to ${assessment.sport}.`);
  }
  // Self-test gating: a clearly painful key self-test holds progression.
  const selfTests = assessment.selfTests || {};
  const painfulTests = Object.keys(selfTests).filter((k) => {
    const t = selfTests[k];
    return t && (t.result === 'painful' || (typeof t.pain === 'number' && t.pain >= 5));
  });
  if (painfulTests.length) {
    notes.push('One or more self-tests were clearly painful — progression will be held until they calm down.');
  }
  return notes;
}

/** Tailor the region's return-to-sport block to the chosen sport. */
function buildReturnToSport(region, sport) {
  const rts = region.returnToSport || {};
  const sportNotes = (rts.sportSpecific && sport && rts.sportSpecific[sport]) || [];
  return {
    ladder: rts.genericLadder || [],
    criteriaToReturn: rts.criteriaToReturn || [],
    sport: sport || null,
    sportSpecificNotes: sportNotes
  };
}

/** Resolve maintenance exercises to concrete objects. */
function resolveMaintenance(region, equipment) {
  const mp = region.maintenancePlan || {};
  const exercises = (mp.exercises || [])
    .map((id) => resolveExercise(region.id, id, equipment))
    .filter(Boolean);
  return { ...mp, exercises };
}

/** Conservative fallback plan (no protocol / high-risk / unknown). */
function conservativeFallback(assessment, ctx = {}) {
  return {
    regionId: assessment.primaryRegion || null,
    subtypeId: ctx.subtypeId || null,
    protocolId: 'conservative_fallback',
    protocolName: 'Conservative early care',
    summary:
      'Gentle, pain-free early care while you arrange a clinical review or until a clearer pattern emerges.',
    riskLevel: 'refer',
    conservativeOnly: true,
    startPhaseId: 'protect',
    phases: [
      {
        id: 'protect',
        name: 'Phase 1 – Protect and settle',
        goal: 'Calm symptoms, move comfortably, avoid aggravation.',
        isCurrent: true,
        locked: false,
        intensityGuidance: 'Gentle, pain-free only',
        painRules: 'Keep everything pain-free. Do not push through pain.',
        avoid: ['Sport', 'Sprinting/jumping', 'Stretching into pain', 'Heavy loading'],
        progressionCriteria: ['Only progress under professional guidance'],
        regressionCriteria: ['Any worsening — seek review sooner'],
        exercises: []
      }
    ],
    returnToSport: { ladder: [], criteriaToReturn: [], sport: assessment.sport || null, sportSpecificNotes: [] },
    maintenancePlan: null,
    personalization: ['A clear pattern or protocol was not available, so this plan stays conservative.'],
    painRulesReminder:
      'Keep everything pain-free. Stop with sharp pain, swelling, instability, or new numbness/tingling.',
    reviewRecommended: true,
    disclaimer: (typeof ctx.disclaimer === 'string' && ctx.disclaimer) || undefined
  };
}

function numeric(v, fallback) {
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback;
}
