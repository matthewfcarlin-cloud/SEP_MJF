import type { StatusResult } from './status'

const LEAD: Record<StatusResult['because'], string> = {
  'morning-pain-high': 'Pain was up this morning.',
  'swelling-a-lot': 'The knee is swollen this morning.',
  'did-not-settle': 'Last night’s pain hadn’t settled by this morning.',
  'morning-pain-some': 'A little pain this morning.',
  'swelling-some': 'Some swelling this morning.',
  'load-spike': 'Yesterday was a lot more than your usual.',
  'no-check-in': 'No check-in yet today.',
  'all-clear': 'The knee settled overnight.',
}

const ACTION: Record<StatusResult['status'], string> = {
  'keep-going': 'A good day for your strength set or a full practice.',
  steady: 'Move normally, skip the extras, and see how it feels tomorrow morning.',
  'ease-off': 'Keep today light: walking, the bike and your PT mobility work.',
}

/** One suggestion for the day: what we noticed, then what to do with it. Observations only. */
export function suggestionFor(result: StatusResult): string {
  return `${LEAD[result.because]} ${ACTION[result.status]}`
}
