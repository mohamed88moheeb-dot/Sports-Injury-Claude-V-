/**
 * lib/clinical/gluteEngine/data/gluteDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the glutes engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs.
 *
 * Safety gate (possible deep gluteal syndrome / sciatic nerve entrapment) is
 * deterministic and ALWAYS wins — radiating neural symptoms need a different
 * diagnostic pathway than self-managed gluteal strain/tendinopathy rehab.
 * ---------------------------------------------------------------------------
 */

import { GLUTE_ENTITIES } from '../types.mjs';

export const GLUTE_DIAGNOSIS_DATASET = {
  entities: Object.values(GLUTE_ENTITIES),
  defaultEntity: GLUTE_ENTITIES.GLUTEAL_STRAIN,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      // Deep gluteal syndrome / sciatic nerve entrapment (Hernando 2015).
      id: 'possible_deep_gluteal_syndrome',
      test: (i) => i.radiating_pain_below_knee === 'yes' && (i.numbness_tingling === 'yes' || i.nerve_provocation_test === 'positive'),
      entity: GLUTE_ENTITIES.POSSIBLE_DEEP_GLUTEAL_SYNDROME,
      confidence: 'high',
      reason: 'Pain radiating below the knee combined with numbness/tingling or a positive nerve provocation test suggests possible sciatic nerve involvement (deep gluteal syndrome) rather than a simple muscle strain or tendinopathy — this needs its own assessment pathway.',
      flags: ['possible_deep_gluteal_syndrome', 'urgent_in_person_review'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  rules: [
    // Gluteal tendinopathy / GTPS — lateral hip location + classic aggravators.
    { entity: GLUTE_ENTITIES.GLUTEAL_TENDINOPATHY, weight: 40, label: 'Pain on the outside (lateral) point of the hip rather than deep in the buttock',
      when: (i) => i.pain_location === 'lateral_hip' },
    { entity: GLUTE_ENTITIES.GLUTEAL_TENDINOPATHY, weight: 25, label: 'Pain is worse lying on that side at night',
      when: (i) => i.worse_lying_on_side === 'yes' },
    { entity: GLUTE_ENTITIES.GLUTEAL_TENDINOPATHY, weight: 20, label: 'Gradual-onset pattern worse with stairs or prolonged sitting',
      when: (i) => (i.onset === 'gradual' || i.mechanism === 'gradual_overuse') && i.worse_with_stairs_sitting === 'yes' },
    { entity: GLUTE_ENTITIES.GLUTEAL_TENDINOPATHY, weight: 15, label: 'Pain reproduced on single-leg stance or resisted hip abduction testing',
      when: (i) => i.single_leg_stance_pain === 'yes' || i.resisted_abduction_pain === 'moderate' || i.resisted_abduction_pain === 'severe' },

    // Acute gluteal strain — sudden mechanism + recent onset, deep/posterior location.
    { entity: GLUTE_ENTITIES.GLUTEAL_STRAIN, weight: 15, label: 'Buttock pain without a long-standing history or lateral-hip/GTPS features',
      when: (i) => i.pain_location !== 'lateral_hip' },
    { entity: GLUTE_ENTITIES.GLUTEAL_STRAIN, weight: 35, label: 'A sudden mechanism (sprinting, sudden deceleration, or a fall)',
      when: (i) => i.mechanism === 'sudden_deceleration' || i.mechanism === 'sprinting' || i.mechanism === 'fall' },
  ],
};
