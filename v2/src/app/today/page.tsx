'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProtocol } from '@/content';
import { planToday, recordSession, timeline } from '@/engine/engine';
import type { Dose, Exercise } from '@/engine/schema';
import { PainSlider } from '@/components/PainSlider';
import { loadCourse, saveCourse, today, type StoredCourse, type StoredPlan } from '@/lib/store';

function formatDose(d: Dose): string {
  const parts = [`${d.sets} × ${d.reps ? `${d.reps} reps` : d.seconds ? (d.seconds >= 120 ? `${Math.round(d.seconds / 60)} min` : `${d.seconds} s`) : d.metres ? `${d.metres} m` : ''}`];
  if (d.intensity) parts.push(d.intensity);
  if (d.restSeconds) parts.push(`rest ${d.restSeconds} s`);
  return parts.join(' · ');
}

export default function Today() {
  const [course, setCourse] = useState<StoredCourse | null | undefined>(undefined);
  useEffect(() => setCourse(loadCourse()), []);
  if (course === undefined) return null;
  if (!course) return <Empty />;

  const p = getProtocol(course.state.protocolId);
  const date = today();
  const plan = course.plans[date];
  const update = (c: StoredCourse) => { saveCourse(c); setCourse(c); };

  const stageIndex = course.state.stageIndex;
  const [lo, hi] = timeline(p, course.state, date).remaining;

  return (
    <>
      <p className="eyebrow">{p.name} · {p.stages[stageIndex]?.name}</p>
      <div className="stages">{p.stages.map((s, i) => <span key={s.id} className={i < stageIndex ? 'done' : i === stageIndex ? 'now' : ''} />)}</div>
      <p className="small">{course.state.status === 'complete' ? 'Return-to-sport criteria met.' : `Estimated ${lo}–${hi} days to return to sport.`}</p>

      {course.state.status === 'complete' && <div className="card good"><h1>You're cleared to return.</h1><p className="sub">Keep up two strength sessions a week (Nordics and RDLs) to protect against re-injury.</p></div>}
      {course.state.status !== 'complete' && !plan && <CheckIn course={course} onDone={update} />}
      {plan && <Plan plan={plan} course={course} onDone={update} />}
    </>
  );
}

function Empty() {
  return (
    <>
      <h1>One clear step, every day.</h1>
      <p className="sub">Tell ROYO about your injury. You'll get today's session, and you'll move forward by passing tests, not by guessing.</p>
      <Link className="btn" href="/start">Start with a hamstring injury</Link>
    </>
  );
}

function CheckIn({ course, onDone }: { course: StoredCourse; onDone: (c: StoredCourse) => void }) {
  const p = getProtocol(course.state.protocolId);
  const [painMorning, setMorning] = useState(course.state.baselineMorningPain);
  const [painRest, setRest] = useState(1);
  const [flags, setFlags] = useState<string[]>([]);
  const daily = p.redFlags.filter((f) => f.daily);

  const submit = () => {
    const date = today();
    const r = planToday(p, course.state, { date, painRest, painMorning, redFlags: flags });
    const plan: StoredPlan = {
      kind: r.kind, dayType: r.dayType, testDue: r.testDue, stageId: r.stage.id, reasons: r.reasons, referral: r.referral,
      slots: r.slots.map((s) => ({ exerciseId: s.exercise.id, dose: s.dose, adjusted: s.adjusted })),
    };
    onDone({ ...course, state: r.state, plans: { ...course.plans, [date]: plan }, checkIns: { ...course.checkIns, [date]: { painRest, painMorning, redFlags: flags } } });
  };

  return (
    <>
      <h1>Morning check-in</h1>
      <p className="sub">Thirty seconds. Today's session is built from your answers.</p>
      <div className="card"><b>Pain when you got up this morning</b><PainSlider value={painMorning} onChange={setMorning} /></div>
      <div className="card"><b>Pain right now, at rest</b><PainSlider value={painRest} onChange={setRest} /></div>
      <div className="card">
        <b>Any of these since yesterday?</b>
        <div className="opts" style={{ marginTop: 10 }}>
          {daily.map((f) => (
            <button key={f.id} className="opt" aria-pressed={flags.includes(f.id)} onClick={() => setFlags((x) => x.includes(f.id) ? x.filter((y) => y !== f.id) : [...x, f.id])}>{f.question}</button>
          ))}
        </div>
      </div>
      <button className="btn" onClick={submit}>Build today's session</button>
    </>
  );
}

function Plan({ plan, course, onDone }: { plan: StoredPlan; course: StoredCourse; onDone: (c: StoredCourse) => void }) {
  const p = getProtocol(course.state.protocolId);
  const ex = (id: string) => p.exercises.find((e) => e.id === id) as Exercise;
  const [strengthPain, setStrengthPain] = useState(0);
  const [runPain, setRunPain] = useState(0);
  const hasRun = plan.slots.some((s) => ex(s.exerciseId).category === 'running');

  if (plan.kind === 'stop') {
    return (
      <div className="card alert">
        <p className="eyebrow">Plan paused</p>
        <h1>{plan.referral?.action === 'emergency' ? 'Get emergency care now.' : 'See a clinician before continuing.'}</h1>
        {plan.reasons.map((r) => <p key={r.code}>{r.text}</p>)}
      </div>
    );
  }

  const log = () => {
    const date = today();
    const state = recordSession(p, course.state, { date, maxPain: { strength: strengthPain, lengthening: strengthPain, ...(hasRun ? { running: runPain } : {}) } });
    onDone({ ...course, state, plans: { ...course.plans, [date]: { ...plan, done: true } } });
  };

  return (
    <>
      <h1>{plan.kind === 'rest' ? 'Rest day' : `Today · ${plan.dayType[0]!.toUpperCase()}${plan.dayType.slice(1)}`}</h1>
      {plan.reasons.map((r) => <p key={r.code} className="why">↳ {r.text}</p>)}
      {plan.testDue && <Link href="/test" className="btn ghost" style={{ margin: '10px 0' }}>Take today's tests</Link>}

      {plan.slots.length > 0 && (
        <div className="card">
          {plan.slots.map((s, i) => {
            const e = ex(s.exerciseId);
            return (
              <div key={i} className="ex">
                <b>{e.name}{e.painRule === 'painFree' ? <span className="tag">pain-free</span> : <span className="tag">≤ {p.rules.pain.strengthMax}/10 ok</span>}</b>
                <span className="dose">{formatDose(s.dose)}</span>
                {s.dose.note && <span className="small">{s.dose.note}</span>}
                {s.adjusted && <span className="small">↓ {s.adjusted}</span>}
                <ul className="cues">{e.cues.map((c) => <li key={c}>{c}</li>)}</ul>
                {e.loads[0] && <Link className="small" href={`/body?focus=${e.loads[0]}`}>See the muscle it works →</Link>}
              </div>
            );
          })}
        </div>
      )}

      {plan.kind === 'session' && !plan.done && (
        <div className="card">
          <b>Done? Log how it felt</b>
          <p className="small">Worst pain during strength and lengthening work</p>
          <PainSlider value={strengthPain} onChange={setStrengthPain} />
          {hasRun && <><p className="small">Worst pain while running</p><PainSlider value={runPain} onChange={setRunPain} /></>}
          <button className="btn" onClick={log}>Log session</button>
        </div>
      )}
      {plan.done && <div className="card good">Session logged. Check in again tomorrow morning.</div>}
    </>
  );
}
