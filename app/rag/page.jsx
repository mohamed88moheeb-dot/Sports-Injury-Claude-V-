'use client';

import { useMemo, useState } from 'react';
import './rag.css';
import { HAMSTRING_QUESTIONS } from '../../lib/rag/generate/assessmentModel.mjs';

const CORE = HAMSTRING_QUESTIONS.filter((q) => q.core).map((q) => q.key);

export default function RagPrototypePage() {
  const [step, setStep] = useState('intro');       // intro | assess | loading | result
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [error, setError] = useState(null);

  const coreComplete = CORE.every((k) => answers[k]);

  async function run() {
    setStep('loading'); setError(null);
    try {
      const res = await fetch('/api/rag', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ assessment: answers }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Request failed');
      setResult(data.result); setAiEnabled(data.ai_enabled); setStep('result');
    } catch (e) { setError(String(e.message || e)); setStep('assess'); }
  }

  return (
    <div className="rag-wrap">
      {step === 'intro' && <Intro onStart={() => setStep('assess')} />}
      {step === 'assess' && (
        <Assessment answers={answers} setAnswers={setAnswers} coreComplete={coreComplete} error={error} onRun={run} onBack={() => setStep('intro')} />
      )}
      {step === 'loading' && <Loading />}
      {step === 'result' && result && (
        <Result result={result} aiEnabled={aiEnabled} onRestart={() => { setAnswers({}); setResult(null); setStep('intro'); }} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Intro */
function Intro({ onStart }) {
  return (
    <div>
      <span className="rag-eyebrow">◇ RAG Prototype · Hamstring</span>
      <h1 className="rag-h1">An evidence-retrieval rehab engine.</h1>
      <p className="rag-lede">
        This prototype answers a hamstring case by <strong>retrieving</strong> the most relevant passages from a
        corpus of landmark studies, <strong>fusing</strong> lexical and semantic rankings with an evidence-strength
        prior, and <strong>composing</strong> a rehabilitation plan grounded in — and cited to — that evidence.
        No hand-authored decision tree.
      </p>
      <div className="rag-grid rag-grid-2" style={{ marginTop: 28 }}>
        <div className="rag-card">
          <div className="rag-section-title">How it works</div>
          <ol className="rag-muted" style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
            <li>Your answers become per-section retrieval queries</li>
            <li>Hybrid retriever ranks the corpus (BM25 + vector + evidence prior)</li>
            <li>A plan is composed, citing each passage it used</li>
            <li>Every recommendation shows its provenance and confidence</li>
          </ol>
        </div>
        <div className="rag-card">
          <div className="rag-section-title">What makes it different</div>
          <ul className="rag-muted" style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
            <li>Grounded — claims trace to real studies</li>
            <li>Ranked by study design + recency, not vibes</li>
            <li>Confidence is measured, not asserted</li>
            <li>Scales to any injury by swapping the corpus</li>
          </ul>
        </div>
      </div>
      <div style={{ marginTop: 28 }}>
        <button className="rag-btn" onClick={onStart}>Start a hamstring case →</button>
      </div>
      <p className="rag-foot" style={{ marginTop: 18 }}>Prototype · not clinically reviewed · internal experimentation only.</p>
    </div>
  );
}

/* ----------------------------------------------------------- Assessment */
function Assessment({ answers, setAnswers, coreComplete, error, onRun, onBack }) {
  const set = (k, v) => setAnswers((p) => ({ ...p, [k]: v }));
  return (
    <div>
      <span className="rag-eyebrow">◇ Hamstring case</span>
      <h1 className="rag-h1" style={{ fontSize: 30 }}>Tell us about the injury</h1>
      <p className="rag-lede" style={{ fontSize: 15 }}>Two questions are required (<span className="rag-q-req">*</span>). More detail sharpens retrieval.</p>
      <div className="rag-card" style={{ marginTop: 22 }}>
        {HAMSTRING_QUESTIONS.map((q) => (
          <div className="rag-q" key={q.key}>
            <label className="rag-q-label">{q.prompt}{q.core && <span className="rag-q-req"> *</span>}</label>
            <div className="rag-opts">
              {q.options.map((o) => (
                <button key={o.value} className={`rag-opt${answers[q.key] === o.value ? ' sel' : ''}`} onClick={() => set(q.key, o.value)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p style={{ color: '#B4432A', marginTop: 12 }}>⚠ {error}</p>}
      <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
        <button className="rag-btn rag-btn-ghost" onClick={onBack}>← Back</button>
        <button className="rag-btn" disabled={!coreComplete} onClick={onRun}>Retrieve evidence & compose plan →</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Loading */
function Loading() {
  return (
    <div className="rag-loading">
      <div className="rag-spinner" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 17 }}>Retrieving & reasoning over the evidence…</div>
        <div className="rag-step-dim" style={{ marginTop: 6 }}>Ranking the corpus · fusing signals · composing a grounded plan</div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Result */
function Result({ result, aiEnabled, onRestart }) {
  // chunkId -> source doc, for resolving citations to links
  const docById = useMemo(() => {
    const m = {};
    for (const e of result.evidence_base) m[e.id] = e;
    return m;
  }, [result]);
  const resolveCite = (id) => docById[String(id).split('::')[0]];

  const conf = result.overall_confidence;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span className="rag-eyebrow">◇ Grounded plan · Hamstring</span>
        <span className={`rag-badge ${result.mode === 'ai_generated' ? 'rag-badge-ai' : 'rag-badge-draft'}`}>
          {result.mode === 'ai_generated' ? `AI-composed · ${result.model || 'claude'}` : 'Evidence draft (no API key)'}
        </span>
      </div>
      <h1 className="rag-h1" style={{ fontSize: 30 }}>{result.plan.diagnosis?.likely_structure || 'Hamstring strain'}</h1>
      <p className="rag-lede" style={{ fontSize: 15 }}>{result.patient_summary}</p>

      {/* Confidence */}
      <div className="rag-card" style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="rag-section-title" style={{ margin: 0 }}>Retrieval confidence · {conf.label}</span>
          <span className="rag-muted">{Math.round(conf.score * 100)}% · {conf.distinct_sources} sources</span>
        </div>
        <div className="rag-meter"><span style={{ width: `${Math.round(conf.score * 100)}%` }} /></div>
      </div>

      {/* Cautions */}
      {result.cautions?.length > 0 && (
        <div className="rag-card" style={{ marginTop: 16 }}>
          <div className="rag-section-title">Safety notes</div>
          {result.cautions.map((c, i) => <div className="rag-caution" key={i} style={{ marginBottom: 8 }}>⚠ {c}</div>)}
        </div>
      )}

      {/* Diagnosis + outlook */}
      <div className="rag-grid rag-grid-2" style={{ marginTop: 16 }}>
        <div className="rag-card">
          <div className="rag-section-title">Diagnosis</div>
          <p className="rag-muted">{result.plan.diagnosis?.reasoning}</p>
          {result.plan.diagnosis?.grading_note && <p className="rag-muted" style={{ marginTop: 8 }}>{result.plan.diagnosis.grading_note}</p>}
          <Cites ids={result.plan.diagnosis?.cite} resolve={resolveCite} />
        </div>
        <div className="rag-card">
          <div className="rag-section-title">Recovery outlook</div>
          <p className="rag-muted">{result.plan.recovery_outlook?.estimate}</p>
          {result.plan.recovery_outlook?.drivers?.length > 0 && (
            <div className="rag-crit" style={{ marginTop: 8 }}>
              {result.plan.recovery_outlook.drivers.map((d, i) => <span className="rag-chip" key={i}>{d}</span>)}
            </div>
          )}
          <Cites ids={result.plan.recovery_outlook?.cite} resolve={resolveCite} />
        </div>
      </div>

      {/* Phases */}
      <div className="rag-card" style={{ marginTop: 16 }}>
        <div className="rag-section-title">Rehabilitation phases</div>
        {result.plan.phases?.map((p, i) => (
          <div className="rag-phase" key={i}>
            <div className="rag-phase-name">{p.name}</div>
            <div className="rag-phase-goal">{p.goal}</div>
            {p.exercises?.map((ex, j) => (
              <div className="rag-ex" key={j}>
                <div className="rag-ex-name">{ex.name}</div>
                {ex.why && <div className="rag-ex-why">{ex.why}</div>}
                {ex.dosage && <div className="rag-ex-why" style={{ color: 'var(--primary-dark)' }}>Dose: {ex.dosage}</div>}
                <Cites ids={ex.cite} resolve={resolveCite} />
              </div>
            ))}
            {p.criteria_to_advance?.length > 0 && (
              <div className="rag-crit">
                <span className="rag-muted" style={{ fontSize: 12, alignSelf: 'center' }}>Advance when:</span>
                {p.criteria_to_advance.map((c, k) => <span className="rag-chip" key={k}>{c}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RTS */}
      <div className="rag-card" style={{ marginTop: 16 }}>
        <div className="rag-section-title">Return-to-sport criteria</div>
        <div className="rag-crit">
          {result.plan.return_to_sport?.criteria?.map((c, i) => <span className="rag-chip" key={i}>✓ {c}</span>)}
        </div>
        <Cites ids={result.plan.return_to_sport?.cite} resolve={resolveCite} />
      </div>

      {/* Evidence base */}
      <div className="rag-card" style={{ marginTop: 16 }}>
        <div className="rag-section-title">Evidence base · {result.evidence_base.length} sources</div>
        {result.evidence_base.map((e) => (
          <div className="rag-src" key={e.id}>
            <div className="rag-src-body">
              <div className="rag-src-title">
                {e.url ? <a href={e.url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{e.title}</a> : e.title}
              </div>
              <div className="rag-src-meta">{e.authors} · {e.year} · {e.journal}</div>
              <div className="rag-usedin">
                <span className={`rag-badge-design ${e.study_design === 'rct' ? 'rag-badge-rct' : ''}`} style={{ padding: '2px 8px', borderRadius: 6 }}>{e.study_design}</span>
                {e.pmid_status === 'unverified' && <span className="rag-badge-review" style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10.5 }}>pmid unverified</span>}
                {e.used_in?.map((u) => <span key={u}>used in: {u}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Retrieval provenance — the data-science showcase */}
      <div className="rag-card" style={{ marginTop: 16 }}>
        <div className="rag-section-title">Retrieval provenance</div>
        <p className="rag-muted" style={{ marginBottom: 12 }}>Each section runs its own query. Bars show the component scores fused into the final ranking.</p>
        {Object.entries(result.retrieval).map(([section, r]) => (
          <details key={section} style={{ marginBottom: 10 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 650, color: 'var(--ink)', fontSize: 14 }}>
              {section} · <span className="rag-muted" style={{ fontWeight: 400 }}>{r.confidence.label} ({Math.round(r.confidence.score * 100)}%)</span>
            </summary>
            <div style={{ marginTop: 10, paddingLeft: 8 }}>
              {r.hits.map((h) => (
                <div key={h.chunkId} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{h.source.authors.split(',')[0]} et al. {h.source.year}</div>
                  <ScoreBar label="final" val={h.scores.final} max={1} color="linear-gradient(90deg,#6C5FD0,#34C0C8)" />
                  <ScoreBar label="vector" val={h.scores.dense} max={0.5} color="#6C5FD0" />
                  <ScoreBar label="bm25" val={h.scores.bm25} max={30} color="#4B86D8" />
                  <ScoreBar label="prior" val={h.scores.evidence_prior} max={1} color="#34C0C8" />
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <p className="rag-foot" style={{ marginTop: 18 }}>{result.disclaimer}{!aiEnabled && ' · Set ANTHROPIC_API_KEY to enable full AI composition.'}</p>
      <div style={{ marginTop: 18 }}><button className="rag-btn rag-btn-ghost" onClick={onRestart}>← New case</button></div>
    </div>
  );
}

function Cites({ ids, resolve }) {
  if (!ids || !ids.length) return null;
  const seen = new Set();
  const uniq = ids.filter((id) => { const d = String(id).split('::')[0]; if (seen.has(d)) return false; seen.add(d); return true; });
  return (
    <div className="rag-cite">
      {uniq.map((id) => {
        const doc = resolve(id);
        if (!doc) return <span key={id}>{id}</span>;
        const label = `${doc.authors.split(',')[0]} ${doc.year}`;
        return doc.url
          ? <a key={id} href={doc.url} target="_blank" rel="noreferrer">{label}</a>
          : <span key={id}>{label}</span>;
      })}
    </div>
  );
}

function ScoreBar({ label, val, max, color }) {
  const pct = Math.max(0, Math.min(100, (Number(val) / max) * 100));
  return (
    <div className="rag-score-row">
      <span className="rag-score-label">{label}</span>
      <span className="rag-score-bar"><span style={{ width: `${pct}%`, background: color }} /></span>
      <span className="rag-score-val">{Number(val).toFixed(label === 'bm25' ? 1 : 3)}</span>
    </div>
  );
}
