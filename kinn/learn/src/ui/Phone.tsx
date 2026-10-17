import { useState, type ReactNode } from 'react';
import { CALL_WORD, callReason, count, pct } from '../engine/advice';
import { FEEL_LABEL, type CheckIn, type Feel } from '../engine/checkin';
import { HERO, type HeroRun, type LearnedEvent, type Morning } from '../engine/hero';
import { SENSORS, SENSOR_LABEL, sensorIndex, type Sensor } from '../engine/sim';
import type { Weights } from '../engine/model';
import { Gauge } from './Gauge';

export type Tab = 'today' | 'checkin' | 'learned';

/** `other`: tomorrow if the answer had been the opposite. `risk`: the chance Kinn gave the day that morning. */
export type CheckInResult = { day: number; checkin: CheckIn; after: Morning; other: Morning; risk: number };

type Props = {
  run: HeroRun;
  day: number;
  fleet: { devices: number; weights: Weights };
  tab: Tab;
  onTab: (t: Tab) => void;
  liveBend: number | null;
  onCheckIn: (input: { feel: Feel } | { text: string }) => Promise<void>;
  result: CheckInResult | null;
  onNextDay: () => void;
};

export function Phone(props: Props) {
  const { run, day, tab, onTab, liveBend } = props;
  const m = run.mornings[day - 1];
  const past = liveBend !== null && m.line !== null && liveBend > m.line;
  return (
    <div className="phone" aria-label="Kinn app">
      <div className={`coin-glow call-${m.call}`} aria-hidden="true" />
      <div className="phone-screen">
        <div className="status-bar" aria-hidden="true">
          <span>9:41</span>
          <span className="island" />
          <span className="status-icons">●●● ▮</span>
        </div>
        {past && (
          <div className="buzz" role="alert">
            <span className="buzz-ring" aria-hidden="true" />
            <div>
              <strong>Past your line</strong>
              <span>
                {liveBend}° is over {m.line}°. Ease off.
              </span>
            </div>
          </div>
        )}
        <div className="app-body">
          {tab === 'today' && <Today m={m} day={day} devices={props.fleet.devices} liveBend={liveBend} past={past} onCheckIn={() => onTab('checkin')} />}
          {tab === 'checkin' && <CheckInScreen {...props} m={m} />}
          {tab === 'learned' && <Learned run={run} m={m} day={day} fleet={props.fleet} />}
        </div>
        <nav className="tab-bar" aria-label="App sections">
          <TabButton id="today" tab={tab} onTab={onTab} label="Today" icon={<IconSun />} />
          <TabButton id="checkin" tab={tab} onTab={onTab} label="Check in" icon={<IconCheck />} />
          <TabButton id="learned" tab={tab} onTab={onTab} label="Learned" icon={<IconSpark />} />
        </nav>
      </div>
    </div>
  );
}

function TabButton({ id, tab, onTab, label, icon }: { id: Tab; tab: Tab; onTab: (t: Tab) => void; label: string; icon: ReactNode }) {
  return (
    <button type="button" className={tab === id ? 'tab active' : 'tab'} aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

const weekOf = (day: number) => Math.ceil(day / 7);

function Today({ m, day, devices, liveBend, past, onCheckIn }: { m: Morning; day: number; devices: number; liveBend: number | null; past: boolean; onCheckIn: () => void }) {
  return (
    <>
      <p className="app-eyebrow">
        Day {day} · Week {weekOf(day)}
      </p>
      <h2 className="app-title">Good morning, {HERO.name}</h2>
      <section className={`call-card call-${m.call}`} aria-live="polite">
        <span className="call-ring" aria-hidden="true" />
        <div>
          <p className="call-label">Today</p>
          <p className="call-word">{CALL_WORD[m.call]}</p>
        </div>
        <p className="call-reason">{callReason(m)}</p>
      </section>
      <section className="line-card">
        <Gauge line={m.line} value={liveBend} past={past} />
        <div className="line-text">
          <p className="line-value">{m.line !== null ? `${m.line}°` : '—'}</p>
          <p className="line-caption">{m.line !== null ? 'Your line today' : 'No line yet'}</p>
        </div>
        <p className="line-source">
          {devices > 0 ? `Learned from ${m.ownDays} of your days + ${count(devices)} recoveries` : `Learned from ${m.ownDays} of your days`}
        </p>
      </section>
      <div className="mini-stats">
        <div>
          <p className="mini-value">{m.fatigueCap !== null ? `${m.fatigueCap}%` : '—'}</p>
          <p className="mini-label">Muscle fatigue cap</p>
        </div>
        <div>
          <p className="mini-value">{m.record !== null ? pct(m.record) : '—'}</p>
          <p className="mini-label">{m.record !== null ? 'Calls right so far' : 'Calls right (after wk 1)'}</p>
        </div>
      </div>
      <button type="button" className="app-button" onClick={onCheckIn}>
        Check in tonight
      </button>
    </>
  );
}

function CheckInScreen({ day, onCheckIn, result, onNextDay }: Props & { m: Morning }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (input: { feel: Feel } | { text: string }) => {
    setBusy(true);
    try {
      await onCheckIn(input);
    } finally {
      setBusy(false);
    }
  };
  if (result && result.day === day) return <CheckInDone result={result} onNextDay={onNextDay} />;
  return (
    <>
      <p className="app-eyebrow">Day {day} · Tonight</p>
      <h2 className="app-title">How did your knee feel today?</h2>
      <div className="feel-buttons">
        {(['good', 'sore', 'flare'] as Feel[]).map((f) => (
          <button key={f} type="button" className={`feel feel-${f}`} disabled={busy} onClick={() => submit({ feel: f })}>
            <span className="feel-dot" aria-hidden="true" />
            {FEEL_LABEL[f]}
          </button>
        ))}
      </div>
      <form
        className="say-it"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) submit({ text });
        }}
      >
        <label htmlFor="say">Or say it your way</label>
        <textarea
          id="say"
          rows={3}
          maxLength={600}
          value={text}
          placeholder="Knee puffed up after the stairs at work, maybe a 6/10"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="app-button" disabled={busy || !text.trim()}>
          {busy ? 'Reading…' : 'Send'}
        </button>
      </form>
      <p className="app-fine">Sore is normal in rehab. Only a flare-up tells Kinn you pushed too far.</p>
    </>
  );
}

