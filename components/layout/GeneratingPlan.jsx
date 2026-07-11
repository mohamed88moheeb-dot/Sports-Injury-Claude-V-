'use client';

import { useEffect, useState } from 'react';

const PLAN_BUILD_STEPS = [
  'Reading your injury mechanism and pain levels',
  'Matching your profile to the clinical rehab protocol library',
  'Selecting exercises for your equipment and movement demands',
  'Sequencing phase-by-phase sessions, loads, and rest days',
  'Calibrating your return-to-sport timeline',
];

/**
 * @param {boolean} ready  true only when the real request has actually
 *   succeeded (passed by the caller). While false, this NEVER claims to be
 *   done — it cycles through the steps on a timer so the user always sees
 *   live progress, however long the real request takes, instead of a fixed
 *   animation that can finish before the request does (leaving "Opening your
 *   plan…" stuck) or cut off mid-step if the request is faster than the timer.
 */
export function GeneratingPlan({ ready = false }) {
  const [step, setStep] = useState(0);
  // Cap at the second-to-last step while still waiting — the LAST step only
  // lights up once `ready` is real, so "done" always means done.
  const maxStepWhileWaiting = PLAN_BUILD_STEPS.length - 2;

  useEffect(() => {
    if (ready) return;
    if (step >= maxStepWhileWaiting) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, maxStepWhileWaiting)), 1100);
    return () => clearTimeout(t);
  }, [step, ready, maxStepWhileWaiting]);

  const activeStep = ready ? PLAN_BUILD_STEPS.length - 1 : step;

  return (
    <section className="generating-shell app-section app-section-soft">
      <div className="gen-header">
        <h2 className={ready ? 'gen-heading-done' : ''}>
          {ready ? 'Plan built.' : 'Building your recovery plan…'}
        </h2>
        <p className="gen-subtext">
          {ready
            ? 'Your personalised multi-phase plan is ready. Opening now.'
            : 'Your injury profile is being matched against the rehab protocol library.'}
        </p>
      </div>
      <div className="gen-steps">
        {PLAN_BUILD_STEPS.map((label, i) => (
          <div key={i} className={`gen-step ${i < activeStep ? 'done' : i === activeStep ? 'active' : ''}`}>
            <div className="gen-step-dot" />
            <span>{i < activeStep ? <s style={{ opacity: 0.55 }}>{label}</s> : label}</span>
            {i < activeStep && <span className="gen-step-check">✓</span>}
          </div>
        ))}
      </div>
      {ready && (
        <div className="gen-ready">
          <span className="gen-ready-dot" />
          <span>Opening your plan…</span>
        </div>
      )}
    </section>
  );
}
