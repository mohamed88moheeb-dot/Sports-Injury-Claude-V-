/* Builds modelled ligaments, tendons and menisci that BodyParts3D lacks,
   anchored on landmarks computed from the scanned bones, sized from the
   published quantitative anatomy listed in REFS. Output: one GLB (world
   space, Y-up metres, identity node transforms) + manifest entries. */
import { Document, NodeIO } from '@gltf-transform/core';
import fs from 'fs';
import { loadStructure } from './bp3dBones.mjs';

/* ── vector helpers ── */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
const centroid = (P) => mul(P.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / P.length);
const argmax = (P, f) => { if (!P.length) throw new Error('empty landmark set');  let b = null, bv = -Infinity; for (const p of P) { const v = f(p); if (v > bv) { bv = v; b = p; } } return b; };
const UP = [0, 1, 0], ANT = [0, 0, 1], POST = [0, 0, -1], DOWN = [0, -1, 0];

function bbox(P) { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const p of P) for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } return { mn, mx }; }
function nearest(surf, p) { let bi = 0, bd = Infinity; const P = surf.P; for (let i = 0; i < P.length; i++) { const d = (P[i][0] - p[0]) ** 2 + (P[i][1] - p[1]) ** 2 + (P[i][2] - p[2]) ** 2; if (d < bd) { bd = d; bi = i; } } return { p: P[bi], n: surf.N[bi], d: Math.sqrt(bd) }; }
function nearestFacing(surf, p, dir, minDot = 0.35) { const idx = surf.P.map((q, i) => i).filter((i) => dot(surf.N[i], dir) > minDot); let bi = idx[0], bd = Infinity; for (const i of idx) { const q = surf.P[i]; const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2; if (d < bd) { bd = d; bi = i; } } return surf.P[bi]; }
function merge(...s) { return { P: s.flatMap((x) => x.P), N: s.flatMap((x) => x.N) }; }
// average of the k closest vertices – smoother than a single vertex
function nearestAvg(surf, p, k = 12) {
  const arr = surf.P.map((q, i) => [(q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2, i]).sort((a, b) => a[0] - b[0]).slice(0, k);
  return { p: centroid(arr.map(([, i]) => surf.P[i])), n: norm(centroid(arr.map(([, i]) => surf.N[i]))) };
}
function snapOut(surf, p, off) { const q = nearestAvg(surf, p); return add(q.p, mul(q.n, off)); }

/* ── curves ── */
function catmull(ctrl, n) {
  const out = [];
  const P = [ctrl[0], ...ctrl, ctrl[ctrl.length - 1]];
  const segs = ctrl.length - 1;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * segs, k = Math.min(Math.floor(t), segs - 1), u = t - k;
    const [p0, p1, p2, p3] = [P[k], P[k + 1], P[k + 2], P[k + 3]];
    const u2 = u * u, u3 = u2 * u;
    out.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
  }
  return out;
}
// keep a path at least `off(t)` above the bone surfaces it lies on
function wrap(pts, surf, off, iters = 10, pinEnds = false) {
  let q = pts.map((p) => p.slice());
  for (let it = 0; it < iters; it++) {
    q = q.map((p, i) => {
      if (pinEnds && (i === 0 || i === q.length - 1)) return p;
      const t = i / (q.length - 1), o = typeof off === 'function' ? off(t) : off;
      const s = nearestAvg(surf, p, 6); const d = dot(sub(p, s.p), s.n);
      return d < o ? add(p, mul(s.n, o - d)) : p;
    });
    q = q.map((p, i) => (i === 0 || i === q.length - 1 ? p : lerp(p, mul(add(q[i - 1], q[i + 1]), 0.5), 0.35)));
  }
  return q;
}

