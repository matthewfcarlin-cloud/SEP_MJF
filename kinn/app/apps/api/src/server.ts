/** The server as a plain Node process: `npm run dev` on a laptop, `npm start` on any Node host. */
import { serve } from '@hono/node-server'

import { createRuntime } from './runtime'

const { app, config, db } = await createRuntime()
const server = serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
  process.stdout.write(`RECO server on http://localhost:${port} · ${config.env} · ${db.kind}${config.exposeDevCodes ? ' · sign-in codes are returned in the response, not emailed' : ''}\n`)
})

const stop = (): void => {
  server.close(() => {
    void db.close().finally(() => process.exit(0))
  })
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
