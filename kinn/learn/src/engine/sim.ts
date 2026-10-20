/**
 * Simulated wearers. Each person's flare-ups follow hidden rules: the rules of their group
 * (injury and age) plus their own quirks. No model ever sees these rules. Models only see
 * sensor readings and check-ins, which is the point of the demo.
 */
import { rng, type Rng } from './rng';

export type Injury = 'acl' | 'meniscus' | 'tkr';
export type Age = 'under35' | 'over35';
export type Group = `${Injury}:${Age}`;

export const INJURY_LABEL: Record<Injury, string> = {
  acl: 'ACL reconstruction',
  meniscus: 'Meniscus repair',
  tkr: 'Knee replacement',
};

export const AGE_LABEL: Record<Age, string> = { under35: 'under 35', over35: '35 and over' };

/** The four signals the strip and coin record. */
export const SENSORS = ['bend', 'deepBends', 'fatigue', 'warmth'] as const;
export type Sensor = (typeof SENSORS)[number];

export const SENSOR_LABEL: Record<Sensor, string> = {
  bend: 'How far you bend',
  deepBends: 'How many deep bends',
  fatigue: 'Muscle fatigue',
  warmth: 'Warmth at the knee',
};

export const SENSOR_SOURCE: Record<Sensor, string> = {
  bend: 'Stretch traces',
  deepBends: 'Stretch + motion',
  fatigue: 'Muscle sensor',
  warmth: 'Skin temperature',
};

type Rule = Record<Sensor, number> & { base: number };

/**
 * How each group's flare-ups really work (hidden). They differ on purpose: after an ACL
 * repair a tired quad is the big warning sign for young athletes, and after a knee
 * replacement more deep bends tend to help, not hurt.
 */
const GROUP_RULES: Record<Group, Rule> = {
  'acl:under35': { base: -2.4, bend: 0.4, deepBends: 0.3, fatigue: 1.6, warmth: 0.8 },
  'acl:over35': { base: -2.4, bend: 1.0, deepBends: 0.8, fatigue: 0.5, warmth: 0.9 },
  'meniscus:under35': { base: -2.4, bend: 0.2, deepBends: 1.6, fatigue: 0.4, warmth: 0.8 },
  'meniscus:over35': { base: -2.3, bend: 0.6, deepBends: 1.0, fatigue: 0.2, warmth: 1.2 },
  'tkr:under35': { base: -2.2, bend: 1.4, deepBends: -0.6, fatigue: 0.3, warmth: 0.9 },
  'tkr:over35': { base: -2.2, bend: 1.5, deepBends: -0.4, fatigue: 0.2, warmth: 1.1 },
};

export const GROUPS = Object.keys(GROUP_RULES) as Group[];

/** Share of wearers in each group (rare groups need a big fleet before they're learned). */
const GROUP_MIX: [Group, number][] = [
  ['acl:under35', 0.35],
  ['acl:over35', 0.15],
  ['meniscus:under35', 0.12],
  ['meniscus:over35', 0.13],
  ['tkr:under35', 0.03],
  ['tkr:over35', 0.22],
];

export const groupLabel = (g: Group) => {
  const [injury, age] = g.split(':') as [Injury, Age];
  return `${INJURY_LABEL[injury]}, ${AGE_LABEL[age]}`;
};

/** How strongly movement drives flare-ups, relative to day-to-day luck. */
const SIGNAL = 1.8;

/** Recovery gets easier with time: same weight for every group. */
const WEEK_WEIGHT = -0.5;

/** How much one person's rules differ from their group's. */
const QUIRK_SD = 0.75;

/**
 * Feature vector: [bias, week, then per group: membership + the four sensors].
 * Each group has its own sensor weights, so the fleet needs to have seen enough people
 * like you before it knows what matters for you.
 */
const PER_GROUP = 1 + SENSORS.length;
export const N_FEATURES = 2 + GROUPS.length * PER_GROUP;
export const sensorIndex = (g: Group, s: Sensor) => 2 + GROUPS.indexOf(g) * PER_GROUP + 1 + SENSORS.indexOf(s);

export const weekFeature = (day: number) => (day / 7 - 3) / 2;

