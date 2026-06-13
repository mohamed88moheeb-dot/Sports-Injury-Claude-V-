'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InteractiveAnatomy, { DETAIL_REGION_MAP } from '../../components/InteractiveAnatomy';
import { PageShell } from '../../components/layout/PageShell';
import { useRecovery } from '../providers/RecoveryContext';

export default function AnatomyPage() {
  const router = useRouter();
  const { assessment, setAssessment, profile, resetProfile } = useRecovery();
  const hasSelection = !!assessment.primaryRegion;
  // Glow when fully done: primary selected + either no sub-muscles or exact area also picked
  const regionHasSubs = assessment.primaryRegion && !!DETAIL_REGION_MAP[assessment.primaryRegion];
  const fullySelected = hasSelection && (!regionHasSubs || !!assessment.exactArea);
  const [view, setView] = useState('front');

  function handleConfirm() {
    if (!hasSelection) return;
    // If the user already has a plan AND selected a different injury region,
    // clear the stale plan so dashboard/plan don't show wrong data.
    if (profile && assessment.primaryRegion !== profile.primaryRegion) {
      resetProfile();
    }
    router.push('/assessment');
  }

  return (
    <PageShell>
      <div className="anatomy-page">

        {/* ── Slim top bar: back + toggle + confirm ── */}
        <div className="anatomy-topbar">
          <button className="pill-nav-btn pill-nav-btn--sm" onClick={() => router.push('/assessment')} aria-label="Back">
            <span className="pill-nav-circle">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
          </button>

          <div className="ia-view-pill">
            <button className={`ia-view-circle${view === 'front' ? ' active' : ''}`} onClick={() => setView('front')}>Front</button>
            <button className={`ia-view-circle${view === 'back' ? ' active' : ''}`} onClick={() => setView('back')}>Back</button>
          </div>

          <button
            className={`pill-nav-btn pill-nav-btn--sm pill-nav-btn--confirm${fullySelected ? ' pill-nav-btn--glowing' : ''}`}
            onClick={handleConfirm}
            aria-label="Confirm"
          >
            <span className="pill-nav-circle">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </button>
        </div>

        {/* ── Body map ── */}
        <div className="anatomy-canvas">
          <InteractiveAnatomy assessment={assessment} setAssessment={setAssessment} view={view} setView={setView} pillsOnTop />
        </div>

      </div>
    </PageShell>
  );
}
