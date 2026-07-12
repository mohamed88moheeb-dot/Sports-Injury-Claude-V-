'use client';

import { hipFlexorQuestionsForGroup } from '../../lib/clinical/hipFlexorEngine/appAdapter/hipFlexorAssessmentModel.mjs';

/**
 * Renders one group of the tailored hip flexor assessment. Answers are
 * stored under assessment.hipFlexorAnswers keyed by the engine input field,
 * so they flow straight into mapAssessmentToHipFlexorInput.
 */
export function HipFlexorGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.hipFlexorAnswers || {};
  const questions = hipFlexorQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, hipFlexorAnswers: { ...(prev.hipFlexorAnswers || {}), [key]: value } }));
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
