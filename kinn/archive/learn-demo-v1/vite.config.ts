import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The page is served by the Kinn site (kinn/site) at /learn. `npm run build` writes it into the
// site's public folder; `npm run dev` sends /api to a local site server (cd kinn/site && npm start).
export default defineConfig({
  base: '/learn/',
  plugins: [react()],
  build: { outDir: '../site/public/learn', emptyOutDir: true },
  server: { proxy: { '/api': 'http://localhost:3000' } },
  test: { include: ['src/**/*.test.ts'] },
} as Parameters<typeof defineConfig>[0]);
