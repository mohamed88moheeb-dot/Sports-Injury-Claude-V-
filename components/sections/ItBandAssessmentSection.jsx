'use client';

import { itBandQuestionsForGroup } from '../../lib/clinical/itBandEngine/appAdapter/itBandAssessmentModel.mjs';

/**
 * Renders one group of the tailored IT band assessment. Answers are stored
 * under assessment.itBandAnswers keyed by the engine input field, so they
 * flow straight into mapAssessmentToItBandInput.
 */
export function ItBandGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.itBandAnswers || {};
  const questions = itBandQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, itBandAnswers: { ...(prev.itBandAnswers || {}), [key]: value } }));
  }

  return (
    <>
      {questions.map((q) => (
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
      ))}
    </>
  );
}
