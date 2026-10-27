/**
 * A guided PT session: ten reps of one exercise, read live from the strip. The demo plays
 * simulated reps; the app reads every number (bend, reps, full range, hold) from them.
 */
import { rng } from './rng';

export type Exercise = { name: string; cue: string; holdS: number };

/** Early weeks work on bending; later ones on strength. */
export function exerciseFor(day: number): Exercise {
  if (day <= 14) return { name: 'Heel slides', cue: 'Slide your heel toward you, hold, slide back.', holdS: 2 };
  if (day <= 28) return { name: 'Wall slides', cue: 'Back to the wall, slide down, hold, push up.', holdS: 2 };
  return { name: 'Step-downs', cue: 'Lower slowly from the step, hold, stand tall.', holdS: 2 };
}

export type Rep = { peak: number; holdMs: number };

export type SessionPlan = { exercise: Exercise; target: number; reps: Rep[] };

export const REPS = 10;
/** A rep within this many degrees of the target counts as full range. */
export const FULL_RANGE_SLACK = 3;

/**
 * The reps Maya does today: around the target, holds near the cue, and a tired quad late in
 * the set (shorter reps and holds), which is what the muscle sensor would show.
 */
export function planSession(day: number, line: number | null): SessionPlan {
  const exercise = exerciseFor(day);
  const target = Math.max(70, Math.min(120, (line ?? 100) - 8));
  const r = rng(day * 7919 + 17);
  const reps = Array.from({ length: REPS }, (_, i) => {
    const tired = i >= 7 ? (i - 6) * 3 : 0;
    return {
      peak: Math.round(target + r.normal(1, 2.5) - tired),
      holdMs: Math.round(Math.max(800, exercise.holdS * 1000 + r.normal(250, 350) - tired * 120)),
    };
  });
  return { exercise, target, reps };
}

// One rep's timeline: rise, hold at the peak, lower, a short rest.
const RISE = 900;
const LOWER = 700;
const REST = 500;
export const repDuration = (rep: Rep) => RISE + rep.holdMs + LOWER + REST;
export const sessionDuration = (plan: SessionPlan) => plan.reps.reduce((s, r) => s + repDuration(r), 0);

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export type SessionFrame = {
  /** knee bend right now, degrees */
  bend: number;
  /** reps finished */
  done: number;
  /** the rep in progress (0-based), or REPS when the set is over */
  current: number;
  phase: 'rise' | 'hold' | 'lower' | 'rest' | 'done';
};

/** Where the knee is `ms` into the session. */
export function frameAt(plan: SessionPlan, ms: number): SessionFrame {
  let t = ms;
  for (let i = 0; i < plan.reps.length; i++) {
    const rep = plan.reps[i];
    if (t < RISE) return { bend: Math.round(rep.peak * ease(t / RISE)), done: i, current: i, phase: 'rise' };
    t -= RISE;
    if (t < rep.holdMs) return { bend: rep.peak, done: i, current: i, phase: 'hold' };
    t -= rep.holdMs;
    if (t < LOWER) return { bend: Math.round(rep.peak * (1 - ease(t / LOWER))), done: i, current: i, phase: 'lower' };
    t -= LOWER;
    if (t < REST) return { bend: 0, done: i + 1, current: i, phase: 'rest' };
    t -= REST;
  }
  return { bend: 0, done: plan.reps.length, current: plan.reps.length, phase: 'done' };
}

export const isFullRange = (rep: Rep, target: number) => rep.peak >= target - FULL_RANGE_SLACK;

export type SessionStats = { reps: number; fullRange: number; avgHoldS: number; firstTired: number | null };

export function sessionStats(plan: SessionPlan, done: number): SessionStats {
  const reps = plan.reps.slice(0, done);
  const fullRange = reps.filter((r) => isFullRange(r, plan.target)).length;
  const avgHoldS = reps.length ? Math.round((reps.reduce((s, r) => s + r.holdMs, 0) / reps.length / 1000) * 10) / 10 : 0;
  // The first rep from which every remaining rep fell short: when the quad tired.
  let firstTired: number | null = null;
  for (let i = reps.length - 1; i >= 0 && !isFullRange(reps[i], plan.target); i--) firstTired = i + 1;
  return { reps: reps.length, fullRange, avgHoldS, firstTired: firstTired !== null && firstTired < reps.length ? firstTired : null };
}

/** What the coach says after each rep. */
export function repCue(rep: Rep, target: number, holdS: number): string {
  if (!isFullRange(rep, target)) return 'A little deeper next time.';
  if (rep.holdMs < holdS * 1000 - 300) return 'Full range. Hold it a beat longer.';
  return 'Full range. Good hold.';
}
