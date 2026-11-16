/**
 * The shape of everything the server accepts, checked before anything is stored. Objects are
 * strict: a field this version doesn't know is refused, never silently dropped, so a newer app
 * can't lose data to an older server (deploy the server first).
 *
 * `test/schemas.test.ts` round-trips every sample persona through these, so a field added to
 * the core types and not here fails a test.
 */
import { ALL_METRICS, EFFUSION_ORDER, SHARE_SCOPES, SIGN_IN_CODE_DIGITS } from '@reco/core'
import type { Dataset, RecoveryPlan, ShareScope } from '@reco/core'
import { z } from 'zod'

const MAX_TEXT = 4000
const MAX_NAME = 120
const MAX_RECORDS = 20000
const MAX_ENTRIES = 60

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a YYYY-MM-DD date')
const id = z.string().min(1).max(MAX_NAME)
const epochMs = z.number().int().nonnegative()
const short = z.string().max(MAX_NAME)
const text = z.string().max(MAX_TEXT)
const pain = z.number().int().min(0).max(10)
const degrees = z.number().min(-30).max(200)
const records = <T extends z.ZodTypeAny>(item: T) => z.array(item).max(MAX_RECORDS)

const activity = z.enum(['practice', 'game', 'gym', 'pt', 'walking', 'rest'])
const effusion = z.enum(EFFUSION_ORDER as unknown as [string, ...string[]])
const metric = z.enum(ALL_METRICS as unknown as [string, ...string[]])

const otherKnee = z.object({ flexionDeg: degrees, extensionDeficitDeg: degrees }).strict()

const profile = z.object({
  name: short,
  joint: z.enum(['knee', 'shoulder', 'elbow']).optional(),
  side: z.enum(['left', 'right']).optional(),
  injury: z.enum(['acl', 'meniscus', 'rotator-cuff', 'shoulder-dislocation', 'ucl', 'tennis-elbow', 'other']),
  injuryDate: dateKey,
  hadSurgery: z.boolean(),
  sport: short,
  hasPt: z.boolean(),
  goal: z.string().max(400),
  story: text.optional(),
  ptName: short.optional(),
  ptEmail: z.string().max(254).optional(),
  nextVisit: dateKey.optional(),
  otherKnee: otherKnee.optional(),
}).strict()

const activityLog = z.object({ id, date: dateKey, activity, intensity: z.enum(['light', 'moderate', 'hard']) }).strict()

// voiceUri and photoUri are files on the phone. They are not part of what the server accepts.
const painLog = z.object({
  id,
  t: epochMs,
  date: dateKey,
  pain: pain.optional(),
  doing: z.enum(['practice', 'game', 'gym', 'pt', 'walking', 'rest', 'stairs', 'other']).optional(),
  settled: z.enum(['yes', 'a-bit', 'no']).optional(),
  settledAt: epochMs.optional(),
  kind: z.enum(['press', 'evening']).optional(),
  note: text.optional(),
}).strict()

const checkIn = z.object({ date: dateKey, pain, swelling: z.enum(['none', 'some', 'a-lot']), effusion: effusion.optional() }).strict()
const romDay = z.object({ date: dateKey, extensionDeficitDeg: degrees, flexionDeg: degrees, source: z.enum(['pt', 'self', 'reco-tape-sim']) }).strict()
const journalEntry = z.object({ id, t: epochMs, date: dateKey, text, source: z.enum(['voice', 'typed']) }).strict()
const planMark = z.object({ date: dateKey, itemId: id, done: z.boolean() }).strict()
const planExercise = z.object({
  id, name: short, sets: z.number().int().min(0).max(50), reps: z.number().int().min(0).max(500), daysPerWeek: z.number().int().min(1).max(7), note: text.optional(),
}).strict()
const eveningCheck = z.object({ date: dateKey, word: z.enum(['quiet', 'sore', 'worse']) }).strict()
const pathRecord = z.object({
  completed: z.array(z.object({ phase: z.number().int().min(1).max(12), date: dateKey }).strict()).max(24),
  ptPhase: z.number().int().min(1).max(12).optional(),
  ptFlexionMaxDeg: degrees.nullable().optional(),
}).strict()
const measurement = z.object({
  metric,
  value: z.union([z.number().finite(), z.boolean(), effusion]),
  date: dateKey,
  by: z.enum(['tape', 'self-test', 'check-in', 'pt']),
}).strict()
const bendAlert = z.object({ date: dateKey, t: epochMs, angleDeg: degrees, limitDeg: degrees, loaded: z.boolean() }).strict()
const bendCalibration = z.object({ maxDeg: degrees, date: dateKey }).strict()

