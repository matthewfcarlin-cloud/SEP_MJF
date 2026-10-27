/**
 * Tape session for the browser build: connect a real tape over Web Bluetooth or run the
 * simulated tape, then expose phase, status, the live stream (last 10 s) and reps.
 * One session per screen; nothing is persisted (MemorySyncStore) so the demo stays clean.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
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

import { WebBluetoothTransport, bluetoothSupport } from './web-bluetooth'

export interface LiveSample {
  readonly t: number
  /** activation in percent 0–100 */
  readonly v: number
  readonly contracting: boolean
}

export type TapeSource = 'ble' | 'demo'

export interface TapeSession {
  readonly support: ReturnType<typeof bluetoothSupport>
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

export const isConnected = (p: ClientPhase): boolean => p === 'ready' || p === 'syncing' || p === 'session'

export function useTape(): TapeSession {
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
  const [, setFrame] = useState(0)

  // Re-render at ~12 fps while packets arrive, instead of once per 20 Hz packet.
  useEffect(() => {
    const id = setInterval(() => {
      if (!dirty.current) return
      dirty.current = false
      setFrame((f) => f + 1)
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

  const attach = useCallback(
    async (client: DeviceClient, src: TapeSource) => {
      await teardown()
      clientRef.current = client
      bufRef.current = []
      trackerRef.current.reset()
      setReps([])
      setLatest(null)
      setLastCalibration(null)
      setSource(src)
      setName(client.transport.name)
      setError(null)
      client.events.on('phase', setPhase)
      client.events.on('status', setStatus)
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
    let transport: WebBluetoothTransport
    try {
      transport = await WebBluetoothTransport.request()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not open the device chooser.'
      if (!/cancel/i.test(msg)) setError(msg)
      return
    }
    await attach(new DeviceClient(transport, new MemorySyncStore()), 'ble')
  }, [attach, support])

  const startDemo = useCallback(async () => {
    const transport = new SimulatedTransport({ name: DEMO_NAME, calibrated: true, restRaw: 310, maxRaw: 3300 })
    await attach(new DeviceClient(transport, new MemorySyncStore()), 'demo')
  }, [attach])

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
    buffer: bufRef.current,
    reps,
    holdMs: current ? current.holdMs : null,
    busy,
    lastCalibration,
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
