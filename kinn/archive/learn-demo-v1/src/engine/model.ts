/**
 * The learning: a small logistic model that estimates the chance today's movement leads to a
 * flare-up. Two loops keep it learning:
 *  - on the device, every check-in nudges that person's model (online learning, pulled back
 *    toward the fleet model so a few odd days can't run away with it);
 *  - across devices, federated averaging: each device improves a copy of the fleet model on
 *    its own days and sends back only the new weights, never the readings.
 */
import type { Day, Person } from './sim';
import { N_FEATURES } from './sim';
import { rng } from './rng';

export type Weights = number[];

export const zeros = (): Weights => new Array(N_FEATURES).fill(0);

export const predict = (w: Weights, x: number[]) => {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += w[i] * x[i];
  return 1 / (1 + Math.exp(-s));
};

/** Above this chance, Kinn's call is "this would likely flare". */
export const ALERT_AT = 0.3;

/** One gradient step on one day, pulled toward `anchor` (L2). Mutates `w`. */
function step(w: Weights, d: Day, lr: number, l2: number, anchor: Weights) {
  const err = (d.flare ? 1 : 0) - predict(w, d.x);
  for (let i = 0; i < w.length; i++) w[i] += lr * (err * d.x[i] - l2 * (w[i] - anchor[i]));
}

// ---------------------------------------------------------------- fleet (federated averaging)

export type FleetModel = { devices: number; weights: Weights; rounds: number };

export const FED = { perRound: 120, localEpochs: 2, lr: 0.05, l2: 0.01 };

/** One round per night. A bigger fleet has also been learning for more nights. */
export const roundsFor = (devices: number) => Math.min(150, 20 + Math.round(devices / 20));

export function trainFleet(fleet: Person[], seed = 3): FleetModel {
  let g = zeros();
  if (fleet.length === 0) return { devices: 0, weights: g, rounds: 0 };
  const r = rng(seed);
  const rounds = roundsFor(fleet.length);
  for (let round = 0; round < rounds; round++) {
    const picked = fleet.length <= FED.perRound ? fleet : sample(fleet, FED.perRound, r.next);
    const sum = zeros();
    let total = 0;
    for (const person of picked) {
      // Runs on the device: start from tonight's fleet model, learn from this person's own days.
      const local = g.slice();
      for (let e = 0; e < FED.localEpochs; e++) for (const d of person.days) step(local, d, FED.lr, FED.l2, g);
      // Only `local` (8 numbers) leaves the device.
      for (let i = 0; i < sum.length; i++) sum[i] += local[i] * person.days.length;
      total += person.days.length;
    }
    g = sum.map((v) => v / total);
  }
  return { devices: fleet.length, weights: g, rounds };
}

function sample<T>(arr: T[], n: number, next: () => number): T[] {
  const idx = new Set<number>();
  while (idx.size < n) idx.add(Math.floor(next() * arr.length));
  return [...idx].map((i) => arr[i]);
}

// ---------------------------------------------------------------- one person, day by day

export const PERSONAL = { lr: 0.12, l2: 0.02 };

export type DayStep = {
  day: number;
  /** model before this day's check-in: what Kinn believed that morning */
  before: Weights;
  /** chance of a flare Kinn gave that day's movement, before knowing how it went */
  risk: number;
  flare: boolean;
  after: Weights;
};

/**
 * Replays one person's days in order. Each day is predicted first and learned from second,
 * so `risk` is always an honest forecast. `adapt: false` keeps the starting model frozen;
 * days in `skip` (no check-in yet) teach it nothing.
 */
export function runPerson(days: Day[], start: Weights, adapt = true, skip: ReadonlySet<number> = new Set()): DayStep[] {
  const w = start.slice();
  return days.map((d) => {
    const before = w.slice();
    const risk = predict(w, d.x);
    if (adapt && !skip.has(d.day)) step(w, d, PERSONAL.lr, PERSONAL.l2, start);
    return { day: d.day, before, risk, flare: d.flare, after: w.slice() };
  });
}

// ---------------------------------------------------------------- how often the call was right

export type Tally = { tp: number; fn: number; tn: number; fp: number };

export const emptyTally = (): Tally => ({ tp: 0, fn: 0, tn: 0, fp: 0 });

export function addCall(t: Tally, risk: number, flare: boolean) {
  const warned = risk >= ALERT_AT;
  if (flare) warned ? t.tp++ : t.fn++;
  else warned ? t.fp++ : t.tn++;
}

/**
 * Balanced accuracy: the average of "flare-ups it saw coming" and "calm days it called calm".
 * A model that always warns, or never warns, scores 50%, so a coin flip is the floor.
 */
export function rightRate(t: Tally): number {
  const flares = t.tp + t.fn;
  const calm = t.tn + t.fp;
  if (!flares || !calm) return 0.5;
  return (t.tp / flares + t.tn / calm) / 2;
}

export type Scheme = 'you' | 'fleet' | 'both';

export const SCHEME_LABEL: Record<Scheme, string> = {
  you: 'Only your data',
  fleet: 'Only everyone else’s',
  both: 'Everyone’s + yours',
};

/** Right-rate per week of wear for newcomers, under one way of learning. */
export function weeklyRightRate(newcomers: Person[], fleetWeights: Weights, scheme: Scheme, weeks = 6): number[] {
  const tallies = Array.from({ length: weeks }, emptyTally);
  for (const p of newcomers) {
    const start = scheme === 'you' ? zeros() : fleetWeights;
    const steps = runPerson(p.days, start, scheme !== 'fleet');
    for (const s of steps) addCall(tallies[Math.min(weeks - 1, Math.floor((s.day - 1) / 7))], s.risk, s.flare);
  }
  return tallies.map(rightRate);
}
