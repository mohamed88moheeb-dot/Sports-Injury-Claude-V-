/**
 * lib/clinical/lowerBackEngine/data/lowerBackDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the lower back engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs.
 *
 * Safety gates (priority-ordered, deterministic, ALWAYS win):
 *   1. Possible cauda equina / serious spinal pathology — saddle
 *      anaesthesia, bladder/bowel dysfunction, bilateral leg involvement
 *      with progressive weakness, significant trauma, or unexplained
 *      weight loss/fever. This is an EMERGENCY pathway, not routine review.
 *   2. Possible spondylolysis (pars stress injury) — young athlete in an
 *      extension/rotation-loading sport with extension-provoked pain, or a
 *      positive single-leg hyperextension ("stork") test. Needs imaging
 *      before any guided loading progression.
 * ---------------------------------------------------------------------------
 */

import { LOWER_BACK_ENTITIES } from '../types.mjs';

export const LOWER_BACK_DIAGNOSIS_DATASET = {
  entities: Object.values(LOWER_BACK_ENTITIES),
  defaultEntity: LOWER_BACK_ENTITIES.NON_SPECIFIC_LOW_BACK_PAIN,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      id: 'possible_cauda_equina_or_serious_pathology',
      test: (i) => i.saddle_numbness === 'yes' || i.bladder_or_bowel_dysfunction === 'yes'
        || (i.bilateral_leg_symptoms === 'yes' && i.progressive_neuro_deficit === 'yes')
        || i.recent_significant_trauma === 'yes' || i.unexplained_weight_loss_or_fever === 'yes',
      entity: LOWER_BACK_ENTITIES.POSSIBLE_CAUDA_EQUINA_OR_SERIOUS_PATHOLOGY,
      confidence: 'high',
      reason: 'Saddle numbness, bladder/bowel changes, bilateral leg symptoms with progressive weakness, significant trauma, or unexplained weight loss/fever are red flags for a serious spinal condition (e.g. cauda equina syndrome, fracture, malignancy) that needs emergency/urgent in-person assessment — not self-guided rehab.',
      flags: ['possible_cauda_equina_or_serious_pathology', 'emergency_in_person_review'],
    },
    {
      id: 'possible_spondylolysis',
      test: (i) => (i.age_group === 'youth_or_adolescent' && i.extension_rotation_sport === 'yes' && i.worse_with_extension === 'yes')
        || i.single_leg_hyperextension_test === 'positive',
      entity: LOWER_BACK_ENTITIES.POSSIBLE_SPONDYLOLYSIS,
      confidence: 'moderate',
      reason: 'An extension-provoked pattern in a young athlete doing repetitive extension/rotation loading (or a positive single-leg hyperextension test) suggests a possible pars interarticularis stress injury (spondylolysis) — this needs imaging to confirm before any guided loading progression.',
      flags: ['possible_spondylolysis', 'urgent_in_person_review'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  rules: [
    { entity: LOWER_BACK_ENTITIES.LUMBAR_RADICULAR_PAIN, weight: 40, label: 'Leg pain extending below the knee',
      when: (i) => i.leg_pain_below_knee === 'yes' },
    { entity: LOWER_BACK_ENTITIES.LUMBAR_RADICULAR_PAIN, weight: 25, label: 'Numbness or tingling in the leg in a band-like pattern',
      when: (i) => i.numbness_tingling_leg === 'yes' },
    { entity: LOWER_BACK_ENTITIES.LUMBAR_RADICULAR_PAIN, weight: 15, label: 'Pain worse with sitting/bending forward (flexion-provoked)',
      when: (i) => i.worse_with_flexion_sitting === 'yes' && i.leg_pain_below_knee === 'yes' },

    { entity: LOWER_BACK_ENTITIES.NON_SPECIFIC_LOW_BACK_PAIN, weight: 20, label: 'Pain confined to the back without leg symptoms below the knee',
      when: (i) => i.leg_pain_below_knee !== 'yes' },
    { entity: LOWER_BACK_ENTITIES.NON_SPECIFIC_LOW_BACK_PAIN, weight: 15, label: 'A specific lifting/twisting mechanism or gradual overuse pattern typical of mechanical low back pain',
      when: (i) => i.mechanism === 'sudden_lift_twist' || i.mechanism === 'gradual_overuse' },
  ],
};
