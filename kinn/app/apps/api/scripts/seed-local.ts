/**
 * Fills a LOCAL server with a few sample patients who share with one PT, so the clinic site has
 * a real caseload to show. It refuses to run against anything but localhost.
 *
 *   npm run dev            (in one terminal)
 *   npm run seed:local     (in another)   then sign in on the clinic site as dana@clinic.example
 */
import { createApiClient, dayKey, DEFAULT_SHARE_SCOPES, sampleCaseload, uploadableDataset } from '@reco/core'
import type { ApiClient, ShareScope } from '@reco/core'

const BASE = process.env.RECO_API ?? 'http://localhost:8787'
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error('seed-local only runs against a server on localhost')

const PT = { email: 'dana@clinic.example', name: 'Dana Ruiz, PT' }
const PATIENTS: readonly { persona: string; email: string; scopes: readonly ShareScope[]; sync: boolean }[] = [
  { persona: 'leo-flare', email: 'leo@example.com', scopes: DEFAULT_SHARE_SCOPES, sync: true },
  { persona: 'maya-on-track', email: 'maya@example.com', scopes: ['range', 'pain'], sync: true },
  { persona: 'priya-meniscus', email: 'priya@example.com', scopes: DEFAULT_SHARE_SCOPES, sync: true },
  { persona: 'sam-stuck-bend', email: 'sam@example.com', scopes: DEFAULT_SHARE_SCOPES, sync: false },
]

const client = (token?: string): ApiClient => createApiClient({ baseUrl: BASE, fetch: (url, init) => fetch(url, init), token: () => token })

async function signIn(email: string, role: 'patient' | 'pt', name: string): Promise<ApiClient> {
  const { devCode } = await client().startSignIn(email, role)
  if (!devCode) throw new Error('this server emails its codes; seed-local needs a local server that hands them back')
  const { token } = await client().verifySignIn({ email, role, code: devCode, name })
  return client(token)
}

const today = dayKey(Date.now())
const caseload = sampleCaseload(today)
const pt = await signIn(PT.email, 'pt', PT.name)
const already = new Set((await pt.patients()).map((p) => p.name))

for (const p of PATIENTS) {
  const data = caseload.find((c) => c.id === p.persona)?.data
  if (!data) throw new Error(`no sample persona ${p.persona}`)
  if (already.has(data.profile.name)) continue
  const patient = await signIn(p.email, 'patient', data.profile.name)
  if (p.sync) {
    const stored = await patient.getDataset()
    await patient.putDataset(stored?.revision ?? 0, uploadableDataset(data))
  }
  await patient.acceptInvite((await pt.createInvite()).code, p.scopes)
  process.stdout.write(`${data.profile.name} shares ${p.scopes.join(', ') || 'check-ins only'}${p.sync ? '' : ' (phone not synced yet)'}\n`)
}
process.stdout.write(`Sign in on the clinic site as ${PT.email}; the code is shown on the sign-in page.\n`)
