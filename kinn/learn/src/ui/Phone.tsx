import type { ReactNode } from 'react';
import type { Feel } from '../engine/checkin';
import type { HeroRun } from '../engine/hero';
import type { Weights } from '../engine/model';
import { IconLearned, IconToday, IconYou } from './app/bits';
import { CheckInDone, CheckInScreen, type CheckInResult } from './app/Evening';
import { Learned, Week, You } from './app/Insights';
import { Connect, Start, Today } from './app/Morning';
import { Session } from './app/Session';
import './app/app.css';

export type { CheckInResult };

/** Every screen of the app. Today, Learned and You are tabs; the rest open from them. */
export type Screen = 'start' | 'connect' | 'today' | 'session' | 'checkin' | 'learned' | 'week' | 'you';

const TAB_OF: Record<Screen, 'today' | 'learned' | 'you' | null> = {
  start: null,
  connect: null,
  today: 'today',
  session: 'today',
  checkin: 'today',
  learned: 'learned',
  week: 'learned',
  you: 'you',
};

type Props = {
  run: HeroRun;
  day: number;
  fleet: { devices: number; weights: Weights };
  screen: Screen;
  onScreen: (s: Screen) => void;
  liveBend: number | null;
  onCheckIn: (input: { feel: Feel } | { text: string }) => Promise<void>;
  result: CheckInResult | null;
  onNextDay: () => void;
};

export function Phone({ run, day, fleet, screen, onScreen, liveBend, onCheckIn, result, onNextDay }: Props) {
  const m = run.mornings[day - 1];
  const prev = day > 1 ? run.mornings[day - 2] : null;
  const past = liveBend !== null && m.line !== null && liveBend > m.line && screen === 'today';
  const tab = TAB_OF[screen];

  let body: ReactNode;
  switch (screen) {
    case 'start':
      body = <Start m={m} devices={fleet.devices} onStart={() => onScreen('today')} />;
      break;
    case 'connect':
      body = <Connect m={m} prev={prev} day={day} onDone={() => onScreen('today')} />;
      break;
    case 'session':
      body = <Session key={day} m={m} day={day} onBack={() => onScreen('today')} />;
      break;
    case 'checkin':
      body =
        result && result.day === day ? (
          <CheckInDone result={result} onNextDay={onNextDay} />
        ) : (
          <CheckInScreen day={day} onCheckIn={onCheckIn} onBack={() => onScreen('today')} />
        );
      break;
    case 'learned':
      body = <Learned run={run} m={m} day={day} fleet={fleet} onWeek={() => onScreen('week')} />;
      break;
    case 'week':
      body = <Week run={run} day={day} onBack={() => onScreen('learned')} />;
      break;
    case 'you':
      body = <You day={day} />;
      break;
    default:
      body = <Today run={run} m={m} day={day} liveBend={liveBend} onCheckIn={() => onScreen('checkin')} onSession={() => onScreen('session')} />;
  }

  return (
    <div className="phone kinn-app" aria-label="Kinn app">
      <div className="phone-screen">
        <div className="status-bar" aria-hidden="true">
          <span>9:41</span>
          <span className="island" />
          <span className="status-icons">
            <i />
            <i />
            <i />
            <b />
          </span>
        </div>
        {past && (
          <div className="buzz" role="alert">
            <span className="buzz-ring" aria-hidden="true" />
            <span>
              <strong>Past your line</strong>
              <span>
                {liveBend}° is over your {m.line}° line. Ease off.
              </span>
            </span>
          </div>
        )}
        <div className="app-body" key={`${screen}-${day}`}>
          {body}
        </div>
        {tab && (
          <nav className="tab-bar" aria-label="App sections">
            <TabButton active={tab === 'today'} label="Today" icon={<IconToday />} onClick={() => onScreen('today')} />
            <TabButton active={tab === 'learned'} label="Learned" icon={<IconLearned />} onClick={() => onScreen('learned')} />
            <TabButton active={tab === 'you'} label="You" icon={<IconYou />} onClick={() => onScreen('you')} />
          </nav>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className={active ? 'tab active' : 'tab'} aria-current={active ? 'page' : undefined} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
