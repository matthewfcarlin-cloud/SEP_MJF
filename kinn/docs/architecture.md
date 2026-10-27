# Kinn app architecture (prototype)

> **Rebrand note (2026-10-26):** the product is now called **RECO**. This document predates the rename and keeps "Kinn" as written; see [decisions.md](decisions.md).

_Version 0.1 · 2026-10-19 · pairs with [feature-spec.md](feature-spec.md)_

## 1. Stack

**Decision:** Expo (React Native) with TypeScript, and a pure TypeScript `core` package for everything that is not UI. [decisions.md 2026-10-19]

| Option | For | Against | Verdict |
|---|---|---|---|
| **Expo + React Native + TypeScript** | Runs on a real phone; local notifications work today; a BLE path exists (`react-native-ble-plx`, needs a dev build, not Expo Go); background execution possible; one codebase for iOS and Android; the team already writes TypeScript | Native build setup for BLE later; simulators do not do BLE | **Chosen** |
| Vite web PWA | Fastest to demo and share by link; trivial to test | Web Bluetooth is Chrome-only and absent on iOS; no reliable background notifications on iOS; would be rewritten for the real device | Keep as a fallback demo target: `core` can be mounted in a tiny web shell if a link is needed for a pitch |
| Flutter | Good BLE packages, smooth UI | New language for the team; no shared code with the site | No |
| Native Swift | Best BLE and background behaviour | iOS only; slowest for a 10-week team | No |

The important architectural rule is that the **load model, alert logic, insights and simulator never import React Native**. They live in `core`, run in Node under Vitest, and would run unchanged in a web shell or a server.

## 2. Repository layout

```
kinn/app/
  package.json            # workspaces: packages/core, apps/mobile
  packages/core/          # pure TS, no RN imports
    src/
      domain/             # types below
      sensor/             # KneeSensor interface, SimulatedKneeSensor, ReplaySensor, (later) BleTwoImuSensor
      pipeline/           # angle → cycles → activity → aggregates
      load/               # units, score, band, call, reason templates, constants.ts (versioned)
      alerts/             # RangeMonitor (hysteresis, debounce, mute)
      insights/           # flare-up rules
      report/             # weekly report model (data only; rendering is in the app)
      sim/                # scenario definitions (rest day, hard PT, ...)
      storage/            # repository interfaces (ports)
    test/                 # Vitest; fixtures are the simulated days
  apps/mobile/            # Expo, expo-router
    app/                  # screens
    components/
    data/                 # SQLite adapters implementing core's repository interfaces
    notifications/
    pdf/                  # report rendering (expo-print)
```

## 3. Data model

All records are immutable once written except `ShareSettings`, `RangeSetting` (append a new row, never edit), and the current day's `DailyLoad`, which is recomputed from its parts.

