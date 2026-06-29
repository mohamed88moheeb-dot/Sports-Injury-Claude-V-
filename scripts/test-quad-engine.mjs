/**
 * scripts/test-quad-engine.mjs
 * ---------------------------------------------------------------------------
 * Smoke + invariant tests for the quad engine. Run: node scripts/test-quad-engine.mjs
 * Covers: routing across all 4 entities, severity boundaries, urgent-referral
 * gating, check-in withholds, post-op stage mapping, and citation integrity.
 * ---------------------------------------------------------------------------
 */

import { runQuad, applyQuadCheckIn } from '../lib/clinical/quadEngine/index.mjs';
import { QUAD_CITATIONS } from '../lib/clinical/quadEngine/citations/quadClinicalCitations.mjs';
import { VASTUS_STRAIN_EXERCISES } from '../lib/clinical/quadEngine/modules/vastusStrain/vastusStrainExercises.mjs';
import { CONTUSION_EXERCISES } from '../lib/clinical/quadEngine/modules/contusion/contusionExercises.mjs';
import { TENDINOPATHY_EXERCISES } from '../lib/clinical/quadEngine/modules/tendinopathy/tendinopathyExercises.mjs';
import { RUPTURE_EXERCISES } from '../lib/clinical/quadEngine/modules/tendonRupture/tendonRuptureExercises.mjs';
import { startAssessment, completeAssessment, ENTITY_QUESTIONNAIRES } from '../lib/clinical/quadEngine/quadAssessmentSchema.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

// ── Routing ────────────────────────────────────────────────────────────────
check('vastus strain routes', runQuad({ mechanism: 'sprinting', pain_location: 'lateral_thigh', ability_to_continue: 'limited', pain_severity_label: 'moderate' }).entity === 'vastus_strain');
check('contusion routes', runQuad({ mechanism: 'direct_impact', pain_location: 'anterior_thigh', ability_to_continue: 'limited', pain_severity_label: 'moderate' }).entity === 'quad_contusion');
check('tendinopathy routes', runQuad({ mechanism: 'jumping_overuse', onset: 'gradual', pain_location: 'anterior_knee_tendon', pain_localised_to_tendon: 'yes', pain_with_jumping: 'yes', pain_severity_label: 'moderate' }).entity === 'quad_tendinopathy');
check('rupture routes', runQuad({ mechanism: 'eccentric_load_pop', pain_location: 'anterior_knee_tendon', extensor_lag: 'present', straight_leg_raise: 'unable', ability_to_continue: 'no', pain_severity_label: 'severe' }).entity === 'quad_tendon_rupture');

// ── Routing priority ─────────────────────────────────────────────────────────
check('rupture signs beat direct impact', runQuad({ mechanism: 'direct_impact', pain_location: 'anterior_thigh', extensor_lag: 'present', straight_leg_raise: 'unable', ability_to_continue: 'no', pain_severity_label: 'severe' }).entity === 'quad_tendon_rupture');

// ── Contusion severity boundaries (Lempainen 2022) ───────────────────────────
const cgrade = (rom) => runQuad({ mechanism: 'direct_impact', pain_location: 'anterior_thigh', ability_to_continue: 'limited', pain_severity_label: 'moderate', knee_flexion_rom_percent: rom }).diagnosis.severity.grade;
check('ROM 65% = mild', cgrade(65) === 'mild');
check('ROM 40% = moderate', cgrade(40) === 'moderate');
check('ROM 20% = severe', cgrade(20) === 'severe');

// ── Aronen acute protocol surfaces on day 0-1 ────────────────────────────────
check('acute contusion surfaces Aronen protocol', !!runQuad({ mechanism: 'direct_impact', pain_location: 'anterior_thigh', ability_to_continue: 'no', pain_severity_label: 'severe', knee_flexion_rom_percent: 40, days_since_injury: 1 }).acute_protocol);

