import { useEffect } from 'react';
import { callReason, count } from '../../engine/advice';
import { connectHeadline, deviceStatus, overnightNote, yesterdayReading } from '../../engine/daily';
import type { HeroRun, Morning } from '../../engine/hero';
import { exerciseFor } from '../../engine/session';
import { Coin, Spark } from './bits';
import { Ring } from './Ring';

const weekOf = (day: number) => Math.ceil(day / 7);

/** Day 1: where Kinn starts. With a fleet, a real line from people like you; without, from scratch. */
export function Start({ m, devices, onStart }: { m: Morning; devices: number; onStart: () => void }) {
  return (
    <div className="screen center-screen">
      <img className="start-logo" src={`${import.meta.env.BASE_URL}brand/kinn-lockup-ceramic.svg`} width={82} height={24} alt="kinn" />
      <div className="fill center">
        <Ring call={m.call} line={m.line} size={190} draw />
        {devices > 0 ? (
          <>
            <h2 className="headline">Kinn starts from {count(devices)} recoveries like yours.</h2>
            <p className="body muted">
              Your first line is {m.line}°. It becomes more yours with every day you wear the strip and every night you check in.
            </p>
          </>
        ) : (
          <>
            <h2 className="headline">Kinn starts from scratch.</h2>
            <p className="body muted">No one has worn Kinn before you, so the first days are guesses. It learns from every check-in.</p>
          </>
        )}
      </div>
      <button type="button" className="btn" onClick={onStart}>
        Start day 1
      </button>
    </div>
  );
}

/** Every morning after day 1: the coin connects and Kinn says what changed overnight. */
export function Connect({ m, prev, day, onDone }: { m: Morning; prev: Morning | null; day: number; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(t);
  }, [onDone]);
  const { battery } = deviceStatus(day);
  return (
    <button type="button" className="screen center-screen connect" onClick={onDone} aria-label="Continue to Today">
      <div className="fill center">
        <Coin size={132} glow draw />
        <p className="eyebrow signal fade fade-1">
          <span className="live-dot" aria-hidden="true" />
          Coin connected · {battery}%
        </p>
        <h2 className="headline big fade fade-2">{connectHeadline(m)}</h2>
        <p className="body muted fade fade-3">
          Day {day}. {overnightNote(m, prev)}
        </p>
      </div>
      <span className="fine">Tap anywhere to continue</span>
    </button>
  );
}

export function Today({
  run,
  m,
  day,
  liveBend,
  onCheckIn,
  onSession,
}: {
  run: HeroRun;
  m: Morning;
  day: number;
  liveBend: number | null;
  onCheckIn: () => void;
  onSession: () => void;
}) {
  const fatigue = yesterdayReading(run.days, day, 'fatiguePct');
  const bends = yesterdayReading(run.days, day, 'deepBends');
  return (
    <div className="screen">
      <p className="eyebrow">
        Day {day} · Week {weekOf(day)}
      </p>
      <div className="center">
        <Ring call={m.call} line={m.line} live={liveBend} size={210} />
      </div>
      <p className="body">{callReason(m)}</p>
      <div className="tiles">
        <Tile label="Muscle fatigue" r={fatigue} color="var(--data-muscle)" />
        <Tile label="Deep bends" r={bends} color="var(--data-load)" />
      </div>
      {m.call === 'rest' ? (
        <div className="session-card rest-day">
          <span>
            <span className="label">Today’s session</span>
            <span className="body-strong">Rest day. No session today.</span>
          </span>
        </div>
      ) : (
        <button type="button" className="session-card" onClick={onSession} disabled={m.call === 'learning'}>
          <span>
            <span className="label">Today’s session</span>
            <span className="body-strong">{exerciseFor(day).name} · 10 reps</span>
          </span>
          <span className="btn-signal small">Start</span>
        </button>
      )}
      <button type="button" className="tonight" onClick={onCheckIn}>
        <span className="label">Tonight</span>
        <span className="body-strong">Check in after your day</span>
      </button>
    </div>
  );
}

function Tile({ label, r, color }: { label: string; r: ReturnType<typeof yesterdayReading>; color: string }) {
  return (
    <div className="tile">
      <span className="label">{label}</span>
      <div className="tile-row">
        <span className="metric">{r?.value ?? '—'}</span>
        {r && <Spark values={r.spark} color={color} />}
      </div>
      <span className="caption">{r?.note ?? 'No readings yet'}</span>
    </div>
  );
}
