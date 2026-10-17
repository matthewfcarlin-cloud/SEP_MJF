/**
 * The evening check-in: one tap, or a sentence. Claude turns a sentence into this shape
 * (api/checkin.ts); `readLocally` is the on-device fallback when Claude isn't reachable.
 * Only `feel` becomes a label for the model: a flare-up or not.
 */
export type Feel = 'good' | 'sore' | 'flare';

export type CheckIn = {
  feel: Feel;
  /** 0–10, if the person said or implied one */
  pain: number | null;
  /** what they were doing, in a few words */
  activity: string | null;
  /** one short sentence, in the person's own terms */
  summary: string;
  readBy: 'claude' | 'device' | 'tap';
};

export const FEEL_LABEL: Record<Feel, string> = { good: 'Felt good', sore: 'A bit sore', flare: 'Flare-up' };

/** Sore is normal in rehab; only a flare-up counts as "pushed too far". */
export const isFlare = (c: Pick<CheckIn, 'feel'>) => c.feel === 'flare';

export const CHECKIN_SCHEMA = {
  type: 'object',
  properties: {
    feel: { type: 'string', enum: ['good', 'sore', 'flare'] },
    pain: { type: ['integer', 'null'], minimum: 0, maximum: 10 },
    activity: { type: ['string', 'null'] },
    summary: { type: 'string' },
  },
  required: ['feel', 'pain', 'activity', 'summary'],
  additionalProperties: false,
} as const;

/** Checks an answer from the API before the app trusts it. */
export function parseCheckIn(raw: unknown, readBy: CheckIn['readBy']): CheckIn | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.feel !== 'good' && r.feel !== 'sore' && r.feel !== 'flare') return null;
  const pain = typeof r.pain === 'number' && Number.isFinite(r.pain) ? Math.max(0, Math.min(10, Math.round(r.pain))) : null;
  const activity = typeof r.activity === 'string' && r.activity.trim() ? r.activity.trim().slice(0, 60) : null;
  const summary = typeof r.summary === 'string' ? r.summary.trim().slice(0, 160) : '';
  return { feel: r.feel, pain, activity, summary: summary || FEEL_LABEL[r.feel], readBy };
}

const FLARE_WORDS = /\b(flare|swoll|swell|puff|throb|sharp|gave way|buckl|locked|couldn'?t|can'?t (bend|walk|sleep)|ice[d ]|limp)/i;
const SORE_WORDS = /\b(sore|ache|achy|stiff|tight|tired|twinge|a bit)/i;
const ACTIVITIES = ['soccer', 'run', 'jog', 'squat', 'stairs', 'walk', 'bike', 'cycling', 'gym', 'lunges', 'hike', 'work', 'pt'];

/** A rough reading on the device: keywords, a pain number if there is one. */
export function readLocally(text: string): CheckIn {
  const t = text.trim();
  const painMatch = t.match(/\b(10|[0-9])\s*(\/\s*10|out of 10)/i);
  const pain = painMatch ? Number(painMatch[1]) : null;
  const feel: Feel = FLARE_WORDS.test(t) || (pain !== null && pain >= 6) ? 'flare' : SORE_WORDS.test(t) || (pain !== null && pain >= 3) ? 'sore' : 'good';
  const activity = ACTIVITIES.find((a) => new RegExp(`\\b${a}`, 'i').test(t)) ?? null;
  return { feel, pain, activity, summary: t.slice(0, 160) || FEEL_LABEL[feel], readBy: 'device' };
}

/** Asks Claude through the app's server; falls back to the device reading on any failure. */
export async function readCheckIn(text: string, fetcher: typeof fetch = fetch): Promise<CheckIn> {
  try {
    const res = await fetcher('/api/checkin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const parsed = parseCheckIn(await res.json(), 'claude');
    if (parsed) return parsed;
  } catch {
    // Not deployed with a key, offline, or slow: the device reading still works.
  }
  return readLocally(text);
}