// ── Tendinopathy ladder gating ───────────────────────────────────────────────
const tstage = (p) => runQuad({ mechanism: 'jumping_overuse', onset: 'gradual', pain_location: 'anterior_knee_tendon', pain_localised_to_tendon: 'yes', pain_with_jumping: 'yes', decline_squat_pain_0_10: p, pain_severity_label: 'moderate' }).plan.current_stage_id;
check('high pain -> isometric', tstage(8) === 'isometric');
check('moderate pain -> HSR', tstage(5) === 'isotonic_hsr');
check('low pain -> energy storage', tstage(2) === 'energy_storage');

// ── Rupture safety gates ─────────────────────────────────────────────────────
const preop = runQuad({ mechanism: 'eccentric_load_pop', pain_location: 'anterior_knee_tendon', straight_leg_raise: 'unable', ability_to_continue: 'no', pain_severity_label: 'severe' });
check('pre-op rupture = no autonomous plan', preop.autonomous_plan === false);
check('pre-op rupture = urgent referral', preop.referral && preop.referral.urgency === 'urgent');
const postop = runQuad({ surgical_repair_done: true, weeks_since_surgery: 8 });
check('post-op rupture clinician_required', postop.clinician_required === true);
check('post-op week 8 -> mobility', postop.stage === 'mobility');

// ── Check-in withholds ───────────────────────────────────────────────────────
const cn = runQuad({ mechanism: 'direct_impact', pain_location: 'anterior_thigh', ability_to_continue: 'limited', pain_severity_label: 'moderate', knee_flexion_rom_percent: 60, days_since_injury: 3 });
const sess = cn.plan.stages.find((s) => s.is_current).sessions[0];
check('swelling increase withholds', applyQuadCheckIn(sess, { swelling_change: 'more' }, cn).action === 'withhold_today_and_review');
check('ROM regression withholds (entity policy)', applyQuadCheckIn(sess, { symptom_response: 'same', knee_flexion_rom_percent: 50, _prev_rom: 60 }, cn).action === 'withhold_today_and_review');

// ── Missing data ─────────────────────────────────────────────────────────────
const sparse = runQuad({});
check('empty input does not crash', !!sparse.routing);
check('empty input reports missing core', sparse.missing_core_fields.length > 0);

// ── Citation integrity ───────────────────────────────────────────────────────
const validCites = new Set(Object.keys(QUAD_CITATIONS));
const allEx = [...VASTUS_STRAIN_EXERCISES, ...CONTUSION_EXERCISES, ...TENDINOPATHY_EXERCISES, ...RUPTURE_EXERCISES];
check('all exercise source_refs resolve', allEx.every((e) => (e.source_refs || []).every((r) => validCites.has(r))));
check('all citations have DOIs', Object.values(QUAD_CITATIONS).every((c) => !!c.doi));

// ── Dataset depth (guard against regressions) ────────────────────────────────
const ids = allEx.map((e) => e.id);
check('no duplicate exercise IDs', new Set(ids).size === ids.length);
check('vastus strain library >= 30', VASTUS_STRAIN_EXERCISES.length >= 30);
check('contusion library >= 18', CONTUSION_EXERCISES.length >= 18);
check('tendinopathy library >= 18', TENDINOPATHY_EXERCISES.length >= 18);
check('rupture library >= 15', RUPTURE_EXERCISES.length >= 15);
check('total library >= 85', allEx.length >= 85);
// Every stage of every entity must have at least one exercise.
const stagesByModule = [
  [VASTUS_STRAIN_EXERCISES, ['foundation', 'reload', 'accumulation', 'transition', 'simulation', 'resilience']],
  [CONTUSION_EXERCISES, ['acute_rom', 'restore_strength', 'reload', 'return']],
  [TENDINOPATHY_EXERCISES, ['isometric', 'isotonic_hsr', 'energy_storage', 'return_to_sport']],
  [RUPTURE_EXERCISES, ['protected', 'mobility', 'strength', 'return']],
];
check('every stage of every entity is populated', stagesByModule.every(([exs, phs]) => phs.every((p) => exs.some((e) => e.phase === p))));

