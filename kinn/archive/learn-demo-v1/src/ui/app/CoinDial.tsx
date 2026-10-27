import { useEffect, useState } from 'react';
import type { Call } from '../../engine/hero';
import { CALL_WORD } from '../../engine/advice';
import { coinSnapshot } from './coin3d';

/**
 * The Today dial is the coin itself, seen from above, with its light ring as the gauge: 0–150°
 * of knee bend around a 270° arc of light segments. Segments up to your line glow in the call's
 * colour; past the line they're dark; a white tick marks the line (the logo's tick).
 * With `live`, segments light up to the knee's bend right now.
 */
const START = 225;
const SWEEP = 270;
const MAX = 150;
const SEGMENTS = 54;

export function CoinDial({ call, line, live = null, size = 250 }: { call: Call; line: number | null; live?: number | null; size?: number }) {
  const [img, setImg] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    // Rendering the snapshot takes a frame or two; do it after first paint.
    const id = requestAnimationFrame(() => setImg(coinSnapshot(Math.round(size * 1.3))));
    return () => cancelAnimationFrame(id);
  }, [size]);

  const C = size / 2;
  const rOuter = size * 0.47;
  const rInner = size * 0.4;
  const coinD = size * 0.62;
  const pt = (deg: number, r: number) => {
    const a = ((START - (deg / MAX) * SWEEP) * Math.PI) / 180;
    return [C + r * Math.cos(a), C - r * Math.sin(a)] as const;
  };
  const learning = call === 'learning' || line === null;
  const lit = live !== null ? live : learning ? 0 : line!;
  const past = live !== null && line !== null && live > line;

  const segs = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const deg = (i / SEGMENTS) * MAX;
    const [x1, y1] = pt(deg, rInner);
    const [x2, y2] = pt(deg, rOuter);
    let cls = 'seg';
    if (deg <= lit) cls += live !== null ? (line !== null && deg > line ? ' on call-rest' : ' on live') : ` on call-${call}`;
    else if (line !== null && deg > line) cls += ' over';
    return <line key={i} className={cls} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
  const tick = line !== null ? [pt(line, rInner - size * 0.035), pt(line, rOuter + size * 0.035)] : null;
  const glow = live !== null ? (past ? 'rest' : 'live') : call;

  return (
    <div className={`coin-dial glow-${glow}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <g strokeLinecap="round" strokeWidth={size * 0.016}>
          {segs}
        </g>
        {tick && <line className="dial-tick" x1={tick[0][0]} y1={tick[0][1]} x2={tick[1][0]} y2={tick[1][1]} strokeWidth={size * 0.022} strokeLinecap="round" />}
      </svg>
      <div className="dial-coin" style={{ width: coinD, height: coinD }}>
        {img ? <img src={img} alt="" width={coinD} height={coinD} /> : <span className="flat-coin" />}
        <div className="dial-face">
          {learning && live === null ? (
            <span className="dial-label">No line yet</span>
          ) : (
            <>
              <span className="dial-num" style={{ fontSize: size * 0.17 }}>
                {live ?? line}°
              </span>
              <span className="dial-label">{live !== null ? (past ? 'Past your line' : 'Bend now') : 'Your line'}</span>
            </>
          )}
        </div>
      </div>
      <span className={`dial-call ${live !== null ? (past ? 'call-rest' : '') : `call-${call}`}`}>
        <CallShape call={live !== null ? (past ? 'rest' : 'push') : call} />
        {live !== null ? (past ? 'Ease off' : 'Live') : CALL_WORD[call]}
      </span>
    </div>
  );
}

/** Every call carries a shape as well as a colour: up-chevron, level bar, filled dot, dotted ring. */
export function CallShape({ call }: { call: Call }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="call-shape">
      {call === 'push' && <path d="M3.5 10.5 8 6l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
      {call === 'ease' && <rect x="2.5" y="6.5" width="11" height="3" rx="1.5" fill="currentColor" />}
      {call === 'rest' && <circle cx="8" cy="8" r="4.5" fill="currentColor" />}
      {call === 'learning' && <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1.5 2.6" strokeLinecap="round" />}
    </svg>
  );
}
