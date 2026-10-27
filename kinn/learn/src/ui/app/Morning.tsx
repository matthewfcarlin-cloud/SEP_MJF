import { callReason, count } from '../../engine/advice';
import { deviceStatus, yesterdayReading } from '../../engine/daily';
import type { HeroRun, Morning } from '../../engine/hero';
import { dayDetail, drivers, formatHour, type DayDetail, type Driver } from '../../engine/intraday';
import { exerciseFor } from '../../engine/session';
import { Mark } from './bits';
import { CallShape, CoinDial } from './CoinDial';

const weekOf = (day: number) => Math.ceil(day / 7);

/** Day 1: where Kinn starts. With a fleet, a real line from people like you; without, from scratch. */
export function Start({ m, devices, onStart }: { m: Morning; devices: number; onStart: () => void }) {
  return (
    <div className="screen center-screen">
      <img className="start-logo" src={`${import.meta.env.BASE_URL}brand/kinn-lockup-ceramic.svg`} width={82} height={24} alt="kinn" />
      <div className="fill center">
        <CoinDial call={m.call} line={m.line} size={236} />
        {devices > 0 ? (
          <>
            <h2 className="headline">Kinn starts from {count(devices)} recoveries like yours.</h2>
            <p className="body muted">Your first line is {m.line}°. It becomes more yours with every day you wear the strip and every night you check in.</p>
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

export function Today({
  run,
  m,
  day,
  liveBend,
  onCheckIn,
  onSession,
  onDay,
}: {
  run: HeroRun;
  m: Morning;
  day: number;
  liveBend: number | null;
  onCheckIn: () => void;
  onSession: () => void;
  onDay: (d: number) => void;
}) {
  const { battery } = deviceStatus(day);
  const yesterday = day > 1 ? dayDetail(run.days[day - 2], run.mornings[day - 2].line) : null;
  const fatigue = yesterdayReading(run.days, day, 'fatiguePct');
  const why = drivers(m, run.days, day);
  return (
    <div className="screen today">
      <div className="today-top">
        <Mark size={20} />
        <span className="eyebrow">
          Day {day} · Week {weekOf(day)}
        </span>
        <span className="coin-chip">
          <span className="live-dot" aria-hidden="true" />
          {battery}%
        </span>
      </div>
      <WeekStrip run={run} day={day} onDay={onDay} />
      <div className="center dial-stage">
        <CoinDial call={m.call} line={m.line} live={liveBend} size={250} />
      </div>
      <p className="body center-text">{callReason(m)}</p>

      {why && <Drivers drivers={why} />}

      {yesterday && <Yesterday d={yesterday} line={run.mornings[day - 2].line} fatigue={fatigue} />}

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

/** The last seven mornings' calls, each with its shape; tap a day to open it. */
function WeekStrip({ run, day, onDay }: { run: HeroRun; day: number; onDay: (d: number) => void }) {
  // The last seven days; in the first week, days still to come are shown dimmed.
  const from = Math.max(1, day - 6);
  const days = Array.from({ length: 7 }, (_, i) => from + i);
  return (
    <div className="week-strip" role="list" aria-label="Your last seven days">
      {days.map((d) => {
        if (d > day)
          return (
            <span key={d} role="listitem" className="wday future" aria-label={`Day ${d}, still to come`}>
              <span className="wday-n">{d}</span>
              <span className="wday-dot" />
              <span className="wday-flare" />
            </span>
          );
        const mm = run.mornings[d - 1];
        const flared = d < day && run.days[d - 1].flare;
        return (
          <button
            key={d}
            type="button"
            role="listitem"
            className={`wday call-${mm.call}${d === day ? ' today' : ''}`}
            onClick={() => onDay(d)}
            aria-label={`Day ${d}: ${mm.call}${flared ? ', flare-up' : ''}`}
            aria-current={d === day ? 'date' : undefined}
          >
            <span className="wday-n">{d}</span>
            <span className="wday-dot">
              <CallShape call={mm.call} />
            </span>
            <span className={`wday-flare${flared ? ' on' : ''}`} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function Drivers({ drivers }: { drivers: Driver[] }) {
  const max = Math.max(0.6, ...drivers.map((d) => Math.abs(d.weight)));
  return (
    <section className="card">
      <p className="label">Behind today’s call</p>
      {drivers.slice(0, 3).map((d) => (
        <div key={d.sensor} className="driver">
          <span className="driver-name">{d.label}</span>
          <span className="driver-bar" aria-hidden="true">
            <i className={d.effect} style={{ width: `${(Math.abs(d.weight) / max) * 50}%`, [d.weight >= 0 ? 'left' : 'right']: '50%' }} />
          </span>
          <span className={`driver-effect ${d.effect}`}>{d.effect === 'raises' ? 'Raises risk' : d.effect === 'lowers' ? 'Lowers risk' : 'No effect'}</span>
        </div>
      ))}
      <p className="caption">From your own model: each signal’s pull on a day like your recent ones.</p>
    </section>
  );
}

function Yesterday({ d, line, fatigue }: { d: DayDetail; line: number | null; fatigue: ReturnType<typeof yesterdayReading> }) {
  return (
    <section className="card">
      <div className="card-head">
        <p className="label">Yesterday on the strip</p>
        <span className="caption">peak at {formatHour(d.peakHour)}</span>
      </div>
      <div className="ribbon" aria-label={`Bending through yesterday, peaking at ${d.peak}° around ${formatHour(d.peakHour)}`}>
        {d.hours.map((h) => (
          <i
            key={h.hour}
            className={!h.worn ? 'off' : line !== null && h.peak > line ? 'past' : ''}
            style={{ height: `${h.worn ? 12 + h.load * 88 : 6}%` }}
            title={h.worn ? `${formatHour(h.hour)}: up to ${h.peak}°` : undefined}
          />
        ))}
      </div>
      <div className="ribbon-axis" aria-hidden="true">
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>12a</span>
      </div>
      <div className="mini-grid">
        <div>
          <span className="metric small">{d.peak}°</span>
          <span className="caption">peak bend</span>
        </div>
        <div>
          <span className="metric small">{d.minutesPastLine}m</span>
          <span className="caption">past your line</span>
        </div>
        <div>
          <span className="metric small">{d.deepBends}</span>
          <span className="caption">deep bends</span>
        </div>
        <div>
          <span className="metric small">{fatigue?.value ?? '—'}</span>
          <span className="caption">muscle fatigue</span>
        </div>
      </div>
      {fatigue && <p className="caption">Muscle fatigue was {fatigue.note.toLowerCase()}.</p>}
    </section>
  );
}
