'use client';

import { useEffect, useRef, useState } from 'react';

export function MultiSelectDropdown({ options, selected, onToggle, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? selected[0]
      : `${selected[0]} +${selected.length - 1} more`;

  return (
    <div className={`msd-wrap${open ? ' msd-open' : ''}`} ref={ref}>
      <button type="button" className="msd-trigger" onClick={() => setOpen((o) => !o)}>
        <span className={selected.length ? 'msd-trigger-text has-value' : 'msd-trigger-text'}>
          {label}
        </span>
        <svg className="msd-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="msd-panel">
          <div className="msd-options">
            {options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className={`msd-option${active ? ' active' : ''}`}
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
                onClick={() => selected.forEach((s) => onToggle(s))}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
