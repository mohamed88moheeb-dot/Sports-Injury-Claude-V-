'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/layout/PageShell';
import { useRecovery } from '../providers/RecoveryContext';

export default function DiagnosisPage() {
  const router = useRouter();
  const { profile, assessment } = useRecovery();

  return (
    <PageShell>
      <section className="app-section app-section-soft">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Injury pattern</p>
            <h2>Likely diagnosis</h2>
            <p>Based on your location, mechanism, symptoms, and pain pattern.</p>
          </div>
        </div>

        {!profile ? (
          <div className="empty-state glass-card">
            <h3>No assessment yet.</h3>
            <p>Complete the assessment first to see your likely injury pattern.</p>
            <button className="primary-btn" onClick={() => router.push('/assessment')}>
              Start assessment
            </button>
          </div>
        ) : (
          <div className="diagnosis-cards">
            <div className="glass-card diagnosis-main-card">
              <p className="eyebrow">Primary region</p>
              <h3>{profile.regionName}</h3>
              <p>{profile.gradeName} · {profile.mechanism}</p>
              {profile.exactAreaName !== 'General area' && (
                <p className="small-label" style={{ marginTop: '0.5rem' }}>
                  Specific area: {profile.exactAreaName}
                </p>
              )}
            </div>

            <div className="glass-card diagnosis-status-card">
              <p className="eyebrow">Risk level</p>
              <h3>{profile.returnRange.includes('medical review') ? 'Higher risk' : 'Standard'}</h3>
              <p>{profile.aiStatus}</p>
            </div>

            <div className="glass-card diagnosis-return-card">
              <p className="eyebrow">Expected return range</p>
              <h3>{profile.returnRange}</h3>
              <p>Based on grade, mechanism, and sport demands. Individual variation applies.</p>
            </div>

            <div className="diagnosis-actions">
              <button className="primary-btn" onClick={() => router.push('/plan')}>
                View recovery plan
              </button>
              <button className="secondary-btn" onClick={() => router.push('/assessment')}>
                Redo assessment
              </button>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
