import { describe, expect, it } from 'vitest';
import curvesJson from '../data/curves.json';
import { callReason } from './advice';
import { parseCheckIn, readLocally } from './checkin';
import { computeCurves, type Curves } from './curves';
import { STORY_FLARE_DAY, runHero } from './hero';
import { addCall, emptyTally, predict, rightRate, runPerson, trainFleet, zeros } from './model';
import { N_FEATURES, simulateFleet, simulatePerson } from './sim';

const curves = curvesJson as Curves;
const full = curves.fleets[curves.fleets.length - 1];

describe('scoring', () => {
  it('scores a model that always warns, or never warns, as a coin flip', () => {
    const days = simulatePerson(1, 'acl:under35', 1).days;
    for (const risk of [0, 1]) {
      const t = emptyTally();
      for (const d of days) addCall(t, risk, d.flare);
      expect(rightRate(t)).toBe(0.5);
    }
  });
});

describe('learning on one phone', () => {
  it('forecasts each day before learning from it', () => {
    const days = simulatePerson(2, 'acl:under35', 2).days;
    const steps = runPerson(days, full.weights);
    expect(steps[0].risk).toBeCloseTo(predict(full.weights, days[0].x));
    steps.slice(1).forEach((s, i) => expect(s.before).toEqual(steps[i].after));
  });

  it('learns nothing from a day without a check-in', () => {
    const days = simulatePerson(3, 'acl:under35', 3).days;
    const steps = runPerson(days, full.weights, true, new Set([1]));
    expect(steps[0].after).toEqual(full.weights);
  });
});

describe('learning across phones', () => {
  it('shares only model weights, and the fleet model beats a blank one', () => {
    const fleet = trainFleet(simulateFleet(60, 99));
    expect(fleet.weights).toHaveLength(N_FEATURES);
    const newcomers = simulateFleet(80, 123);
    const score = (w: number[]) => {
      const t = emptyTally();
      for (const p of newcomers) for (const d of p.days) addCall(t, predict(w, d.x), d.flare);
      return rightRate(t);
    };
    expect(score(zeros())).toBe(0.5);
    expect(score(fleet.weights)).toBeGreaterThan(0.65);
  });
});

describe('the precomputed curves', () => {
  it('match the engine (run `npm run precompute` after changing it)', () => {
    expect(computeCurves()).toEqual(curves);
  }, 30_000);

  it('show the continual-learning story', () => {
    const last = curves.fleets.length - 1;
    const you = curves.weekly.you;
    const both = curves.weekly.both[last];
    expect(you[0]).toBeLessThan(0.6); // alone, week one is near a coin flip
    expect(you[5]).toBeGreaterThan(you[0] + 0.15); // but it keeps learning
    expect(both[0]).toBeGreaterThan(you[0] + 0.15); // the fleet gives a head start
    expect(both[5]).toBeGreaterThan(Math.max(...curves.weekly.fleet[last])); // and yours adds on top
    for (const g of curves.firstWeekByGroup) expect(g.rates[last]).toBeGreaterThan(g.rates[0] + 0.15);
  });
});

describe('Maya', () => {
  it('has no advice on day one without a fleet, and a line with one', () => {
    const blank = runHero(zeros(), 0).mornings[0];
    expect(blank.call).toBe('learning');
    expect(blank.line).toBeNull();
    expect(callReason(blank)).toMatch(/few days/);
    expect(runHero(full.weights, full.devices).mornings[0].line).not.toBeNull();
  });

  it('a flare-up check-in makes tomorrow more careful than a good one', () => {
    const flare = runHero(full.weights, full.devices, { [STORY_FLARE_DAY]: true }).mornings[STORY_FLARE_DAY];
    const good = runHero(full.weights, full.devices, { [STORY_FLARE_DAY]: false }).mornings[STORY_FLARE_DAY];
    expect(flare.call).toBe('rest');
    expect(good.call).not.toBe('rest');
    expect(flare.line!).toBeLessThan(good.line!);
  });
});

describe('check-ins', () => {
  it('reads a sentence on the device when Claude is unavailable', () => {
    expect(readLocally('Knee puffed up after stairs, maybe 6/10').feel).toBe('flare');
    expect(readLocally('a bit stiff after PT').feel).toBe('sore');
    expect(readLocally('Great day, walked the dog').feel).toBe('good');
    expect(readLocally('pain 7 out of 10 after soccer')).toMatchObject({ pain: 7, activity: 'soccer', feel: 'flare' });
  });

  it('rejects malformed answers from the API', () => {
    expect(parseCheckIn({ feel: 'great' }, 'claude')).toBeNull();
    expect(parseCheckIn({ feel: 'sore', pain: 14, activity: '', summary: 'x' }, 'claude')).toMatchObject({ pain: 10, activity: null });
  });
});
