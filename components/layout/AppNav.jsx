'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export function AppNav() {
  const pathname = usePathname();
  const { user } = useRecovery();

  // Always show all nav items — pages handle their own auth/empty states
  const desktopItems = NAV_ITEMS;
  const mobileItems  = NAV_ITEMS.filter(i => MOBILE_ITEMS.includes(i.href));

  return (
    <>
      {/* ── Desktop sticky top nav ───────────────────────────────── */}
      <nav className="app-nav-top" aria-label="App navigation">
        <div className="app-nav-top-inner">
          <Link href="/" className="app-nav-brand">
            <span className="app-nav-brand-dot pulse-glow" />
            <span>InjuryGuide</span>
          </Link>
          <div className="app-nav-links">
            {desktopItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`app-nav-link${pathname === href ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth indicator on the right */}
          <div className="app-nav-auth">
            {user ? (
              <span className="app-nav-user-dot" title={user.email} />
            ) : (
              <Link href="/" className="app-nav-signin">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile sticky bottom nav ─────────────────────────────── */}
      <nav className="app-nav-bottom" aria-label="Mobile navigation">
        {mobileItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`app-nav-bottom-item${pathname === href ? ' active' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={icon} />
            </svg>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
