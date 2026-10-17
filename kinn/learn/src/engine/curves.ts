/**
 * The numbers behind the charts: how often each way of learning gets the morning call right
 * for people it has never seen. Precomputed by `npm run precompute` into src/data/curves.json
 * (it takes a couple of seconds); `curves.test.ts` checks the file is current.
 */
import { trainFleet, weeklyRightRate, type Weights } from './model';
import { GROUPS, simulateFleet, simulateNewcomers, simulatePerson, type Group } from './sim';

export const FLEET_SIZES = [0, 10, 30, 100, 300, 1000, 3000];

/** The common group (Maya's) and the rarest one, to show the fleet helping both. */
export const COMPARE_GROUPS: Group[] = ['acl:under35', 'tkr:under35'];

export type Curves = {
  fleetSizes: number[];
  fleets: { devices: number; rounds: number; weights: Weights }[];
  newcomers: number;
  weekly: { you: number[]; fleet: number[][]; both: number[][] };
  firstWeekByGroup: { group: Group; newcomers: number; rates: number[] }[];
};

const round = (v: number, places = 4) => Math.round(v * 10 ** places) / 10 ** places;

export function computeCurves(opts = { fleet: 3000, newcomers: 400, perGroup: 150 }): Curves {
  const population = simulateFleet(opts.fleet);
  const newcomers = simulateNewcomers(opts.newcomers);
  const sizes = FLEET_SIZES.filter((n) => n <= opts.fleet);
  const fleets = sizes.map((n) => trainFleet(population.slice(0, n)));
  const groupNewcomers = COMPARE_GROUPS.map((g) =>
    Array.from({ length: opts.perGroup }, (_, i) => simulatePerson(i, g, 5_000_000 + GROUPS.indexOf(g) * 1000 + i)),
  );
  return {
    fleetSizes: sizes,
    fleets: fleets.map((f) => ({ devices: f.devices, rounds: f.rounds, weights: f.weights.map((w) => round(w, 6)) })),
    newcomers: opts.newcomers,
    weekly: {
      you: weeklyRightRate(newcomers, [], 'you').map((v) => round(v)),
      fleet: fleets.map((f) => weeklyRightRate(newcomers, f.weights, 'fleet').map((v) => round(v))),
      both: fleets.map((f) => weeklyRightRate(newcomers, f.weights, 'both').map((v) => round(v))),
    },
    firstWeekByGroup: COMPARE_GROUPS.map((g, gi) => ({
      group: g,
      newcomers: opts.perGroup,
      rates: fleets.map((f) => round(weeklyRightRate(groupNewcomers[gi], f.weights, 'both')[0])),
    })),
  };
}
