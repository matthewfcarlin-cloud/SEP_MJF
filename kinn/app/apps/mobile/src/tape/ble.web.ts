// Browser side of tape pairing: Web Bluetooth (Chrome and Edge).
import type { DeviceTransport } from '@reco/core'

import { WebBluetoothTransport, bluetoothSupport } from './web-bluetooth'

export type { BluetoothSupport } from './web-bluetooth'
export { bluetoothSupport }

/** Opens the browser's device chooser. Must be called from a user gesture. */
export function requestBleTransport(): Promise<DeviceTransport> {
  return WebBluetoothTransport.request()
}
