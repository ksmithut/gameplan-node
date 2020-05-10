'use strict'

const { promisify } = require('util')

/**
 * @param {import('http').Server} server
 * @param {number} port
 */
async function httpListen (server, port) {
  /** @type {() => Promise<void>} */
  const close = promisify(server.close.bind(server))
  await new Promise((resolve, reject) => {
    server
      .listen(port)
      .on('listening', resolve)
      .on('error', reject)
  })
  return close
}

exports.httpListen = httpListen
