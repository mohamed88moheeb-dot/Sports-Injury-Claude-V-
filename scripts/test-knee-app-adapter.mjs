/**
 * scripts/test-knee-app-adapter.mjs
 * ---------------------------------------------------------------------------
 * Smoke tests for the knee engine's app-integration layer (new — added to
 * wire the knee engine into the live app the way RF/quad already are):
 *   - kneeCompatibility.kneeRouteFor (region routing, tendon carve-out)
 *   - mapAssessmentToKneeInput (legacy assessment -> engine input)
 *   - kneeOutputToProfile (engine output -> existing profile shape)
 *   - kneeAssessmentModel (tailored questionnaire: entity inference, steps,
 *     form-fill, question filtering)
 *
 * The core engine itself (runKnee routing/referrals/plan shape) is already
 * covered by scripts/test-knee-engine.mjs. Run: node scripts/test-knee-app-adapter.mjs
 * ---------------------------------------------------------------------------
 */

import { runKnee } from '../lib/clinical/kneeEngine/index.mjs';
import { KNEE_ENTITIES } from '../lib/clinical/kneeEngine/types.mjs';
import { mapAssessmentToKneeInput } from '../lib/clinical/kneeEngine/appAdapter/mapAssessmentToKneeInput.mjs';
import { kneeOutputToProfile } from '../lib/clinical/kneeEngine/appAdapter/kneeOutputToProfile.mjs';
import { kneeRouteFor, isKneeEngineInjury } from '../lib/clinical/kneeEngine/appAdapter/kneeCompatibility.mjs';
import { quadRouteFor } from '../lib/clinical/quadEngine/appAdapter/quadCompatibility.mjs';
import { inferKneeEntity, kneeStepsFor, computeKneeFormFill, kneeQuestionsForGroup, normalizeKneeAnswers } from '../lib/clinical/kneeEngine/appAdapter/kneeAssessmentModel.mjs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('❌ FAIL:', name); } };

// ── Compatibility routing: knee only claims what quad doesn't ──────────────
check('quadriceps region is not claimed by knee', kneeRouteFor({ primaryRegion: 'quadriceps' }) === null);
check('hamstring region is not claimed by knee', kneeRouteFor({ primaryRegion: 'hamstring' }) === null);
check('knee region is claimed by knee', kneeRouteFor({ primaryRegion: 'knee' }) === 'knee');
check('isKneeEngineInjury matches kneeRouteFor', isKneeEngineInjury({ primaryRegion: 'knee' }) === true);
check('patellar tendon exactArea is claimed by quad regardless of region', quadRouteFor({ primaryRegion: 'knee', exactArea: 'patellar_tendon' }) === 'quad');

// ── appAdapter round trip: legacy generic form -> engine -> profile ────────
const legacyAssessment = {
  primaryRegion: 'knee', exactArea: 'front_knee', mechanism: 'Sudden twisting/cutting',
  painRest: 3, painWalking: 5, painSport: 8, daysSince: 2, symptoms: ['Swelling', 'Locking or catching'],
  sports: ['Football/Soccer'], equipment: ['Bodyweight only'], redFlags: [],
};
const kneeInput = mapAssessmentToKneeInput(legacyAssessment);
check('mapAssessmentToKneeInput produces a valid engine input', typeof kneeInput === 'object' && !!kneeInput.mechanism);
check('mapAssessmentToKneeInput infers locking from symptoms text', kneeInput.locking_or_block === 'yes');
const kneeOutput = runKnee(kneeInput);
check('runKnee accepts the mapped input without throwing', !!kneeOutput.entity);
const profile = kneeOutputToProfile(kneeOutput, legacyAssessment);
check('kneeOutputToProfile marks isRfBeta for shared page compatibility', profile.isRfBeta === true);
check('kneeOutputToProfile marks isKneeBeta additively', profile.isKneeBeta === true);
check('profile has a plan array (empty for referral, populated otherwise)', Array.isArray(profile.plan));
check('profile.rf compatibility object is populated with engine=knee', profile.rf && profile.rf.engine === 'knee');
check('profile.regionName is Knee', profile.regionName === 'Knee');

// ── Referral case flows through to a review-gated profile, not a crash ─────
const referralInput = mapAssessmentToKneeInput({ primaryRegion: 'knee', symptoms: ['Locking or catching', 'Cannot straighten'], painSport: 8, painWalking: 6 });
const referralOutput = runKnee(referralInput);
const referralProfile = kneeOutputToProfile(referralOutput, { primaryRegion: 'knee' });
check('locked-knee pattern produces a review-gated profile', referralProfile.fullAutonomousPlan === false && !!referralProfile.rfReviewMessage);

