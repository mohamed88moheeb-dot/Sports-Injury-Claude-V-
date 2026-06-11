'use client';

import { useRouter } from 'next/navigation';
import HumanFrontIcon from '../components/HumanFrontIcon';
import { AuthCard } from '../components/layout/AuthCard';
import { PageShell } from '../components/layout/PageShell';
import { useRecovery } from './providers/RecoveryContext';
import { hasSupabase } from '../lib/supabaseClient';

export default function LandingPage() {
  const router = useRouter();
  const {
    user, signOut,
    authMode, setAuthMode,
    authForm, setAuthForm,
    handleAuth, authMessage, authLoading,
    profile,
  } = useRecovery();

  return (
    <PageShell>
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="topbar glass-panel">
        <div className="brand-lockup">
          <HumanFrontIcon size="medium" />
          <div>
            <p className="eyebrow full-line">Personal Recovery System</p>
            <h3 className="hero-title full-line">Injury Guide</h3>
          </div>
        </div>
        <div className="top-actions">
          <div className="account-pill">
            <span className={hasSupabase ? 'dot online' : 'dot offline'} />
            <span>
              {user ? user.email : hasSupabase ? 'Not signed in' : 'Supabase setup needed'}
            </span>
          </div>
          {user && (
            <button className="ghost-btn small" onClick={signOut}>
              Sign out
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero-card app-section app-section-hero">
        <div className="hero-copy-wrap">
          <p className="eyebrow stacked-eyebrow">
            <span>Evidence Driven</span>
          </p>
          <h2>Build a plan around the injury you actually have.</h2>
          <p className="hero-copy">
            A calm recovery workspace for assessment, day-by-day rehab, progress tracking,
            check-ins, and return-to-sport decisions.
          </p>
          <div className="hero-points">
            <span>Criteria-based progression</span>
            <span>Saved progress</span>
            <span>Daily sessions</span>
          </div>

          {/* Signed-in CTA — replaces auth section */}
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
