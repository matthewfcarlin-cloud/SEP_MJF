/// <reference types="web-bluetooth" />
/**
 * Web Bluetooth transport for the RECO tape (KineTape BLE protocol v1). Browser only:
 * Chrome and Edge on desktop and Android. Ported from github.com/jackcappo/kinetape.
 * All decoding happens in DeviceClient (core); this file only moves bytes.
 */
import {
  CONTROL_UUID,
  DEVICE_NAME_PREFIX,
  Emitter,
  HISTORY_UUID,
  LIVE_UUID,
  SERVICE_UUID,
  STATUS_UUID,
  sleep,
} from '@reco/core'
import type { DeviceTransport, NotifyChannel, TransportState } from '@reco/core'

export interface BluetoothSupport {
  readonly ok: boolean
  readonly reason?: string
}

const NO_BROWSER = 'Not running in a browser.'
const NOT_SECURE = 'Web Bluetooth needs a secure page: open the app over https:// or http://localhost.'
const NOT_SUPPORTED = 'This browser cannot talk to Bluetooth devices. Use Chrome or Edge on a computer or Android phone. Safari and Firefox do not support it; on iPhone, the Bluefy browser does.'

/** Feature-detect Web Bluetooth with a reason the screen can show when it is missing. */
export function bluetoothSupport(): BluetoothSupport {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return { ok: false, reason: NO_BROWSER }
  if (!window.isSecureContext) return { ok: false, reason: NOT_SECURE }
  if (!('bluetooth' in navigator) || !navigator.bluetooth) return { ok: false, reason: NOT_SUPPORTED }
  return { ok: true }
}

type Events = { status: DataView; history: DataView; live: DataView; state: TransportState }

const RECONNECT_DELAYS_MS = [500, 1000, 2000, 4000, 8000, 15000, 15000, 30000]

/** Copy a DataView so the browser reusing the underlying buffer cannot corrupt it later. */
function copyView(v: DataView): DataView {
  const out = new Uint8Array(v.byteLength)
  out.set(new Uint8Array(v.buffer, v.byteOffset, v.byteLength))
  return new DataView(out.buffer)
}

export class WebBluetoothTransport implements DeviceTransport {
  readonly kind = 'ble' as const
  private emitter = new Emitter<Events>()
  private _state: TransportState = 'disconnected'
  private userDisconnect = false
  private chars: Partial<Record<'live' | 'history' | 'control' | 'status', BluetoothRemoteGATTCharacteristic>> = {}
  /** GATT operations must not overlap in Chrome ("GATT operation already in progress"). */
  private opQueue: Promise<unknown> = Promise.resolve()

  private constructor(private device: BluetoothDevice) {
    device.addEventListener('gattserverdisconnected', this.onGattDisconnected)
  }

  /** Shows the browser's device chooser filtered to RECO tapes. Must run from a user gesture. */
  static async request(): Promise<WebBluetoothTransport> {
    const support = bluetoothSupport()
    if (!support.ok) throw new Error(support.reason)
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }, { namePrefix: DEVICE_NAME_PREFIX }],
      optionalServices: [SERVICE_UUID],
    })
    return new WebBluetoothTransport(device)
  }

  get deviceId(): string {
    return this.device.id
  }
  get name(): string {
    return this.device.name ?? 'RECO tape'
  }
  get state(): TransportState {
    return this._state
  }

  private setState(s: TransportState): void {
    if (this._state === s) return
    this._state = s
    this.emitter.emit('state', s)
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const p = this.opQueue.then(fn, fn)
    this.opQueue = p.catch(() => undefined)
    return p
  }

  async connect(): Promise<void> {
    this.userDisconnect = false
    this.setState('connecting')
    try {
      await this.setup()
      this.setState('connected')
    } catch (err) {
      this.setState('disconnected')
      throw err
    }
  }

  private async setup(): Promise<void> {
    const gatt = this.device.gatt
    if (!gatt) throw new Error('Device has no GATT server')
    const server = await gatt.connect()
    const service = await server.getPrimaryService(SERVICE_UUID)
    const [live, history, control, status] = await Promise.all([
      service.getCharacteristic(LIVE_UUID),
      service.getCharacteristic(HISTORY_UUID),
      service.getCharacteristic(CONTROL_UUID),
      service.getCharacteristic(STATUS_UUID),
    ])
    this.chars = { live, history, control, status }
    const bind = (ch: BluetoothRemoteGATTCharacteristic, channel: NotifyChannel) => {
      ch.removeEventListener('characteristicvaluechanged', this.handlers[channel])
      ch.addEventListener('characteristicvaluechanged', this.handlers[channel])
    }
    bind(status, 'status')
    bind(history, 'history')
    bind(live, 'live')
    // Subscribe one at a time: parallel CCCD writes fail on some stacks.
    await status.startNotifications()
    await history.startNotifications()
    await live.startNotifications()
  }

  private handlers: Record<NotifyChannel, (e: Event) => void> = {
    status: (e) => this.forward('status', e),
    history: (e) => this.forward('history', e),
    live: (e) => this.forward('live', e),
  }

  private forward(channel: NotifyChannel, e: Event): void {
    const v = (e.target as BluetoothRemoteGATTCharacteristic).value
    if (v) this.emitter.emit(channel, copyView(v))
  }

  private onGattDisconnected = (): void => {
    if (this.userDisconnect) {
      this.setState('disconnected')
      return
    }
    void this.reconnectLoop()
  }

  private async reconnectLoop(): Promise<void> {
    this.setState('reconnecting')
    for (const delay of RECONNECT_DELAYS_MS) {
      await sleep(delay)
      if (this.userDisconnect) break
      try {
        await this.setup()
        this.setState('connected')
        return
      } catch {
        // try the next delay
      }
    }
    this.setState('disconnected')
  }

  async disconnect(): Promise<void> {
    this.userDisconnect = true
    try {
      this.device.gatt?.disconnect()
    } finally {
      this.setState('disconnected')
    }
  }

  readStatus(): Promise<DataView> {
    return this.enqueue(async () => {
      const ch = this.chars.status
      if (!ch) throw new Error('Not connected')
      return copyView(await ch.readValue())
    })
  }

  writeControl(bytes: Uint8Array): Promise<void> {
    return this.enqueue(async () => {
      const ch = this.chars.control
      if (!ch) throw new Error('Not connected')
      const buf = new Uint8Array(bytes.byteLength)
      buf.set(bytes)
      await ch.writeValueWithResponse(buf)
    })
  }

  onNotify(channel: NotifyChannel, cb: (value: DataView) => void): () => void {
    return this.emitter.on(channel, cb)
  }

  onStateChange(cb: (state: TransportState) => void): () => void {
    return this.emitter.on('state', cb)
  }
}
