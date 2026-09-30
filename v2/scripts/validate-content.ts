import { readdirSync, readFileSync } from 'node:fs';
import { validateProtocol } from '../src/engine/validate';

const dir = new URL('../content/', import.meta.url);
let failed = 0;
for (const f of readdirSync(new URL('protocols/', dir)).filter((n) => n.endsWith('.json'))) {
  const protocol = JSON.parse(readFileSync(new URL(`protocols/${f}`, dir), 'utf8'));
  const factFile = new URL(`facts/${f.replace(/-.*|\.json$/, '')}.json`, dir);
  const facts = JSON.parse(readFileSync(factFile, 'utf8')).facts;
  const problems = validateProtocol(protocol, facts);
  console.log(`${problems.length ? '✗' : '✓'} ${f}${problems.length ? '' : ` (${protocol.review.status})`}`);
  problems.forEach((p) => console.log(`   ${p}`));
  failed += problems.length;
}
process.exit(failed ? 1 : 0);
