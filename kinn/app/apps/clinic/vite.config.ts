import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// @reco/core ships TypeScript source, so Vite compiles it like the app's own files.
export default defineConfig({
  resolve: { alias: { '@reco/core': resolve(__dirname, '../../packages/core/src/index.ts') } },
  esbuild: { jsx: 'automatic' },
  server: { port: 5174, strictPort: true },
  test: { globals: true, include: ['src/**/*.test.{ts,tsx}'] },
})
