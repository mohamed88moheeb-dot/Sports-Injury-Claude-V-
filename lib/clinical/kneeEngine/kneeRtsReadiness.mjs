/**
 * lib/clinical/kneeEngine/kneeRtsReadiness.mjs
 * ---------------------------------------------------------------------------
 * Entity-aware return-to-sport readiness battery for the knee. RTS is a
 * criteria checklist, not a date — and for pivoting-knee injuries (ACL etc.)
 * the evidence is explicit: quadriceps strength LSI ≥90% AND hop-test symmetry
 * ≥90% AND psychological readiness, confirmed by a clinician. Never grants
 * clearance (clinical_authority: false).
 *
 * Sources (see kneeClinicalCitations / RESEARCH.md): KNEE-CIT-013, KNEE-CIT-014
 * (criteria-based RTS, LSI + hop battery); Filbay 2025 ACL rehab pathway.
 * ---------------------------------------------------------------------------
 */

const MET = 'met', PENDING = 'pending', CLINICIAN = 'clinician_test', NOT_APPLICABLE = 'n/a';

// Injuries that return to pivoting/cutting sport → require objective LSI + hop battery.
const PIVOTING = new Set(['acl_injury', 'pcl_injury', 'mcl_injury', 'lcl_plc_injury', 'meniscus_tear', 'patellar_instability']);
// Load-based problems → readiness is symptom-free sport-specific loading.
const LOAD_BASED = new Set(['patellofemoral_pain', 'knee_osteoarthritis', 'itb_syndrome', 'osgood_schlatter']);

const yesish = (v) => v === 'yes';

export function resolveKneeRts(input = {}, entity) {
  const criteria = [];
  const add = (id, name, state, detail) => criteria.push({ id, name, state, met: state === MET, detail });

  // 1. Joint stable — no giving way, no locking.
  const stable = !yesish(input.giving_way) && !yesish(input.locking_or_block);
  add('stability', 'Knee stable — no giving way or locking', stable ? MET : PENDING,
    stable ? 'No instability or locking reported.' : 'Instability or locking still present — needs assessment before return.');

  // 2. Full weight-bearing & range of motion.
  const wbOk = input.weight_bearing === 'full' || input.weight_bearing == null;
  add('rom_wb', 'Full pain-free weight-bearing & range', wbOk ? MET : PENDING,
    wbOk ? 'Bearing weight fully.' : 'Weight-bearing / range not yet fully restored.');

  // 3. Pain-free functional loading (squat / stairs / daily sport loads).
  const painFreeLoad = !yesish(input.pain_with_squat) && !yesish(input.pain_with_stairs)
    && ['mild', null, undefined].includes(input.pain_severity_label);
  add('functional_load', 'Pain-free with squats, stairs & daily loading', painFreeLoad ? MET : PENDING,
    painFreeLoad ? 'Tolerating functional loading without pain.' : 'Functional loading still provokes pain.');

  // 4. Objective capacity — entity-specific.
  if (PIVOTING.has(entity)) {
    add('objective_symmetry', 'Strength & hop symmetry ≥90% (clinician-tested)', CLINICIAN,
      'Requires clinician-measured quadriceps strength LSI ≥90% AND a 4-hop battery ≥90%. Do not return on hop symmetry alone — confirm quad strength.');
  } else if (LOAD_BASED.has(entity)) {
    add('sport_loading', 'Symptom-free with your sport’s key loads', PENDING,
      'Progress to your sport’s running / jumping / change-of-direction loads without a symptom flare (including next day).');
  }

  // 5. Psychological readiness.
  const conf = input.movement_confidence || (input.rf_self_tests && input.rf_self_tests.movement_confidence);
  const confV = Number(input.movement_confidence_value);
  const psychReady = conf ? ['confident', 'ready', 'yes'].includes(conf) : (Number.isFinite(confV) ? confV >= 70 : null);
  add('psychological', 'Confident and ready to return', psychReady === true ? MET : PENDING,
    psychReady === true ? 'Reports feeling ready to return.' : 'Confidence/readiness not yet confirmed.');

  const applicable = criteria.filter((c) => c.state !== NOT_APPLICABLE);
  const met = applicable.filter((c) => c.state === MET).length;
  const total = applicable.length;
  const allMet = met === total && total > 0;

  const considerations = [];
  if (PIVOTING.has(entity)) considerations.push('Pivoting-sport return is criteria-based — objective strength + hop-symmetry testing and clinician clearance are required, not time alone.');
  if (entity === 'acl_injury' && (input.age_group === 'adolescent' || input.activity_level === 'pivoting_sport'))
    considerations.push('Younger pivoting athletes have a higher re-injury rate — stricter criteria and a longer timeline are advised.');
  if (input.recurrent_dislocation === 'yes') considerations.push('Recurrent instability — discuss whether surgical stabilisation is indicated before full return.');

  let clearance_note = 'This is a readiness guide, not clearance. Return to sport must be confirmed by a qualified clinician using objective strength and hop-symmetry testing (≥90% limb symmetry index).';
  if (considerations.length) clearance_note += ' ' + considerations.join(' ');

  return {
    criteria, met, total, all_criteria_met: allMet,
    status: allMet ? 'criteria_suggest_ready' : 'not_yet_met',
    headline: allMet
      ? 'All self-reported criteria are met — confirm objective testing and clearance with a clinician.'
      : `${met} of ${total} return-to-sport criteria met. Keep progressing the pending items.`,
    considerations, clearance_note, clinical_authority: false,
  };
}
