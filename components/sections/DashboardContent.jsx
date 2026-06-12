'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HumanFrontIcon from '../HumanFrontIcon';
import { CircularProgress } from '../ui/CircularProgress';
import { Metric } from '../ui/Metric';

export function DashboardContent({ profile, stats, saving, saveMessage }) {
  const router = useRouter();
  // Animate progress bar from 0 → actual on mount
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
          Your dashboard will show your injury, grade, expected return range, today's plan, and
          saved progress after the app builds your recovery profile.
        </p>
        <button className="primary-btn" onClick={() => router.push('/assessment')}>
          Open assessment
        </button>
      </section>
    );
  }

  const next = profile.today || {};

  return (
    <section className="dashboard app-section app-section-light">
      <div className="dashboard-header">
        <div>
          <h2>{profile.regionName}</h2>
          <p>
            {profile.gradeName} · {profile.mechanism} · {profile.exactAreaName || 'General area'}
          </p>
        </div>
        <HumanFrontIcon size="medium" />
      </div>

      <div className="dashboard-main">
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

        <div className={`progress-card fade-up stagger-2${stats.percent >= 100 ? ' plan-complete' : ''}`}>
          <div className="progress-card-top">
            <div>
              <p className="eyebrow">{stats.percent >= 100 ? 'Recovery complete' : 'Overall progress'}</p>
              <h3>
                {stats.percent >= 100
                  ? 'All sessions done'
                  : `${stats.completedDays} of ${stats.totalDays} days`}
              </h3>
            </div>
            <CircularProgress value={stats.percent} />
          </div>
          <div className="progress-track">
            <span className={progressWidth >= 100 ? 'full' : ''} style={{ width: `${progressWidth}%` }} />
          </div>
          <div className="mini-stats">
            <Metric label="Phases" value={`${stats.completedPhases}/${stats.totalPhases}`} />
            <Metric label="Weeks" value={`${stats.completedWeeks}/${stats.totalWeeks}`} />
            <Metric label="Days" value={`${stats.completedDays}/${stats.totalDays}`} />
          </div>
        </div>
      </div>

      <div className="dashboard-stats-row fade-up stagger-3">
        <div className="stat-pill-card accent-blue">
          <span className="small-label">Expected return</span>
          <strong>{profile.returnRange}</strong>
        </div>
        <div className="stat-pill-card accent-amber stat-pill-progress">
          <span className="small-label">Progress</span>
          <CircularProgress value={stats.percent} />
        </div>
        <div className="stat-pill-card accent-slate">
          <span className="small-label">Save status</span>
          <strong>{saving ? 'Saving' : saveMessage || 'Synced'}</strong>
        </div>
      </div>

      <div className="coach-note fade-up stagger-4">
        <span className="small-label">Recovery coach note</span>
        <p>{profile.aiStatus}</p>
      </div>
    </section>
  );
}
