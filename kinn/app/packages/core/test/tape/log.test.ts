import { describe, expect, it } from 'vitest';
import { DeviceClient } from '../../src/tape/DeviceClient';
import { SimulatedTransport } from '../../src/tape/SimulatedTransport';
import { TapeLog, packRecord, unpackRecord, type TapeLogSnapshot } from '../../src/tape/log';
import { tapeDays, untimedMinutes } from '../../src/tape/days';
import { RECORD_FLAG } from '../../src/tape/constants';
import type { RecordFields } from '../../src/tape/codec';
import type { StoredRecord } from '../../src/tape/types';
import { dayKey } from '../../src/time/day';

const E0 = 1_760_000_000;

function records(n: number, startEpoch = E0 - 3600): RecordFields[] {
  return Array.from({ length: n }, (_, i) => ({
    t: startEpoch + i * 60,
    bootId: 3,
    flags: RECORD_FLAG.TIME_VALID | RECORD_FLAG.SENSOR_OK,
    meanActivationPermille: 100 + i,
    peakActivationPermille: 400 + i,
    reps: i % 3,
    activeSeconds: 20,
  }));
}

function sim(n: number) {
  return new SimulatedTransport({
    realtime: false,
    connectDelayMs: 1,
    writeLatencyMs: 1,
    historyPacingMs: 0,
    reconnectDelayMs: -1,
    epochAtStart: E0,
    bootId: 3,
    history: { firstIndex: 0, records: records(n) },
  });
}

async function syncInto(log: TapeLog, n: number) {
  const t = sim(n);
  const client = new DeviceClient(t, log, { now: () => E0 * 1000, tzOffsetMin: () => 0, commandTimeoutMs: 500, historyIdleTimeoutMs: 500 });
  await client.connect();
  await client.disconnect();
  client.dispose();
  t.dispose();
}

const stored = (over: Partial<StoredRecord> = {}): StoredRecord => ({
  deviceId: 'd',
  generation: 0,
  index: 0,
  t: E0,
  bootId: 1,
  flags: RECORD_FLAG.TIME_VALID | RECORD_FLAG.SENSOR_OK,
  sensorOk: true,
  mean: 200,
  peak: 600,
  reps: 2,
  activeSeconds: 30,
  epoch: E0,
  timeSource: 'device',
  ...over,
});

describe('TapeLog', () => {
  it('packs and unpacks a record without loss', () => {
    const r = stored({ index: 7 });
    expect(unpackRecord(packRecord(r))).toEqual(r);
    const { epoch: _e, ...noEpoch } = stored({ timeSource: 'unknown' });
    expect(unpackRecord(packRecord(noEpoch))).toEqual(noEpoch);
  });

  it('survives a snapshot round trip, so the next sync resumes from the saved cursor', async () => {
    const log = new TapeLog();
    let changes = 0;
    log.onChange(() => changes++);
    await syncInto(log, 30);
    expect(log.all()).toHaveLength(30);
    expect(changes).toBeGreaterThan(0);

    const json: TapeLogSnapshot = JSON.parse(JSON.stringify(log.snapshot()));
    const restored = TapeLog.fromSnapshot(json);
    expect(restored.all()).toEqual(log.all());
    expect(await restored.getCursor('sim-kinetape-demo')).toMatchObject({ cursor: 30 });

    await syncInto(restored, 30);
    expect(restored.all()).toHaveLength(30);
  });

  it('starts empty from a missing or unknown-version snapshot', () => {
    expect(TapeLog.fromSnapshot(null).all()).toEqual([]);
    expect(TapeLog.fromSnapshot({ v: 99 } as unknown as TapeLogSnapshot).all()).toEqual([]);
  });

  it('clear() forgets records, cursors and calibrations', async () => {
    const log = new TapeLog();
    await syncInto(log, 5);
    log.clear();
    expect(log.snapshot()).toMatchObject({ cursors: [], calibrations: [], records: [] });
  });
});

const untimed = ({ epoch: _e, ...r }: StoredRecord): StoredRecord => r;

describe('tapeDays', () => {
  it('rolls minutes up per RECO day and keeps fault minutes out of wear and reps', () => {
    const day = dayKey(E0 * 1000);
    const rs = [
      stored({ index: 0, reps: 2, activeSeconds: 30, mean: 200, peak: 600 }),
      stored({ index: 1, epoch: E0 + 60, reps: 1, activeSeconds: 90, mean: 400, peak: 950 }),
      stored({ index: 2, epoch: E0 + 120, sensorOk: false, reps: 9, peak: 1000 }),
      untimed(stored({ index: 3, timeSource: 'unknown' })),
    ];
    const days = tapeDays(rs);
    expect(days).toHaveLength(1);
    expect(days[0]).toEqual({
      date: day,
      wornMinutes: 2,
      faultMinutes: 1,
      activeMinutes: 2,
      reps: 3,
      peakPct: 95,
      meanPct: 30,
      firstEpoch: E0,
      lastEpoch: E0 + 120,
    });
    expect(untimedMinutes(rs)).toBe(1);
  });

  it('splits days at the 04:00 boundary', () => {
    const d = new Date(2026, 9, 27, 3, 59).getTime() / 1000;
    const days = tapeDays([stored({ index: 0, epoch: d }), stored({ index: 1, epoch: d + 120 })]);
    expect(days.map((x) => x.date)).toEqual(['2026-10-26', '2026-10-27']);
  });
});
