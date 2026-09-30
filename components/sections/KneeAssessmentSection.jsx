'use client';

import { kneeQuestionsForGroup } from '../../lib/clinical/kneeEngine/appAdapter/kneeAssessmentModel.mjs';
import { Slider } from '../ui/Slider';

/**
 * Renders one group of the tailored knee assessment. Answers are stored under
 * assessment.knee keyed by the engine input field, so they flow straight into
 * mapAssessmentToKneeInput. Mirror of QuadGroupFields / RfGroupFields.
 */
export function KneeGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.knee || {};
  const questions = kneeQuestionsForGroup(group, assessment);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, knee: { ...(prev.knee || {}), [key]: value } }));
  }

  return (
    <>
      {questions.map((q) => {
        if (q.type === 'slider') {
          const raw = answers[q.key];
          const answered = raw !== undefined && raw !== null && raw !== '';
          const val = answered ? Number(raw) : (q.default ?? Math.round((q.min + q.max) / 2));
          const band = (q.bands || []).find((b) => val <= b.max) || (q.bands || [])[q.bands?.length - 1];
          return (
            <div key={q.id} className="rf-field">
              <label className="rf-field-label">
                {q.prompt}
                {q.core && <span className="rf-field-required"> *</span>}
              </label>
              {q.hint && <p className="rf-field-hint">{q.hint}</p>}
              <Slider
                label={answered ? (band ? band.label : `${val}${q.unit ? ' ' + q.unit : ''}`) : 'Slide to answer'}
                value={val}
                min={q.min}
                max={q.max}
                onChange={(v) => setAnswer(q.key, v)}
              />
            </div>
          );
        }

        // default: choice (select)
        return (
          <div key={q.id} className="rf-field">
            <label className="rf-field-label">
              {q.prompt}
              {q.core && <span className="rf-field-required"> *</span>}
            </label>
            {q.hint && <p className="rf-field-hint">{q.hint}</p>}
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
