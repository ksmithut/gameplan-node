'use strict'

const { httpListen } = require('./lib/http-listen')
const { timeout } = require('./lib/timeout')
const { configureServer } = require('./server')

/**
 * @param {import('./config').Config} config
 */
function configureApp (config) {
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

exports.configureApp = configureApp
