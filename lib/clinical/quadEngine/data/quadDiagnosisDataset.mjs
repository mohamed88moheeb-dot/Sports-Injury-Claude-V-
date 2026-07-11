/**
 * lib/clinical/quadEngine/data/quadDiagnosisDataset.mjs
 * ---------------------------------------------------------------------------
 * Data-driven diagnosis dataset for the quad engine, consumed by
 * lib/clinical/core/dataDrivenDiagnosis.mjs. This FORMALIZES the differential
 * logic that used to live as a hand-written if/else priority chain in
 * quadAssessmentInput.mjs — same clinical reasoning, now declared as data so
 * a new injury can be added by writing a dataset file like this one instead
 * of a bespoke routing function.
 *
 * Safety gates (rupture / post-surgical) stay deterministic and ALWAYS win —
 * these are exactly as strict as the original hand-coded checks. Only the
 * differential among contusion / tendinopathy / vastus-strain is expressed as
 * weighted, numerically-scored evidence.
 * ---------------------------------------------------------------------------
 */

import { QUAD_ENTITIES } from '../types.mjs';

export const QUAD_DIAGNOSIS_DATASET = {
  entities: Object.values(QUAD_ENTITIES),
  defaultEntity: QUAD_ENTITIES.VASTUS_STRAIN,

  // ── Safety gates: deterministic, priority-ordered, never scored ──────────
  safetyGates: [
    {
      id: 'extensor_mechanism_compromise',
      test: (i) => {
        const cannotExtend = i.knee_extension_response === 'unable';
        const cannotSLR = i.straight_leg_raise === 'unable';
        const lag = i.extensor_lag === 'present';
        const gap = i.palpable_gap === 'present';
        const ruptureSignals = [cannotExtend, cannotSLR, lag, gap].filter(Boolean).length;
        return cannotSLR || lag || ruptureSignals >= 2;
      },
      entity: QUAD_ENTITIES.TENDON_RUPTURE,
      confidence: 'high',
      reason: 'Loss of active knee extension / straight-leg-raise or palpable gap suggests possible extensor-mechanism (tendon) rupture. Time-critical — surgical pathway, in-person assessment required.',
      flags: ['extensor_mechanism_compromise', 'urgent_in_person_review'],
    },
    {
      id: 'post_surgical_context',
      test: (i) => i.surgical_repair_done === true || i.weeks_since_surgery != null,
      entity: QUAD_ENTITIES.TENDON_RUPTURE,
      confidence: 'high',
      reason: 'Post-surgical tendon repair context — post-operative, clinician-led pathway.',
      flags: ['post_surgical'],
    },
  ],

  // ── Weighted differential (only reached if no safety gate fired) ─────────
  // Weights are direct confidence-point contributions (see scorer docs).
  rules: [
    // Contusion — a highly discriminating mechanism, so it dominates alone.
    { entity: QUAD_ENTITIES.CONTUSION, weight: 70, label: 'Direct blow to the thigh ("dead leg") mechanism',
      when: (i) => i.mechanism === 'direct_impact' },
    { entity: QUAD_ENTITIES.CONTUSION, weight: 10, label: 'Significant bruising/swelling alongside a direct-impact mechanism',
      when: (i) => i.mechanism === 'direct_impact' && i.bruising_or_swelling === 'significant' },

    // Tendinopathy — overuse mechanism + tendon-specific signs stack.
    { entity: QUAD_ENTITIES.TENDINOPATHY, weight: 25, label: 'Gradual-onset / overuse mechanism',
      when: (i) => i.mechanism === 'gradual_overuse' || i.mechanism === 'jumping_overuse' || i.onset === 'gradual' },
    { entity: QUAD_ENTITIES.TENDINOPATHY, weight: 40, label: 'Pain localised to the extensor tendon',
      when: (i) => i.pain_localised_to_tendon === 'yes' || i.pain_location === 'anterior_knee_tendon' },
    { entity: QUAD_ENTITIES.TENDINOPATHY, weight: 25, label: 'Pain specifically with jumping/loading',
      when: (i) => i.pain_with_jumping === 'yes' },

    // Vastus strain — the default acute-strain pathway. A bare baseline so it
    // always has SOME score (matching the original code's literal default),
    // with a bit more when a real mechanism was actually given.
    { entity: QUAD_ENTITIES.VASTUS_STRAIN, weight: 15, label: 'Acute strain pattern without impact, rupture, or overuse-tendon features',
      when: (i) => i.mechanism !== 'direct_impact' },
    { entity: QUAD_ENTITIES.VASTUS_STRAIN, weight: 30, label: 'A specific injury mechanism was reported',
      when: (i) => !!i.mechanism && i.mechanism !== 'direct_impact' },
  ],
};
