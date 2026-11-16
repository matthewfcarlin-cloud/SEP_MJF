// Bundles the server two ways from the same source:
//   dist/server.mjs                       a Node process for any host (`npm start`)
//   .vercel/output/functions/index.func   one Vercel function (Build Output API v3), every route sent to it
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const core = resolve(root, '../../packages/core/src/index.ts')

const shared = {
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  alias: { '@reco/core': core },
  // PGlite is the laptop database; production never loads it. pg-native is an optional C binding.
  external: ['@electric-sql/pglite', 'pg-native'],
  // pg is CommonJS and calls require() for Node built-ins.
  banner: { js: "import { createRequire as __recoCreateRequire } from 'node:module'; const require = __recoCreateRequire(import.meta.url);" },
  logLevel: 'warning',
}

await build({ ...shared, entryPoints: [resolve(root, 'src/server.ts')], outfile: resolve(root, 'dist/server.mjs') })

const fn = resolve(root, '.vercel/output/functions/index.func')
mkdirSync(fn, { recursive: true })
await build({ ...shared, entryPoints: [resolve(root, 'src/vercel.ts')], outfile: resolve(fn, 'index.mjs') })
writeFileSync(resolve(fn, '.vc-config.json'), JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false, maxDuration: 15 }, null, 2))
writeFileSync(resolve(root, '.vercel/output/config.json'), JSON.stringify({ version: 3, routes: [{ src: '/(.*)', dest: '/index' }] }, null, 2))
process.stdout.write('built dist/server.mjs and .vercel/output\n')
