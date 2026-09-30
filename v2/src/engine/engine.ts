/**
 * The ROYO clinical engine. Pure and deterministic: same protocol + state +
 * input always yields the same output. No condition-specific code lives here —
 * everything clinical comes from the protocol.
 */
import type { Condition, DayType, Dose, Exercise, Gate, Protocol, RedFlag, Slot, Stage } from './schema';

export type AnswerValue = string | number | boolean | string[];
export type Answers = Record<string, AnswerValue>;

export type TriageOutcome = 'proceed' | RedFlag['action'];

export interface Reason {
  code: string;
  text: string;
  facts?: string[];
}

export interface StageEvent {
  date: string;
  kind: 'start' | 'advance' | 'hold' | 'regress' | 'refer' | 'complete';
  fromStage?: string;
  toStage?: string;
  reasons: Reason[];
}

export interface CourseState {
  protocolId: string;
  protocolVersion: string;
  trackId: string;
  answers: Answers;
  startedOn: string;
  stageIndex: number;
  stageStartedOn: string;
  lastTestOn?: string;
  /** Morning pain recorded at course start; flares are measured against it. */
  baselineMorningPain: number;
  flareStreak: number;
  /** Set by a painful session; lowers the next session's dose once. */
  doseDownNext: boolean;
  /** Set when running hurt; running days are swapped out until a pain-free run test. */
  runHold: boolean;
  status: 'active' | 'referred' | 'complete';
  events: StageEvent[];
}

export interface CheckIn {
  date: string;
  painRest: number;
  painMorning: number;
  /** Ids of daily red flags the athlete answered yes to. */
  redFlags: string[];
}

export interface PlannedSlot {
  exercise: Exercise;
  dose: Dose;
  adjusted?: string;
}

export interface TodayPlan {
  kind: 'session' | 'rest' | 'stop';
  dayType: DayType;
  stage: Stage;
  slots: PlannedSlot[];
  testDue: boolean;
  reasons: Reason[];
  referral?: { action: RedFlag['action']; message: string };
  state: CourseState;
}

export interface SessionResult {
  date: string;
  /** Highest pain (0–10) reported per exercise category. */
  maxPain: Partial<Record<Exercise['category'], number>>;
}

export type TestResults = Record<string, number | boolean>;

export interface GateResult {
  gate: Gate;
  value: number | boolean | undefined;
  passed: boolean;
  regress: boolean;
}

export interface TestDecision {
  decision: 'advance' | 'hold' | 'regress' | 'complete';
  gates: GateResult[];
  reasons: Reason[];
  state: CourseState;
}

// ───────────────────────── helpers ─────────────────────────

const DAY_MS = 86_400_000;

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

export function matches(c: Condition | undefined, answers: Answers, trackId?: string): boolean {
  if (!c) return true;
  if ('all' in c) return c.all.every((x) => matches(x, answers, trackId));
  if ('any' in c) return c.any.some((x) => matches(x, answers, trackId));
  if ('not' in c) return !matches(c.not, answers, trackId);
  if ('track' in c) return trackId !== undefined && c.track.includes(trackId);
  const v = answers[c.q];
  if (v === undefined) return false;
  if ('eq' in c) return Array.isArray(v) ? v.includes(String(c.eq)) : v === c.eq;
  if ('in' in c) return Array.isArray(v) ? v.some((x) => c.in.includes(x)) : c.in.includes(v as string | number);
  if ('gte' in c) return typeof v === 'number' && v >= c.gte;
  return typeof v === 'number' && v <= c.lte;
}

const SEVERITY: Record<TriageOutcome, number> = { proceed: 0, see_clinician: 1, urgent: 2, emergency: 3 };

function stageAt(p: Protocol, i: number): Stage {
  const s = p.stages[i];
  if (!s) throw new Error(`protocol ${p.id} has no stage ${i}`);
  return s;
}

/** Minimum days in a stage for this athlete's track. */
export function minDays(p: Protocol, s: CourseState, stage: Stage): number {
  const scale = p.tracks.find((t) => t.id === s.trackId)?.minDaysScale ?? 1;
  return Math.ceil(stage.minDays * scale);
}

