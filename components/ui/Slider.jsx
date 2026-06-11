'use client';

export function Slider({ label, value, onChange, max = 10 }) {
  const pct = (value / max) * 100;

  // Gradient: filled portion is electric blue, unfilled is dark
  const trackStyle = {
    background: `linear-gradient(to right,
      #2F8CFF 0%,
      #38BDF8 ${pct}%,
      rgba(255,255,255,0.10) ${pct}%,
      rgba(255,255,255,0.10) 100%
    )`,
    // Smooth gradient transitions as value changes
    transition: 'background 0.25s cubic-bezier(0.34,1.56,0.64,1)',
  };

  // Color the value readout based on level
  const valueColor =
    pct >= 70 ? '#EF4444' :   // high pain → red
    pct >= 40 ? '#F97316' :   // mid pain → orange
    '#2F8CFF';                 // low → blue

  return (
    <label className="slider slider-premium">
      <span className="slider-header">
        <span className="slider-label">{label}</span>
        <strong className="slider-val" style={{ color: valueColor }}>
          {value}<span className="slider-max">/{max}</span>
        </strong>
      </span>

      {/* Pain level indicator dots */}
      <div className="slider-track-wrap">
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={trackStyle}
        />
      </div>

      {/* Min/max labels */}
      <div className="slider-extremes">
        <span>No pain</span>
        <span>Severe</span>
      </div>
    </label>
  );
}
