'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RfDiagnosisCard } from './RfDiagnosisCard';

function injuryTitle(profile) {
  if (profile.injuryTitle) return profile.injuryTitle;
  const region = profile.regionName || '';
  const grade = profile.gradeName || '';
  if (/overload/i.test(grade)) return `${region} overload`;
  if (/grade iii|grade 3|severe/i.test(grade)) return `${region} tear`;
  return `${region} strain`;
}

function shortGrade(grade = '') {
  const m = grade.match(/grade\s*(i{1,3}|[1-3])/i);
  if (!m) return grade;
  const r = m[1].toUpperCase();
  return `Grade ${r === '1' ? 'I' : r === '2' ? 'II' : r === '3' ? 'III' : r}`;
}

// ── Big animated confidence ring ──
function ConfidenceRing({ value = 0, label = 'Confidence' }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 64;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <div className="dash-ring">
      <svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true">
        <circle cx="80" cy="80" r={r} stroke="rgba(255,255,255,0.10)" strokeWidth="8" fill="none" />
        <circle
          cx="80" cy="80" r={r}
          stroke="url(#dashRingGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id="dashRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#7FD8FF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="dash-ring-inner">
        <div className="dash-ring-value">{Math.round(pct)}%</div>
        <div className="dash-ring-label">{label}</div>
      </div>
    </div>
  );
}

// ── Pain-trend mini line chart ──
function PainTrend({ points }) {
  const pts = points && points.length >= 2 ? points : [70, 68, 72, 65, 62, 60, 58, 55, 52, 50, 47, 44, 42, 40];
  const w = 320, h = 100, pad = 6;
  const min = Math.min(...pts), max = Math.max(...pts);
  const range = max - min || 1;
  const step = (w - pad * 2) / (pts.length - 1);
  const path = pts
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (h - pad * 2) * (1 - (v - min) / range);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const area = path + ` L ${(w - pad).toFixed(1)} ${(h - pad).toFixed(1)} L ${pad} ${(h - pad).toFixed(1)} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height="100" aria-hidden="true">
      <defs>
        <linearGradient id="painArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="rgba(127,216,255,0.35)" />
          <stop offset="100%" stopColor="rgba(127,216,255,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#painArea)" />
      <path d={path} fill="none" stroke="#7FD8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardContent({ profile, stats, saving, saveMessage }) {
  const router = useRouter();
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setProgressWidth(stats?.percent ?? 0));
    return () => cancelAnimationFrame(t);
  }, [stats?.percent]);

  if (!profile) {
    return (
      <section className="empty-state app-section app-section-light">
        <h2>Start with the assessment.</h2>
        <p>
          Your dashboard will show your injury, grade, expected return range, today's plan,
          and saved progress after the app builds your recovery profile.
        </p>
        <button className="primary-btn" onClick={() => router.push('/assessment')}>
          Open assessment
        </button>
      </section>
    );
  }

  const isRf = !!profile.isRfBeta;
  const region = profile.regionName || 'Recovery';
  const grade = shortGrade(profile.gradeName || '');
  const confidence = isRf && profile.rfDiagnosis?.confidence_pct != null
    ? profile.rfDiagnosis.confidence_pct
    : (stats?.percent ?? 0);
  const ringLabel = isRf ? 'Confidence' : 'Progress';

  const expectedReturn = (() => {
    if (isRf && profile.rfDiagnosis?.estimated_rtp_days) {
      const w1 = Math.ceil(profile.rfDiagnosis.estimated_rtp_days.min / 7);
      const w2 = Math.ceil(profile.rfDiagnosis.estimated_rtp_days.max / 7);
      return `${w1}–${w2} weeks`;
    }
    return profile.returnRange || '—';
  })();

  const saveLabel = saving ? 'Saving…' : (saveMessage || 'Synced');

  return (
    <section className="dashboard-v2">

      {/* Top status pill */}
      <div className="dash-status-pill">
        <span className="dash-status-pill-dot" />
        <span>Recovery plan generated</span>
      </div>

      {/* Eyebrow + glow title */}
      <p className="eyebrow dash-eyebrow">Recovery</p>
      <h2 className="dash-title">{injuryTitle(profile)}</h2>

      {/* Hero glass card — region/grade pill, ring, 3 stat tiles */}
      <div className="dash-hero-card">
        <div className="dash-region-pill">
          <span>{region}{grade ? ` · ${grade}` : ''}</span>
        </div>

        <ConfidenceRing value={confidence} label={ringLabel} />

        <div className="dash-stat-tiles">
          <div className="dash-stat-tile">
            <div className="dash-stat-tile-value">{stats?.completedPhases ?? 0}/{stats?.totalPhases ?? 6}</div>
            <div className="dash-stat-tile-label">Phases</div>
          </div>
          <div className="dash-stat-tile">
            <div className="dash-stat-tile-value">{stats?.completedWeeks ?? 0}/{stats?.totalWeeks ?? 12}</div>
            <div className="dash-stat-tile-label">Weeks</div>
          </div>
          <div className="dash-stat-tile">
            <div className="dash-stat-tile-value">{stats?.completedDays ?? 0}/{stats?.totalDays ?? 42}</div>
            <div className="dash-stat-tile-label">Days</div>
          </div>
        </div>
      </div>

      {/* Paired pill cards: expected return + save status */}
      <div className="dash-pill-row">
        <div className="dash-pill-card">
          <div className="dash-pill-label">Expected return</div>
          <div className="dash-pill-value">{expectedReturn}</div>
        </div>
        <div className="dash-pill-card">
          <div className="dash-pill-label">Save status</div>
          <div className="dash-pill-value dash-pill-synced">
            <span className="dash-synced-dot" />{saveLabel}
          </div>
        </div>
      </div>

      {/* Pain trend card */}
      <div className="dash-trend-card">
        <div className="dash-trend-label">Pain trend · last 14 days</div>
        <PainTrend points={profile.painTrend} />
      </div>

      {/* Coach note */}
      {profile.aiStatus && (
        <div className="dash-coach-card">
          <span className="dash-coach-dot" />
          <div className="dash-coach-body">
            <div className="dash-coach-label">Recovery coach note</div>
            <p className="dash-coach-text">{profile.aiStatus}</p>
          </div>
        </div>
      )}

      {/* RF diagnosis details below — kept for clinical context */}
      {isRf && profile.rfDiagnosis && (
        <div style={{ marginTop: 18 }}>
          <RfDiagnosisCard diagnosis={profile.rfDiagnosis} />
        </div>
      )}

      {/* Today's session quick action */}
      {profile.today?.title && (
        <div className="dash-today-card">
          <div className="dash-today-eyebrow">Today's session</div>
          <div className="dash-today-title">{profile.today.title}</div>
          <div className="dash-today-actions">
            <button className="primary-btn" onClick={() => router.push('/plan')}>Open plan</button>
            <button className="secondary-btn" onClick={() => router.push('/check-in')}>Log check-in</button>
          </div>
        </div>
      )}
    </section>
  );
}
