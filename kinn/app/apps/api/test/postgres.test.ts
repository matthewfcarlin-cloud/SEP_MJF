/**
 * The production driver. Everything else in this folder talks to PGlite in-process; this file
 * puts the same engine behind a real Postgres socket and drives the server through `pg`, the
 * way it runs when deployed, so parameter types, transactions and pooling are exercised too.
 */
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import { ApiError, DEFAULT_SHARE_SCOPES, sampleCaseload, uploadableDataset } from '@reco/core'
import type { RecoveryPlan } from '@reco/core'

import { postgresDb } from '../src/db'
import { createHarness } from './harness'
import type { Harness } from './harness'

const PORT = 54329
const TODAY = '2026-11-15'
let lite: PGlite
let server: PGLiteSocketServer
let h: Harness

beforeAll(async () => {
  lite = new PGlite()
  await lite.waitReady
  server = new PGLiteSocketServer({ db: lite, port: PORT, host: '127.0.0.1', maxConnections: 10 })
  await server.start()
  h = await createHarness({}, await postgresDb(`postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`))
})
afterAll(async () => {
  await h.close()
  await server.stop()
  await lite.close()
})

const plan = (version: number): RecoveryPlan => ({
  id: `p${version}`, version, author: { kind: 'pt', name: '' }, adaptation: 'as-written', publishedOn: TODAY,
  entries: [{ id: 'e1', source: { kind: 'library', exerciseId: 'heel-prop' }, name: 'Heel prop', dose: { minutes: 5 }, daysPerWeek: 7 }],
})

test('the whole loop runs through the Postgres driver', async () => {
  expect(h.db.kind).toBe('postgres')
  const maya = uploadableDataset(sampleCaseload(TODAY).find((p) => p.id === 'maya-on-track')!.data)
  const patient = await h.signIn('maya@example.com', 'patient', 'Maya')
  const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')

  expect(await patient.api.putDataset(0, maya)).toEqual({ revision: 1 })
  expect(await patient.api.putDataset(1, maya)).toEqual({ revision: 2 })
  await expect(patient.api.putDataset(1, maya)).rejects.toMatchObject({ status: 409 })
  expect((await patient.api.getDataset())?.data.profile).toEqual(maya.profile)

  const { code } = await pt.api.createInvite()
  const share = await patient.api.acceptInvite(code, DEFAULT_SHARE_SCOPES)
  expect(share.scopes).toEqual(DEFAULT_SHARE_SCOPES)
  expect(Date.parse(share.since)).not.toBeNaN()

  const [seen] = await pt.api.patients()
  expect(seen).toMatchObject({ id: patient.account.id, name: maya.profile.name, scopes: DEFAULT_SHARE_SCOPES })
  expect(seen?.data?.checkIns.length).toBe(maya.checkIns.length)

  await pt.api.publishPlan(patient.account.id, plan(1))
  const race = await Promise.allSettled([pt.api.publishPlan(patient.account.id, plan(2)), pt.api.publishPlan(patient.account.id, plan(2))])
  expect(race.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
  expect(((race.find((r) => r.status === 'rejected') as PromiseRejectedResult).reason as ApiError).status).toBe(409)
  expect((await patient.api.myPlan())?.plan).toMatchObject({ version: 2, author: { name: 'Dana Ruiz, PT' } })
  expect((await pt.api.patients())[0]?.data?.ptPlan?.version).toBe(2)
  expect((await patient.api.accessLog()).map((e) => e.action).sort()).toEqual(['published-plan', 'published-plan', 'viewed'])

  await patient.api.setShareScopes(share.id, [])
  expect((await pt.api.patients())[0]?.data?.romDays).toEqual([])
  await patient.api.revokeShare(share.id)
  expect(await pt.api.patients()).toEqual([])

  await patient.api.deleteAccount()
  expect(await h.db.query('SELECT 1 FROM datasets')).toEqual([])
  expect(await h.db.query('SELECT 1 FROM plans')).toEqual([])
  expect(h.errors).toEqual([])
})
