'use strict'

const { httpListen } = require('./lib/http-listen')
const { timeout } = require('./lib/timeout')
const { configureServer } = require('./server')

/**
 * @param {import('./config').Config} config
 * @returns {Promise<() => Promise<void>>}
 */
async function start ({ port }) {
  const server = configureServer()
  const closeServer = await httpListen(server, port)
  console.log(`Server listening on port ${port}`)

  return async () => {
    await timeout(closeServer(), 10000)
  }
}

exports.start = start
