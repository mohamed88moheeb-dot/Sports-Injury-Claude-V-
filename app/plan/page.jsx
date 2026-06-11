'use client';

import { PageShell } from '../../components/layout/PageShell';
import { PlanContent } from '../../components/sections/PlanContent';
import { useRecovery } from '../providers/RecoveryContext';

export default function PlanPage() {
  const { profile, completeDay } = useRecovery();

  return (
    <PageShell>
      <PlanContent profile={profile} completeDay={completeDay} />
    </PageShell>
  );
}
