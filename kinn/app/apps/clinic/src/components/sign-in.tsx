import { SIGN_IN_CODE_DIGITS } from '@reco/core'
import { useState } from 'react'

import wordmark from '../assets/reco-wordmark-ceramic.svg'
import { copy } from '../copy'
import { messageOf } from '../use-live'

interface SignInProps {
  /** Asks the server to email a code. A local server hands the code back instead. */
  readonly onStart: (email: string) => Promise<{ readonly devCode?: string }>
  readonly onVerify: (email: string, code: string) => Promise<void>
  /** Set once signed in with no name yet: the last step before the caseload. */
  readonly needsName: boolean
  readonly onName: (name: string) => Promise<void>
  readonly onSample: () => void
}

type Step = { readonly at: 'email' } | { readonly at: 'code'; readonly email: string; readonly devCode?: string }

const CODE_LENGTH = SIGN_IN_CODE_DIGITS

/** Email, then a one-time code, then (the first time) the name patients will see. No password to keep or lose. */
export function SignIn({ onStart, onVerify, needsName, onName, onSample }: SignInProps) {
  const [step, setStep] = useState<Step>({ at: 'email' })
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const run = async (work: () => Promise<void>) => {
    setBusy(true)
    setError(undefined)
    try {
      await work()
    } catch (e) {
      setError(messageOf(e))
    } finally {
      setBusy(false)
    }
  }
  const start = () => run(async () => {
    const sent = await onStart(email.trim())
    setCode('')
    setStep({ at: 'code', email: email.trim(), ...(sent.devCode !== undefined ? { devCode: sent.devCode } : {}) })
  })
  const verify = () => (step.at === 'code' ? run(() => onVerify(step.email, code.trim())) : undefined)
  const saveName = () => run(() => onName(name.trim()))

  return (
    <div className="app">
      <aside className="rail" aria-label={copy.forClinicians}>
        <img className="wordmark" src={wordmark} alt={copy.appName} width={86} height={26} />
        <div className="rail-head"><h2>{copy.forClinicians}</h2></div>
        <ul className="rail-pitch">
          {copy.railPitch.map((line) => <li key={line}>{line}</li>)}
        </ul>
        <div className="rail-foot">
          <button type="button" className="btn btn-rail" onClick={onSample}>{copy.lookAround}</button>
        </div>
      </aside>
      <main className="main gate">
        {needsName ? (
          <form className="gate-form" onSubmit={(e) => { e.preventDefault(); void saveName() }}>
            <h1>{copy.nameTitle}</h1>
            <p className="muted">{copy.nameLead}</p>
            <label className="field">
              <span>{copy.nameField}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.namePlaceholder} autoComplete="name" autoFocus required maxLength={120} />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="actions"><button type="submit" className="btn btn-primary" disabled={busy || name.trim() === ''}>{copy.save}</button></div>
          </form>
        ) : step.at === 'email' ? (
          <form className="gate-form" onSubmit={(e) => { e.preventDefault(); void start() }}>
            <h1>{copy.signInTitle}</h1>
            <p className="muted">{copy.signInLead}</p>
            <label className="field">
              <span>{copy.email}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus required />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="actions"><button type="submit" className="btn btn-primary" disabled={busy || email.trim() === ''}>{busy ? copy.sending : copy.sendCode}</button></div>
          </form>
        ) : (
          <form className="gate-form" onSubmit={(e) => { e.preventDefault(); void verify() }}>
            <h1>{copy.codeTitle}</h1>
            <p className="muted">{copy.codeLead(step.email)}</p>
            {step.devCode ? <p className="small dev-code">{copy.devCode(step.devCode)}</p> : null}
            <label className="field field-code">
              <span>{copy.code}</span>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))} inputMode="numeric" autoComplete="one-time-code" autoFocus required />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="actions">
              <button type="submit" className="btn btn-primary" disabled={busy || code.length !== CODE_LENGTH}>{busy ? copy.signingIn : copy.signIn}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setStep({ at: 'email' }); setError(undefined) }}>{copy.differentEmail}</button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
