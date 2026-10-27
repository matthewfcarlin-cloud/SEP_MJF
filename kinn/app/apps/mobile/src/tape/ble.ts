// Native side of tape pairing. Phones get native Bluetooth later; until then the tape
// screen offers the simulated tape only. The browser build swaps in ble.web.ts.
import type { DeviceTransport } from '@reco/core'

import { copy } from '@/copy'

export interface BluetoothSupport {
  readonly ok: boolean
  readonly reason?: string
}

export function bluetoothSupport(): BluetoothSupport {
  return { ok: false, reason: copy.tape.nativeSoon }
}

export async function requestBleTransport(): Promise<DeviceTransport> {
  throw new Error(copy.tape.nativeSoon)
}
