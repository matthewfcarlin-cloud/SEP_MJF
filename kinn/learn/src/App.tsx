import { useCallback, useEffect, useMemo, useState } from 'react';
import curvesJson from './data/curves.json';
import { count } from './engine/advice';
import { isFlare, readCheckIn, type CheckIn } from './engine/checkin';
import type { Curves } from './engine/curves';
import { runHero } from './engine/hero';
import { DAYS } from './engine/sim';
import { buildStory, type Focus } from './story';
import { Panel } from './ui/Panel';
import { Phone, type CheckInResult, type Screen } from './ui/Phone';

const curves = curvesJson as Curves;
const story = buildStory(curves);
const FULL = curves.fleets.length - 1;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [day, setDay] = useState(1);
  const [fleetIndex, setFleetIndex] = useState(FULL);
  const [screen, setScreen] = useState<Screen>(story[0].screen);
  const [focus, setFocus] = useState<Focus>('phone');
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [liveBend, setLiveBend] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const fleet = curves.fleets[fleetIndex];
  const run = useMemo(() => runHero(fleet.weights, fleet.devices, overrides), [fleet, overrides]);

  const goTo = useCallback((i: number) => {
    const s = story[i];
    setStepIndex(i);
    setDay(s.day);
    setFleetIndex(s.fleetIndex);
    setScreen(s.screen);
    setFocus(s.focus);
    setPlaying(false);
    setResult(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') goTo(Math.min(story.length - 1, stepIndex + 1));
      if (e.key === 'ArrowLeft') goTo(Math.max(0, stepIndex - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, stepIndex]);

  useEffect(() => {
    if (!playing) return;
    if (day >= DAYS) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setDay((d) => Math.min(DAYS, d + 1)), prefersReducedMotion() ? 0 : 380);
    return () => window.clearTimeout(t);
  }, [playing, day]);

  const onCheckIn = async (input: { feel: CheckIn['feel'] } | { text: string }) => {
    const checkin: CheckIn =
      'text' in input ? await readCheckIn(input.text) : { feel: input.feel, pain: null, activity: null, summary: '', readBy: 'tap' };
    if (!checkin.summary) checkin.summary = checkin.feel === 'flare' ? 'Your knee flared up today.' : checkin.feel === 'sore' ? 'A bit sore, normal for rehab.' : 'Your knee felt good today.';
    const flare = isFlare(checkin);
    const next = { ...overrides, [day]: flare };
    const tomorrow = Math.min(DAYS, day + 1) - 1;
    const after = runHero(fleet.weights, fleet.devices, next);
    // The same evening with the opposite answer, to show what this one check-in changed.
    const other = runHero(fleet.weights, fleet.devices, { ...overrides, [day]: !flare }).mornings[tomorrow];
    setOverrides(next);
    setResult({ day, checkin, after: after.mornings[tomorrow], other, risk: after.steps[day - 1].risk });
  };

  const step = story[stepIndex];
  const edited = Object.keys(overrides).length;

  return (
    <div className="page">
      <header className="top">
        <a className="wordmark" href="/" aria-label="Kinn home">
          KINN
        </a>
        <span className="top-sub">How Kinn learns</span>
        <span className="pill">Simulated data</span>
        <nav className="top-nav" aria-label="Kinn site">
          <a href="/">Home</a>
          <a href="/progress/">Progress</a>
          <a href="/#join">Join waitlist</a>
        </nav>
      </header>

      <section className="intro">
        <h1>
          Every Kinn gets smarter.
          <br />
          <span className="dim">From you, and from everyone.</span>
        </h1>
        <p className="lede">
          The strip measures how you move all day. Each check-in teaches your phone what pushes your knee too far, and each night every phone shares what it
          learned, never the readings, so the next person starts smarter.
        </p>
      </section>

      <main className="stage">
        <aside className="story" aria-label="Walkthrough">
          <ol className="steps">
            {story.map((s, i) => (
              <li key={s.id}>
                <button type="button" className={i === stepIndex ? 'step active' : 'step'} aria-current={i === stepIndex ? 'step' : undefined} onClick={() => goTo(i)}>
                  <span className="step-n">{i + 1}</span>
                  <span className="step-title">{s.title}</span>
                </button>
                {i === stepIndex && <p className="step-body">{s.body}</p>}
              </li>
            ))}
          </ol>
          <div className="step-nav">
            <button type="button" className="ghost" disabled={stepIndex === 0} onClick={() => goTo(stepIndex - 1)}>
              ← Back
            </button>
            <button type="button" className="solid" disabled={stepIndex === story.length - 1} onClick={() => goTo(stepIndex + 1)}>
              Next →
            </button>
          </div>

          <div className="controls">
            <div className="control">
              <div className="control-head">
                <label htmlFor="day">Day</label>
                <span className="control-value">
                  {day} of {DAYS}
                </span>
              </div>
              <div className="control-row">
                <button
                  type="button"
                  className="play"
                  aria-label={playing ? 'Pause' : 'Play the days'}
                  onClick={() => {
                    if (day >= DAYS) setDay(1);
                    setPlaying((p) => !p);
                    setResult(null);
                    setScreen((s) => (s === 'start' || s === 'connect' || s === 'session' ? 'today' : s));
                  }}
                >
                  {playing ? '❚❚' : '▶'}
                </button>
                <input
                  id="day"
                  type="range"
                  min={1}
                  max={DAYS}
                  value={day}
                  onChange={(e) => {
                    setDay(Number(e.target.value));
                    setResult(null);
                    setScreen((s) => (s === 'start' || s === 'connect' ? 'today' : s));
                  }}
                />
              </div>
            </div>
            <div className="control">
              <div className="control-head">
                <label htmlFor="fleet">Wearers Kinn learned from</label>
                <span className="control-value">{count(fleet.devices)}</span>
              </div>
              <input
                id="fleet"
                type="range"
                min={0}
                max={FULL}
                step={1}
                value={fleetIndex}
                aria-valuetext={`${count(fleet.devices)} wearers`}
                onChange={(e) => {
                  setFleetIndex(Number(e.target.value));
                  setResult(null);
                }}
              />
              <div className="ticks" aria-hidden="true">
                {curves.fleetSizes.map((n) => (
                  <span key={n}>{n >= 1000 ? `${n / 1000}k` : n}</span>
                ))}
              </div>
            </div>
            {edited > 0 && (
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setOverrides({});
                  setResult(null);
                }}
              >
                Undo your {edited} check-in{edited === 1 ? '' : 's'}
              </button>
            )}
          </div>
        </aside>

        <div className="phone-col">
          <Phone
            run={run}
            day={day}
            fleet={fleet}
            screen={screen}
            onScreen={(s) => {
              setScreen(s);
              if (s !== 'checkin') setResult(null);
            }}
            liveBend={liveBend}
            onCheckIn={onCheckIn}
            result={result}
            onNextDay={() => {
              setDay((d) => Math.min(DAYS, d + 1));
              setResult(null);
              setScreen(day < DAYS ? 'connect' : 'today');
            }}
          />
          <p className="phone-note">{step.focus === 'phone' ? 'This is the app. Tap around.' : 'The app updates as you drag.'}</p>
        </div>

        <Panel curves={curves} fleetIndex={fleetIndex} run={run} day={day} focus={focus} liveBend={liveBend} onLiveBend={setLiveBend} />
      </main>

      <footer className="foot">
        <details>
          <summary>How the learning works</summary>
          <div className="how">
            <p>
              <strong>The model.</strong> A small logistic model estimates the chance that a day’s movement leads to a flare-up, from four signals: how far the knee
              bends (printed stretch traces), how many deep bends (stretch and motion), muscle fatigue (a muscle sensor over the quad) and warmth at the knee (skin
              temperature). Each kind of recovery has its own weights.
            </p>
            <p>
              <strong>On the phone.</strong> Every morning the model makes its call before it knows how the day will go. The evening check-in is the answer, and the
              model takes one learning step from it, held close to the fleet model so a few odd days can’t send it off course.
            </p>
            <p>
              <strong>Across phones.</strong> Each night is a round of federated averaging: phones start from the fleet model, learn on their own days, and send back
              only the new weights ({count(curves.fleets[FULL].weights.length)} numbers). The fleet averages them and sends the result to every phone and to
              tomorrow’s newcomers.
            </p>
            <p>
              <strong>Scoring.</strong> “Right” is balanced accuracy: the average of flare-ups it warned about and calm days it called calm, so a model that always
              warns, or never does, scores 50%. Numbers come from {count(curves.newcomers)} simulated newcomers the fleet never saw.
            </p>
            <p>
              <strong>What’s simulated.</strong> The wearers, readings and outcomes are simulated so the learning can be shown end to end; the math is the real
              thing. Kinn is in development and is not a medical device: it tracks and suggests, it doesn’t diagnose or treat.
            </p>
          </div>
        </details>
        <p className="foot-line">Kinn · Trust your comeback · In development; not a medical device.</p>
      </footer>
    </div>
  );
}
