'use client';

import { lowerBackQuestionsForGroup } from '../../lib/clinical/lowerBackEngine/appAdapter/lowerBackAssessmentModel.mjs';

/**
 * Renders one group of the tailored lower back assessment. Answers are
 * stored under assessment.lowerBackAnswers keyed by the engine input field,
 * so they flow straight into mapAssessmentToLowerBackInput.
 */
export function LowerBackGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.lowerBackAnswers || {};
  const questions = lowerBackQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, lowerBackAnswers: { ...(prev.lowerBackAnswers || {}), [key]: value } }));
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
