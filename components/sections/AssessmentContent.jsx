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
  hamstring:'Hamstrings', quadriceps:'Quadriceps', adductor_groin:'Adductor / Groin',
  hip_flexor:'Hip flexor', abductor:'Abductor / TFL', calf_shin:'Calf / Shin',
  knee:'Knee', ankle:'Ankle', glutes:'Glutes', lower_back:'Lower back',
  back:'Back / Lats', it_band:'IT band', shoulder:'Shoulder', chest:'Chest',
  abdomen:'Abdomen', obliques:'Obliques', lower_abdomen:'Lower abdomen',
  biceps:'Biceps', triceps:'Triceps', elbow:'Elbow', forearm:'Forearm', neck:'Neck', serratus:'Serratus',
};

export function AssessmentContent({ assessment, setAssessment, toggleArray, generateProfile }) {
  const router = useRouter();
  return (
    <section className="assessment-grid app-section app-section-soft">
      <div className="section-heading span-2">
        <div>
          <p className="eyebrow">Build your profile</p>
          <h2>Tell us what happened.</h2>
          <p>
            The plan adapts to location, grade, mechanism, sport demands, equipment, pain, and
            warning signs.
          </p>
        </div>
      </div>

      <div className="section-card span-2 glass-card">
        <p className="eyebrow">Step 1</p>
        <h3>Injury profile</h3>

        {/* ── 1. Body region — always first ─────────────── */}
        <div className="body-region-selector" onClick={() => router.push('/anatomy')}>
          <div className="body-region-selector-left">
            <p className="eyebrow">Injury location</p>
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

        {/* ── 3. Secondary areas + Symptom side by side ──── */}
        <div className="form-grid">
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
        </div>
      </div>

      <div className="section-card span-2 glass-card soft-tint">
        <p className="eyebrow">Step 2</p>
        <h3>Sport, demands, and equipment</h3>
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

      <div className="section-card span-2 glass-card">
        <p className="eyebrow">Step 3</p>
        <h3>Pain and context</h3>
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

      <div className="section-card span-2 glass-card redflag-card">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Optional safety screen</p>
            <h3>Warning signs</h3>
            <p className="short-copy">
              Select only what applies. These answers help the app avoid unsafe rehab suggestions.
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
