# How the RECO backend works (as built)

_Version 0.2 · 2026-11-15 · pairs with [how-reco-works.md](how-reco-works.md) for the plain-language walk-through, [scoring-methods.md](scoring-methods.md) for the formulas and [architecture.md](architecture.md) for the original plan_

**Bottom line:** everything the person sees is still derived on the phone, in one pure TypeScript package, from a small set of records. Since Nov 15 there is also a RECO server (sections 9 to 12). It holds a sealed copy of the record only for someone who has turned on sharing with a PT, and it derives nothing. For everyone else the record never leaves the phone.

## 1. Two pieces, one rule

| Piece | Where | What it does |
|---|---|---|
| `@reco/core` | `kinn/app/packages/core` | Pure TypeScript. Types, the scoring rules, the insight rules, the weekly report, the 21-day sample athlete, and the tape protocol. Never imports React Native. Tested with Vitest. |
| Mobile app | `kinn/app/apps/mobile` | Expo + expo-router. Screens, local storage, notifications, Bluetooth. Calls core; holds no logic of its own. |

The rule that holds it together: **the app stores facts, core derives everything else.** Nothing derived is ever saved, so a change to a rule or a constant changes history too, with no migration.

## 2. What is stored

One JSON document, under the key `reco.state.v1`, in the phone's AsyncStorage (the browser's localStorage in the web build). Its shape is `AppState` in `apps/mobile/src/store/state.ts`:

| Field | Record | Written when |
|---|---|---|
| `data.profile` | name, injury, injury date, surgery yes/no, sport, has PT, goal | Onboarding, step 1 to 3 |
| `data.activityLogs[]` | date, activity (practice, game, gym, PT, walking, rest), intensity | Log tab, "What did you do?" |
| `data.painLogs[]` | time, date, pain 0 to 10, what you were doing, later `settled` yes / a bit / no | Log pain button; "Did it settle?" next morning |
| `data.checkIns[]` | date, morning pain 0 to 10, swelling none / some / a lot | Morning check-in, one per day |
| `data.romDays[]` | date, extension deficit °, flexion °, source | Seed only today (`reco-tape-sim`). The tape does not write these yet. |
| Tape log (separate key `reco.tape.v1`) | every synced minute record, sync cursors, calibrations | Each tape sync (`apps/mobile/src/tape/tape-log.ts`). Real tapes only; the demo tape never writes here. |
| `onboarded`, `seededFor`, `ptReminder` | flags | Onboarding, reseed, Settings |

Every record is immutable. Writes go through a reducer (`state.ts`) that returns a new state; the provider (`provider.tsx`) saves the whole document after each change and reloads it on launch.

**Sample data.** A fresh install starts on the 21-day seed for "Maya" (`core/src/sim/seed.ts`, ACL, injured 2026-08-28). While the athlete has added nothing of their own, the seed moves with the calendar so "today" is always day 21. The first real log pins it.

## 3. How a screen gets its numbers

Every screen reads from one call:

```
deriveToday(data, today) → TodayView
```

`core/src/manual/derive.ts` runs this in order:

1. **Load per day** over the last 30 days: each activity log becomes units from the manual table (activity × intensity), summed per day, then scored 0 to 100 against 12,000 units. (`manual/load.ts`)
2. **Baseline**: mean score of the 7 days before yesterday that had any load.
3. **Status** for today, first matching rule wins: morning pain ≥ 5 → Ease off; swelling "a lot" → Ease off; last night's pain did not settle → Ease off; pain ≥ 3 → Steady; swelling "some" → Steady; yesterday's score > 1.3 × baseline → Steady; no check-in yet → Steady; else Keep going. (`manual/status.ts`)
4. **Suggestion**: one sentence, the reason then the action, from fixed copy keyed by the rule that fired. (`manual/suggestion.ts`)
5. **Flare-ups**: a morning with pain ≥ 5, swelling "a lot", or a pain log that did not settle. One per date. (`manual/insights.ts`)
6. **Insights**: for each candidate condition (after game, practice, gym, PT, a high-load day, a spike over baseline), count how many flare-ups it preceded and how often it held on other days. Keep the ones that pass the support thresholds in `MANUAL_INSIGHTS`, phrase them as "N of your last M flare-ups came after …". Observations, never causes.
7. **Timeline**: the 30 days marked flare / before flare / matched, so Insights can draw the pattern.
8. **Recovery %**: from the latest `romDay` and weeks since injury, weights 0.35 / 0.35 / 0.30. (`manual/trend.ts`; see scoring-methods.md §1)
9. **Milestones**: fully straight ≤ 2°, bike range ≥ 120°, full bend ≥ 135°, with the first date each was reached.

