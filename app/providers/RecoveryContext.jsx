'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabase } from '../../lib/supabaseClient';
import { getAdaptedSession } from '../../lib/injuryEngine/planAdapter';
import { injuryKnowledge } from '../../data/injuryKnowledge';
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
} from '../../data/rehabKnowledge';

/* ─────────────────────────────────────────────────────────────────────────
 * Constants & lookup maps
 * ───────────────────────────────────────────────────────────────────────── */

export const emptyAssessment = {
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

export const gradeLabels = Object.fromEntries(grades.map((g) => [g.id, g.name]));
export const regionLabels = Object.fromEntries(injuryRegions.map((r) => [r.id, r.name]));
export const regionObjects = Object.fromEntries(injuryRegions.map((r) => [r.id, r]));
export const motionLabels = {
  hamstring: 'Posterior chain',
  quadriceps: 'Anterior thigh',
  calf_shin: 'Lower leg',
  adductor_groin: 'Groin complex',
  it_band: 'Lateral chain',
  abdomen: 'Core and inguinal',
  ankle: 'Ankle complex',
  knee: 'Knee joint'
};

/* ─────────────────────────────────────────────────────────────────────────
 * Context
 * ───────────────────────────────────────────────────────────────────────── */

const RecoveryContext = createContext(null);

export function useRecovery() {
  const ctx = useContext(RecoveryContext);
  if (!ctx) throw new Error('useRecovery must be used inside RecoveryProvider');
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Provider
 * ───────────────────────────────────────────────────────────────────────── */

// Migrate stale display names from old naming conventions
const REGION_NAME_MAP = {
  'Quadriceps / anterior thigh': 'Quadriceps',
  'Quadriceps / Anterior Thigh': 'Quadriceps',
  'Calf / shin': 'Calves',
  'Calf / Shin': 'Calves',
  'Adductor / groin': 'Adductors',
  'Adductor / Groin': 'Adductors',
  'Back / Lats': 'Back',
  'Back / lats': 'Back',
};
function normaliseProfileNames(profile) {
  if (!profile) return profile;
  const regionName = REGION_NAME_MAP[profile.regionName] ?? profile.regionName;
  return {
    ...profile,
    regionName,
    // Backfill injuryTitle for profiles generated before this field existed
    injuryTitle: profile.injuryTitle ?? null,
  };
}

export function RecoveryProvider({ children }) {
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
    { role: 'coach', text: 'Tell me what you are thinking about today\'s training or your return to sport. I will keep the plan safe and realistic.' }
  ]);

  // ── Auth listener ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasSupabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  // ── Load remote profile when signed in ────────────────────────────────
  useEffect(() => {
    if (!user || !hasSupabase) return;
    loadRemoteProfile(user.id);
  }, [user]);

  // ── Load local profile when not signed in ─────────────────────────────
  useEffect(() => {
    if (hasSupabase && user) return;
    const cached = localStorage.getItem('injury-recovery-local-profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfile(normaliseProfileNames(parsed.profile) || null);
        setCheckins(parsed.checkins || []);
        setAssessment(parsed.assessment ? { ...emptyAssessment, ...parsed.assessment } : emptyAssessment);
      } catch {}
    }
  }, [user]);

  // ── Functions ──────────────────────────────────────────────────────────

  async function loadRemoteProfile(userId) {
    const { data, error } = await supabase
      .from('recovery_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(normaliseProfileNames(data.profile_data?.profile) || null);
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

  function generateProfile(onComplete) {
    const derivedGradeId = deriveGrade(assessment);
    const assessmentWithGrade = { ...assessment, grade: derivedGradeId };
    setAssessment(assessmentWithGrade);
    setGenerating(true);

    setTimeout(() => {
      const nextProfile = buildProfile(assessmentWithGrade);
      setProfile(nextProfile);
      setCheckins([]);
      setGenerating(false);
      saveState(nextProfile, [], assessmentWithGrade);
      onComplete?.();
    }, 7000);
  }

  function completeDay(phaseIndex, weekIndex, dayIndex) {
    if (!profile) return;
    const next = structuredClone(profile);
    const day = next.plan[phaseIndex].weeks[weekIndex].days[dayIndex];
    day.completed = !day.completed;
    next.progress = calculateProgress(next.plan);
    next.today = findToday(next.plan);
    next.aiStatus = day.completed
      ? 'Session completed. Check tomorrow morning before progressing intensity.'
      : 'Session marked incomplete. Repeat this day before moving forward.';
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

  const value = {
    // auth
    user, authMode, setAuthMode, authForm, setAuthForm,
    authMessage, authLoading, handleAuth, signOut,
    // assessment
    assessment, setAssessment, toggleArray, generateProfile, generating,
    // profile & plan
    profile, checkins, completeDay, addCheckin, dashboardStats,
    // save status
    saving, saveMessage,
    // tab nav (for legacy tab-switching inside page.jsx during Phase 1)
    activeTab, setActiveTab,
    // coach
    chat, chatInput, setChatInput, sendChat,
    // supabase flag
    hasSupabase
  };

  return (
    <RecoveryContext.Provider value={value}>
      {children}
    </RecoveryContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Business logic — pure functions
 * ───────────────────────────────────────────────────────────────────────── */

function deriveGrade(a) {
  const painRest    = a.painRest    ?? 0;
  const painWalking = a.painWalking ?? 0;
  const painSport   = a.painSport   ?? 5;
  const redFlags    = a.redFlags    ?? [];
  const symptoms    = (a.symptoms   ?? []).join(' ');
  const mechanism   = (a.mechanism  ?? '').toLowerCase();

  if (redFlags.length > 0)                                                    return 'grade3';
  if (painRest >= 6)                                                          return 'grade3';
  if (painWalking >= 7)                                                       return 'grade3';
  if (/instability|giving way|locking|catching|cannot bear/i.test(symptoms)) return 'grade3';

  if (painRest >= 3 && painWalking >= 3)                                      return 'grade2';
  if (painSport >= 7 && painWalking >= 3)                                     return 'grade2';

  if (painRest <= 1 && painWalking <= 2 && painSport <= 4 &&
      /gradual|overuse|training|increase|load/i.test(mechanism))             return 'overload';

  return 'grade1';
}

function resolveInjuryTitle(a, regionName) {
  const knowledge = injuryKnowledge[a.primaryRegion];
  if (!knowledge?.injurySubtypes?.length) {
    // Unsupported region — generic fallback
    if (/overload|overuse|gradual/i.test(a.grade || '') || /overload|overuse|gradual/i.test(a.mechanism || '')) return `${regionName} overload`;
    if (/grade3|grade 3|severe/i.test(a.grade || '')) return `${regionName} tear`;
    return `${regionName} strain`;
  }

  const subtypes = knowledge.injurySubtypes;
  const gradeId  = a.grade || '';
  const mechStr  = (a.mechanism || '').toLowerCase();
  const exactId  = (a.exactArea || '').toLowerCase();
  const symptoms = (a.symptoms || []).join(' ').toLowerCase();

  // 1. Severe / grade 3 → refer/severe_risk subtype
  if (/grade3|grade_3/i.test(gradeId)) {
    const severe = subtypes.find((s) => s.riskLevel === 'refer' && /severe|tear|rupture/i.test(s.name));
    if (severe) return severe.name;
  }

  // 2. Overload mechanism → overload subtype
  if (/overload/i.test(gradeId) || /overuse|gradual|load|training/i.test(mechStr)) {
    const overload = subtypes.find((s) => /overload|tightness|tendinopathy|syndrome/i.test(s.name));
    if (overload) return overload.name;
  }

  // 3. Tendon signals
  const tendonSignal = /tendon|achilles|insertion|above.*knee|below.*knee/i.test(exactId) ||
                       /tendon|achilles/i.test(symptoms) ||
                       /chronic|morning|stiffness/i.test(mechStr);
  if (tendonSignal) {
    const tendon = subtypes.find((s) => /tendon|tendinopathy|achilles/i.test(s.name) && s.riskLevel !== 'refer');
    if (tendon) return tendon.name;
  }

  // 4. Match exactArea id against subtype ids (partial)
  if (exactId) {
    const match = subtypes.find((s) => s.id.includes(exactId) || exactId.includes(s.id.replace(/_strain|_sprain|_pain/g, '')));
    if (match) return match.name;
  }

  // 5. Default: first non-refer acute subtype
  const def = subtypes.find((s) => s.riskLevel !== 'refer');
  return def ? def.name : `${regionName} injury`;
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
    injuryTitle: resolveInjuryTitle(a, region.name),
    exactAreaName: exactArea?.name || 'General area',
    gradeName: grade.name,
    mechanism: a.mechanism,
    returnRange: isHighRisk ? `${returnRange} · medical review recommended` : returnRange,
    plan,
    progress,
    today: findToday(plan),
    aiStatus: isHighRisk
      ? 'Your answers include higher-risk signs. Use early-care guidance only and arrange medical review before harder loading.'
      : 'Start controlled. Progress only when pain stays low during the session and the next morning is stable.',
    planNote: buildPlanNote(a, isHighRisk, exactArea)
  };
}

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

  const restPhase = buildInitialRestPhase(a);
  return restPhase ? [restPhase, ...rehabPhases] : rehabPhases;
}

function phaseRestDays(phaseId) {
  return phaseId === 'protect' || phaseId === 'restore' ? 2 : 1;
}

function buildWeek(phase, lane, a, wIndex, weeksCount) {
  const focus       = weekFocus(phase.id, wIndex, weeksCount);
  const restBetween = phaseRestDays(phase.id);
  const cycleLen    = restBetween + 1;
  const days        = [];
  let sessionCount  = 0;

  for (let dIndex = 0; dIndex < 7; dIndex++) {
    const posInCycle = dIndex % cycleLen;
    if (posInCycle === 0) {
      const sessionIndex = wIndex * 10 + sessionCount;
      days.push(buildTrainingDay(phase, lane, a, wIndex, dIndex, sessionIndex));
      sessionCount++;
    } else if (posInCycle === 1) {
      days.push(buildActiveRecoveryDay(phase, a, dIndex));
    } else {
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

const REGION_NAME_TO_ID = Object.fromEntries(injuryRegions.map(r => [r.name, r.id]));
const EXPANDED_REGIONS  = new Set(['hamstring', 'quadriceps', 'adductor_groin']);

const SECONDARY_PHASE_MAP = {
  protect:  null,
  restore:  'restore',
  capacity: 'restore',
  speed:    'capacity',
  return:   'capacity'
};

function getSecondaryExercises(a, phaseId, sessionIndex) {
  const secondaryName = a.secondaryRegions;
  if (!secondaryName || secondaryName.trim() === '') return [];

  const secondaryPhaseId = SECONDARY_PHASE_MAP[phaseId];
  if (!secondaryPhaseId) return [];

  const secondaryId = REGION_NAME_TO_ID[secondaryName];
  if (!secondaryId) return [];

  if (EXPANDED_REGIONS.has(secondaryId)) {
    const mockAssessment = { ...a, primaryRegion: secondaryId, grade: 'grade1' };
    const session = getAdaptedSession(mockAssessment, secondaryPhaseId, sessionIndex);
    if (session && session.length > 0) {
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

  const legacyPool = exerciseBank[secondaryId];
  if (!legacyPool) return [];
  const pool = legacyPool[secondaryPhaseId] || legacyPool.protect || [];
  if (pool.length === 0) return [];
  const pick = pool[sessionIndex % pool.length];
  return [{ ...pick, blockLabel: `Secondary focus · ${secondaryName}`, isSecondary: true, isFromEngine: false }];
}

function buildTrainingDay(phase, lane, a, wIndex, dIndex, sessionIndex) {
  const pool     = lane[phase.id] || lane.protect || [];
  const mobility = buildMobility(phase.id, a, dIndex);

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

function applyGradeAndContextAdjustments(exercises, phase, a, wIndex) {
  return exercises.map((ex, idx) => {
    const copy = { ...ex };
    if (a.grade === 'grade2' || a.grade === 'unknown') {
      copy.intensity = copy.intensity
        .replace('RPE 7–9', 'RPE 6–7')
        .replace('RPE 6–8', 'RPE 5–7')
        .replace('RPE 7–8', 'RPE 6–7');
    }
    if (a.grade === 'grade3') {
      copy.intensity = 'RPE 2–4 — get clinical clearance before progressing';
    }
    if (phase.id === 'capacity' && wIndex > 0 && idx < 2) {
      copy.prescription = copy.prescription + ' · add small load if previous session was green';
    }
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
  if (a.equipment.includes('Treadmill') || a.sports?.includes('Running')) options.push(ex('Easy walk or walk-jog', phaseId === 'speed' || phaseId === 'return' ? '15–25 min' : '10–15 min', 'Flat route / treadmill', 'RPE 2–4', 'Use jogging only if phase allows it and pain stays low.', 'Easy walk', 'Remove jogging.'));
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
  return tendonBias && (phaseId === 'protect' || phaseId === 'restore')
    ? [ex('Pain-modulating isometric', '5 x 30 sec', 'Bodyweight / band', 'RPE 4–5', 'Tendon-style hold; pain should settle after, not spike.', 'Shorter isometric', '3 x 20 sec.'), ...items]
    : items;
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

export function calculateProgress(plan = []) {
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

export function findToday(plan) {
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
