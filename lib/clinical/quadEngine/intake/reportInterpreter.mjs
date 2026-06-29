/**
 * lib/clinical/quadEngine/intake/reportInterpreter.mjs
 * ---------------------------------------------------------------------------
 * INTAKE MODE 3 — REPORT INTERPRETATION (MRI / ultrasound / X-ray).
 *
 * Pipeline:
 *   report text/image  -> EXTRACTOR -> structured findings
 *                      -> MAP       -> engine entity + severity seed + confidence
 *                      -> GAPS      -> targeted follow-up questions to raise accuracy
 *                      -> runQuad   -> tailored, clinician-gated program
 *
 * The EXTRACTOR is pluggable. The default is a deterministic keyword/grade
 * parser over report TEXT (reports contain structured phrases like
 * "grade 2 strain of vastus lateralis at the myotendinous junction"). A real
 * vision/LLM model is injected via `options.extractor` — same contract.
 *
 * GOVERNANCE: this is ASSISTIVE ONLY. It never asserts a diagnosis; it proposes
 * the closest engine match, always lowers confidence for ambiguity, always
 * returns follow-up questions, and always requires clinician review. Imaging is
 * the radiologist's domain — this maps a report onto a rehab pathway, nothing more.
 * ---------------------------------------------------------------------------
 */

import { QUAD_ENTITIES, QUAD_MUSCLES } from '../types.mjs';

// ── Default deterministic extractor (text -> structured findings) ───────────
const MUSCLE_PATTERNS = [
  [/vastus\s+lateralis|\bVL\b/i, QUAD_MUSCLES.VASTUS_LATERALIS],
  [/vastus\s+medialis|\bVMO?\b/i, QUAD_MUSCLES.VASTUS_MEDIALIS],
  [/vastus\s+intermedius|\bVI\b/i, QUAD_MUSCLES.VASTUS_INTERMEDIUS],
  [/rectus\s+femoris|\bRF\b/i, QUAD_MUSCLES.RECTUS_FEMORIS],
];

const TENDON_PATTERNS = [/patellar\s+tendon/i, /quadriceps\s+tendon/i, /patellar\s+ligament/i];

/**
 * Parse a free-text imaging report into structured findings.
 * @param {string} text
 * @returns {object} findings
 */
export function defaultReportExtractor(text = '') {
  const t = String(text);
  const findings = {
    raw_excerpt: t.slice(0, 280),
    muscle: null, tissue: null, grade: null, bamic: null,
    pathology: null, structures: [], side: null, retraction_cm: null,
  };

  // Muscle
  for (const [re, m] of MUSCLE_PATTERNS) { if (re.test(t)) { findings.muscle = m; break; } }

  // Side
  if (/\bleft\b/i.test(t)) findings.side = 'left';
  else if (/\bright\b/i.test(t)) findings.side = 'right';

  // BAMIC grade+site e.g. "2b", "3c", "grade 2"
  const bamic = t.match(/\b([0-4])\s?([abc])\b/);
  if (bamic) { findings.bamic = `${bamic[1]}${bamic[2]}`; findings.grade = Number(bamic[1]); }
  const grade = t.match(/grade\s*([0-4])/i);
  if (grade && findings.grade == null) findings.grade = Number(grade[1]);

  // Tissue plane
  if (/intratendinous|intra-?tendinous|central\s+tendon/i.test(t)) findings.tissue = 'intratendinous';
  else if (/myotendinous|musculotendinous|MTJ/i.test(t)) findings.tissue = 'myotendinous';
  else if (/myofascial|peripheral/i.test(t)) findings.tissue = 'myofascial';
  else if (/intramuscular|muscle\s+belly/i.test(t)) findings.tissue = 'muscular';

  // Pathology class (order matters: most specific first)
  if (/complete\s+(tear|rupture)|full[-\s]?thickness\s+tear|rupture/i.test(t) && TENDON_PATTERNS.some((re) => re.test(t))) {
    findings.pathology = 'tendon_rupture';
  } else if (/tendinopathy|tendinosis|tendinitis/i.test(t)) {
    findings.pathology = 'tendinopathy';
  } else if (/contusion|h[ae]matoma|myositis\s+ossificans/i.test(t)) {
    findings.pathology = 'contusion';
    if (/myositis\s+ossificans/i.test(t)) findings.structures.push('myositis_ossificans');
    if (/h[ae]matoma/i.test(t)) findings.structures.push('hematoma');
  } else if (/strain|tear|partial[-\s]?thickness|oedema|edema|fibre\s+disruption|fiber\s+disruption/i.test(t)) {
    findings.pathology = 'muscle_strain';
  }

  // Retraction (rupture surgical signal)
  const retr = t.match(/retract(?:ion|ed)?\s*(?:of)?\s*([0-9]+(?:\.[0-9]+)?)\s*cm/i);
  if (retr) findings.retraction_cm = Number(retr[1]);

  return findings;
}

