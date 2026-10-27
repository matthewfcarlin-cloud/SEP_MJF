/**
 * Inside one day: the strip's hour-by-hour bending, and what's behind the morning call.
 * The hours are drawn from that day's readings (same peak, same deep bends), so they always
 * agree with the daily numbers the model learned from.
 */
import { HERO, typicalZ, type Morning } from './hero';
import { rng } from './rng';
import { SENSORS, SENSOR_LABEL, displayReadings, sensorIndex, type Day, type Sensor } from './sim';

export const WAKE = 7;
export const SLEEP = 23;

export type Hour = { hour: number; worn: boolean; /** 0–1 share of the day's bending */ load: number; /** highest bend that hour, degrees */ peak: number };

export type DayDetail = {
  hours: Hour[];
  peak: number;
  peakHour: number;
  deepBends: number;
  minutesPastLine: number;
  wornHours: number;
};

/** A day's shape: quiet morning, a PT session late afternoon, an evening bump. */
const SHAPE = [0, 0, 0, 0, 0, 0, 0, 0.25, 0.45, 0.4, 0.35, 0.4, 0.55, 0.4, 0.35, 0.45, 0.6, 1, 0.7, 0.55, 0.45, 0.35, 0.2, 0];

export function dayDetail(d: Day, line: number | null): DayDetail {
  const r = rng(d.day * 104729 + 11);
  const { flexDeg, deepBends } = displayReadings(d);
  const raw = SHAPE.map((s, h) => (h >= WAKE && h < SLEEP ? Math.max(0.05, s * (0.75 + r.next() * 0.5)) : 0));
  const peakHour = raw.indexOf(Math.max(...raw));
  const max = raw[peakHour];
  const hours = raw.map((v, hour) => ({
    hour,
    worn: hour >= WAKE && hour < SLEEP,
    load: v / max,
    peak: v ? Math.round(flexDeg * (0.55 + 0.45 * (v / max))) : 0,
  }));
  hours[peakHour].peak = flexDeg;
  // Minutes past the line: each hour that went past it spent a few minutes there, more the further past.
  const minutesPastLine = line === null ? 0 : hours.reduce((m, h) => m + (h.peak > line ? Math.round(3 + (h.peak - line) * 1.5) : 0), 0);
  return { hours, peak: flexDeg, peakHour, deepBends, minutesPastLine, wornHours: SLEEP - WAKE };
}

export type Driver = { sensor: Sensor; label: string; effect: 'raises' | 'lowers' | 'neutral'; weight: number };

/**
 * What pushed this morning's call: each signal's pull on the flare-up risk for a day like her
 * recent ones (her model's weight × how far her recent days sat from typical). Strongest first.
 * Null on day 1, when she has no recent days.
 */
export function drivers(m: Morning, days: Day[], day: number): Driver[] | null {
  if (day < 3 || m.call === 'learning') return null;
  const z = typicalZ(days, day);
  return SENSORS.map((s) => {
    const weight = m.weights[sensorIndex(HERO.group, s)] * z[s];
    return { sensor: s, label: SENSOR_LABEL[s], weight, effect: weight > 0.12 ? 'raises' : weight < -0.12 ? 'lowers' : 'neutral' } as Driver;
  }).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
}

export const formatHour = (h: number) => (h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`);
