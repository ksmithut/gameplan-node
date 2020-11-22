import { httpListen } from './lib/http-listen.js'
import { timeout } from './lib/timeout.js'
import { configureServer } from './server.js'

/**
 * @param {import('./config').Config} config
 */
export function configureApp (config) {
  const { port } = config

  async function start () {
    const server = configureServer({})
    const closeServer = await httpListen(server, port)
    console.log(`Server listening on port ${port}`)

    // Graceful shutdown function
    return async () => {
      await timeout(closeServer(), 10000)
    }
  }

  return {
    start
  }
}
