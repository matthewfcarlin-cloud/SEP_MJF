import { describe, expect, it } from 'vitest';
import curvesJson from '../data/curves.json';
import type { Curves } from './curves';
import { runHero } from './hero';
import { dayDetail, drivers } from './intraday';
import { displayReadings } from './sim';

const curves = curvesJson as Curves;
const full = curves.fleets[curves.fleets.length - 1];
const run = runHero(full.weights, full.devices);

describe('a day hour by hour', () => {
  it('agrees with the day the model learned from', () => {
    const d = run.days[20];
    const detail = dayDetail(d, 120);
    expect(detail.peak).toBe(displayReadings(d).flexDeg);
    expect(Math.max(...detail.hours.map((h) => h.peak))).toBe(detail.peak);
    expect(detail.hours.filter((h) => h.worn)).toHaveLength(detail.wornHours);
    expect(detail.hours.filter((h) => !h.worn).every((h) => h.load === 0)).toBe(true);
  });

  it('counts time past the line only when the line was crossed', () => {
    const d = run.days[20];
    expect(dayDetail(d, 200).minutesPastLine).toBe(0);
    expect(dayDetail(d, 60).minutesPastLine).toBeGreaterThan(0);
  });
});

describe('behind the call', () => {
  it('has nothing to say in the first days', () => {
    expect(drivers(run.mornings[0], run.days, 1)).toBeNull();
  });

  it('ranks the signals by their pull, strongest first', () => {
    const ds = drivers(run.mornings[21], run.days, 22)!;
    expect(ds).toHaveLength(4);
    for (let i = 1; i < ds.length; i++) expect(Math.abs(ds[i - 1].weight)).toBeGreaterThanOrEqual(Math.abs(ds[i].weight));
    for (const d of ds) expect(d.effect).toBe(d.weight > 0.12 ? 'raises' : d.weight < -0.12 ? 'lowers' : 'neutral');
  });
});