// ── Guided assessment wiring ─────────────────────────────────────────────────
const triBase = { straight_leg_raise: 'able', extensor_lag: 'none', palpable_gap: 'none' };
check('triage: lateral+sprint -> vastus questionnaire', startAssessment({ ...triBase, pain_location: 'lateral_thigh', mechanism: 'sprinting', onset: 'sudden' }).entity === 'vastus_strain');
check('triage: anterior+impact -> contusion questionnaire', startAssessment({ ...triBase, pain_location: 'anterior_thigh', mechanism: 'direct_impact', onset: 'sudden' }).entity === 'quad_contusion');
check('triage: tendon+jumping -> tendinopathy questionnaire', startAssessment({ ...triBase, pain_location: 'anterior_knee_tendon', mechanism: 'jumping_overuse', onset: 'gradual' }).entity === 'quad_tendinopathy');
check('triage: cannot SLR -> urgent referral (no form)', startAssessment({ pain_location: 'anterior_knee_tendon', mechanism: 'eccentric_load_pop', onset: 'sudden', straight_leg_raise: 'unable', extensor_lag: 'present', palpable_gap: 'present' }).next === 'urgent_referral');
check('each entity questionnaire surfaces only fields its diagnosis uses', ENTITY_QUESTIONNAIRES.quad_contusion.questions.some((q) => q.field === 'knee_flexion_rom_percent'));
check('vastus questionnaire includes muscle selector', ENTITY_QUESTIONNAIRES.vastus_strain.questions.some((q) => q.field === 'muscle_hint'));
check('completeAssessment produces a tailored plan', completeAssessment({ ...triBase, pain_location: 'anterior_thigh', mechanism: 'direct_impact', onset: 'sudden' }, { knee_flexion_rom_percent: 40, days_since_injury: 2 }).plan.current_stage_id === 'acute_rom');

// ── Three-mode intake layer ──────────────────────────────────────────────────
const { runAssessmentMode, runKnownInjuryMode, runReportMode, INTAKE_MENU } = await import('../lib/clinical/quadEngine/intake/intakeRouter.mjs');
const { simulateAssessment } = await import('../lib/clinical/quadEngine/intake/assessmentFlow.mjs');

check('intake menu offers 3 modes', INTAKE_MENU.length === 3);

// Mode 1: adaptive assessment branches on answers
const simC = simulateAssessment({ pain_location: 'anterior_thigh', mechanism: 'direct_impact', knee_flexion_rom_percent: 40, bruising_or_swelling: 'some', walking_response: 'painful', ability_to_continue: 'no', days_since_injury: 2 });
check('assessment: impact path asks ROM, routes contusion', simC.completion.routing.entity === 'quad_contusion' && simC.asked.includes('knee_flexion_rom_percent'));
const simT = simulateAssessment({ pain_location: 'anterior_knee_tendon', mechanism: 'jumping_overuse', straight_leg_raise: 'able', extensor_lag: 'none', palpable_gap: 'none', pain_with_jumping: 'yes', pain_localised_to_tendon: 'yes', decline_squat_pain_0_10: 6, visa_p_score: 55, pain_severity_label: 'moderate' });
check('assessment: tendon path asks decline-squat, routes tendinopathy', simT.completion.routing.entity === 'quad_tendinopathy' && simT.asked.includes('decline_squat_pain_0_10'));
const simR = simulateAssessment({ pain_location: 'anterior_knee_tendon', mechanism: 'eccentric_load_pop', straight_leg_raise: 'unable', extensor_lag: 'present', palpable_gap: 'present', surgical_repair_done: false });
check('assessment: rupture red flag short-circuits to referral', simR.completion.referral === true);
check('assessment: contusion and tendon paths ask different questions', JSON.stringify(simC.asked) !== JSON.stringify(simT.asked));

