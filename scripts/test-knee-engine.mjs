/**
 * scripts/test-knee-engine.mjs — smoke + invariant tests for the knee engine.
 * Run: node scripts/test-knee-engine.mjs
 */
import { runKnee } from '../lib/clinical/kneeEngine/index.mjs';
import { KNEE_CITATIONS } from '../lib/clinical/kneeEngine/citations/kneeClinicalCitations.mjs';
import { KNEE_EXERCISES } from '../lib/clinical/kneeEngine/kneeExerciseBank.mjs';

let pass = 0, fail = 0;
const check = (n, c) => { if (c) pass++; else { fail++; console.log('❌ FAIL:', n); } };

// ── Routing by structure ─────────────────────────────────────────────────────
check('ACL structure routes', runKnee({ structure: 'acl', mechanism: 'pivot_noncontact', pain_severity_label: 'severe' }).entity === 'acl_injury');
check('PCL structure routes', runKnee({ structure: 'pcl', mechanism: 'dashboard_hyperflexion', pain_severity_label: 'moderate' }).entity === 'pcl_injury');
check('MCL structure routes', runKnee({ structure: 'mcl', mechanism: 'valgus_blow', pain_severity_label: 'moderate' }).entity === 'mcl_injury');
check('meniscus structure routes', runKnee({ structure: 'medial_meniscus', mechanism: 'twisting', pain_severity_label: 'moderate' }).entity === 'meniscus_tear');
check('PF joint routes to PFPS', runKnee({ structure: 'patellofemoral_joint', mechanism: 'gradual_overuse', pain_with_squat: 'yes', pain_severity_label: 'mild' }).entity === 'patellofemoral_pain');
check('tibial tubercle routes to OSD', runKnee({ structure: 'tibial_tubercle', age_group: 'adolescent', mechanism: 'gradual_overuse', pain_severity_label: 'mild' }).entity === 'osgood_schlatter');
check('ITB routes', runKnee({ structure: 'itb_lateral_knee', mechanism: 'gradual_overuse', pain_location: 'lateral', pain_severity_label: 'mild' }).entity === 'itb_syndrome');
check('patellar tendon hands off to quad engine', runKnee({ structure: 'patellar_tendon', pain_severity_label: 'mild' }).handoff?.engine === 'quad_engine');

// ── Mechanism-driven routing when structure unsure ───────────────────────────
check('pivot+pop -> ACL', runKnee({ structure: 'knee_general', mechanism: 'pivot_noncontact', pop_at_injury: 'yes', pain_severity_label: 'severe' }).entity === 'acl_injury');
check('older adult + brief stiffness -> OA', runKnee({ structure: 'knee_general', mechanism: 'gradual_overuse', age_group: 'older_adult', morning_stiffness_minutes: 20, pain_with_squat: 'yes', pain_severity_label: 'moderate' }).entity === 'knee_osteoarthritis');

// ── Red flags / referrals ────────────────────────────────────────────────────
const locked = runKnee({ structure: 'medial_meniscus', mechanism: 'twisting', locking_or_block: 'yes', pain_severity_label: 'severe' });
check('locked knee -> referral, no autonomous plan', locked.autonomous_plan === false && locked.referral?.urgency === 'urgent');
const plc = runKnee({ structure: 'lcl', mechanism: 'varus_blow', laxity_grade: 2, pain_severity_label: 'severe' });
check('high-grade LCL/PLC -> urgent referral', plc.autonomous_plan === false && plc.clinician_required === true);
const recur = runKnee({ structure: 'patellofemoral_joint', recurrent_dislocation: 'yes', pain_severity_label: 'moderate' });
check('recurrent dislocation -> clinician referral + still has plan', recur.entity === 'patellar_instability' && recur.referral?.clinician_required === true);

// ── ACL: rehab is a legitimate primary pathway (no auto-surgery) ─────────────
const acl = runKnee({ structure: 'acl', mechanism: 'pivot_noncontact', pain_severity_label: 'moderate', days_since_injury: 30 });
check('ACL non-urgent -> autonomous rehab plan', acl.autonomous_plan === true && acl.plan.stages.length > 0);
check('ACL plan includes RTS criteria battery', JSON.stringify(acl.plan).includes('Return-to-sport criteria battery'));

// ── Post-op staging ──────────────────────────────────────────────────────────
check('ACL post-op wk3 -> activate stage', runKnee({ structure: 'acl', surgical_repair_done: true, weeks_since_surgery: 3, pain_severity_label: 'mild' }).plan.current_stage_id === 'activate');
check('ACL post-op wk20 -> dynamic stage', runKnee({ structure: 'acl', surgical_repair_done: true, weeks_since_surgery: 20, pain_severity_label: 'mild' }).plan.current_stage_id === 'dynamic');

// ── Plan shape + content ─────────────────────────────────────────────────────
const pfps = runKnee({ structure: 'patellofemoral_joint', mechanism: 'gradual_overuse', pain_with_squat: 'yes', pain_severity_label: 'mild' });
check('PFPS plan has hip strengthening (key driver)', JSON.stringify(pfps.plan).toLowerCase().includes('hip abductor'));
check('every plan card has dosage_status beta label', pfps.plan.stages.flatMap(s => s.sessions.flatMap(x => x.cards)).every(c => c.dosage_status === 'beta_default_requires_review'));

// ── Missing data does not crash ──────────────────────────────────────────────
check('empty input returns routing', !!runKnee({}).routing);

// ── Citation integrity ───────────────────────────────────────────────────────
const valid = new Set(Object.keys(KNEE_CITATIONS));
const allEx = Object.values(KNEE_EXERCISES).flat();
check('all exercise source_refs resolve', allEx.every(e => (e.source_refs || []).every(r => valid.has(r))));
check('all citations have DOIs', Object.values(KNEE_CITATIONS).every(c => !!c.doi));
check('entity coverage >= 10', Object.keys(KNEE_EXERCISES).length >= 10);
check('exercise library >= 45', allEx.length >= 45);

console.log(`\nknee-engine: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
