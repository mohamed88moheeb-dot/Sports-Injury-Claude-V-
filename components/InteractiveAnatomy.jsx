"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Maps ──────────────────────────────────────────────────────────────── */

const BROAD_REGION_MAP = {
  back_biceps_femoris:        'hamstring',
  back_semitendinosus:        'hamstring',
  back_semimembranosus:       'hamstring',
  back_it_band:               'it_band',
  back_glutes:                'glutes',
  back_lower_back:            'lower_back',
  back_back:                  'back',
  front_rectus_femoris:       'quadriceps',
  front_vastus_lateralis:     'quadriceps',
  front_vastus_medialis:      'quadriceps',
  front_sartorius:            'quadriceps',
  adductor_longus:            'adductor_groin',
  front_adductor_magnus:      'adductor_groin',
  front_adductor_brevis:      'adductor_groin',
  front_gracilis:             'adductor_groin',
  front_iliopsoas:            'hip_flexor',
  front_tensor_fasciae_latae: 'abductor',
  calves:                     'calf_shin',
  front_soleus:               'calf_shin',
  front_knee:                 'knee',
  front_ankle:                'ankle',
  shoulders:                  'shoulder',
  front_biceps:               'biceps',
  triceps:                    'triceps',
  elbow:                      'elbow',
  forearms:                   'forearm',
  neck:                       'neck',
  front_chest:                'chest',
  front_abdomen:              'abdomen',
  front_obliques:             'obliques',
  front_lower_abdomen:        'lower_abdomen',
  front_serratus:             'serratus',
};

// dataId = the ID used in rehabKnowledge.js muscleComponents (rehab engine key)
// id     = the SVG group ID used for visual highlighting
const DETAIL_REGION_MAP = {
  hamstring: [
    { id: 'back_biceps_femoris',  dataId: 'biceps_femoris_long', label: 'Biceps femoris (lateral)' },
    { id: 'back_semitendinosus',  dataId: 'semitendinosus',      label: 'Semitendinosus (medial)' },
    { id: 'back_semimembranosus', dataId: 'semimembranosus',     label: 'Semimembranosus (deep)' },
  ],
  quadriceps: [
    { id: 'front_rectus_femoris',   dataId: 'rectus_femoris',   label: 'Rectus femoris' },
    { id: 'front_vastus_lateralis', dataId: 'vastus_lateralis', label: 'Vastus lateralis' },
    { id: 'front_vastus_medialis',  dataId: 'vastus_medialis',  label: 'Vastus medialis (VMO)' },
    { id: 'front_sartorius',        dataId: 'sartorius',        label: 'Sartorius' },
  ],
  adductor_groin: [
    { id: 'adductor_longus',       dataId: 'adductor_longus',  label: 'Adductor longus' },
    { id: 'front_adductor_magnus', dataId: 'adductor_magnus',  label: 'Adductor magnus' },
    { id: 'front_adductor_brevis', dataId: 'adductor_brevis',  label: 'Adductor brevis' },
    { id: 'front_gracilis',        dataId: 'gracilis',         label: 'Gracilis' },
  ],
};

// Reverse map: SVG group ID → data ID (used when setting exactArea from SVG clicks)
const SVG_TO_DATA_ID = Object.fromEntries(
  Object.values(DETAIL_REGION_MAP).flat().map(s => [s.id, s.dataId])
);

// Forward map: data ID → SVG group ID (used for visual sync — which group to highlight)
const DATA_TO_SVG_ID = Object.fromEntries(
  Object.values(DETAIL_REGION_MAP).flat().map(s => [s.dataId, s.id])
);

const REGION_VIEW_MAP = {
  hamstring:     'back',
  it_band:       'back',
  glutes:        'back',
  lower_back:    'back',
  back:          'back',
  triceps:       'back',
  quadriceps:    'front',
  adductor_groin:'front',
  hip_flexor:    'front',
  abductor:      'front',
  knee:          'front',
  ankle:         'front',
  calf_shin:     'front',
  chest:         'front',
  abdomen:       'front',
  obliques:      'front',
  lower_abdomen: 'front',
  serratus:      'front',
  biceps:        'front',
  shoulder:      null,
  elbow:         null,
  forearm:       null,
  neck:          null,
};