/* ── sweep a cross-section along a path ── */
function sweep(path, { w, h, exp = 2, seg = 22, normalAt, taper = true }) {
  const n = path.length, pos = [], idx = [];
  let prevW = null;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const T = norm(sub(path[Math.min(i + 1, n - 1)], path[Math.max(i - 1, 0)]));
    let Wd;
    if (normalAt) { const Nn = normalAt(path[i], t); Wd = norm(cross(T, Nn)); }
    else if (prevW) { Wd = norm(sub(prevW, mul(T, dot(prevW, T)))); }
    else { const ref = Math.abs(T[1]) < 0.9 ? UP : [1, 0, 0]; Wd = norm(cross(T, ref)); }
    if (prevW && dot(Wd, prevW) < 0) Wd = mul(Wd, -1);
    prevW = Wd;
    const Hd = norm(cross(Wd, T));
    // footprints: ends flatten, widen slightly and sink into the bone
    const ss = (e0, e1, x) => { const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return k * k * (3 - 2 * k); };
    const edge = Math.min(t, 1 - t);
    const thickK = taper ? 0.45 + 0.55 * ss(0, 0.16, edge) : 1;
    const widthK = taper ? 1 + 0.22 * (1 - ss(0, 0.16, edge)) : 1;
    const ww = (w(t) * widthK) / 2, hh = (h(t) * thickK) / 2;
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const cx = Math.sign(c) * Math.pow(Math.abs(c), 2 / exp), cy = Math.sign(s) * Math.pow(Math.abs(s), 2 / exp);
      pos.push(add(path[i], add(mul(Wd, cx * ww), mul(Hd, cy * hh))));
    }
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) {
    const a = i * seg + j, b = i * seg + ((j + 1) % seg), c = (i + 1) * seg + j, d = (i + 1) * seg + ((j + 1) % seg);
    idx.push(a, c, b, b, c, d);
  }
  // rounded caps
  [[0, 1], [n - 1, -1]].forEach(([i, dir]) => {
    const ci = pos.length; const T = norm(sub(path[Math.min(Math.max(i + dir, 0), n - 1)], path[i]));
    pos.push(sub(path[i], mul(T, 0.0006)));
    for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + ((j + 1) % seg); dir > 0 ? idx.push(ci, a, b) : idx.push(ci, b, a); }
  });
  return { pos, idx };
}

/* ── meniscus: wedge swept around the tibial plateau rim ── */
function meniscus(side, comp, tib, fem, { gapDir, gapDeg, width }) {
  const plateau = comp;
  const c = centroid(plateau);
  const bins = 72, rim = [];
  for (let b = 0; b < bins; b++) {
    const ang = (b / bins) * Math.PI * 2;
    const dir = [Math.sin(ang), 0, Math.cos(ang)];
    const cand = plateau.filter((p) => { const v = sub(p, c); const a = Math.atan2(v[0], v[2]); let d = Math.abs(a - Math.atan2(dir[0], dir[2])); d = Math.min(d, 2 * Math.PI - d); return d < Math.PI / bins * 1.6; });
    if (!cand.length) continue;
    rim.push({ ang, p: argmax(cand, (p) => dot(sub(p, c), dir)) });
  }
  // gap faces the intercondylar area
  const gapA = Math.atan2(gapDir[0], gapDir[2]);
  const inGap = (a) => { let d = Math.abs(a - gapA); d = Math.min(d, 2 * Math.PI - d); return d < (gapDeg / 2) * Math.PI / 180; };
  // order rim points starting just after the gap
  const sorted = rim.filter((r) => !inGap(r.ang)).map((r) => ({ ...r, rel: ((r.ang - gapA) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) })).sort((a, b) => a.rel - b.rel);
  const ctrl = sorted.map((r) => r.p);
  // smooth outer contour
  let outer = ctrl.map((p, i) => centroid(ctrl.slice(Math.max(0, i - 2), i + 3)));
  const n = outer.length, pos = [], idx = [];
  const prof = 7;
  outer.forEach((o, i) => {
    const t = i / (n - 1);
    const inward = norm([c[0] - o[0], 0, c[2] - o[2]]);
    const W = width(t, o);
    const hornTaper = Math.min(1, Math.min(t, 1 - t) / 0.12);
    const floorO = nearestAvg(tib, o, 8).p[1];
    const inner = add(o, mul(inward, W));
    const floorI = nearestAvg(tib, inner, 8).p[1];
    // clearance to the femoral condyle above the outer edge
    const femAbove = fem.P.filter((q) => Math.hypot(q[0] - o[0], q[2] - o[2]) < 0.004 && q[1] > floorO).reduce((m, q) => Math.min(m, q[1]), Infinity);
    let H = 0.0058 * (0.55 + 0.45 * hornTaper);
    if (isFinite(femAbove)) H = Math.max(0.002, Math.min(H, femAbove - floorO - 0.0006));
    const base = 0.0003;
    // cross-section: inner edge -> sloped top -> outer wall -> flat bottom
    const pts = [
      [inner, floorI + base + 0.0006],
      [lerp(inner, o, 0.35), null, 0.45],
      [lerp(inner, o, 0.7), null, 0.82],
      [add(o, mul(inward, 0.0008)), null, 1.0],
      [add(o, mul(inward, -0.0002)), null, 0.55],
      [add(o, mul(inward, 0.0004)), floorO + base],
      [lerp(inner, o, 0.5), null, 0],
    ];
    pts.forEach(([p, y, f], k) => {
      let yy;
      if (y != null) yy = y; else if (f === 0) yy = lerp([0, floorI, 0], [0, floorO, 0], 0.5)[1] + base; else yy = lerp([0, floorI, 0], [0, floorO, 0], 0.5)[1] + base + H * f;
      pos.push([p[0], yy, p[2]]);
    });
  });
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < prof; j++) {
    const a = i * prof + j, b = i * prof + ((j + 1) % prof), cc = (i + 1) * prof + j, d = (i + 1) * prof + ((j + 1) % prof);
    idx.push(a, b, cc, b, d, cc);
  }
  [[0, 1], [n - 1, -1]].forEach(([i, dir]) => { const base = i * prof; for (let j = 1; j < prof - 1; j++) dir > 0 ? idx.push(base, base + j + 1, base + j) : idx.push(base, base + j, base + j + 1); });
  return { pos, idx };
}

