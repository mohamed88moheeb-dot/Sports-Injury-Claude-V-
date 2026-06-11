'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/layout/PageShell';
import { useRecovery } from '../providers/RecoveryContext';
import { hasSupabase } from '../../lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, profile, checkins, saving, saveMessage } = useRecovery();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <PageShell>
      <section className="app-section app-section-soft">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your account</p>
            <h2>Profile</h2>
          </div>
        </div>

        <div className="profile-cards">
          <div className="glass-card profile-account-card">
            <p className="eyebrow">Account</p>
            <div className="account-pill" style={{ marginBottom: '1rem' }}>
              <span className={hasSupabase ? 'dot online' : 'dot offline'} />
              <span>
                {user ? user.email : hasSupabase ? 'Not signed in' : 'Supabase not connected'}
              </span>
            </div>
            <p className="small-label">
              Save status: {saving ? 'Saving…' : saveMessage || 'Synced'}
            </p>
            {user && (
              <button
                className="primary-btn"
                style={{ marginTop: '1.5rem' }}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            )}
            {!user && (
              <button
                className="primary-btn"
                style={{ marginTop: '1.5rem' }}
                onClick={() => router.push('/')}
              >
                Sign in
              </button>
            )}
          </div>

          {profile && (
            <div className="glass-card profile-injury-card">
              <p className="eyebrow">Current injury</p>
              <h3>{profile.regionName}</h3>
              <p>{profile.gradeName} · {profile.mechanism}</p>
              <p className="small-label" style={{ marginTop: '0.5rem' }}>
                Expected return: {profile.returnRange}
              </p>
              <button
                className="secondary-btn"
                style={{ marginTop: '1rem' }}
                onClick={() => router.push('/assessment')}
              >
                Update assessment
              </button>
            </div>
          )}

          {checkins.length > 0 && (
            <div className="glass-card profile-history-card">
              <p className="eyebrow">Check-in history</p>
              <h3>{checkins.length} {checkins.length === 1 ? 'entry' : 'entries'}</h3>
              <div className="history-list" style={{ marginTop: '1rem' }}>
                {checkins.slice(0, 5).map((c) => (
                  <div className="history-item" key={c.id}>
                    <strong>{c.date}</strong>
                    <span>Pain {c.pain}/10 · Confidence {c.confidence}%</span>
                    <p>{c.response}</p>
                  </div>
                ))}
              </div>
              {checkins.length > 5 && (
                <button
                  className="text-btn"
                  onClick={() => router.push('/check-in')}
                  style={{ marginTop: '0.5rem' }}
                >
                  View all check-ins →
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
