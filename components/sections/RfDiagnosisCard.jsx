'use client';

/**
 * RfDiagnosisCard
 * Renders the probabilistic diagnosis result from computeRfDiagnosis.
 * Shown as the FIRST element on the dashboard for RF beta profiles.
 * Confidence cap 78%: Ishøi 2021 BJSM (FAI diagnostic test review, applied by principle)
 */

const BAND_CONFIG = {
  mild:         { label: 'Mild',         color: 'var(--green)',  bg: 'rgba(24,160,90,0.10)',   border: 'rgba(24,160,90,0.22)'  },
  moderate:     { label: 'Moderate',     color: 'var(--blue)',   bg: 'rgba(90,171,222,0.10)',  border: 'rgba(90,171,222,0.22)' },
  high_concern: { label: 'High concern', color: 'var(--amber)',  bg: 'rgba(232,160,32,0.10)',  border: 'rgba(232,160,32,0.22)' },
  red_flag:     { label: 'Red flag',     color: 'var(--red)',    bg: 'rgba(217,79,79,0.10)',   border: 'rgba(217,79,79,0.22)'  },
};

const SUBTYPE_LABELS = {
  grade_1_myofascial:              'Grade 1 — myofascial',
  grade_1_2_musculotendinous:      'Grade 1–2 — musculotendinous',
  grade_2_3_high_concern:          'Grade 2–3 — high concern',
  grade_2_3_central_tendon_suspect:'Grade 2–3 — central tendon suspected',
  grade_3_structural_disruption:   'Grade 3 — structural disruption',
  grade_3_structural_tear_suspected:'Grade 3 — structural tear suspected',
};

const LIKELIHOOD_LABELS = {
  most_likely:         'Most likely',
  possible:            'Possible',
  less_likely:         'Less likely',
  requires_assessment: 'Requires assessment',
};

const FLAG_LABELS = {
  audible_pop:            'Audible pop / snap',
  functional_loss:        'Unable to continue activity',
  non_ambulatory:         'Unable to walk',
  immediate_bruising:     'Immediate bruising (<2 h)',
  early_bruising:         'Early bruising',
  structural_defect:      'Palpable gap / defect',
  proximal_tendon_suspect:'Proximal tendon involvement',
  intratendinous_suspect: 'Intratendinous involvement',
  neural_concern:         'Possible neural component',
  structural_tear_pattern:'Structural tear pattern',
  red_flag_triggered:     'Red flag reported',
  avulsion_concern:       'Avulsion concern — young athlete + kicking',
};

const PATTERN_COLORS = {
  A: { color: 'var(--red)',   bg: 'rgba(217,79,79,0.08)',   border: 'rgba(217,79,79,0.22)' },
  B: { color: 'var(--amber)', bg: 'rgba(232,160,32,0.08)', border: 'rgba(232,160,32,0.22)' },
  C: { color: 'var(--green)', bg: 'rgba(24,160,90,0.08)',  border: 'rgba(24,160,90,0.22)' },
};

function ConfidenceBar({ pct }) {
  const color = pct >= 65 ? 'var(--blue)' : pct >= 45 ? 'var(--amber)' : 'var(--muted)';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 5, borderRadius: 3, background: 'rgba(15,27,46,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 3,
          transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
    </div>
  );
}

