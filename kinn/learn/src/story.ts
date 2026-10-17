/**
 * The five-step walkthrough. Each step sets the demo's day, fleet and screen, and its text is
 * filled in from the same numbers the charts and the phone show.
 */
import { count, pct } from './engine/advice';
import type { Curves } from './engine/curves';
import { HERO, STORY_FLARE_DAY, runHero } from './engine/hero';
import { AGE_LABEL, INJURY_LABEL, SENSOR_LABEL, SENSORS, type Age, type Injury } from './engine/sim';
import type { Tab } from './ui/Phone';

export type Focus = 'phone' | 'fleet' | 'weekly';

export type Step = { id: string; title: string; body: string; day: number; fleetIndex: number; tab: Tab; focus: Focus };

const last = <T,>(xs: T[]) => xs[xs.length - 1];

export function buildStory(curves: Curves): Step[] {
  const full = curves.fleets.length - 1;
  const fleet = curves.fleets[full];
  const run = runHero(fleet.weights, fleet.devices);
  const d1 = run.mornings[0];
  const d21 = run.mornings[20];
  const top = SENSORS.reduce((a, b) => (d21.sensorWeights[b] > d21.sensorWeights[a] ? b : a));

  const [mine, rare] = curves.firstWeekByGroup;
  const rareBest = Math.max(...rare.rates);
  const rareEnough = curves.fleetSizes[rare.rates.findIndex((r) => r >= rareBest - 0.02)];
  const [rareInjury, rareAge] = rare.group.split(':') as [Injury, Age];

  const youOnly = curves.weekly.you;
  const fleetOnly = curves.weekly.fleet[full];
  const both = curves.weekly.both[full];

  return [
    {
      id: 'meet',
      title: `Meet ${HERO.name}`,
      body: `${HERO.age}, ${HERO.sport} player, recovering from an ${INJURY_LABEL.acl}. On day one Kinn already has a call for her and a line of ${d1.line}°. It starts from what ${count(fleet.devices)} earlier recoveries taught it, then adjusts to her.`,
      day: 1,
      fleetIndex: full,
      tab: 'today',
      focus: 'phone',
    },
    {
      id: 'learns',
      title: 'It learns her',
      body: `Three weeks of her own days later, her line has moved from ${d1.line}° to ${d21.line}°, and Kinn has found her strongest warning sign: ${SENSOR_LABEL[top].toLowerCase()}. Its morning calls have been right ${pct(d21.record ?? 0.5)} of the time.`,
      day: 21,
      fleetIndex: full,
      tab: 'learned',
      focus: 'phone',
    },
    {
      id: 'checkin',
      title: 'Tell it how it went',
      body: `Day ${STORY_FLARE_DAY}: her knee swelled after practice. Tap “Flare-up” on the phone, or type it in your own words. Kinn updates her model before morning, and you can see what changed.`,
      day: STORY_FLARE_DAY,
      fleetIndex: full,
      tab: 'checkin',
      focus: 'phone',
    },
    {
      id: 'fleet',
      title: 'Every Kinn learns',
      body: `Each night, phones send back model updates, never readings. With no other wearers, a newcomer like ${HERO.name} gets calls right ${pct(mine.rates[0])} of the time in week one, close to a coin flip. With ${count(last(curves.fleetSizes))} wearers: ${pct(last(mine.rates))}. Rarer recoveries need more people: for a ${INJURY_LABEL[rareInjury].toLowerCase()} ${AGE_LABEL[rareAge]}, it takes about ${count(rareEnough)}. Drag the fleet to see it.`,
      day: 1,
      fleetIndex: 0,
      tab: 'today',
      focus: 'fleet',
    },
    {
      id: 'loop',
      title: 'It never stops',
      body: `Everyone else's data alone stays near ${pct(Math.max(...fleetOnly))}. Your data alone starts near a coin flip (${pct(youOnly[0])}). Together: ${pct(both[0])} in week one and ${pct(last(both))} by week six. Every check-in teaches your Kinn, and every Kinn teaches the next person's.`,
      day: 42,
      fleetIndex: full,
      tab: 'learned',
      focus: 'weekly',
    },
  ];
}
