'use client';

import { useRouter } from 'next/navigation';
import { Field } from '../ui/Field';
import { Slider } from '../ui/Slider';
import { MultiSelectDropdown } from '../ui/MultiSelectDropdown';
import {
  injuryRegions,
  movements,
  equipmentOptions,
  mechanisms,
  symptomTypes,
  redFlagQuestions,
} from '../../data/rehabKnowledge';

const REGION_LABELS = {
  hamstring:'Hamstrings', quadriceps:'Quadriceps', adductor_groin:'Adductors',
  hip_flexor:'Hip flexor', abductor:'Abductor / TFL', calf_shin:'Calves',
  knee:'Knee', ankle:'Ankle', glutes:'Glutes', lower_back:'Lower back',
  back:'Back', it_band:'IT band', shoulder:'Shoulder', chest:'Chest',
  abdomen:'Abdomen', obliques:'Obliques', lower_abdomen:'Lower abdomen',
  biceps:'Biceps', triceps:'Triceps', elbow:'Elbow', forearm:'Forearm', neck:'Neck', serratus:'Serratus',
};

export function AssessmentContent({ assessment, setAssessment, toggleArray, generateProfile, profile }) {
  const router = useRouter();

  // True when user has a plan built for a DIFFERENT region than currently selected.
  // This means the plan is stale and must be rebuilt.
  const planIsStale = profile && assessment.primaryRegion && assessment.primaryRegion !== profile.primaryRegion;

  return (
    <section className="assessment-grid app-section app-section-soft">
      {planIsStale && (
        <div className="span-2" style={{
          background: 'rgba(232,160,32,0.10)',
          border: '1px solid rgba(232,160,32,0.32)',
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 4,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(180,110,0,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p style={{ fontSize: 13, color: 'rgba(120,70,0,0.90)', margin: 0, lineHeight: 1.4 }}>
            <strong>Your injury location changed.</strong> Your current plan was built for <strong>{profile.regionName}</strong>.
            Fill in the form below and tap <em>"Build my recovery plan"</em> to generate a new plan for your updated injury.
          </p>
        </div>
      )}

      <div className="section-heading span-2">
        <div>
          <h2>Tell us what happened.</h2>
          <p>
            Your plan will adapt to injury location, how it happened, sport demands, pain levels,
            and any warning signs — so be specific.
          </p>
        </div>
      </div>

      <div className="section-card span-2 glass-card fade-up stagger-1">
        <div className="step-header">
          <span className="step-number">1</span>
          <h3>Injury profile</h3>
        </div>

        {/* ── 1. Body region — always first ─────────────── */}
        <div className="body-region-selector" onClick={() => router.push('/anatomy')}>
          <div className="body-region-selector-left">
            <span className="body-region-label">Injury location</span>
            {assessment.primaryRegion ? (
              <div className="body-region-selected">
                <span className="body-region-dot" />
                <div>
                  <strong>{REGION_LABELS[assessment.primaryRegion] || assessment.primaryRegion}</strong>
                  {assessment.exactArea && (
                    <span className="body-region-sub">{assessment.exactArea.replace(/_/g, ' ')}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="body-region-placeholder">Tap to select injury location on body map</p>
            )}
          </div>
          <div className="body-region-selector-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        {/* ── 2. Mechanism (wider) + Days since (narrower) ─ */}
        <div className="form-grid-asymmetric">
          <Field label="How it happened">
            <select
              value={assessment.mechanism}
              onChange={(e) => setAssessment({ ...assessment, mechanism: e.target.value })}
            >
              {mechanisms.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Days since injury">
            <input
              type="number"
              min="0"
              value={assessment.daysSince}
              onChange={(e) => setAssessment({ ...assessment, daysSince: Number(e.target.value) })}
            />
          </Field>
        </div>

        {/* ── 3. What are you feeling? (wider) + Secondary areas (narrower) ── */}
        <div className="form-grid-asymmetric">
          <Field label="What are you feeling?">
            <select
              value={assessment.symptoms[0] || ''}
              onChange={(e) =>
                setAssessment({
                  ...assessment,
                  symptoms: e.target.value ? [e.target.value] : [],
                })
              }
            >
              <option value="">Select symptom</option>
              {symptomTypes.map((symptom) => (
                <option key={symptom} value={symptom}>
                  {symptom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Secondary areas">
            <select
              value={assessment.secondaryRegions}
              onChange={(e) => setAssessment({ ...assessment, secondaryRegions: e.target.value })}
            >
              <option value="">None</option>
              {injuryRegions
                .filter((r) => r.id !== assessment.primaryRegion)
                .map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="section-card span-2 glass-card soft-tint fade-up stagger-2">
        <div className="step-header">
          <span className="step-number">2</span>
          <h3>Sport, demands, and equipment</h3>
        </div>
        <Field label="What sports do you play?">
          <select
            value={assessment.sport || ''}
            onChange={(e) => setAssessment({ ...assessment, sport: e.target.value })}
          >
            <option value="">Select a sport</option>
            <optgroup label="Team sports">
              <option>Football (soccer)</option>
              <option>American football</option>
              <option>Rugby</option>
              <option>Basketball</option>
              <option>Volleyball</option>
              <option>Handball</option>
              <option>Hockey (field)</option>
              <option>Ice hockey</option>
              <option>Baseball</option>
              <option>Softball</option>
              <option>Cricket</option>
              <option>Lacrosse</option>
              <option>Water polo</option>
              <option>Netball</option>
            </optgroup>
            <optgroup label="Racket sports">
              <option>Tennis</option>
              <option>Badminton</option>
              <option>Squash</option>
              <option>Padel</option>
              <option>Table tennis</option>
              <option>Pickleball</option>
            </optgroup>
            <optgroup label="Athletics &amp; running">
              <option>Sprinting</option>
              <option>Middle / long distance running</option>
              <option>Hurdles</option>
              <option>Cross country</option>
              <option>Trail running</option>
              <option>Race walking</option>
            </optgroup>
            <optgroup label="Combat sports">
              <option>Boxing</option>
              <option>MMA</option>
              <option>Wrestling</option>
              <option>Judo</option>
              <option>BJJ</option>
              <option>Karate / Taekwondo</option>
              <option>Muay Thai</option>
            </optgroup>
            <optgroup label="Gym &amp; strength">
              <option>Weightlifting / Olympic lifting</option>
              <option>Powerlifting</option>
              <option>CrossFit</option>
              <option>Bodybuilding</option>
              <option>Gymnastics</option>
              <option>Calisthenics</option>
            </optgroup>
            <optgroup label="Water sports">
              <option>Swimming</option>
              <option>Surfing</option>
              <option>Rowing</option>
              <option>Kayaking / Canoeing</option>
              <option>Triathlon</option>
            </optgroup>
            <optgroup label="Cycling &amp; wheeled">
              <option>Road cycling</option>
              <option>Mountain biking</option>
              <option>BMX</option>
              <option>Skateboarding</option>
              <option>Rollerskating / inline</option>
            </optgroup>
            <optgroup label="Court &amp; other">
              <option>Golf</option>
              <option>Tennis (padel)</option>
              <option>Climbing / bouldering</option>
              <option>Dance / cheerleading</option>
              <option>Yoga / Pilates</option>
              <option>General fitness</option>
              <option>Other</option>
            </optgroup>
          </select>
        </Field>

        <Field label="What does your sport demand?">
          <MultiSelectDropdown
            options={movements}
            selected={assessment.movements}
            onToggle={(val) => toggleArray('movements', val)}
            placeholder="Select all that apply"
          />
        </Field>
        <Field label="What equipment do you have access to?">
          <MultiSelectDropdown
            options={equipmentOptions}
            selected={assessment.equipment}
            onToggle={(val) => toggleArray('equipment', val)}
            placeholder="Select all that apply"
          />
        </Field>
      </div>

      <div className="section-card span-2 glass-card fade-up stagger-3">
        <div className="step-header">
          <span className="step-number">3</span>
          <h3>Pain and context</h3>
        </div>
        <div className="slider-grid">
          <Slider
            label="Pain at rest"
            value={assessment.painRest}
            onChange={(v) => setAssessment({ ...assessment, painRest: v })}
          />
          <Slider
            label="Pain walking / stairs"
            value={assessment.painWalking}
            onChange={(v) => setAssessment({ ...assessment, painWalking: v })}
          />
          <Slider
            label="Pain if you try sport movement"
            value={assessment.painSport}
            onChange={(v) => setAssessment({ ...assessment, painSport: v })}
          />
        </div>
        <textarea
          placeholder="Describe the story in your own words. Example: I felt a pull while sprinting, pain is high when I lengthen the leg, walking is okay."
          value={assessment.story}
          onChange={(e) => setAssessment({ ...assessment, story: e.target.value })}
        />
      </div>

      <div className="section-card span-2 glass-card redflag-card fade-up stagger-4">
        <div className="section-heading-row">
          <div>
            <h3>Any of these apply?</h3>
            <p className="short-copy">
              Select anything that fits. If you check one, see a doctor before starting rehab — don't
              delay. These answers prevent the app from suggesting exercises that could make things worse.
            </p>
          </div>
        </div>
        <div className="redflag-grid compact">
          {redFlagQuestions.map((q) => (
            <button
              key={q}
              className={assessment.redFlags.includes(q) ? 'tiny-check active' : 'tiny-check'}
              onClick={() => toggleArray('redFlags', q)}
              type="button"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <button className="primary-btn generate-btn" onClick={generateProfile}>
        Build my recovery plan
      </button>
    </section>
  );
}
