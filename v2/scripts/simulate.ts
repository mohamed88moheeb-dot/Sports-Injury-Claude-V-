/**
 * Plays a simulated athlete through a protocol, day by day, and prints what
 * the engine decides. Usage: npm run simulate -- [sprint|stretch|tendon|flare]
 */
import { evaluateTests, planToday, recordSession, startCourse, timeline, type CourseState, type TestResults } from '../src/engine/engine';
import { getProtocol } from '../src/content';

const scenario = process.argv[2] ?? 'sprint';
const p = getProtocol('hamstring-strain');
const answers = {
  mechanism: scenario === 'stretch' ? 'stretch' : 'sprint',
  tendon: scenario === 'tendon' ? 'yes' : 'no',
  days_since: 2, walk_pain: 3, previous: false,
};

const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const start = '2026-10-01';
const r = startCourse(p, answers, start, 3);
if (!r.state) { console.log('Referred at intake:', r.triage.raised.map((f) => f.message)); process.exit(0); }
let state: CourseState = r.state;
console.log(`\n${p.name} · track: ${r.track!.label} (${r.track!.timelineDays.join('–')} days typical)\n`);

// A plausible recovering athlete: capacity climbs ~4%/day, slower on the tendon track.
const rate = scenario === 'tendon' ? 2.2 : scenario === 'stretch' ? 2.6 : 4;
const resultsOn = (day: number): TestResults => {
  const cap = Math.min(100, 55 + day * rate);
  return {
    gait: day >= 2, bridge_90_sym: cap + 5, bridge_long_sym: cap, aslr_sym: Math.min(100, cap + 8),
    stretch_pain: Math.max(0, 5 - Math.floor(day / 3)), run_pain: day * rate > 25 ? 0 : 2,
    palpation: day * rate > 60 ? 0 : 1, sprint_pct: Math.min(100, 70 + day * rate * 0.6),
    full_training: day * rate > 70, readiness: Math.min(10, 4 + Math.floor(day * rate / 15)),
  };
};

for (let day = 0; day < 90 && state.status === 'active'; day++) {
  const date = addDays(start, day);
  const flare = scenario === 'flare' && (day === 12 || day === 13);
  const plan = planToday(p, state, { date, painRest: 1, painMorning: flare ? 6 : 3, redFlags: [] });
  state = plan.state;
  const what = plan.kind === 'session' ? `${plan.dayType.padEnd(11)} ${plan.slots.map((s) => s.exercise.name).join(', ')}` : plan.kind.toUpperCase();
  const [lo, hi] = timeline(p, state, date).remaining;
  console.log(`D${String(day).padStart(2)} ${plan.stage.name.padEnd(28)} ${what}  [${lo}–${hi}d left]`);
  plan.reasons.filter((x) => x.code !== 'test_due').forEach((x) => console.log(`      ↳ ${x.text}`));
  if (plan.kind === 'session') state = recordSession(p, state, { date, maxPain: { strength: 2, running: plan.dayType === 'running' && day * rate <= 25 ? 1 : 0 } });
  if (plan.testDue) {
    const t = evaluateTests(p, state, resultsOn(day), date);
    state = t.state;
    console.log(`      ◆ TEST → ${t.decision.toUpperCase()}: ${t.reasons.map((x) => x.text).join(' ')}`);
  }
}
console.log(`\nFinished: ${state.status} after ${state.events.length} stage events.`);
