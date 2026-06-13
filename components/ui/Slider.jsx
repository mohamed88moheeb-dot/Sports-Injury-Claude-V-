'use client';

import { useRef, useCallback } from 'react';

export function Slider({
  label,
  value,
  onChange,
  max = 10,
  min = 0,
  step = 1,
  invertColor = false,
}) {
  const pillRef = useRef(null);
  const dragging = useRef(false);

  const clamp = (v) => Math.min(max, Math.max(min, v));
  const snap  = (v) => Math.round(v / step) * step;

  const rawFromX = useCallback((clientX) => {
    const rect = pillRef.current.getBoundingClientRect();
    const rel  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return clamp(min + rel * (max - min));
  }, [min, max]); // eslint-disable-line

  const onPointerDown = (e) => {
    dragging.current = true;
    pillRef.current.setPointerCapture(e.pointerId);
    // Snap on initial tap
    onChange(snap(rawFromX(e.clientX)));
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    // Continuous (no snap) during drag for silky glide
    onChange(rawFromX(e.clientX));
  };
  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    // Snap to step on release
    onChange(snap(rawFromX(e.clientX)));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   onChange(clamp(snap(value + step)));
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') onChange(clamp(snap(value - step)));
    if (e.key === 'Home') onChange(min);
    if (e.key === 'End')  onChange(max);
  };

  const pct   = ((value - min) / (max - min)) * 100;
  const steps = Math.floor((max - min) / step);

  // Max 9 evenly-spaced dots, only shown in the unfilled zone
  const DOT_COUNT = Math.min(steps - 1, 9);
  const dots = DOT_COUNT > 0
    ? Array.from({ length: DOT_COUNT }, (_, i) => ((i + 1) / (DOT_COUNT + 1)) * 100).filter(p => p > pct + 2)
    : [];

  const valColor = invertColor
    ? (pct >= 70 ? 'rgba(100,110,130,0.85)' : pct >= 40 ? '#F59316' : '#EF4444')
    : (pct >= 70 ? '#EF4444' : pct >= 40 ? '#F59316' : 'rgba(100,110,130,0.85)');

  return (
    <div
      ref={pillRef}
      className="gs-pill-slider"
      role="slider"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* Filled zone */}
      <div className="gs-pill-fill" style={{ width: `${pct}%` }} />

      {/* Thumb — vertical line at the boundary */}
      {pct > 0 && pct < 100 && (
        <div className="gs-pill-thumb" style={{ left: `${pct}%` }} aria-hidden="true" />
      )}

      {/* Dots in the unfilled area */}
      {dots.map((p, i) => (
        <span key={i} className="gs-pill-dot" style={{ left: `${p}%` }} aria-hidden="true" />
      ))}

      {/* Label */}
      <span className="gs-pill-label">{label}</span>

      {/* Value */}
      <span className="gs-pill-value" style={{ color: valColor }}>
        {Math.round(value)}<span className="gs-pill-max">/{max}</span>
      </span>
    </div>
  );
}
