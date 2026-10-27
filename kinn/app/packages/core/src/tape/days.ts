/**
 * Rolls synced minute records up into one row per RECO day (04:00 boundary, see time/day.ts).
 * These are tape facts only: wear time, reps and activation. They do not feed the load score
 * or Recovery %, because the v1 tape measures stretch activation, not knee angle.
 */
import { dayKey } from '../time/day';
import type { StoredRecord } from './types';

export interface TapeDay {
  /** RECO day key (YYYY-MM-DD). */
  readonly date: string;
  /** Minutes the tape logged with a good sensor reading. */
  readonly wornMinutes: number;
  /** Minutes logged with the sensor open or shorted (tape off the skin, or a fault). */
  readonly faultMinutes: number;
  /** Whole minutes above the contraction threshold (sum of active seconds / 60). */
  readonly activeMinutes: number;
  readonly reps: number;
  /** Highest minute peak, percent of the calibrated max. */
  readonly peakPct: number;
  /** Mean activation over worn minutes, percent. */
  readonly meanPct: number;
  /** Epoch seconds of the first and last logged minute. */
  readonly firstEpoch: number;
  readonly lastEpoch: number;
}

/** One row per day that has timed records, oldest first. Records with unknown time are skipped. */
export function tapeDays(records: readonly StoredRecord[]): readonly TapeDay[] {
  const byDay = new Map<string, StoredRecord[]>();
  for (const r of records) {
    if (r.epoch === undefined) continue;
    const key = dayKey(r.epoch * 1000);
    const list = byDay.get(key);
    if (list) list.push(r);
    else byDay.set(key, [r]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rs]) => summarise(date, rs));
}

function summarise(date: string, rs: readonly StoredRecord[]): TapeDay {
  const worn = rs.filter((r) => r.sensorOk);
  const epochs = rs.map((r) => r.epoch!);
  const activeSeconds = worn.reduce((s, r) => s + r.activeSeconds, 0);
  return {
    date,
    wornMinutes: worn.length,
    faultMinutes: rs.length - worn.length,
    activeMinutes: Math.round(activeSeconds / 60),
    reps: worn.reduce((s, r) => s + r.reps, 0),
    peakPct: Math.round(Math.max(0, ...worn.map((r) => r.peak)) / 10),
    meanPct: worn.length ? Math.round(worn.reduce((s, r) => s + r.mean, 0) / worn.length / 10) : 0,
    firstEpoch: Math.min(...epochs),
    lastEpoch: Math.max(...epochs),
  };
}

/** Minutes logged before the tape's clock was set, on a boot the app could not place in time. */
export const untimedMinutes = (records: readonly StoredRecord[]): number => records.filter((r) => r.epoch === undefined).length;
