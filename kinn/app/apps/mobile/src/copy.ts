/**
 * Every athlete-facing string on a screen. Core generates status, suggestion,
 * insight and report text; this file has the rest. Checked against the
 * banned-words list in core by the copy test.
 */
import type { Status } from '@kinn/core'

export const copy = {
  appName: 'Kinn',
  sampleData: 'Sample data',
  viaTape: 'via Kinn tape',
  tabs: { today: 'Today', log: 'Log', insights: 'Insights', progress: 'Progress', report: 'Report' },

  status: {
    'keep-going': 'Keep going',
    steady: 'Steady',
    'ease-off': 'Ease off',
  } satisfies Record<Status, string>,

  today: {
    greeting: (name: string) => `Hi ${name}`,
    weekLabel: (weeks: number) => `Week ${Math.floor(weeks)} of your comeback`,
    progressLabel: 'Recovery progress',
    todayLabel: 'Today',
    suggestionLabel: 'One thing for today',
    loadLabel: 'Knee load',
    loadHint: (score: number, baseline: number) =>
      baseline > 0 ? `${score} today · usual ${Math.round(baseline)}` : `${score} today`,
    painButton: 'Log pain',
    painButtonHint: 'One tap when something hurts',
    checkInPrompt: 'How does the knee feel this morning?',
    checkInAction: 'Morning check-in',
    settlePrompt: 'Yesterday you logged pain. Did it settle overnight?',
    settleAction: 'Answer',
    logToday: 'Log today’s activity',
    ptReminder: 'Your PT plan reminder is on',
  },

  pain: {
    title: 'How much does it hurt?',
    scaleLow: 'None',
    scaleHigh: 'Worst',
    doingTitle: 'What were you doing?',
    doingOptional: 'Optional',
    save: 'Save',
    saved: 'Logged. We’ll ask tomorrow morning if it settled.',
    settleTitle: 'Did it settle?',
    settleBody: (pain: number) => `Last night you logged pain at ${pain}. How is it this morning?`,
    settle: { yes: 'Yes, settled', 'a-bit': 'A bit', no: 'No' },
    notificationTitle: 'Did it settle?',
    notificationBody: 'You logged pain yesterday. How is the knee this morning?',
  },

  doing: {
    practice: 'Practice',
    game: 'Game',
    gym: 'Gym',
    pt: 'PT',
    walking: 'Walking',
    stairs: 'Stairs',
    rest: 'Resting',
    other: 'Other',
  },

  log: {
    title: 'Daily log',
    autoBanner: 'Automatic with the Kinn tape',
    autoBody: 'For now, tap what you did. The tape will log it for you.',
    activityTitle: 'What did you do today?',
    intensityTitle: 'How hard?',
    intensity: { light: 'Light', moderate: 'Moderate', hard: 'Hard' },
    save: 'Add to today',
    saved: 'Added',
    todaySoFar: 'Today so far',
    nothingYet: 'Nothing logged yet today',
    activity: { practice: 'Practice', game: 'Game', gym: 'Gym', pt: 'PT', walking: 'Walking / stairs', rest: 'Rest' },
  },

  checkIn: {
    title: 'Morning check-in',
    painTitle: 'Pain right now',
    swellingTitle: 'Swelling',
    swelling: { none: 'None', some: 'Some', 'a-lot': 'A lot' },
    swellingHint: { none: 'Looks like the other knee', some: 'Puffy around the kneecap', 'a-lot': 'Visibly swollen, tight to bend' },
    save: 'Set today’s status',
  },

  insights: {
    title: 'Insights',
    subtitle: 'What tends to come before a flare-up',
    flareCount: (n: number) => (n === 1 ? '1 flare-up in the last 30 days' : `${n} flare-ups in the last 30 days`),
    empty: 'Not enough flare-ups yet to see a pattern. That’s a good thing.',
    observationNote: 'These are things that happened before, not causes.',
    flareListTitle: 'Flare-up mornings',
  },

  progress: {
    title: 'Progress',
    subtitle: 'Bend and straighten, every day',
    extension: 'Straightening',
    flexion: 'Bend',
    extensionValue: (deficit: number) => (deficit <= 2 ? 'Fully straight' : `${deficit}° short`),
    flexionValue: (deg: number) => `${deg}°`,
    milestones: 'Milestones',
    loadTitle: 'Knee load, last 3 weeks',
  },

  report: {
    title: 'Weekly report',
    subtitle: 'Share with your PT',
    share: 'Share with PT',
    loadTitle: 'Daily knee load',
    flaresTitle: 'Flare-up mornings',
    sessionsTitle: 'Sessions recorded',
    rangeTitle: 'Range this week',
    none: 'None',
  },

  onboarding: {
    title: 'Let’s set up your comeback',
    injury: 'What happened?',
    injuries: { acl: 'ACL', meniscus: 'Meniscus', other: 'Other knee injury' },
    date: 'When? (injury or surgery date)',
    surgery: 'Did you have surgery?',
    sport: 'Your sport',
    hasPt: 'Are you seeing a PT?',
    goal: 'What are you coming back to?',
    goalPlaceholder: 'Back to basketball',
    yes: 'Yes',
    no: 'No',
    start: 'Start',
    useSample: 'Use the sample athlete instead',
  },

  settings: {
    title: 'Settings',
    ptReminder: 'Remind me of my PT’s plan',
    ptReminderBody: 'A daily nudge to do the exercises your PT gave you. Kinn doesn’t prescribe exercises.',
    resetSample: 'Reset to sample data',
  },

  disclaimerShort: 'Not a medical device.',
} as const
