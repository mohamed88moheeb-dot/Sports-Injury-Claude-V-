'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/layout/PageShell';
import { useRecovery } from '../providers/RecoveryContext';
import { ConfidenceMeter } from '../../components/ui/ConfidenceMeter';
import { AIBadge } from '../../components/ui/GlassCard';

/* Readable text on the dark glow-card */
const GLOW_BLUE = { color: '#5CC6FF', textShadow: '0 0 14px rgba(56,189,248,0.65)' };
const CARD_TEXT = 'rgba(255,255,255,0.90)';
const CARD_TEXT_DIM = 'rgba(255,255,255,0.72)';

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
  const isHigh = profile.rfReviewRequired || profile.returnRange?.includes('medical review');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      background: isHigh ? 'rgba(239,68,68,0.14)' : 'rgba(56,189,248,0.14)',
      border: `1px solid ${isHigh ? 'rgba(239,68,68,0.4)' : 'rgba(56,189,248,0.45)'}`,
      color: isHigh ? '#FF6B6B' : '#5CC6FF',
      textShadow: isHigh ? '0 0 10px rgba(239,68,68,0.5)' : '0 0 10px rgba(56,189,248,0.55)',
      fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: isHigh ? '#FF6B6B' : '#5CC6FF',
        boxShadow: isHigh ? '0 0 6px rgba(239,68,68,0.8)' : '0 0 8px rgba(56,189,248,0.85)',
      }} />
      {isHigh ? 'Higher Risk' : 'Standard Risk'}
    </span>
  );
}

export default function DiagnosisPage() {
  const router = useRouter();
  const { profile, assessment } = useRecovery();
  const isRf = !!profile?.isRfBeta;
  const confidenceWithheld = isRf && profile.rfConfidenceWithheld;
  const confidence = isRf ? (confidenceWithheld ? 0 : (profile.confidence ?? 0)) : inferConfidence(profile);

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
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
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
                {confidenceWithheld ? (
                  <div style={{ textAlign: 'center', maxWidth: 130, padding: '18px 6px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#FF8A8A' }}>Confidence not shown</div>
                    <div style={{ fontSize: 11, color: CARD_TEXT_DIM, marginTop: 4 }}>Higher-concern pattern — please seek review first.</div>
                  </div>
                ) : (
                  <ConfidenceMeter value={confidence} label={isRf ? 'Match confidence' : 'Match score'} size={110} />
                )}
                <RiskTag profile={profile} />
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <p className="eyebrow" style={{ marginBottom: 8 }}>Primary region</p>
                <h3 style={{ fontSize: 26, marginBottom: 6, ...GLOW_BLUE }}>{profile.regionName}</h3>
                <p style={{ color: CARD_TEXT, fontSize: 14, marginBottom: 12 }}>
                  {profile.gradeName} · {profile.mechanism}
                </p>

                {profile.exactAreaName !== 'General area' && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 999,
                    background: 'rgba(56,189,248,0.14)',
                    border: '1px solid rgba(56,189,248,0.4)',
                    fontSize: 12, fontWeight: 600, color: '#5CC6FF',
                  }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    </svg>
                    Specific area: {profile.exactAreaName}
                  </div>
                )}

                {/* AI status */}
                {profile.aiStatus && (
                  <p style={{ marginTop: 12, fontSize: 13, color: CARD_TEXT, lineHeight: 1.6, padding: '10px 14px', background: 'rgba(47,140,255,0.12)', borderRadius: 10, border: '1px solid rgba(56,189,248,0.22)' }}>
                    {profile.aiStatus}
                  </p>
                )}

                {/* RF beta limitation copy */}
                {isRf && (
                  <p style={{ marginTop: 10, fontSize: 12, color: CARD_TEXT_DIM, lineHeight: 1.6, padding: '8px 12px', background: 'rgba(47,140,255,0.10)', borderRadius: 10, border: '1px solid rgba(56,189,248,0.20)' }}>
                    This is a suggested pattern with a capped match confidence — not a confirmed diagnosis, readiness, or clearance. {profile.rfConfidenceWithheld ? '' : profile.rfConfidenceLabel}
                  </p>
                )}
              </div>
            </div>

            {/* ── Return timeline card ─────────────────── */}
            <div className="glow-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <p className="eyebrow" style={{ margin: 0 }}>Expected return range</p>
              </div>
              <h3 style={{ fontSize: 22, marginBottom: 8, ...GLOW_BLUE }}>{profile.returnRange}</h3>
              <p style={{ color: CARD_TEXT, fontSize: 13, lineHeight: 1.6 }}>
                {isRf
                  ? (profile.rfRecoveryWording || 'Estimated window for similar patterns. Actual recovery depends on severity, symptoms, sport demands, and clinician review.')
                  : 'Based on grade, mechanism, and sport demands. Individual variation applies.'}
              </p>

              {/* Timeline bar */}
              <div style={{ marginTop: 16 }}>
                <div className="progress-track">
                  <span style={{ width: `${Math.min(confidence, 90)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: CARD_TEXT_DIM, fontWeight: 600 }}>TODAY</span>
                  <span style={{ fontSize: 10, color: '#5CC6FF', fontWeight: 700, textShadow: '0 0 8px rgba(56,189,248,0.5)' }}>ESTIMATED RETURN</span>
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
