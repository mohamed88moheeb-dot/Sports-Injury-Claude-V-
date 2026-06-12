'use client';

/* TendonBackground — GPU-safe tendon-ring backdrop
   Uses CSS class .tb-spin-cw/.tb-spin-ccw with transform-box:fill-box
   so transform-origin:center works correctly on SVG <g> elements. */
export function TendonBackground() {
  const cx = 195;
  const cy = 300;

  const rings = [
    { r: 90,  dash: '7 5',   dur: '22s',  dir: 'cw',  glow: 0.12, line: 0.40, strand: 0.16 },
    { r: 150, dash: '10 7',  dur: '34s',  dir: 'ccw', glow: 0.09, line: 0.30, strand: 0.12 },
    { r: 215, dash: '13 9',  dur: '48s',  dir: 'cw',  glow: 0.06, line: 0.22, strand: 0.09 },
    { r: 290, dash: '16 11', dur: '64s',  dir: 'ccw', glow: 0.04, line: 0.15, strand: 0.06 },
  ];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      pointerEvents="none"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
    >
      {rings.map(({ r, dash, dur, dir, glow, line, strand }) => (
        <g
          key={r}
          className={`tb-spin-${dir}`}
          style={{ '--spin-dur': dur }}
        >
          {/* Soft glow halo */}
          <circle cx={cx} cy={cy} r={r}
            fill="none"
            stroke={`rgba(180,215,255,${glow})`}
            strokeWidth="18"
            strokeDasharray={dash}
          />
          {/* Primary fiber line */}
          <circle cx={cx} cy={cy} r={r}
            fill="none"
            stroke={`rgba(255,255,255,${line})`}
            strokeWidth="0.75"
            strokeDasharray={dash}
          />
          {/* Offset secondary strand */}
          <circle cx={cx} cy={cy} r={r + 3}
            fill="none"
            stroke={`rgba(255,255,255,${strand})`}
            strokeWidth="0.5"
            strokeDasharray={`${parseFloat(dash) * 0.6} ${parseFloat(dash.split(' ')[1]) * 1.8}`}
          />
        </g>
      ))}

      {/* Static icy center halo — opacity breathe only */}
      <circle cx={cx} cy={cy} r="52"
        fill="none"
        stroke="rgba(180,215,255,0.18)"
        strokeWidth="40"
        className="tb-center-pulse"
      />
    </svg>
  );
}
