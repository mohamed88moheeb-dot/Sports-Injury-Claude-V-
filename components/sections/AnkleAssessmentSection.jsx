'use client';

import { ankleQuestionsForGroup } from '../../lib/clinical/ankleEngine/appAdapter/ankleAssessmentModel.mjs';

/**
 * Renders one group of the tailored ankle assessment. Answers are stored
 * under assessment.ankleAnswers keyed by the engine input field, so they flow
 * straight into mapAssessmentToAnkleInput. Mirror of KneeGroupFields.
 */
export function AnkleGroupFields({ group, assessment, setAssessment }) {
  const answers = assessment.ankleAnswers || {};
  const questions = ankleQuestionsForGroup(group);

  function setAnswer(key, value) {
    setAssessment((prev) => ({ ...prev, ankleAnswers: { ...(prev.ankleAnswers || {}), [key]: value } }));
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