// ── Handoff case (defensive — should be rare since quad claims tendons first) ─
const handoffOutput = runKnee({ structure: 'patellar_tendon', pain_severity_label: 'mild' });
const handoffProfile = kneeOutputToProfile(handoffOutput, { primaryRegion: 'knee' });
check('handoff output does not crash kneeOutputToProfile', handoffProfile.isKneeBeta === true && Array.isArray(handoffProfile.plan) && handoffProfile.plan.length === 0);

// ── Tailored questionnaire model ────────────────────────────────────────────
check('inferKneeEntity resolves explicit structure selection', inferKneeEntity({ knee: { structure: 'acl' } }) === 'acl_injury');
check('inferKneeEntity resolves recurrent dislocation override', inferKneeEntity({ knee: { recurrent_dislocation: 'yes' } }) === 'patellar_instability');
check('inferKneeEntity resolves locked-knee override', inferKneeEntity({ knee: { locking_or_block: 'yes' } }) === 'meniscus_tear');
check('inferKneeEntity resolves mechanism-driven ACL pattern', inferKneeEntity({ knee: { mechanism: 'pivot_noncontact' } }) === 'acl_injury');
check('inferKneeEntity resolves mechanism-driven OA pattern', inferKneeEntity({ knee: { mechanism: 'gradual_overuse', age_group: 'older_adult' } }) === 'knee_osteoarthritis');
check('inferKneeEntity falls back to PFPS', inferKneeEntity({ knee: {} }) === 'patellofemoral_pain');

for (const entity of Object.values(KNEE_ENTITIES)) {
  if (entity === KNEE_ENTITIES.EXTENSOR_TENDON) continue;
  const steps = kneeStepsFor(entity);
  check(`kneeStepsFor(${entity}) returns 4 steps`, steps.length === 4);
  check(`kneeStepsFor(${entity}) starts with Injury context`, steps[0].group === 'Injury context');
  check(`kneeStepsFor(${entity}) ends with Safety check`, steps[steps.length - 1].group === 'Safety check');
}

const mechSteps = kneeStepsFor('acl_injury');
check('mechanical entity gets Stability & mechanics', mechSteps.some((s) => s.group === 'Stability & mechanics'));
const loadSteps = kneeStepsFor('patellofemoral_pain');
check('load entity gets Load & pattern', loadSteps.some((s) => s.group === 'Load & pattern'));

const mechQuestions = kneeQuestionsForGroup('Stability & mechanics', { knee: { structure: 'acl' } });
check('kneeQuestionsForGroup returns only mechanical-family questions', mechQuestions.length > 0 && mechQuestions.every((q) => q.family === 'mechanical'));
const loadQuestions = kneeQuestionsForGroup('Load & pattern', { knee: { mechanism: 'gradual_overuse', age_group: 'older_adult' } });
check('kneeQuestionsForGroup returns only load-family questions', loadQuestions.length > 0 && loadQuestions.every((q) => q.family === 'load'));
const sharedQuestions = kneeQuestionsForGroup('Pain & symptoms', { knee: {} });
check('shared groups have no family restriction', sharedQuestions.length > 0 && sharedQuestions.every((q) => !q.family));

const conditionalHidden = kneeQuestionsForGroup('Safety check', { knee: { surgical_repair_done: 'false' } });
check('conditional weeks_since_surgery question hidden when no surgery', !conditionalHidden.some((q) => q.key === 'weeks_since_surgery'));
const conditionalShown = kneeQuestionsForGroup('Safety check', { knee: { surgical_repair_done: 'true' } });
check('conditional weeks_since_surgery question shown when surgery=true', conditionalShown.some((q) => q.key === 'weeks_since_surgery'));

const fillEmpty = computeKneeFormFill({ knee: {} });
check('computeKneeFormFill on empty answers is 0%', fillEmpty.percent === 0 && fillEmpty.allFilled === false);
const fillFull = computeKneeFormFill({ knee: { structure: 'acl', mechanism: 'pivot_noncontact', pain_severity_label: 'severe', ability_to_continue: 'no', weight_bearing: 'painful', giving_way: 'yes', locking_or_block: 'no' } });
check('computeKneeFormFill reaches 100% when all core fields answered', fillFull.percent === 100 && fillFull.allFilled === true);

const normalized = normalizeKneeAnswers({ surgical_repair_done: 'true', laxity_grade: '2', weeks_since_surgery: '' });
check('normalizeKneeAnswers coerces boolean strings', normalized.surgical_repair_done === true);
check('normalizeKneeAnswers coerces numeric strings', normalized.laxity_grade === 2);
check('normalizeKneeAnswers drops empty numeric fields', !('weeks_since_surgery' in normalized));

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nknee-app-adapter: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
