'use strict'

const { httpListen } = require('./lib/http-listen')
const { timeout } = require('./lib/timeout')
const { once } = require('./lib/once')
const { configureServer } = require('./server')

/**
 * @param {import('./config').Config} config
 */
async function start ({ port }) {
  const server = configureServer()
  const closeServer = await httpListen(server, port)
  console.log(`Server listening on port ${port}`)

  // Graceful shutdown function
  return once(async () => {
    await timeout(closeServer(), 10000)
  })
}

exports.start = start
