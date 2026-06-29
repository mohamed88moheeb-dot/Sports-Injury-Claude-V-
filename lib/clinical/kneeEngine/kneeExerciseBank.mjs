/**
 * lib/clinical/kneeEngine/kneeExerciseBank.mjs
 * ---------------------------------------------------------------------------
 * Curated exercise bank keyed by entity -> stage. Beta-default dosage only;
 * inert metadata. Stages: protect | activate | strengthen | dynamic | return.
 * Evidence per exercise via source_refs (see citations + RESEARCH.md).
 *
 * This is the FOUNDATION library (clinically complete enough to generate a
 * staged plan per entity); it is sized for breadth across 10 entities and is
 * intended to be deepened to full per-entity parity in a later pass, exactly as
 * the quad engine was (41 -> 88).
 * ---------------------------------------------------------------------------
 */

const ex = (id, name, stage, block, purpose, dosage, source_refs, opts = {}) => ({
  id, name, stage, block, purpose, dosage,
  equipment: opts.equipment || ['bodyweight'],
  why: opts.why || '', cautions: opts.cautions || [], source_refs,
});

export const KNEE_EXERCISES = {
  // ── ACL (conservative or post-op; criteria-based) ───────────────────────
  acl_injury: [
    ex('ACL-1', 'Quadriceps set + straight-leg raise', 'protect', 'activation', 'Restore quad activation and extension control', { sets: '3', reps: '10', hold: '5 s' }, ['KNEE-CIT-002'], { why: 'Early quad activation limits shutdown; extension is the priority.' }),
    ex('ACL-2', 'Heel slides / stationary bike for ROM', 'protect', 'mobility', 'Restore knee range of motion', { sets: '—', detail: 'gentle, to comfort; full extension priority' }, ['KNEE-CIT-002']),
    ex('ACL-3', 'Closed-chain mini-squat & leg press', 'activate', 'strength', 'Rebuild quad/glute strength in a stable range', { sets: '3', reps: '12', range: 'partial' }, ['KNEE-CIT-002'], { equipment: ['bodyweight', 'machine'] }),
    ex('ACL-4', 'Single-leg balance & perturbation training', 'activate', 'control_balance', 'Neuromuscular control and joint position sense', { sets: '3', detail: 'progress eyes-open to unstable surface' }, ['KNEE-CIT-002'], { why: 'Neuromuscular control is central to ACL rehab and copers.' }),
    ex('ACL-5', 'Progressive heavy strength (squat, RDL, step-up)', 'strengthen', 'strength', 'Close the limb strength gap', { sets: '4', reps: '6-8', load: 'progressive', target: 'quad LSI ->90%' }, ['KNEE-CIT-013', 'KNEE-CIT-014'], { equipment: ['gym'] }),
    ex('ACL-6', 'Plyometric & landing-mechanics progression', 'dynamic', 'control_balance', 'Reactive strength and safe landing/cutting mechanics', { sets: '—', detail: 'double- then single-leg; control valgus' }, ['KNEE-CIT-002', 'KNEE-CIT-003'], { cautions: ['Control knee valgus on landing — a re-injury risk.'] }),
    ex('ACL-7', 'Running & change-of-direction build-up', 'dynamic', 'running_sport_prep', 'Reintroduce running then cutting', { sets: '—', detail: 'linear -> curved -> planned -> reactive cutting' }, ['KNEE-CIT-002']),
    ex('ACL-8', 'Return-to-sport criteria battery', 'return', 'control_balance', 'Objective clearance: strength + hop symmetry + psychological readiness', { sets: '—', detail: 'quad strength LSI >=90% AND 4 hop tests >=90% AND RTS confidence' }, ['KNEE-CIT-013', 'KNEE-CIT-014'], { cautions: ['Do not clear on hop symmetry alone — confirm quad strength.', 'Young pivoting athletes: stricter criteria (higher re-injury risk).'] }),
  ],

  // ── PCL (mostly conservative; quad-protective) ──────────────────────────
  pcl_injury: [
    ex('PCL-1', 'Quadriceps sets in extension (braced)', 'protect', 'activation', 'Quad activation protects against posterior tibial sag', { sets: '3', reps: '10', hold: '5 s' }, ['KNEE-CIT-001'], { why: 'The quadriceps dynamically resists posterior translation in PCL injury.', cautions: ['Avoid early resisted hamstring / open-chain knee flexion — loads the PCL.'] }),
    ex('PCL-2', 'Prone/supported ROM (avoid posterior sag)', 'protect', 'mobility', 'Restore motion while protecting the PCL', { sets: '—', detail: 'support the tibia; avoid unsupported flexion' }, ['KNEE-CIT-001']),
    ex('PCL-3', 'Closed-chain quad strengthening', 'activate', 'strength', 'Quad-dominant strengthening', { sets: '3', reps: '12' }, ['KNEE-CIT-001'], { equipment: ['bodyweight', 'machine'] }),
    ex('PCL-4', 'Progressive squat / leg press (quad bias)', 'strengthen', 'strength', 'Build quad strength and control', { sets: '4', reps: '8' }, ['KNEE-CIT-001'], { equipment: ['gym'] }),
    ex('PCL-5', 'Running & sport build-up', 'dynamic', 'running_sport_prep', 'Graded return to running and sport', { sets: '—', detail: 'criteria-based progression' }, ['KNEE-CIT-001']),
    ex('PCL-6', 'Return criteria + quad symmetry check', 'return', 'control_balance', 'Confirm quad strength symmetry before return', { sets: '—', detail: 'quad LSI >=90%' }, ['KNEE-CIT-013']),
  ],

  // ── MCL (conservative grades I-II; valgus-protected) ────────────────────
  mcl_injury: [
    ex('MCL-1', 'Pain-free ROM + quad sets (hinged brace if graded)', 'protect', 'activation', 'Maintain motion and quad activation, protect valgus', { sets: '3', reps: '10' }, ['KNEE-CIT-012'], { cautions: ['Avoid valgus stress (knee falling inward) early.'] }),
    ex('MCL-2', 'Stationary bike / heel slides', 'protect', 'mobility', 'Restore range', { sets: '—', detail: 'comfortable range' }, ['KNEE-CIT-012']),
    ex('MCL-3', 'Closed-chain strength in neutral alignment', 'activate', 'strength', 'Strengthen with knee tracking over the foot', { sets: '3', reps: '12' }, ['KNEE-CIT-012'], { equipment: ['bodyweight', 'band'] }),
    ex('MCL-4', 'Hip + quad progressive strengthening', 'strengthen', 'strength', 'Build medial-side load tolerance', { sets: '4', reps: '8' }, ['KNEE-CIT-012'], { equipment: ['gym'] }),
    ex('MCL-5', 'Multidirectional & cutting build-up', 'dynamic', 'running_sport_prep', 'Reintroduce lateral and cutting load', { sets: '—', detail: 'planned -> reactive change of direction' }, ['KNEE-CIT-012']),
    ex('MCL-6', 'Return-to-sport check (valgus control)', 'return', 'control_balance', 'Confirm pain-free valgus-loaded movement', { sets: '—', detail: 'symmetric strength + pain-free cutting' }, ['KNEE-CIT-012']),
  ],

  // ── LCL / PLC (high-grade = surgical; conservative for low grade) ───────
  lcl_plc_injury: [
    ex('LCL-1', 'Protected ROM + quad/hip activation', 'protect', 'activation', 'Maintain motion and activation (low-grade only)', { sets: '3', reps: '10' }, ['KNEE-CIT-001'], { cautions: ['High-grade LCL/PLC needs surgical review — do not self-manage.', 'Avoid varus stress (knee bowing outward).'] }),
    ex('LCL-2', 'Closed-chain strengthening (neutral)', 'activate', 'strength', 'Strengthen with controlled alignment', { sets: '3', reps: '12' }, ['KNEE-CIT-001'], { equipment: ['bodyweight', 'band'] }),
    ex('LCL-3', 'Progressive strength + balance', 'strengthen', 'strength', 'Build strength and lateral control', { sets: '4', reps: '8' }, ['KNEE-CIT-001'], { equipment: ['gym'] }),
    ex('LCL-4', 'Graded return to running/sport', 'dynamic', 'running_sport_prep', 'Criteria-based return', { sets: '—', detail: 'clinician-guided' }, ['KNEE-CIT-001']),
  ],

  // ── Meniscus (conservative-first; locked -> referral) ───────────────────
  meniscus_tear: [
    ex('MEN-1', 'Pain-free ROM + quad sets', 'protect', 'activation', 'Restore motion and quad activation', { sets: '3', reps: '10' }, ['KNEE-CIT-001', 'KNEE-CIT-004'], { cautions: ['Avoid deep loaded flexion and twisting early.'] }),
    ex('MEN-2', 'Closed-chain strengthening (mid-range)', 'activate', 'strength', 'Strengthen without provoking the tear', { sets: '3', reps: '12', range: 'mid' }, ['KNEE-CIT-001'], { equipment: ['bodyweight', 'machine'] }),
    ex('MEN-3', 'Progressive quad/hip/hamstring strength', 'strengthen', 'strength', 'Build load tolerance', { sets: '4', reps: '8' }, ['KNEE-CIT-001'], { equipment: ['gym'] }),
    ex('MEN-4', 'Running & sport build-up', 'dynamic', 'running_sport_prep', 'Graded return; add twisting last', { sets: '—', detail: 'linear -> pivoting' }, ['KNEE-CIT-001']),
    ex('MEN-5', 'Return-to-sport criteria', 'return', 'control_balance', 'Confirm pain-free loaded twisting', { sets: '—', detail: 'symmetric strength + pain-free sport movements' }, ['KNEE-CIT-001']),
  ],

  // ── Patellofemoral pain (hip + knee) ────────────────────────────────────
  patellofemoral_pain: [
    ex('PFP-1', 'Activity / load modification + isometric quad', 'protect', 'tissue_specific_loading', 'Settle pain and offload the joint', { sets: '5', hold: '45 s' }, ['KNEE-CIT-001', 'KNEE-CIT-005'], { why: 'Reduce aggravating load; isometrics for pain relief.' }),
    ex('PFP-2', 'Hip abductor / external-rotator strengthening', 'activate', 'strength', 'Improve hip control of the knee (key driver)', { sets: '3', reps: '12 each' }, ['KNEE-CIT-005'], { why: 'Hip+knee strengthening beats knee alone for PFPS (Nascimento 2017).', equipment: ['band'] }),
    ex('PFP-3', 'Quadriceps strengthening (pain-free range)', 'activate', 'strength', 'Strengthen the quads in a tolerable range', { sets: '3', reps: '12' }, ['KNEE-CIT-005'], { equipment: ['bodyweight', 'band'] }),
    ex('PFP-4', 'Step-down & single-leg control', 'strengthen', 'control_balance', 'Functional knee control under load', { sets: '3', reps: '10 each' }, ['KNEE-CIT-005']),
    ex('PFP-5', 'Optional patellar taping / foot orthoses', 'protect', 'tissue_specific_loading', 'Short-term symptom relief adjunct', { sets: '—', detail: 'adjunct, not standalone' }, ['KNEE-CIT-001'], { cautions: ['Adjunct only; load-based exercise is the core treatment.'] }),
    ex('PFP-6', 'Return to running / sport progression', 'dynamic', 'running_sport_prep', 'Graded return to aggravating activity', { sets: '—', detail: 'progress volume as pain allows' }, ['KNEE-CIT-005']),
  ],

  // ── Patellar instability (rehab-first; recurrent -> referral) ───────────
  patellar_instability: [
    ex('PI-1', 'Quad / VMO activation + brace-free settle', 'protect', 'activation', 'Restore quad control after dislocation', { sets: '3', reps: '10' }, ['KNEE-CIT-006'], { why: 'PT is essential; bracing has no clear long-term benefit (ESSKA 2024).' }),
    ex('PI-2', 'Hip abductor / ER + quad strengthening', 'activate', 'strength', 'Control the patella via hip + quad', { sets: '3', reps: '12 each' }, ['KNEE-CIT-006'], { equipment: ['band'] }),
    ex('PI-3', 'Single-leg control & step-downs', 'strengthen', 'control_balance', 'Functional control in flexion', { sets: '3', reps: '10 each' }, ['KNEE-CIT-006']),
    ex('PI-4', 'Gradual return to sport (avoid provocative positions early)', 'dynamic', 'running_sport_prep', 'Reintroduce sport movements progressively', { sets: '—', detail: 'criteria-based' }, ['KNEE-CIT-006', 'KNEE-CIT-007'], { cautions: ['Recurrent dislocation or anatomic risk (trochlear dysplasia, alta) -> surgical review.'] }),
  ],

  // ── Knee OA (exercise + education + weight) ─────────────────────────────
  knee_osteoarthritis: [
    ex('OA-1', 'Education + self-management + activity pacing', 'protect', 'education', 'Empower self-management (strong recommendation)', { sets: '—', detail: 'education core to care' }, ['KNEE-CIT-008', 'KNEE-CIT-009'], { why: 'Exercise + education + weight management are strongly recommended for knee OA.' }),
    ex('OA-2', 'Progressive quadriceps / lower-limb strengthening', 'activate', 'strength', 'Strengthen to support the joint and reduce pain', { sets: '3', reps: '10-12', freq: '2-3x/week' }, ['KNEE-CIT-008', 'KNEE-CIT-009'], { equipment: ['bodyweight', 'band', 'machine'] }),
    ex('OA-3', 'Aerobic conditioning (bike / walking)', 'activate', 'conditioning', 'Improve function and weight management', { sets: '—', detail: 'low-impact, build duration' }, ['KNEE-CIT-008'], { equipment: ['bike'] }),
    ex('OA-4', 'Balance & functional strength (sit-to-stand, steps)', 'strengthen', 'control_balance', 'Functional capacity for daily activity', { sets: '3', reps: '10' }, ['KNEE-CIT-009']),
    ex('OA-5', 'Maintenance exercise + weight-management signposting', 'return', 'strength', 'Sustain gains; signpost weight loss if overweight', { sets: '—', detail: 'ongoing 2-3x/week' }, ['KNEE-CIT-008'], { cautions: ['Not curative — function-focused; signpost weight management and medical options.'] }),
  ],

  // ── ITB syndrome (load mgmt + hip + running form) ───────────────────────
  itb_syndrome: [
    ex('ITB-1', 'Relative rest from provocative running', 'protect', 'education', 'Reduce aggravating load (downhill/long runs)', { sets: '—', detail: 'modify volume/terrain' }, ['KNEE-CIT-010'], { why: 'Load management + hip strengthening + running-form change (van der Worp 2012).' }),
    ex('ITB-2', 'Hip abductor / gluteal strengthening', 'activate', 'strength', 'Improve hip control of the lateral chain', { sets: '3', reps: '12 each' }, ['KNEE-CIT-010'], { equipment: ['band'] }),
    ex('ITB-3', 'Single-leg control + running-form drills', 'strengthen', 'control_balance', 'Hip/knee coordination and cadence', { sets: '3', reps: '10 each' }, ['KNEE-CIT-010']),
    ex('ITB-4', 'Graded running return (avoid downhill early)', 'dynamic', 'running_sport_prep', 'Rebuild running load progressively', { sets: '—', detail: 'flat -> longer -> hills last' }, ['KNEE-CIT-010'], { cautions: ['Reintroduce downhill running last.'] }),
  ],

  // ── Osgood-Schlatter (load mgmt, self-limiting) ─────────────────────────
  osgood_schlatter: [
    ex('OSD-1', 'Activity modification + relative rest', 'protect', 'education', 'Reduce extensor-mechanism traction load', { sets: '—', detail: 'reduce jumping/sprinting volume to tolerable' }, ['KNEE-CIT-011'], { why: 'Self-limiting apophysitis; symptomatic + activity-modification management.' }),
    ex('OSD-2', 'Quadriceps + hamstring flexibility', 'protect', 'mobility', 'Reduce traction on the tibial tubercle', { sets: '2-3', hold: '30 s' }, ['KNEE-CIT-011']),
    ex('OSD-3', 'Pain-guided progressive quad strengthening', 'activate', 'strength', 'Rebuild capacity within tolerable pain', { sets: '3', reps: '12' }, ['KNEE-CIT-011'], { equipment: ['bodyweight', 'band'] }),
    ex('OSD-4', 'Graded return to sport (pain-guided)', 'dynamic', 'running_sport_prep', 'Reintroduce jumping/running as pain settles', { sets: '—', detail: 'pain <=3/10 guide' }, ['KNEE-CIT-011'], { cautions: ['Reassure: usually resolves at skeletal maturity. Atypical/older presentation -> review.'] }),
  ],
};

/** Pool for an entity + stage. */
export function kneePool(entity, stageId) {
  return (KNEE_EXERCISES[entity] || []).filter((e) => e.stage === stageId);
}
/** All stages an entity has exercises for, in canonical order. */
export function kneeEntityStages(entity) {
  const order = ['protect', 'activate', 'strengthen', 'dynamic', 'return'];
  const present = new Set((KNEE_EXERCISES[entity] || []).map((e) => e.stage));
  return order.filter((s) => present.has(s));
}
