'use client';

import { calfQuestionsForGroup } from '../../lib/clinical/calfEngine/appAdapter/calfAssessmentModel.mjs';

/**
 * Renders one group of the tailored calf/shin assessment. Answers are stored
 * under assessment.calfAnswers keyed by the engine input field, so they flow
 * straight into mapAssessmentToCalfInput. Mirror of AnkleGroupFields.
 */
export function CalfGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.calfAnswers || {};
  const questions = calfQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, calfAnswers: { ...(prev.calfAnswers || {}), [key]: value } }));
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
