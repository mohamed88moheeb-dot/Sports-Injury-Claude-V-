#!/usr/bin/env node
/**
 * scripts/check-rf-quarantine-boundary.mjs
 * ---------------------------------------------------------------------------
 * RF QUARANTINE BOUNDARY CHECK (engineering enforcement, NOT clinical approval)
 *
 * Enforces the invariant declared in
 *   lib/clinical/rfLegacyQuarantineManifest.json:
 *
 *   "No module under lib/clinical/** may import, re-export, or transitively
 *    depend on any quarantined legacy module."
 *
 * The future governed Rectus Femoris (RF) path lives under lib/clinical/**.
 * Legacy clinical engines (lib/injuryEngine/*, data/injuryKnowledge/*) predate
 * the governed RF Clinical Rule Specification v1.2 and carry no evidence-claim
 * IDs or architecture references, so they must never flow into the governed
 * path — directly OR transitively — until reviewed/refactored/replaced.
 *
 * How it works:
 *   - Every source file under lib/clinical/** is an entry point.
 *   - From those entries we build a LOCAL dependency graph, following only
 *     relative ('./x') and repo-root ('/x') imports. Bare package imports
 *     ('react', 'node:fs', '@scope/pkg') are ignored.
 *   - If any dependency chain reaches a quarantined module, the check fails and
 *     prints the full chain (entry -> ... -> quarantined module).
 *
 * It deliberately does NOT scan the whole app: only modules reachable from
 * lib/clinical/** are traversed. The existing legacy app path
 * (RecoveryContext.jsx, etc.) may still import legacy modules; that behavior is
 * intentionally unchanged.
 *
 * Uses only built-in Node modules. No clinical logic is implemented here.
 * ---------------------------------------------------------------------------
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, extname, join } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');

const MANIFEST_PATH = resolve(REPO_ROOT, 'lib/clinical/rfLegacyQuarantineManifest.json');
const GOVERNED_ROOT = resolve(REPO_ROOT, 'lib/clinical');

// File extensions we treat as scannable source.
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
// Extensions an import specifier may omit, tried in order when resolving a file.
const TRY_EXTENSIONS = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'];
// Directory-import index candidates, tried in order.
const INDEX_FILES = TRY_EXTENSIONS.map((ext) => `index${ext}`);

/** Print and exit with a non-zero status. */
function fail(message) {
  console.error(message);
  process.exit(1);
}

function stripExtension(p) {
  const ext = extname(p);
  return ext ? p.slice(0, -ext.length) : p;
}

function rel(absPath) {
  return relative(REPO_ROOT, absPath);
}

/* -------------------------------------------------------------------------
 * 1. Read the manifest and extract quarantined module paths.
 * ------------------------------------------------------------------------- */
