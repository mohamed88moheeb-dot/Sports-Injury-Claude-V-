'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/layout/PageShell';
import { useRecovery } from '../providers/RecoveryContext';
import { ConfidenceMeter } from '../../components/ui/ConfidenceMeter';
import { AIBadge } from '../../components/ui/GlassCard';

/* Map grade/status → confidence % */
function inferConfidence(profile) {
  if (!profile) return 0;
  const g = (profile.gradeName || '').toLowerCase();
  if (g.includes('mild') || g.includes('grade 1')) return 82;
  if (g.includes('moderate') || g.includes('grade 2')) return 74;
  if (g.includes('severe') || g.includes('grade 3')) return 61;
  return 70;
}

function RiskTag({ profile }) {
  const isHigh = profile.returnRange?.includes('medical review');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      background: isHigh ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
      border: `1px solid ${isHigh ? 'rgba(239,68,68,0.32)' : 'rgba(34,197,94,0.30)'}`,
      color: isHigh ? '#EF4444' : '#22C55E',
      fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: isHigh ? '#EF4444' : '#22C55E',
        boxShadow: isHigh ? '0 0 6px rgba(239,68,68,0.7)' : '0 0 6px rgba(34,197,94,0.7)',
      }} />
      {isHigh ? 'Higher Risk' : 'Standard Risk'}
    </span>
  );
}

export default function DiagnosisPage() {
  const router = useRouter();
  const { profile, assessment } = useRecovery();
  const confidence = inferConfidence(profile);

  return (
    <PageShell>
      <section className="app-section app-section-soft">

        {/* ── Header ──────────────────────────────────── */}
        <div className="section-heading" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Injury pattern</p>
              <AIBadge label="AI Analysis" />
            </div>
            <h2>Likely diagnosis</h2>
            <p style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: 15 }}>
              Based on your location, mechanism, symptoms, and pain pattern.
            </p>
          </div>
        </div>

        {!profile ? (
          <div className="empty-state glass-card">
            <h3>No assessment yet.</h3>
            <p>Complete the assessment first to see your likely injury pattern.</p>
            <button className="primary-btn" onClick={() => router.push('/assessment')}>
              Start assessment
            </button>
          </div>
        ) : (
          <div className="diagnosis-cards">

            {/* ── Primary diagnosis card ──────────────── */}
            <div className="glow-card glow-card-intense" style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              {/* Confidence meter */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <ConfidenceMeter value={confidence} label="Match score" size={110} />
                <RiskTag profile={profile} />
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <p className="eyebrow" style={{ marginBottom: 8 }}>Primary region</p>
                <h3 style={{ fontSize: 26, marginBottom: 6 }}>{profile.regionName}</h3>
                <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 12 }}>
                  {profile.gradeName} · {profile.mechanism}
                </p>

                {profile.exactAreaName !== 'General area' && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 999,
                    background: 'var(--primary-dim)',
                    border: '1px solid rgba(47,140,255,0.25)',
                    fontSize: 12, fontWeight: 600, color: 'var(--primary)',
                  }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    </svg>
                    Specific area: {profile.exactAreaName}
                  </div>
                )}

                {/* AI status */}
                {profile.aiStatus && (
                  <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, padding: '10px 14px', background: 'rgba(47,140,255,0.06)', borderRadius: 10, border: '1px solid rgba(47,140,255,0.14)' }}>
                    {profile.aiStatus}
                  </p>
                )}
              </div>
            </div>

            {/* ── Return timeline card ─────────────────── */}
            <div className="glow-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <p className="eyebrow" style={{ margin: 0 }}>Expected return range</p>
              </div>
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>{profile.returnRange}</h3>
              <p style={{ color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.6 }}>
                Based on grade, mechanism, and sport demands. Individual variation applies.
              </p>

              {/* Timeline bar */}
              <div style={{ marginTop: 16 }}>
                <div className="progress-track">
                  <span style={{ width: `${Math.min(confidence, 90)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>TODAY</span>
                  <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>ESTIMATED RETURN</span>
                </div>
              </div>
            </div>

            {/* ── Actions ──────────────────────────────── */}
            <div className="diagnosis-actions">
              <button className="primary-btn" onClick={() => router.push('/plan')}>
                View recovery plan
              </button>
              <button className="secondary-btn" onClick={() => router.push('/assessment')}>
                Redo assessment
              </button>
            </div>

          </div>
        )}
      </section>
    </PageShell>
  );
}
