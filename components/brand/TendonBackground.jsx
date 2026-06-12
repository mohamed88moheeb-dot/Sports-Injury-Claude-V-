'use client';

/* TendonBackground — delicate oversized tendon-ring backdrop
   Thin traveling fiber lines, no heavy filters, truly subtle.
   Position: fixed behind all content. Respects prefers-reduced-motion. */
export function TendonBackground() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'visible',
      }}
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
    >
      {/*
        All rings centered at (195, 310) — upper-center of viewport.
        Each ring uses DUAL layers: a slightly thicker semi-transparent
        "glow" circle + a razor-thin bright circle on top.
        No SVG filters — they cause dark artifacts on light backgrounds.
        Circumferences: r=90→565  r=150→942  r=215→1351  r=290→1822
      */}

      {/* ── Ring 1 — innermost (r=90) ── */}
      <circle cx="195" cy="310" r="90"
        fill="none"
        stroke="rgba(100,160,240,0.10)" strokeWidth="12"
        strokeDasharray="7 5"
        className="tb-r1-glow"
      />
      <circle cx="195" cy="310" r="90"
        fill="none"
        stroke="rgba(255,255,255,0.45)" strokeWidth="0.8"
        strokeDasharray="7 5"
        className="tb-r1"
      />
      {/* offset fiber strand */}
      <circle cx="195" cy="310" r="92"
        fill="none"
        stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"
        strokeDasharray="4 8"
        className="tb-r1"
        style={{ animationDelay: '-4s' }}
      />

      {/* ── Ring 2 (r=150) ── */}
      <circle cx="195" cy="310" r="150"
        fill="none"
        stroke="rgba(100,160,240,0.08)" strokeWidth="14"
        strokeDasharray="10 7"
        className="tb-r2-glow"
      />
      <circle cx="195" cy="310" r="150"
        fill="none"
        stroke="rgba(255,255,255,0.35)" strokeWidth="0.7"
        strokeDasharray="10 7"
        className="tb-r2"
      />
      <circle cx="195" cy="310" r="153"
        fill="none"
        stroke="rgba(255,255,255,0.14)" strokeWidth="0.5"
        strokeDasharray="6 11"
        className="tb-r2"
        style={{ animationDelay: '-8s' }}
      />

      {/* ── Ring 3 (r=215) ── */}
      <circle cx="195" cy="310" r="215"
        fill="none"
        stroke="rgba(100,160,240,0.06)" strokeWidth="16"
        strokeDasharray="13 9"
        className="tb-r3-glow"
      />
      <circle cx="195" cy="310" r="215"
        fill="none"
        stroke="rgba(255,255,255,0.26)" strokeWidth="0.65"
        strokeDasharray="13 9"
        className="tb-r3"
      />
      <circle cx="195" cy="310" r="218"
        fill="none"
        stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"
        strokeDasharray="8 14"
        className="tb-r3"
        style={{ animationDelay: '-12s' }}
      />

      {/* ── Ring 4 — outermost (r=290) ── */}
      <circle cx="195" cy="310" r="290"
        fill="none"
        stroke="rgba(100,160,240,0.04)" strokeWidth="18"
        strokeDasharray="16 11"
        className="tb-r4-glow"
      />
      <circle cx="195" cy="310" r="290"
        fill="none"
        stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"
        strokeDasharray="16 11"
        className="tb-r4"
      />
      <circle cx="195" cy="310" r="294"
        fill="none"
        stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
        strokeDasharray="10 17"
        className="tb-r4"
        style={{ animationDelay: '-18s' }}
      />

      {/* ── Soft icy center halo (radial, no filter needed) ── */}
      <circle cx="195" cy="310" r="55"
        fill="none"
        stroke="rgba(180,215,255,0.22)" strokeWidth="38"
        className="tb-center-pulse"
      />
    </svg>
  );
}