if (!existsSync(MANIFEST_PATH)) {
  fail(`RF boundary check: manifest not found at ${rel(MANIFEST_PATH)}`);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (err) {
  fail(`RF boundary check: could not parse manifest JSON — ${err.message}`);
}

const quarantineEntries = Array.isArray(manifest.quarantine) ? manifest.quarantine : [];
if (quarantineEntries.length === 0) {
  fail('RF boundary check: manifest contains no `quarantine` entries to enforce.');
}

// Set of normalized absolute paths (extension stripped) for every quarantined module.
const quarantinedNormalized = new Set();
for (const entry of quarantineEntries) {
  if (!entry || typeof entry.module !== 'string') continue;
  quarantinedNormalized.add(stripExtension(resolve(REPO_ROOT, entry.module)));
}

function isQuarantined(absFile) {
  return quarantinedNormalized.has(stripExtension(absFile));
}

/* -------------------------------------------------------------------------
 * 2. Module resolution (files + directory index), local specifiers only.
 * ------------------------------------------------------------------------- */
/**
 * Resolve a local import specifier from `fromFile` to an absolute file path.
 * Returns null for bare package specifiers (node_modules / node: builtins) and
 * for anything that cannot be resolved to a real file on disk.
 */
function resolveLocalSpecifier(spec, fromFile) {
  let base;
  if (spec.startsWith('.')) {
    base = resolve(dirname(fromFile), spec);
  } else if (spec.startsWith('/')) {
    base = resolve(REPO_ROOT, '.' + spec);
  } else {
    return null; // bare specifier — not a local repo module
  }

  // Exact path as written (may already include an extension).
  if (existsSync(base) && statSync(base).isFile()) return base;

  // Try appending known source extensions.
  for (const ext of TRY_EXTENSIONS) {
    const candidate = `${base}${ext}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }

  // Directory import → index.*
  if (existsSync(base) && statSync(base).isDirectory()) {
    for (const idx of INDEX_FILES) {
      const candidate = join(base, idx);
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------
 * 3. Specifier extraction (static, re-export, dynamic, require).
 * ------------------------------------------------------------------------- */
const SPECIFIER_PATTERNS = [
  // import ... from '...'   |   export ... from '...'
  /\b(?:import|export)\b[^'";]*?\bfrom\s*['"]([^'"]+)['"]/g,
  // bare side-effect import '...'
  /\bimport\s*['"]([^'"]+)['"]/g,
  // dynamic import('...')
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  // require('...')  (CJS, included for completeness)
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractSpecifiers(source) {
  const specs = new Set();
  for (const pattern of SPECIFIER_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) specs.add(match[1]);
  }
  return [...specs];
}

/** Resolved local dependencies (absolute file paths) of a single source file. */
function localDependenciesOf(absFile) {
  let source;
  try {
    source = readFileSync(absFile, 'utf8');
  } catch {
    return [];
  }
  const deps = [];
  for (const spec of extractSpecifiers(source)) {
    const resolved = resolveLocalSpecifier(spec, absFile);
    if (resolved) deps.push(resolved);
  }
  return deps;
}

/* -------------------------------------------------------------------------
 * 4. Collect entry points under lib/clinical/**, ignoring the manifest.
 * ------------------------------------------------------------------------- */
function collectSourceFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (st.isFile()) {
      if (full === MANIFEST_PATH) continue; // ignore the manifest JSON itself
      if (SOURCE_EXTENSIONS.has(extname(full))) out.push(full);
    }
  }
  return out;
}

const entryFiles = collectSourceFiles(GOVERNED_ROOT);

/* -------------------------------------------------------------------------
 * 5. Traverse the dependency graph from each entry point (DFS).
 *    Report the FIRST chain that reaches a quarantined module per entry.
 * ------------------------------------------------------------------------- */
/**
 * Depth-first search from `start`, following local deps. Returns the path
 * (array of absolute files, start → ... → quarantined module) of the first
 * chain that reaches a quarantined module, or null if none does.
 */
function findChainToQuarantine(start) {
  const visited = new Set();
  const stack = [{ file: start, path: [start] }];

  while (stack.length > 0) {
    const { file, path } = stack.pop();
    if (visited.has(file)) continue;
    visited.add(file);

    for (const dep of localDependenciesOf(file)) {
      const chain = [...path, dep];
      if (isQuarantined(dep)) return chain;
      if (!visited.has(dep)) stack.push({ file: dep, path: chain });
    }
  }
  return null;
}

const violations = [];
for (const entry of entryFiles) {
  const chain = findChainToQuarantine(entry);
  if (chain) violations.push(chain);
}

/* -------------------------------------------------------------------------
 * 6. Report.
 * ------------------------------------------------------------------------- */
if (violations.length > 0) {
  console.error('\n✖ RF quarantine boundary check FAILED\n');
  console.error(
    'A file under lib/clinical/** (the future governed RF path) depends — directly or\n' +
      'transitively — on a quarantined legacy clinical module. This is prohibited by\n' +
      'lib/clinical/rfLegacyQuarantineManifest.json until the legacy module is\n' +
      'reviewed, refactored, or replaced.\n'
  );
  for (const chain of violations) {
    console.error('  ' + chain.map(rel).join(' -> '));
  }
  console.error(`\n${violations.length} prohibited dependency chain(s) found.\n`);
  process.exit(1);
}

console.log(
  `✓ RF quarantine boundary check passed — traversed dependencies from ${entryFiles.length} ` +
    `entry file(s) under lib/clinical/**; no chain reaches any of ${quarantinedNormalized.size} ` +
    `quarantined module(s).`
);
process.exit(0);
