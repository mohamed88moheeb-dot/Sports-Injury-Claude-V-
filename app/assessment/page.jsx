'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/layout/PageShell';
import { AssessmentContent } from '../../components/sections/AssessmentContent';
import { GeneratingPlan } from '../../components/layout/GeneratingPlan';
import { useRecovery } from '../providers/RecoveryContext';

export default function AssessmentPage() {
  const router = useRouter();
  const { assessment, setAssessment, toggleArray, generateProfile, generating } = useRecovery();

  function handleGenerate() {
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