function exercise(p: Protocol, id: string): Exercise {
  const e = p.exercises.find((x) => x.id === id);
  if (!e) throw new Error(`protocol ${p.id} has no exercise ${id}`);
  return e;
}

// ───────────────────────── intake ─────────────────────────

export function triage(p: Protocol, answers: Answers, daily = false) {
  let outcome: TriageOutcome = 'proceed';
  const raised: RedFlag[] = [];
  for (const rf of p.redFlags) {
    if (daily && !rf.daily) continue;
    if (answers[rf.id] === true) {
      raised.push(rf);
      if (SEVERITY[rf.action] > SEVERITY[outcome]) outcome = rf.action;
    }
  }
  return { outcome, raised };
}

export function classify(p: Protocol, answers: Answers) {
  const track = p.tracks.find((t) => matches(t.when, answers));
  if (!track) throw new Error(`protocol ${p.id}: no default track`);
  return track;
}

export function startCourse(p: Protocol, answers: Answers, date: string, baselineMorningPain: number) {
  const t = triage(p, answers);
  if (t.outcome !== 'proceed') return { triage: t, track: null, state: null };
  const track = classify(p, answers);
  const first = stageAt(p, 0);
  const state: CourseState = {
    protocolId: p.id,
    protocolVersion: p.version,
    trackId: track.id,
    answers,
    startedOn: date,
    stageIndex: 0,
    stageStartedOn: date,
    baselineMorningPain,
    flareStreak: 0,
    doseDownNext: false,
    runHold: false,
    status: 'active',
    events: [{ date, kind: 'start', toStage: first.id, reasons: [{ code: 'track', text: track.explain, facts: track.evidence.facts }] }],
  };
  return { triage: t, track, state };
}

// ───────────────────────── daily plan ─────────────────────────

function regressDose(p: Protocol, slot: Slot): PlannedSlot {
  const ex = exercise(p, slot.exercise);
  if (ex.regression) {
    return { exercise: exercise(p, ex.regression), dose: slot.dose, adjusted: `Swapped from ${ex.name} (easier today)` };
  }
  const sets = Math.max(1, slot.dose.sets - 1);
  return { exercise: ex, dose: { ...slot.dose, sets }, adjusted: sets < slot.dose.sets ? 'One set fewer today' : undefined };
}

