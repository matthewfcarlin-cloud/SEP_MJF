/** Words for the morning call. Every number comes from the model's morning state. */
import type { Call, Morning } from './hero';

export const CALL_WORD: Record<Call, string> = { push: 'Push', ease: 'Ease off', rest: 'Rest', learning: 'Learning you' };

export function callReason(m: Morning): string {
  const line = m.line !== null ? `${m.line}°` : null;
  switch (m.call) {
    case 'learning':
      return 'Kinn needs a few days with you before it can tell you how hard to push.';
    case 'rest':
      return m.flaredYesterday
        ? 'Yesterday flared. Give the knee a light day and it will be back sooner.'
        : 'Your recent days are running hot. Keep today easy.';
    case 'ease':
      if (m.day === 1) return line ? `Early days for a knee like yours. Keep bends under ${line} while Kinn gets to know you.` : 'Early days. Keep it moderate.';
      return line
        ? `Days like your recent ones sometimes flared. Keep bends under ${line} and stop when your quad tires.`
        : 'Days like your recent ones sometimes flared. Keep it moderate.';
    case 'push':
      if (m.day === 1) return line ? `Knees like yours usually handle a normal day well. Work up to ${line}.` : 'Knees like yours usually handle a normal day well.';
      return line ? `Your knee has handled days like this well. Work up to ${line}.` : 'Your knee has handled days like this well.';
  }
}

export const pct = (v: number) => `${Math.round(v * 100)}%`;
export const count = (n: number) => n.toLocaleString('en-US');
