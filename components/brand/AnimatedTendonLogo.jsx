'use client';

/* AnimatedTendonLogo — GPU-safe navbar icon
   CSS class .tl-spin-cw/.tl-spin-ccw with transform-box:fill-box
   so transform-origin:center works correctly on SVG <g> elements. */
export function AnimatedTendonLogo({ size = 28 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: Math.round(size * 0.25),
        overflow: 'hidden',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tl-bg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6BAAF5" />
            <stop offset="100%" stopColor="#2D68C0" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="56" height="56" rx="13" fill="url(#tl-bg)" />

        {/* Icy center halo — static */}
        <circle cx="28" cy="28" r="8" fill="rgba(200,230,255,0.20)" />

        {/* Ring 1 — inner, slow CW (6s) */}
        <g className="tl-spin-cw" style={{ '--spin-dur': '6s' }}>
          <circle cx="28" cy="28" r="8"  fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="3.5" strokeDasharray="3 2"   />
          <circle cx="28" cy="28" r="8"  fill="none" stroke="rgba(255,255,255,0.90)" strokeWidth="0.9" strokeDasharray="3 2"   />
          <circle cx="28" cy="28" r="9"  fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="0.5" strokeDasharray="2 3"   />
        </g>

        {/* Ring 2 — middle, medium CCW (10s) */}
        <g className="tl-spin-ccw" style={{ '--spin-dur': '10s' }}>
          <circle cx="28" cy="28" r="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3"   strokeDasharray="4 3"   />
          <circle cx="28" cy="28" r="14" fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="0.8" strokeDasharray="4 3"   />
          <circle cx="28" cy="28" r="15" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="0.5" strokeDasharray="2.5 4" />
        </g>

        {/* Ring 3 — outer, faster CW (14s) */}
        <g className="tl-spin-cw" style={{ '--spin-dur': '14s' }}>
          <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="2.5" strokeDasharray="5 3.5" />
          <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth="0.7" strokeDasharray="5 3.5" />
          <circle cx="28" cy="28" r="21" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" strokeDasharray="3 5.5" />
        </g>
      </svg>
    </span>
  );
}
