'use strict'

const { promisify } = require('util')

/**
 * @param {import('http').Server} server
 * @param {number} port
 */
async function httpListen (server, port) {
  const closeServer = promisify(server.close.bind(server))
  await new Promise((resolve, reject) => {
    server
      .listen(port)
      .on('listening', resolve)
      .on('error', reject)
  })
  return closeServer
}

exports.httpListen = httpListen
