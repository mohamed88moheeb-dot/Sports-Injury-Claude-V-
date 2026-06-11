'use client';

import { PageShell } from '../../components/layout/PageShell';
import { DashboardContent } from '../../components/sections/DashboardContent';
import { useRecovery } from '../providers/RecoveryContext';

export default function DashboardPage() {
  const { profile, dashboardStats, saving, saveMessage } = useRecovery();

  return (
    <PageShell>
      <DashboardContent
        profile={profile}
        stats={dashboardStats}
        saving={saving}
        saveMessage={saveMessage}
      />
    </PageShell>
  );
}
