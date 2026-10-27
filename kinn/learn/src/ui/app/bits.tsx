import type { ReactNode } from 'react';

/** The logo mark: the coin's ring with a teal tick at your line. */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" className="mark">
      <circle cx="60" cy="60" r="44" fill="none" stroke="var(--fg)" strokeWidth="9.7" />
      <line x1="84.7" y1="45.8" x2="111.5" y2="30.3" stroke="var(--ring)" strokeWidth="9.7" strokeLinecap="round" />
    </svg>
  );
}

export function Spark({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <svg width="64" height="24" aria-hidden="true" />;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const x = (i: number) => 2 + (i / (values.length - 1)) * 60;
  const y = (v: number) => 3 + (1 - (v - min) / span) * 18;
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" aria-hidden="true">
      <polyline points={values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="2.6" fill={color} />
    </svg>
  );
}

export function Back({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="back" onClick={onClick}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      <span className="row-value">{children}</span>
    </div>
  );
}

export const IconToday = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d="M6.3 17.7a8 8 0 1 1 11.4 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M12 12l3.5-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
export const IconLearned = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d="M4 17l5-6 4 3 4-6 3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IconYou = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
