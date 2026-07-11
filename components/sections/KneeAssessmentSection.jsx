'use client';

import { kneeQuestionsForGroup } from '../../lib/clinical/kneeEngine/appAdapter/kneeAssessmentModel.mjs';

/**
 * Renders one group of the tailored knee assessment. Answers are stored under
 * assessment.kneeAnswers keyed by the engine input field, so they flow straight
 * into mapAssessmentToKneeInput. Mirror of QuadGroupFields / RfGroupFields.
 */
export function KneeGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.kneeAnswers || {};
  const questions = kneeQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, kneeAnswers: { ...(prev.kneeAnswers || {}), [key]: value } }));
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
