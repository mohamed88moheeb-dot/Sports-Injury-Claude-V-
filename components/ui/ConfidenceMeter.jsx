'use client';

/**
 * ConfidenceMeter — circular progress ring with blue glow
 * Props:
 *   value  (0–100)   — the confidence percentage
 *   label             — optional subtitle text
 *   size   (px)       — diameter, default 100
 */
export function ConfidenceMeter({ value = 0, label = 'Confidence', size = 100 }) {
  const r = (size - 16) / 2;               // radius (leave 8px for stroke-width)
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  const color =
    value >= 75 ? '#2F8CFF' :
    value >= 50 ? '#38BDF8' :
    value >= 30 ? '#F97316' : '#EF4444';

  const glow =
    value >= 75 ? 'rgba(47,140,255,0.70)' :
    value >= 50 ? 'rgba(56,189,248,0.65)' :
    value >= 30 ? 'rgba(249,115,22,0.65)' : 'rgba(239,68,68,0.65)';

  return (
    <div className="confidence-meter">
      <div className="confidence-ring-wrap" style={{ width: size, height: size }}>
        <svg
          className="confidence-ring-svg"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
        >
          <defs>
            <linearGradient id={`cg-${value}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <filter id={`glow-${value}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          {/* Fill */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={`url(#cg-${value})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            filter={`url(#glow-${value})`}
            style={{
              transition: 'stroke-dashoffset 1.0s cubic-bezier(0.16,1,0.3,1)',
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>

        {/* Center value */}
        <span className="confidence-ring-val" style={{ fontSize: size * 0.22 }}>
          {value}
          <span style={{ fontSize: size * 0.14, opacity: 0.7 }}>%</span>
        </span>
      </div>

      {label && <p className="confidence-label">{label}</p>}
    </div>
  );
}
