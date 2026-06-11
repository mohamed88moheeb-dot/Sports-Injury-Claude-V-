'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export function MultiSelectDropdown({ options, selected, onToggle, placeholder }) {
  const [open, setOpen]             = useState(false);
  const [panelStyle, setPanelStyle] = useState({});
  const [mounted, setMounted]       = useState(false);
  const triggerRef = useRef(null);
  const panelRef   = useRef(null);

  /* Only run portal on client */
  useEffect(() => { setMounted(true); }, []);

  /* Position panel relative to trigger using fixed coords — escapes any stacking context */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top:   r.bottom + 6,
      left:  r.left,
      width: r.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function onDown(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current   && !panelRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  const label =
    selected.length === 0 ? placeholder
    : selected.length === 1 ? selected[0]
    : `${selected[0]} +${selected.length - 1} more`;

  const panel = (
    <div className="msd-panel" ref={panelRef} style={panelStyle}>
      <div className="msd-options">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`msd-option${active ? ' active' : ''}`}
              onMouseDown={e => e.stopPropagation()}
              onClick={() => onToggle(opt)}
            >
              <span className="msd-check">{active ? '✓' : ''}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="msd-footer">
          <span>{selected.length} selected</span>
          <button
            type="button"
            className="msd-clear"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => selected.forEach(s => onToggle(s))}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`msd-wrap${open ? ' msd-open' : ''}`}>
      <button
        type="button"
        className="msd-trigger"
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected.length ? 'msd-trigger-text has-value' : 'msd-trigger-text'}>
          {label}
        </span>
        <svg className="msd-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Render panel via portal → sits in document.body, outside every stacking context */}
      {open && mounted && createPortal(panel, document.body)}
    </div>
  );
}
