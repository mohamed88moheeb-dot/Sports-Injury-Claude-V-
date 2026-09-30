'use client';
/**
 * Where an athlete's course lives. v2.0 keeps it on the device; the Supabase
 * adapter (same interface, tables in supabase/migrations) replaces it once
 * accounts land.
 */
import type { CourseState, TodayPlan } from '@/engine/engine';
import type { Dose } from '@/engine/schema';

export interface StoredPlan {
  kind: TodayPlan['kind'];
  dayType: TodayPlan['dayType'];
  testDue: boolean;
  stageId: string;
  slots: { exerciseId: string; dose: Dose; adjusted?: string }[];
  reasons: TodayPlan['reasons'];
  referral?: TodayPlan['referral'];
  done?: boolean;
}

export interface StoredCourse {
  state: CourseState;
  side?: 'L' | 'R';
  /** Latest plan per day, so reopening the app shows today's decision. */
  plans: Record<string, StoredPlan>;
  checkIns: Record<string, { painRest: number; painMorning: number; redFlags: string[] }>;
}

const KEY = 'royo.v2.course';

export function loadCourse(): StoredCourse | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredCourse) : null;
  } catch {
    return null;
  }
}

export function saveCourse(c: StoredCourse): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable (private mode) — the session still works in memory */
  }
}

export function clearCourse(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const today = () => new Date().toISOString().slice(0, 10);
