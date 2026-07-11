/**
 * lib/clinical/core/dataDrivenDiagnosis.mjs
 * ---------------------------------------------------------------------------
 * Generic, reusable diagnosis scorer. An injury engine supplies a DATASET
 * (data, not code) describing:
 *
 *   - safetyGates: ordered, deterministic checks that ALWAYS win regardless of
 *     score (e.g. a suspected tendon rupture must never be "outvoted" by
 *     accumulated weighted evidence for a milder pattern). These are the same
 *     kind of hard checks every engine in this app already hand-codes as
 *     if/else priority chains — here they're just declared as data so the
 *     scoring logic itself is shared, not reimplemented per injury.
 *   - rules: weighted evidence for the remaining differential. Each rule says
 *     "if this condition holds on the input, add this many points to this
 *     entity's score." Scores are normalised to a 0-100 CONFIDENCE per entity
 *     so the result is a real number, not a hand-picked 'high'/'moderate'/'low'
 *     label — while still producing those labels for UI compatibility.
 *
 * This module has ZERO injury-specific clinical knowledge — that lives
 * entirely in each engine's dataset file. It only knows how to score data
 * against rules. This is what lets a new injury be added as a data file
 * instead of a new hand-written diagnosis function.
 * ---------------------------------------------------------------------------
 */

/**
 * @typedef {object} SafetyGate
 * @property {string} id
 * @property {(input: object) => boolean} test
 * @property {string} entity
 * @property {string} reason
 * @property {'high'|'moderate'} confidence
 * @property {string[]} [flags]
 */

/**
 * @typedef {object} ScoringRule
 * @property {string} entity        candidate entity this rule supports
 * @property {(input: object) => boolean} when
 * @property {number} weight        positive = supports, negative = counter-evidence
 * @property {string} label         human-readable reason, shown in the score breakdown
 */

/**
 * @typedef {object} DiagnosisDataset
 * @property {string[]} entities          all candidate entity ids
 * @property {SafetyGate[]} safetyGates
 * @property {ScoringRule[]} rules
 * @property {string} [defaultEntity]     used only if no rule fires at all
 */

function confidenceLabel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

/**
 * @param {DiagnosisDataset} dataset
 * @param {object} input   normalized assessment input
 * @returns {object} { entity, confidence, confidence_score, reason, flags, safety_gated, breakdown }
 */
export function scoreDiagnosis(dataset, input) {
  // 1. Clinician / prior override always wins outright.
  if (input.injury_entity_override && dataset.entities.includes(input.injury_entity_override)) {
    return {
      entity: input.injury_entity_override, confidence: 'high', confidence_score: 100,
      reason: 'Clinician or prior-diagnosis override.', flags: ['entity_overridden'],
      safety_gated: false, breakdown: {},
    };
  }

  // 2. Safety gates — deterministic, priority-ordered, never scored against.
  for (const gate of dataset.safetyGates || []) {
    if (gate.test(input)) {
      return {
        entity: gate.entity, confidence: gate.confidence, confidence_score: gate.confidence === 'high' ? 90 : 65,
        reason: gate.reason, flags: [...(gate.flags || [])], safety_gated: true, breakdown: {},
      };
    }
  }

  // 3. Weighted differential over the remaining rules.
  const raw = {};       // entity -> summed weight
  const matched = {};   // entity -> [{label, weight}]
  for (const entity of dataset.entities) { raw[entity] = 0; matched[entity] = []; }

  for (const rule of dataset.rules || []) {
    if (!rule.when(input)) continue;
    raw[rule.entity] = (raw[rule.entity] || 0) + rule.weight;
    matched[rule.entity].push({ label: rule.label, weight: rule.weight });
  }

  const entries = Object.entries(raw).filter(([, w]) => w !== 0);
  if (!entries.length) {
    const fallback = dataset.defaultEntity || dataset.entities[0];
    return {
      entity: fallback, confidence: 'low', confidence_score: 20,
      reason: 'No specific signals matched — defaulting to the most general pattern for this region.',
      flags: ['no_rules_matched'], safety_gated: false, breakdown: {},
    };
  }

  entries.sort((a, b) => b[1] - a[1]);
  const [topEntity, topScore] = entries[0];
  // Weights are calibrated by the dataset author as direct confidence-point
  // contributions (a decisive sign ~50-70, supporting evidence ~15-30, a bare
  // default baseline ~10-20) — NOT a relative share of total weight. Sharing
  // would wrongly inflate a lone, unopposed baseline rule to ~100%; summing
  // and clamping keeps "nothing distinctive matched" reading as low/moderate.
  const score = Math.round(Math.min(95, Math.max(5, topScore)));

  const reasonParts = matched[topEntity].map((m) => m.label);
  return {
    entity: topEntity,
    confidence: confidenceLabel(score),
    confidence_score: score,
    reason: reasonParts.length ? reasonParts.join('; ') + '.' : 'Best-matching pattern from the answers provided.',
    flags: matched[topEntity].map((m) => m.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')),
    safety_gated: false,
    breakdown: Object.fromEntries(entries.map(([e, w]) => [e, { score: w, matched: matched[e] }])),
  };
}
