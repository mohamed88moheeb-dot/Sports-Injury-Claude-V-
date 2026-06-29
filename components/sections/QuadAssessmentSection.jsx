'use client';

import { quadQuestionsForGroup } from '../../lib/clinical/quadEngine/appAdapter/quadAssessmentModel.mjs';
import { Slider } from '../ui/Slider';

/**
 * Renders one group of the tailored quad assessment. Answers are stored under
 * assessment.quad keyed by the engine input field, so they flow straight into
 * mapAssessmentToQuadInput. Mirror of RfGroupFields. Slider answers store the
 * raw numeric to the engine key; the band label is display-only.
 */
export function QuadGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.quad || {};
  const questions = quadQuestionsForGroup(group, assessment);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, quad: { ...(prev.quad || {}), [key]: value } }));
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
