'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import HumanFrontIcon from '../HumanFrontIcon';
import { Chevron } from '../ui/Chevron';

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

export function PlanContent({ profile, completeDay }) {
  const router = useRouter();
  const todayPath = useMemo(() => findTodayPath(profile?.plan), [profile]);
  const [openPhase, setOpenPhase] = useState(todayPath?.[0] ?? 0);
  const [openWeek, setOpenWeek] = useState(todayPath ? `${todayPath[0]}-${todayPath[1]}` : '0-0');
  const [openDay, setOpenDay] = useState(todayPath ? todayPath.join('-') : null);
  const [openExercise, setOpenExercise] = useState({});
  const [openAlt, setOpenAlt] = useState({});

  if (!profile) {
    return (
      <section className="empty-state app-section app-section-light">
        <h2>No plan yet.</h2>
        <p>Complete the assessment to create your day-by-day plan.</p>
        <button className="primary-btn" onClick={() => router.push('/assessment')}>
          Open assessment
        </button>
      </section>
    );
  }

  function jumpToToday() {
    if (!todayPath) return;
    const [p, w, d] = todayPath;
    setOpenPhase(p);
    setOpenWeek(`${p}-${w}`);
    setOpenDay(`${p}-${w}-${d}`);
    requestAnimationFrame(() => {
      document.getElementById(`day-${p}-${w}-${d}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  return (
    <section className="plan-shell app-section app-section-light">
      <div className="plan-intro section-heading">
        <div>
          <p className="eyebrow">Phase by phase</p>
          <h2>{profile.regionName}</h2>
          <p>{profile.planNote}</p>
        </div>
        <div className="plan-intro-actions">
          <div className="mini-anatomy-preview">
            <HumanFrontIcon size="small" />
          </div>
          {todayPath && (
            <button className="secondary-btn" onClick={jumpToToday}>
              Jump to today
            </button>
          )}
        </div>
      </div>

      {profile.plan.map((phase, pIndex) => {
        const phaseOpen = openPhase === pIndex;
        const allDays = phase.weeks.flatMap((w) => w.days);
        const phaseCompleted = allDays.filter((d) => d.completed).length;
        return (
          <article className={`phase-card ${phase.accent} ${phaseOpen ? 'open' : ''}`} key={phase.id}>
            <button className="phase-head" onClick={() => setOpenPhase(phaseOpen ? null : pIndex)}>
              <div className="phase-head-main">
                <div>
                  {/* "Phase 1" plain text above, phase name below it */}
                  <span className="phase-index">Phase {pIndex + 1} · {phase.name}</span>
                  <h3>{phase.label}</h3>
                  <p>{phase.goal}</p>
                </div>
              </div>
              <div className="phase-head-meta">
                <strong>{phaseCompleted}/{allDays.length} days</strong>
                <span className="phase-weeks-tag">
                  {phase.weeks.length} {phase.weeks.length === 1 ? 'week' : 'weeks'}
                </span>
                <Chevron open={phaseOpen} />
              </div>
            </button>

            {phaseOpen && (
              <div className="phase-body">
                <p className="phase-description">{phase.description}</p>
                {phase.weeks.map((week, wIndex) => {
                  const weekKey = `${pIndex}-${wIndex}`;
                  const weekOpen = openWeek === weekKey;
                  const weekCompleted = week.days.filter((d) => d.completed).length;
                  return (
                    <div className={`week-card ${weekOpen ? 'open' : ''}`} key={weekKey}>
                      <button className="week-head" onClick={() => setOpenWeek(weekOpen ? null : weekKey)}>
                        <span className="week-index">W{wIndex + 1}</span>
                        <div className="week-head-main">
                          <strong>{week.title}</strong>
                          <span>{week.focus}</span>
                        </div>
                        <div className="week-head-meta">
                          <small>{weekCompleted}/{week.days.length} done</small>
                          <Chevron open={weekOpen} />
                        </div>
                      </button>

                      {weekOpen && (
                        <div className="days-list">
                          {week.days.map((day, dIndex) => {
                            const dayKey = `${pIndex}-${wIndex}-${dIndex}`;
                            const dayOpen = openDay === dayKey;
                            const isToday = todayPath && todayPath.join('-') === dayKey;
                            const isRest = day.exercises.length === 0;
                            return (
                              <div
                                className={`day-card ${day.completed ? 'completed' : ''} ${dayOpen ? 'open' : ''} ${isToday ? 'is-today' : ''}`}
                                key={dayKey}
                                id={`day-${dayKey}`}
                              >
                                <button className="day-head" onClick={() => setOpenDay(dayOpen ? null : dayKey)}>
                                  <span className={`day-status ${day.completed ? 'done' : ''} ${isRest ? 'rest' : ''}`}>
                                    {day.completed ? '✓' : isRest ? '–' : dIndex + 1}
                                  </span>
                                  <div className="day-head-main">
                                    <div className="day-head-title-row">
                                      <strong>{day.title}</strong>
                                      {isToday && <span className="today-badge">Today</span>}
                                    </div>
                                    <span>{day.summary}</span>
                                  </div>
                                  <div className="day-head-meta">
                                    <small>{day.load}</small>
                                    <Chevron open={dayOpen} />
                                  </div>
                                </button>

                                {dayOpen && (
                                  <div className="session-card">
                                    <div className="session-header">
                                      <div>
                                        <p className="eyebrow">Session</p>
                                        <h4>{day.sessionTitle}</h4>
                                      </div>
                                      <button
                                        className={day.completed ? 'secondary-btn done' : 'secondary-btn'}
                                        onClick={() => completeDay(pIndex, wIndex, dIndex)}
                                      >
                                        {day.completed ? 'Mark incomplete' : 'Mark complete'}
                                      </button>
                                    </div>

                                    {day.recovery?.length > 0 && (
                                      <div className="recovery-box">
                                        {day.recovery.map((item, i) => <p key={i}>{item}</p>)}
                                      </div>
                                    )}

                                    {day.mobility?.length > 0 && (
                                      <div className="mobility-strip">
                                        <div>
                                          <span className="field-label">Mobility / warm-up</span>
                                          <p>Separate from the main rehab exercise count.</p>
                                        </div>
                                        <div className="mobility-list">
                                          {day.mobility.map((m, i) => (
                                            <span key={i}>{m.name} · {m.prescription}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="session-blocks">
                                      {(() => {
                                        let lastBlockLabel = null;
                                        return day.exercises.map((ex, eIndex) => {
                                          const key = `${dayKey}-${eIndex}`;
                                          const exOpen = !!openExercise[key];
                                          const thisBlock = ex.blockLabel || null;
                                          const showBlockHeader = thisBlock && thisBlock !== lastBlockLabel;
                                          if (showBlockHeader) lastBlockLabel = thisBlock;
                                          return (
                                            <div key={key}>
                                              {showBlockHeader && (
                                                <div className="session-block-header">{thisBlock}</div>
                                              )}
                                              <div className="exercise-card">
                                                <button
                                                  className="exercise-main"
                                                  onClick={() => setOpenExercise({ ...openExercise, [key]: !exOpen })}
                                                >
                                                  <div className="exercise-title-row">
                                                    <h5>{ex.name}</h5>
                                                    <div className="exercise-title-meta">
                                                      <span>{ex.intensity}</span>
                                                      <Chevron open={exOpen} />
                                                    </div>
                                                  </div>
                                                  <div className="exercise-details">
                                                    <span>{ex.prescription}</span>
                                                    <span>{ex.equipment}</span>
                                                  </div>
                                                </button>
                                                {exOpen && (
                                                  <div className="exercise-expanded">
                                                    {ex.purpose && <p className="ex-purpose">{ex.purpose}</p>}
                                                    <div className="video-placeholder">
                                                      <span>Video demo placeholder</span>
                                                      <small>{ex.video}</small>
                                                    </div>
                                                    <p>{ex.cue}</p>
                                                    {ex.commonMistakes?.length > 0 && (
                                                      <div className="ex-mistakes">
                                                        <span className="ex-mistakes-label">Common mistakes to avoid</span>
                                                        <ul>
                                                          {ex.commonMistakes.map((m, mi) => <li key={mi}>{m}</li>)}
                                                        </ul>
                                                      </div>
                                                    )}
                                                    <button
                                                      className="alt-btn"
                                                      onClick={() => setOpenAlt({ ...openAlt, [key]: !openAlt[key] })}
                                                    >
                                                      Too hard? Show easier option
                                                    </button>
                                                    {openAlt[key] && (
                                                      <div className="alternative-box">
                                                        <strong>{ex.alternative.name}</strong>
                                                        <span>{ex.alternative.prescription}</span>
                                                        <p>{ex.alternative.cue}</p>
                                                      </div>
                                                    )}
                                                    {ex.painRule && (
                                                      <p className="ex-pain-rule">
                                                        <span>Pain rule: </span>{ex.painRule}
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

                                    {day.exercises.length === 0 && (
                                      <div className="rest-visual">
                                        <div className="mini-anatomy-preview">
                                          <HumanFrontIcon size="small" />
                                        </div>
                                        <p>Complete rest today. Recovery is the training stimulus.</p>
                                      </div>
                                    )}

                                    <div className="day-rule">
                                      <strong>Progress rule:</strong> {day.rule}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
