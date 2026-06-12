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
  const { assessment, setAssessment, toggleArray, generateProfile, generating, profile } = useRecovery();
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
    generateProfile(() => router.push('/dashboard'));
  }

  return (
    <PageShell>
      {generating ? (
        <GeneratingPlan />
      ) : (
        <AssessmentContent
          assessment={assessment}
          setAssessment={setAssessment}
          toggleArray={toggleArray}
          generateProfile={handleGenerate}
          profile={profile}
        />
      )}
    </PageShell>
  );
}