const REGION_LABELS = {
  hamstring:     'Hamstrings',
  quadriceps:    'Quadriceps',
  adductor_groin:'Adductors',
  hip_flexor:    'Hip flexor',
  abductor:      'Abductor / TFL',
  calf_shin:     'Calves',
  knee:          'Knee',
  ankle:         'Ankle',
  glutes:        'Glutes',
  lower_back:    'Lower back',
  back:          'Back',
  it_band:       'IT band',
  shoulder:      'Shoulder',
  chest:         'Chest',
  abdomen:       'Abdomen',
  obliques:      'Obliques',
  lower_abdomen: 'Lower abdomen',
  biceps:        'Biceps',
  triceps:       'Triceps',
  elbow:         'Elbow',
  forearm:       'Forearm',
  neck:          'Neck',
  serratus:      'Serratus',
};

const ALL_GROUP_IDS = Object.keys(BROAD_REGION_MAP);

const VIEWBOX_FRONT = '-4.856 0 47.6 88.67';
const VIEWBOX_BACK  = '52.05 0 47.6 88.67';

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function InteractiveAnatomy({ assessment, setAssessment, view: viewProp, setView: setViewProp, pillsOnTop = false }) {
  const containerRef = useRef(null);
  const stateRef     = useRef({});
  const [viewInternal, setViewInternal] = useState('front');
  const view    = viewProp    ?? viewInternal;
  const setView = setViewProp ?? setViewInternal;
  const [mode,        setMode]        = useState('broad');
  const [broadRegion, setBroadRegion] = useState(null);
  const [svgReady,    setSvgReady]    = useState(false);

  // Keep a ref always pointing at latest state so imperative handlers never go stale.
  stateRef.current = { view, mode, broadRegion, assessment, setAssessment, setView, setMode, setBroadRegion };

  /* ── Load SVG once ─────────────────────────────────────────────────────── */
  useEffect(() => {
    fetch('/anatomy_selector.svg')
      .then(r => r.text())
      .then(html => {
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = html;
        const svg = container.querySelector('svg');
        if (svg) {
          svg.removeAttribute('width');
          svg.removeAttribute('height');
          svg.style.cssText = 'width:100%;height:auto;display:block;overflow:visible';
          // Immediately crop to front view so both figures never flash
          svg.setAttribute('viewBox', VIEWBOX_FRONT);
        }
        setSvgReady(true);
      })
      .catch(() => {});
  }, []);

  /* ── Single delegated click listener ───────────────────────────────────── */
  useEffect(() => {
    if (!svgReady) return;
    const container = containerRef.current;
    if (!container) return;

    function onContainerClick(e) {
      const { mode: m, broadRegion: br, setAssessment: sa,
              setView: sv, setMode: sm, setBroadRegion: sbr } = stateRef.current;

      // Walk up from the clicked element to find a named interactive group
      let el = e.target;
      let groupId = null;
      while (el && el !== container) {
        const id = el.id;
        if (id && BROAD_REGION_MAP[id]) { groupId = id; break; }
        el = el.parentElement;
      }
      if (!groupId) return;

      const region = BROAD_REGION_MAP[groupId];

      if (m === 'broad') {
        // Re-clicking the already-selected region deselects it
        if (stateRef.current.assessment.primaryRegion === region) {
          sa(prev => ({ ...prev, primaryRegion: '', exactArea: '' }));
          sbr(null);
          return;
        }
        const preferredView = REGION_VIEW_MAP[region];
        if (preferredView) sv(preferredView);
        sbr(region);
        sa(prev => ({ ...prev, primaryRegion: region, exactArea: '' }));
        const subparts = DETAIL_REGION_MAP[region] || [];
        if (subparts.length > 0) sm('detail');

      } else {
        // detail mode — only respond to clicks within the selected broad region
        if (region !== br) return;
        const subparts = DETAIL_REGION_MAP[br] || [];
        const isSubpart = subparts.some(s => s.id === groupId);
        if (!isSubpart && subparts.length > 0) return;
        // Translate SVG group ID → rehab data ID before storing
        const dataId = SVG_TO_DATA_ID[groupId] || groupId;
        sa(prev => ({ ...prev, exactArea: prev.exactArea === dataId ? '' : dataId }));
      }
    }

    container.addEventListener('click', onContainerClick);
    return () => container.removeEventListener('click', onContainerClick);
  }, [svgReady]);

  /* ── Sync visual state to the SVG DOM imperatively ─────────────────────── */
  useEffect(() => {
    if (!svgReady) return;
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    svg.setAttribute('viewBox', view === 'front' ? VIEWBOX_FRONT : VIEWBOX_BACK);

    // Blanket-dim: add class to SVG element in detail mode so CSS dims everything,
    // then ia-group selectively restores opacity for interactive groups.
    svg.classList.toggle('ia-detail-mode', mode === 'detail');

    ALL_GROUP_IDS.forEach(id => {
      const el = svg.querySelector(`[id="${id}"]`);
      if (!el) return;

      el.classList.remove('ia-group', 'ia-selected', 'ia-dimmed');
      el.style.cursor = '';

      const region = BROAD_REGION_MAP[id];

      if (mode === 'broad') {
        el.classList.add('ia-group');
        el.style.cursor = 'pointer';
        if (assessment.primaryRegion === region) el.classList.add('ia-selected');
        return;
      }

      // detail mode — non-broadRegion groups get no ia-group class so CSS dims them
      if (region !== broadRegion) return;

      const subparts = DETAIL_REGION_MAP[broadRegion] || [];
      const isSubpart = subparts.some(s => s.id === id);

      if (!isSubpart && subparts.length > 0) {
        el.classList.add('ia-group', 'ia-selected');
        return;
      }

      el.classList.add('ia-group');
      el.style.cursor = 'pointer';
      // assessment.exactArea is a data ID; translate back to SVG group ID for comparison
      if (DATA_TO_SVG_ID[assessment.exactArea] === id) el.classList.add('ia-selected');
    });
  }, [svgReady, view, mode, broadRegion, assessment]);

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  function resetSelection() {
    setMode('broad');
    setBroadRegion(null);
    setAssessment(prev => ({ ...prev, primaryRegion: '', exactArea: '' }));
  }

  function handleToggleView(newView) {
    setView(newView);
    if (mode === 'detail') {
      setMode('broad');
      setBroadRegion(null);
      setAssessment(prev => ({ ...prev, primaryRegion: '', exactArea: '' }));
    }
  }

  const detailSubparts = broadRegion ? (DETAIL_REGION_MAP[broadRegion] || []) : [];
  const exactLabel = detailSubparts.find(s => s.dataId === assessment.exactArea)?.label;

  // Dropdown state
  const [regionOpen,  setRegionOpen]  = useState(false);
  const [muscleOpen,  setMuscleOpen]  = useState(false);

  const closeAll = useCallback(() => { setRegionOpen(false); setMuscleOpen(false); }, []);

  // Close on outside click
  useEffect(() => {
    if (!regionOpen && !muscleOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.ia-selection-pill-row')) closeAll();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [regionOpen, muscleOpen, closeAll]);

  function selectRegion(key) {
    const view = REGION_VIEW_MAP[key];
    if (view) { setView(view); stateRef.current.setView?.(view); }
    setBroadRegion(key);
    setAssessment(prev => ({ ...prev, primaryRegion: key, exactArea: '' }));
    const subs = DETAIL_REGION_MAP[key] || [];
    setMode(subs.length > 0 ? 'detail' : 'broad');
    setRegionOpen(false);
    setMuscleOpen(false);
  }

  function selectExact(dataId) {
    setAssessment(prev => ({ ...prev, exactArea: prev.exactArea === dataId ? '' : dataId }));
    setMuscleOpen(false);
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="ia-wrapper">

      {/* Front / Back toggle — only shown when not controlled from outside */}
      {!viewProp && (
        <div className="ia-toggle-row">
          <div className="ia-view-pill">
            <button
              className={`ia-view-circle${view === 'front' ? ' active' : ''}`}
              onClick={() => handleToggleView('front')}
            >Front</button>
            <button
              className={`ia-view-circle${view === 'back' ? ' active' : ''}`}
              onClick={() => handleToggleView('back')}
            >Back</button>
          </div>
        </div>
      )}

      {/* Pills on top (replaces heading) */}
      {pillsOnTop && <PillRow assessment={assessment} setAssessment={setAssessment} detailSubparts={detailSubparts} regionOpen={regionOpen} setRegionOpen={setRegionOpen} muscleOpen={muscleOpen} setMuscleOpen={setMuscleOpen} exactLabel={exactLabel} selectRegion={selectRegion} selectExact={selectExact} resetSelection={resetSelection} />}

      {/* SVG body map — centred, fills available width */}
      <div className="ia-svg-wrapper" ref={containerRef} />

      {/* Pills on bottom (default, e.g. embedded in assessment) */}
      {!pillsOnTop && (
        <PillRow
          assessment={assessment} setAssessment={setAssessment}
          detailSubparts={detailSubparts} exactLabel={exactLabel}
          regionOpen={regionOpen} setRegionOpen={setRegionOpen}
          muscleOpen={muscleOpen} setMuscleOpen={setMuscleOpen}
          selectRegion={selectRegion} selectExact={selectExact}
          resetSelection={resetSelection}
        />
      )}

    </div>
  );
}

/* ── Shared pill row ─────────────────────────────────────────────────── */
function PillRow({ assessment, setAssessment, detailSubparts, exactLabel, regionOpen, setRegionOpen, muscleOpen, setMuscleOpen, selectRegion, selectExact, resetSelection }) {
  return (
    <div className="ia-selection-pill-row">
      <div className="ia-pill-group">

        {/* Region pill */}
        <div className="ia-pill-dropdown">
          <div className={`ia-selection-pill${assessment.primaryRegion ? ' ia-selection-pill--selected' : ' ia-selection-pill--hint'}`}>
            <button className="ia-pill-main" onClick={() => { setRegionOpen(o => !o); setMuscleOpen(false); }}>
              {assessment.primaryRegion ? (
                <>
                  <span className="ia-selection-label">{REGION_LABELS[assessment.primaryRegion]}</span>
                </>
              ) : (
                <span className="ia-selection-hint-text">Select muscle</span>
              )}
              <span className="ia-pill-chevron">▾</span>
            </button>
            {assessment.primaryRegion && (
              <button className="ia-pill-x" onClick={resetSelection} title="Clear">✕</button>
            )}
          </div>
          {regionOpen && (
            <div className="ia-dropdown">
              {Object.entries(REGION_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`ia-dropdown-item${assessment.primaryRegion === key ? ' active' : ''}`}
                  onClick={() => selectRegion(key)}
                >{label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Sub-muscle pill */}
        {assessment.primaryRegion && detailSubparts.length > 0 && (
          <div className="ia-pill-dropdown">
            <div className={`ia-selection-pill${assessment.exactArea ? ' ia-selection-pill--selected' : ' ia-selection-pill--hint'}`}>
              <button className="ia-pill-main" onClick={() => { setMuscleOpen(o => !o); setRegionOpen(false); }}>
                {assessment.exactArea ? (
                  <span className="ia-selection-label">{exactLabel}</span>
                ) : (
                  <span className="ia-selection-hint-text">Select specific</span>
                )}
                <span className="ia-pill-chevron">▾</span>
              </button>
              {assessment.exactArea && (
                <button className="ia-pill-x" onClick={() => setAssessment(prev => ({ ...prev, exactArea: '' }))} title="Clear">✕</button>
              )}
            </div>
            {muscleOpen && (
              <div className="ia-dropdown">
                {detailSubparts.map(s => (
                  <button
                    key={s.id}
                    className={`ia-dropdown-item${assessment.exactArea === s.dataId ? ' active' : ''}`}
                    onClick={() => selectExact(s.dataId)}
                  >{s.label}</button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
