import { httpListen } from './lib/http-listen.js'
import { timeout } from './lib/timeout.js'
import { configureLogger } from './utils/logger.js'
import { configureServer } from './server.js'

/**
 * @param {import('./config').Config} config
 */
export function configureApp (config) {
  const { name, port, logLevel } = config
  const logger = configureLogger({ name, logLevel })

  async function start () {
    const server = configureServer({})
    const closeServer = await httpListen(server, port)
    logger.info(`Server listening on port ${port}`)

    // Graceful shutdown function
    return async () => {
      await timeout(closeServer(), 10000)
    }
  }

  async function migrateUp () {}

  async function migrateDown (all = false) {}

  async function seedRun () {}

  return {
    start,
    migrateUp,
    migrateDown,
    seedRun
  }
}