export function features(g: Group, day: number, z: Record<Sensor, number>): number[] {
  const x = new Array(N_FEATURES).fill(0);
  x[0] = 1;
  x[1] = weekFeature(day);
  x[2 + GROUPS.indexOf(g) * PER_GROUP] = 1;
  for (const s of SENSORS) x[sensorIndex(g, s)] = z[s];
  return x;
}

export type Day = {
  /** 1-based day since the person started wearing Kinn */
  day: number;
  /** sensor readings as z-scores (the app's units are derived from these) */
  z: Record<Sensor, number>;
  x: number[];
  flare: boolean;
};

export type Person = { id: number; group: Group; days: Day[] };

export const DAYS = 42;

const sigmoid = (v: number) => 1 / (1 + Math.exp(-v));

function personalRule(g: Group, r: Rng, quirks?: Partial<Rule>): Rule {
  const c = GROUP_RULES[g];
  const q = (k: keyof Rule, sd: number) => c[k] + (quirks?.[k] ?? r.normal(0, sd));
  return {
    base: q('base', 0.35),
    bend: q('bend', QUIRK_SD),
    deepBends: q('deepBends', QUIRK_SD),
    fatigue: q('fatigue', QUIRK_SD),
    warmth: q('warmth', 0.35),
  };
}

export type Forced = Record<number, { z?: Partial<Record<Sensor, number>>; flare?: boolean }>;

/** One person's 42 days. `force` pins specific days' readings or outcomes for the story. */
export function simulatePerson(id: number, g: Group, seed: number, opts: { quirks?: Partial<Rule>; force?: Forced } = {}): Person {
  const r = rng(seed);
  const rule = personalRule(g, r, opts.quirks);
  const activity = r.normal(0, 0.6);
  const days: Day[] = [];
  let prevLoad = 0;
  for (let day = 1; day <= DAYS; day++) {
    const bend = r.normal(activity * 0.5, 1);
    const deepBends = 0.5 * bend + r.normal(activity * 0.3, 0.85);
    const fatigue = 0.4 * deepBends + r.normal(0, 0.9);
    const warmth = 0.3 * prevLoad + r.normal(0, 0.9);
    const forced = opts.force?.[day];
    const z = { bend, deepBends, fatigue, warmth, ...forced?.z };
    let logit = rule.base + WEEK_WEIGHT * weekFeature(day);
    for (const s of SENSORS) logit += SIGNAL * rule[s] * z[s];
    const roll = r.next();
    const flare = forced?.flare ?? roll < sigmoid(logit);
    days.push({ day, z, x: features(g, day, z), flare });
    prevLoad = (z.bend + z.deepBends) / 2;
  }
  return { id, group: g, days };
}

function pickGroup(u: number): Group {
  let acc = 0;
  for (const [g, share] of GROUP_MIX) {
    acc += share;
    if (u < acc) return g;
  }
  return GROUP_MIX[GROUP_MIX.length - 1][0];
}

/** The fleet: people who wore Kinn before the newcomer. */
export function simulateFleet(count: number, seed = 7): Person[] {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => simulatePerson(i, pickGroup(r.next()), seed * 100_003 + i));
}

/** Newcomers held out to measure how each way of learning does on someone it has never seen. */
export function simulateNewcomers(count: number, seed = 911): Person[] {
  return simulateFleet(count, seed).map((p) => ({ ...p, id: 1_000_000 + p.id }));
}

/** Readings in the units the app shows. Only the display changes; models work on z-scores. */
export function displayReadings(d: Pick<Day, 'day' | 'z'>) {
  const { bend, deepBends, fatigue, warmth } = d.z;
  return {
    flexDeg: Math.round(bendDegAt(d.day, bend)),
    deepBends: Math.max(0, Math.round(28 + 0.5 * Math.min(d.day, 35) + 10 * deepBends)),
    fatiguePct: Math.min(60, Math.max(2, Math.round(18 + 8 * fatigue))),
    warmthC: Math.round(Math.max(0, 0.3 + 0.3 * warmth) * 10) / 10,
  };
}

/** Typical peak bend rises as the knee loosens over the weeks. */
export const bendDegAt = (day: number, z: number) => 88 + 0.8 * Math.min(day, 35) + 6 * z;
export const bendZFromDeg = (deg: number, day: number) => (deg - 88 - 0.8 * Math.min(day, 35)) / 6;