```ts
// domain/
type Knee = 'left' | 'right'
type Level = 'pro' | 'college' | 'recreational'
type Graft = 'patellar' | 'hamstring' | 'quad' | 'allograft' | 'unknown'

interface AthleteProfile {
  id: string
  knee: Knee
  injury: 'acl-reconstruction' | 'other-knee'
  graft: Graft
  surgeryDate?: string            // ISO date
  weeksSinceSurgeryEstimate?: number  // when surgeryDate is unknown, 2-week bucket midpoint
  level: Level
  createdAt: string
}

interface Device {                 // the coin
  id: string
  kind: 'simulated' | 'ble-two-imu' | 'ble-strip'
  name: string
  firmware?: string
}

interface WearSession {            // one continuous stretch of the coin reporting data
  id: string
  deviceId: string
  startedAt: string
  endedAt?: string
  calibration: { zeroOffsetDeg: number; signFlipped: boolean; at: string }
}

interface Sample {                 // ring buffer only; downsampled to 10 Hz for the last 7 days
  t: number                        // epoch ms
  angleDeg: number                 // 0 = straight
  shinAccelG: number               // magnitude
}

type Activity = 'walking' | 'cycling' | 'stairs' | 'bend' | 'impact' | 'pt' | 'training' | 'unknown'

interface BendCycle {              // the unit of storage for movement
  id: string
  wearSessionId: string
  startT: number
  endT: number
  peakDeg: number
  troughDeg: number
  peakAccelG: number
  activity: Activity
  taggedSessionId?: string
  deepFlexionMs: number            // time above the deep threshold during this cycle
  overRange: boolean
}

interface TaggedSession {          // "I'm at PT" / "Training"
  id: string
  kind: 'pt' | 'training'
  startedAt: string
  endedAt?: string
  supervised: boolean              // mutes range alerts while true
}

interface RangeExcursion {
  id: string
  t: number
  peakDeg: number
  limitDeg: number
  notified: boolean
}

interface RangeSetting {           // append-only history
  id: string
  limitDeg: number | null          // null = no limit
  source: 'protocol-default' | 'athlete-lowered' | 'physio'
  setBy?: string                   // physio name when source = 'physio'
  effectiveFrom: string
}

interface TargetBandSetting {      // physio override of the band; append-only
  id: string
  lower: number
  upper: number
  setBy: string
  effectiveFrom: string
}

interface DailyLoad {
  date: string                     // local, day boundary 04:00
  modelVersion: string             // from load/constants.ts
  rawUnits: number
  score: number                    // 0..100
  components: Record<Activity | 'deepFlexion' | 'overRange', { units: number; count: number }>
  band: { lower: number; upper: number; source: 'protocol' | 'personalised' | 'physio' }
  call: 'room-to-push' | 'on-target' | 'ease-off' | 'not-enough-data'
  reason: string
  wearCoverage: number             // 0..1 of the active day
  partial: boolean
}

interface Moment {
  id: string
  t: number
  angleDeg: number
  precedingAngles: number[]        // 60 s at 1 Hz
  activity: Activity
  scoreSoFar: number
  feeling?: 'sharp' | 'ache' | 'unstable' | 'swollen' | 'stiff' | 'note'
  pain?: number                    // 0..10
  note?: string
  taggedAt?: string
}

interface CheckIn {                // evening swelling check-in
  date: string
  swelling: 'none' | 'some' | 'a-lot'
  note?: string
}

interface Insight {
  id: string
  window: '7d' | '30d'
  text: string
  support: number                  // 0..1
  flareUpIds: string[]
  generatedAt: string
}

interface OtherKneeCheck {         // lightweight symmetry
  id: string
  date: string
  knee: Knee
  peakDeg: number
  medianPeakDeg: number
  cyclesRecorded: number
}

interface Checkpoint {
  id: string
  label: string                    // "120° comfortable bend"
  targetDeg?: number
  typicalWeek?: number
  unlocks?: string                 // "stationary bike"
  setBy: 'default' | string
}

interface ShareSettings {          // report section toggles
  load: boolean; flareUps: boolean; range: boolean; symmetry: boolean; sessions: boolean
  moments: boolean; momentNotes: boolean
}

interface WeeklyReport {           // pure data; rendered by the app
  weekStart: string
  days: DailyLoad[]
  flareUps: { moment: Moment; precedingDays: DailyLoad[] }[]
  deepestBendByDay: { date: string; peakDeg: number; overRangeMs: number }[]
  symmetry?: { injured: OtherKneeCheck; other: OtherKneeCheck }
  sessions: TaggedSession[]
  moments: Moment[]
  settings: ShareSettings
  coverageNote: string
}

// Later: Exercise, Prescription, RepFeedback for guided training.
```

What is stored where:

- `Sample`: ring buffer in memory plus a 10 Hz, 7-day table for debugging and for the Moment `precedingAngles`. Not the source of truth.
- `BendCycle`, `RangeExcursion`, `Moment`, `CheckIn`, settings: SQLite (`expo-sqlite`). These are the source of truth; `DailyLoad` is derived and can be rebuilt for any day by re-running the load model, which is how model version bumps recompute history.

## 4. Sensor abstraction

