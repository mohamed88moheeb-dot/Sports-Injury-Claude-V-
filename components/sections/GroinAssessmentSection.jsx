'use client';

import { groinQuestionsForGroup } from '../../lib/clinical/groinEngine/appAdapter/groinAssessmentModel.mjs';

/**
 * Renders one group of the tailored adductor/groin assessment. Answers are
 * stored under assessment.groinAnswers keyed by the engine input field, so
 * they flow straight into mapAssessmentToGroinInput. Mirror of CalfGroupFields.
 */
export function GroinGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.groinAnswers || {};
  const questions = groinQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, groinAnswers: { ...(prev.groinAnswers || {}), [key]: value } }));
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
