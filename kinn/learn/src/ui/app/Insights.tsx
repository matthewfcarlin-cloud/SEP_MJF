import { useState } from 'react';
import { count, pct } from '../../engine/advice';
import { STRIP_DAYS, deviceStatus, lastWeek } from '../../engine/daily';
import { HERO, type HeroRun, type LearnedEvent, type Morning } from '../../engine/hero';
import type { Weights } from '../../engine/model';
import { INJURY_LABEL, SENSORS, SENSOR_LABEL, displayReadings, sensorIndex, type Sensor } from '../../engine/sim';
import { Back, Row } from './bits';

type Fleet = { devices: number; weights: Weights };

export function Learned({ run, m, day, fleet, onWeek }: { run: HeroRun; m: Morning; day: number; fleet: Fleet; onWeek: () => void }) {
  const visible = run.events.filter((e) => e.day < day || (e.day === day && (e.kind === 'line' || e.kind === 'insight' || e.kind === 'start'))).reverse();
  const fleetW = (s: Sensor) => fleet.weights[sensorIndex(HERO.group, s)];
  const max = Math.max(0.5, ...SENSORS.flatMap((s) => [Math.abs(m.sensorWeights[s]), Math.abs(fleetW(s))]));
  const week = lastWeek(run, day);
  return (
    <div className="screen">
      <p className="eyebrow">
        From {m.ownDays} of your day{m.ownDays === 1 ? '' : 's'}
        {fleet.devices > 0 ? ` + ${count(fleet.devices)} recoveries` : ''}
      </p>
      <h2 className="headline">What Kinn has learned</h2>
      {week && (
        <button type="button" className="week-card" onClick={onWeek}>
          <span>
            <span className="label">Week {week.week} recap</span>
            <span className="body-strong">{weekHeadline(week.lineStart, week.lineEnd)}</span>
          </span>
          <span className="metric small">{week.right !== null ? pct(week.right) : '—'}</span>
        </button>
      )}
      {day > 2 && <Trend run={run} day={day} />}
      <section className="card">
        <p className="label">What warns of a flare-up for you</p>
        <div className="legend" aria-hidden="true">
          <span>
            <i className="bar-you" />
            You
          </span>
          {fleet.devices > 0 && (
            <span>
              <i className="bar-fleet" />
              People like you
            </span>
          )}
        </div>
        {SENSORS.map((s) => (
          <div key={s} className="matter">
            <span className="caption">{SENSOR_LABEL[s]}</span>
            <span className="bars" aria-label={`${SENSOR_LABEL[s]}: ${weightWord(m.sensorWeights[s])} for you`}>
              <span className="bar bar-you" style={{ width: `${(Math.max(0, m.sensorWeights[s]) / max) * 100}%` }} />
              {fleet.devices > 0 && <span className="bar bar-fleet" style={{ width: `${(Math.max(0, fleetW(s)) / max) * 100}%` }} />}
            </span>
          </div>
        ))}
      </section>
      <ol className="events">
        {visible.map((e, i) => (
          <EventItem key={`${e.day}-${e.kind}-${i}`} e={e} />
        ))}
      </ol>
    </div>
  );
}

const weekHeadline = (a: number | null, b: number | null) => {
  if (a === null || b === null) return 'Kinn is still finding your line.';
  const d = b - a;
  return d > 0 ? `Your line went up ${d}°.` : d < 0 ? `Your line came down ${-d}°.` : `Your line held at ${b}°.`;
};

const weightWord = (w: number) => (w > 1.5 ? 'strong' : w > 0.6 ? 'moderate' : w > 0.15 ? 'weak' : 'little or no');

function EventItem({ e }: { e: LearnedEvent }) {
  return (
    <li className={`event event-${e.kind}`}>
      <span className="caption">Day {e.day}</span>
      <p className="body-strong">{e.title}</p>
      <p className="caption">{e.detail}</p>
    </li>
  );
}

