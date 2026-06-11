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

        {/* ── Slim top bar: back + confirm ── */}
        <div className="anatomy-topbar">
          <button className="anatomy-back-btn" onClick={() => router.push('/assessment')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>

          <button
            className={`primary-btn anatomy-confirm-btn${!hasSelection ? ' anatomy-confirm-disabled' : ''}`}
            onClick={() => hasSelection && router.push('/assessment')}
            disabled={!hasSelection}
          >
            {hasSelection ? 'Confirm →' : 'Select a region'}
          </button>
        </div>

        {/* ── Body map: title sits right above the SVG ── */}
        <div className="anatomy-canvas">
          <p className="anatomy-canvas-heading">Where is the injury?</p>
          <InteractiveAnatomy assessment={assessment} setAssessment={setAssessment} />
        </div>

      </div>
    </PageShell>
  );
}
