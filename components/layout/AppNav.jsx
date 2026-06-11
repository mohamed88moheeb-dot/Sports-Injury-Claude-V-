'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../../app/providers/RecoveryContext';

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { href: '/dashboard',  label: 'Dashboard',  icon: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z' },
  { href: '/assessment', label: 'Assessment', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { href: '/plan',       label: 'Plan',       icon: 'M4 6h16M4 12h16M4 18h10' },
  { href: '/check-in',   label: 'Check-in',   icon: 'M5 12l4 4L19 6' },
  { href: '/coach',      label: 'Coach',      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z' },
  { href: '/profile',    label: 'Profile',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const MOBILE_ITEMS = NAV_ITEMS.filter(i =>
  ['/', '/dashboard', '/assessment', '/plan', '/coach'].includes(i.href)
);

/* ── Desktop nav with sliding active pill ──────────────────── */
function DesktopNav({ items, pathname }) {
  const linkRefs = useRef({});
  const navRef   = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const active = linkRefs.current[pathname];
    if (!active || !navRef.current) {
      setIndicator(s => ({ ...s, opacity: 0 }));
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const rect    = active.getBoundingClientRect();
    setIndicator({ left: rect.left - navRect.left, width: rect.width, opacity: 1 });
  }, [pathname]);

  return (
    <div className="app-nav-links" ref={navRef} style={{ position: 'relative' }}>
      {/* Sliding background pill */}
      <motion.div
        className="app-nav-slide-pill"
        animate={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
        style={{ position: 'absolute', top: 0, bottom: 0, borderRadius: 999, zIndex: 0 }}
      />
      {items.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          ref={el => { if (el) linkRefs.current[href] = el; }}
          className={`app-nav-link${pathname === href ? ' active' : ''}`}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

/* ── Mobile bottom nav — click + drag/glide ─────────────────── */
function MobileNav({ items, pathname }) {
  const router     = useRouter();
  const navRef     = useRef(null);
  const isDragging = useRef(false);
  const lastHref   = useRef(null);

  /* Which item is physically under a point */
  function hrefAtPoint(x, y) {
    if (!navRef.current) return null;
    const els = navRef.current.querySelectorAll('[data-href]');
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return el.getAttribute('data-href');
      }
    }
    return null;
  }

  function onPointerDown(e) {
    isDragging.current = true;
    lastHref.current   = hrefAtPoint(e.clientX, e.clientY);
    navRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging.current) return;
    const href = hrefAtPoint(e.clientX, e.clientY);
    if (href && href !== lastHref.current) {
      lastHref.current = href;
      /* Instant visual feedback — navigation deferred to pointer-up */
    }
  }

  function onPointerUp(e) {
    if (!isDragging.current) return;
    isDragging.current = false;
    const href = hrefAtPoint(e.clientX, e.clientY) ?? lastHref.current;
    if (href) router.push(href);
    lastHref.current = null;
    try { navRef.current?.releasePointerCapture(e.pointerId); } catch {}
  }

  function onPointerCancel() {
    isDragging.current = false;
    lastHref.current   = null;
  }

  const activeIdx = items.findIndex(i => i.href === pathname);

  return (
    <nav
      className="app-nav-bottom"
      ref={navRef}
      aria-label="Mobile navigation"
      style={{ touchAction: 'none', userSelect: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* ── Sliding dark rounded-rect indicator (matches reference) ── */}
      {activeIdx >= 0 && (
        <motion.span
          layoutId="mobile-nav-pill"
          style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: `${(activeIdx / items.length) * 100}%`,
            width: `${100 / items.length}%`,
            /* Dark square-ish pill — NOT a full pill, radius ~16px like reference */
            background: 'linear-gradient(160deg, rgba(22,32,58,0.98) 0%, rgba(12,18,38,0.98) 100%)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.09), ' +
              '0 4px 20px rgba(0,0,0,0.60), ' +
              '0 0 24px rgba(47,140,255,0.12)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          transition={{ type: 'spring', stiffness: 440, damping: 34, mass: 0.65 }}
        />
      )}

      {items.map(({ href, label, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            data-href={href}
            className={`app-nav-bottom-item${isActive ? ' active' : ''}`}
            tabIndex={0}
            aria-current={isActive ? 'page' : undefined}
          >
            <motion.svg
              viewBox="0 0 24 24"
              width="23" height="23"
              fill="none"
              stroke="currentColor"
              strokeWidth={isActive ? 2.0 : 1.65}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              animate={isActive
                ? { scale: 1.1, y: -1 }
                : { scale: 1,   y: 0  }}
              transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            >
              <path d={icon} />
            </motion.svg>

            <motion.span
              animate={isActive ? { opacity: 1 } : { opacity: 0.38 }}
              transition={{ duration: 0.16 }}
              style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              {label}
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Main AppNav ────────────────────────────────────────────── */
export function AppNav() {
  const pathname = usePathname();
  const { user } = useRecovery();

  return (
    <>
      {/* Desktop sticky top nav */}
      <nav className="app-nav-top" aria-label="App navigation">
        <div className="app-nav-top-inner">
          <Link href="/" className="app-nav-brand">
            <motion.span
              className="app-nav-brand-dot"
              animate={{ boxShadow: [
                '0 0 6px rgba(47,140,255,0.6)',
                '0 0 18px rgba(47,140,255,0.9)',
                '0 0 6px rgba(47,140,255,0.6)',
              ]}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span>InjuryGuide</span>
          </Link>

          <DesktopNav items={NAV_ITEMS} pathname={pathname} />

          <div className="app-nav-auth">
            {user ? (
              <motion.span
                className="app-nav-user-dot"
                title={user.email}
                animate={{ boxShadow: [
                  '0 0 6px rgba(47,140,255,0.6)',
                  '0 0 16px rgba(47,140,255,0.9)',
                  '0 0 6px rgba(47,140,255,0.6)',
                ]}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <Link href="/" className="app-nav-signin">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile sticky bottom nav */}
      <MobileNav items={MOBILE_ITEMS} pathname={pathname} />
    </>
  );
}
