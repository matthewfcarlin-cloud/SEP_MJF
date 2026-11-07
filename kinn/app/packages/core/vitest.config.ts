import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // The mobile copy and store tests import from apps/mobile; stop Vite from reading that app's Expo tsconfig.
  esbuild: { tsconfigRaw: '{"compilerOptions":{"jsx":"react-jsx","target":"ES2022"}}' },
  resolve: { alias: { '@reco/core': resolve(__dirname, 'src/index.ts') } },
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
})