export function RfDiagnosisCard({ diagnosis }) {
  if (!diagnosis) return null;

  const {
    severity_band,
    probable_subtype,
    confidence_pct,
    estimated_rtp_days,
    imaging_gate,
    imaging_reason,
    flags = [],
    differentials = [],
    rf_pattern,
  } = diagnosis;

  const band = BAND_CONFIG[severity_band] || BAND_CONFIG.moderate;
  const subtypeLabel = SUBTYPE_LABELS[probable_subtype] || probable_subtype?.replace(/_/g, ' ') || '—';

  // Return range in WEEKS (not days)
  const weeksMin = estimated_rtp_days ? Math.ceil(estimated_rtp_days.min / 7) : null;
  const weeksMax = estimated_rtp_days ? Math.ceil(estimated_rtp_days.max / 7) : null;
  const rtpLabel = weeksMin !== null ? `${weeksMin}–${weeksMax} weeks` : '—';

  const displayFlags = flags.filter((f) => FLAG_LABELS[f]);
  const topDifferential = differentials.find((d) => d.likelihood === 'most_likely');

  return (
    <div className="rf-diagnosis-card fade-up stagger-1">

      {/* ── Hero header row ── */}
      <div className="rfd-hero">
        <div className="rfd-hero-left">
          <p className="eyebrow" style={{ marginBottom: 5 }}>Injury assessment</p>
          <h2 className="rfd-title">Rectus femoris strain</h2>
          <p className="rfd-subtype">{subtypeLabel}</p>
        </div>
        <div
          className="rfd-severity-badge"
          style={{ background: band.bg, border: `1px solid ${band.border}`, color: band.color }}
        >
          {band.label}
        </div>
      </div>

      {/* ── RF Pattern ── */}
      {rf_pattern && (() => {
        const pc = PATTERN_COLORS[rf_pattern.type] || PATTERN_COLORS.C;
        return (
          <div className="rfd-pattern" style={{ background: pc.bg, border: `1px solid ${pc.border}` }}>
            <span className="rfd-pattern-badge" style={{ background: pc.color }}>
              {rf_pattern.type}
            </span>
            <div className="rfd-pattern-body">
              <p className="rfd-pattern-label" style={{ color: pc.color }}>
                Type {rf_pattern.type} — {rf_pattern.label}
              </p>
              <p className="rfd-pattern-detail">{rf_pattern.detail}</p>
            </div>
          </div>
        );
      })()}

      {/* ── Stat row: confidence + return ── */}
      <div className="rfd-stats">
        <div className="rfd-stat">
          <p className="rfd-stat-label">Confidence</p>
          <p className="rfd-stat-value">{confidence_pct}%</p>
          <ConfidenceBar pct={confidence_pct} />
          <p className="rfd-stat-note">Capped at 84% without imaging</p>
        </div>
        <div className="rfd-stat">
          <p className="rfd-stat-label">Est. return</p>
          <p className="rfd-stat-value">{rtpLabel}</p>
          <p className="rfd-stat-note">Based on injury signals</p>
        </div>
      </div>

      {/* ── Imaging gate ── */}
      {imaging_gate && (
        <div className="rfd-imaging-gate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="rfd-imaging-title">Imaging recommended before starting rehab</p>
            <p className="rfd-imaging-body">
              Your assessment shows patterns that warrant MRI or ultrasound before exercise.
              Your plan is visible but should not begin until a clinician has assessed you.
            </p>
          </div>
        </div>
      )}

      {/* ── Clinical signals ── */}
      {displayFlags.length > 0 && (
        <div className="rfd-signals">
          <p className="rfd-section-label">Clinical signals detected</p>
          <div className="rfd-flags">
            {displayFlags.map((f) => (
              <span key={f} className="rfd-flag-chip">{FLAG_LABELS[f]}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Differentials ── */}
      {differentials.length > 0 && (
        <div className="rfd-differentials">
          <p className="rfd-section-label">Differential diagnosis</p>
          <div className="rfd-diff-list">
            {differentials.map((d, i) => {
              const isTop = d.likelihood === 'most_likely';
              return (
                <div
                  key={i}
                  className={`rfd-diff-item${isTop ? ' rfd-diff-item--top' : ''}`}
                >
                  <div className="rfd-diff-body">
                    <p className="rfd-diff-name">{d.injury}</p>
                    <p className="rfd-diff-meta">
                      {LIKELIHOOD_LABELS[d.likelihood] || d.likelihood} · {d.rtp_ref}
                    </p>
                  </div>
                  {isTop && <span className="rfd-diff-top-badge">Most likely</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <p className="rfd-disclaimer">
        Self-reported result — not a clinical diagnosis. Confidence capped at 84% without imaging (clinical tests have limited diagnostic accuracy). See a physiotherapist or sports medicine doctor to confirm.
      </p>
    </div>
  );
}
