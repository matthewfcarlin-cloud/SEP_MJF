import { useEffect, useMemo, useRef, useState } from 'react';
import type { Morning } from '../../engine/hero';
import { REPS, frameAt, planSession, repCue, sessionDuration, sessionStats } from '../../engine/session';
import { Back } from './bits';
import { Ring } from './Ring';

/** The demo plays reps at double speed so a full set fits in about 20 seconds. */
const SPEED = 2;

export function Session({ m, day, onBack }: { m: Morning; day: number; onBack: () => void }) {
  const plan = useMemo(() => planSession(day, m.line), [day, m.line]);
  const total = sessionDuration(plan);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = (now: number) => {
      if (last.current !== null) setElapsed((e) => Math.min(total, e + (now - last.current!) * SPEED));
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      last.current = null;
    };
  }, [running, total]);

  const frame = frameAt(plan, elapsed);
  const finished = frame.phase === 'done';
  useEffect(() => {
    if (finished) setRunning(false);
  }, [finished]);

  const stats = sessionStats(plan, frame.done);
  const lastRep = frame.done > 0 ? plan.reps[frame.done - 1] : null;
  const cue =
    elapsed === 0
      ? plan.exercise.cue
      : finished
        ? null
        : frame.phase === 'hold'
          ? 'Hold it.'
          : lastRep && frame.phase !== 'rise'
            ? repCue(lastRep, plan.target, plan.exercise.holdS)
            : 'Bend.';

  if (finished) {
    return (
      <div className="screen">
        <Back label="Today" onClick={onBack} />
        <p className="eyebrow">Session done</p>
        <h2 className="headline">
          {stats.fullRange} of {REPS} reps hit full range.
        </h2>
        <div className="stats">
          <Stat value={`${stats.fullRange}/${REPS}`} label="full range" />
          <Stat value={`${stats.avgHoldS}s`} label="avg hold" />
          <Stat value={`${plan.target}°`} label="target" />
        </div>
        <p className="body muted">
          {stats.firstTired
            ? `Your quad tired from rep ${stats.firstTired}: the muscle sensor saw it before the reps got shorter. Kinn adds that to what it knows about your fatigue.`
            : 'Every rep held its range to the end. Kinn adds this session to what it knows about you.'}
        </p>
        <button type="button" className="btn" onClick={onBack}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <Back label="Today" onClick={onBack} />
      <p className="eyebrow">
        Session · {plan.exercise.name} to {plan.target}°
      </p>
      <div className="center">
        <Ring call="push" line={m.line} live={frame.bend} size={200} />
      </div>
      <div className="stats">
        <Stat value={`${Math.min(frame.done, REPS)}/${REPS}`} label="reps" />
        <Stat value={String(stats.fullRange)} label="full range" />
        <Stat value={stats.reps ? `${stats.avgHoldS}s` : '—'} label="avg hold" />
      </div>
      <p className="cue" aria-live="polite">
        {cue}
      </p>
      <div className="session-actions">
        <button type="button" className={running ? 'btn ghost' : 'btn-signal'} onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start session'}
        </button>
        {elapsed > 0 && (
          <button type="button" className="btn ghost" onClick={() => setElapsed(total)}>
            End
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <span className="metric">{value}</span>
      <span className="caption">{label}</span>
    </div>
  );
}
