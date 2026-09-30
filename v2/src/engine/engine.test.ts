import { describe, expect, it } from 'vitest';
import { classify, evaluateTests, planToday, recordSession, startCourse, timeline, triage, type CheckIn, type CourseState } from './engine';
import { validateProtocol } from './validate';
import { getProtocol, facts } from '@/content';
import hamstringRaw from '@content/protocols/hamstring.json';

const p = getProtocol('hamstring-strain');
const sprintAnswers = { mechanism: 'sprint', tendon: 'no', days_since: 2, walk_pain: 3, previous: false };
const ok = (date: string, over: Partial<CheckIn> = {}): CheckIn => ({ date, painRest: 1, painMorning: 3, redFlags: [], ...over });

function start(answers: Record<string, string | number | boolean> = sprintAnswers): CourseState {
  const r = startCourse(p, answers, '2026-10-01', 3);
  if (!r.state) throw new Error('expected course to start');
  return r.state;
}

const allPass = { gait: true, bridge_90_sym: 95, bridge_long_sym: 95, aslr_sym: 95, stretch_pain: 0, run_pain: 0, palpation: 0, sprint_pct: 97, full_training: true, readiness: 9 };

describe('content', () => {
  it('hamstring protocol validates against its facts', () => {
    expect(validateProtocol(hamstringRaw, facts['hamstring-strain']!)).toEqual([]);
  });
  it('rejects a protocol citing an unknown fact', () => {
    const bad = structuredClone(hamstringRaw) as typeof hamstringRaw;
    bad.exercises[0]!.evidence.facts = ['nope-1'];
    expect(validateProtocol(bad, facts['hamstring-strain']!)).toContain('exercise walk: unknown fact nope-1');
  });
  it('rejects a protocol citing a quarantined fact', () => {
    const bad = structuredClone(hamstringRaw) as typeof hamstringRaw;
    bad.exercises[0]!.evidence.facts = ['hs-018'];
    expect(validateProtocol(bad, facts['hamstring-strain']!)).toContain('exercise walk: cites quarantined fact hs-018');
  });
});

describe('intake', () => {
  it('suspected avulsion blocks the plan with an urgent referral', () => {
    const r = startCourse(p, { ...sprintAnswers, rf_avulsion: true }, '2026-10-01', 3);
    expect(r.state).toBeNull();
    expect(r.triage.outcome).toBe('urgent');
  });
  it('worst red flag wins', () => {
    expect(triage(p, { rf_nerve: true, rf_dvt: true }).outcome).toBe('emergency');
  });
  it('routes by mechanism and tendon involvement', () => {
    expect(classify(p, sprintAnswers).id).toBe('sprint');
    expect(classify(p, { ...sprintAnswers, mechanism: 'stretch' }).id).toBe('stretch');
    expect(classify(p, { ...sprintAnswers, mechanism: 'stretch', tendon: 'yes' }).id).toBe('tendon');
  });
});

describe('daily plan', () => {
  it('follows the stage pattern so days differ', () => {
    const s = start();
    const d0 = planToday(p, s, ok('2026-10-01'));
    const d1 = planToday(p, s, ok('2026-10-02'));
    expect(d0.dayType).toBe('lengthening');
    expect(d1.dayType).toBe('strength');
    expect(d0.slots.map((x) => x.exercise.id)).not.toEqual(d1.slots.map((x) => x.exercise.id));
  });
  it('a daily red flag stops the plan and marks the course referred', () => {
    const r = planToday(p, start(), ok('2026-10-02', { redFlags: ['rf_dvt'] }));
    expect(r.kind).toBe('stop');
    expect(r.referral?.action).toBe('emergency');
    expect(r.state.status).toBe('referred');
    expect(planToday(p, r.state, ok('2026-10-03')).kind).toBe('stop');
  });
  it('high resting pain means rest', () => {
    expect(planToday(p, start(), ok('2026-10-02', { painRest: 7 })).kind).toBe('rest');
  });
  it('a flare dials the dose down (regression swap or one set fewer)', () => {
    const s = { ...start(), stageIndex: 2, stageStartedOn: '2026-10-10' };
    const normal = planToday(p, s, ok('2026-10-10'));
    const flare = planToday(p, s, ok('2026-10-10', { painMorning: 6 }));
    expect(flare.reasons.some((r) => r.code === 'flare')).toBe(true);
    expect(flare.slots[0]!.exercise.id).toBe('diver'); // rdl → diver
    expect(normal.slots[0]!.exercise.id).toBe('rdl');
  });
  it('repeated flares move the athlete back a stage', () => {
    let s: CourseState = { ...start(), stageIndex: 2, stageStartedOn: '2026-10-10' };
    s = planToday(p, s, ok('2026-10-11', { painMorning: 6 })).state;
    const r = planToday(p, s, ok('2026-10-12', { painMorning: 6 }));
    expect(r.state.stageIndex).toBe(1);
    expect(r.state.events.at(-1)?.kind).toBe('regress');
  });
  it('painful running puts running on hold until a pain-free run test', () => {
    let s: CourseState = { ...start(), stageIndex: 1, stageStartedOn: '2026-10-05' };
    s = recordSession(p, s, { date: '2026-10-07', maxPain: { running: 2 } });
    const runDay = planToday(p, s, ok('2026-10-07')); // day 2 of stage 2 = running
    expect(runDay.dayType).not.toBe('running');
    const cleared = evaluateTests(p, s, { ...allPass, run_pain: 0 }, '2026-10-08').state;
    expect(cleared.runHold).toBe(false);
  });
  it('strength pain above the threshold lowers the next session', () => {
    const s = recordSession(p, start(), { date: '2026-10-01', maxPain: { strength: 6 } });
    expect(s.doseDownNext).toBe(true);
    const next = planToday(p, s, ok('2026-10-02'));
    expect(next.reasons.some((r) => r.code === 'dose_down')).toBe(true);
    expect(next.state.doseDownNext).toBe(false);
  });
  it('offers a test day once minimum days are done', () => {
    const s = start();
    expect(planToday(p, s, ok('2026-10-02')).testDue).toBe(false);
    expect(planToday(p, s, ok('2026-10-04')).testDue).toBe(true);
  });
});

