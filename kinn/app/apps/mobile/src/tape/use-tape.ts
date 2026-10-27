/**
 * One tape session for the whole app: connect a real tape (Web Bluetooth in the browser)
 * or run the simulated tape, then expose phase, status, the live stream (last 10 s) and
 * reps to any screen. Minutes synced from a real tape go into the saved tape log (tape-log.ts)
 * and are re-synced every few minutes while connected; the demo tape uses a throwaway
 * MemorySyncStore so it never mixes into an athlete's data.
 * On the web, opening the app with ?tape=demo starts the simulated tape straight away.
 */
import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Platform } from 'react-native'
import {
  DeviceClient,
  MemorySyncStore,
  RepTracker,
  SimulatedTransport,
  type CalibrationOutcome,
  type ClientPhase,
  type DeviceStatus,
  type LivePacket,
  type RepEvent,
} from '@reco/core'

import { bluetoothSupport, requestBleTransport } from './ble'
import type { BluetoothSupport } from './ble'
import { tapeLog, tapeLogReady } from './tape-log'

export interface LiveSample {
  readonly t: number
  /** activation in percent 0–100 */
  readonly v: number
  readonly contracting: boolean
}

export type TapeSource = 'ble' | 'demo'

export interface TapeSession {
  readonly support: BluetoothSupport
  readonly source: TapeSource | null
  readonly name: string | null
  readonly phase: ClientPhase
  readonly status: DeviceStatus | null
  readonly latest: LivePacket | null
  readonly buffer: readonly LiveSample[]
  readonly reps: readonly RepEvent[]
  readonly holdMs: number | null
  readonly busy: 'rest' | 'max' | 'identify' | null
  readonly lastCalibration: CalibrationOutcome | null
  /** When the last history sync finished this session (epoch ms). */
  readonly lastSyncAt: number | null
  readonly error: string | null
  readonly connectTape: () => Promise<void>
  readonly startDemo: () => Promise<void>
  readonly disconnect: () => Promise<void>
  readonly calibrate: (kind: 'rest' | 'max') => Promise<void>
  readonly identify: () => Promise<void>
  readonly resetReps: () => void
  readonly clearError: () => void
}

const WINDOW_MS = 10_000
const FRAME_MS = 80
const DEMO_NAME = 'RECO tape (demo)'
const DEMO_QUERY = 'tape=demo'
/** How often to pull new minute records from a connected real tape. */
const RESYNC_MS = 5 * 60_000

export const isConnected = (p: ClientPhase): boolean => p === 'ready' || p === 'syncing' || p === 'session'

/** True when the browser URL asks for the demo tape (the site links to /try/?tape=demo). */
function demoRequestedByUrl(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false
  return window.location.search.includes(DEMO_QUERY)
}

