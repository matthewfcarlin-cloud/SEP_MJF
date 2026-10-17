/**
 * Maya: the newcomer the demo follows. Everything the app says about her is computed from
 * her model on that morning, never written by hand.
 */
import { addCall, emptyTally, predict, rightRate, runPerson, type DayStep, type Weights } from './model';
import {
  DAYS,
  SENSORS,
  bendZFromDeg,
  displayReadings,
  features,
  sensorIndex,
  simulatePerson,
  type Day,
  type Group,
  type Sensor,
} from './sim';

export const HERO = {
  name: 'Maya',
  age: 23,
  group: 'acl:under35' as Group,
  sport: 'soccer',
  /** For Maya, a tired quad matters even more than for most young ACL patients, and bend less. */
  quirks: { fatigue: 0.7, bend: -0.4, deepBends: -0.3, base: -1.2 },
  seed: 4242,
};

/** The flare-up the story is built around. */
export const STORY_FLARE_DAY = 22;

export function heroDays(overrides: Record<number, boolean> = {}): Day[] {
  const p = simulatePerson(0, HERO.group, HERO.seed, {
    quirks: HERO.quirks,
    force: { [STORY_FLARE_DAY]: { z: { fatigue: 1.0, bend: 0.4 }, flare: true } },
  });
  return p.days.map((d) => (d.day in overrides ? { ...d, flare: overrides[d.day] } : d));
}

/** Highest line Kinn will suggest (beyond this it just says "no limit"). */
export const LINE_MAX = 135;

/** Risk at or under which a day counts as safe enough to aim for. */
export const LINE_RISK = 0.3;

export type Call = 'push' | 'ease' | 'rest' | 'learning';

export type Morning = {
  day: number;
  weights: Weights;
  /** days of her own data the model has learned from */
  ownDays: number;
  /** chance a typical recent day flares, per the model */
  risk: number;
  call: Call;
  /** highest knee bend in degrees that stays under LINE_RISK on a typical day; null = no line yet */
  line: number | null;
  /** muscle fatigue (%) past which a typical day crosses LINE_RISK; null = none in range */
  fatigueCap: number | null;
  flaredYesterday: boolean;
  /** her weight on each sensor divided by the fleet's: >1 matters more for her */
  vsFleet: Record<Sensor, number>;
  /** this model's weight on each sensor for her group */
  sensorWeights: Record<Sensor, number>;
  /** how often the morning call was right so far (balanced, 0.5 = coin flip); null before day 8 */
  record: number | null;
};

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** The typical day lately: her last 7 days of readings, averaged. Day 1 uses an average day. */
function typicalZ(days: Day[], day: number): Record<Sensor, number> {
  const recent = days.filter((d) => d.day < day && d.day >= day - 7);
  return Object.fromEntries(SENSORS.map((s) => [s, mean(recent.map((d) => d.z[s]))])) as Record<Sensor, number>;
}

const isBlank = (w: Weights) => w.every((v) => v === 0);

export function morningOf(day: number, days: Day[], steps: DayStep[], fleet: Weights): Morning {
  const weights = day === 1 ? fleet.slice() : steps[day - 2].after;
  const z = typicalZ(days, day);
  const riskAt = (zz: Record<Sensor, number>) => predict(weights, features(HERO.group, day, zz));
  const risk = riskAt(z);
  const flaredYesterday = day > 1 && days[day - 2].flare;
  const blank = isBlank(fleet) && day <= 3;

  // The line and the fatigue cap are measured on an average day, so they move only when
  // the model learns something, not because yesterday was busy.
  const avg = { bend: 0, deepBends: 0, fatigue: 0, warmth: 0 };
  let line: number | null = null;
  for (let deg = 80; deg <= LINE_MAX; deg++) if (riskAt({ ...avg, bend: bendZFromDeg(deg, day) }) <= LINE_RISK) line = deg;
  let fatigueCap: number | null = null;
  for (let pct = 4; pct <= 60; pct++) if (riskAt({ ...avg, fatigue: (pct - 18) / 8 }) <= LINE_RISK) fatigueCap = pct;

  const call: Call = blank ? 'learning' : flaredYesterday ? 'rest' : risk < 0.22 ? 'push' : risk < 0.4 ? 'ease' : 'rest';

  const sensorWeights = Object.fromEntries(SENSORS.map((s) => [s, weights[sensorIndex(HERO.group, s)]])) as Record<Sensor, number>;
  const vsFleet = Object.fromEntries(
    SENSORS.map((s) => {
      const f = fleet[sensorIndex(HERO.group, s)];
      return [s, Math.abs(f) < 0.05 ? 1 : sensorWeights[s] / f];
    }),
  ) as Record<Sensor, number>;

  let record: number | null = null;
  if (day > 7) {
    const t = emptyTally();
    for (const s of steps.slice(0, day - 1)) addCall(t, s.risk, s.flare);
    record = rightRate(t);
  }

  return {
    day,
    weights,
    ownDays: day - 1,
    risk,
    call,
    line: blank ? null : line,
    fatigueCap: blank ? null : fatigueCap,
    flaredYesterday,
    vsFleet,
    sensorWeights,
    record,
  };
}

