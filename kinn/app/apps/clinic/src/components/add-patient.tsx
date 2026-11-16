import { localDateKey } from '@reco/core'
import type { InviteView } from '@reco/core'
import { useEffect, useRef, useState } from 'react'

import { copy } from '../copy'
import { shortDate } from '../format'
import { spacedCode } from '../live'
import { messageOf } from '../use-live'

interface AddPatientProps {
  readonly onCreate: () => Promise<InviteView>
  readonly onClose: () => void
  /** Shown as the page when the caseload is empty, where there is nothing to go back to. */
  readonly empty: boolean
}

/** Adding a patient is giving them a code. The patient does the rest, and decides what is shared. */
export function AddPatient({ onCreate, onClose, empty }: AddPatientProps) {
  const [invite, setInvite] = useState<InviteView | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const make = async () => {
    setBusy(true)
    setError(undefined)
    setCopied(false)
    try {
      setInvite(await onCreate())
    } catch (e) {
      setError(messageOf(e))
    } finally {
      setBusy(false)
    }
  }
  // The button that made the code is replaced by the code, so focus goes to the code's heading.
  const codeHeading = useRef<HTMLHeadingElement>(null)
  const code = invite?.code
  useEffect(() => {
    if (code) codeHeading.current?.focus()
  }, [code])

  const copyCode = async () => {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.code)
      setCopied(true)
    } catch (e) {
      console.warn('RECO: the code could not be copied; it can still be read off the page.', e)
    }
  }

  return (
    <article className="main" aria-labelledby="add-title">
      {empty ? null : <button type="button" className="btn btn-ghost back" onClick={onClose}>{copy.backToList}</button>}
      <header className="patient-head">
        <h1 id="add-title" tabIndex={-1}>{empty ? copy.emptyTitle : copy.addTitle}</h1>
      </header>
      <div className="add">
        <p className="headline">{empty ? copy.emptyLead : copy.addLead}</p>
        <ol className="steps">
          {copy.addSteps.map((step, i) => (
            <li key={step}><span className="num step-n">{i + 1}</span><span>{step}</span></li>
          ))}
        </ol>
        {invite ? (
          <section className="code-card" aria-labelledby="code-title">
            <h2 id="code-title" ref={codeHeading} tabIndex={-1}>{copy.codeReady}</h2>
            <p className="code">{spacedCode(invite.code)}</p>
            <p className="small muted">{copy.codeExpires(shortDate(localDateKey(Date.parse(invite.expiresAt))))}</p>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={() => void copyCode()}>{copied ? copy.copied : copy.copyCode}</button>
              <button type="button" className="btn btn-secondary" onClick={() => void make()} disabled={busy}>{copy.anotherCode}</button>
            </div>
          </section>
        ) : (
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => void make()} disabled={busy}>{busy ? copy.makingCode : copy.makeCode}</button>
          </div>
        )}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div>
    </article>
  )
}