/* ── build ── */
const OUT = [];
const push = (id, side, geo) => OUT.push({ id, side, geo });
const sides = ['L']; // right side is mirrored from the left: the source bones are mirror copies
const B = {};
for (const s of ['femur', 'tibia', 'fibula', 'patella', 'talus', 'calcaneus', 'navicular-bone-of-foot', 'humerus', 'ulna', 'scapula',
  'first-metatarsal-bone', 'second-metatarsal', 'third-metatarsal-bone', 'fourth-metatarsal-bone', 'fifth-metatarsal-bone',
  'supraspinatus', 'infraspinatus', 'teres-minor', 'subscapularis']) B[s] = await loadStructure(s);

const LOG = {};
for (const side of sides) {
  const sx = side === 'R' ? -1 : 1, LAT = [sx, 0, 0], MED = [-sx, 0, 0];
  const F = B.femur[side], T = B.tibia[side], Fi = B.fibula[side], Pa = B.patella[side];
  const fb = bbox(F.P), tb = bbox(T.P), fib = bbox(Fi.P), pb = bbox(Pa.P);
  const knee = merge(F, T, Fi);

  /* tibial plateau */
  const topY = tb.mx[1];
  const plateau = T.P.filter((p, i) => p[1] > topY - 0.016 && T.N[i][1] > 0.75);
  const plateauY = plateau.map((p) => p[1]).sort((a, b) => a - b)[Math.floor(plateau.length / 2)];
  const pc = centroid(plateau);
  const medComp = plateau.filter((p) => dot(sub(p, pc), MED) > 0.007 && p[1] < plateauY + 0.004);
  const latComp = plateau.filter((p) => dot(sub(p, pc), LAT) > 0.007 && p[1] < plateauY + 0.004);
  const pz = bbox(plateau);
  const AP = pz.mx[2] - pz.mn[2];

  /* femoral landmarks */
  const distal = F.P.filter((p) => p[1] < fb.mn[1] + 0.07);
  const epiBand = distal.filter((p) => p[1] > fb.mn[1] + 0.02 && p[1] < fb.mn[1] + 0.06);
  const ME = argmax(epiBand, (p) => dot(p, MED));
  const LE = argmax(epiBand, (p) => dot(p, LAT));
  const medCond = argmax(distal.filter((p) => dot(sub(p, pc), MED) > 0.01), (p) => -p[1]);
  const latCond = argmax(distal.filter((p) => dot(sub(p, pc), LAT) > 0.01), (p) => -p[1]);
  const notchX = (medCond[0] + latCond[0]) / 2;

  /* MCL — femoral 3.2 mm proximal, 4.8 mm posterior to ME; proximal tibial ~16 mm, distal 61 mm below joint line */
  {
    const fem = snapOut(F, add(add(ME, mul(UP, 0.0032)), mul(POST, 0.0048)), -0.0004);
    const proxT = argmax(T.P.filter((p) => Math.abs(p[1] - (plateauY - 0.0159)) < 0.003), (p) => dot(p, MED) + 0.25 * p[2]);
    const distT = argmax(T.P.filter((p) => Math.abs(p[1] - (plateauY - 0.0612)) < 0.003), (p) => dot(p, MED) + 0.15 * p[2]);
    const mid = add(lerp(fem, proxT, 0.5), mul(MED, 0.003));
    let path = catmull([fem, mid, snapOut(T, proxT, 0.0015), snapOut(T, lerp(proxT, distT, 0.5), 0.0015), snapOut(T, distT, -0.0004)], 40);
    path = wrap(path, knee, 0.0018, 10, true);
    push('medial-collateral-ligament', side, sweep(path, { w: (t) => 0.011 + 0.004 * Math.sin(Math.PI * Math.min(1, t * 1.2)) + (t > 0.8 ? 0.004 * (t - 0.8) / 0.2 : 0), h: (t) => 0.0024 * (0.6 + 0.4 * Math.sin(Math.PI * t)), exp: 5, normalAt: (p) => nearestAvg(knee, p, 8).n }));
    LOG['MCL-' + side] = (path.reduce((s, p, i) => s + (i ? len(sub(p, path[i - 1])) : 0), 0) * 1000).toFixed(1) + ' mm';
  }

  /* LCL — femoral 1.4 mm proximal, 3.1 mm posterior to LE; fibular head lateral aspect */
  {
    const fem = snapOut(F, add(add(LE, mul(UP, 0.0014)), mul(POST, 0.0031)), -0.0006);
    const headBand = Fi.P.filter((p) => p[1] > fib.mx[1] - 0.03 && p[1] < fib.mx[1] - 0.012);
    const zAnt = Math.max(...headBand.map((p) => p[2]));
    const fibIns = argmax(headBand.filter((p) => Math.abs(p[2] - (zAnt - 0.0082)) < 0.004), (p) => dot(p, LAT));
    let path = catmull([fem, add(lerp(fem, fibIns, 0.5), mul(LAT, 0.0012)), snapOut(Fi, fibIns, -0.0006)], 34);
    path = wrap(path, knee, 0.0021, 10, true);
    push('lateral-collateral-ligament', side, sweep(path, { w: () => 0.0046, h: () => 0.0032, exp: 2.2 }));
    LOG['LCL-' + side] = (path.reduce((s, p, i) => s + (i ? len(sub(p, path[i - 1])) : 0), 0) * 1000).toFixed(1) + ' mm';
  }

  /* ACL — tibial centre at ~43 % of plateau AP depth from anterior, between the tibial spines;
     femoral centre on the lateral notch wall, posterior-proximal */
  const notchWall = (dir, keep, minN = 0.45) => F.P.filter((p, i) => p[1] < fb.mn[1] + 0.035 && p[1] > fb.mn[1] + 0.006 && dot(sub(p, [notchX, 0, 0]), dir) > 0.003 && dot(sub(p, [notchX, 0, 0]), dir) < 0.022 && dot(F.N[i], mul(dir, -1)) > minN && keep(p));
  const zMidF = (bbox(distal).mn[2] + bbox(distal).mx[2]) / 2;
  {
    const wall = notchWall(LAT, (p) => p[2] < zMidF + 0.004);
    const wb = bbox(wall);
    const fem = add(centroid(wall.filter((p) => p[2] < wb.mn[2] + 0.55 * (wb.mx[2] - wb.mn[2]) && p[1] > wb.mn[1] + 0.35 * (wb.mx[1] - wb.mn[1]))), mul(MED, 0.0035));
    const tz = pz.mx[2] - 0.426 * AP;
    const tibSurf = nearestAvg(T, [notchX + sx * 0.001, plateauY + 0.01, tz], 16).p;
    const tib = add(tibSurf, mul(UP, 0.0025));
    const mid = add(lerp(fem, tib, 0.5), add(mul(ANT, 0.002), mul(LAT, 0.0015)));
    let path = catmull([fem, mid, tib], 30);
    path = wrap(path, merge(F, T), 0.0034, 6, true);
    push('anterior-cruciate-ligament', side, sweep(path, { w: (t) => 0.0105 + 0.004 * Math.abs(t - 0.5) * 2, h: (t) => 0.0068 - 0.0015 * Math.abs(t - 0.5) * 2, exp: 2.2, normalAt: () => LAT }));
    LOG['ACL-' + side] = (len(sub(fem, tib)) * 1000).toFixed(1) + ' mm, incl ' + (Math.atan2(fem[1] - tib[1], Math.abs(fem[2] - tib[2])) * 180 / Math.PI).toFixed(0) + '°';
    LOG['_acl' + side] = { fem, tib };
  }
  /* PCL — femoral on the lateral wall of the medial condyle (anterior notch);
     tibial in the posterior intercondylar fossa ~1 cm below the joint line */
  {
    let wall = notchWall(MED, (p) => p[2] > zMidF - 0.006);
    if (wall.length < 8) wall = notchWall(MED, (p) => p[2] > zMidF - 0.012, 0.2);
    const wb = bbox(wall);
    const fem = add(centroid(wall.filter((p) => p[2] > wb.mn[2] + 0.45 * (wb.mx[2] - wb.mn[2]) && p[1] > wb.mn[1] + 0.3 * (wb.mx[1] - wb.mn[1]))), mul(LAT, 0.004));
    const post = T.P.filter((p) => Math.abs(p[0] - notchX) < 0.008 && p[1] > plateauY - 0.016 && p[1] < plateauY - 0.006);
    const tibB = argmax(post, (p) => -p[2]);
    const tib = add(tibB, mul(ANT, 0.003));
    const mid = add(lerp(fem, tib, 0.5), add(mul(POST, 0.004), mul(MED, 0.001)));
    let path = catmull([fem, mid, add(tib, mul(UP, 0.004)), tib], 30);
    path = wrap(path, merge(F, T), 0.0045, 6, true);
    // keep clear of the ACL
    const { fem: af, tib: at } = LOG['_acl' + side];
    path = path.map((p, i) => { if (i === 0 || i === path.length - 1) return p; const u = Math.max(0, Math.min(1, dot(sub(p, at), sub(af, at)) / dot(sub(af, at), sub(af, at)))); const q = lerp(at, af, u); const d = len(sub(p, q)); return d < 0.0095 ? add(p, mul(norm(sub(p, q)), 0.0095 - d)) : p; });
    push('posterior-cruciate-ligament', side, sweep(path, { w: (t) => 0.0125 + 0.004 * Math.abs(t - 0.5) * 2, h: () => 0.0078, exp: 2.2, normalAt: () => MED }));
    LOG['PCL-' + side] = (len(sub(fem, tib)) * 1000).toFixed(1) + ' mm';
  }

  /* menisci — medial C (AH ~9 mm, body ~10 mm, PH ~15 mm), lateral near-O (~10.5 mm) */
  {
    const intercond = [notchX, plateauY, pc[2]];
    const mDir = norm(sub(intercond, centroid(medComp))); mDir[1] = 0;
    const lDir = norm(sub(intercond, centroid(latComp))); lDir[1] = 0;
    const femP = F;
    // medial: rel runs from the anterior horn (just past the gap) around to the posterior horn, or the reverse
    const medGeo = meniscus(side, medComp, T, femP, { gapDir: norm(mDir), gapDeg: 70, width: (t, o) => { const ant = o[2] > centroid(medComp)[2]; const tt = Math.abs(t - 0.5) * 2; return (ant ? 0.0088 + (0.0101 - 0.0088) * (1 - tt) : 0.0152 - (0.0152 - 0.0101) * (1 - tt)); } });
    push('medial-meniscus', side, medGeo);
    const latGeo = meniscus(side, latComp, T, femP, { gapDir: norm(lDir), gapDeg: 38, width: () => 0.0105 });
    push('lateral-meniscus', side, latGeo);
  }

  /* patellar tendon — inferior pole of patella to tibial tuberosity (~25–30 mm wide) */
  {
    const apex = centroid(Pa.P.filter((p) => p[1] < pb.mn[1] + 0.006));
    // insertion centre on the tuberosity, ~30 mm below the joint line
    const tubBand = T.P.filter((p) => Math.abs(p[1] - (plateauY - 0.031)) < 0.006);
    const zmax = Math.max(...tubBand.map((p) => p[2]));
    const tub = centroid(tubBand.filter((p) => p[2] > zmax - 0.003));
    const start = add(apex, mul(POST, 0.002));
    let path = catmull([start, add(lerp(start, tub, 0.5), mul(ANT, 0.0035)), snapOut(T, tub, 0.0022)], 30);
    path = wrap(path, merge(T, Pa), 0.0026);
    push('patellar-tendon', side, sweep(path, { w: (t) => 0.0285 - 0.0055 * t, h: (t) => 0.0048 - 0.001 * t, exp: 4, normalAt: () => ANT }));
    LOG['PT-' + side] = (len(sub(start, tub)) * 1000).toFixed(1) + ' mm';
  }

  /* ankle — lateral ligaments (ATFL, CFL, PTFL), deltoid, plantar fascia */
  {
    const Ta = B.talus[side], Ca = B.calcaneus[side], Nv = B['navicular-bone-of-foot'][side];
    const ankle = merge(T, Fi, Ta, Ca, Nv);
    const mall = Fi.P.filter((p) => p[1] < fib.mn[1] + 0.022);
    const tip = argmax(mall, (p) => -p[1]);
    const talb = bbox(Ta.P);
    // ATFL: anterior border of lateral malleolus -> lateral talar neck
    const atflO = argmax(mall.filter((p) => p[1] < tip[1] + 0.02 && p[1] > tip[1] + 0.004), (p) => p[2]);
    const neck = centroid(Ta.P.filter((p) => p[2] > talb.mx[2] - 0.022 && dot(p, LAT) > Math.max(...Ta.P.map((q) => dot(q, LAT))) - 0.008));
    let path = wrap(catmull([snapOut(Fi, atflO, 0.0012), add(lerp(atflO, neck, 0.5), mul(LAT, 0.003)), snapOut(Ta, neck, 0.0012)], 20), ankle, 0.0016);
    push('anterior-talofibular-ligament', side, sweep(path, { w: () => 0.0078, h: () => 0.0022, exp: 5, normalAt: (p) => nearestAvg(ankle, p, 8).n }));
    // CFL: malleolar tip -> lateral calcaneus, posterior-inferior
    const cflI = nearestFacing(Ca, add(tip, add(mul(DOWN, 0.024), mul(POST, 0.013))), LAT, 0.3);
    path = wrap(catmull([snapOut(Fi, add(tip, mul(ANT, 0.002)), 0.0014), add(lerp(tip, cflI, 0.5), mul(LAT, 0.004)), snapOut(Ca, cflI, 0.0014)], 20), ankle, 0.0022);
    push('calcaneofibular-ligament', side, sweep(path, { w: () => 0.0058, h: () => 0.0038, exp: 2.4 }));
    // PTFL: malleolar fossa -> posterolateral talar tubercle
    const fossa = add(argmax(mall.filter((p) => p[1] < tip[1] + 0.014), (p) => -p[2]), mul(MED, 0.002));
    const postTub = centroid(Ta.P.filter((p) => p[2] < talb.mn[2] + 0.006).filter((p) => dot(p, LAT) > dot(centroid(Ta.P), LAT)));
    path = wrap(catmull([fossa, lerp(fossa, postTub, 0.5), snapOut(Ta, postTub, 0.001)], 16), ankle, 0.0022);
    push('posterior-talofibular-ligament', side, sweep(path, { w: () => 0.0066, h: () => 0.0042, exp: 2.4 }));
    // deltoid: medial malleolus fanning to navicular, sustentaculum tali, posterior talus
    const tibLow = T.P.filter((p) => p[1] < tb.mn[1] + 0.02);
    const mmTip = argmax(tibLow.filter((p) => dot(p, MED) > Math.max(...tibLow.map((q) => dot(q, MED))) - 0.01), (p) => -p[1]);
    const navTub = argmax(Nv.P, (p) => dot(p, MED));
    const sust = argmax(Ca.P.filter((p) => p[1] > bbox(Ca.P).mx[1] - 0.02 && p[2] > centroid(Ca.P)[2] - 0.005), (p) => dot(p, MED));
    const ptt = argmax(Ta.P.filter((p) => p[2] < talb.mn[2] + 0.012), (p) => dot(p, MED));
    const dGeo = { pos: [], idx: [] };
    for (const [ins, w] of [[navTub, 0.0085], [sust, 0.0095], [ptt, 0.0085]]) {
      const pth = wrap(catmull([snapOut(T, add(mmTip, mul(UP, 0.006)), 0.0014), add(lerp(mmTip, ins, 0.5), mul(MED, 0.003)), snapOut(ankle, ins, 0.0014)], 18), ankle, 0.0018);
      const g = sweep(pth, { w: (t) => w * (0.75 + 0.35 * t), h: () => 0.0028, exp: 5, normalAt: (p) => nearestAvg(ankle, p, 8).n });
      const o = dGeo.pos.length; dGeo.pos.push(...g.pos); dGeo.idx.push(...g.idx.map((k) => k + o));
    }
    push('deltoid-ligament', side, dGeo);
    // plantar fascia: medial calcaneal tubercle -> five metatarsal heads
    const cab = bbox(Ca.P);
    const origin = add(argmax(Ca.P.filter((p) => p[2] < cab.mn[2] + 0.022), (p) => -p[1] + 0.3 * dot(p, MED)), mul(DOWN, 0.002));
    const mts = ['first-metatarsal-bone', 'second-metatarsal', 'third-metatarsal-bone', 'fourth-metatarsal-bone', 'fifth-metatarsal-bone'].map((k) => B[k][side]);
    const foot = merge(Ca, Nv, Ta, ...mts);
    const pfGeo = { pos: [], idx: [] };
    mts.forEach((mt, k) => {
      const mb = bbox(mt.P);
      const head = argmax(mt.P.filter((p) => p[2] > mb.mx[2] - 0.012), (p) => -p[1]);
      const pth = wrap(catmull([origin, lerp(origin, head, 0.33), lerp(origin, head, 0.7), add(head, mul(DOWN, 0.003))], 26), foot, 0.0032);
      const g = sweep(pth, { w: (t) => (k === 0 ? 0.008 : 0.0065) * (t < 0.35 ? 1.4 - t : 1), h: (t) => 0.0032 * (1 - 0.45 * t), exp: 4, normalAt: () => DOWN });
      const o = pfGeo.pos.length; pfGeo.pos.push(...g.pos); pfGeo.idx.push(...g.idx.map((i) => i + o));
    });
    push('plantar-fascia', side, pfGeo);
    LOG['ATFL-' + side] = (len(sub(atflO, neck)) * 1000).toFixed(1) + ' mm';
  }

  /* elbow — anterior bundle of the ulnar collateral ligament */
  {
    const H = B.humerus[side], U = B.ulna[side];
    const hb = bbox(H.P), ub = bbox(U.P);
    const me = argmax(H.P.filter((p) => p[1] < hb.mn[1] + 0.05), (p) => dot(p, MED));
    const subl = argmax(U.P.filter((p) => p[1] < ub.mx[1] - 0.018 && p[1] > ub.mx[1] - 0.034 && p[2] > centroid(U.P.filter((q) => q[1] > ub.mx[1] - 0.04))[2] - 0.002), (p) => dot(p, MED));
    const elbow = merge(H, U);
    const pth = wrap(catmull([snapOut(H, add(me, mul(DOWN, 0.004)), 0.0012), add(lerp(me, subl, 0.5), mul(MED, 0.004)), snapOut(U, subl, 0.0012)], 20), elbow, 0.002);
    push('ulnar-collateral-ligament', side, sweep(pth, { w: () => 0.0068, h: () => 0.003, exp: 3, normalAt: (p) => nearestAvg(elbow, p, 8).n }));
    LOG['UCL-' + side] = (len(sub(me, subl)) * 1000).toFixed(1) + ' mm';
  }

  /* rotator cuff tendons — muscle end -> footprint, wrapped over the humeral head */
  {
    const H = B.humerus[side], hb = bbox(H.P);
    const prox = H.P.filter((p) => p[1] > hb.mx[1] - 0.045);
    const latMax = Math.max(...prox.map((p) => dot(p, LAT)));
    const gtRegion = prox.filter((p) => dot(p, LAT) > latMax - 0.012);
    const gtTop = argmax(gtRegion, (p) => p[1]);
    const gz = bbox(gtRegion);
    const facet = (zf, drop) => { const z = gz.mn[2] + zf * (gz.mx[2] - gz.mn[2]); return argmax(gtRegion.filter((p) => Math.abs(p[2] - z) < 0.005 && p[1] < gtTop[1] - drop + 0.004), (p) => p[1]); };
    const ssF = facet(0.72, 0.0), isF = facet(0.42, 0.006), tmF = facet(0.12, 0.022);
    const lt = argmax(prox.filter((p) => p[1] < hb.mx[1] - 0.016 && p[1] > hb.mx[1] - 0.04), (p) => p[2] + 0.3 * dot(p, LAT));
    const cuff = [
      ['supraspinatus', ssF, 0.016, 0.0055],
      ['infraspinatus', isF, 0.022, 0.0055],
      ['teres-minor', tmF, 0.018, 0.005],
      ['subscapularis', lt, 0.026, 0.0055],
    ];
    const hum = H;
    const g = { pos: [], idx: [] };
    for (const [m, foot, w, th] of cuff) {
      const M = B[m][side];
      const endPt = centroid(M.P.map((p) => [p, len(sub(p, foot))]).sort((a, b) => a[1] - b[1]).slice(0, 40).map(([p]) => p));
      const start = lerp(endPt, centroid(M.P), 0.35); // tendons continue into the muscle belly
      let pth = catmull([start, lerp(start, foot, 0.4), lerp(start, foot, 0.75), snapOut(hum, foot, th * 0.5)], 30);
      pth = wrap(pth, hum, (t) => th * 0.5 + 0.0012);
      const sw = sweep(pth, { w: (t) => w * (0.8 + 0.2 * t), h: (t) => th * (0.85 - 0.25 * t), exp: 4, normalAt: (p) => nearestAvg(hum, p, 8).n });
      push(m + '-tendon', side, sw);
      LOG[m + '-' + side] = (len(sub(start, foot)) * 1000).toFixed(1) + ' mm';
    }
  }
}