function useTapeSession(): TapeSession {
  const support = bluetoothSupport()
  const clientRef = useRef<DeviceClient | null>(null)
  const bufRef = useRef<LiveSample[]>([])
  const trackerRef = useRef(new RepTracker())
  const dirty = useRef(false)
  const [source, setSource] = useState<TapeSource | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [phase, setPhase] = useState<ClientPhase>('disconnected')
  const [status, setStatus] = useState<DeviceStatus | null>(null)
  const [latest, setLatest] = useState<LivePacket | null>(null)
  const [reps, setReps] = useState<RepEvent[]>([])
  const [busy, setBusy] = useState<'rest' | 'max' | 'identify' | null>(null)
  const [lastCalibration, setLastCalibration] = useState<CalibrationOutcome | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [buffer, setBuffer] = useState<readonly LiveSample[]>([])
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null)

  // Publish the ring buffer as a fresh array at ~12 fps rather than once per 20 Hz packet. A new
  // array each time matters: the React Compiler memoises on identity, so an array mutated in
  // place would never redraw the trace.
  useEffect(() => {
    const id = setInterval(() => {
      if (!dirty.current) return
      dirty.current = false
      setBuffer(bufRef.current.slice())
    }, FRAME_MS)
    return () => clearInterval(id)
  }, [])

  const teardown = useCallback(async () => {
    const c = clientRef.current
    clientRef.current = null
    if (!c) return
    await c.disconnect().catch(() => undefined)
    c.dispose()
    if (c.transport instanceof SimulatedTransport) c.transport.dispose()
  }, [])

  useEffect(() => () => void teardown(), [teardown])

  // While a real tape is connected, pull the minutes it has logged since the last sync so the
  // Today line and the export stay current without reconnecting.
  useEffect(() => {
    if (source !== 'ble') return
    const id = setInterval(() => {
      const c = clientRef.current
      if (c && c.phase === 'ready') c.sync().catch(() => undefined)
    }, RESYNC_MS)
    return () => clearInterval(id)
  }, [source])

  const attach = useCallback(
    async (client: DeviceClient, src: TapeSource) => {
      await teardown()
      clientRef.current = client
      bufRef.current = []
      setBuffer([])
      trackerRef.current.reset()
      setReps([])
      setLatest(null)
      setLastCalibration(null)
      setSource(src)
      setName(client.transport.name)
      setError(null)
      client.events.on('phase', setPhase)
      client.events.on('status', setStatus)
      client.events.on('sync', (r) => setLastSyncAt(r.at))
      client.events.on('live', (p) => {
        const arr = bufRef.current
        const last = arr[arr.length - 1]
        if (last && p.uptimeMs < last.t) arr.length = 0 // device rebooted
        arr.push({ t: p.uptimeMs, v: p.activationPermille / 10, contracting: p.contracting })
        while (arr.length && (arr[0]?.t ?? 0) < p.uptimeMs - WINDOW_MS) arr.shift()
        const rep = trackerRef.current.push(p)
        if (rep) setReps((r) => [...r, rep])
        setLatest(p)
        dirty.current = true
      })
      try {
        await client.connect()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not connect.')
      }
    },
    [teardown],
  )

  const connectTape = useCallback(async () => {
    if (!support.ok) {
      setError(support.reason ?? 'Bluetooth is not available here.')
      return
    }
    let transport
    try {
      transport = await requestBleTransport()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not open the device chooser.'
      if (!/cancel/i.test(msg)) setError(msg)
      return
    }
    await tapeLogReady
    await attach(new DeviceClient(transport, tapeLog), 'ble')
  }, [attach, support])

  const startDemo = useCallback(async () => {
    const transport = new SimulatedTransport({ name: DEMO_NAME, calibrated: true, restRaw: 310, maxRaw: 3300 })
    await attach(new DeviceClient(transport, new MemorySyncStore()), 'demo')
  }, [attach])

  // ?tape=demo on the web: start the simulated tape once, so a site link lands on a live Today.
  const autoStarted = useRef(false)
  useEffect(() => {
    if (autoStarted.current || !demoRequestedByUrl()) return
    autoStarted.current = true
    void startDemo()
  }, [startDemo])

  const disconnect = useCallback(async () => {
    await teardown()
    setSource(null)
    setName(null)
    setStatus(null)
    setLatest(null)
    setPhase('disconnected')
  }, [teardown])

  const calibrate = useCallback(async (kind: 'rest' | 'max') => {
    const c = clientRef.current
    if (!c) return
    setBusy(kind)
    try {
      setLastCalibration(await c.calibrate(kind))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calibration failed.')
    } finally {
      setBusy(null)
    }
  }, [])

  const identify = useCallback(async () => {
    const c = clientRef.current
    if (!c) return
    setBusy('identify')
    try {
      await c.identify()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The tape did not answer.')
    } finally {
      setBusy(null)
    }
  }, [])

  const resetReps = useCallback(() => {
    trackerRef.current.reset()
    setReps([])
  }, [])

  const current = latest ? trackerRef.current.current(latest.uptimeMs) : null

  return {
    support,
    source,
    name,
    phase,
    status,
    latest,
    buffer,
    reps,
    holdMs: current ? current.holdMs : null,
    busy,
    lastCalibration,
    lastSyncAt,
    error,
    connectTape,
    startDemo,
    disconnect,
    calibrate,
    identify,
    resetReps,
    clearError: () => setError(null),
  }
}

const TapeContext = createContext<TapeSession | null>(null)

/** Mount once at the root so a tape connected on one screen keeps streaming on the others. */
export function TapeProvider({ children }: { readonly children: ReactNode }) {
  const session = useTapeSession()
  return createElement(TapeContext.Provider, { value: session }, children)
}

export function useTape(): TapeSession {
  const session = useContext(TapeContext)
  if (!session) throw new Error('useTape must be used inside TapeProvider')
  return session
}
