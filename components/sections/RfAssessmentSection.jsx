'use client';

import { RF_ASSESSMENT_QUESTIONS, bandValue } from '../../lib/clinical/rfBetaAppAdapter/rfAssessmentModel.mjs';
import { Slider } from '../ui/Slider';

export function RfGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.rfAnswers || {};
  const questions = RF_ASSESSMENT_QUESTIONS.filter((q) => {
    if (q.group !== group) return false;
    if (!q.conditional) return true;
    const { key, in: mustIn, notIn } = q.conditional;
    const val = answers[key];
    if (mustIn && !mustIn.includes(val)) return false;
    if (notIn && notIn.includes(val)) return false;
    return true;
  });

  function setAnswer(key, value) {
    setAssessment((prev) => ({
      ...prev,
      rfAnswers: { ...(prev.rfAnswers || {}), [key]: value, red_flags_acknowledged: true }
    }));
  }

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
            <div key={q.id} className="rf-field">
              <label className="rf-field-label">
                {q.prompt}
                {q.core && <span className="rf-field-required"> *</span>}
                {q.highCaution && <span className="rf-field-advanced"> Advanced</span>}
              </label>
              {q.hint && <p className="rf-field-hint">{q.hint}</p>}
              <Slider
                label={answered ? band.label : 'Slide to answer'}
                value={val}
                min={q.min}
                max={q.max}
                invertColor={!!q.invertColor}
                onChange={(v) => setSlider(q, v)}
              />
            </div>
          );
        }

        if (q.type === 'multi') {
          const active = answers.red_flags || [];
          return (
            <div key={q.id} className="rf-field">
              <label className="rf-field-label">
                {q.prompt}
                {q.core && <span className="rf-field-required"> *</span>}
              </label>
              <div className="rf-flag-grid">
                {q.options.map((o) => {
                  const isActive = active.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={`rf-flag-chip${isActive ? ' rf-flag-chip--active' : ''}`}
                      onClick={() => toggleRedFlag(o.value)}
                    >
                      <span className="rf-flag-chip-check">
                        {isActive ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : null}
                      </span>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        // default: select
        return (
          <div key={q.id} className="rf-field">
            <label className="rf-field-label">
              {q.prompt}
              {q.core && <span className="rf-field-required"> *</span>}
              {q.highCaution && <span className="rf-field-advanced"> Advanced</span>}
            </label>
            {q.hint && (
              <p className="rf-field-hint">{q.hint}</p>
            )}
            <select
              value={answers[q.key] ?? ''}
              onChange={(e) => setAnswer(q.key, e.target.value)}
              className="rf-select"
            >
              <option value="">Select…</option>
              {q.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        );
      })}
    </>
  );
}
