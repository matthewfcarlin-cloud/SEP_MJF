# How the RECO backend works (as built)

_Version 0.1 · 2026-10-27 · pairs with [scoring-methods.md](scoring-methods.md) for the formulas and [architecture.md](architecture.md) for the original plan_

**Bottom line:** the app has no server. Everything the athlete sees is derived on the phone, in one pure TypeScript package, from a small set of records that never leave the device. The only server in the project is the marketing site's waitlist form.

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

## 6. The site's backend (the only server)

`kinn/site/app.js` is a small Express app, deployed on Vercel as one serverless function; the static pages and the exported app at `/try` are served from the CDN.

| Route | Does |
|---|---|
| `POST /api/waitlist` | Validates the email and the fixed-choice fields, rate-limits per IP (8 per 10 min), drops honeypot submissions, upserts into Postgres (`waitlist` table via `DATABASE_URL`), optionally sends a welcome email through Resend. |
| `GET /admin/waitlist.csv`, `/admin/stats` | Behind `ADMIN_TOKEN`, compared in constant time. |
| `GET /healthz` | Reports which store is active. |

Without `DATABASE_URL` it falls back to a local JSON file for development. The app never calls this server.

## 7. Testing

`packages/core` has 17 Vitest files covering load, status, insights, trend, the report, the seed, the tape codec, the simulated device, the client's sync, and the banned-words list for copy. Run with:

```bash
cd kinn/app && npm test
```

The mobile app has no automated tests; it is checked by hand on the iOS simulator and in the browser build.

## 8. What is not there yet

- Tape readings do not feed Recovery %, the load score or `romDays`. The ROM numbers on Progress are the seed.
- No native Bluetooth on iOS or Android.
- No accounts and no sync between devices. Besides the Report share sheet, Settings has **Export trial data** (`core/src/export/trial.ts`): one JSON plus a daily CSV and a per-minute tape CSV, with sample entries flagged `sample: true`. It runs only when the athlete taps it. These are deliberate for now: "nothing leaves the phone" is a product promise, not a gap.