export function Week({ run, day, onBack }: { run: HeroRun; day: number; onBack: () => void }) {
  const week = lastWeek(run, day);
  const [shared, setShared] = useState(false);
  if (!week) {
    return (
      <div className="screen">
        <Back label="Learned" onClick={onBack} />
        <h2 className="headline">Your first week ends on day 7.</h2>
        <p className="body muted">Every Sunday Kinn sums up the week: your line, your flare-ups, and how often its calls were right.</p>
      </div>
    );
  }
  const values = week.lines.filter((v): v is number => v !== null);
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const x = (i: number) => 6 + (i / (week.lines.length - 1)) * 208;
  const y = (v: number) => 8 + (1 - (v - min) / (max - min)) * 60;
  const pts = week.lines.map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`)).filter(Boolean);
  const lastV = values[values.length - 1];
  return (
    <div className="screen">
      <Back label="Learned" onClick={onBack} />
      <p className="eyebrow">Week {week.week} recap</p>
      <h2 className="headline">{weekHeadline(week.lineStart, week.lineEnd)}</h2>
      <section className="card">
        <p className="label">Your line, each morning</p>
        <svg viewBox="0 0 220 76" width="100%" height="76" aria-label={`Your line went from ${week.lineStart ?? '—'}° to ${week.lineEnd ?? '—'}°`}>
          <polyline points={pts.join(' ')} fill="none" stroke="var(--a-ink)" strokeWidth="2.5" strokeLinejoin="round" />
          {lastV !== undefined && <circle cx={x(week.lines.length - 1)} cy={y(lastV)} r="4" fill="var(--a-ink)" />}
        </svg>
        <div className="axis">
          <span>{week.lineStart ?? '—'}°</span>
          <span>{week.lineEnd ?? '—'}°</span>
        </div>
      </section>
      <div className="stats">
        <div className="stat">
          <span className="metric">{week.right !== null ? pct(week.right) : '—'}</span>
          <span className="caption">calls right to date</span>
        </div>
        <div className="stat">
          <span className="metric">{week.flares}</span>
          <span className="caption">flare-up{week.flares === 1 ? '' : 's'}</span>
        </div>
        <div className="stat">
          <span className="metric">{week.checkIns}/7</span>
          <span className="caption">check-ins</span>
        </div>
      </div>
      <p className="body muted">
        Calls right checks each morning’s call against that night’s check-in: flare-ups Kinn saw coming and calm days it called calm both count.
      </p>
      <button type="button" className="btn ghost" onClick={() => setShared(true)} disabled={shared}>
        {shared ? 'Sent to your PT' : 'Share with my PT'}
      </button>
    </div>
  );
}

export function You({ day }: { day: number }) {
  const d = deviceStatus(day);
  const [ordered, setOrdered] = useState(false);
  const [contributing, setContributing] = useState(true);
  return (
    <div className="screen">
      <p className="eyebrow">You</p>
      <h2 className="headline">
        {HERO.name} · Right knee
      </h2>
      <p className="caption">
        {INJURY_LABEL.acl} · week {Math.ceil(day / 7)} with Kinn
      </p>
      <section className="card">
        <Row label="Coin">
          <span className="call-push">Connected</span> · {d.battery}%
        </Row>
        <Row label="Strip">
          day {d.stripDay} of {STRIP_DAYS}
        </Row>
        <Row label="Physical therapist">Sharing on</Row>
      </section>
      <section className={`card strip-card${d.stripDaysLeft <= 1 ? ' due' : ''}`}>
        <p className="body-strong">{d.stripDaysLeft === 0 ? 'Put on a new strip today.' : `Replace your strip in ${d.stripDaysLeft} day${d.stripDaysLeft === 1 ? '' : 's'}.`}</p>
        <p className="caption">The coin moves to the new strip. Your model stays on your phone.</p>
        <button type="button" className="btn ghost" onClick={() => setOrdered(true)} disabled={ordered}>
          {ordered ? 'Ordered. 10 strips arrive in 2 days.' : 'Reorder strips'}
        </button>
      </section>
      <section className="card">
        <div className="toggle-row">
          <span>
            <span className="body-strong">Help other Kinns learn</span>
            <span className="caption">Share model updates (a few dozen numbers) each night. Your readings and words never leave your phone.</span>
          </span>
          <button type="button" role="switch" aria-checked={contributing} className={`switch${contributing ? ' on' : ''}`} onClick={() => setContributing((c) => !c)}>
            <span className="visually-hidden">Help other Kinns learn</span>
          </button>
        </div>
      </section>
      <p className="fine">Kinn is in development and is not a medical device. It tracks and suggests; it doesn’t diagnose or treat.</p>
    </div>
  );
}

/** Her line each morning, each day's peak bend, and the flare-ups, from day 1 to today. */
function Trend({ run, day }: { run: HeroRun; day: number }) {
  const W = 300;
  const Hh = 132;
  const pad = { l: 28, r: 8, t: 8, b: 18 };
  const days = Array.from({ length: day }, (_, i) => i + 1);
  const lines = days.map((d) => run.mornings[d - 1].line);
  const peaks = days.slice(0, -1).map((d) => displayReadings(run.days[d - 1]).flexDeg);
  const vals = [...lines.filter((v): v is number => v !== null), ...peaks];
  const lo = Math.floor((Math.min(...vals) - 4) / 10) * 10;
  const hi = Math.ceil((Math.max(...vals) + 4) / 10) * 10;
  const x = (d: number) => pad.l + ((d - 1) / Math.max(1, day - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (Hh - pad.t - pad.b);
  const path = lines
    .map((v, i) => (v === null ? null : `${x(i + 1).toFixed(1)},${y(v).toFixed(1)}`))
    .filter(Boolean)
    .join(' ');
  const ticks = [lo, Math.round((lo + hi) / 2 / 10) * 10, hi];
  const lastLine = lines[lines.length - 1];
  return (
    <section className="card">
      <div className="card-head">
        <p className="label">Day by day</p>
        <span className="caption">day 1–{day}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" aria-label={`Your line went from ${lines.find((v) => v !== null) ?? '—'}° to ${lastLine ?? '—'}° over ${day} days`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 6} y={y(t)} className="tick" textAnchor="end" dominantBaseline="middle">
              {t}°
            </text>
          </g>
        ))}
        {peaks.map((v, i) => (
          <circle key={i} cx={x(i + 1)} cy={y(v)} r="2.2" className="peak-dot" />
        ))}
        <polyline points={path} fill="none" className="line-path" strokeWidth="2.4" strokeLinejoin="round" />
        {lastLine !== null && <circle cx={x(day)} cy={y(lastLine)} r="4" className="line-end" />}
        {days.slice(0, -1).map((d) =>
          run.days[d - 1].flare ? <rect key={d} x={x(d) - 1.5} y={Hh - pad.b + 5} width="3" height="8" rx="1.5" className="flare-mark" /> : null,
        )}
      </svg>
      <div className="legend">
        <span>
          <i className="lg-line" />
          Your line
        </span>
        <span>
          <i className="lg-peak" />
          Peak bend
        </span>
        <span>
          <i className="lg-flare" />
          Flare-up
        </span>
      </div>
    </section>
  );
}