The view is memoised in the store provider, so it recomputes once per state change and all tabs share it. The Report tab calls `weeklySummary` and `weekChange` (`core/src/report/weekly.ts`) on the same data.

## 4. The daily loop, end to end

```
evening   Log pain ──► painLogs[] ──► local notification scheduled for 08:00
                                        (expo-notifications; no-op on web)
morning   "Did it settle?" ──► painLogs[i].settled
          Morning check-in ──► checkIns[]      (sheet previews the status first,
                                                by calling statusFor() with the draft)
          Today ──► deriveToday ──► dial, status, suggestion, loads
day       Log tab ──► activityLogs[]
weekend   Insights / Progress / Report ──► same deriveToday + weeklySummary
```

Nothing in this loop makes a network request.

## 5. The tape

The tape is the one piece that talks to hardware, and it is kept behind an interface so the rest of the app cannot tell a real tape from the simulator.

```
DeviceTransport (bytes only)      DeviceClient (core)                  useTape (app)
  WebBluetoothTransport  ──┐      connect → read STATUS                 phase, status, latest
  SimulatedTransport     ──┼──►   SET_TIME                       ──►    10 s ring buffer @ 20 Hz
  (native BLE: not yet)  ──┘      SYNC_HISTORY from stored cursor       reps (RepTracker)
                                  stream LIVE packets                   calibrate / identify
```

- **Protocol**: KineTape BLE v1, ported from github.com/jackcappo/kinetape on 2026-10-27. One service, four characteristics (LIVE, HISTORY, CONTROL, STATUS). All encoding and decoding is in `core/src/tape/codec.ts`, so the simulator exercises the same code as a real device.
- **Live packets** carry stretch activation in permille, a contracting flag, raw ADC and uptime. The app keeps the last 10 seconds and publishes a fresh array at ~12 fps for the trace. `RepTracker` turns threshold crossings into reps with hold time and peak.
- **History**: the device logs one record per minute (mean, peak, reps, active seconds). The client syncs from the last cursor, detects a cleared or reflashed log and starts a new generation, and reconstructs epoch time for records logged before the clock was set.
- **Persistence**: `SyncStore` is the port. A real tape syncs into `TapeLog` (`core/src/tape/log.ts`), saved under `reco.tape.v1` and restored on launch, so the next sync resumes from the stored cursor. While connected the app re-syncs every 5 minutes. The demo tape uses a throwaway `MemorySyncStore`.
- **Tape days**: `deriveToday(data, today, tapeRecords)` rolls the minutes up per RECO day (`core/src/tape/days.ts`: worn minutes, fault minutes, active minutes, reps, peak and mean activation) as `tapeDays` / `todayTape`; Today shows one line from it. Nothing from the tape reaches `data.romDays` or the load score, because the v1 tape reports stretch activation, not angle.
- **Where it runs**: Web Bluetooth in Chrome and Edge (the `/try` build). On iOS the tape screen offers the simulated tape only until native BLE lands.

## 6. The marketing site's backend

`kinn/site/app.js` is a small Express app, deployed on Vercel as one serverless function; the static pages and the exported app at `/try` are served from the CDN.

| Route | Does |
|---|---|
| `POST /api/waitlist` | Validates the email and the fixed-choice fields, rate-limits per IP (8 per 10 min), drops honeypot submissions, upserts into Postgres (`waitlist` table via `DATABASE_URL`), optionally sends a welcome email through Resend. |
| `GET /admin/waitlist.csv`, `/admin/stats` | Behind `ADMIN_TOKEN`, compared in constant time. |
| `GET /healthz` | Reports which store is active. |

Without `DATABASE_URL` it falls back to a local JSON file for development. The app never calls this server, and it shares nothing with the RECO server below.

## 7. Testing

`packages/core` has 36 Vitest files (364 tests) covering load, status, insights, trend, the report, the seed, the protocol path, plans, the exercise library, sharing scopes, the tape, and the banned-words list for copy. The clinic site has 36 tests and the server 65. Run them all with:

```bash
cd kinn/app && npm test
```

The mobile app has no automated tests; it is checked by hand on the iOS simulator and in the browser build.

## 8. What is not there yet

- Tape readings do not feed Recovery %, the load score or `romDays`. The ROM numbers on Progress are the seed.
- No native Bluetooth on iOS or Android.
- No sync between a person's own devices (one phone per person; see section 11). Accounts exist only for sharing with a PT. Besides the Report share sheet, Settings has **Export trial data** (`core/src/export/trial.ts`): one JSON plus a daily CSV and a per-minute tape CSV, with sample entries flagged `sample: true`. It runs only when the athlete taps it. "Nothing leaves the phone" is still the promise for anyone who has not turned on sharing with a PT ([decisions.md](decisions.md), Nov 15).

