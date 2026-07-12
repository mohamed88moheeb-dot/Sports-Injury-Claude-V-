/**
 * lib/clinical/ankleEngine/data/ankleDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the ankle engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs (same generic scorer the quad
 * engine uses — see that file for the scoring semantics).
 *
 * Safety gates (possible fracture / suspected unstable syndesmosis) are
 * deterministic and ALWAYS win. Only the differential among lateral sprain /
 * stable syndesmosis sprain / chronic instability is weighted evidence.
 * ---------------------------------------------------------------------------
 */

import { ANKLE_ENTITIES } from '../types.mjs';

export const ANKLE_DIAGNOSIS_DATASET = {
  entities: Object.values(ANKLE_ENTITIES),
  defaultEntity: ANKLE_ENTITIES.LATERAL_SPRAIN,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      // Ottawa Ankle Rules (Stiell 1993 / Vuurberg 2018): either sign alone
      // is enough to warrant imaging before any self-guided rehab begins.
      id: 'ottawa_ankle_rules_positive',
      test: (i) => i.bone_tenderness_malleolus === 'yes'
        || i.bone_tenderness_midfoot === 'yes'
        || i.unable_to_bear_weight_4_steps === 'yes',
      entity: ANKLE_ENTITIES.POSSIBLE_FRACTURE,
      confidence: 'high',
      reason: 'Bone tenderness at the malleolus/midfoot or inability to bear weight for 4 steps meets the Ottawa Ankle Rules — imaging is needed to rule out fracture before starting rehab.',
      flags: ['ottawa_ankle_rules_positive', 'urgent_in_person_review'],
    },
    {
      // Suspected unstable syndesmosis (diastasis) — this is the ankle
      // equivalent of the quad engine's extensor-mechanism-rupture gate: a
      // sign profile that should never be "outvoted" by accumulated evidence
      // for a milder pattern.
      id: 'suspected_syndesmotic_instability',
      test: (i) => (i.squeeze_test === 'positive' || i.external_rotation_test === 'positive')
        && (i.diastasis_suspected === 'yes' || i.unable_to_bear_weight_4_steps === 'yes'),
      entity: ANKLE_ENTITIES.POSSIBLE_FRACTURE,
      confidence: 'high',
      reason: 'Positive syndesmosis stress test combined with suspected widening (diastasis) or inability to bear weight suggests an unstable syndesmosis injury — this needs in-person assessment and imaging, not self-guided rehab.',
      flags: ['suspected_syndesmotic_instability', 'urgent_in_person_review'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  rules: [
    // Chronic instability — recurrent pattern dominates once established.
    { entity: ANKLE_ENTITIES.CHRONIC_INSTABILITY, weight: 55, label: 'Two or more prior ankle sprains, or ongoing giving-way episodes without a fresh injury',
      when: (i) => (Number(i.prior_sprain_count) || 0) >= 2 || i.giving_way_without_new_injury === 'yes' },
    { entity: ANKLE_ENTITIES.CHRONIC_INSTABILITY, weight: 20, label: 'Feeling of instability lasting well beyond the expected acute-healing window',
      when: (i) => i.giving_way_without_new_injury === 'yes' && (Number(i.months_since_last_sprain) || 0) >= 3 },

    // Stable syndesmosis — pain above the mortise + positive stress tests,
    // without the instability signals that would trigger the safety gate above.
    { entity: ANKLE_ENTITIES.SYNDESMOSIS_SPRAIN, weight: 45, label: 'Pain above the ankle mortise with each step, rather than lateral ankle pain',
      when: (i) => i.pain_above_mortise === 'yes' },
    { entity: ANKLE_ENTITIES.SYNDESMOSIS_SPRAIN, weight: 30, label: 'Positive squeeze test or external-rotation stress test',
      when: (i) => i.squeeze_test === 'positive' || i.external_rotation_test === 'positive' },
    { entity: ANKLE_ENTITIES.SYNDESMOSIS_SPRAIN, weight: 15, label: 'Mechanism was a forced external rotation / "foot planted, body rotated" injury',
      when: (i) => i.mechanism === 'external_rotation' },

    // Lateral sprain — the default acute inversion pathway. A bare baseline so
    // it always has SOME score, with more when a classic inversion mechanism
    // was actually reported.
    { entity: ANKLE_ENTITIES.LATERAL_SPRAIN, weight: 15, label: 'Acute ankle sprain pattern without instability history or syndesmosis signs',
      when: (i) => i.pain_above_mortise !== 'yes' },
    { entity: ANKLE_ENTITIES.LATERAL_SPRAIN, weight: 35, label: 'Classic inversion ("rolled the ankle inward") mechanism',
      when: (i) => i.mechanism === 'inversion' },
  ],
};
