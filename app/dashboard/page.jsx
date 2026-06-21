'use client';

import { PageShell } from '../../components/layout/PageShell';
import { DashboardContent } from '../../components/sections/DashboardContent';
import { useRecovery } from '../providers/RecoveryContext';

/* Small additive RF-beta panel rendered BELOW the existing dashboard — no parallel UI. */
function RfBetaPanel({ profile }) {
  const trace = profile.rfGovernanceTrace;
  return (
    <section className="app-section" style={{ marginTop: 8 }}>
      <div className="glass-card" style={{ borderColor: 'rgba(245,158,11,0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '.04em' }}>RF Beta</span>
          <strong style={{ fontSize: 14 }}>Reviewer-gated & governance</strong>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          {(profile.rfWithheldItems?.length || 0)} exercise item(s) are withheld (high-caution or manual-review) and not auto-prescribed in beta.
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{profile.rfActivityStatement}</p>
        {trace && (
          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Why this plan?</summary>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.7 }}>
              <div><strong>Selected:</strong> {(trace.exercise_objects_selected || []).join(', ') || '—'}</div>
              <div><strong>Withheld:</strong> {(trace.exercise_objects_withheld || []).slice(0, 12).join(', ') || '—'}</div>
              <div><strong>Gap markers:</strong> {(trace.gap_markers || []).join('; ') || '—'}</div>
              <div><strong>Clinical authority created:</strong> {String(trace.clinical_authority_created)}</div>
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { profile, dashboardStats, saving, saveMessage } = useRecovery();

  return (
    <PageShell>
      <DashboardContent
        profile={profile}
        stats={dashboardStats}
        saving={saving}
        saveMessage={saveMessage}
      />
      {profile?.isRfBeta && <RfBetaPanel profile={profile} />}
    </PageShell>
  );
}
