'use client';

/* AnimatedTendonLogo — tiny navbar brand icon
   Blue gradient base + 3 concentric fiber rings with traveling light pulses.
   No heavy SVG filters — clean on all backgrounds. Respects prefers-reduced-motion. */
export function AnimatedTendonLogo({ size = 28 }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0, borderRadius: 7, overflow: 'hidden' }}
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
          <clipPath id="tl-clip">
            <rect width="56" height="56" rx="13" />
          </clipPath>
        </defs>

        {/* Blue gradient background */}
        <rect width="56" height="56" rx="13" fill="url(#tl-bg)" />

        {/* Subtle center icy halo */}
        <circle cx="28" cy="28" r="9"
          fill="none"
          stroke="rgba(200,230,255,0.30)" strokeWidth="10"
          className="tb-center-pulse"
        />

        {/* ── Ring 1 — inner (r=8, circ≈50.3) ── */}
        {/* Soft glow band */}
        <circle cx="28" cy="28" r="8"
          stroke="rgba(255,255,255,0.22)" strokeWidth="4"
          strokeDasharray="3.2 2.1"
          className="tl-r1"
        />
        {/* Bright fiber line */}
        <circle cx="28" cy="28" r="8"
          stroke="rgba(255,255,255,0.92)" strokeWidth="1"
          strokeDasharray="3.2 2.1"
          className="tl-r1"
        />
        {/* Offset strand */}
        <circle cx="28" cy="28" r="9"
          stroke="rgba(255,255,255,0.35)" strokeWidth="0.6"
          strokeDasharray="2 3.2"
          className="tl-r1"
          style={{ animationDelay: '-1s' }}
        />

        {/* ── Ring 2 — middle (r=14, circ≈88.0) ── */}
        <circle cx="28" cy="28" r="14"
          stroke="rgba(255,255,255,0.18)" strokeWidth="4"
          strokeDasharray="4 2.8"
          className="tl-r2"
        />
        <circle cx="28" cy="28" r="14"
          stroke="rgba(255,255,255,0.88)" strokeWidth="0.85"
          strokeDasharray="4 2.8"
          className="tl-r2"
        />
        <circle cx="28" cy="28" r="15"
          stroke="rgba(255,255,255,0.28)" strokeWidth="0.5"
          strokeDasharray="2.5 4"
          className="tl-r2"
          style={{ animationDelay: '-2s' }}
        />

        {/* ── Ring 3 — outer (r=20, circ≈125.7) ── */}
        <circle cx="28" cy="28" r="20"
          stroke="rgba(255,255,255,0.14)" strokeWidth="3.5"
          strokeDasharray="5 3.5"
          className="tl-r3"
        />
        <circle cx="28" cy="28" r="20"
          stroke="rgba(255,255,255,0.82)" strokeWidth="0.75"
          strokeDasharray="5 3.5"
          className="tl-r3"
        />
        <circle cx="28" cy="28" r="21"
          stroke="rgba(255,255,255,0.22)" strokeWidth="0.5"
          strokeDasharray="3 5.5"
          className="tl-r3"
          style={{ animationDelay: '-3s' }}
        />
      </svg>
    </span>
  );
}
