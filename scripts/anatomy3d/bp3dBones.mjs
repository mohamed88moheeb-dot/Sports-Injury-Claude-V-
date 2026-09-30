// Load bone meshes from the BodyParts3D pack in viewer world space (Y-up, metres).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
const DIR = (process.env.BP3D_PACK || 'package/public').replace(/\/?$/, '/');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const pack = JSON.parse(fs.readFileSync(DIR + 'pack.json', 'utf8'));
const inst = Object.fromEntries(pack.meshInstances.map((i) => [i.id, i]));
const assetUri = Object.fromEntries(pack.assets.map((a) => [a.id, a.uri]));
const docs = {};
function mul(m, v) { return [m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12], m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]]; }
function mulN(m, v) { const r = [m[0]*v[0]+m[4]*v[1]+m[8]*v[2], m[1]*v[0]+m[5]*v[1]+m[9]*v[2], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]]; const l = Math.hypot(...r) || 1; return r.map((x) => x / l); }
export async function loadStructure(slug) {
  const rep = pack.representations.find((r) => r.structureId.endsWith(':' + slug));
  const out = {};
  for (const iid of rep.instanceIds) {
    const I = inst[iid]; const uri = assetUri[I.assetId];
    docs[uri] ||= await io.read(DIR + uri);
    const node = docs[uri].getRoot().listNodes().find((n) => n.getName() === I.selector.value);
    const P = [], N = [];
    const collect = (nd) => {
      const m = nd.getWorldMatrix(); const mesh = nd.getMesh();
      if (mesh) for (const prim of mesh.listPrimitives()) {
        const pa = prim.getAttribute('POSITION'), na = prim.getAttribute('NORMAL');
        for (let i = 0; i < pa.getCount(); i++) { P.push(mul(m, pa.getElement(i, []))); N.push(na ? mulN(m, na.getElement(i, [])) : [0, 1, 0]); }
      }
      nd.listChildren().forEach(collect);
    };
    collect(node);
    const side = I.laterality === 'right' ? 'R' : I.laterality === 'left' ? 'L' : 'M';
    if (out[side]) { out[side].P.push(...P); out[side].N.push(...N); } else out[side] = { P, N };
  }
  return out;
}
