'use client';

import { hamstringQuestionsForGroup } from '../../lib/clinical/hamstringEngine/appAdapter/hamstringAssessmentModel.mjs';

/**
 * Renders one group of the tailored hamstring assessment. Answers are stored
 * under assessment.hamstringAnswers keyed by the engine input field, so they
 * flow straight into mapAssessmentToHamstringInput. Mirror of KneeGroupFields.
 */
export function HamstringGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.hamstringAnswers || {};
  const questions = hamstringQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, hamstringAnswers: { ...(prev.hamstringAnswers || {}), [key]: value } }));
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
