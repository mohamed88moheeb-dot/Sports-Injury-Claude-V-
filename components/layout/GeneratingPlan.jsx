'use client';

import { useEffect, useState } from 'react';

const PLAN_BUILD_STEPS = [
  'Reading your injury mechanism and pain levels',
  'Matching your profile to the clinical rehab protocol library',
  'Selecting exercises for your equipment and movement demands',
  'Sequencing phase-by-phase sessions, loads, and rest days',
  'Calibrating your return-to-sport timeline',
];

export function GeneratingPlan() {
  const [step, setStep] = useState(0);
  const allDone = step >= PLAN_BUILD_STEPS.length - 1;

  useEffect(() => {
    if (step >= PLAN_BUILD_STEPS.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1350);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <section className="generating-shell app-section app-section-soft">
      <div className="gen-header">
        <h2 className={allDone ? 'gen-heading-done' : ''}>
          {allDone ? 'Plan built.' : 'Building your recovery plan…'}
        </h2>
        <p className="gen-subtext">
          {allDone
            ? 'Your personalised multi-phase plan is ready. Opening now.'
            : 'Your injury profile is being matched against the rehab protocol library. This takes about 30 seconds.'}
        </p>
      </div>
      <div className="gen-steps">
        {PLAN_BUILD_STEPS.map((label, i) => (
          <div key={i} className={`gen-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="gen-step-dot" />
            <span>{i < step ? <s style={{ opacity: 0.55 }}>{label}</s> : label}</span>
            {i < step && <span className="gen-step-check">✓</span>}
          </div>
        ))}
      </div>
      {allDone && (
        <div className="gen-ready">
          <span className="gen-ready-dot" />
          <span>Opening your plan…</span>
        </div>
      )}
    </section>
  );
}
