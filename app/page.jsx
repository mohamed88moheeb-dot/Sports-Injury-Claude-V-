'use client';

import InteractiveAnatomy from '../components/InteractiveAnatomy';
import HumanFrontIcon from '../components/HumanFrontIcon';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, hasSupabase } from '../lib/supabaseClient';
import { getAdaptedSession } from '../lib/injuryEngine/planAdapter';
import {
  injuryRegions,
  grades,
  sports,
  movements,
  equipmentOptions,
  mechanisms,
  symptomTypes,
  phases,
  exerciseBank,
  redFlagQuestions,
  muscleComponents
} from '../data/rehabKnowledge';

const emptyAssessment = {
  primaryRegion: '',
  exactArea: '',
  secondaryRegions: '',
  grade: 'grade1',
  mechanism: 'Sudden sprint',
  symptoms: [],
  sports: [],
  movements: [],
  equipment: ['Bodyweight'],
  painRest: 1,
  painWalking: 2,
  painSport: 5,
  daysSince: 1,
  story: '',
  redFlags: []
};

const gradeLabels = Object.fromEntries(grades.map((g) => [g.id, g.name]));
const regionLabels = Object.fromEntries(injuryRegions.map((r) => [r.id, r.name]));
const regionObjects = Object.fromEntries(injuryRegions.map((r) => [r.id, r]));
const motionLabels = {
  hamstring: 'Posterior chain',
  quadriceps: 'Anterior thigh',
  calf_shin: 'Lower leg',
  adductor_groin: 'Groin complex',
  it_band: 'Lateral chain',
  abdomen: 'Core and inguinal',
  ankle: 'Ankle complex',
  knee: 'Knee joint'
};

