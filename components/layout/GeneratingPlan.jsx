'use client';

import { useEffect, useState } from 'react';

const PLAN_BUILD_STEPS = [
  'Analysing injury mechanism and pain levels',
  'Matching your pattern to the injury protocol library',
  'Selecting exercises for your equipment and sport demands',
  'Assembling phase-by-phase training sessions with rest days',
  'Finalising your return-to-sport pathway',
];

export function GeneratingPlan() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= PLAN_BUILD_STEPS.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1350);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <section className="generating-shell app-section app-section-soft">
      <div className="gen-header">
        <p className="eyebrow stacked-eyebrow">
          <span>Personalising your plan</span>
        </p>
        <h2>Building your recovery plan...</h2>
        <p className="gen-subtext">
          Analysing your answers and assembling a full multi-phase plan matched to your injury,
          equipment, and sport demands.
        </p>
      </div>
      <div className="gen-steps">
        {PLAN_BUILD_STEPS.map((label, i) => (
          <div key={i} className={`gen-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="gen-step-dot" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
