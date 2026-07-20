'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { AssessmentContent } from '../../components/sections/AssessmentContent';
import { GeneratingPlan } from '../../components/layout/GeneratingPlan';
import { useRecovery } from '../providers/RecoveryContext';

const STORAGE_KEY = 'injuryguide_assessment_draft';

export default function AssessmentPage() {
  const router = useRouter();
  const { assessment, setAssessment, toggleArray, generateProfile, generating, generatingReady, profile, aiError, setAiError } = useRecovery();
  const didLoad = useRef(false);

  // Load draft from localStorage on first mount.
  // IMPORTANT: never restore primaryRegion / exactArea / secondaryRegions from the draft —
  // those come exclusively from the anatomy selector and already live in context.
  // Restoring them here would overwrite a selection the user just made on /anatomy.
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.story) {
          // eslint-disable-next-line no-unused-vars
          const { primaryRegion, exactArea, secondaryRegions, ...safeFields } = parsed;
          setAssessment(prev => ({ ...prev, ...safeFields }));
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft to localStorage on every change.
  // Exclude region fields — those are owned by the anatomy selector, not this page.
  useEffect(() => {
    if (!didLoad.current) return;
    try {
      // eslint-disable-next-line no-unused-vars
      const { primaryRegion, exactArea, secondaryRegions, ...safeFields } = assessment;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeFields));
    } catch {}
  }, [assessment]);

  function handleGenerate() {
    // Clear draft on successful submission
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setAiError(null);
    // The AI assesses AND plans; the user lands on the diagnosis page first so
    // the pattern, confidence and reasoning are shown before the plan.
    generateProfile(() => router.push('/diagnosis'));
  }

  return (
    <PageShell bare={!generating}>
      {generating ? (
        <GeneratingPlan ready={generatingReady} />
      ) : (
        <>
          {aiError && (
            <div style={{
              maxWidth: 560, margin: '0 auto 16px', padding: '12px 16px',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 12, color: '#FFB4B4', fontSize: 13, lineHeight: 1.6,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span><strong>Couldn’t build your plan.</strong> {aiError}</span>
            </div>
          )}
          <AssessmentContent
            assessment={assessment}
            setAssessment={setAssessment}
            toggleArray={toggleArray}
            generateProfile={handleGenerate}
            profile={profile}
          />
        </>
      )}
    </PageShell>
  );
}
