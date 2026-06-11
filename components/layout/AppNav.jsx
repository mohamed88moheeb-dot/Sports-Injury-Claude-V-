'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const MOBILE_ITEMS = ['/', '/dashboard', '/assessment', '/plan', '/coach'];

/* ── Desktop nav with sliding active pill ──────────────────── */
function DesktopNav({ items, pathname }) {
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef(null);

  useEffect(() => {
    const active = linkRefs.current[pathname];
    if (!active || !navRef.current) {
      setIndicator(s => ({ ...s, opacity: 0 }));
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
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

/* ── Mobile bottom nav with sliding pill indicator ──────────── */
function MobileNav({ items, pathname }) {
  return (
    <nav className="app-nav-bottom" aria-label="Mobile navigation" style={{ position: 'relative' }}>
      {/* Sliding background pill — layoutId makes it physically glide between items */}
      <AnimatePresence>
        {items.map(({ href }) => href === pathname && (
          <motion.span
            key="mobile-pill"
            layoutId="mobile-active-pill"
            style={{
              position: 'absolute',
              top: '50%', translateY: '-50%',
              height: 48,
              borderRadius: 14,
              background: 'rgba(47,140,255,0.13)',
              border: '1px solid rgba(47,140,255,0.25)',
              boxShadow: '0 0 18px rgba(47,140,255,0.18)',
              pointerEvents: 'none',
              width: `${100 / items.length}%`,
              left: `${(items.findIndex(i => i.href === pathname) / items.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
          />
        ))}
      </AnimatePresence>

      {items.map(({ href, label, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`app-nav-bottom-item${isActive ? ' active' : ''}`}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.svg
                viewBox="0 0 24 24"
                width="22" height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                animate={isActive
                  ? { scale: 1.2, y: -2, filter: 'drop-shadow(0 0 8px rgba(47,140,255,0.7))' }
                  : { scale: 1,   y: 0,  filter: 'drop-shadow(0 0 0px transparent)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              >
                <path d={icon} />
              </motion.svg>
            </span>

            <motion.span
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.45, y: 1 }}
              transition={{ duration: 0.2 }}
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

  const desktopItems = NAV_ITEMS;
  const mobileItems  = NAV_ITEMS.filter(i => MOBILE_ITEMS.includes(i.href));

  return (
    <>
      {/* ── Desktop sticky top nav ───────────────────────────── */}
      <nav className="app-nav-top" aria-label="App navigation">
        <div className="app-nav-top-inner">
          <Link href="/" className="app-nav-brand">
            <motion.span
              className="app-nav-brand-dot"
              animate={{ boxShadow: ['0 0 6px rgba(47,140,255,0.6)', '0 0 18px rgba(47,140,255,0.9)', '0 0 6px rgba(47,140,255,0.6)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span>InjuryGuide</span>
          </Link>

          <DesktopNav items={desktopItems} pathname={pathname} />

          {/* Auth indicator */}
          <div className="app-nav-auth">
            {user ? (
              <motion.span
                className="app-nav-user-dot"
                title={user.email}
                animate={{ boxShadow: ['0 0 6px rgba(47,140,255,0.6)', '0 0 16px rgba(47,140,255,0.9)', '0 0 6px rgba(47,140,255,0.6)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <Link href="/" className="app-nav-signin">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile sticky bottom nav ─────────────────────────── */}
      <MobileNav items={mobileItems} pathname={pathname} />
    </>
  );
}
