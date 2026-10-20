/** Knee-bend dial: the safe arc up to your line, and a needle for the current bend. */
const MIN = 0;
const MAX = 150;
const R = 96;
const CX = 120;
const CY = 112;

const angle = (deg: number) => Math.PI * (1 - (Math.min(MAX, Math.max(MIN, deg)) - MIN) / (MAX - MIN));
const point = (deg: number, r = R) => [CX + r * Math.cos(angle(deg)), CY - r * Math.sin(angle(deg))] as const;

function arc(from: number, to: number, r = R) {
  const [x1, y1] = point(from, r);
  const [x2, y2] = point(to, r);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

export function Gauge({ line, value, past }: { line: number | null; value: number | null; past: boolean }) {
  const [lx1, ly1] = point(line ?? 0, R - 14);
  const [lx2, ly2] = point(line ?? 0, R + 10);
  const [nx, ny] = point(value ?? 0, R - 22);
  return (
    <svg viewBox="-8 -14 256 140" className="gauge" role="img" aria-label={line ? `Your line is ${line} degrees` : 'No line yet'}>
      <path d={arc(MIN, MAX)} className="gauge-track" />
      {line !== null && <path d={arc(MIN, line)} className="gauge-safe" />}
      {line !== null && <path d={arc(line, MAX)} className="gauge-over" />}
      {[0, 30, 60, 90, 120, 150].map((t) => {
        const [x, y] = point(t, R + 22);
        return (
          <text key={t} x={x} y={y} className="gauge-tick" textAnchor="middle" dominantBaseline="middle">
            {t}°
          </text>
        );
      })}
      {line !== null && <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} className="gauge-line" />}
      {value !== null && (
        <g className={past ? 'gauge-needle past' : 'gauge-needle'}>
          <line x1={CX} y1={CY} x2={nx} y2={ny} />
          <circle cx={CX} cy={CY} r={5} />
        </g>
      )}
    </svg>
  );
}
