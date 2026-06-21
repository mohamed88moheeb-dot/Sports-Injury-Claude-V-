'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function findTodayPath(plan) {
  if (!plan) return null;
  for (let p = 0; p < plan.length; p++) {
    for (let w = 0; w < plan[p].weeks.length; w++) {
      for (let d = 0; d < plan[p].weeks[w].days.length; d++) {
        if (!plan[p].weeks[w].days[d].completed) return [p, w, d];
      }
    }
  }
  return null;
}

function PhaseStatusBadge({ ph, pIdx, todayPath, isRfBeta }) {
  if (!isRfBeta) return null;
  const isCurrent = ph.is_current || ph.status === 'current';
  const isEarlier = ph.status === 'earlier';
  const isUpcoming = ph.status === 'upcoming' && !isCurrent && !isEarlier;

  if (isCurrent) {
    return (
      <span style={{
        display: 'inline-block', marginTop: 4,
        fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
        color: '#60A5FA', background: 'rgba(96,165,250,.12)',
        borderRadius: 6, padding: '2px 7px'
      }}>Start here</span>
    );
  }
  if (isEarlier) {
    return (
      <span style={{
        display: 'inline-block', marginTop: 4,
        fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
        color: '#34D399', background: 'rgba(52,211,153,.10)',
        borderRadius: 6, padding: '2px 7px'
      }}>Completed</span>
    );
  }
  if (isUpcoming) {
    return (
      <span style={{
        display: 'inline-block', marginTop: 4,
        fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase',
        color: 'var(--ink-3)', background: 'rgba(255,255,255,.06)',
        borderRadius: 6, padding: '2px 7px'
      }}>Upcoming</span>
    );
  }
  return null;
}

export function PlanContent({ profile }) {
  const router = useRouter();
  const isRfBeta = !!profile?.isRfBeta;
  const todayPath = useMemo(() => findTodayPath(profile?.plan), [profile]);
  const defaultActive = todayPath?.[0] ?? (profile?.plan?.findIndex((p) => p.is_current || p.status === 'current') ?? 0);
  const [activePhase, setActivePhase] = useState(defaultActive >= 0 ? defaultActive : 0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const el = carouselRef.current?.children[activePhase];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activePhase]);

  if (!profile) {
    return (
      <section className="empty-state">
        <h2>No plan yet.</h2>
        <p>Complete the assessment to create your day-by-day plan.</p>
        <button className="primary-btn" onClick={() => router.push('/assessment')}>
          Open assessment
        </button>
      </section>
    );
  }

  const phase = profile.plan[activePhase];
  const allDays = phase?.weeks.flatMap((w) => w.days) ?? [];
  const completedDays = allDays.filter((d) => d.completed).length;
  const isCurrent = isRfBeta ? (phase?.is_current || phase?.status === 'current') : true;
  const isUpcoming = isRfBeta && phase?.status === 'upcoming' && !isCurrent;

  return (
    <section className="plan-v2">

      {/* ── Header ── */}
      <div className="plan-v2-header">
        <p className="eyebrow">Recovery plan</p>
        <h2>{profile.regionName}</h2>
        {todayPath && (
          <button
            className="secondary-btn plan-v2-jump"
            onClick={() => {
              const [p, w, d] = todayPath;
              setActivePhase(p);
              router.push(`/plan/day/${p}/${w}/${d}`);
            }}
          >
            Jump to today
          </button>
        )}
      </div>

      {/* ── Phase Carousel (all 6 visible) ── */}
      <div className="phase-carousel-wrap">
        <div className="phase-carousel" ref={carouselRef}>
          {profile.plan.map((ph, pIdx) => {
            const days = ph.weeks.flatMap((w) => w.days);
            const done = days.filter((d) => d.completed).length;
            const pct = days.length ? Math.round((done / days.length) * 100) : 0;
            const isActive = activePhase === pIdx;
            const phIsCurrent = isRfBeta && (ph.is_current || ph.status === 'current');
            const phIsUpcoming = isRfBeta && ph.status === 'upcoming' && !phIsCurrent;
            return (
              <button
                key={ph.id}
                className={`phase-carousel-card ${isActive ? 'active' : ''}`}
                onClick={() => setActivePhase(pIdx)}
              >
                <span className="phase-carousel-index">Phase {pIdx + 1}</span>
                <span className="phase-carousel-label">{ph.label}</span>
                <PhaseStatusBadge ph={ph} pIdx={pIdx} todayPath={todayPath} isRfBeta={isRfBeta} />
                <div className="phase-carousel-bar">
                  <div className="phase-carousel-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="phase-carousel-pct">{pct}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Phase Detail ── */}
      {phase && (
        <div className="plan-v2-phase-detail">
          <div className="plan-v2-phase-meta">
            <div>
              <span className="phase-index">Phase {activePhase + 1}</span>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {phase.label}
                {isRfBeta && isCurrent && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#60A5FA', background: 'rgba(96,165,250,.12)', borderRadius: 8, padding: '3px 10px' }}>
                    Today's phase
                  </span>
                )}
              </h3>
              <p>{phase.goal}</p>
              {isUpcoming && phase.progression_note && (
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                  {phase.progression_note}
                </p>
              )}
            </div>
            {!isUpcoming && (
              <span className="plan-v2-progress-pill">{completedDays}/{allDays.length} days</span>
            )}
          </div>

          {/* ── Week Cards / Upcoming phase overview ── */}
          {isUpcoming ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {phase.progression_note && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(96,165,250,.07)', border: '1px solid rgba(96,165,250,.18)',
                  fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: 6 }}>What to expect:</span>
                  {phase.progression_note}
                </div>
              )}
            </div>
          ) : (
            <div className="plan-v2-weeks">
              {phase.weeks.map((week, wIdx) => {
                const wDone = week.days.filter((d) => d.completed).length;
                const hasToday = todayPath && todayPath[0] === activePhase && todayPath[1] === wIdx;
                return (
                  <button
                    key={`${activePhase}-${wIdx}`}
                    className={`plan-v2-week-card ${hasToday ? 'has-today' : ''}`}
                    onClick={() => router.push(`/plan/week/${activePhase}/${wIdx}`)}
                  >
                    <span className="plan-v2-week-index">W{wIdx + 1}</span>
                    <div className="plan-v2-week-info">
                      <span className="plan-v2-week-focus">{week.focus}</span>
                      <span className="plan-v2-week-count">{wDone}/{week.days.length} days done</span>
                    </div>
                    {hasToday && <span className="plan-v2-today-dot">Today</span>}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
