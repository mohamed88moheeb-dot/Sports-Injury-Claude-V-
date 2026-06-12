'use client';

import { useRouter } from 'next/navigation';
import { AuthCard } from '../components/layout/AuthCard';
import { PageShell } from '../components/layout/PageShell';
import { DashboardContent } from '../components/sections/DashboardContent';
import { useRecovery } from './providers/RecoveryContext';
import { hasSupabase } from '../lib/supabaseClient';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    label: 'AI body scanner',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    label: 'Criteria-based progression',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: 'Daily rehab sessions',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    label: 'Progress tracking',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const {
    user, signOut,
    authMode, setAuthMode,
    authForm, setAuthForm,
    handleAuth, authMessage, authLoading,
    profile,
  } = useRecovery();

  // Signed-in users with a profile see the dashboard on home
  if (profile) {
    return (
      <PageShell>
        <DashboardContent profile={profile} />
      </PageShell>
    );
  }

  return (
    <PageShell>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-card app-section app-section-hero" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Scan line animation */}
        <div className="hero-scan-line" />

        {/* Blue beam */}
        <div className="hero-beam" />

        {/* AI badge */}
        <div className="hero-copy-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="ai-badge">
              <span className="ai-badge-dot" />
              AI-powered
            </div>
            <p className="eyebrow stacked-eyebrow" style={{ margin: 0 }}>
              Evidence Driven
            </p>
          </div>

          <h2 style={{ lineHeight: 1.0, marginBottom: 12 }}>
            Build a plan<br />
            around the injury<br />
            <span style={{ color: 'var(--primary)' }}>you actually have.</span>
          </h2>

          <p className="hero-copy" style={{ maxWidth: 480 }}>
            A precision recovery workspace — AI-assessed, criteria-based, and adapted to your body,
            sport demands, and recovery stage.
          </p>

          {/* Feature pills */}
          <div className="hero-points" style={{ marginTop: 20 }}>
            {FEATURES.map(f => (
              <span key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--primary)' }}>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>

          {/* CTA — signed in */}
          {user && (
            <div className="hero-cta-row">
              {profile ? (
                <button className="primary-btn hero-cta-btn" onClick={() => router.push('/dashboard')}>
                  Continue recovery →
                </button>
              ) : (
                <button className="primary-btn hero-cta-btn" onClick={() => router.push('/assessment')}>
                  Start assessment →
                </button>
              )}
              <button className="secondary-btn" onClick={() => router.push('/dashboard')}>
                Go to dashboard
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Auth — only shown when signed out ────────────────────────── */}
      {!user && (
        <AuthCard
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          handleAuth={handleAuth}
          authMessage={authMessage}
          authLoading={authLoading}
        />
      )}
    </PageShell>
  );
}
