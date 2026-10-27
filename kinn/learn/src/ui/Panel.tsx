import { useEffect, useRef } from 'react';
import { count, pct } from '../engine/advice';
import type { Curves } from '../engine/curves';
import type { HeroRun } from '../engine/hero';
import { SCHEME_LABEL } from '../engine/model';
import { AGE_LABEL, INJURY_LABEL, N_FEATURES, SENSORS, SENSOR_LABEL, SENSOR_SOURCE, displayReadings, type Age, type Injury } from '../engine/sim';
import type { Focus } from '../story';
import { LineChart, Sparkline } from './charts';

const COLORS = { you: '#8c8c8c', fleet: '#3987e5', both: '#199e70', rare: '#9085e9' };

const sizeLabel = (n: number) => (n >= 1000 ? `${n / 1000}k` : String(n));

type Props = {
  curves: Curves;
  fleetIndex: number;
  run: HeroRun;
  day: number;
  focus: Focus;
  liveBend: number | null;
  onLiveBend: (v: number | null) => void;
};

export function Panel({ curves, fleetIndex, run, day, focus, liveBend, onLiveBend }: Props) {
  const fleet = curves.fleets[fleetIndex];
  const week = Math.min(5, Math.floor((day - 1) / 7));
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // When a story step is about a chart, bring that chart into view.
    if (focus === 'phone') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    ref.current?.querySelector('.card.focus')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }, [focus]);
  return (
    <div className="panel" ref={ref}>
      <Sensors run={run} day={day} liveBend={liveBend} onLiveBend={onLiveBend} line={run.mornings[day - 1].line} />
      <section className={focus === 'weekly' ? 'card focus' : 'card'} aria-labelledby="weekly-title">
        <h3 id="weekly-title" className="card-title">
          Is the morning call right?
        </h3>
        <p className="card-sub">
          {count(curves.newcomers)} simulated newcomers, each call checked against that evening’s check-in. Fleet: {count(fleet.devices)} wearers.
        </p>
        <LineChart
          ariaLabel="How often the morning call is right, by week of wear, for three ways of learning"
          xTitle="Week of wear"
          xLabels={['1', '2', '3', '4', '5', '6']}
          yMin={0.45}
          yMax={0.9}
          yTicks={[0.5, 0.6, 0.7, 0.8, 0.9]}
          format={pct}
          floor={{ value: 0.5, label: 'Coin flip' }}
          marker={week}
          markerLabel={`Maya, day ${day}`}
          series={[
            { id: 'you', label: SCHEME_LABEL.you, color: COLORS.you, dashed: true, values: curves.weekly.you },
            { id: 'fleet', label: SCHEME_LABEL.fleet, color: COLORS.fleet, values: curves.weekly.fleet[fleetIndex] },
            { id: 'both', label: SCHEME_LABEL.both, color: COLORS.both, values: curves.weekly.both[fleetIndex] },
          ]}
        />
      </section>
      <section className={focus === 'fleet' ? 'card focus' : 'card'} aria-labelledby="fleet-title">
        <h3 id="fleet-title" className="card-title">
          More wearers, better first weeks
        </h3>
        <p className="card-sub">How often week-one calls are right for a newcomer, by how many people Kinn learned from before them.</p>
        <LineChart
          ariaLabel="Week-one call accuracy for newcomers by fleet size, for a common and a rare kind of recovery"
          xTitle="Wearers Kinn learned from"
          xLabels={curves.fleetSizes.map(sizeLabel)}
          yMin={0.45}
          yMax={0.9}
          yTicks={[0.5, 0.6, 0.7, 0.8, 0.9]}
          format={pct}
          floor={{ value: 0.5, label: 'Coin flip' }}
          marker={fleetIndex}
          markerLabel="Now"
          series={curves.firstWeekByGroup.map((g, i) => {
            const [injury, age] = g.group.split(':') as [Injury, Age];
            return {
              id: g.group,
              label: `${shortInjury(injury)}, ${AGE_LABEL[age]}${i === 0 ? ' (Maya)' : ''}`,
              color: i === 0 ? COLORS.both : COLORS.rare,
              values: g.rates,
            };
          })}
        />
        <Federated devices={fleet.devices} rounds={fleet.rounds} />
      </section>
    </div>
  );
}