export type LearnedEvent = { day: number; kind: 'start' | 'flare' | 'line' | 'insight' | 'week'; title: string; detail: string };

export type HeroRun = {
  days: Day[];
  steps: DayStep[];
  mornings: Morning[];
  events: LearnedEvent[];
};

const SENSOR_PLAIN: Record<Sensor, string> = {
  bend: 'how far you bend',
  deepBends: 'how many deep bends you do',
  fatigue: 'muscle fatigue',
  warmth: 'warmth at the knee',
};

/** `unlearned`: days whose check-in hasn't happened, so the model hasn't learned from them. */
export function runHero(fleet: Weights, fleetDevices: number, overrides: Record<number, boolean> = {}, unlearned: number[] = []): HeroRun {
  const days = heroDays(overrides);
  const steps = runPerson(days, fleet, true, new Set(unlearned));
  const mornings = Array.from({ length: DAYS }, (_, i) => morningOf(i + 1, days, steps, fleet));
  const events: LearnedEvent[] = [];

  const first = mornings[0];
  events.push(
    fleetDevices > 0
      ? {
          day: 1,
          kind: 'start',
          title: `Started from ${fleetDevices.toLocaleString('en-US')} recoveries`,
          detail: first.line
            ? `Before Maya's first step, the fleet model set her line at ${first.line}°.`
            : 'The fleet model gave Maya a starting point before her first step.',
        }
      : { day: 1, kind: 'start', title: 'Started from scratch', detail: 'No other wearers to learn from, so the first days are guesses.' },
  );

  let lastLine = first.line;
  let topSensor: Sensor | null = null;
  let lastFlare = 0;
  for (let d = 2; d <= DAYS; d++) {
    const m = mornings[d - 1];
    const yesterday = days[d - 2];
    if (yesterday.flare) {
      lastFlare = d - 1;
      const r = displayReadings(yesterday);
      const cause = mainDriver(steps[d - 2].before, yesterday);
      const lineNote = m.line !== null && lastLine !== null && m.line < lastLine ? ` Line ${lastLine}° → ${m.line}°.` : '';
      events.push({
        day: d - 1,
        kind: 'flare',
        title: 'Flare-up logged',
        detail: `Bent to ${r.flexDeg}°, muscle fatigue ${r.fatiguePct}%. Kinn traced it mostly to ${SENSOR_PLAIN[cause]}.${lineNote}`,
      });
      if (m.line !== null && lastLine !== null && m.line < lastLine) lastLine = m.line;
    } else if (m.line !== null && lastLine === null) {
      events.push({ day: d, kind: 'line', title: `First line: ${m.line}°`, detail: 'Enough of her own days to suggest a limit.' });
      lastLine = m.line;
    } else if (m.line !== null && lastLine !== null && Math.abs(m.line - lastLine) >= 5) {
      const calm = d - 1 - lastFlare;
      events.push({
        day: d,
        kind: 'line',
        title: `Line ${m.line > lastLine ? 'up' : 'down'}: ${lastLine}° → ${m.line}°`,
        detail:
          m.line > lastLine
            ? `${calm} calm day${calm === 1 ? '' : 's'} in a row taught Kinn she can do a bit more.`
            : 'Her recent days ran hotter than her model expected.',
      });
      lastLine = m.line;
    }
    if (d >= 8 && fleetDevices + d > 10) {
      const top = SENSORS.reduce((a, b) => (m.sensorWeights[b] > m.sensorWeights[a] ? b : a));
      if (top !== topSensor && m.sensorWeights[top] > 0.5) {
        const ratio = m.vsFleet[top];
        events.push({
          day: d,
          kind: 'insight',
          title: `Her strongest warning sign: ${SENSOR_PLAIN[top]}`,
          detail:
            fleetDevices > 0 && ratio >= 1.05
              ? `It predicts her flare-ups ${ratio.toFixed(1)}× as strongly as for most people like her.`
              : 'Of everything the strip measures, it predicts her flare-ups best so far.',
        });
        topSensor = top;
      }
    }
    if ((d - 1) % 7 === 0 && m.record !== null) {
      events.push({
        day: d - 1,
        kind: 'week',
        title: `Week ${(d - 1) / 7}: calls right ${Math.round(m.record * 100)}% of the time`,
        detail: 'Each morning’s call, checked against that evening’s check-in.',
      });
    }
  }
  events.sort((a, b) => a.day - b.day);
  return { days, steps, mornings, events };
}

/** The sensor that pushed that day's risk up the most, by the model of that morning. */
function mainDriver(w: Weights, d: Day): Sensor {
  return SENSORS.reduce((a, b) => (w[sensorIndex(HERO.group, b)] * d.z[b] > w[sensorIndex(HERO.group, a)] * d.z[a] ? b : a));
}
