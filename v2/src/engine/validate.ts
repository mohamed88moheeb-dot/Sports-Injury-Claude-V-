/**
 * Structural + referential validation for a protocol against its fact base.
 * Returns human-readable problems; an empty list means the content is shippable.
 */
import { Protocol, Fact, type Condition, type Evidence } from './schema';

export function validateProtocol(raw: unknown, rawFacts: unknown[]): string[] {
  const parsed = Protocol.safeParse(raw);
  if (!parsed.success) {
    return parsed.error.issues.map((i) => `schema: ${i.path.join('.')}: ${i.message}`);
  }
  const p = parsed.data;
  const problems: string[] = [];

  const facts = new Map<string, Fact>();
  for (const f of rawFacts) {
    const r = Fact.safeParse(f);
    if (r.success) facts.set(r.data.id, r.data);
    else problems.push(`fact: ${(f as { id?: string })?.id ?? '?'} invalid`);
  }

  const checkEvidence = (where: string, e: Evidence) => {
    for (const id of e.facts) {
      const f = facts.get(id);
      if (!f) problems.push(`${where}: unknown fact ${id}`);
      else if (f.status === 'quarantined') problems.push(`${where}: cites quarantined fact ${id}`);
    }
  };

  const unique = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`${kind}: duplicate id ${id}`);
      seen.add(id);
    }
    return seen;
  };

  const questionIds = unique('intake', p.intake.map((q) => q.id));
  const trackIds = unique('tracks', p.tracks.map((t) => t.id));
  const exerciseIds = unique('exercises', p.exercises.map((e) => e.id));
  const testIds = unique('tests', p.tests.map((t) => t.id));
  unique('stages', p.stages.map((s) => s.id));
  unique('redFlags', p.redFlags.map((r) => r.id));

  const checkCondition = (where: string, c: Condition | undefined) => {
    if (!c) return;
    if ('all' in c) c.all.forEach((x) => checkCondition(where, x));
    else if ('any' in c) c.any.forEach((x) => checkCondition(where, x));
    else if ('not' in c) checkCondition(where, c.not);
    else if ('track' in c) c.track.forEach((t) => trackIds.has(t) || problems.push(`${where}: unknown track ${t}`));
    else if (!questionIds.has(c.q)) problems.push(`${where}: unknown question ${c.q}`);
  };

  p.redFlags.forEach((r) => checkEvidence(`redFlag ${r.id}`, r.evidence));
  p.tracks.forEach((t, i) => {
    checkEvidence(`track ${t.id}`, t.evidence);
    checkCondition(`track ${t.id}`, t.when);
    if (t.timelineDays[0] > t.timelineDays[1]) problems.push(`track ${t.id}: timeline min > max`);
    if (i === p.tracks.length - 1 && t.when) problems.push(`track ${t.id}: last track must be the default (no when)`);
  });
  p.exercises.forEach((e) => {
    checkEvidence(`exercise ${e.id}`, e.evidence);
    if (e.regression && !exerciseIds.has(e.regression)) problems.push(`exercise ${e.id}: unknown regression ${e.regression}`);
  });
  p.tests.forEach((t) => checkEvidence(`test ${t.id}`, t.evidence));
  checkEvidence('rules.pain', p.rules.pain.evidence);
  if (p.rules.runClearTest && !testIds.has(p.rules.runClearTest)) problems.push(`rules: unknown runClearTest ${p.rules.runClearTest}`);

  for (const s of p.stages) {
    checkEvidence(`stage ${s.id}`, s.evidence);
    for (const day of new Set(s.pattern)) {
      if (day !== 'rest' && !(s.sessions[day]?.length)) problems.push(`stage ${s.id}: pattern uses ${day} but has no ${day} session`);
    }
    for (const [day, slots] of Object.entries(s.sessions)) {
      for (const slot of slots ?? []) {
        if (!exerciseIds.has(slot.exercise)) problems.push(`stage ${s.id}.${day}: unknown exercise ${slot.exercise}`);
        checkCondition(`stage ${s.id}.${day}`, slot.when);
      }
    }
    for (const g of s.gates) {
      if (!testIds.has(g.test)) problems.push(`stage ${s.id}: gate on unknown test ${g.test}`);
      checkEvidence(`stage ${s.id} gate ${g.test}`, g.evidence);
      checkCondition(`stage ${s.id} gate ${g.test}`, g.when);
    }
  }
  const last = p.stages[p.stages.length - 1];
  if (last && last.gates.length === 0) problems.push(`stage ${last.id}: final stage needs return-to-sport gates`);

  return problems;
}
