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
  const body = JSON.stringify([{ level, data: args.map((a) => (typeof a === 'string' ? a : safeStringify(a))) }])
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => undefined)
}

const safeStringify = (value: unknown): string => {
  try {
    return value instanceof Error ? `${value.name}: ${value.message}` : JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function installDevLogMirror(): void {
  if (!__DEV__) return
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