/** The record as the phone uploads it: `uploadableDataset` has already dropped local files, the PT plan and warning feedback. */
export const datasetSchema = z.object({
  profile,
  activityLogs: records(activityLog),
  painLogs: records(painLog),
  checkIns: records(checkIn),
  romDays: records(romDay),
  journal: records(journalEntry).optional(),
  planMarks: records(planMark).optional(),
  exercises: z.array(planExercise).max(MAX_ENTRIES).optional(),
  eveningChecks: records(eveningCheck).optional(),
  path: pathRecord.optional(),
  measurements: records(measurement).optional(),
  bendAlerts: records(bendAlert).optional(),
  bendCalibration: bendCalibration.optional(),
}).strict()

const dose = z.object({
  sets: z.number().optional(),
  reps: z.number().optional(),
  seconds: z.number().optional(),
  minutes: z.number().optional(),
  perSide: z.boolean().optional(),
  note: z.string().max(400).optional(),
}).strict()

const planEntry = z.object({
  id,
  source: z.union([z.object({ kind: z.literal('library'), exerciseId: id }).strict(), z.object({ kind: z.literal('custom') }).strict()]),
  name: short,
  how: z.string().max(400).optional(),
  dose,
  lightDose: dose.optional(),
  daysPerWeek: z.number(),
}).strict()

/** A plan's shape only. Whether its numbers make sense is `validatePlan` in core, the same check the editor runs. */
export const planSchema = z.object({
  id,
  version: z.number(),
  author: z.object({ kind: z.literal('pt'), name: short }).strict(),
  adaptation: z.enum(['as-written', 'lighter-on-flare']),
  entries: z.array(planEntry).max(MAX_ENTRIES),
  publishedOn: dateKey,
  note: text.optional(),
}).strict()

const email = z.string().trim().toLowerCase().min(3).max(254).email()
const role = z.enum(['patient', 'pt'])
const scopes = z.array(z.enum(SHARE_SCOPES as unknown as [ShareScope, ...ShareScope[]])).max(SHARE_SCOPES.length).transform((s) => [...new Set(s)])
const inviteCode = z.string().min(4).max(40)

export const bodies = {
  authStart: z.object({ email, role }).strict(),
  authVerify: z.object({ email, role, code: z.string().regex(new RegExp(`^\\d{${SIGN_IN_CODE_DIGITS}}$`), `must be the ${SIGN_IN_CODE_DIGITS} digits from the email`), name: short.optional() }).strict(),
  rename: z.object({ name: z.string().trim().min(1).max(MAX_NAME) }).strict(),
  putDataset: z.object({ baseRevision: z.number().int().min(0), data: datasetSchema }).strict(),
  invitePreview: z.object({ code: inviteCode }).strict(),
  acceptInvite: z.object({ code: inviteCode, scopes }).strict(),
  setScopes: z.object({ scopes }).strict(),
  publishPlan: z.object({ plan: planSchema }).strict(),
} as const

/** Parsed values are structurally the core types; zod only widens optional fields to `| undefined`. */
export const asDataset = (parsed: z.infer<typeof datasetSchema>): Dataset => parsed as unknown as Dataset
export const asPlan = (parsed: z.infer<typeof planSchema>): RecoveryPlan => parsed as unknown as RecoveryPlan