export function planToday(p: Protocol, prev: CourseState, c: CheckIn): TodayPlan {
  let state: CourseState = { ...prev };
  const reasons: Reason[] = [];
  const pain = p.rules.pain;

  if (state.status !== 'active') {
    const stage = stageAt(p, state.stageIndex);
    return { kind: 'stop', dayType: 'rest', stage, slots: [], testDue: false, reasons: [{ code: state.status, text: state.status === 'complete' ? 'Course complete.' : 'Plan paused until a clinician has seen you.' }], state };
  }

  // 1. Red flags stop everything.
  const flagAnswers: Answers = Object.fromEntries(c.redFlags.map((id) => [id, true]));
  const t = triage(p, flagAnswers, true);
  if (t.outcome !== 'proceed') {
    const worst = t.raised.reduce((a, b) => (SEVERITY[b.action] > SEVERITY[a.action] ? b : a));
    state = {
      ...state,
      status: 'referred',
      events: [...state.events, { date: c.date, kind: 'refer', reasons: t.raised.map((r) => ({ code: r.id, text: r.message, facts: r.evidence.facts })) }],
    };
    return {
      kind: 'stop', dayType: 'rest', stage: stageAt(p, state.stageIndex), slots: [], testDue: false,
      reasons: [{ code: 'red_flag', text: worst.message, facts: worst.evidence.facts }],
      referral: { action: worst.action, message: worst.message }, state,
    };
  }

  // 2. High resting pain: rest today.
  if (c.painRest >= pain.stopAtRest) {
    return {
      kind: 'rest', dayType: 'rest', stage: stageAt(p, state.stageIndex), slots: [], testDue: false,
      reasons: [{ code: 'rest_pain', text: `Resting pain ${c.painRest}/10 is too high to load today. Rest, and check in tomorrow.`, facts: pain.evidence.facts }],
      state,
    };
  }

  // 3. Flare detection and auto-regulation.
  const flare = c.painMorning - state.baselineMorningPain >= pain.flareDelta;
  let doseDown = state.doseDownNext;
  if (flare) {
    state.flareStreak += 1;
    doseDown = true;
    reasons.push({ code: 'flare', text: `Morning pain is up ${c.painMorning - state.baselineMorningPain} points from your baseline, so today is lighter.`, facts: pain.evidence.facts });
    if (state.flareStreak >= p.rules.flaresToRegress && state.stageIndex > 0) {
      const from = stageAt(p, state.stageIndex);
      const to = stageAt(p, state.stageIndex - 1);
      state = {
        ...state, stageIndex: state.stageIndex - 1, stageStartedOn: c.date, flareStreak: 0, lastTestOn: undefined,
        events: [...state.events, { date: c.date, kind: 'regress', fromStage: from.id, toStage: to.id, reasons: [{ code: 'flares', text: `${p.rules.flaresToRegress} flare days in a row` }] }],
      };
      reasons.push({ code: 'regress', text: `Several flare days in a row, so you've moved back to ${to.name} to settle things.` });
    }
  } else {
    state.flareStreak = 0;
    if (c.painMorning < state.baselineMorningPain) state.baselineMorningPain = c.painMorning;
  }
  if (state.doseDownNext && !flare) reasons.push({ code: 'dose_down', text: 'Yesterday\'s session hurt more than it should, so today is a notch easier.' });
  state.doseDownNext = false;

  // 4. Which day is it?
  const stage = stageAt(p, state.stageIndex);
  const dayInStage = daysBetween(state.stageStartedOn, c.date);
  let dayType: DayType = stage.pattern[dayInStage % stage.pattern.length] ?? 'rest';
  if (dayType === 'running' && (state.runHold || flare)) {
    dayType = stage.sessions.strength?.length ? 'strength' : 'recovery';
    reasons.push({ code: 'run_hold', text: state.runHold ? 'Running is on hold until you complete a pain-free run.' : 'No running on a flare day.' });
  }

  // 5. Test day?
  const sinceTest = state.lastTestOn ? daysBetween(state.lastTestOn, c.date) : Infinity;
  const testDue = !flare && dayInStage >= minDays(p, state, stage) && sinceTest >= p.rules.testEveryDays;
  if (testDue) reasons.push({ code: 'test_due', text: `Test day: pass these to move on from ${stage.name}.` });

  if (dayType === 'rest') {
    return { kind: 'rest', dayType, stage, slots: [], testDue, reasons: [...reasons, { code: 'rest', text: 'Planned rest day — adaptation happens here.' }], state };
  }

  const slots = (stage.sessions[dayType] ?? [])
    .filter((s) => matches(s.when, state.answers, state.trackId))
    .map((s) => (doseDown ? regressDose(p, s) : { exercise: exercise(p, s.exercise), dose: s.dose }));

  return { kind: 'session', dayType, stage, slots, testDue, reasons, state };
}

// ───────────────────────── after a session ─────────────────────────

export function recordSession(p: Protocol, prev: CourseState, r: SessionResult): CourseState {
  const pain = p.rules.pain;
  const run = r.maxPain.running;
  const worstThreshold = Math.max(
    ...Object.entries(r.maxPain).filter(([k]) => k !== 'running').map(([, v]) => v ?? 0),
    0,
  );
  return {
    ...prev,
    runHold: run === undefined ? prev.runHold : run > pain.painFreeMax,
    doseDownNext: worstThreshold > pain.strengthMax,
  };
}

// ───────────────────────── test day ─────────────────────────

function compare(op: '>=' | '<=' | '==', a: number | boolean, b: number | boolean): boolean {
  if (op === '==') return a === b;
  if (typeof a !== 'number' || typeof b !== 'number') return false;
  return op === '>=' ? a >= b : a <= b;
}