export default function Page() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [assessment, setAssessment] = useState(emptyAssessment);
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState([
    { role: 'coach', text: 'Tell me what you are thinking about today’s training or your return to sport. I will keep the plan safe and realistic.' }
  ]);

  useEffect(() => {
    if (!hasSupabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !hasSupabase) return;
    loadRemoteProfile(user.id);
  }, [user]);

  useEffect(() => {
    if (hasSupabase && user) return;
    const cached = localStorage.getItem('injury-recovery-local-profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfile(parsed.profile || null);
        setCheckins(parsed.checkins || []);
        setAssessment(parsed.assessment ? { ...emptyAssessment, ...parsed.assessment } : emptyAssessment);
      } catch {}
    }
  }, [user]);

  async function loadRemoteProfile(userId) {
    const { data, error } = await supabase
      .from('recovery_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data.profile_data?.profile || null);
      setCheckins(data.profile_data?.checkins || []);
      setAssessment(data.profile_data?.assessment ? { ...emptyAssessment, ...data.profile_data.assessment } : emptyAssessment);
      setSaveMessage('Progress loaded');
    }
  }

  async function saveState(nextProfile = profile, nextCheckins = checkins, nextAssessment = assessment) {
    if (!nextProfile) return;
    const payload = { profile: nextProfile, checkins: nextCheckins, assessment: nextAssessment, updatedAt: new Date().toISOString() };

    if (hasSupabase && user) {
      setSaving(true);
      setSaveMessage('Saving');
      const { error } = await supabase
        .from('recovery_profiles')
        .upsert({ user_id: user.id, profile_data: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      setSaving(false);
      setSaveMessage(error ? `Save failed: ${error.message}` : 'Saved');
    } else {
      localStorage.setItem('injury-recovery-local-profile', JSON.stringify(payload));
      setSaveMessage('Saved locally');
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthMessage('');
    if (!hasSupabase) {
      setAuthMessage('Supabase is not connected. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.');
      return;
    }
    setAuthLoading(true);
    const { data, error } = authMode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password })
      : await supabase.auth.signUp({ email: authForm.email, password: authForm.password });
    setAuthLoading(false);

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    if (authMode === 'signup' && !data.session) {
      setAuthMessage('Account created. Check your email to confirm your account, then sign in.');
    } else {
      setAuthMessage(authMode === 'signup' ? 'Account created and signed in.' : 'Signed in successfully.');
    }
  }

  async function signOut() {
    if (!hasSupabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSaveMessage('Signed out');
  }

  function toggleArray(field, value) {
    setAssessment((prev) => {
      const exists = prev[field].includes(value);
      return { ...prev, [field]: exists ? prev[field].filter((x) => x !== value) : [...prev[field], value] };
    });
  }

  function generateProfile() {
    // Derive grade from pain + symptoms so the user never has to guess their own grade.
    const derivedGradeId = deriveGrade(assessment);
    const assessmentWithGrade = { ...assessment, grade: derivedGradeId };
    setAssessment(assessmentWithGrade);
    setGenerating(true);

    // 7-second "thinking" window — feels considered, not instant.
    setTimeout(() => {
      const nextProfile = buildProfile(assessmentWithGrade);
      setProfile(nextProfile);
      setCheckins([]);
      setGenerating(false);
      setActiveTab('dashboard');
      saveState(nextProfile, [], assessmentWithGrade);
    }, 7000);
  }

  function completeDay(phaseIndex, weekIndex, dayIndex) {
    if (!profile) return;
    const next = structuredClone(profile);
    const day = next.plan[phaseIndex].weeks[weekIndex].days[dayIndex];
    day.completed = !day.completed;
    next.progress = calculateProgress(next.plan);
    next.today = findToday(next.plan);
    next.aiStatus = day.completed ? 'Session completed. Check tomorrow morning before progressing intensity.' : 'Session marked incomplete. Repeat this day before moving forward.';
    setProfile(next);
    saveState(next, checkins, assessment);
  }

  function addCheckin(status) {
    if (!profile) return;
    const entry = { id: Date.now(), date: new Date().toLocaleDateString(), ...status };
    const nextCheckins = [entry, ...checkins].slice(0, 16);
    const nextProfile = { ...profile, aiStatus: getStatusMessage(status, profile), lastCheckin: entry };
    setCheckins(nextCheckins);
    setProfile(nextProfile);
    saveState(nextProfile, nextCheckins, assessment);
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    const response = coachResponse(chatInput, profile, assessment);
    setChat((prev) => [...prev, { role: 'user', text: chatInput }, { role: 'coach', text: response }]);
    setChatInput('');
  }

  const dashboardStats = useMemo(() => profile ? calculateProgress(profile.plan) : null, [profile]);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <header className="topbar glass-panel">
        <div className="brand-lockup">
          <HumanFrontIcon size="medium" />
          <div>
            <p className="eyebrow full-line">Personal Recovery System</p>
            <h3 className="hero-title full-line">Injury Guide</h3>
          </div>
        </div>
        <div className="top-actions">
          <div className="account-pill">
            <span className={hasSupabase ? 'dot online' : 'dot offline'} />
            <span>{user ? user.email : hasSupabase ? 'Not signed in' : 'Supabase setup needed'}</span>
          </div>
          {user && <button className="ghost-btn small" onClick={signOut}>Sign out</button>}
        </div>
      </header>

      {!user && (
        <AuthCard
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          handleAuth={handleAuth}
          authMessage={authMessage}
          authLoading={authLoading}
        />
      )}

      {!profile ? (
              <section className="hero-card app-section app-section-hero">
                <div className="hero-copy-wrap">
                  <p className="eyebrow stacked-eyebrow">
                    <span>Evidence Driven</span>
                  </p>
                  <h2>Build a plan around the injury you actually have.</h2>
                  <p className="hero-copy">
                    A calm recovery workspace for assessment, day-by-day rehab, progress tracking, check-ins, and return-to-sport decisions.
                  </p>
                  <div className="hero-points">
                    <span>Criteria-based progression</span>
                    <span>Saved progress</span>
                    <span>Daily sessions</span>
                  </div>
                </div>
                <div className="hero-panel glass-card">
                  <div>
                    <span className="small-label">Current assessment focus</span>
                    <strong>{regionLabels[assessment.primaryRegion] || 'Not set'}</strong>
                    <span>{gradeLabels[assessment.grade]}</span>
                  </div>
                </div>
              </section>
            ) : (
              <section className="status-strip">
                <div>
                  <p className="eyebrow">{profile.regionName} · {profile.gradeName}</p>
                  <strong>{profile.today?.title || 'Plan ready'}</strong>
                </div>
                <span className="status-strip-chip">{dashboardStats?.percent ?? 0}% complete</span>
              </section>
            )}

      <nav className="tabs glass-panel" aria-label="Main navigation">
        {['dashboard', 'assessment', 'plan', 'checkin', 'coach'].map((tab) => (
          <button key={tab} className={activeTab === tab ? 'tab active' : 'tab'} onClick={() => setActiveTab(tab)}>
            <TabIcon type={tab} />
            <span>{tab === 'dashboard' ? 'Home' : tab === 'assessment' ? 'Assessment' : tab === 'plan' ? 'Plan' : tab === 'checkin' ? 'Check-in' : 'Coach'}</span>
          </button>
        ))}
      </nav>

      <div className="tab-space">
        {generating && <GeneratingPlan />}
        {!generating && activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            stats={dashboardStats}
            setActiveTab={setActiveTab}
            saving={saving}
            saveMessage={saveMessage}
            assessment={assessment}
            setAssessment={setAssessment}
          />
        )}
        {!generating && activeTab === 'assessment' && <Assessment assessment={assessment} setAssessment={setAssessment} toggleArray={toggleArray} generateProfile={generateProfile} />}
        {!generating && activeTab === 'plan' && <PlanView profile={profile} completeDay={completeDay} setActiveTab={setActiveTab} />}
        {!generating && activeTab === 'checkin' && <Checkin addCheckin={addCheckin} checkins={checkins} />}
        {!generating && activeTab === 'coach' && <Coach chat={chat} chatInput={chatInput} setChatInput={setChatInput} sendChat={sendChat} />}
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Plan generation animation
 * ───────────────────────────────────────────────────────────────────────── */
const PLAN_BUILD_STEPS = [
  'Analysing injury mechanism and pain levels',
  'Matching your pattern to the injury protocol library',
  'Selecting exercises for your equipment and sport demands',
  'Assembling phase-by-phase training sessions with rest days',
  'Finalising your return-to-sport pathway',
];

function GeneratingPlan() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= PLAN_BUILD_STEPS.length - 1) return;
    const t = setTimeout(() => setStep(s => s + 1), 1350);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <section className="generating-shell app-section app-section-soft">
      <div className="gen-header">
        <p className="eyebrow stacked-eyebrow"><span>Personalising your plan</span></p>
        <h2>Building your recovery plan...</h2>
        <p className="gen-subtext">
          Analysing your answers and assembling a full multi-phase plan matched to your injury, equipment, and sport demands.
        </p>
      </div>
      <div className="gen-steps">
        {PLAN_BUILD_STEPS.map((label, i) => (
          <div key={i} className={`gen-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="gen-step-dot" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AuthCard({ authMode, setAuthMode, authForm, setAuthForm, handleAuth, authMessage, authLoading }) {
  return (
    <section className="auth-card app-section app-section-soft">
      <div>
        <p className="eyebrow stacked-eyebrow">
          <span>Secure Progress</span>
        </p>
        <h3>{authMode === 'signin' ? 'Sign in to continue' : 'Create a tester account'}</h3>
        <p>Use an account to save your assessment, plan progress, and check-ins across devices.</p>
      </div>
      <form onSubmit={handleAuth} className="auth-form glass-card">
        <input type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
        <input type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
        <button className="primary-btn" type="submit" disabled={authLoading}>{authLoading ? 'Working' : authMode === 'signin' ? 'Sign in' : 'Create account'}</button>
        <button className="text-btn" type="button" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
          {authMode === 'signin' ? 'Create a new account' : 'I already have an account'}
        </button>
        {authMessage && <p className="form-note">{authMessage}</p>}
      </form>
    </section>
  );
}

function Dashboard({ profile, stats, setActiveTab, saving, saveMessage, assessment, setAssessment }) {
  if (!profile) {
    return (
      <section className="empty-state app-section app-section-light">
        <h2>Start with the assessment.</h2>
        <p>Your dashboard will show your injury, grade, expected return range, today’s plan, and saved progress after the app builds your recovery profile.</p>
        <button className="primary-btn" onClick={() => setActiveTab('assessment')}>Open assessment</button>
      </section>
    );
  }

  const next = profile.today || {};
  return (
    <section className="dashboard app-section app-section-light">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Recovery dashboard</p>
          <h2>{profile.regionName}</h2>
          <p>{profile.gradeName} · {profile.mechanism} · {profile.exactAreaName || 'General area'}</p>
        </div>
        <HumanFrontIcon size="medium" />
      </div>

      <div className="dashboard-main">
        <div className="today-card highlight-card">
          <div className="today-card-top">
            <div>
              <p className="eyebrow">Today’s session</p>
              <h3>{next.title || 'Open the plan to start'}</h3>
            </div>
            <span className="phase-chip">{next.phaseLabel || 'Not started'}</span>
          </div>
          <p>{next.summary || 'Your next session will appear here.'}</p>
          <div className="today-preview">
            <span>{next.load || 'Personalized rehab'}</span>
            <span>{next.sessionTitle || 'Session details'}</span>
          </div>
          <div className="today-actions">
            <button className="primary-btn" onClick={() => setActiveTab('plan')}>Open plan</button>
            <button className="secondary-btn" onClick={() => setActiveTab('checkin')}>Log check-in</button>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-card-top">
            <div>
              <p className="eyebrow">Overall progress</p>
              <h3>{stats.completedDays} of {stats.totalDays} days</h3>
            </div>
            <CircularProgress value={stats.percent} />
          </div>
          <div className="progress-track"><span style={{ width: `${stats.percent}%` }} /></div>
          <div className="mini-stats">
            <Metric label="Phases" value={`${stats.completedPhases}/${stats.totalPhases}`} />
            <Metric label="Weeks" value={`${stats.completedWeeks}/${stats.totalWeeks}`} />
            <Metric label="Days" value={`${stats.completedDays}/${stats.totalDays}`} />
          </div>
        </div>
      </div>

      <div className="dashboard-stats-row">
        <div className="stat-pill-card accent-blue">
          <span className="small-label">Expected return</span>
          <strong>{profile.returnRange}</strong>
        </div>
        <div className="stat-pill-card accent-amber stat-pill-progress">
          <span className="small-label">Progress</span>
          <CircularProgress value={stats.percent} />
        </div>
        <div className="stat-pill-card accent-slate">
          <span className="small-label">Save status</span>
          <strong>{saving ? 'Saving' : saveMessage || 'Synced'}</strong>
        </div>
      </div>

      <div className="coach-note glass-card">
        <span className="small-label">Recovery coach note</span>
        <p>{profile.aiStatus}</p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * MultiSelectDropdown
 * A dropdown trigger that opens a panel of toggleable pill options.
 * Closes when clicking outside. No external packages.
 * ------------------------------------------------------------------------- */
function MultiSelectDropdown({ options, selected, onToggle, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const label = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? selected[0]
      : `${selected[0]} +${selected.length - 1} more`;

  return (
    <div className={`msd-wrap${open ? ' msd-open' : ''}`} ref={ref}>
      <button type="button" className="msd-trigger" onClick={() => setOpen(o => !o)}>
        <span className={selected.length ? 'msd-trigger-text has-value' : 'msd-trigger-text'}>{label}</span>
        <svg className="msd-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="msd-panel">
          <div className="msd-options">
            {options.map(opt => {
              const active = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className={`msd-option${active ? ' active' : ''}`}
                  onClick={() => onToggle(opt)}
                >
                  <span className="msd-check">{active ? '✓' : ''}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="msd-footer">
              <span>{selected.length} selected</span>
              <button type="button" className="msd-clear" onClick={() => selected.forEach(s => onToggle(s))}>Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Assessment({ assessment, setAssessment, toggleArray, generateProfile }) {
  return (
    <section className="assessment-grid app-section app-section-soft">
      <div className="section-heading span-2">
        <div>
          <p className="eyebrow">Build your profile</p>
          <h2>Tell us what happened.</h2>
          <p>The plan adapts to location, grade, mechanism, sport demands, equipment, pain, and warning signs.</p>
        </div>
      </div>

      <div className="section-card span-2 glass-card">
        <p className="eyebrow">Step 1</p>
        <h3>Injury profile</h3>
        <div className="form-grid">
          <Field label="How it happened">
            <select value={assessment.mechanism} onChange={(e) => setAssessment({ ...assessment, mechanism: e.target.value })}>
              {mechanisms.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Days since injury">
            <input type="number" min="0" value={assessment.daysSince} onChange={(e) => setAssessment({ ...assessment, daysSince: Number(e.target.value) })} />
          </Field>
        </div>
        <InteractiveAnatomy assessment={assessment} setAssessment={setAssessment} />  
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
          <Slider label="Pain at rest" value={assessment.painRest} onChange={(v) => setAssessment({ ...assessment, painRest: v })} />
          <Slider label="Pain walking / stairs" value={assessment.painWalking} onChange={(v) => setAssessment({ ...assessment, painWalking: v })} />
          <Slider label="Pain if you try sport movement" value={assessment.painSport} onChange={(v) => setAssessment({ ...assessment, painSport: v })} />
        </div>
        <textarea placeholder="Describe the story in your own words. Example: I felt a pull while sprinting, pain is high when I lengthen the leg, walking is okay." value={assessment.story} onChange={(e) => setAssessment({ ...assessment, story: e.target.value })} />
      </div>

      <div className="section-card span-2 glass-card redflag-card">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Optional safety screen</p>
            <h3>Warning signs</h3>
            <p className="short-copy">Select only what applies. These answers help the app avoid unsafe rehab suggestions.</p>
          </div>
        </div>
        <div className="redflag-grid compact">
          {redFlagQuestions.map((q) => (
            <button key={q} className={assessment.redFlags.includes(q) ? 'tiny-check active' : 'tiny-check'} onClick={() => toggleArray('redFlags', q)} type="button">
              {q}
            </button>
          ))}
        </div>
      </div>

      <button className="primary-btn generate-btn" onClick={generateProfile}>Build my recovery plan</button>
    </section>
  );
}

function PlanView({ profile, completeDay, setActiveTab }) {
  const todayPath = useMemo(() => findTodayPath(profile?.plan), [profile]);
  const [openPhase, setOpenPhase] = useState(todayPath?.[0] ?? 0);
  const [openWeek, setOpenWeek] = useState(todayPath ? `${todayPath[0]}-${todayPath[1]}` : '0-0');
  const [openDay, setOpenDay] = useState(todayPath ? todayPath.join('-') : null);
  const [openExercise, setOpenExercise] = useState({});
  const [openAlt, setOpenAlt] = useState({});

  if (!profile) {
    return <section className="empty-state app-section app-section-light"><h2>No plan yet.</h2><p>Complete the assessment to create your day-by-day plan.</p><button className="primary-btn" onClick={() => setActiveTab('assessment')}>Open assessment</button></section>;
  }

  function jumpToToday() {
    if (!todayPath) return;
    const [p, w, d] = todayPath;
    setOpenPhase(p);
    setOpenWeek(`${p}-${w}`);
    setOpenDay(`${p}-${w}-${d}`);
    requestAnimationFrame(() => {
      document.getElementById(`day-${p}-${w}-${d}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  return (
    <section className="plan-shell app-section app-section-light">
      <div className="plan-intro section-heading">
        <div>
          <p className="eyebrow">Phase by phase</p>
          <h2>{profile.regionName}</h2>
          <p>{profile.planNote}</p>
        </div>
        <div className="plan-intro-actions">
          <div className="mini-anatomy-preview">
            <HumanFrontIcon size="small" />
          </div>
          {todayPath && <button className="secondary-btn" onClick={jumpToToday}>Jump to today</button>}
        </div>
      </div>



      {profile.plan.map((phase, pIndex) => {
        const phaseOpen = openPhase === pIndex;
        const allDays = phase.weeks.flatMap((w) => w.days);
        const phaseCompleted = allDays.filter((d) => d.completed).length;
        return (
          <article className={`phase-card ${phase.accent} ${phaseOpen ? 'open' : ''}`} key={phase.id}>
            <button className="phase-head" onClick={() => setOpenPhase(phaseOpen ? null : pIndex)}>
              <div className="phase-head-main">
                <span className="phase-index">Phase {pIndex + 1}</span>
                <div>
                  <span className="phase-label-tag">{phase.name}</span>
                  <h3>{phase.label}</h3>
                  <p>{phase.goal}</p>
                </div>
              </div>
              <div className="phase-head-meta">
                <strong>{phaseCompleted}/{allDays.length} days</strong>
                <span className="phase-weeks-tag">{phase.weeks.length} {phase.weeks.length === 1 ? 'week' : 'weeks'}</span>
                <Chevron open={phaseOpen} />
              </div>
            </button>
            {phaseOpen && (
              <div className="phase-body">
                <p className="phase-description">{phase.description}</p>
                {phase.weeks.map((week, wIndex) => {
                  const weekKey = `${pIndex}-${wIndex}`;
                  const weekOpen = openWeek === weekKey;
                  const weekCompleted = week.days.filter((d) => d.completed).length;
                  return (
                    <div className={`week-card ${weekOpen ? 'open' : ''}`} key={weekKey}>
                      <button className="week-head" onClick={() => setOpenWeek(weekOpen ? null : weekKey)}>
                        <span className="week-index">W{wIndex + 1}</span>
                        <div className="week-head-main">
                          <strong>{week.title}</strong>
                          <span>{week.focus}</span>
                        </div>
                        <div className="week-head-meta">
                          <small>{weekCompleted}/{week.days.length} done</small>
                          <Chevron open={weekOpen} />
                        </div>
                      </button>
                      {weekOpen && (
                        <div className="days-list">
                          {week.days.map((day, dIndex) => {
                            const dayKey = `${pIndex}-${wIndex}-${dIndex}`;
                            const dayOpen = openDay === dayKey;
                            const isToday = todayPath && todayPath.join('-') === dayKey;
                            const isRest = day.exercises.length === 0;
                            return (
                              <div
                                className={`day-card ${day.completed ? 'completed' : ''} ${dayOpen ? 'open' : ''} ${isToday ? 'is-today' : ''}`}
                                key={dayKey}
                                id={`day-${dayKey}`}
                              >
                                <button className="day-head" onClick={() => setOpenDay(dayOpen ? null : dayKey)}>
                                  <span className={`day-status ${day.completed ? 'done' : ''} ${isRest ? 'rest' : ''}`}>
                                    {day.completed ? '✓' : isRest ? '–' : dIndex + 1}
                                  </span>
                                  <div className="day-head-main">
                                    <div className="day-head-title-row">
                                      <strong>{day.title}</strong>
                                      {isToday && <span className="today-badge">Today</span>}
                                    </div>
                                    <span>{day.summary}</span>
                                  </div>
                                  <div className="day-head-meta">
                                    <small>{day.load}</small>
                                    <Chevron open={dayOpen} />
                                  </div>
                                </button>
                                {dayOpen && (
                                  <div className="session-card">
                                    <div className="session-header">
                                      <div>
                                        <p className="eyebrow">Session</p>
                                        <h4>{day.sessionTitle}</h4>
                                      </div>
                                      <button className={day.completed ? 'secondary-btn done' : 'secondary-btn'} onClick={() => completeDay(pIndex, wIndex, dIndex)}>
                                        {day.completed ? 'Mark incomplete' : 'Mark complete'}
                                      </button>
                                    </div>
                                    {day.recovery?.length > 0 && <div className="recovery-box">{day.recovery.map((item, i) => <p key={i}>{item}</p>)}</div>}
                                    {day.mobility?.length > 0 && (
                                      <div className="mobility-strip">
                                        <div><span className="field-label">Mobility / warm-up</span><p>Separate from the main rehab exercise count.</p></div>
                                        <div className="mobility-list">
                                          {day.mobility.map((m, i) => <span key={i}>{m.name} · {m.prescription}</span>)}
                                        </div>
                                      </div>
                                    )}
                                    <div className="session-blocks">
                                      {(() => {
                                        let lastBlockLabel = null;
                                        return day.exercises.map((ex, eIndex) => {
                                          const key = `${dayKey}-${eIndex}`;
                                          const exOpen = !!openExercise[key];

                                          // Show a block-section header when the block changes
                                          // (only for exercises from the expanded engine)
                                          const thisBlock = ex.blockLabel || null;
                                          const showBlockHeader = thisBlock && thisBlock !== lastBlockLabel;
                                          if (showBlockHeader) lastBlockLabel = thisBlock;

                                          return (
                                            <div key={key}>
                                              {showBlockHeader && (
                                                <div className="session-block-header">{thisBlock}</div>
                                              )}
                                              <div className="exercise-card">
                                                <button className="exercise-main" onClick={() => setOpenExercise({ ...openExercise, [key]: !exOpen })}>
                                                  <div className="exercise-title-row">
                                                    <h5>{ex.name}</h5>
                                                    <div className="exercise-title-meta">
                                                      <span>{ex.intensity}</span>
                                                      <Chevron open={exOpen} />
                                                    </div>
                                                  </div>
                                                  <div className="exercise-details">
                                                    <span>{ex.prescription}</span>
                                                    <span>{ex.equipment}</span>
                                                  </div>
                                                </button>
                                                {exOpen && (
                                                  <div className="exercise-expanded">
                                                    {/* Purpose — the "why" behind the exercise */}
                                                    {ex.purpose && (
                                                      <p className="ex-purpose">{ex.purpose}</p>
                                                    )}
                                                    <div className="video-placeholder"><span>Video demo placeholder</span><small>{ex.video}</small></div>
                                                    <p>{ex.cue}</p>
                                                    {/* Common mistakes — only shown for expanded-engine exercises */}
                                                    {ex.commonMistakes?.length > 0 && (
                                                      <div className="ex-mistakes">
                                                        <span className="ex-mistakes-label">Common mistakes to avoid</span>
                                                        <ul>
                                                          {ex.commonMistakes.map((m, mi) => (
                                                            <li key={mi}>{m}</li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    )}
                                                    <button className="alt-btn" onClick={() => setOpenAlt({ ...openAlt, [key]: !openAlt[key] })}>Too hard? Show easier option</button>
                                                    {openAlt[key] && (
                                                      <div className="alternative-box">
                                                        <strong>{ex.alternative.name}</strong>
                                                        <span>{ex.alternative.prescription}</span>
                                                        <p>{ex.alternative.cue}</p>
                                                      </div>
                                                    )}
                                                    {/* Pain rule — evidence-based loading guideline */}
                                                    {ex.painRule && (
                                                      <p className="ex-pain-rule">
                                                        <span>Pain rule: </span>{ex.painRule}
                                                      </p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>
                                    {day.exercises.length === 0 && (
                                      <div className="rest-visual">
                                        <div className="mini-anatomy-preview">
                                          <HumanFrontIcon size="small" />
                                        </div>
                                        <p>Complete rest today. Recovery is the training stimulus.</p>
                                      </div>
                                    )}
                                    <div className="day-rule"><strong>Progress rule:</strong> {day.rule}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}

function Checkin({ addCheckin, checkins }) {
  const [status, setStatus] = useState({ pain: 2, confidence: 60, swelling: 'No change', response: 'Stable', notes: '' });
  return (
    <section className="checkin-grid app-section app-section-soft">
      <div className="section-card glass-card">
        <p className="eyebrow">Daily check-in</p>
        <h2>How did the injury respond?</h2>
        <Slider label="Pain today" value={status.pain} onChange={(v) => setStatus({ ...status, pain: v })} />
        <Slider label="Confidence to move" value={status.confidence} max={100} onChange={(v) => setStatus({ ...status, confidence: v })} />
        <Field label="Swelling / tightness">
          <select value={status.swelling} onChange={(e) => setStatus({ ...status, swelling: e.target.value })}>
            <option>No change</option><option>Better</option><option>Worse</option><option>New swelling</option>
          </select>
        </Field>
        <Field label="Next-day response">
          <select value={status.response} onChange={(e) => setStatus({ ...status, response: e.target.value })}>
            <option>Stable</option><option>Better than yesterday</option><option>Sore but settled</option><option>Worse than yesterday</option>
          </select>
        </Field>
        <textarea placeholder="Notes" value={status.notes} onChange={(e) => setStatus({ ...status, notes: e.target.value })} />
        <button className="primary-btn" onClick={() => addCheckin(status)}>Save check-in</button>
      </div>
      <div className="section-card glass-card">
        <p className="eyebrow">History</p>
        <h2>Recent entries</h2>
        <div className="history-list">
          {checkins.length === 0 && <p>No check-ins yet.</p>}
          {checkins.map((c) => <div className="history-item" key={c.id}><strong>{c.date}</strong><span>Pain {c.pain}/10 · Confidence {c.confidence}%</span><p>{c.response} · {c.swelling}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Coach({ chat, chatInput, setChatInput, sendChat }) {
  return (
    <section className="coach-card app-section app-section-dark">
      <p className="eyebrow">Recovery coach</p>
      <h2>Ask about pain, training, or returning to sport.</h2>
      <div className="chat-window">
        {chat.map((m, i) => <div key={i} className={m.role === 'user' ? 'chat-bubble user' : 'chat-bubble coach'}>{m.text}</div>)}
      </div>
      <div className="chat-input">
        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Example: I feel good. Can I sprint today?" onKeyDown={(e) => e.key === 'Enter' && sendChat()} />
        <button className="primary-btn" onClick={sendChat}>Send</button>
      </div>
    </section>
  );
}

function MuscleSelector({ assessment, setAssessment }) {
  const parts = muscleComponents[assessment.primaryRegion] || [];
  const selected = parts.find((p) => p.id === assessment.exactArea);
  return (
    <div className="muscle-selector glass-card inset">
      <div className="muscle-map-panel">
        <InteractiveAnatomy
          assessment={assessment}
          setAssessment={setAssessment}
        />
      </div>
      <div className="muscle-select-content">
        <span className="field-label">Where exactly do you feel it?</span>
        <p className="micro-copy">Pick the closest area. This placeholder will later become a detailed anatomy diagram.</p>
        <div className="component-grid">
          {parts.map((part, idx) => (
            <button type="button" key={part.id} className={assessment.exactArea === part.id ? 'component-chip active' : 'component-chip'} onClick={() => setAssessment({ ...assessment, exactArea: part.id })}>
              <span>{String(idx + 1).padStart(2, '0')}</span>
              <strong>{part.name}</strong>
            </button>
          ))}
        </div>
        {selected && <p className="selected-area-note">{selected.detail}</p>}
      </div>
    </div>
  );
}

function MultiSelect({ title, items, selected, onToggle }) {
  return <div className="multi-select"><span className="field-label">{title}</span><div className="pill-grid">{items.map((item) => <button type="button" key={item} className={selected.includes(item) ? 'select-pill active' : 'select-pill'} onClick={() => onToggle(item)}>{item}</button>)}</div></div>;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Slider({ label, value, onChange, max = 10 }) {
  return <label className="slider"><span>{label}<strong>{value}{max === 10 ? '/10' : '%'}</strong></span><input type="range" min="0" max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}

function Metric({ label, value }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function CircularProgress({ value }) {
  return <div className="circle-progress" style={{ '--value': `${value * 3.6}deg` }}><span>{value}%</span></div>;
}

function Chevron({ open }) {
  return (
    <svg className={`chevron ${open ? 'open' : ''}`} viewBox="0 0 24 24" width="16" height="16">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function findTodayPath(plan) {
  if (!plan) return null;
  for (let p = 0; p < plan.length; p++) {
    for (let w = 0; w < plan[p].weeks.length; w++) {
      for (let d = 0; d < plan[p].weeks[w].days.length; d++) {
        if (!plan[p].weeks[w].days[d].completed) return [p, w, d];
      }
    }
  }
  return null;
}

function TabIcon({ type }) {
  const paths = {
    dashboard: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z',
    assessment: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h3',
    plan: 'M4 6h16M4 12h16M4 18h10',
    checkin: 'M5 12l4 4L19 6',
    coach: 'M5 7h14v9H8l-3 3z'
  };
  return <svg className="tab-icon" viewBox="0 0 24 24"><path d={paths[type]} /></svg>;
}

function BodyPictogram({ type, selectedArea = '', detailed = false, compact = false }) {
  const region = type || 'assessment';
  const highlights = {
    hamstring: { x: 58, y: 76, w: 15, h: 33 },
    quadriceps: { x: 29, y: 75, w: 16, h: 33 },
    calf_shin: { x: 30, y: 108, w: 42, h: 25 },
    adductor_groin: { x: 43, y: 66, w: 18, h: 20 },
    it_band: { x: 26, y: 72, w: 9, h: 42 },
    abdomen: { x: 38, y: 37, w: 24, h: 27 },
    ankle: { x: 29, y: 132, w: 44, h: 10 },
    knee: { x: 29, y: 96, w: 44, h: 11 },
    logo: { x: 38, y: 36, w: 24, h: 78 },
    assessment: { x: 30, y: 34, w: 42, h: 104 }
  };
  const h = highlights[region] || highlights.assessment;
  const componentCount = (muscleComponents[region] || []).length;
  return (
    <div className={compact ? 'body-shell compact' : 'body-shell'}>
      <svg className={detailed ? 'body-icon detail' : 'body-icon'} viewBox="0 0 100 150" role="img" aria-label="Body area pictogram placeholder">
        <circle cx="50" cy="13" r="8" className="outline-fill" />
        <path className="outline-fill" d="M41 25h18c3 8 6 20 7 34l-7 28 7 48H55l-5-39-5 39H34l7-48-7-28c1-14 4-26 7-34Z" />
        <path className="outline-line" d="M41 29 27 58 23 86M59 29l14 29 4 28M43 136h-9M57 136h9M41 53h18M41 75h18M35 97h30" />
        <rect x={h.x} y={h.y} width={h.w} height={h.h} rx="7" className="highlight" />
        {detailed && componentCount > 0 && Array.from({ length: componentCount }).map((_, i) => (
          <g key={i} className={selectedArea ? 'component-mark muted' : 'component-mark'}>
            <circle cx={Math.min(h.x + h.w + 8, 88)} cy={h.y + 7 + i * 7} r="2.2" />
            <text x={Math.min(h.x + h.w + 12, 92)} y={h.y + 9 + i * 7}>{i + 1}</text>
          </g>
        ))}
      </svg>
      {!compact && <span>{motionLabels[region] || 'Body map'}</span>}
    </div>
  );
}

/**
 * deriveGrade — infer injury severity from pain scores + symptoms + red flags
 * so the user never has to self-diagnose their own grade.
 *
 * Logic is deliberately conservative: when signals are ambiguous we lean
 * toward a higher grade to keep early sessions safe.
 */
function deriveGrade(a) {
  const painRest    = a.painRest    ?? 0;
  const painWalking = a.painWalking ?? 0;
  const painSport   = a.painSport   ?? 5;
  const redFlags    = a.redFlags    ?? [];
  const symptoms    = (a.symptoms   ?? []).join(' ');
  const mechanism   = (a.mechanism  ?? '').toLowerCase();

  // Grade III — severe / possible structural failure
  if (redFlags.length > 0)                                               return 'grade3';
  if (painRest >= 6)                                                     return 'grade3';
  if (painWalking >= 7)                                                  return 'grade3';
  if (/instability|giving way|locking|catching|cannot bear/i.test(symptoms)) return 'grade3';

  // Grade II — moderate structural damage
  if (painRest >= 3 && painWalking >= 3)                                 return 'grade2';
  if (painSport >= 7 && painWalking >= 3)                                return 'grade2';

  // Overload — no structural damage, training-load irritation
  if (painRest <= 1 && painWalking <= 2 && painSport <= 4 &&
      /gradual|overuse|training|increase|load/i.test(mechanism))        return 'overload';

  // Default: Grade I mild strain
  return 'grade1';
}

function buildProfile(a) {
  const region = regionObjects[a.primaryRegion] || injuryRegions[0];
  const grade = grades.find((g) => g.id === a.grade) || grades[1];
  const exactArea = (muscleComponents[a.primaryRegion] || []).find((part) => part.id === a.exactArea);
  const isHighRisk = a.redFlags.length > 0 || a.grade === 'grade3' || a.symptoms.includes('Instability / giving way') || a.symptoms.includes('Locking / catching');
  const returnRange = region.returnRanges?.[a.grade] || region.returnRanges?.unknown || 'varies';
  const plan = buildPlan(a, region, grade, isHighRisk);
  const progress = calculateProgress(plan);
  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    primaryRegion: a.primaryRegion,
    regionName: region.name,
    exactAreaName: exactArea?.name || 'General area',
    gradeName: grade.name,
    mechanism: a.mechanism,
    returnRange: isHighRisk ? `${returnRange} · medical review recommended` : returnRange,
    plan,
    progress,
    today: findToday(plan),
    aiStatus: isHighRisk ? 'Your answers include higher-risk signs. Use early-care guidance only and arrange medical review before harder loading.' : 'Start controlled. Progress only when pain stays low during the session and the next morning is stable.',
    planNote: buildPlanNote(a, isHighRisk, exactArea)
  };
}

/* -------------------------------------------------------------------------
 * Initial Rest Phase
 * For acute injuries (grade2 / grade3), the patient must rest completely
 * before structured rehab begins.  grade2 → 1 week.  grade3 → 2 weeks.
 * Returns null for grade1 / overload so buildPlan can skip it.
 * ------------------------------------------------------------------------- */
const INITIAL_REST_WEEKS_BY_GRADE = { grade2: 1, grade3: 2 };

function buildInitialRestPhase(a) {
  const restWeeks = INITIAL_REST_WEEKS_BY_GRADE[a.grade];
  if (!restWeeks) return null;

  const weeks = Array.from({ length: restWeeks }, (_, wIndex) => ({
    title: `Week ${wIndex + 1}`,
    focus: 'Complete rest. Protect the injured tissue. No loading whatsoever.',
    days: Array.from({ length: 7 }, (_, dIndex) => ({
      ...buildFullRestDay(dIndex),
      summary: 'Complete rest day. The tissue needs protection right now — no exercise, no stretching into pain, no testing the injury.',
      recovery: [
        'Rest the injury completely. Avoid any movement that causes pain.',
        'Gentle icing (15–20 min) can help manage swelling and discomfort.',
        'Sleep, hydration, and easy walking only if fully pain-free.',
        'Seek a clinical assessment to confirm the injury and rule out serious damage.',
        'Do not test the injury with sport movements, stretching, or jogging.'
      ]
    }))
  }));

  return {
    id:          'initial_rest',
    name:        'Phase 0',
    label:       'Complete rest & protect',
    goal:        'Protect the injured tissue. Allow initial healing. No structured exercise.',
    description: `Your injury pattern suggests significant tissue damage (${a.grade === 'grade3' ? 'severe' : 'moderate'} grade). The first priority is rest and protection — not exercise. Use this time to see a clinician, manage pain and swelling, and allow the initial healing response to begin. Structured rehab starts in the next phase once pain and swelling settle.`,
    accent:      'phase-blue',
    baseWeeks:   { [a.grade]: restWeeks },
    weeks
  };
}

function buildPlan(a, region, grade, isHighRisk) {
  const lane = exerciseBank[a.primaryRegion] || exerciseBank.hamstring;
  const selectedPhases = isHighRisk ? phases.slice(0, 2) : phases;
  const rehabPhases = selectedPhases.map((phase) => {
    const weeksCount = Math.max(1, phase.baseWeeks?.[a.grade] || 1);
    const weeks = Array.from({ length: weeksCount }, (_, wIndex) => buildWeek(phase, lane, a, wIndex, weeksCount));
    return { ...phase, weeks };
  });

  // Prepend complete rest phase for moderate / severe injuries
  const restPhase = buildInitialRestPhase(a);
  return restPhase ? [restPhase, ...rehabPhases] : rehabPhases;
}

/**
 * How many rest days to leave between training sessions per phase.
 * protect / restore → 2 rest days (tissue needs ~48 h minimum)
 * capacity / speed / return → 1 rest day (athlete can handle more frequency)
 */
function phaseRestDays(phaseId) {
  return phaseId === 'protect' || phaseId === 'restore' ? 2 : 1;
}

function buildWeek(phase, lane, a, wIndex, weeksCount) {
  const focus       = weekFocus(phase.id, wIndex, weeksCount);
  const restBetween = phaseRestDays(phase.id);
  const cycleLen    = restBetween + 1; // e.g. 3 (S, AR, R) for protect; 2 (S, R) for capacity
  const days        = [];
  let sessionCount  = 0;

  for (let dIndex = 0; dIndex < 7; dIndex++) {
    const posInCycle = dIndex % cycleLen;

    if (posInCycle === 0) {
      // ── Training session ───────────────────────────────────────────────
      const sessionIndex = wIndex * 10 + sessionCount; // unique per week+session
      days.push(buildTrainingDay(phase, lane, a, wIndex, dIndex, sessionIndex));
      sessionCount++;
    } else if (posInCycle === 1) {
      // ── First rest day → light active recovery ─────────────────────────
      days.push(buildActiveRecoveryDay(phase, a, dIndex));
    } else {
      // ── Additional rest days → full rest ──────────────────────────────
      days.push(buildFullRestDay(dIndex));
    }
  }

  return { title: `Week ${wIndex + 1}`, focus, days };
}

function buildFullRestDay(dIndex) {
  return {
    title: `Day ${dIndex + 1}`,
    sessionTitle: 'Full rest day',
    summary: 'No structured rehab today. The tissue adapts and rebuilds during recovery.',
    load: 'Rest',
    mobility: [],
    exercises: [],
    recovery: [
      'Sleep, hydration, and easy walking only if comfortable.',
      'Do not test speed, stretching tolerance, or sport movements today.'
    ],
    completed: false,
    rule: 'Rest is an active part of the plan. Adaptation happens during recovery, not the session itself.'
  };
}

function buildActiveRecoveryDay(phase, a, dIndex) {
  const mobility = buildMobility(phase.id, a, dIndex);
  return {
    title: `Day ${dIndex + 1}`,
    sessionTitle: 'Active recovery',
    summary: activeRecoverySummary(phase.id),
    load: 'Active recovery',
    mobility,
    exercises: buildActiveRecovery(a, phase.id, dIndex).map((ex, idx) => adjustExercise(ex, phase, a, 0, dIndex, idx)),
    recovery: [],
    completed: false,
    rule: 'This should leave you feeling better, not more tired. Stop if symptoms rise above 2/10.'
  };
}

/* -------------------------------------------------------------------------
 * Secondary region exercise injection
 *
 * When the user reports a secondary affected area, one supplementary
 * exercise per session is appended to keep that area mobile and supported.
 * The primary session is NOT shortened — secondary work is purely additive.
 *
 * Clinical rationale:
 *   - In protect phase: no secondary loading (too much too soon)
 *   - Restore onwards: 1 targeted exercise from the secondary region
 *   - The secondary exercise always uses a conservative phase (restore or
 *     capacity) regardless of how advanced the primary phase is
 * ------------------------------------------------------------------------- */

// Map region display names (as stored in assessment.secondaryRegions) → IDs
const REGION_NAME_TO_ID = Object.fromEntries(injuryRegions.map(r => [r.name, r.id]));
const EXPANDED_REGIONS   = new Set(['hamstring', 'quadriceps', 'adductor_groin']);

// How advanced a phase to use for secondary work (always conservative)
const SECONDARY_PHASE_MAP = {
  protect:  null,       // skip secondary entirely in protect
  restore:  'restore',
  capacity: 'restore',
  speed:    'capacity',
  return:   'capacity'
};

function getSecondaryExercises(a, phaseId, sessionIndex) {
  const secondaryName = a.secondaryRegions;
  if (!secondaryName || secondaryName.trim() === '') return [];

  const secondaryPhaseId = SECONDARY_PHASE_MAP[phaseId];
  if (!secondaryPhaseId) return [];  // protect phase — no secondary work

  const secondaryId = REGION_NAME_TO_ID[secondaryName];
  if (!secondaryId) return [];

  // ── Try expanded engine first ──────────────────────────────────────────
  if (EXPANDED_REGIONS.has(secondaryId)) {
    const mockAssessment = {
      ...a,
      primaryRegion: secondaryId,
      grade: 'grade1',  // treat secondary as a milder load
    };
    const session = getAdaptedSession(mockAssessment, secondaryPhaseId, sessionIndex);
    if (session && session.length > 0) {
      // Prefer targeted block; fall back to anything
      const targeted = session.filter(ex => ex.blockLabel === 'Targeted loading');
      const source   = targeted.length > 0 ? targeted : session;
      const pick     = source[sessionIndex % source.length];
      return [{
        ...pick,
        blockLabel: `Secondary focus · ${secondaryName}`,
        purpose:    `Supplementary support for ${secondaryName.toLowerCase()}. This is secondary to your main injury — keep it gentle and stop if it aggravates your primary injury.`,
        isSecondary: true
      }];
    }
  }

  // ── Legacy engine fallback ─────────────────────────────────────────────
  const legacyPool = exerciseBank[secondaryId];
  if (!legacyPool) return [];
  const pool = legacyPool[secondaryPhaseId] || legacyPool.protect || [];
  if (pool.length === 0) return [];
  const pick = pool[sessionIndex % pool.length];
  return [{
    ...pick,
    blockLabel: `Secondary focus · ${secondaryName}`,
    isSecondary: true,
    isFromEngine: false
  }];
}

function buildTrainingDay(phase, lane, a, wIndex, dIndex, sessionIndex) {
  const pool     = lane[phase.id] || lane.protect || [];
  const mobility = buildMobility(phase.id, a, dIndex);

  // ── Expanded engine first (hamstring, quadriceps, adductor_groin) ─────
  const adapted = getAdaptedSession(a, phase.id, sessionIndex);
  if (adapted && adapted.length > 0) {
    const exercises    = applyGradeAndContextAdjustments(adapted, phase, a, wIndex);
    const secondaryExs = getSecondaryExercises(a, phase.id, sessionIndex);
    const allExercises = [...exercises, ...secondaryExs];
    return {
      title: `Day ${dIndex + 1}`,
      sessionTitle: sessionTitle(phase.id, sessionIndex % 3),
      summary: summaryFor(phase.id),
      load: `${phase.intensity} · ${allExercises.length} exercises · ${estimateDuration(phase.id, allExercises.length)}`,
      mobility: [],
      exercises: allExercises,
      recovery: [],
      completed: false,
      rule: ruleFor(phase.id, a),
      engineSource: 'expanded'
    };
  }

  // ── Legacy engine fallback (knee, ankle, calf, IT band, etc.) ─────────
  const target = targetExerciseCount(phase.id, a.grade, wIndex, dIndex);
  const chosen  = buildSessionExercises(pool, phase, a, wIndex, dIndex, target)
    .map((ex, idx) => adjustExercise(ex, phase, a, wIndex, dIndex, idx))
    .slice(0, 12);
  const secondaryExs = getSecondaryExercises(a, phase.id, sessionIndex);
  const allChosen    = [...chosen, ...secondaryExs];
  return {
    title: `Day ${dIndex + 1}`,
    sessionTitle: sessionTitle(phase.id, dIndex),
    summary: summaryFor(phase.id),
    load: `${phase.intensity} · ${estimateDuration(phase.id, allChosen.length)}`,
    mobility,
    exercises: allChosen,
    recovery: [],
    completed: false,
    rule: ruleFor(phase.id, a)
  };
}


/**
 * Apply grade and sport-demand adjustments to expanded-engine exercises.
 * Mirrors the logic in adjustExercise() for legacy exercises so the
 * experience is consistent.
 */
function applyGradeAndContextAdjustments(exercises, phase, a, wIndex) {
  return exercises.map((ex, idx) => {
    const copy = { ...ex };

    // Grade safety adjustments
    if (a.grade === 'grade2' || a.grade === 'unknown') {
      copy.intensity = copy.intensity
        .replace('RPE 7–9', 'RPE 6–7')
        .replace('RPE 6–8', 'RPE 5–7')
        .replace('RPE 7–8', 'RPE 6–7');
    }
    if (a.grade === 'grade3') {
      copy.intensity = 'RPE 2–4 — get clinical clearance before progressing';
    }

    // Capacity progression nudge
    if (phase.id === 'capacity' && wIndex > 0 && idx < 2) {
      copy.prescription = copy.prescription + ' · add small load if previous session was green';
    }

    // Sport-demand context notes
    const moveStr = (a.movements || []).join(' ');
    if ((phase.id === 'speed' || phase.id === 'return') && /high.speed|sprinting/i.test(moveStr)) {
      copy.cue = (copy.cue || '') + ' Keep speed gradual — never chase max effort on a sore day.';
    }
    if (/kicking/i.test(moveStr) && (a.primaryRegion === 'quadriceps' || a.primaryRegion === 'adductor_groin')) {
      copy.cue = (copy.cue || '') + ' Kicking stays submax until hip and quad resisted tests are calm.';
    }

    return copy;
  });
}

function targetExerciseCount(phaseId, gradeId, weekIndex, dayIndex) {
  const base = {
    protect: [4, 4, 5, 4, 5, 6],
    restore: [6, 7, 7, 6, 8, 8],
    capacity: [8, 9, 10, 8, 10, 11],
    speed: [8, 9, 10, 8, 11, 11],
    return: [9, 10, 11, 9, 12, 12]
  }[phaseId] || [5, 6, 6, 5, 6, 7];
  let count = base[Math.min(dayIndex, base.length - 1)] + Math.min(weekIndex, 2);
  if (gradeId === 'overload') count -= phaseId === 'protect' ? 1 : 0;
  if (gradeId === 'grade2' || gradeId === 'unknown') count -= (phaseId === 'speed' || phaseId === 'return') ? 2 : 1;
  if (gradeId === 'grade3') count = phaseId === 'protect' ? 4 : 5;
  return Math.max(3, Math.min(12, count));
}

function buildSessionExercises(pool, phase, a, wIndex, dIndex, target) {
  const combined = [
    ...rotate(pool, dIndex + wIndex),
    ...rotate(regionalAddOns(a.primaryRegion, phase.id, a.exactArea), dIndex),
    ...rotate(phaseAddOns(phase.id), wIndex + dIndex),
    ...rotate(sportDemandAddOns(phase.id, a), dIndex),
    ...rotate(equipmentAddOns(phase.id, a), wIndex)
  ];
  return uniqueByName(combined).slice(0, target);
}

function uniqueByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

function buildMobility(phaseId, a) {
  const general = [
    ex('Breathing reset', '2 x 5 slow breaths', 'Bodyweight', 'Easy', 'Ribs down, nasal inhale, long exhale.', 'One breathing set', 'Do one set only.'),
    ex('Joint circles', '1–2 min', 'Bodyweight', 'Easy', 'Move nearby joints gently before loading.', 'Smaller circles', 'Reduce range.'),
    ex('Easy tissue flush', '3–5 min', 'Walk / bike', 'Very easy', 'Increase warmth, not fatigue.', 'Gentle walking', 'Walk slowly indoors.')
  ];
  const regional = {
    hamstring: [ex('Small-range leg swing', '2 x 8/side', 'Bodyweight', 'Easy', 'Stay below stretch pain.', 'Marching', 'Replace swings with marches.')],
    quadriceps: [ex('Heel slide mobility', '2 x 10', 'Bodyweight', 'Easy', 'Move without sharp front-thigh pain.', 'Assisted heel slide', 'Use smaller range.')],
    calf_shin: [ex('Ankle mobility flow', '2 x 10', 'Bodyweight', 'Easy', 'Move ankle in all directions.', 'Ankle pumps', 'Up and down only.')],
    adductor_groin: [ex('Hip rock-back, narrow range', '2 x 8', 'Bodyweight', 'Easy', 'Do not chase groin stretch.', 'Pelvic tilts', 'Use floor control only.')],
    it_band: [ex('Hip controlled rotations', '2 x 5/side', 'Bodyweight', 'Easy', 'Slow hip motion, no lateral knee pain.', 'Clamshell without band', 'Keep it small.')],
    abdomen: [ex('Pelvic tilt flow', '2 x 8', 'Bodyweight', 'Easy', 'No breath holding.', 'Breathing reset', 'Use breathing only.')],
    ankle: [ex('Knee-to-wall prep', '2 x 8', 'Wall', 'Easy', 'Only in pain-free range.', 'Ankle pumps', 'Remove weightbearing.')],
    knee: [ex('Heel slide mobility', '2 x 10', 'Bodyweight', 'Easy', 'Restore comfortable bend and straighten.', 'Assisted heel slide', 'Use towel support.')]
  }[a.primaryRegion] || [];
  return uniqueByName([...general, ...regional]).slice(0, phaseId === 'protect' ? 3 : 4);
}

function buildActiveRecovery(a, phaseId, dayIndex) {
  const options = [];
  if (a.equipment.includes('Bike')) options.push(ex('Easy bike', '12–25 min', 'Bike', 'RPE 2–3', 'Comfortable cadence. No symptom build-up.', 'Easy walk', 'Walk 10–15 minutes.'));
  if (a.equipment.includes('Pool')) options.push(ex('Easy pool movement', '10–20 min', 'Pool', 'RPE 2–3', 'Swim or walk in water without hard kicking.', 'Easy walk', 'Stay on land with walking.'));
  if (a.equipment.includes('Treadmill') || a.sports.includes('Running')) options.push(ex('Easy walk or walk-jog', phaseId === 'speed' || phaseId === 'return' ? '15–25 min' : '10–15 min', 'Flat route / treadmill', 'RPE 2–4', 'Use jogging only if phase allows it and pain stays low.', 'Easy walk', 'Remove jogging.'));
  options.push(ex('Recovery mobility circuit', '8–12 min', 'Bodyweight', 'Very easy', 'Gentle mobility, no forced stretching.', 'Breathing reset', 'Do breathing and walking only.'));
  options.push(ex('Light core control', '2 x 6/side', 'Bodyweight', 'Easy', 'Low effort and clean.', 'Breathing only', 'Skip core if symptoms are reactive.'));
  return uniqueByName(rotate(options, dayIndex)).slice(0, 4);
}

function activeRecoverySummary(phaseId) {
  return phaseId === 'protect' ? 'Easy circulation, mobility, and symptom calming.' : 'Low-intensity movement between harder rehab days.';
}

function estimateDuration(phaseId, count) {
  if (phaseId === 'protect') return '25–40 min';
  if (phaseId === 'restore') return '40–60 min';
  if (phaseId === 'capacity') return count >= 9 ? '60–90 min' : '50–75 min';
  if (phaseId === 'speed') return '60–100 min';
  return '75–120 min';
}

function regionalAddOns(region, phaseId, exactArea) {
  const tendonBias = /tendon|achilles|patellar|quad_tendon|proximal/i.test(exactArea || '');
  const generic = {
    protect: [ex('Pain-free activation hold', '4 x 15 sec', 'Bodyweight', 'Easy', 'Gentle contraction only.', 'Shorter hold', 'Do 8 seconds.')],
    restore: [ex('Controlled range strength', '3 x 8', 'Bodyweight / band', 'RPE 4–5', 'Slow and steady.', 'Isometric hold', 'Hold instead of reps.')],
    capacity: [ex('Progressive strength lift', '4 x 6', 'DB / gym optional', 'RPE 6–7', 'Add load only after green response.', 'Bodyweight version', 'No external load.')],
    speed: [ex('Low-level movement drill', '4 x 20 sec', 'Open space', 'RPE 5–6', 'Controlled speed only.', 'Marching drill', 'Remove impact.')],
    return: [ex('Sport-specific rehearsal', '4 x 30 sec', 'Sport setting', 'RPE 7', 'Submax before maximal.', 'Technical walk-through', 'Slow it down.')]
  };
  const extras = {
    hamstring: { capacity: [ex('Slider eccentric control', '3 x 5', 'Sliders / towel', 'RPE 6–7', 'Slow out, assist back.', 'Bridge walkout', 'Lower demand.')], speed: [ex('Tempo run build', '6 x 60 m', 'Field', 'RPE 6–7', 'Smooth rhythm, no max effort.', 'Bike intervals', 'No running.')] },
    quadriceps: { capacity: [ex('Reverse Nordic regression', '3 x 4–6', 'Bodyweight', 'RPE 5–7', 'Short range first.', 'Tall-kneeling lean', 'Reduce range.')], return: [ex('Progressive kicking volume', '3 blocks x 8', 'Ball', 'RPE 7–8', 'Short passing before long shots.', 'Technical passing only', 'Reduce force.')] },
    calf_shin: { capacity: [ex('Loaded soleus raise', '4 x 8', 'DB / machine', 'RPE 6–8', 'Knee bent, slow lower.', 'Seated bodyweight raise', 'Remove load.')], speed: [ex('Pogo progression', '4 x 20 sec', 'Bodyweight', 'RPE 6–7', 'Quiet springy contacts.', 'Fast calf raise', 'No jumping.')] },
    adductor_groin: { capacity: [ex('Assisted Copenhagen plank', '3 x 5/side', 'Bench', 'RPE 6–7', 'Start with knee supported.', 'Side plank knees', 'Remove adductor load.')], speed: [ex('Lateral shuffle progression', '5 x 15 m', 'Cones', 'RPE 6–7', 'No groin pull during push-off.', 'Side steps', 'Slow it down.')] },
    ankle: { capacity: [ex('Star reach balance', '3 x 4 reaches/side', 'Bodyweight', 'RPE 5–6', 'Reach without arch collapse.', 'Single-leg balance', 'No reaching.')], return: [ex('Sport agility circuit', '5 x 30 sec', 'Cones', 'RPE 7–8', 'Shuffle, decel, turn, accelerate.', 'Low-speed footwork', 'Reduce speed.')] },
    knee: { restore: [ex('Spanish squat hold', '4 x 20 sec', 'Band / strap', 'RPE 4–6', 'Useful for tendon-type pain if tolerated.', 'Wall sit', 'Shorter hold.')], speed: [ex('Landing mechanics', '3 x 5', 'Bodyweight', 'RPE 5–6', 'Soft knee, quiet landing.', 'Squat to calf raise', 'No jump.')] }
  };
  const items = [...(generic[phaseId] || []), ...((extras[region] || {})[phaseId] || [])];
  return tendonBias && (phaseId === 'protect' || phaseId === 'restore') ? [ex('Pain-modulating isometric', '5 x 30 sec', 'Bodyweight / band', 'RPE 4–5', 'Tendon-style hold; pain should settle after, not spike.', 'Shorter isometric', '3 x 20 sec.'), ...items] : items;
}

function phaseAddOns(phaseId) {
  const map = {
    protect: [ex('Easy circulation walk', '5–10 min', 'Walking', 'Very easy', 'Walk only if gait is normal.', 'Short indoor walk', '2–5 minutes.'), ex('Gentle core brace', '3 x 6 breaths', 'Bodyweight', 'Easy', 'Brace without breath holding.', 'Breathing only', 'No brace.')],
    restore: [ex('Balance or weight-shift drill', '3 x 20 sec', 'Bodyweight', 'RPE 3–5', 'Find quiet control.', 'Supported balance', 'Hold support.'), ex('Tempo squat pattern', '3 x 6', 'Bodyweight', 'RPE 4–6', 'Three-second lower.', 'Sit-to-stand', 'Use chair.')],
    capacity: [ex('Primary strength lift', '4 x 6', 'DB / gym optional', 'RPE 6–8', 'Heavy enough to build, not flare.', 'Bodyweight pattern', 'Remove load.'), ex('Accessory endurance set', '2 x 12', 'Band / bodyweight', 'RPE 5–6', 'Build tolerance after strength.', 'One set only', 'Reduce volume.'), ex('Trunk control finisher', '3 x 8/side', 'Bodyweight / band', 'RPE 5', 'Control pelvis and ribs.', 'Dead bug', 'Simpler core option.')],
    speed: [ex('Landing or braking mechanics', '3 x 5', 'Bodyweight / cones', 'RPE 5–6', 'Quality before intensity.', 'Step-stop drill', 'No jumping.'), ex('Low-impact conditioning', '10–18 min', 'Bike / pool / walk', 'RPE 4–5', 'Maintain fitness without chasing fatigue.', 'Easy walk', 'Lower impact.')],
    return: [ex('Maintenance strength pair', '2–3 x 5–8', 'Gym / DB / band', 'RPE 6–8', 'Keep strength work while sport returns.', 'Bodyweight pair', 'Reduce load.'), ex('Controlled sport block', '10–25 min', 'Sport setting', 'RPE 6–8', 'Controlled exposure, no surprise max effort.', 'Technical-only block', 'No speed or contact.')]
  };
  return map[phaseId] || [];
}

function sportDemandAddOns(phaseId, a) {
  const items = [];
  if (a.movements.includes('High-speed running') && (phaseId === 'speed' || phaseId === 'return')) items.push(ex('High-speed exposure ladder', '4–8 runs', 'Field / track', 'RPE 6–8', '70% before 80%, 80% before 90%.', 'Tempo runs', 'Stay at 60–70%.'));
  if (a.movements.includes('Cutting / change of direction') && (phaseId === 'speed' || phaseId === 'return')) items.push(ex('Planned change-of-direction ladder', '4 x 4 reps', 'Cones', 'RPE 6–8', 'Wide angles before sharp cuts.', 'Curved runs', 'No cuts.'));
  if (a.movements.includes('Jumping / landing') && (phaseId === 'speed' || phaseId === 'return')) items.push(ex('Jump-and-stick series', '3 x 5', 'Bodyweight', 'RPE 5–7', 'Land quietly and hold.', 'Squat to calf raise', 'No jump.'));
  if (a.movements.includes('Kicking') && (phaseId === 'speed' || phaseId === 'return')) items.push(ex('Kicking exposure ladder', '3 x 8', 'Ball optional', 'RPE 5–8', 'Short controlled passes before hard shots.', 'No-ball swing', 'Slow pattern.'));
  if (a.movements.includes('Long-duration running') && (phaseId === 'speed' || phaseId === 'return')) items.push(ex('Flat aerobic run build', '15–35 min', 'Flat route', 'RPE 5–7', 'Volume before speed and hills.', 'Bike endurance', 'Use bike.'));
  return items;
}

function equipmentAddOns(phaseId, a) {
  const items = [];
  if (a.equipment.includes('Bike') && (phaseId === 'protect' || phaseId === 'restore')) items.push(ex('Low-resistance bike', '8–15 min', 'Bike', 'RPE 2–4', 'Comfortable, no symptom rise.', 'Walk', 'Use easy walk.'));
  if (a.equipment.includes('Pool') && (phaseId === 'protect' || phaseId === 'restore')) items.push(ex('Pool recovery', '10–20 min', 'Pool', 'RPE 2–4', 'Easy swim or water walk.', 'Walk', 'Use land walking.'));
  if (a.equipment.includes('Resistance bands')) items.push(ex('Band accessory control', '2–3 x 12', 'Band', 'RPE 4–6', 'Slow, clean accessory work.', 'Bodyweight control', 'No band.'));
  if (a.equipment.includes('Dumbbells') || a.equipment.includes('Barbell') || a.equipment.includes('Gym machines')) items.push(ex('Loaded accessory lift', '3 x 6–8', 'Weights / machine', 'RPE 6–8', 'Load only if previous session was green.', 'Bodyweight variation', 'Remove load.'));
  return items;
}

function ex(name, prescription, equipment, intensity, cue, altName, altCue) {
  return { name, prescription, equipment, intensity, cue, video: 'Exercise video placeholder', alternative: { name: altName, cue: altCue, prescription: '2–3 sets at easier intensity' } };
}

function rotate(arr, n) {
  if (!arr || arr.length === 0) return [];
  const offset = ((n % arr.length) + arr.length) % arr.length;
  return arr.slice(offset).concat(arr.slice(0, offset));
}

function adjustExercise(exercise, phase, a, wIndex, dIndex, idx) {
  const copy = structuredClone(exercise);
  const gym = a.equipment.includes('Gym machines') || a.equipment.includes('Barbell') || a.equipment.includes('Dumbbells');
  if (!gym && /barbell|machine|cable|DB|Dumbbell|Gym|Weights/i.test(copy.equipment)) copy.equipment += ' · use easier option if unavailable';
  if (a.grade === 'grade2' || a.grade === 'unknown') copy.intensity = copy.intensity.replace('RPE 7–9', 'RPE 6–7').replace('RPE 6–8', 'RPE 5–7');
  if (a.grade === 'grade3') copy.intensity = 'RPE 2–4 only until cleared';
  if (phase.id === 'capacity' && wIndex > 0 && idx < 2) copy.prescription += ' · add small load if previous day was green';
  if ((phase.id === 'speed' || phase.id === 'return') && a.movements.includes('High-speed running')) copy.cue += ' Keep speed gradual and never chase max speed on a sore day.';
  if (a.movements.includes('Kicking') && (a.primaryRegion === 'quadriceps' || a.primaryRegion === 'adductor_groin' || a.primaryRegion === 'abdomen')) copy.cue += ' Kicking stays submax until resisted tests are quiet.';
  return copy;
}

function calculateProgress(plan = []) {
  const totalPhases = plan.length;
  const completedPhases = plan.filter((p) => p.weeks.every((w) => w.days.every((d) => d.completed))).length;
  const allWeeks = plan.flatMap((p) => p.weeks);
  const totalWeeks = allWeeks.length;
  const completedWeeks = allWeeks.filter((w) => w.days.every((d) => d.completed)).length;
  const allDays = allWeeks.flatMap((w) => w.days);
  const totalDays = allDays.length || 1;
  const completedDays = allDays.filter((d) => d.completed).length;
  return { totalPhases, completedPhases, totalWeeks, completedWeeks, totalDays, completedDays, percent: Math.round((completedDays / totalDays) * 100) };
}

function findToday(plan) {
  for (const phase of plan) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        if (!day.completed) return { ...day, phaseLabel: phase.label };
      }
    }
  }
  return { title: 'Plan complete', summary: 'Keep maintenance work and gradually return to full performance.', phaseLabel: 'Maintenance' };
}

function getStatusMessage(status) {
  if (status.pain > 5 || status.swelling === 'New swelling' || status.response === 'Worse than yesterday') return 'Today is a regression day. Repeat or reduce the previous session and avoid sport intensity.';
  if (status.pain <= 2 && status.confidence >= 70 && status.response !== 'Worse than yesterday') return 'This is a green response. Progress one small variable next session, not everything at once.';
  return 'This is an amber response. Repeat the same level once more before progressing.';
}

function coachResponse(text, profile) {
  const lower = text.toLowerCase();
  if (!profile) return 'Complete the assessment first so I can answer based on your injury, grade, sport, and current phase.';
  if (/sprint|play|match|football|soccer|return|game|train|run/i.test(lower)) return `Do not jump straight to full sport. Your current step is ${profile.today?.phaseLabel || 'your current phase'}. You need low pain during the session, no next-day flare, no swelling, and clean movement before harder exposure.`;
  if (/pain|worse|swelling|bruise|limp|sharp/i.test(lower)) return 'That is a signal to hold or regress. Keep pain under 2–3/10 and avoid movements that change your gait. If swelling, instability, locking, severe bruising, calf warmth, or abdominal/groin bulge appears, seek medical review.';
  if (/too easy|easy|progress|increase/i.test(lower)) return 'Progress one variable at a time: range, load, reps, speed, or complexity. If tomorrow morning is calm, move forward. If not, repeat the same level.';
  return 'Keep the plan consistent. The goal is not to prove you are healed today; it is to build enough capacity that the injury does not return when intensity rises.';
}

function buildPlanNote(a, highRisk, exactArea) {
  if (highRisk) return 'This plan is conservative because your answers include high-risk signs or a severe grade. Use it only as early guidance until reviewed.';
  const multiple = a.secondaryRegions ? ` It also incorporates supplementary work for the secondary area: ${a.secondaryRegions}.` : '';
  const area = exactArea ? ` Specific focus: ${exactArea.name}.` : '';
  return `Tailored to ${a.mechanism.toLowerCase()}, ${gradeLabels[a.grade].toLowerCase()}, selected equipment, pain levels, and sport demands.${area}${multiple}`;
}

function weekFocus(phaseId, weekIndex, weeksCount) {
  const base = {
    protect: 'Calm symptoms, restore walking, keep gentle activation.',
    restore: 'Increase range, control, and submax strength.',
    capacity: 'Build strength and tissue tolerance with progressive loading.',
    speed: 'Introduce impact, running, landing, and sport-specific speed carefully.',
    return: 'Rehearse sport demands and maintain strength while returning.'
  }[phaseId];
  return weeksCount > 1 ? `${base} Week ${weekIndex + 1} of ${weeksCount}: progress only after green check-ins.` : base;
}

function sessionTitle(phaseId, dayIndex) {
  const titles = {
    protect: ['Pain-free activation', 'Mobility and circulation', 'Isometric control'],
    restore: ['Control strength', 'Range and balance', 'Submax loading'],
    capacity: ['Strength capacity', 'Eccentric control', 'Single-leg strength'],
    speed: ['Running and impact prep', 'Landing and deceleration', 'Sport mechanics'],
    return: ['Controlled sport exposure', 'Return-to-training rehearsal', 'Performance maintenance']
  };
  return (titles[phaseId] || titles.protect)[dayIndex % 3];
}

function summaryFor(phaseId) {
  return {
    protect: 'Short and controlled. Nothing should feel aggressive.',
    restore: 'Build confidence through smooth movement and light strength.',
    capacity: 'Strength work becomes more meaningful while staying controlled.',
    speed: 'Add speed or impact carefully, only if the previous day stayed calm.',
    return: 'Rehearse your sport in layers before full intensity.'
  }[phaseId];
}

function ruleFor(phaseId, a) {
  if (a.grade === 'grade3') return 'Stop and seek review if symptoms are severe, unstable, or worsening. Do not progress to speed or heavy loading without clearance.';
  if (phaseId === 'speed' || phaseId === 'return') return 'Progress only if pain stays 0–2/10, no swelling or limp appears, and tomorrow morning is not worse.';
  return 'Green: pain 0–2/10 and next morning stable. Amber: repeat. Red: regress or seek review.';
}
