'use client';

import { useRouter } from 'next/navigation';
import InteractiveAnatomy from '../../components/InteractiveAnatomy';
import { PageShell } from '../../components/layout/PageShell';
import { useRecovery } from '../providers/RecoveryContext';
import { AIBadge } from '../../components/ui/GlassCard';

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Body map</p>
              <AIBadge label="3D scanner" />
            </div>
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

        {/* ── Anatomy canvas — scanner wrapper ─────────── */}
        <div className="anatomy-page-canvas">

          {/* Hint bar */}
          <div className="anatomy-page-hint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
            </svg>
            <span>Tap a region on the body map. Use <strong>Front / Back</strong> to switch views.</span>
          </div>

          {/* Scanner wrapper with grid + scan line */}
          <div className="scanner-panel" style={{ borderRadius: 'var(--r-xl)', padding: 0 }}>
            <div className="scanner-grid" aria-hidden="true" />
            <div style={{ position: 'relative', zIndex: 1, padding: '0 16px 16px' }}>
              <InteractiveAnatomy assessment={assessment} setAssessment={setAssessment} />
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
