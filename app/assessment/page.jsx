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
  const { assessment, setAssessment, toggleArray, generateProfile, generating } = useRecovery();
  const didLoad = useRef(false);

  // Load draft from localStorage on first mount
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if it looks like a real draft (has a region or story)
        if (parsed && (parsed.primaryRegion || parsed.story)) {
          setAssessment(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft to localStorage on every change (debounced via useEffect)
  useEffect(() => {
    if (!didLoad.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
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
        />
      )}
    </PageShell>
  );
}
