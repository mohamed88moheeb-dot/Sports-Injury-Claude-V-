'use client';

import { useRef, useEffect, useLayoutEffect } from 'react';

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

  // Always-fresh refs — updated every render so touch handlers never go stale
  const minRef      = useRef(min);
  const maxRef      = useRef(max);
  const stepRef     = useRef(step);
  const onChangeRef = useRef(onChange);

  // useLayoutEffect runs synchronously before paint — zero lag on fast drags
  useLayoutEffect(() => {
    minRef.current      = min;
    maxRef.current      = max;
    stepRef.current     = step;
    onChangeRef.current = onChange;
  });

  // Pure helpers — read from refs so they're always current inside closures
  function clamp(v)    { return Math.min(maxRef.current, Math.max(minRef.current, v)); }
  function snapVal(v)  { return Math.round(v / stepRef.current) * stepRef.current; }
  function rawFromX(clientX) {
    const rect = pillRef.current.getBoundingClientRect();
    const rel  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return clamp(minRef.current + rel * (maxRef.current - minRef.current));
  }

  /* ── Native touch events (non-passive so preventDefault works) ────── */
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;

    function onTouchStart(e) {
      e.stopPropagation();
      dragging.current = true;
      onChangeRef.current(snapVal(rawFromX(e.touches[0].clientX)));
    }

    function onTouchMove(e) {
      if (!dragging.current) return;
      e.preventDefault();  // block page scroll
      e.stopPropagation(); // block carousel
      // Continuous (no snap) during drag for silky feel
      onChangeRef.current(rawFromX(e.touches[0].clientX));
    }

    function onTouchEnd(e) {
      if (!dragging.current) return;
      dragging.current = false;
      e.stopPropagation();
      onChangeRef.current(snapVal(rawFromX(e.changedTouches[0].clientX)));
    }

    el.addEventListener('touchstart',  onTouchStart, { passive: true  });
    el.addEventListener('touchmove',   onTouchMove,  { passive: false });
    el.addEventListener('touchend',    onTouchEnd,   { passive: true  });
    el.addEventListener('touchcancel', onTouchEnd,   { passive: true  });

    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []); // mount/unmount only — refs keep everything fresh

  /* ── Mouse / pen via Pointer Events ──────────────────────────────── */
  function onPointerDown(e) {
    if (e.pointerType === 'touch') return; // touch handled above
    e.stopPropagation();
    dragging.current = true;
    pillRef.current.setPointerCapture(e.pointerId);
    onChangeRef.current(snapVal(rawFromX(e.clientX)));
  }
  function onPointerMove(e) {
    if (e.pointerType === 'touch' || !dragging.current) return;
    e.stopPropagation();
    onChangeRef.current(rawFromX(e.clientX));
  }
  function onPointerUp(e) {
    if (e.pointerType === 'touch' || !dragging.current) return;
    dragging.current = false;
    onChangeRef.current(snapVal(rawFromX(e.clientX)));
  }

  /* ── Keyboard ─────────────────────────────────────────────────────── */
  function onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   onChange(clamp(snapVal(value + step)));
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') onChange(clamp(snapVal(value - step)));
    if (e.key === 'Home') onChange(min);
    if (e.key === 'End')  onChange(max);
  }

  /* ── Derived display values ───────────────────────────────────────── */
  const pct   = ((value - min) / (max - min)) * 100;
  const steps = Math.floor((max - min) / step);

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
      <div className="gs-pill-fill" style={{ width: `${pct}%` }} />

      {pct > 0 && pct < 100 && (
        <div className="gs-pill-thumb" style={{ left: `${pct}%` }} aria-hidden="true" />
      )}

      {dots.map((p, i) => (
        <span key={i} className="gs-pill-dot" style={{ left: `${p}%` }} aria-hidden="true" />
      ))}

      <span className="gs-pill-label">{label}</span>

      <span className="gs-pill-value" style={{ color: valColor }}>
        {Math.round(value)}<span className="gs-pill-max">/{max}</span>
      </span>
    </div>
  );
}