## 9. The RECO server

Code: `kinn/app/apps/api` (Node, Hono, Postgres). Run and deploy: [apps/api/README.md](../app/apps/api/README.md).

It does four things and nothing else: signs people in, keeps a sealed copy of a sharing patient's record, records who shares what with whom, and keeps every published plan version. It never computes a status, a flag, a phase or a plan; the apps do that from the record with `@reco/core`.

```
phone ──PUT /v1/me/dataset──►  datasets (sealed)  ──scopedDataset()──► GET /v1/patients ──► clinic site
phone ◄──GET /v1/me/plan────   plans (sealed, versioned)  ◄── POST /v1/patients/:id/plans ── clinic site
phone ──POST /v1/me/shares──►  shares (who, what, since, until)
                               access_log (each PT read) ──► GET /v1/me/access-log ──► phone
```

| File | Holds |
|---|---|
| `src/app.ts` | Every route, and the rules for who may call it |
| `src/store.ts` | Every SQL statement, one small function each, all parameterised |
| `src/schemas.ts` | The shape of everything accepted (zod, strict: an unknown field is refused) |
| `src/crypto.ts` | Codes, tokens, hashing, AES-256-GCM sealing |
| `src/migrations.ts` | The tables, as numbered steps that run once |
| `src/config.ts` | The environment, checked at startup; production is the default |
| `src/db.ts` | One door to Postgres (`pg`) or PGlite (laptop, tests) |
| `packages/core/src/sync/` | Shared with the apps: wire types, `uploadableDataset`, `scopedDataset`, the typed client, `syncOnce` |

## 10. Signing in and sessions

- `POST /v1/auth/start {email, role}` makes an 8-digit code, stores `HMAC(AUTH_SECRET, role + email + code)`, and emails it through Resend. The answer is the same whether or not the email has an account.
- `POST /v1/auth/verify {email, role, code}` counts the guess first, then compares in constant time. A code works once, for 10 minutes, and dies after 5 wrong guesses. Guesses are also capped per email (20 an hour) so fresh codes buy no extra tries.
- A session token is 256 random bits; only its SHA-256 is stored. A phone stays signed in 30 days, a clinic browser 12 hours. The phone keeps the token in the Keychain; the clinic site keeps it in the tab's session storage.
- One email is one kind of account. PT accounts open only for emails on `PT_ALLOWLIST`.
- Limits (rows in `rate_limits`, so they hold across serverless instances): codes per email and per address, verifies per address and per email, sharing-code tries per patient, sharing codes per PT per day, requests per address.

## 11. The record, sharing and plans

- **The record** is the app's `Dataset` minus what never uploads (`uploadableDataset`: voice notes, photos, the PT plan copy, warning feedback). It is one document, sealed with AES-256-GCM under `DATA_KEY` and bound to the patient's row. `PUT` carries the revision the phone last saw; a stale copy gets a 409 and the current revision. One phone per person: `syncOnce` in core treats the phone as the source of truth and saves over a newer server revision after reading it.
- **Sharing.** A PT's `POST /v1/invites` returns an 8-character code (works once, 7 days, stored as an HMAC). The patient's `POST /v1/me/shares/preview` shows whose code it is; `POST /v1/me/shares {code, scopes}` creates the share. Scopes: `range`, `pain`, `activity`, `notes`, `tape`. `PATCH` changes them, `DELETE` stops sharing at once.
- **What the PT gets.** `GET /v1/patients` opens each sharing patient's record, cuts it with `scopedDataset(record, scopes)`, attaches the latest plan as `ptPlan`, and writes a `viewed` line to the patient's access log (at most one an hour per PT). Exercise check-offs are never in what a PT gets, whatever the scopes.
- **Plans.** `POST /v1/patients/:id/plans` needs a live share, checks the shape, sets the author to the signed-in PT, runs `validatePlan` from core, and requires the version to be the latest plus one. Two publishes of the same version at once: one wins, one gets a 409. Versions are never edited. The patient reads the latest with `GET /v1/me/plan`, and keeps it after they stop sharing.
- **Delete.** `DELETE /v1/me` removes the account and, through the foreign keys, its sessions, record, shares, plans and access log.

## 12. Tested how

`apps/api/test/`: 65 tests drive the real routes through the same typed client the apps use. `auth.test.ts` covers codes, limits and sessions; `sharing.test.ts` the record, sharing, plans, delete and the edges; `phone.test.ts` the phone's sync pass; `units.test.ts` schemas (every sample persona's record must fit), sealing, config and migrations; `postgres.test.ts` runs the loop through `pg` over a real Postgres socket.

Not covered by a test: a real email through Resend, and the Vercel deploy.
