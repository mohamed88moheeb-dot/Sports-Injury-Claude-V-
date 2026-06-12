'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageShell } from '../../../../../../components/layout/PageShell';
import { useRecovery } from '../../../../../providers/RecoveryContext';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s ease' }}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function DayPage() {
  const { p, w, d } = useParams();
  const router = useRouter();
  const { profile, completeDay } = useRecovery();

  const pIdx = Number(p);
  const wIdx = Number(w);
  const dIdx = Number(d);

  const [openEx, setOpenEx] = useState({});
  const [openAlt, setOpenAlt] = useState({});

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
  const day = week?.days[dIdx];

  if (!day) {
    return (
      <PageShell>
        <div className="empty-state">
          <p>Day not found.</p>
          <button className="primary-btn" onClick={() => router.push('/plan')}>Back to plan</button>
        </div>
      </PageShell>
    );
  }

  const isRest = day.exercises.length === 0;

  return (
    <PageShell>
      <div className="subpage day-subpage">

        {/* ── Back nav ── */}
        <button className="subpage-back" onClick={() => router.push(`/plan/week/${pIdx}/${wIdx}`)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Week {wIdx + 1}
        </button>

        {/* ── Day header ── */}
        <div className="day-subpage-header">
          <div>
            <span className="phase-index">Phase {pIdx + 1} · Week {wIdx + 1}</span>
            <h2>{day.title}</h2>
            <p>{day.summary}</p>
          </div>
          <button
            className={`day-complete-btn ${day.completed ? 'done' : ''}`}
            onClick={() => completeDay(pIdx, wIdx, dIdx)}
          >
            {day.completed ? <><CheckIcon /> Done</> : 'Mark complete'}
          </button>
        </div>

        {/* ── Session info strip ── */}
        <div className="day-session-strip">
          <div className="day-session-strip-item">
            <span className="small-label">Session</span>
            <strong>{day.sessionTitle}</strong>
          </div>
          {day.load && (
            <div className="day-session-strip-item">
              <span className="small-label">Load</span>
              <strong>{day.load}</strong>
            </div>
          )}
        </div>

        {/* ── Rest day ── */}
        {isRest && (
          <div className="day-rest-card">
            <div className="day-rest-icon">🛌</div>
            <h3>Rest day</h3>
            <p>Complete rest today. Recovery is the training stimulus — let the body adapt.</p>
          </div>
        )}

        {/* ── Recovery notes ── */}
        {day.recovery?.length > 0 && (
          <div className="day-section-block">
            <span className="day-section-label">Recovery</span>
            {day.recovery.map((item, i) => (
              <p key={i} className="day-recovery-item">{item}</p>
            ))}
          </div>
        )}

        {/* ── Mobility / warm-up ── */}
        {day.mobility?.length > 0 && (
          <div className="day-section-block">
            <span className="day-section-label">Mobility / warm-up</span>
            <div className="day-mobility-list">
              {day.mobility.map((m, i) => (
                <div key={i} className="day-mobility-item">
                  <strong>{m.name}</strong>
                  <span>{m.prescription}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Exercises ── */}
        {!isRest && day.exercises.length > 0 && (
          <div className="day-exercises">
            {(() => {
              let lastBlock = null;
              return day.exercises.map((ex, eIdx) => {
                const key = `${dIdx}-${eIdx}`;
                const exOpen = !!openEx[key];
                const thisBlock = ex.blockLabel || null;
                const showBlock = thisBlock && thisBlock !== lastBlock;
                if (showBlock) lastBlock = thisBlock;
                return (
                  <div key={key}>
                    {showBlock && <div className="day-block-label">{thisBlock}</div>}
                    <div className={`day-ex-card ${exOpen ? 'open' : ''}`}>
                      <button
                        className="day-ex-main"
                        onClick={() => setOpenEx({ ...openEx, [key]: !exOpen })}
                      >
                        <div className="day-ex-left">
                          <div className="day-ex-num">{eIdx + 1}</div>
                          <div className="day-ex-info">
                            <h5>{ex.name}</h5>
                            <div className="day-ex-tags">
                              <span>{ex.prescription}</span>
                              {ex.equipment && <span>{ex.equipment}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="day-ex-right">
                          <span className="day-ex-intensity">{ex.intensity}</span>
                          <ChevronIcon open={exOpen} />
                        </div>
                      </button>

                      {exOpen && (
                        <div className="day-ex-expanded">
                          {ex.purpose && <p className="day-ex-purpose">{ex.purpose}</p>}
                          <div className="day-ex-video">
                            <span>Video demo</span>
                            <small>{ex.video}</small>
                          </div>
                          <p className="day-ex-cue">{ex.cue}</p>
                          {ex.commonMistakes?.length > 0 && (
                            <div className="day-ex-mistakes">
                              <span className="small-label">Common mistakes to avoid</span>
                              <ul>
                                {ex.commonMistakes.map((m, mi) => <li key={mi}>{m}</li>)}
                              </ul>
                            </div>
                          )}
                          <button
                            className="day-alt-btn"
                            onClick={() => setOpenAlt({ ...openAlt, [key]: !openAlt[key] })}
                          >
                            Too hard? Show easier option
                          </button>
                          {openAlt[key] && ex.alternative && (
                            <div className="day-alt-box">
                              <strong>{ex.alternative.name}</strong>
                              <span>{ex.alternative.prescription}</span>
                              <p>{ex.alternative.cue}</p>
                            </div>
                          )}
                          {ex.painRule && (
                            <p className="day-ex-pain-rule">
                              <strong>Pain rule: </strong>{ex.painRule}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ── Progress rule ── */}
        {day.rule && (
          <div className="day-rule-card">
            <span className="small-label">Progress rule</span>
            <p>{day.rule}</p>
          </div>
        )}

        {/* ── Next day nav ── */}
        <div className="day-nav-row">
          {dIdx > 0 && (
            <button className="secondary-btn" onClick={() => router.push(`/plan/day/${pIdx}/${wIdx}/${dIdx - 1}`)}>
              ← Previous day
            </button>
          )}
          {dIdx < week.days.length - 1 && (
            <button className="primary-btn" onClick={() => router.push(`/plan/day/${pIdx}/${wIdx}/${dIdx + 1}`)}>
              Next day →
            </button>
          )}
        </div>

      </div>
    </PageShell>
  );
}
