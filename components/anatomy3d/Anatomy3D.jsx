'use client';

/* Anatomy3D — interactive 3D musculoskeletal model (BodyParts3D, CC BY 4.0).
   Picking a structure that ROYO covers feeds the same assessment fields as the
   2D body map (primaryRegion / exactArea). */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnatomyScene } from './anatomyScene';

const BASE = '/anatomy3d';
const LAYERS = [
  { key: 'muscle', label: 'Muscles', dot: '#C0473C' },
  { key: 'bone', label: 'Bones', dot: '#E8DCC4' },
  { key: 'connective', label: 'Tendons & ligaments', dot: '#F2EEE4' },
  { key: 'joint', label: 'Discs', dot: '#9CC4E4' },
];
const TYPE_LABEL = { muscle: 'Muscle', bone: 'Bone', tendon: 'Tendon', ligament: 'Ligament', disc: 'Disc', joint: 'Joint' };
const SIDE_LABEL = { R: 'Right', L: 'Left' };
const REGION_APP_LABEL = {
  quadriceps: 'Quadriceps', hamstring: 'Hamstrings', adductor_groin: 'Adductors', hip_flexor: 'Hip flexor', abductor: 'Abductor / TFL',
  glutes: 'Glutes', knee: 'Knee', calf_shin: 'Calf & shin', ankle: 'Ankle & foot', lower_back: 'Lower back', back: 'Back', neck: 'Neck',
  shoulder: 'Shoulder', chest: 'Chest', serratus: 'Serratus', obliques: 'Obliques', biceps: 'Biceps', triceps: 'Triceps', forearm: 'Forearm', elbow: 'Elbow',
};

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

