'use strict'

const http = require('http')

/**
 * @param {object} params
 */
function configureServer (params) {
  /** @type {import('http').RequestListener} */
  const app = (req, res) => {
    res.end(`${req.method} ${req.url}`)
  }
  const server = http.createServer(app)
  return server
}

exports.configureServer = configureServer
