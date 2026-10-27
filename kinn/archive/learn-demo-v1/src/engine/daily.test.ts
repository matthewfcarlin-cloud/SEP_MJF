import { describe, expect, it } from 'vitest';
import curvesJson from '../data/curves.json';
import type { Curves } from './curves';
import { connectHeadline, deviceStatus, lastWeek, overnightNote, yesterdayReading } from './daily';
import { runHero } from './hero';
import { REPS, frameAt, planSession, sessionDuration, sessionStats } from './session';

const curves = curvesJson as Curves;
const full = curves.fleets[curves.fleets.length - 1];
const run = runHero(full.weights, full.devices);

describe('the morning', () => {
  it('says what changed overnight, from the two mornings', () => {
    expect(overnightNote(run.mornings[0], null)).toMatch(/first day/);
    const flareNext = run.mornings.findIndex((m) => m.flaredYesterday);
    expect(overnightNote(run.mornings[flareNext], run.mornings[flareNext - 1])).toMatch(/flared/);
    const up = run.mornings.findIndex((m, i) => i > 0 && !m.flaredYesterday && m.line! > run.mornings[i - 1].line!);
    expect(overnightNote(run.mornings[up], run.mornings[up - 1])).toMatch(/moved up \d+°/);
  });

  it('gives a rest day its own headline', () => {
    const rest = run.mornings.find((m) => m.call === 'rest')!;
    expect(connectHeadline(rest)).toMatch(/Rest today/);
    expect(connectHeadline(run.mornings[0])).toBe('Ready for another day.');
  });

  it('compares yesterday with her own normal, and has nothing on day 1', () => {
    expect(yesterdayReading(run.days, 1, 'fatiguePct')).toBeNull();
    const r = yesterdayReading(run.days, 22, 'fatiguePct')!;
    expect(r.value).toMatch(/%$/);
    expect(r.note).toMatch(/your normal/);
    expect(r.spark).toHaveLength(7);
  });
});

describe('the week', () => {
  it('waits for the first week to finish', () => {
    expect(lastWeek(run, 7)).toBeNull();
    const w = lastWeek(run, 8)!;
    expect(w.week).toBe(1);
    expect(w.lines).toHaveLength(8);
    expect(w.lineEnd).toBe(run.mornings[7].line);
    expect(w.right).toBeGreaterThan(0.5);
  });
});

describe('the session', () => {
  const plan = planSession(21, 128);

  it('targets a little under the line, ten reps', () => {
    expect(plan.target).toBe(120);
    expect(plan.reps).toHaveLength(REPS);
  });

  it('plays reps from straight to the peak and back', () => {
    expect(frameAt(plan, 0)).toMatchObject({ bend: 0, done: 0, phase: 'rise' });
    expect(frameAt(plan, 900 + 10).bend).toBe(plan.reps[0].peak);
    expect(frameAt(plan, sessionDuration(plan))).toMatchObject({ done: REPS, phase: 'done' });
  });

  it('counts full range, holds, and when the quad tired', () => {
    const s = sessionStats(plan, REPS);
    expect(s.reps).toBe(REPS);
    expect(s.fullRange).toBeGreaterThan(4);
    expect(s.fullRange).toBeLessThan(REPS);
    expect(s.firstTired).not.toBeNull();
    expect(s.avgHoldS).toBeGreaterThan(1);
  });
});

describe('the coin and strip', () => {
  it('needs a new strip every five days', () => {
    expect(deviceStatus(1).stripDaysLeft).toBe(4);
    expect(deviceStatus(5).stripDaysLeft).toBe(0);
    expect(deviceStatus(6).stripDay).toBe(1);
  });
});
