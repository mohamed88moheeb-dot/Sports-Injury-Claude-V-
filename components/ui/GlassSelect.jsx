'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * GlassSelect — liquid-glass pill trigger + smooth scrollable dropdown.
 *
 * Props:
 *   value       — current value string
 *   onChange    — (value) => void
 *   options     — array of strings  OR  array of { value, label }  OR
 *                 array of { group, items: string[] | { value, label }[] }
 *   placeholder — string shown when no value selected
 *   label       — optional field label (rendered above pill)
 *   searchable  — show a type-to-search input at top of dropdown
 */
export function GlassSelect({ value, onChange, options = [], placeholder = 'Select…', label, searchable = false }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const panelRef              = useRef(null);
  const triggerRef            = useRef(null);
  const searchRef             = useRef(null);

  const flat = flattenOptions(options);
  const displayLabel = flat.find(o => o.value === value)?.label ?? value ?? '';

  const close = useCallback(() => { setOpen(false); setQuery(''); }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open, close]);

  // Focus search input when panel opens
  useEffect(() => {
    if (open && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const active = panelRef.current.querySelector('.gs-option.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }, [open]);

  function select(val) { onChange(val); close(); }

  // Filter options by query
  const filtered = query.trim()
    ? flat.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : null; // null = show all (grouped)

  return (
    <div className="gs-wrap">
      {label && <span className="gs-label">{label}</span>}
      <div className="gs-trigger-wrap">
        <button
          ref={triggerRef}
          className={`gs-trigger${open ? ' gs-trigger--open' : ''}${value ? ' gs-trigger--selected' : ''}`}
          onClick={() => setOpen(o => !o)}
          type="button"
        >
          <span className={value ? 'gs-value' : 'gs-placeholder'}>
            {value ? displayLabel : placeholder}
          </span>
          <span className="gs-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>

        {open && (
          <div ref={panelRef} className="gs-panel">
            {/* Search / type input */}
            {searchable && (
              <div className="gs-search-wrap">
                <input
                  ref={searchRef}
                  className="gs-search-input"
                  type="text"
                  placeholder="Type to search or enter a number…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      // If the query is a number, select it directly
                      const num = Number(query.trim());
                      if (!isNaN(num) && query.trim() !== '') {
                        select(String(num));
                      } else if (filtered?.length === 1) {
                        select(filtered[0].value);
                      }
                    }
                    if (e.key === 'Escape') close();
                  }}
                />
              </div>
            )}
            <div className="gs-list">
              {filtered
                ? filtered.map((o, i) => (
                    <button key={i} className={`gs-option${o.value === value ? ' active' : ''}`} onClick={() => select(o.value)} type="button">
                      {o.label}
                    </button>
                  ))
                : renderOptions(options, value, select)
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function flattenOptions(options) {
  const out = [];
  for (const o of options) {
    if (o && typeof o === 'object' && 'group' in o) {
      for (const item of o.items) out.push(normalise(item));
    } else {
      out.push(normalise(o));
    }
  }
  return out;
}

function normalise(o) {
  if (typeof o === 'string') return { value: o, label: o };
  return { value: o.value ?? o.id ?? o.label, label: o.label ?? o.value };
}

function renderOptions(options, currentValue, onSelect) {
  return options.map((o, i) => {
    if (o && typeof o === 'object' && 'group' in o) {
      return (
        <div key={i} className="gs-group">
          <div className="gs-group-label">{o.group}</div>
          {o.items.map((item, j) => {
            const { value, label } = normalise(item);
            return (
              <button key={j} className={`gs-option${value === currentValue ? ' active' : ''}`} onClick={() => onSelect(value)} type="button">
                {label}
              </button>
            );
          })}
        </div>
      );
    }
    const { value, label } = normalise(o);
    return (
      <button key={i} className={`gs-option${value === currentValue ? ' active' : ''}`} onClick={() => onSelect(value)} type="button">
        {label}
      </button>
    );
  });
}
