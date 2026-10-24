import { defineConfig } from 'vitest/config'

export default defineConfig({
  // The mobile copy test imports from apps/mobile; stop Vite from reading that app's Expo tsconfig.
  esbuild: { tsconfigRaw: '{"compilerOptions":{"jsx":"react-jsx","target":"ES2022"}}' },
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
