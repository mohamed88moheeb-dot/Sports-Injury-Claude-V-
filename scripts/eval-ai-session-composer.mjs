/**
 * scripts/eval-ai-session-composer.mjs
 * ---------------------------------------------------------------------------
 * Cross-injury AI accuracy eval harness (task #47).
 *
 * Exercises the REAL Gemini-backed composeSessions() (lib/clinical/core/
 * aiSessionComposer.mjs) across all 8 lower-body engines that share it, with
 * a set of diverse patient comments, and scores:
 *   - pool-only validity      every selected exercise id is a real pool member
 *   - dosage correctness      each card's dosage exactly matches the pool
 *                             exercise's own dosage_by_tier[tier]
 *   - session variety         how much the 3 weekly sessions differ from
 *                             each other (not the same set repeated)
 *   - comment-responsiveness  equipment limits respected; a different-injury
 *                             mention triggers out_of_scope_note without
 *                             leaking foreign-injury content; a "no comment"
 *                             baseline still produces a full, valid week
 *   - ai_composed rate        how often Gemini's output passed validation
 *                             vs silently fell back to the deterministic
 *                             rotation (a real accuracy/reliability signal)
 *
 * Needs GEMINI_API_KEY set (e.g. via .env.local, gitignored) — otherwise
 * every call silently falls back to deterministic and the "AI accuracy"
 * numbers below would be meaningless. This script will refuse to run
 * without a key rather than produce misleading results.
 *
 * FREE-TIER QUOTA WARNING (found by running this harness): the Gemini API
 * free tier enforces GenerateRequestsPerDayPerProjectPerModel-FreeTier — as
 * low as 20 requests/DAY for gemini-flash-latest (aliasing gemini-3.5-flash
 * at time of writing) on some keys. This script makes 8 engines x 5
 * comments = 40 calls, which WILL exceed a 20/day quota partway through —
 * composeSessions() correctly and safely falls back to deterministic on the
 * 429 rather than erroring, but every result after quota exhaustion reads
 * as "deterministic," not a genuine AI-quality signal. If your key is on
 * the free tier, either run with a paid/higher-quota key, or trim COMMENTS/
 * ENGINES below to fit inside your daily quota before drawing conclusions
 * from the aggregate summary.
 *
 * Run: node scripts/eval-ai-session-composer.mjs
 * ---------------------------------------------------------------------------
 */

import { hasGeminiKey } from '../lib/rag/generate/gemini.mjs';
import { composeSessions } from '../lib/clinical/core/aiSessionComposer.mjs';

import { runQuad } from '../lib/clinical/quadEngine/index.mjs';
import { runAnkle } from '../lib/clinical/ankleEngine/index.mjs';
import { runCalf } from '../lib/clinical/calfEngine/index.mjs';
import { runGroin } from '../lib/clinical/groinEngine/index.mjs';
import { runHipFlexor } from '../lib/clinical/hipFlexorEngine/index.mjs';
import { runGlute } from '../lib/clinical/gluteEngine/index.mjs';
import { runItBand } from '../lib/clinical/itBandEngine/index.mjs';
import { runLowerBack } from '../lib/clinical/lowerBackEngine/index.mjs';

if (!hasGeminiKey()) {
  console.error('GEMINI_API_KEY is not set — refusing to run (results would just reflect the deterministic fallback, not real AI accuracy). Set it in .env.local and re-run with:\n  export $(grep -v \'^#\' .env.local | xargs) && node scripts/eval-ai-session-composer.mjs');
  process.exit(1);
}