export default function Anatomy3D({ assessment, setAssessment }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const tipRef = useRef(null);
  const [manifest, setManifest] = useState(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | skeleton | ready | error
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [layers, setLayers] = useState({ muscle: true, bone: true, connective: true, joint: true });
  const [mode, setMode] = useState('anatomy');
  const [isolated, setIsolated] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [region, setRegion] = useState('all');
  const [hint, setHint] = useState(true);

  useEffect(() => {
    let scene, cancelled = false;
    const lite = typeof window !== 'undefined' && (window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4);
    (async () => {
      try {
        const m = await fetch(`${BASE}/manifest.json`).then((r) => r.json());
        if (cancelled) return;
        setManifest(m);
        scene = new AnatomyScene(hostRef.current, {
          lite,
          onProgress: (p) => setProgress(p),
          onSkeleton: () => setPhase('skeleton'),
          onReady: () => setPhase('ready'),
          onHover: (h) => setHover(h),
          onHoverMove: (h) => { if (tipRef.current) tipRef.current.style.transform = `translate(${h.x + 16}px, ${h.y + 14}px)`; },
          onSelect: (s) => { setSelected(s); if (s) setHint(false); },
        });
        sceneRef.current = scene;
        await scene.load(m, BASE);
      } catch (e) {
        console.error(e);
        if (!cancelled) setPhase('error');
      }
    })();
    return () => { cancelled = true; scene?.dispose(); sceneRef.current = null; };
  }, []);

  const byId = useMemo(() => new Map((manifest?.structures || []).map((s) => [s.id, s])), [manifest]);
  const byDataId = useMemo(() => new Map((manifest?.structures || []).filter((s) => s.app?.[1]).map((s) => [s.app[1], s.id])), [manifest]);

  // open on the muscle already chosen in the 2D map / assessment
  useEffect(() => {
    if (phase !== 'ready' || !assessment?.exactArea) return;
    const id = byDataId.get(assessment.exactArea);
    if (id) sceneRef.current?.select(id, null);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !manifest) return [];
    const score = (s) => { const l = s.label.toLowerCase(); return l.startsWith(q) ? 0 : l.includes(' ' + q) ? 1 : 2; };
    return manifest.structures
      .filter((s) => s.label.toLowerCase().includes(q) || s.id.includes(q.replace(/\s+/g, '-')))
      .sort((a, b) => score(a) - score(b) || (a.type === 'muscle' ? -1 : 0) - (b.type === 'muscle' ? -1 : 0) || a.label.localeCompare(b.label))
      .slice(0, 8);
  }, [query, manifest]);

  const sel = selected ? byId.get(selected.id) : null;
  const hov = hover ? byId.get(hover.id) : null;
  const inAssessment = sel?.app && assessment?.primaryRegion === sel.app[0] && (!sel.app[1] || assessment?.exactArea === sel.app[1]);

  const toggleLayer = (k) => { const v = !layers[k]; setLayers({ ...layers, [k]: v }); sceneRef.current?.setLayer(k, v); };
  const setViewMode = (mde) => { setMode(mde); sceneRef.current?.setMode(mde); };
  const pick = (s) => { setQuery(''); setSearchOpen(false); sceneRef.current?.select(s.id, null); };
  const goRegion = (r) => { setRegion(r); sceneRef.current?.focusRegion(r); };
  const toggleIsolate = () => { const v = !isolated; setIsolated(v); sceneRef.current?.isolate(v); };
  const clearSel = () => { sceneRef.current?.select(null); setIsolated(false); sceneRef.current?.isolate(false); };
  const reset = () => { sceneRef.current?.resetView(); setIsolated(false); setRegion('all'); };
  const useForAssessment = () => {
    if (!sel?.app) return;
    setAssessment((prev) => ({ ...prev, primaryRegion: sel.app[0], exactArea: sel.app[1] || '' }));
  };

  const regions = manifest ? [['all', 'Full body'], ...Object.entries(manifest.regions)] : [];

  return (
    <div className="a3d">
      <div className="a3d-stage" ref={hostRef} />

      {/* hover label */}
      <div ref={tipRef} className={`a3d-tip${hov && phase !== 'loading' ? ' on' : ''}`}>
        {hov && <><span className={`a3d-dot a3d-dot--${hov.type}`} />{hov.label}{hover?.side && hover.side !== 'M' && <em>{SIDE_LABEL[hover.side]}</em>}</>}
      </div>

      {/* search + layers */}
      <div className="a3d-panel a3d-left">
        <div className="a3d-search">
          <Icon d={['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'm21 21-4.3-4.3']} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) pick(results[0]); if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
            placeholder={manifest ? `Search ${manifest.structures.length} structures` : 'Search anatomy'}
            aria-label="Search anatomy"
          />
          {searchOpen && results.length > 0 && (
            <div className="a3d-results" role="listbox">
              {results.map((s) => (
                <button key={s.id} className="a3d-result" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(s)}>
                  <span className={`a3d-dot a3d-dot--${s.type}`} />
                  <span className="a3d-result-l">{s.label}</span>
                  <span className="a3d-result-t">{TYPE_LABEL[s.type]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="a3d-seg" role="group" aria-label="Render mode">
          <button className={mode === 'anatomy' ? 'on' : ''} onClick={() => setViewMode('anatomy')}>Anatomy</button>
          <button className={mode === 'xray' ? 'on' : ''} onClick={() => setViewMode('xray')}>X-ray</button>
        </div>

        <div className="a3d-layers">
          {LAYERS.map((l) => (
            <button key={l.key} className={`a3d-layer${layers[l.key] ? ' on' : ''}`} onClick={() => toggleLayer(l.key)} aria-pressed={layers[l.key]}>
              <span className="a3d-layer-dot" style={{ background: l.dot }} />
              {l.label}
              <span className="a3d-switch" />
            </button>
          ))}
        </div>
      </div>

      {/* camera */}
      <div className="a3d-panel a3d-cam">
        {[['front', 'Front'], ['back', 'Back'], ['left', 'L side'], ['right', 'R side']].map(([f, l]) => (
          <button key={f} onClick={() => sceneRef.current?.viewFrom(f)}>{l}</button>
        ))}
        <button onClick={reset} aria-label="Reset view" title="Reset view"><Icon d={['M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5']} size={15} /></button>
      </div>

      {/* regions */}
      <div className="a3d-regions">
        {regions.map(([id, label]) => (
          <button key={id} className={region === id ? 'on' : ''} onClick={() => goRegion(id)}>{label}</button>
        ))}
      </div>

      {/* info card */}
      {sel && (
        <div className="a3d-panel a3d-info" key={sel.id + (selected.side || '')}>
          <button className="a3d-x" onClick={clearSel} aria-label="Close">✕</button>
          <div className="a3d-eyebrow">
            <span className={`a3d-dot a3d-dot--${sel.type}`} />{TYPE_LABEL[sel.type]}
            {selected.side && <span className="a3d-side">{SIDE_LABEL[selected.side]}</span>}
            <span className="a3d-region">{manifest.regions[sel.region]}</span>
          </div>
          <h3>{sel.label}</h3>
          {sel.info?.origin && (
            <dl className="a3d-facts">
              <div><dt>Origin</dt><dd>{sel.info.origin}</dd></div>
              <div><dt>Insertion</dt><dd>{sel.info.insertion}</dd></div>
              <div><dt>Action</dt><dd>{sel.info.action}</dd></div>
              <div><dt>Nerve</dt><dd>{sel.info.nerve}</dd></div>
            </dl>
          )}
          {sel.info?.desc && <p className="a3d-desc">{sel.info.desc}</p>}
          {sel.info?.note && <p className="a3d-note">{sel.info.note}</p>}
          {sel.conditions?.length > 0 && (
            <div className="a3d-conds">
              <div className="a3d-label">ROYO can help with</div>
              <div className="a3d-chips">{sel.conditions.map((c) => <span key={c}>{c}</span>)}</div>
            </div>
          )}
          <div className="a3d-actions">
            {sel.app && (
              <button className={`a3d-primary${inAssessment ? ' done' : ''}`} onClick={useForAssessment}>
                {inAssessment ? '✓ Selected for assessment' : `Assess: ${REGION_APP_LABEL[sel.app[0]] || 'this area'}`}
              </button>
            )}
            <button onClick={toggleIsolate}>{isolated ? 'Show surroundings' : 'Isolate'}</button>
            <button onClick={() => sceneRef.current?.hide(sel.id)}>Hide</button>
          </div>
        </div>
      )}

      {hint && phase === 'ready' && !sel && (
        <div className="a3d-hint">Tap any muscle or bone · drag to rotate · pinch or scroll to zoom</div>
      )}

      {phase !== 'ready' && phase !== 'error' && (
        <div className={`a3d-loading${phase === 'skeleton' ? ' partial' : ''}`}>
          <div className="a3d-rings"><span /><span /><span /></div>
          <div className="a3d-load-t">{phase === 'skeleton' ? 'Adding muscles & tendons' : 'Loading anatomy'}</div>
          <div className="a3d-bar"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        </div>
      )}
      {phase === 'error' && <div className="a3d-loading"><div className="a3d-load-t">3D view isn’t available on this device. Switch to Front or Back.</div></div>}

      {manifest && (
        <a className="a3d-credit" href={manifest.licenseUrl} target="_blank" rel="noreferrer">BodyParts3D © DBCLS · CC BY 4.0</a>
      )}
    </div>
  );
}
