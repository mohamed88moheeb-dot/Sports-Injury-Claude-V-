'use client';

import { useRouter } from 'next/navigation';
import InteractiveAnatomy from '../../components/InteractiveAnatomy';
import { PageShell } from '../../components/layout/PageShell';
import { useRecovery } from '../providers/RecoveryContext';

export default function AnatomyPage() {
  const router = useRouter();
  const { assessment, setAssessment } = useRecovery();

  const hasSelection = !!assessment.primaryRegion;

  return (
    <PageShell>
      <div className="anatomy-page">

        {/* ── Header bar ───────────────────────────────── */}
        <div className="anatomy-page-header">
          <button className="anatomy-back-btn" onClick={() => router.push('/assessment')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <div className="anatomy-page-title">
            <p className="eyebrow">Body map</p>
            <h2>Where is the injury?</h2>
          </div>
          <button
            className={`primary-btn anatomy-confirm-btn${!hasSelection ? ' anatomy-confirm-disabled' : ''}`}
            onClick={() => hasSelection && router.push('/assessment')}
            disabled={!hasSelection}
          >
            {hasSelection ? 'Confirm →' : 'Select a region'}
          </button>
        </div>

        {/* ── Anatomy canvas ───────────────────────────── */}
        <div className="anatomy-page-canvas">
          <div className="anatomy-page-hint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
            </svg>
            <span>Tap a region on the body. Use Front / Back to switch views.</span>
          </div>
          <InteractiveAnatomy assessment={assessment} setAssessment={setAssessment} />
        </div>

      </div>
    </PageShell>
  );
}
