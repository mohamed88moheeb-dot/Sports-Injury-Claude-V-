import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, quantize, meshopt, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs';
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const src = 'public/assets/bodyparts3d', out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
let a = 0, b = 0;
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.glb'))) {
  const doc = await io.read(`${src}/${f}`);
  await doc.transform(dedup(), weld(), prune({ keepLeaves: true }), quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await io.write(`${out}/${f}`, doc);
  const s0 = fs.statSync(`${src}/${f}`).size, s1 = fs.statSync(`${out}/${f}`).size; a += s0; b += s1;
}
console.log('total', (a/1e6).toFixed(1), 'MB ->', (b/1e6).toFixed(1), 'MB');