// mirror left -> right (x -> -x)
for (const o of OUT.filter((o) => o.side === 'L')) OUT.push({ id: o.id, side: 'R', geo: { pos: o.geo.pos.map((p) => [-p[0], p[1], p[2]]), idx: o.geo.idx.slice() } });

/* ── write GLB ── */
function normals(pos, idx) {
  const n = pos.map(() => [0, 0, 0]);
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]];
    const f = cross(sub(pos[b], pos[a]), sub(pos[c], pos[a]));
    [a, b, c].forEach((k) => { n[k] = add(n[k], f); });
  }
  return n.map(norm);
}
const doc = new Document();
const buf = doc.createBuffer();
const scene = doc.createScene();
const mat = doc.createMaterial('connective').setBaseColorFactor([0.92, 0.9, 0.84, 1]);
for (const { id, side, geo } of OUT) {
  // outward-facing check: flip winding if normals point inward on average
  let nrm = normals(geo.pos, geo.idx);
  const c = centroid(geo.pos);
  const outward = geo.pos.reduce((s, p, i) => s + dot(sub(p, c), nrm[i]), 0);
  if (outward < 0) { for (let i = 0; i < geo.idx.length; i += 3) { const t = geo.idx[i + 1]; geo.idx[i + 1] = geo.idx[i + 2]; geo.idx[i + 2] = t; } nrm = normals(geo.pos, geo.idx); }
  const P = doc.createAccessor().setType('VEC3').setArray(new Float32Array(geo.pos.flat())).setBuffer(buf);
  const N = doc.createAccessor().setType('VEC3').setArray(new Float32Array(nrm.flat())).setBuffer(buf);
  const I = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(geo.idx)).setBuffer(buf);
  const prim = doc.createPrimitive().setAttribute('POSITION', P).setAttribute('NORMAL', N).setIndices(I).setMaterial(mat);
  const mesh = doc.createMesh(`modelled:${id}:${side}`).addPrimitive(prim);
  scene.addChild(doc.createNode(`modelled:${id}:${side}`).setMesh(mesh));
}
const out = process.argv[2] || 'modelled-connective.glb';
await new NodeIO().write(out, doc);
fs.writeFileSync(out.replace(/\.glb$/, '.json'), JSON.stringify([...new Set(OUT.map((o) => o.id))]));
Object.keys(LOG).filter((k) => !k.startsWith('_')).forEach((k) => console.log(k.padEnd(22), LOG[k]));
console.log('structures', OUT.length, 'bytes', fs.statSync(out).size);
