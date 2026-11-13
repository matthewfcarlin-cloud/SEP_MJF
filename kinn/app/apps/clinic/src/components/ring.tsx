/** The RECO arc: a faint track with a live-teal arc clockwise from 12, met over required. */
interface RingProps {
  readonly met: number
  readonly required: number
  readonly size: number
  readonly label: string
}

const STROKE_RATIO = 0.09

export function Ring({ met, required, size, label }: RingProps) {
  const stroke = Math.max(3, Math.round(size * STROKE_RATIO))
  const r = size / 2 - stroke
  const c = 2 * Math.PI * r
  const fraction = required > 0 ? Math.min(1, met / required) : 0
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="ring-track" strokeWidth={stroke} />
      {fraction > 0 ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="ring-arc"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * fraction} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text" fontSize={size * 0.26}>
        {`${met}/${required}`}
      </text>
    </svg>
  )
}
