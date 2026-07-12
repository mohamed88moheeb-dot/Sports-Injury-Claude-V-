/**
 * lib/clinical/calfEngine/data/calfDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the calf/shin engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs.
 *
 * Safety gates (possible Achilles rupture / possible tibial stress fracture)
 * are deterministic and ALWAYS win. Only the differential among calf strain /
 * Achilles tendinopathy / MTSS is weighted evidence.
 * ---------------------------------------------------------------------------
 */

import { CALF_ENTITIES } from '../types.mjs';

export const CALF_DIAGNOSIS_DATASET = {
  entities: Object.values(CALF_ENTITIES),
  defaultEntity: CALF_ENTITIES.CALF_STRAIN,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      // Achilles rupture (Park 2020 / Thompson test).
      id: 'possible_achilles_rupture',
      test: (i) => i.thompson_test === 'absent_plantarflexion'
        || i.palpable_gap === 'yes'
        || (i.sudden_snap_sensation === 'yes' && i.unable_heel_raise === 'yes'),
      entity: CALF_ENTITIES.POSSIBLE_ACHILLES_RUPTURE,
      confidence: 'high',
      reason: 'A calf squeeze that does not produce foot movement (Thompson test), a palpable gap, or a sudden "snap" with inability to rise on the toes suggests a possible Achilles tendon rupture — this needs urgent in-person assessment, not self-guided rehab.',
      flags: ['possible_achilles_rupture', 'urgent_in_person_review'],
    },
    {
      // Tibial stress fracture (Yates 2020).
      id: 'possible_tibial_stress_fracture',
      test: (i) => i.shin_tenderness_length === 'focal' && i.hop_test === 'positive',
      entity: CALF_ENTITIES.POSSIBLE_STRESS_FRACTURE,
      confidence: 'high',
      reason: 'Focal (rather than diffuse) tibial tenderness combined with a positive single-leg hop test is strongly associated with a tibial stress fracture rather than shin splints — imaging is recommended before starting a running-load programme.',
      flags: ['possible_tibial_stress_fracture', 'urgent_in_person_review'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  rules: [
    // MTSS — gradual overuse + diffuse medial shin pain dominates.
    { entity: CALF_ENTITIES.MTSS, weight: 45, label: 'Diffuse pain along the medial shin during/after running',
      when: (i) => i.pain_location === 'medial_shin' },
    { entity: CALF_ENTITIES.MTSS, weight: 20, label: 'Gradual-onset overuse mechanism typical of a running-load issue',
      when: (i) => i.mechanism === 'gradual_overuse_running' || i.onset === 'gradual' },

    // Achilles tendinopathy — gradual onset + tendon-specific location/stiffness.
    { entity: CALF_ENTITIES.ACHILLES_TENDINOPATHY, weight: 45, label: 'Pain localised to the Achilles tendon (mid-portion or insertion)',
      when: (i) => i.pain_location === 'achilles_mid_portion' || i.pain_location === 'achilles_insertion' },
    { entity: CALF_ENTITIES.ACHILLES_TENDINOPATHY, weight: 25, label: 'Morning stiffness in the tendon that eases with movement',
      when: (i) => i.morning_stiffness === 'yes' },
    { entity: CALF_ENTITIES.ACHILLES_TENDINOPATHY, weight: 15, label: 'Gradual-onset overuse pattern',
      when: (i) => i.onset === 'gradual' && i.pain_location !== 'medial_shin' },

    // Calf strain — the default acute-strain pathway.
    { entity: CALF_ENTITIES.CALF_STRAIN, weight: 15, label: 'Acute posterior calf pain without tendon-rupture or shin-overuse features',
      when: (i) => i.pain_location === 'posterior_calf' || i.onset === 'sudden' },
    { entity: CALF_ENTITIES.CALF_STRAIN, weight: 35, label: 'Sudden mechanism (a sharp "pull" or "shot in the calf" during push-off/sprinting)',
      when: (i) => i.mechanism === 'sudden_push_off' || i.mechanism === 'sprinting' },
  ],
};
