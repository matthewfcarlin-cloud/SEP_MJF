/**
 * The phone's copy of every minute synced from a real tape. One TapeLog for the whole app,
 * restored from storage on launch and saved (debounced) whenever a sync adds to it. Kept
 * apart from reco.state.v1 because it grows to thousands of rows and changes on its own
 * schedule. The demo tape never writes here.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TapeLog } from '@reco/core'
import type { StoredRecord, TapeLogSnapshot } from '@reco/core'
import { useMemo, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'reco.tape.v1'
const SAVE_DELAY_MS = 1000

export const tapeLog = new TapeLog()

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tapeLog.snapshot())).catch((error: unknown) =>
      console.warn('RECO: could not save tape history.', error),
    )
  }, SAVE_DELAY_MS)
}

async function load(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw) tapeLog.restore(JSON.parse(raw) as TapeLogSnapshot)
  } catch (error) {
    console.warn('RECO: could not load tape history, starting empty.', error)
  }
  tapeLog.onChange(scheduleSave)
}

/** Resolves once saved history is back in memory. Connect a real tape only after this. */
export const tapeLogReady: Promise<void> = load()

const subscribe = (cb: () => void) => tapeLog.onChange(cb)
const version = () => tapeLog.changeCount

/** Every synced minute, re-read whenever the log changes. */
export function useTapeRecords(): readonly StoredRecord[] {
  const v = useSyncExternalStore(subscribe, version, version)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => tapeLog.all(), [v])
}
