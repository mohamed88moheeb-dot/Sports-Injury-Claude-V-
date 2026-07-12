/**
 * lib/clinical/hipFlexorEngine/data/hipFlexorDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the hip flexor engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs.
 *
 * Safety gates (possible femoral neck stress fracture / possible hip-joint
 * pathology) are deterministic and ALWAYS win — both need a different,
 * urgent diagnostic pathway rather than self-managed hip-flexor rehab.
 * ---------------------------------------------------------------------------
 */

import { HIP_FLEXOR_ENTITIES } from '../types.mjs';

export const HIP_FLEXOR_DIAGNOSIS_DATASET = {
  entities: Object.values(HIP_FLEXOR_ENTITIES),
  defaultEntity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_STRAIN,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      // Femoral neck stress fracture (Bernstein 2022) — time-critical.
      id: 'possible_femoral_neck_stress_fracture',
      test: (i) => i.hop_test === 'positive' && (i.night_pain === 'yes' || i.gradual_onset_runner === 'yes'),
      entity: HIP_FLEXOR_ENTITIES.POSSIBLE_FEMORAL_STRESS_FRACTURE,
      confidence: 'high',
      reason: 'A positive single-leg hop test combined with night pain or an insidious onset in a runner/endurance athlete raises concern for a femoral neck stress fracture — this is time-critical and needs imaging, not self-guided rehab.',
      flags: ['possible_femoral_neck_stress_fracture', 'urgent_in_person_review'],
    },
    {
      // Possible hip-joint pathology (FAI/labral) — Reiman 2015.
      id: 'possible_hip_joint_pathology',
      test: (i) => i.fadir_test === 'positive' && i.clicking_or_catching === 'yes',
      entity: HIP_FLEXOR_ENTITIES.POSSIBLE_HIP_JOINT_PATHOLOGY,
      confidence: 'high',
      reason: 'A positive hip flexion-adduction-internal-rotation test combined with clicking/catching suggests the pain may be coming from the hip joint itself rather than the iliopsoas — this needs its own imaging/assessment pathway.',
      flags: ['possible_hip_joint_pathology', 'urgent_in_person_review'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  rules: [
    // Chronic/overuse iliopsoas-related pain (incl. snapping hip) — duration dominates.
    { entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_RELATED_GROIN_PAIN, weight: 45, label: 'Symptoms have been present for many weeks rather than a single recent injury',
      when: (i) => (Number(i.symptom_duration_weeks) || 0) >= 6 },
    { entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_RELATED_GROIN_PAIN, weight: 30, label: 'A snapping or clicking sensation at the front of the hip with movement',
      when: (i) => i.snapping_sensation === 'yes' },
    { entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_RELATED_GROIN_PAIN, weight: 15, label: 'Gradual-onset overuse pattern',
      when: (i) => i.onset === 'gradual' || i.mechanism === 'gradual_overuse' },

    // Acute iliopsoas strain — sudden mechanism + recent onset.
    { entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_STRAIN, weight: 15, label: 'Hip-flexor pain without a long-standing history or hip-joint/stress-fracture features',
      when: (i) => (Number(i.symptom_duration_weeks) || 0) < 6 },
    { entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_STRAIN, weight: 35, label: 'A sudden, forceful hip-flexion mechanism (kicking, sprint start, or a sit-up type movement)',
      when: (i) => i.mechanism === 'sudden_hip_flexion' },
    { entity: HIP_FLEXOR_ENTITIES.ILIOPSOAS_STRAIN, weight: 20, label: 'Pain reproduced on resisted hip flexion testing',
      when: (i) => i.resisted_hip_flexion_pain === 'severe' || i.resisted_hip_flexion_pain === 'moderate' },
  ],
};
