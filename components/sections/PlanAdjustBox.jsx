'use client';

import { useState } from 'react';
import { useRecovery } from '../../app/providers/RecoveryContext';

/**
 * Free-text "adjust this week" box. Re-composes the CURRENT stage's sessions
 * from the SAME clinically-vetted exercise pool, steered by the comment
 * (equipment limits, a focus request, a mention of a different injury) — it
 * never re-diagnoses or changes the stage/timeline. Gemini-powered when a key
 * is configured; otherwise this quietly does nothing useful to click (the
 * box only renders for engines that support it).
 */
export function PlanAdjustBox({ profile }) {
  const { adjustQuadPlan, adjustingPlan, adjustPlanError } = useRecovery();
  const [comment, setComment] = useState('');
  const [lastResult, setLastResult] = useState(null);

  if (!profile || profile.engine !== 'quad') return null;

  async function handleAdjust() {
    const res = await adjustQuadPlan(comment);
    setLastResult(res);
  }

  return (
    <div className="plan-adjust-box">
      <div className="plan-adjust-head">
        <span className="plan-adjust-title">Adjust this week</span>
        <span className={`plan-adjust-badge ${profile.aiPlanMode === 'ai_composed' ? 'ai' : 'std'}`}>
          {profile.aiPlanMode === 'ai_composed' ? 'AI-composed' : 'Standard selection'}
        </span>
      </div>
      <p className="plan-adjust-hint">
        Tell it about equipment limits, what to focus on, or how you're feeling — it re-picks this week's
        exercises from your same clinically-approved list.
      </p>
      <textarea
        className="plan-adjust-input"
        placeholder="e.g. “No gym today, just bodyweight” or “Focus more on strength this week”"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
      />
      <div className="plan-adjust-actions">
        <button className="primary-btn" disabled={adjustingPlan} onClick={handleAdjust}>
          {adjustingPlan ? 'Adjusting…' : 'Adjust my plan'}
        </button>
      </div>
      {adjustPlanError && <p className="plan-adjust-error">⚠ {adjustPlanError}</p>}
      {lastResult?.ok && lastResult.outOfScopeNote && (
        <p className="plan-adjust-note">ℹ {lastResult.outOfScopeNote}</p>
      )}
    </div>
  );
}
