/**
 * lib/clinical/itBandEngine/data/itBandDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the IT band engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs.
 *
 * Safety gate (possible lateral knee structural injury — meniscus/ligament)
 * is deterministic and ALWAYS wins — locking, giving-way, or a significant
 * joint effusion point toward an intra-articular cause that needs imaging/
 * exam, not overuse ITB compression rehab.
 * ---------------------------------------------------------------------------
 */

import { IT_BAND_ENTITIES } from '../types.mjs';

export const IT_BAND_DIAGNOSIS_DATASET = {
  entities: Object.values(IT_BAND_ENTITIES),
  defaultEntity: IT_BAND_ENTITIES.IT_BAND_SYNDROME,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      id: 'possible_lateral_knee_structural_injury',
      test: (i) => i.locking_or_catching === 'yes' || i.giving_way === 'yes' || i.significant_effusion === 'yes',
      entity: IT_BAND_ENTITIES.POSSIBLE_LATERAL_KNEE_STRUCTURAL_INJURY,
      confidence: 'high',
      reason: 'Locking, catching, giving-way, or a significant joint effusion points toward a possible intra-articular cause (e.g. lateral meniscus tear, ligament injury) rather than iliotibial band syndrome — this needs its own exam/imaging pathway.',
      flags: ['possible_lateral_knee_structural_injury', 'urgent_in_person_review'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  rules: [
    { entity: IT_BAND_ENTITIES.IT_BAND_SYNDROME, weight: 35, label: 'Pain located on the outside (lateral) side of the knee',
      when: (i) => i.pain_location === 'lateral_knee' },
    { entity: IT_BAND_ENTITIES.IT_BAND_SYNDROME, weight: 25, label: 'Pain is worse running downhill or descending stairs',
      when: (i) => i.worse_downhill_or_stairs === 'yes' },
    { entity: IT_BAND_ENTITIES.IT_BAND_SYNDROME, weight: 20, label: 'A recent increase in running mileage, intensity, or a new hill/track routine',
      when: (i) => i.recent_training_change === 'yes' },
    { entity: IT_BAND_ENTITIES.IT_BAND_SYNDROME, weight: 15, label: 'Gradual-onset pattern typical of an overuse/running-load condition',
      when: (i) => i.onset === 'gradual' || i.mechanism === 'gradual_overuse' },
    { entity: IT_BAND_ENTITIES.IT_BAND_SYNDROME, weight: 10, label: 'Pain that eases with rest and returns at a consistent point in a run',
      when: (i) => i.consistent_onset_distance === 'yes' },
  ],
};