export function evaluateTests(p: Protocol, prev: CourseState, results: TestResults, date: string): TestDecision {
  const stage = stageAt(p, prev.stageIndex);
  const gates = stage.gates
    .filter((g) => matches(g.when, prev.answers, prev.trackId))
    .map((gate): GateResult => {
      const value = results[gate.test];
      const passed = value !== undefined && compare(gate.op, value, gate.value);
      const regress = value !== undefined && typeof value === 'number' && !!gate.regressIf && compare(gate.regressIf.op, value, gate.regressIf.value);
      return { gate, value, passed, regress };
    });

  // Tests happen at the end of the day; a new stage begins tomorrow.
  const tomorrow = new Date(Date.parse(`${date}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10);
  const testName = (id: string) => p.tests.find((t) => t.id === id)?.name ?? id;
  const reasons: Reason[] = [];
  let state: CourseState = { ...prev, lastTestOn: date };
  const event = (kind: StageEvent['kind'], toStage?: string): StageEvent => ({ date, kind, fromStage: stage.id, toStage, reasons });

  // A pain-free run on test day lifts a running hold.
  if (p.rules.runClearTest && results[p.rules.runClearTest] === 0) state.runHold = false;

  const missing = gates.filter((g) => g.value === undefined);
  if (missing.length) {
    reasons.push({ code: 'incomplete', text: `Not tested yet: ${missing.map((g) => testName(g.gate.test)).join(', ')}.` });
    state = { ...state, events: [...state.events, event('hold')] };
    return { decision: 'hold', gates, reasons, state };
  }

  const regressing = gates.filter((g) => g.regress);
  if (regressing.length && prev.stageIndex > 0) {
    const to = stageAt(p, prev.stageIndex - 1);
    regressing.forEach((g) => reasons.push({ code: 'regress', text: `${testName(g.gate.test)} is well short of where it should be.`, facts: g.gate.evidence.facts }));
    state = { ...state, stageIndex: prev.stageIndex - 1, stageStartedOn: tomorrow, lastTestOn: undefined, events: [...state.events, event('regress', to.id)] };
    return { decision: 'regress', gates, reasons, state };
  }

  const failed = gates.filter((g) => !g.passed);
  if (failed.length) {
    failed.forEach((g) => reasons.push({ code: 'gate', text: `${testName(g.gate.test)}: need ${g.gate.op} ${g.gate.value}, got ${g.value}.`, facts: g.gate.evidence.facts }));
    state = { ...state, events: [...state.events, event('hold')] };
    return { decision: 'hold', gates, reasons, state };
  }

  const dayInStage = daysBetween(prev.stageStartedOn, date);
  const needDays = minDays(p, prev, stage);
  if (dayInStage < needDays) {
    reasons.push({ code: 'min_days', text: `All tests passed — tissue still needs ${needDays - dayInStage} more day(s) in ${stage.name}.` });
    state = { ...state, events: [...state.events, event('hold')] };
    return { decision: 'hold', gates, reasons, state };
  }

  if (prev.stageIndex === p.stages.length - 1) {
    reasons.push({ code: 'complete', text: 'All return-to-sport criteria met.' });
    state = { ...state, status: 'complete', events: [...state.events, event('complete')] };
    return { decision: 'complete', gates, reasons, state };
  }

  const to = stageAt(p, prev.stageIndex + 1);
  reasons.push({ code: 'advance', text: `All gates passed — moving on to ${to.name}.` });
  state = { ...state, stageIndex: prev.stageIndex + 1, stageStartedOn: tomorrow, lastTestOn: undefined, events: [...state.events, event('advance', to.id)] };
  return { decision: 'advance', gates, reasons, state };
}

// ───────────────────────── timeline ─────────────────────────

/** Remaining days to return to sport as an honest range, never a single date. */
export function timeline(p: Protocol, s: CourseState, today: string) {
  const track = p.tracks.find((t) => t.id === s.trackId) ?? p.tracks[p.tracks.length - 1]!;
  const elapsed = daysBetween(s.startedOn, today);
  const stagesLeft = p.stages.slice(s.stageIndex);
  const floor = stagesLeft.reduce((n, st, i) => n + (i === 0 ? Math.max(0, minDays(p, s, st) - daysBetween(s.stageStartedOn, today)) : minDays(p, s, st)), 0);
  const min = Math.max(floor, track.timelineDays[0] - elapsed);
  const max = Math.max(min, track.timelineDays[1] - elapsed);
  return { elapsed, remaining: [min, max] as [number, number], track };
}
