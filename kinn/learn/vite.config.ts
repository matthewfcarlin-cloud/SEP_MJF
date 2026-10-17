import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: { include: ['src/**/*.test.ts'] },
} as Parameters<typeof defineConfig>[0]);
