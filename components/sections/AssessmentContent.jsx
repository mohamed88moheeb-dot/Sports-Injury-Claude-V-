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
import { isRfCompatible } from '../../lib/clinical/rfBetaAppAdapter/rfBetaCompatibility.mjs';
import { computeRfFormFill } from '../../lib/clinical/rfBetaAppAdapter/rfAssessmentModel.mjs';
import { RfGroupFields } from './RfAssessmentSection';
import { quadRouteFor } from '../../lib/clinical/quadEngine/appAdapter/quadCompatibility.mjs';
import { inferQuadEntity, quadStepsFor, computeQuadFormFill } from '../../lib/clinical/quadEngine/appAdapter/quadAssessmentModel.mjs';
import { QuadGroupFields } from './QuadAssessmentSection';
import { kneeRouteFor } from '../../lib/clinical/kneeEngine/appAdapter/kneeCompatibility.mjs';
import { KNEE_STEPS, computeKneeFormFill } from '../../lib/clinical/kneeEngine/appAdapter/kneeAssessmentModel.mjs';
import { KneeGroupFields } from './KneeAssessmentSection';
import { hamstringRouteFor } from '../../lib/clinical/hamstringEngine/appAdapter/hamstringCompatibility.mjs';
import { HAMSTRING_STEPS, computeHamstringFormFill } from '../../lib/clinical/hamstringEngine/appAdapter/hamstringAssessmentModel.mjs';
import { HamstringGroupFields } from './HamstringAssessmentSection';
import { ankleRouteFor } from '../../lib/clinical/ankleEngine/appAdapter/ankleCompatibility.mjs';
import { ANKLE_STEPS, computeAnkleFormFill } from '../../lib/clinical/ankleEngine/appAdapter/ankleAssessmentModel.mjs';
import { AnkleGroupFields } from './AnkleAssessmentSection';
import { calfRouteFor } from '../../lib/clinical/calfEngine/appAdapter/calfCompatibility.mjs';
import { CALF_STEPS, computeCalfFormFill } from '../../lib/clinical/calfEngine/appAdapter/calfAssessmentModel.mjs';
import { CalfGroupFields } from './CalfAssessmentSection';
import { groinRouteFor } from '../../lib/clinical/groinEngine/appAdapter/groinCompatibility.mjs';
import { GROIN_STEPS, computeGroinFormFill } from '../../lib/clinical/groinEngine/appAdapter/groinAssessmentModel.mjs';
import { GroinGroupFields } from './GroinAssessmentSection';
import { hipFlexorRouteFor } from '../../lib/clinical/hipFlexorEngine/appAdapter/hipFlexorCompatibility.mjs';
import { HIP_FLEXOR_STEPS, computeHipFlexorFormFill } from '../../lib/clinical/hipFlexorEngine/appAdapter/hipFlexorAssessmentModel.mjs';
import { HipFlexorGroupFields } from './HipFlexorAssessmentSection';
import { gluteRouteFor } from '../../lib/clinical/gluteEngine/appAdapter/gluteCompatibility.mjs';
import { GLUTE_STEPS, computeGluteFormFill } from '../../lib/clinical/gluteEngine/appAdapter/gluteAssessmentModel.mjs';
import { GluteGroupFields } from './GluteAssessmentSection';
import { itBandRouteFor } from '../../lib/clinical/itBandEngine/appAdapter/itBandCompatibility.mjs';
import { IT_BAND_STEPS, computeItBandFormFill } from '../../lib/clinical/itBandEngine/appAdapter/itBandAssessmentModel.mjs';
import { ItBandGroupFields } from './ItBandAssessmentSection';
import { lowerBackRouteFor } from '../../lib/clinical/lowerBackEngine/appAdapter/lowerBackCompatibility.mjs';
import { LOWER_BACK_STEPS, computeLowerBackFormFill } from '../../lib/clinical/lowerBackEngine/appAdapter/lowerBackAssessmentModel.mjs';
import { LowerBackGroupFields } from './LowerBackAssessmentSection';

const REGION_LABELS = {
  hamstring:'Hamstrings', quadriceps:'Quadriceps', adductor_groin:'Adductors',
  hip_flexor:'Hip flexor', abductor:'Abductor / TFL', calf_shin:'Calves',
  knee:'Knee', ankle:'Ankle', glutes:'Glutes', lower_back:'Lower back',
  back:'Back', it_band:'IT band', shoulder:'Shoulder', chest:'Chest',
  abdomen:'Abdomen', obliques:'Obliques', lower_abdomen:'Lower abdomen',
  biceps:'Biceps', triceps:'Triceps', elbow:'Elbow', forearm:'Forearm', neck:'Neck', serratus:'Serratus',
};

