import type { Call } from '../../engine/hero';
import { CALL_WORD } from '../../engine/advice';

/**
 * The Today ring: a 270° dial for 0–150° of knee bend, drawn as the coin's ring. Up to your
 * line it takes the call's colour; past it, coral. A teal tick marks the line, like the logo.
 * With `live`, it fills to the knee's bend right now instead.
 */
const START = 225;
const SWEEP = 270;
const MAX = 150;

export function Ring({
  call,
  line,
  live = null,
  size = 200,
  label = 'Your line',
  draw = false,
}: {
  call: Call;
  line: number | null;
  live?: number | null;
  size?: number;
  label?: string;
  /** draw the arc in on mount (the connect moment) */
  draw?: boolean;
}) {
  const R = size * 0.42;
  const SW = size * 0.07;
  const C = size / 2;
  const pt = (deg: number, r = R) => {
    const a = ((START - (Math.min(MAX, Math.max(0, deg)) / MAX) * SWEEP) * Math.PI) / 180;
    return [C + r * Math.cos(a), C - r * Math.sin(a)] as const;
  };
  const arc = (a: number, b: number) => {
    const [x1, y1] = pt(a);
    const [x2, y2] = pt(b);
    const large = ((b - a) / MAX) * SWEEP > 180 ? 1 : 0;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${R.toFixed(1)},${R.toFixed(1)} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  };
  const learning = call === 'learning' || line === null;
  const past = live !== null && line !== null && live > line;
  const tick = line !== null ? [pt(line, R - SW * 1.1), pt(line, R + SW * 1.1)] : null;
  const word = live !== null ? (past ? 'Past line' : 'Bend now') : CALL_WORD[call];
  const wordClass = live !== null ? (past ? 'call-rest' : 'call-push') : `call-${call}`;

  return (
    <div className={`ring${draw ? ' draw' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none" strokeLinecap="round" aria-hidden="true">
        <path d={arc(0, MAX)} className="ring-track" strokeWidth={SW} strokeDasharray={learning && live === null ? `1 ${SW * 0.9}` : undefined} />
        {live !== null ? (
          <>
            {live > 0 && <path d={arc(0, line !== null ? Math.min(live, line) : live)} className="ring-arc call-push" strokeWidth={SW} />}
            {past && <path d={arc(line!, live)} className="ring-arc call-rest" strokeWidth={SW} />}
          </>
        ) : (
          !learning && (
            <>
              <path d={arc(0, line!)} className={`ring-arc call-${call}`} strokeWidth={SW} pathLength={1} />
              <path d={arc(line!, MAX)} className="ring-over" strokeWidth={SW} />
            </>
          )
        )}
        {tick && (
          <line className="ring-tick" x1={tick[0][0]} y1={tick[0][1]} x2={tick[1][0]} y2={tick[1][1]} strokeWidth={SW * 0.42} />
        )}
      </svg>
      <div className="ring-center">
        <span className={`ring-word ${wordClass}`} style={{ fontSize: size * 0.12 }}>
          {word}
        </span>
        {live !== null ? (
          <span className="ring-num" style={{ fontSize: size * 0.3 }}>
            {live}°
          </span>
        ) : learning ? (
          <span className="ring-label">No line yet</span>
        ) : (
          <span className="ring-num" style={{ fontSize: size * 0.3 }}>
            {line}°
          </span>
        )}
        {!learning && <span className="ring-label">{live !== null && line !== null ? `Line ${line}°` : label}</span>}
      </div>
    </div>
  );
}