```ts
// sensor/KneeSensor.ts
interface KneeSample { t: number; angleDeg: number; shinAccelG: number }
type SensorStatus = 'disconnected' | 'connecting' | 'streaming' | 'needs-calibration'

interface KneeSensor {
  readonly device: Device
  status(): SensorStatus
  connect(): Promise<void>
  disconnect(): Promise<void>
  onSample(cb: (s: KneeSample) => void): Unsubscribe
  onButton(cb: (t: number) => void): Unsubscribe
  onStatus(cb: (s: SensorStatus) => void): Unsubscribe
  calibrate(step: 'straight-leg' | 'gentle-bend'): Promise<CalibrationResult>
}
```

Implementations:

- `SimulatedKneeSensor(scenario, speed)`: plays a `sim/` scenario, emitting angle and accel at 50 Hz scaled by `speed` (1× or 60×). The in-app "Moment" button calls the same `onButton` path so the rest of the app cannot tell it from a coin press.
- `ReplaySensor(recording)`: plays a saved sample log. Used for tests and for bench recordings later.
- `BleTwoImuSensor` (later): subscribes to two IMU quaternion characteristics, computes the knee angle as the rotation between thigh and shin frames projected on the knee axis, and emits the same `KneeSample`. Calibration sets the zero offset and the sign. The rest of the app does not change.
- `BleStripSensor` (later): the printed stretch trace plus one IMU; a fitted map from trace resistance to angle lives here and nowhere else.

The simulator is the only place that knows about scenarios. A scenario is a list of segments: `{ fromMinute, toMinute, activity, cadence, peakDeg, impactG, taggedSession? }` plus scripted events (Moment presses, coin off). Scenarios double as Vitest fixtures and as the "ten simulated days" we show physios.

## 5. Pipeline, and where the load calculation lives

```
KneeSensor.onSample
   └─> AngleFilter (clamp, 5-sample median, calibration offset)
         └─> CycleSegmenter (local-minimum split, ≥30° excursion)  ──> BendCycle
         │       └─> ActivityClassifier (peak, cadence, impact, tagged session)
         │             └─> DailyLoadAggregator (adds units, recomputes DailyLoad for today)
         │                   └─> CallEvaluator (projection, band, overrides, reason template)
         └─> RangeMonitor (hysteresis, debounce, mute) ──> RangeExcursion ──> Notifier
         └─> DriftCheck (quiet standing not near 0°) ──> needs-calibration
Moment button ──> MomentRecorder (reads ring buffer, activity, scoreSoFar)
Nightly / on open ──> InsightsEngine (flare-ups × conditions) ──> Insight[]
Weekly / on demand ──> ReportBuilder ──> WeeklyReport ──> PDF
```

- All of this runs **on the phone, in `core`**, incrementally as samples arrive. There is no server.
- `DailyLoad` for today is recomputed from the day's `BendCycle` rows on every change (cheap: a few thousand rows). Past days are recomputed only when `modelVersion` changes.
- Every tunable number is in `load/constants.ts` with a `MODEL_VERSION` string. Tests assert the simulated days land in their expected bands.

## 6. Testing

- **Vitest in `core`**: unit tests for units-per-cycle, score, band interpolation, personalisation guard, call and overrides, reason templates (no banned words), RangeMonitor hysteresis and debounce, insight support thresholds, and one end-to-end test per simulated day (expected score range and call from the spec table).
- **Property checks**: the score is monotonic in units; a day with the coin off is never "Room to push"; raising the limit never deletes recorded excursions.
- **Mobile**: React Native Testing Library for onboarding and tagging flows; otherwise rely on `core` tests and a manual run on the simulator.
- Coverage target 80% on `core`.

## 7. Build order (after spec approval)

1. `core`: domain types, constants, load model, band, call. Tests first from the simulated-day table.
2. `core`: simulator and the seven scenarios; ReplaySensor.
3. `core`: RangeMonitor, MomentRecorder, InsightsEngine, ReportBuilder, with tests.
4. Mobile: Expo scaffold, SQLite adapters, Today screen (score, band, call, reason, breakdown), scenario picker with SAMPLE DATA banner.
5. Mobile: onboarding and calibration, range card, local notifications.
6. Mobile: Moments button and tagging, evening check-in, insights card.
7. Mobile: report preview, share toggles, PDF export, physio adjustment screen, checkpoint card, other-knee check.
8. Pass over all copy against the banned-words list; CONTEXT.md and decisions.md updated.
