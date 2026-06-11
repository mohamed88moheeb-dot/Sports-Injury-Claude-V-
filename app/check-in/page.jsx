'use client';

import { PageShell } from '../../components/layout/PageShell';
import { CheckInContent } from '../../components/sections/CheckInContent';
import { useRecovery } from '../providers/RecoveryContext';

export default function CheckInPage() {
  const { addCheckin, checkins } = useRecovery();

  return (
    <PageShell>
      <CheckInContent addCheckin={addCheckin} checkins={checkins} />
    </PageShell>
  );
}
