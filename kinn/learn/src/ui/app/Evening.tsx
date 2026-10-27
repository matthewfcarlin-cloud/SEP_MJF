import { useState } from 'react';
import { CALL_WORD } from '../../engine/advice';
import { FEEL_LABEL, type CheckIn, type Feel } from '../../engine/checkin';
import type { Morning } from '../../engine/hero';
import { Back } from './bits';

/** `other`: tomorrow if the answer had been the opposite. `risk`: the chance Kinn gave the day that morning. */
export type CheckInResult = { day: number; checkin: CheckIn; after: Morning; other: Morning; risk: number };

export function CheckInScreen({
  day,
  onCheckIn,
  onBack,
}: {
  day: number;
  onCheckIn: (input: { feel: Feel } | { text: string }) => Promise<void>;
  onBack: () => void;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (input: { feel: Feel } | { text: string }) => {
    setBusy(true);
    try {
      await onCheckIn(input);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="screen">
      <Back label="Today" onClick={onBack} />
      <p className="eyebrow">Tonight · Day {day}</p>
      <h2 className="headline">How did your knee feel today?</h2>
      <div className="feel-buttons">
        {(['good', 'sore', 'flare'] as Feel[]).map((f) => (
          <button key={f} type="button" className={`feel feel-${f}`} disabled={busy} onClick={() => submit({ feel: f })}>
            <span className="feel-dot" aria-hidden="true" />
            {FEEL_LABEL[f]}
          </button>
        ))}
      </div>
      <form
        className="say-it"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) submit({ text });
        }}
      >
        <label htmlFor="say" className="label">
          Or say it
        </label>
        <textarea
          id="say"
          rows={3}
          maxLength={600}
          value={text}
          placeholder="Swelled a bit after practice, maybe 5/10"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn" disabled={busy || !text.trim()}>
          {busy ? 'Reading…' : 'Send'}
        </button>
      </form>
      <p className="fine">Sore is normal in rehab. Only a flare-up tells Kinn you pushed too far.</p>
    </div>
  );
}

export function CheckInDone({ result, onNextDay }: { result: CheckInResult; onNextDay: () => void }) {
  const { checkin, after, other, risk } = result;
  const flare = checkin.feel === 'flare';
  const otherLabel = flare ? FEEL_LABEL.good : FEEL_LABEL.flare;
  const rows: { label: string; other: string; yours: string; call?: Morning['call'] }[] = [
    { label: 'Tomorrow', other: CALL_WORD[other.call], yours: CALL_WORD[after.call], call: after.call },
    { label: 'Your line', other: other.line !== null ? `${other.line}°` : '—', yours: after.line !== null ? `${after.line}°` : '—' },
    { label: 'Fatigue cap', other: other.fatigueCap !== null ? `${other.fatigueCap}%` : '—', yours: after.fatigueCap !== null ? `${after.fatigueCap}%` : '—' },
  ];
  return (
    <div className="screen">
      <p className="eyebrow">
        Checked in · {FEEL_LABEL[checkin.feel]}
        {checkin.pain !== null ? ` · pain ${checkin.pain}/10` : ''}
      </p>
      <h2 className="headline">Got it. Tomorrow’s plan is updated.</h2>
      {checkin.readBy !== 'tap' && (
        <p className="body muted">
          “{checkin.summary}” <span className="chip">{checkin.readBy === 'claude' ? 'Read by Claude' : 'Read on device'}</span>
        </p>
      )}
      <section className="card">
        <p className="label">What your answer changed</p>
        <div className="diff-row diff-head">
          <span />
          <span>If “{otherLabel}”</span>
          <span>You said</span>
        </div>
        {rows.map((r) => (
          <div key={r.label} className="diff-row">
            <span className="muted">{r.label}</span>
            <span className="diff-other">{r.other}</span>
            <span className={`diff-yours${r.other === r.yours ? '' : ' changed'}${r.call ? ` call-${r.call}` : ''}`}>{r.yours}</span>
          </div>
        ))}
      </section>
      <p className="caption">This morning Kinn gave today a {Math.round(risk * 100)}% chance of a flare-up.</p>
      <p className="fine">Tonight your phone shares a model update with the fleet: a few dozen numbers, never your readings or words.</p>
      <button type="button" className="btn" onClick={onNextDay}>
        See tomorrow
      </button>
    </div>
  );
}
