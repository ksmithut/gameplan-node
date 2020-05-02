'use strict'

const http = require('http')

/**
 *
 */
function configureServer () {
  /** @type {import('http').RequestListener} */
  const app = (req, res) => {
    res.end(`${req.method} ${req.url}`)
  }
  const server = http.createServer(app)
  return server
}

exports.configureServer = configureServer
