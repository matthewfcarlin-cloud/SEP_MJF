/**
 * The small daily readouts around the model: what changed overnight, yesterday's readings
 * against her normal, the week recap, and the coin and strip.
 */
import type { HeroRun, Morning } from './hero';
import { addCall, emptyTally, rightRate } from './model';
import { displayReadings, type Day } from './sim';

/** One sentence for the connect moment: what changed overnight, from the two mornings. */
export function overnightNote(today: Morning, yesterday: Morning | null): string {
  if (!yesterday) return 'Your first day. Kinn will learn from tonight’s check-in.';
  if (today.flaredYesterday) return 'Yesterday flared, so today is lighter.';
  if (today.line === null || yesterday.line === null) return 'Yesterday was calm. Kinn is still learning your line.';
  const d = today.line - yesterday.line;
  if (d > 0) return `Yesterday was calm, so your line moved up ${d}°.`;
  if (d < 0) return `Your line is ${-d}° lower today. Recent days ran hot.`;
  return `Yesterday was calm. Your line holds at ${today.line}°.`;
}

/** The connect moment's headline. A rest day gets its own. */
export const connectHeadline = (m: Morning) => (m.call === 'rest' ? 'Rest today. It’s part of the work.' : 'Ready for another day.');

export type Reading = { value: string; note: string; spark: number[] };

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * Yesterday's reading next to the person's own recent normal (the 7 days before it).
 * Null on day 1, when there is no yesterday.
 */
export function yesterdayReading(days: Day[], day: number, key: 'fatiguePct' | 'deepBends'): Reading | null {
  if (day < 2) return null;
  const upTo = days.slice(0, day - 1).map((d) => displayReadings(d)[key]);
  const last = upTo[upTo.length - 1];
  const before = upTo.slice(-8, -1);
  const spark = upTo.slice(-7);
  if (!before.length) return { value: key === 'fatiguePct' ? `${last}%` : String(last), note: 'Your first reading', spark };
  const diff = Math.round(last - mean(before));
  const unit = key === 'fatiguePct' ? ' points' : '';
  const note = diff === 0 ? 'Same as your normal' : `${Math.abs(diff)}${unit} ${diff > 0 ? 'over' : 'under'} your normal`;
  return { value: key === 'fatiguePct' ? `${last}%` : String(last), note, spark };
}

export type WeekSummary = {
  week: number;
  lineStart: number | null;
  lineEnd: number | null;
  /** her line each morning of the week, plus the morning after */
  lines: (number | null)[];
  /** how often the morning call has been right, every day so far (balanced); null before day 8 */
  right: number | null;
  flares: number;
  checkIns: number;
};

/** The last finished week as of this morning; null during the first week. */
export function lastWeek(run: HeroRun, day: number): WeekSummary | null {
  const week = Math.floor((day - 1) / 7);
  if (week < 1) return null;
  const first = (week - 1) * 7 + 1;
  const days = Array.from({ length: 7 }, (_, i) => first + i);
  const lines = [...days, first + 7].map((d) => run.mornings[d - 1]?.line ?? null);
  const t = emptyTally();
  let flares = 0;
  for (const d of days) {
    const s = run.steps[d - 1];
    addCall(t, s.risk, s.flare);
    if (s.flare) flares++;
  }
  // A week of only calm days can't score calls on its own, so the recap shows the record to date.
  const toDate = emptyTally();
  for (const s of run.steps.slice(0, first + 6)) addCall(toDate, s.risk, s.flare);
  return { week, lineStart: lines[0], lineEnd: lines[7], lines, right: rightRate(toDate), flares, checkIns: 7 };
}

export const STRIP_DAYS = 5;

/** The coin and the strip: the coin is charged once a week; a strip lasts five days. */
export function deviceStatus(day: number) {
  const stripDay = ((day - 1) % STRIP_DAYS) + 1;
  return { battery: 100 - ((day - 1) % 7) * 9, stripDay, stripDaysLeft: STRIP_DAYS - stripDay };
}
