'use client';

import { useState, useRef, useEffect } from 'react';
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

const STEPS = [
  { label: 'Injury profile' },
  { label: 'Sport & demands' },
  { label: 'Pain & context' },
  { label: 'Red flags' },
];

export function AssessmentContent({ assessment, setAssessment, toggleArray, generateProfile, profile }) {
  const router  = useRouter();
  const [step, setStep] = useState(0);
  const stepRef = useRef(0); // shadow ref so touch handlers always see current step
  const trackRef = useRef(null);

  // Raw touch state — refs only, zero re-renders during drag
  const touchStartX  = useRef(null);
  const touchStartY  = useRef(null);
  const isDragging   = useRef(false);
  const lockedAxis   = useRef(null); // 'h' | 'v' | null

  // Stale plan: user picked a new region but has an old plan
  const planIsStale = profile && assessment.primaryRegion
    && assessment.primaryRegion !== profile.primaryRegion;

  function goTo(next) {
    const cur = stepRef.current;
    if (next === cur || next < 0 || next >= STEPS.length) return;
    stepRef.current = next;
    setStep(next);
  }

  function handleNext() {
    const cur = stepRef.current;
    if (cur < STEPS.length - 1) goTo(cur + 1);
    else generateProfile();
  }

  function handleBack() {
    const cur = stepRef.current;
    if (cur > 0) goTo(cur - 1);
  }

  // ── Real-time drag: all DOM manipulation, no React state ──────────
  function getSlides() {
    return trackRef.current ? trackRef.current.querySelectorAll('.ac-slide') : [];
  }

  function setDragTransforms(dx) {
    const slides = getSlides();
    slides.forEach((slide, i) => {
      const cur = stepRef.current;
      let base = 0;
      if (i < cur) base = -100;
      else if (i > cur) base = 100;
      // Percentage offset + pixel drag (use vw units via calc)
      slide.style.transition = 'none';
      slide.style.transform  = `translate3d(calc(${base}% + ${dx}px), 0, 0)`;
    });
  }

  function resetTransforms() {
    const slides = getSlides();
    slides.forEach((slide, i) => {
      const cur = stepRef.current;
      let base = 0;
      if (i < cur) base = -100;
      else if (i > cur) base = 100;
      slide.style.transition = '';
      slide.style.transform  = '';  // let CSS class handle it
    });
  }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current  = false;
    lockedAxis.current  = null;
  }

  function onTouchMove(e) {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Lock axis on first significant movement
    if (!lockedAxis.current) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        lockedAxis.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
      }
    }

    if (lockedAxis.current !== 'h') return; // vertical scroll — don't interfere

    // Prevent page scroll while swiping horizontally
    e.preventDefault();
    isDragging.current = true;

    // Clamp drag: resist over-swiping at boundaries
    const cur = stepRef.current;
    const bounded =
      (dx > 0 && cur === 0) ? dx * 0.2 :
      (dx < 0 && cur === STEPS.length - 1) ? dx * 0.2 :
      dx;

    setDragTransforms(bounded);
  }

  function onTouchEnd(e) {
    if (!isDragging.current) {
      touchStartX.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    isDragging.current  = false;
    lockedAxis.current  = null;

    resetTransforms(); // restore CSS class-based positions with transition

    const THRESHOLD = 50;
    if (dx < -THRESHOLD) handleNext();
    else if (dx > THRESHOLD) handleBack();
  }

  // Register touchmove as non-passive so preventDefault works on mobile
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slide position classes
  function slidePos(i) {
    if (i === step) return 'ac-slide ac-slide--active';
    if (i < step)   return 'ac-slide ac-slide--prev';
    return               'ac-slide ac-slide--next';
  }

  return (
    <div className="ac-shell">

      {/* ── Top: persistent heading + step indicator ─────── */}
      <div className="ac-header">
        <div className="ac-page-heading">
          <h2>Tell us what happened.</h2>
          <p>Your plan will adapt to injury location, how it happened, sport demands, pain levels, and any warning signs — so be specific.</p>
        </div>
        <div className="ac-step-row">
          <span className="ac-step-label">{STEPS[step].label}</span>
          <div className="ac-dots">
            {STEPS.map((s, i) => (
              <button
                key={i}
                className={`ac-dot${i === step ? ' active' : i < step ? ' done' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to step ${i + 1}: ${s.label}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Stale plan banner (step 0 only) ─────────────── */}
      {planIsStale && step === 0 && (
        <div className="ac-stale-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p>
            <strong>Location changed.</strong> Your plan was for <strong>{profile.regionName}</strong>.
            Complete the form and tap "Build plan" to regenerate.
          </p>
        </div>
      )}

      {/* ── Carousel track ───────────────────────────────── */}
      <div className="ac-track" ref={trackRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

        {/* STEP 1 — Injury profile */}
        <div className={slidePos(0)}>
          <div className="ac-card glass-card">

            {/* Injury location */}
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>

                <Field label="How it happened">
              <select
                value={assessment.mechanism}
                onChange={(e) => setAssessment({ ...assessment, mechanism: e.target.value })}
              >
                {mechanisms.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>

            <Field label="Days since injury">
              <input
                type="number" min="0"
                value={assessment.daysSince}
                onChange={(e) => setAssessment({ ...assessment, daysSince: Number(e.target.value) })}
              />
            </Field>

            <Field label="Symptom">
              <select
                value={assessment.symptoms[0] || ''}
                onChange={(e) => setAssessment({ ...assessment, symptoms: e.target.value ? [e.target.value] : [] })}
              >
                <option value="">Select symptom</option>
                {symptomTypes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Secondary area">
              <select
                value={assessment.secondaryRegions}
                onChange={(e) => setAssessment({ ...assessment, secondaryRegions: e.target.value })}
              >
                <option value="">None</option>
                {injuryRegions
                  .filter((r) => r.id !== assessment.primaryRegion)
                  .map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* STEP 2 — Sport, demands & equipment */}
        <div className={slidePos(1)}>
          <div className="ac-card glass-card">
            <Field label="Sport">
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
                  <option>Climbing / bouldering</option>
                  <option>Dance / cheerleading</option>
                  <option>Yoga / Pilates</option>
                  <option>General fitness</option>
                  <option>Other</option>
                </optgroup>
              </select>
            </Field>

            <Field label="Sport demands">
              <MultiSelectDropdown
                options={movements}
                selected={assessment.movements}
                onToggle={(val) => toggleArray('movements', val)}
                placeholder="Select all that apply"
              />
            </Field>

            <Field label="Equipment available">
              <MultiSelectDropdown
                options={equipmentOptions}
                selected={assessment.equipment}
                onToggle={(val) => toggleArray('equipment', val)}
                placeholder="Select all that apply"
              />
            </Field>
          </div>
        </div>

        {/* STEP 3 — Pain & context */}
        <div className={slidePos(2)}>
          <div className="ac-card glass-card">
            <div className="ac-sliders">
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
                label="Pain during sport movement"
                value={assessment.painSport}
                onChange={(v) => setAssessment({ ...assessment, painSport: v })}
              />
            </div>
            <textarea
              className="ac-textarea"
              placeholder="Describe in your own words — e.g. felt a pull while sprinting, pain when lengthening the leg…"
              value={assessment.story}
              onChange={(e) => setAssessment({ ...assessment, story: e.target.value })}
            />
          </div>
        </div>

        {/* STEP 4 — Red flags */}
        <div className={slidePos(3)}>
          <div className="ac-card glass-card">
            <p className="ac-redflag-intro">
              Select anything that applies. If you tick one, see a doctor before starting rehab.
            </p>
            <div className="ac-redflag-grid">
              {redFlagQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`ac-redflag-btn${assessment.redFlags.includes(q) ? ' active' : ''}`}
                  onClick={() => toggleArray('redFlags', q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>{/* /ac-track */}

      {/* ── Bottom navigation ────────────────────────────── */}
      <div className="ac-nav">
        <button
          type="button"
          className="ac-nav-btn"
          onClick={handleBack}
          disabled={step === 0}
          aria-label="Previous step"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <button
          type="button"
          className="ac-nav-btn ac-nav-btn--forward"
          onClick={handleNext}
          aria-label={step === STEPS.length - 1 ? 'Build recovery plan' : 'Next step'}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

    </div>
  );
}
