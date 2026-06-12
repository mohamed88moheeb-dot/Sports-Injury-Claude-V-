'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CircularProgress } from '../ui/CircularProgress';

function injuryTitle(profile) {
  if (profile.injuryTitle) return profile.injuryTitle;
  const region = profile.regionName || '';
  const grade = profile.gradeName || '';
  if (/overload/i.test(grade)) return `${region} overload`;
  if (/grade iii|grade 3|severe/i.test(grade)) return `${region} tear`;
  return `${region} strain`;
}

export function HomeSummary({ profile, stats }) {
  const router = useRouter();
  const [progressWidth, setProgressWidth] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setProgressWidth(stats?.percent ?? 0));
    return () => cancelAnimationFrame(t);
  }, [stats?.percent]);

  const next = profile.today || {};
  const pct = stats?.percent ?? 0;

  return (
    <section className="dashboard app-section app-section-light">
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h2>{injuryTitle(profile)}</h2>
          <div className="dashboard-header-sub">
            <span>{profile.exactAreaName || profile.regionName}</span>
            <span className="dashboard-grade-chip">{profile.gradeName}</span>
          </div>
        </div>
        <div className="dashboard-confidence-widget">
          <CircularProgress value={pct} />
          <span className="small-label">Confidence Score</span>
        </div>
      </div>

      {/* Today's session — the single most important thing on home */}
      <div className="today-card highlight-card fade-up stagger-1">
        <div className="today-card-top">
          <div>
            <p className="eyebrow">Today's session</p>
            <h3>{next.title || 'Open the plan to start'}</h3>
          </div>
          <span className="phase-chip">{next.phaseLabel || 'Not started'}</span>
        </div>
        <p>{next.summary || 'Your next session will appear here.'}</p>
        <div className="today-preview">
          <span>{next.load || 'Personalized rehab'}</span>
          <span>{next.sessionTitle || 'Session details'}</span>
        </div>
        <div className="today-actions">
          <button className="primary-btn" onClick={() => router.push('/plan')}>
            Open plan
          </button>
          <button className="secondary-btn" onClick={() => router.push('/check-in')}>
            Log check-in
          </button>
        </div>
      </div>

      {/* Slim progress summary — full breakdown lives on the Dashboard */}
      <button
        type="button"
        className="home-progress-summary fade-up stagger-2"
        onClick={() => router.push('/dashboard')}
      >
        <div className="home-progress-summary-text">
          <span className="small-label">Overall progress</span>
          <strong>
            {pct >= 100
              ? 'Recovery complete'
              : `${stats?.completedDays ?? 0} of ${stats?.totalDays ?? 0} days`}
          </strong>
        </div>
        <div className="progress-track">
          <span className={progressWidth >= 100 ? 'full' : ''} style={{ width: `${progressWidth}%` }} />
        </div>
        <div className="home-progress-summary-cta">
          <span>View full dashboard</span>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>
    </section>
  );
}