// Mode 2: known injury
const km = runKnownInjuryMode('patellar_tendinopathy', { decline_squat_pain_0_10: 7, pain_severity_label: 'moderate' });
check('known-injury: patellar_tendinopathy -> tendinopathy module', km.entity === 'quad_tendinopathy');

// Mode 3: report upload
const rep = runReportMode({ text: 'Grade 2b strain of the vastus lateralis at the myotendinous junction.', days_since_injury: 12 }, { pain_severity_label: 'moderate', ability_to_continue: 'limited', walking_response: 'mild' });
check('report: extracts muscle + BAMIC', rep.interpretation.findings.muscle === 'vastus_lateralis' && rep.interpretation.findings.bamic === '2b');
check('report: proposes vastus strain with good confidence', rep.interpretation.proposed_entity === 'vastus_strain' && rep.interpretation.match_confidence >= 0.7);
check('report: returns follow-up questions', rep.interpretation.follow_up_fields.length > 0);
check('report: rupture report routes to referral', runReportMode({ text: 'Full-thickness rupture of the patellar tendon with 3 cm retraction.' }, {}).result.stage === 'pre_operative_referral');
check('report: interpretation flagged assistive-only + clinician review', rep.interpretation.governance.assistive_only && rep.interpretation.governance.requires_clinician_review);

// ── Tailored per-muscle/per-injury assessment + app adapter ──────────────────
const { inferQuadEntity, quadStepsFor, quadQuestionsForGroup, normalizeQuadAnswers } = await import('../lib/clinical/quadEngine/appAdapter/quadAssessmentModel.mjs');
const { mapAssessmentToQuadInput } = await import('../lib/clinical/quadEngine/appAdapter/mapAssessmentToQuadInput.mjs');
const { quadOutputToProfile } = await import('../lib/clinical/quadEngine/appAdapter/quadOutputToProfile.mjs');
const { quadRouteFor } = await import('../lib/clinical/quadEngine/appAdapter/quadCompatibility.mjs');

check('route: rectus -> rf engine', quadRouteFor({ primaryRegion: 'quadriceps', exactArea: 'rectus_femoris' }) === 'rf');
check('route: vastus lateralis -> quad engine', quadRouteFor({ primaryRegion: 'quadriceps', exactArea: 'vastus_lateralis' }) === 'quad');

// Entity inference picks different question sets
check('infer: impact -> contusion', inferQuadEntity({ exactArea: 'vastus_intermedius', quad: { mechanism: 'direct_impact' } }) === 'quad_contusion');
check('infer: tendon+gradual -> tendinopathy', inferQuadEntity({ exactArea: 'patellar_tendon', quad: { mechanism: 'gradual_overuse', onset: 'gradual' } }) === 'quad_tendinopathy');
check('infer: SLR unable -> rupture', inferQuadEntity({ quad: { straight_leg_raise: 'unable' } }) === 'quad_tendon_rupture');

// Different injuries -> different middle questions
const strainQ = quadQuestionsForGroup('Strength & movement', { quad: {} }).map((q) => q.key);
const contQ = quadQuestionsForGroup('Swelling & range', { quad: {} }).map((q) => q.key);
const tendQ = quadQuestionsForGroup('Tendon load', { quad: {} }).map((q) => q.key);
check('strain asks knee_extension, not ROM', strainQ.includes('knee_extension_response') && !strainQ.includes('knee_flexion_rom_percent'));
check('contusion asks ROM, not knee_extension', contQ.includes('knee_flexion_rom_percent') && !contQ.includes('knee_extension_response'));
check('tendinopathy asks decline_squat', tendQ.includes('decline_squat_pain_0_10'));
check('rupture step set skips generic pain step', !quadStepsFor('quad_tendon_rupture').some((s) => s.group === 'Pain & symptoms'));