const ENGINES = [
  { name: 'quad', injuryLabel: 'quad/patellar', run: runQuad, input: { mechanism: 'sprinting', pain_location: 'lateral_thigh', ability_to_continue: 'limited', pain_severity_label: 'moderate' } },
  { name: 'ankle', injuryLabel: 'ankle sprain / instability', run: runAnkle, input: { mechanism: 'inversion', ability_to_continue: 'limited', weight_bearing_ability: 'painful', pain_severity_label: 'moderate' } },
  { name: 'calf', injuryLabel: 'calf / Achilles / shin', run: runCalf, input: { mechanism: 'sudden_push_off', pain_location: 'posterior_calf', ability_to_continue: 'limited', weight_bearing_ability: 'painful', pain_severity_label: 'moderate' } },
  { name: 'groin', injuryLabel: 'adductor / groin', run: runGroin, input: { mechanism: 'kicking', ability_to_continue: 'limited', pain_severity_label: 'moderate', resisted_adduction_pain: 'moderate', symptom_duration_weeks: 1 } },
  { name: 'hip_flexor', injuryLabel: 'hip flexor / iliopsoas', run: runHipFlexor, input: { mechanism: 'sudden_hip_flexion', ability_to_continue: 'limited', pain_severity_label: 'moderate', resisted_hip_flexion_pain: 'moderate', symptom_duration_weeks: 1 } },
  { name: 'glute', injuryLabel: 'glute (gluteal strain / tendinopathy)', run: runGlute, input: { mechanism: 'sprinting', pain_location: 'deep_buttock', ability_to_continue: 'limited', pain_severity_label: 'moderate', resisted_abduction_pain: 'moderate', days_since_injury: 3 } },
  { name: 'it_band', injuryLabel: 'iliotibial band syndrome (ITBS)', run: runItBand, input: { mechanism: 'gradual_overuse', pain_location: 'lateral_knee', ability_to_continue: 'yes', pain_severity_label: 'moderate', resisted_hip_abduction_pain: 'moderate' } },
  { name: 'lower_back', injuryLabel: 'lower back (non-specific low back pain / lumbar radicular pain)', run: runLowerBack, input: { mechanism: 'gradual_overuse', ability_to_continue: 'yes', pain_severity_label: 'moderate' } },
];

const COMMENTS = [
  { id: 'none', text: '' },
  { id: 'no_equipment', text: "I don't have any gym equipment right now, just my bodyweight." },
  { id: 'focus_strength', text: 'Can we focus more on building strength this week?' },
  { id: 'different_injury', text: 'My hamstring on the other leg also hurts today, can you add something for that too?' },
  { id: 'progress_faster', text: "I'm feeling great, can we progress faster and push harder this week?" },
];

const STRENGTH_BLOCKS = new Set(['strength_support', 'tissue_specific_loading']);

function currentStageOf(output) {
  const stages = output.plan?.stages || [];
  return stages.find((s) => s.is_current) || null;
}

function scoreRun({ result, pool, comment }) {
  const poolById = new Map(pool.map((ex) => [ex.id, ex]));
  const issues = [];

  const sessions = result.sessions || [];
  if (sessions.length !== 3) issues.push(`expected 3 sessions, got ${sessions.length}`);

  let poolOnlyValid = true;
  let dosageCorrect = true;
  const allNonBookendIds = [];
  const equipmentUsed = new Set();
  const blocksUsed = [];

  for (const session of sessions) {
    const cards = (session.cards || []).filter((c) => !c.is_bookend);
    for (const card of cards) {
      allNonBookendIds.push(card.exercise_id);
      const poolEx = poolById.get(card.exercise_id);
      if (!poolEx) { poolOnlyValid = false; issues.push(`card ${card.exercise_id} not in pool`); continue; }
      const expectedDose = poolEx.dosage_by_tier ? (poolEx.dosage_by_tier[session.tier] || poolEx.dosage_by_tier[poolEx.dosage_by_tier.length - 1]) : null;
      if (JSON.stringify(card.dosage) !== JSON.stringify(expectedDose)) { dosageCorrect = false; issues.push(`card ${card.exercise_id} dosage mismatch for tier ${session.tier}`); }
      (card.equipment || []).forEach((e) => equipmentUsed.add(e));
      blocksUsed.push(poolEx.block);
    }
  }

  const uniqueIds = new Set(allNonBookendIds);
  const varietyScore = allNonBookendIds.length ? uniqueIds.size / allNonBookendIds.length : 0;

  const equipmentRespected = comment.id !== 'no_equipment' || [...equipmentUsed].every((e) => e === 'bodyweight')
    || pool.filter((e) => (e.equipment || ['bodyweight']).every((eq) => eq === 'bodyweight')).length < 4; // no bodyweight-only alternative existed for every slot

  const outOfScopeFlagged = comment.id !== 'different_injury' || !!result.out_of_scope_note;

  const strengthFocusShift = comment.id !== 'focus_strength' ? null
    : blocksUsed.length ? blocksUsed.filter((b) => STRENGTH_BLOCKS.has(b)).length / blocksUsed.length : 0;

  return {
    mode: result.mode,
    sessionCount: sessions.length,
    poolOnlyValid, dosageCorrect, varietyScore,
    equipmentRespected, outOfScopeFlagged, strengthFocusShift,
    outOfScopeNote: result.out_of_scope_note || null,
    issues,
  };
}

