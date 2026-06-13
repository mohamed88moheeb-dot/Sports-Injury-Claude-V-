'use client';

import { useRef, useEffect } from 'react';

/**
 * Slider — liquid-glass pill with fill, glowy thumb, dots, label & value.
 *
 * The actual control is a NATIVE <input type="range"> sitting invisibly on
 * top. Native range inputs get flawless, GPU-smooth touch dragging on every
 * mobile browser for free — no custom pointer/touch math to go wrong. The
 * pretty pill (fill / thumb / number) is painted directly to the DOM on each
 * `input` event, so visuals track the finger instantly regardless of React.
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
  const inputRef = useRef(null);
  const fillRef  = useRef(null);
  const thumbRef = useRef(null);
  const numRef   = useRef(null);
  const valRef   = useRef(null);

  const colorFor = (pct) => invertColor
    ? (pct >= 70 ? 'rgba(100,110,130,0.85)' : pct >= 40 ? '#F59316' : '#EF4444')
    : (pct >= 70 ? '#EF4444' : pct >= 40 ? '#F59316' : 'rgba(100,110,130,0.85)');

  // Paint the decorative pill straight to the DOM — instant, no React.
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

  // Keep the pill + input synced when value changes from outside (e.g. reset).
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value;
    }
    paint(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max]);

  const handleInput = (e) => {
    const v = Number(e.target.value);
    paint(v);       // instant visual
    onChange(v);    // commit to React state
  };

  // Stop the carousel from ever seeing these touches.
  const stop = (e) => e.stopPropagation();

  const pct0  = ((value - min) / (max - min)) * 100;
  const steps = Math.floor((max - min) / step);
  const DOT_COUNT = Math.min(steps - 1, 9);
  const dots = DOT_COUNT > 0
    ? Array.from({ length: DOT_COUNT }, (_, i) => ((i + 1) / (DOT_COUNT + 1)) * 100)
    : [];

  return (
    <div ref={pillRef} className="gs-pill-slider">
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

      {/* The real control — invisible, on top, native-smooth */}
      <input
        ref={inputRef}
        className="gs-pill-input"
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        onInput={handleInput}
        onChange={handleInput}
        onTouchStart={stop}
        onTouchMove={stop}
        onTouchEnd={stop}
        onPointerDown={stop}
        aria-label={label}
      />
    </div>
  );
}
