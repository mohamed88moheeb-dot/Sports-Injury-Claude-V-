'use client';

/* AnimatedTendonLogo — navbar brand mark.
   Fibrous concentric tendon rings (generated vector strands) on a blue
   squircle, each ring rotating smoothly at a different speed/direction.
   Reuses the .tl-spin-cw / .tl-spin-ccw keyframes in globals.css.
   Retina-sharp at any size; respects prefers-reduced-motion. */

import { useMemo } from 'react';

function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function strand(cx, cy, baseR, o) {
  const p2 = o.phase * 1.7 + o.rand() * 6.283;
  let d = '';
  for (let i = 0; i <= o.steps; i++) {
    const t = (i / o.steps) * Math.PI * 2;
    const r = baseR + o.braidAmp * Math.sin(o.braidFreq * t + o.phase)
                    + 0.45 * Math.sin((26 + (o.fineExtra | 0)) * t + p2);
    d += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(t)).toFixed(2) + ' ' + (cy + r * Math.sin(t)).toFixed(2);
  }
  return d + 'Z';
}
function ringPath(cx, cy, R, c) {
  const rand = rng(c.seed);
  let d = '';
  for (let s = 0; s < c.strands; s++) {
    const f = c.strands === 1 ? 0.5 : s / (c.strands - 1);
    const baseR = R + (f - 0.5) * c.spread + (rand() - 0.5) * 0.8;
    d += strand(cx, cy, baseR, {
      braidFreq: c.braidFreq,
      braidAmp: c.braidAmp * (0.7 + rand() * 0.6),
      fineExtra: Math.floor(rand() * 10),
      phase: rand() * 6.283,
      steps: 200,
      rand,
    });
  }
  return d;
}

const C = 256;
const RINGS = [
  { dir: 'cw',  dur: '26s', R: 78,  strands: 26, spread: 14, braidFreq: 5, braidAmp: 2.2, seed: 11 },
  { dir: 'ccw', dur: '34s', R: 128, strands: 30, spread: 18, braidFreq: 6, braidAmp: 3.0, seed: 23 },
  { dir: 'cw',  dur: '44s', R: 178, strands: 34, spread: 22, braidFreq: 7, braidAmp: 3.6, seed: 37 },
];

export function AnimatedTendonLogo({ size = 28 }) {
  const rings = useMemo(
    () => RINGS.map((r) => ({ ...r, d: ringPath(C, C, r.R, r) })),
    []
  );

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="tl-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {rings.map((r, i) => (
          <g key={i} className={`tl-spin-${r.dir}`} style={{ '--spin-dur': r.dur }}>
            <path d={r.d} fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.8" filter="url(#tl-glow)" />
          </g>
        ))}
      </svg>
    </span>
  );
}
