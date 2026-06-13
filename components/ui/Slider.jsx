'use client';

import { useRef } from 'react';

/**
 * Slider — liquid-glass pill with fill, glowy thumb, dots, label & value.
 *
 * Uses POINTER EVENTS with pointer capture: one unified code path for mouse,
 * pen and touch. You can grab anywhere on the pill and it drag-follows. The
 * pill is painted directly to the DOM during the drag (zero React re-renders)
 * and committed to state once on release — smooth on every device.
 */
export function Slider({
  label,
  value,
  onChange,
  max = 10,
  min = 0,
  step = 1,
  invertColor = false,
}) {
  const pillRef  = useRef(null);
  const fillRef  = useRef(null);
  const thumbRef = useRef(null);
  const numRef   = useRef(null);
  const valRef   = useRef(null);
  const dragging = useRef(false);

  const clamp = (v) => Math.min(max, Math.max(min, v));
  const snap  = (v) => Math.round(v / step) * step;

  const colorFor = (pct) => invertColor
    ? (pct >= 70 ? 'rgba(100,110,130,0.85)' : pct >= 40 ? '#F59316' : '#EF4444')
    : (pct >= 70 ? '#EF4444' : pct >= 40 ? '#F59316' : 'rgba(100,110,130,0.85)');

  const valFromX = (clientX) => {
    const rect = pillRef.current.getBoundingClientRect();
    const rel  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return clamp(min + rel * (max - min));
  };

  // Paint straight to the DOM — instant, no React re-render.
  const paint = (v) => {
    const pct = ((v - min) / (max - min)) * 100;
    if (fillRef.current)  fillRef.current.style.width = pct + '%';
    if (thumbRef.current) {
      thumbRef.current.style.left    = pct + '%';
      thumbRef.current.style.opacity = (pct > 0 && pct < 100) ? '1' : '0';
    }
    if (numRef.current) numRef.current.textContent = String(Math.round(v));
    if (valRef.current) valRef.current.style.color = colorFor(pct);
    pillRef.current?.querySelectorAll('.gs-pill-dot').forEach((d) => {
      d.style.opacity = (parseFloat(d.style.left) > pct + 2) ? '' : '0';
    });
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    try { pillRef.current.setPointerCapture(e.pointerId); } catch {}
    pillRef.current.classList.add('is-dragging');
    paint(valFromX(e.clientX));
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    paint(valFromX(e.clientX));        // DOM only — silky
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    pillRef.current.classList.remove('is-dragging');
    try { pillRef.current.releasePointerCapture(e.pointerId); } catch {}
    const v = snap(valFromX(e.clientX));
    paint(v);
    onChange(v);                        // single React commit on release
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   onChange(clamp(snap(value + step)));
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') onChange(clamp(snap(value - step)));
    if (e.key === 'Home') onChange(min);
    if (e.key === 'End')  onChange(max);
  };

  const pct0  = ((value - min) / (max - min)) * 100;
  const steps = Math.floor((max - min) / step);
  const DOT_COUNT = Math.min(steps - 1, 9);
  const dots = DOT_COUNT > 0
    ? Array.from({ length: DOT_COUNT }, (_, i) => ((i + 1) / (DOT_COUNT + 1)) * 100)
    : [];

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
      style={{ touchAction: 'none' }}
    >
      <div ref={fillRef} className="gs-pill-fill" style={{ width: `${pct0}%` }} />

      <div
        ref={thumbRef}
        className="gs-pill-thumb"
        style={{ left: `${pct0}%`, opacity: pct0 > 0 && pct0 < 100 ? 1 : 0 }}
        aria-hidden="true"
      />

      {dots.map((p, i) => (
        <span key={i} className="gs-pill-dot" style={{ left: `${p}%` }} aria-hidden="true" />
      ))}

      <span className="gs-pill-label">{label}</span>

      <span ref={valRef} className="gs-pill-value" style={{ color: colorFor(pct0) }}>
        <span ref={numRef}>{Math.round(value)}</span><span className="gs-pill-max">/{max}</span>
      </span>
    </div>
  );
}
