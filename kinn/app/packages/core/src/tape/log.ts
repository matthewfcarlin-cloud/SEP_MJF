/**
 * A SyncStore that can be saved and restored as one JSON document, so synced minute records
 * survive an app restart. The app writes the snapshot to AsyncStorage (localStorage on the web)
 * whenever it changes. Records are packed as tuples to keep the document small: a week of
 * minutes is about 10,000 records.
 */
import { RECORD_FLAG } from './constants';
import { MemorySyncStore, recordKey, type CalibrationEvent, type CursorState, type StoredRecord, type TimeSource } from './types';

export const TAPE_LOG_VERSION = 1;

/** deviceId, generation, index, t, bootId, flags, mean, peak, reps, activeSeconds, epoch (or null), timeSource */
export type PackedRecord = [string, number, number, number, number, number, number, number, number, number, number | null, TimeSource];

export interface TapeLogSnapshot {
  v: typeof TAPE_LOG_VERSION;
  cursors: CursorState[];
  calibrations: CalibrationEvent[];
  records: PackedRecord[];
}

export function packRecord(r: StoredRecord): PackedRecord {
  return [r.deviceId, r.generation, r.index, r.t, r.bootId, r.flags, r.mean, r.peak, r.reps, r.activeSeconds, r.epoch ?? null, r.timeSource];
}

export function unpackRecord(p: PackedRecord): StoredRecord {
  const [deviceId, generation, index, t, bootId, flags, mean, peak, reps, activeSeconds, epoch, timeSource] = p;
  return {
    deviceId,
    generation,
    index,
    t,
    bootId,
    flags,
    sensorOk: (flags & RECORD_FLAG.SENSOR_OK) !== 0,
    mean,
    peak,
    reps,
    activeSeconds,
    ...(epoch !== null ? { epoch } : {}),
    timeSource,
  };
}

export const emptySnapshot = (): TapeLogSnapshot => ({ v: TAPE_LOG_VERSION, cursors: [], calibrations: [], records: [] });

/** MemorySyncStore plus change notification and snapshot / restore. */
export class TapeLog extends MemorySyncStore {
  private listeners = new Set<() => void>();
  private version = 0;

  static fromSnapshot(s: TapeLogSnapshot | null | undefined): TapeLog {
    const log = new TapeLog();
    log.restore(s);
    return log;
  }

  /** Replace the contents with a saved snapshot. A missing or unknown-version snapshot leaves the log empty. */
  restore(s: TapeLogSnapshot | null | undefined) {
    this.cursors.clear();
    this.records.clear();
    this.calibrations = [];
    if (s && s.v === TAPE_LOG_VERSION) {
      for (const c of s.cursors) this.cursors.set(c.deviceId, { ...c });
      this.calibrations = s.calibrations.map((c) => ({ ...c }));
      for (const p of s.records) {
        const r = unpackRecord(p);
        this.records.set(recordKey(r), r);
      }
    }
    this.changed();
  }

  snapshot(): TapeLogSnapshot {
    return {
      v: TAPE_LOG_VERSION,
      cursors: [...this.cursors.values()].map((c) => ({ ...c })),
      calibrations: this.calibrations.map((c) => ({ ...c })),
      records: this.all().map(packRecord),
    };
  }

  /** Bumps on every change; lets React read the log with useSyncExternalStore. */
  get changeCount(): number {
    return this.version;
  }

  onChange(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private changed() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  override async setCursor(state: CursorState) {
    await super.setCursor(state);
    this.changed();
  }

  override async upsertRecords(records: StoredRecord[]) {
    const added = await super.upsertRecords(records);
    if (records.length) this.changed();
    return added;
  }

  override async addCalibration(ev: CalibrationEvent) {
    await super.addCalibration(ev);
    this.changed();
  }

  /** Forget everything (used by "Delete tape data"). */
  clear() {
    this.cursors.clear();
    this.records.clear();
    this.calibrations = [];
    this.changed();
  }
}
