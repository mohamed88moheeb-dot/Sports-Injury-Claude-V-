'use client';

/**
 * components/sections/RfAssessmentSection.jsx
 * ---------------------------------------------------------------------------
 * RF-specific assessment fields, derived from the governed RF-ASSESS objects
 * (via rfAssessmentModel). `RfGroupFields` renders one group's questions and is
 * embedded as steps INSIDE the existing /assessment carousel (no separate
 * mini-section). Answers write to assessment.rfAnswers and drive the RF engine
 * directly. All qualitative; every item skippable.
 * ---------------------------------------------------------------------------
 */

import { RF_ASSESSMENT_QUESTIONS, bandValue } from '../../lib/clinical/rfBetaAppAdapter/rfAssessmentModel.mjs';
import { Slider } from '../ui/Slider';

/** Render the questions belonging to one group as form fields. */
export function RfGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.rfAnswers || {};
  const questions = RF_ASSESSMENT_QUESTIONS.filter((q) => q.group === group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({
      ...prev,
      rfAnswers: { ...(prev.rfAnswers || {}), [key]: value, red_flags_acknowledged: true }
    }));
  }
  // Sliders store BOTH the numeric value (valueKey) and the qualitative enum (key),
  // so the engine + completeness read the enum directly and the bar can re-render.
  function setSlider(q, numeric) {
    const enumVal = bandValue(numeric, q.bands);
    setAssessment((prev) => ({
      ...prev,
      rfAnswers: { ...(prev.rfAnswers || {}), [q.valueKey]: numeric, [q.key]: enumVal }
    }));
  }
  function toggleRedFlag(value) {
    setAssessment((prev) => {
      const cur = (prev.rfAnswers && prev.rfAnswers.red_flags) || [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      return { ...prev, rfAnswers: { ...(prev.rfAnswers || {}), red_flags: next, red_flags_acknowledged: true } };
    });
  }

  return (
    <>
      {questions.map((q) => {
        if (q.type === 'slider') {
          const raw = answers[q.valueKey];
          const answered = raw !== undefined && raw !== null && raw !== '';
          const val = answered ? Number(raw) : (q.default ?? Math.round((q.min + q.max) / 2));
          const band = q.bands.find((b) => val <= b.max) || q.bands[q.bands.length - 1];
          return (
            <div key={q.id} style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 8, color: 'var(--ink-2)' }}>
                {q.prompt}{q.core && <span style={{ color: '#F59E0B' }}> *</span>}
                {q.highCaution && <span style={{ fontSize: 11, color: 'var(--muted)' }}> (advanced)</span>}
              </label>
              <Slider label={answered ? band.label : 'Slide to answer'} value={val} min={q.min} max={q.max} invertColor={!!q.invertColor} onChange={(v) => setSlider(q, v)} />
            </div>
          );
        }
        return (
        <div key={q.id} style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 14, marginBottom: 6, color: 'var(--ink-2)' }}>
            {q.prompt}{q.core && <span style={{ color: '#F59E0B' }}> *</span>}
            {q.highCaution && <span style={{ fontSize: 11, color: 'var(--muted)' }}> (advanced)</span>}
          </label>

          {q.type === 'multi' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((o) => {
                const active = (answers.red_flags || []).includes(o.value);
                return (
                  <button key={o.value} type="button" onClick={() => toggleRedFlag(o.value)}
                    className={`ac-redflag-btn${active ? ' active' : ''}`}
                    style={{ textAlign: 'left' }}>
                    {active ? '☑ ' : '☐ '}{o.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <select value={answers[q.key] ?? ''} onChange={(e) => setAnswer(q.key, e.target.value)} style={{ width: '100%' }}>
              <option value="">Select…</option>
              {q.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>
        );
      })}
    </>
  );
}
