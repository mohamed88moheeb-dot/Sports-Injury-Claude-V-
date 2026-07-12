'use client';

import { gluteQuestionsForGroup } from '../../lib/clinical/gluteEngine/appAdapter/gluteAssessmentModel.mjs';

/**
 * Renders one group of the tailored glute assessment. Answers are stored
 * under assessment.gluteAnswers keyed by the engine input field, so they
 * flow straight into mapAssessmentToGluteInput.
 */
export function GluteGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.gluteAnswers || {};
  const questions = gluteQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, gluteAnswers: { ...(prev.gluteAnswers || {}), [key]: value } }));
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
