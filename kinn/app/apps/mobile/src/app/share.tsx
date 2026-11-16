import { ApiError, DEFAULT_SHARE_SCOPES, localDateKey, SHARE_SCOPES, SIGN_IN_CODE_DIGITS } from '@reco/core'
import type { AccessEntry, ApiClient, InvitePreview, ShareScope, ShareView } from '@reco/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Switch, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { shortDate } from '@/format'
import { useStore } from '@/store/provider'
import { clearToken, loadToken, phoneApi, saveToken, sharingAvailable } from '@/sync/session'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const t = copy.sharing
const CODE_LENGTH = SIGN_IN_CODE_DIGITS
const messageOf = (error: unknown): string => (error instanceof Error ? error.message : t.unavailable)

/**
 * Runs requests with a busy flag and a visible error, so no button fails silently. Busy counts
 * what is in flight, so one request finishing doesn't re-enable buttons while another is still out.
 * A session the server no longer accepts goes to `onSessionEnded` instead of showing an error.
 */
function useRun(onSessionEnded?: () => void) {
  const [inFlight, setInFlight] = useState(0)
  const [error, setError] = useState<string | undefined>(undefined)
  const run = useCallback(async (work: () => Promise<void>) => {
    setInFlight((n) => n + 1)
    setError(undefined)
    try {
      await work()
    } catch (e) {
      if (onSessionEnded && e instanceof ApiError && e.status === 401) onSessionEnded()
      else setError(messageOf(e))
    } finally {
      setInFlight((n) => n - 1)
    }
  }, [onSessionEnded])
  return { busy: inFlight > 0, error, run }
}

function ErrorLine({ error }: { readonly error: string | undefined }) {
  return error ? <Txt color="warn">{error}</Txt> : null
}

/** Before anything is turned on: what sharing means, then an email and a one-time code. */
function SignInCard() {
  const { state, setSync } = useStore()
  const { busy, error, run } = useRun()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<{ email: string; devCode?: string } | undefined>(undefined)
  const [code, setCode] = useState('')

  const send = () => run(async () => {
    const address = email.trim().toLowerCase()
    const { devCode } = await phoneApi().startSignIn(address, 'patient')
    setCode('')
    setSentTo({ email: address, ...(devCode !== undefined ? { devCode } : {}) })
  })
  const verify = () => run(async () => {
    if (!sentTo) return
    const { token, account } = await phoneApi().verifySignIn({ email: sentTo.email, code, role: 'patient', name: state.data.profile.name })
    await saveToken(token)
    setSync({ account: { id: account.id, email: account.email, name: account.name }, revision: 0 })
  })

  return (
    <>
      <Card>
        <Txt kind="title" style={{ fontSize: 22, lineHeight: 28 }}>{t.introTitle}</Txt>
        {t.introPoints.map((p) => (
          <View key={p.title} style={{ gap: 2 }}>
            <Txt kind="bodyStrong">{p.title}</Txt>
            <Txt color="textSecondary">{p.body}</Txt>
          </View>
        ))}
      </Card>
      <Card>
        {sentTo ? (
          <>
            <Field label={t.codeLabel(sentTo.email)} value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, CODE_LENGTH))} keyboardType="number-pad" textContentType="oneTimeCode" autoFocus />
            {sentTo.devCode ? <Txt kind="small" color="textMuted">{t.devCode(sentTo.devCode)}</Txt> : null}
            <ErrorLine error={error} />
            <Button label={busy ? t.working : t.signIn} onPress={() => void verify()} disabled={busy || code.length !== CODE_LENGTH} />
            <Button label={t.otherEmail} variant="ghost" onPress={() => setSentTo(undefined)} disabled={busy} />
          </>
        ) : (
          <>
            <Field label={t.email} value={email} onChangeText={setEmail} placeholder={t.emailPlaceholder} keyboardType="email-address" textContentType="emailAddress" autoCapitalize="none" autoCorrect={false} />
            <Txt kind="small" color="textMuted">{t.emailNote}</Txt>
            <ErrorLine error={error} />
            <Button label={busy ? t.working : t.sendCode} onPress={() => void send()} disabled={busy || !email.includes('@')} />
          </>
        )}
      </Card>
    </>
  )
}

