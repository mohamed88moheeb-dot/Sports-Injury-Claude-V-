'use client';

import { useRef, useEffect } from 'react';

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

  const dragging    = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /* ── Pure helpers ─────────────────────────────────────────────────── */
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const snap  = (v) => Math.round(v / step) * step;

  const colorFor = (pct) => invertColor
    ? (pct >= 70 ? 'rgba(100,110,130,0.85)' : pct >= 40 ? '#F59316' : '#EF4444')
    : (pct >= 70 ? '#EF4444' : pct >= 40 ? '#F59316' : 'rgba(100,110,130,0.85)');

  /* ── All drag logic lives in one mount-only effect ────────────────── */
  /* Refs keep it fresh; DOM is painted directly so there are ZERO React */
  /* re-renders during a drag — buttery smooth on mobile.                */
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;

    function valFromX(clientX) {
      const rect = el.getBoundingClientRect();
      const rel  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return clamp(min + rel * (max - min));
    }

    // Paint fill / thumb / number straight to the DOM — no setState
    function paint(v) {
      const pct = ((v - min) / (max - min)) * 100;
      if (fillRef.current)  fillRef.current.style.width = pct + '%';
      if (thumbRef.current) {
        thumbRef.current.style.left    = pct + '%';
        thumbRef.current.style.opacity = (pct > 0 && pct < 100) ? '1' : '0';
      }
      if (numRef.current) numRef.current.textContent = String(Math.round(v));
      if (valRef.current) valRef.current.style.color = colorFor(pct);
      // Hide dots swallowed by the fill
      el.querySelectorAll('.gs-pill-dot').forEach((dot) => {
        dot.style.opacity = (parseFloat(dot.style.left) > pct + 2) ? '' : '0';
      });
    }

    function begin(clientX) {
      dragging.current = true;
      el.classList.add('is-dragging');
      paint(valFromX(clientX));
    }
    function move(clientX) {
      if (!dragging.current) return;
      paint(valFromX(clientX));            // DOM only — silky
    }
    function finish(clientX) {
      if (!dragging.current) return;
      dragging.current = false;
      el.classList.remove('is-dragging');
      const v = snap(valFromX(clientX));
      paint(v);
      onChangeRef.current(v);              // single React commit on release
    }

    /* Pointer events — mouse / pen only */
    function onPointerDown(e) {
      if (e.pointerType === 'touch') return;
      e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch {}
      begin(e.clientX);
    }
    function onPointerMove(e) {
      if (e.pointerType === 'touch') return;
      e.stopPropagation();
      move(e.clientX);
    }
    function onPointerUp(e) {
      if (e.pointerType === 'touch') return;
      finish(e.clientX);
    }

    /* Touch events — non-passive so we can block scroll + carousel */
    function onTouchStart(e) {
      e.stopPropagation();
      begin(e.touches[0].clientX);
    }
    function onTouchMove(e) {
      if (!dragging.current) return;
      e.preventDefault();   // block page scroll
      e.stopPropagation();  // block carousel swipe
      move(e.touches[0].clientX);
    }
    function onTouchEnd(e) {
      e.stopPropagation();
      finish(e.changedTouches[0].clientX);
    }

    el.addEventListener('pointerdown',  onPointerDown);
    el.addEventListener('pointermove',  onPointerMove);
    el.addEventListener('pointerup',    onPointerUp);
    el.addEventListener('pointercancel',onPointerUp);
    el.addEventListener('touchstart',   onTouchStart, { passive: true  });
    el.addEventListener('touchmove',    onTouchMove,  { passive: false });
    el.addEventListener('touchend',     onTouchEnd,   { passive: true  });
    el.addEventListener('touchcancel',  onTouchEnd,   { passive: true  });

    return () => {
      el.removeEventListener('pointerdown',  onPointerDown);
      el.removeEventListener('pointermove',  onPointerMove);
      el.removeEventListener('pointerup',    onPointerUp);
      el.removeEventListener('pointercancel',onPointerUp);
      el.removeEventListener('touchstart',   onTouchStart);
      el.removeEventListener('touchmove',    onTouchMove);
      el.removeEventListener('touchend',     onTouchEnd);
      el.removeEventListener('touchcancel',  onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, step, invertColor]);

  /* ── Keep DOM in sync when value changes externally (e.g. reset) ──── */
  useEffect(() => {
    if (dragging.current) return; // never fight an active drag
    const pct = ((value - min) / (max - min)) * 100;
    if (fillRef.current)  fillRef.current.style.width = pct + '%';
    if (thumbRef.current) {
      thumbRef.current.style.left    = pct + '%';
      thumbRef.current.style.opacity = (pct > 0 && pct < 100) ? '1' : '0';
    }
    if (numRef.current) numRef.current.textContent = String(Math.round(value));
    if (valRef.current) valRef.current.style.color = colorFor(pct);
    pillRef.current?.querySelectorAll('.gs-pill-dot').forEach((dot) => {
      dot.style.opacity = (parseFloat(dot.style.left) > pct + 2) ? '' : '0';
    });
  }, [value, min, max]); // eslint-disable-line

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   onChange(clamp(snap(value + step)));
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') onChange(clamp(snap(value - step)));
    if (e.key === 'Home') onChange(min);
    if (e.key === 'End')  onChange(max);
  };

  /* ── Initial render values (DOM then driven imperatively) ─────────── */
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
