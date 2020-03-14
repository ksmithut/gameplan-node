'use strict'

const http = require('http')

/**
 * @param {object} [options]
 */
function configureServer ({} = {}) {
  /** @type {import('http').RequestListener} */
  const app = (req, res) => {
    res.end('Hello World')
  }
  const server = http.createServer(app)

  return server
}

exports.configureServer = configureServer
