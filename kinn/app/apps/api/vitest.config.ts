import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// @reco/core ships TypeScript source, so the tests compile it like the server's own files.
export default defineConfig({
  resolve: { alias: { '@reco/core': resolve(__dirname, '../../packages/core/src/index.ts') } },
  test: { globals: true, include: ['test/**/*.test.ts'], testTimeout: 20000, hookTimeout: 30000 },
})
