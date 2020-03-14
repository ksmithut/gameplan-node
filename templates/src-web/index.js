'use strict'

const http = require('http')
const { httpListen } = require('./lib/http-listen')
const { timeout } = require('./lib/timeout')
const { getConfig } = require('./config')
const { configureServer } = require('./server')

/**
 * @param {NodeJS.Process} process
 * @returns {Promise<() => Promise<void>>}
 */
async function start (process) {
  const { port } = getConfig(process.env)
  const server = configureServer()
  const closeServer = await httpListen(server, port)
  console.log(`Server listening on port ${port}`)

  return async () => {
    await timeout(closeServer(), 10000)
  }
}

exports.start = start