function CheckInDone({ result, onNextDay }: { result: CheckInResult; onNextDay: () => void }) {
  const { checkin, after, other, risk } = result;
  const flare = checkin.feel === 'flare';
  const otherLabel = flare ? FEEL_LABEL.good : FEEL_LABEL.flare;
  const rows: { label: string; other: string; yours: string }[] = [
    { label: 'Tomorrow', other: CALL_WORD[other.call], yours: CALL_WORD[after.call] },
    { label: 'Your line', other: other.line !== null ? `${other.line}°` : '—', yours: after.line !== null ? `${after.line}°` : '—' },
    { label: 'Fatigue cap', other: other.fatigueCap !== null ? `${other.fatigueCap}%` : '—', yours: after.fatigueCap !== null ? `${after.fatigueCap}%` : '—' },
  ];
  return (
    <>
      <p className="app-eyebrow">Day {result.day} · Checked in</p>
      <h2 className="app-title">{FEEL_LABEL[checkin.feel]}</h2>
      <p className="checkin-summary">“{checkin.summary}”</p>
      <div className="chips">
        {checkin.pain !== null && <span className="chip">Pain {checkin.pain}/10</span>}
        {checkin.activity && <span className="chip">{checkin.activity}</span>}
        <span className="chip chip-muted">{checkin.readBy === 'claude' ? 'Read by Claude' : checkin.readBy === 'device' ? 'Read on device' : 'One tap'}</span>
      </div>
      <section className="diff">
        <p className="diff-title">What your answer changed for tomorrow</p>
        <div className="diff-row diff-head">
          <span />
          <span>If “{otherLabel}”</span>
          <span>You said</span>
        </div>
        {rows.map((r) => (
          <div key={r.label} className="diff-row">
            <span className="diff-label">{r.label}</span>
            <span className="diff-other">{r.other}</span>
            <span className={r.other === r.yours ? 'diff-yours' : 'diff-yours changed'}>{r.yours}</span>
          </div>
        ))}
        <p className="diff-note">This morning Kinn gave today a {Math.round(risk * 100)}% chance of a flare-up.</p>
      </section>
      <p className="app-fine">Tonight your phone sends the fleet a model update: a few dozen numbers, never your readings or words.</p>
      <button type="button" className="app-button" onClick={onNextDay}>
        See tomorrow
      </button>
    </>
  );
}

function Learned({ run, m, day, fleet }: { run: HeroRun; m: Morning; day: number; fleet: { devices: number; weights: Weights } }) {
  const visible = run.events.filter((e) => e.day < day || (e.day === day && (e.kind === 'line' || e.kind === 'insight' || e.kind === 'start'))).reverse();
  const fleetW = (s: Sensor) => fleet.weights[sensorIndex(HERO.group, s)];
  const max = Math.max(0.5, ...SENSORS.flatMap((s) => [Math.abs(m.sensorWeights[s]), Math.abs(fleetW(s))]));
  return (
    <>
      <p className="app-eyebrow">Day {day}</p>
      <h2 className="app-title">What Kinn has learned</h2>
      <p className="learned-lede">
        From {m.ownDays} of your day{m.ownDays === 1 ? '' : 's'}
        {fleet.devices > 0 ? ` and ${count(fleet.devices)} other recoveries` : ''}.
      </p>
      <section className="matters">
        <p className="diff-title">What warns of a flare-up for you</p>
        <div className="matters-legend" aria-hidden="true">
          <span>
            <i className="bar-you" /> You
          </span>
          {fleet.devices > 0 && (
            <span>
              <i className="bar-fleet" /> People like you
            </span>
          )}
        </div>
        {SENSORS.map((s) => (
          <div key={s} className="matter">
            <span className="matter-name">{SENSOR_LABEL[s]}</span>
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
    </>
  );
}

const weightWord = (w: number) => (w > 1.5 ? 'strong' : w > 0.6 ? 'moderate' : w > 0.15 ? 'weak' : 'little or no');

function EventItem({ e }: { e: LearnedEvent }) {
  return (
    <li className={`event event-${e.kind}`}>
      <span className="event-day">Day {e.day}</span>
      <p className="event-title">{e.title}</p>
      <p className="event-detail">{e.detail}</p>
    </li>
  );
}

const IconSun = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <line key={a} x1="12" y1="2.5" x2="12" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />
    ))}
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 12.5l2.7 2.7L16.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSpark = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M3 17l5-6 4 3 4-6 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="21" cy="13" r="1.6" fill="currentColor" />
  </svg>
);