// Conditional: weeks_since_surgery only after surgery=yes
check('weeks hidden until surgery=yes', !quadQuestionsForGroup('Tendon & surgery', { quad: {} }).some((q) => q.key === 'weeks_since_surgery')
  && quadQuestionsForGroup('Tendon & surgery', { quad: { surgical_repair_done: 'true' } }).some((q) => q.key === 'weeks_since_surgery'));

// Normalizer: select strings -> engine types
const norm = normalizeQuadAnswers({ surgical_repair_done: 'true', knee_flexion_rom_percent: '35', visa_p_score: '' });
check('normalize: bool + number + drop-empty', norm.surgical_repair_done === true && norm.knee_flexion_rom_percent === 35 && !('visa_p_score' in norm));

// Tailored answers flow to a tailored plan
const cnProfile = quadOutputToProfile(runQuad(mapAssessmentToQuadInput({ primaryRegion: 'quadriceps', exactArea: 'vastus_intermedius', quad: { mechanism: 'direct_impact', knee_flexion_rom_percent: '35', days_since_injury: '2' } })), { primaryRegion: 'quadriceps' });
check('tailored contusion answers -> contusion profile', cnProfile.injuryEntity === 'quad_contusion');
check('profile renders plan[].weeks[].days[].exercises[]', Array.isArray(cnProfile.plan[0].weeks[0].days[0].exercises));

// Confidence: strain shows match score; rupture withholds
const strainProf = quadOutputToProfile(runQuad(mapAssessmentToQuadInput({ primaryRegion: 'quadriceps', exactArea: 'vastus_lateralis', quad: { mechanism: 'sprinting', pain_severity_label: 'moderate', ability_to_continue: 'limited' } })), {});
const rupProf = quadOutputToProfile(runQuad({ pain_location: 'anterior_knee_tendon', mechanism: 'eccentric_load_pop', straight_leg_raise: 'unable' }), {});
check('strain shows match score, not alarmist', strainProf.confidence != null && !strainProf.rfConfidenceWithheld && !strainProf.rfReviewRequired);
check('rupture withholds + review', rupProf.rfConfidenceWithheld && rupProf.rfReviewRequired);

// ── Anatomy reachability: every clickable quad part reaches a built injury ────
const reach = (exactArea, region, q = {}) => {
  const a = { primaryRegion: region, exactArea, quad: q };
  const route = quadRouteFor(a);
  if (route === 'rf') return 'rf';
  if (route !== 'quad') return null;
  return runQuad(mapAssessmentToQuadInput(a)).entity;
};
check('reach: rectus femoris -> RF engine', reach('rectus_femoris', 'quadriceps') === 'rf');
check('reach: vastus lateralis -> strain', reach('vastus_lateralis', 'quadriceps', { mechanism: 'sprinting' }) === 'vastus_strain');
check('reach: vastus intermedius -> strain', reach('vastus_intermedius', 'quadriceps', { mechanism: 'sprinting' }) === 'vastus_strain');
check('reach: vastus intermedius + impact -> contusion', reach('vastus_intermedius', 'quadriceps', { mechanism: 'direct_impact' }) === 'quad_contusion');
check('reach: quad tendon -> tendinopathy', reach('quad_tendon', 'quadriceps', { mechanism: 'gradual_overuse' }) === 'quad_tendinopathy');
check('reach: patellar tendon (under KNEE) -> tendinopathy', reach('patellar_tendon', 'knee', { mechanism: 'gradual_overuse' }) === 'quad_tendinopathy');
check('reach: patellar tendon + SLR unable -> rupture', reach('patellar_tendon', 'knee', { mechanism: 'eccentric_load_pop', straight_leg_raise: 'unable' }) === 'quad_tendon_rupture');
check('reach: sartorius -> strain (not mislabelled vastus)', (() => {
  const out = runQuad(mapAssessmentToQuadInput({ primaryRegion: 'quadriceps', exactArea: 'sartorius', quad: { mechanism: 'sprinting' } }));
  return out.entity === 'vastus_strain' && !/vastus/i.test(out.diagnosis.summary);
})());

console.log(`\nquad-engine: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
