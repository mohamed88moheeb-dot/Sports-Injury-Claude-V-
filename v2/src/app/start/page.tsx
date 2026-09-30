'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProtocol } from '@/content';
import { startCourse, timeline, type Answers } from '@/engine/engine';
import type { Question, RedFlag } from '@/engine/schema';
import { saveCourse, today } from '@/lib/store';
import { PainSlider } from '@/components/PainSlider';

type Step = { kind: 'question'; q: Question } | { kind: 'flag'; f: RedFlag } | { kind: 'baseline' };

const ACTION_COPY: Record<RedFlag['action'], string> = {
  emergency: 'Get emergency care now',
  urgent: 'See a clinician in the next few days',
  see_clinician: 'Book a clinician before starting',
};

export default function Start() {
  const router = useRouter();
  const p = getProtocol('hamstring-strain');
  const steps = useMemo<Step[]>(() => [
    ...p.intake.map((q) => ({ kind: 'question' as const, q })),
    ...p.redFlags.map((f) => ({ kind: 'flag' as const, f })),
    { kind: 'baseline' as const },
  ], [p]);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [baseline, setBaseline] = useState(3);
  const [blocked, setBlocked] = useState<RedFlag[] | null>(null);

  const step = steps[i]!;
  const set = (id: string, v: Answers[string]) => setAnswers((a) => ({ ...a, [id]: v }));
  const next = () => {
    // sliders count as answered at their resting value
    if (step.kind === 'question' && step.q.kind === 'scale' && answers[step.q.id] === undefined) set(step.q.id, step.q.scale?.min ?? 0);
    setI((n) => Math.min(n + 1, steps.length - 1));
  };

  const finish = () => {
    const r = startCourse(p, answers, today(), baseline);
    if (!r.state) { setBlocked(r.triage.raised); return; }
    saveCourse({ state: r.state, plans: {}, checkIns: {} });
    router.push('/today');
  };

  if (blocked) {
    const worst = blocked[0]!;
    return (
      <>
        <p className="eyebrow">Before you start</p>
        <h1>{ACTION_COPY[worst.action]}</h1>
        {blocked.map((f) => <div key={f.id} className="card alert"><p style={{ margin: 0 }}>{f.message}</p></div>)}
        <p className="sub">ROYO only builds a plan once serious injuries have been ruled out. When a clinician has cleared you, come back and start again.</p>
        <button className="btn ghost" onClick={() => { setBlocked(null); setI(0); setAnswers({}); }}>Start again</button>
      </>
    );
  }

  const progress = Math.round(((i + 1) / steps.length) * 100);

  return (
    <>
      <p className="eyebrow">{p.name} · step {i + 1} of {steps.length}</p>
      <div className="stages"><span className="now" style={{ flex: `0 0 ${progress}%` }} /><span /></div>

      {step.kind === 'question' && <QuestionStep q={step.q} value={answers[step.q.id]} onChange={(v) => set(step.q.id, v)} />}

      {step.kind === 'flag' && (
        <>
          <h1>Safety check</h1>
          <p className="sub">{step.f.question}</p>
          <div className="opts">
            <button className="opt" aria-pressed={answers[step.f.id] === true} onClick={() => set(step.f.id, true)}>Yes</button>
            <button className="opt" aria-pressed={answers[step.f.id] === false} onClick={() => set(step.f.id, false)}>No</button>
          </div>
        </>
      )}

      {step.kind === 'baseline' && (
        <>
          <h1>How did it feel this morning?</h1>
          <p className="sub">Pain when you first got up, from 0 to 10. This is your baseline. ROYO compares every morning against it to catch flare-ups.</p>
          <PainSlider value={baseline} onChange={setBaseline} />
        </>
      )}

      <div className="row" style={{ marginTop: 24 }}>
        {i > 0 && <button className="btn ghost" onClick={() => setI(i - 1)}>Back</button>}
        {step.kind === 'baseline'
          ? <button className="btn" onClick={finish}>Build my plan</button>
          : <button className="btn" disabled={answered(step, answers) === false} onClick={next}>Continue</button>}
      </div>
      {step.kind === 'baseline' && <Preview answers={answers} />}
    </>
  );
}

function answered(step: Step, a: Answers): boolean {
  if (step.kind === 'question') return step.q.kind === 'scale' || a[step.q.id] !== undefined;
  if (step.kind === 'flag') return a[step.f.id] !== undefined;
  return true;
}

function Preview({ answers }: { answers: Answers }) {
  const p = getProtocol('hamstring-strain');
  const r = startCourse(p, answers, today(), 3);
  if (!r.state || !r.track) return null;
  const [lo, hi] = timeline(p, r.state, today()).remaining;
  return (
    <div className="card">
      <p className="eyebrow">{r.track.label}</p>
      <p style={{ margin: '6px 0' }}>{r.track.explain}</p>
      <p className="small">A typical return is <b>{lo}–{hi} days</b>. You move forward by passing tests, not by waiting.</p>
    </div>
  );
}

function QuestionStep({ q, value, onChange }: { q: Question; value: Answers[string] | undefined; onChange: (v: Answers[string]) => void }) {
  return (
    <>
      <h1>{q.prompt}</h1>
      {q.help && <p className="sub">{q.help}</p>}
      {q.kind === 'single' && (
        <div className="opts">
          {q.options?.map((o) => <button key={o.value} className="opt" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>)}
        </div>
      )}
      {q.kind === 'boolean' && (
        <div className="opts">
          <button className="opt" aria-pressed={value === true} onClick={() => onChange(true)}>Yes</button>
          <button className="opt" aria-pressed={value === false} onClick={() => onChange(false)}>No</button>
        </div>
      )}
      {q.kind === 'scale' && q.scale && (
        q.scale.max === 10
          ? <PainSlider value={typeof value === 'number' ? value : 0} onChange={onChange} />
          : <label className="field"><input type="number" min={q.scale.min} max={q.scale.max} value={typeof value === 'number' ? value : ''} onChange={(e) => onChange(Number(e.target.value))} /></label>
      )}
    </>
  );
}