function ScopePicker({ scopes, onChange, disabled = false }: { readonly scopes: readonly ShareScope[]; readonly onChange: (next: readonly ShareScope[]) => void; readonly disabled?: boolean }) {
  const colors = useColors()
  return (
    <View>
      {SHARE_SCOPES.map((scope, i) => {
        const on = scopes.includes(scope)
        return (
          <ListRow
            key={scope}
            first={i === 0}
            title={t.scopes[scope].title}
            sub={t.scopes[scope].body}
            right={<Switch value={on} disabled={disabled} trackColor={{ true: colors.accent }} accessibilityLabel={t.scopes[scope].title} onValueChange={(next) => onChange(next ? [...scopes, scope] : scopes.filter((s) => s !== scope))} />}
          />
        )
      })}
    </View>
  )
}

/** Type the PT's code, see who it is, choose what goes, then agree. Nothing is shared before the last step. */
function AddPt({ api, onAdded, onSessionEnded }: { readonly api: ApiClient; readonly onAdded: (share: ShareView) => void; readonly onSessionEnded: () => void }) {
  const { busy, error, run } = useRun(onSessionEnded)
  const [code, setCode] = useState('')
  const [preview, setPreview] = useState<InvitePreview | undefined>(undefined)
  const [scopes, setScopes] = useState<readonly ShareScope[]>(DEFAULT_SHARE_SCOPES)

  const find = () => run(async () => setPreview(await api.previewInvite(code)))
  const share = () => run(async () => {
    onAdded(await api.acceptInvite(code, scopes))
    setPreview(undefined)
    setCode('')
    // The next PT starts from the defaults, not from what was chosen for this one.
    setScopes(DEFAULT_SHARE_SCOPES)
  })

  if (preview) {
    return (
      <Card>
        <View style={{ gap: 2 }}>
          <Txt kind="title" style={{ fontSize: 22, lineHeight: 28 }}>{t.confirmTitle(preview.pt.name)}</Txt>
          <Txt color="textSecondary">{t.confirmSub(preview.pt.email)}</Txt>
        </View>
        <View style={{ gap: 2 }}>
          <SectionLabel>{t.always}</SectionLabel>
          <Txt color="textSecondary">{t.alwaysBody}</Txt>
        </View>
        <SectionLabel>{t.choose}</SectionLabel>
        <ScopePicker scopes={scopes} onChange={setScopes} disabled={busy} />
        <Txt kind="small" color="textMuted">{t.never}</Txt>
        <ErrorLine error={error} />
        <Button label={busy ? t.working : t.shareNow} onPress={() => void share()} disabled={busy} />
        <Button label={t.cancel} variant="ghost" onPress={() => setPreview(undefined)} disabled={busy} />
      </Card>
    )
  }
  return (
    <Card>
      <Txt kind="bodyStrong">{t.codeTitle}</Txt>
      <Txt color="textSecondary">{t.codeBody}</Txt>
      <Field label={t.codeField} value={code} onChangeText={(v) => setCode(v.toUpperCase())} placeholder={t.codePlaceholder} autoCapitalize="characters" autoCorrect={false} />
      <ErrorLine error={error} />
      <Button label={busy ? t.working : t.findPt} onPress={() => void find()} disabled={busy || code.replace(/[^A-Za-z0-9]/g, '').length < 8} />
    </Card>
  )
}

