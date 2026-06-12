'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { PageShell } from '../../../../../components/layout/PageShell';
import { useRecovery } from '../../../../providers/RecoveryContext';

export default function WeekPage() {
  const { p, w } = useParams();
  const router = useRouter();
  const { profile } = useRecovery();

  const pIdx = Number(p);
  const wIdx = Number(w);

  const todayPath = useMemo(() => {
    if (!profile?.plan) return null;
    for (let pi = 0; pi < profile.plan.length; pi++) {
      for (let wi = 0; wi < profile.plan[pi].weeks.length; wi++) {
        for (let di = 0; di < profile.plan[pi].weeks[wi].days.length; di++) {
          if (!profile.plan[pi].weeks[wi].days[di].completed) return [pi, wi, di];
        }
      }
    }
    return null;
  }, [profile]);

  if (!profile) {
    return (
      <PageShell>
        <div className="empty-state">
          <p>No plan found.</p>
          <button className="primary-btn" onClick={() => router.push('/plan')}>Back to plan</button>
        </div>
      </PageShell>
    );
  }

  const phase = profile.plan[pIdx];
  const week = phase?.weeks[wIdx];

  if (!week) {
    return (
      <PageShell>
        <div className="empty-state">
          <p>Week not found.</p>
          <button className="primary-btn" onClick={() => router.push('/plan')}>Back to plan</button>
        </div>
      </PageShell>
    );
  }

  const doneDays = week.days.filter((d) => d.completed).length;

  return (
    <PageShell>
      <div className="subpage">

        {/* ── Back nav ── */}
        <button className="subpage-back" onClick={() => router.push('/plan')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Plan
        </button>

        {/* ── Week header ── */}
        <div className="subpage-header">
          <div className="subpage-header-left">
            <span className="phase-index">Phase {pIdx + 1} · Week {wIdx + 1}</span>
            <h2>{week.focus}</h2>
            <p>{doneDays} of {week.days.length} days completed</p>
          </div>
          <div className="subpage-progress-ring">
            <svg viewBox="0 0 44 44" width="52" height="52">
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-3)" strokeWidth="4" />
              <circle
                cx="22" cy="22" r="18" fill="none"
                stroke="var(--primary)" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - doneDays / week.days.length)}`}
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <span>{Math.round((doneDays / week.days.length) * 100)}%</span>
          </div>
        </div>

        {/* ── Day list ── */}
        <div className="subpage-day-list">
          {week.days.map((day, dIdx) => {
            const isToday = todayPath && todayPath[0] === pIdx && todayPath[1] === wIdx && todayPath[2] === dIdx;
            const isRest = day.exercises.length === 0;
            return (
              <button
                key={dIdx}
                className={`subpage-day-card ${day.completed ? 'completed' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => router.push(`/plan/day/${pIdx}/${wIdx}/${dIdx}`)}
              >
                <div className="subpage-day-status">
                  {day.completed
                    ? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    : <span>{dIdx + 1}</span>
                  }
                </div>
                <div className="subpage-day-info">
                  <div className="subpage-day-title-row">
                    <strong>{day.title}</strong>
                    {isToday && <span className="today-badge">Today</span>}
                    {isRest && <span className="rest-badge">Rest</span>}
                  </div>
                  <span>{day.summary}</span>
                </div>
                <div className="subpage-day-right">
                  {day.load && <small>{day.load}</small>}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
