'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProtocol } from '@/content';
import { evaluateTests, matches, type TestDecision, type TestResults } from '@/engine/engine';
import { loadCourse, saveCourse, today, type StoredCourse } from '@/lib/store';

export default function TestDay() {
  const [course, setCourse] = useState<StoredCourse | null | undefined>(undefined);
  const [results, setResults] = useState<TestResults>({});
  const [decision, setDecision] = useState<TestDecision | null>(null);
  useEffect(() => setCourse(loadCourse()), []);
  if (course === undefined) return null;
  if (!course) return <p className="sub">Start a plan first. <Link href="/start">Start</Link></p>;

  const p = getProtocol(course.state.protocolId);
  const stage = p.stages[course.state.stageIndex]!;
  const gates = stage.gates.filter((g) => matches(g.when, course.state.answers, course.state.trackId));
  const testIds = [...new Set(gates.map((g) => g.test))];
  const tests = testIds.map((id) => p.tests.find((t) => t.id === id)!);
  const set = (id: string, v: number | boolean) => setResults((r) => ({ ...r, [id]: v }));

  const submit = () => {
    const d = evaluateTests(p, course.state, results, today());
    const next = { ...course, state: d.state };
    saveCourse(next);
    setCourse(next);
    setDecision(d);
  };

  if (decision) {
    const tone = decision.decision === 'advance' || decision.decision === 'complete' ? 'good' : decision.decision === 'regress' ? 'alert' : 'warn';
    const title = { advance: 'Stage passed', complete: 'Cleared to return', hold: 'Not yet — keep building', regress: 'One step back' }[decision.decision];
    return (
      <>
        <div className={`card ${tone}`}>
          <p className="eyebrow">Test result</p>
          <h1>{title}</h1>
          {decision.reasons.map((r, i) => <p key={i} className="why">↳ {r.text}</p>)}
        </div>
        <Link href="/today" className="btn">Back to today</Link>
      </>
    );
  }

  return (
    <>
      <p className="eyebrow">{stage.name} · test day</p>
      <h1>Pass these to move on</h1>
      <p className="sub">{stage.goal}</p>
      {tests.map((t) => {
        const gate = gates.filter((g) => g.test === t.id).map((g) => `${g.op} ${g.value}${t.unit ?? ''}`).join(' and ');
        const v = results[t.id];
        return (
          <div key={t.id} className="card">
            <b>{t.name}</b> <span className="tag">need {gate}</span>
            <ol className="cues">{t.instructions.map((s) => <li key={s}>{s}</li>)}</ol>
            {t.measure === 'boolean' ? (
              <div className="row" style={{ marginTop: 10 }}>
                <button className="opt" aria-pressed={v === true} onClick={() => set(t.id, true)}>Yes</button>
                <button className="opt" aria-pressed={v === false} onClick={() => set(t.id, false)}>No</button>
              </div>
            ) : (
              <label className="field">
                <input type="number" inputMode="decimal" min={0} max={t.measure === 'percent' ? 150 : 10} value={typeof v === 'number' ? v : ''} onChange={(e) => set(t.id, Number(e.target.value))} />
              </label>
            )}
          </div>
        );
      })}
      <button className="btn" disabled={testIds.some((id) => results[id] === undefined)} onClick={submit}>See my result</button>
    </>
  );
}