const GENERIC_STEPS = [
  { label: 'Injury profile' },
  { label: 'Sport & demands' },
  { label: 'Pain & context' },
  { label: 'Red flags' },
];

// RF carousel steps — labels are user-facing; groups match RF_ASSESSMENT_QUESTIONS.
const RF_STEPS = [
  { label: 'How it started',      group: 'Injury context' },
  { label: 'Pain & symptoms',     group: 'Pain & symptoms' },
  { label: 'Strength & movement', group: 'Physical tests' },
  { label: 'Running & sport',     group: 'Running & sport tolerance' },
  { label: 'History',             group: 'Response & history' },
  { label: 'Safety check',        group: 'Safety check' },
];

export function AssessmentContent({ assessment, setAssessment, toggleArray, generateProfile, profile }) {
  const router  = useRouter();
  // Quad engine takes precedence for non-rectus quadriceps injuries; rectus
  // femoris falls through to the RF flow; everything else stays generic.
  const isHamstring = hamstringRouteFor(assessment) === 'hamstring';
  const isKnee = !isHamstring && kneeRouteFor(assessment) === 'knee';
  const isAnkle = !isHamstring && !isKnee && ankleRouteFor(assessment) === 'ankle';
  const isCalf = !isHamstring && !isKnee && !isAnkle && calfRouteFor(assessment) === 'calf';
  const isGroin = !isHamstring && !isKnee && !isAnkle && !isCalf && groinRouteFor(assessment) === 'groin';
  const isHipFlexor = !isHamstring && !isKnee && !isAnkle && !isCalf && !isGroin && hipFlexorRouteFor(assessment) === 'hip_flexor';
  const isGlute = !isHamstring && !isKnee && !isAnkle && !isCalf && !isGroin && !isHipFlexor && gluteRouteFor(assessment) === 'glutes';
  const isItBand = !isHamstring && !isKnee && !isAnkle && !isCalf && !isGroin && !isHipFlexor && !isGlute && itBandRouteFor(assessment) === 'it_band';
  const isLowerBack = !isHamstring && !isKnee && !isAnkle && !isCalf && !isGroin && !isHipFlexor && !isGlute && !isItBand && lowerBackRouteFor(assessment) === 'lower_back';
  const isQuad = !isHamstring && !isKnee && !isAnkle && !isCalf && !isGroin && !isHipFlexor && !isGlute && !isItBand && !isLowerBack && quadRouteFor(assessment) === 'quad';
  const isRf = !isHamstring && !isKnee && !isAnkle && !isCalf && !isGroin && !isHipFlexor && !isGlute && !isItBand && !isLowerBack && !isQuad && isRfCompatible(assessment);
  const quadEntity = isQuad ? inferQuadEntity(assessment) : null;
  const QUAD_STEPS = isQuad ? quadStepsFor(quadEntity) : null;
  const STEPS = isHamstring ? HAMSTRING_STEPS : isKnee ? KNEE_STEPS : isAnkle ? ANKLE_STEPS : isCalf ? CALF_STEPS : isGroin ? GROIN_STEPS : isHipFlexor ? HIP_FLEXOR_STEPS : isGlute ? GLUTE_STEPS : isItBand ? IT_BAND_STEPS : isLowerBack ? LOWER_BACK_STEPS : isQuad ? QUAD_STEPS : isRf ? RF_STEPS : GENERIC_STEPS;
  const fill = isHamstring ? computeHamstringFormFill(assessment)
    : isKnee ? computeKneeFormFill(assessment)
    : isAnkle ? computeAnkleFormFill(assessment)
    : isCalf ? computeCalfFormFill(assessment)
    : isGroin ? computeGroinFormFill(assessment)
    : isHipFlexor ? computeHipFlexorFormFill(assessment)
    : isGlute ? computeGluteFormFill(assessment)
    : isItBand ? computeItBandFormFill(assessment)
    : isLowerBack ? computeLowerBackFormFill(assessment)
    : isQuad ? computeQuadFormFill(assessment)
    : isRf ? computeRfFormFill(assessment.rfAnswers || {}, assessment) : null;

  const [step, setStep] = useState(0);
  const stepRef = useRef(0); // shadow ref so touch handlers always see current step
  const trackRef = useRef(null);

  // Keep step in range if the step set changes (e.g. region change RF↔generic)
  useEffect(() => {
    if (step > STEPS.length - 1) { setStep(0); stepRef.current = 0; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRf, isQuad, isKnee, isAnkle, isCalf, isGroin, isHipFlexor, isGlute, isItBand, isLowerBack, isHamstring, quadEntity]);

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
    // Ignore touches that originate on a slider — let the slider handle them
    if (e.target.closest('.gs-pill-slider')) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current  = false;
    lockedAxis.current  = null;
  }

  function onTouchMove(e) {
    if (touchStartX.current === null) return;
    // Ignore if the gesture started on a slider
    if (e.target.closest('.gs-pill-slider')) return;
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

  // ── Shared field renderers (used by both generic and RF flows) ──────
  function regionSelector() {
    return (
      <>
        <span className="body-region-label">Injury location</span>
        <div className="body-region-selector" onClick={() => router.push('/anatomy')}>
          <div className="body-region-selector-left">
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
      </>
    );
  }

  function sportField() {
    return (
      <Field label="Sport">
        <select value={assessment.sport || ''} onChange={(e) => setAssessment({ ...assessment, sport: e.target.value })}>
          <option value="">Select a sport</option>
          <optgroup label="Team sports">
            {['Football (soccer)','American football','Rugby','Basketball','Volleyball','Handball','Hockey (field)','Ice hockey','Baseball','Softball','Cricket','Lacrosse','Water polo','Netball'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Racket sports">
            {['Tennis','Badminton','Squash','Padel','Table tennis','Pickleball'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Athletics & running">
            {['Sprinting','Middle / long distance running','Hurdles','Cross country','Trail running','Race walking'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Combat sports">
            {['Boxing','MMA','Wrestling','Judo','BJJ','Karate / Taekwondo','Muay Thai'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Gym & strength">
            {['Weightlifting / Olympic lifting','Powerlifting','CrossFit','Bodybuilding','Gymnastics','Calisthenics'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Water sports">
            {['Swimming','Surfing','Rowing','Kayaking / Canoeing','Triathlon'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Cycling & wheeled">
            {['Road cycling','Mountain biking','BMX','Skateboarding','Rollerskating / inline'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Court & other">
            {['Golf','Climbing / bouldering','Dance / cheerleading','Yoga / Pilates','General fitness','Other'].map(s => <option key={s}>{s}</option>)}
          </optgroup>
        </select>
      </Field>
    );
  }

  function demandsField() {
    return (
      <Field label="Sport demands">
        <MultiSelectDropdown options={movements} selected={assessment.movements} onToggle={(val) => toggleArray('movements', val)} placeholder="Select all that apply" />
      </Field>
    );
  }

  function equipmentField() {
    return (
      <Field label="Equipment available">
        <MultiSelectDropdown options={equipmentOptions} selected={assessment.equipment} onToggle={(val) => toggleArray('equipment', val)} placeholder="Select all that apply" />
      </Field>
    );
  }

  return (
    <div className="ac-shell">

      {/* ── Top: persistent heading + step indicator ─────── */}
      <div className="ac-header">
        <div className="ac-page-heading">
          <h2>Tell us what happened.</h2>
          <p>Your plan adapts to injury location, how it happened, pain levels, and warning signs.</p>
        </div>

        {/* Step progress bar */}
        <div className="ac-progress-bar">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`ac-progress-seg${i === step ? ' active' : i < step ? ' done' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to step ${i + 1}: ${s.label}`}
            />
          ))}
        </div>

        {/* Step label row */}
        <div className="ac-step-row">
          <div className="ac-step-meta">
            <span className="ac-step-count">Step {step + 1} of {STEPS.length}</span>
            <span className="ac-step-label">{(STEPS[step] || STEPS[0]).label}</span>
          </div>
          {(isRf || isQuad || isKnee || isHamstring) && fill && (
            <span className={`ac-fill-badge${fill.allFilled ? ' ac-fill-badge--done' : ''}`}>
              {fill.percent}%
            </span>
          )}
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

        {isHamstring ? (
          <>
            {HAMSTRING_STEPS.map((s, i) => {
              const isContext = i === 0;
              const isHistory = s.group === 'History';
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Your selected hamstring muscle sets the starting point — tap above to change it on the body map.
                      </p>
                    )}
                    <HamstringGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {isHistory && equipmentField()}
                  </div>
                </div>
              );
            })}
          </>
        ) : isKnee ? (
          <>
            {KNEE_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              const isMiddle = s.group === 'History & context';
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Your selected knee structure sets your injury pathway — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch problems that need in-person care first — a locked knee, gross instability, a hot/feverish joint, or high-energy trauma. If any apply, see a clinician before self-guided rehab.</p>
                      </div>
                    )}
                    <KneeGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {isMiddle && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isAnkle ? (
          <>
            {ANKLE_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Ankle selected — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch signs of a possible fracture or an unstable "high ankle" (syndesmosis) injury. If any apply, see a clinician for imaging before self-guided rehab.</p>
                      </div>
                    )}
                    <AnkleGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {i === ANKLE_STEPS.length - 2 && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isCalf ? (
          <>
            {CALF_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Calf/shin selected — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch signs of a possible Achilles tendon rupture or a tibial stress fracture. If any apply, see a clinician for assessment/imaging before self-guided rehab.</p>
                      </div>
                    )}
                    <CalfGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {i === CALF_STEPS.length - 2 && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isGroin ? (
          <>
            {GROIN_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Adductor/groin selected — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch signs of a possible hernia or a hip-joint cause of your pain. If any apply, see a clinician for assessment before self-guided rehab.</p>
                      </div>
                    )}
                    <GroinGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {i === GROIN_STEPS.length - 2 && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isHipFlexor ? (
          <>
            {HIP_FLEXOR_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Hip flexor selected — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch signs of a possible femoral neck stress fracture or a hip-joint cause of your pain. If any apply, see a clinician for imaging/assessment before self-guided rehab.</p>
                      </div>
                    )}
                    <HipFlexorGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {i === HIP_FLEXOR_STEPS.length - 2 && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isGlute ? (
          <>
            {GLUTE_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Glutes selected — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch signs of possible deep gluteal syndrome (sciatic nerve involvement). If any apply, see a clinician for assessment before self-guided rehab.</p>
                      </div>
                    )}
                    <GluteGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {i === GLUTE_STEPS.length - 2 && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isItBand ? (
          <>
            {IT_BAND_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        IT band selected — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch signs of a possible structural knee injury (e.g. meniscus or ligament). If any apply, see a clinician for assessment before self-guided rehab.</p>
                      </div>
                    )}
                    <ItBandGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {i === IT_BAND_STEPS.length - 2 && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isLowerBack ? (
          <>
            {LOWER_BACK_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety';
              const isContext = i === 0;
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Lower back selected — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These catch signs of a possible serious spinal condition (e.g. cauda equina syndrome) or a pars stress fracture (spondylolysis). If any apply, see a clinician urgently before self-guided rehab.</p>
                      </div>
                    )}
                    <LowerBackGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {i === LOWER_BACK_STEPS.length - 2 && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isQuad ? (
          <>
            {QUAD_STEPS.map((s, i) => {
              const isSafety = s.group === 'Safety check';
              const isContext = i === 0;
              const isMiddle = !isContext && !isSafety && s.group !== 'Pain & symptoms';
              return (
                <div key={s.group} className={slidePos(i)}>
                  <div className="ac-card">
                    {isContext && regionSelector()}
                    {isContext && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                        Your selected area sets your injury pathway — tap above to change it on the body map.
                      </p>
                    )}
                    {isSafety && (
                      <div className="ac-safety-intro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>These checks also catch a tendon rupture. If any apply, see a clinician before starting rehab.</p>
                      </div>
                    )}
                    <QuadGroupFields group={s.group} assessment={assessment} setAssessment={setAssessment} />
                    {isMiddle && (<>{sportField()}{equipmentField()}</>)}
                  </div>
                </div>
              );
            })}
          </>
        ) : isRf ? (
          <>
            {/* RF STEP 1 — How it started (Injury context) */}
            <div className={slidePos(0)}>
              <div className="ac-card">
                {regionSelector()}
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: '-4px 0 16px' }}>
                  Your selected area sets your pain location — tap above to change it on the body map.
                </p>
                <RfGroupFields group="Injury context" assessment={assessment} setAssessment={setAssessment} />
              </div>
            </div>

            {/* RF STEP 2 — Pain & symptoms */}
            <div className={slidePos(1)}>
              <div className="ac-card">
                <RfGroupFields group="Pain & symptoms" assessment={assessment} setAssessment={setAssessment} />
              </div>
            </div>

            {/* RF STEP 3 — Movement & strength (Physical tests) */}
            <div className={slidePos(2)}>
              <div className="ac-card">
                <RfGroupFields group="Physical tests" assessment={assessment} setAssessment={setAssessment} />
              </div>
            </div>

            {/* RF STEP 4 — Running & sport (+ sport / equipment) */}
            <div className={slidePos(3)}>
              <div className="ac-card">
                <RfGroupFields group="Running & sport tolerance" assessment={assessment} setAssessment={setAssessment} />
                {sportField()}
                {equipmentField()}
              </div>
            </div>

            {/* RF STEP 5 — Response & history */}
            <div className={slidePos(4)}>
              <div className="ac-card">
                <RfGroupFields group="Response & history" assessment={assessment} setAssessment={setAssessment} />
              </div>
            </div>

            {/* RF STEP 6 — Safety check */}
            <div className={slidePos(5)}>
              <div className="ac-card">
                <div className="ac-safety-intro">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p>Select anything that applies. If any of these match, see a clinician before starting rehab.</p>
                </div>
                <RfGroupFields group="Safety check" assessment={assessment} setAssessment={setAssessment} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* STEP 1 — Injury profile */}
            <div className={slidePos(0)}>
              <div className="ac-card">
                {regionSelector()}

                <Field label="How it happened">
                  <select value={assessment.mechanism} onChange={(e) => setAssessment({ ...assessment, mechanism: e.target.value })}>
                    <option value="">Select how it happened</option>
                    {mechanisms.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>

                <Field label="Days since injury">
                  <input type="number" min="0" value={assessment.daysSince} onChange={(e) => setAssessment({ ...assessment, daysSince: Number(e.target.value) })} />
                </Field>

                <Field label="Symptom">
                  <select value={assessment.symptoms[0] || ''} onChange={(e) => setAssessment({ ...assessment, symptoms: e.target.value ? [e.target.value] : [] })}>
                    <option value="">Select symptom</option>
                    {symptomTypes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="Secondary area">
                  <select value={assessment.secondaryRegions || ''} onChange={(e) => setAssessment({ ...assessment, secondaryRegions: e.target.value })}>
                    <option value="">None</option>
                    {injuryRegions.filter(r => r.id !== assessment.primaryRegion).map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* STEP 2 — Sport, demands & equipment */}
            <div className={slidePos(1)}>
              <div className="ac-card">
                {sportField()}
                {demandsField()}
                {equipmentField()}
              </div>
            </div>

            {/* STEP 3 — Pain & context */}
            <div className={slidePos(2)}>
              <div className="ac-card">
                <div className="ac-sliders">
                  <Slider label="Pain at rest" value={assessment.painRest} onChange={(v) => setAssessment({ ...assessment, painRest: v })} />
                  <Slider label="Pain walking / stairs" value={assessment.painWalking} onChange={(v) => setAssessment({ ...assessment, painWalking: v })} />
                  <Slider label="Pain during sport movement" value={assessment.painSport} onChange={(v) => setAssessment({ ...assessment, painSport: v })} />
                </div>
                <textarea
                  className="ac-textarea"
                  placeholder="Describe what happened in your own words…"
                  value={assessment.story}
                  onChange={(e) => setAssessment({ ...assessment, story: e.target.value })}
                />
              </div>
            </div>

            {/* STEP 4 — Red flags */}
            <div className={slidePos(3)}>
              <div className="ac-card">
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
          </>
        )}

      </div>{/* /ac-track */}

      {/* ── Bottom navigation ────────────────────────────── */}
      <div className="ac-nav">
        <button
          type="button"
          className="pill-nav-btn pill-nav-btn--sm"
          onClick={handleBack}
          disabled={step === 0}
          aria-label="Previous step"
        >
          <span className="pill-nav-circle">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </span>
        </button>

        <button
          type="button"
          className={`pill-nav-btn pill-nav-btn--sm pill-nav-btn--confirm${step === STEPS.length - 1 ? ' pill-nav-btn--glowing' : ''}`}
          onClick={handleNext}
          aria-label={step === STEPS.length - 1 ? 'Build recovery plan' : 'Next step'}
        >
          <span className="pill-nav-circle">
            {step === STEPS.length - 1 ? (
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            )}
          </span>
        </button>
      </div>

    </div>
  );
}
