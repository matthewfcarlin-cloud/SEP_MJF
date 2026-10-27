import { dailyCsv, tapeMinutesCsv, toCsv, trialExport } from '../../src/export/trial'
import { deriveToday } from '../../src/manual/derive'
import { seedDataset } from '../../src/sim/seed'
import { RECORD_FLAG } from '../../src/tape/constants'
import type { StoredRecord } from '../../src/tape/types'
import { startOfDay } from '../../src/time/day'

const TODAY = '2026-10-27'

const minute = (index: number, hour: number, min: number, over: Partial<StoredRecord> = {}): StoredRecord => ({
  deviceId: 'tape-1',
  generation: 0,
  index,
  t: 0,
  bootId: 1,
  flags: RECORD_FLAG.TIME_VALID | RECORD_FLAG.SENSOR_OK,
  sensorOk: true,
  mean: 250,
  peak: 700,
  reps: 3,
  activeSeconds: 40,
  epoch: Math.floor(startOfDay(TODAY, hour) / 1000) + min * 60,
  timeSource: 'device',
  ...over,
})

const tapeMinutes = [minute(0, 9, 0), minute(1, 9, 1), minute(2, 9, 2, { reps: 0, sensorOk: false })]

function build(extra: Partial<ReturnType<typeof seedDataset>> = {}) {
  const data = { ...seedDataset(TODAY), ...extra }
  return trialExport({
    data,
    seededFor: TODAY,
    today: TODAY,
    tape: { cursors: [{ deviceId: 'tape-1', generation: 0, cursor: 3 }], calibrations: [], records: tapeMinutes },
    exportedAt: startOfDay(TODAY, 20),
    appVersion: 'test',
  })
}

describe('trial export', () => {
  test('flags the demo athlete as sample and real entries as not', () => {
    const seed = seedDataset(TODAY)
    const exp = build({
      activityLogs: [...seed.activityLogs, { id: 'act-real', date: TODAY, activity: 'pt', intensity: 'moderate' }],
      checkIns: [...seed.checkIns.filter((c) => c.date !== TODAY), { date: TODAY, pain: 1, swelling: 'none' }],
    })
    expect(exp.activityLogs.filter((l) => !l.sample).map((l) => l.id)).toEqual(['act-real'])
    expect(exp.checkIns.filter((c) => !c.sample).map((c) => c.date)).toEqual([TODAY])
    expect(exp.painLogs.every((p) => p.sample)).toBe(true)
    expect(exp.romDays.every((r) => r.sample)).toBe(true)
    expect(exp.daily.at(-1)).toMatchObject({ date: TODAY, sample: false, morningPain: 1, tapeWornMin: 2, tapeReps: 6 })
    expect(exp.daily.at(-2)?.sample).toBe(true)
  })

  test('carries every tape minute and a per-day tape summary', () => {
    const exp = build()
    expect(exp.tape.minutes).toHaveLength(3)
    expect(exp.tape.days).toEqual([expect.objectContaining({ date: TODAY, wornMinutes: 2, faultMinutes: 1, reps: 6, peakPct: 70 })])
    expect(JSON.parse(JSON.stringify(exp)).schema).toBe('reco.trial-export')
  })

  test('daily and minute CSVs have a header and one row per item', () => {
    const exp = build()
    const daily = dailyCsv(exp).trim().split('\n')
    expect(daily[0]).toMatch(/^date,activities,loadUnits,loadScore,morningPain/)
    expect(daily).toHaveLength(exp.daily.length + 1)
    const mins = tapeMinutesCsv(exp).trim().split('\n')
    expect(mins).toHaveLength(4)
    expect(mins[1]).toContain(`${TODAY} 09:00`)
    expect(mins[1]).toContain(',25,70,3,40')
  })

  test('csv quotes commas, quotes and newlines', () => {
    expect(toCsv([{ a: 'x,y', b: 'say "hi"' }], ['a', 'b'])).toBe('a,b\n"x,y","say ""hi"""\n')
  })
})

describe('deriveToday with tape records', () => {
  test('exposes tape days in the window and today’s tape row, and leaves the load score alone', () => {
    const data = seedDataset(TODAY)
    const without = deriveToday(data, TODAY)
    const withTape = deriveToday(data, TODAY, tapeMinutes)
    expect(without.tapeDays).toEqual([])
    expect(withTape.todayTape).toMatchObject({ wornMinutes: 2, reps: 6 })
    expect(withTape.todayLoad).toEqual(without.todayLoad)
    expect(withTape.progressPercent).toBe(without.progressPercent)
  })
})