const shortInjury = (i: Injury) => (i === 'tkr' ? 'Knee replacement' : i === 'acl' ? 'ACL' : INJURY_LABEL[i]);

function Sensors({ run, day, liveBend, onLiveBend, line }: { run: HeroRun; day: number; liveBend: number | null; onLiveBend: (v: number | null) => void; line: number | null }) {
  const upTo = run.days.slice(Math.max(0, day - 15), day - 1);
  const yesterday = upTo[upTo.length - 1];
  const r = yesterday ? displayReadings(yesterday) : null;
  const shown = (s: (typeof SENSORS)[number]) =>
    r === null ? '—' : s === 'bend' ? `${r.flexDeg}°` : s === 'deepBends' ? String(r.deepBends) : s === 'fatigue' ? `${r.fatiguePct}%` : `+${r.warmthC.toFixed(1)}°C`;
  const series = (s: (typeof SENSORS)[number]) =>
    upTo.map((d) => {
      const v = displayReadings(d);
      return s === 'bend' ? v.flexDeg : s === 'deepBends' ? v.deepBends : s === 'fatigue' ? v.fatiguePct : v.warmthC;
    });
  return (
    <section className="card" aria-labelledby="sensors-title">
      <h3 id="sensors-title" className="card-title">
        What the strip measured {yesterday ? `on day ${yesterday.day}` : ''}
      </h3>
      <p className="card-sub">{yesterday ? 'Last two weeks; dots mark flare-ups.' : 'Nothing yet: this is her first morning.'}</p>
      <ul className="sensors">
        {SENSORS.map((s) => (
          <li key={s}>
            <div>
              <p className="sensor-name">{SENSOR_LABEL[s]}</p>
              <p className="sensor-source">{SENSOR_SOURCE[s]}</p>
            </div>
            <p className="sensor-value">{shown(s)}</p>
            <Sparkline values={series(s)} flares={upTo.map((d) => d.flare)} label={`${SENSOR_LABEL[s]}, last ${upTo.length} days`} />
          </li>
        ))}
      </ul>
      <div className="try-bend">
        <label htmlFor="bend">
          Try it: bend the knee <span className="try-value">{liveBend !== null ? `${liveBend}°` : ''}</span>
        </label>
        <input
          id="bend"
          type="range"
          min={60}
          max={150}
          value={liveBend ?? 60}
          onChange={(e) => onLiveBend(Number(e.target.value))}
          aria-describedby="bend-help"
        />
        <p id="bend-help" className="card-sub">
          {line !== null ? `The coin buzzes her phone past her line (${line}°).` : 'No line yet, so no buzz.'}
          {liveBend !== null && (
            <button type="button" className="link-button" onClick={() => onLiveBend(null)}>
              Reset
            </button>
          )}
        </p>
      </div>
    </section>
  );
}

function Federated({ devices, rounds }: { devices: number; rounds: number }) {
  return (
    <div className="fed" aria-label="How the fleet learns without sharing readings">
      <div className="fed-node">
        <p className="fed-head">Each phone</p>
        <p className="fed-body">Improves tonight’s fleet model on its own days. Readings and check-ins stay on the phone.</p>
      </div>
      <div className="fed-arrow" aria-hidden="true">
        <span>{N_FEATURES} numbers</span>
      </div>
      <div className="fed-node">
        <p className="fed-head">Fleet model</p>
        <p className="fed-body">
          {devices > 0 ? `Averages ${count(devices)} updates. ${rounds} nights so far.` : 'Nothing to average yet.'} Sent back to every phone, and to the next newcomer.
        </p>
      </div>
    </div>
  );
}
