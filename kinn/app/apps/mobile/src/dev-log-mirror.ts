/**
 * Development only. React Native stopped forwarding console output to the
 * Metro terminal, so mirror warnings and errors to Expo CLI's /logs endpoint
 * where they show up next to the bundler output. No-op in production.
 */
import Constants from 'expo-constants'

type Level = 'warn' | 'error'

const endpoint = (): string | undefined => {
  const host = Constants.expoConfig?.hostUri
  return host ? `http://${host}/logs` : undefined
}

const send = (level: Level, args: readonly unknown[]): void => {
  const url = endpoint()
  if (!url) return
  // Expo CLI's /logs endpoint reads `body`, not `data`; the first entry is the message, the rest are args.
  const body = JSON.stringify([{ level, body: args.map((a) => (typeof a === 'string' ? a : safeStringify(a))), includesStack: false, groupDepth: 0 }])
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => undefined)
}

const safeStringify = (value: unknown): string => {
  try {
    return value instanceof Error ? `${value.name}: ${value.message}` : JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const FLAG = '__kinnDevLogMirrorInstalled'

export function installDevLogMirror(): void {
  if (!__DEV__) return
  // Fast refresh re-runs the root module; never wrap the wrapper.
  const g = globalThis as Record<string, unknown>
  if (g[FLAG]) return
  g[FLAG] = true
  const originalWarn = console.warn.bind(console)
  const originalError = console.error.bind(console)
  console.warn = (...args: unknown[]) => {
    send('warn', args)
    originalWarn(...args)
  }
  console.error = (...args: unknown[]) => {
    send('error', args)
    originalError(...args)
  }
}
