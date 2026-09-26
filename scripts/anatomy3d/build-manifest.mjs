/* Builds public/anatomy3d/manifest.json from the BodyParts3D data pack
   (@somakine/bodyparts3d-musculoskeletal, CC BY 4.0).
   Usage: node scripts/anatomy3d/build-manifest.mjs <pack>/public */
import fs from 'fs';
import path from 'path';
import { MUSCLES, OTHER, APP, CONDITIONS, QUAD_SPLIT, QUAD_LABELS } from './anatomyInfo.mjs';

const dir = process.argv[2];
const pack = JSON.parse(fs.readFileSync(path.join(dir, 'pack.json'), 'utf8'));
const en = pack.locales.find((l) => l.locale === 'en').labels;
const slug = (id) => id.split(':').pop();
const assets = Object.fromEntries(pack.assets.map((a) => [a.id, path.basename(a.uri)]));
const inst = Object.fromEntries(pack.meshInstances.map((i) => [i.id, i]));
const reps = Object.fromEntries(pack.representations.map((r) => [r.structureId, r]));
const SIDE = { right: 'R', left: 'L', midline: 'M' };

const structures = [];
const unavailable = [];
const push = (id, label, type, region, nodes, laterality) => {
  const info = MUSCLES[id] || OTHER[id] || null;
  const s = { id, label, type, region, laterality, nodes };
  if (info) s.info = info;
  if (APP[id]) s.app = APP[id];
  if (CONDITIONS[id]) s.conditions = CONDITIONS[id];
  structures.push(s);
};

for (const st of pack.structures) {
  const id = slug(st.id), rep = reps[st.id];
  const region = slug(st.regionIds[0]);
  const type = /disk/.test(id) ? 'disc' : st.type;
  const nodes = (rep?.instanceIds || []).map((i) => ({ n: inst[i].selector.value, f: assets[inst[i].assetId], s: SIDE[inst[i].laterality] || 'M' }));
  if (!nodes.length) { unavailable.push({ id, label: en[st.id] || id, type }); continue; }
  if (id === 'quadriceps') {
    for (const [fj, part] of Object.entries(QUAD_SPLIT)) {
      push(part, QUAD_LABELS[part], 'muscle', region, nodes.filter((n) => n.n.endsWith(':' + fj) || n.n.endsWith(':' + fj + 'M')), 'paired');
    }
    continue;
  }
  push(id, en[st.id] || id, type, region, nodes, st.laterality);
}

const regions = Object.fromEntries(pack.regions.sort((a, b) => a.order - b.order).map((r) => [slug(r.id), en[r.id]]));
const out = {
  attribution: pack.licenses[0].attribution,
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  sourceUrl: pack.sources[0].url,
  files: [...new Set(pack.assets.map((a) => path.basename(a.uri)))],
  regions,
  structures,
  unavailable,
};
fs.writeFileSync('public/anatomy3d/manifest.json', JSON.stringify(out));
const c = {}; structures.forEach((s) => (c[s.type] = (c[s.type] || 0) + 1));
console.log('structures', structures.length, c, 'unavailable', unavailable.length, 'nodes', structures.reduce((a, s) => a + s.nodes.length, 0));
