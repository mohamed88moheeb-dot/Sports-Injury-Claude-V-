'use client';

/**
 * ScannerPanel — wraps children with a premium AI scanner aesthetic.
 * Shows an animated scan line + subtle grid pattern behind content.
 * Props:
 *   children
 *   className  — extra CSS classes
 *   padding    — inner padding (default '24px')
 */
export function ScannerPanel({ children, className = '', padding = '24px' }) {
  return (
    <div className={`scanner-panel ${className}`}>
      {/* Subtle grid overlay */}
      <div className="scanner-grid" aria-hidden="true" />
      {/* Content */}
      <div className="scanner-panel-inner" style={{ padding }}>
        {children}
      </div>
    </div>
  );
}

/**
 * AILoadingPanel — shown while plan is generating.
 * Props:
 *   title   — heading text
 *   subtitle — description text
 */
export function AILoadingPanel({ title = 'Analyzing injury pattern…', subtitle = 'Building your personalized recovery protocol.' }) {
  return (
    <div className="ai-loading-panel">
      <div className="ai-scanning-ring">
        <div className="ai-scanning-inner">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="rgba(47,140,255,0.60)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
      </div>
      <div className="ai-loading-text">
        <strong>{title}</strong>
        {subtitle}
      </div>
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--primary)',
              opacity: 0.6,
              animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
