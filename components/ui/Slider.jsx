'use client';

import { useRef, useLayoutEffect } from 'react';

/**
 * Slider — liquid-glass pill with fill, glowy thumb, dots, label & value.
 *
 * Pointer Events + pointer capture (one path for mouse/pen/touch).
 *
 * Mobile-perf critical details:
 *  • Fill moves via transform: scaleX(), thumb via translate3d() — both are
 *    GPU-composited, so dragging triggers NO layout, NO repaint, and does NOT
 *    force the pill's backdrop-filter blur to recompute every frame.
 *  • The bounding rect is measured ONCE on pointerdown and cached, so there's
 *    zero layout reflow during the drag.
 *  • State is committed once on release; the pill is painted directly to the
 *    DOM during the drag (no React re-renders).
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
  const rectRef  = useRef(null);   // cached geometry during a drag

  const clamp = (v) => Math.min(max, Math.max(min, v));
  const snap  = (v) => Math.round(v / step) * step;

  const colorFor = (pct) => invertColor
    ? (pct >= 70 ? 'rgba(100,110,130,0.85)' : pct >= 40 ? '#F59316' : '#EF4444')
    : (pct >= 70 ? '#EF4444' : pct >= 40 ? '#F59316' : 'rgba(100,110,130,0.85)');

  const rect = () => rectRef.current || pillRef.current.getBoundingClientRect();

  const valFromX = (clientX) => {
    const r = rect();
    const rel = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return clamp(min + rel * (max - min));
  };

  // Paint via transforms only — composited, no layout/paint/blur-recompute.
  const paint = (v) => {
    const ratio = (v - min) / (max - min);
    const w = rect().width;
    if (fillRef.current)  fillRef.current.style.transform = `scaleX(${ratio})`;
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate3d(${ratio * w - 1.25}px,0,0)`;
      thumbRef.current.style.opacity   = (ratio > 0 && ratio < 1) ? '1' : '0';
    }
    if (numRef.current) numRef.current.textContent = String(Math.round(v));
    if (valRef.current) valRef.current.style.color = colorFor(ratio * 100);
    pillRef.current?.querySelectorAll('.gs-pill-dot').forEach((d) => {
      d.style.opacity = (parseFloat(d.style.left) > ratio * 100 + 2) ? '' : '0';
    });
  };

  // Sync DOM to value on mount + whenever value changes externally.
  useLayoutEffect(() => {
    if (!dragging.current) paint(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max]);

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    rectRef.current = pillRef.current.getBoundingClientRect(); // measure ONCE
    dragging.current = true;
    try { pillRef.current.setPointerCapture(e.pointerId); } catch {}
    pillRef.current.classList.add('is-dragging');
    paint(valFromX(e.clientX));
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    paint(valFromX(e.clientX));   // cached rect → zero reflow
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    pillRef.current.classList.remove('is-dragging');
    try { pillRef.current.releasePointerCapture(e.pointerId); } catch {}
    const v = snap(valFromX(e.clientX));
    paint(v);
    rectRef.current = null;
    onChange(v);                  // single React commit
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   onChange(clamp(snap(value + step)));
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') onChange(clamp(snap(value - step)));
    if (e.key === 'Home') onChange(min);
    if (e.key === 'End')  onChange(max);
  };

  const ratio0 = (value - min) / (max - min);
  const steps  = Math.floor((max - min) / step);
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
      <div ref={fillRef} className="gs-pill-fill" style={{ transform: `scaleX(${ratio0})` }} />

      <div ref={thumbRef} className="gs-pill-thumb" style={{ opacity: ratio0 > 0 && ratio0 < 1 ? 1 : 0 }} aria-hidden="true" />

      {dots.map((p, i) => (
        <span key={i} className="gs-pill-dot" style={{ left: `${p}%` }} aria-hidden="true" />
      ))}

      <span className="gs-pill-label">{label}</span>

      <span ref={valRef} className="gs-pill-value" style={{ color: colorFor(ratio0 * 100) }}>
        <span ref={numRef}>{Math.round(value)}</span><span className="gs-pill-max">/{max}</span>
      </span>
    </div>
  );
}
