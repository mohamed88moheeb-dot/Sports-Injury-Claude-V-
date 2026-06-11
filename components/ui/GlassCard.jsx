'use client';

/**
 * GlassCard — premium dark glass card with electric blue bottom glow.
 * Props:
 *   children
 *   className     — extra classes
 *   intense       — boolean, deeper glow variant
 *   neon          — boolean, animated rainbow border (like Image 2)
 *   padding       — CSS padding value, default undefined (uses class)
 *   onClick
 */
export function GlassCard({ children, className = '', intense = false, neon = false, padding, onClick }) {
  if (neon) {
    return (
      <div className={`neon-card ${className}`} onClick={onClick}>
        <div className="neon-card-inner" style={padding ? { padding } : {}}>
          {children}
        </div>
      </div>
    );
  }

  const classes = [
    'glow-card',
    intense ? 'glow-card-intense' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={padding ? { padding } : {}} onClick={onClick}>
      {children}
    </div>
  );
}

/**
 * GlowButton — ghost-style blue glow button (no filled background).
 * Props:
 *   children, onClick, className, disabled, type
 */
export function GlowButton({ children, onClick, className = '', disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={`glow-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * AIBadge — small "AI · LIVE" style indicator.
 */
export function AIBadge({ label = 'AI Analysis' }) {
  return (
    <div className="ai-badge">
      <span className="ai-badge-dot" />
      {label}
    </div>
  );
}
