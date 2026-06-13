'use client';

import { useRef, useCallback, useEffect } from 'react';

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
  const dragging = useRef(false);

  const clamp = (v) => Math.min(max, Math.max(min, v));
  const snap  = (v) => Math.round(v / step) * step;

  const rawFromX = useCallback((clientX) => {
    const rect = pillRef.current.getBoundingClientRect();
    const rel  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return clamp(min + rel * (max - min));
  }, [min, max]); // eslint-disable-line

  /* ── Mouse / pen via Pointer Events ──────────────────────────────── */
  const onPointerDown = (e) => {
    // Only handle mouse/pen here — touch is handled by native touch events below
    if (e.pointerType === 'touch') return;
    e.stopPropagation();
    dragging.current = true;
    pillRef.current.setPointerCapture(e.pointerId);
    onChange(snap(rawFromX(e.clientX)));
  };
  const onPointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    if (!dragging.current) return;
    e.stopPropagation();
    onChange(rawFromX(e.clientX));
  };
  const onPointerUp = (e) => {
    if (e.pointerType === 'touch') return;
    if (!dragging.current) return;
    dragging.current = false;
    onChange(snap(rawFromX(e.clientX)));
  };

  /* ── Touch Events — registered imperatively so we can use passive:false ── */
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;

    function onTouchStart(e) {
      e.stopPropagation();
      dragging.current = true;
      // Snap on initial touch
      onChange(snap(rawFromX(e.touches[0].clientX)));
    }

    function onTouchMove(e) {
      if (!dragging.current) return;
      e.preventDefault();   // stop page scroll
      e.stopPropagation();  // stop carousel swipe
      onChange(rawFromX(e.touches[0].clientX));
    }

    function onTouchEnd(e) {
      if (!dragging.current) return;
      dragging.current = false;
      e.stopPropagation();
      onChange(snap(rawFromX(e.changedTouches[0].clientX)));
    }

    el.addEventListener('touchstart',  onTouchStart, { passive: true  });
    el.addEventListener('touchmove',   onTouchMove,  { passive: false }); // needs preventDefault
    el.addEventListener('touchend',    onTouchEnd,   { passive: true  });
    el.addEventListener('touchcancel', onTouchEnd,   { passive: true  });

    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, step]);

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
