import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

export type Series = { id: string; label: string; color: string; dashed?: boolean; values: number[] };

type LineChartProps = {
  series: Series[];
  xLabels: string[];
  xTitle: string;
  yMin: number;
  yMax: number;
  yTicks: number[];
  format: (v: number) => string;
  /** index to mark (current week / current fleet size) */
  marker?: number;
  markerLabel?: string;
  /** a reference value drawn as a dotted rule, e.g. the coin-flip floor */
  floor?: { value: number; label: string };
  ariaLabel: string;
};

const H = 230;
const PH = H - 14 - 40;

/** Width of an element, kept current, so chart text stays at real pixel sizes on any screen. */
function useWidth(initial: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Line chart with a crosshair tooltip, direct labels and a table view. One y-axis, always. */
export function LineChart({ series, xLabels, xTitle, yMin, yMax, yTicks, format, marker, markerLabel, floor, ariaLabel }: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const tableId = useId();
  const [plotRef, W] = useWidth(520);
  const M = { top: 14, right: 140, bottom: 40, left: 40 };
  const PW = W - M.left - M.right;
  const n = xLabels.length;
  const x = (i: number) => M.left + (n === 1 ? PW / 2 : (i / (n - 1)) * PW);
  const y = (v: number) => M.top + (1 - (v - yMin) / (yMax - yMin)) * PH;

  const ends = useMemo(() => {
    // Direct labels at the line ends, nudged apart so they never collide.
    const items = series.map((s) => ({ id: s.id, label: s.label, color: s.color, value: s.values[n - 1], y: y(s.values[n - 1]) }));
    items.sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < 26) items[i].y = items[i - 1].y + 26;
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, n, yMin, yMax, W]);

  const active = hover ?? null;
  const tipLeft = active !== null ? (x(active) / W) * 100 : 0;

  return (
    <figure className="chart">
      <div className="chart-plot" ref={plotRef}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} aria-describedby={tableId}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + PW} y1={y(t)} y2={y(t)} className="grid" />
              <text x={M.left - 8} y={y(t)} className="tick" textAnchor="end" dominantBaseline="middle">
                {format(t)}
              </text>
            </g>
          ))}
          {xLabels.map((l, i) => (
            <text key={l} x={x(i)} y={M.top + PH + 16} className="tick" textAnchor="middle">
              {l}
            </text>
          ))}
          <text x={M.left + PW / 2} y={H - 4} className="axis-title" textAnchor="middle">
            {xTitle}
          </text>
          {floor && (
            <g>
              <line x1={M.left} x2={M.left + PW} y1={y(floor.value)} y2={y(floor.value)} className="floor" />
              <text x={M.left + 4} y={y(floor.value) - 5} className="tick">
                {floor.label}
              </text>
            </g>
          )}
          {marker !== undefined && (
            <g>
              <line x1={x(marker)} x2={x(marker)} y1={M.top} y2={M.top + PH} className="marker" />
              {markerLabel && (
                <text x={x(marker)} y={M.top - 3} className="marker-label" textAnchor={marker === n - 1 ? 'end' : marker === 0 ? 'start' : 'middle'}>
                  {markerLabel}
                </text>
              )}
            </g>
          )}
          {series.map((s) => (
            <g key={s.id}>
              <path
                d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={s.dashed ? '5 5' : undefined}
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={active === i || marker === i ? 4.5 : 3} fill={s.color} className="dot" />
              ))}
            </g>
          ))}
          {ends.map((e) => (
            <g key={e.id}>
              <line x1={M.left + PW + 8} x2={M.left + PW + 16} y1={e.y} y2={e.y} stroke={e.color} strokeWidth={2} />
              <text x={M.left + PW + 20} y={e.y} className="end-label" dominantBaseline="middle">
                <tspan className="end-value">{format(e.value)}</tspan>
                <tspan x={M.left + PW + 20} dy="13" className="end-name">
                  {e.label}
                </tspan>
              </text>
            </g>
          ))}
          {active !== null && <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + PH} className="crosshair" />}
          {xLabels.map((_, i) => {
            const half = n === 1 ? PW / 2 : PW / (n - 1) / 2;
            return (
              <rect
                key={i}
                x={x(i) - half}
                y={M.top}
                width={half * 2}
                height={PH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onTouchStart={() => setHover(i)}
              />
            );
          })}
        </svg>
        {active !== null && (
          <div className="tooltip" style={{ left: `${tipLeft}%` }} role="status">
            <div className="tooltip-title">
              {xTitle}: {xLabels[active]}
            </div>
            {series.map((s) => (
              <div key={s.id} className="tooltip-row">
                <span className="swatch" style={{ background: s.color }} />
                <span className="tooltip-name">{s.label}</span>
                <span className="tooltip-value">{format(s.values[active])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <figcaption className="legend">
        {series.map((s) => (
          <span key={s.id} className="legend-item">
            <svg width="22" height="8" aria-hidden="true">
              <line x1="1" x2="21" y1="4" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={s.dashed ? '4 3' : undefined} />
            </svg>
            {s.label}
          </span>
        ))}
      </figcaption>
      <details className="table-view" id={tableId}>
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{xTitle}</th>
              {series.map((s) => (
                <th key={s.id} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {xLabels.map((l, i) => (
              <tr key={l}>
                <th scope="row">{l}</th>
                {series.map((s) => (
                  <td key={s.id}>{format(s.values[i])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Two-week trend for one sensor; the last point is yesterday. */
export function Sparkline({ values, flares, label }: { values: number[]; flares: boolean[]; label: string }) {
  const w = 120;
  const h = 32;
  if (values.length < 2) return <svg width={w} height={h} aria-hidden="true" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const px = (i: number) => 3 + (i / (values.length - 1)) * (w - 6);
  const py = (v: number) => 4 + (1 - (v - min) / span) * (h - 10);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="spark">
      <path d={values.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join('')} className="spark-line" />
      {flares.map((f, i) => (f ? <circle key={i} cx={px(i)} cy={h - 2} r={2} className="spark-flare" /> : null))}
      <circle cx={px(values.length - 1)} cy={py(values[values.length - 1])} r={3} className="spark-end" />
    </svg>
  );
}