/** Signed in: who can see the record and what, who looked, and the ways out. */
function Sharing({ api }: { readonly api: ApiClient }) {
  const { sync, setSync } = useStore()
  const [shares, setShares] = useState<readonly ShareView[] | undefined>(undefined)
  const [log, setLog] = useState<readonly AccessEntry[]>([])
  const [notice, setNotice] = useState<string | undefined>(undefined)

  const signedOut = useCallback(() => {
    void clearToken().finally(() => setSync(undefined))
  }, [setSync])
  const { busy, error, run } = useRun(signedOut)

  useEffect(() => {
    void run(async () => {
      const [nextShares, nextLog] = await Promise.all([api.shares(), api.accessLog()])
      setShares(nextShares)
      setLog(nextLog)
    })
  }, [api, run])

  const setScopes = (share: ShareView, scopes: readonly ShareScope[]) => run(async () => {
    const updated = await api.setShareScopes(share.id, scopes)
    setShares((current) => current?.map((s) => (s.id === updated.id ? updated : s)))
  })
  const stop = (share: ShareView) => run(async () => {
    await api.revokeShare(share.id)
    setShares((current) => current?.filter((s) => s.id !== share.id))
    setNotice(t.stopped(share.pt.name))
  })
  const signOut = () => run(async () => {
    try {
      await api.signOut()
    } finally {
      signedOut()
    }
  })

  return (
    <>
      {notice ? <Txt color="textSecondary">{notice}</Txt> : null}
      <ErrorLine error={error} />
      {(shares ?? []).map((share) => (
        <Card key={share.id}>
          <View style={{ gap: 2 }}>
            <SectionLabel>{t.sharingWith}</SectionLabel>
            <Txt kind="title" style={{ fontSize: 22, lineHeight: 28 }}>{share.pt.name}</Txt>
            <Txt kind="small" color="textMuted">{`${share.pt.email} · ${t.since(shortDate(localDateKey(Date.parse(share.since))))}`}</Txt>
          </View>
          <ScopePicker scopes={share.scopes} onChange={(next) => void setScopes(share, next)} disabled={busy} />
          <Txt kind="small" color="textMuted">{t.never}</Txt>
          <Button label={t.stop} variant="secondary" labelColor="warn" onPress={() => void stop(share)} disabled={busy} />
        </Card>
      ))}
      {shares ? <AddPt api={api} onSessionEnded={signedOut} onAdded={(share) => setShares((current) => [...(current ?? []).filter((s) => s.id !== share.id), share])} /> : null}
      <Card style={{ gap: 0 }}>
        <SectionLabel spaced>{t.whoLooked}</SectionLabel>
        {log.length === 0 ? <Txt color="textSecondary" style={{ paddingBottom: space.sm }}>{t.nobodyLooked}</Txt> : null}
        {log.slice(0, 12).map((entry, i) => (
          <ListRow key={`${entry.at}-${entry.action}`} first={i === 0} title={`${entry.ptName} ${t.looked[entry.action]}`} sub={new Date(entry.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} />
        ))}
      </Card>
      <Card style={{ gap: 0 }}>
        <SectionLabel spaced>{t.account}</SectionLabel>
        <ListRow first title={t.signedInAs(sync?.account.email ?? '')} sub={t.lastSync(sync?.revision ?? 0)} />
        <ListRow title={t.signOut} sub={t.signOutSub} onPress={() => void signOut()} />
      </Card>
    </>
  )
}

export default function ShareScreen() {
  const { mode, sync, setSync } = useStore()
  const [available, setAvailable] = useState<boolean | undefined>(undefined)
  const [sessionRead, setSessionRead] = useState(false)

  useEffect(() => {
    let cancelled = false
    void sharingAvailable().then((ok) => {
      if (!cancelled) setAvailable(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Read the session from the Keychain once. If the phone thinks it is signed in but the Keychain
  // has lost the session, it is signed out. The client itself always uses the current session.
  const signedIn = sync !== undefined
  useEffect(() => {
    let cancelled = false
    if (!available) return undefined
    void loadToken().then((stored) => {
      if (cancelled) return
      if (!stored && signedIn) setSync(undefined)
      setSessionRead(true)
    })
    return () => {
      cancelled = true
    }
  }, [available, signedIn, setSync])
  const api = useMemo(() => (available && sessionRead ? phoneApi() : undefined), [available, sessionRead])

  return (
    <Screen variant="fullscreen" back={t.back} title={t.title}>
      {mode !== 'real' ? (
        <Card><Txt color="textSecondary">{t.sampleOnly}</Txt></Card>
      ) : available === false ? (
        <Card><Txt color="textSecondary">{t.unavailable}</Txt></Card>
      ) : available === undefined ? null : !signedIn ? (
        <SignInCard />
      ) : api ? (
        <Sharing key={sync.account.id} api={api} />
      ) : null}
    </Screen>
  )
}