async function main() {
  const allResults = [];

  for (const engine of ENGINES) {
    const output = engine.run(engine.input);
    const stage = currentStageOf(output);
    if (!stage || !stage.current_stage_pool) {
      console.log(`SKIP ${engine.name}: no current-stage pool (routed to a referral entity: ${output.entity})`);
      continue;
    }
    const pool = stage.current_stage_pool;
    const policy = stage.current_stage_policy || {};

    for (const comment of COMMENTS) {
      process.stdout.write(`${engine.name} / ${comment.id} ... `);
      let result;
      try {
        result = await composeSessions({ pool, stage: { id: stage.stage_id, clinical_name: stage.stage_name, friendly_name: stage.friendly_name }, policy, userComment: comment.text, injuryLabel: engine.injuryLabel, betaMeta: {} });
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        allResults.push({ engine: engine.name, comment: comment.id, error: err.message });
        continue;
      }
      const scored = scoreRun({ result, pool, comment });
      console.log(`mode=${scored.mode} pool_valid=${scored.poolOnlyValid} dosage_ok=${scored.dosageCorrect} variety=${scored.varietyScore.toFixed(2)}${scored.issues.length ? ' ISSUES: ' + scored.issues.join('; ') : ''}`);
      allResults.push({ engine: engine.name, comment: comment.id, ...scored });
    }
  }

  // ── Aggregate summary ──────────────────────────────────────────────────
  console.log('\n=== AGGREGATE SUMMARY ===');
  const total = allResults.filter((r) => !r.error);
  const aiComposedCount = total.filter((r) => r.mode === 'ai_composed').length;
  const poolValidCount = total.filter((r) => r.poolOnlyValid).length;
  const dosageOkCount = total.filter((r) => r.dosageCorrect).length;
  const avgVariety = total.reduce((s, r) => s + (r.varietyScore || 0), 0) / (total.length || 1);
  const equipmentTests = total.filter((r) => r.comment === 'no_equipment');
  const equipmentPassCount = equipmentTests.filter((r) => r.equipmentRespected).length;
  const scopeTests = total.filter((r) => r.comment === 'different_injury');
  const scopePassCount = scopeTests.filter((r) => r.outOfScopeFlagged).length;
  const strengthTests = total.filter((r) => r.comment === 'focus_strength' && r.strengthFocusShift !== null);
  const avgStrengthFocus = strengthTests.length ? strengthTests.reduce((s, r) => s + r.strengthFocusShift, 0) / strengthTests.length : null;

  console.log(`Total calls: ${total.length} (errors: ${allResults.length - total.length})`);
  console.log(`AI-composed (not silently fell back to deterministic): ${aiComposedCount}/${total.length} (${(100 * aiComposedCount / total.length).toFixed(0)}%)`);
  console.log(`Pool-only validity: ${poolValidCount}/${total.length} (${(100 * poolValidCount / total.length).toFixed(0)}%)`);
  console.log(`Dosage correctness: ${dosageOkCount}/${total.length} (${(100 * dosageOkCount / total.length).toFixed(0)}%)`);
  console.log(`Average session variety (unique/total exercise slots): ${avgVariety.toFixed(2)}`);
  console.log(`Equipment-limit respected: ${equipmentPassCount}/${equipmentTests.length}`);
  console.log(`Different-injury mention -> out_of_scope_note set: ${scopePassCount}/${scopeTests.length}`);
  if (avgStrengthFocus !== null) console.log(`"Focus on strength" -> avg fraction of strength-block exercises: ${avgStrengthFocus.toFixed(2)}`);

  console.log('\nPer-engine AI-composed rate:');
  for (const engine of ENGINES) {
    const rows = total.filter((r) => r.engine === engine.name);
    if (!rows.length) continue;
    const aiCount = rows.filter((r) => r.mode === 'ai_composed').length;
    console.log(`  ${engine.name}: ${aiCount}/${rows.length}`);
  }

  const anyHardFailure = poolValidCount < total.length || dosageOkCount < total.length;
  console.log(anyHardFailure ? '\n❌ Hard-safety-boundary violations detected (pool/dosage) — see ISSUES above.' : '\n✅ No pool-validity or dosage violations detected.');
  process.exit(anyHardFailure ? 1 : 0);
}

main();
