/** The server as one Vercel function. The runtime is built once per warm instance. */
import type { IncomingMessage, ServerResponse } from 'node:http'

import { getRequestListener } from '@hono/node-server'

import { createRuntime } from './runtime'

let listener: Promise<ReturnType<typeof getRequestListener>> | undefined

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  listener ??= createRuntime().then(({ app }) => getRequestListener(app.fetch))
  try {
    await (await listener)(request, response)
  } catch (error) {
    // A failed start (a missing secret, an unreachable database) must not be cached for the instance's life.
    listener = undefined
    process.stderr.write(`${JSON.stringify({ level: 'error', message: 'server could not start', reason: error instanceof Error ? error.message : 'unknown' })}\n`)
    response.statusCode = 503
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({ success: false, code: 'unavailable', error: 'RECO’s server is starting up or not set up. Try again in a minute.' }))
  }
}