// ── Map findings -> engine entity + seed + confidence ───────────────────────
function mapFindingsToEntity(f) {
  const reasons = [];
  let entity, seed = {}, confidence = 0.4;

  switch (f.pathology) {
    case 'tendon_rupture':
      entity = QUAD_ENTITIES.TENDON_RUPTURE;
      seed = { pain_location: 'anterior_knee_tendon', mechanism: 'eccentric_load_pop' };
      confidence = 0.8; reasons.push('report describes a tendon rupture/complete tear');
      if (f.retraction_cm != null) reasons.push(`retraction ${f.retraction_cm} cm noted (surgical signal)`);
      break;
    case 'tendinopathy':
      entity = QUAD_ENTITIES.TENDINOPATHY;
      seed = { pain_location: 'anterior_knee_tendon', mechanism: 'gradual_overuse', onset: 'gradual', pain_localised_to_tendon: 'yes' };
      confidence = 0.75; reasons.push('report describes tendinopathy/tendinosis');
      break;
    case 'contusion':
      entity = QUAD_ENTITIES.CONTUSION;
      seed = { pain_location: 'anterior_thigh', mechanism: 'direct_impact' };
      confidence = 0.75; reasons.push('report describes contusion/haematoma');
      if (f.structures.includes('myositis_ossificans')) { reasons.push('myositis ossificans present — flag for review'); seed.bruising_or_swelling = 'significant'; }
      break;
    case 'muscle_strain':
      entity = QUAD_ENTITIES.VASTUS_STRAIN;
      seed = { pain_location: muscleToLocation(f.muscle), mechanism: 'sprinting' };
      if (f.muscle && f.muscle !== QUAD_MUSCLES.RECTUS_FEMORIS) seed.muscle_hint = f.muscle;
      confidence = f.muscle ? 0.7 : 0.5;
      reasons.push(`report describes a muscle strain${f.muscle ? ` of ${f.muscle.replace(/_/g, ' ')}` : ''}`);
      break;
    default:
      // Unclear — default to the strain pathway at low confidence, lean on follow-ups.
      entity = QUAD_ENTITIES.VASTUS_STRAIN;
      seed = { mechanism: 'unsure' };
      confidence = 0.3; reasons.push('pathology not clearly stated in report — low confidence, follow-ups needed');
  }

  // Rectus femoris belongs to the dedicated RF engine.
  const rf_note = f.muscle === QUAD_MUSCLES.RECTUS_FEMORIS
    ? 'Report indicates rectus femoris — route to the dedicated RF engine, not the vastus pathway.' : null;

  // Confidence adjustments.
  if (f.grade != null) confidence = Math.min(0.95, confidence + 0.1);
  if (f.tissue === 'intratendinous') reasons.push('intratendinous involvement — longer healing, flag for review');

  return { entity, seed, confidence, reasons, rf_note };
}

function muscleToLocation(m) {
  if (m === QUAD_MUSCLES.VASTUS_LATERALIS) return 'lateral_thigh';
  if (m === QUAD_MUSCLES.VASTUS_MEDIALIS) return 'medial_thigh';
  return 'anterior_thigh';
}

// Fields each entity's program personalisation benefits from (for follow-up gaps).
const ENTITY_FOLLOWUP_FIELDS = {
  [QUAD_ENTITIES.VASTUS_STRAIN]: ['pain_severity_label', 'ability_to_continue', 'walking_response', 'days_since_injury'],
  [QUAD_ENTITIES.CONTUSION]: ['knee_flexion_rom_percent', 'bruising_or_swelling', 'days_since_injury'],
  [QUAD_ENTITIES.TENDINOPATHY]: ['decline_squat_pain_0_10', 'pain_with_jumping', 'pain_severity_label'],
  [QUAD_ENTITIES.TENDON_RUPTURE]: ['surgical_repair_done', 'weeks_since_surgery'],
};

/**
 * Interpret a report and propose the engine match + follow-up questions.
 * @param {object} input  { text?, structured?, side?, days_since_injury? }
 * @param {object} options { extractor?: (text)=>findings }  // inject an AI model here
 * @returns {object}
 */
export function interpretReport(input = {}, options = {}) {
  const extractor = options.extractor || defaultReportExtractor;
  const findings = input.structured || extractor(input.text || '');
  const mapped = mapFindingsToEntity(findings);

  // Carry any directly-provided context fields into the seed.
  const seed = { ...mapped.seed, injury_entity_override: mapped.entity };
  if (typeof input.days_since_injury === 'number') seed.days_since_injury = input.days_since_injury;

  // Gaps -> follow-up questions to raise accuracy before finalising the program.
  const needed = ENTITY_FOLLOWUP_FIELDS[mapped.entity] || [];
  const follow_up_fields = needed.filter((f) => seed[f] === undefined);

  return {
    mode: 'report_upload',
    findings,
    proposed_entity: mapped.entity,
    seed,
    match_confidence: mapped.confidence,
    confidence_band: mapped.confidence >= 0.7 ? 'good' : mapped.confidence >= 0.45 ? 'moderate' : 'low',
    reasons: mapped.reasons,
    rectus_femoris_note: mapped.rf_note,
    follow_up_fields,
    governance: {
      assistive_only: true,
      requires_clinician_review: true,
      note: 'Report interpretation proposes the closest rehab pathway. It is not a diagnosis and does not replace the radiologist\'s report or clinician review.',
    },
  };
}

/** Assemble the final runQuad input from the interpretation + follow-up answers. */
export function assembleReportInput(interpretation, followUpAnswers = {}) {
  return { ...interpretation.seed, ...followUpAnswers };
}
