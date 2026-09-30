/**
 * The protocol format. Any injury is described with these types; the engine
 * never contains condition-specific code. Every clinical number points at the
 * fact ids that justify it (`evidence`), and CI rejects fields that don't.
 */
import { z } from 'zod';

export const EvidenceLevel = z.enum(['trial', 'consensus', 'practitioner']);

export const Evidence = z.object({
  facts: z.array(z.string()).min(1),
  level: EvidenceLevel,
});
export type Evidence = z.infer<typeof Evidence>;

/** Predicate over intake answers and the athlete's track. */
export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { q: string; eq: string | number | boolean }
  | { q: string; in: (string | number)[] }
  | { q: string; gte: number }
  | { q: string; lte: number }
  | { track: string[] };

export const Condition: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(Condition) }).strict(),
    z.object({ any: z.array(Condition) }).strict(),
    z.object({ not: Condition }).strict(),
    z.object({ q: z.string(), eq: z.union([z.string(), z.number(), z.boolean()]) }).strict(),
    z.object({ q: z.string(), in: z.array(z.union([z.string(), z.number()])) }).strict(),
    z.object({ q: z.string(), gte: z.number() }).strict(),
    z.object({ q: z.string(), lte: z.number() }).strict(),
    z.object({ track: z.array(z.string()).min(1) }).strict(),
  ]),
);

export const Question = z.object({
  id: z.string(),
  prompt: z.string(),
  help: z.string().optional(),
  kind: z.enum(['single', 'multi', 'scale', 'boolean']),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  scale: z.object({ min: z.number(), max: z.number() }).optional(),
});
export type Question = z.infer<typeof Question>;

export const RedFlag = z.object({
  id: z.string(),
  /** Asked at intake and (if `daily`) in every check-in. Yes = flag raised. */
  question: z.string(),
  daily: z.boolean().default(false),
  action: z.enum(['emergency', 'urgent', 'see_clinician']),
  message: z.string(),
  evidence: Evidence,
});
export type RedFlag = z.infer<typeof RedFlag>;

export const Track = z.object({
  id: z.string(),
  label: z.string(),
  /** First matching track wins; the last track should have no `when`. */
  when: Condition.optional(),
  /** Typical total time to return to sport, in days. */
  timelineDays: z.tuple([z.number(), z.number()]),
  /** Multiplies every stage's minDays (slower-healing injuries need more tissue time). */
  minDaysScale: z.number().min(1).default(1),
  explain: z.string(),
  evidence: Evidence,
});
export type Track = z.infer<typeof Track>;

export const ExerciseCategory = z.enum([
  'isometric', 'strength', 'lengthening', 'running', 'plyometric', 'mobility', 'trunk', 'conditioning',
]);

export const Exercise = z.object({
  id: z.string(),
  name: z.string(),
  category: ExerciseCategory,
  cues: z.array(z.string()).min(1),
  equipment: z.array(z.string()).default([]),
  /** 3D anatomy structure ids this loads (for the Body view). */
  loads: z.array(z.string()).default([]),
  /** Easier variant used when the dose is dialled down. */
  regression: z.string().optional(),
  /** 'painFree' = stop on any pain; 'threshold' = allowed up to the protocol's strength limit. */
  painRule: z.enum(['painFree', 'threshold']),
  evidence: Evidence,
});
export type Exercise = z.infer<typeof Exercise>;

export const Dose = z.object({
  sets: z.number().int().positive(),
  reps: z.number().int().positive().optional(),
  seconds: z.number().positive().optional(),
  metres: z.number().positive().optional(),
  /** e.g. "70% max speed", "RPE 7", "to discomfort". */
  intensity: z.string().optional(),
  restSeconds: z.number().nonnegative().optional(),
  note: z.string().optional(),
});
export type Dose = z.infer<typeof Dose>;

export const Slot = z.object({
  exercise: z.string(),
  dose: Dose,
  when: Condition.optional(),
});
export type Slot = z.infer<typeof Slot>;

export const DayType = z.enum(['strength', 'lengthening', 'running', 'recovery', 'rest']);
export type DayType = z.infer<typeof DayType>;

export const TestMeasure = z.enum(['pain', 'percent', 'boolean', 'count']);

export const Test = z.object({
  id: z.string(),
  name: z.string(),
  instructions: z.array(z.string()).min(1),
  measure: TestMeasure,
  unit: z.string().optional(),
  evidence: Evidence,
});
export type Test = z.infer<typeof Test>;

export const Gate = z.object({
  test: z.string(),
  op: z.enum(['>=', '<=', '==']),
  value: z.union([z.number(), z.boolean()]),
  /** Result this far on the wrong side means move back a stage, not just hold. */
  regressIf: z.object({ op: z.enum(['>=', '<=']), value: z.number() }).optional(),
  when: Condition.optional(),
  evidence: Evidence,
});
export type Gate = z.infer<typeof Gate>;

export const Stage = z.object({
  id: z.string(),
  name: z.string(),
  goal: z.string(),
  /** Repeating day pattern; index = days since stage start. */
  pattern: z.array(DayType).min(1),
  sessions: z.partialRecord(DayType, z.array(Slot)),
  gates: z.array(Gate),
  /** Minimum days in stage before a test day can advance it. */
  minDays: z.number().int().nonnegative(),
  evidence: Evidence,
});
export type Stage = z.infer<typeof Stage>;

export const Rules = z.object({
  pain: z.object({
    /** Max pain (0–10) allowed during 'threshold' exercises. */
    strengthMax: z.number(),
    /** Max pain allowed during 'painFree' exercises (normally 0). */
    painFreeMax: z.number(),
    /** Next-morning pain rise over baseline that counts as a flare. */
    flareDelta: z.number(),
    /** Pain at rest at or above this stops the plan for the day. */
    stopAtRest: z.number(),
    evidence: Evidence,
  }),
  /** Test day offered every N days in stage (after minDays). */
  testEveryDays: z.number().int().positive(),
  /** Consecutive flare days that trigger a stage regression. */
  flaresToRegress: z.number().int().positive(),
  /** Test whose pain-free (0) result lifts a running hold. */
  runClearTest: z.string().optional(),
});
export type Rules = z.infer<typeof Rules>;

export const Protocol = z.object({
  id: z.string(),
  condition: z.string(),
  name: z.string(),
  version: z.string(),
  review: z.object({
    status: z.enum(['draft', 'reviewed', 'live']),
    reviewer: z.string().optional(),
    date: z.string().optional(),
  }),
  region: z.string(),
  structures: z.array(z.string()),
  intake: z.array(Question),
  redFlags: z.array(RedFlag),
  tracks: z.array(Track).min(1),
  exercises: z.array(Exercise),
  tests: z.array(Test),
  stages: z.array(Stage).min(1),
  rules: Rules,
});
export type Protocol = z.infer<typeof Protocol>;

export const Fact = z.object({
  id: z.string(),
  tier: z.enum(['T1', 'T2', 'T3', 'T4', 'T5']),
  strength: z.string(),
  claim: z.string(),
  source: z.string(),
  url: z.string().url(),
  status: z.enum(['live', 'quarantined', 'needs_verify']).default('live'),
}).passthrough();
export type Fact = z.infer<typeof Fact>;
