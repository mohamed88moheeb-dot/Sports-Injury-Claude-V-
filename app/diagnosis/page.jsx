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

/* Real recovery-time axis: how far the athlete is (days since injury + days
   since the plan was generated) vs the programme's actual total length.
   Returns null when the profile carries no real week total — no bar is more
   honest than a bar filled by an unrelated number. */
function computeTimeline(profile) {
  if (!profile?.planTotalWeeks) return null;
  const totalDays = profile.planTotalWeeks * 7;
  const atGeneration = Number.isFinite(Number(profile.daysSinceInjury)) ? Number(profile.daysSinceInjury) : 0;
  const sinceGeneration = profile.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000))
    : 0;
  const elapsedDays = Math.min(totalDays, atGeneration + sinceGeneration);
  return {
    percent: Math.min(100, Math.max(2, Math.round((elapsedDays / totalDays) * 100))),
    currentWeek: Math.min(profile.planTotalWeeks, Math.floor(elapsedDays / 7) + 1),
    totalWeeks: profile.planTotalWeeks,
  };
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
  // Only a REAL engine-computed match score is shown as a number. Legacy
  // (non-engine) profiles have none — they render a qualitative tag instead
  // of a percentage invented from the severity wording.
  const confidence = !confidenceWithheld && Number.isFinite(profile?.confidence) ? profile.confidence : null;
  const timeline = computeTimeline(profile);
  const drivers = Array.isArray(profile?.diagnosisDrivers) ? profile.diagnosisDrivers : [];

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
                ) : confidence != null ? (
                  <ConfidenceMeter value={confidence} label="Match confidence" size={110} />
                ) : (
                  <div style={{ textAlign: 'center', maxWidth: 130, padding: '18px 6px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: CARD_TEXT }}>Pattern-based</div>
                    <div style={{ fontSize: 11, color: CARD_TEXT_DIM, marginTop: 4 }}>Indicative match from your answers — not a scored diagnosis.</div>
                  </div>
                )}
                <RiskTag profile={profile} />
              </div>

              {/* Details — the DIAGNOSED PATTERN is the headline, not the body
                  region the user tapped (which is an input, not a finding). */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <p className="eyebrow" style={{ marginBottom: 8 }}>Likely pattern</p>
                <h3 style={{ fontSize: 24, marginBottom: 6, ...GLOW_BLUE }}>{profile.injuryTitle || profile.regionName}</h3>
                <p style={{ color: CARD_TEXT, fontSize: 14, marginBottom: 12 }}>
                  {[profile.regionName, profile.gradeName, profile.mechanism].filter(Boolean).join(' · ')}
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
              {profile.recoverySecondaryNote && (
                <p style={{ marginTop: 8, fontSize: 12, color: CARD_TEXT_DIM, lineHeight: 1.6 }}>
                  {profile.recoverySecondaryNote}
                </p>
              )}

              {/* Timeline bar — a REAL time axis: elapsed recovery time over the
                  programme's actual length. Hidden when no week total exists. */}
              {timeline && (
                <div style={{ marginTop: 16 }}>
                  <div className="progress-track">
                    <span style={{ width: `${timeline.percent}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: CARD_TEXT_DIM, fontWeight: 600 }}>
                      WEEK {timeline.currentWeek} OF ~{timeline.totalWeeks}
                    </span>
                    <span style={{ fontSize: 10, color: '#5CC6FF', fontWeight: 700, textShadow: '0 0 8px rgba(56,189,248,0.5)' }}>ESTIMATED RETURN</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Why this pattern (assessment → diagnosis link) ── */}
            {(drivers.length > 0 || profile.diagnosisNote) && (
              <div className="glow-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <p className="eyebrow" style={{ margin: 0 }}>Why this pattern</p>
                </div>
                {drivers.length > 0 && (
                  <>
                    <p style={{ color: CARD_TEXT, fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                      From your answers, these findings supported this pattern:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {drivers.map((d, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: CARD_TEXT }}>
                          <span style={{
                            flexShrink: 0, width: 6, height: 6, borderRadius: '50%', marginTop: 7,
                            background: '#5CC6FF', boxShadow: '0 0 8px rgba(56,189,248,0.85)',
                          }} />
                          <span style={{ lineHeight: 1.55 }}>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {profile.diagnosisNote && (
                  <p style={{ color: CARD_TEXT_DIM, fontSize: 11, lineHeight: 1.5, marginTop: drivers.length ? 14 : 0, fontStyle: 'italic' }}>
                    {profile.diagnosisNote}
                  </p>
                )}
              </div>
            )}

            {/* ── Return-to-sport readiness checklist ──── */}
            {isRf && profile.rtsReadiness && profile.rtsReadiness.total > 0 && (
              <div className="glow-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <p className="eyebrow" style={{ margin: 0 }}>Return-to-sport readiness</p>
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 8, ...GLOW_BLUE }}>
                  {profile.rtsReadiness.met} / {profile.rtsReadiness.total} criteria met
                </h3>
                <p style={{ color: CARD_TEXT, fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                  {profile.rtsReadiness.headline}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {profile.rtsReadiness.criteria.filter((c) => c.state !== 'n/a').map((c) => (
                    <li key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                      <span style={{
                        flexShrink: 0, width: 18, height: 18, borderRadius: 9, marginTop: 1,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800,
                        background: c.met ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.06)',
                        color: c.met ? '#5CC6FF' : CARD_TEXT_DIM,
                        border: `1px solid ${c.met ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      }}>{c.met ? '✓' : '○'}</span>
                      <span>
                        <strong style={{ color: c.met ? '#CDEBFF' : CARD_TEXT }}>{c.name}</strong>
                        <span style={{ display: 'block', color: CARD_TEXT_DIM, fontSize: 12, lineHeight: 1.5 }}>{c.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p style={{ color: CARD_TEXT_DIM, fontSize: 11, lineHeight: 1.5, marginTop: 14, fontStyle: 'italic' }}>
                  {profile.rtsReadiness.clearance_note}
                </p>
              </div>
            )}

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
