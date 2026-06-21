#!/usr/bin/env node
/**
 * scripts/check-rf-clinical-governance.mjs
 * ---------------------------------------------------------------------------
 * COMBINED RF CLINICAL GOVERNANCE CHECK (development discipline, NOT approval)
 *
 * Runs the two RF governance guards in order and stops on the first failure:
 *   1. node scripts/check-rf-quarantine-boundary.mjs   (import quarantine)
 *   2. node scripts/validate-rf-rule-package.mjs        (rule-object shape)
 *
 * Exits 1 if either fails (naming which one), 0 only if both pass.
 *
 * Uses only built-in Node modules. Imports/wires no clinical engine; treats the
 * sub-checks as separate child processes (no in-process coupling).
 * ---------------------------------------------------------------------------
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');

const CHECKS = [
  {
    name: 'RF quarantine boundary check',
    script: 'scripts/check-rf-quarantine-boundary.mjs',
  },
  {
    name: 'RF rule-package validation',
    script: 'scripts/validate-rf-rule-package.mjs',
  },
];

console.log('Running RF clinical governance checks…\n');

for (const check of CHECKS) {
  const scriptPath = resolve(REPO_ROOT, check.script);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });

  // spawnSync error (e.g. could not launch node) — treat as failure.
  if (result.error) {
    console.error(`\n✖ Could not run ${check.name} (${relative(REPO_ROOT, scriptPath)}): ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\n✖ RF clinical governance FAILED at: ${check.name} (${check.script}).`);
    console.error('  Fix the problem reported above; the remaining checks were not run.');
    process.exit(1);
  }

  console.log(`\n— passed: ${check.name}\n`);
}

console.log('✓ RF clinical governance passed — all checks green (development discipline only; NOT clinical approval).');
process.exit(0);
