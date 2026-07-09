/**
 * scripts/test-field-effects.mjs
 * Verifies the "no dead inputs" contract holds for every registered injury,
 * and prints the migration coverage (declared vs. wired). Exits non-zero on
 * any contract violation so CI blocks a dead/misrouted assessment field.
 */
import { FIELD_EFFECT_REGISTRY } from '../lib/clinical/core/fieldEffectContract.mjs';
import { validateFieldEffects } from '../lib/clinical/core/validateFieldEffects.mjs';

let failed = false;

for (const [key, registry] of Object.entries(FIELD_EFFECT_REGISTRY)) {
  const { ok, errors, coverage } = validateFieldEffects(registry);
  console.log(`\n=== registry: ${key} ===`);
  console.log(`fields: ${coverage.fields} | effects: ${coverage.effects} | wired: ${coverage.wired} (${coverage.wiredPct}%) | pending: ${coverage.pending}`);

  if (!ok) {
    failed = true;
    console.log(`\n  CONTRACT VIOLATIONS (${errors.length}):`);
    for (const e of errors) console.log(`   ✗ ${e}`);
  } else {
    console.log('  ✓ contract holds: no orphan or misrouted fields.');
  }

  if (coverage.unwiredFields.length) {
    console.log(`\n  MIGRATION CHECKLIST — declared but not yet consumed by the engine:`);
    for (const u of coverage.unwiredFields) {
      console.log(`   • ${u.field} [${u.category}] → ${u.pending.join(', ')}`);
    }
  }
}

// Assertion: the contract itself must hold (no orphans/misroutes).
if (failed) {
  console.error('\n✗ FIELD-EFFECT CONTRACT FAILED\n');
  process.exit(1);
}
console.log('\n✓ FIELD-EFFECT CONTRACT PASSED (all fields drive diagnosis and/or rehab)\n');
