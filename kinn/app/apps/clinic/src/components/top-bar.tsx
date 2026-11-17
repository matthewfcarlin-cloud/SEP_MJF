import wordmark from '../assets/reco-wordmark-ink.svg'
import type { ClinicChrome } from '../chrome'
import { copy } from '../copy'
import { LIST_HREF } from '../use-selection'

/** The bar on every page: where you are, whose patients these are, and the way out. */
export function TopBar({ chrome }: { readonly chrome: ClinicChrome }) {
  const live = chrome.mode === 'live'
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href={LIST_HREF}>
          <img src={wordmark} alt={copy.appName} width={66} height={20} />
          <span className="brand-sub">{copy.forClinicians}</span>
        </a>
        <div className="topbar-right">
          {live ? (
            <>
              <span className="topbar-user">{copy.signedInAs(chrome.accountName ?? '')}</span>
              <button type="button" className="btn btn-secondary btn-small" onClick={chrome.onSignOut}>{copy.signOut}</button>
            </>
          ) : (
            <>
              <span className="tag tag-note">{copy.sampleTag}</span>
              {chrome.onSignIn ? <button type="button" className="btn btn-secondary btn-small" onClick={chrome.onSignIn}>{copy.backToSignIn}</button> : null}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
