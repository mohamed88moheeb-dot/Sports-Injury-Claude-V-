'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useRecovery } from '../../app/providers/RecoveryContext';
import { hasSupabase } from '../../lib/supabaseClient';
import { AnimatedTendonLogo } from '../brand/AnimatedTendonLogo';

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { href: '/dashboard',  label: 'Dashboard',  icon: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z' },
  { href: '/assessment', label: 'Assessment', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { href: '/plan',       label: 'Plan',       icon: 'M4 6h16M4 12h16M4 18h10' },
  { href: '/check-in',   label: 'Check-in',   icon: 'M5 12l4 4L19 6' },
  { href: '/coach',      label: 'Coach',      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z' },
  { href: '/profile',    label: 'Profile',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const MOBILE_ITEMS = ['/', '/assessment', '/plan', '/dashboard', '/coach']
  .map(href => NAV_ITEMS.find(i => i.href === href))
  .filter(Boolean);

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

/* ── Mobile bottom nav ──────────────────────────────────────── */
/*
 * Architecture: useMotionValue drives the pill's CSS `left` directly —
 * zero React re-renders during drag. Only `activeIdx` (React state) updates
 * once per item-crossing to re-paint icon/label colours.
 * Hit-testing is pure math (O(1)), not DOM queries.
 */
function MobileNav({ items, pathname }) {
  const router     = useRouter();
  const navRef     = useRef(null);
  const n          = items.length;

  // Index of currently highlighted item
  const pathnameIdx = items.findIndex(i => i.href === pathname);
  const [activeIdx, setActiveIdx] = useState(pathnameIdx >= 0 ? pathnameIdx : 0);

  // Direct DOM motion value — unit: % of nav width  (0 … (n-1)/n * 100)
  const pillLeft = useMotionValue(`${(activeIdx / n) * 100}%`);

  // Snap pill to index, optionally animated
  const snapToIdx = (idx, spring = true) => {
    const target = `${(idx / n) * 100}%`;
    if (spring) {
      animate(pillLeft, target, { type: 'spring', stiffness: 520, damping: 36, mass: 0.55 });
    } else {
      pillLeft.set(target);
    }
  };

  // Keep pill synced when pathname changes (page navigation)
  useEffect(() => {
    const idx = items.findIndex(i => i.href === pathname);
    if (idx >= 0) {
      setActiveIdx(idx);
      snapToIdx(idx, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Pure-math hit test: which slot is rawX inside?
  const idxAtX = (rawX) => {
    if (!navRef.current) return -1;
    const { left, width } = navRef.current.getBoundingClientRect();
    const rel = (rawX - left) / width;           // 0 … 1
    return Math.max(0, Math.min(n - 1, Math.floor(rel * n)));
  };

  // Drag state — all in refs so nothing goes through React during move
  const dragging   = useRef(false);
  const startX     = useRef(0);
  const lastIdx    = useRef(activeIdx);
  const didMove    = useRef(false);

  function onPointerDown(e) {
    dragging.current = true;
    didMove.current  = false;
    startX.current   = e.clientX;
    lastIdx.current  = activeIdx;
    navRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    // Mark as a drag once finger moves > 4px
    if (Math.abs(e.clientX - startX.current) > 4) didMove.current = true;

    const idx = idxAtX(e.clientX);
    if (idx < 0) return;

    // Move pill directly — NO React state, pure DOM
    pillLeft.set(`${(idx / n) * 100}%`);

    // Update icon colours only when crossing a new slot boundary
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      setActiveIdx(idx);   // single cheap re-render per slot crossing
    }
  }

  function onPointerUp(e) {
    if (!dragging.current) return;
    dragging.current = false;

    const idx = idxAtX(e.clientX);
    const finalIdx = idx >= 0 ? idx : lastIdx.current;

    // Spring-snap pill to slot centre
    snapToIdx(finalIdx, true);
    setActiveIdx(finalIdx);

    // Navigate — always on tap/release (whether drag or tap)
    const href = items[finalIdx]?.href;
    if (href) router.push(href);

    try { navRef.current?.releasePointerCapture(e.pointerId); } catch {}
  }

  function onPointerCancel() {
    if (!dragging.current) return;
    dragging.current = false;
    // Snap back to current pathname
    const idx = items.findIndex(i => i.href === pathname);
    if (idx >= 0) { snapToIdx(idx, true); setActiveIdx(idx); }
  }

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
      {/* Pill driven by motion value — zero re-renders during drag */}
      <motion.span
        style={{
          position: 'absolute',
          top: 4, bottom: 4,
          left: pillLeft,
          width: `${100 / n}%`,
          background: 'rgba(255,255,255,0.28)',
          borderRadius: 9999,
          border: '1px solid rgba(255,255,255,0.60)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.70), ' +
            '0 2px 12px rgba(47,140,255,0.18)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {items.map(({ href, label, icon }, i) => {
        const isActive = activeIdx === i;
        return (
          <span
            key={href}
            data-href={href}
            className={`app-nav-bottom-item${isActive ? ' active' : ''}`}
            role="link"
            tabIndex={0}
            aria-current={isActive ? 'page' : undefined}
          >
            <motion.svg
              viewBox="0 0 24 24"
              width="23" height="23"
              fill="none"
              stroke="currentColor"
              strokeWidth={isActive ? 2.1 : 1.65}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              animate={isActive ? { scale: 1.12, y: -1 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 560, damping: 28 }}
            >
              <path d={icon} />
            </motion.svg>
            <motion.span
              animate={{ opacity: isActive ? 1 : 0.38 }}
              transition={{ duration: 0.14 }}
              style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              {label}
            </motion.span>
          </span>
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
            <AnimatedTendonLogo size={40} />
            <span>InjuryGuide</span>
          </Link>

          <DesktopNav items={NAV_ITEMS} pathname={pathname} />

          <div className="app-nav-auth">
            {!hasSupabase && (
              <div className="account-pill" style={{ fontSize: 12 }}>
                <span className="dot offline" />
                <span>Supabase setup needed</span>
              </div>
            )}
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