describe('test day', () => {
  it('advances when every gate passes', () => {
    const r = evaluateTests(p, start(), allPass, '2026-10-04');
    expect(r.decision).toBe('advance');
    expect(r.state.stageIndex).toBe(1);
  });
  it('holds and names the failed gate', () => {
    const r = evaluateTests(p, start(), { ...allPass, bridge_90_sym: 60 }, '2026-10-04');
    expect(r.decision).toBe('hold');
    expect(r.reasons[0]!.text).toMatch(/bridge/i);
  });
  it('holds when tests pass but minimum days are not up', () => {
    expect(evaluateTests(p, start(), allPass, '2026-10-02').decision).toBe('hold');
  });
  it('holds when a test is missing', () => {
    const { gait: _, ...partial } = allPass;
    expect(evaluateTests(p, start(), partial, '2026-10-04').reasons[0]!.code).toBe('incomplete');
  });
  it('regresses on a clearly painful run', () => {
    const s = { ...start(), stageIndex: 2, stageStartedOn: '2026-10-05' };
    expect(evaluateTests(p, s, { ...allPass, run_pain: 5 }, '2026-10-12').decision).toBe('regress');
  });
  it('tendon track needs the stricter strength gate in stage 3', () => {
    const tendon = { ...start({ ...sprintAnswers, tendon: 'yes' }), stageIndex: 2, stageStartedOn: '2026-10-05' };
    const sprint = { ...start(), stageIndex: 2, stageStartedOn: '2026-10-05' };
    const results = { ...allPass, bridge_long_sym: 85 };
    expect(evaluateTests(p, sprint, results, '2026-10-12').decision).toBe('advance');
    expect(evaluateTests(p, tendon, results, '2026-10-12').decision).toBe('hold');
  });
  it('slower-healing tracks need more days in a stage before advancing', () => {
    const sprint = start();
    const stretch = start({ ...sprintAnswers, mechanism: 'stretch' });
    expect(evaluateTests(p, sprint, allPass, '2026-10-04').decision).toBe('advance');
    expect(evaluateTests(p, stretch, allPass, '2026-10-04').decision).toBe('hold');
    expect(evaluateTests(p, stretch, allPass, '2026-10-06').decision).toBe('advance');
  });
  it('completes after the final stage gates', () => {
    const s = { ...start(), stageIndex: 4, stageStartedOn: '2026-10-20' };
    const r = evaluateTests(p, s, allPass, '2026-10-25');
    expect(r.decision).toBe('complete');
    expect(r.state.status).toBe('complete');
  });
});

describe('timeline', () => {
  it('gives a range that shrinks over time and is longer for tendon injuries', () => {
    const s = start();
    const t0 = timeline(p, s, '2026-10-01').remaining;
    const t10 = timeline(p, s, '2026-10-11').remaining;
    expect(t0[0]).toBeLessThanOrEqual(t0[1]);
    expect(t10[1]).toBeLessThan(t0[1]);
    const tendon = timeline(p, start({ ...sprintAnswers, tendon: 'yes' }), '2026-10-01').remaining;
    expect(tendon[1]).toBeGreaterThan(t0[1]);
  });
});
