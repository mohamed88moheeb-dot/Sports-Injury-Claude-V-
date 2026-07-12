/**
 * lib/clinical/groinEngine/data/groinDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the adductor/groin engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs.
 *
 * Safety gates (possible hernia / possible hip-joint pathology) are
 * deterministic and ALWAYS win — these need a different diagnostic pathway
 * than self-managed adductor rehab (Weir 2015 Doha classification). Only
 * the differential between acute adductor strain and longstanding
 * adductor-related groin pain is weighted evidence.
 * ---------------------------------------------------------------------------
 */

import { GROIN_ENTITIES } from '../types.mjs';

export const GROIN_DIAGNOSIS_DATASET = {
  entities: Object.values(GROIN_ENTITIES),
  defaultEntity: GROIN_ENTITIES.ADDUCTOR_STRAIN,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      // Possible inguinal/femoral hernia (Weir 2015).
      id: 'possible_hernia',
      test: (i) => i.bulge_present === 'yes' && i.worse_with_straining === 'yes',
      entity: GROIN_ENTITIES.POSSIBLE_HERNIA,
      confidence: 'high',
      reason: 'A groin bulge that worsens with straining/coughing suggests a possible inguinal or femoral hernia — this needs in-person assessment, not self-guided adductor rehab.',
      flags: ['possible_hernia', 'urgent_in_person_review'],
    },
    {
      // Possible hip-joint pathology (FAI/labral) — Reiman 2015.
      id: 'possible_hip_joint_pathology',
      test: (i) => i.fadir_test === 'positive' && i.clicking_or_catching === 'yes',
      entity: GROIN_ENTITIES.POSSIBLE_HIP_JOINT_PATHOLOGY,
      confidence: 'high',
      reason: 'A positive hip flexion-adduction-internal-rotation test combined with clicking/catching suggests the pain may be coming from the hip joint itself (e.g. femoroacetabular impingement or a labral tear) rather than the adductor muscles — this needs its own imaging/assessment pathway.',
      flags: ['possible_hip_joint_pathology', 'urgent_in_person_review'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  rules: [
    // Longstanding/chronic adductor-related pain — duration dominates.
    { entity: GROIN_ENTITIES.ADDUCTOR_RELATED_GROIN_PAIN, weight: 50, label: 'Symptoms have been present for many weeks rather than a single recent injury',
      when: (i) => (Number(i.symptom_duration_weeks) || 0) >= 6 },
    { entity: GROIN_ENTITIES.ADDUCTOR_RELATED_GROIN_PAIN, weight: 20, label: 'Gradual-onset overuse pattern',
      when: (i) => i.onset === 'gradual' || i.mechanism === 'gradual_overuse' },

    // Acute adductor strain — sudden mechanism + recent onset.
    { entity: GROIN_ENTITIES.ADDUCTOR_STRAIN, weight: 15, label: 'Groin pain without a long-standing history or hernia/hip-joint features',
      when: (i) => (Number(i.symptom_duration_weeks) || 0) < 6 },
    { entity: GROIN_ENTITIES.ADDUCTOR_STRAIN, weight: 35, label: 'A sudden mechanism (kicking, change of direction, or forceful sprinting)',
      when: (i) => i.mechanism === 'kicking' || i.mechanism === 'change_of_direction' || i.mechanism === 'sprinting' },
    { entity: GROIN_ENTITIES.ADDUCTOR_STRAIN, weight: 20, label: 'Pain reproduced on resisted adduction (squeeze) testing',
      when: (i) => i.resisted_adduction_pain === 'severe' || i.resisted_adduction_pain === 'moderate' },
  ],
};
